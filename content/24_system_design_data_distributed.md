# Chapter 24 — System Design — Part 2: Data & Distributed Systems

> "Show me your flowcharts and conceal your tables, and I shall continue to be mystified. Show me your tables, and I won't usually need your flowcharts; they'll be obvious." — Fred Brooks, *The Mythical Man‑Month*

**What this chapter covers:**
The data plane of system design — databases (SQL vs NoSQL, internals, indexing, MVCC/WAL, schema migrations, specialised stores, backups, DB security), scaling them out (vertical, replication, pooling, partitioning vs sharding, CQRS, online resharding, multi‑region DB architectures, DR), the distributed‑systems theory that holds it all together (CAP, PACELC, consistency models, time & clocks, Paxos/Raft, consistent hashing, distributed locks, Bloom filters), messaging & streaming (Kafka, delivery guarantees, outbox + CDC), storage systems (block/file/object, lakes vs warehouses), and data processing (batch vs stream, MapReduce, Lambda & Kappa, exactly‑once).

This is **Part 2** of the three‑chapter System Design series. Read **[Chapter 23 — Foundations & Protocols](23_system_design_fundamentals_deep_dive.md)** first if you haven't covered the network/edge stack (HTTP/TCP/DNS/TLS, load balancing, caching, CDN) — many sections below assume those primitives. **[Chapter 25 — Operations & Case Studies](25_system_design_operations_case_studies.md)** builds on this chapter.

**How to read it:**
Most topics follow the same shape — *Simple Explanation → Official Definition → How it works (with ASCII diagrams) → Variants → Trade‑offs.* You can read it cover‑to‑cover (~5 hours) or jump to specific building blocks.

The §X.Y numbering is continuous with Ch 23 and Ch 25 (this chapter contains §7.1 … §12.x). Cross‑chapter pointers are prefixed (e.g. "Ch 23, §3.21" or "Ch 25, §17.9").

---

## Table of Contents

| Part | Section | Building Blocks |
|------|---------|-----------------|
| 7 | Databases | SQL vs NoSQL, ACID/BASE, indexing, MVCC/WAL, schema migrations, specialised DBs, backups & DB security |
| 8 | Database Scaling | Vertical / replication / pooling, partitioning vs sharding, CQRS, online resharding, multi‑region DB, DR |
| 9 | Distributed Systems Theory | CAP, PACELC, consistency models, time & clocks, Paxos/Raft, consistent hashing, distributed locks, Bloom |
| 10 | Messaging & Streaming | Queues vs streams vs pub/sub, Kafka internals, delivery guarantees, outbox + CDC |
| 11 | Storage Systems | Block / file / object storage, lakes vs warehouses vs lakehouses, hot/warm/cold |
| 12 | Data Processing | Batch vs stream, MapReduce, Lambda & Kappa, ETL vs ELT, exactly‑once, windowing |

---

# PART 7: DATABASES

> **The goal of this part:** give you the intuition (and the mechanics) to pick the right database, write queries that *plan* the way you expect, and know what's actually happening between `COMMIT` and disk. Every later scaling and reliability story in this chapter sits on top of these ideas.

## 7.1 SQL vs NoSQL — the eternal question

> **Simple Explanation:** A **relational (SQL)** database stores data as rows in tables with a fixed, declared structure and lets you recombine those tables with joins. A **NoSQL** database relaxes one or more of those rules — fixed schema, joins, or strong consistency — to gain flexibility or horizontal scale.

> **Official Definition:** A *relational database* (Codd, 1970) organises data into relations (tables) of tuples (rows) over a fixed set of attributes (columns), queried declaratively with SQL. *NoSQL* ("Not only SQL") is an umbrella term for non-relational stores — key-value, document, column-family, graph — each trading a relational guarantee for a specific access pattern or a scale-out story.

**Name the trap before the interviewer does:** "SQL" is a *query language*; "NoSQL" is a *data-model category* — they aren't opposites. The real axis is **relational vs non-relational**, not "speaks SQL vs doesn't": Cassandra (CQL) and DynamoDB (PartiQL) offer SQL-like dialects, and NewSQL engines are relational *and* speak SQL while scaling out.

| | **SQL (relational)** | **NoSQL (non-relational)** |
|---|---|---|
| Data model | Rows in typed, related tables | Key-value, document, wide-column, or graph |
| Schema | Fixed, declared upfront (schema-on-write) | Flexible (schema-on-read) |
| Query | Declarative SQL: joins, group-by, sub-queries | Per-DB API; joins absent or done app-side |
| Transactions | ACID across rows and tables | Often single-key/document; some now multi-key |
| Scaling | Scales up easily; scaling out is hard (joins, FKs) | Partitioned from day one — scales out by design |
| Consistency | Strong by default | Tunable; often eventual by default |
| Best fit | Relational data with invariants — money, inventory, orders | A known access pattern at scale — caches, feeds, telemetry |
| Examples | PostgreSQL, MySQL, Oracle, SQL Server | MongoDB, Cassandra, DynamoDB, Redis, Neo4j |

**Modern truth — the dichotomy is dying.** Postgres ships JSONB, full-text, vectors, and time-series; Cassandra and DynamoDB added multi-key transactions; NewSQL engines (Spanner, CockroachDB, YugabyteDB) give you SQL *and* horizontal scale. The label tells you less every year — **pick by access pattern, not by camp.**

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

### Decision table — pick the family by access pattern

| Family | Stores | Examples | Reach for it when… |
|--------|--------|----------|--------------------|
| **Key-value** | `key → opaque value` | Redis, DynamoDB, Memcached, Aerospike | Your only access is `get(key)` / `put(key, val)` and you need single-digit-ms tails at huge QPS — sessions, caches, feature flags |
| **Document** | JSON/BSON docs, queryable by field | MongoDB, Couchbase, Firestore | The natural unit is a self-contained aggregate (user profile, order + line items) you read and write whole |
| **Column-family (wide-column)** | Rows with sparse, dynamic columns | Cassandra, Bigtable, HBase, ScyllaDB | Known query patterns, linear write throughput, geo-replication; you'll model "one table per query" |
| **Graph** | Nodes + edges with properties | Neo4j, Neptune, DGraph, JanusGraph | Your dominant query is "k hops away," not "all rows where…" — social graphs, fraud rings, knowledge graphs |
| **Time-series** | Timestamp + measurements | InfluxDB, TimescaleDB, Prometheus | Append-only by time; queries are time-windowed aggregates — metrics, IoT, financial ticks |
| **Search** | Inverted index over tokenised text | Elasticsearch, OpenSearch, Solr | Full-text relevance, fuzzy/typo match, faceted filters — log and product search, autocomplete |
| **Vector** | Embeddings + ANN index | pgvector, Qdrant, Pinecone, Weaviate, Milvus | Nearest-neighbour search in embedding space — RAG, semantic search, recommendation |
| **OLAP / columnar** | Column-oriented analytical store | BigQuery, Snowflake, Redshift, ClickHouse, Druid | `SELECT … GROUP BY` over billions of rows, scanning a few columns in isolation — analytics, dashboards |

## 7.3 ACID — what each letter really means

> **Simple Explanation:** A *transaction* is a group of database operations that must happen as a single, indivisible unit — the classic example is "debit account A and credit account B," which is only correct if both halves happen together. **ACID** is the four-part promise a relational database makes about every transaction.

Take the four letters one at a time:

- **Atomicity — all or nothing.** Either every operation in the transaction takes effect, or none of them do. Transfer 50 dollars from A to B and you can *never* be left in a state where A was debited but B was never credited — not even if the server loses power halfway through. The database achieves this by first writing down what it is about to do (and how to reverse it) in a log *before* changing the real data; if it crashes mid-transaction, it replays or rolls back from that log on restart, so a half-finished transaction is never visible.
- **Consistency — the rules always hold.** Every transaction moves the database from one *valid* state to another, never breaking the integrity rules you have declared: a balance can't go negative, a foreign key must point at a row that actually exists, a column marked `UNIQUE` stays unique. This is the most misunderstood letter — its "C" is about *your* declared invariants, **not** about every copy of the data being up to date. (That other meaning, "all replicas agree," is consistency in the CAP sense of §9.2 — a completely separate idea that unluckily shares the word.)
- **Isolation — concurrent transactions don't step on each other.** When many transactions run at the same time, isolation makes each one behave as though it had the whole database to itself: it never sees another transaction's half-finished work. The database provides this either by making transactions *wait* for one another (pessimistic locking, §7.11) or by letting each one read its own private snapshot and sorting out conflicts at commit time (MVCC, §7.10). Perfect isolation is costly, so databases offer weaker *isolation levels* — the subject of the rest of this section.
- **Durability — committed means committed.** Once the database has replied "committed," that data survives anything short of the disk physically failing — a power cut one millisecond later will not lose it. The mechanism: before acknowledging your commit, the database forces the change out of volatile RAM and onto permanent storage by calling `fsync` on its write-ahead log (§7.10), so the record is safely on disk *before* you are told the commit succeeded.

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

### The anomalies, stepped through

Reading "phantom" or "write skew" in a table doesn't make them stick. Each one is just a specific *interleaving* of two transactions — here they are as actual timelines.

**Lost update** — both read, both write, one write silently vanishes:

```
   balance = 100
   T1: read  balance        → 100
   T2: read  balance        → 100
   T1: write balance = 100 + 50 → 150     (deposit)
   T2: write balance = 100 − 30 →  70     (withdraw)   ← T1's +50 is gone
```

Both transactions committed successfully, yet the deposit evaporated — because T2 wrote a value it computed from a *stale* read taken before T1's write. `Read Committed` does **not** stop this; both reads saw committed data. Three fixes, in order of preference:

1. **Atomic in-place update** — `UPDATE accounts SET balance = balance − 30 WHERE id = 1`. The DB re-reads `balance` under a row lock it already holds for the write, so the arithmetic uses the current value. The anomaly can't occur.
2. **Pessimistic lock** — `SELECT balance FROM accounts WHERE id = 1 FOR UPDATE` makes T2 *block* until T1 commits, then read 150.
3. **Optimistic version check** — `UPDATE ... WHERE balance = 100` returns "0 rows affected" for T2, which detects the conflict and retries.

**Write skew** — the subtle one interviewers reach for. Two on-call doctors, business rule "at least one must remain on call":

```
   on_call = { Alice, Bob }                         -- both on call
   T1 (Alice): SELECT count(*) FROM shift
               WHERE on_call = true        → 2       "2 on call, safe to go off"
   T2 (Bob):   SELECT count(*) FROM shift
               WHERE on_call = true        → 2       "2 on call, safe to go off"
   T1: UPDATE shift SET on_call=false WHERE name='Alice'
   T2: UPDATE shift SET on_call=false WHERE name='Bob'
   COMMIT, COMMIT                          → 0 on call. Rule violated.
```

The two transactions never touch the **same row** (Alice's and Bob's are different), so there's no write-write conflict to detect. Each read a *fact* ("2 doctors on call") the **other** then invalidated. Snapshot Isolation permits this because each txn reads its own start-time snapshot, where the count is still 2. Only `SERIALIZABLE` (SSI) catches it: it tracks the read-write dependency cycle and aborts one txn, forcing a retry that sees the real count.

### Snapshot Isolation vs Serializable Snapshot Isolation

- **Snapshot Isolation (SI)** — each txn sees a consistent snapshot from its start time. Prevents dirty/non-repeatable/phantoms. Allows **write skew** (the stepped-through "on-call doctor" anomaly above).
- **Serializable Snapshot Isolation (SSI)** — Postgres's `SERIALIZABLE` mode. Tracks read/write dependencies, aborts a txn that *would* violate serializability. Safer than SI, but expects retries on conflict.

### ACID in distributed databases — what changes

Every guarantee gets harder once the data is spread across many machines, because a single transaction can now touch rows that live on different servers:

- **Atomicity** can no longer lean on one local log. Committing "all or nothing" across several machines needs a coordination protocol — two-phase commit (§9.11), deterministic pre-ordering (Calvin, §8.14), or Spanner's clock-based commit (§8.15).
- **Consistency** (your invariants) is unchanged, but the *external* guarantee people usually want alongside it — **linearizability**, meaning everyone sees writes in real-time order (§9.5) — now requires a consensus algorithm to agree on what that order is.
- **Isolation** at global scale costs network round-trips, because the machines have to talk to coordinate. Spanner pays for the strongest form ("external consistency") by deliberately *waiting out* the uncertainty in its clocks before it commits (§8.15).
- **Durability** is no longer a single local `fsync` to one disk — that one machine can be destroyed. It now means the write is safely copied to a majority (a *quorum*) of machines before being acknowledged (§9.10).

## 7.4 BASE — the NoSQL counter-philosophy

> **Simple Explanation:** BASE is the design philosophy many NoSQL systems pick *instead* of ACID. Where ACID insists every copy of the data is correct and in agreement before a write is acknowledged, BASE accepts the write immediately and lets the copies catch up afterwards — trading strict, instant correctness for availability and scale. The three letters:

- **Basically Available** — the system keeps answering requests at all times, even when some servers are down or out of sync. You always get *a* response; it may just be slightly out of date rather than an error.
- **Soft state** — the stored data can change on its own even with no new writes coming in, because background replication is still carrying earlier writes between servers. The state is "soft" (in flux) rather than fixed the instant a write returns.
- **Eventual consistency** — if writes stop, all replicas *eventually* settle on the same value. There is a window where different servers disagree, but given a little time and no new changes, they converge.

BASE is the trade you make to scale horizontally past what ACID can comfortably do. The names are a deliberate chemistry pun (an acid vs. a base), but the engineering content is real: instead of *blocking* a write until every replica agrees, a BASE system *accepts* the write locally and lets the disagreement resolve in the background.

**Eventual consistency, watched in slow motion.** Suppose a key `x = 1` is replicated to three nodes A, B, C. A client writes `x = 2` to node A:

```
   t=0   write x=2 lands on A          A:x=2   B:x=1   C:x=1   ← replicas disagree
   t=1   A ships the update to B        A:x=2   B:x=2   C:x=1
   t=2   A ships the update to C        A:x=2   B:x=2   C:x=2   ← converged
```

Between `t=0` and `t=2` a read served by C returns the *old* value `1`. That window is the "eventual" in eventual consistency — the replicas are guaranteed to converge **once writes stop**, but at any instant a read may be stale. The whole BASE bet is that for many workloads (a like count, a follower list, a viewed-products feed) a few seconds of staleness is invisible to users and worth the availability and throughput you gain.

**BASE ≠ "anything goes."** The looseness is bounded on purpose. A well-designed BASE system:

- **Bounds staleness** — "replicas are ≤ 5 s behind at p99," not "behind by an unknown amount forever."
- **Guarantees monotonicity** — once you've seen `x = 2`, you never again see `x = 1` (no time-travelling backwards), via session/monotonic-read guarantees (§9.5).
- **Isolates blast radius** — one slow replica degrades one read path, it doesn't stall the cluster.

The skill is choosing *per operation*: a tweet's like-count is BASE-friendly; debiting a bank balance is not. Most real systems are a mix — strong consistency on the money, eventual on everything around it.

## 7.5 Indexing — the difference between 1ms and 10s

> **Simple Explanation:** An index is the back-of-the-book — instead of scanning every page, you look up the term and jump. Same for a DB table.

```
   Without index:                 With B-tree index on user_id:
   SELECT * WHERE user_id = 42    Walk the tree: 3–4 levels (high fan-out)
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

### Why a B-tree is only a few levels deep (the fan-out math)

The "≈ 3–4 levels" isn't a hand-wave — it falls out of arithmetic. A B+tree node is one disk page (8 KB in Postgres). Each internal entry is roughly a key plus a child pointer (~16 bytes), so one node points to:

```
   fan-out  f ≈ 8192 bytes / 16 bytes ≈ 500 children
```

A balanced tree of height `h` with fan-out `f` indexes up to `fʰ` rows:

```
   height 1:  500          rows
   height 2:  500²  =          250,000
   height 3:  500³  =      125,000,000
   height 4:  500⁴  =   62,500,000,000   (62 billion)
```

So a primary-key lookup on a **billion-row** table descends only ~4 nodes. The root and next level stay cached in the buffer pool, so the lookup costs **one physical disk read**. A full scan is 10 million page reads (a billion rows at ~100/page). The index collapses 10,000,000 reads into ≈ 1 — *that* is the "1 ms vs 10 s" in the title.

### Clustered vs secondary indexes

- **Clustered index** — table rows are physically stored in the order of this index (one per table). InnoDB and SQL Server cluster by primary key by default.
- **Secondary index** — separate B-tree pointing back to the row. In InnoDB it stores the PK as the pointer, so secondary lookups cost two traversals.

**The InnoDB double-traversal, drawn.** Because a secondary index stores the *primary key* as its pointer (not a physical disk address), a lookup on a secondary column walks **two** trees:

```
   SELECT * FROM users WHERE email = 'a@x.com'

   ① secondary B-tree (email)            ② clustered B-tree (PK)
      email      → pk                        pk → full row
      'a@x.com'  → 42      ───────────▶      42 → { id:42, email, name, … }
```

Two consequences follow. First, a **covering index** that holds every selected column lets the engine stop after step ①, skipping the second traversal — often a 2× speedup. Second, a **random UUID primary key is expensive in InnoDB**: every secondary lookup's step ② jumps to a random spot in the clustered tree, and every *insert* splits a random leaf page. A monotonically increasing key (auto-increment, UUIDv7) keeps inserts appending to the rightmost leaf.

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

**Why the rule exists:** a composite key `(user_id, created_at)` is sorted by `user_id` *first*, and by `created_at` only *within* a single `user_id`. Picture a phone book sorted by `(last_name, first_name)`: you instantly find every "Smith" and "Smith, John" — but *not* everyone named "John," who are scattered under every last name. Same here: `WHERE created_at > ?` with no `user_id` must scan the whole index. The leftmost-prefix rule is a property of the *sort order*, not an arbitrary database rule.

### Covering indexes & index-only scans

If the index contains *every column* the query needs, the DB can answer without touching the table heap:

```sql
CREATE INDEX idx ON orders (user_id) INCLUDE (status, total);
SELECT status, total FROM orders WHERE user_id = 42;
-- Index-only scan; no heap read.
```

### Specialised index features worth knowing

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

### The normal forms — each with a violation and its fix

Normalization is a progression: each form removes one kind of redundancy. Watch a messy `orders` table get fixed one rule at a time.

**1NF — atomic values, no repeating groups.** Every cell holds a single value — no lists, no multi-fact columns.

```
   violates 1NF (items is a list)         →   1NF (one row per item)
   order_id | items          | customer       order_id | item   | customer
   1        | widget, gadget | Alice           1        | widget | Alice
                                               1        | gadget | Alice
```

The primary key is now the composite `(order_id, item)`.

**2NF — no partial dependencies.** With a composite key, every non-key column must depend on the *whole* key, not just part of it.

```
   violates 2NF: key is (order_id, item), but `customer` depends on order_id alone
```

`customer` describes the order, not the order-item — so split the one table into two:

```
   order_items(order_id, item)        orders(order_id, customer_id)
```

**3NF — no transitive dependencies.** A non-key column must not depend on *another* non-key column.

```
   violates 3NF: order_id → customer_id → city   (city depends on the key only via customer_id)
   orders(order_id, customer_id, city)
```

`city` is a fact about the customer, not the order. Move it where it belongs:

```
   orders(order_id, customer_id)      customers(customer_id, name, city)
```

3NF is the target for almost every OLTP schema: every non-key column depends on *"the key, the whole key, and nothing but the key."*

**BCNF — every determinant is a candidate key.** A stricter 3NF, needed only when a table has *overlapping* candidate keys. Classic case: a student takes each course from one instructor, and each instructor teaches exactly one course.

```
   teaches(student, course, instructor)
     rules           : (student, course) → instructor   and   instructor → course
     candidate keys  : (student, course)  and  (student, instructor)
     but instructor → course, and `instructor` is not a candidate key → violates BCNF
```

The table is already in 3NF (`course` is a prime attribute), yet `instructor → course` is repeated on every row. Decompose on the offending dependency so the determinant becomes a key:

```
   enrolment(student, instructor)     assignment(instructor, course)
```

**4NF / 5NF** address multi-valued and join dependencies, but they rarely change a real-world OLTP design.

**Practical rule:** normalize OLTP schemas to **3NF** (reach for **BCNF** only with overlapping keys); deliberately **denormalize** read-heavy analytics — the anomalies below show *why* the normalized side is worth the joins.

### Why normalize? The three anomalies, concretely

Normalization isn't aesthetic — each normal form removes a specific failure mode. Take a denormalized `orders` table that repeats the customer's email on every row:

```
   orders
   ┌────┬─────────┬───────────────┬────────┐
   │ id │ user_id │ user_email    │ amount │
   ├────┼─────────┼───────────────┼────────┤
   │  1 │   42    │ alice@old.com │  19.99 │
   │  2 │   42    │ alice@old.com │  39.00 │
   │  3 │   42    │ alice@old.com │   5.00 │
   └────┴─────────┴───────────────┴────────┘
```

- **Update anomaly** — Alice changes her email. You must update *every one* of her order rows in a single transaction. Miss one, or crash mid-update, and the same user now has two emails on file — the database disagrees with itself.
- **Insertion anomaly** — you can't record a brand-new customer until they place a first order, because email only exists on `orders` rows. The fact "this person exists" has nowhere to live.
- **Deletion anomaly** — Alice's last order is refunded and deleted. Her email — and the fact she was ever a customer — vanishes with it.

Moving `user_email` into a `users` table fixes all three at once: the email lives in exactly **one place** — nothing to keep in sync, nothing that requires an order to exist, nothing lost when an order is deleted. That single-source-of-truth property *is* 3NF; the formal phrasing just means "don't store the same fact twice."

The cost is the mirror image: reading an order with its customer email now needs a **join**. Denormalization re-introduces the duplication to skip that join — trading write-side pain for read-side speed. That's why OLTP normalizes (writes must stay correct under concurrency) and warehouses denormalize (reads dominate, rebuilt by a pipeline).

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

### A real plan choice — nested loop vs hash join, with the numbers

The planner's entire job is to estimate cost and pick the cheapest plan. Make that reasoning explicit for a join:

```
   SELECT * FROM orders o JOIN users u ON u.id = o.user_id
   WHERE u.country = 'JP';
```

Two ways to execute it:

```
   NESTED LOOP                               HASH JOIN
   ───────────                                ─────────
   for each user where country='JP':          build a hash table of matching users
       index-lookup that user's orders        scan orders once, probe the hash per row
   cost ≈ Nᵤ × (one index lookup)             cost ≈ build(Nᵤ) + scan(Nₒ)
```

- If `country='JP'` matches **50 users**, nested loop does 50 cheap indexed lookups into `orders` — tiny — and the planner picks it.
- If it matches **5,000,000 users**, those 5 M index probes are a disaster, so the planner instead builds one hash table and scans `orders` exactly once.

The decision hinges on the *estimated row count* for `country='JP'`, from column statistics. This is why stale stats are catastrophic: if `ANALYZE` last ran at 50 Japanese users but there are now 5 M, the planner still picks nested loop and a 200 ms query takes 20 minutes. The fix isn't a cleverer query — it's `ANALYZE`.

**How to read the output like an engineer:** run `EXPLAIN (ANALYZE, BUFFERS)` and look for one thing first — the largest gap between `rows=` (estimated) and `actual rows=`. A 1000× gap there is your bug, nearly every time. Then scan for a `Seq Scan` on a big table under a selective filter (missing index), or a `Sort`/`Hash` node that reports `Disk:` instead of `Memory:` (raise `work_mem`, or cut the row count feeding it).

## 7.8 Transactions across services — Saga pattern

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

### A saga failing, stepped through

Sagas are easy to wave at and easy to get wrong, so trace one failure end to end. "Place order" = reserve inventory → charge card → create shipment, and the **card charge fails**:

```
   t0  reserve inventory   ✔   state = INVENTORY_RESERVED   (1 unit held)
   t1  charge card         ✘   FAILS (insufficient funds)
   t2  compensate step 1:  release inventory                (1 unit returned)
   t3  state = ABORTED, surface "payment declined" to the user
```

The key insight: there is **no rollback** — the inventory write *already committed* in its own database (another transaction may have seen the reduced stock). A saga doesn't undo; it runs a *new forward* transaction (the compensation) that semantically reverses the first. "Release inventory" is itself a write that can fail and must be retried — which is why idempotency isn't optional.

### What a saga gives up — isolation (the missing 'I' in ACID)

A single ACID transaction is invisible until it commits. A saga's steps each commit independently, so **intermediate states are visible to everyone else**. Between `INVENTORY_RESERVED` and the card charge, the stock count is genuinely lower, and a concurrent order can see it and act on it — a *dirty read* across services that the saga cannot prevent. You manage it with **semantic locks** (mark the row "pending" so others know it's in-flight), **commutative updates** (operations safe in any order, like increments), or by ordering steps so the riskiest, hardest-to-compensate one runs last. A saga trades away isolation — not just atomicity.

### Hard rules

- **Compensations must be idempotent.** You'll retry them; double-cancellations must be no-ops.
- **Compensation isn't always possible** (you can't "un-send" an email). Either avoid the step until you're sure, or add an explicit follow-up ("oops" email).
- **No assumption of order** — the orchestrator may receive events out of order on retries.

## 7.9 N+1 query problem

```
   bad:                              good:
   orders = db.query("SELECT...")    orders = db.query(
   for o in orders:                      "SELECT ... JOIN users ...")
       u = db.query("SELECT user")
                                      OR  use ORM's eager-load / batch IN
   1 + N queries — kills latency.    1 query.
```

Spot it in any code review with an ORM (ActiveRecord, Hibernate, Django ORM, Prisma).

### Why 1+N is so much worse than it looks

The "+N" hides a multiplier most people underestimate: it isn't N units of *work*, it's N units of *round-trip latency*. Say each DB round-trip is ~1 ms (network + parse + execute) and a page renders 100 orders:

```
   N+1 plan:   1 query for orders  +  100 queries for each order's user
               = 101 round-trips × 1 ms ≈ 101 ms
   JOIN plan:  1 query returning orders joined to users
               = 1 round-trip × ~2 ms   ≈   2 ms        (~50× faster)
```

The database did roughly the same total *work* either way — the killer is the 100 *sequential* round-trips, each paying a latency the previous couldn't hide. It degrades with distance: cross-AZ adds ~1 ms per trip, cross-region 30–80 ms — at which point 100 trips is *several seconds*. And it scales with your data: 100 orders today is 100 ms; 10,000 next year is 10 s, for the same code.

### Three solid fixes

1. **JOIN** in the query — best when you actually need the related data on every row.
2. **`WHERE id IN (…)` batch** — fetch one query of related rows, group by FK in memory.
3. **DataLoader pattern** — defer all `getUser(id)` calls in a request tick, then issue one batched query. Standard in GraphQL.

### Detection

- ORM logs in dev (`ActiveRecord::LogSubscriber`, Django `connection.queries`).
- Tools like `pg_stat_statements` showing many identical, fast queries.
- APM (Datadog, New Relic) flame graphs.

## 7.10 MVCC and the Write-Ahead Log (WAL)

**MVCC (Multi-Version Concurrency Control)** is how modern RDBMS (Postgres, MySQL InnoDB, Oracle) let readers and writers coexist without locking each other.

> **Idea:** Every row update creates a *new version* tagged with a transaction ID. Readers see the version that was committed at their transaction's start; writers create new versions. Old versions are garbage-collected later (Postgres `VACUUM`).

```
   row id=5  (txn 100) name="Alice"
             (txn 110) name="Alicia"      ◀── a snapshot started in [110, 115) sees this version
             (txn 115) name="Alice T"
```

Because a reader only sees versions committed *before its snapshot* and writers just add new versions, **a long read never blocks a write and vice-versa** — a ten-minute analytics query doesn't freeze OLTP writes. The cost: that query keeps ten minutes of old versions alive, the dead-tuple bloat VACUUM must clean up.

### Postgres VACUUM and the dead-tuple problem

Because MVCC never overwrites in place — every update writes a *new* version and leaves the old behind — old versions accumulate. Once no running transaction can see one, it's a **dead tuple**: invisible but still taking space. `VACUUM` (run automatically by **autovacuum**) reclaims it. Let it fall behind and three things go wrong:

- **Bloat & slower scans** — the table grows on disk though the live row count is flat, and every scan/index lookup must step over the dead tuples to reach live rows.
- **Wraparound shutdown** — Postgres's 32-bit transaction-ID counter eventually wraps; VACUUM "freezes" old rows so they stay visible after it. Fall too far behind and Postgres halts all writes to protect your data — the dreaded "VACUUM to prevent wraparound" emergency.

**HOT updates (Heap-Only Tuples)** — if an update touches only *non-indexed* columns and the new version fits on the same page, Postgres skips the index updates entirely, sharply cutting write amplification on frequently-updated tables.

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

**Why sequential is ~100× faster.** Committing 50 txns might dirty 50 scattered data pages (50 *random* writes); the WAL instead appends all 50 change-records to one file — a single *sequential* write (~100× fewer seeks on disk). Durability only needs the *log* safe at commit, so you pay one cheap sequential `fsync` now and defer the random data-page writes to a background checkpoint that batches them.

### Checkpoints

A **checkpoint** writes all dirty pages to disk so the WAL can be truncated. Too frequent → write storms; too rare → long crash recovery. Tunables: `checkpoint_timeout`, `max_wal_size`.

### WAL archiving and Point-in-Time Recovery (PITR)

Ship WAL segments to S3 / blob storage continuously. To restore: take the last base backup + replay WAL up to a target time. RPO can be seconds; RTO depends on replay speed.

This is the same idea as Kafka's log, Oracle redo logs, LSM-tree memtables, and SQLite journal mode. **Append-only logs are the universal building block.**

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

**The lock-ordering fix.** The deadlock happens *only* because T1 grabs A-then-B while T2 grabs B-then-A. Force every transaction to lock in ascending primary-key order and the cycle is impossible: both try A first, so one waits — a clean queue. The canonical case is a bank transfer that locks `min(from_id, to_id)` before `max(from_id, to_id)` regardless of direction, so two opposing transfers can never deadlock.

### Advisory locks

Application-defined locks the DB enforces but doesn't tie to any row. `pg_advisory_lock(key)` is perfect for "one worker runs this cron at a time."

## 7.12 Schema migrations at scale — the expand-contract pattern

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

### The rename, deploy by deploy

Those four words hide the reason it's safe: at no instant does running app code disagree with the schema. Renaming `email` → `email_address` actually spans *four deploys*, and app and DB stay compatible across every one:

```
   Deploy 1 (EXPAND)    DB:  ADD COLUMN email_address (nullable)   ← instant, metadata-only
                        App: WRITES both columns, READS old `email`
   Deploy 2 (BACKFILL)  Job: UPDATE … SET email_address = email
                             WHERE email_address IS NULL, in 10 K batches
                        (app unchanged; still dual-writing, so no new gaps appear)
   Deploy 3 (MIGRATE)   App: WRITES both, READS new `email_address`
                        (if this deploy is bad, roll back to Deploy 1 — old column still filled)
   Deploy 4 (CONTRACT)  App: writes/reads only `email_address`
                        DB:  DROP COLUMN email   ← only now, when nothing references it
```

Two properties make this bullet-proof. **Dual-writing** through the transition means every new row has *both* columns filled, so a read never hits a NULL whichever column the deployed code consults. And **batched backfill** (not one giant `UPDATE`) avoids locking millions of rows in a transaction that would block writes and balloon the WAL. The pattern exists because *a deploy is not atomic* — for minutes, old and new app versions run simultaneously, so the schema must satisfy both. Rename in one `ALTER TABLE` plus a deploy and the old pods throw "column does not exist" the instant the DDL lands. (The same dance across shards is §8.13.)

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

## 7.13 Soft delete, audit, and temporal data

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

Store *every change* as an immutable event; derive current state by replaying. Powerful for audit + time travel + rebuildable read models, but heavier upfront design. Pairs naturally with CQRS (§8.8).

## 7.14 Materialized views — pre-computed answers

A regular **view** runs its query every time. A **materialized view** stores the result on disk and updates it on refresh.

```sql
CREATE MATERIALIZED VIEW daily_sales AS
  SELECT date_trunc('day', created_at) AS d, sum(amount)
  FROM orders GROUP BY 1;

REFRESH MATERIALIZED VIEW daily_sales;            -- full
REFRESH MATERIALIZED VIEW CONCURRENTLY daily_sales; -- no read block, needs UNIQUE INDEX
```

**The trade, quantified.** A materialized view moves work from read-time to refresh-time. Suppose `daily_sales` aggregates 100 M order rows:

```
   plain VIEW:         every dashboard load re-scans 100 M rows   → ~2 s per load
   MATERIALIZED VIEW:  refreshed once/hour (one 2 s scan)
                       each load reads ~365 pre-computed rows     → ~5 ms per load
```

Loaded 10,000 times an hour, the plain view does 10,000 × 2 s of work; the materialized view does *one* 2 s refresh and serves 10,000 reads from the tiny result. The price is **staleness** — numbers can be up to one refresh interval old (≤ 1 hour here); that interval is the dial between freshness and load. `REFRESH ... CONCURRENTLY` matters because a plain `REFRESH` takes an exclusive lock that blocks reads for the whole 2 s; the concurrent form rebuilds a copy and swaps atomically — at the cost of a required unique index.

### Refresh strategies

- **Full refresh** — recompute everything on a schedule.
- **Incremental** — recompute only what changed (Snowflake, Materialize, ClickHouse `AggregatingMergeTree`).
- **Triggered** — refresh on event; risky for hot tables.

**Use cases:** dashboard aggregates, leaderboards, geospatial heatmaps, fraud-feature stores.

## 7.15 Specialised databases — when generic SQL isn't enough

### Time-series (TimescaleDB, InfluxDB, ClickHouse, Druid, Prometheus)

Optimised for `INSERT` by timestamp, range queries, and aggregations over time windows. Features: automatic partitioning by time chunk, retention policies, continuous aggregates, compression of older chunks (often 20–30×).

### Search engines (Elasticsearch, OpenSearch, Solr, Meilisearch)

Inverted index, tokenisation, BM25 relevance scoring (Ch 25, §17.9), faceted aggregations, typo tolerance, geo, highlighting. Use them for **search** and **log analytics**; *don't* use them as a primary source of truth — they have eventual consistency, no transactions, and reindex cycles are expensive.

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

## 7.16 Backups, PITR, and database disaster recovery

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

## 7.17 Database security essentials

- **Encryption at rest (TDE)** — managed by the DB engine or the storage layer (EBS, KMS). Defends against stolen disks.
- **Encryption in transit** — mTLS between app and DB. Don't rely on "we're in the same VPC."
- **Auth** — prefer **IAM/OIDC** over static passwords (AWS RDS IAM auth, GCP Cloud SQL IAM, k8s service-account → cert). Rotate what you must keep.
- **Row-Level Security (Postgres RLS)** — enforce "users only see their tenant's rows" *inside the DB*, so a broken WHERE clause in app code doesn't leak data.
- **Column-level encryption** — wrap SSNs, card numbers in app-layer envelope encryption with a KMS-managed key. The DB never sees plaintext.
- **Least-privilege roles** — app role can `SELECT/INSERT/UPDATE/DELETE`, not `DROP TABLE`. Migrations run as a separate role.
- **Audit logging** — `pgaudit`, MySQL audit plugin, cloud-managed logs streamed to a SIEM.
- **Network isolation** — DBs in a private subnet, ingress only from app SG. No public endpoint.
- **Backup encryption** — same KMS key boundary as the live DB.

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

User refreshes, sees nothing, posts again → duplicate. The fixes — sticky-window, session pinning, read-after-write tokens, selective sync replication, optimistic UI — are catalogued in §8.8.

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

## 8.9 Materialized read paths and pre-aggregation

For read-heavy aggregations (counts, top-N, leaderboards), don't compute on read:

- **Materialized views** (§7.14) — DB-managed refresh.
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

This is the **expand-contract** pattern (§7.12) applied across shards. **App must be tolerant of mixed schema state for the duration.**

### Per-shard rolling upgrades

- Always keep one replica per shard untouched, so you can fail back.
- Cap the number of in-flight migrations (resource pressure on the coordinator).
- Monitor replication lag *per shard*; a single slow shard can block the wave.

## 8.14 Distributed transactions without 2PC

- **Percolator** (Google, original BigTable transactions) — optimistic 2PC over Bigtable; powered the original web index.
- **Calvin** — pre-determine an order, then apply deterministically on all replicas (FaunaDB).
- **Sagas** (§7.8) — give up atomicity, embrace compensation.
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

Each row has **one home**; writes are always local; cross-region reads are explicit and rare. Spanner, CockroachDB, and YugabyteDB all support this natively. Often the simplest answer to data sovereignty (Ch 25, §18.6).

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
| **Daily snapshot to same region** | 24 h | 1–4 h | Low |
| **Daily snapshot to another region** | 24 h | 1–4 h | Medium |
| **PITR with WAL archive** | seconds–minutes | 10 min – hours | Medium |
| **Cross-region async replica** | seconds (lag) | minutes (promote) | High |
| **Cross-region sync replica** | 0 | minutes | Very high (write latency) |

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
   PC/EC   MongoDB (majority writes)        — consistent in a partition and in normal ops
   PC/EL   rare; some systems with         — strict consistency in partition,
            tunable consistency             low latency in normal ops
```

MongoDB's quadrant depends on write concern: `majority` (the modern default) is **PC/EC**; the legacy `unacknowledged` default behaved **PA/EL** (§9.2). CAP/PACELC labels are per-configuration, not per-product.

This captures the *daily* trade-off, not just the rare partition. Most apps live 99.9 % of their lives in the "E" branch — so the EL/EC choice often matters more than the PA/PC choice.

## 9.4 The Two Generals & Byzantine Generals problems

### Two Generals (a.k.a. Coordinated Attack)

Two generals on opposite hills must coordinate an attack. Only way to communicate is messengers through enemy territory (who may be captured). **Impossible** to guarantee both agree to attack.

**Implication:** With an unreliable network, you can never *guarantee* a message was received and the sender knows it was received. This is why **exactly-once delivery is impossible** — only "at-least-once + idempotency" (Ch 23, §3.21) or "at-most-once + accepted loss."

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

PostgreSQL's `serializable` = SSI (§7.3). MySQL's `repeatable read` ≈ snapshot. Beware: snapshot isolation does *not* prevent **write skew** (the canonical example: two on-call doctors both ticking "off" because the system showed both as on, ending up with zero coverage).

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

Modern systems prefer **sagas** (§7.8) or **consensus-backed transactions** (Spanner, Calvin) — both replace the coordinator's "single point of failure" with a Raft/Paxos group.

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

Redis's "Redlock" tries to do distributed locking on top of 5 independent Redis nodes. Martin Kleppmann famously argued it's unsafe under clock drift and network delays; antirez (Redis author) pushed back. Net advice: **don't use Redis-based locks for correctness-critical operations**. Use them for performance optimisation (avoid duplicate work) where a rare double-execution is tolerable, paired with idempotency (Ch 23, §3.21).

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

## 9.15 Bloom filter

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

> **Idempotency tokens** in distributed flows are essential glue here — see Ch 23, §3.21 for the implementation pattern (cross-referenced to avoid duplicating).

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

**In practice:** "exactly once" inside a messaging system + idempotent consumers is the only realistic way to get end-to-end exactly-once semantics.

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
| Throughput | Millions/sec/cluster | ~50 K/sec/node | Practically unlimited (managed) |
| Latency | Low (1–10 ms) | Very low (< 1 ms) | 10–100 ms |
| Ordering | Per partition | Per queue | FIFO queue (lower throughput) |
| Delivery | At-least-once (or EOS w/ txns) | At-least-once | At-least-once |
| Retention | Configurable (days/weeks) | Until consumed | 14 days max |
| Best for | Event streaming, replay, analytics | Complex routing, RPC | Simple decoupling, no ops |

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
   not shared     (lockable)           Strong read-after-write (2020+)
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

## 11.5 Cloud object storage consistency (S3 in 2020+)

For years, S3 was famously *eventually* consistent for list/overwrite. Since December 2020, **S3 offers strong read-after-write consistency** for all operations. This is important because it changes design patterns: you can safely "write then list" in workflows without sleep loops.

GCS and Azure Blob have been strongly consistent for years; designs targeting multiple clouds should not assume the loosest model.

## 11.6 Wide-column storage layouts — Bigtable & friends

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

## 12.7 Windowing in stream processing

```
   TUMBLING   |─5min─|─5min─|─5min─|         non-overlapping fixed windows
   SLIDING    |─5min─|                       overlapping; output every minute
                |─5min─|
                  |─5min─|
   SESSION    |──events──|  gap   |─events─|  bounded by inactivity gap
```

Pair with **watermarks** — a heuristic saying "no events older than T will arrive." Late events go to a side output (or are dropped).

## 12.8 Common stream-processing pitfalls

- **Skewed partitions** — one key (e.g., a celebrity's events) overwhelms one task. Pre-aggregate or two-stage shuffle.
- **State unbounded growth** — sessions never close, RocksDB fills disks. Use TTL state.
- **Watermark too aggressive** — late events silently dropped. Always emit a side output for late data.
- **Time-travel bugs** — using `processing time` for billing/audit (use event time always).
- **Checkpointing too rarely** — recovery replays hours of events. Tune interval to your tolerance.

---

## Key Takeaways

```
SYSTEM DESIGN PART 2 — DATA & DISTRIBUTED SYSTEMS
═══════════════════════════════════════════════════════════════

DATABASES
  • SQL = strong schema + ACID joins; NoSQL = pick by
    access pattern (KV, doc, wide-column, graph).
  • ACID vs BASE: strong vs eventual; choose per workload.
  • Indexes turn 10s into 1ms — but cost writes & space.
  • Normalize for writes, denormalize for reads.
  • MVCC + WAL give concurrency and crash recovery.
  • Optimistic locking for low contention, pessimistic
    for high; expand-contract for zero-downtime migrations.
  • Saga (not 2PC) for cross-service transactions.
  • Watch the N+1 query trap; read EXPLAIN plans.

SCALING DATA
  • Escape ladder: index → cache → replicas → shard.
  • Replication gives read scale + failover; mind lag.
  • Sharding splits by key — shard key is hard to undo.
  • CQRS / materialized views separate read & write paths.
  • Mitigate hot keys/shards; online resharding is brutal.
  • Spanner/TrueTime = strong consistency at planet scale.

DISTRIBUTED SYSTEMS THEORY
  • Don't trust the 8 fallacies (network is reliable, etc.).
  • CAP: partition → C or A. PACELC adds else latency/cons.
  • Consistency is a spectrum: linearizable → eventual.
  • No global clock — use logical/vector clocks, TrueTime.
  • Consensus (Raft/Paxos) for a single agreed leader/log.
  • Consistent hashing minimizes reshuffle on node changes.
  • Quorum: W + R > N for read-your-writes.
  • Distributed locks need fencing tokens — leases expire.
  • Bloom filter: probabilistic, no false negatives.

MESSAGING & STREAMING
  • Queue vs stream vs pub/sub: pick by replay & fan-out.
  • Delivery: at-most / at-least / exactly-once (hard).
  • Kafka = partitioned durable log; order within partition.
  • Outbox + CDC for reliable DB-to-event propagation.
  • Use DLQs and backpressure; idempotent consumers.

STORAGE & PROCESSING
  • Block vs file vs object storage; object = cheap & vast.
  • Lake vs warehouse vs lakehouse; hot/warm/cold tiers.
  • Batch vs stream; Lambda vs Kappa architecture.
  • Use event time + watermarks; window correctly; TTL state.
```

---

> **Continued in [Chapter 25 — System Design — Part 3: Operations & Case Studies](25_system_design_operations_case_studies.md).** Part 3 picks up at §13.1 and covers reliability and chaos engineering, security (AuthN/AuthZ, OAuth/OIDC, JWT, crypto, OWASP, mTLS, STRIDE), observability (logs/metrics/traces, SLI/SLO, OpenTelemetry, golden signals), deployment (containers, K8s, GitOps, progressive delivery), search and supporting building blocks, multi‑region architecture, FinOps, the anti‑patterns to spot in design discussions, and a full Instagram worked example.
>
> **Coming from Part 1?** Return to [Chapter 23 — Foundations & Protocols](23_system_design_fundamentals_deep_dive.md) for the network/edge stack referenced throughout this chapter.
