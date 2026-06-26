# Chapter 36 — System Design Case Studies — Part 2: Search, Geo, Feeds & Media

Part 1 (Ch 35) tackled the **real-time and communication** systems — notifications,
chat, video conferencing, collaborative editing. This part takes on the systems that
**find, locate, rank, and stream**: the read-heavy, data-intensive workhorses of the
modern web. These are the interview questions where a single data-structure choice
(a **trie**, a **geohash**, a **Bloom filter**) or one architectural split (offline vs
online, push vs pull, metadata vs blocks) decides whether your design survives Google
scale or collapses at the first viral moment.

Each case study is fully worked using the **exact same 10-section template** so you can
pattern-match under interview pressure: framing → what's tested → clarify → estimate →
architecture → critical path → data model → scaling → failure modes → the LLD crux →
follow-ups. The URL shortener at the end is a deliberately tight **warm-up** that shows
the scaffold in miniature.

> These case studies use the universal "Design X" playbook from **Ch 35 Part A** — the
> 8-step framework, the clarify-script, the estimation refresher, and the 4-layer
> architecture mental model (EDGE → SERVICES → DATA → ASYNC). We apply it here; we do
> not re-teach it.

## What you'll learn

- How to fully work the **search / geo / feed / media** family of "Design X" questions.
- **Trie sharding + precomputed top-K** for sub-50 ms autocomplete, with the memory math.
- **URL frontier design** (politeness + priority) and **Bloom-filter dedupe** for a crawler.
- **Geohash vs quadtree vs S2 cells** — and how to answer "find within R km" with diagrams.
- **Real-time location grids** and **double-dispatch-safe matching** for ride-hailing.
- **Push vs pull vs hybrid fan-out** for timelines — with the follower-count arithmetic.
- **Transcoding pipelines** and **adaptive-bitrate (HLS/DASH)** streaming for video.
- **Chunking, content-hash dedupe, and delta-sync** for file storage.
- The **ID-generation + 301/302** scaffold every "shortener-like" design reuses.

## Table of Contents

| # | Case study | LLD crux (the deep-dive) |
|---|------------|--------------------------|
| 5 | Search Autocomplete / Typeahead (Google suggest) | Trie node layout + top-K merge + memory math |
| 6 | Web Crawler (Googlebot) | URL frontier (politeness + priority) + Bloom dedupe |
| 7 | Proximity / Nearby (Maps, Yelp, nearby friends) | Geohash vs quadtree vs S2; radius search |
| 8 | Ride-Hailing (Uber / Lyft) | In-memory grid + atomic claim (no double-dispatch) |
| 9 | News Feed (Twitter / Facebook) | Hybrid fan-out decision + the celebrity hot key |
| 10 | Video Streaming (YouTube / Netflix) | Parallel transcode pipeline + ABR manifest/segments |
| 11 | File Sync & Storage (Drive / Dropbox) | Chunking + content-hash dedupe + delta-sync |
| 12 | URL Shortener (TinyURL) — *warm-up* | Distributed ID → base62 + the 301/302 trade-off |

> **Note on what we reuse:** Ch 25 already sketched autocomplete, geo-indexes, the
> Twitter feed, and Dropbox as *building blocks*, and fully worked **Instagram**. Here we
> go several levels deeper and treat each as a complete, defensible design. Where a topic
> overlaps, we say so and focus on the part Ch 25 left out.

# CASE STUDY 5 — SEARCH AUTOCOMPLETE / TYPEAHEAD (Google suggest)

> **Google priority:** ★★★ · **Difficulty:** Hard · **Frequency:** Very common · **Time budget:** ~40 min

> **User story —** *As a* user typing in the search box, *I want* relevant completions to appear
> before I finish the word, *so that* I find what I mean in a few keystrokes instead of typing the
> whole query.
>
> **For example —** I type "ne" and instantly see *netflix, news, nearby restaurants* ranked by
> what people actually search — each keystroke answered in under 50 ms.
>
> **Why it matters —** a `LIKE 'ne%'` SQL scan can't hit that latency at hundreds of thousands of
> QPS; a sharded in-RAM trie with precomputed top-K per node is what makes "instant" instant.

You start typing **"ne"** into the search box and, before your finger leaves the key,
a list drops down: *netflix, news, nearby restaurants, nest…* That is **autocomplete**
(a.k.a. **typeahead**): given the few characters typed so far (a **prefix**), instantly
return the most likely completions, ranked by what billions of people actually search.
The product looks trivial; the engineering is not. The hard part is doing this in **under
50 milliseconds on every keystroke**, for **hundreds of thousands of requests per second**,
while the ranking reflects an ever-shifting world ("covid", "world cup", a new movie).

## 5.0 What's really being tested

- Do you reach for the right **data structure** — a **trie** (prefix tree) with
  **precomputed top-K** per node — instead of a `LIKE 'ne%'` SQL scan?
- Do you **split the slow path from the fast path**: an **offline pipeline** that mines
  query logs into popularity scores, and an **online serving tier** that only reads?
- Can you reason about a tight **latency budget** (p99 < 50 ms across the whole keystroke)?
- Do you handle **scale**: sharding a trie too big for one machine, caching hot prefixes?
- Do you cover the extras that show seniority: **typo tolerance**, **freshness/trending**,
  **personalization**, **atomic index swaps**?

## 5.1 Clarify — requirements

**Functional**
- Given a prefix, return the **top K** completions (K ≈ 5–10), ranked by popularity.
- Reflect **trending** queries within minutes–hours (new events change suggestions).
- **Typo tolerance**: "amaz0n" / "amazn" should still suggest "amazon".
- (Stretch) **Personalize**: bias toward the user's own recent/likely searches.

**Out of scope** (say it, to show focus): the actual search-results page; final-query
spell-correction; ad ranking; voice input. We design only the *suggestion* service.

**Non-functional**
- **Latency:** p99 **< 50–100 ms per keystroke**, end to end (this dominates everything).
- **Scale:** billions of searches/day → ~10⁵–10⁶ autocomplete QPS at peak.
- **Freshness:** suggestions may lag reality by **minutes to hours** (eventual is fine).
- **Availability:** very high; a stale-but-up index beats a fresh-but-down one.
- **Multilingual / locale-aware**; safe-search filtering of suggestions.

**Questions to ask out loud:** *How many completions (K)? Prefix-only or also infix
("substring") match? How fresh must trending be? Is personalization in scope? Mobile
(higher RTT, debounce harder) vs desktop? Any words we must never suggest (safety)?*

## 5.2 Estimate — back-of-envelope

```
   Searches / day          5,000,000,000   (5 B)
   Keystrokes that fire     ~6 per search   (debounced; not every key)
   ── autocomplete req/day  3.0e10  (30 B)
   Avg QPS                  3e10 / 86,400  ≈ 350,000 / s     [day ≈ 10^5 s]
   Peak (3×)                ≈ 1,000,000 / s   → must be RAM/cache served
   Write path (query logs)  5 B/day → OFFLINE pipeline, NOT the serving path
   Distinct phrases kept    ~100 M "head + torso" queries (drop the long tail)
   Latency budget (p99 50 ms): network RTT ~20 ms + edge ~5 ms
                                leaves ~20–25 ms for the serving tier
```

**What the numbers teach:** at ~10⁶ QPS, you **cannot touch a disk or a SQL database** on
the serving path — completions must come from **RAM** (a trie) or a **cache**. The write
side (mining 5 B queries/day) is huge but **entirely asynchronous**, so it never competes
with serving. And the long tail is worthless: keeping the **top ~100 M phrases** captures
almost all traffic while bounding memory.

## Whiteboard rehearsal — how you'd actually draw this live

In the room you don't reproduce the polished diagram in §5.3 below — you sketch rough
boxes and talk. So **rehearse from this first**: here is the same architecture as a **live
whiteboard sketch**, in the shorthand you'd actually use on a Google whiteboard. The colour
code is the one most candidates settle into:

> **green = client · grey = edge/LB · blue = service · red = datastore · orange = queue / stream · violet = 3rd-party**

![Search Autocomplete / Typeahead — whiteboard rehearsal sketch](diagrams/autocomplete_whiteboard.svg)

**Why rehearse from the sketch, not the clean diagram?** The polished SVG in §5.3 is for
*reading*; this one is for *rehearsing*. Practise reproducing it from memory in ~4 minutes while
narrating every box out loud — that muscle memory is exactly what the interview tests. It is the
*same* components as the clean §5.3 diagram, only drawn in the loose, name-the-tool style
your hand can produce under pressure: every box names a concrete technology, each datastore is
called out in red, queues in orange, third-party vendors in violet. That visual discipline is
the signal an interviewer is looking for.

## 5.3 HLD — high-level architecture

![Search Autocomplete / Typeahead — high-level architecture (HLD)](diagrams/autocomplete.svg)

**Legend:** boxes are stateless services unless they name a store. Read it
top-to-bottom: keystrokes are answered in **Layers 1–2** from RAM; **Layer 4** runs
continuously in the background and periodically ships a fresh index into Layer 2.

**Block-by-block:**
- **Browser (debounce + cancel)** — the first optimization is on the *client*: wait ~60 ms
  after the last keystroke and **cancel** the in-flight request for the previous prefix, so
  fast typists generate ~6 requests, not 20.
- **Edge / CDN POP** — caches the top-K for the few thousand hottest prefixes ("f", "ne",
  "you…"). Most autocomplete traffic is wildly skewed toward popular prefixes, so the edge
  absorbs a large fraction at ~5 ms (CDN & edge — Ch 23).
- **Suggest Service** — a thin **stateless router**: normalize the prefix, find which
  **trie shard** owns it, fetch its precomputed top-K, optionally re-rank for the user.
- **Trie shards** — the heart. The full trie is too big for one box, so it is **sharded by
  prefix range** and held **in RAM**, replicated for availability. Each node carries its
  **precomputed top-K** so serving is a short walk, not a subtree scan (the LLD crux, §5.8).
- **Offline pipeline** — Kafka streams the query logs to an aggregator that counts
  popularity with **time decay**, filters spam/PII, keeps the **top-N** phrases, and
  compiles a fresh immutable **score snapshot** (the trie-load artifact) that is **atomically swapped** in.

## 5.4 HLD — critical path walkthrough

Typing **"ne"** (after "n", "ne" debounced into a single live request):
```
  1. Browser cancels the in-flight "n" request and sends
     GET /ac?q=ne&lang=en&loc=US     (debounced 60 ms)
  2. Edge POP checks its hot-prefix cache for "ne":
        ├─ HIT  ─▶ return top-10 in ~5 ms   (a large share ends here)
        └─ MISS ─▶ forward to the Suggest Service
  3. Service normalizes "ne" (lowercase, trim, strip accents) and
     hashes it to the shard owning the "n–s" prefix range
  4. Trie Shard C walks 2 edges  n ─▶ e  to node "ne" and reads
     node.topK  (already sorted by score, PRECOMPUTED offline)
  5. (Optional) Service re-ranks top-K with light personalization
     using the user's recent queries — strictly budget-capped
  6. Return ["netflix","news","nearby…","nest","new york…"];
     edge caches it with a short TTL (~60 s) so the next user HITs
```
Each requirement maps to a step: **step 2** gives the latency (edge), **step 4** gives the
ranking (precomputed popularity), **step 5** gives personalization, and the whole thing
stays under budget because **no step touches a database**.

## 5.5 HLD — data model & storage choices

| Entity | Shape (key fields) | Store | Why |
|--------|--------------------|-------|-----|
| Trie node | `prefix → {children, topK[(phraseId,score)]}` | In-RAM trie (sharded) | O(prefix) reads at RAM speed; the serving tier |
| Phrase table | `phraseId → text, lang` | Embedded in snapshot | Resolve ids → display strings |
| Popularity | `phrase → decayed_count` | Offline store (Bigtable/warehouse) | Recompute scores in batch; never on serving path |
| Top-K cache | `prefix → top-10 list` | Redis (+ edge cache) | Absorb hot prefixes; short TTL for freshness |
| Query log | `(ts, userHash, query)` append | Kafka → cheap object store | Stream into the aggregator; TTL'd, not OLTP |
| Personalization | `user → recent queries / embeddings` | KV (Redis/Bigtable) | Looked up only when re-ranking, budget-capped |

**Why a trie, not SQL?** A `WHERE q LIKE 'ne%'` over a billion rows is a scan; a trie answers
the same question in **O(len(prefix))** with the answer pre-sorted. The trie *is* the index.

## 5.6 HLD — scaling & bottlenecks

- **Shard the trie.** It is ~100+ GB (math in §5.8) — too big for one host. Shard by
  **prefix** so any single prefix lives entirely on one shard (no fan-out for the common
  case). Replicate each shard **×3** for QPS headroom and availability.
- **Skew is the enemy.** Prefixes are not uniform — far more queries start with "s"/"a"
  than "z"/"q". Don't shard by raw first letter; **hash the 1–2 char prefix** (or use
  load-aware ranges, rebalanced with **consistent hashing — Ch 24**) so each shard gets
  comparable load.
- **Hot prefixes** ("f", "ne", "you") → served from the **edge + Redis top-K cache** so the
  trie shards see mostly the cooler traffic.
- **Memory pressure** → keep only the **top-N phrases**; store **top-K on every node** (fast
  but more RAM) or only on branching nodes + bounded subtree scan (less RAM, a touch slower).
- **Freshness vs cost** → rebuild snapshots on a cadence (e.g. hourly for the global trie),
  with a fast **trending side-channel** that boosts breaking queries between full rebuilds.

## 5.7 HLD — failure modes & trade-offs

```
  What dies                    →  What the user sees / what we do
  ──────────────────────────────────────────────────────────────────
  A trie-shard replica crashes  →  router retries another replica;
                                   no user impact (3× replicated)
  ALL replicas of a shard down  →  that prefix range degrades to the
                                   Redis top-K cache or returns []; the
                                   rest of the alphabet is unaffected
  Snapshot rebuild fails        →  shards KEEP serving the previous
                                   snapshot (atomic swap, never partial);
                                   suggestions just get staler, not wrong
  Offline pipeline backed up    →  popularity is older; serving fine;
                                   trending boost is the mitigation
  Edge/Redis cache cold         →  more traffic hits trie shards; they
                                   are sized for it, latency rises a bit
```
**Trade-offs called out:** we choose **eventual freshness** (suggestions lag the world by
minutes) to keep serving a **read-only, RAM-resident** structure — the only way to hit
sub-50 ms at 10⁶ QPS. We **drop the long tail** (memory vs coverage). We prefer a
**stale-but-available** index over strong freshness (availability over consistency — this
is a suggestion box, not a bank ledger).

## 5.8 LLD (the crux) — trie node layout, precomputed top-K & the merge

The crux is the sentence **"answer any prefix in O(prefix length), never scan a subtree at
query time."** You buy that property by **precomputing the top-K completions at every node**
during the offline build. Serving then never ranks anything — it just reads.

**Trie shape** (the string is the *path*, not stored in each node):
```
        (root)
          │ n
          ▼
       [ n ]   topK: net, new, news, nfl, ...
          │ e
          ▼
       [ ne ]  topK: netflix, news, nearby, nest, new york, ...
       ├── t ─▶ [ net ]  topK: netflix, net worth, nettv, ...
       │          ├ f ▶ [ netf ] topK: netflix, netflix login, ...
       │          └ w ▶ [ netw ] topK: net worth, network, ...
       └── w ─▶ [ new ]  topK: news, new york, new movie, ...

  Per-node layout:
    children : map<char, node*>             // one entry per next letter
    topK     : array<(phraseId, score)>[K]  // PRECOMPUTED, sorted desc
    terminal : optional (phraseId, score)   // a phrase ends here
```

**Serving — O(len(prefix)), no ranking at query time:**
```
  function suggest(prefix):
      node = root
      for ch in prefix:
          node = node.children.get(ch)
          if node == null: return []     // dead prefix → no suggestions
      return node.topK                   // already the sorted top-K
```

**Offline build — compute top-K bottom-up so each node inherits its children's best:**
```
  function buildTopK(node):
      heap = new BoundedMaxHeap(K)
      if node.terminal: heap.add(node.terminal)
      for child in node.children.values():
          buildTopK(child)               // recurse first (post-order)
          heap.addAll(child.topK)        // child already holds its top-K
      node.topK = heap.largestK(K)       // keep the best K by score
```
Because each child already holds its own top-K, the parent only merges **K items per child**
— the build is near-linear in the number of nodes, not quadratic over phrases.

**Memory math (why we shard):**
```
  Keep N = 100 M phrases, avg length L = 20 chars.
  Nodes after prefix sharing ≈ 0.6 × N × L ≈ 1.2 B nodes.
  Per node:  children map ~24 B + topK (K=10 × (id 4B+score 4B)=80 B)
             + overhead ~16 B  ≈ 120 B / node
  Total ≈ 1.2e9 × 120 B ≈ 144 GB
       → shard over 32 hosts ≈ 4.5 GB each (×3 replicas)  ✔ fits RAM
```

**Merge across shards (typo tolerance + fuzzy match).** Exact-prefix lookups hit **one**
shard. But to tolerate typos we also query **edit-distance-1 neighbors** of the prefix,
which may live on **different shards**; we scatter, gather each shard's local top-K, and
**merge by score**:
```
  // "amaz0n" → also try edit-distance-1 prefixes → merge results
  function suggestFuzzy(prefix):
      candidates = {prefix} ∪ editDistance1(prefix)   // small set
      partials   = scatter(candidates → owning shards) // in parallel
      heap = new MaxHeapByScore()
      for list in partials:           // each is a shard-local top-K
          heap.addAll(list)
      return heap.largestK(K)         // global top-K after merge
```
Modern systems replace hand-rolled edit distance with **character-embedding** matching so
"`amazn`", "`amzon`", and "`amaz0n`" all resolve to "amazon" (semantic typo tolerance).

**The atomic swap (no half-built index ever serves).** Builders write an **immutable**
snapshot to object store. Each shard loads it into **shadow memory**, validates it, then
**flips a single pointer** from the old trie to the new one (double-buffering). Readers see
either the whole old index or the whole new one — never a torn state — and the old buffer is
freed once in-flight reads drain.

## 5.9 Follow-ups, red flags & building blocks

**Likely follow-ups (with crisp answers):**
- *"Personalization?"* — keep the global trie for candidates, then **re-rank the top ~50** at
  serving time with the user's recent queries / a small embedding dot-product, capped to a
  few ms so it never blows the latency budget.
- *"Trending right now?"* — maintain a fast streaming counter (count-min sketch / heavy
  hitters — see *Top-K* in Ch 37) and **boost** breaking queries between full rebuilds.
- *"Infix / substring match ('york' → 'new york')?"* — add a secondary index keyed on each
  significant word, or n-grams; merge with prefix results. Costs more memory.
- *"How big is K and why precompute?"* — K≈10; precomputing turns each keystroke from an
  O(subtree) ranking into an O(prefix) read — the only way to hit 10⁶ QPS at <50 ms.

**Red flags that sink candidates:** computing top-K by scanning the subtree **at query
time**; using `LIKE 'x%'` against SQL on the hot path; **no offline/online split** (ranking
on the serving box); one **giant unsharded** trie that can't fit RAM; no caching of hot
prefixes; rebuilding the index **in place** (serving a half-built trie); forgetting the
**client debounce** (4× the traffic for nothing).

**Building blocks reused (theory lives elsewhere):** trie / prefix index and the
**inverted-index** mindset — **Ch 25** (*Search building blocks*); **Redis** caching and
**CDN/edge** — **Ch 23**; **Kafka** + **stream aggregation / MapReduce / Flink** — **Ch 24**
(*Messaging & Streaming*, *Data processing*); **consistent hashing** for shard balance —
**Ch 24**; **count-min sketch / heavy hitters** for trending — **Ch 37** (*Top-K*).

# CASE STUDY 6 — WEB CRAWLER (Googlebot)

> **Google priority:** ★★ · **Difficulty:** Hard · **Frequency:** Common · **Time budget:** ~40 min

> **User story —** *As a* search engine, *I want* to discover and continuously re-download the
> whole web politely, *so that* my index reflects pages as they exist today without overloading
> anyone's site.
>
> **For example —** starting from a few seed URLs, the crawler follows links across tens of
> billions of pages, re-fetching a news homepage hourly but a static PDF monthly — and never
> hammering one host faster than its `robots.txt` allows.
>
> **Why it matters —** the design hinges on the URL frontier (what to fetch next, how fast per
> host) and dedupe (seen URLs and seen content), not on "download a page."

A **web crawler** (a.k.a. spider, or "Googlebot") is the program that walks the web: start
from a few seed URLs, download each page, **extract the links** on it, and follow those
links — endlessly — to discover and re-download the whole web so a search engine can index
it. Picture a breadth-first traversal of a graph with **tens of billions of nodes**, where
the graph is hostile (spam traps, infinite calendars), the edges are slow (network I/O),
and you must be a **polite guest** (don't hammer one site). The crux is not "download a
page" — it's the **URL frontier**: deciding *what to fetch next*, *how fast per site*, and
*whether you've seen this URL (or this content) before*.

## 6.0 What's really being tested

- Can you design the **URL frontier** — a prioritized, **politeness-aware** queue that never
  overloads a single domain yet keeps thousands of fetchers busy?
- Do you **dedupe** at two levels: **seen URLs** (don't re-enqueue) and **seen content**
  (different URLs, identical/near-identical page)?
- Do you respect **`robots.txt`**, cache **DNS**, and avoid **crawler traps** / infinite spaces?
- Do you make it **distributed, fault-tolerant, and restartable** (it runs for weeks)?
- Do you schedule **re-crawls** by freshness (news every hour, a static PDF every month)?

## 6.1 Clarify — requirements

**Functional**
- Given **seed URLs**, download pages, extract links, and **enqueue new URLs** (BFS).
- **Politeness:** obey `robots.txt`; cap request rate **per host**.
- **Dedupe:** skip already-seen URLs; detect **near-duplicate content** (mirrors, boilerplate).
- **Re-crawl** pages on a freshness schedule; hand crawled HTML to the **indexer** (Ch 25
  *inverted index* — out of scope to build here).

**Out of scope** (state it): building the search **index/ranking**; rendering heavy
JavaScript (assume a separate headless-render tier if needed); the search front-end.

**Non-functional**
- **Scale:** crawl ~**30 B pages**, refresh on a rolling schedule (billions/day).
- **Throughput:** thousands of pages/sec aggregate; **politeness-bounded per domain**.
- **Robustness:** survive worker crashes, bad HTML, slow servers, traps; **resumable**.
- **Efficiency:** don't re-download unchanged pages; don't store duplicate content.

**Questions to ask:** *How fresh must content be (re-crawl cadence)? Do we render JS? Crawl
the whole web or a vertical (news, shopping)? Honor `nofollow`/sitemaps? Storage budget for
raw HTML? Politeness limits — fixed RPS or adaptive to the host's response time?*

## 6.2 Estimate — back-of-envelope

```
   Pages to crawl           30,000,000,000  (30 B)
   Re-crawl cadence         ~ once / month average (mix of hourly..yearly)
   ── crawl rate            30e9 / (30 × 86,400) ≈ 11,600 pages / s avg
   Peak (3×)                ≈ 35,000 pages / s
   Avg page size (HTML)     ~64 KB raw → ~15 KB gzipped
   Download bandwidth       35,000 × 64 KB ≈ 2.2 GB/s  (≈ 18 Gbps) sustained
   Raw HTML stored (gzip)   30e9 × 15 KB ≈ 450 TB  (object store, cheap)
   Seen-URL set             ~ 30 B+ URLs → a hashed/Bloom membership set
   Links per page           ~ 30 outlinks → frontier churn is huge
```

**What the numbers teach:** the **seen-URL set** (tens of billions of entries) is the
memory problem — a plain hash set of full URLs would be many terabytes of RAM, so we reach
for a **Bloom filter** (Ch 24). Bandwidth is large but linear; **storage of raw HTML is
cheap** in an object store. The real engineering is **scheduling and politeness**, not raw
throughput.

## Whiteboard rehearsal — how you'd actually draw this live

In the room you don't reproduce the polished diagram in §6.3 below — you sketch rough
boxes and talk. So **rehearse from this first**: here is the same architecture as a **live
whiteboard sketch**, in the shorthand you'd actually use on a Google whiteboard. The colour
code is the one most candidates settle into:

> **green = client · grey = edge/LB · blue = service · red = datastore · orange = queue / stream · violet = 3rd-party**

![Web Crawler (Googlebot) — whiteboard rehearsal sketch](diagrams/crawler_whiteboard.svg)

**Why rehearse from the sketch, not the clean diagram?** The polished SVG in §6.3 is for
*reading*; this one is for *rehearsing*. Practise reproducing it from memory in ~4 minutes while
narrating every box out loud — that muscle memory is exactly what the interview tests. It is the
*same* components as the clean §6.3 diagram, only drawn in the loose, name-the-tool style
your hand can produce under pressure: every box names a concrete technology, each datastore is
called out in red, queues in orange, third-party vendors in violet. That visual discipline is
the signal an interviewer is looking for.

## 6.3 HLD — high-level architecture

![Web Crawler (Googlebot) — high-level architecture (HLD)](diagrams/crawler.svg)

**Legend:** double-bordered box = the stateful frontier; single boxes = stateless workers
or stores. The loop is: **frontier → fetch → store → parse → dedupe → frontier**.

**Block-by-block:**
- **URL Frontier** — the prioritized, politeness-aware queue of "what to fetch next." It is
  the component that *is* this problem; §6.8 designs it.
- **Fetcher workers** — thousands of async I/O workers that pull a URL, check **robots.txt**,
  resolve DNS (from cache), download the page within a rate limit, and write the raw bytes.
- **DNS & robots caches** — fetching does **two** network round-trips before the page (DNS +
  robots); both are cached aggressively per host or DNS would become the bottleneck.
- **Content store** — cheap object storage for the raw gzipped HTML, keyed by a hash of the
  URL; downstream consumers (indexer, dedupe) read from here.
- **Parser / Extractor** — extracts outlinks (`<a href>`), the **canonical** URL, visible
  text, `lastmod`, and **sitemaps**; produces a content **fingerprint**.
- **Link graph (Bigtable)** — the extracted `src → [dst]` edges, persisted for ranking
  (PageRank-style) and to prioritize what's worth crawling next.
- **URL dedupe (Bloom filter)** — "have we already enqueued this URL?" answered in O(1) with
  tiny memory (Ch 24). New URLs go back to the frontier.
- **Content dedupe (sim-hash)** — "is this page a near-duplicate of one we already have?"
  Mirrors and boilerplate are everywhere; this stops us indexing the same thing 100×.

## 6.4 HLD — critical path walkthrough

One crawl cycle, end to end:
```
  1. Frontier hands fetcher the next URL, e.g. https://site.com/p?id=7
  2. Fetcher: DNS cache → IP; robots cache → "allowed?"  (refetch if stale)
        └─ if robots DISALLOWS → drop, record, move on
  3. Politeness gate: this host's back-queue enforces ≥ 1.5 s between
     hits (or adaptive to its latency) → fetcher waits its turn
  4. HTTP GET (conditional: If-Modified-Since / ETag)
        ├─ 304 Not Modified → bump next-recrawl time, done (cheap!)
        └─ 200 OK → write raw gzip HTML to Content store
  5. Parser extracts 30 outlinks + canonical + lastmod; computes a
     64-bit SIM-HASH of the page's shingles
  6. Content dedupe: if sim-hash within Hamming distance 3 of a known
     page → mark near-dup, do NOT index again
  7. For each outlink: normalize → Bloom "seen?"  → if NEW, set bit
     and ENQUEUE into the frontier with a computed priority
  8. Schedule this URL's next re-crawl based on its change history
```
Notice the efficiency levers: **step 4** (conditional GET → 304 avoids a download), **step
6** (content dedupe avoids re-indexing mirrors), **step 7** (URL dedupe avoids loops), and
**step 8** (freshness scheduling avoids wasting crawl budget on static pages).

## 6.5 HLD — data model & storage choices

| Entity | Shape (key fields) | Store | Why |
|--------|--------------------|-------|-----|
| Frontier queues | front (priority) + back (per-host) queues | Durable queue / sharded Redis + disk | Ordered, resumable, huge |
| Seen-URL set | `hash(url) → bit` | **Bloom filter** (+ backing KV) | 30 B entries in GB, O(1) (Ch 24) |
| robots.txt | `host → rules, ttl` | Redis cache + KV | Avoid refetching robots every hit |
| DNS cache | `host → IP, ttl` | In-process + Redis | DNS would bottleneck otherwise |
| Raw pages | `urlHash → gzip(html), fetchedAt` | Object store (S3/GCS) | 450 TB, write-once, cheap |
| Content fingerprints | `simhash64 → docId` | KV / LSH index | Near-dup detection |
| Crawl metadata | `url → lastCrawl, changeFreq, nextDue` | Wide-column (Bigtable/Cassandra) | Drives re-crawl scheduling |
| Link graph | `srcUrl → [dstUrl]` | Bigtable | Web-graph edges for ranking (PageRank) & crawl prioritization |

**Why a Bloom filter for seen-URLs?** A 30 B-entry hash set of full URLs is tens of TB of
RAM. A Bloom filter holds the same membership test in a few **tens of GB** with a tunable,
tiny false-positive rate — and a false positive only means we *occasionally skip* a new URL,
which is acceptable (Bloom filter sizing — **Ch 24**).

## 6.6 HLD — scaling & bottlenecks

- **Shard the frontier by host.** Assign each domain (by `hash(host)`) to a frontier shard +
  fetcher pool, so **all politeness state for a host lives in one place** — you can't enforce
  "1 req/1.5 s to site.com" if two machines crawl it independently.
- **Politeness is the throughput ceiling, not bandwidth.** A big site can absorb more; a
  small blog cannot. **Adaptive rate** = base delay scaled by the host's observed latency and
  HTTP 429/503 signals.
- **DNS is a hidden bottleneck** → cache aggressively; pre-resolve; run your own resolvers.
- **Hot domains** (a few huge sites = a big share of the web) get **dedicated** fetcher pools
  so they don't starve the long tail.
- **Bloom filter growth** → size for 30 B+ up front, or use a **scalable/partitioned Bloom**
  per shard; periodically compact the backing KV.

## 6.7 HLD — failure modes & trade-offs

```
  What dies / goes wrong         →  What we do
  ──────────────────────────────────────────────────────────────────
  Fetcher worker crashes         →  its in-flight URL is re-leased from the
                                    frontier after a visibility timeout
  Frontier shard lost            →  rebuild from durable queue + crawl-meta;
                                    only that host-range pauses
  Crawler trap (infinite URLs,   →  per-domain URL-count cap, max depth, URL
   calendars, faceted search)      pattern/length limits, trap heuristics
  A site returns 429/503         →  exponential backoff for that host; lower
                                    its rate; respect Retry-After
  Bloom false positive           →  a genuinely new URL is skipped (rare,
                                    acceptable) — we tune p low
  Poison page (giant / malformed)→  size cap + parse timeout → quarantine
```
**Trade-offs called out:** we accept a **tiny false-negative** rate on URL discovery
(Bloom) to make the seen-set fit in RAM. We accept **eventual completeness** — the web is
infinite and changing, so "done" is never true; we optimize **coverage per unit of crawl
budget**. We prioritize **politeness over speed** because being banned by sites is the worst
outcome for a crawler.

## 6.8 LLD (the crux) — the URL frontier (politeness + priority)

The frontier must satisfy **two goals that fight each other**: (1) fetch **high-value URLs
first** (priority), and (2) **never hit one host too fast** (politeness). The classic
solution (Mercator-style) is a **two-stage queue system**: *front queues* sort by priority,
*back queues* enforce per-host politeness.

```
   New URL ─▶ [ Prioritizer ]  score by importance (PageRank-ish,
                  │             freshness need, depth, source)
                  ▼
        ┌──────── FRONT QUEUES (by priority) ────────┐
        │  F1 (highest) │ F2 │ F3 │ ... │ Fn (lowest) │
        └──────┬─────────────────────────────────────┘
               │  a biased picker pulls more from high-priority
               ▼
        ┌──────── BACK QUEUES (one per active host) ──┐
        │  B[siteA] │ B[siteB] │ B[siteC] │ ...        │
        │  FIFO per host; a host maps to exactly ONE   │
        └──────┬───────────────────────────────────────┘
               │
               ▼
        ┌──────────────────────────────────────────────┐
        │  HOST HEAP (min-heap by nextFetchTime)        │
        │  (siteB, t=10:00:01) (siteA, t=10:00:02) ...  │
        └──────┬───────────────────────────────────────┘
               ▼
        Fetcher pops the host whose nextFetchTime ≤ now,
        fetches one URL from its back queue, then sets
        nextFetchTime = now + politenessDelay(host)
```

**How the two layers cooperate (pseudocode):**
```
  // Enqueue: priority decides the FRONT queue.
  function enqueue(url):
      if bloom.contains(url): return        // already seen → drop
      bloom.add(url)
      p = priority(url)                      // 1..n (importance/freshness)
      frontQueue[p].push(url)

  // Router: move URLs from front → the right per-host back queue.
  function routeToBackQueues():
      while someBackQueueIsHungry():
          url  = pickBiasedByPriority(frontQueue)   // favor F1>F2>...
          host = hostOf(url)
          backQueue[host].push(url)
          if host not in hostHeap:
              hostHeap.push(host, nextFetchTime = now)

  // Fetch loop: politeness via the host heap.
  function nextURLToFetch():
      host = hostHeap.peekMinByTime()
      if host.nextFetchTime > now:
          sleepUntil(host.nextFetchTime)     // be polite
      url  = backQueue[host].pop()
      host.nextFetchTime = now + delay(host) // e.g. 1.5 s, adaptive
      hostHeap.update(host)
      if backQueue[host].isEmpty():
          backQueue.remove(host); hostHeap.remove(host)
      return url
```

**Why this shape works:**
- **Front queues** capture *what matters* — a news homepage outranks a deep, stale forum
  page. The biased picker spends most fetches on high priority but still drains low priority
  (no starvation).
- **Back queues** guarantee *one FIFO stream per host*, so a host is never fetched by two
  workers at once — the precondition for honoring a rate limit.
- **The host heap** is the politeness clock: it always yields the host that is **allowed to
  be fetched next**, so thousands of fetchers stay busy across **different** hosts while each
  individual host is sipped slowly.

**Bloom-filter dedupe (the companion crux).** Before any URL enters the frontier it must
pass the seen-set test. With `n = 30 B` URLs and a target false-positive rate `p = 1%`, the
Bloom filter needs about `m = -n·ln p / (ln2)² ≈ 9.6 bits/element` → ~**36 GB** with ~7 hash
functions — versus *terabytes* for a literal hash set. A false positive means "we think we
saw a new URL" → we skip it; harmless at the margin. (Sizing math — **Ch 24**.)

**Content dedupe with sim-hash.** Exact hashing can't catch *near*-duplicates (same article,
different ad). **Sim-hash** maps a page to a 64-bit fingerprint where **similar pages have
small Hamming distance**; two pages within distance ~3 are treated as duplicates and only one
is indexed. This is what stops a search index from being 30 % mirror spam.

## 6.9 Follow-ups, red flags & building blocks

**Likely follow-ups (with crisp answers):**
- *"How do you re-crawl for freshness?"* — store each URL's **change history**; schedule
  `nextDue` adaptively (a page that changes hourly is re-crawled hourly; a static one
  monthly). Use **conditional GET** (ETag/If-Modified-Since) so unchanged pages cost a 304.
- *"JavaScript-heavy pages?"* — route them to a **headless-render** pool; far more expensive,
  so gate it (only when raw HTML is too thin).
- *"Distributed coordination?"* — partition by **host hash**; each partition owns its
  frontier + Bloom shard; URLs discovered elsewhere are forwarded to the owning partition.
- *"Politeness vs speed?"* — adaptive per-host delay driven by latency and 429/503; never a
  single global RPS.

**Red flags that sink candidates:** a single global FIFO queue (no priority, no politeness);
ignoring `robots.txt`; a literal hash set for seen-URLs (won't fit); no DNS/robots caching
(those round-trips dominate); no trap defense (infinite calendar URLs eat the crawler); only
exact-dup detection (mirrors flood the index); a stateless frontier that can't resume after a
crash.

**Building blocks reused (theory lives elsewhere):** **Bloom filters** and sizing —
**Ch 24**; **durable queues** / visibility-timeout leasing and **consistent hashing** for
host partitioning — **Ch 24**; **object storage** for raw HTML and **wide-column**
crawl-metadata — **Ch 24** (*Storage*); **caching** (DNS, robots) — **Ch 23**; the
downstream **inverted index** — **Ch 25** (*Full-text search*).

# CASE STUDY 7 — PROXIMITY / NEARBY (Maps, Yelp, "nearby friends")

> **Google priority:** ★★★ · **Difficulty:** Hard · **Frequency:** Very common · **Time budget:** ~40 min

> **User story —** *As a* user, *I want* to find things "near me" — coffee shops within 2 km, or
> which friends are close — *so that* I get instant local results without the app scanning every
> place on Earth.
>
> **For example —** I search "coffee within 2 km" in Manhattan; the system reads my S2/geohash
> cell plus its 8 neighbors and returns the ~30 nearby shops in milliseconds, not by computing
> distance to 200 M rows.
>
> **Why it matters —** "nearby" needs a spatial index (geohash / quadtree / S2), not a `WHERE`
> scan — choosing and tuning that index is the entire problem.

"Show me coffee shops **within 2 km**." "Which of my friends are **nearby**?" These are
**proximity search** problems, and they all reduce to one question: *given a point on Earth
and a radius, return the items inside the circle — fast, without scanning all 200 million
rows.* The naïve approach (compute the distance from me to **every** place and sort) is
O(N) per query and dies instantly at scale. The entire game is the **geo-index**: a way to
turn 2-D coordinates into something a database can range-scan. This case study is really a
deep dive on three geo-indexing schemes — **geohash**, **quadtree**, and Google's **S2
cells** — and when to use each. (Ch 25 listed these in a table; here we draw them and work
a radius query end to end.)

## 7.0 What's really being tested

- Do you know that "nearby" needs a **spatial index**, not a `WHERE` scan or naïve distance?
- Can you **explain and contrast** geohash vs quadtree vs S2 — with their failure modes
  (boundary problem, density skew, the "two close points, different cells" trap)?
- Can you turn **"within R km"** into a concrete **cell + neighbors** lookup?
- Do you handle **dense vs sparse** areas (Times Square vs Wyoming) without one index that's
  either too coarse or too deep everywhere?
- Do you pick the **right store** (Redis GEO / sorted set, PostGIS, an in-memory grid)?

## 7.1 Clarify — requirements

**Functional**
- **Search:** given `(lat, lng, radius)` (or a viewport), return matching places, optionally
  filtered (cuisine, open-now) and sorted by distance.
- **Write:** add / update / remove a place; for "nearby friends," update a **moving** point
  frequently.
- (Variant) Return **top-K nearest** even if sparse (k-NN), not only "within R."

**Out of scope** (say it): turn-by-turn **routing** / road graph (a different problem); the
ranking/recommendation model; the map tiles themselves.

**Non-functional**
- **Latency:** p99 < 100–200 ms for a radius query.
- **Scale (static places):** ~200 M places, read-heavy, writes rare → **Yelp/Maps** profile.
- **Scale (moving dots):** millions of points updating every few seconds → **"nearby
  friends" / ride-hailing** profile (this case sets up Case Study 8).
- **Accuracy:** results must be correct near **cell boundaries** (the classic bug).

**Questions to ask:** *Static places or moving users? Fixed radius or "k nearest"? How dense
can a region get? Read:write ratio? Do we need exact distance ordering or is cell-level good
enough? Global, so we must handle the poles / antimeridian?*

## 7.2 Estimate — back-of-envelope

```
   Places (static, Yelp-like)   200,000,000
   Nearby queries / day         1,000,000,000 (1 B)
   Avg QPS                      1e9 / 86,400 ≈ 11,600 / s ; peak 3× ≈ 35k/s
   Per place record             ~1 KB (name, geo, tags) → 200 GB metadata
   Moving variant (friends):    50 M users × update / 10 s
       location writes          50e6 / 10 ≈ 5,000,000 writes / s  (!)
       → last-write-wins per user, in-memory grid, NOT a disk DB per write
```

**What the numbers teach:** for **static places**, reads dominate and a precomputed geo-index
in a database (or Redis GEO) is plenty. For **moving dots**, the **write rate explodes**
(millions/sec) — you cannot durably persist every GPS ping; you keep the latest position in
an **in-memory grid** with last-write-wins, and only checkpoint occasionally. That split
(static index vs live grid) is the senior insight here.

## Whiteboard rehearsal — how you'd actually draw this live

In the room you don't reproduce the polished diagram in §7.3 below — you sketch rough
boxes and talk. So **rehearse from this first**: here is the same architecture as a **live
whiteboard sketch**, in the shorthand you'd actually use on a Google whiteboard. The colour
code is the one most candidates settle into:

> **green = client · grey = edge/LB · blue = service · red = datastore · orange = queue / stream · violet = 3rd-party**

![Proximity / Nearby (Maps / Yelp) — whiteboard rehearsal sketch](diagrams/proximity_whiteboard.svg)

**Why rehearse from the sketch, not the clean diagram?** The polished SVG in §7.3 is for
*reading*; this one is for *rehearsing*. Practise reproducing it from memory in ~4 minutes while
narrating every box out loud — that muscle memory is exactly what the interview tests. It is the
*same* components as the clean §7.3 diagram, only drawn in the loose, name-the-tool style
your hand can produce under pressure: every box names a concrete technology, each datastore is
called out in red, queues in orange, third-party vendors in violet. That visual discipline is
the signal an interviewer is looking for.

## 7.3 HLD — high-level architecture

![Proximity / Nearby (Maps / Yelp) — high-level architecture (HLD)](diagrams/proximity.svg)

**Legend:** the left column serves **static places**; the right column serves **moving
users**. They share the same **cell** math but use different stores (durable index vs RAM
grid).

**Block-by-block:**
- **Search service** — converts a query circle into a **set of cell ids**, fetches candidate
  ids from the geo-index, then does the **exact** distance filter + sort in memory (cells are
  an over-approximation; you always refine).
- **Location-ingest service** — only in the moving-dots variant; swallows millions of GPS
  pings/sec and keeps **only the latest** position per user (last-write-wins).
- **Geo-index** — `cellId → [placeIds]`; the data structure under it is geohash, quadtree, or
  S2 (the crux, §7.8). For static data, Redis GEO or PostGIS is the usual store.
- **In-memory location grid** — `cellId → {user → position}` held in sharded RAM; this is how
  you answer "who's near me?" without a disk write per ping.
- **Place store** — boring metadata (name, hours), fetched after the geo-index narrows the
  candidate set to a few dozen ids.

## 7.4 HLD — critical path walkthrough

"Coffee within 2 km of me," using a cell-based index:
```
  1. App → GET /nearby?lat=37.421&lng=-122.084&r=2km&tag=coffee
  2. Search service picks the cell PRECISION whose cell size ≳ 2 km
     (so the radius spans only a handful of cells) and computes:
        myCell      = encode(lat, lng, precision)
        searchCells = {myCell} ∪ neighbors(myCell)   // 3×3 block
  3. For each cell, geo-index lookup: cellId → [placeIds]
        union the candidate place ids  (an OVER-approximation)
  4. Fetch place metadata for candidates from the Place store
  5. EXACT filter: haversine(me, place) ≤ 2 km  AND  tag == coffee
        (cells are squares/regions; the circle is the real boundary)
  6. Sort by true distance, take top N, return with distances
```
The key idea is **steps 2–3 are cheap and approximate** (range-scan a few cells), and
**steps 5–6 are exact but operate on a tiny candidate set**. You never compute distance to
200 M places — only to the few dozen in the neighboring cells.

## 7.5 HLD — data model & storage choices

| Entity | Shape (key fields) | Store | Why |
|--------|--------------------|-------|-----|
| Place | `placeId → name, lat, lng, tags, hours` | Postgres / KV | Durable metadata, point reads |
| Geo-index (static) | `cellId → [placeId]` | Redis GEO / PostGIS / sorted set | Range-scan cells fast |
| Live location (moving) | `cellId → {userId→(lat,lng,ts)}` | In-memory grid (Redis/RAM) | Millions of writes/s, LWW, TTL |
| User→cell map | `userId → cellId` | Redis | O(1) "which cell is this user in now" |
| Cell stats (density) | `cellId → count` | Redis/KV | Adaptive precision, surge (Case 8) |

**Redis GEO** stores points in a **sorted set** scored by their **geohash integer**, so
`GEOSEARCH ... BYRADIUS` is a sorted-set range scan + distance filter — exactly the pattern
above, batteries included.

## 7.6 HLD — scaling & bottlenecks

- **Shard the index by region/cell-prefix.** Geohash/S2 give you a 1-D key, so you can shard
  on the cell-id prefix and keep nearby places **co-located** (good for range scans).
- **Density skew is the core problem.** A fixed cell size is wrong everywhere: in Manhattan a
  600 m cell holds 10,000 places; in rural Montana it holds 2. **Quadtree / S2** solve this by
  **adaptively subdividing** dense regions deeper (more detail where it's crowded) — see §7.8.
- **Hot cells** (a stadium during a game) → cap results per cell, paginate, and for the moving
  variant **shard the cell across nodes**.
- **Moving dots** → the bottleneck is **write QPS**, not query; absorb pings in the in-memory
  grid (last-write-wins), expire stale entries with a TTL, checkpoint asynchronously.
- **Boundary correctness** → always query the **center cell + its 8 neighbors**, then refine
  with exact distance, or two points 10 m apart across a cell line would be "not nearby."

## 7.7 HLD — failure modes & trade-offs

```
  What dies / goes wrong       →  What we do
  ──────────────────────────────────────────────────────────────────
  Cell boundary miss           →  ALWAYS search neighbors + exact-distance
                                  refine (never trust a single cell)
  Dense cell (stadium)         →  adaptive split (quadtree/S2) or per-cell
                                  result cap + pagination
  In-memory grid node lost     →  positions are ephemeral; users re-ping
   (moving variant)              within seconds; restore from checkpoint
  Geo-index shard down         →  that region degrades; other regions fine;
                                  read from a replica
  Antimeridian / poles         →  use S2 (sphere-native) or special-case the
                                  ±180° wrap; geohash distorts near poles
```
**Trade-offs called out:** **geohash** is dead simple and DB-friendly but has the
**boundary discontinuity** (adjacent areas can have very different prefixes) and **distorts
near the poles**; **quadtree** adapts to density but is a tree you must hold/operate; **S2**
is the most correct (spherical, hierarchical, great neighbor math) but is conceptually
heavier. For moving dots we trade **durability for speed** (positions live in RAM, lost on
crash, re-sent in seconds).

## 7.8 LLD (the crux) — geohash vs quadtree vs S2, and the radius search

**Geohash — interleave bits of lat/lng, base-32 encode → a string prefix = an area.**
Each added character refines the rectangle ~32× (Ch 25 has the precision table). Shared
**prefix length ≈ proximity**: "9q9p1" and "9q9p2" are neighbors.
```
  Geohash idea: recursively halve the world; bit=which half.
   lng:  [-180 .. 0 .. +180]   lat: [-90 .. 0 .. +90]
   interleave  lng,lat,lng,lat...  → 11010 ... → base32 → "9q9hvu"

   precision (chars) → cell size:
     4 → ~39 km    5 → ~4.9 km    6 → ~1.2 km    7 → ~153 m

   Grid (precision 5), my cell = center; search a radius by
   also scanning the 8 NEIGHBORS (the boundary fix):

         ┌──────┬──────┬──────┐
         │ 9q8  │ 9q9  │ 9qc  │   each box = one geohash cell
         ├──────┼──────┼──────┤   query circle (•=me, r) can spill
         │ 9q2  │ 9q3• │ 9q6  │   into any of the 8 neighbors, so we
         ├──────┼──────┼──────┤   union all 9 cells, THEN filter by
         │ 9q0  │ 9q1  │ 9q4  │   exact haversine distance ≤ r
         └──────┴──────┴──────┘
```
*Geohash gotcha:* two points can be **very close yet share no prefix** if they straddle a
major boundary (e.g. the equator/prime-meridian split) — which is exactly why you must always
search neighbors and refine, never rely on prefix alone.

**Quadtree — recursively split a square into 4 quadrants, but only where it's dense.**
```
   A quadtree adapts to density: split a node into NW NE SW SE only
   when it holds > capacity points. Sparse areas stay shallow.

      whole map (root)
        split (too many)
      ┌────────┬────────┐
      │  NW    │  NE     │   NE is dense → split again:
      │ (few)  │  ┌──┬──┐ │      ┌──┬──┐
      ├────────┤  │  │  │ │      │  │  │   each leaf holds ≤ capacity
      │  SW    │  ├──┼──┤ │      └──┴──┘   points; deep where crowded,
      │ (few)  │  │  │  │ │                shallow where empty
      └────────┴──└──┴──┘─┘
```
Query: descend to the leaf containing the point, collect that leaf and **adjacent leaves**
within the radius. *Adaptivity is the win* — Times Square gets deep, tiny cells; the ocean
stays one big cell — so each leaf returns a bounded candidate count.

**Google S2 — project the sphere onto a cube, Hilbert-curve each face → 64-bit cell ids.**
S2 is **hierarchical** (30 levels, ~1 cm² to whole-Earth) and **sphere-native** (no pole
distortion), and because it uses a **Hilbert curve**, nearby cells have nearby 64-bit ids
(great for range-sharding) and **neighbor enumeration is cheap**.
```
   Earth → cube (6 faces) → each face recursively quartered →
   ordered by a Hilbert space-filling curve so that
   "close on Earth" ≈ "close in the 64-bit id space".

   level ~12 ≈ 3 km cell ... level ~16 ≈ 150 m cell.
   A radius query = a small SET of S2 cells that COVER the circle
   (s2.RegionCoverer) — then exact-distance refine.
```

**The unified radius-search algorithm (works for all three):**
```
  function nearby(lat, lng, r, k):
      level  = pickLevel(r)               // cell size ≳ r → few cells
      center = encode(lat, lng, level)    // geohash/quadtree-leaf/S2 id
      cells  = {center} ∪ neighbors(center)        // cover the circle
      cand   = []
      for c in cells:
          cand += index.lookup(c)         // candidate ids in each cell
      cand = [p for p in cand if haversine(p, (lat,lng)) <= r]  // refine
      return topK(cand, by=distance, k)   // exact order on small set
```

| Property | Geohash | Quadtree | S2 |
|----------|---------|----------|----|
| Adapts to density | ✗ (fixed grid) | ✓ (split where dense) | ✓ (choose level) |
| Pole / sphere correct | ✗ distorts | ✗ (planar) | ✓ sphere-native |
| Neighbor math | prefix tricks | tree walk | cheap (built-in) |
| Store-friendly key | ✓ string prefix | needs tree | ✓ 64-bit, range-shards |
| Simplicity | **simplest** | medium | most complex |
| Used by | Redis GEO, Elastic | Maps, Uber (early) | Google Maps, Foursquare |

**Pick:** geohash when you want the **simplest** thing on Redis/SQL and density is uniform;
**quadtree** when density varies wildly and you control the index; **S2** at global scale
where correctness near poles/antimeridian and clean sharding matter (it's why Google uses it).

## 7.9 Follow-ups, red flags & building blocks

**Likely follow-ups (with crisp answers):**
- *"k-NN instead of fixed radius?"* — start at a small cell, **expand the ring** of cells
  outward until you have ≥ k candidates, then exact-sort (don't pick a giant radius upfront).
- *"Dense areas?"* — adaptive index (quadtree/S2 level) + per-cell caps + pagination.
- *"Moving objects (friends/drivers)?"* — in-memory grid with **last-write-wins** and a TTL;
  this is the bridge to **ride-hailing (Case Study 8)**.
- *"Why not just PostGIS `ST_DWithin`?"* — totally valid up to mid-scale; it uses an **R-tree
  (GiST)** index under the hood. At extreme write rates (moving dots) you outgrow it and move
  to the in-memory grid.

**Red flags that sink candidates:** computing distance to **every** place (O(N)); using a
single fixed cell size and ignoring density; **forgetting neighbor cells** (boundary bug);
no exact-distance refine after the cell lookup; trying to **durably persist** every GPS ping;
ignoring the antimeridian/poles at global scale.

**Building blocks reused (theory lives elsewhere):** **geo-indexes** (geohash/quadtree/R-tree/
S2/H3) and the **geohash precision table** — **Ch 25** (*Geo-spatial indexes*); **Redis** GEO /
sorted sets — **Ch 23**; **PostGIS / GiST** spatial indexes — **Ch 24** (*Specialised
stores*); **sharding by key prefix** and **consistent hashing** — **Ch 24**.

# CASE STUDY 8 — RIDE-HAILING (Uber / Lyft)

> **Google priority:** ★★★ · **Difficulty:** Hard · **Frequency:** Very common · **Time budget:** ~45 min

> **User story —** *As a* rider, *I want* one tap to summon the nearest available driver and never
> have two riders promised the same car, *so that* I get picked up quickly and reliably.
>
> **For example —** I request a ride; the system finds available drivers in my cell, offers the
> best-ETA one, and **atomically claims** that driver for 15 s so a simultaneous request can't
> grab the same person.
>
> **Why it matters —** it's Case Study 7's moving-dots geo problem plus a real-time matcher whose
> crux is the atomic claim — the guarantee of no double-dispatch.

Tap "request ride," and within seconds a nearby driver's phone buzzes with your trip. Under
the hood: **millions of drivers stream their GPS location continuously**, and when a rider
asks, the system must **find nearby available drivers, pick one, and hand the trip to exactly
that driver** — never double-booking a driver, never showing a car that's already taken. It is
**Case Study 7's geo problem (moving dots) plus a real-time matching/dispatch engine plus a
trip state machine plus surge pricing**. The crux is **matching without double-dispatch**: two
riders must not both be promised the same driver.

> Builds directly on **Case Study 7** — the in-memory location grid and cell math there are
> the substrate here. We focus on what ride-hailing adds: **dispatch and atomic claim**.

## 8.0 What's really being tested

- Can you ingest a **firehose of location updates** (millions/sec) without a DB write per ping?
- Can you do **real-time matching** — nearby + available drivers — on live, moving data?
- Can you guarantee **no double-dispatch** (the concurrency crux): one driver, one trip?
- Do you model the **trip lifecycle** as an explicit **state machine** with valid transitions?
- Do you handle **surge** (supply/demand per area) and **ETA** as derived signals?

## 8.1 Clarify — requirements

**Functional**
- Drivers **publish location** every few seconds; riders **request a ride** at a pickup point.
- **Match** a rider to a nearby available driver; the driver **accepts/declines**; on accept,
  the trip is **locked** to that pair.
- Track the **trip** through its lifecycle (requested → matched → en route → ongoing → done).
- **Surge pricing** when demand outstrips supply in an area; **ETA** for pickup/arrival.

**Out of scope** (say it): payments/wallet (idempotency, ledger — see Ch 37 *Payments*); the
turn-by-turn **routing engine** (consume it as a service); driver onboarding; fraud.

**Non-functional**
- **Latency:** match within **2–5 s**; location updates near real-time.
- **Scale:** ~5 M active drivers, location every ~4 s; millions of concurrent riders.
- **Consistency:** **a driver is dispatched to at most one trip** — this must be *strong*
  locally, even though location data is eventually consistent.
- **Availability:** city-isolated; one region's outage must not stop another's.

**Questions to ask:** *How often do drivers ping? Match nearest or optimize globally (ETA,
fairness)? How long does a driver have to accept? Pool/shared rides? Surge granularity (per
cell, per city)? What's the dispatch SLA?*

## 8.2 Estimate — back-of-envelope

```
   Active drivers              5,000,000
   Location update interval    every 4 s
   ── location write QPS       5e6 / 4 ≈ 1,250,000 writes / s
   Peak (rush hour, 2×)        ≈ 2,500,000 writes / s
       → in-memory grid, last-write-wins; NO disk write per ping
   Ride requests / day         ~30,000,000
   ── match QPS                3e7 / 86,400 ≈ 350 / s ; peak ≈ 1,500 / s
   Live position record        ~40 B (driverId, lat, lng, ts, state)
   All live positions in RAM   5e6 × 40 B ≈ 200 MB  → trivially fits
   Trip records (durable)      30 M/day × 1 KB ≈ 30 GB/day → DB + archive
```

**What the numbers teach:** the asymmetry is everything. **Writes (location) are ~1M+/sec**
but **disposable** → keep them in RAM with last-write-wins. **Matches are only ~hundreds/sec**
but **must be perfectly consistent** (no double-dispatch). So we spend our consistency budget
on the *small* match path and keep the *huge* location path cheap and eventually consistent.

## Whiteboard rehearsal — how you'd actually draw this live

In the room you don't reproduce the polished diagram in §8.3 below — you sketch rough
boxes and talk. So **rehearse from this first**: here is the same architecture as a **live
whiteboard sketch**, in the shorthand you'd actually use on a Google whiteboard. The colour
code is the one most candidates settle into:

> **green = client · grey = edge/LB · blue = service · red = datastore · orange = queue / stream · violet = 3rd-party**

![Ride-Hailing (Uber / Lyft) — whiteboard rehearsal sketch](diagrams/ride_hailing_whiteboard.svg)

**Why rehearse from the sketch, not the clean diagram?** The polished SVG in §8.3 is for
*reading*; this one is for *rehearsing*. Practise reproducing it from memory in ~4 minutes while
narrating every box out loud — that muscle memory is exactly what the interview tests. It is the
*same* components as the clean §8.3 diagram, only drawn in the loose, name-the-tool style
your hand can produce under pressure: every box names a concrete technology, each datastore is
called out in red, queues in orange, third-party vendors in violet. That visual discipline is
the signal an interviewer is looking for.

## 8.3 HLD — high-level architecture

![Ride-Hailing (Uber / Lyft) — high-level architecture (HLD)](diagrams/ride_hailing.svg)

**Legend:** WebSocket gateway keeps driver connections open so dispatch is a **push**, not a
poll. Layer 3 is **RAM**; Layer 4 is **durable**.

**Block-by-block:**
- **WebSocket gateway** — drivers hold a persistent connection (Ch 35 *Chat* covers the
  pattern) so the server can **push** a trip offer in milliseconds and receive accept/decline.
- **Location-ingest service** — absorbs ~1M+ pings/sec, writes each driver's **latest**
  position into the grid cell (and moves them between cells when they cross a boundary).
- **Dispatch / Matching service** — the brain: nearby-search the grid, rank candidates, and
  perform the **atomic claim** so a driver can't be offered to two riders (the crux, §8.8).
- **In-memory location grid** — the Case Study 7 structure: `cellId → drivers`, last-write-
  wins, TTL'd so a driver who stops pinging ages out.
- **Driver availability + claim lock (Redis)** — the Matching service keeps each driver's
  availability and the **atomic claim lock** in Redis (the same in-RAM tier as the geo grid);
  `driverId → {status, currentTripId}` + `driver:d:lock`. This is what prevents double-dispatch (§8.8).
- **Trip store + surge + Kafka** — durable trip FSM, per-cell surge multiplier, and an event
  bus that feeds ETA, analytics, payments, and notifications asynchronously.

## 8.4 HLD — critical path walkthrough

Rider requests a ride; we match without double-dispatch:
```
  1. Rider → POST /rides {pickup:(lat,lng), dest}
  2. Matching svc computes pickup cell + neighbors (Case 7 radius
     search) → candidate drivers from the GRID where avail==true
  3. Rank candidates by ETA (distance + live traffic), fairness,
     driver rating → ordered list [d1, d2, d3, ...]
  4. Try to CLAIM d1 atomically (Redis):
        SET driver:d1:lock = tripId  NX EX 15
        ├─ FAIL (already locked) → skip to d2
        └─ OK  → d1 is reserved for THIS trip for 15 s
  5. Push offer to d1 over WebSocket; start a 15 s timer
        ├─ d1 ACCEPTS  → trip state requested→matched; persist;
        │                 mark d1 unavailable; emit trip.matched
        ├─ d1 DECLINES → release lock (DEL driver:d1:lock) → try d2
        └─ TIMEOUT     → lock auto-expires (EX 15) → try d2
  6. Trip proceeds through the state machine (§8.8); location of the
     matched driver streams to the rider until drop-off
```
The double-dispatch guarantee lives in **step 4**: the **atomic `SET ... NX`** means only the
first request to claim `d1` wins; everyone else sees the lock and moves on. The **`EX 15`
TTL** ensures a crashed dispatcher can't lock a driver forever.

## 8.5 HLD — data model & storage choices

| Entity | Shape (key fields) | Store | Why |
|--------|--------------------|-------|-----|
| Live location | `cellId → {driverId→(lat,lng,ts,avail)}` | In-memory grid (Redis/RAM) | ~1M writes/s, LWW, ephemeral |
| Driver state / lock | `driverId → {status, currentTripId}` + `driver:d:lock` | Redis (atomic) | Single source of availability + the claim lock |
| Trip | `tripId → state, rider, driver, ts, route` | Cassandra / Spanner (Trip DB) | Durable, queryable trip history; Spanner gives strong consistency for money-adjacent state |
| Surge | `cellId → multiplier, updatedAt` | Redis / KV | Hot reads at request time; recomputed often |
| Trip events | `trip.* append` | Kafka → warehouse | Feeds ETA, analytics, payments, notifications |

**Why split RAM grid from durable trip store?** Location is **high-volume, low-value, and
ephemeral** (RAM, lose-on-crash is fine — drivers re-ping in seconds). A **trip** is
**low-volume, high-value** (it bills money) → strongly consistent durable store.

## 8.6 HLD — scaling & bottlenecks

- **Shard by city / geo region.** Dispatch is inherently **local** — a rider in Tokyo is never
  matched to a driver in Berlin — so partition the whole stack by city/region; each shard is an
  independent, smaller problem (and a city outage is isolated).
- **Location write firehose** → in-memory grid, **last-write-wins**, batch/coalesce updates;
  never one durable write per ping. Move a driver between cells only when they cross a boundary.
- **Hot cells** (airport, stadium at closing time) → the grid cell is the unit of contention;
  shard a hot cell across nodes and **cap candidates considered** per match.
- **Dispatch contention** → the per-driver lock is O(1) in Redis; the match itself is cheap
  (hundreds/sec). The scaling worry is the **location** path, not the **match** path.
- **Surge** is a streaming aggregation: per cell, `multiplier = f(open_requests / avail_drivers)`
  updated every few seconds (heavy-hitters / windowed counts — Ch 24 *stream processing*).

## 8.7 HLD — failure modes & trade-offs

```
  What dies / goes wrong       →  What we do
  ──────────────────────────────────────────────────────────────────
  Dispatcher crashes mid-claim  →  lock has EX 15 TTL → auto-releases →
                                   driver becomes claimable again
  Driver accepts but app dies   →  trip FSM timeout → reassign; lock TTL
  Two riders, one driver        →  IMPOSSIBLE: atomic SET NX → one winner
  Grid node lost                →  positions are ephemeral; drivers re-ping
                                   within seconds; only that cell-range blips
  Location lag (stale position) →  bounded by ping interval; ETA recomputed;
                                   driver shown slightly behind real spot
  Redis (lock store) down       →  city dispatch pauses (fail-CLOSED:
                                   better to delay than double-book)
```
**Trade-offs called out:** we deliberately make **location eventually consistent** (RAM, LWW,
lossy) but **dispatch strongly consistent** (atomic lock, fail-closed). We accept showing a
driver's position a few seconds stale. We **shard by city** for isolation at the cost of
cross-city features (rare). For dispatch we choose **C over A** locally (PACELC — Ch 24): if
the lock store is unreachable we'd rather **pause** matching than risk a double-booking.

## 8.8 LLD (the crux) — matching + the atomic claim (no double-dispatch)

The defining hazard: a popular driver `d1` sits at the top of **two** riders' candidate lists
at the same instant. Without coordination, both dispatchers offer the trip to `d1` → one rider
gets ghosted, or `d1` gets two trips. The fix is a **single atomic claim** that exactly one
dispatcher can win.

**The claim — one Redis round-trip, atomic, self-healing:**
```
  // Reserve a driver for a trip. Returns true only for the winner.
  function claim(driverId, tripId):
      ok = REDIS.SET("driver:"+driverId+":lock", tripId,
                     NX = true,      // only if not already locked
                     EX = 15)        // auto-expire: crash-safe
      return ok == "OK"

  // Release explicitly on decline; the EX is the backstop.
  function release(driverId):
      REDIS.DEL("driver:"+driverId+":lock")
```

**The matching loop — walk the ranked candidates until one is claimed AND accepts:**
```
  function dispatch(trip):
      cells   = neighbors(cellOf(trip.pickup))      // Case 7 radius
      cand    = gridLookup(cells, avail=true)        // live drivers
      ranked  = sortBy(cand, key = etaThenScore(trip))
      for d in ranked:
          if not claim(d.id, trip.id):  continue     // someone else won d
          offer = pushOffer(d, trip)                 // WebSocket, 15 s
          if offer == ACCEPTED:
              markUnavailable(d.id)                  # leaves the pool
              trip.transition(REQUESTED → MATCHED)
              persist(trip); emit("trip.matched", trip)
              return d
          else:                                       # DECLINE or TIMEOUT
              release(d.id)                           # try the next driver
      trip.transition(REQUESTED → NO_DRIVERS)         # widen radius / retry
```

Why this is correct and live:
- **Correctness (no double-dispatch):** `SET NX` is atomic in Redis — for a given
  `driver:d1:lock` key, **only one** caller gets `"OK"`; concurrent claimers get `nil` and skip
  to the next candidate. One driver, one active offer.
- **Liveness (no permanent locks):** every lock carries `EX 15`, so a dispatcher that crashes
  after claiming but before offering can't freeze a driver — the lock evaporates and the driver
  is claimable again. A decline calls `release` immediately.
- **Fairness/ETA:** ranking happens **before** claiming, so we still try the *best* driver
  first; the lock only resolves *ties* and races.

**The trip state machine — explicit, validated transitions (the durable side):**
```
  REQUESTED ──match──▶ MATCHED ──driver arrives──▶ ARRIVED
      │  (no drivers / cancel)        │ (rider cancels)
      ▼                               ▼
   NO_DRIVERS / CANCELLED         CANCELLED
                                      ARRIVED ──start──▶ ON_TRIP
                                                            │ drop-off
                                                            ▼
                                                        COMPLETED ─▶ PAID
   Rule: every transition is whitelisted; an event that doesn't match
   the current state is rejected (no "complete" before "on_trip").
```
Modeling the trip as an explicit FSM (not a pile of booleans) is what makes cancellations,
timeouts, and reassignment **safe**: each event is only valid from specific states, so you
can't, say, bill a trip that was never started.

**Surge (derived, per cell):** every few seconds compute
`multiplier = clamp(open_requests(cell) / max(1, avail_drivers(cell)), 1.0, 3.0)` and cache it
per cell; the rider quote reads it at request time. It's a **supply/demand ratio**, not a
stored price — a streaming aggregation over the same grid.

## 8.9 Follow-ups, red flags & building blocks

**Likely follow-ups (with crisp answers):**
- *"What if no driver accepts?"* — widen the search radius (more cells), relax filters, or
  queue the request and retry; surface a "still looking" state to the rider.
- *"Pool / shared rides?"* — matching becomes an **online bin-packing / route-merge** problem:
  match a new rider to an in-progress trip whose route detour is small. Much harder; mention it.
- *"Global optimization vs greedy nearest?"* — greedy is fine at city scale; batch-matching
  (assign a *window* of requests to drivers via a min-cost assignment) improves ETA/fairness.
- *"ETA accuracy?"* — feed live traffic + historical speed into the routing service; recompute
  as the driver moves.

**Red flags that sink candidates:** writing every GPS ping to a database; **no atomic claim**
(the double-dispatch bug); locks with **no TTL** (a crash freezes a driver forever); a single
global grid (should be city-sharded); modeling the trip with ad-hoc booleans instead of a
**state machine**; making location data strongly consistent (needless cost) or making dispatch
eventually consistent (correctness bug).

**Building blocks reused (theory lives elsewhere):** the **in-memory geo grid** and
geohash/S2 cell math — **Case Study 7** and **Ch 25** (*Geo-spatial indexes*); **WebSockets /
persistent push** — **Ch 35** (*Chat*); **distributed locks** and the lease/TTL pattern, plus
**PACELC** consistency reasoning — **Ch 24**; **stream aggregation** for surge — **Ch 24**;
durable, idempotent **payments** downstream — **Ch 37** (*Payment system*).

# CASE STUDY 9 — NEWS FEED (Twitter / Facebook)

> **Google priority:** ★★★ · **Difficulty:** Hard · **Frequency:** Very common · **Time budget:** ~40 min

> **User story —** *As a* user, *I want* an infinitely-scrolling timeline of the people I follow,
> blended and ranked, that loads instantly, *so that* I always see fresh, relevant posts without
> waiting.
>
> **For example —** I open the app and my feed appears in one cache read; when someone I follow
> with 100 M followers posts, the system doesn't copy it into 100 M timelines — it's pulled in and
> merged when I scroll.
>
> **Why it matters —** the whole design is the **fan-out** decision: push for normal authors, pull
> for celebrities, hybrid in between — justified with follower-count arithmetic.

Open Twitter/X or Facebook and you see a **timeline**: the recent posts of everyone you
follow, blended and ranked, scrolling infinitely. Simple to describe, brutal at scale:
**you follow hundreds of accounts; some accounts have a hundred million followers.** When
such a celebrity posts, do you **immediately copy that post into 100 M timelines** (fast to
read, catastrophic to write), or **assemble each timeline on demand** (cheap to write, slow to
read)? The whole problem is this **fan-out** decision, and the senior answer is **"it depends
— hybrid, and here's the math."**

> **Ch 25 designed Instagram** (media-centric: upload, transcode, CDN). **Here we focus
> narrowly and deeply on timeline generation** — the push/pull/hybrid trade-off, the
> celebrity hot key, the feed cache, and ranking. We won't re-derive media storage.

## 9.0 What's really being tested

- Do you know **fan-out-on-write (push)** vs **fan-out-on-read (pull)** vs **hybrid**, and can
  you **justify the choice with follower-count arithmetic**?
- Do you spot the **celebrity / hot-key problem** and solve it (the reason pure push fails)?
- Do you design the **feed cache** (a per-user **Redis sorted set** scored by time/rank)?
- Do you handle **ranking** (not just reverse-chronological) and **pagination** (cursors)?
- Do you reason about **read:write asymmetry** (reads vastly outnumber writes)?

## 9.1 Clarify — requirements

**Functional**
- **Post:** a user publishes a short post (text + optional media ref).
- **Follow:** asymmetric (you follow them; they needn't follow back).
- **Timeline:** return a user's home feed — recent posts from followees, ranked, paginated.
- (Stretch) **Ranking** by relevance, not pure time; **read your own writes** immediately.

**Out of scope** (say it): media storage/transcoding (that's Instagram, Ch 25); DMs;
notifications (Ch 35); the recommendation model itself (consume its scores).

**Non-functional**
- **Read-heavy:** timeline reads ≫ posts (people scroll far more than they post).
- **Latency:** timeline p95 < 200 ms; feels instant.
- **Scale:** ~500 M DAU; **avg ~200 followers**, but **celebrities ~10⁸ followers**.
- **Freshness:** new posts appear within seconds; **eventual** is acceptable.

**Questions to ask:** *Reverse-chron or ranked? How fresh must it be? Read:write ratio?
Follower distribution (the long tail + the whales)? Do we guarantee read-your-own-writes?
How far back does the timeline go (retention)?*

## 9.2 Estimate — back-of-envelope

```
   DAU                         500,000,000
   Posts / user / day          ~0.2     → 100 M posts / day
   ── post (write) QPS          1e8 / 86,400 ≈ 1,160 / s ; peak ≈ 3,500/s
   Timeline reads / user / day  ~10      → 5 B reads / day
   ── read QPS                  5e9 / 86,400 ≈ 58,000 / s ; peak ≈ 175k/s
   Read : write ratio          ≈ 50 : 1   (reads dominate → precompute!)

   Fan-out cost of ONE post:
     avg user (200 followers)   → push 200 entries     (trivial)
     celebrity (100 M followers)→ push 100,000,000      (a "fan-out storm")
   Timeline cache: 500 M users × ~800 entries × ~16 B ≈ 6.4 TB in Redis
```

**What the numbers teach:** reads beat writes **~50:1**, so we want to **precompute timelines
(push)** to make the common read O(1). But a single celebrity post would push **100 million**
entries — one write becoming 100 M writes. That single fact kills pure push and **forces the
hybrid**: push for the masses, pull for the whales.

## Whiteboard rehearsal — how you'd actually draw this live

In the room you don't reproduce the polished diagram in §9.3 below — you sketch rough
boxes and talk. So **rehearse from this first**: here is the same architecture as a **live
whiteboard sketch**, in the shorthand you'd actually use on a Google whiteboard. The colour
code is the one most candidates settle into:

> **green = client · grey = edge/LB · blue = service · red = datastore · orange = queue / stream · violet = 3rd-party**

![News Feed (Twitter / Facebook) — whiteboard rehearsal sketch](diagrams/news_feed_whiteboard.svg)

**Why rehearse from the sketch, not the clean diagram?** The polished SVG in §9.3 is for
*reading*; this one is for *rehearsing*. Practise reproducing it from memory in ~4 minutes while
narrating every box out loud — that muscle memory is exactly what the interview tests. It is the
*same* components as the clean §9.3 diagram, only drawn in the loose, name-the-tool style
your hand can produce under pressure: every box names a concrete technology, each datastore is
called out in red, queues in orange, third-party vendors in violet. That visual discipline is
the signal an interviewer is looking for.

## 9.3 HLD — high-level architecture

![News Feed (Twitter / Facebook) — high-level architecture (HLD)](diagrams/news_feed.svg)

**Legend:** the **Fan-out service** decides push-vs-skip per post; the **Feed service**
merges pushed + pulled at read time. The **Timeline cache** is a **Redis sorted set** per user.

**Block-by-block:**
- **Tweet service** — persists the post (source of truth) and emits `tweet.created` to **Kafka**; returns to
  the author immediately (the fan-out is async).
- **Fan-out service / workers** — consume `post.created` and, **for normal authors**, push the
  `postId` into each follower's feed cache. **For celebrities, they skip the push** (that's the
  whole trick).
- **Realtime push (optional — reuses Ch 35, not a box here)** — in parallel with the (async)
  cache write, any follower who is **currently connected** can also get the new post pushed
  instantly over their open **WebSocket**, reusing the chat/presence gateway from **Ch 35
  (Case Study 2)**. The timeline-cache write is the system of record; live push is a latency
  optimization layered on top.
- **Feed (read) service** — on a feed request, read the user's **pushed** timeline cache, then
  **pull** recent posts from the **few** celebrities they follow, then a **Ranking Service**
  **merges + ranks + paginates**.
- **Timeline cache (Redis ZSET)** — per-user sorted set `postId → score` (score = timestamp or a
  ranking score), **capped** to ~800 entries so memory stays bounded.
- **Social graph (Cassandra)** — the follow edges (`followers`, `followees`), used to know who to push to and
  which celebrities to pull from.
- **Tweet store (Cassandra)** — write-heavy, time-ordered durable posts; the timeline holds
  ids, the post bodies are fetched here (or from cache).

## 9.4 HLD — critical path walkthrough

**Write (post) — hybrid fan-out decision:**
```
  1. Author → POST /tweets {text}
  2. Tweet svc: persist post (Cassandra), emit "tweet.created"
  3. Fan-out worker reads author's follower count:
        ├─ followers < THRESHOLD (e.g. 100k)  → PUSH:
        │     for each follower f:  ZADD feed:f  score  postId
        │     (trim feed:f to ~800 newest)
        └─ followers ≥ THRESHOLD  (celebrity)  → SKIP push;
              just keep it in the celeb's "recent posts" cache
  4. In parallel: for any follower ONLINE now, push the post over
     their open WebSocket via the Realtime Gateway (Ch 35, CS2)
```

**Read (timeline) — merge pushed + pulled:**
```
  1. User → GET /feed?cursor=...
  2. Timeline svc: A = ZREVRANGE feed:user 0..N        (pushed feed)
  3. celebs = followees(user) ∩ celebrity_set          (a few)
     B = for each celeb: read recent postIds from celeb cache
  4. MERGE A ∪ B → RANK (recency + affinity + engagement)
  5. Hydrate postIds → bodies (Tweet store / cache)
  6. Return page + next cursor (for infinite scroll)
```
The asymmetry is the design: **normal authors pay at write time** (cheap — 200 pushes) so the
**common read is O(1)** (just read your cache). **Celebrities pay nothing at write time** (no
100 M-entry storm); their **handful** of posts are **pulled and merged** by each reader — cheap
because you only follow a few celebrities, not thousands.

## 9.5 HLD — data model & storage choices

| Entity | Shape (key fields) | Store | Why |
|--------|--------------------|-------|-----|
| Tweet | `postId → authorId, text, mediaRef, ts` | Cassandra (Tweet Store) | Write-heavy, time-ordered, durable |
| Timeline cache | `userId → ZSET{postId:score}` (capped ~800) | Redis sorted set | O(log n) insert, O(1) top-N read |
| Follow graph | `user → [followers]`, `user → [followees]` | Cassandra (Social Graph) | Fan-out targets + celeb-pull list |
| Celeb recent | `celebId → [recent postIds]` | Redis | Pulled at read time; small, hot |
| Follower counts | `user → count` | KV (cached) | The push-vs-skip decision input |
| Ranking features | `(user,post) → signals` | Feature store | Re-rank merged candidates |

**Why a Redis sorted set for the feed?** `ZADD` inserts in O(log n) keyed by score (time or
rank), `ZREVRANGE` returns the top-N in O(log n + N), and `ZREMRANGEBYRANK` trims the set to a
cap — exactly the "ordered, bounded, fast top-N" shape a timeline needs.

## 9.6 HLD — scaling & bottlenecks

- **The celebrity hot key** is *the* bottleneck. Pure push turns one write into 10⁸ writes and
  hammers 10⁸ Redis keys → the **hybrid** (skip-push + pull-on-read) exists solely to defuse it.
- **Where to draw the push/pull line?** A threshold on follower count (e.g. push if < 100 k).
  Tune it: pushing to 100 k is fine; pushing to 100 M is not. Some systems push to *active*
  followers only (skip dormant accounts) to cut wasted fan-out.
- **Segment followers by state** (generalizes "push only to active followers" into a 4-way
  rule that decides who is worth a write):
  - **LIVE** (connected now) → real-time **WebSocket** push via the Realtime Gateway (Ch 35, CS2).
  - **ACTIVE** (recently active) → precompute: push the `postId` into their feed cache.
  - **PASSIVE** (dormant) → **skip** the fan-out write; rebuild lazily by **pull** on next visit.
  - **INACTIVE / soft-deleted** → skip entirely.
- **Fan-out is async + parallel** — workers consume `post.created` from Kafka and shard the
  follower list; a popular-but-not-celebrity post (say 80 k followers) is chunked across workers.
- **Read scaling** → the feed cache makes reads O(1); replicate Redis for read QPS; CDN/edge
  can cache the *rendered* feed page briefly for very active users.
- **Memory** → **cap** each feed to ~800 entries (nobody scrolls 5,000 posts); cold users' feeds
  can be evicted and lazily rebuilt by pull on next visit.

## 9.7 HLD — failure modes & trade-offs

```
  What dies / goes wrong       →  What we do
  ──────────────────────────────────────────────────────────────────
  Fan-out worker lag (spike)    →  posts queue in Kafka (durable); feeds
                                   lag a few seconds; nothing lost
  Timeline cache eviction       →  rebuild on read by PULL from followees
                                   (cache is an optimization, not truth)
  Celebrity posts (hot key)     →  hybrid: never pushed; pulled + merged;
                                   celeb cache is heavily replicated
  Tweet store node down         →  tunable quorum keeps reads/writes; ids
                                   in feed still resolve from replicas
  Read-your-own-writes miss     →  on read, UNION the user's own recent
                                   posts so they always see their new post
```
**Trade-offs called out:** we accept **eventual consistency** (your post reaches followers'
feeds in seconds, not instantly) to keep writes cheap. We accept **ranking ≠ strict time** for
relevance. The **hybrid adds complexity** (two code paths + a merge) but it is the only design
that serves both Joe Public and a megastar. The feed cache is **derived, disposable state** —
the post store is the source of truth.

## 9.8 LLD (the crux) — the hybrid fan-out decision (with the math)

The crux is choosing **push vs pull per author**, and proving it with numbers. Lay them
side by side:

```
  ┌──────────────── PUSH (fan-out on WRITE) ─────────────────┐
  │ On post: copy postId into EVERY follower's feed cache.    │
  │   write cost = O(followers)      read cost = O(1)         │
  │   ✔ great when followers are few (the 99% of users)       │
  │   ✘ catastrophic for a celebrity: 1 post → 10^8 writes    │
  └───────────────────────────────────────────────────────────┘
  ┌──────────────── PULL (fan-out on READ) ──────────────────┐
  │ On read: query recent posts from EVERY followee, merge.   │
  │   write cost = O(1)              read cost = O(followees)  │
  │   ✔ great for celebrities (their post is written once)    │
  │   ✘ slow timelines for users who follow thousands         │
  └───────────────────────────────────────────────────────────┘
  ┌──────────────── HYBRID (the real answer) ────────────────┐
  │ PUSH for normal authors (< threshold followers).          │
  │ SKIP push for celebrities; PULL their few posts on read.  │
  │ Read = (your pushed feed)  ∪  (pull from the few celebs).│
  └───────────────────────────────────────────────────────────┘
```

**The arithmetic that forces the hybrid.** Compare the total work per system:
```
  Symbols:  P = posts/day (1e8),  R = reads/day (5e9),
            F̄ = avg followers (200),  C = a celeb's followers (1e8)

  PURE PUSH write amplification (sum over posts of author's followers):
     ≈ P × F̄  for normal posts  PLUS  (celeb posts) × C
     A single celeb posting 5×/day adds 5 × 1e8 = 5e8 writes/day,
     concentrated as a BURST on 1e8 hot keys → unservable spike.

  PURE PULL read amplification:
     ≈ R × F̄ = 5e9 × 200 = 1e12 followee-queries/day → also unservable,
     and every timeline read pays it (reads are the 50:1 majority).

  HYBRID:  push only when followers < T (say 1e5):
     writes ≈ P × min(F̄, T)  (no celeb storms)
     reads  ≈ R × (1 + |celebs you follow|)  (a handful of pulls)
     → both sides bounded. THIS is why every real feed is hybrid.
```

**The decision + write path (pseudocode):**
```
  CELEB_THRESHOLD = 100_000

  function onNewPost(post):
      persist(post)                       // source of truth
      if followerCount(post.author) < CELEB_THRESHOLD:
          for f in followers(post.author):        // PUSH
              ZADD("feed:"+f, score(post), post.id)
              ZREMRANGEBYRANK("feed:"+f, 0, -801) // cap at 800
      else:
          addToCelebRecent(post.author, post.id)  // SKIP push; pull later
```

**The read path (merge pushed + pulled, then rank):**
```
  function getTimeline(user, cursor):
      pushed = ZREVRANGE("feed:"+user, cursor, cursor+PAGE)
      celebs = intersect(followees(user), CELEB_SET)
      pulled = []
      for c in celebs:
          pulled += recentPosts(c, sinceCursor)          // few accounts
      mine   = recentPosts(user)            // read-your-own-writes
      merged = rank(pushed ∪ pulled ∪ mine) // recency × affinity × eng.
      return paginate(merged, cursor)
```

**Pagination with cursors, not OFFSET.** Infinite scroll uses a **cursor** (the score/id of
the last seen post), so the next page is `ZREVRANGEBYSCORE feed:user (lastScore -inf` — stable
even as new posts arrive at the top. `OFFSET` would skip or duplicate items as the feed shifts.

**Ranking (beyond reverse-chron).** The merged candidate set is scored by a lightweight model:
`score = w1·recency + w2·author_affinity + w3·predicted_engagement`. Reverse-chronological is
just the special case `w1=1`. Keep ranking **on the small merged set** (a few hundred
candidates), never on the whole post store.

## 9.9 Follow-ups, red flags & building blocks

**Likely follow-ups (with crisp answers):**
- *"Read-your-own-writes?"* — always UNION the user's own recent posts into their read so a
  just-published post shows instantly even before fan-out completes.
- *"What threshold for celeb?"* — empirically tuned (push cost vs pull cost); often also "push
  only to **active** followers" to avoid writing into millions of dormant feeds.
- *"Ranked feed instead of chronological?"* — score the merged candidates with a model; same
  architecture, the ZSET score becomes a rank score with a recency decay.
- *"How is this different from Instagram (Ch 25)?"* — same fan-out skeleton; Instagram adds the
  **media** pipeline (S3 + transcode + CDN). Here the payload is tiny text, so timeline
  generation *is* the whole problem.
- *"How do online users see a post instantly, not in seconds?"* — for **live** (connected)
  followers, the post is also pushed over their open **WebSocket** via the **Realtime Gateway
  (Ch 35, CS2)**, in parallel with the async cache write — so the feed-cache update and the live
  push happen together; offline followers just find it in their cache on next read.
- *"Trending posts, and winning dormant users back?"* — tee feed/post events to a batch
  **analytics store** (Hadoop / warehouse) that powers **trending / most-popular** queries; a
  periodic (e.g. weekly) **re-engagement** job emails **PASSIVE** users a digest of popular
  posts via the **Notification System (Ch 35, CS1)**.

**Red flags that sink candidates:** **pure push** with no celebrity handling (the classic
fail); **pure pull** for everyone (every read pays O(followees)); unbounded feed caches (OOM);
`OFFSET` pagination on a moving feed; treating the feed cache as the source of truth; ranking
over the entire post corpus at read time instead of a small candidate set.

**Building blocks reused (theory lives elsewhere):** **Redis sorted sets** and caching —
**Ch 23**; **Kafka** + **consumer-group fan-out** — **Ch 24** (*Messaging & Streaming*);
**Cassandra / wide-column** time-series modeling — **Ch 24**; **cursor pagination** —
**Ch 25** (*Pagination*); the media-centric counterpart (Instagram) — **Ch 25** (*Worked
example*).

# CASE STUDY 10 — VIDEO STREAMING (YouTube / Netflix)

> **Google priority:** ★★★ · **Difficulty:** Hard · **Frequency:** Very common · **Time budget:** ~45 min

> **User story —** *As a* viewer, *I want* any video to start fast and play smoothly on my device
> and connection, adjusting quality as my network wobbles, *so that* I never stare at a buffering
> spinner.
>
> **For example —** I start a 4K creator's upload on my phone over 3G; I get a smooth 480p stream
> that jumps to 1080p when I reach Wi-Fi — the player swaps renditions per segment from a CDN.
>
> **Why it matters —** it takes two pipelines — parallel chunked transcoding into many renditions,
> and ABR (manifest + segments) over a CDN — to serve one upload to billions of devices.

A creator uploads one 4K video file; minutes later, **billions of viewers on every device and
network speed** can play it smoothly — your phone on 3G gets a blurry-but-uninterrupted
stream, your TV on fibre gets crisp 4K, and both **switch quality on the fly** as the network
wobbles. Two pipelines make this possible: an **ingestion/transcoding pipeline** that chops the
upload into chunks and **encodes them in parallel into many bitrate/resolution renditions**,
and a **delivery path** built on **adaptive-bitrate (ABR) streaming** — a tiny **manifest** plus
thousands of small **segments** served from a **CDN**. The crux is *both* of those flows.

## 10.0 What's really being tested

- Do you separate **upload** from a **transcoding pipeline** that produces **many renditions**?
- Do you know **why we chunk** — to **encode chunks in parallel** (minutes, not hours) and to
  enable **adaptive bitrate**?
- Do you understand **ABR (HLS/DASH)**: a **manifest** listing renditions + **segmented** media,
  with the **client** choosing quality per segment by measured bandwidth?
- Do you push delivery onto a **CDN** with **popularity tiers**, and handle **view counting** at
  scale?
- Do you treat **video as immutable, write-once, read-billions** content?

## 10.1 Clarify — requirements

**Functional**
- **Upload** a video; **transcode** it into multiple resolutions/bitrates; **publish**.
- **Stream** with **adaptive bitrate** across devices and fluctuating networks.
- **Thumbnails / preview**; **view counts**; (stretch) live streaming, captions, DRM.

**Out of scope** (say it): recommendations (Ch 26); comments; monetization/ads; the player UI
internals; we focus on **ingest → transcode → deliver**.

**Non-functional**
- **Startup latency:** video begins in **< 2 s** (time-to-first-frame).
- **Smoothness:** **no rebuffering** — adapt quality rather than stall.
- **Scale (YouTube-class):** ~**500 hours uploaded per minute**; billions of watch-hours/day.
- **Durability:** uploads must never be lost; **global** low-latency delivery.

**Questions to ask:** *VOD (video on demand) or live? Which codecs/resolutions? DRM required?
Max upload size/length? Target devices (which dictate renditions)? Acceptable transcode delay
before publish? Captions/multi-audio?*

## 10.2 Estimate — back-of-envelope

```
   Upload rate              500 hours / minute = 30,000 video-hours/hr
   ── per day               720,000 video-hours uploaded / day
   Raw bitrate (1080p)      ~5 Mbit/s → ~2.25 GB / hour
   Raw ingest storage/day   720,000 h × 2.25 GB ≈ 1.6 PB/day (originals)
   Renditions per video     ~6 (240p,360p,480p,720p,1080p,4K) → ×~2 storage
   Transcode is CPU-huge     → chunk + parallel encode on a worker fleet
   Watch traffic (delivery) ── DOMINATES: billions of hours served
       served almost entirely from CDN edges, NOT origin
   View events              ~10^10/day → counted approximately, batched
```

**What the numbers teach:** **storage of originals + renditions is petabytes/day** → cheap
object store, and transcoding is so CPU-heavy it **must be parallelized by chunk**. But the
**real load is delivery** — billions of watch-hours — which is why **>95% of bytes are served
from the CDN**, not your origin. View counting at 10¹⁰/day can't be exact-per-event; it's
**approximate + batched**.

## Whiteboard rehearsal — how you'd actually draw this live

In the room you don't reproduce the polished diagram in §10.3 below — you sketch rough
boxes and talk. So **rehearse from this first**: here is the same architecture as a **live
whiteboard sketch**, in the shorthand you'd actually use on a Google whiteboard. The colour
code is the one most candidates settle into:

> **green = client · grey = edge/LB · blue = service · red = datastore · orange = queue / stream · violet = 3rd-party**

![Video Streaming (YouTube / Netflix) — whiteboard rehearsal sketch](diagrams/video_streaming_whiteboard.svg)

**Why rehearse from the sketch, not the clean diagram?** The polished SVG in §10.3 is for
*reading*; this one is for *rehearsing*. Practise reproducing it from memory in ~4 minutes while
narrating every box out loud — that muscle memory is exactly what the interview tests. It is the
*same* components as the clean §10.3 diagram, only drawn in the loose, name-the-tool style
your hand can produce under pressure: every box names a concrete technology, each datastore is
called out in red, queues in orange, third-party vendors in violet. That visual discipline is
the signal an interviewer is looking for.

## 10.3 HLD — high-level architecture

![Video Streaming (YouTube / Netflix) — high-level architecture (HLD)](diagrams/video_streaming.svg)

**Legend:** Layer 2 turns one upload into many renditions; Layer 3 is where ~billions of
viewers actually pull bytes — almost all from CDN.

**Block-by-block:**
- **Upload service + raw store** — the creator uploads the original **directly to object
  storage** via a presigned URL (your servers never proxy petabytes — same trick as Instagram,
  Ch 25); metadata + an `uploaded` event kick off processing.
- **Splitter** — cuts the original into **GOP-aligned chunks** (a few seconds each) so they can
  be encoded **independently and in parallel** (the key to fast transcode).
- **Encoder workers** — a CPU/GPU fleet; each worker encodes **one chunk into one rendition**;
  the work is embarrassingly parallel (chunks × renditions).
- **Packager** — assembles encoded chunks into **ABR segments** and writes the **manifest**
  (HLS `.m3u8` / DASH `.mpd`) that lists every rendition and segment.
- **CDN (delivery)** — caches **segments** at the edge by popularity; the vast majority of bytes
  are served here, close to the viewer, never touching origin (CDN & edge — Ch 23).
- **View counter** — approximate, sharded, batched counting (exact per-view at 10¹⁰/day is
  pointless and expensive).

## 10.4 HLD — critical path walkthrough

**Upload → publish:**
```
  1. Creator → POST /videos {title} → Upload svc returns a presigned URL
  2. Creator → PUT <presigned-url> → original lands in raw object store
  3. Upload svc emits "uploaded"; video status = PROCESSING
  4. Splitter cuts original into GOP-aligned chunks c1..cN
  5. Encoder fleet (parallel) encodes each (chunk × rendition):
        c1→240p,360p,...4K ; c2→240p,...; ...   (thousands of jobs)
  6. Packager segments each rendition + writes manifest(s)
  7. Push segments+manifest to CDN origin; status = READY; emit
     "transcode.done" (notify creator, index for search)
```

**Playback (adaptive bitrate):**
```
  1. Viewer hits play → player GETs the MANIFEST from the CDN
  2. Player estimates bandwidth; picks a START rendition (e.g. 480p)
  3. Player GETs segments in order: seg1, seg2, ... from CDN edge
        ├─ bandwidth high & buffer full → step UP (720p→1080p)
        └─ bandwidth drops / buffer low → step DOWN (1080p→480p)
  4. Each segment is independently decodable, so switching renditions
     between segments is seamless — no restart, no stall
  5. CDN serves hot segments from edge; cold ones miss → origin once
```
The magic is in **step 3–4**: because every rendition is cut at the **same segment
boundaries**, the player can fetch `seg5` at 480p and `seg6` at 1080p and splice them with no
visible glitch. **Quality follows the network, the stream never stops.**

## 10.5 HLD — data model & storage choices

| Entity | Shape (key fields) | Store | Why |
|--------|--------------------|-------|-----|
| Original | `videoId → raw file` | Object store (cold tier) | Write-once, huge, rarely read after transcode |
| Renditions/segments | `videoId/rendition/segN.ts` | Object store → CDN | Immutable, edge-cached, read-billions |
| Manifest | `videoId → .m3u8 / .mpd` | Object store → CDN | Tiny, lists renditions+segments |
| Video metadata | `videoId → title, status, durations, renditions` | SQL/Bigtable | Point reads, status transitions |
| Transcode jobs | `(videoId, chunk, rendition) → state` | Queue + job DB | Track the parallel fan-out |
| View counts | `videoId → approx count` | Sharded counters / stream agg | 10^10/day, approximate, batched |

**Why immutable segments on a CDN?** A published segment never changes, so it's **infinitely
cacheable** — set long TTLs, let edges hold the popular ones, and your origin only serves the
long-tail misses. That immutability is what makes global delivery affordable.

## 10.6 HLD — scaling & bottlenecks

- **Transcoding is the compute bottleneck** → **chunk + parallel encode**. A 2-hour film
  encoded serially takes hours; split into 5-second chunks and fan out across hundreds of
  workers and it finishes in minutes. Spot/preemptible instances cut cost (Ch 25 *FinOps*).
- **Delivery is the bandwidth bottleneck** → **CDN with popularity tiers**: a viral video's
  segments are pushed to **edge** caches near viewers; the long tail lives at **regional**
  caches; only true cold misses hit origin. Pre-warm edges for big premieres.
- **Storage** → keep originals in a **cold** tier (rarely read post-transcode); renditions in a
  standard tier fronted by CDN; **delete/transcode-on-demand** unpopular renditions to save space.
- **View counting** → sharded approximate counters (or HyperLogLog for unique views), flushed in
  batches; exact real-time counts are neither needed nor affordable at 10¹⁰/day.
- **Thumbnails** → generated in the same pipeline (sample frames → small images → CDN).

## 10.7 HLD — failure modes & trade-offs

```
  What dies / goes wrong       →  What we do
  ──────────────────────────────────────────────────────────────────
  Encoder worker crashes        →  that (chunk,rendition) job is re-queued;
                                   chunks are independent → easy retry
  Transcode slow / backlogged   →  publish lower renditions first (240p/360p)
                                   so video is watchable; add 4K later
  CDN edge miss storm (premiere)→  pre-warm edges; tiered caches absorb;
                                   origin shielded by regional cache
  Origin region down            →  CDN serves from cache; multi-region origin
                                   replicas for the cold tail
  Network drops mid-playback    →  ABR steps DOWN a rendition; buffer absorbs;
                                   stream continues at lower quality
  View-count store lag          →  counts are approximate/eventual anyway;
                                   reconcile from event log in batch
```
**Trade-offs called out:** we **publish progressively** (low renditions first) — trading peak
quality at t=0 for "watchable now." We accept **approximate view counts** (availability/cost
over exactness). We pay **extra storage** for ~6 renditions to gain device/network reach. We
trade **upload→publish latency** (minutes of transcoding) for **smooth playback for billions**.

## 10.8 LLD (the crux) — the transcode pipeline & the ABR model

**Crux part 1 — parallel, chunk-based transcoding.** Encoding is CPU-bound and slow, so we
**never** encode a whole video on one machine. We split it at **GOP boundaries** (Group of
Pictures — a self-contained run that starts with a keyframe, so a chunk can be decoded on its
own) and fan the chunks across a worker fleet:
```
   ORIGINAL  ──split at keyframes──▶  c1   c2   c3  ...  cN
                                       │    │    │        │
        each chunk encoded into EVERY rendition, in parallel:
                                       ▼    ▼    ▼        ▼
        ┌────────────────── Encoder fleet (hundreds) ───────────┐
        │  (c1,240p)(c1,720p)(c2,240p)(c2,1080p)(c3,4K) ...      │
        │  thousands of INDEPENDENT jobs → finish in minutes     │
        └───────────────────────────┬───────────────────────────┘
                                     ▼
        PACKAGER:  for each rendition, concatenate its chunks into
        equal-length SEGMENTS (e.g. 4 s) aligned ACROSS renditions,
        then write the MANIFEST listing every rendition & segment.
```
```
  // Transcode orchestration (conceptual)
  function transcode(videoId):
      chunks = splitAtGOP(original(videoId), ~5s)
      jobs = []
      for c in chunks:
          for r in RENDITIONS:           // 240p..4K
              jobs.add((c, r))           // independent unit of work
      results = parallelMap(jobs, encodeChunk)   // worker fleet
      for r in RENDITIONS:
          segs = packageSegments(results.filter(r), segLen=4s)
          writeToCDNOrigin(videoId, r, segs)
      writeManifest(videoId, RENDITIONS)  // .m3u8 / .mpd
```
Because every rendition is segmented at the **same boundaries**, segment `k` of 480p and
segment `k` of 1080p cover the **same wall-clock slice** — the precondition for seamless ABR
switching.

**Crux part 2 — the ABR manifest + segment model (HLS/DASH).** Delivery is "dumb files + a
smart client." The server just exposes a **manifest** and a tree of **segments**; the **player**
decides what to fetch:
```
   master.m3u8  (the manifest the player reads first)
   ├─ 240p/  index.m3u8  → seg0.ts seg1.ts seg2.ts ...
   ├─ 480p/  index.m3u8  → seg0.ts seg1.ts seg2.ts ...
   ├─ 720p/  index.m3u8  → seg0.ts seg1.ts seg2.ts ...
   └─ 1080p/ index.m3u8  → seg0.ts seg1.ts seg2.ts ...

   #EXTM3U                          ← master manifest excerpt
   #EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
   480p/index.m3u8
   #EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720
   720p/index.m3u8
```
```
  // The ABR control loop runs ENTIRELY in the client player:
  bufferTarget = 30s
  loop each segment k:
      bw = estimateBandwidth(recentSegments)   // measured throughput
      r  = highestRendition(bw, bufferLevel)   // pick quality
      if bufferLevel < low:  r = stepDown(r)   // protect against stall
      GET CDN: videoId/r/seg{k}.ts             // fetch next segment
      append to buffer; play
```
**Why this design wins:** the heavy lifting (which quality, when to switch) lives in the
**client**, so the server side is just **immutable, cacheable files** — perfect for a CDN. The
manifest is tiny; segments are independently fetchable; switching renditions is just "ask the
CDN for the next segment from a different folder." This is exactly how **HLS** (Apple) and
**MPEG-DASH** work.

**The ABR rendition ladder** (what the encoder fleet produces):
```
   Rendition  Resolution   Bitrate    Picks it when…
   ─────────  ──────────   ────────   ────────────────────────
   240p       426×240      ~0.4 Mb/s  2G / very weak / data-saver
   360p       640×360      ~0.8 Mb/s  weak mobile
   480p       854×480      ~1.4 Mb/s  ok mobile / default start
   720p       1280×720     ~2.8 Mb/s  good wifi / HD
   1080p      1920×1080    ~5  Mb/s   strong wifi / fibre
   4K         3840×2160    ~16 Mb/s   fast fibre + 4K screen
```

## 10.9 Follow-ups, red flags & building blocks

**Likely follow-ups (with crisp answers):**
- *"Live streaming?"* — same segment/manifest idea but with **low-latency** chunked transfer; a
  rolling manifest of the newest segments and a few-second glass-to-glass delay.
- *"Why segments instead of one file?"* — enables **parallel transcode**, **ABR switching**,
  **CDN cacheability**, and **resumability**; a monolithic file gives up all four.
- *"DRM / piracy?"* — encrypt segments, license server hands keys to authorized players
  (Widevine/FairPlay); doesn't change the architecture, adds a key exchange.
- *"View counts accurate?"* — approximate + batched; **HyperLogLog** for unique viewers;
  reconcile from the event log offline.

**Red flags that sink candidates:** proxying the upload through your servers (petabytes!);
transcoding the whole video on one machine (hours, no parallelism); serving video from origin
instead of a **CDN**; one bitrate for everyone (buffering on mobile, waste on fibre);
**non-aligned** segment boundaries across renditions (breaks ABR switching); exact per-event
view counting at 10¹⁰/day.

**Building blocks reused (theory lives elsewhere):** **CDN, edge caching, cache tiers** —
**Ch 23**; **object storage** and **hot/cold tiers** — **Ch 24** (*Storage*); **presigned
direct upload** and the async event pipeline — **Ch 25** (*Instagram upload flow*); **Kafka** +
worker fleets / **MapReduce-style parallelism** — **Ch 24**; **approximate counting
(HyperLogLog / heavy hitters)** — **Ch 37** (*Top-K*) and **Ch 24**; **FinOps** spot instances
for transcode — **Ch 25**.

# CASE STUDY 11 — FILE SYNC & STORAGE (Drive / Dropbox)

> **Google priority:** ★★ · **Difficulty:** Hard · **Frequency:** Common · **Time budget:** ~40 min

> **User story —** *As a* user with files on several devices, *I want* a change on one device to
> appear everywhere in seconds without re-uploading whole files, *so that* sync is fast and doesn't
> burn my bandwidth.
>
> **For example —** I change one line in a 2 GB video project; the client uploads only the handful
> of changed ~4 MB content-defined chunks, and my phone pulls just those — not 2 GB.
>
> **Why it matters —** the design is chunking + content-hash dedupe + delta sync, with metadata
> split from blocks — re-uploading whole files simply doesn't scale.

You edit a document on your laptop; seconds later the change appears on your phone and your
colleague's machine. That's **file sync**: keep a set of files **identical across many devices
and the cloud**, efficiently and reliably. The naïve version (re-upload the whole file on every
save, push it to every device) wastes enormous bandwidth — change one line of a 2 GB video
project and you'd re-upload 2 GB. The real design **splits files into chunks**, **deduplicates
identical chunks** globally, and **syncs only the chunks that changed** (delta sync). The crux
is exactly that: **chunking + content-hash dedupe + delta sync**.

> Ch 25 sketched Dropbox as a one-liner (chunk → hash → S3 → metadata DB). **Here is the full
> treatment**, including the delta-sync flow, the metadata/block split, and conflict resolution.

## 11.0 What's really being tested

- Do you **chunk** files and address chunks by **content hash** (so identical data is stored once)?
- Do you do **delta sync** — upload/download **only changed chunks**, not whole files?
- Do you **split metadata from blocks** (a MySQL-style metadata DB vs an S3-ish block store)?
- Do you design the **notification/sync service** that pushes changes to a user's other devices?
- Do you handle **conflicts** (two devices edit offline) — versioning vs conflict copies?

## 11.1 Clarify — requirements

**Functional**
- **Upload / download** files; **sync** changes across all of a user's devices automatically.
- **Efficient updates:** changing part of a file transfers only the changed part.
- **Share** files/folders with other users; **version history**; **offline edits** that sync later.
- **Conflict handling** when the same file is edited in two places.

**Out of scope** (say it): real-time collaborative *co-editing* of a doc (that's OT/CRDT —
Ch 35 *Collaborative editor*); full-text search of contents; the desktop client internals.

**Non-functional**
- **Bandwidth-efficient:** never re-send unchanged bytes; dedupe across files/users.
- **Durable & consistent:** never lose or corrupt a file; reflect the latest committed version.
- **Scale:** hundreds of millions of users, ~a trillion (10^12) files, exabytes of data.
- **Sync latency:** a change should reach other online devices within **seconds**.

**Questions to ask:** *Max file size? Fixed or variable chunking? Block-level dedupe across
users (privacy implications)? How are conflicts resolved — LWW or keep both? How many devices
per user? Strong or eventual consistency on the file view?*

## 11.2 Estimate — back-of-envelope

```
   Users                        500,000,000
   Files / user                 ~2,000 → 10^12 files total
   Avg file size                ~1 MB (skewed: many small, few huge)
   Chunk size                   ~4 MB (content-defined) → big files = many chunks
   Raw data                     ~ exabytes → object store, tiered
   Dedupe savings               30–50% (shared installers, photos, docs)
   Edits / active user / day    ~20 saves → delta sync makes these cheap
   Metadata ops                 list/stat/sync checks ≫ block transfers
       → metadata DB is high-QPS; block store is high-bandwidth
```

**What the numbers teach:** two very different workloads live here. **Metadata** (list folder,
"what changed?", version pointers) is **small, high-QPS, transactional** → a real database.
**Blocks** (the file bytes) are **huge, write-once, bandwidth-heavy** → an object store. Keeping
them in one system would be a disaster; **the split is the architecture.** Dedupe + delta sync
turn "20 saves of a big file" into a few 4 MB chunk transfers.

## Whiteboard rehearsal — how you'd actually draw this live

In the room you don't reproduce the polished diagram in §11.3 below — you sketch rough
boxes and talk. So **rehearse from this first**: here is the same architecture as a **live
whiteboard sketch**, in the shorthand you'd actually use on a Google whiteboard. The colour
code is the one most candidates settle into:

> **green = client · grey = edge/LB · blue = service · red = datastore · orange = queue / stream · violet = 3rd-party**

![File Sync & Storage (Drive / Dropbox) — whiteboard rehearsal sketch](diagrams/file_sync_whiteboard.svg)

**Why rehearse from the sketch, not the clean diagram?** The polished SVG in §11.3 is for
*reading*; this one is for *rehearsing*. Practise reproducing it from memory in ~4 minutes while
narrating every box out loud — that muscle memory is exactly what the interview tests. It is the
*same* components as the clean §11.3 diagram, only drawn in the loose, name-the-tool style
your hand can produce under pressure: every box names a concrete technology, each datastore is
called out in red, queues in orange, third-party vendors in violet. That visual discipline is
the signal an interviewer is looking for.

## 11.3 HLD — high-level architecture

![File Sync & Storage (Drive / Dropbox) — high-level architecture (HLD)](diagrams/file_sync.svg)

**Legend:** the **two stores** are the heart — a transactional **metadata DB** (small, hot) and
a content-addressed **block store** (huge, immutable). Clients talk to both.

**Block-by-block:**
- **Client** — the smart part: watches local files, **chunks** them, computes each chunk's
  **content hash**, and asks the server **which chunks it doesn't already have** before uploading.
- **Metadata service + DB** — owns the *map* of a file: its ordered **list of chunk hashes**,
  its **versions**, **ACLs**, and **dedupe refcounts**. This is the source of truth for "what a
  file is."
- **Block service + block store** — stores the actual bytes, **content-addressed** by
  `chunkHash`, **write-once**. Identical chunks (across files and users) map to the same key →
  stored once.
- **Notification / sync service** — when a file changes, it tells the user's **other online
  devices** to pull; offline devices catch up on reconnect.
- **Kafka** — fans `file.changed` out to device-notification, thumbnailing, search, and sharing.

## 11.4 HLD — critical path walkthrough

**Upload an edited file (delta sync — only changed chunks move):**
```
  1. Client detects file changed; re-chunks it → [h1,h2,h3',h4]
     (only the 3rd chunk's content — and thus its hash — changed)
  2. Client → POST /commit-intent {fileId, newChunkList:[h1,h2,h3',h4]}
  3. Metadata svc diffs against the stored list [h1,h2,h3,h4]:
        needed = chunks the BLOCK STORE doesn't already have = {h3'}
        (h1,h2,h4 already exist → DO NOT upload them again)
  4. Client uploads ONLY h3' to the block store (presigned PUT)
  5. Block svc verifies hash(bytes)==h3'  → store at key h3'
  6. Client → POST /commit {fileId, version:N+1, chunkList:[h1,h2,h3',h4]}
        Metadata svc atomically creates version N+1, bumps refcounts
  7. Metadata svc emits "file.changed" → Notification svc
  8. User's other devices get "pull"; they fetch ONLY h3' and rebuild
```
The whole point is **steps 3–4 and 8**: a one-chunk edit to a huge file moves **one 4 MB
chunk**, not the whole file — on **both** the upload and the download side. Everything else
(h1,h2,h4) is already present and addressed by its unchanged hash.

## 11.5 HLD — data model & storage choices

| Entity | Shape (key fields) | Store | Why |
|--------|--------------------|-------|-----|
| File / version | `fileId, version → ordered [chunkHash], size, mtime` | Metadata DB (MySQL) | Transactional, versioned, point/range reads |
| Chunk (block) | `chunkHash → bytes` (content-addressed) | Object store (S3/GCS) | Immutable, dedupe by hash, huge, cheap |
| Dedupe refcount | `chunkHash → refCount` | Metadata DB | Know when a chunk is safe to GC |
| Folder tree / ACL | `folderId → children, sharedWith` | Metadata DB | Listing, permissions |
| Device cursor | `(userId, deviceId) → lastSyncVersion` | KV / metadata DB | "What has this device already seen?" |
| Change journal | `userId → ordered changes` | Kafka / append log | Drives sync + offline catch-up |

**Why content-addressed blocks?** Naming a chunk by `hash(bytes)` gives **automatic dedupe**
(identical bytes → identical key → stored once), **integrity** (re-hash on read to detect
corruption), and **idempotent uploads** (re-uploading the same chunk is a no-op).

## 11.6 HLD — scaling & bottlenecks

- **Shard metadata by user/account** so a user's files, versions, and folder tree are co-located
  and listing is fast; the metadata DB is the high-QPS component.
- **Block store scales itself** (S3-class) — content-addressing spreads keys uniformly; front
  popular downloads with a **CDN**.
- **Dedupe** is the bandwidth/storage win: **block-level** dedupe across all users can cut
  storage 30–50% (everyone has the same OS installer, the same meme). *Privacy caveat:*
  cross-user dedupe can leak "does the server already have this file?"; some systems dedupe only
  **within** a user, or use convergent encryption.
- **Sync notifications** → long-poll or WebSocket per online device; for millions of devices,
  shard the notification service and use the **change journal** so a device can ask "give me
  everything since version X."
- **Chunking strategy** → **fixed-size** (simple, fast) vs **content-defined chunking** (CDC,
  e.g. rolling-hash boundaries) which is robust to **insertions** (insert a byte at the front and
  fixed chunking re-hashes everything after it; CDC keeps most boundaries stable).

## 11.7 HLD — failure modes & trade-offs

```
  What dies / goes wrong       →  What we do
  ──────────────────────────────────────────────────────────────────
  Upload interrupted mid-file   →  chunks are independent + idempotent;
                                   resume by uploading only missing chunks
  Commit fails after blocks up   →  blocks are orphaned (refcount 0) → GC'd;
                                   no half-file (commit is the atomic step)
  Two devices edit offline       →  CONFLICT → version branch; keep both as
                                   "file (conflicted copy, deviceB)" + flag
  Metadata DB shard down         →  that account's sync pauses; blocks safe;
                                   failover replica restores it
  Block corruption               →  re-hash on read ≠ chunkHash → refetch
                                   from a replica (hash detects it)
  Notification svc down          →  devices fall back to periodic poll of the
                                   change journal (sync slower, not broken)
```
**Trade-offs called out:** **commit is the single atomic step** — blocks can be uploaded
eagerly and orphaned safely, but the file only "changes" when its metadata version flips
(consistency on the *map*, eventual on the *bytes*). We choose **conflict copies over silent
LWW** for user files (losing someone's edit is unforgivable; a duplicate is annoying but safe).
Cross-user dedupe trades **storage savings for a privacy side-channel**.

## 11.8 LLD (the crux) — chunking, content-hash dedupe & delta sync

The crux is the trio that makes sync cheap. Walk it as one mechanism.

**1) Chunk the file and address chunks by content hash.**
```
   FILE (e.g. 16 MB) ──split into 4 MB chunks──▶
      ┌──────┬──────┬──────┬──────┐
      │ c0   │ c1   │ c2   │ c3   │
      └──┬───┴──┬───┴──┬───┴──┬───┘
   hash: │      │      │      │
      h0=sha256(c0)  h1   h2   h3
   The file's identity in metadata = the ORDERED LIST [h0,h1,h2,h3].
   The bytes live in the block store keyed by hash → identical chunks
   anywhere (same file, other files, other USERS) are stored ONCE.
```

**2) Delta sync — only transfer chunks whose hash changed.**
```
   Old file:  [h0, h1, h2, h3]
   User edits the middle → re-chunk → [h0, h1, h2', h3]
                                              ▲ only this hash differs

   Client asks server: "which of {h0,h1,h2',h3} are missing?"
   Server: h0,h1,h3 already exist (dedupe) → missing = {h2'}
   Client uploads ONLY h2'.  Commit new version = [h0,h1,h2',h3].
   Other devices download ONLY h2' and reassemble.
```
```
  // Client-side sync (conceptual)
  function syncUpload(file):
      chunks = split(file, 4MB)
      hashes = [ sha256(c) for c in chunks ]
      missing = server.whichMissing(hashes)     // dedupe check
      for h in missing:
          blockStore.put(h, chunkBytes[h])       // presigned, idempotent
      server.commit(file.id, version+1, hashes)  // atomic metadata flip
```

**3) Content-defined chunking (CDC) — why fixed chunks aren't always enough.**
```
   Insert 1 byte at the FRONT of the file:
     fixed 4MB chunking → every boundary shifts → ALL hashes change
                          → you'd re-upload the whole file (bad!)
     content-defined    → boundaries set by a rolling hash over the
                          data (cut where hash % 2^k == 0) → only the
                          chunk around the edit changes → minimal upload
```
CDC sets chunk boundaries based on the **data itself** (a rolling hash), so most boundaries
survive insertions/deletions and dedupe stays effective. Fixed chunking is simpler and fine when
edits are in-place (overwrites); CDC shines for inserts and append-heavy files.

**4) Refcounting & garbage collection.** Because chunks are shared, a chunk can only be deleted
when **no file version references it**. The metadata DB keeps `refCount(chunkHash)`; commit
increments the new chunks, a version delete decrements; a background GC reclaims chunks at
refcount 0. This is what makes dedupe safe across millions of users.

**5) Conflict resolution (the offline-edit case).**
```
   Device A (offline): file v3 → edits → wants v4 = [.. a ..]
   Device B (offline): file v3 → edits → wants v4 = [.. b ..]
   Both reconnect:
     server accepts the FIRST commit as v4.
     the second sees "base v3 is no longer the head" → CONFLICT:
        keep server's v4, and store the loser as a CONFLICT COPY
        "report (conflicted copy from B 2026-06-21).docx"
        → no edit is ever silently lost.
```
For plain files, **conflict copies** (keep both, let the human merge) beat last-writer-wins.
*Real-time co-editing* of a single doc is a different beast solved by **OT/CRDT** — see Ch 35
(*Collaborative editor*); here, file granularity makes "keep both" the safe default.

## 11.9 Follow-ups, red flags & building blocks

**Likely follow-ups (with crisp answers):**
- *"How do other devices learn of a change fast?"* — a **notification service** pushes "pull"
  over WebSocket/long-poll to online devices; offline ones replay the **change journal** since
  their last cursor on reconnect.
- *"Fixed vs content-defined chunking?"* — fixed is simpler and great for overwrites; CDC
  (rolling-hash boundaries) survives insertions and keeps dedupe high — Dropbox-style systems use
  variable chunking.
- *"How is this different from Google Docs?"* — Docs is **character-level real-time** co-editing
  (OT/CRDT, Ch 35). Drive/Dropbox sync **whole-file versions**; conflicts become copies, not
  merged keystrokes.
- *"Privacy of cross-user dedupe?"* — dedupe within a user, or convergent encryption, to avoid
  the "server already has this file" side-channel.

**Red flags that sink candidates:** re-uploading the whole file on every save (no delta sync);
storing file **bytes in a SQL database** (should be a block store); **no metadata/block split**;
addressing chunks by a random id instead of **content hash** (loses dedupe + integrity);
**silent last-writer-wins** that eats a user's edits; no refcount/GC (orphaned or wrongly-deleted
chunks).

**Building blocks reused (theory lives elsewhere):** **object storage** (content-addressed
blocks) and **metadata vs block split** — **Ch 24** (*Storage systems*); **presigned direct
upload** — **Ch 25** (*Instagram upload*); **WebSocket/long-poll push** — **Ch 35** (*Chat*);
**Kafka** change journal / fan-out — **Ch 24**; **CDN** for popular downloads — **Ch 23**;
real-time co-edit alternative — **Ch 35** (*Collaborative editor*).

# CASE STUDY 12 — URL SHORTENER (TinyURL)

> **Google priority:** ★★ · **Difficulty:** Easy · **Frequency:** Very common · **Time budget:** ~25 min

> **User story —** *As a* user, *I want* to turn a long link into a short one that reliably
> redirects, *so that* I can share and track it cleanly.
>
> **For example —** I shorten a long product URL into `tiny.cc/9xQ2bR`; every click does a single
> cached key→value lookup and 301/302-redirects to the original in a few milliseconds.
>
> **Why it matters —** the signal is in two choices: how you generate a short, unique, unguessable
> id without a counter bottleneck, and 301 vs 302 (caching vs analytics).

Paste a long link, get back a short one like `tiny.cc/9xQ2bR`; click it and you're redirected
to the original. This is the classic **warm-up** question — small enough to finish cleanly, yet
it exercises the whole scaffold: **estimate → API → ID generation → KV store → cache →
redirect**. Two decisions carry all the signal: **how you generate the short id**, and **301 vs
302** for the redirect. We keep it tight.

## 12.0 What's really being tested

- Can you generate a **short, unique, hard-to-guess** id without a central counter bottleneck?
- Do you pick the right **storage** (a simple, massively-cached key→value lookup)?
- Do you know the **301 vs 302** trade-off (caching/analytics) — the signature detail?
- Do you cover the basics: **custom aliases, expiry, redirect-path latency**?

## 12.1 Clarify — requirements

**Functional**
- **Shorten:** long URL → short code; **redirect:** short code → original URL.
- **Custom alias** (optional), **expiry/TTL** (optional), basic **click analytics**.

**Out of scope** (say it): user accounts, link editing, malware scanning, a full analytics suite.

**Non-functional**
- **Read-heavy:** redirects ≫ creates (often **100:1+**) → cache everything.
- **Latency:** redirect in **< 50 ms**; very high availability (a dead link is embarrassing).
- **Scale:** ~100 M new links/day; billions of redirects/day; links live for years.
- **Codes are short** (~7 chars) and effectively never collide.

**Questions to ask:** *Read:write ratio? Code length / charset? Custom aliases? Do links expire?
Do we need analytics (which pushes 302 over 301)? Guessable codes a concern?*

## 12.2 Estimate — back-of-envelope

```
   New links / day          100,000,000 → write QPS ≈ 1,160 / s
   Redirects / day          10,000,000,000 (100×) → read QPS ≈ 116,000 / s
   Read : write             ≈ 100 : 1   → cache-first, read-optimized
   Code space (base62, 7)   62^7 ≈ 3.5 × 10^12  → ~3.5 trillion codes
   Storage (5 yrs)          100M × 365 × 5 × ~500 B ≈ 90 TB → KV store
   Cache hit target         > 95% of redirects served from RAM (Redis)
```
**Lesson:** at 7 base62 chars you have **3.5 trillion** codes — astronomically more than 5
years of links — so collisions are a non-issue and codes stay short. The system is **read-
dominated**, so it's really "a giant, heavily-cached hash map."

## Whiteboard rehearsal — how you'd actually draw this live

In the room you don't reproduce the polished diagram in §12.3 below — you sketch rough
boxes and talk. So **rehearse from this first**: here is the same architecture as a **live
whiteboard sketch**, in the shorthand you'd actually use on a Google whiteboard. The colour
code is the one most candidates settle into:

> **green = client · grey = edge/LB · blue = service · red = datastore · orange = queue / stream · violet = 3rd-party**

![URL Shortener (TinyURL) — whiteboard rehearsal sketch](diagrams/url_shortener_whiteboard.svg)

**Why rehearse from the sketch, not the clean diagram?** The polished SVG in §12.3 is for
*reading*; this one is for *rehearsing*. Practise reproducing it from memory in ~4 minutes while
narrating every box out loud — that muscle memory is exactly what the interview tests. It is the
*same* components as the clean §12.3 diagram, only drawn in the loose, name-the-tool style
your hand can produce under pressure: every box names a concrete technology, each datastore is
called out in red, queues in orange, third-party vendors in violet. That visual discipline is
the signal an interviewer is looking for.

## 12.3 HLD — high-level architecture

![URL Shortener (TinyURL) — high-level architecture (HLD)](diagrams/url_shortener.svg)

**Block-by-block:**
- **Write service** — turns a unique numeric **ID** into a base62 **code** and stores `code→longURL`.
- **Redirect service** — the hot path: a cache-first KV lookup then an HTTP redirect.
- **ID generator** — avoids collisions by construction.
- **Cache (Redis)** — absorbs the 100:1 read load; the **KV store** is the durable backstop.
- **Click logging** — done **asynchronously** so it never slows the redirect.

## 12.4 HLD — critical path walkthrough

**Shorten:**
```
  1. POST /shorten {longURL, alias?, ttl?}
  2. If alias given → check free → reserve it.  Else:
        id   = IDgen.next()            // unique 64-bit (Snowflake)
        code = base62(id)              // e.g. 9xQ2bR  (7 chars)
  3. Store code → {longURL, exp} in KV; write-through to cache
  4. Return https://tiny.cc/9xQ2bR
```
**Redirect:**
```
  1. GET /9xQ2bR
  2. Redirect svc: cache.get(code)
        ├─ HIT  → return redirect immediately (most traffic)
        └─ MISS → KV.get(code) → fill cache → return
  3. Emit click event to Kafka (async)  → analytics
  4. HTTP 301 (permanent) or 302 (found) → browser follows to longURL
```

## 12.5 HLD — data model & storage choices

| Entity | Shape | Store | Why |
|--------|-------|-------|-----|
| Mapping | `code → {longURL, exp, createdAt}` | KV (Cassandra/DynamoDB) | Simple point lookups at scale |
| Hot cache | `code → longURL` | Redis | Serve 95%+ redirects from RAM |
| Custom alias | `alias → code/longURL` | KV (unique constraint) | Reserve human-chosen names |
| Click events | `(code, ts, geo, ref)` | Kafka → warehouse | Async analytics, never on hot path |

## 12.6 HLD — scaling & bottlenecks

- **Reads** → cache-first; the KV store and Redis both shard by **code** (uniform hash → even
  load); replicate for availability. CDN can even cache the redirect response for popular codes.
- **Writes** → the only coordination risk is **ID generation**; solve it with **Snowflake-style
  IDs** or **per-server counter blocks** so no global lock (full treatment: **Ch 37**, *Unique ID
  generator*).
- **Hot links** (a viral short link) → naturally cached; a single key in Redis handles it.

## 12.7 HLD — failure modes & trade-offs

```
  What dies / goes wrong   →  What we do
  ────────────────────────────────────────────────────────────────
  Cache down                →  fall back to KV (slower, still correct)
  KV node down              →  replica/quorum serves the read
  ID collision (alias race) →  unique constraint → one wins, retry alias
  Analytics pipeline down   →  redirects unaffected (it's async/best-effort)
```
**Trade-offs called out:** the big one is **301 vs 302** (see crux). We favor **availability**
(a redirect must work) and accept **eventual** analytics.

## 12.8 LLD (the crux) — ID generation + the 301 vs 302 trade-off

**Generating the code — two clean approaches:**
```
  (A) Distributed ID → base62 (preferred):
      id   = snowflake()        // 64-bit, time-sortable, no central lock
      code = base62(id)         // [0-9a-zA-Z] → ~7 short chars
      ✔ no collisions BY CONSTRUCTION (ids are unique)
      ✔ no read-before-write; scales horizontally   (→ Ch 37)

  (B) Hash + collision check:
      code = base62(md5(longURL))[0:7]
      if KV.exists(code) and maps to a DIFFERENT url: rehash/extend
      ✘ needs a read to check; collisions must be handled
      ✔ same long URL → same code (free dedupe) if that's desired
```
Prefer **(A)**: turning a guaranteed-unique 64-bit id into base62 gives short codes with **zero
collision logic and no coordination** (counter blocks or Snowflake — **Ch 37**). Use **(B)** only
if you specifically want identical URLs to collapse to one code.

**base62** uses `[0-9a-zA-Z]` (62 symbols), so a 64-bit id compresses to ~11 chars max, and a
modest id range to ~7 — short and URL-safe (no `+`/`/` like base64).

**301 vs 302 — the signature decision:**
```
   301 Moved Permanently        302 Found (temporary)
   ─────────────────────        ─────────────────────
   Browser/CDN CACHE the         Browser does NOT cache;
   redirect → future clicks      every click comes back to
   may SKIP your server          YOUR server first
   ✔ fastest, least load          ✔ you SEE every click
   ✘ you LOSE per-click           ✘ more load, slightly slower
     analytics (and can't                  per redirect
     change the target)
```
**The trade-off:** **301** is faster and offloads traffic (the browser/CDN remembers the
destination) but you **lose analytics** and the ability to retarget the link. **302** routes
**every** click through you — perfect for **click tracking** and editable links — at the cost of
more redirect load. Pick by requirement: **analytics/editable → 302; pure speed → 301.** Stating
this trade-off explicitly is the senior signal on this question.

## 12.9 Follow-ups, red flags & building blocks

**Likely follow-ups (with crisp answers):**
- *"Avoid guessable/sequential codes?"* — don't expose a raw counter; use Snowflake (time bits
  obscure order) or a keyed permutation of the id before base62.
- *"Expiry?"* — store `exp`; lazy-delete on read + a background sweeper (or KV TTL).
- *"Custom aliases?"* — reserve via a unique key; reject duplicates.
- *"Analytics without slowing redirects?"* — log clicks **async** to Kafka (302 if you must see
  every click first-hand).

**Red flags that sink candidates:** a **single auto-increment** counter as a global bottleneck;
not caching (the read path is 100:1); ignoring **301 vs 302** (the whole point); putting analytics
**synchronously** on the redirect path; oversized codes / base64 with URL-unsafe chars.

**Building blocks reused (theory lives elsewhere):** **distributed unique IDs / Snowflake** —
**Ch 37** (*Unique ID generator*) and **Ch 25** (*Distributed IDs*); **Redis caching** and **CDN**
— **Ch 23**; **KV store / Cassandra-DynamoDB** modeling — **Ch 24**; async **Kafka** analytics —
**Ch 24**.

## Key Takeaways

```
SYSTEM DESIGN PART 2 — SEARCH, GEO, FEEDS & MEDIA
═══════════════════════════════════════════════════════════════
Every design here applies the Ch 35 Part A playbook: clarify →
estimate → architecture → critical path → data model → scaling →
failures → ONE deep LLD crux → follow-ups.

THE META-LESSON
  • Read-heavy systems PRECOMPUTE: move work off the hot path
    (offline pipelines, fan-out-on-write, transcode-then-cache).
  • One data structure or one split usually IS the answer:
    trie, Bloom filter, geohash/S2, in-memory grid, sorted set,
    segmented media, content-addressed chunks.
  • Name what you sacrificed (CAP/PACELC): freshness, exactness,
    durability of ephemeral data — in exchange for latency/scale.

5 · AUTOCOMPLETE (trie + precomputed top-K)
  • Trie sharded by prefix; each node caches its top-K → serving
    is O(prefix length), never a subtree scan.
  • Split offline popularity mining from online read-only serving.
  • Atomic snapshot swap; edit-distance/embeddings for typos.
  • Crux: node layout + cross-shard top-K merge + memory math.

6 · WEB CRAWLER (URL frontier + Bloom dedupe)
  • Frontier = front queues (priority) + back queues (per-host
    politeness) + host heap (the politeness clock).
  • Bloom filter for seen-URLs (GB, not TB); sim-hash for near-dups.
  • Cache DNS + robots; trap defenses; conditional GET for freshness.
  • Crux: the two-level frontier; Bloom-filter seen-set at scale.

7 · PROXIMITY / NEARBY (geohash vs quadtree vs S2)
  • "Within R km" = encode cell + search NEIGHBORS + exact-distance
    refine. Never scan all points; never trust one cell.
  • Geohash = simplest; quadtree = density-adaptive; S2 = sphere-
    correct + range-shardable (Google's choice).
  • Moving dots → in-memory grid, last-write-wins, TTL (not a DB).
  • Crux: the three indexes + the radius-search algorithm.

8 · RIDE-HAILING (grid + atomic claim)
  • Location writes ~1M/s → RAM grid, LWW; matches ~100s/s → strong.
  • No double-dispatch: atomic SET NX with a TTL (crash-safe lock).
  • Trip = explicit state machine; surge = supply/demand per cell.
  • Crux: matching loop + atomic claim (one driver, one trip).

9 · NEWS FEED (push vs pull vs HYBRID)
  • Reads ≫ writes → precompute (push) for normal users; the
    celebrity hot key (10^8 followers) forces pull-on-read.
  • Timeline cache = capped Redis sorted set; cursor pagination.
  • Read = your pushed feed ∪ pulled celeb posts → rank.
  • Crux: the hybrid fan-out decision, proven with follower math.

10 · VIDEO STREAMING (transcode + ABR)
  • Chunk at GOP boundaries → encode chunks × renditions in
    parallel → package into aligned segments + manifest.
  • ABR: dumb cacheable files + smart client; player switches
    rendition per segment by measured bandwidth (HLS/DASH).
  • >95% of bytes from CDN; approximate, batched view counts.
  • Crux: parallel transcode pipeline + manifest/segment model.

11 · FILE SYNC (chunk + dedupe + delta sync)
  • Split metadata (txn DB: file→[chunkHash], versions) from blocks
    (content-addressed object store) — that split IS the design.
  • Delta sync: transfer ONLY changed chunks (both up and down).
  • Content hash → dedupe + integrity; refcount + GC; CDC for inserts.
  • Conflicts → keep-both copies, not silent last-writer-wins.
  • Crux: chunking + content-hash dedupe + delta-sync flow.

12 · URL SHORTENER (warm-up)
  • Distributed ID → base62 = short codes, zero collision logic.
  • 100:1 read:write → cache-first; redirect in <50 ms.
  • 301 (cacheable, fast, no analytics) vs 302 (every click hits
    you, trackable/editable) — state the trade-off explicitly.
  • Crux: ID generation + the 301/302 decision.

RECURRING PATTERNS TO RECITE
  • Precompute on write to make reads O(1) (feed, autocomplete).
  • Approximate at scale: Bloom (membership), sim-hash (near-dup),
    HyperLogLog (unique counts), count-min (heavy hitters).
  • In-memory + last-write-wins for high-rate ephemeral data
    (locations); durable + atomic for the small valuable path.
  • Content-addressing = dedupe + integrity + idempotency.
  • CDN + immutable segments/objects = affordable global delivery.
  • Cells + neighbors + refine = every geo query.
```

**Where to go next:** Part 1 (**Ch 35**) for real-time & communication (notifications, chat,
video conferencing, collaborative editing) and the universal **Part A playbook**; Part 3
(**Ch 37**) for scale/infra/money & AI designs (rate limiter, Snowflake IDs, top-K, leaderboard,
distributed cache, job scheduler, payments, KV store, plus the AI-flavored bridge). The general
theory these case studies assemble lives in **Ch 23** (foundations & protocols), **Ch 24** (data
& distributed systems), **Ch 25** (operations & the Instagram worked example), and **Ch 26** (ML
system design).
