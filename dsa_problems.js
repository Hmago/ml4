// ─── DSA Problems Data ───
// Google's most frequently asked Data Structures & Algorithms problems
// organized by category with Java starter code

const DSA_PROBLEMS = [

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
    starterCode: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        // Your solution here

        return new int[]{};
    }

    public static void main(String[] args) {
        int[] result = twoSum(new int[]{2, 7, 11, 15}, 9);
        System.out.println(Arrays.toString(result)); // [0, 1]

        result = twoSum(new int[]{3, 2, 4}, 6);
        System.out.println(Arrays.toString(result)); // [1, 2]
    }
}`
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
    starterCode: `public class Main {
    public static int maxProfit(int[] prices) {
        // Your solution here

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(maxProfit(new int[]{7,1,5,3,6,4})); // 5
        System.out.println(maxProfit(new int[]{7,6,4,3,1}));    // 0
    }
}`
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
    starterCode: `public class Main {
    public static int maxSubArray(int[] nums) {
        // Your solution here (Kadane's Algorithm)

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(maxSubArray(new int[]{-2,1,-3,4,-1,2,1,-5,4})); // 6
        System.out.println(maxSubArray(new int[]{1}));                       // 1
        System.out.println(maxSubArray(new int[]{5,4,-1,7,8}));             // 23
    }
}`
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
    starterCode: `import java.util.*;

public class Main {
    public static int[] productExceptSelf(int[] nums) {
        // Your solution here — O(n) time, no division

        return new int[]{};
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(productExceptSelf(new int[]{1,2,3,4})));    // [24,12,8,6]
        System.out.println(Arrays.toString(productExceptSelf(new int[]{-1,1,0,-3,3}))); // [0,0,9,0,0]
    }
}`
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
    starterCode: `import java.util.*;

public class Main {
    public static int[][] merge(int[][] intervals) {
        // Your solution here

        return new int[][]{};
    }

    public static void main(String[] args) {
        int[][] result = merge(new int[][]{{1,3},{2,6},{8,10},{15,18}});
        for (int[] r : result) System.out.print(Arrays.toString(r) + " ");
        // [1,6] [8,10] [15,18]
        System.out.println();

        result = merge(new int[][]{{1,4},{4,5}});
        for (int[] r : result) System.out.print(Arrays.toString(r) + " ");
        // [1,5]
    }
}`
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
    starterCode: `public class Main {
    public static boolean isAnagram(String s, String t) {
        // Your solution here

        return false;
    }

    public static void main(String[] args) {
        System.out.println(isAnagram("anagram", "nagaram")); // true
        System.out.println(isAnagram("rat", "car"));         // false
    }
}`
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
    starterCode: `import java.util.*;

public class Main {
    public static int lengthOfLongestSubstring(String s) {
        // Your solution here — Sliding Window approach

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(lengthOfLongestSubstring("abcabcbb")); // 3
        System.out.println(lengthOfLongestSubstring("bbbbb"));    // 1
        System.out.println(lengthOfLongestSubstring("pwwkew"));   // 3
    }
}`
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
    starterCode: `import java.util.*;

public class Main {
    public static List<List<String>> groupAnagrams(String[] strs) {
        // Your solution here

        return new ArrayList<>();
    }

    public static void main(String[] args) {
        List<List<String>> result = groupAnagrams(
            new String[]{"eat","tea","tan","ate","nat","bat"}
        );
        for (List<String> group : result) {
            System.out.println(group);
        }
    }
}`
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
    starterCode: `public class Main {
    static class ListNode {
        int val;
        ListNode next;
        ListNode(int val) { this.val = val; }
    }

    public static ListNode reverseList(ListNode head) {
        // Your solution here (iterative or recursive)

        return null;
    }

    // Helper: create list from array
    static ListNode fromArray(int[] arr) {
        ListNode dummy = new ListNode(0);
        ListNode cur = dummy;
        for (int v : arr) { cur.next = new ListNode(v); cur = cur.next; }
        return dummy.next;
    }

    // Helper: print list
    static void printList(ListNode head) {
        while (head != null) {
            System.out.print(head.val + (head.next != null ? " -> " : ""));
            head = head.next;
        }
        System.out.println();
    }

    public static void main(String[] args) {
        ListNode head = fromArray(new int[]{1,2,3,4,5});
        printList(reverseList(head)); // 5 -> 4 -> 3 -> 2 -> 1
    }
}`
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
    starterCode: `public class Main {
    static class ListNode {
        int val;
        ListNode next;
        ListNode(int val) { this.val = val; }
    }

    public static ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        // Your solution here

        return null;
    }

    static ListNode fromArray(int[] arr) {
        ListNode dummy = new ListNode(0);
        ListNode cur = dummy;
        for (int v : arr) { cur.next = new ListNode(v); cur = cur.next; }
        return dummy.next;
    }

    static void printList(ListNode head) {
        while (head != null) {
            System.out.print(head.val + (head.next != null ? " -> " : ""));
            head = head.next;
        }
        System.out.println();
    }

    public static void main(String[] args) {
        ListNode l1 = fromArray(new int[]{1,2,4});
        ListNode l2 = fromArray(new int[]{1,3,4});
        printList(mergeTwoLists(l1, l2)); // 1 -> 1 -> 2 -> 3 -> 4 -> 4
    }
}`
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
    starterCode: `public class Main {
    static class ListNode {
        int val;
        ListNode next;
        ListNode(int val) { this.val = val; }
    }

    public static boolean hasCycle(ListNode head) {
        // Your solution here — Floyd's Tortoise and Hare

        return false;
    }

    public static void main(String[] args) {
        // Test 1: cycle
        ListNode n1 = new ListNode(3);
        ListNode n2 = new ListNode(2);
        ListNode n3 = new ListNode(0);
        ListNode n4 = new ListNode(-4);
        n1.next = n2; n2.next = n3; n3.next = n4; n4.next = n2; // cycle
        System.out.println(hasCycle(n1)); // true

        // Test 2: no cycle
        ListNode a = new ListNode(1);
        a.next = new ListNode(2);
        System.out.println(hasCycle(a)); // false
    }
}`
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
    starterCode: `public class Main {
    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    public static int maxDepth(TreeNode root) {
        // Your solution here

        return 0;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(3);
        root.left = new TreeNode(9);
        root.right = new TreeNode(20);
        root.right.left = new TreeNode(15);
        root.right.right = new TreeNode(7);
        System.out.println(maxDepth(root)); // 3
    }
}`
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
    starterCode: `public class Main {
    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    public static boolean isValidBST(TreeNode root) {
        // Your solution here — use min/max bounds or inorder traversal

        return false;
    }

    public static void main(String[] args) {
        // Valid BST: [2,1,3]
        TreeNode t1 = new TreeNode(2);
        t1.left = new TreeNode(1);
        t1.right = new TreeNode(3);
        System.out.println(isValidBST(t1)); // true

        // Invalid BST: [5,1,4,null,null,3,6]
        TreeNode t2 = new TreeNode(5);
        t2.left = new TreeNode(1);
        t2.right = new TreeNode(4);
        t2.right.left = new TreeNode(3);
        t2.right.right = new TreeNode(6);
        System.out.println(isValidBST(t2)); // false
    }
}`
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
    starterCode: `import java.util.*;

public class Main {
    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    public static List<List<Integer>> levelOrder(TreeNode root) {
        // Your solution here — use BFS with Queue

        return new ArrayList<>();
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(3);
        root.left = new TreeNode(9);
        root.right = new TreeNode(20);
        root.right.left = new TreeNode(15);
        root.right.right = new TreeNode(7);
        System.out.println(levelOrder(root)); // [[3], [9, 20], [15, 7]]
    }
}`
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
    starterCode: `public class Main {
    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    public static TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        // Your solution here

        return null;
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(3);
        TreeNode five = new TreeNode(5);
        TreeNode one = new TreeNode(1);
        root.left = five;
        root.right = one;
        five.left = new TreeNode(6);
        five.right = new TreeNode(2);
        one.left = new TreeNode(0);
        one.right = new TreeNode(8);

        TreeNode lca = lowestCommonAncestor(root, five, one);
        System.out.println(lca.val); // 3
    }
}`
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
    starterCode: `public class Main {
    public static int numIslands(char[][] grid) {
        // Your solution here — DFS or BFS flood fill

        return 0;
    }

    public static void main(String[] args) {
        char[][] grid = {
            {'1','1','0','0','0'},
            {'1','1','0','0','0'},
            {'0','0','1','0','0'},
            {'0','0','0','1','1'}
        };
        System.out.println(numIslands(grid)); // 3
    }
}`
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
    starterCode: `import java.util.*;

public class Main {
    static class Node {
        public int val;
        public List<Node> neighbors;
        public Node(int val) {
            this.val = val;
            this.neighbors = new ArrayList<>();
        }
    }

    public static Node cloneGraph(Node node) {
        // Your solution here — BFS/DFS with HashMap for visited

        return null;
    }

    public static void main(String[] args) {
        // Build graph: 1--2, 1--4, 2--3, 3--4
        Node n1 = new Node(1), n2 = new Node(2);
        Node n3 = new Node(3), n4 = new Node(4);
        n1.neighbors.addAll(Arrays.asList(n2, n4));
        n2.neighbors.addAll(Arrays.asList(n1, n3));
        n3.neighbors.addAll(Arrays.asList(n2, n4));
        n4.neighbors.addAll(Arrays.asList(n1, n3));

        Node clone = cloneGraph(n1);
        System.out.println("Clone val: " + clone.val); // 1
        System.out.println("Is deep copy: " + (clone != n1)); // true
        System.out.println("Neighbor count: " + clone.neighbors.size()); // 2
    }
}`
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
    starterCode: `import java.util.*;

public class Main {
    public static boolean canFinish(int numCourses, int[][] prerequisites) {
        // Your solution here — Topological Sort (BFS/Kahn's or DFS cycle detection)

        return false;
    }

    public static void main(String[] args) {
        System.out.println(canFinish(2, new int[][]{{1,0}}));         // true
        System.out.println(canFinish(2, new int[][]{{1,0},{0,1}}));   // false
        System.out.println(canFinish(4, new int[][]{{1,0},{2,1},{3,2}})); // true
    }
}`
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
    starterCode: `import java.util.*;

public class Main {
    public static int ladderLength(String beginWord, String endWord, List<String> wordList) {
        // Your solution here — BFS shortest path

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(ladderLength("hit", "cog",
            Arrays.asList("hot","dot","dog","lot","log","cog"))); // 5

        System.out.println(ladderLength("hit", "cog",
            Arrays.asList("hot","dot","dog","lot","log")));       // 0 (no path)
    }
}`
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
    starterCode: `public class Main {
    public static int climbStairs(int n) {
        // Your solution here — DP (Fibonacci variant)

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(climbStairs(2));  // 2
        System.out.println(climbStairs(3));  // 3
        System.out.println(climbStairs(5));  // 8
        System.out.println(climbStairs(10)); // 89
    }
}`
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
    starterCode: `public class Main {
    public static int coinChange(int[] coins, int amount) {
        // Your solution here — Bottom-up DP

        return -1;
    }

    public static void main(String[] args) {
        System.out.println(coinChange(new int[]{1,5,11}, 11));   // 1
        System.out.println(coinChange(new int[]{1,5,11}, 15));   // 3 (5+5+5)
        System.out.println(coinChange(new int[]{2}, 3));          // -1
        System.out.println(coinChange(new int[]{1,2,5}, 11));    // 3 (5+5+1)
    }
}`
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
    starterCode: `import java.util.*;

public class Main {
    public static int lengthOfLIS(int[] nums) {
        // Your solution here — O(n²) DP or O(n log n) with binary search

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(lengthOfLIS(new int[]{10,9,2,5,3,7,101,18})); // 4
        System.out.println(lengthOfLIS(new int[]{0,1,0,3,2,3}));          // 4
        System.out.println(lengthOfLIS(new int[]{7,7,7,7}));              // 1
    }
}`
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
    starterCode: `import java.util.*;

public class Main {
    public static boolean wordBreak(String s, List<String> wordDict) {
        // Your solution here — DP boolean array

        return false;
    }

    public static void main(String[] args) {
        System.out.println(wordBreak("leetcode", Arrays.asList("leet","code")));          // true
        System.out.println(wordBreak("applepenapple", Arrays.asList("apple","pen")));     // true
        System.out.println(wordBreak("catsandog", Arrays.asList("cats","dog","sand","and","cat"))); // false
    }
}`
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
    starterCode: `public class Main {
    public static int search(int[] nums, int target) {
        // Your solution here

        return -1;
    }

    public static void main(String[] args) {
        System.out.println(search(new int[]{-1,0,3,5,9,12}, 9));  // 4
        System.out.println(search(new int[]{-1,0,3,5,9,12}, 2));  // -1
    }
}`
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
    starterCode: `public class Main {
    public static int search(int[] nums, int target) {
        // Your solution here — modified binary search

        return -1;
    }

    public static void main(String[] args) {
        System.out.println(search(new int[]{4,5,6,7,0,1,2}, 0));  // 4
        System.out.println(search(new int[]{4,5,6,7,0,1,2}, 3));  // -1
        System.out.println(search(new int[]{1}, 0));               // -1
    }
}`
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
    starterCode: `import java.util.*;

public class Main {
    public static int findKthLargest(int[] nums, int k) {
        // Your solution here — Heap (O(n log k)) or Quickselect (O(n) avg)

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(findKthLargest(new int[]{3,2,1,5,6,4}, 2));    // 5
        System.out.println(findKthLargest(new int[]{3,2,3,1,2,4,5,5,6}, 4)); // 4
    }
}`
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
    starterCode: `import java.util.*;

public class Main {
    public static boolean isValid(String s) {
        // Your solution here — use a Stack

        return false;
    }

    public static void main(String[] args) {
        System.out.println(isValid("()"));     // true
        System.out.println(isValid("()[]{}"));  // true
        System.out.println(isValid("(]"));     // false
        System.out.println(isValid("([)]"));   // false
        System.out.println(isValid("{[]}"));   // true
    }
}`
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
    starterCode: `import java.util.*;

public class Main {
    static class MinStack {
        // Your implementation here

        public MinStack() {

        }

        public void push(int val) {

        }

        public void pop() {

        }

        public int top() {
            return 0;
        }

        public int getMin() {
            return 0;
        }
    }

    public static void main(String[] args) {
        MinStack ms = new MinStack();
        ms.push(-2);
        ms.push(0);
        ms.push(-3);
        System.out.println(ms.getMin()); // -3
        ms.pop();
        System.out.println(ms.top());    // 0
        System.out.println(ms.getMin()); // -2
    }
}`
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
    starterCode: `import java.util.*;

public class Main {
    public static int[] topKFrequent(int[] nums, int k) {
        // Your solution here — HashMap + Heap or Bucket Sort

        return new int[]{};
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(topKFrequent(new int[]{1,1,1,2,2,3}, 2))); // [1,2]
        System.out.println(Arrays.toString(topKFrequent(new int[]{1}, 1)));             // [1]
    }
}`
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
    starterCode: `import java.util.*;

public class Main {
    static class LRUCache {
        // Your implementation here
        // Hint: HashMap + Doubly Linked List, or LinkedHashMap

        public LRUCache(int capacity) {

        }

        public int get(int key) {
            return -1;
        }

        public void put(int key, int value) {

        }
    }

    public static void main(String[] args) {
        LRUCache cache = new LRUCache(2);
        cache.put(1, 1);
        cache.put(2, 2);
        System.out.println(cache.get(1));  // 1
        cache.put(3, 3);                   // evicts key 2
        System.out.println(cache.get(2));  // -1
        cache.put(4, 4);                   // evicts key 1
        System.out.println(cache.get(1));  // -1
        System.out.println(cache.get(3));  // 3
        System.out.println(cache.get(4));  // 4
    }
}`
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
    starterCode: `import java.util.*;

public class Main {
    public static List<List<Integer>> subsets(int[] nums) {
        // Your solution here — Backtracking
        List<List<Integer>> result = new ArrayList<>();

        return result;
    }

    public static void main(String[] args) {
        System.out.println(subsets(new int[]{1,2,3}));
        // [[], [1], [1,2], [1,2,3], [1,3], [2], [2,3], [3]]
    }
}`
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
    starterCode: `import java.util.*;

public class Main {
    public static List<List<Integer>> permute(int[] nums) {
        // Your solution here — Backtracking with used[] array
        List<List<Integer>> result = new ArrayList<>();

        return result;
    }

    public static void main(String[] args) {
        System.out.println(permute(new int[]{1,2,3}));
        // [[1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]]

        System.out.println(permute(new int[]{0,1}));
        // [[0,1], [1,0]]
    }
}`
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
    starterCode: `public class Main {
    public static int maxArea(int[] height) {
        // Your solution here — Two Pointers from both ends

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(maxArea(new int[]{1,8,6,2,5,4,8,3,7})); // 49
        System.out.println(maxArea(new int[]{1,1}));                 // 1
    }
}`
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
    starterCode: `import java.util.*;

public class Main {
    public static List<List<Integer>> threeSum(int[] nums) {
        // Your solution here — Sort + Two Pointers

        return new ArrayList<>();
    }

    public static void main(String[] args) {
        System.out.println(threeSum(new int[]{-1,0,1,2,-1,-4}));
        // [[-1,-1,2], [-1,0,1]]

        System.out.println(threeSum(new int[]{0,1,1}));
        // []

        System.out.println(threeSum(new int[]{0,0,0}));
        // [[0,0,0]]
    }
}`
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
    starterCode: `import java.util.*;

public class Main {
    public static String minWindow(String s, String t) {
        // Your solution here — Sliding Window with frequency map

        return "";
    }

    public static void main(String[] args) {
        System.out.println(minWindow("ADOBECODEBANC", "ABC")); // "BANC"
        System.out.println(minWindow("a", "a"));                // "a"
        System.out.println(minWindow("a", "aa"));               // ""
    }
}`
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
    starterCode: `import java.util.*;

public class Main {
    public static int minMeetingRooms(int[][] intervals) {
        // Your solution here — Sort + Min Heap, or sweep line

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(minMeetingRooms(new int[][]{{0,30},{5,10},{15,20}})); // 2
        System.out.println(minMeetingRooms(new int[][]{{7,10},{2,4}}));           // 1
        System.out.println(minMeetingRooms(new int[][]{{1,5},{2,6},{3,7},{4,8}})); // 4
    }
}`
  }

];

// ─── Category metadata for display ───
const DSA_CATEGORIES = [
  { name: 'Arrays',              icon: '📊', color: '#3b82f6' },
  { name: 'Strings',             icon: '🔤', color: '#8b5cf6' },
  { name: 'Linked Lists',        icon: '🔗', color: '#06b6d4' },
  { name: 'Trees',               icon: '🌳', color: '#22c55e' },
  { name: 'Graphs',              icon: '🕸️', color: '#f97316' },
  { name: 'Dynamic Programming', icon: '🧩', color: '#ef4444' },
  { name: 'Sorting & Searching', icon: '🔍', color: '#14b8a6' },
  { name: 'Stacks & Queues',     icon: '📚', color: '#a855f7' },
  { name: 'Hash Maps',           icon: '#️⃣', color: '#f59e0b' },
  { name: 'Backtracking',        icon: '🔙', color: '#ec4899' },
  { name: 'Two Pointers',        icon: '👆', color: '#6366f1' },
  { name: 'Intervals',           icon: '📐', color: '#10b981' },
];
