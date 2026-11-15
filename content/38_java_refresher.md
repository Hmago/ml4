# Chapter 38 — Java Refresher: Core & DSA Toolkit

> "You haven't forgotten Java. You've just stopped reaching for it automatically. This chapter is about making it automatic again."

---

## What You'll Learn

After this chapter you will be able to:
- Declare every data structure DSA needs — arrays, strings, lists, maps, sets, stacks, queues, heaps, sorted maps, and your own nodes and graphs
- Reach for the right method without thinking — `getOrDefault`, `computeIfAbsent`, `floorKey`, `pollFirst`, `Arrays.fill`, `StringBuilder.reverse`
- Pick the right structure in seconds, and know what each operation costs
- Sort anything — arrays, lists, intervals, objects — with comparators that don't overflow
- Spot the silent traps — `Integer ==`, unboxing `null`, `int` overflow, `remove(int)`, `Arrays.asList(int[])`

**Every structure section has the same layout:** a one-page infographic → simple explanation → *at a glance* table → how to declare → useful methods (code with results) → DSA idioms → traps → a runnable program → quick checks.

**Markers:** ★★★ = know cold for interviews · ★★ = high priority · ★ = good to know. **Quick check** boxes: answer before you open them.

> **This chapter is the on-ramp to the DSA chapters, [Ch 31–31d — DSA in Java](#content/31_dsa_foundations).** Those chapters and their 400+ in-browser problems assume Java fluency; this chapter closes that gap. The *modern* language and ecosystem — records, sealed types, pattern matching, virtual threads, Spring Boot 4 — live in [Ch 38b — Modern Java](#content/38b_java_modern).

---

## 38.1 What Changed While You Were Away ★★

**Read this first if** you last wrote Java around 2022 (Java 8 or 11). For DSA almost nothing broke — a few one-liners now replace old boilerplate.

![What changed in Java for DSA. Timeline: Java 8 LTS 2014, 11 LTS 2018, 17 LTS 2021, 21 LTS 2023, 25 LTS 2025 (current), 26 and 27 non-LTS 2026, 29 LTS 2027 (planned). Unchanged, just reload: arrays and 2-D grids; String and StringBuilder; ArrayList, HashMap, HashSet; PriorityQueue, TreeMap; lambdas and comparators; == vs equals, int overflow. Backend only, see Ch 38b: virtual threads, sealed types, pattern matching switch, Spring Boot 4 with jakarta. Use the modern way: Stack becomes a Deque made with new ArrayDeque (Java 6); a key class with equals and hashCode becomes record Cell(int r, int c) (Java 16); list.get(list.size() - 1) becomes list.getLast() (Java 21); Arrays.asList(1, 2, 3) becomes List.of(1, 2, 3) (Java 9); a StringBuilder loop becomes "ab".repeat(3), giving ababab (Java 11); s.trim() becomes s.strip() (Java 11). LTS = 17 + 4k: 17, 21, 25, 29.](diagrams/java38_info_whats_changed_ai.png)

### 1. Release timeline

A new Java ships every six months; every fourth one is **LTS** (long-term support) — the one companies run.

```
Java 8   LTS  2014   lambdas, streams, Comparator.comparing
Java 11  LTS  2018   var, List.of, strip(), repeat(), isBlank()
Java 17  LTS  2021   records, Stream.toList(), switch ->, sealed
Java 21  LTS  2023   getFirst(), getLast(), reversed(),
                     pattern switch, virtual threads
Java 25  LTS  2025   ← current LTS; compact void main() files
Java 26, 27   2026   non-LTS; Java 27 out 15 September 2026
Java 29  LTS  2027   planned (September 2027)

LTS = 17 + 4k   →   17, 21, 25, 29 …
```

- Each row lists what arrived since the previous LTS. In 2026, "which Java?" means **21 or 25**.
- `getFirst()`, `getLast()` and `reversed()` need **Java 21** — on 17 they do not compile.

### 2. Use the modern way

| You wrote | Write now | Java | See |
|---|---|---|---|
| `Stack<Integer> st` | `Deque<Integer>` + `new ArrayDeque<>()` | 6 | §38.6 |
| key class + `equals`/`hashCode` | `record Cell(int r, int c) {}` | 16 | §38.5 |
| full type on every local | `var l = new ArrayList<Integer>()` | 10 | §38.4 |
| `Arrays.asList(1, 2, 3)` | `List.of(1, 2, 3)`, `Map.of(k, v)` | 9 | §38.4, §38.5 |
| `l.get(l.size() - 1)` | `l.getLast()`, `l.reversed()` | 21 | §38.4 |
| `s.trim()`, `s.trim().isEmpty()` | `s.strip()`, `s.isBlank()` | 11 | §38.3 |
| `StringBuilder` repeat loop | `"ab".repeat(3)` | 11 | §38.3 |
| `.collect(Collectors.toList())` | `.toList()` (read-only) | 16 | §38.2 |
| `instanceof` + cast chains | pattern-matching `switch` | 21 | [Ch 38b](#content/38b_java_modern) |
| thread pools, Boot 2, class trees | virtual threads, Boot 4, sealed | 17, 21 | [Ch 38b](#content/38b_java_modern) |

Each line starts fresh from `List<Integer> l = new ArrayList<>(List.of(4, 8, 15));` — checked on JDK 25.

```java
l.getFirst()                    // 4
l.getLast()                     // 15   (was l.get(l.size() - 1))
l.reversed()                    // [15, 8, 4]   a view, not a copy
l.removeLast()                  // 15   → l = [4, 8]
"ab".repeat(3)                  // "ababab"
"  ".isBlank()                  // true   ("  ".isEmpty() → false)
" hi ".strip()                  // "hi"
List.of(1, 2, 3).add(4)         // UnsupportedOperationException
record Cell(int r, int c) {}    // equals, hashCode, toString free
var seen = new HashSet<Cell>(); // var: local variables only
```

- `List.of`, `Set.of`, `Map.of` and `toList()` are **read-only**; `List.of` also rejects `null`. Need to grow it? `new ArrayList<>(List.of(1, 2, 3))`.
- `strip()` also removes Unicode spaces (e.g. U+2003); `trim()` does not.

### 3. Which chapter first?

| Your goal | Read |
|---|---|
| Pass a DSA coding interview | this chapter → [Ch 31–31d](#content/31_dsa_foundations) |
| Return to backend work | §38.12 bugs table → [Ch 38b](#content/38b_java_modern) |
| Both | this chapter → [Ch 38b](#content/38b_java_modern) → [Ch 31–31d](#content/31_dsa_foundations) |

### 4. Rust check

Answer before reading on. Each question maps to a section — a miss tells you where to slow down.

1. What does `new Integer[3]` contain? *(§38.2)*
2. `Arrays.asList(1, 2, 3).add(4)` — what happens? *(§38.2)*
3. Why is `s += c` inside a loop a bug? *(§38.3)*
4. You need a stack: `Stack` or `ArrayDeque`? *(§38.6)*
5. What is wrong with the comparator `(a, b) -> a - b`? *(§38.10)*
6. `Integer a = 127, b = 127;` — is `a == b`? And at 128? *(§38.11)*
7. Why can `int mid = (lo + hi) / 2;` break? *(§38.11)*
8. A key class overrides `equals` but not `hashCode`. What does `HashMap.get` return? *(§38.5)*

<details>
<summary><strong>Answers.</strong> Score yourself, then use the table to decide what to skip.</summary>

1. `[null, null, null]` — only primitive arrays fill with zeros. `sum += x` then throws `NullPointerException`.
2. `UnsupportedOperationException` — `asList` is fixed-size: `set` works, `add` and `remove` never do.
3. Each `+=` copies the whole string, so the loop is $O(n^2)$. A `StringBuilder` is $O(n)$.
4. `ArrayDeque`. `Stack` is a synchronized legacy class (it extends `Vector`) and prints bottom-to-top.
5. It overflows: `2_000_000_000 - (-2_000_000_000)` wraps negative and the order flips. Use `Integer.compare(a, b)`.
6. `true`, then `false` — `Integer` caches −128 to 127, so `==` works only for small values. Use `equals`.
7. `lo + hi` can pass `Integer.MAX_VALUE` and wrap negative. Write `lo + (hi - lo) / 2`.
8. `null` (almost always) — equal keys land in different buckets. Override both, or use a `record`.

| Score | Do this |
|---|---|
| **7–8** | skim the code blocks; read the Traps tables |
| **4–6** | normal after a gap — read in order |
| **0–3** | read every section; type the examples out |

</details>

> **Interview —** *"You've been away from Java for a while. How current are you?"*
>
> **Say:** I left around Java 11; the current LTS is Java 25. For DSA code the changes are small — `ArrayDeque` instead of `Stack`, records as map keys, `List.of`, and `getLast()` from Java 21. For backend work I know the big shifts: records and sealed types, pattern-matching `switch`, and virtual threads in Java 21.

---

## 38.2 Arrays ★★★

**Use an array when** the size is known up front and you need instant access by position — input `nums`, DP tables, counters, `visited` grids. It is the most-used type in [Ch 31–31d](#content/31_dsa_foundations): `int[]` appears more than 3,000 times.

![Cheat sheet on defining and using Java arrays. Define: new int of size 5 starts as five zeros; the brace list {3, 1, 2} works only on the declaration line; new int with braces works anywhere, as in return new int {i, j}. Default values: int and long 0, double 0.0, boolean false, char \u0000, String and Integer null. Read and loop: in 4, 8, 15, 16 the first element is a(0) and the last is a(a.length - 1); use an index loop when you need i, and a for-each loop where x is a copy. A 3 by 4 grid is an outer array of three row references: rows = g.length = 3, cols = g(0).length = 4. Grid neighbours come from a four-direction array, skipping cells off the grid. 2-D arrays in DSA: a boolean visited grid, a DP table of n + 1 by m + 1, filling row by row with Arrays.fill, and jagged rows of any length. Size spellings: a.length for arrays, s.length() for String, list.size() for List.](diagrams/java38_info_arrays_define_ai.png)

### Simple Explanation

An array is a row of numbered boxes: one type, numbered from **0**, fixed size. Java jumps straight to box `i`, so `a[0]` and `a[999_999]` cost the same. The variable holds the boxes' **address**: `int[] b = a;` is a second name for the same boxes, not a copy.

> **Official definition —** an array is a fixed-length, contiguous block of elements of one type, each reached in $O(1)$ time by a zero-based integer index.

### Arrays at a glance

| Topic | Answer |
|---|---|
| Import | none for `int[]`; `java.util.Arrays` for the helpers |
| Size | fixed; read it with `a.length` (no `()`) |
| Indexes | `0` to `a.length - 1` |
| Read or write `a[i]` | $O(1)$ |
| Search | $O(n)$; $O(\log n)$ if sorted |
| Insert or delete in the middle | $O(n)$ |
| Need it to grow? | use `ArrayList` (§38.4) |

### 1. Define, read and loop

```java
int[] dp   = new int[n + 1];          // all 0 (double 0.0, boolean false, char '\u0000')
int[] nums = {2, 7, 11, 15};          // braces: only on the declaration line
return new int[]{i, j};               // inside an expression: new int[]{...}
twoSum({2, 7, 11, 15}, 9);            // ✗ does not compile
nums[0]                  // 2    first
nums[nums.length - 1]    // 15   last
for (int i = 0; i < nums.length; i++) { }   // need i, or want to write
for (int x : nums) { }                      // values only; x is a copy
```

- Use `int[]`, not `Integer[]`: `new Integer[3]` is `[null, null, null]` (so `sum += x` throws NPE) and takes about 5× the memory. Box only when you need a comparator (§38.10).
- Size has three spellings: `a.length` (array) · `s.length()` (String) · `list.size()` (List).

### 2. 2-D arrays — grids, matrices, DP tables

A 2-D array is an **array of rows** — each row is its own `int[]`:

```
  grid ──► ┌───┐
           │ 0 │──► [ 0 ][ 0 ][ 0 ][ 0 ]   row 0
           │ 1 │──► [ 0 ][ 0 ][ 0 ][ 0 ]   row 1
           │ 2 │──► [ 0 ][ 0 ][ 0 ][ 0 ]   row 2
           └───┘
  rows = grid.length = 3      cols = grid[0].length = 4
```

```java
int[][] grid = new int[3][4];               // 3 rows × 4 cols, all 0
int rows = grid.length, cols = grid[0].length;   // 3, 4 — grid[r][c]: row first
boolean[][] seen = new boolean[rows][cols]; // visited (BFS / DFS)
int[][] jag  = new int[3][];                // rows made later, any length
int[][] dp   = new int[n + 1][m + 1];       // DP table
for (int[] row : dp) Arrays.fill(row, -1);  // fill row by row
for (int r = 0; r < rows; r++)              // row by row: the fast order
    for (int c = 0; c < cols; c++)
        grid[r][c] = r * cols + c;          // [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11]]
// 4 neighbours — Number of Islands, Rotting Oranges, Word Search
int[][] DIRS = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};  // up down left right (+4 diagonals for 8)
for (int[] d : DIRS) {
    int nr = r + d[0], nc = c + d[1];
    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;   // off the grid
    // visit grid[nr][nc]
}
```

> **Interview —** *"How is `int[3][4]` stored in Java, versus C?"*
>
> **Say:** C uses one block of 12 ints. Java uses four objects — an array of 3 row references, plus 3 rows. So rows can differ in length, `clone()` copies only the row references, and looping row by row is faster than column by column.

### 3. Useful methods — `java.util.Arrays`

![Cheat sheet of java.util.Arrays methods on a = {5, 2, 9, 1}. Print: toString gives 5, 2, 9, 1 and deepToString prints a 2-D grid. Compare: Arrays.equals(cnt1, cnt2) is true for the same letter counts, while a == b compares addresses. Sort, O(n log n): sort gives 1, 2, 5, 9; sort(a, 1, 4) gives 5, 1, 2, 9; an Integer array sorted with Collections.reverseOrder() gives 9, 5, 2, 1; a comparator with Integer.compare sorts intervals by start. Fill and copy, O(n): fill with -1; copyOf to length 6 gives 5, 2, 9, 1, 0, 0; copyOfRange(a, 1, 3) gives 2, 9; clone makes an independent copy. Anagram key: eat becomes the chars e, a, t, sorts to a, e, t, and new String gives aet, the same key as tea and ate (Group Anagrams). Convert and aggregate: asList gives a fixed-size List, stream boxed toList gives a List of Integer, mapToInt toArray converts back, stream sum is 17 and max is 9. Ranges are half-open: the to index is excluded.](diagrams/java38_info_arrays_methods_ai.png)

Each line starts fresh from `int[] a = {5, 2, 9, 1};` — every result checked on JDK 25.

```java
// ── Print and compare ─────────────────────── O(n)
Arrays.toString(a)          // "[5, 2, 9, 1]"
Arrays.deepToString(grid)   // "[[1, 2], [3, 4]]"
Arrays.equals(cnt1, cnt2)   // true if same contents (letter counts)
// ── Sort ──────────────────────────────────── O(n log n)
Arrays.sort(a);             // [1, 2, 5, 9]
Arrays.sort(a, 1, 4);       // only index 1..3 → [5, 1, 2, 9]
Arrays.sort(boxed, Collections.reverseOrder()); // Integer[]: [9, 5, 2, 1]
Arrays.sort(iv, (x, y) -> Integer.compare(x[0], y[0]));   // int[][] by start (§38.10)
// ── Binary search (sorted only) ───────────── O(log n)
Arrays.binarySearch(s, 5)   // 2    in s = [1, 2, 5, 9]
Arrays.binarySearch(s, 6)   // -4   missing → goes at -(-4) - 1 = 3
// ── Fill and copy ─────────────────────────── O(n)
Arrays.fill(a, -1);            // [-1, -1, -1, -1]
Arrays.copyOf(a, 6)            // [5, 2, 9, 1, 0, 0]   pads or cuts
Arrays.copyOfRange(a, 1, 3)    // [2, 9]
a.clone()                      // independent copy (1-D only)
// ── Anagram key: char[] ↔ String ──────────── O(k log k)
char[] c = "eat".toCharArray(); Arrays.sort(c);   // [e, a, t] → [a, e, t]
String key = new String(c);       // "aet" — same for "tea", "ate"
// ── Convert and aggregate ─────────────────── O(n)
new ArrayList<>(Arrays.asList(1, 2, 3))   // growable (asList alone is fixed-size)
Arrays.stream(a).boxed().toList()         // List<Integer>, read-only
list.stream().mapToInt(Integer::intValue).toArray()   // → int[]
Arrays.stream(a).sum()                    // 17 (an int: can overflow); .max().getAsInt() → 9
```

**Remember**

- Ranges are half-open, `[from, to)` — `to` is excluded.
- `sort(int[])` is quicksort (not stable); object and comparator sorts are TimSort (stable). Both are $O(n \log n)$ worst case since JDK 14.
- With duplicates, `binarySearch` returns *any* match. For the first one, write a lower-bound loop ([Ch 31](#content/31_dsa_foundations)).

### 4. DSA idioms you'll write every day

![Cheat sheet of Java array idioms and traps. Idioms: count letters in an int array of 26 indexed by ch - 'a' (Valid Anagram); prefix sums where pre(i + 1) = pre(i) + a(i) and a range sum is pre(r + 1) - pre(l); swap through a temp (Reverse, Rotate Array); fill memo with -1 and dist with Integer.MAX_VALUE (DP, Dijkstra); track the best from Integer.MIN_VALUE with Math.max (Max Subarray); return two indexes as a new int pair (Two Sum); offer a grid cell to a queue as a new int pair (grid BFS); store a cell as one number id = r * cols + c, decoded with id / cols and id % cols (Union-Find on a grid). Traps: printing an array shows a type code and hash, so use Arrays.toString; b = a is the same array, so use clone; cloning a grid shares its rows; a new Integer array holds nulls; Arrays.asList on an int array is a list of size 1; Arrays.fill on a grid throws ArrayStoreException; int sums of big values wrap negative, so use long; an int array is a broken HashMap key, so use List.of(r, c). There is no Arrays.sort for an int array with a comparator: sort then reverse, or use Integer.](diagrams/java38_info_arrays_idioms_traps_ai.png)

```java
// 1. Count letters — Valid Anagram, Ransom Note
int[] freq = new int[26];
for (char ch : s.toCharArray()) freq[ch - 'a']++;   // "banana": freq[0] = 3, freq[13] = 2
// 2. Prefix sums — Range Sum Query, Subarray Sum Equals K
long[] pre = new long[n + 1];       // long: big sums overflow int (§38.11)
for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + a[i];
long sum = pre[r + 1] - pre[l];     // sum of a[l..r] in O(1)
// 3. Reverse in place by swapping — Rotate Array, Next Permutation
for (int lo = 0, hi = a.length - 1; lo < hi; lo++, hi--) {
    int t = a[lo]; a[lo] = a[hi]; a[hi] = t;
}
// 4. "Not computed" and "infinity" — memoised DP, Dijkstra
Arrays.fill(memo, -1);
Arrays.fill(dist, Integer.MAX_VALUE);
// 5. A grid cell in a queue — BFS on a grid (the loop itself: §38.6)
Deque<int[]> q = new ArrayDeque<>();
q.offer(new int[]{r, c});
int[] cur = q.poll();       // cur[0] = row, cur[1] = col
// 6. One number per cell — HashSet key, Union-Find on a grid
int id = r * cols + c;      // back: r = id / cols, c = id % cols
```

### 5. Traps

| ✗ Mistake | What happens | ✓ Fix |
|---|---|---|
| `println(a)` | prints `[I@29453f44` | `Arrays.toString(a)` |
| `a == b`, `a.equals(b)` | compares addresses | `Arrays.equals(a, b)` |
| `int[] b = a;` | same array, not a copy | `a.clone()` |
| `grid.clone()` | rows still shared | clone each row |
| `new Integer[3]` | `[null, null, null]` → NPE | `int[]` |
| `Arrays.asList(intArr)` | a list of **size 1** | `Arrays.stream(a).boxed().toList()` |
| `Arrays.asList(1, 2).add(3)` | `UnsupportedOperationException` | `new ArrayList<>(...)` |
| `Arrays.fill(grid, 0)` | `ArrayStoreException` | fill each row |
| `i <= a.length` | index out of bounds | `i < a.length` |
| `int[]` as a map key | lookups return `null` | `List.of(r, c)` or `r * cols + c` |

### 6. Try it

One complete program — the output is real (JDK 25).

```java
import java.util.*;

public class ArraysTryIt {
    public static void main(String[] args) {
        System.out.println(Arrays.toString(new int[3]) + " vs " + Arrays.toString(new Integer[3]));
        int[] a = {5, 2, 9, 1}, alias = a, copy = a.clone();
        alias[0] = 99;                                    // writes through to a
        System.out.println("a = " + Arrays.toString(a) + ", copy = " + Arrays.toString(copy));
        Arrays.sort(copy);                                // [1, 2, 5, 9]
        int i = Arrays.binarySearch(copy, 6);
        System.out.println("search 6 -> " + i + ", insert at " + (-i - 1));
        int[] p = {1, 2}, q = {1, 2};
        System.out.println("p == q: " + (p == q) + ", Arrays.equals: " + Arrays.equals(p, q)
                + ", asList(p).size(): " + Arrays.asList(p).size());

        int[][] grid = new int[3][4];
        int rows = grid.length, cols = grid[0].length;
        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++) grid[r][c] = r * cols + c;
        int[][] DIRS = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};
        List<Integer> nb = new ArrayList<>();
        for (int[] d : DIRS) {                            // neighbours of (0, 1)
            int nr = 0 + d[0], nc = 1 + d[1];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
            nb.add(grid[nr][nc]);
        }
        System.out.println("neighbours of (0,1) = " + nb);
        int[][] saved = grid.clone();                     // copies row references only
        grid[0][0] = -7;
        System.out.println("saved[0][0] = " + saved[0][0]);
    }
}
```

**Output:**

```
[0, 0, 0] vs [null, null, null]
a = [99, 2, 9, 1], copy = [5, 2, 9, 1]
search 6 -> -4, insert at 3
p == q: false, Arrays.equals: true, asList(p).size(): 1
neighbours of (0,1) = [5, 0, 2]
saved[0][0] = -7
```

<details>
<summary><strong>Quick check.</strong> How do you sort an <code>int[]</code> in descending order?</summary>

There is no `Arrays.sort(int[], comparator)`. Sort, then reverse in place — or box to `Integer[]` and use `Collections.reverseOrder()`.

</details>

<details>
<summary><strong>Quick check.</strong> <code>int[][] dp = new int[n][m]; Arrays.fill(dp, -1);</code> — what happens?</summary>

It compiles, then throws `ArrayStoreException`: each slot of `dp` holds a row, not a number. Fill each row: `for (int[] row : dp) Arrays.fill(row, -1);`

</details>

---

## 38.3 Strings, StringBuilder & char ★★★

**Use a `String` when** you read or compare text. Build the answer in a **`StringBuilder`**, and use **`char` arithmetic** (`c - 'a'`) to index arrays by letter — palindromes, anagrams, sliding windows, parsing.

![Cheat sheet on defining and using Java strings. Create a String: s = 'hello' is a literal, new String('hello') makes a new object, String.valueOf(42) gives '42', and new String(chars) turns a char array into a String. Immutable: s points to a locked 'hello'; s.toUpperCase() on its own leaves s as 'hello', while s = s.toUpperCase() gives 'HELLO' — every method returns a new String. Read by index: in h e l l o, s.charAt(1) is 'e', s.length() is 5, and s.substring(1, 4) is 'ell' because end index 4 is excluded. char vs String: 'a' in single quotes is a number, a String in double quotes is an object, (int) 'a' is 97, and toCharArray gives a char array copy you can change. char arithmetic: 'c' - 'a' is 2, (char)('a' + 2) is 'c', '7' - '0' is 7, (char)('0' + 7) is '7'. StringBuilder: append ab then c gives abc, append 1 gives abc1; call toString once at the end.](diagrams/java38_info_strings_define_ai.png)

### Simple Explanation

A `String` is text carved in stone: `toUpperCase`, `replace`, `substring` and `+` all return a **new** string. That makes strings safe to share and good `HashMap` keys — but adding one char copies the whole string.

A `StringBuilder` is a whiteboard: append, insert and delete in place, then call `toString()` once. A `char` is a small number with a letter painted on it — `'a'` is 97 — so `c - 'a'` turns a letter into an index from 0 to 25.

> **Official definition —** a `String` is an immutable sequence of UTF-16 `char` values; a `StringBuilder` is a mutable, unsynchronised sequence of chars with amortised $O(1)$ `append`.

### Strings at a glance

| Topic | Answer |
|---|---|
| Import | none — all in `java.lang` |
| Can it change? | `String` never; `StringBuilder` yes |
| Length | `s.length()` and `sb.length()` — with `()` |
| `charAt(i)` | $O(1)$ |
| `substring`, `toCharArray`, `+` | $O(n)$ — they copy |
| Compare text | `s.equals(t)`, never `==` |
| Build in a loop | `StringBuilder`, never `s += c` |
| `char` | a 16-bit number: `'a'` is 97 |

### 1. Define a String, a char and a StringBuilder

```java
String s = "hello";                  // literal (pooled, shared)
String t = new String("hello");      // a new object: s == t is false
String n = String.valueOf(42);       // "42"   (new String(chars) from a char[])
char c = s.charAt(1);                // 'e' — single quotes, a number
char[] cs = s.toCharArray();         // [h, e, l, l, o] — a copy
StringBuilder sb = new StringBuilder("abc");   // "abc"  (no argument: "")

s.toUpperCase();        // returns "HELLO" — s is still "hello"
s = s.toUpperCase();    // ✓ keep the result: s is now "HELLO"
```

### 2. `char` — letters are numbers

```java
// '0'..'9' = 48..57    'A'..'Z' = 65..90    'a'..'z' = 97..122
'c' - 'a'               // 2     letter → index 0..25
(char) ('a' + 2)        // 'c'   index → letter
'7' - '0'               // 7     digit char → int
(char) ('0' + 7)        // '7'   int → digit char
'a' + 1                 // 98    char + int is an int
"" + 'a' + 'b'          // "ab"  a String first → text ('a' + 'b' is 195)

char ch = 'a';
ch++;                   // 'b'   ++ and += cast back for you
ch = ch + 1;            // ✗ does not compile: int → char
ch = (char) (ch + 1);   // ✓ 'c'
```

- Counting letters with `int[26]` (`cnt[c - 'a']++`) or `int[128]` (`cnt[c]++`): §38.2.
- A `char` is one UTF-16 unit, so an emoji takes two; for `a`–`z` input, one `char` is one letter.

### 3. Useful methods — `String` and `Character`

![Cheat sheet of Java String, Character and StringBuilder methods on s = hello world. Search: indexOf('o') is 4, lastIndexOf('o') is 7, indexOf xyz is -1, and contains and startsWith are true. Cut and compare: substring(6) is world, equals and equalsIgnoreCase are true, and apple compareTo banana is -1 — negative comes first. Transform returns a new String: toUpperCase gives HELLO WORLD, replace('l', 'L') gives heLLo worLd, strip gives hi, ab repeat 3 is ababab, and String.join with a dash gives a-b-c. split takes a regex: a comma, one-or-more spaces or an escaped dot all give a, b, c; trailing empty strings are dropped. Character and convert: isDigit('7') is true, isLetterOrDigit('_') is false, toLowerCase('Q') is q, Integer.parseInt gives -42. StringBuilder steps: abc, insert x gives xabc, setCharAt gives zabc, deleteCharAt(0) gives abc, setLength drops to ab, reverse gives ba.](diagrams/java38_info_strings_methods_ai.png)

```java
// Every line starts fresh from s = "hello world" — checked on JDK 25
// ── Read and search ──────────── charAt O(1), the rest O(n)
s.charAt(s.length() - 1)    // 'd'   the last char (length() is 11)
s.indexOf('o')              // 4     (lastIndexOf('o') → 7)
s.indexOf("xyz")            // -1    not found
s.contains("lo w")          // true  (startsWith, endsWith too)
s.startsWith("wor", 6)      // true  match at index 6, no copy (strStr)

// ── Cut and compare ───────────────────────── O(n)
s.substring(0, 5)           // "hello"  [0, 5): end excluded
s.substring(6)              // "world"  from 6 to the end
s.equals("hello world")     // true     (equalsIgnoreCase too)
"apple".compareTo("banana") // -1   negative: comes first
"a".compareTo("z")          // -25  not just -1, 0 or 1

// ── Transform: each returns a NEW String ──── O(n)
s.toUpperCase()             // "HELLO WORLD"  (toLowerCase too)
s.replace('l', 'L')         // "heLLo worLd"
"  hi  ".strip()            // "hi"   (trim() is the older one)
"ab".repeat(3)              // "ababab"   ("  ".isBlank() → true)
String.join("-", "a", "b", "c")     // "a-b-c"

// ── split: the argument is a REGEX ────────── O(n)
"a  b c".split("\\s+")      // [a, b, c]   one or more spaces
"a.b.c".split("\\.")        // [a, b, c]   escape the dot
"a.b.c".split(".")          // []          "." matches every char!
"  a b".split("\\s+")       // [, a, b]    leading "": strip() first
"a,b,,".split(",")          // [a, b]      trailing "" dropped

// ── Convert and Character helpers ────────────
Integer.parseInt("-42")     // -42   ("12a" throws NumberFormatException)
Character.isDigit('7')            // true   (isLetter too)
Character.isLetterOrDigit('_')    // false — the palindrome filter
Character.toLowerCase('Q')        // 'q'    (toUpperCase too)
Character.getNumericValue('a')    // 10     ✗ not an error
```

**Remember**

- `substring` copies — $O(k)$ for a length-$k$ result. A new substring on every loop step makes the loop $O(n^2)$.
- `indexOf(String)` and `contains` are a simple scan: up to $O(n \cdot m)$, not KMP.
- `split` takes a regex: escape `.`, `|`, `+`, `*`, `?` and `(` with `\\`, or use `Pattern.quote(".")`. Parsing big numbers and overflow: §38.11.

### 4. Useful methods — `StringBuilder`

```java
StringBuilder sb = new StringBuilder();   // lines run top to bottom
sb.append("abc").append('d').append(1);   // "abcd1"  amortised O(1), any type
sb.insert(0, 'x');              // "xabcd1"  O(n): shifts the rest
sb.setCharAt(0, 'z');           // "zabcd1"  O(1)
sb.deleteCharAt(0);             // "abcd1"
sb.setLength(sb.length() - 1);  // "abcd"    drop the last char, O(1)
sb.reverse();                   // "dcba"    in place, returns sb
sb.delete(0, 2);                // "ba"      range [0, 2); charAt(1) is 'a'
String out = sb.toString();     // "ba"      back to a String
sb.setLength(0);                // ""        clear and reuse
```

- Backtracking undo (Generate Parentheses): `sb.deleteCharAt(sb.length() - 1)` — $O(1)$ at the end.
- No content `equals`: use `sb1.compareTo(sb2) == 0` (Java 11) or `s.contentEquals(sb)`. Use `StringBuilder`, not the old synchronised `StringBuffer`.

> **Interview —** *"Why is `String` immutable, and why does every answer build with a `StringBuilder`?"*
>
> **Say:** Immutable strings are safe to share, can live in the string pool, and cache their hash — so they make good `HashMap` keys. The cost: `s += c` copies the whole string every time, $1 + 2 + \dots + n = n(n+1)/2$ chars. At $n = 50{,}000$ that is 1.25 billion chars; a `StringBuilder` roughly doubles its buffer when full and copies about 74 thousand. One expression like `a + b + c` is fine — the problem is `+=` in a loop.

### 5. DSA idioms you'll write every day

![Cheat sheet of Java string idioms and traps. Idioms: two pointers comparing s.charAt(i++) with s.charAt(j--) (Valid Palindrome); count any char in an int array of 128 (First Unique Character); a sliding window with lo = Math.max(lo, last(c)) (Longest Substring Without Repeating); strip, split on whitespace and String.join (Reverse Words in a String); num = num * 10 + (c - '0') (String to Integer); new StringBuilder(s).reverse().toString() (palindrome check); append, then deleteCharAt(sb.length() - 1) (Generate Parentheses); s.startsWith(p, i) with no substring copy (strStr). Traps: == compares addresses, use equals; s += c in a loop is O(n squared); split on a plain dot gives an empty array; 'a' + 1 is the int 98; a char array added to a String prints a type code; StringBuilder equals compares addresses, use compareTo; a char has no equals, use ==; a substring end past the length is out of bounds.](diagrams/java38_info_strings_idioms_traps_ai.png)

```java
// 1. Two pointers from both ends — Valid Palindrome
int i = 0, j = s.length() - 1;
while (i < j) {
    char a = s.charAt(i), b = s.charAt(j);
    if (!Character.isLetterOrDigit(a)) i++;
    else if (!Character.isLetterOrDigit(b)) j--;
    else if (Character.toLowerCase(a) != Character.toLowerCase(b))
        return false;
    else { i++; j--; }
}
// "A man, a plan, a canal: Panama" → true, "race a car" → false

// 2. Sliding window — Longest Substring Without Repeating Characters
int[] last = new int[128];              // last index + 1; 0 = unseen
int best = 0;
for (int lo = 0, hi = 0; hi < s.length(); hi++) {
    char c = s.charAt(hi);
    lo = Math.max(lo, last[c]);         // jump past the repeat
    last[c] = hi + 1;
    best = Math.max(best, hi - lo + 1);
}
// "abcabcbb" → 3 ("abc")

// 3. Letters as keys — Valid Anagram: int[26] counts (§38.2)
//    Group Anagrams: key = the sorted chars as a String (Quick check below)

// 4. Split, reverse, join — Reverse Words in a String
List<String> words = Arrays.asList(s.strip().split("\\s+"));
Collections.reverse(words);
String ans = String.join(" ", words);   // "  the sky is blue " → "blue is sky the"

// 5. Digit chars ↔ ints, build backwards — String to Integer, Add Strings
int num = 0;
for (char c : "305".toCharArray()) num = num * 10 + (c - '0');   // 305
StringBuilder sb = new StringBuilder();
int i = x.length() - 1, j = y.length() - 1, carry = 0;
while (i >= 0 || j >= 0 || carry > 0) {
    int d = carry;
    if (i >= 0) d += x.charAt(i--) - '0';    // '7' → 7
    if (j >= 0) d += y.charAt(j--) - '0';
    sb.append((char) ('0' + d % 10));        // 3 → '3'
    carry = d / 10;
}
String sum = sb.reverse().toString();        // "456" + "77" → "533"
```

### 6. Traps

| ✗ Mistake | What happens | ✓ Fix |
|---|---|---|
| `s1 == s2` | compares addresses; literals may pass | `s1.equals(s2)` |
| `s += c` in a loop | $O(n^2)$ copying | `StringBuilder` |
| `"a.b.c".split(".")` | empty array `[]` | `split("\\.")` |
| `"hello".substring(2, 9)` | `StringIndexOutOfBoundsException` | end ≤ `s.length()` |
| `'a' + 1`, `sb.append(c + 1)` | `98`, an `int` / appends `"98"` | `(char) ('a' + 1)` |
| `c.equals('a')` on a `char` | does not compile | `c == 'a'` |
| `getNumericValue('a')` | `10`, no error | check `isDigit(c)` first |
| `sb1.equals(sb2)` | compares addresses | `sb1.compareTo(sb2) == 0` |
| `"" + chars` | prints `[C@1b6d3586` | `new String(chars)` |
| `new StringBuilder('a')` | empty: `'a'` is capacity 97 | `new StringBuilder("a")` |

### 7. Try it

One complete program — the output is real (JDK 25).

```java
// Strings, chars and StringBuilder: the behaviours and traps that matter.
import java.util.*;

public class StringTraps {
    public static void main(String[] args) {
        String s = "hello";
        s.toUpperCase();                               // result thrown away
        System.out.println("s = " + s + ", kept = " + s.toUpperCase());

        String a = "hi", b = new String("hi");
        System.out.println("a == b: " + (a == b) + ", a.equals(b): " + a.equals(b));

        char c = 'a';
        int num = 0;
        for (char d : "305".toCharArray()) num = num * 10 + (d - '0');
        System.out.println("c + 1 = " + (c + 1) + ", (char) (c + 1) = " + (char) (c + 1)
                + ", parse \"305\" + 1 = " + (num + 1));

        System.out.println("split(\".\") -> " + Arrays.toString("a.b.c".split("."))
                + ", split(\"\\\\.\") -> " + Arrays.toString("a.b.c".split("\\.")));

        StringBuilder sb = new StringBuilder();
        for (char ch : "stressed".toCharArray()) sb.append(ch);   // not out += ch
        sb.reverse();
        StringBuilder other = new StringBuilder("desserts");
        System.out.println("sb = " + sb + ", sb.equals(other): " + sb.equals(other)
                + ", compareTo == 0: " + (sb.compareTo(other) == 0));
    }
}
```

**Output:**

```
s = hello, kept = HELLO
a == b: false, a.equals(b): true
c + 1 = 98, (char) (c + 1) = b, parse "305" + 1 = 306
split(".") -> [], split("\\.") -> [a, b, c]
sb = desserts, sb.equals(other): false, compareTo == 0: true
```

- **`a == b` is `false`:** `new String` makes a second object. Two literals `"hi" == "hi"` would be `true` — which is why `==` passes small tests.
- **`sb.equals(other)` is `false`** although both hold `desserts` — `StringBuilder` compares addresses; `compareTo` compares the text.

<details>
<summary><strong>Quick check.</strong> What does <code>"a.b.c".split(".")</code> return?</summary>

An empty array. `split` takes a regex and `.` matches every char, so every piece is empty — and trailing empty pieces are dropped. Use `split("\\.")` or `split(Pattern.quote("."))` to get `[a, b, c]`.

</details>

<details>
<summary><strong>Quick check.</strong> You need a <code>HashMap</code> key for "the letters of a word, in any order". What do you use?</summary>

Sort the chars and rebuild a `String`: `char[] k = w.toCharArray(); Arrays.sort(k); String key = new String(k);` — `"eat"`, `"tea"` and `"ate"` all give `"aet"`. Never use the `char[]` itself as the key: arrays compare by address (§38.2).

</details>

---

## 38.4 ArrayList & List ★★★

**Use an `ArrayList` when** you need an array that grows — collecting answers, building `List<List<Integer>>` results, backtracking paths, adjacency lists. It is the default `List` in DSA Java.

![Cheat sheet on defining and using a Java ArrayList. Declare: List of Integer list = new ArrayList gives an empty list; List.of(3, 1, 2) is immutable; new ArrayList of List.of(3, 1, 2) is growable; new ArrayList(n) has size 0, not n; List of int does not compile, so use List of Integer. Lists of lists and pairs: res.add(new ArrayList(path)) and a list of int pairs, used in Subsets and Merge Intervals. How it grows: 5, 2, 9, 1 then spare slots where add(x) lands in O(1); when full it copies into a 1.5 times bigger array, capacity 10, 15, 22, 33, so append is amortised O(1). Read and write on 5, 2, 9, 1: get(0) is 5, set(1, 7) gives 5, 7, 9, 1, size() is 4. Add and remove: add(0, 8) shifts in O(n); remove(1) drops index 1 giving 5, 9, 1; remove(Integer.valueOf(1)) drops the value 1 giving 5, 2, 9. Costs: get and set O(1), append amortised O(1), insert or remove in the middle O(n), contains O(n).](diagrams/java38_info_arraylist_define_ai.png)

### Simple Explanation

An `ArrayList` is an array with spare room at the end. `add(x)` drops `x` into the next free slot. When the room runs out, Java copies everything into an array about 1.5× bigger — rare enough that appending stays $O(1)$ on average. `List` is the interface (*what* you can do); `ArrayList` is the class (*how* it is stored). Declare `List<Integer>`, create `new ArrayList<>()`. A list holds objects only — `List<Integer>`, never `List<int>`.

> **Official definition —** `ArrayList` is a resizable-array implementation of the `List` interface, with $O(1)$ access by index and amortised $O(1)$ append.

### ArrayList at a glance

| Topic | Answer |
|---|---|
| Import | `java.util.List`, `java.util.ArrayList` (or `java.util.*`) |
| Declare | `List<Integer> list = new ArrayList<>();` |
| Size | grows by itself; read it with `list.size()` |
| Order and `null` | keeps insertion order; duplicates and `null` allowed |
| `get(i)`, `set(i, x)`, `add(x)` | $O(1)$ — append is amortised |
| `add(i, x)`, `remove(i)`, `contains(x)` | $O(n)$ — shifts or scans |
| Not for | fast lookup (`HashSet`, §38.5), queues (`ArrayDeque`, §38.6) |

### 1. Define a list

```java
List<Integer> list = new ArrayList<>();      // []  empty, growable
List<Integer> fixed = List.of(3, 1, 2);      // immutable, no nulls
List<Integer> nums = new ArrayList<>(List.of(3, 1, 2));  // growable copy
List<Integer> big = new ArrayList<>(n);      // capacity n, but size() → 0
List<Integer> slots = new ArrayList<>(Collections.nCopies(n, 0));  // n = 3 → [0, 0, 0]

// Lists of lists and pairs
List<List<Integer>> res = new ArrayList<>();    // Subsets, Level Order
List<int[]> pairs = new ArrayList<>();          // intervals: pairs.add(new int[]{1, 3})
List<List<Integer>> graph = new ArrayList<>();  // adjacency list (Course Schedule)
for (int i = 0; i < n; i++) graph.add(new ArrayList<>());
graph.get(0).add(2);                            // edge 0 → 2
```

```
  how it grows: list = [5, 2, 9, 1], size 4, two spare slots
  ┌───┬───┬───┬───┬───┬───┐
  │ 5 │ 2 │ 9 │ 1 │   │   │
  └───┴───┴───┴───┴───┴───┘
                    ▲ add(x) lands here: O(1)
  full? → new array ~1.5× bigger, copy all, then add: O(n), but rare
  capacity: 10 → 15 → 22 → 33 → 49 …   so append is amortised O(1)
```

### 2. Read, write, add, remove

Each line starts fresh from `List<Integer> list = new ArrayList<>(List.of(5, 2, 9, 1));`.

```java
// ── Read and write ────────────────────────── O(1)
list.get(0)                  // 5
list.set(1, 7)               // returns 2 (old) → [5, 7, 9, 1]
System.out.println(list);    // [5, 2, 9, 1] — no Arrays.toString
// ── Add ──────────────────────────────────────
list.add(4);                 // [5, 2, 9, 1, 4]   amortised O(1)
list.add(0, 8);              // [8, 5, 2, 9, 1]   O(n): shifts right
// ── Remove ───────────────────────────────────
list.remove(1)               // INDEX 1 → returns 2, [5, 9, 1]
list.remove(Integer.valueOf(1))   // VALUE 1 → true, [5, 2, 9]
list.remove(list.size() - 1) // last → returns 1, O(1)
```

- `remove(int)` takes an **index**; `remove(Object)` takes a **value**. An `int` argument always picks the index version. Removing from the end is $O(1)$; from the front or middle, $O(n)$.

> **Interview —** *"`ArrayList` or `LinkedList`?"*
>
> **Say:** `ArrayList`, almost always. `get(i)` is $O(1)$ against $O(n)$, both append in $O(1)$, and one contiguous array is far kinder to the CPU cache than a chain of nodes. `LinkedList`'s $O(1)$ insert only helps when an iterator already sits at that spot. For a queue or stack, use `ArrayDeque` (§38.6).

### 3. Loop over a list

```java
for (int i = 0; i < list.size(); i++) list.get(i);   // need i
for (int x : list) { }                          // values (unboxed)
// Remove while looping → removeIf, or the iterator's own remove()
list.removeIf(x -> x % 2 == 1);           // [5, 2, 9, 1] → [2]   one O(n) pass
for (Iterator<Integer> it = list.iterator(); it.hasNext(); )
    if (it.next() % 2 == 1) it.remove();  // [5, 2, 9, 1] → [2]
```

- A for-each runs an `Iterator`. Call `list.add` or `list.remove` inside it and the next step throws `ConcurrentModificationException`. `removeIf` is one $O(n)$ pass; `it.remove()` shifts the tail on every call.

### 4. Useful methods

![Cheat sheet of ArrayList methods, idioms and traps on list = 5, 2, 9, 1. Search and sort: contains(9) is true (an O(n) scan), indexOf(9) is 2, sort(null) gives 1, 2, 5, 9 and sort(Collections.reverseOrder()) gives 9, 5, 2, 1. Java 21+: getFirst() 5, getLast() 1, removeLast() 1, reversed() 1, 9, 2, 5. Collections: swap(list, 0, 3) gives 1, 2, 9, 5; max 9; frequency of 9 is 1; nCopies(3, 0). Bulk and convert: removeIf leaves 2, 1; subList(1, 3) is a view of 2, 9; mapToInt toArray gives an int array; toArray(new int(0)()) gives a 2-D array. Idioms: backtracking copies the path and removes the last element (Subsets); a list as a stack (Asteroid Collision); add or set (Longest Increasing Subsequence). Traps: res.add(path) shares one list; remove in a for-each throws ConcurrentModificationException; List.of add throws UnsupportedOperationException; == on Integer fails for big values; contains in a loop is O(n squared).](diagrams/java38_info_arraylist_methods_idioms_ai.png)

Each line starts fresh from `list = [5, 2, 9, 1]`.

```java
// ── Search and sort (comparators: §38.10) ─── O(n) / O(n log n)
list.contains(9)                        // true   scans every element
list.indexOf(9)                         // 2      (-1 if missing)
list.sort(null);                        // [1, 2, 5, 9]  natural
list.sort(Collections.reverseOrder());  // [9, 5, 2, 1]
Collections.binarySearch(sorted, 5)     // 2   needs sorted = [1, 2, 5, 9]

// ── Java 21+: first and last ─────────────────
list.getFirst()                   // 5   (empty → NoSuchElementException)
list.getLast()                    // 1
list.removeLast()                 // returns 1 → [5, 2, 9]    O(1)
list.reversed()                   // [1, 9, 2, 5] — a view, not a copy

// ── Bulk, views, Collections, convert ─────── O(n)
list.removeIf(x -> x > 4)       // true → [2, 1]
list.subList(1, 3)              // [2, 9]  a VIEW of index 1..2
list.subList(1, 3).clear();     // [5, 1]  delete a range in place
Collections.reverse(list);      // [1, 9, 2, 5]   in place
Collections.swap(list, 0, 3);   // [1, 2, 9, 5]   O(1)
Collections.max(list)           // 9
list.stream().mapToInt(Integer::intValue).toArray()  // int[] (§38.2)
pairs.toArray(new int[0][])                          // int[][]
```

**Remember**

- `List.of`, `List.copyOf`, `stream().toList()` and `nCopies` are read-only: `add`, `set` and `remove` throw `UnsupportedOperationException`. `Arrays.asList` is fixed-size: `set` works, `add`/`remove` throw.
- `subList` and `reversed` are views: writes go through to the parent. Add to or remove from the parent, and an old `subList` throws `ConcurrentModificationException`.
- `getFirst`, `getLast`, `removeLast` and `reversed` need Java 21+ ([Ch 38b](#content/38b_java_modern)). On older judges, write `get(list.size() - 1)`.

### 5. DSA idioms you'll write every day

```java
// 1. Backtracking: save a COPY, undo the last choice — Subsets, Permutations
void dfs(int[] nums, int start, List<Integer> path, List<List<Integer>> res) {
    res.add(new ArrayList<>(path));      // copy! not res.add(path)
    for (int i = start; i < nums.length; i++) {
        path.add(nums[i]);               // choose
        dfs(nums, i + 1, path, res);     // explore
        path.remove(path.size() - 1);    // un-choose (index → O(1))
    }
}
// [1, 2, 3] → [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]

// 2. Rows of a result — Pascal's Triangle, Level Order Traversal
List<List<Integer>> tri = new ArrayList<>();
for (int i = 0; i < n; i++) {
    List<Integer> row = new ArrayList<>();
    for (int j = 0; j <= i; j++)
        row.add(j == 0 || j == i ? 1 : tri.get(i - 1).get(j - 1) + tri.get(i - 1).get(j));
    tri.add(row);
}
// n = 4 → [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1]]

// 3. A list as a stack — Asteroid Collision, Simplify Path
st.add(x);                       // push
st.get(st.size() - 1)            // peek   (Java 21+: st.getLast())
st.remove(st.size() - 1);        // pop    (Java 21+: st.removeLast())

// 4. Pairs in, int[][] out — Merge Intervals, Insert Interval
List<int[]> out = new ArrayList<>();
for (int[] iv : intervals) {     // already sorted by start
    if (out.isEmpty() || out.getLast()[1] < iv[0]) out.add(iv);
    else out.getLast()[1] = Math.max(out.getLast()[1], iv[1]);
}
return out.toArray(new int[0][]);
// [[1, 3], [2, 6], [8, 10]] → [[1, 6], [8, 10]]

// 5. Add or set by position — Longest Increasing Subsequence
List<Integer> tails = new ArrayList<>();
for (int x : nums) {
    int i = Collections.binarySearch(tails, x);
    if (i < 0) i = -i - 1;       // insertion point
    if (i == tails.size()) tails.add(x); else tails.set(i, x);
}
// [10, 9, 2, 5, 3, 7, 101, 18] → tails.size() = 4
```

### 6. Traps

| ✗ Mistake | What happens | ✓ Fix |
|---|---|---|
| `list.remove(1)` for the value 1 | removes **index** 1 | `remove(Integer.valueOf(1))` |
| `res.add(path)` | every row is one list | `res.add(new ArrayList<>(path))` |
| `list.remove(x)` in a for-each | `ConcurrentModificationException` | `removeIf` or `it.remove()` |
| `new ArrayList<>(n)`, then `set(0, x)` | `IndexOutOfBoundsException` | `add(x)`, or `nCopies(n, 0)` |
| `List.of(1, 2).add(3)` | `UnsupportedOperationException` | `new ArrayList<>(List.of(1, 2))` |
| `Arrays.asList(1, 2).add(3)` | `UnsupportedOperationException` | `new ArrayList<>(...)` (§38.2) |
| `nCopies(n, new ArrayList<>())` | n names for one list | `add(new ArrayList<>())` in a loop |
| keep a `subList`, then `list.add` | `ConcurrentModificationException` | copy: `new ArrayList<>(sub)` |
| `contains` inside a loop | $O(n^2)$ | a `HashSet` (§38.5) |

### 7. Try it

One complete program — the output is real (JDK 25).

```java
// ArrayList traps: remove(int) vs remove(Object), snapshots, CME, Java 21 views.
import java.util.*;

public class ListTraps {
    static void subsets(int[] nums, int start, List<Integer> path,
                        List<List<Integer>> res, boolean copy) {
        res.add(copy ? new ArrayList<>(path) : path);
        for (int i = start; i < nums.length; i++) {
            path.add(nums[i]);                    // choose
            subsets(nums, i + 1, path, res, copy);
            path.remove(path.size() - 1);         // un-choose
        }
    }
    public static void main(String[] args) {
        List<Integer> a = new ArrayList<>(List.of(1, 2, 3)), b = new ArrayList<>(a);
        a.remove(1); b.remove(Integer.valueOf(1));   // index 1 vs value 1
        System.out.println("remove(1) -> " + a + ", remove(Integer.valueOf(1)) -> " + b);
        List<List<Integer>> good = new ArrayList<>(), bad = new ArrayList<>();
        subsets(new int[]{1, 2, 3}, 0, new ArrayList<>(), good, true);
        subsets(new int[]{1, 2, 3}, 0, new ArrayList<>(), bad, false);
        System.out.println("with copy    -> " + good + "\nwithout copy -> " + bad);
        List<Integer> xs = new ArrayList<>(List.of(1, 2, 3, 4, 5));
        try { for (Integer x : xs) if (x % 2 == 0) xs.remove(x); }
        catch (ConcurrentModificationException e) { System.out.println("for-each remove -> " + e); }
        xs.removeIf(x -> x % 2 == 0);
        System.out.println("removeIf -> " + xs);
        try { List.of(1, 2).add(3); }
        catch (UnsupportedOperationException e) { System.out.println("List.of(1, 2).add(3) -> " + e); }
        List<Integer> q = new ArrayList<>(List.of(5, 2, 9, 1));
        List<Integer> rev = q.reversed();         // Java 21+: a view, not a copy
        q.add(7);
        System.out.println("getLast() = " + q.getLast() + ", reversed after add(7) -> " + rev);
    }
}
```

**Output:**

```
remove(1) -> [1, 3], remove(Integer.valueOf(1)) -> [2, 3]
with copy    -> [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]
without copy -> [[], [], [], [], [], [], [], []]
for-each remove -> java.util.ConcurrentModificationException
removeIf -> [1, 3, 5]
List.of(1, 2).add(3) -> java.lang.UnsupportedOperationException
getLast() = 7, reversed after add(7) -> [7, 1, 9, 2, 5]
```

- **Without copy:** all eight rows are the same `path` object, which is empty when the search ends.
- **`reversed()`** is a live view, so it shows the `7` added after it was created.

<details>
<summary><strong>Quick check.</strong> <code>List&lt;Integer&gt; dp = new ArrayList&lt;&gt;(n); dp.set(0, 1);</code> — what happens?</summary>

`IndexOutOfBoundsException: Index 0 out of bounds for length 0`. `n` is the capacity, not the size — the list is still empty. Use `new ArrayList<>(Collections.nCopies(n, 0))`, or just an `int[]`.

</details>

<details>
<summary><strong>Quick check.</strong> A method returns <code>list.subList(0, k)</code>. The caller later runs <code>list.add(x)</code>, then reads the sub-list. What happens?</summary>

`ConcurrentModificationException`. `subList` is a **view** of the parent, and an `add` or `remove` on the parent breaks it. Return a copy: `new ArrayList<>(list.subList(0, k))`.

</details>

---

## 38.5 HashMap & HashSet ★★★

**Use a `HashMap` when** you look things up by key — counts, value → index, groups, graph neighbours. **Use a `HashSet` when** you only ask "seen it before?" — duplicates, visited nodes. Both turn an $O(n^2)$ nested search into one $O(n)$ pass.

![Cheat sheet on defining and using Java HashMap and HashSet. Declare: Map of String to Integer as new HashMap, Set of Integer as new HashSet, a graph as Map of Integer to List of Integer, and an immutable Map.of; interface on the left, class on the right. How get works: the key cat goes through hashCode() to 98262, which picks bucket 7 of 16; the bucket holds ape=1 then cat=3, and equals() finds cat. Map basics on map = {a=1, b=2}: put c 3 returns null, put a 9 returns the old value 1, get a is 1, get z is null, containsKey b is true, remove a returns 1. Set basics on set = {1, 2}: add 3 is true, add 2 is false (a duplicate), contains 1 is true, size is 2. Grid-cell keys that work: record Cell, List.of(r, c), r + comma + c, and r * cols + c; an int array fails. Cost: get, put, containsKey, remove O(1) average; containsValue O(n); order unspecified.](diagrams/java38_info_hashmap_define_ai.png)

### Simple Explanation

A `HashMap` is a cloakroom. The attendant turns your ticket (the **key**) into a hook number and walks straight to that hook — no searching. In Java, `hashCode()` makes the number, and the number picks a **bucket**. So `get` costs the same for 10 entries or 10 million. A `HashSet` is the same cloakroom with tickets only — no coats: it just answers "is this one here?" fast. Neither keeps any order.

> **Official definition —** `HashMap` is the hash-table implementation of `Map`: each unique key maps to one value, with constant-time `get` and `put` on average; `HashSet` is a `Set` backed by a `HashMap`.

### HashMap & HashSet at a glance

| Topic | Answer |
|---|---|
| Import | `java.util.*` |
| Declare | `Map<K, V> m = new HashMap<>();` |
| Keys | unique; `put` on an old key replaces its value |
| `get`, `put`, `containsKey`, `remove` | $O(1)$ on average |
| `containsValue` | $O(n)$ — scans every entry |
| Iteration order | unspecified — never rely on it |
| `null` | one `null` key and any `null` values |
| Need sorted or insertion order? | `TreeMap` or `LinkedHashMap` (§38.8) |

### 1. Define a map or set

```java
Map<String, Integer> count = new HashMap<>();        // interface left, class right
Map<Integer, List<Integer>> adj = new HashMap<>();   // graph
Set<Integer> seen = new HashSet<>();
Set<Integer> uniq = new HashSet<>(List.of(3, 1, 3)); // {1, 3}: dedupes a list
Map<Character, Character> pair = Map.of(')', '(', ']', '[', '}', '{'); // fixed data
pair.put('>', '<');   // ✗ UnsupportedOperationException — Map.of is immutable
```

- Generics take wrapper types: `Map<Integer, Integer>`, never `Map<int, int>`. `Map.of` takes up to 10 pairs; for more, use `Map.ofEntries(Map.entry(k, v), …)`.

### 2. Useful methods — `Map`

![Cheat sheet of HashMap and HashSet methods on map = {a=1, b=2} and set = {1, 2, 3}. Update in one call: merge(a, 1, Integer::sum) gives {a=2, b=2}; putIfAbsent(a, 7) returns 1 and keeps a; computeIfAbsent(z, k -> 0) returns 0 and adds z; computeIfPresent(a, (k, v) -> v * 10) gives {a=10, b=2}; merge(a, -1, ...) whose function returns null at zero gives {b=2}, because null removes the key. Read safely: getOrDefault(z, 0) is 0, containsValue(2) is true but O(n), size is 2. A list per key: adj.computeIfAbsent(u, k -> new ArrayList).add(v). Walk a map: entrySet loop, keySet a, b, values 1, 2, forEach, values().removeIf(v -> v < 2) gives {b=2}, replaceAll. Set algebra with other = {2, 3, 4}: addAll union {1, 2, 3, 4}, retainAll intersection {2, 3}, removeAll difference {1}. Convert: new HashSet(list), new ArrayList(set), new HashMap(map), Map.entry(a, 1).](diagrams/java38_info_hashmap_methods_ai.png)

Each line starts fresh from `map = {a=1, b=2}` (a `Map<String, Integer>`).

```java
// ── Put, get, remove ──────────────────────── O(1)
map.put("a", 9)             // 1     (the OLD value; null if new) → {a=9, b=2}
map.get("z")                // null  ← not 0
map.getOrDefault("z", 0)    // 0
map.containsKey("a")        // true
map.containsValue(2)        // true  — but O(n): scans every value
map.remove("a")             // 1     → {b=2}

// ── Update in one call ────────────────────── O(1)
map.merge("a", 1, Integer::sum)     // 2     → {a=2, b=2}
map.merge("z", 1, Integer::sum)     // 1     → z=1 added
map.putIfAbsent("a", 7)             // 1     a kept (returns old)
map.computeIfAbsent("z", k -> 0)    // 0     → z=0 added
map.merge("a", -1, (x, y) -> x + y == 0 ? null : x + y) // null, {b=2}
adj.computeIfAbsent(u, k -> new ArrayList<>()).add(v); // list per key: returns the stored list

// ── Walk and change ───────────────────────── O(n)
for (Map.Entry<String, Integer> e : map.entrySet()) {
    String k = e.getKey();          // "a", then "b" — order not promised
    int v = e.getValue();           // 1, then 2
    e.setValue(v + 1);              // changing a value: safe
}
for (String k : map.keySet()) { }   // keys only (map.values(): values only)
map.values().removeIf(v -> v < 2);                    // {b=2}
map.entrySet().removeIf(e -> e.getKey().equals("b")); // {a=1}
```

**Remember**

- `merge(k, v, f)`: key absent → stores `v`; present → stores `f(old, v)`. A `null` from `f` deletes the key.
- `get` returns `null` for a missing key. Never assign it straight to an `int` (§6).
- Adding or removing keys in a for-each over the map throws `ConcurrentModificationException`. Use `removeIf`.

### 3. Useful methods — `Set`

Each line starts fresh from `set = {1, 2, 3}` and `other = {2, 3, 4}`.

```java
// ── Add, check, remove ────────────────────── O(1)
set.add(4)              // true  → {1, 2, 3, 4}
set.add(2)              // false — already there: a duplicate!
set.contains(2)         // true
set.remove(9)           // false — was not there

// ── Set algebra (changes set in place) ────── O(n)
set.addAll(other);      // union        → {1, 2, 3, 4}
set.retainAll(other);   // intersection → {2, 3}
set.removeAll(other);   // difference   → {1}
Set<Integer> common = new HashSet<>(set);  // keep set unchanged:
common.retainAll(other);                   // work on a copy → {2, 3}
```

- `add` checks and inserts in one call — `if (!seen.add(x))` is the one-line duplicate test. A `Set` has no `get(i)`.

### 4. Keys: `equals`, `hashCode` and grid cells

How `get` finds a key — `hashCode()` picks the bucket, `equals()` picks the entry:

```
  map = {ape=1, cat=3}            map.get("cat")
    1. "cat".hashCode() → 98262
    2. pick bucket 7 of 16 ─────┐
                                ▼
  ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬─────┬────┐
  │ 0 │ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │ 7 │ 8 │ ... │ 15 │
  └───┴───┴───┴───┴───┴───┴───┴─┬─┴───┴─────┴────┘
                                ▼
                       [ape=1] ──► [cat=3]
    3. equals() walks bucket 7: "ape" no, "cat" yes → 3
```

`"ape"` also lands in bucket 7 — a *collision*. That is normal; it only costs an extra `equals`.

```java
// A grid cell (r, c) as a key — four ways that work
record Cell(int r, int c) { }        // equals + hashCode written for you
seen.add(new Cell(1, 2));
seen.contains(new Cell(1, 2))        // true
s.add(List.of(1, 2));                // Set<List<Integer>>
s.contains(List.of(1, 2))            // true
String key = r + "," + c;            // "1,2" (comma: 1,23 ≠ 12,3)
int id = r * cols + c;               // fastest: one int, no objects (§38.2)
bad.add(new int[]{1, 2});            // Set<int[]>
bad.contains(new int[]{1, 2})        // false ✗ an array is compared by address
```

**The contract** for your own key class:

- If `a.equals(b)`, then `a.hashCode() == b.hashCode()`. Override **both**, from the same fields — or use a `record` ([Ch 38b](#content/38b_java_modern) §38b.2).
- Never change a key after `put`. Its hash changes, and the entry is stranded in the old bucket.
- `record Key(int[] a)` is still broken — the record compares the array by address.

> **Interview —** *"How does `HashMap` work inside?"*
>
> **Say:** It is an array of buckets — 16 at first. `hashCode()` picks the bucket; `equals()` finds the key inside it. When the size passes capacity × 0.75 (the *load factor*), the array doubles and every entry moves, so `put` is $O(1)$ amortised. In OpenJDK, a bucket with more than 8 keys (in a table of at least 64) becomes a red-black tree, so heavy collisions on `Comparable` keys cost $O(\log n)$, not $O(n)$.

### 5. DSA idioms you'll write every day

![Cheat sheet of HashMap and HashSet idioms and traps. Idioms: count with cnt.merge(x, 1, Integer::sum) (Top K Frequent); value to index with idx.get(target - x), then idx.put(x, i) (Two Sum); prefix-sum counts with pre.put(0, 1), pre.getOrDefault(sum - k, 0) and pre.merge(sum, 1, Integer::sum) (Subarray Sum Equals K); last index seen, moving lo past last.get(c) (Longest Substring Without Repeating); if not seen.add(x) return true (Contains Duplicate, BFS visited); x starts a run when the set lacks x - 1 (Longest Consecutive Sequence). Traps: int x = map.get(k) throws NPE when k is absent; Integer == fails above 127; putIfAbsent(k, list).add(v) throws NPE the first time and getOrDefault(k, list).add(v) never stores the list, so use computeIfAbsent; map.remove in a for-each throws ConcurrentModificationException; equals without hashCode; a key changed after put is lost; Map.of with a repeated key throws IllegalArgumentException.](diagrams/java38_info_hashmap_idioms_traps_ai.png)

```java
// 1. Count things — Valid Anagram, Top K Frequent Elements
for (char ch : s.toCharArray()) cnt.merge(ch, 1, Integer::sum);
// "banana" → {a=3, b=1, n=2}

// 2. Value → index — Two Sum
for (int i = 0; i < nums.length; i++) {
    Integer j = idx.get(target - nums[i]);   // Integer: may be null
    if (j != null) return new int[]{j, i};
    idx.put(nums[i], i);
}

// 3. Group by a key — Group Anagrams
for (String w : words) {
    char[] c = w.toCharArray();
    Arrays.sort(c);
    groups.computeIfAbsent(new String(c), k -> new ArrayList<>()).add(w);
}
// [eat, tea, tan, ate] → {aet=[eat, tea, ate], ant=[tan]}

// 4. Prefix-sum counts — Subarray Sum Equals K
pre.put(0, 1);                      // the empty prefix has sum 0
for (int x : nums) {
    sum += x;
    ans += pre.getOrDefault(sum - k, 0);
    pre.merge(sum, 1, Integer::sum);
}
// nums = [1, 1, 1], k = 2 → ans = 2

// 5. Seen / visited — Contains Duplicate, BFS on a graph
for (int x : nums) if (!seen.add(x)) return true;
if (visited.add(nb)) queue.offer(nb);   // add = check + mark

// 6. Set as a lookup — Longest Consecutive Sequence
for (int x : all) {                     // all = a HashSet of nums
    if (all.contains(x - 1)) continue;  // x does not start a run
    int len = 1;
    while (all.contains(x + len)) len++;
    longest = Math.max(longest, len);
}
// [100, 4, 200, 1, 3, 2] → longest = 4 (1, 2, 3, 4)
```

### 6. Traps

| ✗ Mistake | What happens | ✓ Fix |
|---|---|---|
| `int x = map.get(k);` | NPE if `k` is absent | `getOrDefault(k, 0)` |
| `map.get(a) == map.get(b)` | `false` above 127 | `.equals(...)` (§38.11) |
| `putIfAbsent(k, list).add(v)` | NPE the first time | `computeIfAbsent(k, ...)` |
| `getOrDefault(k, list).add(v)` | list is never stored | `computeIfAbsent(k, ...)` |
| `map.remove(k)` in a `keySet()` loop | `ConcurrentModificationException` | `entrySet().removeIf(...)` |
| `equals` without `hashCode` | `get` returns `null` | override both, or a `record` |
| change a key after `put` | entry lost in old bucket | immutable keys |
| `int[]` key, `HashSet<int[]>` | lookups fail, duplicates kept | `List.of(r, c)` or a `record` |
| `Map.of("a", 1, "a", 2)` | `IllegalArgumentException` | unique keys |
| `null` in `Map.of` or `Set.of` | `NullPointerException` | `new HashMap<>()` |

### 7. Try it

One complete program — the output is real (JDK 25).

```java
// HashMap & HashSet: the null trap, merge, computeIfAbsent, add, keys, safe removal.
import java.util.*;

public class HashBasics {
    record Cell(int r, int c) { }

    public static void main(String[] args) {
        Map<Character, Integer> cnt = new HashMap<>();
        for (char ch : "banana".toCharArray()) cnt.merge(ch, 1, Integer::sum);
        System.out.println("count banana   -> " + cnt);
        System.out.println("get('z')       -> " + cnt.get('z') + ", getOrDefault -> " + cnt.getOrDefault('z', 0));
        try { int x = cnt.get('z'); }                                // unboxes null
        catch (NullPointerException e) { System.out.println("int x = get(z) -> NullPointerException"); }

        Map<Integer, List<Integer>> adj = new HashMap<>();
        for (int[] e : new int[][]{{1, 2}, {1, 3}, {2, 3}})
            adj.computeIfAbsent(e[0], k -> new ArrayList<>()).add(e[1]);
        System.out.println("adjacency      -> " + adj);

        Set<Integer> seen = new HashSet<>();
        System.out.println("add 3, 1, 3    -> " + seen.add(3) + ", " + seen.add(1) + ", " + seen.add(3));
        System.out.println("contains key   -> record " + Set.of(new Cell(1, 2)).contains(new Cell(1, 2))
                + ", List.of " + Set.of(List.of(1, 2)).contains(List.of(1, 2))
                + ", int[] " + Set.of(new int[]{1, 2}).contains(new int[]{1, 2}));

        try { for (char k : cnt.keySet()) if (cnt.get(k) == 1) cnt.remove(k); }
        catch (ConcurrentModificationException e) { System.out.println("remove in loop -> " + e + ", cnt = " + cnt); }
        cnt.values().removeIf(v -> v < 3);
        System.out.println("removeIf(v<3)  -> " + cnt);
    }
}
```

**Output:**

```
count banana   -> {a=3, b=1, n=2}
get('z')       -> null, getOrDefault -> 0
int x = get(z) -> NullPointerException
adjacency      -> {1=[2, 3], 2=[3]}
add 3, 1, 3    -> true, true, false
contains key   -> record true, List.of true, int[] false
remove in loop -> java.util.ConcurrentModificationException, cnt = {a=3, n=2}
removeIf(v<3)  -> {a=3}
```

- The bad loop removed `b`, *then* threw on the next step — the map is left half-changed.

<details>
<summary><strong>Quick check.</strong> In one call, decrement the count of <code>c</code> and delete the key when it reaches 0.</summary>

`win.merge(c, -1, (a, b) -> a + b == 0 ? null : a + b);` — when the function returns `null`, `merge` removes the entry. `win.size()` then stays equal to the number of distinct characters in a sliding window.

</details>

<details>
<summary><strong>Quick check.</strong> A <code>HashMap&lt;Point, String&gt;</code> returns <code>null</code> for a key you just put. Give two causes.</summary>

Either `Point` overrides `equals` but not `hashCode` (the lookup searches the wrong bucket), or a field of the key changed after `put` (the entry is stranded under its old hash). Fix both with an immutable `record Point(int x, int y)`.

</details>

---

## 38.6 Stack, Queue & Deque — ArrayDeque ★★★

**Use `ArrayDeque` when** you need a stack (brackets, monotonic stack, iterative DFS, undo), a queue (BFS, level order) or both ends at once (sliding window). One class does all three, $O(1)$ at each end — the stack and queue behind most of [Ch 31–31d](#content/31_dsa_foundations).

![Cheat sheet on defining and using Java ArrayDeque. Declare with an interface type: Deque of Integer stack = new ArrayDeque (LIFO), Queue of Integer q (FIFO), Deque of Integer dq (both ends) and a Queue of int arrays for grid BFS cells. Two ends, one deque: boxes 1, 2, 3, 4 with the head (First) on the left and the tail (Last) on the right; push, pop and peek work at the head, poll and peek take from the head and offer adds at the tail. Stack after push 1, 2, 3 prints 3, 2, 1; peek and pop give 3. Queue after offer 1, 2, 3 prints 1, 2, 3; peek and poll give 1. On an empty deque element, getFirst, getLast, pop, remove, removeFirst and removeLast throw NoSuchElementException, while the peek and poll methods return null. On 1, 2, 3: size 3, isEmpty false, contains(2) true in O(n), for-each runs head to tail. No null elements: offer(null) throws NullPointerException.](diagrams/java38_info_deque_define_ai.png)

### Simple Explanation

A deque (say "deck") is a line you can join or leave at **both** ends. Use only the front and it is a **stack** — last in, first out, like a pile of plates. Join at the back and leave from the front and it is a **queue** — first in, first out, like a ticket line.

`ArrayDeque` keeps the line in a circular array with a head index and a tail index. Adding or removing at either end only moves an index — nothing shifts — so both ends cost $O(1)$.

> **Official definition —** `ArrayDeque` is a resizable circular-array implementation of `Deque`: amortised $O(1)$ add and remove at both ends, no `null` elements, not thread-safe.

### ArrayDeque at a glance

| Topic | Answer |
|---|---|
| Import | `java.util.ArrayDeque`, `Deque`, `Queue` |
| Declare | a `Deque` or `Queue` variable, `new ArrayDeque<>()` |
| Which end? | stack: head only · queue: in at tail, out at head |
| Add, remove or peek at an end | $O(1)$ amortised |
| `contains(x)`, `remove(x)` | $O(n)$ — it scans |
| `null` elements? | no — `NullPointerException` |
| Need `get(i)` or sorted order? | `ArrayList` (§38.4), `PriorityQueue` (§38.7) |

### 1. Define a stack, a queue or a deque

```java
import java.util.*;          // ArrayDeque, Deque, Queue

Deque<Integer> stack = new ArrayDeque<>();  // stack (LIFO) — never java.util.Stack
Queue<Integer> q     = new ArrayDeque<>();  // queue (FIFO) — only queue methods show
Deque<Integer> dq    = new ArrayDeque<>();  // both ends: Sliding Window Maximum
Queue<int[]> cells   = new ArrayDeque<>();  // grid BFS: {r, c} (§38.2)
Deque<Integer> d     = new ArrayDeque<>(List.of(1, 2, 3));  // [1, 2, 3], head 1

Stack<Integer> s  = new Stack<>();       // ✗ legacy: synchronized, prints bottom-first
Queue<Integer> lq = new LinkedList<>();  // ✗ works, but a node per element; allows null
```

One deque, two ends — a stack uses only the head; a queue adds at the tail and takes from the head:

```
            stack:  push · pop · peek
            queue:  poll · peek   (out)
                    │ ▲
                    ▼ │
                  ┌─────┬─────┬─────┬─────┐
    head (First)  │  1  │  2  │  3  │  4  │  tail (Last) ◄── offer
                  └─────┴─────┴─────┴─────┘
    head end:  offerFirst · pollFirst · peekFirst
    tail end:  offerLast  · pollLast  · peekLast
```

> **Interview —** *"You need a stack in Java. Why `ArrayDeque` and not `Stack`?"*
>
> **Say:** `Stack` extends `Vector`, so every call is `synchronized` — a lock you never need inside an algorithm. It also iterates and prints bottom-to-top, the opposite of pop order. `ArrayDeque` has no locks and no per-element nodes; its Javadoc says it is likely faster than `Stack` as a stack, and than `LinkedList` as a queue.

### 2. Use it as a stack or a queue

Each line starts fresh: `stack` after `push(1); push(2); push(3);`, and `q` after `offer(1); offer(2); offer(3);`.

```java
// ── Stack: push, pop, peek at the head ────── O(1)
stack                // [3, 2, 1]      prints top first
stack.push(4);       // [4, 3, 2, 1]
stack.peek()         // 3   look only
stack.pop()          // 3   → [2, 1]

// ── Queue: offer at the tail, poll at the head ── O(1)
q                    // [1, 2, 3]      prints head first
q.offer(4);          // [1, 2, 3, 4]
q.peek()             // 1   look only
q.poll()             // 1   → [2, 3]
```

- `push` adds at the **head**, `offer` at the **tail**; `peek()` and `poll()` always mean the head — top of a stack, front of a queue.

### 3. Both ends, empty deques and loops

Each line starts fresh from `dq = [1, 2, 3]` — head `1`, tail `3`.

```java
// ── Add ───────────────────────────────────── O(1)
dq.offerFirst(0);    // [0, 1, 2, 3]   same as push(0)
dq.offerLast(4);     // [1, 2, 3, 4]   same as offer(4)
// ── Look ──────────────────────────────────── O(1)
dq.peekFirst()       // 1              same as peek()
dq.peekLast()        // 3
// ── Remove ────────────────────────────────── O(1)
dq.pollFirst()       // 1 → [2, 3]     same as poll()
dq.pollLast()        // 3 → [1, 2]
```

**Empty deque — throw or `null`?** Every look and remove comes in two families:

| On an empty deque | Throws `NoSuchElementException` | Returns `null` |
|---|---|---|
| Look at head | `element()`, `getFirst()` | `peek()`, `peekFirst()` |
| Look at tail | `getLast()` | `peekLast()` |
| Remove head | `pop()`, `remove()`, `removeFirst()` | `poll()`, `pollFirst()` |
| Remove tail | `removeLast()` | `pollLast()` |

- Adding never fails — the deque grows — but every add throws `NullPointerException` for `null`. In DSA, guard with `isEmpty()`: `while (!st.isEmpty() && …) st.pop();`.

```java
// ── Search and loop ───────────────────────── (dq = [1, 2, 3])
dq.contains(2)             // true     O(n) — it scans
dq.remove(2)               // true     removes the VALUE 2 → [1, 3]
for (int x : dq) { }       // 1, 2, 3  head → tail
dq.descendingIterator()    // 3, 2, 1  tail → head
dq.reversed()              // [3, 2, 1] a live view (Java 21+)
```

- For a stack, head → tail is **pop order**: `for (int x : stack)` visits the top first. There is no `get(i)` — use an `ArrayList` (§38.4).

### 4. DSA idioms you'll write every day

![Cheat sheet of Java ArrayDeque idioms and traps. Idioms: matching brackets, pushing the expected closer (Valid Parentheses); a monotonic stack of indexes that pops j while t(st.peek()) is less than t(i), sets ans(j) = i - j, then pushes i (Daily Temperatures, Next Greater Element); BFS level by level with a snapshot int size = q.size() (Level Order Traversal, Rotting Oranges); sliding window max: pollLast smaller tail values, offerLast(i), pollFirst when the head index leaves the window; Min Stack storing value and min so far; pop b first, then a, and push a - b (Evaluate Reverse Polish Notation). Traps: new Stack is synchronized and prints bottom-first; pop on empty throws NoSuchElementException; int x = q.poll() on empty and offer(null) throw NullPointerException; a.peek() == b.peek() is false for 1000, so use equals; i < q.size() in BFS mixes levels; push then offer use different ends.](diagrams/java38_info_deque_idioms_traps_ai.png)

```java
// 1. Matching brackets — Valid Parentheses: push the closer you expect
Deque<Character> st = new ArrayDeque<>();
for (char c : s.toCharArray()) {
    if (c == '(') st.push(')');
    else if (c == '[') st.push(']');
    else if (c == '{') st.push('}');
    else if (st.isEmpty() || st.pop() != c) return false;
}
return st.isEmpty();          // "([]{})" → true, "(]" → false

// 2. Monotonic stack of indexes — Daily Temperatures, Next Greater Element
Deque<Integer> st = new ArrayDeque<>();   // indexes still waiting
for (int i = 0; i < n; i++) {
    while (!st.isEmpty() && t[st.peek()] < t[i]) {
        int j = st.pop();                 // i is j's warmer day
        ans[j] = i - j;
    }
    st.push(i);
}
// t = [73, 74, 75, 71, 69, 72, 76, 73] → [1, 1, 4, 2, 1, 1, 0, 0]

// 3. BFS level by level — Level Order Traversal, Rotting Oranges (grid DIRS: §38.2)
Queue<TreeNode> q = new ArrayDeque<>();
if (root != null) q.offer(root);         // offer(null) throws NPE
while (!q.isEmpty()) {
    int size = q.size();                 // snapshot: this level only
    for (int i = 0; i < size; i++) {
        TreeNode node = q.poll();
        if (node.left != null) q.offer(node.left);
        if (node.right != null) q.offer(node.right);
    }                                    // one whole level done here
}

// 4. Monotonic deque of indexes — Sliding Window Maximum
Deque<Integer> dq = new ArrayDeque<>();  // values fall head → tail
for (int i = 0; i < n; i++) {
    while (!dq.isEmpty() && a[dq.peekLast()] <= a[i]) dq.pollLast();
    dq.offerLast(i);
    if (dq.peekFirst() <= i - k) dq.pollFirst();   // left the window
    if (i >= k - 1) res[i - k + 1] = a[dq.peekFirst()];
}
// a = [1, 3, -1, -3, 5, 3, 6, 7], k = 3 → [3, 3, 5, 5, 6, 7]

// 5. Min Stack — each entry remembers the min below it
Deque<int[]> st = new ArrayDeque<>();    // {value, min so far}
void push(int x) {
    int min = st.isEmpty() ? x : Math.min(x, st.peek()[1]);
    st.push(new int[]{x, min});
}
int getMin() { return st.peek()[1]; }

// 6. Evaluate Reverse Polish Notation — pop b first, then a
case "-" -> { int b = st.pop(); st.push(st.pop() - b); }   // inside switch (tok)
// ["2", "1", "+", "3", "*"] → 9
```

- Store **indexes**, not values, in monotonic stacks and deques: `t[st.peek()]` gives the value back.
- Iterative DFS is the same loop as BFS with `push`/`pop` — its stack lives on the heap, so no `StackOverflowError`.

### 5. Traps

| ✗ Mistake | What happens | ✓ Fix |
|---|---|---|
| `new Stack<>()` | locks; iterates bottom-to-top | `new ArrayDeque<>()` |
| `pop()` on empty | `NoSuchElementException` | check `isEmpty()` first |
| `int x = q.poll();` on empty | `null` unboxed → NPE | check `isEmpty()` first |
| `while (t[st.peek()] < t[i])` | NPE once the stack empties | `!st.isEmpty() && …` first |
| `q.offer(root)`, root `null` | `NullPointerException` | `if (root != null)` |
| `push(x)` then `offer(y)` | `x` at head, `y` at tail | one style per deque |
| `st.peek() == min.peek()` | `false` for 1000 and 1000 | `.equals()` (§38.11) |
| `i < q.size()` in a level loop | levels get mixed up | `int size = q.size();` |
| `dq.contains(x)` in a loop | $O(n)$ each → $O(n^2)$ | keep a `HashSet` too (§38.5) |

### 6. Try it

One complete program — the output is real (JDK 25).

```java
import java.util.*;

public class DequeDemo {
    public static void main(String[] args) {
        Deque<Integer> st = new ArrayDeque<>();
        st.push(1); st.push(2); st.push(3);
        System.out.println("stack " + st + ", peek " + st.peek() + ", pop " + st.pop());
        Queue<Integer> q = new ArrayDeque<>(List.of(1, 2, 3));
        System.out.println("queue " + q + ", peek " + q.peek() + ", poll " + q.poll());
        Deque<Integer> mix = new ArrayDeque<>();
        mix.push(1); mix.offer(2); mix.push(3);           // different ends!
        System.out.println("push 1, offer 2, push 3 -> " + mix);
        Stack<Integer> legacy = new Stack<>();
        legacy.push(1); legacy.push(2); legacy.push(3);
        System.out.println("java.util.Stack prints " + legacy);

        Deque<Integer> empty = new ArrayDeque<>();
        System.out.println("empty: peek " + empty.peek() + ", poll " + empty.poll());
        try { empty.pop(); }
        catch (NoSuchElementException e) { System.out.println("pop()          -> NoSuchElementException"); }
        try { int x = empty.poll(); }
        catch (NullPointerException e) { System.out.println("int x = poll() -> NullPointerException"); }
        try { empty.offer(null); }
        catch (NullPointerException e) { System.out.println("offer(null)    -> NullPointerException"); }

        int[] t = {73, 74, 75, 71, 69, 72, 76, 73}, ans = new int[t.length];
        Deque<Integer> idx = new ArrayDeque<>();           // Daily Temperatures
        for (int i = 0; i < t.length; i++) {
            while (!idx.isEmpty() && t[idx.peek()] < t[i]) { int j = idx.pop(); ans[j] = i - j; }
            idx.push(i);
        }
        System.out.println("daily temps " + Arrays.toString(ans));
    }
}
```

**Output:**

```
stack [3, 2, 1], peek 3, pop 3
queue [1, 2, 3], peek 1, poll 1
push 1, offer 2, push 3 -> [3, 1, 2]
java.util.Stack prints [1, 2, 3]
empty: peek null, poll null
pop()          -> NoSuchElementException
int x = poll() -> NullPointerException
offer(null)    -> NullPointerException
daily temps [1, 1, 4, 2, 1, 1, 0, 0]
```

- `[3, 1, 2]`: `push` went to the head and `offer` to the tail, so `2` sits at the bottom of the "stack".

<details>
<summary><strong>Quick check.</strong> In BFS by level, why write <code>int size = q.size();</code> before the <code>for</code> loop?</summary>

The loop offers children, so `q.size()` changes while you loop. The snapshot stops exactly at the end of the current level. With `i < q.size()`, a 7-node tree came out as `[[1, 2, 3, 4], [5, 6], [7]]` instead of `[[1], [2, 3], [4, 5, 6, 7]]`.

</details>

<details>
<summary><strong>Quick check.</strong> In Sliding Window Maximum, why does the deque hold indexes and not values?</summary>

To know when the front has left the window: `if (dq.peekFirst() <= i - k) dq.pollFirst();`. A value cannot tell you where it was, and `a[dq.peekFirst()]` still gives the value back.

</details>

---

## 38.7 PriorityQueue — The Heap ★★★

**Use a `PriorityQueue` when** you keep asking "what is the smallest (or largest) item right now?" while items keep arriving — top-k, merging sorted lists, Dijkstra, a running median. Each answer costs $O(\log n)$, not a full sort.

![Cheat sheet on defining a Java PriorityQueue. Define: new PriorityQueue with no arguments is a MIN-heap, smallest on top; Collections.reverseOrder() or the lambda Integer.compare(b, a) makes a MAX-heap; building one from a list takes O(n). A heap of int arrays uses Comparator.comparingInt on x(0) and offers dist and node pairs; Comparator.comparingInt(Edge::w) orders records by field w. Tree and array form after offering 5, 9, 1, 7, 3, 8, 2: root 1, children 3 and 2, leaves 9, 7, 8, 5, stored as the array 1, 3, 2, 9, 7, 8, 5; peek() reads index 0, each parent is at most its children, and the children of i sit at 2i+1 and 2i+2. Core methods: offer and poll O(log n), peek, size and isEmpty O(1), poll and peek return null when empty, contains and remove(x) are O(n). Only the top is sorted: printing shows 1, 3, 2, 9, 7, 8, 5; polling until empty gives 1 2 3 5 7 8 9.](diagrams/java38_info_heap_define_ai.png)

### Simple Explanation

A priority queue is a hospital waiting room: the most urgent patient goes next, not the one who came first. In Java, "most urgent" means the **smallest** value — unless you pass a comparator.

Inside, it is a binary tree packed into an array, where every parent is ≤ its children. The smallest item sits at index 0, so `peek()` is free. The rest is only *loosely* ordered — printing a heap does not show sorted order.

> **Official definition —** `PriorityQueue` is an unbounded priority queue based on a binary heap, ordered by natural ordering or a `Comparator`; its head is the least element.

### PriorityQueue at a glance

| Topic | Answer |
|---|---|
| Import | `java.util.PriorityQueue` |
| Default order | **min-heap** — smallest first |
| Max-heap | pass `Collections.reverseOrder()` |
| `offer`, `poll` | $O(\log n)$ |
| `peek`, `size` | $O(1)$ |
| `contains`, `remove(x)` | $O(n)$ — linear scan |
| `null` allowed? | no — `NullPointerException` |
| Need sorted iteration? | `TreeSet` or `TreeMap` (§38.8) |

### 1. Define a heap

```java
// Min-heap (the default): smallest on top
PriorityQueue<Integer> minHeap = new PriorityQueue<>();

// Max-heap: largest on top
PriorityQueue<Integer> maxHeap =
    new PriorityQueue<>(Collections.reverseOrder());

// int[] entries, ordered by index 0 — Dijkstra's {dist, node}
PriorityQueue<int[]> pq =
    new PriorityQueue<>(Comparator.comparingInt(x -> x[0]));
pq.offer(new int[]{7, 0});

// Records, by a field
record Edge(int to, int w) {}
PriorityQueue<Edge> byW =
    new PriorityQueue<>(Comparator.comparingInt(Edge::w));

// ── From a collection (heapify) ─────────────── O(n)
PriorityQueue<Integer> h = new PriorityQueue<>(List.of(5, 9, 1, 7));
h.peek()                                    // 1
```

What the heap looks like inside — `offer` 5, 9, 1, 7, 3, 8, 2:

```
              1                ← index 0 = peek()
           /     \
          3       2            every parent ≤ its children
         / \     / \
        9   7   8   5          children of i: 2i + 1, 2i + 2
                               parent of i:   (i - 1) / 2
  array: [1, 3, 2, 9, 7, 8, 5]   ← what println(pq) shows
```

### 2. Core operations

Each line starts fresh from `pq = new PriorityQueue<>(List.of(5, 1, 9, 3))` — stored as `[1, 3, 9, 5]`.

```java
// ── Add / take the top ──────────────────────── O(log n)
pq.offer(0)          // true; peek() is now 0
pq.poll()            // 1; next top is 3
// ── Look ────────────────────────────────────── O(1)
pq.peek()            // 1
pq.size()            // 4
// empty heap: peek(), poll() → null
//             element(), remove() → NoSuchElementException
// ── By value: a linear scan ─────────────────── O(n)
pq.contains(9)       // true
pq.remove(9)         // true — removes one 9

// ── Only the top is sorted ─────────────────────
System.out.println(pq);   // [1, 3, 9, 5]  heap order; for-each is the same
List<Integer> out = new ArrayList<>();      // sorted → poll until empty
while (!pq.isEmpty()) out.add(pq.poll());   // [1, 3, 5, 9]  O(n log n)
```

**Remember**

- `int x = pq.poll();` on an empty heap throws `NullPointerException` (unboxing `null`) — loop on `!pq.isEmpty()`.
- A `PriorityQueue<int[]>` prints as `[[I@…` hashes. Print `Arrays.toString(pq.peek())`.
- No decrease-key. To change a priority: `remove(x)`, change it, `offer(x)` — or push a fresh entry and skip stale ones (idiom 4).

### 3. Ordering — min, max and custom

Each comparator goes into `new PriorityQueue<>(…)`. Full story, including why `b - a` overflows, in §38.10.

```java
Collections.reverseOrder()             // max-heap: natural order reversed
(a, b) -> Integer.compare(b, a)        // max-heap, overflow-safe
Comparator.comparingInt(x -> x[0])     // int[] by x[0], smallest first
(x, y) -> Integer.compare(y[0], x[0])  // int[] by x[0], largest first
Comparator.comparingInt(cnt::get)      // keys by their count in a Map
```

- Ties come out in **any** order — the heap is not stable. Add a tie-break key when order matters.
- There is no `(comparator, collection)` constructor. For a max-heap of a list: create it, then `addAll(list)`.

### 4. DSA idioms you'll write every day

![Cheat sheet of Java PriorityQueue idioms and traps. Idioms: a size-k min-heap whose peek() is the kth largest (Kth Largest Element); a heap by count with Comparator.comparingInt(cnt::get) (Top K Frequent Elements); a k-way merge that polls a node and offers its next (Merge K Sorted Lists); Dijkstra that skips stale entries when d is greater than dist(u) (Network Delay Time); two heaps, lo a max-heap and hi a min-heap, for a running median (Find Median from Data Stream); a min-heap of end times for Meeting Rooms II. Traps: b - a overflows, use Integer.compare(b, a); the default is a MIN-heap; a key changed after offer is not seen, so remove, change, offer; unboxing poll() on an empty heap throws NullPointerException; contains and remove(x) are O(n); ties come out in any order; reversed() on an untyped lambda does not compile. Top k: heap O(n log k) beats sorting O(n log n).](diagrams/java38_info_heap_idioms_traps_ai.png)

```java
// 1. Size-k MIN-heap — Kth Largest Element, Kth Largest in a Stream
PriorityQueue<Integer> pq = new PriorityQueue<>();
for (int x : nums) {
    pq.offer(x);
    if (pq.size() > k) pq.poll();        // evict the smallest
}
int kth = pq.peek();                     // {3,2,1,5,6,4}, k = 2 → 5

// 2. Heap by count — Top K Frequent Elements
Map<Integer, Integer> cnt = new HashMap<>();
for (int x : nums) cnt.merge(x, 1, Integer::sum);
PriorityQueue<Integer> pq =
    new PriorityQueue<>(Comparator.comparingInt(cnt::get));
for (int key : cnt.keySet()) {
    pq.offer(key);
    if (pq.size() > k) pq.poll();        // evict the least frequent
}
// {1,1,1,2,2,3}, k = 2 → pq holds 1 and 2

// 3. K-way merge — Merge K Sorted Lists, Kth Smallest in Sorted Matrix
PriorityQueue<ListNode> pq =
    new PriorityQueue<>(Comparator.comparingInt(n -> n.val));
for (ListNode h : lists) if (h != null) pq.offer(h);
ListNode dummy = new ListNode(0), tail = dummy;
while (!pq.isEmpty()) {
    ListNode n = pq.poll();
    tail = tail.next = n;
    if (n.next != null) pq.offer(n.next);   // its successor joins
}

// 4. Dijkstra — Network Delay Time, Path With Minimum Effort
int[] dist = new int[n];
Arrays.fill(dist, Integer.MAX_VALUE);
dist[src] = 0;
PriorityQueue<int[]> pq =                 // entries are {dist, node}
    new PriorityQueue<>(Comparator.comparingInt(e -> e[0]));
pq.offer(new int[]{0, src});
while (!pq.isEmpty()) {
    int[] cur = pq.poll();
    int d = cur[0], u = cur[1];
    if (d > dist[u]) continue;            // stale entry: skip it
    for (int[] e : adj.get(u)) {          // e = {v, w}
        int v = e[0], nd = d + e[1];
        if (nd < dist[v]) {
            dist[v] = nd;
            pq.offer(new int[]{nd, v});   // no decrease-key: push again
        }
    }
}

// 5. Two heaps — Find Median from Data Stream, Sliding Window Median
PriorityQueue<Integer> lo =               // max-heap: smaller half
    new PriorityQueue<>(Collections.reverseOrder());
PriorityQueue<Integer> hi = new PriorityQueue<>();  // larger half
void addNum(int x) {
    lo.offer(x);
    hi.offer(lo.poll());                  // lo's largest moves up
    if (hi.size() > lo.size()) lo.offer(hi.poll());   // lo keeps extra
}
double findMedian() {
    if (lo.size() > hi.size()) return lo.peek();
    return (lo.peek() + (long) hi.peek()) / 2.0;   // long: no overflow
}
// add 1, 2 → 1.5;   add 3 → 2.0

// 6. Min-heap of end times — Meeting Rooms II, Minimum Platforms
Arrays.sort(iv, (a, b) -> Integer.compare(a[0], b[0]));   // by start
PriorityQueue<Integer> ends = new PriorityQueue<>();
for (int[] m : iv) {
    if (!ends.isEmpty() && ends.peek() <= m[0]) ends.poll();  // reuse
    ends.offer(m[1]);
}
int rooms = ends.size();                  // {{0,30},{5,10},{15,20}} → 2
```

> **Interview —** *"Find the k largest of n numbers. Sort, or use a heap?"*
>
> **Say:** Sorting is $O(n \log n)$. A size-k **min**-heap is $O(n \log k)$ time and $O(k)$ space, and it works on a stream that never ends. The min-heap's root is the weakest of the k survivors, so it is the one to evict. If k is close to n, just sort.

### 5. Traps

| ✗ Mistake | What happens | ✓ Fix |
|---|---|---|
| `println(pq)`, for-each | heap order, not sorted | `poll()` until empty |
| `(a, b) -> b - a` | overflows → wrong order | `Integer.compare(b, a)` (§38.10) |
| `new PriorityQueue<>()` for max | it is a **min**-heap | `Collections.reverseOrder()` |
| change a key after `offer` | heap is not reordered | `remove`, change, `offer` |
| `int x = pq.poll();` on empty | `NullPointerException` | check `isEmpty()` first |
| `pq.remove()` on empty | `NoSuchElementException` | `poll()` gives `null` |
| `contains`, `remove(x)` in a loop | $O(n)$ each | skip stale entries |
| equal priorities | any order — not stable | add a tie-break key |
| `a[1]` for `{dist, node}` | orders by node id | compare `a[0]` |
| printing `PriorityQueue<int[]>` | `[[I@…` hashes | `Arrays.toString(pq.peek())` |

### 6. Try it

One complete program — the output is real (JDK 25).

```java
// PriorityQueue: min vs max, heap order vs poll order, empty heap, kth largest, {dist, node}, stale keys.
import java.util.*;

public class HeapDemo {
    public static void main(String[] args) {
        PriorityQueue<Integer> min = new PriorityQueue<>();
        PriorityQueue<Integer> max = new PriorityQueue<>(Collections.reverseOrder());
        for (int x : new int[]{5, 9, 1, 7, 3, 8, 2}) { min.offer(x); max.offer(x); }
        System.out.println("min.peek() = " + min.peek() + ", max.peek() = " + max.peek());
        System.out.println("println(min) -> " + min + "  heap order");
        List<Integer> out = new ArrayList<>();
        while (!min.isEmpty()) out.add(min.poll());
        System.out.println("poll order   -> " + out);
        System.out.println("empty poll() -> " + min.poll());
        try { int x = min.poll(); } catch (NullPointerException e) {
            System.out.println("int x = poll() on empty -> NullPointerException");
        }

        PriorityQueue<Integer> top = new PriorityQueue<>();    // size-k min-heap, k = 2
        for (int x : new int[]{3, 2, 1, 5, 6, 4}) {
            top.offer(x);
            if (top.size() > 2) top.poll();
        }
        System.out.println("2nd largest  -> " + top.peek());

        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(e -> e[0]));
        int[] a = {7, 0}, b = {2, 1}, c = {5, 2};             // {dist, node}
        pq.offer(a); pq.offer(b); pq.offer(c);
        System.out.println("top {dist, node} -> " + Arrays.toString(pq.peek()));
        b[0] = 100;                                            // key changed after offer
        System.out.println("b[0] = 100, top  -> " + Arrays.toString(pq.peek()) + "  <- stale");
        pq.remove(b); pq.offer(b);
        System.out.println("remove + offer   -> " + Arrays.toString(pq.peek()));
    }
}
```

**Output:**

```
min.peek() = 1, max.peek() = 9
println(min) -> [1, 3, 2, 9, 7, 8, 5]  heap order
poll order   -> [1, 2, 3, 5, 7, 8, 9]
empty poll() -> null
int x = poll() on empty -> NullPointerException
2nd largest  -> 5
top {dist, node} -> [2, 1]
b[0] = 100, top  -> [100, 1]  <- stale
remove + offer   -> [5, 2]
```

- **Stale top:** `b` changed to `100` but stayed at the root. Only `remove` + `offer` moved it down.

<details>
<summary><strong>Quick check.</strong> To find the k-th <em>largest</em> element, why use a <em>min</em>-heap?</summary>

Keep a min-heap of size k. It holds the k largest seen so far, and its root is the weakest of them — the one to evict when a bigger value arrives. At the end, `peek()` is the k-th largest. Cost: $O(n \log k)$.

</details>

<details>
<summary><strong>Quick check.</strong> In Dijkstra, why do we need <code>if (d &gt; dist[u]) continue;</code>?</summary>

Java's heap has no decrease-key. When a shorter path is found, we push a *new* entry and leave the old one inside. The old entry pops later with a larger `d` — it is stale, so we skip it.

</details>

---

## 38.8 TreeMap, TreeSet & LinkedHashMap ★★★

**Use a `TreeMap` or `TreeSet` when** the keys must stay sorted while you add and remove — "the booking just before 3 pm", "max − min of the window", "the value closest to x". **Use a `LinkedHashMap` when** you need hash speed *and* a remembered order — first-seen order, or an LRU cache.

![Cheat sheet on defining and navigating a Java TreeMap. Define: a TreeMap of Integer to String keeps keys sorted, a TreeSet of Integer is sorted with no duplicates, and a TreeMap built with Comparator.reverseOrder() puts the largest key first; a red-black tree holds 20 at the root, 10 and 30 below it, 40 under 30. Number line for map = {10=a, 20=b, 30=c, 40=d} and query 25: floorKey(25) is 20, ceilingKey(25) is 30, lowerKey(20) is 10, higherKey(20) is 30, firstKey() is 10, lastKey() is 40, floorKey(5) is null. Ranges: headMap(30) is {10=a, 20=b}, tailMap(30) is {30=c, 40=d}, subMap(15, 35) is {20=b, 30=c}. TreeSet 1, 5, 9, 14: floor(8) is 5, ceiling(8) is 9, pollFirst() removes 1, headSet(9) is 1, 5. Empty map: firstKey() throws, firstEntry() is null. Costs: O(log n) per operation; HashMap get is O(1) with no order; a null TreeMap key throws NullPointerException.](diagrams/java38_info_treemap_define_ai.png)

### Simple Explanation

A `TreeMap` is a dictionary that stays alphabetised as you add words. So you can ask more than "is 25 here?" — you can ask "what is the nearest key at or below 25?" Each question costs $O(\log n)$ instead of a `HashMap`'s $O(1)$: the price of order.

A `LinkedHashMap` is a `HashMap` with a thread running through its entries in the order you added them. Lookups stay $O(1)$; loops follow the thread. In *access order*, every `get` moves that key to the back — so the front is always the least recently used key.

> **Official definition —** `TreeMap` is a red-black-tree `NavigableMap` that keeps its keys sorted by natural order or a `Comparator`, with guaranteed $O(\log n)$ `get`, `put` and `remove`; `TreeSet` is the same tree holding keys only.

### At a glance

| Topic | Answer |
|---|---|
| Import | `java.util.*` |
| Order | Tree: sorted · Linked: insertion (or access) order |
| `get`, `put`, `remove` | Tree $O(\log n)$ · Linked $O(1)$ average |
| `floorKey`, `ceilingKey`, `firstKey` … | $O(\log n)$, tree only |
| Nothing qualifies | navigation returns `null` |
| Null keys | Tree: `NullPointerException` · Linked: allowed |
| Duplicates | none — count them: `TreeMap<K, Integer>` |
| Only need lookups? | `HashMap` (§38.5) — it is faster |

### 1. Define

```java
TreeMap<Integer, String> map = new TreeMap<>();       // keys small → large
TreeMap<Integer, Integer> big = new TreeMap<>(Comparator.reverseOrder()); // largest first
TreeMap<String, Integer> s = new TreeMap<>(hashMap);  // sorted copy
TreeSet<Integer> set = new TreeSet<>(List.of(9, 1, 5, 1)); // [1, 5, 9]
TreeSet<String> byLen = new TreeSet<>(                // length, then A → Z
        Comparator.comparing(String::length).thenComparing(Comparator.naturalOrder()));
Map<Character, Integer> seen = new LinkedHashMap<>(); // insertion order
Map<Integer, Integer> lru = new LinkedHashMap<>(16, 0.75f, true); // access order
```

- Declare `TreeMap` / `TreeSet`, not `Map` / `Set` — `floorKey` and friends do not exist on `Map`.
- The comparator also decides *equality*: `compare == 0` means "same key" (see Traps). Comparators: §38.10.

### 2. TreeMap navigation — the reason to use a tree

```
          first                                       last
            10 ────────── 20 ──── 25 ──── 30 ────────── 40
                          ▲     query     ▲
           floorKey(25) = 20              ceilingKey(25) = 30
            largest key ≤ 25              smallest key ≥ 25

    lowerKey(20) = 10  (strictly below)   higherKey(20) = 30  (strictly above)
```

Each line starts fresh from `map = {10=a, 20=b, 30=c, 40=d}`.

```java
// ── Ends and nearest key ───────────────────── O(log n)
map.firstKey()        // 10    (empty map → NoSuchElementException)
map.firstEntry()      // 10=a  (empty map → null)
map.pollFirstEntry()  // 10=a, removed → {20=b, 30=c, 40=d}
map.floorKey(25)      // 20    largest key ≤ 25
map.ceilingKey(25)    // 30    smallest key ≥ 25
map.lowerKey(20)      // 10    largest key < 20 (strict)
map.floorKey(5)       // null  nothing ≤ 5 — always null-check
map.floorEntry(25)    // 20=b  ...Entry: key and value together

// ── Range views: live windows, not copies ─── walk: O(log n + k)
map.headMap(30)          // {10=a, 20=b}          keys < 30
map.tailMap(30)          // {30=c, 40=d}          keys ≥ 30
map.subMap(15, 35)       // {20=b, 30=c}          15 ≤ key < 35
map.descendingMap()      // {40=d, 30=c, 20=b, 10=a}
```

- `headMap(k)` excludes `k`; `tailMap(k)` includes it — the same `[from, to)` rule as §38.2. A view's `size()` walks it: $O(k)$.
- The §38.5 `Map` API (`get`, `put`, `merge`, …) works as usual — $O(\log n)$ each, and loops run in key order.

> **Interview —** *"When would you pick a `TreeMap` over a `HashMap`?"*
>
> **Say:** When the question needs order while the data changes — the nearest key, a range, or the min and max under inserts and deletes. Every operation becomes $O(\log n)$ instead of $O(1)$. If I only need sorted output once, at the end, a `HashMap` plus one sort is cheaper.

### 3. TreeSet — the same navigation, for values

Same names minus `Key` / `Entry`: `floorKey` → `floor`, `pollFirstEntry` → `pollFirst`. Each line starts fresh from `set = [1, 5, 9, 14]`.

```java
// ── Every call ─────────────────────────────── O(log n)
set.first()           // 1     (empty → NoSuchElementException)
set.pollFirst()       // 1, removed → [5, 9, 14]   (empty → null)
set.floor(8)          // 5     largest ≤ 8
set.ceiling(8)        // 9     smallest ≥ 8
set.add(5)            // false — already there
set.headSet(9)        // [1, 5]        x < 9
set.subSet(2, 10)     // [5, 9]        2 ≤ x < 10
```

### 4. LinkedHashMap & LinkedHashSet — order, and LRU

```java
Map<String, Integer> m = new LinkedHashMap<>();       // O(1) average
m.put("pear", 1); m.put("fig", 2); m.put("pear", 9);  // {pear=9, fig=2}  re-put keeps place
new ArrayList<>(new LinkedHashSet<>(list))            // dedupe, first-seen order
```

**LRU Cache.** In an interview, build it yourself — `HashMap` plus a doubly linked list ([Ch 31](#content/31_dsa_foundations)). In real code, use access order (`true`) plus `removeEldestEntry`:

```java
int cap = 3;
Map<Integer, Integer> cache = new LinkedHashMap<>(cap, 0.75f, true) {
    @Override   // called after a new key is added: true → evict eldest
    protected boolean removeEldestEntry(Map.Entry<Integer, Integer> e) {
        return size() > cap;
    }
};
cache.put(1, 1); cache.put(2, 2); cache.put(3, 3);   // [1, 2, 3]
cache.get(1);                                        // [2, 3, 1]
cache.put(4, 4);                                     // [3, 1, 4]
// front = least recently used: 2 was evicted
```

- `get`, `getOrDefault`, `put` and `merge` count as a use; `containsKey` does not. LeetCode's `get` → `cache.getOrDefault(key, -1)`.

### 5. DSA idioms you'll write every day

![Java TreeMap idioms and traps. LRU cache: new LinkedHashMap(cap, 0.75f, true) with removeEldestEntry returning size() greater than cap; put 1, 2, 3, then get(1) gives 2, 3, 1, then put(4) gives 3, 1, 4 and evicts 2. Idioms: no overlap via floorKey and ceilingKey (My Calendar I); window counts with merge and lastKey() - firstKey() (Longest Subarray, Abs Diff at most Limit); nearest value via set.ceiling(x - t) (Contains Duplicate III); latest at time t via floorEntry(t) (Time Based Key-Value Store); keep top 3 distinct with pollFirst (Third Maximum Number); a LinkedHashSet of 3, 1, 3, 2 gives 3, 1, 2 (First Unique Number). Traps: int p = map.floorKey(k) throws NPE; a count of 0 left in the map; a TreeSet drops repeats; a length-only comparator loses dog after cat; headSet(x).size() is O(n); firstKey() on an empty map throws; get() while looping an LRU map throws ConcurrentModificationException.](diagrams/java38_info_treemap_idioms_traps_ai.png)

```java
// 1. Book without overlap — My Calendar I
TreeMap<Integer, Integer> cal = new TreeMap<>();   // start → end
boolean book(int s, int e) {                       // half-open [s, e)
    Integer p = cal.floorKey(s), q = cal.ceilingKey(s);
    if (p != null && cal.get(p) > s) return false; // prev overlaps
    if (q != null && q < e) return false;          // next overlaps
    cal.put(s, e); return true;                    // [20, 30) fits after [10, 20)
}

// 2. Window max - min via counts — Longest Continuous Subarray (Abs Diff ≤ Limit)
TreeMap<Integer, Integer> win = new TreeMap<>();   // value → count
for (int l = 0, r = 0; r < n; r++) {
    win.merge(a[r], 1, Integer::sum);
    while (win.lastKey() - win.firstKey() > limit) {
        if (win.merge(a[l], -1, Integer::sum) == 0) win.remove(a[l]);
        l++;
    }
    best = Math.max(best, r - l + 1);
}

// 3. Nearest value in the last k — Contains Duplicate III
TreeSet<Long> seen = new TreeSet<>();   // long: a[i] ± t never overflows
for (int i = 0; i < n; i++) {
    Long c = seen.ceiling((long) a[i] - t);        // smallest ≥ a[i] - t
    if (c != null && c <= (long) a[i] + t) return true;
    seen.add((long) a[i]);
    if (i >= k) seen.remove((long) a[i - k]);      // keep the last k
}

// 4. Latest value at or before time t — Time Based Key-Value Store
Map<String, TreeMap<Integer, String>> db = new HashMap<>();
db.computeIfAbsent(key, x -> new TreeMap<>()).put(time, val);   // set
TreeMap<Integer, String> h = db.get(key);                        // get
Map.Entry<Integer, String> e = h == null ? null : h.floorEntry(t);
return e == null ? "" : e.getValue();

// 5. First unique in a stream, O(1) each — First Unique Number
Set<Integer> once = new LinkedHashSet<>(), dup = new HashSet<>();
void add(int x) { if (dup.add(x)) once.add(x); else once.remove(x); }
int showFirstUnique() { return once.isEmpty() ? -1 : once.iterator().next(); }
```

- Need a sorted multiset? Java has none — use `TreeMap<value, count>` and remove the key when its count hits 0 (idiom 2).
- Count of Smaller Numbers After Self: `headSet(x).size()` looks $O(\log n)$ but walks the view — use a [Fenwick tree](#content/31d_dsa_advanced_ml_coding) (Ch 31d §18.27).

### 6. Traps

| ✗ Mistake | What happens | ✓ Fix |
|---|---|---|
| `int p = map.floorKey(k);` | NPE when nothing qualifies | `Integer p`, then null-check |
| `firstKey()` on an empty map | `NoSuchElementException` | check `isEmpty()` first |
| count hits 0, key kept | `firstKey()` returns a ghost | remove the key at 0 |
| `TreeSet` for a window with repeats | duplicates silently dropped | `TreeMap` value → count |
| comparator on length only | `"dog"` lost after `"cat"` | add `thenComparing(...)` |
| `Map<K, V> m = new TreeMap<>()` | `m.floorKey` won't compile | declare `TreeMap<K, V>` |
| `headMap(k)` "includes k" | `k` is excluded | `headMap(k, true)` |
| `headSet(x).size()` per element | $O(n)$ each, $O(n^2)$ total | Fenwick tree |
| `remove` inside a for-each | `ConcurrentModificationException` | `removeIf` or `pollFirstEntry()` |
| `get()` looping an access-order map | `ConcurrentModificationException` | loop `entrySet()`, use `getValue()` |

### 7. Try it

One complete program — the output is real (JDK 25).

```java
// TreeMap navigation, a counted multiset and an LRU cache in one run.
import java.util.*;

public class TreeLruDemo {
    public static void main(String[] args) {
        TreeMap<Integer, String> map = new TreeMap<>(Map.of(30, "c", 10, "a", 40, "d", 20, "b"));
        System.out.println("map            = " + map);
        System.out.println("floor/ceil(25) = " + map.floorKey(25) + " / " + map.ceilingKey(25)
                + ", floorKey(5) = " + map.floorKey(5));
        System.out.println("headMap(30)    = " + map.headMap(30) + ", tailMap(30) = " + map.tailMap(30));
        System.out.println("pollFirstEntry = " + map.pollFirstEntry() + " -> " + map);

        TreeMap<Integer, Integer> win = new TreeMap<>();          // value -> count
        for (int x : new int[]{4, 2, 4, 7}) win.merge(x, 1, Integer::sum);
        System.out.println("window counts  = " + win + ", max - min = " + (win.lastKey() - win.firstKey()));
        for (int x : new int[]{2, 4})                             // slide out a 2 and one 4
            if (win.merge(x, -1, Integer::sum) == 0) win.remove(x);
        System.out.println("after sliding  = " + win + ", max - min = " + (win.lastKey() - win.firstKey()));

        Map<Integer, Integer> lru = new LinkedHashMap<>(16, 0.75f, true) {
            protected boolean removeEldestEntry(Map.Entry<Integer, Integer> e) { return size() > 2; }
        };
        lru.put(1, 1); lru.put(2, 2); lru.get(1); lru.put(3, 3);
        System.out.println("LRU keys       = " + lru.keySet() + ", get(2) = " + lru.getOrDefault(2, -1));
    }
}
```

**Output:**

```
map            = {10=a, 20=b, 30=c, 40=d}
floor/ceil(25) = 20 / 30, floorKey(5) = null
headMap(30)    = {10=a, 20=b}, tailMap(30) = {30=c, 40=d}
pollFirstEntry = 10=a -> {20=b, 30=c, 40=d}
window counts  = {2=1, 4=2, 7=1}, max - min = 5
after sliding  = {4=1, 7=1}, max - min = 3
LRU keys       = [1, 3], get(2) = -1
```

- **Counts:** sliding out the only `2` dropped its count to 0, so its key was removed and `firstKey()` became 4. Leave the ghost `2` in and `max - min` stays 5.
- **LRU:** `get(1)` made 1 the most recent, so `put(3, 3)` evicted 2.

<details>
<summary><strong>Quick check.</strong> With keys <code>{10, 20, 30, 40}</code>, what do <code>floorKey(25)</code>, <code>lowerKey(10)</code> and <code>headMap(30)</code> give?</summary>

`20`, `null` (nothing is below 10) and the entries for `10` and `20` — `headMap` excludes `30`. Store `lowerKey(10)` in an `Integer`, never an `int`.

</details>

<details>
<summary><strong>Quick check.</strong> An access-order <code>LinkedHashMap</code> with capacity 3 (via <code>removeEldestEntry</code>) gets <code>put</code> 1, 2, 3, then <code>get(1)</code>, then <code>put(4)</code>. Which keys remain?</summary>

`[3, 1, 4]`. `get(1)` moved 1 to the most-recent end, so the eldest was 2 — and `put(4)` evicted it.

</details>

---

## 38.9 Build Your Own: Linked Lists, Trees, Graphs, Tries, Union-Find ★★★

**Build your own when** the input is a `ListNode head` or a `TreeNode root`, a word list to prefix-search, or `n` nodes plus an `edges` array. Java has no built-in node or graph type for these — you write a five-line class or an adjacency list. This section is the Java mechanics; the algorithms live in [Ch 31](#content/31_dsa_foundations) and [Ch 31b](#content/31b_dsa_graphs).

![Cheat sheet on defining Java node classes. ListNode: a static class with int val, ListNode next and a constructor; head points at boxes 1, 2, 3, ending in null. Dummy head and walk: new ListNode(0, head) sits in front, a for loop steps p = p.next while p != null, and return dummy.next means the first node is no longer special. Reverse in place: prev = null, cur = head; save nxt = cur.next, set cur.next = prev, then move prev and cur; return prev turns 1, 2, 3 into 3, 2, 1. TreeNode: a static class with int val and TreeNode left, right; the tree 3 with children 9 and 20, where 20 has 15 and 7, comes from the Integer array 3, 9, 20, null, null, 15, 7. Recursion template: maxDepth returns 0 for null, else 1 + Math.max of the left and right depths, so maxDepth(root) is 3 - null check first. N-ary Node: children is an empty ArrayList, never null.](diagrams/java38_info_own_nodes_ai.png)

### Simple Explanation

A **node** is a small object: a value plus arrows (references) to other nodes. A list node has one arrow, `next`; a tree node has two, `left` and `right`; a trie node has 26, one per letter. `null` means "no arrow here" — and most bugs are a missed `null` check.

A **graph** usually needs no node class: number the nodes `0..n-1` and keep one list of neighbours per number, `adj.get(2)` → `[0, 1, 3]`. **Union-Find** is even smaller: one `int[] parent`, where each node points towards its group's leader.

> **Official definition —** a linked structure is a set of objects, called nodes, that each hold data plus references to other nodes; an adjacency list stores, for every vertex of a graph, the list of its neighbours.

### Build-your-own at a glance

| Structure | Define it as | Key cost |
|---|---|---|
| Where the class goes | `static class` inside `Main` | — |
| Linked list | `ListNode`: `val`, `next` | reach node `i`: $O(i)$ |
| Binary tree | `TreeNode`: `val`, `left`, `right` | recursion depth = height |
| N-ary tree | `Node`: `val`, `List<Node> children` | visit all: $O(n)$ |
| Graph, nodes `0..n-1` | `List<List<Integer>> adj` | build: $O(V + E)$ |
| Weighted graph | `List<List<int[]>>`, entries `{to, w}` | build: $O(V + E)$ |
| Trie | `TrieNode[26]` + `boolean end` | insert, search: $O(L)$ |
| Union-Find | `int[] parent`, `int[] size` | nearly $O(1)$ per call |

### 1. Where the class goes

```java
public class Main {                           // one public class, named like the file
    static class ListNode {                   // ✓ static nested class: the usual choice
        int val; ListNode next;
        ListNode(int val) { this.val = val; }
    }
    class Inner { }                           // ✗ no static: needs a Main object
    public static void main(String[] args) {
        ListNode head = new ListNode(1);      // ✓
        new Inner();   // ✗ error: non-static variable this cannot be referenced from a static context
    }
}
class TreeNode { int val; TreeNode left, right; }   // ✓ second class, NOT public
```

- Without `static`, a nested class needs a `Main` object to live in — and `main` has none. A nested `record` is static automatically.
- On LeetCode, `ListNode` and `TreeNode` are already defined (shown in a comment) — don't paste your own.

### 2. Linked list — `ListNode`

```java
static class ListNode {
    int val;
    ListNode next;                    // null = end of the list
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}
ListNode head = new ListNode(1, new ListNode(2, new ListNode(3)));  // 1 → 2 → 3

// Each line below starts fresh from 1 → 2 → 3, with p = the first node.
// ── Walk with a copy ──────────────────────── O(n)
for (ListNode p = head; p != null; p = p.next) { }  // visit p.val

// ── Insert or delete after p ──────────────── O(1)
p.next = new ListNode(9, p.next);   // 1 → 9 → 2 → 3
p.next = p.next.next;               // 1 → 3  (p.next must not be null)

// ── Dummy head — Remove Linked List Elements, x = 1 ── O(n)
ListNode dummy = new ListNode(0, head), prev = dummy;
while (prev.next != null) {
    if (prev.next.val == x) prev.next = prev.next.next;  // unlink
    else prev = prev.next;                               // step
}
return dummy.next;                  // 2 → 3 — new head, no special case
```

```
 dummy ──► [1] ──► [2] ──► [3] ──► null
   ▲
  prev      removing [1] is prev.next = prev.next.next,
            exactly like removing [2] or [3]
```

- Keep `head` (or `dummy`) so you can return the list. `println(head)` prints `ListNode@…`, not the values — loop to print them.
- `java.util.LinkedList` hides its nodes — there is no `.next`. Use it as a queue (§38.6), never for linked-list problems.
- Same node: `p == q`. Same value: `p.val == q.val`. A `HashSet<ListNode>` compares nodes by identity — what Linked List Cycle II needs.

### 3. Trees — `TreeNode` and N-ary `Node`

```java
static class TreeNode {
    int val;
    TreeNode left, right;              // null = no child
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode l, TreeNode r) { this.val = val; left = l; right = r; }
}

// Helper: LeetCode level order → tree; null = "no node here"
//   {3, 9, 20, null, null, 15, 7}   →     3
//                                        / \
//                                       9   20
//                                          /  \
//                                         15   7
static TreeNode buildTree(Integer[] a) {   // int[] can't hold null
    if (a.length == 0 || a[0] == null) return null;
    TreeNode root = new TreeNode(a[0]);
    Deque<TreeNode> q = new ArrayDeque<>(List.of(root));
    for (int i = 1; i < a.length; i += 2) {
        TreeNode cur = q.poll();           // next parent, level order
        if (a[i] != null) q.offer(cur.left = new TreeNode(a[i]));
        if (i + 1 < a.length && a[i + 1] != null)
            q.offer(cur.right = new TreeNode(a[i + 1]));
    }
    return root;
}

// Below, t = buildTree(new Integer[]{3, 9, 20, null, null, 15, 7})
// ── Recursion template: null first, then children ── O(n)
static int maxDepth(TreeNode n) {      // Maximum Depth of Binary Tree
    if (n == null) return 0;           // base case FIRST
    return 1 + Math.max(maxDepth(n.left), maxDepth(n.right));
}
maxDepth(t)                            // 3
static void inorder(TreeNode n, List<Integer> out) {   // left, node, right
    if (n == null) return;
    inorder(n.left, out); out.add(n.val); inorder(n.right, out);
}
inorder(t, out)                        // out = [9, 3, 15, 20, 7]
if (n.left == null && n.right == null) { }   // n is a leaf
if (n.left != null) q.offer(n.left);         // ArrayDeque rejects null

// ── N-ary tree ──
static class Node {
    int val;
    List<Node> children = new ArrayList<>();   // empty, never null
    Node(int val) { this.val = val; }
}
static int depth(Node n) {             // Maximum Depth of N-ary Tree
    int best = 0;
    for (Node c : n.children) best = Math.max(best, depth(c));
    return 1 + best;
}                                      // 1 → {2 → {4}, 3}: depth 3
```

- Inorder of a BST is sorted — the key to Validate BST and Kth Smallest ([Ch 31](#content/31_dsa_foundations)).
- Level order is the BFS queue loop of §38.6, one `q.size()` batch per level; offer only non-null children.
- Recursion depth = tree height. On JDK 25 with the default stack, a 20,000-node skewed tree and a 100,000-node list both threw `StackOverflowError` — loop with a `Deque` there.

### 4. Graphs — from an edge list

![Cheat sheet on building graphs in Java. Edge list to adjacency list: edges 0-1, 0-2, 1-2 and 2-3 give 0 to 1, 2; 1 to 0, 2; 2 to 0, 1, 3; 3 to 2. Build it: a List of List of Integer with one new ArrayList per node, then each edge is added to both endpoints for an undirected graph; adj.get(2) is 0, 1, 3 and adj.get(2).size() is 3. Directed plus indegree: add p(0) to the list of p(1) and increment indeg of p(0), used in Course Schedule. Weighted: each entry is an int pair {to, w}, read as v = e(0), w = e(1), used in Dijkstra. Any labels: a HashMap with computeIfAbsent(u, k -> new ArrayList) then add(v); getOrDefault(99, List.of()) is empty. Adjacency matrix: a boolean n by n grid with has(u)(v) and has(v)(u) set to true; has(1)(2) is true - O(1) edge check, O(n²) memory. Create all n lists first; visited is a boolean array of size n.](diagrams/java38_info_own_graphs_ai.png)

Most graph problems give `n` and an edge list. The first block uses this undirected graph:

```
 n = 4, edges = {{0, 1}, {0, 2}, {1, 2}, {2, 3}}

  0 ─── 1        adj.get(0) → [1, 2]
   \   /         adj.get(1) → [0, 2]
    \ /          adj.get(2) → [0, 1, 3]
     2 ─── 3     adj.get(3) → [2]
```

```java
// ── Edge list → adjacency list ────────────── O(V + E)
List<List<Integer>> adj = new ArrayList<>();
for (int i = 0; i < n; i++) adj.add(new ArrayList<>());  // n lists
for (int[] e : edges) {
    adj.get(e[0]).add(e[1]);
    adj.get(e[1]).add(e[0]);      // undirected only: the reverse too
}
adj.get(2)                        // [0, 1, 3]   neighbours of 2
adj.get(2).size()                 // 3           degree of 2
boolean[] seen = new boolean[n];  // visited: all false

// ── Directed + indegree — Course Schedule ─── O(V + E)
// pre = {{1, 0}, {2, 0}, {3, 1}, {3, 2}}; {a, b} = "b before a"
int[] indeg = new int[n];         // adj = n fresh empty lists, as above
for (int[] p : pre) { adj.get(p[1]).add(p[0]); indeg[p[0]]++; }  // b → a only
// adj → [[1, 2], [3], [3], []]     indeg → [0, 1, 1, 2]

// ── Weighted: each entry is {to, weight} ──── O(V + E)
// times = {{0, 1, 4}, {0, 2, 1}, {2, 1, 2}}, each {u, v, w}
List<List<int[]>> g = new ArrayList<>();
for (int i = 0; i < n; i++) g.add(new ArrayList<>());
for (int[] t : times) g.get(t[0]).add(new int[]{t[1], t[2]});
for (int[] e : g.get(0)) { int v = e[0], w = e[1]; }  // 0→1 costs 4, 0→2 costs 1

// ── Any labels (Strings, sparse ids) → Map ─── O(V + E)
Map<Integer, List<Integer>> m = new HashMap<>();
for (int[] e : edges) {
    m.computeIfAbsent(e[0], k -> new ArrayList<>()).add(e[1]);
    m.computeIfAbsent(e[1], k -> new ArrayList<>()).add(e[0]);
}
m.get(2)                          // [0, 1, 3]
m.get(99)                         // null — 99 is in no edge
m.getOrDefault(99, List.of())     // []    safe to loop over

// ── Adjacency matrix — small dense graphs ─── O(n²) memory
boolean[][] has = new boolean[n][n];
for (int[] e : edges) has[e[0]][e[1]] = has[e[1]][e[0]] = true;
has[1][2]                         // true    O(1) edge check

// ── Array of lists — you'll see it in other people's code ──
List<Integer>[] adj2 = new ArrayList[n];          // ⚠ unchecked warning; fill each slot
List<Integer>[] bad = new ArrayList<Integer>[n];  // ✗ error: generic array creation
```

- Prefer `List<List<Integer>>`: no raw type, no warning. Nodes labelled `1..n` (Network Delay Time)? Make `n + 1` lists and ignore index 0.
- Kruskal sorts `record Edge(int u, int v, int w)` by weight with a comparator (§38.10). Kahn's queue loop for Course Schedule, plus BFS, DFS and Dijkstra, are in [Ch 31b](#content/31b_dsa_graphs).

> **Interview —** *"Adjacency list or adjacency matrix?"*
>
> **Say:** A list by default: $O(V + E)$ memory, and looping over a node's neighbours costs only its degree. A matrix always costs $O(V^2)$ memory — 100,000 nodes would need $10^{10}$ cells — but answers "is there an edge u–v?" in $O(1)$. I'd use one only for small, dense graphs or Floyd–Warshall.

### 5. Trie — `TrieNode[26]`

![Cheat sheet on the Java trie and Union-Find. TrieNode: an array of 26 TrieNode children plus a boolean end; apple is the chain root, a, p, p, l, e with end on e. insert(word): i = ch - 'a', create the child if null, step in, and set end = true at the last node. After insert apple: search apple is true, search app is false (path exists, end is false), startsWith app is true. find: parent(i) = i at the start, path compression on the way to the root. union links the ROOTS: false if both roots match, else parent(rb) = ra and count--. Traps: nested class without static fails in main; adj.get(i) before adding lists throws IndexOutOfBoundsException; new ArrayList of Integer array is a generic array creation error; an undirected edge added once misses neighbours; offering a null child throws NPE; parent(a) = b links non-roots; an int array cannot hold null, use Integer. Deep recursion can throw StackOverflowError.](diagrams/java38_info_own_trie_uf_ai.png)

```java
// Implement Trie (Prefix Tree) — lowercase 'a'..'z' only
class Trie {
    static class TrieNode {
        TrieNode[] children = new TrieNode[26];  // all null at start
        boolean end;                             // a word ends here
    }
    private final TrieNode root = new TrieNode();
    void insert(String word) {                   // O(L)
        TrieNode cur = root;
        for (char ch : word.toCharArray()) {
            int i = ch - 'a';                    // 'a' → 0 … 'z' → 25
            if (cur.children[i] == null) cur.children[i] = new TrieNode();
            cur = cur.children[i];
        }
        cur.end = true;                          // mark the last node
    }
    boolean search(String w) { TrieNode n = walk(w); return n != null && n.end; }  // whole word
    boolean startsWith(String p) { return walk(p) != null; }                      // any word
    private TrieNode walk(String s) {            // null if path breaks, O(L)
        TrieNode cur = root;
        for (char ch : s.toCharArray()) {
            cur = cur.children[ch - 'a'];
            if (cur == null) return null;
        }
        return cur;
    }
}
// after insert("apple"):
search("apple")        // true
search("app")          // false — the path exists, but end is false
startsWith("app")      // true
```

```
 root ─a─► ● ─p─► ● ─p─► ● ─l─► ● ─e─► ●
                         │             └ end = true    "apple"
                         └ end = false until insert("app")
```

- `ch - 'a'` assumes lowercase: `'A' - 'a'` is `-32` → `ArrayIndexOutOfBoundsException`. For other characters use `Map<Character, TrieNode> children = new HashMap<>()`.
- Autocomplete and Word Search II build on this class ([Ch 31](#content/31_dsa_foundations)).

### 6. Union-Find — `int[] parent`

```java
static class UnionFind {
    int[] parent, size;
    int count;                                // number of groups
    UnionFind(int n) {
        parent = new int[n]; size = new int[n]; count = n;
        for (int i = 0; i < n; i++) { parent[i] = i; size[i] = 1; }
    }
    int find(int x) {                         // root of x's group
        if (parent[x] != x)
            parent[x] = find(parent[x]);      // path compression
        return parent[x];
    }
    boolean union(int a, int b) {             // false = already joined
        int ra = find(a), rb = find(b);       // always link ROOTS
        if (ra == rb) return false;
        if (size[ra] < size[rb]) { int t = ra; ra = rb; rb = t; }
        parent[rb] = ra;                      // small group under big
        size[ra] += size[rb];
        count--;
        return true;
    }
}
// uf = new UnionFind(5), then union(0, 1), union(1, 2), union(3, 4):
uf.count                    // 2       groups {0, 1, 2} and {3, 4}
uf.parent                   // [0, 0, 0, 3, 3]
uf.find(2) == uf.find(0)    // true    same group
uf.size[uf.find(0)]         // 3       size of 0's group
uf.union(2, 0)              // false   already joined → a cycle edge
```

- Union by size (or rank) plus path compression: each call is nearly $O(1)$ (inverse Ackermann).
- Grid cells: `id = r * cols + c` turns `(r, c)` into one index (§38.2). Labels `1..n` (Redundant Connection)? Use `new UnionFind(n + 1)`.

### 7. DSA idioms you'll write every day

```java
// 1. Reverse Linked List — Palindrome Linked List, Reorder List
ListNode prev = null, cur = head;
while (cur != null) {
    ListNode nxt = cur.next;      // save the rest
    cur.next = prev;              // flip one arrow
    prev = cur; cur = nxt;
}
return prev;                      // 1 → 2 → 3 becomes 3 → 2 → 1

// 2. Middle of the Linked List — fast/slow pointers
ListNode slow = head, fast = head;
while (fast != null && fast.next != null) {
    slow = slow.next;             // 1 step
    fast = fast.next.next;        // 2 steps
    // Linked List Cycle: if (slow == fast) return true;
}
return slow;                      // 1..5 → 3;  1..4 → 3 (second middle)

// 3. Merge Two Sorted Lists — dummy head + tail
ListNode dummy = new ListNode(0), tail = dummy;
while (a != null && b != null) {
    if (a.val <= b.val) { tail.next = a; a = a.next; }
    else                { tail.next = b; b = b.next; }
    tail = tail.next;
}
tail.next = (a != null) ? a : b;  // attach the leftover
return dummy.next;                // (1 → 3) + (2 → 4) = 1 → 2 → 3 → 4

// 4. Number of Connected Components — adj + visited + DFS
//    (Number of Islands: the same, on the grid — §38.2)
int comps = 0;
for (int i = 0; i < n; i++)
    if (!seen[i]) { comps++; dfs(i, adj, seen); }
void dfs(int u, List<List<Integer>> adj, boolean[] seen) {
    seen[u] = true;
    for (int v : adj.get(u)) if (!seen[v]) dfs(v, adj, seen);
}

// 5. Redundant Connection, Number of Provinces — Union-Find
UnionFind uf = new UnionFind(n + 1);        // labels 1..n
for (int[] e : edges)
    if (!uf.union(e[0], e[1])) return e;    // already joined → extra
// Provinces: union every connected pair, then answer uf.count
```

### 8. Traps

| ✗ Mistake | What happens | ✓ Fix |
|---|---|---|
| nested `class ListNode`, no `static` | compile error in `main` | `static class ListNode` |
| `adj.get(i)` before adding lists | `IndexOutOfBoundsException` | add `n` empty lists first |
| `new ArrayList<Integer>[n]` | error: generic array creation | `List<List<Integer>>` |
| undirected edge added once | half the neighbours missing | add `u→v` and `v→u` |
| labels `1..n`, only `n` lists | out of bounds at `n` | make `n + 1` lists |
| `head = head.next` to walk | the head is lost | walk a copy `p` |
| `q.offer(node.left)` (ArrayDeque) | `NullPointerException` on null child | `if (node.left != null)` |
| recursion down a long chain | can throw `StackOverflowError` | loop, or an explicit stack |
| `a.val == b.val` as "same node" | equal values, different nodes | `a == b` |
| `parent[a] = b` | links non-roots, splits groups | `parent[find(a)] = find(b)` |
| `int[] tree = {1, null, 2}` | does not compile | `Integer[]` |

### 9. Try it

One complete program — the output is real (JDK 25).

```java
// Tree, graph, trie and Union-Find: the shapes you build, and their traps.
import java.util.*;

public class BuildYourOwn {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int val, TreeNode left, TreeNode right) { this.val = val; this.left = left; this.right = right; }
    }
    static class TrieNode { TrieNode[] children = new TrieNode[26]; boolean end; }

    static int maxDepth(TreeNode n) { return n == null ? 0 : 1 + Math.max(maxDepth(n.left), maxDepth(n.right)); }
    static int find(int[] parent, int x) { return parent[x] == x ? x : (parent[x] = find(parent, parent[x])); }
    static TrieNode walk(TrieNode cur, String s, boolean create) {
        for (char ch : s.toCharArray()) {
            if (create && cur.children[ch - 'a'] == null) cur.children[ch - 'a'] = new TrieNode();
            if ((cur = cur.children[ch - 'a']) == null) return null;  // path breaks
        }
        return cur;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(3, new TreeNode(9, null, null),
                new TreeNode(20, new TreeNode(15, null, null), null));
        System.out.println("maxDepth    -> " + maxDepth(root));
        try { new ArrayDeque<TreeNode>().offer(root.left.left); }  // a null child
        catch (NullPointerException e) { System.out.println("offer(null) -> NullPointerException"); }

        List<List<Integer>> adj = new ArrayList<>(3);  // capacity 3, size 0
        try { adj.get(0).add(1); }
        catch (IndexOutOfBoundsException e) { System.out.println("adj.get(0)  -> " + e.getMessage()); }
        for (int i = 0; i < 3; i++) adj.add(new ArrayList<>());
        for (int[] e : new int[][]{{0, 1}, {1, 2}}) { adj.get(e[0]).add(e[1]); adj.get(e[1]).add(e[0]); }
        System.out.println("adj         -> " + adj);

        TrieNode trie = new TrieNode();
        walk(trie, "apple", true).end = true;
        TrieNode app = walk(trie, "app", false);
        System.out.println("search app  -> " + (app != null && app.end) + ", startsWith app -> " + (app != null));

        int[] parent = {0, 1, 2};
        for (int[] e : new int[][]{{0, 1}, {1, 2}, {2, 0}}) {
            int ra = find(parent, e[0]), rb = find(parent, e[1]);
            System.out.println("union" + Arrays.toString(e) + " -> " + (ra != rb));
            parent[rb] = ra;                         // link ROOTS, not a and b
        }
    }
}
```

**Output:**

```
maxDepth    -> 3
offer(null) -> NullPointerException
adj.get(0)  -> Index 0 out of bounds for length 0
adj         -> [[1], [0, 2], [1]]
search app  -> false, startsWith app -> true
union[0, 1] -> true
union[1, 2] -> true
union[2, 0] -> false
```

- `new ArrayList<>(3)` only reserves capacity — the list is still empty, so `get(0)` fails until you add the inner lists.

<details>
<summary><strong>Quick check.</strong> Why does <code>buildTree</code> take an <code>Integer[]</code>, not an <code>int[]</code>?</summary>

LeetCode's level order marks missing children with `null`, as in `[3, 9, 20, null, null, 15, 7]`. An `int[]` cannot hold `null` (`{1, null}` does not compile). Check `a[i] != null` before `new TreeNode(a[i])` — unboxing a `null` throws `NullPointerException`.

</details>

<details>
<summary><strong>Quick check.</strong> Redundant Connection, edges <code>[[1,2],[1,3],[2,3]]</code>. Which edge does Union-Find return, and what size do you make it?</summary>

`[2, 3]`: when it arrives, 2 and 3 already share a root, so `union(2, 3)` returns `false`. The labels run `1..n`, so create `new UnionFind(n + 1)`.

</details>

---

## 38.10 Sorting & Comparators ★★★

**Use a comparator when** you need an order that is not the default — intervals by start, words by length, a max-heap. One small lambda plugs into `Arrays.sort`, `list.sort`, `PriorityQueue`, `TreeMap` and `TreeSet`.

![Cheat sheet on Java comparators. compare(a, b) returns a sign: negative puts a first, zero is a tie that keeps input order, positive puts b first; -1 and -42 mean the same. Write one: (a, b) -> Integer.compare(a, b) is ascending, Integer.compare(b, a) is descending, Integer::compare is ascending, comparingInt(String::length) sorts by length. On pear, fig, apple, kiwi: naturalOrder gives apple, fig, kiwi, pear; reverseOrder gives pear, kiwi, fig, apple; by length gives fig, pear, kiwi, apple; thenComparing(naturalOrder()) breaks the tie to fig, kiwi, pear, apple; .reversed() flips the whole chain to apple, pear, kiwi, fig. Comparable: record Point implements compareTo by x, then y, so Collections.sort needs no comparator. Comparators plug into Arrays.sort, list.sort, PriorityQueue, TreeMap and TreeSet, where compare 0 means duplicate. apple compareTo apricot is -2. Object sorts are stable.](diagrams/java38_info_sorting_define_ai.png)

### Simple Explanation

A comparator is a referee for two items. Hand it `a` and `b`, and it answers with a sign: negative means `a` goes first, zero means a tie, positive means `b` goes first. A sort asks it about many pairs and builds the order from the answers.

`Comparable` is the order a type carries with it — numbers small to big, strings A to Z. A `Comparator` is an order you hand in from outside, so the same data can be sorted many ways.

> **Official definition —** a `Comparator<T>` is a functional interface whose `compare(a, b)` returns a negative, zero or positive `int`, imposing a total order on `T`; `Comparable<T>` gives a class its natural order through `compareTo`.

### Sorting at a glance

| Topic | Answer |
|---|---|
| Import | `java.util.*` — `Comparator`, `Arrays`, `Collections` |
| `compare(a, b)` returns | a sign: negative, zero or positive |
| Compare two numbers | `Integer.compare(a, b)` — never `a - b` |
| Sort cost | $O(n \log n)$ |
| Stable (ties keep input order)? | object sorts yes; `int[]` sort no |
| `int[]` with a comparator? | impossible — use `Integer[]` |
| Plugs into | sorts, `PriorityQueue`, `TreeMap`, `TreeSet` |

### 1. Write a comparator

```java
// A comparator is a lambda (a, b) -> int. Only the sign counts.
Comparator<Integer> asc  = (a, b) -> Integer.compare(a, b);  // or Integer::compare
Comparator<Integer> desc = (a, b) -> Integer.compare(b, a);  // swapped
Comparator<String> byLen = Comparator.comparingInt(String::length);

// The wrappers' static compare — use these, never a - b
Integer.compare(3, 7)          // -1   3 goes first
Double.compare(0.7, 0.3)       // 1    0.3 goes first
"apple".compareTo("apricot")   // -2   any negative: "apple" first
```

```
  compare(a, b) returns    meaning           sorted result
  ─────────────────────    ──────────────    ─────────────────
  negative (-1, -2, …)     a goes first      a … b
  zero                     a tie             input order kept
  positive (1, 42, …)      b goes first      b … a
```

- The contract: swap `a` and `b` and the sign flips; if `a < b` and `b < c` then `a < c`. Break it and the sort goes wrong silently (see Traps).

### 2. Build comparators — `Comparator` factory methods

```java
// Each result sorts w = [pear, fig, apple, kiwi]
Comparator.naturalOrder()      // [apple, fig, kiwi, pear]   uses compareTo
Comparator.reverseOrder()      // [pear, kiwi, fig, apple]   = Collections.reverseOrder()
Comparator.comparingInt(String::length)
                               // [fig, pear, kiwi, apple]   tie: input order kept
Comparator.comparingInt(String::length).thenComparing(Comparator.naturalOrder())
                               // [fig, kiwi, pear, apple]   tie broken A → Z
// comparing(key): any Comparable key; comparingInt/Long/Double: no boxing
// cmp.thenComparing(key): tie-breaker;  cmp.reversed(): flips the WHOLE chain
```

`.reversed()` flips everything chained **before** it. With `record Task(String name, int prio)`, each line sorts `ts = [build/2, test/1, apply/2, zip/1]` (name/prio):

```java
Comparator<Task> byPrio = Comparator.comparingInt(Task::prio);
ts.sort(byPrio.reversed().thenComparing(Task::name));
// [apply/2, build/2, test/1, zip/1]    prio ↓, name ↑
ts.sort(byPrio.thenComparing(Task::name).reversed());
// [build/2, apply/2, zip/1, test/1]    prio ↓, name ↓ — both!
ts.sort(byPrio.thenComparing(Task::name, Comparator.reverseOrder()));
// [zip/1, test/1, build/2, apply/2]    prio ↑, name ↓
```

- To flip only the first key, call `.reversed()` straight after it. To flip only a later key, pass `Comparator.reverseOrder()` as the second argument of `thenComparing`.

### 3. `Comparable` — give your own type a natural order

```java
// A record ordered by x, then by y
record Point(int x, int y) implements Comparable<Point> {
    public int compareTo(Point o) {
        int c = Integer.compare(x, o.x);
        return c != 0 ? c : Integer.compare(y, o.y);
    }
}
// pts = [(2,3), (1,5), (2,1)] — no comparator needed now
Collections.sort(pts);      // [(1,5), (2,1), (2,3)]
new PriorityQueue<>(pts)    // min-heap: peek() → (1,5); TreeSet works too
```

- A comparator you pass in wins over `compareTo`: `new PriorityQueue<Point>(Comparator.reverseOrder())` is a max-heap — `peek()` gives `(2,3)`.
- In DSA you mostly **pass** comparators. Implement `Comparable` when a type has one obvious order — a heap node, a Dijkstra state.

> **Interview —** *"`Comparable` or `Comparator` — when do you use which?"*
>
> **Say:** `Comparable` is the type's one natural order, written once in `compareTo` and used automatically by `Collections.sort`, `TreeMap` and a bare `PriorityQueue`. `Comparator` is any other order, passed in from outside — a second order, or an order for a type you don't own. Keep `compareTo` returning `0` only for equal objects, or a `TreeSet` will drop elements that a `HashSet` keeps.

### 4. Where comparators plug in

```java
// ── Arrays ────────────────────────────────────── O(n log n)
Arrays.sort(nums);                               // int[]: ascending only (§38.2)
Arrays.sort(boxed, Collections.reverseOrder());  // Integer[]: descending
// int[][]: the comparator gets two rows. iv = {{8, 10}, {1, 9}, {2, 3}}
Arrays.sort(iv, (x, y) -> Integer.compare(x[0], y[0]));
// by start → [[1, 9], [2, 3], [8, 10]]
String[] s = {"b", "B", "a"};                    // each sort starts from s
Arrays.sort(s);                                  // [B, a, b]   'B' < 'a'
Arrays.sort(s, String.CASE_INSENSITIVE_ORDER);   // [a, b, B]

// ── Lists ─────────────────────────────────────── O(n log n)
list.sort(cmp);                // the usual call; list.sort(null) = natural
Collections.sort(list);        // natural order (calls list.sort)

// ── Heaps and trees: pass it to the constructor ──
new PriorityQueue<Integer>(Comparator.reverseOrder())   // max-heap (§38.7)
new TreeMap<String, Integer>(Comparator.reverseOrder()) // keys Z → A (§38.8)
TreeSet<String> byLen = new TreeSet<>(Comparator.comparingInt(String::length));
byLen.add("fig");          // true
byLen.add("dog");          // false — same length = "duplicate"
```

**Remember**

- Object sorts — `Integer[]`, `String[]`, `int[][]`, any `List` — use TimSort: **stable** (ties keep input order), $O(n \log n)$.
- `Arrays.sort(int[])` uses dual-pivot quicksort — not stable, but equal `int`s look identical. Descending `int[]`: sort, then reverse (§38.2).
- In a `TreeSet` or `TreeMap`, a comparator result of `0` means **the same key** — the newcomer is dropped (§38.8).

### 5. DSA idioms you'll write every day

![Cheat sheet of Java sorting idioms and comparator traps. Idioms: sort intervals by start with Integer.compare on x(0) and y(0), or by end (Merge Intervals, Non-overlapping Intervals); count descending, then A to Z with a.compareTo(b) as tie-breaker (Top K Frequent Words); Largest Number sorts with (b + a).compareTo(a + b), so 3, 30, 34, 5, 9 gives 9534330; length, then A to Z; comparingLong on the squared distance cast to long (K Closest Points); sort an Integer index array by a(i), so 50, 10, 40, 20 gives 1, 3, 2, 0 (Relative Ranks). Traps: a - b overflows, big - small = -294967296; an int cast of a double difference makes 0.7 and 0.3 tie; comparingInt(x -> x(0)).reversed() and Arrays.sort on an int array with a comparator do not compile; .reversed() after thenComparing flips both keys; a TreeSet by length drops equal lengths; a within-2 tie rule gives wrong order or IllegalArgumentException.](diagrams/java38_info_sorting_idioms_traps_ai.png)

```java
// 1. Intervals by start — Merge Intervals, Meeting Rooms
Arrays.sort(iv, (x, y) -> Integer.compare(x[0], y[0]));
// [[8,10],[1,3],[15,18],[2,6]] → merged [[1,6],[8,10],[15,18]]

// 2. By end — Non-overlapping Intervals, Min Arrows to Burst Balloons
Arrays.sort(iv, (x, y) -> Integer.compare(x[1], y[1]));
// then keep each interval that starts at or after the last kept end

// 3. By count — Top K Frequent Words, Sort Characters By Frequency
List<String> ws = new ArrayList<>(cnt.keySet());   // cnt: word → count
ws.sort((a, b) -> {
    int c = Integer.compare(cnt.get(b), cnt.get(a));   // count ↓
    return c != 0 ? c : a.compareTo(b);                // then A → Z
});
// "i love leetcode i love coding", k = 2 → [i, love]

// 4. Custom string order — Largest Number
Arrays.sort(s, (a, b) -> (b + a).compareTo(a + b));
// {"3", "30", "34", "5", "9"} → String.join → "9534330" (if s[0] is "0", answer "0")

// 5. Squared distance as long — K Closest Points to Origin
Arrays.sort(pts, Comparator.comparingLong(
        p -> (long) p[0] * p[0] + (long) p[1] * p[1]));

// 6. Sort indexes, keep the data — Relative Ranks, Sort the People
Integer[] idx = new Integer[n];
for (int i = 0; i < n; i++) idx[i] = i;
Arrays.sort(idx, (i, j) -> Integer.compare(a[i], a[j]));
// a = [50, 10, 40, 20] → idx = [1, 3, 2, 0]
```

### 6. Traps

The classic one — `(a, b) -> a - b` overflows (run in Try it):

```java
int big = 2_000_000_000, small = -2_000_000_000;
big - small                    // -294967296   wrapped: "big first"
Integer.compare(big, small)    // 1            correct
```

| ✗ Mistake | What happens | ✓ Fix |
|---|---|---|
| `(a, b) -> a - b` | overflow → wrong order | `Integer.compare(a, b)` |
| `(int) (a - b)` on doubles | `0.7` vs `0.3` ties | `Double.compare(a, b)` |
| "within 2 = tie" comparator | wrong order, sometimes `IllegalArgumentException` | compare a real key |
| `comparingInt(x -> x[0]).reversed()` | does not compile | `(int[] x) -> x[0]` |
| `Arrays.sort(intArr, cmp)` | does not compile | `Integer[]`, or sort + reverse |
| `.thenComparing(k2).reversed()` | both keys reversed | `.reversed()` right after key 1 |
| no tie-breaker | ties keep input order | add `.thenComparing(...)` |
| `new TreeSet<>(byLength)` | equal lengths dropped | add a tie-breaker |
| `compareTo` disagrees with `equals` | `TreeSet`, `HashSet` disagree | `0` only when equal |
| `new PriorityQueue<Node>()`, no order | `ClassCastException` on add | `Comparable` or a comparator |

### 7. Try it

One complete program — the output is real (JDK 25).

```java
// Comparators: the a - b trap, .reversed() placement, int[][] rows, a custom order, TreeSet ties.
import java.util.*;

public class SortingTry {
    record Task(String name, int prio) {
        public String toString() { return name + "/" + prio; }
    }
    public static void main(String[] args) {
        // 1. a - b overflows; Integer.compare does not
        Integer[] bad = {2_000_000_000, -2_000_000_000, 0}, good = bad.clone();
        Arrays.sort(bad, (a, b) -> a - b);
        Arrays.sort(good, Integer::compare);
        System.out.println("a - b           -> " + Arrays.toString(bad));
        System.out.println("Integer.compare -> " + Arrays.toString(good));
        // 2. Where .reversed() goes decides which keys flip
        List<Task> ts = new ArrayList<>(List.of(new Task("build", 2), new Task("test", 1),
                new Task("apply", 2), new Task("zip", 1)));
        Comparator<Task> byPrio = Comparator.comparingInt(Task::prio);
        ts.sort(byPrio.reversed().thenComparing(Task::name));
        System.out.println("prio desc, name -> " + ts);
        ts.sort(byPrio.thenComparing(Task::name).reversed());
        System.out.println("both desc       -> " + ts);
        // 3. int[][] rows, descending: type the lambda so .reversed() compiles
        int[][] iv = {{8, 10}, {1, 9}, {2, 3}};
        Arrays.sort(iv, Comparator.comparingInt((int[] x) -> x[0]).reversed());
        System.out.println("start desc      -> " + Arrays.deepToString(iv));
        // 4. Custom string order: Largest Number
        String[] s = {"3", "30", "34", "5", "9"};
        Arrays.sort(s, (a, b) -> (b + a).compareTo(a + b));
        System.out.println("Largest Number  -> " + String.join("", s));
        // 5. In a TreeSet, compare == 0 means "duplicate"
        TreeSet<String> byLen = new TreeSet<>(Comparator.comparingInt(String::length));
        System.out.println("TreeSet by len  -> add fig " + byLen.add("fig")
                + ", add dog " + byLen.add("dog") + ", set " + byLen);
    }
}
```

**Output:**

```
a - b           -> [2000000000, -2000000000, 0]
Integer.compare -> [-2000000000, 0, 2000000000]
prio desc, name -> [apply/2, build/2, test/1, zip/1]
both desc       -> [build/2, apply/2, zip/1, test/1]
start desc      -> [[8, 10], [2, 3], [1, 9]]
Largest Number  -> 9534330
TreeSet by len  -> add fig true, add dog false, set [fig]
```

- **`both desc`:** one `.reversed()` at the end flipped *both* keys — `build` now comes before `apply`.

<details>
<summary><strong>Quick check.</strong> <code>Arrays.sort(iv, Comparator.comparingInt(x -&gt; x[0]).reversed())</code> does not compile. Why, and what do you write instead?</summary>

Calling `.reversed()` on the result stops Java from using the `int[][]` to type `x`, so `x` is `Object` and `x[0]` fails: *"array required, but Object found"*. Write `Comparator.comparingInt((int[] x) -> x[0]).reversed()`, or simply `(a, b) -> Integer.compare(b[0], a[0])`.

</details>

<details>
<summary><strong>Quick check.</strong> Your comparator treats values within 2 of each other as equal. A 10-element test passes. What happens on the real input?</summary>

The rule is not transitive (`1` ties `3`, `3` ties `5`, but `1 < 5`), so the order is wrong. Under 32 elements the sort never checks, so tests pass. On large inputs it either returns a silently wrong order or — only sometimes — throws `IllegalArgumentException: Comparison method violates its general contract!`. Compare a real key instead, such as `Math.floorDiv(v, 3)`.

</details>

---

## 38.11 Numbers, Math & Wrapper Types ★★★

**Use `int` by default, and `long` when** a sum or product can pass about $2 \times 10^9$ — prefix sums, products of two big values, "return the answer modulo $10^9 + 7$". Use `Integer` only where a collection needs an object (§38.4–§38.8).

![Cheat sheet on defining and using Java numbers. Primitive types: int is 32 bits with a range of about plus or minus 2,147,483,647; long is 64 bits, about plus or minus 9.2 × 10 to the 18; double is 64 bits with about 15 digits; char is 16 bits and 'a' = 97; boolean is true or false. Literals: 1_000_000_007 is an int, 10L a long, 1e9 a double, 'a' + 1 gives 98 and (int) 3.99 gives 3. Limits: Integer.MAX_VALUE is 2147483647, MIN_VALUE is -2147483648, and MAX_VALUE + 1 wraps to MIN_VALUE with no error, shown on a number line. Wrappers: list.add(5) boxes int to Integer and list.get(0) unboxes; two Integers of 128 give a == b false but a.equals(b) true, since == works only for -128..127. Math: max(3, 7) is 7, abs(-5) is 5, pow(2, 10) is 1024.0, sqrt(16) is 4.0, 7 / 2 is 3 and 7.0 / 2 is 3.5. Parse and convert: parseInt, parseLong, String.valueOf, toString(10, 2) is 1010, bitCount(13) is 3, '7' - '0' is 7.](diagrams/java38_info_numbers_define_ai.png)

### Simple Explanation

An `int` is like a car's odometer with a fixed number of digits. Past its top value, 2,147,483,647, it does not stop or warn you — it rolls over to −2,147,483,648. Most number bugs in DSA are this silent rollover, and they show up only on the big hidden test.

`int` is the number itself. `Integer` is a **box** around an `int`, because `List`, `Map` and `PriorityQueue` store only objects. Java boxes and unboxes for you — but a box can be `null`, and `==` on two boxes compares the boxes, not the numbers.

> **Official definition —** Java's primitive types have the same size on every platform (`int` is always 32 bits, `long` 64), and each has a wrapper class that the compiler converts to and from automatically (autoboxing and unboxing).

### Numbers at a glance

| Topic | Answer |
|---|---|
| Import | none — `Math`, `Integer`, `Long` are in `java.lang` |
| Default type | `int`; `long` for big sums and products |
| `int` range | about $\pm 2.1 \times 10^9$ ($2^{31} - 1$) |
| `long` range | about $\pm 9.2 \times 10^{18}$ ($2^{63} - 1$) |
| On overflow | wraps silently — no exception |
| `int / int` | drops the remainder: `7 / 2` is `3` |
| `Integer` | a box for collections; can be `null` |
| Compare two `Integer`s | `.equals`, never `==` |

### 1. Primitive types, literals and casts

```java
// ── The types DSA uses ────────────────────────
int     n   = 42;    // 32-bit: -2,147,483,648 .. 2,147,483,647
long    sum = 0L;    // 64-bit: about ±9.2 × 10^18
double  avg = 2.5;   // 64-bit decimal, ~15-16 significant digits
char    ch  = 'a';   // 16-bit, unsigned: 'a' is 97, 'A' is 65
boolean ok  = true;  // byte, short, float are rare — use int, double

// ── Literals and limits (limits are also min / max sentinels) ──
1_000_000_007           // int — the _ are only for reading
3_000_000_000L          // long — capital L; without it: "integer number too large"
1e9                     // 1.0E9 — a DOUBLE: int x = 1e9; does not compile
Integer.MAX_VALUE       // 2147483647    (2^31 - 1)
Integer.MIN_VALUE       // -2147483648   (-2^31)
Integer.MAX_VALUE + 1   // -2147483648 — wraps, no error

// ── Casts: widening is automatic, narrowing needs (type) ──
long   a = 5;                    // int → long, automatic
int    c = (int) 3.99;           // 3  — drops the fraction
int    d = (int) -3.99;          // -3 — toward zero, not -4
int    f = (int) 3_000_000_000L; // -1294967296 — top bits cut off
char   g = (char) ('a' + 2);     // 'c' — 'a' + 2 alone is the int 99
int    h = '7' - '0';            // 7  — digit char → int
```

### 2. Wrapper types — `Integer`, `Long`, `Character`

```java
// ── Autoboxing: int ↔ Integer, done for you ───
List<Integer> list = new ArrayList<>(); // List<int> does not compile
list.add(5);            // boxes:   Integer.valueOf(5)
int x = list.get(0);    // unboxes: list.get(0).intValue() → 5
Integer none = null;    // a box can be null ...
int y = none;           // ... unboxing it throws NullPointerException

// ── Compare boxes by value ────────────────────
Integer a = 127, b = 127, c = 128, d = 128;
a == b                  // true  — the same cached box (-128..127)
c == d                  // false — two different boxes
c.equals(d)             // true  ✓ (Objects.equals(c, d) is null-safe)
c.intValue() == d       // true  ✓ one side is int → compares numbers

// ── Parse and convert ─────────────────────────
Integer.parseInt("-42")         // -42 (an int); Long.parseLong for long
Integer.parseInt("12a")         // NumberFormatException (" 42" too)
Integer.parseInt("1010", 2)     // 10 — read in base 2
String.valueOf(42)              // "42"
Integer.toBinaryString(10)      // "1010" — or Integer.toString(10, 2)
Character.getNumericValue('7')  // 7  — same as '7' - '0' (§38.3)
Character.getNumericValue('a')  // 10 — letters count as 10..35
```

- `Long` has the same methods and caches −128..127 too. Keep locals and arrays as `int`: a box costs memory and can be `null`.
- In comparators use `Integer.compare(a, b)`, not `a - b`, which can overflow (§38.10).

### 3. `Math`, division and overflow

```java
// ── Math — static methods, no import ──────────
Math.max(3, 7)            // 7   — min(3, 7) → 3; int in, int out
Math.abs(-5)              // 5
Math.pow(2, 10)           // 1024.0 — always a double: (long) Math.pow(2, 10)
(int) Math.sqrt(17)       // 4   — the floor of the root
Math.ceil(2.1)            // 3.0 — a double; Math.floor(2.7) → 2.0
Math.round(2.5)           // 3   (a long); Math.round(-2.5) → -2

// ── Integer division and remainder ────────────
7 / 2                     // 3   — the remainder is dropped
-7 / 2                    // -3  — rounds toward zero
-7 % 2                    // -1  — takes the sign of the left side
Math.floorMod(-7, 2)      // 1   — always 0..n-1 for n > 0
(double) 7 / 2            // 3.5 — cast BEFORE you divide
1 / 0                     // ArithmeticException: / by zero

// ── Overflow: fail loudly instead of wrapping ─
Math.addExact(Integer.MAX_VALUE, 1)     // ArithmeticException
Math.multiplyExact(100_000, 100_000)    // ArithmeticException
Math.multiplyExact(100_000L, 100_000L)  // 10000000000

// ── double: never compare with == ─────────────
0.1 + 0.2 == 0.3          // false — the sum is 0.30000000000000004
Math.abs(x - y) < 1e-9    // ✓ equal within a tolerance
```

> **Interview —** *"Why can `int mid = (lo + hi) / 2;` break a binary search?"*
>
> **Say:** `lo + hi` is computed as an `int` first. Past 2,147,483,647 it wraps negative, so `mid` is negative and `a[mid]` throws — or the search goes the wrong way. The midpoint itself fits; only the sum does not. `lo + (hi - lo) / 2` never goes above `hi`, so it cannot overflow.

### 4. DSA idioms you'll write every day

![Cheat sheet of Java number idioms and traps. Idioms: answer mod 1e9 + 7 with final long MOD = 1_000_000_007 and (a * b) % MOD on long values (Knight Dialer, Dice Rolls); safe midpoint lo + (hi - lo) / 2 (Binary Search); ceiling division (a + b - 1) / b (Koko Eating Bananas); digits with n % 10 and n /= 10 (Palindrome Number, Add Digits); Euclid's gcd (GCD of Strings); fast power by squaring with e & 1 and e >>= 1 (Pow(x, n), Count Good Numbers); power of two as n > 0 && (n & (n - 1)) == 0; Integer.bitCount(n) and XOR, where a ^ a = 0 (Number of 1 Bits, Single Number). Traps: long x = a * b overflows in int first, so cast one side; sum / n gives 2.0 not 2.5; -7 % 2 is -1, so use Math.floorMod; Math.abs(MIN_VALUE) is still negative; int x = map.get(k) throws NPE when k is missing; (long) Math.pow(3, 39) is off by 11; 0.1 + 0.2 == 0.3 is false; 1 << 32 is 1, so write 1L << 32.](diagrams/java38_info_numbers_idioms_traps_ai.png)

```java
// 1. Answer modulo 1e9 + 7 — Knight Dialer, Number of Dice Rolls
static final long MOD = 1_000_000_007;
long ans = (a * b) % MOD;            // a, b < MOD and long: fits
ans = (ans + x) % MOD;               // add, then reduce
ans = (ans - y + MOD) % MOD;         // subtract: + MOD keeps it ≥ 0

// 2. Safe midpoint — Binary Search, Search Insert Position
int mid = lo + (hi - lo) / 2;        // not (lo + hi) / 2

// 3. Ceiling division — Koko Eating Bananas
int hours = (pile + speed - 1) / speed;   // 7 at 3 per hour → 3

// 4. Digits, last first — Palindrome Number, Reverse Integer
while (n != 0) {
    int d = n % 10;                  // last digit (keeps n's sign)
    n /= 10;                         // drop it
    if (rev > Integer.MAX_VALUE / 10 // check BEFORE it overflows
            || rev < Integer.MIN_VALUE / 10) return 0;
    rev = rev * 10 + d;              // -123 → -321
}

// 5. Fast power: base^e % MOD in O(log e) — Pow(x, n), Count Good Numbers
long result = 1;
base %= MOD;
while (e > 0) {
    if ((e & 1) == 1) result = result * base % MOD;
    base = base * base % MOD;
    e >>= 1;
}

// 6. Bit tricks — Power of Two, Number of 1 Bits, Single Number
n > 0 && (n & (n - 1)) == 0          // power of two
Integer.bitCount(n)                  // number of 1 bits: bitCount(13) → 3
for (int v : nums) x ^= v;           // a ^ a = 0: the lone one stays
```

- **Pow(x, n):** copy `n` into a `long` before you negate it — `-n` is still negative when `n` is `Integer.MIN_VALUE`.
- `^` in Java is XOR, not "to the power of": `2 ^ 3` is `1`. More in [Ch 31d](#content/31d_dsa_advanced_ml_coding) (Bit Manipulation).

### 5. Traps

| ✗ Mistake | What happens | ✓ Fix |
|---|---|---|
| `Integer.MAX_VALUE + 1` | wraps to `MIN_VALUE` | `long`, or `Math.addExact` |
| `(lo + hi) / 2` | negative for big `lo`, `hi` | `lo + (hi - lo) / 2` |
| `long x = a * b;` (ints) | overflows before widening | `(long) a * b` |
| `a == b` on `Integer`s | `false` above 127 | `a.equals(b)` |
| `int x = map.get(k);` | NPE if `k` is missing | `getOrDefault(k, 0)` (§38.5) |
| `double avg = sum / n;` | `2.0`, not `2.5` | `(double) sum / n` |
| `(i - k) % n` as an index | negative → out of bounds | `Math.floorMod(i - k, n)` |
| `Math.abs(Integer.MIN_VALUE)` | still negative | `long`, or `Math.absExact` |
| `(long) Math.pow(3, 39)` | off by 11 (a `double`) | multiply in a `long` loop |
| `0.1 + 0.2 == 0.3` | `false` | `Math.abs(x - y) < 1e-9` |
| `n & (n - 1) == 0` | does not compile | `(n & (n - 1)) == 0` |
| `1 << 32` | `1`, not 4294967296 | `1L << 32` |

### 6. Try it

One complete program — the output is real (JDK 25).

```java
// Overflow, division and boxing: the number traps that break DSA code.
import java.util.*;

public class NumberTraps {
    static final long MOD = 1_000_000_007;

    public static void main(String[] args) {
        int a = 100_000, b = 100_000;
        System.out.println("MAX + 1 = " + (Integer.MAX_VALUE + 1));
        System.out.println("a * b = " + a * b + ", (long) a * b = " + (long) a * b);
        int lo = 1_500_000_000, hi = 2_000_000_000;
        System.out.println("(lo + hi) / 2 = " + (lo + hi) / 2
                + ", lo + (hi - lo) / 2 = " + (lo + (hi - lo) / 2));
        long x = MOD - 1;                          // both factors < MOD, in a long
        System.out.println("x * x % MOD = " + x * x % MOD
                + ", (5 - 7 + MOD) % MOD = " + (5 - 7 + MOD) % MOD);
        int sum = 5, n = 2;
        System.out.println("sum / n = " + sum / n + ", (double) sum / n = " + (double) sum / n);

        Map<String, Integer> count = new HashMap<>();
        try {
            int c = count.get("k");                // unboxing null
        } catch (NullPointerException e) {
            System.out.println("int c = count.get(\"k\") -> NullPointerException");
        }
        try {
            Math.multiplyExact(a, b);
        } catch (ArithmeticException e) {
            System.out.println("multiplyExact(a, b) -> ArithmeticException: " + e.getMessage());
        }
    }
}
```

**Output:**

```
MAX + 1 = -2147483648
a * b = 1410065408, (long) a * b = 10000000000
(lo + hi) / 2 = -397483648, lo + (hi - lo) / 2 = 1750000000
x * x % MOD = 1, (5 - 7 + MOD) % MOD = 1000000005
sum / n = 2, (double) sum / n = 2.5
int c = count.get("k") -> NullPointerException
multiplyExact(a, b) -> ArithmeticException: integer overflow
```

- **`a * b` vs `(long) a * b`:** the first multiplied in `int` and wrapped; the cast made the multiply happen in `long`.

<details>
<summary><strong>Quick check.</strong> <code>Integer a = 128, b = 128;</code> — is <code>a == b</code> true? And with 127?</summary>

`false` for 128, `true` for 127. Boxing goes through `Integer.valueOf`, which reuses cached boxes for −128..127, so two 127s are the same object. `==` compares the boxes — always use `a.equals(b)`.

</details>

<details>
<summary><strong>Quick check.</strong> What are <code>-7 % 3</code> and <code>Math.floorMod(-7, 3)</code>?</summary>

`-1` and `2`. `%` takes the sign of the left side; `Math.floorMod` always lands in `0..n-1` for positive `n` — use it for circular indexes and hash buckets.

</details>

---

## 38.12 Choosing the Right Structure — One-Page Cheat Sheet ★★★

**Use this page when** you know the problem and need the structure: declare it, pick it, cost it, and dodge the bugs that pass small tests. All code is checked on JDK 25; costs follow the Javadoc.

![Declaring Java structures for DSA. Arrays and strings: new int of n with a(i), a.length, Arrays.sort(a); a grid with g.length rows and g(0).length cols; StringBuilder with append, reverse, toString. List, map, set: ArrayList with add, get, set, size; HashMap with getOrDefault, merge, containsKey; HashSet with add, contains, remove. Stack and queue: Deque and Queue both made with new ArrayDeque; push, pop and poll at the front, offer at the back. Build your own: adj.get(u).add(v), ListNode val and next, TreeNode val, left, right, an int parent array with find and union. Heap: new PriorityQueue keeps the smallest at the head, Collections.reverseOrder() the largest; offer, poll, peek, size. Sorted and ordered: TreeMap floorKey, ceilingKey, firstKey; TreeSet floor, ceiling, first, last; LinkedHashMap keeps insertion order; on keys 10, 20, 30, floorKey(25) is 20 and ceilingKey(25) is 30. Never use Stack.](diagrams/java38_info_cheatsheet_declare_ai.png)

### 1. Declare every structure

One import covers all of `java.util`. Each comment lists the methods you will call most.

```java
import java.util.*;

// ── Arrays (§38.2) ────────────────────────────────────────
int[] a = new int[n];                // a[i] · a.length · a.clone()
int[][] grid = new int[rows][cols];  // grid[r][c] · grid[0].length
// Arrays.sort(a) · Arrays.fill(a, -1) · Arrays.toString(a)

// ── Strings (§38.3) ───────────────────────────────────────
String s = "hello";
// charAt(i) · length() · substring(i, j) · toCharArray()
StringBuilder sb = new StringBuilder();
// append(x) · reverse() · deleteCharAt(i) · toString()

// ── List (§38.4) ──────────────────────────────────────────
List<Integer> list = new ArrayList<>();
// add(x) · get(i) · set(i, x) · size() · getLast() (Java 21)

// ── Hash map and set (§38.5) ──────────────────────────────
Map<String, Integer> map = new HashMap<>();
// getOrDefault(k, 0) · merge(k, 1, Integer::sum) · containsKey(k)
Map<Integer, List<Integer>> groups = new HashMap<>();
// groups.computeIfAbsent(k, x -> new ArrayList<>()).add(v)
Set<Integer> set = new HashSet<>();
// add(x) → false if present · contains(x) · remove(x)

// ── Stack and queue (§38.6) ───────────────────────────────
Deque<Integer> stack = new ArrayDeque<>();   // push · pop · peek
Queue<Integer> queue = new ArrayDeque<>();   // offer · poll · peek
// both: isEmpty() · size()

// ── Heap (§38.7) ──────────────────────────────────────────
PriorityQueue<Integer> minHeap = new PriorityQueue<>();
PriorityQueue<Integer> maxHeap =
        new PriorityQueue<>(Collections.reverseOrder());
// offer(x) · poll() · peek() · size() — head = min (or max)

// ── Sorted and ordered (§38.8) ────────────────────────────
TreeMap<Integer, Integer> tm = new TreeMap<>();
// floorKey(x) · ceilingKey(x) · firstKey() · pollFirstEntry()
TreeSet<Integer> ts = new TreeSet<>();
// floor(x) · ceiling(x) · first() · last()
Map<String, Integer> lhm = new LinkedHashMap<>();  // insertion order
// new LinkedHashMap<>(16, 0.75f, true) → access order (LRU)

// ── Build your own (§38.9) ────────────────────────────────
List<List<Integer>> adj = new ArrayList<>();
for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
adj.get(u).add(v);                           // edge u → v
class ListNode { int val; ListNode next; }   // head.next
class TreeNode { int val; TreeNode left, right; }
class TrieNode { TrieNode[] next = new TrieNode[26]; boolean end; }
int[] parent = new int[n];  // parent[i] = i; then find(x), union(a, b)
```

- Declare with the interface (`Map`, `Set`, `Deque`, `Queue`), build with the class. Keep `TreeMap` and `TreeSet` as their own type — `Map` has no `floorKey`.
- `stack` and `queue` are both `ArrayDeque`: `push`/`pop` work at the front; `offer` adds at the back, `poll` takes from the front.

### 2. Pick the right structure

![Picking a Java structure. Access by index: int array or ArrayList. Key to value or counts: HashMap. Dedupe: HashSet. LIFO, brackets, undo: ArrayDeque as a stack. FIFO, BFS, level order: ArrayDeque as a queue. Min or max, top-k: PriorityQueue. Sorted keys, floor, ceiling: TreeMap or TreeSet. Insertion order, LRU: LinkedHashMap. Build a string: StringBuilder. Graph: List of List of Integer. Connected, cycles: Union-Find. Prefix search: Trie. Costs for get, add, remove, min or max: int array O(1), fixed, fixed, O(n); ArrayList O(1), amortised O(1), O(n), O(n); HashMap and HashSet O(1) expected, O(n) min; ArrayDeque O(1) at the ends, O(n) min; PriorityQueue O(1) peek, O(log n) add and poll, O(1) head; TreeMap and TreeSet O(log n) for all. HashMap has no order; TreeMap keeps keys sorted. Heap gotchas: remove(x) and contains(x) are O(n), a printed heap is not sorted; use a TreeMap of counts.](diagrams/java38_info_cheatsheet_pick_ai.png)

| If you need | Use | Why |
|---|---|---|
| Access by index | `int[]` (fixed) or `ArrayList` (grows) | $O(1)$ `a[i]`, `get(i)` |
| Key → value, counts | `HashMap` | $O(1)$ expected |
| Membership, dedupe | `HashSet` | $O(1)$ expected `contains` |
| LIFO: brackets, undo, monotonic stack | `ArrayDeque` as a stack | $O(1)$ `push`, `pop` |
| FIFO: BFS, level order | `ArrayDeque` as a queue | $O(1)$ `offer`, `poll` |
| Min or max again and again, top-k | `PriorityQueue` | $O(\log n)$ `offer`, `poll` |
| Sorted keys, floor or ceiling, ranges | `TreeMap` / `TreeSet` | $O(\log n)$, always sorted |
| Insertion order, LRU cache | `LinkedHashMap` | hash speed, keeps order |
| Build a string | `StringBuilder` | $O(n)$ total, not $O(n^2)$ |
| Graph | `List<List<Integer>>` | $O(V + E)$ space |
| Connected? Cycle in undirected graph | Union-Find (`int[] parent`) | near-$O(1)$ `find` |
| Prefix search, autocomplete | Trie | $O(L)$ per word |

- Only lowercase letters? Use `int[26]` with `freq[ch - 'a']++`, not a `HashMap` — no boxing, no hashing (§38.2).
- Need sorted order only once, at the end? Sort an `ArrayList` in $O(n \log n)$ — no `TreeMap` needed.

### 3. What each operation costs

| Structure | Access | Search | Insert | Delete | Min / max |
|---|---|---|---|---|---|
| `int[]` | $O(1)$ | $O(n)$; sorted $O(\log n)$ | fixed size | fixed size | $O(n)$ |
| `ArrayList` | $O(1)$ | $O(n)$ | end $O(1)$\*; middle $O(n)$ | end $O(1)$; middle $O(n)$ | $O(n)$ |
| `HashMap` / `HashSet` | — | $O(1)$ expected | $O(1)$ expected | $O(1)$ expected | $O(n)$ |
| `LinkedHashMap` | — | $O(1)$ expected | $O(1)$ expected | $O(1)$ expected | eldest $O(1)$ |
| `ArrayDeque` | ends $O(1)$ | $O(n)$ | ends $O(1)$\* | ends $O(1)$ | $O(n)$ |
| `PriorityQueue` | `peek` $O(1)$ | $O(n)$ | $O(\log n)$ | `poll` $O(\log n)$; `remove(x)` $O(n)$ | head $O(1)$ |
| `TreeMap` / `TreeSet` | — | $O(\log n)$ | $O(\log n)$ | $O(\log n)$ | $O(\log n)$ |
| Linked list (`ListNode`) | $O(n)$ | $O(n)$ | $O(1)$ after a node | $O(1)$ after a node | $O(n)$ |
| Adjacency list | — | edge $O(\deg u)$ | edge $O(1)$\* | edge $O(\deg u)$ | — |
| Union-Find | — | `find` near $O(1)$\*\* | `union` near $O(1)$\*\* | — | — |
| Trie | — | $O(L)$ | $O(L)$ | $O(L)$ | — |

- \* amortised — an occasional resize copies everything. \*\* with path compression and union by rank or size. $L$ = word length.
- Hash structures are $O(1)$ *expected*: many keys with the same `hashCode` slow them down. `TreeMap` is $O(\log n)$ *guaranteed* (a red-black tree).
- `PriorityQueue.remove(x)` and `contains(x)` scan the whole heap. To delete any value fast, use a `TreeMap` of counts.

### 4. Top silent bugs

| ✗ Bug | What happens | ✓ Fix | See |
|---|---|---|---|
| `Integer a == b` | `true` to 127, `false` from 128 | `a.equals(b)` | §38.11 |
| `int c = map.get(k)` | missing key → `NullPointerException` | `getOrDefault(k, 0)` | §38.5 |
| `a * b`, `(lo + hi) / 2` | wraps negative, no error | `long`; `lo + (hi - lo) / 2` | §38.11 |
| `(a, b) -> a - b` | overflow flips the order | `Integer.compare(a, b)` | §38.10 |
| `list.remove(1)` on `List<Integer>` | removes index 1 | `remove(Integer.valueOf(1))` | §38.4 |
| `remove` inside a for-each | `ConcurrentModificationException` | `removeIf` or an `Iterator` | §38.4 |
| `int[]` or mutated map key | `get` returns `null` | `List.of(r, c)` or a `record` | §38.5 |
| `Arrays.asList(intArr)` | a List of size 1 | `Arrays.stream(a).boxed().toList()` | §38.2 |
| `s += c` in a loop | $O(n^2)$ copying | `StringBuilder` | §38.3 |
| `"a.b.c".split(".")` | regex: empty array | `split("\\.")` | §38.3 |

<details>
<summary><strong>Quick check.</strong> Bookings arrive one by one. For a time <code>t</code>, you need the latest booking at or before <code>t</code>. Which structure and method?</summary>

`TreeSet<Integer>` with `floor(t)` (or `TreeMap.floorKey(t)`) — $O(\log n)$ per call, and `null` if there is none. A `HashSet` cannot answer "nearest".

</details>

<details>
<summary><strong>Quick check.</strong> Find the k largest of n numbers. Min-heap or max-heap, and what does it cost?</summary>

A **min**-heap of size k: `offer` each number, `poll` when the size passes k. The head is the k-th largest. $O(n \log k)$ time, $O(k)$ space.

</details>

<details>
<summary><strong>Quick check.</strong> BFS on a grid. Which two structures?</summary>

`ArrayDeque<int[]>` as the queue (`offer(new int[]{r, c})`, `poll()`), and a `boolean[][] seen` for visited. Not a `HashSet<int[]>` — arrays never match as keys.

</details>

<details>
<summary><strong>Quick check.</strong> <code>Map&lt;Character, Integer&gt;</code> or <code>int[26]</code> to count the letters of a lowercase word?</summary>

`int[26]` with `freq[ch - 'a']++` — no boxing, no hashing, and `Arrays.equals(f1, f2)` compares two words' counts (Valid Anagram).

</details>

---

## Key Takeaways

| § | Structure | Remember |
|---|---|---|
| 38.2 | `int[]`, `int[][]` | `new int[n]` is zeros, `Integer[]` is nulls; `deepToString` for 2-D |
| 38.3 | `String`, `StringBuilder` | immutable — build with `StringBuilder`; compare with `equals` |
| 38.4 | `ArrayList` | `remove(int)` is by index; copy `path` before adding it |
| 38.5 | `HashMap`, `HashSet` | `getOrDefault`, `merge`, `computeIfAbsent`; keys need `equals` + `hashCode` |
| 38.6 | `ArrayDeque` | one class for stack and queue; never `Stack` |
| 38.7 | `PriorityQueue` | min-heap by default; printing it is not sorted |
| 38.8 | `TreeMap`, `TreeSet` | `floorKey` / `ceilingKey` in $O(\log n)$; may return `null` |
| 38.9 | your own nodes, graphs | create every inner list; add undirected edges both ways |
| 38.10 | comparators | `Integer.compare`, never `a - b` |
| 38.11 | numbers | `long` for big sums; `lo + (hi - lo) / 2`; `equals` on `Integer` |

---

## Review Questions — Test Your Understanding

**1.** You write `int[] counts = new int[26];` then `counts[c - 'a']++` for each character. Why does this work, and what breaks it?

<details>
<summary>Answer</summary>

`char` promotes to `int`, so `c - 'a'` maps `'a'`..`'z'` to 0..25 — exactly the array's indexes. It breaks on anything else: `'A' - 'a'` is −32 and `' ' - 'a'` is −65, so they throw `ArrayIndexOutOfBoundsException`. Lower-case first, filter, or use `new int[128]` indexed by `c` itself (§38.3).
</details>

**2.** Why does `Arrays.sort` sometimes throw `IllegalArgumentException: Comparison method violates its general contract!` — and why is *not* throwing worse?

<details>
<summary>Answer</summary>

TimSort expects a consistent comparator (antisymmetric, transitive). When it notices a broken one, it throws rather than corrupt the data. But the check is opportunistic: small arrays (under 32 elements) use binary insertion sort, which never checks, so a broken comparator **silently returns a wrong order**. A wrong answer that looks fine is worse than an exception (§38.10).
</details>

**3.** You return `list.subList(0, k)`. Later the caller does `list.add(...)`, and the next read of the sub-list throws `ConcurrentModificationException`. Why?

<details>
<summary>Answer</summary>

`subList` is a **view** of the parent list, not a copy. A structural change to the parent (`add`, `remove`) invalidates the view. To hand out an independent list, copy it: `new ArrayList<>(list.subList(0, k))` (§38.4).
</details>

**4.** `List<Integer>[] adj = new ArrayList<Integer>[n];` does not compile. Why, and what do you write instead?

<details>
<summary>Answer</summary>

Java cannot create arrays of a generic type ("generic array creation"): arrays check their element type at runtime, but generic types are erased. Write `List<List<Integer>> adj = new ArrayList<>();` and add `n` empty lists — or `List<Integer>[] adj = new ArrayList[n];` (an unchecked warning) and fill every slot. Either way, create each inner list before you use it (§38.9).
</details>

**5.** A `TreeMap` holds keys 10, 20, 30, 40. What do `floorKey(25)`, `ceilingKey(25)` and `floorKey(5)` return?

<details>
<summary>Answer</summary>

`20`, `30` and `null`. `floor` is the largest key ≤ the target, `ceiling` the smallest key ≥ it — and when none exists you get `null`, so `int x = map.floorKey(5);` throws `NullPointerException`. Keep the result as `Integer` and check it (§38.8).
</details>

**6.** You count words in a `HashMap<String, Integer>` and want to delete every word seen fewer than 2 times. A for-each over `keySet()` that calls `map.remove(k)` throws `ConcurrentModificationException`. Fix it.

<details>
<summary>Answer</summary>

`map.values().removeIf(c -> c < 2);` — one pass, no iterator bookkeeping. Or use an explicit `Iterator` over `entrySet()` and call `it.remove()`. `map.remove(k)` inside the loop is a structural change behind the iterator's back; `e.setValue(...)` would have been fine, because it adds or removes nothing (§38.5).
</details>

**7.** `Arrays.binarySearch(new int[]{1, 2, 5, 7, 9}, 6)` returns what — and how do you get the insertion point?

<details>
<summary>Answer</summary>

**−4.** 6 is missing and belongs at index 3, and a miss returns `-(insertion point) - 1` = −3 − 1 = −4. Recover it with `-r - 1` = 3. The array must be sorted, and with duplicates you get *some* matching index, not the first (§38.2).
</details>

**8.** With `a = {2, 4, 6, 8}`, build the prefix-sum array and get `a[1] + a[2]`. Why should `pre` usually be a `long[]`?

<details>
<summary>Answer</summary>

`pre = [0, 2, 6, 12, 20]` (`n + 1` slots, `pre[i + 1] = pre[i] + a[i]`), so `a[1] + a[2] = pre[3] - pre[1] = 12 - 2 = 10`. Use `long[]` because sums grow with `n`: three values of 1,000,000,000 already wrap an `int` to −1,294,967,296 — no exception, just a wrong answer (§38.2).
</details>

**9.** In a backtracking solution you write `result.add(path)`. At the end every entry in `result` is empty. Why?

<details>
<summary>Answer</summary>

You added the **same list object** each time, and later `path.remove(...)` calls emptied it — so every entry points at one empty list. Add a snapshot: `result.add(new ArrayList<>(path));` (§38.4).
</details>

---

**Next:** [Ch 38b — Modern Java: Language, Concurrency & Ecosystem](#content/38b_java_modern) for records, sealed types, pattern matching and virtual threads — or go straight to [Ch 31 — DSA & ML Coding (Java)](#content/31_dsa_foundations) and start solving.
