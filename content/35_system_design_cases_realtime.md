# Chapter 35 — System Design Case Studies — Part 1: Real-Time & Communication

> "A distributed system is one in which the failure of a computer you didn't even
> know existed can render your own computer unusable." — Leslie Lamport

This is the first of three **worked "Design X" case-study chapters**. The general
theory already lives in the repo — networking, load balancers, caching, and CDNs in
**Ch 23 (Foundations & Protocols)**; databases, sharding, consensus, and messaging in
**Ch 24 (Data & Distributed Systems)**; reliability, security, and the Instagram worked
example in **Ch 25 (Operations & Case Studies)**; and ML-specific design in **Ch 26**.
These three chapters do **not** re-teach that theory. They **assemble** it into
end-to-end answers to the questions an interviewer actually asks: *"Design a chat app."
"Design Zoom." "Design Google Docs."*

Chapter 35 opens with **Part A — the universal playbook** you reuse on every question,
then works four **real-time / communication** systems in full. These are the hardest
designs to fake, because they break the comfortable request/response mental model:
connections stay open for hours, messages must be ordered and delivered exactly once
*as perceived by a human*, media flows over UDP instead of TCP, and two people edit the
same character at the same millisecond. Get these right and you have demonstrated the
senior signal interviewers are hunting for.

> **How this differs from Ch 25:** Ch 25 sketched a reusable framework and one worked
> example (Instagram). This chapter turns that framework into a repeatable *method*
> (Part A) and then goes far deeper on four systems Ch 25 never touched. Where Ch 25
> gave a 5-line "WhatsApp chat" sketch, here is the full treatment.

## What you'll learn

- A repeatable **8-step method** for any "Design X" question, plus a clarifying-question
  script, an estimation refresher, and a 4-layer architecture you echo every time.
- How to **drive the 45-minute conversation** and what separates a junior, senior, and
  staff-level answer.
- **Notification system** — queues, fan-out, multi-channel routing, idempotent dedupe.
- **Chat / messaging** — persistent-connection gateways, a connection registry for
  routing, per-conversation ordering, and the delivery/read-receipt state machine.
- **Video conferencing** — why it is *not* request/response: WebRTC over UDP, signaling
  vs media path, STUN/TURN, and the **SFU vs MCU vs mesh** trade-off with the stream math.
- **Collaborative editing** — the concurrent-edit conflict problem solved two ways:
  **Operational Transformation (OT)** vs **CRDTs**, with a worked example.

## Table of Contents

- **PART A — The universal "Design X" playbook**
  - A.1 The 8-step framework
  - A.2 The clarifying-questions script
  - A.3 Back-of-envelope estimation refresher (+ latency numbers)
  - A.4 The 4-layer reference architecture
  - A.5 Driving the 45-minute conversation
  - A.6 The senior-signal rubric (junior vs senior vs staff)
  - A.7 Common failure patterns that sink candidates
- **CASE STUDY 1 — Notification System**
- **CASE STUDY 2 — Chat / Messaging App (WhatsApp / Slack)**
- **CASE STUDY 3 — Video Conferencing (Zoom / Google Meet)**
- **CASE STUDY 4 — Collaborative Editor (Google Docs)**
- **Key Takeaways**

---

# PART A: THE UNIVERSAL "DESIGN X" PLAYBOOK

Before any specific system, internalize the **method**. Interviewers are not grading
whether you have memorized WhatsApp's architecture; they are grading whether you can
take an ambiguous prompt and drive it to a defensible design under time pressure. The
candidates who flail are the ones with no process — they jump straight to drawing boxes,
never state a number, and run out of clock before reaching the interesting part. The
candidates who pass run the **same loop every time**. Part A is that loop. Every case
study in Ch 35–37 is just this playbook applied to a new prompt.

## A.1 The 8-step framework

```
        THE 8-STEP "DESIGN X" LOOP   (≈45 min on the whiteboard)

   ┌─────────────────────────────────────────────────────────────┐
   │ 1. CLARIFY     scope it; nail functional reqs + NFR numbers   │ ~5m
   ├─────────────────────────────────────────────────────────────┤
   │ 2. ESTIMATE    QPS, storage/yr, bandwidth, connections, RAM   │ ~4m
   ├─────────────────────────────────────────────────────────────┤
   │ 3. API         the 3–5 endpoints / message types that matter  │ ~3m
   ├─────────────────────────────────────────────────────────────┤
   │ 4. DATA        entities → schema sketch → store per entity    │ ~5m
   ├─────────────────────────────────────────────────────────────┤
   │ 5. HLD         boxes & arrows: edge → services → data → async │ ~8m
   ├─────────────────────────────────────────────────────────────┤
   │ 6. DEEP-DIVE   the 1–2 CRUX components, code/algorithm level  │ ~10m
   ├─────────────────────────────────────────────────────────────┤
   │ 7. BOTTLENECK  find the breakpoint; cache / shard / queue it  │ ~6m
   ├─────────────────────────────────────────────────────────────┤
   │ 8. TRADE-OFFS  name what you sacrificed; CAP / PACELC out loud │ ~4m
   └─────────────────────────────────────────────────────────────┘
        ▲ loop back to step 1 whenever the interviewer adds a constraint
```

**Block by block:** **(1) Clarify** turns a vague prompt into a bounded problem — you
write functional requirements and, critically, *non-functional* ones as numbers (scale,
latency, consistency). **(2) Estimate** is the back-of-envelope math that justifies every
later choice; without it you cannot argue "this needs sharding." **(3) API** pins down the
contract — the 3–5 calls (or, for real-time systems, *message types*) that define the
system. **(4) Data** picks the right store per entity and the shard key. **(5) HLD** is the
big layered diagram (the bulk of the score). **(6) Deep-dive** is where you spend the most
time: drop to code level on the *one* component that is the heart of this problem.
**(7) Bottleneck** stress-tests the design — "where does this break at 10×?" **(8)
Trade-offs** is the senior close: name what you gave up and the condition to revisit it.

| Step | You produce | Time | Senior signal |
|------|-------------|------|---------------|
| 1 Clarify | Functional + NFR list (with numbers) | ~5m | NFRs as numbers, scope cuts stated aloud |
| 2 Estimate | QPS, storage/yr, bandwidth, #connections | ~4m | A number that *drives* a decision |
| 3 API | 3–5 endpoints / message types | ~3m | Idempotency keys, cursors, versioning |
| 4 Data | Entity → store → shard key table | ~5m | Store chosen from access pattern, not habit |
| 5 HLD | Layered architecture diagram | ~8m | Clean edge→service→data→async separation |
| 6 Deep-dive | The crux, code/algorithm level | ~10m | Picks the *right* crux; real depth, no hand-wave |
| 7 Bottleneck | Hot keys, fan-out, breakpoints | ~6m | Quantifies the breakpoint before fixing it |
| 8 Trade-offs | CAP/PACELC call-outs | ~4m | Names the sacrifice + when to revisit |

The time budgets are a guide, not a contract — but **always reach step 8**. An answer
that never states a trade-off reads as junior, no matter how pretty the diagram.

## A.2 The clarifying-questions script

Memorize this checklist and recite the relevant lines on every question. Asking sharp
questions is itself a graded signal: it shows you know what *varies* between designs.

```
   FUNCTIONAL  — what must it do?
     • Who are the actors (users, internal services, admins)?
     • What are the 3–4 core use cases? What is explicitly OUT of scope?
     • Read-heavy or write-heavy? What's the read:write ratio?

   SCALE       — how big? (turn every answer into a number)
     • DAU / MAU? Actions per user per day? Peak vs average?
     • Object sizes (a message? a photo? a video minute?)
     • Concurrent connections (for real-time systems)?
     • Growth horizon — design for today's 10× or 100×?

   CONSISTENCY — how correct, how fresh?
     • Strong or eventual? Where does stale data actually hurt a user?
     • Ordering guarantees (global? per-user? per-conversation? none)?
     • Exactly-once, at-least-once, or at-most-once delivery?

   LATENCY & AVAILABILITY — how fast, how reliable?
     • p50 / p95 / p99 targets for the hot path?
     • Availability target (99.9% = 8.7h/yr down, 99.99% = 52m/yr)?
     • Is degraded service acceptable, or must it be all-or-nothing?

   COST & OPS  — what can we spend?
     • Budget sensitivity? (storage tiers, egress, premium providers)
     • Single-region or multi-region / global from day one?
     • Compliance: GDPR, data residency, retention, encryption?
```

You will not ask all of these — pick the 4–6 that change *this* design. For a chat app
you lead with **ordering** and **delivery semantics**; for video conferencing you lead
with **latency** and **bandwidth**; for a notification system you lead with **delivery
guarantees** and **priority lanes**. Stating "I'll assume X unless you'd like to explore
Y" keeps you moving while showing you saw the fork.

## A.3 Back-of-envelope estimation refresher

You cannot justify sharding, caching, or a queue without numbers. The whole skill is
arithmetic to **one significant figure**. Two tricks make it fast.

**Trick 1 — powers of ten.** Round everything to the nearest power of ten and count
zeros; never do long multiplication on a whiteboard.

```
   2^10 ≈ 10^3 = thousand (K)        1 KB  ≈ 10^3  bytes
   2^20 ≈ 10^6 = million  (M)        1 MB  ≈ 10^6  bytes
   2^30 ≈ 10^9 = billion  (B/G)      1 GB  ≈ 10^9  bytes
   2^40 ≈ 10^12 = trillion (T)       1 TB  ≈ 10^12 bytes
```

**Trick 2 — "a day is about 10^5 seconds."** Exactly 86,400 s, but 10^5 is close enough
and turns division into subtracting exponents.

```
   QPS        = (users × actions/user/day) ÷ 86,400  ≈ ( … ) ÷ 10^5
   Peak QPS   ≈ 2–3 × average QPS              (diurnal + spikes)
   Storage    = items/day × bytes/item × retention_days
   Bandwidth  = QPS × bytes/object            (in and out separately)
   Conns      = concurrent_users               (real-time systems)
   Cache RAM  = hot_set_fraction × items × bytes/item
```

**Worked example — "messages per second for a global chat app":**

```
   DAU                  500,000,000        (5 × 10^8)
   Messages/user/day    40
   ── messages/day      2 × 10^10  (20 B)        [5e8 × 40]
   Average write QPS    2e10 / 1e5  = 2 × 10^5   = 200,000 writes/s
   Peak write QPS (3×)  ≈ 600,000 writes/s
   Read:write           ~1:1 (you read messages others send you), so
                        reads ≈ another 200k/s average  → ~400k ops/s total
   Bytes per message    ~200 B (text + metadata)
   Storage/day          2e10 × 200 B = 4 × 10^12 = 4 TB/day
   Storage/year         4 TB × 365   ≈ 1.46 PB/year (text only)
   Concurrent online    ~20% of DAU = 10^8 = 100 M open connections
```

What the numbers *teach* (this is the point — estimates must change a decision):
600k writes/s and 100 M persistent connections both say **one box cannot do this** →
you need a sharded, horizontally-scaled connection tier and a write-optimized store.
1.46 PB/year says **don't put messages in your primary SQL DB** → a wide-column store
(Cassandra/HBase) with cheap disks. The estimate *forced* two architecture choices
before you drew a single box.

**Latency numbers every engineer should know** (Jeff Dean's table, also in Ch 25 — keep
it in your head; it tells you when the network, not the CPU, is your enemy):

```
   L1 cache reference                      0.5  ns
   Branch mispredict                         5  ns
   L2 cache reference                        7  ns
   Mutex lock / unlock                      25  ns
   Main memory reference                   100  ns
   Compress 1 KB (Snappy)                2,000  ns =   2 µs
   Send 1 KB over 1 Gbps network        10,000  ns =  10 µs
   SSD random read                      16,000  ns =  16 µs
   Read 1 MB sequentially from RAM     250,000  ns = 250 µs
   Round trip in same datacenter       500,000  ns = 0.5 ms
   Read 1 MB sequentially from SSD   1,000,000  ns =   1 ms
   Disk seek                        10,000,000  ns =  10 ms
   Read 1 MB sequentially from disk 20,000,000  ns =  20 ms
   Round trip US ↔ Europe          150,000,000  ns = 150 ms
```

Two takeaways: **(1) network ≫ memory ≫ CPU** — a cross-continent round trip is ~300,000×
a memory reference, so a chatty design that makes many sequential remote calls is doomed;
batch and parallelize. **(2) sequential ≫ random** — one big sequential read beats many
small random ones, which is *why* log-structured stores (Cassandra, Kafka) win for
write-heavy workloads.

## A.4 The 4-layer reference architecture

Almost every system you will design is a specialization of **four layers read
top-to-bottom**. Memorize this skeleton; in the interview you draw it first, then
delete the layers a given problem doesn't need and fatten the one that is the crux.
Every case study in Ch 35–37 echoes this exact shape.

```
            THE 4-LAYER REFERENCE ARCHITECTURE
     (every case study in Ch 35–37 specializes this skeleton)

 ═══════════ LAYER 1 · EDGE  —  get bytes in and out ════════════════
   Client(s) ─▶ GeoDNS ─▶ CDN ─▶ API Gateway ─▶ L7 Load Balancer
                (static +      (authN, TLS,     (health checks,
                 media)         rate-limit)      retries, spread)
                                     │
 ═══════════ LAYER 2 · SERVICES  —  stateless logic ════════════════
        ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
        │Service A │ │Service B │ │Service C │ │  Realtime    │
        │ (CRUD)   │ │ (CRUD)   │ │(compute) │ │  Gateway     │◀─ holds
        └────┬─────┘ └────┬─────┘ └────┬─────┘ │ (WS/gRPC,    │  persistent
             │            │            │       │  pub/sub)    │  connections
             │            │            │       └──────┬───────┘
 ════════════╪════════════╪══ LAYER 3 · DATA ═════════╪════════════════
        ┌────▼────┐ ┌─────▼──────┐ ┌───▼────┐ ┌────────▼─────┐
        │  SQL    │ │ Wide-column│ │ Cache  │ │ Blob / Object│
        │ (ACID:  │ │(Cassandra: │ │(Redis: │ │ store (S3:   │
        │ users,  │ │ msgs,feeds,│ │ hot kv,│ │ media, files,│
        │ money)  │ │ logs,TTL)  │ │ counts)│ │ backups)     │
        └─────────┘ └────────────┘ └────────┘ └──────────────┘
          + Search index (Elasticsearch) · Geo index (S2 / quadtree)
 ════════════╪═════ LAYER 4 · ASYNC  —  decouple slow work ══════════════
        every write drops an event ─▶ Message bus (Kafka / PubSub)
              │          │          │            │
          Fan-out     Indexer    Transcoder   Analytics    (consumer
          workers   → search    → media        (Flink)      groups,
          → inboxes   index       pipeline      → warehouse  each w/ DLQ)
```

**Layer 1 · Edge** is everything between the user and your code: **GeoDNS** points the
client at the nearest region, the **CDN** serves static assets and media from the edge
(theory: *CDN & edge* — Ch 23), the **API Gateway** terminates TLS and enforces authN +
rate-limiting, and the **L7 load balancer** spreads traffic across healthy service
instances (theory: *load balancing* — Ch 23). **Layer 2 · Services** are *stateless*
microservices you can scale by adding instances — except the **Realtime Gateway**, which
is special because it holds millions of long-lived WebSocket/gRPC connections (every
real-time system in this chapter lives or dies on this box). **Layer 3 · Data** uses the
right store per job: **SQL** for anything needing ACID (users, money), a **wide-column**
store for write-heavy time-series (messages, feeds, logs), **Redis** for the hot cache and
counters, and an **object store** for blobs (theory: *SQL vs NoSQL, wide-column* — Ch 24).
**Layer 4 · Async** is the trick that keeps the user's request fast: every write drops an
event on a **message bus** (Kafka), and background **consumer groups** do the slow work —
fan-out, search indexing, media transcoding, analytics — each with retries and a
dead-letter queue (theory: *Kafka, DLQ, exactly-once* — Ch 24).

The mental shortcut: **synchronous path stays in Layers 1–3 and returns in milliseconds;
everything that can be late moves to Layer 4.** When a design feels slow or fragile, the
fix is almost always "push that work to Layer 4."

## A.5 Driving the 45-minute conversation

A system-design interview is a *conversation you lead*, not an exam you complete in
silence. Manage the clock visibly. Here is the minute map most strong candidates follow.

```
   MIN 0     5       9   12      20            30        38     45
       │     │       │   │       │             │         │      │
   ┌───┴─────┴───────┴───┴───────┴─────────────┴─────────┴──────┴┐
   │CLARIFY│ESTIMATE│API│ DATA  │     HLD       │ DEEP-DIVE│BOTTLE│
   │ reqs  │ math   │   │ model │  big diagram  │  the CRUX│+TRADE│
   └───────┴────────┴───┴───────┴───────────────┴──────────┴──────┘
     talk    show     say  pick    DRAW Layer-1→4  go to     break
     scope   the      the  stores  (the A.4       code on    it, then
     aloud   numbers  API          skeleton)      1–2 parts  name the
                                                             sacrifice
   ▲ check in every few minutes: "Does this match what you wanted, or
     should I go deeper on the realtime path / the storage / failures?"
```

**How to read the timeline:** spend the first ~12 minutes on *framing* (clarify,
estimate, API) — fast, crisp, numeric. Around minute 12 start the **HLD diagram**; this
is the spine of the score, so draw the full Layer 1→4 skeleton from A.4. At ~minute 20
the interviewer usually says "go deeper on X" — that is your cue for the **deep-dive**, the
single most important segment, where you drop to code/algorithm level on the crux. Leave
the last ~7 minutes for **bottlenecks and trade-offs**; candidates who never reach
trade-offs cap out at "junior." Throughout, **think out loud** and **check in** — a design
interview rewards the engineer who collaborates, surfaces assumptions, and invites the
interviewer to redirect. If they add a constraint ("now make it global"), loop back to the
relevant step rather than bolting it on.

## A.6 The senior-signal rubric

The same prompt produces wildly different scores. Here is what each level *sounds* like —
aim for the right-hand columns.

| Dimension | Junior sounds like | Senior sounds like | Staff sounds like |
|-----------|--------------------|--------------------|-------------------|
| Requirements | jumps straight to boxes | clarifies scope; states NFRs as numbers | challenges the premise; picks the one metric that matters |
| Estimation | skips it or guesses | back-of-envelope QPS / storage | uses a number to *force* a design choice |
| Architecture | one giant box | clean edge→service→data→async layering | identifies the crux up front, spends time there |
| Data | "use a database" | right store per entity + shard key | explains the access pattern that *forces* the store |
| Real-time | polls in a loop | WebSocket + connection registry | reasons about backpressure, reconnest, ordering |
| Failure | doesn't mention it | lists what dies + user impact | designs degradation modes; limits blast radius |
| Trade-offs | "it's scalable" | names the CAP choice | quantifies the trade + when to revisit it |
| Communication | monologues | thinks aloud, checks in | drives the session, manages the clock |

The throughline: **seniority is measured by judgment, not by knowing more boxes.** A staff
answer is not bigger — it is more *decisive*, spending its minutes on the one or two
choices that actually determine whether the system works.

## A.7 Common failure patterns that sink candidates

The meta red-flags — independent of which system you are designing:

- **Designing in silence / not clarifying.** Building the wrong system perfectly scores zero.
- **No estimate.** With no numbers you cannot justify a single decision; everything sounds
  like hand-waving.
- **Schema before access pattern.** Picking tables before you know the reads/writes leads
  to the wrong store. Decide *how it's queried*, then choose.
- **"We'll just add a cache."** Without naming *what* you cache, the TTL, and the
  invalidation strategy, this is a non-answer (and stale-cache bugs are real).
- **Synchronous where async belongs.** Calling a slow provider on the request path couples
  your latency to theirs. If it can be late, move it to Layer 4.
- **One giant database for everything.** Money, messages, media, and search have different
  access patterns; one store cannot be good at all of them.
- **Happy-path only.** No failure modes = no senior signal. Always ask "what if this box
  dies, and what does the *user* see?"
- **Hand-waving the crux.** "We use a distributed system for that" is where you should be
  going *deeper*, not skating past.
- **Buzzword bingo.** Naming Kafka, Raft, and CRDTs without justifying them invites exactly
  the follow-up question that exposes the gap.
- **No clock management.** Spending 30 minutes on the API sketch and never reaching
  trade-offs. Budget your minutes (A.5).
- **Over-engineering.** Multi-region active-active for a system with 1,000 users is as wrong
  as a single box for a billion. Match the design to the stated scale.

Keep these in your peripheral vision while you work the four case studies below — each one
calls out the *system-specific* red flags on top of these universal ones.

---

# CASE STUDY 1 — NOTIFICATION SYSTEM

> **Google priority:** ★★ · **Difficulty:** Medium · **Frequency:** Very common · **Time budget:** ~35 min
>
> **At a glance**
> - **The hard part —** deliver *billions* of messages across push / email / SMS / in-app, **once each**, fast when it matters and cheap when it doesn't.
> - **Key building blocks —** durable per-channel queues, Redis (dedupe + token-bucket), provider workers (APNs / FCM / SES / Twilio), delivery webhooks.
> - **The crux (LLD) —** idempotent dedupe (`SET NX`) + an atomic per-user token-bucket (Lua).
> - **Scale anchor —** ~35 k notifications/sec at peak; SMS is the quota-limited channel and the delivery log is the real storage cost.

Imagine the single piece of software at a company that every other team wants to use:
"send my user a message." Search wants to send "your package shipped." Growth wants "we
miss you." Security wants "new login from Chrome." A **notification system** is the shared
pipe that takes those requests and reliably delivers them across **push, SMS, email, and
in-app** — without spamming anyone, without losing the important ones, and without falling
over when one provider (say, Apple's push servers) has a bad day. The hard part isn't
sending one message; it's sending **billions**, to the right channel, exactly enough times,
fast when it matters and cheap when it doesn't.

## 1.0 What's really being tested

- Can you **decouple** producers from delivery with a queue instead of blocking the caller?
- Do you handle **fan-out**, **multi-channel routing**, and **user preferences/quiet hours**?
- Do you get **delivery semantics** right (at-least-once + **idempotent dedupe**)?
- Do you protect users with **rate-limiting** and the business with **retries + DLQs**?
- Do you separate **transactional** (must arrive, low latency) from **marketing** (bulk, can lag)?

## 1.1 Clarify — requirements

**Functional**
- Accept a "send" request from many internal services.
- Deliver across channels: **push (APNs/FCM), email, SMS, in-app**.
- Respect **per-user preferences** (opt-outs, channel choice, quiet hours, timezone).
- **Templates** with localization/variables.
- **Dedupe** identical notifications; **schedule** future/digest sends.

**Out of scope** (state these to show focus): the authoring UI, content/copywriting, and the
ML that decides *who* to notify (that's a different system that calls us).

**Non-functional**
- **Scale:** assume 100 M users, ~10 notifications/user/day.
- **Latency:** transactional (OTP, security) p95 < 5 s end-to-end; marketing may lag minutes.
- **Delivery:** **at-least-once**, deduped to feel exactly-once; never silently drop a transactional msg.
- **Availability:** 99.9%+; a single channel/provider outage must not block other channels.
- **Multi-tenancy (SaaS):** this is usually a *shared* service that many client teams — and
  sometimes external companies — call. Enforce **per-tenant quotas/rate-limits** so no single
  tenant can spam users *or* exhaust a shared downstream provider on everyone else's behalf.

**Questions to ask out loud** (reciting these is senior signal): *What's the read:write?
Priorities/lanes? Acceptable delay per class? Which providers? Do we need delivery receipts
& open tracking? Regulatory constraints (TCPA/GDPR, unsubscribe)?*

**API contract** (one endpoint does most of the work — keep it tiny and idempotent):

```
   POST /v1/notify
     { userId, type:"security.login",        // routing + template key
       channelHint:"push",                    // optional override
       data:{ device:"Chrome on Mac" },       // template variables
       idemKey:"login-9f3a",                  // caller-supplied dedupe key
       priority:"transactional" }             // transactional | marketing
     → 202 Accepted { notifId }   (or 200 { status:"duplicate" })

   GET  /v1/notify/{notifId}      → accepted|sent|delivered|opened|failed
   PUT  /v1/prefs/{userId}        → channel opt-ins, quiet hours, timezone
```

## 1.2 Estimate — back-of-envelope

```
   Users                100,000,000
   Notifs / user / day  10
   ── total/day         1,000,000,000  (1 B)              [users × rate]
   Avg QPS              1e9 / 86,400  ≈ 11,600 / s        [day ≈ 10^5 s]
   Peak (3×)            ≈ 35,000 / s
   Channel mix          70% push, 15% in-app, 10% email, 5% SMS
   SMS QPS (peak)       0.05 × 35,000 ≈ 1,750 / s  → provider quota matters!
   Delivery log         1 B/day × 300 B ≈ 300 GB/day  → 90-day TTL ≈ 27 TB
```

Lesson the numbers teach: **SMS volume is small but expensive & quota-limited**; **push is
the firehose**; **the delivery log is the real storage cost** → put it in a cheap
wide-column store with a TTL, not your primary DB.

## 1.3 HLD — high-level architecture

Read it top-to-bottom: the **synchronous ingest** (Layer 1) acknowledges the caller in
milliseconds; every slow step hangs off the **async backbone** (Layer 2) below.

![Notification System — high-level architecture (HLD)](diagrams/notification.svg)

**Legend:** `.q` = durable queue (Kafka topic / SQS). Boxes are stateless services unless
they name a store. Read top-to-bottom: a request enters at LAYER 1, is acknowledged in
milliseconds, and all the slow work happens in LAYER 2.

**Block by block:**
- **Notification API** — the only synchronous hop. It authenticates the caller, validates
  the payload, runs **dedupe**, persists an "accepted" record, emits one Kafka event, and
  returns `202 Accepted`. It never talks to a provider — that's what keeps caller latency in
  milliseconds.
- **Kafka "requested" topic** — the durable buffer that absorbs spikes (the 35 k/s peak) and
  decouples ingest from processing. If processors fall behind, messages wait here, not in RAM.
- **Notification Processor** — the brain: preferences → quiet-hours/opt-out → channel
  selection → template render → per-user rate-limit → fan-out. Stateless and horizontally
  scaled by Kafka partitions.
- **Per-channel queues + workers** — isolation by channel (the **bulkhead** pattern, Ch 23):
  if Twilio is slow, `sms.q` backs up but push/email/in-app keep flowing. Each worker owns
  its own retry/backoff and a **dead-letter queue** for poison messages (Ch 24). The channel
  layer is **pluggable** — to add WhatsApp as a channel, register a new channel worker +
  template type and route to its queue; nothing upstream changes.
- **Delivery log + analytics** — providers call back (webhooks) with delivered/bounced/opened;
  workers turn those into events for the cheap, TTL'd log and the metrics pipeline.

## 1.4 HLD — critical path walkthrough

A transactional "new login" alert, end to end:

```
  1. Security service ─▶ POST /v1/notify
        { userId, type:"security.login", channelHint:"push",
          idemKey:"login-9f3a" }
  2. API: SETNX dedupe:login-9f3a (TTL 24h)
        ├─ already exists ─▶ return 200 {status:"duplicate"}  (no resend)
        └─ first time ─▶ persist "accepted", emit event, return 202
  3. Processor consumes event:
        load prefs → user allows security pushes, not in quiet hours
        render template "New sign-in on {device}" → enqueue push.q job
  4. Push worker: token-bucket OK → call FCM → FCM 200 → emit "delivered"
  5. FCM later POSTs a webhook "opened" → worker logs open event
```

Notice the design promises: step 2 makes retries safe (**idempotent**), step 3 honors
**preferences**, step 4 enforces **rate-limit + at-least-once**, step 5 closes the loop with
**delivery tracking**. Every requirement maps to a step.

## 1.5 HLD — data model & storage choices

| Entity | Shape (key fields) | Store | Why |
|--------|--------------------|-------|-----|
| Preferences | `user_id → {channel:on/off, quiet_hours, tz, locale}` | Sharded SQL or KV | Point reads by user_id; small, hot → cache in Redis |
| Templates | `template_id, version, locale → body` | Versioned blob + Redis cache | Read-mostly; never hard-code copy in services |
| Dedupe keys | `idemKey → 1` (TTL 24 h) | Redis (SETNX) | O(1), auto-expiring; the exactly-once illusion |
| Rate-limit | `user_id → token bucket` | Redis (Lua, atomic) | Atomic check-and-decrement at the edge of fan-out |
| Usage/metering | `(tenant_id, day) → request_count` | Redis counters → OLAP rollup | Per-client request counts for quotas, reporting & per-use billing |
| Delivery log | `(user_id, ts) → status…` | Cassandra (TTL 90 d) | Write-heavy, time-series, cheap, expiring |
| In-app feed | `(user_id, ts) → notif` | Cassandra / Bigtable | Per-user timeline reads, write-heavy |

## 1.6 HLD — scaling & bottlenecks

- **Throughput** scales by Kafka partitions × consumer instances; shard everything by
  `user_id` so one user's traffic stays ordered and on one partition.
- **Hot tenant** (a service blasting 1 M users in a second): admission-control / quota per
  caller at the API; spread fan-out over time for non-urgent classes.
- **Per-tenant quotas (multi-tenant isolation):** give every client/tenant its own rate-limit
  bucket at ingest. This serves *two* ends — it stops one tenant spamming users, and it caps
  any single tenant's draw on the shared downstream providers (APNs/Twilio/SES), so a noisy
  tenant can't starve the others (the **bulkhead** pattern applied to tenants, Ch 23).
- **Provider quotas** (SMS): a **leaky-bucket shaper** in the SMS worker matches Twilio's
  allowed rate; overflow waits in `sms.q` (it's durable) rather than getting dropped.
- **Priority lanes:** separate `transactional` vs `marketing` topics/queues so a 10 M-email
  marketing blast can never delay an OTP. Workers drain transactional first.
- **Thundering digest:** for a "daily digest," don't wake 100 M users at 09:00 sharp — spread
  by **user-local time** and jitter within the hour, or you create a self-inflicted 100 M/s
  spike and melt your providers.

```
   NAÏVE (all at 09:00 UTC)        SPREAD (by local tz + jitter)
   spike ▲                         smooth ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁ rolling
   100M/s│█                        ~ flat across the hour & globe
         │█                        each tz bucket fires at its own 09:00,
       0 └────── time              jittered ±30 min → provider stays happy
```

The left bar is what happens if you schedule every user at the same absolute instant — a
single column of 100 M sends that no provider can absorb. The right curve **spreads the same
volume** across each user's local 09:00 plus a random offset, flattening the peak by ~24×
(one per timezone) without changing what any individual user experiences.

## 1.7 HLD — failure modes & trade-offs

```
  What dies                    →  What the user sees / what we do
  ──────────────────────────────────────────────────────────────────
  A provider (APNs) down       →  push.q backs up; retry w/ backoff;
                                  after N tries → DLQ + alert; other
                                  channels unaffected
  Processor lag (spike)        →  events wait in Kafka (durable); add
                                  consumers; SLO dips, nothing lost;
                                  transactional lane drained first
  Redis (dedupe) unavailable   →  FAIL-OPEN for marketing (a rare dup
                                  is fine); FAIL-CLOSED for money/OTP
                                  (better to delay than double-send)
  Webhook from provider lost   →  delivery shows "sent" not
                                  "delivered"; reconcile via provider's
                                  batch report (eventual truth)
```

**Trade-offs called out:** we choose **at-least-once + dedupe** over true exactly-once
(cheaper, simpler, and good enough). We accept **eventual** delivery-status accuracy. We pay
for **per-channel isolation** with more moving parts — worth it, because blended failure is
the classic outage.

## 1.8 LLD (the crux) — idempotent dedupe + per-user rate limit

The crux of this system is **"send it once, and not too often."** Both are tiny Redis
primitives; getting them right is the senior signal. Everything else is plumbing.

**Dedupe (idempotency):** the caller supplies an `idemKey` (or we derive one from
`hash(userId,type,contentHash,timeBucket)`). First writer wins:

```
  // Atomic "claim this notification" — returns true only the first time.
  function claim(idemKey):
      ok = REDIS.SET(key="dedupe:"+idemKey, val="1",
                     NX=true,            // only set if absent
                     EX=86400)          // expire after 24h
      return ok == "OK"
```

If `claim` is false, we already accepted this notification → return without re-sending. This
makes **every upstream retry safe**, which is what lets the whole pipeline be at-least-once.

**Per-user rate limit (token bucket, atomic in one round-trip via Lua):**

```
  -- KEYS[1]=bucket  ARGV: now, ratePerSec, burst
  local b = redis.call('HMGET', KEYS[1], 'tokens', 'ts')
  local tokens = tonumber(b[1]) or tonumber(ARGV[3])      -- start full (=burst)
  local ts     = tonumber(b[2]) or tonumber(ARGV[1])
  local refill = (tonumber(ARGV[1]) - ts) * tonumber(ARGV[2])
  tokens = math.min(tonumber(ARGV[3]), tokens + refill)   -- cap at burst
  if tokens < 1 then return 0 end                         -- deny (defer)
  tokens = tokens - 1
  redis.call('HMSET', KEYS[1], 'tokens', tokens, 'ts', ARGV[1])
  redis.call('EXPIRE', KEYS[1], 3600)
  return 1                                                -- allow
```

Why a **Lua script**: it makes "read tokens → refill → check → decrement → write" a single
**atomic** operation, so two concurrent notifications can't both spend the last token (the
classic race). Why **token bucket** over fixed window: it allows short bursts (a flurry of
legit alerts) while still capping the long-run rate — no edge-of-window doubling. (Theory:
*token-bucket rate limiting* — Ch 23.)

**Two checks, one primitive.** Production systems apply this *same* token-bucket at **two**
levels: **(a) is this client/tenant allowed to send this volume** — bucket keyed by
`tenant_id`, checked at ingest, which protects users *and* the shared downstream providers;
and **(b) is this user supposed to receive this many** — bucket keyed by `user_id`, the script
above, checked at fan-out. Identical Lua, different key.

## 1.9 Follow-ups, red flags & building blocks

**Likely follow-ups (with crisp answers):**
- *"How do digests/batching work?"* — a scheduled aggregator collects per-user events in a
  window, then emits one notification; spread sends by user-local time (see 1.6).
- *"Ordering?"* — partition by `user_id` so a user's notifications stay ordered within a
  channel; cross-channel ordering isn't guaranteed (and users don't expect it).
- *"Exactly-once?"* — we don't promise it at the transport; we *simulate* it with dedupe keys
  + idempotent provider calls.
- *"Multi-region?"* — process in the user's home region; replicate preferences; providers are global.
- *"How do we bill per-use clients?"* — we keep **per-client request counts** (the metering
  counters in 1.5) and roll them up into usage reports that quota enforcement and billing read from.

**Red flags that sink candidates:** sending synchronously from the API (couples caller
latency to Twilio); no dedupe (every retry double-sends); one shared queue for all channels
(SMS outage blocks push); no per-user rate limit (one buggy producer spams users into
uninstalling); storing templates in code; treating the delivery log like a primary OLTP table.

**Building blocks reused (theory lives elsewhere):** durable queues, consumer groups, DLQs,
exactly-once nuance — **Ch 24** (*Messaging & Streaming*); token-bucket rate limiting,
bulkhead, circuit breaker — **Ch 23**; webhooks & retries — **Ch 25**; Cassandra/wide-column
modeling — **Ch 24**; Redis patterns — **Ch 23**.

---

# CASE STUDY 2 — CHAT / MESSAGING APP (WhatsApp / Slack)

> **Google priority:** ★★★ · **Difficulty:** Hard · **Frequency:** Very common · **Time budget:** ~45 min
>
> **At a glance**
> - **The hard part —** keep *millions* of connections open and deliver **ordered** messages with delivery/read receipts, even when the recipient is offline.
> - **Key building blocks —** WebSocket gateway, a connection registry (who's on which box), per-conversation sequence IDs, wide-column store, push fallback.
> - **The crux (LLD) —** connection-registry routing + the `sent → delivered → read` receipt state machine.
> - **Scale anchor —** ~600 k writes/sec and ~1.46 PB/yr ⇒ wide-column store, not SQL.

Texting *feels* trivial — type, hit send, it appears on your friend's phone. The magic you
don't see is everything that makes it feel instant and reliable: a connection that stays
open for hours so a message can be **pushed** to you the instant it arrives (no refreshing);
the system always knowing **which of thousands of servers** currently holds your friend's
connection; messages that arrive **in order** even when the network reshuffles them; the
little **✓ → ✓✓ → blue ✓✓** that tells you it was sent, delivered, then read; and a mailbox
that **holds your messages while your phone is off** and syncs them when you wake up. At
WhatsApp scale that is **billions of users and ~100 billion messages a day** — the design is
all about persistent connections, routing, ordering, and store-and-forward.

## 2.0 What's really being tested

- Can you hold **tens of millions of persistent connections** and pick the right transport
  (**WebSocket** vs long-poll/SSE)?
- Do you have a **connection registry** so you can route a message to *whichever box* holds
  the recipient's socket?
- Do you get **ordering** right (per-conversation sequence, not expensive global order)?
- Do you model the **delivery / read-receipt state machine** (sent → delivered → read)?
- Do you handle **offline** users (store-and-forward inbox + a "last delivered" offset)?
- Do you fan out **group** messages sanely (write to N inboxes vs one shared log)?
- Bonus senior signal: **E2E encryption** (Signal/double-ratchet) and **multi-device** sync.

## 2.1 Clarify — requirements

**Functional**
- **1:1** and **group** chat; text first, plus media (images/video) by reference.
- **Presence** (online / last-seen) and **typing** indicators.
- **Delivery & read receipts** (sent → delivered → read).
- **Offline delivery**: messages wait and sync when the user reconnects.
- **History sync** across a user's multiple devices.

**Out of scope** (say it): voice/video calls (that's Case Study 3), bots/integrations,
server-side full-text search of E2E content.

**Non-functional**
- **Scale:** ~2 B registered users, ~500 M DAU, ~100 B messages/day; ~100 M concurrent connections.
- **Latency:** online→online delivery p95 < 500 ms in-region.
- **Ordering:** **per-conversation** ordering guaranteed; no global order needed.
- **Durability:** **never lose an accepted message**; at-least-once + client dedupe.
- **Availability:** stay up under partitions; prefer availability over strong global consistency.

**Questions to ask out loud:** *Ordering scope (per-conversation vs global)? Receipts
required? Max group size (10 vs 100 k)? Multi-device? Is E2E encryption a requirement?
Media inline or by reference?*

**Message types** (this is a protocol, not a REST CRUD app):

```
   CONNECT   { token }                 → WS handshake + auth, then keep open
   SEND      { convId, clientMsgId, body }   client→srv (clientMsgId=dedupe)
   ACK       { convId, seqId, state }   server→client  (sent|delivered|read)
   RECEIPT   { convId, seqId, state }   client→server  (delivered|read)
   TYPING    { convId }                 ephemeral, never stored
   SYNC      { convId → lastSeq }       client→server on (re)connect → backfill
```

## 2.2 Estimate — back-of-envelope

Reuse the A.3 worked example (this *is* the global-chat estimate):

```
   DAU                  500,000,000
   Messages/user/day    40
   ── messages/day      2 × 10^10  (20 B)             [5e8 × 40]
   Avg write QPS        2e10 / 1e5  = 200,000 / s
   Peak write QPS (3×)  ≈ 600,000 / s
   Reads ≈ writes       (you read what others send) → ~400k ops/s total
   Concurrent conns     ~20% of DAU = 10^8 = 100 M open sockets
   Conns per gateway    ~500 k (JVM); WhatsApp/Erlang did ~2 M
   ── gateway boxes     100 M / 500 k ≈ 200 (×2–3 for headroom ≈ 500)
   RAM per connection   ~10–30 KB (TLS + buffers) → 100M×20KB ≈ 2 TB fleet
   Message size         ~200 B text → 20 B/day × 200 B = 4 TB/day
   Storage/year         4 TB × 365 ≈ 1.46 PB (text; media in blob store)
```

The numbers force three decisions before any box is drawn: **100 M sockets** ⇒ a dedicated,
horizontally-sharded **connection tier**; **600 k writes/s + 1.46 PB/yr** ⇒ a **write-optimized
wide-column store**, never SQL; and **media** ⇒ keep big bytes out of the message path (blob
store + CDN), store only a reference in the message.

## 2.3 HLD — high-level architecture

**Transport first — why WebSocket?** Chat needs the *server* to push to the client at any
moment. Your options:

| Transport | How it works | Verdict for chat |
|-----------|--------------|------------------|
| **Short polling** | client asks "anything new?" every Ns | wasteful, laggy — ❌ |
| **Long polling** | request hangs until data or timeout | OK fallback, header overhead |
| **SSE** | server→client event stream over HTTP | one-way only — ❌ for sending |
| **WebSocket** | one TCP conn, full-duplex frames | ✅ the default for chat |

We use **WebSocket** (Ch 23) for the live path, with long-poll as a fallback for hostile
networks. Now the architecture:

![Chat / Messaging (WhatsApp / Slack) — high-level architecture (HLD)](diagrams/chat.svg)

**Block by block:** at **Layer 1**, an **L4 load balancer** does TCP/TLS pass-through (an L7
proxy that buffered every frame would add latency and cost) and keeps a connection sticky to
one box. **Layer 2 — the gateway tier — is the system's heart:** each box holds ~500 k live
WebSockets and does nothing but terminate connections and shuttle frames. The moment a socket
opens, the gateway writes an entry into the **Connection Registry** (which gateway holds which
user) — this is what makes routing possible. **Layer 2b** are stateless services: the **Chat
service** assigns the per-conversation **seqId** and persists the message; **Presence** tracks
who's online; the **Receipt service** advances the delivery state machine. **Layer 3** stores
messages in a **wide-column store keyed by `convId`** (write-heavy, time-ordered — Ch 24),
per-user **delivery offsets/inbox** for offline sync, **presence in Redis**, and **media in a
blob store + CDN**. **Layer 4** handles everything that can be slightly late: waking offline
users via **push** (reusing Case Study 1), heavy **group fan-out**, and analytics.

## 2.4 HLD — critical path walkthrough

**Flow 1 — 1:1 message, both users online:**

```
  1. A is on Gateway-A, B is on Gateway-B (both registered at connect).
  2. A ─WS▶ Gateway-A: SEND{convId, clientMsgId, body}
  3. Chat svc: dedupe by clientMsgId; assign per-conversation seqId;
     persist (convId, seqId) to Cassandra → durable.   state = SENT
  4. Gateway-A ─WS▶ A: ACK{seqId, "sent"}              (A sees single ✓)
  5. Router: Registry lookup B → Gateway-B (online) →
        pub/sub publish to "gw:Gateway-B" ▶ Gateway-B ─WS▶ B (B sees msg)
     (If B were OFFLINE: append to B's inbox + emit push (CS1); stop here.)
  6. B's device auto-sends RECEIPT{delivered} → Receipt svc:
        state = DELIVERED → notify Gateway-A ─WS▶ A   (A sees ✓✓)
  7. B opens the chat → RECEIPT{read} → state = READ →
        notify A (A sees blue ✓✓); advance B's lastDelivered offset.
```

**Flow 2 — offline → reconnect sync:**

```
  1. B was offline; messages seq 41..50 are in the conversation log + inbox.
  2. B reconnects to some Gateway-B'; sends SYNC{ convId → lastSeq=40 }.
  3. Server streams convo[41..head] for each conversation B is in.
  4. B acks through seq 50 → server sets B.lastDelivered=50, emits DELIVERED
     receipts to the senders, and clears B's inbox entries.
```

Every promise maps to a step: durability at **3** (persist before ack), ordering at **3**
(seqId), online routing at **5** (registry), the receipt state machine at **6–7**, and
store-and-forward at Flow 2. Note we **persist before we ack** — if the box crashed after
acking but before storing, the user would think it sent when it didn't.

## 2.5 HLD — data model & storage choices

| Entity | Shape (key fields) | Store | Why |
|--------|--------------------|-------|-----|
| Message | `(convId, seqId) → {senderId, body/ref, ts}` | Cassandra (by convId) | Write-heavy, time-ordered, range-scan a conversation; delete-after-delivery ⇒ use TTL/retention, not ad-hoc deletes (tombstones — see 2.7) |
| Conversation | `convId → {members[], type, lastSeq}` | Cassandra / SQL | Small metadata; members list for fan-out |
| Delivery offset | `(userId, convId) → lastDeliveredSeq` | Cassandra / KV | Per-user cursor; powers offline sync |
| Offline inbox | `userId → [undelivered refs]` | Cassandra / Redis | Store-and-forward queue for offline users |
| Connection reg. | `userId → {deviceId: gatewayId}` (TTL) | Redis | Hot, ephemeral, heartbeat-refreshed routing table |
| Presence | `userId → {online, lastSeen}` | Redis | Hot, ephemeral; gossip/TTL expiry |
| Media | `mediaId(=content hash) → bytes` | S3 + CDN | Big blobs never travel the message path; identical media is deduped by content hash — store once, reference by hash (deep-dive: Case Study 11, File Sync) |

**Shard key = `convId`** for messages: a conversation's whole history lives on one partition,
ordered by `seqId`, so reading or appending is a single-partition op. (Theory: *wide-column
modeling, partition keys* — Ch 24.)

## 2.6 HLD — scaling & bottlenecks

- **Connection tier:** scale by adding gateway boxes; place users by **consistent hashing**
  of `userId` (Ch 24) so reconnects tend to land predictably and the registry stays warm.
- **Routing fan-in:** the registry (Redis) is hot — replicate it and cache lookups on the
  gateway; a miss just means "treat as offline → push," which is safe.
- **Thundering reconnect:** when a gateway dies, its ~500 k clients reconnect at once. Defend
  with **jittered backoff** on the client and connection **admission control** on gateways,
  or you get a reconnect storm that topples the next box (a cascading failure).
- **Hot group / broadcast channel:** a 100 k-member Slack channel must **not** fan-out-on-write
  on the hot path (see 2.8). Use a shared log + per-member cursor; do heavy work in Layer 4.
- **Hot conversation partition:** an extremely active group can hot-spot one Cassandra
  partition — bucket by `(convId, day)` to spread writes over time.
- **Presence at scale:** don't broadcast every friend's online/offline to everyone — it's
  O(friends²) chatter. Push presence lazily (on chat open) and expire via TTL heartbeats.

## 2.7 HLD — failure modes & trade-offs

```
  What dies                     →  What the user sees / what we do
  ───────────────────────────────────────────────────────────────────
  A gateway box crashes          →  its clients' sockets drop; clients
                                    reconnect (jittered) to another box;
                                    registry entries expire by TTL; in-flight
                                    msgs were persisted, so nothing is lost
  Connection registry (Redis)    →  lookups fail → treat recipient as offline
   slow/unavailable                 → store + push; correctness preserved,
                                    "instant" feel degrades to push latency
  Cassandra node down            →  quorum writes (W) still succeed; read
                                    repair heals; conversation stays available
  Network partition              →  choose AVAILABILITY: keep accepting and
                                    delivering; per-conversation order intact,
                                    cross-conversation order was never promised
  Recipient offline indefinitely →  inbox holds messages (TTL/retention);
                                    push wakes the app; sync on reconnect
```

**Trade-offs called out:** we pick **AP** (availability + partition tolerance) with
**per-conversation ordering**, *not* global ordering — global order across billions of
conversations would need a global sequencer (a bottleneck) and users never perceive it. We
accept **at-least-once + client dedupe** (a message may be delivered twice on a flaky
network; `clientMsgId` makes that invisible) instead of costly exactly-once.

**Tombstone trap (Cassandra).** WhatsApp-style systems *delete* a message once it's been
delivered to every device — a **delete-heavy** workload, which Cassandra handles poorly. Each
delete writes a **tombstone** that lingers until compaction, so reads of a conversation must
scan *and skip* tombstones (**read amplification**) while **compaction pressure** climbs. Don't
issue ad-hoc per-message deletes; give delivered-then-deleted messages a **short TTL** (let
Cassandra expire them in a batch) or park them in a **delete-friendly store** (a queue/KV where
deletes are cheap), keeping the long-lived conversation log tombstone-light.

## 2.8 LLD (the crux) — connection registry + routing, and the ordering/receipt machine

Chat has **two** cruxes; both are where candidates hand-wave, so go deep on both.

### Crux A — the connection registry and message routing

The whole problem: A's message arrives at Gateway-A, but B's socket is on Gateway-B
*somewhere in a fleet of 500 boxes.* How does Gateway-A find it? A **connection registry**:
a fast, ephemeral directory mapping each online `(userId, deviceId)` to the gateway holding
its socket, refreshed by heartbeat so dead entries expire.

```
  // On connect — the gateway that owns the socket records itself:
  onConnect(userId, deviceId, conn):
      REGISTRY.HSET("conn:"+userId, deviceId, myGatewayId)
      REGISTRY.EXPIRE("conn:"+userId, 30)        // heartbeat-refreshed TTL
      localSockets[(userId, deviceId)] = conn

  // Routing a message to recipient B (all of B's devices):
  route(msg, toUser):
      gws = REGISTRY.HGETALL("conn:"+toUser)      // device → gatewayId
      if gws is empty:                            // B is offline
          inbox.append(toUser, msg)               // store-and-forward
          push.enqueue(toUser, msg)               // wake the app (→ CS1)
          return
      for (device, gwId) in gws:
          PUBSUB.publish("gw:"+gwId, {toUser, device, msg})
      // each gateway subscribes to its own "gw:<id>" channel, finds the
      // local socket for (toUser, device), and writes the WS frame.
```

The key ideas: **the gateway that holds a socket is the one that writes to it** — no other
box can — so routing is *find the gateway, then publish to its channel.* The registry is
**ephemeral** (Redis with TTL); a stale or missing entry is *safe* because the fallback is
"treat as offline → store + push," which never loses a message. Internal delivery uses
**pub/sub per gateway** (one channel per box) so a publish reaches exactly the box that needs
it. (Theory: *pub/sub, consistent hashing* — Ch 24; *WebSockets* — Ch 23.)

**The online→offline race.** The registry can report "B is online on Gateway-B" at lookup
time, yet B's socket may drop *during* routing — the published frame lands on a gateway whose
socket just died, so that one message is silently missed. We don't try to make routing atomic;
the reconciliation **already exists**: the message was persisted to the conversation log before
routing (Flow 1 step 3), B's `lastDelivered` offset still points before it, so on reconnect B's
**SYNC/poll** streams everything past that offset (Flow 2). The race is therefore **safe** — at
worst the message arrives a beat later via sync instead of live.

### Crux B — per-conversation ordering + the delivery/read-receipt state machine

Messages must appear **in order within a conversation** and show the right ✓ state. We give
each conversation a **monotonic `seqId`** assigned by the chat service at persist time (one
writer per conversation partition makes this trivial — no global clock needed). The client's
`clientMsgId` provides idempotency so retries don't duplicate or reorder.

```
   MESSAGE DELIVERY STATE MACHINE  (per recipient, per message)

       ┌─────────┐   persist+seqId   ┌────────┐
       │ (start) │──────────────────▶│  SENT  │  ✓   (durable on server)
       └─────────┘                   └───┬────┘
                                         │ recipient device ACKs receipt
                                         ▼
                                   ┌───────────┐
                                   │ DELIVERED │  ✓✓  (on device)
                                   └────┬──────┘
                                        │ recipient opens the conversation
                                        ▼
                                    ┌────────┐
                                    │  READ  │  ✓✓ blue
                                    └────────┘
   Side path:  SENT ──send fails / TTL──▶ FAILED ──retry / push──▶ …
   Idempotency: clientMsgId dedupes retries; state only moves forward.
```

The state machine is **monotonic** — it only advances (SENT → DELIVERED → READ), never
regresses, even if a duplicate receipt arrives late. The **offline offset** makes sync cheap:
each `(userId, convId)` stores a `lastDeliveredSeq`; on reconnect the client says "I have up
to 40," the server streams 41..head, and on ack advances the cursor and fires DELIVERED
receipts. That single integer replaces re-scanning entire histories.

**Group fan-out — the model choice that decides whether large groups work:**

```
   (A) FAN-OUT ON WRITE  (push a copy into each member's inbox)
       sender ▶ write msg into inbox of all N members
       + read = O(1) per member        − write = O(N): fatal at N=100k
       use for SMALL groups / mostly-offline members

   (B) SHARED LOG + PER-MEMBER CURSOR  (fan-out on read)
       sender ▶ append ONCE to the conversation log (convId, seqId)
       each member keeps a cursor (lastReadSeq) into that one log
       + write = O(1)                  − read merges across conversations
       WINS for LARGE groups (a 100k-member Slack channel)
```

For 1:1 and small groups, **fan-out on write** is fine (cheap reads). For large groups you
**must** use the **shared log + cursor** model, or a single message to a 100 k-member channel
triggers 100 k writes synchronously. Real systems use a **hybrid**: shared log for big rooms,
push for small ones — exactly like the feed fan-out trade-off in the Instagram example (Ch 25).

**E2E encryption (conceptual).** With the **Signal protocol** (double-ratchet), the client
encrypts the body so the server **routes ciphertext it cannot read**. Receipts and ordering
still work (they're on metadata/seqId, not content). The costs: **server-side search/history
must move to the device**, and **multi-device** needs key-sharing ("sender keys") so each of
your devices can decrypt. Mention it as a requirement-dependent layer, not the default.

## 2.9 Follow-ups, red flags & building blocks

**Likely follow-ups (with crisp answers):**
- *"Multi-device?"* — treat each device as a separate recipient with its own delivery offset;
  a message is "read" only when the user reads it on *some* device; sync the rest.
- *"Typing indicators / presence?"* — ephemeral signals routed like messages but **never
  persisted**; expire via TTL.
- *"Exactly-once?"* — at-least-once transport + `clientMsgId` dedupe = exactly-once *as the
  user perceives it.*
- *"How is history searched with E2E?"* — on-device index; the server can't read content.
- *"Ordering across a user's devices?"* — per-conversation `seqId` is the single source of
  truth; every device renders by `seqId`, so they agree.

**Red flags that sink candidates:** using HTTP polling for the live path; **no connection
registry** (then you literally cannot route a message to the right box); putting messages in
SQL; promising **global** message ordering (unnecessary and a scaling bottleneck);
fan-out-on-write to a 100 k-member group on the hot path; forgetting offline users entirely
(no inbox, no push); acking before persisting (a crash then "loses" a sent message).

**Building blocks reused (theory lives elsewhere):** WebSockets & long-poll — **Ch 23**;
pub/sub, Kafka, consistent hashing, wide-column (Cassandra) modeling, CAP/AP choice —
**Ch 24**; Redis for the registry/presence — **Ch 23**; push-on-disconnect reuses the
**Notification System (Case Study 1)**.

---

# CASE STUDY 3 — VIDEO CONFERENCING (Zoom / Google Meet)

> **Google priority:** ★★★ · **Difficulty:** Hard · **Frequency:** Common · **Time budget:** ~40 min
>
> **At a glance**
> - **The hard part —** real-time audio/video for N people; it is **not** request/response — media flows over UDP with a sub-200 ms latency budget.
> - **Key building blocks —** WebRTC, a **signaling plane separate from the media plane**, STUN/TURN for NAT, SFU media servers, simulcast, a jitter buffer.
> - **The crux (LLD) —** the **SFU** selective-forwarding model (mesh vs MCU vs SFU stream math).
> - **Scale anchor —** mesh uplink `(N-1)·B` dies past ~4 people; an SFU keeps each user's uplink flat in N.

This is the case study candidates most often get *wrong*, because they reach for the
request/response toolbox — REST, a load balancer, a SQL database — and none of it applies.
A video call is **continuous real-time media**: dozens of streams of audio and video flowing
between people at once, where being **150 milliseconds late is a failure** and a late packet
is worth *less than no packet*. Two obvious designs both collapse: "everyone sends their
video to everyone else" melts home uplinks past ~4 people, and "a server decodes everyone,
mixes one picture, and sends it back" melts the server's CPU. The real answer is a clever
**packet forwarder (an SFU)** plus the crucial insight that **media never touches your normal
API servers** — it rides **UDP** to a dedicated media plane. Get those two ideas and you've
passed; miss them and no amount of boxes will save you.

## 3.0 What's really being tested

- Do you realize it is **NOT request/response** — real-time media over **UDP/RTP**, not TCP/HTTP?
- Do you **separate the signaling plane (control) from the media plane (audio/video)**?
- Do you handle **NAT traversal** (STUN / TURN / ICE) so two home users can connect at all?
- Do you know the **topologies — mesh vs MCU vs SFU** — and *why SFU wins at scale*?
- Do you adapt to bad networks (**simulcast**, **jitter buffer**, packet loss, bandwidth estimation)?
- Can you scale a **1 → 10,000 webinar** differently from a symmetric meeting?

## 3.1 Clarify — requirements

**Functional**
- **N-party** audio + video calls; join by link; mute/unmute; screen share.
- **Active-speaker** view + a grid of the other participants.
- Optional **cloud recording**; an in-call **chat** sidebar (reuse Case Study 2).
- **Webinar mode**: a few presenters, thousands–millions of view-only attendees.

**Out of scope** (say it): PSTN/phone dial-in bridging, live transcription/captions (an ML
service that taps the audio), and the chat sidebar's storage (that's Case Study 2).

**Non-functional**
- **Latency:** mouth-to-ear **< 200 ms** one-way (ITU-T G.114: ≤150 ms is good, ≤400 ms
  tolerable). This rules out TCP for media.
- **Scale:** millions of concurrent meetings; symmetric meetings up to ~100–1,000; webinars
  to 10 k–1 M viewers. Typically only ~25–49 videos rendered at once.
- **Quality:** adapt to each user's bandwidth; tolerate 1–5% packet loss gracefully.
- **Availability:** a media-server failure should let clients re-join, not end the call.

**Questions to ask out loud:** *Max participants? Symmetric meeting or webinar (1→many)?
Recording required? Resolutions (720p/1080p)? E2E encryption? Screen-share quality?*

**Protocol shape — two separate channels:**

```
   SIGNALING (control, reliable — over WebSocket/HTTPS):
     join{roomId, token} · sdpOffer/sdpAnswer · iceCandidate · leave
   MEDIA (the actual A/V, lossy + fast — over UDP):
     RTP / SRTP packet streams (Opus audio, VP8/VP9/AV1/H.264 video)
```

## 3.2 Estimate — back-of-envelope (this one is *bandwidth* math)

The defining resource is **bandwidth**, and the killer is the **uplink**, which at home is
small (~5–10 Mbps) and shared.

```
   Bitrate per stream:  audio (Opus) ~40 kbps ; video 720p ~1.5 Mbps ;
                        1080p ~2.5–3 Mbps ; screen share ~1–2 Mbps
   Take B = 1.5 Mbps (720p) as the unit.

   SYMMETRIC N-person call (everyone sees everyone):
     MESH : uplink/user = (N-1)·B   downlink/user = (N-1)·B  no server
     MCU  : uplink/user = 1·B       downlink/user = 1·B      server mixes
     SFU  : uplink/user = 1·B(×L)   downlink/user = (N-1)·B   server forwards

   N=4, B=1.5:  mesh uplink = 3×1.5 = 4.5 Mbps/user (already heavy)
   N=8, B=1.5:  mesh uplink = 7×1.5 = 10.5 Mbps/user → home link DIES
                SFU  uplink = Σ simulcast layers ≈ 2 Mbps/user (flat in N)

   SFU server egress for one meeting = N·(N-1) streams forwarded:
     N=50 → 50×49 = 2,450 stream-forwards (capped by showing ~25 + thumbs)

   Fleet: 10 M concurrent participants × 1.5 Mbps down ≈ 15 Tbps egress
     → thousands of SFU servers, placed close to users, across regions.
```

The arithmetic *makes the architecture decision for you*: mesh uplink grows with N and kills
the constrained direction (home upload), so it's dead past ~4 people. SFU keeps each user's
**uplink flat in N** — a fixed simulcast stack (~2 Mbps) that does not grow with the meeting,
and that single fact is why SFU is the industry default.

## 3.3 HLD — high-level architecture (two planes)

The non-negotiable idea: **a signaling plane (control) separate from a media plane (the
bytes).** Signaling is low-volume and reliable; media is high-volume, lossy, and latency-
critical — they have nothing in common and must not share infrastructure.

![Video Conferencing (Zoom / Google Meet) — high-level architecture (HLD)](diagrams/video_conf.svg)

**Block by block:** **Signaling Service** is a normal stateless WebSocket service — it
authenticates the join, tracks **room membership** in a Redis **Room Registry**, **allocates
an SFU** for the meeting, and relays the **SDP offer/answer** (each side's codecs and
parameters) plus **ICE candidates** (possible network paths). **STUN** servers let a client
discover its own public IP:port behind NAT; **TURN** servers **relay** media for the ~10–20%
of users behind symmetric NATs that can't connect directly (theory: *UDP, NAT* — Ch 23). The
**SFU (Selective Forwarding Unit)** is the heart of the media plane: clients send their RTP
streams *up* to it over UDP, and it **forwards the right streams down** to each other
participant — *without decoding them*. For geographically split meetings, SFUs **cascade**:
each client hits its nearest SFU and the SFUs relay one copy between regions instead of N.
**Recording** and **transcription** tap the streams in the async plane and never sit on the
live path; finished recordings live in a blob store and play back via CDN.

## 3.4 HLD — critical path walkthrough (join + media setup)

```
  1. Client ─WS▶ Signaling: join{roomId, token}
  2. Signaling: authorize → add to Room Registry → reply with the
     assigned SFU endpoint + ICE servers (STUN + TURN credentials).
  3. Client gathers ICE candidates: host (LAN), srflx (public IP via
     STUN), relay (via TURN). Sends SDP offer (codecs, simulcast layers).
  4. SFU answers (SDP) via signaling; both run ICE connectivity checks
     and pick the best working path — prefer direct UDP, fall back to TURN.
  5. Media flows: client ─UDP RTP/SRTP▶ SFU (audio + video, e.g. 3
     simulcast layers 180p/360p/720p). Encrypted hop-by-hop (SRTP).
  6. SFU forwards each sender's stream to the other participants,
     choosing a simulcast LAYER per receiver (their bandwidth + whether
     they show that sender large or as a thumbnail). Active speaker → hi-res.
  7. Receiver: jitter buffer reorders/de-jitters RTP → decode → render.
     On loss/congestion it asks the SFU to drop to a lower layer.
```

The sequence shows the two planes cooperating: steps **1–4** are *signaling* (reliable
control to set up the call), and steps **5–7** are *media* (UDP packets that never touch the
signaling service). The SFU's per-receiver **layer choice** at step 6 is what makes one
meeting work across a fast laptop and a phone on 3G simultaneously.

## 3.5 HLD — data model & storage choices

Almost everything here is **ephemeral** — a call is a live session, not stored state. The
durable artifacts are recordings and config.

| Entity | Shape | Store | Why |
|--------|-------|-------|-----|
| Room / meeting | `roomId → {participants, sfuId, settings}` | Redis | Hot, ephemeral session state |
| Participant↔SFU | `userId → sfuNode` | Redis | Routing within the media plane |
| ICE/TURN creds | short-lived tokens | Redis (TTL) | Time-boxed relay credentials |
| Recording | composed MP4 / raw tracks | Blob store (S3) + CDN | Large, write-once, played back later |
| Meeting metadata | `meetingId, host, start/end, attendees` | SQL | Billing, history, audit |
| Quality metrics | per-stream loss/jitter/bitrate | Time-series DB | Monitoring, adaptive tuning |

There is **no message store** like chat — losing a video packet is fine (the next frame is
along in milliseconds), so durability is the wrong goal for the media path.

## 3.6 HLD — scaling & bottlenecks

- **SFU is bandwidth-bound, not CPU-bound** (it forwards, doesn't transcode). Cap egress by
  **showing ~25 videos** and forwarding only the **active speaker at full layer**, others at
  thumbnail layers (or audio-only).
- **Big webinars (1 → 100 k+):** an SFU can't forward to 100 k peers. Use an **SFU cascade /
  tree** (relay fan-out through layers of media servers), or for view-only attendees switch to
  **HLS/DASH over a CDN** — a few seconds of latency, but it scales to millions like any video
  stream (theory: *CDN* — Ch 23; see also YouTube streaming in Ch 36).
- **Geo distribution:** assign each participant the **nearest SFU**; cascade SFUs across
  regions so only **one** inter-region stream crosses per source, not N.
- **TURN relay load:** the ~10–20% of users behind symmetric NAT route *all* their media
  through TURN servers — provision a relay pool and bill its bandwidth.
- **Active-speaker detection:** compute it from audio energy so the SFU knows whose stream to
  promote to full resolution.

## 3.7 HLD — failure modes & trade-offs

```
  What dies / degrades          →  What the user sees / what we do
  ───────────────────────────────────────────────────────────────────
  SFU node crashes               →  call freezes briefly; signaling moves
                                    the room to a new SFU; clients re-ICE
                                    and reconnect — meeting survives
  Packet loss (1–5%)             →  conceal with FEC / selective NACK for
                                    key frames; for video just drop (next
                                    frame is ~16 ms away); protect AUDIO first
  Congestion (uplink drops)      →  bandwidth estimator → send a LOWER
                                    simulcast layer; resolution dips, call lives
  TURN pool overloaded           →  NAT'd users can't connect → scale relays;
                                    direct-path users unaffected
  Whole region down              →  re-allocate the meeting to another region;
                                    participants re-join the nearest healthy SFU
```

**Trade-offs called out:** we choose **UDP over TCP** — TCP's reliable, in-order delivery
causes **head-of-line blocking**, where one lost packet stalls everything; for live media a
slightly-glitchy-now beats perfect-but-late, so RTP over UDP with selective recovery wins. We
choose **SFU over MCU** — we give up server-side mixing (and the single tiny downstream it
buys low-end clients) to keep server CPU low, latency minimal, and layouts flexible. We choose
**SFU over mesh** — we pay for media servers to keep each user's uplink flat at one stream.

## 3.8 LLD (the crux) — the SFU forwarding model

The crux is *who sends what to whom.* Draw all three topologies for a concrete **4-person
call** and count the streams — this single comparison is the whole case study.

**MESH — every peer sends directly to every other peer (no server):**

```
        A ◀───────────▶ B          Each node uploads N-1 = 3 copies of its
        │ ╲          ╱ │           own stream and downloads 3.
        │   ╲      ╱   │           Total directed streams = N·(N-1) = 12,
        │     ╲  ╱     │           ALL across the public internet.
        │     ╱  ╲     │           Uplink/user  = (N-1)·B = 4.5 Mbps
        │   ╱      ╲   │           Downlink/user = (N-1)·B = 4.5 Mbps
        D ◀───────────▶ C          No server cost — but uplink explodes
                                    with N. Dead past ~4 participants.
```

**MCU — one server decodes everyone, MIXES one picture, sends it back:**

```
        A ──▶┐                      Server DECODES all N, composites into
        B ──▶┤   ┌───────┐  ──▶ A   ONE video, RE-ENCODES, sends 1 down.
        C ──▶┼──▶│  MCU  │  ──▶ B   Uplink/user = 1·B, downlink/user = 1·B
        D ──▶┘   │ mix + │  ──▶ C   (cheapest for clients!) BUT server does
                 │encode │  ──▶ D   decode+mix+encode per meeting = brutal
                 └───────┘          CPU, adds latency, fixed layout.
```

**SFU — one server FORWARDS selected streams, no decoding:**

```
        A ──▶┐                      Everyone uploads ONE stream (×simulcast
        B ──▶┤   ┌───────┐  ──▶ A   layers) to the SFU. SFU forwards each
        C ──▶┼──▶│  SFU  │  ──▶ B   sender's chosen layer to the others.
        D ──▶┘   │forward│  ──▶ C   Uplink/user = 1·B×L (FLAT in N — win)
                 │ only  │  ──▶ D   Downlink/user = (N-1)·B
                 └───────┘          Server egress = N·(N-1) streams, but
                                    NO decode → cheap CPU, low latency.
```

**The stream-count + bandwidth comparison (the table to draw):**

| Topology | Uplink/user | Downlink/user | Server CPU | Scales to | Latency |
|----------|-------------|---------------|------------|-----------|---------|
| **Mesh** | (N-1)·B | (N-1)·B | none | ~3–4 | lowest |
| **MCU**  | 1·B | 1·B | very high (decode+mix+encode) | medium | +mixing |
| **SFU**  | 1·B (×layers) | (N-1)·B | low (forward only) | 100s–1000s | low |

**Why SFU wins:** the constrained resource at home is **uplink**, and only SFU (and MCU) keep
it **flat at one stream regardless of N** — but MCU pays for that with crippling server CPU
(decode + mix + encode every meeting) and extra latency, while SFU just **forwards packets**.
SFU also keeps **per-stream flexibility**: because it never mixes, each receiver can pick its
own layout and the server can send a different quality to each.

**Simulcast — the trick that makes SFU adaptive without transcoding.** Each sender encodes its
video at **several resolutions at once** (e.g., 180p / 360p / 720p) and sends *all* layers up
to the SFU. The SFU then forwards the **right layer per receiver**: full 720p of the active
speaker to people on fast links, 180p thumbnails to a phone on 3G — *without the server ever
decoding or re-encoding.* This is what lets one meeting serve a fiber laptop and a cellular
phone simultaneously.

```
   SIMULCAST + SELECTIVE FORWARDING
   sender A encodes 3 layers ──▶ SFU ──▶ receiver on fiber  : 720p layer
        (180p / 360p / 720p)        ├──▶ receiver on wifi   : 360p layer
                                    └──▶ receiver on 3G     : 180p layer
   SFU picks the layer from each receiver's bandwidth estimate — no transcode.
```

**Jitter buffer** (on the receiver): incoming RTP packets arrive out of order and unevenly
spaced. The receiver buffers them for a few tens of milliseconds to **reorder and smooth**
(de-jitter) before decoding — trading a tiny, deliberate latency for stutter-free playback.

**A note on encryption:** by default media is **SRTP hop-by-hop** (encrypted client↔SFU), so
the SFU forwards ciphertext but *could* see plaintext. True **end-to-end encryption** (e.g.,
WebRTC *insertable streams*) keeps the SFU blind — it can still forward, but recording and
server-side transcription become much harder, so it's an opt-in mode.

## 3.9 Follow-ups, red flags & building blocks

**Likely follow-ups (with crisp answers):**
- *"10,000-person webinar?"* — presenters via SFU; view-only attendees via **CDN HLS/DASH**
  (scales to millions, costs a few seconds of latency) or an SFU **cascade tree**.
- *"Recording?"* — a server-side compositor subscribes like a participant, composes a layout,
  and writes MP4 to blob storage; or record raw tracks and compose offline.
- *"Screen share?"* — a separate video track: high resolution, low frame-rate, often a higher
  simulcast priority than the camera.
- *"How does it pick quality?"* — receiver-side **bandwidth estimation** (e.g., transport-wide
  congestion control) tells the SFU which simulcast layer to forward.
- *"E2E encryption?"* — insertable streams keep the SFU blind; you lose server recording/captions.

**Red flags that sink candidates:** using **TCP/HTTP** for media; routing media **through the
API/app servers**; proposing **mesh** for large meetings; proposing **MCU** without mentioning
its CPU/latency cost; **forgetting NAT traversal** (no STUN/TURN — then two home users simply
can't connect); not **separating signaling from media**; treating it as request/response.

**Building blocks reused (theory lives elsewhere):** UDP vs TCP, head-of-line blocking, NAT —
**Ch 23**; WebSockets for signaling, load balancing, geo-routing — **Ch 23**; CDN for webinar
broadcast — **Ch 23** (and YouTube streaming, **Ch 36**); pub/sub for signaling relay —
**Ch 24**; blob storage for recordings — **Ch 24**.

---

# CASE STUDY 4 — COLLABORATIVE EDITOR (Google Docs)

> **Google priority:** ★★ · **Difficulty:** Hard · **Frequency:** Common · **Time budget:** ~40 min
>
> **At a glance**
> - **The hard part —** two people editing the *same character at the same instant* must still converge to one identical document.
> - **Key building blocks —** OT or CRDT, a per-document authority node that serializes ops, a revision log, presence/cursors, offline replay.
> - **The crux (LLD) —** **Operational Transformation vs CRDTs**, with a worked concurrent-insert example.
> - **Scale anchor —** shard by `docId` (one authority per live doc); conflicts resolved server-side in well under 100 ms.

Picture three people typing into the *same* document at the same time. Each person's screen
must update instantly as they type (no lag — typing has to feel local), everyone must see
everyone else's changes within a blink, and — the hard part — **all three screens must end up
showing the exact same text**, with nobody's keystrokes lost or scrambled. The villain is
**concurrency**: if I insert a letter at position 5 *while* you delete the character at
position 2, my "position 5" now points at the wrong place. Naively applying both edits gives
three *different* documents. The whole field exists to solve that one problem, and it has two
famous answers — **Operational Transformation (OT)** and **CRDTs** — which is exactly what an
interviewer wants you to compare.

## 4.0 What's really being tested

- Do you understand the **concurrent-edit conflict** — that positions shift under concurrent ops?
- Can you explain **OT vs CRDT**, with a concrete worked example, and pick one with reasons?
- Do you model the document as a **sequence of operations with revision numbers**, not "save
  the whole file"?
- Do you make typing feel **instant** (optimistic local apply) while still **converging**?
- Do you handle **presence/cursors**, **offline edits**, persistence, and history?

## 4.1 Clarify — requirements

**Functional**
- Multiple users **edit one document concurrently**; each sees others' edits in ~100 ms.
- **Optimistic local echo** — your own typing appears instantly, before the server replies.
- **Presence**: live cursors, selections, "who's here."
- **Offline editing** then sync on reconnect; **undo/redo**; **version history**.

**Out of scope** (say it): rich-text layout/pagination internals, the comment threads (treat
as a side feature), and the permissions UI (assume an auth service gates access).

**Non-functional**
- **Latency:** local echo instant; remote changes visible < 100–200 ms.
- **Consistency:** **strong eventual consistency** — every client *must converge* to the same
  document, and edits must preserve user **intent**.
- **Concurrency:** typically a handful of simultaneous editors per doc (design for tens; a
  viral doc with thousands is the stress case).
- **Durability:** never lose an accepted edit.
- **Scale:** hundreds of millions of docs; the interesting limit is **per-document
  concurrency**, not aggregate QPS.

**Questions to ask out loud:** *Max concurrent editors per doc? Plain or rich text? Offline
support required? Undo semantics (per-user or global)? Do we keep full edit history?*

**Op-based API (a doc session is a stream of ops, not REST):**

```
   OPEN   { docId }              → WS session; server sends snapshot + headRev
   OP     { docId, baseRev, op } client→server (op = ins(pos,text)|del(pos,len))
   ACK    { docId, newRev }      server→client (your op committed at newRev)
   APPLY  { docId, rev, op }     server→client (someone else's op, transformed)
   CURSOR { docId, userId, pos } presence; ephemeral, not persisted
```

## 4.2 Estimate — back-of-envelope

```
   Docs (total)             ~10^8–10^9
   Concurrently-edited      ~5 M sessions at peak
   Ops/active editor        ~2 / s (keystrokes debounced/batched ~100 ms)
   ── peak op rate          5 M × 2 = 10^7 ops/s aggregate (tiny ops ~50 B)
   Op bytes/day (rough)     bursty; batch keystrokes to cut chatter ~5–10×
   Per-doc op rate          the real limit: one doc = one serialization
                            point (OT). 10 editors × 2/s = 20 ops/s/doc — fine;
                            a 5,000-editor "viral doc" = the hot-doc stress case
   Storage/doc              snapshot (~50 KB typical) + op log since snapshot;
                            compact to a new snapshot every N ops
   Doc snapshots            10^8 docs × 50 KB ≈ 5 TB (modest; logs compacted)
```

The number that matters is **per-document**, not global: each doc has a single ordering
authority, so a doc's own edit rate is the bottleneck. 20 ops/s is trivial; the interesting
design question is the rare doc with thousands of concurrent editors.

## 4.3 HLD — high-level architecture

The defining structure: **each document is owned by a single authority node** that serializes
ops, assigns revision numbers, transforms concurrent ops, and broadcasts the results. Shard
by `docId` so a document's whole live session lives on one box.

![Collaborative Editor (Google Docs) — high-level architecture (HLD)](diagrams/collab_editor.svg)

**Block by block:** the **Collab Gateway** holds each editor's WebSocket and **routes by
`docId`** (consistent hashing — Ch 24) to that document's owner, so everyone editing one doc
lands on the same authority. The **Document Session Owner** is the brain: it keeps the
authoritative document and `headRevision` **in memory**, **serializes** incoming ops into a
single order (the single-writer property is what makes OT tractable), **transforms** each op
against any ops the sender hadn't seen yet, assigns the next revision, **broadcasts** to all
editors, and **appends** the op to a durable log. **Layer 3** persists an **append-only op
log** keyed by `(docId, rev)`, periodic **snapshots** so you don't replay millions of ops to
load a doc, and **presence/cursors in Redis** (ephemeral, TTL'd). **Layer 4** compacts the log
into snapshots, exports, indexes for search, and fires notifications (Case Study 1).

## 4.4 HLD — critical path walkthrough (a concurrent edit)

```
  1. A and B both have the doc at revision 7, content "abc".
  2. A inserts 'X' at pos 0  → A optimistically shows "Xabc" instantly,
     sends OP{ baseRev:7, ins(0,'X') }.
  3. B concurrently inserts 'Y' at pos 2 → B shows "abYc", sends
     OP{ baseRev:7, ins(2,'Y') }.
  4. Owner receives A's op first (baseRev 7 == head): apply → rev 8;
     broadcast A's op to B.
  5. Owner receives B's op (baseRev 7, but head is now 8): it missed op A,
     so TRANSFORM B's op against A → ins(2,'Y') becomes ins(3,'Y')
     (A inserted before pos 2, so shift right by 1); apply → rev 9;
     broadcast the transformed op to A.
  6. A applies ins(3,'Y') → "Xabc" → "XabYc".
     B applies A's op ins(0,'X') (no shift; 0 < 2) → "abYc" → "XabYc".
  7. All clients now show "XabYc" at rev 9. Converged. ✓
```

The magic is at step **5**: the server doesn't blindly apply B's op — it **rewrites** it to
account for the edit B hadn't seen, so positions stay correct. Step **2/3** show **optimistic
local apply** (typing feels instant); the server's broadcast later reconciles everyone.

## 4.5 HLD — data model & storage choices

| Entity | Shape | Store | Why |
|--------|-------|-------|-----|
| Op log | `(docId, rev) → {op, userId, ts}` | Bigtable / Spanner | Append-only, ordered by rev, range-scan to replay |
| Snapshot | `(docId, rev) → full content` | Blob / DB | Avoid replaying millions of ops to load a doc |
| Doc metadata | `docId → {owner, acl, headRev}` | SQL / Spanner | Permissions, the authoritative head revision |
| Presence/cursors | `docId → {userId: cursorPos}` | Redis (TTL) | High-frequency, ephemeral, never persisted |
| Comments | `(docId, anchor) → thread` | Wide-column | Anchored to a range; side feature |

Loading a doc = **latest snapshot + replay the op-log tail** since that snapshot. Compaction
periodically writes a fresh snapshot and truncates the log.

## 4.6 HLD — scaling & bottlenecks

- **Shard by `docId`;** one **owner per active doc** serializes its ops. Most docs are idle —
  load the owner lazily on first edit, evict after inactivity.
- **The hot doc** (thousands editing one document — a viral form, a live class) is the real
  bottleneck because a single owner serializes everything. Mitigations: **cap concurrent
  editors**, throttle, or switch that doc to a **CRDT** model (no central serialization).
- **Op-log growth:** compact to snapshots; a 100 k-char doc shouldn't replay 1 M ops to open.
- **Presence/cursor spam:** cursor moves are far more frequent than edits — **debounce** and
  send at a capped rate; keep them out of the durable op log.
- **Fan-out within a doc:** broadcasting one op to N editors is O(N), but N is small per doc,
  so this is cheap — unlike chat's group fan-out.

## 4.7 HLD — failure modes & trade-offs

```
  What dies / degrades          →  What the user sees / what we do
  ───────────────────────────────────────────────────────────────────
  Document owner node crashes    →  reload doc on a new node from snapshot +
                                    op-log tail; clients reconnect and resync
                                    from their last acked revision — no loss
  Client goes offline            →  buffer ops locally (optimistic); on
                                    reconnect, transform the buffer against ops
                                    it missed, then replay. (OT chains get long;
                                    CRDT merges offline edits naturally)
  Op arrives on a stale baseRev  →  server transforms it forward to head
                                    before applying — that IS the mechanism
  Conflicting concurrent edits   →  OT transform / CRDT merge guarantees
                                    convergence; intent kept, nothing dropped
```

**Trade-offs called out:** we choose **strong eventual consistency** (everyone converges,
maybe a few ms apart) over strong synchronous consistency (which would force a lock and kill
the instant-typing feel). **OT** keeps per-character metadata tiny and matches a central
server, but its transform functions are notoriously tricky and offline produces long transform
chains. **CRDTs** need no central authority and merge offline edits trivially, but carry more
metadata per element (IDs, tombstones). Google Docs uses **OT**; many newer P2P/offline-first
apps use **CRDTs**.

## 4.8 LLD (the crux) — Operational Transformation vs CRDTs

Both solve the same puzzle — *make concurrent edits converge* — by opposite philosophies. Know
both; comparing them *is* the senior signal here.

### Operational Transformation (OT) — "rewrite later ops to fix positions"

A document is a **sequence of operations** (`ins(pos,text)`, `del(pos,len)`) over revisions. A
central server defines the single canonical order. When an op arrives based on an old
revision, the server **transforms** it against the ops it missed so its positions are correct.
The whole idea lives in one function, `T(op, against)`:

```
  // Transform incoming op so it applies cleanly AFTER `against` applied.
  // Insert-vs-insert (the core case):
  T(ins(p1, s1),  against = ins(p2, s2)):
      if p2 <= p1:  return ins(p1 + len(s2), s1)   // earlier ins ⇒ shift
      else:         return ins(p1, s1)             // later insert ⇒ same
  // (Real OT also defines ins-vs-del, del-vs-ins, del-vs-del, with a
  //  tie-break rule when p1 == p2 so both sides converge identically.)
```

Worked example — base `"abc"` at rev 7, two concurrent inserts:

```
            base = "abc"   (rev 7)
   User A (from rev7)                    User B (from rev7)
     ins(0,'X') → local "Xabc"             ins(2,'Y') → local "abYc"
        │  send a = ins(0,'X')                │  send b = ins(2,'Y')
        ▼                                     ▼
        ┌──────────── SERVER (the authority) ──────────────┐
        │ head = 7                                         │
        │ recv a (base7 == head): apply → head=8; bcast a  │
        │ recv b (base7, head=8 ⇒ missed a): TRANSFORM     │
        │   b' = T(b, a): a.pos 0 ≤ b.pos 2 ⇒ shift +1     │
        │      = ins(3,'Y'); apply → head=9; bcast b'      │
        └──────────────────────────────────────────────────┘
        ▼                                     ▼
   apply b' = ins(3,'Y')                 apply a = ins(0,'X')
   "Xabc" → "XabYc"                      T(a,b): 0 < 2 ⇒ unchanged
                                         "abYc" → "XabYc"
              both converge → "XabYc"  ✓
```

The intuition: A inserted *before* B's position, so when B's op is finally applied everywhere
its position must move **right by one**. The transform function encodes that "fix." Because the
server applies ops in one order and transforms everything into that frame, every client lands
on the identical string.

### CRDTs — "give every character a stable identity so positions never move"

A **Conflict-free Replicated Data Type** sidesteps transforms entirely. Each character gets a
**globally-unique, immutable, totally-ordered ID** (e.g., a fractional position, or a dense
order with a `siteId` tie-break). Insert means "place a char with an ID *between* two existing
IDs"; delete means "tombstone an ID." The document is just **all live characters sorted by
ID** — and because IDs never change, concurrent ops **commute**: apply them in any order, on
any replica, and you get the same result. No central authority, no transform.

```
   Each char has a STABLE ordered ID (never changes):
     a:1.0   b:2.0   c:3.0                      base "abc"
   A inserts 'X' before 'a'   → id 0.5   (between start and a)
   B inserts 'Y' between b,c   → id 2.5   (between b and c)
   Every replica ends up holding:
     X:0.5   a:1.0   b:2.0   Y:2.5   c:3.0
   READ = sort by id → "X a b Y c" = "XabYc"   (no transform, no server!)
   Two inserts at the SAME spot → deterministic tie-break by siteId.
   Delete 'b' → mark TOMBSTONE (keep id 2.0 hidden) so concurrent
   ops referencing it still resolve consistently.
```

Same inputs, same `"XabYc"`, reached with **zero transforms** — the IDs did the work. The cost
is **metadata**: every character carries an ID, deletes leave tombstones, and the structure can
bloat (real CRDTs like RGA/Logoot/Yjs add garbage collection).

### OT vs CRDT — the comparison to recite

| | **OT** | **CRDT** |
|--|--------|----------|
| Core idea | transform ops against missed ops | stable per-element IDs that commute |
| Needs central server | **yes** (defines the order) | **no** (merges peer-to-peer) |
| Metadata per char | tiny | larger (IDs + tombstones) |
| Offline / P2P | hard (long transform chains) | natural |
| Implementation | tricky transform functions | trickier data structure, simpler merge |
| Used by | **Google Docs**, Etherpad | Figma, Yjs/Automerge, many offline-first apps |

**The one-liner:** *OT moves the operations to fit the document; CRDTs give the document a
shape where operations never need to move.* Pick OT for a server-authoritative product like
Docs; pick CRDT when you need offline-first or peer-to-peer with no central authority.

## 4.9 Follow-ups, red flags & building blocks

**Likely follow-ups (with crisp answers):**
- *"Undo/redo?"* — per-user undo = invert your op and transform it against everything since;
  it's *not* "go back a global revision," or you'd undo other people's work.
- *"Offline for an hour, then reconnect?"* — buffer ops locally; on reconnect transform the
  buffer forward against missed ops (OT) or just merge (CRDT). CRDT is why offline-first apps
  prefer it.
- *"How do cursors stay correct?"* — transform cursor positions through the same op stream so
  a remote insert shifts your cursor consistently.
- *"Rich text (bold, etc.)?"* — model formatting as ops too (e.g., `applyStyle(range,attr)`),
  transformed like inserts/deletes.
- *"How do we not store a million ops forever?"* — periodic **snapshots** + log compaction.

**Red flags that sink candidates:** "just lock the document" (kills concurrency and the
instant-typing feel); "last write wins on the whole doc" (silently destroys edits);
last-write-wins per *position* (positions move — that's the entire bug); not knowing **OT or
CRDT** by name; ignoring **optimistic local apply** (typing would feel laggy); forgetting
snapshots (replaying 1 M ops to open a doc).

**Building blocks reused (theory lives elsewhere):** WebSockets for the live session —
**Ch 23**; consistent hashing to route a doc to its owner, single-writer serialization,
strong-eventual-consistency / CRDT theory — **Ch 24**; append-only logs & wide-column stores
(Bigtable/Spanner) — **Ch 24**; Redis for presence — **Ch 23**; edit notifications reuse the
**Notification System (Case Study 1)**.

---

## Key Takeaways

- **Run the same loop every time (Part A).** Clarify → Estimate → API → Data → HLD →
  Deep-dive → Bottlenecks → Trade-offs. The method, not memorized architectures, is what
  passes the interview — and **always reach trade-offs**.
- **Estimate to *decide*, not to decorate.** A number is only useful if it forces a choice:
  "600 k writes/s and 1.46 PB/yr ⇒ wide-column, not SQL"; "mesh uplink (N-1)·B ⇒ dead past 4 ⇒
  SFU." Show the arithmetic.
- **The 4-layer skeleton (edge → services → data → async) fits almost everything.** Keep the
  synchronous path in Layers 1–3 and push anything that can be late to Layer 4 (queues,
  workers, fan-out).
- **Real-time breaks request/response — say so.** Persistent connections need a **connection
  registry** to route (chat); media needs a **separate UDP media plane** and an **SFU**
  (video); collaborative state needs an **op stream with convergence** (docs). None of these
  is "client → LB → service → DB."
- **Notifications:** decouple with a queue; **at-least-once + idempotent dedupe**; per-channel
  bulkheads; separate transactional from marketing lanes.
- **Chat:** WebSockets + a **connection registry**; **per-conversation** ordering (not global);
  the **sent → delivered → read** state machine; a **last-delivered offset** for offline sync;
  shared-log fan-out for big groups.
- **Video:** **signaling ≠ media**; **UDP/RTP** (TCP head-of-line blocking is fatal);
  **STUN/TURN** for NAT; **SFU beats MCU and mesh** because it keeps uplink flat at one stream
  with no server transcode; **simulcast** + jitter buffer adapt to bad networks.
- **Docs:** model edits as an **op stream with revisions**; **optimistic local apply** for
  instant typing; converge with **OT** (transform ops; central server — what Google Docs uses)
  or **CRDTs** (stable IDs that commute; great offline/P2P).
- **Every design names its failure modes and its CAP/PACELC choice.** Chat picks **AP** with
  per-conversation order; video drops packets to protect latency; docs pick **strong eventual
  consistency** to keep typing instant. Naming the sacrifice is the senior signal.
- **These are assemblies, not new theory.** The primitives — WebSockets, CDN, and rate limiting
  (**Ch 23**); Kafka, consistent hashing, wide-column stores, CAP (**Ch 24**); webhooks and
  the Instagram worked example (**Ch 25**) — all live elsewhere. Master the playbook in **Part
  A** and reuse it on every "Design X" question (continued in **Ch 36** and **Ch 37**).

