# Chapter 24 — System Design — Part 2: Data & Distributed Systems

> "Show me your flowcharts and conceal your tables, and I shall continue to be mystified. Show me your tables, and I won't usually need your flowcharts; they'll be obvious." — Fred Brooks, *The Mythical Man‑Month*

**What this chapter covers:**
The data plane of system design — databases (SQL vs NoSQL, internals, indexing, MVCC/WAL, schema migrations, specialised stores, backups, DB security), scaling them out (vertical, replication, pooling, partitioning vs sharding, CQRS, online resharding, multi‑region DB architectures, DR), the distributed‑systems theory that holds it all together (CAP, PACELC, consistency models, time & clocks, Paxos/Raft, consistent hashing, distributed locks, Bloom filters), messaging & streaming (Kafka, delivery guarantees, outbox + CDC), storage systems (block/file/object, lakes vs warehouses), and data processing (batch vs stream, MapReduce, Lambda & Kappa, exactly‑once).

This is **Part 2** of the three‑chapter System Design series. Read **[Chapter 23 — Foundations & Protocols](#content/23_system_design_fundamentals_deep_dive)** first if you haven't covered the network/edge stack (HTTP/TCP/DNS/TLS, load balancing, caching, CDN) — many sections below assume those primitives. **[Chapter 25 — Operations & Case Studies](#content/25_system_design_operations_case_studies)** builds on this chapter.

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

![Infographic comparing relational (SQL) and non-relational (NoSQL) databases: a 5-row table (data model, schema on write vs on read, transactions, scaling up vs partitioned from day one, strong vs tunable consistency), a NewSQL bridge (Spanner, CockroachDB, YugabyteDB, TiDB, Aurora DSQL), the 8 NoSQL families with when to reach for each, a pick-by-need table and common mix-ups such as 'joins don't scale' (one healthy Postgres does 10K+ QPS).](diagrams/sd24_info_sql_nosql_ai.png)

<details>
<summary><strong>Read as text</strong> — the definitions, the side-by-side table and the dying dichotomy</summary>

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

**Modern truth — the dichotomy is dying.** Postgres ships JSONB, full-text, vectors, and time-series; MongoDB (multi-document, 4.0+) and DynamoDB (`TransactWriteItems`) added multi-key transactions, and Cassandra's Accord-based multi-partition transactions are coming with 6.0 (still pre-release in late 2026; today's Cassandra offers only single-partition lightweight transactions); NewSQL engines (Spanner, CockroachDB, YugabyteDB) give you SQL *and* horizontal scale. The label tells you less every year — **pick by access pattern, not by camp.**

</details>

### When SQL is actually wrong

<details>
<summary><strong>Read as text</strong> — the three workloads that outgrow a relational database</summary>

- Multi-petabyte append-only telemetry — relational locking and B-tree updates can't keep up.
- Schemas that genuinely change per row (sparse, polymorphic).
- Single-key reads at millions of RPS with sub-ms tail latency (use a KV store).

</details>

### When NoSQL is sold but you actually want SQL

<details>
<summary><strong>Read as text</strong> — three sales pitches that usually mean you want SQL</summary>

- "We need flexibility" — usually means *you didn't model your data*. A document store with 20 nested optional fields is worse than 3 normalized tables.
- "Joins don't scale" — most apps never push joins past what a healthy Postgres on one box can do (10 K+ QPS easily).
- "We'll add transactions later" — you won't, and the data-correctness bugs will be expensive.

</details>

### NewSQL — the middle ground

<details>
<summary><strong>Read as text</strong> — SQL with horizontal scale and consensus underneath</summary>

**Spanner, CockroachDB, YugabyteDB, TiDB, Aurora DSQL** — SQL interfaces with distributed storage and consensus underneath. (FaunaDB, often listed here, shut its service down in May 2025.) Higher write latency than single-box Postgres, but horizontal scale + global consistency. Use when you'll outgrow one box *and* you need real transactions.

</details>

## 7.2 The NoSQL family tree — choose by access pattern

<details>
<summary><strong>Read as text</strong> — the eight families with their engines and typical uses</summary>

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
   │ COLUMNAR OLAP — column-oriented analytical               │
   │   BigQuery, Snowflake, Redshift, ClickHouse, Druid       │
   │   ► Analytics, dashboards, ad-hoc SQL on big data        │
   └──────────────────────────────────────────────────────────┘
```

</details>

### Decision table — pick the family by access pattern

<details>
<summary><strong>Read as text</strong> — what each family stores and when to reach for it</summary>

| Family | Stores | Examples | Reach for it when… |
|--------|--------|----------|--------------------|
| **Key-value** | `key → opaque value` | Redis, DynamoDB, Memcached, Aerospike | Your only access is `get(key)` / `put(key, val)` and you need single-digit-ms tails at huge QPS — sessions, caches, feature flags |
| **Document** | JSON/BSON docs, queryable by field | MongoDB, Couchbase, Firestore | The natural unit is a self-contained aggregate (user profile, order + line items) you read and write whole |
| **Column-family (wide-column)** | Rows with sparse, dynamic columns | Cassandra, Bigtable, HBase, ScyllaDB | Known query patterns, linear write throughput, geo-replication; you'll model "one table per query" |
| **Graph** | Nodes + edges with properties | Neo4j, Neptune, DGraph, JanusGraph | Your dominant query is "k hops away," not "all rows where…" — social graphs, fraud rings, knowledge graphs |
| **Time-series** | Timestamp + measurements | InfluxDB, TimescaleDB, Prometheus | Append-only by time; queries are time-windowed aggregates — metrics, IoT, financial ticks |
| **Search** | Inverted index over tokenised text | Elasticsearch, OpenSearch, Solr | Full-text relevance, fuzzy/typo match, faceted filters — log and product search, autocomplete |
| **Vector** | Embeddings + ANN (approximate nearest-neighbour) index | pgvector, Qdrant, Pinecone, Weaviate, Milvus | Nearest-neighbour search in embedding space — RAG, semantic search, recommendation |
| **OLAP / columnar** | Column-oriented analytical store | BigQuery, Snowflake, Redshift, ClickHouse, Druid | `SELECT … GROUP BY` over billions of rows, scanning a few columns in isolation — analytics, dashboards |

</details>

## 7.3 ACID — what each letter really means

![Infographic on ACID vs BASE: four ACID letter tiles (atomicity, consistency of your rules, isolation, durability via fsync of the log), an isolation ladder from Read Uncommitted to Serializable with Postgres and MySQL defaults, a lost-update timeline (balance 100, T1 writes 150, T2 writes 70, the +50 is gone), a BASE convergence timeline of nodes A, B, C from x=1 to x=2 over t=0..2, and an anomaly-to-isolation-level table.](diagrams/sd24_info_acid_base_ai.png)

<details>
<summary><strong>Read as text</strong> — atomicity, consistency, isolation and durability, one letter at a time</summary>

> **Simple Explanation:** A *transaction* is a group of database operations that must happen as a single, indivisible unit — the classic example is "debit account A and credit account B," which is only correct if both halves happen together. **ACID** is the four-part promise a relational database makes about every transaction.

Take the four letters one at a time:

- **Atomicity — all or nothing.** Either every operation in the transaction takes effect, or none of them do. Transfer 50 dollars from A to B and you can *never* be left in a state where A was debited but B was never credited — not even if the server loses power halfway through. The database achieves this by first writing down what it is about to do (and how to reverse it) in a log *before* changing the real data; if it crashes mid-transaction, it replays or rolls back from that log on restart, so a half-finished transaction is never visible.
- **Consistency — the rules always hold.** Every transaction moves the database from one *valid* state to another, never breaking the integrity rules you have declared: a balance can't go negative, a foreign key must point at a row that actually exists, a column marked `UNIQUE` stays unique. This is the most misunderstood letter — its "C" is about *your* declared invariants, **not** about every copy of the data being up to date. (That other meaning, "all replicas agree," is consistency in the CAP sense of §9.2 — a completely separate idea that unluckily shares the word.)
- **Isolation — concurrent transactions don't step on each other.** When many transactions run at the same time, isolation makes each one behave as though it had the whole database to itself: it never sees another transaction's half-finished work. The database provides this either by making transactions *wait* for one another (pessimistic locking, §7.11) or by letting each one read its own private snapshot and sorting out conflicts at commit time (MVCC, §7.10). Perfect isolation is costly, so databases offer weaker *isolation levels* — the subject of the rest of this section.
- **Durability — committed means committed.** Once the database has replied "committed," that data survives anything short of the disk physically failing — a power cut one millisecond later will not lose it. The mechanism: before acknowledging your commit, the database forces the change out of volatile RAM and onto permanent storage by calling `fsync` on its write-ahead log (§7.10), so the record is safely on disk *before* you are told the commit succeeded.

</details>

### Isolation levels — what each prevents

<details>
<summary><strong>Read as text</strong> — the four levels and the anomalies each one prevents</summary>

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
| **Phantom read** | New rows appear in a re-run range query | Serializable (also Postgres RR, and gap locks in MySQL RR) |
| **Lost update** | Two txns read-modify-write; one's update vanishes | Postgres RR (aborts the 2nd writer), `SELECT … FOR UPDATE`, or Serializable |
| **Write skew** | Two txns each read state, write without overlap, but together violate a constraint | Serializable / SSI |

</details>

### The anomalies, stepped through

<details>
<summary><strong>Read as text</strong> — lost update and write skew as two-transaction timelines</summary>

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

</details>

### Snapshot Isolation vs Serializable Snapshot Isolation

<details>
<summary><strong>Read as text</strong> — why snapshot isolation allows write skew and SSI catches it</summary>

- **Snapshot Isolation (SI)** — each txn sees a consistent snapshot from its start time. Prevents dirty/non-repeatable/phantoms. Allows **write skew** (the stepped-through "on-call doctor" anomaly above).
- **Serializable Snapshot Isolation (SSI)** — Postgres's `SERIALIZABLE` mode. Tracks read/write dependencies, aborts a txn that *would* violate serializability. Safer than SI, but expects retries on conflict.

</details>

### ACID in distributed databases — what changes

<details>
<summary><strong>Read as text</strong> — how each letter gets harder across many machines</summary>

Every guarantee gets harder once the data is spread across many machines, because a single transaction can now touch rows that live on different servers:

- **Atomicity** can no longer lean on one local log. Committing "all or nothing" across several machines needs a coordination protocol — two-phase commit (§9.11, which Spanner also runs, but over replicated Paxos groups, §8.15) or deterministic pre-ordering (Calvin, §8.14).
- **Consistency** (your invariants) is unchanged, but the *external* guarantee people usually want alongside it — **linearizability**, meaning everyone sees writes in real-time order (§9.5) — now requires a consensus algorithm to agree on what that order is.
- **Isolation** at global scale costs network round-trips, because the machines have to talk to coordinate. Spanner pays for the strongest form ("external consistency") by deliberately *waiting out* the uncertainty in its clocks before it commits (§8.15).
- **Durability** is no longer a single local `fsync` to one disk — that one machine can be destroyed. It now means the write is safely copied to a majority (a *quorum*) of machines before being acknowledged (§9.10).

</details>

## 7.4 BASE — the NoSQL counter-philosophy

<details>
<summary><strong>Read as text</strong> — the three letters, convergence in slow motion and bounded staleness</summary>

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

</details>

## 7.5 Indexing — the difference between 1ms and 10s

![Infographic on database indexing: a four-level B+tree with fan-out about 8 KB / 16 B = 500 and capacities 500, 250,000, 125,000,000 and 62,500,000,000 rows, linked leaves for BETWEEN range scans, the InnoDB two-step lookup email 'a@x.com' to primary key 42 to full row with a covering index stopping after step 1, an index-structure table (B+tree, Hash, Inverted, LSM-tree, BRIN, HNSW/IVF) and the leftmost-prefix trap for INDEX (user_id, created_at).](diagrams/sd24_info_indexing_ai.png)

<details>
<summary><strong>Read as text</strong> — the back-of-the-book idea and a full scan vs a tree walk</summary>

> **Simple Explanation:** An index is the back-of-the-book — instead of scanning every page, you look up the term and jump. Same for a DB table.

```
   Without index:                 With B-tree index on user_id:
   SELECT * WHERE user_id = 42    Walk the tree: 3–4 levels (high fan-out)
   Scan all N rows                Random read 1 row
   O(N)                           O(log N)
```

</details>

### Common index structures

<details>
<summary><strong>Read as text</strong> — B-tree, hash, inverted, LSM, bitmap, BRIN, geo and vector indexes</summary>

| Structure | Best for | Used by |
|-----------|----------|---------|
| **B-tree / B+tree** | Range queries, equality, sorting | Almost every RDBMS |
| **Hash** | Pure equality | Postgres hash, Redis |
| **Inverted index** | Full-text search | Elasticsearch, Lucene, PG GIN |
| **LSM-tree** (log-structured merge tree) | Write-heavy workloads | Cassandra, RocksDB, LevelDB |
| **Bitmap** | Low-cardinality columns (gender, status) | Oracle, Druid, Pinot |
| **BRIN** | Huge tables, naturally ordered (time-series) | Postgres (block-range index) |
| **GiST / SP-GiST** | Geo, ranges, irregular data | Postgres, PostGIS |
| **R-tree / Quadtree / Geohash** | Bounding-box / nearest-point | PostGIS, Mongo, Redis GEO |
| **HNSW / IVF** | Approximate vector search | pgvector, Qdrant, Pinecone |

An **LSM-tree** buffers writes in memory, flushes them to disk as sorted, immutable files (**SSTables** — sorted-string tables) and merges those files in the background. Writes become cheap sequential appends; a read may have to check several files, which is why LSM engines keep a Bloom filter (§9.15) per file.

</details>

### B-tree vs B+tree

<details>
<summary><strong>Read as text</strong> — keys in every node vs data only in linked leaves</summary>

```
   B-tree:  values stored in internal nodes AND leaves
   B+tree:  values only in leaves; leaves form a linked list
            ──▶ range scans are sequential and fast
```

Almost every modern RDBMS uses **B+tree**. The leaf chain makes `WHERE id BETWEEN 100 AND 200` a sequential walk — no re-traversal.

</details>

### Why a B-tree is only a few levels deep (the fan-out math)

<details>
<summary><strong>Read as text</strong> — 500 children per page and why four levels cover billions of rows</summary>

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

</details>

### Clustered vs secondary indexes

<details>
<summary><strong>Read as text</strong> — physical row order vs a pointer back to the row</summary>

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

</details>

### Composite index ordering matters (the "leftmost prefix" rule)

<details>
<summary><strong>Read as text</strong> — the phone-book analogy and which queries can use the index</summary>

```
   INDEX idx_user_time (user_id, created_at)

   helps:  WHERE user_id = ?                       ✔
           WHERE user_id = ? AND created_at > ?    ✔
           ORDER BY user_id, created_at            ✔

   does NOT help:
           WHERE created_at > ?                    ✘  (no user_id filter)
           WHERE user_id = ? ORDER BY name         ✘  for the sort (filters on user_id,
                                                      but rows still need sorting by name)
```

**Why the rule exists:** a composite key `(user_id, created_at)` is sorted by `user_id` *first*, and by `created_at` only *within* a single `user_id`. Picture a phone book sorted by `(last_name, first_name)`: you instantly find every "Smith" and "Smith, John" — but *not* everyone named "John," who are scattered under every last name. Same here: `WHERE created_at > ?` with no `user_id` must scan the whole index. The leftmost-prefix rule is a property of the *sort order*, not an arbitrary database rule. (Oracle, MySQL 8.0.13+ and Postgres 18+ can *skip-scan* — jump from one leading value to the next — which rescues the query only when the leading column has few distinct values; with millions of `user_id`s it doesn't help.)

</details>

### Covering indexes & index-only scans

<details>
<summary><strong>Read as text</strong> — answering a query from the index without touching the table</summary>

If the index contains *every column* the query needs, the DB can answer without touching the table heap:

```sql
CREATE INDEX idx ON orders (user_id) INCLUDE (status, total);
SELECT status, total FROM orders WHERE user_id = 42;
-- Index-only scan: no heap read (Postgres: for pages its visibility map marks all-visible).
```

</details>

### Specialised index features worth knowing

<details>
<summary><strong>Read as text</strong> — partial, expression, unique-partial and JSONB indexes</summary>

- **Partial / filtered index** — `WHERE deleted_at IS NULL`. Smaller, faster, perfect for soft-deleted tables.
- **Functional / expression index** — `CREATE INDEX ON users (lower(email))` enables case-insensitive lookups.
- **Unique partial index** — enforce "one active subscription per user" without uniqueness on cancelled rows.
- **GIN/GIST on JSONB** — index a single field inside a JSON blob.

</details>

### Costs and gotchas

<details>
<summary><strong>Read as text</strong> — slower writes, bloat and unselective columns</summary>

- **Every index slows writes** (DB must maintain it on each insert/update/delete).
- **Index bloat** — Postgres B-trees fragment over time; `REINDEX CONCURRENTLY` rebuilds them.
- **Wrong index ≠ no improvement** — picking an unselective column (gender, country) wastes IO walking many matches.
- **Indexes that are never used** — the worst kind. Drop them; check `pg_stat_user_indexes`.

</details>

## 7.6 Normalization vs Denormalization

![Infographic on normalization: a staircase 1NF to 2NF to 3NF to BCNF showing each violation and fix (one row per item; order_items + orders; orders + customers; enrolment + assignment), the alice@old.com orders table with update, insertion and deletion anomalies, a star schema with fact_sales and dim_user, dim_product, dim_date, and an OLTP vs warehouse comparison.](diagrams/sd24_info_normalization_ai.png)

<details>
<summary><strong>Read as text</strong> — normalized vs denormalized tables at a glance</summary>

```
   NORMALIZED                          DENORMALIZED
   ─────────                            ─────────────
   users(id, name)                      orders(id, user_id, user_name, ...)
   orders(id, user_id)                  ↑
   ↑                                    Duplicate user_name in every order.
   No duplication.                      Faster reads (no join), painful updates.
```

</details>

### The normal forms — each with a violation and its fix

<details>
<summary><strong>Read as text</strong> — 1NF to BCNF, each with a violation and its fix</summary>

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
   order_items(order_id, item)        orders(order_id, customer)
```

**3NF — no transitive dependencies.** A non-key column must not depend on *another* non-key column. Say `orders` also stores the customer's city:

```
   violates 3NF: order_id → customer → city   (city depends on the key only via customer)
   orders(order_id, customer, city)
```

`city` is a fact about the customer, not the order. Move it where it belongs (and give customers their own key):

```
   orders(order_id, customer_id)      customers(customer_id, name, city)
```

3NF is the target for almost every OLTP schema (OLTP = *online transaction processing*: many small reads and writes, like placing an order; its opposite, OLAP — *online analytical processing* — runs big scans and aggregates): every non-key column depends on *"the key, the whole key, and nothing but the key."*

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

</details>

### Why normalize? The three anomalies, concretely

<details>
<summary><strong>Read as text</strong> — update, insertion and deletion anomalies on one orders table</summary>

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

</details>

### Star schema (warehouses)

<details>
<summary><strong>Read as text</strong> — a fact table, its dimensions and the snowflake variant</summary>

```
                  ┌──────────────┐
                  │  dim_user    │
                  └────┬─────────┘
   ┌──────────────┐    │     ┌──────────────┐
   │ dim_product  │────┼─────│ dim_date     │
   └──────────────┘    │     └──────────────┘
                       ▼
                 ┌────────────┐
                 │ fact_sales │   ← narrow keys + numeric measures
                 └────────────┘
```

A central **fact table** (events, sales) with foreign keys to several **dimension tables**. Optimised for `GROUP BY` aggregations across dimensions. **Snowflake schema** further normalises the dimensions (rarely worth it).

</details>

## 7.7 Query planner & EXPLAIN — reading what the DB is doing

![Infographic on reading the query planner: the SQL to Parser to Rewriter to Planner to Executor pipeline fed by column statistics, the JP-users join choosing nested loop for 50 users versus hash join for 5,000,000 users, stale statistics costing 5,000,000 x ~0.25 ms = about 1,250 s (21 minutes), an EXPLAIN line with rows=1 vs actual rows=42000 pointing to ANALYZE, and a plan-node verdict table.](diagrams/sd24_info_query_planner_ai.png)

<details>
<summary><strong>Read as text</strong> — the parser-to-executor pipeline and where the planner fits</summary>

> **The most underused tool in the average backend engineer's belt.** If you can read an `EXPLAIN ANALYZE`, you can usually fix the query in minutes.

```
   SQL ─▶ Parser ─▶ Rewriter ─▶ Planner ─▶ Executor
                                   │
                                   └── picks join order, access paths,
                                      based on row estimates from
                                      column statistics
```

</details>

### Common plan node shapes

<details>
<summary><strong>Read as text</strong> — what each plan node means and when it is a smell</summary>

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

</details>

### Statistics drive everything

<details>
<summary><strong>Read as text</strong> — row estimates, stale statistics and ANALYZE</summary>

The planner picks based on **estimated row counts** from column statistics. If stats are stale, the plan is wrong. Symptoms:

- Plan estimates 100 rows; actually returns 1 M → nested loop blows up.
- Estimates 1 M; actually 10 → unnecessary hash join.

Fix: `ANALYZE table_name;` (or `VACUUM ANALYZE;`). Schedule it; don't trust autovacuum alone after bulk loads.

</details>

### Reading `EXPLAIN ANALYZE`

<details>
<summary><strong>Read as text</strong> — cost, estimated vs actual rows and real time</summary>

```
   Seq Scan on orders  (cost=0.00..18.50 rows=1 width=72)
                       (actual time=0.025..6.150 rows=42000 loops=1)
```

- `cost=0.00..18.50` — planner's estimate in arbitrary cost units (start-up..total); a total of 18.50 says the planner thinks the table is tiny.
- `rows=1` vs `actual rows=42000` — **stale stats**, fix immediately.
- `actual time=0.025..6.150` — real milliseconds to the first row..last row.
- `loops=1` — how many times this node ran (high in nested loops).

</details>

### A real plan choice — nested loop vs hash join, with the numbers

<details>
<summary><strong>Read as text</strong> — nested loop vs hash join for 50 vs 5,000,000 users</summary>

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

   Nᵤ = users matching country='JP'      Nₒ = rows in orders
```

- If `country='JP'` matches **50 users**, nested loop does 50 cheap indexed lookups into `orders` — tiny — and the planner picks it.
- If it matches **5,000,000 users**, those 5 M index probes are a disaster, so the planner instead builds one hash table and scans `orders` exactly once.

The decision hinges on the *estimated row count* for `country='JP'`, from column statistics. This is why stale stats are catastrophic: if `ANALYZE` last ran when there were 50 Japanese users but there are now 5 M, the planner still picks nested loop — 5,000,000 random index probes × ~0.25 ms each ≈ 1,250 s ≈ 21 minutes, for a query a hash join finishes in seconds. The fix isn't a cleverer query — it's `ANALYZE`.

**How to read the output like an engineer:** run `EXPLAIN (ANALYZE, BUFFERS)` and look for one thing first — the largest gap between `rows=` (estimated) and `actual rows=`. A 1000× gap there is your bug, nearly every time. Then scan for a `Seq Scan` on a big table under a selective filter (missing index), or a `Sort`/`Hash` node that reports `Disk:` instead of `Memory:` (raise `work_mem`, or cut the row count feeding it).

</details>

## 7.8 Transactions across services — Saga pattern

![Infographic on the saga pattern: three local steps with compensations (reserve/release inventory, charge/refund card, create/cancel shipment), a state machine PENDING to INVENTORY_RESERVED to PAYMENT_DONE to SHIPPED with red compensation paths through COMPENSATING_PAY (refund card) and COMPENSATING_INV (release stock) to ABORTED, a t0-t3 card-failure timeline, a choreography vs orchestration table (Temporal, Cadence, AWS Step Functions, Camunda) and hard rules.](diagrams/sd24_info_saga_ai.png)

<details>
<summary><strong>Read as text</strong> — local steps, each paired with a compensating action</summary>

In microservices, a logical transaction spans multiple databases. ACID across them is hard (2PC is slow and fragile). **Saga** breaks the transaction into local steps with compensating actions.

```
   Place Order Saga:
     1. reserve inventory   ←─ compensate: release inventory
     2. charge card         ←─ compensate: refund
     3. create shipment     ←─ compensate: cancel shipment
   If step 3 fails, run compensations 2, 1 in reverse.
```

</details>

### Choreography vs orchestration

<details>
<summary><strong>Read as text</strong> — events between services vs a central orchestrator</summary>

```
   CHOREOGRAPHY                          ORCHESTRATION
   ────────────                          ─────────────
   Each service publishes events;        A central orchestrator
   others react.                         (e.g., Temporal, Cadence,
                                         AWS Step Functions, Camunda)
   No central truth.                     calls each service explicitly.

   Pros: loose coupling.                 Pros: visible flow, retries,
   Cons: emergent behaviour,             timeouts, state machine.
         hard to debug "who ran what?".  Cons: orchestrator is a
                                               coupling point.
```

</details>

### Saga state machine

<details>
<summary><strong>Read as text</strong> — the states, the compensation path and recovery after a crash</summary>

```
   PENDING ─▶ INVENTORY_RESERVED ─▶ PAYMENT_DONE ─▶ SHIPPED (= DONE)
                      │                   │
                      │ charge fails      │ shipment fails
                      ▼                   ▼
              COMPENSATING_INV ◀── COMPENSATING_PAY
              (release stock)      (refund card)
                      │
                      ▼
                   ABORTED
```

Every failure takes the same escape route: undo each step already done, newest first (a failed shipment refunds the card *and then* releases the stock). Persist this state machine in a DB (or a workflow engine). On crash, recover and continue from the last known step.

</details>

### A saga failing, stepped through

<details>
<summary><strong>Read as text</strong> — a card-charge failure traced from t0 to t3</summary>

Sagas are easy to wave at and easy to get wrong, so trace one failure end to end. "Place order" = reserve inventory → charge card → create shipment, and the **card charge fails**:

```
   t0  reserve inventory   ✔   state = INVENTORY_RESERVED   (1 unit held)
   t1  charge card         ✘   FAILS (insufficient funds)
   t2  compensate step 1:  release inventory                (1 unit returned)
   t3  state = ABORTED, surface "payment declined" to the user
```

The key insight: there is **no rollback** — the inventory write *already committed* in its own database (another transaction may have seen the reduced stock). A saga doesn't undo; it runs a *new forward* transaction (the compensation) that semantically reverses the first. "Release inventory" is itself a write that can fail and must be retried — which is why idempotency isn't optional.

</details>

### What a saga gives up — isolation (the missing 'I' in ACID)

<details>
<summary><strong>Read as text</strong> — visible intermediate states and semantic locks</summary>

A single ACID transaction is invisible until it commits. A saga's steps each commit independently, so **intermediate states are visible to everyone else**. Between `INVENTORY_RESERVED` and the card charge, the stock count is genuinely lower, and a concurrent order can see it and act on it — a *dirty read* across services that the saga cannot prevent. You manage it with **semantic locks** (mark the row "pending" so others know it's in-flight), **commutative updates** (operations safe in any order, like increments), or by ordering steps so the riskiest, hardest-to-compensate one runs last. A saga trades away isolation — not just atomicity.

</details>

### Hard rules

<details>
<summary><strong>Read as text</strong> — idempotent compensations, irreversible steps and out-of-order events</summary>

- **Compensations must be idempotent.** You'll retry them; double-cancellations must be no-ops.
- **Compensation isn't always possible** (you can't "un-send" an email). Either avoid the step until you're sure, or add an explicit follow-up ("oops" email).
- **No assumption of order** — the orchestrator may receive events out of order on retries.

</details>

## 7.9 N+1 query problem

![Concept infographic 'The N+1 Query Problem — Round-Trips, Not Work': an ORM loads 100 orders then one query per order's user (1 + 100 = 101 round-trips × 1 ms ≈ 101 ms) vs one JOIN (1 round-trip × ~2 ms ≈ 2 ms, ~50× faster); a 'It gets worse' strip (cross-AZ +~1 ms per trip, cross-region 30–80 ms per trip → several seconds, 10,000 orders: 10 s — same code); a Three Fixes table (JOIN, WHERE id IN (…), DataLoader); How to Detect (ORM query logs, pg_stat_statements, APM flame graphs); trap: the killer is 100 sequential round-trips.](diagrams/sd24_info_n_plus_one_ai.png)

<details>
<summary><strong>Read as text</strong> — one query per row vs one query in total</summary>

```
   bad:                              good:
   orders = db.query("SELECT...")    orders = db.query(
   for o in orders:                      "SELECT ... JOIN users ...")
       u = db.query("SELECT user")
                                      OR  use ORM's eager-load / batch IN
   1 + N queries — kills latency.    1 query.
```

Spot it in any code review with an ORM (ActiveRecord, Hibernate, Django ORM, Prisma).

</details>

### Why 1+N is so much worse than it looks

<details>
<summary><strong>Read as text</strong> — round-trip latency, not work, is the multiplier</summary>

The "+N" hides a multiplier most people underestimate: it isn't N units of *work*, it's N units of *round-trip latency*. Say each DB round-trip is ~1 ms (network + parse + execute) and a page renders 100 orders:

```
   N+1 plan:   1 query for orders  +  100 queries for each order's user
               = 101 round-trips × 1 ms ≈ 101 ms
   JOIN plan:  1 query returning orders joined to users
               = 1 round-trip × ~2 ms   ≈   2 ms        (~50× faster)
```

The database did roughly the same total *work* either way — the killer is the 100 *sequential* round-trips, each paying a latency the previous couldn't hide. It degrades with distance: cross-AZ adds ~1 ms per trip, cross-region 30–80 ms — at which point 100 trips is *several seconds*. And it scales with your data: 100 orders today is 100 ms; 10,000 next year is 10 s, for the same code.

</details>

### Three solid fixes

<details>
<summary><strong>Read as text</strong> — a JOIN, a batched IN query and the DataLoader pattern</summary>

1. **JOIN** in the query — best when you actually need the related data on every row.
2. **`WHERE id IN (…)` batch** — fetch one query of related rows, group by FK in memory.
3. **DataLoader pattern** — defer all `getUser(id)` calls in a request tick, then issue one batched query. Standard in GraphQL.

</details>

### Detection

<details>
<summary><strong>Read as text</strong> — ORM logs, pg_stat_statements and APM flame graphs</summary>

- ORM logs in dev (`ActiveRecord::LogSubscriber`, Django `connection.queries`).
- Tools like `pg_stat_statements` showing many identical, fast queries.
- APM (Datadog, New Relic) flame graphs.

</details>

## 7.10 MVCC and the Write-Ahead Log (WAL)

![Concept infographic 'MVCC, the Write-Ahead Log and Locking': row id=5 version chain (txn 100 Alice → txn 110 Alicia → txn 115 Alice T) with a reader snapshot in \[110, 115) seeing 'Alicia' and VACUUM removing the old version; WAL commit path COMMIT → append WAL record → fsync(WAL) → ack client, with a later async checkpoint flushing dirty pages (50 commits: 50 random page writes vs 1 sequential WAL append); a T1/T2 deadlock cycle fixed by locking in ascending id order; a pessimistic (SELECT … FOR UPDATE) vs optimistic (UPDATE … WHERE version = ?) table; HOT updates, PITR, pg_advisory_lock; VACUUM-falls-behind risks (bloat, 32-bit txn-id wraparound).](diagrams/sd24_info_mvcc_wal_locking_ai.png)

<details>
<summary><strong>Read as text</strong> — row versions, snapshots and readers that never block writers</summary>

**MVCC (Multi-Version Concurrency Control)** is how modern RDBMS (Postgres, MySQL InnoDB, Oracle) let readers and writers coexist without locking each other.

> **Idea:** Every row update creates a *new version* tagged with a transaction ID. Each reader works from a *snapshot* — taken when its transaction starts (Repeatable Read / Serializable) or when each statement starts (Read Committed) — and sees only versions committed before that snapshot; writers create new versions. Old versions are garbage-collected later (Postgres `VACUUM`).

```
   row id=5  (txn 100) name="Alice"
             (txn 110) name="Alicia"      ◀── a snapshot started in [110, 115) sees this version
             (txn 115) name="Alice T"
```

Because a reader only sees versions committed *before its snapshot* and writers just add new versions, **a long read never blocks a write and vice-versa** — a ten-minute analytics query doesn't freeze OLTP writes. The cost: that query keeps ten minutes of old versions alive, the dead-tuple bloat VACUUM must clean up.

</details>

### Postgres VACUUM and the dead-tuple problem

<details>
<summary><strong>Read as text</strong> — dead tuples, bloat, wraparound and HOT updates</summary>

Because MVCC never overwrites in place — every update writes a *new* version and leaves the old behind — old versions accumulate. Once no running transaction can see one, it's a **dead tuple**: invisible but still taking space. `VACUUM` (run automatically by **autovacuum**) reclaims it. Let it fall behind and three things go wrong:

- **Bloat & slower scans** — the table grows on disk though the live row count is flat, and every scan/index lookup must step over the dead tuples to reach live rows.
- **Index-only scans stop being index-only** — VACUUM also maintains the *visibility map* (which pages hold only rows every transaction can see). Without it, an "index-only" scan must visit the table for each row to check visibility.
- **Wraparound shutdown** — Postgres's 32-bit transaction-ID counter eventually wraps; VACUUM "freezes" old rows so they stay visible after it. Fall too far behind and Postgres halts all writes to protect your data — the dreaded "VACUUM to prevent wraparound" emergency.

**HOT updates (Heap-Only Tuples)** — if an update touches only *non-indexed* columns and the new version fits on the same page, Postgres skips the index updates entirely, sharply cutting write amplification on frequently-updated tables.

</details>

### WAL — durability + performance

<details>
<summary><strong>Read as text</strong> — log first, fsync, then flush pages later</summary>

Before mutating data pages on disk, append the change to a sequential log first. Two wins:

1. **Durability** — crash recovery replays the WAL.
2. **Performance** — sequential writes are far faster than random page writes (~100× on spinning disks, still several× on SSDs); data pages can be flushed in batches.

```
   COMMIT ─▶ append WAL record ─▶ fsync(WAL) ─▶ ack client
                                                   │
                                                   │ later (async)
                                                   ▼
                                             checkpoint flushes
                                             dirty pages
```

**Why sequential wins.** Committing 50 txns might dirty 50 scattered data pages (50 *random* writes); the WAL instead appends all 50 change-records to one file — a single *sequential* write (on a spinning disk, 50 seeks become 1). Durability only needs the *log* safe at commit, so you pay one cheap sequential `fsync` now and defer the random data-page writes to a background checkpoint that batches them.

</details>

### Checkpoints

<details>
<summary><strong>Read as text</strong> — flushing dirty pages so the WAL can be truncated</summary>

A **checkpoint** writes all dirty pages to disk so the WAL can be truncated. Too frequent → write storms; too rare → long crash recovery. Tunables: `checkpoint_timeout`, `max_wal_size`.

</details>

### WAL archiving and Point-in-Time Recovery (PITR)

<details>
<summary><strong>Read as text</strong> — shipping WAL segments and replaying to a target time</summary>

Ship WAL segments to S3 / blob storage continuously. To restore: take the last base backup + replay WAL up to a target time. RPO (how much recent data you can lose) can be seconds; RTO (how long recovery takes) depends on replay speed — both are defined properly in §7.16.

This is the same idea as Kafka's log, Oracle redo logs, the commit log an LSM-tree writes before its in-memory table, and SQLite's WAL mode. **Append-only logs are the universal building block.**

</details>

## 7.11 Locking strategies — optimistic vs pessimistic

<details>
<summary><strong>Read as text</strong> — lock-then-work vs version-check-and-retry</summary>

```
   PESSIMISTIC                            OPTIMISTIC
   ───────────                            ──────────
   BEGIN; SELECT ... FOR UPDATE;          read row + version
   ...do work...                          ...do work...
   UPDATE ...; COMMIT;                    UPDATE ... WHERE version = ?;
                                          if 0 rows affected → retry
   Holds lock during work — blocks        No lock — but write may fail
   concurrent writers. Good for high      and need retry. Good for low
   contention.                            contention.
```

Optimistic concurrency is the usual pattern in DynamoDB (conditional writes on a version attribute), document stores (Couchbase CAS, CouchDB revisions) and HTTP APIs (`ETag` + `If-Match`). Pessimistic is still right for hot rows (inventory counters) or money transfers within one DB — and it is what Spanner uses for its default serializable read-write transactions (locks plus wound-wait to avoid deadlock).

</details>

### Lock granularity

<details>
<summary><strong>Read as text</strong> — row, page and table locks</summary>

- **Row-level** — fine, concurrent-friendly, normal in InnoDB & Postgres.
- **Page-level** — coarser; less metadata; older SQL Server defaults.
- **Table-level** — DDL, certain MyISAM ops; kills concurrency.

</details>

### Lock modes

<details>
<summary><strong>Read as text</strong> — shared, exclusive and intent locks and what conflicts</summary>

| Mode | Conflicts with | Use |
|------|----------------|-----|
| **S** (shared) | X | `SELECT … FOR SHARE` |
| **X** (exclusive) | S, X | `SELECT … FOR UPDATE`, normal write |
| **IS / IX** (intent) | Table-level S/X: IS conflicts only with X; IX with S and X | Taken automatically on the table before row locks, so a table-lock request can see rows are locked without scanning them |

</details>

### Deadlocks

<details>
<summary><strong>Read as text</strong> — the wait-for cycle, abort-and-retry and prevention</summary>

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

</details>

### Advisory locks

<details>
<summary><strong>Read as text</strong> — app-defined locks such as one cron worker at a time</summary>

Application-defined locks the DB enforces but doesn't tie to any row. `pg_advisory_lock(key)` is perfect for "one worker runs this cron at a time."

</details>

## 7.12 Schema migrations at scale — the expand-contract pattern

![Infographic 'Zero-Downtime Schema Changes & Keeping History': renaming email → email_address over four deploys (EXPAND add nullable column + dual-write, BACKFILL in 10 K batches, MIGRATE read new while still writing both — rollback-safe, CONTRACT drop email) with DB-columns and App rows per deploy; a Safe vs Unsafe DDL (Postgres) table (ADD COLUMN nullable ✔, ADD COLUMN … NOT NULL DEFAULT constant PG 11+ ✔, CREATE INDEX CONCURRENTLY ✔, CREATE INDEX ✘, ALTER COLUMN … TYPE ✘, SET NOT NULL ✘) plus pt-online-schema-change / gh-ost; Keeping History cards (soft delete, audit table, temporal FOR SYSTEM_TIME AS OF, event sourcing); trap: use CHECK … NOT VALID, VALIDATE, then SET NOT NULL (PG 12+).](diagrams/sd24_info_migrations_history_ai.png)

<details>
<summary><strong>Read as text</strong> — why any blocking DDL is an outage at scale</summary>

For a small app, `ALTER TABLE` and restart. For an app with 24/7 traffic and millions of rows, *any blocking DDL is an outage.*

</details>

### The expand-contract dance

<details>
<summary><strong>Read as text</strong> — expand, backfill, migrate and contract</summary>

```
   Goal: rename column `email` → `email_address`

   1. EXPAND   add new column, dual-write from app
   2. BACKFILL copy old → new in batches
   3. MIGRATE  flip reads to new column
   4. CONTRACT drop old column
```

Each step is independently deployable, reversible, and non-blocking.

</details>

### The rename, deploy by deploy

<details>
<summary><strong>Read as text</strong> — renaming a column over four compatible deploys</summary>

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

</details>

### Safe vs unsafe DDL (Postgres)

<details>
<summary><strong>Read as text</strong> — which ALTER operations are instant and which lock the table</summary>

| Operation | Safe in prod? |
|-----------|---------------|
| `ADD COLUMN` (nullable, no default) | ✔ instant metadata change |
| `ADD COLUMN … NOT NULL DEFAULT <constant>` (PG 11+) | ✔ instant for a non-volatile default; a volatile one (`random()`, `clock_timestamp()`) or PG ≤ 10 rewrites the table — outage |
| `DROP COLUMN` | ✔ metadata change |
| `CREATE INDEX CONCURRENTLY` | ✔ no write-blocking lock (slower build) |
| `CREATE INDEX` (without `CONCURRENTLY`) | ✘ blocks all writes for the whole build (reads continue) |
| `ALTER COLUMN … TYPE …` | usually ✘ table rewrite |
| `SET NOT NULL` / `ADD CONSTRAINT … NOT NULL` | ✘ full-table scan under an exclusive lock; add it `NOT VALID`, then `VALIDATE` (recipe below) |
| Rename | ✔ metadata; but breaks apps that still reference old name |

</details>

### Online schema-change tools

<details>
<summary><strong>Read as text</strong> — pt-online-schema-change, gh-ost and the Postgres built-ins</summary>

- **pt-online-schema-change** (Percona) — creates a shadow table, triggers copy writes, swaps. MySQL world standard.
- **gh-ost** (GitHub) — same idea but uses the binlog instead of triggers; lower load.
- **Postgres** has built-in `CREATE INDEX CONCURRENTLY`, `ALTER ... ADD CONSTRAINT NOT VALID`, partitioning — fewer external tools needed.

</details>

### Adding a `NOT NULL` column safely

<details>
<summary><strong>Read as text</strong> — the step-by-step sequence that avoids a long exclusive lock</summary>

```
   1. ALTER TABLE t ADD COLUMN status TEXT;              -- nullable, instant
   2. App writes both old + new with default 'active'
   3. Backfill old rows: UPDATE t SET status='active' WHERE status IS NULL
                         in batches of 10 K
   4. ALTER TABLE t ADD CONSTRAINT status_nn
        CHECK (status IS NOT NULL) NOT VALID;            -- instant; new rows checked
   5. ALTER TABLE t VALIDATE CONSTRAINT status_nn;       -- scans, but doesn't block writes
   6. ALTER TABLE t ALTER COLUMN status SET NOT NULL;    -- PG 12+: no scan, the valid
                                                         --   CHECK already proves it
   7. ALTER TABLE t DROP CONSTRAINT status_nn;           -- optional clean-up
```

A bare `SET NOT NULL` at step 4 would re-scan the whole table under an exclusive lock — blocking reads and writes — even though every row is already filled. On **PG 18+** steps 4–7 shrink to `ADD CONSTRAINT status_nn NOT NULL status NOT VALID` followed by `VALIDATE CONSTRAINT status_nn`. And if every existing row can take the same constant, `ADD COLUMN status TEXT NOT NULL DEFAULT 'active'` (PG 11+) does the whole job in one instant step.

</details>

## 7.13 Soft delete, audit, and temporal data

### Soft delete

<details>
<summary><strong>Read as text</strong> — the deleted_at column, its pros and its cons</summary>

```sql
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMPTZ;
-- queries always: WHERE deleted_at IS NULL
-- "delete" = UPDATE users SET deleted_at = now()
```

- **Pros:** reversible, audit-friendly, no broken foreign keys.
- **Cons:** every query needs the filter (use a view), partial unique indexes for re-using identifiers, GDPR "right to be forgotten" requires actual deletion.

</details>

### Audit tables

<details>
<summary><strong>Read as text</strong> — recording every change for compliance</summary>

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

</details>

### Temporal / system-versioned tables

<details>
<summary><strong>Read as text</strong> — system-versioned rows and as-of-a-time queries</summary>

ANSI SQL:2011 feature. The DB itself versions rows; you query "as of" a time:

```sql
SELECT * FROM accounts FOR SYSTEM_TIME AS OF '2024-01-01';
```

Supported by SQL Server, MariaDB, DB2. Excellent for compliance and "show me yesterday's state."

</details>

### Event sourcing

<details>
<summary><strong>Read as text</strong> — immutable events and state rebuilt by replay</summary>

Store *every change* as an immutable event; derive current state by replaying. Powerful for audit + time travel + rebuildable read models, but heavier upfront design. Pairs naturally with CQRS (§8.8).

</details>

## 7.14 Materialized views — pre-computed answers

![Comparison infographic 'Materialized Views & Specialised Databases': plain VIEW re-scans 100 M rows (~2 s per load) vs MATERIALIZED VIEW reading ~365 pre-computed rows (~5 ms per load), refreshed once an hour (one 2 s scan, staleness ≤ 1 h; 10,000 loads/hour = 10,000 × 2 s vs one 2 s refresh), REFRESH vs REFRESH … CONCURRENTLY; five columns for Time-series, Search, Vector, Graph and Columnar OLAP with example products and three facts each; an 'If you need … → use …' table; Common Mix-Ups (a plain view stores nothing; search engine is not the primary DB).](diagrams/sd24_info_mv_specialised_ai.png)

<details>
<summary><strong>Read as text</strong> — storing a query's result and the read-time vs refresh-time trade</summary>

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

Loaded 10,000 times an hour, the plain view does 10,000 × 2 s of work; the materialized view does *one* 2 s refresh and serves 10,000 reads from the tiny result. The price is **staleness** — numbers can be up to one refresh interval old (≤ 1 hour here); that interval is the dial between freshness and load. `REFRESH ... CONCURRENTLY` matters because a plain `REFRESH` takes an exclusive lock that blocks reads for the whole 2 s; the concurrent form computes the new result on the side and applies only the differences row by row, so readers keep seeing the old rows meanwhile — at the cost of a slower refresh and a required unique index (to match old rows to new).

</details>

### Refresh strategies

<details>
<summary><strong>Read as text</strong> — full, incremental and triggered refresh, plus use cases</summary>

- **Full refresh** — recompute everything on a schedule.
- **Incremental** — recompute only what changed (Snowflake, Materialize, ClickHouse `AggregatingMergeTree`).
- **Triggered** — refresh on event; risky for hot tables.

**Use cases:** dashboard aggregates, leaderboards, geospatial heatmaps, fraud-feature stores.

</details>

## 7.15 Specialised databases — when generic SQL isn't enough

### Time-series (TimescaleDB, InfluxDB, ClickHouse, Druid, Prometheus)

<details>
<summary><strong>Read as text</strong> — time-chunk partitioning, retention and compression</summary>

Optimised for `INSERT` by timestamp, range queries, and aggregations over time windows. Features: automatic partitioning by time chunk, retention policies, continuous aggregates, compression of older chunks (often 20–30×).

</details>

### Search engines (Elasticsearch, OpenSearch, Solr, Meilisearch)

<details>
<summary><strong>Read as text</strong> — inverted indexes, BM25 and why not a source of truth</summary>

Inverted index, tokenisation, BM25 relevance scoring (Ch 25, §17.9), faceted aggregations, typo tolerance, geo, highlighting. Use them for **search** and **log analytics**; *don't* use them as a primary source of truth — they have eventual consistency, no transactions, and reindex cycles are expensive.

</details>

### Vector databases (pgvector, Qdrant, Pinecone, Weaviate, Milvus, Chroma)

<details>
<summary><strong>Read as text</strong> — HNSW, IVF and the other ANN index types</summary>

Indexes for **approximate nearest-neighbour** search on high-dimensional embeddings.

- **HNSW (Hierarchical Navigable Small World)** — graph index, very fast queries, large memory.
- **IVF (Inverted File)** — clusters, then searches the closest clusters.
- **PQ (Product Quantization)** — compresses vectors to fit billions in RAM.

`pgvector` is the easy on-ramp (a Postgres extension); Pinecone / Qdrant / Weaviate scale further with their own infrastructure. Powers RAG, recommendation, semantic search.

</details>

### Graph databases (Neo4j, Neptune, DGraph, JanusGraph)

<details>
<summary><strong>Read as text</strong> — traversals instead of joins and when Postgres is enough</summary>

Native storage of nodes + edges; queries traverse instead of join. Cypher / Gremlin / SPARQL query languages. Win when your dominant query is "k hops away" (fraud rings, social graphs, knowledge graphs). For small graph queries, Postgres with recursive CTEs is fine.

</details>

### OLAP / columnar (BigQuery, Snowflake, Redshift, ClickHouse, Druid)

<details>
<summary><strong>Read as text</strong> — column-by-column storage, compression and parallel scans</summary>

Store data **column-by-column** instead of row-by-row. Reading `SUM(amount)` over 1 B rows touches only the `amount` column. Add aggressive compression (10–30× on real data), massive parallelism, and vectorised execution — billions of rows aggregated in seconds. *Wrong* for OLTP (single-row writes are slow).

</details>

## 7.16 Backups, PITR, and database disaster recovery

![Infographic 'Backups, PITR, RPO/RTO & Database Security': PITR timeline t0 → base backup → WAL_1 → WAL_2 → WAL_3 → now with a restore pin '5 minutes ago = base + WAL_1..WAL_3 replayed up to that LSN'; RPO (sync replica 0, WAL archived every minute 1 min) and RTO (snapshot ~minutes, logical dump of 10 TB hours); a Backup Types table (Logical, Physical, Snapshot, Continuous WAL archive) with a 3-2-1 badge; a nine-item Security Checklist (encryption at rest, mTLS, IAM/OIDC, RLS, column encryption, least privilege, pgaudit → SIEM, private subnet, encrypted backups); trap: a backup never restored is hope, not a backup.](diagrams/sd24_info_backups_security_ai.png)

### Backup types

<details>
<summary><strong>Read as text</strong> — logical, physical, snapshot and continuous backups</summary>

| Type | What it captures | Restore granularity |
|------|------------------|---------------------|
| **Logical** (`pg_dump`, `mysqldump`) | SQL or per-row dump | Per-DB or per-table |
| **Physical** (`pg_basebackup`, snapshots) | On-disk files | Full instance |
| **Snapshot** (EBS, RDS, ZFS) | Block-level copy | Full volume |
| **Continuous** (WAL archive) | Every change since base | Any second since base |

</details>

### Point-in-Time Recovery (PITR)

<details>
<summary><strong>Read as text</strong> — a base backup plus WAL replay up to an exact change</summary>

```
   t0 ─── base backup ─── WAL_1 ─── WAL_2 ─── WAL_3 ─── now
                                                 │
                                                 └──▶ restore to "5 minutes ago"
                                                      = base + WAL_1..WAL_3 replayed
                                                        up to that LSN
```

(LSN = *log sequence number* — a position in the WAL, so "up to that LSN" means "up to that exact change".)

</details>

### RPO and RTO

<details>
<summary><strong>Read as text</strong> — how much data you lose vs how long the restore takes</summary>

- **RPO** (Recovery Point Objective) — how much data you're willing to lose. Sync replica: 0. WAL archived every minute: 1 min.
- **RTO** (Recovery Time Objective) — how long restore takes. Snapshot restore: ~minutes. Logical dump for a 10 TB DB: hours.

</details>

### Rules of operationally-good backups

<details>
<summary><strong>Read as text</strong> — 3-2-1, restore drills and logical plus physical copies</summary>

1. **3-2-1** — 3 copies, 2 media, 1 offsite (or one cross-region).
2. **Restore drills** — a backup you've never restored is hope, not a backup. Quarterly is the minimum.
3. **Logical + physical** — physical for fast full restore; logical for "we accidentally dropped one table" surgery.
4. **Air-gapped copies** — defends against ransomware that encrypts mounted backups too.
5. **Test the WAL gap window** — what happens if archiver is down for 30 minutes?

</details>

## 7.17 Database security essentials

<details>
<summary><strong>Read as text</strong> — encryption, IAM auth, row-level security and least privilege</summary>

- **Encryption at rest (TDE, transparent data encryption)** — managed by the DB engine or the storage layer (EBS, KMS — a cloud key-management service). Defends against stolen disks.
- **Encryption in transit** — mTLS between app and DB. Don't rely on "we're in the same VPC."
- **Auth** — prefer **IAM/OIDC** over static passwords (AWS RDS IAM auth, GCP Cloud SQL IAM, k8s service-account → cert). Rotate what you must keep.
- **Row-Level Security (Postgres RLS)** — enforce "users only see their tenant's rows" *inside the DB*, so a broken WHERE clause in app code doesn't leak data.
- **Column-level encryption** — wrap SSNs, card numbers in app-layer envelope encryption with a KMS-managed key. The DB never sees plaintext.
- **Least-privilege roles** — app role can `SELECT/INSERT/UPDATE/DELETE`, not `DROP TABLE`. Migrations run as a separate role.
- **Audit logging** — `pgaudit`, MySQL audit plugin, cloud-managed logs streamed to a SIEM (security information and event management system).
- **Network isolation** — DBs in a private subnet, ingress only from the app's security group. No public endpoint.
- **Backup encryption** — same KMS key boundary as the live DB.

</details>

---

# PART 8: DATABASE SCALING

> **The goal of this part:** climb the scaling ladder one step at a time, knowing the costs of every step. The biggest mistake at this layer is **skipping rungs** — going straight to sharding when a cache and a read replica would have bought you two more years.

## 8.1 The escape ladder

![Map infographic 'Scaling One Database — Ladder, Big Box, Replicas, Pooling': the six-stage escape ladder (one server → read replicas → cache (Redis) → federate → shard by key → multi-region) with 'most apps stop here' at Stages 2–3; PRIMARY shipping WAL to REPLICA 1 and REPLICA 2 with an Async/Semi-sync/Sync table (RPO seconds/small/0) and 'sync adds ~1 ms across AZs, 30–100 ms across regions'; PgBouncer funnel 200 app pods × 30 = 6,000 conns → 100 real conns → Postgres (dies at ~500) with session/transaction/statement modes; six cards (Big Box 64 vCPU, 256 GB RAM, 50–100 K TPS; Single Writer; Physical vs Logical; Split-Brain; Replica Lag; Connection Storms); a Pick-by-Question table; trap: skipping rungs.](diagrams/sd24_info_scaling_replication_ai.png)

<details>
<summary><strong>Read as text</strong> — the six stages from one server to multi-region</summary>

```
   Stage 1  one server                       ──▶ scale vertically
   Stage 2  add read replicas                ──▶ scale reads
   Stage 3  add a cache (Redis)              ──▶ offload hot reads
   Stage 4  partition by feature (federate)  ──▶ smaller DBs per service
   Stage 5  shard by key                     ──▶ scale writes
   Stage 6  multi-region, multi-master       ──▶ scale geography
```

**Climb only as high as you need.** Each step doubles operational complexity. Most apps live happily forever at Stage 2 or 3.

</details>

## 8.2 Vertical scaling — what you can actually buy

<details>
<summary><strong>Read as text</strong> — today's hardware menu and how far one box goes</summary>

Before you shard, see how far one box gets you. Modern hardware is *embarrassingly* capable:

| Resource | Today's sweet spot | Top of the menu (late 2026) |
|----------|--------------------|-----------------|
| CPU | 32–64 vCPUs | 192 cores per socket (AMD EPYC 9965); 1,920 vCPUs in one AWS U7inh instance |
| RAM | 256–512 GB | 32 TB (AWS U7i / U7inh — SAP HANA class) |
| Local NVMe | 4–8 TB | 60 TB+ |
| Network | 25–50 Gbps | 200 Gbps+ |

A well-tuned Postgres on a `m7i.16xlarge` (64 vCPU, 256 GB RAM, gp3 SSD) routinely sustains **50–100 K TPS** for OLTP workloads. **Most "we need to shard" claims dissolve once someone fixes a missing index and bumps `shared_buffers`.**

</details>

### Where vertical scaling tops out

<details>
<summary><strong>Read as text</strong> — the single-writer ceiling, contention, restore time and blast radius</summary>

- Single-writer ceiling — one primary node must absorb every write and its WAL; read replicas don't help.
- Lock & latch contention — past roughly 64–128 cores, shared structures (WAL insertion, buffer mapping, snapshot computation) stop scaling linearly.
- Backup / restore time — a 10 TB box takes a long time to restore.
- Blast radius — a single instance failing is the *entire* DB.

When you hit any of these, climb to Stage 2.

</details>

## 8.3 Replication — copies for reads and survival

<details>
<summary><strong>Read as text</strong> — copies for read scale and for surviving failures</summary>

> **Simple Explanation:** Copy the data to multiple servers so reads scale and you survive failures.

</details>

### Primary–replica (master–replica)

<details>
<summary><strong>Read as text</strong> — writes to one primary, the log shipped to replicas</summary>

```
                ┌───────────┐   WAL / log shipping (async or sync)
   writes ────▶ │  PRIMARY  │ ─────────────┬──────────────────┐
                └───────────┘              ▼                  ▼
                                     ┌───────────┐      ┌───────────┐
                                     │ REPLICA 1 │      │ REPLICA 2 │
                                     └───────────┘      └───────────┘
                                           ▲                  ▲
                                         reads              reads
```

</details>

### Sync vs async vs semi-sync

<details>
<summary><strong>Read as text</strong> — what a commit waits for and the RPO each mode gives</summary>

| Mode | Commit waits for | RPO | Throughput | Used by |
|------|------------------|-----|------------|---------|
| **Async** | Local WAL only | seconds of loss possible | Highest | Postgres default, RDS read replicas |
| **Semi-sync** | At least one replica has *received* the change (not yet applied) | small loss window | High | MySQL semi-sync replication (`rpl_semi_sync_source_enabled`), Postgres `synchronous_commit=remote_write` |
| **Sync** | Replica fsync ack | 0 (zero RPO) | Lower (RTT cost) | Postgres `synchronous_commit=on` with a sync standby; Spanner, CockroachDB (majority quorum) |

> **The trap:** "sync replication" between two AZs (availability zones — separate datacenters in one region) adds ~1 ms to every commit — affordable. Across regions it's 30–100 ms — usually unacceptable for OLTP. Use sync across AZs within a region for HA, async across regions for DR.

</details>

### Physical vs logical replication

<details>
<summary><strong>Read as text</strong> — raw WAL bytes vs decoded row-level events</summary>

- **Physical** — ship raw WAL bytes; replica is a byte-for-byte copy. Fast, simple, but replicas can't accept writes and must run the same major version.
- **Logical** — decode WAL into row-level events and replay. Selective (per-table), cross-version, cross-DB. Foundation of CDC (§10.10), zero-downtime upgrades, and zero-downtime sharding.

</details>

### Replication topology patterns

<details>
<summary><strong>Read as text</strong> — cascading, multi-source and bidirectional replication</summary>

```
   Cascading replicas       Multi-source       Bidirectional (multi-master)
   ──────────────────       ────────────       ────────────────────────────
   P ─▶ R1 ─▶ R2 ─▶ R3      P1 ─▶ R                P1 ◀──▶ P2
                            P2 ─▶ R                conflict resolution
                            P3 ─▶ R                required
```

</details>

### Promotion, failover, and split-brain

<details>
<summary><strong>Read as text</strong> — two primaries at once and the defences against it</summary>

A primary dies. You promote a replica. If the old primary comes back online before you fence it off, both think they're the leader — **split-brain** — and you get diverging writes that won't reconcile cleanly.

Defences:

- **STONITH** ("Shoot The Other Node In The Head") — power-off / network-isolate the old primary before promoting.
- **Fencing tokens** — every write carries a monotonically increasing token; the storage layer rejects writes with stale tokens (§9.12).
- **Quorum-based leader election** — etcd / ZooKeeper / Patroni / Stolon decide who is primary; clients trust the registry.
- **Connection re-routing** — apps don't hardcode the primary's IP; they ask the registry or connect through a VIP (virtual IP that moves to the new primary).

</details>

### Replica lag monitoring

<details>
<summary><strong>Read as text</strong> — lag in seconds and bytes, and what to alert on</summary>

```
   lag_bytes   = primary_LSN - replica_LSN                     (Postgres)
   lag_seconds = age(now(), pg_last_xact_replay_timestamp())   (run on the replica)
```

`lag_seconds` over-reports when the primary is idle (no new transactions to replay), so alert on `lag_bytes` too. Alert on lag > threshold *and* on the replica falling so far behind that WAL retention can't recover it (forcing a base backup re-clone).

</details>

## 8.4 Connection pooling at scale — the pgbouncer story

<details>
<summary><strong>Read as text</strong> — why 6,000 app connections overwhelm one Postgres</summary>

A typical Postgres box dies at **~500 active connections**. You have 200 app pods × 30-conn pool = 6 000 — boom. The fix is a shared pooler between app and DB.

```
   200 app pods ── 6000 conns ──▶ PgBouncer ── 100 conns ──▶ Postgres
                  (cheap on pool)             (real conns)
```

</details>

### Pooling modes

<details>
<summary><strong>Read as text</strong> — session, transaction and statement pooling</summary>

| Mode | Pool unit | Trade-off |
|------|-----------|-----------|
| **Session** | one client → one DB conn for session lifetime | Safe; almost no pooling benefit |
| **Transaction** | DB conn returned at COMMIT/ROLLBACK | Default sweet spot; breaks session state — `SET`, session advisory locks, `LISTEN`, temp tables. Protocol-level prepared statements work only on PgBouncer ≥ 1.21 (`max_prepared_statements`) |
| **Statement** | DB conn returned after each statement | Maximum pooling; no multi-statement txns |

**Transaction mode** is the standard. The app code should not rely on session-scoped state.

</details>

### Real-world tooling

<details>
<summary><strong>Read as text</strong> — PgBouncer, Odyssey, RDS Proxy and ProxySQL</summary>

- **PgBouncer** — the classic, ultra-lightweight Postgres pooler.
- **Odyssey** (Yandex) — newer, multi-threaded, transaction mode at scale.
- **AWS RDS Proxy** — managed, IAM-integrated, transparent failover.
- **ProxySQL** — the MySQL equivalent; also does query routing, mirroring.

</details>

### Connection storms

<details>
<summary><strong>Read as text</strong> — mass reconnects after a restart and how to soften them</summary>

App restarts → all pods reconnect at once → DB CPU spikes on authentication (SCRAM password hashing), forking one backend process per connection, and warming each new connection's caches. Mitigations: a pooler in front (the DB never sees more than its cap), jittered exponential back-off on reconnect, staggered rolling deploys, and connection warming before a pod takes traffic.

</details>

## 8.5 Partitioning vs Sharding (often conflated)

![Comparison infographic 'Partitioning vs Sharding: Strategies & Hidden Costs': partitioning splits one table inside ONE database (vertical = columns, horizontal = rows by range or hash, same machine) while sharding puts the partitions on different machines, shown as a users table fanned out by hash(user_id) % 4 to shard 0–3; a six-row strategy table (Range a–f/g–m/n–z, Hash hash(key) % N, Geo, Tenant, Composite hash(tenant) then range, Directory lookup service) with each strategy's pro and con; six hidden costs (no cross-shard joins, no global secondary indexes without extra plumbing, UUIDs / Snowflake IDs for uniqueness, re-sharding, 2PC/sagas/NewSQL for cross-shard transactions, per-shard schema migrations); a pick-by-need table and common mix-ups.](diagrams/sd24_info_partitioning_sharding_ai.png)

<details>
<summary><strong>Read as text</strong> — splitting within one machine vs across machines</summary>

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

</details>

### Sharding strategies — what each gives you

<details>
<summary><strong>Read as text</strong> — range, hash, geo, tenant, composite and directory routing</summary>

| Strategy | How it routes | Pros | Cons |
|----------|---------------|------|------|
| **Range** | by key range (a–f, g–m, n–z) | Good for range scans | Hotspots if data is skewed (recent timestamps!) |
| **Hash** | `hash(key) % N` | Even distribution | Range queries hit *all* shards |
| **Geo** | by region | Locality, GDPR | Imbalanced regions |
| **Tenant** | by tenant / customer | Strong isolation, easy backups per tenant | Skew (one huge tenant) |
| **Composite** | `hash(tenant) → shard, then range within` | Best of both worlds | Most complex routing |
| **Directory** | lookup service maps key → shard | Most flexible, supports re-shard | Lookup is a SPOF + cache layer needed |

</details>

### Sharding's hidden costs

<details>
<summary><strong>Read as text</strong> — no cross-shard joins, global indexes or easy uniqueness</summary>

- **No cross-shard joins** (or they're slow scatter-gather).
- **No global secondary indexes** without extra plumbing (Spanner, CockroachDB and DynamoDB GSIs provide them; a hand-sharded MySQL doesn't).
- **No global uniqueness** — UUIDs / Snowflake IDs only.
- **Re-sharding** when you outgrow N is painful — see consistent hashing (§9.9).
- **Distributed transactions** across shards require 2PC, sagas, or a NewSQL engine.
- **Schema migrations** must run per-shard, with backward-compatible deploys (§8.13).

</details>

## 8.6 Read replicas — quick wins and the gotchas

![Infographic 'Scaling Reads: Replicas, Federation & CQRS': the read-your-writes bug (POST comment → PRIMARY commit, GET feed → lagging REPLICA, comment missing, user posts again → duplicate); a How It Works panel with an app writing to a PRIMARY that async-copies to two REPLICAs serving reads (routed in the app, a proxy such as ProxySQL / RDS Proxy / Vitess, or a DNS / LB split), federation into user_db / orders_db / catalog_db owned by auth, orders and search teams, and a CQRS flow client → write model (Postgres, normalized) → change events (outbox / CDC) → read model (Elasticsearch, denormalized) → client; a pre-aggregation strip (materialized views, Kafka Streams / Flink / Materialize, Redis INCR likes:post:42); a table of six read-your-writes fixes (sticky window, session pinning, version tokens, selective sync, optimistic UI, LSN cookie); and when to use / not use.](diagrams/sd24_info_read_scaling_ai.png)

<details>
<summary><strong>Read as text</strong> — route reads to replicas, until replica lag bites</summary>

Add 1–N replicas, route writes to primary, route reads to replicas. Best ROI step on the ladder — *until* you hit replica lag bugs.

</details>

### Read-your-writes pitfall

<details>
<summary><strong>Read as text</strong> — the post that vanishes after a refresh</summary>

```
   user POSTs new comment ──▶ PRIMARY  (commit)
   user GETs feed       ──▶ REPLICA  (still lagging — comment missing!)
```

User refreshes, sees nothing, posts again → duplicate. The fixes — sticky-window, session pinning, read-after-write tokens, selective sync replication, optimistic UI — are catalogued in §8.8.

</details>

### Routing read traffic

<details>
<summary><strong>Read as text</strong> — app-level, proxy-level and connection-string splits</summary>

- **Application-level** — code chooses primary vs replica per query. Explicit but invasive.
- **Proxy-level** — ProxySQL / RDS Proxy / Vitess routes based on parsed SQL (writes → primary).
- **DNS / load balancer split** — two connection strings, two pools.

</details>

## 8.7 Federation — split by feature, not by key

<details>
<summary><strong>Read as text</strong> — one database per feature and the distributed-monolith trap</summary>

```
   user_db          orders_db         catalog_db
   (auth team)      (orders team)     (search team)
```

Smaller, owned by independent teams. Joins now happen in the app — accept it. Most microservice architectures end up here long before they reach sharding.

**Trap:** "every microservice has its own DB" sometimes degenerates into a **distributed monolith** where every endpoint calls 6 services. Don't federate boundaries that don't match your domain.

</details>

## 8.8 CQRS — separate read and write models

<details>
<summary><strong>Read as text</strong> — a write model, a read model and events between them</summary>

**Command Query Responsibility Segregation.** Writes go to one model (normalized, transactional). Reads come from a different model (denormalized, fast). The two are kept in sync via events.

```
   client ──commands──▶ write model (Postgres, normalized)
                              │
                              │ change events (outbox / CDC, §10.10)
                              ▼
   client ◀────reads─── read model (Elasticsearch, denormalized)
```

Great for systems where reads vastly outnumber writes and need different shapes (search, dashboards, leaderboards, activity feeds). The read model lags the write model by the event-pipeline delay — which is exactly the read-your-writes problem below.

</details>

### Read-your-writes consistency strategies (revisited)

<details>
<summary><strong>Read as text</strong> — sticky windows, session pinning and version tokens</summary>

1. **Read-from-primary for X seconds after a write** (sticky-window).
2. **Pin sessions to a region** — user's reads + writes go to the same primary.
3. **Read-after-write version tokens** — the write returns a version; the client sends it with later reads; a replica (or read model) that hasn't caught up to that version waits or forwards the read to the primary.
4. **Synchronous replication for critical paths only** (e.g., account balance) and async for the rest.
5. **Client-side cache of own writes** — show the optimistic UI value until next refresh.
6. **Causal-consistency middleware** — store the last LSN the client saw in a cookie; route to a replica that has caught up to it.

</details>

## 8.9 Materialized read paths and pre-aggregation

<details>
<summary><strong>Read as text</strong> — materialized views, streaming aggregators and app-side counters</summary>

For read-heavy aggregations (counts, top-N, leaderboards), don't compute on read:

- **Materialized views** (§7.14) — DB-managed refresh.
- **Streaming aggregators** — Kafka Streams / Flink / Materialize update aggregates incrementally as events arrive.
- **App-maintained denormalised counters** — `INCR likes:post:42` in Redis on every like event; periodically reconciled with the source.

The cost is **eventual consistency** of the read model. The win is *constant-time* reads at any scale.

</details>

## 8.10 Online resharding — the hardest distributed chore

![Infographic 'Living With Shards: Resharding, Hot Keys, Shard Keys': the 7-step online resharding pipeline from old shard to new shard (add empty shards, dual-write old + new, backfill in batches, verify with checksums and row counts, switch reads, stop writes to old, decommission old) with tools Vitess (VReplication) and Citus (citus_rebalance_start()); a load-per-shard bar chart where key=42 makes shard 2 melt, with mitigations (cache with 1 s TTL, replicas for shard 2, salt key#1 … key#N, hash-prefix time keys); a schema change on 64 shards migrating 8 at a time (V2 knows both schemas → DDL per batch with gh-ost / Vitess → V3 assumes new → V4 drops old); a shard-key scorecard (high cardinality, even access, co-locality, skew test > 2× average, orders + line_items both keyed by user_id; good user_id / tenant_id, bad status / country / created_date); and when to use / not use.](diagrams/sd24_info_shard_ops_ai.png)

<details>
<summary><strong>Read as text</strong> — the split-without-downtime playbook</summary>

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

Vitess (YouTube → Slack, GitHub, Shopify), Stripe, and Discord have all written extensively about this dance. **Consistent hashing + virtual nodes** minimise the data that has to move (see §9.9).

</details>

### Case study: Vitess (YouTube → CNCF)

<details>
<summary><strong>Read as text</strong> — VTGate, VTTablet, topology and VReplication</summary>

```
   ┌──────────────────────────────────────────────────────────┐
   │  VTGate     ── parses + routes SQL to the right shard    │
   │     │                                                    │
   │     ▼                                                    │
   │  VTTablet   ── one per MySQL instance (each shard =      │
   │     │          primary + replicas); guards queries       │
   │     ▼                                                    │
   │  MySQL      ── unmodified                                │
   │                                                          │
   │  Topology   ── etcd / ZooKeeper: which shard owns which  │
   │                key range (read by VTGate and VTTablet)   │
   └──────────────────────────────────────────────────────────┘
```

Adds **VReplication** (logical replication built on MySQL row-based binlogs) so resharding is a guided workflow: spin up the new shards, replicate, cutover, drain.

</details>

### Case study: Citus (Postgres)

<details>
<summary><strong>Read as text</strong> — a coordinator over Postgres workers and online rebalancing</summary>

Distributes Postgres tables across worker nodes by a distribution column. The coordinator parses, plans, and pushes work down to the shards. Rebalance online with `citus_rebalance_start()` (moves shards with logical replication while writes keep flowing; Citus 11.1+), or split one hot shard with `citus_split_shard_by_split_points()`.

</details>

## 8.11 Hot key / hot shard mitigation

<details>
<summary><strong>Read as text</strong> — celebrities, viral posts and one shard taking the heat</summary>

Even with hash sharding, the world is uneven: one celebrity, one viral post, one Black-Friday SKU.

```
   load per shard (every request for key=42 hashes to shard 2)

   shard 0  ░░░
   shard 1  ░░░
   shard 2  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ◀── melts
   shard 3  ░░░
```

</details>

### Mitigations

<details>
<summary><strong>Read as text</strong> — caching, replicas, key salting and splitting the hot shard</summary>

- **Cache the hot key** — a CDN edge / Redis layer in front; even a 1-second TTL collapses 100 K RPS into ~1 DB read per second (per cache node).
- **Read replicas for the hot shard** — scale reads.
- **Salt the key** — split the hot row into `key#1`, `key#2`, … `key#N`; writers pick one at random; readers fan out to all N and combine. This is DynamoDB's documented "write sharding" pattern for hot partition keys (e.g. a global vote counter).
- **Sequential-key problem** — on a *range*-sharded store (Bigtable, HBase, Spanner), `now()`-prefixed keys make every write land on the newest shard. Lead the key with a hash (`hash(user_id) | timestamp`), a random byte, or a bit-reversed sequence. Note that **UUIDv7 is time-ordered too**, so it hot-spots here — great for a single B-tree (§7.5), bad as a range-shard key.
- **Adaptive routing** — load balancer detects hot shards and re-routes the next request to a replica.

</details>

## 8.12 Choosing a shard key — the decision that's hard to undo

<details>
<summary><strong>Read as text</strong> — cardinality, even access and co-locality</summary>

Three properties of a good shard key:

1. **High cardinality** — millions of unique values, so load spreads.
2. **Even access pattern** — no single key should attract a hotspot.
3. **Co-locality** — values that need to be read together should land on the same shard (avoid cross-shard joins).

Bad shard keys: `status`, `country`, `created_date` (range scans turn into hotspots). Good: `user_id`, `tenant_id`, `hash(user_id) + bucket`.

> **You almost never get to change a shard key without a multi-month migration.** Spend a week deciding.

</details>

### A two-test checklist before committing

<details>
<summary><strong>Read as text</strong> — the skew test and the co-locality test</summary>

- **Skew test** — run last month's access log against the candidate key; is any single shard > 2× the average?
- **Co-locality test** — does your hottest join (orders ⨝ line_items) split across shards? If yes, shard both tables by the same leading column — e.g. `user_id`, with keys `(user_id, order_id)` and `(user_id, order_id, line_no)` — so an order and its lines always live together.

</details>

## 8.13 Schema migrations across shards

<details>
<summary><strong>Read as text</strong> — expand-contract rolled out shard by shard</summary>

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

</details>

### Per-shard rolling upgrades

<details>
<summary><strong>Read as text</strong> — fail-back replicas, capped waves and per-shard lag</summary>

- Always keep one replica per shard untouched, so you can fail back.
- Cap the number of in-flight migrations (resource pressure on the coordinator).
- Monitor replication lag *per shard*; a single slow shard can block the wave.

</details>

## 8.14 Distributed transactions without 2PC

![Infographic 'Spanner & TrueTime: Strong Consistency, Worldwide': TrueTime uses GPS + atomic clocks so TT.now() returns \[earliest, latest\]; a commit-wait timeline where the interval is 2ε wide, the leader picks s ≥ TT.now().latest and waits (≈ 2ε, mostly overlapping the Paxos round-trip) until earliest > s before the write is visible, with ε = 1–7 ms (≈ 4 ms average, 2012 paper); the architecture Client → Spanserver (tablets, Paxos groups) → Colossus, two Paxos groups (leader + replicas across 3 zones; 3 voters regional, 5 multi-region) linked by 2PC between group leaders; chips for other ways around classic 2PC (Percolator, Calvin, Sagas, Outbox + CDC, CockroachDB); a compare table of Spanner, CockroachDB (Raft, hybrid logical clocks, 500 ms max offset, read restarts), YugabyteDB and TiDB; and when to use / not use.](diagrams/sd24_info_spanner_truetime_ai.png)

<details>
<summary><strong>Read as text</strong> — Percolator, Calvin, sagas, outbox and Spanner-style commits</summary>

"Without 2PC" here means without the *classic* blocking, single-coordinator two-phase commit of §9.11. Some options below drop atomic commit altogether; others keep a 2PC-like step but make it safe to crash.

- **Percolator** (Google, 2010) — client-driven 2PC with no separate coordinator, layered on Bigtable with a timestamp oracle; powered Caffeine, Google's incremental web-indexing system.
- **Calvin** — agree on a global order for each batch of transactions *first*, then every replica applies them deterministically — no commit-time vote (FaunaDB was the best-known commercial user until its 2025 shutdown).
- **Sagas** (§7.8) — give up atomicity, embrace compensation.
- **Outbox + CDC** (§10.10) — local atomic write to DB + outbox table; CDC publishes to other systems eventually.
- **Spanner / CockroachDB** — TrueTime + Paxos groups (Spanner) or hybrid logical clocks + Raft per range (CockroachDB). They still run 2PC internally, but every participant *and* the coordinator is a replicated consensus group, so one machine crashing can't leave a transaction stuck. SQL transactions across continents at the cost of commit latency.

For most production systems, **sagas + outbox** is the modern, scalable answer.

</details>

## 8.15 Spanner & TrueTime — strong consistency at planetary scale

<details>
<summary><strong>Read as text</strong> — ACID across continents with bounded clock uncertainty</summary>

Google's Spanner (a "CP" system) is the canonical answer to "can we have ACID transactions across continents?"

```
   Magic ingredient: TrueTime
     • GPS receivers + atomic clocks in every datacenter
     • TT.now() returns an interval [earliest, latest] that is guaranteed
       to contain the true time; its half-width ε was 1–7 ms (≈ 4 ms on
       average) in the 2012 paper
     • Commit wait: the leader picks commit timestamp s ≥ TT.now().latest,
       then waits until TT.now().earliest > s before anyone may see the
       write (≈ 2ε, mostly overlapped with the Paxos round-trip)
     • Result: external consistency (= strict serializability) worldwide —
       if T1 commits before T2 starts, T1 gets the smaller timestamp
```

</details>

### Architecture in one screen

<details>
<summary><strong>Read as text</strong> — Paxos groups, TrueTime and commit wait</summary>

```
   Client ──▶ Spanserver (manages tablets, runs Paxos groups)
                   │
                   ▼
              Colossus (distributed file system)

   Each data split = one Paxos group: typically 3 voting replicas in
   3 zones (regional) or 5 voters across regions (multi-region); one
   replica is the leader
   Cross-group txns: 2PC, with each group's leader as a participant
   (one of them coordinates)
```

Implications: writes are slow-ish (commit wait), but reads (especially snapshot reads at a specific timestamp) are very fast and globally consistent. This is the trade-off Google made — and why **most** apps don't need it.

</details>

### Spanner-like open alternatives

<details>
<summary><strong>Read as text</strong> — CockroachDB, YugabyteDB and TiDB without atomic clocks</summary>

- **CockroachDB** — Postgres wire protocol, Raft per range, hybrid logical clocks (no atomic clocks needed; instead of commit-wait it assumes a maximum clock offset — 500 ms by default — and restarts reads that fall inside that uncertainty).
- **YugabyteDB** — Postgres compatibility on top of a Spanner-style storage layer.
- **TiDB** — MySQL compatibility on top of TiKV (Raft-backed KV store).

</details>

## 8.16 Multi-region database architectures

![Comparison infographic 'Multi-Region Databases, Polyglot Persistence & DR': four multi-region patterns side by side — Active-passive (writes in the primary region only, no conflicts, e.g. Aurora Global DB with < 1 s lag), Active-active (local writes everywhere, conflicts via LWW, CRDT or app logic, e.g. DynamoDB Global Tables), Geo-partitioned (each row has one home region EU / US / APAC, solves data residency) and Strong-global (cross-region quorum, linearizable, e.g. Spanner, CockroachDB); a polyglot-persistence list (accounts → Postgres, sessions → Redis, catalog → Elasticsearch + Postgres, feed → Cassandra, analytics → BigQuery / Snowflake / ClickHouse, blobs → S3, embeddings → pgvector / Qdrant); a pick-by-need table; a DR table of RPO / RTO / cost from daily snapshots (24 h, 1–4 h) through PITR, async replica, to sync replica (RPO 0, very high cost); runbook chips and quarterly game days.](diagrams/sd24_info_multiregion_dr_ai.png)

<details>
<summary><strong>Read as text</strong> — active-passive, active-active and geo-partitioned, compared</summary>

| Pattern | Writes from | Read latency | Write latency | Conflict resolution |
|---------|-------------|--------------|---------------|---------------------|
| **Active-passive** | Primary region only | Local only in primary; remote elsewhere | Local in primary, slow elsewhere | None (single writer) |
| **Active-active (per-region writes)** | Local in each region | Local everywhere | Local everywhere | LWW, CRDT, or app-level |
| **Geo-partitioned** | Local; each row pinned to a region | Local for owned data | Local for owned data | None (only one region owns each row) |
| **Strong-globally (Spanner)** | Anywhere | Local for snapshot / slightly-stale reads; strong reads may contact the leader | Cross-region quorum | None (linearizable) |

LWW = *last-writer-wins* (the write with the highest timestamp survives; the other is silently dropped). CRDT = *conflict-free replicated data type* (a counter, set, or text type whose concurrent updates always merge to the same result).

</details>

### Concrete examples

<details>
<summary><strong>Read as text</strong> — how real managed databases replicate across regions</summary>

- **DynamoDB Global Tables** — multi-active; by default async replication with LWW conflict resolution and read-your-writes only within a region. Since June 2025 an opt-in **multi-Region strong consistency** mode gives strongly consistent reads in every region (zero RPO) at the price of cross-region write latency.
- **Spanner / CockroachDB / YugabyteDB** — strong consistency globally; writes pay cross-region latency.
- **Aurora Global Database** — async cross-region replication for DR + read-locality (under 1 s lag typical); writes still go to one region.
- **Cassandra DC-aware replication** — per-DC quorums (`LOCAL_QUORUM`) for low-latency local consistency; cross-DC is eventual.

</details>

### Geo-partitioning — the underrated pattern

<details>
<summary><strong>Read as text</strong> — one home region per row for data-residency rules</summary>

For multi-tenant apps with geo-tied users (GDPR, data residency):

```
   tenant=EU rows   ──▶ EU region (sole owner)
   tenant=US rows   ──▶ US region (sole owner)
   tenant=APAC rows ──▶ APAC region (sole owner)
```

Each row has **one home**; writes are always local; cross-region reads are explicit and rare. Spanner, CockroachDB, and YugabyteDB all support this natively. Often the simplest answer to data sovereignty (Ch 25, §18.6).

</details>

## 8.17 Polyglot persistence — the right DB for each job

<details>
<summary><strong>Read as text</strong> — a different store for each access pattern, and the cost</summary>

```
   ┌──────────────────────────────────────────────────────────┐
   │ User accounts        → Postgres (ACID, relational)       │
   │ Session / cache      → Redis                             │
   │ Product catalog      → Elasticsearch (search) + Postgres │
   │ Activity feed        → Cassandra (write-heavy timeline)  │
   │ Recommendations      → Neo4j (graph) or vector DB        │
   │ Analytics            → BigQuery / Snowflake / ClickHouse │
   │ Logs                 → Loki / Elasticsearch              │
   │ Metrics              → Prometheus / TSDB                 │
   │ Blob (images/video)  → S3                                │
   │ Embeddings / RAG     → pgvector / Qdrant / Pinecone      │
   └──────────────────────────────────────────────────────────┘
```

This is the real-world architecture of almost every web-scale company. Each store is chosen for its access pattern, not by ideology.

**Cost:** more systems to learn, monitor, back up, and secure. Don't introduce a new datastore unless it meets a strong technical need your existing stores can't.

</details>

## 8.18 Disaster recovery for databases

<details>
<summary><strong>Read as text</strong> — RPO, RTO and cost for each DR strategy</summary>

| Strategy | RPO | RTO | Cost |
|----------|-----|-----|------|
| **Daily snapshot to same region** | 24 h | 1–4 h | Low |
| **Daily snapshot to another region** | 24 h | 1–4 h | Medium |
| **PITR with WAL archive** | seconds–minutes | 10 min – hours | Medium |
| **Cross-region async replica** | seconds (lag) | minutes (promote) | High |
| **Cross-region sync replica** | 0 | minutes | Very high (write latency) |

</details>

### The DR runbook elements no one prepares until it's too late

<details>
<summary><strong>Read as text</strong> — switching, verifying, communicating and failing back</summary>

- **Connection string switch** — DNS update, runtime config flag, app restart? Pre-write the playbook.
- **App reconfiguration** — schema versions, region-local secrets, feature flags.
- **Verification** — what query proves the new primary is healthy?
- **Replica re-pointing** — old replicas now follow the new primary?
- **Communication** — who tells customers, SRE, support?
- **Failback** — how do you migrate back when the original region is healthy?

</details>

### Drills, not docs

<details>
<summary><strong>Read as text</strong> — quarterly game-days with real failover</summary>

A DR runbook you've never executed is fiction. Quarterly game-days with real failover (in staging at minimum, in prod ideally) are the only thing that turns the runbook into a muscle.

</details>

---

# PART 9: DISTRIBUTED SYSTEMS THEORY

> **Why theory matters here:** every painful distributed-systems bug has a theoretical name. Once you can name the failure mode — split-brain, clock skew, partial failure, head-of-line blocking, write skew, hot key — you can search for the cure other people already published. This part is the vocabulary you need to talk about, debug, and design distributed systems.

## 9.1 The 8 Fallacies of Distributed Computing

![Infographic 'Ground Rules: Fallacies, CAP, PACELC & the Generals': the 8 fallacies of distributed computing (Deutsch 1994 + Gosling 1997) as myth chips; a CAP decision tree where 'Partition occurs' splits into CP 'refuse rather than be wrong' (HBase, MongoDB majority, Spanner) and AP 'serve stale, reconcile later' (Cassandra, DynamoDB, Riak); PACELC (Abadi 2010) rows PA/EL, PC/EC and PC/EL (rare: Yahoo PNUTS) with ~99.9 % of life in the Else branch; the Two Generals with a captured messenger (use at-least-once + idempotency); Byzantine vs crash faults (3f+1 = 4 vs 2f+1 = 3 nodes to survive f = 1); key numbers (Bitcoin < 50 % hash power, Ethereum ⅔ stake, MongoDB w:majority default since 5.0); and when to use / not use.](diagrams/sd24_info_cap_pacelc_ai.png)

<details>
<summary><strong>Read as text</strong> — the eight false assumptions behind distributed bugs</summary>

Before any theorem, the lived experience. The list comes from Sun Microsystems — Peter Deutsch wrote the first seven (1994) and James Gosling added the eighth (1997) — and every distributed-systems bug ultimately traces to assuming one of these is true:

1. The network is reliable.
2. Latency is zero.
3. Bandwidth is infinite.
4. The network is secure.
5. Topology doesn't change.
6. There is one administrator.
7. Transport cost is zero.
8. The network is homogeneous.

If you catch yourself writing code that *would only work* if one of these were true (e.g., "we'll just synchronously call service X — it's always up, right?"), step back.

</details>

## 9.2 CAP Theorem

<details>
<summary><strong>Read as text</strong> — CP vs AP during a partition and why CA does not exist</summary>

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

</details>

### Sloppy uses of CAP to avoid

<details>
<summary><strong>Read as text</strong> — why CAP labels are per operation, not per product</summary>

- "Postgres is CA." → No. A single-node Postgres isn't a distributed system. A Postgres + sync replica *is* CP.
- "Cassandra is AP." → True only at its default consistency level (`ONE`). At `ALL` it's CP. CAP is **per operation**, not per database.
- "MongoDB is AP." → It's CP at `majority` write concern (the default since MongoDB 5.0). With `w:1` (the pre-5.0 default) a primary acknowledges alone, and those writes can be rolled back after a failover — AP-like behaviour; `w:0` (unacknowledged) is looser still.

The theorem is about behaviour *during a partition*. It says nothing about latency, throughput, or normal operation — for that, see PACELC.

</details>

## 9.3 PACELC — the more honest version

<details>
<summary><strong>Read as text</strong> — the latency vs consistency trade in normal operation</summary>

> **PACELC (Abadi, 2010):** If there's a Partition, choose A or C; *Else* (normal operation) choose between Latency and Consistency.

```
   PA/EL   Cassandra, DynamoDB, Riak    — favours availability and low latency
   PC/EC   Spanner, traditional RDBMS   — favours consistency always
           with sync replicas
   PC/EC   MongoDB (majority writes)    — consistent in a partition and in normal ops
   PC/EL   rare: Yahoo PNUTS            — consistent in a partition,
                                          low latency (possibly stale reads) normally
```

MongoDB's quadrant depends on write concern: `majority` (the default since 5.0) is **PC/EC**; the older `w:1` default leaned **PA/EL** (§9.2). CAP/PACELC labels are per-configuration, not per-product.

This captures the *daily* trade-off, not just the rare partition. Most apps live 99.9 % of their lives in the "E" branch — so the EL/EC choice often matters more than the PA/PC choice.

</details>

## 9.4 The Two Generals & Byzantine Generals problems

### Two Generals (a.k.a. Coordinated Attack)

<details>
<summary><strong>Read as text</strong> — why guaranteed exactly-once delivery is impossible</summary>

Two generals on opposite hills must coordinate an attack. Only way to communicate is messengers through enemy territory (who may be captured). **Impossible** to guarantee both agree to attack.

**Implication:** With an unreliable network, you can never *guarantee* a message was received and the sender knows it was received. This is why **exactly-once delivery is impossible** — only "at-least-once + idempotency" (Ch 23, §3.21) or "at-most-once + accepted loss."

</details>

### Byzantine Generals

<details>
<summary><strong>Read as text</strong> — 3f+1 nodes for liars vs 2f+1 for crashes</summary>

Same setup, but now some generals may be traitors who lie. Lamport, Shostak and Pease (1982) proved: you need **3f+1 nodes** to tolerate `f` Byzantine (arbitrary or malicious) failures.

**Implication:** Byzantine-fault-tolerant protocols (PBFT, Tendermint/CometBFT, HotStuff) need 4 nodes to survive 1 traitor — versus 3 nodes for 1 *crash* — plus extra message rounds. Public blockchains sidestep fixed membership altogether: Bitcoin's proof-of-work tolerates attackers holding < 50 % of the hash power, and Ethereum's proof-of-stake finalises blocks with a ⅔ stake supermajority. Inside a trusted datacenter you only need to tolerate *crash* failures, and Raft/Paxos suffice with **2f+1 nodes**.

</details>

## 9.5 Consistency models — the spectrum

![Infographic: consistency models from strongest to weakest — strict serializable, linearizable, sequential, causal, read-your-writes, monotonic reads, eventual — each with plain-English meaning and example systems (Spanner, etcd, ZooKeeper, MongoDB, DynamoDB, Cassandra ONE), a latency meter rising toward the strong end, the separate isolation-level spectrum (read uncommitted to serializable, snapshot still allows write skew), a pick-by-question table and common mix-ups such as the two on-call doctors write-skew example.](diagrams/sd24_info_consistency_models_ai.png)

<details>
<summary><strong>Read as text</strong> — from strict serializable down to eventual, with examples</summary>

```
   Strongest                                                Weakest
   ────────────────────────────────────────────────────────────────▶
   Linearizable  Sequential  Causal  Read-your-writes  Eventual
```

| Model | Plain English | Example |
|-------|---------------|---------|
| **Strict serializable** | Linearizable + serializable txns | Spanner, FoundationDB |
| **Linearizable** | Every op appears atomic at a single global instant | etcd, single-node Postgres, ZooKeeper *writes* |
| **Sequential** | Same order on every node, but not real-time | ZooKeeper reads (a follower may lag, but never reorders) |
| **Causal** | If A happens-before B, every node sees A first | MongoDB causally-consistent sessions, COPS |
| **Read-your-writes** | You always see your own writes (others may lag) | Sticky-session systems |
| **Monotonic reads** | Once you've seen value v, you never see an older value | Many session-pinned systems |
| **Eventual** | Given no new writes, replicas converge | DynamoDB default, Cassandra `ONE` |

Higher consistency = more coordination = higher latency. Pick the weakest one your product can tolerate.

</details>

### Transaction isolation levels (the cousin spectrum)

<details>
<summary><strong>Read as text</strong> — the isolation ladder vs the replica-consistency ladder</summary>

Don't confuse the consistency spectrum (about replicas) with the isolation spectrum (about transactions):

| Level | Prevents | Allows |
|-------|----------|--------|
| **Read uncommitted** | Nothing | Dirty reads, etc. |
| **Read committed** | Dirty reads | Non-repeatable reads, phantoms, write skew |
| **Repeatable read / Snapshot** | Non-repeatable reads | Phantoms (sometimes), write skew |
| **Serializable** | Everything | (Real serial order) |

PostgreSQL's `serializable` = SSI (§7.3). MySQL's `repeatable read` ≈ snapshot. Beware: snapshot isolation does *not* prevent **write skew** (the canonical example: two on-call doctors both ticking "off" because the system showed both as on, ending up with zero coverage).

</details>

## 9.6 Time, clocks, and ordering — the deep dive

![Infographic: time, clocks and ordering — wall clocks drift (NTP ~1 ms LAN, 10–100 ms internet), Lamport timestamps with Process A events 1, 2, 3 sending L=3 to Process B which computes max(0, 3) + 1 = 4 then 5, vector clocks \[2,0,0\] merged into B's \[0,1,0\] to give \[2,1,0\] then \[2,2,0\] with an ordered vs concurrent comparison, and a clock-kinds table (wall, monotonic, PTP, TrueTime ε ≈ 1–7 ms, HLC).](diagrams/sd24_info_clocks_ordering_ai.png)

<details>
<summary><strong>Read as text</strong> — why ordering events is hard without a shared clock</summary>

Distributed systems don't share a clock. Every "what happened first?" question is non-trivial.

</details>

### Clock kinds

<details>
<summary><strong>Read as text</strong> — wall, monotonic and logical clocks and what each is for</summary>

- **Wall clock (NTP-synced)** — drifts; jumps backward when re-synced; resolution ~ms; subject to leap seconds. **Never use for ordering or as a primary key.**
- **Monotonic clock** — never goes backward; resets per process. Use for measuring durations. **Never compare across machines.**
- **NTP** — typically keeps clocks within ~1 ms on a LAN and 10–100 ms over the public internet; a badly configured VM can drift by seconds. Has been the source of many catastrophic outages.
- **PTP (Precision Time Protocol)** — datacenter-grade; sub-microsecond with hardware timestamping (Meta moved its fleet from NTP to PTP in 2022; AWS exposes a PTP hardware clock on recent Nitro instances).
- **TrueTime (Google Spanner)** — GPS + atomic clocks, exposes bounded uncertainty `[earliest, latest]` (ε ≈ 1–7 ms in the 2012 paper). Enables external consistency by **commit-wait**: a txn waits out the uncertainty before its write becomes visible (§8.15).

</details>

### Lamport timestamps

<details>
<summary><strong>Read as text</strong> — one counter per node and a total order consistent with causality</summary>

Each node has a counter `L`. Rules:

```
   On local event:        L := L + 1
   On send:               L := L + 1, attach L to the message
   On receive(msg, L_m):  L := max(L, L_m) + 1
```

If event a happened before event b, then `L(a) < L(b)`. Break ties by node id and you get a **total order** consistent with causality. The converse fails: `L(a) < L(b)` does *not* prove a happened before b — Lamport clocks can't tell "concurrent" from "ordered".

```
   Process A:  ●1───────●2───────●3  (send, L=3)
                                  \
                                   \  message carries L=3
                                    ▼
   Process B:                       ●4───────●5
               B's counter was 0, so on receive L = max(0, 3) + 1 = 4
```

</details>

### Vector clocks

<details>
<summary><strong>Read as text</strong> — a counter per node that detects concurrent updates</summary>

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

Lets you detect *real* concurrent updates — used by Amazon's original Dynamo (2007 paper) and Riak to flag conflicts for the application to resolve. (The DynamoDB *service* does not expose vector clocks; it resolves conflicts with last-writer-wins.)

</details>

### Hybrid Logical Clocks (HLC)

<details>
<summary><strong>Read as text</strong> — physical time plus a logical counter</summary>

Best of both worlds. Each timestamp = `(physical_time, logical_counter)`. Stays close to wall-clock time (good for human debugging) while preserving causality. Used in CockroachDB, YugabyteDB, MongoDB ≥ 3.6.

</details>

## 9.7 Consensus algorithms

![Infographic: consensus — Raft write path with a leader in term 3 sending AppendEntries(x) to four followers, two acks giving leader + 2 followers = 3 of 5 = majority → commit; a Paxos Prepare/Promise then Accept/Accepted swim lane; Raft's six rules; and a cluster sizing table (3→1, 4→1 no gain, 5→2, 7→3 failures; 2f + 1 crash, 3f + 1 Byzantine).](diagrams/sd24_info_consensus_raft_ai.png)

<details>
<summary><strong>Read as text</strong> — Paxos, Raft, Zab, EPaxos and BFT protocols compared</summary>

> **Problem:** N nodes need to agree on one value even if some crash.

| Algorithm | Notable property | Used in |
|-----------|------------------|---------|
| **Paxos (1989)** | The classic; correct but hard to implement | Google Chubby, Spanner |
| **Multi-Paxos** | Paxos optimised for a stream of decisions | Many internal Google systems |
| **Raft (2014)** | Designed to be *understandable* | etcd, Consul, CockroachDB, TiKV, MongoDB replica sets |
| **Zab** | Atomic broadcast, primary-backup | ZooKeeper |
| **EPaxos** | Leaderless: any replica commits non-conflicting commands in one round trip | Research; WAN prototypes |
| **PBFT / Tendermint (CometBFT) / HotStuff** | Tolerates *Byzantine* (malicious) nodes | Permissioned blockchains, Cosmos, Aptos (HotStuff lineage) |

</details>

### Paxos in one page (the part that confuses everyone)

<details>
<summary><strong>Read as text</strong> — the three roles, the two phases and duelling proposers</summary>

```
   Three roles per process: Proposer, Acceptor, Learner
   Two phases: Prepare/Promise then Accept/Accepted

   Phase 1 (Prepare):
     Proposer picks a unique ballot number n; sends Prepare(n) to acceptors.
     Acceptor: if n > every ballot it has promised so far, reply
       Promise(n, prev_accepted_value); else reject.

   Phase 2 (Accept):
     If proposer has promises from a majority, picks v =
        (highest-ballot prev_accepted_value among promises, else proposer's choice)
     Sends Accept(n, v).
     Acceptor: if it hasn't promised a higher ballot since, store (n, v)
       and reply Accepted.

   Once a majority has Accepted(n,v) → v is chosen forever.
```

Two proposers with overlapping ballots can ping-pong (livelock). Real systems use a **leader** (Multi-Paxos / Raft) to avoid the race.

</details>

### Raft in one paragraph

<details>
<summary><strong>Read as text</strong> — leader election, log replication and majority commit</summary>

A leader is elected by majority vote. The leader sequences all writes into a log and replicates to followers. A write commits once a majority of the cluster (the leader counts itself) has it. If the leader dies, a new election (with randomised timeouts) picks another. That's it.

```
   client ──write x──▶ LEADER (term 3)
                         │ 1. append x to its own log
                         │ 2. AppendEntries(x) ──▶ every follower, in parallel
                         │ 3. wait until a MAJORITY of the cluster stores x
                         │      (5 nodes: leader + 2 followers = 3 of 5)
                         │ 4. mark x committed, apply it, reply OK to the client
                         ▼ 5. later AppendEntries tell followers "committed up to x"
```

</details>

### Why not 3PC?

<details>
<summary><strong>Read as text</strong> — why the extra phase fails under real network partitions</summary>

Three-phase commit adds a "pre-commit" phase to avoid 2PC's blocking. **But** it assumes no network partitions and bounded message delays — both of which are wrong in real networks. So in practice nobody uses 3PC. Modern systems use Raft/Paxos or sagas instead.

</details>

## 9.8 Raft — the algorithm in 6 rules

<details>
<summary><strong>Read as text</strong> — the six rules and the two RPCs</summary>

```
   1. There's at most one leader per term.
   2. Leader handles all writes; replicates entries to followers.
   3. An entry is "committed" once a majority of the cluster (leader
      included) stores it — for an entry from the leader's own term.
   4. A leader never overwrites or deletes entries in its log.
   5. A follower missing entries (or holding conflicting ones) is
      backfilled by the leader, which overwrites the conflicts.
   6. Only nodes with up-to-date logs can win elections.
```

Two RPCs implement the whole protocol: `RequestVote` and `AppendEntries`. Used in etcd, Consul, TiKV, CockroachDB, MongoDB (replica set, Raft-inspired), Kafka KRaft (Kafka 4.0, 2025, removed ZooKeeper entirely), and many more.

</details>

### Sizing the cluster

<details>
<summary><strong>Read as text</strong> — 2f+1 nodes and why even sizes gain nothing</summary>

```
   Tolerate f failures → need 2f + 1 nodes (crash failures only)
   Tolerate f Byzantine failures → need 3f + 1 nodes

   3 nodes  → tolerates 1 failure   (typical)
   5 nodes  → tolerates 2 failures  (sweet spot for prod etcd / ZK)
   7 nodes  → tolerates 3 failures  (rare; latency grows)
```

Even numbers gain nothing: 4 nodes need 3 for a majority, so they still tolerate only `f=1` — the same as 3 nodes — while every write waits for one more ack.

</details>

## 9.9 Consistent Hashing

![Infographic: consistent hashing and quorum math — hash % N moving about 4 of every 5 keys (≈ 80%) when going from 4 to 5 servers, a clockwise ring with S1–S4 and keyA–keyD where adding S5 moves only keyD (S1 → S5), virtual nodes / rendezvous / Maglev chips, an N = 3 quorum with write set W = 2 and read set R = 2 overlapping on one replica, and a table of W/R settings (2/2 balanced, 1/1 stale, 3/1 fragile writes, 1/3 fragile reads).](diagrams/sd24_info_hashing_quorum_ai.png)

<details>
<summary><strong>Read as text</strong> — the ring, clockwise ownership and virtual nodes</summary>

> **Problem:** If you shard by `hash(key) % N` and N changes, almost every key moves. Disaster for caches.

> **Idea:** Map both keys and servers onto a circular hash ring. A key belongs to the next server clockwise. Adding/removing a server only affects keys in its arc.

```
   hash ring 0 … 2³²−1, walked clockwise ──▶

        S1 ●──────── keyA ────────● S2
           │                      │
      keyD ●                      ● keyB
           │                      │
        S4 ●──────── keyC ────────● S3

   Each key belongs to the next server clockwise:
      keyA → S2    keyB → S3    keyC → S4    keyD → S1

   Add S5 on the arc between keyD and S1:
      only keyD moves (S1 → S5); keyA, keyB, keyC stay where they are.
```

With `hash(key) % N`, going from 4 to 5 servers moves every key whose remainder changes — about 4 out of 5 keys. On the ring, a new server takes over only the keys on the arc just before it — on average 1/5 of the keys, all from a single neighbour.

**Virtual nodes (vnodes):** to avoid imbalance, each physical server is placed on the ring many times (e.g., 100 virtual positions). This smooths load and lets you give beefier servers more virtual nodes.

</details>

### Variants worth knowing

<details>
<summary><strong>Read as text</strong> — jump, rendezvous and Maglev hashing</summary>

- **Jump consistent hash (Lamping & Veach, Google, 2014)** — no ring at all, no memory; given `key` and `N`, returns the bucket directly with minimal movement when N grows. Catch: buckets are numbered 0…N−1, so you can only add or remove at the *end* — fine for storage shards, wrong for a cache cluster where any node can die.
- **Rendezvous (HRW) hashing** — for each key, compute `hash(key, server)` for every server; pick the highest. Beautifully simple, but each lookup is O(N) in the number of servers.
- **Maglev hashing (Google)** — table-based; lookup is O(1); used in their L4 load balancer.

Used in: Memcached client libraries (ketama), Cassandra, Amazon's Dynamo, Riak, Akamai's CDN, and most sharded cache layers since.

</details>

## 9.10 Quorum math — N, W, R

<details>
<summary><strong>Read as text</strong> — N, W, R and the overlap rule</summary>

Dynamo-style systems give you knobs:

- **N** = total replicas of a key
- **W** = how many replicas must acknowledge a write before it counts as done
- **R** = how many replicas a read must hear from before it answers

> **Overlap rule:** if **W + R > N**, every read set shares at least one replica with every write set (pigeonhole: W + R slots among only N replicas), so a read always *contacts* a replica that holds the latest acknowledged write and returns it by picking the highest version.

> **Write-write rule:** if **W > N/2** (a majority: W ≥ ⌊N/2⌋ + 1), any two write sets overlap too, so two conflicting writes can't both succeed without one seeing the other.

**What each setting survives:** writes keep succeeding while at least W replicas are up (tolerates N − W down); reads while at least R are up (tolerates N − R down). An acknowledged write survives losing any W − 1 of its replicas.

```
   N  W  R   W+R    overlap?   writes survive   reads survive   character
   3  2  2    4      yes        1 down           1 down          balanced (Dynamo's classic quorum)
   3  1  1    2      no         2 down           2 down          fastest; reads may be stale
   3  3  1    4      yes        0 down           2 down          fast reads, fragile writes
   3  1  3    4      yes        2 down           0 down          fast writes, slow fragile reads
```

"Overlap" is *not* linearizability: a write that failed after reaching fewer than W replicas, concurrent writes resolved by last-writer-wins, and sloppy quorums (below) can all still produce surprising reads.

Tunable consistency per request — pick the trade-off that matches the operation (a tweet can be eventually consistent; a money transfer cannot).

</details>

### Sloppy quorum & hinted handoff

<details>
<summary><strong>Read as text</strong> — stand-in nodes and replaying writes to the owner</summary>

When some replicas are unreachable, **sloppy quorum** lets a write succeed on temporary "stand-in" nodes outside the preference list. The stand-in keeps a **hinted handoff** record and replays the write to the rightful owner when it returns. Improves write availability — but a *strict* `W+R>N` guarantee no longer holds.

</details>

## 9.11 Two-phase commit (2PC) and why it hurts

![Infographic: two-phase commit — prepare / YES (logged, locks held) / COMMIT sequence between a coordinator and two participants, the coordinator crashing before deciding so both participants are in doubt holding locks, three escape routes (saga, Paxos/Raft-replicated 2PC as in Spanner and CockroachDB, Calvin), a failure-modes table and when 2PC is acceptable (short intra-datacenter XA across two RDBMSs).](diagrams/sd24_info_two_phase_commit_ai.png)

<details>
<summary><strong>Read as text</strong> — prepare, decide and the in-doubt blocking problem</summary>

```
   Phase 1 (prepare): Coordinator asks every participant "can you commit?"
                      Each one durably logs the work, keeps its locks,
                      and votes YES — or votes NO
   Phase 2 (decide):  All YES → coordinator logs COMMIT and tells everyone;
                      any NO or timeout → ABORT
```

**Failure modes:**

- **Coordinator crashes after the votes, before announcing the decision** → participants that voted YES are *in doubt*: they may not commit or abort on their own, so they sit on their locks until the coordinator recovers (forever, if its log is lost). This is the famous *blocking* problem.
- **A participant crashes after voting YES** → on restart it must ask the coordinator for the outcome before it can release locks.
- **Network partition** → 2PC stays *safe* (nobody decides alone) but *blocks*: in-doubt participants wait with locks held. Inconsistency appears only when an operator forces a "heuristic" commit or abort to unblock them.

Modern systems either avoid cross-service atomic commit (**sagas**, §7.8) or keep 2PC but make the coordinator and every participant a replicated Paxos/Raft group (**Spanner**, CockroachDB), so a single crash no longer blocks; **Calvin** skips the commit-time vote by agreeing on transaction order up front (§8.14).

When 2PC *is* OK: short-lived, intra-datacenter, low-volume transactions where downtime on the coordinator is rare and recoverable (e.g., XA — the X/Open standard 2PC interface — across two RDBMSs that both you and your DBA control). For internet-scale, choose another tool.

</details>

## 9.12 Distributed locks — the biggest "looks easy" trap

![Infographic: distributed locks and leases — GC-pause race timeline (t=0 A gets token 14 with lease until t=30, t=1 GC pause, t=30 lease expires, t=35 B gets token 15 and writes, t=40 A wakes and writes token 14) where storage tracking highest token 15 accepts 15 and rejects 14; etcd-style leader election with a /leader key and TTL = 10s lease; failure detection via heartbeats O(N²), gossip O(log N), SWIM and phi accrual; and a use-instead table (etcd, ZooKeeper, Consul, Postgres advisory locks, DynamoDB conditional writes; Redis SETNX only for best-effort dedup).](diagrams/sd24_info_locks_leases_detection_ai.png)

<details>
<summary><strong>Read as text</strong> — why one-worker-at-a-time is harder than it sounds</summary>

Use case: "only one worker may process job X at a time." Sounds trivial. Isn't.

</details>

### The three properties a lock must give you

<details>
<summary><strong>Read as text</strong> — mutual exclusion, deadlock freedom and fault tolerance</summary>

1. **Mutual exclusion** — at most one holder.
2. **Deadlock-free** — if a holder dies, the lock eventually frees.
3. **Fault tolerance** — survives a node failure.

</details>

### Lease-based locks (the only correct pattern)

<details>
<summary><strong>Read as text</strong> — locks that expire unless renewed</summary>

```
   1. Client asks lock manager for lock on key X with TTL.
   2. Lock manager returns (held=true, fencing_token=14, lease_until=t+30s).
   3. Client does work, periodically heartbeats to extend the lease.
   4. When done, client releases (or lease expires naturally).
```

The lease (a lock that expires on its own unless renewed) fixes "the holder died, so the lock never frees". On its own it is still not safe — the holder can be *paused* past its lease without knowing it, which is why every lease must come with a fencing token.

</details>

### Fencing tokens — the missing piece

<details>
<summary><strong>Read as text</strong> — the GC-pause failure and storage that rejects stale tokens</summary>

Even with leases, a GC pause can cause this:

```
   t=0   Client A acquires lock (token 14, lease until t=30)
   t=1   Client A's JVM stops the world (long GC) — no heartbeats
   t=30  Lease expires
   t=35  Client B acquires (token 15) and writes
   t=40  Client A wakes up — thinks it still owns the lock — writes
   t=41  Two writers! Storage corruption.
```

**Fix:** the *storage* (not the lock manager) rejects writes with stale tokens.

```
   Storage tracks "highest token ever seen for key X"
   t=35  Client B's write with token 15 → accepted (highest seen = 15)
   t=40  Client A's write with token 14 → rejected (14 < 15)
```

</details>

### Redlock controversy

<details>
<summary><strong>Read as text</strong> — the debate over locking on independent Redis nodes</summary>

Redis's "Redlock" tries to do distributed locking on top of 5 independent Redis nodes. Martin Kleppmann famously argued (2016) it's unsafe under process pauses, clock jumps and network delays — and that it hands out no fencing token; antirez (Redis author) pushed back. Net advice: **don't use Redis-based locks for correctness-critical operations**. Use them for performance optimisation (avoid duplicate work) where a rare double-execution is tolerable, paired with idempotency (Ch 23, §3.21).

</details>

### What to use instead

<details>
<summary><strong>Read as text</strong> — strong locks vs best-effort job dedup</summary>

| Use case | Tool |
|----------|------|
| Strong correctness (only-one-writer to storage) | etcd, ZooKeeper, Consul, Postgres advisory locks, DynamoDB conditional writes |
| Best-effort dedup of background jobs | Redis SETNX with TTL + idempotency in the job |
| Cluster-wide leader election | etcd lease, ZooKeeper ephemeral node, Kubernetes Lease API |

</details>

## 9.13 Leader election & leases

<details>
<summary><strong>Read as text</strong> — picking one primary out of N candidates</summary>

Variations on locking, for picking one "primary" out of N candidates.

</details>

### How a leader election works (etcd-style)

<details>
<summary><strong>Read as text</strong> — a leased key, compare-and-swap and renewals</summary>

```
   1. Each candidate writes a key /leader with a lease (TTL=10s).
   2. First writer wins (compare-and-swap on key absence).
   3. Winner heartbeats to renew lease.
   4. If winner dies, lease expires, key disappears, others race again.
```

</details>

### Why fencing tokens matter here too

<details>
<summary><strong>Read as text</strong> — epochs and terms that reject a dethroned leader</summary>

Same problem as locks: the dethroned leader may not yet know. Every write the leader does should carry a monotonically increasing epoch / term number, and the storage layer rejects writes from stale epochs. **This is what Raft's `currentTerm` does built-in.**

</details>

### Pre-vote optimization

<details>
<summary><strong>Read as text</strong> — asking for votes before bumping the term</summary>

Naive election: if a network blip makes a follower think the leader is dead, it starts an election and bumps the term, forcing the real leader to step down. **Pre-vote** (Raft extension): candidate first asks "would you vote for me?" without bumping the term. Used by etcd and many production Raft impls to reduce churn.

</details>

## 9.14 Gossip, heartbeats, failure detection

<details>
<summary><strong>Read as text</strong> — heartbeats, gossip, SWIM and phi accrual</summary>

How do nodes know who's alive in a cluster of thousands?

- **Heartbeat** — every node pings every other node each interval: with N nodes that's N × (N − 1) messages per interval, i.e. O(N²) at scale.
- **Gossip protocol** — each node periodically tells a random other node what it knows. Information spreads epidemically in O(log N) rounds. Used by Cassandra, Consul, Akka Cluster, HashiCorp Serf.
- **SWIM** — Scalable Weakly-consistent Infection-style Process group Membership. Each node probes one random peer per round; if it gets no reply, it asks a few other nodes to probe that peer *indirectly* before suspecting it — so per-node load stays constant and one bad link doesn't cause a false alarm. Used by Consul / Serf (via HashiCorp memberlist).
- **Phi accrual failure detector** — outputs a *suspicion level* `φ` instead of binary up/down (more robust to flaky networks). Used by Cassandra, Akka.

</details>

### The detection latency / false-positive trade-off

<details>
<summary><strong>Read as text</strong> — fast detection vs false alarms</summary>

```
   Short timeout → fast detection, more false positives ("flapping")
   Long timeout  → fewer false positives, slow detection
```

Phi accrual lets the *consumer* of the failure signal choose its tolerance (`φ_threshold`) without changing the detector.

</details>

## 9.15 Bloom filter

![Infographic on Bloom filters: a 10-bit array 0 1 0 1 1 0 1 0 0 1 where 'alice' sets bits 3, 6, 9 and 'bob' sets bits 1, 4, 6; queries show alice = MAYBE present, carol (bit 7 is 0) = DEFINITELY ABSENT, dave = false positive, with (5/10)^3 = 12.5 % false positives; sizing formulas and the callout '1 M keys at 1 % -> 1.2 MB, k = 7'; a table of bits per key vs best k vs false-positive rate (5/3/9.2 %, 8/6/2.2 %, 10/7/0.82 %, 15/10/0.074 %, 20/14/0.0067 %); when to use (SSTable skipping in Cassandra/RocksDB/HBase, username checks, crawled URLs) and when not (deletes, certain yes).](diagrams/sd24_info_bloom_filter_ai.png)

<details>
<summary><strong>Read as text</strong> — a bit array, k hashes and maybe-present vs definitely-absent</summary>

> **Simple Explanation:** A *probabilistic* "is this key in the set?" answer. Tiny memory. May say "yes" when the answer is no (false positive). *Never* says "no" when the answer is yes.

> **Official Definition (Bloom, 1970):** a bit array of `m` bits, all 0 at first, plus `k` independent hash functions that each map a key to one of the `m` positions. *Insert* sets the `k` bits of the key to 1; *query* answers "maybe present" if all `k` bits are 1, and "definitely absent" if any is 0.

A 10-bit filter with `k = 3`, after inserting "alice" (bits 3, 6, 9) and "bob" (bits 1, 4, 6 — bit 6 is shared):

```
   index:  0 1 2 3 4 5 6 7 8 9
   bits:  [0 1 0 1 1 0 1 0 0 1]
                 ▲     ▲     ▲
                 └─────┴─────┴── "alice" → bits 3, 6, 9

   query "alice" → bits 3, 6, 9 are all 1        → MAYBE present
   query "carol" → bits 1, 4, 7 → bit 7 is 0     → DEFINITELY ABSENT
   query "dave"  → bits 1, 3, 9 are all 1        → MAYBE present (false positive!)
```

"dave" was never inserted — its bits just happen to have been set by alice and bob. With 5 of the 10 bits set, a key that was never inserted lands on three 1-bits with probability (5/10)³ = 12.5 %: that is this toy filter's false-positive rate. Bits are never cleared, so a key that *was* inserted always finds its bits set — no false negatives.

Used to:

- Skip disk reads for keys an SSTable (an LSM-tree's sorted on-disk file, §7.5) definitely doesn't hold (Cassandra, RocksDB, HBase).
- Answer "is this username free?" without a DB hit when the filter says *definitely not taken*; only "maybe taken" goes to the DB.
- Filter URLs already crawled.

Variants: **Counting Bloom** (small counters instead of bits, so it supports delete), **Cuckoo filter** (supports delete; smaller than Bloom at low FPRs), **Quotient filter**, **XOR filter** (smaller and faster to query, but immutable — build once).

</details>

### Bloom filter sizing math

<details>
<summary><strong>Read as text</strong> — bits per element, the best k and the false-positive rate</summary>

For a Bloom filter with `n` elements and target false-positive rate `p` (FPR):

```
   false-positive rate:  p ≈ (1 − e^(−k·n/m))^k
   bits needed:          m = −n × ln(p) / (ln 2)²   ≈ 1.44 × n × log₂(1/p)
   optimal hashes:       k = (m / n) × ln 2         ≈ 0.693 × m/n

   Example: n = 1,000,000 items, p = 1 %
            m = 1,000,000 × 4.605 / 0.4805 ≈ 9.585 million bits ≈ 1.2 MB
            k = 9.585 × 0.693 = 6.64 → round to 7 hash functions
            check: (1 − e^(−7/9.585))^7 = 0.5182^7 ≈ 0.0100 = 1.0 %
```

| Bits per element (m/n) | Best k | False-positive rate |
|---|---|---|
| 5 | 3 | 9.2 % |
| 8 | 6 | 2.2 % |
| 10 | 7 | 0.82 % |
| 15 | 10 | 0.074 % |
| 20 | 14 | 0.0067 % |

**Sweet spot:** ~10 bits/element for ~1 % FPR; every extra ~4.8 bits per element cuts the FPR another 10×. If you can't afford that, accept a higher FPR (rarely a problem — false positives just trigger an extra real lookup).

</details>

## 9.16 CAP in a nutshell — the decision table

```
   ┌─────────────────────────────────────────────────────────────┐
   │ During a partition…                                         │
   │                                                             │
   │ CP system (Spanner, HBase, etcd, ZK, MongoDB w/ majority):  │
   │   refuses writes on the minority side → strongly consistent │
   │   but partly unavailable                                    │
   │                                                             │
   │ AP system (Cassandra, DynamoDB, Riak):                      │
   │   accepts writes on both sides → fully available but reads  │
   │   may diverge and must be reconciled                        │
   │                                                             │
   │ "CA" is a marketing word, not an architecture.              │
   └─────────────────────────────────────────────────────────────┘
```

> **Idempotency tokens** in distributed flows are essential glue here — see Ch 23, §3.21 for the implementation pattern (cross-referenced to avoid duplicating).

---

# PART 10: MESSAGING & STREAMING

## 10.1 Why a queue?

![Infographic comparing messaging shapes and delivery guarantees: producer -> queue of messages -> consumer, decoupling them in time, scale and failure; three columns — Queue (each message to one consumer, removed when acked; SQS, RabbitMQ, ActiveMQ), Stream/log (immutable log, consumers track offsets and can replay; Kafka, Pulsar, Kinesis), Pub/Sub (every subscriber gets a copy, fire-and-forget; durable GCP Pub/Sub, SNS -> SQS; Redis pub/sub, NATS core); delivery badges at most once / at least once / exactly once with how each is achieved; a pick-by-need table; mix-ups noting Kafka EOS covers only Kafka -> Kafka.](diagrams/sd24_info_queues_delivery_ai.png)

<details>
<summary><strong>Read as text</strong> — decoupling fast producers from slow consumers</summary>

> **Simple Explanation:** A queue is a buffer between a fast producer and a slow consumer, so producers don't wait. It also lets the consumer crash without losing work — the message stays until acknowledged.

```
   producer ──▶ [ msg msg msg msg msg ] ──▶ consumer
                       QUEUE
   Decouples them in time, in scale, and in failure.
```

Benefits: **decoupling**, **smoothing bursts**, **retry**, **at-least-once delivery**, **fan-out** (one producer → many consumer groups).

</details>

## 10.2 Queue vs Stream vs Pub/Sub

<details>
<summary><strong>Read as text</strong> — consume-once queues, replayable logs and broadcast topics</summary>

```
   QUEUE             STREAM (log)              PUB/SUB
   ───────           ─────────────              ────────
   Each msg          Messages live in           Each topic broadcasts
   delivered to      an immutable log;          to all subscribers; no
   one consumer;     consumers read from        notion of "consumed"
   removed when      offsets; can replay        — fire-and-forget
   acked.            history.
   SQS, RabbitMQ     Kafka, Pulsar, Kinesis     Redis pub/sub, NATS core
   ActiveMQ,                                    (durable pub/sub — GCP
   Cloud Tasks                                  Pub/Sub, SNS → SQS — keeps
                                                a copy per subscription
                                                until each one acks)
```

</details>

## 10.3 Delivery guarantees — the three options

<details>
<summary><strong>Read as text</strong> — at most once, at least once and exactly once</summary>

| Guarantee | Meaning | How |
|-----------|---------|-----|
| **At most once** | May lose, never duplicate | Fire-and-forget |
| **At least once** | Never lose, may duplicate | Producer retries until ack; consumer must be idempotent |
| **Exactly once** | Never lose, never duplicate | Hard! Needs transactional producer + dedupe (Kafka EOS — "exactly-once semantics", §10.9 — plus idempotent consumers) |

**In practice:** end-to-end exactly-once = at-least-once delivery + idempotent (or transactional) processing at every side effect. Kafka's EOS covers the Kafka → Kafka hop; anything outside Kafka (a DB, an email, a payment API) needs its own dedupe.

</details>

## 10.4 Kafka in one diagram

![Infographic on Kafka internals and exactly-once: topic 'orders' with RF 3 across brokers A, B, C (P0 leader on A, P1 leader on B, P2 leader on C), a producer routing by hash(key) % 3 to the leader and a consumer group with one consumer per partition; badge 'RF 3 + acks=all + min.insync.replicas=2 -> survives 1 broker down, no acked write lost'; the transactional loop poll -> beginTransaction -> send outputs -> sendOffsetsToTransaction -> commitTransaction with abort on error and a read_committed consumer; backpressure and DLQ pills; key-knobs table (acks, min.insync.replicas, retention, compaction, idempotent producer).](diagrams/sd24_info_kafka_internals_eos_ai.png)

<details>
<summary><strong>Read as text</strong> — topics, partitions, offsets and consumer groups</summary>

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

</details>

## 10.5 Backpressure

<details>
<summary><strong>Read as text</strong> — buffer, drop, block or persist and watch the lag</summary>

When consumers can't keep up, the queue grows. Options:
- **Buffer** (queue grows) — until memory runs out.
- **Drop** — sample or shed.
- **Block** producer (push back via flow control — gRPC, Reactive Streams).
- **Persist and absorb** — Kafka keeps every message on disk anyway (bounded by retention) and SQS stores messages for up to 14 days, so a slow consumer just builds *lag* instead of losing data — watch consumer lag as your backpressure signal.

</details>

## 10.6 Ordering guarantees

<details>
<summary><strong>Read as text</strong> — per-partition order and partitioning by key</summary>

Most queues only guarantee order *within a single partition / queue*. If you need global order, you give up parallelism. Common pattern: partition by a key that matters (e.g., `user_id`) so all messages for one user land in one partition and stay in order.

</details>

## 10.7 Dead-letter queues (DLQ)

<details>
<summary><strong>Read as text</strong> — parking repeatedly failing messages for inspection</summary>

Messages that fail processing N times go to a DLQ — kept aside for human inspection rather than blocking the main queue forever.

</details>

---

## 10.8 Kafka internals you should know

<details>
<summary><strong>Read as text</strong> — brokers, replicas, the ISR and the durability knobs</summary>

```
   ┌────────────────────────────────────────────────────────────────┐
   │ Cluster: brokers A, B, C   (metadata: KRaft controller quorum) │
   │   └─ Topic "orders", replication factor 3                      │
   │        ├─ Partition 0 ── leader on broker A; replicas B, C     │
   │        ├─ Partition 1 ── leader on broker B; replicas A, C     │
   │        └─ Partition 2 ── leader on broker C; replicas A, B     │
   │                                                                │
   │ Producer ──▶ leader of hash(key) % partitions                  │
   │ Consumer group ── each partition consumed by exactly one       │
   │                   member of the group at a time                │
   │                                                                │
   │ ISR (In-Sync Replicas) = replicas that are caught up           │
   │ RF=3 + acks=all + min.insync.replicas=2 ⇒ writes continue      │
   │   with 1 broker down, and no acknowledged write is lost        │
   └────────────────────────────────────────────────────────────────┘
```

Key knobs:
- **`acks`** — `0` (fire-and-forget) / `1` (leader only) / `all` (every in-sync replica; durable). The producer default has been `all` since Kafka 3.0.
- **`min.insync.replicas`** — with `acks=all`, refuse writes when fewer replicas are in sync (durability gate).
- **Retention** — by time (`log.retention.hours`) or by size; Kafka isn't a queue, it's a log.
- **Compaction** — keep only the latest value per key (e.g., for state stores).

</details>

## 10.9 Exactly-once in Kafka — three pieces in concert

<details>
<summary><strong>Read as text</strong> — idempotent producer, transactions and read-committed consumers</summary>

1. **Idempotent producer** — the broker remembers, per (producer id, partition), the last batch sequence number; a retried batch it has already written is dropped instead of appended twice. On by default since Kafka 3.0.
2. **Transactional producer** — with a stable `transactional.id`, it writes to several partitions *and* commits the consumer offsets in one atomic transaction. A restarted instance with the same id bumps an *epoch*, which fences off the old "zombie" instance.
3. **Consumer in `read_committed` mode** — returns only committed records: it holds back records of still-open transactions and drops aborted ones.

The consume → transform → produce loop that ties them together:

```java
// Sketch — needs the kafka-clients library and a running broker.
// Producer config: transactional.id=orders-enricher-1 (also enables idempotence)
// Consumer config: isolation.level=read_committed, enable.auto.commit=false
producer.initTransactions();                  // once: register the id, fence zombies
while (true) {
    ConsumerRecords<String, String> batch = consumer.poll(Duration.ofMillis(500));
    if (batch.isEmpty()) continue;
    producer.beginTransaction();
    try {
        Map<TopicPartition, OffsetAndMetadata> offsets = new HashMap<>();
        for (ConsumerRecord<String, String> r : batch) {
            producer.send(new ProducerRecord<>("a", r.key(), transform(r.value())));
            producer.send(new ProducerRecord<>("b", r.key(), audit(r.value())));
            offsets.put(new TopicPartition(r.topic(), r.partition()),
                        new OffsetAndMetadata(r.offset() + 1));   // next offset to read
        }
        producer.sendOffsetsToTransaction(offsets, consumer.groupMetadata());
        producer.commitTransaction();         // both outputs + offsets: all-or-nothing
    } catch (ProducerFencedException e) {
        producer.close();                     // a newer instance owns this id — stop
        break;
    } catch (KafkaException e) {
        producer.abortTransaction();          // read_committed readers never see it
        // seek the consumer back to its last committed offsets, then retry the batch
    }
}
```

This gives you exactly-once *within Kafka*. End-to-end exactly-once into a database still needs an **idempotent sink** (upsert by primary key, or write with an idempotency key).

</details>

## 10.10 The Outbox pattern and CDC

![Infographic on the Outbox pattern and CDC: Order Service writes orders (id=42, status='paid') and an outbox row 'OrderPaid' inside one BEGIN…COMMIT (both or neither); WAL/binlog -> Relay or Debezium (may publish twice) -> Kafka -> dedupe by event id -> Consumers; raw-table CDC exposes the internal schema vs outbox table + Debezium outbox event router; comparison table of Kafka vs RabbitMQ vs SQS (model, throughput millions/s vs ~50 K/s per node vs practically unlimited, latency 1–10 ms vs < 1 ms vs 10–100 ms, ordering, retention, best for).](diagrams/sd24_info_outbox_cdc_ai.png)

<details>
<summary><strong>Read as text</strong> — one local transaction plus a relay to the broker</summary>

> **Problem:** A service must update its DB *and* publish an event. Dual-write to DB + message broker is non-atomic — one can succeed, the other fail.

```
   BEGIN;
     UPDATE orders SET status='paid' WHERE id=42;
     INSERT INTO outbox (event_type, payload) VALUES ('OrderPaid', '...');
   COMMIT;

   Separately: a relay (or CDC tool) reads outbox → publishes to Kafka → marks done.
```

Both writes commit or neither does, so an event can never be lost. The relay can still publish one *twice* (crash after publishing, before marking done), so consumers dedupe by event id — at-least-once again.

**CDC (Change Data Capture)** with Debezium reads the database's WAL (Postgres) or binlog (MySQL) directly and produces Kafka events. You *can* stream raw table changes with no outbox at all — but then your internal table schema becomes the public event contract. The common best-of-both: keep the outbox table, and let Debezium tail the WAL for outbox inserts (its *outbox event router*) instead of a polling relay. Either way: event-driven architecture without dual-write hazards.

</details>

## 10.11 Choosing between Kafka, RabbitMQ, and SQS

<details>
<summary><strong>Read as text</strong> — Kafka vs RabbitMQ vs SQS side by side</summary>

| | **Kafka** | **RabbitMQ** | **AWS SQS** |
|---|---|---|---|
| Model | Distributed log (replayable) | Broker queue (consume + ack) | Managed queue |
| Throughput | Millions/sec/cluster | ~50 K/sec/node | Practically unlimited (managed) |
| Latency | Low (1–10 ms) | Very low (< 1 ms) | 10–100 ms |
| Ordering | Per partition | Per queue | FIFO queue (lower throughput) |
| Delivery | At-least-once (or EOS w/ txns) | At-least-once | At-least-once |
| Retention | Configurable (days/weeks) | Until consumed (RabbitMQ *Streams*, 3.9+, add a replayable log) | 4 days default, 14 days max |
| Best for | Event streaming, replay, analytics | Complex routing, RPC | Simple decoupling, no ops |

</details>

---

# PART 11: STORAGE SYSTEMS

## 11.1 Block vs File vs Object storage

![Infographic comparing storage types and analytics stores: Block (raw blocks, AWS EBS, low latency, not shared; DB volumes, VMs), File (hierarchy, NFS/EFS, POSIX, lockable; shared code, legacy apps), Object (key -> blob + metadata, S3/GCS/Azure Blob, cheapest, infinite scale, default for new systems, S3 11 nines durability); distributed file systems HDFS (128 MB+ blocks, write-once), Ceph/GlusterFS, Colossus; Lake vs Warehouse vs Lakehouse table (schema on read / on write / on write on cheap storage; object store / proprietary columnar / object store + open formats; examples S3 + Parquet, Snowflake/BigQuery/Redshift, Databricks/Iceberg/Delta); pick-by-need table and common mix-ups.](diagrams/sd24_info_storage_types_lakes_ai.png)

<details>
<summary><strong>Read as text</strong> — block, file and object storage and the default for new systems</summary>

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

**Default for new systems:** object storage. Cheap, durable (S3 is designed for 11 nines — 99.999999999 % — of durability), and accessible from anywhere.

</details>

## 11.2 Distributed file systems

<details>
<summary><strong>Read as text</strong> — HDFS, Ceph and Colossus</summary>

- **HDFS** — the Hadoop FS; large blocks (128MB+), write-once, optimised for sequential reads. Foundation of many data lakes.
- **Ceph / GlusterFS** — POSIX-compatible distributed FS.
- **Google Colossus** — successor to GFS; underpins Bigtable, Spanner.

</details>

## 11.3 Data lake vs Data warehouse vs Lakehouse

<details>
<summary><strong>Read as text</strong> — lake vs warehouse vs lakehouse side by side</summary>

| | **Lake** | **Warehouse** | **Lakehouse** |
|---|---|---|---|
| Schema | On read | On write | On write but on cheap storage |
| Storage | Object store, cheap | Proprietary columnar | Object store + open formats |
| Workloads | ML, exploration, raw events | BI, SQL dashboards | Both |
| Examples | S3 + Parquet | Snowflake, BigQuery, Redshift | Databricks, Iceberg, Delta |

</details>

## 11.4 Hot vs Warm vs Cold storage

![Concept infographic 'Storage in Practice: Tiers, S3 & Bigtable': a HOT / WARM / COLD ladder (SSD / Redis µs–ms $$$$; HDD / S3 Standard-IA ms $$; S3 Glacier Flexible / Deep Archive minutes–12 h+ $) with a lifecycle arrow 30 days → Standard-IA, 90 days → Glacier and an Intelligent-Tiering note; an S3 consistency panel (eventual for LIST / overwrite before Dec 2020, strong read-after-write for GET, PUT, LIST since then so 'PUT then LIST' needs no sleep loop, 2024 conditional writes If-None-Match = create only if absent and If-Match = compare-and-swap, bucket-configuration changes still eventual); a Bigtable layout panel (row key → column family:column → cell (value, timestamp), user42 / profile:name holding versions Alicia t2 over Alice t1, sorted / sparse / versioned, row key userId#reverseTimestamp for newest activity first); a key-numbers table, when to use / when not, and a trap about bucket-configuration changes.](diagrams/sd24_info_tiers_s3_bigtable_ai.png)

<details>
<summary><strong>Read as text</strong> — hot, warm and cold tiers and lifecycle rules</summary>

```
   HOT       SSD / Redis                          µs–ms latency     $$$$
   WARM      HDD / S3 Standard-IA                 ms latency        $$
   COLD      S3 Glacier Flexible / Deep Archive   minutes–12 h+     $   (compliance/backups)
```

Lifecycle rules move objects between tiers on a schedule (e.g. to Standard-IA after 30 days, to Glacier after 90); S3 Intelligent-Tiering instead moves each object automatically based on its observed access.

</details>

## 11.5 Cloud object storage consistency (S3 in 2020+)

<details>
<summary><strong>Read as text</strong> — strong read-after-write consistency since 2020</summary>

For years, S3 was famously *eventually* consistent for list/overwrite. Since December 2020, **S3 offers strong read-after-write consistency** for object GET, PUT and LIST (and tag / ACL / metadata changes); only bucket-configuration changes remain eventually consistent. This is important because it changes design patterns: you can safely "write then list" in workflows without sleep loops. Since 2024 S3 also supports **conditional writes** (`If-None-Match`, `If-Match`), so "create only if absent" and compare-and-swap on an object no longer need an external lock.

GCS and Azure Blob have been strongly consistent for years; designs targeting multiple clouds should not assume the loosest model.

</details>

## 11.6 Wide-column storage layouts — Bigtable & friends

<details>
<summary><strong>Read as text</strong> — sorted, sparse, versioned rows and row-key design</summary>

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

</details>

---

# PART 12: DATA PROCESSING

## 12.1 Batch vs Stream

![Comparison infographic 'Batch vs Stream, MapReduce, Lambda vs Kappa, ETL vs ELT': BATCH (a truck of crates — big chunks every N hours, minutes–hours latency, high throughput, Spark / MapReduce scheduled by Airflow) beside STREAM (a conveyor belt — events processed as they arrive, ms–seconds latency, throughput depends on partitioning, Flink / Kafka Streams / Spark Structured Streaming); a MapReduce word-count flow "the cat sat" → MAP (the,1) (cat,1) (sat,1) → SHUFFLE + SORT → REDUCE (the, \[1,1,1,…\]) → (the, 47); LAMBDA (events → batch layer (Hadoop) + speed layer (Storm) → serving layer, two code paths) next to KAPPA (events → stream layer (Flink) → serving with a 'replay the log (Kafka)' loop, one codebase but slow full replays); ETL vs ELT arrow orders (Teradata vs dbt + Snowflake / BigQuery, the modern default); an 'If you need … → use …' table, three myth-vs-fact mix-ups and a trap about Lambda's two code paths.](diagrams/sd24_info_batch_stream_architectures_ai.png)

<details>
<summary><strong>Read as text</strong> — big periodic chunks vs events as they arrive</summary>

```
   BATCH                                 STREAM
   ───────────────────────               ─────────────────────────
   Big chunks every N hours              Events processed as they arrive
   High latency (minutes-hours)          Low latency (ms-seconds)
   High throughput                       Throughput depends on partitioning
   Simpler reasoning                     Windowing & late events get tricky
   Spark, MapReduce (Airflow             Flink, Kafka Streams, Spark
   schedules the jobs)                   Structured Streaming
```

</details>

## 12.2 MapReduce — the idea, even if you never use it directly

<details>
<summary><strong>Read as text</strong> — map, shuffle and reduce on a word count</summary>

```
   Input → [ MAP ] → key,value pairs → [ SHUFFLE+SORT ] → [ REDUCE ] → output

   Word count over a whole corpus:
     Map:     each line, e.g. "the cat sat" → (the,1) (cat,1) (sat,1)
     Shuffle: collect every pair with the same key on one reducer
     Reduce:  (the, [1,1,1,…]) → (the, 47)   ← "the" appeared 47 times in total
```

Conceptual ancestor of Hadoop, Spark, and Google's FlumeJava → Cloud Dataflow / Apache Beam.

</details>

## 12.3 Lambda vs Kappa architecture

<details>
<summary><strong>Read as text</strong> — two code paths vs one replayable stream</summary>

```
   LAMBDA  — two paths, batch + speed, results merged
       events ──┬─▶ batch layer (Hadoop) ──┐
                │                          ├─▶ serving layer
                └─▶ speed layer (Storm) ───┘
       Pro: handles late data via batch reprocess.
       Con: maintain two code paths.

   KAPPA   — one streaming pipeline; reprocess by replaying the log
       events ──▶ stream layer (Flink) ──▶ serving
       Pro: one codebase.
       Con: needs a durable replayable log (Kafka), and a full replay
            of months of history can take a long time.
```

Most modern systems are Kappa-ish.

</details>

## 12.4 ETL vs ELT

<details>
<summary><strong>Read as text</strong> — transform before loading vs inside the warehouse</summary>

- **ETL** (Extract-Transform-Load): transform *before* loading into the warehouse. Classic for expensive warehouses (Teradata).
- **ELT** (Extract-Load-Transform): load raw, transform inside the warehouse (dbt + Snowflake/BigQuery). The modern default.

</details>

## 12.5 Stream-processing concepts

![Concept infographic 'Stream Processing: Windows, Watermarks & Exactly-Once': tumbling (non-overlapping 5 min blocks), sliding (5-min windows starting every minute, so each event lands in 5 windows) and session (events split by an inactivity gap) timelines crossed by a 'watermark T' line, with a late event forking to 'within allowed lateness: updates its window' or 'after that: side output'; a Flink job graph Kafka source → map → window → sink carrying 'barrier n', operators snapshotting state (RocksDB) to S3 / HDFS, the three checkpoint steps (inject barrier, align on ALL inputs then snapshot and forward, all ack → checkpoint n complete) and a failure arrow back to the source 'restore last checkpoint + rewind Kafka offsets'; a pitfalls table (skewed partitions, unbounded state, aggressive watermark, processing time for billing, rare checkpoints) with fixes, when to use / when not, and a trap that checkpoints give exactly-once state only unless the sink is transactional or idempotent.](diagrams/sd24_info_stream_processing_ai.png)

<details>
<summary><strong>Read as text</strong> — event time, windows, watermarks and state</summary>

- **Event time vs Processing time** — when it happened vs when you saw it.
- **Windows** — tumbling (fixed, non-overlapping), sliding (overlapping), session (group-by-gap).
- **Watermarks** — a watermark at time T declares "no more events with event time ≤ T are expected", so windows ending before T can fire; anything older that still arrives is *late*.
- **Stateful operators** — joins, aggregations need to remember state (RocksDB inside Flink).

</details>

## 12.6 Exactly-once stream processing (Flink)

<details>
<summary><strong>Read as text</strong> — barrier snapshots and transactional sinks</summary>

Flink achieves exactly-once via **distributed snapshots** — *asynchronous barrier snapshotting* (Carbone et al., 2015), a variant of the Chandy-Lamport algorithm (1985):

```
   JobManager's checkpoint coordinator tells the sources to inject
   a "barrier" (checkpoint n) into the stream
        │
        ▼
   Each operator, once the barrier has arrived on ALL its inputs
   ("alignment" — records after the barrier wait meanwhile):
     1. Snapshots its state (e.g. RocksDB) to durable storage (S3 / HDFS)
     2. Forwards the barrier downstream
        │
        ▼
   When all operators ack the barrier ⇒ checkpoint n complete
   On failure: restore every operator from the last completed checkpoint,
   rewind the Kafka source to the offsets stored in it, and continue.
   Result = exactly-once *state*.
```

Combined with idempotent or transactional sinks (Flink's Kafka sink commits a Kafka transaction per checkpoint), this gives end-to-end exactly-once for stream pipelines.

</details>

## 12.7 Windowing in stream processing

<details>
<summary><strong>Read as text</strong> — tumbling, sliding and session windows with watermarks</summary>

```
   TUMBLING   |─5min─|─5min─|─5min─|         non-overlapping fixed windows
   SLIDING    |─5min─|                       5-min windows starting every minute:
                |─5min─|                     overlapping, so each event lands
                  |─5min─|                   in 5 windows
   SESSION    |──events──|  gap   |─events─|  bounded by inactivity gap
```

Pair with **watermarks** — a heuristic saying "no events older than T will arrive." Late events can still update a window within an *allowed lateness*; after that they go to a side output (or are dropped).

</details>

## 12.8 Common stream-processing pitfalls

<details>
<summary><strong>Read as text</strong> — skew, unbounded state, late data and rare checkpoints</summary>

- **Skewed partitions** — one key (e.g., a celebrity's events) overwhelms one task. Pre-aggregate or two-stage shuffle.
- **State unbounded growth** — sessions never close, RocksDB fills disks. Use TTL state.
- **Watermark too aggressive** — late events silently dropped. Always emit a side output for late data.
- **Time-travel bugs** — using `processing time` for billing/audit (use event time always).
- **Checkpointing too rarely** — recovery replays hours of events. Tune interval to your tolerance.

</details>

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
  • Escape ladder: vertical (+ indexes) → replicas → cache →
    federate → shard → multi-region.
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
  • Quorum: W + R > N so every read overlaps the latest write.
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

> **Continued in [Chapter 25 — System Design — Part 3: Operations & Case Studies](#content/25_system_design_operations_case_studies).** Part 3 picks up at §13.1 and covers reliability and chaos engineering, security (AuthN/AuthZ, OAuth/OIDC, JWT, crypto, OWASP, mTLS, STRIDE), observability (logs/metrics/traces, SLI/SLO, OpenTelemetry, golden signals), deployment (containers, K8s, GitOps, progressive delivery), search and supporting building blocks, multi‑region architecture, FinOps, the anti‑patterns to spot in design discussions, and a full Instagram worked example.
>
> **Coming from Part 1?** Return to [Chapter 23 — Foundations & Protocols](#content/23_system_design_fundamentals_deep_dive) for the network/edge stack referenced throughout this chapter.
