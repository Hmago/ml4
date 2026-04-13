# DSA & ML Coding — Complete Google Interview Guide (Java)

> "Google LOVES graph and DP problems. Master these patterns and you'll
> recognize 80% of Google's coding questions within 30 seconds."

**What this document covers:**
All 10 DSA topics Google tests, ordered by frequency. Every topic has: visual explanation, core patterns, Java code, complexity analysis, and a curated problem list. Plus 10 ML-specific coding exercises (implement from scratch). Target: 160 problems over 12 weeks.

---

## Table of Contents

| Part | Topic | Problems | Google Frequency |
|------|-------|---------|-----------------|
| 1 | Arrays & Hashmaps | 20 | ★★★☆☆ Warm-up |
| 2 | Graphs (BFS, DFS, Dijkstra) | 25 | ★★★★★ Google favorite |
| 3 | Dynamic Programming | 25 | ★★★★★ Google favorite |
| 4 | Trees & Binary Search Trees | 20 | ★★★★☆ Very common |
| 5 | Sliding Window / Two Pointers | 15 | ★★★☆☆ Common |
| 6 | Binary Search | 15 | ★★★☆☆ Common |
| 7 | Heaps / Priority Queues | 10 | ★★★☆☆ Common |
| 8 | Tries | 10 | ★★☆☆☆ Occasional |
| 9 | Stack / Queue / Monotonic Stack | 10 | ★★☆☆☆ Occasional |
| 10 | String Algorithms | 10 | ★★☆☆☆ Occasional |
| 11 | ML-Specific Coding (from scratch) | 10 | Google ML round |
| 12 | 12-Week Study Plan | 160 total | 2 per day |

---

# PART 1: ARRAYS & HASHMAPS (Warm-up — 20 problems) ★★★

---

## 1.1 Core Patterns

```
  PATTERN 1: HASHMAP FOR O(1) LOOKUP
  ────────────────────────────────────
  "Have I seen this value before?"   → HashMap
  "How many times does X appear?"    → HashMap<value, count>
  "Find pair that sums to target"    → HashMap<value, index>

  PATTERN 2: PREFIX SUM
  ────────────────────────────────────
  "Sum of subarray from i to j?"     → prefixSum[j+1] - prefixSum[i]
  Pre-compute running totals. Turn O(n) subarray sum into O(1).

  PATTERN 3: IN-PLACE ARRAY TRICKS
  ────────────────────────────────────
  "Modify array without extra space" → Use the array itself as a hashmap
  (mark index as negative, swap elements to correct positions)
```

## 1.2 Two Sum (The most famous interview question)

```
  Given: nums = [2, 7, 11, 15], target = 9
  Find two numbers that add up to target.
  Return their indices: [0, 1] (because 2 + 7 = 9)

  BRUTE FORCE: Check every pair → O(n²)
  HASHMAP:     For each number, check if (target - number) exists → O(n)

  Walk through:
  ─────────────
  i=0: num=2, need 9-2=7, map={} → 7 not in map → add {2:0}
  i=1: num=7, need 9-7=2, map={2:0} → 2 IS in map! → return [0, 1] ✓
```

```java
public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> map = new HashMap<>();  // value → index
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (map.containsKey(complement)) {
            return new int[]{map.get(complement), i};
        }
        map.put(nums[i], i);
    }
    return new int[]{};
}
// Time: O(n)  Space: O(n)
```

## 1.3 Prefix Sum — Subarray Sum Equals K

```
  Given: nums = [1, 2, 3], k = 3
  Count subarrays that sum to k.
  Answer: 2  ([1,2] and [3])

  PREFIX SUM IDEA:
  ─────────────────
  prefix[0] = 0
  prefix[1] = 1
  prefix[2] = 1+2 = 3
  prefix[3] = 1+2+3 = 6

  Sum from index i to j = prefix[j+1] - prefix[i]
  If prefix[j] - prefix[i] = k, then subarray [i..j-1] sums to k.
  So for each prefix[j], check if prefix[j] - k exists → use HashMap!
```

```java
public int subarraySum(int[] nums, int k) {
    Map<Integer, Integer> prefixCount = new HashMap<>();
    prefixCount.put(0, 1);  // empty prefix
    int sum = 0, count = 0;

    for (int num : nums) {
        sum += num;
        count += prefixCount.getOrDefault(sum - k, 0);
        prefixCount.merge(sum, 1, Integer::sum);
    }
    return count;
}
// Time: O(n)  Space: O(n)
```

## 1.4 Group Anagrams

```
  Input: ["eat","tea","tan","ate","nat","bat"]
  Output: [["eat","tea","ate"], ["tan","nat"], ["bat"]]

  KEY INSIGHT: Anagrams have the same sorted characters.
  sorted("eat") = "aet", sorted("tea") = "aet" → same group!
```

```java
public List<List<String>> groupAnagrams(String[] strs) {
    Map<String, List<String>> map = new HashMap<>();
    for (String s : strs) {
        char[] chars = s.toCharArray();
        Arrays.sort(chars);
        String key = new String(chars);
        map.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
    }
    return new ArrayList<>(map.values());
}
// Time: O(n * k log k) where k = max string length
```

## 1.5 Product of Array Except Self

```
  Input:  [1, 2, 3, 4]
  Output: [24, 12, 8, 6]   (product of all OTHER elements)
  Constraint: NO division allowed!

  TRICK: Two passes.
  Left pass:  leftProduct[i]  = product of everything LEFT of i
  Right pass: rightProduct[i] = product of everything RIGHT of i
  Answer[i] = leftProduct[i] × rightProduct[i]

  Index:       0    1    2    3
  Left pass:   1    1    2    6     (running product from left)
  Right pass:  24   12   4    1     (running product from right)
  Result:      24   12   8    6     ✓
```

```java
public int[] productExceptSelf(int[] nums) {
    int n = nums.length;
    int[] result = new int[n];

    // Left products
    result[0] = 1;
    for (int i = 1; i < n; i++) {
        result[i] = result[i - 1] * nums[i - 1];
    }

    // Right products (multiply in-place)
    int right = 1;
    for (int i = n - 1; i >= 0; i--) {
        result[i] *= right;
        right *= nums[i];
    }
    return result;
}
// Time: O(n)  Space: O(1) (output array doesn't count)
```

### Arrays & Hashmaps — Problem List (20 problems)

| # | Problem (LeetCode) | Difficulty | Pattern |
|---|---------------------|-----------|---------|
| 1 | Two Sum (1) | Easy | HashMap lookup |
| 2 | Contains Duplicate (217) | Easy | HashSet |
| 3 | Valid Anagram (242) | Easy | Char frequency |
| 4 | Group Anagrams (49) | Medium | HashMap grouping |
| 5 | Top K Frequent Elements (347) | Medium | HashMap + Heap |
| 6 | Product of Array Except Self (238) | Medium | Prefix/suffix |
| 7 | Longest Consecutive Sequence (128) | Medium | HashSet |
| 8 | Subarray Sum Equals K (560) | Medium | Prefix sum + HashMap |
| 9 | Two Sum II - Sorted (167) | Medium | Two pointers |
| 10 | 3Sum (15) | Medium | Sort + two pointers |
| 11 | Container With Most Water (11) | Medium | Two pointers |
| 12 | Majority Element (169) | Easy | Boyer-Moore |
| 13 | Move Zeroes (283) | Easy | Two pointers in-place |
| 14 | Rotate Array (189) | Medium | Reverse trick |
| 15 | Next Permutation (31) | Medium | Array manipulation |
| 16 | First Missing Positive (41) | Hard | In-place hash |
| 17 | Trapping Rain Water (42) | Hard | Two pointers |
| 18 | Merge Intervals (56) | Medium | Sort + merge |
| 19 | Insert Interval (57) | Medium | Binary search + merge |
| 20 | Maximum Subarray (53) | Medium | Kadane's algorithm |

---

# PART 2: GRAPHS — BFS, DFS, DIJKSTRA (★ Google Favorite — 25 problems) ★★★

---

## 2.1 Graph Fundamentals

```
  A GRAPH = nodes (vertices) connected by edges.

  ANALOGY: Think of a MAP.
  - Cities = nodes
  - Roads between cities = edges
  - One-way streets = directed edges
  - Road distance = edge weight

  THREE TYPES OF GRAPHS:
  ══════════════════════

  UNDIRECTED (roads go both ways):
    A ─── B
    │     │         A connects to B, B also connects to A.
    C ─── D         Like a two-way street.

  DIRECTED (one-way roads):
    A ──→ B
    ↑     ↓         A goes to B, but B does NOT go back to A.
    D ←── C         Like a one-way street.

  WEIGHTED (roads have distances):
    A ─5─ B
    │     │         The road from A to B costs 5.
    2     1         The road from A to C costs 2.
    │     │         The road from B to D costs 1.
    C ─3─ D         The road from C to D costs 3.
```

### Key Graph Terminology (Simple Explanations)

```
  VERTEX (NODE):  A dot on the graph. Like a city on a map.
  
  EDGE:           A line connecting two dots. Like a road.
  
  NEIGHBOR:       If A connects to B, then B is A's neighbor.
                  Like the city next door.
  
  DEGREE:         How many edges touch a node.
                  "How many roads go out of this city?"
                  If node A connects to B, C, D → degree(A) = 3
  
  PATH:           A sequence of nodes connected by edges.
                  A → B → D is a path from A to D.
  
  CYCLE:          A path that starts and ends at the SAME node.
                  A → B → D → A is a cycle.
                  Like driving in a circle.
  
  CONNECTED:      You can reach any node from any other node.
                  "Can I drive from any city to any other city?"
  
  DAG:            Directed Acyclic Graph = directed + NO cycles.
                  Like a prerequisite chain (you can't have circular prerequisites).

  IMPORTANT FORMULAS:
  ───────────────────
  Tree:             exactly V-1 edges (V = vertices), no cycles, connected
  Undirected graph: max edges = V × (V-1) / 2
  Directed graph:   max edges = V × (V-1)
  Sum of all degrees = 2 × number of edges (undirected)
```

### Graph Representation — How to Store a Graph in Code

```
  ADJACENCY LIST (use this 95% of the time in interviews):
  ─────────────────────────────────────────────────────────

  Instead of storing a picture, store a LIST of neighbors for each node.

  Graph:
    0 ─── 1
    │   ╱ │
    │  ╱  │
    2 ─── 3

  Adjacency List:
    0: [1, 2]         "Node 0's neighbors are 1 and 2"
    1: [0, 2, 3]      "Node 1's neighbors are 0, 2, and 3"
    2: [0, 1, 3]      "Node 2's neighbors are 0, 1, and 3"
    3: [1, 2]          "Node 3's neighbors are 1 and 2"

  WHY adjacency list?
  - Space: O(V + E) — only stores edges that exist
  - Find all neighbors: O(degree) — fast!
  - Good for sparse graphs (most interview graphs)

  ADJACENCY MATRIX (use when graph is dense or you need O(1) edge check):
  ─────────────────────────────────────────────────────────

       0  1  2  3
    0 [0  1  1  0]      1 = connected, 0 = not connected
    1 [1  0  1  1]      matrix[0][1] = 1 → edge from 0 to 1
    2 [1  1  0  1]      matrix[0][3] = 0 → no edge from 0 to 3
    3 [0  1  1  0]

  Space: O(V²) — wastes space for sparse graphs
  Check if edge exists: O(1) — advantage!
```

```java
// ── Adjacency List in Java (MOST COMMON for interviews) ──

// OPTION 1: HashMap (when node IDs are arbitrary)
Map<Integer, List<Integer>> graph = new HashMap<>();

void addEdge(int u, int v) {  // undirected
    graph.computeIfAbsent(u, k -> new ArrayList<>()).add(v);
    graph.computeIfAbsent(v, k -> new ArrayList<>()).add(u);
}

// OPTION 2: Array of Lists (when nodes are 0 to n-1 — slightly faster)
int n = 5;
List<List<Integer>> adj = new ArrayList<>();
for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
adj.get(0).add(1);  // edge from 0 to 1
adj.get(1).add(0);  // edge from 1 to 0 (undirected → add both ways)

// WEIGHTED graph (store neighbor + weight)
Map<Integer, List<int[]>> wGraph = new HashMap<>();
wGraph.computeIfAbsent(0, k -> new ArrayList<>()).add(new int[]{1, 5});  // 0→1, weight 5

// GRID as implicit graph (no explicit adjacency list needed!)
// grid[i][j]'s neighbors: up, down, left, right
int[][] dirs = {{0,1}, {0,-1}, {1,0}, {-1,0}};
// To visit all neighbors of cell (r, c):
for (int[] d : dirs) {
    int nr = r + d[0], nc = c + d[1];
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        // (nr, nc) is a valid neighbor
    }
}
```

---

## 2.2 BFS (Breadth-First Search) — Complete Algorithm ★★★

### What Is BFS?

```
  BFS explores the graph LEVEL BY LEVEL.
  Like dropping a stone in water — ripples spread outward.

  EVERYTHING at distance 1 is visited before ANYTHING at distance 2.
  This is why BFS finds the SHORTEST PATH in unweighted graphs.

  DATA STRUCTURE: Queue (FIFO — First In, First Out)
  Think of it as a LINE at a store. First person in line gets served first.
```

### Step-by-Step BFS Walkthrough

```
  Graph:
    0 ─── 1 ─── 3
    │     │
    2 ─── 4

  START at node 0. Find shortest path to every node.

  ┌────────────────────────────────────────────────────────────────────────┐
  │ STEP │ ACTION              │ QUEUE (front→back) │ VISITED     │ DIST │
  ├──────┼─────────────────────┼────────────────────┼─────────────┼──────┤
  │  0   │ Start: add 0        │ [0]                │ {0}         │  0   │
  │      │                     │                    │             │      │
  │  1   │ Pop 0               │ []                 │ {0}         │      │
  │      │ 0's neighbors: 1,2  │                    │             │      │
  │      │ 1 not visited → add │ [1]                │ {0,1}       │      │
  │      │ 2 not visited → add │ [1, 2]             │ {0,1,2}     │      │
  │      │ Level 0 done.       │                    │             │  0   │
  │      │                     │                    │             │      │
  │  2   │ === Level 1 ===     │                    │             │      │
  │      │ Queue has 2 items   │                    │             │      │
  │      │ Pop 1               │ [2]                │             │      │
  │      │ 1's neighbors: 0,2,3,4│                  │             │      │
  │      │ 0 visited → skip    │                    │             │      │
  │      │ 2 visited → skip    │                    │             │      │
  │      │ 3 not visited → add │ [2, 3]             │ {0,1,2,3}   │      │
  │      │ 4 not visited → add │ [2, 3, 4]          │ {0,1,2,3,4} │      │
  │      │ Pop 2               │ [3, 4]             │             │      │
  │      │ 2's neighbors: 0,4  │                    │             │      │
  │      │ 0 visited → skip    │                    │             │      │
  │      │ 4 visited → skip    │                    │             │      │
  │      │ Level 1 done.       │                    │             │  1   │
  │      │                     │                    │             │      │
  │  3   │ === Level 2 ===     │                    │             │      │
  │      │ Pop 3, Pop 4        │ []                 │             │      │
  │      │ No new neighbors    │                    │             │      │
  │      │ Level 2 done.       │                    │             │  2   │
  │      │                     │                    │             │      │
  │  4   │ Queue empty → DONE! │ []                 │ {0,1,2,3,4} │      │
  └──────┴─────────────────────┴────────────────────┴─────────────┴──────┘

  RESULT:
  Shortest distance from 0 to 0 = 0  (itself)
  Shortest distance from 0 to 1 = 1  (found at level 1)
  Shortest distance from 0 to 2 = 1  (found at level 1)
  Shortest distance from 0 to 3 = 2  (found at level 2)
  Shortest distance from 0 to 4 = 2  (found at level 2)

  WHY SHORTEST? Because BFS visits ALL nodes at distance 1 BEFORE
  any node at distance 2. The FIRST time you reach a node is always
  via the shortest path. Guaranteed.
```

### BFS Algorithm — Pseudocode

```
  BFS(graph, startNode):
  ══════════════════════
  1. Create a QUEUE and add startNode
  2. Mark startNode as VISITED
  3. WHILE queue is not empty:
       a. Pop the FRONT node from queue → call it "current"
       b. Process "current" (print it, check if it's the target, etc.)
       c. For each NEIGHBOR of "current":
            If neighbor is NOT visited:
              Mark neighbor as VISITED
              Add neighbor to the BACK of queue
  4. Done!

  TIME:  O(V + E) — visit each vertex once, check each edge once
  SPACE: O(V) — queue + visited set
```

### BFS in Java — Three Flavors

```java
// ═══════════════════════════════════════════════════
// FLAVOR 1: Basic BFS (visit all reachable nodes)
// ═══════════════════════════════════════════════════
public List<Integer> bfs(Map<Integer, List<Integer>> graph, int start) {
    List<Integer> order = new ArrayList<>();
    Set<Integer> visited = new HashSet<>();
    Queue<Integer> queue = new LinkedList<>();

    visited.add(start);
    queue.offer(start);

    while (!queue.isEmpty()) {
        int node = queue.poll();        // Take from front of queue
        order.add(node);                // Process this node

        for (int neighbor : graph.getOrDefault(node, List.of())) {
            if (visited.add(neighbor)) { // add() returns false if already present
                queue.offer(neighbor);   // Add to back of queue
            }
        }
    }
    return order;  // Nodes in BFS order
}

// ═══════════════════════════════════════════════════
// FLAVOR 2: BFS with LEVEL TRACKING (most useful!)
// "How far is each node from the start?"
// ═══════════════════════════════════════════════════
public int shortestPath(Map<Integer, List<Integer>> graph, int start, int end) {
    if (start == end) return 0;
    Set<Integer> visited = new HashSet<>();
    Queue<Integer> queue = new LinkedList<>();
    visited.add(start);
    queue.offer(start);
    int distance = 0;

    while (!queue.isEmpty()) {
        int levelSize = queue.size();   // ← KEY: how many nodes at this level
        distance++;

        for (int i = 0; i < levelSize; i++) {   // Process ALL nodes at this level
            int node = queue.poll();
            for (int neighbor : graph.getOrDefault(node, List.of())) {
                if (neighbor == end) return distance;  // Found target!
                if (visited.add(neighbor)) {
                    queue.offer(neighbor);
                }
            }
        }
        // After this loop, the queue contains ONLY the NEXT level's nodes
    }
    return -1;  // Target not reachable
}

// ═══════════════════════════════════════════════════
// FLAVOR 3: BFS on a 2D GRID (treat grid as a graph)
// Very common Google pattern!
// ═══════════════════════════════════════════════════
//
// Grid:  0 = open, 1 = wall
//   [0, 0, 0]
//   [1, 1, 0]     Find shortest path from (0,0) to (2,2)
//   [0, 0, 0]     Answer: 4 steps → right, right, down, down
//
public int shortestPathGrid(int[][] grid) {
    int R = grid.length, C = grid[0].length;
    if (grid[0][0] == 1 || grid[R-1][C-1] == 1) return -1;

    int[][] dirs = {{0,1}, {0,-1}, {1,0}, {-1,0}};  // right, left, down, up
    boolean[][] visited = new boolean[R][C];
    Queue<int[]> queue = new LinkedList<>();

    queue.offer(new int[]{0, 0});
    visited[0][0] = true;
    int dist = 0;

    while (!queue.isEmpty()) {
        int size = queue.size();
        for (int i = 0; i < size; i++) {
            int[] cell = queue.poll();
            if (cell[0] == R-1 && cell[1] == C-1) return dist;  // Reached end!

            for (int[] d : dirs) {
                int nr = cell[0] + d[0], nc = cell[1] + d[1];
                if (nr >= 0 && nr < R && nc >= 0 && nc < C
                    && !visited[nr][nc] && grid[nr][nc] == 0) {
                    visited[nr][nc] = true;
                    queue.offer(new int[]{nr, nc});
                }
            }
        }
        dist++;
    }
    return -1;  // No path
}
```

### Multi-Source BFS — Start from Multiple Nodes at Once

```
  PROBLEM: "Rotting Oranges" — Multiple rotten oranges spread simultaneously.

  Instead of starting BFS from ONE node, start from ALL rotten oranges at once.
  Add ALL sources to the queue BEFORE starting the loop.
  This is like dropping multiple stones in water at the same time.

  Grid at time 0:     Grid at time 1:      Grid at time 2:
  [2, 1, 1]           [2, 2, 1]            [2, 2, 2]
  [1, 1, 0]           [2, 1, 0]            [2, 2, 0]
  [0, 1, 1]           [0, 1, 1]            [0, 2, 2]

  2 = rotten, 1 = fresh, 0 = empty
  Answer: 4 minutes for all oranges to rot.
```

```java
public int orangesRotting(int[][] grid) {
    Queue<int[]> queue = new LinkedList<>();
    int fresh = 0;

    // Add ALL rotten oranges to queue (multi-source)
    for (int i = 0; i < grid.length; i++)
        for (int j = 0; j < grid[0].length; j++) {
            if (grid[i][j] == 2) queue.offer(new int[]{i, j});
            if (grid[i][j] == 1) fresh++;
        }

    if (fresh == 0) return 0;
    int[][] dirs = {{0,1},{0,-1},{1,0},{-1,0}};
    int minutes = 0;

    while (!queue.isEmpty() && fresh > 0) {
        int size = queue.size();
        minutes++;
        for (int i = 0; i < size; i++) {
            int[] cell = queue.poll();
            for (int[] d : dirs) {
                int nr = cell[0]+d[0], nc = cell[1]+d[1];
                if (nr>=0 && nr<grid.length && nc>=0 && nc<grid[0].length && grid[nr][nc]==1) {
                    grid[nr][nc] = 2;
                    fresh--;
                    queue.offer(new int[]{nr, nc});
                }
            }
        }
    }
    return fresh == 0 ? minutes : -1;
}
```

---

## 2.3 DFS (Depth-First Search) — Complete Algorithm ★★★

### What Is DFS?

```
  DFS explores as DEEP as possible before backtracking.
  Like exploring a maze: go straight until you hit a wall,
  then backtrack to the last intersection and try a different path.

  DATA STRUCTURE: Stack (LIFO — Last In, First Out), or just recursion
  (recursion uses the call stack automatically).
```

### Step-by-Step DFS Walkthrough

```
  Graph:
    0 ─── 1 ─── 3
    │     │
    2 ─── 4

  START at node 0. DFS traversal.

  ┌────────────────────────────────────────────────────────────────────────┐
  │ STEP │ ACTION                     │ STACK (top→bottom) │ VISITED      │
  ├──────┼────────────────────────────┼────────────────────┼──────────────┤
  │  1   │ Start: visit 0             │ [0]                │ {0}          │
  │  2   │ 0's neighbor 1 not visited │                    │              │
  │      │ → go DEEP into 1           │ [1, 0]             │ {0, 1}       │
  │  3   │ 1's neighbor 3 not visited │                    │              │
  │      │ → go DEEP into 3           │ [3, 1, 0]          │ {0, 1, 3}    │
  │  4   │ 3 has no unvisited neighbor│                    │              │
  │      │ → BACKTRACK to 1           │ [1, 0]             │              │
  │  5   │ 1's neighbor 4 not visited │                    │              │
  │      │ → go DEEP into 4           │ [4, 1, 0]          │ {0,1,3,4}    │
  │  6   │ 4's neighbor 2 not visited │                    │              │
  │      │ → go DEEP into 2           │ [2, 4, 1, 0]       │ {0,1,2,3,4}  │
  │  7   │ 2 has no unvisited neighbor│                    │              │
  │      │ → BACKTRACK all the way    │ []                 │              │
  │  8   │ Stack empty → DONE!        │ []                 │ {0,1,2,3,4}  │
  └──────┴────────────────────────────┴────────────────────┴──────────────┘

  DFS ORDER: 0 → 1 → 3 → 4 → 2

  NOTICE: DFS did NOT visit level by level. It went 0→1→3 (deep!),
  then backtracked, then 4→2. This is the key difference from BFS.

  BFS vs DFS COMPARISON:
  ┌──────────────┬──────────────────────────┬──────────────────────────┐
  │              │ BFS                      │ DFS                      │
  ├──────────────┼──────────────────────────┼──────────────────────────┤
  │ Data struct  │ Queue (FIFO)             │ Stack / Recursion (LIFO) │
  │ Explores     │ Level by level (wide)    │ Path by path (deep)      │
  │ Shortest path│ YES (unweighted)         │ NO                       │
  │ Memory       │ O(width of graph)        │ O(depth of graph)        │
  │ Good for     │ Shortest path, levels,   │ All paths, cycles,       │
  │              │ nearest, BFS on grid     │ connected components,    │
  │              │                          │ topological sort         │
  │ Time         │ O(V + E)                │ O(V + E)                 │
  └──────────────┴──────────────────────────┴──────────────────────────┘
```

### DFS Algorithm — Pseudocode

```
  DFS(graph, node, visited):
  ═════════════════════════
  1. Mark node as VISITED
  2. Process node (print it, count it, etc.)
  3. For each NEIGHBOR of node:
       If neighbor is NOT visited:
         DFS(graph, neighbor, visited)    ← RECURSE (go deeper!)
  4. Return (backtrack automatically when recursion returns)

  TIME:  O(V + E)
  SPACE: O(V) for visited set + O(H) for recursion stack (H = max depth)
```

### DFS in Java — Three Flavors

```java
// ═══════════════════════════════════════════════════
// FLAVOR 1: Recursive DFS (most natural, use this by default)
// ═══════════════════════════════════════════════════
public void dfs(Map<Integer, List<Integer>> graph, int node, Set<Integer> visited) {
    visited.add(node);
    System.out.print(node + " ");   // process node

    for (int neighbor : graph.getOrDefault(node, List.of())) {
        if (!visited.contains(neighbor)) {
            dfs(graph, neighbor, visited);   // go deeper!
        }
    }
    // When this returns, we've explored ALL descendants of this node
}
// Usage: dfs(graph, 0, new HashSet<>());

// ═══════════════════════════════════════════════════
// FLAVOR 2: Iterative DFS (using explicit stack)
// Use when recursion depth might overflow (very deep graphs)
// ═══════════════════════════════════════════════════
public List<Integer> dfsIterative(Map<Integer, List<Integer>> graph, int start) {
    List<Integer> order = new ArrayList<>();
    Set<Integer> visited = new HashSet<>();
    Deque<Integer> stack = new ArrayDeque<>();

    stack.push(start);

    while (!stack.isEmpty()) {
        int node = stack.pop();
        if (!visited.add(node)) continue;   // already visited → skip
        order.add(node);

        for (int neighbor : graph.getOrDefault(node, List.of())) {
            if (!visited.contains(neighbor)) {
                stack.push(neighbor);
            }
        }
    }
    return order;
}

// ═══════════════════════════════════════════════════
// FLAVOR 3: DFS on GRID — Number of Islands (Classic Google!)
// ═══════════════════════════════════════════════════
//
//  Grid:               There are 3 islands:
//  1 1 0 0 0           Island 1: top-left (4 cells)
//  1 1 0 0 0           Island 2: center (1 cell)
//  0 0 1 0 0           Island 3: bottom-right (2 cells)
//  0 0 0 1 1
//
//  ALGORITHM: Scan grid. When you find a '1', that's a new island.
//  Use DFS to "sink" the entire island (set all connected '1's to '0').
//  Count how many times you found a new island.
//
public int numIslands(char[][] grid) {
    int count = 0;
    for (int i = 0; i < grid.length; i++) {
        for (int j = 0; j < grid[0].length; j++) {
            if (grid[i][j] == '1') {
                count++;                    // Found a new island!
                sinkIsland(grid, i, j);     // Sink it with DFS
            }
        }
    }
    return count;
}

void sinkIsland(char[][] grid, int i, int j) {
    // Base cases: out of bounds or water
    if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length) return;
    if (grid[i][j] != '1') return;

    grid[i][j] = '0';             // Sink this cell (mark as visited)
    sinkIsland(grid, i + 1, j);   // Explore DOWN
    sinkIsland(grid, i - 1, j);   // Explore UP
    sinkIsland(grid, i, j + 1);   // Explore RIGHT
    sinkIsland(grid, i, j - 1);   // Explore LEFT
}
```

### Cycle Detection — Undirected vs Directed

```
  CYCLE in UNDIRECTED graph:
  ─────────────────────────
  During DFS, if you visit a neighbor that's already visited
  AND it's NOT your parent → CYCLE!

  0 ── 1           DFS from 0: visit 0, visit 1, visit 2,
  │    │           visit neighbor 0 → already visited AND not parent of 2 → CYCLE!
  └─── 2

  CYCLE in DIRECTED graph (3-color method):
  ──────────────────────────────────────────
  Color each node:
  WHITE (0) = haven't touched yet
  GRAY  (1) = currently being explored (in the current DFS path)
  BLACK (2) = completely finished exploring

  If you hit a GRAY node → it's in the CURRENT path → CYCLE!
  If you hit a BLACK node → it's done, no cycle through it.

  Example:
  A → B → C → A       DFS from A:
                       A goes GRAY.
                       Explore B → B goes GRAY.
                       Explore C → C goes GRAY.
                       C's neighbor is A → A is GRAY → CYCLE!
```

```java
// Cycle in DIRECTED graph (3 colors)
public boolean hasCycleDirected(int n, List<List<Integer>> adj) {
    int[] color = new int[n]; // 0=white, 1=gray, 2=black
    for (int i = 0; i < n; i++) {
        if (color[i] == 0 && dfsDetectCycle(adj, i, color)) return true;
    }
    return false;
}

boolean dfsDetectCycle(List<List<Integer>> adj, int u, int[] color) {
    color[u] = 1;  // GRAY — entering this node's DFS
    for (int v : adj.get(u)) {
        if (color[v] == 1) return true;   // Neighbor is GRAY → back edge → CYCLE!
        if (color[v] == 0 && dfsDetectCycle(adj, v, color)) return true;
    }
    color[u] = 2;  // BLACK — completely done with this node
    return false;
}
```

---

## 2.4 Topological Sort — Complete Algorithm ★★

### What Is Topological Sort?

```
  ORDER nodes so that for every edge A → B, A comes BEFORE B.

  ANALOGY: Getting dressed. You must put on underwear before pants,
  socks before shoes, shirt before jacket. Topological sort finds
  a VALID dressing order.

  ONLY works on DAGs (Directed Acyclic Graphs).
  If there's a cycle, no valid order exists.

  Example — Course prerequisites:
  Course 0 is a prereq for 1 and 2.
  Course 1 is a prereq for 3.
  Course 2 is a prereq for 3.

       0                Valid orders:
      ╱ ╲               [0, 1, 2, 3] ✓
     1   2              [0, 2, 1, 3] ✓
      ╲ ╱               [1, 0, 2, 3] ✗ (0 must come before 1)
       3

  IN-DEGREE: How many arrows point INTO a node.
  Node 0: in-degree = 0 (nothing points to it → can start here!)
  Node 1: in-degree = 1 (0 points to it)
  Node 2: in-degree = 1 (0 points to it)
  Node 3: in-degree = 2 (1 and 2 point to it)
```

### Topological Sort Step-by-Step (Kahn's Algorithm)

```
  ┌────────────────────────────────────────────────────────────────────────┐
  │ STEP │ ACTION                          │ QUEUE      │ IN-DEGREES     │
  ├──────┼─────────────────────────────────┼────────────┼────────────────┤
  │  0   │ Compute in-degrees:             │            │ 0:0, 1:1, 2:1,│
  │      │ Add nodes with in-degree=0      │ [0]        │ 3:2            │
  │      │                                 │            │                │
  │  1   │ Pop 0. Output: [0]              │ []         │                │
  │      │ 0→1: decrement 1's in-deg to 0  │ [1]        │ 0:-, 1:0, 2:1,│
  │      │ 0→2: decrement 2's in-deg to 0  │ [1, 2]     │ 3:2            │
  │      │                                 │            │                │
  │  2   │ Pop 1. Output: [0, 1]           │ [2]        │                │
  │      │ 1→3: decrement 3's in-deg to 1  │ [2]        │ 3:1            │
  │      │                                 │            │                │
  │  3   │ Pop 2. Output: [0, 1, 2]        │ []         │                │
  │      │ 2→3: decrement 3's in-deg to 0  │ [3]        │ 3:0            │
  │      │                                 │            │                │
  │  4   │ Pop 3. Output: [0, 1, 2, 3]     │ []         │                │
  │      │ Queue empty. All nodes processed.│            │                │
  │      │ VALID topological order! ✓       │            │                │
  └──────┴─────────────────────────────────┴────────────┴────────────────┘

  If we finish and some nodes are NOT in the output → there's a CYCLE.
  (Those nodes had in-degrees that never reached 0.)
```

```java
// Kahn's Algorithm — BFS-based topological sort
public int[] topologicalSort(int n, int[][] prerequisites) {
    // Build adjacency list and compute in-degrees
    List<List<Integer>> adj = new ArrayList<>();
    int[] inDeg = new int[n];
    for (int i = 0; i < n; i++) adj.add(new ArrayList<>());

    for (int[] pre : prerequisites) {
        adj.get(pre[1]).add(pre[0]);  // pre[1] → pre[0]
        inDeg[pre[0]]++;
    }

    // Start with all nodes that have NO prerequisites
    Queue<Integer> queue = new LinkedList<>();
    for (int i = 0; i < n; i++) {
        if (inDeg[i] == 0) queue.offer(i);
    }

    int[] order = new int[n];
    int idx = 0;

    while (!queue.isEmpty()) {
        int course = queue.poll();
        order[idx++] = course;

        for (int next : adj.get(course)) {
            inDeg[next]--;                          // One prereq satisfied
            if (inDeg[next] == 0) queue.offer(next); // All prereqs done!
        }
    }

    return idx == n ? order : new int[0]; // If not all processed → cycle
}
```

---

## 2.5 Dijkstra's Algorithm — Complete Walkthrough

### What Is Dijkstra's?

```
  Find the SHORTEST PATH from one node to ALL others in a WEIGHTED graph.
  Only works with NON-NEGATIVE weights.

  ANALOGY: You're planning a road trip. Roads have different distances.
  Dijkstra finds the shortest driving route from your city to every other city.

  KEY IDEA: Always process the CLOSEST unvisited node next.
  Use a MIN-HEAP (priority queue) to always grab the closest one.
```

### Step-by-Step Dijkstra Walkthrough

```
  Graph:
    A ──4── B
    │       │
    2       1
    │       │
    C ──3── D

  Find shortest path from A to all nodes.

  ┌────────────────────────────────────────────────────────────────────────┐
  │ STEP │ ACTION                       │ DISTANCES        │ MIN-HEAP     │
  ├──────┼──────────────────────────────┼──────────────────┼──────────────┤
  │  0   │ Initialize:                  │ A=0, B=∞, C=∞,  │ [(0,A)]      │
  │      │ Start node A = distance 0    │ D=∞              │              │
  │      │                              │                  │              │
  │  1   │ Pop (0, A) — cheapest        │                  │              │
  │      │ A→B: 0+4=4 < ∞ → update B=4 │ A=0, B=4, C=2,  │ [(2,C),      │
  │      │ A→C: 0+2=2 < ∞ → update C=2 │ D=∞              │  (4,B)]      │
  │      │                              │                  │              │
  │  2   │ Pop (2, C) — cheapest        │                  │              │
  │      │ C→A: 2+2=4 > 0 → skip       │ A=0, B=4, C=2,  │ [(4,B),      │
  │      │ C→D: 2+3=5 < ∞ → update D=5 │ D=5              │  (5,D)]      │
  │      │                              │                  │              │
  │  3   │ Pop (4, B) — cheapest        │                  │              │
  │      │ B→A: 4+4=8 > 0 → skip       │ A=0, B=4, C=2,  │ [(5,D)]      │
  │      │ B→D: 4+1=5 = 5 → no update  │ D=5              │              │
  │      │                              │                  │              │
  │  4   │ Pop (5, D)                   │                  │              │
  │      │ D→B: 5+1=6 > 4 → skip       │ A=0, B=4, C=2,  │ []           │
  │      │ D→C: 5+3=8 > 2 → skip       │ D=5              │              │
  │      │                              │                  │              │
  │  5   │ Heap empty → DONE!           │ FINAL:           │              │
  │      │                              │ A=0, B=4, C=2,  │              │
  │      │                              │ D=5              │              │
  └──────┴──────────────────────────────┴──────────────────┴──────────────┘

  SHORTEST PATHS FROM A:
  A → A = 0
  A → C = 2  (direct: A→C)
  A → B = 4  (direct: A→B)
  A → D = 5  (via C: A→C→D = 2+3)

  WHY IT WORKS: By always processing the closest unvisited node,
  when we process a node, we've already found its shortest distance.
  This is called the "greedy" property.

  WHY NO NEGATIVE WEIGHTS: If A→B costs 4, and there's a path
  A→C→B costing 2+(-5) = -3, Dijkstra might process B at distance 4
  and never discover the -3 path. Negative weights break the greedy property.
```

### Dijkstra in Java

```java
public int[] dijkstra(Map<Integer, List<int[]>> graph, int start, int n) {
    // dist[i] = shortest distance from start to node i
    int[] dist = new int[n];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[start] = 0;

    // Min-heap: {distance, node} — always process closest node first
    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);
    pq.offer(new int[]{0, start});

    while (!pq.isEmpty()) {
        int[] curr = pq.poll();
        int d = curr[0], u = curr[1];

        if (d > dist[u]) continue;   // Stale entry — we already found a shorter path

        // Try to improve distances to all neighbors
        for (int[] edge : graph.getOrDefault(u, List.of())) {
            int v = edge[0], weight = edge[1];
            int newDist = dist[u] + weight;

            if (newDist < dist[v]) {          // Found a shorter path!
                dist[v] = newDist;
                pq.offer(new int[]{newDist, v});
            }
        }
    }
    return dist;
}
// Time:  O((V + E) log V) — each node extracted once, each edge relaxed once
// Space: O(V) for dist array + O(E) for heap
```

### When to Use Which Shortest Path Algorithm

```
  ┌────────────────────────────┬─────────────────────────────────────────┐
  │ Situation                  │ Algorithm                                │
  ├────────────────────────────┼─────────────────────────────────────────┤
  │ Unweighted graph           │ BFS — O(V + E) — simplest and fastest  │
  │ Weighted, no negative      │ Dijkstra — O((V+E) log V) with heap    │
  │ Negative weights allowed   │ Bellman-Ford — O(V × E) — slower       │
  │ All-pairs shortest path    │ Floyd-Warshall — O(V³) — dense graphs  │
  │ Grid with 0/1 weights      │ 0-1 BFS with deque — O(V + E)         │
  └────────────────────────────┴─────────────────────────────────────────┘
```

---

## 2.6 Union-Find ★★

```java
class UnionFind {
    int[] parent, rank;
    int components;

    UnionFind(int n) {
        parent = new int[n]; rank = new int[n]; components = n;
        for (int i = 0; i < n; i++) parent[i] = i;
    }

    int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]); // path compression
        return parent[x];
    }

    boolean union(int x, int y) {
        int px = find(x), py = find(y);
        if (px == py) return false;
        if (rank[px] < rank[py]) parent[px] = py;
        else if (rank[px] > rank[py]) parent[py] = px;
        else { parent[py] = px; rank[px]++; }
        components--;
        return true;
    }
}
// Nearly O(1) per operation (amortized)
```

### Graph Problem List (25 problems)

| # | Problem (LeetCode) | Difficulty | Pattern |
|---|---------------------|-----------|---------|
| 1 | Number of Islands (200) | Medium | DFS/BFS grid |
| 2 | Clone Graph (133) | Medium | DFS + HashMap |
| 3 | Course Schedule (207) | Medium | Topo sort / cycle |
| 4 | Course Schedule II (210) | Medium | Topo sort order |
| 5 | Pacific Atlantic Water Flow (417) | Medium | Multi-source DFS |
| 6 | Number of Connected Components (323) | Medium | Union-Find |
| 7 | Graph Valid Tree (261) | Medium | UF + edge count |
| 8 | Rotting Oranges (994) | Medium | Multi-source BFS |
| 9 | Walls and Gates (286) | Medium | Multi-source BFS |
| 10 | Surrounded Regions (130) | Medium | Border DFS |
| 11 | Word Ladder (127) | Hard | BFS shortest |
| 12 | Network Delay Time (743) | Medium | Dijkstra |
| 13 | Cheapest Flights (787) | Medium | Modified BFS |
| 14 | Accounts Merge (721) | Medium | Union-Find |
| 15 | Alien Dictionary (269) | Hard | Topo from rules |
| 16 | Min Cost to Connect Points (1584) | Medium | Prim's / Kruskal's |
| 17 | Swim in Rising Water (778) | Hard | Binary search + BFS |
| 18 | Redundant Connection (684) | Medium | Union-Find cycle |
| 19 | Word Search (79) | Medium | DFS backtracking |
| 20 | Word Search II (212) | Hard | Trie + DFS |
| 21 | Shortest Path in Grid (1091) | Medium | BFS 8-directional |
| 22 | Is Graph Bipartite? (785) | Medium | BFS 2-coloring |
| 23 | Evaluate Division (399) | Medium | Weighted graph DFS |
| 24 | Reconstruct Itinerary (332) | Hard | Eulerian path |
| 25 | Critical Connections (1192) | Hard | Tarjan's bridges |

---

# PART 3: DYNAMIC PROGRAMMING (★ Google Favorite — 25 problems) ★★★

---

## 3.1 What Is DP?

```
  DP = solving a problem by breaking it into SMALLER SUBPROBLEMS,
  solving each subproblem ONCE, and storing the result.

  ANALOGY: Computing Fibonacci.
  fib(5) calls fib(4) and fib(3).
  fib(4) calls fib(3) and fib(2).
  WITHOUT DP: fib(3) is computed TWICE. fib(2) is computed 3 TIMES.
  WITH DP: Compute each once, store in array. O(n) instead of O(2^n).

  TWO APPROACHES:
  ─────────────────
  TOP-DOWN (Memoization):  Start from the big problem, recurse down, cache results.
  BOTTOM-UP (Tabulation):  Start from smallest subproblems, build up to the answer.

  THE DP RECIPE:
  ─────────────────
  1. Define the state: dp[i] = answer for subproblem of size i
  2. Find the recurrence: dp[i] = f(dp[i-1], dp[i-2], ...)
  3. Set base cases: dp[0] = ..., dp[1] = ...
  4. Determine the order: usually left to right, or smaller to larger
  5. Return dp[n] (or dp[n-1])
```

## 3.2 Climbing Stairs (Classic intro DP)

```
  You can climb 1 or 2 steps. How many ways to reach step n?

  n=1: 1 way  (1)
  n=2: 2 ways (1+1, 2)
  n=3: 3 ways (1+1+1, 1+2, 2+1)
  n=4: 5 ways (1+1+1+1, 1+1+2, 1+2+1, 2+1+1, 2+2)

  Pattern: dp[n] = dp[n-1] + dp[n-2]   ← It's Fibonacci!
  (You arrived at step n from step n-1 OR step n-2)
```

```java
public int climbStairs(int n) {
    if (n <= 2) return n;
    int prev2 = 1, prev1 = 2;
    for (int i = 3; i <= n; i++) {
        int curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}
// Time: O(n)  Space: O(1)
```

## 3.3 Coin Change (Unbounded Knapsack)

```
  Coins: [1, 3, 5], Amount: 7
  Find minimum coins to make the amount.

  dp[0] = 0  (0 coins to make 0)
  dp[1] = 1  (one 1-coin)
  dp[2] = 2  (two 1-coins)
  dp[3] = 1  (one 3-coin)
  dp[4] = 2  (one 3-coin + one 1-coin)
  dp[5] = 1  (one 5-coin)
  dp[6] = 2  (one 5-coin + one 1-coin)
  dp[7] = 3  (one 5-coin + one 1-coin + one 1-coin) or (one 3-coin + two 2...no)
       = 3? Let's check: 5+1+1=7 (3 coins), 3+3+1=7 (3 coins) → 3

  Recurrence: dp[amount] = min(dp[amount - coin] + 1) for each coin
```

```java
public int coinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    Arrays.fill(dp, amount + 1);  // "infinity"
    dp[0] = 0;

    for (int i = 1; i <= amount; i++) {
        for (int coin : coins) {
            if (coin <= i) {
                dp[i] = Math.min(dp[i], dp[i - coin] + 1);
            }
        }
    }
    return dp[amount] > amount ? -1 : dp[amount];
}
// Time: O(amount × coins)  Space: O(amount)
```

## 3.4 Longest Common Subsequence (2D DP)

```
  s1 = "abcde", s2 = "ace"
  LCS = "ace" (length 3)

  DP TABLE:
       ""  a  c  e
  ""  [ 0  0  0  0 ]
  a   [ 0  1  1  1 ]     If chars match: dp[i][j] = dp[i-1][j-1] + 1
  b   [ 0  1  1  1 ]     If not:         dp[i][j] = max(dp[i-1][j], dp[i][j-1])
  c   [ 0  1  2  2 ]
  d   [ 0  1  2  2 ]
  e   [ 0  1  2  3 ]  ← answer!
```

```java
public int longestCommonSubsequence(String text1, String text2) {
    int m = text1.length(), n = text2.length();
    int[][] dp = new int[m + 1][n + 1];

    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (text1.charAt(i-1) == text2.charAt(j-1)) {
                dp[i][j] = dp[i-1][j-1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
            }
        }
    }
    return dp[m][n];
}
// Time: O(m×n)  Space: O(m×n), can optimize to O(n)
```

## 3.5 DP Tips & Tricks (Most Important Section for Google!)

```
  ══════════════════════════════════════════════════════════════
  TIP 1: "HOW DO I KNOW IT'S DP?"
  ══════════════════════════════════════════════════════════════

  ASK YOURSELF:
  - "Can I break this into smaller versions of the SAME problem?"
  - "Does the answer for size N depend on answers for smaller sizes?"
  - "Would recursion have the same subproblem computed many times?"

  If YES to any → probably DP.

  KEYWORDS THAT SCREAM DP:
  "minimum cost", "maximum profit", "number of ways",
  "longest", "shortest", "can you reach", "partition into"


  ══════════════════════════════════════════════════════════════
  TIP 2: ALWAYS START WITH BRUTE FORCE RECURSION
  ══════════════════════════════════════════════════════════════

  Don't try to jump straight to the DP table.
  STEP 1: Write the brute force recursive solution
  STEP 2: Identify overlapping subproblems
  STEP 3: Add memoization (top-down) → it's now DP!
  STEP 4: Convert to bottom-up if needed for space optimization

  EXAMPLE — Fibonacci:
  Step 1: int fib(n) { return fib(n-1) + fib(n-2); }     ← O(2^n) brute force
  Step 2: fib(3) is called multiple times → overlapping!
  Step 3: Add memo: if (memo[n] != -1) return memo[n];    ← O(n) top-down
  Step 4: Use array: dp[i] = dp[i-1] + dp[i-2];          ← O(n) bottom-up
  Step 5: Only need last 2: prev1, prev2                   ← O(1) space


  ══════════════════════════════════════════════════════════════
  TIP 3: THE 5 DP CATEGORIES (memorize these!)
  ══════════════════════════════════════════════════════════════

  CATEGORY 1 — LINEAR DP (1D array):
  dp[i] depends on dp[i-1], dp[i-2], etc.
  ─────────────────────────────────────
  Examples: climbing stairs, house robber, decode ways,
            maximum subarray, coin change
  State: dp[i] = answer considering first i elements
  Trick: Often can reduce space from O(n) to O(1) by only
         keeping the last 1-2 values.

  CATEGORY 2 — TWO-STRING DP (2D table):
  dp[i][j] depends on dp[i-1][j-1], dp[i-1][j], dp[i][j-1]
  ─────────────────────────────────────
  Examples: LCS, edit distance, interleaving string, regex matching
  State: dp[i][j] = answer for first i chars of s1 and first j chars of s2
  Trick: Draw the table on paper. Fill it cell by cell.
         Often can reduce space from O(m×n) to O(n) using rolling array.

  CATEGORY 3 — KNAPSACK:
  "Choose items with a weight/cost limit"
  ─────────────────────────────────────
  0/1 Knapsack: each item used at most once (partition equal subset)
  Unbounded: each item used unlimited times (coin change)
  State: dp[i][w] = best value using first i items with weight limit w
  Trick: 0/1 → iterate weight RIGHT TO LEFT (to avoid using same item twice)
         Unbounded → iterate LEFT TO RIGHT

  CATEGORY 4 — GRID DP:
  "Navigate from top-left to bottom-right"
  ─────────────────────────────────────
  Examples: unique paths, minimum path sum, dungeon game
  State: dp[i][j] = answer at cell (i, j)
  Trick: dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])
         Can often modify grid in-place (no extra space)

  CATEGORY 5 — STATE MACHINE DP:
  "Multiple states with transitions"
  ─────────────────────────────────────
  Examples: buy/sell stock (hold, sold, cooldown), house robber II
  State: multiple dp arrays, one per state
  Trick: Draw the state machine. Each state = what situation am I in?
         Transitions = what choices do I have from this state?


  ══════════════════════════════════════════════════════════════
  TIP 4: COMMON MISTAKES IN DP
  ══════════════════════════════════════════════════════════════

  MISTAKE 1: Wrong base case
  dp[0] is CRITICAL. Think: "What's the answer for the empty case?"
  Coin change: dp[0] = 0 (zero coins for amount 0)
  Unique paths: dp[0][j] = 1 (only one way to reach first row)

  MISTAKE 2: Wrong loop order
  For 0/1 knapsack (each item once): iterate weight BACKWARD
  For unbounded (items reusable): iterate weight FORWARD
  Getting this wrong = silently wrong answer.

  MISTAKE 3: Off-by-one in 2D DP
  If dp is (m+1) × (n+1), then dp[i][j] corresponds to s1[i-1] and s2[j-1].
  Draw the table with empty string as row 0 and column 0.

  MISTAKE 4: Not considering "skip" option
  Many DP problems have TWO choices at each step:
  - TAKE this item (and pay its cost)
  - SKIP this item
  dp[i] = max(take, skip) or min(take, skip)

  ══════════════════════════════════════════════════════════════
  TIP 5: INTERVIEW TRICK — EXPLAIN YOUR APPROACH FIRST
  ══════════════════════════════════════════════════════════════

  Before writing code, say:
  "My state is dp[i] which represents ___."
  "My recurrence is dp[i] = ___."
  "My base case is dp[0] = ___."
  "Time: O(___). Space: O(___)."

  This shows the interviewer you understand DP, even if your
  code has a bug. They grade your APPROACH, not just your code.
```

## 3.6 DP Matrix Tricks — Visualizing 2D DP Tables

```
  The HARDEST part of DP is seeing the table in your head.
  Once you can DRAW the table, filling it is mechanical.
  Here are the matrix patterns you MUST know.
```

### MATRIX TRICK 1: Edit Distance (The Classic 2D DP)

```
  PROBLEM: Minimum operations to convert "horse" → "ros"
  Operations: insert, delete, replace (each costs 1)

  STEP 1: Draw the table. Rows = source chars. Columns = target chars.
  Add empty string "" as row 0 and column 0.

  STEP 2: Fill base cases.
  Converting "" to "ros" takes 3 inserts → [0, 1, 2, 3]
  Converting "horse" to "" takes 5 deletes → [0, 1, 2, 3, 4, 5]

  STEP 3: Fill cell by cell, left-to-right, top-to-bottom.

           ""    r     o     s
    ""  [  0     1     2     3  ]   ← base: insert 1, 2, 3 chars
    h   [  1     ?     ?     ?  ]
    o   [  2     ?     ?     ?  ]
    r   [  3     ?     ?     ?  ]
    s   [  4     ?     ?     ?  ]
    e   [  5     ?     ?     ?  ]
         ↑
         base: delete 1, 2, 3, 4, 5 chars

  FOR EACH CELL dp[i][j]:
  ─────────────────────────
  If chars MATCH (source[i-1] == target[j-1]):
      dp[i][j] = dp[i-1][j-1]          ← diagonal (no operation needed!)

  If chars DON'T match:
      dp[i][j] = 1 + min(
          dp[i-1][j-1],    ← diagonal = REPLACE source char with target char
          dp[i-1][j],      ← up       = DELETE from source
          dp[i][j-1]       ← left     = INSERT into source
      )

  LET'S FILL IT:

  Cell (1,1): h vs r → don't match
      min(dp[0][0]+1, dp[0][1]+1, dp[1][0]+1) = min(1, 2, 2) = 1 (replace h→r)

  Cell (1,2): h vs o → don't match
      min(dp[0][1]+1, dp[0][2]+1, dp[1][1]+1) = min(2, 3, 2) = 2

  Cell (2,1): o vs r → don't match
      min(dp[1][0]+1, dp[1][1]+1, dp[2][0]+1) = min(2, 2, 3) = 2

  Cell (2,2): o vs o → MATCH!
      dp[1][1] = 1 (diagonal, no cost)

  COMPLETED TABLE:
           ""    r     o     s
    ""  [  0     1     2     3  ]
    h   [  1     1     2     3  ]
    o   [  2     2     1     2  ]
    r   [  3     2     2     2  ]
    s   [  4     3     3     2  ]
    e   [  5     4     4     3  ]  ← ANSWER: 3 operations

  READ: dp[5][3] = 3. "horse" → "ros" takes 3 operations.

  THE THREE ARROWS YOU MUST REMEMBER:
  ┌─────────────────────────────────────────────┐
  │                                             │
  │   dp[i-1][j-1]  ──→  dp[i-1][j]           │
  │        │  ╲              │                  │
  │        │    ╲            │                  │
  │        ▼      ╲          ▼                  │
  │   dp[i][j-1]  ──→  dp[i][j]               │
  │                                             │
  │   ↖ diagonal = REPLACE (or free if match)  │
  │   ↑ up       = DELETE                       │
  │   ← left     = INSERT                       │
  └─────────────────────────────────────────────┘
```

### MATRIX TRICK 2: Longest Common Subsequence (LCS)

```
  PROBLEM: Longest subsequence common to both strings.
  s1 = "abcde", s2 = "ace" → LCS = "ace", length = 3

  TABLE RULE:
  If chars match:     dp[i][j] = dp[i-1][j-1] + 1   (diagonal + 1)
  If chars don't:     dp[i][j] = max(dp[i-1][j], dp[i][j-1])  (best of up or left)

  FILLED TABLE:
           ""    a     c     e
    ""  [  0     0     0     0  ]
    a   [  0     1     1     1  ]     a == a → diagonal + 1 = 1
    b   [  0     1     1     1  ]     b ≠ c → max(up, left) = 1
    c   [  0     1     2     2  ]     c == c → diagonal + 1 = 2
    d   [  0     1     2     2  ]     d ≠ e → max(up, left) = 2
    e   [  0     1     2     3  ]     e == e → diagonal + 1 = 3 ← ANSWER

  HOW TO READ THIS TABLE:
  ───────────────────────
  dp[i][j] = length of LCS using first i chars of s1 and first j chars of s2.
  dp[5][3] = 3 = length of LCS("abcde", "ace") ✓

  HOW TO RECOVER THE ACTUAL LCS (not just the length):
  ───────────────────────
  Start at dp[5][3] = 3. Trace backwards:
  - s1[4]='e' == s2[2]='e' → include 'e', move diagonal to dp[4][2]
  - s1[3]='d' ≠ s2[1]='c' → move to bigger of up/left → dp[3][2]
  - s1[2]='c' == s2[1]='c' → include 'c', move diagonal to dp[2][1]  
  - s1[1]='b' ≠ s2[0]='a' → move to bigger → dp[1][1]
  - s1[0]='a' == s2[0]='a' → include 'a', move diagonal to dp[0][0]
  Reverse: "ace" ✓
```

### MATRIX TRICK 3: Unique Paths (Grid DP)

```
  PROBLEM: Robot at top-left. Can only move RIGHT or DOWN.
  How many paths to bottom-right of a 3×4 grid?

  TABLE RULE: dp[i][j] = dp[i-1][j] + dp[i][j-1]
              (paths from above + paths from left)

  Base case: first row and first column all = 1
             (only one way to reach any cell in row 0 or column 0)

      col 0   col 1   col 2   col 3
  row 0 [  1       1       1       1  ]    ← only way: →→→
  row 1 [  1       2       3       4  ]
  row 2 [  1       3       6      10  ]    ← ANSWER: 10 paths

  Let's verify dp[2][3] = 10:
  dp[1][3] = 4 paths from above
  dp[2][2] = 6 paths from left
  4 + 6 = 10 ✓

  VISUAL — ALL 10 PATHS from (0,0) to (2,3):
  →→→↓↓  →→↓→↓  →→↓↓→  →↓→→↓  →↓→↓→
  →↓↓→→  ↓→→→↓  ↓→→↓→  ↓→↓→→  ↓↓→→→

  TRICK: With obstacles, just set dp[obstacle] = 0.
  Paths can't go through obstacles, so they contribute 0.
```

### MATRIX TRICK 4: 0/1 Knapsack

```
  PROBLEM: Items with weights and values. Bag capacity = W.
  Pick items to maximize value without exceeding capacity.

  Items: [{weight:1, value:6}, {weight:2, value:10}, {weight:3, value:12}]
  Capacity: 5

  TABLE: dp[i][w] = max value using first i items with capacity w

          cap 0   cap 1   cap 2   cap 3   cap 4   cap 5
  0 items [  0       0       0       0       0       0  ]
  item 1  [  0       6       6       6       6       6  ]   w=1,v=6
  item 2  [  0       6      10      16      16      16  ]   w=2,v=10
  item 3  [  0       6      10      16      18      22  ]   w=3,v=12
                                                    ↑
                                               ANSWER: 22

  FOR EACH CELL:
  dp[i][w] = max(
      dp[i-1][w],                          ← SKIP item i
      dp[i-1][w - weight[i]] + value[i]    ← TAKE item i (if it fits)
  )

  Cell (3, 5): item 3 has weight=3, value=12
      Skip: dp[2][5] = 16
      Take: dp[2][5-3] + 12 = dp[2][2] + 12 = 10 + 12 = 22
      max(16, 22) = 22 ✓

  WHICH ITEMS DID WE PICK? Trace back:
  dp[3][5]=22 ≠ dp[2][5]=16 → we TOOK item 3. Remaining capacity: 5-3=2.
  dp[2][2]=10 ≠ dp[1][2]=6  → we TOOK item 2. Remaining capacity: 2-2=0.
  dp[1][0]=0  = dp[0][0]=0  → we SKIPPED item 1.
  Answer: items 2 and 3. Value = 10 + 12 = 22. Weight = 2 + 3 = 5. ✓

  ══════════════════════════════════════════════════════════════
  CRITICAL TRICK: 1D SPACE OPTIMIZATION
  ══════════════════════════════════════════════════════════════

  0/1 Knapsack (each item ONCE): iterate weight RIGHT TO LEFT
  ──────────────────────────────────────────────────────────────
  int[] dp = new int[W + 1];
  for (int i = 0; i < n; i++) {
      for (int w = W; w >= weight[i]; w--) {     ← RIGHT TO LEFT!
          dp[w] = Math.max(dp[w], dp[w - weight[i]] + value[i]);
      }
  }

  WHY right-to-left? Because dp[w - weight[i]] should use the PREVIOUS
  row's value (before this item was considered). If we go left-to-right,
  we'd overwrite dp[w - weight[i]] and use the CURRENT row's value,
  which means we'd use the same item twice. Right-to-left prevents this.

  Unbounded Knapsack (items reusable): iterate LEFT TO RIGHT
  ──────────────────────────────────────────────────────────────
  for (int w = weight[i]; w <= W; w++) {          ← LEFT TO RIGHT!
      dp[w] = Math.max(dp[w], dp[w - weight[i]] + value[i]);
  }

  WHY left-to-right? Because we WANT to reuse items. Using the current
  row's value means we might pick the same item multiple times. That's
  exactly what unbounded knapsack allows.
```

### MATRIX TRICK 5: Palindrome DP

```
  PROBLEM: Longest Palindromic Subsequence
  s = "bbbab" → answer = 4 ("bbbb")

  TABLE: dp[i][j] = longest palindromic subsequence in s[i..j]

  RULE:
  If s[i] == s[j]:  dp[i][j] = dp[i+1][j-1] + 2   (both ends match, add 2)
  If s[i] != s[j]:  dp[i][j] = max(dp[i+1][j], dp[i][j-1])  (try without each end)

  Base case: dp[i][i] = 1 (single char is a palindrome of length 1)

  IMPORTANT: Fill DIAGONALLY (or by substring length), not row by row!
  Because dp[i][j] depends on dp[i+1][...] (a LOWER row).

      j→  0(b)  1(b)  2(b)  3(a)  4(b)
  i↓
  0(b) [  1     2     3     3     4  ]   ← dp[0][4] = 4 = ANSWER
  1(b) [  -     1     2     2     3  ]
  2(b) [  -     -     1     1     3  ]
  3(a) [  -     -     -     1     1  ]
  4(b) [  -     -     -     -     1  ]

  Fill order: diagonals from bottom-left to top-right.
  Or: for (len = 2; len <= n; len++) for (i = 0; i + len - 1 < n; i++) ...
```

### MATRIX TRICK 6: Reading DP Tables — Visual Summary

```
  ┌────────────────────────────────────────────────────────────────────┐
  │  WHERE DOES dp[i][j] COME FROM?                                    │
  │                                                                    │
  │  Edit Distance / LCS:          Grid Paths:                        │
  │  ┌────┬────┐                   ┌────┐                             │
  │  │i-1 │i-1 │                   │ ↓  │                             │
  │  │j-1 │ j  │                   │from│                             │
  │  ├────┼────┤                   │above                             │
  │  │ i  │ i  │                   ├────┼────┐                        │
  │  │j-1 │ j  │←answer            │ ← │ ■  │←answer                 │
  │  └────┴────┘                   │from│    │                        │
  │  Comes from: ↖ ↑ ←             │left│    │                        │
  │  (diagonal, up, left)          └────┴────┘                        │
  │                                 Comes from: ↑ ←                   │
  │                                 (up and left only)                │
  │                                                                    │
  │  Knapsack:                     Palindrome:                        │
  │  ┌────┬────┐                        ┌────┐                        │
  │  │prev│prev│                        │i+1 │                        │
  │  │ w  │w-wt│                        │j-1 │                        │
  │  ├────┼────┤                   ┌────┼────┼────┐                   │
  │  │curr│ ■  │←answer            │ i  │ ■  │ i  │                   │
  │  │ w  │    │                   │j-1 │    │ j  │←answer            │
  │  └────┴────┘                   └────┼────┼────┘                   │
  │  Comes from: ↑ (same w),           │i+1 │                        │
  │  ↑← (w minus item weight)          │ j  │                        │
  │                                     └────┘                        │
  │                                 Comes from: ↙ ↓ ←                 │
  │                                 (below-left, below, left)         │
  │                                 Fill: diagonally!                 │
  └────────────────────────────────────────────────────────────────────┘

  GOLDEN RULE: Before writing code, DRAW THE TABLE on paper.
  Fill 3-4 cells by hand. The pattern becomes obvious.
  Then the code writes itself.
```

---

## 3.7 House Robber (Can't rob adjacent houses)

```
  PROBLEM: Row of houses with money. Can't rob two adjacent houses.
  [2, 7, 9, 3, 1] → Best: rob houses 0, 2, 4 → 2+9+1 = 12

  AT EACH HOUSE, TWO CHOICES:
  - SKIP this house → take whatever was best up to previous house
  - ROB this house  → take this money + best up to 2 houses back (can't be adjacent)

  dp[i] = max(dp[i-1], dp[i-2] + nums[i])
              skip       rob

  Walk-through:
  nums: [2,  7,  9,  3,  1]
  dp[0] = 2            (rob house 0)
  dp[1] = max(2, 7) = 7  (skip 0, rob 1 — OR — rob 0, skip 1 → 7 wins)
  dp[2] = max(7, 2+9) = 11 (skip 2 → 7, rob 2 → 2+9=11 → 11 wins)
  dp[3] = max(11, 7+3) = 11 (skip 3 → 11, rob 3 → 7+3=10 → 11 wins)
  dp[4] = max(11, 11+1) = 12 (skip 4 → 11, rob 4 → 11+1=12 → 12 wins)
  Answer: 12 ✓
```

```java
// dp[i] = max money robbing houses 0..i
// dp[i] = max(dp[i-1], dp[i-2] + nums[i])
//         skip this    rob this
public int rob(int[] nums) {
    if (nums.length == 1) return nums[0];
    int prev2 = 0, prev1 = 0;
    for (int num : nums) {
        int curr = Math.max(prev1, prev2 + num);
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}
```

### DP Problem List (25 problems)

| # | Problem (LeetCode) | Difficulty | Pattern |
|---|---------------------|-----------|---------|
| 1 | Climbing Stairs (70) | Easy | 1D DP intro |
| 2 | House Robber (198) | Medium | 1D skip/take |
| 3 | House Robber II (213) | Medium | Circular variant |
| 4 | Coin Change (322) | Medium | Unbounded knapsack |
| 5 | Longest Increasing Subsequence (300) | Medium | 1D LIS |
| 6 | Longest Common Subsequence (1143) | Medium | 2D DP |
| 7 | Word Break (139) | Medium | 1D string DP |
| 8 | Unique Paths (62) | Medium | 2D grid DP |
| 9 | Unique Paths II (63) | Medium | Grid + obstacles |
| 10 | Minimum Path Sum (64) | Medium | Grid DP |
| 11 | Decode Ways (91) | Medium | 1D string |
| 12 | 0/1 Knapsack (not on LC) | Medium | Classic knapsack |
| 13 | Target Sum (494) | Medium | Subset sum variant |
| 14 | Partition Equal Subset Sum (416) | Medium | Subset sum |
| 15 | Edit Distance (72) | Medium | 2D string DP |
| 16 | Longest Palindromic Subsequence (516) | Medium | 2D palindrome |
| 17 | Longest Palindromic Substring (5) | Medium | Expand around center |
| 18 | Maximum Product Subarray (152) | Medium | Track min and max |
| 19 | Jump Game (55) | Medium | Greedy/DP |
| 20 | Jump Game II (45) | Medium | Greedy BFS |
| 21 | Interleaving String (97) | Medium | 2D DP |
| 22 | Regular Expression Matching (10) | Hard | 2D DP |
| 23 | Best Time to Buy/Sell Stock III (123) | Hard | State machine DP |
| 24 | Burst Balloons (312) | Hard | Interval DP |
| 25 | Longest Valid Parentheses (32) | Hard | Stack + DP |

---

# PART 4: TREES & BST (20 problems) ★★★

---

## 4.1 Tree Node + Traversals ★★★

```java
public class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int val) { this.val = val; }
}

// Inorder (Left, Root, Right) — gives SORTED order for BST
public void inorder(TreeNode root, List<Integer> res) {
    if (root == null) return;
    inorder(root.left, res);
    res.add(root.val);
    inorder(root.right, res);
}

// Level-order (BFS)
public List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> res = new ArrayList<>();
    if (root == null) return res;
    Queue<TreeNode> q = new LinkedList<>();
    q.offer(root);
    while (!q.isEmpty()) {
        int size = q.size();
        List<Integer> level = new ArrayList<>();
        for (int i = 0; i < size; i++) {
            TreeNode node = q.poll();
            level.add(node.val);
            if (node.left != null) q.offer(node.left);
            if (node.right != null) q.offer(node.right);
        }
        res.add(level);
    }
    return res;
}
```

## 4.2 Key Tree Problems

```java
// Max Depth
public int maxDepth(TreeNode root) {
    if (root == null) return 0;
    return Math.max(maxDepth(root.left), maxDepth(root.right)) + 1;
}

// Validate BST
public boolean isValidBST(TreeNode root) {
    return check(root, Long.MIN_VALUE, Long.MAX_VALUE);
}
boolean check(TreeNode n, long min, long max) {
    if (n == null) return true;
    if (n.val <= min || n.val >= max) return false;
    return check(n.left, min, n.val) && check(n.right, n.val, max);
}

// Lowest Common Ancestor
public TreeNode lca(TreeNode root, TreeNode p, TreeNode q) {
    if (root == null || root == p || root == q) return root;
    TreeNode left = lca(root.left, p, q);
    TreeNode right = lca(root.right, p, q);
    if (left != null && right != null) return root;
    return left != null ? left : right;
}
```

### Tree Problem List (20 problems)

| # | Problem (LeetCode) | Difficulty | Pattern |
|---|---------------------|-----------|---------|
| 1 | Max Depth (104) | Easy | Recursion |
| 2 | Invert Tree (226) | Easy | Recursion |
| 3 | Same Tree (100) | Easy | Compare |
| 4 | Symmetric Tree (101) | Easy | Mirror |
| 5 | Subtree of Another (572) | Easy | Compare subtrees |
| 6 | Level Order (102) | Medium | BFS |
| 7 | Right Side View (199) | Medium | BFS last-of-level |
| 8 | Validate BST (98) | Medium | Range check |
| 9 | Kth Smallest in BST (230) | Medium | Inorder |
| 10 | LCA (236) | Medium | DFS returns |
| 11 | Construct from Pre+In (105) | Medium | Divide & conquer |
| 12 | BST Iterator (173) | Medium | Controlled inorder |
| 13 | Count Good Nodes (1448) | Medium | DFS with max |
| 14 | Balanced Tree (110) | Easy | Height check |
| 15 | Diameter (543) | Easy | DFS path length |
| 16 | Max Path Sum (124) | Hard | DFS global max |
| 17 | Serialize/Deserialize (297) | Hard | Preorder + nulls |
| 18 | Flatten to Linked List (114) | Medium | Preorder in-place |
| 19 | Vertical Order (987) | Hard | BFS + sorting |
| 20 | All Nodes Distance K (863) | Medium | Graph conversion |

---

# PART 5: SLIDING WINDOW / TWO POINTERS (15 problems) ★★

---

## 5.1 The Pattern

```
  SLIDING WINDOW = maintain a "window" over the array that expands/shrinks.
  Used when you need: "longest/shortest subarray with some property."

  Fixed window:    [A B C] D E F → A [B C D] E F → A B [C D E] F
  Variable window: [A B C D] E F → A [B C D E] F → A B [C D E F]
                    expand right →→→   shrink left →→→

  TEMPLATE:
  left = 0
  for right in 0..n-1:
      add nums[right] to window
      while window is invalid:
          remove nums[left] from window
          left++
      update answer
```

```java
// Longest Substring Without Repeating Characters
public int lengthOfLongestSubstring(String s) {
    Set<Character> set = new HashSet<>();
    int left = 0, maxLen = 0;

    for (int right = 0; right < s.length(); right++) {
        while (set.contains(s.charAt(right))) {
            set.remove(s.charAt(left));
            left++;
        }
        set.add(s.charAt(right));
        maxLen = Math.max(maxLen, right - left + 1);
    }
    return maxLen;
}

// Minimum Window Substring
public String minWindow(String s, String t) {
    Map<Character, Integer> need = new HashMap<>(), have = new HashMap<>();
    for (char c : t.toCharArray()) need.merge(c, 1, Integer::sum);
    int required = need.size(), formed = 0;
    int left = 0, minLen = Integer.MAX_VALUE, minStart = 0;

    for (int right = 0; right < s.length(); right++) {
        char c = s.charAt(right);
        have.merge(c, 1, Integer::sum);
        if (need.containsKey(c) && have.get(c).intValue() == need.get(c).intValue()) formed++;

        while (formed == required) {
            if (right - left + 1 < minLen) { minLen = right - left + 1; minStart = left; }
            char lc = s.charAt(left);
            have.merge(lc, -1, Integer::sum);
            if (need.containsKey(lc) && have.get(lc) < need.get(lc)) formed--;
            left++;
        }
    }
    return minLen == Integer.MAX_VALUE ? "" : s.substring(minStart, minStart + minLen);
}
```

### Sliding Window Problem List (15)

| # | Problem | Difficulty | Pattern |
|---|---------|-----------|---------|
| 1 | Best Time to Buy Stock (121) | Easy | Max difference |
| 2 | Longest Substring No Repeat (3) | Medium | Variable window + set |
| 3 | Longest Repeating Char Replace (424) | Medium | Variable + count |
| 4 | Minimum Window Substring (76) | Hard | Variable + freq map |
| 5 | Permutation in String (567) | Medium | Fixed window + freq |
| 6 | Sliding Window Maximum (239) | Hard | Monotonic deque |
| 7 | Minimum Size Subarray Sum (209) | Medium | Variable window |
| 8 | Fruit Into Baskets (904) | Medium | At most 2 types |
| 9 | Max Consecutive Ones III (1004) | Medium | At most K flips |
| 10 | Subarrays with K Different (992) | Hard | Exactly K trick |
| 11 | 3Sum (15) | Medium | Sort + two pointers |
| 12 | Container With Most Water (11) | Medium | Two pointers |
| 13 | Trapping Rain Water (42) | Hard | Two pointers |
| 14 | Valid Palindrome (125) | Easy | Two pointers |
| 15 | Sort Colors (75) | Medium | Dutch flag |

---

# PART 6: BINARY SEARCH (15 problems) ★★

---

## 6.1 The Pattern

```
  Binary search = repeatedly cut the search space in half.
  Works on SORTED arrays or on any "monotonic" property.

  TEMPLATE (find exact value):
  left = 0, right = n - 1
  while left <= right:
      mid = left + (right - left) / 2   // avoid overflow!
      if arr[mid] == target: return mid
      if arr[mid] < target:  left = mid + 1
      else:                  right = mid - 1

  TEMPLATE (find boundary — "first true"):
  left = 0, right = n
  while left < right:
      mid = left + (right - left) / 2
      if condition(mid): right = mid
      else:              left = mid + 1
  return left  // first position where condition is true
```

```java
// Search in Rotated Sorted Array
public int search(int[] nums, int target) {
    int left = 0, right = nums.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) return mid;

        if (nums[left] <= nums[mid]) {  // left half is sorted
            if (nums[left] <= target && target < nums[mid]) right = mid - 1;
            else left = mid + 1;
        } else {  // right half is sorted
            if (nums[mid] < target && target <= nums[right]) left = mid + 1;
            else right = mid - 1;
        }
    }
    return -1;
}

// Koko Eating Bananas (binary search on answer)
public int minEatingSpeed(int[] piles, int h) {
    int left = 1, right = Arrays.stream(piles).max().getAsInt();
    while (left < right) {
        int mid = left + (right - left) / 2;
        int hours = 0;
        for (int p : piles) hours += (p + mid - 1) / mid;  // ceil division
        if (hours <= h) right = mid;
        else left = mid + 1;
    }
    return left;
}
```

### Binary Search Problem List (15)

| # | Problem | Difficulty | Pattern |
|---|---------|-----------|---------|
| 1 | Binary Search (704) | Easy | Basic |
| 2 | Search Insert Position (35) | Easy | Lower bound |
| 3 | Search Rotated Array (33) | Medium | Modified BS |
| 4 | Find Min in Rotated (153) | Medium | Pivot finding |
| 5 | Search 2D Matrix (74) | Medium | Flatten + BS |
| 6 | Koko Eating Bananas (875) | Medium | BS on answer |
| 7 | Find Peak Element (162) | Medium | BS on property |
| 8 | Median of Two Sorted (4) | Hard | BS partition |
| 9 | Time Based Key-Value (981) | Medium | BS on timestamp |
| 10 | Capacity to Ship (1011) | Medium | BS on answer |
| 11 | Split Array Largest Sum (410) | Hard | BS on answer |
| 12 | First Bad Version (278) | Easy | BS boundary |
| 13 | Sqrt(x) (69) | Easy | BS on answer |
| 14 | Find First and Last (34) | Medium | Two BS calls |
| 15 | Search Rotated II (81) | Medium | With duplicates |

---

# PART 7: HEAPS / PRIORITY QUEUES (10 problems) ★★

---

```java
// Min-heap (default in Java)
PriorityQueue<Integer> minHeap = new PriorityQueue<>();

// Max-heap
PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Collections.reverseOrder());

// Kth Largest Element
public int findKthLargest(int[] nums, int k) {
    PriorityQueue<Integer> minHeap = new PriorityQueue<>();
    for (int num : nums) {
        minHeap.offer(num);
        if (minHeap.size() > k) minHeap.poll();
    }
    return minHeap.peek();
}
// Time: O(n log k)

// Merge K Sorted Lists
public ListNode mergeKLists(ListNode[] lists) {
    PriorityQueue<ListNode> pq = new PriorityQueue<>((a,b) -> a.val - b.val);
    for (ListNode l : lists) if (l != null) pq.offer(l);
    ListNode dummy = new ListNode(0), curr = dummy;
    while (!pq.isEmpty()) {
        ListNode node = pq.poll();
        curr.next = node;
        curr = curr.next;
        if (node.next != null) pq.offer(node.next);
    }
    return dummy.next;
}
```

### Heap Problem List (10)

| # | Problem | Difficulty | Pattern |
|---|---------|-----------|---------|
| 1 | Kth Largest Element (215) | Medium | Min-heap size k |
| 2 | Top K Frequent Elements (347) | Medium | Heap or bucket sort |
| 3 | Merge K Sorted Lists (23) | Hard | Min-heap merge |
| 4 | Find Median from Stream (295) | Hard | Two heaps |
| 5 | Task Scheduler (621) | Medium | Max-heap + cooldown |
| 6 | Reorganize String (767) | Medium | Max-heap |
| 7 | K Closest Points (973) | Medium | Max-heap size k |
| 8 | Ugly Number II (264) | Medium | Min-heap generate |
| 9 | Furthest Building (1642) | Medium | Min-heap greedy |
| 10 | Smallest Range (632) | Hard | Min-heap + pointers |

---

# PART 8: TRIES (10 problems) ★★

---

```
  A TRIE (prefix tree) stores strings character by character.
  Each node = one character. Path from root = a prefix.

  Words: "app", "apple", "apt", "bat"

          (root)
         /     \
        a       b
       / \       \
      p   (end)   a
     / \           \
    p   t           t
    |               (end)
    l
    |
    e
   (end)
```

```java
class TrieNode {
    TrieNode[] children = new TrieNode[26];
    boolean isEnd = false;
}

class Trie {
    TrieNode root = new TrieNode();

    void insert(String word) {
        TrieNode node = root;
        for (char c : word.toCharArray()) {
            int i = c - 'a';
            if (node.children[i] == null) node.children[i] = new TrieNode();
            node = node.children[i];
        }
        node.isEnd = true;
    }

    boolean search(String word) {
        TrieNode node = findNode(word);
        return node != null && node.isEnd;
    }

    boolean startsWith(String prefix) {
        return findNode(prefix) != null;
    }

    private TrieNode findNode(String s) {
        TrieNode node = root;
        for (char c : s.toCharArray()) {
            int i = c - 'a';
            if (node.children[i] == null) return null;
            node = node.children[i];
        }
        return node;
    }
}
```

---

# PART 9: STACK / QUEUE / MONOTONIC STACK (10 problems)

---

```java
// Valid Parentheses
public boolean isValid(String s) {
    Deque<Character> stack = new ArrayDeque<>();
    for (char c : s.toCharArray()) {
        if (c == '(') stack.push(')');
        else if (c == '{') stack.push('}');
        else if (c == '[') stack.push(']');
        else if (stack.isEmpty() || stack.pop() != c) return false;
    }
    return stack.isEmpty();
}

// Daily Temperatures (Monotonic Stack)
// "How many days until a warmer day?"
public int[] dailyTemperatures(int[] temps) {
    int n = temps.length;
    int[] res = new int[n];
    Deque<Integer> stack = new ArrayDeque<>(); // indices of decreasing temps

    for (int i = 0; i < n; i++) {
        while (!stack.isEmpty() && temps[i] > temps[stack.peek()]) {
            int prev = stack.pop();
            res[prev] = i - prev;
        }
        stack.push(i);
    }
    return res;
}

// Largest Rectangle in Histogram (Monotonic Stack)
public int largestRectangleArea(int[] heights) {
    Deque<Integer> stack = new ArrayDeque<>();
    int max = 0;
    for (int i = 0; i <= heights.length; i++) {
        int h = (i == heights.length) ? 0 : heights[i];
        while (!stack.isEmpty() && h < heights[stack.peek()]) {
            int height = heights[stack.pop()];
            int width = stack.isEmpty() ? i : i - stack.peek() - 1;
            max = Math.max(max, height * width);
        }
        stack.push(i);
    }
    return max;
}
```

---

# PART 10: STRING ALGORITHMS (10 problems)

---

```java
// Longest Palindromic Substring (Expand Around Center)
public String longestPalindrome(String s) {
    int start = 0, maxLen = 0;
    for (int i = 0; i < s.length(); i++) {
        int len1 = expand(s, i, i);      // odd length
        int len2 = expand(s, i, i + 1);  // even length
        int len = Math.max(len1, len2);
        if (len > maxLen) {
            maxLen = len;
            start = i - (len - 1) / 2;
        }
    }
    return s.substring(start, start + maxLen);
}

int expand(String s, int l, int r) {
    while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) { l--; r++; }
    return r - l - 1;
}

// Group Anagrams (sort key)
// Already covered in Part 1
```

---

# PART 10B: ALGORITHM TIPS & TRICKS — ALL TOPICS

---

## Tips for Trees

```
  ══════════════════════════════════════════════════════════════
  TREE TIP 1: MOST TREE PROBLEMS USE RECURSION
  ══════════════════════════════════════════════════════════════

  90% of tree problems follow this template:
  ─────────────────────────────────────────
  int solve(TreeNode root) {
      if (root == null) return BASE_CASE;
      int left = solve(root.left);       // solve left subtree
      int right = solve(root.right);     // solve right subtree
      return COMBINE(left, right, root); // combine results
  }

  EXAMPLES:
  Max depth:     return max(left, right) + 1
  Is balanced:   return abs(left - right) <= 1 AND both balanced
  Diameter:      update global max with (left + right), return max(left, right) + 1
  Path sum:      return root.val + max(left, right)

  ══════════════════════════════════════════════════════════════
  TREE TIP 2: BST = INORDER IS SORTED
  ══════════════════════════════════════════════════════════════

  If you need sorted order from a BST → do inorder traversal.
  Kth smallest in BST → inorder, stop at kth element.
  Validate BST → inorder must be strictly increasing.
  Convert BST to sorted linked list → inorder.

  ══════════════════════════════════════════════════════════════
  TREE TIP 3: WHEN TO USE BFS vs DFS ON TREES
  ══════════════════════════════════════════════════════════════

  Use BFS (level-order) when:
  - You need to process level by level
  - Right side view, left side view
  - Minimum depth (BFS finds it faster)
  - Level averages, zigzag order

  Use DFS when:
  - Anything involving paths (root-to-leaf, any path sum)
  - Anything requiring the whole subtree answer first
  - Validate BST, LCA, serialization

  ══════════════════════════════════════════════════════════════
  TREE TIP 4: "RETURN VALUE" vs "GLOBAL VARIABLE" TRICKS
  ══════════════════════════════════════════════════════════════

  Some problems need you to track a global best while computing
  something different per node.

  EXAMPLE: Diameter of Binary Tree
  - At each node: diameter THROUGH this node = leftHeight + rightHeight
  - But we return height (not diameter) to the parent
  - Track the max diameter in a global variable

  int maxDiameter = 0;
  int height(TreeNode root) {
      if (root == null) return 0;
      int left = height(root.left);
      int right = height(root.right);
      maxDiameter = Math.max(maxDiameter, left + right);  // global update
      return Math.max(left, right) + 1;                    // return height
  }
```

## Tips for Sliding Window

```
  ══════════════════════════════════════════════════════════════
  SLIDING WINDOW TIP 1: TWO TEMPLATES
  ══════════════════════════════════════════════════════════════

  TEMPLATE A — Find LONGEST valid window:
  ─────────────────────────────────────────
  int left = 0, best = 0;
  for (int right = 0; right < n; right++) {
      ADD nums[right] to window;
      while (window is INVALID) {
          REMOVE nums[left] from window;
          left++;
      }
      best = Math.max(best, right - left + 1);  // window is valid
  }

  TEMPLATE B — Find SHORTEST valid window:
  ─────────────────────────────────────────
  int left = 0, best = Integer.MAX_VALUE;
  for (int right = 0; right < n; right++) {
      ADD nums[right] to window;
      while (window is VALID) {                  // shrink while still valid!
          best = Math.min(best, right - left + 1);
          REMOVE nums[left] from window;
          left++;
      }
  }

  KEY DIFFERENCE: For longest → shrink when INVALID.
                  For shortest → shrink when VALID.

  ══════════════════════════════════════════════════════════════
  SLIDING WINDOW TIP 2: "AT MOST K" TRICK
  ══════════════════════════════════════════════════════════════

  "Subarrays with EXACTLY K distinct" is hard.
  But "at most K distinct" is easy with sliding window.

  TRICK: exactly(K) = atMost(K) - atMost(K-1)

  This converts a hard problem into two easy sliding window problems.

  ══════════════════════════════════════════════════════════════
  SLIDING WINDOW TIP 3: FIXED vs VARIABLE
  ══════════════════════════════════════════════════════════════

  FIXED WINDOW (size k): Both pointers move together.
  "Maximum sum of subarray of size k"
  → Add right element, remove left element. Slide.

  VARIABLE WINDOW: Right expands, left contracts.
  "Longest substring with at most k distinct characters"
  → Expand right until invalid, shrink left until valid.
```

## Tips for Binary Search

```
  ══════════════════════════════════════════════════════════════
  BINARY SEARCH TIP 1: THREE TEMPLATES
  ══════════════════════════════════════════════════════════════

  TEMPLATE 1 — Find EXACT value:
  while (left <= right) {          // note: <=
      mid = left + (right-left)/2;
      if (arr[mid] == target) return mid;
      if (arr[mid] < target) left = mid + 1;
      else right = mid - 1;
  }
  return -1;

  TEMPLATE 2 — Find FIRST position where condition is true:
  while (left < right) {           // note: <
      mid = left + (right-left)/2;
      if (condition(mid)) right = mid;    // mid could be the answer
      else left = mid + 1;                // mid is too small
  }
  return left;

  TEMPLATE 3 — Find LAST position where condition is true:
  while (left < right) {
      mid = left + (right-left+1)/2;      // note: +1 to round UP
      if (condition(mid)) left = mid;      // mid could be the answer
      else right = mid - 1;
  }
  return left;

  ══════════════════════════════════════════════════════════════
  BINARY SEARCH TIP 2: SEARCH ON ANSWER
  ══════════════════════════════════════════════════════════════

  Many problems don't look like binary search but ARE.

  "What's the MINIMUM speed to finish in H hours?"
  → Binary search on speed from 1 to max.
  → For each speed, check: can I finish? (greedy check)
  → First speed that works = answer.

  "What's the MAXIMUM distance such that..."
  "What's the MINIMUM capacity to ship..."
  → If you can CHECK whether an answer works in O(n),
  → and the answer space is MONOTONIC (works/doesn't work boundary),
  → USE BINARY SEARCH ON THE ANSWER.

  ══════════════════════════════════════════════════════════════
  BINARY SEARCH TIP 3: AVOIDING INFINITE LOOPS
  ══════════════════════════════════════════════════════════════

  ALWAYS use: mid = left + (right - left) / 2;  (avoids integer overflow)
  NEVER use:  mid = (left + right) / 2;         (overflows for large values)

  If you're stuck in infinite loop → check:
  1. Is left or right actually changing each iteration?
  2. Template 1: use left <= right AND left = mid + 1 / right = mid - 1
  3. Template 2: use left < right AND left = mid + 1 / right = mid
  4. Template 3: use left < right AND left = mid / right = mid - 1 AND round UP
```

## Tips for Heaps

```
  ══════════════════════════════════════════════════════════════
  HEAP TIP 1: "TOP K" = MIN-HEAP OF SIZE K
  ══════════════════════════════════════════════════════════════

  Want the K LARGEST elements?
  → Use a MIN-heap of size K.
  → Add each element. If heap size > K, remove the smallest.
  → At the end, the heap contains the K largest. peek() = Kth largest.

  WHY min-heap and not max-heap?
  Because you want to REMOVE the SMALLEST of the K candidates.
  Min-heap lets you remove the smallest in O(log K).

  ══════════════════════════════════════════════════════════════
  HEAP TIP 2: TWO-HEAP PATTERN FOR MEDIAN
  ══════════════════════════════════════════════════════════════

  Use TWO heaps:
  - Max-heap for the SMALLER half (left side)
  - Min-heap for the LARGER half (right side)

  Max-heap top = largest of the small half.
  Min-heap top = smallest of the large half.
  Median = average of the two tops (or one if odd count).

  Keep them BALANCED: sizes differ by at most 1.
  After each insertion, rebalance by moving top from larger to smaller.

  ══════════════════════════════════════════════════════════════
  HEAP TIP 3: WHEN TO USE HEAP vs SORT
  ══════════════════════════════════════════════════════════════

  Use HEAP when:
  - You need top K (O(n log k) beats O(n log n))
  - Data is streaming (can't sort a stream)
  - You need the min/max repeatedly as data changes

  Use SORT when:
  - You need ALL elements in order
  - Data is static (sort once, read many)
  - K is close to N (heap advantage disappears)
```

## Tips for Tries

```
  ══════════════════════════════════════════════════════════════
  TRIE TIP 1: WHEN TO USE A TRIE
  ══════════════════════════════════════════════════════════════

  Use a Trie when:
  - "Find all words with this PREFIX" (autocomplete)
  - "Does any word START WITH this?" (prefix matching)
  - "Find all valid words on a BOARD" (Word Search II)

  DON'T use a Trie when:
  - Just checking if a word exists → HashSet is simpler
  - No prefix operations needed

  ══════════════════════════════════════════════════════════════
  TRIE TIP 2: WORD SEARCH II TRICK
  ══════════════════════════════════════════════════════════════

  "Find all dictionary words in a grid" is the hardest Trie problem.
  TRICK: Build Trie from dictionary. DFS on grid while navigating Trie.
  At each cell, check if current Trie node has a child matching the cell.
  If Trie node is end-of-word → found a word!
  This prunes the search — skip paths not in the dictionary.
```

## Tips for Stacks & Monotonic Stacks

```
  ══════════════════════════════════════════════════════════════
  STACK TIP 1: THREE PATTERNS
  ══════════════════════════════════════════════════════════════

  PATTERN 1 — MATCHING (parentheses, tags):
  Push opening brackets. Pop on closing bracket. Check match.
  If stack not empty at end → unmatched.

  PATTERN 2 — MONOTONIC STACK (next greater/smaller):
  Maintain stack in decreasing order (for next greater).
  When new element is LARGER than top → pop and answer.
  The new element IS the "next greater" for everything popped.

  PATTERN 3 — CALCULATOR / EXPRESSION EVAL:
  Two stacks: one for numbers, one for operators.
  Process based on operator precedence.

  ══════════════════════════════════════════════════════════════
  STACK TIP 2: MONOTONIC STACK TEMPLATE
  ══════════════════════════════════════════════════════════════

  "Next GREATER element" → DECREASING stack
  "Next SMALLER element" → INCREASING stack

  Deque<Integer> stack = new ArrayDeque<>();  // store INDICES
  int[] answer = new int[n];

  for (int i = 0; i < n; i++) {
      while (!stack.isEmpty() && nums[i] > nums[stack.peek()]) {
          int idx = stack.pop();
          answer[idx] = nums[i];   // nums[i] is the next greater for idx
      }
      stack.push(i);
  }
  // Remaining in stack → no next greater → answer stays 0 (or -1)

  TIME: O(n) — each element pushed and popped AT MOST ONCE.

  ══════════════════════════════════════════════════════════════
  STACK TIP 3: HISTOGRAM TRICK
  ══════════════════════════════════════════════════════════════

  "Largest Rectangle in Histogram" is the HARDEST stack problem.
  But it uses the same monotonic stack idea:

  For each bar, find:
  - How far LEFT can it extend? (until a shorter bar)
  - How far RIGHT can it extend? (until a shorter bar)
  Width = right boundary - left boundary - 1
  Area = height × width

  The stack maintains increasing heights.
  When a shorter bar comes → pop and compute area for popped bar.
```

## General Algorithm Tricks for ALL Topics

```
  ══════════════════════════════════════════════════════════════
  TRICK 1: DUMMY NODES (Linked Lists & Trees)
  ══════════════════════════════════════════════════════════════
  Create a dummy head node to avoid edge cases:
  ListNode dummy = new ListNode(0);
  dummy.next = head;
  // ... modify list ...
  return dummy.next;

  ══════════════════════════════════════════════════════════════
  TRICK 2: TWO POINTERS ON SORTED ARRAYS
  ══════════════════════════════════════════════════════════════
  If array is sorted and you need pairs:
  left = 0, right = n-1
  If sum too small → left++
  If sum too big → right--
  O(n) instead of O(n²)

  ══════════════════════════════════════════════════════════════
  TRICK 3: "VISITED" SET vs MODIFYING INPUT
  ══════════════════════════════════════════════════════════════
  For grids: instead of boolean[][] visited, you can modify the grid itself:
  grid[i][j] = '0' (sink islands), or '#' (mark as visited).
  Saves space but modifies input — ask interviewer if OK.

  ══════════════════════════════════════════════════════════════
  TRICK 4: PROCESSING FROM BOUNDARIES
  ══════════════════════════════════════════════════════════════
  Some problems are easier if you start from the EDGE, not the center.
  "Surrounded Regions" → DFS from border O's (mark as safe), flip the rest.
  "Pacific Atlantic" → BFS/DFS from each ocean border inward.

  ══════════════════════════════════════════════════════════════
  TRICK 5: BIDIRECTIONAL BFS
  ══════════════════════════════════════════════════════════════
  For shortest path between two KNOWN nodes:
  BFS from BOTH start and end simultaneously.
  When they MEET → shortest path found.
  Cuts search space from O(b^d) to O(b^(d/2)) where b=branching, d=depth.
  Use for: Word Ladder, Open the Lock.

  ══════════════════════════════════════════════════════════════
  TRICK 6: SPACE OPTIMIZATION IN DP
  ══════════════════════════════════════════════════════════════
  If dp[i] only depends on dp[i-1] → use two variables instead of array.
  If dp[i][j] only depends on dp[i-1][j...] → use 1D array, iterate backward.
  Mention this to interviewer: "I can optimize space from O(n²) to O(n)."

  ══════════════════════════════════════════════════════════════
  TRICK 7: COMPLEXITY CLAIMS YOU MUST KNOW
  ══════════════════════════════════════════════════════════════
  "I can sort in O(n log n)."
  "HashMap lookup is O(1) amortized."
  "BFS/DFS is O(V + E)."
  "Binary search is O(log n)."
  "Heap push/pop is O(log n), peek is O(1)."
  "Sliding window is O(n) — each element added and removed at most once."
  "Monotonic stack is O(n) — each element pushed and popped at most once."

  Always state your TIME and SPACE complexity after coding.
  Google interviewers WILL ask.
```

---

# PART 11: ML-SPECIFIC CODING (Implement From Scratch)

---

## 11.1 Linear Regression with Gradient Descent

```java
// Predict y = wx + b. Train with gradient descent.
public class LinearRegression {
    double w = 0, b = 0;

    void train(double[] X, double[] y, double lr, int epochs) {
        int n = X.length;
        for (int e = 0; e < epochs; e++) {
            double dw = 0, db = 0;
            for (int i = 0; i < n; i++) {
                double pred = w * X[i] + b;
                double error = pred - y[i];
                dw += error * X[i];         // dL/dw
                db += error;                // dL/db
            }
            w -= lr * (2.0 / n) * dw;
            b -= lr * (2.0 / n) * db;
        }
    }

    double predict(double x) { return w * x + b; }
}
```

## 11.2 Logistic Regression

```java
public class LogisticRegression {
    double[] w;
    double b = 0;

    double sigmoid(double z) { return 1.0 / (1.0 + Math.exp(-z)); }

    void train(double[][] X, int[] y, double lr, int epochs) {
        int n = X.length, d = X[0].length;
        w = new double[d];
        for (int e = 0; e < epochs; e++) {
            double[] dw = new double[d];
            double db = 0;
            for (int i = 0; i < n; i++) {
                double z = b;
                for (int j = 0; j < d; j++) z += w[j] * X[i][j];
                double pred = sigmoid(z);
                double error = pred - y[i];
                for (int j = 0; j < d; j++) dw[j] += error * X[i][j];
                db += error;
            }
            for (int j = 0; j < d; j++) w[j] -= lr * dw[j] / n;
            b -= lr * db / n;
        }
    }

    int predict(double[] x) {
        double z = b;
        for (int j = 0; j < w.length; j++) z += w[j] * x[j];
        return sigmoid(z) >= 0.5 ? 1 : 0;
    }
}
```

## 11.3 K-Means Clustering

```java
public int[] kMeans(double[][] data, int k, int maxIter) {
    int n = data.length, d = data[0].length;
    double[][] centroids = new double[k][d];
    int[] labels = new int[n];

    // Initialize: pick first k points as centroids
    for (int i = 0; i < k; i++) centroids[i] = data[i].clone();

    for (int iter = 0; iter < maxIter; iter++) {
        // Assign each point to nearest centroid
        for (int i = 0; i < n; i++) {
            double minDist = Double.MAX_VALUE;
            for (int c = 0; c < k; c++) {
                double dist = 0;
                for (int j = 0; j < d; j++) dist += Math.pow(data[i][j] - centroids[c][j], 2);
                if (dist < minDist) { minDist = dist; labels[i] = c; }
            }
        }
        // Update centroids
        double[][] sums = new double[k][d];
        int[] counts = new int[k];
        for (int i = 0; i < n; i++) {
            counts[labels[i]]++;
            for (int j = 0; j < d; j++) sums[labels[i]][j] += data[i][j];
        }
        for (int c = 0; c < k; c++)
            for (int j = 0; j < d; j++)
                centroids[c][j] = counts[c] > 0 ? sums[c][j] / counts[c] : centroids[c][j];
    }
    return labels;
}
```

## 11.4 KNN (K-Nearest Neighbors)

```java
public int knn(double[][] trainX, int[] trainY, double[] query, int k) {
    // Compute distances
    PriorityQueue<double[]> pq = new PriorityQueue<>((a,b) -> Double.compare(b[0], a[0])); // max-heap
    for (int i = 0; i < trainX.length; i++) {
        double dist = 0;
        for (int j = 0; j < query.length; j++) dist += Math.pow(trainX[i][j] - query[j], 2);
        pq.offer(new double[]{dist, trainY[i]});
        if (pq.size() > k) pq.poll();
    }
    // Majority vote
    Map<Integer, Integer> votes = new HashMap<>();
    while (!pq.isEmpty()) {
        int label = (int) pq.poll()[1];
        votes.merge(label, 1, Integer::sum);
    }
    return votes.entrySet().stream().max(Map.Entry.comparingByValue()).get().getKey();
}
```

## 11.5 Softmax (Numerically Stable)

```java
public double[] softmax(double[] logits) {
    double max = Double.NEGATIVE_INFINITY;
    for (double v : logits) max = Math.max(max, v);

    double[] exps = new double[logits.length];
    double sum = 0;
    for (int i = 0; i < logits.length; i++) {
        exps[i] = Math.exp(logits[i] - max);  // subtract max for stability
        sum += exps[i];
    }
    for (int i = 0; i < exps.length; i++) exps[i] /= sum;
    return exps;
}
```

## 11.6 Self-Attention

```java
// Simplified single-head attention: Attention(Q,K,V) = softmax(QKᵀ/√dk)V
public double[][] selfAttention(double[][] Q, double[][] K, double[][] V) {
    int n = Q.length, dk = Q[0].length;
    double scale = Math.sqrt(dk);

    // Compute scores: QKᵀ / √dk
    double[][] scores = new double[n][n];
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) {
            double dot = 0;
            for (int d = 0; d < dk; d++) dot += Q[i][d] * K[j][d];
            scores[i][j] = dot / scale;
        }

    // Softmax each row
    double[][] weights = new double[n][n];
    for (int i = 0; i < n; i++) weights[i] = softmax(scores[i]);

    // Multiply by V
    int dv = V[0].length;
    double[][] output = new double[n][dv];
    for (int i = 0; i < n; i++)
        for (int j = 0; j < dv; j++)
            for (int k = 0; k < n; k++)
                output[i][j] += weights[i][k] * V[k][j];

    return output;
}
```

---

# PART 12: 12-WEEK STUDY PLAN

---

```
  ┌──────────┬──────────────────────────────┬──────────────────────┐
  │ Week     │ Topics                        │ Problems / Day       │
  ├──────────┼──────────────────────────────┼──────────────────────┤
  │ 1-2      │ Arrays, Hashmaps, Strings    │ 2 Easy/Medium         │
  │ 3-4      │ Trees, BST, Binary Search    │ 2 Medium              │
  │ 5-6      │ Graphs (BFS, DFS, topo)      │ 2 Medium              │
  │ 7-8      │ DP (1D, 2D, knapsack)        │ 2 Medium              │
  │ 9-10     │ Sliding Window, Heaps, Tries │ 2 Medium/Hard         │
  │ 11-12    │ Hard problems, mock interviews│ 2 Hard + review       │
  └──────────┴──────────────────────────────┴──────────────────────┘

  DAILY ROUTINE:
  ─────────────────
  1. Pick a problem. Read it. Think for 15 min.
  2. If stuck → read the APPROACH (not code). Think 10 more min.
  3. Implement your solution.
  4. Compare with optimal solution.
  5. Re-solve from scratch next day (spaced repetition).

  TOTAL: ~160 problems, 2 per day, 12 weeks.
  DIFFICULTY: 20% Easy → 60% Medium → 20% Hard
```

---

# PART 13: PATTERN RECOGNITION GUIDE — "I See This Problem, I Use This Pattern"

> The secret to solving interview problems fast: **recognize the pattern in the first 30 seconds.** Don't think "what algorithm should I use?" Think "what PATTERN does this match?"

---

## 13.1 Master Pattern Table — Every Problem Falls Into One of These

```
  READ THE QUESTION → IDENTIFY KEYWORDS → PICK THE PATTERN

  ┌─────────────────────────────────────────────────────────────────────────────┐
  │  KEYWORDS IN QUESTION             │  PATTERN              │ FIRST THING    │
  │                                    │                       │ YOU DO         │
  ├────────────────────────────────────┼───────────────────────┼────────────────┤
  │ "find pair", "sum to target",     │ HASHMAP LOOKUP        │ Create a map:  │
  │ "two numbers", "complement"       │                       │ value → index  │
  ├────────────────────────────────────┼───────────────────────┼────────────────┤
  │ "subarray sum", "sum equals k",   │ PREFIX SUM +          │ Running sum +  │
  │ "continuous subarray"             │ HASHMAP               │ map of sums    │
  ├────────────────────────────────────┼───────────────────────┼────────────────┤
  │ "longest substring", "window",    │ SLIDING WINDOW        │ left pointer,  │
  │ "at most k", "contiguous"        │                       │ expand right   │
  ├────────────────────────────────────┼───────────────────────┼────────────────┤
  │ "sorted array", "search",        │ BINARY SEARCH         │ left, right,   │
  │ "minimum that satisfies"         │                       │ mid = (l+r)/2  │
  ├────────────────────────────────────┼───────────────────────┼────────────────┤
  │ "grid", "island", "connected",   │ BFS / DFS on GRID     │ visited[][],   │
  │ "flood fill", "regions"          │                       │ 4 directions   │
  ├────────────────────────────────────┼───────────────────────┼────────────────┤
  │ "shortest path", "minimum steps", │ BFS (unweighted)      │ Queue + level  │
  │ "fewest moves", "level by level" │ DIJKSTRA (weighted)   │ tracking       │
  ├────────────────────────────────────┼───────────────────────┼────────────────┤
  │ "all paths", "permutations",     │ DFS / BACKTRACKING    │ Recursive DFS  │
  │ "combinations", "subsets"        │                       │ + undo choice  │
  ├────────────────────────────────────┼───────────────────────┼────────────────┤
  │ "prerequisites", "order",        │ TOPOLOGICAL SORT      │ In-degree map  │
  │ "schedule", "dependency"         │                       │ + BFS (Kahn's) │
  ├────────────────────────────────────┼───────────────────────┼────────────────┤
  │ "connected components", "union",  │ UNION-FIND            │ parent[] array │
  │ "groups", "redundant edge"       │                       │ + find + union │
  ├────────────────────────────────────┼───────────────────────┼────────────────┤
  │ "how many ways", "minimum cost", │ DYNAMIC PROGRAMMING   │ Define dp[i]   │
  │ "maximum profit", "can you reach"│                       │ Find recurrence│
  ├────────────────────────────────────┼───────────────────────┼────────────────┤
  │ "top k", "kth largest",          │ HEAP                  │ PriorityQueue  │
  │ "k closest", "merge k sorted"   │                       │ of size k      │
  ├────────────────────────────────────┼───────────────────────┼────────────────┤
  │ "prefix", "autocomplete",        │ TRIE                  │ Build trie     │
  │ "starts with", "word search"     │                       │ from words     │
  ├────────────────────────────────────┼───────────────────────┼────────────────┤
  │ "next greater", "next smaller",   │ MONOTONIC STACK       │ Stack of       │
  │ "histogram", "temperatures"      │                       │ indices        │
  ├────────────────────────────────────┼───────────────────────┼────────────────┤
  │ "tree", "depth", "ancestor",     │ TREE DFS / BFS        │ Recursive DFS  │
  │ "balanced", "serialize"          │                       │ on left/right  │
  ├────────────────────────────────────┼───────────────────────┼────────────────┤
  │ "valid parentheses", "matching",  │ STACK                 │ Push open,     │
  │ "nested", "calculator"           │                       │ pop on close   │
  └────────────────────────────────────┴───────────────────────┴────────────────┘
```

---

## 13.2 Each Pattern Explained Simply

### PATTERN 1: HashMap Lookup

```
  WHEN: You need to find something fast. "Does this exist?" "Where is it?"

  ANALOGY: You're in a library. Instead of checking every shelf,
  you use the catalog computer to look up the exact shelf number.

  HOW IT WORKS:
  - Store items in a HashMap: key → value
  - Looking up anything takes O(1) — instant!

  RECOGNIZE IT: "Find two numbers that...", "group by...",
                "count frequency of...", "first unique..."

  TEMPLATE:
  ─────────
  Map<Key, Value> map = new HashMap<>();
  for each item:
      if map contains what I need → found it!
      else → store this item in map
```

### PATTERN 2: Prefix Sum

```
  WHEN: You need sum of any subarray quickly.

  ANALOGY: Imagine a running total of your spending.
  "How much did I spend from Tuesday to Friday?"
  = total by Friday - total by Monday

  HOW IT WORKS:
  prefix[0] = 0
  prefix[i] = prefix[i-1] + nums[i-1]
  Sum from index i to j = prefix[j+1] - prefix[i]

  RECOGNIZE IT: "subarray sum equals k", "number of subarrays with sum..."

  VISUAL:
  nums:   [1, 2, 3, 4, 5]
  prefix: [0, 1, 3, 6, 10, 15]

  Sum from index 1 to 3 = prefix[4] - prefix[1] = 10 - 1 = 9
  Check: 2 + 3 + 4 = 9 ✓
```

### PATTERN 3: Sliding Window

```
  WHEN: Find the longest/shortest CONTIGUOUS subarray/substring with some property.

  ANALOGY: You're looking through a window on a train.
  The window moves along the track (array).
  You can make the window bigger (expand right)
  or smaller (shrink left).

  HOW IT WORKS:
  1. Start with left = 0
  2. Move right pointer one step at a time
  3. If window becomes invalid → move left until valid again
  4. Track the best (longest/shortest) valid window

  RECOGNIZE IT: "longest substring without...", "minimum window containing...",
                "at most k distinct...", "maximum sum subarray of size k"

  VISUAL:
  Array: [A, B, C, D, E, F, G]

  Step 1: [A] B  C  D  E  F  G    window = 1, expand →
  Step 2: [A  B] C  D  E  F  G    window = 2, expand →
  Step 3: [A  B  C] D  E  F  G    window = 3, invalid! shrink ←
  Step 4:  A [B  C] D  E  F  G    window = 2, valid, expand →
  Step 5:  A [B  C  D] E  F  G    window = 3, ...

  TEMPLATE:
  ─────────
  int left = 0;
  for (int right = 0; right < n; right++) {
      // add nums[right] to window
      while (window is invalid) {
          // remove nums[left] from window
          left++;
      }
      // update answer with (right - left + 1)
  }
```

### PATTERN 4: Binary Search

```
  WHEN: Search space is sorted or has a monotonic property.
  "Find the minimum X such that condition is true."

  ANALOGY: Guessing a number between 1-100.
  "Is it above 50?" Yes. "Above 75?" No. "Above 62?" Yes.
  Each guess cuts the possibilities in HALF.

  TWO TYPES:
  1. Search for exact value:  while left <= right
  2. Search for boundary:     while left < right

  RECOGNIZE IT: "sorted array", "minimum speed", "maximum that fits",
                "search in rotated", "first bad version"

  KEY INSIGHT: Binary search isn't just for sorted arrays!
  You can binary search on the ANSWER:
  "What's the minimum eating speed to finish in H hours?"
  → Binary search on speed from 1 to max.
  → For each speed, check if you can finish in time.
```

### PATTERN 5: BFS (Breadth-First Search)

```
  WHEN: Shortest path in unweighted graph. Level-by-level traversal.

  ANALOGY: Dropping a stone in water.
  Ripples spread outward — everything at distance 1 first,
  then distance 2, then distance 3...

  HOW IT WORKS:
  1. Start node → queue
  2. Pop front of queue, process it
  3. Add all unvisited neighbors to queue
  4. Repeat until queue empty

  RECOGNIZE IT: "shortest path", "minimum steps", "nearest",
                "level order", "rotting oranges", "word ladder"

  VISUAL:
  Start → Level 0: [A]
          Level 1: [B, C]       (distance 1 from A)
          Level 2: [D, E, F]   (distance 2 from A)
          Level 3: [G]         (distance 3 from A)

  KEY: BFS finds shortest path FIRST. When you reach a node,
  that's the shortest distance. Guaranteed.
```

### PATTERN 6: DFS (Depth-First Search)

```
  WHEN: Explore all paths. Find connected components. Detect cycles.

  ANALOGY: Exploring a maze. Go as far as you can down one path.
  Hit a dead end? Backtrack and try the next path.

  HOW IT WORKS:
  1. Visit node, mark visited
  2. For each unvisited neighbor → recurse
  3. When all neighbors visited → return (backtrack)

  RECOGNIZE IT: "number of islands", "connected components",
                "all paths from A to B", "cycle detection"

  TWO FLAVORS:
  - Pure DFS: just explore (islands, components)
  - DFS + Backtracking: explore AND undo choices (permutations, subsets)

  BACKTRACKING TEMPLATE:
  ─────────
  void backtrack(state, choices) {
      if (state is complete) → add to results, return
      for each choice:
          make choice
          backtrack(new state, remaining choices)
          undo choice  ← this is the "backtracking" part!
  }
```

### PATTERN 7: Dynamic Programming

```
  WHEN: Problem has overlapping subproblems + optimal substructure.
  "How many ways?" "Minimum cost?" "Maximum profit?"

  ANALOGY: You're climbing stairs. To reach step 5, you either
  came from step 4 or step 3. So ways(5) = ways(4) + ways(3).
  Once you compute ways(3), SAVE IT so you don't recompute.

  THE DP RECIPE:
  1. Define state:     dp[i] means "answer for subproblem of size i"
  2. Find recurrence:  dp[i] = something(dp[i-1], dp[i-2], ...)
  3. Base cases:       dp[0] = ..., dp[1] = ...
  4. Fill order:       left to right, or bottom-up
  5. Return:           dp[n]

  RECOGNIZE IT:
  "how many ways", "minimum coins", "longest subsequence",
  "can you partition", "word break", "edit distance"

  COMMON DP PATTERNS:
  ┌────────────────────┬────────────────────────────────────────┐
  │ 1D DP              │ Climbing stairs, house robber,          │
  │                    │ coin change, word break                 │
  ├────────────────────┼────────────────────────────────────────┤
  │ 2D DP              │ LCS, edit distance, unique paths,       │
  │                    │ interleaving string                     │
  ├────────────────────┼────────────────────────────────────────┤
  │ Knapsack           │ 0/1 knapsack, partition equal subset,   │
  │                    │ target sum, coin change (unbounded)     │
  ├────────────────────┼────────────────────────────────────────┤
  │ String DP          │ Palindromes, regex matching,            │
  │                    │ decode ways, word break                 │
  ├────────────────────┼────────────────────────────────────────┤
  │ State Machine DP   │ Buy/sell stock (multiple transactions), │
  │                    │ house robber circular                   │
  └────────────────────┴────────────────────────────────────────┘
```

### PATTERN 8: Topological Sort

```
  WHEN: Dependencies. "Must do X before Y." Ordering with constraints.

  ANALOGY: Getting dressed in the morning.
  You must put on underwear before pants.
  You must put on socks before shoes.
  Topological sort finds a VALID order.

  HOW IT WORKS (Kahn's BFS):
  1. Count in-degrees (how many prerequisites each node has)
  2. Start with nodes that have 0 prerequisites → queue
  3. Process: remove node, reduce in-degrees of neighbors
  4. When neighbor's in-degree hits 0 → add to queue
  5. If all nodes processed → valid order. If not → cycle!

  RECOGNIZE IT: "course schedule", "task ordering", "build order",
                "alien dictionary", "parallel jobs"
```

### PATTERN 9: Union-Find

```
  WHEN: "Are these two things connected?" Group elements. Count groups.

  ANALOGY: Social circles. If Alice knows Bob, and Bob knows Carol,
  then Alice, Bob, and Carol are in the same circle.
  Union-Find tracks these circles efficiently.

  HOW IT WORKS:
  - Every element has a "parent" (initially itself)
  - find(x): follow parent pointers to the root
  - union(x,y): connect roots of x and y
  - Path compression: shortcut future finds
  - Union by rank: keep trees balanced

  RECOGNIZE IT: "connected components", "friend circles",
                "redundant connection", "accounts merge", "graph valid tree"
```

### PATTERN 10: Monotonic Stack

```
  WHEN: "Next greater element", "previous smaller", histograms.

  ANALOGY: A line of people of different heights.
  Each person looks RIGHT to find the first taller person.
  Instead of each person scanning the whole line (O(n²)),
  use a stack to track "I haven't found my taller person yet."

  HOW IT WORKS:
  - Maintain a stack of INDICES (not values)
  - Stack is always monotonically decreasing (or increasing)
  - When a new element is LARGER than stack top → pop and process
  - The new element IS the "next greater" for all popped elements

  RECOGNIZE IT: "next greater element", "daily temperatures",
                "largest rectangle in histogram", "trapping rain water"
```

---

## 13.3 Decision Flowchart — "Which Pattern Do I Use?"

```
  START: Read the problem
    │
    ├─ Is it about ARRAYS/STRINGS?
    │   ├─ Need to find a pair/complement?        → HASHMAP
    │   ├─ Need subarray sum?                     → PREFIX SUM
    │   ├─ Need longest/shortest contiguous?      → SLIDING WINDOW
    │   ├─ Array is sorted?                       → BINARY SEARCH / TWO POINTERS
    │   ├─ Need next greater/smaller?             → MONOTONIC STACK
    │   └─ Need matching brackets/nesting?        → STACK
    │
    ├─ Is it about a GRAPH or GRID?
    │   ├─ Need shortest path (unweighted)?       → BFS
    │   ├─ Need shortest path (weighted)?         → DIJKSTRA
    │   ├─ Need all paths / connected components? → DFS
    │   ├─ Need ordering with dependencies?       → TOPOLOGICAL SORT
    │   ├─ Need "are these connected?"            → UNION-FIND
    │   └─ Need count components?                 → DFS/BFS/UNION-FIND
    │
    ├─ Is it about a TREE?
    │   ├─ Need to visit all nodes?               → DFS (inorder/preorder/postorder)
    │   ├─ Need level-by-level?                   → BFS (level order)
    │   ├─ Need to validate BST?                  → DFS with min/max range
    │   └─ Need ancestor/path?                    → DFS with return values
    │
    ├─ Is it asking "how many ways" / "min cost" / "max profit"?
    │   └─ → DYNAMIC PROGRAMMING
    │       ├─ Single array input?                → 1D DP
    │       ├─ Two strings/arrays?                → 2D DP
    │       └─ Select items with weight limit?    → KNAPSACK
    │
    ├─ Is it asking "top K" / "kth largest"?
    │   └─ → HEAP (PriorityQueue)
    │
    └─ Is it about PREFIX matching / autocomplete?
        └─ → TRIE
```

---

## 13.4 All 160 Problems Categorized by Pattern

### HASHMAP (20 problems)

| # | Problem | How to Recognize | How to Solve |
|---|---------|-----------------|-------------|
| 1 | Two Sum (1) | "find two that sum to target" | Map: value→index. For each num, check if target-num in map. |
| 2 | Contains Duplicate (217) | "any value appears twice" | HashSet. If add() returns false → duplicate. |
| 3 | Valid Anagram (242) | "rearrangement of letters" | Count char frequency in both strings. Compare. |
| 4 | Group Anagrams (49) | "group words by anagram" | Sort each word → use as key. Map: sorted→list. |
| 5 | Top K Frequent (347) | "k most frequent" | Map: value→count. Then heap or bucket sort. |
| 6 | Product Except Self (238) | "product of all except me" | Left pass × right pass. No division. |
| 7 | Longest Consecutive (128) | "longest consecutive sequence" | HashSet. For each num, check if num-1 exists (start of sequence). |
| 8 | Subarray Sum = K (560) | "subarrays summing to k" | Prefix sum in map. count += map.get(sum-k). |
| 9 | Majority Element (169) | "appears more than n/2" | Boyer-Moore voting. Candidate + count. |
| 10 | Maximum Subarray (53) | "maximum sum contiguous" | Kadane's: maxHere = max(num, maxHere + num). |

### SLIDING WINDOW (15 problems)

| # | Problem | How to Recognize | How to Solve |
|---|---------|-----------------|-------------|
| 1 | Best Time Buy Stock (121) | "max profit one transaction" | Track min price so far. Profit = price - minSoFar. |
| 2 | Longest No Repeat (3) | "longest substring unique chars" | Set + left pointer. Shrink left when duplicate found. |
| 3 | Longest Repeating Replace (424) | "longest with at most k replacements" | Window where (length - maxFreqChar) <= k. |
| 4 | Min Window Substring (76) | "smallest window containing all chars" | Freq map. Expand right, shrink left when all chars found. |
| 5 | Permutation in String (567) | "s2 contains permutation of s1" | Fixed window size len(s1). Compare char frequencies. |

### BINARY SEARCH (15 problems)

| # | Problem | How to Recognize | How to Solve |
|---|---------|-----------------|-------------|
| 1 | Binary Search (704) | "find target in sorted array" | Classic left/right/mid. |
| 2 | Search Rotated (33) | "sorted then rotated" | Check which half is sorted. Narrow accordingly. |
| 3 | Find Min Rotated (153) | "minimum in rotated sorted" | Binary search: if mid > right, min is in right half. |
| 4 | Koko Bananas (875) | "minimum speed to finish in h hours" | Binary search on ANSWER. For each speed, check feasibility. |
| 5 | Median Two Sorted (4) | "median of two sorted arrays" | Binary search partition. O(log min(m,n)). |

### BFS (12 problems)

| # | Problem | How to Recognize | How to Solve |
|---|---------|-----------------|-------------|
| 1 | Rotting Oranges (994) | "min minutes for all oranges to rot" | Multi-source BFS from all rotten oranges simultaneously. |
| 2 | Word Ladder (127) | "shortest transformation sequence" | BFS where each word is a node, change 1 char = edge. |
| 3 | Walls and Gates (286) | "distance to nearest gate" | Multi-source BFS from all gates. |
| 4 | Shortest Path Grid (1091) | "shortest path in binary matrix" | BFS with 8 directions. |
| 5 | Open the Lock (752) | "minimum turns to reach target" | BFS on lock states (each state = 4-digit combo). |

### DFS (13 problems)

| # | Problem | How to Recognize | How to Solve |
|---|---------|-----------------|-------------|
| 1 | Number of Islands (200) | "count connected land regions" | DFS flood fill. Sink visited land. |
| 2 | Clone Graph (133) | "deep copy a graph" | DFS + HashMap (original→clone). |
| 3 | Pacific Atlantic (417) | "cells that drain to both oceans" | DFS from each ocean border inward. Intersect results. |
| 4 | Word Search (79) | "find word path in grid" | DFS backtracking. Mark visited, recurse 4 dirs, unmark. |
| 5 | Surrounded Regions (130) | "capture surrounded O's" | DFS from BORDER O's (mark safe). Flip remaining O's. |

### TOPOLOGICAL SORT (5 problems)

| # | Problem | How to Recognize | How to Solve |
|---|---------|-----------------|-------------|
| 1 | Course Schedule (207) | "can you finish all courses?" | Topo sort. If cycle → false. |
| 2 | Course Schedule II (210) | "order to take courses" | Topo sort. Return the order. |
| 3 | Alien Dictionary (269) | "derive order from sorted words" | Build graph from word pairs. Topo sort. |

### DYNAMIC PROGRAMMING (25 problems)

| # | Problem | How to Recognize | How to Solve |
|---|---------|-----------------|-------------|
| 1 | Climbing Stairs (70) | "how many ways to reach top" | dp[i] = dp[i-1] + dp[i-2]. Fibonacci! |
| 2 | House Robber (198) | "max money, can't rob adjacent" | dp[i] = max(dp[i-1], dp[i-2]+nums[i]). Skip or take. |
| 3 | Coin Change (322) | "minimum coins for amount" | dp[i] = min(dp[i-coin]+1). Try each coin. |
| 4 | LCS (1143) | "longest common subsequence" | 2D: match→diagonal+1, else→max(left,up). |
| 5 | Word Break (139) | "can string be segmented into words" | dp[i] = true if dp[j] true AND s[j:i] in dict. |
| 6 | Edit Distance (72) | "min operations to transform" | 2D: match→diagonal, else→min(insert,delete,replace)+1. |
| 7 | Unique Paths (62) | "paths in grid top-left to bottom-right" | dp[i][j] = dp[i-1][j] + dp[i][j-1]. |
| 8 | LIS (300) | "longest increasing subsequence" | dp[i] = max(dp[j]+1) for j < i where nums[j] < nums[i]. |
| 9 | Partition Equal Subset (416) | "can array be split into equal halves" | Subset sum = total/2. Knapsack DP. |
| 10 | Target Sum (494) | "assign +/- to reach target" | Subset sum variant. dp on possible sums. |

### TREES (20 problems)

| # | Problem | How to Recognize | How to Solve |
|---|---------|-----------------|-------------|
| 1 | Max Depth (104) | "height of tree" | return max(left, right) + 1. |
| 2 | Invert Tree (226) | "mirror the tree" | Swap left and right at every node. |
| 3 | Validate BST (98) | "is this a valid BST" | DFS with (min, max) range at each node. |
| 4 | LCA (236) | "lowest common ancestor" | If left and right both non-null → current is LCA. |
| 5 | Serialize Tree (297) | "convert tree to string and back" | Preorder with "null" markers. |

### HEAP (10 problems)

| # | Problem | How to Recognize | How to Solve |
|---|---------|-----------------|-------------|
| 1 | Kth Largest (215) | "kth largest element" | Min-heap of size k. Peek = answer. |
| 2 | Merge K Lists (23) | "merge k sorted lists" | Min-heap of list heads. Pop min, push next. |
| 3 | Find Median Stream (295) | "median of running stream" | Max-heap (left half) + min-heap (right half). |
| 4 | Task Scheduler (621) | "minimum time with cooldown" | Max-heap for most frequent tasks + cooldown queue. |

### TRIE (5 problems)

| # | Problem | How to Recognize | How to Solve |
|---|---------|-----------------|-------------|
| 1 | Implement Trie (208) | "prefix tree" | Node with children[26] + isEnd. |
| 2 | Word Search II (212) | "find all words in grid" | Build trie from words. DFS grid with trie navigation. |
| 3 | Design Autocomplete (642) | "suggest completions" | Trie + DFS to find all words with prefix. |

### MONOTONIC STACK (5 problems)

| # | Problem | How to Recognize | How to Solve |
|---|---------|-----------------|-------------|
| 1 | Daily Temperatures (739) | "days until warmer" | Decreasing stack of indices. Pop when temp > top. |
| 2 | Largest Rectangle (84) | "largest rectangle in histogram" | Stack tracks bars. Pop when shorter bar found. |
| 3 | Trapping Rain Water (42) | "water trapped between bars" | Two pointers (or monotonic stack). |

---

## 13.5 ML-Specific Coding — Pattern Guide

```
  ML CODING ROUND: Implement algorithms from scratch.
  No sklearn. Only basic math operations.

  ┌─────────────────────┬───────────────────────────────────────────────┐
  │ PROBLEM              │ KEY INSIGHT / PATTERN                         │
  ├─────────────────────┼───────────────────────────────────────────────┤
  │ Linear Regression    │ y = wx + b. Gradient: dw = (pred-y)*x,       │
  │ (gradient descent)   │ db = (pred-y). Update: w -= lr * dw.         │
  ├─────────────────────┼───────────────────────────────────────────────┤
  │ Logistic Regression  │ Same as linear but add sigmoid: 1/(1+e^-z).  │
  │                      │ Loss: binary cross-entropy. Gradient similar.│
  ├─────────────────────┼───────────────────────────────────────────────┤
  │ K-Means              │ 1) Assign each point to nearest centroid.     │
  │                      │ 2) Update centroids = mean of assigned points.│
  │                      │ 3) Repeat until convergence.                 │
  ├─────────────────────┼───────────────────────────────────────────────┤
  │ KNN                  │ Compute distance to all training points.      │
  │                      │ Pick K closest. Majority vote = prediction.  │
  ├─────────────────────┼───────────────────────────────────────────────┤
  │ Decision Tree        │ For each feature, find best split (Gini).     │
  │                      │ Recursively split left and right.             │
  ├─────────────────────┼───────────────────────────────────────────────┤
  │ Neural Net Layer     │ output = activation(W × input + bias).        │
  │ (forward pass)       │ Matrix multiply + add bias + ReLU/sigmoid.   │
  ├─────────────────────┼───────────────────────────────────────────────┤
  │ Self-Attention       │ scores = QK^T / √dk. weights = softmax(scores)│
  │                      │ output = weights × V. Three matrix multiplies.│
  ├─────────────────────┼───────────────────────────────────────────────┤
  │ Softmax (stable)     │ Subtract max first! Then e^(x-max) / sum.    │
  │                      │ Prevents overflow. Result identical.         │
  ├─────────────────────┼───────────────────────────────────────────────┤
  │ Batch Normalization  │ mean, var = statistics of batch.              │
  │                      │ normalized = (x - mean) / sqrt(var + eps).   │
  │                      │ output = gamma * normalized + beta.          │
  ├─────────────────────┼───────────────────────────────────────────────┤
  │ Data Pipeline        │ Shuffle data. Split into batches of size B.  │
  │                      │ For each epoch, iterate all batches.          │
  │                      │ Yield (batch_X, batch_y) pairs.              │
  └─────────────────────┴───────────────────────────────────────────────┘
```

---

## 13.6 Complexity Quick Reference

```
  ┌───────────────────────┬──────────────┬─────────────┐
  │ Pattern               │ Time         │ Space       │
  ├───────────────────────┼──────────────┼─────────────┤
  │ HashMap lookup        │ O(n)         │ O(n)        │
  │ Prefix sum            │ O(n)         │ O(n)        │
  │ Sliding window        │ O(n)         │ O(k)        │
  │ Binary search         │ O(log n)     │ O(1)        │
  │ BFS / DFS             │ O(V + E)     │ O(V)        │
  │ Dijkstra (heap)       │ O((V+E)logV) │ O(V)        │
  │ Topological sort      │ O(V + E)     │ O(V)        │
  │ Union-Find            │ O(α(n)) ≈ 1  │ O(V)        │
  │ DP (1D)               │ O(n)         │ O(n) or O(1)│
  │ DP (2D)               │ O(n×m)       │ O(n×m)      │
  │ Heap operations       │ O(n log k)   │ O(k)        │
  │ Trie insert/search    │ O(L)         │ O(N×L)      │
  │ Monotonic stack       │ O(n)         │ O(n)        │
  │ Sorting               │ O(n log n)   │ O(n)        │
  └───────────────────────┴──────────────┴─────────────┘
  V=vertices, E=edges, L=string length, N=number of strings, k=window/heap size
```

---

**Previous:** [Chapter 17 — ML System Design](17_ml_system_design.md)

**Next:** [Interview Questions](15_interview_questions.md)
