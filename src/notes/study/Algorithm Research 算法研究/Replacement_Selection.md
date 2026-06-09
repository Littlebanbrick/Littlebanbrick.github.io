# Replacement Selection: Generating Longer Runs with a Heap

<!-- preview: 拆解 Replacement Selection 如何突破内存限制、生成更长的初始归并段。-->

# 替换选择：用堆生成更长的归并段

## 1. The Bottleneck of External Sorting / 外排序的瓶颈

In the standard two-phase external sort, Phase 1 reads chunks of size \(M\) into memory, sorts them internally, and writes each as a sorted run. The number of runs is therefore \(\lceil N/M \rceil\). Phase 2 merges these runs with a multi-way merge. If the number of runs is large, the merge phase becomes expensive — each pass over the data costs \(O(N)\) I/O, and the number of passes grows with the logarithm of the run count. Reducing the number of initial runs directly reduces the I/O cost of the entire sort. This is exactly the problem that **replacement selection** solves.

在标准的二阶段外排序中，第一阶段将大小为 \(M\) 的数据块读入内存、内部排序、然后写成有序的归并段。因此归并段的数量是 \(\lceil N/M \rceil\)。第二阶段用多路归并合并这些段。如果段的数量很大，归并阶段就会很昂贵——每一趟扫描数据需要 \(O(N)\) 的 I/O，而扫描趟数随段数量的对数增长。减少初始段的数量能直接降低整个排序的 I/O 开销。这正是**替换选择**要解决的问题。

Replacement selection, described by Donald Knuth in 1965, generates initial runs whose average length is about **2M** for random input — double the memory capacity — and can produce a single run covering the entire file if the input is already sorted. The mechanism behind this is a min-heap with a small but crucial twist.

Donald Knuth 在 1965 年描述的替换选择算法，对于随机输入生成的初始归并段平均长度约为 **2M**——是内存容量的两倍——而且如果输入已经有序，它可以生成覆盖整个文件的单个段。其背后的机制是一个带有微小但关键变化的最小堆。

## 2. Intuition: A Classroom Queue / 算法直觉：教室排队

Imagine a classroom that can hold at most \(M\) students at a time. Students outside are waiting to enter. We want to group them into batches, each batch leaving the classroom in ascending order of height. The rule is: always let the shortest student in the room leave first. After a student leaves, the next student waiting outside enters. If the new student is *shorter* than the one who just left, he cannot join the current batch — otherwise the output sequence would not be ascending — so we mark him as belonging to the *next* batch. When all students remaining in the room belong to the next batch, the current batch ends, we start a new batch, and the process continues.

想象一间最多能容纳 \(M\) 个学生的教室，外面有学生在等候。我们要把他们分批，每批按身高升序离开教室。规则是：总是让教室里最矮的学生先离开。一个学生离开后，外面等候的下一个学生进来。如果新进来的学生比刚刚离开的那个*还矮*，他就不能加入当前这一批——否则输出的序列就不是升序了——于是我们把他标记为属于*下一批*。当教室里剩下的所有学生都属于下一批时，当前这批结束，我们开始新的一批，如此继续。

This metaphor maps directly onto the algorithm. The classroom is a min-heap of capacity \(M\). "Let the shortest leave" is an extract-min operation. "Next student enters" is a push operation. "Mark as next batch" means assigning a run number to the record. When the heap root belongs to a run higher than the current one, we know the current run is finished and we switch.

这个比喻直接映射到算法上。教室就是容量为 \(M\) 的最小堆。“最矮的离开”是弹出最小值操作。“下一个进来”是压入操作。“标记为下一批”就是给记录分配一个段号。当堆顶的段号高于当前段号时，我们就知道当前段结束了，需要切换。

## 3. The Data Structure: Record and Dual Comparison / 数据结构：Record 与双重比较

The classroom metaphor is clean, but turning it into code reveals a hidden complexity. Each element in the heap is not just a key — it is a **record** containing both the key and a run number. This tiny structural change forces us to think carefully about how the heap compares elements.

教室比喻很干净，但把它变成代码时会揭示一个隐藏的复杂性。堆中的每个元素不只是一个键值——它是一个**记录**，同时包含键值和段号。这个微小的结构变化迫使我们仔细思考堆如何比较元素。

```c
typedef struct {
    int key;   // the actual value
    int run;   // which run this record belongs to
} Record;
```

The heap must maintain the min-heap property, but "minimum" is now defined by a two-level rule: first compare by run number, then by key. Records belonging to the current run are considered smaller than any record belonging to a later run, regardless of their keys. Within the same run, the smaller key wins. This is captured by a single comparator:

堆必须维护最小堆性质，但“最小”现在由一个两级规则定义：先按段号比较，再按键值比较。属于当前段的记录被视为比任何属于后续段的记录更小，无论它们的键值如何。在同一段内，键值较小的胜出。这可以由一个比较器捕捉：

```c
bool recordGreater(Record a, Record b) {
    if (a.run != b.run) return a.run > b.run;   // later run is "larger"
    return a.key > b.key;                        // within same run, larger key is "larger"
}
```

This comparator is the heart of replacement selection. It guarantees that as long as the current run still has records in the heap, the root will always be the smallest among them. Records of the next run are effectively frozen at the bottom of the heap, unable to rise to the top until all current-run records have been extracted.

这个比较器是替换选择的心脏。它保证了只要当前段在堆中还有记录，根就永远是其中最小的。下一段的记录被有效地冻结在堆的底部，在所有当前段记录被提取完毕之前无法上升到堆顶。

There is a second comparison that happens outside the heap: when a new record enters, we must decide which run it belongs to. This decision uses *only the key*. If the new key is greater than or equal to the key of the record that just left, it belongs to the current run; otherwise, it belongs to the next run. This rule is independent of the heap ordering — it is a property of the output sequence we are building.

还有第二个在堆之外发生的比较：当一个新记录进入时，我们必须决定它属于哪个段。这个决定*只使用键值*。如果新键值大于或等于刚刚离开的记录的键值，它就属于当前段；否则属于下一段。这条规则独立于堆的排序——它是我们正在构建的输出序列的性质。

```c
Record popAndReplace(MinHeap *heap, int newKey, int curRun) {
    Record top = heap->data[0];

    Record newRec;
    newRec.key = newKey;
    newRec.run = (newKey >= top.key) ? curRun : curRun + 1;

    heap->data[0] = newRec;
    heapifyDown(heap, 0);

    return top;
}
```

The separation between these two comparison rules — run-aware ordering inside the heap, key-only ordering outside — is the most subtle part of implementing replacement selection correctly. Mixing them up leads to incorrect run boundaries or corrupted heap structure.

这两种比较规则的分离——堆内部按段号排序，堆外部只按键值排序——是正确实现替换选择的最微妙之处。把它们混为一谈会导致错误的段边界或堆结构损坏。

## 4. The Algorithm in Three Phases / 算法三阶段

The main loop of replacement selection can be organized into three clean phases.

替换选择的主循环可以组织成三个清晰的阶段。

**Phase 1: Fill the classroom.** Read the first \(M\) records from the input, assign them all to run 0, and build a min-heap from them. The heap now contains \(M\) records, all belonging to the current run.

**阶段一：填满教室。** 从输入中读取前 \(M\) 个记录，全部分配到段 0，然后建堆。堆现在包含 \(M\) 个记录，全部属于当前段。

**Phase 2: Output and replace.** Repeat until input is exhausted. Extract the minimum from the heap (the root) and write it to the output as part of the current run. Read the next input value. If it is greater than or equal to the value just written, assign it to the current run; otherwise, assign it to the next run. Insert it into the heap. After each extraction, check whether the new root belongs to a different run from the one we are currently writing. If it does, the current run is finished: output a newline and switch to the next run number.

**阶段二：输出并替换。** 重复直到输入耗尽。从堆中提取最小值（根）并写入输出，作为当前段的一部分。读取下一个输入值。如果它大于或等于刚输出的值，将它分配到当前段；否则分配到下一段。将其插入堆中。每次提取后，检查新的根是否属于与当前正在写入的段不同的段。如果是，当前段结束：输出一个换行并切换到下一个段号。

**Phase 3: Flush the classroom.** When the input is exhausted, the heap still contains records spanning one or two runs. Continue extracting the minimum and writing it, switching runs whenever the root's run number changes, until the heap is empty.

**阶段三：清空教室。** 当输入耗尽时，堆中仍包含跨一个或两个段的记录。继续提取最小值并写入，每当根的段号改变时切换段，直到堆为空。

A small worked example makes this concrete. Let \(M = 3\) and the input be `[81, 94, 11, 96, 12, 99, 17, 35, 28, 58, 41, 75, 15]`.

一个小例子能让这一切具体起来。设 \(M = 3\)，输入为 `[81, 94, 11, 96, 12, 99, 17, 35, 28, 58, 41, 75, 15]`。

```
Load 81, 94, 11 → heap = [11(r0), 81(r0), 94(r0)]

Pop 11, read 96. 96 >= 11 → run 0. heap = [81(r0), 94(r0), 96(r0)]
Pop 81, read 12. 12 <  81 → run 1. heap = [94(r0), 96(r0), 12(r1)]
Pop 94, read 99. 99 >= 94 → run 0. heap = [96(r0), 12(r1), 99(r0)]
Pop 96, read 17. 17 <  96 → run 1. heap = [99(r0), 12(r1), 17(r1)]
Pop 99, read 35. 35 <  99 → run 1. heap = [12(r1), 17(r1), 35(r1)]

Now root is run 1, but we were writing run 0 → run 0 ends.
Output: 11 81 94 96 99  (run 0)

Switch to run 1.
Pop 12, read 28. 28 >= 12 → run 1. heap = [17(r1), 35(r1), 28(r1)]
Pop 17, read 58. 58 >= 17 → run 1. heap = [28(r1), 35(r1), 58(r1)]
Pop 28, read 41. 41 >= 28 → run 1. heap = [35(r1), 58(r1), 41(r1)]
Pop 35, read 75. 75 >= 35 → run 1. heap = [41(r1), 58(r1), 75(r1)]
Pop 41, read 15. 15 <  41 → run 2. heap = [58(r1), 75(r1), 15(r2)]
Pop 58, input exhausted.
Pop 75, input exhausted. Now root is run 2 → run 1 ends.
Output: 12 17 28 35 41 58 75  (run 1)

Switch to run 2.
Pop 15. Heap empty.
Output: 15  (run 2)
```

The result is three runs: `[11, 81, 94, 96, 99]`, `[12, 17, 28, 35, 41, 58, 75]`, `[15]`. With a standard internal sort, 13 records and \(M=3\) would produce 5 runs of length at most 3. Replacement selection produced only 3 runs, with the first two significantly longer than the memory limit.

结果是三个段：`[11, 81, 94, 96, 99]`，`[12, 17, 28, 35, 41, 58, 75]`，`[15]`。用标准的内排序，13 个记录和 \(M=3\) 会产生 5 个段，每个长度最多 3。替换选择只产生了 3 个段，前两个段明显长于内存容量。

## 5. Complexity and Run Length / 复杂度与段长度

Each record enters and leaves the heap exactly once, costing \(O(\log M)\) per operation. The total time is therefore \(O(N \log M)\). The real magic is in the *length* of the runs.

每个记录恰好进入和离开堆一次，每次操作代价 \(O(\log M)\)。总时间因此是 \(O(N \log M)\)。真正的魔法在于段的*长度*。

On random input, the expected run length is approximately \(2M\). The reason is probabilistic: as we extract the current smallest and insert a new random value, the probability that the new value can join the current run is initially high — roughly \(1 - 1/k\) after \(k\) values have been written in the run — and decays gradually. The expected number of records that can be added before the run ends is about \(2M\). If the input is already sorted in ascending order, every new record is larger than the last extracted one, so the current run never ends — a single run covers the entire file. If the input is sorted in descending order, every new record is smaller, so every record after the first \(M\) immediately starts a new run, and the run lengths degenerate to \(M\), identical to the naive method.

在随机输入上，期望段长度约为 \(2M\)。原因基于概率：当我们提取当前最小值并插入一个新的随机值时，新值能加入当前段的概率起初很高——在一个段已写入 \(k\) 个值后大约为 \(1 - 1/k\)——然后逐渐衰减。段结束前期望能添加的记录数约为 \(2M\)。如果输入已经是升序的，每个新记录都比上一个提取的大，所以当前段永远不会结束——一个段覆盖整个文件。如果输入是降序的，每个新记录都更小，所以前 \(M\) 个之后的每个记录都立即开始新段，段长度退化到 \(M\)，与朴素方法相同。

## 6. Where This Fits in the Larger Picture / 在更大图景中的位置

Replacement selection is not a standalone sorting algorithm. It is a run-generation step that feeds into a multi-way merge. If it reduces the number of initial runs from \(N/M\) to roughly \(N/(2M)\), then a \(k\)-way merge requires one fewer pass over the data. For massive datasets stored on tape or disk, eliminating a single full-data pass can cut total I/O time by a significant fraction. This is why replacement selection has been a standard component of external sorting systems for decades.

替换选择不是一个独立的排序算法。它是一个生成归并段的步骤，为多路归并提供输入。如果它将初始段数量从 \(N/M\) 降到约 \(N/(2M)\)，那么 \(k\) 路归并就少了一趟完整的数据扫描。对于存储在磁带或磁盘上的海量数据集，省去一趟全数据扫描可以将总 I/O 时间削减相当大的一部分。这就是为什么替换选择几十年来一直是外排序系统的标准组件。

## Appendix: Full Implementation / 附录：完整实现

```c
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

#define MAXN 10000

typedef struct {
    int key;
    int run;
} Record;

bool recordGreater(Record a, Record b) {
    if (a.run != b.run) return a.run > b.run;
    return a.key > b.key;
}

typedef struct {
    int size;
    int capacity;
    Record *data;
} MinHeap;

MinHeap *createHeap(int capacity) {
    MinHeap *heap = (MinHeap *)malloc(sizeof(MinHeap));
    if (!heap) exit(1);
    heap->data = (Record *)malloc(sizeof(Record) * capacity);
    if (!heap->data) { free(heap); exit(1); }
    heap->size = 0;
    heap->capacity = capacity;
    return heap;
}

void heapifyDown(MinHeap *heap, int index) {
    int size = heap->size;
    Record *arr = heap->data;
    while (1) {
        int left = 2 * index + 1;
        int right = 2 * index + 2;
        int smallest = index;
        if (left < size && recordGreater(arr[smallest], arr[left]))
            smallest = left;
        if (right < size && recordGreater(arr[smallest], arr[right]))
            smallest = right;
        if (smallest == index) break;
        Record tmp = arr[index];
        arr[index] = arr[smallest];
        arr[smallest] = tmp;
        index = smallest;
    }
}

void buildHeap(MinHeap *heap) {
    for (int i = heap->size / 2 - 1; i >= 0; i--)
        heapifyDown(heap, i);
}

Record popMin(MinHeap *heap) {
    Record top = heap->data[0];
    heap->data[0] = heap->data[--heap->size];
    if (heap->size > 0) heapifyDown(heap, 0);
    return top;
}

Record popAndReplace(MinHeap *heap, int newKey, int curRun) {
    Record top = heap->data[0];
    Record newRec;
    newRec.key = newKey;
    newRec.run = (newKey >= top.key) ? curRun : curRun + 1;
    heap->data[0] = newRec;
    heapifyDown(heap, 0);
    return top;
}

int main() {
    int N, M;
    scanf("%d %d", &N, &M);

    int input[MAXN];
    for (int i = 0; i < N; i++) scanf("%d", &input[i]);

    MinHeap *heap = createHeap(M);
    int i;
    for (i = 0; i < M && i < N; i++) {
        heap->data[i].key = input[i];
        heap->data[i].run = 0;
        heap->size++;
    }
    buildHeap(heap);

    int curRun = 0;
    int inputIdx = i;
    int firstElem = 1;

    while (heap->size > 0) {
        if (heap->data[0].run != curRun) {
            curRun = heap->data[0].run;
            printf("\n");
            firstElem = 1;
        }

        Record top;
        if (inputIdx < N) {
            top = popAndReplace(heap, input[inputIdx], curRun);
            inputIdx++;
        } else {
            top = popMin(heap);
        }

        if (!firstElem) printf(" ");
        printf("%d", top.key);
        firstElem = 0;
    }
    printf("\n");

    free(heap->data);
    free(heap);
    return 0;
}
```