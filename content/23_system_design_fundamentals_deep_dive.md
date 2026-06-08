# Chapter 23 — System Design — Part 1: Foundations & Protocols

> "All architecture is design, but not all design is architecture. Architecture represents the significant design decisions that shape a system, where 'significant' is measured by cost of change." — Grady Booch

**What this chapter covers:**
The first of three System Design chapters. This part lays the foundations and the network/edge stack: how to think about scalability and availability, the protocol stack (HTTP/TCP/UDP/DNS/TLS/gRPC/WebSockets/GraphQL), load balancing and traffic management, caching, and CDN. The data‑plane and operations chapters that follow (Ch 24, Ch 25) build directly on these primitives.

**How to read it:**
Each topic follows the same shape — *Simple Explanation → Official Definition → How it works (with ASCII diagrams) → Variants → Trade‑offs → Interview takeaway.* You can read it cover‑to‑cover (~3 hours) or jump to a specific building block.

This is **Part 1** of the three‑chapter series:
- **Chapter 23** (this chapter) — Foundations & Protocols
- **Chapter 24** — Data & Distributed Systems (databases, scaling, CAP/consensus, messaging, storage, data processing)
- **Chapter 25** — Operations & Case Studies (reliability, security, observability, deployment, multi‑region, FinOps, anti‑patterns, Instagram walk‑through)

The §X.Y numbering is continuous across the three chapters, so a reference like "§9.9" is in Ch 24 and "§17.7" is in Ch 25. Cross‑chapter pointers are prefixed (e.g. "Ch 24, §9.9").

---

## Table of Contents

| Part | Section | Building Blocks |
|------|---------|-----------------|
| 1 | The Big Picture | Why systems are designed the way they are; the four jobs |
| 2 | Core Concepts | Scalability, availability, latency vs. throughput, SLAs |
| 3 | Networking & Communication | HTTP/TCP/UDP, DNS, TLS, WebSockets, REST vs gRPC vs GraphQL |
| 4 | Load Balancing & Traffic Management | L4 vs L7, algorithms, rate limiting, circuit breakers |
| 5 | Caching | Strategies, eviction (LRU/LFU/FIFO), distributed caches |
| 6 | CDN | Edge networks, push vs pull, invalidation, Anycast |


# PART 1: THE BIG PICTURE

## 1.1 Why these concepts exist

> **Simple Explanation:** A system design building block is a *reusable answer to a recurring problem*. "Too many users hitting one server" → load balancer. "Reading the same data over and over" → cache. "Database is too big for one machine" → sharding. Once you know the problem each block solves, the names become obvious.

> **Official Definition:** System design fundamentals are the architectural primitives and patterns that allow distributed systems to satisfy non-functional requirements — scalability, availability, performance, durability, security, observability — beyond what a single server can offer.

```
   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
   │  INGEST  │───▶│   STORE  │───▶│  PROCESS │───▶│   SERVE  │
   │ get data │    │ keep it  │    │ transform│    │ respond  │
   │   in     │    │ durably  │    │ / enrich │    │   fast   │
   └──────────┘    └──────────┘    └──────────┘    └──────────┘
       │                │                │                │
       ▼                ▼                ▼                ▼
   Kafka,           Postgres,        Spark,          Redis,
   webhooks,        S3,              Flink,          CDN,
   HTTP APIs        Cassandra        Airflow         Load balancer
```

Every building block in this chapter exists to solve **one of four jobs**: ingest data reliably, store it durably, process it correctly, or serve it fast.

## 1.2 The three forces that shape every system

```
            COST
              ▲
              │
              │
              │           "Pick two — pay for the third"
              │
   PERFORMANCE◀──────────▶ RELIABILITY
   (latency,            (availability,
    throughput)         durability)
```

Every architectural decision is a trade between these three. A junior engineer optimizes one; a senior engineer **names which one they are sacrificing and why**.

---

# PART 2: CORE CONCEPTS

## 2.1 Scalability

> **Simple Explanation:** Scalability is the ability of a system to handle *more* — more users, more requests, more data — without falling over or rewriting from scratch.

There are two flavours:

```
   VERTICAL SCALING (scale UP)           HORIZONTAL SCALING (scale OUT)
   ────────────────────────────          ────────────────────────────
       ┌──────────┐                       ┌──┐ ┌──┐ ┌──┐ ┌──┐
       │  Bigger  │                       │S1│ │S2│ │S3│ │S4│
       │  server  │                       └──┘ └──┘ └──┘ └──┘
       │ (more    │                          add more boxes
       │  CPU/RAM)│
       └──────────┘
   Simple, but hits a hardware             Complex (need LB, sharding,
   ceiling. Single point of failure.       distributed state). Near-infinite
                                           ceiling. Resilient.
```

| Property | Vertical | Horizontal |
|---|---|---|
| Complexity | Low | High |
| Cost ceiling | Hardware-limited | ~ unlimited |
| Downtime to scale | Often needed | Zero |
| Failure model | One big SPOF | Designed to lose nodes |

**Modern default:** scale horizontally for the web tier, scale vertically for the database (until you can't, then shard).

## 2.2 Availability, Reliability, Durability

| Term | Plain English | Measured by |
|------|---------------|-------------|
| **Availability** | Is the system *up right now?* | % uptime ("five 9s" = 99.999%) |
| **Reliability** | Does it produce correct results consistently? | MTBF (mean time between failures) |
| **Durability** | Once written, does data survive? | "11 nines" on S3 = 99.999999999% |

### The nines table — burn this into memory

```
   Availability     Downtime per year
   ────────────     ─────────────────
   99%      (2 9s)   ≈ 3.65 days
   99.9%    (3 9s)   ≈ 8.76 hours
   99.99%   (4 9s)   ≈ 52.6 minutes
   99.999%  (5 9s)   ≈ 5.26 minutes
   99.9999% (6 9s)   ≈ 31.5 seconds
```

Adding a "9" gets exponentially harder and more expensive. In interviews, justify the level you pick — "we'll target 99.9% which gives us ~8.76h/year, acceptable for an internal tool."

## 2.3 Latency vs. Throughput

> **Simple Explanation:** *Latency* = how long **one** request takes. *Throughput* = how many requests you handle **per second**. A wider freeway has higher throughput; a faster car has lower latency. They are independent.

```
   LOW LATENCY                        HIGH THROUGHPUT
   ──────────                         ───────────────
   1 user gets response in 5ms        1 million users served per second
   (good for trading, chat)           (good for analytics ingestion)

   You can have one without the other:
     • A batch ETL job is high throughput, terrible latency
     • A trading API is low latency, modest throughput
```

### Latency percentiles — why averages lie

```
                     p50 (median)
                       │
   ┌────────┬─────────┴────────────┬────────────────┐
   │ fast   │   typical            │  slow tail     │
   └────────┴──────────────────────┴────────────────┘
                                   ▲              ▲
                                   p95            p99 ◀── ALWAYS optimize this
```

If your p50 is 50 ms but p99 is 2 s, **1 in 100 users has a 2-second wait**. At Google scale (billions/day) that's millions of bad experiences. Always quote p50/p95/p99/p999 — never just "average."

## 2.4 Non-Functional Requirements (NFRs)

When designing in an interview, before drawing boxes, ask:

1. **Scale** — How many users? RPS (reads/sec, writes/sec)? Data volume?
2. **Availability** — How many 9s?
3. **Latency** — What's the p99 target?
4. **Consistency** — Strong, eventual, or somewhere in between?
5. **Durability** — Can we lose any data? (almost always: no)
6. **Cost** — Are we cost-bound or performance-bound?
7. **Geography** — Single region or global?
8. **Compliance** — GDPR? HIPAA? PCI?

These are the **dials** every later decision will turn.

## 2.5 Little's Law — the one equation that explains queues

> **Simple Explanation:** In any system at steady state, the average number of items in the system equals the rate at which they arrive multiplied by the average time each one spends inside.

```
   L = λ × W

   L = average number of items "in flight"
   λ = arrival rate (items/sec)
   W = average time spent in system (sec)
```

Why every engineer cares:

- **Sizing thread / connection pools** — if requests arrive at 1,000 rps and each takes 50 ms, you have 50 concurrent in-flight. Need at least 50 workers (plus headroom).
- **Reading capacity charts** — if queue depth keeps growing, λ > processing rate → catastrophe coming.
- **Capacity planning** — given a target latency and arrival rate, you can derive required concurrency *before* shipping.

```java
// Connection pool sizing — Little's Law in disguise:
//   pool size = QPS × avg_query_time_seconds × safety_factor
//   500 QPS × 0.020s × 1.5 = 15 connections per app instance
```

## 2.6 Amdahl's Law and the Universal Scalability Law

> **Amdahl:** Speedup from N processors is bounded by the serial fraction `s` of the work:
> **Speedup ≤ 1 / (s + (1−s)/N)**

If 10 % of your work is inherently serial, you cap at **10×** speedup no matter how many cores you add. That serial bit becomes the wall.

> **Universal Scalability Law (Gunther):** adds a *coherency* cost (cross-node coordination) on top of Amdahl. Real systems often *slow down* past some N — adding more nodes makes things worse because the coordination overhead grows quadratically.

**Practical lesson:** find and shrink the serial choke point *before* adding boxes. The choke point is usually a shared database, a global lock, or a single auth service.

## 2.7 Tail-latency amplification — why p99 dominates user-facing latency

If a request fans out to N backends in parallel and you wait for *all* of them, the user's latency is the **max** of N draws — dominated by the slow tail.

```
   1 backend, p99 = 100 ms       → user p99 ≈ 100 ms
   10 backends in parallel       → user p99 ≈ p999 of one backend
   100 backends in parallel      → user p99 ≈ p9999 of one backend
```

A 1-in-100 slow backend becomes a 1-in-1 slow user experience at fan-out 100. This is why Google obsesses over tail latency and uses **hedged requests** (Ch 25, §13.7).

## 2.8 The CAP/PACELC mental shortcut for any product

Before designing, place the product on this map:

```
   Money / inventory / orders        → C-leaning. Refuse rather than be wrong.
   Social feeds / likes / counters    → A-leaning. Eventual consistency is fine.
   Chat                              → A-leaning, but with per-conversation order.
   Search index                      → A-leaning, with bounded staleness.
   Configuration / locks             → C-leaning. Use etcd/ZK style.
```

Naming this trade-off in the first 60 seconds of a design discussion immediately signals seniority.

---

# PART 3: NETWORKING & COMMUNICATION

> **The goal of this part:** give you enough networking intuition to (a) reason about end-to-end latency, (b) pick the right protocol for the job, and (c) recognise the classic failure modes that turn a healthy system into a brownout. Every later part (load balancing, caching, CDN, observability) sits on top of these ideas.

## 3.1 The protocol stack — OSI, TCP/IP, and what your packet actually looks like

Networking is taught two ways:

- The **OSI 7-layer model** — academic, useful for vocabulary.
- The **TCP/IP 4-layer model** — what actually ships in your kernel.

```
   OSI                          TCP/IP                Example
   ────────────────────────────────────────────────────────────────
   7. Application                                     HTTP, gRPC, DNS
   6. Presentation              Application           TLS, MIME, JSON
   5. Session                                         (cookies, sessions)
   4. Transport                 Transport             TCP, UDP, QUIC
   3. Network                   Internet              IP (v4 / v6), ICMP
   2. Data Link                 Link                  Ethernet, Wi-Fi
   1. Physical                                        copper, fibre, radio
```

You'll hear engineers say "**L4 load balancer**" (transport-layer, sees IP + port) or "**L7 load balancer**" (application-layer, sees URL and headers). That vocabulary comes from this stack.

### Encapsulation — what's actually on the wire

Every layer wraps the layer above it with its own header. By the time your `GET /` reaches the wire, it looks like:

```
   ┌──────────┬──────────┬──────────┬─────────────────┬──────┐
   │ Ethernet │   IP     │   TCP    │   HTTP request  │ FCS  │
   │ header   │ header   │ header   │  GET / HTTP/1.1 │      │
   │ (14 B)   │ (20 B)   │ (20+ B)  │      ...        │ (4 B)│
   └──────────┴──────────┴──────────┴─────────────────┴──────┘
   │◀────────────  one Ethernet frame  ────────────────▶│
```

Each receiving layer peels off its header and hands the rest up. **The user's bytes are the smallest part of the packet.**

### MTU, MSS, and fragmentation

- **MTU** (Maximum Transmission Unit) — biggest frame the link can carry. Ethernet default: **1500 bytes**.
- **MSS** (Maximum Segment Size) — biggest TCP payload that fits inside one IP packet that fits inside one MTU: typically `1500 − 20 (IP) − 20 (TCP) = 1460 bytes`.
- Packets bigger than MTU get **fragmented** by IP — every hop must re-assemble. Modern stacks use **Path MTU Discovery** (PMTUD) to learn the smallest MTU on the path and avoid fragmentation.

> **Why you care:** a misconfigured tunnel/VPN with a smaller MTU silently drops "DF" (don't-fragment) packets. Symptom: SSH works, large file downloads stall. Remember MTU when debugging "weird" connection issues.

### Sockets — the API your code actually uses

A **socket** is identified by the 5-tuple `(protocol, src IP, src port, dst IP, dst port)`. Two sockets cannot share the same 5-tuple. This is why a single client behind NAT can only open **~64K outbound connections to one (dst IP, dst port)** — once the ephemeral port range is exhausted, `EADDRNOTAVAIL`.

### TCP vs UDP — the headline comparison

| Property | TCP | UDP |
|----------|-----|-----|
| Header size | 20+ bytes | 8 bytes |
| Connection | 3-way handshake | None |
| Reliability | Acknowledged, retransmitted | Fire & forget |
| Ordering | Guaranteed | None |
| Flow control | Sliding window | None |
| Congestion control | Yes (Reno / Cubic / BBR) | App-level if you want it |
| Multicast | No | Yes |
| Use case | HTTP, SSH, databases | DNS, video calls, gaming, QUIC, telemetry |

**Rule of thumb:** if losing a packet would ruin meaning, use TCP. If losing a packet just means a missed frame (video, telemetry), UDP wins on latency.

## 3.2 TCP deep dive — handshakes, windows, and congestion control

### The 3-way handshake — opening a connection

```
   Client                                    Server
     │                                          │
     │ ── SYN (seq=x) ─────────────────────────▶│
     │                                          │
     │ ◀───────────── SYN-ACK (seq=y, ack=x+1) ─│
     │                                          │
     │ ── ACK (ack=y+1) ───────────────────────▶│
     │                                          │
     │            connection ESTABLISHED        │
```

That's **1 round-trip** before you can send any data. Over a 150 ms WAN link, that's a 150 ms cost on every new connection — which is why connection pooling and keep-alive matter so much.

### The 4-way teardown — and why TIME_WAIT exists

```
   Active closer                           Passive closer
     │ ── FIN ───────────────────────────────▶│
     │ ◀── ACK ──────────────────────────────│
     │                                        │
     │ ◀── FIN ──────────────────────────────│
     │ ── ACK ──────────────────────────────▶│
     │                                        │
     │  TIME_WAIT (2 × MSL ≈ 60 s)            │
     │  socket can't be reused yet            │
```

After closing, the active closer keeps the 5-tuple "reserved" for **2 × Maximum Segment Lifetime** (≈ 60 s) to absorb any straggler packets. On a high-throughput client this exhausts ephemeral ports — symptom: "Cannot assign requested address." Mitigations: connection pooling, `SO_REUSEADDR`, server-initiated close instead of client-initiated.

### Sequence numbers, sliding window, and flow control

Every byte gets a sequence number. The receiver advertises a **window** — how many unacknowledged bytes it can buffer. Sender stops when window is full. That's **flow control**: protecting the receiver from drowning.

### Congestion control — protecting the network

Flow control protects the receiver. **Congestion control** protects the network from collapse when many flows share a link.

```
   cwnd
    │              ╱╲              ╱╲
    │            ╱   ╲           ╱
    │   slow   ╱     ╲ AIMD    ╱
    │   start ╱       ╲       ╱  ← packet loss = halve cwnd
    │       ╱          ╲     ╱
    │     ╱             ╲___╱
    └──────────────────────────────▶ time
```

- **Slow start** — start with a tiny cwnd (~10 MSS), double per RTT. Aggressive ramp.
- **Congestion avoidance** — once at threshold, grow by 1 MSS per RTT (additive increase).
- **Packet loss** — halve cwnd (multiplicative decrease). This is **AIMD** (Additive Increase, Multiplicative Decrease).
- **Modern algorithms** — Cubic (Linux default, fairer growth at high BDP) and **BBR** (Google, models bottleneck bandwidth + RTT instead of reacting to loss; massively better on lossy wireless).

> **Why you care:** every new TCP connection starts in slow start. A burst of 100 short-lived connections each sending 50 KB pays the slow-start tax 100 times. One persistent pooled connection sending 5 MB does not. This alone justifies HTTP keep-alive and gRPC.

### Other TCP gotchas you'll meet in production

- **Nagle's algorithm** — coalesces small writes to avoid the "tinygram" problem. Combined with **delayed ACK** it can add up to 200 ms latency on chatty request/response. Fix: `TCP_NODELAY` for interactive protocols.
- **SACK** (Selective ACK) — receiver can ACK non-contiguous ranges, so one lost packet doesn't force retransmission of everything that followed.
- **TCP keep-alive** — kernel sends a probe every 2 hours by default to detect dead peers. **Way too long** for service-to-service; tune to seconds.
- **Head-of-line (HOL) blocking** — TCP delivers in order, so one lost packet stalls everything behind it. This is why HTTP/3 moved to QUIC over UDP.

## 3.3 UDP deep dive — when stateless wins

UDP is "IP + ports + a checksum." That's it. **8-byte header**, no connection, no retransmit, no ordering, no congestion control.

```
   ┌──────────────┬──────────────┬──────────┬──────────┐
   │ src port (2) │ dst port (2) │ len (2)  │ csum (2) │
   └──────────────┴──────────────┴──────────┴──────────┘
   │                       payload                      │
```

**When UDP wins:**

- **DNS** — single request/response, retransmit is cheap, handshake would double latency.
- **Video / voice** — late packets are useless; better to skip and play the next frame.
- **Gaming** — same reason: stale position updates are worthless.
- **QUIC / HTTP/3** — uses UDP as a thin transport and builds reliability + congestion control in user space.
- **Telemetry** (statsd, syslog) — occasional loss is acceptable; servers can't afford TCP connections from millions of agents.
- **Multicast / broadcast** — TCP can't do these (unicast only); UDP can.

**Cost:** if you need reliability or ordering, you build it yourself in the app layer (QUIC, DTLS, RTP/RTCP, custom protocols). That's a lot of complexity to get right.

## 3.4 HTTP/1.0, HTTP/1.1, HTTP/2, HTTP/3 — what changed and why

```
   HTTP/0.9 (1991)  one-line GET, no headers, no status codes — historical
   HTTP/1.0 (1996)  headers, status codes, but one request per TCP conn
   HTTP/1.1 (1997)  persistent connections (keep-alive), pipelining, Host:
   HTTP/2   (2015)  binary framing, multiplexed streams, HPACK compression
   HTTP/3   (2022)  HTTP/2 semantics over QUIC (UDP) — no HOL, faster handshake
```

### HTTP/1.1 — the 25-year workhorse

- **Persistent connections (keep-alive)** — many sequential requests on one TCP conn.
- **Pipelining** — send multiple requests without waiting for responses. *In practice, browsers disabled it* because intermediaries broke it and HOL blocking still applied.
- **`Host:` header** — required; enabled virtual hosting (many sites per IP).
- **Chunked transfer encoding** — server streams body without knowing total length up front.
- **Limitation:** one in-flight request per connection. Browsers compensate by opening **~6 parallel connections per origin**, which is why "domain sharding" was a thing.

### HTTP/2 — binary, multiplexed, compressed

- **Binary framing layer** — frames of types DATA, HEADERS, SETTINGS, RST_STREAM, PING, GOAWAY, …
- **Streams** — concurrent virtual channels over one TCP connection. Each stream has an ID and a priority.
- **HPACK header compression** — index of repeated headers (cookies, user-agent) shrinks per-request bytes 10–20×.
- **Server push** — server sends resources the client hasn't asked for yet. *Deprecated in 2022* (caches couldn't tell what the client already had).
- **Single TCP connection** — fixes the 6-conn-per-origin hack.
- **Limitation:** one lost TCP packet stalls **every** stream because TCP delivers in order. That's TCP-layer HOL blocking, which HTTP/3 fixes.

### HTTP/3 — HTTP semantics over QUIC

- **QUIC** = TLS 1.3 + reliable streams, all running over UDP, all in user space.
- **Independent streams** — packet loss on stream A doesn't block stream B (no TCP-layer HOL).
- **0-RTT resumption** — repeat client can send data with the first packet.
- **Connection migration** — same connection survives a network change (Wi-Fi → 5G) because the connection ID isn't the 5-tuple.
- **Wide adoption** — YouTube, Facebook, Cloudflare, AWS CloudFront default to HTTP/3 where available.

Cheat sheet: HTTP/3 ≈ "HTTP/2 features minus TCP's pain."

## 3.5 HTTP request/response anatomy

```
   REQUEST                                  RESPONSE
   ────────────────────────────────         ─────────────────────────────
   GET /api/users/42 HTTP/1.1               HTTP/1.1 200 OK
   Host: api.example.com                    Content-Type: application/json
   Accept: application/json                 Cache-Control: max-age=60
   Authorization: Bearer eyJhbGc…           ETag: "v17"
   User-Agent: curl/8.4                     Content-Length: 38

                                            {"id":42,"name":"Ada"}
```

### HTTP methods — semantics matter

| Method | Safe? | Idempotent? | Cacheable? | Typical use |
|--------|-------|-------------|------------|-------------|
| GET | yes | yes | yes | read |
| HEAD | yes | yes | yes | metadata only (no body) |
| OPTIONS | yes | yes | no | CORS preflight, capability discovery |
| POST | no | no | rarely | create / non-idempotent action |
| PUT | no | yes | no | full replace |
| PATCH | no | no (usually) | no | partial update |
| DELETE | no | yes | no | remove |

- **Safe** — should not change server state.
- **Idempotent** — N identical calls have the same effect as one.
- **Cacheable** — response can be stored and reused.

### Useful headers you'll meet daily

- **`Authorization`** — bearer tokens, Basic auth, etc.
- **`Accept` / `Content-Type`** — content negotiation (JSON vs Protobuf vs MsgPack).
- **`Accept-Encoding` / `Content-Encoding`** — compression negotiation (gzip, br, zstd).
- **`Range` / `Content-Range`** — partial downloads for video seek, resumable uploads.
- **`X-Forwarded-For` / `Forwarded`** — original client IP when behind a proxy/LB.
- **`X-Request-Id` / `traceparent`** — correlation across services.

## 3.6 HTTP caching — `Cache-Control`, `ETag`, and friends

Two questions: **(1) Can I reuse the cached copy without asking?** (freshness) **(2) If not, can I cheaply confirm it's still good?** (validation).

### Freshness — `Cache-Control`

```
   Cache-Control: public, max-age=3600, stale-while-revalidate=60
```

- `public` / `private` — share across users vs per-user.
- `max-age=N` — fresh for N seconds.
- `s-maxage=N` — same but only for shared caches (CDNs).
- `no-cache` — must revalidate every time (you can still store).
- `no-store` — don't store at all (sensitive data).
- `immutable` — never check again (perfect for content-addressed `app.abc123.js`).
- `stale-while-revalidate=N` — serve stale up to N seconds while refetching in background.
- `stale-if-error=N` — serve stale on origin error.

### Validation — `ETag` and `Last-Modified`

When the cached copy goes stale, the client revalidates instead of re-downloading:

```
   GET /avatar.png
   If-None-Match: "v17"
   ────────────────────▶
                              ◀─── 304 Not Modified   (no body, ~150 bytes)
```

- **`ETag`** — opaque version identifier (often a content hash). Strong (`"abc"`) vs weak (`W/"abc"`).
- **`Last-Modified` + `If-Modified-Since`** — date-based; coarser than ETag.

### `Vary` — caches are per-representation

```
   Vary: Accept-Encoding, Accept-Language
```

Tells caches "store a separate copy per value of these headers" — otherwise you'll serve a Korean visitor the cached English copy. Be sparing: each value multiplies cache fragments.

## 3.7 Cookies, sessions, and CORS

### Cookie attributes you must set in 2026

```
   Set-Cookie: sid=abc123;
               HttpOnly;        ← JS can't read it (XSS protection)
               Secure;          ← only over HTTPS
               SameSite=Lax;    ← block most CSRF; None requires Secure
               Path=/;
               Max-Age=3600;
               Domain=example.com
```

- **`SameSite=Strict`** — never sent on cross-site requests. Logs you out when you click an inbound link.
- **`SameSite=Lax`** — sent on top-level GET navigations. Sensible default.
- **`SameSite=None`** — sent always. **Must** also set `Secure` (Chrome enforces).

### CORS — Cross-Origin Resource Sharing

Browsers enforce the **same-origin policy** (scheme + host + port). Any cross-origin `fetch` from JS is blocked unless the server opts in via CORS headers.

```
   1. Browser sends preflight (for non-simple requests)
        OPTIONS /api
        Origin: https://app.example.com
        Access-Control-Request-Method: PUT
        Access-Control-Request-Headers: Authorization

   2. Server replies
        Access-Control-Allow-Origin: https://app.example.com
        Access-Control-Allow-Methods: GET, PUT
        Access-Control-Allow-Headers: Authorization
        Access-Control-Allow-Credentials: true
        Access-Control-Max-Age: 600       ← cache preflight result

   3. Browser sends the real request
```

Common mistakes:

- `Access-Control-Allow-Origin: *` with `Allow-Credentials: true` — **invalid combination**, browsers reject.
- Echoing the `Origin` header without a whitelist — opens you to *any* origin.
- Forgetting to handle `OPTIONS` in your routing — preflight 404s.

> **Reminder:** CORS protects the **browser user**, not your server. A curl/server-to-server call ignores CORS entirely. Don't use it as auth.

## 3.8 Content compression — gzip, brotli, zstd

```
   Accept-Encoding: br, gzip, zstd
   ───────────────────────────────▶
                                       ◀─── Content-Encoding: br
```

| Algorithm | Ratio (vs gzip) | CPU cost | Notes |
|-----------|-----------------|----------|-------|
| **gzip** | baseline | low | universally supported, default for HTTP/1.x |
| **brotli** | 15–25 % smaller | slightly higher | static assets shine; precompute at build time |
| **zstd** | gzip-class size, ~3× faster decode | low | great for APIs, Kafka payloads, logs |

**Compress text** (HTML, JSON, JS, CSS, SVG; Protobuf is already binary and only marginally helped). **Don't compress** images, video, audio, or anything already compressed — you waste CPU for ~0 % gain.

**Security note:** compressing responses that mix attacker-controlled and secret content over TLS enables **CRIME / BREACH** attacks. Mitigation: don't reflect user input alongside secrets, or disable compression on those endpoints.

## 3.9 DNS — the phone book of the internet

> **Simple Explanation:** You typed `google.com`; DNS turned it into `142.250.190.78`. Without DNS, you'd memorise IPs.

### The hierarchy

```
                                  .  (root, 13 server clusters)
                                ╱   ╲
                             com     org   ← TLD (Top-Level Domain)
                              │
                          example.com      ← Authoritative name servers
                            ╱      ╲
                       www         api     ← A / AAAA records
```

### Recursive resolution (what your laptop actually does)

```
   Your laptop          Recursive resolver     Root → TLD → Authoritative
       │                       │
       │ google.com? ────────▶ │ ── . where's com? ─────▶  root
       │                       │ ◀─ go ask com
       │                       │ ── google.com? ───────▶  com TLD
       │                       │ ◀─ ask ns.google.com
       │                       │ ── google.com? ───────▶  authoritative
       │                       │ ◀─ 142.250.x.x
       │ ◀─ 142.250.x.x ───────│
       │  cache for TTL s      │  cache for TTL s
```

Your laptop only does the first hop (recursive query). The resolver does all the iterative work.

### Record types you'll actually meet

| Type | Maps name to | Example |
|------|--------------|---------|
| **A** | IPv4 address | `142.250.190.78` |
| **AAAA** | IPv6 address | `2607:f8b0::200e` |
| **CNAME** | Another name (alias) | `www → example.com` |
| **MX** | Mail server | `10 mail.example.com` |
| **TXT** | Free text (SPF, DKIM, domain ownership) | `v=spf1 include:_spf.google.com -all` |
| **NS** | Authoritative name server | `ns1.example.com` |
| **SOA** | Zone metadata (serial, refresh) | one per zone |
| **SRV** | Service location + port | `_sip._tcp.example.com 10 5 5060 sip.example.com` |
| **PTR** | Reverse (IP → name) | `78.190.250.142.in-addr.arpa → mail.google.com` |
| **CAA** | Which CAs may issue certs for this domain | `0 issue "letsencrypt.org"` |
| **ALIAS / ANAME** | CNAME-like at the apex (provider-specific) | `example.com → CDN hostname` |

### Caching layers (latency hides here)

```
   Browser cache   →   OS resolver cache   →   ISP/resolver cache   →   Authoritative
   (seconds)            (seconds–minutes)        (TTL)                   (truth)
```

A "DNS propagation delay" is just **caches honouring TTLs they already pulled** — you can't force the world to forget.

### TTL strategy

- **Low TTL (30–60 s)** — fast failover, painful resolver load. Use for things that move (load balancers, blue/green).
- **High TTL (1 h–1 day)** — efficient, slow to change. Use for stable infrastructure (root domain pointing to your CDN).
- **Pre-lower the TTL** before a planned migration, so the world is ready to forget.

### Modern DNS — privacy and integrity

- **DoH** (DNS over HTTPS, RFC 8484) and **DoT** (DNS over TLS, RFC 7858) encrypt the query so your ISP can't see/sell it.
- **DNSSEC** signs records so resolvers can verify they weren't tampered with (defends against cache poisoning). Doesn't encrypt — just authenticates.
- **EDNS Client Subnet (ECS)** — resolver passes a portion of the client's subnet to authoritative servers so CDN GeoDNS can pick a nearby POP.
- **Split-horizon DNS** — same name resolves differently inside vs outside your network (internal services vs public site).
- **Anycast** — one IP advertised from many locations; routers steer you to the nearest. The 13 root server clusters use this; CDNs do too.

## 3.10 The TLS handshake — and why HTTP/3 wins on the wire

### TLS 1.2 vs 1.3 round-trips

```
   TLS 1.2 (2 RTT before first app data):
     1. ClientHello                       ──▶
                                          ◀── ServerHello + cert
     2. KeyExchange + Finished            ──▶
                                          ◀── Finished
     3. HTTP request                      ──▶

   TLS 1.3 (1 RTT; 0-RTT on resumption):
     1. ClientHello + key share           ──▶
                                          ◀── ServerHello + cert + Finished
     2. HTTP request                      ──▶

   QUIC (HTTP/3): TLS baked into transport, 1-RTT cold, 0-RTT resumed
```

For a user 150 ms RTT away, dropping one round-trip is a 150 ms latency win on every fresh connection. Multiply by billions of users — meaningful cost savings, perceptibly snappier apps.

### A cipher suite, dissected

```
   TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
       │       │        │              │
       │       │        │              └─ MAC / PRF: SHA-384
       │       │        └──────────────── bulk cipher: AES-256-GCM (AEAD)
       │       └───────────────────────── auth: RSA (cert signature)
       └───────────────────────────────── key exchange: ECDHE (forward-secret)
```

**Forward secrecy** (ECDHE) means: even if the server's private key leaks tomorrow, today's recorded traffic stays encrypted. TLS 1.3 mandates it.

### Certificate chain validation

```
   Root CA   (in OS / browser trust store)
       │ signs
   Intermediate CA
       │ signs
   Your server cert   (presented in handshake)
```

The server sends leaf + intermediates. The client walks up to a trusted root and checks: signature valid, not expired, hostname matches (SAN), not revoked.

### SNI, ALPN, OCSP — three acronyms you'll see

- **SNI** (Server Name Indication) — client sends the hostname *in the ClientHello* so a server with many sites on one IP can pick the right cert. **Without SNI you'd need one IP per cert.**
- **ALPN** (Application-Layer Protocol Negotiation) — client lists `["h2", "http/1.1"]`, server picks. This is how HTTP/2 gets negotiated transparently.
- **OCSP stapling** — server periodically fetches a CA-signed "still valid" assertion and *staples* it to the handshake, so the client doesn't have to make a separate revocation check (which would leak browsing to the CA).

### Session resumption — the cost of "first hello" amortised

- **Session ID** (TLS 1.2) — server keeps state, client sends ID to skip negotiation.
- **Session ticket** (TLS 1.2/1.3) — server encrypts state, hands it to client; stateless servers can resume.

> **mTLS** (mutual TLS) — both sides present certs. Foundation of service-mesh auth (Istio, Linkerd) and zero-trust networking. Deep dive in Ch 25, §14.10.

## 3.11 Connection management — pooling, keep-alive, HOL blocking, TFO

```
   ┌────────────────────────────────────────────────────────────────┐
   │ HTTP/1.1 + keep-alive: one TCP conn = many sequential requests │
   │   pro: skip TCP+TLS handshake on each request                  │
   │   con: head-of-line blocking — a slow response stalls all next │
   │                                                                │
   │ HTTP/2: one TCP conn, many concurrent streams                  │
   │   pro: no HOL blocking at app layer                            │
   │   con: HOL blocking at TCP layer (one lost packet stalls all)  │
   │                                                                │
   │ HTTP/3 (QUIC): each stream independent on UDP                  │
   │   pro: no HOL blocking anywhere                                │
   └────────────────────────────────────────────────────────────────┘
```

### TCP Fast Open (TFO)

Modern Linux + supported clients can send application data **inside the SYN** of a resumed connection (via a server-issued cookie), shaving another RTT off the cold-cache case.

### Sizing a connection pool

A back-of-envelope formula from Little's Law (§2.5):

```
   pool_size  ≈  expected RPS × average request seconds
```

If your backend handles **200 RPS** with **50 ms** average latency, you need **~10** concurrent connections. Add headroom for variance (×2). Way more than that just **moves contention** into the kernel and burns server-side sockets.

### TIME_WAIT and ephemeral-port exhaustion

A client opening 5K connections per second to one backend on one (dst IP, dst port) will hit `EADDRNOTAVAIL` within a minute (TIME_WAIT × 60 s × open rate > 28K ephemeral ports). Mitigations:

- **Reuse pooled connections.** This is the *only* real fix at scale.
- Bind a wider source IP range.
- Have the **server** initiate close (TIME_WAIT then lives on the server, where there are many more 5-tuples).
- `net.ipv4.tcp_tw_reuse = 1` on Linux — safe with TCP timestamps.

### Socket buffer sizing — Bandwidth-Delay Product (BDP)

To saturate a 1 Gbps link with 30 ms RTT, your in-flight window needs:

```
   BDP = 1 Gbps × 0.030 s = 30 Mbit = 3.75 MB
```

If `SO_SNDBUF` or `SO_RCVBUF` is smaller, **you can't fill the pipe** no matter how fast the disk is. Modern Linux auto-tunes, but cloud images and tunnels often cap it.

## 3.12 Synchronous vs. Asynchronous communication

```
   SYNCHRONOUS (request/response)        ASYNCHRONOUS (fire-and-forget)
   ─────────────────────────────         ─────────────────────────────
   A ──── do it now ────▶ B              A ──── push event ──▶ Queue ──▶ B
   A ◀──── result ────── B               A keeps going immediately

   Simpler reasoning, tight coupling     Decoupled, resilient,
   A waits for B (latency adds up)       but harder to reason about
   B's outage = A's outage               B's outage is invisible to A
```

### Patterns you'll meet

| Pattern | When to use | Trade-off |
|---------|-------------|-----------|
| **Request/response (sync)** | UI needs an answer now | A inherits B's tail latency |
| **Fire-and-forget (async)** | Notifications, analytics, audit | Lose the reply; need separate observation |
| **Request/reply over messaging** | Async transport, sync semantics | Correlation IDs, reply queue per requester |
| **Event-driven (pub/sub)** | Many consumers care | No coupling, hard to trace |
| **Choreography** | Each service reacts to events | No central truth; emergent behaviour |
| **Orchestration** | A workflow engine drives steps | Central point of failure & coupling, easy to reason about |

**Rule:** use sync for queries that need an immediate answer; use async for commands that can be processed later (notifications, billing, analytics, search indexing). When you find yourself orchestrating *six* sync calls in a row, that's a signal to switch to async.

## 3.13 API styles — REST vs gRPC vs GraphQL vs WebSockets

| Style | Wire format | Best for | Weakness |
|-------|-------------|----------|----------|
| **REST** (HTTP+JSON) | Human-readable | Public APIs, browsers, edge caches | Over-fetching, chatty, weak typing |
| **gRPC** (HTTP/2+Protobuf) | Binary, schema'd | Internal microservices, polyglot | Browsers need a proxy, not human-readable |
| **GraphQL** | JSON over HTTP | UIs that need flexible queries | Server complexity, hard to cache |
| **WebSocket** | Bidirectional, persistent | Chat, live dashboards | Stateful conns are harder to scale |
| **Server-Sent Events** | One-way streaming over HTTP | Notifications, ticker feeds | Server → client only |
| **Long polling** | HTTP, kept open until data | Fallback, low-volume push | Doesn't scale to millions |
| **Webhooks** | HTTP POST from server | Async integrations across orgs | Receiver must be public; security burden |

### Quick decision tree

```
   Need real-time bidirectional?     ── yes ──▶ WebSockets
              │
              no
              ▼
   Need server-push only?            ── yes ──▶ SSE
              │
              no
              ▼
   Internal service-to-service?      ── yes ──▶ gRPC
              │
              no
              ▼
   UI needs flexible queries?        ── yes ──▶ GraphQL
              │
              no
              ▼
                                                REST
```

## 3.14 REST done right

- **Resources, not actions.** `POST /payments` (a *payment* resource), not `POST /makePayment`.
- **Verbs match semantics.** `PUT` is idempotent — use it for "set the state to this." `POST` for "create something new" or non-idempotent actions.
- **Status codes do the talking.** Don't return `200 {"error": "..."}` — use the real status (see §3.23).
- **Pagination is cursor-based, not offset.** (See Ch 25, §17.7 — offset pagination breaks on writes.)
- **Filtering and sorting are query parameters.** `GET /orders?status=paid&sort=-created_at`.
- **Hypermedia (HATEOAS)** is the original REST ideal — responses link to next actions. *Almost no one does this in practice.* Don't sweat it.
- **Errors are structured.** Return RFC 7807 (`application/problem+json`) with `type`, `title`, `status`, `detail`, `instance`.

## 3.15 gRPC deep dive — Protobuf, deadlines, metadata, errors

### Protobuf in one screen

```protobuf
syntax = "proto3";

message User {
  int64  id    = 1;
  string name  = 2;
  string email = 3;
}

service UserService {
  rpc GetUser   (GetUserRequest)   returns (User);
  rpc ListUsers (ListUsersRequest) returns (stream User);
}
```

- **Field numbers are forever.** Adding a field is backwards-compatible; **reusing a number is a breaking change**.
- **Default values vanish on the wire.** A `string` defaulting to `""` is encoded as zero bytes — efficient, but means "missing" and "empty" look the same. Use `optional` if you need to tell them apart.
- **Binary wire format** is ~5–10× smaller than JSON for typical RPCs.

### Deadlines, not timeouts

In gRPC the **client sets a deadline** (absolute time) and the deadline **propagates** to downstream calls. If A calls B with a 200 ms deadline and B calls C, C is given the *remaining* budget, not a fresh 200 ms. This is how you stop cascading "everyone retries for 30 s" outages.

### Metadata — headers, basically

```
   authorization: Bearer eyJ…
   x-request-id: 7b3c…
   user-agent:   my-service/1.4.2
```

### Canonical status codes (the 16)

`OK`, `CANCELLED`, `UNKNOWN`, `INVALID_ARGUMENT`, `DEADLINE_EXCEEDED`, `NOT_FOUND`, `ALREADY_EXISTS`, `PERMISSION_DENIED`, `RESOURCE_EXHAUSTED`, `FAILED_PRECONDITION`, `ABORTED`, `OUT_OF_RANGE`, `UNIMPLEMENTED`, `INTERNAL`, `UNAVAILABLE` (the only one safe to auto-retry without idempotency), `DATA_LOSS`, `UNAUTHENTICATED`.

### Interceptors

Cross-cutting concerns (auth, logging, metrics, retries, tracing) plug in as **interceptors** (similar to HTTP middleware). One place to add OpenTelemetry tracing for every RPC.

### gRPC-Web and reflection

- **gRPC-Web** — browsers can't speak raw HTTP/2 trailers, so a tiny proxy (Envoy plugin, grpcweb-proxy) translates. Plan for this in any browser-first architecture.
- **Reflection** — service describes itself at runtime; tools like `grpcurl` can talk to any service without `.proto` files. Enable in dev, disable in prod.

## 3.16 gRPC streaming modes

gRPC isn't just request/response. It has four modes built on HTTP/2:

| Mode | Client sends | Server sends | Example |
|------|--------------|--------------|---------|
| Unary | 1 message | 1 message | `GetUser` |
| Server streaming | 1 message | many messages | Tail logs, large list pagination |
| Client streaming | many messages | 1 message | Upload chunks |
| Bidirectional | many messages | many messages | Chat, telemetry, live dashboards |

Bidirectional streaming powers chat, telemetry uploads, and live dashboards — all without WebSockets.

## 3.17 GraphQL deep dive — power and pain

```
   query {
     user(id: 42) {
       name
       posts(last: 3) { title likes }
     }
   }
```

One round-trip, exactly the fields the client wants, nested traversal. Mobile teams love this.

### Schema, resolvers, and the N+1 trap

- **Schema** — types, queries, mutations, subscriptions.
- **Resolvers** — one function per field. Naive resolvers fan out: `user.posts` runs *one DB query per user*. Solution: **DataLoader** batches and dedupes within a request tick. (See Ch 24, §7.10 for the general N+1 problem.)

### Subscriptions

Real-time updates via WebSocket (or SSE). Same schema, push-style.

### Caching is the hard part

REST caches at the URL. GraphQL POSTs the query — same URL, different bodies. Strategies:

- **Persisted queries** — server stores the query, client sends a hash. URL becomes cacheable.
- **Client cache** (Apollo, Relay) — normalise by entity ID.
- **Edge GraphQL caches** (Apollo, Hasura) — typed cache keys.

### Federation (Apollo Federation)

Split the GraphQL schema across services. A gateway composes them at query time. Lets multiple teams own slices of one graph without a monolithic resolver layer.

### When *not* to use GraphQL

- Public APIs that need easy caching → REST.
- Internal east-west, strict contracts → gRPC.
- Tiny apps with one client → REST is fine; GraphQL is overhead.

## 3.18 WebSockets deep dive

### The handshake — HTTP upgrade

```
   GET /chat HTTP/1.1
   Host: example.com
   Upgrade: websocket
   Connection: Upgrade
   Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
   Sec-WebSocket-Version: 13
   ─────────────────────────────────────────────▶
                                                   ◀── 101 Switching Protocols
                                                       Upgrade: websocket
                                                       Connection: Upgrade
                                                       Sec-WebSocket-Accept: …
```

After 101, the TCP connection is no longer HTTP — it carries WebSocket frames.

### Frame format (high level)

| Field | Notes |
|-------|-------|
| **opcode** | text (0x1), binary (0x2), close (0x8), ping (0x9), pong (0xA) |
| **mask bit + key** | client → server frames *must* be masked (anti-cache-poisoning) |
| **payload length** | 7-bit (≤125), 16-bit (≤64K), or 64-bit |
| **payload** | the data |

### Heartbeats — detecting dead peers

Browsers send `pong` automatically in response to a server `ping`. Servers should ping every **15–30 s** to detect dead clients (NAT timeouts, sleeping laptops). Without this, your "active" connection count is a lie.

### Scaling WebSockets

```
   Browser ──▶ Sticky LB ──▶ App box #1 ──┐
   Browser ──▶ Sticky LB ──▶ App box #2 ──┼──▶ Redis pub/sub ──▶ deliver to all boxes
   Browser ──▶ Sticky LB ──▶ App box #3 ──┘
```

- **Sticky sessions** — each WebSocket lives on one box.
- **Backplane** — Redis pub/sub or Kafka so a message published by box #1 reaches a user connected to box #3.
- **~50K–250K connections per box** is achievable on modern Linux with tuned file descriptors and `epoll`.
- **`permessage-deflate`** — optional compression; great for chatty JSON, expensive on CPU.
- **Reconnection** — clients must back off (1 s → 2 s → 4 s, capped) and resume from last seen message ID.

## 3.19 Server-Sent Events & long polling

### SSE — server push without WebSockets

```
   GET /events HTTP/1.1
   Accept: text/event-stream
   ─────────────────────────▶
                                ◀── HTTP/1.1 200 OK
                                    Content-Type: text/event-stream

                                    event: price
                                    id: 17
                                    data: {"sym":"AAPL","px":189.4}

                                    event: price
                                    id: 18
                                    data: {"sym":"AAPL","px":189.5}
```

- Browser exposes via `EventSource`; **auto-reconnects** using `Last-Event-Id` for replay.
- One-way only (server → client). Use REST/gRPC for the inbound side.
- Works over plain HTTP — no upgrade, no special LB config.

### Long polling — the lowest-common-denominator push

Client sends a request; server holds it open until data is available *or* timeout fires; client immediately reopens.

```
   Client ── GET /updates ──▶ Server (hold…)
                              ◀── 200 {"messages":[...]}   when data arrives
   Client ── GET /updates ──▶ Server (hold…)
```

Use only when SSE/WebSockets aren't an option. Doesn't scale to millions; the held connections still cost a TCP socket and a thread.

### Which to pick

```
   bidirectional, low latency           → WebSocket
   server → client, simple, HTTP-only   → SSE
   client → server only                 → REST / gRPC
   compatibility fallback               → long polling
```

## 3.20 API versioning

You will break a contract one day. Plan how.

| Strategy | Where the version lives | Pros | Cons |
|----------|-------------------------|------|------|
| **URI** | `/v1/users` | Visible, easy to route | Two URIs per resource forever |
| **Header** | `Accept: application/vnd.acme.v2+json` | Clean URLs | Hidden from logs, harder to debug |
| **Query parameter** | `/users?v=2` | Trivial | Caches duplicate; mixes config with data |

### Compatibility rules that age well

- **Never remove a field.** Mark it deprecated; remove in the next major.
- **Never change a field's type.** Add a new field; deprecate the old.
- **Never reuse a JSON key or Protobuf field number.**
- **Add optional fields freely.** Default values keep old clients working.
- **Communicate retirement.** Use the `Sunset` HTTP header and `Deprecation` header (RFC 8594).

## 3.21 Idempotency

> **Simple Explanation:** An idempotent operation produces the same result whether you call it once or a hundred times. `DELETE /user/42` is idempotent. `POST /charge $10` is not (unless you add an idempotency key).

In distributed systems, **clients retry**. Without idempotency, retries cause duplicate charges, double emails, etc.

### The standard pattern — `Idempotency-Key`

```
   POST /charges
   Idempotency-Key: 8a1f-…-c923
   Content-Type: application/json
   {"amount": 1000, "currency": "USD"}
```

Server logic:

1. Look up the key in a dedup store (Redis, DB table).
2. **Not seen?** Process the request, store `(key → response body, status)`, **then** return.
3. **Seen with a final response?** Return the stored response (don't re-execute).
4. **Seen, still in-flight?** Either block briefly or return `409 Conflict` so the client backs off.

### Implementation details that matter

- **Window** — Stripe uses 24 hours. Long enough for any retry, short enough to bound storage.
- **Scope** — key is per-account, per-endpoint. `(account_id, endpoint, key)` is the dedup tuple.
- **Hash the request body** alongside the key; if a client reuses a key for a *different* body, reject with `422`.
- **Atomicity** — the "store response + commit DB change" step must be in one transaction, or you'll execute twice on crash.

### HTTP method idempotency cheat-sheet

| Method | Idempotent? | Notes |
|--------|-------------|-------|
| GET, HEAD, OPTIONS | yes | safe also |
| PUT, DELETE | yes | per HTTP spec |
| POST | **no** by default — add a key |
| PATCH | depends; usually not |

## 3.22 BFF — Backend For Frontend

```
   Mobile UI ──▶ Mobile BFF ──┐
                              ├──▶ underlying microservices
   Web UI    ──▶ Web BFF    ──┘
```

One backend tailored per client (mobile / web / partner). It aggregates, transforms, and slims the response for that specific client. Pioneered by SoundCloud and Netflix. Avoids the "one God API trying to please everyone" trap.

### When BFF helps

- Mobile clients on slow networks need small, pre-joined payloads.
- Different surfaces (web, iOS, watchOS, partner API) genuinely diverge.
- You can't change the upstream services fast enough.

### When BFF hurts

- One team, one client — BFF is just an extra hop.
- Each BFF re-implements the same auth/logging/validation — pay the cost in a shared library or a service mesh instead.
- BFF becomes a dumping ground for business logic (it shouldn't; it's a *shape adapter*).

### Adjacent patterns

- **Anti-Corruption Layer** — wrap a legacy/3rd-party API so the rest of the system doesn't see its warts.
- **API composition** — gateway joins data from several services for a single response.
- **GraphQL federation** — the GraphQL-native answer to "aggregate many services for one client."

## 3.23 HTTP status codes you should *never* misuse

```
   1xx INFORMATIONAL
   100 Continue              — "go ahead, send the body"
   101 Switching Protocols   — WebSocket upgrade

   2xx SUCCESS
   200 OK                    — success with body
   201 Created               — POST that created a new resource (use Location)
   202 Accepted              — async work queued; no result yet
   204 No Content            — success, body intentionally empty
   206 Partial Content       — Range request answered

   3xx REDIRECTION
   301 Moved Permanently     — permanent (cache forever)
   302 Found                 — temporary; old clients may swap method to GET
   304 Not Modified          — cache validator matched; reuse local copy
   307 Temporary Redirect    — like 302 but preserves method/body
   308 Permanent Redirect    — like 301 but preserves method/body

   4xx CLIENT ERROR
   400 Bad Request           — your client did wrong (malformed)
   401 Unauthorized          — actually means *unauthenticated*
   403 Forbidden             — authenticated but not allowed
   404 Not Found             — resource doesn't exist (or shouldn't be revealed)
   405 Method Not Allowed    — wrong verb; respond with Allow: header
   409 Conflict              — version mismatch / optimistic lock failure
   410 Gone                  — used to exist, intentionally removed
   415 Unsupported Media     — wrong Content-Type
   422 Unprocessable         — body parsed but semantically invalid
   428 Precondition Required — need If-Match / If-None-Match
   429 Too Many Requests     — rate-limited (return Retry-After)
   499 Client Closed         — nginx-ism; client gave up before response

   5xx SERVER ERROR
   500 Internal Error        — you broke
   501 Not Implemented       — method/feature not supported (router-level)
   502 Bad Gateway           — upstream returned garbage
   503 Service Unavailable   — overloaded / shedding (return Retry-After)
   504 Gateway Timeout       — upstream took too long
```

Returning `200` on errors with `{"error": "..."}` in the body is a junior anti-pattern. Use the right status; clients (and load balancers, retry libraries, browser caches) reason about them.

### Retry semantics — what's safe to retry automatically

| Status | Retry? | How |
|--------|--------|-----|
| 408, 425, 429, 500, 502, 503, 504 | yes | exponential backoff + jitter |
| 4xx other than the above | no | client must change something |
| Network error (no response) | yes, **only if idempotent** | use Idempotency-Key for POSTs |

## 3.24 Network performance fundamentals

You can't fix what you can't decompose. Latency is a *budget* that gets spent at every hop.

### Bandwidth vs latency vs throughput

- **Bandwidth** — capacity of the pipe (bits/sec). You can buy more.
- **Latency** — time for one bit to traverse (seconds). Set by the speed of light. You **cannot** buy less.
- **Throughput** — actual achieved rate. Limited by `min(bandwidth, window_size / RTT)`.

> Speed-of-light floor: London ↔ New York ≈ **28 ms one-way** in glass; you'll see ~70 ms RTT in practice. NA ↔ India ≈ ~230 ms RTT. **Put compute near the user, or move bytes asynchronously.**

### Bandwidth-Delay Product (the pipe size)

```
   BDP = bandwidth × RTT
       = 1 Gbps × 30 ms
       = 3.75 MB

   You must have ≥3.75 MB of unacknowledged data in flight to fill the pipe.
```

If `cwnd` (TCP) or your app-level window is smaller, you're under-using the link.

### Jitter and packet loss

- **Jitter** — variance in latency. Kills voice/video far more than absolute latency. Jitter buffers trade latency for smoothness.
- **Packet loss** — TCP retransmits (latency spike); UDP apps must handle (or hide) it. **1 % loss can cut TCP throughput by 50 %+** on a high-BDP link because cwnd keeps halving.

### TCP throughput approximation (Mathis)

```
   Throughput  ≈  MSS / (RTT × √loss_rate)
```

A 1 % loss on a 100 ms RTT link with 1460 MSS caps you at roughly **1.2 Mbps per flow**. Multiple flows can fill the pipe — which is why parallel HTTP/1.1 connections sometimes beat one HTTP/2 connection on lossy links.

## 3.25 NAT, IPs, and firewalls

### Address spaces

- **Public IPs** — globally routable, scarce on IPv4.
- **Private IPs (RFC 1918)** — `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`. Not routable on the open internet.
- **CGNAT (`100.64.0.0/10`)** — ISP-internal NAT pool.

### NAT — how your laptop reaches the internet

```
   Laptop (192.168.1.42:51000)  ──▶  Home router  ──▶  Internet
                                      rewrites src to
                                      (203.0.113.5:51000)
                                      and remembers the mapping
```

Inbound traffic to the laptop only works if there's an entry in the NAT table (created by an outbound packet). This is why **P2P apps need STUN / TURN / ICE** (WebRTC) to punch through.

### Stateful vs stateless firewalls

- **Stateless** (packet filter) — allow/deny per packet. Fast, dumb. Used at the network edge.
- **Stateful** — tracks connections, knows "this packet belongs to a flow you allowed." More flexible. The norm for security groups in clouds.

### IPv4 vs IPv6 (the 30-second version)

- IPv4 — 32 bits, ~4 B addresses, exhausted, propped up by NAT.
- IPv6 — 128 bits, "more addresses than atoms in your office building." No NAT needed; each device is reachable. Dual-stack is the migration reality; **Happy Eyeballs** (RFC 8305) is how clients race v6 and v4 to avoid v6 blackholes.

## 3.26 Networking anti-patterns to outgrow

- **No timeouts on outbound calls** — the most common cause of cascading failure. Always set both **connect** and **read** timeouts.
- **Retries without idempotency** — turns a transient blip into a duplicate-charge bug.
- **Retries without jitter** — synchronised retries become a **thundering herd**. Always add randomness.
- **Forgetting keep-alive** — slow start tax on every request. Free 10–30 % latency win to enable it.
- **Catching `503` and retrying forever** — if the upstream is shedding load, you're making it worse. Honour `Retry-After`; circuit-break.
- **TTL too high on a record you might need to move fast** — pre-lower the TTL days before any planned cutover.
- **Compressing already-compressed payloads** — wastes CPU and sometimes makes them *bigger*.
- **Trusting the client's clock** — for tokens, signatures, rate limits. Use server time.
- **Ignoring SNI/ALPN** — your "HTTPS is fine" might be quietly negotiating HTTP/1.1 and you're missing HTTP/2 throughput.
- **Treating CORS as security** — it's a browser-side rule. Anyone with curl is unaffected. Auth your endpoints.

---

# PART 4: LOAD BALANCING & TRAFFIC MANAGEMENT

## 4.1 What a load balancer does

> **Simple Explanation:** Imagine 10 cashiers at a supermarket and a person at the entrance directing shoppers to the shortest line. The load balancer (LB) is that person — for servers.

```
                          ┌─────────┐
                          │   LB    │ ◀── one virtual IP / DNS name
                          └────┬────┘
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌─────────┐     ┌─────────┐     ┌─────────┐
        │ server  │     │ server  │     │ server  │
        │   #1    │     │   #2    │     │   #3    │
        └─────────┘     └─────────┘     └─────────┘
```

It gives you: **scale-out**, **fault tolerance** (route around dead servers), **rolling deploys** (drain one at a time), and **TLS termination** (offload encryption).

## 4.2 L4 vs L7 — the most asked LB question

| | **L4 (transport-layer)** | **L7 (application-layer)** |
|---|---|---|
| Inspects | TCP/UDP packets (IP + port) | HTTP headers, URL, cookies |
| Speed | Very fast | Slower (does more work) |
| Routing rules | "round-robin to backend pool" | "if URL starts with /api → cluster A" |
| Examples | AWS NLB, HAProxy in TCP mode | AWS ALB, nginx, Envoy, Cloudflare |

**Senior insight:** L7 enables canary routing, A/B testing, WAF, and per-tenant rate limits. Most modern systems use L4 in front of L7.

## 4.3 Load-balancing algorithms

```
  • Round Robin       — server 1, 2, 3, 1, 2, 3...   (simple, ignores load)
  • Weighted RR       — give beefier servers more turns
  • Least Connections — send to the box with fewest in-flight requests
  • Least Response    — send to the fastest-responding box
  • IP Hash           — same client IP always lands on same server (stickiness)
  • URL Hash          — same URL always lands on same server (cache locality)
  • Random + Two      — pick two at random, send to the less-loaded one
                       (Google's "Power of Two Choices" — surprisingly great)
```

## 4.4 Health checks — how the LB knows a server is alive

```
   Every Ns:  LB ──── GET /healthz ───▶ server
                ◀───── 200 OK ────────
            (if 3 in a row fail → mark UNHEALTHY, stop routing)
            (if N in a row pass → mark HEALTHY again)
```

Two flavours: **shallow** (TCP/HTTP ping — server is responding) and **deep** (the endpoint actually queries DB, cache, etc. — server can *do work*). Deep checks are accurate but can cause cascading failures (DB hiccup → all servers fail health checks → all marked dead → 100% outage). Most prod systems do a **shallow + sampled-deep** combo.

## 4.5 Sticky sessions (session affinity)

Pin a client to the same backend (via cookie or IP hash) so in-memory session state stays put. **Try to avoid it** — it breaks load balance, complicates failover, and prevents free rolling deploys. Move session state to Redis instead.

## 4.6 Reverse proxy vs API gateway vs Load balancer

```
   ┌─────────────────────────────────────────────────────────┐
   │ All three sit between client and backend, but:           │
   ├─────────────────────────────────────────────────────────┤
   │ Reverse Proxy — TLS termination, caching, compression    │
   │ Load Balancer — distributes traffic across replicas      │
   │ API Gateway   — auth, rate limit, routing, transformation│
   │                 (= reverse proxy + LB + policy engine)   │
   └─────────────────────────────────────────────────────────┘
```

In modern systems (nginx, Envoy, Kong, AWS API Gateway) one box often plays all three roles.

## 4.7 Rate limiting

> **Simple Explanation:** A bouncer at the door. "You can come in 100 times per minute; the 101st gets a 429 Too Many Requests."

### Four classical algorithms

```
   TOKEN BUCKET            LEAKY BUCKET           FIXED WINDOW         SLIDING WINDOW
   ─────────────           ─────────────           ─────────────         ──────────────
   Bucket fills with       Bucket leaks at        Reset counter         Like fixed, but
   N tokens / sec.         constant rate.         every minute.         smooths the
   Request takes 1.        Bursts buffered,       Easy. Edge-of-        boundary problem
   Allows bursts up        not allowed past       window bursts can     by counting the
   to bucket size.         the leak rate.         double the limit.     last 60s rolling.
```

| Algorithm | Allows bursts? | Implementation | Used by |
|-----------|---------------|----------------|---------|
| Token bucket | Yes (up to bucket) | Counter + timestamp | AWS, Stripe |
| Leaky bucket | No (smooths) | Queue with constant drain | nginx |
| Fixed window | Yes (edge bursts) | One counter per window | Naive APIs |
| Sliding window | Yes (controlled) | Weighted counter | Cloudflare, Redis |

**Distributed rate limiting** is hard — coordinating one counter across N gateways usually means a shared Redis with `INCR + EXPIRE` and sometimes Lua scripts for atomicity.

## 4.8 Circuit breaker

> **Simple Explanation:** Like an electrical breaker — if a downstream service is failing, stop calling it for a while so it can recover and you don't waste resources.

```
       CLOSED  ──── failures > threshold ────▶  OPEN
         ▲                                       │
         │                                       │ wait cooldown
         │ successes                             ▼
         └──────────────────────────── HALF-OPEN ──┐
                                                   │
                                            try one request
```

Three states: **closed** (normal), **open** (short-circuit, fail fast), **half-open** (probe). Used in Netflix Hystrix, Istio, resilience4j.

## 4.9 Bulkhead pattern

Like a ship's watertight compartments — isolate resources so one tenant or feature can't flood the system. Implementation: per-tenant thread pools, per-endpoint connection pools, separate clusters for batch vs interactive.

## 4.10 Hashing at the load balancer — Maglev, Rendezvous, Consistent

Naive `hash(key) % N` re-routes most traffic when servers come and go — disastrous when each server holds a warm cache or stateful connection.

- **Consistent hashing** (Ch 24, §9.9) — adding/removing one server reshuffles only `1/N` of keys.
- **Maglev** (Google) — builds a fixed-size lookup table where each backend gets nearly equal slots, and adding/removing a backend changes a *minimum* number of slots. O(1) per lookup, even at millions of QPS. Used in Google's L4 LB and inspired Facebook's Katran.
- **Rendezvous / HRW hashing** — for each key, hash with every server and pick the highest. Naturally balanced, no ring data structure to maintain.

## 4.11 Hardware vs software load balancers

```
   F5 BIG-IP, Citrix NetScaler (hardware)   nginx, HAProxy, Envoy (software)
   ────────────────────────────────          ───────────────────────────
   Wire-speed (millions of QPS)              Tens of thousands per box
   $$$$$, vendor-locked                       Free / commodity
   Disappearing from new builds              Today's default
```

Cloud LBs (AWS NLB/ALB, GCP LB, Azure LB) are typically **software running on commodity hardware at massive scale**, fronted by Anycast IPs so traffic enters the network at the user's nearest edge.

## 4.12 DNS-based load balancing

The simplest, dumbest LB: return multiple A records and let the client pick. Variants:

- **Round-robin DNS** — rotate which IP comes first; clients usually pick the first.
- **Weighted DNS** — route X % to region A, Y % to region B.
- **GeoDNS** — return the IP nearest to the resolver's location (the basis of every CDN).
- **Latency-based** (AWS Route 53) — return the IP with the lowest measured latency.

**Caveat:** DNS is cached for the TTL. Failover is *slow*. Critical systems combine DNS-LB (region selection) with in-region L4/L7 LBs (fast failover).

## 4.13 The Power of Two Choices (P2C)

Surprisingly simple, surprisingly powerful: instead of picking the least-loaded backend (requires global state), pick **two at random** and route to whichever is less loaded.

```
   Random:      poor balance (Poisson tail of overloaded servers)
   Least-loaded: requires per-request synchronized state
   Power of two: 99 % of optimal balance with O(1) decision time
```

Used by Netflix, Google, Envoy, and Nginx Plus. It's mathematically magical — *two* probes give nearly the benefit of *all* probes.

## 4.14 Sliding-window rate limiter in Redis

A production-grade snippet you'll see in interviews:

```lua
-- KEYS[1] = bucket key, ARGV[1] = max requests, ARGV[2] = window seconds
local current = redis.call("INCR", KEYS[1])
if current == 1 then
    redis.call("EXPIRE", KEYS[1], ARGV[2])
end
if current > tonumber(ARGV[1]) then
    return 0
end
return 1
```

Atomic via Lua → no race. For *true* sliding windows (not fixed), use a sorted set and `ZRANGEBYSCORE` to count recent requests.

---

# PART 5: CACHING

## 5.1 Why we cache

> **Simple Explanation:** A cache is a small, fast store of "stuff people ask for a lot," so you don't have to do the expensive work every time.

```
   Without cache                          With cache
   ───────────────                        ──────────────
   client ──▶ app ──▶ DB (50ms)           client ──▶ app ──▶ cache (1ms) ✓
                                                            │ miss
                                                            ▼
                                                            DB (50ms)
```

Caches turn an O(reads) database load into something close to O(misses). They are the single biggest performance lever in most systems.

## 5.2 Where caches live (the cache hierarchy)

```
   ┌──────────────────────────────────────────────────────┐
   │ Client cache    — browser, mobile app (HTTP cache)   │
   │ CDN             — edge POPs near the user            │
   │ Reverse proxy   — nginx/Varnish in front of app      │
   │ App-tier cache  — Redis/Memcached cluster            │
   │ Local in-proc   — Caffeine, Guava, LRU map           │
   │ Database cache  — buffer pool, query plan cache      │
   └──────────────────────────────────────────────────────┘
        ▲ closer to user (faster, smaller)
        ▼ closer to source-of-truth (slower, fresher)
```

Cache *every* layer that matters, but pick consistency boundaries deliberately.

## 5.3 Caching strategies — the four patterns

```
1. CACHE-ASIDE (lazy, most common)
   Read:  app ─▶ cache ─miss─▶ DB ─▶ write to cache ─▶ return
   Write: app ─▶ DB; invalidate cache
   ► Pros: cache only contains used data.  Cons: first request is slow.

2. READ-THROUGH
   Read:  app ─▶ cache (cache itself loads from DB on miss)
   ► Same as cache-aside but the cache library hides the DB.

3. WRITE-THROUGH
   Write: app ─▶ cache ─▶ DB (cache writes synchronously to DB)
   ► Cache always consistent. Slow writes.

4. WRITE-BACK (write-behind)
   Write: app ─▶ cache; cache flushes to DB later (async)
   ► Fast writes. Risk of data loss if cache dies.
```

## 5.4 Eviction policies

When the cache is full, who gets kicked out?

| Policy | What it kicks | Best for |
|--------|---------------|----------|
| **LRU** (Least Recently Used) | Oldest unused entry | Most workloads — *the default* |
| **LFU** (Least Frequently Used) | Least requested entry | Stable hot sets, news sites |
| **FIFO** | First-in regardless of use | Streaming, queues |
| **Random** | Random victim | Simple, surprisingly OK |
| **TTL-only** | Anything past expiry | Sessions, tokens |
| **ARC** (Adaptive) | Adapts LRU/LFU dynamically | High-end systems (PostgreSQL) |

```
   LRU example (cache size = 3):
   GET A → [A]
   GET B → [B,A]
   GET C → [C,B,A]
   GET A → [A,C,B]      ← A moved to front
   GET D → [D,A,C]      ← B evicted (least recently used)
```

## 5.5 The cache invalidation problem

> "There are only two hard things in computer science: cache invalidation and naming things." — Phil Karlton

Three options when the source data changes:

1. **TTL** — set a short expiry; eventual consistency baked in. *Easy, slightly stale data.*
2. **Explicit invalidation** — on write, `cache.delete(key)`. *Fresh, but race-condition prone.*
3. **Versioned keys** — `key:v123`; bump version on write so old reads miss. *Elegant, but stale keys linger.*

The race: app writes DB → invalidates cache → between those two steps, another reader caches the *old* value. Fix with "write-then-invalidate-then-invalidate-again-after-TTL" or use change-data-capture (CDC) to push invalidations.

## 5.6 Cache stampede & thundering herd

When a popular key expires, *all* concurrent requests miss simultaneously and hammer the DB.

```
   t=0  cache expires
   t=1  10,000 readers all miss → 10,000 DB queries → DB melts
```

Defences:
- **Mutex / single-flight** — only one request rebuilds, others wait.
- **Probabilistic early expiry** — refresh a few seconds *before* expiry with small probability.
- **Stale-while-revalidate** — serve stale, refresh in background.

## 5.7 Redis vs Memcached (90% of the question)

| | **Redis** | **Memcached** |
|---|---|---|
| Data types | Strings, lists, sets, hashes, sorted sets, streams, HLL | Strings only |
| Persistence | RDB snapshot + AOF log | None (pure memory) |
| Replication | Built-in primary/replica + Sentinel + Cluster | Client-side sharding |
| Eviction | LRU, LFU, TTL, random | LRU |
| Threads | Mostly single-threaded (multi in 6+) | Multi-threaded |
| Best for | Sessions, leaderboards, pub-sub, queues, geo | Pure object cache, simple K/V |

**Default to Redis** unless you specifically need Memcached's simpler model.

## 5.8 The three "cache attacks" — penetration, breakdown, avalanche

Often confused; they have very different fixes.

| Problem | What happens | Defence |
|---------|--------------|---------|
| **Penetration** | Many requests for keys that *don't exist* miss cache and hit DB | Cache the negative result with short TTL, or use a **Bloom filter** (Ch 24, §9.17) to reject impossible keys before the cache |
| **Breakdown / Stampede** | A *single hot key* expires; thousands of concurrent readers all miss simultaneously | Single-flight (mutex), probabilistic early expiry, never-expire + background refresh |
| **Avalanche** | *Many keys* expire around the same time (or the cache cluster restarts cold) | Randomize TTLs (±20 %), pre-warm cache on startup, tiered caches |

## 5.9 Modern eviction — W-TinyLFU (Caffeine)

The default for new Java services. Combines:
- A small **window** LRU for fresh items.
- A larger **main** LFU using a probabilistic Count-Min Sketch.
- An **admission filter** that compares incoming items to the LFU victim and only admits if it's likely to be more popular.

Result: near-optimal hit rates across web, OLTP, and scan workloads — empirically beats LRU and ARC.

## 5.10 Multi-tier caching

```
   request ─▶ L1 (in-process, Caffeine, ~100 ns)
                     │ miss
                     ▼
              L2 (Redis cluster, ~1 ms)
                     │ miss
                     ▼
              L3 (read replica, ~5 ms)
                     │ miss
                     ▼
              Primary DB (~50 ms)
```

Each layer absorbs traffic. The L1 in-process cache is the biggest win for trivial cost — it eliminates the network round-trip for the hottest 1 % of keys.

**Cache coherence problem** with L1: when data changes, *every server's* L1 must be invalidated. Solutions: Redis pub-sub messages, change-data-capture, or very short L1 TTLs (1–5 s).

## 5.11 Single-flight pattern — the stampede killer

```go
// Go-style single-flight: only one goroutine fetches per key.
// All others wait and share the result.
v, err, _ := group.Do("user:42", func() (interface{}, error) {
    return db.Query("...")
})
```

Available in: Go's `golang.org/x/sync/singleflight`, Java's Caffeine `AsyncLoadingCache`, Python's `aiocache`, Ruby's `dalli` `mutex`. **Always wrap hot read-through caches with it.**

## 5.12 What *not* to cache

- Per-user data with low reuse (waste of memory).
- Data that changes faster than the TTL (always stale, useless).
- Data whose freshness is legally required (pricing in some jurisdictions).
- Anything whose lookup is already < 1 ms (cache adds complexity, not speed).
- Personal data without thinking about cache-key isolation (a shared cache can leak across tenants).

---

# PART 6: CDN — CONTENT DELIVERY NETWORK

## 6.1 The CDN idea in one picture

```
                    ORIGIN (e.g., S3 in us-east-1)
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
        ┌───────┐       ┌───────┐       ┌───────┐
        │ Edge  │       │ Edge  │       │ Edge  │  ← POPs ("Points of
        │ Tokyo │       │London │       │ NYC   │     Presence") around
        └───┬───┘       └───┬───┘       └───┬───┘     the world
            │               │               │
        Tokyo users     UK users        US users
```

The CDN keeps a copy of static (and increasingly dynamic) content geographically close to users, so the round-trip-time shrinks from 200ms to 20ms.

## 6.2 What a CDN actually does

1. **Edge caching** — serves images/JS/CSS/video from the nearest POP.
2. **TLS termination** — handshake near the user (huge latency win).
3. **DDoS absorption** — soaks up volumetric attacks at the edge.
4. **Compression & image optimization** — WebP/AVIF on the fly.
5. **HTTP/3 + connection reuse** — modern transport for free.
6. **Edge compute** — Cloudflare Workers, Lambda@Edge.

## 6.3 Push vs Pull CDN

| | Push | Pull |
|--|------|------|
| When content arrives | You upload to the CDN explicitly | First miss triggers a fetch from origin |
| Best for | Large infrequently-changing assets (video) | Web assets that change often |
| Storage cost | High (every POP keeps it) | Low (only popular content cached) |
| First-request latency | Fast | One slow miss, then fast |

## 6.4 Cache invalidation at the edge

Three approaches:
- **TTL** — every object has an expiry; CDN re-checks origin after.
- **Purge** — explicit API call to evict a URL globally (Cloudflare, Akamai).
- **Versioned URLs** — change the filename (`app.v123.js`) so old CDN entries are simply unreachable. *This is the safest pattern.*

## 6.5 Where CDNs live in the architecture

```
   User ──▶ DNS ──▶ CDN edge ──cache hit?──▶ return
                          │
                          ▼ miss
                      regional cache ──hit?──▶ return
                          │
                          ▼ miss
                      Origin shield (one cache fronting origin)
                          │
                          ▼
                      Origin (S3 / app servers)
```

The shield protects the origin from a thundering herd of edge misses.

## 6.6 Cache keys and the `Vary` header

A CDN's cache key is by default `(host + path + query)`. But the same URL can return different responses based on language, device, or compression. The `Vary` HTTP header tells the CDN to also key on those headers:

```
   Vary: Accept-Encoding, Accept-Language
```

Too-aggressive `Vary` (e.g., on User-Agent) explodes the key space and tanks hit ratio. **Normalize at the edge** — bucket User-Agents into "mobile / desktop / bot", map languages to a small set.

## 6.7 Streaming video at the edge — HLS and DASH

Video is split into 2–10 second chunks; the player picks chunk quality based on bandwidth. Both protocols use:
- A **manifest** (.m3u8 / .mpd) listing available bitrates and chunk URLs.
- **Chunks** served as ordinary HTTP files — perfectly cacheable on CDNs.

```
   Player ──▶ CDN: GET /master.m3u8           (playlist)
   Player ──▶ CDN: GET /1080p/seg001.ts       (chunk)
              (player adapts to 720p if bandwidth drops)
```

This is why YouTube and Netflix can serve billions of viewers — chunks are static files, infinitely cacheable.

## 6.8 Edge compute

Modern CDNs run small JS / WebAssembly workers at the edge:
- **Cloudflare Workers / Fastly Compute@Edge / Lambda@Edge / Akamai EdgeWorkers**.
- Use for: A/B routing, auth checks, header rewriting, request collapsing, personalization at the edge.

The mental shift: the "edge" is no longer just a cache — it's a programmable runtime that runs *before* the origin sees the request. New patterns: edge-side JWT verification, geo-routing, IP allow/deny, image resizing on the fly.

## 6.9 Anycast — one IP, many locations

```
   Same IP 1.1.1.1 announced from POPs in
   Tokyo, London, NYC, São Paulo, Sydney...

   The internet's BGP routing automatically sends each user
   to the *nearest* POP by network topology.
```

Anycast is the secret sauce that lets Cloudflare absorb 100 Tbps DDoS attacks — the traffic is split geographically by routing physics, not by your code. Used by every modern CDN, public DNS resolver, and large cloud LBs.

---

> **Continued in [Chapter 24 — System Design — Part 2: Data & Distributed Systems](24_system_design_data_distributed.md).** Part 2 picks up the §X.Y numbering at §7.1 and covers databases (SQL/NoSQL internals, indexing, MVCC/WAL, LSM), scaling them out (replication, sharding, multi‑region), the distributed‑systems theory that holds it together (CAP, consensus, time, locks, CRDTs), messaging & streaming (Kafka, outbox + CDC), storage systems, and data processing.
>
> **After that:** [Chapter 25 — System Design — Part 3: Operations & Case Studies](25_system_design_operations_case_studies.md) covers reliability, security, observability, deployment, multi‑region, FinOps, anti‑patterns, and a full Instagram worked example.
