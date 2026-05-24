# The Binary Heap: From Classroom Fundamentals to Algorithmic Depths

<!-- preview: ！？堆堆？！-->

# 二叉堆：从课堂基础到算法纵深

<span style="color:grey">

Tips / 提示：

This article Part 1 explains the properties of heaps and some simple algorithms that are commonly tested in data structure courses; Part 2 covers slightly more advanced content, including three modules: heap sorting, Top-K problem, and Top-K frequent elements problem, the latter two of which are classic algorithm exam questions; Part 3 delves deeper into the architecture and algorithmic roles of heaps. Feel free to jump to the corresponding section as needed.

本文第一部分讲解数据结构课上通常会考察的堆性质和一些简单算法；第二部分会讲解稍微进阶一点的内容，包括堆排序、Top-K问题以及前K个高频元素问题三个模块，后两者是经典的算法考题；第三部分则会对堆算法和性质进行更深入的研究。请根据需要自行跳转到对应章节。

Unless otherwise specified, the "heap" mentioned in this article refers to a binary heap.
For detailed research on D-heap, please refer to Section 3.6.

本文所述的“堆”如非特殊说明，均指二叉堆。
D叉堆的相关研究详见第 3.6 节。

</span>

## 1. What the Data Structures Course Covers / 数据结构课考什么

### 1.1 The Heap Concept: A Complete Binary Tree in an Array / 堆的概念：数组里的完全二叉树

A binary heap is a complete binary tree that satisfies the **heap property**. "Complete" means every level except possibly the last is fully filled, and the last level is filled from left to right without gaps. This structural constraint is what makes the array representation possible: there are no holes, so parent-child relationships can be expressed with simple arithmetic.

二叉堆是一棵满足**堆性质**的完全二叉树。“完全”意味着除了可能最底层之外每一层都是满的，且最底层从左到右无空隙地填充。这个结构约束正是数组表示成为可能的原因：没有空洞，父子关系可以用简单的算术表达。

Using 0-indexed arrays (as in most C code), for a node at index `i`: its left child is at `2i + 1`, its right child at `2i + 2`, and its parent at `⌊(i - 1) / 2⌋`. If using 1-indexed arrays (common in textbook pseudocode), the formulas become even cleaner: left child at `2i`, right child at `2i + 1`, parent at `⌊i / 2⌋`. The array stores nodes in level order — root first, then its children left to right, then grandchildren left to right, and so on. This compact representation avoids storing explicit pointers, making the heap memory-efficient.

使用 0 索引数组（多数 C 代码的做法），对于下标为 `i` 的节点：左孩子在 `2i + 1`，右孩子在 `2i + 2`，父节点在 `⌊(i - 1) / 2⌋`。若使用 1 索引数组（教材伪代码常用），公式更整洁：左孩子 `2i`，右孩子 `2i + 1`，父节点 `⌊i / 2⌋`。数组按层序存储节点——根在前，然后是其孩子从左到右，然后是孙辈从左到右，以此类推。这种紧凑表示避免了显式存储指针，使堆内存高效。

The **heap property** distinguishes a min-heap from a max-heap. In a min-heap, every node's value is less than or equal to the values of its children (the root holds the global minimum). In a max-heap, the inequality reverses (the root holds the global maximum). Critically, the heap property is local — each parent-child pair must satisfy it — but this local constraint induces a global partial order. The tree is not fully sorted; it only guarantees that the path from root to any leaf is non-decreasing (min-heap) or non-increasing (max-heap).

**堆性质**区分了最小堆和最大堆。最小堆中，每个节点的值小于等于其孩子的值（根持有全局最小值）。最大堆中，不等号反转（根持有全局最大值）。关键是，堆性质是局部的——每对父子必须满足——但这个局部约束产生了全局偏序。树并非完全排序；它只保证从根到任何叶子的路径是非递减（最小堆）或非递增（最大堆）。

Why does this data structure exist rather than just using a sorted array? A sorted array gives you the minimum in O(1) time, but inserting a new element costs O(n) because all larger elements must shift right to make room. A heap gives you the minimum in O(1) as well, and both insertion and extraction cost only O(log n). It is this combination — constant-time access to the minimum, logarithmic updates — that makes the heap the data structure of choice for any algorithm that **repeatedly needs the "current smallest" element** while the collection is changing.

为什么需要这个数据结构而不是直接用排序数组？排序数组提供 O(1) 时间取最小值，但插入新元素需要 O(n)，因为所有更大的元素必须右移腾出空间。堆同样提供 O(1) 取最小值，而插入和提取都仅需 O(log n)。正是这种组合——常数时间访问最小值、对数时间更新——使堆成为任何在集合变动中**反复需要“当前最小”元素**的算法的首选数据结构。

By the way, a natural question arises: why represent a heap with an array at all? A binary tree can also be built with linked nodes — each node storing its value and pointers to its left and right children. In principle, a heap _can_ be implemented that way. But the array representation has three decisive advantages that make it the universal choice in both textbooks and production code.

对了，一个自然的问题是：为什么要用数组表示堆？二叉树同样可以用链式节点来构建——每个节点存储其值和指向左右孩子的指针。原则上，堆*可以*那样实现。但数组表示有三个决定性优势，使它成为教材和工程代码中的普遍选择。

First, memory efficiency. A linked heap must store two child pointers per node (and often a parent pointer as well, for `heapifyUp`). For integer data, pointer overhead can easily double or triple the memory footprint. An array stores only the data itself, with zero pointer overhead — the parent-child relationships are encoded in the index arithmetic.

第一，内存效率。链式堆必须为每个节点存储两个子指针（而且往往还需要父指针，以支持 `heapifyUp`）。对于整数数据，指针开销可以轻易让内存占用量翻倍甚至变为三倍。数组只存储数据本身，零指针开销——父子关系被编码在索引计算中。

Second, and more fundamentally, the complete binary tree property gives the array representation O(1) access to any node's parent or children via arithmetic. In a linked heap, finding the parent of an arbitrary node requires an explicit parent pointer (or a search from the root, costing O(n)). In an array, `parent = (i - 1) / 2` takes a single CPU cycle. This is not just a constant-factor improvement — it enables `heapifyUp` and `heapifyDown` to work efficiently without storing and maintaining extra pointers.

第二，也是更根本的，完全二叉树的性质使得数组表示通过算术运算即可 O(1) 访问任意节点的父节点或孩子。链式堆中，找到任意节点的父节点需要显式的父指针（或从根搜索，花费 O(n)）。数组中，`parent = (i - 1) / 2` 只需一个 CPU 周期。这不仅是一个常数因子的改进——它使 `heapifyUp` 和 `heapifyDown` 能够高效运作，而无需存储和维护额外的指针。

Third, cache locality. An array packs all heap elements contiguously in memory. When `heapifyDown` traverses a path from root toward a leaf, it accesses array indices that are close together, benefiting heavily from CPU cache prefetching. A linked heap scatters nodes across memory, causing cache misses at almost every step. For large heaps, this locality difference can produce an order-of-magnitude speed gap.

第三，缓存局部性。数组将堆的所有元素紧凑地排布在内存中。当 `heapifyDown` 从根向叶子遍历路径时，它访问的数组下标彼此邻近，极大受益于 CPU 缓存预取。链式堆将节点散布在内存各处，几乎每一步都会触发缓存未命中。对于大型堆，这种局部性差异可能导致数量级级别的速度差距。

These three factors together explain why heap implementations in C, C++, Java, Python, and virtually every language with a standard library use arrays. A linked heap is occasionally used for teaching purposes to make the tree structure visually explicit, but for any practical purpose, the array is the heap.

这三个因素共同解释了为什么 C、C++、Java、Python 以及几乎所有拥有标准库的语言的堆实现都使用数组。链式堆偶尔在教学场景中用于让树结构在视觉上显式化，但对于任何实际用途，数组就是堆。

### 1.2 Core Operations: Insert, Extract-Min, Delete, and Peek / 核心操作：插入、弹出、删除与查看

The three fundamental mutating operations on a min-heap are push (insert), pop (extract-min), and delete (remove an arbitrary element by value). The peek operation (read-min without removing) is trivial: return `heap->data[0]`. The other three are where the heap's algorithmic elegance resides.

最小堆的三个基本可变操作是 push（插入）、pop（弹出最小）和 delete（按值删除任意元素）。peek 操作（只读堆顶不移除）是平凡的：返回 `heap->data[0]`。另三个操作才是堆的算法优雅所在。

**Push (Insert)** appends the new element at the end of the array — the next available leaf position in the complete tree — then calls `heapifyUp` to restore the heap property. The `heapifyUp` operation compares the new element with its parent. If the new element is smaller, they swap, and the element continues to "bubble up" until it either reaches the root or finds a parent that is already smaller. In the worst case, the element rises all the way from leaf to root in O(log n) time. The average case is much better: a random new element is unlikely to be the new minimum, so it typically rises only a few levels, yielding O(1) average performance.

**Push（插入）** 将新元素追加到数组末尾——完全二叉树中下一个可用的叶位——然后调用 `heapifyUp` 恢复堆性质。`heapifyUp` 操作将新元素与其父节点比较。若新元素更小，则交换，元素继续“上浮”，直到抵达根节点或找到一个已经更小的父节点。最坏情况下，元素从叶子一路浮到根，O(log n) 时间。平均情况要好得多：一个随机的新元素不太可能恰好成为新的最小值，因此通常只上升几层，平均性能 O(1)。

```c
void push(MinHeap *heap, int value) {
    if (heap->size == heap->capacity) return;
    heap->data[heap->size] = value;
    heapifyUp(heap, heap->size);
    heap->size++;
}
```

**Pop (Extract-Min)** removes the root — the minimum element. The algorithm moves the last element of the array (the rightmost leaf) into the root position, decrements the size, and calls `heapifyDown` on the new root. The `heapifyDown` operation compares the element with its two children. If the element is larger than at least one child, it swaps with the _smaller_ of the two children — so that the smaller child rises to become the new parent, preserving the min-heap property. The process repeats until the element is no longer larger than either child, or it reaches a leaf. Each swap moves the element down one level, so the worst-case cost is O(log n).

**Pop（弹出最小）** 移除根——最小元素。算法将数组最后一个元素（最右叶子）移至根位置，减小 size，然后对新根调用 `heapifyDown`。`heapifyDown` 操作将元素与其两个孩子比较。若元素大于至少一个孩子，则与两个孩子中*较小的那个*交换——使较小的孩子升起成为新父节点，保持最小堆性质。在新位置重复此过程，直到元素不再大于任何孩子，或抵达叶子。每次交换将元素下移一层，最坏成本 O(log n)。

```c
int pop(MinHeap *heap) {
    if (heap->size == 0) return -1;
    int min = heap->data[0];
    heap->data[0] = heap->data[heap->size - 1];
    heap->size--;
    heapifyDown(heap, 0);
    return min;
}
```

**Delete (Remove by Value)** is the most involved of the three. Unlike pop, which always targets the root, deletion must first locate the target element within the array — a linear scan taking O(n) time in the worst case, since a heap provides no efficient search by value (it is ordered only vertically, not horizontally). Once the target index is found, the algorithm replaces it with the last element of the array (the rightmost leaf), decrements the size, and then must decide which direction to restore. If the replacement element is smaller than the original occupant of that position, it may need to bubble _up_ to satisfy the heap property against ancestors. If it is larger, it may need to sink _down_ against descendants. An elegant unified approach is to call `heapifyDown` first (which handles the "too large" case) and then `heapifyUp` (which handles the "too small" case). At most one of these will actually perform work — if the element sank, it is now deeper in the tree and cannot be smaller than any ancestor it already satisfied; if it didn't sink, it might still be too small for its parent, so `heapifyUp` takes care of it. The scan dominates, giving O(n) worst-case time, with the heap restoration contributing O(log n).

**Delete（按值删除）** 是三者中最复杂的。不同于总是针对根的 pop，删除必须先定位目标元素在数组中的位置——需要一次线性扫描，最坏情况 O(n)，因为堆不支持按值高效搜索（它只在垂直方向有序，水平方向无序）。一旦找到目标下标，算法将其替换为数组最后一个元素（最右叶子），减小 size，然后必须决定向哪个方向恢复堆性质。如果替换进来的元素比该位置原来的元素小，它可能需要向*上*浮以修复与祖先的关系；如果更大，可能需要向*下*沉以修复与后代的关系。一种优雅的统一做法是先调用 `heapifyDown`（处理“太大”的情况），再调用 `heapifyUp`（处理“太小”的情况）。两者至多只有一方会真正工作——如果元素下沉了，它现在在树中更深的位置，不可能比已经满足关系的祖先更小；如果没下沉，它可能仍比父节点小，`heapifyUp` 接手处理。线性扫描主导复杂度，总最坏 O(n)，堆恢复部分贡献 O(log n)。

```c
void delete(MinHeap *heap, int value) {
    // Step 1: find the index of the target element
    int target = -1;
    for (int i = 0; i < heap->size; i++) {
        if (heap->data[i] == value) {
            target = i;
            break;
        }
    }
    if (target == -1) return;  // not found

    // Step 2: replace with the last element
    heap->data[target] = heap->data[heap->size - 1];
    heap->size--;

    // Step 3: restore heap property — at most one of these will do work
    heapifyDown(heap, target);
    heapifyUp(heap, target);
}
```

A small but important subtlety lurks in Step 2. When the target happens to be the last element itself, replacing it with itself and calling both `heapifyDown` and `heapifyUp` on the same position is harmless — the size has already been decremented, and the "replacement" value is identical. For all other cases, the replacement element genuinely differs from the original, and the bidirectional restoration correctly handles whichever direction the violation occurs.

一个微妙但重要的细节隐藏在第二步中。当目标元素恰好就是最后一个元素时，用自己替换自己再对该位置同时调用 `heapifyDown` 和 `heapifyUp` 是无害的——size 已经减小，且“替换”的值与原来相同。对于所有其他情况，替换元素与原值确实不同，双向恢复能正确处理无论哪个方向发生的违反。

Collectively, these three operations reveal a shared algorithmic pattern. Every modification to the heap — whether insertion at the leaf, extraction at the root, or arbitrary deletion — follows the same rhythm: place the affected element at a specific position, then let it drift upward if it is too small for its ancestors, or sink downward if it is too large for its descendants. The heap property is maintained not by global reordering, but by a localized, logarithmic cascade. This is the heart of the heap's efficiency: the tree structure confines every change to a single root-to-leaf path, never touching the rest of the array.

这三个操作共同揭示了一个共通的算法模式。对堆的每一次修改——无论是在叶子插入、在根提取还是任意位置删除——都遵循相同的节奏：将受影响的元素放置在特定位置，然后让它上浮（如果对祖先来说太小）或下沉（如果对后代来说太大）。堆性质的维护不依赖全局重排，而依赖于局部的对数级级联反应。这正是堆高效性的核心：树结构将每次变更限制在单条根到叶子的路径上，永远不触及数组其余部分。

For completeness, here are the two workhorse functions that underpin all three mutating operations. They are short but dense with meaning — every line matters.

为完整起见，下面是支撑所有三个可变操作的两个主力函数。它们短小却意味稠密——每一行都重要。

```c
void heapifyUp(MinHeap *heap, int index) {
    int parent = (index - 1) / 2;
    while (index > 0 && heap->data[index] < heap->data[parent]) {
        swap(&heap->data[index], &heap->data[parent]);
        index = parent;
        parent = (index - 1) / 2;
    }
}
```

The `heapifyUp` function climbs upward from a given index. At each step, it compares the current node with its parent. If the current node is smaller, they swap and the loop continues one level higher. The condition `index > 0` ensures we stop at the root. This function is called after insertion (the new element may be too small for its ancestors) and after deletion (the replacement element may be too small for the ancestors of the deleted position).

`heapifyUp` 从给定下标向上攀爬。每一步，它将当前节点与父节点比较。若当前节点更小，交换并继续向上一级。条件 `index > 0` 保证停在根。此函数在插入后（新元素可能对祖先太小）和删除后（替换元素可能对被删位置祖先太小）被调用。

```c
void heapifyDown(MinHeap *heap, int index) {
    int left  = 2 * index + 1;
    int right = 2 * index + 2;
    int smallest = index;

    if (left < heap->size && heap->data[left] < heap->data[smallest])
        smallest = left;
    if (right < heap->size && heap->data[right] < heap->data[smallest])
        smallest = right;

    if (smallest != index) {
        swap(&heap->data[index], &heap->data[smallest]);
        heapifyDown(heap, smallest);
    }
}
```

The `heapifyDown` function sinks downward from a given index. It examines both children of the current node and identifies the smallest among the parent and its two children. If the parent is not the smallest, a swap moves the smaller child upward, and the function recurses into the new position. The boundary checks `left < heap->size` and `right < heap->size` handle the case of incomplete last level — a node may have one child, or none. This function is called after extraction (the replacement root may be too large for its children) and after deletion (the replacement element may be too large for the descendants of the deleted position).

`heapifyDown` 从给定下标向下沉降。它检查当前节点的两个孩子，找出父节点与两个孩子中最小的那个。如果父节点不是最小的，交换使较小的孩子上升，函数递归进入新位置。边界检查 `left < heap->size` 和 `right < heap->size` 处理了最底层可能不完整的情况——一个节点可能只有一个孩子，或没有。此函数在弹出后（替换的根可能对其孩子太大）和删除后（替换元素可能对被删位置后代太大）被调用。

The asymmetry between these two functions is instructive. `heapifyUp` is iterative (a `while` loop) because the path is a single chain upward — there are no choices to make at each level. `heapifyDown` is recursive because at each level it must choose between two children, and which child gets promoted affects the subtree below. Both run in O(log n) time, visiting at most one node per level of the tree.

这两个函数的不对称性很有启发性。`heapifyUp` 是迭代的（`while` 循环），因为路径是单一向上链——每层没有选择要做。`heapifyDown` 是递归的，因为每层必须在两个孩子之间做出选择，而哪个孩子被提升会影响下方子树。两者都在 O(log n) 时间内运行，每层树至多访问一个节点。

### 1.3 Converting Between Min-Heap and Max-Heap / 最大堆与最小堆的相互转换

A question that frequently appears on exams: given an array already arranged as a min-heap, how do you convert it into a max-heap, and what is the time complexity? A tempting but incorrect answer is to run `heapifyUp` on every element. This section explains why that fails, and what the correct algorithm is.

一道考题中频繁出现的问题是：给定一个已排成最小堆的数组，如何将其转换为最大堆，时间复杂度是多少？一个诱人但错误的答案是逐个元素执行 `heapifyUp`。本节解释它为什么失败，以及正确的算法是什么。

#### 1.3.1 Why `heapifyUp` Does Not Work / 为什么 heapifyUp 不行

The `heapifyUp` operation fixes a _single_ violation: a node that is too small relative to its parent. It does this by walking the node upward along the root-to-leaf chain, swapping as needed, until the parent-child relationship is restored. This works for insertion precisely because insertion appends a new element at the leaf, and only that element may violate the heap property — every other node was already part of a valid heap before the insertion.

`heapifyUp` 修复的是*单一*违规：一个节点相对于其父节点太小。它通过沿着根到叶子的链向上走，按需交换，直到父子关系恢复。这恰好适用于插入操作，因为插入将新元素追加在叶子处，只有这个元素可能违反堆性质——插入之前，其他所有节点都已经是合法堆的一部分。

But when converting between heap types, the entire array starts in a state that violates the _target_ heap property globally. If we iterate from the root downward calling `heapifyUp` on each node, we assume each node's ancestors already satisfy the target heap property. That assumption is false at the beginning — the root itself might be wrong. The `heapifyUp` operation checks the parent; if the parent is not yet a valid max-heap node (it might be smaller than its own parent), fixing the current node against it accomplishes nothing — the violation simply propagates upward and may never be resolved correctly.

但在堆类型转换时，整个数组初始就处于全局违反*目标*堆性质的状态。如果从根向叶子依次对每个节点调用 `heapifyUp`，我们就假定了每个节点的祖先已经满足目标堆性质。这个假设一开始就不成立——根本身可能就是错的。`heapifyUp` 检查父节点；如果父节点还不是一个合法的最大堆节点（它可能比自己的父节点小），那么把当前节点相对它修复毫无意义——违规只是向上传播，可能永远无法被正确解决。

#### 1.3.2 The Correct Algorithm: Bottom-Up `heapifyDown` / 正确的算法：自底向上的 heapifyDown

The correct approach is the **O(n) heapify algorithm** covered in depth in Section 3.1. The idea is to process the array from bottom to top, calling `heapifyDown` — not `heapifyUp` — on every non-leaf node, using the target heap's comparison direction. The key insight is that `heapifyDown` fixes a node by looking _downward_: it assumes the node's two subtrees are already valid heaps, and sinks the node into the correct position among them. Since leaves trivially satisfy any heap property, we can start from the lowest non-leaf node (index `⌊n/2⌋ - 1` in 0-indexed notation) and work backward to the root. By the time a node is processed, both its left and right subtrees are already valid heaps of the target type, so `heapifyDown` can do its work correctly.

正确的做法是第 3.1 节深入讲解的 **O(n) heapify 算法**。其思想是自底向上处理数组，对每个非叶节点调用 `heapifyDown`——而不是 `heapifyUp`——使用目标堆的比较方向。关键洞察在于 `heapifyDown` 通过向*下*看修复节点：它假定节点的两个子树已经是合法堆，然后在该节点下沉到子树中的正确位置。由于叶子天然满足任何堆性质，我们可以从最低的非叶节点（0 索引下下标 `⌊n/2⌋ - 1`）开始，向根逆序处理。当处理到一个节点时，它的左右子树都已经是以它为根的、目标类型的合法堆，因此 `heapifyDown` 可以正确地完成工作。

To convert a min-heap to a max-heap: for `i` from `n/2 - 1` down to `0`, call `heapifyDown` configured for a max-heap — where the parent must be _larger_ than its children, and a swap chooses the larger of the two children. The original min-heap arrangement is ignored; the O(n) heapify algorithm imposes the max-heap property from scratch. Conversely, converting a max-heap to a min-heap uses the same procedure with a min-heap comparator.

将最小堆转换为最大堆：`i` 从 `n/2 - 1` 递减到 `0`，调用为最大堆配置的 `heapifyDown`——父节点必须*大于*孩子，交换时选择两个孩子中较大的那个。原有的最小堆排列被忽略；O(n) heapify 算法从零开始强制执行最大堆性质。反过来，最大堆转最小堆用相同的过程，只是用最小堆比较器。

```c
// Convert an existing min-heap to a max-heap in O(n) time.
// Assumes heap->data[0 .. heap->size-1] is a valid min-heap.
void convertToMaxHeap(MinHeap *heap) {
    // Start from the last non-leaf node and walk upward to the root
    for (int i = heap->size / 2 - 1; i >= 0; i--) {
        heapifyDownMax(heap, i);  // max-heap version of heapifyDown
    }
}
```

The `heapifyDownMax` function is identical to the min-heap `heapifyDown` except that it selects the _larger_ child for swapping. We skip the specific C implementation.

`heapifyDownMax` 与最小堆的 `heapifyDown` 相同，只是它选择*较大的*孩子进行交换。具体的C语言实现我们略去。

#### 1.3.3 Why This Is O(n) / 为什么这是 O(n)

The complexity analysis is the same as for the standard O(n) heapify. In brief: most nodes are near the leaves and sink zero or one level during `heapifyDown`. The few nodes near the root sink O(log n) levels, but there are so few of them that the total work sums to O(n) (We will prove this, rigorously, in Section 3.1.4). The existing min-heap order provides no shortcut — conversion does not become sub-O(n) — but neither does it impose any extra cost beyond what building a max-heap from an arbitrary array would require. The asymptotic complexity is Θ(n) in all cases.

复杂度分析与标准 O(n) heapify 相同。简言之：大多数节点靠近叶子，在 `heapifyDown` 中下沉零层或一层。少数靠近根的节点下沉 O(log n) 层，但它们的数量极少，总工作量加起来是 O(n)（这一点我们会在第 3.1.4 节中严谨证明）。已有的最小堆顺序不提供捷径——转换复杂度不会低于 O(n)——但也不会带来超出从任意数组建最大堆所需的额外代价。所有情况下渐近复杂度都是 Θ(n)。

#### 1.3.4 What This Question Tests / 这道题考什么

This exam question is pedagogically subtle. It tests whether the student understands that the heap property is about local parent-child relationships and not a global sorted order — and, more importantly, whether they understand _which_ direction a heap repair operation works in. Mistaking `heapifyUp` for `heapifyDown` is a common and revealing error. The student who reaches for `heapifyUp` has memorized the operations but not grasped the structural invariant each one depends on. The student who recognizes the O(n) heapify algorithm as the correct tool — and can explain why — has understood the heap at a deeper level.

这道考题在教学上很微妙。它检验学生是否理解堆性质关乎局部父子关系而非全局排序顺序——并且，更重要的是，是否理解堆修复操作*向哪个方向*工作。将 `heapifyUp` 误作 `heapifyDown` 是一个常见且暴露本质的错误。伸手拿 `heapifyUp` 的学生背下了操作但没有领悟每个操作所依赖的结构不变量。认出 O(n) heapify 算法才是正确工具——并能解释为什么——的学生，已经在更深层次上理解了堆。

## 2. Heap Algorithms Beyond the Classroom / 课堂之外的堆算法

The heap operations covered in Section 1 — push, pop, and heapify — are the building blocks. What makes the heap genuinely useful is how these primitives compose into algorithms that solve problems far beyond "maintain a dynamic minimum." This section covers three such algorithms that every data structures student encounters, whether in coursework or in self-study.

第一节中覆盖的堆操作——push、pop 和 heapify——只是积木。让堆真正有价值的是这些原语如何组合成算法，解决远超“维护动态最小值”范畴的问题。本节覆盖三个这样的算法，每个数据结构学生都会在课堂或自学中遇到。

### 2.1 Heap Sort: Sorting with a Heap / 堆排序：用堆排序

Heap sort is a comparison-based sorting algorithm that uses a max-heap to sort an array in ascending order. It works in two phases.

堆排序是一种基于比较的排序算法，用最大堆将数组排为升序。它分两个阶段工作。

**Phase 1: Build a max-heap.** Call the O(n) heapify procedure on the entire unsorted array. After this, the array satisfies the max-heap property: every parent is larger than its children, and the maximum element sits at index 0.

**第一阶段：建最大堆。** 对整个无序数组调用 O(n) 的 heapify 过程。此后数组满足最大堆性质：每个父节点大于其孩子，最大元素位于下标 0。

**Phase 2: Repeatedly extract the maximum.** The root (index 0) holds the current maximum. Swap it with the last element of the heap (index `size - 1`), then decrement the heap size by 1. The maximum is now in its correct sorted position at the end of the array, conceptually "removed" from the heap. The new element at the root likely violates the max-heap property, so call `heapifyDown` on the root to restore it. Repeat until the heap size shrinks to 1.

**第二阶段：反复提取最大值。** 根（下标 0）持有当前最大值。将其与堆的最后一个元素（下标 `size - 1`）交换，然后将堆大小减 1。最大值现在位于数组末尾的正确排序位置上，概念上已从堆中“移除”。新的根元素很可能违反最大堆性质，因此对根调用 `heapifyDown` 恢复。重复直到堆大小收缩到 1。

Each extraction takes O(log n), and there are n extractions, so Phase 2 costs O(n log n). Phase 1 costs O(n), making the total O(n log n) — optimal for a comparison-based sort.

每次提取花费 O(log n)，总共 n 次提取，所以第二阶段 O(n log n)。第一阶段 O(n)，总复杂度 O(n log n)——对基于比较的排序来说是最优的。

**Heap sort is unstable.** A sorting algorithm is stable if equal elements retain their relative order from the input. Heap sort is not. Consider why: during the heapify phase, elements are swapped across large distances in the array as they bubble up or sink down. Two equal elements can easily have their order reversed when one sinks past the other in `heapifyDown`, or when one bubbles past the other in the initial build phase. The heap only cares about the parent-child inequality, not about preserving the original sequence among equal values. For a concrete example, consider the array `[3a, 3b]` where the labels distinguish two equal values. After building a max-heap, `3a` might become the parent and `3b` its child, or vice versa — the algorithm makes no promise. When extractions then place one of them at the end of the array before the other, their relative order may differ from the input. This instability is inherent to the tree-structured nature of the heap, not an implementation bug.

**堆排序是不稳定的。** 如果一个排序算法中相等的元素保持了它们在输入中的相对顺序，则称它是稳定的。堆排序不是。想一想为什么：在 heapify 阶段，元素在上浮或下沉时在数组中跨越了很长的距离。两个相等的元素，当一个在 `heapifyDown` 中下沉越过另一个，或在初始建堆阶段上浮越过另一个时，它们的顺序很容易被反转。堆只关心父子之间的不等关系，不关心保持相等元素之间的原始顺序。举个具体例子，考虑数组 `[3a, 3b]`，标签区分两个相等的值。建好最大堆后，`3a` 可能成为 `3b` 的父节点，反之亦然——算法不做保证。当后续提取将其中一个先于另一个放到数组末尾时，它们的相对顺序就可能与输入不同。这种不稳定性是堆的树状结构所固有的，不是实现上的 bug。

Despite its instability, heap sort has a unique advantage over merge sort and quick sort: it sorts in-place, requiring only O(1) auxiliary space, and guarantees O(n log n) worst-case time. Merge sort needs O(n) extra space. Quick sort degrades to O(n²) in the worst case. Heap sort sits at a unique Pareto-optimal point in the time-space tradeoff space.

尽管不稳定，堆排序相比归并排序和快速排序有一个独特优势：它就地排序，只需要 O(1) 辅助空间，且保证 O(n log n) 的最坏情况时间。归并排序需要 O(n) 额外空间。快速排序在最坏情况下退化到 O(n²)。堆排序位于时空权衡空间中一个独特的帕累托最优点。

### 2.2 The Top-K Problem: Finding the K Smallest Without Full Sorting / Top-K 问题：不完整排序找到最小的 K 个

Given an unordered array of N integers, find the K smallest elements. The naive approach — sort the entire array and take the first K — costs O(N log N). But when K is small relative to N, a heap can do much better.

给定 N 个整数的无序数组，找到其中最小的 K 个元素。朴素做法——对整个数组排序然后取前 K 个——花费 O(N log N)。但当 K 相对于 N 很小时，堆可以做得更好。

The key insight is to maintain a **max-heap of size K**, not a min-heap. This is a beautiful inversion of expectations. The max-heap's root holds the K-th smallest element seen so far — the "gatekeeper" threshold. The algorithm runs as follows. Push the first K elements into a max-heap. Then, for each remaining element in the array: compare it with the heap's root (the largest among the current K candidates). If the new element is smaller than the root, pop the root and push the new element. If it is larger or equal, skip it — it cannot possibly be among the K smallest. After one pass through the array, the max-heap contains exactly the K smallest elements. The time complexity is O(N log K): each heap operation costs O(log K), and we perform at most N such operations. When K is a small constant, this approaches O(N) — a dramatic improvement over O(N log N) full sorting.

关键洞察是维护一个**大小为 K 的最大堆**，而不是最小堆。这是一个漂亮的预期反转。最大堆的根持有目前见过的第 K 小的元素——充当“守门”阈值。算法运行如下：将前 K 个元素压入最大堆。然后，对数组中每个剩余元素：与堆的根（当前 K 个候选元素中最大的那个）比较。如果新元素比根小，弹出根，压入新元素。如果大于或等于，跳过——它不可能在 K 个最小元素之列。一趟遍历完整个数组后，最大堆中恰好包含最小的 K 个元素。时间复杂度 O(N log K)：每次堆操作 O(log K)，最多执行 N 次这样的操作。当 K 是一个小常数时，这接近 O(N)——相比 O(N log N) 全排序有显著改进。

### 2.3 Top-K Frequent Elements: Sorting by Frequency / 前 K 个高频元素：按频率排序

A natural extension of the Top-K problem adds a frequency dimension. Given an array of N elements (which may contain duplicates), find the K elements that appear most frequently. The problem is no longer about the raw values of the elements, but about their counts.

Top-K 问题的一个自然延伸加入了频率维度。给定一个含 N 个元素的数组（可能包含重复），找到出现频率最高的 K 个元素。问题不再关乎元素的原值，而关乎它们的计数。

The solution has two stages. First, build a frequency map — traverse the array and count how many times each distinct element appears. This can be done with a hash table in O(N) expected time. Second, use a **min-heap of size K** (note the inversion: this time it's a min-heap, because we want to maintain the top K _largest_ frequencies and evict the smallest among them). Iterate through the frequency map's entries. For each (element, count) pair: if the heap has fewer than K elements, push it. Otherwise, compare the entry's count with the root's count. If the entry's count is larger than the root's count, pop the root and push the entry. At the end, the min-heap contains the K most frequent elements (they can be extracted in any order; the heap guarantees they are the correct set, not that they are sorted internally).

解法分为两个阶段。首先，构建频率映射——遍历数组，统计每个不同元素出现的次数。这可以用哈希表在 O(N) 期望时间内完成。其次，使用一个**大小为 K 的最小堆**（注意反转：这次是最小堆，因为我们要维护频率*最大*的 K 个，淘汰其中频率最小的那个）。遍历频率映射的条目。对每个（元素, 计数）对：如果堆中元素少于 K 个，直接压入。否则，将条目的计数与根的计数比较。若条目的计数大于根的计数，弹出根，压入条目。最终，最小堆中包含频率最高的 K 个元素（它们可以任意顺序提取；堆保证它们是正确的集合，而非内部已排序）。

The time complexity is O(N + M log K), where M is the number of distinct elements. In the worst case M = N, giving O(N log K). The space complexity is O(M) for the hash table plus O(K) for the heap.

时间复杂度为 O(N + M log K)，其中 M 是不同元素的个数。最坏情况 M = N，复杂度 O(N log K)。空间复杂度 O(M) 用于哈希表，O(K) 用于堆。

Notice the design pattern that emerges across the heap applications we've seen. When you need the K _smallest_ raw values, you use a max-heap to guard the threshold (the K-th smallest so far). When you need the K _largest_ frequencies, you use a min-heap to guard the threshold (the K-th largest so far). The choice of heap type is always the _opposite_ of what you might naively guess, because the heap's root is the element most likely to be evicted — you want the worst among the current candidates at the root, so that the better ones stay inside. This "opposite-direction heap" pattern is one of the most elegant recurring motifs in heap algorithm design.

注意，在我们见过的堆应用中出现了一个设计模式。当你需要 K 个*最小*的原值时，用最大堆守门（目前第 K 小的那个）。当你需要 K 个*最大*的频率时，用最小堆守门（目前第 K 大的那个）。堆类型的选择总是与你朴素猜测*相反*，因为堆的根是最有可能被淘汰的元素——你希望当前候选元素中最差的那个待在根的位置，这样更好的才能留在堆内。这种“反向堆”模式是堆算法设计中最优雅的反复出现的主题之一。

### 2.4 How to Recognize When a Heap Is the Right Tool / 如何识别堆是合适的工具

A recurring challenge in algorithm design is pattern recognition: given a problem description, how do you know which data structure to reach for? Heaps have a set of telltale signs that, once internalized, make them almost jump out of the problem statement. This section collects the most reliable of those signs.

算法设计中一个反复出现的挑战是模式识别：给定一个问题描述，你怎么知道该选用哪种数据结构？堆有一组明显的特征信号，一旦内化，它们几乎会从问题描述中直接跳出来。本节汇总其中最可靠的几个信号。

**Signal 1: "In any order."** When the problem says the output elements may be returned in any order, stop and consider a heap. A sorted array enforces a unique linear order; a heap does not. Two heaps containing the same elements may arrange them differently internally — the only guarantee is the heap property on parent-child relationships, not on left-right ordering or overall sequence. Problems that explicitly permit arbitrary output order are often implicitly accepting the partial order that a heap provides. The Top-K problem is a perfect example: you are asked to return the K smallest elements, and the problem often specifies "in any order." This is the heap's calling card.

**信号一："任意顺序"。** 如果题目说输出的元素可以以任意顺序返回，停下来想一想堆。排序数组强制执行唯一的线性顺序；堆则不然。两个包含相同元素的堆内部排列可能不同——唯一保证的是父子之间的堆性质，左右顺序或整体序列不做保证。那些明确允许任意输出顺序的问题，往往隐含着接受堆所提供的偏序。Top-K 问题就是一个完美例子：要求返回最小的 K 个元素，题目通常会写明“以任意顺序”。这就是堆的名片。

**Signal 2: Repeated extremal queries with insertions.** The phrase "at each step, select the smallest (or largest) and then insert a new element" is the classic heap signature. The array-merging problem and Huffman coding both follow this exact pattern: extract two minima, merge them, insert the result. A naive sort-and-resort approach works but is wasteful; the heap turns O(n²) into O(n log n). Whenever the problem requires a dynamic collection where the minimum (or maximum) is repeatedly extracted and new elements are continuously added, a heap is almost certainly the right answer.

**信号二：反复取极值并插入。** “每步选择最小（或最大）的元素，然后插入一个新元素”是经典的堆签名。数组合并问题和 Huffman 编码都精确地遵循这个模式：取出两个最小值，合并它们，再插入结果。朴素排序-重排的做法可行但浪费；堆能将 O(n²) 变为 O(n log n)。每当问题需要一个动态集合，其中最小值（或最大值）被反复提取且不断有新元素加入，堆几乎肯定是正确答案。

**Signal 3: K-something with a threshold.** When the problem asks for the K smallest, K largest, or K most frequent items, and K is smaller than N by a significant margin, the "opposite-direction heap" pattern (Section 2.2) applies. You maintain a heap of size K — a max-heap to guard the K smallest, a min-heap to guard the K largest. The root serves as the gatekeeper, and the heap is never larger than K, making each operation O(log K) rather than O(log N). This signal is especially strong when the problem also allows arbitrary output order (Signal 1).

**信号三：带有阈值的 K 个某物。** 当问题要求找出 K 个最小、K 个最大或 K 个最频繁的元素，且 K 明显小于 N 时，“反向堆”模式（第 2.2 节）适用。维护一个大小为 K 的堆——最大堆守最小的 K 个，最小堆守最大的 K 个。根担任守门员，堆大小始终不超过 K，每次操作 O(log K) 而非 O(log N)。如果问题还允许任意输出顺序（信号一），这个信号就更加强烈。

**Signal 4: Dynamic medians or sliding windows.** When the problem asks for the median of a changing collection, or the median within a sliding window, two heaps — a max-heap for the lower half and a min-heap for the upper half — is the canonical approach (Section 3.5). The word "median" in a problem with dynamic updates is practically a direct invitation to use a dual-heap structure.

**信号四：动态中位数或滑动窗口。** 当问题要求不断变化的集合的中位数，或滑动窗口内的中位数时，双堆结构——一个最大堆放较小的一半，一个最小堆放较大的一半——是标准做法（第 3.5 节）。在动态更新的问题中出现“中位数”一词，几乎就是对双堆结构的直接邀请。

**Signal 5: Multi-way merging.** When you need to merge M sorted sequences into one sorted output, a min-heap of size M holding the current front element of each sequence is the textbook solution. This applies whether merging M sorted arrays, or performing external sorting where each run's current element feeds into a k-way merge. The heap finds the global minimum among the M candidates in O(log M) time per output element.

**信号五：多路归并。** 当你需要将 M 个有序序列归并成一个有序输出时，大小为 M 的最小堆，每个序列的当前队首元素存入其中，是教科书式的解法。无论是归并 M 个有序数组，还是在外排序中每个归并段的当前元素汇入 k 路归并，都适用。堆在每输出一个元素时，用 O(log M) 时间找到 M 个候选中的全局最小值。

**A note of caution.** Not every problem with the word "smallest" needs a heap. If the problem requires the output to be fully sorted, a heap alone is insufficient — you would need to call `pop` repeatedly and collect the results in order, which is, in effect, heap sort. And if the problem involves static data with no insertions or deletions after the initial construction, the O(n) selection algorithm (quickselect) for finding the K-th smallest element may be faster than a heap. The heap's true power is in _dynamic_ settings, where the collection changes over time and the minimum must remain immediately accessible.

**一点提醒。** 不是所有带“最小”一词的问题都需要堆。如果问题要求输出完全有序，仅靠堆是不够的——你需要反复 `pop` 并按顺序收集结果，那实质上就是堆排序。如果问题涉及静态数据，初始构建后没有插入或删除，那么用于找第 K 小元素的 O(n) 选择算法（quickselect）可能比堆更快。堆真正的威力在*动态*场景中，集合随时间变化而最小值必须立即可得。

These five signals are not a mechanical checklist, but a set of mental hooks. With practice, recognizing them becomes second nature — and the heap naturally emerges from the problem description as the data structure the problem itself demands.

这五个信号不是一份机械清单，而是一组心理挂钩。经过练习，识别它们会变成直觉——而堆会自然而然地从问题描述中浮现出来，成为问题本身所要求的数据结构。

## 3. Beyond the Basics: The Deeper Architecture and Algorithmic Roles of Heaps / 基础之上：堆的深层架构与算法角色

### 3.1 Heapify: Building a Heap in Linear Time / 线性时间建堆

#### 3.1.1 The "Obvious" Approach and Its Hidden Cost / “显然”的做法及其隐藏代价

Suppose you have an unsorted array of n numbers and you need to turn it into a min-heap. The most natural approach is to start with an empty heap and call `push` n times. Each `push` does an insertion at the leaf level followed by `heapifyUp`, which takes O(log n) in the worst case. The total cost is therefore O(n log n).

假设你有一个包含 n 个数的无序数组，需要将它变成一个最小堆。最自然的做法是从空堆开始，调用 `push` n 次。每次 `push` 在叶子层插入一个元素，然后执行 `heapifyUp`，最坏情况 O(log n)。总代价因此是 O(n log n)。

This is correct but suboptimal. What is surprising — and to my mind, genuinely beautiful — is that you can build a heap from an arbitrary array in O(n) time, not O(n log n). The algorithm is called **heapify**, and it exploits a simple structural fact about binary heaps.

这做法正确但不够好。令人惊讶——而且我觉得确实很优美——的是，你可以用 O(n) 的时间从一个任意数组建堆，而不是 O(n log n)。这个算法叫 **heapify**，它利用了二叉堆一个简单的结构事实。

#### 3.1.2 The Key Insight: Leaves Are Already Heaps / 关键洞察：叶子节点本身已经是堆

In a complete binary tree stored in an array, roughly half the nodes are leaves. More precisely, the nodes at indices `⌊n/2⌋` through `n-1` (using 0-indexing) are leaves. Why? Because a node at index `i` has its left child at `2i + 1`. When `2i + 1 ≥ n`, the node has no children — it is a leaf. This happens exactly when `i ≥ ⌊n/2⌋`.

在用数组存储的完全二叉树中，大约一半的节点是叶子。具体而言，下标在 `⌊n/2⌋` 到 `n-1` 范围内的节点（0 索引下）都是叶子。为什么？下标为 `i` 的节点，其左孩子在 `2i + 1`。当 `2i + 1 ≥ n` 时，该节点没有孩子——它就是叶子。这恰好发生在 `i ≥ ⌊n/2⌋` 的时候。

Now, a single node by itself trivially satisfies the heap property — there is nothing to violate it. So every leaf is already a valid heap of size 1. The problem reduces to fixing the non-leaf nodes, and we can do so from bottom to top.

而单个节点本身天然满足堆性质——没有任何东西可以违反它。因此每个叶子已经是一个合法的、大小为 1 的堆。问题化简为修复非叶子节点，而且我们可以自底向上地进行。

#### 3.1.3 The Algorithm / 算法

Starting from the last non-leaf node (index `⌊n/2⌋ - 1`) and walking backward to index 0, call `heapifyDown` on each node. That's it.

从最后一个非叶子节点（下标 `⌊n/2⌋ - 1`）开始，向前走到下标 0，对每个节点调用 `heapifyDown`。就这么简单。

```c
void buildHeap(MinHeap *heap, int arr[], int n) {
    for (int i = 0; i < n; i++)
        heap->data[i] = arr[i];
    heap->size = n;
    for (int i = n / 2 - 1; i >= 0; i--)
        heapifyDown(heap, i);
}
```

Why does this work? When `heapifyDown(i)` is called, the node at `i` may violate the heap property with respect to its children, but both its left subtree and right subtree are already valid heaps. This is the invariant: by processing nodes from right to left, from the lowest non-leaf level upward, we guarantee that when we fix a node, its children are already fixed. After `heapifyDown` sinks the node into its correct position, the entire subtree rooted at `i` becomes a valid heap. By the time we reach index 0, the whole array is a heap.

为什么这可行？当 `heapifyDown(i)` 被调用时，节点 `i` 可能相对于其孩子违反了堆性质，但它的左子树和右子树都已经是合法的堆。这就是不变量：通过从右到左、从最低非叶层向上处理节点，我们保证在修复一个节点时，它的孩子已经被修复。`heapifyDown` 将节点下沉到正确位置后，以 `i` 为根的整个子树就变成了合法堆。当处理到下标 0 时，整个数组就是一个堆。

#### 3.1.4 Why It's O(n): The Proof / 为什么是 O(n)：证明

The key observation is that `heapifyDown` does not take O(log n) for every node. Most nodes are near the bottom and sink very few levels. Let's count the total work.

关键观察在于：并非每个节点的 `heapifyDown` 都花费 O(log n)。大多数节点靠近底部，下沉的层数很少。让我们数一数总工作量。

Consider a complete binary tree of height `h = ⌊log₂ n⌋`. At level `k` (where the root is level 0, its children are level 1, etc.), there are at most `2ᵏ` nodes. A node at level `k` can sink at most `h - k` levels during `heapifyDown`. Each level of sinking involves one comparison and one possible swap — constant work. The total number of swaps across all nodes is bounded by:

考虑一棵高度为 `h = ⌊log₂ n⌋` 的完全二叉树。在第 `k` 层（根为第 0 层，其孩子为第 1 层，以此类推），最多有 `2ᵏ` 个节点。第 `k` 层的一个节点在 `heapifyDown` 中最多下沉 `h - k` 层。每一层下沉涉及一次比较和一次可能的交换——常数工作量。所有节点的总交换次数不超过：

```
Σ (from k=0 to h) 2ᵏ · (h - k)
```

This sum equals `2ʰ⁺¹ - h - 2`, which is less than `2n`. In other words, the total number of level-sinking operations across all `heapifyDown` calls is bounded by O(n). This is the beautiful part: although some individual nodes (near the root) sink O(log n) levels, there are very few such nodes. The vast majority are leaves or near-leaves and sink 0 or 1 level. The sum converges rather than diverging.

这个和等于 `2ʰ⁺¹ - h - 2`，它小于 `2n`。也就是说，所有 `heapifyDown` 调用的下沉层数总和不超过 O(n)。这是最优美的部分：虽然个别节点（靠近根的）下沉了 O(log n) 层，但这样的节点极少。绝大多数节点是叶子或接近叶子，下沉 0 层或 1 层。总和收敛而非发散。

The consequence is profound: you can build a heap from scratch in O(n) time. This means that heap sort — first heapify the array in O(n), then repeatedly extract-min n times in O(n log n) — has an overall complexity of O(n log n), with the first phase contributing only a negligible O(n). Without the O(n) heapify, heap sort would still be O(n log n) due to the insertions, but the constant factor would be significantly worse and the algorithm would lose much of its elegance.

这个结论意义深远：你可以用 O(n) 的时间从零建堆。这意味着堆排序——先 O(n) heapify，再 O(n log n) 反复 extract-min——总复杂度 O(n log n)，而第一阶段只贡献微不足道的 O(n)。没有 O(n) 的 heapify，堆排序仍是 O(n log n)（因为插入仍是 O(log n) 次），但常数因子会显著变差，算法也会失去大量优雅性。

### 3.2 Heaps as Priority Queues in Dijkstra and Prim / 堆作为优先队列在 Dijkstra 和 Prim 算法中的作用

#### 3.2.1 The Common Pattern: Repeated Minimum Extraction / 共同模式：反复取最小

If you look at Prim's algorithm and Dijkstra's algorithm side by side, a shared skeleton emerges. Both maintain a set of "visited" vertices and a set of "unvisited" ones. In each iteration, they must select the unvisited vertex with the smallest current distance (Dijkstra) or the smallest connecting edge weight (Prim). Then they update the distances or edge weights of its neighbors and repeat.

如果你把 Prim 算法和 Dijkstra 算法并排放在一起看，一个共同的骨架就浮现出来。两者都维护一个“已访问”顶点集和一个“未访问”顶点集。每次迭代，它们必须选择当前距离最小的未访问顶点（Dijkstra），或连接边权重最小的未访问顶点（Prim）。然后更新其邻居的距离或边权重，并重复。

In a naive implementation, each selection scans all V vertices to find the minimum, taking O(V) per iteration and O(V²) overall. On a dense graph where `E ≈ V²`, this is already optimal. But on a sparse graph where `E ≪ V²`, the scanning overhead becomes the bottleneck. This is precisely where a heap makes the difference.

朴素实现中，每次选择扫描所有 V 个顶点找最小，每次 O(V)，总计 O(V²)。对于 `E ≈ V²` 的稠密图，这已经是最优的。但对 `E ≪ V²` 的稀疏图，扫描开销就成了瓶颈。这正是堆发挥作用的地方。

#### 3.2.2 How the Heap Fits In / 堆是如何嵌入的

Instead of scanning all vertices each iteration, we store the unvisited vertices (or rather, their current key values) in a min-heap. The iteration then becomes:

不再每轮扫描所有顶点，而是将未访问顶点（更准确地说，它们的当前键值）存入一个最小堆。每次迭代变成：

1. `extractMin` — pop the vertex with the smallest key from the heap. This is the next vertex to be visited.  
   `extractMin`——从堆中弹出键值最小的顶点。这就是下一个要访问的顶点。

2. For each neighbor of the newly visited vertex, if its key can be improved (a shorter path found, or a cheaper connecting edge), update the key. This requires a **decrease-key** operation on the heap.  
   对刚访问顶点的每个邻居，如果它的键值可以改进（找到了更短路径，或更便宜的连接边），更新键值。这需要对堆执行 **decrease-key** 操作。

A standard binary heap supports `extractMin` in O(log V) and `decreaseKey` in O(log V) (by bubbling the updated element up). With V `extractMin` operations and up to E `decreaseKey` operations, the total becomes O((V + E) log V). When `E = Θ(V)`, this is O(V log V) — a significant improvement over O(V²).

标准二叉堆支持 O(log V) 的 `extractMin` 和 O(log V) 的 `decreaseKey`（通过将更新的元素上浮）。总共 V 次 `extractMin` 和最多 E 次 `decreaseKey`，总代价 O((V + E) log V)。当 `E = Θ(V)` 时，这就是 O(V log V)——相比 O(V²) 是显著的提升。

#### 3.2.3 Beyond Binary Heaps: The Theoretical Frontier / 超越二叉堆：理论的边界

This is where heap research touches graph algorithms at a deep level. A binary heap gives O((V + E) log V). But the `decreaseKey` operation — updating a key and restoring the heap property — is the dominant cost in dense graphs. In 1984, Fredman and Tarjan invented the **Fibonacci heap**, which achieves O(1) amortized time for `decreaseKey` (and `insert`) while keeping `extractMin` at O(log V) amortized. This brings the total complexity of Dijkstra and Prim to O(E + V log V) — optimal in the comparison model for sparse graphs.

这正是堆的研究在图算法中触及深层次的地方。二叉堆给出 O((V + E) log V)。但 `decreaseKey` 操作——更新键值并恢复堆性质——在稠密图中是主导开销。1984 年，Fredman 和 Tarjan 发明了**斐波那契堆**，实现了 O(1) 均摊的 `decreaseKey`（和 `insert`），同时保持 `extractMin` 为 O(log V) 均摊。这把 Dijkstra 和 Prim 的总复杂度压到了 O(E + V log V)——在比较模型中对稀疏图是最优的。

The Fibonacci heap is, however, notoriously complex to implement and has large constant factors. In practice, simpler structures like the **pairing heap** (self-adjusting, easy to code, excellent empirical performance) or the **4-ary heap** (each node has 4 children instead of 2, making the tree shallower and `decreaseKey` cheaper) often outperform binary heaps and sometimes even Fibonacci heaps on real data. This tension between theoretical optimality and practical efficiency is itself a fascinating chapter in data structure design.

然而，斐波那契堆因实现极为复杂和常数因子大而闻名。实践中，更简单的结构如**配对堆**（自调整、容易编码、实际表现极佳）或 **4-叉堆**（每节点有 4 个孩子而不是 2 个，树更浅，`decreaseKey` 更便宜）常常在实际数据上超过二叉堆，有时甚至超过斐波那契堆。这种理论最优与实际效率之间的张力，本身就是数据结构设计中引人入胜的一章。

#### 3.2.4 What This Teaches Us About Heaps / 这教会我们关于堆的什么

The takeaway is not just that heaps speed up Dijkstra and Prim. It's that the _choice of heap_ matters, and different heaps optimize different operations. A binary heap is simple and balanced — all core operations are O(log n). A Fibonacci heap bets everything on making `decreaseKey` blazing fast, at the cost of complexity elsewhere. Understanding these tradeoffs is what separates memorizing algorithms from thinking about data structures as design choices.

收获不仅在于堆能加速 Dijkstra 和 Prim。更在于*堆的选择*是重要的，不同的堆优化不同的操作。二叉堆简单均衡——所有核心操作都是 O(log n)。斐波那契堆把一切押注在让 `decreaseKey` 极快上，代价是其他方面的复杂性。理解这些权衡，正是区分“背诵算法”和“把数据结构当作设计选择来思考”的分界线。

### 3.3 Mergeable Heaps: Leftist, Binomial, and Fibonacci Heaps / 可合并堆：左偏堆、二项堆与斐波那契堆

#### 3.3.1 The Problem with Binary Heaps and Merging / 二叉堆的合并困境

A standard binary heap, for all its efficiency in insertion and extraction, has a glaring blind spot: merging two heaps into one. The array representation that gives the binary heap its speed and compactness is also what makes merging hard. Two arrays representing two heaps cannot simply be concatenated — the resulting array would not satisfy the heap property. The only general solution is to take all elements from the smaller heap and `push` them one by one into the larger, which costs O(m log n) where m is the size of the smaller heap. In the worst case, merging two heaps of roughly equal size becomes O(n log n) — no better than rebuilding from scratch.

标准的二叉堆，在插入和提取上效率卓著，却有一个明显的盲点：将两个堆合并成一个。数组表示赋予二叉堆速度和紧凑性，但也是合并困难的原因。两个代表两个堆的数组不能简单拼接——拼接后的数组无法满足堆性质。唯一通用的方案是将较小堆的所有元素逐个 `push` 进较大堆，代价 O(m log n)，其中 m 是较小堆的大小。最坏情况下，合并两个规模相当的堆达到 O(n log n)——并不比重建更好。

This is not merely an academic concern. Consider a graph algorithm that maintains a heap for each vertex, merging them as components grow — a pattern that appears in some minimum spanning tree and shortest path optimizations. With binary heaps, such algorithms would be prohibitively expensive. This is the motivation for **mergeable heaps**: heap data structures explicitly designed so that the union of two heaps can be formed efficiently, typically in O(log n) or better.

这并非仅是学术上的忧虑。设想一个图算法为每个顶点维护一个堆，随着分量的增长而合并它们——这种模式出现在某些最小生成树和最短路径的优化中。用二叉堆的话，这类算法将因为代价过高而不可行。这正是**可合并堆**的动机：明确设计出来使两个堆的并集可以高效形成，通常 O(log n) 或更优。

### 3.3.2 Leftist Heaps: Merging by the Right Path / 左偏堆：沿右路径合并

The leftist heap is the simplest mergeable heap to understand and implement. It abandons the array representation and returns to linked nodes, but adds a single integer field to each node: the **null path length** (npl). The npl of a node is the length of the shortest path from that node to a node that has at least one null child (a missing left or right child). By convention, the npl of a null node is -1. A leaf node, whose left and right children are both null, has npl = 0.

左偏堆是最容易理解的可合并堆。它放弃数组表示，回到链式节点，但每个节点增加了一个整数字段：**零距离**（null path length, npl）。一个节点的 npl 是从该节点到一个至少有一个空孩子（缺少左或右孩子）的节点的最短路径长度。按惯例，空节点的 npl 为 -1。叶节点左右孩子均为空，其 npl = 0。

The defining constraint of a leftist heap is the **leftist property**: for every node, the npl of its left child is greater than or equal to the npl of its right child. In other words, the right path — the sequence of nodes reached by always following the right child — is always a shortest path to a null child. This property guarantees that the length of the right path is O(log n). Every operation that descends exclusively along right paths (which is exactly what merge does) will therefore run in logarithmic time.

左偏堆的定义性约束是**左偏性质**：对于每个节点，其左孩子的 npl 大于或等于右孩子的 npl。换句话说，右路径——始终沿着右孩子走所到达的节点序列——永远是到达空孩子的最短路径。这一性质保证了右路径长度为 O(log n)。所有仅沿右路径下行的操作（合并正是如此）因此都在对数时间内运行。

A leftist heap node, in C-like pseudocode, looks like this:

左偏堆的节点，用 C 风格伪代码表示，大致如下：

```
struct LeftistNode {
    int key;
    int npl;
    LeftistNode *left;
    LeftistNode *right;
};
```

The following is an example of a valid leftist min-heap. The number above each node is its key; the number in parentheses is its npl. Notice how every node obeys the leftist property: the left npl is never smaller than the right npl.

下面是一个合法的左偏最小堆示例。每个节点上方的数字是键值，括号内是 npl。注意每个节点都遵守左偏性质：左 npl 从不小于右 npl。

```
        3(2)
       /    \
    8(1)    6(1)
    /  \    /  \
 10(0)  X 12(0)  X
```

Here, `X` denotes a null child (npl = -1). For the root `3`: left child `8` has npl 1, right child `6` has npl 1 — equality satisfies "≥". For node `8`: left child `10` has npl 0, right child is null (npl -1) — 0 ≥ -1 holds. Node `6`: left child `12` has npl 0, right null — same logic. All leaves have npl 0.

这里 `X` 表示空孩子（npl = -1）。对根 `3`：左孩子 `8` npl = 1，右孩子 `6` npl = 1——等号满足“≥”。对节点 `8`：左孩子 `10` npl = 0，右孩子空（npl = -1）——0 ≥ -1 成立。节点 `6`：左孩子 `12` npl = 0，右空——同理。所有叶子 npl = 0。

**The merge operation.** Merging two leftist heaps `h1` and `h2` proceeds recursively, always descending along the right spines of both heaps.

**合并操作。** 合并两个左偏堆 `h1` 和 `h2` 递归进行，总是沿两个堆的右脊柱下行。

```
LeftistNode* merge(LeftistNode* h1, LeftistNode* h2) {
    if (h1 == NULL) return h2;
    if (h2 == NULL) return h1;

    // Ensure h1 has the smaller root (for min-heap)
    if (h1->key > h2->key) swap(h1, h2);

    // Recursively merge h1's right child with h2
    h1->right = merge(h1->right, h2);

    // After merge, the leftist property may be violated.
    // If the left child's npl is smaller than the right's, swap children.
    int left_npl  = (h1->left  != NULL) ? h1->left->npl  : -1;
    int right_npl = (h1->right != NULL) ? h1->right->npl : -1;
    if (left_npl < right_npl) {
        swap(h1->left, h1->right);
    }

    // Update npl: right child's npl + 1 (since right path is shortest)
    h1->npl = ((h1->right != NULL) ? h1->right->npl : -1) + 1;

    return h1;
}
```

**Walkthrough.** Let's merge two leftist heaps: `H1` has root 3 (with children 8 and 6), and `H2` is a single node 4.

**走一遍例子。** 合并两个左偏堆：`H1` 根为 3（孩子 8 和 6），`H2` 是一个单节点 4。

```
Step 1: h1 = 3(2), h2 = 4(0). 3 < 4, so h1 stays root.
        Recursively merge h1->right (= 6(1)) with h2 (= 4(0)).

Step 2: h1 = 6(1), h2 = 4(0). 6 > 4, swap: h1 = 4(0), h2 = 6(1).
        Recursively merge h1->right (= NULL) with h2 (= 6(1)).

Step 3: h1 = NULL, h2 = 6(1). Return h2 = 6(1).

Back to Step 2: h1->right = 6(1).
        Now check leftist property for node 4:
          left npl  = -1 (NULL)
          right npl =  1 (node 6)
          -1 < 1  → violation! Swap children.
        After swap: 4's left = 6(1), right = NULL.
        Update npl: right npl = -1 → npl = 0.
        Return node 4(0).

Back to Step 1: h1->right = 4(0).
        Check leftist property for node 3:
          left npl  = 1 (node 8)
          right npl = 0 (node 4)
          1 ≥ 0 → OK. No swap.
        Update npl: right npl = 0 → npl = 1.
        Return node 3(1).
```

The resulting heap after merging 3 and 4 looks like this:

合并 3 和 4 之后的结果堆长这样：

```
        3(1)
       /    \
    8(1)    4(0)
    /  \       \
 10(0)  X     6(0)
```

The right spine of the root is now just `3 → 4 → 6`, and the leftist property is restored everywhere. The merge followed the right spines and performed only a constant number of operations per recursive call. Since each recursive step descends one level along the right spine of one of the heaps, and the right spine length is bounded by O(log n), the entire merge costs O(log n).

根的右脊柱现在仅是 `3 → 4 → 6`，左偏性质处处恢复。合并沿右脊柱进行，每次递归调用仅执行常数操作。因为每递归一步沿其中一个堆的右脊柱下降一层，且右脊柱长度以 O(log n) 为界，整个合并的代价为 O(log n)。

**Insert** is simply merging the existing heap with a new single-node heap. **Extract-min** removes the root and returns the result of merging its left and right children. Both are therefore O(log n) operations, expressed entirely in terms of merge.

**插入**就是将现有堆与一个新的单节点堆合并。**弹出最小**是移除根并返回其左右孩子合并的结果。两者因此都是 O(log n) 操作，完全通过 merge 来表达。

The leftist heap's elegance lies in its simplicity: one operation, merge, defines the entire data structure. The leftist property is a lightweight local invariant that channels all work to the shortest path, and the recursive merge algorithm is compact enough to be memorized and written on a whiteboard. For any application that needs efficient heap union — such as merging priority queues in parallel graph algorithms — the leftist heap is a natural and implementable choice.

左偏堆的优雅在于其简洁：一个操作，merge，定义了整个数据结构。左偏性质是一个轻量的局部不变量，将所有工作引导到最短路径上，而递归合并算法紧凑到可以在白板上默写。对任何需要高效堆合并的应用——比如并行图算法中合并优先队列——左偏堆都是自然且可实现的选择。

A concrete scenario where this shines is Borůvka's algorithm for minimum spanning trees (see the MST notes in this series). Recall that Borůvka works in rounds: each connected component independently selects the cheapest edge crossing to another component, then all selected edges are added simultaneously, merging components. A direct implementation scans all edges each round to find each component's minimum outgoing edge, costing O(E) per round and O(E log V) overall. But we can do better. Maintain a leftist heap for each component, initially containing all incident edges of that component's vertices. When a component needs its cheapest outgoing edge, it repeatedly extracts the minimum from its heap, discarding any edge whose endpoints now belong to the same component (detected via a disjoint-set union structure). When two components merge, their leftist heaps are merged in O(log V) time, and the resulting heap becomes the edge pool for the new component. The disjoint-set union tracks component membership, while the leftist heap handles edge selection and union. This combination — DSU for vertices, leftist heaps for edges — reduces the per-round edge-scanning overhead and is a classic illustration of how a mergeable heap slots into a graph algorithm to improve its theoretical and practical performance.

一个具体的闪耀场景是最小生成树的 Borůvka 算法（参见本系列的 MST 笔记）。Borůvka 按轮工作：每个连通分量独立选择连接到另一分量的最便宜边，然后所有选中的边被同时加入，合并分量。直接实现每轮扫描所有边来为每个分量找到最小出边，每轮 O(E)，总 O(E log V)。但我们可以做得更好。为每个分量维护一个左偏堆，初始包含该分量所有顶点的关联边。当分量需要其最便宜出边时，它反复从堆中弹出最小值，丢弃端点现在属于同一分量的边（通过并查集检测）。当两个分量合并时，它们的左偏堆在 O(log V) 时间内合并，合并后的堆成为新分量的边池。并查集追踪分量成员关系，左偏堆处理边的选择和合并。这种组合——并查集管顶点，左偏堆管边——减少了每轮扫描边的开销，是可合并堆如何嵌入图算法以提升其理论与实践性能的经典示例。

To close this section with a concrete empirical demonstration, I ran a simple experiment comparing the merge performance of a standard array-based binary heap against a leftist heap. The setup: generate two heaps, each containing 200 million random integers, then merge them. For the binary heap, merging means concatenating two arrays and calling `heapifyDown` to rebuild — an O(n) operation. For the leftist heap, merging uses the recursive `leftist_merge` function — an O(log n) operation. The experiment was conducted on a laptop with approximately 20 GB of available memory, using the maximum data size that could fit without paging. The results, averaged over three runs:

为这一节做一个具体的实证演示，我运行了一个简单的实验，对比标准数组二叉堆和左偏堆的合并性能。设置如下：生成两个堆，每个包含 2 亿个随机整数，然后合并它们。对二叉堆而言，合并意味着拼接两个数组并调用 `heapifyDown` 重建——一个 O(n) 操作。对左偏堆而言，合并使用递归的 `leftist_merge` 函数——一个 O(log n) 操作。实验在约 20 GB 可用内存的笔记本上进行，使用不触发页面交换的最大数据量。三次运行取平均的结果：

| Heap Type / 堆类型                   | Data Size / 数据量 | Merge Time / 合并耗时   |
| ------------------------------------ | ------------------ | ----------------------- |
| Array-based binary heap / 数组二叉堆 | 2 × 200,000,000    | ~3.13 seconds / 秒      |
| Leftist heap / 左偏堆                | 2 × 200,000,000    | < 0.000001 seconds / 秒 |

The binary heap, despite using the cache-friendly array representation that gives it excellent constant factors for push and pop, required over three seconds to merge two large heaps — time entirely spent in the O(n) rebuild. The leftist heap, despite the pointer-chasing overhead of its linked-node representation, completed the merge in a time too small to measure at double-precision clock resolution. The logarithmic right-path descent is so fast that it vanished into the noise floor of the timing infrastructure.

二叉堆尽管使用了缓存友好的数组表示，为 push 和 pop 提供了优秀的常数因子，但合并两个大型堆仍需超过三秒——时间完全花在了 O(n) 重建上。左偏堆尽管有链式节点表示的指针追踪开销，却在双精度时钟分辨率无法测出的时间内完成了合并。对数级别的右路径下降如此之快，以至于它消失在了计时基础设施的噪声基底中。

This experiment underscores the central tradeoff of mergeable heaps. An array-based binary heap is the right choice when insertion and extraction dominate the workload and merging is rare or unnecessary — it is compact, cache-friendly, and has low constant factors. A leftist heap is the right choice when merging is a core operation — as in Borůvka's algorithm, parallel graph processing, or any scenario where priority queues must be repeatedly combined. The data structure that wins is not the one with the best single-operation speed, but the one whose asymptotic complexity matches the workload's actual bottleneck.

这个实验凸显了可合并堆的核心权衡。当插入和提取主导工作负载且合并罕见或不必需时，数组二叉堆是正确的选择——它紧凑、缓存友好且常数因子低。当合并是核心操作时——比如 Borůvka 算法、并行图处理，或任何需要反复合并优先队列的场景——左偏堆是正确的选择。胜出的数据结构不是单项操作速度最优的，而是渐近复杂度与工作负载的实际瓶颈相匹配的那个。

<details>
<summary>Click to expand: full experiment source code / 点击展开：完整实验源代码</summary>

```c
/*
 * Generate n random positive integers, build a min-heap and a leftist min-heap.
 * Merge them separately. Count the time.
 * The size n is read from standard input at runtime.
 */

 #include <stdio.h>
 #include <stdlib.h>
 #include <time.h>
 #include <limits.h>

 #define UPPERBOUND INT_MAX

 void FatalError() {
     printf("Memory allocation failed!\n");
     exit(0);
 }

 /* ---------- Ordinary Min-Heap (array-based) ---------- */
 typedef struct {
     int size;
     int *data;
 } minheap;

 /* ---------- Leftist Heap (linked nodes) ---------- */
 typedef struct leftist_node {
     int data;
     int npl;
     struct leftist_node *left;
     struct leftist_node *right;
 } leftist_node;

 typedef leftist_node* leftist_heap;

 /* ---------- Min-Heap operations ---------- */
 minheap *create_minheap(int capacity) {
     minheap *heap = (minheap *)malloc(sizeof(minheap));
     if (heap == NULL) FatalError();
     heap->size = 0;
     heap->data = (int *)malloc(capacity * sizeof(int));
     if (heap->data == NULL) FatalError();
     return heap;
 }

 void minheap_percolate_down(minheap *heap, int hole) {
     int child;
     int tmp = heap->data[hole];
     for (; hole * 2 + 1 < heap->size; hole = child) {
         child = hole * 2 + 1;
         if (child + 1 < heap->size && heap->data[child + 1] < heap->data[child])
             child++;
         if (heap->data[child] < tmp)
             heap->data[hole] = heap->data[child];
         else
             break;
     }
     heap->data[hole] = tmp;
 }

 minheap *build_heap(int size) {
     minheap *heap = create_minheap(size);
     heap->size = size;
     for (int i = 0; i < size; i++)
         heap->data[i] = rand() % UPPERBOUND + 1;
     for (int i = (size - 2) / 2; i >= 0; i--)
         minheap_percolate_down(heap, i);
     return heap;
 }

 minheap *merge_minheap(minheap *heap1, minheap *heap2) {
     int total = heap1->size + heap2->size;
     minheap *new_heap = create_minheap(total);
     new_heap->size = total;
     for (int i = 0; i < heap1->size; i++)
         new_heap->data[i] = heap1->data[i];
     for (int j = 0; j < heap2->size; j++)
         new_heap->data[heap1->size + j] = heap2->data[j];
     for (int k = (total - 2) / 2; k >= 0; k--)
         minheap_percolate_down(new_heap, k);
     return new_heap;
 }

 void minheap_free(minheap *heap) {
     free(heap->data);
     free(heap);
 }

 /* ---------- Leftist Heap operations ---------- */
 static void leftist_swap_children(leftist_heap h) {
     leftist_node *tmp = h->left;
     h->left = h->right;
     h->right = tmp;
 }

 leftist_heap leftist_merge(leftist_heap h1, leftist_heap h2) {
     if (h1 == NULL) return h2;
     if (h2 == NULL) return h1;
     if (h1->data > h2->data) {
         leftist_heap tmp = h1;
         h1 = h2;
         h2 = tmp;
     }
     h1->right = leftist_merge(h1->right, h2);
     if (h1->left == NULL || h1->left->npl < h1->right->npl)
         leftist_swap_children(h1);
     h1->npl = (h1->right == NULL) ? 0 : h1->right->npl + 1;
     return h1;
 }

 leftist_heap leftist_insert(leftist_heap h, int x) {
     leftist_node *node = (leftist_node *)malloc(sizeof(leftist_node));
     if (node == NULL) FatalError();
     node->data = x;
     node->npl = 0;
     node->left = node->right = NULL;
     return leftist_merge(h, node);
 }

 leftist_heap build_leftist_heap(int *arr, int size) {
     leftist_heap h = NULL;
     for (int i = 0; i < size; i++)
         h = leftist_insert(h, arr[i]);
     return h;
 }

 void leftist_free(leftist_heap h) {
     if (h == NULL) return;
     leftist_free(h->left);
     leftist_free(h->right);
     free(h);
 }

 /* ---------- Main program ---------- */
 int main() {
     int n;
     printf("Enter the size n (1 - %d): ", INT_MAX);
     if (scanf("%d", &n) != 1 || n <= 0) {
         printf("Invalid input.\n");
         return 1;
     }

     srand((unsigned int)time(NULL));

     printf("Building two min-heaps of size %d...\n", n);
     minheap *mh1 = build_heap(n);
     minheap *mh2 = build_heap(n);

     printf("Building two leftist heaps of size %d...\n", n);
     leftist_heap lh1 = build_leftist_heap(mh1->data, mh1->size);
     leftist_heap lh2 = build_leftist_heap(mh2->data, mh2->size);

     clock_t start = clock();
     minheap *mh_merged = merge_minheap(mh1, mh2);
     clock_t end = clock();
     double minheap_time = (double)(end - start) / CLOCKS_PER_SEC;
     printf("Min-heap merge time: %f seconds\n", minheap_time);

     start = clock();
     leftist_heap lh_merged = leftist_merge(lh1, lh2);
     end = clock();
     double leftist_time = (double)(end - start) / CLOCKS_PER_SEC;
     printf("Leftist heap merge time: %f seconds\n", leftist_time);

     minheap_free(mh1);
     minheap_free(mh2);
     minheap_free(mh_merged);
     leftist_free(lh_merged);

     return 0;
 }
```

</details>

#### 3.3.3 Binomial Heaps: A Forest of Power-of-Two Trees / 二项堆：二的幂次树的森林

A binomial heap takes a fundamentally different approach from the leftist heap. Instead of a single tree with a clever local invariant, it maintains a **forest** of **binomial trees**, each individually obeying the heap property, and organizes them by a structural rule that mimics binary addition. The result is a data structure where merging two heaps feels less like surgery and more like arithmetic.

二项堆采用了一种与左偏堆根本不同的方法。它不维护一棵带有巧妙局部不变量的树，而是维护一个**二项树**的**森林**，每棵树各自遵守堆性质，并通过一条模仿二进制加法的结构规则来组织它们。结果是，合并两个堆不再像外科手术，而更像算术运算。

**Binomial trees.** A binomial tree of order \(k\), denoted \(B_k\), is defined recursively:

- \(B_0\) is a single node.
- \(B*k\) is formed by taking two \(B*{k-1}\) trees and making the root of one the leftmost child of the root of the other.

**二项树。** 一棵 \(k\) 阶二项树，记为 \(B_k\)，递归定义如下：

- \(B_0\) 是单个节点。
- \(B*k\) 由两棵 \(B*{k-1}\) 树将其中一棵的根作为另一棵根的最左孩子而形成。

Below is the ASCII structure diagram of the binary tree from \(B_0\) to \(B_4\):  
以下是二项树 \(B_0\) 到 \(B_4\) 的 ASCII 结构图：

```
B0:  0

B1:  1
     |-- 0

B2:  2
     |-- 1
     |   |-- 0
     |-- 0

B3:  3
     |-- 2
     |   |-- 1
     |   |   |-- 0
     |   |-- 0
     |-- 1
     |   |-- 0
     |-- 0

B4:  4
     |-- 3
     |   |-- 2
     |   |   |-- 1
     |   |   |   |-- 0
     |   |   |-- 0
     |   |-- 1
     |   |   |-- 0
     |   |-- 0
     |-- 2
     |   |-- 1
     |   |   |-- 0
     |   |-- 0
     |-- 1
     |   |-- 0
     |-- 0
```

The recursive structure can be clearly seen from the figure: the root of \(B*k\) has \(k\) children, which are \(B*{k-1}, B*{k-2}, \ldots, B_0\) from left to right. This is exactly the natural result when two \(B*{k-1}\) are merged (with one becoming the leftmost child of the other).

从图中可以清晰看到递归构造：\(B*k\) 的根有 \(k\) 个孩子，从左到右依次是 \(B*{k-1}, B*{k-2}, \dots, B_0\)，这正是将两棵 \(B*{k-1}\) 合并时（其中一棵成为另一棵的最左孩子）自然产生的结果。

From this definition, a \(B_k\) tree has exactly \(2^k\) nodes, its root has degree \(k\), and the children of the root are themselves binomial trees of orders \(k-1, k-2, \dots, 0\) (from left to right). The number of nodes at depth \(d\) in \(B_k\) is the binomial coefficient \(\binom{k}{d}\), which gives the structure its name.

根据这一定义，\(B_k\) 树恰好有 \(2^k\) 个节点，根的度为 \(k\)，根的孩子从左到右依次是 \(k-1, k-2, \dots, 0\) 阶的二项树。\(B_k\) 中深度为 \(d\) 的节点数恰好是二项式系数 \(\binom{k}{d}\)，该结构因此得名。

**Structure of a binomial heap.** A binomial heap of \(n\) nodes consists of a collection of binomial trees, at most one of each order, whose sizes sum to \(n\). Which orders are present is determined exactly by the binary representation of \(n\): if the \(i\)-th bit of \(n\) (counting from 0) is 1, a \(B_i\) tree is in the heap. For example, a heap with \(n = 13 = 1101_2\) contains a \(B_3\) (8 nodes), a \(B_2\) (4 nodes), and a \(B_0\) (1 node). The trees are linked together in a **root list**, typically sorted by increasing order. The heap object itself stores only a pointer to the head of this root list.

**二项堆的结构。** 一个有 \(n\) 个节点的二项堆由一系列二项树组成，每个阶数至多有一棵，其大小之和等于 \(n\)。哪些阶数出现完全由 \(n\) 的二进制表示决定。这些树通过一个按阶数递增排序的**根链表**连接。堆对象本身只存储一个指向根链表头的指针。

**The merge operation — Phase 1: Merging the root lists.** Merging two binomial heaps \(H_1\) and \(H_2\) proceeds in two clean phases. The first phase is purely structural: merge the two sorted root lists into a single linked list sorted by increasing order. This is exactly the same algorithm as merging two sorted linked lists — compare the heads of the two lists, take the one with the smaller order, and advance. After this phase, the resulting list may contain multiple trees of the same order (up to two per order, since each original list had at most one). The heap property is not yet restored everywhere — that is the job of Phase 2.

**合并操作——阶段一：合并根链表。** 合并两个二项堆分两个清晰的阶段。第一阶段纯粹是结构性的：将两个有序根链表合并成一个按阶数递增的单链表。这与归并两个有序链表完全相同的算法——比较两个链表头，取阶数较小的，前进。此阶段之后，结果链表可能包含多棵同阶树（最多每阶两棵，因为每个原始链表最多一棵）。堆性质尚未处处恢复——那是第二阶段的任务。

```c
BinomialNode *merge_root_lists(BinomialNode *h1, BinomialNode *h2) {
    if (h1 == NULL) return h2;
    if (h2 == NULL) return h1;

    BinomialNode *head = NULL;
    BinomialNode *tail = NULL;

    // Pick the first node as the head
    if (h1->order <= h2->order) {
        head = tail = h1;
        h1 = h1->sibling;
    } else {
        head = tail = h2;
        h2 = h2->sibling;
    }

    // Merge remaining nodes like merging two sorted lists
    while (h1 != NULL && h2 != NULL) {
        if (h1->order <= h2->order) {
            tail->sibling = h1;
            h1 = h1->sibling;
        } else {
            tail->sibling = h2;
            h2 = h2->sibling;
        }
        tail = tail->sibling;
    }

    // Attach the remaining tail
    if (h1 != NULL) tail->sibling = h1;
    else            tail->sibling = h2;

    return head;
}
```

**Phase 2: Linking trees of equal order — the carry propagation.** After Phase 1, we walk through the merged root list with three pointers — `prev`, `x`, and `next` — where `x` and `next` are two consecutive trees under inspection. If `x->order != next->order`, there is no conflict; we simply advance all three pointers. If `x->order == next->order`, we have a collision. We link the two trees: the root with the larger key becomes a child of the root with the smaller key, producing a tree of one order higher. This linked tree is conceptually a "carry" — and it must now be compared against the _next_ tree in the list, because it might collide with that tree as well. A third tree of the same order may even be waiting (the original carry from a previous link plus two trees from the list). The case analysis handles this cleanly.

**阶段二：链接同阶树——进位传播。** 第一阶段之后，我们用三个指针 `prev`、`x`、`next` 遍历合并后的根链表，其中 `x` 和 `next` 是正在检查的两棵相邻树。如果 `x->order != next->order`，没有冲突，三个指针直接前进。如果 `x->order == next->order`，发生碰撞。我们链接这两棵树：键较大的根成为键较小根的孩子，产生一棵高一阶的树。这棵链接后的树概念上是一个“进位”——它现在必须与链表中的*下一棵*树比较，因为它可能与那棵树再次碰撞。同一阶甚至可能有三棵树等着（之前链接留下的进位加上链表中的两棵）。情况分析能干净地处理这些。

```c
BinomialNode *link_trees(BinomialNode *y, BinomialNode *z) {
    // Make y a child of z. Precondition: z->key <= y->key.
    y->sibling = z->child;
    z->child = y;
    z->order++;
    return z;
}

BinomialNode *binomial_heap_union(BinomialNode *h1, BinomialNode *h2) {
    // Phase 1: merge the two root lists into one sorted list
    BinomialNode *h = merge_root_lists(h1, h2);
    if (h == NULL) return NULL;

    // Phase 2: link trees of equal order (carry propagation)
    BinomialNode *prev = NULL;
    BinomialNode *x    = h;
    BinomialNode *next = x->sibling;

    while (next != NULL) {
        // Case 1: orders differ, or there are three trees of the same order.
        // If x->order != next->order, just advance.
        // If three consecutive trees share the same order, skip the first
        // and link the second and third — the first becomes the result tree
        // of that order.
        if (x->order != next->order ||
            (next->sibling != NULL && next->sibling->order == x->order)) {
            // No linking needed between x and next. Just advance.
            prev = x;
            x = next;
        } else {
            // Case 2: x->order == next->order, and next->sibling is of
            // a different order (or doesn't exist). Link x and next.
            if (x->key <= next->key) {
                x->sibling = next->sibling;
                x = link_trees(next, x);   // next becomes child of x
            } else {
                if (prev == NULL) h = next;
                else             prev->sibling = next;
                x = link_trees(x, next);   // x becomes child of next
            }
        }
        next = x->sibling;
    }

    return h;
}
```

**Walkthrough of the case analysis.** The key insight is that after Phase 1, at most two trees can share a given order (one originally from \(H*1\), one from \(H_2\)). However, after linking two trees of order \(k\), the resulting tree has order \(k+1\), which may collide with an existing \(B*{k+1}\) in the list. This can cascade, just as binary addition can cascade carries across multiple bit positions.

**情况分析走一遍。** 关键洞察是第一阶段之后，同一个阶至多有两棵树（一棵来自 \(H*1\)，一棵来自 \(H_2\)）。然而，链接两棵 \(k\) 阶树之后，得到的树阶为 \(k+1\)，它可能与链表中已有的 \(B*{k+1}\) 碰撞。这可以级联传播，正如二进制加法中进位可以跨多个位传播。

The condition in the `if` statement covers both scenarios that avoid linking:

`if` 语句中的条件覆盖了避免链接的两种情况：

- **`x->order != next->order`:** No collision at this order. All three pointers advance.
  **`x->order != next->order`：** 该阶无碰撞。三个指针直接前进。

- **`next->sibling != NULL && next->sibling->order == x->order`:** There are _three_ consecutive trees of the same order — `x`, `next`, and `next->sibling`. In this case, we skip linking `x` and `next` for now; `x` will become the result tree of this order, and `next` will be linked with `next->sibling` in the next iteration. This is exactly the "3 trees → keep 1, link the other 2 as carry" rule from the binary addition analogy.
  **`next->sibling != NULL && next->sibling->order == x->order`：** 存在*三棵*同阶的连续树——`x`、`next` 和 `next->sibling`。此时我们不链接 `x` 和 `next`；`x` 将成为该阶的结果树，`next` 将在下一轮迭代中与 `next->sibling` 链接。这恰好对应二进制加法类比中的“3 棵树 → 留 1 棵，链接另 2 棵作为进位”的规则。

When the condition is false, `x` and `next` share the same order and there is no third tree of that order — exactly the "2 trees → link as carry" case. We link them, and the resulting tree (with order increased by 1) becomes the new `x`, ready to be compared against the next tree in the list.

当条件为假时，`x` 和 `next` 同阶且没有第三棵同阶树——恰好是“2 棵树 → 链接作为进位”的情况。我们链接它们，得到的树（阶数加 1）成为新的 `x`，准备与链表中的下一棵树比较。

This loop processes the entire root list in a single pass. The number of trees is bounded by \(O(\log n)\), and each iteration either advances the pointers or links two trees (reducing the total number of trees by one). The total time is \(O(\log n)\).

这个循环一趟处理完整条根链表。树的数量以 \(O(\log n)\) 为界，每次迭代要么前进指针，要么链接两棵树（总数减一）。总时间 \(O(\log n)\)。

**Other operations in terms of union.** With `binomial_heap_union` as the foundation, the remaining operations become trivial. **Insertion** creates a single-node \(B_0\) heap and unions it with the existing heap — \(O(\log n)\) worst-case, though amortized \(O(1)\) because most insertions only affect low orders. **Extract-min** scans the root list to find the minimum key (\(O(\log n)\) roots), removes that node, and then unions its children (which are binomial trees of orders \(k-1, k-2, \dots, 0\)) back into the heap. The children, when reversed, form a valid binomial heap root list. Both operations are \(O(\log n)\).

**以 union 为基础的其他操作。** 有了 `binomial_heap_union` 作为基础，剩余操作变得平凡。**插入**创建一个单节点 \(B_0\) 堆并与现有堆 union——最坏 \(O(\log n)\)，但均摊 \(O(1)\)，因为大多数插入只影响低阶。**弹出最小**扫描根链表找到最小键（\(O(\log n)\) 个根），移除该节点，然后将其孩子（它们是阶为 \(k-1, k-2, \dots, 0\) 的二项树）反向排列后 union 回堆中。两个操作都是 \(O(\log n)\)。

**Why binomial heaps matter.** The binomial heap's merge is, by itself, not faster than the leftist heap's — both run in \(O(\log n)\). But the binomial heap does something the leftist heap cannot easily do: it supports **decrease-key** in \(O(\log n)\) time. Because each binomial tree has a rigid structure — a root with exactly \(k\) children of predictable orders, and an explicit parent pointer in each node — a node whose key is decreased can simply bubble up along the parent chain to restore the heap property, just as in a standard binary heap. A leftist heap, by contrast, stores no parent pointer and its structure is more fluid, making an efficient decrease-key hard to achieve. This means the binomial heap is a better all-rounder: merge, insert, extract-min, decrease-key, and delete all run in \(O(\log n)\) worst-case time. None of the other heaps we have seen (binary, leftist) can claim this full set of logarithmic guarantees. More importantly, the binomial heap is the direct conceptual ancestor of the **Fibonacci heap**. The Fibonacci heap takes the binomial heap's forest-of-trees idea and relaxes the rule that there can be at most one tree per order. By allowing multiple trees of the same order and deferring cleanup work, it achieves amortized \(O(1)\) for insert and decrease-key, while keeping extract-min at \(O(\log n)\) amortized. This combination is what enables the \(O(E + V \log V)\) bounds for Dijkstra and Prim. Understanding the binomial heap — its tree shapes, its carry-based merge, and its decrease-key mechanism — is therefore the necessary stepping stone to understanding the theoretical frontier of priority queues.

**二项堆为什么重要。** 单看合并操作，二项堆并不比左偏堆更快——两者都是 \(O(\log n)\)。但二项堆能做一件左偏堆很难做到的事：在 \(O(\log n)\) 时间内支持 **decrease-key**。因为每棵二项树有刚性的结构——根恰好有 \(k\) 个可预测阶数的孩子，每个节点有显式的父指针——键值被降低的节点可以像在标准二叉堆中一样，沿着父链向上冒泡恢复堆性质。而左偏堆不存储父指针，结构也更流动，难以实现高效的 decrease-key。这意味着二项堆是一个更好的全能选手：合并、插入、提取最小、降低键值、删除，五个操作全部是 \(O(\log n)\) 最坏情况时间。我们之前见过的其他堆（二叉堆、左偏堆）都无法声称拥有这套完整的对数级保证。更重要的是，二项堆是**斐波那契堆**的直接概念祖先。斐波那契堆拿走了二项堆的森林思想，然后放宽了“每阶至多一棵树”的规则。通过允许多棵同阶树存在并推迟清理工作，它实现了插入和 decrease-key 的均摊 \(O(1)\)，同时保持提取最小的均摊 \(O(\log n)\)。正是这个组合使 Dijkstra 和 Prim 的 \(O(E + V \log V)\) 界限成为可能。因此，理解二项堆——它的树形状、基于进位的合并、以及它的 decrease-key 机制——是通往理解优先队列理论前沿的必要台阶。

#### 3.3.4 Fibonacci Heaps: The Name, the Philosophy, and the "Do Nothing" Strategy / 斐波那契堆：名字、哲学与“什么都不做”策略

**Why "Fibonacci"?** The name comes not from the heap's shape, but from its analysis. When Fredman and Tarjan invented this data structure in 1984, they proved that the amortized running times of its operations are bounded by expressions involving Fibonacci numbers. Specifically, the maximum degree of any node in a Fibonacci heap of \(n\) nodes is at most \(O(\log*{\phi} n)\), where \(\phi = (1+\sqrt{5})/2 \approx 1.618\) is the golden ratio — the limiting ratio of consecutive Fibonacci numbers. The proof uses the fact that a node of degree \(k\) must have a subtree of size at least \(F*{k+2}\), the \((k+2)\)-th Fibonacci number. This logarithmic degree bound is what keeps `extract-min` efficient even though the heap is allowed to become messy between extractions. The Fibonacci sequence is baked into the data structure's worst-case guarantees, and the name stuck.

**为什么叫“斐波那契”？** 名字并非来自堆的形状，而是来自它的分析。1984 年 Fredman 和 Tarjan 发明这个数据结构时，证明了其操作的均摊运行时间受涉及斐波那契数的表达式所约束。具体来说，一个有 \(n\) 个节点的斐波那契堆中，任意节点的最大度数不超过 \(O(\log*{\phi} n)\)，其中 \(\phi = (1+\sqrt{5})/2 \approx 1.618\) 是黄金比例——连续斐波那契数之比的极限。证明用到了这样一个事实：一个度数为 \(k\) 的节点必须拥有一棵大小至少为 \(F*{k+2}\)（第 \(k+2\) 个斐波那契数）的子树。这个对数级别的度上界使得 `extract-min` 保持高效，即使堆在两次提取之间被允许变得凌乱。斐波那契数列被烘焙进了数据结构的最坏情况保证里，名字由此而来。

**The paradox of "doing nothing."** When I first read about Fibonacci heaps, I was baffled. A heap is supposed to maintain order — how can a data structure that allegedly "does nothing" possibly keep the heap property intact? The resolution of this paradox is the central insight behind the Fibonacci heap, and it hinges on the distinction between _deferring_ work and _not doing_ it.

**“什么都不做”的悖论。** 我第一次读到斐波那契堆时，完全被搞糊涂了。堆应该维护顺序——一个号称“什么都不做”的数据结构怎么可能保持堆性质？这个悖论的解决正是斐波那契堆背后的核心洞察，它取决于区分*推迟*工作和*不做*工作。

The Fibonacci heap **does maintain the heap property at all times**. Every tree in the forest is individually a valid min-heap: every parent is smaller than its children. This is never violated. What the Fibonacci heap refuses to do — unlike the binomial heap — is clean up the _structure_ of the forest between extractions. A binomial heap cleans up immediately: after every insertion or merge, it ensures that there is at most one tree of each order. A Fibonacci heap lets trees of the same order accumulate. It lets the root list grow messy. It lets nodes lose children without immediate structural repair. But the heap property — the only invariant that determines correctness — is always locally maintained on every parent-child edge.

斐波那契堆**时刻维护着堆性质**。森林中的每棵树各自都是一个合法的最小堆：每个父节点小于其孩子。这从未被违反。斐波那契堆拒绝做的——与二项堆不同——是在两次提取之间清理森林的*结构*。二项堆立刻清理：每次插入或合并后，它确保每阶至多一棵树。斐波那契堆允许同阶树累积。它允许根链表变得凌乱。它允许节点失去孩子而不做即时结构修复。但堆性质——决定正确性的唯一不变量——在每条父子边上始终被局部维护。

The "doing nothing" refers only to structural tidying. The heap property is never compromised. This is the crucial distinction: correctness invariants are maintained eagerly; performance optimizations are deferred lazily.

“什么都不做”仅指结构整理。堆性质从未妥协。这是关键区别：正确性不变量被急切维护；性能优化被懒惰推迟。

**Where it actually does work: extract-min.** If the Fibonacci heap never cleaned up, the root list would grow arbitrarily long, and scanning all roots to find the minimum — required by `extract-min` — would become O(n) instead of O(log n). So the cleanup _does_ happen, but only at `extract-min` time. When the minimum root is removed, its children are added to the root list, and then a **consolidation** step runs. Consolidation repeatedly takes two trees of equal degree and links them — exactly the same linking operation as in the binomial heap — until no two roots share the same degree. The work that a binomial heap spreads across every insertion and merge is collected into a single pass in the Fibonacci heap. Insert and merge are therefore O(1); `extract-min` becomes O(log n) amortized, paying for the deferred cleanup.

**它真正干活的地方：extract-min。** 如果斐波那契堆从不清理，根链表将无限增长，扫描所有根来找最小值——`extract-min` 必需的步骤——会变成 O(n) 而非 O(log n)。所以清理*确实*会发生，只是发生在 `extract-min` 的时刻。当最小根被移除，其孩子被加入根链表，然后一个**合并**步骤运行。合并反复取出两棵度相同的树并将它们链接——与二项堆中完全相同的链接操作——直到没有两个根共享相同的度。二项堆分散在每次插入和合并中的工作，在斐波那契堆中被集中到一趟扫描中。插入和合并因此是 O(1)；`extract-min` 变为均摊 O(log n)，为推迟的清理买单。

**Decrease-key: the crowning achievement.** The decrease-key operation is where the Fibonacci heap truly departs from its binomial ancestor and earns its theoretical fame. In a binomial heap, decreasing a key and then bubbling up is O(log n). The Fibonacci heap does something far more aggressive: when a node's key is decreased, it is simply **cut** from its parent and moved to the root list. No bubbling up. No immediate repair of any kind, beyond marking the parent as having lost a child. If a parent loses a second child, it is itself cut and moved to the root list — a cascading effect that can propagate upward. This "cut and cascade" policy is what achieves amortized O(1) for decrease-key: each individual cut is O(1), and the amortized analysis charges the rare cascading cuts against earlier insertions and decreases. The heap property remains intact because the cut node was only ever made _smaller_, so it can only violate the heap property with respect to its ancestors (from which it is now severed). Once in the root list, it is a valid single-node heap.

**Decrease-key：顶峰成就。** Decrease-key 操作是斐波那契堆真正脱离其二项堆祖先并赢得理论名声的地方。在二项堆中，降低一个键值然后向上冒泡是 O(log n)。斐波那契堆做了远为激进的事：当一个节点的键值被降低时，它被简单地从父节点**切下**并移至根链表。没有向上冒泡。没有任何形式的即时修复，除了将父节点标记为失去了一个孩子。如果一个父节点失去第二个孩子，它自己被切下并移至根链表——一个可以向上传播的级联效应。这种“切割并级联”策略是 decrease-key 达到均摊 O(1) 的原因：每次单独切割是 O(1)，而均摊分析将罕见的级联切割分摊到更早的插入和降低操作上。堆性质保持完好，因为被切的节点只是被变得更*小*了，所以它只会相对于其祖先违反堆性质（而它现在已经与它们分离）。进入根链表后，它是一棵合法的单节点堆。

**The "do nothing" philosophy summarized.** The Fibonacci heap is a masterclass in lazy evaluation applied to data structures. It identifies which operations are common (insert, merge, decrease-key) and makes them as cheap as possible by postponing structural housekeeping to the rare but unavoidable `extract-min`. The heap property — the correctness invariant — is maintained at every moment. Only the structural tidiness — the performance invariant — is deferred. This is why a Fibonacci heap looks messy between extractions: multiple trees of the same order, nodes with missing children, a root list that is a jumble rather than a neat sorted sequence. But when the bill comes due at the next `extract-min`, the consolidation step restores order in one efficient sweep. The result is a priority queue where every operation except `extract-min` runs in O(1) amortized time, and `extract-min` itself runs in O(log n) amortized time. No other known heap data structure achieves this combination of amortized bounds.

**“什么都不做”哲学总结。** 斐波那契堆是一次将惰性求值应用于数据结构的大师课。它识别出哪些操作是频繁的（插入、合并、decrease-key），通过将结构整理推迟到罕见但不可避免的 `extract-min`，使它们尽可能便宜。堆性质——正确性不变量——每时每刻都被维护。只有结构整洁——性能不变量——被推迟了。这就是为什么斐波那契堆在两次提取之间看起来凌乱：同阶的多棵树，失去孩子的节点，根链表是一团乱麻而非整齐的有序序列。但当下一次 `extract-min` 使账单到期时，合并步骤一趟高效扫描恢复秩序。结果是一个优先队列，其中除 `extract-min` 外所有操作的均摊时间为 O(1)，而 `extract-min` 本身为均摊 O(log n)。已知没有其他堆数据结构能达到这组均摊界限。

**A sober note on practicality.** Despite its theoretical elegance, the Fibonacci heap is notoriously absent from standard libraries (C++ STL uses a binary heap; Java's `PriorityQueue` uses a binary heap; Python's `heapq` uses a binary heap) and almost never appears in competitive programming or LeetCode problems. The reasons are twofold. First, the implementation is genuinely complex — hundreds of lines of pointer manipulation, delicate case analysis for cascading cuts, and an auxiliary degree-indexed array for consolidation. Second, the constant factors are large. In practice, a well-tuned binary heap or a simpler structure like the pairing heap often outperforms the Fibonacci heap on realistic input sizes. The "amortized O(1)" decrease-key is a theoretical victory that rarely translates to wall-clock superiority unless the graph is enormous and decrease-key operations outnumber extract-min by a huge margin. That said, the Fibonacci heap remains one of the most important _theoretical_ data structures in computer science. Its invention in 1984 resolved an open problem about the optimal complexity of Dijkstra's algorithm, and its design principles — deferred work, amortized analysis via potential functions, and cascading cleanup — have influenced generations of data structure research. It is a structure to be understood for its ideas, not one to be reached for when building a web server or solving a LeetCode medium. In Fredman and Tarjan's own words, the Fibonacci heap is "primarily of theoretical interest."

**关于实用性的冷静提醒。** 尽管有理论上的优雅，斐波那契堆在标准库中几乎不存在（C++ STL 用二叉堆；Java `PriorityQueue` 用二叉堆；Python `heapq` 用二叉堆），且几乎不出现在算法竞赛或 LeetCode 题目中。原因有二。第一，实现确实复杂——数百行的指针操作，级联切割的精密情况分析，以及合并用的按度索引的辅助数组。第二，常数因子很大。实践中，精心调优的二叉堆或配对堆等更简单的结构，在现实输入规模上往往超越斐波那契堆。“均摊 O(1)”的 decrease-key 是一场理论胜利，除非图极为庞大且 decrease-key 操作以巨大优势压倒 extract-min，它很少转化为墙上时钟的优势。话虽如此，斐波那契堆仍是计算机科学中最重要的*理论*数据结构之一。它 1984 年的发明解决了关于 Dijkstra 算法最优复杂度的开放问题，其设计原则——推迟工作、通过势函数进行均摊分析、级联清理——影响了几代数据结构研究。这是一个因其思想而值得被理解的结构，而非一个在搭建 web 服务器或做 LeetCode 中等题时会伸手去拿的家伙。用 Fredman 和 Tarjan 自己的话说，斐波那契堆“主要具有理论兴趣”。

#### 3.3.5 The Design Lesson of Mergeable Heaps / 可合并堆的设计教训

The arc from leftist to binomial to Fibonacci heaps tells a story about data structure design. Leftist heaps impose a local invariant (the leftist property) to make the right path short. Binomial heaps impose a global structure (the binary-number forest) to make merging resemble addition. Fibonacci heaps abandon structure almost entirely, trusting that deferred cleanup will amortize to optimal bounds. Each step trades structural rigidity for operational flexibility. The lesson: when a single operation (merge, or decrease-key) is the bottleneck, a data structure can be tailored to make that operation cheap, even at the expense of others — and the right design can shift the complexity class of entire algorithms built on top.

从左偏堆到二项堆再到斐波那契堆的弧线，讲述了一个关于数据结构设计的故事。左偏堆施加了一个局部不变量（左偏性质）使右路径短。二项堆施加了一个全局结构（二进制数森林）使合并类似加法。斐波那契堆几乎完全放弃结构，相信延迟清理的均摊会达到最优界限。每一步都以结构刚度为代价换取操作灵活性。教训是：当某一个操作（合并，或 decrease-key）成为瓶颈时，数据结构可以被定制使该操作便宜，即使牺牲其他操作——而正确的设计可以改变构建于其上的整个算法的复杂度等级。

### 3.4 Heaps in External Sorting and Multi-Way Merge / 堆在外排序与多路归并中的应用

Imagine you are asked to sort one terabyte of integers, but your computer has only 8 GB of RAM. The entire dataset cannot fit in memory at once — it lives on disk. This is the canonical scenario for **external sorting**, where data resides on slow, high-capacity external storage and must be processed in chunks that fit into fast, limited memory. The heap plays a starring role in the most critical phase of this process.

想象你被要求排序 1 TB 的整数，但你的计算机只有 8 GB 内存。整个数据集无法一次性装入内存——它存放在磁盘上。这正是**外排序**的典型场景：数据驻留在慢速、大容量的外部存储上，必须分块装入快速、有限的内存中处理。堆在这个过程中最关键的一个阶段扮演了主角。

External sorting traditionally proceeds in two phases. **Phase 1: Run generation.** Read a chunk of data that fits in memory, sort it internally (using quicksort, merge sort, or heap sort — this part is in-memory and fast), and write the sorted chunk back to disk as a "run." Repeat until the entire dataset has been consumed. If the dataset has \(N\) elements and memory can hold \(B\) elements at a time, this phase produces \(M = \lceil N/B \rceil\) sorted runs. **Phase 2: Multi-way merge.** Merge all \(M\) runs into a single globally sorted output. This is where the heap enters.

外排序传统上分为两个阶段。**阶段一：生成归并段。** 读入一块能装入内存的数据，在内存中对其排序（用快速排序、归并排序或堆排序——这部分在内存中很快），将排好序的块作为“归并段”写回磁盘。重复直到整个数据集处理完毕。如果数据集有 \(N\) 个元素，内存一次能容纳 \(B\) 个元素，这一阶段会产生 \(M = \lceil N/B \rceil\) 个已排序的归并段。**阶段二：多路归并。** 将全部 \(M\) 个归并段合并成一个全局有序的输出。堆正是在此时登场。

Why is merging \(M\) sorted sequences non-trivial? Each run is internally sorted, so the smallest _overall_ element must be the first element of one of the runs. To output elements in globally sorted order, we must repeatedly answer the question: "among the current front elements of all \(M\) runs, which is the smallest?" A naive approach scans all \(M\) candidates for each output element, taking \(O(M)\) per element and \(O(N \cdot M)\) in total. When \(M\) is large — say, hundreds or thousands of runs — this linear scan becomes the bottleneck that defeats the purpose of external sorting.

为什么合并 \(M\) 个有序序列并非易事？每个归并段内部有序，因此全局*最小*元素必定是某个归并段的第一个元素。要以全局有序的顺序输出元素，我们必须反复回答这个问题：“在所有 \(M\) 个归并段当前的首元素中，哪个最小？”朴素做法对每个输出元素都扫描全部 \(M\) 个候选者，每元素 \(O(M)\)，总计 \(O(N \cdot M)\)。当 \(M\) 很大时——比如数百或数千个归并段——这次线性扫描就变成了瓶颈，背离了外排序的初衷。

A min-heap of size \(M\) solves this exactly. The algorithm is as direct as it is elegant.

一个大小为 \(M\) 的最小堆恰好解决这个问题。算法直接又优雅。

1. Initialize a min-heap. For each of the \(M\) runs, read its first element and push it into the heap, along with an identifier indicating which run it came from.
   初始化一个最小堆。对 \(M\) 个归并段中的每一个，读取其首元素并将其压入堆中，同时记录它来自哪个归并段。

2. While the heap is not empty: pop the minimum element, write it to the output. Then, read the _next_ element from the same run that produced the popped element, and push it into the heap. If that run is exhausted, simply continue without pushing.
   当堆非空时：弹出最小元素，写入输出。然后，从刚弹出的元素所属的同一归并段中读取*下一个*元素，压入堆中。如果该归并段已耗尽，跳过压入步骤继续。

3. When the heap becomes empty, the merge is complete.
   当堆变空时，合并完成。

Each heap operation — pop and push — costs \(O(\log M)\). For each of the \(N\) output elements, we perform at most one pop and one push, so the total time for Phase 2 is \(O(N \log M)\). The memory requirement is just \(O(M)\) for the heap plus one input buffer per run — negligible compared to the dataset size. The heap transforms the merge from an \(O(N \cdot M)\) sequential scan into an \(O(N \log M)\) logarithmic tournament, enabling external sorting to handle thousands of runs without the merge step dominating the total runtime.

每次堆操作——弹出和压入——花费 \(O(\log M)\)。对 \(N\) 个输出元素中的每一个，我们最多执行一次弹出和一次压入，因此阶段二的总时间为 \(O(N \log M)\)。内存需求仅为堆的 \(O(M)\) 空间加上每个归并段一个输入缓冲区——与数据集规模相比可忽略不计。堆将合并从 \(O(N \cdot M)\) 的顺序扫描转变为 \(O(N \log M)\) 的对数级锦标赛，使外排序能够处理数千个归并段，而不会让合并步骤主导总运行时间。

Readers who worked through the array-merging problem before will recognize the pattern immediately. That problem asked us to merge \(N\) arrays of different sizes by repeatedly extracting the two smallest, adding their lengths, and inserting the sum. The multi-way merge here asks us to merge \(M\) sorted runs by repeatedly extracting the single smallest and inserting the next element from the corresponding run. The core mechanism is identical: a min-heap maintains the "current front" of every input sequence, and the global minimum is always at the top of the heap. The earlier problem was a \(K=2\) special case that built a Huffman tree; this one is a general \(K=M\) merging engine that drives real-world external storage systems. The progression from two-way to multi-way is a perfect illustration of how the same data structure — the binary heap — scales from an educational puzzle to a production algorithm.

读过之前数组合并问题的读者会立刻认出这个模式。那道题要求我们合并 \(N\) 个不同大小的数组，通过反复提取最小的两个、相加、再插入。而此处的多路归并要求我们合并 \(M\) 个已排序归并段，通过反复提取最小的一个并插入来自对应段的下一元素。核心机制完全相同：一个最小堆维护每个输入序列的“当前队首”，全局最小值始终在堆顶。前一道题是构建 Huffman 树的 \(K=2\) 特例；这一道题是驱动真实世界外存储系统的通用 \(K=M\) 合并引擎。从二路到多路的进展完美展示了一个数据结构——二叉堆——如何从教学谜题扩展到生产级算法。

### 3.5 Dual Heaps for Dynamic Median / 双堆维护动态中位数

#### 3.5.1 LeetCode Problem 295: Find Median from Data Stream / LeetCode 第 295 题：数据流的中位数

A classic problem that appears on LeetCode (Problem 295: "Find Median from Data Stream") asks: design a data structure that accepts a stream of integers and, at any moment, can report the median of all numbers seen so far. If the count is odd, the median is the middle element; if even, it is the average of the two middle elements. The naive approach — storing all numbers in an array and sorting it before each median query — costs \(O(n \log n)\) per query and is utterly impractical for large streams. The heap-based solution that achieves \(O(\log n)\) per insertion and \(O(1)\) per median query is an elegant demonstration of how two heaps with opposite ordering can collaborate to maintain a global partition.

一道经典的 LeetCode 题目（第 295 题“数据流的中位数”）要求：设计一个数据结构，接收一个整数流，并能在任何时刻报告迄今为止所见所有数字的中位数。若总数为奇数，中位数是中间元素；若为偶数，是中间两个元素的平均值。朴素做法——将所有数字存入数组，每次查询前排序——每次查询 \(O(n \log n)\)，对大规模数据流完全不实用。基于堆的解法每次插入 \(O(\log n)\)，每次中位数查询 \(O(1)\)，优雅地展示了两个相反排序的堆如何协作维护一个全局划分。

**The design.** Maintain two heaps. A **max-heap** (let's call it `left`) stores the smaller half of the numbers — the root of a max-heap is the largest in that half, which for the smaller half is precisely the element closest to the median. A **min-heap** (call it `right`) stores the larger half of the numbers — its root is the smallest in that half, again the element closest to the median. The invariant we enforce is:

**设计。** 维护两个堆。一个**最大堆**（称为 `left`）存储较小的一半数字——最大堆的根是该半中最大的元素，对较小的一半来说，正是最靠近中位数的元素。一个**最小堆**（称为 `right`）存储较大的一半数字——它的根是该半中最小的元素，同样是最靠近中位数的元素。我们强制执行的不变量是：

- Every element in `left` (the smaller half) is less than or equal to every element in `right` (the larger half). This is enforced by the insertion logic.
  `left`（较小一半）中的每个元素都小于等于 `right`（较大一半）中的每个元素。这由插入逻辑强制执行。

- The sizes of the two heaps differ by at most one. When the total count is odd, `left` is permitted to have one extra element; the median is then simply `left.top()`. When even, the two heaps are equal in size, and the median is the average of `left.top()` and `right.top()`.
  两个堆的大小相差不超过一。总数为奇数时，允许 `left` 多一个元素；中位数就是 `left.top()`。总数为偶数时，两个堆大小相等，中位数是 `left.top()` 和 `right.top()` 的平均值。

**Insertion logic.** When a new number arrives, we decide which heap it belongs to and then rebalance if necessary.

**插入逻辑。** 当新数字到达时，先判断它属于哪个堆，必要时再重新平衡。

1. If `left` is empty or the number is less than or equal to `left.top()` (the largest element in the smaller half), push it into `left`. Otherwise, push it into `right`.
   若 `left` 为空，或该数字小于等于 `left.top()`（较小一半中的最大元素），压入 `left`。否则压入 `right`。

2. Now check the size constraint. If `left` has more than `right->size + 1` elements, pop the maximum from `left` and push it into `right`. If `right` has more elements than `left`, pop the minimum from `right` and push it into `left`. After this rebalancing step, the invariant is restored.
   现在检查大小约束。若 `left` 比 `right` 多出超过一个元素，从 `left` 弹出最大值并压入 `right`。若 `right` 元素比 `left` 多，从 `right` 弹出最小值并压入 `left`。经过此次重新平衡，不变量恢复。

**Query logic.** After every insertion, the median can be read in \(O(1)\) time. If `left->size > right->size`, return `left.top()` (the extra element in the smaller half is the middle element). Otherwise, return `(left.top() + right.top()) / 2.0`.

**查询逻辑。** 每次插入后，中位数可在 \(O(1)\) 时间内读出。若 `left->size > right->size`，返回 `left.top()`（较小一半中多出的那个元素就是中间元素）。否则返回 `(left.top() + right.top()) / 2.0`。

**A worked example.** For the sequence `[1, 2, 3]`:

**一个跑通的例子。** 对序列 `[1, 2, 3]`：

```
addNum(1): left = [1]          right = []            median = 1.0
addNum(2): left = [1]          right = [2]           median = (1+2)/2 = 1.5
addNum(3): left = [1]          right = [2,3]
           // rebalance: right has 2, left has 1 → pop min from right
           left = [2,1]        right = [3]           median = 2.0
```

The ASCII representation shows the internal states of both heaps as the stream grows. The rebalancing step after adding 3 is the critical moment: `right` briefly holds `[2,3]` with 2 at the root, but `left` only has one element, violating the size invariant. Popping 2 from `right` and pushing it into `left` restores balance and places 2 exactly at the median position.

ASCII 图展示了随数据流增长两个堆的内部状态。添加 3 后的重新平衡是关键时刻：`right` 短暂持有 `[2,3]`，根为 2，但 `left` 只有一个元素，违反大小不变量。从 `right` 弹出 2 并压入 `left` 恢复了平衡，并恰好将 2 放在了中位数位置。

**Implementation in C.** Below is a complete, runnable implementation of the `MedianFinder` class using a dual-heap design. **A max-heap is simulated by a min-heap that stores negated values.** Both heaps share the same `MinHeap` structure defined earlier in this series. The code is self-contained and can be directly compiled.

**C 语言实现。** 以下是使用双堆设计的 `MedianFinder` 完整可运行实现。**最大堆通过一个存储负值的最小堆来模拟。** 两个堆共享本系列前面定义的 `MinHeap` 结构。代码自包含，可直接编译。

```c
typedef struct {
    int *data;
    int size;
    int capacity;
} MinHeap;

MinHeap* createHeap(int capacity) {
    MinHeap *h = (MinHeap*)malloc(sizeof(MinHeap));
    h->capacity = capacity; h->size = 0;
    h->data = (int*)malloc(capacity * sizeof(int));
    return h;
}

void swap(int *a, int *b) { int t = *a; *a = *b; *b = t; }

void heapifyUp(MinHeap *h, int i) {
    int p = (i - 1) / 2;
    while (i > 0 && h->data[i] < h->data[p]) {
        swap(&h->data[i], &h->data[p]);
        i = p; p = (i - 1) / 2;
    }
}

void heapifyDown(MinHeap *h, int i) {
    int l, r, smallest;
    while (1) {
        l = 2 * i + 1; r = 2 * i + 2; smallest = i;
        if (l < h->size && h->data[l] < h->data[smallest]) smallest = l;
        if (r < h->size && h->data[r] < h->data[smallest]) smallest = r;
        if (smallest == i) break;
        swap(&h->data[i], &h->data[smallest]);
        i = smallest;
    }
}

void push(MinHeap *h, int v) {
    h->data[h->size] = v;
    heapifyUp(h, h->size);
    h->size++;
}

int pop(MinHeap *h) {
    int top = h->data[0];
    h->data[0] = h->data[--h->size];
    heapifyDown(h, 0);
    return top;
}

int top(MinHeap *h) { return h->data[0]; }

// ---------- MedianFinder ----------
typedef struct {
    MinHeap *left;   // max-heap (stores negated values): smaller half
    MinHeap *right;  // min-heap: larger half
} MedianFinder;

MedianFinder* medianFinderCreate() {
    MedianFinder *obj = (MedianFinder*)malloc(sizeof(MedianFinder));
    obj->left  = createHeap(50000);
    obj->right = createHeap(50000);
    return obj;
}

void medianFinderAddNum(MedianFinder *obj, int num) {
    // Step 1: decide which heap to insert into
    if (obj->left->size == 0 || num <= -top(obj->left))
        push(obj->left, -num);    // negate for max-heap simulation
    else
        push(obj->right, num);

    // Step 2: rebalance to maintain size invariant
    if (obj->left->size > obj->right->size + 1) {
        // left too large: move its max to right
        int moved = -pop(obj->left);
        push(obj->right, moved);
    } else if (obj->right->size > obj->left->size) {
        // right too large: move its min to left
        int moved = pop(obj->right);
        push(obj->left, -moved);
    }
}

double medianFinderFindMedian(MedianFinder *obj) {
    if (obj->left->size > obj->right->size)
        return -top(obj->left);   // odd count, max of left is the median
    else
        return (-top(obj->left) + top(obj->right)) / 2.0;
}

void medianFinderFree(MedianFinder *obj) {
    free(obj->left->data); free(obj->left);
    free(obj->right->data); free(obj->right);
    free(obj);
}
```

**Complexity analysis.** Each `addNum` performs at most two heap insertions and two extractions, each \(O(\log n)\). The total cost per insertion is \(O(\log n)\). `findMedian` reads the top of at most two heaps — \(O(1)\). The space requirement is \(O(n)\). This is asymptotically optimal for a dynamic data stream: any data structure that maintains the median under insertions must perform at least \(\Omega(\log n)\) comparisons per insertion in the comparison model.

**复杂度分析。** 每次 `addNum` 最多执行两次堆插入和两次堆提取，每次 \(O(\log n)\)。每次插入的总代价为 \(O(\log n)\)。`findMedian` 最多读取两个堆的堆顶——\(O(1)\)。空间需求 \(O(n)\)。这对动态数据流来说是渐近最优的：在比较模型中，任何在插入下维护中位数的数据结构每次插入至少需要 \(\Omega(\log n)\) 次比较。

**Why this pattern is worth recognizing.** The dual-heap median finder is the canonical example of a broader design principle: when a problem asks for a "middle" value in a dynamic collection, two heaps — one for the lower half, one for the upper half — are almost always the answer. The same structure can be generalized to sliding window medians, to tracking arbitrary percentiles (by varying the size ratio of the two heaps), and to certain load-balancing problems where the goal is to split items evenly between two servers based on a dynamic threshold. The heap, once again, solves the problem not by fully sorting the data, but by maintaining exactly enough order to answer the query at hand.

**为什么这个模式值得识别。** 双堆中位数查找器是一个更广泛设计原则的经典示例：当一个问题要求动态集合中的“中间”值时，两个堆——一个管下半，一个管上半——几乎总是答案。同样的结构可以推广到滑动窗口中位数、追踪任意百分位数（通过改变两个堆的大小比例）、以及某些负载均衡问题（目标是基于动态阈值将项目均分到两台服务器）。堆再一次解决了问题，不是通过完全排序数据，而是通过恰好维护回答当前查询所需的那一点顺序。

#### 3.5.2 Beyond LeetCode 295: Sliding Window Median and Lessons Learned / LeetCode 295 之上：滑动窗口中位数与经验教训

After mastering the dual-heap approach for a dynamic data stream in Problem 295, I moved on to its harder variant — Problem 480 "Sliding Window Median." The task is the same (find the median of a collection of numbers), but with an added twist: the collection is a sliding window of fixed size \(k\) moving across an array. When the window slides, one element leaves and one element enters. The median must be recomputed at each position. Confident from the previous problem, I wrote a solution that, for each window, simply built two fresh heaps from scratch by iterating through the \(k\) elements. To my surprise, it not only failed the performance tests — it produced wrong answers. Several misconceptions surfaced, and correcting them deepened my understanding of the dual-heap pattern considerably.

在掌握第 295 题中动态数据流的双堆方法后，我转向了更难的变体——第 480 题“滑动窗口中位数”。任务相同（找到一组数字的中位数），但多了一个转折：集合是一个固定大小 \(k\) 的滑动窗口，在数组上移动。窗口滑动时，一个元素离开，一个元素进入。每次移动都必须重新计算中位数。带着前一题的自信，我写了一个解法：对每个窗口，遍历 \(k\) 个元素从头构建两个新堆。令我惊讶的是，它不仅没通过性能测试——还给出了错误答案。暴露出几个误解，纠正它们显著加深了我对双堆模式的理解。

**Misconception 1: Alternating insertion is enough.** My initial code decided which heap to insert into based solely on their relative sizes: "if the two heaps have equal size, push to `left`; otherwise push to `right`." This keeps the sizes balanced but completely ignores the _values_ of the elements. As a result, a very small number might be placed in `right` (the larger half) and a very large number in `left` (the smaller half), shattering the invariant that every element in `left` ≤ every element in `right`. Once this invariant collapses, the heap tops no longer frame the median — the entire structure loses its meaning. The correct rule, as Problem 295 enforces, is: **compare the incoming element with `left`'s maximum first**, and only then balance the sizes. Value-based partitioning is the invariant; size balancing is merely a maintenance step that assumes the invariant already holds. Getting this backwards is the single most common mistake with dual heaps.

**误解一：交替插入就够了。** 我最初的代码仅根据两个堆的相对大小来决定插入哪个堆：“如果两个堆大小相等，插入 `left`；否则插入 `right`。”这保持了大小平衡，但完全忽略了元素的*值*。结果，一个很小的数可能被放入 `right`（较大的一半），一个很大的数可能被放入 `left`（较小的一半），打破了“`left` 中每个元素 ≤ `right` 中每个元素”的不变量。一旦这个不变量崩塌，两个堆顶就不再框定中位数——整个结构失去了意义。正确的规则，正如第 295 题所执行的，是：**先将待插入元素与 `left` 的最大值比较**，然后再平衡大小。基于值的划分是不变量；大小平衡仅仅是假设不变量已经成立后的维护步骤。把这两者颠倒，是双堆法最常见的一个错误。

**Misconception 2: Rebuilding the heaps from scratch for each window is acceptable.** For a window of size \(k\) and an array of length \(n\), rebuilding two heaps from scratch at each of the \(n - k + 1\) positions costs \(O(k \log k)\) per window and \(O(n k \log k)\) total. When \(n\) and \(k\) both approach \(10^5\), this is catastrophically slow. The correct approach is to **maintain the two heaps incrementally** across window slides. But how do we remove an element that has left the window? A heap gives efficient access only to its top — finding and removing an arbitrary element buried deep in the tree would require a linear scan, destroying the \(O(\log k)\) guarantee. The solution is a technique called **lazy deletion**, and it requires a careful explanation of both its mechanics and its potential pitfalls.

**误解二：每个窗口从头重建堆是可以接受的。** 对于大小为 \(k\) 的窗口和长度为 \(n\) 的数组，在 \(n - k + 1\) 个位置上每次从头重建两个堆，每个窗口代价 \(O(k \log k)\)，总计 \(O(n k \log k)\)。当 \(n\) 和 \(k\) 都接近 \(10^5\) 时，这是灾难性的慢。正确的做法是**在窗口滑动过程中增量维护两个堆**。但如何移除已离开窗口的元素？堆只提供对堆顶的高效访问——查找并删除深埋在树中的任意元素需要线性扫描，这会破坏 \(O(\log k)\) 的保证。解决方案是一种称为**惰性删除**的技术，我们需要仔细解释它的机制及其潜在陷阱。

**The mechanics of lazy deletion.** When an element leaves the sliding window, we do **not** attempt to locate and extract it from the heap immediately. Instead, we record in a separate hash table: "this value is scheduled for deletion," incrementing a counter for that value. The element remains physically inside the heap, occupying space and participating in the tree structure. At the same time, we decrement an **effective size** counter for the heap that held it — so the heap's logical size is updated, but its physical size is not. The element becomes a "ghost": present in the array, but no longer counted as a legitimate member of the heap.

**惰性删除的机制。** 当元素离开滑动窗口时，我们**不**立即尝试在堆中定位并提取它。相反，我们在一个单独的哈希表中记录：“此值已计划删除”，为该值递增一个计数器。该元素物理上仍留在堆中，占据空间，参与树结构。同时，我们为该元素所属的堆递减一个**有效大小**计数器——堆的逻辑大小更新了，但物理大小未变。该元素变成了一个“幽灵”：存在于数组中，但不再被算作堆的合法成员。

**The pruning step.** The danger is clear: if a ghost element floats to the top of the heap — because it is the smallest (or, in a max-heap simulation, the largest) — then every `top()` or `pop()` operation will see a value that has already left the window, producing incorrect results. This is where **pruning** comes in. Before reading the top of a heap, and after every heap operation that changes the structure, we repeatedly check: is the current top element a ghost? If its value exists in the hash table with a count greater than zero, we physically pop it from the heap, decrement the hash table counter, and check the new top. We repeat until the top is a genuinely active element — or the heap is empty. The physical `pop` during pruning truly shrinks the heap's physical size. Only after pruning does the heap's top reliably reflect the minimum (or maximum) among _active_ elements.

**剪枝步骤。** 危险是显然的：如果一个幽灵元素浮到了堆顶——因为它是最小的（或在最大堆模拟中，是最大的）——那么每次 `top()` 或 `pop()` 操作都会看到一个已经离开窗口的值，产生错误结果。这就是**剪枝**发挥作用的地方。在读取堆顶之前，以及在每次改变结构的堆操作之后，我们反复检查：当前堆顶元素是不是幽灵？如果它的值在哈希表中且计数大于零，我们从堆中物理弹出它，递减哈希表计数器，再检查新的堆顶。重复此过程直到堆顶是一个真正活跃的元素——或者堆变为空。剪枝过程中的物理 `pop` 真正缩小了堆的物理大小。只有在剪枝之后，堆顶才可靠地反映*活跃*元素中的最小值（或最大值）。

**Does lazy deletion break the size balancing?** A legitimate concern: the two heaps are physically holding ghost elements, so their actual array sizes may be larger than their effective sizes. Does the size balancing logic — which uses effective sizes — become unreliable? The answer is no, provided the pruning step is called at the right moments. The effective size correctly tracks how many _real_ elements are in each heap, and the size balancing step only ever moves one real element at a time (the top, which pruning guarantees is real). Ghost elements deep in the heap do not affect the position of real elements — they simply add inert nodes that are eventually cleaned when they reach the top. The worst-case scenario is that many ghost elements accumulate, slightly increasing the height of the heap and thus the constant factor of subsequent operations. But since the maximum number of ghost elements at any moment is at most \(k\) (each element leaves the window at most once), and each will be pruned exactly once when it reaches the top, the amortized complexity remains \(O(\log k)\) per operation.

**惰性删除会破坏大小平衡吗？** 一个合理的疑虑是：两个堆物理上持有幽灵元素，它们的实际数组大小可能大于有效大小。使用有效大小的平衡逻辑会变得不可靠吗？答案是不会，前提是剪枝步骤在正确的时刻被调用。有效大小正确追踪每个堆中有多少*真正*元素，而大小平衡步骤每次只移动一个真正元素（堆顶，剪枝保证了它是真的）。堆深处的幽灵元素不影响真正元素的位置——它们只是添加了惰性节点，当它们到达堆顶时最终会被清理。最坏情况是许多幽灵元素积累，轻微增加堆的高度从而增大后续操作的常数因子。但由于任何时刻幽灵元素总数最多为 \(k\)（每个元素至多离开窗口一次），且每个元素在到达堆顶时恰好被剪枝一次，均摊复杂度保持每次操作 \(O(\log k)\)。

**The hash table implementation.** In C, where no built-in hash table exists, the choice depends on the constraints of the problem. For Problem 480, the element values range from \(-10^5\) to \(10^5\), a span of \(2 \times 10^5 + 1\) possible integers. This is small enough to use a simple **array** as a direct-access frequency table rather than a full hash table. We allocate an array `int *delayed` of size, say, 200001, offsetting each value by adding a constant (e.g., `val + 100000`) to map it to a non-negative index. When an element leaves the window, we increment `delayed[val + OFFSET]`. During pruning, we check `delayed[top + OFFSET] > 0`. If yes, the top is a ghost — we physically pop it, decrement the counter, and repeat. This approach gives \(O(1)\) insertion, deletion, and lookup for the delayed table, with minimal overhead and no hashing logic. The array-based approach works whenever the value range is bounded and small relative to memory limits. For larger or unbounded ranges, a hash table such as `uthash` (an external C library) or a balanced BST could be substituted, but the principle remains identical: map value → pending-deletion count.

**哈希表的实现。** 在 C 语言中，没有内置的哈希表，选择的依据是问题的约束。对第 480 题，元素值范围从 \(-10^5\) 到 \(10^5\)，跨度约为 \(2 \times 10^5 + 1\) 个可能的整数。这个范围足够小，可以使用一个简单的**数组**作为直接访问的频率表，而非完整的哈希表。我们分配一个数组 `int *delayed`，大小约为 200001，通过给每个值加上一个常数偏移（例如 `val + 100000`）将其映射到非负下标。当元素离开窗口时，递增 `delayed[val + OFFSET]`。剪枝时，检查 `delayed[top + OFFSET] > 0`。若为真，堆顶是幽灵——物理弹出它，递减计数器，重复。此方法为延迟表提供了 \(O(1)\) 的插入、删除和查找，开销极小且无需哈希逻辑。基于数组的方法适用于值域有界且相对于内存限制较小的情况。对于更大或无界的值域，可以替换为 `uthash`（一个 C 语言外部哈希库）或平衡二叉搜索树，但原理完全相同：将值映射到待删除计数。

**In summary, the incremental algorithm for each window slide is:**

**综上，每个窗口滑动的增量算法是：**

1. **Departure:** Identify the element that leaves the window. Increment its counter in the delayed table. Decrement the effective size of whichever heap it logically belonged to (determined by comparing it with the current median: if it is ≤ the median, it was in `left`; otherwise `right`).  
   **离开：** 识别离开窗口的元素。在延迟表中递增其计数器。递减它在逻辑上所属堆的有效大小（通过将其与当前中位数比较确定：若 ≤ 中位数，它在 `left`；否则在 `right`）。

2. **Arrival:** Insert the newly entering element using the value-aware insertion rule (compare with `left`'s top, then insert and rebalance), incrementing the effective size of the receiving heap.  
   **进入：** 使用基于值的插入规则插入新进入的元素（与 `left` 堆顶比较，然后插入并重新平衡），递增接收堆的有效大小。

3. **Prune:** Call prune on both heaps, so that any ghost elements that have risen to the top are physically removed and their delayed counters decremented.  
   **剪枝：** 对两个堆调用剪枝，使任何上升到堆顶的幽灵元素被物理移除，其延迟计数器递减。

4. **Rebalance:** If the effective sizes of the two heaps now violate the invariant (difference > 1), move a real element (the top, guaranteed real by pruning) from the larger heap to the smaller heap, and update effective sizes accordingly.  
   **重新平衡：** 如果两个堆的有效大小现在违反了不变量（差值 > 1），从较大的堆移动一个真正元素（堆顶，剪枝保证为真）到较小的堆，并相应更新有效大小。

5. **Query:** The median is computed from the tops of the two heaps as before. Pruning must be called before reading any top.  
   **查询：** 中位数和之前一样从两个堆的堆顶计算。在读取任何堆顶之前必须调用剪枝。

**Misconception 3: Lazy deletion eliminates the need for rebalancing.** Even with lazy deletion, the two heaps can drift out of size balance: one heap may accumulate many lazily deleted elements, causing its effective size to shrink relative to the other. After processing the entering and departing elements for a window slide, a rebalancing step must still be performed — moving elements from one heap to the other until the size invariant is restored. The rebalancing, like the insertion, is value-aware: elements moved from `left` to `right` are always `left`'s maximum (the most median-worthy element on that side), and elements moved from `right` to `left` are always `right`'s minimum.

**误解三：惰性删除消除了重新平衡的必要。** 即使有惰性删除，两个堆仍可能漂移出大小平衡：一个堆可能积累很多惰性删除的元素，导致其有效大小相对另一个堆缩小。为一次窗口滑动处理完进入和离开的元素后，仍必须执行重新平衡步骤——将元素从一个堆移到另一个堆，直到大小不变量恢复。重新平衡和插入一样，是基于值的：从 `left` 移到 `right` 的元素始终是 `left` 的最大值（该侧最接近中位数的元素），从 `right` 移到 `left` 的元素始终是 `right` 的最小值。

**What these two problems together teach.** Problem 295 introduces the dual-heap structure in a clean, insert-only setting. Problem 480 exposes what happens when the real world demands deletions — and reveals that the true power of the pattern lies not in the two heaps themselves, but in the invariant they collectively maintain. Value partitioning is the invariant; size balancing is the maintenance; lazy deletion is the engineering trick that keeps both intact when elements must depart. Moving from 295 to 480 is a miniature journey from "understanding a data structure" to "understanding why it works, and how to adapt it when the assumptions change."

**这两道题共同教会我们什么。** 第 295 题在一个干净的、仅插入的场景中引入了双堆结构。第 480 题暴露了当现实世界要求删除时会发生什么——并揭示了这个模式的真正力量不在于两个堆本身，而在于它们共同维护的不变量。值划分是不变量；大小平衡是维护手段；惰性删除是当元素必须离开时保持两者完好的工程技巧。从 295 到 480 的推进，是一次从“理解一个数据结构”到“理解它为什么工作，以及当假设改变时如何适配它”的微型旅程。

### 3.6 Other Variants: D-ary Heaps and Pairing Heaps / 其他变体：D-叉堆与配对堆

The binary heap, with its elegant array representation and \(O(\log n)\) operations, dominates textbooks and standard libraries. But it is not the final word in heap design. Two additional variants deserve attention: the D-ary heap, a simple generalization of the binary heap that trades off between tree height and per-node work; and the pairing heap, a self-adjusting structure that is arguably the most practical of the amortized-efficient heaps. Both teach valuable lessons about how small structural changes can shift performance profiles.

二叉堆凭借其优雅的数组表示和 \(O(\log n)\) 操作，统治了教材和标准库。但它并非堆设计的最终答案。还有两个值得关注的变体：D-叉堆，二叉堆的简单推广，在树高和每节点工作量之间做权衡；以及配对堆，一种自调整结构，可以说是在均摊高效堆中最实用的一个。两者都教给我们宝贵的经验：微小的结构变化如何改变性能特征。

#### 3.6.1 D-ary Heaps: More Branches, Shallower Trees / D-叉堆：更多分支，更浅的树

A binary heap gives each node exactly two children. A **D-ary heap** generalizes this: each node has \(d\) children, where \(d \ge 2\) is a fixed integer. The array representation extends cleanly. For 0-indexed arrays, the children of node \(i\) are at indices \(d \cdot i + 1, d \cdot i + 2, \dots, d \cdot i + d\). The parent of node \(i\) is at \(\lfloor (i - 1) / d \rfloor\). A binary heap is simply a D-ary heap with \(d = 2\).

二叉堆给每个节点恰好两个子节点。**D-叉堆**对此进行推广：每个节点有 \(d\) 个子节点，其中 \(d \ge 2\) 是一个固定的整数。数组表示可以干净地扩展。对于 0 索引数组，节点 \(i\) 的子节点位于 \(d \cdot i + 1, d \cdot i + 2, \dots, d \cdot i + d\)。节点 \(i\) 的父节点位于 \(\lfloor (i - 1) / d \rfloor\)。二叉堆就是 \(d = 2\) 的 D-叉堆。

**The tradeoff.** Increasing \(d\) makes the tree shallower: the height drops from \(\log_2 n\) to \(\log_d n\). This is beneficial for `heapifyUp` — an inserted element or a decreased key only needs to climb \(\log_d n\) levels to reach the root. It is harmful for `heapifyDown` — at each level, the algorithm must compare the parent against all \(d\) children to find the minimum, costing \(O(d)\) comparisons per level rather than \(O(1)\). The total cost of `pop` becomes \(O(d \cdot \log_d n)\). For `push` and `decrease-key`, the cost improves to \(O(\log_d n)\).

**权衡。** 增加 \(d\) 使树更浅：高度从 \(\log_2 n\) 降到 \(\log_d n\)。这对 `heapifyUp` 有利——一个被插入或降低键值的元素只需攀爬 \(\log_d n\) 层即可到达根。这对 `heapifyDown` 不利——在每一层，算法必须将父节点与全部 \(d\) 个子节点比较以找到最小值，每层代价 \(O(d)\) 次比较而非 \(O(1)\)。`pop` 的总代价变为 \(O(d \cdot \log_d n)\)。对 `push` 和 `decrease-key`，代价改善为 \(O(\log_d n)\)。

**Where D-ary heaps shine.** This tradeoff makes the D-ary heap an excellent fit for algorithms where `decrease-key` operations dramatically outnumber `extract-min` operations. The canonical example is **Dijkstra's shortest path algorithm on dense graphs**. In Dijkstra, the number of `decrease-key` calls is proportional to the number of edges \(E\), while the number of `extract-min` calls is proportional to the number of vertices \(V\). On a dense graph where \(E = \Theta(V^2)\), the `decrease-key` workload dominates. By increasing \(d\) (typical choices are \(d = 4\) or \(d = 8\)), each `decrease-key` becomes cheaper, while the harm to `extract-min` is amortized over the much larger number of edge relaxations. Empirical studies show that a 4-ary heap often outperforms a binary heap for Dijkstra on real road networks and other large graphs. The D-ary heap is a concrete illustration of a principle that recurs throughout data structure design: when one operation is the proven bottleneck, optimize for it even at the expense of others.

**D-叉堆的用武之地。** 这种权衡使 D-叉堆非常适合 `decrease-key` 操作数量远超 `extract-min` 的算法。典型例子是**稠密图上的 Dijkstra 最短路径算法**。在 Dijkstra 中，`decrease-key` 的调用次数与边数 \(E\) 成正比，而 `extract-min` 的调用次数与顶点数 \(V\) 成正比。在 \(E = \Theta(V^2)\) 的稠密图上，`decrease-key` 工作负载占主导。通过增加 \(d\)（典型选择是 \(d = 4\) 或 \(d = 8\)），每次 `decrease-key` 变得更便宜，而对 `extract-min` 的损害被大量边松弛操作所均摊。实证研究表明，在真实道路网络和其他大型图上，4-叉堆在 Dijkstra 中往往优于二叉堆。D-叉堆具体诠释了数据结构设计中反复出现的一个原则：当某一操作是已证实的瓶颈时，即使牺牲其他操作也要为它优化。

#### 3.6.2 Pairing Heaps: Self-Adjusting Simplicity / 配对堆：自调整的简洁

The pairing heap occupies a unique position in the heap landscape. It was proposed in 1986 by Fredman, Sedgewick, Sleator, and Tarjan as a simpler, practical alternative to the Fibonacci heap. Its implementation is remarkably short — often under 50 lines of code — yet it achieves amortized \(O(\log n)\) for `extract-min` and amortized \(O(1)\) for `insert`, `merge`, and `decrease-key` (though the latter bound is conjectured, not proven). In practice, the pairing heap frequently outperforms both binary heaps and Fibonacci heaps across a wide range of benchmarks. It is the poster child for the "self-adjusting" design philosophy: the structure reorganizes itself on every operation, and this constant tinkering produces excellent amortized behavior without the need for complex invariants.

配对堆在堆的版图中占据着独特的位置。它于 1986 年由 Fredman、Sedgewick、Sleator 和 Tarjan 提出，作为斐波那契堆更简单、更实用的替代品。它的实现异常简短——往往不到 50 行代码——却为 `extract-min` 实现了均摊 \(O(\log n)\)，为 `insert`、`merge` 和 `decrease-key` 实现了均摊 \(O(1)\)（尽管后者的界限是猜想，而非证明）。在实践中，配对堆在各种基准测试中经常同时优于二叉堆和斐波那契堆。它是“自调整”设计哲学的典范：结构在每次操作时自我重组，这种持续的微调产生了优秀的均摊行为，而不需要复杂的不变量。

**Structure.** A pairing heap is a single multi-way tree. Each node stores a key and three pointers: a pointer to its **leftmost child**, a pointer to its **next sibling** (the node to its right in the sibling list), and a pointer to its **previous sibling** (or to its parent if it is the leftmost child — this dual-purpose pointer is a common implementation trick). The heap is accessed via a single root pointer. There is no degree constraint, no NPL field, no order invariant beyond the heap property itself: every node's key is less than or equal to the keys of its children.

**结构。** 配对堆是一棵多叉树。每个节点存储一个键值和三个指针：指向其**最左孩子**的指针，指向其**下一个兄弟**的指针（兄弟链表中右侧的节点），以及指向其**上一个兄弟**的指针（若为最左孩子则指向父节点——这个双用途指针是常见的实现技巧）。堆通过一个单一的根指针访问。没有度约束，没有 NPL 字段，没有除堆性质本身之外的排序不变量：每个节点的键值小于等于其孩子的键值。

**Insert and merge.** Insertion creates a single-node tree and links it with the existing root: if the new node's key is smaller, it becomes the new root and the old root becomes its child; otherwise, the new node becomes a child of the old root. This is a single comparison and pointer reassignment — \(O(1)\). Merging two pairing heaps is identical: compare the two roots, and make the larger root a child of the smaller root. Both operations are unconditionally \(O(1)\), with no cascading or cleanup.

**插入与合并。** 插入创建一个单节点树并与现有根链接：若新节点的键值更小，它成为新根，旧根成为其孩子；否则，新节点成为旧根的孩子。这是一次比较和指针重定向——\(O(1)\)。合并两个配对堆完全相同：比较两个根，让较大的根成为较小根的孩子。两个操作都是无条件 \(O(1)\)，没有级联或清理。

**Extract-min.** This is where the pairing heap earns its name and does its real work. Removing the root leaves behind a forest of orphaned child subtrees — the former root's children, arranged in a sibling list. These subtrees must be combined into a single heap. The pairing heap does this via a **two-pass pairing** procedure:

**弹出最小。** 这是配对堆得名且真正干活的地方。移除根后留下一片孤儿子树森林——前根的孩子，排成一个兄弟链表。这些子树必须合并成一个堆。配对堆通过一个**两趟配对**过程来完成：

- **Pass 1 (left-to-right pairing):** Walk the sibling list from left to right. Pair up consecutive siblings: merge the first with the second, the third with the fourth, and so on. Each merge produces a single tree. After this pass, the number of trees is halved.
  **第一趟（从左到右配对）：** 从左到右遍历兄弟链表。将连续的兄弟配对：第一个与第二个合并，第三个与第四个合并，以此类推。每次合并产生一棵树。此趟之后，树的数量减半。

- **Pass 2 (right-to-left accumulation):** Take the trees produced by Pass 1 and merge them from right to left: merge the rightmost tree into the second-rightmost, then merge the result into the third-rightmost, and so on, until a single tree remains. This becomes the new root.
  **第二趟（从右到左累积）：** 取第一趟产生的树，从右到左合并：将最右边的树合并进倒数第二个，然后将结果合并进倒数第三个，以此类推，直到剩下一棵树。这成为新的根。

The two-pass process costs \(O(k)\) where \(k\) is the number of children of the old root. Amortized analysis (using a potential function based on node degrees) shows that this cost averages to \(O(\log n)\) across a sequence of operations.

两趟过程的代价为 \(O(k)\)，其中 \(k\) 是旧根的孩子数。均摊分析（使用基于节点度数的势函数）表明，在一系列操作中，这一代价平均为 \(O(\log n)\)。

```
Extract-min with pairing. Before deletion, the root has children
A, B, C, D, E (as a linked list of siblings).

Pass 1: pair A-B → AB, pair C-D → CD, E remains alone.
        Resulting trees: AB, CD, E.

Pass 2: accumulate right-to-left: merge E into CD → CDE.
        merge CDE into AB → ABCDE. This is the new root.
```

```
配对堆的弹出最小操作。删除前，根的孩子为 A, B, C, D, E（作为兄弟链表）。

第一趟：配对 A-B → AB，配对 C-D → CD，E 落单。
        结果树：AB, CD, E。

第二趟：从右到左累积：将 E 合并进 CD → CDE。
        将 CDE 合并进 AB → ABCDE。这就是新根。
```

**Decrease-key.** This is the operation that gives the pairing heap its advantage over the binary heap. Given a pointer to a node whose key is to be decreased, the algorithm updates the key. If the node is the root, nothing more is needed. If the node is not the root, it is **cut** from its parent and **linked** with the root using the same single-comparison link operation as insertion. This is \(O(1)\). The cut node may carry its own subtree with it — those children remain attached throughout. No cascading cuts occur. The simplicity of this operation — cut and link to root — is the pairing heap's killer feature.

**Decrease-key。** 这是赋予配对堆相对二叉堆优势的操作。给定指向要降低键值的节点的指针，算法更新键值。若节点是根，无需更多操作。若节点不是根，将其从父节点**切下**并与根**链接**，使用和插入一样的单次比较链接操作。这是 \(O(1)\)。被切节点可以携带自己的子树——那些孩子全程保持附着。不发生级联切割。此操作的简洁——切下并链接到根——是配对堆的杀手锏。

**Practical standing.** The pairing heap's amortized \(O(1)\) for `decrease-key` is, strictly speaking, a conjecture — no one has proven a matching lower bound or found a counterexample. Fredman proved an amortized \(O(\log n)\) bound in 1999, and Pettie proved an amortized \(O(2^{2\sqrt{\log \log n}})\) bound in 2005, but the exact tight bound remains an open problem. Despite this theoretical gap, the pairing heap is the practical winner in most empirical studies. Its code fits on a single screen. Its constant factors are tiny. It has no auxiliary arrays, no degree-dependent consolidation tables, and no cascading-cut machinery. In benchmarks comparing heap implementations for Dijkstra's algorithm, Prim's algorithm, and event-driven simulations, the pairing heap consistently finishes near or at the top — often beating both the binary heap (because of cheaper `decrease-key`) and the Fibonacci heap (because of much smaller constants, even though Fibonacci has asymptotically better amortized bounds).

**实践地位。** 配对堆在 `decrease-key` 上的均摊 \(O(1)\) 严格来说是一个猜想——没有人证明过一个匹配的下界，也没有找到反例。Fredman 在 1999 年证明了均摊 \(O(\log n)\) 界限，Pettie 在 2005 年证明了均摊 \(O(2^{2\sqrt{\log \log n}})\) 界限，但确切的紧界限仍是一个开放问题。尽管存在这一理论空白，配对堆在大多数实证研究中是实践上的赢家。它的代码能装在一个屏幕上。它的常数因子极小。它没有辅助数组，没有依赖度数的合并表，没有级联切割机制。在比较 Dijkstra 算法、Prim 算法和事件驱动模拟的堆实现的基准测试中，配对堆始终接近或位于顶端——经常同时击败二叉堆（因为更便宜的 `decrease-key`）和斐波那契堆（因为常数因子小得多，尽管斐波那契有渐近更优的均摊界限）。

**The lesson.** The pairing heap embodies a recurring theme in algorithm engineering: simplicity often beats complexity in practice, even when complexity has better theoretical credentials. If the Fibonacci heap is the Ferrari of priority queues — breathtaking on paper, finicky to build — the pairing heap is the well-tuned sports sedan: easier to manufacture, fast enough on real roads, and far more likely to be seen in actual use.

**教训。** 配对堆体现了算法工程中反复出现的主题：在实践中，简单经常击败复杂，即使复杂有更好的理论证明。如果斐波那契堆是优先队列中的法拉利——纸上惊艳，制造精细——配对堆就是精心调校的运动轿车：更容易制造，在真实道路上足够快，而且在实际使用中更可能见到。

## Afterword / 跋

With this, we close our survey of heap variants — from the humble array-based binary heap through the mergeable forests of leftist, binomial, and Fibonacci heaps, to the pragmatic D-ary and pairing heaps. For the working programmer, however, the honest postscript is this: beyond the binary heap, almost none of these structures appear in everyday production code. As we mentioned before - The C++ Standard Library's `std::priority_queue` is a binary heap. Java's `java.util.PriorityQueue` is a binary heap. Python's `heapq` module is a binary heap. Go's `container/heap` package is a binary heap. The world's infrastructure runs on binary heaps — and it runs just fine. The more exotic structures we have studied are not useless, but their utility is concentrated in two narrow domains: theoretical computer science, where they settle fundamental questions about the optimal complexity of graph algorithms; and highly specialized systems — think network flow solvers, large-scale event simulators, or certain in-memory databases — where micro-optimizing a specific operation like `decrease-key` or `merge` yields measurable gains. For the vast majority of software that most of us will ever write, the binary heap is not merely adequate — it is optimal in the only metric that matters in production: it is simple, it is fast, and every engineer who reads the code already understands it. So why study the rest? Because understanding what lies beyond the binary heap — knowing that the Fibonacci heap exists and what it achieves, even if you never implement one — shapes how you think about amortized analysis, deferred work, and the trade-offs that lurk behind every abstraction. It is the difference between knowing how to use a tool and understanding why it works. And that understanding, even if it never leaves the whiteboard, is what turns a programmer into a computer scientist.

至此，我们结束了对堆变体的巡览——从谦卑的基于数组的二叉堆，经过左偏堆、二项堆和斐波那契堆的可合并森林，到实用的 D-叉堆和配对堆。然而，对于一个工作中的程序员而言，诚实的后记是：在二叉堆之外，这些结构几乎没有出现在日常的生产代码中。就像我们在前面说过的，C++ 标准库的 `std::priority_queue` 是二叉堆。Java 的 `java.util.PriorityQueue` 是二叉堆。Python 的 `heapq` 模块是二叉堆。Go 的 `container/heap` 包是二叉堆。世界的基础设施在二叉堆上运行——而且运行得很好。我们研究过的更奇特的结构并非无用，但它们的用途集中在两个狭窄的领域：理论计算机科学，它们在那里解决关于图算法最优复杂度的基本问题；以及高度专门化的系统——比如网络流求解器、大规模事件模拟器或某些内存数据库——在那里对某个特定操作（如 `decrease-key` 或 `merge`）进行微观优化可以带来可测量的收益。对于我们大多数人将编写的大多数软件而言，二叉堆不仅仅是足够好——它在生产环境中唯一重要的度量标准上是最优的：它简单，它快，而且每个读到代码的工程师都已然理解它。那么为什么要研究其余的部分？因为理解二叉堆之外存在什么——知道斐波那契堆的存在及其成就，即使你从未实现过——塑造了你对均摊分析、延迟工作以及潜伏在每个抽象背后的权衡的思考方式。这便是知道如何使用工具和理解工具为何如此工作之间的区别。而这种理解，即便从未离开白板，正是将程序员转变为计算机科学家的东西。
