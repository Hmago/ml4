# System Design — Quick Revision

> This is a fast revision recap of **Chapters 21–26**, covering OO Design & SOLID, Engineering Tools (Kafka/Redis/Spark/K8s), System Design Foundations & Protocols, Data & Distributed Systems, Operations & Case Studies, and ML System Design. Use it to skim key ideas before an interview instead of re-reading the full chapters. Full depth, worked examples, and code lives in the source chapters — come back here when you need the map, not the terrain.

---

## Contents

- [Ch 21 — Object-Oriented Design, SOLID & Design Patterns](#ch-21--object-oriented-design-solid--design-patterns)
- [Ch 22 — Engineering Tools (Kafka, Redis, Spark, K8s & More)](#ch-22--engineering-tools-kafka-redis-spark-k8s--more)
- [Ch 23 — System Design Pt 1: Foundations & Protocols](#ch-23--system-design-pt-1-foundations--protocols)
- [Ch 24 — System Design Pt 2: Data & Distributed Systems](#ch-24--system-design-pt-2-data--distributed-systems)
- [Ch 25 — System Design Pt 3: Operations & Case Studies](#ch-25--system-design-pt-3-operations--case-studies)
- [Ch 26 — ML System Design (Google)](#ch-26--ml-system-design-google)
- [One-Page Cheat Recap](#one-page-cheat-recap)

---

## Ch 21 — Object-Oriented Design, SOLID & Design Patterns

> 💡 **In a sentence —** Good OO design means each class has one clear job, dependencies flow toward abstractions, and proven patterns handle the recurring problems so you don't reinvent pasta.

---

### Part 1 — SOLID Principles

SOLID is five principles for code that survives change.

```
  S — Single Responsibility Principle
  O — Open/Closed Principle
  L — Liskov Substitution Principle
  I — Interface Segregation Principle
  D — Dependency Inversion Principle
```

| Principle | One-liner | Violation signal |
|-----------|-----------|-----------------|
| **SRP** | One class, one reason to change | You use the word "AND" describing the class |
| **OCP** | Open for extension, closed for modification | Adding a feature requires editing existing code |
| **LSP** | Subtypes must substitute for base types | Classic: `Square extends Rectangle` breaks area assertions |
| **ISP** | Many small interfaces > one fat interface | Classes implement methods with empty bodies or `throw` |
| **DIP** | Depend on abstractions, not implementations | `OrderService` hard-wires `new MySQLDatabase()` |

**DIP pattern in practice — constructor injection:**

```java
// BAD: high-level depends directly on low-level
class OrderService {
    private final MySQLDatabase db = new MySQLDatabase();  // hard dependency
}

// GOOD: both depend on an abstraction
class OrderService {
    private final Database db;     // interface
    private final Mailer mailer;   // interface
    OrderService(Database db, Mailer mailer) { ... }  // inject at callsite
}
// Testing: inject MockDatabase; production: inject PostgresDatabase. Zero change to OrderService.
```

**Coupling & Cohesion** — the two master metrics:
- **High cohesion**: everything inside a class works toward one purpose (SRP helps).
- **Low coupling**: modules can change independently (DIP helps).
- Goal: `HIGH COHESION + LOW COUPLING = GREAT DESIGN`

**Other principles at a glance:**

| Principle | Rule |
|-----------|------|
| **DRY** | Single source of truth for every piece of knowledge |
| **KISS** | `n % 2 == 0` beats a 5-line bit-manipulation riddle |
| **YAGNI** | Don't build OAuth + SAML when they just asked for email + password |
| **Composition > Inheritance** | Prefer HAS-A over IS-A; behaviour via interfaces |
| **Law of Demeter** | `customer.charge(100)` not `customer.getWallet().getCard().charge(100)` |
| **SoC** | Separate presentation, business logic, data access |

---

### Part 2 — Design Patterns

Three families; reach for the right recipe:

```
  ┌─────────────────┬────────────────────┬───────────────────────┐
  │   CREATIONAL    │    STRUCTURAL      │     BEHAVIORAL        │
  ├─────────────────┼────────────────────┼───────────────────────┤
  │ Singleton       │ Adapter            │ Observer / Event Bus  │
  │ Factory Method  │ Facade             │ Strategy              │
  │ Builder         │ Decorator          │ Command (undo/redo)   │
  │                 │ Proxy              │ State                 │
  │                 │                    │ Template Method       │
  └─────────────────┴────────────────────┴───────────────────────┘
```

**Quick pattern selector:**

| Need | Pattern |
|------|---------|
| One instance of a class | Singleton (prefer DI container at Google) |
| Create without knowing exact type | Factory Method |
| Readable multi-field object construction | Builder |
| Incompatible interface shim | Adapter |
| Hide complex subsystem | Facade |
| Add behaviour dynamically without subclassing | Decorator |
| React to state changes in many listeners | Observer |
| Swap algorithms at runtime | Strategy |
| Parameterise actions with undo | Command |
| Different behaviour per state, no if/else chains | State |

---

### Part 3 — Java Concurrency (Google Must-Know)

```java
// Race condition fix options:
// 1. synchronized  — one thread at a time (intrinsic lock)
// 2. AtomicInteger — lock-free compare-and-swap (faster)
// 3. ConcurrentHashMap — thread-safe map, atomic merge()

// Thread pool
ExecutorService pool = Executors.newFixedThreadPool(10);
Future<Result> f = pool.submit(() -> processOrder(order));

// CompletableFuture — modern async chains (how Google chains RPCs)
CompletableFuture
  .supplyAsync(() -> userService.getUser(id))
  .thenCompose(u -> orderService.getOrders(u.getId()))
  .exceptionally(ex -> fallback());
```

**Concurrency pitfalls table:**

| Pitfall | Description | Fix |
|---------|-------------|-----|
| **Race condition** | Unsynchronised read-modify-write | `synchronized`, `AtomicXxx`, immutables |
| **Deadlock** | T1 holds L1 wants L2; T2 holds L2 wants L1 | Always acquire locks in a fixed consistent order |
| **Starvation** | Low-priority thread never gets the lock | Fair queuing (`ReentrantLock(true)`) |
| **Livelock** | Threads respond to each other but make no progress | Add randomness or priorities |
| **False sharing** | Different vars on same CPU cache line | Padding, `@Contended` |

> **Google interview tip:** discuss thread safety, deadlock prevention, and testing strategy for concurrency. Use `ReadWriteLock` for many-readers-one-writer caches; use `BlockingQueue` for producer-consumer.

---

> ✅ **Must-remember**
>
> - **SRP test:** "What does this class do?" — if you say "AND", split it.
> - **LSP test:** Can you swap the subtype everywhere the base type is used without breaking tests?
> - **DIP = Dependency Injection** — inject abstractions, never `new ConcreteImpl()` in business logic.
> - **Deadlock prevention = consistent lock ordering** (always lock lowest ID first).
> - **Builder** is the right answer for objects with many optional params.
> - **Strategy = lambda in Java 8+** — `ShoppingCart cart = new ShoppingCart(price -> price * 0.85);`

---

## Ch 22 — Engineering Tools (Kafka, Redis, Spark, K8s & More)

> 💡 **In a sentence —** Every infrastructure tool exists to solve one of four jobs — Ingest, Store, Process, Serve — and knowing the tier priority tells you what to learn first.

---

### The Big Picture: 4 Jobs × Priority Tiers

```
   INGEST    STORE     PROCESS   SERVE
   Kafka     S3/GCS    Spark     Redis
   CDC       Postgres  Flink     Postgres
   Fivetran  Cassandra dbt/Ray   Elastic

 TIER 1 (must-know): Docker · Kubernetes · Kafka · Redis/Valkey
                     PostgreSQL · MongoDB · S3 · Spark

 TIER 2 (modern data stack): Snowflake/Databricks · dbt · Parquet
                              Iceberg/Delta · Flink · Airflow
                              Terraform · Prometheus+Grafana · Ray

 TIER 3 (situational): Cassandra · Elasticsearch · gRPC/GraphQL
                        Vector DBs (pgvector/Qdrant) · Distributed SQL

 TIER 4 (legacy): Hadoop MapReduce / Hive
```

**2025–2026 shift:** Hadoop → Lakehouse (S3 + Iceberg/Delta). Kafka (transport) + Flink (processing) is the modern streaming pair. Vector DBs added for AI/RAG workloads.

---

### Docker

| Term | What it is |
|------|-----------|
| **Image** | Sealed read-only package (app + deps). Built once, run anywhere. |
| **Container** | Running instance of an image — isolated process sharing host OS kernel. |
| **Layer** | Cached filesystem diff; unchanged layers reused → fast rebuilds. |
| **Registry** | Where images live (Docker Hub, GHCR, ECR). Push/pull. |

**Two pro Dockerfile patterns:**
1. **Dependency layer first:** `COPY package*.json → RUN npm ci → COPY . .` (code edits don't bust install layer)
2. **Multi-stage builds:** compile in fat builder, ship only the artifact in `distroless` final stage (~20 MB vs 1 GB)

```
  VM:        full Guest OS  (GBs, minutes to boot)
  Container: shares host kernel (MBs, ms to start)
```

**Common Docker gotchas:** `exec format error` = built on ARM, deployed to AMD64 (fix: `--platform linux/amd64`); secrets baked into layers (use runtime env / build secrets, audit `docker history`); never run as root; always `.dockerignore`.

---

### Kubernetes (K8s)

> K8s is the lunchroom manager for thousands of containers: schedules them onto machines, replaces crashed ones, and autoscales the fleet.

**Core objects:**

| Object | What it does |
|--------|-------------|
| **Pod** | Smallest unit — one or more containers that live/die together |
| **Deployment** | "Keep N replicas, rolling-update on change" |
| **Service** | Stable internal address + load balancer in front of pods |
| **Ingress** | External HTTP routing → Service |
| **ConfigMap / Secret** | Config injected into pods (out of the image) |
| **StatefulSet** | Ordered pods with stable IDs + persistent volumes (for Kafka, DBs) |

**Autoscaling levers:** HPA (add/remove pods on CPU/custom metrics) → Cluster Autoscaler (add/remove nodes) → KEDA (scale on Kafka lag, queue depth).

**Probe rules:**
```
  livenessProbe  = "is my process wedged?" → restart if fails
                   NEVER check downstream services here (cascading failures!)
  readinessProbe = "should I get traffic?" → remove from LB if fails
  startupProbe   = "am I done starting?"   → protect slow JVM boots
```

**GitOps:** Git is the source of truth; ArgoCD/Flux reconciles cluster state to match. Every change is a git commit. `git revert` rolls back the cluster.

**Common K8s pitfalls:**

| Symptom | Cause | Fix |
|---------|-------|-----|
| `CrashLoopBackOff` | App crashes on startup | `kubectl logs <pod> --previous` |
| `OOMKilled` | Container exceeded memory limit | Raise limit or fix leak |
| `Pending` pod | No node with enough resources | Lower requests or add nodes |
| CPU throttled despite idle node | Tight CPU *limit* (CFS quota) | Remove CPU limit; keep memory limit |

---

### Kafka

> Kafka is a partitioned, durable, replayable log — not a queue. Messages are retained for days/weeks regardless of consumption.

```
   Producers ─▶ TOPIC (partitioned log) ─▶ Consumer groups
               ┌──────────────────────────────────┐
               │ Partition 0: [ 0 1 2 3 4 5 ... ] │
               │ Partition 1: [ 0 1 2 3 4 ... ]   │
               │ Partition 2: [ 0 1 2 3 4 5 6 ]   │
               └──────────────────────────────────┘
   Offset = consumer's bookmark; stored in __consumer_offsets
   One consumer group member owns each partition at a time
```

**Key config knobs:**
- `acks=all` + `min.insync.replicas=2` → durable writes (tolerates 1 broker loss)
- `acks=1` → only leader acks (faster, can lose on failover)
- **Compaction** → keep only latest value per key (state stores, changelogs)
- **Retention** → by time or by size; Kafka is a log, not a queue

**Kafka vs RabbitMQ vs SQS:**

| | Kafka | RabbitMQ | AWS SQS |
|---|---|---|---|
| Model | Durable log, replayable | Broker queue, consume+ack | Managed queue |
| Throughput | Millions/sec | ~50K/sec/node | Unlimited (managed) |
| Ordering | Per partition | Per queue | FIFO queue |
| Retention | Days/weeks (configurable) | Until consumed | 14 days max |
| Best for | Streaming, replay, analytics | Complex routing | Simple decoupling |

**Outbox + CDC:** atomically write to DB + outbox table in one transaction; a relay (or Debezium reading WAL) publishes to Kafka. No dual-write hazard.

---

### Redis / Valkey

> Redis is a sub-millisecond in-memory speed layer — not a system of record. It's the #1 caching tool, session store, rate limiter, leaderboard engine, and lightweight pub/sub.

**Data structures:**

| Structure | Use case | Example |
|-----------|----------|---------|
| String | Cache, counter | `SET user:42 "..."`, `INCR views` |
| Hash | Object with fields | `HSET user:42 name Ana age 30` |
| List | Queue, recent items | `LPUSH/RPOP` |
| Sorted Set | Leaderboards, rankings | `ZADD board 999 player1` |
| Stream | Event/log queue (Kafka-lite) | `XADD`, `XREADGROUP` |

**Cache-aside pattern** (most common):
```
read(key):
  v = redis.get(key)
  if v: return v          # HIT
  v = db.query(key)       # MISS → DB
  redis.set(key, v, ttl=300)
  return v
```

**Must-knows:**
- **Single-threaded core** — `KEYS *` on a large keyspace blocks everyone. Use `SCAN`.
- **Eviction:** `allkeys-lru` for pure cache; `noeviction` errors on writes (use as datastore only).
- **Redlock** distributed locks have correctness caveats under network partitions. Use etcd/ZK for critical locks.
- **2026 ecosystem:** Redis changed to SSPL license → Linux Foundation forked **Valkey** (BSD). AWS/GCP now default to Valkey. Redis 8 reverted to AGPL.
- **Cache stampede** = many requests rebuild the same expired key at once → add TTL jitter + single-flight lock.

---

### Kubernetes Networking & StatefulSets

**How Pods talk to each other:** Every Pod gets its own IP (flat network via CNI: Calico, Flannel, Cilium). A **Service** gives a stable virtual IP backed by kube-proxy IPVS rules that round-robin to healthy Pods. **DNS:** `servicename.namespace.svc.cluster.local` — Pods just use the short name `svc-name`.

**Service types:**

| Type | Scope | Use case |
|------|-------|---------|
| **ClusterIP** (default) | Cluster-internal only | Service-to-service |
| **NodePort** | Port on every node | Dev/testing |
| **LoadBalancer** | Cloud LB + public IP | Production ingress |
| **Headless** | No ClusterIP; DNS returns Pod IPs | StatefulSets, client-side LB |

**StatefulSets** give each Pod: a stable hostname (`pod-0`, `pod-1`, …), a dedicated PersistentVolume, and ordered creation/deletion. Critical for stateful workloads — Kafka brokers (`kafka-0`, `kafka-1`), ZooKeeper, Postgres (follower needs to know it's follower-0).

**Resource requests vs limits:**
```yaml
resources:
  requests:           # Scheduler reserves this on the node
    cpu: "250m"       # 250 millicores = 0.25 vCPU
    memory: "512Mi"
  limits:             # Hard cap — exceeding CPU = throttle; exceeding memory = OOMKill
    cpu: "1000m"
    memory: "1Gi"
```
Tip: set CPU request < limit (headroom for bursts); keep memory request ≈ limit (unpredictable OOMs are worse than throttle).

**HPA (Horizontal Pod Autoscaler):** scales Deployment replicas based on CPU, memory, or custom metrics (e.g., Kafka consumer lag via KEDA). Min/max replicas set bounds. Scale-out is fast (~seconds); scale-in is conservative (5-min default cooldown to prevent flapping).

**Pod Disruption Budgets (PDB):** guarantee `minAvailable` pods stay running during rolling updates and node drains. Essential for Kafka brokers and ZK quorums — you never want all replicas down simultaneously.

---

### Apache Flink (Tier 2 — Streaming)

> Flink is the successor to micro-batch Spark Streaming. True record-at-a-time, sub-second latency, exactly-once semantics.

**Flink vs Spark Structured Streaming:**

| | Spark Structured Streaming | Apache Flink |
|--|--------------------------|--------------|
| Model | Micro-batch (default 100ms–5s) | True streaming record-at-a-time |
| Latency | 100ms–5s | <10ms end-to-end |
| State management | Limited | First-class; RocksDB backend |
| Exactly-once | Yes (batch boundaries) | Yes (Chandy-Lamport checkpoints) |
| Native ML | SparkML | PyFlink; external models |

**When to use Flink:** fraud detection (<100ms decisions), live leaderboards, real-time feature computation for ML serving, anything where micro-batch latency is too high.

**Key Flink concepts:**
- **Event time + watermarks:** process events by *when they happened* (not when they arrived); watermark declares "events older than T are now late" → trade completeness for latency
- **State + checkpoints:** Flink saves state snapshots to S3 (Chandy-Lamport); on failure, restart from last checkpoint + replay Kafka offsets = exactly-once
- **Windows:** Tumbling (1-min buckets, non-overlapping), Sliding (last 5 min, re-evaluated every 1 min), Session (gap-based — "user active burst")

---

### Apache Spark

> Spark is a distributed in-memory processing engine — the successor to Hadoop MapReduce. 10–100× faster because intermediate results stay in RAM.

```
  One huge dataset (terabytes)
         │  split into partitions
  [worker] [worker] [worker] [worker]   ← process in parallel in RAM
  └─────────── combined result ─────────┘
```

**Critical mental model:**
- **Transformations are lazy** (`filter`, `join`, `select` build a plan)
- **Actions trigger work** (`count`, `write`, `collect` — now it runs)
- **Catalyst optimizer** optimises the whole DAG before executing

**#1 Spark performance killer:** the SHUFFLE (groupBy, join, distinct move data across the network). Fix: `broadcast(small_df)` for small-table joins; filter early; use AQE.

**Adaptive Query Execution (AQE)** — enabled by default since Spark 3.2:
- Dynamically coalesces post-shuffle partitions (kills tiny-file trap)
- Switches sort-merge join → broadcast join if one side is small
- Splits skewed partitions automatically

**Common Spark anti-patterns:**

| Anti-pattern | Fix |
|---|---|
| `big_df.collect()` → driver OOM | `write` to storage; only `collect` small results |
| Recomputing expensive join 3× | `.cache()` after the join |
| Joining big + small without broadcast | `big.join(broadcast(small_dim), "key")` |
| Data skew (one key = 90% of rows) | Enable AQE skew-join; or manual salting |
| Python UDFs (row-at-a-time) | Use native columnar expressions (`col("f") - 32`) |

---

### The Modern Data Stack: End-to-End Flow

```
  ┌── ORCHESTRATION: Airflow / Dagster / Prefect ──────────────────┐

   SOURCES    1. INGEST      2. STORE       3. PROCESS      4. SERVE
   apps    ▶  Kafka       ▶  S3 + Iceberg ▶  Spark/dbt   ▶  Snowflake
   DBs     ▶  CDC/Flink   ▶  = LAKEHOUSE  ▶  Flink/Ray   ▶  Redis/PG

  ┌── OBSERVE: Prometheus + Grafana + OTel   PROVISION: Terraform ──┘
```

**Two paths:**
- **Batch path** (default): data lands in lakehouse → Spark/dbt transform on schedule → warehouse → BI
- **Streaming path** (when seconds matter): Kafka → Flink → Redis/DB → live dashboard

**Parquet** = columnar file format; 10–30× compression; predicate pushdown reads only relevant columns. Standard for lakehouses.

**Iceberg/Delta** = open table formats on S3. Add: ACID transactions on object storage, time travel, schema evolution, row-level deletes.

**Prometheus + Grafana:** pull-based scraping; PromQL for rate/percentile queries; alert on **symptoms users feel** (latency, error rate = golden signals), not internal metrics. **OpenTelemetry** (OTel) is the 2026 standard: instrument once, send to any backend.

**Terraform:** declarative IaC (`terraform plan` → review diff → `terraform apply`). Remote state in S3 + DynamoDB lock. Never hand-edit resources Terraform owns.

---

### PostgreSQL (Full Depth)

> Postgres is the "just use Postgres" strategy — a legitimate architecture decision for most applications given its feature set: ACID, JSONB, pgvector, PostGIS, full-text search.

**Indexes — the #1 performance lever:**

| Index type | Use case |
|---|---|
| **B-tree** | Default; equality + range queries on sortable data |
| **GIN** | JSONB fields, arrays, full-text search |
| **GiST** | Geospatial (PostGIS), range overlap |
| **HNSW** | Vector similarity (pgvector) |

`EXPLAIN ANALYZE` is the single most useful debugging tool. Look for:
- `Seq Scan` on a large table with a selective filter → missing index
- `rows=1` vs `actual rows=42000` → stale statistics, run `ANALYZE`
- `Sort spill to disk` → raise `work_mem`

**Scaling path (climb only as needed):**
```
  1. Add indexes and fix queries       (solves 80% of "slow queries")
  2. Vertical scale                    (bigger box; most apps stop here)
  3. Read replicas + PgBouncer         (scale reads; mandatory connection pooling)
  4. Table partitioning                (by date/range for large append-only tables)
  5. Shard / NewSQL (Citus, Spanner)   (last resort; adds massive complexity)
```

**PgBouncer is practically mandatory at scale:** each Postgres connection costs ~5–10 MB. 200 pods × 30 connections = 6,000 backends → DB OOMs. PgBouncer in transaction mode multiplexes thousands of app connections onto ~100 real backends.

**Common Postgres pitfalls:**

| Problem | Cause | Fix |
|---------|-------|-----|
| Sudden slow query | Stale table statistics | `ANALYZE table_name` |
| "Too many connections" | Direct connections without pooler | Add PgBouncer |
| Table keeps growing | MVCC dead tuple bloat | Tune autovacuum; `VACUUM ANALYZE` |
| N+1 from ORM | One query per row | JOIN or `WHERE id IN (...)` batch |
| `OFFSET 100000` is slow | Scans + discards 100k rows | Keyset pagination: `WHERE id > $last_id` |

**Replication types:**
- **Physical (WAL streaming):** byte-for-byte copy; hot standby reads; must be same major version
- **Logical:** row-level change events; selective (per-table); cross-version; foundation of CDC (Debezium)
- **Synchronous replication:** zero RPO; adds 1ms intra-AZ, 30–100ms cross-region (unacceptable for OLTP cross-region)

---

### Cassandra / ScyllaDB (Tier 3 Situational)

> Built for "never go down + massive write volume." Masterless peer-to-peer; any node can take writes.

**Key concept — query-first data modeling:**
```sql
-- Design tables AROUND the specific query, not around entities
CREATE TABLE messages (
  user_id uuid, sent_at timestamp, body text,
  PRIMARY KEY (user_id, sent_at)   -- partition by user, sort by time
) WITH CLUSTERING ORDER BY (sent_at DESC);
```

**Why writes are fast:** LSM-tree store — writes append to in-memory memtable + commit log; later flushed to immutable SSTables. No slow random in-place updates. Cost: read amplification + periodic compaction.

**Tunable consistency:** `ONE` (fast, weak) → `QUORUM` (majority) → `ALL` (strong, slower). Trick: `QUORUM` reads + `QUORUM` writes = strong consistency on an otherwise-AP system.

**Use when:** enormous write volume, multi-region HA, time-series/event data, queries known upfront. **Avoid when:** you need ad-hoc queries, joins, or small-scale apps.

---

### Elasticsearch / OpenSearch (Tier 3 Situational)

> Full-text search engine built on Lucene. The inverted index turns "word → documents" lookups into millisecond results.

**Inverted index:** stores `word → [list of documents]` instead of `document → words`. Searching "headphones" jumps straight to the matching doc list — no scanning.

**BM25:** modern relevance ranking that dampens TF growth (repeated word isn't 100× more relevant) and normalises document length. Default in Elasticsearch since v6.

**Key gotchas:**
- Not a system of record — keep source of truth in Postgres, index into ES
- Shard count is fixed at index creation; resharding = full reindex
- JVM GC pauses can cause latency spikes; avoid high-cardinality label usage (user IDs as field values)

---

> ✅ **Must-remember**
>
> - **Tier 1 is non-negotiable:** Docker, K8s, Kafka, Redis, Postgres, S3, Spark.
> - **K8s liveness probe:** process health only — never check downstream DBs.
> - **Kafka:** `acks=all` + `min.insync.replicas=2` for durability; offset = replay from any point.
> - **Redis:** sub-ms speed layer, NOT a system of record; `SCAN` not `KEYS *`.
> - **Spark shuffle = enemy;** broadcast small tables, filter early, let AQE help.
> - **Outbox + CDC** = reliable DB-to-event propagation without dual-write hazard.
> - **PgBouncer** is practically mandatory at scale — Postgres connections are expensive.

---

## Ch 23 — System Design Pt 1: Foundations & Protocols

> 💡 **In a sentence —** The foundations of every scalable system are a handful of laws about queues and tails, plus protocol knowledge to pick the right transport for each job.

---

### Core Scalability Concepts

**Vertical vs Horizontal Scaling:**

```
  VERTICAL (scale UP)           HORIZONTAL (scale OUT)
  ───────────────────           ─────────────────────
  Bigger server (CPU/RAM)        Add more boxes + LB
  Simple; hardware ceiling        Near-infinite ceiling
  Single point of failure         Resilient to node loss
```

> **Modern default:** horizontal for web tier; vertical for DB (until you must shard).

**The Nines — burn this into memory:**

```
  Availability   Downtime/year
  99%    (2 9s)  ≈ 3.65 days
  99.9%  (3 9s)  ≈ 8.76 hours
  99.99% (4 9s)  ≈ 52.6 minutes
  99.999%(5 9s)  ≈ 5.26 minutes
```

**Latency vs Throughput:** latency = how long one request takes; throughput = how many per second. Independent. Always quote **p50/p95/p99** — never "average."

**Little's Law:**
```
  L = λ × W
  (items in system) = (arrival rate) × (avg time in system)

  Pool sizing: 500 QPS × 0.020s × 1.5 safety = 15 connections/instance
```

**Tail-latency amplification:** fan out to 10 backends, each p99=100ms → user p99 ≈ p999 of one backend. Fan-out of 100 → your p99 becomes that backend's p99.99.

> Fix: **hedged requests** (Jeff Dean) — issue to replica A; if no response by p95, send to replica B; use whichever answers first. p99 collapses toward p50 at ~5% extra RPS.

**Amdahl's Law:** speedup ≤ 1/(s + (1−s)/N). With 10% serial work, cap is **10× regardless of cores**. Find and shrink the serial choke point (usually a shared DB, global lock, or auth service).

---

### Protocol Stack

```
  OSI Layer    TCP/IP Layer    Examples
  ─────────    ────────────    ────────
  7. App                       HTTP, gRPC, DNS
  6. Pres       Application    TLS, JSON
  5. Session                   (cookies)
  4. Transport  Transport      TCP, UDP, QUIC
  3. Network    Internet       IP (v4/v6), ICMP
  2. Data Link  Link           Ethernet, Wi-Fi
```

**TCP vs UDP:**

| | TCP | UDP |
|--|-----|-----|
| Connection | 3-way handshake | None |
| Reliability | Ack + retransmit | Fire & forget |
| Ordering | Guaranteed | None |
| Overhead | 20+ byte header | 8 byte header |
| Use case | HTTP, SSH, DB | DNS, video, gaming, QUIC |

**Rule:** if a missing packet ruins meaning → TCP. If a missing packet is just a skipped frame → UDP.

**TLS handshake evolution:**
```
  TLS 1.2  → 2 RTT before first HTTP byte
  TLS 1.3  → 1 RTT (0-RTT on resumption)
  QUIC/HTTP3 → 1 RTT cold, 0-RTT resumed (handshake fused with transport)
```

---

### API Styles

| Style | Best for | Weakness |
|-------|----------|----------|
| **REST** (HTTP+JSON) | Public APIs, browsers, caches | Over-fetching, chatty |
| **gRPC** (HTTP/2+Protobuf) | Internal microservices, polyglot | Browsers need proxy |
| **GraphQL** | Flexible client queries (mobile/web) | Hard to cache, N+1 trap |
| **WebSocket** | Bidirectional real-time (chat, games) | Stateful, scaling harder |
| **SSE** | Server→client push only (feeds, tickers) | One-way only |

**Quick decision tree:**
```
  Real-time bidirectional?   → WebSocket
  Server-push only?          → SSE
  Internal service-to-svc?   → gRPC
  Flexible UI queries?       → GraphQL
  Otherwise                  → REST
```

**Idempotency:** POST is not idempotent by default. Use `Idempotency-Key` header; server stores `(key → response)` and replays it on retry. Critical for payments, emails, any state change. Scope: per-account + per-endpoint; window: 24 hours (Stripe model).

**gRPC deep-dive (the Google internal standard):**
```
  Protocol Buffers (IDL)     - define schema once, generate code in any language
  HTTP/2                     - multiplexed streams over ONE connection (no head-of-line blocking per request)
  Bidirectional streaming    - server-streaming, client-streaming, full-duplex
  Strict typing              - binary wire format ~10× smaller and faster to parse than JSON
```

gRPC streaming patterns:

| Pattern | Use case |
|---------|---------|
| Unary | Standard request/response (like REST) |
| Server streaming | Real-time alerts, log tailing |
| Client streaming | File upload, sensor data ingestion |
| Bidirectional | Chat, live collaborative editing |

**Why HTTP/2 matters for gRPC:** a single TCP connection carries many concurrent streams (one per gRPC call). No connection-per-request overhead. Multiplexing means a slow RPC doesn't block a fast one (unlike HTTP/1 pipelining). Header compression (HPACK) reduces overhead. This is why Google uses gRPC for nearly all internal service communication.

**Protobuf schema evolution rules:** always add fields with new field numbers; never reuse or remove field numbers (the binary format encodes field numbers, not names). Mark deprecated fields `reserved`.

---

### Load Balancing & Traffic Management

**L4 vs L7:**

| | L4 (transport) | L7 (application) |
|--|----------------|-------------------|
| Sees | IP + port only | URL, headers, cookies, body |
| TLS | Passes through encrypted | Terminates, can re-encrypt |
| Smart features | None (can't read HTTP) | Canary, WAF, rate-limits, sticky sessions |
| Examples | AWS NLB, HAProxy TCP mode | AWS ALB, nginx, Envoy |

Real systems use **both layered:** L4 LB (Anycast IP) → fleet of L7 proxies.

**LB algorithms:** Round Robin, Weighted RR, Least Connections, IP Hash (sticky), **Power of Two Choices** (pick 2 random, route to less loaded — best for variable request cost).

**Rate limiting algorithms:**
```
  TOKEN BUCKET   — allows bursts up to bucket size; AWS/Stripe default
  LEAKY BUCKET   — smooths to constant rate
  FIXED WINDOW   — simple; 2× burst at boundary (bug)
  SLIDING WINDOW — rolling 60s; fixes boundary bug
```

**Circuit breaker:**
```
  CLOSED ──(failures > threshold)──▶ OPEN
    ▲                                  │ cooldown
    └────(successes)────── HALF-OPEN ◀─┘
```
Fail fast when downstream is unhealthy; let it recover.

---

### Caching (Quick Reference)

**Strategies:**
1. **Cache-aside** (lazy, most common): app reads cache, on miss loads DB and stores
2. **Read-through**: cache loads from DB on miss (transparent to app)
3. **Write-through**: write to cache and DB synchronously
4. **Write-back**: write to cache, flush to DB async (risky on crash)

**Eviction:** LRU (default), LFU (hot-set stable), TTL-only (sessions), W-TinyLFU (Caffeine — near-optimal).

**Three cache attacks:**

| Attack | What happens | Defence |
|--------|-------------|---------|
| **Penetration** | Keys that don't exist hit DB | Cache negative results; Bloom filter |
| **Breakdown/Stampede** | Hot key expires, thousands miss | Single-flight lock; probabilistic early expiry |
| **Avalanche** | Many keys expire at once | Randomise TTLs ±20%; pre-warm on startup |

**Multi-tier:** L1 in-process (Caffeine, ~100 ns) → L2 Redis (~1 ms) → L3 read replica (~5 ms) → Primary DB (~50 ms).

---

### CDN (Content Delivery Network)

> A CDN is a global cache of static assets placed close to users. Instead of every European user hitting your US origin, they hit a London PoP (Point of Presence) ~5ms away.

**How it works:**
```
  User (London) ─▶ CDN PoP (London) ─▶ Cache HIT → serve from edge
                                       Cache MISS → origin pull → cache → serve
```

**Anycast routing:** CDN uses BGP anycast — all PoPs share the same IP; routers automatically send traffic to the nearest one. Users get geographic proximity without any DNS magic from the application.

**Push vs Pull:**

| | Pull CDN | Push CDN |
|--|---------|---------|
| Model | First request → origin; cached on edge | You proactively upload assets to edge |
| Best for | Dynamic content, long-tail URLs | Static files (fonts, installers) you control |
| Cache invalidation | TTL + `Cache-Control: max-age=31536000, immutable` | Manual purge API |

**What to CDN:** JS/CSS/images (long TTL + content-hash filenames), video chunks (HLS segments), API responses for public-read data (short TTL), DDoS absorption (edge drops bad traffic before origin).

**`Cache-Control` cheat sheet:**
```
  Cache-Control: max-age=3600           → CDN and browser cache for 1 hour
  Cache-Control: no-cache               → always revalidate (not no-store!)
  Cache-Control: s-maxage=3600          → CDN only, 1 hour
  Cache-Control: immutable              → never revalidate (for content-hashed assets)
  Vary: Accept-Encoding                 → separate cache entry per encoding
```

---

### DNS (Domain Name System)

**Resolution path:** Browser cache → OS cache → Resolver (ISP/8.8.8.8) → Root nameserver → TLD nameserver → Authoritative nameserver → IP.

**TTL:** lower TTL = faster failover; higher TTL = fewer lookups, better performance. Standard: 300s (5 min) for services that need agile failover; 3600s for stable origins.

**DNS-based load balancing:**
- **Round-robin:** multiple A records returned; browser picks one. Simple but no health checks.
- **Weighted routing:** e.g., Route 53 weighted records for gradual traffic shifting.
- **Latency-based routing:** Route 53 / Cloud DNS returns the closest region's IP.
- **Geo-routing:** return different IPs based on user's country (data sovereignty, low latency).

**GeoDNS + Anycast** together is how CDNs and large-scale systems (Cloudflare, Fastly) route traffic globally without per-request intelligence at the origin.

---

> ✅ **Must-remember**
>
> - **5 nines = 5.26 min/year downtime.** Always justify the level you pick.
> - **p99, not average.** At Google scale, 1 in 100 = millions of users.
> - **L4 vs L7:** L4 routes by IP/port; L7 routes by URL/header.
> - **Idempotency key** is mandatory for any non-idempotent HTTP call that will be retried.
> - **Token bucket** allows bursts; sliding window is most accurate for rate limiting.
> - **Hedged requests** collapse p99 toward p50 at ~5% extra RPS cost.
> - **CDN + anycast:** always the first answer for static asset performance. Push CDN for known assets; pull CDN for long-tail URLs.

---

## Ch 24 — System Design Pt 2: Data & Distributed Systems

> 💡 **In a sentence —** Pick your database by access pattern, scale it up the ladder one rung at a time, and let theory (CAP/PACELC, Raft, consistent hashing) tell you exactly which bugs you'll hit and why.

---

### Databases: SQL vs NoSQL

**The core trade-off:**

| | SQL (relational) | NoSQL (non-relational) |
|--|-----------------|----------------------|
| Data model | Rows in typed tables | KV, document, wide-column, graph |
| Schema | Fixed, on-write | Flexible, on-read |
| Transactions | ACID across rows/tables | Often single-key; some multi-key |
| Scaling | Vertical easy; horizontal hard | Partitioned by design |
| Best fit | Relational data with invariants | Known access pattern at huge scale |

**Modern truth:** the dichotomy is dying. Postgres has JSONB, pgvector, full-text. Cassandra/DynamoDB added multi-key transactions. **Pick by access pattern, not by camp.**

**NoSQL family tree:**

```
  KEY-VALUE   → { key → value }     Redis, DynamoDB         sessions, caches
  DOCUMENT    → JSON blobs           MongoDB, Firestore       user profiles, orders
  WIDE-COLUMN → sparse row+columns   Cassandra, Bigtable      write-heavy, time-series
  GRAPH       → nodes + edges        Neo4j, Neptune           social graphs, fraud rings
  TIME-SERIES → timestamp + metrics  InfluxDB, TimescaleDB    monitoring, IoT
  SEARCH      → inverted index       Elasticsearch             full-text, log search
  VECTOR      → embeddings + ANN     pgvector, Qdrant          RAG, semantic search
  OLAP/Colmr  → columnar analytics   BigQuery, Snowflake       dashboards, GROUP BY billions
```

---

### ACID vs BASE

**ACID** (relational databases):
- **Atomicity:** all-or-nothing (WAL + rollback)
- **Consistency:** declared invariants always hold
- **Isolation:** concurrent txns don't step on each other; levels: Read Committed → Repeatable Read → Serializable (SSI in Postgres)
- **Durability:** committed writes survive crashes (`fsync` to WAL before ack)

**Isolation anomalies and fixes:**

| Anomaly | What | Fix |
|---------|------|-----|
| Lost update | Two txns read-modify-write; one silently lost | `UPDATE ... SET balance = balance - 30` (atomic) or `SELECT FOR UPDATE` |
| Write skew | Two txns each read a fact, each write different rows, together violate a constraint | `SERIALIZABLE` mode (SSI tracks dependency cycles) |
| Phantom read | Re-run range query returns new rows | Serializable or gap locks |

**BASE** (NoSQL philosophy): Basically Available, Soft state, Eventually consistent. Accepts writes immediately; replicas converge given time and no new writes.

---

### PostgreSQL Internals & Scaling Ladder

**MVCC:** row updates create new versions tagged with txn ID. Readers see a snapshot; writers create new versions. No read/write blocking. Cost: old versions need `VACUUM` to reclaim (autovacuum usually handles it; long-running txns block it → bloat).

**WAL (Write-Ahead Log):** append change to sequential log before mutating data pages. Sequential writes ~100× faster than random. `fsync(WAL)` before ack = durability. Checkpoints flush dirty pages in batches. WAL archiving to S3 = Point-in-Time Recovery (PITR).

**Scaling ladder (climb only as needed):**
```
  1. Index + query fix        (most "slow queries" need this)
  2. Vertical scale           (bigger box; most apps stop here)
  3. Read replicas            (route reads; mind lag)
  4. PgBouncer                (connection pooling — mandatory at scale)
  5. Table partitioning       (by date/range)
  6. Sharding / NewSQL        (last resort)
```

**N+1 query:** ORM loads N rows then 1 query per row = N+1 round trips. Fix: JOIN, `WHERE id IN (...)` batch, or DataLoader pattern.

**Schema migrations at scale — expand-contract:**
```
  1. EXPAND:    ADD COLUMN (nullable, instant metadata change)
  2. BACKFILL:  copy old→new in 10K batches
  3. MIGRATE:   flip reads to new column
  4. CONTRACT:  DROP old column
  Never ship in one big ALTER — it blocks writes on large tables.
```

---

### Database Scaling Deep-Dive

**Replication modes:**

| Mode | Durability | Throughput | Use |
|------|-----------|------------|-----|
| **Async** | May lose seconds of data | Highest | Postgres default |
| **Semi-sync** | Small loss window | High | MySQL Group Replication |
| **Sync** | Zero RPO | Lower | Cross-AZ HA; NOT cross-region |

> **The trap:** sync replication cross-region adds 30–100 ms to every write. Use sync within AZ, async cross-region.

**Sharding strategies:**

| Strategy | Pros | Cons |
|----------|------|------|
| **Range** | Good range scans | Hotspots on recent timestamps |
| **Hash** | Even distribution | Range queries hit all shards |
| **Directory** | Most flexible | Lookup is a SPOF |

**Sharding's hidden costs:** no cross-shard joins; no global secondary indexes; re-sharding is painful; distributed txns need 2PC/Sagas/NewSQL. **Never choose a shard key you'll want to change.**

**CQRS:** writes → normalized model (Postgres); reads → denormalized model (Elasticsearch, Redis). Sync via events. Great when reads vastly outnumber writes.

**Hot key mitigations:** CDN/cache the hot key; read replicas for the hot shard; salt the key (`key#1`…`key#N`, writers pick random, readers fan-out); adaptive routing.

---

### Distributed Systems Theory

**CAP Theorem (Brewer, 2000):** In a distributed store, pick at most 2 of: Consistency, Availability, Partition tolerance. Real networks partition → the real choice is **CP vs AP**.

```
  CP (refuse writes on minority side): Spanner, HBase, etcd, MongoDB (majority writes)
  AP (serve possibly stale data):       Cassandra, DynamoDB, Riak
  "CA" is a marketing word, not an architecture.
```

**PACELC (Abadi, 2010):** If Partition → A or C; Else → Latency or Consistency. Captures the *daily* trade-off (the E branch), not just rare partitions.

```
  PA/EL: Cassandra, DynamoDB     — availability + low latency always
  PC/EC: Spanner, sync-replica RDBMS — consistency always
```

**Consistency model spectrum:**
```
  Strongest ────────────────────────────────────────────▶ Weakest
  Linearizable  Sequential  Causal  Read-your-writes  Eventual
```

| Model | Plain English | Example |
|-------|---------------|---------|
| **Linearizable** | Every op appears atomic at a single global instant | etcd, ZooKeeper |
| **Causal** | If A happens-before B, every node sees A first | CRDTs |
| **Read-your-writes** | You always see your own writes | Sticky-session systems |
| **Eventual** | Given no new writes, replicas converge | DynamoDB default |

**Logical clocks (no global clock in distributed systems):**
- **Lamport timestamps:** total order consistent with causality
- **Vector clocks:** per-node counters; detects true concurrent updates (used by DynamoDB, Riak)
- **TrueTime (Spanner):** atomic clocks + GPS, exposes bounded uncertainty ~7ms; commit-waits out the window → external consistency

---

### Consensus: Raft in 6 Rules

```
  1. At most one leader per term.
  2. Leader handles all writes; replicates to followers.
  3. Entry committed once majority have it.
  4. Leader never overwrites/deletes log entries.
  5. Missing entries get backfilled by leader.
  6. Only nodes with up-to-date logs can win elections.

  Cluster sizing: tolerate f failures → need 2f+1 nodes
  3 nodes → f=1 (typical); 5 nodes → f=2 (prod etcd)
  Even numbers gain nothing.
```

Used in: etcd, Consul, CockroachDB, TiKV, MongoDB replica sets, Kafka KRaft.

**Consistent Hashing:** map keys and servers to a ring. Adding/removing a server reshuffles only `1/N` keys. Virtual nodes (vnodes) smooth load. Used in Cassandra, DynamoDB, Memcached, every CDN.

**Quorum math (N, W, R):**
```
  W + R > N  →  strongly consistent reads
  N=3, W=2, R=2  →  W+R=4 > 3  ✓ (default Dynamo quorum)
  N=3, W=1, R=1  →  eventually consistent (fast)
```

**Distributed locks:** use lease-based locks with a **fencing token** — a monotonically increasing number returned with the lock. The resource validates the token on every write; stale-lock holders are rejected. Redlock is NOT safe for critical correctness — use etcd/ZK instead.

**Bloom filter:** probabilistic "is this key in the set?". No false negatives; may have false positives. ~10 bits/element for 1% FPR. Used in Cassandra/RocksDB to skip disk lookups.

---

### Messaging & Streaming

**Queue vs Stream vs Pub/Sub:**

```
  QUEUE (SQS, RabbitMQ): each msg → one consumer; removed when acked
  STREAM (Kafka, Kinesis): immutable log; consumers read by offset; replay history
  PUB/SUB (Redis pub/sub): broadcast to all subscribers; fire-and-forget
```

**Delivery guarantees:**

| Guarantee | Meaning | How |
|-----------|---------|-----|
| **At most once** | May lose, never duplicate | Fire-and-forget |
| **At least once** | Never lose, may duplicate | Retry until ack; consumer must be idempotent |
| **Exactly once** | Never lose or duplicate | Kafka EOS (idempotent producer + transactional + read_committed) + idempotent sink |

**Kafka exactly-once = 3 pieces:** idempotent producer (seq numbers) + transactional producer (atomic multi-partition write) + consumer in `read_committed` mode.

**Stream processing concepts (Flink):**
- **Event time vs processing time** (use event time for billing/audit)
- **Windows:** tumbling (fixed, non-overlapping), sliding (overlapping), session (gap-bounded)
- **Watermarks:** declare "events older than T are now late" — trade completeness for latency
- **Exactly-once:** distributed snapshots (Chandy-Lamport); restore from last checkpoint + replay Kafka offsets

---

### Storage Systems & Data Processing

**Block vs File vs Object:**

```
  BLOCK (EBS): raw blocks, low latency, DB volumes, not shared
  FILE  (NFS, EFS): POSIX semantics, shared codebases, legacy apps
  OBJECT (S3, GCS): key → blob, infinite scale, 11-nines durability
                    S3 is strongly read-after-write consistent (since 2020)
```

**Data lake vs warehouse vs lakehouse:**

| | Lake | Warehouse | Lakehouse |
|--|------|-----------|-----------|
| Schema | On read | On write | On write, cheap storage |
| Storage | Object store | Proprietary columnar | S3 + Iceberg/Delta |
| Workloads | ML, exploration | BI, SQL | Both |

**ETL vs ELT:** ETL = transform before loading (classic). ELT = load raw, transform inside warehouse with dbt (modern default).

---

### Distributed Transactions

**The two-generals problem:** you cannot guarantee 100% reliable message delivery between two independent systems over an unreliable network — no distributed transaction is truly atomic without paying in availability or performance.

**2-Phase Commit (2PC):**
```
  1. PREPARE: Coordinator asks all participants to prepare; each votes yes/no
  2. COMMIT: If all say yes → coordinator sends COMMIT to all; else ABORT
  
  Problem: if coordinator crashes after PREPARE and before COMMIT,
  participants are "in-doubt" and blocked indefinitely (blocking protocol).
```
2PC is practical for same-DB-vendor cross-schema, XA transactions. **Avoid** across independent services in microservices — use Sagas instead.

**Saga Pattern (the practical alternative):**
```
  SAGA = sequence of local transactions; each step publishes an event
  On failure: compensating transactions undo previous steps
  
  Example: Order Saga
    1. Create Order (OrderService)       ✓
    2. Reserve Inventory (InventoryService) ✓
    3. Process Payment (PaymentService)   ✗ FAILS
    → Execute compensating txns:
       Cancel inventory reservation
       Cancel order
```

**Choreography vs Orchestration:**

| | Choreography | Orchestration |
|--|-------------|---------------|
| Model | Each service reacts to events (pub/sub) | Central saga orchestrator sends commands |
| Coupling | Lower (no central brain) | Higher (orchestrator knows all steps) |
| Visibility | Hard to trace | Easy to trace and monitor |
| Failure handling | Distributed (complex) | Centralised (easier to retry) |

**Rule:** Use **orchestration** (Temporal, Apache Conductor) for long-running multi-step workflows with complex compensation. Use **choreography** for simpler 2–3 step flows.

**Outbox + CDC (revisited):**
```
  Service writes business data + outbox event in ONE local transaction
  CDC relay (Debezium reads Postgres WAL) → publishes to Kafka
  
  Guarantees: event is published iff business txn commits.
  No need for XA or 2PC. At-least-once delivery → idempotent consumers.
```

---

### Lambda vs Kappa Architecture

| | Lambda | Kappa |
|--|--------|-------|
| **Batch layer** | Yes (Spark, recomputes everything) | **None** |
| **Speed layer** | Yes (Flink/Storm, serves recent data) | Kafka + Flink (everything is stream) |
| **Serving layer** | Merged result of both | Single stream output |
| **Complexity** | Two codebases to maintain | Unified codebase; replay from Kafka |
| **Use when** | Need both exact historical + fast recent | Kafka retention covers your replay needs |

**Modern default:** Kappa, because Kafka has long retention (days/weeks) and Flink can replay from any offset to recompute history.

---

> ✅ **Must-remember**
>
> - **Isolation levels:** Read Committed (Postgres default); Serializable (SSI) is only level that prevents write skew.
> - **Scaling ladder:** index → cache → replicas → PgBouncer → shard. Most apps live at rung 2–3.
> - **CAP:** in a partition, CP refuses; AP serves possibly stale. "CA" doesn't exist.
> - **Raft:** 2f+1 nodes for f failures; leader elected by majority; never even numbers.
> - **Outbox + CDC:** reliable DB-to-Kafka without dual-write; use Debezium to read WAL.
> - **Consistent hashing + vnodes** minimises reshuffling when adding/removing nodes.
> - **Sagas** (not 2PC) for distributed transactions across microservices — compensating txns on failure.

---

## Ch 25 — System Design Pt 3: Operations & Case Studies

> 💡 **In a sentence —** Production reliability is error budgets + blameless postmortems + layered security + the three observability pillars, with an 8-step interview framework and an Instagram worked example to tie it all together.

---

### Reliability & Fault Tolerance

**Redundancy patterns:**
```
  ACTIVE-ACTIVE:  both nodes serve traffic; needs conflict resolution
  ACTIVE-PASSIVE: primary serves; standby idles until failover
  N+1:            N working + 1 spare (common in racks/clusters)
```

**RTO vs RPO:**
```
  RTO (Recovery Time Objective) — how fast must you recover?
  RPO (Recovery Point Objective) — how much data loss is acceptable?

  DR strategies (cheap → expensive):
  Cold standby   hours-days    backups, restore on demand
  Warm standby   minutes       smaller replica, scale up
  Hot standby    seconds       full replica, instant takeover
  Multi-active   zero          both regions serving live traffic
```

**Retry strategies:**
```
  Naive retry:         1s, 1s, 1s …       thundering herd ✗
  Exponential backoff: 1s, 2s, 4s, 8s …  calms the herd ✓
  + Jitter:            ± random 50%       desynchronises clients ✓✓
  + Cap + max attempts                    essential ✓✓✓
```

**Cascading failure chain & defences:**
```
  downstream slows → upstream threads pile up → connection pool exhausts
  → upstream rejects → callers retry → load triples → everything fails
```
Defences: circuit breakers, timeouts everywhere, retry budgets (max 10% of normal RPS), load shedding (return 503 quickly), bulkheads (per-tenant pools), backpressure.

**Error budgets:**
```
  SLO = 99.9% over 30 days → budget = 0.1% ≈ 43.2 min/month
  Budget spent → feature freeze; only reliability work ships
  Budget intact → take more risks; ship faster
```
Error budgets turn "should we ship?" from politics into math.

---

### Security

**OAuth 2.0 flow (Authorization Code + PKCE):**
```
  1. Client generates code_verifier + code_challenge = SHA256(verifier)
  2. Browser → /authorize?code_challenge=...
  3. User logs in & consents → redirect with ?code=AUTH_CODE
  4. Client → /token POST  (code + code_verifier)
  5. Server checks: SHA256(code_verifier) == stored challenge
  6. Returns access_token (short) + refresh_token (long)
```
A stolen auth code is useless without the original verifier. Always use PKCE for SPAs and mobile apps.

**JWT:** stateless (token = proof, no server state). Signed, not encrypted — don't put secrets in payload. Hard to revoke → keep TTL short (minutes/hours) + refresh token strategy.

**Encryption layers:**

| Layer | How | Tools |
|-------|-----|-------|
| **In transit** | TLS 1.3+ everywhere | HTTPS, gRPC-TLS, DB TLS |
| **At rest** | Disk-level or envelope encryption | AWS KMS, GCP Secret Manager |
| **End-to-end** | Only endpoints decrypt | Signal protocol |
| **Passwords** | Slow hashes with salt | bcrypt, scrypt, Argon2id |

**OWASP Top 10 quick defences:**

```
  SQL injection  → parameterised queries (always, no exceptions)
  XSS            → encode output; Content-Security-Policy
  CSRF           → SameSite=Lax cookies + anti-CSRF tokens
  SSRF           → allowlist outbound destinations
  Broken auth    → MFA, short-lived tokens, bcrypt passwords
```

**mTLS (mutual TLS):** both sides present certs. Standard in zero-trust (Google BeyondCorp). Service mesh (Envoy sidecar) terminates mTLS automatically — apps see plain HTTP. Identity is **cryptographic**, not subnet-based.

**STRIDE threat modelling:**
```
  S poofing     → authentication, MFA
  T ampering    → integrity (HMAC, signatures, TLS)
  R epudiation  → audit logs, signed events
  I disclosure  → encryption, access controls
  D denial      → rate limits, autoscaling, shedding
  E elevation   → RBAC, least privilege
```

---

### Observability

**Three pillars:**
```
  LOGS    — discrete events: "user 42 logged in at T"
  METRICS — aggregates:      "requests/sec = 1200"
  TRACES  — request lifelines:"svc A→B→C, 12ms total"
```

**Google SLI/SLO/SLA:**

| Term | What |
|------|------|
| **SLI** | Measurement (e.g., availability = good / total responses) |
| **SLO** | Target (e.g., 99.9% over 30 days) |
| **SLA** | Contract with consequences for missing SLO (refunds) |
| **Error budget** | 100% − SLO = allowable failure |

**Four Golden Signals (Google SRE):** Latency, Traffic, Errors, Saturation. Alert on these, not on internal CPU metrics.

**RED** (for request-driven services): Rate, Errors, Duration.
**USE** (for resources): Utilization, Saturation, Errors.

**Distributed tracing:** propagate `trace_id` in HTTP headers (`traceparent`); each service attaches spans. Identifies which service in a fan-out was slow.

**OpenTelemetry** = 2026 CNCF standard: one SDK, many backends (Prometheus, Jaeger, Datadog, Honeycomb). Instrument once, switch backends without re-instrumenting.

---

### Deployment Strategies

| Strategy | Rollback | Cost | When |
|----------|----------|------|------|
| **Rolling** | Slow | Normal | Default; simple services |
| **Blue/Green** | Instant (flip LB) | 2× cost | Zero-downtime mandatory |
| **Canary** | Instant | ~Normal | Risk-aware; needs metrics |
| **Shadow** | N/A (drop responses) | 2× backend | Safe prod load testing |
| **Feature flag** | Flip flag | Normal | Decouple deploy from release |

**GitOps:** Git = source of truth; ArgoCD/Flux reconciles cluster. `git revert` rolls back infrastructure.

**Probes (from Ch 22 cross-ref):** liveness (restart), readiness (traffic), startup (slow boot). Don't check downstream in liveness.

---

### Multi-Region Architecture

**Three topologies:**
- **Active-passive:** one region serves, other is standby. Simpler; higher RTO.
- **Active-active (read local, write global):** reads are local; writes may be global with cross-region replication. Complex conflict resolution.
- **Active-active (multi-master):** writes go to nearest region; requires CRDT/last-write-wins/business-level conflict resolution. Maximum availability.

**Data sovereignty:** row-level pinning — EU rows live only in EU region. Spanner, CockroachDB, YugabyteDB support this natively.

---

### Common Anti-Patterns (for Interview)

| Anti-pattern | What it is | Fix |
|---|---|---|
| **Distributed monolith** | Services split but deployed lockstep; shared DB | Enforce schema boundaries; async events |
| **Premature sharding** | Sharding before hitting write ceiling | Postgres handles 10 TB on one beefy box; index first |
| **Cache as source of truth** | Redis holds data not reproducible from DB | Cache must be rebuildable from DB |
| **No timeouts** | Infinite calls; common cause of cascading failure | Connect timeout (1s) + read timeout (3–10s) always |
| **Retry storms** | Retries multiply load on failing service | Exponential backoff + jitter + circuit breakers |
| **"Eventually consistent" hand-wave** | Unspecified staleness window | Be specific: "< 5s p99, never shows duplicates" |
| **Snowflake servers** | Hand-configured, no IaC | Everything in git; cattle, not pets |

---

### The 8-Step Interview Framework

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

**Back-of-envelope cheat sheet:**
```
  1 day ≈ 86,400 s ≈ 10⁵ s
  100M users × 10 actions/day = 10⁹/day ≈ 12K RPS
  × 1KB each = 1 TB/day, ~365 TB/year
```

**Jeff Dean's latency numbers:**
```
  L1 cache reference          0.5 ns
  L2 cache reference            7 ns
  Main memory                 100 ns
  SSD random read              16 µs
  Same datacenter RTT         0.5 ms
  Disk seek                    10 ms
  US ↔ Europe RTT             150 ms
```
Key lesson: network >> memory >> CPU. Batch + sequential >> random.

---

### Case Studies: Applying the 8-Step Framework

**Worked Example 1 — URL Shortener (bit.ly)**

| Step | Answer |
|------|--------|
| **Clarify** | 1B URLs/day, 10:1 read:write, redirect in <10ms, 5-year retention |
| **Estimate** | 11K writes/s, 110K reads/s; 500B × 5yr = 2.5TB storage (base62 IDs) |
| **API** | `POST /shorten` → `{short_url}`; `GET /{code}` → 301/302 redirect |
| **Data** | `urls` table: code (PK), long_url, created_at, ttl — Postgres (simple KV fits) |
| **High-level** | Client → CDN/LB → App servers → Redis cache (hot codes) → Postgres |
| **Deep-dive** | ID generation: base62(random 7 chars) or hash first 7 chars of MD5(long_url); collision check insert-or-retry. Cache: code → long_url in Redis, TTL 24h. |
| **Bottleneck** | 301 (permanent) vs 302 (temporary): 301 = browser caches, no repeat hits but can't track clicks. 302 = every click hits your servers, accurate analytics. |
| **Trade-offs** | 301 scales better; 302 gives analytics. Pick based on business need. |

**Worked Example 2 — Instagram-scale News Feed (read-heavy)**

| Step | Answer |
|------|--------|
| **Clarify** | 500M daily users, median 100 followers, 1–10 photos/day, feed freshness < 5 min |
| **Estimate** | ~1M photo uploads/day; 500M × 20 feed reads/day = 10B reads/day ≈ 116K RPS |
| **Fan-out strategies** | Push on write (precompute feed at upload time → fast read); Pull on read (compute at request time → slow read). Instagram uses **hybrid:** push for regular users, pull for celebrities (>10M followers). |
| **Deep-dive** | Feed stored as sorted set in Redis keyed by user_id+timestamp. Object store (S3) for photos. CDN for image delivery. Graph DB or Postgres adjacency list for follow relationships. |
| **Bottleneck** | Celebrity (10M followers) upload → 10M fan-out writes in seconds → spike. Fix: async Kafka queue; pull celebrity posts at read time (mixed strategy). |
| **Key lesson** | The fan-out strategy is the core design decision. Always ask: read-heavy or write-heavy? Push-on-write optimises reads; pull-on-read is simpler but slower. |

---

### Monitoring & Alerting Best Practices

**Alert on symptoms, not causes:**
```
  ✓ Alert: p99 latency > 2s    ← users are hurting
  ✗ Alert: CPU > 70%           ← doesn't mean users notice
  ✓ Alert: error rate > 1%     ← users getting errors
  ✗ Alert: pod restart count   ← might be spurious
```

**Runbook-driven alerts:** every alert must have a linked runbook. If the on-call doesn't know what to do, the alert fires noise. Rule: one page at most per alert per shift.

**SLO-based alerting (burn-rate alerting — Google SRE):**
```
  SLO = 99.9%; budget = 0.1% over 30 days = 43.2 min
  
  Burn rate > 1x = spending budget at exactly the rate that burns it in 30 days
  Burn rate > 14.4x for 1h = burning 1 hour's worth in 5 min → page immediately
  Fast burn: high burn rate, short window (15min); catches acute incidents
  Slow burn: moderate rate, long window (6h); catches slow leaks
```

This is the Google SRE approach to avoiding alert fatigue while catching both fast and slow reliability degradations.

---

> ✅ **Must-remember**
>
> - **Error budget = contract:** budget spent → freeze features; budget intact → ship faster.
> - **Retry rule:** exponential backoff + jitter + cap + circuit breaker.
> - **mTLS + PKCE** are the Google-style auth primitives for internal service mesh and public clients.
> - **SLI/SLO/SLA/error budget** are Google's reliability vocabulary — use them fluently.
> - **8-step framework:** Clarify → Estimate → API → Data → High-level → Deep-dive → Bottlenecks → Trade-offs.
> - **Never specify "eventually consistent" without a concrete staleness window.**
> - **Alert on symptoms (p99 latency, error rate), not causes (CPU %).**

---

## Ch 26 — ML System Design (Google)

> 💡 **In a sentence —** ML system design is a six-step story: Frame → Metrics → Data → Model → Serve → Monitor — and every step has a specific set of traps that distinguish practitioners from people who've only trained models.

---

### The Six-Step Playbook

Mnemonic: **"Please Make Data, Model Smartly, Monitor"** → Problem · Metrics · Data · Model · Serving · Monitoring

**Interview time allocation:** ~5 min framing, ~5 min metrics, ~8 min data/features, ~10 min model, ~10 min serving, ~7 min monitoring. Spend the first 30 seconds *thinking*, not talking.

---

### Step 1: Frame the Problem

**Always ask before drawing boxes:**

| Question | Why it matters |
|----------|----------------|
| What are we optimizing — watch time, retention, satisfaction? | Goal picks the metric and the label |
| How many users / items? | Determines whether you can rank everything per request |
| Latency budget? | "< 300ms" rules out heavy models on the full corpus |
| Safety / fairness constraints? | Kids' content, regional law, creator fairness all constrain design |

**The most important decision — choosing the label:**

> Optimize for **clicks** → thumbnails of screaming faces (clickbait).
> Optimize for **raw watch time** → 3-hour drone videos.
> **Fix:** composite label — `click AND meaningful-watch AND positive-signal`, weighted to balance engagement with satisfaction.

**Soundbite:** *"Optimizing the wrong label is how recommendation systems get good at making users miserable. I'd predict a composite engagement-and-satisfaction signal, not raw clicks."*

---

### Step 2: Metrics

**Offline metrics (dress rehearsal):**

| Problem type | Metric | When to use |
|---|---|---|
| Classification | Precision / Recall | General classification |
| Imbalanced | **PR-AUC** | Fraud, spam (ROC-AUC flatters on imbalanced) |
| Ranking | **NDCG@k** | Rewards best items at the top |
| Probability quality | **Log loss / calibration** | When scores drive decisions (money) |
| Generation | Perplexity, LLM-as-judge | n-gram overlap (BLEU/ROUGE) is a weak proxy |

**Offline/online disagreement:** model gains 3% NDCG offline but loses 1% CTR live. Usual suspects: distribution shift, feature leakage, position bias (offline data reflects what was shown top), proxy mismatch.

**Online metrics (opening night):** CTR, session watch time (North Star), 7-day retention, satisfaction surveys — measured via A/B test on live traffic.

**Guardrail metrics:** a CTR win must NOT hurt satisfaction, revenue, or p99 latency. If it does, don't ship.

---

### Step 3: Data & Features

**Label collection:**
- **Implicit** (clicks, watch time): free, infinite, noisy
- **Explicit** (ratings, thumbs): clean, slow, expensive
- **Real-world answer:** train on implicit, calibrate/validate with explicit

**Three data traps:**
1. **Missing data is rarely random** — add `is_missing` flag; tree models handle natively
2. **Label noise** — click+instant-bounce logged as positive; require dwell > N seconds
3. **Selection bias** — you only see what you already chose to show (the front-row problem). Fix: 1–5% exploration traffic (epsilon-greedy); Inverse Propensity Scoring (IPS)

**Feature families:**

| Family | Captures | Example |
|--------|----------|---------|
| **User** (who) | history, taste | `watch_rate_7d`, `user_embedding` |
| **Item** (what) | properties | `category`, `title_embedding`, `freshness` |
| **Context** (when/where) | the moment | `time_of_day`, `device`, `session_depth` |
| **Cross** (chemistry) | interactions | `user × category affinity` |

Cross features win: "this user's click-rate *on cooking videos*" predicts far better than overall click-rate + category separately. Google's Wide & Deep + DCN learn these automatically.

**Training-serving skew = #1 silent killer:**
> Training computes a feature in Python/batch; serving computes it in C++/real-time — differently. Model silently falls apart live.

**Fix — Feature Store** (e.g., Vertex AI Feature Store): one shared definition, served both batch (for training) and online (for inference) with point-in-time correctness. Training and serving physically cannot drift apart.

```
  Slow-cooked features (overnight): 30-day watch rate, user embeddings
  Made-to-order features (per request): what you tapped 3 seconds ago
  Feature store plates both together.
```

---

### Step 4: Model Architecture

**Always start with a baseline:** sort by popularity — no ML. If ML can't beat that, don't use ML.

**The multi-stage funnel (Google's standard):**

```
  800M items → RETRIEVAL → ~1,000 → RANKING → ~100 → RE-RANK → ~25 shown
               two-tower            DCN                diversity
               + ANN                multi-task         freshness
               ~10ms                ~20ms              safety ~10ms
```

**Two-tower (dual-encoder) retrieval:**
- One tower encodes user, one encodes item → both into 128-dim embeddings
- Train so relevant pairs land close together
- **Item embeddings are precomputed offline.** At request time: embed user (one forward pass) → ANN lookup → top ~1,000 in single-digit ms

**Wide & Deep / DCN-v2:**
- **Wide** side memorises specific feature crosses ("fans of X also love Y")
- **Deep** side generalises from embeddings
- **DCN-v2** learns feature crosses automatically via explicit cross layers — now the standard for click/engagement prediction at Google

**Multi-task ranker:** one model, multiple heads — P(click), expected watch time, P(like) — combined into a single score tuned by online experiments.

**Three hard realities:**

| Problem | Cause | Fix |
|---------|-------|-----|
| **Imbalance** | <1% positive examples (fraud, violations) | Class weights, focal loss, downsample + recalibrate |
| **Cold start** | New user/item has no history | Fallback to popularity/demographics; content features for new items; exploration traffic |
| **Position bias** | Users click top slot regardless of quality | Train WITH position feature, then fix it to constant at serving (counterfactual) |

---

### Step 5: Serving at Scale

**Batch vs Real-Time:** batch is cheap but stale; real-time is fresh but costly. **Hybrid** is standard: precompute stable features (video embeddings, user profiles) in batch; combine with live session context in real-time.

**Latency budget (StreamFlix example, 300ms total):**

| Stage | ~p99 |
|-------|------|
| Feature lookup | 10 ms |
| Retrieval (ANN) | 20 ms |
| Ranking inference | 40 ms |
| Re-rank + business logic | 10 ms |
| Headroom (network/render) | ~220 ms |

> At 100K QPS, p99 = 200ms means **1,000 users every second** wait too long. Fan-out compounds tails: 10 shards at p99=100ms → 9.6% of requests have ≥1 slow shard.

**ANN algorithms for billion-scale vector search:**

| Algorithm | Notes |
|---|---|
| **HNSW** | Graph-based, very high recall, memory-hungry |
| **FAISS** | Flexible library (IVF, PQ); GPU; billion-scale |
| **ScaNN** (Google) | Anisotropic quantization for max-inner-product; best speed/accuracy for Google workloads; searches 800M vectors in < 5ms |

**Caching:** 80–95% hit rate on hot item embeddings cuts backend load ~10×. Short TTL on feeds; invalidate on explicit user action.

**Model compression — the Google playbook:**
1. Train the best possible **teacher** model (ignoring cost)
2. **Distill** into a smaller **student** that hits the latency budget
3. **Quantise** (FP32 → INT8, ~4× smaller, < 1% accuracy loss)
4. **Prune** (remove near-zero weights)
A 10B-param teacher's quality ships as a 50M-param student running in 5ms.

---

### Step 6: Monitoring & Keeping It Alive

**Three types of drift:**

| Drift type | What changes | How to detect |
|---|---|---|
| **Data drift** | Input feature distributions shift | PSI / KS test on feature distributions |
| **Concept drift** | "What's a good recommendation" shifts | Watch offline metrics on fresh labels |
| **Prediction drift** | Score distribution changes (often signals a broken pipeline) | Monitor score distribution daily |

**Offline evaluation:** split by time, NOT at random (random splits leak future into past). Leave a gap sized to your label delay (7-day watch label → 7-day gap).

**A/B testing rules:**
- Randomise by **user**, not request (consistent experience; hash the user_id)
- Run 1–2 weeks to absorb day-of-week variation
- Check for **sample-ratio mismatch** (broken 50/50 split invalidates everything)

**Interleaving:** blend two rankers into one list; see whose items get clicked. Needs 10–100× fewer users than A/B testing. Confirm winner with a real A/B test.

**Long-term holdouts:** keep 1–5% of users on the old model for 30/60/90 days to check for habituation and satisfaction erosion.

**Safe deployment ladder:**
```
  shadow → 1% canary → 5% → 25% → 100%
  Rollback trigger: guardrail metric (satisfaction/revenue/latency) violated
```

**Retraining cadence:** ranking models drift fast → retrain daily on rolling 30-day window. Retrieval models retrain weekly. Always validate offline before promoting.

---

### Model Lifecycle Management

**Champion-challenger pattern:**
```
  Champion: production model serving 99% traffic
  Challenger: new candidate model serving 1%
  
  → Compare same business metrics over same time period
  → Challenger wins → promote to champion
  → Challenger loses → investigate why offline metric gain didn't transfer
```

**Model registry (Vertex AI, MLflow, Sagemaker):** every trained model is versioned with its training data fingerprint, hyperparameters, evaluation metrics, and lineage (which dataset → which model). Enables:
- Reproducible model serving (know exactly what trained that model)
- Rollback to previous champion in minutes
- Audit trail for regulated industries

**Common lifecycle pitfalls:**

| Pitfall | What happens | Fix |
|---------|-------------|-----|
| **Training-serving skew** | Feature computed differently in training vs serving | Feature store with point-in-time correctness |
| **Silent degradation** | Model accuracy drops but no alert fires | Monitor score distribution + proxy labels (e.g., dwell time) daily |
| **Stale embeddings** | Item embeddings from 6 months ago; new items invisible | Retrain retrieval tower weekly + incremental ANN updates |
| **Label delay** | Labelling a video recommendation takes 7 days (completion) | Leave 7-day gap at training cutoff; offline split by time |
| **Distribution shift** | March 2020 COVID: all user models wrong overnight | Monitor feature distribution PSI; trigger full retrain |

**The rule:** you need both offline (NDCG, PR-AUC) and online (CTR, watch time, retention) metrics. Never ship a model that improved offline but hasn't been validated online at ≥1% canary for at least 48 hours.

---

| Domain | Key twist |
|--------|-----------|
| **Search** | Query understanding + two-tower retrieval + BM25/neural re-ranking |
| **Fraud detection** | Extreme class imbalance; strict latency budget; near-real-time features critical |
| **Content moderation** | Multi-modal (text + image); high precision vs recall trade-off; human-in-loop |
| **LLM/RAG assistant** | Retrieval (vector search) + generation (LLM); guardrail layers for safety |
| **Ads ranking** | Multi-objective (relevance + bid + quality); calibration critical (money rides on scores) |

---

> ✅ **Must-remember**
>
> - **Label choice is the most consequential decision** — composite signal beats raw clicks/watch-time.
> - **Feature store** eliminates training-serving skew, the #1 cause of "great offline, terrible live."
> - **Multi-stage funnel:** retrieval (ANN, cheap) → ranking (DCN, expensive) → re-rank (diversity/safety).
> - **Offline split by time, not random** — random leaks the future.
> - **Guardrails beat metrics** — a CTR win that hurts satisfaction or latency is not a win.
> - **Cold start fix:** content features for new items; popularity fallback for new users; exploration budget.

---

## One-Page Cheat Recap

| Chapter | Single most important fact / heuristic |
|---------|---------------------------------------|
| **Ch 21** — OO Design | **SRP test:** if you say "AND" describing a class, split it. **DIP test:** if business logic does `new ConcreteImpl()`, inject an abstraction instead. Deadlock prevention = consistent lock ordering. |
| **Ch 22** — Eng Tools | **Tier 1 is non-negotiable.** K8s liveness probe = process health only (never downstream). Kafka `acks=all + min.insync.replicas=2` for durability. Redis = sub-ms speed layer, NOT source of truth. Spark shuffle = enemy; broadcast small tables; let AQE help. |
| **Ch 23** — Foundations | **Name the trade-off in the first 60 seconds:** CAP/PACELC placement signals seniority instantly. 5 nines = 5.26 min/year downtime. Token bucket allows bursts; sliding window is most accurate. Hedged requests collapse p99 toward p50 at ~5% extra RPS. |
| **Ch 24** — Data & Distributed | **Scaling ladder:** index → cache → replicas → PgBouncer → shard. Most apps live at rung 2–3. CAP: "CA" doesn't exist. Raft needs 2f+1 nodes. Quorum: W+R > N = strong consistency. Outbox+CDC for reliable DB-to-event propagation without dual-write. |
| **Ch 25** — Operations | **Error budget = contract:** budget spent → freeze features. 8-step interview framework: Clarify → Estimate → API → Data → High-level → Deep-dive → Bottlenecks → Trade-offs. Never say "eventually consistent" without a concrete staleness window. mTLS+PKCE are Google-style auth primitives. |
| **Ch 26** — ML System Design | **Label choice is the most consequential decision** in the whole system — composite signal beats raw clicks. Feature store eliminates training-serving skew (#1 cause of "great offline, terrible live"). Offline split by time not random. Guardrails beat raw metrics. |
