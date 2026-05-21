# Minimum Heap and Optimal Merge Cost

<!--preview: 如何用最小堆的性质优雅解决最优合并成本问题？-->

# 最小堆与最优合并成本

## 1. The Problem / 问题描述

The data structures course gave me this problem:

数据结构课上老师出了这样一道题：

> Given N integer arrays of different sizes, merge them into a single array with the minimum cost. The cost to merge two arrays is defined as the sum of their lengths. For example, `arr[] = {4, 3, 2, 6}`, the total cost is 29.

直观上的策略是每次选最小的两个数组来合并——先把 2 和 3 合并（成本 5），再把 4 和 5 合并（成本 9），最后把 6 和 9 合并（成本 15），总成本 5 + 9 + 15 = 29。这个贪心策略是对的，问题在于：如何高效地反复从集合中取出最小值？

## 2. From Naive Sorting to a Heap / 从全排序到堆的跨越

My first instinct was brutally straightforward: sort the entire array every time, take the first two elements, merge them, insert the result back, and repeat. The sorting alone is O(n log n), and doing it for each of the n-1 merge rounds yields O(n² log n) — clearly unacceptable for anything beyond a toy input.

我的第一反应粗暴又直接：每轮都要挑最小的，那就每轮都排序一次，取前两个，合并，把结果塞回去，然后下一轮。排序本身 O(n log n)，做 n-1 轮合并，总复杂度高达 O(n² log n)——数据稍微大一点就受不了。

But then I stepped back and asked: what do I actually need? I don't need the whole array sorted. I only need to repeatedly extract the _two smallest_ elements and insert one new element. This is exactly what a min-heap provides. Pushing n elements into the heap takes O(n) if done cleverly, and each pop/push operation is O(log n). For n-1 merge rounds (each doing two pops and one push), the total is O(n log n). The heap turns a quadratic nightmare into linearithmic elegance — and unlike quick-sort or merge-sort, we didn't even cover sorting heavily in class. It felt like I had reached for the right tool from the toolbox, not just the one I'd been handed.

但转念一想：我真的需要整个数组有序吗？我只需要反复做两件事：取出两个最小值，插入一个新值。这不正是最小堆的用武之地吗？把 n 个元素压入堆中，每次弹出和插入都是 O(log n)，n-1 轮合并下来总复杂度 O(n log n)。堆把一个平方级噩梦变成了线性对数级的优雅解法——而且我们课堂上其实不怎么讲排序算法，这让我感觉自己是主动从工具箱里找到了正确的家伙，而不是只会用老师塞过来的那一把。

## 3. The Min-Heap in C / C 语言手写最小堆

Since this was an in-class assessment, everything had to be handwritten. The heap uses a classic array representation:

既然是课堂小测，一切都要手写。我用了最经典的数组表示法：

```c
typedef struct {
    int *data;
    int size;
    int capacity;
} MinHeap;
```

Left child at `2 * index + 1`, right child at `2 * index + 2`, parent at `(index - 1) / 2`. The two core maintenance operations are:

左孩子在 `2 * index + 1`，右孩子在 `2 * index + 2`，父节点在 `(index - 1) / 2`。两个核心的维护操作是：

**`heapifyUp`** — called after insertion. The newly appended element "bubbles up" by comparing with its parent and swapping if smaller, repeating until the heap property is restored.
**`heapifyUp`**——在插入后调用。新追加的元素和父节点比较，如果比父节点小就交换，不断上浮直到堆性质恢复。

**`heapifyDown`** — called after extracting the root. The last element is moved to the root position, then "sinks down" by comparing with its two children and swapping with the smaller one if needed, repeating recursively until the heap property is restored.
**`heapifyDown`**——在弹出堆顶后调用。最后一个元素被挪到根的位置，然后和两个子节点中较小的那个比较并交换，不断下沉直到堆性质恢复。

The full implementation is in the appendix. The core algorithm using the heap is strikingly clean:

完整实现见附录。核心算法用堆写出来异常简洁：

```c
while (heap->size > 1) {
    int first = pop(heap);
    int second = pop(heap);
    int mergeCost = first + second;
    totalCost += mergeCost;
    push(heap, mergeCost);
}
```

Two pops, one push, accumulate — loop until one element remains. The data structure takes care of the rest.

两次弹出，一次压入，累加——循环到只剩一个元素。剩下的，数据结构帮你搞定。

## 4. The Hidden Connection: Huffman Coding / 隐藏的关联：Huffman 编码

After solving the problem, I learned something that elevated it from a classroom exercise to a genuinely interesting piece of computer science: this exact algorithm is also the core of Huffman coding.

解决这个问题后，我了解到一件事，让这道题从课堂练习跃升成了一个真正有趣的计算机科学原理：这个算法恰恰也是 Huffman 编码的核心。

Huffman coding is a compression technique that assigns shorter binary codes to frequently occurring symbols and longer codes to rare ones. The algorithm builds a binary tree bottom-up by repeatedly merging the two nodes with the smallest frequencies — exactly the same logic as merging the two smallest arrays by length. The "cost" of merging two arrays (sum of lengths) is analogous to the combined frequency of two symbols. The total cost of merging arrays corresponds to the weighted path length of the Huffman tree — which directly determines the total number of bits needed to encode the message. The greedy choice at each step is optimal, and the min-heap is the data structure that makes it efficient.

Huffman 编码是一种压缩技术：给高频出现的符号分配较短的二进制编码，给低频符号分配较长的编码。算法通过自底向上、每次合并两个频率最小的节点来构建二叉树——和每次合并两个长度最小的数组是完全一样的逻辑。合并两个数组的"成本"（长度之和）就对应着两个符号的频率之和。数组的合并总成本对应 Huffman 树的带权路径长度——这个值直接决定了编码整条消息所需的比特总数。每步的贪心选择都是最优的，而最小堆正是让这个选择高效运转的数据结构。

This connection matters because it shows that the problem isn't an abstract toy. Huffman coding is used in JPEG image compression, MP3 audio encoding, and the DEFLATE algorithm behind ZIP and gzip. The heap-powered greedy merge has shipped in billions of devices.

这个关联很有价值，因为它说明这道题不是抽象的玩具。Huffman 编码被用在 JPEG 图像压缩、MP3 音频编码、以及 ZIP 和 gzip 背后的 DEFLATE 算法中。这个用堆驱动的贪心合并，已经跑在了数以十亿计的设备上。

## 5. What I Took Away / 收获

The heap is fundamentally an ordering machine. It doesn't sort the whole collection — it answers a narrower question: "right now, who is the smallest?" and keeps that answer fresh as items enter and leave. In this problem, that's exactly what the greedy strategy needs: not a global ranking, but rapid access to the two current minima, each time an element disappears and a new one arrives. Recognizing when a problem asks for "repeated minimum extraction with insertions" — and reaching for a heap rather than a full sort — was the real insight. Everything else (the C implementation, the Huffman parallel) flows from that recognition.

堆本质上是一台“排序机器”，但它不为整个集合排序——它回答一个更窄的问题：“此时此刻，谁是最小的？”并在元素进出时让这个答案始终新鲜。在这道题里，贪心策略要的恰恰不是全局排名，而是在元素不断消失又新增的过程中，快速拿到当前的两个最小值。识别出“反复取最小、同时有插入”的模式，把手伸向堆而不是全排序——这才是真正的洞察。其余一切（C 语言实现、Huffman 的对应）都从这一层理解中自然流淌出来。

## 6. Extended Reading: Another Face of the Heap — The Top-K Problem / 延伸阅读：堆的另一面——Top-K 问题

A closely related problem that also hinges on heap usage is the Top-K problem: given an unordered array of N integers, find the K smallest elements. The naive approach is to sort the entire array and take the first K, at a cost of O(N log N). But a heap can do better.

与这道题密切相关、同样靠堆来解锁的还有 Top-K 问题：给定一个凌乱的整数数组，挑出其中最小的 K 个元素。直觉做法是全排列，取前 K 个，时间复杂度 O(N log N)。但堆可以做得更好。

The trick is to maintain a **max-heap** of size K — not a min-heap. First, push the initial K elements into the heap. Then, iterate through each remaining element: compare it with the heap's top (the largest among the current K candidates). If the new element is smaller than the top, pop the top and push the new element. After one pass through the array, the heap contains exactly the K smallest elements. Each heap operation is O(log K), and with N elements to scan, the total time is O(N log K). When K is small relative to N, this approaches O(N) — a substantial improvement over O(N log N) full sorting.

技巧是维护一个大小为 K 的**最大堆**，而不是最小堆。先把前 K 个元素丢进去，然后遍历剩余元素：每个都和堆顶（当前 K 个候选里最大者）比较，如果新元素比堆顶小，就弹出堆顶，压入新元素。遍历完整个数组，堆里的 K 个元素就是最小的。每次堆操作 O(log K)，扫描 N 个元素，总时间复杂度 O(N log K)。当 K 相对于 N 很小时，这近似于 O(N)——比全排序的 O(N log N) 提升显著。

The contrast is instructive. The array-merge problem uses a **min-heap** to repeatedly extract the two smallest items. The Top-K problem uses a **max-heap** to guard the threshold of the K smallest. Both bypass full sorting by asking the heap to maintain exactly the partial ordering they need — and nothing more. That, in essence, is what makes a heap a heap.

这种对比很有启发性。合并问题用**最小堆**反复取最小的两个；Top-K 问题用**最大堆**来守护“K 个最小”的门槛。两者都绕开了全排序，让堆恰好维护它们需要的那一点点局部顺序——不多，也不少。这，本质上就是堆之所以为堆的原因。

## Appendix: Full C Implementation / 附录：完整 C 语言实现

```c
#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int *data;
    int size;
    int capacity;
} MinHeap;

MinHeap* createHeap(int capacity) {
    MinHeap *heap = (MinHeap*)malloc(sizeof(MinHeap));
    heap->capacity = capacity;
    heap->size = 0;
    heap->data = (int*)malloc(capacity * sizeof(int));
    return heap;
}

void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

void heapifyUp(MinHeap *heap, int index) {
    int parent = (index - 1) / 2;
    while (index > 0 && heap->data[index] < heap->data[parent]) {
        swap(&heap->data[index], &heap->data[parent]);
        index = parent;
        parent = (index - 1) / 2;
    }
}

void heapifyDown(MinHeap *heap, int index) {
    int left = 2 * index + 1;
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

void push(MinHeap *heap, int value) {
    if (heap->size == heap->capacity) return;
    heap->data[heap->size] = value;
    heapifyUp(heap, heap->size);
    heap->size++;
}

int pop(MinHeap *heap) {
    if (heap->size == 0) return -1;
    int min = heap->data[0];
    heap->data[0] = heap->data[heap->size - 1];
    heap->size--;
    heapifyDown(heap, 0);
    return min;
}

int minMergeCost(int arr[], int n) {
    MinHeap *heap = createHeap(n);
    for (int i = 0; i < n; i++) {
        push(heap, arr[i]);
    }

    int totalCost = 0;
    while (heap->size > 1) {
        int first = pop(heap);
        int second = pop(heap);
        int mergeCost = first + second;
        totalCost += mergeCost;
        push(heap, mergeCost);
    }

    free(heap->data);
    free(heap);
    return totalCost;
}

int main() {
    // Details omitted.
}
```
