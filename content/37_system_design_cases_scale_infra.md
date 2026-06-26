# Chapter 37 — System Design Case Studies — Part 3: Scale, Infra, Money & AI

> "Make it correct, make it fast, make it cheap — at a billion requests a
> second, in that order." — the infrastructure engineer's creed

This is the third and final part of the worked **"Design X"** case-study series
(Ch 35 — Real-Time & Communication; Ch 36 — Search, Geo, Feeds & Media). Where
the first two parts built **products users see**, this part builds the
**infrastructure those products stand on**: the rate limiter at the gateway,
the ID generator every row quietly depends on, the distributed cache, the job
scheduler, the **ledger that moves real money**, the key-value store under
everything — and then the **AI-serving designs** a Google AI Engineer is now
expected to whiteboard (LLM inference, RAG, recommendations).

These are the "infra" questions: smaller surface area than a full product, but
**deeper on one hard idea each**. The interviewer is probing whether you can go
to the data-structure and concurrency level — atomic counters, bit layouts,
quorum overlaps, idempotent ledgers — not just draw boxes. So every case study
here still gives full HLD, but the **LLD crux carries more weight** than in
Parts 1–2.

> **Note:** These case studies use the universal **"Design X" playbook from
> Ch 35 Part A** (Clarify → Estimate → API → Data → HLD → Deep-dive →
> Bottlenecks → Trade-offs). We won't repeat it; we apply it.

## What you'll learn

- How to design a **distributed rate limiter** that stays accurate across N
  gateway nodes — and why the token-bucket Lua script is the whole game.
- The **Snowflake 64-bit ID** layout bit-by-bit, plus clock-skew and
  sequence-rollover handling.
- Streaming **heavy-hitters** with a Count-Min Sketch + heap; **leaderboards**
  on Redis sorted sets; a **distributed cache** built on a consistent-hash ring.
- A durable **job scheduler** with lease/visibility-timeout dispatch and a
  delayed-job timing structure.
- A **payment system / ledger** done with the rigor money demands — idempotency,
  double-entry, saga, and "correctness over availability."
- **Flash-sale inventory** without overselling; a **Dynamo-style KV store** with
  tunable quorums; **Pastebin** as a 40-line variant of the URL shortener.
- The **AI bridge**: LLM inference serving (KV-cache, continuous batching,
  streaming), RAG / semantic search, and a recommendation feed — each pointing
  back to the ML chapters (Ch 26, Ch 28).
- A **cross-cutting pattern library** (Part G) and a **night-before cheat
  sheet** (Part H) that span all of Ch 35/36/37.

## Table of Contents

- **CASE STUDY 13** — Distributed Rate Limiter (FULL)
- **CASE STUDY 14** — Distributed Unique ID Generator / Snowflake (FULL)
- **CASE STUDY 15** — Top-K / Trending / Heavy Hitters (condensed)
- **CASE STUDY 16** — Leaderboard / Ranking (condensed)
- **CASE STUDY 17** — Distributed Cache, "design Redis" (condensed)
- **CASE STUDY 18** — Distributed Job Scheduler / Task Queue (condensed)
- **CASE STUDY 19** — Payment System / Digital Wallet (FULL — money needs rigor)
- **CASE STUDY 20** — E-commerce Inventory / Flash Sale (condensed)
- **CASE STUDY 21** — Distributed Key-Value Store, Dynamo-style (condensed)
- **CASE STUDY 22** — Pastebin (condensed, short)
- **CASE STUDY 23** — E-commerce Platform / Amazon · Flipkart (FULL — capstone)
- **PART F** — AI-Flavored Designs (LLM serving · RAG · Recommendation feed)
- **PART G** — The Cross-Cutting Pattern Library (the synthesis matrix)
- **PART H** — Rapid-Revision Cheat Sheet (one row per design)
- **Key Takeaways**

---

# CASE STUDY 13 — DISTRIBUTED RATE LIMITER

> **Google priority:** ★★★ · **Difficulty:** Hard · **Frequency:** Very common · **Time budget:** ~40 min

> **User story —** *As a* platform team, *I want* to cap how often each client can call our APIs,
> *so that* one buggy or abusive caller can't exhaust capacity for everyone else.
>
> **For example —** a client allowed 100 requests/minute gets a `429 Too Many Requests` with
> `Retry-After` on the 101st — enforced consistently even though their traffic is spread across
> hundreds of gateway nodes.
>
> **Why it matters —** on one box a limiter is one counter; across a fleet it's a distributed-
> counter race — an atomic token-bucket in Redis keeps global accuracy at per-request speed.

Imagine the **bouncer standing at the door of every API** at a large company.
Its job sounds trivial — "let each client in at most 100 times a minute" — and
on a single server it *is* trivial: one counter. The hard part is that there
is no single server. Your API is fronted by **hundreds of gateway nodes across
many data centers**, and a client's 100 requests can land on 100 different
nodes. Now "have they used up their 100?" is a **distributed-counter problem**:
every node must agree, in under a millisecond, on a number that's changing a
million times a second. That tension — *global accuracy vs. per-request
latency* — is the whole interview.

## 13.0 What's really being tested

- Do you know the **counting algorithms** (token bucket, leaky bucket, fixed /
  sliding window) and their failure modes (the fixed-window **edge-doubling**
  bug)?
- Can you make the check **atomic** so two concurrent requests can't both spend
  the last token (the classic read-modify-write race)?
- Can you reason about **distributed counters**: one central store (accurate,
  adds latency) vs. local buckets that sync (fast, approximate)?
- Do you put the limiter in the **right place** (the gateway/edge, inline,
  before backends) and degrade safely (**fail-open vs fail-closed**)?
- Do you handle **hot keys** (one whale tenant), **policy lookup**, and the
  right client contract (**429 + `Retry-After`**)?

## 13.1 Clarify — requirements

**Functional**
- Enforce limits like *"N requests per window per KEY"* where **KEY** can be
  API key, user id, client IP, or `(user, endpoint)` — configurable per route.
- Support **multiple policies/tiers** (free 10 rps, paid 1000 rps) and burst
  allowances.
- On limit exceeded, return **HTTP 429 Too Many Requests** with `Retry-After`
  and `RateLimit-*` headers so good clients self-pace.
- Limits should be **near-real-time** — a change to a policy applies in seconds.

**Out of scope** (say it to show focus): DDoS scrubbing / WAF (a separate edge
layer — Ch 25), per-request billing/metering, auth itself (the gateway already
authenticates; we just consume the resolved identity).

**Non-functional**
- **Latency:** the limiter is **inline on every request** → it must add
  **< 1 ms p99**. This single number drives the whole design.
- **Accuracy vs availability:** a *little* over-admitting is usually fine
  (allow 105 instead of 100); **silently blocking legitimate traffic is not**.
- **Scale:** front a fleet doing **~1 M requests/sec** peak globally.
- **Availability:** the limiter must **never take down the API** — if its state
  store is unreachable, decide a default (fail-open for most traffic).

**Questions to ask out loud:** *What's the KEY granularity? Is approximate
counting acceptable, or must it be exact? Single-region or global limits?
What's the burst policy? Should denied requests be queued (leaky bucket) or
rejected (token bucket)?*

## 13.2 Estimate — back-of-envelope

```
   Peak request rate        1,000,000 /s     [the fleet's traffic]
   Limiter checks           1 per request → 1,000,000 checks/s
   Active KEYs              ~10,000,000      (users + API keys in a window)
   State per KEY (bucket)   key + tokens(8B) + ts(8B) + overhead ≈ 100 B
   ── total state           10M × 100 B ≈ 1 GB      → fits in RAM, easily
   Redis op budget          ~100k ops/s per node → 1M/s ⇒ ~10–20 shards
   Added latency target     < 1 ms p99 (it's on the hot path of EVERY call)
```
The numbers teach two things: (1) the **state is tiny** (1 GB) — this is a
*latency* and *contention* problem, not a storage problem; (2) at 1 M ops/s you
**cannot** hit one Redis node — you must **shard the counters by KEY** (a
consistent-hash cluster — Ch 24).

## Whiteboard rehearsal — how you'd actually draw this live

In the room you don't reproduce the polished diagram in §13.3 below — you sketch rough
boxes and talk. So **rehearse from this first**: here is the same architecture as a **live
whiteboard sketch**, in the shorthand you'd actually use on a Google whiteboard. The colour
code is the one most candidates settle into:

> **green = client · grey = edge/LB · blue = service · red = datastore · orange = queue / stream · violet = 3rd-party**

![Distributed Rate Limiter — whiteboard rehearsal sketch](diagrams/rate_limiter_whiteboard.svg)

**Why rehearse from the sketch, not the clean diagram?** The polished SVG in §13.3 is for
*reading*; this one is for *rehearsing*. Practise reproducing it from memory in ~4 minutes while
narrating every box out loud — that muscle memory is exactly what the interview tests. It is the
*same* components as the clean §13.3 diagram, only drawn in the loose, name-the-tool style
your hand can produce under pressure: every box names a concrete technology, each datastore is
called out in red, queues in orange, third-party vendors in violet. That visual discipline is
the signal an interviewer is looking for.

## 13.3 HLD — high-level architecture

The limiter lives **inside the API gateway**, as middleware that runs *before*
any request is routed to a backend. State lives in a sharded Redis cluster.

![Distributed Rate Limiter — high-level architecture (HLD)](diagrams/rate_limiter.svg)

**Legend:** boxes are stateless unless they name a store; `──▶` = request flow.
**Block-by-block:**
- **Gateway fleet** — the only place the limiter runs; co-locating it with auth and routing
  means **zero extra network hops** for the common path except the counter lookup.
- **Limiter middleware** — resolves the KEY, fetches the matching **policy** (cached in-process,
  refreshed every few seconds), and asks the counter store one question: *allow?*
- **Redis cluster** — holds the actual token buckets, **sharded by KEY** so the 1 M ops/s
  spreads across nodes and one user's bucket lives on exactly one shard (no cross-node
  coordination per check).

## 13.4 HLD — critical path walkthrough

A single API call, end to end:
```
  1. Client ─▶ GET /v1/search   (Authorization: key_abc)
  2. Gateway authenticates → KEY = "key_abc", policy = 100/min, burst 100
  3. Middleware → Redis shard(hash("key_abc")):
        EVAL token_bucket.lua  KEYS=[rl:key_abc]  ARGV=[now, rate, burst]
        ├─ tokens ≥ 1 → decrement, return 1 (ALLOW)
        └─ tokens < 1 → return 0 (DENY)
  4a. ALLOW → forward to Search service; add headers:
            RateLimit-Limit:100  RateLimit-Remaining:87  RateLimit-Reset:23
  4b. DENY  → return 429 Too Many Requests, Retry-After: 23   (no backend)
```
The defining property is in **step 3**: the read (tokens), the refill, the
compare, and the decrement happen **inside one Redis Lua call** — a single
atomic operation. That is what stops two simultaneous requests from both seeing
"1 token left" and both being allowed. Step 4b is the cheap win: a denied
request **never reaches your backend**, so the limiter is also overload
protection.

## 13.5 HLD — data model & storage choices

| Entity | Shape (key fields) | Store | Why |
|--------|--------------------|-------|-----|
| Token bucket | `rl:{key} → {tokens, last_refill_ts}` | Redis (hash) + Lua | O(1), atomic, auto-expiring; the hot path |
| Policies / tiers | `key/route → {limit, window, burst}` | SQL/KV, **cached in gateway** | Read-mostly; must not add a hop per request |
| Sliding-window log (if exact) | `rl:{key} → sorted set of timestamps` | Redis ZSET (`ZADD`/`ZREMRANGEBYSCORE`) | Exact counting; O(log N), more memory |
| Audit / metrics | `(key, ts) → allowed/denied` | Time-series / Kafka → OLAP | Observability; never on the synchronous path |

The mapping of **algorithm → state** is the senior detail: token bucket needs
just **two numbers** per key; a sliding-window *log* needs a **list of
timestamps** (exact but heavier); a sliding-window *counter* needs **two
window counts** plus a weight. Pick the cheapest structure that meets the
accuracy requirement.

## 13.6 HLD — scaling & bottlenecks

- **Shard counters by KEY** across the Redis cluster (consistent hashing —
  Ch 24) so 1 M ops/s spreads evenly and resharding moves only `1/N` of keys.
- **Hot key (a whale tenant):** one KEY doing 200k rps lands on one shard and
  melts it. Mitigations: (a) **local pre-check** — each gateway keeps a small
  in-process token budget and only touches Redis when it's nearly spent;
  (b) **key splitting** — shard the whale into `key#0..key#9` sub-buckets,
  each with `limit/10`, summed approximately.
- **Latency:** keep Redis in the **same AZ** as the gateway (~0.3 ms RTT). Use
  pipelining/connection pooling. Never cross-region for a per-request check.
- **Policy fan-out:** policies are read-mostly → cache in every gateway,
  invalidate via pub/sub; a policy change propagates in seconds, not per-call.

## 13.7 HLD — failure modes & trade-offs

```
  What dies                  →  What we do
  ─────────────────────────────────────────────────────────────────────
  Redis shard unreachable    →  FAIL-OPEN for normal traffic (allow, log),
                                FAIL-CLOSED for sensitive routes (login, pay)
  Redis slow (p99 spike)     →  per-call timeout ~5 ms → fall back to LOCAL
                                token bucket (approximate) so API stays fast
  Gateway node clock skew    →  refill uses server time; small skew only
                                shifts refill by ms, not correctness
  Whale hot-key              →  local pre-check + key-splitting (§13.6)
  Policy store down          →  serve last cached policy (read-mostly is safe)
```
**The core trade-off — accuracy vs latency/availability:** a **centralized
counter** (Redis + Lua) is accurate to the request but adds a network hop and a
hard dependency; **local buckets that sync** are faster and survive Redis
outages but **over-admit** during the sync gap. The senior answer is **hybrid**:
local first-line defense for the common case, central store for correctness,
fail-open by default and fail-closed only where a few extra requests are
genuinely dangerous (auth, payments). This is a **CP-leaning** component that
*deliberately drops to AP* (approximate) to protect availability.

## 13.8 LLD (the crux) — token-bucket Lua + the distributed-counter problem

This is the component that *is* the problem. Two parts: pick the right
**algorithm**, then make it **atomic and distributed**.

**Part 1 — the five algorithms, compared.** (Theory lives in Ch 23,
*Rate limiting*; here we apply it and add the sliding-window *counter*.)

```
 FIXED WINDOW                      SLIDING WINDOW LOG
 ┌── 10:00 ──┬── 10:01 ──┐         keep a timestamp for EVERY request;
 │ count 100 │ count 100 │         count those within [now-60s, now].
 └───────────┴───────────┘         exact, but O(requests) memory/key.
 BUG: 100 at 10:00:59 + 100 at     "edge-doubling": 2× the limit across
 10:01:00 = 200 in ~1 second.      a boundary is impossible here.

 SLIDING WINDOW COUNTER            TOKEN BUCKET            LEAKY BUCKET
 weighted blend of this + prev     bucket of B tokens;    queue drains at
 window's counts:                  refill r/sec; each     fixed rate r;
   est = cur + prev×overlap%       request spends 1.      requests wait
 ~exact, only 2 counters/key.      allows bursts ≤ B.     in line → smooth.
                                   ALLOWS BURSTS.         NO BURSTS (shapes).
```

| Algorithm | Bursts? | State per key | Accuracy | Use when |
|-----------|---------|---------------|----------|----------|
| Fixed window | Yes (2× at edge) | 1 counter | Poor at edges | Crude, simplest |
| Sliding window **log** | Controlled | List of timestamps | **Exact** | Low-volume, must be exact |
| Sliding window **counter** | Controlled | 2 counters | Near-exact | **The usual web default** |
| **Token bucket** | **Yes, ≤ bucket** | 2 numbers | Good | **API limits; allow bursts** |
| Leaky bucket | No (smooths) | Queue + rate | Shapes traffic | Egress shaping, steady downstream |

**Token bucket** is the default for API limits: it allows a natural short burst
(a flurry of legit calls) while capping the long-run average — no edge-doubling.

**Part 2 — make it atomic (the whole crux).** The check is a
**read-modify-write**: read tokens → refill by elapsed time → compare →
decrement → write. If two requests interleave, both can read "1 left" and both
decrement to 0 → **two allowed when one should be**. The fix is to run the
entire sequence as **one atomic Lua script** on the Redis shard that owns the
key (Redis executes a script with no interleaving):

```lua
-- KEYS[1] = "rl:"..key      ARGV = { now_ms, rate_per_ms, burst }
local b      = redis.call('HMGET', KEYS[1], 'tokens', 'ts')
local tokens = tonumber(b[1]) or tonumber(ARGV[3])   -- start full (=burst)
local ts     = tonumber(b[2]) or tonumber(ARGV[1])
local refill = (tonumber(ARGV[1]) - ts) * tonumber(ARGV[2])
tokens = math.min(tonumber(ARGV[3]), tokens + refill) -- refill, cap at burst
if tokens < 1 then
    return 0                                           -- DENY
end
tokens = tokens - 1
redis.call('HMSET', KEYS[1], 'tokens', tokens, 'ts', ARGV[1])
redis.call('PEXPIRE', KEYS[1], 3600000)               -- idle keys self-clean
return 1                                               -- ALLOW
```
Why Lua: it turns five operations into **one indivisible step**, killing the
race in a single round-trip (also cheaper than `WATCH`/`MULTI` retries). Why
store a **timestamp + token count** instead of ticking a timer: refill is
computed *lazily* from elapsed time on each call — no background job, no per-key
cron.

**Part 3 — the distributed-counter consistency problem.** One Redis shard per
key gives a single source of truth, but at the cost of a network hop and a hard
dependency. The spectrum:

```
   CENTRALIZED (Redis+Lua)         LOCAL + SYNC (gossip/periodic)
   ───────────────────────         ──────────────────────────────
   every node → one shard          each node keeps its OWN bucket of
   exact, atomic                   limit/N; periodically reconciles.
   + accurate to the request       + survives Redis outage, ~0 latency
   - +0.3ms hop, hard dependency   - OVER-ADMITS during the sync gap
   - hot shard for whale keys      - "global 100" becomes "≈100 ± N"
```
The pragmatic production design is **two-tier**: a **local token bucket** in
each gateway (instant, approximate, absorbs the firehose and survives Redis
blips) backed by the **central Lua bucket** for the authoritative count. You
accept that "100/min" might admit 103 under load — which §13.1 already declared
acceptable. When exactness is mandatory (billing, anti-fraud), drop the local
tier and pay the central round-trip on every call.

## 13.9 Follow-ups, red flags & building blocks

**Likely follow-ups (crisp answers):**
- *"Exact global limit across regions?"* — route a KEY's checks to a **single
  home shard** (consistent hashing) and accept cross-region latency, or accept
  per-region limits that sum to the global cap.
- *"Distributed without Redis?"* — gossip local counts, or a sidecar like
  Envoy's global rate-limit service; same central-vs-local trade-off.
- *"Queue instead of reject?"* — that's a **leaky bucket**: hold the request in
  a bounded queue and drain at rate `r`; good for egress shaping, bad for
  user-facing latency.
- *"How do clients behave well?"* — return `Retry-After` + `RateLimit-*`
  headers; well-built SDKs back off with jitter.

**Red flags that sink candidates:** a non-atomic check (the read-modify-write
race); putting the limiter *behind* the backend instead of at the edge; one
global Redis key for everyone (a single hot shard); **fail-closed by default**
(one Redis hiccup blackholes all traffic); ignoring the fixed-window
edge-doubling bug; no `Retry-After` (clients hammer you harder).

**Building blocks reused (theory lives elsewhere):** rate-limiting algorithms,
token/leaky bucket, fail-open vs fail-closed — **Ch 23**; consistent hashing
for sharding the counter cluster, Redis Lua atomicity — **Ch 24**; the gateway
/ edge as policy-enforcement point — **Ch 23**; golden-signal metrics on
allow/deny rates — **Ch 25**.

---

# CASE STUDY 14 — DISTRIBUTED UNIQUE ID GENERATOR (Snowflake)

> **Google priority:** ★★★ · **Difficulty:** Medium · **Frequency:** Very common · **Time budget:** ~35 min

> **User story —** *As a* backend service writing sharded data, *I want* to mint unique,
> time-sortable IDs locally at high rate, *so that* every row gets a global id without a central
> bottleneck.
>
> **For example —** two machines that never talk both stamp millions of IDs/sec; the 64-bit
> Snowflake layout (timestamp · machine · sequence) guarantees no collision and `ORDER BY id` ≈
> newest-first.
>
> **Why it matters —** UUIDv4 fragments indexes and auto-increment is a SPOF; spending 64 bits
> wisely gives uniqueness, rough time-ordering, and zero coordination on the hot path.

Every row your company writes — every tweet, message, order, log line — needs a
**unique id**. On one database, `AUTO_INCREMENT` solves it for free. But once
you **shard** across hundreds of databases and want to mint **millions of IDs a
second from many machines that never talk to each other**, "give me the next
unique number" becomes surprisingly deep. You want IDs that are **unique**,
**roughly time-sortable** (so they index well and `ORDER BY id` ≈ newest-first),
**compact** (a 64-bit integer, not a 128-bit string), and generated with **zero
coordination** on the hot path. **Snowflake** — Twitter's scheme — hits all
four by being clever about **how it spends 64 bits**.

## 14.0 What's really being tested

- Do you know the **trade-off space**: UUIDv4 (no coordination, but random →
  terrible index locality), DB auto-increment (sortable, but a **SPOF** and
  doesn't shard), ticket servers, and **Snowflake**?
- Can you draw the **64-bit bit layout** and justify each field's width with
  arithmetic (years of timestamp, machines, IDs/ms)?
- Do you handle the two killers: **clock skew / clock running backward**, and
  **sequence rollover** within a millisecond?
- Do you understand **why time-sortable matters** (B-tree insert locality,
  range scans, "k-sorted") vs. random UUIDs that fragment indexes?

## 14.1 Clarify — requirements

**Functional**
- Generate **64-bit** IDs that are **globally unique**.
- IDs should be **roughly time-ordered** (k-sorted: IDs minted later are *mostly*
  larger; perfect total order is not required).
- **No coordination per ID** — a generator must not call a central server for
  each id (that would just move the bottleneck).

**Out of scope:** cryptographic unpredictability (Snowflake IDs are *guessable*
— if you need unguessable handles, add a separate random token; don't conflate
the two), and human-readability.

**Non-functional**
- **Throughput:** millions of IDs/sec across the fleet.
- **Latency:** **sub-microsecond** per id — it's a few CPU instructions, no I/O.
- **Availability:** generation must keep working through coordinator outages
  (lease the machine id at boot, then run independently).

**Questions to ask:** *How many IDs/sec at peak? How many generator machines /
data centers? Is strict monotonic order required, or is k-sorted enough? 64-bit
hard limit, or is a 128-bit UUIDv7 acceptable? Lifetime (how many years of
timestamp must we encode)?*

## 14.2 Estimate — back-of-envelope

```
   Bit budget (must fit a signed 64-bit long):
     1  sign bit      → always 0 (keep IDs positive)
     41 timestamp ms  → 2^41 ms = 2.2e12 ms ≈ 69.7 YEARS from a custom epoch
     10 machine id    → 2^10  = 1024 generator nodes
     12 sequence      → 2^12  = 4096 IDs per millisecond PER machine
   Throughput per machine: 4096 / ms = 4.096 MILLION IDs/sec
   Fleet ceiling:          4.096M × 1024 ≈ 4.2 BILLION IDs/sec
   If peak writes ≈ 1M/sec → ONE machine has 4× headroom; a few give HA.
```
The arithmetic *is* the design: 41 bits buys ~70 years, 10 bits buys 1024
machines, 12 bits buys 4096/ms/machine — and the fields are tunable (e.g.
steal a sequence bit for an 11th machine bit if you need more nodes than years).

## Whiteboard rehearsal — how you'd actually draw this live

In the room you don't reproduce the polished diagram in §14.3 below — you sketch rough
boxes and talk. So **rehearse from this first**: here is the same architecture as a **live
whiteboard sketch**, in the shorthand you'd actually use on a Google whiteboard. The colour
code is the one most candidates settle into:

> **green = client · grey = edge/LB · blue = service · red = datastore · orange = queue / stream · violet = 3rd-party**

![Distributed Unique ID Generator (Snowflake) — whiteboard rehearsal sketch](diagrams/unique_id_whiteboard.svg)

**Why rehearse from the sketch, not the clean diagram?** The polished SVG in §14.3 is for
*reading*; this one is for *rehearsing*. Practise reproducing it from memory in ~4 minutes while
narrating every box out loud — that muscle memory is exactly what the interview tests. It is the
*same* components as the clean §14.3 diagram, only drawn in the loose, name-the-tool style
your hand can produce under pressure: every box names a concrete technology, each datastore is
called out in red, queues in orange, third-party vendors in violet. That visual discipline is
the signal an interviewer is looking for.

## 14.3 HLD — high-level architecture

Two deployment shapes. **Embedded** (a library inside each service) is the
default — it has **no network hop**. A standalone **ID service** is used when
clients can't embed the library (polyglot fleets, or you want central control).

![Distributed Unique ID Generator (Snowflake) — high-level architecture (HLD)](diagrams/unique_id.svg)

**Block-by-block:**
- **Coordinator** (ZooKeeper/etcd — Ch 24, consensus) — hands each generator a **distinct 10-bit
  worker id** exactly once, at boot. That is the *only* coordination, and it's off the hot path.
- **Generator** — mints IDs from `timestamp | worker | sequence` using just its local clock and
  an in-memory counter — **no I/O per id**.
- **Deployment** — Pattern A embeds this in every app pod; Pattern B centralizes it behind a load
  balancer when embedding isn't possible.
- **Worker id** — guarantees two machines can never collide, even when they generate in the same millisecond.

## 14.4 HLD — critical path walkthrough

Minting one id inside `nextId()`:
```
  1. ts = now_ms()
  2. if ts == last_ts:                    (same millisecond as previous id)
        seq = (seq + 1) & 0xFFF           bump 12-bit sequence
        if seq == 0:                      4096 IDs already used THIS ms →
            ts = wait_until(last_ts + 1)  spin to the next millisecond
     else:
        seq = 0                           new ms → reset sequence
  3. if ts < last_ts:  → CLOCK WENT BACKWARD → handle (see §14.8)
  4. last_ts = ts
  5. id = ((ts - EPOCH) << 22) | (worker_id << 12) | seq
  6. return id      (a 64-bit long; strictly increasing on this machine)
```
Steps 2 and 5 are the heart: within a millisecond we **pack up to 4096 ids**
via the sequence; across milliseconds the **timestamp** advances, so ids are
time-sorted. Step 1's only input is the **local clock**, which is exactly why
step 3 (clock skew) is the thing that can break uniqueness.

## 14.5 HLD — data model & storage choices

| Entity | Shape | Store | Why |
|--------|-------|-------|-----|
| Worker-id lease | `worker_id → {host, lease_ts}` | ZooKeeper/etcd (ephemeral node) | Strong consensus; auto-release on node death |
| Generator state | `{last_ts, seq}` | **In-memory only** | Per-machine, microsecond access, never persisted |
| Custom epoch | constant (e.g. `2020-01-01`) | Compiled in | Maximizes the 41-bit timestamp's useful lifetime |

There is essentially **no database** in the hot path — that's the point. The
only durable state is the worker-id lease, touched once per process lifetime.

## 14.6 HLD — scaling & bottlenecks

- **It barely needs scaling:** one machine = 4.1 M ids/sec. You add generators
  for **availability and locality**, not throughput.
- **Worker-id exhaustion:** 1024 ids cap the fleet. If you outgrow it, **rebalance
  the bit fields** (more machine bits, fewer sequence bits) or scope worker ids
  per data center (5 bits DC + 5 bits worker).
- **Clock as the bottleneck:** generation rate is gated by `now_ms()` and the
  sequence; on a machine with a slow/coarse clock, the spin-to-next-ms path can
  throttle. Use a monotonic clock source.
- **Hot path is CPU-only** → it scales linearly with cores; no shared lock if
  each thread/worker owns its own sequence space (or the increment is atomic).

## 14.7 HLD — failure modes & trade-offs

```
  What dies                  →  What happens / what we do
  ─────────────────────────────────────────────────────────────────────
  Coordinator (ZK) down      →  RUNNING generators keep minting (they
                                leased the worker id at boot); only NEW
                                boots block until ZK returns
  Clock jumps BACKWARD        →  uniqueness risk! refuse to mint until the
   (NTP correction, VM pause)    clock catches up to last_ts; alert if the
                                gap is large (see §14.8)
  Two nodes get same worker   →  duplicate IDs → must be made IMPOSSIBLE by
   id (misconfig)               the coordinator's ephemeral-lease guarantee
  Sequence overflow in 1 ms   →  >4096/ms → spin to next ms (back-pressure)
```
**Trade-offs called out:** Snowflake gives up **strict global monotonicity**
(IDs are only *k-sorted* — two machines in the same ms interleave) in exchange
for **coordination-free generation**. It also gives up **unguessability** (you
can read the timestamp out of an id). Versus **UUIDv4**: Snowflake is half the
size and sortable, but needs worker-id coordination. Versus **DB
auto-increment**: Snowflake removes the single-writer SPOF.

## 14.8 LLD (the crux) — the 64-bit layout + clock-skew handling

The crux is **the bit layout** and the **clock-backward** problem — get these
two right and the rest is plumbing.

**The layout (memorize this picture):**
```
  64-bit Snowflake ID   (sign bit 0 → always positive; fits a Java long)
  ┌─┬──────────────────────────────────────┬───────────┬─────────────┐
  │0│       41-bit TIMESTAMP (ms)           │ 10-bit    │  12-bit     │
  │ │   ms since a CUSTOM epoch (~70 yrs)   │ MACHINE   │  SEQUENCE   │
  └─┴──────────────────────────────────────┴───────────┴─────────────┘
   63 62                                  22 21       12 11           0
    ▲              ▲                            ▲             ▲
  sign       high bits dominate the         1024 nodes   4096 ids per
  (unused)   sort order → TIME-SORTABLE   (5 DC+5 wkr?)  ms per machine
```
Because the **timestamp occupies the high bits**, numeric order ≈ time order:
`ORDER BY id DESC` returns newest-first *for free*, and new IDs append to the
**right edge** of a B-tree index (great insert locality — contrast UUIDv4,
whose randomness scatters inserts across the whole index and shreds cache).

**Assembling an id** (the shift-and-OR):
```python
EPOCH = 1577836800000          # 2020-01-01 in ms; our custom epoch
def make_id(ts, worker, seq):
    return ((ts - EPOCH) << 22) | (worker << 12) | seq
    #          41 bits  ──┘  10 bits ─┘   12 bits ┘
    #  << 22 = 10(machine)+12(sequence) bits to the left of timestamp
```

**Clock-skew handling — the part that actually breaks in production.** A
machine's clock can jump **backward** (NTP correction, leap second, a paused
VM resuming). If `now_ms() < last_ts`, naively continuing could **re-mint a
timestamp+sequence already used → a duplicate**. The safe policy:
```python
def next_id():
    ts = now_ms()
    if ts < last_ts:                       # clock moved BACKWARD
        drift = last_ts - ts
        if drift <= MAX_TOLERATED_MS:      # small (e.g. ≤ 5 ms):
            spin_until(now_ms() >= last_ts) #   just wait it out
            ts = now_ms()
        else:                              # large jump → DO NOT risk dups
            raise ClockMovedBackwards(drift) # fail loud, alert, page on-call
    if ts == last_ts:                      # same ms → use sequence
        seq = (seq + 1) & 0xFFF
        if seq == 0:                       # ROLLOVER: 4096 used this ms
            ts = wait_next_ms(last_ts)     # block to next ms (back-pressure)
    else:
        seq = 0
    last_ts = ts
    return make_id(ts, WORKER_ID, seq)
```
Three defenses in one function: **small backward drift → spin and wait**;
**large backward jump → refuse and alert** (better to stall id generation than
to mint duplicates that corrupt data forever); **sequence rollover → block to
the next millisecond** (natural back-pressure that caps a machine at 4096/ms).
This is the senior signal: a candidate who only draws the bit layout has done
half the job; the clock-backward case is what separates "read a blog" from
"shipped one."

## 14.9 Follow-ups, red flags & building blocks

**Likely follow-ups:**
- *"Why not UUIDv4?"* — random → no time order and **awful B-tree locality**
  (every insert hits a random leaf). UUIDv7 fixes ordering but is still 128-bit.
- *"How are worker ids assigned?"* — ephemeral leases in ZooKeeper/etcd; a dead
  node's lease auto-expires so its id can be reused, and **two live nodes can
  never share one** (consensus guarantee).
- *"Strict monotonic across the fleet?"* — Snowflake is only **k-sorted**; for
  strict global order you need a single sequencer (back to a bottleneck) or
  logical clocks. Usually k-sorted is enough.
- *"64-bit too small / too few machines?"* — re-budget the bits, or scope
  machine ids per region.

**Red flags:** ignoring clock-backward (the #1 correctness bug); a central
server call **per id** (defeats the purpose); using random UUIDs as primary
keys then wondering why writes thrash the index; forgetting the sign bit (giving
negative IDs in languages with signed longs); assuming Snowflake IDs are secret.

**Building blocks reused:** consensus / coordination (ZooKeeper, etcd, leases) —
**Ch 24**; B-tree index locality and why sortable keys matter — **Ch 24**; the
sketch of this scheme — **Ch 25** (*distributed unique IDs*); monotonic clocks &
NTP — **Ch 25**.

---

# CASE STUDY 15 — TOP-K / TRENDING / HEAVY HITTERS

> **Google priority:** ★★ · **Difficulty:** Hard · **Frequency:** Common · **Time budget:** ~30 min

> **User story —** *As a* product, *I want* the current top-K (trending hashtags, top URLs, API
> heavy hitters) from a firehose of events, *so that* I can surface what's hot in near real time.
>
> **For example —** millions of events/sec stream by; a Count-Min Sketch + min-heap reports the
> top-10 hashtags this hour in ~32 MB, instead of a 16 GB exact counter per node.
>
> **Why it matters —** you can't keep a counter for billions of distinct keys; trading a little
> accuracy (a sketch) for fixed memory is the whole point.

"What are the **top 10 trending hashtags right now**?" "Which **100 URLs** got
the most ad clicks this hour?" "Who are the **heavy hitters** flooding our API?"
These are all the same problem: a **firehose of events** streams past, and you
must report the **K most frequent** keys — without storing a counter for every
distinct key (there can be **billions** of distinct keys, far more than fits in
memory). The trick is to **trade a little accuracy for a lot of memory**: a
probabilistic **Count-Min Sketch** estimates counts in fixed space, and a
**min-heap** tracks the current top-K.

## 15.1 Clarify & estimate

- **Functional:** return the top-K keys by frequency over a **time window**
  (last hour / day), refreshed every few seconds. Approximate is fine.
- **Exact or approximate?** *Ask.* Exact top-K over billions of keys needs a
  full count (Spark, offline). Real-time trending tolerates **approximate**.
- **Windowing:** is it a **sliding** window (last 60 min, decaying) or a
  **tumbling** one (this calendar hour)? Decay matters for "trending."
- **Estimate:** 1 M events/sec, ~10^9 distinct keys/day. An exact hash-map of
  counts = 10^9 × ~16 B ≈ **16 GB per node** (won't fit / won't shard cheaply).
  A Count-Min Sketch at `w=2^20, d=4` = `4 × 1M × 8B` ≈ **32 MB** — *fixed*,
  regardless of key count. That 500× shrink is the whole reason the sketch exists.

## Whiteboard rehearsal — how you'd actually draw this live

In the room you don't reproduce the polished diagram in §15.2 below — you sketch rough
boxes and talk. So **rehearse from this first**: here is the same architecture as a **live
whiteboard sketch**, in the shorthand you'd actually use on a Google whiteboard. The colour
code is the one most candidates settle into:

> **green = client · grey = edge/LB · blue = service · red = datastore · orange = queue / stream · violet = 3rd-party**

![Top-K / Trending / Heavy Hitters — whiteboard rehearsal sketch](diagrams/topk_whiteboard.svg)

**Why rehearse from the sketch, not the clean diagram?** The polished SVG in §15.2 is for
*reading*; this one is for *rehearsing*. Practise reproducing it from memory in ~4 minutes while
narrating every box out loud — that muscle memory is exactly what the interview tests. It is the
*same* components as the clean §15.2 diagram, only drawn in the loose, name-the-tool style
your hand can produce under pressure: every box names a concrete technology, each datastore is
called out in red, queues in orange, third-party vendors in violet. That visual discipline is
the signal an interviewer is looking for.

## 15.2 HLD — architecture + flow

![Top-K / Trending / Heavy Hitters — high-level architecture (HLD)](diagrams/topk.svg)

**Block-by-block:**
- **Kafka ingest** — events land in **Kafka**, **partitioned by key** so every occurrence of one
  hashtag goes to the **same stream worker** (that worker sees *all* of that key's traffic
  locally — no cross-worker counting per event).
- **Stream worker** — keeps a fixed-size **Count-Min Sketch** and a **min-heap of its top-K**,
  and flushes its local top-K every few seconds.
- **Merge** — combines the per-partition heaps into a **global top-K**, cached in Redis for the
  `/trending` API.
- **Batch path** (Spark) — computes the *exact* answer slowly and reconciles drift — the classic
  **Lambda architecture** (Ch 24).

**Numbered flow:** (1) event → Kafka, hashed to a partition by key; (2) worker
does `sketch.update(key)` and, if `sketch.estimate(key) >` heap-min, updates its
local heap; (3) every few seconds the worker emits its top-K; (4) merger unions
the heaps → global top-K → Redis; (5) API reads Redis.

## 15.3 The crux — Count-Min Sketch + a min-heap

A **Count-Min Sketch** is a 2-D array of counters with `d` independent hash
functions (rows) and `w` columns. To **count** a key, bump one cell in each row;
to **estimate**, take the **minimum** across rows (collisions only ever *add*
count, so the min is the tightest over-estimate).

```
  COUNT-MIN SKETCH   (d=4 rows × w columns of counters)
            col →   0     1     2     3    ...   w-1
   h1(x) ─▶ [    ][  12 ][    ][    ] ...........[    ]
   h2(x) ─▶ [  7 ][    ][    ][    ] ...........[    ]
   h3(x) ─▶ [    ][    ][  19 ][    ] ...........[    ]
   h4(x) ─▶ [    ][    ][    ][  9 ] ...........[    ]

   update(x):    for each row i:  cell[i][ h_i(x) mod w ] += 1
   estimate(x):  MIN over rows of cell[i][ h_i(x) mod w ]
                 (never under-counts; over-counts only on hash collisions)
```
The sketch tells you *how often* a key appeared, but **not which keys are
biggest** — for that, pair it with a **min-heap of size K**:
```
  on each event x:
     sketch.update(x)
     est = sketch.estimate(x)
     if heap.size < K:           heap.push(x, est)        # still filling
     elif est > heap.min().count:                          # x beats weakest
         heap.replace_min(x, est)                          # evict, insert
  # heap always holds the K keys with the largest estimated counts
```
Why this pairing wins: the **sketch** gives **fixed memory** (32 MB no matter how
many distinct keys), and the **heap** gives **O(log K)** maintenance of the
current leaders. For **trending** (recency-weighted), add **per-window decay** —
either reset the sketch each tumbling window, or keep two windows and
exponentially decay the old one, so a hashtag that was huge yesterday doesn't
dominate today.

## 15.4 Trade-offs, red flags & building blocks

- **Approximate by design:** the sketch **over-counts** under collisions (never
  under-counts). Bound the error by sizing `w` (`ε ≈ e/w`) and `d`
  (confidence `1−δ`, `δ ≈ e^-d`). Good enough for trending; not for billing.
- **Exact when you must:** ad-click *billing* needs the **batch (Spark)**
  path, not the sketch. Trending/observability use the stream path.
- **Red flags:** proposing a giant exact hash-map (won't fit at 10^9 keys); a
  global lock on one shared counter (the firehose melts it — partition by key
  instead); forgetting **windowing/decay** so "trending" really means
  "all-time"; merging partitions by *summing sketches* but then trusting exact
  counts (you can sum CMS arrays cell-wise, but the result is still approximate).
- **Building blocks:** Count-Min Sketch & probabilistic structures — **Ch 24**;
  Kafka partitioning & stream processing (Flink/Beam) — **Ch 24**; Lambda /
  Kappa batch-vs-stream reconciliation — **Ch 24**; heaps — **Ch 31 (DSA)**.

---

# CASE STUDY 16 — LEADERBOARD / RANKING

> **Google priority:** ★★ · **Difficulty:** Medium · **Frequency:** Common · **Time budget:** ~30 min

> **User story —** *As a* player, *I want* to see the top scores, my own rank, and who's just
> above and below me — instantly, live — *so that* the competition feels real.
>
> **For example —** I submit a score and immediately see "you're #1,234,567; here are the 5 players
> around you" — answered in O(log N) by a Redis sorted set, not by re-sorting 50 M rows.
>
> **Why it matters —** rank / top-N / around-me queries are exactly what a sorted set is built for;
> the durable scores live in Cassandra behind it.

A **game leaderboard** looks easy — sort users by score — until you notice the
queries it must answer **in milliseconds, live, for 50 million players**:
*"top 100,"* *"what's MY rank?,"* and *"show me the 5 players just above and
below me."* Re-sorting millions of rows on every score update is hopeless. The
right tool is a data structure built exactly for this: the **Redis sorted set**,
which keeps elements ordered by score and answers rank queries in **O(log N)**.

## 16.1 Clarify & estimate

- **Functional:** update a player's score; read **top-N**, a player's **rank**,
  and the **window around a player** ("rank −2 … +2"). Maybe per-region and
  global boards; daily/weekly/all-time windows.
- **Ties:** decide the rule up front — same score → break by **earliest to
  reach it** (store `score.timestamp` as a composite) or by user id.
- **Estimate:** 50 M players, 10 score updates/player/day = 500 M writes/day ≈
  **6k writes/s** (peak ~20k/s). Reads dominate: every player checking rank →
  **100k+ reads/s**. Memory: 50 M × (8 B score + ~24 B member) ≈ **1.6 GB** per
  board — fits in one Redis node, but shard for HA and multi-board.

## Whiteboard rehearsal — how you'd actually draw this live

In the room you don't reproduce the polished diagram in §16.2 below — you sketch rough
boxes and talk. So **rehearse from this first**: here is the same architecture as a **live
whiteboard sketch**, in the shorthand you'd actually use on a Google whiteboard. The colour
code is the one most candidates settle into:

> **green = client · grey = edge/LB · blue = service · red = datastore · orange = queue / stream · violet = 3rd-party**

![Leaderboard / Ranking — whiteboard rehearsal sketch](diagrams/leaderboard_whiteboard.svg)

**Why rehearse from the sketch, not the clean diagram?** The polished SVG in §16.2 is for
*reading*; this one is for *rehearsing*. Practise reproducing it from memory in ~4 minutes while
narrating every box out loud — that muscle memory is exactly what the interview tests. It is the
*same* components as the clean §16.2 diagram, only drawn in the loose, name-the-tool style
your hand can produce under pressure: every box names a concrete technology, each datastore is
called out in red, queues in orange, third-party vendors in violet. That visual discipline is
the signal an interviewer is looking for.

## 16.2 HLD — architecture + flow

![Leaderboard / Ranking — high-level architecture (HLD)](diagrams/leaderboard.svg)

**Block-by-block:**
- **Score API** — writes each update to both the durable store (**source of truth** — survives a
  Redis flush) and the **Redis sorted set** (the live ranking index).
- **Leaderboard API** — answers all three query shapes directly from Redis sorted-set commands —
  each **O(log N)**.
- **Failover** — on a Redis failover you **rebuild** the sorted set by replaying scores from the
  durable store.

**Numbered flow:** (1) score event → API; (2) `ZADD` into Redis + persist to Cassandra; (3) reads
hit Redis only: `ZREVRANK` for "my rank," `ZREVRANGE` for "top N" and "around me."

## 16.3 The crux — sorted-set ops, and sharding for global rank

Redis implements a sorted set as a **skip list** (ordered, O(log N) rank) plus a
**hash map** (member → score, O(1) lookup). That dual structure is why it can do
both "where does this member rank?" and "who is at rank r?" quickly:

```
   ZADD   lb:global  9500  "alice"      add/update score        O(log N)
   ZREVRANK lb:global "alice"           alice's 0-based rank     O(log N)
   ZREVRANGE lb:global 0 99  WITHSCORES top-100 (high→low)  O(log N + 100)
   ZREVRANGE lb:global  r-2  r+2        the 5 around rank r      O(log N + 5)
   ZINCRBY  lb:global  +50  "alice"     atomic score bump        O(log N)
```
**Ties:** Redis orders equal scores **lexicographically by member**. To enforce
"earliest wins," encode a composite score `score * 1e7 + (MAX_TS − reach_ts)` so
the timestamp breaks ties deterministically without a second query.

**The genuinely hard part — global rank across shards.** One board fits in one
node, but tens of millions of players across **many shards** (or many regional
boards) means no single sorted set holds everyone, so `ZREVRANK` can't give a
**global** rank. You can't just merge — rank is a *global* property. Two
standard answers:

```
  (a) BUCKET-COUNT APPROXIMATION (scales, approximate):
      Keep a histogram of "how many players have score ≥ s" per shard.
      global_rank(alice) ≈ Σ over shards ( count of players with score
                                           > alice.score )  + local offset
      → answered with per-shard count queries; O(shards), not O(N).

  (b) ROUTING BY SCORE RANGE (exact for top, hard for middle):
      Shard 0: scores 0–999   Shard 1: 1000–4999   Shard 2: 5000+
      "Top 100" lives entirely in the highest shard → exact & cheap.
      A mid-pack player's exact rank still needs counts from higher shards.
```
For most products the honest senior answer is: **exact rank for the top board
(it's small and lives on one shard); approximate "rank ~#12,431" for everyone
else** via bucket counts — players don't need their global rank exact to the
unit, and computing it exactly across shards on every read is prohibitively
expensive.

## 16.4 Trade-offs, red flags & building blocks

- **Redis sorted set is the answer** to "rank/top-N/around-me," not a SQL
  `ORDER BY ... LIMIT` (which re-scans and can't do "my rank" cheaply at scale).
- **Persistence:** treat Redis as a **rebuildable index**; keep the durable
  scores in Cassandra so a cache flush doesn't lose the game.
- **Red flags:** sorting in the application tier on every read; storing rank as
  a column and updating millions of rows per score change; ignoring ties;
  assuming one Redis node scales to *any* size (shard + plan global-rank
  strategy explicitly); recomputing global rank exactly on every read.
- **Building blocks:** Redis sorted sets / skip lists — **Ch 23**; sharding &
  consistent hashing — **Ch 24**; cache-as-index with a durable source of
  truth — **Ch 23**; histograms/percentiles — **Ch 25** (observability).

---

# CASE STUDY 17 — DISTRIBUTED CACHE (design Redis / Memcached)

> **Google priority:** ★★ · **Difficulty:** Medium · **Frequency:** Common · **Time budget:** ~30 min

> **User story —** *As a* service owner, *I want* a fast shared in-memory layer in front of my
> database, *so that* hot reads return in microseconds and the DB survives the read firehose.
>
> **For example —** 1 M reads/s at a >90% hit rate means the DB only sees ~100k/s; a product-page
> read drops from 10 ms to 0.3 ms by hitting the cache first.
>
> **Why it matters —** the real design is spreading keys with consistent hashing (so adding a node
> doesn't reshuffle everything) and surviving a hot key that would melt one shard.

A **distributed cache** is a giant, fast, in-memory key→value layer that sits
between your services and your database, turning **10 ms database reads into
0.3 ms memory reads** and absorbing the read firehose so the DB survives. The
single-node version is a hash map with an eviction policy. The *distributed*
version asks the real questions: **how do you spread keys across nodes so adding
one node doesn't reshuffle everything** (consistent hashing), and **what happens
when one key is so hot it melts its shard** (hot-key + thundering herd)?

## 17.1 Clarify & estimate

- **Functional:** `get(k)`, `set(k, v, ttl)`, `delete(k)`; sharded across nodes;
optional replication; an eviction policy when memory is full.
- **Consistency:** the cache is a **best-effort copy**, not the source of truth —
staleness is allowed; the DB is authoritative.
- **What NOT to cache:** rarely-read keys (no hit-rate payoff), data that must be
perfectly fresh (financial balances — read the DB), and write-heavy
keys whose value changes faster than it's read.
- **Estimate:** target a **>90% hit rate**. 1 M reads/s × 90% served from cache
= the DB only sees ~100k/s. Cache 100 GB hot set across nodes of 32 GB RAM →
**4 nodes** (+ replicas). Each node ~200k ops/s → cluster handles millions/s.

## Whiteboard rehearsal — how you'd actually draw this live

In the room you don't reproduce the polished diagram in §17.2 below — you sketch rough
boxes and talk. So **rehearse from this first**: here is the same architecture as a **live
whiteboard sketch**, in the shorthand you'd actually use on a Google whiteboard. The colour
code is the one most candidates settle into:

> **green = client · grey = edge/LB · blue = service · red = datastore · orange = queue / stream · violet = 3rd-party**

![Distributed Cache (Redis / Memcached) — whiteboard rehearsal sketch](diagrams/dist_cache_whiteboard.svg)

**Why rehearse from the sketch, not the clean diagram?** The polished SVG in §17.2 is for
*reading*; this one is for *rehearsing*. Practise reproducing it from memory in ~4 minutes while
narrating every box out loud — that muscle memory is exactly what the interview tests. It is the
*same* components as the clean §17.2 diagram, only drawn in the loose, name-the-tool style
your hand can produce under pressure: every box names a concrete technology, each datastore is
called out in red, queues in orange, third-party vendors in violet. That visual discipline is
the signal an interviewer is looking for.

## 17.2 HLD — architecture + flow

![Distributed Cache (Redis / Memcached) — high-level architecture (HLD)](diagrams/dist_cache.svg)

**Block-by-block:**
- **Cache client** — a library in each app server; hashes the key onto a **consistent-hash ring**
  to find its owner node — there's no central coordinator on the read path.
- **Cache node** — holds a shard in RAM with an **eviction policy** (LRU default) and an **async replica**.
- **Cluster Manager** (Redis Sentinel / Cluster) — watches nodes and promotes a replica on failover.
- **Miss handling** — either the app reads the DB and back-fills (**cache-aside**) or the cache
  reads through itself (**read-through**).

**Numbered flow:** (1) client maps key→node via the ring; (2) `GET` hits that node; (3) on miss,
load from DB, `SET` with a TTL, return. Write strategies (cache-aside / write-through / write-back)
are theory from **Ch 23** — pick cache-aside for the default.

## 17.3 The crux — the consistent-hash ring + hot-key mitigation

**Sharding without reshuffling.** Naive `hash(key) % N` remaps **almost every
key** when `N` changes (add a node → cache-wide miss storm → DB melts).
**Consistent hashing** (Ch 24) maps both keys and nodes onto a ring; a key is
owned by the **next node clockwise**, so adding/removing a node only moves
`~1/N` of keys:

```
          ┌─────── hash ring (0 … 2^32) ───────┐
          │                                       │
     A ●                                            ● B
          │     ● keyA → owned by B (next CW)      │
          │          ● keyB → owned by C           │
     D ●                                            ● C
          │   Add node E between D and A:           │
          └── only keys in the D→E arc move ────────┘
 Virtual nodes: place each physical node at ~100 ring spots → even load
 + lets you weight bigger nodes with more vnodes.
```
**Virtual nodes** (each physical node placed at many ring positions) smooth out
load imbalance and make rebalancing gradual.

**The hot-key problem.** Consistent hashing balances *many* keys, but if **one**
key (a celebrity's profile, a flash-sale SKU) gets 200k req/s, it all lands on
**one node** and melts it. Three mitigations, often combined:
```
1. CLIENT-SIDE / NEAR CACHE: app caches hot keys in-process for a few
   seconds → most reads never reach the cache node at all.
2. KEY REPLICATION / FANOUT: store the hot key on K nodes as key#0..key#K-1;
   readers pick a random replica → load splits K ways.
3. REQUEST COALESCING (anti thundering-herd): on a miss, only ONE caller
   fetches from the DB while others WAIT for the fill (single-flight),
   so a popular expired key doesn't trigger 10k simultaneous DB reads.
```
The **thundering herd** (a.k.a. cache stampede) is the failure where a hot key
**expires** and thousands of concurrent misses all stampede the DB at once.
**Request coalescing / single-flight** plus **slightly randomized TTLs** (jitter)
prevent synchronized expiry. (Stampede theory: Ch 23.)

## 17.4 Trade-offs, red flags & building blocks

- **Cache vs source of truth:** the cache is **allowed to be stale and to lose
data** on a node crash — that's why the DB is authoritative and the cache is
rebuildable.
- **Eviction:** **LRU** is the default; **LFU** (or W-TinyLFU) wins for stable
hot sets where recency lies (Ch 23).
- **Replication:** async replicas trade a small staleness/loss window for read
scale and fast failover; sync replication costs write latency.
- **Red flags:** `hash % N` sharding (reshuffle storm on scale-out); no hot-key
plan (one node melts); no stampede protection (expiry → DB outage); caching
data that needs to be perfectly fresh; treating the cache as durable.
- **Building blocks:** caching strategies, eviction (LRU/LFU/W-TinyLFU),
stampede protection — **Ch 23**; consistent hashing + virtual nodes —
**Ch 24**; replication & failover — **Ch 24**.

---

# CASE STUDY 18 — DISTRIBUTED JOB SCHEDULER / TASK QUEUE

> **Google priority:** ★★ · **Difficulty:** Hard · **Frequency:** Common · **Time budget:** ~35 min

> **User story —** *As a* backend, *I want* to run work later or in the background reliably, *so
> that* delayed and recurring jobs fire on time and nothing is lost when a worker crashes.
>
> **For example —** "send this email in 5 minutes" and "generate the report nightly at 02:00" both
> land in a durable store; a worker leases each job (visibility timeout) and acks on success, so a
> crash just re-runs it.
>
> **Why it matters —** at-least-once + idempotent workers + a durable job store with leased
> dispatch is what turns "run it later" into a real guarantee.

Almost every backend needs to **run work later or in the background**: send this
email in 5 minutes, generate this report nightly at 02:00, retry this webhook,
process this video. A **distributed job scheduler / task queue** accepts jobs,
runs them on a fleet of workers, and makes two hard promises: **every job runs
at least once even if workers crash**, and **delayed/cron jobs fire at the right
time**. The whole design hinges on a **durable job store + leased dispatch**
(the "visibility timeout" trick) and a **time-ordered structure** for delayed
jobs.

## 18.1 Clarify & estimate

- **Functional:** submit **immediate**, **delayed** (`run_at`), and **recurring**
(cron) jobs; execute on workers; **retry** failures with backoff; route
exhausted jobs to a **dead-letter queue (DLQ)**.
- **Delivery semantics:** **at-least-once** is realistic; **exactly-once is an
illusion** — so workers must be **idempotent**. Decide this explicitly.
- **Estimate:** 100 M jobs/day ≈ **1,200/s** (peak ~5k/s). Avg job 200 ms →
concurrency needed ≈ `λ × service_time` (Little's Law) = 5000 × 0.2 = **1,000
workers** at peak. Job store: 100 M × 1 KB = 100 GB/day with a short TTL on
completed jobs.

## Whiteboard rehearsal — how you'd actually draw this live

In the room you don't reproduce the polished diagram in §18.2 below — you sketch rough
boxes and talk. So **rehearse from this first**: here is the same architecture as a **live
whiteboard sketch**, in the shorthand you'd actually use on a Google whiteboard. The colour
code is the one most candidates settle into:

> **green = client · grey = edge/LB · blue = service · red = datastore · orange = queue / stream · violet = 3rd-party**

![Distributed Job Scheduler / Task Queue — whiteboard rehearsal sketch](diagrams/scheduler_whiteboard.svg)

**Why rehearse from the sketch, not the clean diagram?** The polished SVG in §18.2 is for
*reading*; this one is for *rehearsing*. Practise reproducing it from memory in ~4 minutes while
narrating every box out loud — that muscle memory is exactly what the interview tests. It is the
*same* components as the clean §18.2 diagram, only drawn in the loose, name-the-tool style
your hand can produce under pressure: every box names a concrete technology, each datastore is
called out in red, queues in orange, third-party vendors in violet. That visual discipline is
the signal an interviewer is looking for.

## 18.2 HLD — architecture + flow

![Distributed Job Scheduler / Task Queue — high-level architecture (HLD)](diagrams/scheduler.svg)

**Block-by-block:**
- **Submit API** — writes each job **durably** (so nothing is lost on a crash) with its `run_at` and `state`.
- **Leader-elected scheduler** (only one active at a time, via etcd/ZooKeeper — Ch 24) — scans the
  **time-ordered index** and promotes **due** jobs to READY.
- **Workers** — poll, **lease** a job (claim it for a bounded time), run it, and **ack** (delete)
  on success or **retry with backoff** on failure; after `N` attempts the job goes to a **DLQ**.
- **Sweeper** — re-queues jobs whose **lease expired** (the worker died mid-job) — that's what
  makes execution **at-least-once**.

**Numbered flow:** (1) submit → durable store; (2) scheduler marks due jobs READY; (3) worker
leases + runs; (4) ack→done, or fail→retry/DLQ, or crash→lease expires→redeliver.

## 18.3 The crux — leased dispatch (visibility timeout) + the delayed-job structure

**Leased dispatch** is how you get at-least-once without losing jobs when a
worker dies. Dequeue **atomically claims** a job and stamps a **lease deadline**;
if the worker doesn't finish (and renew/ack) before the deadline, the job
becomes visible again and is redelivered — exactly how SQS's *visibility
timeout* works.

```sql
-- DEQUEUE: atomically claim one due job (Postgres: SKIP LOCKED avoids
-- two workers grabbing the same row)
UPDATE jobs SET state='leased',
              lease_until = now() + INTERVAL '30s',
              attempts    = attempts + 1
WHERE id = (
 SELECT id FROM jobs
 WHERE state='ready' AND run_at <= now()
 ORDER BY run_at
 FOR UPDATE SKIP LOCKED          -- skip rows another worker locked
 LIMIT 1
) RETURNING id, payload;

-- ON SUCCESS:  DELETE FROM jobs WHERE id = :id;        (or state='done')
-- ON CRASH:    sweeper: UPDATE jobs SET state='ready'
--              WHERE state='leased' AND lease_until < now();   -- redeliver
```
The lease is the entire trick: a **crashed worker can't ack**, so its lease
**expires** and the job runs again elsewhere → **at-least-once**. Because of
redelivery, the **worker must be idempotent** (use a job-id dedupe key, Ch 25).
"Exactly-once" is faked as **at-least-once + idempotent worker**.

**The delayed-job structure.** "Run at `run_at`" needs an efficient "what's due
now?" query. Two standard structures:
```
(a) SORTED SET BY run_at  (Redis ZSET; simple, scales to millions)
      ZADD delayed <run_at_ts> <job_id>
      due = ZRANGEBYSCORE delayed -inf now   → promote these to READY
      O(log N) insert, O(log N + m) to pull m due jobs.

(b) HIERARCHICAL TIMING WHEEL  (for huge timer volumes, e.g. Kafka)
      buckets:  [ now ][ +1s ][ +2s ] ... ring of slots; a job lands in
      the slot for its run_at; the wheel ticks one slot per second and
      fires that slot's jobs. O(1) insert/expire, fixed memory.
```
A **timing wheel** (hashed wheel timer) gives **O(1)** scheduling for millions of
short timers (used in Kafka, Netty); a **sorted set** is simpler and plenty for
most schedulers. **Cron** jobs are just delayed jobs that, on completion,
**re-enqueue themselves** at the next fire time.

## 18.4 Trade-offs, red flags & building blocks

- **At-least-once + idempotent** beats chasing exactly-once. Make ack the only
thing that removes a job, and the lease the only thing that hides it.
- **Leader election** keeps a *single* scheduler promoting due jobs (two would
double-promote); workers, by contrast, scale out freely.
- **Backoff + DLQ:** retry with exponential backoff and **jitter** (avoid
retry storms — Ch 23); a poison job must end in the DLQ, not loop forever.
- **Red flags:** holding jobs in memory (lost on crash — must be durable); no
lease/visibility timeout (a dead worker silently drops its job); non-idempotent
workers with at-least-once delivery (double side-effects); a single scheduler
with no leader election (split-brain double execution); scanning the whole
table for due jobs instead of a time-ordered index.
- **Building blocks:** queues, DLQs, delivery guarantees — **Ch 24**;
idempotency keys — **Ch 25**; leader election (etcd/ZK) — **Ch 24**; retries
with backoff + jitter — **Ch 23/25**.

---

# CASE STUDY 19 — PAYMENT SYSTEM / DIGITAL WALLET

> **Google priority:** ★★★ · **Difficulty:** Hard · **Frequency:** Common · **Time budget:** ~40 min

> **User story —** *As a* user moving money, *I want* every top-up, payment, and transfer to be
> exactly right — never double-charged, never lost — *so that* I can trust my balance.
>
> **For example —** my "pay merchant" call times out and the app retries; the idempotency key makes
> the retry a no-op, so I'm charged once and the double-entry ledger still balances.
>
> **Why it matters —** money is the one place "eventually consistent" is wrong; an immutable ledger
> + idempotency keys + a saga across the external gateway is what makes it CP-correct.

This is the one design where **"eventually consistent" and "best effort" are
wrong answers**. When you move money, a bug doesn't show up as a stale tweet —
it shows up as a **double charge**, a **lost deposit**, or **money created from
nothing**. A digital wallet must let users hold a balance, **top up** (card →
wallet), **pay** (wallet → merchant), and **transfer** (wallet → wallet), while
guaranteeing that **every cent is accounted for, no operation is applied twice,
and the books always balance** — even when a network call times out at the worst
possible moment. The design is built from three ideas: an **immutable
double-entry ledger**, **idempotency keys**, and a **saga** across the wallet
and the external payment gateway. The guiding principle is **correctness over
availability** — this is a **CP** system.

## 19.0 What's really being tested

- Do you reach for a **double-entry, append-only ledger** (not a mutable
`balance` column you `UPDATE`)?
- Do you make every money operation **idempotent** so a client retry (or a
gateway timeout) can never double-charge?
- Can you coordinate the wallet and an **external gateway** with a **saga +
compensation**, since you can't run one ACID transaction across them?
- Do you correctly choose **strong consistency (CP)** and explain what you give
up (availability during partitions) — and how **reconciliation** catches the
rest?
- Do you treat the ledger as the **system of record** with a full **audit trail**?

## 19.1 Clarify — requirements

**Functional**
- **Top-up** (external card/bank → wallet), **pay** (wallet → merchant),
**transfer** (wallet → wallet), **refund/reversal**, **balance** query, and a
**statement** (transaction history).
- Every state-changing call takes an **`Idempotency-Key`**.
- Multi-currency optional (state it as a stretch; keep one currency in the core).

**Out of scope:** the **fraud-detection model itself** and KYC/onboarding — though the payment
flow does call a thin **Fraud Service** for a risk check before moving money (shown in §19.3) —
and the card-network internals (we integrate a **gateway** — Stripe/Adyen — as a black box).

**Non-functional**
- **Correctness:** **no double-spend, no lost money, books always balance**
(`Σ of every transaction's entries = 0`). This dominates everything.
- **Consistency:** **strong** for balances — a successful debit is immediately
reflected; **no overdraft** past available balance.
- **Durability/audit:** the ledger is **immutable and permanent** (regulatory).
- **Availability:** high, but **correctness wins ties** — during a partition we
**refuse** rather than risk a double-spend (**CP**, not AP).

**Questions to ask:** *Single currency or FX? Are we the system of record or
fronting a bank? Allowed to hold funds (float)? What's the gateway and its
idempotency model? Required audit/retention? Synchronous authorization or
async settlement?*

## 19.2 Estimate — back-of-envelope

```
 Transactions (peak)     10,000 /s
 Ledger entries          2+ per txn → 20,000 entries/s
 Per day                 ~10k × 86,400 ≈ 8.6e8 txns; ~1.7e9 entries
 Entry size              ~200 B → ~340 GB/day of ledger
 Retention               YEARS (audit) → partition by month, archive cold,
                         keep hot only the recent window for fast reads
 Balance reads           >> writes, but reads can hit a derived cache;
                         the WRITES are the part that must be perfect
```
The numbers say: **volume is modest by web standards** (10k/s is nothing for a
feed), but **every write must be correct and kept forever**. So we optimize for
**transactional integrity and auditability**, not raw throughput — a relational,
strongly-consistent store is the right call here, not an eventually-consistent
KV.

## Whiteboard rehearsal — how you'd actually draw this live

In the room you don't reproduce the polished diagram in §19.3 below — you sketch rough
boxes and talk. So **rehearse from this first**: here is the same architecture as a **live
whiteboard sketch**, in the shorthand you'd actually use on a Google whiteboard. The colour
code is the one most candidates settle into:

> **green = client · grey = edge/LB · blue = service · red = datastore · orange = queue / stream · violet = 3rd-party**

![Payment System / Digital Wallet — whiteboard rehearsal sketch](diagrams/payment_whiteboard.svg)

**Why rehearse from the sketch, not the clean diagram?** The polished SVG in §19.3 is for
*reading*; this one is for *rehearsing*. Practise reproducing it from memory in ~4 minutes while
narrating every box out loud — that muscle memory is exactly what the interview tests. It is the
*same* components as the clean §19.3 diagram, only drawn in the loose, name-the-tool style
your hand can produce under pressure: every box names a concrete technology, each datastore is
called out in red, queues in orange, third-party vendors in violet. That visual discipline is
the signal an interviewer is looking for.

## 19.3 HLD — high-level architecture

![Payment System / Digital Wallet — high-level architecture (HLD)](diagrams/payment.svg)

**Legend:** boxes are services; a store is named inside the box.
**Block-by-block:**
- **Payment API** — the only synchronous hop; its **first act is the idempotency check** — a
  retry with the same key returns the *stored* result without moving money again.
- **Orchestrator** — runs the multi-step **saga** (because we can't wrap an external gateway call
  in our DB transaction).
- **Wallet/ledger service** — owns the **double-entry, append-only ledger** in a
  strongly-consistent SQL store; it is the **system of record**.
- **Gateway adapter** — talks to the external processor (also idempotent).
- **Outbox** (written in the *same* DB transaction as the ledger entry — Ch 24) — publishes events
  for notifications and, crucially, for the reconciliation job.
- **Reconciliation job** — compares our ledger against the gateway's settlement report and flags
  any discrepancy; that loop is the safety net that makes the whole thing trustworthy.

## 19.4 HLD — critical path walkthrough

A **card top-up** of Alice's wallet, end to end:
```
1. POST /topup { wallet:alice, amount:100.00, card, Idempotency-Key: k1 }
2. API idempotency: SELECT result WHERE idem_key=k1
      ├─ exists  → return stored result  (NO second charge)
      └─ absent  → create txn T1 state=PENDING (unique on idem_key=k1)
3. Orchestrator → Gateway.charge(card, $100, idem_key=k1)
      gateway ALSO dedupes on k1 → at-most-once external charge
4a. charge OK → post LEDGER (one ACID DB txn in the wallet):
          DEBIT  card_clearing  -100.00   T1
          CREDIT wallet:alice   +100.00   T1     (Σ = 0)
          set T1 = CONFIRMED; write OUTBOX event; store result under k1
4b. charge FAILS → T1 = FAILED; no ledger entries; return error
5. crash AFTER charge but BEFORE ledger → saga resumes: it sees the
      gateway charge succeeded (query by k1) and completes step 4a;
      if it instead decides to abort → COMPENSATE: refund the charge
6. Outbox → Kafka → notify Alice; reconciliation later matches T1 to the
      gateway's settlement line for k1
```
Every requirement maps to a step: **step 2** kills double-charges
(idempotency), **step 4a** keeps the books balanced (double-entry in one ACID
txn), **step 5** survives mid-saga crashes (resume or compensate), **step 6**
verifies reality against our records (reconciliation).

## 19.5 HLD — data model & storage choices

| Entity | Shape (key fields) | Store | Why |
|--------|--------------------|-------|-----|
| Accounts | `account_id, type, currency` | Strongly-consistent SQL | Few, critical, relational |
| **Ledger entries** | `entry_id, txn_id, account_id, amount(signed), ts` | SQL, **append-only** | Immutable audit; `balance = SUM(amount)` |
| Transactions | `txn_id, idem_key UNIQUE, state, ...` | SQL | Saga state + the dedupe key |
| Idempotency keys | `idem_key → first_result` (TTL) | Redis (dedupe) | O(1) replay guard at the edge; a retried `pay` returns the first result. The SQL `idem_key UNIQUE` is the durable backstop |
| Balances (cache) | `account_id → balance` | Derived / materialized | Fast reads; recomputable from entries |
| Outbox | `event_id, payload, published` | Same SQL DB | Atomic with ledger write (Ch 24) |
| Settlement reports | gateway files | Object store → OLAP | Reconciliation input |

**The non-negotiable:** the **ledger is append-only**. You never `UPDATE` or
`DELETE` an entry; a correction is a **new reversing entry**. That gives a
perfect, permanent audit trail and makes the balance a pure function of history.

## 19.6 HLD — scaling & bottlenecks

- **Shard by account/user** so each user's ledger lives on one shard and a debit
+ credit *within the same user's transactions* stay simple. Cross-shard
transfers (Alice on shard A → Bob on shard B) use the **saga**, not a
cross-shard ACID transaction.
- **Hot account** (a popular merchant receiving thousands of payments/sec):
serialize writes to that account, or split incoming credits into **sub-ledgers**
that roll up — credits commute (addition), so this is safe.
- **Balance reads** scale via the derived **balance cache / materialized view**;
the **authoritative** number is always `SUM(entries)`, recomputable on demand.
- **Throughput is not the hard part** at 10k/s; **write correctness and lock
contention on hot accounts** are. Keep transactions short; use row-level locks
or optimistic concurrency (Ch 24) on the debited account.

## 19.7 HLD — failure modes & trade-offs

```
What dies / happens          →  What we do
─────────────────────────────────────────────────────────────────────
Client retries after timeout →  idempotency key → return stored result;
                                money moves exactly once
Gateway times out (unknown!) →  treat as UNKNOWN, not failure: re-query by
                                idem_key; never blindly retry a charge
Crash mid-saga               →  saga is durable; on restart, resume from
                                last committed step or run compensation
DB partition / replica lag   →  REFUSE the write (CP) rather than risk a
                                double-spend; availability yields to safety
Ledger ≠ gateway report      →  reconciliation flags it → manual/auto repair
                                via a reversing entry; nothing lost
```
**Trade-offs called out:** we pick **CP over AP** deliberately — during a
partition we'd rather **return an error than process a payment we can't
guarantee**. We accept **higher write latency** (strong consistency, single
authoritative shard per account) as the price of correctness. We use
**at-least-once + idempotency** for *messaging*, but the **ledger insert itself
is exactly-once** via the unique idempotency key. Reconciliation gives us
**eventual proof** that our records match the money's real movement.

## 19.8 LLD (the crux) — idempotent ledger entry + the saga

Two ideas carry the entire design: the **idempotent double-entry posting**, and
the **saga** that spans the external gateway.

**Double-entry, in one picture.** Every transaction writes entries that **sum to
zero** — money is conserved, never created:
```
txn T1 — "Alice pays Bob $30"
 ┌──────────────────┬──────────┬──────┐
 │ account          │  amount  │ txn  │
 ├──────────────────┼──────────┼──────┤
 │ wallet:alice     │  -30.00  │ T1   │   debit  (money leaves)
 │ wallet:bob       │  +30.00  │ T1   │   credit (money arrives)
 └──────────────────┴──────────┴──────┘
                      Σ = 0  ← invariant checked on every commit
 balance(x) = SUM(amount) WHERE account = x          (pure function)
 APPEND-ONLY: a mistake is fixed by a NEW reversing entry, never an UPDATE.
```

**The idempotent posting** — one ACID transaction, dedupe via a **unique
constraint**, balance-protected:
```sql
BEGIN;                                  -- single-DB ACID transaction
-- 1. Claim the idempotency key. The UNIQUE(idem_key) makes a retry a no-op.
INSERT INTO transactions(txn_id, idem_key, state)
     VALUES (:tid, :k1, 'PENDING')
     ON CONFLICT (idem_key) DO NOTHING;
-- if 0 rows inserted → this key was already processed:
--     SELECT and RETURN the existing result   (idempotent, no re-post)

-- 2. Guard against overdraft (no negative balance) BEFORE debiting:
--     SELECT balance FROM balances WHERE account=:from FOR UPDATE;
--     if balance < :amount  → ROLLBACK, return INSUFFICIENT_FUNDS

-- 3. Post the two balanced entries atomically:
INSERT INTO ledger_entries(txn_id, account, amount) VALUES
     (:tid, :from, -:amount),         -- debit
     (:tid, :to,   +:amount);         -- credit   (Σ = 0)

-- 4. Write the OUTBOX event in the SAME transaction (atomic publish):
INSERT INTO outbox(payload) VALUES (:event);
UPDATE transactions SET state='CONFIRMED' WHERE txn_id=:tid;
COMMIT;                                 -- all-or-nothing
```
Why this is the crux: the **unique idempotency key** turns "process this
payment" into an operation safe to retry **any number of times** — the second
attempt inserts zero rows and returns the first result. The **two entries in one
ACID commit** keep the books balanced atomically. The **outbox in the same
transaction** means we never "move money but fail to publish the event" (or vice
versa) — the event and the ledger commit or roll back together (Ch 24).

**The saga across the gateway.** We can't put an external HTTP charge inside our
DB transaction, so a multi-service money flow is a **saga**: a sequence of local
transactions, each with a **compensation**:
```
 PENDING ──charge OK──▶ CHARGED ──post ledger OK──▶ CONFIRMED
    │                      │
    │ charge FAIL          │ ledger FAIL (rare)
    ▼                      ▼
  FAILED            COMPENSATE: refund the gateway charge ─▶ FAILED
```
Each step is **idempotent and durable**; on crash the orchestrator **re-drives**
from the last committed step. The key discipline: order steps so the
**hardest-to-undo step is last**, and treat a gateway **timeout as UNKNOWN** —
re-query by idempotency key rather than firing a second charge. (Saga + outbox:
Ch 24.)

## 19.9 Follow-ups, red flags & building blocks

**Likely follow-ups:**
- *"Why not just an `UPDATE balance` column?"* — it loses history, races under
concurrency, and has no audit trail. The ledger **is** the balance.
- *"How do you prevent double-charge on retry?"* — idempotency key with a unique
constraint at the API *and* a matching key passed to the gateway.
- *"Cross-currency / cross-bank transfer?"* — saga with an FX step; each leg is
its own balanced posting; compensations reverse partial progress.
- *"How do you know it's right?"* — **reconciliation**: nightly compare ledger
totals to the gateway/bank settlement; any drift becomes a flagged reversing
entry. Plus the invariant `Σ entries = 0` checked continuously.
- *"Exactly-once?"* — the **ledger insert is exactly-once** (unique key);
messaging around it is at-least-once + idempotent consumers.

**Red flags that sink candidates:** a mutable `balance` column instead of a
ledger; no idempotency (the classic double-charge); choosing an
eventually-consistent store for balances; running the external charge *inside*
a DB transaction (impossible) or with no compensation; retrying a charge on
timeout without re-querying (double-charge); forgetting an audit trail; picking
AP "for availability" on money.

**Building blocks reused:** saga + compensation, outbox + CDC, exactly-once
nuance — **Ch 24**; idempotency keys — **Ch 25**; ACID, isolation levels,
optimistic vs pessimistic locking, append-only logs — **Ch 24**; CAP/PACELC
(why CP here) — **Ch 23/24**; reconciliation & audit — **Ch 25**.

---

# CASE STUDY 20 — E-COMMERCE INVENTORY / FLASH SALE

> **Google priority:** ★★ · **Difficulty:** Hard · **Frequency:** Common · **Time budget:** ~30 min

> **User story —** *As a* shopper in a flash sale, *I want* a fair shot at the limited stock with
> no overselling, *so that* if the site says I got one, I actually get it.
>
> **For example —** 1 M people tap "Buy" on 100 PlayStations at midnight; an atomic Redis decrement
> hands out exactly 100 reservations and a waiting room sheds the rest — unit #101 is never sold.
>
> **Why it matters —** the entire problem is making "check stock and decrement" one atomic op on a
> single hot SKU under brutal contention, then holding stock just long enough to pay.

A **flash sale** — 1,000 PlayStations at midnight, a concert on-sale, a
Black-Friday doorbuster — is a **concurrency stress test disguised as shopping**.
A million people press "Buy" in the same second on a product with **100 units in
stock**. The one thing you absolutely cannot do is **oversell**: sell unit #101.
The whole problem is making "**check stock and decrement it**" a single
**atomic** operation under brutal contention, then holding stock just long enough
for the buyer to pay.

## 20.1 Clarify & estimate

- **Functional:** reserve stock at checkout, **confirm** on payment, **release**
  if payment fails or times out; never sell more than `available`.
- **The hard requirement:** **no oversell** under massive concurrency; some
  **under-sell** (a few reserved-but-abandoned units freed late) is tolerable.
- **Flash-sale shape:** huge **read** spike (everyone browsing) + a thundering
  **write** spike on **one hot SKU** (everyone buying the same item).
- **Estimate:** 1 M concurrent buyers, **100 units**. ~1 M checkout attempts in
  seconds → all hitting **one counter**. → must be a single in-memory atomic op
  (Redis), not a contended DB row; and a **waiting room** to shed the flood.

## Whiteboard rehearsal — how you'd actually draw this live

In the room you don't reproduce the polished diagram in §20.2 below — you sketch rough
boxes and talk. So **rehearse from this first**: here is the same architecture as a **live
whiteboard sketch**, in the shorthand you'd actually use on a Google whiteboard. The colour
code is the one most candidates settle into:

> **green = client · grey = edge/LB · blue = service · red = datastore · orange = queue / stream · violet = 3rd-party**

![E-commerce Inventory / Flash Sale — whiteboard rehearsal sketch](diagrams/inventory_whiteboard.svg)

**Why rehearse from the sketch, not the clean diagram?** The polished SVG in §20.2 is for
*reading*; this one is for *rehearsing*. Practise reproducing it from memory in ~4 minutes while
narrating every box out loud — that muscle memory is exactly what the interview tests. It is the
*same* components as the clean §20.2 diagram, only drawn in the loose, name-the-tool style
your hand can produce under pressure: every box names a concrete technology, each datastore is
called out in red, queues in orange, third-party vendors in violet. That visual discipline is
the signal an interviewer is looking for.

## 20.2 HLD — architecture + flow

![E-commerce Inventory / Flash Sale — high-level architecture (HLD)](diagrams/inventory.svg)

**Block-by-block:**
- **Virtual waiting room** — the pressure valve: it admits a controlled rate of users and tells
  the rest to wait, so the inventory service never sees a million simultaneous writes.
- **Inventory API** — does the one thing that must be perfect: an **atomic reserve-decrement** on
  a **Redis counter** (fast, single-threaded → naturally serialized). A successful reserve creates
  a **time-boxed reservation** (TTL) so stock is held only while the buyer pays.
- **Order outcome** — **payment success** persists a durable order; **timeout** releases the unit back.
- **Apache Kafka** — each confirmed order **emits order events** for fulfillment, analytics, and **reconciliation**.
- **Durable DB** — the source of truth for orders and final stock, reconciled asynchronously with the Redis counter.

**Numbered flow:** (1) queue → (2) admit → (3) atomic DECR → (4) reserve with TTL → (5) pay or
release → (6) order events (Kafka).

## 20.3 The crux — atomic reserve-decrement (preventing oversell)

Oversell happens when two requests both **read** "1 left," both decide "OK," and
both **decrement** — a read-modify-write race. The fix is to make the **check and
the decrement one atomic step**. Two correct implementations:

```
  (A) REDIS atomic counter (best for a hot flash-sale SKU)
      local n = redis.call('DECRBY', 'stock:'..sku, qty)
      if n < 0 then
          redis.call('INCRBY', 'stock:'..sku, qty)   -- undo the overshoot
          return 0                                    -- SOLD OUT
      end
      return 1                                        -- reserved
      -- Redis is single-threaded → no two clients interleave this script.
      -- then: SET reservation:{order} EX 300         -- hold 5 minutes

  (B) SQL conditional update (best for normal inventory)
      UPDATE inventory SET available = available - :qty
      WHERE  sku = :sku AND available >= :qty;        -- atomic check+dec
      -- affected rows = 1 → success;  0 → not enough stock (no oversell)
      -- the WHERE clause + row lock make the check and write indivisible
```
Both share the pattern: **the condition (`>= qty`) and the decrement live in one
atomic operation**, so the last unit can be sold **once**. The **reservation
TTL** is the second half — it holds stock during payment, then **auto-releases**
on timeout (so an abandoned cart doesn't permanently lock a unit). Final truth is
**reconciled** to the durable DB: Redis is the fast front-line counter; the DB
records committed orders, and a background job heals any drift (e.g. crediting
back units from reservations that expired without release).

## 20.4 Trade-offs, red flags & building blocks

- **Redis counter vs DB row:** for a **single hot SKU** under a flash sale,
  Redis's single-threaded atomic ops beat a contended DB row (which would
  serialize on a lock and queue thousands of waiters). For ordinary catalog
  inventory, the **SQL conditional update** is simpler and durable.
- **Reserve→confirm vs decrement-at-payment:** reserving up front prevents
  oversell during checkout but can **under-sell** if reservations expire slowly;
  tune the TTL. Decrementing only at payment risks two buyers paying for the
  last unit.
- **Waiting room** converts a write *stampede* into a *steady stream* — the same
  admission-control idea as rate limiting (Ch 23).
- **Red flags:** read-then-write without atomicity (the oversell bug); locking
  the whole inventory table; no reservation timeout (units leak); trusting only
  Redis with no durable order record (a Redis crash loses orders); no
  reconciliation between cache counter and DB.
- **Building blocks:** atomic ops & pessimistic/optimistic locking — **Ch 24**;
  Redis Lua atomicity — **Ch 23/24**; admission control / queueing — **Ch 23**;
  idempotency on the order create — **Ch 25**.

---

# CASE STUDY 21 — DISTRIBUTED KEY-VALUE STORE (Dynamo-style)

> **Google priority:** ★★ · **Difficulty:** Hard · **Frequency:** Common · **Time budget:** ~35 min

> **User story —** *As a* service needing massive, always-writable storage, *I want* a key-value
> store that stays up and low-latency even during failures, *so that* a shopping cart never rejects
> a write.
>
> **For example —** during a network partition, a `put` still succeeds on the reachable replicas;
> conflicting versions are reconciled later with version vectors and read-repair.
>
> **Why it matters —** it's the canonical AP design — consistent hashing + tunable quorums (W+R>N)
> + conflict resolution assembled into one horizontally-scalable store.

"Design a key-value store like **Amazon Dynamo / Cassandra**" is the canonical
**distributed-systems** interview — it forces you to assemble consistent hashing,
replication, quorums, conflict resolution, and failure handling into one
**always-writable**, horizontally-scalable store. The defining choice is at the
opposite end from the payment system: Dynamo picks **AP** — it stays **available
and low-latency even during partitions**, and resolves the resulting
inconsistencies afterward. The interview lives in **how** it does that:
**tunable quorums** and **conflict resolution**.

## 21.1 Clarify & estimate

- **Functional:** `get(key)` / `put(key, value)` only — no joins, no
transactions. Massive scale, single-digit-ms latency, always writable.
- **Consistency:** **tunable** per request via N/W/R; default **eventual**
("a shopping cart should never reject a write").
- **Out of scope:** range scans, secondary indexes (a different data model),
strong multi-key transactions (that's NewSQL/Spanner).
- **Estimate:** 1 M ops/s, 10 TB of data, replication factor **N = 3** → 30 TB
stored. Spread across nodes of ~1 TB → ~30–40 nodes; consistent hashing keeps
each node's share ≈ `1/nodes` and resharding cheap.

## Whiteboard rehearsal — how you'd actually draw this live

In the room you don't reproduce the polished diagram in §21.2 below — you sketch rough
boxes and talk. So **rehearse from this first**: here is the same architecture as a **live
whiteboard sketch**, in the shorthand you'd actually use on a Google whiteboard. The colour
code is the one most candidates settle into:

> **green = client · grey = edge/LB · blue = service · red = datastore · orange = queue / stream · violet = 3rd-party**

![Distributed Key-Value Store (Dynamo-style) — whiteboard rehearsal sketch](diagrams/kv_store_whiteboard.svg)

**Why rehearse from the sketch, not the clean diagram?** The polished SVG in §21.2 is for
*reading*; this one is for *rehearsing*. Practise reproducing it from memory in ~4 minutes while
narrating every box out loud — that muscle memory is exactly what the interview tests. It is the
*same* components as the clean §21.2 diagram, only drawn in the loose, name-the-tool style
your hand can produce under pressure: every box names a concrete technology, each datastore is
called out in red, queues in orange, third-party vendors in violet. That visual discipline is
the signal an interviewer is looking for.

## 21.2 HLD — architecture + flow

![Distributed Key-Value Store (Dynamo-style) — high-level architecture (HLD)](diagrams/kv_store.svg)

**Block-by-block:**
- **No leader** — any node can **coordinate** a request, which is why the store stays available.
- **Consistent hashing + virtual nodes** (Ch 24) — place keys; each key's **preference list** is
  the next **N** nodes clockwise (its replicas).
- **Quorum reads/writes** — a **PUT** is sent to all N but only waits for **W** acks; a **GET**
  asks all N but waits for **R**.
- **Gossip** — spreads membership and failure detection without a central registry.
- **Failure handling** — when a replica is down, **hinted handoff** parks its writes on a stand-in
  (sloppy quorum) for later replay, and **anti-entropy** (Merkle trees) reconciles replicas in the background.

**Numbered flow:** (1) client → any coordinator; (2) hash key → preference list of N; (3) write
waits for W acks / read waits for R responses; (4) read-repair fixes any stale replica it noticed.

## 21.3 The crux — quorum N/W/R + conflict resolution

**Tunable consistency via quorum overlap.** With **N** replicas, requiring
**W** write-acks and **R** read-responses such that **W + R > N** forces the
read set and write set to **share at least one replica** — so a read is
guaranteed to see the latest acknowledged write:

```
 N = 3 replicas of key "cart:alice".   Choose W = 2, R = 2.   W+R = 4 > 3.
 PUT v2 → waits for 2 acks            GET → reads from 2 replicas
 ┌────────┬────────┬────────┐
 │  R1    │  R2    │  R3    │
 │  v2 ✓  │  v2 ✓  │  v1    │   write acked by R1,R2; R3 not yet updated
 └────────┴────────┴────────┘
 read picks any 2, say {R2,R3}:  sees v2 (R2) and v1 (R3) → returns v2
     (newest), and READ-REPAIRS R3 → v2.   The overlap node (R2) is the
     guarantee: every read set of size 2 intersects the write set of size 2.
 Tuning:  W=1,R=1 (W+R=2≤3) → fast, may read stale (eventual).
          W=3,R=1 → durable slow writes, fast reads.   Pick per operation.
```
**Conflict resolution — what happens on *concurrent* writes.** During a
partition, two clients can both write the same key on different replicas →
**two versions that aren't ordered**. Dynamo detects this with **vector clocks**
(version vectors): if neither version's clock dominates, they're **concurrent
siblings**, and the store either applies **last-write-wins** (simple, can lose a
write) or **returns both siblings for the application to merge** (e.g. union two
shopping carts):
```
 vector clock = per-node counters.   A=[2,0,0]  vs  B=[0,1,0]
 neither ≤ the other  →  CONCURRENT  →  conflict (siblings)
 resolution: LWW (by timestamp)  OR  app-level merge (semantic, e.g.
 "union the carts")  →  then write back a reconciled version.
```
The senior point: **quorum gives you a consistency *dial*** (W+R>N for strong-ish
reads, lower for speed), and **conflict resolution is unavoidable in an AP store**
— you either lose data (LWW) or push merge logic to the app (vector clocks).

## 21.4 Trade-offs, red flags & building blocks

- **AP by design:** always writable, eventually consistent. The opposite call
from the payment ledger (CS19, CP) — name the contrast in the interview.
- **W+R>N ≠ linearizable:** quorum reads see the latest *acked* write, but
**sloppy quorum + hinted handoff** (for availability) can break the strict
guarantee — be honest that it's "strong-ish," not linearizable.
- **Conflict cost:** LWW silently drops writes (fine for caches, bad for carts);
vector clocks preserve everything but push complexity to the client.
- **Red flags:** `hash % N` instead of consistent hashing; a single leader
(kills the availability story); ignoring concurrent-write conflicts; claiming
exactly-once or linearizable while also offering sloppy quorum; no
anti-entropy/read-repair (replicas drift forever).
- **Building blocks:** consistent hashing + vnodes, quorum N/W/R, vector clocks,
gossip, hinted handoff, Merkle anti-entropy, CAP/PACELC — all **Ch 24**;
LSM-tree/WAL storage engine under each node — **Ch 24**.

---

# CASE STUDY 22 — PASTEBIN

> **Google priority:** ★ · **Difficulty:** Easy · **Frequency:** Common · **Time budget:** ~20 min

> **User story —** *As a* user, *I want* to paste text and share a short link anyone can read —
> optionally expiring or view-once — *so that* I can hand off code or notes quickly.
>
> **For example —** I paste a 10 KB log, get `pb.cc/aZ3k`, set it to expire in a day; the blob goes
> to object storage and only the metadata (key → blob, TTL) sits in the DB.
>
> **Why it matters —** it's the URL shortener with a text blob instead of a redirect — reuse that
> design and isolate the big blob from the metadata.

Pastebin is **"a URL shortener whose value is a blob of text instead of a
redirect."** You paste code/text, get a short link, and anyone with the link can
read it — optionally with an **expiry** or a **view-once** rule. Almost
everything you need is already designed in the **URL shortener (Ch 36)** — reuse
it and only call out the deltas.

## 22.1 Clarify & estimate

- **Functional:** create a paste (text, optional TTL, optional view-once,
optional syntax highlight); read a paste by short key; expire automatically.
- **Deltas vs URL shortener:** the stored value is a **text blob (KBs–MBs)**,
not a 100-byte URL → put the blob in **object storage**, keep only metadata in
the DB. Read-heavy, like the shortener.
- **Estimate:** 10 M pastes/day ≈ **120 writes/s**; reads ~10× → ~1,200/s. Avg
paste 10 KB → 10 M × 10 KB = **100 GB/day** of blobs → object store + CDN, not
a row in SQL.

## Whiteboard rehearsal — how you'd actually draw this live

In the room you don't reproduce the polished diagram in §22.2 below — you sketch rough
boxes and talk. So **rehearse from this first**: here is the same architecture as a **live
whiteboard sketch**, in the shorthand you'd actually use on a Google whiteboard. The colour
code is the one most candidates settle into:

> **green = client · grey = edge/LB · blue = service · red = datastore · orange = queue / stream · violet = 3rd-party**

![Pastebin — whiteboard rehearsal sketch](diagrams/pastebin_whiteboard.svg)

**Why rehearse from the sketch, not the clean diagram?** The polished SVG in §22.2 is for
*reading*; this one is for *rehearsing*. Practise reproducing it from memory in ~4 minutes while
narrating every box out loud — that muscle memory is exactly what the interview tests. It is the
*same* components as the clean §22.2 diagram, only drawn in the loose, name-the-tool style
your hand can produce under pressure: every box names a concrete technology, each datastore is
called out in red, queues in orange, third-party vendors in violet. That visual discipline is
the signal an interviewer is looking for.

## 22.2 HLD — architecture + flow

![Pastebin — high-level architecture (HLD)](diagrams/pastebin.svg)

**Block-by-block:**
- **Write API** — mints a **short key** (same options as the shortener: hash+base62, counter, or a
  Snowflake id — CS14), stores the **text blob in object storage** (S3/GCS, fronted by a CDN for
  hot pastes), and writes **metadata** (`key → blob_url, expiry, view_once`) to a KV/SQL store plus cache.
- **Read** — resolves the key in metadata (cache-first), checks **expiry/view-once**, then streams
  the blob from the CDN/object store.
- **TTL sweep** — a background job (or object-store lifecycle rule) deletes expired blobs.

**Flow:** (1) gen key → (2) blob to object store → (3) meta to DB → (4–6) read path with expiry check.

## 22.3 The crux — reuse the shortener; isolate the blob

The only genuinely new idea over the URL shortener is **separating metadata from
payload**: the hot path resolves a tiny **`key → metadata`** record (cacheable,
KV-fast), and the large **text blob lives in object storage + CDN** so your
database never stores or serves multi-KB bodies. **View-once** is an
**atomic delete-on-read**: fetch-and-mark-consumed in one step (a conditional
delete) so two simultaneous readers can't both see a one-time paste. **Expiry**
is just a TTL on the metadata plus an object-store lifecycle policy on the blob.

## 22.4 Trade-offs, red flags & building blocks

- **Don't store big text in SQL:** blobs belong in object storage; the DB holds
only metadata and the key index.
- **Key generation** is the shortener's trade-off (counter vs hash vs Snowflake)
— see Ch 36; collisions handled the same way.
- **Red flags:** putting MB blobs in a relational row; no CDN for popular pastes;
non-atomic view-once (race lets two readers see it); forgetting expiry cleanup
(storage grows forever).
- **Building blocks:** URL shortener design (key gen, KV lookup, redirect→fetch)
— **Ch 36**; object storage + CDN — **Ch 23/24**; Snowflake ids — **CS14**;
cache-aside + TTL — **Ch 23**.

---

# CASE STUDY 23 — E-COMMERCE PLATFORM (Amazon / Flipkart)

> **Google priority:** ★★ · **Difficulty:** Hard · **Frequency:** Common · **Time budget:** ~45 min

> **User story —** *As a* shopper, *I want* to browse fast and check out reliably, *so that* pages
> never go blank and my order is always right about price, stock, and payment.
>
> **For example —** a flaky back-end shows me a slightly stale price (better than a blank page) on
> the browse plane, while checkout refuses to oversell or double-charge on the order plane.
>
> **Why it matters —** the capstone is recognizing "AP on the way in, CP at the till" and composing
> designs you've already built (search, recsys, inventory, payment, notifications).

This is the **capstone** — not one hard idea but **a dozen wired together**. An
e-commerce platform is really **two products glued at the cart**: a
**browse/search experience** that must stay **fast and always-on** even when a
back-end is flaky (better to show a slightly stale price than a blank page), and
a **checkout/order pipeline** that must be **exactly right** about money and
stock (better to reject a click than to oversell or double-charge). The whole
interview is recognizing that split — **AP on the way in, CP at the till** — and
then **assembling designs you've already built** (search CS5, recommendations
F3, inventory CS20, payment CS19, notifications Ch35-CS1) instead of re-deriving
them. The two genuinely new pieces are a **document-store catalog** for
polymorphic products and a **serviceability/TAT** service that precomputes "can
we deliver here, and by when?"

## 23.0 What's really being tested

- Do you split the system into a **read/browse plane (AP, low-latency)** and a
  **write/order plane (CP, correct)** — and justify CAP on each?
- Do you reach for a **document DB** for a **polymorphic catalog** (every
  category has different attributes) instead of forcing it into a wide, sparse
  relational table?
- Can you **compose prior designs** — autocomplete/search (CS5), recommendations
  (F3), inventory/oversell (CS20), payment/saga (CS19), notifications
  (Ch35 CS1) — rather than rebuilding each from scratch?
- Do you push expensive, slow-changing work **offline/precomputed** — search
  indexing, recommendations, and **delivery serviceability/ETA** — so the hot
  path stays cheap?
- Do you keep the **OLTP order DB small** with **hot/cold tiering** (terminal
  orders archived to Cassandra) and still serve full order history?

## 23.1 Clarify — requirements

**Functional**
- **Browse/search:** home feed, category browse, **typeahead** + full-text
  search, a product detail page (PDP) with price, attributes, availability,
  **delivery ETA for my pincode**, and **recommendations** ("you may also like").
- **Cart & checkout:** add to cart, **reserve stock**, **pay**, place an order;
  **order tracking** + history; **notifications** on every status change.
- **Catalog ingest:** suppliers/sellers onboard catalogs in bulk, which flow
  into search and the PDP.

**Out of scope** (say it to show focus): seller-side analytics, ads ranking,
returns/RMA internals, fraud scoring (a separate approve-before-pay system — as
in CS19), and the warehouse-management system itself (we *consume* its data).

**Non-functional**
- **Browse plane:** **AP, low latency** — PDP and search render in **< 200 ms**
  and stay up under load; a **slightly stale** price/stock is acceptable (we
  re-validate at checkout).
- **Order plane:** **CP, correct** — **no oversell, no double-charge**; money and
  stock are authoritative.
- **Scale:** catalog ~**500 M items**; **100 M DAU**; read:write ≈ **100:1**
  (browsing dwarfs buying).
- **Availability:** browse 99.99%; checkout favors **correctness over
  availability** during a partition.

**Questions to ask:** *Marketplace (many sellers) or first-party? Single region
or global? Stock per-warehouse or global? Do we own logistics or integrate a
3PL? How fresh must price/stock be on the PDP?*

## 23.2 Estimate — back-of-envelope

```
 DAU                  100 M; ~10 page views each → 1 B views/day ≈ 12k/s
 Peak (sale events)   ~10×  → ~120k/s reads on browse/search
 Orders               ~1% of sessions convert → ~10 M orders/day ≈ 120/s
                      flash-sale bursts → 10k+ checkout attempts/s on ONE SKU
 Catalog              500 M items × ~2 KB doc ≈ 1 TB catalog (document store)
 Search index         500 M docs → sharded Elasticsearch (tens of shards)
 Read : Write         ≈ 100 : 1 → cache + CDN the browse plane hard
 Order DB (hot)       keep only OPEN orders in MySQL; archive terminal ones
                      10 M/day terminal → Cassandra archive grows; OLTP stays small
```
The numbers say it plainly: **browsing is a caching/search problem at 100k+/s**,
**ordering is a correctness problem at a modest ~120/s** (with vicious **per-SKU
bursts**), and the **catalog + history are storage-tiering problems**. Optimize
each plane for its own bottleneck — do not let one model dominate.

## Whiteboard rehearsal — how you'd actually draw this live

In the room you don't reproduce the polished diagram in §23.3 below — you sketch rough
boxes and talk. So **rehearse from this first**: here is the same architecture as a **live
whiteboard sketch**, in the shorthand you'd actually use on a Google whiteboard. The colour
code is the one most candidates settle into:

> **green = client · grey = edge/LB · blue = service · red = datastore · orange = queue / stream · violet = 3rd-party**

![E-commerce Platform (Amazon / Flipkart) — whiteboard rehearsal sketch](diagrams/amazon_whiteboard.svg)

**Why rehearse from the sketch, not the clean diagram?** The polished SVG in §23.3 is for
*reading*; this one is for *rehearsing*. Practise reproducing it from memory in ~4 minutes while
narrating every box out loud — that muscle memory is exactly what the interview tests. It is the
*same* components as the clean §23.3 diagram, only drawn in the loose, name-the-tool style
your hand can produce under pressure: every box names a concrete technology, each datastore is
called out in red, queues in orange, third-party vendors in violet. That visual discipline is
the signal an interviewer is looking for.

## 23.3 HLD — high-level architecture

![E-commerce Platform (Amazon / Flipkart) — high-level architecture (HLD)](diagrams/amazon.svg)

**Legend:** boxes are services; the store is named inside. A dashed line splits
the **AP browse plane** (top) from the **CP order plane** (bottom).

**Block-by-block:**
- **API Gateway / BFF** — auth, rate-limit (CS13), routes browse vs order planes.
- **Catalog / Item service → MongoDB (document store)** — owns the
  **polymorphic** product documents and serves the PDP. Document store because a
  *shirt* (size, fabric, color) and a *TV* (screen-size, resolution, weight)
  share almost no attributes (see 23.5).
- **Inbound / Supplier-onboarding service** — ingests seller catalogs in bulk,
  validates, writes the catalog document, and **emits an event to Kafka**.
- **Search-indexer consumer** — reads Kafka, **formats** each item into a search
  doc, and writes it to **Elasticsearch**; the **Search/Autocomplete service**
  (reuse **CS5**) serves typeahead + full-text.
- **Recommendation service** — a **two-tower → ranking funnel** (reuse **F3**),
  with candidates/features built **offline** by a **Hadoop** batch pipeline and
  **near-real-time** by **Spark Streaming** over the click/order event stream.
- **Serviceability / TAT service** — answers "**do we deliver to this pincode,
  and by when?**" from **precomputed** warehouse × pincode × logistics tables
  (see 23.6/23.8); read on the PDP, **never** computed on the hot path.
- **Cart + Order-Taking Service** (cart held in Redis, persisted to **MySQL**) — the
  order-plane entry point.
- **Inventory service** — **atomic reserve-decrement** with a `quantity >= 0`
  constraint + reservation TTL (reuse **CS20**).
- **Payment service** — idempotent ledger + saga across the gateway (reuse
  **CS19**), including the **order-expiry-vs-payment-success race**.
- **Order-processing / fulfillment** — the post-payment workflow; on a terminal
  state the **Archival service** moves the order MySQL → **Cassandra**, and the
  **Historical-Order service** serves reads over that archive.
- **Notification service** (reuse **Ch35 CS1**) — order-status updates (placed,
  shipped, delivered).

## 23.4 HLD — critical path walkthrough

Two flows, because the platform is two products. **Flow A is AP** (stay fast,
tolerate staleness); **Flow B is CP** (be correct, tolerate rejection).

**A — Search / browse (availability-first):**
```
1. GET /search?q="running sho"  → Autocomplete (CS5) suggests from Elasticsearch
2. user picks a query → Search service → ES returns ranked item ids (AP, cached)
3. GET /pdp/{item} → Catalog svc reads the MongoDB document (cache-first)
4. PDP enriches IN PARALLEL — all best-effort, degrade gracefully:
      ├─ Serviceability/TAT: ETA for user's pincode   (PRECOMPUTED O(1) lookup)
      ├─ Recommendations: "you may also like"          (F3, served from cache)
      └─ price/stock badge: "In stock" (may be slightly STALE — re-checked in B)
5. render < 200 ms; any failed enrichment is omitted, the page still loads
```

**B — Checkout / order (consistency-first):**
```
1. POST /checkout {cart, Idempotency-Key} → Order-taking svc (MySQL, ACID)
      create order = PENDING_PAYMENT
2. Inventory.reserve(sku, qty):  atomic  UPDATE ... SET q = q - :qty
                                         WHERE sku=:sku AND q >= :qty   (CS20)
      0 rows → SOLD OUT → fail fast;  else stock reserved with a TTL
3. Payment.charge(Idempotency-Key) → saga across the gateway (CS19)
      ├─ success → order = CONFIRMED; commit reservation (stock truly gone)
      └─ fail/timeout → release reservation; order = FAILED
4. RACE: reservation TTL expires AT THE SAME TIME payment succeeds
      → payment wins → COMPENSATE: refund the charge (CS19), or re-acquire
        stock if still available; NEVER keep money without stock
5. Order-processing → on terminal state (DELIVERED/CANCELLED):
      Archival svc moves the order MySQL → Cassandra; Notification (Ch35 CS1) fires
```
Each step maps to a reused design: **B2 = CS20** (no oversell), **B3/B4 = CS19**
(idempotent saga + compensation), **B5 = archival tiering + Ch35 CS1**.

## 23.5 HLD — data model & storage choices

| Entity | Shape (key fields) | Store | Why |
|--------|--------------------|-------|-----|
| **Catalog item** | `item_id, category, {polymorphic attrs}, seller_id, price` | **MongoDB (document)** | Attributes vary per category — shirt≠TV; sparse-wide SQL is painful |
| Search doc | `item_id, title, tokens, facets, price, popularity` | **Elasticsearch** | Inverted index for typeahead + full-text (CS5) |
| Serviceability/TAT | `(warehouse, pincode) → reachable?, eta_days` | KV / read-replica | **Precomputed** offline; O(1) PDP lookup |
| Cart | `user_id → [items]` | Redis / KV | Ephemeral, fast, AP |
| **Order (hot)** | `order_id, user, items, state, total` | **MySQL (ACID)** | Open orders need transactions + strong consistency |
| Inventory | `sku → available CHECK(≥0), reservations` | SQL row / Redis counter | Atomic decrement, no oversell (CS20) |
| Payment ledger | `entry_id, txn_id, account, amount` | SQL, append-only | Double-entry, idempotent (CS19) |
| **Order (cold)** | terminal orders, denormalized | **Cassandra** | Write-once history, huge volume, cheap; keeps OLTP small |
| Recsys features | user × item × context | Feature store (offline+online) | Funnel + skew-free serving (F3) |

**The catalog call-out:** products are **polymorphic** — a *shirt* document
carries `{size, fabric, color, fit}`, a *TV* carries
`{screen_size, resolution, weight, panel}`. Forcing this into one relational
table yields a **sparse forest of nullable columns** (or an EAV anti-pattern); a
**document store** lets each item carry exactly its own schema, indexed
per-field, and evolved per category **without migrations**.

## 23.6 HLD — scaling & bottlenecks

- **Browse plane is ~100× the traffic** — cache aggressively: **CDN** for
  assets/images, **edge + app cache** for PDP documents and search results,
  precomputed recommendations. Catalog reads are cache-served; MongoDB is the
  cache-miss fallback, not the hot path.
- **Search** scales by **sharding Elasticsearch** by item and replicating for
  query throughput; indexing is **async off Kafka**, so a supplier bulk-upload
  never blocks live queries.
- **Serviceability/TAT** is **precomputed offline** (warehouse × pincode is a
  huge but slow-changing matrix) and served as an O(1) lookup; recomputing per
  request against a routing engine would blow the latency budget.
- **Order plane** is small in QPS but has **per-SKU write hotspots** during sales
  — handle with the **CS20** Redis-counter + waiting-room pattern, not a
  contended MySQL row.
- **Order-DB growth** is the silent killer: 10 M terminal orders/day would bloat
  MySQL and slow every OLTP query. **Hot/cold tiering** (23.8) keeps only **open**
  orders hot; history goes to **Cassandra**.
- **Recsys** offline (Hadoop) pipelines are cheap-but-stale; **Spark Streaming**
  keeps last-clicks fresh — both feed one feature store (F3).

## 23.7 HLD — failure modes & trade-offs

```
What dies / happens             →  What we do
──────────────────────────────────────────────────────────────────────
Catalog/Mongo slow or down      →  serve PDP from cache (stale-OK, AP);
                                    re-validate price/stock only at checkout
Search/ES cluster degraded      →  fall back to category browse / cached
                                    results; browsing never hard-fails
Recsys/TAT enrichment fails     →  OMIT the widget; PDP still renders (best-effort)
Inventory race (two buyers)     →  atomic check+decrement (CS20); last unit sold once
Reservation TTL vs payment-OK   →  payment wins → COMPENSATE: refund OR re-acquire
                                    stock; never money-without-stock (CS19)
Payment gateway timeout         →  UNKNOWN, not failure: re-query by idem-key (CS19)
Order DB bloats                 →  Archival service tiers terminal orders → Cassandra
Notification backlog            →  async queue; retries; non-blocking (Ch35 CS1)
```
**Trade-offs called out:** we deliberately run **two consistency regimes** —
**AP** on browse (a stale price is cheaper than downtime, and we *re-check at
checkout*) and **CP** at the till (reject before oversell/double-charge). We
accept **read-your-writes lag** on the catalog as the price of cache hit-rate. We
pay **storage duplication** (hot MySQL + cold Cassandra) to keep the OLTP DB
fast. We push **search, recommendations, and serviceability offline** —
accepting staleness — to protect the request-time latency budget.

## 23.8 LLD (the crux)

Two ideas carry the most interview signal: the **atomic reserve-decrement** that
makes oversell impossible, and the **hot/cold order tiering** that keeps the OLTP
database small while still serving full history.

**(a) Atomic reserve-decrement — no oversell (reuse CS20).** Checkout's only
non-negotiable is that **N units sell at most N times**. The bug is
read-then-write: two buyers both read "1 left," both proceed, both decrement. The
fix fuses **check + decrement** into one atomic, constraint-guarded operation:
```sql
-- one atomic statement; the WHERE + CHECK(quantity >= 0) make it safe
UPDATE inventory
   SET quantity = quantity - :qty
 WHERE sku = :sku AND quantity >= :qty;   -- 1 row → reserved; 0 rows → SOLD OUT
-- table guard:  quantity INT NOT NULL CHECK (quantity >= 0)
-- then hold the unit with a time-boxed reservation (TTL) while the buyer pays;
-- on payment success → commit; on timeout/failure → release (+:qty back).
```
For a **hot flash-sale SKU**, swap the contended SQL row for the **CS20** Redis
single-threaded `DECRBY` + undo counter behind a waiting room — same invariant,
far less lock contention. The `quantity >= 0` constraint is the backstop: even a
buggy caller can never drive stock negative.

**(b) Hot/cold order tiering — keep OLTP small (the distinctive crux).** Orders
have a **lifecycle**: **transactional and contended while open**
(`PENDING_PAYMENT → CONFIRMED → SHIPPED`) but **immutable, write-once history**
once **terminal** (`DELIVERED`/`CANCELLED`). Keeping every order forever in MySQL
bloats indexes and slows every live query, so we **tier by lifecycle**:
```
        OPEN orders                           TERMINAL orders
   ┌────────────────────┐    Archival svc    ┌──────────────────────┐
   │ MySQL (OLTP, ACID) │ ──(CDC / sweep)──▶ │ Cassandra (archive)  │
   │ small, fast, hot   │   copy then delete │ huge, cheap, write-   │
   │ open orders only   │ ◀── ── ── ── ── ── │ once, partitioned     │
   └─────────┬──────────┘                    └──────────┬───────────┘
             │ live order ops                            │ history reads
             ▼                                           ▼
        Order service                        Historical-Order service
```
- The **Archival service** watches for a terminal state (via CDC/outbox or a
  sweep), **copies** the order into **Cassandra** (partitioned by `user_id`,
  clustered by time — ideal for "my past orders"), then **deletes** it from MySQL
  as an idempotent, replayable move.
- The **Historical-Order service** serves all "past orders" reads from
  **Cassandra**, so history queries never touch the OLTP DB.
- Result: MySQL holds only the **small working set** of open orders (fast
  transactions, small indexes), while **unbounded history** lives on a store
  built for cheap, high-volume, write-once data. The move must be **idempotent**
  (archive-then-delete, re-runnable) so a crash mid-archival never loses or
  double-writes an order.

## 23.9 Follow-ups, red flags & building blocks

**Likely follow-ups:**
- *"Why a document DB for the catalog?"* — products are **polymorphic**; each
  category has different attributes. A document per item avoids sparse nullable
  columns / EAV and evolves schema per category. (23.5)
- *"How is the PDP fast at 100k/s?"* — it's the **AP plane**: CDN + cache,
  precomputed recommendations and **serviceability/TAT**; the document store is
  the cache-miss fallback, not the hot path.
- *"Why precompute delivery ETA?"* — warehouse × pincode × routing is expensive
  and **slow-changing**; computing it per request against a maps engine blows the
  latency budget, so it's a **precomputed O(1) lookup**.
- *"Stale stock on the PDP — isn't that a bug?"* — no: browse is AP and
  **re-validates at checkout** (B2). The authoritative check is the **atomic
  reserve** (CS20), not the badge.
- *"Payment succeeds but the reservation expired?"* — payment wins;
  **compensate** with a refund or re-acquire stock — never keep money without
  stock (CS19).
- *"Won't the order DB grow forever?"* — **hot/cold tiering**: terminal orders
  archived to Cassandra; OLTP keeps only open orders. (23.8)

**Red flags that sink candidates:** one consistency model for the whole site
(either AP money or CP browsing); a giant relational table for polymorphic
products; computing delivery ETA or recommendations on the hot path;
read-then-write inventory (the oversell bug); no compensation for the
payment/expiry race; never archiving orders (OLTP bloat); rebuilding
search/payment/inventory from scratch instead of reusing CS5/CS19/CS20.

**Building blocks reused:** autocomplete + full-text search — **CS5**;
recommendation funnel + feature store — **F3**; atomic inventory / flash-sale —
**CS20**; idempotent payment ledger + saga — **CS19**; notifications —
**Ch35 CS1**; rate limiting — **CS13**; Kafka + stream/batch (Spark/Hadoop),
CDC/outbox — **Ch 24**; document vs relational vs wide-column stores, CAP
per-plane — **Ch 23/24**; caching + CDN — **Ch 23**.

---

# PART F: AI-FLAVORED DESIGNS (the Google AI-Engineer bridge)

The three designs below are where **systems design meets ML** — exactly the
questions a **Google AI Engineer** gets that a pure-backend candidate doesn't.
The good news: they're the **same playbook** (Ch 35 Part A) with an ML-shaped
data plane bolted on. We keep each one condensed and **point to the ML chapters**
for the modeling depth: **Ch 26 (ML System Design)** for the funnel and
serving, **Ch 28 (Semantic Search)** for embeddings/RAG, **Ch 17 (LLMs)** and
**Ch 29 (GPUs/TPUs Infrastructure)** for the model internals and accelerators.
Your job in the interview is the **infra around the model**: batching, caching,
retrieval, feature freshness, latency budgets.

## F1 — LLM INFERENCE SERVING / CHATBOT PLATFORM

> **Google priority:** ★★★ · **Difficulty:** Hard · **Frequency:** Rising fast · **Time budget:** ~35 min

> **User story —** *As a* developer calling a chatbot API, *I want* fast, streaming responses at a
> sane cost, *so that* users see words appear immediately without burning GPUs.
>
> **For example —** 10,000 concurrent chats stream ~30 tokens/s each; continuous batching keeps the
> GPUs full and a KV-cache avoids recomputing the prompt, so latency and cost stay in budget.
>
> **Why it matters —** serving LLMs is a GPU-utilization problem, not a CPU one — batching,
> KV-cache, and token streaming are what make it economical.

Serving a chatbot is **not** a normal request/response service: a single request
**streams tokens for seconds**, runs on **scarce, expensive GPUs**, and its cost
is dominated by **GPU memory and throughput**, not CPU. The design is about
**keeping the GPUs full** (continuous batching), **not recomputing the past**
(KV-cache), and **streaming** partial output so the user sees words immediately.

### F1.1 Clarify & estimate

- **Functional:** chat completion with **token streaming**; multiple models
  (small/cheap vs large/smart); **prompt/response caching**; per-user rate limits
  and quotas; safety filter.
- **Estimate:** 10,000 concurrent conversations × ~30 output tokens/s (reading
  speed) = **300,000 tokens/s** aggregate decode. A GPU does ~2,000–5,000 tok/s
  (model-size dependent) → **~60–150 GPUs just for decode**. **GPUs are the
  cost** — utilization is the game. **KV-cache memory** grows with
  `batch × context_length` and **caps the batch size**.

### Whiteboard rehearsal — how you'd actually draw this live

In the room you don't reproduce the polished diagram in §F1.2 below — you sketch rough
boxes and talk. So **rehearse from this first**: here is the same architecture as a **live
whiteboard sketch**, in the shorthand you'd actually use on a Google whiteboard. The colour
code is the one most candidates settle into:

> **green = client · grey = edge/LB · blue = service · red = datastore · orange = queue / stream · violet = 3rd-party**

![LLM Inference Serving — whiteboard rehearsal sketch](diagrams/llm_serving_whiteboard.svg)

**Why rehearse from the sketch, not the clean diagram?** The polished SVG in §F1.2 is for
*reading*; this one is for *rehearsing*. Practise reproducing it from memory in ~4 minutes while
narrating every box out loud — that muscle memory is exactly what the interview tests. It is the
*same* components as the clean §F1.2 diagram, only drawn in the loose, name-the-tool style
your hand can produce under pressure: every box names a concrete technology, each datastore is
called out in red, queues in orange, third-party vendors in violet. That visual discipline is
the signal an interviewer is looking for.

### F1.2 HLD — architecture + flow

![LLM Inference Serving — high-level architecture (HLD)](diagrams/llm_serving.svg)

```
   Clients ─▶ API Gateway (auth, rate limit, quotas — CS13)
           ─▶ SAFETY / MODERATION  (prompt + output filters)
           ─▶ PROMPT/RESPONSE CACHE  (exact + semantic) ── hit ─▶ stream back
           │     miss
           ▼
   MODEL ROUTER  (pick model by difficulty / tier / cost)
           ▼
   ┌──────────────── GPU INFERENCE FLEET ────────────────┐  ◀─ MODEL REGISTRY (weights · versions · adapters)
   │  Continuous-batching scheduler (in-flight batching)  │
   │   • PREFILL: encode prompt → fill KV-cache           │
   │   • DECODE loop: 1 token/step, append to KV-cache,   │
   │                  STREAM token to client (SSE)        │
   │   • KV-cache in GPU HBM, paged (vLLM PagedAttention) │
   └───────────────┬─────────────────────────────────────┘
                   ▼
   GPU AUTOSCALER (scale on queue depth / tokens-per-s, not CPU%)
```
**Block-by-block:**
- **Gateway** — does auth + rate limiting (reuse CS13).
- **Safety / Moderation** — applies **prompt and output filters**, screening the incoming prompt
  and the streamed tokens before they reach the user.
- **Prompt/response cache** — short-circuits repeated or semantically-similar prompts (huge cost saver).
- **Router** — sends easy queries to a small model and hard ones to a large model.
- **GPU fleet** — loads weights from a **Model Registry / Store** (versioned weights + LoRA
  adapters) and runs a **continuous-batching scheduler** that interleaves many sequences: a
  **prefill** phase (build the KV-cache for the prompt) and a **decode** loop that emits one token
  per step and **streams** it.
- **Autoscaler** — scales on **queue depth / token throughput**, because GPU CPU% is meaningless here.

**Flow:** (1) request → gateway → (2) moderation screens the prompt → (3) cache check → (4) router
picks model → (5) scheduler slots it into a live batch → (6) prefill fills KV-cache →
(7) decode+stream (output moderated) → (8) stop token frees the KV-cache slot.

### F1.3 The crux — KV-cache + continuous batching

Generating token *t* needs attention over tokens *1…t−1*. Recomputing that every
step is `O(t²)` waste. The **KV-cache** stores each past token's attention
**keys/values** in GPU memory, so each new token is **O(1)** extra work — but the
cache **grows with sequence length**, and `batch × context` KV-cache must fit in
HBM, which is what **limits batch size**.

```
   STATIC BATCHING (bad):     all sequences must finish together; short
     [seq A: done........idle] replies WAIT for the longest → GPU idles.
     [seq B: still decoding...]
   CONTINUOUS BATCHING (good): add/evict sequences EVERY decode step;
     finished slots are immediately refilled → GPU stays ~100% busy.
   KV-cache paging (vLLM): treat KV-cache like virtual memory pages →
     no fragmentation, higher batch occupancy, more throughput.
```
**Continuous (in-flight) batching** + **paged KV-cache** are the two ideas that
turned LLM serving from "one request per GPU" into high-throughput multiplexing.
Model internals (attention, quantization, speculative decoding) live in
**Ch 17** and accelerator details in **Ch 29**.

### F1.4 Trade-offs, red flags & building blocks

- **Latency vs throughput:** bigger batches = better GPU utilization but higher
  per-request latency; tune to your SLO. **Time-to-first-token** (prefill) vs
  **inter-token latency** (decode) are separate budgets.
- **Caching:** exact-prompt cache is free wins; **semantic** cache (embed the
  prompt, ANN match) catches near-duplicates but risks wrong hits — gate by
  similarity threshold.
- **Red flags:** treating it like a stateless REST service; static batching;
  recomputing attention each step (no KV-cache); autoscaling on CPU; no streaming
  (users stare at a spinner for 10 s); ignoring GPU cost (the whole budget).
- **Building blocks:** ML serving, latency budget, model funnel — **Ch 26**;
  LLM internals, quantization, speculative decoding — **Ch 17**; GPUs/TPUs,
  HBM, autoscaling accelerators — **Ch 29**; gateway rate limiting — **CS13**;
  SSE streaming — **Ch 35 (chat)**.

## F2 — RAG / SEMANTIC SEARCH SYSTEM

> **Google priority:** ★★★ · **Difficulty:** Medium · **Frequency:** Very common · **Time budget:** ~30 min

> **User story —** *As a* user asking questions over my company's docs, *I want* grounded, cited
> answers, *so that* I get facts from our knowledge base instead of model hallucinations.
>
> **For example —** I ask "what's our refund policy?"; the system embeds the query, retrieves the
> top passages from the vector DB, reranks them, and the LLM answers with citations to those docs.
>
> **Why it matters —** the hard parts are retrieval quality and freshness (chunk → embed → index →
> retrieve → rerank), not the LLM call itself.

**Retrieval-Augmented Generation** grounds an LLM in **your** documents: instead
of hoping the model memorized a fact, you **retrieve** the relevant passages and
**feed them into the prompt**. The system is a pipeline: **chunk → embed → index
(vector DB / ANN) → retrieve → rerank → generate**. The hard parts are
**retrieval quality** and **freshness**, not the LLM call. Full modeling depth
lives in **Ch 28 (Semantic Search)**.

### F2.1 Clarify & estimate

- **Functional:** answer questions over a corpus with **citations**; ingest new
  docs; keep answers **fresh**; filter by access control / metadata.
- **Estimate:** 10 M documents × ~10 chunks = **100 M chunks**, each a
  768–1536-dim vector. 100 M × 768 × 4 B ≈ **300 GB** of vectors → needs an
  **ANN index** (brute-force `O(N)` per query is hopeless), sharded across nodes.
- **Quality knobs to ask about:** chunk size/overlap, top-k, rerank depth,
  embedding model, refresh cadence.

### Whiteboard rehearsal — how you'd actually draw this live

In the room you don't reproduce the polished diagram in §F2.2 below — you sketch rough
boxes and talk. So **rehearse from this first**: here is the same architecture as a **live
whiteboard sketch**, in the shorthand you'd actually use on a Google whiteboard. The colour
code is the one most candidates settle into:

> **green = client · grey = edge/LB · blue = service · red = datastore · orange = queue / stream · violet = 3rd-party**

![RAG / Semantic Search — whiteboard rehearsal sketch](diagrams/rag_whiteboard.svg)

**Why rehearse from the sketch, not the clean diagram?** The polished SVG in §F2.2 is for
*reading*; this one is for *rehearsing*. Practise reproducing it from memory in ~4 minutes while
narrating every box out loud — that muscle memory is exactly what the interview tests. It is the
*same* components as the clean §F2.2 diagram, only drawn in the loose, name-the-tool style
your hand can produce under pressure: every box names a concrete technology, each datastore is
called out in red, queues in orange, third-party vendors in violet. That visual discipline is
the signal an interviewer is looking for.

### F2.2 HLD — architecture + flow

![RAG / Semantic Search — high-level architecture (HLD)](diagrams/rag.svg)

```
   INGEST (offline / streaming)            QUERY (online)
   ────────────────────────────            ──────────────
   Docs ─▶ chunk ─▶ embed ─▶ VECTOR DB     Query ─▶ embed ─▶ ANN search top-k
            (overlap)  (model)  (ANN index)         │           (vector DB)
                          │                          ▼
              metadata + access tags        RERANK top-k (cross-encoder)
              stored alongside vectors               │ keep best m
                                                      ▼
                                          Build prompt = query + m passages
                                                      ▼
                                          LLM (F1) ─▶ answer + CITATIONS
```
**Block-by-block:**
- **Ingest** — splits documents into overlapping **chunks**, **embeds** each into a vector, and
  stores them in a **vector DB / ANN index** with metadata (source, ACL, timestamp).
- **Query** — embeds the question, does an **ANN top-k** retrieval, **reranks** with a heavier
  cross-encoder for precision, stuffs the best passages into the **prompt**, and calls the **LLM**
  (the F1 service) to generate a **cited** answer.

**Flow:** (1) embed query → (2) ANN retrieve top-k → (3) rerank → (4) assemble context → (5) generate.

### F2.3 The crux — retrieval quality: ANN + reranking + freshness

Retrieval is a **two-stage funnel** (mirrors recsys, CS F3): a **cheap, fast
recall** stage (ANN over millions of vectors — HNSW/IVF/ScaNN) gets ~100
candidates, then an **expensive, precise rerank** (a cross-encoder that reads
query+passage together) reorders to the top ~5. ANN trades a little recall for
**huge speed** (`O(log N)`-ish vs `O(N)`); reranking buys back precision on a
small set. **Freshness** is the other crux: a new document must become
retrievable fast, so ingestion **incrementally upserts** vectors (and you handle
deletes/updates by re-embedding changed chunks) — a stale index silently returns
wrong answers. ANN index families, chunking strategy, and reranker choices are
covered in **Ch 28**.

### F2.4 Trade-offs, red flags & building blocks

- **Chunking is underrated:** too big → diluted embeddings & wasted context; too
  small → lost context. Overlap preserves boundaries.
- **ANN recall vs latency:** tune `efSearch`/`nprobe`; measure recall@k, not just
  speed.
- **Red flags:** brute-force search at 100 M vectors; no reranker (raw ANN is
  often not precise enough); stale index (no freshness path); dumping 50 chunks
  into the prompt (cost + "lost in the middle"); ignoring access control on
  retrieved docs.
- **Building blocks:** embeddings, vector DBs, ANN (HNSW/IVF/ScaNN), reranking,
  chunking, RAG — **Ch 28**; the LLM generator — **F1 / Ch 17**;
  two-stage retrieve→rank funnel — **Ch 26**.

## F3 — RECOMMENDATION FEED

> **Google priority:** ★★★ · **Difficulty:** Hard · **Frequency:** Very common · **Time budget:** ~35 min

> **User story —** *As a* user opening a feed, *I want* a personalized, ranked list in under
> 200 ms, *so that* I see relevant items without waiting.
>
> **For example —** for each request, candidate generation cuts 10^8 items to ~1,000 via ANN, then
> a ranking model scores those and applies business rules — all within the latency budget.
>
> **Why it matters —** you can't score 800 M items per request, so recsys is a funnel; the infra
> crux is the feature store and the online/offline split.

"Design the feed / recommendations" (YouTube home, app store, shopping) is the
classic ML-system question. You can't score **800 million items** for every user
in 100 ms, so recsys is a **funnel**: cheaply **generate candidates** (thousands)
→ expensively **rank** them (hundreds) → apply business rules → serve. The infra
crux is the **feature store** and the **online/offline split**. Modeling depth
(two-tower, wide-and-deep, metrics, drift) lives in **Ch 26**.

### F3.1 Clarify & estimate

- **Functional:** return a ranked list of items per user request; personalize;
  refresh as behavior changes; respect business rules (diversity, freshness,
  dedupe, policy).
- **Estimate:** 100 M DAU × 10 feed loads/day = **1 B requests/day ≈ 12k/s**
  (peak ~40k/s), each scoring ~500 candidates → **~6 M scorings/s average, ~20 M/s at peak** →
  ranking must be cheap per item, and candidate generation must cut 10^8 → 10^3
  fast.
- **Latency:** end-to-end **< 200 ms**; the model has a strict slice of that.

### Whiteboard rehearsal — how you'd actually draw this live

In the room you don't reproduce the polished diagram in §F3.2 below — you sketch rough
boxes and talk. So **rehearse from this first**: here is the same architecture as a **live
whiteboard sketch**, in the shorthand you'd actually use on a Google whiteboard. The colour
code is the one most candidates settle into:

> **green = client · grey = edge/LB · blue = service · red = datastore · orange = queue / stream · violet = 3rd-party**

![Recommendation Feed — whiteboard rehearsal sketch](diagrams/recsys_whiteboard.svg)

**Why rehearse from the sketch, not the clean diagram?** The polished SVG in §F3.2 is for
*reading*; this one is for *rehearsing*. Practise reproducing it from memory in ~4 minutes while
narrating every box out loud — that muscle memory is exactly what the interview tests. It is the
*same* components as the clean §F3.2 diagram, only drawn in the loose, name-the-tool style
your hand can produce under pressure: every box names a concrete technology, each datastore is
called out in red, queues in orange, third-party vendors in violet. That visual discipline is
the signal an interviewer is looking for.

### F3.2 HLD — architecture + flow

![Recommendation Feed — high-level architecture (HLD)](diagrams/recsys.svg)

```
   Request ─▶ ┌── CANDIDATE GENERATION (recall: 10^8 → 10^3) ──┐
              │  several sources, unioned:                      │
              │   • two-tower ANN (user emb → item ANN)         │
              │   • recent/trending, follows, collaborative     │
              └───────────────────┬────────────────────────────┘
                                  ▼
              ┌── RANKING (precision: 10^3 → ordered) ──┐
              │  heavy model scores each candidate using │◀── FEATURE STORE
              │  user × item × context features          │    (online: low-lat
              └───────────────────┬─────────────────────┘     reads; offline:
                                  ▼                            train tables)
              RE-RANK / policy: diversity, dedupe, freshness, business rules
                                  ▼
              Feed served; impr.+clicks logged ─▶ training data ─▶ Spark train ─▶ Model Store ─▶ deploy
```
**Block-by-block:**
- **Candidate generation** — cheap recall sources: a **two-tower** model embeds the user and finds
  nearby items via **ANN**, unioned with trending/followed/collaborative sources — cutting 10^8
  items to ~10^3.
- **Ranking** — a heavy model scores each candidate with rich **user × item × context features**
  pulled from the **feature store**.
- **Re-rank / policy** — enforces diversity, dedupe, and business rules.
- **Logging → training** — served impressions and clicks are **logged** to become tomorrow's
  **training data**; an offline **training pipeline** (Spark) turns those logs into refreshed
  models, published to a **Model Store** (versioned artifacts) and deployed back to **ranking**.

**Flow:** (1) request → (2) candidate gen (ANN + sources) → (3) feature fetch → (4) rank →
(5) policy re-rank → (6) serve + log.

### F3.3 The crux — the funnel + the feature store (online vs offline)

The **funnel** exists because of arithmetic: scoring 10^8 items per request with
a heavy model is impossible in 200 ms, so **recall is cheap and approximate
(ANN), ranking is expensive and precise** on a small set — the *exact same
two-stage shape* as RAG retrieval (F2). The **feature store** is the infra crux
and the **#1 silent killer (Ch 26)**: features must be computed **identically**
for **offline training** (batch tables over historical logs) and **online
serving** (low-latency reads at request time). If the two diverge —
**training/serving skew** — the model silently rots. So the feature store serves
both paths from one definition, with online features (last-5-clicks, current
session) updated in near-real-time and offline features (long-term affinity)
batch-computed.

### F3.4 Trade-offs, red flags & building blocks

- **Online vs offline:** offline (batch) is cheap and rich but stale; online
  (streaming) is fresh but costly — most systems do **both** and join them in the
  feature store.
- **Candidate sources:** more sources = better recall but more latency/complexity;
  union + dedupe.
- **Red flags:** trying to rank the full catalog (no funnel); training/serving
  skew from two feature pipelines; no logging of impressions (no training data);
  ignoring diversity (feed collapses to one topic); cold-start users/items.
- **Building blocks:** candidate-gen → ranking funnel, two-tower, feature store,
  training/serving skew, A/B testing, drift — **Ch 26**; ANN for candidate
  recall — **Ch 26/28**; event logging & stream processing — **Ch 24**;
  low-latency feature reads (cache/KV) — **CS17 / Ch 23**.

---

# PART G: THE CROSS-CUTTING PATTERN LIBRARY

Here is the synthesis. Across all 25 designs in Ch 35/36/37, **the same dozen or
so patterns recur** — interviewers reward you for *naming the pattern* and
*recognizing when it applies*, not for re-deriving it each time. This matrix maps
every recurring pattern to **which case studies use it** and **why**, with a
one-line **"when to reach for it"** trigger. Use it as a revision tool: cover the
right two columns and quiz yourself.

> Shorthand: **CS1–CS22** are the case studies; **F1/F2/F3** the AI designs.
> Ch 35 = CS1–4 (real-time), Ch 36 = CS5–12 (search/geo/feeds/media),
> Ch 37 = CS13–22 + Part F (scale/infra/money/AI).

## G.1 The master matrix

| Pattern | When to reach for it | Used in (case studies) | Why it's the right tool |
|---------|----------------------|------------------------|-------------------------|
| **Fan-out: push vs pull** | One event must reach many timelines/recipients | CS9 News Feed, CS1 Notifications, CS2 Chat (groups) | Push (write fan-out) = fast reads, costly for celebrities; pull (read fan-out) = cheap writes, slower reads → **hybrid**: push for most, pull for whales |
| **WebSocket vs SSE vs polling** | Server must push to client in real time | CS2 Chat, CS1 in-app, CS4 Docs, CS3 Zoom signaling, **F1 token streaming** | WebSocket = bidirectional (chat/edits); SSE = one-way stream (tokens, live feed); long-poll = simple fallback |
| **Geo-index (geohash/quadtree/S2)** | "Find things near me" spatial queries | CS7 Proximity/Nearby, CS8 Ride-Hailing | Turns 2-D distance into 1-D prefix/range lookups → cell + neighbors instead of full scan |
| **Consistent hashing (+ vnodes)** | Spread keys over N nodes, scale without reshuffle | CS17 Cache, CS21 KV store, CS13 limiter shards, CS16 board shards | Adding/removing a node moves only `1/N` keys; vnodes balance load |
| **Idempotency / dedupe** | Any retryable state-changing op | CS19 Payments, CS1 Notifications, CS18 Scheduler, CS20 order, CS2 message-id | Converts at-least-once delivery into exactly-once *effect* — kills double-charge/double-send |
| **Token / leaky bucket** | Cap rate but allow natural bursts | CS13 Rate Limiter, CS1 per-user caps, CS6 Crawler politeness | Protects downstreams & ensures fairness; token = bursty, leaky = smoothed |
| **Shard by key** | Horizontal scale + per-entity locality/ordering | Nearly all: CS2 by convo, CS9 by user, CS19 by account, CS14 by machine, CS21 by key | Keeps one entity's data & traffic on one node → ordered, cache-warm, no cross-node coordination |
| **CQRS / read models** | Read and write shapes diverge sharply | CS9 Feed (precomputed timeline), CS16 Leaderboard (Redis index), CS5 Autocomplete (trie) | Serve reads from a **derived view** optimized for the query, written async from the source of truth |
| **Outbox + CDC** | Update DB *and* publish an event atomically | CS19 Payments, CS1 Notifications, CS9 fan-out | Avoids the dual-write problem — event and row commit together, CDC ships it eventually |
| **Bloom / Count-Min sketch** | Approximate membership/frequency in fixed RAM | CS15 Top-K (CMS), CS6 Crawler (Bloom "seen URLs"), CS17 cache admission | Huge memory savings vs exact sets/maps; bounded, tunable error |
| **SFU (selective forwarding)** | Multiparty real-time media | CS3 Video Conferencing (Zoom/Meet) | Forwards each participant's stream without re-encoding → far cheaper than an MCU mixer, scales to many |
| **OT / CRDT** | Concurrent edits to shared state must converge | CS4 Collaborative Editor, CS11 File Sync (conflicts) | Merge without locking; OT = transform ops, CRDT = conflict-free data types that always converge |
| **Quorum N/W/R** | Tunable consistency on replicated data | CS21 KV store, multi-region writes, CS19 (durability) | `W+R>N` forces read/write overlap → read-your-writes; dial per operation |
| **Write-ahead / append-only log** | Durability, ordered replay, audit | CS19 Ledger, CS21 storage engine, CS1/CS9/CS15 Kafka backbone | The universal building block — commit to a log first, derive everything else from replaying it |

## G.2 Bonus patterns worth naming

A few more that show up repeatedly and earn senior signal when named:

| Pattern | When to reach for it | Used in | Why |
|---------|----------------------|---------|-----|
| **Lease / visibility timeout** | At-least-once work dispatch with crash recovery | CS18 Scheduler, CS20 reservations | A dead worker's lease expires → job redelivered; no lost or stuck work |
| **Reservation + TTL** | Hold a scarce resource during a multi-step action | CS20 Inventory, seat/ticket booking | Prevents oversell while the user pays; auto-releases on abandon |
| **Two-stage funnel (recall→rank)** | Too many candidates to score precisely | F3 Recsys, F2 RAG retrieval, CS5 autocomplete | Cheap approximate recall (ANN) → expensive precise rank on a small set |
| **Cache-aside + stampede guard** | Hot read path in front of a slow store | CS17 Cache, CS9 Feed, CS5, Instagram | 90%+ hit rate offloads the DB; single-flight + TTL jitter stops herd on expiry |
| **Bulkhead / isolation** | One slow dependency must not sink the rest | CS1 per-channel queues, CS3 media vs signaling | Failure containment — a bad provider/lane backs up alone |
| **Lambda (batch + stream)** | Need both real-time *and* exact answers | CS15 Top-K, CS9 analytics, F3 logging | Fast approximate stream path + slow exact batch path that reconciles |

## G.3 How to use this in the room

- When you hit a sub-problem, **say the pattern's name** ("this is a fan-out
  problem — push or pull?") before drawing. That's the senior tell.
- Most designs are **3–5 of these patterns composed**. E.g. the **News Feed** =
  fan-out + CQRS + shard-by-user + cache-aside; **Payments** = idempotency +
  WAL/ledger + outbox + saga; **KV store** = consistent hashing + quorum +
  vector clocks + WAL.
- The **same two-stage funnel** powers autocomplete, RAG retrieval, and
  recommendations — recognizing that one shape across "backend" and "ML"
  questions is exactly the **AI-Engineer bridge** this chapter is about.

---

# PART H: RAPID-REVISION CHEAT SHEET

The night-before table. **One row per design** across all three chapters
(CS1–CS22 + the three AI designs). Columns: the **core challenge**, the **key
components**, the **one trade-off** the interviewer is listening for, and **the
single number or idea** that proves you actually understand it. If you can
reproduce this table from memory, you can walk into the room.

| # | Design | Core challenge | Key components | Key trade-off | The one idea/number to remember |
|---|--------|----------------|----------------|---------------|---------------------------------|
| 1 | **Notification** (Ch 35) | Reliable multi-channel fan-out, no spam | API+Kafka, processor, per-channel workers, DLQ | At-least-once + dedupe vs exactly-once | Decouple with a queue; **idempotent dedupe key** = exactly-once feel |
| 2 | **Chat** (Ch 35) | Real-time delivery, ordering, presence | WebSocket gateway, per-convo store, push | Push vs pull for group fan-out | Persistent **WebSocket** + shard by conversation; seq #s for order |
| 3 | **Video Conf / Zoom** (Ch 35) | Low-latency multiparty media | **SFU**, WebRTC/UDP, signaling, simulcast | SFU (forward) vs MCU (mix) | **SFU forwards** streams (no re-encode); media over **UDP** |
| 4 | **Collab Editor / Docs** (Ch 35) | Concurrent edits must converge | **OT or CRDT**, WebSocket, version vectors | OT (central) vs CRDT (P2P, metadata) | **OT/CRDT converge without locks** |
| 5 | **Autocomplete** (Ch 36) | Top-k completions < 100 ms per keystroke | **Trie/FST**, precomputed top-k/node, cache | Freshness vs precompute | **Precompute top-k at each trie node**; serve from cache |
| 6 | **Web Crawler** (Ch 36) | Crawl billions politely, no dups | URL **frontier**, **Bloom** seen-set, parsers | Freshness vs politeness/coverage | **Frontier + Bloom filter**; per-host rate limit |
| 7 | **Proximity / Nearby** (Ch 36) | Find nearby in < 100 ms | **Geo-index** (geohash/quadtree/S2), Redis GEO | Cell size: precision vs result count | Query **my cell + 8 neighbors**, sort by exact distance |
| 8 | **Ride-Hailing** (Ch 36) | Match riders↔drivers live | Driver geo-index, matcher, location stream | Match latency vs optimal assignment | **Geospatial index of drivers** + nearest match |
| 9 | **News Feed** (Ch 36) | Assemble personalized timeline fast | Fan-out svc, timeline cache, ranker, shard-by-user | Fan-out on **write (push)** vs **read (pull)** | **Hybrid fan-out**: push for most, **pull for celebrities** |
| 10 | **Video Streaming** (Ch 36) | Deliver video to millions, any bandwidth | Transcode pipeline, **ABR**, **CDN**, HLS/DASH | Storage (renditions) vs quality | **Transcode to many bitrates**; ABR + CDN do the rest |
| 11 | **File Sync / Dropbox** (Ch 36) | Sync, dedupe, resolve conflicts | **Chunk + content-hash dedupe**, metadata DB, blocks | Chunk size; metadata vs block consistency | **Content-addressed chunks** (dedupe) + metadata journal |
| 12 | **URL Shortener** (Ch 36) | Short unique key, billions, fast redirect | Key gen (counter/hash/base62), KV, cache | Counter (sortable, coord) vs hash (random) | **base62 of a unique id** → KV lookup + cache |
| 13 | **Rate Limiter** | Accurate global limit at < 1 ms across N nodes | Gateway middleware, **Redis token-bucket Lua** | Central (accurate) vs local (fast, approx) | **Token-bucket Lua = atomic**; allow ~5% over to keep latency |
| 14 | **Snowflake ID** | Unique, time-sortable, zero per-id coordination | **64-bit layout**, worker-id lease, clock+seq | k-sorted vs strict monotonic; guessable | **41 time \| 10 machine \| 12 seq** = 4096 ids/ms/node; clock-backward |
| 15 | **Top-K / Heavy Hitters** | Top-k frequent over a firehose, fixed RAM | **Count-Min Sketch + min-heap**, Kafka by key | Approximate (stream) vs exact (batch) | **CMS** estimates counts in ~32 MB regardless of #keys |
| 16 | **Leaderboard** | Rank / top-N / around-me in ms | **Redis sorted set** (skip list), durable scores | Exact global rank vs cross-shard cost | **Sorted set = O(log N) rank**; approx global via bucket counts |
| 17 | **Distributed Cache** | Shard keys + survive hot keys | **Consistent-hash ring**, LRU/LFU, single-flight | Staleness vs freshness; near vs central | **Consistent hashing + hot-key replication/coalescing** |
| 18 | **Job Scheduler** | Run ≥once incl. delayed, survive crashes | Durable store, **leased dispatch**, timing wheel, DLQ | At-least-once + idempotent vs exactly-once | **Lease + visibility timeout** → crashed worker's job redelivered |
| 19 | **Payments / Wallet** | Move money exactly once; books balance | **Double-entry ledger**, idempotency, **saga**, recon | **CP over AP** — correctness over availability | **Append-only ledger + idempotent posting**; saga across gateway |
| 20 | **Inventory / Flash Sale** | No oversell under massive concurrency | **Atomic DECR** / conditional UPDATE, reserve+TTL, queue | Reserve up front (under-sell) vs at-pay (oversell) | **Atomic check-and-decrement** is the whole game |
| 21 | **KV Store / Dynamo** | Always-writable, scalable, eventual | Consistent hashing, N replicas, **quorum**, vector clocks | **AP** — tunable consistency, conflicts | **W+R>N ⇒ read sees latest write**; vector clocks for conflicts |
| 22 | **Pastebin** | Short link → text blob, expiry | Key gen, **object store** blob, metadata KV, CDN | Blob in object store, not DB | **URL shortener + blob storage + TTL** |
| F1 | **LLM Inference Serving** | Keep scarce GPUs full while streaming | **Continuous batching**, **paged KV-cache**, router, cache | Batch size: throughput vs latency | **KV-cache + continuous batching** = high GPU utilization |
| F2 | **RAG / Semantic Search** | Ground LLM in fresh private docs | chunk→embed→**ANN**→**rerank**→LLM, vector DB | ANN recall vs latency; chunk size | **Retrieve (ANN) → rerank → generate** with citations |
| F3 | **Recommendation Feed** | Rank from 10^8 items in < 200 ms | **Candidate gen (two-tower+ANN)**, ranker, **feature store** | Online vs offline features; training/serving skew | **Funnel**: cheap recall → precise rank; feature store unifies both |

---

## Key Takeaways

- **Infra questions reward depth on ONE hard idea.** Give full HLD, then go to
  the **data-structure / concurrency level** on the crux — that's where the
  signal is (the Lua bucket, the 64-bit layout, the idempotent ledger posting).
- **Atomicity is the recurring theme.** Token-bucket Lua, ledger double-entry,
  inventory `DECR`, the idempotent `INSERT … ON CONFLICT` — all are the same
  move: make a **read-modify-write into one indivisible step** so concurrent
  requests can't race.
- **Idempotency is the most reused trick in the book.** It turns *at-least-once*
  delivery into an *exactly-once effect* and shows up in payments, notifications,
  the scheduler, and order creation. Bake in idempotency keys from day one.
- **State your consistency stance out loud.** The rate limiter deliberately
  **degrades to AP** (approximate) to protect latency; **payments insist on CP**
  (refuse rather than double-spend); the **KV store embraces AP** with tunable
  quorums. Naming CAP/PACELC per component is senior signal.
- **Approximate to save memory and latency** — Count-Min sketches, Bloom
  filters, ANN search, local rate-limit counters. Exactness is a cost you pay
  **only when the requirement demands it** (billing, money).
- **Consistent hashing + shard-by-key** underlie the cache, the KV store, the
  rate-limiter counters, and the leaderboard: distribute with **minimal
  reshuffle** and keep each entity's data and traffic **on one node**.
- **The same two-stage funnel** — cheap approximate **recall** then expensive
  precise **rank** — powers autocomplete, RAG retrieval, *and* recommendations.
  Recognizing that one shape across backend and ML problems **is** the AI-Engineer
  bridge.
- **For AI serving, the infra IS the interview.** Batching, KV-cache, retrieval,
  feature stores, and latency budgets are yours to design; the model is a black
  box you keep **fed and utilized**. Point to **Ch 26** (ML system design),
  **Ch 28** (semantic search), **Ch 17** (LLMs), **Ch 29** (GPUs/TPUs) for the
  modeling depth.
- **Compose, don't invent.** A senior design is **3–5 named patterns** from
  Part G stitched together. Memorize the cruxes in Part H, name the patterns in
  Part G, and drive the 45 minutes with the playbook from **Ch 35 Part A**.
