# Chapter 34 — System Design Fundamentals: The Complete Deep Dive

> "All architecture is design, but not all design is architecture. Architecture represents the significant design decisions that shape a system, where 'significant' is measured by cost of change." — Grady Booch

**What this chapter covers:**
A single, comprehensive map of every fundamental building block you need to design real systems — CDN, load balancers, caching, sharding, CAP theorem, consensus, queues, observability, security, and more. Written in plain English first, then deep enough for senior interviews.

**How to read it:**
Each topic follows the same shape — *Simple Explanation → Official Definition → How it works (with ASCII diagrams) → Variants → Trade-offs → Interview takeaway.* You can read it cover-to-cover (~9–10 hours) or jump straight to any building block. The final three parts (20–22) are case-study material that ties everything together — read those after at least skimming Parts 1–19.

---

## Table of Contents

| Part | Section | Building Blocks |
|------|---------|-----------------|
| 1 | The Big Picture | Why systems are designed the way they are; the four jobs |
| 2 | Core Concepts | Scalability, availability, latency vs. throughput, SLAs |
| 3 | Networking & Communication | HTTP/TCP/UDP, DNS, WebSockets, REST vs gRPC vs GraphQL |
| 4 | Load Balancing & Traffic Management | L4 vs L7, algorithms, rate limiting, circuit breakers |
| 5 | Caching | Strategies, eviction (LRU/LFU/FIFO), distributed caches |
| 6 | CDN | Edge networks, push vs pull, invalidation |
| 7 | Databases | SQL vs NoSQL, ACID vs BASE, indexing, transactions |
| 8 | Database Scaling | Sharding, partitioning, replication, federation |
| 9 | Distributed Systems Theory | CAP, PACELC, consensus, consistent hashing, Bloom filters |
| 10 | Messaging & Streaming | Queues, pub/sub, Kafka, delivery guarantees |
| 11 | Storage Systems | Block / file / object storage, data lakes vs warehouses |
| 12 | Data Processing | Batch vs stream, MapReduce, Lambda & Kappa |
| 13 | Reliability & Fault Tolerance | Redundancy, failover, retries, chaos engineering |
| 14 | Security | AuthN/AuthZ, OAuth, JWT, encryption, OWASP Top 10 |
| 15 | Observability | Logs, metrics, traces, SLI/SLO/SLA |
| 16 | Deployment & Infrastructure | Containers, K8s, CI/CD, blue-green, canary |
| 17 | Search & Building Blocks | Inverted index, geo-indexes, ID generation, service discovery |
| 18 | Multi-Region Architecture | Active-active vs active-passive, traffic steering, split-brain, data sovereignty |
| 19 | Cost & Capacity Engineering (FinOps) | Cost iceberg, instance pricing models, right-sizing, capacity planning |
| 20 | Common Anti-Patterns | Distributed monolith, premature sharding, retry storms, snowflake servers |
| 21 | Worked Example — Designing Instagram | End-to-end design exercising every prior part |
| 22 | Putting It Together | A reusable interview framework + reference designs |

---

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

A 1-in-100 slow backend becomes a 1-in-1 slow user experience at fan-out 100. This is why Google obsesses over tail latency and uses **hedged requests** (§13.7).

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

> **mTLS** (mutual TLS) — both sides present certs. Foundation of service-mesh auth (Istio, Linkerd) and zero-trust networking. Deep dive in §14.10.

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
- **Pagination is cursor-based, not offset.** (See §17.7 — offset pagination breaks on writes.)
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
- **Resolvers** — one function per field. Naive resolvers fan out: `user.posts` runs *one DB query per user*. Solution: **DataLoader** batches and dedupes within a request tick. (See §7.8 for the general N+1 problem.)

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

- **Consistent hashing** (§9.9) — adding/removing one server reshuffles only `1/N` of keys.
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
| **Penetration** | Many requests for keys that *don't exist* miss cache and hit DB | Cache the negative result with short TTL, or use a **Bloom filter** (§9.17) to reject impossible keys before the cache |
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

# PART 7: DATABASES

> **The goal of this part:** give you the intuition (and the mechanics) to pick the right database, write queries that *plan* the way you expect, and know what's actually happening between `COMMIT` and disk. Every later scaling and reliability story in this chapter sits on top of these ideas.

## 7.1 SQL vs NoSQL — the eternal question

> **Simple Explanation:** SQL is a *filing cabinet with strict rules* — every folder has the same fields. NoSQL is a *box of sticky notes* — every note can look different, but you give up some safety.

| | **SQL (relational)** | **NoSQL** |
|---|---|---|
| Schema | Fixed, declared upfront | Flexible / schema-on-read |
| Query language | SQL, joins, group-by | Per-DB API; joins discouraged |
| Transactions | ACID (multi-row, multi-table) | Often single-document only |
| Scaling | Hard to shard (joins!) | Designed to scale out |
| Consistency default | Strong | Eventual (tunable) |
| When right | Money, inventory, anything relational | Massive scale, varied data, write-heavy |
| Examples | PostgreSQL, MySQL, Oracle, Spanner | MongoDB, Cassandra, DynamoDB, Redis |

**Modern truth:** the dichotomy is dying. Postgres has JSON, full-text, vectors, time-series; CockroachDB / Spanner / Yugabyte scale SQL horizontally; DynamoDB has transactions. Pick by *access pattern*, not the label.

### When SQL is actually wrong

- Multi-petabyte append-only telemetry — relational locking and B-tree updates can't keep up.
- Schemas that genuinely change per row (sparse, polymorphic).
- Single-key reads at millions of RPS with sub-ms tail latency (use a KV store).

### When NoSQL is sold but you actually want SQL

- "We need flexibility" — usually means *you didn't model your data*. A document store with 20 nested optional fields is worse than 3 normalized tables.
- "Joins don't scale" — most apps never push joins past what a healthy Postgres on one box can do (10 K+ QPS easily).
- "We'll add transactions later" — you won't, and the data-correctness bugs will be expensive.

### NewSQL — the middle ground

**Spanner, CockroachDB, YugabyteDB, TiDB, FaunaDB** — SQL interfaces with distributed storage and consensus underneath. Higher write latency than single-box Postgres, but horizontal scale + global consistency. Use when you'll outgrow one box *and* you need real transactions.

## 7.2 The NoSQL family tree — choose by access pattern

```
   ┌──────────────────────────────────────────────────────────┐
   │ KEY-VALUE     — { key → value }                          │
   │   Redis, DynamoDB, Memcached, RocksDB, Aerospike         │
   │   ► Sessions, caches, simple lookups, feature flags      │
   ├──────────────────────────────────────────────────────────┤
   │ DOCUMENT      — JSON blobs, queryable                    │
   │   MongoDB, Couchbase, Firestore, DocumentDB              │
   │   ► User profiles, content, schemaless data              │
   ├──────────────────────────────────────────────────────────┤
   │ COLUMN-FAMILY — rows with sparse, wide columns           │
   │   Cassandra, Bigtable, HBase, ScyllaDB                   │
   │   ► Time-series, write-heavy, geo-replicated workloads   │
   ├──────────────────────────────────────────────────────────┤
   │ GRAPH         — nodes + edges with relationships         │
   │   Neo4j, Amazon Neptune, ArangoDB, DGraph, JanusGraph    │
   │   ► Social networks, fraud detection, knowledge graphs   │
   ├──────────────────────────────────────────────────────────┤
   │ TIME-SERIES   — timestamp + metrics                      │
   │   InfluxDB, TimescaleDB, Prometheus, ClickHouse, Druid   │
   │   ► Metrics, IoT, monitoring, financial ticks            │
   ├──────────────────────────────────────────────────────────┤
   │ SEARCH        — inverted-index full-text                 │
   │   Elasticsearch, OpenSearch, Solr, Meilisearch, Tantivy  │
   │   ► Log search, product search, autocomplete             │
   ├──────────────────────────────────────────────────────────┤
   │ VECTOR        — embedding similarity                     │
   │   pgvector, Qdrant, Pinecone, Weaviate, Milvus, Chroma   │
   │   ► RAG, semantic search, recommendation                 │
   ├──────────────────────────────────────────────────────────┤
   │ WIDE-COLUMN OLAP — columnar analytical                   │
   │   BigQuery, Snowflake, Redshift, ClickHouse, Druid       │
   │   ► Analytics, dashboards, ad-hoc SQL on big data        │
   └──────────────────────────────────────────────────────────┘
```

### Per-family "actually pick this when…" rule

- **Key-value** — your only access pattern is `get(key)` / `put(key, value)` and you need single-digit ms tail at huge QPS.
- **Document** — natural unit is a self-contained aggregate (user profile, order with line items) and you mostly read/write whole documents.
- **Column-family** — you have known query patterns and need linear-write throughput; willing to model "tables per query."
- **Graph** — your dominant query is "k hops away," not "show me all rows where …."
- **Time-series** — append-only by timestamp, queries are time-windowed aggregates.
- **Search** — full-text relevance, fuzzy match, faceted filters.
- **Vector** — nearest-neighbour search in embedding space.
- **OLAP column store** — analytics with `SELECT … GROUP BY` over billions of rows; columns scanned in isolation.

## 7.3 ACID — what each letter really means

> **Simple Explanation:** ACID is the four-part promise an RDBMS makes about transactions.

- **Atomicity** — all of it commits or none of it does (no half-transfers). Implemented by the WAL + undo log.
- **Consistency** — DB ends in a *valid* state (constraints, FKs, triggers honoured). The most misunderstood letter — it's *application-level* invariants, not "data is up to date everywhere."
- **Isolation** — concurrent transactions look like they ran one-at-a-time. Implemented by locks (pessimistic) or MVCC (optimistic).
- **Durability** — once committed, it survives crashes. Implemented by `fsync` on the WAL before ack.

### Isolation levels — what each prevents

```
   Read Uncommitted ─── can see other txns' uncommitted writes (dirty reads)
   Read Committed    ─── only sees committed data (Postgres default)
   Repeatable Read   ─── same query gives same result inside one txn (MySQL default; Postgres = Snapshot Isolation)
   Serializable      ─── as if every txn ran alone — strongest, slowest
```

| Phenomenon | Plain English | Prevented by |
|------------|---------------|--------------|
| **Dirty read** | Read another txn's uncommitted write | Read Committed and above |
| **Non-repeatable read** | Same row, different value re-read in same txn | Repeatable Read and above |
| **Phantom read** | New rows appear in a re-run range query | Serializable (or gap locks in MySQL RR) |
| **Lost update** | Two txns read-modify-write; one's update vanishes | Repeatable Read + row lock, or SSI |
| **Write skew** | Two txns each read state, write without overlap, but together violate a constraint | Serializable / SSI |

### Snapshot Isolation vs Serializable Snapshot Isolation

- **Snapshot Isolation (SI)** — each txn sees a consistent snapshot from its start time. Prevents dirty/non-repeatable/phantoms. Allows **write skew** (the classic "on-call doctor" anomaly).
- **Serializable Snapshot Isolation (SSI)** — Postgres's `SERIALIZABLE` mode. Tracks read/write dependencies, aborts a txn that *would* violate serializability. Safer than SI, but expects retries on conflict.

### ACID in distributed databases — what changes

- **Atomicity** across shards needs 2PC, Calvin-style determinism, or Spanner's TrueTime-backed commit.
- **Consistency** is the same (it's about invariants), but **linearizability** (a stronger external guarantee) needs consensus.
- **Isolation** at planet scale costs RTTs — Spanner does "external consistency" by waiting out clock uncertainty.
- **Durability** = synchronous replication to a quorum, not just local `fsync`.

## 7.4 BASE — the NoSQL counter-philosophy

- **Basically Available** — the system answers, even with stale data.
- **Soft state** — state can change without input (replication catches up).
- **Eventual consistency** — given enough time and no new writes, replicas converge.

BASE is the trade you make to scale horizontally past what ACID can comfortably do. **BASE ≠ "anything goes":** a well-designed BASE system bounds staleness ("≤ 5s p99"), guarantees monotonicity ("you'll never see a write disappear"), and isolates blast radius.

## 7.5 Indexing — the difference between 1ms and 10s

> **Simple Explanation:** An index is the back-of-the-book — instead of scanning every page, you look up the term and jump. Same for a DB table.

```
   Without index:                 With B-tree index on user_id:
   SELECT * WHERE user_id = 42    Walk the tree: log(N) ≈ 20 hops
   Scan all N rows                Random read 1 row
   O(N)                           O(log N)
```

### Common index structures

| Structure | Best for | Used by |
|-----------|----------|---------|
| **B-tree / B+tree** | Range queries, equality, sorting | Almost every RDBMS |
| **Hash** | Pure equality | Postgres hash, Redis |
| **Inverted index** | Full-text search | Elasticsearch, Lucene, PG GIN |
| **LSM-tree** | Write-heavy workloads | Cassandra, RocksDB, LevelDB |
| **Bitmap** | Low-cardinality columns (gender, status) | Oracle, ClickHouse |
| **BRIN** | Huge tables, naturally ordered (time-series) | Postgres (block-range index) |
| **GiST / SP-GiST** | Geo, ranges, irregular data | Postgres, PostGIS |
| **R-tree / Quadtree / Geohash** | Bounding-box / nearest-point | PostGIS, Mongo, Redis GEO |
| **HNSW / IVF** | Approximate vector search | pgvector, Qdrant, Pinecone |

### B-tree vs B+tree

```
   B-tree:  values stored in internal nodes AND leaves
   B+tree:  values only in leaves; leaves form a linked list
            ──▶ range scans are sequential and fast
```

Almost every modern RDBMS uses **B+tree**. The leaf chain makes `WHERE id BETWEEN 100 AND 200` a sequential walk — no re-traversal.

### Clustered vs secondary indexes

- **Clustered index** — table rows are physically stored in the order of this index (one per table). InnoDB and SQL Server cluster by primary key by default.
- **Secondary index** — separate B-tree pointing back to the row. In InnoDB it stores the PK as the pointer, so secondary lookups cost two traversals.

### Composite index ordering matters (the "leftmost prefix" rule)

```
   INDEX idx_user_time (user_id, created_at)

   helps:  WHERE user_id = ?                       ✔
           WHERE user_id = ? AND created_at > ?    ✔
           ORDER BY user_id, created_at            ✔

   does NOT help:
           WHERE created_at > ?                    ✘  (no user_id filter)
           WHERE user_id = ? ORDER BY name         ✘  (wrong order column)
```

### Covering indexes & index-only scans

If the index contains *every column* the query needs, the DB can answer without touching the table heap:

```sql
CREATE INDEX idx ON orders (user_id) INCLUDE (status, total);
SELECT status, total FROM orders WHERE user_id = 42;
-- Index-only scan; no heap read.
```

### Specialty index features worth knowing

- **Partial / filtered index** — `WHERE deleted_at IS NULL`. Smaller, faster, perfect for soft-deleted tables.
- **Functional / expression index** — `CREATE INDEX ON users (lower(email))` enables case-insensitive lookups.
- **Unique partial index** — enforce "one active subscription per user" without uniqueness on cancelled rows.
- **GIN/GIST on JSONB** — index a single field inside a JSON blob.

### Costs and gotchas

- **Every index slows writes** (DB must maintain it on each insert/update/delete).
- **Index bloat** — Postgres B-trees fragment over time; `REINDEX CONCURRENTLY` rebuilds them.
- **Wrong index ≠ no improvement** — picking an unselective column (gender, country) wastes IO walking many matches.
- **Indexes that are never used** — the worst kind. Drop them; check `pg_stat_user_indexes`.

## 7.6 Normalization vs Denormalization

```
   NORMALIZED                          DENORMALIZED
   ─────────                            ─────────────
   users(id, name)                      orders(id, user_id, user_name, ...)
   orders(id, user_id)                  ↑
   ↑                                    Duplicate user_name in every order.
   No duplication.                      Faster reads (no join), painful updates.
```

### Normal forms in 30 seconds each

- **1NF** — atomic columns (no comma-separated lists in a cell).
- **2NF** — every non-key column depends on the *whole* primary key (not just part of a composite).
- **3NF** — non-key columns don't depend on other non-key columns ("no transitive dependencies").
- **BCNF** — stricter 3NF: every determinant is a candidate key. Handles edge cases 3NF misses.

OLTP (banking, e-commerce) lean **normalized** (3NF). Analytics warehouses lean **denormalized**.

### Star schema (warehouses)

```
                  ┌──────────────┐
                  │  dim_user    │
                  └─────┬────────┘
   ┌──────────────┐    │     ┌──────────────┐
   │ dim_product  │────┼─────│ dim_date     │
   └──────────────┘    │     └──────────────┘
                       ▼
                 ┌────────────┐
                 │  fact_sales│   ← narrow keys + numeric measures
                 └────────────┘
```

A central **fact table** (events, sales) with foreign keys to several **dimension tables**. Optimised for `GROUP BY` aggregations across dimensions. **Snowflake schema** further normalises the dimensions (rarely worth it).

## 7.7 Query planner & EXPLAIN — reading what the DB is doing

> **The most underused tool in the average backend engineer's belt.** If you can read an `EXPLAIN ANALYZE`, you can usually fix the query in minutes.

```
   SQL ─▶ Parser ─▶ Rewriter ─▶ Planner ─▶ Executor
                                   │
                                   └── picks join order, access paths,
                                      based on row estimates from
                                      column statistics
```

### Common plan node shapes

| Plan node | What it means | Smell if you see it |
|-----------|---------------|---------------------|
| **Seq Scan** | Read every row | OK on small tables; bad on big ones with selective filters |
| **Index Scan** | Walk an index, fetch from table | Healthy |
| **Index-Only Scan** | Answer from the index alone | Best case |
| **Bitmap Index Scan + Bitmap Heap Scan** | Build a bitmap of matching rows, then read pages once | Good for multi-condition queries |
| **Nested Loop** | For each outer row, look up matches in inner | Great for tiny outer + indexed inner; disastrous for big outer |
| **Hash Join** | Build hash of one side, probe with the other | Good for medium-sized joins; needs RAM |
| **Merge Join** | Both sides sorted, walk in lockstep | Good for huge sorted inputs |
| **Sort** | Order rows | Bad if it spills to disk (huge memory needed) |
| **Hash Aggregate** | Group by hashing | Fast if it fits in `work_mem` |

### Statistics drive everything

The planner picks based on **estimated row counts** from column statistics. If stats are stale, the plan is wrong. Symptoms:

- Plan estimates 100 rows; actually returns 1 M → nested loop blows up.
- Estimates 1 M; actually 10 → unnecessary hash join.

Fix: `ANALYZE table_name;` (or `VACUUM ANALYZE;`). Schedule it; don't trust autovacuum alone after bulk loads.

### Reading `EXPLAIN ANALYZE`

```
   Seq Scan on orders  (cost=0.00..18.50 rows=1 width=72)
                       (actual time=0.025..0.150 rows=42000 loops=1)
```

- `cost=0.00..18.50` — planner's estimate (start..total).
- `rows=1` vs `actual rows=42000` — **stale stats**, fix immediately.
- `loops=1` — how many times this node ran (high in nested loops).

## 7.8 Buffer pool, page cache, and how disk I/O actually works

Databases don't read rows; they read **pages** (typically 8 KB in Postgres, 16 KB in InnoDB). The page is the unit of caching, locking, and I/O.

```
   Query ─▶ Buffer Pool (RAM)   ─── hit ──▶ done
              │
              │ miss
              ▼
           OS Page Cache (RAM)  ─── hit ──▶ load into buffer pool
              │
              │ miss
              ▼
           Disk (SSD/NVMe)      ─── ~100 µs ──▶ load
```

### Buffer pool — the DB's own cache

- Sized by `shared_buffers` (Postgres) or `innodb_buffer_pool_size` (MySQL).
- Eviction: usually **CLOCK-sweep** (an LRU approximation that's cheap on multi-core).
- Postgres deliberately stays smaller than RAM and lets the OS page cache do double-buffering; MySQL recommends 70–80 % of RAM.
- Hit ratio target: **> 99 %** for OLTP. Anything under 95 % means undersized buffer pool or queries scanning too much.

### fsync, group commit, and the durability cost

Every committed transaction must reach **non-volatile** storage before the client gets an ack:

```
   COMMIT ─▶ write WAL record to OS ─▶ fsync(WAL) ─▶ ack client
                                        ▲
                                        │ slowest step:
                                        │   SSD: ~50–200 µs
                                        │   HDD: ~5–10 ms
                                        │   network EBS: 1–5 ms
```

**Group commit** — multiple concurrent txns share one `fsync`. Modern DBs do this automatically; throughput scales nearly linearly with concurrency until the disk is saturated.

**`synchronous_commit = off` (Postgres)** — don't `fsync` on commit. Throughput rockets; you can lose the last second of writes on a crash. Acceptable for non-critical writes (analytics events); never for money.

### Page cache + buffer pool double-buffering

On Linux, files go through the OS page cache. Postgres reads land in *both* the buffer pool and the page cache. Wasteful in RAM but means a buffer-pool miss is usually still a RAM hit. MySQL InnoDB does **direct I/O** to avoid the duplication.

## 7.9 Transactions across services — Saga pattern

In microservices, a logical transaction spans multiple databases. ACID across them is hard (2PC is slow and fragile). **Saga** breaks the transaction into local steps with compensating actions.

```
   Place Order Saga:
     1. reserve inventory   ←─ compensate: release inventory
     2. charge card         ←─ compensate: refund
     3. create shipment     ←─ compensate: cancel shipment
   If step 3 fails, run compensations 2, 1 in reverse.
```

### Choreography vs orchestration

```
   CHOREOGRAPHY                          ORCHESTRATION
   ────────────                           ─────────────
   Each service publishes events;        A central orchestrator
   others react.                         (e.g., Temporal, Cadence,
                                        AWS Step Functions, Camunda)
   No central truth.                     calls each service explicitly.

   Pros: loose coupling.                 Pros: visible flow, retries,
   Cons: emergent behaviour,             timeouts, state machine.
         hard to debug "who ran what?".  Cons: orchestrator is a
                                              coupling point.
```

### Saga state machine

```
   PENDING ─▶ INVENTORY_RESERVED ─▶ PAYMENT_DONE ─▶ SHIPPED ─▶ DONE
                       │                  │              │
                       │                  │              └─▶ COMPENSATING_SHIP
                       │                  └─▶ COMPENSATING_PAY
                       └─▶ COMPENSATING_INV
```

Persist this state machine in a DB (or a workflow engine). On crash, recover and continue from the last known step.

### Hard rules

- **Compensations must be idempotent.** You'll retry them; double-cancellations must be no-ops.
- **Compensation isn't always possible** (you can't "un-send" an email). Either avoid the step until you're sure, or add an explicit follow-up ("oops" email).
- **No assumption of order** — the orchestrator may receive events out of order on retries.

## 7.10 N+1 query problem

```
   bad:                              good:
   orders = db.query("SELECT...")    orders = db.query(
   for o in orders:                      "SELECT ... JOIN users ...")
       u = db.query("SELECT user")
                                      OR  use ORM's eager-load / batch IN
   1 + N queries — kills latency.    1 query.
```

Spot it in any code review with an ORM (ActiveRecord, Hibernate, Django ORM, Prisma).

### Three solid fixes

1. **JOIN** in the query — best when you actually need the related data on every row.
2. **`WHERE id IN (…)` batch** — fetch one query of related rows, group by FK in memory.
3. **DataLoader pattern** — defer all `getUser(id)` calls in a request tick, then issue one batched query. Standard in GraphQL.

### Detection

- ORM logs in dev (`ActiveRecord::LogSubscriber`, Django `connection.queries`).
- Tools like `pg_stat_statements` showing many identical, fast queries.
- APM (Datadog, New Relic) flame graphs.

## 7.11 MVCC and the Write-Ahead Log (WAL)

**MVCC (Multi-Version Concurrency Control)** is how modern RDBMS (Postgres, MySQL InnoDB, Oracle) let readers and writers coexist without locking each other.

> **Idea:** Every row update creates a *new version* tagged with a transaction ID. Readers see the version that was committed at their transaction's start; writers create new versions. Old versions are garbage-collected later (Postgres `VACUUM`).

```
   row id=5  (txn 100) name="Alice"
             (txn 110) name="Alicia"      ◀── visible to txns started after 110
             (txn 115) name="Alice T"
```

### Postgres VACUUM and the dead-tuple problem

Each update writes a *new* row; the old row becomes a "dead tuple." `VACUUM` reclaims their space; **autovacuum** runs it in the background. Skip it and:

- Table grows even when row count is stable (bloat).
- Queries scan dead tuples → slower.
- Eventually transaction-ID wraparound forces an emergency shutdown ("VACUUM to prevent wraparound").

**Hot updates (HOT)** — Postgres optimisation: if an update doesn't touch any indexed column *and* the new tuple fits on the same page, no new index entries are written. Massive write-amplification win for high-churn tables.

### WAL — durability + performance

Before mutating data pages on disk, append the change to a sequential log first. Two wins:

1. **Durability** — crash recovery replays the WAL.
2. **Performance** — sequential writes are ~100× faster than random page writes; data pages can be flushed in batches.

```
   COMMIT ─▶ append WAL record ─▶ fsync(WAL) ─▶ ack client
                                                   │
                                                   │ later (async)
                                                   ▼
                                             checkpoint flushes
                                             dirty pages
```

### Checkpoints

A **checkpoint** writes all dirty pages to disk so the WAL can be truncated. Too frequent → write storms; too rare → long crash recovery. Tunables: `checkpoint_timeout`, `max_wal_size`.

### WAL archiving and Point-in-Time Recovery (PITR)

Ship WAL segments to S3 / blob storage continuously. To restore: take the last base backup + replay WAL up to a target time. RPO can be seconds; RTO depends on replay speed.

This is the same idea as Kafka's log, Oracle redo logs, LSM-tree memtables, and SQLite journal mode. **Append-only logs are the universal building block.**

## 7.12 LSM-tree internals (Cassandra, RocksDB, LevelDB)

```
   write ──▶ memtable (in-RAM sorted map) + WAL
                │
                │ memtable full
                ▼
            flush ──▶ SSTable L0 (immutable, sorted on disk)
                          │
                          │ compaction
                          ▼
                       SSTable L1, L2, ... (merged & deduplicated)
```

| Aspect | LSM (Cassandra/RocksDB) | B-tree (Postgres/InnoDB) |
|--------|-------------------------|--------------------------|
| Write | Append → very fast | Update-in-place → slower |
| Read | May scan multiple SSTables → slower | One path down the tree → fast |
| Write amplification | High (compaction rewrites) | Low |
| Read amplification | Higher (multi-level) | Low |
| Space amplification | High during compaction | Low |
| Best for | Write-heavy, time-series | Read-heavy, OLTP |

### Compaction strategies

- **Size-Tiered (STCS)** — merge SSTables of similar size. Write-amp low, space-amp high. Cassandra default.
- **Leveled (LCS)** — each level is ~10× the previous; keys don't overlap within a level. Read-amp low, write-amp high. Used by LevelDB, RocksDB, Cassandra read-heavy tables.
- **Time-Window (TWCS)** — bucket by time window; never compact across windows. Perfect for time-series with TTL.

### Tombstones

Deletes write a "tombstone" marker; the row really disappears at compaction. Excessive tombstones (deleting whole partitions) tank read performance. Symptom: Cassandra "WARN: Read X tombstones".

### Bloom filters keep reads fast

Each SSTable has a Bloom filter so reads can skip files that definitely don't contain the key. Without them, every read would touch every SSTable. See §9.17 for the math.

## 7.13 Locking strategies — optimistic vs pessimistic

```
   PESSIMISTIC                            OPTIMISTIC
   ───────────                             ──────────
   BEGIN; SELECT ... FOR UPDATE;          read row + version
   ...do work...                          ...do work...
   UPDATE ...; COMMIT;                    UPDATE ... WHERE version = ?;
                                         if 0 rows affected → retry
   Holds lock during work — blocks         No lock — but write may fail
   concurrent writers. Good for high       and need retry. Good for low
   contention.                             contention.
```

Optimistic concurrency is the default in DynamoDB, Spanner, and most NoSQL systems. Pessimistic is still right for hot rows (inventory counters) or money transfers within one DB.

### Lock granularity

- **Row-level** — fine, concurrent-friendly, normal in InnoDB & Postgres.
- **Page-level** — coarser; less metadata; older SQL Server defaults.
- **Table-level** — DDL, certain MyISAM ops; kills concurrency.

### Lock modes

| Mode | Conflicts with | Use |
|------|----------------|-----|
| **S** (shared) | X | `SELECT … FOR SHARE` |
| **X** (exclusive) | S, X | `SELECT … FOR UPDATE`, normal write |
| **IS / IX** (intent) | conflicting table-level | DB internals |

### Deadlocks

Two txns each hold a lock the other wants:

```
   T1: lock A → wants B
   T2: lock B → wants A      ← deadlock
```

The DB detects this with a wait-for graph and aborts one txn. Application **must** handle the abort and retry. Prevent by:

- Always acquiring locks in a consistent order (lowest-id first).
- Keeping transactions short.
- Avoiding `SELECT FOR UPDATE` when an optimistic version check would do.

### Advisory locks

Application-defined locks the DB enforces but doesn't tie to any row. `pg_advisory_lock(key)` is perfect for "one worker runs this cron at a time."

## 7.14 Database internals you should be able to draw

```
   ┌─────────────────────────────────────────────────┐
   │ Query                                            │
   │   ↓                                              │
   │ Parser → AST → Planner → Optimizer → Executor    │
   │                                ↓                 │
   │                          Access methods          │
   │                  (B-tree / hash / seq scan)      │
   │                                ↓                 │
   │                          Buffer pool             │
   │                                ↓                 │
   │                          Storage + WAL           │
   └─────────────────────────────────────────────────┘
```

A query's life:

1. **Parse** — SQL text → AST. Reject syntax errors.
2. **Rewrite** — apply views, rules.
3. **Plan** — try plans, pick the lowest estimated cost.
4. **Execute** — open access methods, walk indexes, fetch pages from the buffer pool.
5. **Commit** — write WAL, fsync, release locks, ack.

Knowing this stack lets you reason about *why* `EXPLAIN ANALYZE` shows what it shows — and what to fix (missing index? bad plan? buffer cache cold? `fsync` slow?).

## 7.15 Connection pool sizing — a real formula

```
   pool_size = ((core_count × 2) + effective_spindle_count)
                                        (HikariCP guidance)

   OR via Little's Law:
   pool_size = QPS_per_db × avg_query_time_s × safety
```

The classic mistake: setting pool size to thousands "just in case." A pool too large causes thread contention inside the database server. Most prod systems land between **10 and 50** connections per app instance.

### pgbouncer / ProxySQL — the external pooler

When you have hundreds of app pods × tens of connections each, you reach Postgres's `max_connections` quickly. Solution: a **shared pooler** between app and DB.

| pgbouncer mode | What's pooled | Trade-off |
|----------------|---------------|-----------|
| **Session** | one client → one DB conn for session lifetime | Safe; little pooling benefit |
| **Transaction** | DB conn returned to pool at COMMIT | Sweet spot; breaks server-side state (`SET`, prepared statements) |
| **Statement** | DB conn returned after each statement | Maximum pooling; no multi-statement txns |

**Transaction pooling** is the standard. Just don't expect session-scoped state to persist.

### Connection storms

App restarts → all pods reconnect → DB CPU spikes on auth + planning. Mitigations: connection warming, staggered rolling deploys, pooler in front.

## 7.16 Schema migrations at scale — the expand-contract pattern

For a small app, `ALTER TABLE` and restart. For an app with 24/7 traffic and millions of rows, *any blocking DDL is an outage.*

### The expand-contract dance

```
   Goal: rename column `email` → `email_address`

   1. EXPAND   add new column, dual-write from app
   2. BACKFILL copy old → new in batches
   3. MIGRATE  flip reads to new column
   4. CONTRACT drop old column
```

Each step is independently deployable, reversible, and non-blocking.

### Safe vs unsafe DDL (Postgres)

| Operation | Safe in prod? |
|-----------|---------------|
| `ADD COLUMN` (nullable, no default) | ✔ instant metadata change |
| `ADD COLUMN … NOT NULL DEFAULT …` (PG 11+) | ✔ instant; older PG rewrites the table — outage |
| `DROP COLUMN` | ✔ metadata change |
| `CREATE INDEX CONCURRENTLY` | ✔ no table lock |
| `CREATE INDEX` (without `CONCURRENTLY`) | ✘ table lock for the duration |
| `ALTER COLUMN … TYPE …` | usually ✘ table rewrite |
| `ADD CONSTRAINT NOT NULL` | ✘ scans whole table; use `NOT VALID` + `VALIDATE` |
| Rename | ✔ metadata; but breaks apps that still reference old name |

### Online schema-change tools

- **pt-online-schema-change** (Percona) — creates a shadow table, triggers copy writes, swaps. MySQL world standard.
- **gh-ost** (GitHub) — same idea but uses the binlog instead of triggers; lower load.
- **Postgres** has built-in `CREATE INDEX CONCURRENTLY`, `ALTER ... ADD CONSTRAINT NOT VALID`, partitioning — fewer external tools needed.

### Adding a `NOT NULL` column safely

```
   1. ALTER TABLE t ADD COLUMN status TEXT;              -- nullable, instant
   2. App writes both old + new with default 'active'
   3. Backfill old rows: UPDATE t SET status='active' WHERE status IS NULL
                         in batches of 10 K
   4. ALTER TABLE t ALTER COLUMN status SET NOT NULL;    -- now fast
```

## 7.17 Soft delete, audit, and temporal data

### Soft delete

```sql
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMPTZ;
-- queries always: WHERE deleted_at IS NULL
-- "delete" = UPDATE users SET deleted_at = now()
```

Pros: reversible, audit-friendly, no broken foreign keys.
Cons: every query needs the filter (use a view), partial unique indexes for re-using identifiers, GDPR "right to be forgotten" requires actual deletion.

### Audit tables

Capture every change for compliance:

```sql
CREATE TABLE users_audit (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  action TEXT NOT NULL,         -- 'insert' | 'update' | 'delete'
  changed_at TIMESTAMPTZ DEFAULT now(),
  changed_by TEXT,
  before JSONB,
  after JSONB
);
```

Triggered by row triggers, or done in the app, or via CDC (Debezium).

### Temporal / system-versioned tables

ANSI SQL:2011 feature. The DB itself versions rows; you query "as of" a time:

```sql
SELECT * FROM accounts FOR SYSTEM_TIME AS OF '2024-01-01';
```

Supported by SQL Server, MariaDB, DB2. Excellent for compliance and "show me yesterday's state."

### Event sourcing

Store *every change* as an immutable event; derive current state by replaying. Powerful for audit + time travel + rebuildable read models, but heavier upfront design. Pairs naturally with CQRS (§8.6).

## 7.18 Materialized views — pre-computed answers

A regular **view** runs its query every time. A **materialized view** stores the result on disk and updates it on refresh.

```sql
CREATE MATERIALIZED VIEW daily_sales AS
  SELECT date_trunc('day', created_at) AS d, sum(amount)
  FROM orders GROUP BY 1;

REFRESH MATERIALIZED VIEW daily_sales;            -- full
REFRESH MATERIALIZED VIEW CONCURRENTLY daily_sales; -- no read block, needs UNIQUE INDEX
```

### Refresh strategies

- **Full refresh** — recompute everything on a schedule.
- **Incremental** — recompute only what changed (Snowflake, Materialize, ClickHouse `AggregatingMergeTree`).
- **Triggered** — refresh on event; risky for hot tables.

**Use cases:** dashboard aggregates, leaderboards, geospatial heatmaps, fraud-feature stores.

## 7.19 Specialised databases — when generic SQL isn't enough

### Time-series (TimescaleDB, InfluxDB, ClickHouse, Druid, Prometheus)

Optimised for `INSERT` by timestamp, range queries, and aggregations over time windows. Features: automatic partitioning by time chunk, retention policies, continuous aggregates, compression of older chunks (often 20–30×).

### Search engines (Elasticsearch, OpenSearch, Solr, Meilisearch)

Inverted index, tokenisation, BM25 relevance scoring (§17.9), faceted aggregations, typo tolerance, geo, highlighting. Use them for **search** and **log analytics**; *don't* use them as a primary source of truth — they have eventual consistency, no transactions, and reindex cycles are expensive.

### Vector databases (pgvector, Qdrant, Pinecone, Weaviate, Milvus, Chroma)

Indexes for **approximate nearest-neighbour** search on high-dimensional embeddings.

- **HNSW (Hierarchical Navigable Small World)** — graph index, very fast queries, large memory.
- **IVF (Inverted File)** — clusters, then searches the closest clusters.
- **PQ (Product Quantization)** — compresses vectors to fit billions in RAM.

`pgvector` is the easy on-ramp (a Postgres extension); Pinecone / Qdrant / Weaviate scale further with their own infrastructure. Powers RAG, recommendation, semantic search.

### Graph databases (Neo4j, Neptune, DGraph, JanusGraph)

Native storage of nodes + edges; queries traverse instead of join. Cypher / Gremlin / SPARQL query languages. Win when your dominant query is "k hops away" (fraud rings, social graphs, knowledge graphs). For small graph queries, Postgres with recursive CTEs is fine.

### OLAP / columnar (BigQuery, Snowflake, Redshift, ClickHouse, Druid)

Store data **column-by-column** instead of row-by-row. Reading `SUM(amount)` over 1 B rows touches only the `amount` column. Add aggressive compression (10–30× on real data), massive parallelism, and vectorised execution — billions of rows aggregated in seconds. *Wrong* for OLTP (single-row writes are slow).

## 7.20 Backups, PITR, and database disaster recovery

### Backup types

| Type | What it captures | Restore granularity |
|------|------------------|---------------------|
| **Logical** (`pg_dump`, `mysqldump`) | SQL or per-row dump | Per-DB or per-table |
| **Physical** (`pg_basebackup`, snapshots) | On-disk files | Full instance |
| **Snapshot** (EBS, RDS, ZFS) | Block-level copy | Full volume |
| **Continuous** (WAL archive) | Every change since base | Any second since base |

### Point-in-Time Recovery (PITR)

```
   t0 ─── base backup ─── WAL_1 ─── WAL_2 ─── WAL_3 ─── now
                                                 │
                                                 └──▶ restore to "5 minutes ago"
                                                      = base + WAL_1..WAL_3 replayed
                                                        up to that LSN
```

### RPO and RTO

- **RPO** (Recovery Point Objective) — how much data you're willing to lose. Sync replica: 0. WAL archived every minute: 1 min.
- **RTO** (Recovery Time Objective) — how long restore takes. Snapshot restore: ~minutes. Logical dump for a 10 TB DB: hours.

### Rules of operationally-good backups

1. **3-2-1** — 3 copies, 2 media, 1 offsite (or one cross-region).
2. **Restore drills** — a backup you've never restored is hope, not a backup. Quarterly is the minimum.
3. **Logical + physical** — physical for fast full restore; logical for "we accidentally dropped one table" surgery.
4. **Air-gapped copies** — defends against ransomware that encrypts mounted backups too.
5. **Test the WAL gap window** — what happens if archiver is down for 30 minutes?

## 7.21 Database security essentials

- **Encryption at rest (TDE)** — managed by the DB engine or the storage layer (EBS, KMS). Defends against stolen disks.
- **Encryption in transit** — mTLS between app and DB. Don't rely on "we're in the same VPC."
- **Auth** — prefer **IAM/OIDC** over static passwords (AWS RDS IAM auth, GCP Cloud SQL IAM, k8s service-account → cert). Rotate what you must keep.
- **Row-Level Security (Postgres RLS)** — enforce "users only see their tenant's rows" *inside the DB*, so a broken WHERE clause in app code doesn't leak data.
- **Column-level encryption** — wrap SSNs, card numbers in app-layer envelope encryption with a KMS-managed key. The DB never sees plaintext.
- **Least-privilege roles** — app role can `SELECT/INSERT/UPDATE/DELETE`, not `DROP TABLE`. Migrations run as a separate role.
- **Audit logging** — `pgaudit`, MySQL audit plugin, cloud-managed logs streamed to a SIEM.
- **Network isolation** — DBs in a private subnet, ingress only from app SG. No public endpoint.
- **Backup encryption** — same KMS key boundary as the live DB.

## 7.22 Connection management & operational sins to avoid

- **Long-lived transactions** — block VACUUM and pile up locks. Kill anything > 30 s in OLTP.
- **`SELECT *`** in hot code paths — wastes IO, breaks index-only scans, breaks projections.
- **No statement timeout** — one runaway query holds connections and degrades the whole DB. Set `statement_timeout` per role.
- **No `idle_in_transaction_session_timeout`** — a stuck client with an open txn ages WAL and tombstones.
- **DDL during peak hours** — schedule windows or use online tools.
- **Ignoring the slow query log** — most production wins come from the top 10 queries by `total_time`. Read `pg_stat_statements` weekly.

---

# PART 8: DATABASE SCALING

> **The goal of this part:** climb the scaling ladder one step at a time, knowing the costs of every step. The biggest mistake at this layer is **skipping rungs** — going straight to sharding when a cache and a read replica would have bought you two more years.

## 8.1 The escape ladder

```
   Stage 1  one server                       ──▶ scale vertically
   Stage 2  add read replicas                ──▶ scale reads
   Stage 3  add a cache (Redis)              ──▶ offload hot reads
   Stage 4  partition by feature (federate)  ──▶ smaller DBs per service
   Stage 5  shard by key                     ──▶ scale writes
   Stage 6  multi-region, multi-master       ──▶ scale geography
```

**Climb only as high as you need.** Each step doubles operational complexity. Most apps live happily forever at Stage 2 or 3.

## 8.2 Vertical scaling — what you can actually buy

Before you shard, see how far one box gets you. Modern hardware is *embarrassingly* capable:

| Resource | Today's sweet spot | Top of the menu |
|----------|--------------------|-----------------|
| vCPU | 32–64 cores | 192 cores (Graviton4, EPYC Bergamo) |
| RAM | 256–512 GB | 24 TB (SAP HANA boxes) |
| Local NVMe | 4–8 TB | 60 TB+ |
| Network | 25–50 Gbps | 200 Gbps |

A well-tuned Postgres on a `m7i.16xlarge` (64 vCPU, 256 GB RAM, gp3 SSD) routinely sustains **50–100 K TPS** for OLTP workloads. **Most "we need to shard" claims dissolve once someone fixes a missing index and bumps `shared_buffers`.**

### Where vertical scaling tops out

- Single-writer ceiling — only one process commits to a partition.
- Memory copy fan-out — Postgres' MVCC visibility check has per-core cost.
- Backup / restore time — a 10 TB box takes a long time to restore.
- Blast radius — a single instance failing is the *entire* DB.

When you hit any of these, climb to Stage 2.

## 8.3 Replication — copies for reads and survival

> **Simple Explanation:** Copy the data to multiple servers so reads scale and you survive failures.

### Primary–replica (master–replica)

```
                ┌───────────┐    async/sync log shipping
   writes ────▶ │  PRIMARY  │ ───────────────────────────┐
                └───────────┘                            │
                      │                                  ▼
                      │ replicate                  ┌───────────┐
                      └────────────────────────▶   │ REPLICA 1 │ ◀── reads
                                                   └───────────┘
                                                   ┌───────────┐
                                                   │ REPLICA 2 │ ◀── reads
                                                   └───────────┘
```

### Sync vs async vs semi-sync

| Mode | Commit waits for | RPO | Throughput | Used by |
|------|------------------|-----|------------|---------|
| **Async** | Local WAL only | seconds of loss possible | Highest | Postgres default, RDS read replicas |
| **Semi-sync** | At least one replica's ack | small loss window | High | MySQL Group Replication, Postgres `synchronous_standby_names` with `synchronous_commit=remote_write` |
| **Sync** | Replica fsync ack | 0 (zero RPO) | Lower (RTT cost) | Postgres `synchronous_commit=on` with sync standby, Spanner, CockroachDB |

> **The trap:** "sync replication" between two AZs adds ~1 ms to every commit. Across regions it's 30–100 ms — usually unacceptable for OLTP. Use sync within an AZ for HA, async across regions for DR.

### Physical vs logical replication

- **Physical** — ship raw WAL bytes; replica is a byte-for-byte copy. Fast, simple, but replicas can't accept writes and must run the same major version.
- **Logical** — decode WAL into row-level events and replay. Selective (per-table), cross-version, cross-DB. Foundation of CDC (§10.10), zero-downtime upgrades, and zero-downtime sharding.

### Replication topology patterns

```
   Cascading replicas       Multi-source       Bidirectional (multi-master)
   ──────────────────       ────────────       ────────────────────────────
   P ─▶ R1 ─▶ R2 ─▶ R3      P1 ─▶ R                P1 ◀──▶ P2
                            P2 ─▶ R                conflict resolution
                            P3 ─▶ R                required
```

### Promotion, failover, and split-brain

A primary dies. You promote a replica. If the old primary comes back online before you fence it off, both think they're the leader — **split-brain** — and you get diverging writes that won't reconcile cleanly.

Defences:

- **STONITH** ("Shoot The Other Node In The Head") — power-off / network-isolate the old primary before promoting.
- **Fencing tokens** — every write carries a monotonically increasing token; the storage layer rejects writes with stale tokens (§9.12).
- **Quorum-based leader election** — etcd / ZooKeeper / Patroni / Stolon decide who is primary; clients trust the registry.
- **Connection re-routing** — apps don't hardcode primary IP; they ask the registry / use a VIP.

### Replica lag monitoring

```
   lag_bytes  = primary_LSN - replica_LSN          (Postgres)
   lag_seconds = age(now(), pg_last_xact_replay_timestamp())
```

Alert on lag > threshold *and* on the replica falling so far behind that WAL retention can't recover it (forcing a base backup re-clone).

## 8.4 Connection pooling at scale — the pgbouncer story

A typical Postgres box dies at **~500 active connections**. You have 200 app pods × 30-conn pool = 6 000 — boom. The fix is a shared pooler between app and DB.

```
   200 app pods ── 6000 conns ──▶ PgBouncer ── 100 conns ──▶ Postgres
                  (cheap on pool)             (real conns)
```

### Pooling modes

| Mode | Pool unit | Trade-off |
|------|-----------|-----------|
| **Session** | one client → one DB conn for session lifetime | Safe; almost no pooling benefit |
| **Transaction** | DB conn returned at COMMIT/ROLLBACK | Default sweet spot; breaks `SET`, server-side prepared statements, advisory locks |
| **Statement** | DB conn returned after each statement | Maximum pooling; no multi-statement txns |

**Transaction mode** is the standard. The app code should not rely on session-scoped state.

### Real-world tooling

- **PgBouncer** — the classic, ultra-lightweight Postgres pooler.
- **Odyssey** (Yandex) — newer, multi-threaded, transaction mode at scale.
- **AWS RDS Proxy** — managed, IAM-integrated, transparent failover.
- **ProxySQL** — the MySQL equivalent; also does query routing, mirroring.

### Connection storms

App restarts → all pods reconnect → DB CPU spikes on auth + plan caching. Mitigations: connection warming, staggered rolling deploys, pooler in front, `max_prepared_transactions=0` if you don't need 2PC.

## 8.5 Partitioning vs Sharding (often conflated)

- **Partitioning** — splitting a table within one database. *Vertical* = move columns to separate tables; *horizontal* = split rows by range or hash. **Same machine.**
- **Sharding** — putting partitions on *different machines*. **Different machines.**

```
   Sharding by hash(user_id) → 4 shards
   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
   │ shard 0 │ │ shard 1 │ │ shard 2 │ │ shard 3 │
   │ users   │ │ users   │ │ users   │ │ users   │
   │ hash%4=0│ │ hash%4=1│ │ hash%4=2│ │ hash%4=3│
   └─────────┘ └─────────┘ └─────────┘ └─────────┘
```

### Sharding strategies — what each gives you

| Strategy | How it routes | Pros | Cons |
|----------|---------------|------|------|
| **Range** | by key range (a–f, g–m, n–z) | Good for range scans | Hotspots if data is skewed (recent timestamps!) |
| **Hash** | `hash(key) % N` | Even distribution | Range queries hit *all* shards |
| **Geo** | by region | Locality, GDPR | Imbalanced regions |
| **Tenant** | by tenant / customer | Strong isolation, easy backups per tenant | Skew (one huge tenant) |
| **Composite** | `hash(tenant) → shard, then range within` | Best of both worlds | Most complex routing |
| **Directory** | lookup service maps key → shard | Most flexible, supports re-shard | Lookup is a SPOF + cache layer needed |

### Sharding's hidden costs

- **No cross-shard joins** (or they're slow scatter-gather).
- **No global secondary indexes** without extra plumbing (Spanner does it; most DBs don't).
- **No global uniqueness** — UUIDs / Snowflake IDs only.
- **Re-sharding** when you outgrow N is painful — see consistent hashing (§9.9).
- **Distributed transactions** across shards require 2PC, sagas, or a NewSQL engine.
- **Schema migrations** must run per-shard, with backward-compatible deploys (§8.13).

## 8.6 Read replicas — quick wins and the gotchas

Add 1–N replicas, route writes to primary, route reads to replicas. Best ROI step on the ladder — *until* you hit replica lag bugs.

### Read-your-writes pitfall

```
   user POSTs new comment ──▶ PRIMARY  (commit)
   user GETs feed       ──▶ REPLICA  (still lagging — comment missing!)
```

User refreshes, sees nothing, posts again → duplicate. Five common fixes (full list in §8.8):

1. **Sticky window** — for X seconds after a write, route this user's reads to the primary.
2. **Session pinning** — user → region → primary stays consistent.
3. **Read-after-write tokens** — write returns LSN; reads block until replica catches up.
4. **Sync replication for critical paths only.**
5. **Client-side optimistic UI** — show the user their own writes locally.

### Routing read traffic

- **Application-level** — code chooses primary vs replica per query. Explicit but invasive.
- **Proxy-level** — ProxySQL / RDS Proxy / Vitess routes based on parsed SQL (writes → primary).
- **DNS / load balancer split** — two connection strings, two pools.

## 8.7 Federation — split by feature, not by key

```
   user_db          orders_db         catalog_db
   (auth team)      (orders team)     (search team)
```

Smaller, owned by independent teams. Joins now happen in the app — accept it. Most microservice architectures end up here long before they reach sharding.

**Trap:** "every microservice has its own DB" sometimes degenerates into a **distributed monolith** where every endpoint calls 6 services. Don't federate boundaries that don't match your domain.

## 8.8 CQRS — separate read and write models

**Command Query Responsibility Segregation.** Writes go to one model (normalized, transactional). Reads come from a different model (denormalized, fast). The two are kept in sync via events.

```
                   ┌─── write model (Postgres) ◀──── commands
   client ◀──reads── read model (Elasticsearch) ◀──── events
```

Great for systems where reads vastly outnumber writes and need different shapes (search, dashboards, leaderboards, activity feeds).

### Read-your-writes consistency strategies (revisited)

1. **Read-from-primary for X seconds after a write** (sticky-window).
2. **Pin sessions to a region** — user's reads + writes go to the same primary.
3. **Monotonic-read tokens** — write returns a version; reads pass it; replica blocks until caught up.
4. **Synchronous replication for critical paths only** (e.g., account balance) and async for the rest.
5. **Client-side cache of own writes** — show the optimistic UI value until next refresh.
6. **Causal-consistency middleware** — store the last LSN the client saw in a cookie; route to a replica that has caught up to it.

## 8.9 Materialised read paths and pre-aggregation

For read-heavy aggregations (counts, top-N, leaderboards), don't compute on read:

- **Materialised views** (§7.18) — DB-managed refresh.
- **Streaming aggregators** — Kafka Streams / Flink / Materialize update aggregates incrementally as events arrive.
- **App-maintained denormalised counters** — `INCR likes:post:42` in Redis on every like event; periodically reconciled with the source.

The cost is **eventual consistency** of the read model. The win is *constant-time* reads at any scale.

## 8.10 Online resharding — the hardest distributed chore

When N shards become too few, you must split without downtime. Standard playbook:

```
   1. Add new (empty) shard servers
   2. Dual-write to old and new for the migrating keys
   3. Backfill historical data from old → new (in batches)
   4. Verify (checksums, row counts, sample queries)
   5. Switch reads to new
   6. Stop writes to old
   7. Decommission old shard
```

Vitess (YouTube → Slack, Etsy, Shopify), Stripe, and Discord have all written extensively about this dance. **Consistent hashing + virtual nodes** minimise the data that has to move (see §9.9).

### Case study: Vitess (YouTube → CNCF)

```
   ┌──────────────────────────────────────────────────────────┐
   │  VTGate     ── parses + routes SQL                       │
   │     │                                                    │
   │     ▼                                                    │
   │  VTTablet   ── one per MySQL shard; failover, backups    │
   │     │                                                    │
   │     ▼                                                    │
   │  MySQL      ── unmodified                                │
   │     │                                                    │
   │  Topology   ── etcd / ZooKeeper holds metadata           │
   └──────────────────────────────────────────────────────────┘
```

Adds **VReplication** (logical replication built on MySQL row-based binlogs) so resharding is a guided workflow: spin up the new shards, replicate, cutover, drain.

### Case study: Citus / Hydra (Postgres)

Distributes Postgres tables across worker nodes by a distribution column. The coordinator parses, plans, and pushes down. Reshard online by `master_copy_shard_placement`.

## 8.11 Hot key / hot shard mitigation

Even with hash sharding, the world is uneven: one celebrity, one viral post, one Black-Friday SKU.

```
   reads on key=42 ─▶ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ◀── shard 2 melts
                     ░               ░
                     ░   shard 0     ░  shard 1  ░  shard 3
```

### Mitigations

- **Cache the hot key** — a CDN edge / Redis layer in front; even a 1-second TTL collapses 100 K RPS into 1 RPS at the DB.
- **Read replicas for the hot shard** — scale reads.
- **Salt the key** — split the hot row into `key#1`, `key#2`, … `key#N`; writers pick at random; readers fan-out. Used by Twitter for celebrity timelines.
- **Sequential-ID problem** — `now()`-prefixed keys make every write land on the newest shard. Use **hash-then-time** keys (UUIDv7 reverses this thoughtfully) or a leading random byte.
- **Adaptive routing** — load balancer detects hot shards and re-routes the next request to a replica.

## 8.12 Choosing a shard key — the decision that's hard to undo

Three properties of a good shard key:

1. **High cardinality** — millions of unique values, so load spreads.
2. **Even access pattern** — no single key should attract a hotspot.
3. **Co-locality** — values that need to be read together should land on the same shard (avoid cross-shard joins).

Bad shard keys: `status`, `country`, `created_date` (range scans turn into hotspots). Good: `user_id`, `tenant_id`, `hash(user_id) + bucket`.

> **You almost never get to change a shard key without a multi-month migration.** Spend a week deciding.

### A two-test checklist before committing

- **Skew test** — run last month's access log against the candidate key; is any single shard > 2× the average?
- **Co-locality test** — does your hottest join (orders ⨝ line_items) split across shards? If yes, pick a compound key like `(user_id, order_id)`.

## 8.13 Schema migrations across shards

Schema migrations are scary on one DB. On 64 shards they're a deployment plan:

```
   1. Roll out app version V2 — knows both old and new schema
   2. For each shard in parallel batches (e.g., 8 at a time):
         a. Apply DDL (online tool: gh-ost / Vitess workflow)
         b. Verify
         c. Move on
   3. Roll out app version V3 — assumes new schema only
   4. Drop the deprecated parts (V4)
```

This is the **expand-contract** pattern (§7.16) applied across shards. **App must be tolerant of mixed schema state for the duration.**

### Per-shard rolling upgrades

- Always keep one replica per shard untouched, so you can fail back.
- Cap the number of in-flight migrations (resource pressure on the coordinator).
- Monitor replication lag *per shard*; a single slow shard can block the wave.

## 8.14 Distributed transactions without 2PC

- **Percolator** (Google, original BigTable transactions) — optimistic 2PC over Bigtable; powered the original web index.
- **Calvin** — pre-determine an order, then apply deterministically on all replicas (FaunaDB).
- **Sagas** (§7.9) — give up atomicity, embrace compensation.
- **Outbox + CDC** (§10.10) — local atomic write to DB + outbox table; CDC publishes to other systems eventually.
- **Spanner / CockroachDB** — TrueTime or hybrid logical clocks + Raft per range. SQL transactions across continents at the cost of commit latency.

For most production systems, **sagas + outbox** is the modern, scalable answer.

## 8.15 Spanner & TrueTime — strong consistency at planetary scale

Google's Spanner (a "CP" system) is the canonical answer to "can we have ACID transactions across continents?"

```
   Magic ingredient: TrueTime
     • Atomic clocks + GPS in every datacenter
     • API returns TT.now() = [earliest, latest] with bounded uncertainty (~7 ms)
     • Transactions wait out the uncertainty window before committing
     • External consistency (linearizability) over the whole planet
```

### Architecture in one screen

```
   Client ──▶ Spanserver (manages tablets, runs Paxos groups)
                   │
                   ▼
              Colossus (distributed file system)

   Per "Paxos group": 1 leader + 4 followers across zones
   Cross-group txns: 2PC, with each group's leader as a participant
```

Implications: writes are slow-ish (commit wait), but reads (especially snapshot reads at a specific timestamp) are very fast and globally consistent. This is the trade-off Google made — and why **most** apps don't need it.

### Spanner-like open alternatives

- **CockroachDB** — Postgres wire protocol, Raft per range, hybrid logical clocks (no atomic clocks needed).
- **YugabyteDB** — Postgres compatibility on top of a Spanner-style storage layer.
- **TiDB** — MySQL compatibility on top of TiKV (Raft-backed KV store).

## 8.16 Multi-region database architectures

| Pattern | Writes from | Read latency | Write latency | Conflict resolution |
|---------|-------------|--------------|---------------|---------------------|
| **Active-passive** | Primary region only | Local only in primary; remote elsewhere | Local in primary, slow elsewhere | None (single writer) |
| **Active-active (per-region writes)** | Local in each region | Local everywhere | Local everywhere | LWW, CRDT, or app-level |
| **Geo-partitioned** | Local; each row pinned to a region | Local for owned data | Local for owned data | None (only one region owns each row) |
| **Strong-globally (Spanner)** | Anywhere | Local snapshot reads | Cross-region quorum | None (linearizable) |

### Concrete examples

- **DynamoDB Global Tables** — multi-master, async replication, LWW conflict resolution. Read-your-writes only within a region.
- **Spanner / CockroachDB / YugabyteDB** — strong consistency globally; writes pay cross-region latency.
- **Aurora Global Database** — async cross-region replication for DR + read-locality (under 1 s lag typical); writes still go to one region.
- **Cassandra DC-aware replication** — per-DC quorums (`LOCAL_QUORUM`) for low-latency local consistency; cross-DC is eventual.

### Geo-partitioning — the underrated pattern

For multi-tenant apps with geo-tied users (GDPR, data residency):

```
   tenant=EU rows   ──▶ EU region (sole owner)
   tenant=US rows   ──▶ US region (sole owner)
   tenant=APAC rows ──▶ APAC region (sole owner)
```

Each row has **one home**; writes are always local; cross-region reads are explicit and rare. Spanner, CockroachDB, and YugabyteDB all support this natively. Often the simplest answer to data sovereignty (§18.6).

## 8.17 Polyglot persistence — the right DB for each job

```
   ┌─────────────────────────────────────────────────────────┐
   │ User accounts        → Postgres (ACID, relational)       │
   │ Session / cache      → Redis                              │
   │ Product catalog      → Elasticsearch (search) + Postgres │
   │ Activity feed        → Cassandra (write-heavy timeline)  │
   │ Recommendations      → Neo4j (graph) or vector DB        │
   │ Analytics            → BigQuery / Snowflake / ClickHouse │
   │ Logs                 → Loki / Elasticsearch              │
   │ Metrics              → Prometheus / TSDB                 │
   │ Blob (images/video)  → S3                                │
   │ Embeddings / RAG     → pgvector / Qdrant / Pinecone      │
   └─────────────────────────────────────────────────────────┘
```

This is the real-world architecture of almost every web-scale company. Each store is chosen for its access pattern, not by ideology.

**Cost:** more systems to learn, monitor, back up, and secure. Don't introduce a new datastore for less than ~1 strong technical reason.

## 8.18 Disaster recovery for databases

| Strategy | RPO | RTO | Cost |
|----------|-----|-----|------|
| **Daily snapshot to same region** | 24 h | 1–4 h | $ |
| **Daily snapshot to another region** | 24 h | 1–4 h | $$ |
| **PITR with WAL archive** | seconds–minutes | 10 min – hours | $$ |
| **Cross-region async replica** | seconds (lag) | minutes (promote) | $$$ |
| **Cross-region sync replica** | 0 | minutes | $$$$ (write latency) |

### The DR runbook elements no one prepares until it's too late

- **Connection string switch** — DNS update, runtime config flag, app restart? Pre-write the playbook.
- **App reconfiguration** — schema versions, region-local secrets, feature flags.
- **Verification** — what query proves the new primary is healthy?
- **Replica re-pointing** — old replicas now follow the new primary?
- **Communication** — who tells customers, SRE, support?
- **Failback** — how do you migrate back when the original region is healthy?

### Drills, not docs

A DR runbook you've never executed is fiction. Quarterly game-days with real failover (in staging at minimum, in prod ideally) are the only thing that turns the runbook into a muscle.

---

# PART 9: DISTRIBUTED SYSTEMS THEORY

> **Why theory matters here:** every painful distributed-systems bug has a theoretical name. Once you can name the failure mode — split-brain, clock skew, partial failure, head-of-line blocking, write skew, hot key — you can search for the cure other people already published. This part is the vocabulary you need to talk about, debug, and design distributed systems.

## 9.1 The 8 Fallacies of Distributed Computing

Before any theorem, the lived experience. Peter Deutsch's classic list (1994) — every distributed-systems bug ultimately traces to assuming one of these is true:

1. The network is reliable.
2. Latency is zero.
3. Bandwidth is infinite.
4. The network is secure.
5. Topology doesn't change.
6. There is one administrator.
7. Transport cost is zero.
8. The network is homogeneous.

If you catch yourself writing code that *would only work* if one of these were true (e.g., "we'll just synchronously call service X — it's always up, right?"), step back.

## 9.2 CAP Theorem

> **Official Definition (Brewer, 2000; proved by Gilbert & Lynch, 2002):** In a distributed data store, you can guarantee at most two of *Consistency, Availability, Partition tolerance.*

In practice the network *will* partition, so the real choice is **CP vs AP** when a partition happens.

```
                        Partition occurs
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
         CP system                        AP system
         (e.g., HBase,                    (e.g., Cassandra,
          MongoDB w/                       DynamoDB, Riak)
          majority writes,
          Spanner)
         "I will refuse                  "I will serve, possibly
          to answer rather                with stale data, and
          than be wrong"                  reconcile later"
```

**Common misconception:** "I pick CA." There is no CA system in a real network — if you don't tolerate partitions, you don't have a distributed system, you have a single computer.

### Sloppy uses of CAP to avoid

- "Postgres is CA." → No. A single-node Postgres isn't a distributed system. A Postgres + sync replica *is* CP.
- "Cassandra is AP." → True only at its default consistency level (`ONE`). At `ALL` it's CP. CAP is **per operation**, not per database.
- "MongoDB is AP." → It's CP at `majority` write concern (the modern default); AP at `unacknowledged`.

The theorem is about behaviour *during a partition*. It says nothing about latency, throughput, or normal operation — for that, see PACELC.

## 9.3 PACELC — the more honest version

> **PACELC (Abadi, 2010):** If there's a Partition, choose A or C; *Else* (normal operation) choose between Latency and Consistency.

```
   PA/EL   Cassandra, DynamoDB, Riak      — favours availability and low latency
   PC/EC   Spanner, traditional RDBMS     — favours consistency always
            with sync replicas
   PA/EC   MongoDB (default config)        — chooses A in partition, C otherwise
   PC/EL   rare; some systems with         — strict consistency in partition,
            tunable consistency             low latency in normal ops
```

This captures the *daily* trade-off, not just the rare partition. Most apps live 99.9 % of their lives in the "E" branch — so the EL/EC choice often matters more than the PA/PC choice.

## 9.4 The Two Generals & Byzantine Generals problems

### Two Generals (a.k.a. Coordinated Attack)

Two generals on opposite hills must coordinate an attack. Only way to communicate is messengers through enemy territory (who may be captured). **Impossible** to guarantee both agree to attack.

**Implication:** With an unreliable network, you can never *guarantee* a message was received and the sender knows it was received. This is why **exactly-once delivery is impossible** — only "at-least-once + idempotency" (§3.21) or "at-most-once + accepted loss."

### Byzantine Generals

Same setup, but now some generals may be traitors who lie. Lamport proved: you need **3f+1 nodes** to tolerate `f` Byzantine (malicious) failures.

**Implication:** Public blockchains (Bitcoin, Ethereum) and Tendermint-style chains assume Byzantine nodes and pay 3× the cost. Inside a trusted datacenter you only need to tolerate *crash* failures, and Raft/Paxos suffice with **2f+1 nodes**.

## 9.5 Consistency models — the spectrum

```
   Strongest                                                Weakest
   ────────────────────────────────────────────────────────────────▶
   Linearizable  Sequential  Causal  Read-your-writes  Eventual
```

| Model | Plain English | Example |
|-------|---------------|---------|
| **Strict serializable** | Linearizable + serializable txns | Spanner, FaunaDB |
| **Linearizable** | Every op appears atomic at a single global instant | etcd, ZooKeeper, single-node Postgres |
| **Sequential** | Same order on every node, but not real-time | Single-master replication |
| **Causal** | If A happens-before B, every node sees A first | CRDTs, Bayou |
| **Read-your-writes** | You always see your own writes (others may lag) | Sticky-session systems |
| **Monotonic reads** | Once you've seen value v, you never see an older value | Many session-pinned systems |
| **Eventual** | Given no new writes, replicas converge | DynamoDB default, Cassandra `ONE` |

Higher consistency = more coordination = higher latency. Pick the weakest one your product can tolerate.

### Transaction isolation levels (the cousin spectrum)

Don't confuse the consistency spectrum (about replicas) with the isolation spectrum (about transactions):

| Level | Prevents | Allows |
|-------|----------|--------|
| **Read uncommitted** | Nothing | Dirty reads, etc. |
| **Read committed** | Dirty reads | Non-repeatable reads, phantoms, write skew |
| **Repeatable read / Snapshot** | Non-repeatable reads | Phantoms (sometimes), write skew |
| **Serializable** | Everything | (Real serial order) |

PostgreSQL's `serializable` = SSI (§7.4). MySQL's `repeatable read` ≈ snapshot. Beware: snapshot isolation does *not* prevent **write skew** (the canonical example: two on-call doctors both ticking "off" because the system showed both as on, ending up with zero coverage).

## 9.6 Time, clocks, and ordering — the deep dive

Distributed systems don't share a clock. Every "what happened first?" question is non-trivial.

### Clock kinds

- **Wall clock (NTP-synced)** — drifts; jumps backward when re-synced; resolution ~ms; subject to leap seconds. **Never use for ordering or as a primary key.**
- **Monotonic clock** — never goes backward; resets per process. Use for measuring durations. **Never compare across machines.**
- **NTP** — keeps clocks within ~10–100 ms, sometimes seconds in cloud VMs. Has been the source of many catastrophic outages.
- **PTP** — datacenter-grade; sub-microsecond when configured (Meta uses it for its TSC stack).
- **TrueTime (Google Spanner)** — atomic clocks + GPS, exposes bounded uncertainty `[earliest, latest]` (~7 ms). Enables external consistency by **commit-wait**: txn waits out the uncertainty window before committing.

### Lamport timestamps

Each node has a counter `L`. Rules:

```
   On local event:        L := L + 1
   On send:               attach L to message
   On receive(msg, L_m):  L := max(L, L_m) + 1
```

Gives a **total order** consistent with causality, but you can't tell "concurrent" from "ordered."

```
   Process A:  ●1───────●2───────●3
                              \
                               \send
                                ▼
   Process B:                 ●4───●5
   (B receives at L=max(0,3)+1 = 4)
```

### Vector clocks

Each node maintains a counter **per node**. Send the whole vector. Compare component-wise:

```
   V1 < V2   iff every component of V1 ≤ V2 and at least one is strictly less
   Otherwise → concurrent (true conflict)
```

```
   A=[1,0,0] → A=[2,0,0] → send to B
                                  ↓
   B=[0,1,0] → B=[2,2,0]            ← merge: max per slot + own++
```

Lets you detect *real* concurrent updates (used by DynamoDB and Riak to flag conflicts for the application to resolve).

### Hybrid Logical Clocks (HLC)

Best of both worlds. Each timestamp = `(physical_time, logical_counter)`. Stays close to wall-clock time (good for human debugging) while preserving causality. Used in CockroachDB, YugabyteDB, MongoDB ≥ 3.6.

## 9.7 Consensus algorithms

> **Problem:** N nodes need to agree on one value even if some crash.

| Algorithm | Notable property | Used in |
|-----------|------------------|---------|
| **Paxos (1989)** | The classic; correct but hard to implement | Google Chubby, Spanner |
| **Multi-Paxos** | Paxos optimised for a stream of decisions | Many internal Google systems |
| **Raft (2014)** | Designed to be *understandable* | etcd, Consul, CockroachDB, TiKV, MongoDB replica sets |
| **Zab** | Atomic broadcast, primary-backup | ZooKeeper |
| **EPaxos** | Leaderless; tolerates leader skew | Experimental, research |
| **PBFT / Tendermint / HotStuff** | Tolerates *Byzantine* (malicious) nodes | Blockchains, Diem |

### Paxos in one page (the part that confuses everyone)

```
   Three roles per process: Proposer, Acceptor, Learner
   Two phases: Prepare/Promise then Accept/Accepted

   Phase 1 (Prepare):
     Proposer picks a unique ballot number n; sends Prepare(n) to acceptors.
     Acceptor: if n > any seen, reply Promise(n, prev_accepted_value); else reject.

   Phase 2 (Accept):
     If proposer has promises from a majority, picks v =
        (highest-ballot prev_accepted_value among promises, else proposer's choice)
     Sends Accept(n, v).
     Acceptor: if n is still the highest seen, store and reply Accepted.

   Once a majority has Accepted(n,v) → v is chosen forever.
```

Two proposers with overlapping ballots can ping-pong (livelock). Real systems use a **leader** (Multi-Paxos / Raft) to avoid the race.

### Raft in one paragraph

A leader is elected by majority vote. The leader sequences all writes into a log and replicates to followers. A write commits once a majority have it. If the leader dies, a new election (with randomised timeouts) picks another. That's it.

```
                       LEADER
                      ┌──────┐
   client ──write──▶  │  L   │ ──append entry──▶ followers ──ack──▶
                      └──┬───┘                       ▲
                         │ once majority acks         │
                         ▼                            │
                      commit ─── replicate commit ────┘
```

### Why not 3PC?

Three-phase commit adds a "pre-commit" phase to avoid 2PC's blocking. **But** it assumes no network partitions and bounded message delays — both of which are wrong in real networks. So in practice nobody uses 3PC. Modern systems use Raft/Paxos or sagas instead.

## 9.8 Raft — the algorithm in 6 rules

```
   1. There's at most one leader per term.
   2. Leader handles all writes; replicates entries to followers.
   3. An entry is "committed" once a majority of followers have it.
   4. A leader never overwrites or deletes entries in its log.
   5. If a follower's log is missing the leader's entry, it gets backfilled.
   6. Only nodes with up-to-date logs can win elections.
```

Two RPCs implement the whole protocol: `RequestVote` and `AppendEntries`. Used in etcd, Consul, TiKV, CockroachDB, MongoDB (replica set), Kafka KRaft, and many more.

### Sizing the cluster

```
   Tolerate f failures → need 2f + 1 nodes (crash failures only)
   Tolerate f Byzantine failures → need 3f + 1 nodes

   3 nodes  → tolerates 1 failure   (typical)
   5 nodes  → tolerates 2 failures  (sweet spot for prod etcd / ZK)
   7 nodes  → tolerates 3 failures  (rare; latency grows)
```

Even numbers gain nothing (4 nodes tolerate the same `f=1` as 3 but require *3* for quorum — strictly worse for write latency).

## 9.9 Consistent Hashing

> **Problem:** If you shard by `hash(key) % N` and N changes, almost every key moves. Disaster for caches.

> **Idea:** Map both keys and servers onto a circular hash ring. A key belongs to the next server clockwise. Adding/removing a server only affects keys in its arc.

```
                   ┌──── hash ring (0…2³²) ────┐
                   │                             │
              S1 ●                                  ● S2
                   │                             │
                   │      ● keyA                 │
                   │              ● keyB         │
                   │                             │
              S4 ●                                  ● S3
                   │                             │
                   └─────────────────────────────┘
   Add S5: only the arc between S4 and the next CW server is reassigned.
```

**Virtual nodes (vnodes):** to avoid imbalance, each physical server is placed on the ring many times (e.g., 100 virtual positions). This smooths load and lets you give beefier servers more virtual nodes.

### Variants worth knowing

- **Jump consistent hash (Lamping & Veach, 2014)** — no ring at all, no memory; given `key` and `N`, returns the bucket directly. Minimal movement when N grows. Used in Google.
- **Rendezvous (HRW) hashing** — for each key, compute `hash(key, server)` for every server; pick the highest. Beautifully simple, slower for large N.
- **Maglev hashing (Google)** — table-based; lookup is O(1); used in their L4 load balancer.

Used in: Memcached client libs, Cassandra, DynamoDB, Riak, Akamai CDN, every CDN-like sharded cache layer ever shipped.

## 9.10 Quorum math — N, W, R

Dynamo-style systems give you knobs:

- **N** = total replicas of a key
- **W** = writes that must ack
- **R** = reads that must respond

> **Rule of consistency:** if **W + R > N**, every read sees the latest write (strong consistency for reads).
> **Rule of durability:** **W ≥ ⌈(N+1)/2⌉** to tolerate one minority failure without losing the write.

```
   N=3, W=2, R=2  →  W+R=4 > 3   strongly consistent (default Dynamo "quorum")
   N=3, W=1, R=1  →  W+R=2 ≤ 3   eventually consistent (fast, may be stale)
   N=3, W=3, R=1  →  fast reads, slow & fragile writes
   N=3, W=1, R=3  →  slow reads, fast writes
```

Tunable consistency per request — pick the trade-off that matches the operation (a tweet can be eventually consistent; a money transfer cannot).

### Sloppy quorum & hinted handoff

When some replicas are unreachable, **sloppy quorum** lets a write succeed on temporary "stand-in" nodes outside the preference list. The stand-in keeps a **hinted handoff** record and replays the write to the rightful owner when it returns. Improves write availability — but a *strict* `W+R>N` guarantee no longer holds.

## 9.11 Two-phase commit (2PC) and why it hurts

```
   Phase 1: Coordinator asks all participants "can you commit?" — they vote
   Phase 2: If all yes → commit; else → abort
```

**Failure modes:**

- Coordinator crashes mid-phase-2 → participants hold locks forever (blocking).
- A participant times out → ambiguous outcome until coordinator recovers.
- The protocol is *not* partition-tolerant: a network partition during phase 2 produces inconsistent state.

Modern systems prefer **sagas** (§7.9) or **consensus-backed transactions** (Spanner, Calvin) — both replace the coordinator's "single point of failure" with a Raft/Paxos group.

When 2PC *is* OK: short-lived, intra-datacenter, low-volume transactions where downtime on the coordinator is rare and recoverable (e.g., XA across two RDBMSs that both you and your DBA control). For internet-scale, choose another tool.

## 9.12 Distributed locks — the biggest "looks easy" trap

Use case: "only one worker may process job X at a time." Sounds trivial. Isn't.

### The three properties a lock must give you

1. **Mutual exclusion** — at most one holder.
2. **Deadlock-free** — if a holder dies, the lock eventually frees.
3. **Fault tolerance** — survives a node failure.

### Lease-based locks (the only correct pattern)

```
   1. Client asks lock manager for lock on key X with TTL.
   2. Lock manager returns (held=true, fencing_token=42, lease_until=t+30s).
   3. Client does work, periodically heartbeats to extend the lease.
   4. When done, client releases (or lease expires naturally).
```

### Fencing tokens — the missing piece

Even with leases, a GC pause can cause this:

```
   t=0   Client A acquires lock (token 14)
   t=1   Client A's JVM stops the world (long GC)
   t=35  Lease expires; Client B acquires (token 15) and writes
   t=40  Client A wakes up — thinks it still owns the lock — writes
   t=41  Two writers! Storage corruption.
```

**Fix:** the *storage* (not the lock manager) rejects writes with stale tokens.

```
   Storage tracks "highest token ever seen for key X"
   Client A's write with token 14 → rejected (highest seen is 15)
```

### Redlock controversy

Redis's "Redlock" tries to do distributed locking on top of 5 independent Redis nodes. Martin Kleppmann famously argued it's unsafe under clock drift and network delays; antirez (Redis author) pushed back. Net advice: **don't use Redis-based locks for correctness-critical operations**. Use them for performance optimisation (avoid duplicate work) where a rare double-execution is tolerable, paired with idempotency (§3.21).

### What to use instead

| Use case | Tool |
|----------|------|
| Strong correctness (only-one-writer to storage) | etcd, ZooKeeper, Consul, Postgres advisory locks, DynamoDB conditional writes |
| Best-effort dedup of background jobs | Redis SETNX with TTL + idempotency in the job |
| Cluster-wide leader election | etcd lease, ZooKeeper ephemeral node, Kubernetes Lease API |

## 9.13 Leader election & leases

Variations on locking, for picking one "primary" out of N candidates.

### How a leader election works (etcd-style)

```
   1. Each candidate writes a key /leader with a lease (TTL=10s).
   2. First writer wins (compare-and-swap on key absence).
   3. Winner heartbeats to renew lease.
   4. If winner dies, lease expires, key disappears, others race again.
```

### Why fencing tokens matter here too

Same problem as locks: the dethroned leader may not yet know. Every write the leader does should carry a monotonically increasing epoch / term number, and the storage layer rejects writes from stale epochs. **This is what Raft's `currentTerm` does built-in.**

### Pre-vote optimization

Naive election: if a network blip makes a follower think the leader is dead, it starts an election and bumps the term, forcing the real leader to step down. **Pre-vote** (Raft extension): candidate first asks "would you vote for me?" without bumping the term. Used by etcd and many production Raft impls to reduce churn.

## 9.14 Gossip, heartbeats, failure detection

How do nodes know who's alive in a cluster of thousands?

- **Heartbeat** — every node pings a known set every N ms. O(N²) at scale.
- **Gossip protocol** — each node periodically tells a random other node what it knows. Information spreads epidemically in O(log N) rounds. Used by Cassandra, Consul, Akka Cluster, HashiCorp Serf.
- **SWIM** — Scalable Weakly-consistent Infection-style Process group Membership. Faster failure detection by combining direct + indirect probes. Used by Consul / Serf.
- **Phi accrual failure detector** — outputs a *suspicion level* `φ` instead of binary up/down (more robust to flaky networks). Used by Cassandra, Akka.

### The detection latency / false-positive trade-off

```
   Short timeout → fast detection, more false positives ("flapping")
   Long timeout  → fewer false positives, slow detection
```

Phi accrual lets the *consumer* of the failure signal choose its tolerance (`φ_threshold`) without changing the detector.

## 9.15 Anti-entropy & Merkle trees

When replicas drift (network blips, dropped writes, hinted handoffs replayed), you need a way to find and repair the differences — without sending the whole dataset over the wire.

### Merkle trees to the rescue

```
                  root_hash
                /          \
            H(L)            H(R)
           /    \          /    \
         H1     H2       H3     H4
         |      |        |      |
        data1  data2   data3  data4
```

Two replicas compare root hashes. If equal → done. If different → descend into the differing subtree. **Only mismatched leaves are sent.**

Used in: Cassandra (`nodetool repair`), DynamoDB, Riak, Git (every commit is a Merkle DAG), Bitcoin/Ethereum (Merkle Patricia tries), every BitTorrent client.

### Read repair

Cheaper alternative: when a quorum read sees disagreeing replicas, write the latest value back to the stale ones in the background. Doesn't catch unread keys — pair with periodic full anti-entropy.

## 9.16 Chandy–Lamport distributed snapshots

> **Problem:** Capture a consistent global state of a running distributed system *without* stopping it.

### Algorithm in one paragraph

1. Initiator records its own state and sends a **marker** on every outgoing channel.
2. On receiving a marker on channel C, a process: records its state (if not already), records C as empty, and starts recording all *other* incoming channels.
3. A process stops recording channel C' when a marker arrives on C'.

The result: a consistent cut of the system — every message recorded was either fully delivered or fully in-flight, never "half-applied."

### Where you see this in production

- **Apache Flink savepoints** — exactly-once stream processing relies on Chandy-Lamport variants.
- **Distributed debugging** — capture a snapshot to reproduce bugs.
- **DB consistent backups** — many distributed DBs use snapshot algorithms for online backups.

## 9.17 Bloom filter

> **Simple Explanation:** A *probabilistic* "is this key in the set?" answer. Tiny memory. May say "yes" when the answer is no (false positive). *Never* says "no" when the answer is yes.

```
   bits: [0 1 0 1 1 0 1 0 0 1]
                ▲     ▲   ▲
   "alice"  k hash functions set these bits

   query "alice"  → all 3 bits set  → maybe present
   query "carol"  → one bit is 0    → DEFINITELY ABSENT
```

Used to:
- Skip disk lookups when the key clearly isn't in an SSTable (Cassandra, RocksDB).
- Skip checking if a username is taken before hitting the DB.
- Filter URLs already crawled.

Variants: **Counting Bloom** (supports delete), **Cuckoo filter** (better space, supports delete), **Quotient filter**, **XOR filter** (faster lookups, immutable).

### Bloom filter sizing math

For a Bloom filter with `n` elements and target false-positive rate `p`:

```
   bits needed:        m = -n × ln(p) / (ln 2)²
   optimal hashes:     k = (m / n) × ln 2  ≈ 0.693 × m/n

   Example: 1M items, 1 % false positive
            m ≈ 9.6M bits ≈ 1.2 MB
            k = 7 hash functions
```

**Sweet spot:** ~10 bits/element for 1 % FPR. If you can't afford that, accept a higher FPR (rarely a problem — false positives just trigger an extra real lookup).

## 9.18 Other probabilistic structures

- **HyperLogLog** — count distinct elements in ~12 KB with ~2% error (Redis `PFCOUNT`, BigQuery `APPROX_COUNT_DISTINCT`, Presto). Combine sketches via `PFMERGE` for distributed cardinality.
- **Count-Min Sketch** — frequency estimation in sublinear memory. "Heavy hitters" detection.
- **t-digest / DDSketch** — approximate quantiles (p99 latency) with bounded error. The defaults in Datadog, OpenTelemetry.
- **Top-K (Redis `TOPK`)** — track top N most-frequent items in a stream.
- **Reservoir sampling** — uniform random sample of an unbounded stream in O(k) memory.

These are the toolbox for "I need approximate answers fast" — a recurring system design need.

## 9.19 Vector clocks & Lamport timestamps (recap with examples)

Already covered in §9.6, but the worked examples are worth seeing once for memory.

### Lamport: pinned to "happens-before" but flattens concurrency

```
   A:  e1(L=1) ─▶ e2(L=2) ───────┐
                                 │ send msg(L=2)
   B:  e3(L=1) ─▶ e4(L=2) ─▶ e5(L=max(2,2)+1=3)
```

`L(e2) < L(e5)` truthfully tells us e2 happened-before e5. But `L(e2) > L(e3)` lies — they're concurrent.

### Vector clock: detects concurrency

```
   A:  V=[1,0] ─▶ V=[2,0] ─send─▶
                                 ▼
   B:  V=[0,1] ─▶ V=[2,2] (merged: max per slot + own++)

   Compare [1,0] vs [0,1]: neither dominates → concurrent
   Compare [2,0] vs [2,2]: [2,0] < [2,2]    → A's e2 happened-before B's e4
```

Cost: O(N) per timestamp for N nodes. Real systems prune old vectors or use HLC (§9.6) instead.

## 9.20 CRDTs — data types that merge themselves

> **Problem:** Concurrent updates on replicas without coordination → conflicts.
> **CRDT idea:** Use data structures whose merge function is associative, commutative, and idempotent. Apply ops in *any order* on *any replica* and they all converge.

| Type | Examples | Use case |
|------|----------|----------|
| **G-Counter** | Per-replica counter; merge = max per slot | Page-view counter |
| **PN-Counter** | Two G-Counters: +1s and −1s | Likes / dislikes |
| **LWW-Register** | Value + timestamp; latest wins | Simple K/V with last-write-wins |
| **OR-Set** | Observed-remove set with unique tags | Shopping cart |
| **RGA / WOOT / Yjs** | Sequence with positions | Collaborative text editing |
| **MV-Register** | Multi-value register | Dynamo conflict resolution |

### Two families

- **State-based (CvRDT)** — replicas exchange full state; merge is a join in a lattice. Simple but heavy.
- **Operation-based (CmRDT)** — replicas exchange operations; ops must commute. Lighter but requires a reliable broadcast.

CRDTs power Redis Enterprise multi-master, Riak, Automerge / Yjs (Google Docs-style real-time editing), Figma's multiplayer, and parts of Apple iCloud and Phoenix LiveView Presence.

## 9.21 Network-partition pathologies (Jepsen-style)

Kyle Kingsbury's **Jepsen** test suite has found correctness bugs in nearly every distributed database he's tested. The patterns recur:

### Common pathologies caught by Jepsen

- **Lost updates** under repeated network partitions when "last write wins" loses concurrent writes.
- **Stale reads** at consistency levels advertised as "strong" but defined loosely.
- **Split-brain** during leader elections — two leaders both accepting writes.
- **Linearizability violations** in supposedly-linearizable systems under specific GC + clock + partition patterns.
- **Read skew / G-anomalies** under snapshot isolation marketed as serializable.

### Defensive practice

- Read the Jepsen report for any DB you depend on (jepsen.io).
- Add chaos tests (Gremlin, Chaos Monkey) that inject partitions and verify invariants.
- Track invariants in production: idempotency counts, fencing-token rejections, replication lag, monotonicity checks.
- Default to *more* conservative settings (sync replicas, majority quorums) — relax only with measured need.

## 9.22 FLP impossibility — and what it means in practice

> **FLP theorem (Fischer, Lynch, Paterson, 1985):** In an asynchronous system with even *one* faulty process, no deterministic consensus protocol can guarantee termination.

In English: you can't have a consensus protocol that's *always* fast, *always* safe, and *always* live with even one crashed node — given a fully async network.

How real systems escape it:
- **Use timeouts** (assume "synchrony in practice") — Raft, Paxos.
- **Sacrifice liveness occasionally** — system pauses (rare leader election) rather than answering wrong.
- **Add randomization** — randomised election timeouts in Raft break ties.

The takeaway: every consensus protocol you'll use chooses **safety over liveness** when the network is partitioned. Reads/writes pause; they don't lie.

## 9.23 CAP in a nutshell — the decision table

```
   ┌─────────────────────────────────────────────────────────────┐
   │ During a partition…                                          │
   │                                                              │
   │ CP system (Spanner, HBase, etcd, ZK, MongoDB w/ majority):   │
   │   refuses writes on the minority side → strongly consistent │
   │   but partly unavailable                                     │
   │                                                              │
   │ AP system (Cassandra, DynamoDB, Riak):                       │
   │   accepts writes on both sides → fully available but reads  │
   │   may diverge and must be reconciled                         │
   │                                                              │
   │ "CA" is a marketing word, not an architecture.               │
   └─────────────────────────────────────────────────────────────┘
```

> **Idempotency tokens** in distributed flows are essential glue here — see §3.21 for the implementation pattern (cross-referenced to avoid duplicating).

---

# PART 10: MESSAGING & STREAMING

## 10.1 Why a queue?

> **Simple Explanation:** A queue is a buffer between a fast producer and a slow consumer, so producers don't wait. It also lets the consumer crash without losing work — the message stays until acknowledged.

```
   producer ──▶ [ msg msg msg msg msg ] ──▶ consumer
                       QUEUE
   Decouples them in time, in scale, and in failure.
```

Benefits: **decoupling**, **smoothing bursts**, **retry**, **at-least-once delivery**, **fan-out** (one producer → many consumer groups).

## 10.2 Queue vs Stream vs Pub/Sub

```
   QUEUE             STREAM (log)              PUB/SUB
   ───────           ─────────────              ────────
   Each msg          Messages live in           Each topic broadcasts
   delivered to      an immutable log;          to all subscribers; no
   one consumer;     consumers read from        notion of "consumed"
   removed when      offsets; can replay        — fire-and-forget
   acked.            history.
   SQS, RabbitMQ     Kafka, Pulsar, Kinesis     Redis pub/sub, GCP Pub/Sub
   Celery, ActiveMQ                             (note: GCP Pub/Sub is also
                                                a durable log; names vary)
```

## 10.3 Delivery guarantees — the three options

| Guarantee | Meaning | How |
|-----------|---------|-----|
| **At most once** | May lose, never duplicate | Fire-and-forget |
| **At least once** | Never lose, may duplicate | Producer retries until ack; consumer must be idempotent |
| **Exactly once** | Never lose, never duplicate | Hard! Needs transactional producer + dedupe (Kafka EOS, idempotent consumers) |

**Senior insight:** "exactly once" inside a messaging system + idempotent consumers is the only realistic way to get end-to-end exactly-once semantics.

## 10.4 Kafka in one diagram

```
   Producers ─▶ TOPIC (partitioned, replicated log) ─▶ Consumer groups
                ┌──────────────────────────────────┐
                │ Partition 0  [ 0 1 2 3 4 5 ... ] │
                │ Partition 1  [ 0 1 2 3 4 ... ]   │
                │ Partition 2  [ 0 1 2 3 4 5 6 ]   │
                └──────────────────────────────────┘
   Key concepts:
     • Partition = unit of parallelism & ordering
     • Offset    = consumer's bookmark
     • Replication factor across brokers
     • Consumer group = parallel consumers sharing partitions
```

## 10.5 Backpressure

When consumers can't keep up, the queue grows. Options:
- **Buffer** (queue grows) — until memory runs out.
- **Drop** — sample or shed.
- **Block** producer (push back via flow control — gRPC, Reactive Streams).
- **Spill to disk** — Kafka does this; SQS does it for free.

## 10.6 Ordering guarantees

Most queues only guarantee order *within a single partition / queue*. If you need global order, you give up parallelism. Common pattern: partition by a key that matters (e.g., `user_id`) so all messages for one user are ordered.

## 10.7 Dead-letter queues (DLQ)

Messages that fail processing N times go to a DLQ — kept aside for human inspection rather than blocking the main queue forever.

---

## 10.8 Kafka internals you should know

```
   ┌────────────────────────────────────────────────────────────┐
   │ Broker                                                      │
   │   ├─ Topic "orders"                                         │
   │   │    ├─ Partition 0 ── leader on broker A; replicas B, C  │
   │   │    ├─ Partition 1 ── leader on broker B; replicas A, C  │
   │   │    └─ Partition 2 ── leader on broker C; replicas A, B  │
   │   │                                                         │
   │ Producer ──▶ leader of partition (key-hashed)               │
   │ Consumer group ── each partition consumed by exactly one     │
   │                   member of the group at a time              │
   │                                                             │
   │ ISR (In-Sync Replicas) = replicas that are caught up         │
   │ acks=all + min.insync.replicas=2 ⇒ tolerates 1 broker loss   │
   └────────────────────────────────────────────────────────────┘
```

Key knobs:
- **`acks`** — `0` (fire-and-forget) / `1` (leader only) / `all` (durable).
- **`min.insync.replicas`** — refuse writes if fewer ISRs (durability gate).
- **Retention** — by time (`log.retention.hours`) or by size; Kafka isn't a queue, it's a log.
- **Compaction** — keep only the latest value per key (e.g., for state stores).

## 10.9 Exactly-once in Kafka — three pieces in concert

1. **Idempotent producer** — sequence numbers prevent duplicate messages on retry.
2. **Transactional producer** — atomically write to multiple partitions and commit consumer offsets together.
3. **Consumer in `read_committed` mode** — skips uncommitted (aborted) records.

```java
producer.beginTransaction();
producer.send(toTopic("a", record1));
producer.send(toTopic("b", record2));
producer.sendOffsetsToTransaction(offsets, consumerGroup);
producer.commitTransaction();   // all-or-nothing
```

This gives you exactly-once *within Kafka*. End-to-end exactly-once into a database still needs an **idempotent sink** (upsert by primary key, or write with an idempotency key).

## 10.10 The Outbox pattern and CDC

> **Problem:** A service must update its DB *and* publish an event. Dual-write to DB + message broker is non-atomic — one can succeed, the other fail.

```
   BEGIN;
     UPDATE orders SET status='paid' WHERE id=42;
     INSERT INTO outbox (event_type, payload) VALUES ('OrderPaid', '...');
   COMMIT;

   Separately: a relay (or CDC tool) reads outbox → publishes to Kafka → marks done.
```

**CDC (Change Data Capture)** with Debezium reads the database's WAL directly and produces Kafka events — no app-level outbox table required. Powers event-driven architectures without dual-write hazards.

## 10.11 Choosing between Kafka, RabbitMQ, and SQS

| | **Kafka** | **RabbitMQ** | **AWS SQS** |
|---|---|---|---|
| Model | Distributed log (replayable) | Broker queue (consume + ack) | Managed queue |
| Throughput | Millions/sec/cluster | ~50k/sec/node | Practically unlimited (managed) |
| Latency | Low (1–10 ms) | Very low (< 1 ms) | 10–100 ms |
| Ordering | Per partition | Per queue | FIFO queue (lower throughput) |
| Delivery | At-least-once (or EOS w/ txns) | At-least-once | At-least-once |
| Retention | Configurable (days/weeks) | Until consumed | 14 days max |
| Best for | Event streaming, replay, analytics | Complex routing, RPC | Simple decoupling, no ops |

## 10.12 Consumer rebalance — the surprise outage

When a Kafka consumer in a group joins or leaves, partitions are re-assigned. During the brief rebalance window, **no consumption happens**. With many partitions and large state, this can be seconds of lag.

Modern Kafka clients use **cooperative rebalancing** (incremental, only the changed partitions pause). Always set `partition.assignment.strategy=CooperativeStickyAssignor` for new deployments.

---

# PART 11: STORAGE SYSTEMS

## 11.1 Block vs File vs Object storage

```
   BLOCK          FILE                OBJECT
   ─────          ─────                ─────
   raw blocks     hierarchy of files   key → blob + metadata
   (AWS EBS)      (NFS, EFS)           (S3, GCS, Azure Blob)
   ───────        ───────              ───────
   ► DB volumes   ► Shared codebases   ► Anything web-scale
   ► VMs          ► Legacy apps        ► Backups, images, videos
   Low latency,   POSIX semantics      Cheapest, infinite scale
   not shared     (lockable)           Eventually consistent (mostly)
```

**Default for new systems:** object storage. Cheap, durable (11 nines on S3), and accessible from anywhere.

## 11.2 Distributed file systems

- **HDFS** — the Hadoop FS; large blocks (128MB+), write-once, optimised for sequential reads. Foundation of many data lakes.
- **Ceph / GlusterFS** — POSIX-compatible distributed FS.
- **Google Colossus** — successor to GFS; underpins Bigtable, Spanner.

## 11.3 Data lake vs Data warehouse vs Lakehouse

| | **Lake** | **Warehouse** | **Lakehouse** |
|---|---|---|---|
| Schema | On read | On write | On write but on cheap storage |
| Storage | Object store, cheap | Proprietary columnar | Object store + open formats |
| Workloads | ML, exploration, raw events | BI, SQL dashboards | Both |
| Examples | S3 + Parquet | Snowflake, BigQuery, Redshift | Databricks, Iceberg, Delta |

## 11.4 Hot vs Warm vs Cold storage

```
   HOT       SSD / Redis      µs latency    $$$$
   WARM      HDD / S3 Std     ms latency    $$
   COLD      Glacier          minutes-hours $  (compliance/backups)
```

Lifecycle policies move objects between tiers automatically (S3 Intelligent-Tiering).

## 11.5 Replication vs Erasure Coding

> **Problem:** How do you keep data durable when disks and nodes fail?

```
   3× REPLICATION                       REED-SOLOMON (10, 4)
   ─────────────                         ─────────────────────
   3 full copies                         10 data + 4 parity chunks
   3× storage cost                       1.4× storage cost
   Tolerates 2 disk failures             Tolerates 4 failures
   Reads & rebuilds simple               Rebuilds require 10 chunks (CPU + IO)
   Used for: hot data, RAM-tier          Used for: cold data, S3, HDFS, Ceph
```

Most cloud object stores use erasure coding for cold tiers to push storage cost near the theoretical minimum while still surviving multi-disk and even rack failures.

## 11.6 Cloud object storage consistency (S3 in 2020+)

For years, S3 was famously *eventually* consistent for list/overwrite. Since December 2020, **S3 offers strong read-after-write consistency** for all operations. This is important because it changes design patterns: you can safely "write then list" in workflows without sleep loops.

GCS and Azure Blob have been strongly consistent for years; designs targeting multiple clouds should not assume the loosest model.

## 11.7 Wide-column storage layouts — Bigtable & friends

```
   ROW KEY  →  COLUMN FAMILY : COLUMN  →  CELL (value, timestamp)
   "user42" →  "profile:name"          →  "Alice",   t=t1
                                          "Alicia",  t=t2  ← multiple versions
```

- **Sorted on row key** → lets you scan ranges efficiently.
- **Sparse** → undefined columns cost nothing.
- **Versioned** → time-series & history come free.
- Underpins Bigtable, HBase, Cassandra (logically), Accumulo.

Design rule for the Bigtable family: **the row key is the only thing you can query efficiently** — pick it carefully (often `userId#reverseTimestamp` to scan recent activity per user).

## 11.8 Object-store-as-database (the lakehouse era)

A surprisingly modern pattern: skip a database for analytical workloads and write **Parquet files into S3** (or GCS / ADLS) with a metadata layer like **Apache Iceberg** or **Delta Lake**.

```
   ┌──────────────────────────────────────────────────────┐
   │ Parquet files (columnar, compressed) on S3            │
   │   + Iceberg / Delta manifest (ACID, snapshots, schema)│
   │     ↓                                                 │
   │ Queried by Spark, Trino, DuckDB, Snowflake, BigQuery  │
   └──────────────────────────────────────────────────────┘
```

You get ACID, time travel, schema evolution, and cheap object-store storage — without locking into a proprietary warehouse. This is the foundation of every modern data lakehouse architecture.

---

# PART 12: DATA PROCESSING

## 12.1 Batch vs Stream

```
   BATCH                                STREAM
   ───────────────────────              ─────────────────────────
   Big chunks every N hours              Events processed as they arrive
   High latency (minutes-hours)          Low latency (ms-seconds)
   High throughput                       Throughput depends on partitioning
   Simpler reasoning                     Windowing & late events get tricky
   Spark, MapReduce, Airflow             Flink, Kafka Streams, Spark
                                         Structured Streaming
```

## 12.2 MapReduce — the idea, even if you never use it directly

```
   Input → [ MAP ] → key,value pairs → [ SHUFFLE+SORT ] → [ REDUCE ] → output

   Word count:
     Map:    "the cat sat" → (the,1) (cat,1) (sat,1)
     Shuffle: collect by key across all mappers
     Reduce:  (the, [1,1,1,...]) → (the, 47)
```

Conceptual ancestor of Spark, Beam, Flink, BigQuery.

## 12.3 Lambda vs Kappa architecture

```
   LAMBDA  — two paths, batch + speed, results merged
       events ──▶ batch layer (Hadoop)   ──┐
                                            ├─▶ serving layer
                ──▶ speed layer (Storm) ──┘
       Pro: handles late data via batch reprocess.
       Con: maintain two code paths.

   KAPPA   — one streaming pipeline; reprocess by replaying the log
       events ──▶ stream layer (Flink) ──▶ serving
       Pro: one codebase.
       Con: needs a durable replayable log (Kafka).
```

Most modern systems are Kappa-ish.

## 12.4 ETL vs ELT

- **ETL** (Extract-Transform-Load): transform *before* loading into the warehouse. Classic for expensive warehouses (Teradata).
- **ELT** (Extract-Load-Transform): load raw, transform inside the warehouse (dbt + Snowflake/BigQuery). The modern default.

## 12.5 Stream-processing concepts

- **Event time vs Processing time** — when it happened vs when you saw it.
- **Windows** — tumbling (fixed, non-overlapping), sliding (overlapping), session (group-by-gap).
- **Watermarks** — declare "events older than X are now too late."
- **Stateful operators** — joins, aggregations need to remember state (RocksDB inside Flink).

## 12.6 Exactly-once stream processing (Flink)

Flink achieves exactly-once via **distributed snapshots** (Chandy-Lamport algorithm, 1985):

```
   JobManager periodically injects a "barrier" into the stream
        │
        ▼
   Each operator, on seeing the barrier:
     1. Saves its state (RocksDB) to durable storage (S3 / HDFS)
     2. Forwards the barrier downstream
        │
        ▼
   When all operators ack the barrier ⇒ checkpoint complete
   On failure: restore from last completed checkpoint, replay from
   stored Kafka offsets, and continue. Result = exactly-once.
```

Combined with idempotent or transactional sinks, this gives end-to-end exactly-once for stream pipelines.

## 12.7 Stream-table duality

A profound idea from Kafka Streams: **a table is a snapshot of a stream of updates; a stream is a sequence of changes to a table.** You can convert freely between them.

```
   Stream of updates                       Materialized table
   ─────────────────                       ───────────────────
   (user42, "Alice")    ──aggregate──▶     user42 → "Alice"
   (user42, "Alicia")                      user42 → "Alicia"
   (user43, "Bob")                         user43 → "Bob"
   ◀────────────────  change log
```

Powers materialized views, CQRS read models, and event-driven joins.

## 12.8 Windowing in stream processing

```
   TUMBLING   |─5min─|─5min─|─5min─|         non-overlapping fixed windows
   SLIDING    |─5min─|                       overlapping; output every minute
                |─5min─|
                  |─5min─|
   SESSION    |──events──|  gap   |─events─|  bounded by inactivity gap
```

Pair with **watermarks** — a heuristic saying "no events older than T will arrive." Late events go to a side output (or are dropped).

## 12.9 Backfills, replays, and Lambda vs Kappa revisited

The killer feature of "Kafka-as-log + Flink" is **replayability**: bug in the logic? Roll back the consumer offset, fix the code, replay history. This is the practical reason most teams adopt Kappa over Lambda — one code path, replay-instead-of-batch.

## 12.10 Common stream-processing pitfalls

- **Skewed partitions** — one key (e.g., a celebrity's events) overwhelms one task. Pre-aggregate or two-stage shuffle.
- **State unbounded growth** — sessions never close, RocksDB fills disks. Use TTL state.
- **Watermark too aggressive** — late events silently dropped. Always emit a side output for late data.
- **Time-travel bugs** — using `processing time` for billing/audit (use event time always).
- **Checkpointing too rarely** — recovery replays hours of events. Tune interval to your tolerance.

---

# PART 13: RELIABILITY & FAULT TOLERANCE

## 13.1 Redundancy patterns

```
   ACTIVE-ACTIVE          ACTIVE-PASSIVE              N+1
   ─────────────          ─────────────               ────
   Both nodes serve       One serves; standby idle    N working,
   traffic at all times    until primary dies         +1 spare ready
   Fastest failover       Cheaper, slower failover   Common in racks
   Needs conflict          Common for stateful        and clusters
   resolution              services (DB primary)
```

## 13.2 Failover

```
   normal:    LB ──▶ primary  (replica idle)
   crash:     LB detects → promote replica → flip DNS / VIP

   Targets:
     RTO (Recovery Time Objective)  — how fast you must recover
     RPO (Recovery Point Objective) — how much data loss is acceptable
```

## 13.3 Retry strategies (and how to retry without crashing the world)

```
   Naive retry:           1s, 1s, 1s, 1s ...      — thundering herd
   Exponential backoff:   1s, 2s, 4s, 8s, 16s     — calms the herd
   + Jitter:              random ± 50%            — desynchronizes clients
```

Always: **exponential backoff + jitter + a cap + a max attempts**. AWS SDKs do this by default.

## 13.4 Graceful degradation

When something fails, return a *useful subset* rather than an error. Netflix shows you cached recommendations when the recommender is down. Reddit shows "served from cache" banner when DB is slow.

## 13.5 Chaos engineering

Deliberately break things in production to verify your system *actually* survives. Started by Netflix (Chaos Monkey kills random instances; Chaos Kong takes down a region). The discipline includes a hypothesis, a blast radius, and learning loops — it's *not* random destruction.

## 13.6 Disaster Recovery (DR) strategies

```
   Cold standby     Backups in another region, restore on demand     hours-days
   Warm standby     Smaller replica running, scale up on failover    minutes
   Hot standby      Full replica live, can take traffic now           seconds
   Multi-active     Both regions serving live traffic                 zero downtime
   ▲ cheap                                                              ▼ $$$$
```

## 13.7 Hedged requests — defeating the tail

> **Idea (Jeff Dean, "The Tail at Scale"):** Issue a request to one server; if it hasn't responded by some threshold (e.g., p95), send the *same* request to a second server. Use whichever responds first.

```
   t=0      ─▶ replica A
   t=p95    ─▶ replica B    (hedge)
   t=...    ◀── first response from either; cancel the other
```

Result: p99 collapses toward p50 at the cost of ~5 % extra requests. Used everywhere inside Google, BigTable, and Spanner clients.

## 13.8 Adaptive concurrency limits

> **Problem:** Static thread pools either over-provision (waste) or under-provision (queue collapse) under traffic spikes.

Netflix's **Vegas / Gradient2 algorithms** use TCP-inspired AIMD (additive-increase, multiplicative-decrease) on the concurrency limit: increase while latency is healthy, shrink on detected congestion. Result: graceful degradation rather than queue meltdown.

Built into AWS SDK retries, Envoy, and the Netflix `concurrency-limits` library.

## 13.9 Cascading failures and how systems die

```
   1. Downstream service slows down
   2. Upstream calls take longer → threads pile up
   3. Upstream connection pool exhausts → it rejects requests
   4. Its callers retry → traffic doubles or triples
   5. Healthy services downstream now overload too
   6. Whole system is on fire
```

Defences:
- **Circuit breakers** (§4.8) — fail fast when downstream is unhealthy.
- **Timeouts everywhere** — never an "infinite" call.
- **Retry budgets** — limit retries to e.g. 10 % of normal RPS.
- **Load shedding** — return 503 to *some* requests to save the rest.
- **Bulkheads** (§4.9) — isolate so one bad tenant can't drown the pool.
- **Backpressure** — push back upstream when overwhelmed.

> **Google SRE rule:** "A retry is the same as a new request." Every retry must obey the same rate limit.

## 13.10 Runbooks and game days

A **runbook** is a step-by-step doc for an oncall to follow when an alert fires: *symptom → diagnostic queries → mitigation → escalation.* Every alert without one is a half-built alert.

**Game days** (chaos drills) periodically test the runbook — and the team — under realistic incident pressure. Without practice, written DR plans rot silently.

## 13.11 Postmortems — the blameless culture

After every incident, write a **blameless postmortem**: timeline, contributing factors, action items. The goal is *learning*, not blame. Google's SRE book is the canonical reference.

## 13.12 Error budgets and freeze policies

```
   SLO    = 99.9 % over 30 days
   Budget = 0.1 % = ~43.2 minutes/month of allowable downtime

   If you've already burned the budget this month:
     • Feature freezes; only reliability work ships.
     • Force a postmortem-driven prioritization session.

   If you haven't burned any:
     • Take more risks; ship faster.
```

The budget is an **explicit currency** that aligns product velocity with reliability. It turns "should we ship?" from politics into math.

---

# PART 14: SECURITY

## 14.1 Authentication vs Authorization

> **Simple Explanation:** *AuthN* answers "who are you?" *AuthZ* answers "what can you do?" You log in (AuthN), then the system checks if you can delete that file (AuthZ).

## 14.2 OAuth 2.0 & OIDC (in plain English)

OAuth 2.0 is **delegated authorization**: "let app X access my data on Y without giving X my password."

```
   1. User clicks "Sign in with Google"
   2. App redirects to Google with a client_id and scope
   3. User logs in & consents
   4. Google redirects back with an authorization code
   5. App swaps the code for an access token (server-to-server)
   6. App uses the access token to call Google APIs on user's behalf
```

**OIDC** sits on top of OAuth and adds an ID token (JWT) that proves identity, not just access.

### Common grant types

| Grant | Use |
|-------|-----|
| **Authorization code + PKCE** | Web/mobile apps (modern default) |
| **Client credentials** | Service-to-service, no user involved |
| **Device code** | TVs, CLIs |
| ~~Implicit~~ / ~~Password~~ | Deprecated — don't use |

## 14.3 JWT (JSON Web Token)

```
   header.payload.signature      (Base64 url-encoded)
   ─────────────────────────
   {alg:HS256}.{sub:42,exp:...}.HMAC(header+payload, secret)
```

- **Stateless** — server doesn't store sessions; the token *is* the proof.
- **Signed**, not encrypted by default — don't put secrets in the payload.
- **Hard to revoke** — strategies: short TTL + refresh tokens, a blocklist of jti, or rotate signing keys.

**Use** for service-to-service or SPA APIs. **Avoid** if you need easy revocation (use server-side sessions or opaque tokens).

## 14.4 SAML

XML-based federation, common in enterprise SSO (Okta, AD FS). Heavier than OIDC, still everywhere in B2B.

## 14.5 Encryption — at rest vs in transit

- **In transit** — TLS 1.2+ (1.3 preferred). HTTPS, gRPC-TLS, encrypted database connections.
- **At rest** — disk-level (AWS EBS encryption), application-level (envelope encryption with KMS), column-level (encrypt PII fields).
- **End-to-end** — only the endpoints (not the server) can decrypt. Signal, WhatsApp.

### Hashing vs Encryption

```
   HASH    one-way; can't recover input         passwords (with salt+bcrypt/argon2)
   ENCRYPT two-way; needs key to recover        secrets, sensitive payloads
```

Never store raw passwords. Use **bcrypt / scrypt / Argon2** (slow on purpose) with a per-user salt.

## 14.6 OWASP Top 10 (web vulnerabilities)

1. **Broken access control** — users accessing what they shouldn't.
2. **Cryptographic failures** — weak crypto, missing TLS.
3. **Injection** (SQLi, NoSQLi, XSS) — untrusted input executed.
4. **Insecure design** — missing threat modelling.
5. **Security misconfiguration** — default creds, open S3 buckets.
6. **Vulnerable components** — out-of-date deps (log4shell).
7. **Identification & authN failures** — credential stuffing, weak MFA.
8. **Software & data integrity failures** — unsigned updates.
9. **Logging & monitoring failures** — can't detect breaches.
10. **Server-side request forgery (SSRF)** — server fetches attacker-controlled URLs.

### Quick defenses cheat-sheet

```
   SQL injection ─── parameterized queries / prepared statements (always)
   XSS ───────────── encode output, Content-Security-Policy headers
   CSRF ──────────── SameSite cookies, anti-CSRF tokens
   CORS ──────────── explicit allowlist; never "*" + credentials
   Clickjacking ──── X-Frame-Options / CSP frame-ancestors
   Rate-limit ────── per IP + per user + per endpoint
```

## 14.7 Zero-trust architecture

> "Never trust, always verify." No implicit trust just because a service is "inside the network." Every request is authenticated, authorized, and encrypted, even between internal services. Google's BeyondCorp pioneered this.

## 14.8 DDoS protection

Layers: **edge scrubbing** (Cloudflare, AWS Shield), **rate limiting**, **anycast** (absorb traffic across many POPs), **CAPTCHA challenges**, **WAF rules**. Critical: design for *graceful overload* — return 503s quickly rather than collapse.

## 14.9 Secrets management

Don't bake secrets into images, configs, or git. Use **Vault, AWS Secrets Manager, GCP Secret Manager** — fetch at runtime, rotate regularly, audit access.

## 14.10 mTLS — mutual TLS in detail

> **Regular TLS:** server proves identity (cert), client trusts it.
> **mTLS:** *both* sides prove identity with certificates.

Standard pattern inside zero-trust architectures:
- Every workload gets a short-lived X.509 cert (issued by an internal CA — e.g., SPIFFE/SPIRE).
- Service mesh (Envoy sidecar) terminates mTLS automatically — apps see plain HTTP.
- Identity is **cryptographic**, not "you're on this subnet."

This is how Google's internal services authenticate each other. Network position is *not* identity.

## 14.11 Cryptography primer for engineers

| Primitive | What it does | Common algos | Use |
|-----------|--------------|--------------|-----|
| **Symmetric encryption** | Same key encrypts / decrypts | AES-256-GCM, ChaCha20-Poly1305 | Bulk data after key exchange |
| **Asymmetric encryption** | Public encrypts, private decrypts | RSA, ECC | Key exchange, signatures |
| **Hash** | One-way digest | SHA-256, BLAKE3 | Integrity, content addressing |
| **Password hash** | Slow hash with salt | bcrypt, scrypt, Argon2id | Storing passwords |
| **HMAC** | Hash + secret key | HMAC-SHA256 | API request signing |
| **Digital signature** | Hash + private key | Ed25519, RSA-PSS | Software updates, JWTs |
| **Key derivation** | Stretch a key/password | HKDF, PBKDF2 | Derive session keys |

**Two iron rules:** never invent your own crypto, and never store passwords in anything other than bcrypt / scrypt / Argon2.

## 14.12 OAuth 2.0 Authorization Code + PKCE — step by step

PKCE (Proof Key for Code Exchange) protects public clients (mobile, SPA) where there's no client secret.

```
   1. Client generates:
        code_verifier  = random 43–128 char string
        code_challenge = SHA256(code_verifier) base64url

   2. Browser → /authorize?client_id=...&code_challenge=...&method=S256

   3. User logs in & consents → redirect with ?code=AUTH_CODE

   4. Client (mobile app) → /token  POST
        code=AUTH_CODE & code_verifier=...
      Server checks SHA256(code_verifier) == stored challenge

   5. Server returns access_token (short) + refresh_token (long)
```

A stolen auth code is useless without the original verifier. **Always use PKCE for SPAs and mobile apps.**

## 14.13 Key rotation and secret hygiene

- **Rotate** signing / encryption keys regularly (90 days is a common cadence; some Google services daily).
- Use **key IDs** in JWTs (`kid`) so multiple keys can validate during rotation windows.
- Encrypt secrets with a KMS (envelope encryption) — *the key encrypting your keys* never leaves the HSM.
- **Never log secrets.** Scrub logs of headers like `Authorization`, `Cookie`.
- Use short-lived tokens (minutes/hours), with refresh tokens stored securely.

## 14.14 Defence in depth

```
   ┌─────────────────────────────────────────────────────────┐
   │ Edge:    WAF, DDoS scrubbing, rate limits, geo blocks     │
   │ LB:      TLS termination, mTLS to backends, SNI routing   │
   │ App:     AuthN/Z, input validation, parameterized SQL     │
   │ Data:    Encryption at rest, KMS, row-level security      │
   │ Audit:   Tamper-evident logs, alerting on access patterns │
   │ Mgmt:    Least privilege, MFA, regular access review       │
   └─────────────────────────────────────────────────────────┘
```

If any one layer fails, the others still buy you time. "Trust nothing, verify everything."

## 14.15 Common attack patterns (and the line of code that stops each)

| Attack | One-line defence |
|--------|------------------|
| SQL injection | Use parameterized queries — *never* string-concat SQL |
| XSS | Encode user input on output: `escapeHtml(input)` |
| CSRF | `SameSite=Lax` cookies + anti-CSRF tokens on state-changing forms |
| SSRF | Allowlist outbound destinations; never fetch user-supplied URLs blindly |
| Insecure deserialization | Never deserialize untrusted JSON/YAML/Pickle into typed objects without schema validation |
| Timing attacks on tokens | Use constant-time comparison (`hmac.compare_digest`) |
| Mass assignment | Explicit field allowlist on input — never `Model.update(request.body)` |
| Open redirect | Validate the redirect URL is in an allowlist of paths |

## 14.16 Threat modelling (STRIDE)

Before you ship anything sensitive, walk through STRIDE:

```
   S poofing identity      → authentication, MFA
   T ampering with data    → integrity (HMAC, signatures, TLS)
   R epudiation            → audit logs, signed events
   I nformation disclosure → encryption, access controls
   D enial of service      → rate limits, autoscaling, shedding
   E levation of privilege → RBAC, least privilege
```

Five minutes per feature catches what fuzzing won't.

---

# PART 15: OBSERVABILITY

## 15.1 The three pillars

```
   ┌────────────────────────────────────────────────────────┐
   │ LOGS    — discrete events  ("user 42 logged in at T")  │
   │ METRICS — aggregates       ("requests/sec = 1200")     │
   │ TRACES  — request lifelines("svc A→B→C, 12ms total")   │
   └────────────────────────────────────────────────────────┘
```

You need all three. Logs tell you *what* happened, metrics tell you *how much*, traces tell you *where* the time went.

## 15.2 Metrics — Prometheus model

```
   counter   monotonically increasing             http_requests_total
   gauge     value that goes up and down          memory_bytes
   histogram bucketed distribution                request_duration_seconds
   summary   precomputed quantiles                request_duration_seconds
```

**Pull model** (Prometheus scrapes endpoints) vs **push model** (StatsD, OpenTelemetry collector). Modern stacks usually do pull for infra and push for application events.

## 15.3 Logs — structured > unstructured

```
   bad:   logger.info("user 42 paid $19.99 for order 7")
   good:  logger.info("payment", user_id=42, amount=19.99, order_id=7)
```

Structured logs (JSON) are queryable (`amount > 100`) and aggregatable. Centralize them via ELK (Elasticsearch + Logstash + Kibana), Loki, or a cloud logging service.

## 15.4 Distributed tracing

> **Problem:** request `req-123` touched 17 services. Which one was slow?

A trace is a tree of **spans**, each with start/end timestamps and a `trace_id`. Propagate the `trace_id` in HTTP headers (`traceparent` in W3C) so each service can attach its own spans.

```
   Trace req-123  (180ms total)
   ├─ frontend     5ms
   ├─ auth-svc     12ms
   ├─ orders-svc   145ms
   │   ├─ db.query 130ms  ◀── the culprit
   │   └─ cache    2ms
   └─ email-svc    18ms (async)
```

Tools: **OpenTelemetry** (the standard SDK/protocol), Jaeger, Tempo, Honeycomb, Datadog APM, Google Cloud Trace.

## 15.5 SLI, SLO, SLA — Google's reliability vocabulary

| Term | What it is |
|------|------------|
| **SLI** | Service Level *Indicator* — a measurement (e.g., availability = good responses / total) |
| **SLO** | Service Level *Objective* — your target (e.g., 99.9% over 30 days) |
| **SLA** | Service Level *Agreement* — contract with consequences if you miss SLO (refunds) |
| **Error budget** | 100% − SLO = how much failure you can spend before freezing releases |

If your SLO is 99.9% and you've already burned the month's budget, *stop deploying risky changes* and shore up reliability instead.

## 15.6 Alerting principles

- Alert on **symptoms** users feel (latency, error rate), not on causes (CPU > 80%).
- Every alert must be **actionable** — if a human can't do something, delete it.
- Page on **fast-burn SLO violations**; ticket on slow-burn.

## 15.7 Health checks (revisited for observability)

- **Liveness** — am I alive? If no, kill me (kubernetes restarts).
- **Readiness** — am I ready to serve? If no, take me out of the LB pool, but don't kill me.
- **Startup** — give slow-starting services time before liveness checks count.

## 15.8 RED and USE — two monitoring frameworks

| Method | Stands for | Best for |
|--------|------------|----------|
| **RED** | **R**ate, **E**rrors, **D**uration | Request-driven services (APIs) |
| **USE** | **U**tilization, **S**aturation, **E**rrors | Resources (CPU, disk, queue) |

A solid service dashboard has, *per endpoint*:
- **Rate** — requests / sec.
- **Errors** — error rate (count and %).
- **Duration** — p50, p95, p99 latency.

For each resource it consumes:
- **Utilization** — % busy.
- **Saturation** — queue depth or wait time.
- **Errors** — disk read errors, OOM kills, etc.

These two lenses together catch almost every incident.

## 15.9 Sampling strategies for traces

Tracing every request at high QPS is too expensive. Three strategies:

- **Head-based sampling** — decide at the entry point (e.g., 1 %). Simple, but you may miss the rare slow request.
- **Tail-based sampling** — keep the trace only after seeing the full request (e.g., keep all errors, all slow requests, plus 1 % of normal). Requires holding spans in memory briefly.
- **Probabilistic with priorities** — always keep errors and high-value endpoints; sample background traffic.

Modern tracers (Tempo, Honeycomb) lean tail-based. Useful telemetry > 100 % telemetry.

## 15.10 Metric cardinality — the silent killer

Each unique combination of label values is a separate time series. Add `user_id` as a label → millions of series → Prometheus OOM.

```
   Good:   http_requests_total{method="GET", status="200", route="/api/orders"}
   Bad:    http_requests_total{user_id="42", request_id="abc-..."}
```

Rule of thumb: keep cardinality < 100 k series per metric. Put high-cardinality fields in **logs or traces** (which are designed for it), not metrics.

## 15.11 OpenTelemetry — one SDK to rule them all

OTel is the vendor-neutral standard for emitting traces, metrics, and logs. The mental model:

```
   App code  ──▶ OTel SDK  ──▶ OTel Collector  ──▶ any backend
                                                    (Jaeger, Tempo,
                                                     Datadog, Honeycomb,
                                                     Prometheus, Loki, ...)
```

Adopting OTel decouples your code from your observability vendor — switch back-ends without touching app code. This is now the default in most new services.

## 15.12 The four golden signals (Google SRE)

For every user-facing service, dashboard the four:

1. **Latency** — how long requests take (split successful vs error).
2. **Traffic** — how much demand (RPS).
3. **Errors** — rate of failed requests.
4. **Saturation** — how "full" the service is (CPU, memory, queues).

If you measure only four things, measure these.

## 15.13 Trace context propagation (W3C `traceparent`)

```
   traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
                │  │                               │                 │
                │  trace-id (16 bytes hex)         span-id (8 bytes) flags
                version
```

Every service must propagate this header on outbound calls (HTTP, gRPC, Kafka). Without it, the trace breaks at the first hop. Modern SDKs (OTel) do it automatically — but if you have a homegrown HTTP client, you must inject it manually.

## 15.14 Exemplars — the bridge between metrics and traces

A histogram bucket records "1,247 requests took 500–600 ms." An *exemplar* attaches a sample `trace_id` to that bucket — so when you see a latency spike on the dashboard, you click and jump straight to a trace of one of the slow requests.

Supported by Prometheus, Grafana, and OTel. The single best feature for fast incident triage.

---

# PART 16: DEPLOYMENT & INFRASTRUCTURE

## 16.1 Containers — what changed

> **Simple Explanation:** A container packages your app + its dependencies into a runnable image that behaves the same on every machine. It's not a VM (no kernel of its own), but it feels like one.

```
   VM                              CONTAINER
   ┌────────────┐                   ┌────────────┐
   │   App      │                   │   App      │
   │   Libs     │                   │   Libs     │
   │   Guest OS │  ← heavy          ├────────────┤
   ├────────────┤                   │  Shared    │
   │ Hypervisor │                   │  Host OS   │
   ├────────────┤                   ├────────────┤
   │  Host OS   │                   │  Host OS   │
   └────────────┘                   └────────────┘
   GB image, minutes                MB image, seconds
   to boot                          to boot
```

Docker is the dominant image format and runtime.

## 16.2 Kubernetes — the minimum viable mental model

```
   ┌─────────────────────────────────────────────────────┐
   │ Cluster                                              │
   │   ├─ Control plane (API server, scheduler, etcd)     │
   │   └─ Nodes (workers)                                 │
   │        └─ Pods (1+ containers that share network)    │
   │             managed by Deployments / StatefulSets     │
   │             exposed via Services / Ingress            │
   └─────────────────────────────────────────────────────┘
```

What k8s gives you for free: scheduling, self-healing (restart crashed pods), rolling updates, secrets/configmaps, service discovery, autoscaling (HPA), declarative infra (YAML).

## 16.3 Service mesh

A sidecar proxy (Envoy) next to every pod handles mTLS, retries, circuit breakers, observability, and traffic shaping — *without changing app code*. Examples: Istio, Linkerd, Cilium.

```
   pod                                pod
   ┌─────────────┐                    ┌─────────────┐
   │ app  ──▶ sidecar ──── mTLS ────▶ sidecar ◀── app │
   └─────────────┘                    └─────────────┘
```

## 16.4 CI/CD

```
   Commit ──▶ CI (build + tests + lint + security scan) ──▶ artifact
       └─▶ CD (auto-deploy to dev → stage → prod with gates)
```

Practices: **trunk-based dev**, **small frequent commits**, **automated rollback**, **deployments multiple times per day**.

## 16.5 Deployment strategies

```
   ROLLING       replace 10% of pods at a time         Simple, slow rollback
   BLUE/GREEN    spin up green, flip LB                Instant rollback, 2× cost
   CANARY        send 1% → 5% → 25% → 100%             Risk-aware, needs metrics
   SHADOW        send mirrored traffic, drop response  Safe testing in prod
   FEATURE FLAG  deploy dark, enable per user/tenant   Decouple deploy from release
```

## 16.6 Infrastructure as Code (IaC)

Define infra in code (Terraform, Pulumi, CloudFormation), version it in git, apply via PRs. Eliminates "snowflake servers." Enables disaster recovery (rebuild the cluster from a repo).

## 16.7 Autoscaling

- **Horizontal Pod Autoscaler (HPA)** — add/remove pods based on CPU/memory/custom metrics.
- **Cluster Autoscaler** — add/remove nodes based on pending pods.
- **Vertical Pod Autoscaler** — change pod CPU/memory limits (rarely used at runtime).
- **Predictive autoscaling** — ML-based, scale up *before* the spike (e.g., daily peak).

Always scale on a **leading indicator** (queue depth, RPS) not a lagging one (latency).

## 16.8 GitOps

> **Idea:** Git is the source of truth. A controller continuously reconciles the cluster to match what's in the repo.

```
   Developer ──▶ PR ──▶ merge ──▶ ArgoCD/Flux detects change
                                       │
                                       ▼
                                  kubectl apply (declaratively)
                                       │
                                       ▼
                                  Cluster matches Git state
```

Benefits:
- **Auditable** — every change is a git commit.
- **Reversible** — `git revert` rolls back the cluster.
- **Disaster recovery** — rebuild a cluster by pointing the controller at the repo.

Standard tools: ArgoCD, Flux, Atlantis (for Terraform).

## 16.9 Progressive delivery — beyond rolling deploys

```
   ┌──────────────────────────────────────────────────────────┐
   │ Argo Rollouts / Flagger:                                  │
   │   1. Deploy new version as a "canary" alongside stable     │
   │   2. Route 1 % of traffic                                 │
   │   3. Check golden signals (latency, error rate)            │
   │   4. If healthy: 5 % → 25 % → 100 %                        │
   │   5. If unhealthy: instant rollback                        │
   └──────────────────────────────────────────────────────────┘
```

Pair with **feature flags** (LaunchDarkly, Unleash, OpenFeature) so the *deployment* and the *release* are decoupled — ship dark, flip on later, segment by user/tenant.

## 16.10 Kubernetes probes — get them right

```
   livenessProbe:    am I alive?            fails → kubelet restarts container
   readinessProbe:   am I ready to serve?   fails → removed from Service endpoints
   startupProbe:     am I done starting?    protects slow boots from liveness kill
```

Common mistakes:
- Using the same endpoint for liveness *and* readiness (a DB hiccup turns a load-shed event into a restart loop).
- Liveness probes that check downstream services (cascading failure).
- No startup probe on JVM apps → kubelet kills them mid-warmup.

## 16.11 Container best practices

- **Multi-stage builds** — keep final images small (`FROM ... AS builder` → `FROM distroless`).
- **Distroless or scratch base images** — fewer CVEs, smaller attack surface.
- **Non-root user** — `USER 1000` in your Dockerfile.
- **Pinned image digests**, not `:latest` (reproducible builds, security).
- **One process per container** — let the orchestrator manage processes.
- **Resource requests AND limits** — without requests, the scheduler can over-pack nodes; without limits, one pod can starve the rest.

## 16.12 Sidecar, ambassador, adapter — the three k8s patterns

```
   SIDECAR     auxiliary container in the same pod    log shipper, mesh proxy
   AMBASSADOR  proxy that wraps external calls         retries, circuit break
   ADAPTER     normalizes the app's outputs            metrics scraper, log fmt
```

The service mesh sidecar (Envoy) is the most famous example, but the pattern is general — anywhere you'd patch app code, consider a sidecar instead.

## 16.13 Statefulness — the elephant in the cluster

Kubernetes is great at stateless. For stateful (databases, brokers), it's *acceptable* but never effortless:

- **StatefulSets** — stable network IDs and persistent volumes per pod.
- **PersistentVolumes** — backed by EBS / PD / Ceph — failover requires the volume to be re-attachable.
- **Operators** — controllers that codify operational knowledge (Postgres-operator, Strimzi for Kafka, Vitess-operator).

Many teams (correctly) **run databases as managed services** (RDS, Cloud SQL, Aurora) and only run stateless workloads in K8s.

---

# PART 17: SEARCH & MISC BUILDING BLOCKS

## 17.1 Full-text search & inverted index

> **Idea:** Flip the table — instead of "document → words," build "word → documents that contain it."

```
   Documents:                       Inverted index:
   doc1: "the cat sat"              "cat"  → [doc1, doc3]
   doc2: "the dog ran"              "dog"  → [doc2]
   doc3: "the cat ran"              "ran"  → [doc2, doc3]
                                    "sat"  → [doc1]
   Query "cat AND ran" → intersect → [doc3]
```

Elasticsearch / OpenSearch / Solr / Lucene build on this with relevance ranking (TF-IDF, BM25), analyzers (tokenization, stemming), and aggregations.

## 17.2 Geo-spatial indexes

| Structure | How |
|-----------|-----|
| **Geohash** | Encode lat/lon to a string; prefix = nearby area | Redis GEO, Elastic |
| **Quadtree** | Recursively subdivide 2D space into 4 quadrants | Google Maps, Uber |
| **R-tree** | Hierarchical bounding rectangles | PostGIS |
| **S2** | Google's spherical geo-indexing (hierarchical cells) | Google Maps, Foursquare |
| **H3** | Uber's hexagonal grid | Uber dispatch |

"Find restaurants near me within 1 km" → geo-index lookup, not a full scan.

## 17.3 Distributed unique IDs

| Scheme | Looks like | Pros | Cons |
|--------|------------|------|------|
| **Auto-increment** | 1, 2, 3 | Simple, sortable | Centralized, doesn't shard |
| **UUIDv4** | random 128-bit | Decentralized, no coordination | Random → bad index locality |
| **UUIDv7** | time-prefixed UUID | Sortable + decentralized | Newer, library support |
| **Snowflake** (Twitter) | `[time][machine][seq]` | Sortable, k-sorted | Needs machine ID coordination |
| **ULID** | crockford base32 | Sortable + URL-safe | Slightly larger than uint64 |
| **KSUID** | k-sortable + entropy | Time-sortable | 27 chars |

**Modern default:** UUIDv7 or Snowflake-style.

## 17.4 Service discovery

How does service A find an instance of service B in a cluster where pods come and go every minute?

- **Client-side** — clients query a registry (Consul, etcd) and pick an instance.
- **Server-side** — clients hit a stable LB endpoint that routes to a live instance (Kubernetes Services do this via kube-proxy).
- **DNS-based** — registry exposes records via DNS (e.g., `b.svc.cluster.local`).

## 17.5 API gateway features (consolidated)

```
   ┌────────────────────────────────────────────┐
   │ AuthN/AuthZ (validate JWT/OAuth)            │
   │ Rate limiting + quotas                       │
   │ Request/response transformation              │
   │ Caching                                     │
   │ Routing / versioning                         │
   │ Aggregation (BFF pattern)                   │
   │ Observability (logging, tracing)             │
   │ WAF integration                             │
   └────────────────────────────────────────────┘
   Examples: Kong, Apigee, AWS API GW, Envoy, GCP API GW
```

## 17.6 Webhooks

The inverse of polling: the server calls *you* when something happens. Tips:
- **Sign** the payload (HMAC) so receivers can verify origin.
- **Retry** with backoff on non-2xx.
- **Idempotency** keys so receivers can dedupe.
- **Allow-list** outgoing destinations to avoid SSRF.

## 17.7 Pagination — the right way

```
   Offset-based  ?page=42&size=20   simple, slow for big offsets,
                                    unstable when items are inserted
   Cursor-based  ?cursor=opaque     fast (uses index), stable, opaque to client
   Keyset        ?after_id=12345    fast, requires sortable key
```

For infinite scroll / API consumers, **cursor or keyset**, not offset.

## 17.8 Big-O for the system designer

```
   1 user            anything works
   1k users          a single server + DB is fine
   100k users        add a cache and a CDN
   1M users          replicas + maybe one shard, queue for async
   100M users        sharding, multi-region, fan-out
   1B users          dedicated infra, custom protocols, regional autonomy
```

Order of magnitude thinking saves you from over-engineering.

## 17.9 Search relevance — TF-IDF and BM25

How does Elasticsearch decide "doc A is more relevant than doc B" for a query?

```
   TF-IDF score(term, doc) = TF(term, doc) × IDF(term)

      TF  = how often the term appears in the doc (more = more relevant)
      IDF = log(total_docs / docs_containing_term)
            common words ("the") have low IDF; rare words have high IDF
```

**BM25** is the modern default (Lucene since 6.0). It dampens TF growth (a 100× repeated word isn't 100× more relevant) and normalizes for document length. Most search systems use it under the hood.

Modern search adds a *second stage*: neural ranking with embeddings (RAG-style semantic search) on top of BM25 candidates. See Ch 24.

## 17.10 Geohash — the precision table

A geohash string represents a rectangle on Earth. Each character refines the rectangle ~32× (5 bits).

| Length | Cell size | Use case |
|--------|-----------|----------|
| 4 | ~20 km × 20 km | City |
| 5 | ~4.9 km × 4.9 km | Neighbourhood |
| 6 | ~610 m × 610 m | Block |
| 7 | ~76 m × 76 m | Building cluster |
| 8 | ~19 m × 19 m | Building |

"Find drivers near me" → compute the geohash of my location, query that cell + the 8 neighbours, then sort by exact distance.

## 17.11 Webhook security in practice

```
   Sender side:                        Receiver side:
     sig = HMAC_SHA256(body, secret);     expected = HMAC_SHA256(body, secret);
     headers['X-Signature'] = sig;        if !constant_time_eq(sig, expected):
                                              reject 403
                                          verify timestamp within 5 min (replay attack)
                                          dedupe by request id (idempotency)
```

GitHub, Stripe, Slack — all webhook providers — sign payloads this way. Always **constant-time** comparison to avoid timing attacks, and always check the timestamp.

## 17.12 Notification systems — the building blocks

```
   Event ──▶ Notification service:
              1. Lookup user preferences (channels: push / email / SMS / in-app)
              2. Render template per channel
              3. Push to per-channel provider queue (APNs / FCM / SES / Twilio)
              4. Track delivery + bounces + opens
              5. Apply throttling per user (don't spam)
```

Common pitfalls: synchronous send (ruins request latency), no deduplication (sends the same alert 5×), no rate limits per user (user disables your app).

## 17.13 Feature flags — the senior engineer's safety net

```
   if (flags.isOn("new_pricing_engine", user)) {
       return newEngine.price(cart);
   } else {
       return oldEngine.price(cart);
   }
```

Three levels of value:
1. **Kill switch** — flip off a broken feature instantly without a redeploy.
2. **Targeted rollout** — enable for 1 % of users, internal employees, specific tenants.
3. **A/B testing** — measure impact of variant A vs B.

Tools: LaunchDarkly, Unleash, Flagsmith, OpenFeature (the standard SDK).

## 17.14 The autocomplete / typeahead building block

```
   user types "amaz"      → query → prefix matches sorted by popularity
                                     "amazon"      (popularity: 1e8)
                                     "amazing"     (popularity: 1e6)
                                     "amazonbasics"
                                     "amazfit"
```

Standard implementation: **Trie** (in-RAM, per shard) + **score** per leaf. Update score offline (batch job over search logs). Cache the top results per prefix. Sub-50 ms response is the bar.

Personalization adds a re-ranking step using user history. Modern systems use embeddings for typo tolerance (`amaz0n` → `amazon`) and semantic match.

---

# PART 18: MULTI-REGION ARCHITECTURE

## 18.1 Why go multi-region

Three real reasons (and the wrong fourth):

1. **Latency** — users in Tokyo shouldn't round-trip to Virginia (150 ms minimum).
2. **Disaster recovery** — an entire region (yes, an entire AWS region) can go down.
3. **Compliance / data sovereignty** — GDPR / India's DPDP / China — data must stay in-country.

Wrong reason: **"because it sounds robust."** Multi-region at least doubles complexity and cost. Don't do it before you have an SLO that demands it.

## 18.2 The three topologies

```
   ┌──────────────────────────────────────────────────────────────┐
   │ ACTIVE-PASSIVE         one region serves; another stands by   │
   │   Simplest. Fastest to ship. Wasted standby capacity.         │
   │   Failover = DNS flip + DB promote (minutes).                  │
   │                                                                │
   │ ACTIVE-ACTIVE (sharded by user)                                │
   │   Each user "lives" in one region. Cross-region only for       │
   │   admin / global queries. Most modern global apps do this.     │
   │                                                                │
   │ ACTIVE-ACTIVE (fully replicated)                                │
   │   Every region can serve every user with full data replication. │
   │   Highest complexity (conflict resolution, write fan-out).      │
   │   Used by truly global products (Twitter, Spanner-backed apps). │
   └──────────────────────────────────────────────────────────────┘
```

## 18.3 Data replication topologies

```
   PRIMARY → REPLICA (per region)         all writes hit one primary; replicas
                                          serve reads. Simple, but writes are
                                          slow for far-away users.

   MULTI-PRIMARY (per region)              each region accepts writes locally;
                                          replicate to others async. Need
                                          conflict resolution (CRDTs, LWW,
                                          per-row sharding).

   SHARDED-BY-USER (home region)           user42 lives in EU; user43 in US.
                                          Writes for user42 always go EU.
                                          Crossover requires a redirect.

   GLOBAL DB (Spanner, Cosmos, Yugabyte)   the DB itself handles cross-region
                                          consistency. Slowest writes,
                                          strongest semantics.
```

## 18.4 Traffic steering — getting users to the right region

```
   GeoDNS                         AWS Route 53, Cloudflare    ms-level granularity
   Anycast IP                     CDNs, public DNS resolvers   physics-level
   GSLB (Global Server LB)        F5, NetScaler, cloud LBs     health-aware
   Client-side discovery          mobile apps with region list manual control
```

Plan your **failover behaviour** in advance: if EU goes down, do US users notice (they shouldn't) and do EU users get rerouted to US (latency hit, better than nothing)?

## 18.5 Split-brain — the multi-region nightmare

> A network partition between regions can let both sides think they're the primary. They both accept writes. Now you have *two* divergent histories that must merge.

Defences:
- **Quorum-based leader election across regions** (requires odd number — 3 regions or 2+1 witness).
- **Asymmetric authority** — one region is always the writer; others read-only until manual failover.
- **Fence tokens** — old primaries are rejected by storage layer after a new one is elected.
- **CRDTs** — conflict-free merge by construction (only works for compatible data types).

## 18.6 Data sovereignty patterns

```
   ┌──────────────────────────────────────────────────────────────┐
   │ EU user                  US user                              │
   │   ├─ profile in EU         ├─ profile in US                   │
   │   ├─ behaviour data in EU  ├─ behaviour data in US            │
   │   └─ encrypted aggregates → global analytics (no PII)         │
   └──────────────────────────────────────────────────────────────┘
```

Modern GDPR/DPDP-compliant designs **shard PII by region** and only export *anonymized aggregates* globally. Differential privacy and federated analytics are increasingly used to satisfy regulators.

## 18.7 The cost of being global

| Cost | Why it shows up |
|------|-----------------|
| **Egress fees** | Cross-region transfer is the most expensive networking line item |
| **Replicated storage** | 2× regions ≈ 2× DB storage |
| **Idle standby** | Active-passive wastes one region's compute |
| **Engineering** | DR drills, runbooks, multi-region testing, observability per region |
| **Schema migrations** | Now N×harder; must be backward and forward compatible |

Estimate it before committing. Often the right answer is "we'll go multi-region *next year*, once revenue justifies it."

---

# PART 19: COST & CAPACITY ENGINEERING (FinOps)

## 19.1 Why cost is a system-design concern

The cheapest line of code is the one you didn't write. The cheapest server is the one you didn't provision. At any non-trivial scale, **architectural decisions dominate the cloud bill** — language choice, tooling cost, and even team size are rounding errors.

## 19.2 The cost iceberg

```
   Visible (most teams measure):
     EC2 / K8s instance hours, RDS, managed services

   Hidden (the 70 % nobody measures):
     Egress and cross-AZ traffic
     S3 list/get/put request counts (not bytes)
     CloudWatch ingestion (logs are expensive!)
     Idle dev/staging environments
     Over-provisioned reserved instances
     Snapshots, AMIs, old EBS volumes
     Lambda + API Gateway combo at high request rates
```

The first FinOps win is *always* deleting things — unused volumes, old snapshots, idle dev clusters.

## 19.3 Instance pricing models — pick the right mix

| Model | Discount vs on-demand | Trade-off |
|-------|----------------------|-----------|
| **On-demand** | 0 % | No commit; full price |
| **Reserved (1-year)** | ~40 % | Pay annually; locked to instance family |
| **Reserved (3-year)** | ~60 % | Long commit; risk of obsolescence |
| **Savings Plans** | ~50 % | Flexible across families |
| **Spot / Preemptible** | 70-90 % | Can be killed in 2 minutes; need retryable workloads |

**Modern recipe:** Reserved for baseline, Savings Plans for steady growth, Spot for batch/dev/CI, on-demand for spikes.

## 19.4 Architecture-level cost killers

```
   ✗ Log everything at INFO with full payloads
   ✗ Use a NAT gateway for everything (per-GB charge!)
   ✗ Keep replicas warm in every region "just in case"
   ✗ Use API Gateway + Lambda for high-throughput internal calls
   ✗ Run analytics on the OLTP cluster
   ✗ Forget about S3 lifecycle policies
   ✗ Auto-snapshot daily and never delete
   ✗ Pay for managed Kafka *and* a fleet of Lambdas to process its events
```

Each of these has burned six- and seven-figure bills at real companies. Periodically audit.

## 19.5 Right-sizing — the silent waste

Most prod workloads run at 10-20 % CPU utilization "for headroom." That's 5-10× over-provisioning. Use:

- **Vertical Pod Autoscaler** (recommend mode) — learn the right requests/limits over time.
- **Karpenter / Cluster Autoscaler** — pack pods densely; scale down nodes overnight.
- **Stop dev/staging clusters on nights/weekends** — single biggest non-prod win.

## 19.6 Capacity planning — the back-of-envelope worksheet

```
   1. Users:           ___M total, ___% daily active = ___M DAU
   2. Action freq:     ___ actions/user/day
   3. Total actions:   DAU × freq = ___/day → ÷ 86,400 = ___ RPS
   4. Peak factor:     2-3× average = ___ peak RPS
   5. Per-action cost: ___ ms CPU, ___ KB storage, ___ network bytes
   6. Server count:    peak RPS × per-req CPU ÷ (cores × util) = N
   7. Storage:         actions × KB × retention_days = ___ TB
   8. Egress:          users × responses × KB = ___ TB/month
   9. Cost:            N × $/hr × 720 + storage $/GB-mo + egress $/GB
```

Run it for the next 12, 24, and 36 months. The shape (linear? exponential? S-curve?) tells you whether to invest in efficiency now or later.

## 19.7 The single most useful FinOps practice

> **Tag every resource with `owner`, `service`, `environment`.** Show each team their bill monthly. Costs decrease by 20-30 % within two quarters with *no other action* — visibility alone changes behaviour.

---

# PART 20: COMMON ANTI-PATTERNS

These are the recurring mistakes that look reasonable on a whiteboard but cause real production pain. Spotting them in a design discussion is what separates a senior from a staff engineer.

## 20.1 "Microservices first"

Splitting into 20 services before you have product-market fit. You pay all the costs (network, observability, deploys, data-consistency) for none of the benefits (independent teams, clear bounded contexts). Start with a **modular monolith**; split when team or scale demands it — *not* because microservices are fashionable.

## 20.2 The distributed monolith

You split into microservices, but every change requires coordinated deploys of 6 services in lockstep. Telltale signs: shared DB across services, synchronous chains 4+ deep, no service can be deployed independently. Fix: enforce schema boundaries, async events, contract tests.

## 20.3 Premature sharding

Sharding a database that doesn't yet need it. Now every query is harder, every join is impossible, and you've doubled ops complexity for no benefit. **Postgres can comfortably handle 10 TB on a single beefy box.** Vertical-scale first, replicate for reads, *then* shard when you've measurably hit a write ceiling.

## 20.4 Cache as the source of truth

"We'll just keep it in Redis." Then Redis fails — and you discover the DB hasn't had that data for weeks. **A cache must be reproducible from the source of truth.** If it isn't, it's a database with a misleading name.

## 20.5 Synchronous everywhere

Every action waits for every downstream. Latencies sum. One slow dependency = whole-site outage. Default to async for anything that can be late: emails, analytics, recommendations, webhooks.

## 20.6 "It's eventually consistent" hand-wave

Saying "eventually consistent" without specifying *how* eventual (seconds? minutes? hours?) and what the user sees during inconsistency. **Be specific:** "user feed lags writes by < 5s p99, never shows duplicates, and never loses likes."

## 20.7 Logs as a database

Querying logs to answer business questions. Logs are append-only, expensive to query, and not your system of record. If you find yourself running grep over CloudWatch to compute revenue, you need a proper events table or warehouse.

## 20.8 One queue to rule them all

A single Kafka topic for "all events." Consumers get bottlenecks, ordering breaks, retention conflicts (analytics wants 30 days; auth wants 1 hour). **One topic per event type per producer**; group consumption by purpose.

## 20.9 No timeouts

Every HTTP/gRPC call without an explicit timeout is a future production outage. Default timeouts in many libraries are *infinite*. Always: connect timeout (1 s), read timeout (3-10 s), overall request timeout (≤ caller's SLA / 2).

## 20.10 Read-after-write surprises

Writing to a DB then immediately reading from a replica that hasn't caught up. User pays, sees old balance, panics. Fix with §8.7 strategies — don't ignore it.

## 20.11 Retry storms

Service B fails → service A retries → A's retries multiply the load on B → B stays down longer → more retries. Always: exponential backoff + jitter, retry budgets, circuit breakers.

## 20.12 "Idempotency, we'll add it later"

You won't. By the time you need it (double charges, duplicate emails), you'll have refactor-debt across every endpoint. Bake idempotency keys in from day one for state-changing operations.

## 20.13 The Ops gap

A new service ships without dashboards, alerts, or a runbook. The first oncall page is a ten-step debugging odyssey. **Definition of Done** includes: SLOs defined, golden-signal dashboards, runbook published, oncall trained.

## 20.14 "Just use Lambda"

Serverless for the wrong workloads: long-running jobs (15-min cap), database-heavy work (cold-start + connection pool issues), or chatty fan-out (cost explodes). Use Lambda for true event-driven, sporadic work. Use containers/VMs for steady high-RPS workloads.

## 20.15 Snowflake servers

Production servers configured by hand, no IaC, no reproducibility. The day they die, you discover the prior engineer's config tweaks aren't documented. **Everything in git.** Cattle, not pets.

---

# PART 21: WORKED EXAMPLE — DESIGNING INSTAGRAM

A full walk-through that exercises every previous section. Treat it as the template for any "design X" interview.

## 21.1 Step 1 — Clarify requirements

**Functional:**
- Users upload photos (and short videos).
- Followers see a chronological / ranked feed.
- Like, comment, search by hashtag.
- Direct messages.

**Non-functional:**
- Read-heavy (≈ 100:1 read:write).
- 99.9 % availability for reads; 99.99 % for upload acks.
- p99 feed load < 200 ms globally.
- Strong consistency for follows; eventual for feed/likes/comment counts.
- Global, must comply with regional data residency.

## 21.2 Step 2 — Estimates (back-of-envelope)

```
   500M DAU
   × 2 photo uploads/user/week ÷ 7 = ~143M uploads/day = ~1,650 uploads/sec
   peak factor 3× = ~5,000 uploads/sec

   Reads (feed loads):  500M × 5 sessions × 30 photos = 75B photo views/day
                       ÷ 86,400 = ~870K views/sec
   peak: ~2.5M views/sec

   Storage per photo:   ~500 KB (after compression, multiple sizes cached)
   Daily upload bytes:  143M × 500 KB ≈ 70 TB/day = ~25 PB/year (+ thumbnails)
   Metadata per photo:  ~1 KB → 50 GB/year metadata
```

## 21.3 Step 3 — API sketch

```
   POST   /v1/photos                   upload (multipart, returns photoId)
   GET    /v1/feed?cursor=...          paginated feed
   POST   /v1/follow/{userId}          follow
   POST   /v1/like/{photoId}           like
   POST   /v1/comments                 comment
   GET    /v1/search?q=...&type=tag    search
```

All write endpoints take `Idempotency-Key`. Reads use cursor pagination.

## 21.4 Step 4 — Data model

```
   users(id, handle, name, region, created_at)              — Postgres
   follows(follower_id, followee_id, created_at)            — Cassandra
   photos(id, owner_id, s3_key, caption, created_at, ...)   — Cassandra
   likes(photo_id, user_id, created_at)                     — Cassandra
   feeds(user_id, photo_id, score, ts)                      — Redis (sorted set)
   comments(photo_id, comment_id, user_id, text, ts)        — Cassandra
   search_index                                             — Elasticsearch
   blob storage                                             — S3 (+ CDN)
```

## 21.5 Step 5 — High-level architecture

```
   ┌─────────────────────────────────────────────────────────────────┐
   │                            CDN (CloudFront / Cloudflare)         │
   └───────┬─────────────────────────────────────────────────────────┘
           │
   ┌───────▼─────────┐
   │  API Gateway    │  (auth, rate limit, routing)
   └───────┬─────────┘
           │
   ┌───────▼───────────────────────────────────────────────────────┐
   │ L7 LB (Envoy)                                                  │
   └─┬───┬───┬───┬───┬────────────────────────────────────────────┘
     │   │   │   │   │
     ▼   ▼   ▼   ▼   ▼
   Upload Feed Like Cmnt Search ─── microservices (auto-scaled)
     │   │   │   │   │
     │   ▼   ▼   ▼   ▼
     │ Redis (feed cache, hot photos, sessions)
     │   │
     │   ▼
     │ Cassandra (photos, follows, likes, comments — write-optimized)
     │   │
     │   ▼
     │ Postgres (users, billing, anything ACID)
     │
     ├─▶ S3 (raw + transcoded media) ──▶ CDN
     │
     └─▶ Kafka (events: photo uploaded, like, follow)
            │
            ├─▶ Fan-out workers (push feed updates to Redis)
            ├─▶ Search indexer (push to Elasticsearch)
            ├─▶ Analytics pipeline (Flink → warehouse)
            └─▶ Notification service
```

## 21.6 Step 6 — Photo upload flow

```
   1. Client → POST /photos (presigned URL request)
   2. API returns S3 presigned URL → client uploads directly to S3
      (offloads bandwidth from your servers)
   3. Client → POST /photos/commit (with S3 key)
   4. Photo service:
        a. Writes metadata to Cassandra
        b. Emits "photo.uploaded" to Kafka
        c. Returns 201 Created with photoId
   5. Async consumers:
        a. Transcoder (multiple sizes) → S3 → invalidate CDN
        b. Feed fan-out (§21.7)
        c. Search indexer
        d. Notification worker
```

Idempotency-Key on `/commit` prevents duplicates on retry.

## 21.7 Step 7 — Feed generation (the heart of the system)

Three strategies; Instagram uses a hybrid:

```
   PUSH (fan-out on write)   on upload, push photoId to every follower's
                              feed cache. Read = O(1). Write = O(followers).
                              Great for normal users; terrible for celebrities.

   PULL (fan-out on read)    on feed load, query last N photos from every
                              followee and merge. Read = O(followees × log N).
                              Cheap for celebs; expensive at read time.

   HYBRID  (Instagram's choice)
                              Push for normal users (< 10k followers).
                              Pull for "big accounts" — read combines pushed
                              feed + recently fetched celeb posts.
```

Feed cache: Redis sorted set per user, scored by `created_at + ranking_signal`.

## 21.8 Step 8 — Scaling considerations

| Concern | Mitigation |
|---------|------------|
| Hot celebrities | Hybrid feed; separate "big-account" cache shard |
| Hot photo (viral) | CDN absorbs reads; like counter sharded via §9.20 PN-Counter |
| Spam / abuse | Rate-limit uploads per user (token bucket); ML moderation queue |
| Search at scale | Elasticsearch with hashtag-sharded indices |
| Multi-region | Photo + follow stored in user's home region; cross-region reads via CDN |
| Sudden 10× traffic spike (live event) | Pre-scale, autoscale, shed non-critical (e.g., delay analytics ingestion) |
| Like fan-out storm | Aggregate likes in 1-second windows; flush to DB as deltas |

## 21.9 Step 9 — Failure modes (the senior bit)

```
   • Cassandra node dies        → tunable W=2 keeps writes; auto-repair
   • Redis cluster outage       → degrade to pull-only feed (slower but works)
   • S3 outage in one region    → reads fall back to other region via CDN
   • Kafka cluster unreachable  → buffer events to local disk; backfill on recovery
   • Transcoder pipeline behind → serve original; transcoded version "soon"
   • Region down                → DNS-shift users to nearest healthy region
```

Every component is asked: *what happens if you die?* And: *what do users see?*

## 21.10 Step 10 — Trade-offs called out

- **Eventual consistency on like counts** → user may see N then N+1 briefly. Acceptable.
- **Feeds may lag uploads by seconds** during fan-out backlog. Acceptable for social media; would NOT be for financial systems.
- **Hybrid feed adds complexity** but is the only way to handle both Joe Public and Beyoncé.
- **Storing originals in S3** is durable + cheap, but transcoding costs CPU. Cached in CDN amortizes.
- **Single-region writes for now**; revisit when revenue justifies multi-master complexity.

---

# PART 22: PUTTING IT ALL TOGETHER

## 22.1 A reusable interview framework

```
   1. CLARIFY    — functional & non-functional reqs, scale numbers
   2. ESTIMATE   — QPS, storage/year, bandwidth (back-of-envelope)
   3. API        — define the 3-5 most important endpoints
   4. DATA       — entities, schemas, choose the data store
   5. HIGH-LEVEL — boxes & arrows: client → LB → service → cache → DB
   6. DEEP DIVE  — pick the 2 hardest components, design them well
   7. BOTTLENECKS — identify, then mitigate (cache? shard? queue?)
   8. TRADE-OFFS — name what you sacrificed; reason about CAP/PACELC
```

## 22.2 Latency numbers every engineer should know (Jeff Dean, updated)

```
   L1 cache reference                    0.5  ns
   Branch mispredict                       5  ns
   L2 cache reference                      7  ns
   Mutex lock/unlock                      25  ns
   Main memory reference                 100  ns
   Compress 1KB with Snappy              2,000 ns  =   2 µs
   Read 1MB sequentially from memory     3,000 ns  =   3 µs
   SSD random read                      16,000 ns  =  16 µs
   Round trip within same datacenter   500,000 ns  =  0.5 ms
   Read 1MB sequentially from SSD    1,000,000 ns  =  1 ms
   Disk seek                        10,000,000 ns  =  10 ms
   Read 1MB sequentially from disk  20,000,000 ns  =  20 ms
   Round trip US ↔ Europe          150,000,000 ns  = 150 ms
```

Two lessons: (1) network ≫ memory ≫ CPU. (2) batch + sequential ≫ random.

## 22.3 Back-of-envelope estimation cheat-sheet

```
   1 day        = 86,400 s    ≈ 10⁵ s
   1 month      ≈ 2.5 × 10⁶ s
   1 year       ≈ 3 × 10⁷ s

   100M users, 10 actions/day  ≈ 10⁹ actions/day  ≈ 12k actions/sec
   Each action 1KB                                 ≈ 1 TB/day, ~365 TB/year
```

Multiply users × actions × size → storage. Divide by 86,400 → RPS.

## 22.4 Five reference designs (apply everything above)

### A. URL shortener (TinyURL)
```
   Components: API → ID gen (Snowflake) → KV store (Redis primary,
               Cassandra cold), CDN-cached redirects (HTTP 301).
   Key choice: 301 vs 302 (analytics trade-off), TTL on cache, base62 IDs.
```

### B. News feed (Twitter)
```
   Two strategies:
     • Pull (fan-out on read)  — query on read; slow for celeb followers
     • Push (fan-out on write) — precompute feeds; bad for celebrities
     • Hybrid                  — push for normal users, pull for celebs
```

### C. Chat (WhatsApp)
```
   WebSockets (persistent conn) → per-user msg queue (Kafka or custom)
   → Cassandra for history. Per-user "last delivered" offset.
   Use end-to-end encryption (Signal protocol).
```

### D. Rate limiter
```
   Token-bucket per (user, endpoint) in Redis, atomic Lua script.
   Fail open vs fail closed? — usually closed for billing, open for serving.
```

### E. Distributed file storage (Dropbox)
```
   Chunk files (4MB) → content-hash for dedupe → object store (S3) →
   metadata DB (Postgres) → notification service for sync.
   Use rsync-style delta uploads to save bandwidth.
```

## 22.5 The senior engineer's heuristics

1. **Cache aggressively, invalidate explicitly.**
2. **Make it correct first, then make it fast.**
3. **Async by default for anything that can be late.**
4. **Idempotency is not optional in distributed systems.**
5. **Every retry needs backoff and a cap.**
6. **Every queue needs a DLQ.**
7. **Every service needs a health check, a metric, and a runbook.**
8. **No SPOFs in the critical path.**
9. **Design for failure modes you've actually seen, not for ones that look elegant.**
10. **The best architecture is the *simplest* one that meets the SLOs.**

## 22.6 Where to go next in this repo

- **Ch 20** — Design Fundamentals (SOLID, patterns, Java specifics)
- **Ch 21** — ML System Design (recsys, ranking, feature stores)
- **Ch 33** — Engineering Tools (Kafka, Redis, Spark, K8s in depth)

This chapter is the **map**; those three are the **terrain**.

---

## Quick-Reference Cheat Card

```
   ┌──────────────────────────────────────────────────────────────┐
   │ NEED LOWER LATENCY?    → Cache, CDN, edge compute, denormalize│
   │ NEED HIGHER THROUGHPUT?→ Shard, async queue, batch, parallelize│
   │ NEED HIGHER AVAILABILITY?→ Replicas, multi-AZ/region, retries  │
   │ NEED STRONG CONSISTENCY?→ Single-leader, quorum reads, Spanner│
   │ NEED EVENTUAL CONS. OK? → Async replication, CRDTs, gossip    │
   │ NEED RELIABLE EVENTS?   → Kafka + idempotent consumers + DLQ   │
   │ NEED FAST WRITES?       → LSM stores (Cassandra), append-only │
   │ NEED FAST READS?        → B-tree DBs + cache + read replicas  │
   │ NEED SECURE BY DEFAULT? → mTLS + zero trust + secrets manager │
   │ NEED PROOF IT WORKS?    → SLO + error budget + chaos drills    │
   └──────────────────────────────────────────────────────────────┘
```

---

> **Final thought:** None of these building blocks are magic. Each one solves *one specific problem* — and the senior engineer's job is to know which problem they have, pick the smallest set of blocks that fix it, and clearly name the trade-offs. The diagrams in your interview matter less than the *reasoning* behind every box.
