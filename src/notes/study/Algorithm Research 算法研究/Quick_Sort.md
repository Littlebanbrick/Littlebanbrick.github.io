# Quick Sort: Partitioning, Pivots, and Engineering

# 快速排序：分区、枢纽与工程优化

<!-- preview: 从课堂原理到工业级优化的快速排序阐述-->

## 1. Introduction: Another Face of Divide-and-Conquer / 引言：分治思想的又一典范

Quick sort is the restless sibling of merge sort. Both are divide-and-conquer algorithms that run in O(N log N) time on average. But where merge sort does its heavy lifting _after_ the recursive calls — merging two already-sorted halves into a sorted whole — quick sort does it _before_. It picks a pivot element, partitions the array so that all smaller elements sit to the left and all larger elements to the right, and only then recurses on the two subarrays. The recursion itself does no merging; by the time both halves are sorted, the entire array is sorted.

快速排序是归并排序那个闲不住的兄弟。两者都是平均 O(N log N) 的分治算法。但归并排序的重活在递归调用*之后*——把两个已经有序的半数组合并成一个有序整体——而快速排序的重活在递归*之前*。它挑一个枢纽元素，把数组切分成左边全小、右边全大的两部分，然后才递归处理两个子数组。递归本身不做任何合并；当左右两半各自有序时，整个数组就有序了。

You can think of it as a division of labor within divide-and-conquer. Merge sort lets recursion handle the sorting, then stitches the results together. Quick sort does one hard pass of partitioning — "one trip of hard labor" — and then lets recursion coast on the work already done. The entire performance of quick sort hinges on how well that single partitioning pass splits the array. If the split is balanced, the recursion tree stays shallow and the algorithm flies. If it is lopsided, the tree degenerates into a chain and performance collapses. Understanding quick sort is therefore understanding two things: how to partition an array efficiently, and how to choose a pivot that makes the partition balanced.

你可以把这看作分治内部的职能分工。归并排序让递归负责排序，然后把结果缝合起来。快速排序做一趟硬核的分区工作——“一趟做苦力”——然后让递归在已完成的工作上享清福。快速排序的全部性能取决于这一趟分区把数组切得有多均衡。如果切得匀称，递归树保持浅层，算法飞驰。如果切得歪斜，递归树退化成链，性能崩塌。因此，理解快速排序就是理解两件事：如何高效地分区，以及如何选一个让分区均衡的枢纽。

## 2. Core Mechanism: Partitioning / 核心机制：分区

### 2.1 The Goal / 基本目标

Partitioning takes an array segment and a chosen pivot value. It rearranges the elements so that everything less than or equal to the pivot ends up on the left, and everything greater than the pivot ends up on the right. The pivot itself lands at the boundary between the two regions — its final sorted position. The function returns that position, which becomes the dividing line for the recursive calls.

分区接受一个数组区间和一个选定的枢纽值。它重排元素，使所有小于等于枢纽的元素落到左侧，所有大于枢纽的元素落到右侧。枢纽本身落在两区的交界处——它的最终排序位置。函数返回这个位置，它成为递归调用的分界线。

### 2.2 The Lomuto Partition Scheme / Lomuto 分区方案

The Lomuto scheme is the partition algorithm most commonly taught in introductory courses. It is not the fastest — Hoare's original scheme does fewer swaps — but its logic is transparent, and its loop invariant is clean enough to state in a single sentence.

Lomuto 方案是入门课程中最常教授的分区算法。它不是最快的——Hoare 的原始方案做更少的交换——但它的逻辑透明，其循环不变量干净到可以用一句话陈述。

The algorithm selects the last element of the segment as the pivot. It then scans the segment from left to right, maintaining an index `i` that marks the rightmost boundary of the "less than or equal" region. Initially, `i` points just before the left end of the segment. As the scan proceeds with an index `j`, whenever an element `arr[j]` is less than or equal to the pivot, `i` advances and swaps `arr[i]` with `arr[j]`. This has the effect of appending the new small element to the "≤ pivot" region. After the scan completes, the pivot is swapped with `arr[i + 1]`, placing it at the boundary. The function returns `i + 1`.

算法选区间最后一个元素为枢纽。然后从左到右扫描区间，维护一个下标 `i` 标记“小于等于区”的最右边界。初始时 `i` 在区间左端之前。随着扫描下标 `j` 推进，每当 `arr[j]` 小于等于枢纽时，`i` 前进并与 `arr[j]` 交换。这相当于把新发现的小元素追加到“≤ 枢纽”区域。扫描完成后，枢纽与 `arr[i + 1]` 交换，落在边界上。函数返回 `i + 1`。

```c
int partition(int arr[], int left, int right) {
    int pivot = arr[right];
    int i = left - 1;

    for (int j = left; j < right; j++) {
        if (arr[j] <= pivot) {
            i++;
            swap(&arr[i], &arr[j]);
        }
    }
    swap(&arr[i + 1], &arr[right]);
    return i + 1;
}
```

**The loop invariant.** At the start of each iteration of the `for` loop, the array segment `arr[left .. right]` satisfies: all elements in `arr[left .. i]` are less than or equal to the pivot; all elements in `arr[i+1 .. j-1]` are strictly greater than the pivot; and elements in `arr[j .. right-1]` have not yet been examined. This invariant is trivially true before the first iteration (both regions are empty), is maintained by the conditional swap inside the loop, and delivers the partitioned array when `j` reaches `right`.

**循环不变量。** 在 `for` 循环的每次迭代开始时，数组区间 `arr[left .. right]` 满足：`arr[left .. i]` 中所有元素 ≤ 枢纽；`arr[i+1 .. j-1]` 中所有元素严格大于枢纽；`arr[j .. right-1]` 尚未被检查。这个不变量在第一次迭代前显然成立（两个区域均为空），在循环内由条件交换维护，当 `j` 到达 `right` 时交付完成分区的数组。

The beauty of this invariant is that it requires no cleverness to verify. You can trace it with your finger on a small example and see the two regions grow — the "≤ pivot" region expanding one element at a time, the "> pivot" region trailing just behind it.

这个不变量的优美之处在于它不需要任何机巧就能验证。你可以用手指在一个小例子上追踪，看到两个区域逐步生长——“≤ 枢纽”区每次扩张一个元素，“> 枢纽”区紧随其后。

### 2.3 A Worked Example / 一个跑通的例子

Let `arr = [3, 7, 2, 5, 4]` with `left = 0`, `right = 4`. The pivot is `arr[4] = 4`.

设 `arr = [3, 7, 2, 5, 4]`，`left = 0`，`right = 4`。枢纽为 `arr[4] = 4`。

```
Initial: i = -1, pivot = 4
         arr = [3, 7, 2, 5, 4]

j = 0: arr[0] = 3 ≤ 4 → i = 0, swap(arr[0], arr[0])  // no change
         arr = [3, 7, 2, 5, 4]

j = 1: arr[1] = 7 > 4  → nothing
         arr = [3, 7, 2, 5, 4]

j = 2: arr[2] = 2 ≤ 4 → i = 1, swap(arr[1], arr[2])
         arr = [3, 2, 7, 5, 4]

j = 3: arr[3] = 5 > 4  → nothing
         arr = [3, 2, 7, 5, 4]

After loop: swap(arr[i+1], arr[right]) = swap(arr[2], arr[4])
         arr = [3, 2, 4, 7, 5]
         return i + 1 = 2
```

The pivot `4` is now at index 2, its final sorted position. Every element to its left is less than or equal to 4; every element to its right is greater than 4. The array is not fully sorted, but the two subarrays `[3, 2]` and `[7, 5]` can now be sorted independently by recursive calls.

枢纽 `4` 现在位于下标 2，它的最终排序位置。左侧所有元素 ≤ 4；右侧所有元素 > 4。数组没有完全排序，但两个子数组 `[3, 2]` 和 `[7, 5]` 现在可以由递归调用独立排序了。

## 3. Pivot Selection: Mediocre vs. Clever / 枢纽的选择：平庸 vs 聪明

### 3.1 Why the Pivot Matters / 为什么枢纽重要

The Lomuto scheme always picks the last element. If the array is randomly ordered, this is as good as any other choice. But if the array is already sorted — or reverse-sorted — the last element is the worst possible pivot: the maximum or minimum. Every partition then produces one empty subarray and one subarray of size N-1. The recursion depth becomes N, and the total work balloons to O(N²).

Lomuto 方案总是选最后一个元素。如果数组随机排列，这和其他选择一样好。但如果数组已经有序——或逆序——最后一个元素就是最差的枢纽：最大或最小值。每次分区于是产生一个空子数组和一个大小为 N-1 的子数组。递归深度变成 N，总工作量膨胀到 O(N²)。

Choosing a good pivot is the single most impactful decision in implementing quick sort. The goal is not to find the true median — that would be optimal but too expensive to compute — but to avoid the pathological case by picking an element that is unlikely to be the extreme.

选一个好的枢纽是实现快速排序时影响最大的决策。目标不是找到真正的中位数——那将是最优的但计算代价太高——而是通过选一个不太可能是极值的元素来避免病态情况。

### 3.2 The Fixed-End Strategy and Its Failure / 固定末尾法及其失败

Picking the last element (or the first, or any fixed position) is simple. It requires zero additional code. But it is fragile: any input with a pattern that places extreme values at the fixed position triggers the worst case. An adversary who knows your code can construct a worst-case input. This is not a theoretical concern — real datasets are often partially sorted, and real servers can be fed malicious inputs.

选最后一个元素（或第一个，或任意固定位置）很简单，不需要任何额外代码。但它是脆弱的：任何在固定位置放置极值的输入模式都会触发最坏情况。知道你代码的攻击者可以构造最坏情况输入。这不是理论上的担忧——真实数据集经常部分有序，而真实服务器也可能被喂入恶意输入。

### 3.3 Median-of-Three / 三数取中

The median-of-three strategy examines three elements — the first, the last, and the middle element of the segment — and picks the one whose value lies between the other two. This median is then swapped to the last position, and the Lomuto partition proceeds exactly as before.

三数取中策略检查三个元素——区间的第一个、最后一个和中间元素——选三者中值居中的那个。这个中值被交换到最后一个位置，然后 Lomuto 分区照常进行。

```c
int medianOfThree(int arr[], int left, int right) {
    int mid = left + (right - left) / 2;

    if (arr[left] > arr[mid])
        swap(&arr[left], &arr[mid]);
    if (arr[left] > arr[right])
        swap(&arr[left], &arr[right]);
    if (arr[mid] > arr[right])
        swap(&arr[mid], &arr[right]);

    // The median is now at arr[mid]. Swap it to the end.
    swap(&arr[mid], &arr[right]);
    return arr[right];
}
```

This is not a heuristic that "feels right." Median-of-three guarantees that the pivot is neither the largest nor the smallest of the three examined elements. The worst-case behavior — already sorted input — now produces perfectly balanced partitions, because the median of `{first, middle, last}` on a sorted array is exactly the middle element. The pathological input becomes the best case.

这不是一个“感觉不错”的经验做法。三数取中保证了枢纽既不是三个被检查元素中最大的也不是最小的。对最坏情况——已排序输入——现在产生完美平衡的分区，因为在已排序数组上 `{first, middle, last}` 的中值正好是中间元素。病态输入变成了最好情况。

Even on completely random arrays, median-of-three provides measurable benefits. The partitions are slightly more balanced, the constant factor is smaller, and the algorithm is defended against partially sorted segments that occur deep in the recursion. Every major standard library implementation uses some form of multi-point pivot selection.

即使在完全随机数组上，三数取中也有可测量的好处。分区略微更平衡，常数因子更小，算法在面对递归深处出现的局部有序段时也得到了防御。所有主流标准库实现都使用了某种形式的多点枢纽选择。

## 4. Complexity Analysis / 复杂度分析

### 4.1 Best Case / 最好情况

If every partition splits the array exactly in half, the recurrence is `T(N) = 2T(N/2) + O(N)`, where the O(N) term covers the partitioning pass. This solves to `T(N) = O(N log N)`. The recursion tree has depth `log₂ N`, and each level does O(N) total work across all subarrays.

如果每次分区恰好把数组切成两半，递归式为 `T(N) = 2T(N/2) + O(N)`，其中 O(N) 项覆盖了分区趟的工作。这解出 `T(N) = O(N log N)`。递归树深度为 `log₂ N`，每层在所有子数组上的总工作量为 O(N)。

### 4.2 Average Case / 平均情况

If the pivot is chosen uniformly at random, the expected running time is also O(N log N). The analysis assumes all permutations are equally likely, and the expected size of the larger partition after each split is at most `3N/4`. The recurrence involves a harmonic series that converges to O(N log N). Even median-of-three, which is not fully random, preserves this expected complexity while reducing the constant factor.

如果枢纽被均匀随机选择，期望运行时间也是 O(N log N)。分析假设所有排列等概率出现，每次分割后较大分区的期望大小至多为 `3N/4`。递归式涉及调和级数，收敛到 O(N log N)。即使不完全随机的三数取中，也保持了这个期望复杂度同时降低了常数因子。

### 4.3 Worst Case / 最坏情况

If every partition produces one empty subarray and one of size N-1 — which happens with the fixed-end strategy on already sorted data — the recurrence becomes `T(N) = T(N-1) + O(N)`, which solves to `T(N) = O(N²)`. This is the collapse that pivot selection strategies are designed to prevent. Median-of-three makes this case highly unlikely in practice, though it remains theoretically possible with a contrived input.

如果每次分区产生一个空子数组和一个大小为 N-1 的子数组——这在固定末尾策略面对已排序数据时发生——递归式变为 `T(N) = T(N-1) + O(N)`，解出 `T(N) = O(N²)`。这就是枢纽选择策略被设计来防止的崩塌。三数取中使这种情况在实践中极不可能，尽管理论上仍可能用精心构造的输入触发。

### 4.4 Space Complexity / 空间复杂度

Quick sort is in-place — it uses no auxiliary array. But recursion consumes stack space. In the best case, the recursion depth is O(log N); in the worst case (unbalanced partitions, no tail-recursion optimization), it is O(N). Section 6 covers how to guarantee the O(log N) bound.

快速排序是原地的——它不使用辅助数组。但递归消耗栈空间。最好情况下递归深度为 O(log N)；最坏情况下（不均衡分区，无尾递归优化）为 O(N)。第六章讲如何保证 O(log N) 界限。

## 5. Stability and Other Basic Properties / 稳定性与其它基本性质

Quick sort is **unstable**. During the partitioning pass, elements are swapped across potentially large distances. Two equal elements can easily have their relative order reversed. Consider `[3a, 1, 3b]` with pivot 3b. After partitioning, the first swap might place 3b before 3a, and no subsequent step restores the original order. Stability is sacrificed for speed and in-place operation.

快速排序是**不稳定的**。在分区趟中，元素可能跨越大段距离交换。两个相等的元素很容易被反转相对顺序。考虑 `[3a, 1, 3b]`，枢纽为 3b。分区后，第一次交换可能把 3b 放在 3a 前面，后续没有任何步骤恢复原始顺序。稳定性为速度和原地操作付出了代价。

Quick sort is **in-place**. It requires no additional array allocation beyond the recursion stack. This gives it a memory advantage over merge sort, which needs an auxiliary array of size N for the merge step. The combination of in-place operation and average O(N log N) time is what made quick sort the default sorting algorithm in most standard libraries for decades.

快速排序是**原地的**。它不需要除递归栈之外的额外数组分配。这给了它相对于归并排序的内存优势，后者在合并步骤中需要大小为 N 的辅助数组。原地操作和平均 O(N log N) 时间的结合，正是快速排序在数十年来成为大多数标准库默认排序算法的原因。

## 6. Optimization Techniques / 优化技巧

### 6.1 Tail Recursion and Processing the Smaller Partition First / 尾递归与先处理小分区

The naive quicksort makes two recursive calls per partition. If the partitions are unbalanced, the recursion depth can reach O(N), risking stack overflow on large inputs. The fix is to replace the second recursive call with iteration: after partitioning, identify the smaller and larger subarrays. Recurse on the smaller one, and loop to handle the larger one. The maximum recursion depth is then bounded by the depth of the recursion on the smaller subarray, which is at most O(log N) because the smaller subarray is at most half the size of the current segment.

朴素快排每次分区做两次递归调用。如果分区不均衡，递归深度可达 O(N)，在大型输入上有栈溢出风险。修复方法是用迭代替代第二次递归调用：分区后识别较小和较大的子数组，递归处理较小的，循环处理较大的。最大递归深度于是被递归处理较小子数组的深度所限定，至多为 O(log N)，因为较小子数组的大小至多为当前区间的一半。

```c
void quicksort(int arr[], int left, int right) {
    while (left < right) {
        int p = partition(arr, left, right);
        if (p - left < right - p) {
            quicksort(arr, left, p - 1);
            left = p + 1;            // iterate on the larger part
        } else {
            quicksort(arr, p + 1, right);
            right = p - 1;           // iterate on the larger part
        }
    }
}
```

A common exam question, stated in the problem set that accompanied this topic, asks: "To sort a list of integers using quick sort, it may reduce the total number of recursions by processing the small partition first in each run." This statement is true. Processing the smaller partition first means the larger partition is deferred to the next iteration of the `while` loop rather than spawning an additional recursive call. Each deferred partition counts as one fewer activation record on the call stack, so the total number of recursive invocations across the entire sort is indeed reduced. The recursion depth bound is the direct consequence.

伴随本专题的一道常见考题问：“在快速排序中，每趟优先处理较小的分区可以减少总递归次数。”这个陈述是正确的。优先处理较小分区意味着较大分区被推迟到 `while` 循环的下一次迭代，而不是产生额外的递归调用。每个被推迟的分区意味着调用栈上少一个活动记录，因此整个排序过程中的递归调用总次数确实减少了。递归深度界限是其直接推论。

### 6.2 Iterative Implementation with an Explicit Stack / 显式栈的迭代实现

If the language or environment does not support deep recursion, an explicit stack can simulate the recursive calls. The stack stores `(left, right)` pairs for pending subarrays. The optimization of processing smaller partitions first is achieved by controlling the push order — pushing the larger partition before the smaller one means the smaller one is popped and processed next.

如果语言或环境不支持深度递归，可以用显式栈模拟递归调用。栈中存储待处理子数组的 `(left, right)` 对。通过控制压栈顺序来实现先处理较小分区的优化——将较大分区先压栈，较小分区后压栈，意味着较小分区会被先弹出处理。

```c
void quicksortIterative(int arr[], int n) {
    int stack[n];
    int top = 0;
    stack[top++] = 0;
    stack[top++] = n - 1;

    while (top > 0) {
        int right = stack[--top];
        int left  = stack[--top];
        if (left >= right) continue;

        int p = partition(arr, left, right);

        // Push larger partition first so smaller is processed next
        if (p - left > right - p) {
            if (left < p - 1) { stack[top++] = left;  stack[top++] = p - 1; }
            if (p + 1 < right) { stack[top++] = p + 1; stack[top++] = right; }
        } else {
            if (p + 1 < right) { stack[top++] = p + 1; stack[top++] = right; }
            if (left < p - 1) { stack[top++] = left;  stack[top++] = p - 1; }
        }
    }
}
```

### 6.3 Switching to Insertion Sort for Small Subarrays / 小数组切换插入排序

Recursion has a fixed overhead — function calls, stack frame setup, and teardown — that dominates the actual sorting work when the subarray is very small. For subarrays below a threshold (commonly between 10 and 50 elements), switching to insertion sort yields a measurable speedup. Insertion sort has excellent constant factors and, for nearly-sorted small arrays, approaches linear time.

递归有固定的开销——函数调用、栈帧建立和拆除——当子数组非常小时，这些开销压倒了实际排序工作。对低于阈值（通常 10 到 50 个元素）的子数组，切换到插入排序可带来可测量的加速。插入排序有极好的常数因子，且对接近有序的小数组接近线性时间。

```c
void quicksortOptimized(int arr[], int left, int right) {
    while (left < right) {
        if (right - left < 16) {   // threshold
            insertionSort(arr, left, right);
            return;
        }
        int p = partition(arr, left, right);
        // tail recursion optimization as before
        if (p - left < right - p) {
            quicksortOptimized(arr, left, p - 1);
            left = p + 1;
        } else {
            quicksortOptimized(arr, p + 1, right);
            right = p - 1;
        }
    }
}
```

This leads directly to another exam question that appeared in my study materials: "If there are less than 20 inversions in an integer array, Quick Sort will be the best method among Quick Sort, Heap Sort, and Insertion Sort." This statement is **false**. Insertion sort runs in `O(N + I)` time, where `I` is the number of inversions. When `I < 20`, the array is almost sorted, and insertion sort's time is essentially `O(N)`. Quick sort, even with optimizations, still performs `O(N log N)` partitioning work. For a nearly sorted array with very few inversions, insertion sort is the clear winner, not quick sort. This is the theoretical justification for the small-subarray threshold: it is precisely in those tiny subarrays that insertion sort's `O(N + I)` behavior dominates quick sort's recursion overhead.

这直接引出我学习资料中的另一道考题：“如果数组中逆序数少于 20，快速排序将是快速排序、堆排序和插入排序中最好的方法。”此陈述**错误**。插入排序的运行时间是 `O(N + I)`，其中 `I` 是逆序数。当 `I < 20` 时，数组几乎有序，插入排序的时间实质上是 `O(N)`。快速排序即使加了优化，仍然要做 `O(N log N)` 的分区工作。对于逆序数极少的近乎有序数组，插入排序是明显的赢家，而非快速排序。这正是小数组阈值的理论依据：正是在那些微小的子数组里，插入排序的 `O(N + I)` 行为压倒了快速排序的递归开销。

The exact threshold varies across implementations — Java uses 47, C++ standard libraries often use values between 16 and 32 — but all are chosen empirically, not from a strict mathematical derivation. They represent the crossover point where insertion sort's lower constant factor begins to win.

精确阈值因实现而异——Java 用 47，C++ 标准库常用 16 到 32 之间的值——但都是经验选择，而非来自严格的数学推导。它们代表了插入排序更低的常数因子开始取胜的交叉点。

## 7. Performance on Special Inputs / 特殊情况下的性能表现

### 7.1 Nearly Sorted Arrays / 近乎有序的数组

As the inversion-count discussion above makes clear, quick sort is not the best tool for every job. For arrays with very few inversions, insertion sort's adaptive nature gives it a decisive advantage. Heap sort, which always runs in `O(N log N)` regardless of input order, also outperforms quick sort on nearly sorted data when the pivot selection is naive. Quick sort's strength is generality, not specialization.

正如上文关于逆序数的讨论所阐明的，快速排序并非适用于所有工作的最佳工具。对于逆序数极少的数组，插入排序的自适应本性给了它决定性的优势。堆排序无论输入顺序如何总是 O(N log N)，在枢纽选择天真时也能在近乎有序数据上超越快速排序。快速排序的强项是通用性，而非专门化。

### 7.2 The Structure After Two Passes / 两趟快排后的结构

After one partition pass, the array has a single pivot at its final position, with everything to its left smaller and everything to its right larger. After a second pass — meaning both the left and right subarrays have been partitioned — the array gains additional structure. It now contains up to three pivots: the global pivot from the first pass, plus one pivot in the left subarray (if its length ≥ 2) and one in the right subarray (if its length ≥ 2). Each of these pivots satisfies the property that all elements to its left are smaller and all to its right are larger. Moreover, the pivots are already in their correct relative order: the left pivot < global pivot < right pivot.

一趟分区后，数组中有一个枢纽位于其最终位置，左侧全小，右侧全大。两趟之后——即左右子数组各自完成了一次分区——数组获得了额外的结构。它现在包含至多三个枢纽：第一趟的全局枢纽，加上左子数组中的一个枢纽（如果其长度 ≥ 2）和右子数组中的一个枢纽（如果其长度 ≥ 2）。每个枢纽都满足“左小右大”的性质。而且，枢纽的相对顺序已经是正确的：左枢纽 < 全局枢纽 < 右枢纽。

This structural property is the basis for another exam question: "During the sorting, processing every element which is not yet at its final position is called a 'run.' Which of the following cannot be the result after the second run of quicksort?" To answer such a question, check whether the array can be explained by a nested pivot structure. There must exist an element that acts as the first-run pivot — all elements to its left are smaller, all to its right are larger. Within each of the two resulting segments, there must exist second-run pivots satisfying the same property recursively. If no such nested pivot assignment is possible, that array cannot be the result after two runs of quick sort.

这个结构性质是另一道考题的基础：“在排序过程中，处理每一个尚未到达最终位置的元素称为一‘趟’。下列哪个不可能是快速排序第二趟之后的结果？”回答这种题目时，检查数组是否可以用嵌套的枢纽结构来解释。必须存在一个元素充当第一趟的枢纽——左侧全小于它，右侧全大于它。在两个产生的段中各自必须存在第二趟枢纽递归地满足相同性质。如果不可能找到这样的嵌套枢纽分配，该数组就不可能是两趟快速排序之后的结果。

## 8. Further Explorations in History / 历史上的进一步探索

### 8.1 Larger Sampling Strategies / 更大范围的取中策略

Median-of-three can be generalized to median-of-five, median-of-nine, or any odd-sized sample. Larger samples produce better pivot estimates — closer to the true median — but the cost of computing the sample median grows. Sorting 5 elements to find their median is still constant time but with a larger constant. The returns diminish quickly; median-of-three captures most of the benefit.

三数取中可以推广到五数取中、九数取中，或任意奇数大小的样本。更大的样本产生更好的枢纽估计——更接近真正的中位数——但计算样本中位数的代价也在增长。排序 5 个元素来找它们的中位数仍然是常数时间，但常数更大。收益递减很快；三数取中已经捕获了大部分好处。

### 8.2 BFPRT: Median of Medians / BFPRT：中位数的中位数

In 1973, Blum, Floyd, Pratt, Rivest, and Tarjan published a selection algorithm that finds the median of an array in guaranteed O(N) time. Using this as the pivot selection subroutine would make quick sort's worst case O(N log N) with mathematical certainty. The algorithm divides the array into groups of 5, computes the median of each group, recursively computes the median of those medians, and uses that as the pivot for a partition. The guarantee comes from the fact that the "median of medians" is provably not too far from the true median — it eliminates at least 30% of elements from consideration in each recursive call.

1973 年，Blum、Floyd、Pratt、Rivest 和 Tarjan 发表了一个保证 O(N) 时间找到数组中位数的选择算法。用它作为枢纽选择子程序将使快速排序的最坏情况得到数学上确定的 O(N log N)。该算法将数组分成每组 5 个，计算每组的中位数，递归计算这些中位数的中位数，并以此为枢纽进行分区。保证来自一个事实：“中位数的中位数”可证明地离真正中位数不太远——它每次递归调用至少排除 30% 的元素。

In practice, BFPRT is almost never used for sorting. The constant factor is enormous — the algorithm performs multiple passes over the array and recurses in a complex pattern. Standard library implementations achieve better real-world performance with median-of-three plus the engineering optimizations described in Section 6. BFPRT remains a landmark theoretical result, not a practical tool.

实践中，BFPRT 几乎从不用于排序。常数因子巨大——算法在数组上做多趟扫描并以复杂模式递归。标准库实现用三数取中加上第 6 节描述的工程优化获得了更好的真实性能。BFPRT 仍然是一个里程碑式的理论成果，而非实用工具。

### 8.3 The Industrial Consensus / 工业界的共识

Decades of empirical tuning have converged on a standard recipe: median-of-three pivot selection, tail recursion elimination with smaller-partition-first ordering, and a cutoff to insertion sort for subarrays below a threshold of roughly 16–47 elements. This combination is what ships in the C++ Standard Library's `std::sort`, in Java's `Arrays.sort` for primitive types, and in countless other production systems. It represents the accumulated wisdom that the gap between theory and practice in quick sort is closed not by a single clever idea but by layering several moderate improvements, each addressing a specific failure mode.

数十年的经验调优汇聚成了一套标准配方：三数取中枢纽选择、尾递归消除配合先小后大排序、以及对小于约 16–47 个元素的子数组切换到插入排序。这套组合拳搭载在 C++ 标准库的 `std::sort` 中，在 Java 的 `Arrays.sort`（对原始类型）中，以及在无数其他生产系统中。它代表了这样一条累积的智慧：快速排序中理论与实践之间的鸿沟不是靠一个聪明点子填平的，而是靠层层叠加数个温和的改进，每个针对一种特定的失败模式。

## 9. Conclusion: The Art of Balance / 总结：快排的艺术在于平衡

Quick sort is a case study in the distance between a beautiful algorithmic idea and a production-ready implementation. The core idea — pick a pivot, partition, recurse — fits on a single line. But making it reliable, efficient, and safe across all inputs requires thinking about pivot quality, recursion depth, small-subarray behavior, and adversarial inputs. The standard recipe — median-of-three, tail recursion with smaller-first ordering, insertion sort cutoff — is not the product of a single paper but of decades of accumulated engineering experience.

快速排序是关于优美算法思想与生产级实现之间距离的一个案例研究。核心思想——选枢纽、分区、递归——一行就能写下。但使其在所有输入上可靠、高效、安全，需要思考枢纽质量、递归深度、小数组行为和对抗性输入。标准配方——三数取中、先小后大的尾递归、插入排序切换——不是一篇论文的产物，而是数十年累积工程经验的产物。

The metaphor from the introduction holds. Partitioning is the "hard labor" of quick sort — one pass that rearranges the entire segment. If the labor is done well, with a reasonably balanced split, the recursion coasts. If it is done poorly, the recursion struggles. Every optimization discussed in this note is, at root, about ensuring that the hard labor is well spent.

引言中的隐喻依然成立。分区是快速排序的“苦力”——一趟重排整个区间的硬活。如果活干得好，分片大致均衡，递归就享清福。如果干得差，递归就挣扎。本文讨论的每一项优化，归根结底，都是为了让那趟苦力花得值。

## Appendix A: Basic Quicksort / 附录 A：基础快速排序

```c
void swap(int *a, int *b) {
    int t = *a; *a = *b; *b = t;
}

int partition(int arr[], int left, int right) {
    int pivot = arr[right];
    int i = left - 1;
    for (int j = left; j < right; j++) {
        if (arr[j] <= pivot) {
            i++;
            swap(&arr[i], &arr[j]);
        }
    }
    swap(&arr[i + 1], &arr[right]);
    return i + 1;
}

void quicksort(int arr[], int left, int right) {
    if (left < right) {
        int p = partition(arr, left, right);
        quicksort(arr, left, p - 1);
        quicksort(arr, p + 1, right);
    }
}
```

## Appendix B: Industrial-Strength Quicksort / 附录 B：工业级快速排序

```c
void insertionSort(int arr[], int left, int right) {
    for (int i = left + 1; i <= right; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= left && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}

int medianOfThree(int arr[], int left, int right) {
    int mid = left + (right - left) / 2;
    if (arr[left] > arr[mid])  swap(&arr[left], &arr[mid]);
    if (arr[left] > arr[right]) swap(&arr[left], &arr[right]);
    if (arr[mid] > arr[right])  swap(&arr[mid], &arr[right]);
    swap(&arr[mid], &arr[right]);
    return arr[right];
}

int partitionMo3(int arr[], int left, int right) {
    int pivot = medianOfThree(arr, left, right);
    int i = left - 1;
    for (int j = left; j < right; j++) {
        if (arr[j] <= pivot) {
            i++;
            swap(&arr[i], &arr[j]);
        }
    }
    swap(&arr[i + 1], &arr[right]);
    return i + 1;
}

#define THRESHOLD 16

void quicksortOptimized(int arr[], int left, int right) {
    while (left < right) {
        if (right - left < THRESHOLD) {
            insertionSort(arr, left, right);
            return;
        }
        int p = partitionMo3(arr, left, right);
        if (p - left < right - p) {
            quicksortOptimized(arr, left, p - 1);
            left = p + 1;
        } else {
            quicksortOptimized(arr, p + 1, right);
            right = p - 1;
        }
    }
}
```
