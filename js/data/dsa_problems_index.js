// ─── DSA Problems Data ───
// Google's most frequently asked Data Structures & Algorithms problems
// organized by category with Java starter code

const DSA_PROBLEMS = [

  // ═══════════════════════════════════════════
  // ═══  FUNDAMENTALS (Search & Sort)      ═══
  // ═══════════════════════════════════════════

  {
    id: 'linear-search',
    title: 'Linear Search',
    category: 'Fundamentals',
    difficulty: 'Easy',
    link: 'https://www.geeksforgeeks.org/linear-search/',
    tags: ['Search', 'Array', 'Fundamentals'],
    description: 'Given an array `nums` and a target value, return the index of the first occurrence of `target`. Return -1 if not found. The array is **not** sorted — you must scan every element.\n\n**Complexity:** Time O(n), Space O(1).',
    examples: 'Input: nums = [3, 7, 1, 9, 4], target = 9\nOutput: 3\n\nInput: nums = [3, 7, 1, 9, 4], target = 8\nOutput: -1',
    starterCode: null
  },

  {
    id: 'binary-search-impl',
    title: 'Binary Search — Implement from Scratch',
    category: 'Fundamentals',
    difficulty: 'Easy',
    link: 'https://www.geeksforgeeks.org/binary-search/',
    tags: ['Search', 'Divide & Conquer', 'Fundamentals'],
    description: 'Implement binary search **iteratively** on a sorted array. Return the index of `target` if found, otherwise -1. Do not use `Arrays.binarySearch`.\n\n**Key idea:** at each step, compare with the middle element and discard half the search space. Be careful with the mid-index to avoid integer overflow: use `left + (right - left) / 2`.\n\n**Complexity:** Time O(log n), Space O(1).',
    examples: 'Input: nums = [1, 3, 5, 7, 9, 11], target = 7\nOutput: 3\n\nInput: nums = [1, 3, 5, 7, 9, 11], target = 4\nOutput: -1',
    starterCode: null
  },

  {
    id: 'bubble-sort',
    title: 'Bubble Sort',
    category: 'Fundamentals',
    difficulty: 'Easy',
    link: 'https://www.geeksforgeeks.org/bubble-sort/',
    tags: ['Sorting', 'Fundamentals'],
    description: 'Sort an array in ascending order using **bubble sort**. Repeatedly step through the list, compare adjacent pairs, and swap them if they are in the wrong order. After each pass, the largest remaining element "bubbles" to its correct position at the end.\n\n**Optimization:** exit early if a full pass makes zero swaps — the array is already sorted.\n\n**Complexity:** Time O(n²), Space O(1). Stable sort.',
    examples: 'Input: [5, 2, 8, 1, 9]\nOutput: [1, 2, 5, 8, 9]',
    starterCode: null
  },

  {
    id: 'selection-sort',
    title: 'Selection Sort',
    category: 'Fundamentals',
    difficulty: 'Easy',
    link: 'https://www.geeksforgeeks.org/selection-sort/',
    tags: ['Sorting', 'Fundamentals'],
    description: 'Sort an array using **selection sort**. On each pass, find the minimum element in the unsorted portion and swap it into the next position of the sorted portion.\n\n**Complexity:** Time O(n²) in all cases, Space O(1). **Not** stable (swapping can reorder equal elements).',
    examples: 'Input: [64, 25, 12, 22, 11]\nOutput: [11, 12, 22, 25, 64]',
    starterCode: null
  },

  {
    id: 'insertion-sort',
    title: 'Insertion Sort',
    category: 'Fundamentals',
    difficulty: 'Easy',
    link: 'https://www.geeksforgeeks.org/insertion-sort/',
    tags: ['Sorting', 'Fundamentals'],
    description: 'Sort an array using **insertion sort**. Build the sorted portion one element at a time: take the next element and insert it into its correct position among the already-sorted prefix, shifting larger elements right.\n\n**Why it matters:** blazing fast on small or nearly-sorted inputs — real sorting libraries (Java, Python) fall back to insertion sort for small partitions.\n\n**Complexity:** Time O(n²) worst, O(n) on nearly-sorted. Space O(1). Stable.',
    examples: 'Input: [12, 11, 13, 5, 6]\nOutput: [5, 6, 11, 12, 13]',
    starterCode: null
  },

  {
    id: 'merge-sort',
    title: 'Merge Sort',
    category: 'Fundamentals',
    difficulty: 'Medium',
    link: 'https://www.geeksforgeeks.org/merge-sort/',
    tags: ['Sorting', 'Divide & Conquer', 'Recursion', 'Fundamentals'],
    description: 'Sort an array using **merge sort**. Recursively split the array into halves, sort each half, and merge the two sorted halves back together.\n\n**Why merge sort matters:** guaranteed O(n log n), stable, and the algorithm behind many production sorts (Java `Collections.sort` for objects, Python Timsort).\n\n**Complexity:** Time O(n log n) in all cases, Space O(n). Stable.',
    examples: 'Input: [38, 27, 43, 3, 9, 82, 10]\nOutput: [3, 9, 10, 27, 38, 43, 82]',
    starterCode: null
  },

  {
    id: 'quick-sort',
    title: 'Quick Sort',
    category: 'Fundamentals',
    difficulty: 'Medium',
    link: 'https://www.geeksforgeeks.org/quick-sort/',
    tags: ['Sorting', 'Divide & Conquer', 'Recursion', 'Partition', 'Fundamentals'],
    description: 'Sort an array using **quick sort**. Pick a pivot, partition the array so smaller elements go left and larger go right, then recursively sort the two partitions in place.\n\n**Why quick sort matters:** in-place, cache-friendly, fast in practice. Java\'s `Arrays.sort` for primitives uses a dual-pivot quicksort variant.\n\n**Watch-out:** a naive pivot on an already-sorted array degenerates to O(n²). Randomize the pivot or use median-of-three.\n\n**Complexity:** Time O(n log n) average, O(n²) worst case. Space O(log n) recursion. Not stable.',
    examples: 'Input: [10, 7, 8, 9, 1, 5]\nOutput: [1, 5, 7, 8, 9, 10]',
    starterCode: null
  },

  {
    id: 'heap-sort',
    title: 'Heap Sort',
    category: 'Fundamentals',
    difficulty: 'Medium',
    link: 'https://www.geeksforgeeks.org/heap-sort/',
    tags: ['Sorting', 'Heap', 'Priority Queue', 'Fundamentals'],
    description: 'Sort an array using **heap sort**. First build a max-heap from the array in place. Then repeatedly swap the root (the maximum) with the last unsorted element and "sift down" the new root to restore the heap property, shrinking the heap by one each time.\n\n**Why heap sort matters:** in-place O(n log n) with guaranteed worst case — unlike quicksort. Also the conceptual basis for priority-queue-driven algorithms.\n\n**Complexity:** Time O(n log n) worst case, Space O(1). Not stable.',
    examples: 'Input: [12, 11, 13, 5, 6, 7]\nOutput: [5, 6, 7, 11, 12, 13]',
    starterCode: null
  },

  // ═══════════════════════════════════════════
  // ═══  ARRAYS & STRINGS                  ═══
  // ═══════════════════════════════════════════

  {
    id: 'two-sum',
    title: 'Two Sum',
    category: 'Arrays',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/two-sum/',
    tags: ['Hash Map', 'Array'],
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    examples: 'Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: nums[0] + nums[1] = 2 + 7 = 9',
    starterCode: null
  },

  {
    id: 'best-time-to-buy-sell-stock',
    title: 'Best Time to Buy and Sell Stock',
    category: 'Arrays',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
    tags: ['Array', 'Sliding Window'],
    description: 'You are given an array `prices` where `prices[i]` is the price of a given stock on the i-th day. You want to maximize your profit by choosing a single day to buy and a single day to sell. Return the maximum profit. If no profit is possible, return 0.',
    examples: 'Input: prices = [7,1,5,3,6,4]\nOutput: 5\nExplanation: Buy on day 2 (price=1), sell on day 5 (price=6), profit = 6-1 = 5.',
    starterCode: null
  },

  {
    id: 'maximum-subarray',
    title: 'Maximum Subarray (Kadane\'s Algorithm)',
    category: 'Arrays',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/maximum-subarray/',
    tags: ['Array', 'Dynamic Programming', 'Divide and Conquer'],
    description: 'Given an integer array `nums`, find the subarray with the largest sum, and return its sum. A subarray is a contiguous non-empty sequence of elements within an array.',
    examples: 'Input: nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6\nExplanation: The subarray [4,-1,2,1] has the largest sum 6.',
    starterCode: null
  },

  {
    id: 'product-except-self',
    title: 'Product of Array Except Self',
    category: 'Arrays',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/product-of-array-except-self/',
    tags: ['Array', 'Prefix Sum'],
    description: 'Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`. You must solve it without using division and in O(n) time.',
    examples: 'Input: nums = [1,2,3,4]\nOutput: [24,12,8,6]',
    starterCode: null
  },

  {
    id: 'merge-intervals',
    title: 'Merge Intervals',
    category: 'Arrays',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/merge-intervals/',
    tags: ['Array', 'Sorting'],
    description: 'Given an array of intervals where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.',
    examples: 'Input: intervals = [[1,3],[2,6],[8,10],[15,18]]\nOutput: [[1,6],[8,10],[15,18]]\nExplanation: [1,3] and [2,6] overlap, merged into [1,6].',
    starterCode: null
  },

  {
    id: 'valid-anagram',
    title: 'Valid Anagram',
    category: 'Strings',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/valid-anagram/',
    tags: ['String', 'Hash Map', 'Sorting'],
    description: 'Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise. An anagram is a word formed by rearranging the letters of another word using all the original letters exactly once.',
    examples: 'Input: s = "anagram", t = "nagaram"\nOutput: true',
    starterCode: null
  },

  {
    id: 'longest-substring-without-repeating',
    title: 'Longest Substring Without Repeating Characters',
    category: 'Strings',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    tags: ['String', 'Sliding Window', 'Hash Map'],
    description: 'Given a string `s`, find the length of the longest substring without repeating characters.',
    examples: 'Input: s = "abcabcbb"\nOutput: 3\nExplanation: The answer is "abc", with length 3.',
    starterCode: null
  },

  {
    id: 'group-anagrams',
    title: 'Group Anagrams',
    category: 'Strings',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/group-anagrams/',
    tags: ['String', 'Hash Map', 'Sorting'],
    description: 'Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.',
    examples: 'Input: strs = ["eat","tea","tan","ate","nat","bat"]\nOutput: [["bat"],["nat","tan"],["ate","eat","tea"]]',
    starterCode: null
  },

  // ═══════════════════════════════════════════
  // ═══  LINKED LISTS                      ═══
  // ═══════════════════════════════════════════

  {
    id: 'reverse-linked-list',
    title: 'Reverse Linked List',
    category: 'Linked Lists',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/reverse-linked-list/',
    tags: ['Linked List', 'Recursion'],
    description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    examples: 'Input: head = [1,2,3,4,5]\nOutput: [5,4,3,2,1]',
    starterCode: null
  },

  {
    id: 'merge-two-sorted-lists',
    title: 'Merge Two Sorted Lists',
    category: 'Linked Lists',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/merge-two-sorted-lists/',
    tags: ['Linked List', 'Recursion'],
    description: 'Merge two sorted linked lists and return it as a sorted list. The list should be made by splicing together the nodes of the first two lists.',
    examples: 'Input: list1 = [1,2,4], list2 = [1,3,4]\nOutput: [1,1,2,3,4,4]',
    starterCode: null
  },

  {
    id: 'linked-list-cycle',
    title: 'Linked List Cycle',
    category: 'Linked Lists',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/linked-list-cycle/',
    tags: ['Linked List', 'Two Pointers', 'Floyd\'s Cycle'],
    description: 'Given head of a linked list, determine if the linked list has a cycle in it. There is a cycle if some node can be reached again by continuously following the next pointer. Solve in O(1) space.',
    examples: 'Input: head = [3,2,0,-4], pos = 1 (cycle at index 1)\nOutput: true',
    starterCode: null
  },

  // ═══════════════════════════════════════════
  // ═══  TREES                             ═══
  // ═══════════════════════════════════════════

  {
    id: 'max-depth-binary-tree',
    title: 'Maximum Depth of Binary Tree',
    category: 'Trees',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/',
    tags: ['Tree', 'DFS', 'BFS', 'Recursion'],
    description: 'Given the root of a binary tree, return its maximum depth. A binary tree\'s maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.',
    examples: 'Input: root = [3,9,20,null,null,15,7]\nOutput: 3',
    starterCode: null
  },

  {
    id: 'validate-bst',
    title: 'Validate Binary Search Tree',
    category: 'Trees',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/validate-binary-search-tree/',
    tags: ['Tree', 'DFS', 'BST'],
    description: 'Given the root of a binary tree, determine if it is a valid binary search tree (BST). A valid BST has: left subtree values < node, right subtree values > node, and both subtrees are also BSTs.',
    examples: 'Input: root = [2,1,3]\nOutput: true\n\nInput: root = [5,1,4,null,null,3,6]\nOutput: false (4 is in the right subtree of 5 but 4 < 5)',
    starterCode: null
  },

  {
    id: 'level-order-traversal',
    title: 'Binary Tree Level Order Traversal',
    category: 'Trees',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/binary-tree-level-order-traversal/',
    tags: ['Tree', 'BFS', 'Queue'],
    description: 'Given the root of a binary tree, return the level order traversal of its nodes\' values. (i.e., from left to right, level by level).',
    examples: 'Input: root = [3,9,20,null,null,15,7]\nOutput: [[3],[9,20],[15,7]]',
    starterCode: null
  },

  {
    id: 'lowest-common-ancestor',
    title: 'Lowest Common Ancestor of a Binary Tree',
    category: 'Trees',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/',
    tags: ['Tree', 'DFS', 'Recursion'],
    description: 'Given a binary tree, find the lowest common ancestor (LCA) of two given nodes. The LCA is the lowest node that has both p and q as descendants (a node can be a descendant of itself).',
    examples: 'Input: root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1\nOutput: 3',
    starterCode: null
  },

  // ═══════════════════════════════════════════
  // ═══  GRAPHS                            ═══
  // ═══════════════════════════════════════════

  {
    id: 'number-of-islands',
    title: 'Number of Islands',
    category: 'Graphs',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/number-of-islands/',
    tags: ['Graph', 'BFS', 'DFS', 'Matrix'],
    description: 'Given an m x n 2D binary grid which represents a map of \'1\'s (land) and \'0\'s (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.',
    examples: 'Input: grid = [\n  ["1","1","0","0","0"],\n  ["1","1","0","0","0"],\n  ["0","0","1","0","0"],\n  ["0","0","0","1","1"]\n]\nOutput: 3',
    starterCode: null
  },

  {
    id: 'clone-graph',
    title: 'Clone Graph',
    category: 'Graphs',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/clone-graph/',
    tags: ['Graph', 'BFS', 'DFS', 'Hash Map'],
    description: 'Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph. Each node has a value and a list of neighbors.',
    examples: 'Input: adjList = [[2,4],[1,3],[2,4],[1,3]]\nOutput: [[2,4],[1,3],[2,4],[1,3]] (deep copy)',
    starterCode: null
  },

  {
    id: 'course-schedule',
    title: 'Course Schedule (Topological Sort)',
    category: 'Graphs',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/course-schedule/',
    tags: ['Graph', 'Topological Sort', 'BFS', 'DFS'],
    description: 'There are `numCourses` courses labeled from 0 to numCourses-1. You are given prerequisites pairs where `prerequisites[i] = [a, b]` means you must take course b before course a. Return true if you can finish all courses (i.e., no cycle in the dependency graph).',
    examples: 'Input: numCourses = 2, prerequisites = [[1,0]]\nOutput: true (take course 0 then 1)\n\nInput: numCourses = 2, prerequisites = [[1,0],[0,1]]\nOutput: false (cycle!)',
    starterCode: null
  },

  {
    id: 'word-ladder',
    title: 'Word Ladder',
    category: 'Graphs',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/word-ladder/',
    tags: ['Graph', 'BFS', 'String'],
    description: 'Given two words, `beginWord` and `endWord`, and a dictionary `wordList`, return the number of words in the shortest transformation sequence from beginWord to endWord. Each transformation changes only one letter, and each transformed word must exist in the word list.',
    examples: 'Input: beginWord = "hit", endWord = "cog",\n       wordList = ["hot","dot","dog","lot","log","cog"]\nOutput: 5 (hit -> hot -> dot -> dog -> cog)',
    starterCode: null
  },

  // ═══════════════════════════════════════════
  // ═══  DYNAMIC PROGRAMMING               ═══
  // ═══════════════════════════════════════════

  {
    id: 'climbing-stairs',
    title: 'Climbing Stairs',
    category: 'Dynamic Programming',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/climbing-stairs/',
    tags: ['DP', 'Fibonacci'],
    description: 'You are climbing a staircase with `n` steps. Each time you can climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    examples: 'Input: n = 3\nOutput: 3\nExplanation: 1+1+1, 1+2, 2+1',
    starterCode: null
  },

  {
    id: 'coin-change',
    title: 'Coin Change',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/coin-change/',
    tags: ['DP', 'BFS'],
    description: 'Given an array of coin denominations and a total `amount`, return the fewest number of coins needed to make up that amount. If it cannot be made, return -1. You have infinite coins of each denomination.',
    examples: 'Input: coins = [1,5,11], amount = 11\nOutput: 1 (one 11-coin)\n\nInput: coins = [2], amount = 3\nOutput: -1',
    starterCode: null
  },

  {
    id: 'longest-increasing-subsequence',
    title: 'Longest Increasing Subsequence',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/longest-increasing-subsequence/',
    tags: ['DP', 'Binary Search'],
    description: 'Given an integer array `nums`, return the length of the longest strictly increasing subsequence. A subsequence does not need to be contiguous.',
    examples: 'Input: nums = [10,9,2,5,3,7,101,18]\nOutput: 4 ([2,3,7,101])',
    starterCode: null
  },

  {
    id: 'word-break',
    title: 'Word Break',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/word-break/',
    tags: ['DP', 'String', 'Hash Set'],
    description: 'Given a string `s` and a dictionary of strings `wordDict`, return true if `s` can be segmented into a space-separated sequence of one or more dictionary words.',
    examples: 'Input: s = "leetcode", wordDict = ["leet","code"]\nOutput: true ("leet code")',
    starterCode: null
  },

  // ═══════════════════════════════════════════
  // ═══  SORTING & SEARCHING               ═══
  // ═══════════════════════════════════════════

  {
    id: 'binary-search',
    title: 'Binary Search',
    category: 'Sorting & Searching',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/binary-search/',
    tags: ['Binary Search', 'Array'],
    description: 'Given a sorted array of integers `nums` and a target value, return the index of target if found. Otherwise, return -1. You must write an O(log n) algorithm.',
    examples: 'Input: nums = [-1,0,3,5,9,12], target = 9\nOutput: 4',
    starterCode: null
  },

  {
    id: 'search-rotated-sorted-array',
    title: 'Search in Rotated Sorted Array',
    category: 'Sorting & Searching',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/search-in-rotated-sorted-array/',
    tags: ['Binary Search', 'Array'],
    description: 'Given a rotated sorted array (e.g., [4,5,6,7,0,1,2] was [0,1,2,4,5,6,7] rotated at pivot index 3), search for a target in O(log n) time.',
    examples: 'Input: nums = [4,5,6,7,0,1,2], target = 0\nOutput: 4',
    starterCode: null
  },

  {
    id: 'kth-largest-element',
    title: 'Kth Largest Element in an Array',
    category: 'Sorting & Searching',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/kth-largest-element-in-an-array/',
    tags: ['Sorting', 'Heap', 'Quickselect'],
    description: 'Given an integer array `nums` and an integer `k`, return the kth largest element. Note that it is the kth largest element in the sorted order, not the kth distinct element.',
    examples: 'Input: nums = [3,2,1,5,6,4], k = 2\nOutput: 5',
    starterCode: null
  },

  // ═══════════════════════════════════════════
  // ═══  STACKS & QUEUES                   ═══
  // ═══════════════════════════════════════════

  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    category: 'Stacks & Queues',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/valid-parentheses/',
    tags: ['Stack', 'String'],
    description: 'Given a string `s` containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid. An input string is valid if: open brackets are closed by the same type, and in the correct order.',
    examples: 'Input: s = "()[]{}"\nOutput: true\n\nInput: s = "(]"\nOutput: false',
    starterCode: null
  },

  {
    id: 'min-stack',
    title: 'Min Stack',
    category: 'Stacks & Queues',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/min-stack/',
    tags: ['Stack', 'Design'],
    description: 'Design a stack that supports push, pop, top, and retrieving the minimum element in constant time O(1).',
    examples: 'MinStack ms = new MinStack();\nms.push(-2); ms.push(0); ms.push(-3);\nms.getMin(); // -3\nms.pop();\nms.top();    // 0\nms.getMin(); // -2',
    starterCode: null
  },

  // ═══════════════════════════════════════════
  // ═══  HASH MAPS                         ═══
  // ═══════════════════════════════════════════

  {
    id: 'top-k-frequent-elements',
    title: 'Top K Frequent Elements',
    category: 'Hash Maps',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/top-k-frequent-elements/',
    tags: ['Hash Map', 'Heap', 'Bucket Sort'],
    description: 'Given an integer array `nums` and an integer `k`, return the `k` most frequent elements. You may return the answer in any order.',
    examples: 'Input: nums = [1,1,1,2,2,3], k = 2\nOutput: [1,2]',
    starterCode: null
  },

  {
    id: 'lru-cache',
    title: 'LRU Cache',
    category: 'Hash Maps',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/lru-cache/',
    tags: ['Hash Map', 'Linked List', 'Design'],
    description: 'Design a data structure that follows the Least Recently Used (LRU) cache constraints. Implement get(key) and put(key, value) — both must run in O(1) average time.',
    examples: 'LRUCache cache = new LRUCache(2);\ncache.put(1,1); cache.put(2,2);\ncache.get(1);    // 1\ncache.put(3,3);  // evicts key 2\ncache.get(2);    // -1 (not found)',
    starterCode: null
  },

  // ═══════════════════════════════════════════
  // ═══  RECURSION & BACKTRACKING           ═══
  // ═══════════════════════════════════════════

  {
    id: 'subsets',
    title: 'Subsets (Power Set)',
    category: 'Backtracking',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/subsets/',
    tags: ['Backtracking', 'Recursion', 'Bit Manipulation'],
    description: 'Given an integer array `nums` of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets.',
    examples: 'Input: nums = [1,2,3]\nOutput: [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]',
    starterCode: null
  },

  {
    id: 'permutations',
    title: 'Permutations',
    category: 'Backtracking',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/permutations/',
    tags: ['Backtracking', 'Recursion'],
    description: 'Given an array `nums` of distinct integers, return all the possible permutations. You can return the answer in any order.',
    examples: 'Input: nums = [1,2,3]\nOutput: [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]',
    starterCode: null
  },

  // ═══════════════════════════════════════════
  // ═══  TWO POINTERS / SLIDING WINDOW      ═══
  // ═══════════════════════════════════════════

  {
    id: 'container-with-most-water',
    title: 'Container With Most Water',
    category: 'Two Pointers',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/container-with-most-water/',
    tags: ['Two Pointers', 'Greedy'],
    description: 'Given n non-negative integers `height` where each represents a vertical line at position i with height `height[i]`, find two lines that together with the x-axis form a container that holds the most water.',
    examples: 'Input: height = [1,8,6,2,5,4,8,3,7]\nOutput: 49',
    starterCode: null
  },

  {
    id: 'three-sum',
    title: '3Sum',
    category: 'Two Pointers',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/3sum/',
    tags: ['Two Pointers', 'Sorting', 'Array'],
    description: 'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j != k and nums[i] + nums[j] + nums[k] == 0. The solution set must not contain duplicate triplets.',
    examples: 'Input: nums = [-1,0,1,2,-1,-4]\nOutput: [[-1,-1,2],[-1,0,1]]',
    starterCode: null
  },

  {
    id: 'minimum-window-substring',
    title: 'Minimum Window Substring',
    category: 'Two Pointers',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/minimum-window-substring/',
    tags: ['Sliding Window', 'Hash Map', 'String'],
    description: 'Given two strings `s` and `t`, return the minimum window substring of `s` such that every character in `t` (including duplicates) is included. If no such substring exists, return "".',
    examples: 'Input: s = "ADOBECODEBANC", t = "ABC"\nOutput: "BANC"',
    starterCode: null
  },

  // ═══════════════════════════════════════════
  // ═══  INTERVALS & GREEDY                ═══
  // ═══════════════════════════════════════════

  {
    id: 'meeting-rooms-ii',
    title: 'Meeting Rooms II (Min Rooms Needed)',
    category: 'Intervals',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/meeting-rooms-ii/',
    tags: ['Sorting', 'Heap', 'Intervals'],
    description: 'Given an array of meeting time intervals `[[start1,end1],[start2,end2],...]`, find the minimum number of conference rooms required.',
    examples: 'Input: intervals = [[0,30],[5,10],[15,20]]\nOutput: 2 (meetings [0,30] and [5,10] overlap)',
    starterCode: null
  },

  // ═══════════════════════════════════════════════════════
  // ═══  BATCH 1 — 40 added problems (Arrays → Stacks)  ═══
  // ═══════════════════════════════════════════════════════

  {
    id: 'majority-element',
    title: 'Majority Element',
    category: 'Arrays',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/majority-element/',
    tags: ['Array', 'Hash Map', 'Boyer-Moore', 'Divide & Conquer'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Bloomberg'],
    description: 'Given an array `nums` of size n, return the **majority element** — the element that appears more than ⌊n/2⌋ times. You may assume the majority element always exists.\n\n**Best solution:** Boyer-Moore Voting — O(n) time, O(1) space. Maintain a candidate and a counter; reset the candidate when count hits zero.',
    examples: 'Input: nums = [3,2,3]\nOutput: 3\n\nInput: nums = [2,2,1,1,1,2,2]\nOutput: 2',
    starterCode: null
  },

  {
    id: 'majority-element-ii',
    title: 'Majority Element II',
    category: 'Arrays',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/majority-element-ii/',
    tags: ['Array', 'Hash Map', 'Boyer-Moore', 'Counting'],
    companies: ['Amazon', 'Google', 'Microsoft'],
    description: 'Given an integer array `nums` of size n, return **all** elements that appear more than ⌊n/3⌋ times. By the pigeonhole principle there can be **at most 2** such elements.\n\n**Best solution:** generalized Boyer-Moore with two candidates and two counters — O(n) time, O(1) space.',
    examples: 'Input: nums = [3,2,3]\nOutput: [3]\n\nInput: nums = [1,1,1,3,3,2,2,2]\nOutput: [1, 2]',
    starterCode: null
  },

  {
    id: 'bulls-and-cows',
    title: 'Bulls and Cows',
    category: 'Strings',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/bulls-and-cows/',
    tags: ['String', 'Hash Map', 'Counting'],
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: 'You play the **Bulls and Cows** guessing game with your friend. Given the secret number and your guess (both as digit strings of equal length), return a hint string formatted as `"xAyB"`, where `x` is the number of **bulls** (digits in the right position) and `y` is the number of **cows** (digits present but in the wrong position).\n\nA digit cannot be a bull and a cow simultaneously, and each digit can be matched at most once.',
    examples: 'Input: secret = "1807", guess = "7810"\nOutput: "1A3B"  (Bulls: 8; Cows: 7,1,0)\n\nInput: secret = "1123", guess = "0111"\nOutput: "1A1B"',
    starterCode: null
  },

  {
    id: 'valid-sudoku',
    title: 'Valid Sudoku',
    category: 'Matrix',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/valid-sudoku/',
    tags: ['Array', 'Hash Map', 'Matrix'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple'],
    description: 'Determine if a partially-filled 9×9 Sudoku board is valid. Only filled cells need to be checked. Validity requires:\n1. Each row contains digits 1–9 with no repetition.\n2. Each column contains digits 1–9 with no repetition.\n3. Each of the nine 3×3 sub-boxes contains digits 1–9 with no repetition.\n\nThe board may be partially filled — empty cells are `.`.',
    examples: 'Input: a fully valid 9×9 grid\nOutput: true',
    starterCode: null
  },

  {
    id: 'spiral-matrix',
    title: 'Spiral Matrix',
    category: 'Matrix',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/spiral-matrix/',
    tags: ['Array', 'Matrix', 'Simulation'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta'],
    description: 'Given an m × n matrix, return all elements in **spiral order** — start at the top-left, walk right, then down, then left, then up, peeling layers inward.',
    examples: 'Input: [[1,2,3],[4,5,6],[7,8,9]]\nOutput: [1,2,3,6,9,8,7,4,5]',
    starterCode: null
  },

  {
    id: 'rotate-image',
    title: 'Rotate Image',
    category: 'Matrix',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/rotate-image/',
    tags: ['Array', 'Matrix', 'Math'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta'],
    description: 'Rotate an n × n matrix 90° **clockwise** in place. You must modify the input directly — do not allocate a second matrix.\n\n**Standard trick:** transpose, then reverse each row.',
    examples: 'Input: [[1,2,3],[4,5,6],[7,8,9]]\nOutput: [[7,4,1],[8,5,2],[9,6,3]]',
    starterCode: null
  },

  {
    id: 'diagonal-traverse',
    title: 'Diagonal Traverse',
    category: 'Matrix',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/diagonal-traverse/',
    tags: ['Array', 'Matrix', 'Simulation'],
    companies: ['Amazon', 'Microsoft', 'Apple', 'Walmart'],
    description: 'Given an m × n matrix, return all elements in **anti-diagonal zig-zag order** — alternate sweeping each anti-diagonal up-right then down-left.',
    examples: 'Input: [[1,2,3],[4,5,6],[7,8,9]]\nOutput: [1,2,4,7,5,3,6,8,9]',
    starterCode: null
  },

  {
    id: 'contains-duplicate',
    title: 'Contains Duplicate',
    category: 'Arrays',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/contains-duplicate/',
    tags: ['Array', 'Hash Set', 'Sorting'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple'],
    description: 'Given an integer array `nums`, return `true` if any value appears at least twice in the array, and `false` if every element is distinct.\n\n**Best approach:** HashSet — add each element; return true on first duplicate.',
    examples: 'Input: nums = [1,2,3,1]\nOutput: true\n\nInput: nums = [1,2,3,4]\nOutput: false',
    starterCode: null
  },

  {
    id: 'find-players-zero-or-one-losses',
    title: 'Find Players With Zero or One Losses',
    category: 'Hash Maps',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/find-players-with-zero-or-one-losses/',
    tags: ['Array', 'Hash Map', 'Sorting', 'Counting'],
    companies: ['Amazon', 'Google'],
    description: 'You are given a list of `matches` where `matches[i] = [winner_i, loser_i]`. Return a 2-element list `[answer1, answer2]` where:\n- `answer1` = list of all players that have **not lost any** match.\n- `answer2` = list of all players that have lost **exactly one** match.\n\nBoth lists must be sorted in increasing order. Players not appearing in any match are not considered.',
    examples: 'Input: [[1,3],[2,3],[3,6],[5,6],[5,7],[4,5],[4,8],[4,9],[10,4],[10,9]]\nOutput: [[1,2,10], [4,5,7,8]]',
    starterCode: null
  },

  {
    id: 'sort-an-array',
    title: 'Sort an Array',
    category: 'Sorting & Searching',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/sort-an-array/',
    tags: ['Array', 'Sorting', 'Divide & Conquer', 'Heap', 'Merge Sort'],
    companies: ['Amazon', 'Google', 'Microsoft'],
    description: 'Given an integer array `nums`, sort it in ascending order in O(n log n) time and use the smallest space complexity possible. **Do not** use `Arrays.sort()` — implement merge sort, quicksort, or heap sort yourself.',
    examples: 'Input: nums = [5,2,3,1]\nOutput: [1,2,3,5]\n\nInput: nums = [5,1,1,2,0,0]\nOutput: [0,0,1,1,2,5]',
    starterCode: null
  },

  {
    id: 'sort-characters-by-frequency',
    title: 'Sort Characters By Frequency',
    category: 'Strings',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/sort-characters-by-frequency/',
    tags: ['String', 'Hash Map', 'Sorting', 'Heap', 'Bucket Sort'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Bloomberg'],
    description: 'Given a string `s`, sort it in **decreasing order based on character frequency**. Characters with the same frequency may appear in any order.\n\n**Approach:** count frequencies, then sort characters by count (descending) and concatenate.',
    examples: 'Input: s = "tree"\nOutput: "eert" or "eetr"\n\nInput: s = "cccaaa"\nOutput: "aaaccc" or "cccaaa"',
    starterCode: null
  },

  {
    id: 'non-overlapping-intervals',
    title: 'Non-overlapping Intervals',
    category: 'Intervals',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/non-overlapping-intervals/',
    tags: ['Array', 'Greedy', 'Sorting', 'Intervals', 'DP'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Salesforce'],
    description: 'Given an array of intervals `intervals[i] = [start_i, end_i]`, return the **minimum number of intervals you need to remove** to make the rest non-overlapping.\n\n**Greedy:** sort by end time; keep an interval if it starts at or after the last kept end; otherwise count it as a removal.',
    examples: 'Input: intervals = [[1,2],[2,3],[3,4],[1,3]]\nOutput: 1  (Remove [1,3])\n\nInput: intervals = [[1,2],[1,2],[1,2]]\nOutput: 2',
    starterCode: null
  },

  {
    id: 'find-first-and-last-position',
    title: 'Find First and Last Position of Element in Sorted Array',
    category: 'Sorting & Searching',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/',
    tags: ['Array', 'Binary Search'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta'],
    description: 'Given a **sorted** array of integers `nums` and a `target`, find the starting and ending position of `target` in the array. If not found, return `[-1, -1]`. Algorithm must run in O(log n) time.',
    examples: 'Input: nums = [5,7,7,8,8,10], target = 8\nOutput: [3, 4]\n\nInput: nums = [5,7,7,8,8,10], target = 6\nOutput: [-1, -1]',
    starterCode: null
  },

  {
    id: 'peak-index-mountain-array',
    title: 'Peak Index in a Mountain Array',
    category: 'Sorting & Searching',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/peak-index-in-a-mountain-array/',
    tags: ['Array', 'Binary Search'],
    companies: ['Amazon', 'Google', 'Microsoft'],
    description: 'A **mountain array** strictly increases then strictly decreases. Given a guaranteed mountain array, find and return the index `i` of the peak (where `arr[i-1] < arr[i] > arr[i+1]`). Solve in O(log n).',
    examples: 'Input: arr = [0,1,0]\nOutput: 1\n\nInput: arr = [0,2,1,0]\nOutput: 1\n\nInput: arr = [0,10,5,2]\nOutput: 1',
    starterCode: null
  },

  {
    id: 'count-negative-numbers-sorted-matrix',
    title: 'Count Negative Numbers in a Sorted Matrix',
    category: 'Matrix',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/count-negative-numbers-in-a-sorted-matrix/',
    tags: ['Array', 'Binary Search', 'Matrix'],
    companies: ['Amazon', 'Microsoft'],
    description: 'Given an m × n matrix sorted in **non-increasing order both row-wise and column-wise**, return the count of negative numbers.\n\n**Optimal:** start at top-right (or bottom-left). When you see a negative, count the rest of the row, then move down. Otherwise move left/right. O(m + n).',
    examples: 'Input: [[4,3,2,-1],[3,2,1,-1],[1,1,-1,-2],[-1,-1,-2,-3]]\nOutput: 8',
    starterCode: null
  },

  {
    id: 'search-2d-matrix',
    title: 'Search a 2D Matrix',
    category: 'Matrix',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/search-a-2d-matrix/',
    tags: ['Array', 'Binary Search', 'Matrix'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple'],
    description: 'Given an m × n matrix where each row is sorted left-to-right, and the **first integer of each row is greater than the last integer of the previous row**, search for a target value. Return `true` if found. Solve in O(log(m·n)).',
    examples: 'Input: matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3\nOutput: true',
    starterCode: null
  },

  {
    id: 'koko-eating-bananas',
    title: 'Koko Eating Bananas',
    category: 'Sorting & Searching',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/koko-eating-bananas/',
    tags: ['Array', 'Binary Search', 'Search Space Reduction'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Bloomberg'],
    description: 'Koko has `n` piles of bananas, the i-th pile has `piles[i]` bananas. The guards return in `h` hours. Each hour, Koko picks a pile and eats up to `k` bananas; if the pile has less, she finishes it but stops for that hour. Return the **minimum integer k** such that Koko can finish all bananas in `h` hours.\n\n**Solve via binary search** over k in [1, max(piles)] — feasibility test is sum(ceil(p / k)) ≤ h.',
    examples: 'Input: piles = [3,6,7,11], h = 8\nOutput: 4\n\nInput: piles = [30,11,23,4,20], h = 5\nOutput: 30',
    starterCode: null
  },

  {
    id: 'find-smallest-divisor-given-threshold',
    title: 'Find the Smallest Divisor Given a Threshold',
    category: 'Sorting & Searching',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/find-the-smallest-divisor-given-a-threshold/',
    tags: ['Array', 'Binary Search'],
    companies: ['Amazon', 'Google'],
    description: 'Given an integer array `nums` and an integer `threshold`, return the **smallest positive integer divisor** such that `sum(ceil(nums[i] / divisor)) ≤ threshold`. The threshold is guaranteed to be ≥ nums.length.\n\n**Solve via binary search** on the divisor in [1, max(nums)].',
    examples: 'Input: nums = [1,2,5,9], threshold = 6\nOutput: 5\n\nInput: nums = [44,22,33,11,1], threshold = 5\nOutput: 44',
    starterCode: null
  },

  {
    id: 'append-characters-to-string-make-subsequence',
    title: 'Append Characters to String to Make Subsequence',
    category: 'Two Pointers',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/append-characters-to-string-to-make-subsequence/',
    tags: ['String', 'Two Pointers', 'Greedy'],
    companies: ['Amazon', 'Google'],
    description: 'You are given two strings `s` and `t`. Return the **minimum number of characters that need to be appended to the end of `s`** so that `t` becomes a subsequence of the resulting string.\n\n**Approach:** two-pointer scan — count how many characters of `t` you can match in order through `s`; the rest need to be appended.',
    examples: 'Input: s = "coaching", t = "coding"\nOutput: 4  (Append "ding")\n\nInput: s = "abcde", t = "a"\nOutput: 0',
    starterCode: null
  },

  {
    id: 'subarray-product-less-than-k',
    title: 'Subarray Product Less Than K',
    category: 'Sliding Window',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/subarray-product-less-than-k/',
    tags: ['Array', 'Sliding Window', 'Two Pointers'],
    companies: ['Amazon', 'Google', 'Bloomberg'],
    description: 'Given an array of positive integers `nums` and an integer `k`, return the number of contiguous **subarrays where the product of all the elements is strictly less than k**.\n\n**Approach:** sliding window — maintain a running product; when it ≥ k, shrink from the left. Each window contributes (right - left + 1) new subarrays.',
    examples: 'Input: nums = [10,5,2,6], k = 100\nOutput: 8  ([10],[5],[2],[6],[10,5],[5,2],[2,6],[5,2,6])\n\nInput: nums = [1,2,3], k = 0\nOutput: 0',
    starterCode: null
  },

  {
    id: 'longest-repeating-character-replacement',
    title: 'Longest Repeating Character Replacement',
    category: 'Sliding Window',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/longest-repeating-character-replacement/',
    tags: ['String', 'Sliding Window', 'Hash Map'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple'],
    description: 'Given a string `s` and an integer `k`, return the length of the **longest substring** containing the same letter you can get after performing at most `k` character replacements.\n\n**Sliding window:** expand right; for each window, if `windowSize - maxFreqChar > k`, shrink left. Track the max valid window.',
    examples: 'Input: s = "ABAB", k = 2\nOutput: 4\n\nInput: s = "AABABBA", k = 1\nOutput: 4',
    starterCode: null
  },

  {
    id: 'maximum-product-subarray',
    title: 'Maximum Product Subarray',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/maximum-product-subarray/',
    tags: ['Array', 'Dynamic Programming'],
    companies: ['Amazon', 'Google', 'Microsoft', 'LinkedIn'],
    description: 'Given an integer array `nums`, find a contiguous **non-empty subarray** within the array that has the **largest product**, and return that product.\n\n**Trick:** track both maxSoFar and minSoFar at each position because a negative number can flip the sign.',
    examples: 'Input: nums = [2,3,-2,4]\nOutput: 6  (subarray [2,3])\n\nInput: nums = [-2,0,-1]\nOutput: 0',
    starterCode: null
  },

  {
    id: 'removing-stars-from-string',
    title: 'Removing Stars From a String',
    category: 'Stacks & Queues',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/removing-stars-from-a-string/',
    tags: ['String', 'Stack', 'Simulation'],
    companies: ['Amazon', 'Google'],
    description: 'You are given a string `s` containing letters and `*` characters. With one operation, you can remove the closest non-`*` character to the left of any `*`, then remove the `*` itself. Return the string after all stars are processed (it is guaranteed to be possible).',
    examples: 'Input: s = "leet**cod*e"\nOutput: "lecoe"\n\nInput: s = "erase*****"\nOutput: ""',
    starterCode: null
  },

  {
    id: 'evaluate-reverse-polish-notation',
    title: 'Evaluate Reverse Polish Notation',
    category: 'Stacks & Queues',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/',
    tags: ['Array', 'Math', 'Stack'],
    companies: ['Amazon', 'Google', 'LinkedIn', 'Microsoft'],
    description: 'Evaluate an arithmetic expression in **Reverse Polish Notation** (postfix). Operators are `+`, `-`, `*`, `/`. Operands are integers. Division truncates toward zero.\n\n**Stack approach:** push operands; on operator, pop top two, apply, push result.',
    examples: 'Input: tokens = ["2","1","+","3","*"]\nOutput: 9  ((2 + 1) * 3)\n\nInput: tokens = ["4","13","5","/","+"]\nOutput: 6  (4 + (13 / 5))',
    starterCode: null
  },

  {
    id: 'longest-valid-parentheses',
    title: 'Longest Valid Parentheses',
    category: 'Stacks & Queues',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/longest-valid-parentheses/',
    tags: ['String', 'Stack', 'Dynamic Programming'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    description: 'Given a string containing just `(` and `)`, return the **length of the longest valid (well-formed) parentheses substring**.\n\n**Stack approach:** push -1 as a sentinel, push indices on `(`, pop on `)` and compute length = i - stack.top().',
    examples: 'Input: s = "(()"\nOutput: 2  ("()")\n\nInput: s = ")()())"\nOutput: 4  ("()()")',
    starterCode: null
  },

  {
    id: 'next-greater-element-ii',
    title: 'Next Greater Element II',
    category: 'Stacks & Queues',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/next-greater-element-ii/',
    tags: ['Array', 'Monotonic Stack', 'Circular Array'],
    companies: ['Amazon', 'Google', 'Bloomberg'],
    description: 'Given a **circular** integer array `nums`, return an array where `result[i]` is the **next greater element** for `nums[i]` (the next element traversing circularly that is strictly greater). If none exists, the answer is -1.\n\n**Approach:** monotonic decreasing stack of indices; iterate twice (or treat indices modulo n).',
    examples: 'Input: nums = [1,2,1]\nOutput: [2,-1,2]\n\nInput: nums = [1,2,3,4,3]\nOutput: [2,3,4,-1,4]',
    starterCode: null
  },

  {
    id: 'asteroid-collision',
    title: 'Asteroid Collision',
    category: 'Stacks & Queues',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/asteroid-collision/',
    tags: ['Array', 'Stack', 'Simulation'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    description: 'Given an array of integers `asteroids`, where each integer is the asteroid\'s **size and direction** (positive = right, negative = left), return the state of the asteroids after all collisions. When two asteroids collide:\n- The **smaller** one explodes.\n- If equal size, **both** explode.\n- Two asteroids moving in the same direction never collide.',
    examples: 'Input: [5,10,-5]\nOutput: [5,10]  (10 vs -5 → 10 wins)\n\nInput: [8,-8]\nOutput: []\n\nInput: [10,2,-5]\nOutput: [10]',
    starterCode: null
  },

  {
    id: 'largest-rectangle-histogram',
    title: 'Largest Rectangle in Histogram',
    category: 'Stacks & Queues',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/largest-rectangle-in-histogram/',
    tags: ['Array', 'Monotonic Stack'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta'],
    description: 'Given an array `heights` representing the heights of bars in a histogram (each bar has width 1), return the **area of the largest rectangle** that can be formed within the histogram.\n\n**Optimal:** monotonic increasing stack of indices — when popping, compute the rectangle height = popped, width spans between previous-stack-top and current index.',
    examples: 'Input: heights = [2,1,5,6,2,3]\nOutput: 10  (the rectangle of height 5 spanning indices 2-3 has area 10)',
    starterCode: null
  },

  {
    id: 'find-winner-circular-game',
    title: 'Find the Winner of the Circular Game',
    category: 'Stacks & Queues',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/find-the-winner-of-the-circular-game/',
    tags: ['Array', 'Math', 'Recursion', 'Queue', 'Simulation', 'Josephus'],
    companies: ['Amazon', 'Google'],
    description: 'There are `n` friends sitting in a circle, numbered 1 to n. Starting from friend 1, the game proceeds clockwise: count `k` friends (including the starting friend) and remove that friend; the next person becomes the new starting point. Return the **winner** (the last remaining friend).\n\n**This is the classic Josephus problem.** Solvable with a simulation queue in O(n·k), or recursively in O(n).',
    examples: 'Input: n = 5, k = 2\nOutput: 3\n\nInput: n = 6, k = 5\nOutput: 1',
    starterCode: null
  },

  {
    id: 'implement-queue-using-stacks',
    title: 'Implement Queue using Stacks',
    category: 'Stacks & Queues',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/implement-queue-using-stacks/',
    tags: ['Stack', 'Queue', 'Design'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Bloomberg'],
    description: 'Implement a first-in-first-out (FIFO) queue using only two stacks. The implemented queue should support all the standard operations: `push`, `pop`, `peek`, `empty`. Amortized O(1) per operation.',
    examples: 'Input: ["MyQueue","push","push","peek","pop","empty"], [[],[1],[2],[],[],[]]\nOutput: [null,null,null,1,1,false]',
    starterCode: null
  },

  // ═══════════════════════════════════════════════════════════
  // ═══  BATCH 2 — Heaps · Greedy · Sliding Window · Matrix  ═══
  // ═══════════════════════════════════════════════════════════

  {
    id: '132-pattern',
    title: '132 Pattern',
    category: 'Stacks & Queues',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/132-pattern/',
    tags: ['Array', 'Monotonic Stack', 'Binary Search'],
    companies: ['Amazon', 'Google', 'Bloomberg'],
    description: 'Given an integer array `nums`, return `true` if there is a 132 pattern in it: a triple `(i, j, k)` where `i < j < k` and `nums[i] < nums[k] < nums[j]`.\n\n**Optimal:** scan from right, maintain a monotonic decreasing stack; track the largest "k candidate" popped — when the current element is less than that candidate, we found a 132 pattern. O(n) time.',
    examples: 'Input: nums = [1,2,3,4]\nOutput: false\n\nInput: nums = [3,1,4,2]\nOutput: true (1 < 2 < 4)\n\nInput: nums = [-1,3,2,0]\nOutput: true (-1 < 0 < 3)',
    starterCode: null
  },

  {
    id: 'implement-stack-using-queues',
    title: 'Implement Stack using Queues',
    category: 'Stacks & Queues',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/implement-stack-using-queues/',
    tags: ['Stack', 'Queue', 'Design'],
    companies: ['Amazon', 'Microsoft', 'Bloomberg'],
    description: 'Implement a last-in-first-out (LIFO) stack using only **two queues** (or one queue with rotation). Support `push`, `pop`, `top`, and `empty`. The implementation must satisfy a stack\'s LIFO order using only the standard queue operations: push to back, pop/peek from front, size, and is empty.',
    examples: 'push(1) push(2) top() → 2 ; pop() → 2 ; empty() → false',
    starterCode: null
  },

  {
    id: 'basic-calculator-ii',
    title: 'Basic Calculator II',
    category: 'Stacks & Queues',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/basic-calculator-ii/',
    tags: ['String', 'Stack', 'Math'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta'],
    description: 'Implement a basic calculator to evaluate a simple expression string `s` containing **non-negative integers** and operators `+`, `-`, `*`, `/`. Operators have standard precedence (`*` and `/` before `+` and `-`). Integer division truncates toward zero. The expression contains no parentheses.\n\n**Stack approach:** push numbers onto a stack; when you see `*` or `/`, pop the top, apply, push result. For `+` push the number, for `-` push its negation. Final answer = sum of stack.',
    examples: 'Input: "3+2*2"\nOutput: 7\n\nInput: " 3/2 "\nOutput: 1\n\nInput: " 3+5 / 2 "\nOutput: 5',
    starterCode: null
  },

  {
    id: 'task-scheduler',
    title: 'Task Scheduler',
    category: 'Heap',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/task-scheduler/',
    tags: ['Array', 'Hash Map', 'Heap', 'Greedy', 'Counting'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta'],
    description: 'You are given an array of CPU `tasks`, each labeled with an uppercase letter. There must be a gap of **at least `n` cooling cycles** between any two tasks of the same kind. Return the **minimum number of intervals** (units of time) needed to finish all tasks. The CPU may also be idle.\n\n**Greedy / heap solution** — always schedule the most-frequent remaining task; OR closed-form: answer = max(len(tasks), (maxFreq − 1) × (n + 1) + countOfMostFrequent).',
    examples: 'Input: tasks = ["A","A","A","B","B","B"], n = 2\nOutput: 8  (A → B → idle → A → B → idle → A → B)\n\nInput: tasks = ["A","A","A","B","B","B"], n = 0\nOutput: 6  (any order)',
    starterCode: null
  },

  {
    id: 'sliding-window-maximum',
    title: 'Sliding Window Maximum',
    category: 'Sliding Window',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/sliding-window-maximum/',
    tags: ['Array', 'Queue', 'Sliding Window', 'Monotonic Deque', 'Heap'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta', 'Bloomberg'],
    description: 'Given an integer array `nums` and a window size `k`, return an array containing the **maximum of every contiguous subarray of length `k`** as the window slides from left to right.\n\n**Optimal:** monotonic decreasing deque storing indices. O(n) time. Each index is pushed and popped at most once.',
    examples: 'Input: nums = [1,3,-1,-3,5,3,6,7], k = 3\nOutput: [3,3,5,5,6,7]',
    starterCode: null
  },

  {
    id: 'reorganize-string',
    title: 'Reorganize String',
    category: 'Heap',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/reorganize-string/',
    tags: ['Hash Map', 'String', 'Greedy', 'Heap', 'Counting'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Bloomberg'],
    description: 'Given a string `s`, rearrange its characters so that **no two adjacent characters are the same**. Return any valid rearrangement, or an empty string if impossible.\n\n**Greedy (max-heap of chars by frequency):** repeatedly take the two most-frequent chars not last appended and append them.',
    examples: 'Input: s = "aab"\nOutput: "aba"\n\nInput: s = "aaab"\nOutput: ""  (impossible)',
    starterCode: null
  },

  {
    id: 'jump-game-vi',
    title: 'Jump Game VI',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/jump-game-vi/',
    tags: ['Array', 'Dynamic Programming', 'Monotonic Deque', 'Sliding Window'],
    companies: ['Amazon', 'Google'],
    description: 'You start at index 0 and want to reach the last index of `nums`. From index i, you can jump to any index j with `i < j ≤ min(i+k, n-1)`. Each jump adds `nums[j]` to your score. Return the **maximum score** you can collect by reaching the last index.\n\n**DP + monotonic deque:** dp[i] = nums[i] + max(dp[i-k..i-1]). Use a deque to track the window maximum in O(1) per step → overall O(n).',
    examples: 'Input: nums = [1,-1,-2,4,-7,3], k = 2\nOutput: 7  (1 → -1 → 4 → 3)\n\nInput: nums = [10,-5,-2,4,0,3], k = 3\nOutput: 17',
    starterCode: null
  },

  {
    id: 'shortest-subarray-sum-at-least-k',
    title: 'Shortest Subarray with Sum at Least K',
    category: 'Sliding Window',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/shortest-subarray-with-sum-at-least-k/',
    tags: ['Array', 'Prefix Sum', 'Monotonic Deque', 'Binary Search'],
    companies: ['Google', 'Amazon'],
    description: 'Given an integer array `nums` (may include negatives) and an integer `k`, return the **length of the shortest non-empty subarray** with a sum of at least `k`. Return -1 if no such subarray exists.\n\n**Approach:** prefix sums + monotonic increasing deque of indices. O(n) time.',
    examples: 'Input: nums = [1], k = 1\nOutput: 1\n\nInput: nums = [1,2], k = 4\nOutput: -1\n\nInput: nums = [2,-1,2], k = 3\nOutput: 3',
    starterCode: null
  },

  {
    id: 'maximum-absolute-sum-subarray',
    title: 'Maximum Absolute Sum of Any Subarray',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/maximum-absolute-sum-of-any-subarray/',
    tags: ['Array', 'Dynamic Programming', 'Kadane', 'Prefix Sum'],
    companies: ['Amazon', 'Google'],
    description: 'You are given an integer array `nums`. The **absolute sum** of a subarray `[a, b, c, …]` is `|a + b + c + …|`. Return the **maximum absolute sum of any non-empty subarray** of `nums`.\n\n**Trick:** answer = max(maxSubarraySum, |minSubarraySum|). Run Kadane twice (or in one pass) — for max and min subarray sums.',
    examples: 'Input: nums = [1,-3,2,3,-4]\nOutput: 5  (subarray [2,3])\n\nInput: nums = [2,-5,1,-4,3,-2]\nOutput: 8  (subarray [-5,1,-4])',
    starterCode: null
  },

  {
    id: 'candy',
    title: 'Candy',
    category: 'Greedy',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/candy/',
    tags: ['Array', 'Greedy', 'Two Passes'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Bloomberg'],
    description: 'There are `n` children with `ratings`. Give each child at least 1 candy, and any child with a higher rating than their neighbor must get more candies than that neighbor. Return the **minimum total candies** needed.\n\n**Two-pass greedy:** initialize each child with 1 candy. Left-to-right: if rating[i] > rating[i-1], candies[i] = candies[i-1] + 1. Right-to-left: if rating[i] > rating[i+1], candies[i] = max(candies[i], candies[i+1] + 1). Sum.',
    examples: 'Input: ratings = [1,0,2]\nOutput: 5  (2,1,2)\n\nInput: ratings = [1,2,2]\nOutput: 4  (1,2,1)',
    starterCode: null
  },

  {
    id: 'boats-to-save-people',
    title: 'Boats to Save People',
    category: 'Two Pointers',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/boats-to-save-people/',
    tags: ['Array', 'Two Pointers', 'Greedy', 'Sorting'],
    companies: ['Amazon', 'Google', 'Microsoft'],
    description: 'You are given an array `people` of weights and an integer `limit`. Each boat can carry **at most 2 people** as long as their combined weight ≤ `limit`. Return the **minimum number of boats** required to rescue everyone.\n\n**Two-pointer greedy:** sort, pair the lightest with the heaviest if possible; otherwise the heaviest goes alone.',
    examples: 'Input: people = [1,2], limit = 3\nOutput: 1\n\nInput: people = [3,2,2,1], limit = 3\nOutput: 3',
    starterCode: null
  },

  {
    id: 'largest-number',
    title: 'Largest Number',
    category: 'Greedy',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/largest-number/',
    tags: ['Array', 'Sorting', 'Greedy', 'String'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple'],
    description: 'Given a list of non-negative integers `nums`, arrange them so that they form the **largest possible number**. Return the result as a string (since it may be very large).\n\n**Custom-sort key:** compare two strings `a` and `b` by which concatenation is bigger — `a+b` vs `b+a`. Edge case: if the largest number is 0, the result is just `"0"`.',
    examples: 'Input: nums = [10,2]\nOutput: "210"\n\nInput: nums = [3,30,34,5,9]\nOutput: "9534330"',
    starterCode: null
  },

  {
    id: 'bag-of-tokens',
    title: 'Bag of Tokens',
    category: 'Two Pointers',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/bag-of-tokens/',
    tags: ['Array', 'Two Pointers', 'Greedy', 'Sorting'],
    companies: ['Amazon', 'Google'],
    description: 'You start with `power` energy and `0` score. You have a bag of `tokens`. For each token you can either **play it face-up** (cost: `tokens[i]` power; gain: 1 score) or **face-down** (cost: 1 score; gain: `tokens[i]` power). Return the **maximum score** achievable.\n\n**Greedy two-pointer (after sorting):** play smallest face-up while you have power; if not, play largest face-down to gain power (only if you have at least 1 score and still have moves to make it worthwhile).',
    examples: 'Input: tokens = [100], power = 50\nOutput: 0\n\nInput: tokens = [100,200], power = 150\nOutput: 1\n\nInput: tokens = [100,200,300,400], power = 200\nOutput: 2',
    starterCode: null
  },

  {
    id: 'smallest-range-ii',
    title: 'Smallest Range II',
    category: 'Greedy',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/smallest-range-ii/',
    tags: ['Array', 'Math', 'Greedy', 'Sorting'],
    companies: ['Google', 'Amazon'],
    description: 'You have an integer array `nums`. For each element, you must choose to add `+k` or `-k`. Return the **minimum possible difference** between the new maximum and minimum after performing this choice on every element.\n\n**Insight:** sort first. The optimal strategy adds `+k` to a prefix and `-k` to the suffix (or vice versa). Try every split.',
    examples: 'Input: nums = [1], k = 0\nOutput: 0\n\nInput: nums = [0,10], k = 2\nOutput: 6  (0+2=2; 10-2=8 → range 6)\n\nInput: nums = [1,3,6], k = 3\nOutput: 3',
    starterCode: null
  },

  {
    id: 'find-the-index-of-first-occurrence',
    title: 'Find the Index of the First Occurrence in a String',
    category: 'Strings',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/',
    tags: ['Two Pointers', 'String', 'String Matching', 'KMP'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta', 'Bloomberg'],
    description: 'Given two strings `haystack` and `needle`, return the **index of the first occurrence of `needle` in `haystack`**, or `-1` if `needle` is not part of `haystack`.\n\n**Approaches:** (1) brute force O(n·m); (2) KMP O(n+m); (3) Rabin-Karp rolling hash O(n+m).',
    examples: 'Input: haystack = "sadbutsad", needle = "sad"\nOutput: 0\n\nInput: haystack = "leetcode", needle = "leeto"\nOutput: -1',
    starterCode: null
  },

  {
    id: 'count-sorted-vowel-strings',
    title: 'Count Sorted Vowel Strings',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/count-sorted-vowel-strings/',
    tags: ['Math', 'Dynamic Programming', 'Combinatorics'],
    companies: ['Amazon', 'Google'],
    description: 'Return the number of strings of length `n` made from the vowels {a, e, i, o, u} that are **sorted lexicographically** (each next character ≥ the previous).\n\n**Closed form:** stars-and-bars combinatorics — count is C(n+4, 4) = (n+1)(n+2)(n+3)(n+4) / 24.',
    examples: 'Input: n = 1\nOutput: 5  ("a","e","i","o","u")\n\nInput: n = 2\nOutput: 15\n\nInput: n = 33\nOutput: 66045',
    starterCode: null
  },

  {
    id: 'longest-happy-string',
    title: 'Longest Happy String',
    category: 'Heap',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/longest-happy-string/',
    tags: ['String', 'Greedy', 'Heap'],
    companies: ['Google', 'Amazon'],
    description: 'A "happy string" uses only `a`, `b`, `c` and never has 3 consecutive identical characters. Given counts `a`, `b`, `c`, return the **longest happy string** you can build, using at most that many of each.\n\n**Greedy (max-heap by remaining count):** always append the most-available character unless that would create three in a row — in which case pick the next most available.',
    examples: 'Input: a = 1, b = 1, c = 7\nOutput: "ccaccbcc"  (or any valid happy string of max length)\n\nInput: a = 7, b = 1, c = 0\nOutput: "aabaa"',
    starterCode: null
  },

  {
    id: 'game-of-life',
    title: 'Game of Life',
    category: 'Matrix',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/game-of-life/',
    tags: ['Array', 'Matrix', 'Simulation'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta'],
    description: 'Conway\'s Game of Life on an m × n board. Each cell is `1` (live) or `0` (dead). Compute the next state, **in place**:\n- A live cell with **<2** or **>3** live neighbors dies.\n- A live cell with **2 or 3** live neighbors survives.\n- A dead cell with **exactly 3** live neighbors becomes live.\n\n**In-place trick:** encode old + new state in two bits per cell (e.g., bit 0 = current, bit 1 = next).',
    examples: 'Input: [[0,1,0],[0,0,1],[1,1,1],[0,0,0]]\nOutput: [[0,0,0],[1,0,1],[0,1,1],[0,1,0]]',
    starterCode: null
  },

  {
    id: 'walking-robot-simulation',
    title: 'Walking Robot Simulation',
    category: 'Matrix',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/walking-robot-simulation/',
    tags: ['Array', 'Hash Set', 'Simulation', 'Math'],
    companies: ['Amazon', 'Google'],
    description: 'A robot starts at (0, 0) facing north. It receives `commands` of three kinds:\n- **-2:** turn left 90°\n- **-1:** turn right 90°\n- **k (1..9):** walk k units forward, but stop one square before any obstacle\n\nReturn the **maximum Euclidean-squared distance from origin** during the entire walk.',
    examples: 'Input: commands = [4,-1,3], obstacles = []\nOutput: 25  (ends at (3, 4))\n\nInput: commands = [4,-1,4,-2,4], obstacles = [[2,4]]\nOutput: 65',
    starterCode: null
  },

  {
    id: 'car-pooling',
    title: 'Car Pooling',
    category: 'Arrays',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/car-pooling/',
    tags: ['Array', 'Sorting', 'Heap', 'Sweep Line', 'Prefix Sum'],
    companies: ['Amazon', 'Google', 'Microsoft'],
    description: 'You are given `trips`, where `trips[i] = [numPassengers, from, to]`, and a car `capacity`. Return `true` if it is possible to pick up and drop off all passengers in all trips without exceeding capacity at any moment.\n\n**Sweep line / difference array:** add passengers at `from`, subtract at `to`. Walk the timeline; if running sum exceeds capacity at any point, return false.',
    examples: 'Input: trips = [[2,1,5],[3,3,7]], capacity = 4\nOutput: false\n\nInput: trips = [[2,1,5],[3,3,7]], capacity = 5\nOutput: true',
    starterCode: null
  },

  {
    id: 'find-right-interval',
    title: 'Find Right Interval',
    category: 'Sorting & Searching',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/find-right-interval/',
    tags: ['Array', 'Binary Search', 'Sorting', 'Intervals'],
    companies: ['Google', 'Amazon'],
    description: 'You are given `intervals` with **distinct start points**. For each interval, find the index of the smallest interval whose `start` is ≥ this interval\'s `end`. If none, output -1. Return all such indices.\n\n**Approach:** map start → original index; sort starts; binary-search for each interval\'s end.',
    examples: 'Input: intervals = [[3,4],[2,3],[1,2]]\nOutput: [-1, 0, 1]\n\nInput: intervals = [[1,4],[2,3],[3,4]]\nOutput: [-1, 2, -1]',
    starterCode: null
  },

  {
    id: 'shortest-unsorted-continuous-subarray',
    title: 'Shortest Unsorted Continuous Subarray',
    category: 'Arrays',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/shortest-unsorted-continuous-subarray/',
    tags: ['Array', 'Two Pointers', 'Sorting', 'Stack', 'Monotonic Stack'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Bloomberg'],
    description: 'Given an integer array `nums`, find one **continuous subarray** that, if sorted in ascending order, makes the entire array sorted. Return its length (or 0 if already sorted).\n\n**O(n) approach:** scan left-to-right tracking max-so-far — record the last index where `nums[i] < max`. Scan right-to-left tracking min-so-far — record the first index where `nums[i] > min`.',
    examples: 'Input: nums = [2,6,4,8,10,9,15]\nOutput: 5  (subarray [6,4,8,10,9])\n\nInput: nums = [1,2,3,4]\nOutput: 0',
    starterCode: null
  },

  {
    id: 'valid-triangle-number',
    title: 'Valid Triangle Number',
    category: 'Two Pointers',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/valid-triangle-number/',
    tags: ['Array', 'Two Pointers', 'Binary Search', 'Sorting', 'Greedy'],
    companies: ['Google', 'Amazon'],
    description: 'Given an integer array `nums`, count the number of triplets that can form the sides of a triangle. Three lengths form a valid triangle iff the **sum of any two** is greater than the third.\n\n**O(n²) approach:** sort, then for each largest-side `c` use a two-pointer scan over the prefix to count pairs with `a + b > c`.',
    examples: 'Input: nums = [2,2,3,4]\nOutput: 3  ([2,3,4],[2,3,4],[2,2,3])\n\nInput: nums = [4,2,3,4]\nOutput: 4',
    starterCode: null
  },

  {
    id: 'array-of-doubled-pairs',
    title: 'Array of Doubled Pairs',
    category: 'Greedy',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/array-of-doubled-pairs/',
    tags: ['Array', 'Hash Map', 'Greedy', 'Sorting'],
    companies: ['Amazon', 'Google'],
    description: 'Given an integer array `arr` of even length, return `true` iff it can be reordered so that for every index `i`, `arr[2i+1] = 2 * arr[2i]`. (i.e., it can be partitioned into pairs `(x, 2x)`.)\n\n**Greedy:** sort by absolute value; use a frequency map; for each smallest absolute value remaining, consume one of `x` and one of `2x`. (Negatives work because if x < 0, 2x is the smaller in absolute value — sort by `|x|` to process the "anchor" first.)',
    examples: 'Input: arr = [3,1,3,6]\nOutput: false\n\nInput: arr = [4,-2,2,-4]\nOutput: true ((-2,-4) and (2,4))',
    starterCode: null
  },

  {
    id: 'count-the-number-of-fair-pairs',
    title: 'Count the Number of Fair Pairs',
    category: 'Two Pointers',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/count-the-number-of-fair-pairs/',
    tags: ['Array', 'Two Pointers', 'Binary Search', 'Sorting'],
    companies: ['Amazon', 'Google'],
    description: 'Given an integer array `nums` and inclusive bounds `lower` and `upper`, return the number of **fair pairs** `(i, j)` with `i < j` such that `lower ≤ nums[i] + nums[j] ≤ upper`.\n\n**Approach:** sort, then for each i, count j > i with nums[j] in `[lower-nums[i], upper-nums[i]]` via binary search. O(n log n).',
    examples: 'Input: nums = [0,1,7,4,4,5], lower = 3, upper = 6\nOutput: 6\n\nInput: nums = [1,7,9,2,5], lower = 11, upper = 11\nOutput: 1',
    starterCode: null
  },

  // ═══════════════════════════════════════════════════════════
  // ═══  BATCH 3 — Linked Lists · Trees · DP                  ═══
  // ═══════════════════════════════════════════════════════════

  {
    id: 'middle-of-linked-list',
    title: 'Middle of the Linked List',
    category: 'Linked Lists',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/middle-of-the-linked-list/',
    tags: ['Linked List', 'Two Pointers', 'Slow/Fast Pointer'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple'],
    description: 'Given the head of a singly linked list, return the **middle node**. If there are two middle nodes, return the second one.\n\n**Slow/fast pointer:** advance fast by 2 and slow by 1 each step. When fast reaches the end, slow is at the middle.',
    examples: 'Input: head = [1,2,3,4,5]\nOutput: [3,4,5]\n\nInput: head = [1,2,3,4,5,6]\nOutput: [4,5,6]',
    starterCode: null
  },

  {
    id: 'add-two-numbers',
    title: 'Add Two Numbers',
    category: 'Linked Lists',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/add-two-numbers/',
    tags: ['Linked List', 'Math', 'Recursion'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta', 'Bloomberg'],
    description: 'You are given two non-empty linked lists representing two non-negative integers. The digits are stored in **reverse order** and each node contains a single digit. Add the two numbers and return the sum as a linked list (also in reverse order).\n\n**Walk both lists in parallel**, summing digits + carry. Create a new node for each digit of the result.',
    examples: 'Input: l1 = [2,4,3], l2 = [5,6,4]\nOutput: [7,0,8]  (342 + 465 = 807)\n\nInput: l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]\nOutput: [8,9,9,9,0,0,0,1]',
    starterCode: null
  },

  {
    id: 'palindrome-linked-list',
    title: 'Palindrome Linked List',
    category: 'Linked Lists',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/palindrome-linked-list/',
    tags: ['Linked List', 'Two Pointers', 'Recursion', 'Stack'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta'],
    description: 'Given the head of a singly linked list, return `true` if it is a **palindrome** (reads the same forward and backward).\n\n**O(n) time, O(1) space:** find the middle (slow/fast), reverse the second half, then compare with first half.',
    examples: 'Input: head = [1,2,2,1]\nOutput: true\n\nInput: head = [1,2]\nOutput: false',
    starterCode: null
  },

  {
    id: 'remove-nth-from-end',
    title: 'Remove Nth Node From End of List',
    category: 'Linked Lists',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/',
    tags: ['Linked List', 'Two Pointers', 'Slow/Fast Pointer'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta', 'Bloomberg'],
    description: 'Given the head of a linked list, remove the **n-th node from the end** and return the head.\n\n**One-pass two-pointer:** advance fast pointer n steps; then move slow + fast together until fast reaches the end. Slow is at the node BEFORE the one to delete.',
    examples: 'Input: head = [1,2,3,4,5], n = 2\nOutput: [1,2,3,5]\n\nInput: head = [1], n = 1\nOutput: []',
    starterCode: null
  },

  {
    id: 'linked-list-cycle-ii',
    title: 'Linked List Cycle II',
    category: 'Linked Lists',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/linked-list-cycle-ii/',
    tags: ['Linked List', 'Two Pointers', 'Floyd Cycle'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Bloomberg'],
    description: 'Given the head of a linked list, return the **node where the cycle begins**, or `null` if there is no cycle. Solve in O(n) time and O(1) space.\n\n**Floyd 2-phase:** Phase 1 — slow/fast detect meeting point. Phase 2 — reset one pointer to head; move both at speed 1; they meet at the cycle entry.',
    examples: 'Input: head = [3,2,0,-4], pos = 1\nOutput: tail connects to node index 1 (value 2)',
    starterCode: null
  },

  {
    id: 'sort-list',
    title: 'Sort List',
    category: 'Linked Lists',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/sort-list/',
    tags: ['Linked List', 'Two Pointers', 'Divide & Conquer', 'Sorting', 'Merge Sort'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta'],
    description: 'Given the head of a linked list, return it sorted in ascending order. Aim for O(n log n) time and O(1) extra space (not counting recursion).\n\n**Merge sort on linked list:** split via slow/fast, recursively sort each half, then merge two sorted lists.',
    examples: 'Input: head = [4,2,1,3]\nOutput: [1,2,3,4]\n\nInput: head = [-1,5,3,4,0]\nOutput: [-1,0,3,4,5]',
    starterCode: null
  },

  {
    id: 'binary-tree-preorder-traversal',
    title: 'Binary Tree Preorder Traversal',
    category: 'Trees',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/binary-tree-preorder-traversal/',
    tags: ['Tree', 'DFS', 'Stack', 'Recursion'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple'],
    description: 'Given the root of a binary tree, return the **preorder traversal** of its nodes\' values (root → left → right).\n\nIterative: use a stack — push root; pop → add value; push right then left.',
    examples: 'Input: root = [1,null,2,3]\nOutput: [1,2,3]\n\nInput: root = [1,2,3,4,5,6,7]\nOutput: [1,2,4,5,3,6,7]',
    starterCode: null
  },

  {
    id: 'binary-tree-inorder-traversal',
    title: 'Binary Tree Inorder Traversal',
    category: 'Trees',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/binary-tree-inorder-traversal/',
    tags: ['Tree', 'DFS', 'Stack', 'Recursion'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Bloomberg'],
    description: 'Given the root of a binary tree, return the **inorder traversal** of its nodes\' values (left → root → right). On a BST this gives sorted output.\n\nIterative: use a stack — go left while you can pushing nodes; on pop visit the node and switch to its right subtree.',
    examples: 'Input: root = [1,null,2,3]\nOutput: [1,3,2]\n\nInput: root = [1,2,3,4,5,6,7]\nOutput: [4,2,5,1,6,3,7]',
    starterCode: null
  },

  {
    id: 'binary-tree-postorder-traversal',
    title: 'Binary Tree Postorder Traversal',
    category: 'Trees',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/binary-tree-postorder-traversal/',
    tags: ['Tree', 'DFS', 'Stack', 'Recursion'],
    companies: ['Amazon', 'Google', 'Microsoft'],
    description: 'Given the root of a binary tree, return the **postorder traversal** (left → right → root).\n\nIterative trick: do a "modified preorder" (root → right → left) using a stack, then reverse the result.',
    examples: 'Input: root = [1,null,2,3]\nOutput: [3,2,1]\n\nInput: root = [1,2,3,4,5,6,7]\nOutput: [4,5,2,6,7,3,1]',
    starterCode: null
  },

  {
    id: 'same-tree',
    title: 'Same Tree',
    category: 'Trees',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/same-tree/',
    tags: ['Tree', 'DFS', 'BFS', 'Recursion'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta'],
    description: 'Given the roots of two binary trees `p` and `q`, return `true` if they are **structurally identical AND have the same values** at every corresponding position.\n\nRecursion: both null → true; one null → false; values differ → false; recurse on left and right.',
    examples: 'Input: p = [1,2,3], q = [1,2,3]\nOutput: true\n\nInput: p = [1,2], q = [1,null,2]\nOutput: false (structure differs)',
    starterCode: null
  },

  {
    id: 'symmetric-tree',
    title: 'Symmetric Tree',
    category: 'Trees',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/symmetric-tree/',
    tags: ['Tree', 'DFS', 'BFS', 'Recursion'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta', 'Bloomberg'],
    description: 'Given the root of a binary tree, return `true` if the tree is a **mirror of itself** (symmetric around its center).\n\nRecursion: pair a node\'s `left` with its mirror\'s `right` and vice versa.',
    examples: 'Input: root = [1,2,2,3,4,4,3]\nOutput: true\n\nInput: root = [1,2,2,null,3,null,3]\nOutput: false',
    starterCode: null
  },

  {
    id: 'diameter-of-binary-tree',
    title: 'Diameter of Binary Tree',
    category: 'Trees',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/diameter-of-binary-tree/',
    tags: ['Tree', 'DFS', 'Recursion'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta', 'Bloomberg'],
    description: 'Given the root of a binary tree, return the **diameter**: the length (in edges) of the longest path between any two nodes. The path may not pass through the root.\n\n**DFS post-order:** at each node, return its height; track the global max of `leftHeight + rightHeight` (path through this node).',
    examples: 'Input: root = [1,2,3,4,5]\nOutput: 3  (path 4-2-1-3 or 5-2-1-3, 3 edges)\n\nInput: root = [1,2]\nOutput: 1',
    starterCode: null
  },

  {
    id: 'path-sum',
    title: 'Path Sum',
    category: 'Trees',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/path-sum/',
    tags: ['Tree', 'DFS', 'BFS', 'Recursion'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple'],
    description: 'Given the root of a binary tree and an integer `targetSum`, return `true` if there is a **root-to-leaf path** whose sum of all node values equals `targetSum`.\n\nDFS recursion: at each node, subtract its value from target; at a leaf check if the remaining is 0.',
    examples: 'Input: root = [5,4,8,11,null,13,4,7,2,null,null,null,1], targetSum = 22\nOutput: true (5→4→11→2)',
    starterCode: null
  },

  {
    id: 'construct-binary-tree-preorder-inorder',
    title: 'Construct Binary Tree from Preorder and Inorder Traversal',
    category: 'Trees',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/',
    tags: ['Array', 'Hash Map', 'Tree', 'DFS', 'Recursion'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Bloomberg'],
    description: 'Given two integer arrays `preorder` and `inorder` where preorder is the **preorder traversal** of a binary tree and inorder is the **inorder traversal** of the same tree, construct and return the binary tree.\n\n**Approach:** preorder[0] is the root. Find it in inorder — everything to its left is the left subtree (in inorder), everything to its right is the right subtree. Recurse with index map for O(1) lookup → O(n) total.',
    examples: 'Input: preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]\nOutput: tree [3,9,20,null,null,15,7]',
    starterCode: null
  },

  {
    id: 'house-robber',
    title: 'House Robber',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/house-robber/',
    tags: ['Array', 'Dynamic Programming'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta'],
    description: 'You are a robber planning to rob houses along a street. Each house has some money. **You cannot rob two adjacent houses** (alarms connect them). Return the **maximum amount of money** you can rob without alerting the police.\n\n**DP recurrence:** dp[i] = max(dp[i-1], dp[i-2] + nums[i]). Can be done with two rolling variables — O(1) space.',
    examples: 'Input: nums = [1,2,3,1]\nOutput: 4  (1 + 3)\n\nInput: nums = [2,7,9,3,1]\nOutput: 12  (2 + 9 + 1)',
    starterCode: null
  },

  {
    id: 'unique-paths',
    title: 'Unique Paths',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/unique-paths/',
    tags: ['Math', 'Dynamic Programming', 'Combinatorics'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Bloomberg'],
    description: 'A robot is on an `m × n` grid in the top-left corner. It can only move right or down. How many **unique paths** are there to the bottom-right?\n\n**Two solutions:** (1) DP where dp[i][j] = dp[i-1][j] + dp[i][j-1], O(m·n). (2) Closed form: C(m+n-2, m-1) binomial coefficient.',
    examples: 'Input: m = 3, n = 7\nOutput: 28\n\nInput: m = 3, n = 2\nOutput: 3',
    starterCode: null
  },

  {
    id: 'edit-distance',
    title: 'Edit Distance',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/edit-distance/',
    tags: ['String', 'Dynamic Programming'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta', 'Bloomberg'],
    description: 'Given two strings `word1` and `word2`, return the **minimum number of single-character operations** (insert, delete, replace) to convert `word1` into `word2`. (Levenshtein distance.)\n\n**DP:** dp[i][j] = min edits to convert word1[:i] to word2[:j]. If chars match, dp[i][j] = dp[i-1][j-1]; else 1 + min of (insert, delete, replace).',
    examples: 'Input: word1 = "horse", word2 = "ros"\nOutput: 3  (horse → rorse → rose → ros)\n\nInput: word1 = "intention", word2 = "execution"\nOutput: 5',
    starterCode: null
  },

  {
    id: 'longest-common-subsequence',
    title: 'Longest Common Subsequence',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/longest-common-subsequence/',
    tags: ['String', 'Dynamic Programming'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Bloomberg'],
    description: 'Given two strings `text1` and `text2`, return the **length of their longest common subsequence**. A subsequence keeps characters\' order but skips any number of them.\n\n**DP:** dp[i][j] = LCS length of text1[:i] and text2[:j]. If chars match, dp[i][j] = dp[i-1][j-1] + 1; else max(dp[i-1][j], dp[i][j-1]).',
    examples: 'Input: text1 = "abcde", text2 = "ace"\nOutput: 3  ("ace")\n\nInput: text1 = "abc", text2 = "abc"\nOutput: 3',
    starterCode: null
  },

  {
    id: 'longest-palindromic-substring',
    title: 'Longest Palindromic Substring',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/longest-palindromic-substring/',
    tags: ['String', 'Dynamic Programming', 'Two Pointers', 'Expand Around Center'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta', 'Bloomberg'],
    description: 'Given a string `s`, return the **longest palindromic substring** of `s`.\n\n**Expand-around-center** is the simplest O(n²) solution: for each index, expand outward checking both odd and even length palindromes.\n\n**Manacher\'s** algorithm achieves O(n) but is overkill for most interview contexts.',
    examples: 'Input: s = "babad"\nOutput: "bab" or "aba"\n\nInput: s = "cbbd"\nOutput: "bb"',
    starterCode: null
  },

  {
    id: 'decode-ways',
    title: 'Decode Ways',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/decode-ways/',
    tags: ['String', 'Dynamic Programming'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta', 'Bloomberg'],
    description: 'A message containing digits maps to letters: A=1, B=2, …, Z=26. Given a digit string `s`, return the number of ways to **decode** it. Note: leading zeros (e.g., "06") are invalid for a single digit decode, and groupings must yield valid letters.\n\n**DP:** dp[i] = ways to decode s[:i]. Add dp[i-1] if s[i-1] is a valid 1-digit code; add dp[i-2] if s[i-2:i] is a valid 2-digit code (10..26).',
    examples: 'Input: s = "12"\nOutput: 2  ("AB" or "L")\n\nInput: s = "226"\nOutput: 3\n\nInput: s = "06"\nOutput: 0',
    starterCode: null
  },

  {
    id: 'first-missing-positive',
    title: 'First Missing Positive',
    category: 'Arrays',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/first-missing-positive/',
    tags: ['Array', 'Hash Map', 'Cyclic Sort'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta'],
    description: 'Given an unsorted integer array `nums`, return the **smallest missing positive integer**. Solve in O(n) time using O(1) extra space.\n\n**Cyclic sort:** for each i, swap nums[i] to its correct position (nums[i]-1) if it\'s in [1, n]. Then scan: the first index i where nums[i] != i+1 → answer is i+1.',
    examples: 'Input: nums = [1,2,0]\nOutput: 3\n\nInput: nums = [3,4,-1,1]\nOutput: 2\n\nInput: nums = [7,8,9,11,12]\nOutput: 1',
    starterCode: null
  },

  {
    id: 'maximal-square',
    title: 'Maximal Square',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/maximal-square/',
    tags: ['Array', 'Matrix', 'Dynamic Programming'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta'],
    description: 'Given an m × n binary matrix filled with 0\'s and 1\'s, find the **largest square** containing only 1\'s and return its **area**.\n\n**DP:** dp[i][j] = side length of the largest square with bottom-right corner at (i, j). If matrix[i][j] = 1: dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]).',
    examples: 'Input: matrix = [["1","0","1","0","0"],["1","0","1","1","1"],["1","1","1","1","1"],["1","0","0","1","0"]]\nOutput: 4  (2×2 square of 1\'s)',
    starterCode: null
  },

  // ═══════════════════════════════════════════════════════════
  // ═══  BATCH 4 — BST · Trie · Backtracking · Graphs · DP · Design ═══
  // ═══════════════════════════════════════════════════════════

  {
    id: 'search-in-bst',
    title: 'Search in a Binary Search Tree',
    category: 'Trees',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/search-in-a-binary-search-tree/',
    tags: ['Tree', 'Binary Search Tree', 'DFS'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple'],
    description: 'Given the root of a BST and an integer `val`, return the **subtree rooted at the node whose value equals `val`**, or `null` if absent.\n\nClassic BST traversal — go left if val < root.val, right if val > root.val.',
    examples: 'Input: root = [4,2,7,1,3], val = 2\nOutput: [2,1,3]\n\nInput: root = [4,2,7,1,3], val = 5\nOutput: []',
    starterCode: null
  },

  {
    id: 'insert-into-bst',
    title: 'Insert into a Binary Search Tree',
    category: 'Trees',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/insert-into-a-binary-search-tree/',
    tags: ['Tree', 'Binary Search Tree', 'DFS'],
    companies: ['Amazon', 'Google', 'Microsoft'],
    description: 'Given the root of a BST and a value to insert, return the BST root after insertion. The new node should be inserted as a leaf — the resulting tree need not be balanced (any valid BST insertion is acceptable).\n\nMultiple correct outputs exist; our verifier checks (1) the result is a BST, (2) it contains all original values plus the new value, (3) tree size grew by 1.',
    examples: 'Input: root = [4,2,7,1,3], val = 5\nOutput: [4,2,7,1,3,5]',
    starterCode: null
  },

  {
    id: 'sorted-array-to-bst',
    title: 'Convert Sorted Array to Binary Search Tree',
    category: 'Trees',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/',
    tags: ['Array', 'Divide & Conquer', 'Tree', 'Binary Search Tree'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple'],
    description: 'Given a sorted (ascending) integer array `nums`, build a **height-balanced BST** from it. Multiple valid answers exist — pick the middle as root and recurse on the halves.\n\nVerifier: result must be a BST (inorder == input) and **height-balanced** (max-height of subtrees differs by ≤ 1 at every node).',
    examples: 'Input: nums = [-10,-3,0,5,9]\nOutput: [0,-3,9,-10,null,5] (one valid answer)',
    starterCode: null
  },

  {
    id: 'kth-smallest-bst',
    title: 'Kth Smallest Element in a BST',
    category: 'Trees',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/',
    tags: ['Tree', 'Binary Search Tree', 'DFS', 'Inorder Traversal'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Bloomberg'],
    description: 'Given the root of a BST and integer `k`, return the **k-th smallest** value (1-indexed) in the tree.\n\n**Inorder traversal** of a BST yields values in sorted order — return the k-th visited node. Iterative with a stack lets you stop early without visiting the entire tree.',
    examples: 'Input: root = [3,1,4,null,2], k = 1\nOutput: 1\n\nInput: root = [5,3,6,2,4,null,null,1], k = 3\nOutput: 3',
    starterCode: null
  },

  {
    id: 'implement-trie',
    title: 'Implement Trie (Prefix Tree)',
    category: 'Trees',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/implement-trie-prefix-tree/',
    tags: ['Hash Map', 'String', 'Design', 'Trie'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta', 'Bloomberg'],
    description: 'Design a Trie (prefix tree) supporting:\n- `insert(word)` — add `word` to the trie.\n- `search(word)` — return `true` iff `word` was previously inserted.\n- `startsWith(prefix)` — return `true` iff some inserted word starts with `prefix`.\n\nClassic implementation: each node has 26 children (for lowercase a-z) and an `isEnd` flag.',
    examples: 'insert("apple"); search("apple") → true; search("app") → false; startsWith("app") → true; insert("app"); search("app") → true.',
    starterCode: null
  },

  {
    id: 'combinations',
    title: 'Combinations',
    category: 'Backtracking',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/combinations/',
    tags: ['Backtracking', 'Recursion'],
    companies: ['Amazon', 'Google', 'Microsoft'],
    description: 'Given two integers `n` and `k`, return all possible combinations of `k` numbers chosen from `1..n`. Order within combos and across combos may vary — both are normalized for testing.',
    examples: 'Input: n = 4, k = 2\nOutput: [[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]',
    starterCode: null
  },

  {
    id: 'combination-sum',
    title: 'Combination Sum',
    category: 'Backtracking',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/combination-sum/',
    tags: ['Array', 'Backtracking', 'Recursion'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta'],
    description: 'Given an array of **distinct** positive integers `candidates` and a `target`, return all unique combinations whose sum equals `target`. Each candidate may be used **unlimited** times.\n\n**Backtracking:** at each step include the current candidate (don\'t advance index), or skip it (advance index).',
    examples: 'Input: candidates = [2,3,6,7], target = 7\nOutput: [[2,2,3],[7]]\n\nInput: candidates = [2,3,5], target = 8\nOutput: [[2,2,2,2],[2,3,3],[3,5]]',
    starterCode: null
  },

  {
    id: 'generate-parentheses',
    title: 'Generate Parentheses',
    category: 'Backtracking',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/generate-parentheses/',
    tags: ['String', 'Dynamic Programming', 'Backtracking'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta', 'Bloomberg'],
    description: 'Given an integer `n`, return all combinations of well-formed parentheses with exactly `n` pairs.\n\n**Backtracking:** track open and close counts. Add `(` if open < n; add `)` if close < open.',
    examples: 'Input: n = 3\nOutput: ["((()))","(()())","(())()","()(())","()()()"]',
    starterCode: null
  },

  {
    id: 'letter-combinations-of-phone-number',
    title: 'Letter Combinations of a Phone Number',
    category: 'Backtracking',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/letter-combinations-of-a-phone-number/',
    tags: ['Hash Map', 'String', 'Backtracking', 'Recursion'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta'],
    description: 'Given a string of digits 2–9, return all possible letter combinations the digits could represent on a phone keypad: 2→abc, 3→def, 4→ghi, 5→jkl, 6→mno, 7→pqrs, 8→tuv, 9→wxyz.\n\nReturn `[]` for empty input.',
    examples: 'Input: digits = "23"\nOutput: ["ad","ae","af","bd","be","bf","cd","ce","cf"]',
    starterCode: null
  },

  {
    id: 'n-queens',
    title: 'N-Queens',
    category: 'Backtracking',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/n-queens/',
    tags: ['Array', 'Backtracking', 'Recursion'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta'],
    description: 'Place `n` queens on an `n × n` chessboard so that no two queens attack each other. Return **all distinct solutions** as boards (each row is a string with `Q` and `.`).\n\n**Classic backtracking:** place one queen per row; track occupied columns and both diagonals via boolean arrays.',
    examples: 'Input: n = 4\nOutput: 2 solutions: [".Q..","...Q","Q...","..Q."], ["..Q.","Q...","...Q",".Q.."]',
    starterCode: null
  },

  {
    id: 'course-schedule-ii',
    title: 'Course Schedule II',
    category: 'Graphs',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/course-schedule-ii/',
    tags: ['DFS', 'BFS', 'Graph', 'Topological Sort'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta'],
    description: 'There are `numCourses` courses labeled 0 to numCourses-1 with prerequisites. Return **any valid topological ordering**, or `[]` if no ordering exists (cycle).\n\n**Kahn\'s algorithm (BFS):** push all 0-in-degree nodes; pop, append to result, decrement in-degree of neighbors, push when 0. Cycle iff result.size() < numCourses.',
    examples: 'Input: numCourses = 2, prerequisites = [[1,0]]\nOutput: [0,1]\n\nInput: numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]\nOutput: [0,1,2,3] or [0,2,1,3]',
    starterCode: null
  },

  {
    id: 'rotting-oranges',
    title: 'Rotting Oranges',
    category: 'Graphs',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/rotting-oranges/',
    tags: ['Array', 'BFS', 'Matrix'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta'],
    description: 'In a grid, each cell is `0` (empty), `1` (fresh orange), or `2` (rotten). Every minute, fresh oranges adjacent to rotten ones become rotten. Return the **minimum minutes** until no fresh orange remains, or `-1` if impossible.\n\n**Multi-source BFS:** start from all rotten cells simultaneously.',
    examples: 'Input: grid = [[2,1,1],[1,1,0],[0,1,1]]\nOutput: 4\n\nInput: grid = [[2,1,1],[0,1,1],[1,0,1]]\nOutput: -1',
    starterCode: null
  },

  {
    id: 'flood-fill',
    title: 'Flood Fill',
    category: 'Graphs',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/flood-fill/',
    tags: ['Array', 'DFS', 'BFS', 'Matrix'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple'],
    description: 'Given a grid `image`, a starting pixel `(sr, sc)`, and a `color`, perform a flood fill: change every connected pixel (4-directionally) sharing the original color to the new color. Return the modified grid.\n\nGuard against infinite recursion when the starting pixel already has the target color.',
    examples: 'Input: image = [[1,1,1],[1,1,0],[1,0,1]], sr = 1, sc = 1, color = 2\nOutput: [[2,2,2],[2,2,0],[2,0,1]]',
    starterCode: null
  },

  {
    id: 'surrounded-regions',
    title: 'Surrounded Regions',
    category: 'Graphs',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/surrounded-regions/',
    tags: ['Array', 'DFS', 'BFS', 'Matrix', 'Union-Find'],
    companies: ['Amazon', 'Google', 'Microsoft'],
    description: 'Given an `m × n` board of `X` and `O`, **flip all `O`s surrounded by `X`** (capturing them) into `X`. An `O` is "safe" if it touches the border or is connected (4-directionally) to a border `O`. Solve in place.\n\n**Trick:** flip all border-connected `O`s to `#`. Then walk the grid: every `O` left becomes `X`; every `#` becomes `O`.',
    examples: 'Input: [["X","X","X","X"],["X","O","O","X"],["X","X","O","X"],["X","O","X","X"]]\nOutput: [["X","X","X","X"],["X","X","X","X"],["X","X","X","X"],["X","O","X","X"]]',
    starterCode: null
  },

  {
    id: 'number-of-provinces',
    title: 'Number of Provinces',
    category: 'Graphs',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/number-of-provinces/',
    tags: ['DFS', 'BFS', 'Union-Find', 'Graph'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple'],
    description: 'Given an n × n adjacency matrix `isConnected` where `isConnected[i][j] = 1` means city `i` and `j` are directly connected, return the **number of provinces** (connected components).',
    examples: 'Input: isConnected = [[1,1,0],[1,1,0],[0,0,1]]\nOutput: 2\n\nInput: isConnected = [[1,0,0],[0,1,0],[0,0,1]]\nOutput: 3',
    starterCode: null
  },

  {
    id: 'coin-change-ii',
    title: 'Coin Change II',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/coin-change-ii/',
    tags: ['Array', 'Dynamic Programming'],
    companies: ['Amazon', 'Google', 'Microsoft'],
    description: 'Given `coins` of distinct denominations and an integer `amount`, return the **number of distinct ways** to make up that amount using any number of each coin (unlimited supply). Return 0 if impossible.\n\n**1D DP:** dp[a] = number of ways to make `a`. Initialize dp[0]=1. For each coin, for a in [coin..amount]: dp[a] += dp[a-coin]. (Loop coin first to avoid counting permutations.)',
    examples: 'Input: amount = 5, coins = [1,2,5]\nOutput: 4  (5=5; 5=2+2+1; 5=2+1+1+1; 5=1+1+1+1+1)\n\nInput: amount = 3, coins = [2]\nOutput: 0',
    starterCode: null
  },

  {
    id: 'house-robber-ii',
    title: 'House Robber II',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/house-robber-ii/',
    tags: ['Array', 'Dynamic Programming'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple'],
    description: 'Same as House Robber, but houses are arranged in a **circle** — first and last are now adjacent. Return the maximum money you can rob.\n\n**Trick:** run House Robber I twice — once excluding the first house, once excluding the last house. Take the max.',
    examples: 'Input: nums = [2,3,2]\nOutput: 3\n\nInput: nums = [1,2,3,1]\nOutput: 4',
    starterCode: null
  },

  {
    id: 'triangle',
    title: 'Triangle',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/triangle/',
    tags: ['Array', 'Dynamic Programming'],
    companies: ['Amazon', 'Google', 'Bloomberg'],
    description: 'Given a triangle (list of integer rows where row `i` has `i+1` elements), return the **minimum path sum** from top to bottom. From row `i`, position `j`, you may go to row `i+1` position `j` or `j+1`.\n\n**Bottom-up DP** (in place): dp[j] = triangle[i][j] + min(dp[j], dp[j+1]). After processing row 0, dp[0] is the answer.',
    examples: 'Input: triangle = [[2],[3,4],[6,5,7],[4,1,8,3]]\nOutput: 11  (2 + 3 + 5 + 1 = 11)',
    starterCode: null
  },

  {
    id: 'minimum-path-sum',
    title: 'Minimum Path Sum',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/minimum-path-sum/',
    tags: ['Array', 'Matrix', 'Dynamic Programming'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Bloomberg'],
    description: 'Given an `m × n` grid of non-negative numbers, find a path from top-left to bottom-right that **minimizes the sum of numbers along the path**. You can move only down or right.\n\n**DP:** dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1]). Can be done in place.',
    examples: 'Input: grid = [[1,3,1],[1,5,1],[4,2,1]]\nOutput: 7  (1→3→1→1→1)',
    starterCode: null
  },

  {
    id: 'insert-delete-getrandom-o1',
    title: 'Insert Delete GetRandom O(1)',
    category: 'Hash Maps',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/insert-delete-getrandom-o1/',
    tags: ['Array', 'Hash Map', 'Math', 'Design', 'Randomized'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta'],
    description: 'Implement `RandomizedSet` with average O(1) `insert(val)`, `remove(val)`, and `getRandom()` operations. `getRandom` returns any current element with equal probability.\n\n**Trick:** keep an `ArrayList` for O(1) random access plus a `HashMap<value, index>` for O(1) lookup. To remove: swap target with the last element, then pop the back of the list.',
    examples: 'insert(1)→T; remove(2)→F; insert(2)→T; getRandom() ∈ {1,2}; remove(1)→T; insert(2)→F; getRandom()→2',
    starterCode: null
  },

  {
    id: 'time-based-key-value-store',
    title: 'Time Based Key-Value Store',
    category: 'Hash Maps',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/time-based-key-value-store/',
    tags: ['Hash Map', 'String', 'Binary Search', 'Design'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple'],
    description: 'Design a class that supports:\n- `set(key, value, timestamp)` — store the value at the given timestamp.\n- `get(key, timestamp)` — return the value associated with the **latest timestamp ≤ the requested timestamp**, or `""` if none.\n\nTimestamps for set are strictly increasing per key. Use **binary search** for get over the per-key timestamp list.',
    examples: 'set("foo","bar",1); get("foo",1)→"bar"; get("foo",3)→"bar"; set("foo","bar2",4); get("foo",4)→"bar2"; get("foo",5)→"bar2"',
    starterCode: null
  },

  {
    id: 'lfu-cache',
    title: 'LFU Cache',
    category: 'Hash Maps',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/lfu-cache/',
    tags: ['Hash Map', 'Linked List', 'Design', 'Doubly-Linked List'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta', 'Bloomberg'],
    description: 'Design a Least Frequently Used (LFU) cache. On capacity overflow, evict the **least-frequently-used** key; if there is a tie, evict the **least-recently-used** among them.\n\nMust support `get(key)` and `put(key, value)` in O(1) average time.\n\n**Standard implementation:** two HashMaps + a doubly-linked list per frequency bucket + a counter for the current minimum frequency.',
    examples: 'capacity=2: put(1,1); put(2,2); get(1)→1; put(3,3) evicts 2; get(2)→-1; get(3)→3; put(4,4) evicts 1; get(1)→-1; get(3)→3; get(4)→4',
    starterCode: null
  },

  // ═══════════════════════════════════════════════════════════
  // ═══  BATCH 5 — More Trees, BST, Backtracking, DP, Graphs  ═══
  // ═══════════════════════════════════════════════════════════

  {
    id: 'subtree-of-another-tree',
    title: 'Subtree of Another Tree',
    category: 'Trees',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/subtree-of-another-tree/',
    tags: ['Tree', 'DFS', 'Recursion', 'String Matching'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple'],
    description: 'Given the roots of two binary trees `root` and `subRoot`, return `true` if there exists a subtree of `root` with the same structure and node values as `subRoot`.\n\n**Recursive O(n·m):** at each node of root, check `isSameTree(node, subRoot)`. Optimal O(n+m) uses tree-hashing or serialized-string KMP — but the recursive version is plenty for typical inputs.',
    examples: 'Input: root=[3,4,5,1,2], subRoot=[4,1,2]\nOutput: true',
    starterCode: null
  },

  {
    id: 'merge-two-binary-trees',
    title: 'Merge Two Binary Trees',
    category: 'Trees',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/merge-two-binary-trees/',
    tags: ['Tree', 'DFS', 'BFS', 'Recursion'],
    companies: ['Amazon', 'Google', 'Microsoft'],
    description: 'Merge two binary trees by overlapping them. Where two nodes overlap, sum their values. Where only one tree has a node, that node becomes the merged node. Return the merged tree.',
    examples: 'Input: root1 = [1,3,2,5], root2 = [2,1,3,null,4,null,7]\nOutput: [3,4,5,5,4,null,7]',
    starterCode: null
  },

  {
    id: 'binary-tree-maximum-path-sum',
    title: 'Binary Tree Maximum Path Sum',
    category: 'Trees',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/',
    tags: ['Dynamic Programming', 'Tree', 'DFS', 'Recursion'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta', 'Bloomberg'],
    description: 'A path is any sequence of nodes connected by edges (each node appears at most once). Return the **maximum sum** over all such paths.\n\n**Post-order DFS:** at each node return the maximum **one-arm** sum (root + best of left/right or 0). Track a global max for the **two-arm** sum (root + max(left,0) + max(right,0)) — that\'s the path passing through this node.',
    examples: 'Input: root = [1,2,3]\nOutput: 6\n\nInput: root = [-10,9,20,null,null,15,7]\nOutput: 42  (path 15 → 20 → 7)',
    starterCode: null
  },

  {
    id: 'path-sum-ii',
    title: 'Path Sum II',
    category: 'Backtracking',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/path-sum-ii/',
    tags: ['Backtracking', 'Tree', 'DFS', 'Recursion'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple'],
    description: 'Given the root of a binary tree and `targetSum`, return **all root-to-leaf paths** whose values sum to `targetSum`. Each path is a list of node values.\n\nDFS / backtracking: track the current path; on a leaf, if sum matches, snapshot the path.',
    examples: 'Input: root = [5,4,8,11,null,13,4,7,2,null,null,5,1], targetSum = 22\nOutput: [[5,4,11,2],[5,8,4,5]]',
    starterCode: null
  },

  {
    id: 'all-nodes-distance-k-binary-tree',
    title: 'All Nodes Distance K in Binary Tree',
    category: 'Trees',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/all-nodes-distance-k-in-binary-tree/',
    tags: ['Tree', 'BFS', 'DFS', 'Hash Map'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta'],
    description: 'Given a binary tree, a target node, and an integer `k`, return all node values that are exactly **distance `k`** from the target.\n\n**Approach:** convert the tree to an undirected graph (parent map), then BFS from target up to depth k.',
    examples: 'Input: root = [3,5,1,6,2,0,8,null,null,7,4], target = 5, k = 2\nOutput: [7, 4, 1]',
    starterCode: null
  },

  {
    id: 'delete-node-in-bst',
    title: 'Delete Node in a BST',
    category: 'Trees',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/delete-node-in-a-bst/',
    tags: ['Tree', 'Binary Search Tree', 'Recursion'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple'],
    description: 'Given the root of a BST and a key, delete the node with that key (if present) and return the BST root. Multiple valid resulting BSTs exist (depending on which successor strategy is used). Verifier: result must still be a BST and contain all original values minus the deleted one.\n\n**Standard approach:** if node has no children → return null; one child → return that child; two children → replace value with inorder successor (min of right subtree) and delete the successor.',
    examples: 'Input: root = [5,3,6,2,4,null,7], key = 3\nOutput: any valid BST without 3, e.g. [5,4,6,2,null,null,7]',
    starterCode: null
  },

  {
    id: 'trim-binary-search-tree',
    title: 'Trim a Binary Search Tree',
    category: 'Trees',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/trim-a-binary-search-tree/',
    tags: ['Tree', 'Binary Search Tree', 'DFS', 'Recursion'],
    companies: ['Amazon', 'Google', 'Microsoft'],
    description: 'Given the root of a BST and bounds `[low, high]`, trim the tree so all values lie in `[low, high]`. Return the new root. Maintain BST property and original relative ordering of remaining nodes.\n\n**Recursion:** if node.val < low → return trim(right); if node.val > high → return trim(left); else recurse both sides.',
    examples: 'Input: root = [1,0,2], low = 1, high = 2\nOutput: [1,null,2]',
    starterCode: null
  },

  {
    id: 'unique-binary-search-trees',
    title: 'Unique Binary Search Trees',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/unique-binary-search-trees/',
    tags: ['Math', 'Dynamic Programming', 'Tree', 'Binary Search Tree', 'Catalan'],
    companies: ['Amazon', 'Google', 'Microsoft'],
    description: 'Given an integer `n`, return the **number of structurally unique BSTs** that store values 1..n.\n\n**This is the n-th Catalan number.** DP: G(n) = Σ G(i-1) * G(n-i) for i in 1..n, with G(0) = G(1) = 1.',
    examples: 'Input: n = 3\nOutput: 5\n\nInput: n = 1\nOutput: 1',
    starterCode: null
  },

  {
    id: 'palindrome-partitioning',
    title: 'Palindrome Partitioning',
    category: 'Backtracking',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/palindrome-partitioning/',
    tags: ['String', 'Dynamic Programming', 'Backtracking', 'Recursion'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta'],
    description: 'Given a string `s`, partition it such that every substring of the partition is a palindrome. Return all possible partitions.\n\n**Backtracking:** try every prefix length; if the prefix is a palindrome, recurse on the rest.',
    examples: 'Input: s = "aab"\nOutput: [["a","a","b"],["aa","b"]]\n\nInput: s = "a"\nOutput: [["a"]]',
    starterCode: null
  },

  {
    id: 'target-sum',
    title: 'Target Sum',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/target-sum/',
    tags: ['Array', 'Dynamic Programming', 'Backtracking'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    description: 'Given an integer array `nums` and an integer `target`, you can prefix each number with `+` or `-` and concatenate. Return the **number of expressions** that evaluate to `target`.\n\n**Math reduction → Subset Sum:** total = sum(nums); positive set P with sum s satisfies 2s − total = target, so s = (target + total) / 2. Count subsets with sum s. (Requires (target + total) even and ≥ 0.)',
    examples: 'Input: nums = [1,1,1,1,1], target = 3\nOutput: 5\n\nInput: nums = [1], target = 1\nOutput: 1',
    starterCode: null
  },

  {
    id: 'letter-case-permutation',
    title: 'Letter Case Permutation',
    category: 'Backtracking',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/letter-case-permutation/',
    tags: ['Bit Manipulation', 'String', 'Backtracking'],
    companies: ['Amazon', 'Google', 'Microsoft'],
    description: 'Given a string `s` of letters and digits, return all strings that can be obtained by transforming each letter to either upper or lower case (digits stay).',
    examples: 'Input: s = "a1b2"\nOutput: ["a1b2","a1B2","A1b2","A1B2"]',
    starterCode: null
  },

  {
    id: 'best-time-buy-sell-stock-ii',
    title: 'Best Time to Buy and Sell Stock II',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/',
    tags: ['Array', 'Dynamic Programming', 'Greedy'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Bloomberg'],
    description: 'You may complete **as many transactions as you like** (buy then sell). You cannot hold more than one share at a time. Return the maximum profit.\n\n**Greedy:** sum every positive day-to-day delta. Each "rise" is a separate buy/sell cycle.',
    examples: 'Input: prices = [7,1,5,3,6,4]\nOutput: 7  (buy@1 sell@5; buy@3 sell@6)\n\nInput: prices = [1,2,3,4,5]\nOutput: 4',
    starterCode: null
  },

  {
    id: 'best-time-buy-sell-stock-with-cooldown',
    title: 'Best Time to Buy and Sell Stock with Cooldown',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/',
    tags: ['Array', 'Dynamic Programming'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Bloomberg'],
    description: 'Same as Stock II, but after selling you must wait **1 day cooldown** before buying again.\n\n**State-machine DP:** at each day track (held, sold, rest). Transitions: held = max(prev_held, prev_rest - price); sold = prev_held + price; rest = max(prev_rest, prev_sold).',
    examples: 'Input: prices = [1,2,3,0,2]\nOutput: 3  (buy@1 sell@2 cooldown buy@0 sell@2)',
    starterCode: null
  },

  {
    id: 'partition-equal-subset-sum',
    title: 'Partition Equal Subset Sum',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/partition-equal-subset-sum/',
    tags: ['Array', 'Dynamic Programming', 'Subset Sum'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta'],
    description: 'Given an integer array `nums`, return `true` if it can be partitioned into two subsets with **equal sums**.\n\n**Reduction → Subset Sum:** if total is odd → false. Otherwise check whether some subset sums to total/2 via 1D boolean DP.',
    examples: 'Input: nums = [1,5,11,5]\nOutput: true  ([1,5,5] and [11])\n\nInput: nums = [1,2,3,5]\nOutput: false',
    starterCode: null
  },

  {
    id: 'longest-palindromic-subsequence',
    title: 'Longest Palindromic Subsequence',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/longest-palindromic-subsequence/',
    tags: ['String', 'Dynamic Programming'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Bloomberg'],
    description: 'Given a string `s`, return the **length of its longest palindromic subsequence** (a subsequence keeps order, may skip characters).\n\n**DP:** dp[i][j] = LPS length of s[i..j]. If s[i]==s[j]: dp[i][j] = 2 + dp[i+1][j-1]. Else max(dp[i+1][j], dp[i][j-1]).',
    examples: 'Input: s = "bbbab"\nOutput: 4  ("bbbb")\n\nInput: s = "cbbd"\nOutput: 2  ("bb")',
    starterCode: null
  },

  {
    id: 'wildcard-matching',
    title: 'Wildcard Matching',
    category: 'Dynamic Programming',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/wildcard-matching/',
    tags: ['String', 'Dynamic Programming', 'Greedy', 'Recursion'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta', 'Bloomberg'],
    description: 'Implement wildcard pattern matching where `?` matches any single character and `*` matches any sequence (including empty). Return `true` iff the entire string `s` is matched.\n\n**DP:** dp[i][j] = whether s[:i] matches p[:j]. If p[j-1]==\'*\': dp[i][j] = dp[i-1][j] (match more) || dp[i][j-1] (match zero). Else if p[j-1]==\'?\' or chars match: dp[i][j] = dp[i-1][j-1].',
    examples: 'Input: s = "aa", p = "a"\nOutput: false\n\nInput: s = "aa", p = "*"\nOutput: true\n\nInput: s = "cb", p = "?a"\nOutput: false',
    starterCode: null
  },

  {
    id: '01-matrix',
    title: '01 Matrix',
    category: 'Graphs',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/01-matrix/',
    tags: ['Array', 'BFS', 'DP', 'Matrix'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple'],
    description: 'Given an m × n binary matrix `mat`, return the matrix where each cell holds the **distance to the nearest 0**.\n\n**Multi-source BFS** from all 0\'s simultaneously: each 1\'s shortest BFS distance to any 0 fills its cell.',
    examples: 'Input: [[0,0,0],[0,1,0],[1,1,1]]\nOutput: [[0,0,0],[0,1,0],[1,2,1]]',
    starterCode: null
  },

  {
    id: 'shortest-path-binary-matrix',
    title: 'Shortest Path in Binary Matrix',
    category: 'Graphs',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/shortest-path-in-binary-matrix/',
    tags: ['Array', 'BFS', 'Matrix'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple'],
    description: 'Given an n × n grid of 0s and 1s, return the **length of the shortest clear path from top-left to bottom-right** moving 8-directionally through 0-cells, or -1 if no such path exists.',
    examples: 'Input: grid = [[0,1],[1,0]]\nOutput: 2\n\nInput: grid = [[0,0,0],[1,1,0],[1,1,0]]\nOutput: 4',
    starterCode: null
  },

  {
    id: 'network-delay-time',
    title: 'Network Delay Time',
    category: 'Graphs',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/network-delay-time/',
    tags: ['Graph', 'Heap', "Dijkstra's", 'Shortest Path'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple'],
    description: 'You are given `times[i] = [u, v, w]` (directed edge u → v with travel time w), `n` nodes labeled 1..n, and a source `k`. Return the **minimum time** for a signal sent from `k` to reach **all** nodes, or -1 if not all reachable.\n\n**Dijkstra\'s algorithm** with a min-heap.',
    examples: 'Input: times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2\nOutput: 2',
    starterCode: null
  },

  {
    id: 'cheapest-flights-within-k-stops',
    title: 'Cheapest Flights Within K Stops',
    category: 'Graphs',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/cheapest-flights-within-k-stops/',
    tags: ['Graph', 'BFS', 'Dynamic Programming', 'Bellman-Ford'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple'],
    description: 'Given `n` cities, `flights[i] = [from, to, price]`, source `src`, destination `dst`, and integer `k`, return the **cheapest price** from src to dst with **at most k stops** (k+1 edges), or -1 if none exists.\n\n**Bellman-Ford** for k+1 iterations is the cleanest solution.',
    examples: 'Input: n=4, flights=[[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src=0, dst=3, k=1\nOutput: 700',
    starterCode: null
  },

  {
    id: 'find-median-from-data-stream',
    title: 'Find Median from Data Stream',
    category: 'Hash Maps',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/find-median-from-data-stream/',
    tags: ['Two Pointers', 'Design', 'Sorting', 'Heap', 'Data Stream'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta', 'Bloomberg'],
    description: 'Implement `MedianFinder` supporting `addNum(num)` and `findMedian()` in amortized O(log n) and O(1) respectively.\n\n**Two-heap solution:** max-heap (lower half) + min-heap (upper half). Keep sizes balanced. Median = top of larger heap, or average of two tops.',
    examples: 'addNum(1) addNum(2) findMedian()→1.5 addNum(3) findMedian()→2.0',
    starterCode: null
  },

  {
    id: 'snapshot-array',
    title: 'Snapshot Array',
    category: 'Hash Maps',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/snapshot-array/',
    tags: ['Array', 'Hash Map', 'Binary Search', 'Design'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple'],
    description: 'Implement `SnapshotArray(length)` that supports:\n- `set(index, val)` — set element at index.\n- `snap()` — take a snapshot, return its `snap_id` (incrementing from 0).\n- `get(index, snap_id)` — return the value at `index` as of that snapshot.\n\n**Per-index history:** for each index keep a sorted list of `(snap_id, value)` pairs. `get` does binary search by snap_id.',
    examples: 'SnapshotArray(3); set(0,5); snap()→0; set(0,6); get(0,0)→5',
    starterCode: null
  },

  // ═══════════════════════════════════════════════════════════════
  // ═══  BATCH 6 (parallel) — Trees, BST, LL, DP, Graphs, Matrix ═══
  // ═══════════════════════════════════════════════════════════════

  {
    id: 'maximum-width-of-binary-tree',
    title: 'Maximum Width of Binary Tree',
    category: 'Trees',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/maximum-width-of-binary-tree/',
    tags: ['Tree', 'BFS'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Bloomberg'],
    description: 'Return the maximum width of the tree. Width per level = distance from leftmost to rightmost non-null node, including null nodes between.\n\n**BFS with indexing:** root index = 1; left child = 2*i, right = 2*i + 1. Width = lastIdx - firstIdx + 1. Normalize per level (subtract firstIdx) to avoid long overflow on deep trees.',
    examples: 'Input: root = [1,3,2,5,3,null,9]\nOutput: 4',
    starterCode: null
  },

  {
    id: 'binary-tree-paths',
    title: 'Binary Tree Paths',
    category: 'Trees',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/binary-tree-paths/',
    tags: ['Tree', 'DFS', 'Backtracking'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple'],
    description: 'Return all root-to-leaf paths in any order, formatted as `"a->b->c"`. DFS while building a path string; emit at every leaf.',
    examples: 'Input: root = [1,2,3,null,5]\nOutput: ["1->2->5", "1->3"]',
    starterCode: null
  },

  {
    id: 'flip-equivalent-binary-trees',
    title: 'Flip Equivalent Binary Trees',
    category: 'Trees',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/flip-equivalent-binary-trees/',
    tags: ['Tree', 'DFS', 'Recursion'],
    companies: ['Google', 'Amazon'],
    description: 'A flip swaps a node\'s left and right children. Two trees are flip-equivalent iff some sequence of flips makes them identical.\n\n**Recursion:** flipEquiv(a, b) = both null OR (vals match AND ((flipEquiv(a.left,b.left) AND flipEquiv(a.right,b.right)) OR (flipEquiv(a.left,b.right) AND flipEquiv(a.right,b.left)))).',
    examples: 'Input: root1 = [1,2,3], root2 = [1,3,2]\nOutput: true',
    starterCode: null
  },

  {
    id: 'construct-binary-tree-inorder-postorder',
    title: 'Construct Binary Tree from Inorder and Postorder Traversal',
    category: 'Trees',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/',
    tags: ['Tree', 'DFS', 'Hash Map', 'Divide & Conquer'],
    companies: ['Amazon', 'Microsoft', 'Apple'],
    description: 'Given inorder + postorder of a binary tree, reconstruct it. The **last** element of postorder is the root; locate it in inorder to split left/right subtrees and recurse. Use an index map for O(1) lookup → O(n) total.',
    examples: 'Input: inorder = [9,3,15,20,7], postorder = [9,15,7,20,3]\nOutput: [3,9,20,null,null,15,7]',
    starterCode: null
  },

  {
    id: 'recover-binary-search-tree',
    title: 'Recover Binary Search Tree',
    category: 'Trees',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/recover-binary-search-tree/',
    tags: ['Tree', 'BST', 'DFS'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple'],
    description: 'Two nodes in a BST were swapped. Restore the BST without changing structure.\n\n**Approach:** inorder traversal yields sorted sequence in a valid BST. Find the two violations (prev > curr); swap their values. After fix, inorder must be strictly non-decreasing.',
    examples: 'Input: root = [1,3,null,null,2]\nOutput: [3,1,null,null,2]',
    starterCode: null
  },

  {
    id: 'reverse-nodes-in-k-group',
    title: 'Reverse Nodes in k-Group',
    category: 'Linked Lists',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/reverse-nodes-in-k-group/',
    tags: ['Linked List', 'Recursion'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta'],
    description: 'Reverse every k consecutive nodes. Leftover nodes (fewer than k) at the end stay as-is. Use a dummy node; for each group, first verify k more nodes exist, then reverse in place.',
    examples: 'Input: head = [1,2,3,4,5], k = 2\nOutput: [2,1,4,3,5]',
    starterCode: null
  },

  {
    id: 'rotate-list',
    title: 'Rotate List',
    category: 'Linked Lists',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/rotate-list/',
    tags: ['Linked List', 'Two Pointers'],
    companies: ['Amazon', 'Microsoft', 'Bloomberg'],
    description: 'Rotate the list to the right by `k` places. Find length, take `k mod length`, splice the tail to the front.',
    examples: 'Input: head = [1,2,3,4,5], k = 2\nOutput: [4,5,1,2,3]',
    starterCode: null
  },

  {
    id: 'copy-list-with-random-pointer',
    title: 'Copy List with Random Pointer',
    category: 'Linked Lists',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/copy-list-with-random-pointer/',
    tags: ['Linked List', 'Hash Map', 'Deep Copy'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta', 'Bloomberg'],
    description: 'Each node has `next` AND `random` pointers. Construct a deep copy: same structure, brand-new nodes, no shared references.\n\n**Two-pass with HashMap<Node, Node>:** clone all nodes mapped from originals; then wire `next` and `random` via the map.',
    examples: 'Input: head = [[7,null],[13,0],[11,4],[10,2],[1,0]]\nOutput: deep copy with same structure',
    starterCode: null
  },

  {
    id: 'unique-paths-ii',
    title: 'Unique Paths II',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/unique-paths-ii/',
    tags: ['DP', 'Matrix'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Bloomberg'],
    description: 'Like Unique Paths but with obstacles (1 = obstacle, 0 = free). dp[i][j] = 0 if obstacle, else dp[i-1][j] + dp[i][j-1]. Start or end on obstacle → return 0.',
    examples: 'Input: [[0,0,0],[0,1,0],[0,0,0]]\nOutput: 2',
    starterCode: null
  },

  {
    id: 'perfect-squares',
    title: 'Perfect Squares',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/perfect-squares/',
    tags: ['DP', 'BFS', 'Math'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Bloomberg'],
    description: 'Return least number of perfect squares (1, 4, 9, 16, …) summing to n.\n\n**DP recurrence:** dp[n] = 1 + min(dp[n - i*i]) for i*i ≤ n; dp[0] = 0.\n\n**Lagrange four-square theorem:** answer is always 1, 2, 3, or 4.',
    examples: 'Input: n = 12\nOutput: 3  (4+4+4)',
    starterCode: null
  },

  {
    id: 'interleaving-string',
    title: 'Interleaving String',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/interleaving-string/',
    tags: ['DP', 'String'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Bloomberg'],
    description: 'Return true iff s3 is formed by interleaving s1 and s2 (preserving each\'s order).\n\n**2D DP:** dp[i][j] = whether s3[:i+j] is interleaving of s1[:i] and s2[:j]. Transition: dp[i][j] = (dp[i-1][j] && s1[i-1]==s3[i+j-1]) || (dp[i][j-1] && s2[j-1]==s3[i+j-1]).',
    examples: 'Input: s1="aabcc", s2="dbbca", s3="aadbbcbcac"\nOutput: true',
    starterCode: null
  },

  {
    id: 'distinct-subsequences',
    title: 'Distinct Subsequences',
    category: 'Dynamic Programming',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/distinct-subsequences/',
    tags: ['DP', 'String'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple'],
    description: 'Return number of distinct subsequences of s that equal t.\n\n**2D DP:** dp[i][j] = ways s[:i] forms t[:j]. If chars match: dp[i-1][j-1] + dp[i-1][j]. Else dp[i-1][j]. Base: dp[i][0] = 1.',
    examples: 'Input: s="rabbbit", t="rabbit"\nOutput: 3',
    starterCode: null
  },

  {
    id: 'frog-jump',
    title: 'Frog Jump',
    category: 'Dynamic Programming',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/frog-jump/',
    tags: ['DP', 'Hash Map'],
    companies: ['Amazon', 'Google', 'Microsoft'],
    description: 'A frog starts at the first stone. Each jump of size k can be followed by a jump of k-1, k, or k+1 (positive). First jump must be 1 unit. Return true if it can reach the last stone.\n\n**Map<position, Set<jumpSize>>:** for each reachable stone, track jump sizes that landed there.',
    examples: 'Input: stones = [0,1,3,5,6,8,12,17]\nOutput: true',
    starterCode: null
  },

  {
    id: 'maximal-rectangle',
    title: 'Maximal Rectangle',
    category: 'Dynamic Programming',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/maximal-rectangle/',
    tags: ['DP', 'Stack', 'Monotonic Stack'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta'],
    description: 'Given binary matrix (0/1), find max-area rectangle of 1s.\n\n**Reduces to "Largest Rectangle in Histogram":** treat each row as the base; heights[j] = consecutive 1s in column j ending at this row (reset to 0 on a 0). Apply histogram subroutine row by row.',
    examples: 'Input: [[1,0,1,0,0],[1,0,1,1,1],[1,1,1,1,1],[1,0,0,1,0]]\nOutput: 6',
    starterCode: null
  },

  {
    id: 'regular-expression-matching',
    title: 'Regular Expression Matching',
    category: 'Dynamic Programming',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/regular-expression-matching/',
    tags: ['DP', 'Recursion', 'String'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta', 'Bloomberg'],
    description: 'Implement regex matching with `.` (any single char) and `*` (zero or more of preceding element). Match must cover the **entire** string.\n\n**2D DP:** dp[i][j] = whether s[:i] matches p[:j]. When p[j-1] is `*`: zero occurrences (dp[i][j-2]) OR match more (dp[i-1][j] when p[j-2] matches s[i-1]).',
    examples: 'Input: s="aa", p="a*"\nOutput: true',
    starterCode: null
  },

  {
    id: 'partition-to-k-equal-sum-subsets',
    title: 'Partition to K Equal Sum Subsets',
    category: 'Backtracking',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/partition-to-k-equal-sum-subsets/',
    tags: ['Backtracking', 'Bitmask DP'],
    companies: ['Amazon', 'Google', 'Microsoft'],
    description: 'Partition `nums` into k non-empty subsets with equal sums. If `total % k != 0` → false. Sort descending; backtracking places each num into one of k buckets, skipping overflow and equivalent buckets.',
    examples: 'Input: nums = [4,3,2,3,5,2,1], k = 4\nOutput: true  ((5),(1,4),(2,3),(2,3))',
    starterCode: null
  },

  {
    id: 'most-stones-removed',
    title: 'Most Stones Removed with Same Row or Column',
    category: 'Graphs',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/most-stones-removed-with-same-row-or-column/',
    tags: ['Union-Find', 'Graph', 'DFS'],
    companies: ['Amazon', 'Google'],
    description: 'A stone can be removed if it shares a row or column with another stone. Return max removable stones.\n\n**Insight:** stones connected via shared row/col form components; each component of size k contributes k-1 removals. Answer = n - (number of components). Union-Find on (row, col + offset).',
    examples: 'Input: stones = [[0,0],[0,1],[1,0],[1,2],[2,1],[2,2]]\nOutput: 5',
    starterCode: null
  },

  {
    id: 'min-cost-connect-points',
    title: 'Min Cost to Connect All Points',
    category: 'Graphs',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/min-cost-to-connect-all-points/',
    tags: ['MST', 'Prim', 'Kruskal', 'Union-Find', 'Graph'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple'],
    description: 'Connect all points with minimum total Manhattan distance (MST). **Prim\'s O(n²)** is optimal for dense graphs: maintain `minDist[]` from current tree to non-tree vertices.',
    examples: 'Input: points = [[0,0],[2,2],[3,10],[5,2],[7,0]]\nOutput: 20',
    starterCode: null
  },

  {
    id: 'path-min-effort',
    title: 'Path With Minimum Effort',
    category: 'Graphs',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/path-with-minimum-effort/',
    tags: ['Dijkstra', 'Binary Search', 'Graph'],
    companies: ['Amazon', 'Google', 'Microsoft'],
    description: 'Min effort path top-left to bottom-right; effort = max abs height-difference along the path.\n\n**Modified Dijkstra:** PQ ordered by max-edge-weight along the path so far. Tentative effort to neighbor = max(currentEffort, |h[u] - h[v]|).',
    examples: 'Input: heights = [[1,2,2],[3,8,2],[5,3,5]]\nOutput: 2',
    starterCode: null
  },

  {
    id: 'number-of-ways-shortest-path',
    title: 'Number of Ways to Arrive at Destination',
    category: 'Graphs',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/number-of-ways-to-arrive-at-destination/',
    tags: ['Dijkstra', 'Shortest Path', 'DP'],
    companies: ['Amazon', 'Google'],
    description: 'Return number of shortest-path routes from 0 to n-1, modulo 10^9+7.\n\n**Modified Dijkstra:** track ways[v] in addition to dist[v]. Relax: if new dist == dist[v] then ways[v] += ways[u]; if strictly less, replace.',
    examples: 'Input: n = 7, roads = [...]\nOutput: 4',
    starterCode: null
  },

  {
    id: 'knight-dialer',
    title: 'Knight Dialer',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/knight-dialer/',
    tags: ['DP', 'Math'],
    companies: ['Google', 'Amazon'],
    description: 'On a phone keypad, knight starts on any digit and hops n-1 times. Return distinct dial-able numbers of length n, mod 10^9+7.\n\n**Adjacency:** 0→{4,6}, 1→{6,8}, 2→{7,9}, 3→{4,8}, 4→{0,3,9}, 5→{}, 6→{0,1,7}, 7→{2,6}, 8→{1,3}, 9→{2,4}.\n\nDP: dp[i][d] = ways to dial length-i ending at digit d.',
    examples: 'Input: n = 1\nOutput: 10\n\nInput: n = 2\nOutput: 20',
    starterCode: null
  },

  {
    id: 'longest-increasing-path-matrix',
    title: 'Longest Increasing Path in a Matrix',
    category: 'Graphs',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/longest-increasing-path-in-a-matrix/',
    tags: ['DFS', 'Memoization', 'DP', 'Graph'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta'],
    description: 'Find length of longest strictly-increasing path (4-directional moves). DFS + memoization: f(r,c) = 1 + max(f(neighbors with larger values)). Each cell computed once.',
    examples: 'Input: matrix = [[9,9,4],[6,6,8],[2,1,1]]\nOutput: 4',
    starterCode: null
  },

  {
    id: 'longest-consecutive-sequence',
    title: 'Longest Consecutive Sequence',
    category: 'Hash Maps',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/longest-consecutive-sequence/',
    tags: ['Hash Set', 'Array', 'Union Find'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    description: 'Given an unsorted array of integers `nums`, return the length of the longest consecutive elements sequence. You must write an algorithm that runs in **O(n)** time.\n\n**Approach:** put every number into a `HashSet`. Then for each number `n`, only start counting a run when `n - 1` is NOT in the set (so `n` is the smallest element of its run). Walk forward `n, n+1, n+2, ...` while the next number is in the set, and track the longest run. Each element is visited at most twice, giving amortized O(n).',
    examples: 'Input: nums = [100,4,200,1,3,2]\nOutput: 4\nExplanation: The longest consecutive sequence is [1, 2, 3, 4].\n\nInput: nums = [0,3,7,2,5,8,4,6,0,1]\nOutput: 9',
    starterCode: null
  },
  {
    id: 'minimum-size-subarray-sum',
    title: 'Minimum Size Subarray Sum',
    category: 'Sliding Window',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/minimum-size-subarray-sum/',
    tags: ['Sliding Window', 'Array', 'Binary Search', 'Prefix Sum'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    description: 'Given an array of positive integers `nums` and a positive integer `target`, return the **minimal length** of a contiguous subarray whose sum is **greater than or equal to** `target`. If no such subarray exists, return 0.\n\n**Approach — variable-size sliding window:** expand `right` and accumulate the running sum. While the sum is >= target, update the answer with the current window length and shrink from the left. O(n) time, O(1) space.',
    examples: 'Input: target = 7, nums = [2,3,1,2,4,3]\nOutput: 2\nExplanation: The subarray [4,3] has the minimal length.\n\nInput: target = 4, nums = [1,4,4]\nOutput: 1',
    starterCode: null
  },
  {
    id: 'trapping-rain-water',
    title: 'Trapping Rain Water',
    category: 'Two Pointers',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/trapping-rain-water/',
    tags: ['Two Pointers', 'Array', 'Dynamic Programming', 'Stack'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft', 'Apple'],
    description: 'Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.\n\n**Approach — two pointers:** keep `left`, `right` pointers and track `leftMax`, `rightMax` seen so far. At each step, whichever side has the smaller max bounds the water level there (the other side is guaranteed to have a taller bar somewhere). Move the smaller side inward, updating its max and adding `max - height` to the answer. O(n) time, O(1) space.',
    examples: 'Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]\nOutput: 6\n\nInput: height = [4,2,0,3,2,5]\nOutput: 9',
    starterCode: null
  },
  {
    id: 'sort-colors',
    title: 'Sort Colors',
    category: 'Two Pointers',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/sort-colors/',
    tags: ['Two Pointers', 'Array', 'Sorting', 'Dutch National Flag'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    description: 'Given an array `nums` with `n` objects colored red (0), white (1), or blue (2), sort them **in-place** so that objects of the same color are adjacent, in the order 0, 1, 2. You must solve this without using the library sort, ideally in one pass.\n\n**Approach — Dutch National Flag (3 pointers):** maintain `low` (next slot for 0), `mid` (scanner), `high` (next slot for 2). If `nums[mid]==0` swap with `low` and advance both; if `==1` just advance `mid`; if `==2` swap with `high` and decrement `high` (do NOT advance `mid` since the swapped-in value is unexamined). O(n) time, O(1) space.',
    examples: 'Input: nums = [2,0,2,1,1,0]\nOutput: [0,0,1,1,2,2]\n\nInput: nums = [2,0,1]\nOutput: [0,1,2]',
    starterCode: null
  },
  {
    id: 'find-all-anagrams-in-a-string',
    title: 'Find All Anagrams in a String',
    category: 'Sliding Window',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/find-all-anagrams-in-a-string/',
    tags: ['Sliding Window', 'Hash Map', 'String'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    description: 'Given two strings `s` and `p`, return an array of all the **start indices** of p-anagrams in `s`. An anagram is a permutation of `p`.\n\n**Approach — fixed-size sliding window with char counts:** build a frequency array (size 26) for `p`. Slide a window of length `p.length()` over `s`, maintaining a matching frequency array. Add the next char, remove the leftmost char when the window overflows, and record the start index whenever the two frequency arrays are equal. O(n) time, O(1) extra space.',
    examples: 'Input: s = "cbaebabacd", p = "abc"\nOutput: [0, 6]\nExplanation: s[0..2] = "cba" and s[6..8] = "bac" are both anagrams of "abc".\n\nInput: s = "abab", p = "ab"\nOutput: [0, 1, 2]',
    starterCode: null
  },
  {
    id: 'longest-substring-with-at-most-k-distinct-characters',
    title: 'Longest Substring with At Most K Distinct Characters',
    category: 'Sliding Window',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/longest-substring-with-at-most-k-distinct-characters/',
    tags: ['Sliding Window', 'Hash Map', 'String'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    description: 'Given a string `s` and an integer `k`, return the length of the longest substring of `s` that contains **at most k distinct characters**.\n\n**Approach — variable-size sliding window:** expand `right`, tracking a char-count map. While the number of distinct chars in the window exceeds `k`, shrink from the left (decrement counts, remove entries that hit 0). The window is always valid after the shrink step, so update the max length each iteration. O(n) time, O(k) space.',
    examples: 'Input: s = "eceba", k = 2\nOutput: 3\nExplanation: "ece" has length 3 with 2 distinct chars.\n\nInput: s = "aa", k = 1\nOutput: 2',
    starterCode: null
  },
  {
    id: 'fruit-into-baskets',
    title: 'Fruit Into Baskets',
    category: 'Sliding Window',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/fruit-into-baskets/',
    tags: ['Sliding Window', 'Hash Map', 'Array'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    description: 'You are visiting a farm with a single row of fruit trees, given by `fruits[i]` (the type of fruit at tree i). You have two baskets, each holding a single fruit type but unlimited count. Starting from any tree, pick exactly one fruit from every tree moving right until you encounter a third fruit type. Return the **maximum number of fruits** you can collect.\n\n**Translation:** find the length of the longest contiguous subarray with **at most 2 distinct values**. Classic variable-size sliding window — expand right, shrink left while distinct count > 2. O(n) time, O(1) space.',
    examples: 'Input: fruits = [1,2,1]\nOutput: 3\n\nInput: fruits = [0,1,2,2]\nOutput: 3\nExplanation: pick [1,2,2].\n\nInput: fruits = [1,2,3,2,2]\nOutput: 4',
    starterCode: null
  },
{
    id: 'serialize-deserialize-binary-tree',
    title: 'Serialize and Deserialize Binary Tree',
    category: 'Trees',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/',
    tags: ['Tree', 'Design', 'BFS', 'DFS'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft', 'LinkedIn'],
    description: 'Design an algorithm to serialize and deserialize a binary tree. Serialization turns a tree into a string so it can be stored or transmitted, and deserialization reconstructs the original tree from that string.\n\nThere is no restriction on the format you use — just ensure the tree can be reconstructed exactly. A common approach is a pre-order traversal using a sentinel (e.g. "null") for missing children.',
    examples: 'Input: root = [1,2,3,null,null,4,5]\nOutput: [1,2,3,null,null,4,5]\n\nRound-trip property: deserialize(serialize(root)) must produce a tree equivalent to root.',
    starterCode: null
  },
  {
    id: 'populating-next-right-pointers-ii',
    title: 'Populating Next Right Pointers in Each Node II',
    category: 'Trees',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/populating-next-right-pointers-in-each-node-ii/',
    tags: ['Tree', 'BFS', 'Linked List'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft', 'Bloomberg'],
    description: 'Given a binary tree where each node has an extra `next` pointer, populate each `next` pointer so that it points to the next node on the same level. If there is no next node on that level, `next` should remain `null`.\n\nUnlike the perfect-tree variant, this tree is not guaranteed to be complete, so the O(1)-space solution needs to build each level from the previous one using the already-wired `next` chain.',
    examples: 'Input: root = [1,2,3,4,5,null,7]\nOutput levels via next: [[1], [2, 3], [4, 5, 7]]',
    starterCode: null
  },
  {
    id: 'count-complete-tree-nodes',
    title: 'Count Complete Tree Nodes',
    category: 'Trees',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/count-complete-tree-nodes/',
    tags: ['Tree', 'Binary Search', 'DFS'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Apple'],
    description: 'Given the root of a complete binary tree, return the number of nodes in the tree. A complete binary tree has every level except possibly the last fully filled, and the last level filled from left to right.\n\nA naive DFS counts in O(n). The optimal solution exploits completeness by comparing left-spine and right-spine heights, running in O(log^2 n).',
    examples: 'Input: root = [1,2,3,4,5,6]\nOutput: 6',
    starterCode: null
  },
  {
    id: 'lowest-common-ancestor-bst',
    title: 'Lowest Common Ancestor of a Binary Search Tree',
    category: 'Trees',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/',
    tags: ['Tree', 'BST', 'DFS'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft', 'LinkedIn'],
    description: 'Given a BST and two node values p and q, return the value of their lowest common ancestor. The LCA is the deepest node that has both p and q in its subtree (a node can be a descendant of itself).\n\nBecause the tree is a BST, you can walk from the root: if both p and q are smaller, go left; if both are larger, go right; otherwise the current node splits them and is the LCA.',
    examples: 'Input: root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8\nOutput: 6\n\nInput: root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 4\nOutput: 2 (a node can be its own ancestor)',
    starterCode: null
  },
  {
    id: 'path-sum-iii',
    title: 'Path Sum III',
    category: 'Trees',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/path-sum-iii/',
    tags: ['Tree', 'DFS', 'Prefix Sum'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    description: 'Given the root of a binary tree and an integer targetSum, return the number of paths where the sum of the values along the path equals targetSum. Paths do not need to start at the root or end at a leaf, but they must go downward (parent to child).\n\nA prefix-sum + HashMap solution runs in O(n). For each node you record the running sum from the root; the number of valid paths ending at this node equals the count of previously-seen prefix sums equal to (running - target).',
    examples: 'Input: root = [10,5,-3,3,2,null,11,3,-2,null,1], targetSum = 8\nOutput: 3',
    starterCode: null
  },
  {
    id: 'redundant-connection',
    title: 'Redundant Connection',
    category: 'Graphs',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/redundant-connection/',
    tags: ['Graph', 'Union Find', 'DFS', 'BFS'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    description: 'You start with a tree of n nodes labeled 1..n, then exactly one extra edge is added, producing a graph with n nodes and n edges. Return the edge that can be removed so the remaining graph is a tree of n nodes. If multiple answers exist, return the one that occurs last in the input.\n\nClassic Union-Find: iterate through edges; for each edge (u, v), if u and v already share a root, this edge closes a cycle and is the answer. Otherwise union them.',
    examples: 'Input: edges = [[1,2],[1,3],[2,3]]\nOutput: [2, 3]',
    starterCode: null
  },
  {
    id: 'accounts-merge',
    title: 'Accounts Merge',
    category: 'Graphs',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/accounts-merge/',
    tags: ['Graph', 'Union Find', 'DFS', 'Hash Table'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft', 'Airbnb'],
    description: 'Given a list of `accounts` where each entry is `[name, email1, email2, ...]`, merge accounts that share any email into a single account. Two accounts belong to the same person if they share at least one email. Same name alone does not imply same person.\n\nReturn the merged accounts with emails sorted and the name in front. The classic approach is Union-Find over emails, then grouping.\n\nIn this harness, `main()` only checks the number of merged accounts, which is easier to verify than the full structure.',
    examples: 'Input: accounts = [["John","a@x","b@x"],["John","b@x","c@x"],["Mary","m@x"],["John","j@x"]]\nMerged accounts size: 3 (the three Johns collapse to one via shared emails; Mary stays separate.)',
    starterCode: null
  },
{
    id: 'best-time-buy-sell-stock-iii',
    title: 'Best Time to Buy and Sell Stock III',
    category: 'Dynamic Programming',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/',
    tags: ['Array', 'Dynamic Programming'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    description: 'You are given an array **prices** where prices[i] is the price of a given stock on the i-th day. Find the maximum profit you can achieve. You may complete **at most two transactions**.\n\nNote: You may not engage in multiple transactions simultaneously (i.e., you must sell the stock before you buy again). Classic state-machine DP problem: track buy1, sell1, buy2, sell2 profits in a single pass.',
    examples: 'Input: prices = [3,3,5,0,0,3,1,4]\nOutput: 6\nExplanation: Buy on day 4 (price=0), sell on day 6 (price=3), profit=3. Then buy on day 7 (price=1), sell on day 8 (price=4), profit=3. Total=6.',
    starterCode: null
  },
  {
    id: 'best-time-buy-sell-stock-iv',
    title: 'Best Time to Buy and Sell Stock IV',
    category: 'Dynamic Programming',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/',
    tags: ['Array', 'Dynamic Programming'],
    companies: ['Google', 'Amazon', 'Bloomberg', 'Citadel'],
    description: 'You are given an integer array **prices** where prices[i] is the price of a given stock on the i-th day, and an integer **k**. Find the maximum profit you can achieve. You may complete **at most k transactions**.\n\nGeneralization of stock problems I-III. When k is large (k >= n/2), degenerates to unlimited transactions (sum of positive diffs). Otherwise use 2D DP: dp[t][i] = max profit with at most t transactions by day i.',
    examples: 'Input: k = 2, prices = [3,2,6,5,0,3]\nOutput: 7\nExplanation: Buy at 2, sell at 6 (profit 4). Buy at 0, sell at 3 (profit 3). Total = 7.',
    starterCode: null
  },
  {
    id: 'burst-balloons',
    title: 'Burst Balloons',
    category: 'Dynamic Programming',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/burst-balloons/',
    tags: ['Array', 'Dynamic Programming', 'Interval DP'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta'],
    description: 'You are given n balloons, indexed from 0 to n-1. Each balloon is painted with a number on it represented by an array **nums**. You are asked to burst all the balloons. If you burst the i-th balloon, you get nums[left] * nums[i] * nums[right] coins, where left and right are the adjacent balloon indices.\n\nAfter bursting, left and right become adjacent. Return the maximum coins you can collect. Classic **interval DP**: think about which balloon to burst **last** in each subinterval.',
    examples: 'Input: nums = [3,1,5,8]\nOutput: 167\nExplanation: nums = [3,1,5,8] -> [3,5,8] -> [3,8] -> [8] -> []. Coins: 3*1*5 + 3*5*8 + 1*3*8 + 1*8*1 = 15+120+24+8 = 167.',
    starterCode: null
  },
  {
    id: 'russian-doll-envelopes',
    title: 'Russian Doll Envelopes',
    category: 'Dynamic Programming',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/russian-doll-envelopes/',
    tags: ['Array', 'Binary Search', 'Dynamic Programming', 'LIS'],
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: 'You are given a 2D array of integers **envelopes** where envelopes[i] = [w_i, h_i] representing the width and the height of an envelope. One envelope can fit into another if and only if both the width and height are **strictly greater** than the other envelope.\n\nReturn the maximum number of envelopes you can Russian doll (put one inside the other). Trick: sort by width ascending, but when widths tie, sort heights **descending** — then LIS on heights gives the answer.',
    examples: 'Input: envelopes = [[5,4],[6,4],[6,7],[2,3]]\nOutput: 3\nExplanation: The maximum number of envelopes you can Russian doll is 3: [2,3] => [5,4] => [6,7].',
    starterCode: null
  },
  {
    id: 'k-closest-points-origin',
    title: 'K Closest Points to Origin',
    category: 'Sorting & Searching',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/k-closest-points-to-origin/',
    tags: ['Array', 'Heap', 'Divide and Conquer', 'Quickselect'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft', 'LinkedIn'],
    description: 'Given an array of points where points[i] = [x_i, y_i] represents a point on the X-Y plane and an integer **k**, return the **k closest points to the origin** (0, 0). The distance between two points is the Euclidean distance.\n\nThe answer may be returned in any order. Common approaches: max-heap of size k (O(n log k)), or Quickselect (O(n) average).\n\n**Note on tests**: since the returned order is arbitrary and ties at the boundary can pick any valid subset, tests below print the **sum of squared distances** of returned points — this is a deterministic invariant.',
    examples: 'Input: points = [[1,3],[-2,2]], k = 1\nOutput: [[-2,2]]\nExplanation: The distance between (-2,2) and origin is sqrt(8) ~= 2.83, less than (1,3) which is sqrt(10) ~= 3.16.',
    starterCode: null
  },
  {
    id: 'maximum-product-of-three-numbers',
    title: 'Maximum Product of Three Numbers',
    category: 'Arrays',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/maximum-product-of-three-numbers/',
    tags: ['Array', 'Math', 'Sorting'],
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: 'Given an integer array **nums**, find three numbers whose product is maximum and return the **maximum product**.\n\nKey insight: the max product is either (a) the three largest numbers, or (b) the two smallest (most negative) multiplied by the largest. O(n) solution: track top-3 max and bottom-2 min in a single pass.',
    examples: 'Input: nums = [1,2,3,4]\nOutput: 24\nExplanation: 2 * 3 * 4 = 24.',
    starterCode: null
  },
  {
    id: 'minimum-cost-for-tickets',
    title: 'Minimum Cost For Tickets',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/minimum-cost-for-tickets/',
    tags: ['Array', 'Dynamic Programming'],
    companies: ['Google', 'Amazon', 'Bloomberg'],
    description: 'You have planned trips in a year, given by an integer array **days**. Each day is an integer from 1 to 365. Train tickets are sold in three different ways: a 1-day pass, a 7-day pass, and a 30-day pass, with costs given by **costs**.\n\nReturn the **minimum number of dollars** you need to travel on every day in the given list of days. DP over days: dp[i] = min cost to cover days up to day i; at each travel day, try each pass.',
    examples: 'Input: days = [1,4,6,7,8,20], costs = [2,7,15]\nOutput: 11\nExplanation: Day 1: 1-day pass ($2). Day 3: 7-day pass covering days 3-9 ($7). Day 20: 1-day pass ($2). Total = $11.',
    starterCode: null
  },

  {
    id: 'valid-palindrome',
    title: 'Valid Palindrome',
    category: 'Two Pointers',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/valid-palindrome/',
    tags: ['String', 'Two Pointers'],
    companies: ['Google', 'Facebook', 'Microsoft', 'Amazon'],
    description: 'A phrase is a **palindrome** if, after converting all uppercase letters into lowercase and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nGiven a string **s**, return **true** if it is a palindrome, or **false** otherwise.',
    examples: 'Input: s = "A man, a plan, a canal: Panama"\nOutput: true\nExplanation: "amanaplanacanalpanama" is a palindrome.',
    starterCode: null
  },
  {
    id: 'first-unique-character',
    title: 'First Unique Character in a String',
    category: 'Hash Maps',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/first-unique-character-in-a-string/',
    tags: ['String', 'Hash Map', 'Counting'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Bloomberg'],
    description: 'Given a string **s**, find the first non-repeating character in it and return its index. If it does not exist, return **-1**.\n\nUse a frequency map or counter array, then scan once to find the first character with count 1.',
    examples: 'Input: s = "leetcode"\nOutput: 0\n\nInput: s = "loveleetcode"\nOutput: 2\n\nInput: s = "aabb"\nOutput: -1',
    starterCode: null
  },
  {
    id: 'single-number',
    title: 'Single Number',
    category: 'Arrays',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/single-number/',
    tags: ['Array', 'Bit Manipulation', 'XOR'],
    companies: ['Google', 'Amazon', 'Apple', 'Microsoft'],
    description: 'Given a **non-empty** array of integers **nums**, every element appears twice except for one. Find that single one.\n\nYou must implement a solution with linear runtime complexity and use only constant extra space. XOR is the classic trick: **a ^ a = 0**, **a ^ 0 = a**, so XORing all elements cancels duplicates.',
    examples: 'Input: nums = [2,2,1]\nOutput: 1\n\nInput: nums = [4,1,2,1,2]\nOutput: 4',
    starterCode: null
  },
  {
    id: 'missing-number',
    title: 'Missing Number',
    category: 'Arrays',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/missing-number/',
    tags: ['Array', 'Math', 'Bit Manipulation', 'Hash Table'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Bloomberg'],
    description: 'Given an array **nums** containing **n** distinct numbers in the range **[0, n]**, return the only number in the range that is missing from the array.\n\nClassic approaches: sum formula **n*(n+1)/2 - sum(nums)**, or XOR indices with values.',
    examples: 'Input: nums = [3,0,1]\nOutput: 2\n\nInput: nums = [0,1]\nOutput: 2\n\nInput: nums = [9,6,4,2,3,5,7,0,1]\nOutput: 8',
    starterCode: null
  },
  {
    id: 'isomorphic-strings',
    title: 'Isomorphic Strings',
    category: 'Hash Maps',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/isomorphic-strings/',
    tags: ['String', 'Hash Map'],
    companies: ['Google', 'LinkedIn', 'Amazon'],
    description: 'Given two strings **s** and **t**, determine if they are **isomorphic**.\n\nTwo strings are isomorphic if the characters in **s** can be replaced to get **t**, with the constraint that all occurrences of a character must be replaced with another character while preserving the order, and no two characters may map to the same character (i.e., the mapping is a **bijection**).',
    examples: 'Input: s = "egg", t = "add"\nOutput: true\n\nInput: s = "foo", t = "bar"\nOutput: false\n\nInput: s = "paper", t = "title"\nOutput: true',
    starterCode: null
  },
  {
    id: 'longest-common-prefix',
    title: 'Longest Common Prefix',
    category: 'Strings',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/longest-common-prefix/',
    tags: ['String', 'Trie'],
    companies: ['Google', 'Amazon', 'Apple', 'Microsoft'],
    description: 'Write a function to find the longest common prefix string amongst an array of strings.\n\nIf there is no common prefix, return an empty string **""**. Vertical scanning is a simple approach: compare character at each index across all strings.',
    examples: 'Input: strs = ["flower","flow","flight"]\nOutput: "fl"\n\nInput: strs = ["dog","racecar","car"]\nOutput: ""',
    starterCode: null
  },
  {
    id: 'three-sum-closest',
    title: '3Sum Closest',
    category: 'Two Pointers',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/3sum-closest/',
    tags: ['Array', 'Two Pointers', 'Sorting'],
    companies: ['Google', 'Amazon', 'Facebook', 'Bloomberg'],
    description: 'Given an integer array **nums** of length **n** and an integer **target**, find three integers in **nums** such that the sum is closest to **target**. Return the sum of the three integers.\n\nYou may assume that each input would have exactly one solution. Sort and use two pointers inside a loop for **O(n^2)**.',
    examples: 'Input: nums = [-1,2,1,-4], target = 1\nOutput: 2\nExplanation: The sum that is closest to the target is 2 (-1 + 2 + 1 = 2).',
    starterCode: null
  },
  {
    id: 'happy-number',
    title: 'Happy Number',
    category: 'Hash Maps',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/happy-number/',
    tags: ['Hash Map', 'Math', 'Two Pointers', 'Cycle Detection'],
    companies: ['Google', 'Airbnb', 'Microsoft'],
    description: 'A **happy number** is a number defined by the following process: starting with any positive integer, replace the number by the sum of the squares of its digits. Repeat the process until the number equals **1** (happy), or it loops endlessly in a cycle which does not include 1.\n\nReturn **true** if n is a happy number, and **false** if not. Detect cycles with a HashSet or Floyd\'s fast/slow pointers.',
    examples: 'Input: n = 19\nOutput: true\nExplanation: 1² + 9² = 82; 8² + 2² = 68; 6² + 8² = 100; 1² + 0² + 0² = 1.',
    starterCode: null
  },
  {
    id: 'length-of-last-word',
    title: 'Length of Last Word',
    category: 'Strings',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/length-of-last-word/',
    tags: ['String'],
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: 'Given a string **s** consisting of words and spaces, return the length of the **last** word in the string.\n\nA word is a maximal substring consisting of non-space characters only. Scan from the right: skip trailing spaces, then count characters until the next space or the start of the string.',
    examples: 'Input: s = "Hello World"\nOutput: 5\n\nInput: s = "   fly me   to   the moon  "\nOutput: 4',
    starterCode: null
  },
  {
    id: 'ransom-note',
    title: 'Ransom Note',
    category: 'Hash Maps',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/ransom-note/',
    tags: ['String', 'Hash Map', 'Counting'],
    companies: ['Google', 'Apple', 'Microsoft'],
    description: 'Given two strings **ransomNote** and **magazine**, return **true** if **ransomNote** can be constructed by using the letters from **magazine**, and **false** otherwise.\n\nEach letter in **magazine** can only be used **once** in **ransomNote**. Count letters in the magazine, then decrement for each letter needed by the note.',
    examples: 'Input: ransomNote = "a", magazine = "b"\nOutput: false\n\nInput: ransomNote = "aa", magazine = "aab"\nOutput: true',
    starterCode: null
  },
  {
    id: 'plus-one',
    title: 'Plus One',
    category: 'Arrays',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/plus-one/',
    tags: ['Array', 'Math'],
    companies: ['Google', 'Amazon', 'Apple'],
    description: 'You are given a **large integer** represented as an integer array **digits**, where each **digits[i]** is the **i-th** digit of the integer (most significant first). The large integer does not contain any leading **0**s.\n\nIncrement the large integer by one and return the resulting array of digits. Handle carry propagation; if the entire array becomes carry (e.g., 999 → 1000), allocate a new array with length + 1.',
    examples: 'Input: digits = [1,2,3]\nOutput: [1,2,4]\n\nInput: digits = [9]\nOutput: [1,0]',
    starterCode: null
  },
  {
    id: 'pascals-triangle',
    title: "Pascal's Triangle",
    category: 'Arrays',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/pascals-triangle/',
    tags: ['Array', 'Dynamic Programming'],
    companies: ['Google', 'Amazon', 'Apple', 'Microsoft'],
    description: "Given an integer **numRows**, return the first **numRows** of **Pascal's triangle**.\n\nIn Pascal's triangle, each number is the sum of the two numbers directly above it. Row **i** has **i+1** entries; row starts and ends with 1, and interior values use **triangle[i-1][j-1] + triangle[i-1][j]**.",
    examples: 'Input: numRows = 5\nOutput: [[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]',
    starterCode: null
  },
  {
    id: 'intersection-of-two-linked-lists',
    title: 'Intersection of Two Linked Lists',
    category: 'Linked Lists',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/intersection-of-two-linked-lists/',
    tags: ['Linked List', 'Two Pointers', 'Hash Table'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple'],
    description: 'Given the heads of two singly linked-lists headA and headB, return the node at which the two lists intersect. If the two linked lists have no intersection at all, return null. The test cases are generated such that there are no cycles anywhere in the entire linked structure.',
    examples: 'Input: intersectVal = 8, listA = [4,1,8,4,5], listB = [5,6,1,8,4,5], skipA = 2, skipB = 3\nOutput: Intersected at 8',
    starterCode: null
  },
  {
    id: 'remove-duplicates-sorted-list',
    title: 'Remove Duplicates from Sorted List',
    category: 'Linked Lists',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/remove-duplicates-from-sorted-list/',
    tags: ['Linked List'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Apple'],
    description: 'Given the head of a sorted linked list, delete all duplicates such that each element appears only once. Return the linked list sorted as well.',
    examples: 'Input: head = [1,1,2]\nOutput: [1,2]',
    starterCode: null
  },
  {
    id: 'remove-duplicates-sorted-list-ii',
    title: 'Remove Duplicates from Sorted List II',
    category: 'Linked Lists',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/remove-duplicates-from-sorted-list-ii/',
    tags: ['Linked List', 'Two Pointers'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta'],
    description: 'Given the head of a sorted linked list, delete all nodes that have duplicate numbers, leaving only distinct numbers from the original list. Return the linked list sorted as well.',
    examples: 'Input: head = [1,2,3,3,4,4,5]\nOutput: [1,2,5]',
    starterCode: null
  },
  {
    id: 'swap-nodes-in-pairs',
    title: 'Swap Nodes in Pairs',
    category: 'Linked Lists',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/swap-nodes-in-pairs/',
    tags: ['Linked List', 'Recursion'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple'],
    description: 'Given a linked list, swap every two adjacent nodes and return its head. You must solve the problem without modifying the values in the lists nodes (i.e., only nodes themselves may be changed).',
    examples: 'Input: head = [1,2,3,4]\nOutput: [2,1,4,3]',
    starterCode: null
  },
  {
    id: 'partition-list',
    title: 'Partition List',
    category: 'Linked Lists',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/partition-list/',
    tags: ['Linked List', 'Two Pointers'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta'],
    description: 'Given the head of a linked list and a value x, partition it such that all nodes less than x come before nodes greater than or equal to x. You should preserve the original relative order of the nodes in each of the two partitions.',
    examples: 'Input: head = [1,4,3,2,5,2], x = 3\nOutput: [1,2,2,4,3,5]',
    starterCode: null
  },
  {
    id: 'reverse-linked-list-ii',
    title: 'Reverse Linked List II',
    category: 'Linked Lists',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/reverse-linked-list-ii/',
    tags: ['Linked List'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple'],
    description: 'Given the head of a singly linked list and two integers left and right where left <= right, reverse the nodes of the list from position left to position right, and return the reversed list. Positions are 1-indexed.',
    examples: 'Input: head = [1,2,3,4,5], left = 2, right = 4\nOutput: [1,4,3,2,5]',
    starterCode: null
  },
  {
    id: 'odd-even-linked-list',
    title: 'Odd Even Linked List',
    category: 'Linked Lists',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/odd-even-linked-list/',
    tags: ['Linked List'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta', 'Bloomberg'],
    description: 'Given the head of a singly linked list, group all the nodes with odd indices together followed by the nodes with even indices, and return the reordered list. The first node is considered odd, and the second node is even, and so on. You must solve the problem in O(1) extra space and O(n) time.',
    examples: 'Input: head = [1,2,3,4,5]\nOutput: [1,3,5,2,4]',
    starterCode: null
  },
  {
    id: 'two-sum-ii-sorted',
    title: 'Two Sum II - Input Array Is Sorted',
    category: 'Two Pointers',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/',
    tags: ['Array', 'Two Pointers', 'Binary Search'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple'],
    description: 'Given a 1-indexed array of integers numbers that is already sorted in non-decreasing order, find two numbers such that they add up to a specific target number. Return the indices of the two numbers, index1 and index2, added by one as an integer array [index1, index2] of length 2. The tests are generated such that there is exactly one solution. You may not use the same element twice.',
    examples: 'Input: numbers = [2,7,11,15], target = 9\nOutput: [1,2]',
    starterCode: null
  },
  {
    id: 'remove-duplicates-sorted-array',
    title: 'Remove Duplicates from Sorted Array',
    category: 'Two Pointers',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/',
    tags: ['Array', 'Two Pointers'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple'],
    description: 'Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once. The relative order of the elements should be kept the same. Return the number of unique elements in nums. The first k elements of nums should hold the final result.',
    examples: 'Input: nums = [1,1,2]\nOutput: 2, nums = [1,2,_]',
    starterCode: null
  },
  {
    id: 'move-zeroes',
    title: 'Move Zeroes',
    category: 'Two Pointers',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/move-zeroes/',
    tags: ['Array', 'Two Pointers'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Bloomberg'],
    description: 'Given an integer array nums, move all 0s to the end of it while maintaining the relative order of the non-zero elements. Note that you must do this in-place without making a copy of the array.',
    examples: 'Input: nums = [0,1,0,3,12]\nOutput: [1,3,12,0,0]',
    starterCode: null
  },
  {
    id: 'rotate-array',
    title: 'Rotate Array',
    category: 'Arrays',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/rotate-array/',
    tags: ['Array', 'Math', 'Two Pointers'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple'],
    description: 'Given an integer array nums, rotate the array to the right by k steps, where k is non-negative. Try to do this in-place with O(1) extra space.',
    examples: 'Input: nums = [1,2,3,4,5,6,7], k = 3\nOutput: [5,6,7,1,2,3,4]',
    starterCode: null
  },
  {
    id: 'merge-sorted-array',
    title: 'Merge Sorted Array',
    category: 'Two Pointers',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/merge-sorted-array/',
    tags: ['Array', 'Two Pointers', 'Sorting'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Bloomberg'],
    description: 'You are given two integer arrays nums1 and nums2, sorted in non-decreasing order, and two integers m and n, representing the number of elements in nums1 and nums2 respectively. Merge nums1 and nums2 into a single array sorted in non-decreasing order. The final sorted array should not be returned by the function, but instead be stored inside the array nums1. nums1 has a length of m + n, where the first m elements denote the elements that should be merged, and the last n elements are set to 0 and should be ignored.',
    examples: 'Input: nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3\nOutput: [1,2,2,3,5,6]',
    starterCode: null
  },
  {
    id: 'invert-binary-tree',
    title: 'Invert Binary Tree',
    category: 'Trees',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/invert-binary-tree/',
    tags: ['Tree', 'DFS', 'BFS'],
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: 'Given the **root** of a binary tree, invert the tree (mirror it left-to-right) and return its root.\n\nClassic recursion: swap left and right, then recurse into each subtree. Iterative variants use a queue or stack.',
    examples: 'Input: root = [4,2,7,1,3,6,9]\nOutput: [4,7,2,9,6,3,1]',
    starterCode: null
  },
  {
    id: 'balanced-binary-tree',
    title: 'Balanced Binary Tree',
    category: 'Trees',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/balanced-binary-tree/',
    tags: ['Tree', 'DFS', 'Recursion'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Apple'],
    description: 'Given a binary tree, determine if it is **height-balanced**: a binary tree in which the depth of the two subtrees of every node never differs by more than one.\n\nReturn a combined height-and-balanced status from each recursive call; propagate -1 (or a flag) as soon as an imbalance is detected to short-circuit.',
    examples: 'Input: root = [3,9,20,null,null,15,7]\nOutput: true\n\nInput: root = [1,2,2,3,3,null,null,4,4]\nOutput: false',
    starterCode: null
  },
  {
    id: 'minimum-depth-of-binary-tree',
    title: 'Minimum Depth of Binary Tree',
    category: 'Trees',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/minimum-depth-of-binary-tree/',
    tags: ['Tree', 'BFS', 'DFS'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Facebook'],
    description: 'Given a binary tree, find its **minimum depth** — the number of nodes along the shortest path from the root down to the nearest **leaf** node. A leaf is a node with no children.\n\nBFS is optimal: return the depth of the first leaf you encounter. With DFS you must be careful not to count a null child as a leaf when the sibling exists.',
    examples: 'Input: root = [3,9,20,null,null,15,7]\nOutput: 2\n\nInput: root = [2,null,3,null,4,null,5,null,6]\nOutput: 5',
    starterCode: null
  },
  {
    id: 'sum-root-to-leaf-numbers',
    title: 'Sum Root to Leaf Numbers',
    category: 'Trees',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/sum-root-to-leaf-numbers/',
    tags: ['Tree', 'DFS', 'Recursion'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Facebook'],
    description: 'You are given the **root** of a binary tree containing digits from **0** to **9** only. Each root-to-leaf path represents a number (e.g. 1->2->3 is 123). Return the total sum of all root-to-leaf numbers.\n\nStandard DFS: carry an accumulator **cur = cur*10 + node.val**; add to the running sum when you reach a leaf.',
    examples: 'Input: root = [1,2,3]\nOutput: 25\nExplanation: path 1->2 = 12, path 1->3 = 13. Sum = 25.',
    starterCode: null
  },
  {
    id: 'binary-tree-right-side-view',
    title: 'Binary Tree Right Side View',
    category: 'Trees',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/binary-tree-right-side-view/',
    tags: ['Tree', 'BFS', 'DFS'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Facebook'],
    description: 'Given the **root** of a binary tree, imagine yourself standing on the **right side** of it. Return the values of the nodes you can see ordered from top to bottom.\n\nBFS: record the last node of each level. DFS: traverse right-first and record the first node seen at each depth.',
    examples: 'Input: root = [1,2,3,null,5,null,4]\nOutput: [1,3,4]',
    starterCode: null
  },
  {
    id: 'binary-tree-zigzag-level-order',
    title: 'Binary Tree Zigzag Level Order Traversal',
    category: 'Trees',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/',
    tags: ['Tree', 'BFS', 'Deque'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Facebook'],
    description: 'Given the **root** of a binary tree, return the **zigzag level order traversal** of its nodes values. (i.e., from left to right, then right to left for the next level, and alternate between).\n\nDo BFS level-by-level; reverse every other level before adding to the result (or use a deque and alternate push-front / push-back).',
    examples: 'Input: root = [3,9,20,null,null,15,7]\nOutput: [[3],[20,9],[15,7]]',
    starterCode: null
  },
  {
    id: 'flatten-binary-tree-to-linked-list',
    title: 'Flatten Binary Tree to Linked List',
    category: 'Trees',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/flatten-binary-tree-to-linked-list/',
    tags: ['Tree', 'DFS', 'Linked List', 'Stack'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Facebook'],
    description: 'Given the **root** of a binary tree, flatten the tree into a **linked list** in-place. The linked list should use the same **TreeNode** class where the **right** child points to the next node and the **left** child is always null. The order should follow **preorder** traversal.\n\nElegant O(1)-extra approach: reverse-preorder (right, left, root) and splice nodes with a trailing pointer.',
    examples: 'Input: root = [1,2,5,3,4,null,6]\nOutput: [1,null,2,null,3,null,4,null,5,null,6]',
    starterCode: null
  },
  {
    id: 'kth-largest-element-stream',
    title: 'Kth Largest Element in a Stream',
    category: 'Sorting & Searching',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/kth-largest-element-in-a-stream/',
    tags: ['Heap', 'Priority Queue', 'Design'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Facebook'],
    description: 'Design a class to find the **k**-th largest element in a stream. Note that it is the **k**-th largest element in the sorted order, not the **k**-th distinct element.\n\nImplement **KthLargest(int k, int[] nums)** and **int add(int val)** that returns the **k**-th largest element after inserting **val**. Keep a min-heap of size **k**; the top is always the answer.',
    examples: 'Input: k = 3, nums = [4,5,8,2]\nops: add(3) -> 4, add(5) -> 5, add(10) -> 5, add(9) -> 8, add(4) -> 8',
    starterCode: null
  },
  {
    id: 'range-sum-bst',
    title: 'Range Sum of BST',
    category: 'Trees',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/range-sum-of-bst/',
    tags: ['Tree', 'BST', 'DFS'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Facebook'],
    description: 'Given the **root** node of a binary search tree and two integers **low** and **high**, return the sum of values of all nodes with a value in the **inclusive** range **[low, high]**.\n\nUse BST property to prune: if **node.val < low**, skip left; if **node.val > high**, skip right.',
    examples: 'Input: root = [10,5,15,3,7,null,18], low = 7, high = 15\nOutput: 32',
    starterCode: null
  },
  {
    id: 'word-search',
    title: 'Word Search',
    category: 'Backtracking',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/word-search/',
    tags: ['Backtracking', 'DFS', 'Matrix'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Facebook'],
    description: 'Given an **m x n** grid of characters **board** and a string **word**, return **true** if **word** exists in the grid. The word can be constructed from letters of sequentially adjacent cells (horizontally or vertically neighboring). **The same letter cell may not be used more than once.**\n\nDFS from each cell; mark visited by mutating the board temporarily and restore on backtrack.',
    examples: 'Input: board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"\nOutput: true',
    starterCode: null
  },
  {
    id: 'graph-valid-tree',
    title: 'Graph Valid Tree',
    category: 'Graphs',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/graph-valid-tree/',
    tags: ['Graph', 'Union Find', 'DFS', 'BFS'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Facebook'],
    description: 'Given **n** nodes labeled from **0** to **n - 1** and a list of undirected edges, write a function to check whether these edges make up a **valid tree**.\n\nA valid tree has exactly **n - 1** edges, is **connected**, and contains **no cycles**. Union-Find is the cleanest implementation: if any edge connects two nodes already in the same component, a cycle exists.',
    examples: 'Input: n = 5, edges = [[0,1],[0,2],[0,3],[1,4]]\nOutput: true\n\nInput: n = 5, edges = [[0,1],[1,2],[2,3],[1,3],[1,4]]\nOutput: false',
    starterCode: null
  },
  {
    id: 'is-graph-bipartite',
    title: 'Is Graph Bipartite?',
    category: 'Graphs',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/is-graph-bipartite/',
    tags: ['Graph', 'BFS', 'DFS', 'Union Find', 'Coloring'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Facebook'],
    description: 'There is an undirected graph with **n** nodes, where each node is numbered between **0** and **n - 1**. You are given a 2D array **graph**, where **graph[u]** is an array of nodes that node **u** is adjacent to. Return **true** if and only if it is bipartite (can be 2-colored so no edge has same-color endpoints).\n\nBFS/DFS 2-coloring: assign each unvisited node color 0, alternate colors across edges; conflict => not bipartite. Equivalently: no odd-length cycle.',
    examples: 'Input: graph = [[1,2,3],[0,2],[0,1,3],[0,2]]\nOutput: false\n\nInput: graph = [[1,3],[0,2],[1,3],[0,2]]\nOutput: true',
    starterCode: null
  },
  {
    id: 'fibonacci-number',
    title: 'Fibonacci Number',
    category: 'Dynamic Programming',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/fibonacci-number/',
    tags: ['DP', 'Math', 'Recursion', 'Memoization'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Apple'],
    description: 'The **Fibonacci numbers**, commonly denoted **F(n)**, form a sequence such that each number is the sum of the two preceding ones, starting from **0** and **1**:\n\n- **F(0) = 0**, **F(1) = 1**\n- **F(n) = F(n-1) + F(n-2)** for **n > 1**\n\nGiven **n**, compute **F(n)**.\n\nThe classic DP problem. Solve in **O(n)** time and **O(1)** space with two rolling variables, or in **O(log n)** via matrix exponentiation.',
    examples: 'Input: n = 2\nOutput: 1\nExplanation: F(2) = F(1) + F(0) = 1 + 0 = 1\n\nInput: n = 3\nOutput: 2\nExplanation: F(3) = F(2) + F(1) = 1 + 1 = 2\n\nInput: n = 4\nOutput: 3\nExplanation: F(4) = F(3) + F(2) = 2 + 1 = 3',
    starterCode: null
  },
  {
    id: 'min-cost-climbing-stairs',
    title: 'Min Cost Climbing Stairs',
    category: 'Dynamic Programming',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/min-cost-climbing-stairs/',
    tags: ['Array', 'DP'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Bloomberg'],
    description: 'You are given an integer array **cost** where **cost[i]** is the cost of the **i**-th step on a staircase. Once you pay the cost, you can either climb **one** or **two** steps.\n\nYou can start from the step with index **0** or index **1**. Return the **minimum cost** to reach the top of the floor (the position **beyond** the last step).\n\nDP recurrence: **dp[i] = cost[i] + min(dp[i-1], dp[i-2])**. Answer = **min(dp[n-1], dp[n-2])**.',
    examples: 'Input: cost = [10,15,20]\nOutput: 15\nExplanation: Start at index 1, pay 15, climb 2 steps to reach the top.\n\nInput: cost = [1,100,1,1,1,100,1,1,100,1]\nOutput: 6\nExplanation: Start at 0, skip the 100s: 1+1+1+1+1+1 = 6.',
    starterCode: null
  },
  {
    id: 'jump-game',
    title: 'Jump Game',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/jump-game/',
    tags: ['Array', 'DP', 'Greedy'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Facebook'],
    description: 'You are given an integer array **nums**. You are initially positioned at the array\'s **first index**, and each element in the array represents your **maximum jump length** at that position.\n\nReturn **true** if you can reach the last index, or **false** otherwise.\n\n**Greedy** approach: track the furthest index reachable so far. If at index **i** you are past the furthest reach, return false. Otherwise update reach = max(reach, i + nums[i]).',
    examples: 'Input: nums = [2,3,1,1,4]\nOutput: true\nExplanation: Jump 1 step from index 0 to 1, then 3 steps to the last index.\n\nInput: nums = [3,2,1,0,4]\nOutput: false\nExplanation: You will always arrive at index 3 with max jump 0, stuck.',
    starterCode: null
  },
  {
    id: 'jump-game-ii',
    title: 'Jump Game II',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/jump-game-ii/',
    tags: ['Array', 'DP', 'Greedy', 'BFS'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Apple'],
    description: 'You are given a **0-indexed** array of integers **nums** of length **n**. You start at **nums[0]** and can jump at most **nums[i]** steps from index **i**.\n\nReturn the **minimum number of jumps** to reach **nums[n-1]**. The test cases are generated so that you can always reach it.\n\n**Greedy BFS**: expand the current "jump window" to the farthest index reachable; when you cross its end, increment jumps and extend the window.',
    examples: 'Input: nums = [2,3,1,1,4]\nOutput: 2\nExplanation: Jump 1 step from index 0 to 1, then 3 steps to the last index.\n\nInput: nums = [2,3,0,1,4]\nOutput: 2',
    starterCode: null
  },
  {
    id: 'gas-station',
    title: 'Gas Station',
    category: 'Arrays',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/gas-station/',
    tags: ['Array', 'Greedy'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Bloomberg'],
    description: 'There are **n** gas stations along a circular route. At station **i** you can fill **gas[i]** units and it takes **cost[i]** units to travel to station **i+1**.\n\nYou begin the journey with an empty tank at one of the stations. Return the **starting gas station index** to complete the circuit once in the clockwise direction; otherwise return **-1**.\n\n**Greedy**: if total gas < total cost, return -1. Otherwise, scan once; whenever the running tank drops below 0, reset start to the next index.',
    examples: 'Input: gas = [1,2,3,4,5], cost = [3,4,5,1,2]\nOutput: 3\nExplanation: Start at station 3 (gas = 4). Tank = 4-1 + 5-2 + 1-3 + 2-4 + 3-5... cumulates safely back to start.\n\nInput: gas = [2,3,4], cost = [3,4,3]\nOutput: -1',
    starterCode: null
  },
  {
    id: 'delete-and-earn',
    title: 'Delete and Earn',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/delete-and-earn/',
    tags: ['Array', 'Hash Map', 'DP'],
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: 'You are given an integer array **nums**. You want to maximize the number of points you earn by performing the following operation any number of times:\n\n- Pick any **nums[i]** and delete it to earn **nums[i]** points. Afterwards, delete **every** element equal to **nums[i]-1** and **every** element equal to **nums[i]+1**.\n\nReturn the **maximum number of points** you can earn.\n\n**Trick**: bucket sums by value → **points[v] = v * count(v)**. Then this reduces to **House Robber** on the **points** array, since adjacent values conflict.',
    examples: 'Input: nums = [3,4,2]\nOutput: 6\nExplanation: Take 2 (delete 2,3 entries adjacent), then take 4 (no neighbors left): 2+4 = 6.\n\nInput: nums = [2,2,3,3,3,4]\nOutput: 9\nExplanation: Delete all 3s to earn 9 (also removes 2s and 4s).',
    starterCode: null
  },
  {
    id: 'maximum-sum-circular-subarray',
    title: 'Maximum Sum Circular Subarray',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/maximum-sum-circular-subarray/',
    tags: ['Array', 'DP', 'Kadane', 'Monotonic Queue'],
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: 'Given a **circular** integer array **nums** of length **n**, return the **maximum possible sum** of a non-empty subarray of **nums**.\n\nA circular array means the end wraps to the beginning.\n\n**Key insight**: the answer is either the **standard Kadane max** (non-wrapping) or **total - Kadane min** (wrapping case). Edge case: if all numbers are negative, return the Kadane max (wrap case would be empty, which is not allowed).',
    examples: 'Input: nums = [1,-2,3,-2]\nOutput: 3\nExplanation: Subarray [3] has maximum sum 3.\n\nInput: nums = [5,-3,5]\nOutput: 10\nExplanation: Subarray [5,5] (wrapping) has maximum sum 10.\n\nInput: nums = [-3,-2,-3]\nOutput: -2',
    starterCode: null
  },
  {
    id: 'longest-string-chain',
    title: 'Longest String Chain',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/longest-string-chain/',
    tags: ['Array', 'Hash Map', 'DP', 'Sorting'],
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: 'You are given an array of **words** where each word consists of lowercase English letters.\n\n**wordA** is a **predecessor** of **wordB** if and only if we can insert **exactly one** letter anywhere in **wordA** (without changing the order of the other characters) to make it equal to **wordB**.\n\nA **word chain** is a sequence of words **[w1, w2, ..., wk]** with **k >= 1**, where each **w_i** is a predecessor of **w_{i+1}**. A single word is a valid chain of length 1.\n\nReturn the **length of the longest possible word chain**.\n\n**Approach**: sort words by length; for each word, try deleting each character to form a candidate predecessor; **dp[w] = max(dp[prev] + 1)**.',
    examples: 'Input: words = ["a","b","ba","bca","bda","bdca"]\nOutput: 4\nExplanation: One chain: "a" -> "ba" -> "bda" -> "bdca".\n\nInput: words = ["xbc","pcxbcf","xb","cxbc","pcxbc"]\nOutput: 5\nExplanation: "xb" -> "xbc" -> "cxbc" -> "pcxbc" -> "pcxbcf".',
    starterCode: null
  },
  {
    id: 'integer-break',
    title: 'Integer Break',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/integer-break/',
    tags: ['Math', 'DP', 'Greedy'],
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: 'Given an integer **n**, break it into the sum of **k >= 2** positive integers, where **k** is any integer. Maximize and return the **product** of those integers.\n\n**DP**: **dp[i] = max over j in [1..i-1] of max(j, dp[j]) * max(i-j, dp[i-j])**.\n\n**Math trick**: the optimal partition uses as many **3**s as possible (avoid 1, and replace any 4 with 2+2). For **n >= 4**, answer = **3^((n-2)/3 adjusted)** pattern based on **n mod 3**.',
    examples: 'Input: n = 2\nOutput: 1\nExplanation: 2 = 1 + 1, product = 1.\n\nInput: n = 10\nOutput: 36\nExplanation: 10 = 3 + 3 + 4, product = 3 * 3 * 4 = 36.',
    starterCode: null
  },
  {
    id: 'counting-bits',
    title: 'Counting Bits',
    category: 'Dynamic Programming',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/counting-bits/',
    tags: ['DP', 'Bit Manipulation'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Apple'],
    description: 'Given an integer **n**, return an array **ans** of length **n+1** such that for each **i** (**0 <= i <= n**), **ans[i]** is the **number of 1s** in the binary representation of **i**.\n\nSolve in **O(n)** time and **O(1)** extra space (besides the output).\n\n**DP tricks**:\n- **ans[i] = ans[i >> 1] + (i & 1)** — drop the low bit and add it back.\n- **ans[i] = ans[i & (i-1)] + 1** — clear the lowest set bit.',
    examples: 'Input: n = 2\nOutput: [0,1,1]\nExplanation: 0 -> 0, 1 -> 1, 10 -> 1.\n\nInput: n = 5\nOutput: [0,1,1,2,1,2]',
    starterCode: null
  },
  {
    id: 'combination-sum-iv',
    title: 'Combination Sum IV',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/combination-sum-iv/',
    tags: ['Array', 'DP'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Facebook'],
    description: 'Given an array of **distinct** integers **nums** and a target integer **target**, return the **number of possible combinations** that add up to **target**.\n\nNote: the order **matters** (these are really ordered sequences / permutations, not unordered combinations despite the name).\n\n**DP recurrence**: **dp[t] = sum over num in nums of dp[t - num]** (for **num <= t**), with **dp[0] = 1**.',
    examples: 'Input: nums = [1,2,3], target = 4\nOutput: 7\nExplanation: The 7 ordered sequences are (1,1,1,1), (1,1,2), (1,2,1), (2,1,1), (1,3), (3,1), (2,2).\n\nInput: nums = [9], target = 3\nOutput: 0',
    starterCode: null
  },
  {
    id: 'ugly-number-ii',
    title: 'Ugly Number II',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/ugly-number-ii/',
    tags: ['Heap', 'DP', 'Math'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Bloomberg'],
    description: 'An **ugly number** is a positive integer whose prime factors are limited to **2**, **3**, and **5**. Given an integer **n**, return the **n-th ugly number**.\n\nThe sequence begins: **1, 2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 16, ...** (note: **1** is conventionally treated as ugly).\n\n**Three-pointers DP**: maintain pointers **i2, i3, i5** into the ugly list. Next ugly = **min(ugly[i2]*2, ugly[i3]*3, ugly[i5]*5)**; advance whichever pointer(s) matched.',
    examples: 'Input: n = 10\nOutput: 12\nExplanation: [1,2,3,4,5,6,8,9,10,12] is the first 10 ugly numbers.\n\nInput: n = 1\nOutput: 1',
    starterCode: null
  },
  {
    id: 'merge-k-sorted-lists',
    title: 'Merge k Sorted Lists',
    category: 'Linked Lists',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/merge-k-sorted-lists/',
    tags: ['Linked List', 'Heap', 'Divide and Conquer', 'Merge Sort'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft', 'Apple'],
    description: 'You are given an array of **k** linked-lists **lists**, each linked-list is sorted in ascending order.\n\nMerge all the linked-lists into one sorted linked-list and return it.\n\nClassic approaches: (1) min-heap of the current heads across all lists — O(N log k); (2) divide-and-conquer pairwise merging — O(N log k).',
    examples: 'Input: lists = [[1,4,5],[1,3,4],[2,6]]\nOutput: [1,1,2,3,4,4,5,6]\n\nInput: lists = []\nOutput: []\n\nInput: lists = [[]]\nOutput: []',
    starterCode: null
  },
  {
    id: 'daily-temperatures',
    title: 'Daily Temperatures',
    category: 'Stacks & Queues',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/daily-temperatures/',
    tags: ['Stack', 'Monotonic Stack', 'Array'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    description: 'Given an array of integers **temperatures** representing the daily temperatures, return an array **answer** such that **answer[i]** is the number of days you have to wait after the **i-th** day to get a warmer temperature. If there is no future day for which this is possible, keep **answer[i] == 0**.\n\nUse a **monotonic decreasing stack** of indices: when we see a warmer temperature, pop all cooler indices and record the distance.',
    examples: 'Input: temperatures = [73,74,75,71,69,72,76,73]\nOutput: [1, 1, 4, 2, 1, 1, 0, 0]',
    starterCode: null
  },
  {
    id: 'next-greater-element-i',
    title: 'Next Greater Element I',
    category: 'Stacks & Queues',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/next-greater-element-i/',
    tags: ['Array', 'Hash Map', 'Stack', 'Monotonic Stack'],
    companies: ['Google', 'Amazon', 'Meta', 'Bloomberg'],
    description: 'The **next greater element** of some element **x** in an array is the first greater element that is to the right of **x** in the same array.\n\nYou are given two distinct 0-indexed integer arrays **nums1** and **nums2**, where **nums1** is a subset of **nums2**. For each **nums1[i]**, find the index **j** such that **nums1[i] == nums2[j]** and determine the next greater element of **nums2[j]** in **nums2**. If there is no next greater element, the answer is **-1**.\n\nPrecompute next-greater for every element of **nums2** using a monotonic stack, then look up by value in a hash map.',
    examples: 'Input: nums1 = [4,1,2], nums2 = [1,3,4,2]\nOutput: [-1, 3, -1]\n\nInput: nums1 = [2,4], nums2 = [1,2,3,4]\nOutput: [3, -1]',
    starterCode: null
  },
  {
    id: 'remove-k-digits',
    title: 'Remove K Digits',
    category: 'Stacks & Queues',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/remove-k-digits/',
    tags: ['String', 'Stack', 'Greedy', 'Monotonic Stack'],
    companies: ['Google', 'Amazon', 'Meta', 'Bloomberg'],
    description: 'Given string **num** representing a non-negative integer **num**, and an integer **k**, return the smallest possible integer after removing **k** digits from **num**.\n\nGreedy monotonic-stack approach: iterate digits left to right; while the stack top is greater than the current digit and we still have removals left, pop. Trim leading zeros at the end; return "0" if the result is empty.',
    examples: 'Input: num = "1432219", k = 3\nOutput: "1219"\n\nInput: num = "10200", k = 1\nOutput: "200"\n\nInput: num = "10", k = 2\nOutput: "0"',
    starterCode: null
  },
  {
    id: 'remove-duplicate-letters',
    title: 'Remove Duplicate Letters',
    category: 'Stacks & Queues',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/remove-duplicate-letters/',
    tags: ['String', 'Stack', 'Greedy', 'Monotonic Stack'],
    companies: ['Google', 'Amazon', 'Meta', 'Bloomberg'],
    description: 'Given a string **s**, remove duplicate letters so that every letter appears once and only once. You must make sure your result is the **lexicographically smallest** among all possible results.\n\nGreedy monotonic-stack approach: track a last-occurrence index per letter; push each letter, but while the stack top is greater than the current letter AND the stack top appears again later, pop it. Skip letters already in the stack.',
    examples: 'Input: s = "bcabc"\nOutput: "abc"\n\nInput: s = "cbacdcbc"\nOutput: "acdb"',
    starterCode: null
  },
  {
    id: 'top-k-frequent-words',
    title: 'Top K Frequent Words',
    category: 'Hash Maps',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/top-k-frequent-words/',
    tags: ['Hash Map', 'Heap', 'Sorting', 'Trie', 'Bucket Sort'],
    companies: ['Google', 'Amazon', 'Meta', 'Bloomberg'],
    description: 'Given an array of strings **words** and an integer **k**, return the **k** most frequent strings.\n\nReturn the answer **sorted by the frequency from highest to lowest**. Sort the words with the same frequency by their **lexicographical order**.\n\nTypical approach: count frequencies, then a min-heap of size k ordered by (freq asc, word desc) so the weakest element is always at the top; finally reverse the heap contents.',
    examples: 'Input: words = ["i","love","leetcode","i","love","coding"], k = 2\nOutput: ["i","love"]\n\nInput: words = ["the","day","is","sunny","the","the","the","sunny","is","is"], k = 4\nOutput: ["the","is","sunny","day"]',
    starterCode: null
  },
  {
    id: 'kth-smallest-in-sorted-matrix',
    title: 'Kth Smallest Element in a Sorted Matrix',
    category: 'Sorting & Searching',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/',
    tags: ['Array', 'Binary Search', 'Heap', 'Matrix', 'Sorting'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    description: 'Given an **n x n** matrix where each of the rows and columns is sorted in ascending order, return the **k-th** smallest element in the matrix.\n\nNote that it is the **k-th** smallest element in the sorted order, not the **k-th** distinct element.\n\nTwo standard approaches: (1) min-heap over candidates starting with column 0, popping k times — O(k log n); (2) binary search on the value range [matrix[0][0], matrix[n-1][n-1]] using a count function — O(n log(max-min)).',
    examples: 'Input: matrix = [[1,5,9],[10,11,13],[12,13,15]], k = 8\nOutput: 13\n\nInput: matrix = [[-5]], k = 1\nOutput: -5',
    starterCode: null
  },
  {
    id: 'car-fleet',
    title: 'Car Fleet',
    category: 'Stacks & Queues',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/car-fleet/',
    tags: ['Array', 'Sorting', 'Stack', 'Monotonic Stack'],
    companies: ['Google', 'Amazon', 'Meta'],
    description: 'There are **n** cars at given positions going to the same destination along a one-lane road. Given the **target** distance, an array **position[i]** and an array **speed[i]** for each car, return the number of **car fleets** that will arrive at the destination.\n\nA car can never pass another — if a faster car catches up to a slower one, they travel bumper-to-bumper at the slower speed as a single fleet.\n\nSort cars by position descending and compute each car\'s **time-to-target = (target - position) / speed**. Iterate left-to-right: a new fleet begins whenever the current car\'s time strictly exceeds the time of the fleet currently ahead.',
    examples: 'Input: target = 12, position = [10,8,0,5,3], speed = [2,4,1,1,3]\nOutput: 3\n\nInput: target = 10, position = [3], speed = [3]\nOutput: 1',
    starterCode: null
  },
  {
    id: 'pow-x-n',
    title: 'Pow(x, n)',
    category: 'Fundamentals',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/powx-n/',
    tags: ['Math', 'Recursion', 'Binary Exponentiation'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft', 'Apple'],
    description: 'Implement **pow(x, n)**, which calculates **x** raised to the power **n** (i.e., **x^n**).\n\nUse **fast exponentiation** (exponentiation by squaring): halve the exponent and square the base. Handle negative exponents by inverting **x** once and negating **n** (careful with Integer.MIN_VALUE — promote to long).\n\nTime: **O(log n)**. Space: **O(log n)** recursive or **O(1)** iterative.',
    examples: 'Input: x = 2.0, n = 10\nOutput: 1024.0\n\nInput: x = 2.0, n = -2\nOutput: 0.25',
    starterCode: null
  },
  {
    id: 'sqrt-x',
    title: 'Sqrt(x)',
    category: 'Sorting & Searching',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/sqrtx/',
    tags: ['Math', 'Binary Search'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft', 'Apple'],
    description: 'Given a non-negative integer **x**, return the square root of **x** rounded down to the nearest integer. The returned integer should be **non-negative**.\n\nYou must not use any built-in exponent function or operator — e.g., no **pow(x, 0.5)** or **x ** 0.5**.\n\nBinary search on the range **[0, x]**: for each **mid**, compare **mid * mid** against **x** (use **long** to avoid overflow). Newton\'s method also works: **r = (r + x/r) / 2**.',
    examples: 'Input: x = 4\nOutput: 2\n\nInput: x = 8\nOutput: 2\nExplanation: The square root of 8 is 2.828..., and since we round it down, 2 is returned.',
    starterCode: null
  },
  {
    id: 'excel-sheet-column-number',
    title: 'Excel Sheet Column Number',
    category: 'Strings',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/excel-sheet-column-number/',
    tags: ['String', 'Math'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    description: 'Given a string **columnTitle** that represents the column title as appears in an Excel sheet, return its corresponding column number.\n\nA -> 1, B -> 2, ..., Z -> 26, AA -> 27, AB -> 28, ... This is a **base-26** number system (but note that the digits are **1..26**, not **0..25**).\n\nIterate the characters left to right, accumulating **result = result * 26 + (ch - \'A\' + 1)**.',
    examples: 'Input: columnTitle = "A"\nOutput: 1\n\nInput: columnTitle = "AB"\nOutput: 28\n\nInput: columnTitle = "ZY"\nOutput: 701',
    starterCode: null
  },
  {
    id: 'add-binary',
    title: 'Add Binary',
    category: 'Strings',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/add-binary/',
    tags: ['String', 'Math', 'Bit Manipulation', 'Simulation'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft', 'Apple'],
    description: 'Given two binary strings **a** and **b**, return their sum as a binary string.\n\nSimulate grade-school addition from the least significant bit: walk both strings right-to-left tracking a carry; append (sum % 2) and carry = (sum / 2). Reverse the accumulated string at the end.',
    examples: 'Input: a = "11", b = "1"\nOutput: "100"\n\nInput: a = "1010", b = "1011"\nOutput: "10101"',
    starterCode: null
  },

  {
    id: 'reverse-string',
    title: 'Reverse String',
    category: 'Strings',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/reverse-string/',
    tags: ['Two Pointers', 'String'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    description: "Write a function that reverses a string. The input string is given as an array of characters s. You must do this by modifying the input array in-place with O(1) extra memory.\\n\\nThe classic two-pointer pattern: swap characters from both ends moving inward until the pointers meet.",
    examples: 'Input: s = ["h","e","l","l","o"]\\nOutput: ["o","l","l","e","h"]\\n\\nInput: s = ["H","a","n","n","a","h"]\\nOutput: ["h","a","n","n","a","H"]',
    starterCode: null
  },
  {
    id: 'reverse-words-in-string',
    title: 'Reverse Words in a String',
    category: 'Strings',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/reverse-words-in-a-string/',
    tags: ['Two Pointers', 'String'],
    companies: ['Google', 'Microsoft', 'Amazon', 'Apple'],
    description: "Given an input string s, reverse the order of the words. A word is a sequence of non-space characters. Words in s are separated by at least one space.\\n\\nReturn a string with the words in reverse order joined by a single space. Leading and trailing spaces must be removed, and multiple spaces between words should be collapsed to one.",
    examples: 'Input: s = "the sky is blue"\\nOutput: "blue is sky the"\\n\\nInput: s = "  hello world  "\\nOutput: "world hello"\\n\\nInput: s = "a good   example"\\nOutput: "example good a"',
    starterCode: null
  },
  {
    id: 'multiply-strings',
    title: 'Multiply Strings',
    category: 'Strings',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/multiply-strings/',
    tags: ['Math', 'String', 'Simulation'],
    companies: ['Google', 'Meta', 'Amazon', 'Microsoft'],
    description: "Given two non-negative integers num1 and num2 represented as strings, return the product of num1 and num2, also as a string. You must not use any built-in BigInteger library or convert the inputs to integers directly.\\n\\nSimulate grade-school multiplication: num1[i] * num2[j] contributes to positions i+j and i+j+1 in the result array.",
    examples: 'Input: num1 = "2", num2 = "3"\\nOutput: "6"\\n\\nInput: num1 = "123", num2 = "456"\\nOutput: "56088"',
    starterCode: null
  },
  {
    id: 'palindrome-number',
    title: 'Palindrome Number',
    category: 'Fundamentals',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/palindrome-number/',
    tags: ['Math'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Bloomberg'],
    description: "Given an integer x, return true if x is a palindrome, and false otherwise. A negative number is never a palindrome because of its leading minus sign.\\n\\nThe standard trick is to reverse half of the number and compare it against the remaining half, which avoids overflow from reversing the full number.",
    examples: 'Input: x = 121\\nOutput: true\\n\\nInput: x = -121\\nOutput: false\\n\\nInput: x = 10\\nOutput: false',
    starterCode: null
  },
  {
    id: 'count-and-say',
    title: 'Count and Say',
    category: 'Strings',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/count-and-say/',
    tags: ['String', 'Recursion'],
    companies: ['Google', 'Meta', 'Amazon'],
    description: "The count-and-say sequence is defined recursively: countAndSay(1) = \"1\", and countAndSay(n) describes countAndSay(n-1) by reading off the digits, counting consecutive groups.\\n\\nFor example, \"3322251\" is read as \"two 3s, three 2s, one 5, one 1\" so it becomes \"23321511\". Generate the nth term.",
    examples: 'Input: n = 1\\nOutput: "1"\\n\\nInput: n = 4\\nOutput: "1211"\\n\\nExplanation:\\n1st: "1"\\n2nd: "11" (one 1)\\n3rd: "21" (two 1s)\\n4th: "1211" (one 2, one 1)',
    starterCode: null
  },
  {
    id: 'simplify-path',
    title: 'Simplify Path',
    category: 'Stacks & Queues',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/simplify-path/',
    tags: ['Stack', 'String'],
    companies: ['Google', 'Meta', 'Microsoft', 'Amazon'],
    description: "Given an absolute Unix-style path, convert it to the simplified canonical path. The rules: a single period '.' refers to the current directory, a double period '..' moves up one directory, and any multiple consecutive slashes are treated as a single slash.\\n\\nThe canonical path starts with a single slash, has directories separated by single slashes, does not end with a trailing slash (unless it is the root), and contains no '.' or '..' segments.",
    examples: 'Input: path = "/home/"\\nOutput: "/home"\\n\\nInput: path = "/a/./b/../../c/"\\nOutput: "/c"',
    starterCode: null
  },
  {
    id: 'roman-to-integer',
    title: 'Roman to Integer',
    category: 'Strings',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/roman-to-integer/',
    tags: ['Hash Table', 'Math', 'String'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Apple'],
    description: "Roman numerals are represented by seven symbols: I=1, V=5, X=10, L=50, C=100, D=500, M=1000. Normally they are written largest to smallest, but in subtractive cases (IV=4, IX=9, XL=40, XC=90, CD=400, CM=900) a smaller numeral precedes a larger one.\\n\\nGiven a valid Roman numeral string, convert it to an integer. The trick: if the current symbol is less than the next, subtract it; otherwise add it.",
    examples: 'Input: s = "III"\\nOutput: 3\\n\\nInput: s = "LVIII"\\nOutput: 58\\n\\nInput: s = "MCMXCIV"\\nOutput: 1994',
    starterCode: null
  },
  {
    id: 'integer-to-roman',
    title: 'Integer to Roman',
    category: 'Strings',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/integer-to-roman/',
    tags: ['Hash Table', 'Math', 'String'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Apple'],
    description: "Given an integer in the range 1..3999, convert it to its Roman numeral representation. Roman numerals use symbols I, V, X, L, C, D, M plus six subtractive forms IV, IX, XL, XC, CD, CM.\\n\\nThe cleanest approach: keep parallel arrays of values [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1] and corresponding symbols, then greedily subtract the largest value that fits.",
    examples: 'Input: num = 3\\nOutput: "III"\\n\\nInput: num = 58\\nOutput: "LVIII"\\n\\nInput: num = 1994\\nOutput: "MCMXCIV"',
    starterCode: null
  },
  {
    id: 'count-primes',
    title: 'Count Primes',
    category: 'Fundamentals',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/count-primes/',
    tags: ['Math', 'Array', 'Enumeration', 'Number Theory'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta'],
    description: "Given an integer n, return the number of prime numbers that are strictly less than n. A prime is a natural number greater than 1 with no positive divisors other than 1 and itself.\\n\\nThe Sieve of Eratosthenes runs in O(n log log n) time: iterate i from 2 to sqrt(n), and if i is still marked prime, mark every multiple i*i, i*i+i, ... as composite.",
    examples: 'Input: n = 10\\nOutput: 4\\nExplanation: Primes < 10 are 2, 3, 5, 7.\\n\\nInput: n = 0\\nOutput: 0',
    starterCode: null
  },
  {
    id: 'fizz-buzz',
    title: 'Fizz Buzz',
    category: 'Fundamentals',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/fizz-buzz/',
    tags: ['Math', 'String', 'Simulation'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Apple'],
    description: "Given an integer n, return a list of strings where the i-th entry (1-indexed) is \"FizzBuzz\" if i is divisible by both 3 and 5, \"Fizz\" if divisible by only 3, \"Buzz\" if divisible by only 5, and otherwise the decimal representation of i.\\n\\nThe classic interview warm-up. Check divisibility by 15 first, then 3, then 5, else stringify the number.",
    examples: 'Input: n = 3\\nOutput: ["1","2","Fizz"]\\n\\nInput: n = 5\\nOutput: ["1","2","Fizz","4","Buzz"]\\n\\nInput: n = 15\\nOutput: ["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]',
    starterCode: null
  },
  {
    id: 'set-matrix-zeroes',
    title: 'Set Matrix Zeroes',
    category: 'Matrix',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/set-matrix-zeroes/',
    tags: ['Array', 'Hash Table', 'Matrix'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    description: "Given an m x n integer matrix, if an element is 0, set its entire row and column to 0. You must do this in place.\\n\\nClassic follow-up: can you do it with O(1) extra space? Use the first row and column as markers to record which rows/cols must be zeroed, plus two booleans to remember whether the first row or first column itself had any zero.",
    examples: 'Input: [[1,1,1],[1,0,1],[1,1,1]]\\nOutput: [[1,0,1],[0,0,0],[1,0,1]]\\n\\nInput: [[0,1,2,0],[3,4,5,2],[1,3,1,5]]\\nOutput: [[0,0,0,0],[0,4,5,0],[0,3,1,0]]',
    starterCode: null
  },
  {
    id: 'transpose-matrix',
    title: 'Transpose Matrix',
    category: 'Matrix',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/transpose-matrix/',
    tags: ['Array', 'Matrix', 'Simulation'],
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: "Given a 2D integer matrix, return the transpose of it. The transpose of a matrix swaps rows and columns: element at (i, j) in the input becomes element at (j, i) in the output.\\n\\nFor a non-square matrix of shape m x n, the result has shape n x m. Allocate a new n x m array and copy each element to its transposed position.",
    examples: 'Input: [[1,2,3],[4,5,6],[7,8,9]]\\nOutput: [[1,4,7],[2,5,8],[3,6,9]]\\n\\nInput: [[1,2,3],[4,5,6]]\\nOutput: [[1,4],[2,5],[3,6]]',
    starterCode: null
  },
  {
    id: 'pacific-atlantic-water-flow',
    title: 'Pacific Atlantic Water Flow',
    category: 'Graphs',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/pacific-atlantic-water-flow/',
    tags: ['Array', 'Depth-First Search', 'Breadth-First Search', 'Matrix'],
    companies: ['Google', 'Amazon', 'Meta'],
    description: "There is an m x n grid of heights. The Pacific ocean touches the top and left edges; the Atlantic touches the bottom and right. Water can flow from a cell to any adjacent cell with height less than or equal to the current cell.\\n\\nReturn a list of all cells from which water can flow to BOTH oceans. The trick: instead of running a search from each cell, run two reverse BFS/DFS from each ocean's border inward (climbing up to equal-or-higher neighbors). The intersection of the two reachable sets is the answer.",
    examples: 'Input: heights = [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]\\nOutput: [[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]',
    starterCode: null
  },
  {
    id: 'swim-in-rising-water',
    title: 'Swim in Rising Water',
    category: 'Graphs',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/swim-in-rising-water/',
    tags: ['Array', 'Binary Search', 'Depth-First Search', 'Breadth-First Search', 'Union Find', 'Heap', 'Matrix'],
    companies: ['Google', 'Amazon', 'Meta'],
    description: "You are given an n x n grid where grid[i][j] is the elevation at cell (i, j). Rain starts at time 0 and the water level at time t is t. You can swim from a cell to an adjacent one only if both cells have elevation at most t.\\n\\nReturn the least time until you can reach the bottom-right from the top-left. Use a Dijkstra-style min-heap where the key is the maximum elevation seen along the path so far, or binary-search on t and check connectivity with BFS.",
    examples: 'Input: grid = [[0,2],[1,3]]\\nOutput: 3\\n\\nInput: grid = [[0,1,2,3,4],[24,23,22,21,5],[12,13,14,15,16],[11,17,18,19,20],[10,9,8,7,6]]\\nOutput: 16',
    starterCode: null
  },
  {
    id: 'as-far-from-land',
    title: 'As Far from Land as Possible',
    category: 'Graphs',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/as-far-from-land-as-possible/',
    tags: ['Array', 'Dynamic Programming', 'Breadth-First Search', 'Matrix'],
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: "Given an n x n grid of 0s (water) and 1s (land), find a water cell whose distance to the nearest land cell is maximized, and return that distance. Distance is Manhattan distance |x1-x2| + |y1-y2|.\\n\\nIf no land or no water exists, return -1. Use multi-source BFS starting from every land cell simultaneously; the last water cell popped gives the answer.",
    examples: 'Input: grid = [[1,0,1],[0,0,0],[1,0,1]]\\nOutput: 2\\n\\nInput: grid = [[1,0,0],[0,0,0],[0,0,0]]\\nOutput: 4',
    starterCode: null
  },
  {
    id: 'keys-and-rooms',
    title: 'Keys and Rooms',
    category: 'Graphs',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/keys-and-rooms/',
    tags: ['Depth-First Search', 'Breadth-First Search', 'Graph'],
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: "There are n rooms labeled 0 to n-1; all rooms except room 0 are locked. rooms[i] is the list of keys found in room i, each key opening exactly one room. You start in room 0 with its keys already available.\\n\\nReturn true if you can visit every room, false otherwise. This is a straightforward graph-reachability problem: DFS or BFS starting from room 0 and check if the visited count equals n.",
    examples: 'Input: rooms = [[1],[2],[3],[]]\\nOutput: true\\n\\nInput: rooms = [[1,3],[3,0,1],[2],[0]]\\nOutput: false',
    starterCode: null
  },
  {
    id: 'all-paths-source-target',
    title: 'All Paths From Source to Target',
    category: 'Graphs',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/all-paths-from-source-to-target/',
    tags: ['Backtracking', 'Depth-First Search', 'Breadth-First Search', 'Graph'],
    companies: ['Google', 'Amazon', 'Meta'],
    description: "Given a directed acyclic graph (DAG) of n nodes labeled 0 to n-1, where graph[i] is the list of nodes you can visit from node i, return all possible paths from node 0 to node n-1.\\n\\nUse DFS with backtracking: maintain a current-path list, push the current node, recurse to each neighbor, and when you reach n-1 add a copy of the path to the result. Output is sorted lexicographically here for deterministic comparison.",
    examples: 'Input: graph = [[1,2],[3],[3],[]]\\nOutput: [[0,1,3],[0,2,3]]\\n\\nInput: graph = [[4,3,1],[3,2,4],[3],[4],[]]\\nOutput: [[0,4],[0,3,4],[0,1,3,4],[0,1,2,3,4],[0,1,4]]',
    starterCode: null
  },
  {
    id: 'evaluate-division',
    title: 'Evaluate Division',
    category: 'Graphs',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/evaluate-division/',
    tags: ['Array', 'Depth-First Search', 'Breadth-First Search', 'Union Find', 'Graph', 'Shortest Path'],
    companies: ['Google', 'Amazon', 'Meta', 'Uber'],
    description: "You are given equations in the form A / B = k as pairs of variable names and an array of real numbers, plus a list of queries. For each query C / D, return the value if it can be determined from the given equations, else -1.0.\\n\\nBuild a weighted directed graph where an edge A -> B has weight k and B -> A has weight 1/k. Then for each query, run a DFS or BFS multiplying edge weights along the path. If either variable is unknown or no path exists, return -1.0.",
    examples: 'Input: equations = [["a","b"],["b","c"]], values = [2.0,3.0], queries = [["a","c"],["b","a"],["a","e"],["a","a"],["x","x"]]\\nOutput: [6.0,0.5,-1.0,1.0,-1.0]',
    starterCode: null
  },
  {
    id: 'number-of-closed-islands',
    title: 'Number of Closed Islands',
    category: 'Graphs',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/number-of-closed-islands/',
    tags: ['Array', 'Depth-First Search', 'Breadth-First Search', 'Union Find', 'Matrix'],
    companies: ['Google', 'Amazon', 'Meta'],
    description: "Given a 2D grid of 0s (land) and 1s (water), an island is a maximal 4-directionally connected group of 0s. An island is closed if it is completely surrounded by water (its connected component does NOT touch any grid border).\\n\\nReturn the number of closed islands. Trick: first flood-fill all land connected to a border (turn those 0s into 1s to mark them non-closed). Then count the remaining islands with a standard DFS.",
    examples: 'Input: grid = [[1,1,1,1,1,1,1,0],[1,0,0,0,0,1,1,0],[1,0,1,0,1,1,1,0],[1,0,0,0,0,1,0,1],[1,1,1,1,1,1,1,0]]\\nOutput: 2\\n\\nInput: grid = [[0,0,1,0,0],[0,1,0,1,0],[0,1,1,1,0]]\\nOutput: 1',
    starterCode: null
  },
  {
    id: 'find-eventual-safe-states',
    title: 'Find Eventual Safe States',
    category: 'Graphs',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/find-eventual-safe-states/',
    tags: ['Depth-First Search', 'Breadth-First Search', 'Graph', 'Topological Sort'],
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: "There is a directed graph of n nodes where graph[i] lists the nodes reachable by a single edge from node i. A node is terminal if it has no outgoing edges. A node is safe if every path starting from it eventually ends at a terminal node.\\n\\nReturn the list of safe nodes in ascending order. Use DFS with three colors (unvisited, visiting, safe): any node on a cycle or reaching a cycle is unsafe. Alternatively, reverse the graph and run topological sort starting from terminal nodes.",
    examples: 'Input: graph = [[1,2],[2,3],[5],[0],[5],[],[]]\\nOutput: [2,4,5,6]\\n\\nInput: graph = [[1,2,3,4],[1,2],[2,3],[0,4],[]]\\nOutput: [4]',
    starterCode: null
  },
  {
    id: 'closest-bst-value',
    title: 'Closest Binary Search Tree Value',
    category: 'Trees',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/closest-binary-search-tree-value/',
    tags: ['Binary Search Tree', 'DFS', 'Tree'],
    companies: ['Google', 'Microsoft', 'Amazon', 'Meta'],
    description: "Given the root of a binary search tree and a target value, return the value in the BST that is closest to the target. If there are multiple answers, return the smallest such value.\\n\\nWalk the tree like a binary search: at each node, compare with target and move left or right while tracking the best candidate so far.",
    examples: 'Input: root = [4,2,5,1,3], target = 3.714286\\nOutput: 4\\n\\nInput: root = [1], target = 4.428571\\nOutput: 1',
    starterCode: null
  },
  {
    id: 'find-mode-bst',
    title: 'Find Mode in Binary Search Tree',
    category: 'Trees',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/find-mode-in-binary-search-tree/',
    tags: ['Binary Search Tree', 'DFS', 'Tree'],
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: "Given the root of a BST with duplicates, return all the modes (values that appear most frequently). If the tree has more than one mode, return them in any order (we sort for deterministic output).\\n\\nInorder traversal of a BST visits equal values consecutively, letting you count runs in O(1) extra space.",
    examples: 'Input: root = [1,null,2,2]\\nOutput: [2]\\n\\nInput: root = [0]\\nOutput: [0]',
    starterCode: null
  },
  {
    id: 'good-nodes-binary-tree',
    title: 'Count Good Nodes in Binary Tree',
    category: 'Trees',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/count-good-nodes-in-binary-tree/',
    tags: ['DFS', 'BFS', 'Tree'],
    companies: ['Google', 'Microsoft', 'Amazon', 'Meta'],
    description: "Given a binary tree root, a node X in the tree is named good if in the path from root to X there are no nodes with a value greater than X. Return the number of good nodes in the binary tree.\\n\\nDFS carrying the maximum value seen so far on the current path; increment a counter when node.val >= max_so_far.",
    examples: 'Input: root = [3,1,4,3,null,1,5]\\nOutput: 4\\n\\nInput: root = [3,3,null,4,2]\\nOutput: 3',
    starterCode: null
  },
  {
    id: 'pseudo-palindromic-paths',
    title: 'Pseudo-Palindromic Paths in a Binary Tree',
    category: 'Trees',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/pseudo-palindromic-paths-in-a-binary-tree/',
    tags: ['Bit Manipulation', 'DFS', 'Tree'],
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: "Given a binary tree where node values are digits from 1 to 9, a root-to-leaf path is pseudo-palindromic if at least one permutation of its node values is a palindrome. Return the number of pseudo-palindromic paths.\\n\\nA multiset is palindrome-permutable iff at most one value has odd count. Track a 9-bit mask, toggling a bit per value; a leaf path is pseudo-palindromic if the mask has at most one bit set.",
    examples: 'Input: root = [2,3,1,3,1,null,1]\\nOutput: 2\\n\\nInput: root = [2,1,1,1,3,null,null,null,null,null,1]\\nOutput: 1',
    starterCode: null
  },
  {
    id: 'max-diff-node-ancestor',
    title: 'Maximum Difference Between Node and Ancestor',
    category: 'Trees',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/maximum-difference-between-node-and-ancestor/',
    tags: ['DFS', 'Tree'],
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: "Given the root of a binary tree, find the maximum value v for which there exist nodes a and b where v = |a.val - b.val| and a is an ancestor of b. If no ancestor-descendant pair exists, return 0.\\n\\nDFS carrying the min and max values seen along the current path; at each leaf, candidate = max - min. Global answer is the largest such candidate.",
    examples: 'Input: root = [8,3,10,1,6,null,14,null,null,4,7,13]\\nOutput: 7\\n\\nInput: root = [1,null,2,null,0,3]\\nOutput: 3',
    starterCode: null
  },
  {
    id: 'binary-tree-longest-consecutive',
    title: 'Binary Tree Longest Consecutive Sequence',
    category: 'Trees',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/binary-tree-longest-consecutive-sequence/',
    tags: ['DFS', 'Tree'],
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: "Given the root of a binary tree, return the length of the longest consecutive sequence path. The path refers to any sequence of nodes from some starting node to any node in the tree along the parent-child connections. The longest consecutive path needs to be strictly increasing by 1 and the path must go downwards (from parent to child).\\n\\nLength is measured in number of nodes in the path (so a single node has length 1).",
    examples: 'Input: root = [1,null,3,2,4,null,null,null,5]\\nOutput: 3\\n\\nInput: root = [2,null,3,2,null,1]\\nOutput: 2',
    starterCode: null
  },
  {
    id: 'reorder-list',
    title: 'Reorder List',
    category: 'Linked Lists',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/reorder-list/',
    tags: ['Linked List', 'Two Pointers', 'Stack', 'Recursion'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta'],
    description: "You are given the head of a singly linked list L0 -> L1 -> ... -> Ln-1 -> Ln. Reorder the list to: L0 -> Ln -> L1 -> Ln-1 -> L2 -> Ln-2 -> ...\\n\\nYou may not modify the values in the list nodes. Only nodes themselves may be changed.\\n\\nThree-step approach: find the middle (slow/fast pointers), reverse the second half, then merge the two halves alternately.",
    examples: 'Input: head = [1,2,3,4]\\nOutput: [1,4,2,3]\\n\\nInput: head = [1,2,3,4,5]\\nOutput: [1,5,2,4,3]',
    starterCode: null
  },
  {
    id: 'convert-sorted-list-to-bst',
    title: 'Convert Sorted List to Binary Search Tree',
    category: 'Linked Lists',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/convert-sorted-list-to-binary-search-tree/',
    tags: ['Linked List', 'Divide and Conquer', 'Tree', 'Binary Search Tree'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta'],
    description: "Given the head of a singly linked list where elements are sorted in ascending order, convert it to a height-balanced binary search tree.\\n\\nConvention: when choosing a midpoint, pick the LEFT middle (mid = (l + r) / 2). This produces a deterministic tree.\\n\\nApproach: materialize the list into an array, then recursively choose the left-middle index as the root and build left/right subtrees from the two halves.",
    examples: 'Input: head = [-10,-3,0,5,9]\\nOutput: [0,-10,5,null,-3,null,9]\\n\\nInput: head = []\\nOutput: []',
    starterCode: null
  },
  {
    id: 'smallest-subtree-deepest-nodes',
    title: 'Smallest Subtree with all the Deepest Nodes',
    category: 'Trees',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/smallest-subtree-with-all-the-deepest-nodes/',
    tags: ['Hash Table', 'DFS', 'BFS', 'Tree'],
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: "Given the root of a binary tree, find the smallest subtree such that it contains all the deepest nodes in the original tree. Return its root value.\\n\\nA node is deepest if it has the largest possible depth. The smallest subtree containing all deepest nodes is their lowest common ancestor.\\n\\nOne-pass DFS: return (depth, lcaNode) bottom-up. If both child depths match, current node is the LCA; otherwise propagate the deeper child.",
    examples: 'Input: root = [3,5,1,6,2,0,8,null,null,7,4]\\nOutput: 2\\n\\nInput: root = [1]\\nOutput: 1',
    starterCode: null
  },
  {
    id: 'sum-of-left-leaves',
    title: 'Sum of Left Leaves',
    category: 'Trees',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/sum-of-left-leaves/',
    tags: ['DFS', 'BFS', 'Tree'],
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: "Given the root of a binary tree, return the sum of all left leaves. A leaf is a node with no children. A left leaf is a leaf that is the left child of another node.\\n\\nDFS with a flag (or explicit check on the parent): when at node.left and it has no children, add its value to the running sum.",
    examples: 'Input: root = [3,9,20,null,null,15,7]\\nOutput: 24\\n\\nInput: root = [1]\\nOutput: 0',
    starterCode: null
  },
  {
    id: 'number-longest-increasing-subseq',
    title: 'Number of Longest Increasing Subsequence',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/number-of-longest-increasing-subsequence/',
    tags: ['Dynamic Programming', 'Binary Indexed Tree', 'Segment Tree'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    description: "Given an integer array nums, return the number of longest strictly increasing subsequences.\\n\\nMaintain two parallel DP arrays: len[i] = length of LIS ending at i, cnt[i] = number of such LIS. For each i, scan prior j<i with nums[j]<nums[i]: if len[j]+1 > len[i] update len[i] and set cnt[i] = cnt[j]; if len[j]+1 == len[i] add cnt[j] to cnt[i]. Answer sums cnt[i] over all i where len[i] equals the global max.",
    examples: 'Input: nums = [1,3,5,4,7]\\nOutput: 2\\nExplanation: LIS length is 4; two such LIS: [1,3,4,7] and [1,3,5,7].\\n\\nInput: nums = [2,2,2,2,2]\\nOutput: 5\\nExplanation: LIS length is 1; any single element works.',
    starterCode: null
  },
  {
    id: 'arithmetic-slices',
    title: 'Arithmetic Slices',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/arithmetic-slices/',
    tags: ['Array', 'Dynamic Programming'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta'],
    description: "Given an integer array nums, return the number of arithmetic subarrays of length at least 3. An arithmetic subarray has a constant difference between consecutive elements.\\n\\nO(n) DP: let dp[i] be the number of arithmetic slices ENDING at index i. If nums[i]-nums[i-1] == nums[i-1]-nums[i-2], then dp[i] = dp[i-1]+1, else dp[i]=0. Sum all dp[i] for the answer.",
    examples: 'Input: nums = [1,2,3,4]\\nOutput: 3\\nExplanation: Slices are [1,2,3], [2,3,4], [1,2,3,4].\\n\\nInput: nums = [1]\\nOutput: 0',
    starterCode: null
  },
  {
    id: 'out-of-boundary-paths',
    title: 'Out of Boundary Paths',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/out-of-boundary-paths/',
    tags: ['Dynamic Programming', 'Memoization'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    description: "Given an m x n grid, a ball starts at (startRow, startCol). You can move the ball up/down/left/right at most maxMove times. Return the number of paths that move the ball out of the grid boundary. Since the answer can be large, return it modulo 10^9 + 7.\\n\\nTop-down memoization: f(r,c,k) = ways to exit within k moves. Base: if (r,c) out of bounds return 1; if k==0 return 0. Recurse on 4 neighbors with k-1 and sum modulo 1e9+7.",
    examples: 'Input: m=2, n=2, maxMove=2, startRow=0, startCol=0\\nOutput: 6\\n\\nInput: m=1, n=3, maxMove=3, startRow=0, startCol=1\\nOutput: 12',
    starterCode: null
  },
  {
    id: 'stone-game',
    title: 'Stone Game',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/stone-game/',
    tags: ['Math', 'Dynamic Programming', 'Game Theory'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta'],
    description: "Alice and Bob play a game with piles of stones. The piles are arranged in a row with piles[i] stones in the i-th pile. On each turn a player takes an entire pile from either the beginning or the end of the row. Alice goes first. Both play optimally. The total number of stones is odd. Return true if Alice wins.\\n\\nLC guarantees piles.length is even and totals are odd; by a coloring argument Alice can always pick all even-indexed OR all odd-indexed piles, so she always wins. Still, a general interval DP (dp[i][j] = max score diff for current player) solves the general case.",
    examples: 'Input: piles = [5,3,4,5]\\nOutput: true\\nExplanation: Alice picks 5 (idx 3). Bob picks 4 or 5 (idx 0). Alice wins.\\n\\nInput: piles = [3,7,2,3]\\nOutput: true',
    starterCode: null
  },
  {
    id: 'predict-the-winner',
    title: 'Predict the Winner',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/predict-the-winner/',
    tags: ['Recursion', 'Dynamic Programming', 'Game Theory'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta'],
    description: "Given an integer array nums, two players take turns picking from either end. Each picked value is added to the player\'s score. Player 1 goes first. Both play optimally. Return true if Player 1 wins or ties (ties count as a Player 1 win).\\n\\nInterval DP: dp[i][j] = best score difference (current - opponent) the current player can achieve on nums[i..j]. Recurrence: dp[i][j] = max(nums[i] - dp[i+1][j], nums[j] - dp[i][j-1]). Player 1 wins iff dp[0][n-1] >= 0.",
    examples: 'Input: nums = [1,5,2]\\nOutput: false\\n\\nInput: nums = [1,5,233,7]\\nOutput: true',
    starterCode: null
  },
  {
    id: 'last-stone-weight-ii',
    title: 'Last Stone Weight II',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/last-stone-weight-ii/',
    tags: ['Array', 'Dynamic Programming'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    description: "You are given an array of stone weights. In each step any two stones x, y (x <= y) smash: if equal both destroyed, else new stone weight (y - x). Repeat until at most one stone remains. Return the smallest possible weight of the final stone (0 if all destroyed).\\n\\nReduces to partition into two subsets with minimum absolute difference of sums. Classic 0/1 knapsack: find subset sum s <= total/2 that maximizes s; answer is total - 2*s. Use a boolean DP over sums up to total/2.",
    examples: 'Input: stones = [2,7,4,1,8,1]\\nOutput: 1\\n\\nInput: stones = [31,26,33,21,40]\\nOutput: 5',
    starterCode: null
  },
  {
    id: 'restore-ip-addresses',
    title: 'Restore IP Addresses',
    category: 'Backtracking',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/restore-ip-addresses/',
    tags: ['String', 'Backtracking'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta'],
    description: "Given a string s of only digits, return all possible valid IP addresses that can be formed by inserting three dots. A valid IP address consists of four integers, each between 0 and 255, separated by single dots, with no leading zeros (except the literal 0).\\n\\nBacktrack over three split positions. At each step try octets of length 1, 2, or 3; reject if the octet has a leading zero (length > 1 starting with 0) or exceeds 255. Prune early if remaining length can\'t fit the remaining octets.",
    examples: 'Input: s = "25525511135"\\nOutput: ["255.255.11.135","255.255.111.35"]\\n\\nInput: s = "0000"\\nOutput: ["0.0.0.0"]',
    starterCode: null
  },
  {
    id: 'word-break-ii',
    title: 'Word Break II',
    category: 'Backtracking',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/word-break-ii/',
    tags: ['Dynamic Programming', 'Backtracking', 'Trie', 'Memoization'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    description: "Given a string s and a dictionary of words, add spaces in s to construct every possible sentence where each word is valid. Return all sentences in any order; the same dictionary word may be reused.\\n\\nMemoized DFS: for each suffix position, try every dictionary word as a prefix match; recurse on the remaining suffix; join each returned sentence with the current word. Cache results by start index to avoid recomputation in pathological inputs.",
    examples: 'Input: s = "catsanddog", wordDict = ["cat","cats","and","sand","dog"]\\nOutput: ["cats and dog","cat sand dog"]',
    starterCode: null
  },
  {
    id: 'word-search-ii',
    title: 'Word Search II',
    category: 'Backtracking',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/word-search-ii/',
    tags: ['Array', 'String', 'Backtracking', 'Trie', 'Matrix'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    description: "Given an m x n board of characters and a list of words, return all words on the board. A word is formed from sequentially adjacent cells (horizontally or vertically), and the same cell cannot be reused in one word.\\n\\nBuild a trie of all words; run DFS from every cell, descending only when the current character matches an edge in the trie. Mark cells visited during DFS (e.g., overwrite then restore). Collect words when a trie node\'s terminal flag is set, and optionally prune dead branches from the trie.",
    examples: 'Input: board = [["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]], words = ["oath","pea","eat","rain"]\\nOutput: ["eat","oath"]',
    starterCode: null
  },
  {
    id: 'split-array-largest-sum',
    title: 'Split Array Largest Sum',
    category: 'Dynamic Programming',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/split-array-largest-sum/',
    tags: ['Array', 'Binary Search', 'Dynamic Programming', 'Greedy', 'Prefix Sum'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    description: "Given an integer array nums and an integer k, split nums into k non-empty contiguous subarrays. Minimize the largest subarray sum. Return that minimized value.\\n\\nBinary search on the answer: candidate x is feasible if you can greedily pack nums into <= k groups where each group sum <= x. Low bound is max(nums); high bound is sum(nums). Alternatively, interval DP: dp[i][j] = min over split of max(dp[i-1][p], sum[p+1..j-1]).",
    examples: 'Input: nums = [7,2,5,10,8], k = 2\\nOutput: 18\\n\\nInput: nums = [1,2,3,4,5], k = 2\\nOutput: 9',
    starterCode: null
  },
  {
    id: 'number-of-1-bits',
    title: 'Number of 1 Bits',
    category: 'Fundamentals',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/number-of-1-bits/',
    tags: ['Bit Manipulation', 'Divide and Conquer'],
    companies: ['Google', 'Apple', 'Microsoft', 'Amazon'],
    description: "Write a function that takes the binary representation of a positive integer and returns the number of set bits (also known as the Hamming weight).\\n\\nThe classic approach is Brian Kernighan's trick: n & (n - 1) clears the lowest set bit, so count how many times you can do that before n becomes 0. Java exposes Integer.bitCount as a one-line helper.",
    examples: 'Input: n = 11 (binary 1011)\\nOutput: 3\\n\\nInput: n = 128 (binary 10000000)\\nOutput: 1',
    starterCode: null
  },
  {
    id: 'reverse-bits',
    title: 'Reverse Bits',
    category: 'Fundamentals',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/reverse-bits/',
    tags: ['Bit Manipulation', 'Divide and Conquer'],
    companies: ['Google', 'Apple', 'Amazon', 'Microsoft'],
    description: "Reverse the bits of a given 32-bit unsigned integer. In Java integers are signed, so the output here is interpreted as a signed int; the bit pattern is still the reversal of the input.\\n\\nBuild the result bit by bit: shift result left by 1, OR in the lowest bit of n, then shift n right by 1, repeating 32 times.",
    examples: 'Input: n = 43261596 (binary 00000010100101000001111010011100)\\nOutput: 964176192 (binary 00111001011110000010100101000000)\\n\\nInput: n = 1\\nOutput: -2147483648',
    starterCode: null
  },
  {
    id: 'sum-of-two-integers',
    title: 'Sum of Two Integers',
    category: 'Fundamentals',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/sum-of-two-integers/',
    tags: ['Bit Manipulation', 'Math'],
    companies: ['Google', 'Apple', 'Amazon', 'Microsoft'],
    description: "Given two integers a and b, return their sum without using the + or - operators.\\n\\nUse bit manipulation: a ^ b is the sum without carries, (a & b) << 1 is the carry. Loop until the carry is zero. Two's complement handles negative numbers naturally in Java.",
    examples: 'Input: a = 1, b = 2\\nOutput: 3\\n\\nInput: a = 2, b = 3\\nOutput: 5',
    starterCode: null
  },
  {
    id: 'last-stone-weight',
    title: 'Last Stone Weight',
    category: 'Sorting & Searching',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/last-stone-weight/',
    tags: ['Array', 'Heap (Priority Queue)'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta'],
    description: "You are given an array of stone weights. In each turn, pick the two heaviest stones x <= y: if equal, both are destroyed; otherwise a new stone of weight y - x replaces them. Return the weight of the remaining stone, or 0 if none remain.\\n\\nA max-heap keeps the two heaviest accessible in O(log n) per operation.",
    examples: 'Input: stones = [2,7,4,1,8,1]\\nOutput: 1\\n\\nInput: stones = [1]\\nOutput: 1',
    starterCode: null
  },
  {
    id: 'design-hashmap',
    title: 'Design HashMap',
    category: 'Hash Maps',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/design-hashmap/',
    tags: ['Array', 'Hash Table', 'Linked List', 'Design', 'Hash Function'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Apple'],
    description: "Design a HashMap without using any built-in hash table libraries. Implement put(key, value), get(key) which returns -1 if the key is not present, and remove(key).\\n\\nA standard approach uses an array of buckets with separate chaining. Choose a prime bucket count and a simple modulo hash function.",
    examples: 'put(1,1); put(2,2); get(1) -> 1; get(3) -> -1; put(2,1); get(2) -> 1; remove(2); get(2) -> -1',
    starterCode: null
  },
  {
    id: 'design-circular-queue',
    title: 'Design Circular Queue',
    category: 'Stacks & Queues',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/design-circular-queue/',
    tags: ['Array', 'Linked List', 'Design', 'Queue'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Apple'],
    description: "Design a fixed-size circular queue. Implement enQueue(v), deQueue(), Front(), Rear(), isEmpty(), isFull(). enQueue and deQueue return boolean (true on success). Front/Rear return -1 when empty.\\n\\nUse a fixed array with head and tail indices (or head and count). Modular arithmetic wraps around.",
    examples: 'MyCircularQueue q(3); q.enQueue(1)=true; q.enQueue(2)=true; q.enQueue(3)=true; q.enQueue(4)=false; q.Rear()=3; q.isFull()=true; q.deQueue()=true; q.enQueue(4)=true; q.Rear()=4',
    starterCode: null
  },
  {
    id: 'design-tic-tac-toe',
    title: 'Design Tic-Tac-Toe',
    category: 'Fundamentals',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/design-tic-tac-toe/',
    tags: ['Array', 'Hash Table', 'Design', 'Matrix', 'Simulation'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta'],
    description: "Design an n x n Tic-Tac-Toe game. move(row, col, player) places a mark and returns 0 if no winner yet, or the player number (1 or 2) if that move wins.\\n\\nClever O(1) trick: track per-row, per-column, and two diagonal running sums per player. When any sum reaches n (or -n for the other player), that player has won.",
    examples: 'n=3; move(0,0,1)=0; move(0,2,2)=0; move(2,2,1)=0; move(1,1,2)=0; move(2,0,1)=0; move(1,0,2)=0; move(2,1,1)=1 (player 1 wins bottom row)',
    starterCode: null
  },
  {
    id: 'design-hit-counter',
    title: 'Design Hit Counter',
    category: 'Fundamentals',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/design-hit-counter/',
    tags: ['Array', 'Hash Table', 'Binary Search', 'Design', 'Queue'],
    companies: ['Google', 'Amazon', 'Dropbox', 'Microsoft'],
    description: "Design a hit counter that counts the number of hits received in the past 5 minutes (300 seconds). hit(timestamp) records a hit; getHits(timestamp) returns the hits in the window [timestamp - 299, timestamp]. Calls are in chronological order.\\n\\nA queue of timestamps is simple; a circular 300-slot buffer gives O(1) worst-case.",
    examples: 'hit(1); hit(2); hit(3); getHits(4) -> 3; hit(300); getHits(300) -> 4; getHits(301) -> 3',
    starterCode: null
  },
  {
    id: 'power-of-two',
    title: 'Power of Two',
    category: 'Fundamentals',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/power-of-two/',
    tags: ['Math', 'Bit Manipulation', 'Recursion'],
    companies: ['Google', 'Apple', 'Amazon', 'Microsoft'],
    description: "Given an integer n, return true if n is a power of two; otherwise return false. A number is a power of two if there exists an integer x such that n == 2^x.\\n\\nBit trick: a positive power of two has exactly one set bit, so n > 0 && (n & (n - 1)) == 0.",
    examples: 'Input: n = 1\\nOutput: true (2^0 = 1)\\n\\nInput: n = 3\\nOutput: false',
    starterCode: null
  },
  {
    id: 'single-number-ii',
    title: 'Single Number II',
    category: 'Arrays',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/single-number-ii/',
    tags: ['Array', 'Bit Manipulation'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Apple'],
    description: "Given an integer array where every element appears exactly three times except for one that appears once, find and return that single element. Aim for linear time and constant extra space.\\n\\nTwo-bit state machine: track ones and twos where each bit counts occurrences modulo 3. ones = (ones ^ x) & ~twos; twos = (twos ^ x) & ~ones.",
    examples: 'Input: nums = [2,2,3,2]\\nOutput: 3\\n\\nInput: nums = [0,1,0,1,0,1,99]\\nOutput: 99',
    starterCode: null
  },

  {
    id: 'replace-words',
    title: 'Replace Words',
    category: 'Backtracking',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/replace-words/',
    tags: ['Trie', 'String', 'Hash Table'],
    companies: ['Google', 'Amazon', 'Meta'],
    description: "Given a dictionary of roots and a sentence, replace every word in the sentence with its shortest root that is a prefix of the word. If no root applies, keep the original word.\\n\\nBuild a Trie from the roots. For each word in the sentence, walk the Trie letter by letter; stop at the first node marked as end-of-root and emit that prefix. Otherwise emit the full word.",
    examples: 'Input: dictionary = ["cat","bat","rat"], sentence = "the cattle was rattled by the battery"\\nOutput: "the cat was rat by the bat"\\n\\nInput: dictionary = ["a","b","c"], sentence = "aadsfasf absbs bbab cadsfafs"\\nOutput: "a a b c"',
    starterCode: null
  },
  {
    id: 'design-add-search-words',
    title: 'Design Add and Search Words Data Structure',
    category: 'Backtracking',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/design-add-and-search-words-data-structure/',
    tags: ['Trie', 'Design', 'String', 'Depth-First Search', 'Backtracking'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    description: "Design a data structure that supports addWord(word) and search(word). The search string can contain the dot character, which matches any single letter.\\n\\nUse a Trie with 26 children per node plus an end-of-word flag. addWord walks or creates the path. search recurses: on a regular character, follow the matching child; on a dot, try every non-null child. Return true if any recursion reaches a node marked end-of-word at the final position.",
    examples: 'Input: addWord("bad"), addWord("dad"), addWord("mad"); search("pad"), search("bad"), search(".ad"), search("b..")\\nOutput: false, true, true, true',
    starterCode: null
  },
  {
    id: 'maximum-xor-two-numbers',
    title: 'Maximum XOR of Two Numbers in an Array',
    category: 'Hash Maps',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/',
    tags: ['Bit Manipulation', 'Trie', 'Array', 'Hash Table'],
    companies: ['Google', 'Amazon', 'Meta'],
    description: "Given an integer array nums, return the maximum result of nums[i] XOR nums[j] for any pair of distinct indices.\\n\\nGreedy bit approach: build the answer bit by bit from the most significant to least significant. At each bit position, hypothesize the bit is 1, collect prefixes of nums under that hypothesis, and check via a hash set whether two prefixes XOR to the target. If yes, keep the bit; otherwise set it to 0.",
    examples: 'Input: nums = [3,10,5,25,2,8]\\nOutput: 28\\n\\nInput: nums = [14,70,53,83,49,91,36,80,92,51,66,70]\\nOutput: 127',
    starterCode: null
  },
  {
    id: 'implement-strstr',
    title: 'Find Index of First Occurrence in a String',
    category: 'Strings',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/',
    tags: ['Two Pointers', 'String', 'String Matching'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    description: "Given two strings haystack and needle, return the index of the first occurrence of needle in haystack, or -1 if needle is not part of haystack. When needle is empty, return 0 by convention.\\n\\nThe naive approach scans each starting index in haystack and compares character by character. KMP achieves linear time by precomputing a failure function that skips already-matched prefixes on mismatch.",
    examples: 'Input: haystack = "sadbutsad", needle = "sad"\\nOutput: 0\\n\\nInput: haystack = "leetcode", needle = "leeto"\\nOutput: -1',
    starterCode: null
  },
  {
    id: 'longest-happy-prefix',
    title: 'Longest Happy Prefix',
    category: 'Strings',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/longest-happy-prefix/',
    tags: ['String', 'Hash Function', 'Rolling Hash', 'String Matching', 'KMP'],
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: "A happy prefix is a non-empty prefix that is also a suffix (excluding the whole string itself). Return the longest happy prefix of the given string, or the empty string if none exists.\\n\\nThis is exactly the KMP failure function applied to the full string: lps[n-1] gives the length of the longest proper prefix that is also a suffix. Return the substring s[0..lps[n-1]].",
    examples: 'Input: s = "level"\\nOutput: "l"\\n\\nInput: s = "ababab"\\nOutput: "abab"',
    starterCode: null
  },
  {
    id: 'palindrome-pairs',
    title: 'Palindrome Pairs',
    category: 'Strings',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/palindrome-pairs/',
    tags: ['Trie', 'Array', 'Hash Table', 'String'],
    companies: ['Google', 'Amazon', 'Airbnb'],
    description: "Given a list of unique words, return all pairs of distinct indices (i, j) such that words[i] + words[j] is a palindrome. Sort the output pairs lexicographically for deterministic comparison.\\n\\nEfficient approach: store each word reversed in a hash map from reversed-string to index. For each word and each split point, check if the left part equals a reversed word and the right part is a palindrome (or vice versa); record the index pair.",
    examples: 'Input: words = ["abcd","dcba","lls","s","sssll"]\\nOutput: [[0,1],[1,0],[2,4],[3,2]]\\n\\nInput: words = ["bat","tab","cat"]\\nOutput: [[0,1],[1,0]]',
    starterCode: null
  },
  {
    id: 'critical-connections',
    title: 'Critical Connections in a Network',
    category: 'Graphs',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/critical-connections-in-a-network/',
    tags: ['Depth-First Search', 'Graph', 'Biconnected Component'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    description: "Given a network of n servers numbered 0..n-1 and a list of undirected connections, return all critical connections (bridges): edges whose removal disconnects the graph.\\n\\nRun Tarjan's bridge-finding DFS: track discovery time and low-link value for each node. An edge (u, v) is a bridge when low[v] > disc[u], meaning v cannot reach u or any ancestor of u without using edge (u, v). Normalize each edge as [min, max] and sort results for deterministic output.",
    examples: 'Input: n = 4, connections = [[0,1],[1,2],[2,0],[1,3]]\\nOutput: [[1,3]]\\n\\nInput: n = 2, connections = [[0,1]]\\nOutput: [[0,1]]',
    starterCode: null
  },
  {
    id: 'alien-dictionary',
    title: 'Alien Dictionary',
    category: 'Graphs',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/alien-dictionary/',
    tags: ['Graph', 'Topological Sort', 'Breadth-First Search', 'Depth-First Search', 'Array', 'String'],
    companies: ['Google', 'Amazon', 'Meta', 'Airbnb'],
    description: "Given a sorted list of words from an alien language, derive any ordering of its letters. Return the empty string if no valid ordering exists (a cycle in the implied ordering, or a prefix-ordering contradiction such as a longer word appearing before its prefix).\\n\\nBuild a directed graph from pairwise letter comparisons of adjacent words, then run Kahn's topological sort with a priority queue to produce a deterministic lexicographically smallest ordering among valid topological orders.",
    examples: 'Input: words = ["wrt","wrf","er","ett","rftt"]\\nOutput: "wertf"\\n\\nInput: words = ["z","x","z"]\\nOutput: ""',
    starterCode: null
  },
  {
    id: 'reconstruct-itinerary',
    title: 'Reconstruct Itinerary',
    category: 'Graphs',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/reconstruct-itinerary/',
    tags: ['Depth-First Search', 'Graph', 'Eulerian Circuit'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    description: "Given a list of airline tickets as [from, to] pairs, reconstruct the itinerary that starts at JFK and uses every ticket exactly once. If multiple valid itineraries exist, return the one with the smallest lexical order when read as a single string.\\n\\nThis is an Eulerian path problem. Hierholzer's algorithm with a min-heap per source: always take the smallest lex destination first; when stuck, append to the output in reverse. Reverse the collected list at the end.",
    examples: 'Input: tickets = [["MUC","LHR"],["JFK","MUC"],["SFO","SJC"],["LHR","SFO"]]\\nOutput: ["JFK","MUC","LHR","SFO","SJC"]\\n\\nInput: tickets = [["JFK","SFO"],["JFK","ATL"],["SFO","ATL"],["ATL","JFK"],["ATL","SFO"]]\\nOutput: ["JFK","ATL","JFK","SFO","ATL","SFO"]',
    starterCode: null
  },
  {
    id: 'min-cost-hire-k-workers',
    title: 'Minimum Cost to Hire K Workers',
    category: 'Sorting & Searching',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/minimum-cost-to-hire-k-workers/',
    tags: ['Array', 'Greedy', 'Sorting', 'Heap (Priority Queue)'],
    companies: ['Google', 'Amazon', 'Meta'],
    description: "Hire exactly k workers to minimize total pay, subject to two rules: every hired worker must be paid at least their minimum wage, and within the hired group pay must be proportional to quality. Return the minimum total cost.\\n\\nKey insight: for any group, the payment ratio is the maximum wage/quality ratio in the group, and total cost is that ratio times the sum of qualities. Sort workers by ratio ascending; sweep with a max-heap of qualities of size k. At each step, the current ratio is the group's max, and cost = ratio * sum_of_smallest_k_qualities_so_far.",
    examples: 'Input: quality = [10,20,5], wage = [70,50,30], k = 2\\nOutput: 105.00000\\n\\nInput: quality = [3,1,10,10,1], wage = [4,8,2,2,7], k = 3\\nOutput: 30.66667',
    starterCode: null
  },
  {
    id: 'count-smaller-after-self',
    title: 'Count of Smaller Numbers After Self',
    category: 'Sorting & Searching',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/count-of-smaller-numbers-after-self/',
    tags: ['Binary Indexed Tree', 'Segment Tree', 'Merge Sort', 'Divide and Conquer'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    description: "Given an integer array nums, return an integer array counts where counts[i] is the number of smaller elements to the right of nums[i].\\n\\nBrute force O(n^2) works but is slow. Efficient O(n log n) approaches: merge sort (count inversions during merge), a Binary Indexed Tree / Fenwick tree on coordinate-compressed values, or a segment tree. Walk from right to left; for each value query how many previously seen values are strictly smaller, then record and insert.",
    examples: 'Input: nums = [5,2,6,1]\\nOutput: [2,1,1,0]\\nExplanation: To the right of 5 there are 2 smaller (2 and 1). To the right of 2 there is 1 smaller (1). To the right of 6 there is 1 smaller (1). To the right of 1 there is 0.\\n\\nInput: nums = [-1]\\nOutput: [0]\\n\\nInput: nums = [-1,-1]\\nOutput: [0,0]',
    starterCode: null
  },
  {
    id: 'divide-two-integers',
    title: 'Divide Two Integers',
    category: 'Fundamentals',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/divide-two-integers/',
    tags: ['Math', 'Bit Manipulation'],
    companies: ['Google', 'Microsoft', 'Amazon', 'Oracle'],
    description: "Given two integers dividend and divisor, divide them without using multiplication, division, or mod operator. Return the quotient after truncating toward zero. If the result would overflow 32-bit signed int, clamp to [-2^31, 2^31 - 1].\\n\\nThe standard trick: work with long/absolute values, repeatedly subtract the largest shifted multiple of the divisor (divisor << k while it still fits) from the remaining dividend and accumulate 1 << k into the quotient. Handle the sign separately. Watch for Integer.MIN_VALUE — its absolute value does not fit in int.",
    examples: 'Input: dividend = 10, divisor = 3\\nOutput: 3\\nExplanation: 10 / 3 truncated toward zero is 3.\\n\\nInput: dividend = 7, divisor = -3\\nOutput: -2\\nExplanation: 7 / -3 = -2.33... truncated toward zero is -2.',
    starterCode: null
  },
  {
    id: 'moving-average-stream',
    title: 'Moving Average from Data Stream',
    category: 'Fundamentals',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/moving-average-from-data-stream/',
    tags: ['Design', 'Queue', 'Data Stream'],
    companies: ['Google', 'Amazon', 'Meta', 'Bloomberg'],
    description: "Design a class MovingAverage that calculates the moving average of the last size values from a data stream.\\n\\nImplement: MovingAverage(int size) initializes with window size; double next(int val) appends val to the stream and returns the mean of the last min(size, count) values.\\n\\nUse a queue (ArrayDeque) of size capped at the window, plus a running sum. On next(): if the queue is full, pop front and subtract; push val and add to sum; return sum / queue.size().",
    examples: 'Input:\\n["MovingAverage","next","next","next","next"]\\n[[3],[1],[10],[3],[5]]\\nOutput: [null, 1.0, 5.5, 4.66667, 6.0]',
    starterCode: null
  },
  {
    id: 'logger-rate-limiter',
    title: 'Logger Rate Limiter',
    category: 'Hash Maps',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/logger-rate-limiter/',
    tags: ['Hash Table', 'Design'],
    companies: ['Google', 'Amazon', 'Meta', 'Uber'],
    description: "Design a logger that receives a stream of messages along with timestamps (in seconds). Each unique message should be printed at most once every 10 seconds — meaning if the same message is received within 10 seconds of its last printed time, it is suppressed.\\n\\nAll calls to shouldPrintMessage will have monotonically non-decreasing timestamp. Return true if the message should be printed at the given time, false otherwise, and record the print time on success.\\n\\nSimplest implementation: a HashMap<String, Integer> mapping message to next-allowed-timestamp. On check: if map does not contain it or map.get(msg) <= timestamp, update to timestamp + 10 and return true; else return false.",
    examples: 'Input:\\n["Logger","shouldPrintMessage","shouldPrintMessage","shouldPrintMessage","shouldPrintMessage","shouldPrintMessage","shouldPrintMessage"]\\n[[],[1,"foo"],[2,"bar"],[3,"foo"],[8,"bar"],[10,"foo"],[11,"foo"]]\\nOutput: [null, true, true, false, false, false, true]',
    starterCode: null
  },
  {
    id: 'snake-game',
    title: 'Design Snake Game',
    category: 'Fundamentals',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/design-snake-game/',
    tags: ['Design', 'Queue', 'Hash Table', 'Matrix', 'Simulation'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Bloomberg'],
    description: "Design the classic snake game on a grid of given width and height. The snake starts at (0, 0) with length 1. A list of food positions is provided; food[i] will appear only after food[i-1] is eaten. Each call to move(direction) returns the current score, or -1 if the game is over.\\n\\nGame over if the snake hits a wall or runs into its own body (excluding the tail cell that is about to move out).\\n\\nImplementation: keep the body as a Deque<int[]> (head at front, tail at back), plus a HashSet<Integer> of body-cell codes (row * width + col) for O(1) collision checks. On each move: compute new head; if out of bounds return -1; if new head lands on food, eat (grow, advance food index); otherwise remove the tail from both the deque and set; check if new head collides with the remaining body; add new head; return score.",
    examples: 'Input:\\n["SnakeGame","move","move","move","move","move","move"]\\n[[3,2,[[1,2],[0,1]]],["R"],["D"],["R"],["U"],["L"],["U"]]\\nOutput: [null,0,0,1,1,2,-1]',
    starterCode: null
  },
  {
    id: 'stone-game-ii',
    title: 'Stone Game II',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/stone-game-ii/',
    tags: ['Array', 'Math', 'Dynamic Programming', 'Game Theory', 'Prefix Sum'],
    companies: ['Google', 'Amazon', 'Meta'],
    description: "Alice and Bob take turns picking stones from piles. On each turn, a player may take the first X piles where 1 <= X <= 2M. Initially M = 1. After taking X piles, M becomes max(M, X). Both play optimally to maximize their own stones. Alice goes first. Return the maximum number of stones Alice can get.\\n\\nUse top-down DP with memoization on (index, M). Let suffixSum[i] be the total of piles[i..]. For state (i, M), the current player tries every X in [1, 2M] and picks the X that maximizes (suffixSum[i] - dp(i+X, max(M,X))). Return dp(0, 1).",
    examples: 'Input: piles = [2,7,9,4,4]\\nOutput: 10\\n\\nInput: piles = [1,2,3,4,5,100]\\nOutput: 104',
    starterCode: null
  },
  {
    id: 'cherry-pickup',
    title: 'Cherry Pickup',
    category: 'Dynamic Programming',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/cherry-pickup/',
    tags: ['Array', 'Dynamic Programming', 'Matrix'],
    companies: ['Google', 'Amazon', 'Meta'],
    description: "On an N x N grid, each cell has 0 (empty), 1 (cherry), or -1 (thorn/blocked). Starting at (0, 0), walk to (N-1, N-1) moving only right or down collecting cherries, then walk back from (N-1, N-1) to (0, 0) moving only left or up. Return the maximum number of cherries you can collect; if no path exists, return 0.\\n\\nKey reformulation: instead of two sequential paths, imagine two walkers both starting at (0, 0) and moving simultaneously to (N-1, N-1). If they land on the same cell, count its cherry only once.\\n\\nDP state: dp[r1][c1][r2] where c2 = r1 + c1 - r2 (since both walkers have taken the same number of steps). Transition: from four combinations of (down/right, down/right) for the two walkers. Result is max(0, dp[0][0][0]).",
    examples: 'Input: grid = [[0,1,-1],[1,0,-1],[1,1,1]]\\nOutput: 5\\n\\nInput: grid = [[1,1,-1],[1,-1,1],[-1,1,1]]\\nOutput: 0',
    starterCode: null
  },
  {
    id: 'range-sum-query-mutable',
    title: 'Range Sum Query - Mutable',
    category: 'Fundamentals',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/range-sum-query-mutable/',
    tags: ['Array', 'Binary Indexed Tree', 'Segment Tree', 'Design'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta'],
    description: "Given an integer array nums, support two operations efficiently:\\n\\n- update(index, val): set nums[index] = val\\n- sumRange(left, right): return the sum of nums[left..right] inclusive\\n\\nA Fenwick tree (Binary Indexed Tree) gives O(log n) per operation using O(n) space. Alternatively, a segment tree offers the same complexity with more flexibility. For this problem, BIT is the cleaner choice: maintain an internal array where point updates and prefix-sum queries are both O(log n); sumRange(l, r) = prefix(r+1) - prefix(l).",
    examples: 'Input:\\n["NumArray","sumRange","update","sumRange"]\\n[[[1,3,5]],[0,2],[1,2],[0,2]]\\nOutput: [null, 9, null, 8]',
    starterCode: null
  },
  {
    id: 'largest-divisible-subset',
    title: 'Largest Divisible Subset',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/largest-divisible-subset/',
    tags: ['Array', 'Math', 'Dynamic Programming', 'Sorting'],
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: "Given a set of distinct positive integers nums, return the largest subset such that every pair (a, b) in the subset satisfies a % b == 0 or b % a == 0.\\n\\nObservation: sort the array. Any valid subset is a chain under divisibility, which when sorted is a sequence where each element divides the next. So this becomes longest-increasing-subsequence-style DP: dp[i] = length of the longest chain ending at nums[i]; prev[i] = predecessor index. For each i, scan j < i and if nums[i] % nums[j] == 0, take the best predecessor. Reconstruct by walking back from argmax of dp.\\n\\nAny valid largest subset is accepted; tests below give a canonical answer.",
    examples: 'Input: nums = [1,2,3]\\nOutput: [1,2] (or [1,3])\\n\\nInput: nums = [1,2,4,8]\\nOutput: [1,2,4,8]',
    starterCode: null
  },
  {
    id: 'delete-operation-two-strings',
    title: 'Delete Operation for Two Strings',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/delete-operation-for-two-strings/',
    tags: ['String', 'Dynamic Programming'],
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: "Given two strings word1 and word2, return the minimum number of single-character deletions (from either string) required to make the two strings equal.\\n\\nKey insight: if L is the length of the longest common subsequence of word1 and word2, then the answer is word1.length() + word2.length() - 2*L. Every character not in the LCS must be deleted from its string.\\n\\nCompute LCS with standard DP: dp[i][j] = LCS of word1[0..i) and word2[0..j). Transition: if chars match, dp[i][j] = dp[i-1][j-1] + 1; else dp[i][j] = max(dp[i-1][j], dp[i][j-1]).",
    examples: "Input: word1 = \"sea\", word2 = \"eat\"\\nOutput: 2\\nExplanation: Delete 's' from \"sea\" and 't' from \"eat\" → both become \"ea\".\\n\\nInput: word1 = \"leetcode\", word2 = \"etco\"\\nOutput: 4",
    starterCode: null
  },

// ─── Batch 11: Stacks/Queues, Strings, Backtracking, Intervals, Trees ───

  {
    id: 'decode-string',
    title: 'Decode String',
    category: 'Stacks & Queues',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/decode-string/',
    tags: ['Stack', 'String', 'Recursion'],
    companies: ['Google', 'Amazon', 'Meta', 'Apple', 'Bloomberg'],
    description: 'Given an encoded string, return its decoded form. The encoding rule is k[encoded_string] where encoded_string inside the brackets is repeated exactly k times. k is guaranteed to be a positive integer. The input is always valid; no extra white spaces and square brackets are well-formed.\n\n**Approach:** use two stacks — one for counts, one for partial strings. On digit, build current k. On \'[\', push current string and k, reset both. On \']\', pop and repeat. On letter, append to current.\n\n**Complexity:** Time O(maxK * n), Space O(n).',
    examples: 'Input: s = "3[a]2[bc]"\nOutput: "aaabcbc"\n\nInput: s = "3[a2[c]]"\nOutput: "accaccacc"\n\nInput: s = "2[abc]3[cd]ef"\nOutput: "abcabccdcdcdef"',
    starterCode: null
  },

  {
    id: 'basic-calculator',
    title: 'Basic Calculator',
    category: 'Stacks & Queues',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/basic-calculator/',
    tags: ['Stack', 'Math', 'String', 'Recursion'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft', 'Uber'],
    description: 'Given a string s representing a valid expression, implement a basic calculator to evaluate it and return the result of the evaluation. The expression contains only non-negative integers, \'+\', \'-\', \'(\', \')\', and spaces. You are not allowed to use any built-in eval function.\n\n**Approach:** single scan with a stack of (prevResult, prevSign). Maintain current result and current sign. On digit, build number. On \'+\'/\'-\', fold number into result with sign. On \'(\', push (result, sign) and reset. On \')\', fold number and combine with pushed frame.\n\n**Complexity:** Time O(n), Space O(n).',
    examples: 'Input: s = "1 + 1"\nOutput: 2\n\nInput: s = " 2-1 + 2 "\nOutput: 3\n\nInput: s = "(1+(4+5+2)-3)+(6+8)"\nOutput: 23',
    starterCode: null
  },

  {
    id: 'minimum-remove-valid-parens',
    title: 'Minimum Remove to Make Valid Parentheses',
    category: 'Stacks & Queues',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/minimum-remove-to-make-valid-parentheses/',
    tags: ['Stack', 'String', 'Two Pass'],
    companies: ['Google', 'Meta', 'Amazon', 'Bloomberg', 'Microsoft'],
    description: 'Given a string s of \'(\', \')\' and lowercase English letters, remove the minimum number of parentheses so that the resulting string is valid and return any valid string. A valid string has every opening bracket matched with a later closing one.\n\n**Approach (deterministic two-pass):** 1) Left-to-right, drop any \')\' that has no preceding unmatched \'(\'. 2) Right-to-left, drop excess \'(\' that has no following \')\'. The canonical two-scan algorithm yields a unique output.\n\n**Complexity:** Time O(n), Space O(n).',
    examples: 'Input: s = "lee(t(c)o)de)"\nOutput: "lee(t(c)o)de"\n\nInput: s = "a)b(c)d"\nOutput: "ab(c)d"\n\nInput: s = "))(("\nOutput: ""',
    starterCode: null
  },

  {
    id: 'text-justification',
    title: 'Text Justification',
    category: 'Strings',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/text-justification/',
    tags: ['String', 'Simulation', 'Greedy'],
    companies: ['Google', 'Meta', 'LinkedIn', 'Airbnb', 'Microsoft'],
    description: 'Given an array of strings words and a width maxWidth, format the text such that each line has exactly maxWidth characters and is fully (left and right) justified. Pack as many words as possible per line greedily. Pad extra spaces between words, distributing spaces left-to-right. The last line and lines with a single word are left-justified (trailing spaces only).\n\n**Approach:** two-phase greedy. Phase 1 — group words into lines. Phase 2 — for each line, compute total spaces and spread evenly (with extras starting from the left gap). Last line is special.\n\n**Complexity:** Time O(n), Space O(n) for output.',
    examples: 'Input: words = ["This","is","an","example","of","text","justification."], maxWidth = 16\nOutput:\n[\n   "This    is    an",\n   "example  of text",\n   "justification.  "\n]',
    starterCode: null
  },

  {
    id: 'expression-add-operators',
    title: 'Expression Add Operators',
    category: 'Backtracking',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/expression-add-operators/',
    tags: ['Backtracking', 'Math', 'String'],
    companies: ['Google', 'Meta', 'Amazon', 'Apple'],
    description: 'Given a string num containing only digits and an integer target, return all possible ways to insert the binary operators \'+\', \'-\', and \'*\' between the digits of num so that the resulting expression evaluates to target. Operands may not contain leading zeros (except the single digit "0" itself).\n\n**Approach:** backtracking with four pieces of state — position, currentExpr, evaluatedValue, lastOperand (needed to undo \'+/-\' folding when applying \'*\'). For multiplication we do: newVal = evaluatedValue - lastOperand + lastOperand * currentOperand.\n\n**Complexity:** Time O(4^n), Space O(n) recursion.',
    examples: 'Input: num = "123", target = 6\nOutput: ["1*2*3","1+2+3"]\n\nInput: num = "232", target = 8\nOutput: ["2*3+2","2+3*2"]\n\nInput: num = "3456237490", target = 9191\nOutput: []',
    starterCode: null
  },

  {
    id: 'insert-interval',
    title: 'Insert Interval',
    category: 'Intervals',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/insert-interval/',
    tags: ['Array', 'Intervals', 'Sorting'],
    companies: ['Google', 'LinkedIn', 'Amazon', 'Meta', 'Microsoft'],
    description: 'You are given a sorted array of non-overlapping intervals and a new interval. Insert the new interval into the array so that the intervals are still sorted and non-overlapping (merging if needed). Return the updated list.\n\n**Approach:** three-phase scan — copy intervals strictly before newInterval, merge all intervals that overlap newInterval, then copy all intervals strictly after. No sorting needed since input is already sorted.\n\n**Complexity:** Time O(n), Space O(n).',
    examples: 'Input: intervals = [[1,3],[6,9]], newInterval = [2,5]\nOutput: [[1,5],[6,9]]\n\nInput: intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval = [4,8]\nOutput: [[1,2],[3,10],[12,16]]',
    starterCode: null
  },

  {
    id: 'meeting-rooms-i',
    title: 'Meeting Rooms',
    category: 'Intervals',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/meeting-rooms/',
    tags: ['Array', 'Intervals', 'Sorting'],
    companies: ['Google', 'Meta', 'Amazon', 'Bloomberg'],
    description: 'Given an array of meeting time intervals where intervals[i] = [start_i, end_i], determine if a person could attend all meetings (i.e., none overlap). Touching intervals (end of one equals start of next) do NOT count as overlap.\n\n**Approach:** sort by start time, then for each adjacent pair check if intervals[i].start < intervals[i-1].end — if so, overlap exists.\n\n**Complexity:** Time O(n log n), Space O(1) or O(n) depending on sort.',
    examples: 'Input: intervals = [[0,30],[5,10],[15,20]]\nOutput: false\n\nInput: intervals = [[7,10],[2,4]]\nOutput: true',
    starterCode: null
  },

  {
    id: 'my-calendar-i',
    title: 'My Calendar I',
    category: 'Intervals',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/my-calendar-i/',
    tags: ['Design', 'Intervals', 'TreeMap', 'Binary Search'],
    companies: ['Google', 'Meta', 'Amazon', 'Microsoft'],
    description: 'Implement a MyCalendar class to store your events. A new event can be added if adding the event will not cause a double booking. Each event is [start, end) — end is exclusive. Return true if the event was added, false otherwise.\n\n**Approach:** store events in a TreeMap keyed by start. For each new [s, e), find the closest event with start <= s; if its end > s, conflict. Also check the next event (start > s) — if its start < e, conflict. Otherwise insert.\n\n**Complexity:** Time O(log n) per book, Space O(n).',
    examples: 'Input: book(10,20) -> true, book(15,25) -> false, book(20,30) -> true\nExplanation: [15,25) overlaps [10,20). [20,30) touches at 20 but does not overlap half-open interval.',
    starterCode: null
  },

  {
    id: 'max-stack',
    title: 'Max Stack',
    category: 'Stacks & Queues',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/max-stack/',
    tags: ['Stack', 'Design', 'Heap', 'TreeMap', 'Doubly Linked List'],
    companies: ['Google', 'LinkedIn', 'Amazon'],
    description: 'Design a max stack data structure that supports the stack operations and popMax. push(x), pop(), top(), peekMax() returns the maximum, popMax() removes and returns the top-most maximum (when there are ties, only remove the most recently pushed).\n\n**Approach (simple):** keep two stacks — the main stack and a "max so far" stack where maxStack[i] = max(stack[0..i]). For popMax, pop from both until top equals current max, save intermediate into a buffer, then push them back (reusing push which also updates maxStack).\n\n**Complexity:** push/pop/top/peekMax O(1); popMax O(n).',
    examples: 'Operations: push(5), push(1), push(5), top() -> 5, popMax() -> 5, top() -> 1, peekMax() -> 5, pop() -> 1, top() -> 5',
    starterCode: null
  },

  {
    id: 'serialize-deserialize-bst',
    title: 'Serialize and Deserialize BST',
    category: 'Trees',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/serialize-and-deserialize-bst/',
    tags: ['Tree', 'DFS', 'BST', 'Design'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    description: 'Design an algorithm to serialize and deserialize a binary search tree. The encoded string should be as compact as possible. Unlike a generic binary tree, BST structure can be reconstructed from preorder alone using the BST property (no need to emit null markers).\n\n**Approach:** serialize via preorder, emit values separated by commas. Deserialize by reading preorder values and recursively constructing subtrees using lower/upper value bounds — a value belongs to the left subtree iff it is < current node\'s value (and within bounds).\n\n**Complexity:** Time O(n), Space O(n).',
    examples: 'Input: root = [2,1,3]\nSerialize -> "2,1,3"\nDeserialize("2,1,3") -> rebuilds [2,1,3]\n\nRound-trip: serialize(deserialize(serialize(root))) == serialize(root)',
    starterCode: null
  },
  {
    id: 'word-ladder-ii',
    title: 'Word Ladder II',
    category: 'Graphs',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/word-ladder-ii/',
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    tags: ['BFS', 'Graphs', 'Strings', 'Backtracking'],
    description: 'Given two words `beginWord` and `endWord`, and a dictionary `wordList`, return **all the shortest transformation sequences** from `beginWord` to `endWord`. Each transformation changes exactly one letter, and every intermediate word must be in `wordList`.\n\nReturn an empty list if no such sequence exists. Sort the outer list lexicographically (by concatenated path) for deterministic output.\n\n**Approach:** BFS layer-by-layer to find shortest distance, track all predecessors; then DFS from end to start to reconstruct paths.\n\n**Complexity:** Time O(N * L * 26) for BFS plus exponential in path count.',
    examples: 'Input: beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]\nOutput: [[hit, hot, dot, dog, cog], [hit, hot, lot, log, cog]]\n\nInput: beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]\nOutput: []',
    starterCode: null
  },

  {
    id: 'shortest-bridge',
    title: 'Shortest Bridge',
    category: 'Graphs',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/shortest-bridge/',
    companies: ['Google', 'Amazon', 'Meta'],
    tags: ['BFS', 'DFS', 'Matrix', 'Graphs'],
    description: 'You are given an `n x n` binary matrix `grid` where `1` represents land and `0` represents water. There are **exactly two islands** (connected groups of `1`s, 4-directionally). You may flip `0`s to `1`s to connect the islands into one.\n\nReturn the **minimum number of `0`s** you must flip to connect the two islands.\n\n**Approach:** DFS to mark cells of island 1 and collect its frontier; multi-source BFS from that frontier outward, counting layers until hitting island 2.\n\n**Complexity:** Time O(n²), Space O(n²).',
    examples: 'Input: grid = [[0,1],[1,0]]\nOutput: 1\n\nInput: grid = [[0,1,0],[0,0,0],[0,0,1]]\nOutput: 2',
    starterCode: null
  },

  {
    id: 'longest-substring-at-least-k-repeating',
    title: 'Longest Substring with At Least K Repeating Characters',
    category: 'Sliding Window',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/longest-substring-with-at-least-k-repeating-characters/',
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    tags: ['Sliding Window', 'Divide & Conquer', 'Strings', 'Hash Maps'],
    description: 'Given a string `s` and an integer `k`, return the length of the **longest substring** in which every character appears at least `k` times.\n\n**Approach 1 (Divide & Conquer):** If any character appears fewer than `k` times in the whole string, the answer cannot include that character — split on it and recurse.\n\n**Approach 2 (Sliding Window):** Try fixed numbers of unique chars (1..26); for each, sliding window keeping exactly that many unique chars while tracking how many meet the `>= k` requirement.\n\n**Complexity:** Time O(26 * n) for sliding window, O(n * 26) for divide & conquer.',
    examples: 'Input: s = "aaabb", k = 3\nOutput: 3  ("aaa")\n\nInput: s = "ababbc", k = 2\nOutput: 5  ("ababb")',
    starterCode: null
  },

  {
    id: 'arithmetic-slices-ii',
    title: 'Arithmetic Slices II - Subsequence',
    category: 'Dynamic Programming',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/arithmetic-slices-ii-subsequence/',
    companies: ['Google', 'Amazon', 'Meta'],
    tags: ['Dynamic Programming', 'Hash Maps', 'Arrays'],
    description: 'Given an integer array `nums`, return the number of all **arithmetic subsequences** of `nums` with length at least 3.\n\nA subsequence is arithmetic if the difference between every pair of consecutive elements is the same. Subsequences need not be contiguous.\n\n**Approach:** `dp[i]` = map from common difference `d` to the number of subsequences ending at index `i` with difference `d` (including length-2 "weak" ones). When extending with a new pair `(j, i)`, add `dp[j].get(d)` to the answer (those represent valid length >= 3 extensions).\n\n**Complexity:** Time O(n²), Space O(n²).',
    examples: 'Input: nums = [2,4,6,8,10]\nOutput: 7\n\nInput: nums = [7,7,7,7,7]\nOutput: 16',
    starterCode: null
  },

  {
    id: 'random-pick-with-weight',
    title: 'Random Pick with Weight',
    category: 'Sorting & Searching',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/random-pick-with-weight/',
    companies: ['Google', 'Amazon', 'Meta', 'Apple'],
    tags: ['Binary Search', 'Prefix Sum', 'Randomized'],
    description: 'You are given a 0-indexed array `w` where `w[i]` is the weight of index `i`. Implement `pickIndex()` which returns a random index in `[0, w.length)` with probability proportional to `w[i]`.\n\n**Approach:** Build prefix sums `prefix[i] = w[0] + ... + w[i]`. Generate a random integer `target` in `[1, prefix[n-1]]`, then binary-search for the smallest `i` where `prefix[i] >= target`.\n\n**Complexity:** Constructor O(n); `pickIndex` O(log n).',
    examples: 'Input: Solution([1,3]); pickIndex() many times\nOutput: index 0 ~25%, index 1 ~75%',
    starterCode: null
  },

  {
    id: 'random-pick-index',
    title: 'Random Pick Index',
    category: 'Hash Maps',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/random-pick-index/',
    companies: ['Google', 'Meta', 'Amazon'],
    tags: ['Hash Maps', 'Reservoir Sampling', 'Randomized'],
    description: 'Given an integer array `nums` with possible duplicates, implement `pick(target)` which returns a random index `i` such that `nums[i] == target`, each qualifying index chosen with equal probability.\n\n**Approach A (hash map):** preprocess a map from value to list of indices; `pick(target)` picks uniformly from that list.\n\n**Approach B (reservoir sampling):** single pass — keep index `i` (matching target) with probability `1/count_so_far`. Uses O(1) extra space.\n\n**Complexity:** A: O(n) constructor, O(1) pick. B: O(1) constructor, O(n) pick.',
    examples: 'Input: nums = [1,2,3,3,3]; pick(3) many times\nOutput: indices 2, 3, 4 each ~33%',
    starterCode: null
  },

  {
    id: 'stream-of-characters',
    title: 'Stream of Characters',
    category: 'Backtracking',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/stream-of-characters/',
    companies: ['Google', 'Amazon', 'Meta'],
    tags: ['Trie', 'Strings', 'Design'],
    description: 'Design a `StreamChecker` that accepts characters one at a time. `query(c)` returns `true` if any suffix of the characters seen so far spells a word in the given dictionary.\n\n**Approach:** Build a Trie of the **reversed** dictionary words. Maintain a buffer/list of queried chars (most recent last). On each query, walk the trie from the most recent char backwards; return true if any word-terminal node is visited during the walk.\n\n**Complexity:** Constructor O(sum of word lengths). `query` O(L) where `L` = longest word.',
    examples: 'Input: StreamChecker(["cd","f","kl"])\nquery(\'a\') -> false\nquery(\'b\') -> false\nquery(\'c\') -> false\nquery(\'d\') -> true (suffix "cd")\nquery(\'f\') -> true (suffix "f")',
    starterCode: null
  },

  {
    id: 'sudoku-solver',
    title: 'Sudoku Solver',
    category: 'Backtracking',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/sudoku-solver/',
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    tags: ['Backtracking', 'Matrix', 'Hash Set'],
    description: 'Write a program to solve a Sudoku puzzle by filling the empty cells (denoted by `.`) in a `9 x 9` grid. The completed board must satisfy all Sudoku constraints: each row, column, and 3x3 sub-box contains the digits 1-9 exactly once.\n\nModify the board **in place**. The puzzle is guaranteed to have a unique solution.\n\n**Approach:** Backtracking — for each empty cell, try digits 1-9 that don\'t violate row/col/box constraints; recurse; undo on failure. Use bitmasks or boolean arrays to track used digits per row, col, and box for O(1) validity checks.\n\n**Complexity:** Exponential worst-case; very fast in practice due to pruning.',
    examples: 'Input: 9x9 grid with some filled cells\nOutput: complete valid Sudoku solution in place',
    starterCode: null
  },

  {
    id: 'shortest-path-alternating-colors',
    title: 'Shortest Path with Alternating Colors',
    category: 'Graphs',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/shortest-path-with-alternating-colors/',
    companies: ['Google', 'Amazon', 'Meta'],
    tags: ['BFS', 'Graphs', 'Directed Graph'],
    description: 'You are given a directed graph with `n` nodes labeled `0..n-1`. Each edge is colored **red** or **blue**. `redEdges` and `blueEdges` list the directed edges of each color.\n\nReturn an array `answer[i]` = length of the **shortest path** from node `0` to node `i` such that edge colors **alternate**. If no such path exists, `answer[i] = -1`. `answer[0] = 0`.\n\n**Approach:** BFS with state `(node, last_color)`. Maintain a `visited[node][color]` array. Two adjacency lists, one per color.\n\n**Complexity:** Time O(n + E), Space O(n).',
    examples: 'Input: n = 3, redEdges = [[0,1]], blueEdges = [[1,2]]\nOutput: [0, 1, 2]\n\nInput: n = 3, redEdges = [[0,1]], blueEdges = [[2,1]]\nOutput: [0, 1, -1]',
    starterCode: null
  },

  {
    id: 'bus-routes',
    title: 'Bus Routes',
    category: 'Graphs',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/bus-routes/',
    companies: ['Google', 'Amazon', 'Meta', 'Uber'],
    tags: ['BFS', 'Graphs', 'Hash Maps'],
    description: 'You are given `routes` where `routes[i]` is a cyclic list of bus stops that bus `i` visits. You can ride any bus an unlimited number of times, but each bus runs only on its own route. You start at stop `source` and want to reach stop `target`.\n\nReturn the **minimum number of buses** you must take, or `-1` if it is impossible.\n\n**Approach:** BFS where nodes are **buses** (not stops). Build a `stop -> buses serving it` map. Start by enqueueing every bus that serves `source`. Expand by jumping to every other bus that shares a stop. Return level when any bus serves `target`.\n\n**Complexity:** Time O(N + sum of route sizes), Space O(N + stops).',
    examples: 'Input: routes = [[1,2,7],[3,6,7]], source = 1, target = 6\nOutput: 2\n\nInput: routes = [[7,12],[4,5,15],[6],[15,19],[9,12,13]], source = 15, target = 12\nOutput: -1',
    starterCode: null
  },

  {
    id: 'zigzag-conversion',
    title: 'Zigzag Conversion',
    category: 'Strings',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/zigzag-conversion/',
    tags: ['String', 'Simulation'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    description: "Write the string `s` in a zigzag pattern on a given number of rows like this (numRows = 3):\n\n```\nP   A   H   N\nA P L S I I G\nY   I   R\n```\n\nThen read line by line to produce: `PAHNAPLSIIGYIR`.\n\nGiven a string `s` and an integer `numRows`, perform this zigzag conversion and return the resulting string. If `numRows == 1` or `numRows >= s.length()`, the result is just `s`.\n\n**Approach:** simulate rows with `StringBuilder[]` and a direction flag that flips at the top and bottom rows.",
    examples: "Input: s = \"PAYPALISHIRING\", numRows = 3\nOutput: \"PAHNAPLSIIGYIR\"\n\nInput: s = \"PAYPALISHIRING\", numRows = 4\nOutput: \"PINALSIGYAHRPI\"\n\nInput: s = \"A\", numRows = 1\nOutput: \"A\"",
    starterCode: null
  },
  {
    id: 'valid-parenthesis-string',
    title: 'Valid Parenthesis String',
    category: 'Stacks & Queues',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/valid-parenthesis-string/',
    tags: ['String', 'Stack', 'Greedy', 'Dynamic Programming'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft', 'Bloomberg'],
    description: "Given a string `s` containing only `(`, `)`, and `*`, determine if it is valid. The rules:\n\n1. Any left parenthesis must have a matching right parenthesis.\n2. Any right parenthesis must have a matching left parenthesis.\n3. Left parentheses must come before the matching right parentheses.\n4. The `*` character can be treated as a single left parenthesis, a single right parenthesis, or an empty string.\n5. The empty string is valid.\n\n**Greedy range approach:** track `lo` and `hi` representing the min and max possible number of unmatched open parens. On `(`, both +1. On `)`, both -1. On `*`, `lo--`, `hi++`. If `hi < 0`, return false. Clamp `lo` at 0. At end, return `lo == 0`.",
    examples: "Input: s = \"()\"\nOutput: true\n\nInput: s = \"(*)\"\nOutput: true\n\nInput: s = \"(*))\"\nOutput: true",
    starterCode: null
  },
  {
    id: 'string-compression',
    title: 'String Compression',
    category: 'Strings',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/string-compression/',
    tags: ['String', 'Two Pointers'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft', 'Apple'],
    description: "Given an array of characters `chars`, compress it in-place. The length after compression must always be smaller than or equal to the original length, and you must write using only **O(1)** extra space.\n\nFor each group of consecutive repeating characters, if the group length is 1, append only the character. Otherwise, append the character followed by the group length as individual digit characters. Return the new length.\n\n**Examples of group encoding:**\n- `aaa` becomes `a3`\n- `aabbccc` becomes `a2b2c3`\n- `abbbbbbbbbbbbb` (13 b's) becomes `ab13`\n\n**Approach:** use a `write` index and a `read` index. Walk `read`, count run length, then write char plus digits of count if count > 1.",
    examples: "Input: chars = ['a','a','b','b','c','c','c']\nOutput: 6, chars = ['a','2','b','2','c','3']\n\nInput: chars = ['a']\nOutput: 1, chars = ['a']\n\nInput: chars = ['a','b','b','b','b','b','b','b','b','b','b','b','b']\nOutput: 4, chars = ['a','b','1','2']",
    starterCode: null
  },
  {
    id: 'next-greater-node-linked-list',
    title: 'Next Greater Node in Linked List',
    category: 'Linked Lists',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/next-greater-node-in-linked-list/',
    tags: ['Linked List', 'Stack', 'Monotonic Stack', 'Array'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    description: "You are given the head of a singly linked list of integers. For each node in the list, find the value of the **next strictly greater node**, i.e. the value of the next node whose value is strictly larger.\n\nReturn an integer array `answer` such that `answer[i]` is the value of the next greater node for the i-th node (1-indexed in the problem statement, 0-indexed in the array). If the i-th node has no next greater node, set `answer[i] = 0`.\n\n**Approach:** convert to an array (or walk once) and use a monotonic decreasing stack of indices. When a node beats the top of the stack, pop and fill its answer.",
    examples: "Input: head = [2,1,5]\nOutput: [5,5,0]\n\nInput: head = [2,7,4,3,5]\nOutput: [7,0,5,5,0]\n\nInput: head = []\nOutput: []",
    starterCode: null
  },
  {
    id: 'add-two-numbers-ii',
    title: 'Add Two Numbers II',
    category: 'Linked Lists',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/add-two-numbers-ii/',
    tags: ['Linked List', 'Stack', 'Math'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    description: "You are given two non-empty linked lists representing two non-negative integers. The most significant digit comes first and each node contains a single digit. Add the two numbers and return the sum as a linked list, again with the most significant digit first.\n\nYou may assume the two numbers do not contain any leading zero, except the number 0 itself.\n\n**Approach without reversal:** push digits of both lists onto two stacks, then pop while maintaining a carry, prepending new nodes to the result. This naturally handles different lengths.",
    examples: "Input: l1 = [7,2,4,3], l2 = [5,6,4]\nOutput: [7,8,0,7]\n\nInput: l1 = [2,4,3], l2 = [5,6,4]\nOutput: [8,0,7]\n\nInput: l1 = [0], l2 = [0]\nOutput: [0]",
    starterCode: null
  },
  {
    id: 'split-linked-list-parts',
    title: 'Split Linked List in Parts',
    category: 'Linked Lists',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/split-linked-list-in-parts/',
    tags: ['Linked List'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    description: "Given the head of a singly linked list and an integer `k`, split the list into `k` consecutive parts. The length of each part should be as equal as possible: no two parts should have a size differing by more than one. This may lead to some parts being null.\n\nThe parts should appear in the **same order** as in the input list, and parts occurring earlier should always have a size greater than or equal to parts occurring later. Return an array of the `k` parts.\n\n**Approach:** compute length `n`. Each part has base size `n / k` and the first `n % k` parts get one extra node. Walk and cut.",
    examples: "Input: head = [1,2,3], k = 5\nOutput: [[1],[2],[3],[],[]]\n\nInput: head = [1,2,3,4,5,6,7,8,9,10], k = 3\nOutput: [[1,2,3,4],[5,6,7],[8,9,10]]",
    starterCode: null
  },
  {
    id: 'design-linked-list',
    title: 'Design Linked List',
    category: 'Linked Lists',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/design-linked-list/',
    tags: ['Linked List', 'Design'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft', 'Apple'],
    description: "Design your implementation of a singly (or doubly) linked list. Your `MyLinkedList` class should support the following operations:\n\n- `get(index)` — get the value of the `index`-th node (0-indexed). Return -1 if index is invalid.\n- `addAtHead(val)` — add a node of value `val` before the first element. After insertion, the new node becomes the first.\n- `addAtTail(val)` — append a node of value `val` to the end.\n- `addAtIndex(index, val)` — add a node of value `val` before the `index`-th node. If `index == length`, append. If `index > length`, do nothing.\n- `deleteAtIndex(index)` — delete the `index`-th node if the index is valid.\n\nAll operations should be correct; a doubly linked list with a size counter makes each call straightforward.",
    examples: "MyLinkedList l = new MyLinkedList();\nl.addAtHead(1);\nl.addAtTail(3);\nl.addAtIndex(1, 2);   // 1 -> 2 -> 3\nl.get(1);             // 2\nl.deleteAtIndex(1);   // 1 -> 3\nl.get(1);             // 3",
    starterCode: null
  },
  {
    id: 'hand-of-straights',
    title: 'Hand of Straights',
    category: 'Hash Maps',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/hand-of-straights/',
    tags: ['Hash Table', 'Greedy', 'Sorting'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    description: "Alice has a hand of cards, given as an integer array `hand`. She wants to rearrange the cards into groups such that each group is of size `groupSize` and consists of `groupSize` consecutive cards.\n\nReturn `true` if she can rearrange the cards this way, otherwise `false`.\n\n**Greedy approach:** use a `TreeMap<Integer, Integer>` (or sort + HashMap) to get the smallest remaining card `x`. Remove one copy each of `x, x+1, ..., x+groupSize-1`. If any count goes negative, fail. Repeat until the map is empty.\n\n**Note:** `hand.length` must be divisible by `groupSize`; otherwise return false.",
    examples: "Input: hand = [1,2,3,6,2,3,4,7,8], groupSize = 3\nOutput: true\nExplanation: [1,2,3], [2,3,4], [6,7,8]\n\nInput: hand = [1,2,3,4,5], groupSize = 4\nOutput: false",
    starterCode: null
  },
  {
    id: 'min-arrows-balloons',
    title: 'Minimum Number of Arrows to Burst Balloons',
    category: 'Intervals',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/',
    tags: ['Greedy', 'Sorting', 'Array'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    description: "There are some spherical balloons taped onto a flat wall. The balloons are represented as a 2D integer array `points` where `points[i] = [xStart, xEnd]`. An arrow can be shot up directly vertically from different points along the x-axis. A balloon with `xStart <= x <= xEnd` will be burst.\n\nReturn the **minimum** number of arrows that must be shot to burst all balloons.\n\n**Greedy approach:** sort intervals by `xEnd`. Shoot an arrow at the `xEnd` of the first interval; it bursts every overlapping interval. Skip all intervals whose `xStart` is within the current arrow's reach (`<= arrow`). When one is not, shoot a new arrow at that interval's `xEnd`.\n\n**Note:** touching intervals count as overlapping in LC 452.",
    examples: "Input: points = [[10,16],[2,8],[1,6],[7,12]]\nOutput: 2\nExplanation: one arrow at x = 6 bursts [2,8] and [1,6]; another at x = 10 or 12 bursts [10,16] and [7,12].\n\nInput: points = [[1,2],[3,4],[5,6],[7,8]]\nOutput: 4",
    starterCode: null
  },
  {
    id: 'find-k-closest-elements',
    title: 'Find K Closest Elements',
    category: 'Two Pointers',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/find-k-closest-elements/',
    tags: ['Array', 'Two Pointers', 'Binary Search', 'Sliding Window'],
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft'],
    description: "Given a **sorted** integer array `arr`, two integers `k` and `x`, return the `k` closest integers to `x` in the array. The result should also be sorted in ascending order.\n\nAn integer `a` is closer to `x` than an integer `b` if:\n- `|a - x| < |b - x|`, or\n- `|a - x| == |b - x|` and `a < b`.\n\n**Two-pointer approach:** keep `lo = 0, hi = arr.length - 1`. While `hi - lo + 1 > k`, discard the farther endpoint (preferring the smaller on ties, so shrink from the right on ties). Return `arr[lo..hi]`.\n\n**Binary search approach:** find the left edge `l` in `[0, n - k]` such that `x - arr[l] <= arr[l + k] - x`.",
    examples: "Input: arr = [1,2,3,4,5], k = 4, x = 3\nOutput: [1,2,3,4]\n\nInput: arr = [1,2,3,4,5], k = 4, x = -1\nOutput: [1,2,3,4]\n\nInput: arr = [1,2,3,4,5], k = 4, x = 7\nOutput: [2,3,4,5]",
    starterCode: null
  },
// ─── Batch 12 GM — DSA Problems Scratch ───

  {
    id: 'average-of-levels',
    title: 'Average of Levels in Binary Tree',
    category: 'Trees',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/average-of-levels-in-binary-tree/',
    tags: ['Tree', 'BFS', 'DFS'],
    companies: ['Google', 'Amazon', 'Facebook'],
    description: "Given the root of a binary tree, return the average value of the nodes on each level as a List<Double>.\n\nUse BFS: for each level, sum the node values and divide by the count. Use double to avoid integer overflow when summing Integer.MAX_VALUE nodes.\n\nComplexity: Time O(n), Space O(w) where w is the max width.",
    examples: "Input: root = [3,9,20,null,null,15,7]\nOutput: [3.0, 14.5, 11.0]\n\nLevel 0: 3 -> 3.0\nLevel 1: (9+20)/2 -> 14.5\nLevel 2: (15+7)/2 -> 11.0",
    starterCode: null
  },

  {
    id: 'cousins-in-binary-tree',
    title: 'Cousins in Binary Tree',
    category: 'Trees',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/cousins-in-binary-tree/',
    tags: ['Tree', 'BFS', 'DFS'],
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: "Given the root of a binary tree with unique values and two integers x and y, return true if the nodes with values x and y are cousins, false otherwise.\n\nTwo nodes are cousins if they are at the same depth but have different parents.\n\nUse BFS and track each node's parent and depth, or DFS with parent and depth tracking.\n\nComplexity: Time O(n), Space O(n).",
    examples: "Input: root = [1,2,3,4], x = 4, y = 3\nOutput: false (4 is at depth 2, 3 is at depth 1)\n\nInput: root = [1,2,3,null,4,null,5], x = 5, y = 4\nOutput: true (both at depth 2 with different parents)",
    starterCode: null
  },

  {
    id: 'deepest-leaves-sum',
    title: 'Deepest Leaves Sum',
    category: 'Trees',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/deepest-leaves-sum/',
    tags: ['Tree', 'BFS', 'DFS'],
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: "Given the root of a binary tree, return the sum of values of its deepest leaves.\n\nBFS is a natural fit: when you finish processing the last level, its sum is the answer. DFS also works by tracking the maximum depth.\n\nComplexity: Time O(n), Space O(w) for BFS or O(h) for DFS.",
    examples: "Input: root = [1,2,3,4,5,null,6,7,null,null,null,null,8]\nOutput: 15\n\nThe deepest leaves are 7 and 8, their sum is 15.",
    starterCode: null
  },

  {
    id: 'max-area-of-island',
    title: 'Max Area of Island',
    category: 'Graphs',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/max-area-of-island/',
    tags: ['Grid', 'DFS', 'BFS', 'Union Find'],
    companies: ['Google', 'Amazon', 'Facebook', 'Microsoft'],
    description: "Given an m x n binary matrix grid where 1 represents land and 0 represents water, an island is a group of 1s connected 4-directionally (horizontal or vertical). Return the maximum area (count of 1s) of an island in grid. If there are no islands, return 0.\n\nUse DFS or BFS from each unvisited 1-cell and track the connected area. Mark visited cells to avoid re-counting.\n\nComplexity: Time O(m*n), Space O(m*n).",
    examples: "Input: grid = [[0,0,1,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,1,1,0,0,0],[0,1,1,0,1,0,0,0,0,0,0,0,0],[0,1,0,0,1,1,0,0,1,0,1,0,0],[0,1,0,0,1,1,0,0,1,1,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,1,1,1,0,0,0],[0,0,0,0,0,0,0,1,1,0,0,0,0]]\nOutput: 6",
    starterCode: null
  },

  {
    id: 'spiral-matrix-ii',
    title: 'Spiral Matrix II',
    category: 'Matrix',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/spiral-matrix-ii/',
    tags: ['Array', 'Matrix', 'Simulation'],
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: "Given a positive integer n, generate an n x n matrix filled with elements from 1 to n^2 in spiral order (clockwise starting from the top-left).\n\nSimulate the spiral by maintaining four boundaries (top, bottom, left, right) and shrinking them as each side is filled.\n\nComplexity: Time O(n^2), Space O(1) excluding output.",
    examples: "Input: n = 3\nOutput: [[1,2,3],[8,9,4],[7,6,5]]\n\nInput: n = 1\nOutput: [[1]]",
    starterCode: null
  },

  {
    id: 'find-peak-element',
    title: 'Find Peak Element',
    category: 'Sorting & Searching',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/find-peak-element/',
    tags: ['Array', 'Binary Search'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Apple'],
    description: "A peak element is an element strictly greater than its neighbors. Given a 0-indexed integer array nums, find a peak element, and return its index. If the array contains multiple peaks, return the index to any of them.\n\nYou may imagine that nums[-1] = nums[n] = -infinity. Your algorithm should run in O(log n) time (binary search: always move toward the rising slope).\n\nComplexity: Time O(log n), Space O(1).",
    examples: "Input: nums = [1,2,3,1]\nOutput: 2 (value 3 is greater than neighbors 2 and 1)\n\nInput: nums = [1,2,1,3,5,6,4]\nOutput: 5 (value 6 is a peak); index 1 (value 2) would also be valid.",
    starterCode: null
  },

  {
    id: 'max-profit-job-scheduling',
    title: 'Maximum Profit in Job Scheduling',
    category: 'Dynamic Programming',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/maximum-profit-in-job-scheduling/',
    tags: ['Array', 'Binary Search', 'Dynamic Programming', 'Sorting'],
    companies: ['Google', 'Amazon', 'Facebook', 'Microsoft'],
    description: "We have n jobs, where every job is scheduled to be done from startTime[i] to endTime[i], obtaining a profit of profit[i]. Given three arrays startTime, endTime, and profit, return the maximum profit you can take such that there are no two jobs in the subset with overlapping time ranges.\n\nIf you choose a job that ends at time X you will be able to start another job that starts at time X.\n\nApproach: sort by endTime; for each job i, dp[i] = max(dp[i-1], profit[i] + dp[j]) where j is the last job that ends at or before startTime[i] (binary search).\n\nComplexity: Time O(n log n), Space O(n).",
    examples: "Input: startTime=[1,2,3,3], endTime=[3,4,5,6], profit=[50,10,40,70]\nOutput: 120 (subset {1st, 4th} gives 50+70=120)\n\nInput: startTime=[1,2,3,4,6], endTime=[3,5,10,6,9], profit=[20,20,100,70,60]\nOutput: 150",
    starterCode: null
  },

  {
    id: 'dungeon-game',
    title: 'Dungeon Game',
    category: 'Dynamic Programming',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/dungeon-game/',
    tags: ['Array', 'Dynamic Programming', 'Matrix'],
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: "The demons have captured the princess and imprisoned her in the bottom-right corner of a dungeon. The dungeon consists of m x n rooms. Our valiant knight starts at the top-left room and must fight through to rescue her. The knight has an integer health value; if it drops to 0 or below at any point, he dies.\n\nEach room contains an integer: negative numbers are demons (damage), positive numbers are orbs (heal), zero is empty. The knight can only move right or down. Return the knight's minimum initial health so that he can rescue the princess.\n\nApproach: DP from the bottom-right to top-left. dp[i][j] = max(1, min(dp[i+1][j], dp[i][j+1]) - grid[i][j]).\n\nComplexity: Time O(m*n), Space O(m*n) or O(n).",
    examples: "Input: dungeon = [[-2,-3,3],[-5,-10,1],[10,30,-5]]\nOutput: 7 (start with 7 HP to survive any path)",
    starterCode: null
  },

  {
    id: 'encode-decode-tinyurl',
    title: 'Encode and Decode TinyURL',
    category: 'Hash Maps',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/encode-and-decode-tinyurl/',
    tags: ['Hash Table', 'String', 'Design', 'Hash Function'],
    companies: ['Google', 'Amazon', 'Facebook', 'Uber'],
    description: "TinyURL is a URL shortening service. Design a class Codec with two methods:\n  - encode(longUrl): returns a short URL.\n  - decode(shortUrl): returns the original long URL.\n\nThe encode/decode algorithm is up to you. You only need to guarantee that a URL can be encoded to a tiny URL and the tiny URL can be decoded back to the original URL.\n\nCommon approach: maintain a HashMap<shortCode, longUrl> and a counter (or random alphanumeric) to generate new short codes.\n\nComplexity: Time O(1) per call, Space O(n) for n stored URLs.",
    examples: "Input: longUrl = \"https://leetcode.com/problems/design-tinyurl\"\nOutput (example short): \"http://tinyurl.com/4e9iAk\"\n\nRound-trip: decode(encode(longUrl)) == longUrl.",
    starterCode: null
  },

  {
    id: 'design-browser-history',
    title: 'Design Browser History',
    category: 'Stacks & Queues',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/design-browser-history/',
    tags: ['Array', 'Stack', 'Design', 'Doubly-Linked List'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Bloomberg'],
    description: "You have a browser of one tab where you start at the homepage and can visit another url, get back in the history number of steps, or move forward number of steps.\n\nImplement BrowserHistory:\n  - BrowserHistory(homepage): initializes with the homepage as the current page.\n  - visit(url): visits url from the current page. Clears the forward history.\n  - back(steps): move steps back. If you can only go k < steps back, then return that page after k steps. Return the current url.\n  - forward(steps): move steps forward. If you can only go k < steps forward, then return that page after k steps. Return the current url.\n\nUse a list + current index (or two stacks).\n\nComplexity: Time O(1) for visit, O(steps) worst case for back/forward (or O(1) with array+index).",
    examples: "Input:\nBrowserHistory(\"leetcode.com\")\nvisit(\"google.com\"); visit(\"facebook.com\"); visit(\"youtube.com\")\nback(1) -> \"facebook.com\"\nback(1) -> \"google.com\"\nforward(1) -> \"facebook.com\"\nvisit(\"linkedin.com\")\nforward(2) -> \"linkedin.com\"\nback(2) -> \"google.com\"\nback(7) -> \"leetcode.com\"",
    starterCode: null
  },

  {
    id: "median-two-sorted-arrays",
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    category: "Sorting & Searching",
    leetcode: "https://leetcode.com/problems/median-of-two-sorted-arrays/",
    companies: ["Google", "Amazon", "Microsoft", "Apple", "Meta"],
    description: "Given two sorted arrays nums1 and nums2 of sizes m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log(min(m,n))).",
    examples: "Input: nums1 = [1,3], nums2 = [2]\nOutput: 2.00000\n\nInput: nums1 = [1,2], nums2 = [3,4]\nOutput: 2.50000",
    starterCode: null,
    solution: `import java.util.*;

public class Solution {
    public static double findMedianSortedArrays(int[] nums1, int[] nums2) {
        if (nums1.length > nums2.length) {
            int[] tmp = nums1; nums1 = nums2; nums2 = tmp;
        }
        int m = nums1.length, n = nums2.length;
        int lo = 0, hi = m;
        int half = (m + n + 1) / 2;
        while (lo <= hi) {
            int i = (lo + hi) / 2;
            int j = half - i;
            int left1 = (i == 0) ? Integer.MIN_VALUE : nums1[i - 1];
            int right1 = (i == m) ? Integer.MAX_VALUE : nums1[i];
            int left2 = (j == 0) ? Integer.MIN_VALUE : nums2[j - 1];
            int right2 = (j == n) ? Integer.MAX_VALUE : nums2[j];
            if (left1 <= right2 && left2 <= right1) {
                if (((m + n) & 1) == 1) return Math.max(left1, left2);
                return (Math.max(left1, left2) + Math.min(right1, right2)) / 2.0;
            } else if (left1 > right2) {
                hi = i - 1;
            } else {
                lo = i + 1;
            }
        }
        return 0.0;
    }

    public static void main(String[] args) {
        int[] a = {1, 3};
        int[] b = {2};
        System.out.println(String.format(java.util.Locale.US, "%.5f", findMedianSortedArrays(a, b)));
    }
}
`,
    tests: [
      { name: "LC example 1", input: "", expectedOutput: "2.00000", runnerCode: `int[] a = {1, 3}; int[] b = {2}; System.out.println(String.format(java.util.Locale.US, "%.5f", Solution.findMedianSortedArrays(a, b)));` },
      { name: "LC example 2", input: "", expectedOutput: "2.50000", runnerCode: `int[] a = {1, 2}; int[] b = {3, 4}; System.out.println(String.format(java.util.Locale.US, "%.5f", Solution.findMedianSortedArrays(a, b)));` },
      { name: "first empty", input: "", expectedOutput: "1.00000", runnerCode: `int[] a = {}; int[] b = {1}; System.out.println(String.format(java.util.Locale.US, "%.5f", Solution.findMedianSortedArrays(a, b)));` },
      { name: "second empty", input: "", expectedOutput: "2.00000", runnerCode: `int[] a = {2}; int[] b = {}; System.out.println(String.format(java.util.Locale.US, "%.5f", Solution.findMedianSortedArrays(a, b)));` },
      { name: "first empty two", input: "", expectedOutput: "2.50000", runnerCode: `int[] a = {}; int[] b = {2, 3}; System.out.println(String.format(java.util.Locale.US, "%.5f", Solution.findMedianSortedArrays(a, b)));` },
      { name: "disjoint small/large", input: "", expectedOutput: "3.50000", runnerCode: `int[] a = {1, 2, 3}; int[] b = {4, 5, 6}; System.out.println(String.format(java.util.Locale.US, "%.5f", Solution.findMedianSortedArrays(a, b)));` },
      { name: "interleaved even", input: "", expectedOutput: "4.50000", runnerCode: `int[] a = {1, 3, 5, 7}; int[] b = {2, 4, 6, 8}; System.out.println(String.format(java.util.Locale.US, "%.5f", Solution.findMedianSortedArrays(a, b)));` },
      { name: "all zeros", input: "", expectedOutput: "0.00000", runnerCode: `int[] a = {0, 0}; int[] b = {0, 0}; System.out.println(String.format(java.util.Locale.US, "%.5f", Solution.findMedianSortedArrays(a, b)));` },
      { name: "duplicates", input: "", expectedOutput: "2.00000", runnerCode: `int[] a = {1, 1, 3, 3}; int[] b = {1, 1, 3, 3}; System.out.println(String.format(java.util.Locale.US, "%.5f", Solution.findMedianSortedArrays(a, b)));` },
      { name: "single vs three", input: "", expectedOutput: "2.50000", runnerCode: `int[] a = {1}; int[] b = {2, 3, 4}; System.out.println(String.format(java.util.Locale.US, "%.5f", Solution.findMedianSortedArrays(a, b)));` },
      { name: "five vs one", input: "", expectedOutput: "3.50000", runnerCode: `int[] a = {1, 2, 3, 4, 5}; int[] b = {6}; System.out.println(String.format(java.util.Locale.US, "%.5f", Solution.findMedianSortedArrays(a, b)));` }
    ]
  },
  {
    id: "subarray-sum-equals-k",
    title: "Subarray Sum Equals K",
    difficulty: "Medium",
    category: "Hash Maps",
    leetcode: "https://leetcode.com/problems/subarray-sum-equals-k/",
    companies: ["Google", "Facebook", "Amazon", "Microsoft", "Uber"],
    description: "Given an array of integers nums and an integer k, return the total number of contiguous subarrays whose sum equals to k. Use prefix sums with a hash map to achieve O(n) time.",
    examples: "Input: nums = [1,1,1], k = 2\nOutput: 2\n\nInput: nums = [1,2,3], k = 3\nOutput: 2",
    starterCode: null,
    solution: `import java.util.*;

public class Solution {
    public static int subarraySum(int[] nums, int k) {
        Map<Integer, Integer> counts = new HashMap<>();
        counts.put(0, 1);
        int sum = 0, result = 0;
        for (int num : nums) {
            sum += num;
            result += counts.getOrDefault(sum - k, 0);
            counts.merge(sum, 1, Integer::sum);
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(subarraySum(new int[]{1, 1, 1}, 2));
    }
}
`,
    tests: [
      { name: "LC example 1", input: "", expectedOutput: "2", runnerCode: `System.out.println(Solution.subarraySum(new int[]{1, 1, 1}, 2));` },
      { name: "LC example 2", input: "", expectedOutput: "2", runnerCode: `System.out.println(Solution.subarraySum(new int[]{1, 2, 3}, 3));` },
      { name: "single no match", input: "", expectedOutput: "0", runnerCode: `System.out.println(Solution.subarraySum(new int[]{1}, 0));` },
      { name: "single match", input: "", expectedOutput: "1", runnerCode: `System.out.println(Solution.subarraySum(new int[]{1}, 1));` },
      { name: "empty array", input: "", expectedOutput: "0", runnerCode: `System.out.println(Solution.subarraySum(new int[]{}, 0));` },
      { name: "all zeros k=0", input: "", expectedOutput: "6", runnerCode: `System.out.println(Solution.subarraySum(new int[]{0, 0, 0}, 0));` },
      { name: "mixed with zero", input: "", expectedOutput: "3", runnerCode: `System.out.println(Solution.subarraySum(new int[]{1, -1, 0}, 0));` },
      { name: "negative sums", input: "", expectedOutput: "1", runnerCode: `System.out.println(Solution.subarraySum(new int[]{-1, -1, 1}, 0));` },
      { name: "longer array", input: "", expectedOutput: "4", runnerCode: `System.out.println(Solution.subarraySum(new int[]{3, 4, 7, 2, -3, 1, 4, 2}, 7));` },
      { name: "overlapping pairs", input: "", expectedOutput: "4", runnerCode: `System.out.println(Solution.subarraySum(new int[]{1, 2, 1, 2, 1}, 3));` },
      { name: "all twos", input: "", expectedOutput: "3", runnerCode: `System.out.println(Solution.subarraySum(new int[]{2, 2, 2, 2}, 4));` }
    ]
  },
  {
    id: "find-duplicate-number",
    title: "Find the Duplicate Number",
    difficulty: "Medium",
    category: "Two Pointers",
    leetcode: "https://leetcode.com/problems/find-the-duplicate-number/",
    companies: ["Google", "Amazon", "Microsoft", "Apple", "Bloomberg"],
    description: "Given an array of integers nums containing n+1 integers where each integer is in the range [1,n] inclusive. There is exactly one repeated number in nums. Return this repeated number. Use Floyd's Tortoise and Hare (cycle detection) for O(n) time and O(1) space without modifying the array.",
    examples: "Input: nums = [1,3,4,2,2]\nOutput: 2\n\nInput: nums = [3,1,3,4,2]\nOutput: 3",
    starterCode: null,
    solution: `import java.util.*;

public class Solution {
    public static int findDuplicate(int[] nums) {
        int slow = nums[0];
        int fast = nums[0];
        do {
            slow = nums[slow];
            fast = nums[nums[fast]];
        } while (slow != fast);
        slow = nums[0];
        while (slow != fast) {
            slow = nums[slow];
            fast = nums[fast];
        }
        return slow;
    }

    public static void main(String[] args) {
        System.out.println(findDuplicate(new int[]{1, 3, 4, 2, 2}));
    }
}
`,
    tests: [
      { name: "LC example 1", input: "", expectedOutput: "2", runnerCode: `System.out.println(Solution.findDuplicate(new int[]{1, 3, 4, 2, 2}));` },
      { name: "LC example 2", input: "", expectedOutput: "3", runnerCode: `System.out.println(Solution.findDuplicate(new int[]{3, 1, 3, 4, 2}));` },
      { name: "smallest case", input: "", expectedOutput: "1", runnerCode: `System.out.println(Solution.findDuplicate(new int[]{1, 1}));` },
      { name: "three elements dup 1", input: "", expectedOutput: "1", runnerCode: `System.out.println(Solution.findDuplicate(new int[]{1, 1, 2}));` },
      { name: "three elements dup 2", input: "", expectedOutput: "2", runnerCode: `System.out.println(Solution.findDuplicate(new int[]{1, 2, 2}));` },
      { name: "all same", input: "", expectedOutput: "2", runnerCode: `System.out.println(Solution.findDuplicate(new int[]{2, 2, 2, 2, 2}));` },
      { name: "dup at ends", input: "", expectedOutput: "1", runnerCode: `System.out.println(Solution.findDuplicate(new int[]{1, 2, 3, 4, 5, 6, 7, 8, 9, 1}));` },
      { name: "triple dup", input: "", expectedOutput: "9", runnerCode: `System.out.println(Solution.findDuplicate(new int[]{2, 5, 9, 6, 9, 3, 8, 9, 7, 1}));` },
      { name: "consecutive dup", input: "", expectedOutput: "4", runnerCode: `System.out.println(Solution.findDuplicate(new int[]{1, 4, 4, 2, 3}));` },
      { name: "dup far apart", input: "", expectedOutput: "1", runnerCode: `System.out.println(Solution.findDuplicate(new int[]{1, 3, 4, 2, 1}));` }
    ]
  },
  {
    id: "find-min-rotated-sorted-array",
    title: "Find Minimum in Rotated Sorted Array",
    difficulty: "Medium",
    category: "Sorting & Searching",
    leetcode: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/",
    companies: ["Google", "Amazon", "Microsoft", "Facebook", "Apple"],
    description: "Suppose an array of length n sorted in ascending order is rotated between 1 and n times. Given the sorted rotated array nums of unique elements, return the minimum element. You must write an algorithm that runs in O(log n) time.",
    examples: "Input: nums = [3,4,5,1,2]\nOutput: 1\n\nInput: nums = [4,5,6,7,0,1,2]\nOutput: 0",
    starterCode: null,
    solution: `import java.util.*;

public class Solution {
    public static int findMin(int[] nums) {
        int lo = 0, hi = nums.length - 1;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (nums[mid] > nums[hi]) {
                lo = mid + 1;
            } else {
                hi = mid;
            }
        }
        return nums[lo];
    }

    public static void main(String[] args) {
        System.out.println(findMin(new int[]{3, 4, 5, 1, 2}));
    }
}
`,
    tests: [
      { name: "LC example 1", input: "", expectedOutput: "1", runnerCode: `System.out.println(Solution.findMin(new int[]{3, 4, 5, 1, 2}));` },
      { name: "LC example 2", input: "", expectedOutput: "0", runnerCode: `System.out.println(Solution.findMin(new int[]{4, 5, 6, 7, 0, 1, 2}));` },
      { name: "no rotation", input: "", expectedOutput: "11", runnerCode: `System.out.println(Solution.findMin(new int[]{11, 13, 15, 17}));` },
      { name: "single element", input: "", expectedOutput: "1", runnerCode: `System.out.println(Solution.findMin(new int[]{1}));` },
      { name: "two rotated", input: "", expectedOutput: "1", runnerCode: `System.out.println(Solution.findMin(new int[]{2, 1}));` },
      { name: "two sorted", input: "", expectedOutput: "1", runnerCode: `System.out.println(Solution.findMin(new int[]{1, 2}));` },
      { name: "min at index 1", input: "", expectedOutput: "1", runnerCode: `System.out.println(Solution.findMin(new int[]{5, 1, 2, 3, 4}));` },
      { name: "min in middle-left", input: "", expectedOutput: "1", runnerCode: `System.out.println(Solution.findMin(new int[]{3, 1, 2}));` },
      { name: "min at end", input: "", expectedOutput: "1", runnerCode: `System.out.println(Solution.findMin(new int[]{2, 3, 4, 5, 1}));` },
      { name: "long rotated", input: "", expectedOutput: "0", runnerCode: `System.out.println(Solution.findMin(new int[]{7, 8, 9, 10, 0, 1, 2, 3, 4, 5, 6}));` },
      { name: "sorted long", input: "", expectedOutput: "1", runnerCode: `System.out.println(Solution.findMin(new int[]{1, 2, 3, 4, 5}));` }
    ]
  },
  {
    id: "permutation-in-string",
    title: "Permutation in String",
    difficulty: "Medium",
    category: "Sliding Window",
    leetcode: "https://leetcode.com/problems/permutation-in-string/",
    companies: ["Google", "Microsoft", "Amazon", "Facebook", "Bloomberg"],
    description: "Given two strings s1 and s2, return true if s2 contains a permutation of s1, or false otherwise. In other words, return true if one of s1's permutations is the substring of s2. Use a fixed-size sliding window with character counts for O(n) time.",
    examples: "Input: s1 = \"ab\", s2 = \"eidbaooo\"\nOutput: true\n\nInput: s1 = \"ab\", s2 = \"eidboaoo\"\nOutput: false",
    starterCode: null,
    solution: `import java.util.*;

public class Solution {
    public static boolean checkInclusion(String s1, String s2) {
        int n = s1.length(), m = s2.length();
        if (n == 0) return true;
        if (n > m) return false;
        int[] need = new int[26];
        int[] have = new int[26];
        for (int i = 0; i < n; i++) {
            need[s1.charAt(i) - 'a']++;
            have[s2.charAt(i) - 'a']++;
        }
        if (Arrays.equals(need, have)) return true;
        for (int i = n; i < m; i++) {
            have[s2.charAt(i) - 'a']++;
            have[s2.charAt(i - n) - 'a']--;
            if (Arrays.equals(need, have)) return true;
        }
        return false;
    }

    public static void main(String[] args) {
        System.out.println(checkInclusion("ab", "eidbaooo"));
    }
}
`,
    tests: [
      { name: "LC example 1", input: "", expectedOutput: "true", runnerCode: `System.out.println(Solution.checkInclusion("ab", "eidbaooo"));` },
      { name: "LC example 2", input: "", expectedOutput: "false", runnerCode: `System.out.println(Solution.checkInclusion("ab", "eidboaoo"));` },
      { name: "empty s1", input: "", expectedOutput: "true", runnerCode: `System.out.println(Solution.checkInclusion("", "anything"));` },
      { name: "empty s2", input: "", expectedOutput: "false", runnerCode: `System.out.println(Solution.checkInclusion("a", ""));` },
      { name: "exact match single", input: "", expectedOutput: "true", runnerCode: `System.out.println(Solution.checkInclusion("a", "a"));` },
      { name: "perm at end", input: "", expectedOutput: "true", runnerCode: `System.out.println(Solution.checkInclusion("abc", "bbbca"));` },
      { name: "no permutation", input: "", expectedOutput: "false", runnerCode: `System.out.println(Solution.checkInclusion("abc", "ccccbbbbaaaa"));` },
      { name: "missing char", input: "", expectedOutput: "false", runnerCode: `System.out.println(Solution.checkInclusion("hello", "ooolleoooleh"));` },
      { name: "palindromic perm", input: "", expectedOutput: "true", runnerCode: `System.out.println(Solution.checkInclusion("adc", "dcda"));` },
      { name: "s2 too short", input: "", expectedOutput: "false", runnerCode: `System.out.println(Solution.checkInclusion("ab", "a"));` },
      { name: "reverse match", input: "", expectedOutput: "true", runnerCode: `System.out.println(Solution.checkInclusion("ab", "ba"));` }
    ]
  },
  {
    id: "partition-labels",
    title: "Partition Labels",
    difficulty: "Medium",
    category: "Two Pointers",
    leetcode: "https://leetcode.com/problems/partition-labels/",
    companies: ["Google", "Amazon", "Microsoft", "Facebook", "Uber"],
    description: "You are given a string s. We want to partition the string into as many parts as possible so that each letter appears in at most one part. Return a list of integers representing the size of these parts. Greedy approach: track the last occurrence of each character, then expand the current window until it closes.",
    examples: "Input: s = \"ababcbacadefegdehijhklij\"\nOutput: [9, 7, 8]\n\nInput: s = \"eccbbbbdec\"\nOutput: [10]",
    starterCode: null,
    solution: `import java.util.*;

public class Solution {
    public static List<Integer> partitionLabels(String s) {
        List<Integer> result = new ArrayList<>();
        if (s == null || s.isEmpty()) return result;
        int[] last = new int[26];
        for (int i = 0; i < s.length(); i++) {
            last[s.charAt(i) - 'a'] = i;
        }
        int start = 0, end = 0;
        for (int i = 0; i < s.length(); i++) {
            end = Math.max(end, last[s.charAt(i) - 'a']);
            if (i == end) {
                result.add(end - start + 1);
                start = i + 1;
            }
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(partitionLabels("ababcbacadefegdehijhklij"));
    }
}
`,
    tests: [
      { name: "LC example 1", input: "", expectedOutput: "[9, 7, 8]", runnerCode: `System.out.println(Solution.partitionLabels("ababcbacadefegdehijhklij"));` },
      { name: "LC example 2", input: "", expectedOutput: "[10]", runnerCode: `System.out.println(Solution.partitionLabels("eccbbbbdec"));` },
      { name: "single char", input: "", expectedOutput: "[1]", runnerCode: `System.out.println(Solution.partitionLabels("a"));` },
      { name: "empty string", input: "", expectedOutput: "[]", runnerCode: `System.out.println(Solution.partitionLabels(""));` },
      { name: "two distinct", input: "", expectedOutput: "[1, 1]", runnerCode: `System.out.println(Solution.partitionLabels("ab"));` },
      { name: "doubled", input: "", expectedOutput: "[2]", runnerCode: `System.out.println(Solution.partitionLabels("aa"));` },
      { name: "three distinct", input: "", expectedOutput: "[1, 1, 1]", runnerCode: `System.out.println(Solution.partitionLabels("abc"));` },
      { name: "interleaved pair", input: "", expectedOutput: "[4]", runnerCode: `System.out.println(Solution.partitionLabels("abab"));` },
      { name: "full repeat", input: "", expectedOutput: "[6]", runnerCode: `System.out.println(Solution.partitionLabels("abcabc"));` },
      { name: "split uneven", input: "", expectedOutput: "[1, 9]", runnerCode: `System.out.println(Solution.partitionLabels("caedbdedda"));` },
      { name: "three singles", input: "", expectedOutput: "[1, 1, 1]", runnerCode: `System.out.println(Solution.partitionLabels("xyz"));` }
    ]
  },
  {
    id: "capacity-to-ship-packages",
    title: "Capacity To Ship Packages Within D Days",
    difficulty: "Medium",
    category: "Sorting & Searching",
    leetcode: "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/",
    companies: ["Google", "Amazon", "Microsoft", "Facebook", "Apple"],
    description: "A conveyor belt has packages that must be shipped from one port to another within days days. The ith package on the conveyor belt has a weight of weights[i]. Each day, we load the ship with packages on the conveyor belt in the order given by weights. We may not load more weight than the maximum weight capacity of the ship. Return the least weight capacity of the ship that will result in all the packages being shipped within days days. Binary search over the answer space [max(weights), sum(weights)].",
    examples: "Input: weights = [1,2,3,4,5,6,7,8,9,10], days = 5\nOutput: 15\n\nInput: weights = [3,2,2,4,1,4], days = 3\nOutput: 6",
    starterCode: null,
    solution: `import java.util.*;

public class Solution {
    public static int shipWithinDays(int[] weights, int days) {
        int lo = 0, hi = 0;
        for (int w : weights) {
            lo = Math.max(lo, w);
            hi += w;
        }
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (canShip(weights, days, mid)) {
                hi = mid;
            } else {
                lo = mid + 1;
            }
        }
        return lo;
    }

    private static boolean canShip(int[] weights, int days, int cap) {
        int used = 1, load = 0;
        for (int w : weights) {
            if (load + w > cap) {
                used++;
                load = 0;
            }
            load += w;
        }
        return used <= days;
    }

    public static void main(String[] args) {
        System.out.println(shipWithinDays(new int[]{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}, 5));
    }
}
`,
    tests: [
      { name: "LC example 1", input: "", expectedOutput: "15", runnerCode: `System.out.println(Solution.shipWithinDays(new int[]{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}, 5));` },
      { name: "LC example 2", input: "", expectedOutput: "6", runnerCode: `System.out.println(Solution.shipWithinDays(new int[]{3, 2, 2, 4, 1, 4}, 3));` },
      { name: "LC example 3", input: "", expectedOutput: "3", runnerCode: `System.out.println(Solution.shipWithinDays(new int[]{1, 2, 3, 1, 1}, 4));` },
      { name: "single package", input: "", expectedOutput: "1", runnerCode: `System.out.println(Solution.shipWithinDays(new int[]{1}, 1));` },
      { name: "single big", input: "", expectedOutput: "10", runnerCode: `System.out.println(Solution.shipWithinDays(new int[]{10}, 1));` },
      { name: "one per day", input: "", expectedOutput: "1", runnerCode: `System.out.println(Solution.shipWithinDays(new int[]{1, 1, 1, 1}, 4));` },
      { name: "all in one day", input: "", expectedOutput: "4", runnerCode: `System.out.println(Solution.shipWithinDays(new int[]{1, 1, 1, 1}, 1));` },
      { name: "ship all one day", input: "", expectedOutput: "6", runnerCode: `System.out.println(Solution.shipWithinDays(new int[]{1, 2, 3}, 1));` },
      { name: "ship max per day", input: "", expectedOutput: "3", runnerCode: `System.out.println(Solution.shipWithinDays(new int[]{1, 2, 3}, 3));` },
      { name: "equal spread", input: "", expectedOutput: "5", runnerCode: `System.out.println(Solution.shipWithinDays(new int[]{5, 5, 5, 5, 5}, 5));` },
      { name: "all one day big", input: "", expectedOutput: "25", runnerCode: `System.out.println(Solution.shipWithinDays(new int[]{5, 5, 5, 5, 5}, 1));` }
    ]
  },
  {
    id: "find-and-replace-in-string",
    title: "Find And Replace in String",
    difficulty: "Medium",
    category: "Strings",
    leetcode: "https://leetcode.com/problems/find-and-replace-in-string/",
    companies: ["Google", "Amazon", "Microsoft", "Facebook"],
    description: "You are given a 0-indexed string s that you must perform k replacement operations on. The replacements are given as three 0-indexed parallel arrays indices, sources, and targets, all of length k. To complete the ith replacement operation: check if the substring sources[i] occurs at index indices[i] in the original string s. If it does not occur, do nothing. Otherwise, replace that occurrence with targets[i]. All operations occur simultaneously on the original string. Return the resulting string.",
    examples: "Input: s = \"abcd\", indices = [0,2], sources = [\"a\",\"cd\"], targets = [\"eee\",\"ffff\"]\nOutput: \"eeebffff\"\n\nInput: s = \"abcd\", indices = [0,2], sources = [\"ab\",\"ec\"], targets = [\"eee\",\"ffff\"]\nOutput: \"eeecd\"",
    starterCode: null,
    solution: `import java.util.*;

public class Solution {
    public static String findReplaceString(String s, int[] indices, String[] sources, String[] targets) {
        int k = indices.length;
        Integer[] order = new Integer[k];
        for (int i = 0; i < k; i++) order[i] = i;
        Arrays.sort(order, (a, b) -> Integer.compare(indices[a], indices[b]));
        StringBuilder sb = new StringBuilder();
        int pos = 0;
        for (int idx : order) {
            int start = indices[idx];
            if (start < pos) continue;
            sb.append(s, pos, start);
            if (s.startsWith(sources[idx], start)) {
                sb.append(targets[idx]);
                pos = start + sources[idx].length();
            } else {
                pos = start;
            }
        }
        sb.append(s.substring(pos));
        return sb.toString();
    }

    public static void main(String[] args) {
        System.out.println(findReplaceString("abcd", new int[]{0, 2}, new String[]{"a", "cd"}, new String[]{"eee", "ffff"}));
    }
}
`,
    tests: [
      { name: "LC example 1", input: "", expectedOutput: "eeebffff", runnerCode: `System.out.println(Solution.findReplaceString("abcd", new int[]{0, 2}, new String[]{"a", "cd"}, new String[]{"eee", "ffff"}));` },
      { name: "LC example 2", input: "", expectedOutput: "eeecd", runnerCode: `System.out.println(Solution.findReplaceString("abcd", new int[]{0, 2}, new String[]{"ab", "ec"}, new String[]{"eee", "ffff"}));` },
      { name: "both replace", input: "", expectedOutput: "eeebffff", runnerCode: `System.out.println(Solution.findReplaceString("abcd", new int[]{0, 2}, new String[]{"a", "cd"}, new String[]{"eee", "ffff"}));` },
      { name: "unordered indices", input: "", expectedOutput: "vbfrssozp", runnerCode: `System.out.println(Solution.findReplaceString("vmokgggqzp", new int[]{3, 5, 1}, new String[]{"kg", "ggq", "mo"}, new String[]{"s", "so", "bfr"}));` },
      { name: "empty ops", input: "", expectedOutput: "abc", runnerCode: `System.out.println(Solution.findReplaceString("abc", new int[]{}, new String[]{}, new String[]{}));` },
      { name: "empty string", input: "", expectedOutput: "", runnerCode: `System.out.println(Solution.findReplaceString("", new int[]{}, new String[]{}, new String[]{}));` },
      { name: "single char replace", input: "", expectedOutput: "zbc", runnerCode: `System.out.println(Solution.findReplaceString("abc", new int[]{0}, new String[]{"a"}, new String[]{"z"}));` },
      { name: "replace with empty", input: "", expectedOutput: "bc", runnerCode: `System.out.println(Solution.findReplaceString("abc", new int[]{0}, new String[]{"a"}, new String[]{""}));` },
      { name: "two shrinking", input: "", expectedOutput: "XdY", runnerCode: `System.out.println(Solution.findReplaceString("abcdef", new int[]{0, 4}, new String[]{"abc", "ef"}, new String[]{"X", "Y"}));` },
      { name: "mid expand", input: "", expectedOutput: "abcdYZ", runnerCode: `System.out.println(Solution.findReplaceString("abcdef", new int[]{4}, new String[]{"ef"}, new String[]{"YZ"}));` },
      { name: "two ab replacements", input: "", expectedOutput: "xyzw", runnerCode: `System.out.println(Solution.findReplaceString("abab", new int[]{0, 2}, new String[]{"ab", "ab"}, new String[]{"xy", "zw"}));` }
    ]
  },
  {
    id: "expressive-words",
    title: "Expressive Words",
    difficulty: "Medium",
    category: "Two Pointers",
    leetcode: "https://leetcode.com/problems/expressive-words/",
    companies: ["Google", "Amazon", "Microsoft"],
    description: "Sometimes people repeat letters to represent extra feeling. You are given a string s and an array of query strings words. A query word is stretchy if it can be made to equal s by any number of applications of the following extension operation: choose a group consisting of characters c, and add some number of characters c to the group so that the size of the group is three or more. Return the number of query strings that are stretchy.",
    examples: "Input: s = \"heeellooo\", words = [\"hello\",\"hi\",\"helo\"]\nOutput: 1\n\nInput: s = \"zzzzzyyyyy\", words = [\"zzyy\",\"zy\",\"zyy\"]\nOutput: 3",
    starterCode: null,
    solution: `import java.util.*;

public class Solution {
    public static int expressiveWords(String s, String[] words) {
        int count = 0;
        for (String w : words) {
            if (isStretchy(s, w)) count++;
        }
        return count;
    }

    private static boolean isStretchy(String s, String w) {
        int i = 0, j = 0;
        int n = s.length(), m = w.length();
        while (i < n && j < m) {
            if (s.charAt(i) != w.charAt(j)) return false;
            int sLen = 0;
            char c = s.charAt(i);
            while (i < n && s.charAt(i) == c) { i++; sLen++; }
            int wLen = 0;
            while (j < m && w.charAt(j) == c) { j++; wLen++; }
            if (sLen < wLen) return false;
            if (sLen != wLen && sLen < 3) return false;
        }
        return i == n && j == m;
    }

    public static void main(String[] args) {
        System.out.println(expressiveWords("heeellooo", new String[]{"hello", "hi", "helo"}));
    }
}
`,
    tests: [
      { name: "LC example 1", input: "", expectedOutput: "1", runnerCode: `System.out.println(Solution.expressiveWords("heeellooo", new String[]{"hello", "hi", "helo"}));` },
      { name: "LC example 2", input: "", expectedOutput: "3", runnerCode: `System.out.println(Solution.expressiveWords("zzzzzyyyyy", new String[]{"zzyy", "zy", "zyy"}));` },
      { name: "exact and shorter", input: "", expectedOutput: "1", runnerCode: `System.out.println(Solution.expressiveWords("abc", new String[]{"abc", "ab", "abcd"}));` },
      { name: "stretch threshold", input: "", expectedOutput: "3", runnerCode: `System.out.println(Solution.expressiveWords("aaa", new String[]{"a", "aa", "aaa"}));` },
      { name: "both empty", input: "", expectedOutput: "1", runnerCode: `System.out.println(Solution.expressiveWords("", new String[]{""}));` },
      { name: "empty s nonempty word", input: "", expectedOutput: "0", runnerCode: `System.out.println(Solution.expressiveWords("", new String[]{"a"}));` },
      { name: "nonempty s empty word", input: "", expectedOutput: "0", runnerCode: `System.out.println(Solution.expressiveWords("a", new String[]{""}));` },
      { name: "matches one", input: "", expectedOutput: "1", runnerCode: `System.out.println(Solution.expressiveWords("a", new String[]{"a", "b"}));` },
      { name: "cannot stretch short", input: "", expectedOutput: "0", runnerCode: `System.out.println(Solution.expressiveWords("aa", new String[]{"a"}));` },
      { name: "exact match only", input: "", expectedOutput: "1", runnerCode: `System.out.println(Solution.expressiveWords("aa", new String[]{"aa", "a"}));` },
      { name: "one char short fail", input: "", expectedOutput: "0", runnerCode: `System.out.println(Solution.expressiveWords("aabb", new String[]{"ab"}));` },
      { name: "stretch to three", input: "", expectedOutput: "1", runnerCode: `System.out.println(Solution.expressiveWords("aaabbb", new String[]{"ab"}));` }
    ]
  },
  // ═══════════════════════════════════════════════════════════════════
  // ═══  BATCH 13 — Robot, Islands, Bricks, Race Car, Strobogrammatic ═══
  // ═══════════════════════════════════════════════════════════════════

  {
    id: 'robot-room-cleaner',
    title: 'Robot Room Cleaner',
    category: 'Backtracking',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/robot-room-cleaner/',
    tags: ['Backtracking', 'DFS', 'Interactive'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Facebook'],
    description: "You are given a robot on an m x n grid where each cell is either empty (1) or blocked (0). The robot starts at an unknown empty cell and its initial direction faces up. You have access only to the following Robot API:\n\n- `boolean move()` — move one step forward; returns false if blocked.\n- `void turnLeft()` / `void turnRight()` — rotate 90 degrees.\n- `void clean()` — clean the current cell.\n\nDesign an algorithm that cleans the entire room using only these primitives. You do not know the grid size or the starting position. Use DFS + backtracking: track visited cells in relative coordinates, spiral through four directions, and always undo your move so the robot returns to the pre-call state.",
    examples: "Input: room = [[1,1,1,1,1,0,1,1],[1,1,1,1,1,0,1,1],[1,0,1,1,1,1,1,1],[0,0,0,1,0,0,0,0],[1,1,1,1,1,1,1,1]], row = 1, col = 3\nOutput: all 1-cells cleaned (29 cells)",
    starterCode: null
  },

  {
    id: 'number-of-distinct-islands',
    title: 'Number of Distinct Islands',
    category: 'Graphs',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/number-of-distinct-islands/',
    tags: ['DFS', 'BFS', 'Hash Set', 'Matrix'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Facebook'],
    description: "Given a binary matrix `grid` where 1 represents land and 0 represents water, return the number of **distinct** islands. Two islands are the same when one can be translated (but not rotated or reflected) to equal the other.\n\n**Approach:** DFS each island and record its shape as a canonical signature — e.g., the sequence of move directions taken, including a sentinel when backtracking (so shape is unambiguous), or the list of cell offsets relative to the first cell. Insert the signature into a HashSet. The final answer is the set size.",
    examples: "Input: grid = [[1,1,0,0,0],[1,1,0,0,0],[0,0,0,1,1],[0,0,0,1,1]]\nOutput: 1  (both islands are identical 2x2 blocks)\n\nInput: grid = [[1,1,0,1,1],[1,0,0,0,0],[0,0,0,0,1],[1,1,0,1,1]]\nOutput: 3",
    starterCode: null
  },

  {
    id: 'bricks-falling-when-hit',
    title: 'Bricks Falling When Hit',
    category: 'Graphs',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/bricks-falling-when-hit/',
    tags: ['Union Find', 'Reverse Thinking', 'Matrix', 'BFS'],
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: "You are given an m x n binary grid where 1 is a brick and 0 is empty. A brick is **stable** if it is in the top row, or if it is 4-directionally adjacent to another stable brick. Given an array `hits` of cells to erase (in order), return `result[i]` = the number of bricks that fall **after** the i-th hit (the hit brick itself is not counted if it was present).\n\n**Classic trick:** process hits in **reverse** with Union-Find. First apply every hit (zero out those cells), union remaining bricks, and note the size of the top-connected component. Then re-add hits one by one (in reverse); each addition may attach a new subtree to the roof. `result[i] = max(0, newRoof - oldRoof - 1)`.",
    examples: "Input: grid = [[1,0,0,0],[1,1,1,0]], hits = [[1,0]]\nOutput: [2]\n\nInput: grid = [[1,0,0,0],[1,1,0,0]], hits = [[1,1],[1,0]]\nOutput: [0, 0]",
    starterCode: null
  },

  {
    id: 'shortest-path-visiting-all-nodes',
    title: 'Shortest Path Visiting All Nodes',
    category: 'Graphs',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/shortest-path-visiting-all-nodes/',
    tags: ['BFS', 'Bitmask', 'Dynamic Programming'],
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: "You have an undirected, connected graph of `n` nodes labeled `0..n-1` given as `graph[i]` = list of neighbors of node i. You may start and stop at **any** node, may revisit nodes and edges, and must return the length of the shortest path that visits every node.\n\n**Approach:** BFS over states (node, visitedMask). Start by enqueueing every node simultaneously with its own single-bit mask. The first time the mask becomes `(1 << n) - 1`, return the distance. State space is n * 2^n — tractable for n ≤ 12.",
    examples: "Input: graph = [[1,2,3],[0],[0],[0]]\nOutput: 4  (e.g., 1 → 0 → 2 → 0 → 3)\n\nInput: graph = [[1],[0,2,4],[1,3,4],[2],[1,2]]\nOutput: 4",
    starterCode: null
  },

  {
    id: 'race-car',
    title: 'Race Car',
    category: 'Dynamic Programming',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/race-car/',
    tags: ['Dynamic Programming', 'BFS', 'Greedy'],
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: "Your car starts at position 0 with speed +1 on an infinite number line. Given a target position `target`, return the minimum number of instructions to reach it. The instructions are:\n\n- `A` (accelerate): `position += speed`, then `speed *= 2`.\n- `R` (reverse): if `speed > 0` then `speed = -1`, else `speed = 1`. Position unchanged.\n\n**Approach 1 (BFS):** states are (position, speed); enqueue both A and R transitions; track visited. Works for small targets.\n\n**Approach 2 (DP):** let `dp[t]` be the answer for target t. If `2^n - 1 == t` (exactly reachable by n As), `dp[t] = n`. Otherwise try overshooting then reversing, or undershooting with an inner reverse; take the minimum.",
    examples: "Input: target = 3\nOutput: 2  (AA: 0 → 1 → 3)\n\nInput: target = 6\nOutput: 5  (AAARA: 0 → 1 → 3 → 7 → R → 6)",
    starterCode: null
  },

  {
    id: 'min-domino-rotations',
    title: 'Minimum Domino Rotations For Equal Row',
    category: 'Arrays',
    difficulty: 'Medium',
    link: 'https://leetcode.com/problems/minimum-domino-rotations-for-equal-row/',
    tags: ['Array', 'Greedy', 'Counting'],
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: "You have two arrays `tops` and `bottoms` of equal length n, representing n dominoes — the i-th domino has `tops[i]` on top and `bottoms[i]` on bottom. In one move you may rotate a single domino, swapping its top and bottom.\n\nReturn the minimum number of rotations needed to make **all values in `tops` equal** or **all values in `bottoms` equal**. Return -1 if impossible.\n\n**Approach:** the target value must be either `tops[0]` or `bottoms[0]` — otherwise no rotation sequence can make the first domino match. For each candidate `x`, walk once: count how many rotations would make `tops` all x and how many would make `bottoms` all x (and abort if some domino has neither face equal to x). Answer = min across candidates.",
    examples: "Input: tops = [2,1,2,4,2,2], bottoms = [5,2,6,2,3,2]\nOutput: 2\n\nInput: tops = [3,5,1,2,3], bottoms = [3,6,3,3,4]\nOutput: -1",
    starterCode: null
  },

  {
    id: 'word-squares',
    title: 'Word Squares',
    category: 'Backtracking',
    difficulty: 'Hard',
    link: 'https://leetcode.com/problems/word-squares/',
    tags: ['Backtracking', 'Trie', 'Hash Map'],
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: "Given an array of **unique** strings `words`, each of the same length k, return **all** word squares you can build. A word square is a k x k arrangement where the i-th row and the i-th column read the same word (0-indexed). Each word may be used multiple times.\n\n**Approach:** backtracking. When placing row r, the prefix of that word is fixed — it must match the r-th character of each previously placed word (reading down column r). Build a prefix map (`HashMap<String, List<String>>`) up-front so we can look up all words sharing a given prefix in O(1).",
    examples: "Input: words = [\"area\",\"lead\",\"wall\",\"lady\",\"ball\"]\nOutput: [[\"ball\",\"area\",\"lead\",\"lady\"], [\"wall\",\"area\",\"lead\",\"lady\"]]\n\nInput: words = [\"abat\",\"baba\",\"atan\",\"atal\"]\nOutput: [[\"baba\",\"abat\",\"baba\",\"atal\"], [\"baba\",\"abat\",\"baba\",\"atan\"]]",
    starterCode: null
  },

  {
    id: 'strobogrammatic-number',
    title: 'Strobogrammatic Number',
    category: 'Strings',
    difficulty: 'Easy',
    link: 'https://leetcode.com/problems/strobogrammatic-number/',
    tags: ['Hash Map', 'Two Pointers', 'String'],
    companies: ['Google', 'Amazon', 'Microsoft'],
    description: "A **strobogrammatic** number is one that looks the same when rotated 180 degrees. Given a string `num` representing a number, return true if it is strobogrammatic.\n\nValid digit mirrors: 0 ↔ 0, 1 ↔ 1, 6 ↔ 9, 8 ↔ 8, 9 ↔ 6. Every other digit (2, 3, 4, 5, 7) is invalid.\n\n**Two-pointer check:** walk left and right pointers toward each other; at each step confirm `mirror[num[l]] == num[r]`. The middle digit (when length is odd) must mirror to itself — only 0, 1, 8 qualify.",
    examples: "Input: num = \"69\"\nOutput: true\n\nInput: num = \"962\"\nOutput: false\n\nInput: num = \"1\"\nOutput: true",
    starterCode: null
  },

  {
    id: "range-module",
    title: "Range Module",
    difficulty: "Hard",
    category: "Intervals",
    leetcode: "https://leetcode.com/problems/range-module/",
    companies: ["Google", "Amazon", "Microsoft", "Apple", "Meta"],
    description: "Design a Range Module that tracks half-open intervals [left, right). Implement addRange(left, right) to add the interval, queryRange(left, right) to return true iff every real number in [left, right) is currently tracked, and removeRange(left, right) to stop tracking the interval. Use a TreeMap of disjoint intervals (merging adjacent/overlapping ranges on insert, splitting on removal) for O(log n) amortized operations.",
    examples: "addRange(10, 20); removeRange(14, 16);\nqueryRange(10, 14) -> true\nqueryRange(13, 15) -> false\nqueryRange(16, 17) -> true",
    starterCode: null,
    solution: `import java.util.*;

public class Solution {
    static class RangeModule {
        TreeMap<Integer, Integer> map;

        public RangeModule() {
            map = new TreeMap<>();
        }

        public void addRange(int left, int right) {
            Map.Entry<Integer, Integer> lo = map.floorEntry(left);
            if (lo != null && lo.getValue() >= left) {
                left = lo.getKey();
                right = Math.max(right, lo.getValue());
            }
            Map.Entry<Integer, Integer> hi = map.floorEntry(right);
            if (hi != null && hi.getValue() >= right) {
                right = hi.getValue();
            }
            map.subMap(left, right).clear();
            if (map.containsKey(right)) {
                right = map.remove(right) > right ? map.get(right) : right;
            }
            map.put(left, right);
            Map.Entry<Integer, Integer> next = map.higherEntry(left);
            while (next != null && next.getKey() <= right) {
                right = Math.max(right, next.getValue());
                map.remove(next.getKey());
                map.put(left, right);
                next = map.higherEntry(left);
            }
        }

        public boolean queryRange(int left, int right) {
            Map.Entry<Integer, Integer> e = map.floorEntry(left);
            return e != null && e.getValue() >= right;
        }

        public void removeRange(int left, int right) {
            Map.Entry<Integer, Integer> lo = map.floorEntry(left);
            if (lo != null && lo.getValue() > left) {
                int origRight = lo.getValue();
                if (lo.getKey() < left) {
                    map.put(lo.getKey(), left);
                } else {
                    map.remove(lo.getKey());
                }
                if (origRight > right) {
                    map.put(right, origRight);
                }
            }
            Map.Entry<Integer, Integer> mid = map.ceilingEntry(left);
            while (mid != null && mid.getKey() < right) {
                int key = mid.getKey();
                int val = mid.getValue();
                map.remove(key);
                if (val > right) {
                    map.put(right, val);
                    break;
                }
                mid = map.ceilingEntry(left);
            }
        }
    }

    public static void main(String[] args) {
        RangeModule r = new RangeModule();
        r.addRange(10, 20);
        r.removeRange(14, 16);
        System.out.println(r.queryRange(10, 14));
    }
}
`,
    tests: [
      { name: "LC add then remove gap", input: "", expectedOutput: "true", runnerCode: `Solution.RangeModule r = new Solution.RangeModule(); r.addRange(10, 20); r.removeRange(14, 16); System.out.println(r.queryRange(10, 14));` },
      { name: "LC query spans gap", input: "", expectedOutput: "false", runnerCode: `Solution.RangeModule r = new Solution.RangeModule(); r.addRange(10, 20); r.removeRange(14, 16); System.out.println(r.queryRange(13, 15));` },
      { name: "LC query after gap", input: "", expectedOutput: "true", runnerCode: `Solution.RangeModule r = new Solution.RangeModule(); r.addRange(10, 20); r.removeRange(14, 16); System.out.println(r.queryRange(16, 17));` },
      { name: "fill gap then query full", input: "", expectedOutput: "true", runnerCode: `Solution.RangeModule r = new Solution.RangeModule(); r.addRange(10, 20); r.removeRange(14, 16); r.addRange(14, 16); System.out.println(r.queryRange(10, 20));` },
      { name: "remove everything", input: "", expectedOutput: "false", runnerCode: `Solution.RangeModule r = new Solution.RangeModule(); r.addRange(10, 20); r.removeRange(10, 20); System.out.println(r.queryRange(10, 15));` },
      { name: "two disjoint ranges with gap", input: "", expectedOutput: "false", runnerCode: `Solution.RangeModule r = new Solution.RangeModule(); r.addRange(5, 10); r.addRange(20, 30); System.out.println(r.queryRange(5, 30));` },
      { name: "merged adjacent ranges", input: "", expectedOutput: "true", runnerCode: `Solution.RangeModule r = new Solution.RangeModule(); r.addRange(5, 10); r.addRange(20, 30); r.addRange(10, 20); System.out.println(r.queryRange(5, 30));` },
      { name: "query outside added range", input: "", expectedOutput: "false", runnerCode: `Solution.RangeModule r = new Solution.RangeModule(); r.addRange(5, 10); System.out.println(r.queryRange(0, 5));` },
      { name: "query starts before range", input: "", expectedOutput: "false", runnerCode: `Solution.RangeModule r = new Solution.RangeModule(); r.addRange(5, 10); System.out.println(r.queryRange(4, 10));` },
      { name: "after adding adjacent left", input: "", expectedOutput: "true", runnerCode: `Solution.RangeModule r = new Solution.RangeModule(); r.addRange(5, 10); r.addRange(0, 5); System.out.println(r.queryRange(0, 10));` },
      { name: "empty module query", input: "", expectedOutput: "false", runnerCode: `Solution.RangeModule r = new Solution.RangeModule(); System.out.println(r.queryRange(1, 10));` },
      { name: "exact boundary query", input: "", expectedOutput: "true", runnerCode: `Solution.RangeModule r = new Solution.RangeModule(); r.addRange(1, 100); System.out.println(r.queryRange(50, 100));` }
    ]
  },
  {
    id: "my-calendar-iii",
    title: "My Calendar III",
    difficulty: "Hard",
    category: "Intervals",
    leetcode: "https://leetcode.com/problems/my-calendar-iii/",
    companies: ["Google", "Amazon", "Microsoft", "Facebook", "Apple"],
    description: "A k-booking happens when k events have some non-empty intersection. Implement MyCalendarThree with a method book(start, end) that records the half-open interval [start, end) and returns the maximum k across all points in time after the booking. Use a TreeMap sweep-line (delta +1 at start, -1 at end) and sum running counts to get the max concurrency.",
    examples: "book(10, 20) -> 1\nbook(50, 60) -> 1\nbook(10, 40) -> 2\nbook(5, 15) -> 3\nbook(5, 10) -> 3\nbook(25, 55) -> 3",
    starterCode: null,
    solution: `import java.util.*;

public class Solution {
    static class MyCalendarThree {
        TreeMap<Integer, Integer> delta;

        public MyCalendarThree() {
            delta = new TreeMap<>();
        }

        public int book(int start, int end) {
            delta.merge(start, 1, Integer::sum);
            delta.merge(end, -1, Integer::sum);
            int max = 0, cur = 0;
            for (int v : delta.values()) {
                cur += v;
                if (cur > max) max = cur;
            }
            return max;
        }
    }

    public static void main(String[] args) {
        MyCalendarThree c = new MyCalendarThree();
        System.out.println(c.book(10, 20));
    }
}
`,
    tests: [
      { name: "LC first booking", input: "", expectedOutput: "1", runnerCode: `Solution.MyCalendarThree c = new Solution.MyCalendarThree(); System.out.println(c.book(10, 20));` },
      { name: "LC non-overlapping", input: "", expectedOutput: "1", runnerCode: `Solution.MyCalendarThree c = new Solution.MyCalendarThree(); c.book(10, 20); System.out.println(c.book(50, 60));` },
      { name: "LC overlaps first", input: "", expectedOutput: "2", runnerCode: `Solution.MyCalendarThree c = new Solution.MyCalendarThree(); c.book(10, 20); c.book(50, 60); System.out.println(c.book(10, 40));` },
      { name: "LC triple overlap", input: "", expectedOutput: "3", runnerCode: `Solution.MyCalendarThree c = new Solution.MyCalendarThree(); c.book(10, 20); c.book(50, 60); c.book(10, 40); System.out.println(c.book(5, 15));` },
      { name: "LC touching not overlapping", input: "", expectedOutput: "3", runnerCode: `Solution.MyCalendarThree c = new Solution.MyCalendarThree(); c.book(10, 20); c.book(50, 60); c.book(10, 40); c.book(5, 15); System.out.println(c.book(5, 10));` },
      { name: "LC sixth booking", input: "", expectedOutput: "3", runnerCode: `Solution.MyCalendarThree c = new Solution.MyCalendarThree(); c.book(10, 20); c.book(50, 60); c.book(10, 40); c.book(5, 15); c.book(5, 10); System.out.println(c.book(25, 55));` },
      { name: "spanning all overlaps", input: "", expectedOutput: "4", runnerCode: `Solution.MyCalendarThree c = new Solution.MyCalendarThree(); c.book(10, 20); c.book(50, 60); c.book(10, 40); c.book(5, 15); c.book(5, 10); c.book(25, 55); System.out.println(c.book(0, 100));` },
      { name: "double spanning", input: "", expectedOutput: "5", runnerCode: `Solution.MyCalendarThree c = new Solution.MyCalendarThree(); c.book(10, 20); c.book(50, 60); c.book(10, 40); c.book(5, 15); c.book(5, 10); c.book(25, 55); c.book(0, 100); System.out.println(c.book(0, 100));` },
      { name: "triple spanning", input: "", expectedOutput: "6", runnerCode: `Solution.MyCalendarThree c = new Solution.MyCalendarThree(); c.book(10, 20); c.book(50, 60); c.book(10, 40); c.book(5, 15); c.book(5, 10); c.book(25, 55); c.book(0, 100); c.book(0, 100); System.out.println(c.book(0, 100));` },
      { name: "quad spanning", input: "", expectedOutput: "7", runnerCode: `Solution.MyCalendarThree c = new Solution.MyCalendarThree(); c.book(10, 20); c.book(50, 60); c.book(10, 40); c.book(5, 15); c.book(5, 10); c.book(25, 55); c.book(0, 100); c.book(0, 100); c.book(0, 100); System.out.println(c.book(0, 100));` },
      { name: "quint spanning", input: "", expectedOutput: "8", runnerCode: `Solution.MyCalendarThree c = new Solution.MyCalendarThree(); c.book(10, 20); c.book(50, 60); c.book(10, 40); c.book(5, 15); c.book(5, 10); c.book(25, 55); c.book(0, 100); c.book(0, 100); c.book(0, 100); c.book(0, 100); System.out.println(c.book(0, 100));` },
      { name: "single booking isolated", input: "", expectedOutput: "1", runnerCode: `Solution.MyCalendarThree c = new Solution.MyCalendarThree(); System.out.println(c.book(1, 2));` }
    ]
  },
  {
    id: "max-freq-stack",
    title: "Maximum Frequency Stack",
    difficulty: "Hard",
    category: "Stacks & Queues",
    leetcode: "https://leetcode.com/problems/maximum-frequency-stack/",
    companies: ["Google", "Amazon", "Microsoft", "Facebook", "Apple"],
    description: "Design a stack-like data structure with push(x) and pop() where pop() removes and returns the most frequent element, breaking ties by returning the element closest to the top of the stack. Use a HashMap of frequencies plus a HashMap from frequency to a stack of elements at that frequency, all O(1) per op.",
    examples: "push(5), push(7), push(5), push(7), push(4), push(5)\npop() -> 5 (freq 3)\npop() -> 7 (freq 2, closer to top than 5 at freq 2)\npop() -> 5 (freq 2)\npop() -> 4 (freq 1, closer to top)\npop() -> 7\npop() -> 5",
    starterCode: null,
    solution: `import java.util.*;

public class Solution {
    static class FreqStack {
        Map<Integer, Integer> freq;
        Map<Integer, Deque<Integer>> group;
        int maxFreq;

        public FreqStack() {
            freq = new HashMap<>();
            group = new HashMap<>();
            maxFreq = 0;
        }

        public void push(int val) {
            int f = freq.getOrDefault(val, 0) + 1;
            freq.put(val, f);
            if (f > maxFreq) maxFreq = f;
            group.computeIfAbsent(f, k -> new ArrayDeque<>()).push(val);
        }

        public int pop() {
            Deque<Integer> stk = group.get(maxFreq);
            int v = stk.pop();
            freq.put(v, freq.get(v) - 1);
            if (stk.isEmpty()) {
                group.remove(maxFreq);
                maxFreq--;
            }
            return v;
        }
    }

    public static void main(String[] args) {
        FreqStack fs = new FreqStack();
        fs.push(5);
        fs.push(7);
        fs.push(5);
        System.out.println(fs.pop());
    }
}
`,
    tests: [
      { name: "LC pop 1 freq 3", input: "", expectedOutput: "5", runnerCode: `Solution.FreqStack fs = new Solution.FreqStack(); fs.push(5); fs.push(7); fs.push(5); fs.push(7); fs.push(4); fs.push(5); System.out.println(fs.pop());` },
      { name: "LC pop 2 tiebreak top", input: "", expectedOutput: "7", runnerCode: `Solution.FreqStack fs = new Solution.FreqStack(); fs.push(5); fs.push(7); fs.push(5); fs.push(7); fs.push(4); fs.push(5); fs.pop(); System.out.println(fs.pop());` },
      { name: "LC pop 3", input: "", expectedOutput: "5", runnerCode: `Solution.FreqStack fs = new Solution.FreqStack(); fs.push(5); fs.push(7); fs.push(5); fs.push(7); fs.push(4); fs.push(5); fs.pop(); fs.pop(); System.out.println(fs.pop());` },
      { name: "LC pop 4", input: "", expectedOutput: "4", runnerCode: `Solution.FreqStack fs = new Solution.FreqStack(); fs.push(5); fs.push(7); fs.push(5); fs.push(7); fs.push(4); fs.push(5); fs.pop(); fs.pop(); fs.pop(); System.out.println(fs.pop());` },
      { name: "LC pop 5", input: "", expectedOutput: "7", runnerCode: `Solution.FreqStack fs = new Solution.FreqStack(); fs.push(5); fs.push(7); fs.push(5); fs.push(7); fs.push(4); fs.push(5); fs.pop(); fs.pop(); fs.pop(); fs.pop(); System.out.println(fs.pop());` },
      { name: "LC pop 6", input: "", expectedOutput: "5", runnerCode: `Solution.FreqStack fs = new Solution.FreqStack(); fs.push(5); fs.push(7); fs.push(5); fs.push(7); fs.push(4); fs.push(5); fs.pop(); fs.pop(); fs.pop(); fs.pop(); fs.pop(); System.out.println(fs.pop());` },
      { name: "single push single pop", input: "", expectedOutput: "42", runnerCode: `Solution.FreqStack fs = new Solution.FreqStack(); fs.push(42); System.out.println(fs.pop());` },
      { name: "all unique LIFO order", input: "", expectedOutput: "3", runnerCode: `Solution.FreqStack fs = new Solution.FreqStack(); fs.push(1); fs.push(2); fs.push(3); System.out.println(fs.pop());` },
      { name: "three same value", input: "", expectedOutput: "9", runnerCode: `Solution.FreqStack fs = new Solution.FreqStack(); fs.push(9); fs.push(9); fs.push(9); System.out.println(fs.pop());` },
      { name: "after scenario push 2 twice pop", input: "", expectedOutput: "2", runnerCode: `Solution.FreqStack fs = new Solution.FreqStack(); fs.push(1); fs.push(2); fs.push(2); System.out.println(fs.pop());` },
      { name: "after scenario second pop", input: "", expectedOutput: "2", runnerCode: `Solution.FreqStack fs = new Solution.FreqStack(); fs.push(1); fs.push(2); fs.push(2); fs.pop(); System.out.println(fs.pop());` },
      { name: "after scenario last remaining", input: "", expectedOutput: "1", runnerCode: `Solution.FreqStack fs = new Solution.FreqStack(); fs.push(1); fs.push(2); fs.push(2); fs.pop(); fs.pop(); System.out.println(fs.pop());` }
    ]
  },
  {
    id: "design-search-autocomplete",
    title: "Design Search Autocomplete System",
    difficulty: "Hard",
    category: "Hash Maps",
    leetcode: "https://leetcode.com/problems/design-search-autocomplete-system/",
    companies: ["Google", "Amazon", "Microsoft", "Facebook", "Apple"],
    description: "Design a search autocomplete system for a search engine. Users type a sentence ending in a special character #. For each character typed before #, return the top 3 historical sentences that have the same prefix, ranked by (hot degree desc, lexicographic asc). Once # is typed, commit the current sentence (incrementing its count). Use a trie or hash map of prefix to candidates.",
    examples: "init(['i love you','island','ironman','i love leetcode'], [5,3,2,2])\ninput('i') -> [i love you, island, i love leetcode]\ninput(' ') -> [i love you, i love leetcode]\ninput('a') -> []\ninput('#') -> []",
    starterCode: null,
    solution: `import java.util.*;

public class Solution {
    static class AutocompleteSystem {
        Map<String, Integer> counts;
        StringBuilder prefix;

        public AutocompleteSystem(String[] sentences, int[] times) {
            counts = new HashMap<>();
            prefix = new StringBuilder();
            for (int i = 0; i < sentences.length; i++) {
                counts.merge(sentences[i], times[i], Integer::sum);
            }
        }

        public List<String> input(char c) {
            if (c == '#') {
                counts.merge(prefix.toString(), 1, Integer::sum);
                prefix.setLength(0);
                return new ArrayList<>();
            }
            prefix.append(c);
            String p = prefix.toString();
            List<Map.Entry<String, Integer>> candidates = new ArrayList<>();
            for (Map.Entry<String, Integer> e : counts.entrySet()) {
                if (e.getKey().startsWith(p)) {
                    candidates.add(e);
                }
            }
            candidates.sort((a, b) -> {
                if (!a.getValue().equals(b.getValue())) return b.getValue() - a.getValue();
                return a.getKey().compareTo(b.getKey());
            });
            List<String> result = new ArrayList<>();
            for (int i = 0; i < Math.min(3, candidates.size()); i++) {
                result.add(candidates.get(i).getKey());
            }
            return result;
        }
    }

    public static void main(String[] args) {
        AutocompleteSystem a = new AutocompleteSystem(
            new String[]{"i love you", "island", "ironman", "i love leetcode"},
            new int[]{5, 3, 2, 2}
        );
        System.out.println(a.input('i'));
    }
}
`,
    tests: [
      { name: "LC input i", input: "", expectedOutput: "[i love you, island, i love leetcode]", runnerCode: `Solution.AutocompleteSystem a = new Solution.AutocompleteSystem(new String[]{"i love you", "island", "ironman", "i love leetcode"}, new int[]{5, 3, 2, 2}); System.out.println(a.input('i'));` },
      { name: "LC input space", input: "", expectedOutput: "[i love you, i love leetcode]", runnerCode: `Solution.AutocompleteSystem a = new Solution.AutocompleteSystem(new String[]{"i love you", "island", "ironman", "i love leetcode"}, new int[]{5, 3, 2, 2}); a.input('i'); System.out.println(a.input(' '));` },
      { name: "LC input a no match", input: "", expectedOutput: "[]", runnerCode: `Solution.AutocompleteSystem a = new Solution.AutocompleteSystem(new String[]{"i love you", "island", "ironman", "i love leetcode"}, new int[]{5, 3, 2, 2}); a.input('i'); a.input(' '); System.out.println(a.input('a'));` },
      { name: "LC commit returns empty", input: "", expectedOutput: "[]", runnerCode: `Solution.AutocompleteSystem a = new Solution.AutocompleteSystem(new String[]{"i love you", "island", "ironman", "i love leetcode"}, new int[]{5, 3, 2, 2}); a.input('i'); a.input(' '); a.input('a'); System.out.println(a.input('#'));` },
      { name: "after commit typing i", input: "", expectedOutput: "[i love you, island, i love leetcode]", runnerCode: `Solution.AutocompleteSystem a = new Solution.AutocompleteSystem(new String[]{"i love you", "island", "ironman", "i love leetcode"}, new int[]{5, 3, 2, 2}); a.input('i'); a.input(' '); a.input('a'); a.input('#'); System.out.println(a.input('i'));` },
      { name: "after commit typing space", input: "", expectedOutput: "[i love you, i love leetcode, i a]", runnerCode: `Solution.AutocompleteSystem a = new Solution.AutocompleteSystem(new String[]{"i love you", "island", "ironman", "i love leetcode"}, new int[]{5, 3, 2, 2}); a.input('i'); a.input(' '); a.input('a'); a.input('#'); a.input('i'); System.out.println(a.input(' '));` },
      { name: "after commit typing a", input: "", expectedOutput: "[i a]", runnerCode: `Solution.AutocompleteSystem a = new Solution.AutocompleteSystem(new String[]{"i love you", "island", "ironman", "i love leetcode"}, new int[]{5, 3, 2, 2}); a.input('i'); a.input(' '); a.input('a'); a.input('#'); a.input('i'); a.input(' '); System.out.println(a.input('a'));` },
      { name: "second commit empty", input: "", expectedOutput: "[]", runnerCode: `Solution.AutocompleteSystem a = new Solution.AutocompleteSystem(new String[]{"i love you", "island", "ironman", "i love leetcode"}, new int[]{5, 3, 2, 2}); a.input('i'); a.input(' '); a.input('a'); a.input('#'); a.input('i'); a.input(' '); a.input('a'); System.out.println(a.input('#'));` },
      { name: "fresh empty then b no match", input: "", expectedOutput: "[]", runnerCode: `Solution.AutocompleteSystem a = new Solution.AutocompleteSystem(new String[]{"i love you", "island", "ironman", "i love leetcode"}, new int[]{5, 3, 2, 2}); System.out.println(a.input('b'));` },
      { name: "commit new then query", input: "", expectedOutput: "[b]", runnerCode: `Solution.AutocompleteSystem a = new Solution.AutocompleteSystem(new String[]{"i love you", "island", "ironman", "i love leetcode"}, new int[]{5, 3, 2, 2}); a.input('b'); a.input('#'); System.out.println(a.input('b'));` },
      { name: "initial empty history", input: "", expectedOutput: "[]", runnerCode: `Solution.AutocompleteSystem a = new Solution.AutocompleteSystem(new String[]{}, new int[]{}); System.out.println(a.input('x'));` },
      { name: "single sentence top 3 limit", input: "", expectedOutput: "[abc]", runnerCode: `Solution.AutocompleteSystem a = new Solution.AutocompleteSystem(new String[]{"abc"}, new int[]{1}); System.out.println(a.input('a'));` }
    ]
  },
  {
    id: "random-pick-with-blacklist",
    title: "Random Pick with Blacklist",
    difficulty: "Hard",
    category: "Hash Maps",
    leetcode: "https://leetcode.com/problems/random-pick-with-blacklist/",
    companies: ["Google", "Amazon", "Microsoft", "Facebook", "Apple"],
    description: "Given an integer n and an array of unique blacklisted integers blacklist, design a Solution class with a method pick() that returns a uniformly random integer in the range [0, n) that is NOT in the blacklist. Optimize so that pick() runs in O(1) and uses as few calls to the system's random function as possible. Use a remap: every blacklisted number below n-|B| is mapped to a whitelisted number in the tail [n-|B|, n).",
    examples: "new Solution(7, [2,3,5])\npick() returns uniformly from {0, 1, 4, 6}",
    starterCode: null,
    solution: `import java.util.*;

public class Solution {
    static class Picker {
        int bound;
        Map<Integer, Integer> remap;
        Random rng;

        public Picker(int n, int[] blacklist) {
            bound = n - blacklist.length;
            remap = new HashMap<>();
            rng = new Random(42);
            Set<Integer> tail = new HashSet<>();
            for (int i = bound; i < n; i++) tail.add(i);
            for (int b : blacklist) tail.remove(b);
            Iterator<Integer> it = tail.iterator();
            for (int b : blacklist) {
                if (b < bound) {
                    remap.put(b, it.next());
                }
            }
        }

        public int pick() {
            int x = rng.nextInt(bound);
            return remap.getOrDefault(x, x);
        }
    }

    public static void main(String[] args) {
        Picker p = new Picker(7, new int[]{2, 3, 5});
        System.out.println(p.pick());
    }
}
`,
    tests: [
      { name: "LC blacklisted 2 never picked", input: "", expectedOutput: "true", runnerCode: `Solution.Picker p = new Solution.Picker(7, new int[]{2, 3, 5}); int[] counts = new int[7]; for (int i = 0; i < 10000; i++) counts[p.pick()]++; System.out.println(counts[2] == 0);` },
      { name: "LC blacklisted 3 never picked", input: "", expectedOutput: "true", runnerCode: `Solution.Picker p = new Solution.Picker(7, new int[]{2, 3, 5}); int[] counts = new int[7]; for (int i = 0; i < 10000; i++) counts[p.pick()]++; System.out.println(counts[3] == 0);` },
      { name: "LC blacklisted 5 never picked", input: "", expectedOutput: "true", runnerCode: `Solution.Picker p = new Solution.Picker(7, new int[]{2, 3, 5}); int[] counts = new int[7]; for (int i = 0; i < 10000; i++) counts[p.pick()]++; System.out.println(counts[5] == 0);` },
      { name: "index 0 near uniform", input: "", expectedOutput: "true", runnerCode: `Solution.Picker p = new Solution.Picker(7, new int[]{2, 3, 5}); int[] counts = new int[7]; for (int i = 0; i < 10000; i++) counts[p.pick()]++; System.out.println(Math.abs(counts[0] / 10000.0 - 0.25) < 0.03);` },
      { name: "index 1 near uniform", input: "", expectedOutput: "true", runnerCode: `Solution.Picker p = new Solution.Picker(7, new int[]{2, 3, 5}); int[] counts = new int[7]; for (int i = 0; i < 10000; i++) counts[p.pick()]++; System.out.println(Math.abs(counts[1] / 10000.0 - 0.25) < 0.03);` },
      { name: "index 4 near uniform", input: "", expectedOutput: "true", runnerCode: `Solution.Picker p = new Solution.Picker(7, new int[]{2, 3, 5}); int[] counts = new int[7]; for (int i = 0; i < 10000; i++) counts[p.pick()]++; System.out.println(Math.abs(counts[4] / 10000.0 - 0.25) < 0.03);` },
      { name: "index 6 near uniform", input: "", expectedOutput: "true", runnerCode: `Solution.Picker p = new Solution.Picker(7, new int[]{2, 3, 5}); int[] counts = new int[7]; for (int i = 0; i < 10000; i++) counts[p.pick()]++; System.out.println(Math.abs(counts[6] / 10000.0 - 0.25) < 0.03);` },
      { name: "no blacklist always valid range", input: "", expectedOutput: "true", runnerCode: `Solution.Picker p = new Solution.Picker(5, new int[]{}); boolean ok = true; for (int i = 0; i < 1000; i++) { int v = p.pick(); if (v < 0 || v >= 5) { ok = false; break; } } System.out.println(ok);` },
      { name: "single valid always returns 0", input: "", expectedOutput: "true", runnerCode: `Solution.Picker p = new Solution.Picker(3, new int[]{1, 2}); boolean ok = true; for (int i = 0; i < 100; i++) if (p.pick() != 0) { ok = false; break; } System.out.println(ok);` },
      { name: "tail blacklist", input: "", expectedOutput: "true", runnerCode: `Solution.Picker p = new Solution.Picker(5, new int[]{3, 4}); boolean ok = true; for (int i = 0; i < 1000; i++) { int v = p.pick(); if (v == 3 || v == 4 || v < 0 || v >= 5) { ok = false; break; } } System.out.println(ok);` },
      { name: "head blacklist 0 excluded", input: "", expectedOutput: "true", runnerCode: `Solution.Picker p = new Solution.Picker(5, new int[]{0, 1}); int[] counts = new int[5]; for (int i = 0; i < 1000; i++) counts[p.pick()]++; System.out.println(counts[0] == 0 && counts[1] == 0);` },
      { name: "mixed blacklist covers all allowed", input: "", expectedOutput: "true", runnerCode: `Solution.Picker p = new Solution.Picker(10, new int[]{0, 2, 4, 6, 8}); int[] counts = new int[10]; for (int i = 0; i < 5000; i++) counts[p.pick()]++; boolean ok = counts[1] > 0 && counts[3] > 0 && counts[5] > 0 && counts[7] > 0 && counts[9] > 0 && counts[0] == 0 && counts[2] == 0 && counts[4] == 0 && counts[6] == 0 && counts[8] == 0; System.out.println(ok);` }
    ]
  },
  {
    id: "guess-the-word",
    title: "Guess the Word",
    difficulty: "Hard",
    category: "Hash Maps",
    leetcode: "https://leetcode.com/problems/guess-the-word/",
    companies: ["Google", "Amazon", "Microsoft", "Facebook", "Apple"],
    description: "This is an interactive problem. You are given a list of 6-letter words and a Master API with guess(word) that returns the number of matching positions between word and a hidden secret. Call findSecretWord(words, master) which must identify the secret within the allowed number of guesses (10). Strategy: on each round pick a candidate (ideally minimax), query master.guess, then filter candidates to those with the same match count as the query response.",
    examples: "words = ['acckzz','ccbazz','eiowzz','abcczz'], secret = 'acckzz'\nfindSecretWord(words, master) -> solves within 10 guesses",
    starterCode: null,
    solution: `import java.util.*;

public class Solution {
    static class Master {
        String secret;
        int calls;
        int maxCalls;

        public Master(String secret, int maxCalls) {
            this.secret = secret;
            this.calls = 0;
            this.maxCalls = maxCalls;
        }

        public int guess(String word) {
            calls++;
            if (calls > maxCalls) return -1;
            int m = 0;
            for (int i = 0; i < 6; i++) if (word.charAt(i) == secret.charAt(i)) m++;
            return m;
        }
    }

    static int matches(String a, String b) {
        int m = 0;
        for (int i = 0; i < 6; i++) if (a.charAt(i) == b.charAt(i)) m++;
        return m;
    }

    public static void findSecretWord(String[] words, Master master) {
        List<String> candidates = new ArrayList<>(Arrays.asList(words));
        for (int round = 0; round < 10 && !candidates.isEmpty(); round++) {
            String pick = pickMinimax(candidates);
            int r = master.guess(pick);
            if (r == 6) return;
            List<String> next = new ArrayList<>();
            for (String w : candidates) {
                if (matches(w, pick) == r) next.add(w);
            }
            candidates = next;
        }
    }

    static String pickMinimax(List<String> candidates) {
        String best = candidates.get(0);
        int bestScore = Integer.MAX_VALUE;
        for (String c : candidates) {
            int[] buckets = new int[7];
            for (String d : candidates) {
                buckets[matches(c, d)]++;
            }
            int worst = 0;
            for (int b : buckets) if (b > worst) worst = b;
            if (worst < bestScore) {
                bestScore = worst;
                best = c;
            }
        }
        return best;
    }

    public static void main(String[] args) {
        String[] words = {"acckzz", "ccbazz", "eiowzz", "abcczz"};
        Master m = new Master("acckzz", 10);
        findSecretWord(words, m);
        System.out.println(m.calls <= 10);
    }
}
`,
    tests: [
      { name: "LC example acckzz", input: "", expectedOutput: "true", runnerCode: `String[] words = {"acckzz", "ccbazz", "eiowzz", "abcczz"}; Solution.Master m = new Solution.Master("acckzz", 10); Solution.findSecretWord(words, m); System.out.println(m.calls <= 10);` },
      { name: "secret ccbazz", input: "", expectedOutput: "true", runnerCode: `String[] words = {"acckzz", "ccbazz", "eiowzz", "abcczz"}; Solution.Master m = new Solution.Master("ccbazz", 10); Solution.findSecretWord(words, m); System.out.println(m.calls <= 10);` },
      { name: "secret eiowzz", input: "", expectedOutput: "true", runnerCode: `String[] words = {"acckzz", "ccbazz", "eiowzz", "abcczz"}; Solution.Master m = new Solution.Master("eiowzz", 10); Solution.findSecretWord(words, m); System.out.println(m.calls <= 10);` },
      { name: "secret abcczz", input: "", expectedOutput: "true", runnerCode: `String[] words = {"acckzz", "ccbazz", "eiowzz", "abcczz"}; Solution.Master m = new Solution.Master("abcczz", 10); Solution.findSecretWord(words, m); System.out.println(m.calls <= 10);` },
      { name: "single word aaaaaa", input: "", expectedOutput: "true", runnerCode: `String[] words = {"aaaaaa"}; Solution.Master m = new Solution.Master("aaaaaa", 10); Solution.findSecretWord(words, m); System.out.println(m.calls <= 10);` },
      { name: "five diverse words secret 1", input: "", expectedOutput: "true", runnerCode: `String[] words = {"gaxckt", "trlccr", "jxwhkz", "ycbfps", "peayuf"}; Solution.Master m = new Solution.Master("gaxckt", 10); Solution.findSecretWord(words, m); System.out.println(m.calls <= 10);` },
      { name: "five diverse words secret 2", input: "", expectedOutput: "true", runnerCode: `String[] words = {"gaxckt", "trlccr", "jxwhkz", "ycbfps", "peayuf"}; Solution.Master m = new Solution.Master("trlccr", 10); Solution.findSecretWord(words, m); System.out.println(m.calls <= 10);` },
      { name: "five diverse words secret 3", input: "", expectedOutput: "true", runnerCode: `String[] words = {"gaxckt", "trlccr", "jxwhkz", "ycbfps", "peayuf"}; Solution.Master m = new Solution.Master("jxwhkz", 10); Solution.findSecretWord(words, m); System.out.println(m.calls <= 10);` },
      { name: "five diverse words secret 4", input: "", expectedOutput: "true", runnerCode: `String[] words = {"gaxckt", "trlccr", "jxwhkz", "ycbfps", "peayuf"}; Solution.Master m = new Solution.Master("ycbfps", 10); Solution.findSecretWord(words, m); System.out.println(m.calls <= 10);` },
      { name: "five diverse words secret 5", input: "", expectedOutput: "true", runnerCode: `String[] words = {"gaxckt", "trlccr", "jxwhkz", "ycbfps", "peayuf"}; Solution.Master m = new Solution.Master("peayuf", 10); Solution.findSecretWord(words, m); System.out.println(m.calls <= 10);` },
      { name: "two words a", input: "", expectedOutput: "true", runnerCode: `String[] words = {"aaaaaa", "bbbbbb"}; Solution.Master m = new Solution.Master("aaaaaa", 10); Solution.findSecretWord(words, m); System.out.println(m.calls <= 10);` },
      { name: "two words b", input: "", expectedOutput: "true", runnerCode: `String[] words = {"aaaaaa", "bbbbbb"}; Solution.Master m = new Solution.Master("bbbbbb", 10); Solution.findSecretWord(words, m); System.out.println(m.calls <= 10);` }
    ]
  },
  {
    id: "max-visible-points",
    title: "Maximum Number of Visible Points",
    difficulty: "Hard",
    category: "Sliding Window",
    leetcode: "https://leetcode.com/problems/maximum-number-of-visible-points/",
    companies: ["Google", "Amazon", "Microsoft", "Facebook", "Apple"],
    description: "You are given an array points where points[i] = [xi, yi] and you stand at location [posX, posY]. You can rotate your field of view but not move. Given your view angle in degrees, return the maximum number of points you can see in a single field-of-view arc. Points at your exact location always count. Compute atan2 angles, sort, and use a sliding window over 2x-doubled angles to handle wraparound.",
    examples: "points = [[2,1],[2,2],[3,3]], angle = 90, location = [1,1] -> 3\npoints = [[2,1],[2,2],[3,4],[1,1]], angle = 90, location = [1,1] -> 4",
    starterCode: null,
    solution: `import java.util.*;

public class Solution {
    public static int visiblePoints(List<List<Integer>> points, int angle, List<Integer> location) {
        int sameLoc = 0;
        List<Double> angles = new ArrayList<>();
        int lx = location.get(0), ly = location.get(1);
        for (List<Integer> p : points) {
            int dx = p.get(0) - lx;
            int dy = p.get(1) - ly;
            if (dx == 0 && dy == 0) {
                sameLoc++;
            } else {
                angles.add(Math.atan2(dy, dx));
            }
        }
        Collections.sort(angles);
        int n = angles.size();
        List<Double> extended = new ArrayList<>(angles);
        for (double a : angles) extended.add(a + 2 * Math.PI);
        double window = Math.toRadians(angle);
        int best = 0;
        int left = 0;
        double eps = 1e-9;
        for (int right = 0; right < extended.size(); right++) {
            while (extended.get(right) - extended.get(left) > window + eps) {
                left++;
            }
            best = Math.max(best, right - left + 1);
        }
        return best + sameLoc;
    }

    static List<List<Integer>> toPoints(int[][] arr) {
        List<List<Integer>> out = new ArrayList<>();
        for (int[] p : arr) out.add(Arrays.asList(p[0], p[1]));
        return out;
    }

    static List<Integer> toLoc(int[] arr) {
        return Arrays.asList(arr[0], arr[1]);
    }

    public static void main(String[] args) {
        int[][] pts = {{2, 1}, {2, 2}, {3, 3}};
        System.out.println(visiblePoints(toPoints(pts), 90, toLoc(new int[]{1, 1})));
    }
}
`,
    tests: [
      { name: "LC example 1", input: "", expectedOutput: "3", runnerCode: `int[][] pts = {{2, 1}, {2, 2}, {3, 3}}; System.out.println(Solution.visiblePoints(Solution.toPoints(pts), 90, Solution.toLoc(new int[]{1, 1})));` },
      { name: "LC point at location", input: "", expectedOutput: "4", runnerCode: `int[][] pts = {{2, 1}, {2, 2}, {3, 4}, {1, 1}}; System.out.println(Solution.visiblePoints(Solution.toPoints(pts), 90, Solution.toLoc(new int[]{1, 1})));` },
      { name: "LC narrow angle one seen", input: "", expectedOutput: "1", runnerCode: `int[][] pts = {{1, 0}, {2, 1}}; System.out.println(Solution.visiblePoints(Solution.toPoints(pts), 13, Solution.toLoc(new int[]{1, 1})));` },
      { name: "point at origin location", input: "", expectedOutput: "1", runnerCode: `int[][] pts = {{0, 0}}; System.out.println(Solution.visiblePoints(Solution.toPoints(pts), 90, Solution.toLoc(new int[]{0, 0})));` },
      { name: "angle zero single on ray", input: "", expectedOutput: "1", runnerCode: `int[][] pts = {{1, 0}}; System.out.println(Solution.visiblePoints(Solution.toPoints(pts), 0, Solution.toLoc(new int[]{0, 0})));` },
      { name: "four axes angle zero", input: "", expectedOutput: "1", runnerCode: `int[][] pts = {{0, 1}, {1, 0}, {0, -1}, {-1, 0}}; System.out.println(Solution.visiblePoints(Solution.toPoints(pts), 0, Solution.toLoc(new int[]{0, 0})));` },
      { name: "four axes angle 90", input: "", expectedOutput: "2", runnerCode: `int[][] pts = {{0, 1}, {1, 0}, {0, -1}, {-1, 0}}; System.out.println(Solution.visiblePoints(Solution.toPoints(pts), 90, Solution.toLoc(new int[]{0, 0})));` },
      { name: "four axes full circle", input: "", expectedOutput: "4", runnerCode: `int[][] pts = {{0, 1}, {1, 0}, {0, -1}, {-1, 0}}; System.out.println(Solution.visiblePoints(Solution.toPoints(pts), 360, Solution.toLoc(new int[]{0, 0})));` },
      { name: "collinear points same ray", input: "", expectedOutput: "3", runnerCode: `int[][] pts = {{1, 1}, {2, 2}, {3, 3}}; System.out.println(Solution.visiblePoints(Solution.toPoints(pts), 0, Solution.toLoc(new int[]{0, 0})));` },
      { name: "diagonal points half angle", input: "", expectedOutput: "3", runnerCode: `int[][] pts = {{1, 1}, {1, -1}, {-1, 1}, {-1, -1}}; System.out.println(Solution.visiblePoints(Solution.toPoints(pts), 180, Solution.toLoc(new int[]{0, 0})));` },
      { name: "single far point", input: "", expectedOutput: "1", runnerCode: `int[][] pts = {{100, 100}}; System.out.println(Solution.visiblePoints(Solution.toPoints(pts), 180, Solution.toLoc(new int[]{0, 0})));` },
      { name: "two points tight wraparound", input: "", expectedOutput: "2", runnerCode: `int[][] pts = {{1, 1}, {1, -1}}; System.out.println(Solution.visiblePoints(Solution.toPoints(pts), 90, Solution.toLoc(new int[]{0, 0})));` }
    ]
  },
  {
    id: "trapping-rain-water-ii",
    title: "Trapping Rain Water II",
    difficulty: "Hard",
    category: "Matrix",
    leetcode: "https://leetcode.com/problems/trapping-rain-water-ii/",
    companies: ["Google", "Amazon", "Microsoft", "Facebook", "Apple"],
    description: "Given an m x n integer matrix heightMap representing the height of each unit cell, return the volume of water it can trap after raining. Use a min-heap (priority queue) seeded with all boundary cells, expanding inward and accumulating water equal to max(0, current_max_boundary - cell_height) for each visited interior cell (BFS from the outside using max-so-far barriers).",
    examples: "heightMap = [[1,4,3,1,3,2],[3,2,1,3,2,4],[2,3,3,2,3,1]] -> 4\nheightMap = [[3,3,3,3,3],[3,2,2,2,3],[3,2,1,2,3],[3,2,2,2,3],[3,3,3,3,3]] -> 10",
    starterCode: null,
    solution: `import java.util.*;

public class Solution {
    public static int trapRainWater(int[][] heightMap) {
        if (heightMap == null || heightMap.length == 0 || heightMap[0].length == 0) return 0;
        int m = heightMap.length, n = heightMap[0].length;
        if (m < 3 || n < 3) return 0;
        boolean[][] visited = new boolean[m][n];
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[2] - b[2]);
        for (int i = 0; i < m; i++) {
            pq.offer(new int[]{i, 0, heightMap[i][0]});
            pq.offer(new int[]{i, n - 1, heightMap[i][n - 1]});
            visited[i][0] = true;
            visited[i][n - 1] = true;
        }
        for (int j = 1; j < n - 1; j++) {
            pq.offer(new int[]{0, j, heightMap[0][j]});
            pq.offer(new int[]{m - 1, j, heightMap[m - 1][j]});
            visited[0][j] = true;
            visited[m - 1][j] = true;
        }
        int[][] dirs = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};
        int water = 0;
        while (!pq.isEmpty()) {
            int[] cur = pq.poll();
            int r = cur[0], c = cur[1], h = cur[2];
            for (int[] d : dirs) {
                int nr = r + d[0], nc = c + d[1];
                if (nr < 0 || nr >= m || nc < 0 || nc >= n || visited[nr][nc]) continue;
                visited[nr][nc] = true;
                water += Math.max(0, h - heightMap[nr][nc]);
                pq.offer(new int[]{nr, nc, Math.max(h, heightMap[nr][nc])});
            }
        }
        return water;
    }

    public static void main(String[] args) {
        int[][] h = {{1, 4, 3, 1, 3, 2}, {3, 2, 1, 3, 2, 4}, {2, 3, 3, 2, 3, 1}};
        System.out.println(trapRainWater(h));
    }
}
`,
    tests: [
      { name: "LC example 1", input: "", expectedOutput: "4", runnerCode: `int[][] h = {{1, 4, 3, 1, 3, 2}, {3, 2, 1, 3, 2, 4}, {2, 3, 3, 2, 3, 1}}; System.out.println(Solution.trapRainWater(h));` },
      { name: "LC example 2 basin", input: "", expectedOutput: "10", runnerCode: `int[][] h = {{3, 3, 3, 3, 3}, {3, 2, 2, 2, 3}, {3, 2, 1, 2, 3}, {3, 2, 2, 2, 3}, {3, 3, 3, 3, 3}}; System.out.println(Solution.trapRainWater(h));` },
      { name: "small basin 3x4", input: "", expectedOutput: "2", runnerCode: `int[][] h = {{1, 1, 1, 1}, {1, 0, 0, 1}, {1, 1, 1, 1}}; System.out.println(Solution.trapRainWater(h));` },
      { name: "empty matrix", input: "", expectedOutput: "0", runnerCode: `int[][] h = {{}}; System.out.println(Solution.trapRainWater(h));` },
      { name: "single cell", input: "", expectedOutput: "0", runnerCode: `int[][] h = {{1}}; System.out.println(Solution.trapRainWater(h));` },
      { name: "two by two no interior", input: "", expectedOutput: "0", runnerCode: `int[][] h = {{1, 1}, {1, 1}}; System.out.println(Solution.trapRainWater(h));` },
      { name: "large basin depth 5", input: "", expectedOutput: "20", runnerCode: `int[][] h = {{5, 5, 5, 5}, {5, 0, 0, 5}, {5, 0, 0, 5}, {5, 5, 5, 5}}; System.out.println(Solution.trapRainWater(h));` },
      { name: "basin with island", input: "", expectedOutput: "19", runnerCode: `int[][] h = {{5, 5, 5, 5}, {5, 0, 1, 5}, {5, 0, 0, 5}, {5, 5, 5, 5}}; System.out.println(Solution.trapRainWater(h));` },
      { name: "tiny 3x3 well", input: "", expectedOutput: "1", runnerCode: `int[][] h = {{1, 1, 1}, {1, 0, 1}, {1, 1, 1}}; System.out.println(Solution.trapRainWater(h));` },
      { name: "tall walls deep well", input: "", expectedOutput: "10", runnerCode: `int[][] h = {{10, 10, 10}, {10, 0, 10}, {10, 10, 10}}; System.out.println(Solution.trapRainWater(h));` },
      { name: "flat surface no water", input: "", expectedOutput: "0", runnerCode: `int[][] h = {{2, 2, 2, 2}, {2, 2, 2, 2}, {2, 2, 2, 2}}; System.out.println(Solution.trapRainWater(h));` },
      { name: "sloped no trap", input: "", expectedOutput: "0", runnerCode: `int[][] h = {{1, 2, 3}, {1, 2, 3}, {1, 2, 3}}; System.out.println(Solution.trapRainWater(h));` }
    ]
  },

];

// ─── Category metadata for display ───
const DSA_CATEGORIES = [
  { name: 'Fundamentals',        icon: '🎯', color: '#0ea5e9' },
  { name: 'Arrays',              icon: '📊', color: '#3b82f6' },
  { name: 'Strings',             icon: '🔤', color: '#8b5cf6' },
  { name: 'Matrix',              icon: '🔢', color: '#0891b2' },
  { name: 'Linked Lists',        icon: '🔗', color: '#06b6d4' },
  { name: 'Trees',               icon: '🌳', color: '#22c55e' },
  { name: 'Graphs',              icon: '🕸️', color: '#f97316' },
  { name: 'Dynamic Programming', icon: '🧩', color: '#ef4444' },
  { name: 'Sorting & Searching', icon: '🔍', color: '#14b8a6' },
  { name: 'Stacks & Queues',     icon: '📚', color: '#a855f7' },
  { name: 'Hash Maps',           icon: '#️⃣', color: '#f59e0b' },
  { name: 'Backtracking',        icon: '🔙', color: '#ec4899' },
  { name: 'Two Pointers',        icon: '👆', color: '#6366f1' },
  { name: 'Sliding Window',      icon: '🪟', color: '#7c3aed' },
  { name: 'Intervals',           icon: '📐', color: '#10b981' },
  { name: 'Greedy',              icon: '💰', color: '#eab308' },
  { name: 'Heap',                icon: '⛰️', color: '#84cc16' },
];
