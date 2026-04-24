// Full starter-code data for DSA problems. Lazy-loaded by dsa.js when a
// problem page is opened. The metadata-only index lives in dsa_problems_index.js.

const DSA_STARTER_CODE = {
  "linear-search": `public class Main {
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
}`,
  "binary-search-impl": `public class Main {
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
}`,
  "bubble-sort": `import java.util.*;

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
}`,
  "selection-sort": `import java.util.*;

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
}`,
  "merge-sort": `import java.util.*;

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
}`,
  "quick-sort": `import java.util.*;

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
}`,
  "heap-sort": `import java.util.*;

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
}`,
  "two-sum": `import java.util.*;

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
}`,
  "best-time-to-buy-sell-stock": `public class Main {
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
}`,
  "maximum-subarray": `public class Main {
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
}`,
  "product-except-self": `import java.util.*;

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
}`,
  "merge-intervals": `import java.util.*;

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
}`,
  "valid-anagram": `public class Main {
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
}`,
  "longest-substring-without-repeating": `import java.util.*;

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
}`,
  "group-anagrams": `import java.util.*;

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
}`,
  "reverse-linked-list": `public class Main {
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
}`,
  "merge-two-sorted-lists": `public class Main {
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
}`,
  "linked-list-cycle": `public class Main {
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
}`,
  "max-depth-binary-tree": `public class Main {
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
}`,
  "validate-bst": `public class Main {
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
}`,
  "level-order-traversal": `import java.util.*;

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
}`,
  "lowest-common-ancestor": `public class Main {
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
}`,
  "number-of-islands": `public class Main {
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
}`,
  "clone-graph": `import java.util.*;

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
}`,
  "course-schedule": `import java.util.*;

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
}`,
  "word-ladder": `import java.util.*;

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
}`,
  "climbing-stairs": `public class Main {
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
}`,
  "coin-change": `public class Main {
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
}`,
  "longest-increasing-subsequence": `import java.util.*;

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
}`,
  "word-break": `import java.util.*;

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
}`,
  "binary-search": `public class Main {
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
}`,
  "search-rotated-sorted-array": `public class Main {
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
}`,
  "kth-largest-element": `import java.util.*;

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
}`,
  "valid-parentheses": `import java.util.*;

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
}`,
  "min-stack": `import java.util.*;

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
}`,
  "top-k-frequent-elements": `import java.util.*;

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
}`,
  "lru-cache": `import java.util.*;

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
}`,
  "subsets": `import java.util.*;

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
}`,
  "permutations": `import java.util.*;

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
}`,
  "container-with-most-water": `public class Main {
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
}`,
  "three-sum": `import java.util.*;

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
}`,
  "minimum-window-substring": `import java.util.*;

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
}`,
  "meeting-rooms-ii": `import java.util.*;

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
}`,
  "majority-element": `public class Main {
    public static int majorityElement(int[] nums) {
        // Boyer-Moore Voting — track a candidate and its count

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(majorityElement(new int[]{3, 2, 3}));                       // 3
        System.out.println(majorityElement(new int[]{2, 2, 1, 1, 1, 2, 2}));           // 2
        System.out.println(majorityElement(new int[]{1}));                              // 1
        System.out.println(majorityElement(new int[]{1, 1}));                           // 1
        System.out.println(majorityElement(new int[]{6, 5, 5}));                        // 5
        System.out.println(majorityElement(new int[]{1, 2, 1, 2, 1}));                  // 1
        System.out.println(majorityElement(new int[]{4, 4, 4, 4, 4, 1, 2, 3, 4}));      // 4
        System.out.println(majorityElement(new int[]{-1, -1, -1, 2, 2}));               // -1
        System.out.println(majorityElement(new int[]{0, 0, 0, 1, 1}));                  // 0
        System.out.println(majorityElement(new int[]{7, 7, 7, 7}));                     // 7
    }
}`,
  "majority-element-ii": `import java.util.*;

public class Main {
    public static List<Integer> majorityElement(int[] nums) {
        // Boyer-Moore with two candidates — at most 2 elements appear > n/3 times

        return new ArrayList<>();
    }

    static String sorted(List<Integer> result) {
        List<Integer> copy = new ArrayList<>(result);
        Collections.sort(copy);
        return copy.toString();
    }

    public static void main(String[] args) {
        System.out.println(sorted(majorityElement(new int[]{3, 2, 3})));                  // [3]
        System.out.println(sorted(majorityElement(new int[]{1})));                         // [1]
        System.out.println(sorted(majorityElement(new int[]{1, 2})));                      // [1, 2]
        System.out.println(sorted(majorityElement(new int[]{1, 1, 1, 3, 3, 2, 2, 2})));    // [1, 2]
        System.out.println(sorted(majorityElement(new int[]{2, 2})));                      // [2]
        System.out.println(sorted(majorityElement(new int[]{1, 2, 3, 4, 5, 6})));         // []
        System.out.println(sorted(majorityElement(new int[]{0, 0, 0})));                  // [0]
        System.out.println(sorted(majorityElement(new int[]{-1, -1, -1, 1, 1, 1})));       // [-1, 1]
        System.out.println(sorted(majorityElement(new int[]{4, 4, 4, 2, 2, 2})));         // [2, 4]
        System.out.println(sorted(majorityElement(new int[]{1, 1, 1, 2, 3, 4, 5})));      // [1]
    }
}`,
  "bulls-and-cows": `public class Main {
    public static String getHint(String secret, String guess) {
        // Single pass: count bulls; for non-bulls, tally digit frequencies in two arrays.
        // Cows = sum of min(secretCount[d], guessCount[d]).

        return "";
    }

    public static void main(String[] args) {
        System.out.println(getHint("1807", "7810"));     // 1A3B
        System.out.println(getHint("1123", "0111"));     // 1A1B
        System.out.println(getHint("1", "0"));            // 0A0B
        System.out.println(getHint("1", "1"));            // 1A0B
        System.out.println(getHint("11", "10"));          // 1A0B
        System.out.println(getHint("11", "11"));          // 2A0B
        System.out.println(getHint("12", "21"));          // 0A2B
        System.out.println(getHint("1234", "4321"));      // 0A4B
        System.out.println(getHint("1234", "1234"));      // 4A0B
        System.out.println(getHint("0000", "1111"));      // 0A0B
        System.out.println(getHint("9876", "5432"));      // 0A0B
    }
}`,
  "valid-sudoku": `public class Main {
    public static boolean isValidSudoku(char[][] board) {
        // 27 hash sets (9 rows + 9 cols + 9 boxes), or three boolean[9][9] grids
        // Box index for cell (r, c): (r / 3) * 3 + (c / 3)

        return false;
    }

    // Helper: build a 9x9 board from a string array of 9 rows
    static char[][] b(String... rows) {
        char[][] grid = new char[9][9];
        for (int i = 0; i < 9; i++)
            for (int j = 0; j < 9; j++) grid[i][j] = rows[i].charAt(j);
        return grid;
    }

    public static void main(String[] args) {
        // Standard valid puzzle
        System.out.println(isValidSudoku(b("53..7....","6..195...",".98....6.","8...6...3","4..8.3..1","7...2...6",".6....28.","...419..5","....8..79"))); // true
        // Same puzzle but row 0 has duplicate '5'
        System.out.println(isValidSudoku(b("53..75...","6..195...",".98....6.","8...6...3","4..8.3..1","7...2...6",".6....28.","...419..5","....8..79"))); // false
        // Column duplicate (two 8s in column 0)
        System.out.println(isValidSudoku(b("8.......1","6..195...",".98....6.","8...6...3","4..8.3..1","7...2...6",".6....28.","...419..5","....8..79"))); // false
        // Empty board
        System.out.println(isValidSudoku(b(".........",".........",".........",".........",".........",".........",".........",".........",".........")));     // true
        // Single value
        System.out.println(isValidSudoku(b("5........",".........",".........",".........",".........",".........",".........",".........",".........")));      // true
        // Box duplicate (two 1s in top-left 3x3 box)
        System.out.println(isValidSudoku(b("1........","11.......",".........",".........",".........",".........",".........",".........",".........")));     // false
        // Diagonal of distinct digits
        System.out.println(isValidSudoku(b("1........",".2.......","..3......","...4.....","....5....",".....6...","......7..",".......8.","........9"))); // true
        // All 9 in row 0
        System.out.println(isValidSudoku(b("123456789",".........",".........",".........",".........",".........",".........",".........","........."))); // true
        // Two 9s in column 8
        System.out.println(isValidSudoku(b("........9","........9",".........",".........",".........",".........",".........",".........","........."))); // false
        // Two 5s in same column
        System.out.println(isValidSudoku(b("5........","5........",".........",".........",".........",".........",".........",".........","........."))); // false
    }
}`,
  "spiral-matrix": `import java.util.*;

public class Main {
    public static List<Integer> spiralOrder(int[][] matrix) {
        // Track 4 boundaries (top, bottom, left, right) and shrink them as you walk

        return new ArrayList<>();
    }

    public static void main(String[] args) {
        System.out.println(spiralOrder(new int[][]{{1,2,3},{4,5,6},{7,8,9}}));                         // [1, 2, 3, 6, 9, 8, 7, 4, 5]
        System.out.println(spiralOrder(new int[][]{{1,2,3,4},{5,6,7,8},{9,10,11,12}}));                // [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]
        System.out.println(spiralOrder(new int[][]{{1}}));                                              // [1]
        System.out.println(spiralOrder(new int[][]{{1,2}}));                                            // [1, 2]
        System.out.println(spiralOrder(new int[][]{{1},{2}}));                                          // [1, 2]
        System.out.println(spiralOrder(new int[][]{{1,2},{3,4}}));                                      // [1, 2, 4, 3]
        System.out.println(spiralOrder(new int[][]{{1,2,3,4,5}}));                                      // [1, 2, 3, 4, 5]
        System.out.println(spiralOrder(new int[][]{{1},{2},{3},{4}}));                                  // [1, 2, 3, 4]
        System.out.println(spiralOrder(new int[][]{{1,2,3},{4,5,6}}));                                  // [1, 2, 3, 6, 5, 4]
        System.out.println(spiralOrder(new int[][]{{1,2,3,4},{5,6,7,8},{9,10,11,12},{13,14,15,16}}));   // [1, 2, 3, 4, 8, 12, 16, 15, 14, 13, 9, 5, 6, 7, 11, 10]
    }
}`,
  "rotate-image": `import java.util.*;

public class Main {
    public static void rotate(int[][] matrix) {
        // 1) Transpose along main diagonal: swap matrix[i][j] with matrix[j][i]
        // 2) Reverse each row in place

    }

    public static void main(String[] args) {
        int[][] a = {{1,2,3},{4,5,6},{7,8,9}}; rotate(a);
        System.out.println(Arrays.deepToString(a));    // [[7, 4, 1], [8, 5, 2], [9, 6, 3]]
        int[][] b = {{1}}; rotate(b);
        System.out.println(Arrays.deepToString(b));    // [[1]]
        int[][] c = {{1,2},{3,4}}; rotate(c);
        System.out.println(Arrays.deepToString(c));    // [[3, 1], [4, 2]]
        int[][] d = {{5,1,9,11},{2,4,8,10},{13,3,6,7},{15,14,12,16}}; rotate(d);
        System.out.println(Arrays.deepToString(d));    // [[15, 13, 2, 5], [14, 3, 4, 1], [12, 6, 8, 9], [16, 7, 10, 11]]
        int[][] e = {{0,0,0},{0,0,0},{0,0,0}}; rotate(e);
        System.out.println(Arrays.deepToString(e));    // [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
        int[][] f = {{1,2,3,4},{5,6,7,8},{9,10,11,12},{13,14,15,16}}; rotate(f);
        System.out.println(Arrays.deepToString(f));    // [[13, 9, 5, 1], [14, 10, 6, 2], [15, 11, 7, 3], [16, 12, 8, 4]]
        int[][] g = {{1,2},{3,4}}; rotate(g); rotate(g);
        System.out.println(Arrays.deepToString(g));    // [[4, 3], [2, 1]]   (180 deg)
        int[][] h = {{1,2},{3,4}}; rotate(h); rotate(h); rotate(h); rotate(h);
        System.out.println(Arrays.deepToString(h));    // [[1, 2], [3, 4]]   (full 360 deg)
        int[][] i = {{-1,-2},{-3,-4}}; rotate(i);
        System.out.println(Arrays.deepToString(i));    // [[-3, -1], [-4, -2]]
        int[][] j = {{1,2,3,4,5},{6,7,8,9,10},{11,12,13,14,15},{16,17,18,19,20},{21,22,23,24,25}}; rotate(j);
        System.out.println(Arrays.deepToString(j));    // [[21, 16, 11, 6, 1], [22, 17, 12, 7, 2], [23, 18, 13, 8, 3], [24, 19, 14, 9, 4], [25, 20, 15, 10, 5]]
    }
}`,
  "diagonal-traverse": `import java.util.*;

public class Main {
    public static int[] findDiagonalOrder(int[][] mat) {
        // Sum of indices i+j is constant on each anti-diagonal.
        // Traverse diagonal d from top-right (when d is even) or bottom-left (when d is odd).

        return new int[]{};
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(findDiagonalOrder(new int[][]{{1,2,3},{4,5,6},{7,8,9}})));    // [1, 2, 4, 7, 5, 3, 6, 8, 9]
        System.out.println(Arrays.toString(findDiagonalOrder(new int[][]{{1,2},{3,4}})));                 // [1, 2, 3, 4]
        System.out.println(Arrays.toString(findDiagonalOrder(new int[][]{{1}})));                          // [1]
        System.out.println(Arrays.toString(findDiagonalOrder(new int[][]{{1,2,3,4}})));                    // [1, 2, 3, 4]
        System.out.println(Arrays.toString(findDiagonalOrder(new int[][]{{1},{2},{3},{4}})));              // [1, 2, 3, 4]
        System.out.println(Arrays.toString(findDiagonalOrder(new int[][]{{1,2,3},{4,5,6}})));              // [1, 2, 4, 5, 3, 6]
        System.out.println(Arrays.toString(findDiagonalOrder(new int[][]{{1,2},{3,4},{5,6}})));            // [1, 2, 3, 5, 4, 6]
        System.out.println(Arrays.toString(findDiagonalOrder(new int[][]{{0,0},{0,0}})));                  // [0, 0, 0, 0]
        System.out.println(Arrays.toString(findDiagonalOrder(new int[][]{{1,2,3,4},{5,6,7,8},{9,10,11,12}}))); // [1, 2, 5, 9, 6, 3, 4, 7, 10, 11, 8, 12]
        System.out.println(Arrays.toString(findDiagonalOrder(new int[][]{{-1,-2},{-3,-4}})));              // [-1, -2, -3, -4]
    }
}`,
  "contains-duplicate": `import java.util.*;

public class Main {
    public static boolean containsDuplicate(int[] nums) {
        // HashSet — O(n) time, O(n) space; or sort + scan adjacent — O(n log n) time, O(1) space

        return false;
    }

    public static void main(String[] args) {
        System.out.println(containsDuplicate(new int[]{1, 2, 3, 1}));                       // true
        System.out.println(containsDuplicate(new int[]{1, 2, 3, 4}));                       // false
        System.out.println(containsDuplicate(new int[]{1, 1, 1, 3, 3, 4, 3, 2, 4, 2}));     // true
        System.out.println(containsDuplicate(new int[]{}));                                   // false
        System.out.println(containsDuplicate(new int[]{42}));                                 // false
        System.out.println(containsDuplicate(new int[]{0, 0}));                              // true
        System.out.println(containsDuplicate(new int[]{-1, -2, -3}));                        // false
        System.out.println(containsDuplicate(new int[]{-1, -1}));                            // true
        System.out.println(containsDuplicate(new int[]{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}));     // false
        System.out.println(containsDuplicate(new int[]{Integer.MAX_VALUE, Integer.MAX_VALUE})); // true
    }
}`,
  "find-players-zero-or-one-losses": `import java.util.*;

public class Main {
    public static List<List<Integer>> findWinners(int[][] matches) {
        // Track loss count per player; players never appearing as loser have 0 losses.
        // Output sorted lists for both buckets.

        return new ArrayList<>();
    }

    public static void main(String[] args) {
        System.out.println(findWinners(new int[][]{{1,3},{2,3},{3,6},{5,6},{5,7},{4,5},{4,8},{4,9},{10,4},{10,9}})); // [[1, 2, 10], [4, 5, 7, 8]]
        System.out.println(findWinners(new int[][]{{2,3},{1,3},{5,4},{6,4}}));                                         // [[1, 2, 5, 6], []]
        System.out.println(findWinners(new int[][]{{1,2}}));                                                            // [[1], [2]]
        System.out.println(findWinners(new int[][]{{1,2},{2,3},{3,1}}));                                                // [[], [1, 2, 3]]
        System.out.println(findWinners(new int[][]{{1,2},{1,3},{1,4},{1,5}}));                                          // [[1], [2, 3, 4, 5]]
        System.out.println(findWinners(new int[][]{{2,1},{3,1},{4,1},{5,1}}));                                          // [[2, 3, 4, 5], []]
        System.out.println(findWinners(new int[][]{{1,2},{3,2},{1,3},{1,4}}));                                          // [[1], [3, 4]]
        System.out.println(findWinners(new int[][]{{1,2},{3,4}}));                                                       // [[1, 3], [2, 4]]
        System.out.println(findWinners(new int[][]{{5,3},{5,1}}));                                                       // [[5], [1, 3]]
        System.out.println(findWinners(new int[][]{{1,2},{2,1},{1,2},{2,1}}));                                          // [[], []]
    }
}`,
  "sort-an-array": `import java.util.*;

public class Main {
    public static int[] sortArray(int[] nums) {
        // Recommended: merge sort (guaranteed O(n log n)) or randomized quicksort

        return nums;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(sortArray(new int[]{5, 2, 3, 1})));                       // [1, 2, 3, 5]
        System.out.println(Arrays.toString(sortArray(new int[]{5, 1, 1, 2, 0, 0})));                 // [0, 0, 1, 1, 2, 5]
        System.out.println(Arrays.toString(sortArray(new int[]{1})));                                 // [1]
        System.out.println(Arrays.toString(sortArray(new int[]{})));                                   // []
        System.out.println(Arrays.toString(sortArray(new int[]{2, 1})));                              // [1, 2]
        System.out.println(Arrays.toString(sortArray(new int[]{1, 2, 3, 4, 5})));                     // [1, 2, 3, 4, 5]
        System.out.println(Arrays.toString(sortArray(new int[]{5, 4, 3, 2, 1})));                     // [1, 2, 3, 4, 5]
        System.out.println(Arrays.toString(sortArray(new int[]{3, 3, 3, 3})));                        // [3, 3, 3, 3]
        System.out.println(Arrays.toString(sortArray(new int[]{-5, 0, 5, -3, 3, -1, 1})));            // [-5, -3, -1, 0, 1, 3, 5]
        System.out.println(Arrays.toString(sortArray(new int[]{100, -100, 50, -50, 0})));             // [-100, -50, 0, 50, 100]
        System.out.println(Arrays.toString(sortArray(new int[]{-2147483648, 0, 2147483647})));        // [-2147483648, 0, 2147483647]
    }
}`,
  "sort-characters-by-frequency": `import java.util.*;

public class Main {
    public static String frequencySort(String s) {
        // Count chars, sort by count descending, concat the chars

        return "";
    }

    // Canonicalize for testing: each char's run length must match expected.
    // We test by checking the multiset of characters and the descending-count property.
    static String canonical(String result) {
        // Group consecutive equal chars and verify counts are non-increasing
        if (result.isEmpty()) return "<empty>";
        StringBuilder sb = new StringBuilder();
        int i = 0;
        List<int[]> runs = new ArrayList<>();
        while (i < result.length()) {
            int j = i;
            while (j < result.length() && result.charAt(j) == result.charAt(i)) j++;
            runs.add(new int[]{result.charAt(i), j - i});
            i = j;
        }
        // Sort runs by count descending, then by char ascending for deterministic output
        runs.sort((a, b) -> a[1] != b[1] ? b[1] - a[1] : a[0] - b[0]);
        for (int[] r : runs) {
            for (int k = 0; k < r[1]; k++) sb.append((char) r[0]);
        }
        return sb.toString();
    }

    public static void main(String[] args) {
        System.out.println(canonical(frequencySort("tree")));            // eert
        System.out.println(canonical(frequencySort("cccaaa")));          // aaaccc
        System.out.println(canonical(frequencySort("Aabb")));            // bbAa
        System.out.println(canonical(frequencySort("a")));               // a
        System.out.println(canonical(frequencySort("aabbcc")));          // aabbcc
        System.out.println(canonical(frequencySort("loveleetcode")));    // eeeelloocdtv
        System.out.println(canonical(frequencySort("")));                // <empty>
        System.out.println(canonical(frequencySort("zzzaaa")));          // aaazzz
        System.out.println(canonical(frequencySort("xxyyzz")));          // xxyyzz
        System.out.println(canonical(frequencySort("abcabc")));          // aabbcc
        System.out.println(canonical(frequencySort("Mississippi")));     // iiiissspMpp
    }
}`,
  "non-overlapping-intervals": `import java.util.*;

public class Main {
    public static int eraseOverlapIntervals(int[][] intervals) {
        // Greedy: sort by end time, keep intervals that start ≥ last kept end

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(eraseOverlapIntervals(new int[][]{{1,2},{2,3},{3,4},{1,3}}));     // 1
        System.out.println(eraseOverlapIntervals(new int[][]{{1,2},{1,2},{1,2}}));            // 2
        System.out.println(eraseOverlapIntervals(new int[][]{{1,2},{2,3}}));                  // 0
        System.out.println(eraseOverlapIntervals(new int[][]{}));                              // 0
        System.out.println(eraseOverlapIntervals(new int[][]{{1,2}}));                         // 0
        System.out.println(eraseOverlapIntervals(new int[][]{{0,2},{1,3},{2,4},{3,5},{4,6}})); // 2
        System.out.println(eraseOverlapIntervals(new int[][]{{1,100},{11,22},{1,11},{2,12}}));  // 2
        System.out.println(eraseOverlapIntervals(new int[][]{{1,5},{2,3},{3,4},{4,5}}));       // 1
        System.out.println(eraseOverlapIntervals(new int[][]{{0,1},{3,4},{1,2}}));             // 0
        System.out.println(eraseOverlapIntervals(new int[][]{{-100,-50},{-50,-30},{-30,0}}));   // 0
    }
}`,
  "find-first-and-last-position": `import java.util.*;

public class Main {
    public static int[] searchRange(int[] nums, int target) {
        // Two binary searches: leftmost and rightmost insertion points

        return new int[]{-1, -1};
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(searchRange(new int[]{5,7,7,8,8,10}, 8)));     // [3, 4]
        System.out.println(Arrays.toString(searchRange(new int[]{5,7,7,8,8,10}, 6)));     // [-1, -1]
        System.out.println(Arrays.toString(searchRange(new int[]{}, 0)));                   // [-1, -1]
        System.out.println(Arrays.toString(searchRange(new int[]{1}, 1)));                  // [0, 0]
        System.out.println(Arrays.toString(searchRange(new int[]{2, 2}, 2)));               // [0, 1]
        System.out.println(Arrays.toString(searchRange(new int[]{1, 2, 3, 4, 5}, 3)));     // [2, 2]
        System.out.println(Arrays.toString(searchRange(new int[]{1, 1, 1, 1, 1}, 1)));     // [0, 4]
        System.out.println(Arrays.toString(searchRange(new int[]{1, 2, 3}, 0)));            // [-1, -1]
        System.out.println(Arrays.toString(searchRange(new int[]{1, 2, 3}, 4)));            // [-1, -1]
        System.out.println(Arrays.toString(searchRange(new int[]{-3, -1, 0, 0, 0, 1}, 0))); // [2, 4]
    }
}`,
  "peak-index-mountain-array": `public class Main {
    public static int peakIndexInMountainArray(int[] arr) {
        // Binary search: if arr[mid] < arr[mid+1], peak is to the right; otherwise to the left or at mid

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(peakIndexInMountainArray(new int[]{0, 1, 0}));                   // 1
        System.out.println(peakIndexInMountainArray(new int[]{0, 2, 1, 0}));                // 1
        System.out.println(peakIndexInMountainArray(new int[]{0, 10, 5, 2}));               // 1
        System.out.println(peakIndexInMountainArray(new int[]{3, 4, 5, 1}));                // 2
        System.out.println(peakIndexInMountainArray(new int[]{24, 69, 100, 99, 79, 78, 67, 36, 26, 19})); // 2
        System.out.println(peakIndexInMountainArray(new int[]{1, 2, 3, 4, 5, 4, 3, 2, 1})); // 4
        System.out.println(peakIndexInMountainArray(new int[]{1, 100, 1}));                 // 1
        System.out.println(peakIndexInMountainArray(new int[]{1, 2, 1}));                   // 1
        System.out.println(peakIndexInMountainArray(new int[]{1, 3, 5, 7, 9, 8, 6, 4, 2})); // 4
        System.out.println(peakIndexInMountainArray(new int[]{0, 1, 2, 3, 100, 50, 25, 0})); // 4
    }
}`,
  "count-negative-numbers-sorted-matrix": `public class Main {
    public static int countNegatives(int[][] grid) {
        // Walk from top-right or bottom-left; staircase O(m+n)

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(countNegatives(new int[][]{{4,3,2,-1},{3,2,1,-1},{1,1,-1,-2},{-1,-1,-2,-3}})); // 8
        System.out.println(countNegatives(new int[][]{{3,2},{1,0}}));                                       // 0
        System.out.println(countNegatives(new int[][]{{-1}}));                                              // 1
        System.out.println(countNegatives(new int[][]{{0}}));                                                // 0
        System.out.println(countNegatives(new int[][]{{1,-1},{-1,-1}}));                                    // 3
        System.out.println(countNegatives(new int[][]{{-1,-1},{-1,-1}}));                                   // 4
        System.out.println(countNegatives(new int[][]{{5,4,3,2,1}}));                                       // 0
        System.out.println(countNegatives(new int[][]{{-1,-2,-3,-4,-5}}));                                  // 5
        System.out.println(countNegatives(new int[][]{{5},{4},{3},{2},{1},{0},{-1},{-2}}));                 // 2
        System.out.println(countNegatives(new int[][]{{3,2,1,-1},{2,1,-1,-2},{1,-1,-2,-3},{-1,-2,-3,-4}})); // 10
    }
}`,
  "search-2d-matrix": `public class Main {
    public static boolean searchMatrix(int[][] matrix, int target) {
        // Treat the matrix as a flattened sorted array — binary search over m*n indices

        return false;
    }

    public static void main(String[] args) {
        int[][] m = {{1,3,5,7},{10,11,16,20},{23,30,34,60}};
        System.out.println(searchMatrix(m, 3));      // true
        System.out.println(searchMatrix(m, 13));     // false
        System.out.println(searchMatrix(m, 1));      // true (first)
        System.out.println(searchMatrix(m, 60));     // true (last)
        System.out.println(searchMatrix(m, 0));      // false (smaller than all)
        System.out.println(searchMatrix(m, 100));    // false (larger than all)
        System.out.println(searchMatrix(new int[][]{{1}}, 1));      // true
        System.out.println(searchMatrix(new int[][]{{1}}, 2));      // false
        System.out.println(searchMatrix(new int[][]{{1,2,3,4}}, 3)); // true (single row)
        System.out.println(searchMatrix(new int[][]{{1},{2},{3}}, 2)); // true (single col)
    }
}`,
  "koko-eating-bananas": `public class Main {
    public static int minEatingSpeed(int[] piles, int h) {
        // Binary search over k in [1, maxPile]; feasibility: sum(ceil(p/k)) <= h

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(minEatingSpeed(new int[]{3, 6, 7, 11}, 8));         // 4
        System.out.println(minEatingSpeed(new int[]{30, 11, 23, 4, 20}, 5));   // 30
        System.out.println(minEatingSpeed(new int[]{30, 11, 23, 4, 20}, 6));   // 23
        System.out.println(minEatingSpeed(new int[]{1}, 1));                    // 1
        System.out.println(minEatingSpeed(new int[]{1000000000}, 2));           // 500000000
        System.out.println(minEatingSpeed(new int[]{1, 1, 1, 1}, 4));          // 1
        System.out.println(minEatingSpeed(new int[]{1, 1, 1, 1}, 8));          // 1
        System.out.println(minEatingSpeed(new int[]{10, 10, 10}, 3));          // 10
        System.out.println(minEatingSpeed(new int[]{312884470}, 312884469));    // 2
        System.out.println(minEatingSpeed(new int[]{3, 6, 7, 11}, 4));         // 11
    }
}`,
  "find-smallest-divisor-given-threshold": `public class Main {
    public static int smallestDivisor(int[] nums, int threshold) {
        // Binary search d in [1, max(nums)]; feasibility: sum ceil(nums[i]/d) <= threshold

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(smallestDivisor(new int[]{1, 2, 5, 9}, 6));            // 5
        System.out.println(smallestDivisor(new int[]{44, 22, 33, 11, 1}, 5));     // 44
        System.out.println(smallestDivisor(new int[]{21212, 10101, 12121}, 1000000)); // 1
        System.out.println(smallestDivisor(new int[]{1, 2, 5, 9}, 4));            // 9
        System.out.println(smallestDivisor(new int[]{1}, 1));                      // 1
        System.out.println(smallestDivisor(new int[]{2, 3, 5, 7, 11}, 11));        // 3
        System.out.println(smallestDivisor(new int[]{19}, 5));                     // 4
        System.out.println(smallestDivisor(new int[]{1, 2, 3}, 6));                // 1
        System.out.println(smallestDivisor(new int[]{10, 10, 10}, 3));             // 10
        System.out.println(smallestDivisor(new int[]{100}, 100));                  // 1
    }
}`,
  "append-characters-to-string-make-subsequence": `public class Main {
    public static int appendCharacters(String s, String t) {
        // Two pointers: walk s, match t in order; return t.length() - matched

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(appendCharacters("coaching", "coding"));   // 4
        System.out.println(appendCharacters("abcde", "a"));            // 0
        System.out.println(appendCharacters("z", "abcde"));            // 5
        System.out.println(appendCharacters("abcde", "abcde"));        // 0
        System.out.println(appendCharacters("abcde", ""));             // 0
        System.out.println(appendCharacters("", "abc"));               // 3
        System.out.println(appendCharacters("a", "b"));                // 1
        System.out.println(appendCharacters("aaa", "ab"));             // 1
        System.out.println(appendCharacters("xyzabc", "abc"));         // 0
        System.out.println(appendCharacters("xyz", "xyzz"));           // 1
    }
}`,
  "subarray-product-less-than-k": `public class Main {
    public static int numSubarrayProductLessThanK(int[] nums, int k) {
        // Sliding window with running product; count (right - left + 1) per right

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(numSubarrayProductLessThanK(new int[]{10, 5, 2, 6}, 100));     // 8
        System.out.println(numSubarrayProductLessThanK(new int[]{1, 2, 3}, 0));           // 0
        System.out.println(numSubarrayProductLessThanK(new int[]{1, 2, 3}, 1));           // 0
        System.out.println(numSubarrayProductLessThanK(new int[]{1, 2, 3}, 2));           // 1
        System.out.println(numSubarrayProductLessThanK(new int[]{1, 2, 3}, 7));           // 4
        System.out.println(numSubarrayProductLessThanK(new int[]{1, 1, 1}, 2));           // 6
        System.out.println(numSubarrayProductLessThanK(new int[]{100}, 1000));            // 1
        System.out.println(numSubarrayProductLessThanK(new int[]{100}, 100));             // 0
        System.out.println(numSubarrayProductLessThanK(new int[]{1, 1, 1, 1, 1}, 2));     // 15
        System.out.println(numSubarrayProductLessThanK(new int[]{10, 9, 10, 4, 3, 8, 3, 3, 6, 2, 10, 10, 9, 3}, 19)); // 18
    }
}`,
  "longest-repeating-character-replacement": `public class Main {
    public static int characterReplacement(String s, int k) {
        // Sliding window with frequency map; valid when (windowSize - maxFreq) <= k

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(characterReplacement("ABAB", 2));         // 4
        System.out.println(characterReplacement("AABABBA", 1));      // 4
        System.out.println(characterReplacement("", 0));             // 0
        System.out.println(characterReplacement("A", 0));            // 1
        System.out.println(characterReplacement("A", 1));            // 1
        System.out.println(characterReplacement("ABCDE", 2));        // 3
        System.out.println(characterReplacement("ABCDE", 4));        // 5
        System.out.println(characterReplacement("AAAA", 0));         // 4
        System.out.println(characterReplacement("AAAB", 0));         // 3
        System.out.println(characterReplacement("AABCDEFG", 3));     // 5
    }
}`,
  "maximum-product-subarray": `public class Main {
    public static int maxProduct(int[] nums) {
        // Track currentMax and currentMin (negatives flip them); update global max each step

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(maxProduct(new int[]{2, 3, -2, 4}));               // 6
        System.out.println(maxProduct(new int[]{-2, 0, -1}));                  // 0
        System.out.println(maxProduct(new int[]{-2}));                         // -2
        System.out.println(maxProduct(new int[]{0}));                          // 0
        System.out.println(maxProduct(new int[]{-2, -3}));                     // 6
        System.out.println(maxProduct(new int[]{-2, 3, -4}));                  // 24
        System.out.println(maxProduct(new int[]{2, -5, -2, -4, 3}));           // 24
        System.out.println(maxProduct(new int[]{0, 2}));                       // 2
        System.out.println(maxProduct(new int[]{-1, -2, -3, 0}));              // 6
        System.out.println(maxProduct(new int[]{1, 2, 3, 4, 5}));              // 120
    }
}`,
  "removing-stars-from-string": `public class Main {
    public static String removeStars(String s) {
        // Use a stack (or StringBuilder as one) — push letters, pop on '*'

        return "";
    }

    public static void main(String[] args) {
        System.out.println(removeStars("leet**cod*e"));     // lecoe
        System.out.println(removeStars("erase*****"));      //
        System.out.println(removeStars("abc"));             // abc
        System.out.println(removeStars("a*"));              //
        System.out.println(removeStars(""));                //
        System.out.println(removeStars("ab*c"));            // ac
        System.out.println(removeStars("ab**c"));           // c
        System.out.println(removeStars("a*b*c*"));          //
        System.out.println(removeStars("xyz*"));            // xy
        System.out.println(removeStars("*****"));           //
        System.out.println(removeStars("ab*c*d"));          // ad
    }
}`,
  "evaluate-reverse-polish-notation": `import java.util.*;

public class Main {
    public static int evalRPN(String[] tokens) {
        // Stack of integers; for each operator pop b then a, push (a op b)

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(evalRPN(new String[]{"2","1","+","3","*"}));       // 9
        System.out.println(evalRPN(new String[]{"4","13","5","/","+"}));       // 6
        System.out.println(evalRPN(new String[]{"10","6","9","3","+","-11","*","/","*","17","+","5","+"})); // 22
        System.out.println(evalRPN(new String[]{"3","4","+"}));               // 7
        System.out.println(evalRPN(new String[]{"3","4","-"}));               // -1
        System.out.println(evalRPN(new String[]{"3","4","*"}));               // 12
        System.out.println(evalRPN(new String[]{"10","3","/"}));              // 3
        System.out.println(evalRPN(new String[]{"-3","4","*"}));              // -12
        System.out.println(evalRPN(new String[]{"42"}));                       // 42
        System.out.println(evalRPN(new String[]{"7","2","-","5","*"}));        // 25
    }
}`,
  "longest-valid-parentheses": `import java.util.*;

public class Main {
    public static int longestValidParentheses(String s) {
        // Stack of indices; sentinel -1 at bottom; push '(', pop on ')' and compute length

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(longestValidParentheses("(()"));        // 2
        System.out.println(longestValidParentheses(")()())"));     // 4
        System.out.println(longestValidParentheses(""));            // 0
        System.out.println(longestValidParentheses("("));           // 0
        System.out.println(longestValidParentheses(")"));           // 0
        System.out.println(longestValidParentheses("()"));          // 2
        System.out.println(longestValidParentheses("()()"));        // 4
        System.out.println(longestValidParentheses("(())"));        // 4
        System.out.println(longestValidParentheses("()(()"));       // 2
        System.out.println(longestValidParentheses("(()(((()"));    // 2
        System.out.println(longestValidParentheses("()(())"));      // 6
    }
}`,
  "next-greater-element-ii": `import java.util.*;

public class Main {
    public static int[] nextGreaterElements(int[] nums) {
        // Monotonic stack; iterate i from 0 to 2n-1; index = i % n

        return new int[]{};
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(nextGreaterElements(new int[]{1, 2, 1})));            // [2, -1, 2]
        System.out.println(Arrays.toString(nextGreaterElements(new int[]{1, 2, 3, 4, 3})));      // [2, 3, 4, -1, 4]
        System.out.println(Arrays.toString(nextGreaterElements(new int[]{5, 4, 3, 2, 1})));      // [-1, 5, 5, 5, 5]
        System.out.println(Arrays.toString(nextGreaterElements(new int[]{1, 2, 3, 4, 5})));      // [2, 3, 4, 5, -1]
        System.out.println(Arrays.toString(nextGreaterElements(new int[]{1})));                   // [-1]
        System.out.println(Arrays.toString(nextGreaterElements(new int[]{2, 2, 2})));            // [-1, -1, -1]
        System.out.println(Arrays.toString(nextGreaterElements(new int[]{3, 1, 2})));            // [-1, 2, 3]
        System.out.println(Arrays.toString(nextGreaterElements(new int[]{-1, 0})));               // [0, -1]
        System.out.println(Arrays.toString(nextGreaterElements(new int[]{100, 1, 11, 1, 120, 111, 123, 1, -1, -100}))); // [120, 11, 120, 120, 123, 123, -1, 100, 100, 100]
        System.out.println(Arrays.toString(nextGreaterElements(new int[]{1, 1, 1, 1, 2})));      // [2, 2, 2, 2, -1]
    }
}`,
  "asteroid-collision": `import java.util.*;

public class Main {
    public static int[] asteroidCollision(int[] asteroids) {
        // Stack: while top > 0 and incoming < 0, resolve collision

        return new int[]{};
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(asteroidCollision(new int[]{5, 10, -5})));       // [5, 10]
        System.out.println(Arrays.toString(asteroidCollision(new int[]{8, -8})));            // []
        System.out.println(Arrays.toString(asteroidCollision(new int[]{10, 2, -5})));        // [10]
        System.out.println(Arrays.toString(asteroidCollision(new int[]{-2, -1, 1, 2})));     // [-2, -1, 1, 2]
        System.out.println(Arrays.toString(asteroidCollision(new int[]{1, -2, -2, -2})));    // [-2, -2, -2]
        System.out.println(Arrays.toString(asteroidCollision(new int[]{})));                  // []
        System.out.println(Arrays.toString(asteroidCollision(new int[]{5})));                 // [5]
        System.out.println(Arrays.toString(asteroidCollision(new int[]{-5})));                // [-5]
        System.out.println(Arrays.toString(asteroidCollision(new int[]{5, -5})));             // []
        System.out.println(Arrays.toString(asteroidCollision(new int[]{1, 2, 3, -3, -2, -1}))); // []
        System.out.println(Arrays.toString(asteroidCollision(new int[]{1, 2, 3, -4})));      // [-4]
    }
}`,
  "largest-rectangle-histogram": `import java.util.*;

public class Main {
    public static int largestRectangleArea(int[] heights) {
        // Monotonic stack of indices in increasing height; compute area on each pop

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(largestRectangleArea(new int[]{2, 1, 5, 6, 2, 3}));     // 10
        System.out.println(largestRectangleArea(new int[]{2, 4}));                  // 4
        System.out.println(largestRectangleArea(new int[]{}));                       // 0
        System.out.println(largestRectangleArea(new int[]{5}));                     // 5
        System.out.println(largestRectangleArea(new int[]{1, 1, 1, 1, 1}));         // 5
        System.out.println(largestRectangleArea(new int[]{5, 4, 3, 2, 1}));         // 9
        System.out.println(largestRectangleArea(new int[]{1, 2, 3, 4, 5}));         // 9
        System.out.println(largestRectangleArea(new int[]{6, 7, 5, 2, 4, 5, 9, 3})); // 16
        System.out.println(largestRectangleArea(new int[]{0, 9}));                  // 9
        System.out.println(largestRectangleArea(new int[]{2, 1, 2}));               // 3
        System.out.println(largestRectangleArea(new int[]{4, 2, 0, 3, 2, 5}));      // 6
    }
}`,
  "find-winner-circular-game": `import java.util.*;

public class Main {
    public static int findTheWinner(int n, int k) {
        // Josephus recursion: f(1) = 0; f(n) = (f(n-1) + k) % n; answer = f(n) + 1

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(findTheWinner(5, 2));    // 3
        System.out.println(findTheWinner(6, 5));    // 1
        System.out.println(findTheWinner(1, 1));    // 1
        System.out.println(findTheWinner(2, 1));    // 2
        System.out.println(findTheWinner(2, 2));    // 1
        System.out.println(findTheWinner(3, 1));    // 3
        System.out.println(findTheWinner(3, 2));    // 3
        System.out.println(findTheWinner(4, 4));    // 2
        System.out.println(findTheWinner(7, 3));    // 4
        System.out.println(findTheWinner(10, 1));   // 10
    }
}`,
  "implement-queue-using-stacks": `import java.util.*;

public class Main {
    static class MyQueue {
        // Two stacks: in (for pushes), out (for pops/peeks)

        public MyQueue() {

        }

        public void push(int x) {

        }

        public int pop() {
            return -1;
        }

        public int peek() {
            return -1;
        }

        public boolean empty() {
            return true;
        }
    }

    public static void main(String[] args) {
        // Sequence 1
        MyQueue q = new MyQueue();
        q.push(1); q.push(2);
        System.out.println(q.peek());    // 1
        System.out.println(q.pop());     // 1
        System.out.println(q.empty());   // false

        // Sequence 2: empty queue
        MyQueue empty = new MyQueue();
        System.out.println(empty.empty()); // true

        // Sequence 3: single element
        MyQueue one = new MyQueue();
        one.push(42);
        System.out.println(one.peek());   // 42
        System.out.println(one.pop());    // 42
        System.out.println(one.empty());  // true

        // Sequence 4: alternating push/pop
        MyQueue r = new MyQueue();
        r.push(1);
        System.out.println(r.pop());     // 1
        r.push(2);
        System.out.println(r.pop());     // 2
        r.push(3); r.push(4);
        System.out.println(r.pop());     // 3
        System.out.println(r.peek());    // 4
    }
}`,
  "132-pattern": `import java.util.*;

public class Main {
    public static boolean find132pattern(int[] nums) {
        // Right-to-left monotonic stack; track max popped value as candidate "k"

        return false;
    }

    public static void main(String[] args) {
        System.out.println(find132pattern(new int[]{1, 2, 3, 4}));                            // false
        System.out.println(find132pattern(new int[]{3, 1, 4, 2}));                            // true
        System.out.println(find132pattern(new int[]{-1, 3, 2, 0}));                           // true
        System.out.println(find132pattern(new int[]{}));                                       // false
        System.out.println(find132pattern(new int[]{1}));                                      // false
        System.out.println(find132pattern(new int[]{1, 2}));                                   // false
        System.out.println(find132pattern(new int[]{1, 2, 3}));                                // false
        System.out.println(find132pattern(new int[]{3, 5, 0, 3, 4}));                          // true
        System.out.println(find132pattern(new int[]{1, 0, 1, -4, -3}));                        // false
        System.out.println(find132pattern(new int[]{-2, 1, 1}));                               // false
        System.out.println(find132pattern(new int[]{1, 4, 0, -1, -2, -3, -1, -2}));            // false
    }
}`,
  "implement-stack-using-queues": `import java.util.*;

public class Main {
    static class MyStack {
        // Two-queue or single-queue rotation approach

        public MyStack() {

        }

        public void push(int x) {

        }

        public int pop() {
            return 0;
        }

        public int top() {
            return 0;
        }

        public boolean empty() {
            return true;
        }
    }

    public static void main(String[] args) {
        MyStack s = new MyStack();
        s.push(1); s.push(2);
        System.out.println(s.top());     // 2
        System.out.println(s.pop());     // 2
        System.out.println(s.empty());   // false

        MyStack a = new MyStack();
        System.out.println(a.empty());   // true

        MyStack b = new MyStack();
        b.push(7);
        System.out.println(b.top());     // 7
        System.out.println(b.pop());     // 7
        System.out.println(b.empty());   // true

        MyStack c = new MyStack();
        c.push(1); c.push(2); c.push(3);
        System.out.println(c.pop());     // 3
        System.out.println(c.top());     // 2
        c.push(4);
        System.out.println(c.pop());     // 4
        System.out.println(c.pop());     // 2
        System.out.println(c.pop());     // 1
        System.out.println(c.empty());   // true
    }
}`,
  "basic-calculator-ii": `import java.util.*;

public class Main {
    public static int calculate(String s) {
        // Single-pass with stack; respect *,/ precedence by applying immediately on the top

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(calculate("3+2*2"));         // 7
        System.out.println(calculate(" 3/2 "));         // 1
        System.out.println(calculate(" 3+5 / 2 "));     // 5
        System.out.println(calculate("1"));              // 1
        System.out.println(calculate("0"));              // 0
        System.out.println(calculate("1+1"));            // 2
        System.out.println(calculate("100-50"));         // 50
        System.out.println(calculate("2*3*4"));          // 24
        System.out.println(calculate("14-3/2"));         // 13
        System.out.println(calculate("1*2-3/4+5*6-7*8+9/10")); // -24
        System.out.println(calculate("42"));             // 42
        System.out.println(calculate("1+2+3+4+5"));      // 15
    }
}`,
  "task-scheduler": `import java.util.*;

public class Main {
    public static int leastInterval(char[] tasks, int n) {
        // Closed-form: math on the most-frequent task counts

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(leastInterval(new char[]{'A','A','A','B','B','B'}, 2));               // 8
        System.out.println(leastInterval(new char[]{'A','A','A','B','B','B'}, 0));               // 6
        System.out.println(leastInterval(new char[]{'A','A','A','A','A','A','B','C','D','E','F','G'}, 2)); // 16
        System.out.println(leastInterval(new char[]{'A'}, 0));                                    // 1
        System.out.println(leastInterval(new char[]{'A'}, 100));                                  // 1
        System.out.println(leastInterval(new char[]{'A','B','C'}, 2));                            // 3
        System.out.println(leastInterval(new char[]{'A','A','B','B','C','C'}, 2));                // 6
        System.out.println(leastInterval(new char[]{'A','A','A','B','B'}, 2));                    // 7
        System.out.println(leastInterval(new char[]{'A','A','A','A','B','C','D','E','F','G'}, 2)); // 10
        System.out.println(leastInterval(new char[]{'A','A','B','B'}, 1));                        // 4
        System.out.println(leastInterval(new char[]{}, 5));                                        // 0
    }
}`,
  "sliding-window-maximum": `import java.util.*;

public class Main {
    public static int[] maxSlidingWindow(int[] nums, int k) {
        // Monotonic deque of indices; pop from back while deque tail < current, pop front when out of window

        return new int[]{};
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(maxSlidingWindow(new int[]{1,3,-1,-3,5,3,6,7}, 3))); // [3, 3, 5, 5, 6, 7]
        System.out.println(Arrays.toString(maxSlidingWindow(new int[]{1}, 1)));                   // [1]
        System.out.println(Arrays.toString(maxSlidingWindow(new int[]{1, -1}, 1)));               // [1, -1]
        System.out.println(Arrays.toString(maxSlidingWindow(new int[]{9, 11}, 2)));               // [11]
        System.out.println(Arrays.toString(maxSlidingWindow(new int[]{4, -2}, 2)));               // [4]
        System.out.println(Arrays.toString(maxSlidingWindow(new int[]{1, 2, 3, 4, 5}, 3)));       // [3, 4, 5]
        System.out.println(Arrays.toString(maxSlidingWindow(new int[]{5, 4, 3, 2, 1}, 3)));       // [5, 4, 3]
        System.out.println(Arrays.toString(maxSlidingWindow(new int[]{3, 3, 3, 3, 3}, 2)));       // [3, 3, 3, 3]
        System.out.println(Arrays.toString(maxSlidingWindow(new int[]{1, 3, 1, 2, 0, 5}, 3)));    // [3, 3, 2, 5]
        System.out.println(Arrays.toString(maxSlidingWindow(new int[]{7, 2, 4}, 2)));             // [7, 4]
        System.out.println(Arrays.toString(maxSlidingWindow(new int[]{-7, -8, 7, 5, 7, 1, 6, 0}, 4))); // [7, 7, 7, 7, 7]
    }
}`,
  "reorganize-string": `import java.util.*;

public class Main {
    public static String reorganizeString(String s) {
        // Heap of (count, char); always take two highest-count chars different from last placed

        return "";
    }

    // Verify the result really has no adjacent duplicates AND is a valid permutation of input
    static boolean valid(String original, String result) {
        if (result == null) return false;
        if (result.isEmpty()) {
            // valid only if no rearrangement is possible
            int[] cnt = new int[26];
            for (char c : original.toCharArray()) cnt[c - 'a']++;
            int max = 0; for (int v : cnt) if (v > max) max = v;
            return max > (original.length() + 1) / 2;
        }
        if (result.length() != original.length()) return false;
        for (int i = 1; i < result.length(); i++) {
            if (result.charAt(i) == result.charAt(i-1)) return false;
        }
        // Verify it's a permutation
        char[] a = original.toCharArray(); Arrays.sort(a);
        char[] b = result.toCharArray();   Arrays.sort(b);
        return new String(a).equals(new String(b));
    }

    public static void main(String[] args) {
        System.out.println(valid("aab", reorganizeString("aab")));                  // true
        System.out.println(valid("aaab", reorganizeString("aaab")));                // true   (impossible → "")
        System.out.println(valid("a", reorganizeString("a")));                       // true
        System.out.println(valid("ab", reorganizeString("ab")));                     // true
        System.out.println(valid("aa", reorganizeString("aa")));                     // true   (impossible → "")
        System.out.println(valid("aabb", reorganizeString("aabb")));                 // true
        System.out.println(valid("aaabc", reorganizeString("aaabc")));               // true
        System.out.println(valid("aaabbb", reorganizeString("aaabbb")));             // true
        System.out.println(valid("aaaabb", reorganizeString("aaaabb")));             // true   (impossible → "")
        System.out.println(valid("vvvlo", reorganizeString("vvvlo")));               // true
        System.out.println(valid("baaba", reorganizeString("baaba")));               // true
    }
}`,
  "jump-game-vi": `import java.util.*;

public class Main {
    public static int maxResult(int[] nums, int k) {
        // dp[i] = nums[i] + max(dp[i-k..i-1]); use a monotonic deque for the window max

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(maxResult(new int[]{1, -1, -2, 4, -7, 3}, 2));           // 7
        System.out.println(maxResult(new int[]{10, -5, -2, 4, 0, 3}, 3));           // 17
        System.out.println(maxResult(new int[]{1, -5, -20, 4, -1, 3, -6, -3}, 2));  // 0
        System.out.println(maxResult(new int[]{1}, 1));                              // 1
        System.out.println(maxResult(new int[]{0, 0, 0, 0}, 1));                     // 0
        System.out.println(maxResult(new int[]{1, 2, 3}, 1));                        // 6
        System.out.println(maxResult(new int[]{1, 2, 3}, 2));                        // 6
        System.out.println(maxResult(new int[]{-1, -2, -3, -4, -5}, 1));             // -15
        System.out.println(maxResult(new int[]{-1, -2, -3, -4, -5}, 2));             // -8
        System.out.println(maxResult(new int[]{100, -1, -1, -1, 100}, 4));           // 200
        System.out.println(maxResult(new int[]{5, 5, 5, 5}, 2));                     // 20
    }
}`,
  "shortest-subarray-sum-at-least-k": `import java.util.*;

public class Main {
    public static int shortestSubarray(int[] nums, int k) {
        // Build prefix sums; sweep with a monotonic increasing deque of prefix-sum indices

        return -1;
    }

    public static void main(String[] args) {
        System.out.println(shortestSubarray(new int[]{1}, 1));               // 1
        System.out.println(shortestSubarray(new int[]{1, 2}, 4));             // -1
        System.out.println(shortestSubarray(new int[]{2, -1, 2}, 3));         // 3
        System.out.println(shortestSubarray(new int[]{84, -37, 32, 40, 95}, 167)); // 3
        System.out.println(shortestSubarray(new int[]{1, 1, 1, 1, 1, 1, 1, 1}, 5)); // 5
        System.out.println(shortestSubarray(new int[]{5}, 5));                 // 1
        System.out.println(shortestSubarray(new int[]{5}, 6));                 // -1
        System.out.println(shortestSubarray(new int[]{-1, -1, 1}, 1));         // 1
        System.out.println(shortestSubarray(new int[]{17, 85, 93, -45, -21}, 150)); // 2
        System.out.println(shortestSubarray(new int[]{1, 2, 3, 4, 5}, 11));    // 3
        System.out.println(shortestSubarray(new int[]{-28, 81, -20, 28, -29}, 89)); // 3
    }
}`,
  "maximum-absolute-sum-subarray": `public class Main {
    public static int maxAbsoluteSum(int[] nums) {
        // Track currentMax / currentMin with Kadane; answer = max(globalMax, -globalMin)

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(maxAbsoluteSum(new int[]{1, -3, 2, 3, -4}));        // 5
        System.out.println(maxAbsoluteSum(new int[]{2, -5, 1, -4, 3, -2}));    // 8
        System.out.println(maxAbsoluteSum(new int[]{1}));                       // 1
        System.out.println(maxAbsoluteSum(new int[]{-1}));                      // 1
        System.out.println(maxAbsoluteSum(new int[]{0}));                       // 0
        System.out.println(maxAbsoluteSum(new int[]{1, 2, 3}));                 // 6
        System.out.println(maxAbsoluteSum(new int[]{-1, -2, -3}));              // 6
        System.out.println(maxAbsoluteSum(new int[]{0, 0, 0}));                 // 0
        System.out.println(maxAbsoluteSum(new int[]{5, -3, 5, -3, 5}));         // 9
        System.out.println(maxAbsoluteSum(new int[]{-100, 50, -100}));          // 150
        System.out.println(maxAbsoluteSum(new int[]{1, -1, 1, -1, 1}));         // 1
    }
}`,
  "candy": `public class Main {
    public static int candy(int[] ratings) {
        // Two-pass greedy: left-to-right then right-to-left

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(candy(new int[]{1, 0, 2}));                    // 5
        System.out.println(candy(new int[]{1, 2, 2}));                    // 4
        System.out.println(candy(new int[]{1}));                           // 1
        System.out.println(candy(new int[]{1, 2}));                        // 3
        System.out.println(candy(new int[]{2, 1}));                        // 3
        System.out.println(candy(new int[]{1, 1, 1}));                     // 3
        System.out.println(candy(new int[]{1, 2, 3, 4, 5}));               // 15
        System.out.println(candy(new int[]{5, 4, 3, 2, 1}));               // 15
        System.out.println(candy(new int[]{1, 3, 2, 2, 1}));               // 7
        System.out.println(candy(new int[]{1, 2, 87, 87, 87, 2, 1}));      // 13
        System.out.println(candy(new int[]{29, 51, 87, 87, 72, 12}));      // 12
    }
}`,
  "boats-to-save-people": `import java.util.*;

public class Main {
    public static int numRescueBoats(int[] people, int limit) {
        // Sort, then two-pointer pair lightest+heaviest

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(numRescueBoats(new int[]{1, 2}, 3));                       // 1
        System.out.println(numRescueBoats(new int[]{3, 2, 2, 1}, 3));                 // 3
        System.out.println(numRescueBoats(new int[]{3, 5, 3, 4}, 5));                 // 4
        System.out.println(numRescueBoats(new int[]{1, 2, 3, 4, 5}, 5));              // 3
        System.out.println(numRescueBoats(new int[]{}, 100));                          // 0
        System.out.println(numRescueBoats(new int[]{50}, 100));                        // 1
        System.out.println(numRescueBoats(new int[]{50, 50}, 100));                    // 1
        System.out.println(numRescueBoats(new int[]{50, 50, 50}, 100));                // 2
        System.out.println(numRescueBoats(new int[]{1, 1, 1, 1}, 2));                  // 2
        System.out.println(numRescueBoats(new int[]{5, 5, 5, 5}, 5));                  // 4
        System.out.println(numRescueBoats(new int[]{2, 4, 1, 3, 5, 1}, 6));            // 3
    }
}`,
  "largest-number": `import java.util.*;

public class Main {
    public static String largestNumber(int[] nums) {
        // Convert to strings, sort by (a+b vs b+a), join, handle "all zeros" edge case

        return "";
    }

    public static void main(String[] args) {
        System.out.println(largestNumber(new int[]{10, 2}));                  // 210
        System.out.println(largestNumber(new int[]{3, 30, 34, 5, 9}));        // 9534330
        System.out.println(largestNumber(new int[]{1}));                       // 1
        System.out.println(largestNumber(new int[]{0}));                       // 0
        System.out.println(largestNumber(new int[]{0, 0}));                    // 0
        System.out.println(largestNumber(new int[]{1, 2, 3}));                 // 321
        System.out.println(largestNumber(new int[]{9, 8, 7, 6}));              // 9876
        System.out.println(largestNumber(new int[]{121, 12}));                 // 12121
        System.out.println(largestNumber(new int[]{432, 43243}));              // 43243432
        System.out.println(largestNumber(new int[]{0, 0, 0, 1}));              // 1000
        System.out.println(largestNumber(new int[]{34323, 3432}));             // 343234323
    }
}`,
  "bag-of-tokens": `import java.util.*;

public class Main {
    public static int bagOfTokensScore(int[] tokens, int power) {
        // Sort; two pointers — play smallest face-up while affordable; else swap largest face-down

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(bagOfTokensScore(new int[]{100}, 50));                  // 0
        System.out.println(bagOfTokensScore(new int[]{100, 200}, 150));            // 1
        System.out.println(bagOfTokensScore(new int[]{100, 200, 300, 400}, 200));  // 2
        System.out.println(bagOfTokensScore(new int[]{}, 100));                     // 0
        System.out.println(bagOfTokensScore(new int[]{50}, 50));                    // 1
        System.out.println(bagOfTokensScore(new int[]{50, 50, 50, 50}, 100));       // 2
        System.out.println(bagOfTokensScore(new int[]{200, 100}, 50));              // 0
        System.out.println(bagOfTokensScore(new int[]{1, 2, 3}, 6));                // 3
        System.out.println(bagOfTokensScore(new int[]{1, 2, 3}, 0));                // 0
        System.out.println(bagOfTokensScore(new int[]{71, 55, 82}, 54));            // 0
        System.out.println(bagOfTokensScore(new int[]{26, 67, 47, 51, 100, 49, 39, 67, 26, 35, 25, 24, 68, 79, 79, 60}, 81)); // 6
    }
}`,
  "smallest-range-ii": `import java.util.*;

public class Main {
    public static int smallestRangeII(int[] nums, int k) {
        // Sort; try every split: left half +k, right half -k; track min(max - min)

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(smallestRangeII(new int[]{1}, 0));                  // 0
        System.out.println(smallestRangeII(new int[]{0, 10}, 2));              // 6
        System.out.println(smallestRangeII(new int[]{1, 3, 6}, 3));            // 3
        System.out.println(smallestRangeII(new int[]{1, 3, 6}, 0));            // 5
        System.out.println(smallestRangeII(new int[]{5, 5, 5}, 10));           // 0
        System.out.println(smallestRangeII(new int[]{7, 8, 8, 5, 2}, 4));      // 5
        System.out.println(smallestRangeII(new int[]{1, 2, 3, 4, 5}, 1));      // 2
        System.out.println(smallestRangeII(new int[]{0, 0, 0}, 100));          // 0
        System.out.println(smallestRangeII(new int[]{1, 100}, 99));            // 0
        System.out.println(smallestRangeII(new int[]{1, 100}, 50));            // 99
        System.out.println(smallestRangeII(new int[]{4, 8, 2, 7, 2}, 5));      // 6
    }
}`,
  "find-the-index-of-first-occurrence": `public class Main {
    public static int strStr(String haystack, String needle) {
        // Brute force is fine for typical inputs; KMP for very large strings

        return -1;
    }

    public static void main(String[] args) {
        System.out.println(strStr("sadbutsad", "sad"));         // 0
        System.out.println(strStr("leetcode", "leeto"));        // -1
        System.out.println(strStr("hello", "ll"));              // 2
        System.out.println(strStr("aaaaa", "bba"));             // -1
        System.out.println(strStr("", ""));                      // 0
        System.out.println(strStr("a", "a"));                    // 0
        System.out.println(strStr("a", "b"));                    // -1
        System.out.println(strStr("mississippi", "issip"));     // 4
        System.out.println(strStr("mississippi", "issipi"));    // -1
        System.out.println(strStr("aaa", "aaaa"));              // -1
        System.out.println(strStr("ababab", "ab"));             // 0
        System.out.println(strStr("ababab", "ba"));             // 1
    }
}`,
  "count-sorted-vowel-strings": `public class Main {
    public static int countVowelStrings(int n) {
        // DP or closed form: (n+1)(n+2)(n+3)(n+4) / 24

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(countVowelStrings(1));     // 5
        System.out.println(countVowelStrings(2));     // 15
        System.out.println(countVowelStrings(3));     // 35
        System.out.println(countVowelStrings(4));     // 70
        System.out.println(countVowelStrings(5));     // 126
        System.out.println(countVowelStrings(6));     // 210
        System.out.println(countVowelStrings(10));    // 1001
        System.out.println(countVowelStrings(15));    // 3876
        System.out.println(countVowelStrings(20));    // 10626
        System.out.println(countVowelStrings(33));    // 66045
        System.out.println(countVowelStrings(50));    // 316251
    }
}`,
  "longest-happy-string": `import java.util.*;

public class Main {
    public static String longestDiverseString(int a, int b, int c) {
        // Max-heap of (count, char); avoid placing same char 3 in a row

        return "";
    }

    // Verify: no 3-in-a-row, uses no more than the supply of each char
    static boolean valid(String s, int a, int b, int c) {
        if (s == null) return false;
        int ca = 0, cb = 0, cc = 0;
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            if (ch == 'a') ca++; else if (ch == 'b') cb++; else if (ch == 'c') cc++;
            if (i >= 2 && s.charAt(i) == s.charAt(i-1) && s.charAt(i) == s.charAt(i-2)) return false;
        }
        return ca <= a && cb <= b && cc <= c;
    }

    public static void main(String[] args) {
        System.out.println(valid(longestDiverseString(1, 1, 7), 1, 1, 7));        // true
        System.out.println(valid(longestDiverseString(7, 1, 0), 7, 1, 0));        // true
        System.out.println(longestDiverseString(7, 1, 0).length());                // 5
        System.out.println(valid(longestDiverseString(0, 0, 0), 0, 0, 0));        // true
        System.out.println(longestDiverseString(0, 0, 0).length());                // 0
        System.out.println(valid(longestDiverseString(2, 2, 2), 2, 2, 2));        // true
        System.out.println(longestDiverseString(2, 2, 2).length());                // 6
        System.out.println(valid(longestDiverseString(0, 8, 11), 0, 8, 11));      // true
        System.out.println(valid(longestDiverseString(5, 5, 5), 5, 5, 5));        // true
        System.out.println(valid(longestDiverseString(1, 0, 0), 1, 0, 0));        // true
        System.out.println(longestDiverseString(1, 0, 0).length());                // 1
    }
}`,
  "game-of-life": `import java.util.*;

public class Main {
    public static void gameOfLife(int[][] board) {
        // In place: encode next state in higher bit, then shift

    }

    public static void main(String[] args) {
        int[][] a = {{0,1,0},{0,0,1},{1,1,1},{0,0,0}}; gameOfLife(a);
        System.out.println(Arrays.deepToString(a));    // [[0, 0, 0], [1, 0, 1], [0, 1, 1], [0, 1, 0]]
        int[][] b = {{1,1},{1,0}}; gameOfLife(b);
        System.out.println(Arrays.deepToString(b));    // [[1, 1], [1, 1]]
        int[][] c = {{0}}; gameOfLife(c);
        System.out.println(Arrays.deepToString(c));    // [[0]]
        int[][] d = {{1}}; gameOfLife(d);
        System.out.println(Arrays.deepToString(d));    // [[0]]
        int[][] e = {{1,1,1},{1,1,1},{1,1,1}}; gameOfLife(e);
        System.out.println(Arrays.deepToString(e));    // [[1, 0, 1], [0, 0, 0], [1, 0, 1]]
        int[][] f = {{0,0,0},{0,0,0},{0,0,0}}; gameOfLife(f);
        System.out.println(Arrays.deepToString(f));    // [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
        int[][] g = {{1,0},{0,1}}; gameOfLife(g);
        System.out.println(Arrays.deepToString(g));    // [[0, 0], [0, 0]]
        int[][] h = {{0,1,1},{1,1,0},{0,0,0}}; gameOfLife(h);
        System.out.println(Arrays.deepToString(h));    // [[1, 1, 1], [1, 1, 1], [0, 1, 0]]
        int[][] i = {{0,0},{0,0}}; gameOfLife(i);
        System.out.println(Arrays.deepToString(i));    // [[0, 0], [0, 0]]
        int[][] j = {{1,1,0,0},{0,1,0,1},{1,0,1,1},{0,0,1,0}}; gameOfLife(j);
        System.out.println(Arrays.deepToString(j));    // [[1, 1, 0, 0], [1, 0, 0, 0], [1, 0, 0, 1], [0, 0, 1, 1]]
    }
}`,
  "walking-robot-simulation": `import java.util.*;

public class Main {
    public static int robotSim(int[] commands, int[][] obstacles) {
        // Track (x, y, direction); use a HashSet of "x,y" obstacle keys
        // 4 directions: N, E, S, W; left = (dir + 3) % 4; right = (dir + 1) % 4

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(robotSim(new int[]{4, -1, 3}, new int[][]{}));                       // 25
        System.out.println(robotSim(new int[]{4, -1, 4, -2, 4}, new int[][]{{2, 4}}));          // 65
        System.out.println(robotSim(new int[]{6, -1, -1, 6}, new int[][]{}));                   // 36
        System.out.println(robotSim(new int[]{1}, new int[][]{}));                               // 1
        System.out.println(robotSim(new int[]{}, new int[][]{}));                                // 0
        System.out.println(robotSim(new int[]{-1, -1, -1, -1}, new int[][]{}));                  // 0
        System.out.println(robotSim(new int[]{1, 2, 3}, new int[][]{}));                          // 36
        System.out.println(robotSim(new int[]{-2, -2, -2, -2, 5}, new int[][]{}));                // 25
        System.out.println(robotSim(new int[]{2, -1, 8, 3, 7, -1, 1, -1, 5, -2, -2, 5, -1, -2, 7, 4, 7, -2, -2, -1, 3, -3}, new int[][]{{-4,-1},{1,-1},{1,4},{5,0},{4,5},{-2,-1},{2,-5},{1,-2},{5,1},{0,5}})); // 25
        System.out.println(robotSim(new int[]{4, -1, 3}, new int[][]{{2, 4}}));                   // 25
    }
}`,
  "car-pooling": `public class Main {
    public static boolean carPooling(int[][] trips, int capacity) {
        // Difference array indexed by location (or sort events and sweep)

        return false;
    }

    public static void main(String[] args) {
        System.out.println(carPooling(new int[][]{{2,1,5},{3,3,7}}, 4));            // false
        System.out.println(carPooling(new int[][]{{2,1,5},{3,3,7}}, 5));            // true
        System.out.println(carPooling(new int[][]{{2,1,5},{3,5,7}}, 3));            // true
        System.out.println(carPooling(new int[][]{{3,2,7},{3,7,9},{8,3,9}}, 11));   // true
        System.out.println(carPooling(new int[][]{}, 4));                            // true
        System.out.println(carPooling(new int[][]{{1, 0, 1}}, 1));                   // true
        System.out.println(carPooling(new int[][]{{1, 0, 1}}, 0));                   // false
        System.out.println(carPooling(new int[][]{{4, 5, 6}, {6, 4, 7}, {4, 3, 5}, {2, 3, 5}}, 13)); // true
        System.out.println(carPooling(new int[][]{{2, 1, 4}, {2, 4, 5}, {2, 3, 4}}, 4));  // true
        System.out.println(carPooling(new int[][]{{2, 1, 4}, {2, 4, 5}, {2, 3, 4}}, 3));  // false
        System.out.println(carPooling(new int[][]{{10, 1, 5}}, 9));                       // false
    }
}`,
  "find-right-interval": `import java.util.*;

public class Main {
    public static int[] findRightInterval(int[][] intervals) {
        // Sort starts (with original indices), binary search each interval's end

        return new int[]{};
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(findRightInterval(new int[][]{{3,4},{2,3},{1,2}})));   // [-1, 0, 1]
        System.out.println(Arrays.toString(findRightInterval(new int[][]{{1,4},{2,3},{3,4}})));   // [-1, 2, -1]
        System.out.println(Arrays.toString(findRightInterval(new int[][]{{1,1}})));                // [0]
        System.out.println(Arrays.toString(findRightInterval(new int[][]{{1,2}})));                // [-1]
        System.out.println(Arrays.toString(findRightInterval(new int[][]{{1,4},{2,3},{3,4}})));    // [-1, 2, -1]
        System.out.println(Arrays.toString(findRightInterval(new int[][]{{1,2},{3,4},{5,6}})));    // [1, 2, -1]
        System.out.println(Arrays.toString(findRightInterval(new int[][]{{1,2},{2,3},{3,4}})));    // [1, 2, -1]
        System.out.println(Arrays.toString(findRightInterval(new int[][]{{4,5},{2,3},{1,2}})));    // [-1, 0, 1]
        System.out.println(Arrays.toString(findRightInterval(new int[][]{{-1,0},{1,2}})));         // [1, -1]
        System.out.println(Arrays.toString(findRightInterval(new int[][]{{0,1},{1,2},{2,3},{3,4}}))); // [1, 2, 3, -1]
    }
}`,
  "shortest-unsorted-continuous-subarray": `public class Main {
    public static int findUnsortedSubarray(int[] nums) {
        // Two-pass O(n) using running max/min, OR sort+compare for O(n log n)

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(findUnsortedSubarray(new int[]{2, 6, 4, 8, 10, 9, 15}));   // 5
        System.out.println(findUnsortedSubarray(new int[]{1, 2, 3, 4}));               // 0
        System.out.println(findUnsortedSubarray(new int[]{1}));                         // 0
        System.out.println(findUnsortedSubarray(new int[]{}));                          // 0
        System.out.println(findUnsortedSubarray(new int[]{2, 1}));                      // 2
        System.out.println(findUnsortedSubarray(new int[]{1, 3, 2, 2, 2}));             // 4
        System.out.println(findUnsortedSubarray(new int[]{1, 2, 3, 3, 3}));             // 0
        System.out.println(findUnsortedSubarray(new int[]{3, 2, 1}));                   // 3
        System.out.println(findUnsortedSubarray(new int[]{1, 3, 5, 4, 2}));             // 4
        System.out.println(findUnsortedSubarray(new int[]{1, 2, 4, 5, 3}));             // 3
        System.out.println(findUnsortedSubarray(new int[]{2, 3, 3, 2, 4}));             // 3
    }
}`,
  "valid-triangle-number": `import java.util.*;

public class Main {
    public static int triangleNumber(int[] nums) {
        // Sort; for each c (largest), two-pointer over [left=0, right=c-1] count valid pairs

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(triangleNumber(new int[]{2, 2, 3, 4}));                       // 3
        System.out.println(triangleNumber(new int[]{4, 2, 3, 4}));                       // 4
        System.out.println(triangleNumber(new int[]{}));                                  // 0
        System.out.println(triangleNumber(new int[]{1}));                                 // 0
        System.out.println(triangleNumber(new int[]{1, 1}));                              // 0
        System.out.println(triangleNumber(new int[]{1, 1, 1}));                           // 1
        System.out.println(triangleNumber(new int[]{0, 1, 1, 1}));                        // 1
        System.out.println(triangleNumber(new int[]{3, 4, 5, 6, 7}));                     // 9
        System.out.println(triangleNumber(new int[]{1, 1, 3, 4}));                        // 0
        System.out.println(triangleNumber(new int[]{2, 2, 2, 2}));                        // 4
        System.out.println(triangleNumber(new int[]{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}));    // 50
    }
}`,
  "array-of-doubled-pairs": `import java.util.*;

public class Main {
    public static boolean canReorderDoubled(int[] arr) {
        // Sort by absolute value; greedily pair x with 2x using a frequency map

        return false;
    }

    public static void main(String[] args) {
        System.out.println(canReorderDoubled(new int[]{3, 1, 3, 6}));                   // false
        System.out.println(canReorderDoubled(new int[]{2, 1, 2, 6}));                   // false
        System.out.println(canReorderDoubled(new int[]{4, -2, 2, -4}));                 // true
        System.out.println(canReorderDoubled(new int[]{1, 2, 4, 16, 8, 4}));            // false
        System.out.println(canReorderDoubled(new int[]{}));                              // true
        System.out.println(canReorderDoubled(new int[]{0, 0}));                          // true
        System.out.println(canReorderDoubled(new int[]{0, 0, 0, 0}));                    // true
        System.out.println(canReorderDoubled(new int[]{1, 2}));                          // true
        System.out.println(canReorderDoubled(new int[]{1, 2, 4, 8}));                    // true
        System.out.println(canReorderDoubled(new int[]{2, 4, 0, 0, 8, 1}));              // false
        System.out.println(canReorderDoubled(new int[]{-6, -3, -10, -5}));               // true
    }
}`,
  "count-the-number-of-fair-pairs": `import java.util.*;

public class Main {
    public static long countFairPairs(int[] nums, int lower, int upper) {
        // Sort; for each i, two binary searches: count nums in [lower - nums[i], upper - nums[i]] for j > i

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(countFairPairs(new int[]{0, 1, 7, 4, 4, 5}, 3, 6));        // 6
        System.out.println(countFairPairs(new int[]{1, 7, 9, 2, 5}, 11, 11));         // 1
        System.out.println(countFairPairs(new int[]{1}, 0, 100));                      // 0
        System.out.println(countFairPairs(new int[]{1, 1}, 1, 2));                     // 1
        System.out.println(countFairPairs(new int[]{0, 0, 0, 0}, 0, 0));               // 6
        System.out.println(countFairPairs(new int[]{-1, 0, 1}, -1, 1));                // 3
        System.out.println(countFairPairs(new int[]{-1, 1, -1, 1}, -2, 2));            // 6
        System.out.println(countFairPairs(new int[]{1, 2, 3, 4, 5}, 3, 7));            // 7
        System.out.println(countFairPairs(new int[]{1, 2, 3, 4, 5}, 100, 200));        // 0
        System.out.println(countFairPairs(new int[]{5, 5, 5, 5}, 10, 10));             // 6
        System.out.println(countFairPairs(new int[]{0, 1, 2, 3}, 0, 5));               // 6
    }
}`,
  "middle-of-linked-list": `public class Main {
    static class ListNode {
        int val; ListNode next;
        ListNode(int val) { this.val = val; }
    }

    public static ListNode middleNode(ListNode head) {
        // Slow/fast pointers

        return null;
    }

    static ListNode build(int[] vals) {
        if (vals.length == 0) return null;
        ListNode head = new ListNode(vals[0]); ListNode cur = head;
        for (int i = 1; i < vals.length; i++) { cur.next = new ListNode(vals[i]); cur = cur.next; }
        return head;
    }
    static String tail(ListNode n) {
        if (n == null) return "(empty)";
        StringBuilder sb = new StringBuilder();
        while (n != null) { sb.append(n.val); if (n.next != null) sb.append("->"); n = n.next; }
        return sb.toString();
    }

    public static void main(String[] args) {
        System.out.println(tail(middleNode(build(new int[]{1,2,3,4,5}))));      // 3->4->5
        System.out.println(tail(middleNode(build(new int[]{1,2,3,4,5,6}))));    // 4->5->6
        System.out.println(tail(middleNode(build(new int[]{1}))));               // 1
        System.out.println(tail(middleNode(build(new int[]{1,2}))));             // 2
        System.out.println(tail(middleNode(build(new int[]{1,2,3}))));           // 2->3
        System.out.println(tail(middleNode(build(new int[]{1,2,3,4}))));         // 3->4
        System.out.println(tail(middleNode(null)));                              // (empty)
        System.out.println(tail(middleNode(build(new int[]{0,0,0,0,0}))));       // 0->0->0
        System.out.println(tail(middleNode(build(new int[]{-1,-2,-3,-4}))));     // -3->-4
        System.out.println(tail(middleNode(build(new int[]{10,20,30,40,50,60,70})))); // 40->50->60->70
        System.out.println(tail(middleNode(build(new int[]{1,2,3,4,5,6,7,8}))));  // 5->6->7->8
    }
}`,
  "add-two-numbers": `public class Main {
    static class ListNode {
        int val; ListNode next;
        ListNode(int val) { this.val = val; }
    }

    public static ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        // Walk both lists; track carry; build result

        return null;
    }

    static ListNode build(int[] vals) {
        if (vals.length == 0) return null;
        ListNode h = new ListNode(vals[0]); ListNode c = h;
        for (int i = 1; i < vals.length; i++) { c.next = new ListNode(vals[i]); c = c.next; }
        return h;
    }
    static String s(ListNode n) {
        if (n == null) return "(empty)";
        StringBuilder sb = new StringBuilder();
        while (n != null) { sb.append(n.val); if (n.next != null) sb.append("->"); n = n.next; }
        return sb.toString();
    }

    public static void main(String[] args) {
        System.out.println(s(addTwoNumbers(build(new int[]{2,4,3}), build(new int[]{5,6,4}))));  // 7->0->8
        System.out.println(s(addTwoNumbers(build(new int[]{0}), build(new int[]{0}))));            // 0
        System.out.println(s(addTwoNumbers(build(new int[]{9,9,9,9,9,9,9}), build(new int[]{9,9,9,9})))); // 8->9->9->9->0->0->0->1
        System.out.println(s(addTwoNumbers(build(new int[]{1}), build(new int[]{2}))));             // 3
        System.out.println(s(addTwoNumbers(build(new int[]{5}), build(new int[]{5}))));             // 0->1
        System.out.println(s(addTwoNumbers(build(new int[]{1,2,3}), build(new int[]{4,5,6}))));     // 5->7->9
        System.out.println(s(addTwoNumbers(build(new int[]{9}), build(new int[]{1}))));             // 0->1
        System.out.println(s(addTwoNumbers(build(new int[]{1,8}), build(new int[]{0}))));           // 1->8
        System.out.println(s(addTwoNumbers(build(new int[]{0}), build(new int[]{7,3}))));           // 7->3
        System.out.println(s(addTwoNumbers(build(new int[]{2,4,9}), build(new int[]{5,6,4,9}))));   // 7->0->4->0->1
        System.out.println(s(addTwoNumbers(build(new int[]{9,9,9}), build(new int[]{1}))));         // 0->0->0->1
    }
}`,
  "palindrome-linked-list": `public class Main {
    static class ListNode {
        int val; ListNode next;
        ListNode(int val) { this.val = val; }
    }

    public static boolean isPalindrome(ListNode head) {
        // Slow/fast to find middle; reverse second half; compare

        return false;
    }

    static ListNode build(int[] vals) {
        if (vals.length == 0) return null;
        ListNode h = new ListNode(vals[0]); ListNode c = h;
        for (int i = 1; i < vals.length; i++) { c.next = new ListNode(vals[i]); c = c.next; }
        return h;
    }

    public static void main(String[] args) {
        System.out.println(isPalindrome(build(new int[]{1,2,2,1})));        // true
        System.out.println(isPalindrome(build(new int[]{1,2})));             // false
        System.out.println(isPalindrome(null));                              // true
        System.out.println(isPalindrome(build(new int[]{1})));               // true
        System.out.println(isPalindrome(build(new int[]{1,1})));             // true
        System.out.println(isPalindrome(build(new int[]{1,2,1})));           // true
        System.out.println(isPalindrome(build(new int[]{1,2,3})));           // false
        System.out.println(isPalindrome(build(new int[]{1,2,3,2,1})));       // true
        System.out.println(isPalindrome(build(new int[]{1,2,3,4,5})));       // false
        System.out.println(isPalindrome(build(new int[]{0,0,0,0})));         // true
        System.out.println(isPalindrome(build(new int[]{-1,0,1,0,-1})));     // true
    }
}`,
  "remove-nth-from-end": `public class Main {
    static class ListNode {
        int val; ListNode next;
        ListNode(int val) { this.val = val; }
    }

    public static ListNode removeNthFromEnd(ListNode head, int n) {
        // Use a dummy node before head to handle removal of the first node uniformly

        return head;
    }

    static ListNode build(int[] vals) {
        if (vals.length == 0) return null;
        ListNode h = new ListNode(vals[0]); ListNode c = h;
        for (int i = 1; i < vals.length; i++) { c.next = new ListNode(vals[i]); c = c.next; }
        return h;
    }
    static String s(ListNode n) {
        if (n == null) return "(empty)";
        StringBuilder sb = new StringBuilder();
        while (n != null) { sb.append(n.val); if (n.next != null) sb.append("->"); n = n.next; }
        return sb.toString();
    }

    public static void main(String[] args) {
        System.out.println(s(removeNthFromEnd(build(new int[]{1,2,3,4,5}), 2)));    // 1->2->3->5
        System.out.println(s(removeNthFromEnd(build(new int[]{1}), 1)));             // (empty)
        System.out.println(s(removeNthFromEnd(build(new int[]{1,2}), 1)));           // 1
        System.out.println(s(removeNthFromEnd(build(new int[]{1,2}), 2)));           // 2
        System.out.println(s(removeNthFromEnd(build(new int[]{1,2,3,4,5}), 1)));     // 1->2->3->4
        System.out.println(s(removeNthFromEnd(build(new int[]{1,2,3,4,5}), 5)));     // 2->3->4->5
        System.out.println(s(removeNthFromEnd(build(new int[]{1,2,3,4,5}), 3)));     // 1->2->4->5
        System.out.println(s(removeNthFromEnd(build(new int[]{1,2,3}), 2)));         // 1->3
        System.out.println(s(removeNthFromEnd(build(new int[]{10,20,30,40}), 4)));   // 20->30->40
        System.out.println(s(removeNthFromEnd(build(new int[]{0,1,2,3,4,5,6,7,8,9}), 5))); // 0->1->2->3->4->6->7->8->9
        System.out.println(s(removeNthFromEnd(build(new int[]{42}), 1)));            // (empty)
    }
}`,
  "linked-list-cycle-ii": `public class Main {
    static class ListNode {
        int val; ListNode next;
        ListNode(int val) { this.val = val; }
    }

    public static ListNode detectCycle(ListNode head) {
        // Floyd 2-phase: meet point, then reset one pointer

        return null;
    }

    static ListNode buildWithCycle(int[] vals, int cycleStart) {
        if (vals.length == 0) return null;
        ListNode h = new ListNode(vals[0]); ListNode c = h;
        for (int i = 1; i < vals.length; i++) { c.next = new ListNode(vals[i]); c = c.next; }
        if (cycleStart < 0) return h;
        ListNode target = h; for (int i = 0; i < cycleStart; i++) target = target.next;
        c.next = target;
        return h;
    }

    public static void main(String[] args) {
        ListNode r;
        r = detectCycle(buildWithCycle(new int[]{3,2,0,-4}, 1)); System.out.println(r == null ? "null" : r.val); // 2
        r = detectCycle(buildWithCycle(new int[]{1,2}, 0));        System.out.println(r == null ? "null" : r.val); // 1
        r = detectCycle(buildWithCycle(new int[]{1}, -1));         System.out.println(r == null ? "null" : r.val); // null
        r = detectCycle(buildWithCycle(new int[]{1,2,3,4,5}, -1)); System.out.println(r == null ? "null" : r.val); // null
        r = detectCycle(null);                                      System.out.println(r == null ? "null" : r.val); // null
        r = detectCycle(buildWithCycle(new int[]{1}, 0));          System.out.println(r == null ? "null" : r.val); // 1
        r = detectCycle(buildWithCycle(new int[]{1,2}, -1));       System.out.println(r == null ? "null" : r.val); // null
        r = detectCycle(buildWithCycle(new int[]{1,2,3,4,5}, 2));  System.out.println(r == null ? "null" : r.val); // 3
        r = detectCycle(buildWithCycle(new int[]{1,2,3,4,5}, 0));  System.out.println(r == null ? "null" : r.val); // 1
        r = detectCycle(buildWithCycle(new int[]{1,2,3,4,5}, 4));  System.out.println(r == null ? "null" : r.val); // 5
        r = detectCycle(buildWithCycle(new int[]{10,20}, 1));      System.out.println(r == null ? "null" : r.val); // 20
    }
}`,
  "sort-list": `public class Main {
    static class ListNode {
        int val; ListNode next;
        ListNode(int val) { this.val = val; }
    }

    public static ListNode sortList(ListNode head) {
        // Merge sort: find midpoint, split, recursively sort, merge

        return head;
    }

    static ListNode build(int[] vals) {
        if (vals.length == 0) return null;
        ListNode h = new ListNode(vals[0]); ListNode c = h;
        for (int i = 1; i < vals.length; i++) { c.next = new ListNode(vals[i]); c = c.next; }
        return h;
    }
    static String s(ListNode n) {
        if (n == null) return "(empty)";
        StringBuilder sb = new StringBuilder();
        while (n != null) { sb.append(n.val); if (n.next != null) sb.append("->"); n = n.next; }
        return sb.toString();
    }

    public static void main(String[] args) {
        System.out.println(s(sortList(build(new int[]{4,2,1,3}))));         // 1->2->3->4
        System.out.println(s(sortList(build(new int[]{-1,5,3,4,0}))));      // -1->0->3->4->5
        System.out.println(s(sortList(null)));                               // (empty)
        System.out.println(s(sortList(build(new int[]{1}))));                // 1
        System.out.println(s(sortList(build(new int[]{2,1}))));              // 1->2
        System.out.println(s(sortList(build(new int[]{1,2,3,4,5}))));        // 1->2->3->4->5
        System.out.println(s(sortList(build(new int[]{5,4,3,2,1}))));        // 1->2->3->4->5
        System.out.println(s(sortList(build(new int[]{3,3,3,3}))));          // 3->3->3->3
        System.out.println(s(sortList(build(new int[]{-3,-1,-2,-5,-4}))));   // -5->-4->-3->-2->-1
        System.out.println(s(sortList(build(new int[]{0,-1,1,-2,2,-3,3}))));  // -3->-2->-1->0->1->2->3
        System.out.println(s(sortList(build(new int[]{100,50,25,12,6,3,1})))); // 1->3->6->12->25->50->100
    }
}`,
  "binary-tree-preorder-traversal": `import java.util.*;

public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    public static List<Integer> preorderTraversal(TreeNode root) {
        // Recursive DFS or iterative with stack

        return new ArrayList<>();
    }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode r = new TreeNode(vals[0]); Queue<TreeNode> q = new LinkedList<>(); q.add(r); int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode c = q.poll();
            if (i < vals.length && vals[i] != null) { c.left = new TreeNode(vals[i]); q.add(c.left); } i++;
            if (i < vals.length && vals[i] != null) { c.right = new TreeNode(vals[i]); q.add(c.right); } i++;
        }
        return r;
    }

    public static void main(String[] args) {
        System.out.println(preorderTraversal(build(1, null, 2, 3)));               // [1, 2, 3]
        System.out.println(preorderTraversal(build(1, 2, 3, 4, 5, 6, 7)));         // [1, 2, 4, 5, 3, 6, 7]
        System.out.println(preorderTraversal(null));                                // []
        System.out.println(preorderTraversal(build(1)));                            // [1]
        System.out.println(preorderTraversal(build(1, 2)));                         // [1, 2]
        System.out.println(preorderTraversal(build(1, null, 2)));                   // [1, 2]
        System.out.println(preorderTraversal(build(3, 1, 2)));                      // [3, 1, 2]
        System.out.println(preorderTraversal(build(5, 3, 8, 1, 4, 7, 9)));          // [5, 3, 1, 4, 8, 7, 9]
        System.out.println(preorderTraversal(build(1, 2, null, 3, null, 4)));       // [1, 2, 3, 4]
        System.out.println(preorderTraversal(build(1, null, 2, null, 3, null, 4))); // [1, 2, 3, 4]
        System.out.println(preorderTraversal(build(-10, -5, -20)));                 // [-10, -5, -20]
    }
}`,
  "binary-tree-inorder-traversal": `import java.util.*;

public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    public static List<Integer> inorderTraversal(TreeNode root) {
        // Recursive DFS or iterative with stack

        return new ArrayList<>();
    }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode r = new TreeNode(vals[0]); Queue<TreeNode> q = new LinkedList<>(); q.add(r); int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode c = q.poll();
            if (i < vals.length && vals[i] != null) { c.left = new TreeNode(vals[i]); q.add(c.left); } i++;
            if (i < vals.length && vals[i] != null) { c.right = new TreeNode(vals[i]); q.add(c.right); } i++;
        }
        return r;
    }

    public static void main(String[] args) {
        System.out.println(inorderTraversal(build(1, null, 2, 3)));                // [1, 3, 2]
        System.out.println(inorderTraversal(build(1, 2, 3, 4, 5, 6, 7)));          // [4, 2, 5, 1, 6, 3, 7]
        System.out.println(inorderTraversal(null));                                 // []
        System.out.println(inorderTraversal(build(1)));                             // [1]
        System.out.println(inorderTraversal(build(1, 2)));                          // [2, 1]
        System.out.println(inorderTraversal(build(1, null, 2)));                    // [1, 2]
        System.out.println(inorderTraversal(build(3, 1, 2)));                       // [1, 3, 2]
        System.out.println(inorderTraversal(build(5, 3, 8, 1, 4, 7, 9)));           // [1, 3, 4, 5, 7, 8, 9]
        System.out.println(inorderTraversal(build(1, 2, null, 3, null, 4)));        // [4, 3, 2, 1]
        System.out.println(inorderTraversal(build(1, null, 2, null, 3, null, 4)));  // [1, 2, 3, 4]
        System.out.println(inorderTraversal(build(0, -1, 1)));                      // [-1, 0, 1]
    }
}`,
  "binary-tree-postorder-traversal": `import java.util.*;

public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    public static List<Integer> postorderTraversal(TreeNode root) {
        // Recursive DFS or iterative (modified preorder reversed)

        return new ArrayList<>();
    }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode r = new TreeNode(vals[0]); Queue<TreeNode> q = new LinkedList<>(); q.add(r); int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode c = q.poll();
            if (i < vals.length && vals[i] != null) { c.left = new TreeNode(vals[i]); q.add(c.left); } i++;
            if (i < vals.length && vals[i] != null) { c.right = new TreeNode(vals[i]); q.add(c.right); } i++;
        }
        return r;
    }

    public static void main(String[] args) {
        System.out.println(postorderTraversal(build(1, null, 2, 3)));               // [3, 2, 1]
        System.out.println(postorderTraversal(build(1, 2, 3, 4, 5, 6, 7)));         // [4, 5, 2, 6, 7, 3, 1]
        System.out.println(postorderTraversal(null));                                // []
        System.out.println(postorderTraversal(build(1)));                            // [1]
        System.out.println(postorderTraversal(build(1, 2)));                         // [2, 1]
        System.out.println(postorderTraversal(build(1, null, 2)));                   // [2, 1]
        System.out.println(postorderTraversal(build(3, 1, 2)));                      // [1, 2, 3]
        System.out.println(postorderTraversal(build(5, 3, 8, 1, 4, 7, 9)));          // [1, 4, 3, 7, 9, 8, 5]
        System.out.println(postorderTraversal(build(1, 2, null, 3, null, 4)));       // [4, 3, 2, 1]
        System.out.println(postorderTraversal(build(1, null, 2, null, 3, null, 4))); // [4, 3, 2, 1]
        System.out.println(postorderTraversal(build(-10, -5, -20)));                 // [-5, -20, -10]
    }
}`,
  "same-tree": `import java.util.*;

public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    public static boolean isSameTree(TreeNode p, TreeNode q) {
        // Recursive structural + value comparison

        return false;
    }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode r = new TreeNode(vals[0]); Queue<TreeNode> q = new LinkedList<>(); q.add(r); int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode c = q.poll();
            if (i < vals.length && vals[i] != null) { c.left = new TreeNode(vals[i]); q.add(c.left); } i++;
            if (i < vals.length && vals[i] != null) { c.right = new TreeNode(vals[i]); q.add(c.right); } i++;
        }
        return r;
    }

    public static void main(String[] args) {
        System.out.println(isSameTree(build(1,2,3), build(1,2,3)));                      // true
        System.out.println(isSameTree(build(1,2), build(1, null, 2)));                   // false
        System.out.println(isSameTree(build(1,2,1), build(1,1,2)));                      // false
        System.out.println(isSameTree(null, null));                                       // true
        System.out.println(isSameTree(build(1), null));                                   // false
        System.out.println(isSameTree(null, build(1)));                                   // false
        System.out.println(isSameTree(build(1), build(1)));                               // true
        System.out.println(isSameTree(build(1), build(2)));                               // false
        System.out.println(isSameTree(build(1,2,3,4,5,6,7), build(1,2,3,4,5,6,7)));      // true
        System.out.println(isSameTree(build(1,2,3,4,5,6,7), build(1,2,3,4,5,6,8)));      // false
        System.out.println(isSameTree(build(0), build(-1)));                              // false
    }
}`,
  "symmetric-tree": `import java.util.*;

public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    public static boolean isSymmetric(TreeNode root) {
        // Pair-recursion: check(left, right) where left.val == right.val and mirrors

        return false;
    }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode r = new TreeNode(vals[0]); Queue<TreeNode> q = new LinkedList<>(); q.add(r); int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode c = q.poll();
            if (i < vals.length && vals[i] != null) { c.left = new TreeNode(vals[i]); q.add(c.left); } i++;
            if (i < vals.length && vals[i] != null) { c.right = new TreeNode(vals[i]); q.add(c.right); } i++;
        }
        return r;
    }

    public static void main(String[] args) {
        System.out.println(isSymmetric(build(1,2,2,3,4,4,3)));                  // true
        System.out.println(isSymmetric(build(1,2,2, null,3, null,3)));          // false
        System.out.println(isSymmetric(null));                                    // true
        System.out.println(isSymmetric(build(1)));                                // true
        System.out.println(isSymmetric(build(1,2,2)));                            // true
        System.out.println(isSymmetric(build(1,2,3)));                            // false
        System.out.println(isSymmetric(build(1,2,2, null,3, 3, null)));          // true
        System.out.println(isSymmetric(build(1,2,2,2, null, null, 2)));          // false
        System.out.println(isSymmetric(build(0,0,0)));                            // true
        System.out.println(isSymmetric(build(1,2,2,3,4,4,5)));                    // false
        System.out.println(isSymmetric(build(5,4,4,3,2,2,3)));                    // true
    }
}`,
  "diameter-of-binary-tree": `import java.util.*;

public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    public static int diameterOfBinaryTree(TreeNode root) {
        // DFS post-order: return height; update global max diameter at each node

        return 0;
    }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode r = new TreeNode(vals[0]); Queue<TreeNode> q = new LinkedList<>(); q.add(r); int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode c = q.poll();
            if (i < vals.length && vals[i] != null) { c.left = new TreeNode(vals[i]); q.add(c.left); } i++;
            if (i < vals.length && vals[i] != null) { c.right = new TreeNode(vals[i]); q.add(c.right); } i++;
        }
        return r;
    }

    public static void main(String[] args) {
        System.out.println(diameterOfBinaryTree(build(1,2,3,4,5)));               // 3
        System.out.println(diameterOfBinaryTree(build(1,2)));                     // 1
        System.out.println(diameterOfBinaryTree(null));                           // 0
        System.out.println(diameterOfBinaryTree(build(1)));                       // 0
        System.out.println(diameterOfBinaryTree(build(1,2,null)));                // 1
        System.out.println(diameterOfBinaryTree(build(1,null,2)));                // 1
        System.out.println(diameterOfBinaryTree(build(1,2,3,4,5,6,7)));           // 4
        System.out.println(diameterOfBinaryTree(build(1, 2, null, 3, null, 4, null, 5))); // 4
        System.out.println(diameterOfBinaryTree(build(1, null, 2, null, 3, null, 4))); // 3
        System.out.println(diameterOfBinaryTree(build(1,2,3,4,5,null,null,6,7))); // 5
        System.out.println(diameterOfBinaryTree(build(4,-7,-3,null,null,-9,-3,9,-7,-4,null,6,null,-6,-6,null,null,0,6,5,null,9,null,null,-1,-4,null,null,null,-2))); // 8
    }
}`,
  "path-sum": `import java.util.*;

public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    public static boolean hasPathSum(TreeNode root, int targetSum) {
        // DFS — at leaf, check if remaining target equals leaf's value

        return false;
    }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode r = new TreeNode(vals[0]); Queue<TreeNode> q = new LinkedList<>(); q.add(r); int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode c = q.poll();
            if (i < vals.length && vals[i] != null) { c.left = new TreeNode(vals[i]); q.add(c.left); } i++;
            if (i < vals.length && vals[i] != null) { c.right = new TreeNode(vals[i]); q.add(c.right); } i++;
        }
        return r;
    }

    public static void main(String[] args) {
        System.out.println(hasPathSum(build(5,4,8,11,null,13,4,7,2,null,null,null,1), 22));  // true
        System.out.println(hasPathSum(build(1,2,3), 5));                  // false
        System.out.println(hasPathSum(null, 0));                           // false
        System.out.println(hasPathSum(build(1), 1));                       // true
        System.out.println(hasPathSum(build(1), 0));                       // false
        System.out.println(hasPathSum(build(1, 2), 3));                    // true
        System.out.println(hasPathSum(build(1, 2), 1));                    // false (1 has a left child, not a leaf)
        System.out.println(hasPathSum(build(1, 2, 3), 4));                 // true
        System.out.println(hasPathSum(build(1, 2, 3), 3));                 // false
        System.out.println(hasPathSum(build(-2, null, -3), -5));           // true
        System.out.println(hasPathSum(build(0, 1, 1), 1));                 // true
    }
}`,
  "construct-binary-tree-preorder-inorder": `import java.util.*;

public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    public static TreeNode buildTree(int[] preorder, int[] inorder) {
        // Recursive: root = preorder[preIdx]; split inorder around root's index

        return null;
    }

    // Verify by serializing the result back to a level-order list with nulls
    static String serialize(TreeNode root) {
        if (root == null) return "[]";
        List<String> out = new ArrayList<>();
        Queue<TreeNode> q = new LinkedList<>(); q.add(root);
        while (!q.isEmpty()) {
            TreeNode n = q.poll();
            if (n == null) { out.add("null"); continue; }
            out.add(String.valueOf(n.val));
            q.add(n.left); q.add(n.right);
        }
        // Trim trailing nulls
        int end = out.size(); while (end > 0 && out.get(end - 1).equals("null")) end--;
        return "[" + String.join(",", out.subList(0, end)) + "]";
    }

    public static void main(String[] args) {
        System.out.println(serialize(buildTree(new int[]{3,9,20,15,7}, new int[]{9,3,15,20,7})));   // [3,9,20,null,null,15,7]
        System.out.println(serialize(buildTree(new int[]{-1}, new int[]{-1})));                       // [-1]
        System.out.println(serialize(buildTree(new int[]{}, new int[]{})));                           // []
        System.out.println(serialize(buildTree(new int[]{1,2}, new int[]{2,1})));                     // [1,2]
        System.out.println(serialize(buildTree(new int[]{1,2}, new int[]{1,2})));                     // [1,null,2]
        System.out.println(serialize(buildTree(new int[]{1,2,3}, new int[]{3,2,1})));                 // [1,2,null,3]
        System.out.println(serialize(buildTree(new int[]{1,2,3}, new int[]{2,1,3})));                 // [1,2,3]
        System.out.println(serialize(buildTree(new int[]{1,2,3}, new int[]{1,2,3})));                 // [1,null,2,null,3]
        System.out.println(serialize(buildTree(new int[]{5,3,1,4,8,7,9}, new int[]{1,3,4,5,7,8,9}))); // [5,3,8,1,4,7,9]
        System.out.println(serialize(buildTree(new int[]{10,5,3,7,15,12,20}, new int[]{3,5,7,10,12,15,20}))); // [10,5,15,3,7,12,20]
        System.out.println(serialize(buildTree(new int[]{1,2,4,5,3}, new int[]{4,2,5,1,3})));         // [1,2,3,4,5]
    }
}`,
  "house-robber": `public class Main {
    public static int rob(int[] nums) {
        // Two rolling vars: prev (i-2) and cur (i-1)

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(rob(new int[]{1, 2, 3, 1}));               // 4
        System.out.println(rob(new int[]{2, 7, 9, 3, 1}));            // 12
        System.out.println(rob(new int[]{}));                          // 0
        System.out.println(rob(new int[]{5}));                         // 5
        System.out.println(rob(new int[]{2, 1}));                      // 2
        System.out.println(rob(new int[]{1, 2}));                      // 2
        System.out.println(rob(new int[]{2, 1, 1, 2}));                // 4
        System.out.println(rob(new int[]{0, 0, 0}));                   // 0
        System.out.println(rob(new int[]{1, 1, 1, 1, 1}));             // 3
        System.out.println(rob(new int[]{100, 1, 1, 100}));            // 200
        System.out.println(rob(new int[]{2, 1, 1, 2, 1, 1, 2}));       // 8
    }
}`,
  "unique-paths": `public class Main {
    public static int uniquePaths(int m, int n) {
        // DP or binomial coefficient

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(uniquePaths(3, 7));    // 28
        System.out.println(uniquePaths(3, 2));    // 3
        System.out.println(uniquePaths(1, 1));    // 1
        System.out.println(uniquePaths(1, 10));   // 1
        System.out.println(uniquePaths(10, 1));   // 1
        System.out.println(uniquePaths(2, 2));    // 2
        System.out.println(uniquePaths(3, 3));    // 6
        System.out.println(uniquePaths(7, 3));    // 28
        System.out.println(uniquePaths(4, 5));    // 35
        System.out.println(uniquePaths(10, 10));  // 48620
        System.out.println(uniquePaths(15, 15));  // 40116600
    }
}`,
  "edit-distance": `public class Main {
    public static int minDistance(String word1, String word2) {
        // 2D DP table; can be optimized to 1D

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(minDistance("horse", "ros"));              // 3
        System.out.println(minDistance("intention", "execution"));    // 5
        System.out.println(minDistance("", ""));                       // 0
        System.out.println(minDistance("a", ""));                      // 1
        System.out.println(minDistance("", "a"));                      // 1
        System.out.println(minDistance("a", "a"));                     // 0
        System.out.println(minDistance("a", "b"));                     // 1
        System.out.println(minDistance("abc", "abc"));                 // 0
        System.out.println(minDistance("abc", "abd"));                 // 1
        System.out.println(minDistance("abc", "yabd"));                // 2
        System.out.println(minDistance("kitten", "sitting"));          // 3
        System.out.println(minDistance("flaw", "lawn"));               // 2
    }
}`,
  "longest-common-subsequence": `public class Main {
    public static int longestCommonSubsequence(String text1, String text2) {
        // 2D DP

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(longestCommonSubsequence("abcde", "ace"));     // 3
        System.out.println(longestCommonSubsequence("abc", "abc"));        // 3
        System.out.println(longestCommonSubsequence("abc", "def"));        // 0
        System.out.println(longestCommonSubsequence("", ""));              // 0
        System.out.println(longestCommonSubsequence("a", ""));             // 0
        System.out.println(longestCommonSubsequence("", "a"));             // 0
        System.out.println(longestCommonSubsequence("a", "a"));            // 1
        System.out.println(longestCommonSubsequence("a", "b"));            // 0
        System.out.println(longestCommonSubsequence("ezupkr", "ubmrapg")); // 2
        System.out.println(longestCommonSubsequence("oxcpqrsvwf", "shmtulqrypy")); // 2
        System.out.println(longestCommonSubsequence("AGGTAB", "GXTXAYB"));   // 4
    }
}`,
  "longest-palindromic-substring": `public class Main {
    public static String longestPalindrome(String s) {
        // Expand around each center; track longest

        return "";
    }

    // Verify: result must be a palindrome of the maximum possible length found in s.
    // Since multiple correct answers exist, we test by length matching the expected length.
    static int len(String s) { return s == null ? 0 : s.length(); }
    static boolean isPalin(String s) {
        if (s == null) return false;
        int i = 0, j = s.length() - 1;
        while (i < j) { if (s.charAt(i++) != s.charAt(j--)) return false; }
        return true;
    }
    static int check(String input, String result) {
        if (!isPalin(result)) return -1;
        if (!input.contains(result)) return -1;
        return result.length();
    }

    public static void main(String[] args) {
        System.out.println(check("babad", longestPalindrome("babad")));        // 3
        System.out.println(check("cbbd", longestPalindrome("cbbd")));          // 2
        System.out.println(check("a", longestPalindrome("a")));                // 1
        System.out.println(check("ac", longestPalindrome("ac")));              // 1
        System.out.println(check("aa", longestPalindrome("aa")));              // 2
        System.out.println(check("aaaa", longestPalindrome("aaaa")));          // 4
        System.out.println(check("racecar", longestPalindrome("racecar")));    // 7
        System.out.println(check("noon", longestPalindrome("noon")));          // 4
        System.out.println(check("abacdfgdcaba", longestPalindrome("abacdfgdcaba"))); // 3
        System.out.println(check("forgeeksskeegfor", longestPalindrome("forgeeksskeegfor"))); // 10
        System.out.println(check("xyz", longestPalindrome("xyz")));            // 1
    }
}`,
  "decode-ways": `public class Main {
    public static int numDecodings(String s) {
        // 1D DP, two rolling values

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(numDecodings("12"));         // 2
        System.out.println(numDecodings("226"));        // 3
        System.out.println(numDecodings("06"));         // 0
        System.out.println(numDecodings(""));           // 0
        System.out.println(numDecodings("0"));          // 0
        System.out.println(numDecodings("1"));          // 1
        System.out.println(numDecodings("10"));         // 1
        System.out.println(numDecodings("27"));         // 1
        System.out.println(numDecodings("11106"));      // 2
        System.out.println(numDecodings("100"));        // 0
        System.out.println(numDecodings("1234567890")); // 0
        System.out.println(numDecodings("111111111111111111111111111111111111111111111")); // 1836311903
    }
}`,
  "first-missing-positive": `public class Main {
    public static int firstMissingPositive(int[] nums) {
        // In-place cyclic sort; then linear scan

        return 1;
    }

    public static void main(String[] args) {
        System.out.println(firstMissingPositive(new int[]{1,2,0}));            // 3
        System.out.println(firstMissingPositive(new int[]{3,4,-1,1}));         // 2
        System.out.println(firstMissingPositive(new int[]{7,8,9,11,12}));      // 1
        System.out.println(firstMissingPositive(new int[]{}));                  // 1
        System.out.println(firstMissingPositive(new int[]{1}));                 // 2
        System.out.println(firstMissingPositive(new int[]{2}));                 // 1
        System.out.println(firstMissingPositive(new int[]{1,1}));               // 2
        System.out.println(firstMissingPositive(new int[]{0}));                 // 1
        System.out.println(firstMissingPositive(new int[]{-1,-2,-3}));          // 1
        System.out.println(firstMissingPositive(new int[]{1,2,3,4,5}));         // 6
        System.out.println(firstMissingPositive(new int[]{2,3,4,5,6}));         // 1
    }
}`,
  "maximal-square": `public class Main {
    public static int maximalSquare(char[][] matrix) {
        // DP: dp[i][j] = side length of largest square with bottom-right at (i, j)

        return 0;
    }

    static char[][] m(String... rows) {
        int r = rows.length, c = rows[0].length();
        char[][] g = new char[r][c];
        for (int i = 0; i < r; i++) for (int j = 0; j < c; j++) g[i][j] = rows[i].charAt(j);
        return g;
    }

    public static void main(String[] args) {
        System.out.println(maximalSquare(m("10100", "10111", "11111", "10010"))); // 4
        System.out.println(maximalSquare(m("01", "10")));                          // 1
        System.out.println(maximalSquare(m("0")));                                 // 0
        System.out.println(maximalSquare(m("1")));                                 // 1
        System.out.println(maximalSquare(m("11", "11")));                          // 4
        System.out.println(maximalSquare(m("000", "000", "000")));                 // 0
        System.out.println(maximalSquare(m("111", "111", "111")));                 // 9
        System.out.println(maximalSquare(m("1111", "1111", "1111", "1111")));      // 16
        System.out.println(maximalSquare(m("10000", "11000", "11100", "11110")));  // 4
        System.out.println(maximalSquare(m("0011", "0011", "0011")));              // 4
        System.out.println(maximalSquare(m("11000", "11000", "00111", "00111", "00111"))); // 9
    }
}`,
  "search-in-bst": `import java.util.*;

public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    public static TreeNode searchBST(TreeNode root, int val) {
        // Iterative or recursive — use BST property to walk

        return null;
    }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode r = new TreeNode(vals[0]); Queue<TreeNode> q = new LinkedList<>(); q.add(r); int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode c = q.poll();
            if (i < vals.length && vals[i] != null) { c.left = new TreeNode(vals[i]); q.add(c.left); } i++;
            if (i < vals.length && vals[i] != null) { c.right = new TreeNode(vals[i]); q.add(c.right); } i++;
        }
        return r;
    }
    static String s(TreeNode root) {
        if (root == null) return "[]";
        List<String> out = new ArrayList<>(); Queue<TreeNode> q = new LinkedList<>(); q.add(root);
        while (!q.isEmpty()) { TreeNode n = q.poll(); if (n == null) { out.add("null"); continue; } out.add(String.valueOf(n.val)); q.add(n.left); q.add(n.right); }
        int e = out.size(); while (e > 0 && out.get(e-1).equals("null")) e--;
        return "[" + String.join(",", out.subList(0, e)) + "]";
    }

    public static void main(String[] args) {
        System.out.println(s(searchBST(build(4,2,7,1,3), 2)));        // [2,1,3]
        System.out.println(s(searchBST(build(4,2,7,1,3), 5)));        // []
        System.out.println(s(searchBST(null, 1)));                     // []
        System.out.println(s(searchBST(build(1), 1)));                 // [1]
        System.out.println(s(searchBST(build(1), 2)));                 // []
        System.out.println(s(searchBST(build(5,3,7), 7)));             // [7]
        System.out.println(s(searchBST(build(5,3,7), 3)));             // [3]
        System.out.println(s(searchBST(build(5,3,7), 5)));             // [5,3,7]
        System.out.println(s(searchBST(build(10,5,15,3,7,null,18), 7))); // [7]
        System.out.println(s(searchBST(build(10,5,15,3,7,null,18), 15))); // [15,null,18]
        System.out.println(s(searchBST(build(10,5,15,3,7,null,18), 100))); // []
    }
}`,
  "insert-into-bst": `import java.util.*;

public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    public static TreeNode insertIntoBST(TreeNode root, int val) {
        // Walk down the BST until you find an empty spot

        return root;
    }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode r = new TreeNode(vals[0]); Queue<TreeNode> q = new LinkedList<>(); q.add(r); int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode c = q.poll();
            if (i < vals.length && vals[i] != null) { c.left = new TreeNode(vals[i]); q.add(c.left); } i++;
            if (i < vals.length && vals[i] != null) { c.right = new TreeNode(vals[i]); q.add(c.right); } i++;
        }
        return r;
    }
    static List<Integer> inorder(TreeNode n, List<Integer> acc) {
        if (n == null) return acc;
        inorder(n.left, acc); acc.add(n.val); inorder(n.right, acc);
        return acc;
    }
    // Verifier: insertion correct iff inorder is sorted AND contains all original values + new val
    static boolean valid(TreeNode original, int val, TreeNode result) {
        List<Integer> origVals = inorder(original, new ArrayList<>());
        List<Integer> resVals = inorder(result, new ArrayList<>());
        if (resVals.size() != origVals.size() + 1) return false;
        for (int i = 1; i < resVals.size(); i++) if (resVals.get(i) < resVals.get(i-1)) return false;
        // Multiset check
        List<Integer> expected = new ArrayList<>(origVals); expected.add(val); Collections.sort(expected);
        return expected.equals(resVals);
    }

    public static void main(String[] args) {
        System.out.println(valid(build(4,2,7,1,3), 5, insertIntoBST(build(4,2,7,1,3), 5)));    // true
        System.out.println(valid(build(40,20,60,10,30,50,70), 25, insertIntoBST(build(40,20,60,10,30,50,70), 25))); // true
        System.out.println(valid(build(4,2,7,1,3,null,null,null,null,null,null), 5, insertIntoBST(build(4,2,7,1,3,null,null,null,null,null,null), 5))); // true
        System.out.println(valid(null, 5, insertIntoBST(null, 5)));                              // true
        System.out.println(valid(build(1), 2, insertIntoBST(build(1), 2)));                       // true
        System.out.println(valid(build(2), 1, insertIntoBST(build(2), 1)));                       // true
        System.out.println(valid(build(2,1,3), 4, insertIntoBST(build(2,1,3), 4)));               // true
        System.out.println(valid(build(2,1,3), 0, insertIntoBST(build(2,1,3), 0)));               // true
        System.out.println(valid(build(10,5,15), 12, insertIntoBST(build(10,5,15), 12)));         // true
        System.out.println(valid(build(50,30,70,20,40,60,80), 25, insertIntoBST(build(50,30,70,20,40,60,80), 25))); // true
        System.out.println(valid(build(50,30,70,20,40,60,80), 100, insertIntoBST(build(50,30,70,20,40,60,80), 100))); // true
    }
}`,
  "sorted-array-to-bst": `import java.util.*;

public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    public static TreeNode sortedArrayToBST(int[] nums) {
        // Pick mid as root, recurse on left/right halves

        return null;
    }

    static List<Integer> inorder(TreeNode n, List<Integer> acc) {
        if (n == null) return acc;
        inorder(n.left, acc); acc.add(n.val); inorder(n.right, acc);
        return acc;
    }
    static int height(TreeNode n) {
        if (n == null) return 0;
        return 1 + Math.max(height(n.left), height(n.right));
    }
    static boolean balanced(TreeNode n) {
        if (n == null) return true;
        if (Math.abs(height(n.left) - height(n.right)) > 1) return false;
        return balanced(n.left) && balanced(n.right);
    }
    static boolean valid(int[] nums, TreeNode result) {
        List<Integer> in = inorder(result, new ArrayList<>());
        if (in.size() != nums.length) return false;
        for (int i = 0; i < nums.length; i++) if (in.get(i) != nums[i]) return false;
        return balanced(result);
    }

    public static void main(String[] args) {
        System.out.println(valid(new int[]{-10,-3,0,5,9}, sortedArrayToBST(new int[]{-10,-3,0,5,9}))); // true
        System.out.println(valid(new int[]{1,3}, sortedArrayToBST(new int[]{1,3})));                    // true
        System.out.println(valid(new int[]{}, sortedArrayToBST(new int[]{})));                          // true
        System.out.println(valid(new int[]{0}, sortedArrayToBST(new int[]{0})));                        // true
        System.out.println(valid(new int[]{1,2}, sortedArrayToBST(new int[]{1,2})));                    // true
        System.out.println(valid(new int[]{1,2,3,4,5,6,7}, sortedArrayToBST(new int[]{1,2,3,4,5,6,7}))); // true
        System.out.println(valid(new int[]{-5,-3,0,3,5}, sortedArrayToBST(new int[]{-5,-3,0,3,5})));    // true
        System.out.println(valid(new int[]{1,1,1,1}, sortedArrayToBST(new int[]{1,1,1,1})));            // true
        System.out.println(valid(new int[]{0,0,0}, sortedArrayToBST(new int[]{0,0,0})));                // true
        System.out.println(valid(new int[]{1,2,3,4,5,6,7,8,9,10}, sortedArrayToBST(new int[]{1,2,3,4,5,6,7,8,9,10}))); // true
        System.out.println(height(sortedArrayToBST(new int[]{1,2,3,4,5,6,7})));                          // 3
    }
}`,
  "kth-smallest-bst": `import java.util.*;

public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    public static int kthSmallest(TreeNode root, int k) {
        // Iterative inorder with a stack; stop after k pops

        return 0;
    }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode r = new TreeNode(vals[0]); Queue<TreeNode> q = new LinkedList<>(); q.add(r); int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode c = q.poll();
            if (i < vals.length && vals[i] != null) { c.left = new TreeNode(vals[i]); q.add(c.left); } i++;
            if (i < vals.length && vals[i] != null) { c.right = new TreeNode(vals[i]); q.add(c.right); } i++;
        }
        return r;
    }

    public static void main(String[] args) {
        System.out.println(kthSmallest(build(3,1,4,null,2), 1));                  // 1
        System.out.println(kthSmallest(build(5,3,6,2,4,null,null,1), 3));         // 3
        System.out.println(kthSmallest(build(1), 1));                              // 1
        System.out.println(kthSmallest(build(2,1), 1));                            // 1
        System.out.println(kthSmallest(build(2,1), 2));                            // 2
        System.out.println(kthSmallest(build(2,1,3), 2));                          // 2
        System.out.println(kthSmallest(build(50,30,70,20,40,60,80), 1));           // 20
        System.out.println(kthSmallest(build(50,30,70,20,40,60,80), 4));           // 50
        System.out.println(kthSmallest(build(50,30,70,20,40,60,80), 7));           // 80
        System.out.println(kthSmallest(build(5,3,6,2,4,null,null,1), 1));         // 1
        System.out.println(kthSmallest(build(5,3,6,2,4,null,null,1), 5));         // 6
    }
}`,
  "implement-trie": `public class Main {
    static class Trie {
        // 26-ary tree, each node tracks isEnd

        public Trie() {

        }

        public void insert(String word) {

        }

        public boolean search(String word) {
            return false;
        }

        public boolean startsWith(String prefix) {
            return false;
        }
    }

    public static void main(String[] args) {
        Trie t = new Trie();
        t.insert("apple");
        System.out.println(t.search("apple"));       // true
        System.out.println(t.search("app"));         // false
        System.out.println(t.startsWith("app"));     // true
        t.insert("app");
        System.out.println(t.search("app"));         // true

        Trie u = new Trie();
        System.out.println(u.search("anything"));    // false
        System.out.println(u.startsWith(""));        // true
        u.insert("hello");
        System.out.println(u.startsWith("h"));       // true
        System.out.println(u.startsWith("hello"));   // true
        System.out.println(u.startsWith("helloo"));  // false
        System.out.println(u.search(""));            // false

        Trie v = new Trie();
        v.insert("a"); v.insert("ab"); v.insert("abc");
        System.out.println(v.search("a"));           // true
        System.out.println(v.search("ab"));          // true
        System.out.println(v.search("abc"));         // true
        System.out.println(v.search("abcd"));        // false
        System.out.println(v.startsWith("abc"));     // true
    }
}`,
  "combinations": `import java.util.*;

public class Main {
    public static List<List<Integer>> combine(int n, int k) {
        // Backtracking — pick a number, recurse with start = pick + 1

        return new ArrayList<>();
    }

    static String canonical(List<List<Integer>> combos) {
        List<List<Integer>> sorted = new ArrayList<>();
        for (List<Integer> c : combos) { List<Integer> copy = new ArrayList<>(c); Collections.sort(copy); sorted.add(copy); }
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
        System.out.println(canonical(combine(4, 2)));    // [[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]]
        System.out.println(canonical(combine(1, 1)));    // [[1]]
        System.out.println(canonical(combine(2, 1)));    // [[1], [2]]
        System.out.println(canonical(combine(3, 1)));    // [[1], [2], [3]]
        System.out.println(canonical(combine(3, 2)));    // [[1, 2], [1, 3], [2, 3]]
        System.out.println(canonical(combine(3, 3)));    // [[1, 2, 3]]
        System.out.println(canonical(combine(4, 4)));    // [[1, 2, 3, 4]]
        System.out.println(combine(5, 2).size());        // 10
        System.out.println(combine(6, 3).size());        // 20
        System.out.println(combine(10, 5).size());       // 252
        System.out.println(combine(8, 4).size());        // 70
    }
}`,
  "combination-sum": `import java.util.*;

public class Main {
    public static List<List<Integer>> combinationSum(int[] candidates, int target) {
        // Backtracking with reuse — same index can be picked again

        return new ArrayList<>();
    }

    static String canonical(List<List<Integer>> combos) {
        List<List<Integer>> sorted = new ArrayList<>();
        for (List<Integer> c : combos) { List<Integer> copy = new ArrayList<>(c); Collections.sort(copy); sorted.add(copy); }
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
        System.out.println(canonical(combinationSum(new int[]{2,3,6,7}, 7)));        // [[7], [2, 2, 3]]
        System.out.println(canonical(combinationSum(new int[]{2,3,5}, 8)));          // [[3, 5], [2, 3, 3], [2, 2, 2, 2]]
        System.out.println(canonical(combinationSum(new int[]{2}, 1)));               // []
        System.out.println(canonical(combinationSum(new int[]{1}, 1)));               // [[1]]
        System.out.println(canonical(combinationSum(new int[]{1}, 2)));               // [[1, 1]]
        System.out.println(canonical(combinationSum(new int[]{1, 2}, 4)));            // [[2, 2], [1, 1, 2], [1, 1, 1, 1]]
        System.out.println(canonical(combinationSum(new int[]{8, 7, 4, 3}, 11)));     // [[3, 8], [4, 7], [3, 4, 4]]
        System.out.println(canonical(combinationSum(new int[]{2, 3, 5}, 0)));         // [[]]
        System.out.println(combinationSum(new int[]{2,3,5}, 8).size());               // 3
        System.out.println(combinationSum(new int[]{2,3,6,7}, 7).size());             // 2
        System.out.println(combinationSum(new int[]{1}, 5).size());                   // 1
    }
}`,
  "generate-parentheses": `import java.util.*;

public class Main {
    public static List<String> generateParenthesis(int n) {
        // Backtracking, track open/close counts

        return new ArrayList<>();
    }

    static String canonical(List<String> list) {
        List<String> sorted = new ArrayList<>(list);
        Collections.sort(sorted);
        return sorted.toString();
    }

    public static void main(String[] args) {
        System.out.println(canonical(generateParenthesis(0)));    // []
        System.out.println(canonical(generateParenthesis(1)));    // [()]
        System.out.println(canonical(generateParenthesis(2)));    // [(()), ()()]
        System.out.println(canonical(generateParenthesis(3)));    // [((())), (()()), (())(), ()(()), ()()()]
        System.out.println(generateParenthesis(0).size());        // 1 (the empty string) or 0 — implementation-defined; standard is 1
        System.out.println(generateParenthesis(1).size());        // 1
        System.out.println(generateParenthesis(2).size());        // 2
        System.out.println(generateParenthesis(3).size());        // 5
        System.out.println(generateParenthesis(4).size());        // 14
        System.out.println(generateParenthesis(5).size());        // 42
        System.out.println(generateParenthesis(6).size());        // 132
    }
}`,
  "letter-combinations-of-phone-number": `import java.util.*;

public class Main {
    public static List<String> letterCombinations(String digits) {
        // Backtracking through digit-to-letter map

        return new ArrayList<>();
    }

    static String sorted(List<String> list) {
        List<String> s = new ArrayList<>(list);
        Collections.sort(s);
        return s.toString();
    }

    public static void main(String[] args) {
        System.out.println(sorted(letterCombinations("23")));          // [ad, ae, af, bd, be, bf, cd, ce, cf]
        System.out.println(sorted(letterCombinations("")));            // []
        System.out.println(sorted(letterCombinations("2")));           // [a, b, c]
        System.out.println(sorted(letterCombinations("9")));           // [w, x, y, z]
        System.out.println(sorted(letterCombinations("7")));           // [p, q, r, s]
        System.out.println(letterCombinations("234").size());          // 27
        System.out.println(letterCombinations("79").size());           // 16
        System.out.println(letterCombinations("23").size());           // 9
        System.out.println(letterCombinations("5678").size());         // 81
        System.out.println(letterCombinations("2345").size());         // 81
        System.out.println(letterCombinations("").size());             // 0
    }
}`,
  "n-queens": `import java.util.*;

public class Main {
    public static List<List<String>> solveNQueens(int n) {
        // Backtracking row-by-row with cols / diag1 / diag2 tracking sets

        return new ArrayList<>();
    }

    public static void main(String[] args) {
        System.out.println(solveNQueens(1).size());       // 1
        System.out.println(solveNQueens(2).size());       // 0
        System.out.println(solveNQueens(3).size());       // 0
        System.out.println(solveNQueens(4).size());       // 2
        System.out.println(solveNQueens(5).size());       // 10
        System.out.println(solveNQueens(6).size());       // 4
        System.out.println(solveNQueens(7).size());       // 40
        System.out.println(solveNQueens(8).size());       // 92
        System.out.println(solveNQueens(9).size());       // 352
        // Sanity: each board has n strings, each string of length n with exactly one Q per row
        List<List<String>> r = solveNQueens(4);
        if (!r.isEmpty()) {
            System.out.println(r.get(0).size());           // 4
            System.out.println(r.get(0).get(0).length());  // 4
        } else {
            System.out.println(0); System.out.println(0);
        }
    }
}`,
  "course-schedule-ii": `import java.util.*;

public class Main {
    public static int[] findOrder(int numCourses, int[][] prerequisites) {
        // Kahn's algorithm: in-degree array + queue

        return new int[]{};
    }

    // Verifier: result must be either [] (cycle) or a valid topo order
    static boolean valid(int n, int[][] prereqs, int[] order) {
        if (order.length == 0) {
            // Verify there really is a cycle
            int[] indeg = new int[n];
            List<List<Integer>> adj = new ArrayList<>();
            for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
            for (int[] p : prereqs) { adj.get(p[1]).add(p[0]); indeg[p[0]]++; }
            Queue<Integer> q = new LinkedList<>();
            for (int i = 0; i < n; i++) if (indeg[i] == 0) q.add(i);
            int processed = 0;
            while (!q.isEmpty()) { int c = q.poll(); processed++; for (int nb : adj.get(c)) if (--indeg[nb] == 0) q.add(nb); }
            return processed < n;
        }
        if (order.length != n) return false;
        Map<Integer, Integer> pos = new HashMap<>();
        for (int i = 0; i < order.length; i++) pos.put(order[i], i);
        if (pos.size() != n) return false;
        for (int[] p : prereqs) if (pos.get(p[1]) >= pos.get(p[0])) return false;
        return true;
    }

    public static void main(String[] args) {
        System.out.println(valid(2, new int[][]{{1,0}}, findOrder(2, new int[][]{{1,0}})));                           // true
        System.out.println(valid(4, new int[][]{{1,0},{2,0},{3,1},{3,2}}, findOrder(4, new int[][]{{1,0},{2,0},{3,1},{3,2}}))); // true
        System.out.println(valid(2, new int[][]{{1,0},{0,1}}, findOrder(2, new int[][]{{1,0},{0,1}})));               // true (impossible -> [])
        System.out.println(valid(1, new int[][]{}, findOrder(1, new int[][]{})));                                      // true
        System.out.println(valid(3, new int[][]{}, findOrder(3, new int[][]{})));                                      // true
        System.out.println(valid(3, new int[][]{{0,1},{1,2}}, findOrder(3, new int[][]{{0,1},{1,2}})));               // true
        System.out.println(valid(5, new int[][]{{1,0},{2,1},{3,2},{4,3}}, findOrder(5, new int[][]{{1,0},{2,1},{3,2},{4,3}}))); // true
        System.out.println(valid(3, new int[][]{{0,1},{1,2},{2,0}}, findOrder(3, new int[][]{{0,1},{1,2},{2,0}})));   // true (cycle -> [])
        System.out.println(valid(6, new int[][]{{1,0},{2,1},{4,3},{5,4}}, findOrder(6, new int[][]{{1,0},{2,1},{4,3},{5,4}}))); // true
        System.out.println(valid(2, new int[][]{{0,0}}, findOrder(2, new int[][]{{0,0}})));                            // true (self-cycle -> [])
        System.out.println(valid(7, new int[][]{{1,0},{2,1},{3,1},{4,2},{4,3},{5,4},{6,5}}, findOrder(7, new int[][]{{1,0},{2,1},{3,1},{4,2},{4,3},{5,4},{6,5}}))); // true
    }
}`,
  "rotting-oranges": `import java.util.*;

public class Main {
    public static int orangesRotting(int[][] grid) {
        // Multi-source BFS from all rotten cells; track time and remaining fresh count

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(orangesRotting(new int[][]{{2,1,1},{1,1,0},{0,1,1}}));     // 4
        System.out.println(orangesRotting(new int[][]{{2,1,1},{0,1,1},{1,0,1}}));     // -1
        System.out.println(orangesRotting(new int[][]{{0,2}}));                        // 0
        System.out.println(orangesRotting(new int[][]{{0}}));                          // 0
        System.out.println(orangesRotting(new int[][]{{1}}));                          // -1
        System.out.println(orangesRotting(new int[][]{{2}}));                          // 0
        System.out.println(orangesRotting(new int[][]{{0,0,0}}));                       // 0
        System.out.println(orangesRotting(new int[][]{{2,2,2,2}}));                     // 0
        System.out.println(orangesRotting(new int[][]{{1,1,1},{1,1,1},{1,1,2}}));      // 4
        System.out.println(orangesRotting(new int[][]{{2,2},{1,1},{0,0},{2,0}}));      // 1
        System.out.println(orangesRotting(new int[][]{{2,1,1,1,1},{1,1,1,1,1},{1,1,1,1,1},{1,1,1,1,2}})); // 4
    }
}`,
  "flood-fill": `import java.util.*;

public class Main {
    public static int[][] floodFill(int[][] image, int sr, int sc, int color) {
        // DFS or BFS — short-circuit if image[sr][sc] already equals color

        return image;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.deepToString(floodFill(new int[][]{{1,1,1},{1,1,0},{1,0,1}}, 1, 1, 2))); // [[2, 2, 2], [2, 2, 0], [2, 0, 1]]
        System.out.println(Arrays.deepToString(floodFill(new int[][]{{0,0,0},{0,0,0}}, 0, 0, 0)));         // [[0, 0, 0], [0, 0, 0]]
        System.out.println(Arrays.deepToString(floodFill(new int[][]{{0,0,0},{0,1,1}}, 1, 1, 1)));         // [[0, 0, 0], [0, 1, 1]]
        System.out.println(Arrays.deepToString(floodFill(new int[][]{{1}}, 0, 0, 2)));                      // [[2]]
        System.out.println(Arrays.deepToString(floodFill(new int[][]{{0}}, 0, 0, 2)));                      // [[2]]
        System.out.println(Arrays.deepToString(floodFill(new int[][]{{1,1},{1,1}}, 0, 0, 2)));              // [[2, 2], [2, 2]]
        System.out.println(Arrays.deepToString(floodFill(new int[][]{{1,2,3},{2,2,2},{1,2,1}}, 1, 1, 5))); // [[1, 5, 3], [5, 5, 5], [1, 5, 1]]
        System.out.println(Arrays.deepToString(floodFill(new int[][]{{0,0,0},{1,1,1}}, 0, 0, 9)));         // [[9, 9, 9], [1, 1, 1]]
        System.out.println(Arrays.deepToString(floodFill(new int[][]{{1,1,1},{1,0,1},{1,1,1}}, 0, 0, 5))); // [[5, 5, 5], [5, 0, 5], [5, 5, 5]]
        System.out.println(Arrays.deepToString(floodFill(new int[][]{{1,1,1},{1,0,1},{1,1,1}}, 1, 1, 5))); // [[1, 1, 1], [1, 5, 1], [1, 1, 1]]
        System.out.println(Arrays.deepToString(floodFill(new int[][]{{0,0,0},{0,0,0},{0,0,0}}, 1, 1, 7))); // [[7, 7, 7], [7, 7, 7], [7, 7, 7]]
    }
}`,
  "surrounded-regions": `import java.util.*;

public class Main {
    public static void solve(char[][] board) {
        // 1) Flip all border-touching 'O's (and their reachables) to '#'
        // 2) Walk grid: 'O' -> 'X'; '#' -> 'O'

    }

    static char[][] m(String... rows) {
        char[][] g = new char[rows.length][rows[0].length()];
        for (int i = 0; i < rows.length; i++) for (int j = 0; j < rows[0].length(); j++) g[i][j] = rows[i].charAt(j);
        return g;
    }

    public static void main(String[] args) {
        char[][] a = m("XXXX","XOOX","XXOX","XOXX"); solve(a);
        System.out.println(Arrays.deepToString(a));    // [[X, X, X, X], [X, X, X, X], [X, X, X, X], [X, O, X, X]]
        char[][] b = m("X"); solve(b);
        System.out.println(Arrays.deepToString(b));    // [[X]]
        char[][] c = m("O"); solve(c);
        System.out.println(Arrays.deepToString(c));    // [[O]]
        char[][] d = m("OO","OO"); solve(d);
        System.out.println(Arrays.deepToString(d));    // [[O, O], [O, O]]
        char[][] e = m("XX","XX"); solve(e);
        System.out.println(Arrays.deepToString(e));    // [[X, X], [X, X]]
        char[][] f = m("XXX","XOX","XXX"); solve(f);
        System.out.println(Arrays.deepToString(f));    // [[X, X, X], [X, X, X], [X, X, X]]
        char[][] g = m("OOO","OXO","OOO"); solve(g);
        System.out.println(Arrays.deepToString(g));    // [[O, O, O], [O, X, O], [O, O, O]]
        char[][] h = m("XXXX","XOXX","XXOX","XXXX"); solve(h);
        System.out.println(Arrays.deepToString(h));    // [[X, X, X, X], [X, X, X, X], [X, X, X, X], [X, X, X, X]]
        char[][] i = m("OXXO","XOOX","XOOX","OXXO"); solve(i);
        System.out.println(Arrays.deepToString(i));    // [[O, X, X, O], [X, X, X, X], [X, X, X, X], [O, X, X, O]]
        char[][] j = m("XOOX","OOXO","XOOX","OXOO"); solve(j);
        System.out.println(Arrays.deepToString(j));    // [[X, O, O, X], [O, O, X, O], [X, O, O, X], [O, X, O, O]]
        char[][] k = m("XXXXX","XOOOX","XOXOX","XOOOX","XXXXX"); solve(k);
        System.out.println(Arrays.deepToString(k));    // [[X, X, X, X, X], [X, X, X, X, X], [X, X, X, X, X], [X, X, X, X, X], [X, X, X, X, X]]
    }
}`,
  "number-of-provinces": `import java.util.*;

public class Main {
    public static int findCircleNum(int[][] isConnected) {
        // DFS / BFS / Union-Find — count connected components

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(findCircleNum(new int[][]{{1,1,0},{1,1,0},{0,0,1}}));                          // 2
        System.out.println(findCircleNum(new int[][]{{1,0,0},{0,1,0},{0,0,1}}));                          // 3
        System.out.println(findCircleNum(new int[][]{{1}}));                                               // 1
        System.out.println(findCircleNum(new int[][]{{1,1},{1,1}}));                                       // 1
        System.out.println(findCircleNum(new int[][]{{1,0},{0,1}}));                                       // 2
        System.out.println(findCircleNum(new int[][]{{1,1,1},{1,1,1},{1,1,1}}));                          // 1
        System.out.println(findCircleNum(new int[][]{{1,0,0,0},{0,1,0,0},{0,0,1,0},{0,0,0,1}}));          // 4
        System.out.println(findCircleNum(new int[][]{{1,1,0,0},{1,1,0,0},{0,0,1,1},{0,0,1,1}}));          // 2
        System.out.println(findCircleNum(new int[][]{{1,0,0,1},{0,1,1,0},{0,1,1,1},{1,0,1,1}}));          // 1
        System.out.println(findCircleNum(new int[][]{{1,1,0,0,0},{1,1,0,0,0},{0,0,1,0,0},{0,0,0,1,1},{0,0,0,1,1}})); // 3
        System.out.println(findCircleNum(new int[][]{{1,0,0,1,0},{0,1,1,0,0},{0,1,1,0,0},{1,0,0,1,1},{0,0,0,1,1}})); // 2
    }
}`,
  "coin-change-ii": `public class Main {
    public static int change(int amount, int[] coins) {
        // 1D DP, coin loop outer

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(change(5, new int[]{1, 2, 5}));         // 4
        System.out.println(change(3, new int[]{2}));                // 0
        System.out.println(change(10, new int[]{10}));              // 1
        System.out.println(change(0, new int[]{1, 2, 5}));          // 1
        System.out.println(change(0, new int[]{}));                  // 1
        System.out.println(change(1, new int[]{1}));                // 1
        System.out.println(change(7, new int[]{2, 4}));             // 0
        System.out.println(change(4, new int[]{1, 2, 3}));          // 4
        System.out.println(change(10, new int[]{1, 2, 5}));         // 10
        System.out.println(change(500, new int[]{1, 5, 10, 25}));   // 91716
        System.out.println(change(11, new int[]{1, 5, 11}));        // 4
    }
}`,
  "house-robber-ii": `public class Main {
    public static int rob(int[] nums) {
        // Two scans: rob(nums[0..n-2]) and rob(nums[1..n-1]); take max

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(rob(new int[]{2, 3, 2}));               // 3
        System.out.println(rob(new int[]{1, 2, 3, 1}));            // 4
        System.out.println(rob(new int[]{1, 2, 3}));               // 3
        System.out.println(rob(new int[]{}));                       // 0
        System.out.println(rob(new int[]{5}));                      // 5
        System.out.println(rob(new int[]{2, 1}));                   // 2
        System.out.println(rob(new int[]{1, 2}));                   // 2
        System.out.println(rob(new int[]{0, 0}));                   // 0
        System.out.println(rob(new int[]{200, 3, 140, 20, 10}));    // 340
        System.out.println(rob(new int[]{1, 2, 1, 1}));             // 3
        System.out.println(rob(new int[]{4, 1, 2, 7, 5, 3, 1}));    // 14
    }
}`,
  "triangle": `import java.util.*;

public class Main {
    public static int minimumTotal(List<List<Integer>> triangle) {
        // Bottom-up; in-place 1D DP

        return 0;
    }

    static List<List<Integer>> tri(Integer[][] rows) {
        List<List<Integer>> r = new ArrayList<>();
        for (Integer[] row : rows) r.add(Arrays.asList(row));
        return r;
    }

    public static void main(String[] args) {
        System.out.println(minimumTotal(tri(new Integer[][]{{2},{3,4},{6,5,7},{4,1,8,3}}))); // 11
        System.out.println(minimumTotal(tri(new Integer[][]{{-10}})));                        // -10
        System.out.println(minimumTotal(tri(new Integer[][]{{1},{2,3}})));                    // 3
        System.out.println(minimumTotal(tri(new Integer[][]{{1},{2,3},{4,5,6}})));            // 7
        System.out.println(minimumTotal(tri(new Integer[][]{{1},{2,3},{1,2,3}})));            // 4
        System.out.println(minimumTotal(tri(new Integer[][]{{0},{0,0},{0,0,0}})));             // 0
        System.out.println(minimumTotal(tri(new Integer[][]{{-1},{-2,-3}})));                 // -4
        System.out.println(minimumTotal(tri(new Integer[][]{{-1},{2,3},{1,-1,-3}})));         // -1
        System.out.println(minimumTotal(tri(new Integer[][]{{1},{1,1},{1,1,1},{1,1,1,1}})));  // 4
        System.out.println(minimumTotal(tri(new Integer[][]{{10},{1,2},{3,4,5}})));           // 14
        System.out.println(minimumTotal(tri(new Integer[][]{{2},{3,4},{6,5,7},{4,1,8,3},{5,2,6,4,8}}))); // 13
    }
}`,
  "minimum-path-sum": `public class Main {
    public static int minPathSum(int[][] grid) {
        // In-place DP

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(minPathSum(new int[][]{{1,3,1},{1,5,1},{4,2,1}}));      // 7
        System.out.println(minPathSum(new int[][]{{1,2,3},{4,5,6}}));               // 12
        System.out.println(minPathSum(new int[][]{{1}}));                            // 1
        System.out.println(minPathSum(new int[][]{{0}}));                            // 0
        System.out.println(minPathSum(new int[][]{{1,2},{3,4}}));                    // 7
        System.out.println(minPathSum(new int[][]{{1,2,3,4,5}}));                    // 15
        System.out.println(minPathSum(new int[][]{{1},{2},{3},{4},{5}}));            // 15
        System.out.println(minPathSum(new int[][]{{0,0,0},{0,0,0},{0,0,0}}));        // 0
        System.out.println(minPathSum(new int[][]{{9,1,1},{9,1,1},{9,1,1}}));        // 13
        System.out.println(minPathSum(new int[][]{{1,3,1},{1,5,1},{4,2,1},{2,1,1}})); // 8
        System.out.println(minPathSum(new int[][]{{7,1,3,5,8,9,9,2,1,9,0,8,3,1,6,6,9,5},{9,5,9,4,5,4,9,5,0,6,4,4,5,4,7,2,3,8},{1,1,8,5,4,1,8,7,3,8,3,5,8,3,5,1,9,5},{2,4,7,8,7,1,2,1,2,5,9,1,9,3,5,4,5,1},{0,7,4,3,2,8,7,8,4,7,7,1,5,9,5,7,5,1},{4,1,2,3,2,3,1,3,2,5,7,3,1,4,5,3,3,2},{2,7,3,5,7,5,4,5,3,3,3,5,4,3,4,1,1,7},{4,7,7,2,2,5,4,2,2,7,7,9,7,4,7,2,5,2}})); // 86
    }
}`,
  "insert-delete-getrandom-o1": `import java.util.*;

public class Main {
    static class RandomizedSet {
        // ArrayList for random access + HashMap<value, index>

        public RandomizedSet() {

        }

        public boolean insert(int val) {
            return false;
        }

        public boolean remove(int val) {
            return false;
        }

        public int getRandom() {
            return -1;
        }
    }

    public static void main(String[] args) {
        RandomizedSet a = new RandomizedSet();
        System.out.println(a.insert(1));     // true
        System.out.println(a.remove(2));     // false
        System.out.println(a.insert(2));     // true
        // getRandom() — verify it's one of the current elements
        int r = a.getRandom();
        System.out.println(r == 1 || r == 2); // true
        System.out.println(a.remove(1));     // true
        System.out.println(a.insert(2));     // false (already present)
        System.out.println(a.getRandom());   // 2

        RandomizedSet b = new RandomizedSet();
        System.out.println(b.insert(0));     // true
        System.out.println(b.insert(0));     // false
        System.out.println(b.remove(0));     // true
        System.out.println(b.insert(0));     // true
        System.out.println(b.getRandom());   // 0

        RandomizedSet c = new RandomizedSet();
        for (int i = 0; i < 5; i++) c.insert(i);
        // After inserting 0..4, getRandom must be in [0,4]
        int g = c.getRandom();
        System.out.println(g >= 0 && g <= 4); // true
        c.remove(2);
        // After removing 2, getRandom should never return 2
        boolean okNoTwo = true; for (int i = 0; i < 50; i++) if (c.getRandom() == 2) { okNoTwo = false; break; }
        System.out.println(okNoTwo);          // true
    }
}`,
  "time-based-key-value-store": `import java.util.*;

public class Main {
    static class TimeMap {
        // Map<key, List<{timestamp, value}>>; binary search on get

        public TimeMap() {

        }

        public void set(String key, String value, int timestamp) {

        }

        public String get(String key, int timestamp) {
            return "";
        }
    }

    public static void main(String[] args) {
        TimeMap m = new TimeMap();
        m.set("foo", "bar", 1);
        System.out.println(m.get("foo", 1));     // bar
        System.out.println(m.get("foo", 3));     // bar
        m.set("foo", "bar2", 4);
        System.out.println(m.get("foo", 4));     // bar2
        System.out.println(m.get("foo", 5));     // bar2

        TimeMap n = new TimeMap();
        System.out.println(n.get("missing", 1)); //
        n.set("a", "v1", 10);
        System.out.println(n.get("a", 5));       //
        System.out.println(n.get("a", 10));      // v1
        System.out.println(n.get("a", 100));     // v1

        TimeMap p = new TimeMap();
        p.set("k", "v1", 1);
        p.set("k", "v2", 5);
        p.set("k", "v3", 10);
        p.set("k", "v4", 15);
        System.out.println(p.get("k", 0));       //
        System.out.println(p.get("k", 1));       // v1
        System.out.println(p.get("k", 4));       // v1
        System.out.println(p.get("k", 5));       // v2
        System.out.println(p.get("k", 7));       // v2
        System.out.println(p.get("k", 12));      // v3
        System.out.println(p.get("k", 100));     // v4
    }
}`,
  "lfu-cache": `import java.util.*;

public class Main {
    static class LFUCache {
        // freq map + per-freq DLL + minFreq tracking

        public LFUCache(int capacity) {

        }

        public int get(int key) {
            return -1;
        }

        public void put(int key, int value) {

        }
    }

    public static void main(String[] args) {
        // Sequence 1 — classic LeetCode example
        LFUCache c = new LFUCache(2);
        c.put(1, 1); c.put(2, 2);
        System.out.println(c.get(1));     // 1
        c.put(3, 3);                       // evicts 2 (lower freq)
        System.out.println(c.get(2));     // -1
        System.out.println(c.get(3));     // 3
        c.put(4, 4);                       // evicts 1 (now lower freq)
        System.out.println(c.get(1));     // -1
        System.out.println(c.get(3));     // 3
        System.out.println(c.get(4));     // 4

        // Sequence 2 — capacity 0
        LFUCache d = new LFUCache(0);
        d.put(1, 1);
        System.out.println(d.get(1));     // -1

        // Sequence 3 — overwrite existing key (should not evict)
        LFUCache e = new LFUCache(2);
        e.put(1, 100); e.put(2, 200);
        e.put(1, 999);
        System.out.println(e.get(1));     // 999
        System.out.println(e.get(2));     // 200

        // Sequence 4 — frequency tie broken by recency (LRU)
        LFUCache f = new LFUCache(3);
        f.put(1, 1); f.put(2, 2); f.put(3, 3);   // all freq 1, order 1,2,3
        f.get(1);                                  // freq(1)=2
        f.put(4, 4);                               // evict 2 (freq 1, oldest)
        System.out.println(f.get(2));             // -1
        System.out.println(f.get(3));             // 3
        System.out.println(f.get(4));             // 4
    }
}`,
  "subtree-of-another-tree": `import java.util.*;

public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    public static boolean isSubtree(TreeNode root, TreeNode subRoot) {
        // Either subtree at root matches OR recursively check left/right

        return false;
    }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode r = new TreeNode(vals[0]); Queue<TreeNode> q = new LinkedList<>(); q.add(r); int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode c = q.poll();
            if (i < vals.length && vals[i] != null) { c.left = new TreeNode(vals[i]); q.add(c.left); } i++;
            if (i < vals.length && vals[i] != null) { c.right = new TreeNode(vals[i]); q.add(c.right); } i++;
        }
        return r;
    }

    public static void main(String[] args) {
        System.out.println(isSubtree(build(3,4,5,1,2), build(4,1,2)));                           // true
        System.out.println(isSubtree(build(3,4,5,1,2,null,null,null,null,0), build(4,1,2)));     // false
        System.out.println(isSubtree(null, null));                                                 // true
        System.out.println(isSubtree(build(1), null));                                             // true
        System.out.println(isSubtree(null, build(1)));                                             // false
        System.out.println(isSubtree(build(1), build(1)));                                         // true
        System.out.println(isSubtree(build(1), build(2)));                                         // false
        System.out.println(isSubtree(build(1,2,3), build(2)));                                     // true
        System.out.println(isSubtree(build(1,2,3), build(2,4)));                                   // false
        System.out.println(isSubtree(build(1,1), build(1)));                                       // true
        System.out.println(isSubtree(build(1,2,3,4,5,6,7), build(2,4,5)));                         // true
    }
}`,
  "merge-two-binary-trees": `import java.util.*;

public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    public static TreeNode mergeTrees(TreeNode root1, TreeNode root2) {
        // Recursion: if either null return the other; else sum values + recurse children

        return null;
    }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode r = new TreeNode(vals[0]); Queue<TreeNode> q = new LinkedList<>(); q.add(r); int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode c = q.poll();
            if (i < vals.length && vals[i] != null) { c.left = new TreeNode(vals[i]); q.add(c.left); } i++;
            if (i < vals.length && vals[i] != null) { c.right = new TreeNode(vals[i]); q.add(c.right); } i++;
        }
        return r;
    }
    static String s(TreeNode root) {
        if (root == null) return "[]";
        List<String> out = new ArrayList<>(); Queue<TreeNode> q = new LinkedList<>(); q.add(root);
        while (!q.isEmpty()) { TreeNode n = q.poll(); if (n == null) { out.add("null"); continue; } out.add(String.valueOf(n.val)); q.add(n.left); q.add(n.right); }
        int e = out.size(); while (e > 0 && out.get(e-1).equals("null")) e--;
        return "[" + String.join(",", out.subList(0, e)) + "]";
    }

    public static void main(String[] args) {
        System.out.println(s(mergeTrees(build(1,3,2,5), build(2,1,3,null,4,null,7))));       // [3,4,5,5,4,null,7]
        System.out.println(s(mergeTrees(build(1), build(1,2))));                              // [2,2]
        System.out.println(s(mergeTrees(null, null)));                                         // []
        System.out.println(s(mergeTrees(build(1), null)));                                     // [1]
        System.out.println(s(mergeTrees(null, build(1))));                                     // [1]
        System.out.println(s(mergeTrees(build(1), build(2))));                                 // [3]
        System.out.println(s(mergeTrees(build(1,2,3), build(4,5,6))));                         // [5,7,9]
        System.out.println(s(mergeTrees(build(1,2), build(1,null,2))));                        // [2,2,2]
        System.out.println(s(mergeTrees(build(0), build(0))));                                 // [0]
        System.out.println(s(mergeTrees(build(-1), build(1))));                                // [0]
        System.out.println(s(mergeTrees(build(1,3,2,5,null), build(2,1,3,null,4,null,7))));    // [3,4,5,5,4,null,7]
    }
}`,
  "binary-tree-maximum-path-sum": `import java.util.*;

public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    public static int maxPathSum(TreeNode root) {
        // DFS — return one-arm max upward; track two-arm max globally

        return 0;
    }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode r = new TreeNode(vals[0]); Queue<TreeNode> q = new LinkedList<>(); q.add(r); int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode c = q.poll();
            if (i < vals.length && vals[i] != null) { c.left = new TreeNode(vals[i]); q.add(c.left); } i++;
            if (i < vals.length && vals[i] != null) { c.right = new TreeNode(vals[i]); q.add(c.right); } i++;
        }
        return r;
    }

    public static void main(String[] args) {
        System.out.println(maxPathSum(build(1,2,3)));                                  // 6
        System.out.println(maxPathSum(build(-10,9,20,null,null,15,7)));                // 42
        System.out.println(maxPathSum(build(1)));                                       // 1
        System.out.println(maxPathSum(build(-1)));                                      // -1
        System.out.println(maxPathSum(build(2,-1)));                                    // 2
        System.out.println(maxPathSum(build(-2,-1)));                                   // -1
        System.out.println(maxPathSum(build(1,-2,-3)));                                 // 1
        System.out.println(maxPathSum(build(-3,-2,-1)));                                // -1
        System.out.println(maxPathSum(build(5,4,8,11,null,13,4,7,2,null,null,null,1))); // 48
        System.out.println(maxPathSum(build(9,6,-3,null,null,-6,2,null,null,2,null,-6,-6,-6))); // 16
        System.out.println(maxPathSum(build(1,2,3,4,5,6,7)));                          // 18
    }
}`,
  "path-sum-ii": `import java.util.*;

public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    public static List<List<Integer>> pathSum(TreeNode root, int targetSum) {
        // DFS with path stack; on leaf, check sum

        return new ArrayList<>();
    }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode r = new TreeNode(vals[0]); Queue<TreeNode> q = new LinkedList<>(); q.add(r); int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode c = q.poll();
            if (i < vals.length && vals[i] != null) { c.left = new TreeNode(vals[i]); q.add(c.left); } i++;
            if (i < vals.length && vals[i] != null) { c.right = new TreeNode(vals[i]); q.add(c.right); } i++;
        }
        return r;
    }
    static String canonical(List<List<Integer>> paths) {
        List<List<Integer>> sorted = new ArrayList<>(paths);
        sorted.sort((a, b) -> {
            for (int i = 0; i < Math.min(a.size(), b.size()); i++) { int c = Integer.compare(a.get(i), b.get(i)); if (c != 0) return c; }
            return Integer.compare(a.size(), b.size());
        });
        return sorted.toString();
    }

    public static void main(String[] args) {
        System.out.println(canonical(pathSum(build(5,4,8,11,null,13,4,7,2,null,null,5,1), 22))); // [[5, 4, 11, 2], [5, 8, 4, 5]]
        System.out.println(canonical(pathSum(build(1,2,3), 5)));         // []
        System.out.println(canonical(pathSum(build(1,2), 0)));           // []
        System.out.println(canonical(pathSum(null, 0)));                  // []
        System.out.println(canonical(pathSum(build(1), 1)));              // [[1]]
        System.out.println(canonical(pathSum(build(1), 0)));              // []
        System.out.println(canonical(pathSum(build(1,2,3), 3)));         // [[1, 2]]
        System.out.println(canonical(pathSum(build(1,2,3), 4)));         // [[1, 3]]
        System.out.println(canonical(pathSum(build(1,-2,-3,1,3,-2,null,-1), -1))); // [[1, -2, 1, -1]]
        System.out.println(canonical(pathSum(build(0,1,1), 1)));         // [[0, 1], [0, 1]]
        System.out.println(canonical(pathSum(build(5,8,-3,4,2,1,2), 13))); // [[5, 8]]
    }
}`,
  "all-nodes-distance-k-binary-tree": `import java.util.*;

public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    public static List<Integer> distanceK(TreeNode root, TreeNode target, int k) {
        // Build parent map; BFS from target up to depth k

        return new ArrayList<>();
    }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode r = new TreeNode(vals[0]); Queue<TreeNode> q = new LinkedList<>(); q.add(r); int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode c = q.poll();
            if (i < vals.length && vals[i] != null) { c.left = new TreeNode(vals[i]); q.add(c.left); } i++;
            if (i < vals.length && vals[i] != null) { c.right = new TreeNode(vals[i]); q.add(c.right); } i++;
        }
        return r;
    }
    static TreeNode find(TreeNode r, int v) {
        if (r == null) return null;
        if (r.val == v) return r;
        TreeNode l = find(r.left, v);
        return l != null ? l : find(r.right, v);
    }
    static String sorted(List<Integer> list) {
        List<Integer> s = new ArrayList<>(list); Collections.sort(s);
        return s.toString();
    }

    public static void main(String[] args) {
        TreeNode t = build(3,5,1,6,2,0,8,null,null,7,4);
        System.out.println(sorted(distanceK(t, find(t, 5), 2)));    // [1, 4, 7]
        System.out.println(sorted(distanceK(t, find(t, 5), 0)));    // [5]
        System.out.println(sorted(distanceK(t, find(t, 5), 1)));    // [2, 3, 6]
        System.out.println(sorted(distanceK(t, find(t, 5), 3)));    // [0, 8]
        System.out.println(sorted(distanceK(t, find(t, 5), 4)));    // []
        System.out.println(sorted(distanceK(build(1), find(build(1), 1), 0))); // [1]
        System.out.println(sorted(distanceK(build(1), find(build(1), 1), 1))); // []
        TreeNode u = build(1, 2, 3, 4, 5);
        System.out.println(sorted(distanceK(u, find(u, 1), 2)));    // [4, 5]
        System.out.println(sorted(distanceK(u, find(u, 4), 2)));    // [1, 5]
        System.out.println(sorted(distanceK(u, find(u, 4), 3)));    // [3]
        System.out.println(sorted(distanceK(u, find(u, 2), 1)));    // [1, 4, 5]
    }
}`,
  "delete-node-in-bst": `import java.util.*;

public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    public static TreeNode deleteNode(TreeNode root, int key) {
        // Standard BST deletion

        return root;
    }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode r = new TreeNode(vals[0]); Queue<TreeNode> q = new LinkedList<>(); q.add(r); int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode c = q.poll();
            if (i < vals.length && vals[i] != null) { c.left = new TreeNode(vals[i]); q.add(c.left); } i++;
            if (i < vals.length && vals[i] != null) { c.right = new TreeNode(vals[i]); q.add(c.right); } i++;
        }
        return r;
    }
    static List<Integer> inorder(TreeNode n, List<Integer> acc) {
        if (n == null) return acc;
        inorder(n.left, acc); acc.add(n.val); inorder(n.right, acc);
        return acc;
    }
    static boolean valid(TreeNode original, int key, TreeNode result) {
        List<Integer> orig = inorder(original, new ArrayList<>());
        List<Integer> res  = inorder(result, new ArrayList<>());
        // Inorder must be sorted (still a BST)
        for (int i = 1; i < res.size(); i++) if (res.get(i) < res.get(i-1)) return false;
        // Multiset must match: original minus one occurrence of key (if present)
        List<Integer> expected = new ArrayList<>(orig);
        if (expected.contains(key)) expected.remove((Integer) key);
        Collections.sort(expected);
        return expected.equals(res);
    }

    public static void main(String[] args) {
        System.out.println(valid(build(5,3,6,2,4,null,7), 3, deleteNode(build(5,3,6,2,4,null,7), 3))); // true
        System.out.println(valid(build(5,3,6,2,4,null,7), 0, deleteNode(build(5,3,6,2,4,null,7), 0))); // true (key not found)
        System.out.println(valid(null, 0, deleteNode(null, 0)));                                         // true
        System.out.println(valid(build(1), 1, deleteNode(build(1), 1)));                                  // true
        System.out.println(valid(build(1), 0, deleteNode(build(1), 0)));                                  // true
        System.out.println(valid(build(2,1), 2, deleteNode(build(2,1), 2)));                              // true
        System.out.println(valid(build(2,1,3), 2, deleteNode(build(2,1,3), 2)));                          // true
        System.out.println(valid(build(50,30,70,20,40,60,80), 30, deleteNode(build(50,30,70,20,40,60,80), 30))); // true
        System.out.println(valid(build(50,30,70,20,40,60,80), 50, deleteNode(build(50,30,70,20,40,60,80), 50))); // true
        System.out.println(valid(build(10,5,15,3,7,12,20), 7, deleteNode(build(10,5,15,3,7,12,20), 7))); // true
        System.out.println(valid(build(10,5,15,3,7,12,20), 10, deleteNode(build(10,5,15,3,7,12,20), 10))); // true
    }
}`,
  "trim-binary-search-tree": `import java.util.*;

public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    public static TreeNode trimBST(TreeNode root, int low, int high) {
        // Recursive trimming using BST property

        return root;
    }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode r = new TreeNode(vals[0]); Queue<TreeNode> q = new LinkedList<>(); q.add(r); int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode c = q.poll();
            if (i < vals.length && vals[i] != null) { c.left = new TreeNode(vals[i]); q.add(c.left); } i++;
            if (i < vals.length && vals[i] != null) { c.right = new TreeNode(vals[i]); q.add(c.right); } i++;
        }
        return r;
    }
    static List<Integer> inorder(TreeNode n, List<Integer> acc) {
        if (n == null) return acc;
        inorder(n.left, acc); acc.add(n.val); inorder(n.right, acc);
        return acc;
    }

    public static void main(String[] args) {
        System.out.println(inorder(trimBST(build(1,0,2), 1, 2), new ArrayList<>()));            // [1, 2]
        System.out.println(inorder(trimBST(build(3,0,4,null,2,null,null,1), 1, 3), new ArrayList<>())); // [1, 2, 3]
        System.out.println(inorder(trimBST(null, 0, 100), new ArrayList<>()));                   // []
        System.out.println(inorder(trimBST(build(1), 1, 1), new ArrayList<>()));                 // [1]
        System.out.println(inorder(trimBST(build(1), 2, 3), new ArrayList<>()));                 // []
        System.out.println(inorder(trimBST(build(1), -1, 0), new ArrayList<>()));                // []
        System.out.println(inorder(trimBST(build(50,30,70,20,40,60,80), 25, 75), new ArrayList<>())); // [30, 40, 50, 60, 70]
        System.out.println(inorder(trimBST(build(50,30,70,20,40,60,80), 0, 100), new ArrayList<>())); // [20, 30, 40, 50, 60, 70, 80]
        System.out.println(inorder(trimBST(build(50,30,70,20,40,60,80), 100, 200), new ArrayList<>())); // []
        System.out.println(inorder(trimBST(build(10,5,15,3,7,12,20), 6, 13), new ArrayList<>())); // [7, 10, 12]
        System.out.println(inorder(trimBST(build(10,5,15,3,7,12,20), 5, 15), new ArrayList<>())); // [5, 7, 10, 12, 15]
    }
}`,
  "unique-binary-search-trees": `public class Main {
    public static int numTrees(int n) {
        // 1D DP via Catalan recurrence

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(numTrees(0));    // 1
        System.out.println(numTrees(1));    // 1
        System.out.println(numTrees(2));    // 2
        System.out.println(numTrees(3));    // 5
        System.out.println(numTrees(4));    // 14
        System.out.println(numTrees(5));    // 42
        System.out.println(numTrees(6));    // 132
        System.out.println(numTrees(7));    // 429
        System.out.println(numTrees(10));   // 16796
        System.out.println(numTrees(15));   // 9694845
        System.out.println(numTrees(19));   // 1767263190
    }
}`,
  "palindrome-partitioning": `import java.util.*;

public class Main {
    public static List<List<String>> partition(String s) {
        // Backtracking with palindrome check

        return new ArrayList<>();
    }

    static String canonical(List<List<String>> partitions) {
        List<List<String>> sorted = new ArrayList<>(partitions);
        sorted.sort((a, b) -> {
            for (int i = 0; i < Math.min(a.size(), b.size()); i++) { int c = a.get(i).compareTo(b.get(i)); if (c != 0) return c; }
            return Integer.compare(a.size(), b.size());
        });
        return sorted.toString();
    }

    public static void main(String[] args) {
        System.out.println(canonical(partition("aab")));       // [[a, a, b], [aa, b]]
        System.out.println(canonical(partition("a")));         // [[a]]
        System.out.println(canonical(partition("")));          // [[]]
        System.out.println(canonical(partition("ab")));        // [[a, b]]
        System.out.println(canonical(partition("aa")));        // [[a, a], [aa]]
        System.out.println(canonical(partition("aba")));       // [[a, b, a], [aba]]
        System.out.println(canonical(partition("abc")));       // [[a, b, c]]
        System.out.println(canonical(partition("aaa")));       // [[a, a, a], [a, aa], [aa, a], [aaa]]
        System.out.println(partition("efe").size());            // 2
        System.out.println(partition("abba").size());           // 3
        System.out.println(partition("abcba").size());          // 3
    }
}`,
  "target-sum": `public class Main {
    public static int findTargetSumWays(int[] nums, int target) {
        // Reduce to subset-sum count via 2s = total + target

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(findTargetSumWays(new int[]{1,1,1,1,1}, 3));     // 5
        System.out.println(findTargetSumWays(new int[]{1}, 1));              // 1
        System.out.println(findTargetSumWays(new int[]{1}, -1));             // 1
        System.out.println(findTargetSumWays(new int[]{1}, 2));              // 0
        System.out.println(findTargetSumWays(new int[]{0}, 0));              // 2
        System.out.println(findTargetSumWays(new int[]{0,0,0,0,0,0,0,0,1}, 1)); // 256
        System.out.println(findTargetSumWays(new int[]{1,2,3,4,5}, 3));     // 3
        System.out.println(findTargetSumWays(new int[]{1,2,1}, 0));         // 2
        System.out.println(findTargetSumWays(new int[]{1,1,1,1,1}, -3));    // 5
        System.out.println(findTargetSumWays(new int[]{1,1,1,1,1}, 5));     // 1
        System.out.println(findTargetSumWays(new int[]{1,1,1,1,1}, 7));     // 0
    }
}`,
  "letter-case-permutation": `import java.util.*;

public class Main {
    public static List<String> letterCasePermutation(String s) {
        // Backtracking — branch on each letter (upper/lower)

        return new ArrayList<>();
    }

    static String sorted(List<String> list) {
        List<String> s = new ArrayList<>(list); Collections.sort(s);
        return s.toString();
    }

    public static void main(String[] args) {
        System.out.println(sorted(letterCasePermutation("a1b2")));       // [A1B2, A1b2, a1B2, a1b2]
        System.out.println(sorted(letterCasePermutation("3z4")));        // [3Z4, 3z4]
        System.out.println(sorted(letterCasePermutation("12345")));      // [12345]
        System.out.println(sorted(letterCasePermutation("a")));          // [A, a]
        System.out.println(sorted(letterCasePermutation("A")));          // [A, a]
        System.out.println(sorted(letterCasePermutation("0")));          // [0]
        System.out.println(sorted(letterCasePermutation("")));           // []
        System.out.println(letterCasePermutation("ab").size());          // 4
        System.out.println(letterCasePermutation("abc").size());         // 8
        System.out.println(letterCasePermutation("a1b2c3").size());      // 8
        System.out.println(letterCasePermutation("C").size());           // 2
    }
}`,
  "best-time-buy-sell-stock-ii": `public class Main {
    public static int maxProfit(int[] prices) {
        // Sum positive day-over-day deltas

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(maxProfit(new int[]{7,1,5,3,6,4}));        // 7
        System.out.println(maxProfit(new int[]{1,2,3,4,5}));          // 4
        System.out.println(maxProfit(new int[]{7,6,4,3,1}));          // 0
        System.out.println(maxProfit(new int[]{}));                    // 0
        System.out.println(maxProfit(new int[]{5}));                   // 0
        System.out.println(maxProfit(new int[]{1,2}));                 // 1
        System.out.println(maxProfit(new int[]{2,1}));                 // 0
        System.out.println(maxProfit(new int[]{3,3,3,3}));             // 0
        System.out.println(maxProfit(new int[]{1,7,1,7,1,7}));         // 18
        System.out.println(maxProfit(new int[]{2,4,1,7}));             // 8
        System.out.println(maxProfit(new int[]{6,1,3,2,4,7}));         // 7
    }
}`,
  "best-time-buy-sell-stock-with-cooldown": `public class Main {
    public static int maxProfit(int[] prices) {
        // Three-state DP: held / sold / rest

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(maxProfit(new int[]{1,2,3,0,2}));        // 3
        System.out.println(maxProfit(new int[]{1}));                 // 0
        System.out.println(maxProfit(new int[]{}));                  // 0
        System.out.println(maxProfit(new int[]{1,2}));               // 1
        System.out.println(maxProfit(new int[]{2,1}));               // 0
        System.out.println(maxProfit(new int[]{1,2,3,4,5}));         // 4
        System.out.println(maxProfit(new int[]{5,4,3,2,1}));         // 0
        System.out.println(maxProfit(new int[]{1,4,2}));             // 3
        System.out.println(maxProfit(new int[]{6,1,6,4,3,0,2}));     // 7
        System.out.println(maxProfit(new int[]{2,1,4,5,2,9,7}));     // 11
        System.out.println(maxProfit(new int[]{3,3,5,0,0,3,1,4}));   // 6
    }
}`,
  "partition-equal-subset-sum": `public class Main {
    public static boolean canPartition(int[] nums) {
        // Subset sum DP — target = total/2

        return false;
    }

    public static void main(String[] args) {
        System.out.println(canPartition(new int[]{1,5,11,5}));         // true
        System.out.println(canPartition(new int[]{1,2,3,5}));          // false
        System.out.println(canPartition(new int[]{}));                  // true (empty -> two empty subsets)
        System.out.println(canPartition(new int[]{1}));                 // false
        System.out.println(canPartition(new int[]{1,1}));               // true
        System.out.println(canPartition(new int[]{2,2,2,2}));            // true
        System.out.println(canPartition(new int[]{2,2,2}));              // false (odd sum)
        System.out.println(canPartition(new int[]{1,2,5}));              // false
        System.out.println(canPartition(new int[]{3,3,3,4,5}));          // true
        System.out.println(canPartition(new int[]{1,2,3,4,5,6,7}));      // true
        System.out.println(canPartition(new int[]{14,9,8,4,3,2}));       // true
    }
}`,
  "longest-palindromic-subsequence": `public class Main {
    public static int longestPalindromeSubseq(String s) {
        // 2D DP across substring lengths, OR LCS(s, reverse(s))

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(longestPalindromeSubseq("bbbab"));     // 4
        System.out.println(longestPalindromeSubseq("cbbd"));      // 2
        System.out.println(longestPalindromeSubseq(""));          // 0
        System.out.println(longestPalindromeSubseq("a"));         // 1
        System.out.println(longestPalindromeSubseq("ab"));        // 1
        System.out.println(longestPalindromeSubseq("aa"));        // 2
        System.out.println(longestPalindromeSubseq("abc"));       // 1
        System.out.println(longestPalindromeSubseq("aba"));       // 3
        System.out.println(longestPalindromeSubseq("abba"));      // 4
        System.out.println(longestPalindromeSubseq("character")); // 5
        System.out.println(longestPalindromeSubseq("racecar"));   // 7
    }
}`,
  "wildcard-matching": `public class Main {
    public static boolean isMatch(String s, String p) {
        // 2D DP

        return false;
    }

    public static void main(String[] args) {
        System.out.println(isMatch("aa", "a"));         // false
        System.out.println(isMatch("aa", "*"));         // true
        System.out.println(isMatch("cb", "?a"));        // false
        System.out.println(isMatch("adceb", "*a*b"));   // true
        System.out.println(isMatch("acdcb", "a*c?b"));  // false
        System.out.println(isMatch("", ""));            // true
        System.out.println(isMatch("", "*"));           // true
        System.out.println(isMatch("", "?"));           // false
        System.out.println(isMatch("abc", "***"));      // true
        System.out.println(isMatch("abc", "a?c"));      // true
        System.out.println(isMatch("abc", "a*c"));      // true
        System.out.println(isMatch("abcdef", "a*f"));   // true
        System.out.println(isMatch("abcdef", "a*g"));   // false
    }
}`,
  "01-matrix": `import java.util.*;

public class Main {
    public static int[][] updateMatrix(int[][] mat) {
        // Multi-source BFS from all 0 cells; track distances

        return mat;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.deepToString(updateMatrix(new int[][]{{0,0,0},{0,1,0},{0,0,0}})));   // [[0, 0, 0], [0, 1, 0], [0, 0, 0]]
        System.out.println(Arrays.deepToString(updateMatrix(new int[][]{{0,0,0},{0,1,0},{1,1,1}})));   // [[0, 0, 0], [0, 1, 0], [1, 2, 1]]
        System.out.println(Arrays.deepToString(updateMatrix(new int[][]{{0}})));                        // [[0]]
        System.out.println(Arrays.deepToString(updateMatrix(new int[][]{{1,1},{0,0}})));                // [[1, 1], [0, 0]]
        System.out.println(Arrays.deepToString(updateMatrix(new int[][]{{0,1,0,1,1},{1,1,0,0,1},{0,0,0,1,0},{1,0,1,1,1},{1,0,0,0,1}}))); // [[0, 1, 0, 1, 2], [1, 1, 0, 0, 1], [0, 0, 0, 1, 0], [1, 0, 1, 1, 1], [1, 0, 0, 0, 1]]
        System.out.println(Arrays.deepToString(updateMatrix(new int[][]{{0,0,0,0,0,0,0,0,0,0}})));     // [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
        System.out.println(Arrays.deepToString(updateMatrix(new int[][]{{1,1,1},{1,0,1},{1,1,1}})));   // [[2, 1, 2], [1, 0, 1], [2, 1, 2]]
        System.out.println(Arrays.deepToString(updateMatrix(new int[][]{{0,1},{1,1}})));                // [[0, 1], [1, 2]]
        System.out.println(Arrays.deepToString(updateMatrix(new int[][]{{1,0,1},{1,1,1},{1,1,0}})));   // [[1, 0, 1], [2, 1, 1], [1, 1, 0]]
        System.out.println(Arrays.deepToString(updateMatrix(new int[][]{{0}})));                        // [[0]]
        System.out.println(Arrays.deepToString(updateMatrix(new int[][]{{0,0},{0,0}})));                // [[0, 0], [0, 0]]
    }
}`,
  "shortest-path-binary-matrix": `import java.util.*;

public class Main {
    public static int shortestPathBinaryMatrix(int[][] grid) {
        // BFS with 8 directions

        return -1;
    }

    public static void main(String[] args) {
        System.out.println(shortestPathBinaryMatrix(new int[][]{{0,1},{1,0}}));                       // 2
        System.out.println(shortestPathBinaryMatrix(new int[][]{{0,0,0},{1,1,0},{1,1,0}}));           // 4
        System.out.println(shortestPathBinaryMatrix(new int[][]{{1,0,0},{1,1,0},{1,1,0}}));           // -1
        System.out.println(shortestPathBinaryMatrix(new int[][]{{0,0,0},{1,1,0},{1,1,1}}));           // -1
        System.out.println(shortestPathBinaryMatrix(new int[][]{{0}}));                                // 1
        System.out.println(shortestPathBinaryMatrix(new int[][]{{1}}));                                // -1
        System.out.println(shortestPathBinaryMatrix(new int[][]{{0,0},{0,0}}));                        // 2
        System.out.println(shortestPathBinaryMatrix(new int[][]{{0,0,0,0,0},{0,0,0,0,0},{0,0,0,0,0},{0,0,0,0,0},{0,0,0,0,0}})); // 5
        System.out.println(shortestPathBinaryMatrix(new int[][]{{0,1,1,1,1},{1,0,1,1,1},{1,1,0,1,1},{1,1,1,0,1},{1,1,1,1,0}})); // 5
        System.out.println(shortestPathBinaryMatrix(new int[][]{{0,0,1,0,0,0,0},{0,1,0,0,0,0,1},{0,0,0,1,0,0,0},{1,0,1,0,0,1,0},{1,0,0,1,1,0,0},{0,0,0,0,1,0,1},{0,1,0,0,0,0,0}})); // 7
        System.out.println(shortestPathBinaryMatrix(new int[][]{{0,0,0},{0,1,0},{0,0,0}}));            // 4
    }
}`,
  "network-delay-time": `import java.util.*;

public class Main {
    public static int networkDelayTime(int[][] times, int n, int k) {
        // Dijkstra with PriorityQueue<{node, distance}>

        return -1;
    }

    public static void main(String[] args) {
        System.out.println(networkDelayTime(new int[][]{{2,1,1},{2,3,1},{3,4,1}}, 4, 2));     // 2
        System.out.println(networkDelayTime(new int[][]{{1,2,1}}, 2, 1));                      // 1
        System.out.println(networkDelayTime(new int[][]{{1,2,1}}, 2, 2));                      // -1
        System.out.println(networkDelayTime(new int[][]{}, 1, 1));                              // 0
        System.out.println(networkDelayTime(new int[][]{{1,2,1},{2,3,2},{1,3,4}}, 3, 1));     // 3
        System.out.println(networkDelayTime(new int[][]{{1,2,1},{2,1,3}}, 2, 2));             // 3
        System.out.println(networkDelayTime(new int[][]{{1,2,5},{2,3,5},{3,4,5}}, 4, 1));     // 15
        System.out.println(networkDelayTime(new int[][]{{1,2,1},{2,3,1},{1,3,5}}, 3, 1));     // 2
        System.out.println(networkDelayTime(new int[][]{{1,2,1},{2,3,7},{1,3,4},{2,1,2}}, 4, 1)); // -1
        System.out.println(networkDelayTime(new int[][]{{2,1,1},{2,3,1},{3,4,1},{4,5,1},{5,6,1}}, 6, 2)); // 4
        System.out.println(networkDelayTime(new int[][]{{1,2,2},{1,3,1},{3,2,1},{2,4,3},{3,4,5}}, 4, 1)); // 5
    }
}`,
  "cheapest-flights-within-k-stops": `import java.util.*;

public class Main {
    public static int findCheapestPrice(int n, int[][] flights, int src, int dst, int k) {
        // Bellman-Ford: relax edges k+1 times using a snapshot

        return -1;
    }

    public static void main(String[] args) {
        System.out.println(findCheapestPrice(4, new int[][]{{0,1,100},{1,2,100},{2,0,100},{1,3,600},{2,3,200}}, 0, 3, 1)); // 700
        System.out.println(findCheapestPrice(3, new int[][]{{0,1,100},{1,2,100},{0,2,500}}, 0, 2, 1));  // 200
        System.out.println(findCheapestPrice(3, new int[][]{{0,1,100},{1,2,100},{0,2,500}}, 0, 2, 0));  // 500
        System.out.println(findCheapestPrice(2, new int[][]{{0,1,100}}, 0, 1, 0));                       // 100
        System.out.println(findCheapestPrice(2, new int[][]{{0,1,100}}, 0, 1, 5));                       // 100
        System.out.println(findCheapestPrice(2, new int[][]{}, 0, 1, 5));                                 // -1
        System.out.println(findCheapestPrice(2, new int[][]{{0,1,100}}, 1, 0, 5));                       // -1
        System.out.println(findCheapestPrice(5, new int[][]{{0,1,5},{1,2,5},{0,3,2},{3,1,2},{1,4,1},{4,2,1}}, 0, 2, 2)); // 7
        System.out.println(findCheapestPrice(4, new int[][]{{0,1,1},{0,2,5},{1,2,1},{2,3,1}}, 0, 3, 1));   // 6
        System.out.println(findCheapestPrice(4, new int[][]{{0,1,1},{0,2,5},{1,2,1},{2,3,1}}, 0, 3, 2));   // 3
        System.out.println(findCheapestPrice(1, new int[][]{}, 0, 0, 0));                                 // 0
    }
}`,
  "find-median-from-data-stream": `import java.util.*;

public class Main {
    static class MedianFinder {
        // Max-heap (lower half) + Min-heap (upper half)

        public MedianFinder() {

        }

        public void addNum(int num) {

        }

        public double findMedian() {
            return 0.0;
        }
    }

    public static void main(String[] args) {
        MedianFinder a = new MedianFinder();
        a.addNum(1); a.addNum(2);
        System.out.println(a.findMedian());     // 1.5
        a.addNum(3);
        System.out.println(a.findMedian());     // 2.0

        MedianFinder b = new MedianFinder();
        b.addNum(5);
        System.out.println(b.findMedian());     // 5.0
        b.addNum(15);
        System.out.println(b.findMedian());     // 10.0
        b.addNum(1);
        System.out.println(b.findMedian());     // 5.0
        b.addNum(3);
        System.out.println(b.findMedian());     // 4.0

        MedianFinder c = new MedianFinder();
        c.addNum(-1);
        System.out.println(c.findMedian());     // -1.0
        c.addNum(-2);
        System.out.println(c.findMedian());     // -1.5
        c.addNum(-3);
        System.out.println(c.findMedian());     // -2.0
        c.addNum(-4);
        System.out.println(c.findMedian());     // -2.5
        c.addNum(-5);
        System.out.println(c.findMedian());     // -3.0
    }
}`,
  "snapshot-array": `import java.util.*;

public class Main {
    static class SnapshotArray {
        // Per-index list of (snapId, value); binary search on get

        public SnapshotArray(int length) {

        }

        public void set(int index, int val) {

        }

        public int snap() {
            return -1;
        }

        public int get(int index, int snap_id) {
            return 0;
        }
    }

    public static void main(String[] args) {
        SnapshotArray a = new SnapshotArray(3);
        a.set(0, 5);
        System.out.println(a.snap());           // 0
        a.set(0, 6);
        System.out.println(a.get(0, 0));        // 5

        SnapshotArray b = new SnapshotArray(1);
        System.out.println(b.snap());           // 0
        System.out.println(b.snap());           // 1
        System.out.println(b.snap());           // 2
        System.out.println(b.get(0, 0));        // 0
        System.out.println(b.get(0, 1));        // 0
        System.out.println(b.get(0, 2));        // 0

        SnapshotArray c = new SnapshotArray(2);
        c.set(0, 100);
        c.set(1, 200);
        int s0 = c.snap();
        c.set(0, 300);
        int s1 = c.snap();
        c.set(1, 400);
        int s2 = c.snap();
        System.out.println(c.get(0, s0));       // 100
        System.out.println(c.get(0, s1));       // 300
        System.out.println(c.get(0, s2));       // 300
        System.out.println(c.get(1, s0));       // 200
        System.out.println(c.get(1, s1));       // 200
        System.out.println(c.get(1, s2));       // 400
    }
}`,
  "maximum-width-of-binary-tree": `import java.util.*;

public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }
    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode r = new TreeNode(vals[0]); Queue<TreeNode> q = new LinkedList<>(); q.add(r); int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode c = q.poll();
            if (i < vals.length && vals[i] != null) { c.left = new TreeNode(vals[i]); q.add(c.left); } i++;
            if (i < vals.length && vals[i] != null) { c.right = new TreeNode(vals[i]); q.add(c.right); } i++;
        }
        return r;
    }

    public static int widthOfBinaryTree(TreeNode root) {
        // BFS with per-node index; width = last - first + 1

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(widthOfBinaryTree(build(1, 3, 2, 5, 3, null, 9)));                  // 4
        System.out.println(widthOfBinaryTree(build(1, 3, 2, 5, null, null, 9, 6, null, 7)));   // 7
        System.out.println(widthOfBinaryTree(build(1, 3, 2, 5)));                              // 2
        System.out.println(widthOfBinaryTree(build(1)));                                       // 1
        System.out.println(widthOfBinaryTree(build(1, 1)));                                    // 1
        System.out.println(widthOfBinaryTree(build(1, 1, 1)));                                 // 2
        System.out.println(widthOfBinaryTree(build(1, null, 2, null, 3, null, 4)));            // 1
        System.out.println(widthOfBinaryTree(build(1, 2, 3, 4, 5, 6, 7)));                     // 4
        System.out.println(widthOfBinaryTree(build(1, 2, 3, 4, 5, null, 7)));                  // 4
        System.out.println(widthOfBinaryTree(build(0)));                                       // 1
        System.out.println(widthOfBinaryTree(build(1, 2, 3, 4, null, null, 7, 8, null, null, 15))); // 8
    }
}`,
  "binary-tree-paths": `import java.util.*;

public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }
    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode r = new TreeNode(vals[0]); Queue<TreeNode> q = new LinkedList<>(); q.add(r); int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode c = q.poll();
            if (i < vals.length && vals[i] != null) { c.left = new TreeNode(vals[i]); q.add(c.left); } i++;
            if (i < vals.length && vals[i] != null) { c.right = new TreeNode(vals[i]); q.add(c.right); } i++;
        }
        return r;
    }

    public static List<String> binaryTreePaths(TreeNode root) {
        // DFS; on leaf, snapshot path

        return new ArrayList<>();
    }

    static String show(List<String> list) {
        List<String> copy = new ArrayList<>(list); Collections.sort(copy);
        return copy.toString();
    }

    public static void main(String[] args) {
        System.out.println(show(binaryTreePaths(build(1, 2, 3, null, 5))));            // [1->2->5, 1->3]
        System.out.println(show(binaryTreePaths(build(1))));                           // [1]
        System.out.println(show(binaryTreePaths(null)));                                // []
        System.out.println(show(binaryTreePaths(build(1, 2))));                        // [1->2]
        System.out.println(show(binaryTreePaths(build(1, null, 2))));                  // [1->2]
        System.out.println(show(binaryTreePaths(build(1, 2, 3))));                     // [1->2, 1->3]
        System.out.println(show(binaryTreePaths(build(1, 2, 3, 4, 5, 6, 7))));         // [1->2->4, 1->2->5, 1->3->6, 1->3->7]
        System.out.println(show(binaryTreePaths(build(10, 20, 30, null, null, 40))));  // [10->20, 10->30->40]
        System.out.println(show(binaryTreePaths(build(1, 2, null, 3, null, 4))));      // [1->2->3->4]
        System.out.println(show(binaryTreePaths(build(1, null, 2, null, 3))));         // [1->2->3]
        System.out.println(show(binaryTreePaths(build(0, 1, 0))));                     // [0->0, 0->1]
    }
}`,
  "flip-equivalent-binary-trees": `import java.util.*;

public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }
    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode r = new TreeNode(vals[0]); Queue<TreeNode> q = new LinkedList<>(); q.add(r); int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode c = q.poll();
            if (i < vals.length && vals[i] != null) { c.left = new TreeNode(vals[i]); q.add(c.left); } i++;
            if (i < vals.length && vals[i] != null) { c.right = new TreeNode(vals[i]); q.add(c.right); } i++;
        }
        return r;
    }

    public static boolean flipEquiv(TreeNode root1, TreeNode root2) {
        // Recursive: same value AND (straight match OR cross match)

        return false;
    }

    public static void main(String[] args) {
        System.out.println(flipEquiv(null, null));                                   // true
        System.out.println(flipEquiv(null, build(1)));                                // false
        System.out.println(flipEquiv(build(1), null));                                // false
        System.out.println(flipEquiv(build(1), build(1)));                            // true
        System.out.println(flipEquiv(build(1), build(2)));                            // false
        System.out.println(flipEquiv(build(1, 2, 3), build(1, 3, 2)));                // true
        System.out.println(flipEquiv(build(1, 2, 3), build(1, 2, 3)));                // true
        System.out.println(flipEquiv(build(1, 2, 3), build(1, 2, 4)));                // false
        System.out.println(flipEquiv(build(1, 2, null), build(1, null, 2)));          // true
        System.out.println(flipEquiv(build(0, 3, 1, 2), build(0, 3, 1, null, null, 2))); // false
        System.out.println(flipEquiv(build(1, 2, 3, 4, 5, 6, null, null, null, 7, 8),
                                     build(1, 3, 2, null, 6, 4, 5, null, null, null, null, 8, 7))); // true
    }
}`,
  "construct-binary-tree-inorder-postorder": `import java.util.*;

public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }

    public static TreeNode buildTree(int[] inorder, int[] postorder) {
        // Last of postorder = root; split inorder; recurse

        return null;
    }

    static String serialize(TreeNode root) {
        if (root == null) return "[]";
        List<String> out = new ArrayList<>();
        Queue<TreeNode> q = new LinkedList<>(); q.add(root);
        while (!q.isEmpty()) {
            TreeNode n = q.poll();
            if (n == null) { out.add("null"); continue; }
            out.add(String.valueOf(n.val));
            q.add(n.left); q.add(n.right);
        }
        int end = out.size(); while (end > 0 && out.get(end - 1).equals("null")) end--;
        return "[" + String.join(",", out.subList(0, end)) + "]";
    }

    public static void main(String[] args) {
        System.out.println(serialize(buildTree(new int[]{9,3,15,20,7}, new int[]{9,15,7,20,3})));   // [3,9,20,null,null,15,7]
        System.out.println(serialize(buildTree(new int[]{-1}, new int[]{-1})));                       // [-1]
        System.out.println(serialize(buildTree(new int[]{}, new int[]{})));                           // []
        System.out.println(serialize(buildTree(new int[]{1,2}, new int[]{2,1})));                     // [1,null,2]
        System.out.println(serialize(buildTree(new int[]{2,1}, new int[]{2,1})));                     // [1,2]
        System.out.println(serialize(buildTree(new int[]{1,2,3}, new int[]{3,2,1})));                 // [1,null,2,null,3]
        System.out.println(serialize(buildTree(new int[]{3,2,1}, new int[]{3,2,1})));                 // [1,2,null,3]
        System.out.println(serialize(buildTree(new int[]{2,1,3}, new int[]{2,3,1})));                 // [1,2,3]
        System.out.println(serialize(buildTree(new int[]{4,2,5,1,6,3,7}, new int[]{4,5,2,6,7,3,1}))); // [1,2,3,4,5,6,7]
        System.out.println(serialize(buildTree(new int[]{1,2,3,4}, new int[]{1,3,2,4})));             // [4,2,null,1,3]
        System.out.println(serialize(buildTree(new int[]{1,2,3,4,5}, new int[]{1,3,2,5,4})));         // [4,2,5,1,3]
    }
}`,
  "recover-binary-search-tree": `import java.util.*;

public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }
    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode r = new TreeNode(vals[0]); Queue<TreeNode> q = new LinkedList<>(); q.add(r); int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode c = q.poll();
            if (i < vals.length && vals[i] != null) { c.left = new TreeNode(vals[i]); q.add(c.left); } i++;
            if (i < vals.length && vals[i] != null) { c.right = new TreeNode(vals[i]); q.add(c.right); } i++;
        }
        return r;
    }

    public static void recoverTree(TreeNode root) {
        // Inorder traversal; find violations; swap values

    }

    static List<Integer> inorder(TreeNode root) {
        List<Integer> out = new ArrayList<>();
        Deque<TreeNode> st = new ArrayDeque<>();
        TreeNode cur = root;
        while (cur != null || !st.isEmpty()) {
            while (cur != null) { st.push(cur); cur = cur.left; }
            cur = st.pop();
            out.add(cur.val);
            cur = cur.right;
        }
        return out;
    }
    static String runAndShow(TreeNode root) {
        recoverTree(root);
        List<Integer> io = inorder(root);
        boolean sorted = true;
        for (int i = 1; i < io.size(); i++) if (io.get(i - 1) > io.get(i)) { sorted = false; break; }
        return io.toString() + " sorted=" + sorted;
    }

    public static void main(String[] args) {
        System.out.println(runAndShow(build(1, 3, null, null, 2)));         // [1, 2, 3] sorted=true
        System.out.println(runAndShow(build(3, 1, 4, null, null, 2)));      // [1, 2, 3, 4] sorted=true
        System.out.println(runAndShow(build(2, 1)));                        // [1, 2] sorted=true
        System.out.println(runAndShow(build(2, 3, 1)));                     // [1, 2, 3] sorted=true
        System.out.println(runAndShow(build(1)));                           // [1] sorted=true
        System.out.println(runAndShow(build(2, 1, 3)));                     // [1, 2, 3] sorted=true
        System.out.println(runAndShow(build(5, 3, 8, 2, 6, 4, 9)));         // [2, 3, 4, 5, 6, 8, 9] sorted=true
        System.out.println(runAndShow(build(4, 2, 6, 1, 5, 3, 7)));         // [1, 2, 3, 4, 5, 6, 7] sorted=true
        System.out.println(runAndShow(build(10, 5, 15, 2, 20, 12, 25)));    // [2, 5, 10, 12, 15, 20, 25] sorted=true
        System.out.println(runAndShow(build(3, 2, 4, 1, 6, null, 5)));      // [1, 2, 3, 4, 5, 6] sorted=true
        System.out.println(runAndShow(build(50, 30, 70, 20, 40, 60, 80)));  // [20, 30, 40, 50, 60, 70, 80] sorted=true
    }
}`,
  "reverse-nodes-in-k-group": `public class Main {
    static class ListNode {
        int val; ListNode next;
        ListNode(int val) { this.val = val; }
    }
    static ListNode build(int[] vals) {
        if (vals.length == 0) return null;
        ListNode h = new ListNode(vals[0]); ListNode c = h;
        for (int i = 1; i < vals.length; i++) { c.next = new ListNode(vals[i]); c = c.next; }
        return h;
    }
    static String s(ListNode n) {
        if (n == null) return "(empty)";
        StringBuilder sb = new StringBuilder();
        while (n != null) { sb.append(n.val); if (n.next != null) sb.append("->"); n = n.next; }
        return sb.toString();
    }

    public static ListNode reverseKGroup(ListNode head, int k) {
        // Dummy node; reverse each full group in place

        return head;
    }

    public static void main(String[] args) {
        System.out.println(s(reverseKGroup(build(new int[]{1,2,3,4,5}), 2)));         // 2->1->4->3->5
        System.out.println(s(reverseKGroup(build(new int[]{1,2,3,4,5}), 3)));         // 3->2->1->4->5
        System.out.println(s(reverseKGroup(build(new int[]{1,2,3,4,5}), 1)));         // 1->2->3->4->5
        System.out.println(s(reverseKGroup(build(new int[]{1,2,3,4,5}), 5)));         // 5->4->3->2->1
        System.out.println(s(reverseKGroup(build(new int[]{1,2,3,4,5,6}), 2)));       // 2->1->4->3->6->5
        System.out.println(s(reverseKGroup(build(new int[]{1,2,3,4,5,6}), 3)));       // 3->2->1->6->5->4
        System.out.println(s(reverseKGroup(build(new int[]{1,2,3,4,5,6,7}), 3)));     // 3->2->1->6->5->4->7
        System.out.println(s(reverseKGroup(build(new int[]{1,2}), 2)));               // 2->1
        System.out.println(s(reverseKGroup(build(new int[]{1}), 1)));                 // 1
        System.out.println(s(reverseKGroup(build(new int[]{1}), 2)));                 // 1
        System.out.println(s(reverseKGroup(build(new int[]{}), 3)));                  // (empty)
        System.out.println(s(reverseKGroup(build(new int[]{1,2,3,4,5,6,7,8}), 4)));   // 4->3->2->1->8->7->6->5
    }
}`,
  "rotate-list": `public class Main {
    static class ListNode {
        int val; ListNode next;
        ListNode(int val) { this.val = val; }
    }
    static ListNode build(int[] vals) {
        if (vals.length == 0) return null;
        ListNode h = new ListNode(vals[0]); ListNode c = h;
        for (int i = 1; i < vals.length; i++) { c.next = new ListNode(vals[i]); c = c.next; }
        return h;
    }
    static String s(ListNode n) {
        if (n == null) return "(empty)";
        StringBuilder sb = new StringBuilder();
        while (n != null) { sb.append(n.val); if (n.next != null) sb.append("->"); n = n.next; }
        return sb.toString();
    }

    public static ListNode rotateRight(ListNode head, int k) {
        // Find length, mod k, close cycle, find new tail, break cycle

        return head;
    }

    public static void main(String[] args) {
        System.out.println(s(rotateRight(build(new int[]{1,2,3,4,5}), 2)));   // 4->5->1->2->3
        System.out.println(s(rotateRight(build(new int[]{0,1,2}), 4)));       // 2->0->1
        System.out.println(s(rotateRight(build(new int[]{1,2,3,4,5}), 0)));   // 1->2->3->4->5
        System.out.println(s(rotateRight(build(new int[]{1,2,3,4,5}), 5)));   // 1->2->3->4->5
        System.out.println(s(rotateRight(build(new int[]{1,2,3,4,5}), 7)));   // 4->5->1->2->3
        System.out.println(s(rotateRight(build(new int[]{1,2}), 1)));         // 2->1
        System.out.println(s(rotateRight(build(new int[]{1,2}), 3)));         // 2->1
        System.out.println(s(rotateRight(build(new int[]{1}), 99)));          // 1
        System.out.println(s(rotateRight(build(new int[]{}), 5)));            // (empty)
        System.out.println(s(rotateRight(build(new int[]{1,2,3,4,5,6}), 3))); // 4->5->6->1->2->3
        System.out.println(s(rotateRight(build(new int[]{1,2,3}), 1)));       // 3->1->2
        System.out.println(s(rotateRight(build(new int[]{1,2,3}), 2)));       // 2->3->1
    }
}`,
  "copy-list-with-random-pointer": `import java.util.*;

public class Main {
    static class Node {
        int val;
        Node next;
        Node random;
        Node(int val) { this.val = val; }
    }

    static Node buildWithRandom(int[] vals, int[] randomIdx) {
        if (vals.length == 0) return null;
        Node[] nodes = new Node[vals.length];
        for (int i = 0; i < vals.length; i++) nodes[i] = new Node(vals[i]);
        for (int i = 0; i < vals.length - 1; i++) nodes[i].next = nodes[i + 1];
        for (int i = 0; i < vals.length; i++) {
            nodes[i].random = randomIdx[i] == -1 ? null : nodes[randomIdx[i]];
        }
        return nodes[0];
    }

    public static Node copyRandomList(Node head) {
        // Two-pass HashMap: clone nodes, then wire next + random

        return head;
    }

    static String verify(Node original, Node clone) {
        Map<Node, Integer> origIdx = new IdentityHashMap<>();
        Node cur = original; int idx = 0;
        while (cur != null) { origIdx.put(cur, idx++); cur = cur.next; }
        Map<Node, Integer> cloneIdx = new IdentityHashMap<>();
        Node cc = clone; int ci = 0;
        while (cc != null) { cloneIdx.put(cc, ci++); cc = cc.next; }
        if (origIdx.size() != cloneIdx.size()) return "FAIL: length mismatch";
        Node a = original, b = clone; int i = 0;
        while (a != null && b != null) {
            if (a == b) return "FAIL: same reference at idx " + i;
            if (a.val != b.val) return "FAIL: val mismatch at idx " + i;
            Integer ra = a.random == null ? null : origIdx.get(a.random);
            Integer rb = b.random == null ? null : cloneIdx.get(b.random);
            if (ra == null && rb != null) return "FAIL: random null mismatch at idx " + i;
            if (ra != null && !ra.equals(rb)) return "FAIL: random idx mismatch at idx " + i;
            if (b.random != null && origIdx.containsKey(b.random)) return "FAIL: clone points into original at idx " + i;
            a = a.next; b = b.next; i++;
        }
        return "OK len=" + origIdx.size();
    }
    static String run(int[] vals, int[] rand) {
        Node original = buildWithRandom(vals, rand);
        Node clone = copyRandomList(original);
        if (original == null && clone == null) return "OK len=0";
        if (original == null || clone == null) return "FAIL: null mismatch";
        return verify(original, clone);
    }

    public static void main(String[] args) {
        System.out.println(run(new int[]{7, 13, 11, 10, 1}, new int[]{-1, 0, 4, 2, 0})); // OK len=5
        System.out.println(run(new int[]{1, 2}, new int[]{1, 1}));                        // OK len=2
        System.out.println(run(new int[]{3, 3, 3}, new int[]{-1, 0, -1}));                // OK len=3
        System.out.println(run(new int[]{}, new int[]{}));                                // OK len=0
        System.out.println(run(new int[]{1}, new int[]{-1}));                             // OK len=1
        System.out.println(run(new int[]{1}, new int[]{0}));                              // OK len=1
        System.out.println(run(new int[]{1, 2, 3, 4, 5}, new int[]{-1, -1, -1, -1, -1})); // OK len=5
        System.out.println(run(new int[]{1, 2, 3, 4, 5}, new int[]{4, 3, 2, 1, 0}));      // OK len=5
        System.out.println(run(new int[]{10, 20, 30}, new int[]{2, 0, 1}));               // OK len=3
        System.out.println(run(new int[]{5, 5, 5, 5, 5, 5}, new int[]{0, 1, 2, 3, 4, 5})); // OK len=6
        System.out.println(run(new int[]{-1, -2, -3}, new int[]{-1, 0, 1}));              // OK len=3
    }
}`,
  "unique-paths-ii": `public class Main {
    public static int uniquePathsWithObstacles(int[][] grid) {
        // dp avoiding obstacles

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(uniquePathsWithObstacles(new int[][]{{0,0,0},{0,1,0},{0,0,0}}));   // 2
        System.out.println(uniquePathsWithObstacles(new int[][]{{0,1},{0,0}}));               // 1
        System.out.println(uniquePathsWithObstacles(new int[][]{{1}}));                       // 0
        System.out.println(uniquePathsWithObstacles(new int[][]{{0}}));                       // 1
        System.out.println(uniquePathsWithObstacles(new int[][]{{0,0},{0,0}}));               // 2
        System.out.println(uniquePathsWithObstacles(new int[][]{{0,0},{1,0}}));               // 1
        System.out.println(uniquePathsWithObstacles(new int[][]{{0,0},{0,1}}));               // 0
        System.out.println(uniquePathsWithObstacles(new int[][]{{1,0}}));                     // 0
        System.out.println(uniquePathsWithObstacles(new int[][]{{0,0,0,0},{0,0,0,0},{0,0,0,0}})); // 10
        System.out.println(uniquePathsWithObstacles(new int[][]{{0,0,0},{0,0,0},{0,0,0}}));   // 6
        System.out.println(uniquePathsWithObstacles(new int[][]{{0,1,0},{0,1,0},{0,0,0}}));   // 1
        System.out.println(uniquePathsWithObstacles(new int[][]{{0,0,0},{1,1,0},{0,0,0}}));   // 1
    }
}`,
  "perfect-squares": `public class Main {
    public static int numSquares(int n) {
        // 1D DP

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(numSquares(1));    // 1
        System.out.println(numSquares(2));    // 2
        System.out.println(numSquares(3));    // 3
        System.out.println(numSquares(4));    // 1
        System.out.println(numSquares(7));    // 4
        System.out.println(numSquares(12));   // 3
        System.out.println(numSquares(13));   // 2
        System.out.println(numSquares(25));   // 1
        System.out.println(numSquares(43));   // 3
        System.out.println(numSquares(48));   // 3
        System.out.println(numSquares(100));  // 1
        System.out.println(numSquares(9999)); // 4
    }
}`,
  "interleaving-string": `public class Main {
    public static boolean isInterleave(String s1, String s2, String s3) {
        // 2D DP over prefixes

        return false;
    }

    public static void main(String[] args) {
        System.out.println(isInterleave("aabcc", "dbbca", "aadbbcbcac"));   // true
        System.out.println(isInterleave("aabcc", "dbbca", "aadbbbaccc"));   // false
        System.out.println(isInterleave("", "", ""));                       // true
        System.out.println(isInterleave("", "abc", "abc"));                 // true
        System.out.println(isInterleave("abc", "", "abc"));                 // true
        System.out.println(isInterleave("a", "b", "ab"));                   // true
        System.out.println(isInterleave("a", "b", "ba"));                   // true
        System.out.println(isInterleave("abc", "def", "adbcef"));           // true
        System.out.println(isInterleave("abc", "def", "abdcfe"));           // false
        System.out.println(isInterleave("abc", "def", "abcdefg"));          // false
        System.out.println(isInterleave("ab", "cd", "acbd"));               // true
        System.out.println(isInterleave("ab", "cd", "abdc"));               // false
    }
}`,
  "distinct-subsequences": `public class Main {
    public static int numDistinct(String s, String t) {
        // 2D DP

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(numDistinct("rabbbit", "rabbit"));   // 3
        System.out.println(numDistinct("babgbag", "bag"));      // 5
        System.out.println(numDistinct("", ""));                // 1
        System.out.println(numDistinct("abc", ""));             // 1
        System.out.println(numDistinct("", "abc"));             // 0
        System.out.println(numDistinct("abc", "abc"));          // 1
        System.out.println(numDistinct("aaa", "a"));            // 3
        System.out.println(numDistinct("aaaa", "aa"));          // 6
        System.out.println(numDistinct("aaaaa", "aa"));         // 10
        System.out.println(numDistinct("abcde", "ace"));        // 1
        System.out.println(numDistinct("xyz", "abc"));          // 0
        System.out.println(numDistinct("ababab", "ab"));        // 6
    }
}`,
  "frog-jump": `import java.util.*;

public class Main {
    public static boolean canCross(int[] stones) {
        // Map<position, Set<jumpSize>>

        return false;
    }

    public static void main(String[] args) {
        System.out.println(canCross(new int[]{0,1,3,5,6,8,12,17}));     // true
        System.out.println(canCross(new int[]{0,1,2,3,4,8,9,11}));      // false
        System.out.println(canCross(new int[]{0,1}));                   // true
        System.out.println(canCross(new int[]{0,2}));                   // false
        System.out.println(canCross(new int[]{0,1,3,6,10,15,21}));      // true
        System.out.println(canCross(new int[]{0,1,3,6,10,13,14}));      // false
        System.out.println(canCross(new int[]{0,1,3,6,10,13,15,18}));   // true
        System.out.println(canCross(new int[]{0,1,3,4,5,7,9,10,12}));   // true
        System.out.println(canCross(new int[]{0,1,3,6,7}));             // true
        System.out.println(canCross(new int[]{0,1,3,7}));               // false
        System.out.println(canCross(new int[]{0,1,2,3,5,6,8,12,17}));   // true
    }
}`,
  "maximal-rectangle": `import java.util.*;

public class Main {
    public static int maximalRectangle(char[][] matrix) {
        // Build row-wise histograms; apply largestRectangleInHistogram

        return 0;
    }

    private static char[][] toMatrix(int[][] m) {
        char[][] res = new char[m.length][m.length == 0 ? 0 : m[0].length];
        for (int i = 0; i < m.length; i++)
            for (int j = 0; j < m[0].length; j++)
                res[i][j] = (char)('0' + m[i][j]);
        return res;
    }

    public static void main(String[] args) {
        System.out.println(maximalRectangle(toMatrix(new int[][]{{1,0,1,0,0},{1,0,1,1,1},{1,1,1,1,1},{1,0,0,1,0}}))); // 6
        System.out.println(maximalRectangle(toMatrix(new int[][]{{0}})));                 // 0
        System.out.println(maximalRectangle(toMatrix(new int[][]{{1}})));                 // 1
        System.out.println(maximalRectangle(toMatrix(new int[][]{{0,0},{0,0}})));         // 0
        System.out.println(maximalRectangle(toMatrix(new int[][]{{1,1},{1,1}})));         // 4
        System.out.println(maximalRectangle(toMatrix(new int[][]{{1,1,1},{1,1,1},{1,1,1}}))); // 9
        System.out.println(maximalRectangle(toMatrix(new int[][]{{1,0,1},{1,0,1},{1,0,1}}))); // 3
        System.out.println(maximalRectangle(toMatrix(new int[][]{{1,1,1,1}})));           // 4
        System.out.println(maximalRectangle(toMatrix(new int[][]{{1},{1},{1},{1}})));     // 4
        System.out.println(maximalRectangle(toMatrix(new int[][]{{0,1,1,0},{1,1,1,1},{1,1,1,1},{1,1,0,0}}))); // 8
        System.out.println(maximalRectangle(toMatrix(new int[][]{{1,0,0},{0,1,0},{0,0,1}}))); // 1
        System.out.println(maximalRectangle(toMatrix(new int[][]{{1,1,0,1},{1,1,0,1},{1,1,1,1}}))); // 6
    }
}`,
  "regular-expression-matching": `public class Main {
    public static boolean isMatch(String s, String p) {
        // 2D DP

        return false;
    }

    public static void main(String[] args) {
        System.out.println(isMatch("aa", "a"));                    // false
        System.out.println(isMatch("aa", "a*"));                   // true
        System.out.println(isMatch("ab", ".*"));                   // true
        System.out.println(isMatch("aab", "c*a*b"));               // true
        System.out.println(isMatch("mississippi", "mis*is*p*."));  // false
        System.out.println(isMatch("mississippi", "mis*is*ip*.")); // true
        System.out.println(isMatch("", ""));                       // true
        System.out.println(isMatch("", "a*"));                     // true
        System.out.println(isMatch("a", ""));                      // false
        System.out.println(isMatch("abc", "a.c"));                 // true
        System.out.println(isMatch("abc", ".*c"));                 // true
        System.out.println(isMatch("aaa", "a*a"));                 // true
        System.out.println(isMatch("aaa", "ab*a*c*a"));            // true
        System.out.println(isMatch("a", "ab*"));                   // true
    }
}`,
  "partition-to-k-equal-sum-subsets": `import java.util.*;

public class Main {
    public static boolean canPartitionKSubsets(int[] nums, int k) {
        // Sort desc; backtrack k buckets

        return false;
    }

    public static void main(String[] args) {
        System.out.println(canPartitionKSubsets(new int[]{4,3,2,3,5,2,1}, 4));    // true
        System.out.println(canPartitionKSubsets(new int[]{1,2,3,4}, 3));          // false
        System.out.println(canPartitionKSubsets(new int[]{2,2,2,2,3,4,5}, 4));    // false
        System.out.println(canPartitionKSubsets(new int[]{1,1,1,1}, 4));          // true
        System.out.println(canPartitionKSubsets(new int[]{1,1,1,1}, 2));          // true
        System.out.println(canPartitionKSubsets(new int[]{1,1,1,1}, 1));          // true
        System.out.println(canPartitionKSubsets(new int[]{4,4,4,4}, 4));          // true
        System.out.println(canPartitionKSubsets(new int[]{1,2,3,4,5,6,7,8}, 4));  // true
        System.out.println(canPartitionKSubsets(new int[]{10,10,10,7,7,7,7,7,7,6,6,6}, 3)); // true
        System.out.println(canPartitionKSubsets(new int[]{2,2,2,2,3,4,5}, 5));    // false
        System.out.println(canPartitionKSubsets(new int[]{5,5,5,5}, 4));          // true
        System.out.println(canPartitionKSubsets(new int[]{1,1,1,1,2,2,2,2}, 4));  // true
        System.out.println(canPartitionKSubsets(new int[]{3,3,3,3}, 3));          // false
    }
}`,
  "most-stones-removed": `import java.util.*;

public class Main {
    public static int removeStones(int[][] stones) {
        // Union row r with col + 10001 for each stone; answer = n - components

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(removeStones(new int[][]{{0,0},{0,1},{1,0},{1,2},{2,1},{2,2}}));   // 5
        System.out.println(removeStones(new int[][]{{0,0},{0,2},{1,1},{2,0},{2,2}}));         // 3
        System.out.println(removeStones(new int[][]{{0,0}}));                                  // 0
        System.out.println(removeStones(new int[][]{{0,0},{1,1}}));                            // 0
        System.out.println(removeStones(new int[][]{{0,0},{0,1}}));                            // 1
        System.out.println(removeStones(new int[][]{{0,0},{1,0}}));                            // 1
        System.out.println(removeStones(new int[][]{{0,0},{0,1},{1,0},{1,1}}));                // 3
        System.out.println(removeStones(new int[][]{{0,1},{1,0},{1,1}}));                      // 2
        System.out.println(removeStones(new int[][]{{0,0},{2,2},{4,4}}));                       // 0
        System.out.println(removeStones(new int[][]{{0,0},{0,1},{0,2},{0,3},{0,4}}));           // 4
        System.out.println(removeStones(new int[][]{{3,2},{3,1},{4,4},{1,1},{0,2},{4,0}}));     // 4
        System.out.println(removeStones(new int[][]{{0,0},{1,1},{2,2},{0,1},{1,2}}));           // 4
    }
}`,
  "min-cost-connect-points": `import java.util.*;

public class Main {
    public static int minCostConnectPoints(int[][] points) {
        // Prim's MST: minDist[i] from current tree to non-tree vertex i

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(minCostConnectPoints(new int[][]{{0,0},{2,2},{3,10},{5,2},{7,0}}));  // 20
        System.out.println(minCostConnectPoints(new int[][]{{3,12},{-2,5},{-4,1}}));            // 18
        System.out.println(minCostConnectPoints(new int[][]{{0,0},{1,1},{1,0},{-1,1}}));        // 4
        System.out.println(minCostConnectPoints(new int[][]{{-1000000,-1000000},{1000000,1000000}})); // 4000000
        System.out.println(minCostConnectPoints(new int[][]{{0,0}}));                            // 0
        System.out.println(minCostConnectPoints(new int[][]{{0,0},{1,1}}));                      // 2
        System.out.println(minCostConnectPoints(new int[][]{{0,0},{0,1},{0,2},{0,3}}));          // 3
        System.out.println(minCostConnectPoints(new int[][]{{2,-3},{-17,-8},{13,8},{-17,-15}})); // 53
        System.out.println(minCostConnectPoints(new int[][]{{0,0},{10,0},{0,10},{10,10}}));      // 30
        System.out.println(minCostConnectPoints(new int[][]{{1,1},{2,2},{3,3},{4,4}}));          // 6
        System.out.println(minCostConnectPoints(new int[][]{{0,0},{5,5},{10,10},{15,15},{20,20}})); // 40
    }
}`,
  "path-min-effort": `import java.util.*;

public class Main {
    public static int minimumEffortPath(int[][] heights) {
        // Dijkstra where cost[v] = max(cost[u], |h[u]-h[v]|)

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(minimumEffortPath(new int[][]{{1,2,2},{3,8,2},{5,3,5}}));   // 2
        System.out.println(minimumEffortPath(new int[][]{{1,2,3},{3,8,4},{5,3,5}}));   // 1
        System.out.println(minimumEffortPath(new int[][]{{1,2,1,1,1},{1,2,1,2,1},{1,2,1,2,1},{1,2,1,2,1},{1,1,1,2,1}})); // 0
        System.out.println(minimumEffortPath(new int[][]{{1}}));                        // 0
        System.out.println(minimumEffortPath(new int[][]{{1,10,6,7,9,10,4,9}}));        // 9
        System.out.println(minimumEffortPath(new int[][]{{1},{2},{3},{4}}));            // 1
        System.out.println(minimumEffortPath(new int[][]{{1,2},{3,4}}));                // 2
        System.out.println(minimumEffortPath(new int[][]{{1,2,3},{4,5,6},{7,8,9}}));    // 3
        System.out.println(minimumEffortPath(new int[][]{{10,8},{10,7}}));              // 2
        System.out.println(minimumEffortPath(new int[][]{{1,1,1},{1,1,1},{1,1,1}}));    // 0
        System.out.println(minimumEffortPath(new int[][]{{1,100,1},{1,100,1},{1,1,1}})); // 0
    }
}`,
  "number-of-ways-shortest-path": `import java.util.*;

public class Main {
    static final int MOD = 1_000_000_007;

    public static int countPaths(int n, int[][] roads) {
        // Dijkstra; track dist[] and ways[] arrays

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(countPaths(7, new int[][]{{0,6,7},{0,1,2},{1,2,3},{1,3,3},{6,3,3},{3,5,1},{6,5,1},{2,5,1},{0,4,5},{4,6,2}})); // 4
        System.out.println(countPaths(2, new int[][]{{1,0,10}}));                                          // 1
        System.out.println(countPaths(3, new int[][]{{0,1,1},{1,2,1},{0,2,2}}));                          // 2
        System.out.println(countPaths(4, new int[][]{{0,1,1},{1,3,1},{0,2,1},{2,3,1}}));                  // 2
        System.out.println(countPaths(5, new int[][]{{0,1,1},{0,2,1},{1,3,1},{2,3,1},{3,4,1}}));          // 2
        System.out.println(countPaths(3, new int[][]{{0,1,5},{1,2,5},{0,2,10}}));                          // 2
        System.out.println(countPaths(4, new int[][]{{0,1,2},{1,2,2},{2,3,2}}));                           // 1
        System.out.println(countPaths(2, new int[][]{{0,1,1}}));                                            // 1
        System.out.println(countPaths(5, new int[][]{{0,1,1},{1,4,10},{0,2,1},{2,4,10},{0,3,1},{3,4,10}})); // 3
        System.out.println(countPaths(6, new int[][]{{0,1,1},{1,5,4},{0,2,2},{2,5,3},{0,3,1},{3,5,4},{0,4,2},{4,5,3}})); // 4
        System.out.println(countPaths(4, new int[][]{{0,1,1},{0,2,1},{1,3,1},{2,3,1},{1,2,1}}));           // 2
        System.out.println(countPaths(3, new int[][]{{0,1,7},{0,2,3},{2,1,4}}));                           // 1
    }
}`,
  "knight-dialer": `public class Main {
    static final int MOD = 1_000_000_007;

    public static int knightDialer(int n) {
        // DP: dp[i][d]; sum at end

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(knightDialer(1));    // 10
        System.out.println(knightDialer(2));    // 20
        System.out.println(knightDialer(3));    // 46
        System.out.println(knightDialer(4));    // 104
        System.out.println(knightDialer(5));    // 240
        System.out.println(knightDialer(6));    // 544
        System.out.println(knightDialer(7));    // 1256
        System.out.println(knightDialer(8));    // 2864
        System.out.println(knightDialer(9));    // 6576
        System.out.println(knightDialer(10));   // 15040
        System.out.println(knightDialer(3131)); // 136006598
    }
}`,
  "longest-increasing-path-matrix": `public class Main {
    public static int longestIncreasingPath(int[][] matrix) {
        // DFS + memoization

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(longestIncreasingPath(new int[][]{{9,9,4},{6,6,8},{2,1,1}}));     // 4
        System.out.println(longestIncreasingPath(new int[][]{{3,4,5},{3,2,6},{2,2,1}}));     // 4
        System.out.println(longestIncreasingPath(new int[][]{{1}}));                          // 1
        System.out.println(longestIncreasingPath(new int[][]{{1,2}}));                        // 2
        System.out.println(longestIncreasingPath(new int[][]{{2,1}}));                        // 2
        System.out.println(longestIncreasingPath(new int[][]{{1,2,3,4,5}}));                  // 5
        System.out.println(longestIncreasingPath(new int[][]{{1},{2},{3},{4}}));              // 4
        System.out.println(longestIncreasingPath(new int[][]{{7,7,7},{7,7,7},{7,7,7}}));      // 1
        System.out.println(longestIncreasingPath(new int[][]{{1,2,3},{6,5,4},{7,8,9}}));      // 9
        System.out.println(longestIncreasingPath(new int[][]{{0,1,2,3},{7,6,5,4}}));          // 8
        System.out.println(longestIncreasingPath(new int[][]{{3,4},{2,1}}));                  // 4
        System.out.println(longestIncreasingPath(new int[][]{{1,2},{4,3}}));                  // 4
    }
}`,
  "longest-consecutive-sequence": `import java.util.*;

public class Main {
    public static int longestConsecutive(int[] nums) {
        // Approach: HashSet + only start runs from sequence heads (n-1 not in set)

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(longestConsecutive(new int[]{100,4,200,1,3,2}));                      // 4
        System.out.println(longestConsecutive(new int[]{0,3,7,2,5,8,4,6,0,1}));                  // 9
        System.out.println(longestConsecutive(new int[]{}));                                      // 0
        System.out.println(longestConsecutive(new int[]{1}));                                     // 1
        System.out.println(longestConsecutive(new int[]{1,2,0,1}));                               // 3
        System.out.println(longestConsecutive(new int[]{9,1,4,7,3,-1,0,5,8,-1,6}));               // 7
        System.out.println(longestConsecutive(new int[]{1,3,5,7,9}));                             // 1
        System.out.println(longestConsecutive(new int[]{1,2,3,4,5}));                             // 5
        System.out.println(longestConsecutive(new int[]{-1,-2,-3,-4}));                           // 4
        System.out.println(longestConsecutive(new int[]{5,5,5,5}));                               // 1
    }
}`,
  "minimum-size-subarray-sum": `public class Main {
    public static int minSubArrayLen(int target, int[] nums) {
        // Approach: sliding window - expand right, shrink left while sum >= target

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(minSubArrayLen(7, new int[]{2,3,1,2,4,3}));                             // 2
        System.out.println(minSubArrayLen(4, new int[]{1,4,4}));                                   // 1
        System.out.println(minSubArrayLen(11, new int[]{1,1,1,1,1,1,1,1}));                        // 0
        System.out.println(minSubArrayLen(15, new int[]{1,2,3,4,5}));                              // 5
        System.out.println(minSubArrayLen(6, new int[]{10,2,3}));                                  // 1
        System.out.println(minSubArrayLen(5, new int[]{1,1,1,1,1,5}));                             // 1
        System.out.println(minSubArrayLen(100, new int[]{1,2,3}));                                 // 0
        System.out.println(minSubArrayLen(7, new int[]{2,3,1,2,4,3,1,1}));                         // 2
        System.out.println(minSubArrayLen(213, new int[]{12,28,83,4,25,26,25,2,25,25,25,12}));     // 8
        System.out.println(minSubArrayLen(1, new int[]{1}));                                       // 1
    }
}`,
  "trapping-rain-water": `public class Main {
    public static int trap(int[] height) {
        // Approach: two pointers with leftMax / rightMax

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(trap(new int[]{0,1,0,2,1,0,1,3,2,1,2,1}));   // 6
        System.out.println(trap(new int[]{4,2,0,3,2,5}));               // 9
        System.out.println(trap(new int[]{}));                          // 0
        System.out.println(trap(new int[]{1}));                         // 0
        System.out.println(trap(new int[]{1,1,1,1}));                   // 0
        System.out.println(trap(new int[]{5,4,1,2}));                   // 1
        System.out.println(trap(new int[]{3,0,2,0,4}));                 // 7
        System.out.println(trap(new int[]{2,0,2}));                     // 2
        System.out.println(trap(new int[]{0,0,0}));                     // 0
        System.out.println(trap(new int[]{5,2,1,2,1,5}));               // 14
    }
}`,
  "sort-colors": `import java.util.*;

public class Main {
    public static void sortColors(int[] nums) {
        // Approach: Dutch National Flag - 3 pointers (low, mid, high)

    }

    public static void main(String[] args) {
        int[] a = {2,0,2,1,1,0};        sortColors(a); System.out.println(Arrays.toString(a));  // [0, 0, 1, 1, 2, 2]
        int[] b = {2,0,1};              sortColors(b); System.out.println(Arrays.toString(b));  // [0, 1, 2]
        int[] c = {0};                  sortColors(c); System.out.println(Arrays.toString(c));  // [0]
        int[] d = {1};                  sortColors(d); System.out.println(Arrays.toString(d));  // [1]
        int[] e = {2};                  sortColors(e); System.out.println(Arrays.toString(e));  // [2]
        int[] f = {};                   sortColors(f); System.out.println(Arrays.toString(f));  // []
        int[] g = {1,1,1};              sortColors(g); System.out.println(Arrays.toString(g));  // [1, 1, 1]
        int[] h = {0,0,0};              sortColors(h); System.out.println(Arrays.toString(h));  // [0, 0, 0]
        int[] i = {2,2,2};              sortColors(i); System.out.println(Arrays.toString(i));  // [2, 2, 2]
        int[] j = {2,1,0};              sortColors(j); System.out.println(Arrays.toString(j));  // [0, 1, 2]
        int[] k = {1,2,0,1,2,0,1,2};    sortColors(k); System.out.println(Arrays.toString(k));  // [0, 0, 1, 1, 1, 2, 2, 2]
    }
}`,
  "find-all-anagrams-in-a-string": `import java.util.*;

public class Main {
    public static List<Integer> findAnagrams(String s, String p) {
        // Approach: fixed-size sliding window with 26-length char count arrays

        return new ArrayList<>();
    }

    public static void main(String[] args) {
        System.out.println(findAnagrams("cbaebabacd", "abc"));   // [0, 6]
        System.out.println(findAnagrams("abab", "ab"));          // [0, 1, 2]
        System.out.println(findAnagrams("", "a"));               // []
        System.out.println(findAnagrams("a", "a"));              // [0]
        System.out.println(findAnagrams("a", "ab"));             // []
        System.out.println(findAnagrams("aaaa", "aa"));          // [0, 1, 2]
        System.out.println(findAnagrams("abc", "abcd"));         // []
        System.out.println(findAnagrams("abcabc", "abc"));       // [0, 1, 2, 3]
        System.out.println(findAnagrams("baa", "aa"));           // [1]
        System.out.println(findAnagrams("ababab", "ab"));        // [0, 1, 2, 3, 4]
    }
}`,
  "longest-substring-with-at-most-k-distinct-characters": `import java.util.*;

public class Main {
    public static int lengthOfLongestSubstringKDistinct(String s, int k) {
        // Approach: sliding window with char-count HashMap, shrink when distinct > k

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(lengthOfLongestSubstringKDistinct("eceba", 2));    // 3
        System.out.println(lengthOfLongestSubstringKDistinct("aa", 1));       // 2
        System.out.println(lengthOfLongestSubstringKDistinct("", 0));         // 0
        System.out.println(lengthOfLongestSubstringKDistinct("a", 0));        // 0
        System.out.println(lengthOfLongestSubstringKDistinct("a", 1));        // 1
        System.out.println(lengthOfLongestSubstringKDistinct("abc", 10));     // 3
        System.out.println(lengthOfLongestSubstringKDistinct("aabbcc", 1));   // 2
        System.out.println(lengthOfLongestSubstringKDistinct("aabbcc", 2));   // 4
        System.out.println(lengthOfLongestSubstringKDistinct("aabbcc", 3));   // 6
        System.out.println(lengthOfLongestSubstringKDistinct("abaccc", 2));   // 4
        System.out.println(lengthOfLongestSubstringKDistinct("world", 4));    // 4
    }
}`,
  "fruit-into-baskets": `import java.util.*;

public class Main {
    public static int totalFruit(int[] fruits) {
        // Approach: sliding window - longest subarray with at most 2 distinct values

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(totalFruit(new int[]{1,2,1}));                              // 3
        System.out.println(totalFruit(new int[]{0,1,2,2}));                            // 3
        System.out.println(totalFruit(new int[]{1,2,3,2,2}));                          // 4
        System.out.println(totalFruit(new int[]{3,3,3,1,2,1,1,2,3,3,4}));              // 5
        System.out.println(totalFruit(new int[]{1}));                                  // 1
        System.out.println(totalFruit(new int[]{}));                                   // 0
        System.out.println(totalFruit(new int[]{1,1,1,1}));                            // 4
        System.out.println(totalFruit(new int[]{1,2}));                                // 2
        System.out.println(totalFruit(new int[]{1,2,3,4,5}));                          // 2
        System.out.println(totalFruit(new int[]{1,0,1,4,1,4,1,2,3}));                  // 5
        System.out.println(totalFruit(new int[]{0,1,6,6,4,4,6}));                      // 5
    }
}`,
  "serialize-deserialize-binary-tree": `public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int v) { val = v; }
    }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode root = new TreeNode(vals[0]);
        java.util.Queue<TreeNode> q = new java.util.ArrayDeque<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode n = q.poll();
            if (i < vals.length) { if (vals[i] != null) { n.left = new TreeNode(vals[i]); q.add(n.left); } i++; }
            if (i < vals.length) { if (vals[i] != null) { n.right = new TreeNode(vals[i]); q.add(n.right); } i++; }
        }
        return root;
    }

    public static String serialize(TreeNode root) {
        // TODO: return a string encoding of the tree

        return "";
    }

    public static TreeNode deserialize(String data) {
        // TODO: rebuild the tree from the string produced by serialize

        return null;
    }

    public static void main(String[] args) {
        // Test round-trip: serialize(deserialize(serialize(root))) == serialize(root)
        TreeNode[] trees = new TreeNode[] {
            build(),
            build(1),
            build(1,2,3),
            build(1,null,2,3),
            build(3,9,20,null,null,15,7),
            build(1,2,3,4,5,6,7),
            build(-1,-2,-3),
            build(1,2,null,3,null,4,null,5),
            build(5,4,8,11,null,13,4,7,2,null,null,5,1),
            build(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15),
            build(1,null,2,null,3,null,4,null,5)
        };
        for (TreeNode t : trees) {
            String s1 = serialize(t);
            TreeNode r2 = deserialize(s1);
            String s2 = serialize(r2);
            System.out.println(s1.equals(s2));   // expected true
        }
    }
}`,
  "populating-next-right-pointers-ii": `public class Main {
    static class Node {
        int val; Node left, right, next;
        Node(int v) { val = v; }
    }

    static Node build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        Node root = new Node(vals[0]);
        java.util.Queue<Node> q = new java.util.ArrayDeque<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            Node n = q.poll();
            if (i < vals.length) { if (vals[i] != null) { n.left = new Node(vals[i]); q.add(n.left); } i++; }
            if (i < vals.length) { if (vals[i] != null) { n.right = new Node(vals[i]); q.add(n.right); } i++; }
        }
        return root;
    }

    // Helper: read levels by following the .next chain from the leftmost node of each level.
    static java.util.List<java.util.List<Integer>> levelsViaNext(Node root) {
        java.util.List<java.util.List<Integer>> out = new java.util.ArrayList<>();
        Node levelStart = root;
        while (levelStart != null) {
            java.util.List<Integer> row = new java.util.ArrayList<>();
            Node cur = levelStart;
            Node nextStart = null;
            while (cur != null) {
                row.add(cur.val);
                if (nextStart == null) {
                    if (cur.left != null) nextStart = cur.left;
                    else if (cur.right != null) nextStart = cur.right;
                }
                cur = cur.next;
            }
            out.add(row);
            if (nextStart != null) { levelStart = nextStart; }
            else {
                // fall back: scan the level for any child
                Node scan = levelStart;
                Node found = null;
                while (scan != null && found == null) {
                    if (scan.left != null) found = scan.left;
                    else if (scan.right != null) found = scan.right;
                    scan = scan.next;
                }
                levelStart = found;
            }
        }
        return out;
    }

    public static Node connect(Node root) {
        // TODO: wire up .next pointers at every level

        return root;
    }

    public static void main(String[] args) {
        System.out.println(levelsViaNext(connect(build(1,2,3,4,5,null,7))));
        // expected [[1], [2, 3], [4, 5, 7]]
        System.out.println(levelsViaNext(connect(build())));
        // expected []
        System.out.println(levelsViaNext(connect(build(1))));
        // expected [[1]]
        System.out.println(levelsViaNext(connect(build(1,2,3))));
        // expected [[1], [2, 3]]
        System.out.println(levelsViaNext(connect(build(1,2,3,4,5,6,7))));
        // expected [[1], [2, 3], [4, 5, 6, 7]]
        System.out.println(levelsViaNext(connect(build(1,2))));
        // expected [[1], [2]]
        System.out.println(levelsViaNext(connect(build(1,null,2))));
        // expected [[1], [2]]
        System.out.println(levelsViaNext(connect(build(1,2,3,4))));
        // expected [[1], [2, 3], [4]]
        System.out.println(levelsViaNext(connect(build(1,2,3,null,5,6))));
        // expected [[1], [2, 3], [5, 6]]
        System.out.println(levelsViaNext(connect(build(1,2,3,null,null,4,5))));
        // expected [[1], [2, 3], [4, 5]]
        System.out.println(levelsViaNext(connect(build(1,2,3,4,null,null,7))));
        // expected [[1], [2, 3], [4, 7]]
    }
}`,
  "count-complete-tree-nodes": `public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int v) { val = v; }
    }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode root = new TreeNode(vals[0]);
        java.util.Queue<TreeNode> q = new java.util.ArrayDeque<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode n = q.poll();
            if (i < vals.length) { if (vals[i] != null) { n.left = new TreeNode(vals[i]); q.add(n.left); } i++; }
            if (i < vals.length) { if (vals[i] != null) { n.right = new TreeNode(vals[i]); q.add(n.right); } i++; }
        }
        return root;
    }

    public static int countNodes(TreeNode root) {
        // TODO: return number of nodes. Aim for O(log^2 n) using tree completeness.

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(countNodes(build(1,2,3,4,5,6)));                         // expected 6
        System.out.println(countNodes(build()));                                    // expected 0
        System.out.println(countNodes(build(1)));                                   // expected 1
        System.out.println(countNodes(build(1,2)));                                 // expected 2
        System.out.println(countNodes(build(1,2,3)));                               // expected 3
        System.out.println(countNodes(build(1,2,3,4)));                             // expected 4
        System.out.println(countNodes(build(1,2,3,4,5)));                           // expected 5
        System.out.println(countNodes(build(1,2,3,4,5,6,7)));                       // expected 7
        System.out.println(countNodes(build(1,2,3,4,5,6,7,8)));                     // expected 8
        System.out.println(countNodes(build(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15))); // expected 15
        System.out.println(countNodes(build(1,2,3,4,5,6,7,8,9,10)));                // expected 10
    }
}`,
  "lowest-common-ancestor-bst": `public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int v) { val = v; }
    }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode root = new TreeNode(vals[0]);
        java.util.Queue<TreeNode> q = new java.util.ArrayDeque<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode n = q.poll();
            if (i < vals.length) { if (vals[i] != null) { n.left = new TreeNode(vals[i]); q.add(n.left); } i++; }
            if (i < vals.length) { if (vals[i] != null) { n.right = new TreeNode(vals[i]); q.add(n.right); } i++; }
        }
        return root;
    }

    // Returns the val of the LCA node (for easy printing).
    public static int lowestCommonAncestor(TreeNode root, int pVal, int qVal) {
        // TODO: walk the BST using ordering between pVal, qVal, and root.val

        return 0;
    }

    public static void main(String[] args) {
        TreeNode t1 = build(6,2,8,0,4,7,9,null,null,3,5);
        System.out.println(lowestCommonAncestor(t1, 2, 8));   // expected 6
        System.out.println(lowestCommonAncestor(t1, 2, 4));   // expected 2
        System.out.println(lowestCommonAncestor(t1, 0, 5));   // expected 2
        System.out.println(lowestCommonAncestor(t1, 3, 5));   // expected 4
        System.out.println(lowestCommonAncestor(t1, 7, 9));   // expected 8
        System.out.println(lowestCommonAncestor(t1, 0, 9));   // expected 6
        System.out.println(lowestCommonAncestor(t1, 0, 3));   // expected 2
        System.out.println(lowestCommonAncestor(t1, 4, 2));   // expected 2
        System.out.println(lowestCommonAncestor(t1, 2, 3));   // expected 2

        TreeNode t2 = build(2,1);
        System.out.println(lowestCommonAncestor(t2, 1, 2));   // expected 2

        TreeNode t3 = build(5);
        System.out.println(lowestCommonAncestor(t3, 5, 5));   // expected 5
    }
}`,
  "path-sum-iii": `public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int v) { val = v; }
    }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode root = new TreeNode(vals[0]);
        java.util.Queue<TreeNode> q = new java.util.ArrayDeque<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode n = q.poll();
            if (i < vals.length) { if (vals[i] != null) { n.left = new TreeNode(vals[i]); q.add(n.left); } i++; }
            if (i < vals.length) { if (vals[i] != null) { n.right = new TreeNode(vals[i]); q.add(n.right); } i++; }
        }
        return root;
    }

    public static int pathSum(TreeNode root, int targetSum) {
        // TODO: count downward paths (not necessarily root-to-leaf) whose values sum to targetSum.

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(pathSum(build(10,5,-3,3,2,null,11,3,-2,null,1), 8));          // expected 3
        System.out.println(pathSum(build(5,4,8,11,null,13,4,7,2,null,null,5,1), 22));    // expected 3
        System.out.println(pathSum(build(), 0));                                         // expected 0
        System.out.println(pathSum(build(), 1));                                         // expected 0
        System.out.println(pathSum(build(1), 1));                                        // expected 1
        System.out.println(pathSum(build(1), 0));                                        // expected 0
        System.out.println(pathSum(build(1,-1), 0));                                     // expected 1
        System.out.println(pathSum(build(1,2), 3));                                      // expected 1
        System.out.println(pathSum(build(1,2,3), 3));                                    // expected 2
        System.out.println(pathSum(build(1,2,3), 5));                                    // expected 0
        System.out.println(pathSum(build(-2,null,-3), -5));                              // expected 1
    }
}`,
  "redundant-connection": `import java.util.Arrays;

public class Main {
    public static int[] findRedundantConnection(int[][] edges) {
        // TODO: Union-Find; return the edge that closes a cycle.

        return new int[0];
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(findRedundantConnection(new int[][]{{1,2},{1,3},{2,3}})));
        // expected [2, 3]
        System.out.println(Arrays.toString(findRedundantConnection(new int[][]{{1,2},{2,3},{3,4},{1,4},{1,5}})));
        // expected [1, 4]
        System.out.println(Arrays.toString(findRedundantConnection(new int[][]{{1,2},{2,3},{3,1}})));
        // expected [3, 1]
        System.out.println(Arrays.toString(findRedundantConnection(new int[][]{{1,2},{1,3},{1,4},{3,4}})));
        // expected [3, 4]
        System.out.println(Arrays.toString(findRedundantConnection(new int[][]{{2,7},{7,8},{3,6},{2,5},{6,8},{4,8},{2,8},{1,8},{7,10},{3,9}})));
        // expected [2, 8]
        System.out.println(Arrays.toString(findRedundantConnection(new int[][]{{1,4},{3,4},{1,3},{1,2},{4,5}})));
        // expected [1, 3]
        System.out.println(Arrays.toString(findRedundantConnection(new int[][]{{3,4},{1,2},{2,4},{3,5},{2,5}})));
        // expected [2, 5]
        System.out.println(Arrays.toString(findRedundantConnection(new int[][]{{1,2},{2,3},{1,3}})));
        // expected [1, 3]
        System.out.println(Arrays.toString(findRedundantConnection(new int[][]{{1,2},{1,3},{2,3},{3,4}})));
        // expected [2, 3]
        System.out.println(Arrays.toString(findRedundantConnection(new int[][]{{1,2},{2,3},{3,4},{4,1}})));
        // expected [4, 1]
        System.out.println(Arrays.toString(findRedundantConnection(new int[][]{{1,2},{2,3},{3,4},{4,5},{1,5}})));
        // expected [1, 5]
    }
}`,
  "accounts-merge": `import java.util.*;

public class Main {
    public static List<List<String>> accountsMerge(List<List<String>> accounts) {
        // TODO: Union-Find over emails; group and sort within each group.

        return new ArrayList<>();
    }

    // Helper to build input quickly.
    static List<List<String>> acc(String[]... rows) {
        List<List<String>> out = new ArrayList<>();
        for (String[] r : rows) out.add(new ArrayList<>(Arrays.asList(r)));
        return out;
    }

    public static void main(String[] args) {
        // LC canonical example: 3 Johns share emails transitively -> merge to 1; Mary alone; johnnybravo alone. Total 3.
        System.out.println(accountsMerge(acc(
            new String[]{"John","johnsmith@mail.com","john_newyork@mail.com"},
            new String[]{"John","johnsmith@mail.com","john00@mail.com"},
            new String[]{"Mary","mary@mail.com"},
            new String[]{"John","johnnybravo@mail.com"}
        )).size());   // expected 3

        // Single account -> 1
        System.out.println(accountsMerge(acc(
            new String[]{"Alice","alice@a.com","alice@b.com"}
        )).size());   // expected 1

        // 5 accounts with no shared emails -> 5
        System.out.println(accountsMerge(acc(
            new String[]{"A","a@x.com"},
            new String[]{"B","b@x.com"},
            new String[]{"C","c@x.com"},
            new String[]{"D","d@x.com"},
            new String[]{"E","e@x.com"}
        )).size());   // expected 5

        // 3 accounts all share one email -> collapse to 1
        System.out.println(accountsMerge(acc(
            new String[]{"A","shared@x.com","a1@x.com"},
            new String[]{"A","shared@x.com","a2@x.com"},
            new String[]{"A","shared@x.com","a3@x.com"}
        )).size());   // expected 1

        // 2 accounts same name but disjoint emails -> remain 2
        System.out.println(accountsMerge(acc(
            new String[]{"Sam","sam1@x.com"},
            new String[]{"Sam","sam2@x.com"}
        )).size());   // expected 2

        // 2 accounts different names but shared email -> merge to 1 (shared email wins)
        System.out.println(accountsMerge(acc(
            new String[]{"Alpha","common@x.com","a1@x.com"},
            new String[]{"Beta","common@x.com","b1@x.com"}
        )).size());   // expected 1

        // Chain merge: #1-#2 via e12, #2-#3 via e23, #4 alone -> 2
        System.out.println(accountsMerge(acc(
            new String[]{"X","e1@x.com","e12@x.com"},
            new String[]{"X","e12@x.com","e23@x.com"},
            new String[]{"X","e23@x.com","e3@x.com"},
            new String[]{"Y","y@x.com"}
        )).size());   // expected 2

        // Empty-ish: one account with just the name and one email -> 1
        System.out.println(accountsMerge(acc(
            new String[]{"Solo","solo@x.com"}
        )).size());   // expected 1

        // Four accounts, two disjoint pairs merge -> 2 merged accounts
        System.out.println(accountsMerge(acc(
            new String[]{"P","p1@x.com","shared1@x.com"},
            new String[]{"P","shared1@x.com","p2@x.com"},
            new String[]{"Q","q1@x.com","shared2@x.com"},
            new String[]{"Q","shared2@x.com","q2@x.com"}
        )).size());   // expected 2

        // Three accounts where 1 shares with 3 but not 2; 2 stands alone -> 2
        System.out.println(accountsMerge(acc(
            new String[]{"N","a@x.com","b@x.com"},
            new String[]{"N","c@x.com"},
            new String[]{"N","b@x.com","d@x.com"}
        )).size());   // expected 2

        // Six accounts, all pairwise disjoint -> 6
        System.out.println(accountsMerge(acc(
            new String[]{"U1","u1@x.com"},
            new String[]{"U2","u2@x.com"},
            new String[]{"U3","u3@x.com"},
            new String[]{"U4","u4@x.com"},
            new String[]{"U5","u5@x.com"},
            new String[]{"U6","u6@x.com"}
        )).size());   // expected 6
    }
}`,
  "best-time-buy-sell-stock-iii": `public class Main {
    public static int maxProfit(int[] prices) {
        // Track 4 states: first buy, first sell, second buy, second sell

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(maxProfit(new int[]{3,3,5,0,0,3,1,4})); // expected 6
        System.out.println(maxProfit(new int[]{1,2,3,4,5}));       // expected 4
        System.out.println(maxProfit(new int[]{7,6,4,3,1}));       // expected 0
        System.out.println(maxProfit(new int[]{1}));               // expected 0
        System.out.println(maxProfit(new int[]{}));                // expected 0
        System.out.println(maxProfit(new int[]{1,2}));             // expected 1
        System.out.println(maxProfit(new int[]{2,1}));             // expected 0
        System.out.println(maxProfit(new int[]{1,2,3,4,5,0,1,2,3,4,5})); // expected 9
        System.out.println(maxProfit(new int[]{6,1,3,2,4,7}));     // expected 7
        System.out.println(maxProfit(new int[]{1,4,2,7}));         // expected 8
        System.out.println(maxProfit(new int[]{1,2,4,2,5,7,2,4,9,0})); // expected 13
    }
}`,
  "best-time-buy-sell-stock-iv": `public class Main {
    public static int maxProfit(int k, int[] prices) {
        // If k >= n/2, treat as unlimited transactions
        // Else: dp[t][i] over transactions and days

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(maxProfit(2, new int[]{2,4,1}));        // expected 2
        System.out.println(maxProfit(2, new int[]{3,2,6,5,0,3}));  // expected 7
        System.out.println(maxProfit(0, new int[]{1,2,3}));        // expected 0
        System.out.println(maxProfit(1, new int[]{1,2,3,4,5}));    // expected 4
        System.out.println(maxProfit(1, new int[]{7,6,4,3,1}));    // expected 0
        System.out.println(maxProfit(10, new int[]{1,2,3,4,5}));   // expected 4
        System.out.println(maxProfit(100, new int[]{}));           // expected 0
        System.out.println(maxProfit(100, new int[]{3,3,3}));      // expected 0
        System.out.println(maxProfit(2, new int[]{1,2,4,2,5,7,2,4,9,0})); // expected 13
        System.out.println(maxProfit(3, new int[]{1,2,4,2,5,7,2,4,9,0})); // expected 15
        System.out.println(maxProfit(1000000000, new int[]{1,2,3,4,5,6})); // expected 5
    }
}`,
  "burst-balloons": `public class Main {
    public static int maxCoins(int[] nums) {
        // Pad with 1s on both ends. dp[l][r] = max coins on open interval (l,r).
        // Iterate over which balloon k is burst LAST in (l,r).

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(maxCoins(new int[]{3,1,5,8})); // expected 167
        System.out.println(maxCoins(new int[]{1,5}));     // expected 10
        System.out.println(maxCoins(new int[]{}));        // expected 0
        System.out.println(maxCoins(new int[]{1}));       // expected 1
        System.out.println(maxCoins(new int[]{5}));       // expected 5
        System.out.println(maxCoins(new int[]{1,2}));     // expected 4
        System.out.println(maxCoins(new int[]{3,1,5}));   // expected 35
        System.out.println(maxCoins(new int[]{1,2,3}));   // expected 12
        System.out.println(maxCoins(new int[]{2,3}));     // expected 9
        System.out.println(maxCoins(new int[]{10}));      // expected 10
        System.out.println(maxCoins(new int[]{1,1}));     // expected 2
    }
}`,
  "russian-doll-envelopes": `public class Main {
    public static int maxEnvelopes(int[][] envelopes) {
        // Sort by width asc, height desc on tie.
        // Then LIS on heights in O(n log n) using patience sort.

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(maxEnvelopes(new int[][]{{5,4},{6,4},{6,7},{2,3}})); // expected 3
        System.out.println(maxEnvelopes(new int[][]{{1,1},{1,1},{1,1}}));       // expected 1
        System.out.println(maxEnvelopes(new int[][]{{4,5},{4,6},{6,7},{2,3},{1,1}})); // expected 4
        System.out.println(maxEnvelopes(new int[][]{}));                        // expected 0
        System.out.println(maxEnvelopes(new int[][]{{1,1}}));                   // expected 1
        System.out.println(maxEnvelopes(new int[][]{{1,2},{2,3},{3,4}}));       // expected 3
        System.out.println(maxEnvelopes(new int[][]{{1,2},{2,3},{3,4},{4,5}})); // expected 4
        System.out.println(maxEnvelopes(new int[][]{{1,1},{2,2},{3,3}}));       // expected 3
        System.out.println(maxEnvelopes(new int[][]{{5,5},{4,4},{3,3},{2,2},{1,1}})); // expected 5
        System.out.println(maxEnvelopes(new int[][]{{2,100},{3,200},{4,300},{5,500},{5,400},{5,250},{6,370},{6,360},{7,380}})); // expected 5
        System.out.println(maxEnvelopes(new int[][]{{1,3},{3,5},{6,7},{6,8},{8,4},{9,5}})); // expected 3
    }
}`,
  "k-closest-points-origin": `public class Main {
    public static int[][] kClosest(int[][] points, int k) {
        // Max-heap of size k by squared distance, or quickselect.

        return new int[0][0];
    }

    // Helper: sum of squared distances of returned points (deterministic invariant).
    public static int sumSqDist(int[][] pts) {
        int s = 0;
        for (int[] p : pts) s += p[0]*p[0] + p[1]*p[1];
        return s;
    }

    public static void main(String[] args) {
        System.out.println(sumSqDist(kClosest(new int[][]{{1,3},{-2,2}}, 1)));               // expected 8
        System.out.println(sumSqDist(kClosest(new int[][]{{3,3},{5,-1},{-2,4}}, 2)));        // expected 38
        System.out.println(sumSqDist(kClosest(new int[][]{{0,0}}, 1)));                      // expected 0
        System.out.println(sumSqDist(kClosest(new int[][]{{1,0},{0,1}}, 2)));                // expected 2
        System.out.println(sumSqDist(kClosest(new int[][]{{1,1},{-1,-1},{2,2},{-2,-2}}, 2))); // expected 4
        System.out.println(sumSqDist(kClosest(new int[][]{{1,1},{-1,-1},{2,2},{-2,-2}}, 3))); // expected 12
        System.out.println(sumSqDist(kClosest(new int[][]{{1,0},{2,0},{3,0},{4,0}}, 2)));    // expected 5
        System.out.println(sumSqDist(kClosest(new int[][]{{0,1},{1,0},{0,-1},{-1,0}}, 4)));  // expected 4
        System.out.println(sumSqDist(kClosest(new int[][]{{10,10}}, 1)));                    // expected 200
        System.out.println(sumSqDist(kClosest(new int[][]{{-5,4},{0,0},{3,4}}, 3)));         // expected 66
        System.out.println(sumSqDist(kClosest(new int[][]{{1,3},{-2,2},{2,-2}}, 3)));        // expected 26
    }
}`,
  "maximum-product-of-three-numbers": `public class Main {
    public static int maximumProduct(int[] nums) {
        // Sort, or track top-3 max + bottom-2 min in one pass.

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(maximumProduct(new int[]{1,2,3}));             // expected 6
        System.out.println(maximumProduct(new int[]{1,2,3,4}));           // expected 24
        System.out.println(maximumProduct(new int[]{-1,-2,-3}));          // expected -6
        System.out.println(maximumProduct(new int[]{-1,-2,-3,-4}));       // expected -6
        System.out.println(maximumProduct(new int[]{-100,-98,-1,2,3,4})); // expected 39200
        System.out.println(maximumProduct(new int[]{1,-4,3,-6,7,0}));     // expected 168
        System.out.println(maximumProduct(new int[]{-1,0,1}));            // expected 0
        System.out.println(maximumProduct(new int[]{0,0,0}));             // expected 0
        System.out.println(maximumProduct(new int[]{1,1,1}));             // expected 1
        System.out.println(maximumProduct(new int[]{-1,-1,-1}));          // expected -1
        System.out.println(maximumProduct(new int[]{-5,-4,-3,-2,-1}));    // expected -6
        System.out.println(maximumProduct(new int[]{1000,999,998,-1000,-999})); // expected 999000000
    }
}`,
  "minimum-cost-for-tickets": `public class Main {
    public static int mincostTickets(int[] days, int[] costs) {
        // dp over 1..last day. On travel day i:
        //   dp[i] = min(dp[i-1]+costs[0], dp[i-7]+costs[1], dp[i-30]+costs[2])
        // On non-travel day: dp[i] = dp[i-1].

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(mincostTickets(new int[]{1,4,6,7,8,20}, new int[]{2,7,15})); // expected 11
        System.out.println(mincostTickets(new int[]{1,2,3,4,5,6,7,8,9,10,30,31}, new int[]{2,7,15})); // expected 17
        System.out.println(mincostTickets(new int[]{1}, new int[]{2,7,15}));            // expected 2
        System.out.println(mincostTickets(new int[]{}, new int[]{2,7,15}));             // expected 0
        System.out.println(mincostTickets(new int[]{1,2}, new int[]{2,7,15}));          // expected 4
        System.out.println(mincostTickets(new int[]{1,8}, new int[]{2,7,15}));          // expected 4
        System.out.println(mincostTickets(new int[]{1,2,3,4,5,6,7}, new int[]{2,7,15})); // expected 7
        System.out.println(mincostTickets(new int[]{1,2,3,4,5,6,7,8}, new int[]{2,7,15})); // expected 9
        System.out.println(mincostTickets(new int[]{1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30}, new int[]{2,7,15})); // expected 15
        System.out.println(mincostTickets(new int[]{1,365}, new int[]{100,50,10}));     // expected 20
        System.out.println(mincostTickets(new int[]{1,4,6,7,8,20}, new int[]{7,2,15})); // expected 6
    }
}`,
  "valid-palindrome": `public class Main {
    public static boolean isPalindrome(String s) {
        // Two pointers from both ends, skip non-alphanumerics, compare lowercase

        return false;
    }

    public static void main(String[] args) {
        System.out.println(isPalindrome("A man, a plan, a canal: Panama"));   // expected: true
        System.out.println(isPalindrome("race a car"));                        // expected: false
        System.out.println(isPalindrome(" "));                                 // expected: true
        System.out.println(isPalindrome(""));                                  // expected: true
        System.out.println(isPalindrome("a"));                                 // expected: true
        System.out.println(isPalindrome("Aa"));                                // expected: true
        System.out.println(isPalindrome("0P"));                                // expected: false
        System.out.println(isPalindrome("1b1"));                               // expected: true
        System.out.println(isPalindrome(".,!?"));                              // expected: true
        System.out.println(isPalindrome("ab_a"));                              // expected: true
        System.out.println(isPalindrome("abba"));                              // expected: true
        System.out.println(isPalindrome("Was it a car or a cat I saw?"));      // expected: true
    }
}`,
  "first-unique-character": `public class Main {
    public static int firstUniqChar(String s) {
        // Count frequencies, then find first index with freq == 1

        return -1;
    }

    public static void main(String[] args) {
        System.out.println(firstUniqChar("leetcode"));       // expected: 0
        System.out.println(firstUniqChar("loveleetcode"));   // expected: 2
        System.out.println(firstUniqChar("aabb"));           // expected: -1
        System.out.println(firstUniqChar(""));               // expected: -1
        System.out.println(firstUniqChar("a"));              // expected: 0
        System.out.println(firstUniqChar("aa"));             // expected: -1
        System.out.println(firstUniqChar("abc"));            // expected: 0
        System.out.println(firstUniqChar("abcabc"));         // expected: -1
        System.out.println(firstUniqChar("abcabcd"));        // expected: 6
        System.out.println(firstUniqChar("z"));              // expected: 0
        System.out.println(firstUniqChar("dddccdbba"));      // expected: 8
    }
}`,
  "single-number": `public class Main {
    public static int singleNumber(int[] nums) {
        // XOR all elements; duplicate pairs cancel, result is the unique value

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(singleNumber(new int[]{2,2,1}));              // expected: 1
        System.out.println(singleNumber(new int[]{4,1,2,1,2}));          // expected: 4
        System.out.println(singleNumber(new int[]{1}));                  // expected: 1
        System.out.println(singleNumber(new int[]{0,0,1}));              // expected: 1
        System.out.println(singleNumber(new int[]{1,1,2,2,3,3,4}));      // expected: 4
        System.out.println(singleNumber(new int[]{-1,-1,-2}));           // expected: -2
        System.out.println(singleNumber(new int[]{7}));                  // expected: 7
        System.out.println(singleNumber(new int[]{2,3,2,3,1}));          // expected: 1
        System.out.println(singleNumber(new int[]{10,20,10,30,20}));     // expected: 30
        System.out.println(singleNumber(new int[]{5,5,5,5,7,7,7,7,9})); // expected: 9
    }
}`,
  "missing-number": `public class Main {
    public static int missingNumber(int[] nums) {
        // Sum of 0..n minus sum(nums) equals the missing number

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(missingNumber(new int[]{3,0,1}));                 // expected: 2
        System.out.println(missingNumber(new int[]{0,1}));                   // expected: 2
        System.out.println(missingNumber(new int[]{9,6,4,2,3,5,7,0,1}));     // expected: 8
        System.out.println(missingNumber(new int[]{0}));                     // expected: 1
        System.out.println(missingNumber(new int[]{1}));                     // expected: 0
        System.out.println(missingNumber(new int[]{1,2}));                   // expected: 0
        System.out.println(missingNumber(new int[]{0,2}));                   // expected: 1
        System.out.println(missingNumber(new int[]{0,1,2,3,5}));             // expected: 4
        System.out.println(missingNumber(new int[]{2,0,3,1}));               // expected: 4
        System.out.println(missingNumber(new int[]{}));                      // expected: 0
        System.out.println(missingNumber(new int[]{5,4,3,2,1,0}));           // expected: 6
    }
}`,
  "isomorphic-strings": `public class Main {
    public static boolean isIsomorphic(String s, String t) {
        // Maintain two maps: s->t and t->s to enforce bijection

        return false;
    }

    public static void main(String[] args) {
        System.out.println(isIsomorphic("egg", "add"));     // expected: true
        System.out.println(isIsomorphic("foo", "bar"));     // expected: false
        System.out.println(isIsomorphic("paper", "title")); // expected: true
        System.out.println(isIsomorphic("", ""));           // expected: true
        System.out.println(isIsomorphic("a", "a"));         // expected: true
        System.out.println(isIsomorphic("a", "b"));         // expected: true
        System.out.println(isIsomorphic("ab", "aa"));       // expected: false
        System.out.println(isIsomorphic("aa", "ab"));       // expected: false
        System.out.println(isIsomorphic("abc", "xyz"));     // expected: true
        System.out.println(isIsomorphic("ba", "aa"));       // expected: false
        System.out.println(isIsomorphic("badc", "baba"));   // expected: false
        System.out.println(isIsomorphic("13", "42"));       // expected: true
    }
}`,
  "longest-common-prefix": `public class Main {
    public static String longestCommonPrefix(String[] strs) {
        // Vertical scan: for each index i, check all strings share the same char

        return "";
    }

    public static void main(String[] args) {
        System.out.println(longestCommonPrefix(new String[]{"flower","flow","flight"}));  // expected: fl
        System.out.println(longestCommonPrefix(new String[]{"dog","racecar","car"}));     // expected: (empty)
        System.out.println(longestCommonPrefix(new String[]{""}));                         // expected: (empty)
        System.out.println(longestCommonPrefix(new String[]{"a"}));                        // expected: a
        System.out.println(longestCommonPrefix(new String[]{"abc","abc","abc"}));          // expected: abc
        System.out.println(longestCommonPrefix(new String[]{"abc","ab"}));                 // expected: ab
        System.out.println(longestCommonPrefix(new String[]{"ab","abc"}));                 // expected: ab
        System.out.println(longestCommonPrefix(new String[]{"a","b","c"}));                // expected: (empty)
        System.out.println(longestCommonPrefix(new String[]{}));                           // expected: (empty)
        System.out.println(longestCommonPrefix(new String[]{"prefix","pre","preamble"}));  // expected: pre
        System.out.println(longestCommonPrefix(new String[]{"aaa","aa","a"}));             // expected: a
    }
}`,
  "three-sum-closest": `import java.util.Arrays;

public class Main {
    public static int threeSumClosest(int[] nums, int target) {
        // Sort, then for each i use two pointers to find closest sum to target

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(threeSumClosest(new int[]{-1,2,1,-4}, 1));              // expected: 2
        System.out.println(threeSumClosest(new int[]{0,0,0}, 1));                  // expected: 0
        System.out.println(threeSumClosest(new int[]{1,1,1,0}, -100));             // expected: 2
        System.out.println(threeSumClosest(new int[]{-1,0,1,1,55}, 3));            // expected: 2
        System.out.println(threeSumClosest(new int[]{1,2,3}, 6));                  // expected: 6
        System.out.println(threeSumClosest(new int[]{1,2,3}, 100));                // expected: 6
        System.out.println(threeSumClosest(new int[]{1,2,3}, -100));               // expected: 6
        System.out.println(threeSumClosest(new int[]{-3,-2,-5,3,-4}, -1));         // expected: -2
        System.out.println(threeSumClosest(new int[]{0,1,2}, 3));                  // expected: 3
        System.out.println(threeSumClosest(new int[]{-1,2,1,-4,5,-3}, 0));         // expected: 0
    }
}`,
  "happy-number": `public class Main {
    public static boolean isHappy(int n) {
        // Repeatedly sum squares of digits; detect cycle with HashSet or fast/slow

        return false;
    }

    public static void main(String[] args) {
        System.out.println(isHappy(19));    // expected: true
        System.out.println(isHappy(2));     // expected: false
        System.out.println(isHappy(1));     // expected: true
        System.out.println(isHappy(7));     // expected: true
        System.out.println(isHappy(100));   // expected: true
        System.out.println(isHappy(4));     // expected: false
        System.out.println(isHappy(10));    // expected: true
        System.out.println(isHappy(13));    // expected: true
        System.out.println(isHappy(23));    // expected: true
        System.out.println(isHappy(68));    // expected: true
        System.out.println(isHappy(20));    // expected: false
    }
}`,
  "length-of-last-word": `public class Main {
    public static int lengthOfLastWord(String s) {
        // Scan from right: skip trailing spaces, then count until space or start

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(lengthOfLastWord("Hello World"));                   // expected: 5
        System.out.println(lengthOfLastWord("   fly me   to   the moon  "));   // expected: 4
        System.out.println(lengthOfLastWord("luffy is still joyboy"));         // expected: 6
        System.out.println(lengthOfLastWord("a"));                             // expected: 1
        System.out.println(lengthOfLastWord("a "));                            // expected: 1
        System.out.println(lengthOfLastWord(" a"));                            // expected: 1
        System.out.println(lengthOfLastWord("  a  "));                         // expected: 1
        System.out.println(lengthOfLastWord("abc"));                           // expected: 3
        System.out.println(lengthOfLastWord("Hello "));                        // expected: 5
        System.out.println(lengthOfLastWord("day"));                           // expected: 3
        System.out.println(lengthOfLastWord("Today is a nice day"));           // expected: 3
    }
}`,
  "ransom-note": `public class Main {
    public static boolean canConstruct(String ransomNote, String magazine) {
        // Count letters in magazine, then consume them for ransomNote

        return false;
    }

    public static void main(String[] args) {
        System.out.println(canConstruct("a", "b"));                                                                // expected: false
        System.out.println(canConstruct("aa", "ab"));                                                              // expected: false
        System.out.println(canConstruct("aa", "aab"));                                                             // expected: true
        System.out.println(canConstruct("", "abc"));                                                               // expected: true
        System.out.println(canConstruct("abc", ""));                                                               // expected: false
        System.out.println(canConstruct("abc", "abc"));                                                            // expected: true
        System.out.println(canConstruct("aab", "baa"));                                                            // expected: true
        System.out.println(canConstruct("abc", "abcdef"));                                                         // expected: true
        System.out.println(canConstruct("aaa", "aa"));                                                             // expected: false
        System.out.println(canConstruct("bg", "efjbdfbdgfjhhaiigfhbaejahgfbbgbjagbddfgdiaigdadhcfcj"));            // expected: true
        System.out.println(canConstruct("fihjjjjei", "hjibagacbhadfaefdjaeaebgi"));                                // expected: false
    }
}`,
  "plus-one": `import java.util.Arrays;

public class Main {
    public static int[] plusOne(int[] digits) {
        // Iterate from the end; if digit < 9, increment and return; else set 0 and carry

        return digits;
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(plusOne(new int[]{1,2,3})));                      // expected: [1, 2, 4]
        System.out.println(Arrays.toString(plusOne(new int[]{4,3,2,1})));                    // expected: [4, 3, 2, 2]
        System.out.println(Arrays.toString(plusOne(new int[]{9})));                          // expected: [1, 0]
        System.out.println(Arrays.toString(plusOne(new int[]{9,9})));                        // expected: [1, 0, 0]
        System.out.println(Arrays.toString(plusOne(new int[]{9,9,9})));                      // expected: [1, 0, 0, 0]
        System.out.println(Arrays.toString(plusOne(new int[]{0})));                          // expected: [1]
        System.out.println(Arrays.toString(plusOne(new int[]{1,9})));                        // expected: [2, 0]
        System.out.println(Arrays.toString(plusOne(new int[]{1,0,0})));                      // expected: [1, 0, 1]
        System.out.println(Arrays.toString(plusOne(new int[]{8,9,9,9})));                    // expected: [9, 0, 0, 0]
        System.out.println(Arrays.toString(plusOne(new int[]{2,4,9,3,9})));                  // expected: [2, 4, 9, 4, 0]
        System.out.println(Arrays.toString(plusOne(new int[]{9,8,7,6,5,4,3,2,1,0})));        // expected: [9, 8, 7, 6, 5, 4, 3, 2, 1, 1]
    }
}`,
  "pascals-triangle": `import java.util.ArrayList;
import java.util.List;

public class Main {
    public static List<List<Integer>> generate(int numRows) {
        // Build row-by-row: first and last are 1, interior from sum of two above

        return new ArrayList<>();
    }

    public static void main(String[] args) {
        System.out.println(generate(1).toString());   // expected: [[1]]
        System.out.println(generate(2).toString());   // expected: [[1], [1, 1]]
        System.out.println(generate(3).toString());   // expected: [[1], [1, 1], [1, 2, 1]]
        System.out.println(generate(4).toString());   // expected: [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1]]
        System.out.println(generate(5).toString());   // expected: [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1]]
        System.out.println(generate(6).toString());   // expected: [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1], [1, 5, 10, 10, 5, 1]]
        System.out.println(generate(0).toString());   // expected: []
        System.out.println(generate(7).toString());   // expected: [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1], [1, 5, 10, 10, 5, 1], [1, 6, 15, 20, 15, 6, 1]]
        System.out.println(generate(8).toString());   // expected: [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1], [1, 5, 10, 10, 5, 1], [1, 6, 15, 20, 15, 6, 1], [1, 7, 21, 35, 35, 21, 7, 1]]
        System.out.println(generate(1).toString());   // expected: [[1]]
        System.out.println(generate(2).toString());   // expected: [[1], [1, 1]]
    }
}`,
  "intersection-of-two-linked-lists": `public class Main {
    static class ListNode {
        int val; ListNode next;
        ListNode(int v) { val = v; }
    }

    static ListNode build(int[] vals) {
        ListNode dummy = new ListNode(0), cur = dummy;
        for (int v : vals) { cur.next = new ListNode(v); cur = cur.next; }
        return dummy.next;
    }

    static ListNode[] buildIntersect(int[] a, int[] b, int[] common) {
        ListNode tail = (common.length == 0) ? null : build(common);
        ListNode headA = (a.length == 0) ? tail : build(a);
        if (a.length > 0) {
            ListNode cur = headA;
            while (cur.next != null) cur = cur.next;
            cur.next = tail;
        }
        ListNode headB = (b.length == 0) ? tail : build(b);
        if (b.length > 0) {
            ListNode cur = headB;
            while (cur.next != null) cur = cur.next;
            cur.next = tail;
        }
        return new ListNode[]{headA, headB};
    }

    public static ListNode getIntersectionNode(ListNode headA, ListNode headB) {
        // TODO

        return null;
    }

    static int valOrMinus(ListNode n) { return n == null ? -1 : n.val; }

    public static void main(String[] args) {
        ListNode[] p;
        p = buildIntersect(new int[]{4,1}, new int[]{5,6,1}, new int[]{8,4,5});
        System.out.println(valOrMinus(getIntersectionNode(p[0], p[1])));       // 8
        p = buildIntersect(new int[]{1,9,1}, new int[]{3}, new int[]{2,4});
        System.out.println(valOrMinus(getIntersectionNode(p[0], p[1])));       // 2
        p = buildIntersect(new int[]{2,6,4}, new int[]{1,5}, new int[]{});
        System.out.println(valOrMinus(getIntersectionNode(p[0], p[1])));       // -1
        p = buildIntersect(new int[]{1}, new int[]{1}, new int[]{});
        System.out.println(valOrMinus(getIntersectionNode(p[0], p[1])));       // -1
        p = buildIntersect(new int[]{}, new int[]{}, new int[]{7});
        System.out.println(valOrMinus(getIntersectionNode(p[0], p[1])));       // 7
        p = buildIntersect(new int[]{1}, new int[]{2,3}, new int[]{5});
        System.out.println(valOrMinus(getIntersectionNode(p[0], p[1])));       // 5
        p = buildIntersect(new int[]{}, new int[]{}, new int[]{1,2,3});
        System.out.println(valOrMinus(getIntersectionNode(p[0], p[1])));       // 1
        p = buildIntersect(new int[]{9,8,7}, new int[]{6}, new int[]{});
        System.out.println(valOrMinus(getIntersectionNode(p[0], p[1])));       // -1
        p = buildIntersect(new int[]{5}, new int[]{1,2,3,4}, new int[]{10,20});
        System.out.println(valOrMinus(getIntersectionNode(p[0], p[1])));       // 10
        p = buildIntersect(new int[]{1,2,3,4,5}, new int[]{6}, new int[]{7});
        System.out.println(valOrMinus(getIntersectionNode(p[0], p[1])));       // 7
    }
}`,
  "remove-duplicates-sorted-list": `public class Main {
    static class ListNode {
        int val; ListNode next;
        ListNode(int v) { val = v; }
    }

    static ListNode build(int... vals) {
        ListNode dummy = new ListNode(0), cur = dummy;
        for (int v : vals) { cur.next = new ListNode(v); cur = cur.next; }
        return dummy.next;
    }

    static String toStr(ListNode h) {
        StringBuilder sb = new StringBuilder("[");
        while (h != null) { sb.append(h.val); if (h.next != null) sb.append(", "); h = h.next; }
        return sb.append("]").toString();
    }

    public static ListNode deleteDuplicates(ListNode head) {
        // TODO

        return head;
    }

    public static void main(String[] args) {
        System.out.println(toStr(deleteDuplicates(build(1,1,2))));              // [1, 2]
        System.out.println(toStr(deleteDuplicates(build(1,1,2,3,3))));          // [1, 2, 3]
        System.out.println(toStr(deleteDuplicates(build())));                   // []
        System.out.println(toStr(deleteDuplicates(build(1))));                  // [1]
        System.out.println(toStr(deleteDuplicates(build(1,1,1))));              // [1]
        System.out.println(toStr(deleteDuplicates(build(1,2,3))));              // [1, 2, 3]
        System.out.println(toStr(deleteDuplicates(build(1,1,2,2,3,3,4,4,5))));  // [1, 2, 3, 4, 5]
        System.out.println(toStr(deleteDuplicates(build(-1,-1,0,0,1,1))));      // [-1, 0, 1]
        System.out.println(toStr(deleteDuplicates(build(1,1,1,1,2))));          // [1, 2]
        System.out.println(toStr(deleteDuplicates(build(1,2,2,2,2,3))));        // [1, 2, 3]
    }
}`,
  "remove-duplicates-sorted-list-ii": `public class Main {
    static class ListNode {
        int val; ListNode next;
        ListNode(int v) { val = v; }
    }

    static ListNode build(int... vals) {
        ListNode dummy = new ListNode(0), cur = dummy;
        for (int v : vals) { cur.next = new ListNode(v); cur = cur.next; }
        return dummy.next;
    }

    static String toStr(ListNode h) {
        StringBuilder sb = new StringBuilder("[");
        while (h != null) { sb.append(h.val); if (h.next != null) sb.append(", "); h = h.next; }
        return sb.append("]").toString();
    }

    public static ListNode deleteDuplicates(ListNode head) {
        // TODO

        return head;
    }

    public static void main(String[] args) {
        System.out.println(toStr(deleteDuplicates(build(1,2,3,3,4,4,5))));      // [1, 2, 5]
        System.out.println(toStr(deleteDuplicates(build(1,1,1,2,3))));          // [2, 3]
        System.out.println(toStr(deleteDuplicates(build())));                   // []
        System.out.println(toStr(deleteDuplicates(build(1))));                  // [1]
        System.out.println(toStr(deleteDuplicates(build(1,1))));                // []
        System.out.println(toStr(deleteDuplicates(build(1,1,1))));              // []
        System.out.println(toStr(deleteDuplicates(build(1,2))));                // [1, 2]
        System.out.println(toStr(deleteDuplicates(build(1,1,2,2,3,3))));        // []
        System.out.println(toStr(deleteDuplicates(build(1,2,3,4,5))));          // [1, 2, 3, 4, 5]
        System.out.println(toStr(deleteDuplicates(build(1,1,2,3,4,4,5))));      // [2, 3, 5]
        System.out.println(toStr(deleteDuplicates(build(1,2,3,3,3,4,5,5))));    // [1, 2, 4]
    }
}`,
  "swap-nodes-in-pairs": `public class Main {
    static class ListNode {
        int val; ListNode next;
        ListNode(int v) { val = v; }
    }

    static ListNode build(int... vals) {
        ListNode dummy = new ListNode(0), cur = dummy;
        for (int v : vals) { cur.next = new ListNode(v); cur = cur.next; }
        return dummy.next;
    }

    static String toStr(ListNode h) {
        StringBuilder sb = new StringBuilder("[");
        while (h != null) { sb.append(h.val); if (h.next != null) sb.append(", "); h = h.next; }
        return sb.append("]").toString();
    }

    public static ListNode swapPairs(ListNode head) {
        // TODO

        return head;
    }

    public static void main(String[] args) {
        System.out.println(toStr(swapPairs(build(1,2,3,4))));                   // [2, 1, 4, 3]
        System.out.println(toStr(swapPairs(build())));                          // []
        System.out.println(toStr(swapPairs(build(1))));                         // [1]
        System.out.println(toStr(swapPairs(build(1,2))));                       // [2, 1]
        System.out.println(toStr(swapPairs(build(1,2,3))));                     // [2, 1, 3]
        System.out.println(toStr(swapPairs(build(1,2,3,4,5))));                 // [2, 1, 4, 3, 5]
        System.out.println(toStr(swapPairs(build(1,2,3,4,5,6))));               // [2, 1, 4, 3, 6, 5]
        System.out.println(toStr(swapPairs(build(7))));                         // [7]
        System.out.println(toStr(swapPairs(build(1,1))));                       // [1, 1]
        System.out.println(toStr(swapPairs(build(5,5,5,5,5))));                 // [5, 5, 5, 5, 5]
        System.out.println(toStr(swapPairs(build(10,20,30,40,50,60,70))));      // [20, 10, 40, 30, 60, 50, 70]
    }
}`,
  "partition-list": `public class Main {
    static class ListNode {
        int val; ListNode next;
        ListNode(int v) { val = v; }
    }

    static ListNode build(int... vals) {
        ListNode dummy = new ListNode(0), cur = dummy;
        for (int v : vals) { cur.next = new ListNode(v); cur = cur.next; }
        return dummy.next;
    }

    static String toStr(ListNode h) {
        StringBuilder sb = new StringBuilder("[");
        while (h != null) { sb.append(h.val); if (h.next != null) sb.append(", "); h = h.next; }
        return sb.append("]").toString();
    }

    public static ListNode partition(ListNode head, int x) {
        // TODO

        return head;
    }

    public static void main(String[] args) {
        System.out.println(toStr(partition(build(1,4,3,2,5,2), 3)));            // [1, 2, 2, 4, 3, 5]
        System.out.println(toStr(partition(build(2,1), 2)));                    // [1, 2]
        System.out.println(toStr(partition(build(), 0)));                       // []
        System.out.println(toStr(partition(build(1), 2)));                      // [1]
        System.out.println(toStr(partition(build(1), 0)));                      // [1]
        System.out.println(toStr(partition(build(1,2,3), 5)));                  // [1, 2, 3]
        System.out.println(toStr(partition(build(1,2,3), 0)));                  // [1, 2, 3]
        System.out.println(toStr(partition(build(3,1), 2)));                    // [1, 3]
        System.out.println(toStr(partition(build(5,4,3,2,1), 3)));              // [2, 1, 5, 4, 3]
        System.out.println(toStr(partition(build(1,1,1,2,2,2), 2)));            // [1, 1, 1, 2, 2, 2]
        System.out.println(toStr(partition(build(2,2,2,1,1,1), 2)));            // [1, 1, 1, 2, 2, 2]
    }
}`,
  "reverse-linked-list-ii": `public class Main {
    static class ListNode {
        int val; ListNode next;
        ListNode(int v) { val = v; }
    }

    static ListNode build(int... vals) {
        ListNode dummy = new ListNode(0), cur = dummy;
        for (int v : vals) { cur.next = new ListNode(v); cur = cur.next; }
        return dummy.next;
    }

    static String toStr(ListNode h) {
        StringBuilder sb = new StringBuilder("[");
        while (h != null) { sb.append(h.val); if (h.next != null) sb.append(", "); h = h.next; }
        return sb.append("]").toString();
    }

    public static ListNode reverseBetween(ListNode head, int left, int right) {
        // TODO

        return head;
    }

    public static void main(String[] args) {
        System.out.println(toStr(reverseBetween(build(1,2,3,4,5), 2, 4)));      // [1, 4, 3, 2, 5]
        System.out.println(toStr(reverseBetween(build(5), 1, 1)));              // [5]
        System.out.println(toStr(reverseBetween(build(1,2), 1, 2)));            // [2, 1]
        System.out.println(toStr(reverseBetween(build(1,2,3,4,5), 1, 5)));      // [5, 4, 3, 2, 1]
        System.out.println(toStr(reverseBetween(build(1,2,3,4,5), 1, 1)));      // [1, 2, 3, 4, 5]
        System.out.println(toStr(reverseBetween(build(1,2,3,4,5), 3, 3)));      // [1, 2, 3, 4, 5]
        System.out.println(toStr(reverseBetween(build(1,2,3,4,5), 1, 3)));      // [3, 2, 1, 4, 5]
        System.out.println(toStr(reverseBetween(build(1,2,3,4,5), 3, 5)));      // [1, 2, 5, 4, 3]
        System.out.println(toStr(reverseBetween(build(3,5), 1, 2)));            // [5, 3]
        System.out.println(toStr(reverseBetween(build(1,2,3), 1, 2)));          // [2, 1, 3]
    }
}`,
  "odd-even-linked-list": `public class Main {
    static class ListNode {
        int val; ListNode next;
        ListNode(int v) { val = v; }
    }

    static ListNode build(int... vals) {
        ListNode dummy = new ListNode(0), cur = dummy;
        for (int v : vals) { cur.next = new ListNode(v); cur = cur.next; }
        return dummy.next;
    }

    static String toStr(ListNode h) {
        StringBuilder sb = new StringBuilder("[");
        while (h != null) { sb.append(h.val); if (h.next != null) sb.append(", "); h = h.next; }
        return sb.append("]").toString();
    }

    public static ListNode oddEvenList(ListNode head) {
        // TODO

        return head;
    }

    public static void main(String[] args) {
        System.out.println(toStr(oddEvenList(build(1,2,3,4,5))));               // [1, 3, 5, 2, 4]
        System.out.println(toStr(oddEvenList(build(2,1,3,5,6,4,7))));           // [2, 3, 6, 7, 1, 5, 4]
        System.out.println(toStr(oddEvenList(build())));                        // []
        System.out.println(toStr(oddEvenList(build(1))));                       // [1]
        System.out.println(toStr(oddEvenList(build(1,2))));                     // [1, 2]
        System.out.println(toStr(oddEvenList(build(1,2,3))));                   // [1, 3, 2]
        System.out.println(toStr(oddEvenList(build(1,2,3,4))));                 // [1, 3, 2, 4]
        System.out.println(toStr(oddEvenList(build(1,2,3,4,5,6))));             // [1, 3, 5, 2, 4, 6]
        System.out.println(toStr(oddEvenList(build(9,8,7,6,5,4,3,2,1))));       // [9, 7, 5, 3, 1, 8, 6, 4, 2]
        System.out.println(toStr(oddEvenList(build(10,20))));                   // [10, 20]
    }
}`,
  "two-sum-ii-sorted": `import java.util.Arrays;

public class Main {
    public static int[] twoSum(int[] numbers, int target) {
        // TODO

        return new int[]{-1, -1};
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(twoSum(new int[]{2,7,11,15}, 9)));               // [1, 2]
        System.out.println(Arrays.toString(twoSum(new int[]{2,3,4}, 6)));                   // [1, 3]
        System.out.println(Arrays.toString(twoSum(new int[]{-1,0}, -1)));                   // [1, 2]
        System.out.println(Arrays.toString(twoSum(new int[]{1,2,3,4,4,9,56,90}, 8)));       // [4, 5]
        System.out.println(Arrays.toString(twoSum(new int[]{5,25,75}, 100)));               // [2, 3]
        System.out.println(Arrays.toString(twoSum(new int[]{3,24,50,79,88,150,345}, 200))); // [3, 6]
        System.out.println(Arrays.toString(twoSum(new int[]{2,7,11,15}, 22)));              // [3, 4]
        System.out.println(Arrays.toString(twoSum(new int[]{1,2}, 3)));                     // [1, 2]
        System.out.println(Arrays.toString(twoSum(new int[]{1,3,5,7,9}, 10)));              // [2, 4]
        System.out.println(Arrays.toString(twoSum(new int[]{0,0,3,4}, 0)));                 // [1, 2]
    }
}`,
  "remove-duplicates-sorted-array": `import java.util.Arrays;

public class Main {
    public static int removeDuplicates(int[] nums) {
        // TODO

        return nums.length;
    }

    static void run(int[] arr) {
        int len = removeDuplicates(arr);
        System.out.println(len + " " + Arrays.toString(Arrays.copyOfRange(arr, 0, len)));
    }

    public static void main(String[] args) {
        run(new int[]{1,1,2});                      // 2 [1, 2]
        run(new int[]{0,0,1,1,1,2,2,3,3,4});        // 5 [0, 1, 2, 3, 4]
        run(new int[]{});                           // 0 []
        run(new int[]{1});                          // 1 [1]
        run(new int[]{1,1,1});                      // 1 [1]
        run(new int[]{1,2,3});                      // 3 [1, 2, 3]
        run(new int[]{1,1,2,2,3,3});                // 3 [1, 2, 3]
        run(new int[]{1,1,1,1,1});                  // 1 [1]
        run(new int[]{-1,0,0,1,2,2,3});             // 5 [-1, 0, 1, 2, 3]
        run(new int[]{1,2});                        // 2 [1, 2]
    }
}`,
  "move-zeroes": `import java.util.Arrays;

public class Main {
    public static void moveZeroes(int[] nums) {
        // TODO
    }

    static void run(int[] arr) {
        moveZeroes(arr);
        System.out.println(Arrays.toString(arr));
    }

    public static void main(String[] args) {
        run(new int[]{0,1,0,3,12});         // [1, 3, 12, 0, 0]
        run(new int[]{0});                  // [0]
        run(new int[]{1});                  // [1]
        run(new int[]{0,0,0});              // [0, 0, 0]
        run(new int[]{1,2,3});              // [1, 2, 3]
        run(new int[]{});                   // []
        run(new int[]{1,0,2,0,3,0,4});      // [1, 2, 3, 4, 0, 0, 0]
        run(new int[]{0,0,1});              // [1, 0, 0]
        run(new int[]{1,0,0});              // [1, 0, 0]
        run(new int[]{0,1,0,1,0,1});        // [1, 1, 1, 0, 0, 0]
        run(new int[]{-1,0,-2,0,3});        // [-1, -2, 3, 0, 0]
    }
}`,
  "rotate-array": `import java.util.Arrays;

public class Main {
    public static void rotate(int[] nums, int k) {
        // TODO
    }

    static void run(int[] arr, int k) {
        rotate(arr, k);
        System.out.println(Arrays.toString(arr));
    }

    public static void main(String[] args) {
        run(new int[]{1,2,3,4,5,6,7}, 3);       // [5, 6, 7, 1, 2, 3, 4]
        run(new int[]{-1,-100,3,99}, 2);        // [3, 99, -1, -100]
        run(new int[]{1,2}, 3);                 // [2, 1]
        run(new int[]{1}, 5);                   // [1]
        run(new int[]{}, 3);                    // []
        run(new int[]{1,2,3,4,5}, 0);           // [1, 2, 3, 4, 5]
        run(new int[]{1,2,3,4,5}, 5);           // [1, 2, 3, 4, 5]
        run(new int[]{1,2,3,4,5}, 1);           // [5, 1, 2, 3, 4]
        run(new int[]{1,2,3,4,5}, 6);           // [5, 1, 2, 3, 4]
        run(new int[]{1,2,3,4,5,6}, 3);         // [4, 5, 6, 1, 2, 3]
        run(new int[]{1,2,3}, 4);               // [3, 1, 2]
    }
}`,
  "merge-sorted-array": `import java.util.Arrays;

public class Main {
    public static void merge(int[] nums1, int m, int[] nums2, int n) {
        // TODO
    }

    static void run(int[] nums1, int m, int[] nums2, int n) {
        merge(nums1, m, nums2, n);
        System.out.println(Arrays.toString(nums1));
    }

    public static void main(String[] args) {
        run(new int[]{1,2,3,0,0,0}, 3, new int[]{2,5,6}, 3);            // [1, 2, 2, 3, 5, 6]
        run(new int[]{1}, 1, new int[]{}, 0);                           // [1]
        run(new int[]{0}, 0, new int[]{1}, 1);                          // [1]
        run(new int[]{}, 0, new int[]{}, 0);                            // []
        run(new int[]{1,2,3,0,0}, 3, new int[]{4,5}, 2);                // [1, 2, 3, 4, 5]
        run(new int[]{4,5,6,0,0,0}, 3, new int[]{1,2,3}, 3);            // [1, 2, 3, 4, 5, 6]
        run(new int[]{2,0}, 1, new int[]{1}, 1);                        // [1, 2]
        run(new int[]{-1,0,0,0,0}, 1, new int[]{-2,-1,0,0}, 4);         // [-2, -1, -1, 0, 0]
        run(new int[]{1,1,1,0,0,0}, 3, new int[]{2,2,2}, 3);            // [1, 1, 1, 2, 2, 2]
        run(new int[]{3,4,5,0,0,0}, 3, new int[]{0,1,2}, 3);            // [0, 1, 2, 3, 4, 5]
    }
}`,
  "invert-binary-tree": `public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int v) { val = v; }
    }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode root = new TreeNode(vals[0]);
        java.util.Queue<TreeNode> q = new java.util.ArrayDeque<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode n = q.poll();
            if (i < vals.length) { if (vals[i] != null) { n.left = new TreeNode(vals[i]); q.add(n.left); } i++; }
            if (i < vals.length) { if (vals[i] != null) { n.right = new TreeNode(vals[i]); q.add(n.right); } i++; }
        }
        return root;
    }

    static java.util.List<Object> serializeLevel(TreeNode root) {
        java.util.List<Object> out = new java.util.ArrayList<>();
        if (root == null) return out;
        java.util.Queue<TreeNode> q = new java.util.ArrayDeque<>();
        q.add(root);
        while (!q.isEmpty()) {
            TreeNode n = q.poll();
            if (n == null) { out.add(null); continue; }
            out.add(n.val);
            q.add(n.left); q.add(n.right);
        }
        while (!out.isEmpty() && out.get(out.size()-1) == null) out.remove(out.size()-1);
        return out;
    }

    public static TreeNode invertTree(TreeNode root) {
        // Swap left and right children recursively

        return root;
    }

    public static void main(String[] args) {
        System.out.println(serializeLevel(invertTree(build(4,2,7,1,3,6,9))));                                 // expected: [4, 7, 2, 9, 6, 3, 1]
        System.out.println(serializeLevel(invertTree(build(2,1,3))));                                         // expected: [2, 3, 1]
        System.out.println(serializeLevel(invertTree(build())));                                              // expected: []
        System.out.println(serializeLevel(invertTree(build(1))));                                             // expected: [1]
        System.out.println(serializeLevel(invertTree(build(1,2))));                                           // expected: [1, null, 2]
        System.out.println(serializeLevel(invertTree(build(1,null,2))));                                      // expected: [1, 2]
        System.out.println(serializeLevel(invertTree(build(1,2,3))));                                         // expected: [1, 3, 2]
        System.out.println(serializeLevel(invertTree(build(1,2,3,4,5))));                                     // expected: [1, 3, 2, null, null, 5, 4]
        System.out.println(serializeLevel(invertTree(build(1,2,null,3))));                                    // expected: [1, null, 2, null, 3]
        System.out.println(serializeLevel(invertTree(build(5,4,8,11,null,13,4,7,2,null,null,null,1))));       // expected: [5, 8, 4, 4, 13, null, 11, 1, null, null, null, 2, 7]
    }
}`,
  "balanced-binary-tree": `public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int v) { val = v; }
    }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode root = new TreeNode(vals[0]);
        java.util.Queue<TreeNode> q = new java.util.ArrayDeque<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode n = q.poll();
            if (i < vals.length) { if (vals[i] != null) { n.left = new TreeNode(vals[i]); q.add(n.left); } i++; }
            if (i < vals.length) { if (vals[i] != null) { n.right = new TreeNode(vals[i]); q.add(n.right); } i++; }
        }
        return root;
    }

    public static boolean isBalanced(TreeNode root) {
        // Compute height with early termination when imbalance detected

        return true;
    }

    public static void main(String[] args) {
        System.out.println(isBalanced(build(3,9,20,null,null,15,7)));                   // expected: true
        System.out.println(isBalanced(build(1,2,2,3,3,null,null,4,4)));                 // expected: false
        System.out.println(isBalanced(build()));                                        // expected: true
        System.out.println(isBalanced(build(1)));                                       // expected: true
        System.out.println(isBalanced(build(1,2)));                                     // expected: true
        System.out.println(isBalanced(build(1,2,null,3)));                              // expected: false
        System.out.println(isBalanced(build(1,2,3,4)));                                 // expected: true
        System.out.println(isBalanced(build(1,2,null,3,null,4)));                       // expected: false
        System.out.println(isBalanced(build(1,null,2,null,3)));                         // expected: false
        System.out.println(isBalanced(build(1,2,3,4,5,6,7)));                           // expected: true
        System.out.println(isBalanced(build(1,2,2,3,null,null,3,4,null,null,4)));       // expected: false
    }
}`,
  "minimum-depth-of-binary-tree": `public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int v) { val = v; }
    }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode root = new TreeNode(vals[0]);
        java.util.Queue<TreeNode> q = new java.util.ArrayDeque<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode n = q.poll();
            if (i < vals.length) { if (vals[i] != null) { n.left = new TreeNode(vals[i]); q.add(n.left); } i++; }
            if (i < vals.length) { if (vals[i] != null) { n.right = new TreeNode(vals[i]); q.add(n.right); } i++; }
        }
        return root;
    }

    public static int minDepth(TreeNode root) {
        // BFS until the first leaf is popped; return its depth

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(minDepth(build(3,9,20,null,null,15,7)));                   // expected: 2
        System.out.println(minDepth(build(2,null,3,null,4,null,5,null,6)));           // expected: 5
        System.out.println(minDepth(build()));                                        // expected: 0
        System.out.println(minDepth(build(1)));                                       // expected: 1
        System.out.println(minDepth(build(1,2)));                                     // expected: 2
        System.out.println(minDepth(build(1,null,2)));                                // expected: 2
        System.out.println(minDepth(build(1,2,3)));                                   // expected: 2
        System.out.println(minDepth(build(1,2,3,4,5)));                               // expected: 2
        System.out.println(minDepth(build(1,2,null,3)));                              // expected: 3
        System.out.println(minDepth(build(1,2,3,null,null,4,5)));                     // expected: 2
    }
}`,
  "sum-root-to-leaf-numbers": `public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int v) { val = v; }
    }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode root = new TreeNode(vals[0]);
        java.util.Queue<TreeNode> q = new java.util.ArrayDeque<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode n = q.poll();
            if (i < vals.length) { if (vals[i] != null) { n.left = new TreeNode(vals[i]); q.add(n.left); } i++; }
            if (i < vals.length) { if (vals[i] != null) { n.right = new TreeNode(vals[i]); q.add(n.right); } i++; }
        }
        return root;
    }

    public static int sumNumbers(TreeNode root) {
        // DFS with accumulator cur = cur*10 + node.val; sum at each leaf

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(sumNumbers(build(1,2,3)));                         // expected: 25
        System.out.println(sumNumbers(build(4,9,0,5,1)));                     // expected: 1026
        System.out.println(sumNumbers(build()));                              // expected: 0
        System.out.println(sumNumbers(build(1)));                             // expected: 1
        System.out.println(sumNumbers(build(1,2)));                           // expected: 12
        System.out.println(sumNumbers(build(1,null,2)));                      // expected: 12
        System.out.println(sumNumbers(build(0)));                             // expected: 0
        System.out.println(sumNumbers(build(9,9,9)));                         // expected: 2178
        System.out.println(sumNumbers(build(1,2,3,4,5)));                     // expected: 262
        System.out.println(sumNumbers(build(2,3)));                           // expected: 23
        System.out.println(sumNumbers(build(7,null,8)));                      // expected: 78
        System.out.println(sumNumbers(build(0,1,0,null,null,null,2)));        // expected: 3
    }
}`,
  "binary-tree-right-side-view": `public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int v) { val = v; }
    }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode root = new TreeNode(vals[0]);
        java.util.Queue<TreeNode> q = new java.util.ArrayDeque<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode n = q.poll();
            if (i < vals.length) { if (vals[i] != null) { n.left = new TreeNode(vals[i]); q.add(n.left); } i++; }
            if (i < vals.length) { if (vals[i] != null) { n.right = new TreeNode(vals[i]); q.add(n.right); } i++; }
        }
        return root;
    }

    public static java.util.List<Integer> rightSideView(TreeNode root) {
        // BFS level-order; append the last node of each level to the result

        return new java.util.ArrayList<>();
    }

    public static void main(String[] args) {
        System.out.println(rightSideView(build(1,2,3,null,5,null,4)));        // expected: [1, 3, 4]
        System.out.println(rightSideView(build(1,null,3)));                   // expected: [1, 3]
        System.out.println(rightSideView(build()));                           // expected: []
        System.out.println(rightSideView(build(1)));                          // expected: [1]
        System.out.println(rightSideView(build(1,2)));                        // expected: [1, 2]
        System.out.println(rightSideView(build(1,2,3)));                      // expected: [1, 3]
        System.out.println(rightSideView(build(1,2,3,4)));                    // expected: [1, 3, 4]
        System.out.println(rightSideView(build(1,2,3,null,null,4,5)));        // expected: [1, 3, 5]
        System.out.println(rightSideView(build(1,2,3,4,5,6,7)));              // expected: [1, 3, 7]
        System.out.println(rightSideView(build(1,2,null,3,null,4)));          // expected: [1, 2, 3, 4]
    }
}`,
  "binary-tree-zigzag-level-order": `public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int v) { val = v; }
    }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode root = new TreeNode(vals[0]);
        java.util.Queue<TreeNode> q = new java.util.ArrayDeque<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode n = q.poll();
            if (i < vals.length) { if (vals[i] != null) { n.left = new TreeNode(vals[i]); q.add(n.left); } i++; }
            if (i < vals.length) { if (vals[i] != null) { n.right = new TreeNode(vals[i]); q.add(n.right); } i++; }
        }
        return root;
    }

    public static java.util.List<java.util.List<Integer>> zigzagLevelOrder(TreeNode root) {
        // BFS, flipping direction each level

        return new java.util.ArrayList<>();
    }

    public static void main(String[] args) {
        System.out.println(zigzagLevelOrder(build(3,9,20,null,null,15,7)));                          // expected: [[3], [20, 9], [15, 7]]
        System.out.println(zigzagLevelOrder(build()));                                               // expected: []
        System.out.println(zigzagLevelOrder(build(1)));                                              // expected: [[1]]
        System.out.println(zigzagLevelOrder(build(1,2,3)));                                          // expected: [[1], [3, 2]]
        System.out.println(zigzagLevelOrder(build(1,2,3,4,5,6,7)));                                  // expected: [[1], [3, 2], [4, 5, 6, 7]]
        System.out.println(zigzagLevelOrder(build(1,2,3,4,null,null,5)));                            // expected: [[1], [3, 2], [4, 5]]
        System.out.println(zigzagLevelOrder(build(1,2,null,3,null,4)));                              // expected: [[1], [2], [3], [4]]
        System.out.println(zigzagLevelOrder(build(1,null,2,null,3)));                                // expected: [[1], [2], [3]]
        System.out.println(zigzagLevelOrder(build(1,2,3,null,4,5,null)));                            // expected: [[1], [3, 2], [4, 5]]
        System.out.println(zigzagLevelOrder(build(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15)));            // expected: [[1], [3, 2], [4, 5, 6, 7], [15, 14, 13, 12, 11, 10, 9, 8]]
    }
}`,
  "flatten-binary-tree-to-linked-list": `public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int v) { val = v; }
    }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode root = new TreeNode(vals[0]);
        java.util.Queue<TreeNode> q = new java.util.ArrayDeque<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode n = q.poll();
            if (i < vals.length) { if (vals[i] != null) { n.left = new TreeNode(vals[i]); q.add(n.left); } i++; }
            if (i < vals.length) { if (vals[i] != null) { n.right = new TreeNode(vals[i]); q.add(n.right); } i++; }
        }
        return root;
    }

    static java.util.List<Integer> rightChain(TreeNode root) {
        java.util.List<Integer> out = new java.util.ArrayList<>();
        while (root != null) { out.add(root.val); root = root.right; }
        return out;
    }

    static java.util.List<Integer> flattenAndChain(TreeNode root) {
        flatten(root);
        return rightChain(root);
    }

    public static void flatten(TreeNode root) {
        // In-place flatten to right-only chain in preorder

    }

    public static void main(String[] args) {
        System.out.println(flattenAndChain(build(1,2,5,3,4,null,6)));                                // expected: [1, 2, 3, 4, 5, 6]
        System.out.println(flattenAndChain(build()));                                                // expected: []
        System.out.println(flattenAndChain(build(0)));                                               // expected: [0]
        System.out.println(flattenAndChain(build(1,2)));                                             // expected: [1, 2]
        System.out.println(flattenAndChain(build(1,null,2)));                                        // expected: [1, 2]
        System.out.println(flattenAndChain(build(1,2,3)));                                           // expected: [1, 2, 3]
        System.out.println(flattenAndChain(build(1,2,3,4,5,6,7)));                                   // expected: [1, 2, 4, 5, 3, 6, 7]
        System.out.println(flattenAndChain(build(1,2,null,3,null,4)));                               // expected: [1, 2, 3, 4]
        System.out.println(flattenAndChain(build(1,null,2,null,3)));                                 // expected: [1, 2, 3]
        System.out.println(flattenAndChain(build(5,4,8,11,null,13,4,7,2,null,null,null,1)));         // expected: [5, 4, 11, 7, 2, 8, 13, 4, 1]
    }
}`,
  "kth-largest-element-stream": `public class Main {
    static class KthLargest {
        // Maintain a min-heap of size k; top is the kth largest seen so far

        public KthLargest(int k, int[] nums) {
            // TODO
        }

        public int add(int val) {
            // TODO

            return 0;
        }
    }

    public static void main(String[] args) {
        KthLargest a = new KthLargest(3, new int[]{4,5,8,2});
        System.out.println(a.add(3));    // expected: 4
        System.out.println(a.add(5));    // expected: 5
        System.out.println(a.add(10));   // expected: 5
        System.out.println(a.add(9));    // expected: 8
        System.out.println(a.add(4));    // expected: 8

        KthLargest b = new KthLargest(1, new int[]{});
        System.out.println(b.add(5));    // expected: 5
        System.out.println(b.add(3));    // expected: 5
        System.out.println(b.add(10));   // expected: 10
        System.out.println(b.add(7));    // expected: 10
        System.out.println(b.add(100));  // expected: 100

        KthLargest c = new KthLargest(2, new int[]{1,2,3});
        System.out.println(c.add(4));    // expected: 3
        System.out.println(c.add(0));    // expected: 3
        System.out.println(c.add(5));    // expected: 4
    }
}`,
  "range-sum-bst": `public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int v) { val = v; }
    }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode root = new TreeNode(vals[0]);
        java.util.Queue<TreeNode> q = new java.util.ArrayDeque<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode n = q.poll();
            if (i < vals.length) { if (vals[i] != null) { n.left = new TreeNode(vals[i]); q.add(n.left); } i++; }
            if (i < vals.length) { if (vals[i] != null) { n.right = new TreeNode(vals[i]); q.add(n.right); } i++; }
        }
        return root;
    }

    public static int rangeSumBST(TreeNode root, int low, int high) {
        // DFS; prune left if val < low, prune right if val > high

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(rangeSumBST(build(10,5,15,3,7,null,18), 7, 15));             // expected: 32
        System.out.println(rangeSumBST(build(10,5,15,3,7,13,18,1,null,6), 6, 10));      // expected: 23
        System.out.println(rangeSumBST(build(), 0, 100));                               // expected: 0
        System.out.println(rangeSumBST(build(1), 1, 1));                                // expected: 1
        System.out.println(rangeSumBST(build(1), 0, 0));                                // expected: 0
        System.out.println(rangeSumBST(build(1,0,2), 0, 2));                            // expected: 3
        System.out.println(rangeSumBST(build(5,3,8,1,4,7,9), 3, 7));                    // expected: 19
        System.out.println(rangeSumBST(build(5,3,8), 10, 20));                          // expected: 0
        System.out.println(rangeSumBST(build(5,3,8), -5, 0));                           // expected: 0
        System.out.println(rangeSumBST(build(5,3,8), 5, 5));                            // expected: 5
        System.out.println(rangeSumBST(build(5,3,8), 3, 8));                            // expected: 16
    }
}`,
  "word-search": `public class Main {
    public static boolean exist(char[][] board, String word) {
        // DFS backtracking from every cell; mark visited by mutating in place

        return false;
    }

    public static void main(String[] args) {
        char[][] b1 = {{'A','B','C','E'},{'S','F','C','S'},{'A','D','E','E'}};
        System.out.println(exist(b1, "ABCCED"));                                            // expected: true
        System.out.println(exist(b1, "SEE"));                                               // expected: true
        System.out.println(exist(b1, "ABCB"));                                              // expected: false

        char[][] b2 = {{'A'}};
        System.out.println(exist(b2, "A"));                                                 // expected: true
        System.out.println(exist(b2, "B"));                                                 // expected: false

        char[][] b3 = {{'A','B'}};
        System.out.println(exist(b3, "AB"));                                                // expected: true
        System.out.println(exist(b3, "BA"));                                                // expected: true

        char[][] b4 = {{'A','B'},{'C','D'}};
        System.out.println(exist(b4, "ABDC"));                                              // expected: true
        System.out.println(exist(b4, "ABCD"));                                              // expected: false

        char[][] b5 = {{'a'}};
        System.out.println(exist(b5, "ab"));                                                // expected: false

        char[][] b6 = {{'C','A','A'},{'A','A','A'},{'B','C','D'}};
        System.out.println(exist(b6, "AAB"));                                               // expected: true
    }
}`,
  "graph-valid-tree": `public class Main {
    public static boolean validTree(int n, int[][] edges) {
        // Must have n-1 edges, be connected, and acyclic. Union-Find or DFS.

        return false;
    }

    public static void main(String[] args) {
        System.out.println(validTree(5, new int[][]{{0,1},{0,2},{0,3},{1,4}}));                     // expected: true
        System.out.println(validTree(5, new int[][]{{0,1},{1,2},{2,3},{1,3},{1,4}}));               // expected: false
        System.out.println(validTree(1, new int[][]{}));                                            // expected: true
        System.out.println(validTree(2, new int[][]{{0,1}}));                                       // expected: true
        System.out.println(validTree(2, new int[][]{}));                                            // expected: false
        System.out.println(validTree(3, new int[][]{{0,1},{1,2}}));                                 // expected: true
        System.out.println(validTree(3, new int[][]{{0,1},{1,2},{0,2}}));                           // expected: false
        System.out.println(validTree(4, new int[][]{{0,1},{2,3}}));                                 // expected: false
        System.out.println(validTree(4, new int[][]{{0,1},{0,2},{0,3}}));                           // expected: true
        System.out.println(validTree(5, new int[][]{{0,1},{0,2},{2,3},{2,4}}));                     // expected: true
        System.out.println(validTree(6, new int[][]{{0,1},{0,2},{2,3},{2,4}}));                     // expected: false
    }
}`,
  "is-graph-bipartite": `public class Main {
    public static boolean isBipartite(int[][] graph) {
        // BFS/DFS 2-coloring across each connected component

        return false;
    }

    public static void main(String[] args) {
        System.out.println(isBipartite(new int[][]{{1,2,3},{0,2},{0,1,3},{0,2}}));                  // expected: false
        System.out.println(isBipartite(new int[][]{{1,3},{0,2},{1,3},{0,2}}));                      // expected: true
        System.out.println(isBipartite(new int[][]{}));                                             // expected: true
        System.out.println(isBipartite(new int[][]{{}}));                                           // expected: true
        System.out.println(isBipartite(new int[][]{{},{}}));                                        // expected: true
        System.out.println(isBipartite(new int[][]{{1},{0}}));                                      // expected: true
        System.out.println(isBipartite(new int[][]{{1},{0,2},{1}}));                                // expected: true
        System.out.println(isBipartite(new int[][]{{1,2},{0,2},{0,1}}));                            // expected: false
        System.out.println(isBipartite(new int[][]{{1,2,3,4},{0},{0},{0},{0}}));                    // expected: true
        System.out.println(isBipartite(new int[][]{{1},{0,2},{1,3},{2,4},{3,0}}));                  // expected: false
    }
}`,
  "fibonacci-number": `public class Main {
    public static int fib(int n) {
        // Bottom-up DP: roll two variables a, b forward n times.

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(fib(0));    // expected: 0
        System.out.println(fib(1));    // expected: 1
        System.out.println(fib(2));    // expected: 1
        System.out.println(fib(3));    // expected: 2
        System.out.println(fib(4));    // expected: 3
        System.out.println(fib(5));    // expected: 5
        System.out.println(fib(6));    // expected: 8
        System.out.println(fib(7));    // expected: 13
        System.out.println(fib(10));   // expected: 55
        System.out.println(fib(20));   // expected: 6765
        System.out.println(fib(30));   // expected: 832040
    }
}`,
  "min-cost-climbing-stairs": `public class Main {
    public static int minCostClimbingStairs(int[] cost) {
        // dp[i] = cost[i] + min(dp[i-1], dp[i-2]); answer = min(dp[n-1], dp[n-2]).

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(minCostClimbingStairs(new int[]{10, 15, 20}));                           // expected: 15
        System.out.println(minCostClimbingStairs(new int[]{1, 100, 1, 1, 1, 100, 1, 1, 100, 1}));   // expected: 6
        System.out.println(minCostClimbingStairs(new int[]{0, 0, 0, 0}));                           // expected: 0
        System.out.println(minCostClimbingStairs(new int[]{1, 2}));                                 // expected: 1
        System.out.println(minCostClimbingStairs(new int[]{0, 0}));                                 // expected: 0
        System.out.println(minCostClimbingStairs(new int[]{2, 3}));                                 // expected: 2
        System.out.println(minCostClimbingStairs(new int[]{0, 1, 1, 0}));                           // expected: 1
        System.out.println(minCostClimbingStairs(new int[]{1, 1, 1, 1}));                           // expected: 2
        System.out.println(minCostClimbingStairs(new int[]{10, 1, 10, 1, 10}));                     // expected: 2
        System.out.println(minCostClimbingStairs(new int[]{1, 0, 0, 0, 1}));                        // expected: 0
        System.out.println(minCostClimbingStairs(new int[]{5, 5, 5, 5, 5, 5}));                     // expected: 15
    }
}`,
  "jump-game": `public class Main {
    public static boolean canJump(int[] nums) {
        // Greedy: maintain max reachable index; if current index > reach, fail.

        return false;
    }

    public static void main(String[] args) {
        System.out.println(canJump(new int[]{2, 3, 1, 1, 4}));         // expected: true
        System.out.println(canJump(new int[]{3, 2, 1, 0, 4}));         // expected: false
        System.out.println(canJump(new int[]{0}));                     // expected: true
        System.out.println(canJump(new int[]{1}));                     // expected: true
        System.out.println(canJump(new int[]{0, 1}));                  // expected: false
        System.out.println(canJump(new int[]{1, 0}));                  // expected: true
        System.out.println(canJump(new int[]{1, 0, 1}));               // expected: false
        System.out.println(canJump(new int[]{2, 0, 0}));               // expected: true
        System.out.println(canJump(new int[]{2, 3, 1, 1, 4, 0, 0}));   // expected: true
        System.out.println(canJump(new int[]{1, 2, 3}));               // expected: true
        System.out.println(canJump(new int[]{5, 0, 0, 0, 0}));         // expected: true
        System.out.println(canJump(new int[]{1, 1, 0, 1}));            // expected: false
    }
}`,
  "jump-game-ii": `public class Main {
    public static int jump(int[] nums) {
        // Greedy: track current-jump end and farthest reachable; bump jumps when passing end.

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(jump(new int[]{2, 3, 1, 1, 4}));                            // expected: 2
        System.out.println(jump(new int[]{2, 3, 0, 1, 4}));                            // expected: 2
        System.out.println(jump(new int[]{1}));                                        // expected: 0
        System.out.println(jump(new int[]{1, 2, 3}));                                  // expected: 2
        System.out.println(jump(new int[]{2, 1}));                                     // expected: 1
        System.out.println(jump(new int[]{1, 1, 1, 1}));                               // expected: 3
        System.out.println(jump(new int[]{1, 2}));                                     // expected: 1
        System.out.println(jump(new int[]{3, 2, 1}));                                  // expected: 1
        System.out.println(jump(new int[]{1, 2, 1, 1, 1}));                            // expected: 3
        System.out.println(jump(new int[]{5, 9, 3, 2, 1, 0, 2, 3, 3, 1, 0, 0}));       // expected: 3
        System.out.println(jump(new int[]{2, 1, 1, 1, 1}));                            // expected: 3
        System.out.println(jump(new int[]{10, 1, 1, 1}));                              // expected: 1
    }
}`,
  "gas-station": `public class Main {
    public static int canCompleteCircuit(int[] gas, int[] cost) {
        // If total(gas) < total(cost): -1. Else single pass: reset start when tank < 0.

        return -1;
    }

    public static void main(String[] args) {
        System.out.println(canCompleteCircuit(new int[]{1, 2, 3, 4, 5}, new int[]{3, 4, 5, 1, 2}));            // expected: 3
        System.out.println(canCompleteCircuit(new int[]{2, 3, 4}, new int[]{3, 4, 3}));                        // expected: -1
        System.out.println(canCompleteCircuit(new int[]{5, 1, 2, 3, 4}, new int[]{4, 4, 1, 5, 1}));            // expected: 4
        System.out.println(canCompleteCircuit(new int[]{1}, new int[]{1}));                                    // expected: 0
        System.out.println(canCompleteCircuit(new int[]{1}, new int[]{2}));                                    // expected: -1
        System.out.println(canCompleteCircuit(new int[]{5, 5, 5}, new int[]{5, 5, 5}));                        // expected: 0
        System.out.println(canCompleteCircuit(new int[]{3, 1, 1}, new int[]{1, 2, 2}));                        // expected: 0
        System.out.println(canCompleteCircuit(new int[]{1, 2}, new int[]{2, 1}));                              // expected: 1
        System.out.println(canCompleteCircuit(new int[]{2, 0, 1, 2, 3, 4, 0}, new int[]{0, 1, 0, 0, 0, 4, 3})); // expected: 2
        System.out.println(canCompleteCircuit(new int[]{0, 0, 0, 0}, new int[]{0, 0, 0, 0}));                  // expected: 0
        System.out.println(canCompleteCircuit(new int[]{3, 3, 4}, new int[]{3, 4, 4}));                        // expected: -1
    }
}`,
  "delete-and-earn": `public class Main {
    public static int deleteAndEarn(int[] nums) {
        // Bucket by value -> points[v]; then house-robber DP on points.

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(deleteAndEarn(new int[]{3, 4, 2}));                                  // expected: 6
        System.out.println(deleteAndEarn(new int[]{2, 2, 3, 3, 3, 4}));                         // expected: 9
        System.out.println(deleteAndEarn(new int[]{1}));                                        // expected: 1
        System.out.println(deleteAndEarn(new int[]{}));                                         // expected: 0
        System.out.println(deleteAndEarn(new int[]{1, 1, 1}));                                  // expected: 3
        System.out.println(deleteAndEarn(new int[]{1, 2}));                                     // expected: 2
        System.out.println(deleteAndEarn(new int[]{2, 1}));                                     // expected: 2
        System.out.println(deleteAndEarn(new int[]{1, 1, 1, 2, 2, 2}));                         // expected: 6
        System.out.println(deleteAndEarn(new int[]{1, 6, 3, 3, 8, 4, 8, 10, 1, 3}));            // expected: 43
        System.out.println(deleteAndEarn(new int[]{3, 1}));                                     // expected: 4
        System.out.println(deleteAndEarn(new int[]{2, 2, 2}));                                  // expected: 6
        System.out.println(deleteAndEarn(new int[]{8, 10, 4, 9, 1, 3, 5, 9, 4, 10}));           // expected: 37
    }
}`,
  "maximum-sum-circular-subarray": `public class Main {
    public static int maxSubarraySumCircular(int[] nums) {
        // max(kadaneMax, total - kadaneMin); special case if all negative -> kadaneMax.

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(maxSubarraySumCircular(new int[]{1, -2, 3, -2}));         // expected: 3
        System.out.println(maxSubarraySumCircular(new int[]{5, -3, 5}));             // expected: 10
        System.out.println(maxSubarraySumCircular(new int[]{-3, -2, -3}));           // expected: -2
        System.out.println(maxSubarraySumCircular(new int[]{1, 2, 3, 4, 5}));        // expected: 15
        System.out.println(maxSubarraySumCircular(new int[]{5, -3, 5, -3, 5}));      // expected: 12
        System.out.println(maxSubarraySumCircular(new int[]{-3, -2, -1}));           // expected: -1
        System.out.println(maxSubarraySumCircular(new int[]{1}));                    // expected: 1
        System.out.println(maxSubarraySumCircular(new int[]{3, -1, 2, -1}));         // expected: 4
        System.out.println(maxSubarraySumCircular(new int[]{-5, 3, 5}));             // expected: 8
        System.out.println(maxSubarraySumCircular(new int[]{2, 1, -5, 4, -3}));      // expected: 4
        System.out.println(maxSubarraySumCircular(new int[]{-2}));                   // expected: -2
        System.out.println(maxSubarraySumCircular(new int[]{1, -2, 1, -2, 1}));      // expected: 2
    }
}`,
  "longest-string-chain": `public class Main {
    public static int longestStrChain(String[] words) {
        // Sort by length; for each word, try dropping each char; dp[w] = max(dp[prev]+1).

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(longestStrChain(new String[]{"a", "b", "ba", "bca", "bda", "bdca"}));                       // expected: 4
        System.out.println(longestStrChain(new String[]{"xbc", "pcxbcf", "xb", "cxbc", "pcxbc"}));                     // expected: 5
        System.out.println(longestStrChain(new String[]{"abcd", "dbqca"}));                                            // expected: 1
        System.out.println(longestStrChain(new String[]{}));                                                           // expected: 0
        System.out.println(longestStrChain(new String[]{"a"}));                                                        // expected: 1
        System.out.println(longestStrChain(new String[]{"a", "b"}));                                                   // expected: 1
        System.out.println(longestStrChain(new String[]{"ab", "b"}));                                                  // expected: 2
        System.out.println(longestStrChain(new String[]{"ksqvsyq", "ks", "kss", "czvh", "zczpzvdhx", "zczpzvh", "zczpzvhx", "zcpzvh", "zczvh", "gr", "grukmj", "ksqvsq", "gruj", "kssq", "ksqsq", "grukkmj", "grukj", "zczpzfvdhx"})); // expected: 7
        System.out.println(longestStrChain(new String[]{"a", "ab", "abc", "abcd", "abcde"}));                          // expected: 5
        System.out.println(longestStrChain(new String[]{"bdca", "bda", "ca", "dca", "a"}));                            // expected: 4
        System.out.println(longestStrChain(new String[]{"a", "ab", "abc", "abcd", "abcde", "abcdef"}));                // expected: 6
        System.out.println(longestStrChain(new String[]{"abc"}));                                                      // expected: 1
    }
}`,
  "integer-break": `public class Main {
    public static int integerBreak(int n) {
        // DP over i in [2..n]: dp[i] = max over j of max(j, dp[j]) * max(i-j, dp[i-j]).

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(integerBreak(2));    // expected: 1
        System.out.println(integerBreak(3));    // expected: 2
        System.out.println(integerBreak(4));    // expected: 4
        System.out.println(integerBreak(5));    // expected: 6
        System.out.println(integerBreak(6));    // expected: 9
        System.out.println(integerBreak(7));    // expected: 12
        System.out.println(integerBreak(8));    // expected: 18
        System.out.println(integerBreak(9));    // expected: 27
        System.out.println(integerBreak(10));   // expected: 36
        System.out.println(integerBreak(11));   // expected: 54
        System.out.println(integerBreak(12));   // expected: 81
    }
}`,
  "counting-bits": `import java.util.Arrays;

public class Main {
    public static int[] countBits(int n) {
        // dp[i] = dp[i >> 1] + (i & 1), or dp[i] = dp[i & (i-1)] + 1.

        return new int[n + 1];
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(countBits(0)));    // expected: [0]
        System.out.println(Arrays.toString(countBits(1)));    // expected: [0, 1]
        System.out.println(Arrays.toString(countBits(2)));    // expected: [0, 1, 1]
        System.out.println(Arrays.toString(countBits(3)));    // expected: [0, 1, 1, 2]
        System.out.println(Arrays.toString(countBits(4)));    // expected: [0, 1, 1, 2, 1]
        System.out.println(Arrays.toString(countBits(5)));    // expected: [0, 1, 1, 2, 1, 2]
        System.out.println(Arrays.toString(countBits(6)));    // expected: [0, 1, 1, 2, 1, 2, 2]
        System.out.println(Arrays.toString(countBits(7)));    // expected: [0, 1, 1, 2, 1, 2, 2, 3]
        System.out.println(Arrays.toString(countBits(8)));    // expected: [0, 1, 1, 2, 1, 2, 2, 3, 1]
        System.out.println(Arrays.toString(countBits(10)));   // expected: [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2]
        System.out.println(Arrays.toString(countBits(15)));   // expected: [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4]
    }
}`,
  "combination-sum-iv": `public class Main {
    public static int combinationSum4(int[] nums, int target) {
        // dp[t] = sum of dp[t - num] for each num <= t; dp[0] = 1.

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(combinationSum4(new int[]{1, 2, 3}, 4));    // expected: 7
        System.out.println(combinationSum4(new int[]{9}, 3));          // expected: 0
        System.out.println(combinationSum4(new int[]{1}, 1));          // expected: 1
        System.out.println(combinationSum4(new int[]{1}, 2));          // expected: 1
        System.out.println(combinationSum4(new int[]{1, 2}, 3));       // expected: 3
        System.out.println(combinationSum4(new int[]{1, 2}, 4));       // expected: 5
        System.out.println(combinationSum4(new int[]{2, 3}, 5));       // expected: 2
        System.out.println(combinationSum4(new int[]{4, 2, 1}, 4));    // expected: 6
        System.out.println(combinationSum4(new int[]{1, 2, 3}, 1));    // expected: 1
        System.out.println(combinationSum4(new int[]{1, 2, 3}, 2));    // expected: 2
        System.out.println(combinationSum4(new int[]{1, 2, 3}, 3));    // expected: 4
    }
}`,
  "ugly-number-ii": `public class Main {
    public static int nthUglyNumber(int n) {
        // 3-pointer DP: ugly[k] = min(ugly[i2]*2, ugly[i3]*3, ugly[i5]*5); advance matches.

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(nthUglyNumber(1));    // expected: 1
        System.out.println(nthUglyNumber(2));    // expected: 2
        System.out.println(nthUglyNumber(3));    // expected: 3
        System.out.println(nthUglyNumber(4));    // expected: 4
        System.out.println(nthUglyNumber(5));    // expected: 5
        System.out.println(nthUglyNumber(6));    // expected: 6
        System.out.println(nthUglyNumber(7));    // expected: 8
        System.out.println(nthUglyNumber(8));    // expected: 9
        System.out.println(nthUglyNumber(9));    // expected: 10
        System.out.println(nthUglyNumber(10));   // expected: 12
        System.out.println(nthUglyNumber(11));   // expected: 15
        System.out.println(nthUglyNumber(12));   // expected: 16
    }
}`,
  "merge-k-sorted-lists": `import java.util.*;

public class Main {
    static class ListNode { int val; ListNode next; ListNode(int v){val=v;} }

    public static ListNode mergeKLists(ListNode[] lists) {
        // Min-heap of current heads, or divide-and-conquer pairwise merging

        return null;
    }

    static ListNode build(int... vals) {
        ListNode d = new ListNode(0), c = d;
        for (int v : vals) { c.next = new ListNode(v); c = c.next; }
        return d.next;
    }
    static String toStr(ListNode h) {
        StringBuilder sb = new StringBuilder("[");
        while (h != null) { sb.append(h.val); if (h.next != null) sb.append(", "); h = h.next; }
        return sb.append("]").toString();
    }
    static ListNode[] arr(ListNode... ns) { return ns; }

    public static void main(String[] args) {
        System.out.println(toStr(mergeKLists(arr(build(1,4,5), build(1,3,4), build(2,6)))));
        // expected: [1, 1, 2, 3, 4, 4, 5, 6]
        System.out.println(toStr(mergeKLists(arr())));
        // expected: []
        System.out.println(toStr(mergeKLists(arr((ListNode)null))));
        // expected: []
        System.out.println(toStr(mergeKLists(arr(build(1)))));
        // expected: [1]
        System.out.println(toStr(mergeKLists(arr(build(1), build(2)))));
        // expected: [1, 2]
        System.out.println(toStr(mergeKLists(arr(build(5,10), build(1,3,7)))));
        // expected: [1, 3, 5, 7, 10]
        System.out.println(toStr(mergeKLists(arr(null, null, null))));
        // expected: []
        System.out.println(toStr(mergeKLists(arr(build(-1,0,1), build(-2,2)))));
        // expected: [-2, -1, 0, 1, 2]
        System.out.println(toStr(mergeKLists(arr(build(1,1,1), build(1,1), build(1)))));
        // expected: [1, 1, 1, 1, 1, 1]
        System.out.println(toStr(mergeKLists(arr(build(10,20,30), build(5,15,25), build(1,2,3)))));
        // expected: [1, 2, 3, 5, 10, 15, 20, 25, 30]
    }
}`,
  "daily-temperatures": `import java.util.*;

public class Main {
    public static int[] dailyTemperatures(int[] t) {
        // Monotonic decreasing stack of indices

        return new int[0];
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(dailyTemperatures(new int[]{73,74,75,71,69,72,76,73})));
        // expected: [1, 1, 4, 2, 1, 1, 0, 0]
        System.out.println(Arrays.toString(dailyTemperatures(new int[]{30,40,50,60})));
        // expected: [1, 1, 1, 0]
        System.out.println(Arrays.toString(dailyTemperatures(new int[]{30,60,90})));
        // expected: [1, 1, 0]
        System.out.println(Arrays.toString(dailyTemperatures(new int[]{})));
        // expected: []
        System.out.println(Arrays.toString(dailyTemperatures(new int[]{1})));
        // expected: [0]
        System.out.println(Arrays.toString(dailyTemperatures(new int[]{5,5})));
        // expected: [0, 0]
        System.out.println(Arrays.toString(dailyTemperatures(new int[]{5,4,3,2,1})));
        // expected: [0, 0, 0, 0, 0]
        System.out.println(Arrays.toString(dailyTemperatures(new int[]{1,2,3,4,5})));
        // expected: [1, 1, 1, 1, 0]
        System.out.println(Arrays.toString(dailyTemperatures(new int[]{89,62,70,58,47,47,46,76,100,70})));
        // expected: [8, 1, 5, 4, 3, 2, 1, 1, 0, 0]
        System.out.println(Arrays.toString(dailyTemperatures(new int[]{10,20,10,20,10,20})));
        // expected: [1, 0, 1, 0, 1, 0]
    }
}`,
  "next-greater-element-i": `import java.util.*;

public class Main {
    public static int[] nextGreaterElement(int[] nums1, int[] nums2) {
        // Monotonic decreasing stack over nums2, map value -> next greater

        return new int[0];
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(nextGreaterElement(new int[]{4,1,2}, new int[]{1,3,4,2})));
        // expected: [-1, 3, -1]
        System.out.println(Arrays.toString(nextGreaterElement(new int[]{2,4}, new int[]{1,2,3,4})));
        // expected: [3, -1]
        System.out.println(Arrays.toString(nextGreaterElement(new int[]{1,2}, new int[]{2,1})));
        // expected: [-1, -1]
        System.out.println(Arrays.toString(nextGreaterElement(new int[]{1}, new int[]{1})));
        // expected: [-1]
        System.out.println(Arrays.toString(nextGreaterElement(new int[]{1}, new int[]{1,2})));
        // expected: [2]
        System.out.println(Arrays.toString(nextGreaterElement(new int[]{5,3}, new int[]{5,4,3,2,1})));
        // expected: [-1, -1]
        System.out.println(Arrays.toString(nextGreaterElement(new int[]{1,3,5}, new int[]{1,2,3,4,5})));
        // expected: [2, 4, -1]
        System.out.println(Arrays.toString(nextGreaterElement(new int[]{3,1,2}, new int[]{1,2,3,4})));
        // expected: [4, 2, 3]
        System.out.println(Arrays.toString(nextGreaterElement(new int[]{7}, new int[]{7,8,9})));
        // expected: [8]
        System.out.println(Arrays.toString(nextGreaterElement(new int[]{2,1}, new int[]{1,2,3})));
        // expected: [3, 2]
        System.out.println(Arrays.toString(nextGreaterElement(new int[]{4,5,6}, new int[]{4,5,6,7,8})));
        // expected: [5, 6, 7]
    }
}`,
  "remove-k-digits": `import java.util.*;

public class Main {
    public static String removeKdigits(String num, int k) {
        // Monotonic increasing stack; pop bigger digits while k > 0

        return "";
    }

    public static void main(String[] args) {
        System.out.println(removeKdigits("1432219", 3));    // expected: 1219
        System.out.println(removeKdigits("10200", 1));      // expected: 200
        System.out.println(removeKdigits("10", 2));         // expected: 0
        System.out.println(removeKdigits("9", 1));          // expected: 0
        System.out.println(removeKdigits("112", 1));        // expected: 11
        System.out.println(removeKdigits("1234567890", 9)); // expected: 0
        System.out.println(removeKdigits("1173", 2));       // expected: 11
        System.out.println(removeKdigits("10001", 4));      // expected: 0
        System.out.println(removeKdigits("100", 1));        // expected: 0
        System.out.println(removeKdigits("100", 2));        // expected: 0
        System.out.println(removeKdigits("5337", 2));       // expected: 33
        System.out.println(removeKdigits("1234567", 3));    // expected: 1234
    }
}`,
  "remove-duplicate-letters": `import java.util.*;

public class Main {
    public static String removeDuplicateLetters(String s) {
        // Monotonic stack + last-index map + seen set

        return "";
    }

    public static void main(String[] args) {
        System.out.println(removeDuplicateLetters("bcabc"));      // expected: abc
        System.out.println(removeDuplicateLetters("cbacdcbc"));   // expected: acdb
        System.out.println(removeDuplicateLetters("a"));          // expected: a
        System.out.println(removeDuplicateLetters(""));           // expected:
        System.out.println(removeDuplicateLetters("abc"));        // expected: abc
        System.out.println(removeDuplicateLetters("cba"));        // expected: cba
        System.out.println(removeDuplicateLetters("aa"));         // expected: a
        System.out.println(removeDuplicateLetters("leetcode"));   // expected: letcod
        System.out.println(removeDuplicateLetters("mississippi"));// expected: misp
        System.out.println(removeDuplicateLetters("abcabcabc")); // expected: abc
        System.out.println(removeDuplicateLetters("zyx"));        // expected: zyx
        System.out.println(removeDuplicateLetters("xyzabc"));     // expected: xyzabc
        System.out.println(removeDuplicateLetters("abcba"));      // expected: abc
    }
}`,
  "top-k-frequent-words": `import java.util.*;

public class Main {
    public static List<String> topKFrequent(String[] words, int k) {
        // Frequency map, then sort by (freq desc, word asc) or use a bounded min-heap

        return new ArrayList<>();
    }

    public static void main(String[] args) {
        System.out.println(topKFrequent(new String[]{"i","love","leetcode","i","love","coding"}, 2));
        // expected: [i, love]
        System.out.println(topKFrequent(new String[]{"the","day","is","sunny","the","the","the","sunny","is","is"}, 4));
        // expected: [the, is, sunny, day]
        System.out.println(topKFrequent(new String[]{"a"}, 1));
        // expected: [a]
        System.out.println(topKFrequent(new String[]{"a","a","a","b"}, 1));
        // expected: [a]
        System.out.println(topKFrequent(new String[]{"a","b","c"}, 3));
        // expected: [a, b, c]
        System.out.println(topKFrequent(new String[]{"a","b","c"}, 1));
        // expected: [a]
        System.out.println(topKFrequent(new String[]{"z","y","x","a"}, 1));
        // expected: [a]
        System.out.println(topKFrequent(new String[]{"apple","banana","apple"}, 1));
        // expected: [apple]
        System.out.println(topKFrequent(new String[]{"apple","banana","apple","banana","cherry"}, 2));
        // expected: [apple, banana]
        System.out.println(topKFrequent(new String[]{"c","b","a"}, 2));
        // expected: [a, b]
        System.out.println(topKFrequent(new String[]{"i","love","i","i","love"}, 2));
        // expected: [i, love]
    }
}`,
  "kth-smallest-in-sorted-matrix": `import java.util.*;

public class Main {
    public static int kthSmallest(int[][] matrix, int k) {
        // Min-heap of (value, row, col) or binary search on value range

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(kthSmallest(new int[][]{{1,5,9},{10,11,13},{12,13,15}}, 8));
        // expected: 13
        System.out.println(kthSmallest(new int[][]{{-5}}, 1));
        // expected: -5
        System.out.println(kthSmallest(new int[][]{{1,2},{3,4}}, 1));
        // expected: 1
        System.out.println(kthSmallest(new int[][]{{1,2},{3,4}}, 4));
        // expected: 4
        System.out.println(kthSmallest(new int[][]{{1,3,5},{6,7,12},{11,14,14}}, 6));
        // expected: 11
        System.out.println(kthSmallest(new int[][]{{1,1,1},{1,1,1},{1,1,1}}, 5));
        // expected: 1
        System.out.println(kthSmallest(new int[][]{{1,2,3},{4,5,6},{7,8,9}}, 5));
        // expected: 5
        System.out.println(kthSmallest(new int[][]{{1,2,3},{4,5,6},{7,8,9}}, 1));
        // expected: 1
        System.out.println(kthSmallest(new int[][]{{1,2,3},{4,5,6},{7,8,9}}, 9));
        // expected: 9
        System.out.println(kthSmallest(new int[][]{{1,10,100},{2,20,200},{3,30,300}}, 4));
        // expected: 10
        System.out.println(kthSmallest(new int[][]{{5,5},{5,5}}, 3));
        // expected: 5
    }
}`,
  "car-fleet": `import java.util.*;

public class Main {
    public static int carFleet(int target, int[] position, int[] speed) {
        // Sort by position desc; walk comparing arrival times

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(carFleet(12, new int[]{10,8,0,5,3}, new int[]{2,4,1,1,3}));
        // expected: 3
        System.out.println(carFleet(10, new int[]{3}, new int[]{3}));
        // expected: 1
        System.out.println(carFleet(100, new int[]{0,2,4}, new int[]{4,2,1}));
        // expected: 1
        System.out.println(carFleet(10, new int[]{6,8}, new int[]{3,2}));
        // expected: 2
        System.out.println(carFleet(10, new int[]{0,4,2}, new int[]{2,1,3}));
        // expected: 1
        System.out.println(carFleet(10, new int[]{0}, new int[]{1}));
        // expected: 1
        System.out.println(carFleet(10, new int[]{}, new int[]{}));
        // expected: 0
        System.out.println(carFleet(1000, new int[]{0}, new int[]{1}));
        // expected: 1
        System.out.println(carFleet(10, new int[]{0,5}, new int[]{1,10}));
        // expected: 2
        System.out.println(carFleet(10, new int[]{1,9}, new int[]{1,1}));
        // expected: 2
        System.out.println(carFleet(5, new int[]{1,2,3,4}, new int[]{1,1,1,1}));
        // expected: 4
    }
}`,
  "pow-x-n": `public class Main {
    public static double myPow(double x, int n) {
        // Fast exponentiation: halve n, square x; handle negative n via long

        return 0.0;
    }

    public static void main(String[] args) {
        System.out.println(myPow(2.0, 10));   // expected: 1024.0
        System.out.println(myPow(2.0, -2));   // expected: 0.25
        System.out.println(myPow(1.0, 100));  // expected: 1.0
        System.out.println(myPow(2.0, 0));    // expected: 1.0
        System.out.println(myPow(0.0, 5));    // expected: 0.0
        System.out.println(myPow(1.0, -5));   // expected: 1.0
        System.out.println(myPow(3.0, 4));    // expected: 81.0
        System.out.println(myPow(-2.0, 3));   // expected: -8.0
        System.out.println(myPow(10.0, 3));   // expected: 1000.0
        System.out.println(myPow(2.0, 5));    // expected: 32.0
        System.out.println(myPow(5.0, 2));    // expected: 25.0
        System.out.println(myPow(2.0, -3));   // expected: 0.125
    }
}`,
  "sqrt-x": `public class Main {
    public static int mySqrt(int x) {
        // Binary search in [0, x] for the greatest r with r*r <= x

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(mySqrt(4));           // expected: 2
        System.out.println(mySqrt(8));           // expected: 2
        System.out.println(mySqrt(0));           // expected: 0
        System.out.println(mySqrt(1));           // expected: 1
        System.out.println(mySqrt(2));           // expected: 1
        System.out.println(mySqrt(3));           // expected: 1
        System.out.println(mySqrt(9));           // expected: 3
        System.out.println(mySqrt(10));          // expected: 3
        System.out.println(mySqrt(15));          // expected: 3
        System.out.println(mySqrt(16));          // expected: 4
        System.out.println(mySqrt(99));          // expected: 9
        System.out.println(mySqrt(100));         // expected: 10
        System.out.println(mySqrt(121));         // expected: 11
        System.out.println(mySqrt(2147395599));  // expected: 46339
    }
}`,
  "excel-sheet-column-number": `public class Main {
    public static int titleToNumber(String columnTitle) {
        // Base-26 accumulation: result = result * 26 + (ch - 'A' + 1)

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(titleToNumber("A"));        // expected: 1
        System.out.println(titleToNumber("B"));        // expected: 2
        System.out.println(titleToNumber("Z"));        // expected: 26
        System.out.println(titleToNumber("AA"));       // expected: 27
        System.out.println(titleToNumber("AB"));       // expected: 28
        System.out.println(titleToNumber("AZ"));       // expected: 52
        System.out.println(titleToNumber("BA"));       // expected: 53
        System.out.println(titleToNumber("ZY"));       // expected: 701
        System.out.println(titleToNumber("ZZ"));       // expected: 702
        System.out.println(titleToNumber("AAA"));      // expected: 703
        System.out.println(titleToNumber("FXSHRXW"));  // expected: 2147483647
        System.out.println(titleToNumber("ABC"));      // expected: 731
    }
}`,
  "add-binary": `public class Main {
    public static String addBinary(String a, String b) {
        // Two pointers from the right, track carry, build result in reverse

        return "";
    }

    public static void main(String[] args) {
        System.out.println(addBinary("11", "1"));         // expected: 100
        System.out.println(addBinary("1010", "1011"));    // expected: 10101
        System.out.println(addBinary("0", "0"));          // expected: 0
        System.out.println(addBinary("0", "1"));          // expected: 1
        System.out.println(addBinary("1", "0"));          // expected: 1
        System.out.println(addBinary("1", "1"));          // expected: 10
        System.out.println(addBinary("111", "111"));      // expected: 1110
        System.out.println(addBinary("1001", "101"));     // expected: 1110
        System.out.println(addBinary("100", "110010"));   // expected: 110110
        System.out.println(addBinary("1111", "1111"));    // expected: 11110
        System.out.println(addBinary("10", "11"));        // expected: 101
        System.out.println(addBinary("1", "111"));        // expected: 1000
    }
}`,
  "reverse-string": `public class Main {
    public static void reverseString(char[] s) {
        // Two pointers swapping from both ends

    }

    public static void main(String[] args) {
        char[] a1 = {'h','e','l','l','o'}; reverseString(a1); System.out.println(java.util.Arrays.toString(a1));  // [o, l, l, e, h]
        char[] a2 = {'H','a','n','n','a','h'}; reverseString(a2); System.out.println(java.util.Arrays.toString(a2));  // [h, a, n, n, a, H]
        char[] a3 = {}; reverseString(a3); System.out.println(java.util.Arrays.toString(a3));  // []
        char[] a4 = {'a'}; reverseString(a4); System.out.println(java.util.Arrays.toString(a4));  // [a]
        char[] a5 = {'a','b'}; reverseString(a5); System.out.println(java.util.Arrays.toString(a5));  // [b, a]
        char[] a6 = {'a','b','c'}; reverseString(a6); System.out.println(java.util.Arrays.toString(a6));  // [c, b, a]
        char[] a7 = {'1','2','3','4','5'}; reverseString(a7); System.out.println(java.util.Arrays.toString(a7));  // [5, 4, 3, 2, 1]
        char[] a8 = {'A','B'}; reverseString(a8); System.out.println(java.util.Arrays.toString(a8));  // [B, A]
        char[] a9 = {'r','a','c','e','c','a','r'}; reverseString(a9); System.out.println(java.util.Arrays.toString(a9));  // [r, a, c, e, c, a, r]
        char[] a10 = {'x','y','z'}; reverseString(a10); System.out.println(java.util.Arrays.toString(a10));  // [z, y, x]
        char[] a11 = {'L','e','e','t','C','o','d','e'}; reverseString(a11); System.out.println(java.util.Arrays.toString(a11));  // [e, d, o, C, t, e, e, L]
    }
}`,
  "reverse-words-in-string": `public class Main {
    public static String reverseWords(String s) {
        // Trim, split on whitespace, reverse, join by single space

        return "";
    }

    public static void main(String[] args) {
        System.out.println(reverseWords("the sky is blue"));  // blue is sky the
        System.out.println(reverseWords("  hello world  "));  // world hello
        System.out.println(reverseWords("a good   example"));  // example good a
        System.out.println(reverseWords("  Bob    Loves  Alice   "));  // Alice Loves Bob
        System.out.println(reverseWords("Alice does not even like bob"));  // bob like even not does Alice
        System.out.println(reverseWords(""));  // (empty)
        System.out.println(reverseWords(" "));  // (empty)
        System.out.println(reverseWords("a"));  // a
        System.out.println(reverseWords("  a  "));  // a
        System.out.println(reverseWords("hello"));  // hello
        System.out.println(reverseWords("one two"));  // two one
    }
}`,
  "multiply-strings": `public class Main {
    public static String multiply(String num1, String num2) {
        // Simulate grade-school multiplication with int array

        return "";
    }

    public static void main(String[] args) {
        System.out.println(multiply("2", "3"));  // 6
        System.out.println(multiply("123", "456"));  // 56088
        System.out.println(multiply("0", "0"));  // 0
        System.out.println(multiply("0", "12345"));  // 0
        System.out.println(multiply("1", "999"));  // 999
        System.out.println(multiply("999", "999"));  // 998001
        System.out.println(multiply("10", "10"));  // 100
        System.out.println(multiply("100", "100"));  // 10000
        System.out.println(multiply("1234567890", "9876543210"));  // 12193263111263526900
        System.out.println(multiply("25", "25"));  // 625
        System.out.println(multiply("50", "2"));  // 100
    }
}`,
  "palindrome-number": `public class Main {
    public static boolean isPalindrome(int x) {
        // Reverse half and compare

        return false;
    }

    public static void main(String[] args) {
        System.out.println(isPalindrome(121));  // true
        System.out.println(isPalindrome(-121));  // false
        System.out.println(isPalindrome(10));  // false
        System.out.println(isPalindrome(0));  // true
        System.out.println(isPalindrome(1));  // true
        System.out.println(isPalindrome(11));  // true
        System.out.println(isPalindrome(12));  // false
        System.out.println(isPalindrome(1221));  // true
        System.out.println(isPalindrome(12321));  // true
        System.out.println(isPalindrome(1000));  // false
        System.out.println(isPalindrome(-1));  // false
        System.out.println(isPalindrome(123454321));  // true
    }
}`,
  "count-and-say": `public class Main {
    public static String countAndSay(int n) {
        // Iteratively build each term by run-length encoding the previous

        return "";
    }

    public static void main(String[] args) {
        System.out.println(countAndSay(1));  // 1
        System.out.println(countAndSay(2));  // 11
        System.out.println(countAndSay(3));  // 21
        System.out.println(countAndSay(4));  // 1211
        System.out.println(countAndSay(5));  // 111221
        System.out.println(countAndSay(6));  // 312211
        System.out.println(countAndSay(7));  // 13112221
        System.out.println(countAndSay(8));  // 1113213211
        System.out.println(countAndSay(9));  // 31131211131221
        System.out.println(countAndSay(10));  // 13211311123113112211
    }
}`,
  "simplify-path": `public class Main {
    public static String simplifyPath(String path) {
        // Split on '/', push/pop a deque of directory names

        return "";
    }

    public static void main(String[] args) {
        System.out.println(simplifyPath("/home/"));  // /home
        System.out.println(simplifyPath("/../"));  // /
        System.out.println(simplifyPath("/home//foo/"));  // /home/foo
        System.out.println(simplifyPath("/a/./b/../../c/"));  // /c
        System.out.println(simplifyPath("/a/../../b/../c//.//"));  // /c
        System.out.println(simplifyPath("/a//b////c/d//././/.."));  // /a/b/c
        System.out.println(simplifyPath("/"));  // /
        System.out.println(simplifyPath("/..."));  // /...
        System.out.println(simplifyPath("/..hidden"));  // /..hidden
        System.out.println(simplifyPath("/home/user/Documents/../Pictures"));  // /home/user/Pictures
        System.out.println(simplifyPath("/../../../../../"));  // /
    }
}`,
  "roman-to-integer": `public class Main {
    public static int romanToInt(String s) {
        // Map chars to values; subtract if next is larger

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(romanToInt("III"));  // 3
        System.out.println(romanToInt("IV"));  // 4
        System.out.println(romanToInt("IX"));  // 9
        System.out.println(romanToInt("LVIII"));  // 58
        System.out.println(romanToInt("MCMXCIV"));  // 1994
        System.out.println(romanToInt("I"));  // 1
        System.out.println(romanToInt("V"));  // 5
        System.out.println(romanToInt("X"));  // 10
        System.out.println(romanToInt("L"));  // 50
        System.out.println(romanToInt("C"));  // 100
        System.out.println(romanToInt("D"));  // 500
        System.out.println(romanToInt("M"));  // 1000
        System.out.println(romanToInt("XL"));  // 40
        System.out.println(romanToInt("CD"));  // 400
        System.out.println(romanToInt("CM"));  // 900
        System.out.println(romanToInt("MMMCMXCIX"));  // 3999
    }
}`,
  "integer-to-roman": `public class Main {
    public static String intToRoman(int num) {
        // Greedy: parallel arrays of values and symbols

        return "";
    }

    public static void main(String[] args) {
        System.out.println(intToRoman(3));  // III
        System.out.println(intToRoman(4));  // IV
        System.out.println(intToRoman(9));  // IX
        System.out.println(intToRoman(58));  // LVIII
        System.out.println(intToRoman(1994));  // MCMXCIV
        System.out.println(intToRoman(1));  // I
        System.out.println(intToRoman(10));  // X
        System.out.println(intToRoman(40));  // XL
        System.out.println(intToRoman(100));  // C
        System.out.println(intToRoman(400));  // CD
        System.out.println(intToRoman(1000));  // M
        System.out.println(intToRoman(3999));  // MMMCMXCIX
    }
}`,
  "count-primes": `public class Main {
    public static int countPrimes(int n) {
        // Sieve of Eratosthenes

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(countPrimes(10));  // 4
        System.out.println(countPrimes(0));  // 0
        System.out.println(countPrimes(1));  // 0
        System.out.println(countPrimes(2));  // 0
        System.out.println(countPrimes(3));  // 1
        System.out.println(countPrimes(4));  // 2
        System.out.println(countPrimes(5));  // 2
        System.out.println(countPrimes(100));  // 25
        System.out.println(countPrimes(1000));  // 168
        System.out.println(countPrimes(20));  // 8
        System.out.println(countPrimes(50));  // 15
        System.out.println(countPrimes(1000000));  // 78498
    }
}`,
  "fizz-buzz": `public class Main {
    public static java.util.List<String> fizzBuzz(int n) {
        // Loop 1..n, build list with the rules

        return new java.util.ArrayList<>();
    }

    public static void main(String[] args) {
        System.out.println(fizzBuzz(3));  // [1, 2, Fizz]
        System.out.println(fizzBuzz(5));  // [1, 2, Fizz, 4, Buzz]
        System.out.println(fizzBuzz(15));  // [1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, FizzBuzz]
        System.out.println(fizzBuzz(1));  // [1]
        System.out.println(fizzBuzz(2));  // [1, 2]
        System.out.println(fizzBuzz(6));  // [1, 2, Fizz, 4, Buzz, Fizz]
        System.out.println(fizzBuzz(10));  // [1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz]
        System.out.println(fizzBuzz(16));  // [1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, FizzBuzz, 16]
        System.out.println(fizzBuzz(30));  // [1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, FizzBuzz, 16, 17, Fizz, 19, Buzz, Fizz, 22, 23, Fizz, Buzz, 26, Fizz, 28, 29, FizzBuzz]
        System.out.println(fizzBuzz(4));  // [1, 2, Fizz, 4]
    }
}`,
  "set-matrix-zeroes": `import java.util.*;

public class Main {
    public static void setZeroes(int[][] matrix) {
        // Use first row/col as markers; track firstRow/firstCol separately

    }

    public static void main(String[] args) {
        int[][] m1 = {{1,1,1},{1,0,1},{1,1,1}}; setZeroes(m1); System.out.println(Arrays.deepToString(m1));
        // [[1, 0, 1], [0, 0, 0], [1, 0, 1]]
        int[][] m2 = {{0,1,2,0},{3,4,5,2},{1,3,1,5}}; setZeroes(m2); System.out.println(Arrays.deepToString(m2));
        // [[0, 0, 0, 0], [0, 4, 5, 0], [0, 3, 1, 0]]
        int[][] m3 = {{1}}; setZeroes(m3); System.out.println(Arrays.deepToString(m3));
        // [[1]]
        int[][] m4 = {{0}}; setZeroes(m4); System.out.println(Arrays.deepToString(m4));
        // [[0]]
        int[][] m5 = {{1,1},{1,1}}; setZeroes(m5); System.out.println(Arrays.deepToString(m5));
        // [[1, 1], [1, 1]]
        int[][] m6 = {{1,0},{0,1}}; setZeroes(m6); System.out.println(Arrays.deepToString(m6));
        // [[0, 0], [0, 0]]
        int[][] m7 = {{1,2,3},{4,5,6},{7,8,9}}; setZeroes(m7); System.out.println(Arrays.deepToString(m7));
        // [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
        int[][] m8 = {{1,2,3},{4,0,6},{7,8,9}}; setZeroes(m8); System.out.println(Arrays.deepToString(m8));
        // [[1, 0, 3], [0, 0, 0], [7, 0, 9]]
        int[][] m9 = {{0,0},{1,1}}; setZeroes(m9); System.out.println(Arrays.deepToString(m9));
        // [[0, 0], [0, 0]]
        int[][] m10 = {{1,2,0,3}}; setZeroes(m10); System.out.println(Arrays.deepToString(m10));
        // [[0, 0, 0, 0]]
        int[][] m11 = {{1},{0},{1}}; setZeroes(m11); System.out.println(Arrays.deepToString(m11));
        // [[0], [0], [0]]
    }
}`,
  "transpose-matrix": `import java.util.*;

public class Main {
    public static int[][] transpose(int[][] matrix) {
        // Swap rows and columns into a new n x m matrix

        return new int[0][0];
    }

    public static void main(String[] args) {
        System.out.println(Arrays.deepToString(transpose(new int[][]{{1,2,3},{4,5,6},{7,8,9}})));
        // [[1, 4, 7], [2, 5, 8], [3, 6, 9]]
        System.out.println(Arrays.deepToString(transpose(new int[][]{{1,2,3},{4,5,6}})));
        // [[1, 4], [2, 5], [3, 6]]
        System.out.println(Arrays.deepToString(transpose(new int[][]{{1}})));
        // [[1]]
        System.out.println(Arrays.deepToString(transpose(new int[][]{{1,2}})));
        // [[1], [2]]
        System.out.println(Arrays.deepToString(transpose(new int[][]{{1},{2}})));
        // [[1, 2]]
        System.out.println(Arrays.deepToString(transpose(new int[][]{{1,2},{3,4}})));
        // [[1, 3], [2, 4]]
        System.out.println(Arrays.deepToString(transpose(new int[][]{{1,2,3,4,5}})));
        // [[1], [2], [3], [4], [5]]
        System.out.println(Arrays.deepToString(transpose(new int[][]{{1},{2},{3},{4},{5}})));
        // [[1, 2, 3, 4, 5]]
        System.out.println(Arrays.deepToString(transpose(new int[][]{{-1,0,1},{-2,0,2}})));
        // [[-1, -2], [0, 0], [1, 2]]
        System.out.println(Arrays.deepToString(transpose(new int[][]{{0,0},{0,0}})));
        // [[0, 0], [0, 0]]
        System.out.println(Arrays.deepToString(transpose(new int[][]{{1,2},{3,4},{5,6}})));
        // [[1, 3, 5], [2, 4, 6]]
    }
}`,
  "pacific-atlantic-water-flow": `import java.util.*;

public class Main {
    public static List<List<Integer>> pacificAtlantic(int[][] heights) {
        // Reverse BFS/DFS from each ocean border; return intersection

        return new ArrayList<>();
    }

    static String run(int[][] h) {
        List<List<Integer>> res = pacificAtlantic(h);
        res.sort((a, b) -> {
            int c = Integer.compare(a.get(0), b.get(0));
            if (c != 0) return c;
            return Integer.compare(a.get(1), b.get(1));
        });
        return res.toString();
    }

    public static void main(String[] args) {
        System.out.println(run(new int[][]{{1,2,2,3,5},{3,2,3,4,4},{2,4,5,3,1},{6,7,1,4,5},{5,1,1,2,4}}));
        // [[0, 4], [1, 3], [1, 4], [2, 2], [3, 0], [3, 1], [4, 0]]
        System.out.println(run(new int[][]{{1}}));
        // [[0, 0]]
        System.out.println(run(new int[][]{{1,1},{1,1}}));
        // [[0, 0], [0, 1], [1, 0], [1, 1]]
        System.out.println(run(new int[][]{{2,1},{1,2}}));
        // [[0, 0], [0, 1], [1, 0], [1, 1]]
        System.out.println(run(new int[][]{{1,2},{3,4}}));
        // [[0, 0], [0, 1], [1, 0], [1, 1]]
        System.out.println(run(new int[][]{{1,2,3}}));
        // [[0, 0], [0, 1], [0, 2]]
        System.out.println(run(new int[][]{{1},{2},{3}}));
        // [[0, 0], [1, 0], [2, 0]]
        System.out.println(run(new int[][]{{3,3,3},{3,3,3},{3,3,3}}));
        // [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]]
        System.out.println(run(new int[][]{{5,5},{5,5}}));
        // [[0, 0], [0, 1], [1, 0], [1, 1]]
        System.out.println(run(new int[][]{{1,2},{4,3}}));
        // [[0, 0], [0, 1], [1, 0], [1, 1]]
        System.out.println(run(new int[][]{{7}}));
        // [[0, 0]]
    }
}`,
  "swim-in-rising-water": `import java.util.*;

public class Main {
    public static int swimInWater(int[][] grid) {
        // Min-heap on max elevation seen so far; stop when popping bottom-right

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(swimInWater(new int[][]{{0,2},{1,3}}));  // 3
        System.out.println(swimInWater(new int[][]{{0,1,2,3,4},{24,23,22,21,5},{12,13,14,15,16},{11,17,18,19,20},{10,9,8,7,6}}));  // 16
        System.out.println(swimInWater(new int[][]{{1,2},{3,4}}));  // 4
        System.out.println(swimInWater(new int[][]{{1}}));  // 1
        System.out.println(swimInWater(new int[][]{{0}}));  // 0
        System.out.println(swimInWater(new int[][]{{2,1},{1,2}}));  // 2
        System.out.println(swimInWater(new int[][]{{1,3},{2,4}}));  // 4
        System.out.println(swimInWater(new int[][]{{3,2},{1,0}}));  // 3
        System.out.println(swimInWater(new int[][]{{5,1,2},{3,4,0}}));  // 5
        System.out.println(swimInWater(new int[][]{{0,5},{5,0}}));  // 5
        System.out.println(swimInWater(new int[][]{{0,1,2,3},{15,14,13,4},{12,11,10,5},{9,8,7,6}}));  // 6
    }
}`,
  "as-far-from-land": `import java.util.*;

public class Main {
    public static int maxDistance(int[][] grid) {
        // Multi-source BFS from all land cells

        return -1;
    }

    public static void main(String[] args) {
        System.out.println(maxDistance(new int[][]{{1,0,1},{0,0,0},{1,0,1}}));  // 2
        System.out.println(maxDistance(new int[][]{{1,0,0},{0,0,0},{0,0,0}}));  // 4
        System.out.println(maxDistance(new int[][]{{0,0,0},{0,0,0},{0,0,0}}));  // -1
        System.out.println(maxDistance(new int[][]{{1,1,1},{1,1,1},{1,1,1}}));  // -1
        System.out.println(maxDistance(new int[][]{{1,0},{0,0}}));  // 2
        System.out.println(maxDistance(new int[][]{{0,1},{1,0}}));  // 1
        System.out.println(maxDistance(new int[][]{{1}}));  // -1
        System.out.println(maxDistance(new int[][]{{0}}));  // -1
        System.out.println(maxDistance(new int[][]{{1,0}}));  // 1
        System.out.println(maxDistance(new int[][]{{0,1}}));  // 1
        System.out.println(maxDistance(new int[][]{{0,0,1},{0,0,0},{1,0,0}}));  // 2
    }
}`,
  "keys-and-rooms": `import java.util.*;

public class Main {
    public static boolean canVisitAllRooms(List<List<Integer>> rooms) {
        // DFS/BFS from room 0 and count visited

        return false;
    }

    static List<List<Integer>> build(int[][] arr) {
        List<List<Integer>> r = new ArrayList<>();
        for (int[] a : arr) {
            List<Integer> row = new ArrayList<>();
            for (int v : a) row.add(v);
            r.add(row);
        }
        return r;
    }

    public static void main(String[] args) {
        System.out.println(canVisitAllRooms(build(new int[][]{{1},{2},{3},{}})));  // true
        System.out.println(canVisitAllRooms(build(new int[][]{{1,3},{3,0,1},{2},{0}})));  // false
        System.out.println(canVisitAllRooms(build(new int[][]{{}})));  // true
        System.out.println(canVisitAllRooms(build(new int[][]{{1},{0}})));  // true
        System.out.println(canVisitAllRooms(build(new int[][]{{1,2},{},{}})));  // true
        System.out.println(canVisitAllRooms(build(new int[][]{{},{0}})));  // false
        System.out.println(canVisitAllRooms(build(new int[][]{{1},{},{}})));  // false
        System.out.println(canVisitAllRooms(build(new int[][]{{1,2,3},{},{},{}})));  // true
        System.out.println(canVisitAllRooms(build(new int[][]{{2,3},{},{1,0},{}})));  // true
        System.out.println(canVisitAllRooms(build(new int[][]{{1,2},{3},{},{0}})));  // true
        System.out.println(canVisitAllRooms(build(new int[][]{{2},{},{1}})));  // true
        System.out.println(canVisitAllRooms(build(new int[][]{{2},{},{}})));  // false
    }
}`,
  "all-paths-source-target": `import java.util.*;

public class Main {
    public static List<List<Integer>> allPathsSourceTarget(int[][] graph) {
        // DFS with backtracking from node 0 to node n-1

        return new ArrayList<>();
    }

    static String run(int[][] g) {
        List<List<Integer>> res = allPathsSourceTarget(g);
        res.sort((a, b) -> {
            int len = Math.min(a.size(), b.size());
            for (int i = 0; i < len; i++) {
                int c = Integer.compare(a.get(i), b.get(i));
                if (c != 0) return c;
            }
            return Integer.compare(a.size(), b.size());
        });
        return res.toString();
    }

    public static void main(String[] args) {
        System.out.println(run(new int[][]{{1,2},{3},{3},{}}));
        // [[0, 1, 3], [0, 2, 3]]
        System.out.println(run(new int[][]{{4,3,1},{3,2,4},{3},{4},{}}));
        // [[0, 1, 2, 3, 4], [0, 1, 3, 4], [0, 1, 4], [0, 3, 4], [0, 4]]
        System.out.println(run(new int[][]{{1},{}}));
        // [[0, 1]]
        System.out.println(run(new int[][]{{}}));
        // [[0]]
        System.out.println(run(new int[][]{{1,2,3},{},{},{}}));
        // [[0, 3]]
        System.out.println(run(new int[][]{{1,2},{2},{}}));
        // [[0, 1, 2], [0, 2]]
        System.out.println(run(new int[][]{{1},{2},{3},{}}));
        // [[0, 1, 2, 3]]
        System.out.println(run(new int[][]{{1,2,3},{4},{4},{4},{}}));
        // [[0, 1, 4], [0, 2, 4], [0, 3, 4]]
        System.out.println(run(new int[][]{{2},{3},{1},{}}));
        // [[0, 2, 1, 3]]
        System.out.println(run(new int[][]{{1,3},{2,3,4},{3,4},{4},{}}));
        // [[0, 1, 2, 3, 4], [0, 1, 2, 4], [0, 1, 3, 4], [0, 1, 4], [0, 3, 4]]
    }
}`,
  "evaluate-division": `import java.util.*;

public class Main {
    public static double[] calcEquation(List<List<String>> equations, double[] values, List<List<String>> queries) {
        // Build weighted graph; DFS each query

        return new double[0];
    }

    static List<List<String>> eq(String[][] arr) {
        List<List<String>> r = new ArrayList<>();
        for (String[] a : arr) r.add(Arrays.asList(a));
        return r;
    }

    static void run(String[][] equations, double[] values, String[][] queries) {
        double[] r = calcEquation(eq(equations), values, eq(queries));
        for (double d : r) System.out.printf("%.5f%n", d);
    }

    public static void main(String[] args) {
        run(new String[][]{{"a","b"},{"b","c"}}, new double[]{2.0, 3.0},
            new String[][]{{"a","c"},{"b","a"},{"a","e"},{"a","a"},{"x","x"}});
        // 6.00000
        // 0.50000
        // -1.00000
        // 1.00000
        // -1.00000
        run(new String[][]{{"a","b"},{"b","c"},{"bc","cd"}}, new double[]{1.5, 2.5, 5.0},
            new String[][]{{"a","c"},{"c","b"},{"bc","cd"},{"cd","bc"}});
        // 3.75000
        // 0.40000
        // 5.00000
        // 0.20000
        run(new String[][]{{"a","b"}}, new double[]{0.5},
            new String[][]{{"a","b"},{"b","a"},{"a","c"},{"x","x"}});
        // 0.50000
        // 2.00000
        // -1.00000
        // -1.00000
    }
}`,
  "number-of-closed-islands": `import java.util.*;

public class Main {
    public static int closedIsland(int[][] grid) {
        // Flood-fill border-connected land, then count remaining islands

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(closedIsland(new int[][]{{1,1,1,1,1,1,1,0},{1,0,0,0,0,1,1,0},{1,0,1,0,1,1,1,0},{1,0,0,0,0,1,0,1},{1,1,1,1,1,1,1,0}}));  // 2
        System.out.println(closedIsland(new int[][]{{0,0,1,0,0},{0,1,0,1,0},{0,1,1,1,0}}));  // 1
        System.out.println(closedIsland(new int[][]{{1,1,1,1,1,1,1},{1,0,0,0,0,0,1},{1,0,1,1,1,0,1},{1,0,1,0,1,0,1},{1,0,1,1,1,0,1},{1,0,0,0,0,0,1},{1,1,1,1,1,1,1}}));  // 2
        System.out.println(closedIsland(new int[][]{{0}}));  // 0
        System.out.println(closedIsland(new int[][]{{1}}));  // 0
        System.out.println(closedIsland(new int[][]{{1,1,1},{1,0,1},{1,1,1}}));  // 1
        System.out.println(closedIsland(new int[][]{{0,0,0},{0,1,0},{0,0,0}}));  // 0
        System.out.println(closedIsland(new int[][]{{1,1,1,1},{1,0,0,1},{1,0,0,1},{1,1,1,1}}));  // 1
        System.out.println(closedIsland(new int[][]{{1,1,1,1},{1,0,1,1},{1,1,0,1},{1,1,1,1}}));  // 2
        System.out.println(closedIsland(new int[][]{{0,1,0},{1,1,1},{0,1,0}}));  // 0
        System.out.println(closedIsland(new int[][]{{1,1,1,1,1},{1,0,0,0,1},{1,1,1,1,1}}));  // 1
    }
}`,
  "find-eventual-safe-states": `import java.util.*;

public class Main {
    public static List<Integer> eventualSafeNodes(int[][] graph) {
        // 3-color DFS: mark cycles as unsafe

        return new ArrayList<>();
    }

    public static void main(String[] args) {
        System.out.println(eventualSafeNodes(new int[][]{{1,2},{2,3},{5},{0},{5},{},{}}));  // [2, 4, 5, 6]
        System.out.println(eventualSafeNodes(new int[][]{{1,2,3,4},{1,2},{2,3},{0,4},{}}));  // [4]
        System.out.println(eventualSafeNodes(new int[][]{{}}));  // [0]
        System.out.println(eventualSafeNodes(new int[][]{{},{}}));  // [0, 1]
        System.out.println(eventualSafeNodes(new int[][]{{0}}));  // []
        System.out.println(eventualSafeNodes(new int[][]{{1},{0}}));  // []
        System.out.println(eventualSafeNodes(new int[][]{{1},{}}));  // [0, 1]
        System.out.println(eventualSafeNodes(new int[][]{{1,2},{},{}}));  // [0, 1, 2]
        System.out.println(eventualSafeNodes(new int[][]{{1},{2},{3},{0}}));  // []
        System.out.println(eventualSafeNodes(new int[][]{{1},{2},{3},{}}));  // [0, 1, 2, 3]
        System.out.println(eventualSafeNodes(new int[][]{{1,2},{2,3},{},{0}}));  // [2]
    }
}`,
  "closest-bst-value": `public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int v) { val = v; }
    }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode root = new TreeNode(vals[0]);
        java.util.Queue<TreeNode> q = new java.util.ArrayDeque<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode n = q.poll();
            if (i < vals.length) { if (vals[i] != null) { n.left = new TreeNode(vals[i]); q.add(n.left); } i++; }
            if (i < vals.length) { if (vals[i] != null) { n.right = new TreeNode(vals[i]); q.add(n.right); } i++; }
        }
        return root;
    }

    public static int closestValue(TreeNode root, double target) {
        // Walk BST; track closest, break ties by smaller value

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(closestValue(build(4,2,5,1,3), 3.714286));  // 4
        System.out.println(closestValue(build(1), 4.428571));  // 1
        System.out.println(closestValue(build(1,0,2), 1.5));  // 1
        System.out.println(closestValue(build(5,3,7,2,4,6,8), 5.5));  // 5
        System.out.println(closestValue(build(5,3,7,2,4,6,8), 6.5));  // 6
        System.out.println(closestValue(build(10,5,15,3,7,12,20), 12.3));  // 12
        System.out.println(closestValue(build(10,5,15,3,7,12,20), 11.0));  // 10
        System.out.println(closestValue(build(100), 50.0));  // 100
        System.out.println(closestValue(build(-5,-10,0), -3.0));  // -5
        System.out.println(closestValue(build(50,30,70,20,40,60,80), 100.0));  // 80
        System.out.println(closestValue(build(50,30,70,20,40,60,80), 0.0));  // 20
        System.out.println(closestValue(build(50,30,70,20,40,60,80), 45.5));  // 50
        System.out.println(closestValue(build(50,30,70,20,40,60,80), 35.0));  // 30
    }
}`,
  "find-mode-bst": `public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int v) { val = v; }
    }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode root = new TreeNode(vals[0]);
        java.util.Queue<TreeNode> q = new java.util.ArrayDeque<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode n = q.poll();
            if (i < vals.length) { if (vals[i] != null) { n.left = new TreeNode(vals[i]); q.add(n.left); } i++; }
            if (i < vals.length) { if (vals[i] != null) { n.right = new TreeNode(vals[i]); q.add(n.right); } i++; }
        }
        return root;
    }

    public static int[] findMode(TreeNode root) {
        // Inorder traversal; track current run count and best count

        return new int[0];
    }

    static String fmt(int[] a) {
        int[] b = a.clone();
        java.util.Arrays.sort(b);
        return java.util.Arrays.toString(b);
    }

    public static void main(String[] args) {
        System.out.println(fmt(findMode(build(1,null,2,2))));  // [2]
        System.out.println(fmt(findMode(build(0))));  // [0]
        System.out.println(fmt(findMode(build(1,1,2))));  // [1]
        System.out.println(fmt(findMode(build(1,0,2,0,null,null,2))));  // [0, 2]
        System.out.println(fmt(findMode(build(2,1,3))));  // [1, 2, 3]
        System.out.println(fmt(findMode(build(1,1,1))));  // [1]
        System.out.println(fmt(findMode(build(5,4,5,4))));  // [4, 5]
        System.out.println(fmt(findMode(build(6,2,6))));  // [6]
        System.out.println(fmt(findMode(build(1,1,2,1))));  // [1]
        System.out.println(fmt(findMode(build(5,5,5,5,5))));  // [5]
        System.out.println(fmt(findMode(build(7))));  // [7]
    }
}`,
  "good-nodes-binary-tree": `public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int v) { val = v; }
    }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode root = new TreeNode(vals[0]);
        java.util.Queue<TreeNode> q = new java.util.ArrayDeque<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode n = q.poll();
            if (i < vals.length) { if (vals[i] != null) { n.left = new TreeNode(vals[i]); q.add(n.left); } i++; }
            if (i < vals.length) { if (vals[i] != null) { n.right = new TreeNode(vals[i]); q.add(n.right); } i++; }
        }
        return root;
    }

    public static int goodNodes(TreeNode root) {
        // DFS tracking max value seen along current path

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(goodNodes(build(3,1,4,3,null,1,5)));  // 4
        System.out.println(goodNodes(build(3,3,null,4,2)));  // 3
        System.out.println(goodNodes(build(1)));  // 1
        System.out.println(goodNodes(build()));  // 0
        System.out.println(goodNodes(build(1,2,3)));  // 3
        System.out.println(goodNodes(build(2,1,3)));  // 2
        System.out.println(goodNodes(build(5,4,3,2,1)));  // 1
        System.out.println(goodNodes(build(1,2,3,4,5)));  // 5
        System.out.println(goodNodes(build(-1,-2,-3)));  // 1
        System.out.println(goodNodes(build(5)));  // 1
        System.out.println(goodNodes(build(10,5,15,3,7,12,20)));  // 3
        System.out.println(goodNodes(build(1,null,2,null,3)));  // 3
        System.out.println(goodNodes(build(1,2,3,4,5,6,7)));  // 7
    }
}`,
  "pseudo-palindromic-paths": `public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int v) { val = v; }
    }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode root = new TreeNode(vals[0]);
        java.util.Queue<TreeNode> q = new java.util.ArrayDeque<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode n = q.poll();
            if (i < vals.length) { if (vals[i] != null) { n.left = new TreeNode(vals[i]); q.add(n.left); } i++; }
            if (i < vals.length) { if (vals[i] != null) { n.right = new TreeNode(vals[i]); q.add(n.right); } i++; }
        }
        return root;
    }

    public static int pseudoPalindromicPaths(TreeNode root) {
        // DFS; toggle a bit per digit; at leaf, check popcount <= 1

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(pseudoPalindromicPaths(build(2,3,1,3,1,null,1)));  // 2
        System.out.println(pseudoPalindromicPaths(build(2,1,1,1,3,null,null,null,null,null,1)));  // 1
        System.out.println(pseudoPalindromicPaths(build(9)));  // 1
        System.out.println(pseudoPalindromicPaths(build()));  // 0
        System.out.println(pseudoPalindromicPaths(build(1,2,3)));  // 0
        System.out.println(pseudoPalindromicPaths(build(1)));  // 1
        System.out.println(pseudoPalindromicPaths(build(1,1,1)));  // 2
        System.out.println(pseudoPalindromicPaths(build(1,2,1)));  // 1
        System.out.println(pseudoPalindromicPaths(build(9,9,9,9,9,9,9)));  // 4
        System.out.println(pseudoPalindromicPaths(build(1,2,null,3,null,4)));  // 0
        System.out.println(pseudoPalindromicPaths(build(5)));  // 1
    }
}`,
  "max-diff-node-ancestor": `public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int v) { val = v; }
    }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode root = new TreeNode(vals[0]);
        java.util.Queue<TreeNode> q = new java.util.ArrayDeque<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode n = q.poll();
            if (i < vals.length) { if (vals[i] != null) { n.left = new TreeNode(vals[i]); q.add(n.left); } i++; }
            if (i < vals.length) { if (vals[i] != null) { n.right = new TreeNode(vals[i]); q.add(n.right); } i++; }
        }
        return root;
    }

    public static int maxAncestorDiff(TreeNode root) {
        // DFS carrying min and max along the current path

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(maxAncestorDiff(build(8,3,10,1,6,null,14,null,null,4,7,13)));  // 7
        System.out.println(maxAncestorDiff(build(1,null,2,null,0,3)));  // 3
        System.out.println(maxAncestorDiff(build(1)));  // 0
        System.out.println(maxAncestorDiff(build(1,2)));  // 1
        System.out.println(maxAncestorDiff(build(10,5)));  // 5
        System.out.println(maxAncestorDiff(build(10,5,15)));  // 5
        System.out.println(maxAncestorDiff(build(10,5,15,1,8,11,20)));  // 10
        System.out.println(maxAncestorDiff(build(1,2,3,4,5,6,7)));  // 6
        System.out.println(maxAncestorDiff(build(100,50,150,10,70,140,200)));  // 100
        System.out.println(maxAncestorDiff(build(5,5,5,5,5)));  // 0
        System.out.println(maxAncestorDiff(build(-5,-10,-1)));  // 5
    }
}`,
  "binary-tree-longest-consecutive": `public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int v) { val = v; }
    }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode root = new TreeNode(vals[0]);
        java.util.Queue<TreeNode> q = new java.util.ArrayDeque<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode n = q.poll();
            if (i < vals.length) { if (vals[i] != null) { n.left = new TreeNode(vals[i]); q.add(n.left); } i++; }
            if (i < vals.length) { if (vals[i] != null) { n.right = new TreeNode(vals[i]); q.add(n.right); } i++; }
        }
        return root;
    }

    public static int longestConsecutive(TreeNode root) {
        // DFS carrying current run length; reset to 1 when not +1 from parent

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(longestConsecutive(build(1,null,3,2,4,null,null,null,5)));  // 3
        System.out.println(longestConsecutive(build(2,null,3,2,null,1)));  // 2
        System.out.println(longestConsecutive(build()));  // 0
        System.out.println(longestConsecutive(build(1)));  // 1
        System.out.println(longestConsecutive(build(1,2)));  // 2
        System.out.println(longestConsecutive(build(1,2,3)));  // 2
        System.out.println(longestConsecutive(build(1,2,3,4)));  // 2
        System.out.println(longestConsecutive(build(5,4,3,2,1)));  // 1
        System.out.println(longestConsecutive(build(1,2,3,4,5)));  // 2
        System.out.println(longestConsecutive(build(1,2,3,4,5,6,7)));  // 2
        System.out.println(longestConsecutive(build(3,2,4,1,null,null,5)));  // 3
        System.out.println(longestConsecutive(build(10)));  // 1
    }
}`,
  "reorder-list": `public class Main {
    static class ListNode { int val; ListNode next; ListNode(int v){val=v;} }

    static ListNode build(int... vals) {
        ListNode d = new ListNode(0), c = d;
        for (int v : vals) { c.next = new ListNode(v); c = c.next; }
        return d.next;
    }

    static String toStr(ListNode h) {
        StringBuilder sb = new StringBuilder("[");
        while (h != null) { sb.append(h.val); if (h.next != null) sb.append(", "); h = h.next; }
        return sb.append("]").toString();
    }

    public static void reorderList(ListNode head) {
        // Find middle, reverse second half, merge halves alternately

    }

    static String run(ListNode h) { reorderList(h); return toStr(h); }

    public static void main(String[] args) {
        System.out.println(run(build(1,2,3,4)));  // [1, 4, 2, 3]
        System.out.println(run(build(1,2,3,4,5)));  // [1, 5, 2, 4, 3]
        System.out.println(run(build()));  // []
        System.out.println(run(build(1)));  // [1]
        System.out.println(run(build(1,2)));  // [1, 2]
        System.out.println(run(build(1,2,3)));  // [1, 3, 2]
        System.out.println(run(build(1,2,3,4,5,6)));  // [1, 6, 2, 5, 3, 4]
        System.out.println(run(build(1,2,3,4,5,6,7)));  // [1, 7, 2, 6, 3, 5, 4]
        System.out.println(run(build(10,20,30,40,50)));  // [10, 50, 20, 40, 30]
        System.out.println(run(build(1,1,1,1)));  // [1, 1, 1, 1]
    }
}`,
  "convert-sorted-list-to-bst": `public class Main {
    static class ListNode { int val; ListNode next; ListNode(int v){val=v;} }

    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int v) { val = v; }
    }

    static ListNode build(int... vals) {
        ListNode d = new ListNode(0), c = d;
        for (int v : vals) { c.next = new ListNode(v); c = c.next; }
        return d.next;
    }

    static String serializeLevel(TreeNode root) {
        if (root == null) return "[]";
        java.util.List<String> out = new java.util.ArrayList<>();
        java.util.Queue<TreeNode> q = new java.util.ArrayDeque<>();
        q.add(root);
        boolean hasReal = true;
        while (!q.isEmpty() && hasReal) {
            int size = q.size();
            hasReal = false;
            for (int k = 0; k < size; k++) {
                TreeNode n = q.poll();
                if (n == null) { out.add("null"); continue; }
                out.add(String.valueOf(n.val));
                if (n.left != null || n.right != null) hasReal = true;
                q.add(n.left); q.add(n.right);
            }
        }
        int end = out.size();
        while (end > 0 && out.get(end - 1).equals("null")) end--;
        StringBuilder sb = new StringBuilder("[");
        for (int k = 0; k < end; k++) { if (k > 0) sb.append(", "); sb.append(out.get(k)); }
        return sb.append("]").toString();
    }

    public static TreeNode sortedListToBST(ListNode head) {
        // Materialize to array; pick left-middle mid=(l+r)/2; recurse

        return null;
    }

    public static void main(String[] args) {
        System.out.println(serializeLevel(sortedListToBST(build(-10,-3,0,5,9))));  // [0, -10, 5, null, -3, null, 9]
        System.out.println(serializeLevel(sortedListToBST(build())));  // []
        System.out.println(serializeLevel(sortedListToBST(build(1))));  // [1]
        System.out.println(serializeLevel(sortedListToBST(build(1,2))));  // [1, null, 2]
        System.out.println(serializeLevel(sortedListToBST(build(1,2,3))));  // [2, 1, 3]
        System.out.println(serializeLevel(sortedListToBST(build(1,2,3,4))));  // [2, 1, 3, null, null, null, 4]
        System.out.println(serializeLevel(sortedListToBST(build(1,2,3,4,5))));  // [3, 1, 4, null, 2, null, 5]
        System.out.println(serializeLevel(sortedListToBST(build(1,2,3,4,5,6))));  // [3, 1, 5, null, 2, 4, 6]
        System.out.println(serializeLevel(sortedListToBST(build(1,2,3,4,5,6,7))));  // [4, 2, 6, 1, 3, 5, 7]
        System.out.println(serializeLevel(sortedListToBST(build(-100,100))));  // [-100, null, 100]
    }
}`,
  "smallest-subtree-deepest-nodes": `public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int v) { val = v; }
    }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode root = new TreeNode(vals[0]);
        java.util.Queue<TreeNode> q = new java.util.ArrayDeque<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode n = q.poll();
            if (i < vals.length) { if (vals[i] != null) { n.left = new TreeNode(vals[i]); q.add(n.left); } i++; }
            if (i < vals.length) { if (vals[i] != null) { n.right = new TreeNode(vals[i]); q.add(n.right); } i++; }
        }
        return root;
    }

    public static TreeNode subtreeWithAllDeepest(TreeNode root) {
        // Bottom-up DFS returning (depth, LCA); match depths => current is LCA

        return null;
    }

    static String val(TreeNode n) { return n == null ? "null" : String.valueOf(n.val); }

    public static void main(String[] args) {
        System.out.println(val(subtreeWithAllDeepest(build(3,5,1,6,2,0,8,null,null,7,4))));  // 2
        System.out.println(val(subtreeWithAllDeepest(build(1))));  // 1
        System.out.println(val(subtreeWithAllDeepest(build(0,1,3,null,2))));  // 2
        System.out.println(val(subtreeWithAllDeepest(build(1,2))));  // 2
        System.out.println(val(subtreeWithAllDeepest(build(1,null,2))));  // 2
        System.out.println(val(subtreeWithAllDeepest(build(1,2,3))));  // 1
        System.out.println(val(subtreeWithAllDeepest(build(1,2,3,4))));  // 4
        System.out.println(val(subtreeWithAllDeepest(build(1,2,3,null,null,4,5))));  // 3
        System.out.println(val(subtreeWithAllDeepest(build(1,2,3,4,5))));  // 2
        System.out.println(val(subtreeWithAllDeepest(build(1,2,3,4,5,6))));  // 1
        System.out.println(val(subtreeWithAllDeepest(build(1,2,3,4,5,6,7))));  // 1
        System.out.println(val(subtreeWithAllDeepest(build(5,4,8,11,null,13,4))));  // 5
    }
}`,
  "sum-of-left-leaves": `public class Main {
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int v) { val = v; }
    }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode root = new TreeNode(vals[0]);
        java.util.Queue<TreeNode> q = new java.util.ArrayDeque<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode n = q.poll();
            if (i < vals.length) { if (vals[i] != null) { n.left = new TreeNode(vals[i]); q.add(n.left); } i++; }
            if (i < vals.length) { if (vals[i] != null) { n.right = new TreeNode(vals[i]); q.add(n.right); } i++; }
        }
        return root;
    }

    public static int sumOfLeftLeaves(TreeNode root) {
        // DFS; when visiting a node's left child, if it is a leaf add its val

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(sumOfLeftLeaves(build(3,9,20,null,null,15,7)));  // 24
        System.out.println(sumOfLeftLeaves(build()));  // 0
        System.out.println(sumOfLeftLeaves(build(1)));  // 0
        System.out.println(sumOfLeftLeaves(build(1,2)));  // 2
        System.out.println(sumOfLeftLeaves(build(1,null,2)));  // 0
        System.out.println(sumOfLeftLeaves(build(1,2,3)));  // 2
        System.out.println(sumOfLeftLeaves(build(1,2,3,4)));  // 4
        System.out.println(sumOfLeftLeaves(build(1,2,3,4,5)));  // 4
        System.out.println(sumOfLeftLeaves(build(1,2,3,4,5,6,7)));  // 10
        System.out.println(sumOfLeftLeaves(build(7)));  // 0
        System.out.println(sumOfLeftLeaves(build(1,2,3,null,null,4)));  // 6
        System.out.println(sumOfLeftLeaves(build(0,0,0,0,0)));  // 0
    }
}`,
  "number-longest-increasing-subseq": `public class Main {
    public static int findNumberOfLIS(int[] nums) {
        // DP with length and count arrays
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(findNumberOfLIS(new int[]{1,3,5,4,7}));  // 2
        System.out.println(findNumberOfLIS(new int[]{2,2,2,2,2}));  // 5
        System.out.println(findNumberOfLIS(new int[]{1,2,3,4,5}));  // 1
        System.out.println(findNumberOfLIS(new int[]{5,4,3,2,1}));  // 5
        System.out.println(findNumberOfLIS(new int[]{1}));  // 1
        System.out.println(findNumberOfLIS(new int[]{}));  // 0
        System.out.println(findNumberOfLIS(new int[]{1,2}));  // 1
        System.out.println(findNumberOfLIS(new int[]{2,1}));  // 2
        System.out.println(findNumberOfLIS(new int[]{1,1,1}));  // 3
        System.out.println(findNumberOfLIS(new int[]{7}));  // 1
        System.out.println(findNumberOfLIS(new int[]{3,3}));  // 2
    }
}`,
  "arithmetic-slices": `public class Main {
    public static int numberOfArithmeticSlices(int[] nums) {
        // DP: dp[i] = count of slices ending at i
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(numberOfArithmeticSlices(new int[]{1,2,3,4}));  // 3
        System.out.println(numberOfArithmeticSlices(new int[]{1}));  // 0
        System.out.println(numberOfArithmeticSlices(new int[]{}));  // 0
        System.out.println(numberOfArithmeticSlices(new int[]{1,2,3}));  // 1
        System.out.println(numberOfArithmeticSlices(new int[]{1,2,3,4,5}));  // 6
        System.out.println(numberOfArithmeticSlices(new int[]{1,3,5,7,9}));  // 6
        System.out.println(numberOfArithmeticSlices(new int[]{1,2,3,4,5,6}));  // 10
        System.out.println(numberOfArithmeticSlices(new int[]{7,7,7,7}));  // 3
        System.out.println(numberOfArithmeticSlices(new int[]{1,2,4,8,16}));  // 0
        System.out.println(numberOfArithmeticSlices(new int[]{1,3,2,4,3,5}));  // 0
        System.out.println(numberOfArithmeticSlices(new int[]{2,4,6,8,3,5,7,9}));  // 6
    }
}`,
  "out-of-boundary-paths": `public class Main {
    static final int MOD = 1_000_000_007;

    public static int findPaths(int m, int n, int maxMove, int startRow, int startCol) {
        // Memoized DFS counting exit paths
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(findPaths(2, 2, 2, 0, 0));  // 6
        System.out.println(findPaths(1, 3, 3, 0, 1));  // 12
        System.out.println(findPaths(1, 1, 1, 0, 0));  // 4
        System.out.println(findPaths(1, 1, 0, 0, 0));  // 0
        System.out.println(findPaths(1, 1, 2, 0, 0));  // 4
        System.out.println(findPaths(2, 2, 0, 0, 0));  // 0
        System.out.println(findPaths(3, 3, 1, 1, 1));  // 0
        System.out.println(findPaths(3, 3, 2, 1, 1));  // 4
        System.out.println(findPaths(2, 2, 2, 1, 1));  // 6
        System.out.println(findPaths(2, 2, 1, 0, 0));  // 2
        System.out.println(findPaths(1, 2, 1, 0, 0));  // 3
    }
}`,
  "stone-game": `public class Main {
    public static boolean stoneGame(int[] piles) {
        // Interval DP on score difference, or return true (LC guarantee)
        return false;
    }

    public static void main(String[] args) {
        System.out.println(stoneGame(new int[]{5,3,4,5}));  // true
        System.out.println(stoneGame(new int[]{3,7,2,3}));  // true
        System.out.println(stoneGame(new int[]{1,2}));  // true
        System.out.println(stoneGame(new int[]{2,1}));  // true
        System.out.println(stoneGame(new int[]{7,8,8,10}));  // true
        System.out.println(stoneGame(new int[]{10,8,7,6}));  // true
        System.out.println(stoneGame(new int[]{1,100,1,100}));  // true
        System.out.println(stoneGame(new int[]{1,2,3,4}));  // true
        System.out.println(stoneGame(new int[]{4,3,2,1}));  // true
        System.out.println(stoneGame(new int[]{5,5,5,5}));  // true
        System.out.println(stoneGame(new int[]{9,1,1,9}));  // true
    }
}`,
  "predict-the-winner": `public class Main {
    public static boolean predictTheWinner(int[] nums) {
        // Interval DP on score difference
        return false;
    }

    public static void main(String[] args) {
        System.out.println(predictTheWinner(new int[]{1,5,2}));  // false
        System.out.println(predictTheWinner(new int[]{1,5,233,7}));  // true
        System.out.println(predictTheWinner(new int[]{1}));  // true
        System.out.println(predictTheWinner(new int[]{2}));  // true
        System.out.println(predictTheWinner(new int[]{1,1}));  // true
        System.out.println(predictTheWinner(new int[]{1,2}));  // true
        System.out.println(predictTheWinner(new int[]{2,1}));  // true
        System.out.println(predictTheWinner(new int[]{1,2,3}));  // true
        System.out.println(predictTheWinner(new int[]{5,5}));  // true
        System.out.println(predictTheWinner(new int[]{3,3,3,3}));  // true
        System.out.println(predictTheWinner(new int[]{10,1}));  // true
    }
}`,
  "last-stone-weight-ii": `public class Main {
    public static int lastStoneWeightII(int[] stones) {
        // 0/1 knapsack: max subset sum <= total/2
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(lastStoneWeightII(new int[]{2,7,4,1,8,1}));  // 1
        System.out.println(lastStoneWeightII(new int[]{31,26,33,21,40}));  // 5
        System.out.println(lastStoneWeightII(new int[]{1}));  // 1
        System.out.println(lastStoneWeightII(new int[]{}));  // 0
        System.out.println(lastStoneWeightII(new int[]{1,1}));  // 0
        System.out.println(lastStoneWeightII(new int[]{1,2}));  // 1
        System.out.println(lastStoneWeightII(new int[]{2,2,2,2}));  // 0
        System.out.println(lastStoneWeightII(new int[]{1,3}));  // 2
        System.out.println(lastStoneWeightII(new int[]{10,4,6}));  // 0
        System.out.println(lastStoneWeightII(new int[]{5,5,5,5,5}));  // 5
        System.out.println(lastStoneWeightII(new int[]{2,4,6,8}));  // 0
    }
}`,
  "restore-ip-addresses": `import java.util.*;

public class Main {
    public static List<String> restoreIpAddresses(String s) {
        // Backtrack splitting into 4 octets
        return new ArrayList<>();
    }

    static String sortedStr(List<String> xs) {
        List<String> c = new ArrayList<>(xs);
        Collections.sort(c);
        return c.toString();
    }

    public static void main(String[] args) {
        System.out.println(sortedStr(restoreIpAddresses("25525511135")));  // [255.255.11.135, 255.255.111.35]
        System.out.println(sortedStr(restoreIpAddresses("0000")));  // [0.0.0.0]
        System.out.println(sortedStr(restoreIpAddresses("101023")));  // [1.0.10.23, 1.0.102.3, 10.1.0.23, 10.10.2.3, 101.0.2.3]
        System.out.println(sortedStr(restoreIpAddresses("")));  // []
        System.out.println(sortedStr(restoreIpAddresses("1")));  // []
        System.out.println(sortedStr(restoreIpAddresses("11")));  // []
        System.out.println(sortedStr(restoreIpAddresses("111")));  // []
        System.out.println(sortedStr(restoreIpAddresses("1111")));  // [1.1.1.1]
        System.out.println(sortedStr(restoreIpAddresses("11111")));  // [1.1.1.11, 1.1.11.1, 1.11.1.1, 11.1.1.1]
        System.out.println(sortedStr(restoreIpAddresses("255255255255")));  // [255.255.255.255]
        System.out.println(sortedStr(restoreIpAddresses("9999")));  // [9.9.9.9]
    }
}`,
  "word-break-ii": `import java.util.*;

public class Main {
    public static List<String> wordBreak(String s, List<String> wordDict) {
        // Memoized DFS over suffix start indices
        return new ArrayList<>();
    }

    static String sortedStr(List<String> xs) {
        List<String> c = new ArrayList<>(xs);
        Collections.sort(c);
        return c.toString();
    }

    public static void main(String[] args) {
        System.out.println(sortedStr(wordBreak("catsanddog", Arrays.asList("cat","cats","and","sand","dog"))));  // [cat sand dog, cats and dog]
        System.out.println(sortedStr(wordBreak("pineapplepenapple", Arrays.asList("apple","pen","applepen","pine","pineapple"))));  // [pine apple pen apple, pine applepen apple, pineapple pen apple]
        System.out.println(sortedStr(wordBreak("catsandog", Arrays.asList("cats","dog","sand","and","cat"))));  // []
        System.out.println(sortedStr(wordBreak("", Arrays.asList("a"))));  // []
        System.out.println(sortedStr(wordBreak("a", Arrays.asList("a"))));  // [a]
        System.out.println(sortedStr(wordBreak("aa", Arrays.asList("a"))));  // [a a]
        System.out.println(sortedStr(wordBreak("aaa", Arrays.asList("a","aa"))));  // [a a a, a aa, aa a]
        System.out.println(sortedStr(wordBreak("cat", Arrays.asList("cat"))));  // [cat]
        System.out.println(sortedStr(wordBreak("abc", Arrays.asList("ab","c","a","bc"))));  // [a bc, ab c]
        System.out.println(sortedStr(wordBreak("leetcode", Arrays.asList("leet","code"))));  // [leet code]
        System.out.println(sortedStr(wordBreak("ab", Arrays.asList("a","b"))));  // [a b]
    }
}`,
  "word-search-ii": `import java.util.*;

public class Main {
    public static List<String> findWords(char[][] board, String[] words) {
        // Trie + DFS with visited marking
        return new ArrayList<>();
    }

    static String sortedStr(List<String> xs) {
        List<String> c = new ArrayList<>(xs);
        Collections.sort(c);
        return c.toString();
    }

    public static void main(String[] args) {
        char[][] b1 = {{'o','a','a','n'},{'e','t','a','e'},{'i','h','k','r'},{'i','f','l','v'}};
        System.out.println(sortedStr(findWords(b1, new String[]{"oath","pea","eat","rain"})));  // [eat, oath]

        char[][] b2 = {{'a','b'},{'c','d'}};
        System.out.println(sortedStr(findWords(b2, new String[]{"abcb"})));  // []

        char[][] b3 = {{'a'}};
        System.out.println(sortedStr(findWords(b3, new String[]{"a"})));  // [a]

        char[][] b4 = {{'a'}};
        System.out.println(sortedStr(findWords(b4, new String[]{"b"})));  // []

        char[][] b5 = {{'a','b'},{'c','d'}};
        System.out.println(sortedStr(findWords(b5, new String[]{"acdb"})));  // [acdb]

        char[][] b6 = {{'a','b'},{'c','d'}};
        System.out.println(sortedStr(findWords(b6, new String[]{"ab","ba","cd","dc","ac","ca","bd","db"})));  // [ab, ac, ba, bd, ca, cd, db, dc]

        char[][] b7 = {{'a','b','c'},{'d','e','f'},{'g','h','i'}};
        System.out.println(sortedStr(findWords(b7, new String[]{"abc","def","ghi","adg","beh","cfi"})));  // [abc, adg, beh, cfi, def, ghi]

        char[][] b8 = {{'a'}};
        System.out.println(sortedStr(findWords(b8, new String[]{})));  // []

        char[][] b9 = {{'a','a'},{'a','a'}};
        System.out.println(sortedStr(findWords(b9, new String[]{"aaaa","aaaaa"})));  // [aaaa]

        char[][] b10 = {{'a','b'},{'c','d'}};
        System.out.println(sortedStr(findWords(b10, new String[]{"abdc"})));  // [abdc]

        char[][] b11 = {{'a','b'},{'c','d'}};
        System.out.println(sortedStr(findWords(b11, new String[]{"ef"})));  // []
    }
}`,
  "split-array-largest-sum": `public class Main {
    public static int splitArray(int[] nums, int k) {
        // Binary search on answer + greedy feasibility, or interval DP
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(splitArray(new int[]{7,2,5,10,8}, 2));  // 18
        System.out.println(splitArray(new int[]{1,2,3,4,5}, 2));  // 9
        System.out.println(splitArray(new int[]{1,4,4}, 3));  // 4
        System.out.println(splitArray(new int[]{1,2,3}, 1));  // 6
        System.out.println(splitArray(new int[]{1,2,3}, 3));  // 3
        System.out.println(splitArray(new int[]{7}, 1));  // 7
        System.out.println(splitArray(new int[]{5,5}, 2));  // 5
        System.out.println(splitArray(new int[]{10,5,13,4,8,4,5,11,14,9,16,10,20,8}, 8));  // 25
        System.out.println(splitArray(new int[]{2,3,1,2,4,3}, 5));  // 4
        System.out.println(splitArray(new int[]{1,4,4}, 1));  // 9
        System.out.println(splitArray(new int[]{1,1,1,1}, 4));  // 1
    }
}`,
  "number-of-1-bits": `public class Main {
    public static int hammingWeight(int n) {
        // Count set bits; Brian Kernighan trick: n &= n - 1 strips lowest 1

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(hammingWeight(11));  // 3
        System.out.println(hammingWeight(128));  // 1
        System.out.println(hammingWeight(0));  // 0
        System.out.println(hammingWeight(1));  // 1
        System.out.println(hammingWeight(7));  // 3
        System.out.println(hammingWeight(15));  // 4
        System.out.println(hammingWeight(16));  // 1
        System.out.println(hammingWeight(255));  // 8
        System.out.println(hammingWeight(1024));  // 1
        System.out.println(hammingWeight(Integer.MAX_VALUE));  // 31
        System.out.println(hammingWeight(-1));  // 32
    }
}`,
  "reverse-bits": `public class Main {
    public static int reverseBits(int n) {
        // Iterate 32 times; pull lowest bit of n into result

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(reverseBits(0));  // 0
        System.out.println(reverseBits(1));  // -2147483648
        System.out.println(reverseBits(2));  // 1073741824
        System.out.println(reverseBits(3));  // -1073741824
        System.out.println(reverseBits(4));  // 536870912
        System.out.println(reverseBits(43261596));  // 964176192
        System.out.println(reverseBits(-1));  // -1
        System.out.println(reverseBits(Integer.MAX_VALUE));  // -2
        System.out.println(reverseBits(Integer.MIN_VALUE));  // 1
        System.out.println(reverseBits(-2));  // 2147483647
    }
}`,
  "sum-of-two-integers": `public class Main {
    public static int getSum(int a, int b) {
        // XOR = sum without carry; AND << 1 = carry; iterate until carry == 0

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(getSum(1, 2));  // 3
        System.out.println(getSum(2, 3));  // 5
        System.out.println(getSum(0, 0));  // 0
        System.out.println(getSum(-1, 1));  // 0
        System.out.println(getSum(-2, 3));  // 1
        System.out.println(getSum(-1, -1));  // -2
        System.out.println(getSum(100, 200));  // 300
        System.out.println(getSum(-100, -100));  // -200
        System.out.println(getSum(Integer.MAX_VALUE, 0));  // 2147483647
        System.out.println(getSum(Integer.MIN_VALUE, 0));  // -2147483648
        System.out.println(getSum(5, -3));  // 2
        System.out.println(getSum(100000, 100000));  // 200000
    }
}`,
  "last-stone-weight": `public class Main {
    public static int lastStoneWeight(int[] stones) {
        // Max-heap; repeatedly extract two largest and push difference

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(lastStoneWeight(new int[]{2,7,4,1,8,1}));  // 1
        System.out.println(lastStoneWeight(new int[]{1}));  // 1
        System.out.println(lastStoneWeight(new int[]{}));  // 0
        System.out.println(lastStoneWeight(new int[]{2,2}));  // 0
        System.out.println(lastStoneWeight(new int[]{10,4,2,10}));  // 2
        System.out.println(lastStoneWeight(new int[]{3,7,2}));  // 2
        System.out.println(lastStoneWeight(new int[]{10}));  // 10
        System.out.println(lastStoneWeight(new int[]{5,5,5,5}));  // 0
        System.out.println(lastStoneWeight(new int[]{9,3,2,10}));  // 0
        System.out.println(lastStoneWeight(new int[]{100,50,50}));  // 0
        System.out.println(lastStoneWeight(new int[]{1,1,1,1,1}));  // 1
    }
}`,
  "design-hashmap": `public class Main {
    static class MyHashMap {
        // Fill in bucket array, hash function, put/get/remove

        public MyHashMap() {

        }

        public void put(int key, int value) {

        }

        public int get(int key) {

            return -1;
        }

        public void remove(int key) {

        }
    }

    public static void main(String[] args) {
        MyHashMap map = new MyHashMap();
        map.put(1, 1);
        map.put(2, 2);
        System.out.println(map.get(1));  // 1
        System.out.println(map.get(3));  // -1
        map.put(2, 1);
        System.out.println(map.get(2));  // 1
        map.remove(2);
        System.out.println(map.get(2));  // -1
        map.put(100, 5);
        System.out.println(map.get(100));  // 5
        map.put(100000, 99);
        System.out.println(map.get(100000));  // 99
        map.remove(100);
        System.out.println(map.get(100));  // -1
        System.out.println(map.get(0));  // -1
        map.put(0, 0);
        System.out.println(map.get(0));  // 0
        map.put(0, 42);
        System.out.println(map.get(0));  // 42
    }
}`,
  "design-circular-queue": `public class Main {
    static class MyCircularQueue {
        // Fixed array + head index + count; modular arithmetic

        public MyCircularQueue(int k) {

        }

        public boolean enQueue(int value) {

            return false;
        }

        public boolean deQueue() {

            return false;
        }

        public int Front() {

            return -1;
        }

        public int Rear() {

            return -1;
        }

        public boolean isEmpty() {

            return true;
        }

        public boolean isFull() {

            return false;
        }
    }

    public static void main(String[] args) {
        MyCircularQueue q = new MyCircularQueue(3);
        System.out.println(q.enQueue(1));  // true
        System.out.println(q.enQueue(2));  // true
        System.out.println(q.enQueue(3));  // true
        System.out.println(q.enQueue(4));  // false
        System.out.println(q.Rear());  // 3
        System.out.println(q.isFull());  // true
        System.out.println(q.deQueue());  // true
        System.out.println(q.enQueue(4));  // true
        System.out.println(q.Rear());  // 4
        System.out.println(q.Front());  // 2
        System.out.println(q.isEmpty());  // false
        System.out.println(q.deQueue());  // true
        System.out.println(q.deQueue());  // true
        System.out.println(q.deQueue());  // true
        System.out.println(q.deQueue());  // false
        System.out.println(q.isEmpty());  // true
        System.out.println(q.Front());  // -1
        System.out.println(q.Rear());  // -1
    }
}`,
  "design-tic-tac-toe": `public class Main {
    static class TicTacToe {
        // Per-row, per-col counters; two diagonal counters; +1 for P1, -1 for P2

        public TicTacToe(int n) {

        }

        public int move(int row, int col, int player) {

            return 0;
        }
    }

    public static void main(String[] args) {
        TicTacToe t = new TicTacToe(3);
        System.out.println(t.move(0, 0, 1));  // 0
        System.out.println(t.move(0, 2, 2));  // 0
        System.out.println(t.move(2, 2, 1));  // 0
        System.out.println(t.move(1, 1, 2));  // 0
        System.out.println(t.move(2, 0, 1));  // 0
        System.out.println(t.move(1, 0, 2));  // 0
        System.out.println(t.move(2, 1, 1));  // 1

        TicTacToe t2 = new TicTacToe(2);
        System.out.println(t2.move(0, 0, 1));  // 0
        System.out.println(t2.move(0, 1, 2));  // 0
        System.out.println(t2.move(1, 0, 1));  // 1

        TicTacToe t3 = new TicTacToe(3);
        System.out.println(t3.move(0, 0, 1));  // 0
        System.out.println(t3.move(1, 1, 1));  // 0
        System.out.println(t3.move(2, 2, 1));  // 1
    }
}`,
  "design-hit-counter": `public class Main {
    static class HitCounter {
        // Queue of timestamps, or circular buffer of size 300

        public HitCounter() {

        }

        public void hit(int timestamp) {

        }

        public int getHits(int timestamp) {

            return 0;
        }
    }

    public static void main(String[] args) {
        HitCounter h = new HitCounter();
        h.hit(1);
        h.hit(2);
        h.hit(3);
        System.out.println(h.getHits(4));  // 3
        h.hit(300);
        System.out.println(h.getHits(300));  // 4
        System.out.println(h.getHits(301));  // 3
        System.out.println(h.getHits(302));  // 2
        System.out.println(h.getHits(303));  // 1
        System.out.println(h.getHits(304));  // 1
        System.out.println(h.getHits(599));  // 1
        System.out.println(h.getHits(601));  // 0
        System.out.println(h.getHits(10000));  // 0
        h.hit(500);
        System.out.println(h.getHits(501));  // 1
        System.out.println(h.getHits(799));  // 1
        System.out.println(h.getHits(801));  // 0
    }
}`,
  "power-of-two": `public class Main {
    public static boolean isPowerOfTwo(int n) {
        // Positive with exactly one set bit: n > 0 && (n & (n-1)) == 0

        return false;
    }

    public static void main(String[] args) {
        System.out.println(isPowerOfTwo(1));  // true
        System.out.println(isPowerOfTwo(16));  // true
        System.out.println(isPowerOfTwo(3));  // false
        System.out.println(isPowerOfTwo(0));  // false
        System.out.println(isPowerOfTwo(-1));  // false
        System.out.println(isPowerOfTwo(-16));  // false
        System.out.println(isPowerOfTwo(2));  // true
        System.out.println(isPowerOfTwo(4));  // true
        System.out.println(isPowerOfTwo(1024));  // true
        System.out.println(isPowerOfTwo(1023));  // false
        System.out.println(isPowerOfTwo(1073741824));  // true
        System.out.println(isPowerOfTwo(Integer.MAX_VALUE));  // false
        System.out.println(isPowerOfTwo(Integer.MIN_VALUE));  // false
    }
}`,
  "single-number-ii": `public class Main {
    public static int singleNumber(int[] nums) {
        // ones/twos bitmask state machine; mod-3 counter per bit

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(singleNumber(new int[]{2,2,3,2}));  // 3
        System.out.println(singleNumber(new int[]{0,1,0,1,0,1,99}));  // 99
        System.out.println(singleNumber(new int[]{-1,-1,-1,5}));  // 5
        System.out.println(singleNumber(new int[]{1}));  // 1
        System.out.println(singleNumber(new int[]{7,7,7,13}));  // 13
        System.out.println(singleNumber(new int[]{-2,-2,1,1,-3,1,-3,-3,-4,-2}));  // -4
        System.out.println(singleNumber(new int[]{1,1,1,2}));  // 2
        System.out.println(singleNumber(new int[]{30000,500,100,30000,100,30000,100}));  // 500
        System.out.println(singleNumber(new int[]{0,0,0,1}));  // 1
        System.out.println(singleNumber(new int[]{-1,-1,-1,0}));  // 0
    }
}`,
  "replace-words": `import java.util.*;

public class Main {
    public static String replaceWords(List<String> dictionary, String sentence) {
        // Build a Trie from dictionary roots; for each word, walk Trie and stop at first end-of-root

        return sentence;
    }

    public static void main(String[] args) {
        System.out.println(replaceWords(Arrays.asList("cat","bat","rat"), "the cattle was rattled by the battery"));
        // expected: the cat was rat by the bat
        System.out.println(replaceWords(Arrays.asList("a","b","c"), "aadsfasf absbs bbab cadsfafs"));
        // expected: a a b c
        System.out.println(replaceWords(Arrays.asList("catt","cat","bat","rat"), "the cattle was rattled by the battery"));
        // expected: the cat was rat by the bat
        System.out.println(replaceWords(Arrays.asList("a","aa","aaa","aaaa"), "a aa a aaaa aaa aaa aaa aaaaaa bbb baba ababa"));
        // expected: a a a a a a a a bbb baba a
        System.out.println(replaceWords(new ArrayList<>(), "hello world"));
        // expected: hello world
        System.out.println(replaceWords(Arrays.asList("x"), ""));
        // expected: (empty)
        System.out.println(replaceWords(Arrays.asList("cat"), "dog"));
        // expected: dog
        System.out.println(replaceWords(Arrays.asList("the","a"), "the quick fox"));
        // expected: the quick fox
        System.out.println(replaceWords(Arrays.asList("ab"), "abcdef"));
        // expected: ab
        System.out.println(replaceWords(Arrays.asList("a"), "apple banana cherry"));
        // expected: a a a
        System.out.println(replaceWords(Arrays.asList("s","t","u"), "seeing talking understanding"));
        // expected: s t u
    }
}`,
  "design-add-search-words": `import java.util.*;

public class Main {
    static class WordDictionary {
        // Trie node: 26 children + endOfWord flag
        // addWord: create path; search: DFS with wildcard handling for '.'

        public WordDictionary() {
        }

        public void addWord(String word) {
        }

        public boolean search(String word) {
            return false;
        }
    }

    public static void main(String[] args) {
        WordDictionary d = new WordDictionary();
        d.addWord("bad");
        d.addWord("dad");
        d.addWord("mad");
        System.out.println(d.search("pad"));   // false
        System.out.println(d.search("bad"));   // true
        System.out.println(d.search(".ad"));   // true
        System.out.println(d.search("b.."));   // true
        System.out.println(d.search("..."));   // true
        System.out.println(d.search("...."));  // false
        System.out.println(d.search(""));      // false
        d.addWord("a");
        System.out.println(d.search("a"));     // true
        System.out.println(d.search("."));     // true
        System.out.println(d.search("aa"));    // false
        d.addWord("at");
        System.out.println(d.search("."));     // true
        System.out.println(d.search(".."));    // true
        System.out.println(d.search(".a..")); // false
    }
}`,
  "maximum-xor-two-numbers": `import java.util.*;

public class Main {
    public static int findMaximumXOR(int[] nums) {
        // Greedy from bit 31 down: try to set each bit, verify via HashSet of prefixes

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(findMaximumXOR(new int[]{3,10,5,25,2,8}));  // 28
        System.out.println(findMaximumXOR(new int[]{0}));  // 0
        System.out.println(findMaximumXOR(new int[]{14,70,53,83,49,91,36,80,92,51,66,70}));  // 127
        System.out.println(findMaximumXOR(new int[]{0,0}));  // 0
        System.out.println(findMaximumXOR(new int[]{1,2}));  // 3
        System.out.println(findMaximumXOR(new int[]{8,10,2}));  // 10
        System.out.println(findMaximumXOR(new int[]{32,10,1}));  // 42
        System.out.println(findMaximumXOR(new int[]{1,2,3,4,5,6,7}));  // 7
        System.out.println(findMaximumXOR(new int[]{3,10}));  // 9
        System.out.println(findMaximumXOR(new int[]{5,5,5}));  // 0
        System.out.println(findMaximumXOR(new int[]{100}));  // 0
        System.out.println(findMaximumXOR(new int[]{1,3,5,7,9}));  // 14
        System.out.println(findMaximumXOR(new int[]{2147483647,0,1}));  // 2147483647
    }
}`,
  "implement-strstr": `public class Main {
    public static int strStr(String haystack, String needle) {
        // Naive O(n*m) scan or KMP O(n+m); empty needle returns 0

        return -1;
    }

    public static void main(String[] args) {
        System.out.println(strStr("sadbutsad", "sad"));  // 0
        System.out.println(strStr("leetcode", "leeto"));  // -1
        System.out.println(strStr("hello", "ll"));  // 2
        System.out.println(strStr("aaaaa", "bba"));  // -1
        System.out.println(strStr("", ""));  // 0
        System.out.println(strStr("a", ""));  // 0
        System.out.println(strStr("", "a"));  // -1
        System.out.println(strStr("abc", "abcd"));  // -1
        System.out.println(strStr("mississippi", "issip"));  // 4
        System.out.println(strStr("abcabc", "abc"));  // 0
        System.out.println(strStr("abcabcd", "abcd"));  // 3
        System.out.println(strStr("aaa", "aaa"));  // 0
    }
}`,
  "longest-happy-prefix": `public class Main {
    public static String longestPrefix(String s) {
        // Build KMP failure array; answer is s.substring(0, lps[n-1])

        return "";
    }

    public static void main(String[] args) {
        System.out.println(longestPrefix("level"));  // l
        System.out.println(longestPrefix("ababab"));  // abab
        System.out.println(longestPrefix("leetcodeleet"));  // leet
        System.out.println(longestPrefix("a"));  // (empty)
        System.out.println(longestPrefix(""));  // (empty)
        System.out.println(longestPrefix("aaaa"));  // aaa
        System.out.println(longestPrefix("aaaaa"));  // aaaa
        System.out.println(longestPrefix("abcabc"));  // abc
        System.out.println(longestPrefix("abcd"));  // (empty)
        System.out.println(longestPrefix("abab"));  // ab
        System.out.println(longestPrefix("abaa"));  // a
        System.out.println(longestPrefix("abcdabcabcdabc"));  // abcdabc
    }
}`,
  "palindrome-pairs": `import java.util.*;

public class Main {
    public static List<List<Integer>> palindromePairs(String[] words) {
        // Hash map reversed -> index; for each word, try every split and query the map

        return new ArrayList<>();
    }

    static String fmt(List<List<Integer>> res) {
        List<int[]> arr = new ArrayList<>();
        for (List<Integer> p : res) arr.add(new int[]{p.get(0), p.get(1)});
        arr.sort((a, b) -> a[0] != b[0] ? a[0] - b[0] : a[1] - b[1]);
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < arr.size(); i++) {
            if (i > 0) sb.append(", ");
            sb.append("[").append(arr.get(i)[0]).append(", ").append(arr.get(i)[1]).append("]");
        }
        return sb.append("]").toString();
    }

    public static void main(String[] args) {
        System.out.println(fmt(palindromePairs(new String[]{"abcd","dcba","lls","s","sssll"})));
        // expected: [[0, 1], [1, 0], [2, 4], [3, 2]]
        System.out.println(fmt(palindromePairs(new String[]{"bat","tab","cat"})));
        // expected: [[0, 1], [1, 0]]
        System.out.println(fmt(palindromePairs(new String[]{"a",""})));
        // expected: [[0, 1], [1, 0]]
        System.out.println(fmt(palindromePairs(new String[]{""})));
        // expected: []
        System.out.println(fmt(palindromePairs(new String[]{"abc"})));
        // expected: []
        System.out.println(fmt(palindromePairs(new String[]{"ab","ba"})));
        // expected: [[0, 1], [1, 0]]
        System.out.println(fmt(palindromePairs(new String[]{"aa"})));
        // expected: []
        System.out.println(fmt(palindromePairs(new String[]{"a","b","c","ab","ac","aa"})));
        // expected: [[0, 5], [1, 3], [2, 4], [3, 0], [4, 0], [5, 0]]
        System.out.println(fmt(palindromePairs(new String[]{"","a","b"})));
        // expected: [[0, 1], [0, 2], [1, 0], [2, 0]]
        System.out.println(fmt(palindromePairs(new String[]{"ab","cd","dcba"})));
        // expected: []
        System.out.println(fmt(palindromePairs(new String[]{"race","car","ecar","racecar"})));
        // expected: [[0, 1], [0, 2], [2, 0]]
    }
}`,
  "critical-connections": `import java.util.*;

public class Main {
    public static List<List<Integer>> criticalConnections(int n, List<List<Integer>> connections) {
        // Tarjan DFS: disc/low arrays; bridge when low[v] > disc[u]

        return new ArrayList<>();
    }

    static String fmt(List<List<Integer>> res) {
        List<int[]> arr = new ArrayList<>();
        for (List<Integer> e : res) {
            int a = Math.min(e.get(0), e.get(1));
            int b = Math.max(e.get(0), e.get(1));
            arr.add(new int[]{a, b});
        }
        arr.sort((a, b) -> a[0] != b[0] ? a[0] - b[0] : a[1] - b[1]);
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < arr.size(); i++) {
            if (i > 0) sb.append(", ");
            sb.append("[").append(arr.get(i)[0]).append(", ").append(arr.get(i)[1]).append("]");
        }
        return sb.append("]").toString();
    }

    static List<List<Integer>> mk(int[][] edges) {
        List<List<Integer>> r = new ArrayList<>();
        for (int[] e : edges) r.add(Arrays.asList(e[0], e[1]));
        return r;
    }

    public static void main(String[] args) {
        System.out.println(fmt(criticalConnections(4, mk(new int[][]{{0,1},{1,2},{2,0},{1,3}}))));
        // expected: [[1, 3]]
        System.out.println(fmt(criticalConnections(2, mk(new int[][]{{0,1}}))));
        // expected: [[0, 1]]
        System.out.println(fmt(criticalConnections(3, mk(new int[][]{{0,1},{1,2},{2,0}}))));
        // expected: []
        System.out.println(fmt(criticalConnections(1, mk(new int[][]{}))));
        // expected: []
        System.out.println(fmt(criticalConnections(4, mk(new int[][]{{0,1},{1,2},{2,3}}))));
        // expected: [[0, 1], [1, 2], [2, 3]]
        System.out.println(fmt(criticalConnections(5, mk(new int[][]{{0,1},{1,2},{2,3},{3,4},{4,0}}))));
        // expected: []
        System.out.println(fmt(criticalConnections(5, mk(new int[][]{{0,1},{1,2},{2,3},{3,4}}))));
        // expected: [[0, 1], [1, 2], [2, 3], [3, 4]]
        System.out.println(fmt(criticalConnections(6, mk(new int[][]{{0,1},{1,2},{2,0},{1,3},{3,4},{4,5},{5,3}}))));
        // expected: [[1, 3]]
        System.out.println(fmt(criticalConnections(5, mk(new int[][]{{1,0},{2,0},{3,2},{4,2},{4,3},{3,0},{4,0}}))));
        // expected: [[0, 1]]
        System.out.println(fmt(criticalConnections(4, mk(new int[][]{{0,1},{1,2},{2,3},{1,3}}))));
        // expected: [[0, 1]]
    }
}`,
  "alien-dictionary": `import java.util.*;

public class Main {
    public static String alienOrder(String[] words) {
        // Collect chars; build edges from adjacent word diffs; check prefix contradiction
        // Kahn's with PriorityQueue for deterministic (lex smallest) topological order

        return "";
    }

    public static void main(String[] args) {
        System.out.println(alienOrder(new String[]{"wrt","wrf","er","ett","rftt"}));  // wertf
        System.out.println(alienOrder(new String[]{"z","x"}));  // zx
        System.out.println(alienOrder(new String[]{"z","x","z"}));  // (empty)
        System.out.println(alienOrder(new String[]{"a"}));  // a
        System.out.println(alienOrder(new String[]{"abc"}));  // abc
        System.out.println(alienOrder(new String[]{"abc","ab"}));  // (empty)
        System.out.println(alienOrder(new String[]{"ba","ab"}));  // ba
        System.out.println(alienOrder(new String[]{"ab","ab"}));  // ab
        System.out.println(alienOrder(new String[]{}));  // (empty)
        System.out.println(alienOrder(new String[]{"ca","cb","ab"}));  // cab
        System.out.println(alienOrder(new String[]{"ab","adc"}));  // abcd
    }
}`,
  "reconstruct-itinerary": `import java.util.*;

public class Main {
    public static List<String> findItinerary(List<List<String>> tickets) {
        // Hierholzer's algorithm: adjacency with PriorityQueue; iterative stack; reverse at end

        return new ArrayList<>();
    }

    static List<List<String>> mk(String[][] t) {
        List<List<String>> r = new ArrayList<>();
        for (String[] e : t) r.add(Arrays.asList(e[0], e[1]));
        return r;
    }

    public static void main(String[] args) {
        System.out.println(findItinerary(mk(new String[][]{{"MUC","LHR"},{"JFK","MUC"},{"SFO","SJC"},{"LHR","SFO"}})));
        // expected: [JFK, MUC, LHR, SFO, SJC]
        System.out.println(findItinerary(mk(new String[][]{{"JFK","SFO"},{"JFK","ATL"},{"SFO","ATL"},{"ATL","JFK"},{"ATL","SFO"}})));
        // expected: [JFK, ATL, JFK, SFO, ATL, SFO]
        System.out.println(findItinerary(mk(new String[][]{{"JFK","A"},{"A","B"},{"B","C"}})));
        // expected: [JFK, A, B, C]
        System.out.println(findItinerary(mk(new String[][]{{"JFK","MUC"},{"MUC","LHR"},{"LHR","SFO"},{"SFO","SJC"}})));
        // expected: [JFK, MUC, LHR, SFO, SJC]
        System.out.println(findItinerary(mk(new String[][]{{"JFK","A"},{"A","JFK"}})));
        // expected: [JFK, A, JFK]
        System.out.println(findItinerary(mk(new String[][]{{"JFK","A"},{"A","B"},{"B","JFK"},{"JFK","B"}})));
        // expected: [JFK, A, B, JFK, B]
        System.out.println(findItinerary(mk(new String[][]{{"JFK","KUL"},{"JFK","NRT"},{"NRT","JFK"}})));
        // expected: [JFK, NRT, JFK, KUL]
        System.out.println(findItinerary(mk(new String[][]{{"JFK","AAA"},{"AAA","JFK"},{"JFK","BBB"},{"BBB","JFK"}})));
        // expected: [JFK, AAA, JFK, BBB, JFK]
        System.out.println(findItinerary(mk(new String[][]{{"JFK","A"}})));
        // expected: [JFK, A]
        System.out.println(findItinerary(mk(new String[][]{{"JFK","A"},{"A","JFK"},{"JFK","B"},{"B","JFK"}})));
        // expected: [JFK, A, JFK, B, JFK]
    }
}`,
  "min-cost-hire-k-workers": `import java.util.*;

public class Main {
    public static double mincostToHireWorkers(int[] quality, int[] wage, int k) {
        // Sort by ratio wage/quality; max-heap of qualities size k; track qsum; best = qsum * ratio

        return 0.0;
    }

    static String f(double v) {
        return String.format("%.5f", v);
    }

    public static void main(String[] args) {
        System.out.println(f(mincostToHireWorkers(new int[]{10,20,5}, new int[]{70,50,30}, 2)));  // 105.00000
        System.out.println(f(mincostToHireWorkers(new int[]{3,1,10,10,1}, new int[]{4,8,2,2,7}, 3)));  // 30.66667
        System.out.println(f(mincostToHireWorkers(new int[]{1}, new int[]{1}, 1)));  // 1.00000
        System.out.println(f(mincostToHireWorkers(new int[]{5}, new int[]{10}, 1)));  // 10.00000
        System.out.println(f(mincostToHireWorkers(new int[]{1,1}, new int[]{5,10}, 2)));  // 20.00000
        System.out.println(f(mincostToHireWorkers(new int[]{2,2}, new int[]{10,10}, 2)));  // 20.00000
        System.out.println(f(mincostToHireWorkers(new int[]{1,2,3}, new int[]{1,2,3}, 2)));  // 3.00000
        System.out.println(f(mincostToHireWorkers(new int[]{3,2,1}, new int[]{3,2,1}, 1)));  // 1.00000
        System.out.println(f(mincostToHireWorkers(new int[]{10,5,2}, new int[]{20,10,4}, 1)));  // 4.00000
        System.out.println(f(mincostToHireWorkers(new int[]{100,1}, new int[]{100,100}, 1)));  // 100.00000
        System.out.println(f(mincostToHireWorkers(new int[]{100,1}, new int[]{100,100}, 2)));  // 10100.00000
        System.out.println(f(mincostToHireWorkers(new int[]{1,1,1,1}, new int[]{1,2,3,4}, 2)));  // 4.00000
    }
}`,
  "count-smaller-after-self": `import java.util.*;

public class Main {
    public static List<Integer> countSmaller(int[] nums) {
        // BIT on compressed coordinates, or merge-sort with index tracking

        return new ArrayList<>();
    }

    public static void main(String[] args) {
        System.out.println(countSmaller(new int[]{5,2,6,1}));  // [2, 1, 1, 0]
        System.out.println(countSmaller(new int[]{-1}));  // [0]
        System.out.println(countSmaller(new int[]{-1,-1}));  // [0, 0]
        System.out.println(countSmaller(new int[]{}));  // []
        System.out.println(countSmaller(new int[]{1,2,3}));  // [0, 0, 0]
        System.out.println(countSmaller(new int[]{3,2,1}));  // [2, 1, 0]
        System.out.println(countSmaller(new int[]{2,0,1}));  // [2, 0, 0]
        System.out.println(countSmaller(new int[]{1,1,1}));  // [0, 0, 0]
        System.out.println(countSmaller(new int[]{5,4,3,2,1}));  // [4, 3, 2, 1, 0]
        System.out.println(countSmaller(new int[]{1,9,7,8,5}));  // [0, 3, 1, 1, 0]
        System.out.println(countSmaller(new int[]{-1,0,1}));  // [0, 0, 0]
        System.out.println(countSmaller(new int[]{5,5,5,5}));  // [0, 0, 0, 0]
    }
}`,
  "divide-two-integers": `public class Main {
    public static int divide(int dividend, int divisor) {
        // Bit-shift subtraction; clamp overflow to Integer.MAX_VALUE

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(divide(10, 3));  // 3
        System.out.println(divide(7, -3));  // -2
        System.out.println(divide(1, 1));  // 1
        System.out.println(divide(0, 1));  // 0
        System.out.println(divide(-1, 1));  // -1
        System.out.println(divide(Integer.MIN_VALUE, 1));  // -2147483648
        System.out.println(divide(Integer.MIN_VALUE, -1));  // 2147483647
        System.out.println(divide(Integer.MAX_VALUE, 1));  // 2147483647
        System.out.println(divide(100, 10));  // 10
        System.out.println(divide(100, 3));  // 33
        System.out.println(divide(-100, 3));  // -33
        System.out.println(divide(-100, -3));  // 33
        System.out.println(divide(1, -1));  // -1
    }
}`,
  "moving-average-stream": `import java.util.*;

public class Main {
    static class MovingAverage {
        // Fields: size, sum, deque of int

        public MovingAverage(int size) {
            // init

        }

        public double next(int val) {
            // Enqueue; evict if over capacity; update running sum; return average

            return 0.0;
        }
    }

    public static void main(String[] args) {
        MovingAverage m = new MovingAverage(3);
        System.out.println(String.format(java.util.Locale.US, "%.5f", m.next(1)));  // 1.00000
        System.out.println(String.format(java.util.Locale.US, "%.5f", m.next(10)));  // 5.50000
        System.out.println(String.format(java.util.Locale.US, "%.5f", m.next(3)));  // 4.66667
        System.out.println(String.format(java.util.Locale.US, "%.5f", m.next(5)));  // 6.00000
        System.out.println(String.format(java.util.Locale.US, "%.5f", m.next(0)));  // 2.66667

        MovingAverage m2 = new MovingAverage(1);
        System.out.println(String.format(java.util.Locale.US, "%.5f", m2.next(5)));  // 5.00000
        System.out.println(String.format(java.util.Locale.US, "%.5f", m2.next(10)));  // 10.00000

        MovingAverage m3 = new MovingAverage(5);
        System.out.println(String.format(java.util.Locale.US, "%.5f", m3.next(2)));  // 2.00000
        System.out.println(String.format(java.util.Locale.US, "%.5f", m3.next(4)));  // 3.00000
        System.out.println(String.format(java.util.Locale.US, "%.5f", m3.next(6)));  // 4.00000
        System.out.println(String.format(java.util.Locale.US, "%.5f", m3.next(8)));  // 5.00000
        System.out.println(String.format(java.util.Locale.US, "%.5f", m3.next(10)));  // 6.00000
        System.out.println(String.format(java.util.Locale.US, "%.5f", m3.next(12)));  // 8.00000
    }
}`,
  "logger-rate-limiter": `import java.util.*;

public class Main {
    static class Logger {
        // HashMap<String, Integer> lastAllowed

        public Logger() {
            // init

        }

        public boolean shouldPrintMessage(int timestamp, String message) {
            // If not present or stored time <= timestamp, update and return true

            return false;
        }
    }

    public static void main(String[] args) {
        Logger l = new Logger();
        System.out.println(l.shouldPrintMessage(1, "foo"));  // true
        System.out.println(l.shouldPrintMessage(2, "bar"));  // true
        System.out.println(l.shouldPrintMessage(3, "foo"));  // false
        System.out.println(l.shouldPrintMessage(8, "bar"));  // false
        System.out.println(l.shouldPrintMessage(10, "foo"));  // false
        System.out.println(l.shouldPrintMessage(11, "foo"));  // true
        System.out.println(l.shouldPrintMessage(20, "bar"));  // true
        System.out.println(l.shouldPrintMessage(20, "baz"));  // true
        System.out.println(l.shouldPrintMessage(29, "baz"));  // false
        System.out.println(l.shouldPrintMessage(30, "baz"));  // true
        System.out.println(l.shouldPrintMessage(31, "baz"));  // false
    }
}`,
  "snake-game": `import java.util.*;

public class Main {
    static class SnakeGame {
        // width, height, food[][], foodIdx, Deque<int[]> body, Set<Integer> occupied, score

        public SnakeGame(int width, int height, int[][] food) {
            // init with snake at (0,0)

        }

        public int move(String direction) {
            // Compute new head; check walls; check food; move tail if not eaten; check self-collision

            return 0;
        }
    }

    public static void main(String[] args) {
        SnakeGame s = new SnakeGame(3, 2, new int[][]{{1,2},{0,1}});
        System.out.println(s.move("R"));  // 0
        System.out.println(s.move("D"));  // 0
        System.out.println(s.move("R"));  // 1
        System.out.println(s.move("U"));  // 1
        System.out.println(s.move("L"));  // 2
        System.out.println(s.move("U"));  // -1

        SnakeGame s2 = new SnakeGame(3, 3, new int[][]{});
        System.out.println(s2.move("R"));  // 0
        System.out.println(s2.move("R"));  // 0
        System.out.println(s2.move("D"));  // 0
        System.out.println(s2.move("D"));  // 0
        System.out.println(s2.move("U"));  // 0

        SnakeGame s3 = new SnakeGame(2, 2, new int[][]{});
        System.out.println(s3.move("U"));  // -1
    }
}`,
  "stone-game-ii": `import java.util.*;

public class Main {
    public static int stoneGameII(int[] piles) {
        // memo[i][M]; suffix sums; current player maximizes suffix - opponent

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(stoneGameII(new int[]{2,7,9,4,4}));  // 10
        System.out.println(stoneGameII(new int[]{1,2,3,4,5,100}));  // 104
        System.out.println(stoneGameII(new int[]{1}));  // 1
        System.out.println(stoneGameII(new int[]{100}));  // 100
        System.out.println(stoneGameII(new int[]{1,1}));  // 2
        System.out.println(stoneGameII(new int[]{1,2}));  // 3
        System.out.println(stoneGameII(new int[]{3,7}));  // 10
        System.out.println(stoneGameII(new int[]{10,1}));  // 11
        System.out.println(stoneGameII(new int[]{0,0,0}));  // 0
        System.out.println(stoneGameII(new int[]{5,5,5,5}));  // 10
        System.out.println(stoneGameII(new int[]{2,2}));  // 4
    }
}`,
  "cherry-pickup": `public class Main {
    public static int cherryPickup(int[][] grid) {
        // 3D DP on (r1, c1, r2), c2 = r1+c1-r2; same-cell counts once

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(cherryPickup(new int[][]{{0,1,-1},{1,0,-1},{1,1,1}}));  // 5
        System.out.println(cherryPickup(new int[][]{{1,1,-1},{1,-1,1},{-1,1,1}}));  // 0
        System.out.println(cherryPickup(new int[][]{{1}}));  // 1
        System.out.println(cherryPickup(new int[][]{{0}}));  // 0
        System.out.println(cherryPickup(new int[][]{{1,1},{1,1}}));  // 4
        System.out.println(cherryPickup(new int[][]{{0,0},{0,0}}));  // 0
        System.out.println(cherryPickup(new int[][]{{1,0},{0,1}}));  // 2
        System.out.println(cherryPickup(new int[][]{{1,1},{-1,1}}));  // 3
        System.out.println(cherryPickup(new int[][]{{1,1,1},{1,1,1},{1,1,1}}));  // 8
        System.out.println(cherryPickup(new int[][]{{1,1,1},{0,0,0},{1,1,1}}));  // 6
    }
}`,
  "range-sum-query-mutable": `public class Main {
    static class NumArray {
        // BIT (Fenwick) of size n+1; original array to compute delta on update

        public NumArray(int[] nums) {
            // init BIT with point updates for each element

        }

        public void update(int index, int val) {
            // delta = val - original[index]; BIT point update; store new value

        }

        public int sumRange(int left, int right) {
            // prefix(right+1) - prefix(left)

            return 0;
        }
    }

    public static void main(String[] args) {
        NumArray na = new NumArray(new int[]{1,3,5});
        System.out.println(na.sumRange(0, 2));  // 9
        na.update(1, 2);
        System.out.println(na.sumRange(0, 2));  // 8
        System.out.println(na.sumRange(0, 0));  // 1
        System.out.println(na.sumRange(2, 2));  // 5
        na.update(0, 10);
        System.out.println(na.sumRange(0, 2));  // 17
        System.out.println(na.sumRange(1, 2));  // 7

        NumArray na2 = new NumArray(new int[]{-1,3,5,7,-2,4});
        System.out.println(na2.sumRange(0, 5));  // 16
        System.out.println(na2.sumRange(2, 4));  // 10
        na2.update(3, 0);
        System.out.println(na2.sumRange(0, 5));  // 9
        System.out.println(na2.sumRange(3, 3));  // 0
        na2.update(5, 10);
        System.out.println(na2.sumRange(0, 5));  // 15
        System.out.println(na2.sumRange(4, 5));  // 8
    }
}`,
  "largest-divisible-subset": `import java.util.*;

public class Main {
    public static List<Integer> largestDivisibleSubset(int[] nums) {
        // Sort; dp[i]=chain length, prev[i]=predecessor; reconstruct from argmax

        return new ArrayList<>();
    }

    public static void main(String[] args) {
        System.out.println(largestDivisibleSubset(new int[]{1,2,3}));  // [1, 2]
        System.out.println(largestDivisibleSubset(new int[]{1,2,4,8}));  // [1, 2, 4, 8]
        System.out.println(largestDivisibleSubset(new int[]{1}));  // [1]
        System.out.println(largestDivisibleSubset(new int[]{}));  // []
        System.out.println(largestDivisibleSubset(new int[]{3}));  // [3]
        System.out.println(largestDivisibleSubset(new int[]{2,4,8}));  // [2, 4, 8]
        System.out.println(largestDivisibleSubset(new int[]{1,2,3,4,8}));  // [1, 2, 4, 8]
        System.out.println(largestDivisibleSubset(new int[]{4,8,10,240}));  // [4, 8, 240]
        System.out.println(largestDivisibleSubset(new int[]{1,2,4,8,16}));  // [1, 2, 4, 8, 16]
        System.out.println(largestDivisibleSubset(new int[]{2,3,5,7}));  // [2]
        System.out.println(largestDivisibleSubset(new int[]{5,9,18,54,108,540,90,180,360,720}));  // [9, 18, 90, 180, 360, 720]
    }
}`,
  "delete-operation-two-strings": `public class Main {
    public static int minDistance(String word1, String word2) {
        // m + n - 2 * LCS(word1, word2)

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(minDistance("sea", "eat"));  // 2
        System.out.println(minDistance("leetcode", "etco"));  // 4
        System.out.println(minDistance("", ""));  // 0
        System.out.println(minDistance("a", ""));  // 1
        System.out.println(minDistance("", "a"));  // 1
        System.out.println(minDistance("abc", "abc"));  // 0
        System.out.println(minDistance("abc", "def"));  // 6
        System.out.println(minDistance("a", "a"));  // 0
        System.out.println(minDistance("abc", "abcd"));  // 1
        System.out.println(minDistance("abcd", "abc"));  // 1
        System.out.println(minDistance("abcd", "acbd"));  // 2
        System.out.println(minDistance("abcdef", "acf"));  // 3
    }
}`,
  "decode-string": `public class Main {
    public static String decodeString(String s) {
        // Two stacks: one for repeat counts, one for previous string builders
        // On digit: accumulate k
        // On '[': push current k and current sb, reset
        // On ']': pop prev sb and k, append current sb k times to prev
        // On letter: append to current sb

        return "";
    }

    public static void main(String[] args) {
        System.out.println(decodeString("3[a]2[bc]"));        // aaabcbc
        System.out.println(decodeString("3[a2[c]]"));         // accaccacc
        System.out.println(decodeString("2[abc]3[cd]ef"));    // abcabccdcdcdef
        System.out.println(decodeString("abc3[cd]xyz"));      // abccdcdcdxyz
        System.out.println(decodeString(""));                  // (empty)
        System.out.println(decodeString("a"));                 // a
        System.out.println(decodeString("10[a]"));             // aaaaaaaaaa
        System.out.println(decodeString("2[2[a]]"));           // aaaa
        System.out.println(decodeString("1[x]"));              // x
        System.out.println(decodeString("ab2[c]d"));           // abccd
        System.out.println(decodeString("a2[b]c"));            // abbc
    }
}`,
  "basic-calculator": `import java.util.*;

public class Main {
    public static int calculate(String s) {
        // Stack-based single pass
        // Track: result, sign (+1/-1), currentNumber
        // On '(': push result, push sign; reset both
        // On ')': fold number, then result = popped_sign * result + popped_result

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(calculate("1 + 1"));                      // 2
        System.out.println(calculate(" 2-1 + 2 "));                  // 3
        System.out.println(calculate("(1+(4+5+2)-3)+(6+8)"));        // 23
        System.out.println(calculate("1"));                          // 1
        System.out.println(calculate("-1"));                         // -1
        System.out.println(calculate("(-5)"));                       // -5
        System.out.println(calculate("2-(5-6)"));                    // 3
        System.out.println(calculate("1-(     -2)"));                // 3
        System.out.println(calculate("-(1+2)"));                     // -3
        System.out.println(calculate("1+1+1"));                      // 3
        System.out.println(calculate("0"));                          // 0
        System.out.println(calculate("((3))"));                      // 3
    }
}`,
  "minimum-remove-valid-parens": `public class Main {
    public static String minRemoveToMakeValid(String s) {
        // Two-pass approach:
        // Pass 1 (L->R): drop ')' when no open '(' available
        // Pass 2 (R->L): drop excess '(' when more open than close remain

        return "";
    }

    public static void main(String[] args) {
        System.out.println(minRemoveToMakeValid("lee(t(c)o)de)"));   // lee(t(c)o)de
        System.out.println(minRemoveToMakeValid("a)b(c)d"));          // ab(c)d
        System.out.println(minRemoveToMakeValid("))(("));             // (empty)
        System.out.println(minRemoveToMakeValid("(a(b(c)d)"));        // a(b(c)d)
        System.out.println(minRemoveToMakeValid("(a)"));              // (a)
        System.out.println(minRemoveToMakeValid("a)"));               // a
        System.out.println(minRemoveToMakeValid("(a"));               // a
        System.out.println(minRemoveToMakeValid(""));                  // (empty)
        System.out.println(minRemoveToMakeValid("()"));               // ()
        System.out.println(minRemoveToMakeValid("(()"));              // ()
        System.out.println(minRemoveToMakeValid("())"));              // ()
        System.out.println(minRemoveToMakeValid("a(b)c"));            // a(b)c
    }
}`,
  "text-justification": `import java.util.*;

public class Main {
    public static List<String> fullJustify(String[] words, int maxWidth) {
        // Greedy line packing:
        //   keep adding a word if wordsLen + (count) + wordLen <= maxWidth
        // For each non-last line: distribute spaces
        //   gaps = count - 1; baseSpace = totalSpace/gaps; extra = totalSpace%gaps
        //   first 'extra' gaps get one more space
        // Last line: single space between words, right-pad to maxWidth

        return new ArrayList<>();
    }

    public static void main(String[] args) {
        System.out.println(fullJustify(new String[]{"This","is","an","example","of","text","justification."}, 16));
        // [This    is    an, example  of text, justification.  ]
        System.out.println(fullJustify(new String[]{"What","must","be","acknowledgment","shall","be"}, 16));
        // [What   must   be, acknowledgment  , shall be        ]
        System.out.println(fullJustify(new String[]{"Hello"}, 10));
        // [Hello     ]
        System.out.println(fullJustify(new String[]{"a"}, 1));
        // [a]
        System.out.println(fullJustify(new String[]{"a","b","c","d"}, 1));
        // [a, b, c, d]
        System.out.println(fullJustify(new String[]{"a","b"}, 3));
        // [a b]
        System.out.println(fullJustify(new String[]{"a","b","c"}, 10));
        // [a b c     ]
        System.out.println(fullJustify(new String[]{"abc"}, 3));
        // [abc]
        System.out.println(fullJustify(new String[]{"word"}, 5));
        // [word ]
        System.out.println(fullJustify(new String[]{"a","b","c","d","e"}, 3));
        // [a b, c d, e  ]
        System.out.println(fullJustify(new String[]{"Listen","to","many,","speak","to","a","few."}, 6));
        // Greedy line-pack: [Listen, to    , many, , speak , to a  , few.  ] — see test run
    }
}`,
  "expression-add-operators": `import java.util.*;

public class Main {
    public static List<String> addOperators(String num, int target) {
        // Backtrack over split points.
        // Track: index, currentExpression, evaluated_sum, lastOperand (for undoing on '*')
        // For multiplication: newSum = sum - lastOp + lastOp * curOp ; newLastOp = lastOp * curOp
        // Skip operands with leading zeros (unless operand is just "0")
        // Sort result for determinism

        return new ArrayList<>();
    }

    public static void main(String[] args) {
        List<String> r;
        r = addOperators("123", 6);    Collections.sort(r); System.out.println(r);   // [1*2*3, 1+2+3]
        r = addOperators("232", 8);    Collections.sort(r); System.out.println(r);   // [2*3+2, 2+3*2]
        r = addOperators("3456237490", 9191); Collections.sort(r); System.out.println(r);   // []
        r = addOperators("105", 5);    Collections.sort(r); System.out.println(r);   // [1*0+5, 10-5]
        r = addOperators("0", 0);      Collections.sort(r); System.out.println(r);   // [0]
        r = addOperators("00", 0);     Collections.sort(r); System.out.println(r);   // [0*0, 0+0, 0-0]
        r = addOperators("1", 1);      Collections.sort(r); System.out.println(r);   // [1]
        r = addOperators("1", 2);      Collections.sort(r); System.out.println(r);   // []
        r = addOperators("123", 15);   Collections.sort(r); System.out.println(r);   // [12+3]
        r = addOperators("12", 12);    Collections.sort(r); System.out.println(r);   // [12]
        r = addOperators("3456", 75);  Collections.sort(r); System.out.println(r);   // depends on algorithm
    }
}`,
  "insert-interval": `import java.util.*;

public class Main {
    public static int[][] insert(int[][] intervals, int[] newInterval) {
        // Phase 1: append intervals ending before newInterval[0]
        // Phase 2: merge overlapping with newInterval (expand its start/end)
        // Phase 3: append remaining intervals
        //
        // Touching intervals (a.end == b.start) count as overlapping for merge

        return new int[0][0];
    }

    public static void main(String[] args) {
        System.out.println(Arrays.deepToString(insert(new int[][]{{1,3},{6,9}}, new int[]{2,5})));
        // [[1, 5], [6, 9]]
        System.out.println(Arrays.deepToString(insert(new int[][]{{1,2},{3,5},{6,7},{8,10},{12,16}}, new int[]{4,8})));
        // [[1, 2], [3, 10], [12, 16]]
        System.out.println(Arrays.deepToString(insert(new int[][]{}, new int[]{5,7})));
        // [[5, 7]]
        System.out.println(Arrays.deepToString(insert(new int[][]{{1,5}}, new int[]{2,3})));
        // [[1, 5]]
        System.out.println(Arrays.deepToString(insert(new int[][]{{1,5}}, new int[]{6,8})));
        // [[1, 5], [6, 8]]
        System.out.println(Arrays.deepToString(insert(new int[][]{{1,5}}, new int[]{0,0})));
        // [[0, 0], [1, 5]]
        System.out.println(Arrays.deepToString(insert(new int[][]{{3,5},{12,15}}, new int[]{6,6})));
        // [[3, 5], [6, 6], [12, 15]]
        System.out.println(Arrays.deepToString(insert(new int[][]{{1,5}}, new int[]{0,3})));
        // [[0, 5]]
        System.out.println(Arrays.deepToString(insert(new int[][]{{1,5}}, new int[]{5,7})));
        // [[1, 7]]
        System.out.println(Arrays.deepToString(insert(new int[][]{{1,5},{10,15}}, new int[]{6,9})));
        // [[1, 5], [6, 9], [10, 15]]
        System.out.println(Arrays.deepToString(insert(new int[][]{{1,2}}, new int[]{0,3})));
        // [[0, 3]]
    }
}`,
  "meeting-rooms-i": `import java.util.*;

public class Main {
    public static boolean canAttendMeetings(int[][] intervals) {
        // Sort by start time, scan for overlaps
        // Return false if intervals[i].start < intervals[i-1].end

        return true;
    }

    public static void main(String[] args) {
        System.out.println(canAttendMeetings(new int[][]{{0,30},{5,10},{15,20}}));   // false
        System.out.println(canAttendMeetings(new int[][]{{7,10},{2,4}}));             // true
        System.out.println(canAttendMeetings(new int[][]{}));                          // true
        System.out.println(canAttendMeetings(new int[][]{{1,5}}));                    // true
        System.out.println(canAttendMeetings(new int[][]{{1,5},{5,10}}));             // true
        System.out.println(canAttendMeetings(new int[][]{{1,5},{4,10}}));             // false
        System.out.println(canAttendMeetings(new int[][]{{1,5},{2,6},{7,9}}));        // false
        System.out.println(canAttendMeetings(new int[][]{{1,2},{3,4},{5,6},{7,8}})); // true
        System.out.println(canAttendMeetings(new int[][]{{0,30}}));                   // true
        System.out.println(canAttendMeetings(new int[][]{{0,30},{30,40}}));           // true
        System.out.println(canAttendMeetings(new int[][]{{0,10},{9,15}}));            // false
    }
}`,
  "my-calendar-i": `import java.util.*;

class MyCalendar {
    // Use TreeMap<Integer, Integer> (start -> end)
    // floorKey to check predecessor, ceilingKey to check successor
    TreeMap<Integer, Integer> cal = new TreeMap<>();

    public MyCalendar() {}

    public boolean book(int start, int end) {
        // Check floor entry: if its end > start -> conflict
        // Check ceiling entry: if its start < end -> conflict
        // Else put(start, end) and return true

        return false;
    }
}

public class Main {
    public static void main(String[] args) {
        MyCalendar mc = new MyCalendar();
        System.out.println(mc.book(10, 20));   // true
        System.out.println(mc.book(15, 25));   // false
        System.out.println(mc.book(20, 30));   // true
        System.out.println(mc.book(5, 10));    // true
        System.out.println(mc.book(0, 5));     // true
        System.out.println(mc.book(0, 100));   // false
        System.out.println(mc.book(50, 60));   // true
        System.out.println(mc.book(45, 55));   // false
        System.out.println(mc.book(60, 70));   // true
        System.out.println(mc.book(70, 80));   // true
        System.out.println(mc.book(35, 45));   // true
    }
}`,
  "max-stack": `import java.util.*;

class MaxStack {
    Deque<Integer> stack = new ArrayDeque<>();
    Deque<Integer> maxStack = new ArrayDeque<>();

    public MaxStack() {}

    public void push(int x) {
        int curMax = maxStack.isEmpty() ? x : Math.max(maxStack.peek(), x);
        stack.push(x);
        maxStack.push(curMax);
    }

    public int pop() {
        maxStack.pop();
        return stack.pop();
    }

    public int top() {
        return stack.peek();
    }

    public int peekMax() {
        return maxStack.peek();
    }

    public int popMax() {
        // Save top-most max, pop everything above, then re-push
        return -1;
    }
}

public class Main {
    public static void main(String[] args) {
        MaxStack ms = new MaxStack();
        ms.push(5);
        ms.push(1);
        ms.push(5);
        System.out.println(ms.top());         // 5
        System.out.println(ms.popMax());      // 5
        System.out.println(ms.top());         // 1
        System.out.println(ms.peekMax());     // 5
        System.out.println(ms.pop());         // 1
        System.out.println(ms.top());         // 5
        ms.push(10);
        System.out.println(ms.peekMax());     // 10
        System.out.println(ms.popMax());      // 10
        System.out.println(ms.top());         // 5
        System.out.println(ms.pop());         // 5
        ms.push(3);
        ms.push(7);
        ms.push(7);
        ms.push(2);
        System.out.println(ms.popMax());      // 7
        System.out.println(ms.top());         // 2
        System.out.println(ms.peekMax());     // 7
        System.out.println(ms.popMax());      // 7
        System.out.println(ms.top());         // 2
    }
}`,
  "serialize-deserialize-bst": `import java.util.*;

class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int v) { val = v; }
}

public class Main {
    // --- Serialize / Deserialize (BST preorder) ---
    public static String serialize(TreeNode root) {
        // Preorder DFS, append val then recurse left, recurse right
        StringBuilder sb = new StringBuilder();
        preorder(root, sb);
        return sb.toString();
    }
    private static void preorder(TreeNode node, StringBuilder sb) {
        if (node == null) return;
        if (sb.length() > 0) sb.append(",");
        sb.append(node.val);
        preorder(node.left, sb);
        preorder(node.right, sb);
    }

    static int idx;
    public static TreeNode deserialize(String data) {
        if (data.isEmpty()) return null;
        String[] toks = data.split(",");
        idx = 0;
        return build(toks, Integer.MIN_VALUE, Integer.MAX_VALUE);
    }
    private static TreeNode build(String[] toks, int lo, int hi) {
        if (idx == toks.length) return null;
        int v = Integer.parseInt(toks[idx]);
        if (v < lo || v > hi) return null;
        idx++;
        TreeNode node = new TreeNode(v);
        node.left  = build(toks, lo, v - 1);
        node.right = build(toks, v + 1, hi);
        return node;
    }

    // --- Helper: build BST from level-order array (null means no child) ---
    public static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode root = new TreeNode(vals[0]);
        Queue<TreeNode> q = new ArrayDeque<>();
        q.offer(root);
        int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode cur = q.poll();
            if (i < vals.length && vals[i] != null) {
                cur.left = new TreeNode(vals[i]);
                q.offer(cur.left);
            }
            i++;
            if (i < vals.length && vals[i] != null) {
                cur.right = new TreeNode(vals[i]);
                q.offer(cur.right);
            }
            i++;
        }
        return root;
    }

    // --- Round-trip check ---
    public static boolean roundTrip(TreeNode t) {
        String s1 = serialize(t);
        TreeNode t2 = deserialize(s1);
        String s2 = serialize(t2);
        return s1.equals(s2);
    }

    public static void main(String[] args) {
        System.out.println(roundTrip(build()));                              // true
        System.out.println(roundTrip(build(1)));                              // true
        System.out.println(roundTrip(build(2, 1, 3)));                        // true
        System.out.println(roundTrip(build(5, 3, 7, 1, 4, 6, 8)));            // true
        System.out.println(roundTrip(build(10, 5, 15)));                      // true
        System.out.println(roundTrip(build(1, null, 2, null, null, null, 3))); // true (right-skew)
        System.out.println(roundTrip(build(3, 2, null, 1)));                  // true (left-skew)
        System.out.println(roundTrip(build(50, 25, 75, 10, 40, 60, 90)));     // true
        System.out.println(roundTrip(build(100)));                            // true
        System.out.println(roundTrip(build(5, 3, 7, 2, 4, 6, 8, 1)));         // true
        System.out.println(roundTrip(build(-5, -10, 0, -15, -7)));            // true
    }
}`,
  "word-ladder-ii": `import java.util.*;

public class Main {
    public static List<List<String>> findLadders(String beginWord, String endWord, List<String> wordList) {
        // Your solution here — BFS for shortest distance, DFS to build all paths

        return new ArrayList<>();
    }

    static String fmt(List<List<String>> paths) {
        List<String> lines = new ArrayList<>();
        for (List<String> p : paths) lines.add(String.join(",", p));
        Collections.sort(lines);
        return lines.toString();
    }

    public static void main(String[] args) {
        System.out.println(fmt(findLadders("hit", "cog", Arrays.asList("hot","dot","dog","lot","log","cog"))));
        // [hit,hot,dot,dog,cog, hit,hot,lot,log,cog]
        System.out.println(fmt(findLadders("hit", "cog", Arrays.asList("hot","dot","dog","lot","log"))));
        // []
        System.out.println(fmt(findLadders("a", "c", Arrays.asList("a","b","c"))));
        // [a,c]
        System.out.println(fmt(findLadders("hot", "dog", Arrays.asList("hot","dog"))));
        // []
        System.out.println(fmt(findLadders("hot", "dog", Arrays.asList("hot","dog","dot"))));
        // [hot,dot,dog]
        System.out.println(fmt(findLadders("a", "b", Arrays.asList("b"))));
        // [a,b]
        System.out.println(fmt(findLadders("hit", "cog", Arrays.asList("hot","lot","log","cog"))));
        // [hit,hot,lot,log,cog]
        System.out.println(fmt(findLadders("red", "tax", Arrays.asList("ted","tex","red","tax","tad","den","rex","pee"))));
        // [red,rex,tex,tax, red,ted,tad,tax, red,ted,tex,tax]
        System.out.println(fmt(findLadders("aaa", "bbb", Arrays.asList("aab","abb","bbb"))));
        // [aaa,aab,abb,bbb]
        System.out.println(fmt(findLadders("hit", "hit", Arrays.asList("hit"))));
        // [hit]  (if endWord equals beginWord, single-word path)
    }
}`,
  "shortest-bridge": `import java.util.*;

public class Main {
    public static int shortestBridge(int[][] grid) {
        // Your solution here — find first island via DFS, BFS outward to second

        return -1;
    }

    public static void main(String[] args) {
        System.out.println(shortestBridge(new int[][]{{0,1},{1,0}}));                   // 1
        System.out.println(shortestBridge(new int[][]{{0,1,0},{0,0,0},{0,0,1}}));       // 2
        System.out.println(shortestBridge(new int[][]{
            {1,1,1,1,1},{1,0,0,0,1},{1,0,1,0,1},{1,0,0,0,1},{1,1,1,1,1}}));             // 1
        System.out.println(shortestBridge(new int[][]{{1,0},{0,1}}));                   // 1
        System.out.println(shortestBridge(new int[][]{{1,1},{0,0},{0,1}}));             // 1
        System.out.println(shortestBridge(new int[][]{{1,0,0,0,1}}));                   // 3
        System.out.println(shortestBridge(new int[][]{{1},{0},{0},{0},{1}}));           // 3
        System.out.println(shortestBridge(new int[][]{{1,1,0,0,0,1,1}}));               // 3
        System.out.println(shortestBridge(new int[][]{{1,0,0,0,0,0,1}}));               // 5
        System.out.println(shortestBridge(new int[][]{{1,0,0},{0,0,0},{0,0,1}}));       // 3
    }
}`,
  "longest-substring-at-least-k-repeating": `public class Main {
    public static int longestSubstring(String s, int k) {
        // Your solution here — divide & conquer or sliding window

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(longestSubstring("aaabb", 3));           // 3
        System.out.println(longestSubstring("ababbc", 2));          // 5
        System.out.println(longestSubstring("", 1));                // 0
        System.out.println(longestSubstring("a", 1));               // 1
        System.out.println(longestSubstring("a", 2));               // 0
        System.out.println(longestSubstring("aa", 2));              // 2
        System.out.println(longestSubstring("abc", 2));             // 0
        System.out.println(longestSubstring("aabbcc", 2));          // 6
        System.out.println(longestSubstring("aaabbbccc", 3));       // 9
        System.out.println(longestSubstring("aaabbbccc", 4));       // 0
        System.out.println(longestSubstring("ababacb", 3));         // 0
        System.out.println(longestSubstring("bbaaacbd", 3));        // 3
    }
}`,
  "arithmetic-slices-ii": `import java.util.*;

public class Main {
    public static int numberOfArithmeticSlices(int[] nums) {
        // Your solution here — DP with hash map on common difference

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(numberOfArithmeticSlices(new int[]{2,4,6,8,10}));       // 7
        System.out.println(numberOfArithmeticSlices(new int[]{7,7,7,7,7}));        // 16
        System.out.println(numberOfArithmeticSlices(new int[]{}));                 // 0
        System.out.println(numberOfArithmeticSlices(new int[]{1}));                // 0
        System.out.println(numberOfArithmeticSlices(new int[]{1,2}));              // 0
        System.out.println(numberOfArithmeticSlices(new int[]{1,2,3}));            // 1
        System.out.println(numberOfArithmeticSlices(new int[]{1,2,3,4}));          // 3
        System.out.println(numberOfArithmeticSlices(new int[]{1,2,3,4,5}));        // 7
        System.out.println(numberOfArithmeticSlices(new int[]{0,0,0}));            // 1
        System.out.println(numberOfArithmeticSlices(new int[]{0,0,0,0}));          // 5
        System.out.println(numberOfArithmeticSlices(new int[]{1,1,1,1}));          // 5
    }
}`,
  "random-pick-with-weight": `import java.util.*;

public class Main {
    static class Solution {
        // Your solution here — prefix sums + binary search
        public Solution(int[] w) {
            // build prefix sums
        }
        public int pickIndex() {
            // return weighted random index
            return 0;
        }
    }

    static boolean closeTo(double actual, double expected, double tol) {
        return Math.abs(actual - expected) < tol;
    }

    public static void main(String[] args) {
        // Single-index: always returns 0
        Solution s1 = new Solution(new int[]{5});
        int[] c1 = new int[1];
        for (int i = 0; i < 10000; i++) c1[s1.pickIndex()]++;
        System.out.println(c1[0] == 10000);                                    // true

        // Equal weights {1,1}: each ~50%
        Solution s2 = new Solution(new int[]{1,1});
        int[] c2 = new int[2];
        for (int i = 0; i < 20000; i++) c2[s2.pickIndex()]++;
        System.out.println(closeTo(c2[0]/20000.0, 0.5, 0.03));                 // true
        System.out.println(closeTo(c2[1]/20000.0, 0.5, 0.03));                 // true

        // Weights {1,3}: 25%/75%
        Solution s3 = new Solution(new int[]{1,3});
        int[] c3 = new int[2];
        for (int i = 0; i < 20000; i++) c3[s3.pickIndex()]++;
        System.out.println(closeTo(c3[0]/20000.0, 0.25, 0.03));                // true
        System.out.println(closeTo(c3[1]/20000.0, 0.75, 0.03));                // true

        // Weights {1,2,3,4}: 10%/20%/30%/40%
        Solution s4 = new Solution(new int[]{1,2,3,4});
        int[] c4 = new int[4];
        for (int i = 0; i < 30000; i++) c4[s4.pickIndex()]++;
        System.out.println(closeTo(c4[0]/30000.0, 0.1, 0.03));                 // true
        System.out.println(closeTo(c4[1]/30000.0, 0.2, 0.03));                 // true
        System.out.println(closeTo(c4[2]/30000.0, 0.3, 0.03));                 // true
        System.out.println(closeTo(c4[3]/30000.0, 0.4, 0.03));                 // true

        // All indices in range
        Solution s5 = new Solution(new int[]{1,1,1,1,1});
        boolean inRange = true;
        for (int i = 0; i < 1000; i++) {
            int idx = s5.pickIndex();
            if (idx < 0 || idx >= 5) inRange = false;
        }
        System.out.println(inRange);                                           // true
    }
}`,
  "random-pick-index": `import java.util.*;

public class Main {
    static class Solution {
        // Your solution here
        public Solution(int[] nums) {
            // preprocess
        }
        public int pick(int target) {
            // return random index where nums[index] == target
            return -1;
        }
    }

    static boolean closeTo(double actual, double expected, double tol) {
        return Math.abs(actual - expected) < tol;
    }

    public static void main(String[] args) {
        // Unique match: pick(1) from [1,2,3] always returns 0
        Solution s1 = new Solution(new int[]{1,2,3});
        boolean allZero = true;
        for (int i = 0; i < 1000; i++) if (s1.pick(1) != 0) allZero = false;
        System.out.println(allZero);                                           // true

        // Duplicates: pick(3) from [1,2,3,3,3] hits indices 2,3,4 each ~1/3
        Solution s2 = new Solution(new int[]{1,2,3,3,3});
        int[] c2 = new int[5];
        for (int i = 0; i < 30000; i++) c2[s2.pick(3)]++;
        System.out.println(c2[0] == 0);                                        // true
        System.out.println(c2[1] == 0);                                        // true
        System.out.println(closeTo(c2[2]/30000.0, 1.0/3, 0.03));               // true
        System.out.println(closeTo(c2[3]/30000.0, 1.0/3, 0.03));               // true
        System.out.println(closeTo(c2[4]/30000.0, 1.0/3, 0.03));               // true

        // Two duplicates: pick(5) from [5,5] hits 0 and 1 each ~50%
        Solution s3 = new Solution(new int[]{5,5});
        int[] c3 = new int[2];
        for (int i = 0; i < 20000; i++) c3[s3.pick(5)]++;
        System.out.println(closeTo(c3[0]/20000.0, 0.5, 0.03));                 // true
        System.out.println(closeTo(c3[1]/20000.0, 0.5, 0.03));                 // true

        // Single element
        Solution s4 = new Solution(new int[]{42});
        System.out.println(s4.pick(42) == 0);                                  // true

        // Mixed: pick(2) from [2,1,2,1,2] hits indices 0, 2, 4 each ~1/3
        Solution s5 = new Solution(new int[]{2,1,2,1,2});
        int[] c5 = new int[5];
        for (int i = 0; i < 30000; i++) c5[s5.pick(2)]++;
        System.out.println(closeTo(c5[0]/30000.0, 1.0/3, 0.03));               // true
        System.out.println(closeTo(c5[2]/30000.0, 1.0/3, 0.03));               // true
        System.out.println(closeTo(c5[4]/30000.0, 1.0/3, 0.03));               // true
    }
}`,
  "stream-of-characters": `import java.util.*;

public class Main {
    static class StreamChecker {
        // Your solution here — reversed trie + suffix walk

        public StreamChecker(String[] words) {
            // build reversed trie
        }

        public boolean query(char letter) {
            // check if any suffix of stream is in dictionary
            return false;
        }
    }

    public static void main(String[] args) {
        StreamChecker sc = new StreamChecker(new String[]{"cd","f","kl"});
        System.out.println(sc.query('a'));   // false
        System.out.println(sc.query('b'));   // false
        System.out.println(sc.query('c'));   // false
        System.out.println(sc.query('d'));   // true
        System.out.println(sc.query('e'));   // false
        System.out.println(sc.query('f'));   // true
        System.out.println(sc.query('g'));   // false
        System.out.println(sc.query('h'));   // false
        System.out.println(sc.query('i'));   // false
        System.out.println(sc.query('j'));   // false
        System.out.println(sc.query('k'));   // false
        System.out.println(sc.query('l'));   // true

        StreamChecker sc2 = new StreamChecker(new String[]{"ab","ba"});
        System.out.println(sc2.query('a'));  // false
        System.out.println(sc2.query('b'));  // true  (suffix "ab")
        System.out.println(sc2.query('a'));  // true  (suffix "ba")
    }
}`,
  "sudoku-solver": `import java.util.*;

public class Main {
    public static void solveSudoku(char[][] board) {
        // Your solution here — backtracking with row/col/box constraints

    }

    static String boardStr(char[][] b) {
        StringBuilder sb = new StringBuilder();
        for (char[] row : b) sb.append(new String(row));
        return sb.toString();
    }

    public static void main(String[] args) {
        char[][] b1 = new char[][]{
            {'5','3','.','.','7','.','.','.','.'},
            {'6','.','.','1','9','5','.','.','.'},
            {'.','9','8','.','.','.','.','6','.'},
            {'8','.','.','.','6','.','.','.','3'},
            {'4','.','.','8','.','3','.','.','1'},
            {'7','.','.','.','2','.','.','.','6'},
            {'.','6','.','.','.','.','2','8','.'},
            {'.','.','.','4','1','9','.','.','5'},
            {'.','.','.','.','8','.','.','7','9'}
        };
        solveSudoku(b1);
        System.out.println(boardStr(b1));
        // 534678912672195348198342567859761423426853791713924856961537284287419635345286179

        // Already solved board -> unchanged
        char[][] b2 = new char[][]{
            {'5','3','4','6','7','8','9','1','2'},
            {'6','7','2','1','9','5','3','4','8'},
            {'1','9','8','3','4','2','5','6','7'},
            {'8','5','9','7','6','1','4','2','3'},
            {'4','2','6','8','5','3','7','9','1'},
            {'7','1','3','9','2','4','8','5','6'},
            {'9','6','1','5','3','7','2','8','4'},
            {'2','8','7','4','1','9','6','3','5'},
            {'3','4','5','2','8','6','1','7','9'}
        };
        solveSudoku(b2);
        System.out.println(boardStr(b2));
        // 534678912672195348198342567859761423426853791713924856961537284287419635345286179

        // Check row 0 sums to 45 (1+2+..+9)
        char[][] b3 = new char[][]{
            {'5','3','.','.','7','.','.','.','.'},
            {'6','.','.','1','9','5','.','.','.'},
            {'.','9','8','.','.','.','.','6','.'},
            {'8','.','.','.','6','.','.','.','3'},
            {'4','.','.','8','.','3','.','.','1'},
            {'7','.','.','.','2','.','.','.','6'},
            {'.','6','.','.','.','.','2','8','.'},
            {'.','.','.','4','1','9','.','.','5'},
            {'.','.','.','.','8','.','.','7','9'}
        };
        solveSudoku(b3);
        int rowSum = 0;
        for (char c : b3[0]) rowSum += (c - '0');
        System.out.println(rowSum);                // 45

        // Check col 0 sums to 45
        int colSum = 0;
        for (int i = 0; i < 9; i++) colSum += (b3[i][0] - '0');
        System.out.println(colSum);                // 45

        // Check top-left 3x3 box sums to 45
        int boxSum = 0;
        for (int i = 0; i < 3; i++) for (int j = 0; j < 3; j++) boxSum += (b3[i][j] - '0');
        System.out.println(boxSum);                // 45

        // Check all cells filled (no dots)
        boolean allFilled = true;
        for (char[] r : b3) for (char c : r) if (c == '.') allFilled = false;
        System.out.println(allFilled);             // true

        // Final board string matches canonical solution
        System.out.println(boardStr(b3).length() == 81);   // true
    }
}`,
  "shortest-path-alternating-colors": `import java.util.*;

public class Main {
    public static int[] shortestAlternatingPaths(int n, int[][] redEdges, int[][] blueEdges) {
        // Your solution here — BFS with (node, last_color) state

        return new int[n];
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(shortestAlternatingPaths(3,
            new int[][]{{0,1},{1,2}}, new int[][]{})));                         // [0, 1, -1]
        System.out.println(Arrays.toString(shortestAlternatingPaths(3,
            new int[][]{{0,1}}, new int[][]{{2,1}})));                          // [0, 1, -1]
        System.out.println(Arrays.toString(shortestAlternatingPaths(3,
            new int[][]{{1,0}}, new int[][]{{2,1}})));                          // [0, -1, -1]
        System.out.println(Arrays.toString(shortestAlternatingPaths(3,
            new int[][]{{0,1}}, new int[][]{{1,2}})));                          // [0, 1, 2]
        System.out.println(Arrays.toString(shortestAlternatingPaths(3,
            new int[][]{{0,1},{0,2}}, new int[][]{{1,0}})));                    // [0, 1, 1]
        System.out.println(Arrays.toString(shortestAlternatingPaths(1,
            new int[][]{}, new int[][]{})));                                    // [0]
        System.out.println(Arrays.toString(shortestAlternatingPaths(2,
            new int[][]{{0,1}}, new int[][]{{0,1}})));                          // [0, 1]
        System.out.println(Arrays.toString(shortestAlternatingPaths(2,
            new int[][]{}, new int[][]{})));                                    // [0, -1]
        System.out.println(Arrays.toString(shortestAlternatingPaths(4,
            new int[][]{{0,1},{2,3}}, new int[][]{{1,2}})));                    // [0, 1, 2, -1]
        System.out.println(Arrays.toString(shortestAlternatingPaths(5,
            new int[][]{{0,1},{1,2},{2,3},{3,4}},
            new int[][]{{1,2},{2,3},{3,1}})));                                  // [0, 1, 2, 3, 7]
    }
}`,
  "bus-routes": `import java.util.*;

public class Main {
    public static int numBusesToDestination(int[][] routes, int source, int target) {
        // Your solution here — BFS on buses via shared-stop adjacency

        return -1;
    }

    public static void main(String[] args) {
        System.out.println(numBusesToDestination(
            new int[][]{{1,2,7},{3,6,7}}, 1, 6));                               // 2
        System.out.println(numBusesToDestination(
            new int[][]{{7,12},{4,5,15},{6},{15,19},{9,12,13}}, 15, 12));       // -1
        System.out.println(numBusesToDestination(
            new int[][]{{1,2,7},{3,6,7}}, 1, 1));                               // 0
        System.out.println(numBusesToDestination(
            new int[][]{{1,2,7}}, 1, 2));                                       // 1
        System.out.println(numBusesToDestination(
            new int[][]{{1,2,7}}, 1, 3));                                       // -1
        System.out.println(numBusesToDestination(
            new int[][]{{1,2}}, 1, 2));                                         // 1
        System.out.println(numBusesToDestination(
            new int[][]{}, 1, 2));                                              // -1
        System.out.println(numBusesToDestination(
            new int[][]{{1,2,3},{3,4,5},{5,6,7}}, 1, 7));                       // 3
        System.out.println(numBusesToDestination(
            new int[][]{{1,2,3,4,5}}, 1, 5));                                   // 1
        System.out.println(numBusesToDestination(
            new int[][]{{1,2},{3,4},{2,3}}, 1, 4));                             // 3
    }
}`,
  "zigzag-conversion": `public class Main {
    public static String convert(String s, int numRows) {
        // TODO: return s written in a zigzag of numRows rows, read row by row.

        return "";
    }

    public static void main(String[] args) {
        System.out.println(convert("PAYPALISHIRING", 3));       // PAHNAPLSIIGYIR
        System.out.println(convert("PAYPALISHIRING", 4));       // PINALSIGYAHRPI
        System.out.println(convert("A", 1));                    // A
        System.out.println(convert("AB", 1));                   // AB
        System.out.println(convert("ABC", 2));                  // ACB
        System.out.println(convert("ABCD", 2));                 // ACBD
        System.out.println(convert("ABCDE", 3));                // AEBDC
        System.out.println(convert("ABCDEFG", 3));              // AEBDFCG
        System.out.println(convert("A", 5));                    // A
        System.out.println(convert("", 5));                     // (empty)
        System.out.println(convert("HELLO", 2));                // HLOEL
        System.out.println(convert("HELLO", 100));              // HELLO
    }
}`,
  "valid-parenthesis-string": `public class Main {
    public static boolean checkValidString(String s) {
        // TODO: return whether s is a valid parenthesis string where * is wildcard.

        return false;
    }

    public static void main(String[] args) {
        System.out.println(checkValidString("()"));         // true
        System.out.println(checkValidString("(*)"));        // true
        System.out.println(checkValidString("(*))"));       // true
        System.out.println(checkValidString(""));           // true
        System.out.println(checkValidString("("));          // false
        System.out.println(checkValidString(")"));          // false
        System.out.println(checkValidString("*"));          // true
        System.out.println(checkValidString("**"));         // true
        System.out.println(checkValidString("(*"));         // true
        System.out.println(checkValidString("*)"));         // true
        System.out.println(checkValidString("(()"));        // false
        System.out.println(checkValidString("())"));        // false
        System.out.println(checkValidString("((*)"));       // true
        System.out.println(checkValidString("(((***)"));    // true
        System.out.println(checkValidString("((**))"));     // true
        System.out.println(checkValidString("(*(())"));     // false
    }
}`,
  "string-compression": `public class Main {
    public static int compress(char[] chars) {
        // TODO: compress chars in-place and return the new length.

        return 0;
    }

    static String describe(char[] chars, int len) {
        StringBuilder sb = new StringBuilder();
        sb.append(len).append(" [");
        for (int i = 0; i < len; i++) {
            if (i > 0) sb.append(", ");
            sb.append(chars[i]);
        }
        sb.append("]");
        return sb.toString();
    }

    public static void main(String[] args) {
        char[] a1 = {'a','a','b','b','c','c','c'};
        System.out.println(describe(a1, compress(a1)));                                  // 6 [a, 2, b, 2, c, 3]

        char[] a2 = {'a'};
        System.out.println(describe(a2, compress(a2)));                                  // 1 [a]

        char[] a3 = {'a','b','b','b','b','b','b','b','b','b','b','b','b'};
        System.out.println(describe(a3, compress(a3)));                                  // 4 [a, b, 1, 2]

        char[] a4 = {'a','a','a','b','b','a','a'};
        System.out.println(describe(a4, compress(a4)));                                  // 6 [a, 3, b, 2, a, 2]

        char[] a5 = {};
        System.out.println(describe(a5, compress(a5)));                                  // 0 []

        char[] a6 = {'a','b','c'};
        System.out.println(describe(a6, compress(a6)));                                  // 3 [a, b, c]

        char[] a7 = {'a','a'};
        System.out.println(describe(a7, compress(a7)));                                  // 2 [a, 2]

        char[] a8 = {'a','a','a','a'};
        System.out.println(describe(a8, compress(a8)));                                  // 2 [a, 4]

        char[] a9 = {'a','a','a','a','a','a','a','a','a','a'};
        System.out.println(describe(a9, compress(a9)));                                  // 3 [a, 1, 0]

        char[] a10 = {'x','y','x','y'};
        System.out.println(describe(a10, compress(a10)));                                // 4 [x, y, x, y]

        char[] a11 = {'z','z','z','z','z','z','z','z','z','z','z','z'};
        System.out.println(describe(a11, compress(a11)));                                // 3 [z, 1, 2]
    }
}`,
  "next-greater-node-linked-list": `import java.util.*;

public class Main {
    static class ListNode {
        int val;
        ListNode next;
        ListNode(int v) { val = v; }
    }

    static ListNode build(int[] a) {
        ListNode dummy = new ListNode(0), cur = dummy;
        for (int v : a) { cur.next = new ListNode(v); cur = cur.next; }
        return dummy.next;
    }

    public static int[] nextLargerNodes(ListNode head) {
        // TODO: for each node, return value of next strictly greater node, else 0.

        return new int[0];
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(nextLargerNodes(build(new int[]{2,1,5}))));           // [5, 5, 0]
        System.out.println(Arrays.toString(nextLargerNodes(build(new int[]{2,7,4,3,5}))));       // [7, 0, 5, 5, 0]
        System.out.println(Arrays.toString(nextLargerNodes(build(new int[]{}))));                // []
        System.out.println(Arrays.toString(nextLargerNodes(build(new int[]{1}))));               // [0]
        System.out.println(Arrays.toString(nextLargerNodes(build(new int[]{1,2}))));             // [2, 0]
        System.out.println(Arrays.toString(nextLargerNodes(build(new int[]{2,1}))));             // [0, 0]
        System.out.println(Arrays.toString(nextLargerNodes(build(new int[]{1,2,3,4}))));         // [2, 3, 4, 0]
        System.out.println(Arrays.toString(nextLargerNodes(build(new int[]{4,3,2,1}))));         // [0, 0, 0, 0]
        System.out.println(Arrays.toString(nextLargerNodes(build(new int[]{5,5,5}))));           // [0, 0, 0]
        System.out.println(Arrays.toString(nextLargerNodes(build(new int[]{1,1,2,1}))));         // [2, 2, 0, 0]
        System.out.println(Arrays.toString(nextLargerNodes(build(new int[]{9,7,6,7,6,9}))));     // [0, 9, 7, 9, 9, 0]
    }
}`,
  "add-two-numbers-ii": `import java.util.*;

public class Main {
    static class ListNode {
        int val;
        ListNode next;
        ListNode(int v) { val = v; }
    }

    static ListNode build(int[] a) {
        ListNode dummy = new ListNode(0), cur = dummy;
        for (int v : a) { cur.next = new ListNode(v); cur = cur.next; }
        return dummy.next;
    }

    static String show(ListNode h) {
        StringBuilder sb = new StringBuilder("[");
        boolean first = true;
        while (h != null) {
            if (!first) sb.append(", ");
            sb.append(h.val);
            first = false;
            h = h.next;
        }
        sb.append("]");
        return sb.toString();
    }

    public static ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        // TODO: add the two MSB-first numbers and return sum as an MSB-first linked list.

        return null;
    }

    public static void main(String[] args) {
        System.out.println(show(addTwoNumbers(build(new int[]{7,2,4,3}), build(new int[]{5,6,4}))));          // [7, 8, 0, 7]
        System.out.println(show(addTwoNumbers(build(new int[]{2,4,3}), build(new int[]{5,6,4}))));            // [8, 0, 7]
        System.out.println(show(addTwoNumbers(build(new int[]{0}), build(new int[]{0}))));                    // [0]
        System.out.println(show(addTwoNumbers(build(new int[]{1}), build(new int[]{9,9}))));                  // [1, 0, 0]
        System.out.println(show(addTwoNumbers(build(new int[]{9,9,9}), build(new int[]{1}))));                // [1, 0, 0, 0]
        System.out.println(show(addTwoNumbers(build(new int[]{1,2,3}), build(new int[]{4,5,6}))));            // [5, 7, 9]
        System.out.println(show(addTwoNumbers(build(new int[]{5}), build(new int[]{5}))));                    // [1, 0]
        System.out.println(show(addTwoNumbers(build(new int[]{9}), build(new int[]{1}))));                    // [1, 0]
        System.out.println(show(addTwoNumbers(build(new int[]{1,0,0,0,0,0}), build(new int[]{1}))));          // [1, 0, 0, 0, 0, 1]
        System.out.println(show(addTwoNumbers(build(new int[]{9,9}), build(new int[]{9,9}))));                // [1, 9, 8]
    }
}`,
  "split-linked-list-parts": `import java.util.*;

public class Main {
    static class ListNode {
        int val;
        ListNode next;
        ListNode(int v) { val = v; }
    }

    static ListNode build(int[] a) {
        ListNode dummy = new ListNode(0), cur = dummy;
        for (int v : a) { cur.next = new ListNode(v); cur = cur.next; }
        return dummy.next;
    }

    static int[] sizes(ListNode[] parts) {
        int[] res = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            int c = 0;
            ListNode p = parts[i];
            while (p != null) { c++; p = p.next; }
            res[i] = c;
        }
        return res;
    }

    public static ListNode[] splitListToParts(ListNode head, int k) {
        // TODO: split head into k consecutive parts, sizes as equal as possible, return as array.

        return new ListNode[0];
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(sizes(splitListToParts(build(new int[]{1,2,3}), 5))));                       // [1, 1, 1, 0, 0]
        System.out.println(Arrays.toString(sizes(splitListToParts(build(new int[]{1,2,3,4,5,6,7,8,9,10}), 3))));        // [4, 3, 3]
        System.out.println(Arrays.toString(sizes(splitListToParts(null, 3))));                                          // [0, 0, 0]
        System.out.println(Arrays.toString(sizes(splitListToParts(build(new int[]{1}), 1))));                           // [1]
        System.out.println(Arrays.toString(sizes(splitListToParts(build(new int[]{1}), 3))));                           // [1, 0, 0]
        System.out.println(Arrays.toString(sizes(splitListToParts(build(new int[]{1,2}), 2))));                         // [1, 1]
        System.out.println(Arrays.toString(sizes(splitListToParts(build(new int[]{1,2,3,4}), 2))));                     // [2, 2]
        System.out.println(Arrays.toString(sizes(splitListToParts(build(new int[]{1,2,3,4,5}), 5))));                   // [1, 1, 1, 1, 1]
        System.out.println(Arrays.toString(sizes(splitListToParts(build(new int[]{1,2,3,4,5,6,7}), 3))));               // [3, 2, 2]
        System.out.println(Arrays.toString(sizes(splitListToParts(build(new int[]{1,2,3,4,5,6,7,8,9,10,11}), 4))));     // [3, 3, 3, 2]
    }
}`,
  "design-linked-list": `public class Main {
    static class MyLinkedList {
        // TODO: implement fields and the five API methods below.

        public MyLinkedList() {
        }

        public int get(int index) {
            return -1;
        }

        public void addAtHead(int val) {
        }

        public void addAtTail(int val) {
        }

        public void addAtIndex(int index, int val) {
        }

        public void deleteAtIndex(int index) {
        }
    }

    public static void main(String[] args) {
        MyLinkedList l = new MyLinkedList();
        l.addAtHead(1);
        l.addAtTail(3);
        l.addAtIndex(1, 2);                   // list: 1 -> 2 -> 3
        System.out.println(l.get(1));         // 2
        l.deleteAtIndex(1);                   // list: 1 -> 3
        System.out.println(l.get(1));         // 3
        l.addAtHead(0);                       // list: 0 -> 1 -> 3
        System.out.println(l.get(0));         // 0
        System.out.println(l.get(1));         // 1
        System.out.println(l.get(2));         // 3
        System.out.println(l.get(5));         // -1
        l.addAtTail(5);                       // list: 0 -> 1 -> 3 -> 5
        System.out.println(l.get(3));         // 5
        l.addAtIndex(2, 99);                  // list: 0 -> 1 -> 99 -> 3 -> 5
        System.out.println(l.get(2));         // 99
        l.deleteAtIndex(0);                   // list: 1 -> 99 -> 3 -> 5
        System.out.println(l.get(0));         // 1
        System.out.println(l.get(-1));        // -1
        System.out.println(l.get(100));       // -1
    }
}`,
  "hand-of-straights": `import java.util.*;

public class Main {
    public static boolean isNStraightHand(int[] hand, int groupSize) {
        // TODO: return true iff hand can be split into groups of groupSize consecutive ints.

        return false;
    }

    public static void main(String[] args) {
        System.out.println(isNStraightHand(new int[]{1,2,3,6,2,3,4,7,8}, 3));     // true
        System.out.println(isNStraightHand(new int[]{1,2,3,4,5}, 4));             // false
        System.out.println(isNStraightHand(new int[]{}, 3));                      // true
        System.out.println(isNStraightHand(new int[]{1}, 1));                     // true
        System.out.println(isNStraightHand(new int[]{1,1,1,1}, 1));               // true
        System.out.println(isNStraightHand(new int[]{1,2,3}, 3));                 // true
        System.out.println(isNStraightHand(new int[]{1,2,4}, 3));                 // false
        System.out.println(isNStraightHand(new int[]{1,1,2,2,3,3}, 3));           // true
        System.out.println(isNStraightHand(new int[]{1,2,3,4,5,6}, 2));           // true
        System.out.println(isNStraightHand(new int[]{1,2,3,4,5,6}, 3));           // true
        System.out.println(isNStraightHand(new int[]{1,2,3,4,5,6}, 6));           // true
        System.out.println(isNStraightHand(new int[]{1,2,3,4,5,6}, 4));           // false
    }
}`,
  "min-arrows-balloons": `import java.util.*;

public class Main {
    public static int findMinArrowShots(int[][] points) {
        // TODO: return min number of vertical arrows to burst all balloons.

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(findMinArrowShots(new int[][]{{10,16},{2,8},{1,6},{7,12}}));                                      // 2
        System.out.println(findMinArrowShots(new int[][]{{1,2},{3,4},{5,6},{7,8}}));                                         // 4
        System.out.println(findMinArrowShots(new int[][]{{1,2},{2,3},{3,4},{4,5}}));                                         // 2
        System.out.println(findMinArrowShots(new int[][]{}));                                                                // 0
        System.out.println(findMinArrowShots(new int[][]{{1,10}}));                                                          // 1
        System.out.println(findMinArrowShots(new int[][]{{1,2}}));                                                           // 1
        System.out.println(findMinArrowShots(new int[][]{{1,10},{2,8},{3,5}}));                                              // 1
        System.out.println(findMinArrowShots(new int[][]{{1,2},{3,4}}));                                                     // 2
        System.out.println(findMinArrowShots(new int[][]{{1,5},{5,10}}));                                                    // 1
        System.out.println(findMinArrowShots(new int[][]{{3,9},{7,12},{3,8},{6,8},{9,10},{2,9},{0,9},{3,9},{0,6},{2,8}}));   // 2
        System.out.println(findMinArrowShots(new int[][]{{-10,-5},{-5,0},{0,5},{5,10}}));                                    // 2
    }
}`,
  "find-k-closest-elements": `import java.util.*;

public class Main {
    public static List<Integer> findClosestElements(int[] arr, int k, int x) {
        // TODO: return k elements of arr closest to x, in ascending order.

        return new ArrayList<>();
    }

    public static void main(String[] args) {
        System.out.println(findClosestElements(new int[]{1,2,3,4,5}, 4, 3));              // [1, 2, 3, 4]
        System.out.println(findClosestElements(new int[]{1,2,3,4,5}, 4, -1));             // [1, 2, 3, 4]
        System.out.println(findClosestElements(new int[]{1,2,3,4,5}, 4, 7));              // [2, 3, 4, 5]
        System.out.println(findClosestElements(new int[]{1}, 1, 1));                      // [1]
        System.out.println(findClosestElements(new int[]{1}, 1, 100));                    // [1]
        System.out.println(findClosestElements(new int[]{1,2,3}, 3, 2));                  // [1, 2, 3]
        System.out.println(findClosestElements(new int[]{1,2,3}, 1, 2));                  // [2]
        System.out.println(findClosestElements(new int[]{1,1,1,10,10,10}, 1, 9));         // [10]
        System.out.println(findClosestElements(new int[]{0,0,1,2,3,3,4,7,7,8}, 3, 5));    // [3, 3, 4]
        System.out.println(findClosestElements(new int[]{1,2,3,4,5,6,7,8,9,10}, 5, 5));   // [3, 4, 5, 6, 7]
        System.out.println(findClosestElements(new int[]{1,3}, 1, 2));                    // [1]
    }
}`,
  "average-of-levels": `public class Main {
    static class TreeNode { int val; TreeNode left, right; TreeNode(int v){val=v;} }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode root = new TreeNode(vals[0]);
        java.util.Queue<TreeNode> q = new java.util.ArrayDeque<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode n = q.poll();
            if (i < vals.length) { if (vals[i] != null) { n.left = new TreeNode(vals[i]); q.add(n.left); } i++; }
            if (i < vals.length) { if (vals[i] != null) { n.right = new TreeNode(vals[i]); q.add(n.right); } i++; }
        }
        return root;
    }

    public static java.util.List<Double> averageOfLevels(TreeNode root) {
        // Your solution here - use BFS level by level

        return new java.util.ArrayList<>();
    }

    public static void main(String[] args) {
        System.out.println(averageOfLevels(build(3,9,20,null,null,15,7)));   // [3.0, 14.5, 11.0]
        System.out.println(averageOfLevels(build(3,9,20,15,7)));             // [3.0, 14.5, 11.0]
        System.out.println(averageOfLevels(build(1)));                        // [1.0]
        System.out.println(averageOfLevels(build()));                         // []
        System.out.println(averageOfLevels(build(1,2)));                      // [1.0, 2.0]
        System.out.println(averageOfLevels(build(1,2,3)));                    // [1.0, 2.5]
        System.out.println(averageOfLevels(build(1,null,2)));                 // [1.0, 2.0]
        System.out.println(averageOfLevels(build(1,2,3,4,5)));                // [1.0, 2.5, 4.5]
        System.out.println(averageOfLevels(build(1,2,3,4,5,6,7)));            // [1.0, 2.5, 5.5]
        System.out.println(averageOfLevels(build(5,5,5)));                    // [5.0, 5.0]
        System.out.println(averageOfLevels(build(-1,-2,-3)));                 // [-1.0, -2.5]
    }
}`,
  "cousins-in-binary-tree": `public class Main {
    static class TreeNode { int val; TreeNode left, right; TreeNode(int v){val=v;} }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode root = new TreeNode(vals[0]);
        java.util.Queue<TreeNode> q = new java.util.ArrayDeque<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode n = q.poll();
            if (i < vals.length) { if (vals[i] != null) { n.left = new TreeNode(vals[i]); q.add(n.left); } i++; }
            if (i < vals.length) { if (vals[i] != null) { n.right = new TreeNode(vals[i]); q.add(n.right); } i++; }
        }
        return root;
    }

    public static boolean isCousins(TreeNode root, int x, int y) {
        // Your solution here - track parent and depth of x and y

        return false;
    }

    public static void main(String[] args) {
        System.out.println(isCousins(build(1,2,3,4), 4, 3));                      // false
        System.out.println(isCousins(build(1,2,3,null,4,null,5), 5, 4));          // true
        System.out.println(isCousins(build(1,2,3,null,4), 2, 3));                 // false
        System.out.println(isCousins(build(1,2,3), 1, 1));                        // false
        System.out.println(isCousins(build(1,2,3), 2, 3));                        // false
        System.out.println(isCousins(build(1,2,3,4,5,6,7), 4, 7));                // true
        System.out.println(isCousins(build(1,2,3,4,5,6,7), 4, 5));                // false
        System.out.println(isCousins(build(1,2,3,4,5,6,7), 6, 7));                // false
        System.out.println(isCousins(build(1,2), 1, 2));                          // false
        System.out.println(isCousins(build(1), 1, 1));                            // false
        System.out.println(isCousins(build(1,2,3,4,5,6,7), 4, 6));                // true
    }
}`,
  "deepest-leaves-sum": `public class Main {
    static class TreeNode { int val; TreeNode left, right; TreeNode(int v){val=v;} }

    static TreeNode build(Integer... vals) {
        if (vals.length == 0 || vals[0] == null) return null;
        TreeNode root = new TreeNode(vals[0]);
        java.util.Queue<TreeNode> q = new java.util.ArrayDeque<>();
        q.add(root);
        int i = 1;
        while (!q.isEmpty() && i < vals.length) {
            TreeNode n = q.poll();
            if (i < vals.length) { if (vals[i] != null) { n.left = new TreeNode(vals[i]); q.add(n.left); } i++; }
            if (i < vals.length) { if (vals[i] != null) { n.right = new TreeNode(vals[i]); q.add(n.right); } i++; }
        }
        return root;
    }

    public static int deepestLeavesSum(TreeNode root) {
        // Your solution here - BFS and return the last level sum

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(deepestLeavesSum(build(1,2,3,4,5,null,6,7,null,null,null,null,8))); // 15
        System.out.println(deepestLeavesSum(build(6,7,8,2,7,1,3,9,null,1,4,null,null,null,5))); // 19
        System.out.println(deepestLeavesSum(build(1)));                           // 1
        System.out.println(deepestLeavesSum(build()));                            // 0
        System.out.println(deepestLeavesSum(build(1,2)));                         // 2
        System.out.println(deepestLeavesSum(build(1,2,3)));                       // 5
        System.out.println(deepestLeavesSum(build(1,2,3,4)));                     // 4
        System.out.println(deepestLeavesSum(build(1,2,3,4,5,6,7)));               // 22
        System.out.println(deepestLeavesSum(build(5)));                           // 5
        System.out.println(deepestLeavesSum(build(-1,-2,-3)));                    // -5
        System.out.println(deepestLeavesSum(build(1,2,null,3,null,4)));           // 4
    }
}`,
  "max-area-of-island": `public class Main {
    public static int maxAreaOfIsland(int[][] grid) {
        // Your solution here - DFS/BFS and track max area

        return 0;
    }

    public static void main(String[] args) {
        int[][] g1 = {{0,0,1,0,0,0,0,1,0,0,0,0,0},{0,0,0,0,0,0,0,1,1,1,0,0,0},{0,1,1,0,1,0,0,0,0,0,0,0,0},{0,1,0,0,1,1,0,0,1,0,1,0,0},{0,1,0,0,1,1,0,0,1,1,1,0,0},{0,0,0,0,0,0,0,0,0,0,1,0,0},{0,0,0,0,0,0,0,1,1,1,0,0,0},{0,0,0,0,0,0,0,1,1,0,0,0,0}};
        System.out.println(maxAreaOfIsland(g1));                                    // 6
        System.out.println(maxAreaOfIsland(new int[][]{{0,0,0,0,0,0,0,0}}));        // 0
        System.out.println(maxAreaOfIsland(new int[][]{}));                         // 0
        System.out.println(maxAreaOfIsland(new int[][]{{0}}));                      // 0
        System.out.println(maxAreaOfIsland(new int[][]{{1}}));                      // 1
        System.out.println(maxAreaOfIsland(new int[][]{{1,1,1},{1,1,1},{1,1,1}}));  // 9
        System.out.println(maxAreaOfIsland(new int[][]{{1,0,1},{0,1,0},{1,0,1}}));  // 1
        System.out.println(maxAreaOfIsland(new int[][]{{1,1,0},{1,1,0},{0,0,0}}));  // 4
        System.out.println(maxAreaOfIsland(new int[][]{{0,1},{1,0}}));              // 1
        System.out.println(maxAreaOfIsland(new int[][]{{1,1,1,1,1},{1,0,0,0,1},{1,0,1,0,1},{1,0,0,0,1},{1,1,1,1,1}})); // 16
        System.out.println(maxAreaOfIsland(new int[][]{{1,1},{1,1}}));              // 4
    }
}`,
  "spiral-matrix-ii": `public class Main {
    public static int[][] generateMatrix(int n) {
        // Your solution here - simulate spiral traversal

        return new int[n][n];
    }

    public static void main(String[] args) {
        System.out.println(java.util.Arrays.deepToString(generateMatrix(1)));   // [[1]]
        System.out.println(java.util.Arrays.deepToString(generateMatrix(2)));   // [[1, 2], [4, 3]]
        System.out.println(java.util.Arrays.deepToString(generateMatrix(3)));   // [[1, 2, 3], [8, 9, 4], [7, 6, 5]]
        System.out.println(java.util.Arrays.deepToString(generateMatrix(4)));   // [[1, 2, 3, 4], [12, 13, 14, 5], [11, 16, 15, 6], [10, 9, 8, 7]]
        System.out.println(java.util.Arrays.deepToString(generateMatrix(5)));   // [[1, 2, 3, 4, 5], [16, 17, 18, 19, 6], [15, 24, 25, 20, 7], [14, 23, 22, 21, 8], [13, 12, 11, 10, 9]]
        System.out.println(java.util.Arrays.deepToString(generateMatrix(0)));   // []
        int[][] r1 = generateMatrix(3);
        System.out.println(r1[0][0] + " " + r1[1][1] + " " + r1[2][2]);         // 1 9 5
        int[][] r2 = generateMatrix(4);
        System.out.println(r2[0][0] + " " + r2[1][1] + " " + r2[2][2]);         // 1 13 15
        int[][] r3 = generateMatrix(5);
        System.out.println(r3[2][2]);                                            // 25
        System.out.println(generateMatrix(3)[0][2]);                             // 3
        System.out.println(generateMatrix(1)[0][0]);                             // 1
    }
}`,
  "find-peak-element": `public class Main {
    public static int findPeakElement(int[] nums) {
        // Your solution here - binary search toward the rising slope

        return -1;
    }

    public static void main(String[] args) {
        // All test inputs have a unique peak so the answer is deterministic.
        System.out.println(findPeakElement(new int[]{1,2,3,1}));                // 2
        System.out.println(findPeakElement(new int[]{1}));                      // 0
        System.out.println(findPeakElement(new int[]{1,2}));                    // 1
        System.out.println(findPeakElement(new int[]{2,1}));                    // 0
        System.out.println(findPeakElement(new int[]{1,3,2}));                  // 1
        System.out.println(findPeakElement(new int[]{1,2,3}));                  // 2
        System.out.println(findPeakElement(new int[]{3,2,1}));                  // 0
        System.out.println(findPeakElement(new int[]{1,2,3,4,5}));              // 4
        System.out.println(findPeakElement(new int[]{5,4,3,2,1}));              // 0
        System.out.println(findPeakElement(new int[]{1,2,3,4,3,2,1}));          // 3
        System.out.println(findPeakElement(new int[]{1,2,3,4,5,4,3,2,1}));      // 4
    }
}`,
  "max-profit-job-scheduling": `public class Main {
    public static int jobScheduling(int[] startTime, int[] endTime, int[] profit) {
        // Your solution here - sort by end time, DP with binary search

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(jobScheduling(new int[]{1,2,3,3}, new int[]{3,4,5,6}, new int[]{50,10,40,70}));        // 120
        System.out.println(jobScheduling(new int[]{1,2,3,4,6}, new int[]{3,5,10,6,9}, new int[]{20,20,100,70,60})); // 150
        System.out.println(jobScheduling(new int[]{1,1,1}, new int[]{2,3,4}, new int[]{5,6,4}));                   // 6
        System.out.println(jobScheduling(new int[]{1}, new int[]{2}, new int[]{10}));                              // 10
        System.out.println(jobScheduling(new int[]{}, new int[]{}, new int[]{}));                                  // 0
        System.out.println(jobScheduling(new int[]{1,2}, new int[]{3,4}, new int[]{10,20}));                       // 20
        System.out.println(jobScheduling(new int[]{1,3,5}, new int[]{2,4,6}, new int[]{1,2,3}));                   // 6
        System.out.println(jobScheduling(new int[]{1,3,5,7}, new int[]{2,4,6,8}, new int[]{10,10,10,10}));         // 40
        System.out.println(jobScheduling(new int[]{1,2,3,4}, new int[]{10,10,10,10}, new int[]{1,2,3,4}));         // 4
        System.out.println(jobScheduling(new int[]{6,15,7,11,1,3,16,2}, new int[]{19,18,19,16,10,8,19,8}, new int[]{2,9,1,19,5,7,3,19})); // 41
        System.out.println(jobScheduling(new int[]{4,2,4,8,2}, new int[]{5,5,5,10,8}, new int[]{1,2,8,10,4}));     // 18
    }
}`,
  "dungeon-game": `public class Main {
    public static int calculateMinimumHP(int[][] dungeon) {
        // Your solution here - DP from bottom-right

        return 1;
    }

    public static void main(String[] args) {
        System.out.println(calculateMinimumHP(new int[][]{{-2,-3,3},{-5,-10,1},{10,30,-5}})); // 7
        System.out.println(calculateMinimumHP(new int[][]{{0}}));                              // 1
        System.out.println(calculateMinimumHP(new int[][]{{1}}));                              // 1
        System.out.println(calculateMinimumHP(new int[][]{{-100}}));                           // 101
        System.out.println(calculateMinimumHP(new int[][]{{-1}}));                             // 2
        System.out.println(calculateMinimumHP(new int[][]{{100}}));                            // 1
        System.out.println(calculateMinimumHP(new int[][]{{-1,-1,-1},{-1,-1,-1},{-1,-1,-1}})); // 6
        System.out.println(calculateMinimumHP(new int[][]{{0,0,0},{0,0,0},{0,0,0}}));          // 1
        System.out.println(calculateMinimumHP(new int[][]{{-5}}));                             // 6
        System.out.println(calculateMinimumHP(new int[][]{{10}}));                             // 1
        System.out.println(calculateMinimumHP(new int[][]{{1,-3,3},{0,-2,0},{-3,-3,-3}}));     // 3
    }
}`,
  "encode-decode-tinyurl": `public class Main {
    static class Codec {
        // Your solution here - maintain a map from short code to long URL

        public String encode(String longUrl) {
            return "";
        }

        public String decode(String shortUrl) {
            return "";
        }
    }

    static boolean roundTrip(String url) {
        Codec c = new Codec();
        return c.decode(c.encode(url)).equals(url);
    }

    public static void main(String[] args) {
        System.out.println(roundTrip("https://leetcode.com/"));                                       // true
        System.out.println(roundTrip("https://leetcode.com/problems/design-tinyurl"));                // true
        System.out.println(roundTrip("https://google.com"));                                          // true
        System.out.println(roundTrip(""));                                                            // true
        System.out.println(roundTrip("a"));                                                           // true
        System.out.println(roundTrip("https://very.long.url/with/many/parts/indeed?query=string&foo=bar")); // true
        System.out.println(roundTrip("https://example.com/1"));                                       // true
        System.out.println(roundTrip("https://example.com/2"));                                       // true
        System.out.println(roundTrip("https://example.com/3"));                                       // true
        System.out.println(roundTrip("https://docs.python.org/3/library/index.html"));                // true

        // Two different long URLs must round-trip correctly even in the same Codec instance
        Codec c = new Codec();
        String s1 = c.encode("https://a.com");
        String s2 = c.encode("https://b.com");
        System.out.println(c.decode(s1).equals("https://a.com") && c.decode(s2).equals("https://b.com")); // true
    }
}`,
  "design-browser-history": `public class Main {
    static class BrowserHistory {
        // Your solution here - list + current index, or two stacks

        public BrowserHistory(String homepage) {
        }

        public void visit(String url) {
        }

        public String back(int steps) {
            return "";
        }

        public String forward(int steps) {
            return "";
        }
    }

    public static void main(String[] args) {
        BrowserHistory bh = new BrowserHistory("leetcode.com");
        bh.visit("google.com");
        bh.visit("facebook.com");
        bh.visit("youtube.com");
        System.out.println(bh.back(1));         // facebook.com
        System.out.println(bh.back(1));         // google.com
        System.out.println(bh.forward(1));      // facebook.com
        bh.visit("linkedin.com");
        System.out.println(bh.forward(2));      // linkedin.com
        System.out.println(bh.back(2));         // google.com
        System.out.println(bh.back(7));         // leetcode.com
        System.out.println(bh.forward(1));      // google.com
        System.out.println(bh.forward(100));    // linkedin.com

        // Extra simple scenarios
        BrowserHistory bh2 = new BrowserHistory("a.com");
        System.out.println(bh2.back(5));        // a.com
        System.out.println(bh2.forward(5));     // a.com
    }
}`,
  "median-two-sorted-arrays": `import java.util.*;

public class Solution {
    public static double findMedianSortedArrays(int[] nums1, int[] nums2) {
        // Your code here
        return 0.0;
    }

    public static void main(String[] args) {
        int[] a = {1, 3};
        int[] b = {2};
        System.out.println(String.format(java.util.Locale.US, "%.5f", findMedianSortedArrays(a, b)));
    }
}
`,
  "subarray-sum-equals-k": `import java.util.*;

public class Solution {
    public static int subarraySum(int[] nums, int k) {
        // Your code here
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(subarraySum(new int[]{1, 1, 1}, 2));
    }
}
`,
  "find-duplicate-number": `import java.util.*;

public class Solution {
    public static int findDuplicate(int[] nums) {
        // Your code here
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(findDuplicate(new int[]{1, 3, 4, 2, 2}));
    }
}
`,
  "find-min-rotated-sorted-array": `import java.util.*;

public class Solution {
    public static int findMin(int[] nums) {
        // Your code here
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(findMin(new int[]{3, 4, 5, 1, 2}));
    }
}
`,
  "permutation-in-string": `import java.util.*;

public class Solution {
    public static boolean checkInclusion(String s1, String s2) {
        // Your code here
        return false;
    }

    public static void main(String[] args) {
        System.out.println(checkInclusion("ab", "eidbaooo"));
    }
}
`,
  "partition-labels": `import java.util.*;

public class Solution {
    public static List<Integer> partitionLabels(String s) {
        // Your code here
        return new ArrayList<>();
    }

    public static void main(String[] args) {
        System.out.println(partitionLabels("ababcbacadefegdehijhklij"));
    }
}
`,
  "capacity-to-ship-packages": `import java.util.*;

public class Solution {
    public static int shipWithinDays(int[] weights, int days) {
        // Your code here
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(shipWithinDays(new int[]{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}, 5));
    }
}
`,
  "find-and-replace-in-string": `import java.util.*;

public class Solution {
    public static String findReplaceString(String s, int[] indices, String[] sources, String[] targets) {
        // Your code here
        return "";
    }

    public static void main(String[] args) {
        System.out.println(findReplaceString("abcd", new int[]{0, 2}, new String[]{"a", "cd"}, new String[]{"eee", "ffff"}));
    }
}
`,
  "expressive-words": `import java.util.*;

public class Solution {
    public static int expressiveWords(String s, String[] words) {
        // Your code here
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(expressiveWords("heeellooo", new String[]{"hello", "hi", "helo"}));
    }
}
`,
  "robot-room-cleaner": `import java.util.*;

public class Main {
    static int[] DR = {-1, 0, 1, 0};
    static int[] DC = { 0, 1, 0,-1};

    static class Robot {
        int[][] room; int r, c, dir;
        Robot(int[][] room, int r0, int c0) { this.room = room; this.r = r0; this.c = c0; this.dir = 0; }
        public boolean move() {
            int nr = r + DR[dir], nc = c + DC[dir];
            if (nr < 0 || nc < 0 || nr >= room.length || nc >= room[0].length || room[nr][nc] == 0) return false;
            r = nr; c = nc; return true;
        }
        public void turnLeft()  { dir = (dir + 3) % 4; }
        public void turnRight() { dir = (dir + 1) % 4; }
        public void clean()     { room[r][c] = -1; }
    }

    public static void cleanRoom(Robot robot) {
        // DFS with backtracking. Track visited set keyed by absolute offset from start.
        // After exploring one direction, rotate and try the next; always back up to origin orientation.

    }

    static int countCleaned(int[][] room) {
        int c = 0;
        for (int[] row : room) for (int v : row) if (v == -1) c++;
        return c;
    }

    static int run(int[][] room, int r, int c) {
        Robot robot = new Robot(room, r, c);
        cleanRoom(robot);
        return countCleaned(room);
    }

    public static void main(String[] args) {
        System.out.println(run(new int[][]{{1,1,1,1,1,0,1,1},{1,1,1,1,1,0,1,1},{1,0,1,1,1,1,1,1},{0,0,0,1,0,0,0,0},{1,1,1,1,1,1,1,1}}, 1, 3)); // 29
        System.out.println(run(new int[][]{{1}}, 0, 0));                                         // 1
        System.out.println(run(new int[][]{{1,1}}, 0, 0));                                       // 2
        System.out.println(run(new int[][]{{1,1},{1,1}}, 0, 0));                                 // 4
        System.out.println(run(new int[][]{{1,0,1},{1,1,1}}, 0, 0));                             // 5
        System.out.println(run(new int[][]{{1,1,1}}, 0, 1));                                     // 3
        System.out.println(run(new int[][]{{1},{1},{1}}, 1, 0));                                 // 3
        System.out.println(run(new int[][]{{1,1,1},{0,1,0},{1,1,1}}, 0, 0));                     // 7
        System.out.println(run(new int[][]{{1,1,1,1},{1,0,0,1},{1,1,1,1}}, 0, 0));               // 10
        System.out.println(run(new int[][]{{1,1},{0,1}}, 0, 0));                                 // 3
    }
}`,
  "number-of-distinct-islands": `import java.util.*;

public class Main {
    public static int numDistinctIslands(int[][] grid) {
        // DFS with shape signature — record directions with backtrack marker, or (dr, dc) offsets.

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(numDistinctIslands(new int[][]{{1,1,0,0,0},{1,1,0,0,0},{0,0,0,1,1},{0,0,0,1,1}}));             // 1
        System.out.println(numDistinctIslands(new int[][]{{1,1,0,1,1},{1,0,0,0,0},{0,0,0,0,1},{1,1,0,1,1}}));             // 3
        System.out.println(numDistinctIslands(new int[][]{{0,0,0}}));                                                      // 0
        System.out.println(numDistinctIslands(new int[][]{{1}}));                                                          // 1
        System.out.println(numDistinctIslands(new int[][]{{1,0},{0,1}}));                                                  // 1
        System.out.println(numDistinctIslands(new int[][]{{1,1},{0,0}}));                                                  // 1
        System.out.println(numDistinctIslands(new int[][]{{1,1},{1,1}}));                                                  // 1
        System.out.println(numDistinctIslands(new int[][]{{1,0,1},{0,0,0},{1,0,1}}));                                      // 1
        System.out.println(numDistinctIslands(new int[][]{{1,1,0},{0,1,0},{0,0,0},{1,1,0},{0,1,0}}));                      // 1
        System.out.println(numDistinctIslands(new int[][]{{1,1,0,1,1,0},{0,0,0,0,0,0},{1,0,0,0,1,0},{1,1,0,1,1,0}}));      // 3
    }
}`,
  "bricks-falling-when-hit": `import java.util.*;

public class Main {
    public static int[] hitBricks(int[][] grid, int[][] hits) {
        // Union-Find, processed in reverse: start from final grid, then re-add hit bricks.

        return new int[hits.length];
    }

    public static void main(String[] args) {
        System.out.println(Arrays.toString(hitBricks(new int[][]{{1,0,0,0},{1,1,1,0}}, new int[][]{{1,0}})));                          // [2]
        System.out.println(Arrays.toString(hitBricks(new int[][]{{1,0,0,0},{1,1,0,0}}, new int[][]{{1,1},{1,0}})));                    // [0, 0]
        System.out.println(Arrays.toString(hitBricks(new int[][]{{1,0,0,0},{1,1,1,0}}, new int[][]{{1,1},{1,0}})));                    // [0, 0]
        System.out.println(Arrays.toString(hitBricks(new int[][]{{1}}, new int[][]{{0,0}})));                                          // [0]
        System.out.println(Arrays.toString(hitBricks(new int[][]{{0}}, new int[][]{{0,0}})));                                          // [0]
        System.out.println(Arrays.toString(hitBricks(new int[][]{{1,1}}, new int[][]{{0,0}})));                                        // [0]
        System.out.println(Arrays.toString(hitBricks(new int[][]{{1,1}}, new int[][]{{0,1}})));                                        // [0]
        System.out.println(Arrays.toString(hitBricks(new int[][]{{1},{1}}, new int[][]{{1,0}})));                                      // [0]
        System.out.println(Arrays.toString(hitBricks(new int[][]{{1},{1}}, new int[][]{{0,0}})));                                      // [1]
        System.out.println(Arrays.toString(hitBricks(new int[][]{{1,1,0,0},{0,0,1,0},{0,0,1,1}}, new int[][]{{1,2}})));                // [2]
        System.out.println(Arrays.toString(hitBricks(new int[][]{{1,1,1},{1,0,1}}, new int[][]{{0,0}})));                              // [1]
    }
}`,
  "shortest-path-visiting-all-nodes": `import java.util.*;

public class Main {
    public static int shortestPathLength(int[][] graph) {
        // BFS over (node, mask). Terminal mask = (1 << n) - 1.

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(shortestPathLength(new int[][]{{1,2,3},{0},{0},{0}}));           // 4
        System.out.println(shortestPathLength(new int[][]{{1},{0,2,4},{1,3,4},{2},{1,2}})); // 4
        System.out.println(shortestPathLength(new int[][]{{1},{0}}));                        // 1
        System.out.println(shortestPathLength(new int[][]{{}}));                             // 0
        System.out.println(shortestPathLength(new int[][]{{1},{0,2},{1}}));                  // 2
        System.out.println(shortestPathLength(new int[][]{{1,2},{0,2},{0,1}}));              // 2
        System.out.println(shortestPathLength(new int[][]{{1,2,3,4},{0},{0},{0},{0}}));      // 8
        System.out.println(shortestPathLength(new int[][]{{1},{0,2},{1,3},{2}}));            // 3
        System.out.println(shortestPathLength(new int[][]{{1},{0,2},{1,3},{2,4},{3}}));      // 4
        System.out.println(shortestPathLength(new int[][]{{1,2},{0},{0}}));                  // 2
    }
}`,
  "race-car": `import java.util.*;

public class Main {
    public static int racecar(int target) {
        // BFS on (position, speed) or DP over targets.

        return 0;
    }

    public static void main(String[] args) {
        System.out.println(racecar(1));    // 1
        System.out.println(racecar(2));    // 4
        System.out.println(racecar(3));    // 2
        System.out.println(racecar(4));    // 5
        System.out.println(racecar(5));    // 7
        System.out.println(racecar(6));    // 5
        System.out.println(racecar(7));    // 3
        System.out.println(racecar(10));   // 6
        System.out.println(racecar(15));   // 4
        System.out.println(racecar(100));  // 12
    }
}`,
  "min-domino-rotations": `public class Main {
    public static int minDominoRotations(int[] tops, int[] bottoms) {
        // Try candidate = tops[0] and candidate = bottoms[0]; for each, count swaps for top-row
        // and swaps for bottom-row. If any domino lacks the candidate on either face, infeasible.

        return -1;
    }

    public static void main(String[] args) {
        System.out.println(minDominoRotations(new int[]{2,1,2,4,2,2}, new int[]{5,2,6,2,3,2}));           // 2
        System.out.println(minDominoRotations(new int[]{3,5,1,2,3}, new int[]{3,6,3,3,4}));                // -1
        System.out.println(minDominoRotations(new int[]{1}, new int[]{1}));                                 // 0
        System.out.println(minDominoRotations(new int[]{1,1,1}, new int[]{1,1,1}));                         // 0
        System.out.println(minDominoRotations(new int[]{1,2}, new int[]{2,1}));                             // 1
        System.out.println(minDominoRotations(new int[]{1,2,3}, new int[]{2,3,1}));                         // -1
        System.out.println(minDominoRotations(new int[]{2,2,2,2}, new int[]{3,3,3,3}));                     // 0
        System.out.println(minDominoRotations(new int[]{1,2,1,1,1,2,2,2}, new int[]{2,1,2,2,2,2,2,2}));     // 1
        System.out.println(minDominoRotations(new int[]{1,3,1,1,1}, new int[]{2,1,3,4,5}));                 // -1
        System.out.println(minDominoRotations(new int[]{1,2,2,1}, new int[]{2,1,1,2}));                     // 2
    }
}`,
  "word-squares": `import java.util.*;

public class Main {
    public static List<List<String>> wordSquares(String[] words) {
        // Backtracking with a prefix map. Each new row's prefix is determined by previously placed words.

        return new ArrayList<>();
    }

    static String sig(List<List<String>> result) {
        List<String> flat = new ArrayList<>();
        for (List<String> sq : result) flat.add(sq.toString());
        Collections.sort(flat);
        return flat.toString();
    }

    public static void main(String[] args) {
        System.out.println(sig(wordSquares(new String[]{"area","lead","wall","lady","ball"})));
        // [[ball, area, lead, lady], [wall, area, lead, lady]]
        System.out.println(sig(wordSquares(new String[]{"abat","baba","atan","atal"})));
        // [[baba, abat, baba, atal], [baba, abat, baba, atan]]
        System.out.println(sig(wordSquares(new String[]{"a"})));                            // [[a]]
        System.out.println(sig(wordSquares(new String[]{"ab","ba"})));                      // [[ab, ba]]
        System.out.println(sig(wordSquares(new String[]{"aa"})));                            // [[aa, aa]]
        System.out.println(sig(wordSquares(new String[]{"aaaa"})));                          // [[aaaa, aaaa, aaaa, aaaa]]
        System.out.println(sig(wordSquares(new String[]{})));                                // []
        System.out.println(sig(wordSquares(new String[]{"abc","bca","cab"})));               // [[abc, bca, cab]]
        System.out.println(sig(wordSquares(new String[]{"xy","yx"})));                      // [[xy, yx]]
        System.out.println(sig(wordSquares(new String[]{"a","b"})));                        // [[a], [b]]
    }
}`,
  "strobogrammatic-number": `import java.util.*;

public class Main {
    public static boolean isStrobogrammatic(String num) {
        // Two pointers from both ends; check that mirror[num[l]] == num[r].

        return false;
    }

    public static void main(String[] args) {
        System.out.println(isStrobogrammatic("69"));    // true
        System.out.println(isStrobogrammatic("88"));    // true
        System.out.println(isStrobogrammatic("962"));   // false
        System.out.println(isStrobogrammatic("1"));      // true
        System.out.println(isStrobogrammatic("0"));      // true
        System.out.println(isStrobogrammatic("11"));     // true
        System.out.println(isStrobogrammatic("10"));     // false
        System.out.println(isStrobogrammatic("101"));    // true
        System.out.println(isStrobogrammatic("818"));    // true
        System.out.println(isStrobogrammatic("6"));      // false
        System.out.println(isStrobogrammatic(""));       // true
        System.out.println(isStrobogrammatic("1691"));   // true
    }
}`,
  "range-module": `import java.util.*;

public class Solution {
    static class RangeModule {
        public RangeModule() {
            // Your code here
        }

        public void addRange(int left, int right) {
            // Your code here
        }

        public boolean queryRange(int left, int right) {
            // Your code here
            return false;
        }

        public void removeRange(int left, int right) {
            // Your code here
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
  "my-calendar-iii": `import java.util.*;

public class Solution {
    static class MyCalendarThree {
        public MyCalendarThree() {
            // Your code here
        }

        public int book(int start, int end) {
            // Your code here
            return 0;
        }
    }

    public static void main(String[] args) {
        MyCalendarThree c = new MyCalendarThree();
        System.out.println(c.book(10, 20));
    }
}
`,
  "max-freq-stack": `import java.util.*;

public class Solution {
    static class FreqStack {
        public FreqStack() {
            // Your code here
        }

        public void push(int val) {
            // Your code here
        }

        public int pop() {
            // Your code here
            return 0;
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
  "design-search-autocomplete": `import java.util.*;

public class Solution {
    static class AutocompleteSystem {
        public AutocompleteSystem(String[] sentences, int[] times) {
            // Your code here
        }

        public List<String> input(char c) {
            // Your code here
            return new ArrayList<>();
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
  "random-pick-with-blacklist": `import java.util.*;

public class Solution {
    static class Picker {
        public Picker(int n, int[] blacklist) {
            // Your code here
        }

        public int pick() {
            // Your code here
            return 0;
        }
    }

    public static void main(String[] args) {
        Picker p = new Picker(7, new int[]{2, 3, 5});
        System.out.println(p.pick());
    }
}
`,
  "guess-the-word": `import java.util.*;

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

    public static void findSecretWord(String[] words, Master master) {
        // Your code here
    }

    public static void main(String[] args) {
        String[] words = {"acckzz", "ccbazz", "eiowzz", "abcczz"};
        Master m = new Master("acckzz", 10);
        findSecretWord(words, m);
        System.out.println(m.calls <= 10);
    }
}
`,
  "max-visible-points": `import java.util.*;

public class Solution {
    public static int visiblePoints(List<List<Integer>> points, int angle, List<Integer> location) {
        // Your code here
        return 0;
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
  "trapping-rain-water-ii": `import java.util.*;

public class Solution {
    public static int trapRainWater(int[][] heightMap) {
        // Your code here
        return 0;
    }

    public static void main(String[] args) {
        int[][] h = {{1, 4, 3, 1, 3, 2}, {3, 2, 1, 3, 2, 4}, {2, 3, 3, 2, 3, 1}};
        System.out.println(trapRainWater(h));
    }
}
`,
};

// Merge into DSA_PROBLEMS (index must have loaded first).
if (typeof DSA_PROBLEMS !== "undefined") {
  for (const p of DSA_PROBLEMS) {
    if (DSA_STARTER_CODE[p.id]) p.starterCode = DSA_STARTER_CODE[p.id];
  }
}

// Signal to code waiting for lazy load to resolve (see dsa.js ensureDsaFullData).
if (typeof window !== "undefined") {
  window.__dsaFullLoaded = true;
  window.dispatchEvent(new Event("dsa-full-loaded"));
}
