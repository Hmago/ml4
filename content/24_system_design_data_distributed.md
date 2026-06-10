# Chapter 24 — System Design — Part 2: Data & Distributed Systems

> "Show me your flowcharts and conceal your tables, and I shall continue to be mystified. Show me your tables, and I won't usually need your flowcharts; they'll be obvious." — Fred Brooks, *The Mythical Man‑Month*

**What this chapter is about — in one line:** how to *store* data, and how to make many computers work together without losing or messing up that data.

We'll cover six big areas:
- **Databases** — how to store data and ask questions about it.
- **Scaling databases** — what to do when one computer isn't enough.
- **Distributed-systems ideas** — the rules for getting many computers to agree.
- **Messaging & streaming** — passing data between programs like a conveyor belt.
- **Storage systems** — where big files, photos, and videos live.
- **Data processing** — crunching huge piles of data, all at once or as it arrives.

This is **Part 2** of a three-part System Design series. If words like HTTP, TCP, or load balancer are new to you, read **[Chapter 23 — Foundations & Protocols](23_system_design_fundamentals_deep_dive.md)** first. **[Chapter 25 — Operations & Case Studies](25_system_design_operations_case_studies.md)** comes after this one.

Most topics follow the same simple shape: a **plain-words idea** first ("think of it like…"), then how it really works, then when to use it. Section numbers (like §9.2) are shared across Chapters 23–25, so "Ch 23, §3.21" just means "Chapter 23, section 3.21."

---

## Table of Contents

| Part | Topic | What you'll learn |
|------|-------|-------------------|
| 7 | Databases | The two main kinds (SQL & NoSQL), how they keep data safe, and how to make them fast |
| 8 | Scaling databases | What to do when one database computer isn't enough |
| 9 | Distributed-systems ideas | The rules for getting many computers to agree (CAP, quorums, Raft, and more) |
| 10 | Messaging & streaming | Moving data between programs with queues and Kafka |
| 11 | Storage systems | Where big files live: object storage, data lakes, and warehouses |
| 12 | Data processing | Crunching huge data, in big batches or live as it streams in |

---

# PART 7: DATABASES

> **The goal of this part:** help you pick the right database, write queries that behave the way you expect, and understand what really happens between "save" and the data landing on disk. Everything later in this chapter builds on these ideas.

## 7.1 SQL vs NoSQL — two ways to store data

> **Think of it like this:** SQL is a **filing cabinet** where every folder must look the same. NoSQL is a **box of sticky notes** — every note can be different. The cabinet is tidy and safe; the sticky notes are faster and bendier, but messier.

Both store your app's data — they just make different trade-offs.

| | **SQL (relational)** | **NoSQL** |
|---|---|---|
| Shape of data | Fixed — you pick the columns up front | Flexible — each record can differ |
| Asking for data | SQL: powerful questions, joins across tables | A simpler per-database API; joins discouraged |
| Safety for money-like changes | Strong (ACID — see §7.3) | Often one record at a time |
| Growing to many machines | Hard | Built for it |
| Default freshness | Always up to date | "Catches up" after a moment |
| Best for | Money, orders, anything with clear relationships | Huge scale, messy data, tons of writes |
| Examples | PostgreSQL, MySQL, Oracle, Spanner | MongoDB, Cassandra, DynamoDB, Redis |

**The honest truth in 2026:** the line is blurry now. Postgres (a SQL database) can also store JSON, search text, and hold AI "vectors." Some SQL databases (CockroachDB, Spanner) spread across many machines. Some NoSQL ones (DynamoDB) added safe multi-step changes. **So don't pick by the label — pick by how you'll actually use the data.**

**Bad reasons to pick NoSQL:**
- *"We need flexibility."* Usually means you haven't planned your data yet. Twenty optional fields in one document is messier than three tidy tables.
- *"Joins don't scale."* One healthy Postgres box handles way more than most apps ever need.
- *"We'll add safety later."* You won't — and the bugs get expensive.

**NewSQL — the best-of-both option:** databases like **Spanner, CockroachDB, YugabyteDB, TiDB** speak SQL *and* spread across many machines safely. Writes are a little slower, but you get huge scale with real safety. Use them when you'll outgrow one machine *and* you need money-grade correctness.

## 7.2 The NoSQL family tree — pick by how you'll read the data

> **Think of it like this:** "NoSQL" isn't one thing. It's a family of tools, each shaped for one job — like having a screwdriver, a hammer, and a wrench instead of one "tool."

```
   KEY-VALUE        a giant dictionary: look up by one key, super fast
     Redis, DynamoDB, Memcached     → sessions, caches, simple lookups

   DOCUMENT         stores whole JSON "documents" you can search
     MongoDB, Firestore, Couchbase  → user profiles, content

   COLUMN-FAMILY    rows with lots of optional columns, great for writes
     Cassandra, Bigtable, HBase     → time-series, write-heavy data

   GRAPH            stores things and the links between them
     Neo4j, Neptune, DGraph         → social networks, fraud rings

   TIME-SERIES      data stamped with a time
     InfluxDB, TimescaleDB, Druid   → metrics, sensors, monitoring

   SEARCH           finds text fast, even with typos
     Elasticsearch, OpenSearch      → search boxes, log search

   VECTOR           finds "things that mean something similar"
     pgvector, Qdrant, Pinecone     → AI search, recommendations

   OLAP COLUMN STORE   crunches huge numbers fast
     BigQuery, Snowflake, ClickHouse → analytics, dashboards
```

**How to choose, in one line each:**
- **Key-value** — you only ever look things up by one key, and need it crazy-fast.
- **Document** — your natural unit is one self-contained thing (a profile, an order).
- **Column-family** — tons of writes, and you know your queries ahead of time.
- **Graph** — your main question is "who's connected to whom, a few hops away?"
- **Time-series** — data arrives stamped with a time, and you ask about time ranges.
- **Search** — you need text matching, typo-tolerance, and filters.
- **Vector** — you need "find similar" in AI-embedding space.
- **OLAP column store** — you add up billions of rows with `GROUP BY`.

## 7.3 ACID — the four promises a database makes

> **Think of a careful bank teller** who follows four rules so money is never lost or duplicated. Those rules spell **ACID**.

A "transaction" is a set of changes that should happen together — like moving $10 from you to a friend. ACID promises:

- **A — Atomic:** all-or-nothing. Both halves happen, or neither does. You never lose $10 with no one getting it.
- **C — Consistent:** the database always ends up in a *legal* state — it never breaks your rules (like "balance can't go negative"). (This is about *your* rules, not about copies being up to date — a common mix-up.)
- **I — Isolated:** when many transactions run at once, each acts as if it were alone. They don't trip over each other.
- **D — Durable:** once it says "done," it's saved for good — even if the power dies a second later.

### Isolation levels — how careful do you want to be?

Stronger = safer but slower:

```
   Read Committed   → you only see finished work (Postgres starts here)
   Repeatable Read  → asking the same question twice gives the same answer
   Serializable     → as if everyone took turns, one at a time (safest, slowest)
```

The weaker levels let sneaky bugs in. The famous ones:

| Bug | What goes wrong | Fixed by |
|-----|-----------------|----------|
| **Dirty read** | You read someone's unsaved change | Read Committed or stronger |
| **Non-repeatable read** | The same row gives two answers in one transaction | Repeatable Read or stronger |
| **Phantom read** | New rows appear when you re-run a search | Serializable |
| **Lost update** | Two people edit at once; one edit vanishes | A row lock, or Serializable |
| **Write skew** | Two changes are each "fine" alone but break a rule together | Serializable |

> **The classic "write skew" story:** two doctors are both on call. Each checks "is another doctor on call?", sees the other, and clicks "I'm leaving." Now *nobody* is on call. Each click looked fine alone — together they broke the rule. Only **Serializable** catches this.

**Snapshot Isolation (SI)** gives each transaction a frozen photo of the data from when it started. It blocks most bugs but still allows write skew. **Serializable Snapshot Isolation (SSI)** (Postgres's `SERIALIZABLE`) also catches write skew, but may ask you to retry.

### What changes across many machines?

The four promises get harder and slower when data is spread out:
- **Atomic** across machines needs extra coordination (§7.9, §9.11).
- **Durable** now means "saved on several machines," not just one disk.
- **Isolated** worldwide is expensive, because far-apart machines must wait for each other. Google's Spanner pulls it off using super-accurate clocks (§8.15).

## 7.4 BASE — NoSQL's relaxed promise

> **Think of it like this:** ACID is a strict referee. BASE is a chill one — it keeps the game moving, and trusts everyone to end up in agreement soon.

BASE is the opposite trade from ACID, made to grow across many machines:
- **Basically Available** — it always gives an answer, even if slightly old.
- **Soft state** — data can keep settling in the background.
- **Eventual consistency** — give it a moment with no new writes, and all copies agree.

**BASE doesn't mean "anything goes."** A good BASE system still promises things like "you'll never see a saved write disappear" and "data is at most a few seconds behind."

## 7.5 Indexing — the difference between 1 millisecond and 10 seconds

> **Think of it like this:** an index is the **index at the back of a book**. Instead of reading every page to find "photosynthesis," you look it up and jump straight there. Databases do the same.

```
   Without an index:                 With an index on user_id:
   check every single row            jump almost straight to the row
   slow on big tables                fast even on huge tables
```

### Common kinds of index

| Kind | Best for | Used by |
|------|----------|---------|
| **B-tree / B+tree** | Ranges, equals, sorting | Almost every SQL database |
| **Hash** | Exact matches only | Postgres hash, Redis |
| **Inverted index** | Searching text | Elasticsearch, Lucene |
| **LSM-tree** | Lots of writes | Cassandra, RocksDB |
| **Bitmap** | Columns with few values (yes/no) | Oracle, ClickHouse |
| **BRIN** | Huge, time-ordered tables | Postgres |
| **R-tree / Geohash** | Maps and "near me" | PostGIS, Redis GEO |
| **HNSW / IVF** | AI "find similar" | pgvector, Qdrant, Pinecone |

**B-tree vs B+tree:** in a B+tree the actual data sits in the bottom row of leaves, and those leaves are linked in a chain. That chain makes "give me everything between 100 and 200" a quick walk. Almost every SQL database uses B+trees.

**Clustered vs secondary index:**
- **Clustered** — the table's rows are physically stored in this index's order. You get one per table (usually the primary key).
- **Secondary** — a separate index that points back to the row.

**The "leftmost prefix" rule** (important!): an index on `(user_id, created_at)` helps when you filter by `user_id` first. It does *not* help a query that only filters by `created_at` — you have to use the columns left-to-right.

```
   INDEX (user_id, created_at)
   helps:    WHERE user_id = ?                     ✔
             WHERE user_id = ? AND created_at > ?  ✔
   doesn't:  WHERE created_at > ?                  no (skipped user_id)
```

**Covering index** — if the index already holds every column the query needs, the database answers from the index alone and never touches the table:

```sql
-- An index that also carries status and total:
CREATE INDEX idx ON orders (user_id) INCLUDE (status, total);
SELECT status, total FROM orders WHERE user_id = 42;  -- answered from the index
```

**Handy extras:** a **partial index** only covers some rows (e.g. `WHERE deleted_at IS NULL`). A **functional index** indexes a computed value (e.g. `lower(email)` for case-insensitive lookups).

**The costs:** every index makes writes a bit slower (the database must keep it updated), and unused indexes are pure waste — find and drop them.

## 7.6 Normalization vs Denormalization

> **Think of it like this:** **normalized** means store each fact in exactly one place (no copies). **Denormalized** means keep handy copies so reads are faster — but now you have to update every copy.

```
   NORMALIZED                      DENORMALIZED
   users(id, name)                 orders(id, user_id, user_name, …)
   orders(id, user_id)             ↑ the user's name is copied into every order
   no copies, tidy                 faster reads, but updates are a pain
```

**The normal forms, super short:**
- **1NF** — one value per cell (no comma-lists).
- **2NF** — every column depends on the *whole* key.
- **3NF** — columns don't depend on other non-key columns.

Apps that handle money (banking, shopping) lean **normalized**. Analytics systems lean **denormalized** for speed.

**Star schema** (used in analytics): one big **fact table** in the middle (sales, events) linked to small **dimension tables** (user, product, date). It's shaped for fast `GROUP BY` totals.

```
        dim_user      dim_product     dim_date
             \            |            /
              \           |           /
                     fact_sales   ← the numbers you add up
```

## 7.7 Reading what the database is doing (EXPLAIN)

> **Think of it like this:** `EXPLAIN` is the database showing its homework — the step-by-step plan it'll use to answer your query. Reading it lets you spot the slow step.

```
   Your SQL → Parser → Planner → Executor → results
                          │
                          └─ the Planner guesses the cheapest plan,
                             using rough counts of how many rows match
```

Common steps you'll see in a plan, and whether to worry:

| Step | What it does | Worry? |
|------|--------------|--------|
| **Seq Scan** | Reads every row | Fine on tiny tables; bad on big ones |
| **Index Scan** | Uses an index, then fetches rows | Healthy |
| **Index-Only Scan** | Answers from the index alone | Best case |
| **Nested Loop** | For each row on one side, look up the other | Great for small inputs, awful for huge ones |
| **Hash Join** | Builds a lookup table to match rows | Good for medium joins; needs memory |
| **Sort** | Puts rows in order | Slow if it spills to disk |

**The #1 cause of bad plans: stale stats.** The planner guesses how many rows match. If those guesses are old, it picks a bad plan. Symptom: the plan says "about 1 row" but actually returns a million. Fix: run `ANALYZE` to refresh the stats.

```
   Seq Scan on orders  (… rows=1 …)  (actual … rows=42000 …)
   It guessed 1 row but got 42,000 → stale stats → run ANALYZE.
```

## 7.8 How disk reads really work (the buffer pool)

> **Think of it like this:** the database keeps its most-used pages in a fast "desk" (memory) so it rarely has to walk to the slow "warehouse" (disk).

Databases don't read one row at a time — they read fixed-size **pages** (about 8 KB). Pages live in three places, fastest first:

```
   Your query → Buffer pool (memory)  → hit? done.
                     ↓ miss
                 OS cache (memory)     → hit? load it up.
                     ↓ miss
                 Disk (SSD)            → slowest; go fetch it.
```

The buffer pool is the database's own memory cache. You want most reads to hit it — over **99%** for busy apps. A low hit rate means the cache is too small or your queries read too much.

**Why writes feel safe *and* fast:** when you commit, the database first appends a tiny note to a **log** and forces it to disk (`fsync`). The big page updates happen a little later, in the background. (More on this log in §7.11.)

## 7.9 Transactions across services — the Saga pattern

> **Think of it like this:** placing an online order touches several services (inventory, payment, shipping). A **saga** is a checklist where every step has an "undo" — if a later step fails, you undo the earlier ones.

```
   Place-order saga:
     1. reserve item    ←─ undo: release item
     2. charge card     ←─ undo: refund
     3. book shipping   ←─ undo: cancel shipping
   If step 3 fails, run the undos for 2 and 1, in reverse.
```

**Two ways to run a saga:**
- **Choreography** — each service reacts to the others' events. No boss. Simple, but hard to follow "who did what?"
- **Orchestration** — one "conductor" (like Temporal or AWS Step Functions) calls each step in order. Easier to see and retry, but the conductor is one more thing to run.

**Two rules:** every "undo" must be safe to run twice (you'll retry them), and some things can't truly be undone (you can't un-send an email) — so wait until you're sure, or send a follow-up "oops" message.

## 7.10 The N+1 query problem

> **Think of it like this:** instead of asking the kitchen for "10 meals" once, you ask 10 separate times. Each trip is slow, and the trips add up.

```
   Bad:  get the orders (1 query)
         then, for EACH order, get its user (N more queries)  → 1 + N queries

   Good: get the orders AND their users together (1 query)
```

This sneaks in whenever you use an ORM (a tool that turns objects into SQL). Three fixes:
1. **JOIN** the related data in one query.
2. **Batch** — collect the IDs and fetch them all with one `WHERE id IN (…)`.
3. **DataLoader** — gather all the little lookups in a request and run them as one batch (common in GraphQL).

## 7.11 MVCC and the Write-Ahead Log (WAL)

> **Think of it like this (MVCC):** instead of erasing the old value when you edit, the database keeps the old *version* too. Readers keep seeing their version; writers make a new one. So readers and writers never block each other.

```
   row #5:  (version from txn 100) name = "Alice"
            (version from txn 110) name = "Alicia"   ← newer readers see this
```

Old versions pile up as "dead" rows. A background cleaner called **VACUUM** (in Postgres) sweeps them away. Skip it and the table bloats and slows down.

> **Think of it like this (WAL):** before changing the real pages, the database scribbles the change into a notebook (the **log**) and saves *that* first. The log is quick to write, and it's how the database recovers after a crash.

```
   COMMIT → append to the log → force log to disk → say "done"
                                                       ↓ later, in the background
                                                  update the real pages
```

Two wins: **safety** (after a crash, replay the log) and **speed** (adding to a log is much faster than poking pages all over the disk). This same "write it down first" trick powers Kafka, Oracle, and more — **append-only logs are everywhere**.

## 7.12 LSM-trees (Cassandra, RocksDB)

> **Think of it like this:** instead of editing the big sorted book every time (slow), you jot new entries on a fast notepad, and now and then merge the notepad into the book.

```
   write → memtable (fast notepad in memory) + log
              ↓ notepad full
           flush to an SSTable (a sorted file on disk)
              ↓ now and then
           "compaction": merge many SSTables into fewer, tidy ones
```

| | LSM-tree (Cassandra) | B-tree (Postgres) |
|---|---|---|
| Writes | Very fast (just append) | Slower (edit in place) |
| Reads | Might check several files | One quick path down the tree |
| Best for | Write-heavy data, time-series | Read-heavy, everyday apps |

**Deletes** don't erase right away — they drop a "tombstone" marker, and the real removal happens during compaction. To keep reads fast, each file carries a **Bloom filter** so the database can skip files that definitely don't have your key (§9.16).

## 7.13 Locking — optimistic vs pessimistic

> **Think of it like this:** **pessimistic** = grab the only pen so no one else can write until you're done. **Optimistic** = everyone writes freely, but you check at the end whether someone else changed it first.

```
   PESSIMISTIC                         OPTIMISTIC
   lock the row, do the work,          read the row + its version number,
   then unlock                         then update only if the version
   (others wait)                       hasn't changed; if it did, retry
```

Use **optimistic** when clashes are rare (most apps). Use **pessimistic** for hot, fought-over rows like an inventory counter or a money transfer.

**Deadlock** — two transactions each hold what the other wants, so both freeze:

```
   T1 holds A, wants B
   T2 holds B, wants A   → stuck!
```

The database notices and kills one so the other can finish; your app should catch that and retry. Avoid it by always locking things in the same order and keeping transactions short.

## 7.14 The life of a query (the one diagram to remember)

> **Think of it like this:** every query takes the same little journey through the database.

```
   SQL text
     → Parse   (understand the words)
     → Plan    (pick the cheapest strategy)
     → Execute (walk indexes, fetch pages from the buffer pool)
     → Commit  (write the log, force to disk, say "done")
```

Knowing this path is how you reason about *why* a query is slow — missing index? bad plan? cold cache? — and where to look.

## 7.15 Sizing a connection pool

> **Think of it like this:** a connection pool is a small set of phone lines to the database that your app shares. More lines isn't better — too many just jams the switchboard.

A simple starting point: roughly `(CPU cores × 2)`, or use **Little's Law**: `pool size ≈ requests-per-second × seconds-per-query`. Most apps are happy with **10–50** connections per app instance, not thousands.

When hundreds of app copies each hold many connections, you run out. The fix is a **shared external pooler** (PgBouncer / ProxySQL) between app and database — its modes and the "everyone reconnects at once" storm are covered in §8.4.

## 7.16 Changing the schema without downtime (expand–contract)

> **Think of it like this:** to rename a column on a busy live app, you don't swap it in one risky move. You add the new one, copy data over, switch, then remove the old one — like changing a tire while the car rolls slowly.

```
   Goal: rename "email" → "email_address"
   1. EXPAND    add the new column; app writes BOTH
   2. BACKFILL  copy old → new in small batches
   3. SWITCH    app reads the new column
   4. CONTRACT  drop the old column
```

Each step is safe on its own and easy to undo.

**Some changes are safe, some lock the whole table** (an outage on a big table):

| Change | Safe on a live, busy table? |
|--------|------------------------------|
| Add a nullable column | ✔ instant |
| `CREATE INDEX CONCURRENTLY` | ✔ no table lock |
| Plain `CREATE INDEX` | ✗ locks the table while it builds |
| Change a column's type | usually ✗ rewrites the whole table |

For MySQL, tools like **gh-ost** make these changes safely by copying into a shadow table in the background.

## 7.17 Soft delete, audit, and history

> **Think of it like this:** instead of shredding a record, you stamp it "deleted" — so you can undo, and keep a paper trail.

**Soft delete** — add a `deleted_at` column instead of really deleting:

```sql
-- "deleting" just sets a timestamp; queries skip deleted rows:
UPDATE users SET deleted_at = now() WHERE id = 42;
-- reads always add: WHERE deleted_at IS NULL
```

Upside: reversible and audit-friendly. Downside: every query must remember the filter (hide it behind a view), and a real "right to be forgotten" request still needs a true delete.

**Audit tables** keep a record of every change (who, when, before, after) for compliance. **Event sourcing** goes further: store *every change* as an event and rebuild the current state by replaying them — great for history and time-travel, but more work up front. It pairs nicely with CQRS (§8.8).

## 7.18 Materialized views — answers computed ahead of time

> **Think of it like this:** a normal **view** is a saved question — it re-runs every time. A **materialized view** is a saved *answer* — computed once and stored, so reads are instant.

```sql
-- Pre-compute daily sales totals and store them:
CREATE MATERIALIZED VIEW daily_sales AS
  SELECT date_trunc('day', created_at) AS day, sum(amount)
  FROM orders GROUP BY 1;

REFRESH MATERIALIZED VIEW daily_sales;  -- recompute when you want fresh numbers
```

You trade a little freshness for much faster reads. Great for dashboards, leaderboards, and reports. You refresh it on a schedule (or only the changed parts).

## 7.19 Special-purpose databases

> **Think of it like this:** when a regular SQL database isn't the right shape for the job, reach for a specialist.

- **Time-series** (TimescaleDB, InfluxDB, ClickHouse) — built for data stamped with a time; auto-splits by time and squeezes old data small.
- **Search** (Elasticsearch, OpenSearch) — finds text fast, even with typos, with ranking (see BM25 in Ch 25, §17.9). Don't use it as your main source of truth — it's a search helper.
- **Vector** (pgvector, Qdrant, Pinecone) — finds "things that mean something similar" for AI search and recommendations. It uses approximate-match indexes (HNSW, IVF) to stay fast over billions of items.
- **Graph** (Neo4j, Neptune) — best when your main question is "who's connected to whom, a few hops away" (fraud rings, social graphs).
- **OLAP / columnar** (BigQuery, Snowflake, ClickHouse) — stores data column-by-column, so adding up one column over a billion rows is lightning fast. Bad at single-row edits, though.

## 7.20 Backups and disaster recovery

> **Think of it like this:** a backup you've never tested restoring is just a *hope*, not a safety net.

**Kinds of backup:**

| Type | What it saves | How precisely you can restore |
|------|---------------|-------------------------------|
| **Logical** (`pg_dump`) | A re-runnable dump of the data | Per database or table |
| **Physical / snapshot** | A copy of the on-disk files | The whole instance |
| **Continuous (log archive)** | Every change since the last full backup | Any second in time |

**Point-in-Time Recovery (PITR)** = a full backup + the saved log, replayed up to an exact moment ("restore to 5 minutes ago, just before the bad delete").

Two numbers decide your setup:
- **RPO** — how much recent data you can afford to lose (0? one minute?).
- **RTO** — how long you can be down while restoring (minutes? hours?).

**The rules of good backups:** keep **3 copies, on 2 kinds of media, 1 off-site (3-2-1)**, and actually **practice restoring** them on a schedule.

## 7.21 Database security basics

> **Think of it like this:** lock the doors, encrypt the valuables, and give each worker only the keys they need.

- **Encrypt at rest** — so a stolen disk is useless.
- **Encrypt in transit** — so no one can snoop the app↔database connection. Don't assume "same network = safe."
- **Use identity-based login** (IAM/OIDC) instead of shared passwords where you can.
- **Row-Level Security** — let the database itself enforce "users only see their own rows," so one buggy query can't leak everyone's data.
- **Least privilege** — the app's account can read/write data but not `DROP TABLE`. Run migrations with a separate, more powerful account.
- **Keep the database private** — no public address; only the app can reach it.

## 7.22 Database habits to avoid

> **Think of it like this:** a few bad habits cause most database fires.

- **Long-running transactions** — they block cleanup and pile up locks. Keep them short.
- **`SELECT *` in hot code** — pulls data you don't need and breaks index-only scans.
- **No query time limit** — one runaway query can jam the whole database. Set a `statement_timeout`.
- **Schema changes at peak hours** — do them in quiet windows or with online tools.
- **Ignoring the slow-query log** — most of your wins hide in the top 10 slowest queries. Read it weekly.

---

# PART 8: DATABASE SCALING

> **The goal of this part:** Climb the scaling ladder one step at a time. Know the cost of every step. The biggest mistake at this layer is **skipping rungs** — going straight to sharding when a cache and a read replica would have bought you two more years.

## 8.1 The escape ladder

```
   Stage 1  one server                       ──▶ scale vertically
   Stage 2  add read replicas                ──▶ scale reads
   Stage 3  add a cache (Redis)              ──▶ offload hot reads
   Stage 4  partition by feature (federate)  ──▶ smaller DBs per service
   Stage 5  shard by key                     ──▶ scale writes
   Stage 6  multi-region, multi-master       ──▶ scale geography
```

**Climb only as high as you need.** Each step doubles how complicated things get. Most apps live happily forever at Stage 2 or 3.

## 8.2 Vertical scaling — what you can actually buy

Before you shard, see how far one box gets you. Modern hardware is *embarrassingly* capable:

| Resource | Today's sweet spot | Top of the menu |
|----------|--------------------|-----------------|
| vCPU | 32–64 cores | 192 cores (Graviton4, EPYC Bergamo) |
| RAM | 256–512 GB | 24 TB (SAP HANA boxes) |
| Local NVMe | 4–8 TB | 60 TB+ |
| Network | 25–50 Gbps | 200 Gbps |

**Think of vertical scaling like this:** Buy a bigger, faster computer instead of adding more computers. A well-tuned Postgres on a `m7i.16xlarge` machine (64 vCPU, 256 GB RAM, gp3 SSD) routinely handles **50–100 K transactions per second** for OLTP workloads. **Most "we need to shard" claims dissolve once someone fixes a missing index and bumps `shared_buffers`.**

### Where vertical scaling tops out

- Single-writer ceiling — only one process can commit to a partition.
- Memory copy fan-out — Postgres' MVCC visibility check costs per-core performance.
- Backup/restore time — a 10 TB box takes a long time to restore.
- Blast radius — a single instance failing is the *entire* DB going down.

When you hit any of these, climb to Stage 2.

## 8.3 Replication — copies for reads and survival

> **Think of it like this:** Replication is making copies of your data on multiple servers. This way, reads can scale out, and you survive when things fail.

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

**Think of async like texting:** You send your message and move on immediately. **Sync is like waiting for a reply:** You don't do anything else until you hear back. **Semi-sync is in-between:** You wait for at least one person to reply, then continue.

> **The trap:** "sync replication" between two availability zones adds ~1 ms to every commit. Across regions it's 30–100 ms — usually unacceptable for OLTP. Use sync within an AZ for high availability, async across regions for disaster recovery.

### Physical vs logical replication

- **Physical** — ship raw WAL bytes. Replica is a byte-for-byte copy. Fast and simple. But replicas can't accept writes and must run the same major version.
- **Logical** — decode WAL into row-level events and replay. You can pick specific tables, use different versions, even cross-DB. Foundation of CDC (§10.10), zero-downtime upgrades, and zero-downtime sharding.

**Think of physical replication like photocopying a book:** exact copy, page by page. **Logical replication is like re-typing the content:** you can pick chapters, change the format, translate to another language.

### Replication topology patterns

```
   Cascading replicas       Multi-source       Bidirectional (multi-master)
   ──────────────────       ────────────       ────────────────────────────
   P ─▶ R1 ─▶ R2 ─▶ R3      P1 ─▶ R                P1 ◀──▶ P2
                            P2 ─▶ R                conflict resolution
                            P3 ─▶ R                required
```

### Promotion, failover, and split-brain

> **Think of it like this:** The primary server is the boss. When the boss dies, you promote a backup to become the new boss. If the old boss comes back online before you tell everyone, you have two bosses giving different orders — **split-brain** — and you get diverging writes that won't reconcile cleanly.

Defences:

- **STONITH** ("Shoot The Other Node In The Head") — power-off or network-isolate the old primary before promoting a new one.
- **Fencing tokens** — every write carries a monotonically increasing token. The storage layer rejects writes with stale tokens (§9.12).
- **Quorum-based leader election** — etcd/ZooKeeper/Patroni/Stolon decide who is primary. Clients trust the registry.
- **Connection re-routing** — apps don't hardcode primary IP. They ask the registry or use a VIP.

**Think of fencing tokens like version numbers on documents:** if someone tries to save version 3 after version 5 is already saved, you reject it.

### Replica lag monitoring

```
   lag_bytes  = primary_LSN - replica_LSN          (Postgres)
   lag_seconds = age(now(), pg_last_xact_replay_timestamp())
```

Alert when lag > threshold *and* when the replica falls so far behind that WAL retention can't recover it. That forces a base backup re-clone.

## 8.4 Connection pooling at scale — the pgbouncer story

> **Think of it like this:** A typical Postgres box dies at **~500 active connections**. But you have 200 app pods × 30-connection pool = 6,000 connections — boom. The fix is a shared pooler between app and DB.

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

**Think of pooling like a bike-share:** In session mode, you rent a bike for the whole day. In transaction mode, you return it after each trip. In statement mode, you return it after riding one block.

### Real-world tooling

- **PgBouncer** — the classic, ultra-lightweight Postgres pooler.
- **Odyssey** (Yandex) — newer, multi-threaded, transaction mode at scale.
- **AWS RDS Proxy** — managed, IAM-integrated, transparent failover.
- **ProxySQL** — the MySQL equivalent. Also does query routing and mirroring.

### Connection storms

App restarts → all pods reconnect → DB CPU spikes on auth + plan caching. Mitigations: connection warming, staggered rolling deploys, pooler in front, `max_prepared_transactions=0` if you don't need 2PC.

## 8.5 Partitioning vs Sharding (often conflated)

> **Think of it like this:** Partitioning is splitting your data within one database. Sharding is putting those splits on different machines.

- **Partitioning** — splitting a table within one database. *Vertical* = move columns to separate tables. *Horizontal* = split rows by range or hash. **Same machine.**
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

**Think of range sharding like filing cabinets by last name:** A-F in cabinet 1, G-M in cabinet 2. Works great unless everyone's name starts with S. **Hash sharding is like randomly assigning people to rooms:** everyone spreads out evenly, but finding all people whose name starts with S requires checking every room.

### Sharding's hidden costs

- **No cross-shard joins** (or they're slow scatter-gather).
- **No global secondary indexes** without extra plumbing (Spanner does it; most DBs don't).
- **No global uniqueness** — UUIDs / Snowflake IDs only.
- **Re-sharding** when you outgrow N is painful — see consistent hashing (§9.9).
- **Distributed transactions** across shards require 2PC, sagas, or a NewSQL engine.
- **Schema migrations** must run per-shard, with backward-compatible deploys (§8.13).

## 8.6 Read replicas — quick wins and the gotchas

Add 1–N replicas. Route writes to primary, route reads to replicas. Best return-on-investment step on the ladder — *until* you hit replica lag bugs.

### Read-your-writes pitfall

```
   user POSTs new comment ──▶ PRIMARY  (commit)
   user GETs feed       ──▶ REPLICA  (still lagging — comment missing!)
```

> **Think of it like this:** You mail a letter to your friend (write to primary), then immediately call them to ask if they got it (read from replica). They say no because the mail truck is still on the way.

User refreshes, sees nothing, posts again → duplicate. The fixes — sticky window, session pinning, read-after-write LSN tokens, selective sync replication, optimistic UI — are enumerated in §8.8.

### Routing read traffic

- **Application-level** — code chooses primary vs replica per query. Explicit but invasive.
- **Proxy-level** — ProxySQL / RDS Proxy / Vitess routes based on parsed SQL (writes → primary).
- **DNS / load balancer split** — two connection strings, two pools.

## 8.7 Federation — split by feature, not by key

> **Think of it like this:** Instead of one giant database holding everything, give each team their own smaller database for their feature.

```
   user_db          orders_db         catalog_db
   (auth team)      (orders team)     (search team)
```

Smaller, owned by independent teams. Joins now happen in the app — accept it. Most microservice architectures end up here long before they reach sharding.

**Trap:** "every microservice has its own DB" sometimes degenerates into a **distributed monolith** where every endpoint calls 6 services. Don't federate boundaries that don't match your domain.

## 8.8 CQRS — separate read and write models

**Command Query Responsibility Segregation.** Writes go to one model (normalized, transactional). Reads come from a different model (denormalized, fast). The two are kept in sync via events.

> **Think of it like this:** You write your shopping list in a notebook (write model). But the grocery store has aisles organized differently (read model). Someone converts your list into aisle order so shopping is fast.

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

> **Think of it like this:** For read-heavy aggregations (counts, top-N, leaderboards), don't compute on read. Compute once, store the answer, and just look it up.

- **Materialized views** (§7.18) — DB-managed refresh.
- **Streaming aggregators** — Kafka Streams / Flink / Materialize update aggregates incrementally as events arrive.
- **App-maintained denormalised counters** — `INCR likes:post:42` in Redis on every like event; periodically reconciled with the source.

The cost is **eventual consistency** of the read model. The win is *constant-time* reads at any scale.

> **Think of it like a scoreboard at a basketball game:** Instead of counting up all the baskets every time someone asks the score, you update the scoreboard after each basket. Looking at the scoreboard is instant.

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

> **Think of it like moving to a new apartment while still living in the old one:** You start moving small things, then gradually more, all while still sleeping and eating at the old place. Only when everything is moved do you leave the old apartment.

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

> **Think of it like this:** Even with hash sharding, the world is uneven. One celebrity, one viral post, one Black-Friday SKU. Everyone hammers one key, and that shard melts.

```
   reads on key=42 ─▶ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ◀── shard 2 melts
                     ░               ░
                     ░   shard 0     ░  shard 1  ░  shard 3
```

### Mitigations

- **Cache the hot key** — a CDN edge / Redis layer in front. Even a 1-second TTL collapses 100 K RPS into 1 RPS at the DB.
- **Read replicas for the hot shard** — scale reads.
- **Salt the key** — split the hot row into `key#1`, `key#2`, … `key#N`. Writers pick at random. Readers fan-out. Used by Twitter for celebrity timelines.
- **Sequential-ID problem** — `now()`-prefixed keys make every write land on the newest shard. Use **hash-then-time** keys (UUIDv7 reverses this thoughtfully) or a leading random byte.
- **Adaptive routing** — load balancer detects hot shards and re-routes the next request to a replica.

**Think of salting like creating multiple registers at a store:** Instead of everyone waiting in line for register #1, you open registers #1, #2, and #3 all serving the same celebrity checkout.

## 8.12 Choosing a shard key — the decision that's hard to undo

Three properties of a good shard key:

1. **High cardinality** — millions of unique values, so load spreads.
2. **Even access pattern** — no single key should attract a hotspot.
3. **Co-locality** — values that need to be read together should land on the same shard (avoid cross-shard joins).

Bad shard keys: `status`, `country`, `created_date` (range scans turn into hotspots). Good: `user_id`, `tenant_id`, `hash(user_id) + bucket`.

> **You almost never get to change a shard key without a multi-month migration.** Spend a week deciding.

### A two-test checklist before committing

- **Skew test** — run last month's access log against the candidate key. Is any single shard > 2× the average?
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

> **Think of it like updating software on 64 computers:** You can't shut them all down at once. So you make the new version work with both old and new data formats. Then you update them in small batches. Once all are updated, you remove the old code.

### Per-shard rolling upgrades

- Always keep one replica per shard untouched, so you can fail back.
- Cap the number of in-flight migrations (resource pressure on the coordinator).
- Monitor replication lag *per shard*. A single slow shard can block the wave.

## 8.14 Distributed transactions without 2PC

- **Percolator** (Google, original BigTable transactions) — optimistic 2PC over Bigtable; powered the original web index.
- **Calvin** — pre-determine an order, then apply deterministically on all replicas (FaunaDB).
- **Sagas** (§7.9) — give up atomicity, embrace compensation.
- **Outbox + CDC** (§10.10) — local atomic write to DB + outbox table. CDC publishes to other systems eventually.
- **Spanner / CockroachDB** — TrueTime or hybrid logical clocks + Raft per range. SQL transactions across continents at the cost of commit latency.

For most production systems, **sagas + outbox** is the modern, scalable answer.

**Think of sagas like this:** Instead of locking everything across all systems (which is slow and risky), you do each step one at a time. If something fails, you undo the steps you already did (like a refund after a failed order).

## 8.15 Spanner & TrueTime — strong consistency at planetary scale

Google's Spanner (a "CP" system) is the canonical answer to "can we have ACID transactions across continents?"

```
   Magic ingredient: TrueTime
     • Atomic clocks + GPS in every datacenter
     • API returns TT.now() = [earliest, latest] with bounded uncertainty (~7 ms)
     • Transactions wait out the uncertainty window before committing
     • External consistency (linearizability) over the whole planet
```

> **Think of it like this:** Spanner uses atomic clocks and GPS in every datacenter to know the *exact* time within a few milliseconds. When committing a transaction, it waits out the uncertainty window so everyone agrees on the order of events globally.

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

**Think of active-passive like a main office and a backup office:** Only the main office can process orders. The backup just keeps a copy. **Active-active is like having two equal offices:** both can process orders, but they need rules for when they disagree. **Geo-partitioned is like regional franchises:** each region owns its own customers, so there's no conflict.

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

Each row has **one home**. Writes are always local. Cross-region reads are explicit and rare. Spanner, CockroachDB, and YugabyteDB all support this natively. Often the simplest answer to data sovereignty (Ch 25, §18.6).

> **Think of it like each country having its own database:** European users' data stays in Europe, US users' data stays in the US. Simple, fast, and meets legal requirements.

## 8.17 Polyglot persistence — the right DB for each job

> **Think of it like this:** Don't use one tool for everything. Use the right database for each job — like using a hammer for nails and a screwdriver for screws.

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

**Think of disaster recovery like insurance:** RPO = how much data you can afford to lose. RTO = how long until you're back up. You pay more for better insurance.

### The DR runbook elements no one prepares until it's too late

- **Connection string switch** — DNS update, runtime config flag, app restart? Pre-write the playbook.
- **App reconfiguration** — schema versions, region-local secrets, feature flags.
- **Verification** — what query proves the new primary is healthy?
- **Replica re-pointing** — old replicas now follow the new primary?
- **Communication** — who tells customers, SRE, support?
- **Failback** — how do you migrate back when the original region is healthy?

### Drills, not docs

A DR runbook you've never executed is fiction. Quarterly game-days with real failover (in staging at minimum, in prod ideally) are the only thing that turns the runbook into a muscle.

> **Think of it like a fire drill:** Reading the evacuation plan doesn't prepare you. Actually walking through it does.

---

# PART 9: DISTRIBUTED SYSTEMS THEORY

> **Why this part matters:** when many computers work together, they break in weird ways. Each weird failure has a name. Once you know the name — "split-brain," "clock skew," "hot key" — you can look up the fix smart people already found. This part teaches those names in plain words.

## 9.1 The 8 Fallacies of Distributed Computing

> **Think of it like this:** these are 8 lies we tell ourselves when computers talk over a network. Believe any one of them and you get bugs.

Back in 1994, Peter Deutsch listed the 8 false beliefs behind most distributed bugs:

1. The network is reliable. (It isn't — messages get lost.)
2. There's no delay. (There always is.)
3. Bandwidth is unlimited. (It isn't.)
4. The network is safe. (Assume someone's listening.)
5. The layout never changes. (Servers come and go.)
6. There's one person in charge. (There are many.)
7. Sending data is free. (It costs time and money.)
8. All machines are the same. (They aren't.)

If your code only works when one of these is true, stop and rethink.

## 9.2 CAP Theorem

> **Think of it like this:** when the network between your servers breaks, you must choose: stay *correct*, or stay *answering*. You can't fully do both.

CAP says a distributed database can fully promise only **two** of these three: **C**onsistency (everyone sees the same latest data), **A**vailability (every request gets an answer), and **P**artition tolerance (it keeps working when the network splits).

In real life the network *will* split sometimes. So the real choice is: when that happens, are you **CP** or **AP**?

```
                  The network splits in two
                            │
         ┌──────────────────┴──────────────────┐
         ▼                                      ▼
     CP system                              AP system
 (Spanner, HBase,                      (Cassandra, DynamoDB)
  MongoDB-majority)
 "I'd rather say 'come back later'    "I'll keep answering, even if
  than give a wrong answer."           the answer might be a bit old."
```

**The big myth:** "I'll pick CA" — correct *and* always answering, ignoring splits. That's not real. If your servers never split, you don't have a distributed system; you have one computer.

**Watch out:** CAP is *per request*, not per database. Cassandra is usually AP, but you can ask it to act CP for one important write. So "Cassandra is AP" is only half true.

## 9.3 PACELC — the more honest version

> **Think of it like this:** CAP only talks about the rare moment the network breaks. PACELC also covers normal days.

PACELC says: **if** there's a **P**artition, choose **A** or **C** (just like CAP). **E**lse (normal time), choose between **L**atency (speed) and **C**onsistency (freshness).

```
   Cassandra, DynamoDB → fast + available (gives up a little freshness)
   Spanner, normal SQL → always fresh (gives up a little speed)
```

Most of the time there's no split, so this "speed vs freshness" choice actually matters more day-to-day.

## 9.4 The Two Generals & Byzantine Generals problems

> **Think of it like this:** two friends try to plan a meetup by passing notes through an unreliable messenger. They can never be 100% sure the other got the note.

**Two Generals:** two army generals must attack at the same moment, but their messengers can be captured. It is **impossible** to be totally sure both agreed.

Lesson: over an unreliable network, you can never *guarantee* a message arrived. That's why **"exactly once" delivery is impossible** — the best you get is "at least once, and make repeats harmless" (called idempotency, Ch 23, §3.21).

**Byzantine Generals:** now imagine some generals *lie*. To survive `f` liars you need **3f + 1** computers. Blockchains (Bitcoin, Ethereum) assume liars and pay this 3× cost. Inside Google's own datacenter, computers don't lie — they just crash — so cheaper methods (Raft) work with **2f + 1**.

## 9.5 Consistency models — how fresh is your data?

> **Think of it like this:** "how recent is the answer you just read?" Fresher is safer but slower.

```
   Strongest ───────────────────────────────────▶ Weakest
   Linearizable    Causal    Read-your-writes    Eventual
```

| Model | Plain English | Example |
|-------|---------------|---------|
| **Linearizable** | Every read sees the very latest write, as if one shared clock | etcd, ZooKeeper |
| **Causal** | If A caused B, everyone sees A before B | CRDTs |
| **Read-your-writes** | You always see *your own* changes (others may lag) | Sticky-session apps |
| **Monotonic reads** | Once you've seen a value, you never see an older one | Session-pinned apps |
| **Eventual** | Wait a moment and everyone agrees | DynamoDB default |

Rule of thumb: stronger = more waiting. Pick the weakest one your app can live with.

(The cousin idea — transaction *isolation* levels — is in §7.3. Don't mix them up: consistency is about copies of data; isolation is about transactions.)

## 9.6 Time, clocks, and ordering

> **Think of it like this:** every computer has its own watch, and the watches disagree. So "what happened first?" is surprisingly hard.

A few kinds of clocks:

- **Wall clock** (normal time-of-day): drifts, and can even jump *backward* when corrected. **Never** use it to order events or as an ID.
- **Monotonic clock**: only ticks forward. Great for "how long did this take?" — but only on one machine.
- **NTP**: the internet service that keeps wall clocks roughly in sync (within ~10–100 ms). Good, not perfect.
- **TrueTime (Google Spanner)**: special atomic clocks + GPS, so Google *knows* how wrong its clock might be. It waits out that tiny uncertainty before finishing a write, which keeps Spanner correct worldwide (§8.15).

To agree on order *without* a shared clock, computers attach special counters to events (called Lamport and vector clocks). The point you need: these counters can tell whether one event truly came **before** another, or whether two events happened at the "same time" and clash. **Hybrid Logical Clocks (HLC)** mix a real timestamp with a counter — close to real time *and* able to order events. Used in CockroachDB, YugabyteDB, and MongoDB.

## 9.7 Consensus — getting machines to agree

> **Think of it like this:** a group of friends must agree on one restaurant, even if a couple of them wander off mid-chat. "Consensus" is how computers do that.

The job: many computers agree on **one** value, even if some crash.

| Method | Claim to fame | Used in |
|--------|---------------|---------|
| **Paxos (1989)** | The original; correct but famously hard to follow | Google Chubby, Spanner |
| **Raft (2014)** | Same job, made *easy to understand* | etcd, Consul, CockroachDB, Kafka |
| **Zab** | ZooKeeper's version | ZooKeeper |
| **PBFT / Tendermint** | Works even if some machines *lie* | Blockchains |

You don't need Paxos's inner workings for an interview. Just remember: **Raft** is the popular, readable one. It elects a single **leader** by majority vote; the leader writes everything down in order and copies it to the others. Raft is next.

## 9.8 Raft — agreement in 6 simple rules

> **Think of it like this:** the team elects one captain. The captain calls the plays and makes sure everyone writes them down in the same order.

```
   1. At most one captain (leader) at a time.
   2. The leader takes all writes and copies them to the others.
   3. A write counts as "saved" once most computers have it.
   4. The leader never erases what's already written.
   5. A computer that fell behind gets the missing writes filled in.
   6. Only an up-to-date computer can become the next leader.
```

Two simple messages run the whole thing: "vote for me?" and "add this to your log." Used in etcd, Consul, CockroachDB, MongoDB, and Kafka.

**How many computers?** To survive `f` crashes you need **2f + 1**:

```
   3 computers → survive 1 crash (common)
   5 computers → survive 2 crashes (the sweet spot)
```

Even numbers don't help: 4 computers still need 3 to agree, just like 3 does — so 4 is worse, not better.

## 9.9 Consistent Hashing

> **Think of it like this:** you share toys among friends standing in a circle. Each toy goes to the next friend clockwise. If one friend leaves, only *their* toys move — everyone else keeps theirs.

**The problem it solves:** a simple rule like "server = hash(key) mod N" breaks badly when you add a server — almost every key jumps to a new server, and every cache goes cold at once.

**The fix:** put servers *and* keys on a circle (a "ring"). Each key belongs to the next server clockwise. Add or remove a server, and only a small slice of keys moves.

```
                ┌──── the ring ────┐
           S1 ●                      ● S2
                    ● keyA
                       ● keyB
           S4 ●                      ● S3
                └──────────────────┘
   Add S5 → only the keys in one small slice move.
```

**Virtual nodes:** place each server on the ring in many spots (say 100) so load spreads evenly; bigger servers get more spots. Used by Cassandra, DynamoDB, and basically every big cache and CDN.

## 9.10 Quorum math — N, W, R

> **Think of it like this:** if you tell a fact to several friends and later ask enough of them, at least one will remember the newest version.

In Dynamo-style databases you set three knobs:

- **N** = how many copies of each piece of data
- **W** = how many copies must confirm a write
- **R** = how many copies must answer a read

**The magic rule:** if **W + R > N**, every read is guaranteed to see the latest write.

```
   N=3, W=2, R=2 → 2+2 > 3 → always fresh (the common "quorum" setting)
   N=3, W=1, R=1 → 1+1 ≤ 3 → fast, but might read slightly old data
```

You can choose per request: a tweet can be a little stale; a money transfer cannot.

**Sloppy quorum:** if some copies are unreachable, a write is parked on a stand-in server, which hands it back later. This keeps writes flowing during trouble — but you lose the strict "always fresh" promise.

## 9.11 Two-phase commit (2PC) — and why it hurts

> **Think of it like this:** a waiter asks every kitchen "ready?" before yelling "go!" If the waiter faints between "ready?" and "go!", the kitchens are stuck waiting forever.

```
   Step 1: Coordinator asks everyone "can you commit?" — they vote yes/no.
   Step 2: If all say yes → "commit!"  otherwise → "cancel!"
```

The trouble:

- If the coordinator dies between steps, everyone holds their locks and **waits forever**.
- A network split in the middle can leave things half-done.

So big systems avoid 2PC. They use **sagas** (§7.9) or consensus-backed transactions (Spanner) instead. 2PC is only fine for small, in-house, low-traffic jobs.

## 9.12 Distributed locks — the "looks easy" trap

> **Think of it like this:** one bathroom key, so only one person goes in at a time. Simple — until someone takes the key and never comes back.

Goal: only **one** worker does job X at a time. A good lock needs three things: only one holder, it frees itself if the holder dies, and it survives a server crash.

**Lease-based locks** (the right way): you get the lock with a time limit (a "lease"), and must keep renewing it. Go quiet, and it expires so someone else can grab it.

**The sneaky bug — and the fix (fencing tokens):** suppose your program freezes for 30 seconds (a long pause while it cleans up memory):

```
   Time 0:  Worker A grabs the lock (ticket #14)
   Time 1:  Worker A freezes
   Time 35: Lock expired → Worker B grabs it (ticket #15), starts writing
   Time 40: Worker A wakes up, still thinks it holds the lock, also writes
   →  Two writers at once! Data corrupted.
```

The fix: every lock hands out a **rising ticket number**. The *storage* remembers the highest ticket it has seen and **rejects** any write with an older ticket. So Worker A's stale ticket #14 gets bounced.

**Redlock warning:** don't trust Redis-based locks when correctness really matters. Use real tools — **etcd, ZooKeeper, or a database's own locks** — when only one writer is allowed.

## 9.13 Leader election & leases

> **Think of it like this:** the team needs one captain. Whoever grabs the "captain" badge first wears it — and must keep checking in, or it falls to someone else.

```
   1. Each computer tries to claim a "leader" key with a time limit.
   2. The first one wins.
   3. The winner keeps renewing the claim.
   4. If the winner dies, the claim expires and the others race again.
```

Same fencing-token trick as locks: every action the leader takes carries a rising "term" number, and a stale leader's writes get rejected. Raft builds this in.

## 9.14 Gossip, heartbeats, failure detection

> **Think of it like this:** in a huge crowd, instead of everyone checking on everyone (too noisy!), each person whispers news to a few random others. Soon everyone knows.

How do thousands of computers know who's still alive?

- **Heartbeat:** each one pings the others regularly. Fine for small groups, too noisy for big ones.
- **Gossip:** each computer tells a few random others what it knows; news spreads fast, like a rumor. Used by Cassandra and Consul.
- **Phi-accrual detector:** instead of a flat "up or down," it reports *how suspicious* a computer looks — which handles flaky networks better.

The trade-off: a short timeout spots failures fast but cries wolf; a long timeout is calmer but slower.

## 9.15 Anti-entropy & Merkle trees

> **Think of it like this:** two friends have copies of the same notebook and want to find the one page that differs — without reading every page aloud.

When copies of data drift apart, you must find and fix the differences cheaply. A **Merkle tree** does this: each chunk of data gets a fingerprint (a "hash"), and fingerprints combine upward into one top fingerprint.

```
              top fingerprint
             /               \
         fp(left)          fp(right)
         /     \            /     \
       d1      d2         d3      d4
```

Two copies compare top fingerprints. Same? Done. Different? Walk down only the side that differs. So you send **only the bits that actually changed**. Used by Cassandra, DynamoDB, Git, and BitTorrent.

**Read repair:** a cheaper helper — when a read notices two copies disagree, quietly fix the stale one in the background.

## 9.16 Bloom filter

> **Think of it like this:** a tiny bouncer who can instantly say "definitely *not* on the list" or "*maybe* on the list," using almost no memory. He never wrongly turns away someone who *is* on the list.

A Bloom filter answers "is this item in the set?" using tiny memory. It can give a false "maybe," but **never** a false "no."

```
   bits:  [0 1 0 1 1 0 1 0 0 1]
   "alice" flips a few bits ON.
   Ask "alice" → all its bits are ON  → maybe present
   Ask "carol" → one bit is OFF       → DEFINITELY not present
```

Used to skip pointless disk lookups (Cassandra, RocksDB), check if a username is taken, or skip URLs already crawled. Rule of thumb: about **10 bits per item** gives a ~1% false-"maybe" rate.

## 9.17 Other handy "good enough" structures

> **Think of it like this:** sometimes a fast, *almost*-right answer beats a slow, perfect one.

- **HyperLogLog** — counts how many *different* items you've seen, using tiny memory, with ~2% error. (Redis `PFCOUNT`.)
- **Count-Min Sketch** — estimates how often things appear; good for spotting "heavy hitters."
- **t-digest** — estimates percentiles like p99 latency cheaply. (Used by Datadog.)
- **Reservoir sampling** — keeps a fair random sample from a never-ending stream.

These are your toolkit for "I need a fast, approximate answer."

## 9.18 CRDTs — data that merges itself

> **Think of it like this:** two people edit the same shopping list while offline, then reconnect — and the list just merges correctly, with no fight over who's right.

The problem: two copies get edited at the same time. How do they merge with no conflict? **CRDTs** are special data types whose merges always agree, no matter the order they arrive.

| Type | What it's for |
|------|---------------|
| **G-Counter** | A counter that only goes up (page views) |
| **PN-Counter** | A counter that goes up *and* down (likes / dislikes) |
| **OR-Set** | A set you can add to and remove from (shopping cart) |
| **Sequence (Yjs / RGA)** | Shared text editing |

CRDTs power Google-Docs-style editing (Yjs / Automerge), Figma's multiplayer, Redis Enterprise, and Riak.

## 9.19 CAP in a nutshell — the cheat sheet

```
   When the network splits…

   CP system (Spanner, etcd, MongoDB-majority):
     refuses writes on the cut-off side → stays correct, but partly unavailable.

   AP system (Cassandra, DynamoDB):
     keeps taking writes on both sides → stays available, but the two sides
     drift apart and must be merged back together later.

   "CA" is a marketing word, not a real design.
```

> **One more glue piece:** to make retries safe in all of this, use idempotency tokens — see Ch 23, §3.21.

---

# PART 10: MESSAGING & STREAMING

## 10.1 Why a queue?

> **Think of it like a line at the post office.** You drop off your package and leave. The worker handles it later when they have time.

A **queue** is a waiting room for messages. It sits between a fast sender and a slow receiver so the sender doesn't have to wait around. Think of it like this: the producer (sender) writes messages, the queue holds them, and the consumer (receiver) reads them when ready.

If the consumer crashes? No problem. The message stays in the queue until someone picks it up and says "got it."

```
   producer ──▶ [ msg msg msg msg msg ] ──▶ consumer
                       QUEUE
   Decouples them in time, in scale, and in failure.
```

Why this matters:
- **Decoupling** — sender and receiver don't need to be online at the same time
- **Smoothing bursts** — sudden flood of messages? The queue absorbs them
- **Retry** — if processing fails, try again later
- **At-least-once delivery** — you never lose a message
- **Fan-out** — one sender can feed many different teams of receivers

## 10.2 Queue vs Stream vs Pub/Sub

**Three ways to pass messages.** Like three different ways to share news with friends.

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

- **Queue** — like passing notes in class. One person gets each note. When they read it, it's gone.
- **Stream** — like a diary everyone can read. The diary never erases old pages. You can jump back and re-read from page 10 if you want. Kafka and Kinesis work like this.
- **Pub/Sub** — like a loudspeaker announcement. Everyone who's listening hears it. But if you weren't there, you missed it.

## 10.3 Delivery guarantees — the three options

**Three promises about whether your message gets through.**

| Guarantee | Meaning | How |
|-----------|---------|-----|
| **At most once** | May lose, never duplicate | Fire-and-forget |
| **At least once** | Never lose, may duplicate | Producer retries until ack; consumer must be idempotent |
| **Exactly once** | Never lose, never duplicate | Hard! Needs transactional producer + dedupe (Kafka EOS, idempotent consumers) |

**At most once** means you try once and move on. Like tossing a note out the window — maybe someone catches it, maybe not.

**At least once** means you keep trying until you get a "got it" reply. But you might send the same note twice. The receiver needs to handle duplicates gracefully. We call that **idempotent** — doing it twice is safe.

**Exactly once** means guaranteed delivery, guaranteed no duplicates. This is really hard to do. You need special tricks inside the message system plus the receiver has to be idempotent.

**Senior insight:** Real "exactly once" needs the messaging system to use transactions AND the consumer to handle duplicates smartly. That combo is the only realistic path to true end-to-end exactly-once semantics.

## 10.4 Kafka in one diagram

**Think of Kafka like a massive spreadsheet where each row is a message and you can never delete rows.**

Kafka is a **distributed log** — a growing list of messages that never gets erased. It's split into **partitions** (think: separate columns) so many readers can work in parallel.

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

- **Topic** — like a channel name ("orders", "clicks", "payments")
- **Partition** — a numbered slice of the topic. Messages with the same key always go to the same partition.
- **Offset** — your bookmark. "I last read message 42."
- **Replication factor** — each partition is copied to multiple servers so if one dies, you don't lose data.
- **Consumer group** — a team of workers. Each partition is read by exactly one member of the team at a time. This lets you scale up by adding workers.

## 10.5 Backpressure

**When the receiver can't keep up with the sender.**

Imagine a firehose spraying into a bucket. If the bucket fills faster than you can empty it, something has to give.

When consumers are slow, the queue grows and grows. You have four choices:

- **Buffer** — let the queue grow. Works until you run out of memory.
- **Drop** — throw away some messages. Maybe keep every 10th one (sampling) or just shed the excess.
- **Block** — tell the producer to slow down. "Stop sending for a sec, I'm full." This is **flow control** (gRPC and Reactive Streams do this).
- **Spill to disk** — write the overflow to disk instead of memory. Kafka and SQS do this automatically.

## 10.6 Ordering guarantees

**Most queues only promise order inside one partition.**

If you need messages A, B, C to arrive in that exact order for all consumers, you're stuck using a single partition. No parallelism.

The smart trick: **partition by key**. All messages for user #42 go to partition 7. Now all of that user's messages stay in order, but different users are in different partitions and can process in parallel.

## 10.7 Dead-letter queues (DLQ)

**A special queue for broken messages.**

Sometimes a message is poison — it crashes your consumer every time. After N failed attempts, move it to a **dead-letter queue** (DLQ) — a holding pen for humans to inspect later. This stops one bad message from blocking thousands of good ones behind it.

---

## 10.8 Kafka internals you should know

**How Kafka spreads data across servers.**

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

- **Broker** — one server in the Kafka cluster.
- **Leader** — the boss replica for a partition. All writes go to the leader.
- **Replica** — a backup copy of the partition on another broker.
- **ISR (In-Sync Replicas)** — replicas that are fully caught up with the leader. If a replica falls behind, it's kicked out of the ISR until it catches up.

Key settings you tune:

- **`acks`** — how many replicas must save your message before you get "success."
  - `0` = fire-and-forget (fast, might lose data)
  - `1` = leader saved it (default, some risk)
  - `all` = all ISRs saved it (durable, slower)
- **`min.insync.replicas`** — refuse writes if fewer than N replicas are alive. Safety gate against data loss.
- **Retention** — how long Kafka keeps messages. Set by time (`log.retention.hours`) or by size. Remember: Kafka is a log, not a queue. Old messages stick around for days or weeks.
- **Compaction** — special mode that keeps only the newest message per key. Useful for state (e.g., "here's the latest address for user #42").

## 10.9 Exactly-once in Kafka — three pieces in concert

**How Kafka prevents duplicates and lost messages at the same time.**

Three tricks working together:

1. **Idempotent producer** — the producer adds secret sequence numbers to each message. If you retry, Kafka sees "oh, I already saved message #5" and ignores the duplicate.
2. **Transactional producer** — you can group several writes into one atomic batch. Either all succeed or all fail. Like a database transaction.
3. **Consumer in `read_committed` mode** — the consumer only sees messages from committed transactions. Aborted transactions are invisible.

**Java example of a Kafka transaction:**

```java
producer.beginTransaction();
producer.send(toTopic("a", record1));
producer.send(toTopic("b", record2));
producer.sendOffsetsToTransaction(offsets, consumerGroup);
producer.commitTransaction();   // all-or-nothing
```

This gives you exactly-once *inside Kafka*. But end-to-end exactly-once into a database still needs the consumer to be **idempotent** — use an upsert with a primary key, or write with an idempotency key so the second identical write is ignored.

## 10.10 The Outbox pattern and CDC

**How to update your database and send an event without losing one of them.**

**Problem:** Your service needs to save a record to the database AND publish an event to Kafka. If you do them separately (dual-write), one might succeed and the other fail. Half your system thinks the order is paid, half doesn't. Disaster.

**Solution: Outbox pattern.**

```
   BEGIN;
     UPDATE orders SET status='paid' WHERE id=42;
     INSERT INTO outbox (event_type, payload) VALUES ('OrderPaid', '...');
   COMMIT;

   Separately: a relay (or CDC tool) reads outbox → publishes to Kafka → marks done.
```

Both writes happen in one database transaction. They succeed or fail together. Then a separate background job reads the outbox table and publishes those events to Kafka.

**CDC (Change Data Capture)** is even slicker. Tools like Debezium read the database's internal change log (the **WAL** — Write-Ahead Log) and automatically produce Kafka events. No outbox table needed. The database itself becomes the event source. This powers event-driven architectures without the dual-write hazard.

## 10.11 Choosing between Kafka, RabbitMQ, and SQS

**Three popular message systems. When to use which.**

| | **Kafka** | **RabbitMQ** | **AWS SQS** |
|---|---|---|---|
| Model | Distributed log (replayable) | Broker queue (consume + ack) | Managed queue |
| Throughput | Millions/sec/cluster | ~50k/sec/node | Practically unlimited (managed) |
| Latency | Low (1–10 ms) | Very low (< 1 ms) | 10–100 ms |
| Ordering | Per partition | Per queue | FIFO queue (lower throughput) |
| Delivery | At-least-once (or EOS w/ txns) | At-least-once | At-least-once |
| Retention | Configurable (days/weeks) | Until consumed | 14 days max |
| Best for | Event streaming, replay, analytics | Complex routing, RPC | Simple decoupling, no ops |

- **Kafka** — you want a replayable log. Event streaming, analytics, or feeding many teams from one stream.
- **RabbitMQ** — you need complex routing rules or very low latency. Good for RPC-style request/reply patterns.
- **SQS** — you want AWS to handle everything. Simple decoupling, no servers to manage.

## 10.12 Consumer rebalance — the surprise outage

**When Kafka consumers briefly stop reading.**

In a **consumer group**, each partition is assigned to exactly one consumer. When a consumer joins or leaves (crash, deploy, scale-up), Kafka has to **rebalance** — shuffle partition assignments.

During the rebalance window, **nobody reads from those partitions**. The whole group pauses. With many partitions or large in-memory state, this pause can be several seconds. Your lag spikes. Alerts fire.

Modern Kafka uses **cooperative rebalancing** (also called incremental rebalancing). Only the partitions being moved pause. The rest keep running. Much smoother.

**Interview tip:** Always set `partition.assignment.strategy=CooperativeStickyAssignor` for new Kafka apps. It's the smart default.

---

# PART 11: STORAGE SYSTEMS

## 11.1 Block vs File vs Object storage

> **Think of it like this:** **Block storage** is a blank notebook — you write on the raw pages. **File storage** is a filing cabinet with folders and subfolders. **Object storage** is a giant coat-check room — you hand over a blob, get a numbered ticket back.

```
   BLOCK          FILE                OBJECT
   ─────          ─────                ─────
   raw blocks     folders of files     key → blob + metadata
   (AWS EBS)      (NFS, EFS)           (S3, GCS, Azure Blob)
   ───────        ───────              ───────
   ► DB volumes   ► Shared code        ► Anything web-scale
   ► VMs          ► Old apps           ► Backups, images, videos
   Low latency,   POSIX rules          Cheapest, infinite scale
   not shared     (lockable)           Strong read-after-write (2020+)
```

**Default for new systems:** object storage. It's cheap, super durable (11 nines on S3 means 99.999999999% safe), and you can grab it from anywhere.

## 11.2 Distributed file systems

> **Think of it like this:** A normal file system lives on one computer. A **distributed file system** splits files across hundreds of machines so no single disk failure kills your data.

- **HDFS** — the Hadoop file system. Uses huge blocks (128MB or more). You write once, read many times. Optimized for reading files start-to-finish. Foundation of many **data lakes** (a lake is just a giant pool of raw files).
- **Ceph / GlusterFS** — these act like normal file systems (you can lock files, use standard tools) but spread data across many servers.
- **Google Colossus** — Google's newer version of GFS. Powers Bigtable and Spanner behind the scenes.

## 11.3 Data lake vs Data warehouse vs Lakehouse

> **Think of it like this:** A **data lake** is a big messy storage room — you throw everything in, figure out what it is later. A **data warehouse** is an organized store — everything is sorted and labeled before you put it on the shelf. A **lakehouse** is a storage room with a really good inventory system — cheap storage, but organized.

| | **Lake** | **Warehouse** | **Lakehouse** |
|---|---|---|---|
| Schema | On read | On write | On write but on cheap storage |
| Storage | Object store, cheap | Fancy columnar | Object store + open formats |
| Workloads | ML, exploration, raw events | BI, SQL dashboards | Both |
| Examples | S3 + Parquet | Snowflake, BigQuery, Redshift | Databricks, Iceberg, Delta |

**Schema on read** means you decide what the data looks like when you read it. **Schema on write** means you decide before you save it. **Columnar** means data is stored by column, not by row — super fast for queries that only need a few columns.

## 11.4 Hot vs Warm vs Cold storage

> **Think of it like this:** Your desk drawer is **hot storage** — grab stuff instantly. The closet is **warm storage** — takes a few seconds. The attic is **cold storage** — you need a ladder and a flashlight, but rent is cheap.

```
   HOT       SSD / Redis      microsecond latency    $$$$
   WARM      HDD / S3 Std     millisecond latency    $$
   COLD      Glacier          minutes-hours          $  (backups, compliance)
```

**Lifecycle policies** move files between tiers automatically. S3 Intelligent-Tiering watches what you actually use and moves stuff for you.

## 11.5 Replication vs Erasure Coding

> **Problem:** How do you keep data safe when disks and machines fail?

> **Think of it like this:** **Replication** is making photocopies — store three full copies. **Erasure coding** is like splitting a secret message into puzzle pieces — you only need most of the pieces to rebuild the whole thing.

```
   3× REPLICATION                       REED-SOLOMON (10, 4)
   ─────────────                         ─────────────────────
   3 full copies                         10 data + 4 parity chunks
   3× storage cost                       1.4× storage cost
   Can lose 2 disks                      Can lose 4 chunks
   Read & rebuild is simple              Rebuild needs 10 chunks (CPU + disk work)
   Used for: hot data, RAM-tier          Used for: cold data, S3, HDFS, Ceph
```

**Reed-Solomon** is the math behind erasure coding. Most cloud object stores use it for cold tiers. It pushes storage cost close to the minimum while still surviving multiple disk failures and even entire rack failures.

## 11.6 Cloud object storage consistency (S3 in 2020+)

> **Think of it like this:** Imagine you put a book on a library shelf. **Eventually consistent** means another person might look for it and not see it yet — it takes time for the catalog to update. **Strongly consistent** means the catalog updates instantly.

For years, S3 was *eventually* consistent for list and overwrite operations. Since December 2020, **S3 offers strong read-after-write consistency** for all operations. 

This is important because it changes how you design systems. You can safely "write a file then list the folder" without adding sleep delays or retry loops.

GCS and Azure Blob have been strongly consistent for years. If you're designing for multiple clouds, don't assume the weakest model.

## 11.7 Wide-column storage layouts — Bigtable & friends

> **Think of it like this:** Normal SQL is a strict spreadsheet — every row has the same columns. **Wide-column storage** is like a giant sticky-note board — each row can have totally different notes, and you can stick on new notes anytime.

```
   ROW KEY  →  COLUMN FAMILY : COLUMN  →  CELL (value, timestamp)
   "user42" →  "profile:name"          →  "Alice",   t=t1
                                           "Alicia",  t=t2  ← multiple versions
```

- **Sorted on row key** → lets you scan ranges fast.
- **Sparse** → missing columns cost nothing. If a row doesn't have a column, it takes zero space.
- **Versioned** → you can store time-series and history automatically.
- Powers Bigtable, HBase, Cassandra (logically), Accumulo.

**Design rule for the Bigtable family:** The row key is the only thing you can search efficiently. Pick it carefully. Often people use `userId#reverseTimestamp` to scan recent activity per user.

## 11.8 Object-store-as-database (the lakehouse era)

> **Think of it like this:** Instead of paying for an expensive database, just write files to S3 like you're saving documents. But add a smart catalog on top (like **Apache Iceberg** or **Delta Lake**) so you can still do database-like stuff — rollbacks, schema changes, ACID transactions.

This is a surprisingly modern pattern. Skip a traditional database for analytical workloads and write **Parquet files into S3** (or GCS / ADLS) with a metadata layer.

**Parquet** is a columnar file format. It's compressed and super fast for queries.

```
   ┌──────────────────────────────────────────────────────┐
   │ Parquet files (columnar, compressed) on S3            │
   │   + Iceberg / Delta manifest (ACID, snapshots, schema)│
   │     ↓                                                 │
   │ Queried by Spark, Trino, DuckDB, Snowflake, BigQuery  │
   └──────────────────────────────────────────────────────┘
```

You get **ACID** (all-or-nothing transactions), time travel (query data as it looked yesterday), schema evolution (add columns later), and cheap object-store storage. You don't lock into a proprietary warehouse. This is the foundation of every modern data lakehouse architecture.

---

# PART 12: DATA PROCESSING

## 12.1 Batch vs Stream

> **Think of it like this:** batch is doing all your laundry once a week. Streaming is washing each sock the moment it gets dirty.

```
   BATCH                              STREAM
   ──────────────────────            ──────────────────────────
   Handles big piles, now and then    Handles each event as it arrives
   Slow to react (minutes–hours)      Reacts instantly (ms–seconds)
   Easy to think about                Trickier (late events, windows)
   Tools: Spark, MapReduce, Airflow   Tools: Flink, Kafka Streams
```

## 12.2 MapReduce — the big idea

> **Think of it like this:** to count words in a giant library, you hand each helper a few books (Map), group all their tallies by word (Shuffle), then add up each word (Reduce).

```
   Input → [ MAP ] → small (key, value) notes → [ SHUFFLE ] → [ REDUCE ] → answer

   Counting words:
     Map:     "the cat sat" → (the,1) (cat,1) (sat,1)
     Shuffle: gather all the same words together
     Reduce:  (the, [1,1,1,…]) → (the, 47)
```

You rarely write MapReduce by hand today, but it's the grandparent of Spark, Flink, and BigQuery.

## 12.3 Lambda vs Kappa architecture

> **Think of it like this:** Lambda runs two kitchens (one slow-and-careful, one fast). Kappa runs just one fast kitchen and re-cooks from the recipe when needed.

```
   LAMBDA — two paths: a slow "batch" path + a fast "speed" path, results merged.
            Pro: the slow path can fix mistakes. Con: two sets of code to keep.

   KAPPA  — one streaming path. To fix or redo, just replay the saved event log.
            Pro: one set of code. Con: you need a durable, replayable log (Kafka).
```

Most modern systems lean **Kappa**. Its superpower is **replay**: to backfill data or fix a bug, rewind to an earlier spot in the log and run the events through again.

## 12.4 ETL vs ELT

> **Think of it like this:** ETL washes the veggies *before* they go in the fridge. ELT throws them in raw and washes them when you cook.

- **ETL** (Extract → Transform → Load): clean the data *before* loading it. The old way, for pricey warehouses.
- **ELT** (Extract → Load → Transform): load raw data first, clean it *inside* the warehouse (dbt + Snowflake / BigQuery). The modern default.

## 12.5 Stream-processing concepts

> **Think of it like this:** events are like letters that sometimes arrive late and out of order. You need rules for handling them.

- **Event time vs processing time** — when it actually happened vs when you finally saw it.
- **Windows** — buckets of time you group events into (every 5 minutes, etc.).
- **Watermarks** — a line in the sand: "anything older than this is officially too late."
- **State** — some steps must remember things (running counts, joins). Flink keeps that memory safely.

## 12.6 Exactly-once stream processing (Flink)

> **Think of it like this:** Flink takes a "save point" of the whole game now and then. If it crashes, it reloads the last save and continues — so nothing is counted twice or lost.

Flink stays exactly-once by taking regular **checkpoints** — snapshots of everything it's remembering:

```
   Now and then, Flink slips a "marker" into the stream.
   Each step, when it sees the marker:
     1. Saves its memory to safe storage (S3 / HDFS).
     2. Passes the marker along.
   When every step has saved → the checkpoint is complete.
   On a crash → reload the last good checkpoint, rewind the input, and continue.
```

Pair this with a sink (output) that ignores duplicates, and you get **end-to-end exactly-once**.

## 12.7 Stream-table duality

> **Think of it like this:** a table is a photo of *right now*; a stream is the *video* of every change. You can rebuild either one from the other.

A neat idea from Kafka Streams: **a table is a snapshot of a stream of changes, and a stream is the list of changes to a table.**

```
   Stream of changes                  Table (latest value wins)
   ─────────────────                  ─────────────────────────
   (user42, "Alice")   ──build──▶     user42 → "Alicia"
   (user42, "Alicia")                 user43 → "Bob"
   (user43, "Bob")
```

This powers materialized views, CQRS read models, and event-driven joins.

## 12.8 Windowing in stream processing

> **Think of it like this:** windows are how you slice never-ending time into chunks you can actually count.

```
   TUMBLING  |─5min─|─5min─|─5min─|   back-to-back chunks, no overlap
   SLIDING   |─5min─|                 overlapping chunks, e.g. updated each minute
               |─5min─|
   SESSION   |─events─|  gap  |─events─|  one chunk per burst of activity
```

Pair windows with **watermarks** so you know when a window is "done." Events that show up after that go to a side list (or get dropped).

## 12.9 Common stream-processing traps

> **Think of it like this:** the usual ways streaming jobs blow up.

- **Hot key** — one popular key (a celebrity's events) floods one worker. Spread the load out.
- **Memory that never shrinks** — sessions that never close fill the disk. Give state an expiry.
- **Watermark too strict** — late events get silently dropped. Keep a side list for latecomers.
- **Using "now" instead of event time** — breaks billing and audits. Always use *event* time.
- **Saving too rarely** — a crash then replays hours of data. Checkpoint often enough.

---

> **Continued in [Chapter 25 — System Design — Part 3: Operations & Case Studies](25_system_design_operations_case_studies.md).** Part 3 picks up at §13.1 and covers reliability and chaos engineering, security (AuthN/AuthZ, OAuth/OIDC, JWT, crypto, OWASP, mTLS, STRIDE), observability (logs/metrics/traces, SLI/SLO, OpenTelemetry, golden signals), deployment (containers, K8s, GitOps, progressive delivery), search and supporting building blocks, multi‑region architecture, FinOps, the anti‑patterns to spot in design discussions, and a full Instagram worked example.
>
> **Coming from Part 1?** Return to [Chapter 23 — Foundations & Protocols](23_system_design_fundamentals_deep_dive.md) for the network/edge stack referenced throughout this chapter.
