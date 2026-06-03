# Chapter 34 — System Design Fundamentals: The Complete Deep Dive

> "All architecture is design, but not all design is architecture. Architecture represents the significant design decisions that shape a system, where 'significant' is measured by cost of change." — Grady Booch

**What this chapter covers:**
A single, comprehensive map of every fundamental building block you need to design real systems — CDN, load balancers, caching, sharding, CAP theorem, consensus, queues, observability, security, and more. Written in plain English first, then deep enough for senior interviews.

**How to read it:**
Each topic follows the same shape — *Simple Explanation → Official Definition → How it works (with ASCII diagrams) → Variants → Trade-offs → Interview takeaway.* You can read it cover-to-cover (~6–7 hours) or jump straight to any building block. The final three parts (20–22) are case-study material that ties everything together — read those after at least skimming Parts 1–19.

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

## 3.1 The protocol stack (just enough)

```
   ┌──────────────────────────────────────┐
   │ Application: HTTP, gRPC, WebSocket   │ ← what your code speaks
   ├──────────────────────────────────────┤
   │ Transport:   TCP (reliable) / UDP    │ ← reliability vs speed
   ├──────────────────────────────────────┤
   │ Network:     IP                      │ ← addressing & routing
   ├──────────────────────────────────────┤
   │ Link:        Ethernet, Wi-Fi         │ ← the wire
   └──────────────────────────────────────┘
```

### TCP vs UDP — when each wins

| Property | TCP | UDP |
|----------|-----|-----|
| Connection | Yes (3-way handshake) | No |
| Reliability | Guaranteed delivery + order | None — fire & forget |
| Speed | Slower (overhead) | Faster |
| Use case | HTTP, SSH, databases | DNS, video calls, gaming, QUIC |

**Rule of thumb:** if losing a packet would ruin the meaning, use TCP. If losing a packet just means a missed frame (video, telemetry), UDP is fine.

## 3.2 HTTP/1.1, HTTP/2, HTTP/3

```
   HTTP/1.1    one request per TCP conn (head-of-line blocking)
                 ─▶─▶─▶─▶─▶
   HTTP/2      multiplexed streams over one TCP conn
                 ━━╋━╋━╋━━
   HTTP/3      HTTP/2 features but over QUIC (UDP-based)
                 ◇◇◇◇◇  — no TCP head-of-line block, faster handshake
```

Modern CDNs and Google services default to HTTP/3 (QUIC). Know that HTTP/3 ≈ "HTTP/2 features without TCP's pain."

## 3.3 DNS — the phone book of the internet

> **Simple Explanation:** You typed `google.com`; DNS turned it into `142.250.190.78`. Without DNS, you'd have to memorize IPs.

```
   Browser                Resolver        Root → TLD → Authoritative
     │                       │                    │
     │ google.com? ────────▶ │ ──── recursive ──▶ │
     │                       │ ◀── 142.250.x.x ───│
     │ ◀── 142.250.x.x ──────│
     │                       │
     └─ caches answer for TTL seconds
```

Key concepts:

- **TTL** — how long a DNS answer is cached. Low TTL = fast failover, more lookups. High TTL = less load, slower failover.
- **A / AAAA records** — IPv4 / IPv6 addresses.
- **CNAME** — alias to another DNS name.
- **GeoDNS** — return a different IP based on the user's location (basis of CDNs).
- **Anycast** — one IP, many physical locations; the network routes you to the nearest one.

## 3.4 Synchronous vs. Asynchronous communication

```
   SYNCHRONOUS (request/response)        ASYNCHRONOUS (fire-and-forget)
   ─────────────────────────────         ─────────────────────────────
   A ──── do it now ────▶ B               A ──── push event ──▶ Queue ──▶ B
   A ◀──── result ────── B                A keeps going immediately

   Simpler reasoning, tight coupling      Decoupled, resilient,
   A waits for B (latency adds up)        but harder to reason about
   B's outage = A's outage                B's outage is invisible to A
```

**Rule:** use sync for queries that need an immediate answer; use async for commands that can be processed later (notifications, billing, analytics).

## 3.5 API styles — REST vs gRPC vs GraphQL vs RPC

| Style | Wire format | Best for | Weakness |
|-------|-------------|----------|----------|
| **REST** (HTTP+JSON) | Human-readable | Public APIs, browsers | Over-fetching, chatty, weak typing |
| **gRPC** (HTTP/2+Protobuf) | Binary, schema'd | Internal microservices | Browsers need a proxy, not human-readable |
| **GraphQL** | JSON | UIs that need flexible queries | Server complexity, hard to cache |
| **WebSocket** | Bidirectional, persistent | Chat, live dashboards | Stateful conns are harder to scale |
| **Server-Sent Events** | One-way streaming over HTTP | Notifications, ticker feeds | Server → client only |
| **Long polling** | HTTP, kept open until data arrives | Compatibility fallback | Doesn't scale to millions |

### Quick decision tree

```
   Need real-time bidirectional? ─── yes ──▶ WebSockets
              │
              no
              ▼
   Need server-push only? ─── yes ──▶ SSE
              │
              no
              ▼
   Internal service-to-service? ─── yes ──▶ gRPC
              │
              no
              ▼
   UI needs flexible queries? ─── yes ──▶ GraphQL
              │
              no
              ▼
                                          REST
```

## 3.6 Idempotency

> **Simple Explanation:** An idempotent operation produces the same result whether you call it once or a hundred times. `DELETE /user/42` is idempotent. `POST /charge $10` is not (unless you add an idempotency key).

In distributed systems, **clients retry**. Without idempotency, retries cause duplicate charges, double emails, etc. Always design POST endpoints to accept an `Idempotency-Key` header.

## 3.7 The TLS handshake — why HTTP/3 wins on the wire

```
   TLS 1.2 (2 round-trips before first app data):
     1. ClientHello                        ──▶
                                           ◀── ServerHello + cert
     2. KeyExchange + Finished             ──▶
                                           ◀── Finished
     3. HTTP request                       ──▶

   TLS 1.3 (1 round-trip; 0-RTT on resumed sessions):
     1. ClientHello + key share            ──▶
                                           ◀── ServerHello + cert + Finished
     2. HTTP request                       ──▶

   HTTP/3 (QUIC): TLS baked into transport, 0-RTT on resumption
```

For a global user 150 ms RTT away, dropping one round-trip is a 150 ms latency win on every fresh connection. Multiply by billions of users — meaningful cost savings, perceptibly snappier apps.

## 3.8 Connection management — pooling, keep-alive, and HOL blocking

```
   ┌────────────────────────────────────────────────────────────────┐
   │ HTTP/1.1 + keep-alive: one TCP conn = many sequential requests   │
   │   pro: skip TCP+TLS handshake on each request                     │
   │   con: head-of-line blocking — a slow response stalls all next    │
   │                                                                   │
   │ HTTP/2: one TCP conn, many concurrent streams                     │
   │   pro: no HOL blocking at app layer                               │
   │   con: HOL blocking at TCP layer (one lost packet stalls streams) │
   │                                                                   │
   │ HTTP/3 (QUIC): each stream independent on UDP                     │
   │   pro: no HOL blocking anywhere                                   │
   └────────────────────────────────────────────────────────────────┘
```

**Connection pooling** for outbound calls: reuse N idle connections instead of opening fresh ones every request. Size with Little's Law (§2.5). Too small → contention; too large → server-side socket exhaustion.

## 3.9 gRPC streaming modes

gRPC isn't just request/response. It has four modes built on HTTP/2:

| Mode | Client sends | Server sends |
|------|--------------|--------------|
| Unary | 1 message | 1 message |
| Server streaming | 1 message | many messages |
| Client streaming | many messages | 1 message |
| Bidirectional | many messages | many messages |

Bidirectional streaming powers chat, telemetry uploads, and live dashboards — all without WebSockets.

## 3.10 BFF — Backend For Frontend

```
   Mobile UI ──▶ Mobile BFF ──┐
                              ├──▶ underlying microservices
   Web UI    ──▶ Web BFF    ──┘
```

One backend tailored per client (mobile / web / partner). It aggregates, transforms, and slims the response for that specific client. Pioneered by SoundCloud and Netflix. Avoids the "one God API trying to please everyone" trap.

## 3.11 Common HTTP status codes you should *never* misuse

```
   200 OK             — success with body
   201 Created        — POST that created a new resource (Location header)
   202 Accepted       — async work queued; no result yet
   204 No Content     — success, body intentionally empty
   301 / 308          — permanent redirect (308 preserves method)
   302 / 307          — temporary redirect (307 preserves method)
   304 Not Modified   — cache validator matched; reuse local copy
   400 Bad Request    — your client did wrong
   401 Unauthorized   — actually means *unauthenticated*
   403 Forbidden      — authenticated but not allowed
   404 Not Found      — resource doesn't exist
   409 Conflict       — version mismatch / optimistic lock failure
   422 Unprocessable  — body parsed but semantically invalid
   429 Too Many       — rate-limited
   499 Client Closed  — nginx-ism; client gave up before response
   500 Internal Error — you broke
   502 Bad Gateway    — upstream returned garbage
   503 Service Unavail— you're overloaded / shedding load
   504 Gateway Timeout— upstream took too long
```

Returning `200` on errors with `{"error": "..."}` in the body is a junior anti-pattern. Use the right status; clients (and load balancers!) reason about them.

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

- **Consistent hashing** (§9.5) — adding/removing one server reshuffles only `1/N` of keys.
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
| **Penetration** | Many requests for keys that *don't exist* miss cache and hit DB | Cache the negative result with short TTL, or use a **Bloom filter** (§9.6) to reject impossible keys before the cache |
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

## 7.1 SQL vs NoSQL — the eternal question

> **Simple Explanation:** SQL is a *filing cabinet with strict rules* — every folder has the same fields. NoSQL is a *box of sticky notes* — every note can look different, but you give up some safety.

| | **SQL (relational)** | **NoSQL** |
|---|---|---|
| Schema | Fixed, declared upfront | Flexible / schema-on-read |
| Query language | SQL, joins, group-by | Per-DB API; joins discouraged |
| Transactions | ACID (multi-row, multi-table) | Often single-document only |
| Scaling | Hard to shard (joins!) | Designed to scale out |
| When right | Money, inventory, anything relational | Massive scale, varied data, write-heavy |
| Examples | PostgreSQL, MySQL, Oracle, Spanner | MongoDB, Cassandra, DynamoDB, Redis |

**Modern truth:** the dichotomy is dying. Postgres has JSON; CockroachDB scales SQL; DynamoDB has transactions. Pick by *access pattern*, not the label.

## 7.2 The NoSQL family tree

```
   ┌──────────────────────────────────────────────────────────┐
   │ KEY-VALUE     — { key → value }                          │
   │   Redis, DynamoDB, Memcached                             │
   │   ► Sessions, caches, simple lookups                     │
   ├──────────────────────────────────────────────────────────┤
   │ DOCUMENT      — JSON blobs, queryable                    │
   │   MongoDB, Couchbase, Firestore                          │
   │   ► User profiles, content, schemaless data              │
   ├──────────────────────────────────────────────────────────┤
   │ COLUMN-FAMILY — rows with sparse, wide columns           │
   │   Cassandra, Bigtable, HBase, ScyllaDB                   │
   │   ► Time-series, write-heavy, geo-replicated workloads   │
   ├──────────────────────────────────────────────────────────┤
   │ GRAPH         — nodes + edges with relationships         │
   │   Neo4j, Amazon Neptune, ArangoDB                        │
   │   ► Social networks, fraud detection, knowledge graphs   │
   ├──────────────────────────────────────────────────────────┤
   │ TIME-SERIES   — timestamp + metrics                      │
   │   InfluxDB, TimescaleDB, Prometheus                      │
   │   ► Metrics, IoT, monitoring                             │
   ├──────────────────────────────────────────────────────────┤
   │ SEARCH        — inverted-index full-text                 │
   │   Elasticsearch, OpenSearch, Solr                        │
   │   ► Log search, product search, autocomplete             │
   ├──────────────────────────────────────────────────────────┤
   │ VECTOR        — embedding similarity                     │
   │   pgvector, Qdrant, Pinecone, Weaviate                   │
   │   ► RAG, semantic search, recommendation                 │
   └──────────────────────────────────────────────────────────┘
```

## 7.3 ACID

> **Simple Explanation:** ACID is the four-part promise an RDBMS makes about transactions.

- **Atomicity** — all of it commits or none of it does (no half-transfers).
- **Consistency** — DB ends in a valid state (constraints honoured).
- **Isolation** — concurrent transactions look like they ran one-at-a-time.
- **Durability** — once committed, it survives crashes.

### Isolation levels (a 30-second tour)

```
   Read Uncommitted ─── can see other txns' uncommitted writes (dirty reads)
   Read Committed    ─── only sees committed data (Postgres default)
   Repeatable Read   ─── same query gives same result inside one txn (MySQL default)
   Serializable      ─── as if every txn ran alone — strongest, slowest
```

Each step prevents more anomalies (dirty/non-repeatable/phantom reads) at the cost of more locking or aborts.

## 7.4 BASE — the NoSQL counter-philosophy

- **Basically Available** — the system answers, even with stale data
- **Soft state** — state can change without input (replication catches up)
- **Eventual consistency** — given enough time, replicas converge

BASE is the trade you make to scale horizontally past what ACID can comfortably do.

## 7.5 Indexing — the difference between 1ms and 10s

> **Simple Explanation:** An index is the back-of-the-book — instead of scanning every page, you look up the term and jump. Same for a DB table.

```
   Without index:                 With B-tree index on user_id:
   SELECT * WHERE user_id = 42    Walk the tree: log(N) ≈ 20 hops
   Scan all N rows                Random read 1 row
   O(N)                           O(log N)
```

Common index structures:

| Structure | Best for | Used by |
|-----------|----------|---------|
| **B-tree** | Range queries, equality, sorting | Almost every RDBMS |
| **Hash** | Pure equality | Postgres hash, Redis |
| **Inverted index** | Full-text search | Elasticsearch, Lucene |
| **LSM-tree** | Write-heavy workloads | Cassandra, RocksDB, LevelDB |
| **Bitmap** | Low-cardinality columns (gender, status) | Oracle, ClickHouse |
| **Geo-spatial** (R-tree, Geohash, Quadtree) | Location queries | PostGIS, Mongo, Redis GEO |

### Gotchas

- Every index speeds reads but **slows writes** (DB must maintain the index).
- **Covering index** — includes all columns the query needs, avoiding a table lookup.
- **Composite index `(a, b, c)`** only helps queries that filter on `a` (or `a,b`, or `a,b,c` in order). It does *not* help `WHERE b = 5`.

## 7.6 Normalization vs Denormalization

```
   NORMALIZED                          DENORMALIZED
   ─────────                            ─────────────
   users(id, name)                      orders(id, user_id, user_name, ...)
   orders(id, user_id)                  ↑
   ↑                                    Duplicate user_name in every order.
   No duplication.                      Faster reads (no join), painful updates.
```

OLTP systems (banking, e-commerce) lean normalized (3NF). Analytics warehouses, NoSQL document stores, and read-heavy systems lean denormalized.

## 7.7 Transactions across services — Saga pattern

In microservices, a logical transaction spans multiple databases. ACID across them is hard (2PC is slow and fragile). **Saga** breaks the transaction into local steps with compensating actions.

```
   Place Order Saga:
     1. reserve inventory   ←─ compensate: release inventory
     2. charge card         ←─ compensate: refund
     3. create shipment     ←─ compensate: cancel shipment
   If step 3 fails, run compensations 2,1 in reverse.
```

Two flavours: **choreography** (each service publishes events) and **orchestration** (a central coordinator calls each service).

## 7.8 N+1 query problem

```
   bad:                              good:
   orders = db.query("SELECT...")    orders = db.query(
   for o in orders:                      "SELECT ... JOIN users ...")
       u = db.query("SELECT user")
                                      OR  use ORM's eager-load / batch IN
   1 + N queries — kills latency.    1 query.
```

Spot it in any code review with an ORM (ActiveRecord, Hibernate, Django ORM).

## 7.9 MVCC and the Write-Ahead Log (WAL)

**MVCC (Multi-Version Concurrency Control)** is how modern RDBMS (Postgres, MySQL InnoDB, Oracle) let readers and writers coexist without locking each other.

> **Idea:** Every row update creates a *new version* tagged with a transaction ID. Readers see the version that was committed at their transaction's start; writers create new versions. Old versions are garbage-collected later (Postgres `VACUUM`).

```
   row id=5  (txn 100) name="Alice"
             (txn 110) name="Alicia"      ◀── visible to txns started after 110
             (txn 115) name="Alice T"
```

**WAL (Write-Ahead Log):** before mutating data pages on disk, append the change to a sequential log first. Two wins:
1. **Durability** — crash recovery replays the WAL.
2. **Performance** — sequential writes are ~100× faster than random page writes; pages can be flushed in batches.

This is the same idea as Kafka's log, Oracle redo logs, LSM-tree memtables, and SQLite journal mode. **Append-only logs are the universal building block.**

## 7.10 LSM-tree internals (Cassandra, RocksDB, LevelDB)

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

| Aspect | LSM (Cassandra) | B-tree (Postgres) |
|--------|-----------------|-------------------|
| Write | Append → very fast | Update-in-place → slower |
| Read | May scan multiple SSTables → slower | One path down the tree → fast |
| Write amplification | High (compaction rewrites) | Low |
| Read amplification | Higher (multi-level) | Low |
| Space amplification | High during compaction | Low |
| Best for | Write-heavy, time-series | Read-heavy, OLTP |

**Bloom filters** are essential here — each SSTable has one so reads can skip files that definitely don't contain the key.

## 7.11 Locking strategies — optimistic vs pessimistic

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

## 7.12 Database internals you should be able to draw

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

Knowing this stack lets you reason about *why* `EXPLAIN ANALYZE` shows what it shows — and what to fix (missing index? bad plan? buffer cache cold?).

## 7.13 The four isolation phenomena (and which level prevents them)

| Phenomenon | Plain English | Prevented by |
|------------|---------------|--------------|
| **Dirty read** | Read another txn's uncommitted write | Read Committed and above |
| **Non-repeatable read** | Same row, different value in same txn | Repeatable Read and above |
| **Phantom read** | New rows appear in a re-run range query | Serializable |
| **Write skew** | Two txns each read state and write without overlap, but together violate a constraint | Serializable (or explicit row locks) |

Postgres defaults to **Read Committed**. MySQL InnoDB defaults to **Repeatable Read** (and uses gap locks to also prevent phantoms). Serializable is the slowest but bulletproof; use it for financial logic.

## 7.14 Connection pool sizing — a real formula

```
   pool_size = ((core_count × 2) + effective_spindle_count)
                                         (HikariCP guidance)

   OR via Little's Law:
   pool_size = QPS_per_db × avg_query_time_s × safety
```

The classic mistake: setting pool size to thousands "just in case." A pool too large causes thread contention inside the database server. Most prod systems land between 10 and 50 connections per app instance.

---

# PART 8: DATABASE SCALING

## 8.1 The escape ladder

```
   Stage 1  one server                      ──▶ scale vertically
   Stage 2  add read replicas               ──▶ scale reads
   Stage 3  add a cache (Redis)             ──▶ offload hot reads
   Stage 4  partition by feature (federate) ──▶ smaller DBs per service
   Stage 5  shard by key                    ──▶ scale writes
   Stage 6  multi-region, multi-master      ──▶ scale geography
```

Climb only as high as you need. Each step doubles operational complexity.

## 8.2 Replication

> **Simple Explanation:** Copy the data to multiple servers so reads scale and you survive failures.

### Primary–replica (a.k.a. master–slave)

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

- **Sync** replication — write returns only after replicas ack. Strong consistency, slower.
- **Async** replication — primary acks immediately, replicas catch up. Fast, but reads can be stale, and a primary crash loses recent writes (RPO > 0).

### Multi-primary / multi-master

Every node accepts writes. Conflict resolution (last-write-wins, CRDTs, vector clocks) is required. Used by Cassandra, DynamoDB Global Tables, Riak.

## 8.3 Partitioning vs Sharding (often conflated)

- **Partitioning** — splitting a table within one database. *Vertical* = move columns to separate tables; *horizontal* = split rows by range or hash.
- **Sharding** — putting partitions on *different machines*.

```
   Sharding by hash(user_id) → 4 shards
   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
   │ shard 0 │ │ shard 1 │ │ shard 2 │ │ shard 3 │
   │ users   │ │ users   │ │ users   │ │ users   │
   │ hash%4=0│ │ hash%4=1│ │ hash%4=2│ │ hash%4=3│
   └─────────┘ └─────────┘ └─────────┘ └─────────┘
```

### Sharding strategies

| Strategy | How it routes | Pros | Cons |
|----------|---------------|------|------|
| **Range** | by key range (a–f, g–m, n–z) | Good for range scans | Hotspots if data is skewed |
| **Hash** | `hash(key) % N` | Even distribution | Range queries hit all shards |
| **Geo** | by region | Locality, GDPR | Imbalanced regions |
| **Directory** | lookup service maps key→shard | Most flexible | Lookup is a SPOF |

### Sharding's hidden costs

- **No cross-shard joins** (or they're slow).
- **No global secondary indexes** without extra work.
- **Re-sharding** when you outgrow N is painful — see consistent hashing (§9.5).
- **Distributed transactions** across shards require 2PC or sagas.

## 8.4 Read replicas — a quick win

Add 1–N replicas, route writes to primary, route reads to replicas. Watch out for **replication lag** — a user who just wrote may read stale data from a replica ("read your own writes" violation). Fixes: pin recently-writing users to the primary for X seconds, or use a replica only when staleness ≤ Y ms.

## 8.5 Federation — split by feature

```
   user_db          orders_db         catalog_db
   (auth team)      (orders team)     (search team)
```

Smaller, owned by independent teams. Joins now happen in the app — accept it. Most microservice architectures end up here.

## 8.6 CQRS — separate read and write models

**Command Query Responsibility Segregation.** Writes go to one model (normalized, transactional). Reads come from a different model (denormalized, fast). The two are kept in sync via events.

```
                   ┌─── write model (Postgres) ◀──── commands
   client ◀──reads── read model (Elasticsearch) ◀──── events
```

Great for systems where reads vastly outnumber writes and need different shapes.

## 8.7 Read-your-writes consistency strategies

If you use replicas, a user who just wrote may read stale data. Five common fixes:

1. **Read-from-primary for X seconds after a write** (sticky-window).
2. **Pin sessions to a region** — user's reads + writes go to the same primary.
3. **Monotonic-read tokens** — write returns a version; reads pass it; replica blocks until caught up.
4. **Synchronous replication for critical paths only** (e.g., account balance) and async for the rest.
5. **Client-side cache of own writes** — show the optimistic UI value until next refresh.

## 8.8 Online resharding — the hardest distributed chore

When N shards become too few, you must split without downtime. Standard playbook:

```
   1. Add new (empty) shard servers
   2. Dual-write to old and new for the migrating keys
   3. Backfill historical data from old → new
   4. Verify (checksums, row counts)
   5. Switch reads to new
   6. Stop writes to old
   7. Decommission old shard
```

Vitess (YouTube), Slack, and Stripe have all written extensively about this dance. **Consistent hashing + virtual nodes** minimize the data that has to move.

## 8.9 Spanner & TrueTime — strong consistency at planetary scale

Google's Spanner (a "CP" system) is the canonical answer to "can we have ACID transactions across continents?"

```
   Magic ingredient: TrueTime
     • Atomic clocks + GPS in every datacenter
     • API returns TT.now() = [earliest, latest] with bounded uncertainty (~7 ms)
     • Transactions wait out the uncertainty window before committing
     • External consistency (linearizability) over the whole planet
```

Implications: writes are slow-ish (commit wait), but reads (especially snapshot reads) are very fast and globally consistent. This is the trade-off Google made — and why **most** apps don't need it.

## 8.10 Distributed transactions without 2PC

- **Percolator** (Google, original BigTable transactions) — optimistic 2PC over Bigtable; powered the original web index.
- **Calvin** — pre-determine an order, then apply deterministically on all replicas (FaunaDB).
- **Sagas** (§7.7) — give up atomicity, embrace compensation.
- **Outbox + CDC** (§10.10) — local atomic write to DB + outbox table; CDC publishes to other systems eventually.

For most production systems, **sagas + outbox** is the modern, scalable answer.

## 8.11 Polyglot persistence — the right DB for each job

```
   ┌─────────────────────────────────────────────────────────┐
   │ User accounts        → Postgres (ACID, relational)       │
   │ Session / cache      → Redis                              │
   │ Product catalog      → Elasticsearch (search) + Postgres │
   │ Activity feed        → Cassandra (write-heavy timeline)  │
   │ Recommendations      → Neo4j (graph) or vector DB        │
   │ Analytics            → BigQuery / Snowflake              │
   │ Logs                 → Loki / Elasticsearch              │
   │ Metrics              → Prometheus / TSDB                 │
   │ Blob (images/video)  → S3                                │
   └─────────────────────────────────────────────────────────┘
```

This is the real-world architecture of almost every web-scale company. Each store is chosen for its access pattern, not by ideology.

## 8.12 Choosing a shard key — the decision that's hard to undo

Three properties of a good shard key:

1. **High cardinality** — millions of unique values, so load spreads.
2. **Even access pattern** — no single key should attract a hotspot.
3. **Co-locality** — values that need to be read together should land on the same shard (avoid cross-shard joins).

Bad shard keys: `status`, `country`, `created_date` (range scans turn into hotspots). Good: `user_id`, `tenant_id`, `hash(user_id) + bucket`. **You almost never get to change a shard key without a multi-month migration** — pick carefully.

---

# PART 9: DISTRIBUTED SYSTEMS THEORY

## 9.1 CAP Theorem

> **Official Definition (Brewer):** In a distributed data store, you can guarantee at most two of *Consistency, Availability, Partition tolerance.*

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

**Common misconception:** "I pick CA." There is no CA system in a real network — if you don't tolerate partitions, you don't have a distributed system.

## 9.2 PACELC — the more honest version

> **PACELC (Abadi):** If there's a Partition, choose A or C; *Else* (normal operation) choose between Latency and Consistency.

```
   PA/EL   Cassandra, DynamoDB    — favours availability and low latency
   PC/EC   Spanner, traditional   — favours consistency always
            RDBMS w/ sync replicas
```

This captures the *daily* trade-off, not just the rare partition.

## 9.3 Consistency models — the spectrum

```
   Strongest                                                Weakest
   ────────────────────────────────────────────────────────────────▶
   Linearizable  Sequential  Causal  Read-your-writes  Eventual
```

| Model | Plain English |
|-------|---------------|
| **Linearizable** | Every op appears atomic at a single global instant |
| **Sequential** | Same order on every node, but not real-time |
| **Causal** | If A happens before B, every node sees A first |
| **Read-your-writes** | You always see your own writes (others may lag) |
| **Eventual** | Given enough time and no new writes, replicas converge |

Higher consistency = more coordination = higher latency. Pick the weakest one your product can tolerate.

## 9.4 Consensus algorithms

> **Problem:** N nodes need to agree on one value even if some crash.

| Algorithm | Notable property | Used in |
|-----------|------------------|---------|
| **Paxos** | The classic; correct but hard to implement | Google Chubby, Spanner |
| **Multi-Paxos** | Paxos optimized for a stream of decisions | Many internal Google systems |
| **Raft** | Designed to be *understandable* | etcd, Consul, CockroachDB, TiKV |
| **Zab** | Atomic broadcast | Zookeeper |
| **PBFT / Tendermint** | Tolerates *Byzantine* (malicious) nodes | Blockchains |

### Raft in one paragraph

A leader is elected by majority vote. The leader sequences all writes into a log and replicates to followers. A write commits once a majority have it. If the leader dies, a new election (with randomized timeouts) picks another. That's it.

```
                       LEADER
                      ┌──────┐
   client ──write──▶  │  L   │ ──append entry──▶ followers ──ack──▶
                      └──┬───┘                       ▲
                         │ once majority acks         │
                         ▼                            │
                      commit ─── replicate commit ────┘
```

## 9.5 Consistent Hashing

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

**Virtual nodes:** to avoid imbalance, each physical server is placed on the ring many times (e.g., 100 virtual positions). This smooths load and lets you give beefier servers more virtual nodes.

Used in: Memcached client libs, Cassandra, DynamoDB, Riak, Akamai CDN.

## 9.6 Bloom filter

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

Variants: **Counting Bloom** (supports delete), **Cuckoo filter** (better space), **Quotient filter**.

## 9.7 Other probabilistic structures

- **HyperLogLog** — count distinct elements in ~12 KB with ~2% error (Redis `PFCOUNT`, BigQuery `APPROX_COUNT_DISTINCT`).
- **Count-Min Sketch** — frequency estimation in sublinear memory.
- **t-digest / DDSketch** — approximate quantiles (p99 latency).

## 9.8 Vector clocks & Lamport timestamps

In a distributed system without a global clock, how do you say "A happened before B"?

- **Lamport timestamp** — each node has a counter; on receive, take `max(local, msg) + 1`. Total ordering, but doesn't capture concurrency.
- **Vector clock** — each node maintains a counter *per node*. Compare component-wise to detect "happened-before" vs "concurrent." Used by Dynamo, Riak.

## 9.9 Two-phase commit (2PC) and why it hurts

```
   Phase 1: Coordinator asks all participants "can you commit?" — they vote
   Phase 2: If all yes → commit; else → abort
```

Blocking: if the coordinator dies mid-phase-2, participants are stuck holding locks. That's why modern systems prefer **sagas** or consensus-backed transactions (Spanner, Calvin).

## 9.10 Gossip, heartbeats, failure detection

How do nodes know who's alive in a cluster of thousands?

- **Heartbeat** — every node pings a known set every N ms.
- **Gossip protocol** — each node periodically tells a random other node what it knows. Information spreads epidemically. Used by Cassandra, Consul, Akka.
- **Phi accrual failure detector** — outputs a *suspicion level* instead of binary up/down (more robust to flaky networks).

## 9.11 Quorum math — N, W, R

Dynamo-style systems give you knobs:

- **N** = total replicas of a key
- **W** = writes that must ack
- **R** = reads that must respond

> **Rule of consistency:** if **W + R > N**, every read sees the latest write.

```
   N=3, W=2, R=2  →  W+R=4 > 3   strongly consistent (default Dynamo "quorum")
   N=3, W=1, R=1  →  W+R=2 ≤ 3   eventually consistent (fast, may be stale)
   N=3, W=3, R=1  →  fast reads, slow & fragile writes
   N=3, W=1, R=3  →  slow reads, fast writes
```

Tunable consistency per request — pick the trade-off that matches the operation (a tweet can be eventually consistent; a money transfer cannot).

## 9.12 Bloom filter math — sizing it for your workload

For a Bloom filter with `n` elements and target false-positive rate `p`:

```
   bits needed:        m = -n × ln(p) / (ln 2)²
   optimal hashes:     k = (m / n) × ln 2  ≈ 0.693 × m/n

   Example: 1M items, 1 % false positive
            m ≈ 9.6M bits ≈ 1.2 MB
            k = 7 hash functions
```

**Sweet spot:** ~10 bits/element for 1 % FPR. If you can't afford that, accept a higher FPR (rarely a problem — false positives just trigger an extra real lookup).

## 9.13 CRDTs — data types that merge themselves

> **Problem:** Concurrent updates on replicas without coordination → conflicts.
> **CRDT idea:** Use data structures whose merge function is associative, commutative, and idempotent. Apply ops in *any order* on *any replica* and they all converge.

| Type | Examples | Use case |
|------|----------|----------|
| **G-Counter** | Per-replica counter; merge = max per slot | Page-view counter |
| **PN-Counter** | Two G-Counters: +1s and −1s | Likes / dislikes |
| **LWW-Register** | Value + timestamp; latest wins | Simple K/V with last-write-wins |
| **OR-Set** | Observed-remove set with unique tags | Shopping cart |
| **RGA / WOOT** | Sequence with positions | Collaborative text editing |
| **MV-Register** | Multi-value register | Dynamo conflict resolution |

CRDTs power Redis Enterprise multi-master, Riak, Automerge (Google Docs-style real-time editing), and parts of Apple iCloud.

## 9.14 FLP impossibility — and what it means in practice

> **FLP theorem (Fischer, Lynch, Paterson, 1985):** In an asynchronous system with even *one* faulty process, no deterministic consensus protocol can guarantee termination.

In English: you can't have a consensus protocol that's *always* fast, *always* safe, and *always* live with even one crashed node — given a fully async network.

How real systems escape it:
- **Use timeouts** (assume "synchrony in practice") — Raft, Paxos.
- **Sacrifice liveness occasionally** — system pauses (rare leader election) rather than answering wrong.
- **Add randomization** — randomized election timeouts in Raft break ties.

The takeaway: every consensus protocol you'll use chooses **safety over liveness** when the network is partitioned. Reads/writes pause; they don't lie.

## 9.15 Raft — the algorithm in 6 rules

```
   1. There's at most one leader per term.
   2. Leader handles all writes; replicates entries to followers.
   3. An entry is "committed" once a majority of followers have it.
   4. A leader never overwrites or deletes entries in its log.
   5. If a follower's log is missing the leader's entry, it gets backfilled.
   6. Only nodes with up-to-date logs can win elections.
```

Two RPCs implement the whole protocol: `RequestVote` and `AppendEntries`. Used in etcd, Consul, TiKV, CockroachDB, MongoDB (replica set), and many more.

## 9.16 CAP in a nutshell — the decision table

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

## 9.17 Idempotency tokens in distributed flows

```
   Request:  POST /charge   Idempotency-Key: 9f4a-...
             body: {amount: 1000, customer: 42}

   Server:  - check token in DB; if seen → return original response
            - else: process → record (token, response) → return
            - keep tokens for 24h (Stripe convention)
```

Combined with retry-after on 5xx and exponential backoff on the client, this turns flaky networks into a non-issue. Built into Stripe, AWS, and most modern payment systems.

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
| Hot photo (viral) | CDN absorbs reads; like counter sharded via §9.13 PN-Counter |
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
