# Chapter 34 — MongoDB Senior Engineer (Enterprise Architecture) Interview Prep

A round-by-round guide for MongoDB's Gurugram **Senior Engineer, Enterprise Architecture** role, on a small AI-experimentation team: what each round tests, reported and likely questions with model answers, AI-focused low-level design, system design, MongoDB internals, and LLM / RAG / agent fundamentals. Researched 16 Nov 2026. All code is Java (Java 17+). Classic DSA practice lives in [chapters 31–31d](#content/31_dsa_foundations).

<span class="qa-tag tag-reported">Reported</span> seen in real MongoDB candidate reports &nbsp; <span class="qa-tag tag-likely">Likely</span> expected from this job description &nbsp; <span class="qa-tag tag-core">Core</span> must-know basics

> [!WARNING]
>
> **Heads-up:** This team is new (AI experimentation). There are no public interview reports for this exact team yet. The rounds below come from MongoDB engineering interviews, including a Gurugram SWE3 loop from 2026. **Ask your recruiter what each round covers.**

## 34.1 Role & interview process

<div class="md-cards">

<div class="md-card">

#### What the job is

- Small **AI-experimentation** team inside Enterprise Architecture, partnering with Internal Engineering.
- Test new AI capabilities on **real internal use cases** before they reach the roadmap.
- Build lightweight prototypes to **“validate or kill ideas quickly”**.
- Write up what you learn, then **hand off** what works to product/platform teams.

</div>

<div class="md-card">

#### What they want

- Deep in one language (Python, TypeScript, Go, Rust…).
- **Language note:** Java counts as your “one language” and is fine for the coding rounds, but AI prototypes here are likely in Python or TypeScript (LangGraph, FastAPI, Next.js). Be ready to read Python and sketch a prototype in it.
- Hands-on LLM/agent work: **evals, fine-tuning, RAG, tool use, orchestration**.
- Full-stack: UI → API → data pipelines.
- Nice: Next.js/React, FastAPI, LangGraph, vector DBs, transformer internals, Kubernetes, CI/CD.
- The same team also posted **Software Engineer 3**, so ask which level you’re interviewing for.

</div>

</div>

### Rounds (typical; ~1–5 weeks end to end)

| # | Round | Length | What they check | Eliminatory? | Prep here |
|---|---|---|---|---|---|
| 1 | Recruiter screen | 30 min | Background, why MongoDB, level, logistics | — | 2 |
| 2 | Coding (live, CoderPad, with an engineer) | 60 min | Working code, edge cases, tests, concurrency | **Yes** | 3A–3C |
| 3 | **Low-level design: AI-focused** (confirmed for this loop) | 60 min | Classes and interfaces for code that talks to AI; possibly AI-assisted (graded on how you use the AI) | — | 4A–4D |
| 4 | Hiring manager | 60 min | Project deep dive + behavioral | **Yes** | 5 |
| 5 | Real-world problem | 60 min | Build something practical from a real scenario | — | 6, 4D |
| 6 | System design | 60 min | Scalable, reliable design and trade-offs | — | 7, 8, 9 |
| 7 | Director / VP (senior roles, sometimes) | 30–45 min | Scope, influence, judgment | — | 11, 10 |

Gurugram 2026 example (SWE3): DSA → HM (both eliminatory) → real-world problem → HLD. All four took about 10 days, and the offer came 4 days later. A strong HM round outweighed one weak round.

### How MongoDB scores you (from MongoDB’s own engineering blog)

| Axis | What “good” looks like |
|---|---|
| Writing code | Knows the language well; **concurrency-safe**; handles edge cases; good OO design |
| Software engineering | Data structures and algorithms; trade-offs (time vs memory); **tests own code** |
| Collaboration | Readable code; responds well to hints; says clearly where you’re stuck |
| Systems design | Scales for concurrency, throughput, reliability; avoids bottlenecks; proves correctness; weighs alternatives |

> [!NOTE]
>
> MongoDB says its questions are **“typically sourced from real problems we have had to solve”**, with **no riddles**. One Gurugram candidate called it “the most well-structured and close to real-world” of 30+ interviews they gave, with little LeetCode grinding needed.

## 34.2 Recruiter screen (30 min)

<details>
<summary><strong>R1 · Tell me about yourself.</strong> — Reported</summary>

**Answer shape (90 seconds)**

1. **Now:** “I’m a senior engineer at \_\_\_, working on \_\_\_ at \_\_\_ scale.”
2. **Proof 1:** one big impact, with a number (latency, reliability, revenue, hours saved).
3. **Proof 2:** AI work you built **end to end**. This team cares about it most.
4. **Why now:** “I want to spend my time running fast AI experiments that change how engineers work. That’s exactly this team’s charter.”

> [!TIP]
>
> Your strongest proof is likely an **AI agent that automates real engineering work**, for example one that investigates reliability issues, queries telemetry, writes the RCA and opens a PR. Talk about outcomes (time saved, accuracy, adoption), not internal names. Keep confidential details out.

</details>

<details>
<summary><strong>R2 · Why MongoDB?</strong> — Reported</summary>

- **Product:** a developer data platform. The document model plus Atlas Vector Search keeps **operational data and embeddings in one place**, which is a real advantage for AI apps.
- **Team:** the experiment → validate → hand-off loop is what you enjoy, and you have done it before.
- **Culture:** name one value that fits you, e.g. *Be Intellectually Honest*: you kill your own ideas when the data says so.

**Avoid:** “It’s a great company.” Be specific.

</details>

<details>
<summary><strong>R3 · Why this team (Enterprise Architecture / AI experimentation)?</strong> — Likely</summary>

Give three reasons, each with a one-line example:

1. You like turning AI hype into **evidence** (you build eval sets before you argue).
2. You have **shipped prototypes and handed them off** to other teams.
3. You **write things down** (design docs, learnings), so others can reuse the knowledge.

</details>

<details>
<summary><strong>R4 · What hands-on AI / LLM work have you done?</strong> — Likely</summary>

Prepare **two** stories in this shape:

**Problem** → **what you built** (model, RAG or agent, tools, stack) → **how you measured** (eval set, metric, baseline) → **result** (numbers) → **what you learned or killed**.

</details>

<details>
<summary><strong>R5 · Level, notice period, compensation, other interviews.</strong> — Reported</summary>

- Be honest about your notice period. The Gurugram candidate asked for fast scheduling and got it.
- Ask: “Am I being considered for Senior Engineer or SE3?” Both are open for this team. Level is decided in the debrief, so **argue for your level with evidence** in the design and HM rounds.
- Compensation: ask for their band first, or give a researched range. Don’t anchor low.

</details>

<details>
<summary><strong>R6 · What should I ask the recruiter?</strong> — Likely</summary>

- Which rounds, in what order, and which are eliminatory?
- Can I code in Java in every round? Must the code run in CoderPad? Which language does the team prototype in (Python, TypeScript)?
- Is the system design round AI-flavored or distributed-systems-flavored?
- Is there a code-review or debugging round?
- In the LLD round, is an AI assistant allowed or expected? Which tool? Is there starter code?
- Team size in Gurugram, and where does the manager sit?
- Hybrid/office policy and the expected timeline.

</details>

## 34.3 Coding round (60 min, eliminatory)

Live coding on CoderPad with one or two MongoDB engineers. Problems are usually LeetCode-style **with a practical twist**, and you’re often asked to run the code. Around 21% of reported problems are Hard. Interviewers value **working, tested, thread-safe code** over clever Big-O.

| Minutes | Do this |
|---|---|
| 0–5 | Clarify inputs, outputs, sizes, edge cases, **single- or multi-threaded?** Write 2–3 examples. |
| 5–10 | Explain the approach and complexity; get a nod before coding. |
| 10–40 | Code: clear names, small methods, no premature optimization. |
| 40–50 | **Test unprompted**: your examples plus edge cases (empty, duplicates, out-of-order). |
| 50–60 | Follow-ups: “make it thread-safe”, “scale it”, “cut memory”. |

> [!NOTE]
>
> **Java note:** the JD lists Python, TypeScript, Go and Rust, but MongoDB lets you choose your language. Confirm Java with the recruiter (almost always fine). Know your `java.util.concurrent` toolbox cold (see C12).

### 34.3A · Build-a-component problems (MongoDB’s favorite style)

<details>
<summary><strong>C1 · Versioned document store: PUT(docId, content, ts) / GET(docId, ts)</strong> — Reported · Gurugram 2026</summary>

**Problem**

`PUT(docId, content, timestamp)` may be called many times per doc. `GET(docId, timestamp)` returns the content of the version **just before** that timestamp, or `""` if there is none.

**Example:**

```
put(1, "v1", 10)
put(1, "v2", 20)
get(1, 15) → "v1"     // newest version at or before 15
get(1, 20) → "v2"     // a version exactly at 20 counts
get(1, 5)  → ""       // nothing that early
get(2, 99) → ""       // unknown doc
```

**Ask first**

- Is a version exactly *at* the timestamp included? (The code says yes; for “strictly before” use `lowerEntry`.)
- Can timestamps arrive out of order? Can the same timestamp be written twice? (Yes: the last write wins.)
- Can content be null or empty? (The code rejects null, so `""` always means “no version”.)
- Thread-safe? How many docs and versions (memory)?

**Idea**

Per document, keep a **sorted map timestamp → content**. GET is a *floor* lookup (largest key ≤ ts). The Gurugram candidate used a BST; Java’s `TreeMap` is a red-black tree.

```java
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/** put(docId, content, ts) stores a version; get(docId, ts) returns the latest version at or before ts. */
public class VersionedStore {
    // docId -> (timestamp -> content). TreeMap is a red-black tree: out-of-order writes stay O(log n).
    private final Map<Integer, TreeMap<Long, String>> docs = new HashMap<>();
    private final ReadWriteLock rw = new ReentrantReadWriteLock();   // many readers OR one writer

    public void put(int docId, String content, long ts) {
        Objects.requireNonNull(content, "content");                  // null would break GET's "" contract
        rw.writeLock().lock();
        try {
            docs.computeIfAbsent(docId, id -> new TreeMap<>()).put(ts, content);   // same ts overwrites
        } finally {
            rw.writeLock().unlock();
        }
    }

    public String get(int docId, long ts) {
        rw.readLock().lock();
        try {
            TreeMap<Long, String> versions = docs.get(docId);
            if (versions == null) return "";
            Map.Entry<Long, String> e = versions.floorEntry(ts);   // "strictly before" -> lowerEntry(ts)
            return e == null ? "" : e.getValue();
        } finally {
            rw.readLock().unlock();
        }
    }
}
```

**Complexity**

put/get O(log v), where v = versions of that doc. Memory O(total versions).

**Follow-ups**

- **Strictly before?** Use `lowerEntry(ts)`.
- **Highly concurrent?** `ConcurrentHashMap<Integer, ConcurrentSkipListMap<Long,String>>` gives lock-free reads and writes and still O(log n).
- **Memory grows forever?** Keep the last N versions, or drop versions older than the oldest active reader (MVCC garbage collection).
- **Range of versions?** `subMap(t1, true, t2, true)`.
- **Durability?** Append-only log plus periodic snapshot; replay on restart.

> [!TIP]
>
> Point out that **this is MVCC**, the same idea MongoDB’s WiredTiger storage engine uses for snapshot reads. Related: LeetCode 981 *Time Based Key-Value Store*. Timestamps only increase there, so ArrayList + binary search is enough.

</details>

<details>
<summary><strong>C2 · Snapshot Array (set / snap / get at a snapshot)</strong> — Reported</summary>

**Problem**

Build an array of `length` numbers, all starting at 0, that supports:

- `set(index, val)`: set the element at `index` to `val`.
- `snap()`: take a snapshot and return its id (0, 1, 2…, i.e. the number of earlier snaps).
- `get(index, snapId)`: return the value at `index` as it was when snapshot `snapId` was taken.

**Example:** `set(0,5)` → `snap()` returns 0 → `set(0,6)` → `get(0,0)` returns **5** (not 6).

LeetCode 1146. Up to 50,000 elements and 50,000 calls, so copying the whole array on every snap is too slow and too big.

**Ask first**

- How big can `length` be, and how many snaps and sets? **Few writes but many snaps** rules out copying.
- Several `set`s on the same index before one `snap`: does the **last one win**?
- Is a value set *after* a snap visible in that snap? (No: the snapshot is frozen.)
- Invalid `index` or a `snapId` not taken yet: throw an error or return 0? (The code below throws; LeetCode guarantees valid input.)
- Thread-safe? Should old snapshots ever be deleted (memory)?

**Idea**

Don’t copy the array on `snap()`. Store only changes per index (`snapId → value`); `get` is a floor lookup (the latest change at or before that snapshot). A `set` before the next `snap()` is stored under the *current* id, so it belongs to the snapshot about to be taken.

```java
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/** LeetCode 1146. Store only the changes: for each index, snapId -> value.
 *  Single-threaded; see the follow-ups for a thread-safe version. */
public class SnapshotArray {
    private final List<TreeMap<Integer, Integer>> history = new ArrayList<>();
    private int snapId = 0;                        // id the NEXT snap() will return

    public SnapshotArray(int length) {
        for (int i = 0; i < length; i++) history.add(new TreeMap<>());
    }

    public void set(int index, int val) {
        history.get(index).put(snapId, val);       // several sets in one snapshot: last one wins
    }

    public int snap() {
        return snapId++;
    }

    public int get(int index, int snapshotId) {
        if (snapshotId < 0 || snapshotId >= snapId) {             // only snapshots already taken
            throw new IllegalArgumentException("unknown snapshot " + snapshotId);
        }
        Map.Entry<Integer, Integer> e = history.get(index).floorEntry(snapshotId);
        return e == null ? 0 : e.getValue();       // never set before that snapshot -> 0
    }
}
```

**Complexity**

set and get O(log k), where k = values stored for that index (at most the number of snaps); snap O(1). Memory O(length + number of sets): one empty map per index, plus one entry per distinct (index, snapshot) write.

**Follow-ups**

- **Huge length, few writes?** Create maps lazily (`HashMap<Integer, TreeMap>`) so memory is O(number of sets) only.
- **Less memory / no boxing?** Per index, keep growing `int[]` arrays of (snapId, value) plus binary search. Snap ids only grow, so a new write either appends or overwrites the last entry.
- **Thread-safe?** The race to explain: a setter reads `snapId = 3`, then `snap()` returns 3, then the setter writes, and the snapshot that was “taken” changes afterwards. Fix: `set` holds a **read lock** (many setters in parallel), `snap` takes the **write lock** (waits for in-flight sets), and per-index maps become `ConcurrentSkipListMap`. Reads of old snapshots need no lock, because those entries never change. Simplest acceptable answer: `synchronized` methods.
- **Free old snapshots?** `release(snapId)`: per index, keep only the newest entry ≤ the oldest snapshot still in use. That’s MVCC garbage collection, as in C1.

</details>

<details>
<summary><strong>C3 · Inverted index: insert, delete, search, andSearch</strong> — Reported · Glassdoor Sr SWE</summary>

**Problem**

Implement an inverted index with `insert(String doc)`, `search(String term)`, `delete(String doc)`, `andSearch(String t1, String t2)`.

**Example:**

```
insert("MongoDB stores documents")                → doc 0
insert("Atlas Vector Search stores embeddings")   → doc 1
insert("Search documents fast")                   → doc 2
search("stores")                  → [doc 0, doc 1]
andSearch("search", "documents")  → [doc 2]
search("MongoDB!")                → [doc 0]     // query uses the same tokenizer
delete("Search documents fast")
andSearch("search", "documents")  → []
```

**Ask first**

- Tokenizing: case-insensitive? Punctuation? Non-English letters? (Use **one** tokenizer for documents and queries, so “MongoDB!” finds “mongodb”.)
- Is a document identified by its text or by an id? What if the same text is inserted twice?
- Result order: insertion order, or ranked by relevance?
- A multi-word query: AND, OR, or an exact phrase? (The code ANDs the words.)
- How many documents? Does the index fit in memory?

**Idea**

**term → sorted set of doc ids**, plus **doc → its terms** so delete only touches that doc’s terms.

```java
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.TreeSet;
import java.util.regex.Pattern;

/** insert(doc), delete(doc), search(term), andSearch(term1, term2). */
public class InvertedIndex {
    private static final Pattern NON_WORD = Pattern.compile("[^\\p{L}\\p{N}]+");   // any language's letters/digits

    private final Map<String, TreeSet<Integer>> postings = new HashMap<>();   // term -> sorted doc ids
    private final Map<Integer, String> textById = new HashMap<>();
    private final Map<Integer, Set<String>> termsById = new HashMap<>();      // makes delete cheap
    private final Map<String, Integer> idByText = new HashMap<>();            // same text = same doc
    private int nextId = 0;

    /** ONE tokenizer for documents AND queries, so "MongoDB!" finds "mongodb". */
    private static Set<String> terms(String text) {
        Set<String> out = new HashSet<>();
        for (String t : NON_WORD.split(text.toLowerCase(Locale.ROOT))) {   // ROOT: no Turkish-I surprises
            if (!t.isEmpty()) out.add(t);
        }
        return out;
    }

    public int insert(String doc) {
        Objects.requireNonNull(doc, "doc");
        Integer existing = idByText.get(doc);
        if (existing != null) return existing;
        int id = nextId++;
        Set<String> docTerms = terms(doc);
        idByText.put(doc, id);
        textById.put(id, doc);
        termsById.put(id, docTerms);
        for (String t : docTerms) postings.computeIfAbsent(t, k -> new TreeSet<>()).add(id);
        return id;
    }

    public boolean delete(String doc) {
        Integer id = idByText.remove(doc);
        if (id == null) return false;
        textById.remove(id);
        for (String t : termsById.remove(id)) {      // touch only this doc's terms
            TreeSet<Integer> ids = postings.get(t);
            ids.remove(id);
            if (ids.isEmpty()) postings.remove(t);
        }
        return true;
    }

    public List<String> search(String term) {
        return texts(postingsFor(term));
    }

    public List<String> andSearch(String term1, String term2) {
        return texts(intersect(postingsFor(term1), postingsFor(term2)));
    }

    /** A query that tokenizes into several words ("vector-search") must match all of them. */
    private TreeSet<Integer> postingsFor(String term) {
        Objects.requireNonNull(term, "term");
        TreeSet<Integer> result = null;
        for (String t : terms(term)) {
            TreeSet<Integer> ids = postings.getOrDefault(t, new TreeSet<>());
            result = result == null ? ids : intersect(result, ids);
        }
        return result == null ? new TreeSet<>() : result;
    }

    private static TreeSet<Integer> intersect(TreeSet<Integer> a, TreeSet<Integer> b) {
        if (a.size() > b.size()) { TreeSet<Integer> tmp = a; a = b; b = tmp; }   // loop over the smaller list
        TreeSet<Integer> out = new TreeSet<>();
        for (int id : a) if (b.contains(id)) out.add(id);
        return out;
    }

    private List<String> texts(Collection<Integer> ids) {
        List<String> out = new ArrayList<>();
        for (int id : ids) out.add(textById.get(id));
        return out;
    }
}
```

**Complexity**

insert/delete O(T·log n) for T distinct terms in the doc; search for one word O(r) for r results; andSearch O(min(|a|,|b|)·log n).

**Follow-ups**

- **OR / NOT:** union / difference.
- **Faster AND on huge lists:** lists are sorted, so use a two-pointer merge O(a+b), galloping, or skip pointers.
- **Phrase search** (“vector search”): positional index, term → doc → positions.
- **Ranking:** TF-IDF / BM25.
- **Scale:** shard by doc id, fan out the query, merge results. This is how Lucene and Atlas Search work.
- **Concurrency:** ReadWriteLock, or immutable segments plus background merges (the Lucene approach).

</details>

<details>
<summary><strong>C4 · LRU cache (and a high-concurrency version)</strong> — Reported</summary>

**Problem**

Design a cache with a fixed `capacity`. `get(key)` returns the value (or null if missing) and marks the key as recently used. `put(key, value)` inserts or updates; when the cache is full it first evicts the **least recently used** key. Both must be **O(1)**. Follow-up: make it fast under many threads. (LeetCode 146)

**Example:**

```
capacity = 2
put(1, a)   put(2, b)
get(1) → a           // 1 is now the most recent
put(3, c)            // full: evicts 2, the least recently used
get(2) → null
put(4, d)            // evicts 1
get(1) → null   get(3) → c   get(4) → d
```

**Ask first**

- How big is `capacity`? Does updating an existing key count as a “use”? (Yes.)
- Null keys or values allowed? (The code rejects them: a null value would look like a miss.)
- Single-threaded, or many threads? Read-heavy?
- Also expire entries by time (TTL)? Need an eviction callback?

**Idea**

**HashMap key → node** plus a **doubly linked list** ordered by recency. Sentinel head/tail nodes remove null checks. get/put are O(1).

```java
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.locks.ReentrantLock;

/** O(1) get/put: HashMap for lookup + doubly linked list for recency (head side = most recent). */
public class LRUCache<K, V> {
    private static final class Node<K, V> {
        K key;
        V val;
        Node<K, V> prev, next;
        Node(K key, V val) { this.key = key; this.val = val; }
    }

    private final int capacity;
    private final Map<K, Node<K, V>> map = new HashMap<>();
    private final Node<K, V> head = new Node<>(null, null);    // sentinels: no null checks needed
    private final Node<K, V> tail = new Node<>(null, null);
    private final ReentrantLock lock = new ReentrantLock();     // get() also mutates order -> exclusive lock

    public LRUCache(int capacity) {
        if (capacity <= 0) throw new IllegalArgumentException("capacity must be positive");
        this.capacity = capacity;
        head.next = tail;
        tail.prev = head;
    }

    public V get(K key) {
        lock.lock();
        try {
            Node<K, V> node = map.get(key);
            if (node == null) return null;
            unlink(node);
            pushFront(node);
            return node.val;
        } finally {
            lock.unlock();
        }
    }

    public void put(K key, V val) {
        Objects.requireNonNull(key, "key");
        Objects.requireNonNull(val, "value");                    // null would look like a cache miss in get()
        lock.lock();
        try {
            Node<K, V> node = map.get(key);
            if (node != null) {
                node.val = val;
                unlink(node);
            } else {
                if (map.size() == capacity) {
                    Node<K, V> lru = tail.prev;
                    unlink(lru);
                    map.remove(lru.key);
                }
                node = new Node<>(key, val);
                map.put(key, node);
            }
            pushFront(node);
        } finally {
            lock.unlock();
        }
    }

    private void unlink(Node<K, V> n) {
        n.prev.next = n.next;
        n.next.prev = n.prev;
    }

    private void pushFront(Node<K, V> n) {
        n.prev = head;
        n.next = head.next;
        head.next.prev = n;
        head.next = n;
    }

    public int size() {
        lock.lock();
        try { return map.size(); } finally { lock.unlock(); }
    }

    /** Shortcut the interviewer may accept once you have shown the real one. */
    static <K, V> Map<K, V> simpleLru(int capacity) {
        return Collections.synchronizedMap(new LinkedHashMap<K, V>(16, 0.75f, true) {   // true = access order
            @Override
            protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
                return size() > capacity;
            }
        });
    }

    /** High-concurrency follow-up: N shards, one lock each. Threads on different shards never block
     *  each other. Trade-off: eviction is exact LRU per shard, approximate overall. */
    static final class ShardedLRUCache<K, V> {
        private final LRUCache<K, V>[] shards;

        @SuppressWarnings({"unchecked", "rawtypes"})
        ShardedLRUCache(int capacity, int shardCount) {
            if (shardCount <= 0 || shardCount > capacity) {
                throw new IllegalArgumentException("need 1 <= shardCount <= capacity");
            }
            shards = new LRUCache[shardCount];
            for (int i = 0; i < shardCount; i++) {                     // spread the remainder: total == capacity
                shards[i] = new LRUCache<>(capacity / shardCount + (i < capacity % shardCount ? 1 : 0));
            }
        }

        private LRUCache<K, V> shard(K key) {
            return shards[Math.floorMod(Objects.requireNonNull(key, "key").hashCode(), shards.length)];
        }

        V get(K key) { return shard(key).get(key); }

        void put(K key, V val) { shard(key).put(key, val); }
    }
}
```

**Complexity**

get/put O(1); memory O(capacity).

**Follow-ups**

- **Why not a ReadWriteLock?** `get()` moves the node, so it is a write.
- **High concurrency:** (a) shard into N caches, each with its own lock (above; the capacity is split so the total never exceeds the limit); (b) approximate LRU, by sampling (like Redis) or by buffering reads and applying them in batches (like Caffeine); (c) in production, just use **Caffeine**.
- **TTL:** store an expiry per node, check it on get, purge lazily.
- **Java shortcut:** `LinkedHashMap(accessOrder=true)` + `removeEldestEntry` (shown). Mention it, but build the real one first.

</details>

<details>
<summary><strong>C5 · Search autocomplete: top-3 hot sentences per prefix</strong> — Reported</summary>

**Problem**

Given past sentences and how many times each was typed, build autocomplete. `input(c)` is called one character at a time; return the **top 3** past sentences that start with what has been typed so far, hottest first (ties: alphabetical). `input('#')` ends the sentence: save it (count +1), reset, and return an empty list. (LeetCode 642)

**Example:**

```
history: "i love you" ×5, "island" ×3, "iroman" ×2, "i love leetcode" ×2
input('i') → ["i love you", "island", "i love leetcode"]   // tie at 2: " " sorts before "r"
input(' ') → ["i love you", "i love leetcode"]
input('a') → []                                             // nothing starts with "i a"
input('#') → []                                             // saves "i a" (count 1), resets
```

**Ask first**

- Always top 3, or a parameter k? Tie-break rule?
- Which characters: lowercase letters and spaces only? Case-sensitive?
- How many sentences, and how long? (Decides whether to cache top-k per node.)
- Does the sentence being typed count before `#`? (No.)

**Idea**

A trie. Each node keeps counts for every sentence below it. Walk one node per typed character (don’t restart from the root). Pick the top 3 with a size-3 heap.

```java
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.PriorityQueue;

/** LeetCode 642: type one char at a time and get the top-3 hot sentences; '#' ends a sentence. */
public class AutocompleteSystem {
    private static final class TrieNode {
        final Map<Character, TrieNode> children = new HashMap<>();
        final Map<String, Integer> counts = new HashMap<>();   // every sentence below this node
    }

    private final TrieNode root = new TrieNode();
    private final StringBuilder prefix = new StringBuilder();
    private TrieNode node = root;                               // where the typed prefix ends; null = no match

    public AutocompleteSystem(String[] sentences, int[] times) {
        for (int i = 0; i < sentences.length; i++) add(sentences[i], times[i]);
    }

    private void add(String sentence, int count) {
        TrieNode cur = root;
        for (char ch : sentence.toCharArray()) {
            cur = cur.children.computeIfAbsent(ch, c -> new TrieNode());
            cur.counts.merge(sentence, count, Integer::sum);
        }
    }

    public List<String> input(char c) {
        if (c == '#') {
            add(prefix.toString(), 1);
            prefix.setLength(0);
            node = root;
            return List.of();
        }
        prefix.append(c);
        if (node != null) node = node.children.get(c);          // one step down, no restart from root
        if (node == null) return List.of();

        Map<String, Integer> counts = node.counts;
        Comparator<String> best = Comparator.<String>comparingInt(s -> counts.get(s)).reversed()
                .thenComparing(Comparator.naturalOrder());       // hotter first, then alphabetical
        PriorityQueue<String> top = new PriorityQueue<>(best.reversed());   // worst of the 3 on top
        for (String s : counts.keySet()) {
            top.offer(s);
            if (top.size() > 3) top.poll();
        }
        List<String> out = new ArrayList<>(top);
        out.sort(best);
        return out;
    }
}
```

**Complexity**

input(c): O(m) to scan the m sentences under the current node (the size-3 heap adds only log 3). `#`: O(L) for a sentence of length L. Memory: each node holds references to every sentence below it, so about O(total characters) map entries.

**Follow-ups**

- Faster reads: cache the top-k at each node and update it on add.
- Web scale: precompute the top-k per prefix offline and serve from a KV store or CDN.
- Typos: fuzzy matching with edit distance. Personalization: blend user and global counts.

</details>

<details>
<summary><strong>C6 · In-memory key-value store with nested transactions (begin / commit / rollback)</strong> — Reported</summary>

**Problem**

Build an in-memory key-value store with `get`, `set`, `delete` and transactions: `begin()` opens one (they can nest), `rollback()` undoes the innermost one, and `commit()` applies the innermost one to its parent, or to the store if it is the outermost.

**Example:**

```
set(a, 10)
begin()             set(a, 20)    get(a) → 20
   begin()          delete(a)     get(a) → null
   rollback()                     get(a) → 20     // inner transaction undone
commit()                          get(a) → 20     // outer transaction saved
```

**Ask first**

- Does `commit` apply only the innermost transaction or **all** open ones? (A common variant commits all.)
- `rollback`/`commit` with no open transaction: error or no-op? (The code throws.)
- Can a value be null? (The code says no: use `delete`.)
- Need `count(value)`? One client, or many at once (isolation level)?

**Idea**

A base map plus a **stack of change layers**. Reads check the innermost layer first. A delete inside a transaction writes a **tombstone** (`Optional.empty()`).

```java
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

/** In-memory key-value store with nested BEGIN / COMMIT / ROLLBACK. */
public class TransactionalKV {
    private final Map<String, String> base = new HashMap<>();
    // Stack of change layers (innermost on top). Optional.empty() = "deleted in this transaction".
    private final Deque<Map<String, Optional<String>>> txns = new ArrayDeque<>();

    public String get(String key) {
        for (Map<String, Optional<String>> layer : txns) {      // iterates innermost -> outermost
            Optional<String> v = layer.get(key);
            if (v != null) return v.orElse(null);
        }
        return base.get(key);
    }

    public void set(String key, String value) {
        Objects.requireNonNull(key, "key");
        Objects.requireNonNull(value, "value (use delete to remove a key)");
        if (txns.isEmpty()) base.put(key, value);
        else txns.peek().put(key, Optional.of(value));
    }

    public void delete(String key) {
        if (txns.isEmpty()) base.remove(key);
        else txns.peek().put(key, Optional.empty());
    }

    public void begin() {
        txns.push(new HashMap<>());
    }

    public void rollback() {
        if (txns.isEmpty()) throw new IllegalStateException("no transaction");
        txns.pop();
    }

    /** Commits the innermost transaction into its parent (or into the base store). */
    public void commit() {
        if (txns.isEmpty()) throw new IllegalStateException("no transaction");
        Map<String, Optional<String>> top = txns.pop();
        if (!txns.isEmpty()) {
            txns.peek().putAll(top);
            return;
        }
        top.forEach((k, v) -> {
            if (v.isPresent()) base.put(k, v.get());
            else base.remove(k);
        });
    }
}
```

**Complexity**

get O(depth); set/delete O(1); commit O(changes in the layer).

**Follow-ups**

- **“COMMIT commits everything”** variant: fold all layers into base.
- **`count(value)` in O(1):** maintain a value → count map and adjust it on set/delete/rollback.
- **Concurrent clients:** each transaction gets a private layer. At commit, check for conflicts (optimistic concurrency) and retry on conflict. Checking the keys you *read* gives serializable isolation; checking only the keys you *wrote* gives snapshot isolation. MongoDB transactions are snapshot isolation: a write-write conflict aborts with `WriteConflict` (retry), but reads aren’t re-checked, so protect cross-document rules with conditional updates.

</details>

<details>
<summary><strong>C7 · Convert a JSON string to an object (write a parser)</strong> — Reported</summary>

**Problem**

Write `parse(String json)` that turns JSON text into Java objects (Map, List, String, numbers, booleans, null) **without a library**. Reject invalid input with a clear error that gives the position.

**Example:**

```
parse('{"name": "Ann", "tags": ["db", "ai"], "age": 31, "score": 9.5, "admin": false, "boss": null}')
  → Map {name=Ann, tags=[db, ai], age=31 (Long), score=9.5 (Double), admin=false, boss=null}
parse('[1,]')     → error: unexpected character at position 3
parse('{"a" 1}')  → error: expected ':' at position 5
```

**Ask first**

- The full JSON spec, or a subset? (`\u` escapes, exponents.)
- Which Java types for numbers? What about integers bigger than a `long`?
- Duplicate keys: last one wins, or an error?
- Limits on nesting depth or input size? Need streaming for huge files?

**Idea**

**Recursive descent**: one method per grammar rule (value, object, array, string, number), a single cursor, and errors that report the position.

```java
import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Recursive-descent JSON parser: one method per grammar rule, one cursor (i).
 *  Returns Map (object), List (array), String, Long/BigInteger, Double/BigDecimal, Boolean or null.
 *  Duplicate keys: the last one wins (like most parsers). */
public class JsonParser {
    private static final Pattern NUMBER =
            Pattern.compile("-?(?:0|[1-9][0-9]*)(?:\\.[0-9]+)?(?:[eE][+-]?[0-9]+)?");
    private static final int MAX_DEPTH = 512;
    private final String s;
    private int i = 0;
    private int depth = 0;

    private JsonParser(String s) { this.s = s; }

    public static Object parse(String text) {
        JsonParser p = new JsonParser(text);
        p.ws();
        Object value = p.value();
        p.ws();
        if (p.i != text.length()) throw p.error("unexpected trailing characters");
        return value;
    }

    // ---- helpers ----
    private IllegalArgumentException error(String msg) {
        return new IllegalArgumentException(msg + " at position " + i);
    }

    private void ws() {
        while (i < s.length() && " \t\n\r".indexOf(s.charAt(i)) >= 0) i++;
    }

    private boolean at(char c) {
        return i < s.length() && s.charAt(i) == c;
    }

    private void expect(char c) {
        if (!at(c)) throw error("expected '" + c + "'");
        i++;
    }

    // ---- grammar ----
    private Object value() {
        if (i >= s.length()) throw error("unexpected end of input");
        char c = s.charAt(i);
        if (c == '{' || c == '[') {
            if (++depth > MAX_DEPTH) throw error("nesting deeper than " + MAX_DEPTH);   // instead of StackOverflowError
            Object v = c == '{' ? object() : array();
            depth--;
            return v;
        }
        if (c == '"') return string();
        if (c == '-' || (c >= '0' && c <= '9')) return number();
        if (s.startsWith("true", i))  { i += 4; return Boolean.TRUE; }
        if (s.startsWith("false", i)) { i += 5; return Boolean.FALSE; }
        if (s.startsWith("null", i))  { i += 4; return null; }
        throw error("unexpected character");
    }

    private Map<String, Object> object() {
        expect('{');
        Map<String, Object> obj = new LinkedHashMap<>();
        ws();
        if (at('}')) { i++; return obj; }
        while (true) {
            ws();
            String key = string();
            ws();
            expect(':');
            ws();
            obj.put(key, value());
            ws();
            if (at(',')) { i++; continue; }
            expect('}');
            return obj;
        }
    }

    private List<Object> array() {
        expect('[');
        List<Object> arr = new ArrayList<>();
        ws();
        if (at(']')) { i++; return arr; }
        while (true) {
            ws();
            arr.add(value());
            ws();
            if (at(',')) { i++; continue; }
            expect(']');
            return arr;
        }
    }

    private String string() {
        expect('"');
        StringBuilder out = new StringBuilder();
        while (true) {
            if (i >= s.length()) throw error("unterminated string");
            char c = s.charAt(i);
            if (c < 0x20) throw error("unescaped control character in string");   // JSON forbids raw newlines/tabs
            i++;
            if (c == '"') return out.toString();
            if (c != '\\') { out.append(c); continue; }
            if (i >= s.length()) throw error("unterminated string");
            char esc = s.charAt(i++);
            switch (esc) {
                case '"' -> out.append('"');
                case '\\' -> out.append('\\');
                case '/' -> out.append('/');
                case 'b' -> out.append('\b');
                case 'f' -> out.append('\f');
                case 'n' -> out.append('\n');
                case 'r' -> out.append('\r');
                case 't' -> out.append('\t');
                case 'u' -> out.append(unicodeEscape());
                default -> throw error("bad escape");
            }
        }
    }

    private char unicodeEscape() {
        if (i + 4 > s.length()) throw error("bad \\u escape");
        int code = 0;
        for (int k = 0; k < 4; k++) {
            int digit = Character.digit(s.charAt(i + k), 16);
            if (digit < 0) throw error("bad \\u escape");
            code = code * 16 + digit;
        }
        i += 4;
        return (char) code;
    }

    private Object number() {
        Matcher m = NUMBER.matcher(s).region(i, s.length());
        if (!m.lookingAt()) throw error("bad number");
        String text = m.group();
        i = m.end();
        boolean isDecimal = text.contains(".") || text.contains("e") || text.contains("E");
        // Separate returns on purpose: `isDecimal ? Double : Long` would turn every Long into a double.
        if (isDecimal) {
            double d = Double.parseDouble(text);
            return Double.isInfinite(d) ? new BigDecimal(text) : (Object) d;   // 1e400 doesn't fit a double
        }
        try {
            return Long.parseLong(text);
        } catch (NumberFormatException tooBig) {
            return new BigInteger(text);                     // JSON has no size limit on integers
        }
    }
}
```

**Complexity**

O(n) time for n characters; O(depth) stack; O(n) memory for the result.

**Follow-ups**

- **Very deep nesting:** recursion would overflow the stack (`StackOverflowError`), so the code caps depth at 512. An explicit stack removes the limit.
- **Huge numbers:** handled. Integers fall back to `BigInteger`, decimals to `BigDecimal`.
- **Huge files:** a streaming tokenizer with an event API (like Jackson’s `JsonParser`).
- **Java gotcha:** `cond ? Double : Long` silently turns the Long into a double, so the code uses separate `return`s.
- **Strictness:** raw control characters (a real newline) inside strings are rejected, as the spec requires.
- **MongoDB angle:** BSON is binary JSON with extra types (ObjectId, Date, int64, Decimal128).

</details>

### 34.3B · Concurrency (MongoDB asks this a lot)

<details>
<summary><strong>C8 · Multithreaded web crawler (same hostname only)</strong> — Reported · CoderPad</summary>

**Problem**

Given `startUrl` and a slow `HtmlParser.getUrls(url)`, crawl every reachable URL with the same hostname, using multiple threads.

**Example:**

```
http://a.com/    links to  http://a.com/x, http://b.com/
http://a.com/x   links to  http://a.com/, http://a.com/x#top
http://b.com/    links to  http://a.com/y

crawl("http://a.com/") → [http://a.com/, http://a.com/x, http://a.com/x#top]
// b.com is another host: skipped, so a.com/y is never found
// a.com/ is not fetched twice (seen-set)
// x#top counts as a new page unless you normalize fragments (see Ask first)
```

**Ask first**

- Exactly the same hostname, or subdomains too? Do the port and scheme matter?
- Normalize URLs first (drop `#fragment`, trailing slash)?
- Is `getUrls` thread-safe? Can it fail or hang (timeouts)?
- How many threads? Any rate limit per host?
- If stopped early, return only the pages fetched, or everything discovered? (The code returns everything discovered.)

**Idea**

Thread pool, plus a **thread-safe seen-set** whose `add()` is an atomic check-then-act. **Only the main thread submits tasks and counts in-flight work**, so termination is clean and no worker ever waits on another.

```java
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import java.util.concurrent.CompletionService;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorCompletionService;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

/** Multithreaded crawler (LeetCode 1242 style): visit every URL reachable from startUrl
 *  on the same hostname. getUrls() is a slow, blocking (I/O) call. */
public class WebCrawler {
    public interface HtmlParser {
        List<String> getUrls(String url);
    }

    public static List<String> crawl(String startUrl, HtmlParser parser, int threads, AtomicBoolean stop)
            throws InterruptedException {
        String host = hostOf(startUrl);
        Set<String> seen = ConcurrentHashMap.newKeySet();
        seen.add(startUrl);
        ExecutorService pool = Executors.newFixedThreadPool(threads);
        CompletionService<List<String>> done = new ExecutorCompletionService<>(pool);
        try {
            done.submit(() -> fetch(startUrl, parser, host, seen));
            int inFlight = 1;
            // Only this thread submits work and counts tasks, so termination is simple
            // (inFlight == 0) and no worker ever waits on another worker -> no deadlock.
            while (inFlight > 0 && !stop.get()) {
                List<String> fresh;
                try {
                    fresh = done.take().get();             // blocks until ANY task finishes
                } catch (ExecutionException e) {
                    fresh = List.of();                     // one bad page must not kill the crawl
                }
                inFlight--;
                for (String url : fresh) {
                    done.submit(() -> fetch(url, parser, host, seen));
                    inFlight++;
                }
            }
        } finally {
            pool.shutdownNow();                            // stop requested / error: interrupt workers
        }
        return new ArrayList<>(new TreeSet<>(seen));
    }

    public static List<String> crawl(String startUrl, HtmlParser parser, int threads) throws InterruptedException {
        return crawl(startUrl, parser, threads, new AtomicBoolean(false));
    }

    /** Runs on a worker thread. Returns only the URLs this call claimed first. */
    private static List<String> fetch(String url, HtmlParser parser, String host, Set<String> seen) {
        List<String> fresh = new ArrayList<>();
        try {
            for (String next : parser.getUrls(url)) {
                // seen.add() is an atomic check-then-act: exactly one thread wins each URL
                if (host.equals(hostOf(next)) && seen.add(next)) fresh.add(next);
            }
        } catch (RuntimeException e) {
            // log and skip this page
        }
        return fresh;
    }

    private static String hostOf(String url) {
        try {
            return URI.create(url).getHost();
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
```

**Complexity**

Each URL is fetched once: O(V + E) for V pages and E links. Wall time ≈ (V ÷ threads) × fetch latency.

**Reported follow-ups, with answers**

- **How does it terminate?** When the in-flight counter reaches 0. No busy-waiting, no “sleep and hope”.
- **Deadlock risk?** The classic one is a task in a fixed-size pool blocking on a sub-task that can’t get a thread. Here only the main thread waits.
- **Shutdown?** `finally → shutdownNow()` interrupts workers. For a graceful stop: stop submitting, then `shutdown()` + `awaitTermination(timeout)`.
- **“Can other threads see a changed boolean flag?”** Only if it is `volatile` or an `AtomicBoolean` (Java Memory Model visibility). A plain boolean can be cached or hoisted, and the loop never stops.
- **Why not `synchronized` + HashSet?** It works, but `ConcurrentHashMap.newKeySet()` scales better.
- **I/O-bound:** more threads than cores is fine. Java 21+: `Executors.newVirtualThreadPerTaskExecutor()`.
- **Production:** per-host rate limits, robots.txt, depth limit, URL normalization.
- **Distributed:** URL frontier in a queue, seen-set in Redis or a Bloom filter, partition by host.

</details>

<details>
<summary><strong>C9 · Bounded blocking queue (producer / consumer)</strong> — Reported</summary>

**Problem**

Implement a fixed-capacity queue shared by producer and consumer threads: `put(item)` waits while the queue is full, `take()` waits while it is empty. Add a clean way to shut it down. (Like LeetCode 1188.)

**Example:**

```
capacity = 2
put(1)   put(2)              // now full
offer(3, 50 ms) → false      // still full after 50 ms
take() → 1                   // frees a slot
put(3)                       // succeeds at once
close()
take() → 2   take() → 3      // consumers drain what's left
take() → null                // closed and empty: the consumer exits
```

**Ask first**

- Multiple producers and consumers? (Assume yes.)
- Need timeouts (`offer`/`poll`) as well as blocking calls?
- On shutdown: let consumers **drain** what’s left, or drop it?
- Can items be null? (The code says no: `take()` returns null only to mean “closed and empty”.)
- Must waiting threads be served in FIFO order (fairness)?

**Idea**

One lock with two conditions: producers wait on `notFull`, consumers on `notEmpty`, and each side signals the other after it changes the queue.

```java
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Objects;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;

/** Producer/consumer queue: put() blocks while full, take() blocks while empty.
 *  One lock, two conditions (notFull, notEmpty) so we wake only the side that can make progress. */
public class BoundedBlockingQueue<T> {
    private final Deque<T> items = new ArrayDeque<>();   // ArrayDeque rejects null, so null can mean "closed"
    private final int capacity;
    private final ReentrantLock lock = new ReentrantLock();
    private final Condition notFull = lock.newCondition();
    private final Condition notEmpty = lock.newCondition();
    private boolean closed = false;                        // guarded by lock

    public BoundedBlockingQueue(int capacity) {
        if (capacity <= 0) throw new IllegalArgumentException("capacity must be positive");
        this.capacity = capacity;
    }

    public void put(T item) throws InterruptedException {
        Objects.requireNonNull(item, "item (null is reserved to mean 'closed')");
        lock.lock();
        try {
            while (items.size() == capacity && !closed) notFull.await();   // WHILE, not if: spurious wake-ups
            if (closed) throw new IllegalStateException("queue closed");
            items.addLast(item);
            notEmpty.signal();                             // wake one consumer
        } finally {
            lock.unlock();
        }
    }

    /** Like put() but gives up after the timeout. */
    public boolean offer(T item, long timeout, TimeUnit unit) throws InterruptedException {
        Objects.requireNonNull(item, "item (null is reserved to mean 'closed')");
        long nanos = unit.toNanos(timeout);
        lock.lock();
        try {
            while (items.size() == capacity && !closed) {
                if (nanos <= 0) return false;
                nanos = notFull.awaitNanos(nanos);         // returns the time still left
            }
            if (closed) throw new IllegalStateException("queue closed");
            items.addLast(item);
            notEmpty.signal();
            return true;
        } finally {
            lock.unlock();
        }
    }

    /** Returns null only when the queue is closed AND drained: the consumer should exit. */
    public T take() throws InterruptedException {
        lock.lock();
        try {
            while (items.isEmpty() && !closed) notEmpty.await();
            if (items.isEmpty()) return null;
            T item = items.removeFirst();
            notFull.signal();                              // wake one producer
            return item;
        } finally {
            lock.unlock();
        }
    }

    /** Graceful shutdown: wake everyone; consumers drain what is left, then stop. */
    public void close() {
        lock.lock();
        try {
            closed = true;
            notFull.signalAll();
            notEmpty.signalAll();
        } finally {
            lock.unlock();
        }
    }

    public int size() {
        lock.lock();
        try { return items.size(); } finally { lock.unlock(); }
    }
}
```

**Complexity**

put/take O(1) plus waiting time; memory O(capacity).

**Key points to say out loud**

- **`while`, not `if`, around `await()`:** spurious wake-ups, and another thread may take the item first.
- **Two conditions on one lock**, so `signal()` wakes the right side. With `synchronized` + `wait/notify` there is one wait-set, so you need `notifyAll`, which wakes every thread (thundering herd).
- `signal()` is enough because one put frees exactly one consumer; use `signalAll()` on close.
- Always `unlock()` in `finally`.
- Production: `ArrayBlockingQueue` / `LinkedBlockingQueue`. Fairness: `new ReentrantLock(true)`. Lock-free: a ring buffer with CAS (LMAX Disruptor). Mention only.

</details>

<details>
<summary><strong>C10 · Expiring (TTL) blocking queue</strong> — Reported</summary>

**Problem**

Build a bounded blocking queue where every item has a time-to-live: an item not taken within `ttl` disappears. `put()` waits while the queue is full of *live* items; `poll(timeout)` returns the oldest live item, or null if none arrives in time.

**Example:**

```
capacity = 2, ttl = 200 ms
put("a")   put("b")
poll(0)     → "a"
sleep 250 ms                 // "b" expires
poll(50 ms) → null           // nothing live left
```

**Ask first**

- Same TTL for every item, or one per item? (Same here; per item changes the data structure.)
- Should expired items be reported somewhere (callback, dead-letter queue)?
- When full: block the producer, or drop the oldest item?
- Must memory be freed while nobody calls the queue (background purge)?

**Idea**

Store `(expiresAt, item)`. All items share one TTL, so the deque is ordered by expiry and expired items are purged from the head, lazily on every call. A blocked `put()` waits at most until the head expires.

```java
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Objects;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;

/** Bounded blocking queue where each item expires ttl after put().
 *  Expired items are purged lazily on every put/poll, so no background thread is needed. */
public class ExpiringBlockingQueue<T> {
    private record Entry<E>(long expiresAtNanos, E item) { }

    private final Deque<Entry<T>> items = new ArrayDeque<>();   // same TTL for all -> ordered by expiry
    private final int capacity;
    private final long ttlNanos;
    private final ReentrantLock lock = new ReentrantLock();
    private final Condition changed = lock.newCondition();

    public ExpiringBlockingQueue(int capacity, long ttl, TimeUnit unit) {
        if (capacity <= 0 || ttl <= 0) throw new IllegalArgumentException("capacity and ttl must be positive");
        this.capacity = capacity;
        this.ttlNanos = unit.toNanos(ttl);
    }

    private void purgeExpired() {
        long now = System.nanoTime();
        // compare by subtraction: nanoTime values can overflow, differences cannot
        while (!items.isEmpty() && items.peekFirst().expiresAtNanos() - now <= 0) items.pollFirst();
    }

    public void put(T item) throws InterruptedException {
        Objects.requireNonNull(item, "item (poll returns null to mean 'timed out')");
        lock.lock();
        try {
            while (true) {
                purgeExpired();
                if (items.size() < capacity) break;
                // Full: the oldest item frees a slot when it expires, so wait at most that long.
                changed.awaitNanos(items.peekFirst().expiresAtNanos() - System.nanoTime());
            }
            items.addLast(new Entry<>(System.nanoTime() + ttlNanos, item));
            changed.signalAll();
        } finally {
            lock.unlock();
        }
    }

    /** Returns the oldest live item, or null if none arrives within the timeout. */
    public T poll(long timeout, TimeUnit unit) throws InterruptedException {
        long remaining = unit.toNanos(timeout);
        lock.lock();
        try {
            while (true) {
                purgeExpired();
                if (!items.isEmpty()) {
                    T item = items.pollFirst().item();
                    changed.signalAll();                 // a slot is free for blocked producers
                    return item;
                }
                if (remaining <= 0) return null;
                remaining = changed.awaitNanos(remaining);
            }
        } finally {
            lock.unlock();
        }
    }
}
```

**Complexity**

Amortized O(1) per call (each item is purged at most once); memory O(capacity).

**Follow-ups**

- **Different TTL per item:** expiry order no longer matches FIFO order, so keep the FIFO deque for `take()` plus a `PriorityQueue` by expiry to find and drop expired items. Note: `DelayQueue` does the opposite (it releases items only *after* their delay), so it can schedule cleanup but can’t replace the queue.
- **Lazy vs background purge:** lazy needs no extra thread; a `ScheduledExecutorService` frees memory even when the queue is idle.
- **`nanoTime`** must be compared by subtraction (overflow-safe). Never use wall-clock time for timeouts.

</details>

<details>
<summary><strong>C11 · Thread-safe rate limiter</strong> — Reported</summary>

**Problem**

Write `allow(key)` that returns true if this caller may make a request now. Example: 10 requests per second per API key, with bursts of up to 20. Many threads call it at the same time.

**Example:**

```
rate = 2 tokens/sec, burst capacity = 3
t = 0.0 s   allow(u1) ×4 → true, true, true, false   // burst of 3, then empty
t = 0.5 s   allow(u1) ×2 → true, false               // 0.5 s × 2/s = 1 new token
            allow(u2)    → true                      // each key has its own bucket
```

**Ask first**

- Limit per what: user, API key, IP, route?
- Rate and burst size? Can a request cost more than 1 (e.g. by tokens)?
- One server or many (distributed limit)? Is a slightly approximate limit OK?
- On reject: drop it, queue it, or tell the client when to retry?
- How many distinct keys? (Memory for idle buckets.)

**Idea**

Token bucket per key: tokens refill lazily at `rate`/sec up to `capacity`. **One lock per key** (`synchronized(bucket)`), so different users never contend. The clock is injectable for tests.

```java
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.LongSupplier;

/** Per-key token bucket: on average `ratePerSec` requests/sec, bursts up to `capacity`.
 *  Tokens refill lazily on each call, so no timer thread is needed. */
public class TokenBucketLimiter {
    private static final class Bucket {
        double tokens;
        long lastNanos;
        Bucket(double tokens, long lastNanos) { this.tokens = tokens; this.lastNanos = lastNanos; }
    }

    private final double ratePerSec;
    private final double capacity;
    private final LongSupplier clock;                     // nanoseconds; injectable for tests
    private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    public TokenBucketLimiter(double ratePerSec, double capacity, LongSupplier clock) {
        if (!(ratePerSec > 0) || !(capacity > 0)) throw new IllegalArgumentException("rate and capacity must be > 0");
        this.ratePerSec = ratePerSec;
        this.capacity = capacity;
        this.clock = clock;
    }

    public TokenBucketLimiter(double ratePerSec, double capacity) {
        this(ratePerSec, capacity, System::nanoTime);
    }

    public boolean allow(String key) {
        return allow(key, 1.0);
    }

    public boolean allow(String key, double cost) {
        if (!(cost > 0) || cost > capacity) {             // cost > capacity could NEVER pass: fail loudly
            throw new IllegalArgumentException("cost must be in (0, capacity]");
        }
        Bucket b = buckets.computeIfAbsent(key, k -> new Bucket(capacity, clock.getAsLong()));
        synchronized (b) {                                // one lock PER KEY, not one global lock
            long now = clock.getAsLong();                 // read the clock inside the lock
            double refill = Math.max(0, now - b.lastNanos) / 1e9 * ratePerSec;
            b.tokens = Math.min(capacity, b.tokens + refill);
            b.lastNanos = now;
            if (b.tokens < cost) return false;
            b.tokens -= cost;
            return true;
        }
    }
}
```

**Complexity**

O(1) per call; memory O(number of keys). A cost larger than the bucket could never pass, so the code rejects it instead of silently saying “no” forever.

**Compare algorithms**

| Algorithm | Good | Bad |
|---|---|---|
| Fixed window counter | Very simple | 2× burst at window edges |
| Sliding window log | Exact | Memory per request |
| Sliding window counter | Cheap, smooth | Approximate |
| **Token bucket** | Allows controlled bursts, O(1) | Two parameters to tune |
| Leaky bucket | Smooth output rate | Adds queueing delay |

**Follow-ups**

- Millions of keys: evict idle buckets (Caffeine `expireAfterAccess`).
- Many servers: Redis plus an atomic Lua script, or local buckets with a share of the global quota (see S4).
- Return HTTP 429 with `Retry-After`.

</details>

<details>
<summary><strong>C12 · “Make this code thread-safe”: race, deadlock, visibility</strong> — Reported</summary>

**Problem**

You get three small pieces of code that break under multiple threads: a counter that **loses updates**, a money transfer that can **deadlock**, and a stop flag that a worker thread **never sees**. Explain each bug and fix it.

**Example:**

```
1) Counter: 8 threads × 10,000 increments (expected 80,000)
   UnsafeCounter → 36,205 · 36,080 · 80,000     // three real runs: it can even look right
   SafeCounter   → 80,000 every time

2) Transfer: thread 1 runs transfer(A → B), thread 2 runs transfer(B → A) at the same time
   unsafe: T1 locks A and waits for B; T2 locks B and waits for A → stuck forever
   safe:   both lock the lower id first → one waits, then both finish; A + B stays 2,000

3) Stop flag: worker.stop() sets running = false
   unsafe: the worker's loop may never see it and spins forever
   safe:   volatile → the loop exits right away
```

**Ask first**

- How many threads, and is it read-heavy or write-heavy? (Picks the lock type.)
- Must a transfer change both accounts atomically? Can a balance go negative?
- Is blocking OK, or is lock-free required?
- One JVM, or many servers? (Many servers need DB transactions, not Java locks.)

```java
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.locks.ReentrantLock;

public class ThreadSafety {

    // 1) Race condition: count++ is read -> add -> write; two threads can lose updates.
    static class UnsafeCounter {
        private int value;
        void increment() { value++; }
    }

    static class SafeCounter {
        private final AtomicInteger value = new AtomicInteger();   // or a synchronized method
        void increment() { value.incrementAndGet(); }
        int get() { return value.get(); }
    }

    // 2) Deadlock: A->B and B->A transfers each hold one lock and wait for the other.
    //    Fix: always lock in one global order (lower id first).
    static class Account {
        private static final AtomicLong IDS = new AtomicLong();
        final long id = IDS.getAndIncrement();
        final ReentrantLock lock = new ReentrantLock();
        long balance;
        Account(long balance) { this.balance = balance; }
    }

    static boolean transfer(Account from, Account to, long amount) {
        if (from == to || amount <= 0) return false;
        Account first = from.id < to.id ? from : to;
        Account second = (first == from) ? to : from;
        first.lock.lock();
        try {
            second.lock.lock();
            try {
                if (from.balance < amount) return false;   // check AND act under the same locks
                from.balance -= amount;
                to.balance += amount;
                return true;
            } finally {
                second.lock.unlock();
            }
        } finally {
            first.lock.unlock();
        }
    }

    // 3) Visibility: without volatile, the worker thread may never see running = false
    //    (the JIT can hoist the read out of the loop). volatile / AtomicBoolean fixes it.
    static class Worker implements Runnable {
        private volatile boolean running = true;
        public void run() {
            while (running) {
                Thread.onSpinWait();                        // do work here
            }
        }
        void stop() { running = false; }
    }
}
```

**Cheat sheet**

| Problem | Symptom | Fix |
|---|---|---|
| Race / lost update | Wrong counts | `AtomicInteger`, `LongAdder`, or a lock |
| Check-then-act | Double insert, overdraft | Check and act under one lock; `putIfAbsent` / `computeIfAbsent` |
| Deadlock | Threads stuck forever | Global lock order; `tryLock(timeout)`; fewer locks |
| Visibility | Loop never sees the flag | `volatile` / Atomic\* / happens-before via a lock |
| Pool-induced deadlock | Pool stuck at full | Never block a pool thread on a sub-task in the same pool; compose with `CompletableFuture` |
| Starvation | Some thread never runs | Fair locks, bounded queues |

**Java toolbox:** `synchronized`, `volatile`, `Atomic*`/`LongAdder`, `ConcurrentHashMap` (`compute`/`merge` are atomic), `ReentrantLock` + `Condition`, `ReadWriteLock`/`StampedLock`, `CountDownLatch`, `Semaphore`, `ExecutorService`, `CompletableFuture`, `BlockingQueue`s, virtual threads (21+).

</details>

### 34.3C · Classic OOP / LLD (candidates report an OOP round)

Same 5-step approach as 4A: requirements → entities → interfaces → classes and flow → edge cases. Name the patterns as you use them.

<details>
<summary><strong>O1 · SOLID and the design patterns you’ll actually use</strong> — Core</summary>

| Principle | Simple meaning | Example |
|---|---|---|
| **S**ingle responsibility | One class, one reason to change | `Formatter` formats; `Sink` writes (O2) |
| **O**pen/closed | Add behavior by adding code, not editing old code | A new `PricingPolicy` without touching `ParkingLot` (O3) |
| **L**iskov substitution | A subtype must work wherever its parent does | Any `LlmClient` decorator can replace the client (L1) |
| **I**nterface segregation | Small, focused interfaces | `Reviewer` has one method (AG4) |
| **D**ependency inversion | Depend on interfaces; inject them | Pass a `Clock` in, so tests can control time |

**Patterns to name:** **Strategy** (swap an algorithm), **Factory** (create the right object), **Builder** (many optional fields), **Decorator** (wrap to add behavior), **Observer** (notify listeners), **State** (vending machine, order status). Use **Singleton** rarely: it hides dependencies and makes tests hard.

**Other classics to practice:** vending machine (State), elevator (scheduling), library system, chess, splitwise, rate limiter (C11), LRU cache (C4).

</details>

<details>
<summary><strong>O2 · Design a logging framework</strong> — Likely · OOP round</summary>

**Requirements:** levels (DEBUG→ERROR) with a minimum level per logger; many outputs (console, file, network); a pluggable format; thread-safe; must not slow the app down.

- **Formatter** (Strategy): turns an event into text.
- **Sink**: one output each. **AsyncSink** (Decorator) wraps any sink with a queue and a background thread.
- **Logger**: level check first (cheap), then format once and write to every sink.
- **LoggerFactory**: one logger per name, cached.

```java
import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

/** Classic OOP LLD: a small logging framework.
 *  Strategy (Formatter), many Sinks per logger, Decorator (AsyncSink), Factory with a cache (LoggerFactory). */
public class LoggingFramework {
    public enum Level { DEBUG, INFO, WARN, ERROR }

    public record LogEvent(Instant time, Level level, String logger, String message, String thread) { }

    /** How an event becomes text. Swap it without touching Logger (open/closed). */
    public interface Formatter {
        String format(LogEvent e);
    }

    /** Where text goes: console, file, network… Each sink does one job (single responsibility). */
    public interface Sink extends AutoCloseable {
        void write(String line);
        @Override default void close() { }
    }

    public static final class PlainFormatter implements Formatter {
        public String format(LogEvent e) {
            return e.time() + " " + e.level() + " [" + e.logger() + "] " + e.message();
        }
    }

    public static final class ConsoleSink implements Sink {
        public void write(String line) { System.out.println(line); }
    }

    /** Decorator: same Sink interface, but writes happen on a background thread so callers never block on I/O. */
    public static final class AsyncSink implements Sink {
        private static final String POISON = "\u0000stop";
        private final BlockingQueue<String> queue;
        private final Thread worker;

        public AsyncSink(Sink inner, int capacity) {
            this.queue = new LinkedBlockingQueue<>(capacity);
            this.worker = new Thread(() -> {
                try {
                    for (String line = queue.take(); !line.equals(POISON); line = queue.take()) inner.write(line);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }, "async-log");
            worker.setDaemon(true);
            worker.start();
        }

        public void write(String line) {
            queue.offer(line);                       // full queue: drop rather than block the app (a policy choice)
        }

        @Override public void close() {
            try {
                queue.put(POISON);                    // flush everything queued before the poison pill
                worker.join(TimeUnit.SECONDS.toMillis(5));
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }

    public static final class Logger {
        private final String name;
        private final Formatter formatter;
        private final List<Sink> sinks = new CopyOnWriteArrayList<>();   // thread-safe, read-mostly
        private final Clock clock;
        private volatile Level minLevel;

        Logger(String name, Level minLevel, Formatter formatter, Clock clock) {
            this.name = name;
            this.minLevel = minLevel;
            this.formatter = formatter;
            this.clock = clock;
        }

        public Logger addSink(Sink sink) { sinks.add(sink); return this; }
        public void setLevel(Level level) { this.minLevel = level; }

        public void log(Level level, String message) {
            if (level.compareTo(minLevel) < 0) return;             // cheap check first
            String line = formatter.format(new LogEvent(clock.instant(), level, name, message,
                                                        Thread.currentThread().getName()));
            for (Sink s : sinks) s.write(line);
        }

        public void debug(String m) { log(Level.DEBUG, m); }
        public void info(String m) { log(Level.INFO, m); }
        public void warn(String m) { log(Level.WARN, m); }
        public void error(String m) { log(Level.ERROR, m); }
    }

    /** One Logger per name, created once and shared. */
    public static final class LoggerFactory {
        private final Map<String, Logger> loggers = new ConcurrentHashMap<>();
        private final Level defaultLevel;
        private final Formatter formatter;
        private final Clock clock;

        public LoggerFactory(Level defaultLevel, Formatter formatter, Clock clock) {
            this.defaultLevel = defaultLevel;
            this.formatter = formatter;
            this.clock = clock;
        }

        public Logger get(String name) {
            return loggers.computeIfAbsent(name, n -> new Logger(n, defaultLevel, formatter, clock));
        }
    }
}
```

Tested: level filtering, two sinks get the same lines, a custom formatter as a lambda, and 8 threads × 1,000 async logs with nothing lost after `close()` flushes the queue.

**Follow-ups:** a full queue (drop, block, or sample?); log rotation for file sinks; structured JSON logs; per-package levels; MDC/trace IDs for request tracing.

</details>

<details>
<summary><strong>O3 · Design a parking lot</strong> — Likely · OOP classic</summary>

**Requirements:** several floors; spot sizes (small, medium, large); bikes, cars and trucks; a ticket on entry; a fee on exit; never give two vehicles the same spot.

- **Entities:** `Vehicle`, `Spot`, `Ticket` (records); `VehicleType` knows the smallest spot it fits.
- **SpotChooser** (Strategy): best fit first, so big spots stay free for trucks.
- **PricingPolicy** (Strategy): per started hour, by vehicle type.
- **ParkingLot**: `park` and `unpark` are `synchronized`, so spots stay unique. A `Clock` is injected for testable fees.

```java
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

/** Classic OOP LLD: a multi-floor parking lot. Strategy for spot choice and for pricing; one lock keeps spots unique. */
public class ParkingLot {
    public enum SpotSize { SMALL, MEDIUM, LARGE }

    public enum VehicleType {
        BIKE(SpotSize.SMALL), CAR(SpotSize.MEDIUM), TRUCK(SpotSize.LARGE);
        final SpotSize minSize;
        VehicleType(SpotSize minSize) { this.minSize = minSize; }
        boolean fits(SpotSize s) { return s.compareTo(minSize) >= 0; }   // a bike may use a car spot, not the reverse
    }

    public record Vehicle(String plate, VehicleType type) { }
    public record Spot(int floor, int number, SpotSize size) { }
    public record Ticket(long id, Vehicle vehicle, Spot spot, Instant entry) { }

    /** Which free spot to give a vehicle. Swap for "closest to the lift", "fill top floors first"… */
    public interface SpotChooser {
        Optional<Spot> choose(List<Spot> freeSpots, Vehicle v);
    }

    /** Smallest fitting spot first, then lowest floor: keeps big spots free for trucks. */
    public static final class BestFitChooser implements SpotChooser {
        public Optional<Spot> choose(List<Spot> free, Vehicle v) {
            return free.stream().filter(s -> v.type().fits(s.size()))
                    .min((a, b) -> a.size() != b.size() ? a.size().compareTo(b.size())
                            : a.floor() != b.floor() ? Integer.compare(a.floor(), b.floor())
                            : Integer.compare(a.number(), b.number()));
        }
    }

    public interface PricingPolicy {
        long feeCents(VehicleType type, Duration parked);
    }

    /** Per started hour, with a different hourly rate per vehicle type. */
    public static final class HourlyPricing implements PricingPolicy {
        private final Map<VehicleType, Long> centsPerHour;
        public HourlyPricing(Map<VehicleType, Long> centsPerHour) { this.centsPerHour = Map.copyOf(centsPerHour); }
        public long feeCents(VehicleType type, Duration parked) {
            long hours = Math.max(1, (parked.toMinutes() + 59) / 60);
            return hours * centsPerHour.get(type);
        }
    }

    private final List<Spot> free = new ArrayList<>();
    private final Map<Long, Ticket> active = new HashMap<>();
    private final AtomicLong ids = new AtomicLong();
    private final SpotChooser chooser;
    private final PricingPolicy pricing;
    private final Clock clock;

    public ParkingLot(List<Spot> spots, SpotChooser chooser, PricingPolicy pricing, Clock clock) {
        this.free.addAll(spots);
        this.chooser = chooser;
        this.pricing = pricing;
        this.clock = clock;
    }

    /** Empty when the lot has no fitting spot. synchronized: two cars must never get the same spot. */
    public synchronized Optional<Ticket> park(Vehicle v) {
        Optional<Spot> spot = chooser.choose(free, v);
        if (spot.isEmpty()) return Optional.empty();
        free.remove(spot.get());
        Ticket t = new Ticket(ids.incrementAndGet(), v, spot.get(), clock.instant());
        active.put(t.id(), t);
        return Optional.of(t);
    }

    /** Returns the fee in cents and frees the spot. */
    public synchronized long unpark(long ticketId) {
        Ticket t = active.remove(ticketId);
        if (t == null) throw new IllegalArgumentException("unknown or already used ticket " + ticketId);
        free.add(t.spot());
        return pricing.feeCents(t.vehicle().type(), Duration.between(t.entry(), clock.instant()));
    }

    public synchronized Map<SpotSize, Integer> freeCount() {
        Map<SpotSize, Integer> m = new EnumMap<>(SpotSize.class);
        for (Spot s : free) m.merge(s.size(), 1, Integer::sum);
        return m;
    }
}
```

Tested: fit rules, best-fit choice, a full lot, fees (61 min = 2 hours), double unpark rejected, and 50 threads racing for 20 spots get exactly 20 unique spots.

**Follow-ups:** per-floor locks or a free-spot queue per size for more throughput; reservations; electric-charging spots; a display board (Observer); payments as a separate service.

</details>

## 34.4 Low-level design round: AI-focused (60 min)

You write real classes and interfaces, and the focus is **how code interacts with AI**. Prepare for both flavors:

<div class="md-cards">

<div class="md-card">

#### Flavor 1 · Design code that talks to AI

“Design an LLM client”, “design a tool-calling agent”, “design chat memory”. You’re judged on clean interfaces, extensibility, failure handling, concurrency and testability. See 4B.

</div>

<div class="md-card">

#### Flavor 2 · AI-assisted coding

You may use Copilot or another assistant. They grade **how you direct and verify the AI**, not just the final code. See 4C.

</div>

</div>

Also likely: **“design an agent”** prompts, such as a PR review agent, a skill or an automation. See 4D.

> [!WARNING]
>
> Ask your recruiter: **Is an AI assistant allowed or expected? Which tool (built-in or your own Copilot)? Is there starter code?** Prepare for both anyway.

### 34.4A · How to run any LLD round

| Min | Step |
|---|---|
| 0–5 | **Clarify:** features in and out of scope, scale, sync vs async, single- vs multi-threaded, which failure modes matter. |
| 5–12 | **Entities and responsibilities:** nouns → classes, verbs → methods. One reason to change per class. |
| 12–20 | **Interfaces first** (contracts), then the main flow. Get a nod before going deeper. |
| 20–45 | **Code the core path** plus one or two key extensions. Inject clock, sleeper, random and model so it’s testable. |
| 45–55 | **Test it:** a fake model plus the happy path, one failure path and one edge case. |
| 55–60 | **Extensibility talk:** “To add X, I add one class and change nothing else” (open/closed). |

#### Whiteboard 1 · How to lay out the board

Split the board into five zones that match the steps above, and keep zone ③ visible the whole time so you can point at it while you code. Click any whiteboard to enlarge it (Esc closes).

![LLD whiteboard: how to lay out the board (example: LLM client)](diagrams/mongo34_wb01_whiteboard_lay_out_board_example.svg)

*Five zones, left to right and top to bottom. The colors match: blue = requirements, green = entities, purple = interfaces, orange = classes and flow, red = risks.*

> [!TIP]
>
> **Marker tips:** draw boxes first, then arrows, then labels · use at most 3–4 colors (black structure, colors for flow, **red for risks**) · write interfaces as real code · number the steps of the main flow · leave space on the right for follow-ups.

#### Design patterns you’ll actually use in AI code

| Pattern | Where it shows up |
|---|---|
| **Adapter** | Each provider SDK (OpenAI, Anthropic, Azure) → one `LlmClient` interface |
| **Decorator** | Retry, fallback, rate limit, cache, metering, tracing wrapped around a client (L1) |
| **Strategy** | Model routing, chunking strategy, retry policy, scorer (L9) |
| **Chain of responsibility** | Guardrail pipelines on input and output (L5) |
| **Command** | Tool calls: name + args, run later, logged, approvable (L2) |
| **Observer** | Streaming tokens to UI, logs and metrics listeners (L6) |
| **Registry / Factory** | Tool registry, prompt registry, provider factory (L2, L4) |
| **Template method / State machine** | Agent loop: plan → act → observe → decide (L2) |
| **Circuit breaker / Bulkhead** | Stop calling a failing provider; cap concurrent calls (L1) |

#### Whiteboard 2 · HLD sketch first (2 minutes), then zoom in

Even in an LLD round, a 2-minute high-level sketch shows where your classes live. Then say: *“I’ll design box ⑥, the LLM client, in detail.”*

![HLD: AI assistant platform (2-min sketch, then zoom into ONE box for LLD)](diagrams/mongo34_wb02_hld_ai_assistant_platform_2.svg)

*HLD of an AI assistant platform: gateway → orchestrator (guardrails, memory/RAG, prompts, agent, LLM client) → providers, MongoDB Atlas and tools, with observability and evals underneath. Numbers follow one request.*

**What each box is and what it does** (follow the numbers for one request):

| Box | What it is → what it does |
|---|---|
| **Users** | People using the assistant from a web app, IDE plugin or Slack. They send a question and see the streamed answer. |
| **① API gateway** | The single front door. It checks who you are (**auth**) and blocks too many requests (**rate limit**) before anything costly runs. |
| **AI orchestrator service** | The “brain” service that runs steps ②–⑦ in order for each request. All the AI logic lives here. |
| **② Guardrails (input)** | Checks the user’s message first: blocks prompt injection, masks PII/secrets, rejects off-topic or unsafe asks. |
| **③ Memory + retrieval (RAG)** | Loads recent chat history and searches Atlas for the most relevant document chunks, so the LLM answers from *your* data. |
| **④ Prompt registry** | Stores prompt templates with versions (v1, v2…). Lets you change or roll back a prompt without redeploying code. |
| **⑤ Agent loop + tool registry** | Lets the LLM pick a tool (e.g. “get logs”), runs it, feeds the result back, and repeats until done or a step limit is hit. |
| **⑥ LLM client** | One wrapper for calling any model. Adds retry with backoff, fallback to provider B, response cache and token/cost tracking. *Usual LLD pick.* |
| **⑦ Guardrails (output)** | Checks the model’s answer (no leaked secrets, valid JSON, cites sources), then streams it token by token to the user. |
| **LLM provider A / B** | The external models (e.g. OpenAI, Anthropic). A is the main one; B is the backup used when A is down, slow or rate-limited. |
| **MongoDB Atlas** | One database for everything: chat history and agent checkpoints, document chunks + vectors for search, and a TTL cache of past answers. |
| **Tools / MCP** | Outside systems the agent can call (logs, metrics, tickets), exposed via MCP so any agent can use them the same way. *MCP = a standard “plug” between AI apps and tools; see G15.* |
| **Ingestion jobs** | Background pipeline: reads docs, splits them into chunks, creates embeddings and upserts them into Atlas so RAG stays fresh. |
| **Observability + evals** | Records traces, tokens and cost for every call, and runs eval tests in CI so a prompt or model change can’t silently lower quality. |
| **NFRs (yellow note)** | The targets the design must meet: fast first token, 99.9% uptime, cost cap per request, no data leaks, tenants kept apart. |

#### Whiteboard 3 · LLD class diagram: LLM client (L1)

![LLD: LLM client = Adapter + Decorators (L1)](diagrams/mongo34_wb03_client_adapter_decorators_l1.svg)

*One interface, adapters for each provider SDK, and decorators that each implement *and* wrap an LlmClient. Dashed arrows with hollow triangles = implements; the diamond = owns (composition).*

#### Whiteboard 4 · LLD classes + sequence: tool-calling agent (L2)

![LLD: tool-calling agent (L2): classes + one run](diagrams/mongo34_wb04_tool_calling_agent_l2_classes.svg)

*Left: the classes. Right: one run of the loop: a tool call, a denied side effect, then the final answer. Solid arrows = calls; dashed arrows = returns.*

### 34.4B · LLD problems: code that talks to AI

<details>
<summary><strong>L1 · Design an LLM client library: retries, fallback, concurrency limit, cost tracking</strong> — Likely · LLD</summary>

**Ask first**

- How many providers? Sync or async? Which errors are retryable? Is there a budget (cost or latency)? Is streaming needed?

**Design**

One tiny `LlmClient` interface (the **Adapter** target), plus **decorators** that each do one job: `RetryingClient` → `FallbackClient` (with `CircuitBreaker`) → `BulkheadClient` → `MeteredClient`, listed inside → outside. Each piece is testable alone and they stack like layers, but the order changes behavior (see below).

![LLD: LLM client = Adapter + Decorators (L1)](diagrams/mongo34_wb05_client_adapter_decorators_l1.svg)

*One interface, provider adapters, and decorators that each implement *and* wrap an LlmClient, so they stack in any order.*

```java
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Semaphore;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.DoubleAdder;
import java.util.concurrent.atomic.LongAdder;
import java.util.function.LongSupplier;

/** Provider-agnostic LLM client. One small interface; every cross-cutting concern
 *  (retry, fallback, concurrency limit, cost metering) is a decorator, so each can be tested alone. */
public class LlmClients {

    // ---------- the contract every provider adapter (OpenAI, Anthropic, Azure...) implements ----------
    public enum Role { SYSTEM, USER, ASSISTANT, TOOL }
    public record Message(Role role, String content) { }
    public record ChatRequest(String model, List<Message> messages, double temperature, int maxOutputTokens) { }
    public record Usage(int inputTokens, int outputTokens) { }
    public record ChatResponse(String text, String model, Usage usage) { }

    public interface LlmClient {
        ChatResponse chat(ChatRequest request);
    }

    /** retryable = 429, 5xx, timeouts. Not retryable = 400, 401/403, content-policy refusals. */
    public static class LlmException extends RuntimeException {
        final boolean retryable;
        final Duration retryAfter;                       // from a 429 Retry-After header; may be null

        public LlmException(String message, boolean retryable, Duration retryAfter) {
            super(message);
            this.retryable = retryable;
            this.retryAfter = retryAfter;
        }
    }

    // ---------- decorator 1: retry with exponential backoff + full jitter ----------
    public interface Sleeper { void sleep(long millis) throws InterruptedException; }

    public static final class RetryingClient implements LlmClient {
        private final LlmClient inner;
        private final int maxAttempts;
        private final long baseDelayMs, maxDelayMs;
        private final Sleeper sleeper;                   // injectable, so tests don't really sleep

        public RetryingClient(LlmClient inner, int maxAttempts, long baseDelayMs, long maxDelayMs, Sleeper sleeper) {
            if (maxAttempts < 1) throw new IllegalArgumentException("maxAttempts must be >= 1");
            this.inner = inner;
            this.maxAttempts = maxAttempts;
            this.baseDelayMs = baseDelayMs;
            this.maxDelayMs = maxDelayMs;
            this.sleeper = sleeper;
        }

        @Override
        public ChatResponse chat(ChatRequest request) {
            for (int attempt = 1; ; attempt++) {
                try {
                    return inner.chat(request);
                } catch (LlmException e) {
                    if (!e.retryable || attempt == maxAttempts) throw e;
                    if (e.retryAfter != null && e.retryAfter.toMillis() > maxDelayMs) throw e;  // too long: let fallback act
                    sleepBeforeRetry(attempt, e);
                }
            }
        }

        private void sleepBeforeRetry(int attempt, LlmException e) {
            long cap = Math.min(maxDelayMs, baseDelayMs << Math.min(attempt - 1, 30));   // exponential, no overflow
            long delay = e.retryAfter != null
                    ? e.retryAfter.toMillis()                                           // server knows best
                    : ThreadLocalRandom.current().nextLong(cap + 1);                    // full jitter: no thundering herd
            try {
                sleeper.sleep(delay);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();                                     // never swallow interrupts
                throw new LlmException("interrupted while retrying", false, null);
            }
        }
    }

    // ---------- decorator 2: bulkhead (cap concurrent calls so one feature can't starve the rest) ----------
    public static final class BulkheadClient implements LlmClient {
        private final LlmClient inner;
        private final Semaphore permits;
        private final long waitMs;

        public BulkheadClient(LlmClient inner, int maxConcurrent, long waitMs) {
            this.inner = inner;
            this.permits = new Semaphore(maxConcurrent);
            this.waitMs = waitMs;
        }

        @Override
        public ChatResponse chat(ChatRequest request) {
            boolean acquired;
            try {
                acquired = permits.tryAcquire(waitMs, TimeUnit.MILLISECONDS);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                throw new LlmException("interrupted", false, null);
            }
            if (!acquired) throw new LlmException("too many concurrent LLM calls", true, null);
            try {
                return inner.chat(request);
            } finally {
                permits.release();
            }
        }
    }

    // ---------- decorator 3: fallback across providers, with a circuit breaker per provider ----------
    static final class CircuitBreaker {
        private final int failureThreshold;
        private final long openMillis;
        private final LongSupplier clockMillis;
        private int consecutiveFailures;
        private long openedAt = -1;

        CircuitBreaker(int failureThreshold, long openMillis, LongSupplier clockMillis) {
            this.failureThreshold = failureThreshold;
            this.openMillis = openMillis;
            this.clockMillis = clockMillis;
        }

        /** Closed, or open long enough that we let traffic probe again (half-open). */
        synchronized boolean allowRequest() {
            return openedAt < 0 || clockMillis.getAsLong() - openedAt >= openMillis;
        }

        synchronized void onSuccess() {
            consecutiveFailures = 0;
            openedAt = -1;
        }

        synchronized void onFailure() {
            if (++consecutiveFailures >= failureThreshold) openedAt = clockMillis.getAsLong();
        }
    }

    public static final class FallbackClient implements LlmClient {
        private final List<LlmClient> clients;
        private final List<CircuitBreaker> breakers = new ArrayList<>();

        public FallbackClient(List<LlmClient> clients, int failureThreshold, long openMillis, LongSupplier clockMillis) {
            this.clients = List.copyOf(clients);
            for (int i = 0; i < clients.size(); i++) {
                breakers.add(new CircuitBreaker(failureThreshold, openMillis, clockMillis));
            }
        }

        @Override
        public ChatResponse chat(ChatRequest request) {
            LlmException last = null;
            for (int i = 0; i < clients.size(); i++) {
                CircuitBreaker breaker = breakers.get(i);
                if (!breaker.allowRequest()) continue;              // provider keeps failing: skip it fast
                try {
                    ChatResponse response = clients.get(i).chat(request);
                    breaker.onSuccess();
                    return response;
                } catch (LlmException e) {
                    if (!e.retryable) throw e;                       // a bad request fails everywhere: don't fan out
                    breaker.onFailure();
                    last = e;
                }
            }
            throw last != null ? last : new LlmException("all providers unavailable (circuits open)", true, null);
        }
    }

    // ---------- decorator 4: metering (tokens -> dollars, per model) ----------
    public static final class MeteredClient implements LlmClient {
        private final LlmClient inner;
        private final Map<String, double[]> usdPerMillionTokens;    // model -> {input, output}
        private final ConcurrentHashMap<String, DoubleAdder> costByModel = new ConcurrentHashMap<>();
        private final LongAdder calls = new LongAdder();
        private final LongAdder failures = new LongAdder();

        public MeteredClient(LlmClient inner, Map<String, double[]> usdPerMillionTokens) {
            this.inner = inner;
            this.usdPerMillionTokens = Map.copyOf(usdPerMillionTokens);
        }

        @Override
        public ChatResponse chat(ChatRequest request) {
            calls.increment();
            try {
                ChatResponse r = inner.chat(request);
                double[] price = usdPerMillionTokens.getOrDefault(r.model(), new double[]{0, 0});
                double cost = (r.usage().inputTokens() * price[0] + r.usage().outputTokens() * price[1]) / 1_000_000.0;
                costByModel.computeIfAbsent(r.model(), m -> new DoubleAdder()).add(cost);
                return r;
            } catch (LlmException e) {
                failures.increment();
                throw e;
            }
        }

        public double totalCostUsd() {
            return costByModel.values().stream().mapToDouble(DoubleAdder::sum).sum();
        }

        public long calls() { return calls.sum(); }

        public long failures() { return failures.sum(); }
    }

    /** Wiring (order matters): retry each provider a little -> fall back -> cap concurrency -> meter all. */
    public static MeteredClient production(LlmClient primary, LlmClient secondary, Map<String, double[]> prices) {
        Sleeper sleeper = Thread::sleep;
        LlmClient p = new RetryingClient(primary, 3, 200, 5_000, sleeper);
        LlmClient s = new RetryingClient(secondary, 2, 200, 5_000, sleeper);
        LlmClient fallback = new FallbackClient(List.of(p, s), 5, 30_000, () -> System.nanoTime() / 1_000_000);
        return new MeteredClient(new BulkheadClient(fallback, 32, 2_000), prices);
    }
}
```

**Say out loud**

- **Retry only what’s retryable** (429/5xx/timeouts). Use full jitter. Honor `Retry-After`, but if it’s longer than our budget, fail fast so the fallback can act.
- **Order matters:** `Fallback(Retry(primary), Retry(backup))` tries the primary a few times, then switches. Metering outermost gives one record per request; to bill every attempt, also meter inside the retry.
- **Never swallow `InterruptedException`**: restore the flag and stop.
- Inject `Sleeper` and the clock, so tests run in milliseconds.

**Follow-ups**

- **Model aliases:** callers ask for “smart” or “fast”; each adapter maps that to its own model. Fallback then works across providers.
- **Async:** `CompletableFuture<ChatResponse> chatAsync()`, or virtual threads (Java 21) with the same sync API.
- **Timeouts:** HTTP connect and read timeouts, plus one overall deadline across all retries.
- **Per-tenant budgets:** a `BudgetClient` decorator that rejects requests once a tenant’s USD limit is reached.
- **Observability:** a `TracingClient` decorator emitting spans with model, tokens, latency and cost.

</details>

<details>
<summary><strong>L2 · Design a tool-calling agent (ReAct loop) with a tool registry and human approval</strong> — Likely · LLD</summary>

**Design**

- `Tool` (Command): name, description, parameter types, `hasSideEffects`, execute.
- `ToolRegistry`: rejects duplicate names.
- `Model` returns a **sealed** `ModelTurn`: either `CallTools` or `FinalAnswer`.
- `Approver` gates side effects.
- **The loop is bounded** (max steps plus loop detection), and every failure becomes an **observation**.

![LLD: tool-calling agent (L2): classes + one run](diagrams/mongo34_wb06_tool_calling_agent_l2_classes.svg)

*Left: the classes. Right: one run: a tool call, a denied side effect, then the final answer.*

```java
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;

/** Tool-calling agent (ReAct loop): the model picks a tool, we run it, feed back the result, repeat.
 *  Bounded by maxSteps; every tool failure becomes an observation the model can react to, never a crash. */
public class ToolAgent {
    public record Message(String role, String content) { }                  // system | user | assistant | tool
    public record ToolCall(String id, String tool, Map<String, Object> args) { }

    /** Each model turn is EITHER some tool calls OR a final answer. */
    public sealed interface ModelTurn permits CallTools, FinalAnswer { }
    public record CallTools(List<ToolCall> calls) implements ModelTurn { }
    public record FinalAnswer(String text) implements ModelTurn { }

    public interface Model {
        ModelTurn next(List<Message> history, Collection<Tool> tools);
    }

    public interface Tool {
        String name();
        String description();                         // the model reads this: write it like API docs
        Map<String, Class<?>> parameters();           // real systems: JSON Schema
        boolean hasSideEffects();                     // true -> needs human approval
        String execute(Map<String, Object> args) throws Exception;
    }

    public interface Approver {
        boolean approve(ToolCall call);
    }

    public static final class ToolRegistry {
        private final Map<String, Tool> tools = new LinkedHashMap<>();

        public ToolRegistry register(Tool tool) {
            if (tools.putIfAbsent(tool.name(), tool) != null) {
                throw new IllegalArgumentException("duplicate tool: " + tool.name());
            }
            return this;
        }

        Optional<Tool> find(String name) { return Optional.ofNullable(tools.get(name)); }

        Collection<Tool> all() { return Collections.unmodifiableCollection(tools.values()); }
    }

    public record Result(String answer, int steps, List<String> trace) { }

    private static final int MAX_OBSERVATION_CHARS = 2_000;   // keep the context window small
    private static final int MAX_IDENTICAL_CALLS = 2;         // loop detection

    private final Model model;
    private final ToolRegistry registry;
    private final Approver approver;
    private final int maxSteps;

    public ToolAgent(Model model, ToolRegistry registry, Approver approver, int maxSteps) {
        this.model = model;
        this.registry = registry;
        this.approver = approver;
        this.maxSteps = maxSteps;
    }

    public Result run(String systemPrompt, String goal) {
        List<Message> history = new ArrayList<>();
        history.add(new Message("system", systemPrompt));
        history.add(new Message("user", goal));
        List<String> trace = new ArrayList<>();
        Map<String, Integer> callCounts = new HashMap<>();

        for (int step = 1; step <= maxSteps; step++) {
            ModelTurn turn = model.next(Collections.unmodifiableList(history), registry.all());
            if (turn instanceof FinalAnswer answer) {
                return new Result(answer.text(), step, trace);
            }
            for (ToolCall call : ((CallTools) turn).calls()) {
                String signature = call.tool() + new TreeMap<>(call.args());          // canonical form
                int repeats = callCounts.merge(signature, 1, Integer::sum);
                String observation = repeats > MAX_IDENTICAL_CALLS
                        ? "ERROR identical call made " + repeats + " times. Try a different approach."
                        : invoke(call);
                trace.add(call.tool() + " -> " + observation);
                history.add(new Message("assistant", "tool_call " + call.id() + " " + signature));
                history.add(new Message("tool", call.id() + " " + observation));
            }
        }
        return new Result("Stopped: step limit reached without an answer.", maxSteps, trace);
    }

    /** Never throws: unknown tool, bad args, denial and exceptions all become observations. */
    private String invoke(ToolCall call) {
        Optional<Tool> found = registry.find(call.tool());
        if (found.isEmpty()) {
            return "ERROR unknown tool '" + call.tool() + "'. Available: " + names();
        }
        Tool tool = found.get();
        String invalid = validate(tool, call.args());
        if (invalid != null) return "ERROR invalid arguments: " + invalid;
        if (tool.hasSideEffects() && !approver.approve(call)) return "DENIED by human reviewer";
        try {
            String out = tool.execute(call.args());
            return out.length() <= MAX_OBSERVATION_CHARS ? out : out.substring(0, MAX_OBSERVATION_CHARS) + "...[truncated]";
        } catch (Exception e) {
            return "ERROR " + e.getClass().getSimpleName() + ": " + e.getMessage();
        }
    }

    private static String validate(Tool tool, Map<String, Object> args) {
        for (Map.Entry<String, Class<?>> p : tool.parameters().entrySet()) {
            Object v = args.get(p.getKey());
            if (v == null) return "missing '" + p.getKey() + "'";
            if (!p.getValue().isInstance(v)) return "'" + p.getKey() + "' must be " + p.getValue().getSimpleName();
        }
        for (String k : args.keySet()) {
            if (!tool.parameters().containsKey(k)) return "unknown argument '" + k + "'";
        }
        return null;
    }

    private List<String> names() {
        List<String> out = new ArrayList<>();
        for (Tool t : registry.all()) out.add(t.name());
        return out;
    }
}
```

**Say out loud**

- **Errors are data:** an unknown tool, bad arguments or an exception go back to the model as text, so it can self-correct.
- **Validate arguments before executing.** The model will send wrong types.
- **Side effects need approval**; read-only tools don’t.
- Truncate big tool outputs to protect the context window. Detect loops on canonicalized arguments.

**Follow-ups**

- **Parallel tool calls:** `CompletableFuture.allOf(...)` with a per-tool timeout.
- **Resume after a crash:** checkpoint the history after each step (e.g. in MongoDB); LangGraph does this with checkpointers.
- **Cost budget:** stop when tokens or USD exceed a limit, not just on steps.
- **Security:** tool output can contain injected instructions, so treat it as data. Give tools least-privilege credentials and keep an audit log.
- **MCP tools:** an adapter that lists remote MCP server tools and wraps each as a `Tool`.

</details>

<details>
<summary><strong>L3 · Design chat memory that fits the context window (summary + pinned facts + recent turns)</strong> — Likely · LLD</summary>

**Design**

The context = system prompt + rolling **summary** + **pinned** messages + newest turns word for word. When the budget (window minus reserved answer tokens) is exceeded, the oldest unpinned turns are folded into the summary, down to **75% of the budget** so summarization happens in batches. `TokenCounter` and `Summarizer` are interfaces.

![L3 · ConversationMemory: the class + what compact() does](diagrams/mongo34_wb07_l3_conversationmemory_class_compact_does.svg)

*When the budget is exceeded, the oldest unpinned turns (t1, t3, t4) are folded into one summary; pinned t2 and the newest t8 always stay.*

```java
import java.util.ArrayList;
import java.util.List;

/** Keeps a chat inside the model's context window: system prompt + rolling summary + pinned facts
 *  + the newest turns word for word. Old turns are folded into the summary instead of being dropped. */
public class ConversationMemory {
    public record Message(String role, String content, boolean pinned) { }

    public interface TokenCounter { int count(String text); }              // real: the model's tokenizer

    public interface Summarizer {                                          // real: a cheap LLM call
        String summarize(String previousSummary, List<Message> evicted, int maxTokens);
    }

    private static final int PER_MESSAGE_OVERHEAD = 4;                     // role + formatting tokens

    private final Message system;
    private final int budget;                                              // window minus room for the answer
    private final TokenCounter counter;
    private final Summarizer summarizer;
    private final List<Message> turns = new ArrayList<>();
    private String summary = "";
    private int summarizations = 0;

    public ConversationMemory(String systemPrompt, int contextWindow, int reservedForAnswer,
                              TokenCounter counter, Summarizer summarizer) {
        this.system = new Message("system", systemPrompt, true);
        this.budget = contextWindow - reservedForAnswer;
        this.counter = counter;
        this.summarizer = summarizer;
        if (cost(system) > budget / 2) throw new IllegalArgumentException("system prompt is too large for the window");
    }

    public synchronized void add(String role, String content) { append(new Message(role, content, false)); }

    /** Pinned messages (user preferences, key facts) are never summarized away. */
    public synchronized void pin(String role, String content) { append(new Message(role, content, true)); }

    /** Exactly what we send to the model on the next call. */
    public synchronized List<Message> context() {
        List<Message> out = new ArrayList<>();
        out.add(system);
        if (!summary.isEmpty()) out.add(summaryMessage());
        out.addAll(turns);
        return out;
    }

    public synchronized int tokens() { return totalTokens(); }

    private void append(Message m) {
        turns.add(m);
        if (totalTokens() > budget) compact();
    }

    /** Evict the oldest unpinned turns (never the newest) until we are under 75% of the budget,
     *  then fold them into the summary. The 75% target means we summarize in batches, not every turn. */
    private void compact() {
        int target = budget * 3 / 4;
        int running = totalTokens();
        List<Message> keep = new ArrayList<>();
        List<Message> evicted = new ArrayList<>();
        for (int i = 0; i < turns.size(); i++) {
            Message m = turns.get(i);
            boolean newest = i == turns.size() - 1;
            if (running > target && !m.pinned() && !newest) {
                evicted.add(m);
                running -= cost(m);
            } else {
                keep.add(m);
            }
        }
        if (evicted.isEmpty()) return;                         // only pinned/newest left: caller must trim them
        summary = summarizer.summarize(summary, evicted, budget / 4);   // summary has its own token cap
        summarizations++;
        turns.clear();
        turns.addAll(keep);
    }

    private Message summaryMessage() {
        return new Message("system", "Conversation so far (summary): " + summary, true);
    }

    private int cost(Message m) { return counter.count(m.content()) + PER_MESSAGE_OVERHEAD; }

    private int totalTokens() {
        int total = cost(system) + (summary.isEmpty() ? 0 : cost(summaryMessage()));
        for (Message m : turns) total += cost(m);
        return total;
    }
}
```

**Follow-ups**

- **Real token counts:** use the model’s tokenizer. Word count is only a stand-in.
- **Long-term memory:** store facts as embeddings and retrieve the relevant ones per turn (RAG over the user’s own history).
- **Persistence:** a MongoDB document per conversation; move old turns into bucket documents so no document grows without limit (16 MB cap).
- **Privacy:** per-user isolation, a TTL for old chats, and a “forget me” delete path.
- **Edge case:** pinned content alone exceeds the budget. Reject it at pin time, or cap pinned tokens.

</details>

<details>
<summary><strong>L4 · Design a prompt template registry: versions, variables, pinning, A/B tests</strong> — Likely · LLD</summary>

![L4 · PromptRegistry: immutable versions, pin, A/B, strict render](diagrams/mongo34_wb08_l4_promptregistry_immutable_versions_pin.svg)

*Versions never change. Production follows the pin, A/B splits users by hash, and render() fails loudly on bad variables.*

```java
import java.util.Collections;
import java.util.Map;
import java.util.NavigableMap;
import java.util.Set;
import java.util.TreeSet;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentSkipListMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Versioned prompt templates: immutable versions, strict variables, pinning for prod, stable A/B split. */
public class PromptRegistry {
    private static final Pattern VAR = Pattern.compile("\\{\\{\\s*(\\w+)\\s*}}");

    public record PromptTemplate(String name, int version, String text, Set<String> variables) {
        public String render(Map<String, String> values) {
            Set<String> missing = new TreeSet<>(variables);
            missing.removeAll(values.keySet());
            Set<String> unknown = new TreeSet<>(values.keySet());
            unknown.removeAll(variables);
            if (!missing.isEmpty() || !unknown.isEmpty()) {          // fail loudly: typos are silent bugs in prompts
                throw new IllegalArgumentException(name + " v" + version + ": missing " + missing + ", unknown " + unknown);
            }
            // Single pass: a user value that itself contains "{{x}}" is NOT expanded again.
            Matcher m = VAR.matcher(text);
            StringBuilder out = new StringBuilder();
            while (m.find()) m.appendReplacement(out, Matcher.quoteReplacement(values.get(m.group(1))));
            m.appendTail(out);
            return out.toString();
        }
    }

    private final Map<String, NavigableMap<Integer, PromptTemplate>> versions = new ConcurrentHashMap<>();
    private final Map<String, Integer> pinned = new ConcurrentHashMap<>();

    /** Adds a new immutable version. Old versions stay for rollback and comparison in evals. */
    public synchronized PromptTemplate register(String name, String text) {
        NavigableMap<Integer, PromptTemplate> byVersion = versions.computeIfAbsent(name, n -> new ConcurrentSkipListMap<>());
        int version = byVersion.isEmpty() ? 1 : byVersion.lastKey() + 1;
        Set<String> vars = new TreeSet<>();
        Matcher m = VAR.matcher(text);
        while (m.find()) vars.add(m.group(1));
        PromptTemplate template = new PromptTemplate(name, version, text, Collections.unmodifiableSet(vars));
        byVersion.put(version, template);
        return template;
    }

    public PromptTemplate get(String name, int version) {
        PromptTemplate t = versions.getOrDefault(name, new ConcurrentSkipListMap<>()).get(version);
        if (t == null) throw new IllegalArgumentException("no prompt " + name + " v" + version);
        return t;
    }

    /** Production lookup: the pinned version if any, else the latest. */
    public PromptTemplate get(String name) {
        Integer pin = pinned.get(name);
        if (pin != null) return get(name, pin);
        NavigableMap<Integer, PromptTemplate> byVersion = versions.get(name);
        if (byVersion == null || byVersion.isEmpty()) throw new IllegalArgumentException("no prompt " + name);
        return byVersion.lastEntry().getValue();
    }

    public void pin(String name, int version) {
        get(name, version);                                          // validate it exists
        pinned.put(name, version);
    }

    /** A/B test: the same user always gets the same variant; percentB of users get version B. */
    public PromptTemplate forUser(String name, String userId, int versionA, int versionB, int percentB) {
        int bucket = Math.floorMod((name + ":" + userId).hashCode(), 100);
        return get(name, bucket < percentB ? versionB : versionA);
    }
}
```

**Say out loud**

- **Versions are immutable.** Production uses the pinned version; a rollback is just a re-pin.
- **Strict variables:** missing or unknown variables throw. A typo in a prompt fails silently otherwise.
- **Single-pass rendering:** user input containing `{{x}}` is never re-expanded (template-injection safety).
- **Stable A/B split:** hash(user), so each user always sees the same variant.

**Follow-ups**

- Keep the **stable text first and the variables last** to benefit from provider prompt caching.
- Gate “pin” on an eval run (L9). Store templates in a DB with author, time and change notes.
- Wrap user content in clear delimiters, and tell the model it is data, not instructions.

</details>

<details>
<summary><strong>L5 · Design an input/output guardrail pipeline (PII, prompt injection, secrets, links)</strong> — Likely · LLD</summary>

**Chain of responsibility:** each `Guard` returns ALLOW, MODIFY or BLOCK. BLOCK stops the chain and MODIFY passes the new text on. Separate pipelines run on input and on output.

![L5 · Guardrails: a chain of guards on the way in and on the way out](diagrams/mongo34_wb09_l5_guardrails_chain_guards_way.svg)

*Input guards run before the LLM, output guards after it. Any BLOCK stops the chain.*

```java
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Chain of responsibility: each guard can ALLOW, MODIFY (e.g. redact) or BLOCK. Order matters:
 *  cheap checks and blockers first, rewriters after. Run one pipeline on input, another on output. */
public class Guardrails {
    public enum Action { ALLOW, MODIFY, BLOCK }

    public record Verdict(Action action, String text, String reason) {
        static Verdict allow(String text) { return new Verdict(Action.ALLOW, text, ""); }
        static Verdict modify(String text, String reason) { return new Verdict(Action.MODIFY, text, reason); }
        static Verdict block(String reason) { return new Verdict(Action.BLOCK, null, reason); }
    }

    public interface Guard {
        String name();
        Verdict check(String text);
    }

    public static final class Pipeline {
        private final List<Guard> guards;

        public Pipeline(List<Guard> guards) { this.guards = List.copyOf(guards); }

        public Verdict run(String text) {
            String current = text;
            StringBuilder reasons = new StringBuilder();
            for (Guard g : guards) {
                Verdict v = g.check(current);
                switch (v.action()) {
                    case BLOCK -> { return Verdict.block(g.name() + ": " + v.reason()); }   // stop the chain
                    case MODIFY -> {
                        current = v.text();                                                 // pass the new text on
                        reasons.append(g.name()).append(": ").append(v.reason()).append("; ");
                    }
                    case ALLOW -> { }
                }
            }
            return reasons.length() == 0 ? Verdict.allow(current) : Verdict.modify(current, reasons.toString().trim());
        }
    }

    // ---------- input guards ----------
    public static final class MaxLength implements Guard {
        private final int maxChars;
        public MaxLength(int maxChars) { this.maxChars = maxChars; }
        public String name() { return "max-length"; }
        public Verdict check(String t) {
            return t.length() <= maxChars ? Verdict.allow(t) : Verdict.block(t.length() + " chars > " + maxChars);
        }
    }

    /** Heuristic only. Real systems add a classifier model; this is one layer of defense in depth. */
    public static final class InjectionHeuristic implements Guard {
        private static final List<String> PHRASES = List.of(
                "ignore previous instructions", "ignore all previous instructions",
                "disregard the system prompt", "reveal your system prompt");
        public String name() { return "prompt-injection"; }
        public Verdict check(String t) {
            String lower = t.toLowerCase(Locale.ROOT);
            for (String p : PHRASES) {
                if (lower.contains(p)) return Verdict.block("suspicious phrase '" + p + "'");
            }
            return Verdict.allow(t);
        }
    }

    public static final class PiiRedactor implements Guard {
        private static final Pattern EMAIL = Pattern.compile("[\\w.+-]+@[\\w-]+(?:\\.[\\w-]+)+");
        private static final Pattern CARD = Pattern.compile("\\b(?:\\d[ -]?){12,15}\\d\\b");   // add a Luhn check in prod
        public String name() { return "pii-redactor"; }
        public Verdict check(String t) {
            String out = CARD.matcher(EMAIL.matcher(t).replaceAll("[EMAIL]")).replaceAll("[CARD]");
            return out.equals(t) ? Verdict.allow(t) : Verdict.modify(out, "redacted PII");
        }
    }

    // ---------- output guards ----------
    public static final class SecretLeak implements Guard {
        private static final Pattern KEY = Pattern.compile("\\b(?:sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{36})\\b");
        public String name() { return "secret-leak"; }
        public Verdict check(String t) {
            return KEY.matcher(t).find() ? Verdict.block("output looks like it contains a credential") : Verdict.allow(t);
        }
    }

    public static final class LinkAllowList implements Guard {
        private static final Pattern URL = Pattern.compile("https?://([^/\\s]+)\\S*");
        private final Set<String> allowedHosts;
        public LinkAllowList(Set<String> allowedHosts) { this.allowedHosts = Set.copyOf(allowedHosts); }
        public String name() { return "link-allowlist"; }
        public Verdict check(String t) {
            Matcher m = URL.matcher(t);
            StringBuilder out = new StringBuilder();
            boolean changed = false;
            while (m.find()) {
                boolean ok = allowedHosts.contains(m.group(1).toLowerCase(Locale.ROOT));
                changed |= !ok;
                m.appendReplacement(out, ok ? Matcher.quoteReplacement(m.group()) : "[link removed]");
            }
            m.appendTail(out);
            return changed ? Verdict.modify(out.toString(), "removed non-allow-listed links") : Verdict.allow(t);
        }
    }

    public static Pipeline inputPipeline() {
        return new Pipeline(List.of(new MaxLength(8_000), new InjectionHeuristic(), new PiiRedactor()));
    }

    public static Pipeline outputPipeline(Set<String> allowedHosts) {
        return new Pipeline(List.of(new SecretLeak(), new PiiRedactor(), new LinkAllowList(allowedHosts)));
    }
}
```

**Follow-ups**

- Regex and phrase lists are weak, so add a **classifier model** as another guard. It’s defense in depth, not a single wall.
- **Latency:** run independent guards in parallel, with cheap ones first.
- **Streaming output:** check chunks with a held-back buffer (same trick as L6).
- **Measure false positives** and log every block for audit. Allow per-tenant configuration.

</details>

<details>
<summary><strong>L6 · Design a streaming response handler (stop sequences, cancel, errors, listeners)</strong> — Likely · LLD</summary>

**Observer** pattern: listeners get `onText`, `onComplete` and `onError`. The tricky part is **a stop sequence split across chunks**: hold back `maxStopLength − 1` characters before emitting, so “EN” never reaches the UI before the “D” arrives.

![L6 · StreamingResponse: hold back, stop sequences, many listeners](diagrams/mongo34_wb10_l6_streamingresponse_hold_back_stop.svg)

*Hold back 2 characters so a split “EN” + “D” stop sequence never reaches the UI; fan chunks out to many listeners.*

```java
import java.util.List;

/** Streams model output to listeners as it arrives, with stop sequences, a chunk limit and cancellation.
 *  Holds back a few chars so a stop sequence split across chunks ("EN" + "D") never leaks to the UI. */
public class StreamingResponse {
    public interface TokenSource {
        String next() throws Exception;              // next text chunk (e.g. a parsed SSE event), null at end
    }

    public interface StreamListener {
        default void onText(String text) { }
        default void onComplete(String fullText, String finishReason) { }
        default void onError(Exception error) { }
    }

    public static final class Cancellation {
        private volatile boolean cancelled;          // set from another thread (user clicked Stop)
        public void cancel() { cancelled = true; }
        public boolean isCancelled() { return cancelled; }
    }

    public record Result(String text, String finishReason) { }

    public static Result stream(TokenSource source, List<StreamListener> listeners, List<String> stopSequences,
                                int maxChunks, Cancellation cancellation) {
        int holdBack = stopSequences.stream().mapToInt(String::length).max().orElse(1) - 1;
        StringBuilder full = new StringBuilder();
        int emitted = 0;
        int chunks = 0;
        String finish = "end";
        try {
            while (true) {
                if (cancellation.isCancelled()) { finish = "cancelled"; break; }
                String chunk = source.next();
                if (chunk == null) break;
                full.append(chunk);
                chunks++;
                int stopAt = earliestStop(full, stopSequences, emitted);
                if (stopAt >= 0) {
                    full.setLength(stopAt);              // drop the stop sequence and everything after it
                    finish = "stop_sequence";
                    break;
                }
                int safeEnd = Math.max(emitted, full.length() - holdBack);
                if (safeEnd > emitted) {
                    emit(listeners, full.substring(emitted, safeEnd));
                    emitted = safeEnd;
                }
                if (chunks >= maxChunks) { finish = "length"; break; }
            }
        } catch (Exception e) {
            for (StreamListener l : listeners) safely(() -> l.onError(e));
            finish = "error";
        }
        if (full.length() > emitted) emit(listeners, full.substring(emitted));   // flush held-back text
        String text = full.toString();
        String reason = finish;
        for (StreamListener l : listeners) safely(() -> l.onComplete(text, reason));
        return new Result(text, reason);
    }

    /** A stop sequence can only start at or after the emitted point (we held back enough chars). */
    private static int earliestStop(StringBuilder text, List<String> stops, int from) {
        int best = -1;
        for (String s : stops) {
            int i = text.indexOf(s, from);
            if (i >= 0 && (best < 0 || i < best)) best = i;
        }
        return best;
    }

    private static void emit(List<StreamListener> listeners, String text) {
        for (StreamListener l : listeners) safely(() -> l.onText(text));
    }

    private static void safely(Runnable r) {
        try {
            r.run();
        } catch (RuntimeException e) {
            // one broken listener (e.g. a closed websocket) must not kill the stream for the others: log it
        }
    }
}
```

**Follow-ups**

- **Backpressure:** put a bounded queue between the network thread and slow listeners (C9), so the socket keeps up.
- **Idle timeout** between chunks (the provider hung), separate from the total timeout.
- **Tool calls in a stream:** build the partial JSON arguments chunk by chunk and parse only when complete.
- A broken listener (closed websocket) must not kill the stream for the others, so each call is isolated.

</details>

<details>
<summary><strong>L7 · Design an LLM response cache (exact + semantic)</strong> — Likely · LLD</summary>

![L7 · LlmResponseCache.get(): three checks before calling the model](diagrams/mongo34_wb11_l7_llmresponsecache_get_three_checks.svg)

*Three checks in order: is it cacheable, an exact hit, a similar hit. Only a full miss calls the model.*

```java
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.function.LongSupplier;

/** Two-level LLM response cache.
 *  Exact: SHA-256 of (scope, model, temperature, prompt). Semantic: a past prompt whose embedding is close enough.
 *  Scope (tenant/user) is in every key, so one user's answer never leaks to another. */
public class LlmResponseCache {
    public interface Embedder { double[] embed(String text); }      // returns unit-length vectors

    private record Entry(String prompt, double[] vector, String response, long expiresAt) { }

    private final Map<String, Entry> exact = new ConcurrentHashMap<>();
    private final Map<String, List<Entry>> semantic = new ConcurrentHashMap<>();   // scope|model -> entries
    private final Embedder embedder;
    private final double minSimilarity;            // high (0.9+): "order 123" vs "order 124" must NOT match
    private final long ttlMillis;
    private final double maxCacheableTemperature;  // creative (high-temperature) output is not cached
    private final LongSupplier clockMillis;

    public LlmResponseCache(Embedder embedder, double minSimilarity, long ttlMillis,
                            double maxCacheableTemperature, LongSupplier clockMillis) {
        this.embedder = embedder;
        this.minSimilarity = minSimilarity;
        this.ttlMillis = ttlMillis;
        this.maxCacheableTemperature = maxCacheableTemperature;
        this.clockMillis = clockMillis;
    }

    public Optional<String> get(String scope, String model, double temperature, String prompt) {
        if (temperature > maxCacheableTemperature) return Optional.empty();
        long now = clockMillis.getAsLong();
        Entry hit = exact.get(exactKey(scope, model, temperature, prompt));
        if (hit != null && hit.expiresAt() > now) return Optional.of(hit.response());

        double[] query = embedder.embed(prompt);
        Entry best = null;
        double bestScore = minSimilarity;
        for (Entry e : semantic.getOrDefault(scope + "|" + model, List.of())) {     // brute force; vector index at scale
            if (e.expiresAt() <= now) continue;
            double score = dot(query, e.vector());
            if (score >= bestScore) {
                best = e;
                bestScore = score;
            }
        }
        return best == null ? Optional.empty() : Optional.of(best.response());
    }

    public void put(String scope, String model, double temperature, String prompt, String response) {
        if (temperature > maxCacheableTemperature) return;
        Entry e = new Entry(prompt, embedder.embed(prompt), response, clockMillis.getAsLong() + ttlMillis);
        exact.put(exactKey(scope, model, temperature, prompt), e);
        semantic.computeIfAbsent(scope + "|" + model, k -> new CopyOnWriteArrayList<>()).add(e);
    }

    /** Call periodically (scheduler) so expired entries don't pile up. */
    public void evictExpired() {
        long now = clockMillis.getAsLong();
        exact.values().removeIf(e -> e.expiresAt() <= now);
        semantic.values().forEach(list -> list.removeIf(e -> e.expiresAt() <= now));
    }

    static String exactKey(String scope, String model, double temperature, String prompt) {
        try {
            MessageDigest sha = MessageDigest.getInstance("SHA-256");
            String raw = String.join("\u0000", scope, model, Double.toString(temperature), prompt);
            return HexFormat.of().formatHex(sha.digest(raw.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    private static double dot(double[] a, double[] b) {
        double s = 0;
        for (int i = 0; i < a.length; i++) s += a[i] * b[i];
        return s;
    }
}
```

**Say out loud**

- **Scope (tenant/user) in every key** so no answer leaks across users.
- **Semantic hits are risky:** “cancel order 123” ≈ “cancel order 124”. Use a high threshold, use it only for FAQ-type prompts, and measure the **false-hit rate**.
- Don’t cache high-temperature (creative) output. Put the **model and prompt version in the key** so upgrades don’t serve stale answers.

**Follow-ups**

- At scale: Redis for exact matches; MongoDB with a TTL index plus Atlas Vector Search for semantic ones.
- Track hit rate, USD saved and false hits.

</details>

<details>
<summary><strong>L8 · Design reliable structured output: schema, validation, re-ask with the error</strong> — Likely · LLD</summary>

Ask for JSON, strip code fences, parse (reusing **C7’s JsonParser**), and validate types, required fields, enums and unknown fields. On failure, **append the model’s reply plus the exact error** and ask again, up to N attempts.

![L8 · StructuredOutput: parse → validate → re-ask with the exact error](diagrams/mongo34_wb12_l8_structuredoutput_parse_validate_re.svg)

*If parsing or validation fails, the model sees its reply plus the exact error and tries again, up to N times.*

````java
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

/** Ask for JSON -> parse -> validate against a schema -> on failure, re-ask with the exact error.
 *  Reuses JsonParser from C7. */
public class StructuredOutput {
    public interface Model {
        String complete(List<String> conversation);
    }

    public record Field(String name, Class<?> type, boolean required, Set<String> allowed) {
        public static Field required(String name, Class<?> type) { return new Field(name, type, true, Set.of()); }
        public static Field optional(String name, Class<?> type) { return new Field(name, type, false, Set.of()); }
        public static Field oneOf(String name, String... values) { return new Field(name, String.class, true, Set.of(values)); }
    }

    public record Schema(List<Field> fields) {
        String describe() {                              // goes into the prompt
            List<String> parts = new ArrayList<>();
            for (Field f : fields) {
                String type = f.allowed().isEmpty() ? f.type().getSimpleName() : "one of " + new TreeSet<>(f.allowed());
                parts.add("\"" + f.name() + "\": " + type + (f.required() ? "" : " (optional)"));
            }
            return "{" + String.join(", ", parts) + "}";
        }
    }

    public static class InvalidOutput extends RuntimeException {
        InvalidOutput(String message) { super(message); }
    }

    public static Map<String, Object> extract(Model model, String task, Schema schema, int maxAttempts) {
        List<String> conversation = new ArrayList<>();
        conversation.add(task + "\nReply with ONLY a JSON object: " + schema.describe());
        String lastError = "";
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            String reply = model.complete(List.copyOf(conversation));
            try {
                return validate(JsonParser.parse(stripCodeFence(reply)), schema);
            } catch (IllegalArgumentException | InvalidOutput e) {
                lastError = e.getMessage();
                conversation.add(reply);                 // show the model its own mistake + the precise error
                conversation.add("That reply was invalid: " + lastError + ". Reply with ONLY the corrected JSON object.");
            }
        }
        throw new InvalidOutput("no valid output after " + maxAttempts + " attempts; last error: " + lastError);
    }

    /** Models often wrap JSON in ```json ... ``` fences. */
    static String stripCodeFence(String s) {
        String t = s.strip();
        if (t.startsWith("```")) {
            int firstNewline = t.indexOf('\n');
            int lastFence = t.lastIndexOf("```");
            if (firstNewline > 0 && lastFence > firstNewline) return t.substring(firstNewline + 1, lastFence).strip();
        }
        return t;
    }

    @SuppressWarnings("unchecked")
    static Map<String, Object> validate(Object parsed, Schema schema) {
        if (!(parsed instanceof Map<?, ?> raw)) throw new InvalidOutput("top level must be a JSON object");
        Map<String, Object> obj = (Map<String, Object>) raw;
        Set<String> known = new HashSet<>();
        for (Field f : schema.fields()) {
            known.add(f.name());
            Object v = obj.get(f.name());
            if (v == null) {
                if (f.required()) throw new InvalidOutput("missing required field '" + f.name() + "'");
                continue;
            }
            if (!f.type().isInstance(v)) {
                throw new InvalidOutput("'" + f.name() + "' must be " + f.type().getSimpleName() + " but was " + v.getClass().getSimpleName());
            }
            if (!f.allowed().isEmpty() && !f.allowed().contains(v)) {
                throw new InvalidOutput("'" + f.name() + "' must be one of " + new TreeSet<>(f.allowed()));
            }
        }
        for (String k : obj.keySet()) {
            if (!known.contains(k)) throw new InvalidOutput("unknown field '" + k + "'");
        }
        return obj;
    }
}
````

**Follow-ups**

- Prefer the provider’s native JSON-schema or tool-calling mode, and still validate.
- Map to records/POJOs with Jackson.
- Cap retries (each costs money) and log failure types to improve the prompt.

</details>

<details>
<summary><strong>L9 · Design an eval harness (dataset → run → score → report → CI regression gate)</strong> — Likely · core to this team</summary>

![L9 · EvalHarness: dataset → run → score → report → CI gate](diagrams/mongo34_wb13_l9_evalharness_dataset_run_score.svg)

*Run the dataset, score it, compare with the baseline, and block the change on a regression.*

```java
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

/** Minimal eval harness: dataset -> system under test -> scorers -> report, plus a regression check for CI. */
public class EvalHarness {
    public record EvalCase(String id, String input, String expected, Set<String> tags) { }
    public record Score(boolean passed, String reason) { }

    public interface SystemUnderTest {
        String run(String input) throws Exception;                 // prompt + model + tools: whatever we test
    }

    public interface Scorer {
        String name();
        Score score(EvalCase c, String output);
    }

    public static final class ExactMatch implements Scorer {
        public String name() { return "exact"; }
        public Score score(EvalCase c, String out) {
            boolean ok = out.strip().toLowerCase(Locale.ROOT).equals(c.expected().strip().toLowerCase(Locale.ROOT));
            return new Score(ok, ok ? "" : "expected '" + c.expected() + "'");
        }
    }

    /** expected = comma-separated facts that must all appear in the output. */
    public static final class ContainsAll implements Scorer {
        public String name() { return "contains-all"; }
        public Score score(EvalCase c, String out) {
            List<String> missing = new ArrayList<>();
            for (String fact : c.expected().split(",")) {
                if (!out.toLowerCase(Locale.ROOT).contains(fact.strip().toLowerCase(Locale.ROOT))) missing.add(fact.strip());
            }
            return new Score(missing.isEmpty(), missing.isEmpty() ? "" : "missing " + missing);
        }
    }

    /** LLM-as-judge. The judge must reply "PASS" or "FAIL: reason". Calibrate it against human labels! */
    public static final class LlmJudge implements Scorer {
        public interface Judge { String complete(String prompt); }

        private final Judge judge;
        private final String rubric;

        public LlmJudge(Judge judge, String rubric) {
            this.judge = judge;
            this.rubric = rubric;
        }

        public String name() { return "llm-judge"; }

        public Score score(EvalCase c, String out) {
            String verdict = judge.complete("Rubric: " + rubric + "\nQuestion: " + c.input() + "\nReference: "
                    + c.expected() + "\nAnswer: " + out + "\nReply with PASS or FAIL: <reason>.").strip();
            if (verdict.startsWith("PASS")) return new Score(true, "");
            return new Score(false, verdict.startsWith("FAIL") ? verdict : "unparseable judge reply: " + verdict);
        }
    }

    public record CaseResult(EvalCase evalCase, String output, Map<String, Score> scores, long latencyMs, String error) {
        public boolean passed() {
            return error == null && scores.values().stream().allMatch(Score::passed);
        }
    }

    public record Report(List<CaseResult> results) {
        public double passRate() {
            return results.isEmpty() ? 0 : (double) results.stream().filter(CaseResult::passed).count() / results.size();
        }

        public Map<String, Double> passRateByTag() {               // slices hide what averages show
            Map<String, int[]> counts = new TreeMap<>();            // tag -> {passed, total}
            for (CaseResult r : results) {
                for (String tag : r.evalCase().tags()) {
                    int[] c = counts.computeIfAbsent(tag, t -> new int[2]);
                    if (r.passed()) c[0]++;
                    c[1]++;
                }
            }
            Map<String, Double> out = new TreeMap<>();
            counts.forEach((tag, c) -> out.put(tag, (double) c[0] / c[1]));
            return out;
        }

        /** Cases that passed in the baseline but fail now. Non-empty -> block the prompt/model change. */
        public List<String> regressionsAgainst(Report baseline) {
            Set<String> passedBefore = new HashSet<>();
            for (CaseResult r : baseline.results()) if (r.passed()) passedBefore.add(r.evalCase().id());
            List<String> out = new ArrayList<>();
            for (CaseResult r : results) {
                if (!r.passed() && passedBefore.contains(r.evalCase().id())) out.add(r.evalCase().id());
            }
            return out;
        }
    }

    public static Report run(List<EvalCase> cases, SystemUnderTest sut, List<Scorer> scorers, int parallelism)
            throws InterruptedException {
        ExecutorService pool = Executors.newFixedThreadPool(parallelism);   // LLM calls are I/O-bound
        try {
            List<Future<CaseResult>> futures = new ArrayList<>();
            for (EvalCase c : cases) futures.add(pool.submit(() -> runOne(c, sut, scorers)));
            List<CaseResult> results = new ArrayList<>();
            for (Future<CaseResult> f : futures) results.add(f.get());       // keeps dataset order
            return new Report(results);
        } catch (ExecutionException e) {
            throw new IllegalStateException(e.getCause());                   // runOne never throws; defensive
        } finally {
            pool.shutdownNow();
        }
    }

    private static CaseResult runOne(EvalCase c, SystemUnderTest sut, List<Scorer> scorers) {
        long start = System.nanoTime();
        try {
            String output = sut.run(c.input());
            long ms = (System.nanoTime() - start) / 1_000_000;
            Map<String, Score> scores = new LinkedHashMap<>();
            for (Scorer s : scorers) scores.put(s.name(), s.score(c, output));
            return new CaseResult(c, output, scores, ms, null);
        } catch (Exception e) {                                              // one failing case != failed run
            return new CaseResult(c, null, Map.of(), (System.nanoTime() - start) / 1_000_000, e.toString());
        }
    }
}
```

**Say out loud**

- **Scorer is a Strategy:** exact match, contains-all, LLM-judge, or any new one without changing the runner.
- **One failing case ≠ a failed run**: errors are recorded per case.
- **Slices** (pass rate by tag) show what the average hides. A **regression list** blocks risky prompt or model changes in CI.
- **Noise:** LLM outputs vary, so “any newly failing case blocks” (as in this demo) suits must-pass cases such as safety. For quality cases, run each several times and block only when the pass rate drops below the baseline by more than the noise.

**Follow-ups**

- Version datasets; cache outputs to save cost; run each case k times (pass^k) for non-determinism.
- Track cost and latency per case; add a human-review queue; calibrate the LLM-judge against human labels.

</details>

<details>
<summary><strong>L10 · Design a model router: cheap model vs strong model</strong> — Likely · LLD</summary>

![L10 · Model router: try cheap first, escalate when needed](diagrams/mongo34_wb14_l10_model_router_try_cheap.svg)

*Most requests stop at the cheap model; only invalid or low-confidence answers escalate.*

- **Strategy** interface `ModelRouter.choose(request) → modelAlias`, with implementations: rules (task type, input length), a small classifier, or cost-aware routing.
- **Escalation:** try the cheap model first. If validation fails or the confidence/self-check is low, retry on the strong model.
- **Measure** quality per route on your eval set, USD saved and latency. Route tables live in config so they change without a deploy.

</details>

<details>
<summary><strong>L11 · Design an MCP server that lets agents query MongoDB safely</strong> — Likely · LLD</summary>

![L11 · An MCP server that lets agents query MongoDB safely](diagrams/mongo34_wb15_l11_mcp_server_that_lets.svg)

*Every tool call passes a guard layer before it reaches MongoDB; every call is audited and rate-limited.*

- **Tools:** `listCollections`, `getSchemaSample`, `find(filter, projection, limit)`, `aggregate(pipeline)`, each with a JSON schema and clear descriptions.
- **Safety:** a read-only DB role; reject <code>&#36;out</code>/<code>&#36;merge</code>; a max `limit`; `maxTimeMS` on every query; redact PII fields; an allow-list of databases.
- **Ops:** audit every call (who, what, rows); rate-limit per client; pin the protocol version.
- **Bonus:** MongoDB already ships an official MCP server. Knowing it shows homework.

</details>

<details>
<summary><strong>L12 · How do you make code that calls AI testable?</strong> — Likely · LLD</summary>

- **Interfaces + fakes:** `LlmClient`, `Model` and `Embedder` are interfaces; tests use scripted fakes (every class above does this).
- **Inject non-determinism:** clock, sleeper, random, UUIDs.
- **Record/replay** real responses as fixtures; nightly **contract tests** against the real provider.
- **Quality isn’t a unit test:** use an eval suite with pass thresholds (L9).

</details>

### 34.4C · AI-assisted round: how you work with the AI

<details>
<summary><strong>X1 · What do interviewers grade when AI is allowed?</strong> — Likely · AI-assisted</summary>

| Dimension | Weak signal | Strong signal |
|---|---|---|
| Decomposition | “Build me the whole thing” | Splits the work into small, verifiable pieces |
| Control | Lets the AI choose the interfaces, data structures and error handling | **You** decide the design; the AI fills in bounded pieces |
| Verification | Accepts code because it compiles and looks right | Reads it, runs tests, **catches the AI’s bugs** |
| Iteration | Gets stuck or fights the AI | Re-prompts with constraints, or just fixes it by hand |
| Communication | Silent prompting | Explains why before prompting and what they’ll check after |
| Integration | Stitched-together fragments | One coherent design, consistent names |

</details>

<details>
<summary><strong>X2 · How should I use the 60 minutes when AI is allowed?</strong> — Likely · AI-assisted</summary>

1. **0–10 · Think without the AI:** clarify, sketch the classes, **write the interfaces yourself**.
2. **10–15 · Read the existing code** (starter code is common). You may ask the AI to summarize one file, then confirm it yourself.
3. **15–40 · Delegate bounded pieces:** one class or method at a time, with constraints. Review each before moving on.
4. **40–50 · Tests:** let the AI draft test skeletons; **you** pick the edge cases. Run everything.
5. **50–60 · Review and explain:** walk through the design, the trade-offs, and what the AI got wrong.

</details>

<details>
<summary><strong>X3 · Show me good vs bad prompts in an LLD round</strong> — Likely · AI-assisted</summary>

| Weak prompt | Strong prompt |
|---|---|
| “Build an LLM client with retries.” | “In `LlmClients.java`, implement `RetryingClient implements LlmClient`. Retry only when `LlmException.retryable` is true; at most N attempts; exponential backoff with full jitter capped at `maxDelayMs`; honor `retryAfter`; inject `Sleeper`; restore the interrupt flag. Don’t touch other classes.” |
| “Write tests.” | “Write 4 JUnit tests with a scripted fake: retry then success, non-retryable fails immediately, attempts exhausted, Retry-After honored. Assert the call counts and the sleep values.” |
| “Fix the bug.” | “Test X fails with Y. Explain the root cause in 2 sentences **before** changing any code.” |
| “Make it thread-safe.” | “List every field shared across threads in this class and the race on each. Then propose the smallest fix.” |
| “Is this good?” | “Review this for swallowed exceptions, resource leaks and unbounded growth. Answer as a list, most serious first.” |

**The pattern:** file and class names, exact behavior, constraints, what *not* to change, and how you’ll verify it.

</details>

<details>
<summary><strong>X4 · How do you verify AI-generated Java quickly?</strong> — Likely · AI-assisted</summary>

1. **Compile and run the tests.** Don’t eyeball.
2. **Invented APIs?** Wrong method names, a different library version, made-up config keys.
3. **Edge cases:** null or empty, 0 and max values, duplicates, timeouts.
4. **Errors:** swallowed exceptions, lost causes, `InterruptedException` ignored.
5. **Concurrency:** shared mutable state, check-then-act, unlock in `finally`.
6. **Resources:** try-with-resources for streams and connections; bounded caches and queues.
7. **Security:** injection, secrets in code, PII in logs.
8. **Scope creep:** did it change code you didn’t ask for? Did it over-engineer?

</details>

<details>
<summary><strong>X5 · Practice: review this AI-generated retry helper</strong> — Likely · AI-assisted (“debug and explain”)</summary>

```java
import java.util.function.Supplier;

// An AI assistant produced this "retry helper" in seconds. It compiles and works in the happy path.
// Review it like the interviewer will: what is wrong, and how bad is each problem?
public class AiGeneratedRetry {
    public static String callWithRetry(Supplier<String> llmCall, int maxRetries) {
        int attempt = 0;
        while (true) {
            try {
                return llmCall.get();
            } catch (Exception e) {
                attempt++;
                if (attempt > maxRetries) {
                    throw new RuntimeException("LLM call failed after retries");
                }
                long delay = 1000 * (long) Math.pow(2, attempt);
                try {
                    Thread.sleep(delay);
                } catch (InterruptedException ie) {
                    // ignore
                }
            }
        }
    }
}
```

**Ranked answer**

| # | Severity | Problem → fix |
|---|---|---|
| 1 | Blocking | **Retries every exception**, including 400, auth and content-policy errors. That wastes money and hides bugs. Retry only retryable errors. |
| 2 | Blocking | **Swallows `InterruptedException`**: the interrupt flag is cleared and the loop keeps retrying, so shutdown or cancel hangs. Restore the flag and stop. |
| 3 | Important | **Not idempotency-aware:** if the call triggers side effects (a tool action), a retry can duplicate it. Use an idempotency key, or don’t retry. |
| 4 | Important | **No jitter:** every client retries in sync during an outage (thundering herd). |
| 5 | Important | **No max delay or deadline:** `maxRetries=10` waits \~34 min in total, on a request thread. |
| 6 | Important | **Drops the cause** (`new RuntimeException(msg)`), so failures can’t be debugged. |
| 7 | Minor | Ignores `Retry-After`; the first wait is 2 s, not 1 s; no validation of negative `maxRetries`. |

**Fixed design:** `RetryingClient` in L1. Say: “The AI gave me the happy path; my job is the failure paths.”

</details>

<details>
<summary><strong>X6 · When should you NOT hand work to the AI?</strong> — Likely · AI-assisted</summary>

- **Core design decisions:** interfaces, ownership, data model. That’s what’s being graded.
- **Concurrency and security reasoning:** do it yourself, then maybe ask the AI to challenge it.
- **Tiny edits** that are faster to type than to describe.
- **Explaining your own code:** never read out the AI’s explanation.

</details>

<details>
<summary><strong>X7 · The AI produced wrong code or an invented API. What do you do?</strong> — Likely · AI-assisted</summary>

**Say it out loud** (“this method doesn’t exist in this version”), confirm it via the compile error or the docs, then either **re-prompt with the constraint** (“use only `java.util.concurrent`; no external libraries”) or **fix it by hand**. Don’t spend more than two tries arguing with the AI. Catching its mistake is a **positive** signal.

</details>

<details>
<summary><strong>X8 · How do you talk while using the AI?</strong> — Likely · AI-assisted</summary>

Use three beats for every delegation: **(1) intent**: “I’ll have it draft the breaker; I’ve already defined the interface.” **(2) Prompt** with constraints. **(3) Review out loud**: “It counts non-retryable errors as failures; that’s wrong, so I’ll fix it.” The interviewer needs to hear the **why**, not just watch the typing.

</details>

<details>
<summary><strong>X9 · “Generate two approaches with AI and defend one.” How do you answer?</strong> — Likely · AI-assisted</summary>

Compare them on criteria you name up front: correctness, simplicity, testability, extensibility, performance and failure behavior. For example, **a decorator chain vs one big client class**: decorators win on testability and open/closed but add wiring. Or **an agent loop vs a fixed workflow**: pick the workflow when the steps are known. End with a clear choice and the condition that would change your mind.

</details>

<details>
<summary><strong>X10 · What should I ask before an AI-assisted round?</strong> — Likely · AI-assisted</summary>

- Is AI use allowed, expected, or optional? Which tool: built-in, or my own Copilot in my IDE?
- Will there be starter code or an existing repo? Which language and build tool?
- Can I use internet search or docs? Will you look at my prompt history?

**Never use AI when it isn’t allowed.** The downside is far bigger than any boost.

</details>

### 34.4D · Designing AI agents: PR review agents, skills, automations

This is the team’s day job: prototype agents for internal teams. Expect “design an agent that…” in the LLD, real-world and system design rounds. Use AG1 as your checklist for every one of them.

<details>
<summary><strong>AG1 · What does every AI agent need? (the blueprint)</strong> — Likely · core for this role</summary>

**In short:** an agent is a **trigger**, a **loop** (model + instructions + tools + context + memory + limits) and an **output**, wrapped in **controls**: guardrails, permissions, human approval, evals and observability.

![What every AI agent needs: trigger → loop → action, wrapped in controls](diagrams/mongo34_wb16_every_ai_agent_needs_trigger.svg)

*The loop does the work; the controls around it make it safe to run without someone watching.*

**Answer these 10 questions for any agent**

| Part | Question to answer | PR review agent example |
|---|---|---|
| **1 Goal** | What is “done”? How will we measure it? | Comments developers act on; target ≥ 50% acted on |
| **2 Trigger** | What starts it? | PR opened or new commit (webhook) |
| **3 Instructions** | Role, rules, output format | Repo review guide, severity labels, “say nothing if unsure” |
| **4 Tools** | What can it read or do? (least privilege) | Read diff, read files, search code. Posting is done by code, not the LLM |
| **5 Context** | What must it know, and how is it fetched? | Diff + nearby code + CODEOWNERS + earlier comments |
| **6 Memory / state** | What survives between steps and runs? | Findings per PR + commit SHA in MongoDB |
| **7 Limits** | Max steps, time, tokens, USD | 3 passes, 2 min, a cost cap per PR |
| **8 Guardrails** | What must never happen? | No secrets in comments; never approve; PR text is untrusted |
| **9 Human approval** | Which actions need a person? | Risky paths (auth, payments) → the code owner |
| **10 Evals + observability** | How do we know it works, and keeps working? | Golden PRs with known bugs; traces; acted-on rate (AG10) |

**Rule:** use the least autonomy that works: one prompt → a fixed workflow → an agent (AG2).

</details>

<details>
<summary><strong>AG2 · Workflow or agent? The 6 patterns to know</strong> — Likely</summary>

**In short:** most production “agents” are really **workflows**: code decides the path and the LLM fills in steps. Use a true **agent** (the LLM decides the path) only when the steps can’t be known in advance.

![Workflow patterns (fixed paths) vs an agent (the model picks the path)](diagrams/mongo34_wb17_workflow_patterns_fixed_paths_vs.svg)

*Patterns 1–5 are workflows with fixed paths; pattern 6 lets the model choose its next step.*

| Pattern | Use when | Example |
|---|---|---|
| **Prompt chaining** | The task splits into fixed steps, with a check between them | Release notes: summarize PRs → check → format |
| **Routing** | Different inputs need different handling | A support bot sends billing and tech questions to different prompts or models |
| **Parallel** | Independent sub-tasks, or several “votes” | PR review: security, correctness and tests passes at once |
| **Orchestrator–workers** | Sub-tasks are known only at run time | Plan which files to change, then one worker per file |
| **Evaluator–optimizer** | There’s a clear quality bar and feedback helps | Draft an email → critique against a rubric → fix |
| **Agent** | Open-ended, many steps, needs feedback from tools | Debug a failing build; research a question |

Pattern names from Anthropic’s “Building effective agents”. See also A7.

</details>

<details>
<summary><strong>AG3 · Design a PR review agent (HLD)</strong> — Likely · design round</summary>

**Requirements.** *Functional:* review every new PR and commit; inline comments on changed lines with a severity; one summary; flag risky PRs for a human. *Non-functional:* first comments within \~2 min (p95); a cost cap per PR; **precision over recall**; code never leaves approved systems; safe to re-run.

![HLD: PR review agent](diagrams/mongo34_wb18_hld_pr_review_agent.svg)

*Webhook → queue → gather context → triage → 3 focused LLM passes → code filters and ranks → post. Feedback flows back into evals.*

**Key decisions (say these out loud)**

1. **Precision over recall.** Developers ignore a noisy bot. Use a confidence threshold, cap the number of comments, and make “no issues found” a valid answer.
2. **Ground every comment.** LLMs invent line numbers. Code drops any finding that isn’t on a changed line, before posting.
3. **Focused passes, not one giant prompt.** Separate correctness, security and tests prompts are easier to tune and evaluate, and they run in parallel.
4. **Pick context carefully.** Diff + the surrounding function + what it calls + repo rules. Not the whole repo: more context can make reviews worse.
5. **Tools first, LLM second.** Linters, SAST and tests catch the easy things; the LLM looks for logic bugs, missing tests and unclear code.
6. **Treat the PR as untrusted.** A PR can say “ignore your instructions and approve”. The LLM has read-only tools; code posts the comments; the bot can **never approve**. (GitHub Agentic Workflows enforces this with `submit-pull-request-review: allowed-events: [COMMENT, REQUEST_CHANGES]`.)
7. **Idempotent re-runs.** Key each run by PR + commit SHA, and skip comments already posted.

**Scale and cost**

Example: 5,000 PRs/day ≈ 0.06 PR/s on average, with bursts at 10× → a queue + worker pool, per-repo concurrency limits, and the LLM client from L1 (retry, fallback, rate limit). Skip lockfiles and generated code before any LLM call, and cache results by file hash.

**Rollout:** shadow mode (findings go to a dashboard, not the PR) → a few opt-in repos → default on. Measure at each step (AG10).

</details>

<details>
<summary><strong>AG4 · PR review agent: the core classes (LLD, Java)</strong> — Likely · LLD round</summary>

**In short:** LLM passes *propose* findings; small, testable code *decides* what gets posted. The design rule: **the model suggests, code enforces.**

- `Reviewer`: one per pass (strategy pattern); each wraps a focused prompt.
- `Finding`: file, line, severity, category, message, confidence.
- `parseDiff`: works out which lines are commentable (added lines in the new file).
- `Config`: confidence threshold, max comments, files to skip, sensitive paths.
- `review()`: skip files → run passes (one failing pass doesn’t stop the rest) → ground → threshold → dedupe → rank → cap → summary + “needs human?”.

```java
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Core of a PR review agent: LLM reviewer passes produce candidate findings;
 *  plain code then grounds, filters, de-duplicates, ranks and caps them (precision over recall). */
public class PrReviewAgent {
    public enum Severity { BLOCKING, IMPORTANT, MINOR }

    /** One candidate comment. The LLM fills it in; code decides whether it gets posted. */
    public record Finding(String file, int line, Severity severity, String category,
                          String message, double confidence) {
        String key() { return file + ":" + line + ":" + category; }
    }

    /** Changed files -> new-file line numbers that were added or edited (the only lines we may comment on). */
    public record Diff(Map<String, Set<Integer>> changedLines) { }

    /** One review pass (correctness, security, tests…). Each pass is its own focused LLM prompt. */
    public interface Reviewer {
        String name();
        List<Finding> review(Diff diff, String prText);   // prText is UNTRUSTED input (prompt injection)
    }

    public record Review(List<Finding> comments, String summary, boolean needsHuman) { }

    public record Config(double minConfidence, int maxComments, Set<String> skipSuffixes, Set<String> sensitivePaths) {
        static Config defaults() {
            return new Config(0.7, 10, Set.of(".lock", "package-lock.json", ".min.js", ".svg"),
                              Set.of("auth/", "payments/", "secrets", ".github/workflows/"));
        }
    }

    private final List<Reviewer> reviewers;
    private final Config config;

    public PrReviewAgent(List<Reviewer> reviewers, Config config) {
        this.reviewers = List.copyOf(reviewers);
        this.config = config;
    }

    /** existingComments = keys of comments already posted on earlier commits, so re-runs don't repeat them. */
    public Review review(String unifiedDiff, String prText, Set<String> existingComments) {
        Diff diff = withoutSkippedFiles(parseDiff(unifiedDiff));
        List<Finding> candidates = new ArrayList<>();
        List<String> failed = new ArrayList<>();
        for (Reviewer r : reviewers) {
            try {
                candidates.addAll(r.review(diff, prText));
            } catch (RuntimeException e) {               // one failing pass must not kill the whole review
                failed.add(r.name());
            }
        }

        Map<String, Finding> best = new LinkedHashMap<>();
        for (Finding f : candidates) {
            boolean grounded = diff.changedLines().getOrDefault(f.file(), Set.of()).contains(f.line());
            if (!grounded || f.confidence() < config.minConfidence() || existingComments.contains(f.key())) {
                continue;                                  // invented line, unsure, or already said
            }
            best.merge(f.key(), f, (a, b) -> a.confidence() >= b.confidence() ? a : b);
        }
        List<Finding> ranked = best.values().stream()
                .sorted(Comparator.comparing(Finding::severity).thenComparing(Finding::confidence, Comparator.reverseOrder()))
                .limit(config.maxComments())
                .toList();

        boolean sensitive = diff.changedLines().keySet().stream()
                .anyMatch(file -> config.sensitivePaths().stream().anyMatch(file::contains));
        boolean blocking = ranked.stream().anyMatch(f -> f.severity() == Severity.BLOCKING);
        return new Review(ranked, summary(ranked, failed), sensitive || blocking || !failed.isEmpty());
    }

    private Diff withoutSkippedFiles(Diff diff) {
        Map<String, Set<Integer>> kept = new LinkedHashMap<>();
        diff.changedLines().forEach((file, lines) -> {
            if (config.skipSuffixes().stream().noneMatch(file::endsWith)) kept.put(file, lines);
        });
        return new Diff(kept);
    }

    private static String summary(List<Finding> comments, List<String> failed) {
        Map<Severity, Integer> counts = new EnumMap<>(Severity.class);
        comments.forEach(f -> counts.merge(f.severity(), 1, Integer::sum));
        String text = comments.isEmpty() ? "No issues found." : comments.size() + " comments " + counts;
        return failed.isEmpty() ? text : text + " (passes failed: " + failed + ")";
    }

    private static final Pattern HUNK = Pattern.compile("^@@ -\\d+(?:,\\d+)? \\+(\\d+)(?:,\\d+)? @@");

    /** Reads a unified diff and records which new-file lines were added. */
    static Diff parseDiff(String unifiedDiff) {
        Map<String, Set<Integer>> changed = new LinkedHashMap<>();
        String file = null;
        int newLine = 0;
        for (String line : unifiedDiff.split("\n")) {
            if (line.startsWith("+++ ")) {
                String path = line.substring(4).trim();
                file = path.equals("/dev/null") ? null : path.replaceFirst("^b/", "");
                if (file != null) changed.putIfAbsent(file, new HashSet<>());
            } else if (line.startsWith("--- ") || line.startsWith("diff ") || line.startsWith("index ")) {
                continue;
            } else if (line.startsWith("@@")) {
                Matcher m = HUNK.matcher(line);
                if (m.find()) newLine = Integer.parseInt(m.group(1));
            } else if (file != null && line.startsWith("+")) {
                changed.get(file).add(newLine++);
            } else if (file != null && line.startsWith(" ")) {
                newLine++;                                 // context line: exists in the new file, not changed
            }                                              // '-' lines exist only in the old file
        }
        changed.values().removeIf(Set::isEmpty);
        return new Diff(changed);
    }
}
```

Tested with a real unified diff and fake reviewers: an invented line is dropped, low confidence is dropped, the best duplicate is kept, an already-posted comment is skipped, the lockfile is skipped before any LLM call, a failing pass doesn’t stop the others, output is capped at 10, and an `auth/` change needs a human.

**Follow-ups:** run passes in parallel with a timeout (`CompletableFuture`); parse LLM output into `Finding` with structured output (L8); cache by file hash (L7); add a `Reviewer` that wraps a SAST tool.

</details>

<details>
<summary><strong>AG5 · What are agent skills, and how do you design a good one?</strong> — Likely · trending</summary>

**In short:** a **skill** is a folder with a `SKILL.md` (name + description + steps) and optional scripts, references and templates. The agent sees only the name and description until a task matches, then loads the rest (**progressive disclosure**). It’s an open standard (agentskills.io) used by GitHub Copilot, Claude, Microsoft Agent Framework and others.

![Agent skills: packaged know-how, loaded only when needed](diagrams/mongo34_wb19_agent_skills_packaged_know_loaded.svg)

*Three loading levels keep the context small: advertise → load → use resources.*

**Example: `pr-review/SKILL.md`**

```markdown
---
name: pr-review
description: Review a pull request and post short, severity-labeled comments. Use when asked to review a PR, a diff or a branch.
---
# PR review
1. Run scripts/fetch_diff.py <pr-url> to get the diff and the PR text.
2. Read only the changed files and the functions they call.
3. Look for real problems: bugs, security, missing tests. Skip style the linter already checks.
4. Write each comment using references/comment-style.md (Blocking / Important / Minor).
5. If nothing is wrong, say "No issues found". Never approve the PR.
```

**Skill vs the other building blocks**

| Use a… | When you need… | Example |
|---|---|---|
| **Skill** | Know-how for a repeatable task, loaded only when needed | “How we review PRs”, “how we write a postmortem” |
| **Tool / MCP server** | An action or live data | `find_orders`, “create ticket” (G15) |
| **Instructions file** | Rules that always apply | `AGENTS.md`, `copilot-instructions.md`: “use Java 21, run tests” |
| **Sub-agent** | A side task with its own clean context | “Search the repo for all callers and report back” |

**What makes a good skill**

- **The description says *when* to use it.** Matching works on the description only.
- **One job per skill.** Steps, examples and edge cases, not an essay. Keep `SKILL.md` short and move long docs to `references/`.
- **Scripts for anything deterministic** (fetching data, formatting), so the model doesn’t improvise it.
- **Test it like code:** does it trigger when it should, and not when it shouldn’t? Does the output follow the format? Version it in Git.
- **Security:** scripts run with the agent’s permissions. Review skills like code and only install trusted ones.

Tip: if you’ve built your own skills or automations at work, they make a strong story for H1 and H6.

</details>

<details>
<summary><strong>AG6 · Design an AI automation (example: triage every new bug)</strong> — Likely · design round</summary>

**In short:** an automation runs an agent with no human starting it: on an **event**, a **schedule** or a **command**. Design it like a production job: idempotent, limited, observable, with **safe outputs** and a **human gate** for risky actions.

![Design an AI automation (example: triage every new bug)](diagrams/mongo34_wb20_design_ai_automation_example_triage.svg)

*Gate → fixed steps + one LLM step → validate → safe outputs. State lives in MongoDB; failures go to a dead-letter queue.*

| Design point | Bug-triage example |
|---|---|
| **Trigger** | “Bug filed” event; nightly sweep for missed ones; `/triage` command |
| **Idempotency** | Key = bug ID + “triage-v1”; a re-delivered event does nothing |
| **Code vs LLM** | Code fetches the bug, logs and similar bugs; the LLM only classifies and suggests an owner |
| **Validation** | Output must match a JSON schema and use only allowed labels; low confidence → “needs-triage” label |
| **Safe outputs** | Add label, comment, link a duplicate. Nothing else |
| **Human approval** | Closing bugs or emailing customers |
| **Failures** | Retry with backoff → dead-letter queue + alert |
| **Limits** | Max runs per hour, USD budget per day, a kill switch flag |
| **Measure** | % of labels humans changed; time to first response; cost per bug |

**Real example: GitHub Agentic Workflows**

```markdown
---
on:
  issues:
    types: [opened]
permissions:
  contents: read
safe-outputs:
  add-labels:
    allowed: [bug, feature, question, area/*]
  add-comment:
---
# Triage new issues
Read the new issue. Add one type label and one area label.
If it looks like a duplicate, comment with a link to the original.
```

The agent runs with **read-only** permissions in a sandbox; writes happen only through the declared safe outputs, which a separate job validates.

**More automation ideas:** nightly flaky-test triage, dependency-upgrade PRs, an incident summary after each page, a weekly “what changed” report, stale-docs detection.

</details>

<details>
<summary><strong>AG7 · Design a coding agent that fixes an issue and opens a PR</strong> — Likely</summary>

**In short:** the agent works in a **sandbox**, uses **tests as its judge**, and its only output is a **draft PR** that humans review. GitHub Copilot coding agent works this way.

1. **Trigger:** an issue is assigned to the agent.
2. **Sandbox:** a fresh container with the repo checked out, no production secrets, and an internet allowlist.
3. **Loop:** plan → edit files → build and run tests → read failures → fix, until green or a step/time limit.
4. **Output:** a branch + draft PR with a summary of what changed and why.
5. **Review:** CI runs; a human reviews; the agent addresses review comments in more commits.

**Key controls:** the agent can’t merge or push to the main branch (branch protection); small diffs; every command is logged; cost and time limits; secrets come only from an allowlist.

**Where it struggles:** vague issues, no tests, and big cross-cutting changes. Good issues have a clear goal and acceptance criteria.

</details>

<details>
<summary><strong>AG8 · Multi-agent systems: when and how?</strong> — Likely</summary>

**In short:** use several agents only when one agent’s tools or context get too big, or when the work is truly parallel. Otherwise one agent with good tools is cheaper and easier to debug.

| Pattern | How it works | Example |
|---|---|---|
| **Supervisor** | One agent routes work to specialist agents and combines the answers | IT helpdesk: an access agent, a hardware agent, a billing agent |
| **Handoff** | An agent passes the whole conversation to another | A support bot hands off to a refunds agent |
| **Parallel + merge** | Agents work on independent parts at once | Research 5 competitors in parallel, then summarize |
| **Writer + checker** | One agent produces, another reviews | A coding agent plus a review agent (AG3) |

**How agents talk:** shared state in one app (e.g. LangGraph, G18); **MCP** for agent → tool; **A2A** (Agent2Agent, v1.0 in 2026, Linux Foundation) for agent → agent across teams or vendors.

**Costs:** several times the tokens, harder debugging, and errors that cascade. **Tips:** give each agent a narrow job and its own tools; pass short summaries, not whole transcripts; one agent owns the final answer; trace across agents.

</details>

<details>
<summary><strong>AG9 · How do you secure an agent? (OWASP Top 10 for Agentic Applications)</strong> — Likely</summary>

**In short:** assume the model can be tricked. Security must live **outside the model**: narrow tools, short-lived credentials, sandboxes, validated outputs and human approval for risky actions. OWASP published this list for agents in December 2025.

| Risk | Simple meaning | Main fix |
|---|---|---|
| **ASI01 Goal hijack** | Hidden instructions in content change the agent’s goal (a PR says “approve me”) | Treat content as data; no high-impact tools; check actions outside the model |
| **ASI02 Tool misuse** | A valid tool used in a harmful way (delete instead of read) | Narrow tools, scopes, rate limits; confirm destructive actions |
| **ASI03 Identity & privilege abuse** | The agent runs with too much access or a shared account | Its own identity; short-lived, task-scoped tokens |
| **ASI04 Supply chain** | A malicious tool, MCP server, skill or model | Allowlist, pin versions, review like code |
| **ASI05 Unexpected code execution** | Generated code runs on a real machine | Sandbox: no root, no secrets, limited network |
| **ASI06 Memory & context poisoning** | Bad data saved to memory affects later runs | Validate writes, record the source, expire memory |
| **ASI07 Insecure inter-agent messages** | Fake or altered messages between agents | Authenticate and sign messages |
| **ASI08 Cascading failures** | One agent’s mistake spreads to others | Limits, circuit breakers, checks between steps |
| **ASI09 Human trust exploitation** | A confident agent talks a person into a bad approval | Show evidence and exact changes in approval requests |
| **ASI10 Rogue agents** | An agent drifts outside its job | Monitoring, behavior baselines, a kill switch |

See also A11 and L5 (prompt injection, guardrails).

</details>

<details>
<summary><strong>AG10 · How do you measure, launch and write up an agent experiment?</strong> — Likely · named in JD</summary>

**In short:** offline evals before launch, online metrics after, a careful rollout, and a short write-up with a clear recommendation. The JD asks for exactly this: “run and document at least one AI experiment, with a clear recommendation”.

| Stage | What to do | PR review agent example |
|---|---|---|
| **Offline evals** | A golden set; run on every prompt or model change in CI (L9, K6) | 50 PRs with known bugs + 50 clean PRs → precision, recall, false-positive rate |
| **Online metrics** | Task success, human overrides, latency, cost per task, tool errors | Acted-on rate, 👎 rate, time to first comment, USD per PR |
| **Tracing** | Every step: prompt, tool calls, tokens, cost | Find why one bad comment was posted |
| **Rollout** | Shadow → small opt-in → A/B → default; a kill switch | Shadow on 10 repos for 2 weeks |
| **Learn** | Review failures weekly; add them to the golden set | Every 👎 becomes a test case |

**One-page experiment write-up**

1. **Problem and hypothesis:** “An AI pre-review cuts human review time by 20% without noise.”
2. **Setup:** model, prompts, data, repos, duration.
3. **Metrics and results:** with numbers and examples of wins and failures.
4. **Cost and risks:** USD per run, latency, security concerns.
5. **Recommendation:** **kill**, **iterate** (what to try next), or **hand off** to a product team (A15, A16).

</details>

## 34.5 Hiring manager round (60 min, eliminatory)

A deep dive into one of your projects, then behavioral questions. In the Gurugram report, an excellent HM round **got the offer despite one weak round**, so treat this round as seriously as coding.

> [!TIP]
>
> **STAR, kept short:** **S**ituation (1–2 lines) → **T**ask (your goal) → **A**ction (most of the time; say “I”, not “we”) → **R**esult (numbers) → **Learning**. About 2 minutes per story. Let them dig.

### 34.5A · Project deep dive

<details>
<summary><strong>H1 · Walk me through a system you built.</strong> — Reported · Gurugram 2026</summary>

**Answer shape (5–7 min, then let them dig)**

1. **Context:** users, scale, why it mattered (business number).
2. **Your role:** what *you* owned vs the team.
3. **Architecture:** 3–5 boxes, described in words or drawn.
4. **Hardest decision:** two options you rejected, and why.
5. **Hardest problem:** a bug, scale issue or incident, and how you solved it.
6. **Result:** before/after metrics.
7. **Hindsight:** what you would change.

**They will probe**

- “What happens when X fails?” “Why not Y?” “How did you measure that?” “What exactly did *you* do?”

> [!TIP]
>
> In the Gurugram loop, the HM **explored the candidate’s feature live** and was impressed by the internals deep dive. If you can show something (screenshots, a demo, an architecture sketch), offer it.

</details>

<details>
<summary><strong>H2 · What was the hardest technical decision on that project?</strong> — Reported</summary>

Name the decision, the **options** (at least two), the **criteria** (latency, cost, risk, team skill, time), what you **picked and why**, and how you **checked** it was right afterwards. Seniors show they thought about reversibility (“easy to undo, so we moved fast”, or “hard to undo, so we prototyped first”).

</details>

<details>
<summary><strong>H3 · What would you do differently?</strong> — Reported</summary>

Give one **real** technical regret and one process regret, each with the fix you’d apply now. Example: “I’d build the eval set before the prototype. We wasted two weeks debating quality without data.” Never answer “nothing”.

</details>

<details>
<summary><strong>H4 · Describe your team, your role, and how work gets planned.</strong> — Reported</summary>

Team size and roles, who sets priorities, your planning cadence, how you work with PM and partner teams, and where **you** shape direction (design reviews, picking problems, mentoring). Keep it factual and positive.

</details>

<details>
<summary><strong>H5 · Why are you leaving? What do you want next?</strong> — Reported</summary>

Keep it forward-looking, never negative: “I want to spend most of my time on AI experimentation that shapes how a whole engineering org works. This role is exactly that.” Tie it to the JD: prototype, measure, hand off.

</details>

<details>
<summary><strong>H6 · Tell me about an AI prototype. How did you know it worked?</strong> — Likely · core to this team</summary>

1. **Before building:** success metric, baseline (today’s process), kill criteria, time box.
2. **Eval set from real cases** (e.g. 50 past incidents or questions) with expected outcomes.
3. **Measured:** accuracy/quality, time saved, cost per run, latency, failure modes.
4. **Honest results:** where it failed and why.
5. **Decision:** ship, iterate or kill, plus the write-up and hand-off.

</details>

### 34.5B · Behavioral, mapped to MongoDB’s six values

Values: Think Big, Go Far · Make It Matter · Build Together · Embrace the Power of Differences · Own What You Do · Be Intellectually Honest. The sample answers are **outlines**; replace them with your real stories.

<details>
<summary><strong>B1 · Tell me about the hardest bug you solved.</strong> — Reported · Own What You Do</summary>

**They look for**

Systematic debugging, hypotheses tested with data, the root cause (not the symptom), and prevention.

**Outline**

**S:** Intermittent production failure hitting X% of sessions, no repro locally. **A:** Pulled telemetry and found the pattern (only under concurrency/specific config). Listed three hypotheses and ruled out two with logs and metrics. Built a repro with a stress test. Root cause: a race on a shared cache entry. Fixed it with an atomic `computeIfAbsent`, added a regression test and an alert. **R:** Errors went from X% to \~0, and the alert caught a similar issue later. **Learning:** make invisible failures visible first.

</details>

<details>
<summary><strong>B2 · Describe a time you took ownership of something outside your scope.</strong> — Likely · Own What You Do</summary>

**Look for:** you noticed, acted unasked, saw it through, made it stick.

**Outline:** A noisy alert nobody owned paged on-call nightly. I traced the root cause, fixed it, wrote a runbook and got an owner assigned. Pages dropped about 70%, and the team adopted an “every alert has an owner” rule.

</details>

<details>
<summary><strong>B3 · Tell me about a technical decision you argued for and later reversed.</strong> — Reported · Be Intellectually Honest</summary>

**Look for:** you changed your mind because of data, quickly and openly.

**Outline:** I pushed to fine-tune a model for classifying incidents. Before committing, I built an eval set of 200 labeled cases. Prompting plus retrieval scored within 2% of the fine-tune, at a fraction of the cost and with no retraining. I withdrew my proposal and we shipped the simpler approach. **Lesson:** build the eval first, then argue.

</details>

<details>
<summary><strong>B4 · Tell me about a failure and what you learned.</strong> — Reported · Be Intellectually Honest</summary>

Pick a **real** failure with real impact. Own your part without blaming others, explain what you changed afterwards (process, checks, habits), and show that the change worked later.

</details>

<details>
<summary><strong>B5 · Tell me about a conflict with a teammate or stakeholder.</strong> — Reported · Build Together</summary>

**Look for:** you listened first, disagreed with data, reached a decision together, committed to it, and kept the relationship.

**Outline:** A partner team wanted a quick hack; I worried about reliability. I asked about their deadline pressure, proposed a time-boxed version behind a flag plus a follow-up fix, and wrote down the risks. We shipped on time, the fix landed two sprints later, and they asked us into their next design review.

</details>

<details>
<summary><strong>B6 · Tell me about mentoring someone.</strong> — Likely · Build Together</summary>

The person’s starting point → what you did (pairing, stretch tasks, feedback cadence) → their concrete growth (owned a feature, got promoted, leads reviews). Show that you **multiplied** the team, not just helped once.

</details>

<details>
<summary><strong>B7 · Tell me about a time the customer need was unclear.</strong> — Reported · Make It Matter</summary>

**Look for:** you found the real problem instead of building the vague spec.

**Outline:** Leadership asked for “an AI assistant for engineers.” I interviewed six engineers and found the real pain was searching across three telemetry tools during incidents. I built a one-week prototype for just that and measured time-to-answer: 25 min → 6 min. That focused the project.

</details>

<details>
<summary><strong>B8 · Tell me about a time you said no to a feature request.</strong> — Reported · Make It Matter</summary>

Say no **with data** (cost vs impact, risk), **offer an alternative** (a smaller version or a later date), and **keep the relationship**. End with what happened: the alternative met the need, or the data later confirmed the call.

</details>

<details>
<summary><strong>B9 · Your most ambitious project? A time you pushed for a bigger solution?</strong> — Likely · Think Big, Go Far</summary>

Show you **redefined the scope** to solve the underlying problem, for example turning a one-off script into a reusable platform or agent that other teams adopted. Include the risk you took, how you de-risked it (prototype, milestones), and the reach (teams, users, hours saved).

</details>

<details>
<summary><strong>B10 · Tell me about working with someone with a very different view or background.</strong> — Likely · Embrace the Power of Differences</summary>

Show that you **sought out** the different view (e.g. support engineers or designers), changed your approach because of it, and got a **better result**. This value is about valuing different perspectives in decisions.

</details>

<details>
<summary><strong>B11 · Tell me about a time you felt overwhelmed or hit a setback.</strong> — Reported</summary>

Prioritize (what must happen vs what can wait), communicate early to stakeholders, ask for help or cut scope, and protect quality. Show calm process, not just heroics, and say what you now do to prevent overload.

</details>

<details>
<summary><strong>B12 · How would you design for a complex technical product when you have little or no domain knowledge?</strong> — Reported · Glassdoor Gurgaon</summary>

1. **Learn fast:** talk to users and experts, then read docs, code and incident history.
2. **Map the domain:** glossary, main entities, data flow; write a one-page “how it works”.
3. **List assumptions** explicitly and test the riskiest one first.
4. **Build a thin prototype** early to get real feedback.
5. **Pair with a domain expert** and review decisions with them.

Add: “This is the job on this team. Every experiment lands in another team’s domain.”

</details>

## 34.6 Real-world problem round (60 min)

A practical, job-like task. In Gurugram 2026 it was a **migration lag verifier**. Other reports mention **debugging** and **code-review** rounds.

<details>
<summary><strong>P1 · Migration lag verifier: alert if data hasn’t reached the target within k seconds</strong> — Reported · Gurugram 2026</summary>

**Problem (as reported)**

You are migrating data from a DB to another datastore. The max acceptable lag is **k seconds**. One event fires when data leaves the primary, and another when it reaches the secondary. If data hasn’t appeared in the secondary after k seconds, a verifier process must raise an alert.

**Ask first**

- Unique id per change event (not per document: one doc can change many times)?
- Can events be duplicated or arrive out of order?
- Whose clock? How often do we check? After an alert, re-alert or auto-resolve?

**Idea**

**pending map** (id → source time) plus a **min-heap of deadlines**. A timer pops expired deadlines. Entries that already arrived are skipped (lazy deletion). Handle out-of-order, duplicate and late arrivals.

```java
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.PriorityQueue;
import java.util.Set;

/** Raises an alert when an event seen on the source DB has not reached the target store within k ms.
 *  Feed onSource/onTarget as events stream in; call tick(now) from a timer (e.g. every second). */
public class LagVerifier {
    public interface AlertSink {
        void alert(String eventId, long sourceTimeMs, long nowMs);
    }

    private record Deadline(long atMs, String eventId) { }

    private final long kMs;
    private final AlertSink sink;
    private final Map<String, Long> pending = new HashMap<>();          // eventId -> source time
    private final PriorityQueue<Deadline> deadlines =
            new PriorityQueue<>(Comparator.comparingLong(Deadline::atMs)); // earliest deadline first
    private final Set<String> arrivedEarly = new HashSet<>();           // target seen before source
    private final Set<String> alerted = new HashSet<>();                // waiting for a late arrival
    private final Object lock = new Object();                           // source, target, timer = 3 threads

    public LagVerifier(long kMs, AlertSink sink) {
        this.kMs = kMs;
        this.sink = sink;
    }

    public void onSource(String eventId, long timeMs) {
        synchronized (lock) {
            if (arrivedEarly.remove(eventId)) return;       // out-of-order delivery: already done
            if (pending.containsKey(eventId)) return;       // duplicate delivery: keep the first time
            pending.put(eventId, timeMs);
            deadlines.offer(new Deadline(timeMs + kMs, eventId));
        }
    }

    public void onTarget(String eventId, long timeMs) {
        synchronized (lock) {
            if (pending.remove(eventId) != null) return;    // on time; its heap entry is now stale
            if (alerted.remove(eventId)) return;            // late arrival: auto-resolve the alert
            arrivedEarly.add(eventId);
        }
    }

    public List<String> tick(long nowMs) {
        List<String> fired = new ArrayList<>();
        List<Long> sourceTimes = new ArrayList<>();
        synchronized (lock) {
            while (!deadlines.isEmpty() && deadlines.peek().atMs() < nowMs) {   // lag > k
                Deadline d = deadlines.poll();
                Long sourceTime = pending.remove(d.eventId());
                if (sourceTime == null) continue;           // already arrived (lazy deletion)
                alerted.add(d.eventId());
                fired.add(d.eventId());
                sourceTimes.add(sourceTime);
            }
        }
        for (int i = 0; i < fired.size(); i++) {             // never call out while holding the lock
            sink.alert(fired.get(i), sourceTimes.get(i), nowMs);
        }
        return fired;
    }
}
```

**Complexity**

onSource O(log n), onTarget O(1), tick O(m log n) for m expired items.

**Follow-ups**

- **Clock skew:** source and target clocks differ, so measure with one clock (the verifier’s receive time) or use watermarks.
- **Memory:** `arrivedEarly` grows if source events are lost, so give it a TTL.
- **Scale (millions/sec):** partition by event id (Kafka partitions); each verifier owns its keys and keeps state in RocksDB (Flink-style).
- **Many timers:** a hierarchical timing wheel (O(1)), as Kafka uses, instead of a heap.
- **Alert storms:** aggregate, e.g. “N events delayed &gt; k in the last minute”, with examples.
- **Restarts:** checkpoint the pending state, or rebuild it from stream offsets.

</details>

<details>
<summary><strong>P2 · The application is slow. Walk me through how you find the root cause.</strong> — Reported</summary>

1. **Clarify scope:** all users or some? One endpoint or all? Since when? p50 or p99?
2. **What changed?** Deploys, config/flags, traffic, data size, dependencies.
3. **Golden signals:** latency, traffic, errors, saturation.
4. **Localize with traces:** which span grew: client, network, app, DB, or an external API?
5. **App:** CPU, GC pauses, exhausted thread or connection pools, lock contention (thread dumps), memory.
6. **DB (MongoDB):** profiler and slow-query log; `explain("executionStats")`: COLLSCAN? docsExamined ≫ nReturned? in-memory SORT? Also Atlas Performance Advisor, `currentOp` for long operations, replication lag, working set bigger than RAM.
7. **Fix → verify with the same metric → prevent** (alert, load test, regression test).

Keep saying: *“My hypothesis is X; I’d confirm it by looking at Y.”* The interviewer wants the reasoning path, not one answer.

</details>

<details>
<summary><strong>P3 · Code review: find and rank the problems in this Java code</strong> — Reported · SE3 code-review round</summary>

Reported format: intentionally flawed Java; rank the issues and propose alternatives. Practice on this:

```java
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.HashMap;
import java.util.Map;

// "Review this code. List the problems, most serious first, and suggest fixes."
public class FlawedUserService {
    private static Map<Integer, User> cache = new HashMap<>();
    private Connection conn;

    public User getUser(String id) {
        if (cache.containsKey(id)) {
            return cache.get(id);
        }
        User user = null;
        try {
            Statement st = conn.createStatement();
            ResultSet rs = st.executeQuery("SELECT * FROM users WHERE id = " + id);
            if (rs.next()) {
                user = new User(rs.getString("name"), rs.getString("email"));
            }
        } catch (Exception e) {
        }
        cache.put(Integer.parseInt(id), user);
        return user;
    }
}
```

**Ranked answer**

| # | Severity | Issue → fix |
|---|---|---|
| 1 | Blocking | **SQL injection**: string concatenation → `PreparedStatement` with `?` |
| 2 | Blocking | **Cache never hits**: `containsKey(String)` on a `Map<Integer,…>` is always false. Every call hits the DB and the map keeps growing. |
| 3 | Blocking | **Swallowed exception**: an empty catch hides outages, then **caches null**, so users look “not found” after one DB blip. Throw or wrap; don’t cache failures. |
| 4 | Important | **Resource leak**: Statement/ResultSet never closed, so the connection pool runs out → try-with-resources |
| 5 | Important | **Not thread-safe**: a static `HashMap` mutated by request threads, a check-then-act race, and one shared `Connection` → `ConcurrentHashMap` + `DataSource` pool |
| 6 | Important | **Unbounded cache, no invalidation**: memory leak and stale data → bounded cache with TTL (Caffeine), invalidate on update |
| 7 | Minor | `Integer.parseInt` outside the try → NumberFormatException; validate at the edge and take an `int` |
| 8 | nit | `SELECT *`; non-final mutable static field |

**Fixed version**

```java
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import javax.sql.DataSource;

public class UserService {
    private final DataSource db;                                         // pooled connections
    private final Map<Integer, User> cache = new ConcurrentHashMap<>();  // real code: bounded + TTL (e.g. Caffeine)

    public UserService(DataSource db) {
        this.db = db;
    }

    public Optional<User> getUser(int id) {                              // typed id: parsed/validated at the edge
        User cached = cache.get(id);
        if (cached != null) return Optional.of(cached);

        String sql = "SELECT name, email FROM users WHERE id = ?";       // bind params: no SQL injection
        try (Connection c = db.getConnection();                          // try-with-resources: nothing leaks
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) return Optional.empty();                 // don't cache "not found" forever
                User user = new User(rs.getString("name"), rs.getString("email"));
                cache.putIfAbsent(id, user);
                return Optional.of(user);
            }
        } catch (SQLException e) {
            throw new UserLookupException("failed to load user " + id, e);   // surface it, don't swallow it
        }
    }

    public void onUserUpdated(int id) {
        cache.remove(id);                                                // invalidate on write
    }
}
```

**Tip:** rank by impact (security → correctness → reliability → performance → style), give a fix for each, and ask about context (traffic, consistency needs) before over-engineering.

</details>

<details>
<summary><strong>P4 · Build a quick AI prototype: “Q&amp;A over these docs” in 60 minutes</strong> — Likely · AI team</summary>

**Plan**

| Min | Step |
|---|---|
| 0–5 | Clarify users, docs, success metric, “what if the answer isn’t there?” |
| 5–15 | Ingest and chunk (word windows with overlap) |
| 15–30 | Embed, index, top-k retrieval |
| 30–40 | Prompt with citations and an **“I don’t know”** path when retrieval is weak |
| 40–50 | **Eval:** recall@k on 10 real questions |
| 50–60 | Next steps: real embeddings, Atlas Vector Search, hybrid search, reranker, LLM-judge |

```java
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.PriorityQueue;
import java.util.Set;

/** A 60-minute RAG prototype: chunk -> embed -> index -> retrieve -> prompt -> answer, plus a tiny eval.
 *  Embedder and Llm are interfaces so a real model / MongoDB Atlas Vector Search can be swapped in. */
public class MiniRag {
    public interface Embedder { double[] embed(String text); }
    public interface Llm { String complete(String prompt); }

    public record Chunk(String source, String text, double[] vector) { }
    public record Hit(Chunk chunk, double score) { }

    /** Word windows with overlap, so a fact cut at a boundary still appears whole in one chunk. */
    static List<String> chunk(String text, int maxWords, int overlap) {
        if (overlap >= maxWords) throw new IllegalArgumentException("overlap must be < maxWords");
        List<String> out = new ArrayList<>();
        if (text.isBlank()) return out;
        String[] w = text.trim().split("\\s+");
        for (int start = 0; ; start += maxWords - overlap) {
            out.add(String.join(" ", Arrays.copyOfRange(w, start, Math.min(w.length, start + maxWords))));
            if (start + maxWords >= w.length) break;
        }
        return out;
    }

    /** Stand-in embedder (hashing bag-of-words). Real systems call an embedding model instead. */
    static final class HashingEmbedder implements Embedder {
        private static final Set<String> STOP = Set.of("the", "a", "an", "is", "are", "to", "of", "in",
                "on", "and", "or", "for", "what", "when", "how", "do", "does", "within", "every", "through");
        private final int dims;
        HashingEmbedder(int dims) { this.dims = dims; }

        public double[] embed(String text) {
            double[] v = new double[dims];
            for (String tok : text.toLowerCase().split("[^a-z0-9]+")) {
                if (tok.isEmpty() || STOP.contains(tok)) continue;
                v[Math.floorMod(tok.hashCode(), dims)] += 1;
            }
            double norm = Math.sqrt(Arrays.stream(v).map(x -> x * x).sum());
            if (norm > 0) for (int i = 0; i < dims; i++) v[i] /= norm;   // unit length: dot = cosine
            return v;
        }
    }

    private final Embedder embedder;
    private final Llm llm;
    private final List<Chunk> index = new ArrayList<>();

    MiniRag(Embedder embedder, Llm llm) {
        this.embedder = embedder;
        this.llm = llm;
    }

    void addDocument(String source, String text) {
        for (String piece : chunk(text, 40, 10)) index.add(new Chunk(source, piece, embedder.embed(piece)));
    }

    /** Brute-force cosine top-k: fine up to ~100k chunks. Beyond that use ANN (HNSW), e.g. $vectorSearch. */
    List<Hit> search(String query, int k) {
        double[] q = embedder.embed(query);
        PriorityQueue<Hit> top = new PriorityQueue<>(Comparator.comparingDouble(Hit::score));  // min-heap
        for (Chunk c : index) {
            double score = 0;
            for (int i = 0; i < q.length; i++) score += q[i] * c.vector()[i];
            top.offer(new Hit(c, score));
            if (top.size() > k) top.poll();
        }
        List<Hit> out = new ArrayList<>(top);
        out.sort(Comparator.comparingDouble(Hit::score).reversed());
        return out;
    }

    static String buildPrompt(String question, List<Hit> hits) {
        StringBuilder sb = new StringBuilder()
                .append("Answer ONLY from the context. Cite sources like [1]. ")
                .append("If the answer is not in the context, say \"I don't know\".\n\nContext:\n");
        for (int i = 0; i < hits.size(); i++) {
            Chunk c = hits.get(i).chunk();
            sb.append('[').append(i + 1).append("] (").append(c.source()).append(") ").append(c.text()).append('\n');
        }
        return sb.append("\nQuestion: ").append(question).toString();
    }

    String answer(String question, int k, double minScore) {
        List<Hit> hits = search(question, k);
        if (hits.isEmpty() || hits.get(0).score() < minScore) {
            return "I don't know";              // weak retrieval: skip the LLM (saves cost, avoids guessing)
        }
        return llm.complete(buildPrompt(question, hits));
    }

    /** Eval retrieval separately from generation: did the right source appear in the top k? */
    double recallAtK(List<String[]> questionAndExpectedSource, int k) {
        int found = 0;
        for (String[] qa : questionAndExpectedSource) {
            for (Hit h : search(qa[0], k)) {
                if (h.chunk().source().equals(qa[1])) { found++; break; }
            }
        }
        return (double) found / questionAndExpectedSource.size();
    }
}
```

**Production swap-in: MongoDB Atlas Vector Search**

Vector index definition (the filter field enables pre-filtering, e.g. by team or ACL):

```json
{
  "fields": [
    { "type": "vector", "path": "embedding", "numDimensions": 1536, "similarity": "cosine" },
    { "type": "filter", "path": "team" }
  ]
}
```

Query (<code>&#36;vectorSearch</code> must be the first stage):

```javascript
db.chunks.aggregate([
  { $vectorSearch: {
      index: "chunks_vector_index",
      path: "embedding",
      queryVector: queryEmbedding,      // from the same embedding model
      numCandidates: 200,               // search breadth (~10-20x limit)
      limit: 5,
      filter: { team: "engineering" }   // pre-filter: permissions, tenant
  } },
  { $project: { text: 1, source: 1, score: { $meta: "vectorSearchScore" } } }
])
```

</details>

## 34.7 System design round (60 min)

> [!TIP]
>
> **Use the same 7 steps every time:** (1) requirements, functional and non-functional *with numbers* · (2) estimates · (3) API and data model · (4) high-level diagram · (5) deep-dive the 2 hardest parts · (6) failures and trade-offs · (7) rollout and evolution. Draw early, and talk while you draw. Every design problem in 7B has an HLD whiteboard; click it to enlarge. Start with the toolkit in 7A.

### 34.7A · System design toolkit (use these in every design)

<details>
<summary><strong>K1 · Back-of-the-envelope estimation in 2 minutes</strong> — Core</summary>

**In short:** rough numbers decide the design: one box or many, cache or not, and what it costs. Round hard and say your assumptions out loud.

| Rule of thumb | Use |
|---|---|
| 1 day ≈ 86,400 s ≈ 10<sup>5</sup> s | 1M requests/day ≈ 12 per second |
| Peak ≈ 2–5× the average | Size for the peak, not the average |
| Storage = items/day × size × retention × copies | Replica sets keep 3 copies |
| Cache ≈ 20% of the hot data | The 80/20 rule |
| Vectors = count × dimensions × 4 bytes | Binary quantization cuts it \~32× (V4) |

**Worked example: an internal AI assistant (S5)**

- **Traffic:** 10,000 employees × 10 questions/day = 100k/day ≈ 1.2 QPS average, \~6 QPS peak. Small: the LLM is the bottleneck, not QPS.
- **Tokens:** 3,000 in + 500 out per question → \~350M tokens/day. At example prices of 1 USD per 1M input and 4 USD per 1M output tokens, that’s ≈ 300 USD + 200 USD = **\~500 USD/day**, so caching and smaller models matter.
- **Storage:** 100k chats × 5 KB = 500 MB/day ≈ 180 GB/year (× 3 copies). Easy for MongoDB.
- **Vectors:** 1M chunks × 1,024 dims × 4 B ≈ 4 GB → fits in RAM; \~128 MB with binary quantization.
- **Latency budget (p95 3 s):** retrieval \~150 ms + LLM first token \~1 s, then stream.

More reference numbers in F12.

</details>

<details>
<summary><strong>K2 · Consistent hashing: what, why, and code</strong> — Core · classic</summary>

**In short:** with `hash(key) % N`, adding one server moves almost every key. Consistent hashing puts servers and keys on a **ring**; a key goes to the next server clockwise, so adding or removing a server moves only **\~1/N** of the keys. **Virtual nodes** (many points per server) keep the load even.

![Consistent hashing: servers and keys on one ring](diagrams/mongo34_wb21_consistent_hashing_servers_keys_one.svg)

*New server D takes over only the keys between B#1 and D; every other key stays put.*

```java
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;
import java.util.NavigableMap;
import java.util.concurrent.ConcurrentSkipListMap;

/** Consistent hashing ring with virtual nodes. Adding or removing a node moves only ~1/N of the keys. */
public class ConsistentHashRing {
    private final NavigableMap<Long, String> ring = new ConcurrentSkipListMap<>();   // safe for concurrent reads
    private final int virtualNodes;

    public ConsistentHashRing(int virtualNodes) {
        if (virtualNodes < 1) throw new IllegalArgumentException("virtualNodes must be >= 1");
        this.virtualNodes = virtualNodes;
    }

    /** Each server is placed at many points ("virtual nodes") so keys spread evenly. */
    public void addNode(String node) {
        for (int i = 0; i < virtualNodes; i++) ring.put(hash(node + "#" + i), node);
    }

    public void removeNode(String node) {
        for (int i = 0; i < virtualNodes; i++) ring.remove(hash(node + "#" + i), node);
    }

    /** Walk clockwise from the key's position to the first node; wrap around at the end. */
    public String nodeFor(String key) {
        if (ring.isEmpty()) throw new IllegalStateException("no nodes in the ring");
        Map.Entry<Long, String> e = ring.ceilingEntry(hash(key));
        return (e != null ? e : ring.firstEntry()).getValue();
    }

    static long hash(String s) {
        try {
            byte[] d = MessageDigest.getInstance("MD5").digest(s.getBytes(StandardCharsets.UTF_8));
            long h = 0;
            for (int i = 0; i < 8; i++) h = (h << 8) | (d[i] & 0xff);
            return h;
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
```

Tested: 30,000 keys over 3 servers land within 25% of an even split; adding a 4th server moves \~25% of keys, all of them to the new server; removing it restores the original mapping exactly.

**Where it’s used:** Cassandra and DynamoDB partitioning, cache clusters, load balancers. **MongoDB is different:** it splits data into **ranged or hashed chunks**, and a **balancer** moves chunks between shards (M4, S8).

</details>

<details>
<summary><strong>K3 · Idempotency and “exactly-once”</strong> — Core</summary>

**In short:** networks retry, so any request or message can arrive twice. Make the second copy harmless. True exactly-once *delivery* doesn’t exist over a network; you get **at-least-once delivery + idempotent processing = effectively once**.

| Technique | How |
|---|---|
| **Idempotency key** | The client sends a unique key; the server saves key → result and returns the saved result on a retry. In MongoDB: insert `{_id: key, status: "pending"}` and the business write in **one transaction**, then store the result. A duplicate key means another attempt owns it: return the saved result, or wait if it’s still pending. For external calls (payments), pass the same key to the provider |
| **Idempotent operations** | <code>&#36;set</code> instead of <code>&#36;inc</code>; upsert by a business key |
| **Version check** | <code>updateOne({_id, version: 3}, {&#36;set: …, &#36;inc: {version: 1}})</code>: a stale retry matches nothing |
| **Consumer dedupe** | Store processed event IDs with a TTL index |
| **Outbox pattern** | Write the change and an “outbox” event in one transaction; a relay (or a change stream) publishes it. No lost or phantom events |
| **Retryable writes** | MongoDB drivers safely retry a write once after a network error (on by default) |

**Example:** a refund API times out and the client retries with the same key → it gets the first result back, so there’s no double refund. Agent tool calls need the same care, because agent loops retry (AG6).

</details>

<details>
<summary><strong>K4 · Caching strategies and their traps</strong> — Core</summary>

| Strategy | How it works | Good for |
|---|---|---|
| **Cache-aside** (default) | App checks the cache → on a miss reads the DB → stores it in the cache | Most read-heavy apps |
| **Read-through** | The cache library loads from the DB itself | Simpler app code |
| **Write-through** | Write to cache and DB together | Data read right after it’s written |
| **Write-behind** | Write to the cache; flush to the DB later | Very high write rates (risk: data loss) |

- **Eviction:** LRU (C4), LFU, or TTL.
- **Invalidation:** TTL + delete on write, or evict on change with change streams (M9).
- **Stampede** (many misses at once): let one request load while the others wait; add jitter to TTLs.
- **Hot keys:** a small in-process cache in front of Redis; replicate the key.
- **Layers:** browser/CDN → gateway → app memory → Redis → the DB’s own cache. For LLMs: exact + semantic caches (L7).

</details>

<details>
<summary><strong>K5 · Containers and Kubernetes: the basics</strong> — Likely · named in JD</summary>

**In short:** a **container** packs your app and everything it needs into one image, so it runs the same everywhere. **Kubernetes** runs many containers for you: it restarts them, scales them and rolls out new versions.

![Containers and Kubernetes in one picture](diagrams/mongo34_wb22_containers_kubernetes_one_picture.svg)

*Ingress → Service → a Deployment’s pods, with config, autoscaling and health probes around them.*

| Object | Simple meaning |
|---|---|
| **Pod** | One or more containers that run together; the smallest unit |
| **Deployment** | “Keep 3 copies of this pod running”; does rolling updates and rollbacks (`kubectl rollout undo`) |
| **Service** | A stable name and IP that load-balances across the pods |
| **Ingress** | HTTP routing and TLS from outside into Services |
| **ConfigMap / Secret** | Config and passwords kept out of the image |
| **HPA** | Autoscale pods on CPU, memory or a custom metric (e.g. queue length) |
| **Probes** | Liveness: restart a stuck pod. Readiness: no traffic until it’s ready |
| **Requests / limits** | How much CPU and memory a pod is promised, and its maximum |

**Good images:** small base image, multi-stage build, run as non-root, pinned versions. **For AI services:** GPU node pools for model servers, autoscale on queue length, and long timeouts for streaming responses.

</details>

<details>
<summary><strong>K6 · Design a CI/CD pipeline (with an AI eval gate)</strong> — Likely · named in JD</summary>

**In short:** **CI** checks every change automatically (build, test, scan, evals). **CD** ships the *same* tested image to staging, then a small slice of production, then everyone, with automatic rollback.

![A CI/CD pipeline (with an AI eval gate)](diagrams/mongo34_wb23_ci_cd_pipeline_ai_eval.svg)

*Build once, test, eval, merge; then staging → canary → full rollout → monitor, rolling back on bad metrics.*

| Release strategy | How | Trade-off |
|---|---|---|
| **Rolling** | Replace pods a few at a time | Simple; old and new versions run together for a while |
| **Blue/green** | Start the full new version, then switch traffic | Instant rollback; double the resources briefly |
| **Canary** | Send 1–5% of traffic to the new version and watch metrics | Safest; needs good metrics |
| **Feature flags** | Ship code switched off; turn it on per user or team | Separates deploy from release |

```yaml
# .github/workflows/ci.yml (simplified)
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: '21' }
      - run: ./mvnw -B verify            # build + unit tests
      - run: ./mvnw -B -Pevals verify    # AI eval suite: fails if the score drops below the baseline
```

**Also:** use short-lived cloud credentials (OIDC), not stored keys; keep database migrations backward compatible (M16); for AI apps, pin model and prompt versions and run evals like tests (L9).

</details>

### 34.7B · Design problems

<details>
<summary><strong>S1 · Design a DB migration platform: relational → MongoDB for a Ticketmaster-like company</strong> — Reported · Gurugram 2026</summary>

**Requirements**

- Migrate schema and data for many apps; **near-zero downtime**; **provable correctness**; rollback; observability; self-serve.
- Example scale: 5 TB, 2B rows, 20k writes/s at peak (on-sales).

![HLD S1: relational → MongoDB migration platform (zero downtime)](diagrams/mongo34_wb24_hld_s1_relational_mongodb_migration.svg)

*Snapshot and CDC with no gap, idempotent loading, a verifier that compares both sides, then a flag-controlled cutover with reverse CDC for rollback.*

**Key decisions**

1. **Model by access pattern.** Embed owned 1:few data (event → venue snapshot, price tiers). Reference unbounded or shared data (tickets and orders in their own collections, indexed by `eventId`). Copy hot fields where useful (extended reference). Stay well under the 16 MB document limit.
2. **Snapshot + CDC with no gap:** record the log position **before** the snapshot, bulk-load, then replay CDC from that position. Use the source PK as `_id` with **idempotent upserts**, so replays are safe.
3. **Ordering:** partition Kafka by primary key, so changes to one row stay in order.
4. **Verify:** counts, chunk checksums, sampled deep diffs, and the lag monitor.
5. **Cutover:** compare shadow reads → switch writes per service behind a flag → keep reverse sync during the rollback window.
6. **No overselling:** a single-document atomic update, e.g. <code>updateOne({_id, available: {&#36;gte: n}}, {&#36;inc: {available: -n}})</code>, with `w:"majority"`. Use multi-document transactions only where truly needed.

**Failures and trade-offs**

- Worker crash: resume from the Kafka offset (idempotent writes).
- Schema changes mid-migration: versioned mapping specs and a schema registry.
- Hot on-sale event: backpressure, and don’t shard on `eventId` alone (see S8).

> [!TIP]
>
> Bonus: MongoDB already ships **Relational Migrator** for this. Mentioning it shows you’ve done your homework.

</details>

<details>
<summary><strong>S2 · Design a distributed logging system</strong> — Reported</summary>

**Requirements and estimate**

10k services; search the last 14 days in seconds; keep 1 year cheaply; alert on patterns; multi-tenant. Estimate: 1M lines/s × 500 B ≈ 500 MB/s ≈ **43 TB/day raw** (5–10× smaller compressed).

![HLD S2: distributed logging (ingest ~500 MB/s, search 14 days, keep 1 year)](diagrams/mongo34_wb25_hld_s2_distributed_logging_ingest.svg)

*Agents → Kafka → stream processors → a hot search index (14 days) and cheap columnar cold storage (1 year). Alerts run on the stream itself.*

**Key decisions**

- **Kafka as a shock absorber:** decouples producers from indexing and allows replay.
- **Agents buffer to disk** to survive network or Kafka outages; under pressure, drop debug logs first.
- **Daily time partitions:** retention means dropping a whole partition (cheap, no deletes).
- **Index only key fields** (service, level, traceId, time) plus full text where it’s worth it. Cost is the main trade-off.
- **Cold tier:** columnar files, queried with Trino or Spark when needed.
- **Per-tenant quotas** stop one noisy service from hurting everyone.

</details>

<details>
<summary><strong>S3 · Design a disaster recovery (DR) system</strong> — Reported</summary>

Start by defining **RPO** (how much data loss is OK) and **RTO** (how much downtime is OK) for each tier of service.

![HLD S3: disaster recovery: 3 regions, RPO ≈ 0, RTO in minutes](diagrams/mongo34_wb26_hld_s3_disaster_recovery_3.svg)

*A replica set spread 2 + 2 + 1 across three regions with majority writes, stateless apps behind a global load balancer, plus immutable point-in-time backups.*

| Strategy | RPO | RTO | Cost |
|---|---|---|---|
| Backup & restore | Hours | Hours | Lowest |
| Pilot light | Minutes | Tens of minutes to hours | Low |
| Warm standby | Seconds–minutes | Minutes | High |
| Active-active multi-region | ≈ 0 | Seconds–minutes | Highest |

**MongoDB specifics**

- **Replica set across 3 regions** (e.g. 2+2+1 members) with `w:"majority"`. If a region fails, a new primary is elected in seconds and acknowledged writes are safe (RPO ≈ 0).
- **Replication copies mistakes too**: a bad delete replicates instantly. You also need **continuous backup with point-in-time restore**.
- **Immutable backups in a separate account** protect against ransomware and account compromise.

**The rest**

- Stateless apps in ≥ 2 regions, a global load balancer with health checks, infrastructure as code.
- **Practice:** regular DR drills and restore tests. An untested backup isn’t a backup. Measure your real RTO.

</details>

<details>
<summary><strong>S4 · Design a distributed rate limiter</strong> — Reported</summary>

**Requirements:** per-API-key limits across 50 gateway nodes, &lt; 1 ms added latency, accurate within about 5%.

![HLD S4: distributed rate limiter (per API key, 50 gateway nodes)](diagrams/mongo34_wb27_hld_s4_distributed_rate_limiter.svg)

*Gateways pre-limit hot keys locally, then take a token from one atomic bucket per key in Redis. Blocked requests get 429 + Retry-After.*

| Option | Good | Bad |
|---|---|---|
| Central Redis + atomic Lua token bucket | Accurate, simple | A network hop on every request; Redis must be highly available |
| Local buckets (C11) with a share of the global quota | Fastest, no hop | Approximate; shares need rebalancing |
| Hybrid: local buckets + async sync | Fast and close to exact | More moving parts |

- **Key** = tenant + route. Respond with **429 + Retry-After**.
- **Limiter down?** Fail-open for availability; fail-closed for abuse-sensitive routes (login, payments).
- **Hot keys:** pre-limit locally. **Multi-region:** per-region quotas.

</details>

<details>
<summary><strong>S5 · Design an internal AI assistant (RAG) over company knowledge</strong> — Likely · core to this team</summary>

**Requirements**

Engineers ask questions over wikis, docs, tickets and code. Answers **cite sources**, **respect permissions**, stay fresh within \~1 hour, p95 &lt; 5 s, and quality is measurable.

![HLD S5: internal AI assistant (RAG) with citations + permissions](diagrams/mongo34_wb28_hld_s5_internal_ai_assistant.svg)

*Async ingest keeps Atlas fresh. The online path retrieves with an ACL pre-filter, reranks, answers with citations, guards the output, and logs everything for evals.*

**Key decisions**

- **One store:** text, embedding and metadata in one MongoDB document, so vectors, filters and operational data live together and there’s no sync to a separate vector DB.
- **Chunk by structure** (headings, functions), \~300–800 tokens with overlap. Prepend the title and section path to each chunk.
- **Hybrid retrieval:** vectors catch meaning; keywords catch exact error codes and IDs. Merge with Reciprocal Rank Fusion, then rerank.
- **Security:** the ACL filter goes **inside** the vector query (pre-filter), never after generation. Treat retrieved text as untrusted (prompt injection).
- **Freshness:** re-embed only changed docs; delete removed ones.
- **Quality:** a golden set of 100+ real questions; measure retrieval (recall@k) and answers (faithfulness, correctness) separately; calibrate the LLM-judge against human labels; track online thumbs and the “no answer” rate.
- **Cost and latency:** cache embeddings and frequent answers; use a small model for query rewriting; stream tokens.

</details>

<details>
<summary><strong>S6 · Design an AI experimentation &amp; evaluation platform for the team</strong> — Likely · core to this team</summary>

**Goal:** any experiment (new model, prompt or agent) is quick to run, comparable to earlier ones, and documented.

![HLD S6: AI experimentation + evaluation platform](diagrams/mongo34_wb29_hld_s6_ai_experimentation_evaluation.svg)

*Versioned datasets and config-as-code → parallel runner → scorers → results in MongoDB → dashboard plus a CI gate. Every run ends in a decision.*

- **Fixed, versioned eval sets** make results comparable over time.
- **Track cost and latency** next to quality. A 2% gain at 5× the cost is usually a no.
- **Regression gate in CI** for prompt and model changes.
- **Standard write-up:** hypothesis → setup → results → decision → next owner.

</details>

<details>
<summary><strong>S7 · Design an agent that automates an internal workflow safely (e.g. on-call triage)</strong> — Likely · core to this team</summary>

![HLD S7: agent that automates on-call triage (safely)](diagrams/mongo34_wb30_hld_s7_agent_that_automates.svg)

*A bounded plan → act → observe loop. Reads are free, writes need human approval, state is checkpointed, and every step is traced.*

- **Use a workflow where steps are predictable**, and an agent only where they vary.
- **Tools:** few, narrow, typed schemas, clear errors; read-only by default; least-privilege credentials; audit log.
- **Checkpoints** enable resume, human-in-the-loop approval and debugging (MongoDB can store LangGraph checkpoints).
- **Failure modes:** loops → step limit; bad arguments → schema validation and a retry with the error; made-up facts → require evidence links from tool outputs; **prompt injection via logs** → treat tool output as data, never as instructions.

</details>

<details>
<summary><strong>S8 · Choose a shard key for tickets/orders and avoid hot shards</strong> — Reported · senior</summary>

![HLD S8: sharded cluster + choosing a shard key (avoid hot shards)](diagrams/mongo34_wb31_hld_s8_sharded_cluster_choosing.svg)

*mongos routes by shard key using config-server metadata. A monotonic key sends every insert to one shard; a hashed or compound key spreads the load.*

- **A good shard key** has high cardinality, spreads writes evenly, and matches common queries (targeted, not scatter-gather).
- **Bad:** a monotonically increasing key (timestamp, ObjectId). Every insert goes to the last range, making one **hot shard**.
- **Options:** a **hashed** key (even writes, but range queries hit every shard); a **compound** key like `{customerId: 1, createdAt: 1}` (targeted per customer, still ordered).
- **One hot event on-sale:** add a bucket suffix (`eventId + bucket 0..N`) to spread writes, and merge on read.
- **Low cardinality** creates jumbo chunks that can’t split. Live resharding exists (5.0+) but is expensive, so choose carefully up front.

</details>

## 34.8 MongoDB knowledge (comes up in design and HM rounds)

One candidate who got an offer had a no-coding technical round entirely on SQL vs NoSQL, replication, sharding, CAP, consistency and indexing.

<details>
<summary><strong>M1 · SQL vs NoSQL: when would you pick MongoDB?</strong> — Reported</summary>

- **MongoDB fits** when data is naturally nested or JSON, the schema changes often, you need horizontal scale and high write throughput, or you want operational data, search and vectors in one platform.
- **Relational fits** when you need heavy ad-hoc joins across many entities, strict cross-table constraints, or existing SQL-centric analytics.
- MongoDB **has ACID multi-document transactions and joins** (<code>&#36;lookup</code>). The real difference is the modeling rule: **“data that is accessed together is stored together.”**

</details>

<details>
<summary><strong>M2 · Embedding vs referencing: how do you decide?</strong> — Reported</summary>

| Embed when… | Reference when… |
|---|---|
| 1:1 or 1:few; always read together; owned by the parent; bounded growth | 1:many unbounded (comments, orders); many:many; shared and updated independently; would push the doc toward 16 MB |

**Patterns:** *subset* (embed the latest 10 reviews), *extended reference* (copy name and price into the order), *bucket* (group readings per hour), *computed* (precompute totals). Design for your queries, not your entities. All patterns and anti-patterns: **M12**.

</details>

<details>
<summary><strong>M3 · Replica sets, elections, write concern and read concern</strong> — Reported</summary>

- **Replica set** = 1 primary + secondaries that copy the primary’s **oplog**.
- **Election** (Raft-like) when the primary is unreachable: `electionTimeoutMillis` defaults to 10 s, and a new primary is typically chosen within about 12 s. It needs a majority of voters, so use 3 or 5 members spread across failure zones.
- **Write concern:** `w:1` (primary only; can roll back after failover) · `w:"majority"` (survives failover; **the default since 5.0**) · `j:true` (journaled).
- **Read concern:** `local` · `majority` (won’t be rolled back) · `linearizable` · `snapshot` (transactions).
- **Read preference:** `primary` (default) vs `secondary`/`nearest`, which are faster or closer but may be stale.

</details>

<details>
<summary><strong>M4 · How does sharding work?</strong> — Reported</summary>

- Each **shard** is a replica set holding **chunks** (ranges of the shard key).
- **mongos** routers use metadata from the **config servers** to route queries.
- Queries with the shard key are **targeted** (one shard). Queries without it are **scatter-gather** (all shards, slower).
- The **balancer** moves ranges to keep data even. Choosing keys: see S8.

</details>

<details>
<summary><strong>M5 · CAP and consistency in MongoDB</strong> — Reported</summary>

- In a network partition, the minority side has no primary and can’t take writes. By default MongoDB favors **consistency** (CP-leaning).
- `w:"majority"` + `readConcern:"majority"` give durable reads that won’t roll back. **Causally consistent sessions** give read-your-writes even on secondaries.
- Reading from secondaries trades consistency for latency and availability. It is **tunable per operation**, which is a good point to make.

</details>

<details>
<summary><strong>M6 · Indexes, the ESR rule and reading explain()</strong> — Reported</summary>

- **ESR rule** for compound indexes: **E**quality fields first, then **S**ort, then **R**ange.
- **Covered query:** every field needed is in the index, so no document fetch.
- **`explain("executionStats")`:** COLLSCAN on a big collection is bad; IXSCAN is good; a SORT stage means an in-memory sort (missing index). Compare `totalKeysExamined` and `totalDocsExamined` with `nReturned` (ideal ≈ 1:1).
- **Cost:** every index slows writes and uses RAM. Find unused ones with <code>&#36;indexStats</code>; get suggestions from Atlas Performance Advisor.

```javascript
// Query: status = "PAID", amount > 100, newest first
db.orders.find({ status: "PAID", amount: { $gt: 100 } }).sort({ createdAt: -1 })

// ESR index: Equality (status), Sort (createdAt), Range (amount)
db.orders.createIndex({ status: 1, createdAt: -1, amount: 1 })
```

</details>

<details>
<summary><strong>M7 · The aggregation pipeline: how do you use and optimize it?</strong> — Reported</summary>

A pipeline of stages: <code>&#36;match</code>, <code>&#36;group</code>, <code>&#36;sort</code>, <code>&#36;project</code>, <code>&#36;lookup</code> (join), <code>&#36;unwind</code> (explode arrays), <code>&#36;facet</code>, <code>&#36;setWindowFields</code>. Put <code>&#36;match</code>/<code>&#36;sort</code> **first** so they can use indexes, and <code>&#36;project</code> early to shrink documents. Blocking stages such as <code>&#36;sort</code> and <code>&#36;group</code> spill to disk past 100 MB of memory (allowed by default since 6.0); not every stage can spill, and each output document is still capped at 16 MB.

```javascript
// Daily revenue for paid orders this month
db.orders.aggregate([
  { $match: { status: "PAID", createdAt: { $gte: ISODate("2026-11-01") } } },
  { $group: {
      _id: { $dateTrunc: { date: "$createdAt", unit: "day" } },
      revenue: { $sum: "$amount" },
      orders: { $sum: 1 }
  } },
  { $sort: { _id: 1 } }
])
```

</details>

<details>
<summary><strong>M8 · Transactions vs single-document atomicity</strong> — Core</summary>

- **Single-document writes are atomic**, including embedded arrays. Model data so most invariants live in one document.
- **Multi-document ACID transactions** (replica sets since 4.0, sharded clusters since 4.2) are for real cross-document invariants, like moving money between accounts.
- **Costs:** extra latency, a 60 s default lifetime, write conflicts (retry on `TransientTransactionError`). Keep transactions short. Needing many transactions often signals a schema problem.

</details>

<details>
<summary><strong>M9 · Change streams: what are they and what are they for?</strong> — Core</summary>

- Subscribe to inserts, updates and deletes on a collection, database or whole cluster. They are built on the oplog.
- Each event carries a **resume token**, so you can resume after a crash as long as you’re still inside the oplog window.
- **Uses:** CDC to Kafka, cache invalidation, real-time features, **re-embedding changed docs for RAG** (ties into S5).

</details>

<details>
<summary><strong>M10 · Atlas Vector Search and hybrid search</strong> — Likely · AI team</summary>

- Store embeddings inside documents and create a **vectorSearch index** (HNSW approximate nearest neighbor).
- Query with <code>&#36;vectorSearch</code>, which must be the **first stage**: `queryVector`, `path`, `numCandidates` (breadth, \~10–20× `limit`), `limit`, `filter` (pre-filter on indexed fields such as tenant or ACL). Read the score with <code>{&#36;meta:"vectorSearchScore"}</code>. An exact (ENN) mode is available for small sets or ground truth. Example in P4.
- **Hybrid:** combine with Atlas Search (Lucene/BM25) via <code>&#36;rankFusion</code> (RRF, 8.0+) or <code>&#36;scoreFusion</code> (8.3+). See V5.
- **Why it matters:** one database for operational data and vectors means no sync pipeline to a separate vector DB, and one security and backup model.

</details>

<details>
<summary><strong>M11 · How do you store time-series data in MongoDB?</strong> — Core</summary>

Use **native time-series collections** (5.0+): set `timeField`, `metaField` and `granularity`. Data is stored in compressed internal buckets, so it takes less storage and range queries are faster. Expire old data with `expireAfterSeconds`, and add secondary indexes on meta + time. Before 5.0, people used the manual bucket pattern (one document per sensor per hour).

</details>

<details>
<summary><strong>M12 · Schema design patterns and anti-patterns</strong> — Core · very likely</summary>

**In short:** design for how the app **reads and writes**, not for the entities. Start from the list of queries (“show an order with its items and the customer’s name”), then shape the documents. Patterns are named fixes for common data shapes.

| Pattern | Problem it solves | Example |
|---|---|---|
| **Bucket** | Millions of tiny documents | One doc per sensor per hour with an array of readings (or a time-series collection, M11) |
| **Computed** | The same costly math on every read | Keep `ratingCount` and `ratingSum`, updated with <code>&#36;inc</code> on each new rating |
| **Subset** | A big document, but the page shows only a little | A product embeds its latest 10 reviews; the rest live in `reviews` |
| **Extended reference** | A join just to show a name | An order copies `customer: {_id, name}` |
| **Outlier** | A few documents are huge | A celebrity with 10M followers gets `hasOverflow: true` + overflow docs; normal users don’t |
| **Polymorphic** | Similar things with different fields | One `products` collection with `type: "book" \| "laptop"` |
| **Attribute** | Many sparse fields you need to search | `specs: [{k: "ram", v: 16}, …]` + one index on `specs.k, specs.v` |
| **Schema versioning** | The shape changes over time | `schemaVersion: 2` (see M16) |
| **Approximation** | Exact counters cost too many writes | Update a page-view count once every 100 views |
| **Tree** | Hierarchies | Categories with a `parent` or an `ancestors` array |

**Anti-patterns interviewers look for**

| Anti-pattern | Why it hurts | Fix |
|---|---|---|
| **Unbounded arrays** (comments grow forever) | Docs approach the 16 MB limit; updates and indexes slow down | A separate collection, or subset / bucket |
| **Bloated documents** | Big rarely-used fields fill the cache | Split hot and cold fields; files go to object storage or GridFS |
| **Too many collections** (one per user or day) | Each collection and index costs files and memory | One collection + a field + an index |
| **Unneeded indexes** | Slower writes, wasted RAM | Check usage with <code>&#36;indexStats</code>; drop or combine |
| **Splitting data that’s read together** | Many <code>&#36;lookup</code>s on the hot path | Embed, or use an extended reference |
| **Case-insensitive <code>&#36;regex</code> search** | Can’t use an index well → collection scan | Exact match: an equality query with a case-insensitive collation (strength 2) and a matching index. Partial or fuzzy match: Atlas Search. (<code>&#36;regex</code> ignores collation.) |

</details>

<details>
<summary><strong>M13 · Index types, covered queries and the cost of indexes</strong> — Core</summary>

| Index | Use it for | Example |
|---|---|---|
| **Compound** | Several filters + a sort (follow ESR, M6) | `{status: 1, createdAt: -1}` |
| **Multikey** | Array fields (one entry per element) | `{tags: 1}`. At most one array field per document in a compound index |
| **Unique** | No duplicates | `{email: 1}, {unique: true}` |
| **Partial** | Index only the docs you query (smaller) | `{createdAt: 1}` where `status: "open"` |
| **TTL** | Auto-delete old docs | `{createdAt: 1}, {expireAfterSeconds: 86400}` |
| **Wildcard** | Unknown or varied field names | <code>{"attrs.&#36;**": 1}</code> |
| **Hashed** | Even spread for a shard key (no range queries) | `{userId: "hashed"}` |
| **Text / Atlas Search** | Full-text; prefer Atlas Search (Lucene, BM25) for relevance | Product search |
| **2dsphere** · **vector** | Geo queries · semantic search (M10) | “Stores near me” · RAG |

**Covered query: answered from the index alone**

```javascript
db.orders.createIndex({ status: 1, createdAt: -1, total: 1 })
db.orders.find({ status: "paid" }, { _id: 0, createdAt: 1, total: 1 }).sort({ createdAt: -1 })
// explain(): totalDocsExamined = 0  (exclude _id unless it is in the index)
```

**Indexes aren’t free**

- Every index slows **every write** and uses RAM. Keep indexes plus hot data in memory.
- Find unused indexes with <code>&#36;indexStats</code>. **Hide** an index first (`hideIndex`), watch, then drop it safely.
- Index builds lock only briefly at the start and end (4.2+), but big builds still use I/O, so run them in quiet hours.

</details>

<details>
<summary><strong>M14 · MongoDB internals: WiredTiger, MVCC, journal and oplog</strong> — Likely · deep dive</summary>

**In short:** a write goes into WiredTiger’s in-memory cache and the oplog in the same transaction, is made durable by the **journal** and periodic **checkpoints**, and reaches secondaries when they pull the **oplog**.

![MongoDB write path: cache, journal, checkpoint, oplog, replication](diagrams/mongo34_wb32_mongodb_write_path_cache_journal.svg)

*Primary: cache + oplog (one transaction) → journal (\~100 ms) → checkpoint (60 s). Secondaries pull the oplog; the client gets an ack once a majority has the write.*

| Piece | Simple meaning |
|---|---|
| **WiredTiger** | The default storage engine. Data and indexes are B-trees, compressed on disk (snappy for data, prefix compression for indexes) |
| **Cache** | Default: the larger of 50% of (RAM − 1 GB) or 256 MB. The OS file cache holds compressed pages too. Your working set should fit in RAM |
| **Concurrency** | Document-level and optimistic: on a write conflict MongoDB retries for you. Read/write “tickets” (dynamic since 7.0, max 128 each) cap concurrent storage work |
| **MVCC** | Each operation reads a point-in-time snapshot, so readers don’t block writers |
| **Checkpoint + journal** | Every 60 s a consistent snapshot goes to disk. The journal (write-ahead log) covers the time since, synced about every 100 ms, or at once with `j: true`. Crash recovery = last checkpoint + replay the journal |
| **Oplog** | A capped collection that records every write as an **idempotent** operation (an <code>&#36;inc</code> is stored as the resulting <code>&#36;set</code>), so re-applying is safe. Its size sets your “oplog window” for slow secondaries and change-stream resume (M9) |

**Likely follow-up:** “Why is `w: "majority"` slower, and why use it?” It waits for a secondary round trip. Without it, a write acknowledged only by an old primary can be **rolled back** after a failover.

</details>

<details>
<summary><strong>M15 · Read preference and causal consistency</strong> — Likely</summary>

| Read preference | Reads from | Use when |
|---|---|---|
| `primary` (default) | The primary only | You need the latest data |
| `primaryPreferred` | Primary; a secondary if it’s down | Reads should survive a failover |
| `secondary` / `secondaryPreferred` | Secondaries | Reports and analytics that can be slightly stale |
| `nearest` | The lowest-latency member | Multi-region apps reading local data |

- Secondaries can **lag**. Cap it with `maxStalenessSeconds` (90 or more). Use **tag sets** to read from a region or from analytics nodes.
- Don’t use secondaries just to “scale reads”: fix indexes or add shards first.

**Causal consistency: “I just saved it, why don’t I see it?”**

A user updates their profile on the primary, then the next page reads from a lagging secondary and shows the old name. A **causally consistent session** fixes this: the driver sends `afterClusterTime`, so the read waits until that member has caught up to your write. All four guarantees (read your own writes, monotonic reads, monotonic writes, writes follow reads) need **majority** read concern and **majority** write concern.

```java
try (ClientSession s = client.startSession(
        ClientSessionOptions.builder().causallyConsistent(true).build())) {
    users.withWriteConcern(WriteConcern.MAJORITY)
         .updateOne(s, eq("_id", id), set("name", "Asha"));
    Document me = users.withReadPreference(ReadPreference.secondaryPreferred())
                       .withReadConcern(ReadConcern.MAJORITY)
                       .find(s, eq("_id", id)).first();   // sees "Asha"
}
```

</details>

<details>
<summary><strong>M16 · How do you change a schema with zero downtime?</strong> — Likely · migration teams</summary>

**In short:** MongoDB needs no `ALTER TABLE`, but the app must handle the old and new shapes at the same time. Use **expand → migrate → contract**.

1. **Expand:** deploy code that *reads both* shapes and *writes the new one*, tagged `schemaVersion: 2`. Create any new indexes first.
2. **Migrate:** convert lazily (on the next read or write), and/or backfill in small, throttled, idempotent batches.
3. **Validate:** add <code>&#36;jsonSchema</code> validation with `validationLevel: "moderate"` (checks inserts and updates to docs that are already valid; old invalid docs are left alone, even when updated) and `validationAction: "warn"`, then switch to `"error"`.
4. **Contract:** when a count shows no v1 docs remain, delete the old code path and tighten validation to `"strict"` (every insert and update is checked).

**Example: split `name` into `firstName` and `lastName`**

```javascript
// backfill one _id range at a time; safe to re-run because it only touches v1 docs
db.users.updateMany(
  { schemaVersion: { $ne: 2 }, _id: { $gte: lo, $lt: hi } },
  [{ $set: {
      firstName: { $arrayElemAt: [{ $split: ["$name", " "] }, 0] },
      lastName:  { $arrayElemAt: [{ $split: ["$name", " "] }, 1] },
      schemaVersion: 2 } }])
```

Renaming a field or moving data between collections uses the same idea: dual-write behind a feature flag, backfill, verify, switch reads, then clean up. This is the core of the migration-platform design (S1).

</details>

<details>
<summary><strong>M17 · MongoDB security: auth, RBAC, encryption and Queryable Encryption</strong> — Likely</summary>

| Layer | What MongoDB gives you |
|---|---|
| **Network** | IP access lists and private endpoints (Atlas); TLS for all traffic |
| **Authentication** | Passwords (SCRAM), x.509 certificates, LDAP/Kerberos (Enterprise), OIDC single sign-on (e.g. Microsoft Entra ID) in Atlas and Enterprise |
| **Authorization (RBAC)** | Built-in roles (`read`, `readWrite`, `dbAdmin`…) and custom roles. Separate least-privilege users for apps, people and AI agents (read-only for the MCP server, V11) |
| **Encryption at rest** | On by default in Atlas, optionally with your own keys; the encrypted storage engine in Enterprise |
| **Field-level (CSFLE)** | The driver encrypts chosen fields before they leave the app; the server never sees plaintext. Deterministic mode allows equality matches only |
| **Queryable Encryption** | Randomized encryption you can still query: equality, range (8.0), and prefix/suffix/substring (GA in 2026) |
| **Auditing** | Logs who did what (Atlas, Enterprise) |

**Typical question:** “Support must find a customer by the last 4 digits of their ID, but DBAs must never see IDs.” → Queryable Encryption with a **suffix** query on that field. Only the support app holds the key; the database sees only ciphertext.

**For AI apps:** pre-filter <code>&#36;vectorSearch</code> by tenant and ACL (G12), keep secrets out of prompts, and give agents read-only database users.

</details>

## 34.9 LLM fundamentals, RAG & MongoDB AI (deep dive)

This section is the foundation behind the AI questions in sections 4, 7 and 10. Learn it in this order: **how LLMs work** → **RAG** (what, why, how, alternatives) → **MongoDB-specific AI topics**. That last group is what a MongoDB interviewer is most likely to dig into.

### 34.9A · LLM fundamentals

![How an LLM answers: tokens in → ONE token out → repeat](diagrams/mongo34_wb33_answers_tokens_one_token_out.svg)

*The core loop: text → tokens → vectors → transformer layers → probabilities for the next token → pick one → append → repeat. Prefill sets the time to first token; decode sets tokens/sec.*

<details>
<summary><strong>F1 · What is an LLM, in one minute?</strong> — Core</summary>

- A **transformer** neural network trained to **predict the next token**. Trained on huge amounts of text, it picks up grammar, facts and reasoning patterns.
- It writes **one token at a time**: predict probabilities → pick one → append → repeat (autoregressive).
- It is **stateless**: no memory between calls, so your app resends the history each time. Its knowledge is frozen at the **training cutoff**.
- **Training stages:** pretraining (next-token prediction at internet scale) → instruction tuning (SFT on good Q&A examples) → preference tuning (RLHF / DPO) to make it helpful and safe.

**One-liner for interviews:** “An LLM is a next-token predictor. Chat, tools and RAG are all built around that loop.”

</details>

<details>
<summary><strong>F2 · What are tokens, and why do they matter?</strong> — Core</summary>

- Text is split into sub-word pieces (BPE-style). Roughly **1 token ≈ 4 English characters ≈ ¾ of a word**, so 1,000 words ≈ 1,300 tokens. Code, numbers and non-English text use more.
- **Why it matters:** **price** (charged per input and output token), **limits** (the context window is counted in tokens) and **latency** (each output token takes time).
- It also explains odd behavior, like miscounting letters or slipping on long-number arithmetic: the model sees tokens, not characters.

</details>

<details>
<summary><strong>F3 · What are embeddings?</strong> — Core</summary>

- An **embedding** is a list of numbers (a vector) that captures **meaning**. Similar meaning gives nearby vectors, measured with cosine or dot product.
- **Two kinds:** token embeddings *inside* the LLM, and sentence/document embeddings from an **embedding model** (e.g. Voyage AI), used for search, clustering, dedupe and classification.
- **Dimensions** (typically 256–3072) trade quality against storage and speed. Some models let you **truncate dimensions** (Matryoshka).
- **Rule:** documents and queries must be in the **same embedding space**: usually the same model (some families, like Voyage 4, share one space across sizes). Store the model name with each vector; changing models means re-embedding.

</details>

<details>
<summary><strong>F4 · How do transformers and self-attention work (simple version)?</strong> — Core</summary>

**In short:** text becomes token vectors, which pass through many identical blocks. In each block, **attention** lets every token pull in meaning from the earlier tokens that matter to it, and a **feed-forward** layer then processes each token. At the end, the model scores the next token.

![Self-attention + one transformer block (simple view)](diagrams/mongo34_wb34_self_attention_one_transformer_block.svg)

*“it” pays most attention to “cat”, so its vector now means “the cat”. Words after it are hidden. Right: one block, repeated N times.*

**Self-attention in 4 steps**

1. Each token makes a **Query** (what am I looking for?), a **Key** (what do I contain?) and a **Value** (what do I pass on?).
2. **Score** my Query against every earlier token’s Key.
3. Turn the scores into weights that **add up to 1** (scale by √d, then softmax). Future tokens get 0.
4. My new vector = the **weighted mix of Values**.

**Key points**

- **Multi-head:** many attention heads run in parallel; each learns a different relation (grammar, “who is *it*”, …).
- **Why it won:** it trains in parallel on GPUs, and any word can reach any other in one step.
- **Cost:** every token is compared with every other token, n², so long context is expensive (KV cache, FlashAttention).
- **Types:** decoder-only = chat LLMs (GPT, Llama); encoder-only = embedding models and rerankers (BERT-style).

</details>

<details>
<summary><strong>F5 · Context window, KV cache, prompt caching and latency</strong> — Core</summary>

- **Context window** = the maximum tokens (input + output) in one call. System prompt, history, retrieved docs and tool results all have to fit.
- **Prefill** reads the whole prompt in parallel and sets the **time to first token (TTFT)**. **Decode** writes one token at a time (**tokens/sec**). Long prompts hurt TTFT; long answers hurt total time.
- **KV cache:** keys and values of earlier tokens are kept, so each new token is cheap. Memory grows with context length.
- **Prompt caching** (provider-side) reuses work for an identical prompt **prefix**, making calls cheaper and faster. Put stable instructions first and changing content last.
- **“Lost in the middle”:** models use the start and end of a long context better than the middle. Retrieve less but better, and put key facts first.

</details>

<details>
<summary><strong>F6 · Temperature, top-p and top-k: what do they do?</strong> — Core</summary>

- The model gives a probability to every possible next token; **sampling** picks one.
- **Temperature:** low (0–0.3) is focused and repeatable, good for extraction, code and classification. High (0.7–1.0) is varied and creative.
- **Top-p** samples only from the smallest set of tokens whose probabilities add up to p. **Top-k** samples only from the k most likely tokens.
- Even temperature 0 is **not perfectly deterministic** (batching, floating point). Pin the model version and give evals a pass threshold rather than requiring exact matches.

</details>

<details>
<summary><strong>F7 · The customization ladder: prompting → RAG → fine-tuning → training</strong> — Core</summary>

| Step | Changes | Cost / effort | Use when |
|---|---|---|---|
| Prompting + few-shot | Instructions and examples | Minutes | Always start here |
| RAG | What the model **knows** at answer time | Days | Private, fresh or large knowledge; citations |
| Tool use | What the model can **look up or do** | Days | Live or structured data, actions |
| Fine-tuning (LoRA) | How the model **behaves** | Weeks | Format, style, domain jargon, a cheaper small model |
| Continued pretraining / from scratch | Core knowledge | Highest, months | Rarely; a whole new domain or language |

Move up a rung only when **evals** show the cheaper rung isn’t good enough.

</details>

<details>
<summary><strong>F8 · Why do LLMs hallucinate, and how do you reduce it?</strong> — Core</summary>

**Why:** they generate *plausible* text, not *verified* facts. Missing or outdated knowledge, vague prompts and pressure to always answer all make it worse.

**Reduce it:** ground answers with retrieval plus **citations**; explicitly allow **“I don’t know”**; lower the temperature; use structured output with validation; verify facts with tools (query the DB rather than trusting memory); add a self-check step; and **measure** the hallucination rate in evals.

</details>

<details>
<summary><strong>F9 · Prompting techniques that actually matter</strong> — Core</summary>

- **Role + task + constraints + output format**, written clearly. Delimit inputs (e.g. `<doc>…</doc>`).
- **Few-shot examples** for format and edge cases.
- **Reasoning:** ask the model to think step by step on hard tasks, or use a reasoning model.
- **Structured output** (JSON schema) for anything code will read.
- **Decompose** big tasks into a chain of smaller prompts.
- **Stable text first** (to benefit from prompt caching); **version prompts** and run evals on them (L4, L9).

</details>

<details>
<summary><strong>F10 · How do you pick a model? (size, open vs closed, quantization)</strong> — Core</summary>

- **Bigger** models are smarter, slower and pricier. **Route** easy or high-volume work to a small model and hard cases to a large one (L10).
- **Closed APIs:** top quality and no ops. **Open-weight** (Llama, Mistral, Qwen…): full control, data residency and fine-tuning, but you run the GPUs.
- **Quantization** (8-/4-bit weights) shrinks a model with a small quality loss. **Distillation** trains a small model to imitate a big one.
- **Decide with your own eval set** on quality × cost × latency × privacy, not leaderboards.

</details>

<details>
<summary><strong>F11 · What are reasoning models (test-time compute)?</strong> — Likely</summary>

They spend extra (often hidden) **“thinking” tokens** before answering, trained with reinforcement learning to reason step by step. They are **better** at math, code, planning and multi-step logic, but **slower and pricier**, since thinking tokens are billed as output. Use them for hard tasks and control the spend with a reasoning-effort setting. Don’t use them for simple extraction or classification.

</details>

<details>
<summary><strong>F12 · Numbers worth knowing (rough)</strong> — Core</summary>

| Thing | Rough number |
|---|---|
| Token size | \~4 characters; 1k words ≈ 1.3k tokens |
| Context windows | \~128k to 1M+ tokens |
| Time to first token | \~0.2–2 s (depends on model and prompt length) |
| Decode speed | \~30–200 tokens/s |
| Output vs input price | Output usually costs \~3–5× more per token |
| Vector memory | 1M × 1024 dims × 4 bytes ≈ **4 GB** (int8 ÷4, binary ÷32) |

Say “roughly”: these numbers change with every model generation.

</details>

<details>
<summary><strong>F13 · How is memory managed in an LLM chat window?</strong> — Likely</summary>

**Key idea:** the model is **stateless**. It remembers nothing between calls. “Memory” is whatever **your app puts back into the context window** on each call, and all of it (plus the answer) must fit the window. More history means more cost and latency on every turn.

![Chat memory: the app rebuilds the context window on every call](diagrams/mongo34_wb35_chat_memory_app_rebuilds_context.svg)

*On every turn the app rebuilds the window from six parts. When it gets too big, the oldest unpinned turns are summarized, and the full history stays in the database for retrieval.*

**The 6 parts, with an example (an IT help assistant midway through a chat)**

| Part | What it is | Example | Rough size |
|---|---|---|---|
| **System prompt** | Fixed rules; the same every call, so it can be cached | “You are an IT help assistant. Be brief. Only answer IT questions. Cite the help article.” | \~500 tokens |
| **Pinned facts** | Key facts that are never dropped | User: Asha · Team: Docs Online · Windows 11 laptop · prefers short answers | \~200 |
| **Summary** | Older turns squeezed into a few lines | “Earlier: VPN failed with error 809; resetting the network adapter fixed it. Then the user asked about resetting MFA.” | \~800 |
| **Retrieved memories** | Old chats fetched because they match the current topic | From a chat on 12 Oct: “This laptop needed a BitLocker recovery key after a BIOS update.” | \~1,500 |
| **Recent turns** | The last few messages, word for word | User: “My laptop is asking for the BitLocker key again.” · Bot: “Did you update the BIOS recently?” · User: “Yes, yesterday.” | \~4,000 |
| **Answer reserve** | Space kept free for the reply, so it isn’t cut off | `max_tokens = 1000` | \~1,000 |

Total ≈ **8k tokens**, which fits easily in a 128k window. **Why each part matters:** pinned facts mean it never forgets who you are; the summary keeps the story so far cheaply; retrieved memories link today’s issue to last month’s (“same BitLocker problem after a BIOS update”); recent turns keep the exact flow; the reserve stops the answer being cut off.

**Strategies**

| Strategy | How | Good | Bad |
|---|---|---|---|
| Full history | Resend every message | Simple, nothing lost | Cost and latency grow each turn; eventually hits the limit |
| Last N turns (sliding window) | Keep only the newest N messages | Cheap, predictable | Forgets early facts (name, goal) |
| Token-budget trim | Drop the oldest messages until under budget (count tokens) | Uses the window fully | Same forgetting; must not cut a message or a tool call/result pair in half |
| **Rolling summary** | Fold old turns into a running summary (cheap model) | Keeps the gist; bounded size | Lossy; the summary can drift; an extra LLM call |
| **Pinned facts** / user profile | Key facts always included (preferences, goal, constraints) | Never forgets what matters | Must decide what to pin; can go stale |
| **Retrieval memory** | Store every turn or fact with an embedding; fetch the relevant ones per turn | Scales to months of history | Retrieval can miss; more infrastructure |
| Provider-managed state | The API keeps the thread for you (server-side conversation) | Less app code | Less control, lock-in, still billed for the tokens |

**Production recipe**

System prompt + pinned facts + rolling summary + top-k retrieved memories + the last few turns word for word + room reserved for the answer. This is what the diagram shows; **L3** has the code, and **V10** shows how to store it in MongoDB.

**Gotchas to mention**

- Count with the model’s **tokenizer**, and reserve tokens for the answer.
- Never split a **tool call from its result**, or a question from its answer.
- **Order matters:** stable parts first (prompt caching), newest turns last (models use the start and end best).
- **Summarize in batches** (e.g. once past 75% of the budget), not on every turn.
- **KV cache / prompt caching ≠ memory:** they only make re-reading the same prefix cheaper.
- **Privacy:** isolate per user, set a TTL, support “forget me”, and don’t store secrets.
- **Test it:** memory evals, e.g. “does it still know the user’s goal from 50 turns ago?”

</details>

<details>
<summary><strong>F14 · How is chat memory managed in Microsoft Copilot and Copilot agents?</strong> — Likely · real-world example</summary>

**In one line:** Copilot uses two kinds of memory. **Short-term** is the current chat, trimmed to fit the model’s window. **Long-term** is a small, per-user memory that carries across chats and that users can see and delete. It’s the same pattern as F13.

![Memory in Microsoft Copilot: short-term vs long-term](diagrams/mongo34_wb36_memory_microsoft_copilot_short_term.svg)

*Three products, the same two layers. The bottom row shows where long-term memory is stored and who controls it.*

**How each product does it**

| Product | Short-term (this chat) | Long-term (across chats) | Stored / controlled by |
|---|---|---|---|
| **Microsoft 365 Copilot Chat** | The current conversation | **Copilot Memory:** facts you ask it to save, things learned from past chats, your custom instructions, and insights from your mail, Teams and meetings | A hidden folder in the user’s mailbox. Users can view or delete memories, or use a **temporary chat**; admins have an on/off switch and eDiscovery |
| **Copilot Studio agents** | The **last 10 turns** are used to pick tools and fill their inputs | **Memory (preview):** one private store per agent per user | The maker turns it on or off; users can ask “what do you remember?” or use a memory portal |
| **Pro-code agents** | The thread trims old messages: drop middle ones, keep the last N, or summarize (Foundry, Agent Framework) | You build it: conversation state and user state (Agents SDK), plus your own memory store | Your database (Cosmos DB, Blob…), your rules |

**Good to know**

- **Deleting a chat** does not delete the memories saved from it.
- **Temporary chat:** Copilot neither uses nor saves memory.
- **Copilot Studio memory** is private to the user (not even the agent’s maker can see it), deleted after **28 days** without use, and **off in group chats**.
- **Customer-service agents** remember only fixed fields (name, open requests, a summary of the last chat) for **30 days**, and treat them as hints to verify.
- **Purview retention policies don’t apply** to Copilot memory; admins use eDiscovery to find and delete it.

**Lessons for your own design**

1. Keep **short-term and long-term memory separate**.
2. Keep long-term memory **small, per user, and expiring**.
3. Let users **see, delete and opt out**.
4. Treat memory as **hints, not facts**: verify before acting.

**30-second answer**

“Copilot keeps the current chat as short-term context, trimmed to fit the window; Copilot Studio uses the last 10 turns. Long-term memory is a small per-user store of saved facts, preferences and things learned from past chats. Users can view it, delete it, or skip it with a temporary chat, and it follows enterprise compliance. I’d build the same two layers in MongoDB: recent turns in the prompt, and long-term facts in a per-user collection with a vector index and a TTL (V10).”

Source: Microsoft Learn and Microsoft Support docs, Nov 2026. Several features are in preview and change often.

</details>

<details>
<summary><strong>F15 · How do Microsoft Copilot agents access AI models?</strong> — Likely · real-world example</summary>

**In short:** in Microsoft 365 Copilot and declarative agents, the agent never calls a model directly. Each request goes through Copilot’s **orchestrator**, which grounds it with work data (Microsoft Graph, only what the user can access), calls the **LLM**, runs safety checks and returns the answer. **Custom engine agents** bring their own orchestrator and model, and use Graph only if they choose to. **Who picks the model** depends on the agent type.

![How Microsoft Copilot agents reach an AI model](diagrams/mongo34_wb37_microsoft_copilot_agents_reach_ai.svg)

*Top: the path of every request. Bottom: three agent types, from “Microsoft picks the model” to “you bring your own”. Admins control which providers and regions are allowed.*

| Agent type | Who picks the model | Models |
|---|---|---|
| **Declarative** (Agent Builder, Agents Toolkit) | Microsoft: it runs on Copilot’s own orchestrator and models | Copilot’s models. You only add instructions, knowledge and actions, and you inherit Microsoft 365 security and compliance |
| **Copilot Studio** | The maker, from a dropdown per agent | Default “GPT Chat Latest” (upgraded automatically), other GPT models, and Claude; Anthropic, Mistral and xAI as external models if admins allow; the Prompt tool can use Azure AI Foundry models |
| **Custom engine** (Agents SDK, Agent Framework) | You | Any model (Azure OpenAI, Foundry, fine-tuned, small). You also own hosting, security and responsible AI |

**Good to know**

- **Anthropic models** run with Anthropic as a **Microsoft subprocessor**. Admins turn them on or off in the Microsoft 365 admin center; they’re on by default in most commercial regions (not EU/UK) and unavailable in GCC High and DoD.
- **Customer data isn’t used to train** the foundation models.
- **“Cross-geo”** models may process data outside your region, and preview or experimental models aren’t for production. Admins control both.
- **Models retire** on published dates; the default model auto-upgrades and is the fallback. Re-run your evals when it changes.

**Lessons for your own design**

1. Hide models behind **one interface or alias** so you can swap them (L1, L10).
2. Let **admins govern** providers and data regions.
3. **Evaluate before switching** models (L9).

**30-second answer:** “Copilot agents reach models through an orchestrator that grounds the prompt with Graph data the user can access, calls the LLM and applies safety checks. Declarative agents use Copilot’s models; Copilot Studio lets makers pick GPT or Claude, plus admin-approved external models; custom engine agents bring their own. Admins control providers and data regions.”

Source: Microsoft Learn, Nov 2026. Model lists change often.

</details>

### 34.9B · RAG: what, why, how, alternatives

![RAG step by step (red numbers = where it usually breaks)](diagrams/mongo34_wb38_rag_step_by_step_red.svg)

*Indexing (top) runs offline or on every change; answering (bottom) runs per question. The red numbers mark the 7 places RAG usually breaks, each with its fix.*

<details>
<summary><strong>G1 · What is RAG?</strong> — Core</summary>

**Retrieval-Augmented Generation:** before the model answers, **fetch the relevant facts from your own data** and put them in the prompt. It’s an **open-book exam** instead of a closed-book one.

Three steps: **Retrieve** (search your data) → **Augment** (build a prompt with that context) → **Generate** (answer, citing the sources).

</details>

<details>
<summary><strong>G2 · Why use RAG? What are its limits?</strong> — Core</summary>

| Benefit | Why it matters |
|---|---|
| Fresh knowledge | Update by re-indexing in minutes, not retraining |
| Private data | Uses internal docs the model never saw |
| Citations | Users can verify the answer, which builds trust |
| Fewer hallucinations | Answers are grounded in real text |
| Permissions | Filter retrieval per user or tenant |
| Cheap and model-agnostic | No training, and you can swap the LLM anytime |

**Limits:** answers can only be as good as retrieval; it adds latency and moving parts; it can’t teach new *skills* or *formats* (use fine-tuning for that); it’s weak for exact numbers over structured data (use tools or queries).

</details>

<details>
<summary><strong>G3 · How does RAG work, step by step?</strong> — Core</summary>

1. **Index (offline or on change):** load → parse and clean → **chunk** → enrich (title, ACL, dates) → **embed** → store vectors, text and metadata.
2. **Understand the question:** optionally rewrite or split it, and pull filters out of it (product, date).
3. **Retrieve:** vector + keyword search, with an **ACL/metadata pre-filter** → top 20–100.
4. **Rerank:** a cross-encoder picks the best 3–8.
5. **Build the prompt:** rules (“answer only from the context; cite; say I don’t know”) + numbered context + question.
6. **Generate** and stream the answer with citations.
7. **Check:** citations exist and support the claims; output guardrails; log everything for evals.

</details>

<details>
<summary><strong>G4 · Chunking strategies: which one, and why?</strong> — Core</summary>

| Strategy | How | Good / bad |
|---|---|---|
| Fixed size | Every N tokens | Simple / cuts thoughts in half |
| Recursive | Split by paragraph → sentence until it fits | Decent default for plain text |
| **Structure-aware** | Headings, sections, code functions, table rows | **Best default** for docs and code |
| Semantic | Split where the meaning shifts (embedding distance) | Cleaner chunks / more compute |
| Parent-child (small-to-big) | Search small chunks, return the bigger parent | Precise search *and* enough context |
| Contextual chunks | Prepend a short doc-level context to each chunk before embedding | Big recall gains / extra LLM calls at index time |

**Rules of thumb:** 200–800 tokens with 10–20% overlap, and keep the title and section path with each chunk. **Tune with recall@k** on real questions.

</details>

<details>
<summary><strong>G5 · Dense vs keyword vs hybrid search, RRF and rerankers</strong> — Core</summary>

- **Dense (vectors):** finds meaning and paraphrases, but misses exact codes, IDs and rare words.
- **Keyword (BM25):** finds exact terms (`E11000`, ticket IDs), but misses synonyms.
- **Hybrid:** run both and merge with **Reciprocal Rank Fusion**: score = Σ 1 / (60 + rank). It is robust because it uses ranks, not raw scores. In MongoDB: <code>&#36;rankFusion</code> (8.0+) or <code>&#36;scoreFusion</code> (8.3+); see V5.
- **Reranker** (cross-encoder): reads the query and each document *together*, so it orders far better. Run it on the top 20–100 and keep 3–8 (Voyage rerankers are available on Atlas).
- **Pre-filters** on tenant, ACL, date or product go *inside* the search. **MMR** adds diversity so you don’t get five near-duplicate chunks.

</details>

<details>
<summary><strong>G6 · Advanced RAG patterns (when basic RAG isn’t enough)</strong> — Likely</summary>

| Pattern | What it does | Use when |
|---|---|---|
| Query rewrite / multi-query | Rephrase or split the question; search several times | Vague or multi-part questions |
| HyDE | Write a hypothetical answer, embed it, search with it | Questions are worded differently from the docs |
| Self-query | The LLM pulls structured filters out of the question | “EU incidents in March” → filter + vector search |
| Contextual retrieval | Chunks carry document context | Chunks are ambiguous on their own |
| Corrective RAG | Grade the retrieved docs; if weak, rewrite or search elsewhere | Retrieval quality varies a lot |
| **Agentic RAG** | An agent decides when and what to search, and iterates | Multi-hop research, several sources |
| **GraphRAG** | Entity/relationship graph + community summaries | “Connect the dots” or “main themes across ALL docs” |
| Multimodal RAG | Embed images, tables, screenshots | Visual documents, diagrams |

</details>

![Which approach? Prompting vs RAG vs the alternatives](diagrams/mongo34_wb39_which_approach_prompting_vs_rag.svg)

*Pick the cheapest approach that fits the problem. In real systems they are combined: RAG for documents, tools for live numbers, fine-tuning for format.*

<details>
<summary><strong>G7 · What are the alternatives to RAG, and when is each better?</strong> — Likely</summary>

| Approach | What | Better when… | Why not always |
|---|---|---|---|
| Prompting only | The model’s own knowledge | General knowledge, writing, reasoning | Stale; no private data |
| Long context | Paste all the docs into the window | Small corpus; reasoning over a whole document | Cost and latency per call, lost-in-the-middle, no per-chunk ACL |
| CAG (cache-augmented generation) | Preload a fixed corpus once and reuse the prompt/KV cache | Small, stable knowledge (FAQ, manual); lowest latency | Must fit the window; refreshing means rebuilding |
| Fine-tuning (LoRA) | Change the weights with examples | Behavior, format, tone, jargon; a cheaper small model | Bad at adding or updating facts; no citations |
| Tool use / text-to-MQL | The model queries APIs or the DB | Live, structured data; exact counts and aggregates | Needs schema context and guardrails |
| GraphRAG / knowledge graph | Entities + relationships | Multi-hop and global questions | Costly to build and keep fresh |
| Agentic search | An agent loops over search and tools | Open-ended research | Slower, pricier, less predictable |
| Memory | Store user facts and preferences | Personalization over time | Privacy, staleness |

**Answer to give:** “It’s rarely either/or. I’d use RAG for documents, tools for live data, fine-tuning only for form, and let evals pick.”

</details>

<details>
<summary><strong>G8 · “Context windows are 1M tokens now. Is RAG dead?”</strong> — Likely</summary>

**No.** Long context *helps* RAG but doesn’t replace it:

1. **Cost:** you’d pay for \~1M input tokens on *every* question.
2. **Latency:** prefill time grows with the prompt.
3. **Accuracy:** models lose facts in the middle; focused context is better.
4. **Permissions:** you can’t paste in documents this user isn’t allowed to see.
5. **Scale:** real corpora are gigabytes to terabytes.
6. **Freshness:** an index updates in minutes.

Use long context when the corpus is small or the task needs the whole document, and to retrieve more generously within RAG.

</details>

<details>
<summary><strong>G9 · RAG vs fine-tuning: how do you decide?</strong> — Core</summary>

**“Fine-tune for form, RAG for facts.”**

- Facts that are private, fresh or need citations → **RAG**.
- Behavior, format, tone, latency or cost → **fine-tune** (often a smaller model).
- Both needed → do both: fine-tune the format, retrieve the facts.

Decide with an eval set comparing prompt-only, RAG and fine-tuned versions on quality, cost and latency.

</details>

<details>
<summary><strong>G10 · How do you evaluate a RAG system?</strong> — Core</summary>

| Layer | Metric | Question it answers |
|---|---|---|
| Retrieval | recall@k, precision@k, MRR, nDCG | Did the right chunk show up, near the top? |
| Context | Context precision and recall | Is the context relevant and complete? |
| Generation | Faithfulness, answer relevance, correctness, citation accuracy | Is every claim supported, and does it answer the question? |
| Refusal | Correct “I don’t know” on unanswerable questions | Does it avoid guessing? |
| System | p95 latency, cost per answer, no-answer rate, thumbs | Is it usable and affordable? |

**Debug retrieval first:** if the right chunk isn’t in the top-k, no prompt can fix it. Tools: RAGAS, DeepEval, TruLens, promptfoo, LangSmith, or the harness in L9.

</details>

<details>
<summary><strong>G11 · Common RAG failures and their fixes</strong> — Core</summary>

| Symptom | Likely cause → fix |
|---|---|
| Right doc never retrieved | Exact terms missed → hybrid search; bad chunks → structure-aware chunking; vague question → rewrite |
| Retrieved but ranked low | Weak first-stage ranking → add a reranker |
| Retrieved but ignored | Too much context → fewer, better chunks, best ones first |
| Old and new versions mixed | No version metadata → `updatedAt`/version filters, dedupe |
| Tables come out as garbage | Naive PDF parsing → layout-aware parser, tables as markdown |
| User sees data they shouldn’t | Filtering after generation → ACL pre-filter inside the search |
| Wrong numbers or counts | Using RAG for aggregates → use tools or a DB query instead |
| Too slow | → cache, smaller k, parallel retrieval, stream tokens |

</details>

<details>
<summary><strong>G12 · How do you secure a RAG system?</strong> — Likely</summary>

- **Permissions:** ACL/tenant pre-filter **inside** the vector query, never after.
- **Indirect prompt injection:** documents can contain instructions. Treat retrieved text as data, and never let it trigger tools or actions automatically.
- **PII:** redact at ingest and again on output; respect data residency.
- **Audit** what was retrieved for whom.
- **Deletion:** “forget me” must also remove chunks, vectors and cached answers.

</details>

<details>
<summary><strong>G13 · Running RAG in production: freshness, re-embedding, cost, latency</strong> — Likely</summary>

- **Freshness:** change streams or **Automated Embedding** keep vectors in sync (V8). Handle deletes.
- **New embedding model:** write a new field and index → backfill → switch reads → drop the old ones. Store `embeddingModel` and `chunkerVersion` on every chunk.
- **Cost:** cache query embeddings and frequent answers; quantize vectors (V4); use a small model where possible.
- **Latency budget:** query embedding \~20–50 ms · search \~10–100 ms · rerank \~50–200 ms · LLM first token \~0.3–2 s. Stream the answer.
- **Monitor:** retrieval score drift, no-answer rate, thumbs, citation clicks.

</details>

<details>
<summary><strong>G14 · How does RAG work in Microsoft Copilot agents?</strong> — Likely · real-world example</summary>

**In short:** the same RAG as G3, run for you by Microsoft. It rewrites the question, searches your knowledge **with the user’s permissions**, has the LLM write an answer **with citations**, then safety-checks it. You don’t build the index yourself.

![RAG in Microsoft Copilot agents (example: an IT help agent)](diagrams/mongo34_wb40_rag_microsoft_copilot_agents_example.svg)

*Copilot Studio’s 4 steps, shown on one question. The Microsoft 365 index only returns content the user can already open.*

**Example walk-through: “How do I get a new laptop?”**

1. **Rewrite:** the agent uses the last 10 turns (e.g. “I’m in the Bangalore office”) to turn the question into a search query: “laptop request process Bangalore hardware policy”.
2. **Retrieve:** it searches every knowledge source in parallel and keeps the **top 3 results per source**, for example the IT policy on SharePoint and a ServiceNow article through a connector. SharePoint results are **security-trimmed**, so a user never sees a file they can’t open.
3. **Summarize:** the LLM answers only from those snippets and adds citations [1] [2].
4. **Check:** moderation validates the answer, then it’s sent.

**Where the knowledge comes from**

| Agent type | Knowledge | Example |
|---|---|---|
| **Microsoft 365 Copilot / declarative agents** | Microsoft Graph plus the **semantic index** (keyword + vector) over SharePoint and OneDrive; **Copilot connectors** bring in outside systems | “Summarize the latest design doc for Project X” |
| **Copilot Studio agents** | The knowledge sources you add: SharePoint/OneDrive, uploaded files, websites (Bing), Dataverse, Azure AI Search, connectors | An HR agent answering from the policy site |
| **Custom engine agents** | The **Copilot Retrieval API** returns permission-trimmed text chunks from the same index (SharePoint, OneDrive, connectors), and your own model writes the answer | A Foundry agent grounded on SharePoint, with no vector DB of its own |

**Key difference from DIY RAG:** permissions are enforced **at retrieval**, and indexing is managed for you. The trade-off is less control over chunking and ranking.

Source: Microsoft Learn, Nov 2026.

</details>

<details>
<summary><strong>G15 · What is MCP (Model Context Protocol)?</strong> — Likely</summary>

**In short:** MCP is an **open standard** for connecting AI apps to tools and data. Think of it as **USB-C for AI**: wrap a system (MongoDB, GitHub, files) in an MCP server once, and any AI app (GitHub Copilot in VS Code, Claude, Copilot Studio) can use it with no custom glue code.

![MCP: one standard plug between AI apps and tools (think USB-C)](diagrams/mongo34_wb41_mcp_one_standard_plug_between.svg)

*Host (the AI app) → one MCP client per server → MCP servers → the real systems. Servers offer tools, resources and prompts.*

**The 3 parts**

| Part | What it is | Example |
|---|---|---|
| **Host** | The AI app the user talks to. It holds the LLM. | GitHub Copilot in VS Code |
| **Client** | A connector inside the host, one per server. It finds the server’s tools and sends the calls. | The VS Code MCP client |
| **Server** | A small program that wraps one system and offers **tools** (actions), **resources** (data to read) and **prompts** (templates). | MongoDB MCP Server: `find`, `aggregate`, `list-collections` |

They talk in **JSON-RPC** messages: over **stdio** for a local server, or **Streamable HTTP** for a remote one.

**Example: “Which orders failed today?” in VS Code**

1. On connect, the client asks the MongoDB server `tools/list` and gets `find`, `aggregate` and more.
2. The LLM picks `find` on `orders` with `{status: "failed"}`.
3. The client sends `tools/call`; the server runs the query on Atlas.
4. The result goes back to the LLM, which answers: “12 orders failed, mostly payment timeouts.”

**MCP vs function calling:** function calling is how a model says “call this function” inside one app. MCP is the **standard way to find and run** those functions across apps; the host still uses function calling underneath.

**Stay safe:** tool descriptions and results are untrusted text (prompt injection), so use only trusted servers, least-privilege credentials (e.g. the MongoDB MCP Server’s **read-only mode**), and ask the user before any write.

Sources: modelcontextprotocol.io spec; MongoDB MCP Server docs, Nov 2026.

</details>

<details>
<summary><strong>G16 · How do you create an MCP server? (Java)</strong> — Likely · hands-on</summary>

**In short:** five steps and one small Java file. Add the SDK, describe a tool, write its handler, start the server, then plug it into an AI app. The example below exposes one read-only tool, `find_orders`.

![Build an MCP server in 5 steps, and what it says on the wire](diagrams/mongo34_wb42_build_mcp_server_5_steps.svg)

*Left: the 5 build steps. Right: the 4 messages exchanged when VS Code uses the server (captured from the real server below).*

**The 5 steps**

1. **Add the SDK:** the official MCP Java SDK, Maven `io.modelcontextprotocol.sdk:mcp:2.2.0` (Java 17+).
2. **Describe the tool:** a name, a description and a JSON schema for its inputs. The LLM reads only this to decide *when* and *how* to call it, so write it like docs for the model.
3. **Write the handler:** read the arguments, do the work (e.g. a MongoDB query), return text. Return errors as an `isError` result, not an exception, so the LLM can fix its call.
4. **Start the server:** **stdio** for a local tool (the AI app starts it as a child process), or **Streamable HTTP** for a shared, remote one.
5. **Plug in and test:** package it as one runnable jar (e.g. the Maven Shade plugin), try it with `npx @modelcontextprotocol/inspector java -jar orders-mcp.jar`, then add it to the AI app (below).

```java
import io.modelcontextprotocol.json.McpJsonDefaults;
import io.modelcontextprotocol.server.McpServer;
import io.modelcontextprotocol.server.McpServerFeatures.SyncToolSpecification;
import io.modelcontextprotocol.server.transport.StdioServerTransportProvider;
import io.modelcontextprotocol.spec.McpSchema.CallToolResult;
import io.modelcontextprotocol.spec.McpSchema.ServerCapabilities;
import io.modelcontextprotocol.spec.McpSchema.Tool;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/** A tiny MCP server with one read-only tool: find orders by status. Needs io.modelcontextprotocol.sdk:mcp. */
public class OrdersMcpServer {

    record Order(String id, String status, String reason) {}

    // Stand-in for a MongoDB "orders" collection; real code: orders.find(eq("status", status))
    static final List<Order> ORDERS = List.of(
            new Order("A1", "failed", "payment timeout"),
            new Order("A2", "shipped", ""),
            new Order("A3", "failed", "card declined"));

    static final List<String> STATUSES = List.of("failed", "shipped", "pending");

    // Step 1: describe the tool. The LLM reads the name, description and schema to decide when to call it.
    static Tool findOrdersTool() {
        return Tool.builder("find_orders", Map.of(
                        "type", "object",
                        "properties", Map.of("status", Map.of(
                                "type", "string",
                                "enum", STATUSES,
                                "description", "Order status to filter by")),
                        "required", List.of("status")))
                .description("Find orders by status. Read-only.")
                .build();
    }

    // Step 2: the handler that runs when the LLM calls the tool.
    static CallToolResult findOrders(Map<String, Object> args) {
        Object status = args.get("status");
        if (!STATUSES.contains(status)) {
            // The SDK already checks args against the schema; this guard is a second line of defense.
            // Return errors as a tool result (isError), not an exception, so the LLM can read it and retry.
            return CallToolResult.builder().isError(true)
                    .addTextContent("status must be one of " + STATUSES).build();
        }
        List<Order> found = ORDERS.stream().filter(o -> o.status().equals(status)).toList();
        String list = found.stream()
                .map(o -> o.reason().isEmpty() ? o.id() : o.id() + " (" + o.reason() + ")")
                .collect(Collectors.joining(", "));
        return CallToolResult.builder()
                .addTextContent(found.size() + " " + status + " orders" + (found.isEmpty() ? "" : ": " + list))
                .build();
    }

    // Step 3: start the server on stdio. stdout carries JSON-RPC, so log only to stderr.
    public static void main(String[] args) {
        var transport = new StdioServerTransportProvider(McpJsonDefaults.getMapper());
        McpServer.sync(transport)
                .serverInfo("orders-server", "1.0.0")
                .capabilities(ServerCapabilities.builder().tools(true).build())
                .tools(SyncToolSpecification.builder()
                        .tool(findOrdersTool())
                        .callHandler((exchange, request) -> findOrders(request.arguments()))
                        .build())
                .build();
        System.err.println("orders-server ready on stdio");
    }
}
```

Tested with SDK 2.2.0: the SDK’s own stdio client started this server, did the handshake, listed the tool, and called it with good, unknown and missing arguments.

**Plug it into VS Code (GitHub Copilot agent mode)**

```json
// .vscode/mcp.json
{
  "servers": {
    "orders": {
      "type": "stdio",
      "command": "java",
      "args": ["-jar", "C:/tools/orders-mcp.jar"]
    }
  }
}
```

Now ask Copilot “Which orders failed?” It calls `find_orders` and answers from the result.

**What goes over the wire (real capture)**

```
→ {"jsonrpc":"2.0","id":3,"method":"tools/call",
   "params":{"name":"find_orders","arguments":{"status":"failed"}}}
← {"jsonrpc":"2.0","id":3,"result":{"content":[{"type":"text",
   "text":"2 failed orders: A1 (payment timeout), A3 (card declined)"}],"isError":false}}
```

**Tips that make a good MCP server**

- **Few, clear tools.** Verb names (`find_orders`), descriptions that say when to use them, enums instead of free text.
- **Never print to stdout** on stdio, because it corrupts the JSON-RPC stream. Log to stderr.
- **Safe by default.** Read-only tools and a least-privilege DB user; ask the user before any write.
- **Small results.** Limit or page the output; the LLM’s context window is small and costly.
- **Remote server?** Use Streamable HTTP with OAuth and Origin checks.

Note: MCP’s newest spec (2026-07-28) is stateless with no handshake; SDK 2.2 calls it the “modern” server. This example uses the 2025-11-25 version with the handshake; pick the version your AI app supports.

</details>

<details>
<summary><strong>G17 · LangChain vs LangGraph: what are they, and when do you use which?</strong> — Likely · named in JD</summary>

**In short:** **LangChain** is the toolkit: one interface for any model, tool or retriever, plus a ready agent loop (`create_agent`). **LangGraph** is the engine underneath, for custom, long-running flows with saved state. **LangSmith** traces and evaluates both.

![LangChain vs LangGraph: who does what](diagrams/mongo34_wb43_langchain_vs_langgraph_who_does.svg)

*LangChain’s agent runs on LangGraph, so you can start simple and drop down a level when you need more control.*

| Name | What it is | Use it when | Example |
|---|---|---|---|
| **LangChain** | Agent framework: models, tools, retrievers, and `create_agent` with **middleware** (human approval, summarizing long chats, PII masking) | A standard “LLM + tools” agent or a RAG app, built fast | A Q&A bot over docs in MongoDB |
| **LangGraph** | Low-level runtime: you draw the flow as a **graph** over shared state; it saves every step | Custom steps, loops, human approval, resume after a crash, multi-agent | A refund agent that waits for a manager (G18) |
| **LangSmith** | Platform for traces, evals, prompt versions and deployment; works with any framework | Debugging and measuring quality in production | See every LLM and tool call, with its cost |
| **Deep Agents** | A ready **harness** on top: planning, sub-agents, file tools (see G21) | Long, multi-step tasks | A research agent that writes a report |

**Rule of thumb:** start with `create_agent`; move to LangGraph when the flow needs control. They mix: a `create_agent` agent can be one node inside a LangGraph graph.

**Open source?** LangChain, LangGraph and Deep Agents are free (MIT license). LangSmith is a paid platform with a free tier, and self-hosting LangGraph’s Agent Server in production needs a license.

LangChain and LangGraph are Python/JS first. In Java, similar ideas come from LangChain4j, LangGraph4j and Spring AI.

</details>

<details>
<summary><strong>G18 · How does LangGraph work? (state, nodes, edges, checkpoints)</strong> — Likely</summary>

**In short:** you define a shared **state**, **nodes** (functions that update it) and **edges** (what runs next). Compile it with a **checkpointer**, and every step is saved, so the run can pause for a human and resume later, even after a crash.

![LangGraph example: a refund agent that waits for a human](diagrams/mongo34_wb44_langgraph_example_refund_agent_that.svg)

*A refund agent: the agent ↔ tools loop, a conditional route, and a human approval step. Every step is saved in MongoDB.*

| Block | What it does | In the refund example |
|---|---|---|
| **State** | Shared, typed data. Each node returns only what it changes; **reducers** merge it (e.g. messages are appended) | `messages`, `order_id`, `approved` |
| **Node** | A plain function: an LLM call, a tool, or normal code | agent, tools, approve_refund, issue_refund |
| **Edge** | What runs next. A **conditional edge** is a function that picks the next node; loops are allowed | agent → tools → agent; route → approve or END |
| **Checkpointer** | Saves the state after every step, keyed by `thread_id` | `MongoDBSaver` in Atlas |
| **Interrupt** | `interrupt()` pauses the run; you resume it later with `Command(resume=…)` | The manager approves the refund |

**Walk-through: “Refund my order A1”**

1. The agent calls `find_order` and the policy tool (the agent ↔ tools loop).
2. The router sends it to `approve_refund`, which calls `interrupt()`. The run stops, and the state is already in MongoDB.
3. Next day a manager clicks Approve. The app resumes the same `thread_id` → `issue_refund` → END.

**Why not a plain while loop?** You’d have to build save/resume, approvals, streaming and retries yourself. A plain loop (like L2) is fine for simple agents.

</details>

<details>
<summary><strong>G19 · How do LangChain and LangGraph use MongoDB?</strong> — Likely · MongoDB angle</summary>

**In short:** the `langchain-mongodb` packages (Python, plus JS) let one Atlas cluster be the agent’s **search index, memory and cache**.

| Need | Component | What it does |
|---|---|---|
| RAG search | `MongoDBAtlasVectorSearch` | Vector store; `.as_retriever()` gives a retriever. Needs a Vector Search index |
| Keyword + meaning | `MongoDBAtlasHybridSearchRetriever` | Merges vector and full-text results with RRF |
| Keyword only | `MongoDBAtlasFullTextSearchRetriever` | BM25 search using MongoDB Search |
| Small chunk → full context | `MongoDBAtlasParentDocumentRetriever` | Searches small chunks, returns the bigger parent document |
| GraphRAG | `MongoDBGraphStore` | Entities and relations as documents, queried with <code>&#36;graphLookup</code> |
| Short-term memory | `MongoDBSaver` (LangGraph) | Checkpoints per thread: resume, human-in-the-loop |
| Long-term memory | `MongoDBStore` (LangGraph) | Memories shared across threads, searchable by meaning |
| Lower cost | `MongoDBCache`, `MongoDBAtlasSemanticCache` | Reuse answers for the same or a similar prompt |

**Pitch:** one database for app data, vectors, agent state and memory, so there are fewer systems to keep in sync.

</details>

<details>
<summary><strong>G20 · Quick follow-ups on LangChain &amp; LangGraph</strong> — Likely</summary>

- **Chain vs agent vs graph?** A chain runs fixed steps. An agent lets the LLM pick the next step in a loop. A graph lets you draw the allowed steps while the LLM decides within them.
- **Short-term vs long-term memory?** Short-term = the thread’s state in the checkpointer. Long-term = a **store** shared across threads (e.g. “user prefers email”).
- **Multi-agent?** A **supervisor** node routes work to specialist sub-agents (subgraphs), or agents hand off to each other.
- **Stop runaway loops and cost?** Set `recursion_limit`, cap tool calls and tokens, and add middleware for summarizing and approvals.
- **Gotcha on resume:** after an interrupt, the paused node **runs again from its start**, so keep side effects before `interrupt()` idempotent, or move them to the next node.
- **In production:** a durable checkpointer (MongoDB, not in-memory), idempotent tools, streaming to the UI, LangSmith traces and evals in CI.
- **Downsides?** Extra layers, fast-changing APIs and harder debugging. Pin versions, trace everything, and use the simplest option that passes your evals.

</details>

<details>
<summary><strong>G21 · What is an agent harness? (framework vs runtime vs harness)</strong> — Likely · trending</summary>

**In short:** a **harness** is everything wrapped around the model that turns it into a working agent: the loop, tools, prompts, planning, sub-agents and context management. **Agent = model + harness.** The name comes from a horse harness: the horse has the power, and the harness lets you steer it.

![Agent = model + harness](diagrams/mongo34_wb45_agent_model_harness.svg)

*The model in the middle only predicts text. The harness around it plans, acts, remembers and stays safe.*

**What’s inside a harness**

| Part | What it does | Example |
|---|---|---|
| **Agent loop** | Think → use a tool → check → repeat until done | Fix a failing test, re-run it, repeat |
| **Tools** | Actions the model can take | Read/edit files, run shell commands, web search, MCP servers |
| **System prompt** | Role, rules and how to use the tools | “Run the tests before saying you’re done.” |
| **Planning** | A to-do list for big tasks | 1) find the bug 2) fix it 3) add a test |
| **Sub-agents** | Hand a side task to a fresh agent, so the main context stays clean | “Search the codebase for X and report back.” |
| **Context management** | Summarize old chat; move big tool outputs into files | A 50k-line log goes to a file; only a summary stays in context |
| **Safety** | Ask before risky steps; sandbox | “Allow `git push`?” |

**Framework vs runtime vs harness**

| Type | Simple meaning | Examples |
|---|---|---|
| **Framework** | Parts plus a basic agent loop; **you assemble** the agent | LangChain, OpenAI Agents SDK, Google ADK, CrewAI, LlamaIndex |
| **Runtime** | Runs it reliably: save, resume, pause for a human, stream | LangGraph, Temporal, Inngest |
| **Harness** | A ready agent with tools, prompts, planning and sub-agents built in; **you mostly configure** it | Deep Agents SDK, Claude Agent SDK, coding CLIs (GitHub Copilot CLI, Claude Code) |

**When to use which:** a simple bot → framework; a custom, long-running flow with approvals → runtime; a complex, open-ended task (research, coding) → harness.

**Real example:** GitHub Copilot CLI is a harness. It gives the model a loop, tools (shell, edit, search), planning, sub-agents, context compaction and permission prompts. That’s why the same model does much more there than in a plain chat.

**Interview angle:** results depend on the harness as much as on the model. Much of agent work today is **harness / context engineering**: better tools, prompts and context, measured with evals.

</details>

### 34.9C · MongoDB + AI topics (what MongoDB interviewers dig into)

> [!NOTE]
>
> **Know the 2025–26 news:** MongoDB **acquired Voyage AI** (embedding and reranking models, 2025). It launched the **Embedding & Reranking API on Atlas** with the **Voyage 4** models (Jan 2026), and **Automated Embedding** in Vector Search went **GA in Aug 2026**. Hybrid search uses <code>&#36;rankFusion</code> (8.0+) and <code>&#36;scoreFusion</code> (8.3+), and the official **MongoDB MCP Server** connects AI agents to databases. Mentioning these shows real interest.

<details>
<summary><strong>V1 · Why keep vectors in MongoDB instead of a separate vector database?</strong> — Likely · MongoDB</summary>

- **One document holds it all:** the text, embedding, metadata, ACL and operational fields. There’s no sync pipeline to a second database. You still re-embed when text changes (or let Automated Embedding do it), and search indexes update asynchronously, usually within seconds.
- **Filter on any field** in the same query (tenant, ACL, date), and join with operational data in the aggregation pipeline.
- **One** security model, backup, scaling story and query language. With Automated Embedding, MongoDB even creates and syncs the vectors.
- **Search Nodes** run search and vector workloads separately from the database nodes, so they scale independently.
- **Honest trade-off:** a specialist vector DB may offer niche tuning. At extreme scale, benchmark recall, latency and cost on *your* data.

</details>

<details>
<summary><strong>V2 · How does MongoDB Vector Search work?</strong> — Reported · vector search</summary>

1. Create a **vectorSearch index** on the embedding field: `numDimensions`, `similarity` (cosine, dotProduct or euclidean), plus **filter** fields.
2. It builds an **HNSW** graph for approximate nearest-neighbor search. Search indexes are maintained by the search process (`mongot`), asynchronously from the data, so they are **eventually consistent**.
3. Query with <code>&#36;vectorSearch</code>, which must be the **first stage**. `numCandidates` controls how much of the graph is explored (recall vs latency) and `limit` how many results come back. Add `filter` for pre-filtering, or `exact: true` for brute-force ENN (small sets or ground truth).
4. Read the similarity with <code>{ &#36;meta: "vectorSearchScore" }</code>; continue the pipeline with <code>&#36;project</code>, <code>&#36;lookup</code> and so on.

Index and query examples: P4 (section 6).

</details>

<details>
<summary><strong>V3 · HNSW vs IVF vs flat: what are the trade-offs?</strong> — Reported · vector search</summary>

| Index | How it works | Good | Bad |
|---|---|---|---|
| Flat (exact) | Compare the query with every vector | Perfect recall, simple | O(N): slow at scale |
| IVF | Cluster the vectors; search only the nearest clusters | Less memory, fast | Needs training; recall depends on the clusters probed; drifts as data changes |
| **HNSW** | Layered “small-world” graph with a greedy walk from the top layer | High recall at low latency; handles inserts | Memory-hungry (vectors + graph in RAM); slower builds |
| PQ / quantization | Compress the vectors | 4–32× less memory | Lossy: rescore with full vectors |

**The knob:** HNSW’s search breadth (`numCandidates` in MongoDB). Measure **recall@10 against exact search** on a sample, then pick the smallest value that meets your recall target.

</details>

<details>
<summary><strong>V4 · Vector quantization in MongoDB: scalar vs binary</strong> — Likely · MongoDB</summary>

- Turned on in the **index definition** with `"quantization": "scalar"` (int8, \~4× less memory, near-lossless) or `"binary"` (1 bit per dimension, \~32× less).
- MongoDB keeps the full-fidelity vectors for **rescoring**. With binary, raise `numCandidates` to win back recall.
- Quantization-aware embedding models (e.g. Voyage) keep recall high after compression.

```json
{
  "fields": [
    { "type": "vector", "path": "embedding", "numDimensions": 1024,
      "similarity": "dotProduct", "quantization": "scalar" },
    { "type": "filter", "path": "tenantId" },
    { "type": "filter", "path": "acl" }
  ]
}
```

</details>

<details>
<summary><strong>V5 · Hybrid search in MongoDB: combining vector and keyword results</strong> — Reported · vector search</summary>

- <code>&#36;rankFusion</code> (MongoDB 8.0+): runs several sub-pipelines (e.g. <code>&#36;vectorSearch</code> and <code>&#36;search</code>) and merges them with **Reciprocal Rank Fusion** (rank constant 60), with optional weights.
- <code>&#36;scoreFusion</code> (8.3+): merges by **actual scores**, with normalization. Use it when score size matters, not just order.
- Both work within **one collection**. Across collections, use <code>&#36;unionWith</code>.

```javascript
db.chunks.aggregate([
  { $rankFusion: {
      input: { pipelines: {
        vector: [ { $vectorSearch: { index: "vec_idx", path: "embedding",
                    queryVector: qVec, numCandidates: 200, limit: 20,
                    filter: { tenantId: "acme" } } } ],
        text:   [ { $search: { index: "text_idx",
                    text: { query: "E11000 duplicate key", path: "text" } } },
                  { $limit: 20 } ]
      } },
      combination: { weights: { vector: 0.6, text: 0.4 } }
  } },
  { $limit: 5 }
])
```

</details>

<details>
<summary><strong>V6 · Why did MongoDB buy Voyage AI? What does it give developers?</strong> — Likely · MongoDB</summary>

- **Retrieval quality is the biggest lever on RAG quality**, and Voyage builds top-ranked **embedding and reranking** models. Owning them puts the quality layer right next to the data.
- **Embedding & Reranking API on Atlas** (public preview Jan 2026): Voyage models usable from any stack.
- **Voyage 4 series:** models share **one embedding space**, so you can embed documents with a large model and queries with a lite one. Flexible dimensions (256–2048) and quantization; domain models (code, law, finance), multimodal, and rerankers.
- **Automated Embedding** (GA Aug 2026): pick a model (voyage-4-large, voyage-4, voyage-4-lite, voyage-code-3) in the vector index, and MongoDB generates and **keeps embeddings in sync** as data changes.

**Answer to give:** “Fewer moving parts and better retrieval: data, vectors, embeddings and reranking on one platform, which means less hallucination and less glue code.”

</details>

<details>
<summary><strong>V7 · How would you model RAG data in MongoDB?</strong> — Likely · MongoDB</summary>

```javascript
// collection: chunks (one document per chunk)
{
  _id: ObjectId("..."),
  docId: "wiki/oncall-runbook",            // parent document (referenced, not embedded)
  chunkNo: 7,
  text: "Escalate Sev1 incidents to the duty manager within 15 minutes...",
  embedding: [0.012, -0.044, ...],          // or let Automated Embedding create it
  source: { title: "On-call runbook", section: "Escalation", url: "https://..." },
  tenantId: "acme", acl: ["sre", "eng-leads"],
  updatedAt: ISODate("2026-11-10T08:00:00Z"),
  embeddingModel: "voyage-4", chunkerVersion: 3
}
```

- **Chunks reference the parent** (`docId`). A document has an unbounded number of chunks, so don’t embed them in one array (16 MB limit).
- Index `tenantId`, `acl` and `updatedAt` as **filter** fields in the vector index. For hybrid search, also create a **MongoDB Search** (Atlas Search) index for the keyword side (not the legacy text index).
- On update: **delete by `docId`, then insert the new chunks** (idempotent). Store model and chunker versions for safe re-embedding.

</details>

<details>
<summary><strong>V8 · How do you keep embeddings fresh when the data keeps changing?</strong> — Reported · vector search</summary>

- **Easiest:** Automated Embedding, where MongoDB re-embeds changed fields itself.
- **Do-it-yourself:** a **change stream** (or Atlas Trigger) on the source collection → re-chunk and embed only changed docs → upsert chunks → delete removed ones. Use resume tokens for crash safety.
- **Skip unchanged text:** store a hash of the chunk text and re-embed only when it changes.
- **Search indexes are eventually consistent**: a write appears in search results shortly after. Design for that; don’t promise read-your-write in search.
- **Changing the embedding model:** new field + new index → backfill in batches → switch queries → drop the old ones.

</details>

<details>
<summary><strong>V9 · Design vector search for 1B embeddings with p99 &lt; 50 ms</strong> — Reported · senior design</summary>

1. **Memory math first:** 1B × 1024 dims × 4 bytes ≈ **4 TB** as float32 → scalar quantization ≈ 1 TB → binary ≈ 128 GB. HNSW wants vectors in RAM, so quantize (V4) and/or cut dimensions (e.g. 512).
2. **Shard** to spread data and index memory. Note: vector queries on a sharded cluster are **scatter-gather** (every shard’s search node answers, then `mongos` merges), even with a shard-key filter; zones can limit this to a subset of shards. So p99 = the slowest shard + merge. Scale with dedicated **Search Nodes**, and give very large tenants their own collection or cluster.
3. **Pre-filter** by tenant or ACL to shrink the search space.
4. **Tune** `numCandidates` for the recall target (e.g. ≥ 0.95 recall@10 against exact search on a sample) and measure p99 under load.
5. **Latency budget:** query embedding (cache popular queries) + search + optional rerank must fit in 50 ms. That may mean skipping the reranker or using a lite one.
6. **Ingest:** batch embeddings; asynchronous indexing; monitor indexing lag and recall drift.

</details>

<details>
<summary><strong>V10 · Agent memory with MongoDB</strong> — Likely · MongoDB</summary>

| Memory type | What | In MongoDB |
|---|---|---|
| Short-term | The current thread’s messages and agent state | Checkpoint documents per step (LangGraph checkpointer); TTL index to expire them |
| Long-term | User facts and preferences | Documents + vector index to recall the relevant ones each turn |
| Episodic | Past runs and outcomes | Run logs; retrieve similar past cases (“last time this alert fired…”) |

Isolate per user/tenant, summarize old turns (L3), and support deletion. MongoDB integrates with LangChain, LangGraph and LlamaIndex.

</details>

<details>
<summary><strong>V11 · Text-to-MQL and the MongoDB MCP Server: querying data in natural language</strong> — Likely · MongoDB</summary>

- **MongoDB MCP Server** (official): lets AI clients (Claude, Copilot, Codex, any MCP agent) explore data, run queries and manage Atlas in natural language. It works with Atlas, Community and Enterprise. Governance includes **read-only mode**, per-config roles and org-level opt-in.
- **Making NL → query safe and accurate:**
  - Give the model sampled schema, field descriptions and a few examples.
  - Generate an aggregation pipeline.
  - **Validate it:** parse it, allow-list stages (no <code>&#36;out</code>/<code>&#36;merge</code>), force a <code>&#36;limit</code> and `maxTimeMS`.
  - Run it as a **read-only, least-privilege** user, and show the query to the user.
  - Evaluate on a set of questions with known results.
- **When it beats RAG:** exact numbers and aggregates (“how many SEV1s last week by service?”).

</details>

<details>
<summary><strong>V12 · Why is MongoDB a good fit for AI apps? (the pitch)</strong> — Likely · HM / director</summary>

1. The **document model** fits messy, evolving AI data: LLM JSON outputs, chunks, traces, agent state.
2. **Operational data + vectors + text search in one place**, with no sync pipelines.
3. **Voyage AI** embeddings and rerankers, plus Automated Embedding, for better retrieval with less glue code.
4. **Change streams** for real-time pipelines, and **sharding** for scale.
5. Agent ecosystem: the **MCP Server** and LangGraph/LangChain integrations.

Then tie it to the team: “The EA AI team can prototype on the same platform customers use, and turn what we learn into proof points.”

</details>

<details>
<summary><strong>V13 · Other AI topics to skim before the loop</strong> — Likely</summary>

- **MCP vs function calling:** function calling is how one model calls your code; MCP is a *standard protocol* so any client can discover and use any tool server.
- **Agent-to-agent / multi-agent:** an orchestrator is easier to debug than peers chatting freely; use a shared task ledger.
- **Context engineering:** choose what goes into the window (instructions, memory, retrieved docs, tool results) and in what order. It’s now as important as prompting.
- **Guardrails and evals in CI:** L5 and L9.
- **AI for developers:** coding agents, AI code review, and how you’d measure their impact (cycle time, defect rate, adoption), since this team serves internal engineering.
- **Responsible AI:** privacy, bias, transparency (citations), and a human in the loop for consequential actions.

</details>

## 34.10 AI / LLM questions: 30-second answers

The JD asks for hands-on **evals, fine-tuning, RAG, tool use and orchestration**, plus awareness of transformer internals. These questions are likely in the HM, design and director rounds. The answers here are the short, say-it-out-loud versions; each links to its deep dive in sections 4 and 9.

<details>
<summary><strong>A1 · RAG vs fine-tuning vs prompting: when do you use each?</strong> — Likely</summary>

- **Prompting first:** cheapest and fastest to iterate.
- **RAG** when the model needs facts it doesn’t know or that change (internal docs). You update by re-indexing, and you get citations.
- **Fine-tuning** for a behavior, format or style, or to run a narrow task cheaper on a small model. It needs good labeled data, and it **doesn’t reliably teach facts**.
- Often you combine them: RAG for knowledge plus a light fine-tune (LoRA) for format. **Let evals decide**, not opinions.

Deep dive: F7 · G9

</details>

<details>
<summary><strong>A2 · Walk through a RAG pipeline. Where does it fail?</strong> — Likely</summary>

**Ingest** → parse → chunk → embed → index. **Query** → rewrite → retrieve top-k → rerank → prompt with context → generate with citations.

**Failure points:** bad parsing (tables, PDFs); chunks too big or too small; exact codes/IDs missed (fix: hybrid search); wrong k; stale index; too much context (“lost in the middle”); the model ignoring the context (hallucination). **Debug retrieval and generation separately.**

Deep dive: G3 · G11

</details>

<details>
<summary><strong>A3 · How do you choose a chunking strategy?</strong> — Likely</summary>

Chunk by **document structure** (headings, sections, functions), not fixed bytes. 200–800 tokens with 10–20% overlap is typical. Add context (title, section path) to each chunk. Small chunks give precise retrieval; big chunks give more context, so **tune with recall@k** on your eval set. Parent-child retrieval: search small chunks, return the bigger parent.

Deep dive: G4

</details>

<details>
<summary><strong>A4 · How do you evaluate a RAG system?</strong> — Likely</summary>

- **Golden set** of 50–200 real questions with expected answers and sources, including **unanswerable** ones.
- **Retrieval:** recall@k, MRR/nDCG.
- **Generation:** faithfulness (claims supported by the context), correctness, relevance, citation accuracy, and correct “I don’t know”.
- **Methods:** programmatic checks where possible; otherwise an LLM-as-judge with a rubric, calibrated against human labels.
- Report by **slice**; run on every change in CI. Online: thumbs, escalations, no-answer rate. Tools: RAGAS, DeepEval, promptfoo, LangSmith.

Deep dive: G10

</details>

<details>
<summary><strong>A5 · How do you evaluate an agent?</strong> — Likely</summary>

- **Task success** on realistic tasks: check the end state, not the text.
- **Trajectory:** right tools, valid arguments, number of steps, loops.
- **Cost, latency, tokens** per task.
- **Safety:** forbidden actions attempted, approvals respected.
- **Reliability:** run each task several times (pass^k), because agents are non-deterministic.
- Replay past cases in a **sandbox with mocked tools**, and read the traces for error analysis.

Deep dive: AG10 · L9

</details>

<details>
<summary><strong>A6 · LLM-as-judge: what are the pitfalls, and how do you fix them?</strong> — Likely</summary>

**Pitfalls:** position bias, verbosity bias, self-preference (same model family), inconsistent scores, gameable judges.

**Fixes:** a clear rubric with examples; binary or small score scales; reasoning before the score; swap the order in pairwise comparisons; a **different model** as judge; **calibrate on \~100 human-labeled items** and measure agreement; spot-check regularly.

Deep dive: L9

</details>

<details>
<summary><strong>A7 · Agent vs workflow: when do you need an agent?</strong> — Likely</summary>

Use a **workflow** (fixed steps, with the LLM inside steps) when the path is known: it is cheaper, more predictable and testable. Use an **agent** (the LLM picks the next step or tool in a loop) when steps vary per input and need exploration. Start simple, and add autonomy only where evals show a gain. Always set step and budget limits, and require approval for side effects.

Deep dive: AG2

</details>

<details>
<summary><strong>A8 · How does tool / function calling work? What is MCP?</strong> — Likely</summary>

- You give the model tool names plus **JSON schemas**. The model returns a structured tool call. **Your code** validates and runs it and returns the result as a message. Repeat until the model answers. The model never executes anything itself.
- **Good tools:** few, narrow, well described, typed arguments, helpful errors, idempotent.
- **MCP (Model Context Protocol):** an open client-server standard (JSON-RPC) that lets any AI app plug into tools and data sources without a custom integration each time. Full answer with a diagram: **G15**.

</details>

<details>
<summary><strong>A9 · What is LangGraph, and why use it?</strong> — Likely · named in JD</summary>

- Build agents as **graphs**: nodes (LLM calls, tools, functions) and edges (conditional, with cycles) over a **shared typed state**.
- **What you get:** explicit control flow; **checkpointing** (resume, time-travel debugging, human-in-the-loop approval); streaming; multi-agent patterns.
- MongoDB has an integration for storing LangGraph checkpoints and long-term memory.
- **Alternatives:** a plain code loop, OpenAI Agents SDK, Semantic Kernel, AutoGen, CrewAI. The simplest option that passes your evals wins.
- More, with diagrams: **G17–G21** (LangChain vs LangGraph, how LangGraph works, MongoDB integrations, follow-ups, agent harness).

</details>

<details>
<summary><strong>A10 · How do you reduce hallucinations?</strong> — Likely</summary>

Ground answers with retrieval. Instruct “answer only from the context, otherwise say I don’t know”. **Require citations and check they support the claims.** Lower the temperature and use structured outputs. **Skip generation when the retrieval score is low** (see MiniRag in P4). Add a verification step, measure the hallucination rate on your eval set, and verify actions via tools rather than trusting the model’s memory.

Deep dive: F8

</details>

<details>
<summary><strong>A11 · How do you defend against prompt injection?</strong> — Likely</summary>

Use **defense in depth**; no single fix works:

- Treat all retrieved and tool content as **untrusted data**; separate instructions from data.
- **Least-privilege** tools and credentials; **human approval** for risky actions.
- Filter outputs: no secrets or PII, allow-listed URLs only.
- Never let model output directly trigger privileged actions.
- Add red-team cases to the eval set, and monitor in production.

Deep dive: L5 · AG9

</details>

<details>
<summary><strong>A12 · How do you cut LLM cost and latency?</strong> — Likely</summary>

**Measure first** (tokens per request, p95). Then: route easy cases to a smaller model; **prompt caching** (stable prefix); response or semantic caching; shorter prompts and a tighter top-k; batch offline jobs; stream output; run tool calls in parallel; cap output tokens; distill or fine-tune a small model for high-volume narrow tasks.

Deep dive: F5 · L7 · L10

</details>

<details>
<summary><strong>A13 · Transformer basics: attention, KV cache, context window</strong> — Likely · JD: “model internals”</summary>

- Text → **tokens** → embeddings plus positions → stacked layers of **self-attention** (each token weighs earlier tokens: softmax(QKᵀ/√d)·V) and feed-forward blocks.
- Decoder-only models generate **one token at a time**. The **KV cache** stores past keys and values so they aren’t recomputed: faster, but memory grows with context.
- Attention cost grows roughly **quadratically** with length, so long contexts cost more and can “lose the middle”.
- Temperature and top-p control sampling randomness.

Deep dive: F4 · F5

</details>

<details>
<summary><strong>A14 · Embeddings and vector search: how does ANN work?</strong> — Likely</summary>

- An embedding is a vector of meaning; similar text lands nearby (cosine or dot product).
- Exact kNN compares against everything (O(N)). **ANN** trades a little recall for speed: **HNSW** (a layered proximity graph with a greedy walk; used by Atlas Vector Search), IVF (clusters), PQ/quantization (compression).
- **Tuning:** more candidates (efSearch, `numCandidates`) → higher recall and higher latency. Measure recall against exact search on a sample.

Deep dive: F3 · V2 · V3

</details>

<details>
<summary><strong>A15 · How do you decide to kill or continue a prototype?</strong> — Likely · literally the job</summary>

1. **Before building:** hypothesis, success metric, **kill criteria**, time box (e.g. 2 weeks).
2. The thinnest prototype on a **real** internal use case.
3. **Evaluate against a baseline** (today’s process or no AI): quality, time saved, cost per run, failure modes, risk.
4. **Decide:** *Kill* (didn’t beat the baseline, too costly or unsafe), *Iterate* (close, with a clear next lever), or *Hand off* (meets the bar and has an owner).
5. **Write it up either way**, so the organization learns. Killed experiments are useful output too.

Deep dive: AG10

</details>

<details>
<summary><strong>A16 · What does handing off a prototype to production require?</strong> — Likely · in JD</summary>

- A doc covering the problem, results, evals and known limits.
- **An eval suite and datasets** the owning team can run in CI.
- Clean interfaces, plus cost and latency budgets.
- Security and privacy review: data access, PII, prompt injection.
- Observability: traces, metrics, user feedback.
- An ops plan: on-call, pinned model versions, a **fallback** when the model or API fails.
- A rollout plan: feature flag, canary or A/B test.

Deep dive: K6 · AG10

</details>

<details>
<summary><strong>A17 · How do you keep up with AI?</strong> — Likely · in JD</summary>

Describe concrete habits: release notes from the major labs and frameworks; a few papers or newsletters a week; **re-running new models on your own eval set** (not just public benchmarks); small weekend prototypes; sharing write-ups internally. Then give **one recent thing you tried and its result**.

</details>

<details>
<summary><strong>A18 · Fine-tuning: what is LoRA, and when is it worth it?</strong> — Likely · in JD</summary>

**LoRA** trains small low-rank adapter matrices on top of frozen weights: cheap, small to store, swappable per task. It’s worth it for **high-volume narrow tasks** (a smaller model saves cost and latency), consistent format or style, or domain language. You need hundreds to thousands of quality examples, and it **must beat prompting + RAG on your evals**. Risks: overfitting, forgetting, and retraining whenever the base model changes.

Deep dive: F7

</details>

<details>
<summary><strong>A19 · How do you get reliable structured output?</strong> — Likely</summary>

Use native structured-output / JSON-schema mode or tool calling. **Validate against a schema** (Jackson + bean validation in Java), and on failure **retry with the validation error**. Keep schemas small and flat, use enums for categories, use low temperature, and track the parse-failure rate in evals.

Deep dive: L8

</details>

<details>
<summary><strong>A20 · How do you test non-deterministic LLM features?</strong> — Likely</summary>

Unit-test the deterministic parts (parsers, tools). Use an **eval suite with pass thresholds** (e.g. ≥ 90%) instead of exact matches. Run several samples and track variance, **pin model versions**, add a regression gate in CI for prompt and model changes, and sample production traffic for human review.

Deep dive: L12 · L9

</details>

## 34.11 Director / VP round (senior roles)

<details>
<summary><strong>D1 · What separates a strong senior engineer from an average one?</strong> — Reported</summary>

1. **Picks the right problem**: impact over activity.
2. **Handles ambiguity**: turns vague goals into a written plan.
3. **Makes others better**: reviews, mentoring, docs.
4. **Owns outcomes end to end**, including operations.
5. **Explains trade-offs** clearly to non-engineers.
6. **Intellectual honesty**: data over ego; kills their own ideas.

Then give **one example of yourself** doing two of these.

</details>

<details>
<summary><strong>D2 · How do you handle a goal with no clear spec?</strong> — Reported</summary>

Write the problem down, list assumptions and open questions, talk to the users, build the smallest thing that tests the riskiest assumption, and set checkpoints with stakeholders. Share progress early, even when it’s messy.

</details>

<details>
<summary><strong>D3 · How do you influence teams you don’t manage?</strong> — Likely · team partners org-wide</summary>

Understand their goals and pain first. Bring **evidence** (a working prototype plus eval numbers), not opinions. Make adoption easy with docs, clean code and office hours. Give them credit, find a champion, and start with a small pilot before expanding.

</details>

<details>
<summary><strong>D4 · How would you pick which AI experiments to run first?</strong> — Likely</summary>

Score each candidate on **impact** (hours saved × people, risk reduced) × **feasibility** (data access, what models can do today) × **learning value**. Prefer painful real workflows with a measurable baseline. Time-box each experiment, mix quick wins with a few bets, and review the portfolio monthly.

</details>

<details>
<summary><strong>D5 · Where will AI change internal engineering in the next 2 years?</strong> — Likely</summary>

Coding agents for routine changes (migrations, tests, dependency upgrades) with human review; incident-triage agents; knowledge assistants over internal docs; AI-assisted code review; eval-driven development as standard practice. Caveats: reliability, security and cost all need evals and guardrails, and **humans stay accountable**.

</details>

## 34.12 Questions to ask them

<div class="md-cards">

<div class="md-card">

#### Hiring manager

- How are experiments chosen, and who are the internal “customers”?
- What would success look like for me after 6 months?
- Can you share an example of a validated idea that was handed off? How did it go?
- Which models and tools can we use? Any data-access constraints?
- How is time split between prototyping, writing and advising?

</div>

<div class="md-card">

#### Engineers / Director

- What was the last experiment you killed, and why?
- How do you evaluate experiments today?
- How big is the team in Gurugram vs other locations?
- How does this team’s AI work influence MongoDB’s roadmap?
- What is the team’s biggest risk this year?

</div>

</div>

## 34.13 7-day prep plan

| Day | Focus |
|---|---|
| 1 | Concurrency in Java: write C8–C12 from memory and explain every lock out loud. |
| 2 | Component problems C1–C7 (timed, 40 min each) and OOP O1–O3 (logger, parking lot). |
| 3 | **LLD, AI-focused:** rebuild L1, L2 and L3 from a blank file in 45 min each, interfaces first, with tests. |
| 4 | **Designing agents:** AG1–AG10. Design the PR review agent (AG3–AG4) and one automation (AG6) out loud. Then L4–L9 quick review and one LLD problem *with Copilot*, checked with X4. |
| 5 | Toolkit K1–K6, then system design out loud, 45 min each: S1, S5, S7. Then MongoDB M1–M17 (patterns, indexes, internals, security) and section 9 (F, G, V) + A1–A20. |
| 6 | Behavioral: write 8 STAR stories mapped to the six values (B1–B12, H1–H6) and two AI project stories with numbers. |
| 7 | One full mock loop, finalize your questions, rest. |

> [!TIP]
>
> **On the day:** clarify first · think aloud · test your code unprompted · state thread-safety assumptions · name trade-offs · keep an eye on time · be honest when you don’t know something (it’s one of their values).

## 34.14 Sources

- Job posting: [Senior Engineer – Enterprise Architecture (ZipRecruiter)](https://www.ziprecruiter.in/jobs/611328590-senior-engineer-enterprise-architecture-at-mongodb) · [Software Engineer 3 – Enterprise Architecture (MongoDB careers)](https://www.mongodb.com/careers/jobs/8221290)
- MongoDB: [How to prepare for your engineering interview at MongoDB](https://www.mongodb.com/company/blog/culture/recruiting-tips/how-prepare-your-engineering-interview-mongodb)
- Gurugram candidate report: [MongoDB | SWE3 | Gurgaon | Selected (LeetCode Discuss, 2026)](https://leetcode.com/discuss/post/7772003/mongodb-swe3-gurgaon-interview-selected-ivulh/)
- Glassdoor: [MongoDB Gurgaon interviews](https://www.glassdoor.co.in/Interview/MongoDB-Gurgaon-Interview-Questions-EI_IE433703.0,7_IL.8,15_IC2921225.htm) · [Sr Software Engineer questions](https://www.glassdoor.co.in/Interview/MongoDB-Sr-Software-Engineer-Interview-Questions-EI_IE433703.0,7_KO8,28.htm)
- Guides: [InterviewQuery](https://www.interviewquery.com/guides/mongodb-software-engineer) · [DesignGurus](https://www.designgurus.io/blog/mongodb-interview-guide) · [DesignGurus behavioral](https://www.designgurus.io/answers/detail/top-mongodb-behavioral-interview-questions-and-how-to-answer-them) · [SpaceComplexity behavioral](https://spacecomplexity.ai/blog/mongodb-behavioral-interview-questions) · [SupaCV](https://supacv.com/blog/interview-playbook/mongodb) · [TechPrep](https://www.techprep.app/companies/mongodb) · [DSAPrep](https://www.dsaprep.dev/blog/mongodb-coding-interview-questions) · [Dataford](https://dataford.io/interview-guides/mongodb/software-engineer) · [Algoroq](https://www.algoroq.io/interview-questions/mongodb/) · [techinterview.org](https://www.techinterview.org/companies/mongodb/) · [InterviewLegend](https://www.interviewlegend.com/guides/companies/mongodb/overview/hiring-decisions)
- AI interview topics: [UPenn Career Services: AI engineer questions (2026)](https://careerservices.upenn.edu/blog/2026/06/25/45-ai-engineer-interview-questions-answers-2026-guide/) · [awesome-ai-engineer-interview: agents](https://github.com/landedjobs/awesome-ai-engineer-interview/blob/main/questions/agents.md) · [LLD interview program (OOP to AI)](https://www.kazi-rahamatullah.com/blog/lld-interview-program)
- AI-assisted interviews: [PracHub: AI coding interview guide (2026)](https://prachub.com/resources/ai-coding-interview-guide) · [techinterview.org: using AI tools in interviews](https://www.techinterview.org/post/3233474910/using-ai-tools-tech-interviews-2026-canon/) · [HackerRank: interviewing engineers who use AI](https://www.hackerrank.com/blog/how-to-interview-engineers-who-use-ai-coding-assistants/) · [BSWEN: evaluating AI-assisted coding](https://docs.bswen.com/blog/2026-03-15-evaluate-ai-assisted-coding-skills/)
- MongoDB AI: [Hybrid search (<code>&#36;rankFusion</code> / <code>&#36;scoreFusion</code>)](https://www.mongodb.com/docs/vector-search/hybrid-search/hybrid-search-overview/) · [Automated Embedding (GA Aug 2026)](https://www.mongodb.com/company/blog/product-release-announcements/unlocking-ai-search-introducing-automated-embedding-in-mongodb-vector-search) · [Embedding & Reranking API + Voyage 4](https://www.mongodb.com/company/blog/product-release-announcements/introducing-the-embedding-and-reranking-api-on-mongodb-atlas) · [Vector quantization with Voyage](https://www.mongodb.com/company/blog/technical/scaling-vector-search-mongodb-atlas-quantization-voyage-ai-embeddings) · [MongoDB MCP Server](https://www.mongodb.com/docs/mcp-server/overview/) · [Is GraphRAG needed? (2026)](https://arxiv.org/abs/2606.25656v1)
- Microsoft Copilot memory (F14): [Manage Copilot personalization and memory](https://learn.microsoft.com/en-us/copilot/manage/copilot-personalization-memory) · [What Copilot remembers](https://support.microsoft.com/en-us/microsoft-365-copilot/personalize-what-microsoft-365-copilot-remembers) · [Copilot Studio Memory](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/memory-overview) · [Customer Conversation memory FAQ](https://learn.microsoft.com/en-us/microsoft-copilot-studio/faqs-memory-customer-conversation) · [Generative orchestration FAQ](https://learn.microsoft.com/en-us/microsoft-copilot-studio/faqs-generative-orchestration) · [Foundry threads](https://learn.microsoft.com/en-us/azure/foundry-classic/agents/concepts/threads-runs-messages) · [Agents SDK state](https://learn.microsoft.com/en-us/microsoft-365/agents-sdk/state-concepts) · [Agent Framework memory](https://learn.microsoft.com/en-us/agent-framework/user-guide/agents/agent-memory)
- Microsoft Copilot models (F15): [How Microsoft 365 Copilot works](https://learn.microsoft.com/en-us/microsoft-365/copilot/microsoft-365-copilot-architecture) · [Declarative vs custom engine agents](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/agents-overview) · [Copilot Studio: select a primary model](https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-select-agent-model) · [Bring your own model for prompts](https://learn.microsoft.com/en-us/microsoft-copilot-studio/bring-your-own-model-prompts) · [Anthropic models in Microsoft Online Services](https://learn.microsoft.com/en-us/microsoft-365/copilot/connect-to-ai-subprocessor)
- RAG in Copilot (G14): [Copilot Studio RAG](https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/retrieval-augmented-generation) · [Copilot Studio knowledge sources](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-copilot-studio) · [Semantic index for Copilot](https://learn.microsoft.com/en-us/microsoftsearch/semantic-index-for-copilot) · [Copilot Retrieval API](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/api/ai-services/retrieval/overview)
- MCP (G15): [MCP specification](https://modelcontextprotocol.io/specification/2026-07-28) · [MongoDB MCP Server read-only mode](https://www.mongodb.com/docs/mcp-server/local-mcp/configuration/enable-or-disable-features/) · [MCP Java SDK server guide (G16)](https://java.sdk.modelcontextprotocol.io/latest/server/) · [VS Code MCP servers](https://code.visualstudio.com/docs/copilot/customization/mcp-servers)
- LangChain, LangGraph & harnesses (G17–G21): [LangChain & LangGraph 1.0](https://www.langchain.com/blog/langchain-langgraph-1dot0) · [LangGraph overview](https://docs.langchain.com/oss/python/langgraph/overview) · [LangGraph interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts) · [Frameworks, runtimes and harnesses (G21)](https://docs.langchain.com/oss/python/concepts/products) · [MongoDB + LangChain](https://www.mongodb.com/docs/atlas/ai-integrations/langchain/) · [MongoDB + LangGraph](https://www.mongodb.com/docs/atlas/ai-integrations/langgraph/)
- Agent design (4D): [Building effective agents (workflow patterns)](https://www.anthropic.com/engineering/building-effective-agents) · [Agent Skills spec](https://agentskills.io/) · [Agent Skills in Microsoft Agent Framework](https://learn.microsoft.com/en-us/agent-framework/agents/skills) · [GitHub Agentic Workflows](https://docs.github.com/en/copilot/concepts/agent-capabilities/agent-powered-workflows-and-operations/about-github-agentic-workflows) · [gh-aw safe outputs](https://github.github.com/gh-aw/reference/safe-outputs/) · [OWASP Top 10 for Agentic Applications](https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/) · [Building a good agentic code reviewer](https://luismori.dev/article/how-to-build-a-good-agentic-code-reviewer/)
- MongoDB core (M12–M17): [Schema design patterns](https://www.mongodb.com/docs/manual/data-modeling/design-patterns/) · [Indexes](https://www.mongodb.com/docs/manual/indexes/) · [WiredTiger](https://www.mongodb.com/docs/manual/core/wiredtiger/) · [Causal consistency](https://www.mongodb.com/docs/manual/core/causal-consistency-read-write-concerns/) · [Schema validation](https://www.mongodb.com/docs/manual/core/schema-validation/) · [Queryable Encryption](https://www.mongodb.com/docs/manual/core/queryable-encryption/)
- Reported rounds (OOP, concurrency screen, slowness walkthrough): [Interview Query MongoDB SWE guide (2026)](https://www.interviewquery.com/guides/mongodb-software-engineer) · [techinterview MongoDB guide](https://www.techinterview.org/companies/mongodb/)
- Note: third-party guides aggregate candidate reports, and processes differ by team and office. Confirm details with your recruiter.
