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
    starterCode: `public class Main {
    public static int linearSearch(int[] nums, int target) {
        // Your solution here — scan each element in order

        return -1;
    }

    public static void main(String[] args) {
        System.out.println(linearSearch(new int[]{3, 7, 1, 9, 4}, 9));   // 3
        System.out.println(linearSearch(new int[]{3, 7, 1, 9, 4}, 8));   // -1
        System.out.println(linearSearch(new int[]{}, 5));                 // -1
        System.out.println(linearSearch(new int[]{5, 1, 2}, 5));          // 0
        System.out.println(linearSearch(new int[]{1, 2, 3}, 3));          // 2
        System.out.println(linearSearch(new int[]{42}, 42));              // 0
        System.out.println(linearSearch(new int[]{1, 1, 1, 1}, 1));       // 0
        System.out.println(linearSearch(new int[]{-3, -1, -7}, -1));      // 1
        System.out.println(linearSearch(new int[]{42}, 7));               // -1
        System.out.println(linearSearch(new int[]{0, 0, 0}, 0));          // 0
        System.out.println(linearSearch(new int[]{1, 2, 3, 4, 5}, 0));    // -1
    }
}`
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
    starterCode: `public class Main {
    public static int binarySearch(int[] nums, int target) {
        int left = 0, right = nums.length - 1;

        // Your solution here — iterative binary search

        return -1;
    }

    public static void main(String[] args) {
        System.out.println(binarySearch(new int[]{1, 3, 5, 7, 9, 11}, 7));    // 3
        System.out.println(binarySearch(new int[]{1, 3, 5, 7, 9, 11}, 4));    // -1
        System.out.println(binarySearch(new int[]{1}, 1));                     // 0
        System.out.println(binarySearch(new int[]{}, 1));                      // -1
        System.out.println(binarySearch(new int[]{1, 3, 5, 7, 9}, 1));         // 0
        System.out.println(binarySearch(new int[]{1, 3, 5, 7, 9}, 9));         // 4
        System.out.println(binarySearch(new int[]{1, 3, 5, 7, 9}, 100));       // -1
        System.out.println(binarySearch(new int[]{1, 3, 5, 7, 9}, -5));        // -1
        System.out.println(binarySearch(new int[]{2, 4}, 2));                  // 0
        System.out.println(binarySearch(new int[]{2, 4}, 4));                  // 1
        System.out.println(binarySearch(new int[]{-9, -5, -1, 0, 3, 8}, -1));  // 2
        System.out.println(binarySearch(new int[]{1, 1, 1, 1, 1}, 1));         // 2
    }
}`
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
    starterCode: `import java.util.*;

public class Main {
    public static void bubbleSort(int[] nums) {
        // Your solution here — in-place, compare & swap adjacent pairs

    }

    public static void main(String[] args) {
        int[] a = {5, 2, 8, 1, 9}; bubbleSort(a);
        System.out.println(Arrays.toString(a));  // [1, 2, 5, 8, 9]
        int[] b = {3, 3, 1, 2}; bubbleSort(b);
        System.out.println(Arrays.toString(b));  // [1, 2, 3, 3]
        int[] c = {}; bubbleSort(c);
        System.out.println(Arrays.toString(c));  // []
        int[] d = {7}; bubbleSort(d);
        System.out.println(Arrays.toString(d));  // [7]
        int[] e = {2, 1}; bubbleSort(e);
        System.out.println(Arrays.toString(e));  // [1, 2]
        int[] f = {1, 2, 3, 4, 5}; bubbleSort(f);
        System.out.println(Arrays.toString(f));  // [1, 2, 3, 4, 5]
        int[] g = {5, 4, 3, 2, 1}; bubbleSort(g);
        System.out.println(Arrays.toString(g));  // [1, 2, 3, 4, 5]
        int[] h = {3, 3, 3, 3}; bubbleSort(h);
        System.out.println(Arrays.toString(h));  // [3, 3, 3, 3]
        int[] i = {-3, 2, -1, 0, 5}; bubbleSort(i);
        System.out.println(Arrays.toString(i));  // [-3, -1, 0, 2, 5]
        int[] j = {0, -1, -2, 1, 2}; bubbleSort(j);
        System.out.println(Arrays.toString(j));  // [-2, -1, 0, 1, 2]
        int[] k = {10, 20, 10, 20, 10}; bubbleSort(k);
        System.out.println(Arrays.toString(k));  // [10, 10, 10, 20, 20]
    }
}`
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
    starterCode: `import java.util.*;

public class Main {
    public static void selectionSort(int[] nums) {
        // Your solution here — find min in unsorted region, swap into place

    }

    public static void main(String[] args) {
        int[] a = {64, 25, 12, 22, 11}; selectionSort(a);
        System.out.println(Arrays.toString(a));  // [11, 12, 22, 25, 64]
        int[] b = {}; selectionSort(b);
        System.out.println(Arrays.toString(b));  // []
        int[] c = {42}; selectionSort(c);
        System.out.println(Arrays.toString(c));  // [42]
        int[] d = {2, 1}; selectionSort(d);
        System.out.println(Arrays.toString(d));  // [1, 2]
        int[] e = {1, 2, 3, 4, 5}; selectionSort(e);
        System.out.println(Arrays.toString(e));  // [1, 2, 3, 4, 5]
        int[] f = {5, 4, 3, 2, 1}; selectionSort(f);
        System.out.println(Arrays.toString(f));  // [1, 2, 3, 4, 5]
        int[] g = {3, 3, 3, 3}; selectionSort(g);
        System.out.println(Arrays.toString(g));  // [3, 3, 3, 3]
        int[] h = {-5, 0, 5, -10, 10}; selectionSort(h);
        System.out.println(Arrays.toString(h));  // [-10, -5, 0, 5, 10]
        int[] i = {7, 7, 1, 7, 1}; selectionSort(i);
        System.out.println(Arrays.toString(i));  // [1, 1, 7, 7, 7]
        int[] j = {100, -100}; selectionSort(j);
        System.out.println(Arrays.toString(j));  // [-100, 100]
        int[] k = {0, 0, 0, 1, -1}; selectionSort(k);
        System.out.println(Arrays.toString(k));  // [-1, 0, 0, 0, 1]
    }
}`
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
    starterCode: `import java.util.*;

public class Main {
    public static void insertionSort(int[] nums) {
        // Your solution here — shift larger elements right, insert current

    }

    public static void main(String[] args) {
        int[] a = {12, 11, 13, 5, 6}; insertionSort(a);
        System.out.println(Arrays.toString(a));  // [5, 6, 11, 12, 13]
        int[] b = {}; insertionSort(b);
        System.out.println(Arrays.toString(b));  // []
        int[] c = {1}; insertionSort(c);
        System.out.println(Arrays.toString(c));  // [1]
        int[] d = {2, 1}; insertionSort(d);
        System.out.println(Arrays.toString(d));  // [1, 2]
        int[] e = {1, 2, 3, 4, 5}; insertionSort(e);
        System.out.println(Arrays.toString(e));  // [1, 2, 3, 4, 5]
        int[] f = {5, 4, 3, 2, 1}; insertionSort(f);
        System.out.println(Arrays.toString(f));  // [1, 2, 3, 4, 5]
        int[] g = {4, 4, 4, 4}; insertionSort(g);
        System.out.println(Arrays.toString(g));  // [4, 4, 4, 4]
        int[] h = {-1, 3, -5, 2, 0}; insertionSort(h);
        System.out.println(Arrays.toString(h));  // [-5, -1, 0, 2, 3]
        int[] i = {1, 5, 2, 4, 3}; insertionSort(i);
        System.out.println(Arrays.toString(i));  // [1, 2, 3, 4, 5]
        int[] j = {9, 8, 7, 6, 5, 4, 3, 2, 1}; insertionSort(j);
        System.out.println(Arrays.toString(j));  // [1, 2, 3, 4, 5, 6, 7, 8, 9]
        int[] k = {0, 0, 1, 1, 2, 2}; insertionSort(k);
        System.out.println(Arrays.toString(k));  // [0, 0, 1, 1, 2, 2]
    }
}`
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
    starterCode: `import java.util.*;

public class Main {
    public static void mergeSort(int[] nums) {
        if (nums == null || nums.length < 2) return;
        // Your solution here — recursive split then merge

    }

    // Helper: merge two sorted halves nums[left..mid] and nums[mid+1..right]
    private static void merge(int[] nums, int left, int mid, int right) {
        // Your merge logic here
    }

    public static void main(String[] args) {
        int[] a = {38, 27, 43, 3, 9, 82, 10}; mergeSort(a);
        System.out.println(Arrays.toString(a));  // [3, 9, 10, 27, 38, 43, 82]
        int[] b = {1}; mergeSort(b);
        System.out.println(Arrays.toString(b));  // [1]
        int[] c = {}; mergeSort(c);
        System.out.println(Arrays.toString(c));  // []
        int[] d = {2, 1}; mergeSort(d);
        System.out.println(Arrays.toString(d));  // [1, 2]
        int[] e = {1, 2}; mergeSort(e);
        System.out.println(Arrays.toString(e));  // [1, 2]
        int[] f = {1, 2, 3, 4, 5}; mergeSort(f);
        System.out.println(Arrays.toString(f));  // [1, 2, 3, 4, 5]
        int[] g = {5, 4, 3, 2, 1}; mergeSort(g);
        System.out.println(Arrays.toString(g));  // [1, 2, 3, 4, 5]
        int[] h = {7, 7, 7, 7}; mergeSort(h);
        System.out.println(Arrays.toString(h));  // [7, 7, 7, 7]
        int[] i = {-3, 5, -8, 2, 0, 7}; mergeSort(i);
        System.out.println(Arrays.toString(i));  // [-8, -3, 0, 2, 5, 7]
        int[] j = {1, 3, 2, 4, 6, 5, 7}; mergeSort(j);
        System.out.println(Arrays.toString(j));  // [1, 2, 3, 4, 5, 6, 7]
        int[] k = {100, 50, 25, 12, 6, 3, 1}; mergeSort(k);
        System.out.println(Arrays.toString(k));  // [1, 3, 6, 12, 25, 50, 100]
    }
}`
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
    starterCode: `import java.util.*;

public class Main {
    public static void quickSort(int[] nums) {
        quickSort(nums, 0, nums.length - 1);
    }

    private static void quickSort(int[] nums, int low, int high) {
        // Your solution here — partition and recurse

    }

    // Helper: partition nums[low..high] around a pivot; return the pivot's final index
    private static int partition(int[] nums, int low, int high) {
        // Your partition logic here (Lomuto or Hoare scheme)
        return high;
    }

    public static void main(String[] args) {
        int[] a = {10, 7, 8, 9, 1, 5}; quickSort(a);
        System.out.println(Arrays.toString(a));  // [1, 5, 7, 8, 9, 10]
        int[] b = {3, 3, 3}; quickSort(b);
        System.out.println(Arrays.toString(b));  // [3, 3, 3]
        int[] c = {}; quickSort(c);
        System.out.println(Arrays.toString(c));  // []
        int[] d = {1}; quickSort(d);
        System.out.println(Arrays.toString(d));  // [1]
        int[] e = {2, 1}; quickSort(e);
        System.out.println(Arrays.toString(e));  // [1, 2]
        int[] f = {1, 2, 3, 4, 5}; quickSort(f);
        System.out.println(Arrays.toString(f));  // [1, 2, 3, 4, 5]
        int[] g = {5, 4, 3, 2, 1}; quickSort(g);
        System.out.println(Arrays.toString(g));  // [1, 2, 3, 4, 5]
        int[] h = {-1, -3, 2, 0, 5, -2}; quickSort(h);
        System.out.println(Arrays.toString(h));  // [-3, -2, -1, 0, 2, 5]
        int[] i = {9, 4, 7, 4, 9, 1, 4}; quickSort(i);
        System.out.println(Arrays.toString(i));  // [1, 4, 4, 4, 7, 9, 9]
        int[] j = {0, 0, 1, 0, 1, 1}; quickSort(j);
        System.out.println(Arrays.toString(j));  // [0, 0, 0, 1, 1, 1]
        int[] k = {50, 10, 30, 20, 40}; quickSort(k);
        System.out.println(Arrays.toString(k));  // [10, 20, 30, 40, 50]
    }
}`
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
    starterCode: `import java.util.*;

public class Main {
    public static void heapSort(int[] nums) {
        int n = nums.length;

        // 1) Build max-heap: sift-down from the last non-leaf down to index 0

        // 2) Repeatedly extract max: swap nums[0] with nums[i], then siftDown over [0, i)

    }

    // Helper: restore heap property by sifting nums[i] down within [0, heapSize)
    private static void siftDown(int[] nums, int i, int heapSize) {
        // Your sift-down logic here
    }

    public static void main(String[] args) {
        int[] a = {12, 11, 13, 5, 6, 7}; heapSort(a);
        System.out.println(Arrays.toString(a));  // [5, 6, 7, 11, 12, 13]
        int[] b = {1, 5, 2, 4, 3}; heapSort(b);
        System.out.println(Arrays.toString(b));  // [1, 2, 3, 4, 5]
        int[] c = {}; heapSort(c);
        System.out.println(Arrays.toString(c));  // []
        int[] d = {7}; heapSort(d);
        System.out.println(Arrays.toString(d));  // [7]
        int[] e = {3, 1}; heapSort(e);
        System.out.println(Arrays.toString(e));  // [1, 3]
        int[] f = {1, 2, 3, 4, 5, 6, 7}; heapSort(f);
        System.out.println(Arrays.toString(f));  // [1, 2, 3, 4, 5, 6, 7]
        int[] g = {7, 6, 5, 4, 3, 2, 1}; heapSort(g);
        System.out.println(Arrays.toString(g));  // [1, 2, 3, 4, 5, 6, 7]
        int[] h = {2, 2, 2, 2}; heapSort(h);
        System.out.println(Arrays.toString(h));  // [2, 2, 2, 2]
        int[] i = {-4, 3, -1, 0, 7, -8}; heapSort(i);
        System.out.println(Arrays.toString(i));  // [-8, -4, -1, 0, 3, 7]
        int[] j = {15, 3, 9, 1, 6, 12, 4, 8}; heapSort(j);
        System.out.println(Arrays.toString(j));  // [1, 3, 4, 6, 8, 9, 12, 15]
        int[] k = {0, -1, 2, -3, 4, -5}; heapSort(k);
        System.out.println(Arrays.toString(k));  // [-5, -3, -1, 0, 2, 4]
    }
}`
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
    starterCode: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        // Your solution here

        return new int[]{};
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(twoSum(new int[]{2, 7, 11, 15}, 9)));    // [0, 1]
        System.out.println(Arrays.toString(twoSum(new int[]{3, 2, 4}, 6)));         // [1, 2]
        System.out.println(Arrays.toString(twoSum(new int[]{3, 3}, 6)));            // [0, 1]
        System.out.println(Arrays.toString(twoSum(new int[]{1, 2, 3, 4, 5}, 9)));   // [3, 4]
        System.out.println(Arrays.toString(twoSum(new int[]{-3, 4, 3, 90}, 0)));    // [0, 2]
        System.out.println(Arrays.toString(twoSum(new int[]{0, 4, 3, 0}, 0)));      // [0, 3]
        System.out.println(Arrays.toString(twoSum(new int[]{-1, -2, -3, -4}, -7))); // [2, 3]
        System.out.println(Arrays.toString(twoSum(new int[]{5, 75, 25}, 100)));     // [1, 2]
        System.out.println(Arrays.toString(twoSum(new int[]{1, 5, 5, 5}, 10)));     // [1, 2]
        System.out.println(Arrays.toString(twoSum(new int[]{2, 5, 5, 11}, 10)));    // [1, 2]
        System.out.println(Arrays.toString(twoSum(new int[]{1000000, -1000000, 0}, 0))); // [0, 1]
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
        System.out.println(maxProfit(new int[]{7, 1, 5, 3, 6, 4}));    // 5
        System.out.println(maxProfit(new int[]{7, 6, 4, 3, 1}));       // 0
        System.out.println(maxProfit(new int[]{}));                     // 0
        System.out.println(maxProfit(new int[]{5}));                    // 0
        System.out.println(maxProfit(new int[]{1, 2}));                 // 1
        System.out.println(maxProfit(new int[]{2, 1}));                 // 0
        System.out.println(maxProfit(new int[]{1, 2, 3, 4, 5}));        // 4
        System.out.println(maxProfit(new int[]{5, 4, 3, 2, 1}));        // 0
        System.out.println(maxProfit(new int[]{3, 3, 3, 3, 3}));        // 0
        System.out.println(maxProfit(new int[]{2, 4, 1, 7}));           // 6
        System.out.println(maxProfit(new int[]{10, 1, 10, 1, 10}));     // 9
        System.out.println(maxProfit(new int[]{100, 180, 260, 310, 40, 535, 695})); // 655
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
        System.out.println(maxSubArray(new int[]{-2, 1, -3, 4, -1, 2, 1, -5, 4})); // 6
        System.out.println(maxSubArray(new int[]{1}));                              // 1
        System.out.println(maxSubArray(new int[]{5, 4, -1, 7, 8}));                 // 23
        System.out.println(maxSubArray(new int[]{-1}));                             // -1
        System.out.println(maxSubArray(new int[]{-3, -1, -4, -2}));                 // -1
        System.out.println(maxSubArray(new int[]{0, 0, 0, 0}));                     // 0
        System.out.println(maxSubArray(new int[]{1, 2, 3, 4, 5}));                  // 15
        System.out.println(maxSubArray(new int[]{-5, -4, -3, -2, -1}));             // -1
        System.out.println(maxSubArray(new int[]{2, -1, 2, -1, 2}));                // 4
        System.out.println(maxSubArray(new int[]{-2, -1}));                         // -1
        System.out.println(maxSubArray(new int[]{8, -19, 5, -4, 20}));              // 21
        System.out.println(maxSubArray(new int[]{1, -1, 1, -1, 1, -1, 1}));         // 1
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
        System.out.println(Arrays.toString(productExceptSelf(new int[]{1, 2, 3, 4})));        // [24, 12, 8, 6]
        System.out.println(Arrays.toString(productExceptSelf(new int[]{-1, 1, 0, -3, 3})));   // [0, 0, 9, 0, 0]
        System.out.println(Arrays.toString(productExceptSelf(new int[]{2, 3})));               // [3, 2]
        System.out.println(Arrays.toString(productExceptSelf(new int[]{1, 1, 1, 1})));         // [1, 1, 1, 1]
        System.out.println(Arrays.toString(productExceptSelf(new int[]{2, 2, 2, 2})));         // [8, 8, 8, 8]
        System.out.println(Arrays.toString(productExceptSelf(new int[]{0, 0})));               // [0, 0]
        System.out.println(Arrays.toString(productExceptSelf(new int[]{5, 0})));               // [0, 5]
        System.out.println(Arrays.toString(productExceptSelf(new int[]{-2, -3, -4})));         // [12, 8, 6]
        System.out.println(Arrays.toString(productExceptSelf(new int[]{1, 2, 3, 4, 5})));      // [120, 60, 40, 30, 24]
        System.out.println(Arrays.toString(productExceptSelf(new int[]{10, 20, 30})));         // [600, 300, 200]
        System.out.println(Arrays.toString(productExceptSelf(new int[]{-1, -1, -1, -1})));     // [-1, -1, -1, -1]
        System.out.println(Arrays.toString(productExceptSelf(new int[]{1, -1, 2, -2})));       // [4, -4, 2, -2]
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
        System.out.println(Arrays.deepToString(merge(new int[][]{{1,3},{2,6},{8,10},{15,18}}))); // [[1, 6], [8, 10], [15, 18]]
        System.out.println(Arrays.deepToString(merge(new int[][]{{1,4},{4,5}})));                 // [[1, 5]]
        System.out.println(Arrays.deepToString(merge(new int[][]{{1,4},{0,4}})));                 // [[0, 4]]
        System.out.println(Arrays.deepToString(merge(new int[][]{{1,4},{2,3}})));                 // [[1, 4]]
        System.out.println(Arrays.deepToString(merge(new int[][]{{1,2},{3,4},{5,6}})));            // [[1, 2], [3, 4], [5, 6]]
        System.out.println(Arrays.deepToString(merge(new int[][]{})));                             // []
        System.out.println(Arrays.deepToString(merge(new int[][]{{1,5}})));                        // [[1, 5]]
        System.out.println(Arrays.deepToString(merge(new int[][]{{1,4},{0,2},{3,5}})));            // [[0, 5]]
        System.out.println(Arrays.deepToString(merge(new int[][]{{2,3},{4,5},{6,7},{8,9},{1,10}}))); // [[1, 10]]
        System.out.println(Arrays.deepToString(merge(new int[][]{{0,0},{1,1},{2,2}})));            // [[0, 0], [1, 1], [2, 2]]
        System.out.println(Arrays.deepToString(merge(new int[][]{{1,3},{5,7},{2,4},{6,8}})));      // [[1, 4], [5, 8]]
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
        System.out.println(isAnagram("anagram", "nagaram"));   // true
        System.out.println(isAnagram("rat", "car"));           // false
        System.out.println(isAnagram("", ""));                 // true
        System.out.println(isAnagram("a", "a"));               // true
        System.out.println(isAnagram("a", "b"));               // false
        System.out.println(isAnagram("ab", "ba"));             // true
        System.out.println(isAnagram("abc", "abcd"));          // false
        System.out.println(isAnagram("listen", "silent"));     // true
        System.out.println(isAnagram("triangle", "integral")); // true
        System.out.println(isAnagram("hello", "world"));       // false
        System.out.println(isAnagram("aabb", "abab"));         // true
        System.out.println(isAnagram("aaa", "aab"));           // false
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
        System.out.println(lengthOfLongestSubstring("abcabcbb"));   // 3
        System.out.println(lengthOfLongestSubstring("bbbbb"));       // 1
        System.out.println(lengthOfLongestSubstring("pwwkew"));      // 3
        System.out.println(lengthOfLongestSubstring(""));            // 0
        System.out.println(lengthOfLongestSubstring("a"));           // 1
        System.out.println(lengthOfLongestSubstring("ab"));          // 2
        System.out.println(lengthOfLongestSubstring("aa"));          // 1
        System.out.println(lengthOfLongestSubstring("abcdef"));      // 6
        System.out.println(lengthOfLongestSubstring("dvdf"));        // 3
        System.out.println(lengthOfLongestSubstring("aabaab!bb"));   // 3
        System.out.println(lengthOfLongestSubstring("tmmzuxt"));     // 5
        System.out.println(lengthOfLongestSubstring("   "));         // 1
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

    // Helper: sort each group internally, then sort groups by first element,
    // so the output is deterministic regardless of HashMap iteration order.
    static String canonical(List<List<String>> groups) {
        List<List<String>> sorted = new ArrayList<>();
        for (List<String> g : groups) {
            List<String> copy = new ArrayList<>(g);
            Collections.sort(copy);
            sorted.add(copy);
        }
        sorted.sort((a, b) -> a.get(0).compareTo(b.get(0)));
        return sorted.toString();
    }

    public static void main(String[] args) {
        System.out.println(canonical(groupAnagrams(new String[]{"eat","tea","tan","ate","nat","bat"})));
        // [[ate, eat, tea], [bat], [nat, tan]]
        System.out.println(canonical(groupAnagrams(new String[]{""})));
        // [[]]
        System.out.println(canonical(groupAnagrams(new String[]{"a"})));
        // [[a]]
        System.out.println(canonical(groupAnagrams(new String[]{})));
        // []
        System.out.println(canonical(groupAnagrams(new String[]{"abc","bca","cab"})));
        // [[abc, bca, cab]]
        System.out.println(canonical(groupAnagrams(new String[]{"abc","def","ghi"})));
        // [[abc], [def], [ghi]]
        System.out.println(canonical(groupAnagrams(new String[]{"abc","abc","abc"})));
        // [[abc, abc, abc]]
        System.out.println(canonical(groupAnagrams(new String[]{"ab","ba","abc","bac"})));
        // [[ab, ba], [abc, bac]]
        System.out.println(canonical(groupAnagrams(new String[]{"a","aa","aaa"})));
        // [[a], [aa], [aaa]]
        System.out.println(canonical(groupAnagrams(new String[]{"listen","silent","enlist","tinsel"})));
        // [[enlist, listen, silent, tinsel]]
        System.out.println(canonical(groupAnagrams(new String[]{"abc","cba","xyz","zyx","mnp"})));
        // [[abc, cba], [mnp], [xyz, zyx]]
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

    // Helper: list as a string for testing — "(empty)" for null
    static String listStr(ListNode head) {
        if (head == null) return "(empty)";
        StringBuilder sb = new StringBuilder();
        while (head != null) {
            sb.append(head.val);
            if (head.next != null) sb.append(" -> ");
            head = head.next;
        }
        return sb.toString();
    }

    public static void main(String[] args) {
        System.out.println(listStr(reverseList(fromArray(new int[]{1,2,3,4,5})))); // 5 -> 4 -> 3 -> 2 -> 1
        System.out.println(listStr(reverseList(null)));                              // (empty)
        System.out.println(listStr(reverseList(fromArray(new int[]{42}))));         // 42
        System.out.println(listStr(reverseList(fromArray(new int[]{1, 2}))));       // 2 -> 1
        System.out.println(listStr(reverseList(fromArray(new int[]{2, 1}))));       // 1 -> 2
        System.out.println(listStr(reverseList(fromArray(new int[]{1, 1, 1}))));    // 1 -> 1 -> 1
        System.out.println(listStr(reverseList(fromArray(new int[]{-1, 0, 1}))));   // 1 -> 0 -> -1
        System.out.println(listStr(reverseList(fromArray(new int[]{5, 4, 3, 2, 1})))); // 1 -> 2 -> 3 -> 4 -> 5
        System.out.println(listStr(reverseList(fromArray(new int[]{1, 2, 3, 4, 5, 6, 7, 8})))); // 8 -> 7 -> 6 -> 5 -> 4 -> 3 -> 2 -> 1
        System.out.println(listStr(reverseList(fromArray(new int[]{0}))));           // 0
        System.out.println(listStr(reverseList(fromArray(new int[]{100, 200}))));    // 200 -> 100
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

    static String listStr(ListNode head) {
        if (head == null) return "(empty)";
        StringBuilder sb = new StringBuilder();
        while (head != null) {
            sb.append(head.val);
            if (head.next != null) sb.append(" -> ");
            head = head.next;
        }
        return sb.toString();
    }

    public static void main(String[] args) {
        System.out.println(listStr(mergeTwoLists(fromArray(new int[]{1,2,4}), fromArray(new int[]{1,3,4})))); // 1 -> 1 -> 2 -> 3 -> 4 -> 4
        System.out.println(listStr(mergeTwoLists(null, null)));                                                // (empty)
        System.out.println(listStr(mergeTwoLists(fromArray(new int[]{1,2,3}), null)));                         // 1 -> 2 -> 3
        System.out.println(listStr(mergeTwoLists(null, fromArray(new int[]{1,2,3}))));                         // 1 -> 2 -> 3
        System.out.println(listStr(mergeTwoLists(fromArray(new int[]{1}), fromArray(new int[]{2}))));          // 1 -> 2
        System.out.println(listStr(mergeTwoLists(fromArray(new int[]{2}), fromArray(new int[]{1}))));          // 1 -> 2
        System.out.println(listStr(mergeTwoLists(fromArray(new int[]{1,2,3}), fromArray(new int[]{4,5,6}))));  // 1 -> 2 -> 3 -> 4 -> 5 -> 6
        System.out.println(listStr(mergeTwoLists(fromArray(new int[]{4,5,6}), fromArray(new int[]{1,2,3}))));  // 1 -> 2 -> 3 -> 4 -> 5 -> 6
        System.out.println(listStr(mergeTwoLists(fromArray(new int[]{1,1,1}), fromArray(new int[]{1,1,1}))));  // 1 -> 1 -> 1 -> 1 -> 1 -> 1
        System.out.println(listStr(mergeTwoLists(fromArray(new int[]{-3,-1}), fromArray(new int[]{-2,0}))));   // -3 -> -2 -> -1 -> 0
        System.out.println(listStr(mergeTwoLists(fromArray(new int[]{1,5,9}), fromArray(new int[]{2,3,7,8})))); // 1 -> 2 -> 3 -> 5 -> 7 -> 8 -> 9
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

    // Helpers to build linked lists for testing
    static ListNode build(int[] vals) {
        if (vals.length == 0) return null;
        ListNode head = new ListNode(vals[0]);
        ListNode cur = head;
        for (int i = 1; i < vals.length; i++) { cur.next = new ListNode(vals[i]); cur = cur.next; }
        return head;
    }
    // Build a list with a cycle: cycleStart is the index where the tail loops back to. -1 = no cycle.
    static ListNode buildWithCycle(int[] vals, int cycleStart) {
        if (vals.length == 0) return null;
        ListNode head = build(vals);
        if (cycleStart < 0) return head;
        // Find tail and the node at cycleStart
        ListNode tail = head, target = head;
        for (int i = 0; i < cycleStart; i++) target = target.next;
        while (tail.next != null) tail = tail.next;
        tail.next = target;
        return head;
    }

    public static void main(String[] args) {
        System.out.println(hasCycle(buildWithCycle(new int[]{3, 2, 0, -4}, 1)));  // true
        System.out.println(hasCycle(buildWithCycle(new int[]{1, 2}, -1)));         // false
        System.out.println(hasCycle(null));                                         // false
        System.out.println(hasCycle(buildWithCycle(new int[]{1}, -1)));            // false
        System.out.println(hasCycle(buildWithCycle(new int[]{1}, 0)));             // true
        System.out.println(hasCycle(buildWithCycle(new int[]{1, 2}, 0)));          // true
        System.out.println(hasCycle(buildWithCycle(new int[]{1, 2, 3}, 0)));       // true
        System.out.println(hasCycle(buildWithCycle(new int[]{1, 2, 3}, 2)));       // true
        System.out.println(hasCycle(buildWithCycle(new int[]{1, 2, 3, 4, 5}, -1))); // false
        System.out.println(hasCycle(buildWithCycle(new int[]{1, 2, 3, 4, 5}, 3))); // true
        System.out.println(hasCycle(buildWithCycle(new int[]{5, 4, 3, 2, 1}, -1))); // false
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

    // Build a tree from a level-order array (-1 represents null)
    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode root = new TreeNode(vals[0]);
        java.util.Queue<TreeNode> q = new java.util.LinkedList<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode cur = q.poll();
            if (i < vals.length && vals[i] != null) { cur.left = new TreeNode(vals[i]); q.add(cur.left); }
            i++;
            if (i < vals.length && vals[i] != null) { cur.right = new TreeNode(vals[i]); q.add(cur.right); }
            i++;
        }
        return root;
    }

    public static void main(String[] args) {
        System.out.println(maxDepth(build(3, 9, 20, null, null, 15, 7)));        // 3
        System.out.println(maxDepth(null));                                        // 0
        System.out.println(maxDepth(build(1)));                                    // 1
        System.out.println(maxDepth(build(1, 2)));                                 // 2
        System.out.println(maxDepth(build(1, null, 2)));                           // 2
        System.out.println(maxDepth(build(1, 2, 3, 4, 5, 6, 7)));                  // 3
        System.out.println(maxDepth(build(1, 2, 3, 4, null, null, 5, 6)));         // 4
        System.out.println(maxDepth(build(1, 2, null, 3, null, 4, null, 5)));       // 5
        System.out.println(maxDepth(build(1, null, 2, null, 3, null, 4, null, 5))); // 5
        System.out.println(maxDepth(build(0)));                                    // 1
        System.out.println(maxDepth(build(-10, -5, -20, -3, null, null, -15)));    // 3
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

    // Build a tree from a level-order array (null = no child)
    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode root = new TreeNode(vals[0]);
        java.util.Queue<TreeNode> q = new java.util.LinkedList<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode cur = q.poll();
            if (i < vals.length && vals[i] != null) { cur.left = new TreeNode(vals[i]); q.add(cur.left); }
            i++;
            if (i < vals.length && vals[i] != null) { cur.right = new TreeNode(vals[i]); q.add(cur.right); }
            i++;
        }
        return root;
    }

    public static void main(String[] args) {
        System.out.println(isValidBST(build(2, 1, 3)));                         // true
        System.out.println(isValidBST(build(5, 1, 4, null, null, 3, 6)));       // false
        System.out.println(isValidBST(null));                                    // true
        System.out.println(isValidBST(build(1)));                                // true
        System.out.println(isValidBST(build(1, 1)));                             // false (duplicate)
        System.out.println(isValidBST(build(2, 2, 2)));                          // false (all duplicates)
        System.out.println(isValidBST(build(10, 5, 15, null, null, 6, 20)));     // false (6 < 10 in right subtree)
        System.out.println(isValidBST(build(10, 5, 15, 3, 7, 12, 20)));          // true
        System.out.println(isValidBST(build(5, 4, 6, null, null, 3, 7)));        // false (3 in right subtree of 5)
        System.out.println(isValidBST(build(50, 30, 70, 20, 40, 60, 80)));       // true
        System.out.println(isValidBST(build(1, null, 2, null, 3, null, 4)));     // true (right-skewed sorted)
        System.out.println(isValidBST(build(4, 2, 6, 1, 3, 5, 7)));              // true (perfect BST)
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

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode root = new TreeNode(vals[0]);
        Queue<TreeNode> q = new LinkedList<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode cur = q.poll();
            if (i < vals.length && vals[i] != null) { cur.left = new TreeNode(vals[i]); q.add(cur.left); }
            i++;
            if (i < vals.length && vals[i] != null) { cur.right = new TreeNode(vals[i]); q.add(cur.right); }
            i++;
        }
        return root;
    }

    public static void main(String[] args) {
        System.out.println(levelOrder(build(3, 9, 20, null, null, 15, 7)));    // [[3], [9, 20], [15, 7]]
        System.out.println(levelOrder(null));                                    // []
        System.out.println(levelOrder(build(1)));                                // [[1]]
        System.out.println(levelOrder(build(1, 2)));                             // [[1], [2]]
        System.out.println(levelOrder(build(1, null, 2)));                       // [[1], [2]]
        System.out.println(levelOrder(build(1, 2, 3)));                          // [[1], [2, 3]]
        System.out.println(levelOrder(build(1, 2, 3, 4, 5, 6, 7)));              // [[1], [2, 3], [4, 5, 6, 7]]
        System.out.println(levelOrder(build(1, 2, null, 3, null, 4)));           // [[1], [2], [3], [4]]
        System.out.println(levelOrder(build(1, null, 2, null, 3, null, 4)));      // [[1], [2], [3], [4]]
        System.out.println(levelOrder(build(5, 3, 8, 1, 4, 7, 9)));              // [[5], [3, 8], [1, 4, 7, 9]]
        System.out.println(levelOrder(build(0, -1, 1)));                         // [[0], [-1, 1]]
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

    // Find a node by value (assumes unique values for these tests)
    static TreeNode find(TreeNode root, int val) {
        if (root == null) return null;
        if (root.val == val) return root;
        TreeNode l = find(root.left, val);
        return l != null ? l : find(root.right, val);
    }

    static int lcaVal(TreeNode root, int p, int q) {
        TreeNode a = find(root, p), b = find(root, q);
        TreeNode r = lowestCommonAncestor(root, a, b);
        return r == null ? -999 : r.val;
    }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode root = new TreeNode(vals[0]);
        java.util.Queue<TreeNode> q = new java.util.LinkedList<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode cur = q.poll();
            if (i < vals.length && vals[i] != null) { cur.left = new TreeNode(vals[i]); q.add(cur.left); }
            i++;
            if (i < vals.length && vals[i] != null) { cur.right = new TreeNode(vals[i]); q.add(cur.right); }
            i++;
        }
        return root;
    }

    public static void main(String[] args) {
        // Tree: [3,5,1,6,2,0,8,null,null,7,4]
        TreeNode t = build(3, 5, 1, 6, 2, 0, 8, null, null, 7, 4);
        System.out.println(lcaVal(t, 5, 1));   // 3
        System.out.println(lcaVal(t, 5, 4));   // 5
        System.out.println(lcaVal(t, 7, 4));   // 2
        System.out.println(lcaVal(t, 6, 4));   // 5
        System.out.println(lcaVal(t, 0, 8));   // 1
        System.out.println(lcaVal(t, 6, 8));   // 3
        System.out.println(lcaVal(t, 5, 5));   // 5  (same node)
        System.out.println(lcaVal(t, 7, 0));   // 3

        // Linear tree (right-skewed)
        TreeNode r = build(1, null, 2, null, 3, null, 4);
        System.out.println(lcaVal(r, 3, 4));   // 3
        System.out.println(lcaVal(r, 1, 4));   // 1

        // Two-node tree
        TreeNode tiny = build(1, 2);
        System.out.println(lcaVal(tiny, 1, 2)); // 1
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
        System.out.println(numIslands(new char[][]{
            {'1','1','0','0','0'},
            {'1','1','0','0','0'},
            {'0','0','1','0','0'},
            {'0','0','0','1','1'}
        })); // 3
        System.out.println(numIslands(new char[][]{
            {'1','1','1','1','0'},
            {'1','1','0','1','0'},
            {'1','1','0','0','0'},
            {'0','0','0','0','0'}
        })); // 1
        System.out.println(numIslands(new char[][]{{'0'}}));               // 0
        System.out.println(numIslands(new char[][]{{'1'}}));               // 1
        System.out.println(numIslands(new char[][]{{'0','0','0','0'}}));    // 0
        System.out.println(numIslands(new char[][]{{'1','1','1','1'}}));    // 1
        System.out.println(numIslands(new char[][]{
            {'1','0','1','0','1'},
            {'0','0','0','0','0'},
            {'1','0','1','0','1'}
        })); // 6
        System.out.println(numIslands(new char[][]{
            {'1','0','1'},
            {'0','1','0'},
            {'1','0','1'}
        })); // 5
        System.out.println(numIslands(new char[][]{
            {'1','1','1'},
            {'0','1','0'},
            {'1','1','1'}
        })); // 1
        System.out.println(numIslands(new char[][]{
            {'1','1','0','0'},
            {'1','1','0','0'},
            {'0','0','1','1'},
            {'0','0','1','1'}
        })); // 2
        System.out.println(numIslands(new char[][]{{}}));                  // 0
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

    // Helper: count nodes reachable from a starting node (BFS)
    static int nodeCount(Node start) {
        if (start == null) return 0;
        Set<Node> seen = new HashSet<>();
        Deque<Node> q = new ArrayDeque<>();
        q.add(start); seen.add(start);
        while (!q.isEmpty()) {
            Node n = q.poll();
            for (Node nb : n.neighbors) if (seen.add(nb)) q.add(nb);
        }
        return seen.size();
    }

    // Helper: returns true if a and b share NO node references (proper deep copy)
    static boolean sharesNoRefs(Node a, Node b) {
        if (a == null || b == null) return a == b;
        Set<Node> aSeen = new HashSet<>();
        Deque<Node> q = new ArrayDeque<>();
        q.add(a); aSeen.add(a);
        while (!q.isEmpty()) {
            Node n = q.poll();
            for (Node nb : n.neighbors) if (aSeen.add(nb)) q.add(nb);
        }
        Set<Node> bSeen = new HashSet<>();
        Deque<Node> q2 = new ArrayDeque<>();
        q2.add(b); bSeen.add(b);
        while (!q2.isEmpty()) {
            Node n = q2.poll();
            if (aSeen.contains(n)) return false;
            for (Node nb : n.neighbors) if (bSeen.add(nb)) q2.add(nb);
        }
        return true;
    }

    static int valOrNull(Node n) { return n == null ? -1 : n.val; }

    public static void main(String[] args) {
        // Graph 1: 4-node cycle 1-2-3-4-1
        Node n1 = new Node(1), n2 = new Node(2), n3 = new Node(3), n4 = new Node(4);
        n1.neighbors.addAll(Arrays.asList(n2, n4));
        n2.neighbors.addAll(Arrays.asList(n1, n3));
        n3.neighbors.addAll(Arrays.asList(n2, n4));
        n4.neighbors.addAll(Arrays.asList(n1, n3));
        Node c1 = cloneGraph(n1);
        System.out.println(valOrNull(c1));               // 1
        System.out.println(c1 != n1);                    // true
        System.out.println(c1.neighbors.size());         // 2
        System.out.println(nodeCount(c1));               // 4
        System.out.println(sharesNoRefs(n1, c1));        // true

        // Graph 2: single node, no neighbors
        Node solo = new Node(7);
        Node c2 = cloneGraph(solo);
        System.out.println(valOrNull(c2));               // 7
        System.out.println(c2 != solo);                  // true
        System.out.println(c2.neighbors.size());         // 0

        // Graph 3: null input
        System.out.println(valOrNull(cloneGraph(null))); // -1

        // Graph 4: two-node bidirectional
        Node a = new Node(10), b = new Node(20);
        a.neighbors.add(b); b.neighbors.add(a);
        Node c4 = cloneGraph(a);
        System.out.println(c4.val);                       // 10
        System.out.println(c4.neighbors.size());          // 1
        System.out.println(c4.neighbors.get(0).val);      // 20
        System.out.println(c4.neighbors.get(0).neighbors.get(0) == c4); // true (bidirectional preserved)
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
        System.out.println(canFinish(2, new int[][]{{1, 0}}));                      // true
        System.out.println(canFinish(2, new int[][]{{1, 0}, {0, 1}}));              // false (cycle)
        System.out.println(canFinish(4, new int[][]{{1, 0}, {2, 1}, {3, 2}}));      // true
        System.out.println(canFinish(1, new int[][]{}));                            // true
        System.out.println(canFinish(5, new int[][]{}));                            // true (no prereqs)
        System.out.println(canFinish(3, new int[][]{{0, 1}, {0, 2}, {1, 2}}));      // true
        System.out.println(canFinish(3, new int[][]{{0, 1}, {1, 2}, {2, 0}}));      // false (cycle 0->2->1->0)
        System.out.println(canFinish(2, new int[][]{{0, 0}}));                      // false (self-cycle)
        System.out.println(canFinish(4, new int[][]{{1, 0}, {2, 0}, {3, 1}, {3, 2}})); // true (diamond)
        System.out.println(canFinish(5, new int[][]{{1, 0}, {2, 1}, {3, 2}, {4, 3}})); // true (long chain)
        System.out.println(canFinish(6, new int[][]{{1, 0}, {2, 1}, {4, 3}, {5, 4}})); // true (two chains)
        System.out.println(canFinish(4, new int[][]{{1, 0}, {2, 1}, {0, 2}, {3, 0}})); // false (cycle in subgraph)
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
        System.out.println(ladderLength("hit", "cog", Arrays.asList("hot","dot","dog","lot","log","cog"))); // 5
        System.out.println(ladderLength("hit", "cog", Arrays.asList("hot","dot","dog","lot","log")));       // 0
        System.out.println(ladderLength("a", "c", Arrays.asList("a","b","c")));                              // 2
        System.out.println(ladderLength("hot", "dog", Arrays.asList("hot","dog")));                          // 0
        System.out.println(ladderLength("hot", "dog", Arrays.asList("hot","dog","dot")));                    // 3
        System.out.println(ladderLength("lost", "miss", Arrays.asList("most","mist","miss","lost","fist","fish"))); // 4
        System.out.println(ladderLength("cat", "dog", Arrays.asList("cot","dot","dog")));                    // 4
        System.out.println(ladderLength("game", "thee", Arrays.asList("frye","heat","shes","game","thee","thwy"))); // 0
        System.out.println(ladderLength("ab", "cd", Arrays.asList("ab","ad","cd")));                         // 3
        System.out.println(ladderLength("red", "tax", Arrays.asList("ted","tex","red","tax","tad","den","rex","pee"))); // 4
        System.out.println(ladderLength("abc", "xyz", Arrays.asList("xyz")));                                // 0
        System.out.println(ladderLength("hot", "dog", Arrays.asList("hot","dot","dog")));                    // 3
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
        System.out.println(climbStairs(1));   // 1
        System.out.println(climbStairs(2));   // 2
        System.out.println(climbStairs(3));   // 3
        System.out.println(climbStairs(4));   // 5
        System.out.println(climbStairs(5));   // 8
        System.out.println(climbStairs(6));   // 13
        System.out.println(climbStairs(7));   // 21
        System.out.println(climbStairs(8));   // 34
        System.out.println(climbStairs(10));  // 89
        System.out.println(climbStairs(15));  // 987
        System.out.println(climbStairs(20));  // 10946
        System.out.println(climbStairs(25));  // 121393
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
        System.out.println(coinChange(new int[]{1, 5, 11}, 11));    // 1
        System.out.println(coinChange(new int[]{1, 5, 11}, 15));    // 3
        System.out.println(coinChange(new int[]{2}, 3));             // -1
        System.out.println(coinChange(new int[]{1, 2, 5}, 11));     // 3
        System.out.println(coinChange(new int[]{1}, 0));             // 0
        System.out.println(coinChange(new int[]{2}, 0));             // 0
        System.out.println(coinChange(new int[]{1}, 5));             // 5
        System.out.println(coinChange(new int[]{1, 2, 5}, 100));    // 20
        System.out.println(coinChange(new int[]{2, 5, 10, 1}, 27));  // 4
        System.out.println(coinChange(new int[]{186, 419, 83, 408}, 6249)); // 20
        System.out.println(coinChange(new int[]{1}, 1));             // 1
        System.out.println(coinChange(new int[]{5, 10}, 7));         // -1
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
        System.out.println(lengthOfLIS(new int[]{10, 9, 2, 5, 3, 7, 101, 18})); // 4
        System.out.println(lengthOfLIS(new int[]{0, 1, 0, 3, 2, 3}));            // 4
        System.out.println(lengthOfLIS(new int[]{7, 7, 7, 7}));                   // 1
        System.out.println(lengthOfLIS(new int[]{}));                              // 0
        System.out.println(lengthOfLIS(new int[]{5}));                             // 1
        System.out.println(lengthOfLIS(new int[]{1, 2, 3, 4, 5}));                // 5
        System.out.println(lengthOfLIS(new int[]{5, 4, 3, 2, 1}));                // 1
        System.out.println(lengthOfLIS(new int[]{1, 3, 6, 7, 9, 4, 10, 5, 6}));   // 6
        System.out.println(lengthOfLIS(new int[]{4, 10, 4, 3, 8, 9}));            // 3
        System.out.println(lengthOfLIS(new int[]{-1, -2, -3}));                    // 1
        System.out.println(lengthOfLIS(new int[]{-2, -1, 0, 1}));                  // 4
        System.out.println(lengthOfLIS(new int[]{2, 5, 1, 8, 3}));                 // 3
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
        System.out.println(wordBreak("leetcode", Arrays.asList("leet","code")));                              // true
        System.out.println(wordBreak("applepenapple", Arrays.asList("apple","pen")));                         // true
        System.out.println(wordBreak("catsandog", Arrays.asList("cats","dog","sand","and","cat")));           // false
        System.out.println(wordBreak("a", Arrays.asList("a")));                                                // true
        System.out.println(wordBreak("a", Arrays.asList("b")));                                                // false
        System.out.println(wordBreak("ab", Arrays.asList("a","b")));                                           // true
        System.out.println(wordBreak("aaaaaaa", Arrays.asList("aaaa","aaa")));                                // true
        System.out.println(wordBreak("cars", Arrays.asList("car","ca","rs")));                                // true
        System.out.println(wordBreak("aaaaaaab", Arrays.asList("a","aa","aaa","aaaa")));                      // false
        System.out.println(wordBreak("abcd", Arrays.asList("a","abc","b","cd")));                             // true
        System.out.println(wordBreak("goalspecial", Arrays.asList("go","goal","goals","special")));            // true
        System.out.println(wordBreak("bb", Arrays.asList("a","b","bbb","bbbb")));                              // true
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
        System.out.println(search(new int[]{-1, 0, 3, 5, 9, 12}, 9));      // 4
        System.out.println(search(new int[]{-1, 0, 3, 5, 9, 12}, 2));      // -1
        System.out.println(search(new int[]{}, 1));                          // -1
        System.out.println(search(new int[]{5}, 5));                         // 0
        System.out.println(search(new int[]{5}, 1));                         // -1
        System.out.println(search(new int[]{-1, 0, 3, 5, 9, 12}, -1));     // 0
        System.out.println(search(new int[]{-1, 0, 3, 5, 9, 12}, 12));     // 5
        System.out.println(search(new int[]{-10, -5, 0, 5, 10}, 0));       // 2
        System.out.println(search(new int[]{1, 3}, 1));                      // 0
        System.out.println(search(new int[]{1, 3}, 3));                      // 1
        System.out.println(search(new int[]{1, 3}, 2));                      // -1
        System.out.println(search(new int[]{2, 5, 8, 12, 16, 23, 38, 56, 72, 91}, 23)); // 5
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
        System.out.println(search(new int[]{4, 5, 6, 7, 0, 1, 2}, 0));  // 4
        System.out.println(search(new int[]{4, 5, 6, 7, 0, 1, 2}, 3));  // -1
        System.out.println(search(new int[]{1}, 0));                     // -1
        System.out.println(search(new int[]{1}, 1));                     // 0
        System.out.println(search(new int[]{}, 5));                      // -1
        System.out.println(search(new int[]{4, 5, 6, 7, 0, 1, 2}, 4));  // 0
        System.out.println(search(new int[]{4, 5, 6, 7, 0, 1, 2}, 7));  // 3
        System.out.println(search(new int[]{4, 5, 6, 7, 0, 1, 2}, 2));  // 6
        System.out.println(search(new int[]{1, 2, 3, 4, 5}, 3));         // 2 (no rotation)
        System.out.println(search(new int[]{5, 1, 2, 3, 4}, 5));         // 0
        System.out.println(search(new int[]{3, 1}, 1));                  // 1
        System.out.println(search(new int[]{6, 7, 0, 1, 2, 4, 5}, 4));   // 5
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
        System.out.println(findKthLargest(new int[]{3, 2, 1, 5, 6, 4}, 2));            // 5
        System.out.println(findKthLargest(new int[]{3, 2, 3, 1, 2, 4, 5, 5, 6}, 4));   // 4
        System.out.println(findKthLargest(new int[]{1}, 1));                            // 1
        System.out.println(findKthLargest(new int[]{1, 2}, 1));                         // 2
        System.out.println(findKthLargest(new int[]{1, 2}, 2));                         // 1
        System.out.println(findKthLargest(new int[]{5, 5, 5, 5}, 2));                   // 5
        System.out.println(findKthLargest(new int[]{1, 2, 3, 4, 5}, 1));                // 5
        System.out.println(findKthLargest(new int[]{1, 2, 3, 4, 5}, 5));                // 1
        System.out.println(findKthLargest(new int[]{7, 6, 5, 4, 3, 2, 1}, 3));          // 5
        System.out.println(findKthLargest(new int[]{-1, -2, -3, -4, -5}, 2));           // -2
        System.out.println(findKthLargest(new int[]{0, 0, 0, 0, 1}, 1));                // 1
        System.out.println(findKthLargest(new int[]{10, 20, 30, 40, 50, 60}, 3));       // 40
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
        System.out.println(isValid("()"));         // true
        System.out.println(isValid("()[]{}"));      // true
        System.out.println(isValid("(]"));         // false
        System.out.println(isValid("([)]"));       // false
        System.out.println(isValid("{[]}"));       // true
        System.out.println(isValid(""));           // true
        System.out.println(isValid("("));          // false
        System.out.println(isValid(")"));          // false
        System.out.println(isValid("(("));         // false
        System.out.println(isValid("))"));         // false
        System.out.println(isValid("(())"));       // true
        System.out.println(isValid("[({})]"));     // true
        System.out.println(isValid("[(])"));       // false
        System.out.println(isValid("(((((((((())))))))))" )); // true
        System.out.println(isValid("][")) ;        // false
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
        // Sequence 1 — basic push/pop/min
        MinStack ms = new MinStack();
        ms.push(-2); ms.push(0); ms.push(-3);
        System.out.println(ms.getMin());  // -3
        ms.pop();
        System.out.println(ms.top());     // 0
        System.out.println(ms.getMin());  // -2

        // Sequence 2 — single push
        MinStack a = new MinStack();
        a.push(5);
        System.out.println(a.top());      // 5
        System.out.println(a.getMin());   // 5

        // Sequence 3 — duplicate minimums (must keep min after popping a duplicate)
        MinStack b = new MinStack();
        b.push(2); b.push(2); b.push(2);
        System.out.println(b.getMin());   // 2
        b.pop();
        System.out.println(b.getMin());   // 2
        b.pop();
        System.out.println(b.getMin());   // 2

        // Sequence 4 — strictly increasing pushes
        MinStack c = new MinStack();
        c.push(1); c.push(2); c.push(3);
        System.out.println(c.getMin());   // 1
        System.out.println(c.top());      // 3

        // Sequence 5 — strictly decreasing pushes
        MinStack d = new MinStack();
        d.push(3); d.push(2); d.push(1);
        System.out.println(d.getMin());   // 1
        d.pop();
        System.out.println(d.getMin());   // 2
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

    // Sort the result for deterministic comparison (problem allows any order)
    static String sorted(int[] arr) {
        int[] copy = arr.clone();
        Arrays.sort(copy);
        return Arrays.toString(copy);
    }

    public static void main(String[] args) {
        System.out.println(sorted(topKFrequent(new int[]{1, 1, 1, 2, 2, 3}, 2)));               // [1, 2]
        System.out.println(sorted(topKFrequent(new int[]{1}, 1)));                                // [1]
        System.out.println(sorted(topKFrequent(new int[]{4, 1, -1, 2, -1, 2, 3}, 2)));            // [-1, 2]
        System.out.println(sorted(topKFrequent(new int[]{1, 2}, 2)));                              // [1, 2]
        System.out.println(sorted(topKFrequent(new int[]{5, 5, 5, 5}, 1)));                       // [5]
        System.out.println(sorted(topKFrequent(new int[]{1, 1, 2, 2, 3, 3}, 3)));                  // [1, 2, 3]
        System.out.println(sorted(topKFrequent(new int[]{1, 1, 1, 2, 2, 3, 3, 3, 3}, 1)));        // [3]
        System.out.println(sorted(topKFrequent(new int[]{0, 0, 1, -1, -1}, 2)));                  // [-1, 0]
        System.out.println(sorted(topKFrequent(new int[]{10, 20, 30, 10, 20, 10}, 2)));            // [10, 20]
        System.out.println(sorted(topKFrequent(new int[]{1, 1, 2, 2, 3, 3, 4}, 3)));               // [1, 2, 3]
        System.out.println(sorted(topKFrequent(new int[]{-3, -3, -3, 5, 5, 1}, 2)));               // [-3, 5]
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
        // Sequence 1 — classic LeetCode example (capacity 2)
        LRUCache c = new LRUCache(2);
        c.put(1, 1); c.put(2, 2);
        System.out.println(c.get(1));  // 1
        c.put(3, 3);                    // evicts key 2 (least recent)
        System.out.println(c.get(2));  // -1
        c.put(4, 4);                    // evicts key 1
        System.out.println(c.get(1));  // -1
        System.out.println(c.get(3));  // 3
        System.out.println(c.get(4));  // 4

        // Sequence 2 — capacity 1 (every put evicts)
        LRUCache d = new LRUCache(1);
        d.put(1, 100);
        System.out.println(d.get(1));  // 100
        d.put(2, 200);                  // evicts 1
        System.out.println(d.get(1));  // -1
        System.out.println(d.get(2));  // 200

        // Sequence 3 — get on missing key
        LRUCache e = new LRUCache(2);
        System.out.println(e.get(5));  // -1

        // Sequence 4 — overwrite existing key (no eviction)
        LRUCache f = new LRUCache(2);
        f.put(1, 1); f.put(2, 2); f.put(1, 99);
        System.out.println(f.get(1));  // 99
        System.out.println(f.get(2));  // 2

        // Sequence 5 — get refreshes recency
        LRUCache g = new LRUCache(3);
        g.put(1, 1); g.put(2, 2); g.put(3, 3);
        g.get(1);                       // touches key 1 (now recent)
        g.put(4, 4);                    // evicts key 2 (now least recent)
        System.out.println(g.get(1));  // 1
        System.out.println(g.get(2));  // -1
        System.out.println(g.get(3));  // 3
        System.out.println(g.get(4));  // 4
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

    // Canonicalize: sort each subset internally, then sort the list of subsets,
    // so the output is deterministic regardless of the algorithm's traversal order.
    static String canonical(List<List<Integer>> lists) {
        List<List<Integer>> sorted = new ArrayList<>();
        for (List<Integer> l : lists) {
            List<Integer> copy = new ArrayList<>(l);
            Collections.sort(copy);
            sorted.add(copy);
        }
        sorted.sort((a, b) -> {
            if (a.size() != b.size()) return Integer.compare(a.size(), b.size());
            for (int i = 0; i < a.size(); i++) {
                int c = Integer.compare(a.get(i), b.get(i));
                if (c != 0) return c;
            }
            return 0;
        });
        return sorted.toString();
    }

    public static void main(String[] args) {
        System.out.println(canonical(subsets(new int[]{1,2,3})));
        // [[], [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]]
        System.out.println(canonical(subsets(new int[]{})));
        // [[]]
        System.out.println(canonical(subsets(new int[]{1})));
        // [[], [1]]
        System.out.println(canonical(subsets(new int[]{1, 2})));
        // [[], [1], [2], [1, 2]]
        System.out.println(canonical(subsets(new int[]{0})));
        // [[], [0]]
        System.out.println(canonical(subsets(new int[]{1, 2, 3, 4})));
        // [[], [1], [2], [3], [4], [1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4], [1, 2, 3], [1, 2, 4], [1, 3, 4], [2, 3, 4], [1, 2, 3, 4]]
        System.out.println(canonical(subsets(new int[]{-1, 0, 1})));
        // [[], [-1], [0], [1], [-1, 0], [-1, 1], [0, 1], [-1, 0, 1]]
        System.out.println(canonical(subsets(new int[]{5, 10})));
        // [[], [5], [10], [5, 10]]
        System.out.println(canonical(subsets(new int[]{2, 4, 6})));
        // [[], [2], [4], [6], [2, 4], [2, 6], [4, 6], [2, 4, 6]]
        System.out.println(subsets(new int[]{1, 2, 3}).size());  // 8
        System.out.println(subsets(new int[]{1, 2, 3, 4}).size()); // 16
        System.out.println(subsets(new int[]{1, 2, 3, 4, 5}).size()); // 32
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

    // Canonicalize: sort the list of permutations so output is deterministic
    static String canonical(List<List<Integer>> lists) {
        List<List<Integer>> sorted = new ArrayList<>(lists);
        sorted.sort((a, b) -> {
            for (int i = 0; i < Math.min(a.size(), b.size()); i++) {
                int c = Integer.compare(a.get(i), b.get(i));
                if (c != 0) return c;
            }
            return Integer.compare(a.size(), b.size());
        });
        return sorted.toString();
    }

    public static void main(String[] args) {
        System.out.println(canonical(permute(new int[]{1, 2, 3})));
        // [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]
        System.out.println(canonical(permute(new int[]{0, 1})));
        // [[0, 1], [1, 0]]
        System.out.println(canonical(permute(new int[]{1})));
        // [[1]]
        System.out.println(canonical(permute(new int[]{})));
        // [[]]
        System.out.println(canonical(permute(new int[]{1, 2})));
        // [[1, 2], [2, 1]]
        System.out.println(canonical(permute(new int[]{-1, 0, 1})));
        // [[-1, 0, 1], [-1, 1, 0], [0, -1, 1], [0, 1, -1], [1, -1, 0], [1, 0, -1]]
        System.out.println(permute(new int[]{1, 2, 3}).size());           // 6
        System.out.println(permute(new int[]{1, 2, 3, 4}).size());        // 24
        System.out.println(permute(new int[]{1, 2, 3, 4, 5}).size());     // 120
        System.out.println(permute(new int[]{1}).size());                  // 1
        System.out.println(permute(new int[]{}).size());                   // 1
        System.out.println(permute(new int[]{5, 7}).size());               // 2
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
        System.out.println(maxArea(new int[]{1, 8, 6, 2, 5, 4, 8, 3, 7})); // 49
        System.out.println(maxArea(new int[]{1, 1}));                       // 1
        System.out.println(maxArea(new int[]{2, 1}));                       // 1
        System.out.println(maxArea(new int[]{4, 3, 2, 1, 4}));              // 16
        System.out.println(maxArea(new int[]{1, 2, 1}));                    // 2
        System.out.println(maxArea(new int[]{1, 2, 3, 4, 5, 6}));           // 9
        System.out.println(maxArea(new int[]{6, 5, 4, 3, 2, 1}));           // 9
        System.out.println(maxArea(new int[]{0, 0, 0, 0}));                 // 0
        System.out.println(maxArea(new int[]{0, 5, 0, 5}));                 // 10
        System.out.println(maxArea(new int[]{1, 100, 1, 1, 100, 1}));       // 300
        System.out.println(maxArea(new int[]{2, 3, 4, 5, 18, 17, 6}));      // 17
        System.out.println(maxArea(new int[]{10, 10}));                     // 10
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

    // Canonicalize: sort each triplet, then sort the list
    static String canonical(List<List<Integer>> triplets) {
        List<List<Integer>> sorted = new ArrayList<>();
        for (List<Integer> t : triplets) {
            List<Integer> copy = new ArrayList<>(t);
            Collections.sort(copy);
            sorted.add(copy);
        }
        sorted.sort((a, b) -> {
            for (int i = 0; i < 3; i++) {
                int c = Integer.compare(a.get(i), b.get(i));
                if (c != 0) return c;
            }
            return 0;
        });
        return sorted.toString();
    }

    public static void main(String[] args) {
        System.out.println(canonical(threeSum(new int[]{-1, 0, 1, 2, -1, -4})));    // [[-1, -1, 2], [-1, 0, 1]]
        System.out.println(canonical(threeSum(new int[]{0, 1, 1})));                 // []
        System.out.println(canonical(threeSum(new int[]{0, 0, 0})));                 // [[0, 0, 0]]
        System.out.println(canonical(threeSum(new int[]{})));                         // []
        System.out.println(canonical(threeSum(new int[]{0})));                        // []
        System.out.println(canonical(threeSum(new int[]{0, 0})));                     // []
        System.out.println(canonical(threeSum(new int[]{1, 2, 3})));                 // []
        System.out.println(canonical(threeSum(new int[]{0, 0, 0, 0})));              // [[0, 0, 0]]
        System.out.println(canonical(threeSum(new int[]{-2, 0, 1, 1, 2})));          // [[-2, 0, 2], [-2, 1, 1]]
        System.out.println(canonical(threeSum(new int[]{-1, 0, 1, 0})));             // [[-1, 0, 1]]
        System.out.println(canonical(threeSum(new int[]{3, 0, -2, -1, 1, 2})));      // [[-2, -1, 3], [-2, 0, 2], [-1, 0, 1]]
        System.out.println(canonical(threeSum(new int[]{-4, -2, -2, -2, 0, 1, 2, 2, 2, 3, 3, 4, 4, 6, 6})));
        // [[-4, -2, 6], [-4, 0, 4], [-4, 1, 3], [-4, 2, 2], [-2, -2, 4], [-2, 0, 2]]
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
        System.out.println(minWindow("ADOBECODEBANC", "ABC"));    // BANC
        System.out.println(minWindow("a", "a"));                  // a
        System.out.println(minWindow("a", "aa"));                 //
        System.out.println(minWindow("ab", "b"));                 // b
        System.out.println(minWindow("ab", "a"));                 // a
        System.out.println(minWindow("abc", "abc"));              // abc
        System.out.println(minWindow("xyzABCxyz", "ABC"));        // ABC
        System.out.println(minWindow("aabbcc", "abc"));           // abbc
        System.out.println(minWindow("AAABBBCCC", "ABC"));        // ABBBC
        System.out.println(minWindow("xxx", "y"));                //
        System.out.println(minWindow("ab", "A"));                 //
        System.out.println(minWindow("abcdefg", "g"));            // g
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
        System.out.println(minMeetingRooms(new int[][]{{0, 30}, {5, 10}, {15, 20}}));    // 2
        System.out.println(minMeetingRooms(new int[][]{{7, 10}, {2, 4}}));                // 1
        System.out.println(minMeetingRooms(new int[][]{{1, 5}, {2, 6}, {3, 7}, {4, 8}})); // 4
        System.out.println(minMeetingRooms(new int[][]{}));                                // 0
        System.out.println(minMeetingRooms(new int[][]{{1, 5}}));                          // 1
        System.out.println(minMeetingRooms(new int[][]{{1, 5}, {6, 10}, {11, 15}}));      // 1
        System.out.println(minMeetingRooms(new int[][]{{1, 10}, {2, 7}, {3, 19}, {8, 12}, {10, 20}, {11, 30}})); // 4
        System.out.println(minMeetingRooms(new int[][]{{0, 10}, {10, 20}}));               // 1
        System.out.println(minMeetingRooms(new int[][]{{5, 8}, {6, 8}}));                   // 2
        System.out.println(minMeetingRooms(new int[][]{{0, 5}, {0, 5}, {0, 5}}));          // 3
        System.out.println(minMeetingRooms(new int[][]{{1, 100}}));                        // 1
        System.out.println(minMeetingRooms(new int[][]{{1, 4}, {2, 3}, {3, 5}, {4, 6}}));  // 2
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
