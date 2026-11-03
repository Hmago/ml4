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

![Map infographic 'Before You Draw Boxes': the four jobs INGEST (Kafka, webhooks, HTTP APIs) → STORE (Postgres, S3, Cassandra) → PROCESS (Spark, Flink, Airflow) → SERVE (Redis, CDN, Load balancer); the COST / PERFORMANCE / RELIABILITY triangle ('Pick two — pay for the third'); 8 NFR question tiles (Scale, Availability, Latency, Consistency, Durability, Cost, Geography, Compliance); a C-leaning ↔ A-leaning CAP/PACELC slider placing money/orders and config/locks on the C side and feeds/likes, chat and search index on the A side; and a pick-by-question table (too many users → load balancer, same reads → cache, DB too big → sharding).](diagrams/sd23_info_before_you_draw_ai.png)

<details>
<summary><strong>Read as text</strong> — the problem-to-block idea and the four jobs</summary>

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

</details>

## 1.2 The three forces that shape every system

<details>
<summary><strong>Read as text</strong> — cost, performance and reliability</summary>

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

</details>

---

# PART 2: CORE CONCEPTS

## 2.1 Scalability

![Infographic 'Scale Up vs Scale Out — and the Cost of Every Nine': one bigger server (hardware ceiling, SPOF) vs four boxes S1–S4 behind a load balancer; a staircase of nines with downtime per year (99% ≈ 3.65 days, 99.9% ≈ 8.76 hours, 99.99% ≈ 52.6 minutes, 99.999% ≈ 5.26 minutes, 99.9999% ≈ 31.5 seconds) and rising cost; the formula Availability = MTBF / (MTBF + MTTR) with 1,000 / 1,001 ≈ 99.9%; availability vs reliability vs durability; a vertical vs horizontal comparison table; and when to scale out vs scale up.](diagrams/sd23_info_scale_availability_ai.png)

<details>
<summary><strong>Read as text</strong> — scale up vs scale out and the modern default</summary>

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
| Scale ceiling | Biggest machine you can buy | ~ unlimited |
| Downtime to scale | Often needed | Zero |
| Failure model | One big SPOF | Designed to lose nodes |

**Modern default:** scale horizontally for the web tier, scale vertically for the database (until you can't, then shard).

</details>

## 2.2 Availability, Reliability, Durability

<details>
<summary><strong>Read as text</strong> — the three terms and the MTBF/MTTR formula</summary>

| Term | Plain English | Measured by |
|------|---------------|-------------|
| **Availability** | Is the system *up right now?* | % uptime ("five 9s" = 99.999%) |
| **Reliability** | Does it produce correct results consistently? | MTBF (mean time between failures) |
| **Durability** | Once written, does data survive? | "11 nines" on S3 = 99.999999999% |

Availability and reliability are linked by one formula: **Availability = MTBF / (MTBF + MTTR)**, where MTTR is the *mean time to repair*. A server that fails every 1,000 hours and takes 1 hour to fix is up 1,000 / 1,001 ≈ **99.9 %** of the time — so you buy nines either by failing less often or by recovering faster.

</details>

### The nines table — burn this into memory

<details>
<summary><strong>Read as text</strong> — each level of nines and its yearly downtime</summary>

```
   Availability      Downtime per year
   ────────────      ─────────────────
   99%      (2 9s)   ≈ 3.65 days
   99.9%    (3 9s)   ≈ 8.76 hours
   99.99%   (4 9s)   ≈ 52.6 minutes
   99.999%  (5 9s)   ≈ 5.26 minutes
   99.9999% (6 9s)   ≈ 31.5 seconds
```

Adding a "9" gets exponentially harder and more expensive. In interviews, justify the level you pick — "we'll target 99.9% which gives us ~8.76h/year, acceptable for an internal tool."

</details>

## 2.3 Latency vs. Throughput

![Infographic 'Latency, Percentiles & Tail Amplification': latency (one request) vs throughput (requests per second) with the freeway/car analogy; a sorted-requests bar split fastest 50% / next 45% / next 4% / 1% with p50, p95 and p99 marked and the 1% labelled 'the tail: optimise this'; a fan-out from one user to N backends (one slow) with chance ≥ 1 slow = 1 − 0.99^N; a table N = 1 → 1% (user p99 ≈ backend p99, 100 ms), N = 10 → 9.6% (≈ backend p99.9), N = 100 → 63% (≈ backend p99.99); example p50 = 50 ms, p99 = 2 s and 20 calls → 1 − 0.99^20 ≈ 18%.](diagrams/sd23_info_latency_tail_ai.png)

<details>
<summary><strong>Read as text</strong> — one request vs requests per second</summary>

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

</details>

### Latency percentiles — why averages lie

<details>
<summary><strong>Read as text</strong> — what p50, p95 and p99 mean and why averages lie</summary>

A **percentile** pXX is the latency that XX % of requests beat. **p99 = 300 ms** means 99 % of requests finished in 300 ms or less and the slowest 1 % took longer. p50 is the median; p999 means p99.9.

```
   All requests, sorted from fastest to slowest:
   ┌──────────────────────────┬────────────────────┬──────────┬─────┐
   │ fastest 50 %             │ next 45 %          │ next 4 % │ 1 % │
   └──────────────────────────┴────────────────────┴──────────┴─────┘
                              ▲                    ▲          ▲
                             p50                  p95        p99 ◀── the tail: optimise this
```

If your p50 is 50 ms but p99 is 2 s, **1 in 100 requests waits 2 s or more** — and users make many requests, so far more than 1 % of *users* feel it (a page that makes 20 such calls hits at least one slow one 1 − 0.99²⁰ ≈ **18 %** of the time). At Google scale (billions of requests a day) 1 % is tens of millions of bad experiences. An average hides all of this — always quote p50/p95/p99/p999.

</details>

## 2.4 Non-Functional Requirements (NFRs)

<details>
<summary><strong>Read as text</strong> — the eight questions to ask before drawing boxes</summary>

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

</details>

## 2.5 Little's Law — the one equation that explains queues

![Infographic 'Little's Law, Amdahl & the Universal Scalability Law': a pipe with λ = 1,000 rps arriving, W = 50 ms and L = 50 in flight (L = λ × W), plus pool sizing 500 QPS × 0.020 s × 1.5 = 15 connections per app instance; a schematic speedup-vs-N chart with an ideal linear line, an Amdahl s = 0.1 curve flattening under a 10× ceiling (16 cores ≈ 6.4×) and a USL curve that peaks then falls ('more nodes = slower'); the Amdahl and USL formulas (α = contention, β = coherency); a law/example/lesson table; and the trap of scaling out while a shared database, global lock or single auth service is the choke point.](diagrams/sd23_info_scaling_laws_ai.png)

<details>
<summary><strong>Read as text</strong> — L = λ × W and sizing pools with it</summary>

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

</details>

## 2.6 Amdahl's Law and the Universal Scalability Law

<details>
<summary><strong>Read as text</strong> — the serial wall and the coherency cost</summary>

> **Amdahl:** Speedup from N processors is bounded by the serial fraction `s` of the work (the part that cannot run in parallel):
>
> **Speedup ≤ 1 / (s + (1−s)/N)**

If 10 % of your work is inherently serial (s = 0.1), 16 cores give at most 1 / (0.1 + 0.9/16) ≈ **6.4×**, and even infinite cores cap you at 1 / 0.1 = **10×**. That serial bit becomes the wall.

> **Universal Scalability Law (Gunther):** adds a *coherency* cost (nodes keeping each other in sync) on top of Amdahl:
>
> **Throughput(N) ∝ N / (1 + α(N−1) + βN(N−1))**, where α is the contention (serial) cost and β the coherency cost.
>
> Because the β term grows with N², real systems often *slow down* past some N — adding more nodes makes things worse.

**Practical lesson:** find and shrink the serial choke point *before* adding boxes. The choke point is usually a shared database, a global lock, or a single auth service.

</details>

## 2.7 Tail-latency amplification — why p99 dominates user-facing latency

<details>
<summary><strong>Read as text</strong> — the fan-out maths and hedged requests</summary>

If a request fans out to N backends in parallel and you wait for *all* of them, the user's latency is the **max** of N draws — dominated by the slow tail.

```
   Each backend: p99 = 100 ms, i.e. 1 % of its calls are slower than that.
   Chance one fan-out request hits at least one slow backend = 1 − 0.99^N

   N = 1      →  1 %      user p99 ≈ backend p99   (100 ms)
   N = 10     →  9.6 %    user p99 ≈ backend p99.9
   N = 100    →  63 %     user p99 ≈ backend p99.99
```

A 1-in-100 slow backend makes **63 %** of user requests slow at fan-out 100 (1 − 0.99¹⁰⁰ ≈ 0.63). This is why Google obsesses over tail latency and uses **hedged requests** (Ch 25, §13.7).

</details>

## 2.8 The CAP/PACELC mental shortcut for any product

<details>
<summary><strong>Read as text</strong> — placing a product on the consistency map</summary>

**CAP** says: when a network **P**artition cuts your replicas apart, each side must choose between **C**onsistency (refuse requests it can't answer correctly) and **A**vailability (answer anyway, possibly with stale data). **PACELC** adds: **E**lse — when the network is healthy — you still trade **L**atency against **C**onsistency, because waiting for replicas to agree takes time. (Full treatment: Ch 24, §9.2–9.3.)

Before designing, place the product on this map:

```
   Money / inventory / orders        → C-leaning. Refuse rather than be wrong.
   Social feeds / likes / counters   → A-leaning. Eventual consistency is fine.
   Chat                              → A-leaning, but with per-conversation order.
   Search index                      → A-leaning, with bounded staleness.
   Configuration / locks             → C-leaning. Use etcd / ZooKeeper.
```

Naming this trade-off in the first 60 seconds of a design discussion immediately signals seniority.

</details>

---

# PART 3: NETWORKING & COMMUNICATION

> **The goal of this part:** give you enough networking intuition to (a) reason about end-to-end latency, (b) pick the right protocol for the job, and (c) recognise the classic failure modes that turn a healthy system into a brownout. Every later part (load balancing, caching, CDN, observability) sits on top of these ideas.

## 3.1 The protocol stack — OSI, TCP/IP, and what your packet actually looks like

![Comparison infographic 'The Protocol Stack & TCP vs UDP': OSI 7 layers colour-mapped to TCP/IP 4 (Application = 7/6/5, Transport = 4, Internet = 3, Link = 2/1) with examples and L7 vs L4 load balancers; a packet strip Ethernet 14 B | IP 20 B | TCP 20+ B | HTTP request | FCS 4 B (≈ 58 B framing per packet); a socket 5-tuple and Linux ephemeral ports 32768–60999 ≈ 28K (run out → EADDRNOTAVAIL); TCP as a phone call vs UDP as postcards (8-byte header, no handshake/retransmit/ordering); an 'if you need → use' table (DNS, video/voice/games, telemetry, multicast → UDP; HTTP/3 → QUIC over UDP); and common mix-ups.](diagrams/sd23_info_protocol_stack_tcp_udp_ai.png)

<details>
<summary><strong>Read as text</strong> — OSI vs TCP/IP layers and the L4/L7 vocabulary</summary>

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

</details>

### Encapsulation — what's actually on the wire

<details>
<summary><strong>Read as text</strong> — one header per layer and the framing cost</summary>

Every layer wraps the layer above it with its own header. By the time your `GET /` reaches the wire, it looks like:

```
   ┌──────────┬──────────┬──────────┬─────────────────┬──────┐
   │ Ethernet │   IP     │   TCP    │   HTTP request  │ FCS  │
   │ header   │ header   │ header   │  GET / HTTP/1.1 │      │
   │ (14 B)   │ (20 B)   │ (20+ B)  │      ...        │ (4 B)│
   └──────────┴──────────┴──────────┴─────────────────┴──────┘
   │◀───────────────── one Ethernet frame ──────────────────▶│
```

Each receiving layer peels off its header and hands the rest up. Every packet pays about **58 bytes of framing** (14 + 20 + 20 + 4) — small next to a full 1,460-byte payload, but bigger than a 40-byte chat message. That's why protocols that send many tiny messages waste a surprising share of the link on headers.

</details>

### Sockets — the API your code actually uses

<details>
<summary><strong>Read as text</strong> — the 5-tuple and the ephemeral-port budget</summary>

Your code never touches packets directly: it opens a **socket** — an OS handle for one end of a connection — and reads/writes bytes. Each TCP connection behind a socket is identified by the 5-tuple `(protocol, src IP, src port, dst IP, dst port)`, and no two live connections may share one. With the destination fixed, only the 16-bit source port can vary — so one source IP can hold at most **~64K connections to one (dst IP, dst port)**, and by default far fewer: Linux hands out ephemeral ports from 32768–60999 (**~28K**). Behind NAT, every client shares the NAT's public IP and therefore this one budget. Run out and `connect()` fails with `EADDRNOTAVAIL`.

</details>

### TCP vs UDP — the headline comparison

<details>
<summary><strong>Read as text</strong> — phone call vs postcards, side by side</summary>

Almost everything on the internet rides on one of two transport protocols. They solve the same problem (moving bytes between two programs across a network) with very different trade-offs, so it helps to understand each one on its own before comparing them.

**TCP — Transmission Control Protocol.** Think of TCP as a **phone call**. Before you can talk, both sides have to pick up and say "hello" (the handshake). Once connected, the protocol guarantees that every word you say arrives at the other end **in the right order, with nothing missing**. If the line drops a syllable, TCP automatically asks for it again behind the scenes. You don't see the retransmits — your application just sees a clean, ordered stream of bytes. This safety costs setup time (a round-trip before any data) and per-packet bookkeeping (sequence numbers, acknowledgements, windows). Use TCP whenever **losing or reordering bytes would break meaning** — loading a web page, querying a database, transferring a file, an SSH session.

**UDP — User Datagram Protocol.** Think of UDP as **shouting postcards into a crowd**. You write the destination on each one, fling it, and hope it arrives. There's no handshake, no retransmission, no ordering — if a postcard goes missing or arrives late, that's the application's problem. The header is tiny (8 bytes vs TCP's 20+) and there's **zero round-trip setup**, so the first message can carry real data. Use UDP when **a missing or late packet is cheaper than waiting for it** — a DNS lookup (just ask again), a live video frame (the next one is already on the way), a voice call, an online game, real-time telemetry, or anything multicast.

Here they are side by side:

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

</details>

## 3.2 TCP deep dive — handshakes, windows, and congestion control

![Infographic 'Inside TCP': a Client/Server sequence diagram SYN (seq=x) → SYN-ACK (seq=y, ack=x+1) → ACK (ack=y+1) = 1 RTT, connection established, 4-way FIN/ACK teardown and TIME_WAIT 60 s (Linux) on the client; a cwnd sawtooth (slow start ~10 packets ×2 per RTT, loss → halve, +1 packet per RTT) with CUBIC (cuts to 70%, not 50%) and BBR (measures bandwidth + RTT); flow control protects the receiver vs congestion control protects the network; ~28K ports × 60 s ≈ 470 new connections/s → EADDRNOTAVAIL; a gotcha/cost/fix table (Nagle + delayed ACK up to 200 ms → TCP_NODELAY, keep-alive 2 h → seconds, head-of-line blocking → HTTP/3 on QUIC, 100 × 50 KB vs one pooled 5 MB).](diagrams/sd23_info_tcp_internals_ai.png)

### The 3-way handshake — opening a connection

<details>
<summary><strong>Read as text</strong> — SYN, SYN-ACK, ACK and the round-trip it costs</summary>

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

That's **1 round-trip** before you can send any data. A **round-trip time (RTT)** is how long one message takes to go there and the reply to come back. On a link with a 150 ms RTT, the handshake costs 150 ms on every new connection — which is why connection pooling and keep-alive matter so much.

</details>

### The 4-way teardown — and why TIME_WAIT exists

<details>
<summary><strong>Read as text</strong> — FIN/ACK, TIME_WAIT and running out of ports</summary>

Closing a TCP connection takes **four packets** (FIN/ACK from each side) because either end can finish sending independently. The side that closes first then sits in a **TIME_WAIT** state — **60 seconds on Linux** (the spec says 2 × MSL, the Maximum Segment Lifetime, which some OSes set as high as 4 minutes). During that time it keeps the connection's (src IP, src port, dst IP, dst port) reserved, so it can re-send the final ACK if that got lost and so straggler packets from the dead connection aren't misdelivered into a brand-new connection that reuses the same ports.

> **Why you care:** a client that opens and closes fresh connections to the same server quickly runs out of ephemeral source ports — with Linux's ~28K ports each parked for 60 s, that's only about **470 new connections per second** to one destination — and then fails with `EADDRNOTAVAIL`. The cure is to **reuse pooled connections** instead of closing and reopening them.

</details>

### Sequence numbers, sliding window, and flow control

<details>
<summary><strong>Read as text</strong> — the receiver's window and flow control</summary>

TCP numbers every byte it sends, and the receiver advertises a **window** — "I have room for N more bytes before my buffer is full." The sender keeps that many bytes in flight, then pauses until incoming ACKs free up window space again. This is **flow control**, and its only job is to stop a fast sender from drowning a slow receiver.

</details>

### Congestion control — protecting the network

<details>
<summary><strong>Read as text</strong> — slow start, AIMD, CUBIC and BBR</summary>

Flow control stops the **sender** from overwhelming the **receiver**. **Congestion control** stops senders from overwhelming the **network in between** — the shared routers and links where everyone's traffic meets.

The mental picture: every TCP sender keeps a budget called the **congestion window (cwnd)** — "how many bytes am I allowed to have in flight right now?" If packets get through cleanly, the sender slowly increases the budget. If a packet is lost (a sign that some router's queue overflowed), the sender slashes the budget. Every TCP flow on the internet is constantly probing and backing off in this way; together they self-regulate so no single flow hogs the link.

There are three phases:

1. **Slow start (the cold open).** A brand-new connection begins with a tiny budget — about **10 packets** in flight. After every successful round-trip, the budget **doubles**. Despite the name, this is *exponential* growth, so the sender quickly discovers the link's real capacity instead of crawling.
2. **Congestion avoidance (the cruise).** Once the budget reaches a threshold remembered from the last loss (`ssthresh`, the "danger zone"), growth flattens to roughly **+1 packet per round-trip** — careful probing for more bandwidth.
3. **Loss → back off.** When a lost packet is detected (by duplicate ACKs), the sender **halves** its budget and goes back to careful growth. If the loss is only noticed by a timeout (nothing came back at all), it drops all the way to slow start again. This pattern (gentle build-up, sharp cut on loss) is called **AIMD** — Additive Increase, Multiplicative Decrease.

```
   cwnd (packets in flight)
    ▲         loss         loss         loss
    │          ▼            ▼            ▼
    │         /|          .'|          .'|
    │        / |        .'  |        .'  |
    │       /  |      .'    |      .'    |
    │      /   |    .'      |    .'      |
    │     /    |  .'        |  .'        |  .'
    │    /     |.'          |.'          |.'
    │   /    halve        halve        halve
    │  /      then +1 packet per RTT
    │ _
    └─────────────────────────────────────────────▶ time
      slow start: ×2 per RTT
```

Modern data centres and mobile networks use smarter algorithms — **CUBIC** (the Linux default) cuts less on loss (to 70 %, not 50 %) and climbs back toward the old peak faster, and **BBR** (Google) does not use loss as its main signal: it measures the bottleneck bandwidth and round-trip time and paces sending to match (BBR v1 ignored loss entirely; v2/v3 also back off on heavy loss or ECN — Explicit Congestion Notification — marks set by busy routers). BBR is dramatically better on Wi-Fi and cellular, where losses are usually radio noise, not congestion.

> **Why you care as a system designer:** every brand-new TCP connection starts in slow start with a tiny budget. A burst of 100 short-lived connections each sending 50 KB pays the slow-start tax **100 times** — most of those bytes go out at a small fraction of the link's real speed. One persistent, pooled connection sending 5 MB pays the tax **once** and then runs at full speed for the rest of its life. This single fact is the reason HTTP keep-alive, connection pooling, and gRPC's long-lived channels exist.

</details>

### Other TCP gotchas you'll meet in production

<details>
<summary><strong>Read as text</strong> — Nagle, SACK, keep-alive and head-of-line blocking</summary>

- **Nagle's algorithm** — coalesces small writes to avoid the "tinygram" problem. Combined with **delayed ACK** it can add up to 200 ms latency on chatty request/response. Fix: `TCP_NODELAY` for interactive protocols.
- **SACK** (Selective ACK) — receiver can ACK non-contiguous ranges, so one lost packet doesn't force retransmission of everything that followed.
- **TCP keep-alive** — by default (Linux) the kernel waits **2 hours** of idleness before sending its first probe to detect a dead peer. **Way too long** for service-to-service; tune it to seconds.
- **Head-of-line (HOL) blocking** — TCP delivers in order, so one lost packet stalls everything behind it. This is why HTTP/3 moved to QUIC over UDP.

</details>

## 3.3 UDP deep dive — when stateless wins

<details>
<summary><strong>Read as text</strong> — the 8-byte header and when UDP wins</summary>

UDP is "IP + ports + a checksum." That's it. **8-byte header**, no connection, no retransmit, no ordering, no congestion control.

```
   ┌──────────────┬──────────────┬──────────┬──────────┐
   │ src port (2) │ dst port (2) │ len (2)  │ csum (2) │
   └──────────────┴──────────────┴──────────┴──────────┘
   │                       payload                     │
```

**When UDP wins:**

- **DNS** — single request/response, retransmit is cheap, handshake would double latency.
- **Video / voice** — late packets are useless; better to skip and play the next frame.
- **Gaming** — same reason: stale position updates are worthless.
- **QUIC / HTTP/3** — uses UDP as a thin transport and builds reliability + congestion control in user space.
- **Telemetry** (statsd, syslog) — occasional loss is acceptable; servers can't afford TCP connections from millions of agents.
- **Multicast / broadcast** — TCP can't do these (unicast only); UDP can.

**Cost:** if you need reliability or ordering, you build it yourself in the app layer (QUIC, DTLS, RTP/RTCP, custom protocols). That's a lot of complexity to get right.

</details>

## 3.4 HTTP/1.0, HTTP/1.1, HTTP/2, HTTP/3 — what changed and why

![Infographic comparing HTTP/1.1, HTTP/2 and HTTP/3: a 1991–2022 version timeline (0.9, 1.0, 1.1, 2, 3); three columns showing HTTP/1.1 using ~6 parallel connections with one request each, HTTP/2 multiplexing streams on one TCP pipe where one lost packet stalls all streams, and HTTP/3 over QUIC (UDP) where a loss stalls only its own stream; a request/response example (GET /api/users/42 → 200 OK, ETag "v17", Content-Length: 22, {"id":42,"name":"Ada"}); and a Safe/Idempotent/Cacheable grid for GET, POST, PUT, PATCH, DELETE.](diagrams/sd23_info_http_evolution_ai.png)

<details>
<summary><strong>Read as text</strong> — the version timeline</summary>

```
   HTTP/0.9 (1991)  one-line GET, no headers, no status codes — historical
   HTTP/1.0 (1996)  headers, status codes, but one request per TCP conn
   HTTP/1.1 (1997)  persistent connections (keep-alive), pipelining, Host:
   HTTP/2   (2015)  binary framing, multiplexed streams, HPACK compression
   HTTP/3   (2022)  same features as HTTP/2, but over QUIC (UDP) — no TCP HOL, faster handshake
```

</details>

### HTTP/1.1 — the 25-year workhorse

<details>
<summary><strong>Read as text</strong> — keep-alive, pipelining and six connections per origin</summary>

- **Persistent connections (keep-alive)** — many sequential requests on one TCP conn.
- **Pipelining** — send multiple requests without waiting for responses. *In practice, browsers disabled it* because intermediaries broke it and HOL blocking still applied.
- **`Host:` header** — required; enabled virtual hosting (many sites per IP).
- **Chunked transfer encoding** — server streams body without knowing total length up front.
- **Limitation:** one in-flight request per connection. Browsers compensate by opening **~6 parallel connections per origin**, which is why "domain sharding" was a thing.

</details>

### HTTP/2 — binary, multiplexed, compressed

<details>
<summary><strong>Read as text</strong> — frames, streams, HPACK and TCP head-of-line blocking</summary>

- **Binary framing layer** — frames of types DATA, HEADERS, SETTINGS, RST_STREAM, PING, GOAWAY, …
- **Streams** — concurrent virtual channels over one TCP connection, each with its own ID. (The original per-stream priority tree was deprecated in 2022 — RFC 9113 — and replaced by the simpler `Priority` header of RFC 9218.)
- **HPACK header compression** — both ends keep a table of headers already sent on this connection, so a repeated header (cookies, user-agent) is sent as a small index number instead of the full text. Repeat requests carry only a few bytes per repeated header.
- **Server push** — server sends resources the client hasn't asked for yet. *Effectively dead:* Chrome removed it in 2022 because caches couldn't tell what the client already had; use the `103 Early Hints` status instead.
- **Single TCP connection** — fixes the 6-conn-per-origin hack.
- **Limitation:** one lost TCP packet stalls **every** stream because TCP delivers in order. That's TCP-layer HOL blocking, which HTTP/3 fixes.

</details>

### HTTP/3 — HTTP semantics over QUIC

<details>
<summary><strong>Read as text</strong> — QUIC, independent streams and the fused handshake</summary>

HTTP/3 keeps everything HTTP/2 added (binary frames, header compression — now called QPACK, concurrent streams on one connection) but **rips out TCP** and replaces it with a new transport called **QUIC**, which runs on top of UDP. The reason is a stubborn problem in HTTP/2: even though many requests share one TCP connection, TCP itself delivers bytes in strict order — so a **single dropped packet stalls every request** on that connection until it's retransmitted. That's TCP-layer head-of-line (HOL) blocking, and HTTP/2 can't fix it because the blockage lives one layer below.

QUIC was built to make each request stream genuinely independent. Here's what HTTP/3 actually buys you:

- **No more TCP-layer head-of-line blocking.** QUIC tracks each request's packets separately. If one packet for request A is lost, requests B, C, D keep flowing. On a flaky Wi-Fi or 4G link this is a noticeable speedup.
- **One handshake for transport *and* encryption.** With HTTPS over TCP, the browser first does a TCP handshake (1 round-trip) and *then* a TLS handshake (1 more with TLS 1.3, 2 more with TLS 1.2) before sending the actual HTTP request — 2–3 round-trips of pure waiting before any data. QUIC fuses them into **1 round-trip** for a fresh connection, and **0 round-trips** for a resumed one (it can send the first HTTP request inside the very first packet).
- **Connection survives network changes.** A normal connection is identified by your IP and port — switch from Wi-Fi to 5G and the IP changes, killing the connection. QUIC identifies connections by a random ID instead, so the same session keeps streaming a video as your phone hops networks.
- **Lives in user space, not the kernel.** QUIC ships inside the browser or server library, not the operating system. New congestion-control algorithms and security fixes roll out by updating the app, instead of waiting years for OS kernels everywhere to upgrade.

Google (Search, YouTube), Meta and the big CDNs (Cloudflare, Akamai, Fastly, CloudFront) serve HTTP/3 to clients that support it. A browser usually learns that a site speaks HTTP/3 from an `Alt-Svc` response header (or a DNS `HTTPS` record), so the very first visit may still go over TCP.

**Mental shortcut:** HTTP/3 = HTTP/2's good ideas, minus TCP's baggage, plus a faster handshake.

</details>

## 3.5 HTTP request/response anatomy

<details>
<summary><strong>Read as text</strong> — a request and its response, line by line</summary>

```
   REQUEST                                  RESPONSE
   ────────────────────────────────         ─────────────────────────────
   GET /api/users/42 HTTP/1.1               HTTP/1.1 200 OK
   Host: api.example.com                    Content-Type: application/json
   Accept: application/json                 Cache-Control: max-age=60
   Authorization: Bearer eyJhbGc…           ETag: "v17"
   User-Agent: curl/8.4                     Content-Length: 22

                                            {"id":42,"name":"Ada"}
```

</details>

### HTTP methods — semantics matter

<details>
<summary><strong>Read as text</strong> — safe, idempotent and cacheable verbs</summary>

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

</details>

### Useful headers you'll meet daily

<details>
<summary><strong>Read as text</strong> — auth, negotiation, range and tracing headers</summary>

- **`Authorization`** — bearer tokens, Basic auth, etc.
- **`Accept` / `Content-Type`** — content negotiation (JSON vs Protobuf vs MsgPack).
- **`Accept-Encoding` / `Content-Encoding`** — compression negotiation (gzip, br, zstd).
- **`Range` / `Content-Range`** — partial downloads for video seek, resumable uploads.
- **`X-Forwarded-For` / `Forwarded`** — original client IP when behind a proxy/LB.
- **`X-Request-Id` / `traceparent`** — correlation across services.

</details>

## 3.6 HTTP caching — `Cache-Control`, `ETag`, and friends

![Infographic on HTTP caching, cookies, CORS and compression: a browser → cache → server flow where fresh copies are served locally, stale ones revalidate with If-None-Match "v17" and get 304 Not Modified (~150 B), and changed ones return 200 + new body; a Set-Cookie sid=abc123 with HttpOnly, Secure and SameSite=Lax badges; a 3-step CORS preflight (OPTIONS → Allow-Origin/Methods, Max-Age: 600 → PUT); gzip/brotli (15–25% smaller)/zstd (~3× faster decode) bars; and a Cache-Control directive table (public, private, max-age, no-cache, no-store, immutable).](diagrams/sd23_info_http_browser_ai.png)

<details>
<summary><strong>Read as text</strong> — freshness vs validation</summary>

Two questions: **(1) Can I reuse the cached copy without asking?** (freshness) **(2) If not, can I cheaply confirm it's still good?** (validation).

</details>

### Freshness — `Cache-Control`

<details>
<summary><strong>Read as text</strong> — the Cache-Control directives</summary>

```
   Cache-Control: public, max-age=3600, stale-while-revalidate=60
```

- `public` / `private` — `public`: any cache, including shared ones like a CDN, may store it; `private`: only the user's own browser may (per-user data).
- `max-age=N` — fresh for N seconds.
- `s-maxage=N` — same but only for shared caches (CDNs).
- `no-cache` — must revalidate every time (you can still store).
- `no-store` — don't store at all (sensitive data).
- `immutable` — never check again (perfect for content-addressed `app.abc123.js`).
- `stale-while-revalidate=N` — serve stale up to N seconds while refetching in background.
- `stale-if-error=N` — serve stale on origin error.

</details>

### Validation — `ETag` and `Last-Modified`

<details>
<summary><strong>Read as text</strong> — conditional requests and 304 Not Modified</summary>

When the cached copy goes stale, the client revalidates instead of re-downloading:

```
   GET /avatar.png
   If-None-Match: "v17"
   ────────────────────▶
                              ◀─── 304 Not Modified   (no body, ~150 bytes)
```

- **`ETag`** — opaque version identifier (often a content hash). Strong (`"abc"`) vs weak (`W/"abc"`).
- **`Last-Modified` + `If-Modified-Since`** — date-based; coarser than ETag.

</details>

### `Vary` — caches are per-representation

<details>
<summary><strong>Read as text</strong> — one cached copy per header value</summary>

```
   Vary: Accept-Encoding, Accept-Language
```

Tells caches "store a separate copy per value of these headers" — otherwise you'll serve a Korean visitor the cached English copy. Be sparing: each value multiplies cache fragments.

</details>

## 3.7 Cookies, sessions, and CORS

### Cookie attributes you must set in 2026

<details>
<summary><strong>Read as text</strong> — HttpOnly, Secure and the SameSite modes</summary>

```
   Set-Cookie: sid=abc123;
               HttpOnly;        ← JS can't read it (XSS protection)
               Secure;          ← only over HTTPS
               SameSite=Lax;    ← block most CSRF; None requires Secure
               Path=/;
               Max-Age=3600;
               Domain=example.com
```

- **`SameSite=Strict`** — never sent on cross-site requests, so you look logged-out when you arrive via a link from another site.
- **`SameSite=Lax`** — also sent on top-level GET navigations from other sites. Sensible default (Chrome applies it when the attribute is missing).
- **`SameSite=None`** — sent always. **Must** also set `Secure` (Chrome enforces).

</details>

### CORS — Cross-Origin Resource Sharing

<details>
<summary><strong>Read as text</strong> — same-origin policy, preflight and common mistakes</summary>

Browsers enforce the **same-origin policy** (an *origin* is scheme + host + port). JavaScript on one origin may not **read** responses from another origin unless that server opts in via CORS headers. For "non-simple" requests (e.g. `PUT`, JSON bodies, custom headers) the browser first asks permission with a **preflight** and won't send the real request at all if the answer is no.

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
- Echoing the `Origin` header back without checking it against an allow-list — effectively allows *any* origin.
- Forgetting to handle `OPTIONS` in your routing — preflight 404s.

> **Reminder:** CORS protects the **browser user**, not your server. A curl/server-to-server call ignores CORS entirely. Don't use it as auth.

</details>

## 3.8 Content compression — gzip, brotli, zstd

<details>
<summary><strong>Read as text</strong> — gzip vs brotli vs zstd, and the BREACH attack</summary>

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

**Security note:** compressing responses that mix attacker-controlled input and secrets (e.g. a CSRF token) over TLS enables the **BREACH** attack — the attacker guesses the secret one character at a time by watching the compressed size shrink when a guess matches. (CRIME was the same trick against TLS-level compression, which is now disabled everywhere.) Mitigation: don't reflect user input alongside secrets, or disable compression on those endpoints.

</details>

## 3.9 DNS — the phone book of the internet

![Infographic on DNS: a hierarchy tree from the root '.' (13 named servers A–M, anycast) to the com/org TLDs, example.com's authoritative servers and www/api A/AAAA records; a 5-step recursive-resolution sequence where the laptop asks a resolver for google.com, which asks root ('go ask com'), the com TLD ('ask ns.google.com') and the authoritative server ('142.250.x.x'), with both caching for the TTL; caching layers browser → OS → ISP/resolver → authoritative; a record-type table (A, AAAA, CNAME, MX, TXT, NS); and TTL guidance (30–60 s for fast failover, 1 h–1 day for stable infrastructure).](diagrams/sd23_info_dns_ai.png)

<details>
<summary><strong>Read as text</strong> — names to IP addresses</summary>

> **Simple Explanation:** You typed `google.com`; DNS turned it into `142.250.190.78`. Without DNS, you'd memorise IPs.

</details>

### The hierarchy

<details>
<summary><strong>Read as text</strong> — root, TLD and authoritative servers</summary>

```
                                  .  (root: 13 named servers A–M,
                                ╱   ╲   each anycast to many sites)
                             com     org   ← TLD (Top-Level Domain)
                              │
                          example.com      ← Authoritative name servers
                            ╱      ╲
                       www         api     ← A / AAAA records
```

</details>

### Recursive resolution (what your laptop actually does)

<details>
<summary><strong>Read as text</strong> — the resolver's walk from root to answer</summary>

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

</details>

### Record types you'll actually meet

<details>
<summary><strong>Read as text</strong> — A, AAAA, CNAME, MX and the rest</summary>

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
| **PTR** | Reverse (IP → name) | `10.2.0.192.in-addr.arpa → mail.example.com` (for 192.0.2.10) |
| **CAA** | Which CAs may issue certs for this domain | `0 issue "letsencrypt.org"` |
| **ALIAS / ANAME** | CNAME-like at the apex (provider-specific) | `example.com → CDN hostname` |

</details>

### Caching layers (latency hides here)

<details>
<summary><strong>Read as text</strong> — four cache layers and propagation delay</summary>

```
   Browser cache   →   OS resolver cache   →   ISP/resolver cache   →   Authoritative
   (seconds)            (seconds–minutes)        (TTL)                   (truth)
```

A "DNS propagation delay" is just **caches honouring TTLs they already pulled** — you can't force the world to forget.

</details>

### TTL strategy

<details>
<summary><strong>Read as text</strong> — low vs high TTLs and pre-lowering before a move</summary>

- **Low TTL (30–60 s)** — fast failover, painful resolver load. Use for things that move (load balancers, blue/green).
- **High TTL (1 h–1 day)** — efficient, slow to change. Use for stable infrastructure (root domain pointing to your CDN).
- **Pre-lower the TTL** before a planned migration, so the world is ready to forget.

</details>

### Modern DNS — privacy and integrity

<details>
<summary><strong>Read as text</strong> — DoH/DoT, DNSSEC, ECS, split-horizon and Anycast</summary>

- **DoH** (DNS over HTTPS, RFC 8484) and **DoT** (DNS over TLS, RFC 7858) encrypt the query so your ISP can't see/sell it.
- **DNSSEC** signs records so resolvers can verify they weren't tampered with (defends against cache poisoning). Doesn't encrypt — just authenticates.
- **EDNS Client Subnet (ECS)** — resolver passes a portion of the client's subnet to authoritative servers so CDN GeoDNS can pick a nearby POP.
- **Split-horizon DNS** — same name resolves differently inside vs outside your network (internal services vs public site).
- **Anycast** — one IP advertised from many locations; routers steer you to the nearest. The 13 root server names (A–M) are served this way from well over a thousand sites; CDNs do it too (§6.9).

</details>

## 3.10 The TLS handshake — and why HTTP/3 wins on the wire

![Infographic on TLS handshakes and connection management: four timelines of 150 ms round-trip blocks before the HTTP request — TCP + TLS 1.2 (3), TCP + TLS 1.3 (2), QUIC/HTTP/3 (1) and QUIC resumed (0, '0-RTT: idempotent only'); the cipher suite TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 split into key exchange, auth, bulk cipher and PRF hash; a Root CA → Intermediate CA → server cert chain with signature/expiry/hostname/revocation checks; HTTP/1.1 vs HTTP/2 vs HTTP/3 head-of-line blocking; and a table of cold/resumed RTTs with cold wait at 150 ms (450/300/150 ms).](diagrams/sd23_info_tls_connections_ai.png)

### TLS 1.2 vs 1.3 round-trips

<details>
<summary><strong>Read as text</strong> — counting round-trips for TLS 1.2, TLS 1.3 and QUIC</summary>

A **round-trip (RTT)** is one full there-and-back message between client and server. For a user whose RTT to your server is 150 ms, **each extra round-trip is 150 ms of pure waiting** before any useful work happens. The whole story from TLS 1.2 → TLS 1.3 → QUIC is that we keep removing round-trips from the handshake. (The counts below are for TLS alone — over TCP, add the TCP handshake's 1 RTT in front.)

**TLS 1.2 — 2 round-trips before the first HTTP byte.** The client says hello, the server replies with its certificate. Then both sides have to swap key material in a *second* round-trip before either knows the encryption key. Only then can the actual HTTP request go out.

```
   TLS 1.2 (2 RTT of handshake — 3 counting TCP's):
     RTT 1:  ClientHello                  ──▶
                                          ◀── ServerHello + cert
     RTT 2:  KeyExchange + Finished       ──▶
                                          ◀── Finished
     RTT 3:  HTTP request                 ──▶   (finally — real data)
```

**TLS 1.3 — 1 round-trip, sometimes 0.** TLS 1.3 was redesigned so the client sends its key material *inside the very first hello*. The server can compute the shared key immediately and respond with everything (its certificate, its finished message) in one shot. That cuts the handshake from 2 RTTs to **1 RTT**. On a *resumed* connection (the client has talked to this server before and still has a ticket), it can reuse the previous session and start sending HTTP data in the **very first packet** — known as **0-RTT** resumption.

```
   TLS 1.3 (1 RTT cold — 2 counting TCP's; 0-RTT on resumption):
     RTT 1:  ClientHello + key share      ──▶
                                          ◀── ServerHello + cert + Finished
     RTT 2:  HTTP request                 ──▶
```

**QUIC (HTTP/3) — handshake fused into the transport.** With HTTPS over TCP you pay one RTT for the TCP handshake *plus* the TLS handshake on top. QUIC combines them, so a cold start is **1 RTT total** (vs 2 for TCP + TLS 1.3, 3 for TCP + TLS 1.2) and a resumed connection is **0 RTT**.

| Setup | Round-trips before the first HTTP request (cold) | On resumption |
|-------|------------------------------------------------|---------------|
| TCP + TLS 1.2 | **3** (1 TCP + 2 TLS) | 2 (abbreviated handshake) |
| TCP + TLS 1.3 | **2** (1 TCP + 1 TLS) | 1 (0-RTT TLS, but TCP still needs its 1) |
| QUIC (HTTP/3) | **1** | **0** |

> **0-RTT caveat:** data sent in the very first packet can be **replayed** by an attacker who records it, so servers only accept 0-RTT for safe, idempotent requests (like a `GET`) and answer anything risky with `425 Too Early`.

**Why this matters at scale.** For a user with a 150 ms RTT, removing one round-trip shaves **150 ms off every fresh connection** — perceptibly snappier. Multiply by the billions of new connections a large site sees per day and it adds up to years of user waiting time saved.

</details>

### A cipher suite, dissected

<details>
<summary><strong>Read as text</strong> — each part of the suite name and forward secrecy</summary>

```
   TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
       │       │        │              │
       │       │        │              └─ hash for key derivation (PRF): SHA-384
       │       │        └──────────────── bulk cipher: AES-256-GCM (AEAD — encrypts and authenticates)
       │       └───────────────────────── auth: RSA (cert signature)
       └───────────────────────────────── key exchange: ECDHE (forward-secret)
```

**Forward secrecy** (ECDHE) means: even if the server's private key leaks tomorrow, today's recorded traffic stays encrypted. TLS 1.3 mandates it — which is why TLS 1.3 suite names are much shorter (e.g. `TLS_AES_256_GCM_SHA384`): key exchange is always ephemeral (EC)DHE and the signature type is negotiated separately.

</details>

### Certificate chain validation

<details>
<summary><strong>Read as text</strong> — root, intermediate, leaf and the checks</summary>

```
   Root CA   (in OS / browser trust store)
       │ signs
   Intermediate CA
       │ signs
   Your server cert   (presented in handshake)
```

The server sends leaf + intermediates. The client walks up to a trusted root and checks: signature valid, not expired, hostname matches (SAN), not revoked.

</details>

### Session resumption — the cost of "first hello" amortised

<details>
<summary><strong>Read as text</strong> — session IDs, tickets and mTLS</summary>

- **Session ID** (TLS 1.2) — server keeps state, client sends ID to skip negotiation.
- **Session ticket** (TLS 1.2/1.3) — server encrypts state, hands it to client; stateless servers can resume.

> **mTLS** (mutual TLS) — both sides present certs. Foundation of service-mesh auth (Istio, Linkerd) and zero-trust networking. Deep dive in Ch 25, §14.9.

</details>

## 3.11 Connection management — pooling, keep-alive, and HOL blocking

<details>
<summary><strong>Read as text</strong> — keep-alive vs HTTP/2 vs HTTP/3</summary>

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
   │   pro: no cross-stream HOL — a loss stalls only its own stream │
   └────────────────────────────────────────────────────────────────┘
```

</details>

## 3.12 Synchronous vs. Asynchronous communication

![Infographic comparing synchronous calls (A asks B 'do it now' and waits; B's outage = A's outage) with asynchronous messaging (A sends an event to a queue and keeps going; work queues up while B is down); a yes/no decision tree that picks WebSockets, SSE, gRPC, GraphQL or REST; a 'REST Done Right' checklist (POST /payments, idempotent PUT, real status codes, cursor pagination, GET /orders?status=paid filters, RFC 9457 errors); and a table comparing REST, gRPC, GraphQL, WebSocket and SSE by wire format, best use and weakness.](diagrams/sd23_info_api_styles_ai.png)

<details>
<summary><strong>Read as text</strong> — waiting for B vs queueing work for B</summary>

```
   SYNCHRONOUS (request/response)        ASYNCHRONOUS (fire-and-forget)
   ─────────────────────────────         ─────────────────────────────
   A ──── do it now ────▶ B              A ──── push event ──▶ Queue ──▶ B
   A ◀──── result ────── B               A keeps going immediately

   Simpler reasoning, tight coupling     Decoupled, resilient,
   A waits for B (latency adds up)       but harder to reason about
   B's outage = A's outage               B's outage doesn't block A —
                                         work queues up until B recovers
```

</details>

### Patterns you'll meet

<details>
<summary><strong>Read as text</strong> — six communication patterns and their trade-offs</summary>

| Pattern | When to use | Trade-off |
|---------|-------------|-----------|
| **Request/response (sync)** | UI needs an answer now | A inherits B's tail latency |
| **Fire-and-forget (async)** | Notifications, analytics, audit | Lose the reply; need separate observation |
| **Request/reply over messaging** | Async transport, sync semantics | Correlation IDs, reply queue per requester |
| **Event-driven (pub/sub)** | Many consumers care | No coupling, hard to trace |
| **Choreography** | Each service reacts to events | No central truth; emergent behaviour |
| **Orchestration** | A workflow engine drives steps | Central point of failure & coupling, easy to reason about |

**Rule:** use sync for queries that need an immediate answer; use async for commands that can be processed later (notifications, billing, analytics, search indexing). When you find yourself orchestrating *six* sync calls in a row, that's a signal to switch to async.

</details>

## 3.13 API styles — REST vs gRPC vs GraphQL vs WebSockets

<details>
<summary><strong>Read as text</strong> — seven API styles compared</summary>

| Style | Wire format | Best for | Weakness |
|-------|-------------|----------|----------|
| **REST** (HTTP+JSON) | Human-readable | Public APIs, browsers, edge caches | Over-fetching, chatty, weak typing |
| **gRPC** (HTTP/2+Protobuf) | Binary, schema'd | Internal microservices, polyglot | Browsers need a proxy, not human-readable |
| **GraphQL** | JSON over HTTP | UIs that need flexible queries | Server complexity, hard to cache |
| **WebSocket** | Bidirectional, persistent | Chat, live dashboards | Stateful conns are harder to scale |
| **Server-Sent Events** | One-way streaming over HTTP | Notifications, ticker feeds | Server → client only |
| **Long polling** | HTTP, kept open until data | Fallback, low-volume push | Doesn't scale to millions |
| **Webhooks** | HTTP POST from server | Async integrations across orgs | Receiver must be public; security burden |

</details>

### Quick decision tree

<details>
<summary><strong>Read as text</strong> — which style to pick</summary>

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

</details>

## 3.14 REST done right

<details>
<summary><strong>Read as text</strong> — resources, verbs, status codes and cursor pagination</summary>

- **Resources, not actions.** `POST /payments` (a *payment* resource), not `POST /makePayment`.
- **Verbs match semantics.** `PUT` is idempotent — use it for "set the state to this." `POST` for "create something new" or non-idempotent actions.
- **Status codes do the talking.** Don't return `200 {"error": "..."}` — use the real status (see §3.23).
- **Pagination is cursor-based, not offset.** (See Ch 25, §17.7 — offset pagination breaks on writes.)
- **Filtering and sorting are query parameters.** `GET /orders?status=paid&sort=-created_at`.
- **Hypermedia (HATEOAS)** is the original REST ideal — responses link to next actions. *Almost no one does this in practice.* Don't sweat it.
- **Errors are structured.** Return RFC 9457 "Problem Details" (`application/problem+json`, which replaced RFC 7807 in 2023) with `type`, `title`, `status`, `detail`, `instance`.

</details>

## 3.15 gRPC deep dive — Protobuf, deadlines, metadata, errors

![Infographic on gRPC: greeter.proto → protoc → client and server stubs, with SayHello(name="Ada") sent over HTTP/2 to the server on port 50051 and "Hello, Ada!" returned; a deadline budget that shrinks from '200 ms left' at service A to 'what's left' at B and C instead of a fresh 200 ms; chips for the 17 status codes (0–16) with UNAVAILABLE marked 'retry with backoff — idempotent calls only'; Protobuf rules (field numbers are forever, empty values look missing, field names never travel); and a table of the four streaming modes (unary, server, client, bidirectional).](diagrams/sd23_info_grpc_ai.png)

<details>
<summary><strong>Read as text</strong> — remote calls that look local</summary>

> **Simple Explanation:** gRPC lets you *call a function on another server as if it were local*. You describe the function once in a `.proto` file; gRPC generates the client and server code for you — in any language.

**Why gRPC for internal services:** compact binary Protobuf payloads (usually several times smaller and faster to parse than the same data as JSON), HTTP/2 multiplexing (many calls share one connection), a strict typed contract across languages, and built-in deadlines, streaming, and cancellation.

</details>

### Hello World — the three pieces

<details>
<summary><strong>Read as text</strong> — the proto contract, a Python server and client</summary>

Everything starts from one schema file: **(1)** define the service, **(2)** implement the server, **(3)** call it from a client.

**1. The contract — `greeter.proto`**

```protobuf
syntax = "proto3";
package hello;

// One service with one method: takes a HelloRequest, returns a HelloReply.
service Greeter {
  rpc SayHello (HelloRequest) returns (HelloReply);
}

message HelloRequest { string name = 1; }
message HelloReply   { string message = 1; }
```

Run the code generator (`protoc`) to turn this `.proto` into client + server stubs for your language.

**2. The server (Python)**

```python
import grpc
from concurrent import futures
import greeter_pb2, greeter_pb2_grpc          # generated from greeter.proto

class Greeter(greeter_pb2_grpc.GreeterServicer):
    def SayHello(self, request, context):
        return greeter_pb2.HelloReply(message=f"Hello, {request.name}!")

server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
greeter_pb2_grpc.add_GreeterServicer_to_server(Greeter(), server)
server.add_insecure_port("[::]:50051")
server.start()
server.wait_for_termination()
```

**3. The client (Python)**

```python
import grpc
import greeter_pb2, greeter_pb2_grpc

with grpc.insecure_channel("localhost:50051") as channel:
    stub = greeter_pb2_grpc.GreeterStub(channel)
    reply = stub.SayHello(greeter_pb2.HelloRequest(name="Ada"))
    print(reply.message)                       # → "Hello, Ada!"
```

That's the whole loop: one schema, generated stubs, and a call that *looks* local but crosses the network over HTTP/2.

</details>

### Protobuf rules that bite you

<details>
<summary><strong>Read as text</strong> — field numbers, vanishing defaults and the wire format</summary>

- **Field numbers are forever.** Adding a field is backwards-compatible; **reusing a number is a breaking change**.
- **Defaults vanish on the wire.** A `string` defaulting to `""` encodes as zero bytes, so "missing" and "empty" look identical. Use `optional` when you must tell them apart.
- **Binary wire format** — field names never travel (each field is identified by its number — a 1-byte tag for fields 1–15) and integers are compact varints, so messages are much smaller than JSON. The gap narrows for string-heavy messages and after gzip.

</details>

### Deadlines, not timeouts

<details>
<summary><strong>Read as text</strong> — passing the remaining budget downstream</summary>

The **client sets a deadline** (an absolute time), and it **propagates downstream**. If A calls B with 200 ms left and B calls C, C inherits the *remaining* budget — not a fresh 200 ms. This is how you stop "everyone retries for 30 s" cascading outages.

</details>

### Metadata — headers, basically

<details>
<summary><strong>Read as text</strong> — key/value pairs sent with every call</summary>

Key/value pairs sent alongside the call (auth tokens, request IDs, tracing):

```
authorization: Bearer eyJ…
x-request-id:  7b3c…
```

</details>

### Errors — the canonical status codes

<details>
<summary><strong>Read as text</strong> — the 17 status codes and when to retry</summary>

gRPC uses its own **17 status codes** (0–16), not HTTP codes: `OK`, `INVALID_ARGUMENT`, `NOT_FOUND`, `ALREADY_EXISTS`, `PERMISSION_DENIED`, `DEADLINE_EXCEEDED`, `RESOURCE_EXHAUSTED`, `UNAVAILABLE` (the standard "transient — retry with backoff" code; still only safe to auto-retry for idempotent calls, because the server may already have done the work), `UNAUTHENTICATED`, `INTERNAL`, and more.

</details>

### Interceptors

<details>
<summary><strong>Read as text</strong> — middleware for every RPC</summary>

Cross-cutting concerns (auth, logging, metrics, retries, tracing) plug in as **interceptors** — like HTTP middleware. One place to add OpenTelemetry tracing to every RPC.

</details>

### gRPC-Web and reflection

<details>
<summary><strong>Read as text</strong> — browser proxies and self-describing services</summary>

- **gRPC-Web** — browsers can't speak raw HTTP/2 trailers, so a small proxy (Envoy) translates. Plan for it in any browser-facing design.
- **Reflection** — a service can describe itself at runtime, so tools like `grpcurl` call it without the `.proto`. Enable in dev, disable in prod.

</details>

## 3.16 gRPC streaming modes

<details>
<summary><strong>Read as text</strong> — unary, server, client and bidirectional streams</summary>

gRPC isn't just request/response. It has four modes built on HTTP/2:

| Mode | Client sends | Server sends | Example |
|------|--------------|--------------|---------|
| Unary | 1 message | 1 message | `GetUser` |
| Server streaming | 1 message | many messages | Tail logs, large list pagination |
| Client streaming | many messages | 1 message | Upload chunks |
| Bidirectional | many messages | many messages | Chat, telemetry, live dashboards |

Bidirectional streaming powers chat, telemetry uploads, and live dashboards — all without WebSockets.

</details>

## 3.17 GraphQL deep dive — power and pain

![Infographic on GraphQL: one typed schema (Query, Mutation, Subscription) and one endpoint where the client asks for exactly the fields it needs. Shows REST's many calls (/users/42, /users/42/posts, /posts/…) versus one POST /graphql query user(id: 42) { name posts(last: 3) { title likes } } returning JSON shaped like the query; the N+1 trap (1 query for users + N for posts) fixed by DataLoader batching into 1 query; federation with a gateway stitching Team A/B/C schemas; a Problem → Fix table (over-fetching, N+1, edge caching → persisted queries, client cache Apollo/Relay, depth & cost limits, federation); when to use / not (public cache-heavy APIs → REST, internal strict contracts → gRPC); trap: enforce query depth and cost limits.](diagrams/sd23_info_graphql_ai.png)

<details>
<summary><strong>Read as text</strong> — the client asks for exactly the fields it needs</summary>

> **Simple Explanation:** GraphQL lets the *client* ask for exactly the fields it wants, in one request — no more, no less. The server publishes a typed **schema**; the client sends a **query** shaped like the data it wants back.

**The core idea:** REST gives you fixed endpoints with fixed shapes, so you often over-fetch or make many round-trips. GraphQL gives you *one* endpoint where each screen asks for precisely what it needs.

</details>

### Hello World — schema, resolver, query

<details>
<summary><strong>Read as text</strong> — schema, resolver, query and response</summary>

**1. The schema — what the server offers**

```graphql
type Query {
  hello(name: String!): String!
}
```

**2. The resolver — how each field gets filled in (Node.js)**

```javascript
const resolvers = {
  Query: {
    hello: (_parent, args) => `Hello, ${args.name}!`,
  },
};
```

**3. The query — what the client sends**

```graphql
query {
  hello(name: "Ada")
}
```

**The response** — JSON shaped exactly like the query:

```json
{ "data": { "hello": "Hello, Ada!" } }
```

A real query nests and fetches several things in **one** round-trip:

```graphql
query {
  user(id: 42) {
    name
    posts(last: 3) { title likes }
  }
}
```

</details>

### Schema, resolvers, and the N+1 trap

<details>
<summary><strong>Read as text</strong> — the typed menu, the N+1 trap and DataLoader</summary>

- **Schema** — the typed menu: `type`s, plus `Query` (reads), `Mutation` (writes), and `Subscription` (live updates).
- **Resolvers** — one function per field. A naive `user.posts` resolver runs *one DB query per user* — the **N+1 problem**. Fix it with **DataLoader**, which batches and dedupes all the little lookups within a single request. (General N+1 problem: Ch 24, §7.9.)

</details>

### Subscriptions — real-time

<details>
<summary><strong>Read as text</strong> — live updates over WebSocket or SSE</summary>

Live updates pushed over WebSocket (or SSE), using the same schema. Good for chat, live scores, and notifications.

</details>

### Caching is the hard part

<details>
<summary><strong>Read as text</strong> — persisted queries and client caches</summary>

REST caches by URL. GraphQL POSTs the query to one URL, so edge caches can't tell requests apart. Fixes:

- **Persisted queries** — the client sends a hash of a pre-registered query, turning it back into a cacheable GET.
- **Client cache** (Apollo, Relay) — normalize results by entity ID.

</details>

### Federation

<details>
<summary><strong>Read as text</strong> — one graph split across teams</summary>

Split one big graph across teams. Each service owns part of the schema, and a **gateway** stitches them together at query time — no monolithic resolver layer.

</details>

### When *not* to use GraphQL

<details>
<summary><strong>Read as text</strong> — when REST or gRPC fits better</summary>

- **Public, cache-heavy APIs** → REST (caching is built in).
- **Internal service-to-service, strict contracts** → gRPC.
- **A tiny app with one client** → REST is simpler; GraphQL is overhead.
- **Watch out:** clients can send hugely expensive nested queries — enforce **query depth and cost limits** in production.

</details>

## 3.18 WebSockets deep dive

![Comparison infographic of real-time push: WebSocket (GET /chat with Upgrade: websocket → 101 Switching Protocols → two-way frames, ping/pong every 15–30 s, opcodes text 0x1/binary 0x2/close 0x8/ping 0x9/pong 0xA, masked client frames), SSE (GET /events with Accept: text/event-stream → one long 200 OK stream of event: price id 17, id 18, auto-reconnect with Last-Event-ID, no proxy buffering, serve over HTTP/2 because HTTP/1.1 allows ~6 connections per origin) and long polling (GET /updates → hold… → 200 → re-ask). Includes a scaling diagram (browsers → sticky LB → app boxes #1–#3 → Redis pub/sub or Kafka backplane), ~50K–250K connections per tuned box, reconnect backoff 1 s → 2 s → 4 s capped, a which-to-pick table and common mix-ups.](diagrams/sd23_info_realtime_push_ai.png)

### The handshake — HTTP upgrade

<details>
<summary><strong>Read as text</strong> — the Upgrade request and the 101 reply</summary>

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

</details>

### Frame format (high level)

<details>
<summary><strong>Read as text</strong> — opcodes, masking and payload length</summary>

| Field | Notes |
|-------|-------|
| **opcode** | text (0x1), binary (0x2), close (0x8), ping (0x9), pong (0xA) |
| **mask bit + key** | client → server frames *must* be masked (anti-cache-poisoning) |
| **payload length** | 7-bit (≤125), 16-bit (≤64K), or 64-bit |
| **payload** | the data |

</details>

### Heartbeats — detecting dead peers

<details>
<summary><strong>Read as text</strong> — pings that catch dead clients</summary>

Browsers send `pong` automatically in response to a server `ping`. Servers should ping every **15–30 s** to detect dead clients (NAT timeouts, sleeping laptops). Without this, your "active" connection count is a lie.

</details>

### Scaling WebSockets

<details>
<summary><strong>Read as text</strong> — sticky load balancers, a backplane and reconnection</summary>

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

</details>

## 3.19 Server-Sent Events & long polling

### SSE — server push without WebSockets

<details>
<summary><strong>Read as text</strong> — event streams, auto-reconnect and proxy gotchas</summary>

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

- Browser exposes via `EventSource`; **auto-reconnects** and sends `Last-Event-ID` so the server can replay what was missed.
- One-way only (server → client). Use REST/gRPC for the inbound side.
- Works over plain HTTP — no protocol upgrade. Two gotchas: proxies must not buffer the stream (e.g. nginx `proxy_buffering off`) and need long idle timeouts; and over HTTP/1.1 each open stream uses one of the browser's ~6 connections per origin, so serve SSE over HTTP/2.

</details>

### Long polling — the lowest-common-denominator push

<details>
<summary><strong>Read as text</strong> — holding a request open until data arrives</summary>

Client sends a request; server holds it open until data is available *or* timeout fires; client immediately reopens.

```
   Client ── GET /updates ──▶ Server (hold…)
                              ◀── 200 {"messages":[...]}   when data arrives
   Client ── GET /updates ──▶ Server (hold…)
```

Use only when SSE/WebSockets aren't an option. Doesn't scale to millions: every waiting client holds an open TCP socket (and a whole thread on thread-per-request servers), and every delivered message costs a fresh HTTP request.

</details>

### Which to pick

<details>
<summary><strong>Read as text</strong> — WebSocket vs SSE vs long polling</summary>

```
   bidirectional, low latency           → WebSocket
   server → client, simple, HTTP-only   → SSE
   client → server only                 → REST / gRPC
   compatibility fallback               → long polling
```

</details>

## 3.20 API versioning

![Infographic on API contracts: three versioning styles (URI /v1/users, header Accept: application/vnd.acme.v2+json, query /users?v=2) with the rules never remove, never retype, never reuse and add optional fields freely plus Deprecation (RFC 9745) and Sunset (RFC 8594) headers; an Idempotency-Key flowchart for POST /charges (Idempotency-Key 8a1f-…-c923, amount 1000 USD) → claim key atomically (unique INSERT / SET NX) → Seen? → new: process and store (key → status, body) in one transaction / done: return stored response / in flight: wait or 409 Conflict, with 24 h window (Stripe), (account_id, endpoint, key) scope and 422 for a reused key with a different body; a traffic-light retry chart (408/425/429/503 retry honouring Retry-After; 500/502/504/network error only if idempotent; other 4xx don't retry); an HTTP method idempotency table; status-code do's and don'ts.](diagrams/sd23_info_api_contracts_ai.png)

<details>
<summary><strong>Read as text</strong> — URI vs header vs query-parameter versions</summary>

You will break a contract one day. Plan how.

| Strategy | Where the version lives | Pros | Cons |
|----------|-------------------------|------|------|
| **URI** | `/v1/users` | Visible, easy to route | Two URIs per resource forever |
| **Header** | `Accept: application/vnd.acme.v2+json` | Clean URLs | Hidden from logs, harder to debug |
| **Query parameter** | `/users?v=2` | Trivial | Caches duplicate; mixes config with data |

</details>

### Compatibility rules that age well

<details>
<summary><strong>Read as text</strong> — never remove, never retype, never reuse</summary>

- **Never remove a field.** Mark it deprecated; remove in the next major.
- **Never change a field's type.** Add a new field; deprecate the old.
- **Never reuse a JSON key or Protobuf field number.**
- **Add optional fields freely.** Default values keep old clients working.
- **Communicate retirement.** Send the `Deprecation` header (RFC 9745) once a version is deprecated and the `Sunset` header (RFC 8594) with the date it will stop working.

</details>

## 3.21 Idempotency

<details>
<summary><strong>Read as text</strong> — why retries need it</summary>

> **Simple Explanation:** An idempotent operation produces the same result whether you call it once or a hundred times. `DELETE /user/42` is idempotent. `POST /charge $10` is not (unless you add an idempotency key).

In distributed systems, **clients retry**. Without idempotency, retries cause duplicate charges, double emails, etc.

</details>

### The standard pattern — `Idempotency-Key`

<details>
<summary><strong>Read as text</strong> — the keyed request and the server's four steps</summary>

```
   POST /charges
   Idempotency-Key: 8a1f-…-c923
   Content-Type: application/json
   {"amount": 1000, "currency": "USD"}
```

Server logic:

1. Look up the key in a dedup store (Redis, DB table) — and claim it **atomically** (a unique-key `INSERT`, or Redis `SET key NX`), so if two retries arrive at once only one wins.
2. **Not seen?** Process the request, store `(key → response body, status)`, **then** return.
3. **Seen with a final response?** Return the stored response (don't re-execute).
4. **Seen, still in-flight?** Either block briefly or return `409 Conflict` so the client backs off.

</details>

### Implementation details that matter

<details>
<summary><strong>Read as text</strong> — window, scope, body hash and atomicity</summary>

- **Window** — Stripe uses 24 hours. Long enough for any retry, short enough to bound storage.
- **Scope** — key is per-account, per-endpoint. `(account_id, endpoint, key)` is the dedup tuple.
- **Hash the request body** alongside the key; if a client reuses a key for a *different* body, reject with `422`.
- **Atomicity** — the "store response + commit DB change" step must be in one transaction, or you'll execute twice on crash.

</details>

### HTTP method idempotency cheat-sheet

<details>
<summary><strong>Read as text</strong> — which HTTP methods are idempotent</summary>

| Method | Idempotent? | Notes |
|--------|-------------|-------|
| GET, HEAD, OPTIONS | yes | safe also |
| PUT, DELETE | yes | per HTTP spec |
| POST | **no** by default | add an `Idempotency-Key` |
| PATCH | depends | usually not |

</details>

## 3.22 BFF — Backend For Frontend

![Comparison infographic of front doors: four columns — Reverse Proxy ('How do I serve this efficiently?': TLS, caching, gzip/brotli, header rewrite; nginx, Varnish), Load Balancer ('Which identical server?': health checks, algorithms, failover; AWS NLB/ALB, HAProxy), API Gateway ('Is this allowed, and where does it go?': auth, rate limits, routing, API keys, quotas; Kong, AWS API Gateway, Apigee, Envoy) and BFF (one backend per frontend, pioneered by SoundCloud and Netflix). A 'How They Fit' panel shows client → API Gateway (auth, rate limit, route) → Load Balancer (pick a healthy replica) → three replicas, a Mobile UI → Mobile BFF / Web UI → Web BFF → microservices diagram (BFF = shape adapter), north–south = API gateway vs east–west = service mesh (Istio, Linkerd), a which-to-pick table and common mix-ups.](diagrams/sd23_info_front_doors_bff_ai.png)

<details>
<summary><strong>Read as text</strong> — one backend tailored to each client</summary>

```
   Mobile UI ──▶ Mobile BFF ──┐
                              ├──▶ underlying microservices
   Web UI    ──▶ Web BFF    ──┘
```

One backend tailored per client (mobile / web / partner). It aggregates, transforms, and slims the response for that specific client. Pioneered by SoundCloud and Netflix. Avoids the "one God API trying to please everyone" trap.

</details>

### When BFF helps

<details>
<summary><strong>Read as text</strong> — slow mobile networks and diverging surfaces</summary>

- Mobile clients on slow networks need small, pre-joined payloads.
- Different surfaces (web, iOS, watchOS, partner API) genuinely diverge.
- You can't change the upstream services fast enough.

</details>

### When BFF hurts

<details>
<summary><strong>Read as text</strong> — extra hops, duplicated logic and creeping business rules</summary>

- One team, one client — BFF is just an extra hop.
- Each BFF re-implements the same auth/logging/validation — pay the cost in a shared library or a service mesh instead.
- BFF becomes a dumping ground for business logic (it shouldn't; it's a *shape adapter*).

</details>

### Adjacent patterns

<details>
<summary><strong>Read as text</strong> — anti-corruption layer, API composition and federation</summary>

- **Anti-Corruption Layer** — wrap a legacy/3rd-party API so the rest of the system doesn't see its warts.
- **API composition** — gateway joins data from several services for a single response.
- **GraphQL federation** — the GraphQL-native answer to "aggregate many services for one client."

</details>

## 3.23 HTTP status codes you should *never* misuse

<details>
<summary><strong>Read as text</strong> — the codes by family and the 200-on-error anti-pattern</summary>

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
   302 Found                 — temporary; browsers usually turn a POST into a GET
   304 Not Modified          — cache validator matched; reuse local copy
   307 Temporary Redirect    — like 302 but preserves method/body
   308 Permanent Redirect    — like 301 but preserves method/body

   4xx CLIENT ERROR
   400 Bad Request           — your client did wrong (malformed)
   401 Unauthorized          — actually means *unauthenticated*
   403 Forbidden             — authenticated but not allowed
   404 Not Found             — resource doesn't exist (or shouldn't be revealed)
   405 Method Not Allowed    — wrong verb; respond with Allow: header
   409 Conflict              — clashes with current state (duplicate, request in flight)
   410 Gone                  — used to exist, intentionally removed
   412 Precondition Failed   — If-Match ETag didn't match (optimistic lock lost)
   415 Unsupported Media     — wrong Content-Type
   422 Unprocessable Content — body parsed but semantically invalid
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

</details>

### Retry semantics — what's safe to retry automatically

<details>
<summary><strong>Read as text</strong> — which statuses are safe to retry, and how</summary>

| Status | Retry? | How |
|--------|--------|-----|
| 408, 425, 429, 503 | yes — the server is telling you it didn't do the work | honour `Retry-After` if present, else exponential backoff + jitter |
| 500, 502, 504 | **only if idempotent** — the work may have happened | backoff + jitter; use Idempotency-Key for POSTs |
| 4xx other than the above | no | client must change something |
| Network error (no response) | **only if idempotent** | use Idempotency-Key for POSTs |

</details>

## 3.24 Network performance fundamentals

![Infographic on network performance: bandwidth (pipe width, can buy more) vs latency (speed-of-light floor) vs throughput = min(bandwidth, window / RTT); a pipe labelled bandwidth 1 Gbps and RTT 30 ms with BDP = 1 Gbps × 30 ms = 30,000,000 bits = 3.75 MB in flight; New York ↔ London ≈ 5,600 km, 28 ms one-way, ~70 ms RTT, light in fibre ≈ 200,000 km/s; the Mathis formula Throughput ≈ MSS / (RTT × √loss) with a gauge dropping from a 1 Gbps link to ≈ 1.2 Mbps per flow at MSS 1,460 bytes, RTT 100 ms, 1% loss; a jitter buffer smoothing a jagged signal; a key-numbers table (bandwidth, latency, BDP, loss, jitter) with levers; do / don't lists; trap: 1% loss caps one Reno/CUBIC flow at ≈ 1.2 Mbps.](diagrams/sd23_info_network_performance_ai.png)

<details>
<summary><strong>Read as text</strong> — latency as a budget</summary>

You can't fix what you can't decompose. Latency is a *budget* that gets spent at every hop.

</details>

### Bandwidth vs latency vs throughput

<details>
<summary><strong>Read as text</strong> — the three rates and the speed-of-light floor</summary>

- **Bandwidth** — capacity of the pipe (bits/sec). You can buy more.
- **Latency** — time for one bit to get across (seconds). Queues and processing add to it, but its floor is set by the speed of light. You **cannot** buy below that floor.
- **Throughput** — actual achieved rate. Limited by `min(bandwidth, window_size / RTT)`.

> Speed-of-light floor: light in fibre travels ≈ 200,000 km/s, so London ↔ New York (≈ 5,600 km) is ≈ **28 ms one-way**; real routes are longer, so you'll see ~70 ms RTT in practice. NA ↔ India ≈ ~230 ms RTT. **Put compute near the user, or move bytes asynchronously.**

</details>

### Bandwidth-Delay Product (the pipe size)

<details>
<summary><strong>Read as text</strong> — bandwidth × RTT, worked out</summary>

```
   BDP = bandwidth × RTT
       = 1 Gbps × 30 ms
       = 30,000,000 bits = 3.75 MB

   You must have ≥3.75 MB of unacknowledged data in flight to fill the pipe.
```

If `cwnd` (TCP) or your app-level window is smaller, you're under-using the link.

</details>

### Jitter and packet loss

<details>
<summary><strong>Read as text</strong> — latency variance and what loss does to TCP</summary>

- **Jitter** — variance in latency. Kills voice/video far more than absolute latency. Jitter buffers trade latency for smoothness.
- **Packet loss** — TCP retransmits (latency spike); UDP apps must handle (or hide) it. On a long, fast link, just **1 % loss can cut a loss-based TCP flow (Reno/CUBIC) to a tiny fraction of the link's capacity**, because cwnd keeps halving — the Mathis estimate below puts numbers on it.

</details>

### TCP throughput approximation (Mathis)

<details>
<summary><strong>Read as text</strong> — the formula and a worked example</summary>

```
   Throughput  ≈  MSS / (RTT × √loss_rate)
```

MSS (Maximum Segment Size) is the payload per packet — 1,460 bytes on Ethernet. (The full formula has a constant ≈ 1.22 in front; it doesn't change the picture.) A 1 % loss on a 100 ms RTT link caps you at roughly 11,680 bits / (0.1 s × 0.1) ≈ **1.2 Mbps per flow** — even if the link is 1 Gbps. Multiple flows can fill the pipe — which is why parallel HTTP/1.1 connections sometimes beat one HTTP/2 connection on lossy links.

</details>

## 3.25 NAT, IPs, and firewalls

![Infographic on NAT, firewalls, IPv6 and networking anti-patterns: private RFC 1918 ranges 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16; a laptop 192.168.1.42:51000 → home router (NAT mapping 192.168.1.42:51000 ↔ 203.0.113.5:51000) → internet, with unmapped inbound traffic blocked and STUN / TURN / ICE for P2P/WebRTC; stateless (per packet, network edge) vs stateful (per flow, cloud security groups) firewalls; IPv4 32 bits (~4 B addresses, exhausted) vs IPv6 128 bits (no NAT needed) with dual-stack and Happy Eyeballs (RFC 8305); a checklist of ten anti-patterns with fixes (timeouts, idempotent retries, jitter, keep-alive, Retry-After + circuit-break, pre-lowering TTL, no double compression, server clock, SNI/ALPN, auth instead of CORS); trap: no timeouts cause cascading failure.](diagrams/sd23_info_nat_antipatterns_ai.png)

### Address spaces

<details>
<summary><strong>Read as text</strong> — public, private and CGNAT ranges</summary>

- **Public IPs** — globally routable, scarce on IPv4.
- **Private IPs (RFC 1918)** — `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`. Not routable on the open internet.
- **CGNAT (`100.64.0.0/10`)** — ISP-internal NAT pool.

</details>

### NAT — how your laptop reaches the internet

<details>
<summary><strong>Read as text</strong> — address rewriting and STUN/TURN/ICE</summary>

```
   Laptop (192.168.1.42:51000)  ──▶  Home router  ──▶  Internet
                                      rewrites src to
                                      (203.0.113.5:51000)
                                      and remembers the mapping
```

Inbound traffic to the laptop only works if there's an entry in the NAT table (created by an outbound packet). This is why **P2P apps need STUN / TURN / ICE** (WebRTC) to punch through.

</details>

### Stateful vs stateless firewalls

<details>
<summary><strong>Read as text</strong> — packet filters vs connection tracking</summary>

- **Stateless** (packet filter) — allow/deny per packet. Fast, dumb. Used at the network edge.
- **Stateful** — tracks connections, knows "this packet belongs to a flow you allowed." More flexible. The norm for security groups in clouds.

</details>

### IPv4 vs IPv6 (the 30-second version)

<details>
<summary><strong>Read as text</strong> — address sizes, dual-stack and Happy Eyeballs</summary>

- IPv4 — 32 bits, ~4 B addresses, exhausted, propped up by NAT.
- IPv6 — 128 bits, "more addresses than atoms in your office building." No NAT needed; each device is reachable. Dual-stack is the migration reality; **Happy Eyeballs** (RFC 8305) is how clients race v6 and v4 to avoid v6 blackholes.

</details>

## 3.26 Networking anti-patterns to outgrow

<details>
<summary><strong>Read as text</strong> — ten networking mistakes to stop making</summary>

- **No timeouts on outbound calls** — the most common cause of cascading failure. Always set both **connect** and **read** timeouts.
- **Retries without idempotency** — turns a transient blip into a duplicate-charge bug.
- **Retries without jitter** — synchronised retries become a **thundering herd**. Always add randomness.
- **Forgetting keep-alive** — every request pays a fresh TCP + TLS handshake (2 RTTs with TLS 1.3, 3 with TLS 1.2) plus the slow-start ramp. Reusing connections removes all of it.
- **Catching `503` and retrying forever** — if the upstream is shedding load, you're making it worse. Honour `Retry-After`; circuit-break.
- **TTL too high on a record you might need to move fast** — pre-lower the TTL days before any planned cutover.
- **Compressing already-compressed payloads** — wastes CPU and sometimes makes them *bigger*.
- **Trusting the client's clock** — for tokens, signatures, rate limits. Use server time.
- **Ignoring SNI/ALPN** — your "HTTPS is fine" might be quietly negotiating HTTP/1.1 and you're missing HTTP/2 throughput.
- **Treating CORS as security** — it's a browser-side rule. Anyone with curl is unaffected. Auth your endpoints.

</details>

---

# PART 4: LOAD BALANCING & TRAFFIC MANAGEMENT

## 4.1 What a load balancer does

![Comparison infographic of load balancer types: L4 transport (reads only the envelope, IP + port; rewrites dest IP/port; millions of QPS; AWS NLB, HAProxy TCP, IPVS, Maglev) vs L7 application (opens the envelope: URL, headers, cookies; terminates and opens a new backend connection; canary/A-B, WAF, rate limits; AWS ALB, nginx, Envoy, Traefik, Cloudflare) vs DNS-based (round-robin, weighted, GeoDNS, latency-based Route 53; cached for the TTL so failover is slow). A layered flow Users → DNS: pick region → Anycast L4 (Maglev) → three L7 proxies (Envoy / nginx) → server pool, a hardware (F5 BIG-IP, $$$$$) vs software (nginx, HAProxy, Envoy, today's default) mini table, an 'If you need → use' table, common mix-ups and the X-Forwarded-For trap.](diagrams/sd23_info_lb_types_ai.png)

<details>
<summary><strong>Read as text</strong> — the supermarket analogy and what an LB gives you</summary>

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

</details>

## 4.2 L4 vs L7 — the most asked LB question

<details>
<summary><strong>Read as text</strong> — envelope vs contents, side by side</summary>

> **Simple Explanation:** An **L4** load balancer is like a mail sorter who routes envelopes by the address on the outside (IP + port) without opening them. An **L7** balancer opens the envelope and routes by what's *inside* (the URL, headers, cookies).

"L4/L7" names the OSI layer the balancer understands (§3.1): **Layer 4 = transport (TCP/UDP)**, **Layer 7 = application (HTTP)**.

| | **L4 (transport)** | **L7 (application)** |
|---|---|---|
| Looks at | IP + port only | URL, headers, cookies, method, body |
| Connection | Forwards the raw TCP/UDP stream | Terminates the client's connection, opens its own to the backend |
| Speed / cost | Very fast, tiny CPU, millions of QPS | Slower — must parse HTTP and often do TLS |
| Routing it can do | "spread across this server pool" | "/api → cluster A, /img → cluster B", route by header or cookie |
| TLS | Usually passes the encrypted bytes through | Terminates TLS; can inspect, then re-encrypt to the backend |
| Smart features | None (it can't read HTTP) | Canary / A-B routing, WAF, rate limits, header rewrite, retries, sticky sessions |
| Examples | AWS NLB, HAProxy (TCP mode), IPVS, Maglev | AWS ALB, nginx, Envoy, Traefik, Cloudflare |

</details>

### How each actually moves a packet

<details>
<summary><strong>Read as text</strong> — one forwarded connection vs two</summary>

```
   L4:  client ──TCP──▶ [ LB rewrites dest IP/port ] ──▶ backend
        The LB never reads the HTTP request — one connection, NAT-style.

   L7:  client ──TCP+TLS──▶ [ LB terminates, reads HTTP, decides ] ──new TCP──▶ backend
        Two separate connections; the LB is a full middleman.
```

</details>

### When to use which

<details>
<summary><strong>Read as text</strong> — L4, L7 and layering both</summary>

- **L4** — non-HTTP traffic (databases, game servers, raw gRPC passthrough), extreme throughput, or when the backend needs to see the raw connection. It *cannot* do content-based routing.
- **L7** — anything HTTP where you want smart routing: path/host routing, canary releases, per-tenant rate limits, a Web Application Firewall, or auth at the edge.

**Senior insight:** real systems use **both, layered** — a fast L4 balancer (often on an Anycast IP) spreads traffic across a fleet of L7 proxies, which do the smart per-request work. That's exactly Google's Maglev (L4) sitting in front of application proxies (§4.10).

> **Gotcha:** when an L7 LB terminates the connection, the backend sees the *LB's* IP, not the user's. Forward the real client IP in `X-Forwarded-For` (for L7) or use the PROXY protocol (for L4), or your logs, geo-IP, and rate limits will all be wrong.

</details>

## 4.3 Load-balancing algorithms

![Infographic on how a load balancer picks a server: the problem (random placement leaves the busiest of n servers with about log n / log log n requests), the Power of Two Choices idea (pick two at random, send to the less-loaded), supermarket-entrance analogy; panels for Round Robin (1 → 2 → 3 → 1, ignores load), Least Connections (arrow to the server with fewest in-flight requests) and Power of Two Choices (log n / log log n → log log n); a health-check timeline ✓ ✓ ✗ ✗ ✗ → UNHEALTHY → ✓ ✓ → HEALTHY (3 failures stop routing, 2 passes bring it back); a compare table of Round Robin, Least Connections, Power of Two Choices and IP / URL Hash; when to use (shallow + sampled-deep checks, fail open at Envoy's 50% panic threshold) and when not (sticky sessions — move session to Redis; deep-only checks), and the trap that a DB hiccup with deep checks causes a 100% outage.](diagrams/sd23_info_lb_algorithms_health_ai.png)

<details>
<summary><strong>Read as text</strong> — round robin to the power of two choices</summary>

```
  • Round Robin       — server 1, 2, 3, 1, 2, 3...   (simple, ignores load)
  • Weighted RR       — give beefier servers more turns
  • Least Connections — send to the box with fewest in-flight requests
  • Least Response    — send to the fastest-responding box
  • IP Hash           — same client IP always lands on same server (stickiness)
  • URL Hash          — same URL always lands on same server (cache locality)
  • Random + Two      — pick two servers at random, send to the less-loaded one
                       (the "Power of Two Choices" — Mitzenmacher; used by
                        Envoy, NGINX and HAProxy — surprisingly great)
```

**Why two random choices beat one:** with purely random placement of n requests on n servers, the busiest server ends up with about log n / log log n of them; just comparing *two* random servers drops that to about log log n — an exponential improvement for one extra load lookup. And unlike "always pick the least-loaded", it doesn't make every balancer stampede the same idle server using stale load data.

`IP Hash` and `URL Hash` above are usually `hash(key) % N` — see §4.10 for why that breaks when N changes.

</details>

## 4.4 Health checks — how the LB knows a server is alive

<details>
<summary><strong>Read as text</strong> — shallow vs deep checks and failing open</summary>

```
   Every few seconds:  LB ──── GET /healthz ───▶ server
                          ◀───── 200 OK ────────
       (e.g. 3 failures in a row → mark UNHEALTHY, stop routing to it)
       (e.g. 2 passes in a row   → mark HEALTHY again)
```

Two flavours: **shallow** (TCP/HTTP ping — server is responding) and **deep** (the endpoint actually queries DB, cache, etc. — server can *do work*). Deep checks are accurate but can cause cascading failures (DB hiccup → all servers fail health checks → all marked dead → 100% outage). Most prod systems do a **shallow + sampled-deep** combo. Good LBs also **fail open**: if too many backends look unhealthy at once (Envoy's "panic threshold", 50 % by default), they assume the health check itself is broken and spread traffic across all of them.

</details>

## 4.5 Sticky sessions (session affinity)

<details>
<summary><strong>Read as text</strong> — pinning clients and why to avoid it</summary>

Pin a client to the same backend (via cookie or IP hash) so in-memory session state stays put. **Try to avoid it** — it breaks load balance, complicates failover, and prevents free rolling deploys. Move session state to Redis instead.

</details>

## 4.6 Reverse proxy vs API gateway vs Load balancer

<details>
<summary><strong>Read as text</strong> — three jobs at the front door</summary>

> **Simple Explanation:** All three sit in front of your servers, but they answer different questions. A **reverse proxy** asks "how do I serve this request efficiently?" A **load balancer** asks "which server should handle it?" An **API gateway** asks "is this request allowed, and where does it go?"

They overlap heavily — one piece of software (nginx, Envoy) often plays all three roles — but the *jobs* are distinct:

| | **Reverse proxy** | **Load balancer** | **API gateway** |
|---|---|---|---|
| Main job | Front a backend: TLS, caching, compression | Spread traffic across identical replicas | The single "front door" for many APIs |
| Knows about | One (or a few) backends | A pool of identical servers | All your services + their policies |
| Typical features | TLS termination, gzip/brotli, static cache, header rewrite | Health checks, algorithms (§4.3), failover | Auth, rate limiting (§4.7), routing, request/response transformation, API keys, quotas |
| OSI layer | L7 (usually) | L4 or L7 | L7 |
| Examples | nginx, Varnish | AWS NLB/ALB, HAProxy | Kong, AWS API Gateway, Apigee, Envoy |

```
   client ──▶ API Gateway ──▶ Load Balancer ──▶ [ replicas of one service ]
              (auth, rate        (pick a healthy
               limit, route)      replica)
```

**How to keep them straight:**

- A **load balancer** answers *"which of these identical boxes?"* — it's about scale and failover.
- A **reverse proxy** answers *"let me handle TLS, caching, and compression so the backend doesn't have to."* (Every LB and gateway is also a reverse proxy.)
- An **API gateway** is a reverse proxy + load balancer **plus a policy engine** — it centralizes cross-cutting concerns (auth, rate limits, quotas, request shaping) so each service doesn't reinvent them.

> **Don't confuse it with a service mesh:** a gateway handles **north–south** traffic (clients → your system); a service mesh (Istio, Linkerd) handles **east–west** traffic (service → service *inside* your system). The BFF pattern (§3.22) is a specialized gateway — one per frontend.

</details>

## 4.7 Rate limiting

![Infographic on rate limiting (100 requests per minute, the 101st gets 429 Too Many Requests): problem (abuse, one tenant starving the rest, fragile downstreams), idea (pick a key — API key / user, IP or endpoint — count, reply 429 + Retry-After, share one counter across gateways), bouncer analogy; four panels: token bucket with 10 tokens refilled at +5 tokens/s (10 at once, then 5 per second), leaky bucket (steady rate, no bursts), fixed window with 100 at the end of 11:00 and 100 at the start of 11:01 (200 in ~1 s), and sliding window (previous minute 80, current 30, 15 s in → 30 + 80 × 0.75 = 90 < 100); a flow Clients → three Gateways → Redis counter (INCR + EXPIRE, Lua) → 429 + Retry-After; a compare table of the four algorithms (bursts, how, used by AWS/Stripe, nginx, naive APIs, Cloudflare), when to use / not, and the trap of returning a bare error instead of 429 + Retry-After and X-RateLimit headers.](diagrams/sd23_info_rate_limiting_ai.png)

<details>
<summary><strong>Read as text</strong> — the bouncer and why you need one</summary>

> **Simple Explanation:** A bouncer at the door. "You can come in 100 times per minute; the 101st gets a `429 Too Many Requests`." It protects you from abuse, runaway clients, and accidental self-DDoS.

**Why you need it:** stop abuse and scrapers, share capacity fairly between tenants, protect fragile downstreams, and control cost. It's a core API-gateway feature (§4.6).

</details>

### What to limit by (the "key")

<details>
<summary><strong>Read as text</strong> — per user, per IP or per endpoint</summary>

You count requests against some identity — pick it based on the threat:

- **Per API key / user** — fair usage and billing tiers (the most common).
- **Per IP** — block anonymous abuse (but NATs share one IP across many users, so be careful).
- **Per endpoint** — protect one expensive route (e.g. `/search`) more tightly than the rest.

</details>

### The four classical algorithms

<details>
<summary><strong>Read as text</strong> — token bucket, leaky bucket, fixed and sliding windows</summary>

```
   TOKEN BUCKET           LEAKY BUCKET          FIXED WINDOW          SLIDING WINDOW
   ────────────           ────────────          ────────────          ──────────────
   Refills N tokens/sec;  Drains at a constant  One counter, reset    Counts the last
   each request spends    rate; smooths bursts  every minute. Easy,   60s on a rolling
   one. Allows bursts     into a steady flow.   but allows a 2× burst basis. Fixes the
   up to the bucket size.                       at the boundary.      edge-burst bug.
```

| Algorithm | Bursts? | How it works | Used by |
|-----------|---------|--------------|---------|
| **Token bucket** | Yes, up to bucket size | Counter + last-refill timestamp | AWS, Stripe |
| **Leaky bucket** | No — smooths to a steady rate | A queue drained at a fixed rate | nginx |
| **Fixed window** | Yes — can 2× at the boundary | One counter per time window | Naive APIs |
| **Sliding window** | Yes, but controlled | Rolling/weighted count of recent requests | Cloudflare |

**The fixed-window boundary bug:** with a 100/min limit, a client can send 100 requests at 11:00:59 and 100 more at 11:01:00 — that's 200 in about one second. Sliding window fixes this by always looking at the *last* 60 seconds.

**How the cheap sliding window works (sliding-window counter):** keep only two counters — this minute and the previous minute — and weight the previous one by how much of it still falls inside the last 60 s:

```
   estimate = current_count + previous_count × (fraction of previous window still in view)

   Limit 100/min. Previous minute: 80 requests. Current minute: 30 so far.
   We are 15 s (25 %) into the current minute → 75 % of the previous one is still in view.
   estimate = 30 + 80 × 0.75 = 90  → under 100, allow
```

(The exact version, a *sliding log*, stores every request timestamp — precise but memory-hungry.)

**Token bucket is the usual default** — it allows natural short bursts while capping the long-run average, which matches how real traffic behaves. Example: bucket size 10, refill 5 tokens/s → a client can fire 10 requests at once, then sustain 5 per second.

</details>

### Telling the client (the HTTP part)

<details>
<summary><strong>Read as text</strong> — 429, Retry-After and rate-limit headers</summary>

Return **`429 Too Many Requests`** with a **`Retry-After`** header so well-behaved clients back off. Many APIs also send `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` headers so clients can pace themselves (an IETF draft is standardising this as `RateLimit` and `RateLimit-Policy` headers).

</details>

### Distributed rate limiting is the hard part

<details>
<summary><strong>Read as text</strong> — a shared counter vs local limits</summary>

One counter is trivial on a single box. Across N gateways you need a *shared* counter — usually in **Redis** (`INCR` + `EXPIRE` for a fixed window, kept atomic with a tiny Lua script). The trade-off:

- A **central store** is accurate but adds latency and a dependency on every request.
- **Local + periodic sync** (each node limits locally, reconciles occasionally) is faster but approximate.
- Choose based on whether a little over-admitting is acceptable for your use case.

</details>

## 4.8 Circuit breaker

![Infographic on circuit breaker and bulkhead patterns: a sick dependency drags everyone down (one slow downstream holds every thread in a shared pool); electrical-breaker and ship-compartment analogy; a state machine CLOSED (normal) → 'failures pass threshold' → OPEN (fail fast, no calls) → 'cooldown ends' → HALF-OPEN (a few trial calls), with 'trial calls succeed' back to CLOSED and 'trial call fails' back to OPEN; a ship hull with compartments Tenant A pool, Tenant B pool (flooded), Batch cluster and Interactive cluster; a compare table (circuit breaker vs bulkhead: protects against, mechanism, example — resilience4j, Envoy outlier detection, per-tenant thread pools; also Polly, Hystrix in maintenance since 2018), when to use / not, and the trap of one shared thread pool drained by a single slow dependency.](diagrams/sd23_info_circuit_breaker_bulkhead_ai.png)

<details>
<summary><strong>Read as text</strong> — closed, open and half-open</summary>

> **Simple Explanation:** Like an electrical breaker — if a downstream service is failing, stop calling it for a while so it can recover and you don't waste resources.

```
                 failures pass threshold
   ┌──────────┐ ─────────────────────────▶ ┌──────────────┐
   │  CLOSED  │                            │     OPEN     │
   │ (normal) │                            │ (fail fast,  │
   └──────────┘                            │  no calls)   │
        ▲                                  └──┬───────────┘
        │                                     │        ▲
        │                       cooldown ends │        │ trial call fails
        │                                     ▼        │
        │     trial calls succeed     ┌────────────────┴─────┐
        └─────────────────────────────┤      HALF-OPEN       │
                                      │ (let a few trial     │
                                      │  calls through)      │
                                      └──────────────────────┘
```

Three states: **closed** (normal — calls flow, failures are counted), **open** (short-circuit: fail fast without calling the sick service), **half-open** (after a cooldown, let a few trial calls through: if they succeed, close again; if one fails, re-open). Implemented by resilience4j (the successor to Netflix's Hystrix, which went into maintenance mode in 2018), Polly (.NET), and Envoy/Istio "outlier detection".

</details>

## 4.9 Bulkhead pattern

<details>
<summary><strong>Read as text</strong> — watertight compartments for resources</summary>

Like a ship's watertight compartments — isolate resources so one tenant or feature can't flood the system. Implementation: per-tenant thread pools, per-endpoint connection pools, separate clusters for batch vs interactive.

</details>

## 4.10 Hashing at the load balancer — Maglev, Rendezvous, Consistent

![Infographic on hashing at the load balancer: the problem that hash(key) % N re-routes most keys (4 → 5 servers: a key stays only if k % 4 == k % 5, so 80% of keys move and warm caches go cold); a mail-carrier route analogy; panels showing hash % N with tangled arrows and '80% moved', a consistent-hashing ring where new server S5 takes one arc ('~1/N of keys move'), a Maglev table of 65,537 slots (prime) with O(1) lookup, and Rendezvous / HRW score bars hash(key, S1…S4) where the highest wins; a compare table (hash % N, consistent hashing, Maglev, Rendezvous / HRW by lookup cost, keys moved and where used), when to use / not, and the trap that Maglev is near-minimal, not zero, disruption.](diagrams/sd23_info_lb_hashing_ai.png)

<details>
<summary><strong>Read as text</strong> — modulo vs consistent, Maglev and rendezvous hashing</summary>

Naive `hash(key) % N` re-routes most traffic when servers come and go — going from 4 to 5 servers moves **80 %** of keys (a key stays put only if `k % 4 == k % 5`) — disastrous when each server holds a warm cache or stateful connection.

- **Consistent hashing** (Ch 24, §9.9) — adding/removing one server reshuffles only about `1/N` of keys.
- **Maglev** (Google) — builds a fixed-size lookup table (a prime size such as 65,537 slots) where each backend gets nearly equal slots, and adding/removing a backend changes only a small number of slots (near-minimal disruption — Maglev favours even balance over perfect stability). O(1) per lookup, even at millions of QPS. Used in Google's L4 LB and inspired Facebook's Katran.
- **Rendezvous / HRW (Highest Random Weight) hashing** — for each key, compute `hash(key, server)` for every server and pick the highest score. Naturally balanced, no ring to maintain, and removing a server moves only that server's keys — but each lookup costs O(N).

</details>

## 4.11 Hardware vs software load balancers

<details>
<summary><strong>Read as text</strong> — appliances vs commodity boxes and cloud LBs</summary>

```
   F5 BIG-IP, Citrix NetScaler (hardware)   nginx, HAProxy, Envoy (software)
   ──────────────────────────────────────   ────────────────────────────────
   Custom chips, huge capacity per box      Commodity servers; a tuned box
                                            handles hundreds of thousands
                                            of requests/s — add boxes for more
   $$$$$, vendor-locked                     Free / commodity
   Disappearing from new builds             Today's default
```

Cloud LBs (AWS NLB/ALB, GCP LB, Azure LB) are typically **software running on commodity hardware at massive scale**, fronted by Anycast IPs so traffic enters the network at the user's nearest edge.

</details>

## 4.12 DNS-based load balancing

<details>
<summary><strong>Read as text</strong> — round-robin, weighted, geo and latency-based DNS</summary>

The simplest, dumbest LB: return multiple A records and let the client pick. Variants:

- **Round-robin DNS** — rotate which IP comes first; clients usually pick the first.
- **Weighted DNS** — route X % to region A, Y % to region B.
- **GeoDNS** — return the IP nearest to the resolver's location (how many CDNs pick a POP; others, like Cloudflare, use Anycast instead — §6.9).
- **Latency-based** (AWS Route 53) — return the IP with the lowest measured latency.

**Caveat:** DNS is cached for the TTL. Failover is *slow*. Critical systems combine DNS-LB (region selection) with in-region L4/L7 LBs (fast failover).

</details>

---

# PART 5: CACHING

## 5.1 Why we cache

![Caching map infographic: why cache (without cache client → app → DB 50 ms; with cache → cache 1 ms, miss → DB 50 ms; O(reads) → ~O(misses)); where caches live as six numbered cards from closer to user (faster, smaller) to closer to truth (slower, fresher): client cache, CDN edge POPs, reverse proxy (nginx / Varnish), local in-process (Caffeine / Guava), shared app tier (Redis / Memcached), database buffer pool; a multi-tier lookup L1 in-process ~100 ns → L2 Redis ~1 ms → L3 DB read replica ~5–50 ms → primary DB (also takes every write); a Redis vs Memcached table (data types, persistence RDB + AOF, replication, threads, best for) with the Valkey fork note; a pick-by-question table (CDN, L1 in-process, Redis, Memcached); five things not to cache (low-reuse per-user data, data changing faster than the TTL, legally-fresh data, lookups already < 1 ms, personal data without cache-key isolation) and the L1 invalidation trap (Redis pub-sub, CDC or 1–5 s L1 TTLs).](diagrams/sd23_info_cache_where_ai.png)

<details>
<summary><strong>Read as text</strong> — the fast copy that turns reads into misses</summary>

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

</details>

## 5.2 Where caches live (the cache hierarchy)

<details>
<summary><strong>Read as text</strong> — six layers from the client to the database</summary>

```
   ┌──────────────────────────────────────────────────────┐
   │ Client cache    — browser, mobile app (HTTP cache)   │
   │ CDN             — edge POPs near the user            │
   │ Reverse proxy   — nginx/Varnish in front of app      │
   │ Local in-proc   — Caffeine/Guava map in each app     │
   │ Shared app-tier — Redis/Memcached cluster            │
   │ Database cache  — buffer pool, query plan cache      │
   └──────────────────────────────────────────────────────┘
        ▲ closer to user (faster, smaller)
        ▼ closer to source-of-truth (slower, fresher)
```

Cache *every* layer that matters, but pick consistency boundaries deliberately.

</details>

## 5.3 Caching strategies — the four patterns

![Infographic on caching strategies and invalidation: four lanes with App, Cache and DB icons for cache-aside (most common; miss → DB → fill cache → return; write: App → DB then invalidate), read-through (the cache loads on a miss), write-through (synchronous; in step with the DB, slow writes) and write-back (dashed 'later (async)' arrow to DB, 'cache dies = data lost'); the cache-aside race timeline t1–t4 where the Reader writes the OLD value into the cache after the Writer's delete ('stale until TTL'); fix badges TTL backstop, delayed double delete, CDC; plus a TTL / explicit delete / versioned keys (key:v123) trade-off table and the Phil Karlton quote.](diagrams/sd23_info_strategies_invalidation_ai.png)

<details>
<summary><strong>Read as text</strong> — cache-aside, read-through, write-through and write-back</summary>

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
   ► Cache stays in step with the DB (as long as both writes succeed). Slow writes.

4. WRITE-BACK (write-behind)
   Write: app ─▶ cache; cache flushes to DB later (async)
   ► Fast writes. Risk of data loss if cache dies.
```

</details>

## 5.4 Eviction policies

![Comparison infographic of cache eviction policies: four columns for LRU (evict the entry unused longest; the default), LFU (evict the entry requested least often; stable popularity), ARC (balances recency vs frequency; ZFS, IBM storage controllers) and W-TinyLFU (Caffeine; admit a newcomer only if more popular than the victim); an LRU walk-through at size 3 (GET A → [A], [B,A], [C,B,A], GET A → [A,C,B], GET D → [D,A,C] with B evicted); the W-TinyLFU pipeline new item → Window LRU ~1% → candidate vs victim judged by a Count-Min Sketch (counters halve over time) → Main SLRU ~99% (probation / protected); and a pick-by-need table (LRU, LFU, FIFO, Random, TTL-only, W-TinyLFU).](diagrams/sd23_info_eviction_ai.png)

<details>
<summary><strong>Read as text</strong> — LRU, LFU, FIFO, ARC and an LRU trace</summary>

When the cache is full, who gets kicked out?

| Policy | What it kicks | Best for |
|--------|---------------|----------|
| **LRU** (Least Recently Used) | The entry unused for the longest time | Most workloads — *the default* |
| **LFU** (Least Frequently Used) | The entry requested least often | Stable popularity (e.g. a catalogue's steady best-sellers) |
| **FIFO** | First-in regardless of use | Streaming, queues |
| **Random** | Random victim | Simple, surprisingly OK |
| **TTL-only** | Anything past expiry | Sessions, tokens |
| **ARC** (Adaptive Replacement Cache) | Balances recency vs frequency automatically | ZFS, IBM storage controllers |

```
   LRU example (cache size = 3; list shown most-recent first):
   GET A → [A]
   GET B → [B,A]
   GET C → [C,B,A]
   GET A → [A,C,B]      ← A moved to front
   GET D → [D,A,C]      ← B evicted (least recently used)
```

</details>

## 5.5 The cache invalidation problem

<details>
<summary><strong>Read as text</strong> — TTL, explicit delete, versioned keys and the race</summary>

> "There are only two hard things in computer science: cache invalidation and naming things." — Phil Karlton

Three options when the source data changes:

1. **TTL** — set a short expiry; eventual consistency baked in. *Easy, slightly stale data.*
2. **Explicit invalidation** — on write, `cache.delete(key)`. *Fresh, but race-condition prone.*
3. **Versioned keys** — `key:v123`; bump version on write so old reads miss. *Elegant, but stale keys linger.*

The race (cache-aside, where readers fill the cache on a miss):

```
   t1  Reader: cache miss → reads OLD value from DB
   t2  Writer: updates DB to NEW
   t3  Writer: deletes the cache key
   t4  Reader: writes OLD value into the cache   ← stale until the TTL expires
```

Fixes: always set a TTL as a backstop; **delete twice** — once on write and again after a short delay longer than a read takes (the "delayed double delete"); or let change-data-capture (CDC) push invalidations from the DB's change log.

</details>

## 5.6 Cache stampede & thundering herd

![Infographic on cache stampede and the three cache attacks: before/after panels where 10,000 readers send 10,000 DB queries versus a single-flight funnel that makes 1 DB query and shares the result, the code chip group.Do("user:42", fn) with Go singleflight, Caffeine / Guava LoadingCache, nginx proxy_cache_lock and CDN request collapsing; cards for Penetration (missing keys stopped by a Bloom filter), Breakdown (a single hot key expires) and Avalanche (many keys expire together vs ±20% jitter); and a compare table of each attack's defence (negative caching / Bloom filter; single-flight, early expiry, never-expire + background refresh; TTL jitter, pre-warm, tiered caches).](diagrams/sd23_info_stampede_attacks_ai.png)

<details>
<summary><strong>Read as text</strong> — the herd and three defences</summary>

When a popular key expires, *all* concurrent requests miss simultaneously and hammer the DB.

```
   t=0  cache expires
   t=1  10,000 readers all miss → 10,000 DB queries → DB melts
```

Defences:

- **Mutex / single-flight** — only one request rebuilds, others wait (§5.11).
- **Probabilistic early expiry** — as a key nears expiry, each reader gets a small, rising chance of refreshing it early, so one reader rebuilds it *before* it expires and the herd never sees a miss (the "XFetch" algorithm).
- **Stale-while-revalidate** — serve stale, refresh in background.

</details>

## 5.7 Redis vs Memcached (90% of the question)

<details>
<summary><strong>Read as text</strong> — the feature table and the Valkey fork</summary>

| | **Redis** | **Memcached** |
|---|---|---|
| Data types | Strings, lists, sets, hashes, sorted sets, streams, HyperLogLog | Strings only |
| Persistence | RDB snapshot + AOF log | None (pure memory) |
| Replication | Built-in primary/replica + Sentinel + Cluster | None built in (clients shard keys across nodes) |
| Eviction | LRU, LFU, TTL, random | LRU |
| Threads | Commands run on one thread (extra I/O threads since 6.0) | Multi-threaded |
| Best for | Sessions, leaderboards, pub-sub, queues, geo | Pure object cache, simple K/V |

**Default to Redis** unless you specifically need Memcached's simpler model. Since Redis's 2024 licence change, **Valkey** (a Linux Foundation fork of Redis 7.2) is a drop-in, open-source alternative offered by the major clouds.

</details>

## 5.8 The three "cache attacks" — penetration, breakdown, avalanche

<details>
<summary><strong>Read as text</strong> — penetration, breakdown and avalanche</summary>

Often confused; they have very different fixes.

| Problem | What happens | Defence |
|---------|--------------|---------|
| **Penetration** | Many requests for keys that *don't exist* miss cache and hit DB | Cache the negative result with short TTL, or use a **Bloom filter** (Ch 24, §9.15) to reject impossible keys before the cache |
| **Breakdown / Stampede** | A *single hot key* expires; thousands of concurrent readers all miss simultaneously | Single-flight (mutex), probabilistic early expiry, never-expire + background refresh |
| **Avalanche** | *Many keys* expire around the same time (or the cache cluster restarts cold) | Add random jitter to TTLs (e.g. ±20 %), pre-warm cache on startup, tiered caches |

</details>

## 5.9 Modern eviction — W-TinyLFU (Caffeine)

<details>
<summary><strong>Read as text</strong> — the window, the main region and the admission filter</summary>

> **Simple Explanation:** LRU forgets popular items too easily (one big scan flushes them out); LFU clings to items that *used to be* popular. W-TinyLFU keeps a cheap, approximate popularity count for every key it has seen recently, and only lets a newcomer into the cache if it is more popular than the item it would push out.

It is the eviction policy of **Caffeine**, the standard in-process cache for Java. It combines:

- A small **window** LRU (starting at about 1 % of capacity; Caffeine tunes this size as the workload changes) where every new item lands first, so brand-new items get a chance to prove themselves.
- A large **main** region (about 99 %) managed as a *segmented LRU* — a "probation" part for items seen once and a "protected" part for items hit again.
- A **TinyLFU admission filter**: when the window evicts a candidate, its estimated frequency is compared with the main region's victim, and the more frequent one stays. Frequencies come from a tiny **Count-Min Sketch** (a few bits per counter) whose counts are periodically halved, so old popularity fades.

Result: near-optimal hit rates across web, OLTP, and scan workloads — in Caffeine's benchmarks it beats LRU and ARC.

</details>

## 5.10 Multi-tier caching

<details>
<summary><strong>Read as text</strong> — L1, L2, L3 and keeping L1 coherent</summary>

```
   request ─▶ L1 (in-process, Caffeine, ~100 ns)
                     │ miss
                     ▼
              L2 (Redis cluster, ~1 ms network round-trip)
                     │ miss
                     ▼
              L3 (DB read replica, ~5–50 ms per query)
                     │ miss / must be fresh
                     ▼
              Primary DB (same query cost, but it also takes every write — protect it)
```

Each layer absorbs traffic. The L1 in-process cache is the biggest win for trivial cost — it eliminates the network round-trip entirely for the hottest keys.

**Cache coherence problem** with L1: when data changes, *every server's* L1 must be invalidated. Solutions: Redis pub-sub messages, change-data-capture, or very short L1 TTLs (1–5 s).

</details>

## 5.11 Single-flight pattern — the stampede killer

<details>
<summary><strong>Read as text</strong> — one fetch per key, shared by every waiter</summary>

```go
// Go-style single-flight: only one goroutine fetches per key.
// All others wait and share the result.
v, err, _ := group.Do("user:42", func() (interface{}, error) {
    return db.Query("...")
})
```

Available in: Go's `golang.org/x/sync/singleflight`; Java's Caffeine and Guava `LoadingCache` (concurrent `get`s of the same missing key share one load); nginx's `proxy_cache_lock`; CDNs call it **request collapsing**. **Always wrap hot read-through caches with it.**

</details>

## 5.12 What *not* to cache

<details>
<summary><strong>Read as text</strong> — five things to leave out</summary>

- Per-user data with low reuse (waste of memory).
- Data that changes faster than the TTL (always stale, useless).
- Data whose freshness is legally required (pricing in some jurisdictions).
- Anything whose lookup is already < 1 ms (cache adds complexity, not speed).
- Personal data without thinking about cache-key isolation (a shared cache can leak across tenants).

</details>

---

# PART 6: CDN — CONTENT DELIVERY NETWORK

## 6.1 The CDN idea in one picture

![Infographic on CDNs: a world map with Origin (us-east-1) feeding Edge Tokyo, Edge London and Edge NYC with nearby users and the badge 200 ms → 20 ms; the tiered path User → DNS → CDN edge → Regional cache → Origin shield (one cache fronting the origin) → Origin (S3 / app servers) with 'hit → return' exits; cache key = host + path + query (+ Vary headers), Vary: Accept-Encoding, Accept-Language, and Vary: User-Agent key explosion fixed by normalizing to mobile / desktop / bot; six CDN jobs (edge caching, TLS termination, DDoS absorption, WebP/AVIF, HTTP/3, edge compute); a push vs pull table; and invalidation by TTL, purge API or versioned URLs (app.v123.js, the safest).](diagrams/sd23_info_cdn_ai.png)

<details>
<summary><strong>Read as text</strong> — origin, edge POPs and shorter round-trips</summary>

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

</details>

## 6.2 What a CDN actually does

<details>
<summary><strong>Read as text</strong> — six jobs at the edge</summary>

1. **Edge caching** — serves images/JS/CSS/video from the nearest POP.
2. **TLS termination** — the handshake round-trips (§3.10) happen over the short hop to a nearby POP instead of all the way to the origin (huge latency win).
3. **DDoS absorption** — soaks up volumetric attacks at the edge.
4. **Compression & image optimization** — WebP/AVIF on the fly.
5. **HTTP/3 + connection reuse** — modern transport for free.
6. **Edge compute** — Cloudflare Workers, Lambda@Edge.

</details>

## 6.3 Push vs Pull CDN

<details>
<summary><strong>Read as text</strong> — who moves the content, and when</summary>

| | Push | Pull |
|--|------|------|
| When content arrives | You upload to the CDN explicitly | First miss triggers a fetch from origin |
| Best for | Large infrequently-changing assets (video) | Web assets that change often |
| Storage cost | High (every POP keeps it) | Low (only popular content cached) |
| First-request latency | Fast | One slow miss, then fast |

</details>

## 6.4 Cache invalidation at the edge

<details>
<summary><strong>Read as text</strong> — TTL, purge and versioned URLs</summary>

Three approaches:
- **TTL** — every object has an expiry; CDN re-checks origin after.
- **Purge** — explicit API call to evict a URL globally (Cloudflare, Akamai).
- **Versioned URLs** — change the filename (`app.v123.js`) so old CDN entries are simply unreachable. *This is the safest pattern.*

</details>

## 6.5 Where CDNs live in the architecture

<details>
<summary><strong>Read as text</strong> — edge, regional cache and origin shield</summary>

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

</details>

## 6.6 Cache keys and the `Vary` header

<details>
<summary><strong>Read as text</strong> — key explosion and normalising at the edge</summary>

A CDN's cache key is by default `(host + path + query)`. But the same URL can return different responses based on language, device, or compression. The `Vary` HTTP header tells the CDN to also key on those headers:

```
   Vary: Accept-Encoding, Accept-Language
```

Too-aggressive `Vary` (e.g., on User-Agent) explodes the key space and tanks hit ratio. **Normalize at the edge** — bucket User-Agents into "mobile / desktop / bot", map languages to a small set.

</details>

## 6.7 Streaming video at the edge — HLS and DASH

![Infographic on video streaming, edge compute and Anycast: an HLS / DASH panel with master.m3u8 and 1080p / 720p rows of seg001–seg003.ts where the player drops to 720p when bandwidth drops (GET /master.m3u8 playlist, GET /1080p/seg001.ts chunk); an edge-compute panel with a Worker (JS / Wasm) doing auth · A/B · resize inside a POP before an optional call to the origin (Cloudflare Workers, Fastly Compute, Lambda@Edge, Akamai EdgeWorkers); an Anycast globe with 1.1.1.1 announced from Tokyo, London, NYC, São Paulo and Sydney, BGP steering users to the nearest POP and a DDoS wave split across POPs; and a key-numbers table (2–10 second chunks, .m3u8 / .mpd, hundreds of POPs, multi-terabit-per-second DDoS, public DNS 1.1.1.1 and 8.8.8.8).](diagrams/sd23_info_edge_video_anycast_ai.png)

<details>
<summary><strong>Read as text</strong> — manifests, chunks and adaptive bitrate</summary>

Video is split into 2–10 second chunks; the player picks chunk quality based on bandwidth. Both protocols use:
- A **manifest** (.m3u8 / .mpd) listing available bitrates and chunk URLs.
- **Chunks** served as ordinary HTTP files — perfectly cacheable on CDNs.

```
   Player ──▶ CDN: GET /master.m3u8           (playlist)
   Player ──▶ CDN: GET /1080p/seg001.ts       (chunk)
              (player adapts to 720p if bandwidth drops)
```

This is why YouTube and Netflix can serve billions of viewers — on-demand video segments never change, so they cache perfectly (for live streams only the small playlist keeps changing and must be refreshed).

</details>

## 6.8 Edge compute

<details>
<summary><strong>Read as text</strong> — programmable workers in front of the origin</summary>

Modern CDNs run small JS / WebAssembly workers at the edge:
- **Cloudflare Workers / Fastly Compute / AWS Lambda@Edge and CloudFront Functions / Akamai EdgeWorkers**.
- Use for: A/B routing, auth checks, header rewriting, request collapsing, personalization at the edge.

The mental shift: the "edge" is no longer just a cache — it's a programmable runtime that runs *before* the origin sees the request. New patterns: edge-side JWT verification, geo-routing, IP allow/deny, image resizing on the fly.

</details>

## 6.9 Anycast — one IP, many locations

<details>
<summary><strong>Read as text</strong> — one IP announced from many POPs</summary>

```
   Same IP 1.1.1.1 announced from POPs in
   Tokyo, London, NYC, São Paulo, Sydney...

   The internet's BGP routing automatically sends each user
   to the *nearest* POP by network path (usually, not always,
   the geographically closest one).
```

Anycast is the secret sauce that lets Cloudflare absorb multi-terabit-per-second DDoS attacks — the traffic is split across hundreds of POPs by routing itself, not by your code. Many CDNs use Anycast (others steer users with DNS — GeoDNS, §4.12 — or mix both), as do public DNS resolvers (1.1.1.1, 8.8.8.8) and global cloud load balancers.

</details>

---

## Key Takeaways

```
SYSTEM DESIGN PART 1 — FOUNDATIONS & PROTOCOLS
═══════════════════════════════════════════════════════════════

CORE CONCEPTS
  • Three forces shape every system: cost, performance,
    reliability — trade them, don't max all.
  • Scale out (horizontal) beats scale up past one box.
  • Availability ≠ reliability ≠ durability; nines cost $$.
  • Latency = one request; throughput = many per second.
  • Little's Law: concurrency = arrival rate × latency.
  • Tail (p99) dominates user-facing latency; fan-out
    amplifies it — design for the slow request.
  • CAP/PACELC: under partition pick C or A; else latency
    vs consistency.

NETWORKING & PROTOCOLS
  • TCP = reliable, ordered, congestion-controlled;
    UDP = stateless, lossy, fast (DNS, video, QUIC).
  • HTTP/2 multiplexes; HTTP/3 runs on QUIC/UDP, no
    TCP head-of-line blocking, faster handshake.
  • RTTs before the first request: TCP + TLS 1.2 = 3,
    TCP + TLS 1.3 = 2, QUIC/HTTP/3 = 1 (0 on resumption).
  • DNS is the resolution layer and a load-balancing tool.
  • Use Cache-Control/ETag for HTTP caching correctness.

API STYLES
  • REST: simple, cacheable, resource-oriented.
  • gRPC: Protobuf + HTTP/2, deadlines, streaming — internal.
  • GraphQL: flexible queries, but N+1 and caching pain.
  • WebSockets/SSE/long-poll for server push & realtime.
  • Idempotency keys make retries safe; version your APIs.

LOAD BALANCING & RESILIENCE
  • L4 = fast transport routing; L7 = content-aware routing.
  • Algorithms: round-robin, least-conn, consistent hash.
  • Rate limit (token/leaky bucket) to protect backends.
  • Circuit breaker + bulkhead stop cascading failures.

CACHING & CDN
  • Four patterns: cache-aside, read/write-through,
    write-behind. Cache-aside is the default.
  • Eviction: LRU/LFU/W-TinyLFU; pick by access pattern.
  • Guard stampedes with single-flight + jittered TTLs.
  • Cache invalidation is the hard problem — TTL + events.
  • CDN serves static/edge content near users (push/pull);
    Anycast and/or DNS steering send users to a nearby POP.
```

---

> **Continued in [Chapter 24 — System Design — Part 2: Data & Distributed Systems](#content/24_system_design_data_distributed).** Part 2 picks up the §X.Y numbering at §7.1 and covers databases (SQL/NoSQL internals, indexing, MVCC/WAL, LSM), scaling them out (replication, sharding, multi‑region), the distributed‑systems theory that holds it together (CAP, consensus, time, locks, CRDTs), messaging & streaming (Kafka, outbox + CDC), storage systems, and data processing.
>
> **After that:** [Chapter 25 — System Design — Part 3: Operations & Case Studies](#content/25_system_design_operations_case_studies) covers reliability, security, observability, deployment, multi‑region, FinOps, anti‑patterns, and a full Instagram worked example.
