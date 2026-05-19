# Prim, Kruskal and Unique MST

<!-- preview: 怎么从零实现Prim和Kruskal算法？怎么进行MST的唯一性判定？-->

# Prim, Kruskal 算法和唯一最小生成树

## 1. The Problem / 问题引入

A programming assignment in my data structures course posed this: given an undirected weighted graph, compute its Minimum Spanning Tree and its total weight, then determine whether this MST is unique.

数据结构课的一道作业题要求：给定一个无向带权图，求出其最小生成树及其总权重，并判定这棵最小生成树是否是唯一的。

A spanning tree of a graph is a subgraph that connects all vertices without cycles; a *minimum* spanning tree is one whose total edge weight is minimal among all possible spanning trees. Uniqueness means exactly one such tree achieves that minimum total weight. Different MSTs on the same graph share the same total weight but differ in at least one edge. The question of uniqueness forces us to ask whether two or more edges of equal weight can substitute for each other while preserving the tree structure and keeping the total weight unchanged.

生成树是连接所有顶点且无环的子图；最小生成树是所有可能生成树中边权总和最小的那棵。唯一性意味着只有一个这样的树能达到最小总权重。同一张图上的不同 MST 总权重相同，但至少有一条边不同。唯一性问题迫使我们追问：是否存在两条或以上的等权边，在保持树结构且总权重不变的前提下可以互相替代？

## 2. Prerequisite: Disjoint-Set Union / 前置知识：并查集

The disjoint-set union (DSU), or union-find, is a data structure that manages a collection of non-overlapping sets. It answers two questions: "are these two elements in the same set?" and "merge these two sets into one." In graph algorithms, it is almost custom-built for Kruskal's algorithm — we need to repeatedly check whether two vertices already belong to the same connected component, and if not, merge those components after adding an edge.

并查集是一种管理不相交集合的数据结构，解决两个核心问题：两个元素是否属于同一个集合，以及将两个集合合并。在图论中，它几乎就是为 Kruskal 算法定制的——我们需要反复检查“这条边的两个端点是否已经在同一个连通分量中”，以及“将这条边加入后合并这两个分量”。

The simplest implementation uses a single `parent` array. `parent[x]` points to x's parent node; if x is the root of its set, `parent[x]` either points to itself or stores a sentinel value like -1 (with the absolute value optionally representing the size of the set). Two operations follow naturally:

最简实现只需要一个 `parent` 数组。`parent[x]` 表示 x 的父节点；如果 x 是集合的根，`parent[x]` 指向自身或用 -1 等哨兵值表示（其绝对值可用来存储集合大小）。两个核心操作自然浮现：

**Find**: follow the parent chain upward until reaching the root. Path compression — during the walk back, reassign all nodes along the path to point directly at the root — collapses the tree and makes subsequent lookups nearly O(1). Without path compression, the tree can degenerate into a chain, turning find into O(n).

**查找**：沿父指针链向上追溯到根。路径压缩——在回溯时将路径上经过的所有节点直接指向根——能让树的深度极浅，后续查找接近 O(1)。没有路径压缩，树可能退化成链，查找退化为 O(n)。

**Union**: find the roots of the two elements. If they differ, attach one root under the other. To keep the tree balanced, union by rank or by size — always attach the smaller tree under the larger one. In code that uses -1 initialization, a negative `parent[root]` stores the negated set size, and union compares sizes before deciding which root absorbs the other.

**合并**：找到两个元素的根，若不同，将其中一个根挂在另一个根下。为了控制树高，采用按秩合并或按大小合并——总是让小树并入大树。在 -1 初始化的实现中，`parent[root]` 的负数存储集合大小，合并时比较大小再决定谁吞并谁。

With both path compression and union by size, the amortized complexity per operation is O(α(n)), where α is the [inverse Ackermann function](https://en.wikipedia.org/wiki/Ackermann_function) — so slow-growing that it's effectively constant for any real problem size.

同时使用路径压缩和按大小合并后，每次操作的均摊复杂度为 O(α(n))，其中 α 是[反阿克曼函数](https://zh.wikipedia.org/wiki/%E9%98%BF%E5%85%8B%E6%9B%BC%E5%87%BD%E6%95%B8#%E5%8F%8D%E5%87%BD%E6%95%B8)——增长极慢，对任何实际问题规模都可视作常数。

In Kruskal's algorithm, the DSU checks "will this edge form a cycle?" in near-constant time: two vertices already in the same set means adding the edge creates a cycle, so skip it; otherwise, union the sets and accept the edge.

在 Kruskal 算法中，并查集以近乎常数的代价完成“是否会成环”的判断：两个端点已在同一集合中，加入必成环，跳过；否则合并集合并接受此边。

## 3. Kruskal's Algorithm / Kruskal 算法

Kruskal's algorithm embodies the idea of "global greed, edge by edge." It ignores the graph's topology and only cares about edge weights. The procedure:

Kruskal 算法的思想是“全局贪心，按边选取”。它不关心图的拓扑结构，只关心边的权重。过程如下：

1. Sort all edges by weight in ascending order.
   将所有边按权重升序排序。

2. Initialize a DSU where each vertex is its own component.
   初始化并查集，每个顶点各自为一个独立分量。

3. Iterate through sorted edges in order. For each edge, if its two endpoints belong to different components, add it to the MST and union the two components. If they already share a component, skip the edge — it would create a cycle.
   按序依次考虑每条边。若两端点属于不同连通分量，将边加入 MST 并合并两分量；若已属于同一分量，跳过，否则会形成回路。

4. Stop when V-1 edges have been selected. If all edges are exhausted before reaching V-1, the graph is disconnected.
   当选中 V-1 条边时终止。若遍历完仍未达 V-1，图不连通。

Complexity: sorting dominates at O(E log E). The DSU operations contribute roughly O(E α(V)), which is effectively linear in E. **The overall bottleneck is sorting**.

复杂度：排序是瓶颈，O(E log E)。并查集操作约 O(E α(V))，近似线性于 E。**总复杂度由排序主导**。

(A small real-world lesson here: when I first implemented Kruskal, my program kept hitting time limits despite no logical errors in the algorithm itself. After some head-scratching, I realized the bottleneck was the sorting step — I had carelessly thrown in an O(n²) bubble sort, treating sorting as an afterthought. The course had never emphasized sorting efficiency in the context of MST, so I had simply used what felt most familiar. Replacing the bubble sort with the standard library `qsort()` instantly resolved the timeouts. The takeaway: Kruskal's complexity truly is bounded by the sort; a quadratic sort will poison the entire algorithm, no matter how optimized the DSU is.)

（这里有一个真实的教训：我最开始实现 Kruskal 时程序总是超时，算法逻辑本身没有错误。排查后才发现瓶颈出在了排序——我随手写了一个 O(n²) 的冒泡排序，从来没有想过排序的复杂度也会影响 MST。课程中也从未强调这一点，于是我用了最熟悉的方式。把排序换成标准库的 `qsort()` 后，超时问题立刻消失。教训就是：Kruskal 的时间复杂度真的卡在排序上，一个平方级的排序足以拖垮整个算法，不管你的并查集优化得多好。）

A key structural feature of Kruskal: it processes edges in weight groups. All edges of equal weight are examined consecutively. This is precisely the property that makes uniqueness checking tractable — we can analyze each weight group for substitutability before committing any of its edges.

Kruskal 的一个关键结构特征：它按权重组处理边，等权边被连续考察。这正是唯一性判定可以介入的地方——我们可以在实际提交任何等权边之前，先分析这批边之间的替代关系。

## 4. Prim's Algorithm / Prim 算法

Prim's algorithm embodies the idea of "local greed, expanding a point set." It maintains a growing set of visited vertices and repeatedly selects the cheapest edge crossing the cut between visited and unvisited vertices. The procedure:

Prim 算法的思想是“局部贪心，点集扩张”。它维护一个不断增长的已访问点集，每次从这个点集连向外部的所有边中选一条最小的。过程如下：

1. Choose an arbitrary start vertex, mark it as visited.
   任选起点，标记为已访问。

2. Maintain all candidate edges that connect the visited set to the unvisited set. In each iteration, pick the one with minimum weight, add its unvisited endpoint to the visited set, and refresh the candidate pool with edges incident to this new vertex.
   维护连接已访问集合与未访问集合的所有候选边。每轮选最小的一条，将新端点纳入已访问集，并用新端点引出的边更新候选池。

3. Repeat until all vertices are visited, or the candidate pool is empty (meaning the graph is disconnected).
   重复直到所有顶点已访问，或候选边耗尽（图不连通）。

Complexity: a naive implementation scans all vertices to find the minimum each round, yielding O(V²) — ideal for dense graphs. A binary heap optimization brings it to O((V+E) log V); a Fibonacci heap can push it further to O(E + V log V).

复杂度：朴素实现每轮 O(V) 扫描找最小，总 O(V²)，适合稠密图；二叉堆优化到 O((V+E) log V)；斐波那契堆可进一步到 O(E + V log V)。

Prim's critical trait: it builds the MST organically from a single root outward. Decisions depend on the structure already built. For uniqueness checking, this means the information "were there multiple equal-weight candidates at any step?" is scattered across iterations and requires extra bookkeeping to collect — a starker contrast to Kruskal's weight-group processing, which we'll explore next.

Prim 的关键特质：它从一个根节点有机地向外生长，决策依赖于已构建的结构。对于唯一性判定，这意味着“某一步是否存在多条等权候选边”的信息分散在各轮迭代中，需要额外记账才能收集——这与 Kruskal 按权重组处理的便利性形成鲜明对比，我们马上会看到。

## 5. Uniqueness Checking in Kruskal / Kruskal 的唯一性判定

### 5.1 When is an MST not unique? / 什么时候 MST 不唯一？

An MST becomes non-unique when there exists an alternative edge of the same weight that can replace a tree edge without increasing the total cost and without breaking the spanning tree property. In Kruskal, this occurs within a single weight group: two or more edges of equal weight connect the same pair of components. If edge A connects component X to component Y, and edge B also connects X to Y with the same weight, then choosing A versus B produces two different MSTs.

当存在另一条等权边可以替换树中某条边、不增加总权重且不破坏生成树性质时，MST 就不唯一。在 Kruskal 中，这发生在同一个权重组内：两条或以上的等权边连接了相同的一对连通分量。如果边 A 连接分量 X 和 Y，边 B 同样连接 X 和 Y 且权重相等，那么选 A 和选 B 就是两棵不同的 MST。

### 5.2 The core idea: a temporary DSU / 核心思路：临时并查集

Before we commit any edge from a weight group, we need to detect whether multiple edges in that group connect the same pair of components. However, if we merge components directly in the real DSU, the first edge will union X and Y, making subsequent edges between X and Y appear to be intra-component (they would find the same root) — and the alternative would be invisible.

在将权重组中的任何边实际提交之前，我们需要检测该组内是否有多条边连接了相同的一对分量。但如果直接在真实并查集上合并，第一条边会合并 X 和 Y，后续连接 X 和 Y 的边会看起来像是在同一个分量内（它们会找到相同的根）——替代方案就看不到了。

The solution: a temporary DSU. Copy the current state of the real DSU (which reflects all edges from previous, strictly lighter weight groups) into a `tmp_parent` array. Process all edges of the current weight group using only this temporary DSU, and check: if two edges both connect component A to component B (i.e., after the first edge's temporary union, the second edge finds its endpoints' roots already connected in `tmp_parent`), then those two edges are substitutable, and the MST is not unique.

解决方案：临时并查集。将真实并查集的当前状态（反映了所有之前、严格更轻权重组中已选边）复制到 `tmp_parent` 数组。只用这个临时并查集处理当前权重组中的所有边，检查：如果两条边都连接分量 A 和 B（即第一条边在临时并查集中合并后，第二条边发现两端点的根在 `tmp_parent` 中已经连通），那么这两条边可互相替代，MST 不唯一。

After the detection phase, we replay the same weight group against the *real* DSU, actually merging components and adding edges to the MST as usual.

检测阶段结束后，再用同一批边操作*真实*并查集，实际合并分量、累计权重。

### 5.3 A concrete walkthrough / 一个具体的例子

Suppose we have three components labeled 1, 2, and 3. The current weight group contains three edges, all weight 5: edge A connects 1-2, edge B connects 1-2, edge C connects 2-3.

假设有三个分量标记为 1、2、3。当前权重组有三条边，权重均为 5：边 A 连接 1-2，边 B 连接 1-2，边 C 连接 2-3。

Without the temporary DSU: the real DSU would process edge A, merge 1 and 2, then process edge B, find 1 and 2 already in the same component, and skip it. Edge B's substitutability with A is missed.

没有临时并查集：真实并查集先处理 A，合并 1 和 2，然后处理 B，发现 1 和 2 已在同一分量，跳过。B 对 A 的可替代性就漏判了。

With the temporary DSU: copy the real DSU (all three components separate) into `tmp_parent`. Process edge A in the temporary DSU: 1 and 2 have different roots, so we union them in `tmp_parent`. Process edge B: 1 and 2 now share the same root in `tmp_parent`. The code detects `tru == trv` and sets `is_unique = false` — edge B is an alternative to edge A. Edge C connects 2 and 3, whose roots are different (2's root is now the merged 1-2 set, 3 is separate), so no conflict. The result: uniqueness is correctly flagged as false due to the A-B substitutability.

有临时并查集：将真实并查集（三个分量各自独立）复制到 `tmp_parent`。在临时并查集中处理边 A：1 和 2 根不同，合并。处理边 B：1 和 2 的根在 `tmp_parent` 中已经相同。代码检测到 `tru == trv`，设置 `is_unique = false`——边 B 是边 A 的替代。边 C 连接 2 和 3，根不同（2 的根现在是合并后的 1-2 集合，3 独立），无冲突。结果：唯一性因 A-B 的可替代性被正确标记为 false。

### 5.4 Reading the code step by step / 逐段解读代码

```c
int i = 0;
while (i < num_edge) {
    int j = i;
    while (j < num_edge && array[j].weight == array[i].weight)
        j++;
```

The outer loop iterates over weight groups. For each group, `[i, j)` spans all edges of equal weight. The inner `while` advances `j` until a different weight appears, defining the group boundary.

外层循环遍历权重组。对每一组，`[i, j)` 覆盖了所有等权边。内层 `while` 推进 `j` 直到出现不同权重，由此界定组的边界。

```c
    int tmp_parent[MAXV + 1];
    for (int v = 0; v <= num_vertex; v++)
        tmp_parent[v] = -1;

    for (int k = i; k < j; k++) {
        int u = array[k].from, v = array[k].to;
        int ru = find(parent, u);
        int rv = find(parent, v);
        if (ru != rv) {
            int tru = find(tmp_parent, ru);
            int trv = find(tmp_parent, rv);
            if (tru == trv) {
                *is_unique = false;
            } else {
                unionSets(tmp_parent, tru, trv);
            }
        }
    }
```

A fresh `tmp_parent` is initialized to -1 (all components separate). For each edge in this weight group: we find its endpoints' roots in the *real* DSU (`ru`, `rv`). If they already belong to the same real component, this edge is irrelevant (it would be skipped later anyway, and cannot create a substitutability because no alternative path is needed — the two endpoints were already connected by lighter edges). If they belong to different real components, we check the *temporary* DSU: if `tru == trv`, then another edge in this same weight group has already claimed the connection between these two components, so the current edge is an alternative — the MST is not unique. Otherwise, we record this pair's union in the temporary DSU.

`tmp_parent` 被初始化为 -1（所有分量独立）。对此权重组的每条边：先在*真实*并查集中找到端点的根（`ru`, `rv`）。若它们已属于同一真实分量，此边无关紧要（后面也会被跳过，且不会产生替代关系——两端点已被更轻的边连通）。若属于不同真实分量，再查*临时*并查集：若 `tru == trv`，说明同权重组中已有另一条边认领了这两个分量之间的连接，当前边就是替代方案——MST 不唯一。否则，在临时并查集中记录这对分量的合并。

```c
    for (int k = i; k < j; k++) {
        int u = array[k].from, v = array[k].to;
        int ru = find(parent, u);
        int rv = find(parent, v);
        if (ru != rv) {
            unionSets(parent, ru, rv);
            total += array[k].weight;
            edges_used++;
        }
    }

    i = j;
}
```

After the detection phase, the same weight group is replayed against the real DSU. Only edges connecting different components are actually added to the MST. The counter `edges_used` tracks how many edges have been selected so far.

检测阶段结束后，同一批边在真实并查集上重放。只有连接不同分量的边才会实际加入 MST。计数器 `edges_used` 跟踪已选边数。

```c
if (edges_used == num_vertex - 1) {
    return total;
} else {
    cc_count = 0;
    for (int v = 1; v <= num_vertex; v++)
        if (parent[v] < 0)
            cc_count++;
    return -1;
}
```

If exactly V-1 edges were selected, the graph is connected and we return the total weight (with `is_unique` set via the output parameter). Otherwise, we count the remaining components (`cc_count`) and return -1 to signal that no spanning tree exists.

若恰好选中 V-1 条边，图连通，返回总权重（`is_unique` 通过输出参数已设定）。否则统计剩余连通分量数（`cc_count`），返回 -1 表示生成树不存在。

## 6. Uniqueness Checking in Prim: The Off-Tree Edge Method / Prim 的唯一性判定：非树边验证法

Although my implementation only covers Kruskal, Prim can also check uniqueness — it just requires a different approach. Instead of detecting substitutability during construction, Prim checks it after the MST is built. The method, sometimes called the "non-tree edge verification" approach, works as follows:

虽然我的实现只覆盖了 Kruskal，但 Prim 也能判定唯一性——只需要换一种思路。不是在构造过程中检测替代关系，而是在 MST 建成之后验证。这个方法有时被称为“非树边验证法”，步骤如下：

**Step 1.** Use Prim (or Kruskal) to build one MST. Record which edges belong to the tree.

**第一步.** 用 Prim 或 Kruskal 求出一棵 MST，记录哪些边属于树边。

**Step 2.** For every *non-tree* edge `e = (u, v, w)` in the original graph, find the maximum edge weight on the unique path between `u` and `v` in the MST. Call this `max_w`.

**第二步.** 对于原图中的每条*非树边* `e = (u, v, w)`，在 MST 中找到 u 到 v 的唯一路径上的最大边权，记作 `max_w`。

**Step 3.** If `w == max_w`, then this non-tree edge can replace the max-weight tree edge on that path, producing a different MST with the same total weight. The MST is therefore not unique.

**第三步.** 若 `w == max_w`，则这条非树边可以替换掉路径上那条等权的最大树边，得到一棵总权重相同的不同 MST。因此 MST 不唯一。

**Step 4.** If every non-tree edge satisfies `w > max_w` (strictly heavier than the path maximum), then no alternative exists — the MST is unique.

**第四步.** 若所有非树边都满足 `w > max_w`（严格大于路径最大权），则不存在替代——MST 唯一。

The bottleneck is Step 2: finding the maximum edge on a tree path. This can be answered in O(log n) time using binary lifting with an LCA precomputation (built in O(n log n) time), or alternatively by rooting the MST, storing parent and max-edge arrays, and walking up for each query in O(n) — acceptable for smaller graphs. The full algorithm runs in O(E log n) with the LCA approach.

瓶颈在第二步：查询树上路径的最大边权。可以用倍增法结合 LCA 预处理（O(n log n) 建表）在 O(log n) 内回答每次查询；也可以简单地将 MST 定根，存储父节点和路径最大边数组，每次查询 O(n) 上溯——对小规模图完全可行。用 LCA 方法整体复杂度 O(E log n)。

>(**LCA** stands for Lowest Common Ancestor — in a rooted tree, the deepest node that is an ancestor of both `u` and `v`. The tree path between `u` and `v` can be decomposed into the path from `u` up to the LCA, plus the path from `v` up to the LCA. **Binary lifting** is a preprocessing technique that stores, for each node, not just its immediate parent but its 2nd, 4th, 8th, ... ancestor — powers of two. This allows us to jump upward by large steps instead of walking one parent at a time, reducing a potentially O(n) climb to O(log n). To answer "what is the maximum edge on the path from `u` to `v`," we store, alongside each power-of-two ancestor, the maximum edge weight encountered on that jump. During the query, as we lift `u` and `v` toward their LCA, we take the maximum of the max-edge values on all jumps made. The preprocessing takes O(n log n) time and O(n log n) space, and each path-max query then takes O(log n). For smaller graphs where simplicity is preferred, one can simply store the immediate parent and the edge weight to that parent, then walk from `u` up to the root collecting max, and do the same from `v` — O(n) per query, which is perfectly acceptable when E is modest.)
>
>（**LCA** 是最近公共祖先——在定根的树中，节点 `u` 和 `v` 的所有公共祖先里深度最深的那个。树中 `u` 到 `v` 的路径可以拆成两段：从 `u` 向上到 LCA，再从 `v` 向上到 LCA。**倍增法**是一种预处理技术：为每个节点存储的不仅是直接父节点，还有第 2 个、第 4 个、第 8 个……即 2 的幂次方祖先。这样查询时可以一次跳一大步，而不是一格格往上爬，把可能 O(n) 的攀爬降到 O(log n)。要回答“`u` 到 `v` 路径上的最大边权”，我们在存储每个“跳跃目标”的同时也存储这个跳跃区间内的最大边权。查询时，在将 `u` 和 `v` 向 LCA 提升的过程中，取所有跳跃的最大边权即可。预处理 O(n log n) 时间和空间，每次路径最大查询 O(log n)。对规模较小的图，如果偏好简单，也可以只存直接父节点和到父节点的边权，然后从 `u` 一步步上溯到根收集最大值，`v` 同理——每次查询 O(n)，在边数不多时完全可行。）

This method has a conceptual elegance: it treats the MST as the "baseline" and asks whether any outsider edge can break in and cause a tie. The temporary-DSU approach in Kruskal, by contrast, catches the tie before it happens. Both are valid; which one to implement depends on the algorithm you've already chosen for building the MST.

这个方法在概念上很优雅：它把 MST 视为“基准线”，然后问是否有任何外来边能闯进来造成平局。而 Kruskal 中的临时并查集方法则是在平局发生之前就抓住它。两者都正确；选哪个取决于你已经在用哪个算法构建 MST。

## 7. Kruskal vs. Prim: A Side-by-Side View / Kruskal 与 Prim 对比

| Aspect / 方面 | Kruskal | Prim |
|---|---|---|
| Core idea / 核心思想 | Global greedy, edge by edge / 全局贪心，按边选取 | Local greedy, point set expanding / 局部贪心，点集扩张 |
| Primary data structure / 主要数据结构 | DSU / 并查集 | Priority queue or array scan / 优先队列或数组扫描 |
| Complexity / 复杂度 | O(E log E) | O(V²) naive, O((V+E) log V) with heap |
| Best for / 更适合 | Sparse graphs / 稀疏图 | Dense graphs / 稠密图 |
| Uniqueness checking / 唯一性判定 | Naturally supported via weight groups and temporary DSU / 通过权重组和临时并查集自然支持 | Requires post-processing with off-tree edge verification / 需要后处理——非树边验证法 |
| Uniqueness complexity / 唯一性判定复杂度 | O(E α(V)), integrated / O(E α(V))，集成在主循环中 | O(E log n) with LCA preprocessing / 需 LCA 预处理 |

Kruskal's weight-group processing gives it a structural advantage for uniqueness checking: all edges of equal weight are naturally clustered together, and a lightweight temporary DSU resolves substitutability within each group before any permanent decisions are made. Prim, by building outward from a root, scatters the "equal-weight candidate" information across iterations, making an after-the-fact verification more natural than an in-process one.

Kruskal 的权重组处理在唯一性判定上具有结构优势：所有等权边天然聚在一起，用一个轻量的临时并查集就能在做出任何永久决定之前解决组内的替代关系。Prim 从根向外生长，“等权候选边”的信息分散在各轮迭代中，事后验证比过程中判定更自然。

## 8. Extended Reading: Other MST Algorithms and Real-World Applications / 延伸阅读：其他 MST 算法与实际应用

**Borůvka's algorithm** is the third classic MST algorithm, predating both Kruskal and Prim. Its logic is actually simpler than it might first appear. Imagine the graph initially has V components — each vertex is its own component, completely isolated. In each round, the algorithm does the following for every component: look at all edges that connect this component to the *outside* world (edges whose other endpoint belongs to a different component), pick the one with the smallest weight, and mark it as "selected." Once every component has made its pick, all selected edges are added to the MST simultaneously, merging components into larger ones. Then the next round begins, treating each newly merged region as a single component. The process repeats until only one component remains.

**Borůvka 算法**是第三个经典 MST 算法，比 Kruskal 和 Prim 都更古老。它的逻辑其实比乍看起来要简单。想象图一开始有 V 个分量——每个顶点自己就是一个分量，彼此孤立。每一轮，算法对每个分量做同一件事：检查连接这个分量和*外部*世界的所有边（即另一端属于不同分量的边），从中选出权重最小的一条，标记为“选中”。等所有分量都选完了，所有选中的边被同时加入 MST，分量们合并成更大的分量。然后下一轮开始，把每个新合并的区域当作一个新的分量。重复这个过程直到只剩下一个分量。

Two natural questions arise here. First: "pick independently" — how does a component do that? In code, we simply iterate through all edges. For each edge, we check which component each endpoint belongs to (using a DSU, just like in Kruskal). If they belong to different components, this edge is a *candidate* for the component of each endpoint. We maintain, for each component, the cheapest candidate edge seen so far. At the end of the scan, every component holds its own personal "cheapest external edge." This is what "independent selection" means in practice — it's just a loop with per-component minimum tracking.

这里自然会产生两个疑问。第一个："独立选择"——分量怎么选？代码实现上，我们只是遍历所有边。对每条边，检查两个端点各自属于哪个分量（用并查集，和 Kruskal 一样）。如果属于不同分量，这条边就是两个分量各自的*候选边*。我们为每个分量维护目前看到的最便宜候选边。扫描结束后，每个分量就都有了自己的"最便宜外连边"。这就是"独立选择"的实际含义——不过是一个循环加每个分量的最小值追踪。

Second: won't this create cycles? If component A picks an edge to component B, and component B independently picks an edge to component A, both edges would connect the same two components. Adding both would create a cycle. The algorithm handles this naturally: when merging, if A picks edge (A,B) and B picks edge (B,A), they are the same edge (or two different edges of possibly different weights between the same two components — in which case only the lighter one, or one of them if equal, is actually added). More importantly, after all selected edges are added, the DSU unions happen, and the next round operates on the new, larger components. Because each round reduces the number of components by at least half (in the worst case, components pair up — each merges with at least one neighbor), the algorithm runs for at most O(log V) rounds. Each round scans all edges, so the total complexity is O(E log V).

第二个：这样不会成环吗？如果分量 A 选了连接 B 的边，分量 B 同时也选了连接 A 的边，两条边都连接了同一对分量，都加进去就会成环。算法自然地处理了这个问题：合并时，如果 A 选了边 (A,B)，B 也选了边 (B,A)，它们其实是同一条边（或者连接同一对分量的两条不同权重的边——此时只保留较轻的那条，等权则任选其一）。更重要的是，所有选中的边被加入后，并查集完成合并，下一轮面对的是新的、更大的分量。因为每轮分量数至少减半（最坏情况下分量两两配对——每个分量至少和一个邻居合并），算法最多运行 O(log V) 轮。每轮扫描所有边，总复杂度 O(E log V)。

Borůvka can also detect non-unique MST: within a round, if any component has multiple *equal-weight* cheapest external edges, those edges are substitutable, and the MST is not unique. What makes Borůvka noteworthy among the three is its parallelism-friendly nature — since each component's selection is independent, the per-component minimum-finding can be parallelized. This makes it relevant in certain high-performance and distributed computing contexts, though for sequential code on a single machine, Kruskal or Prim is usually simpler to implement.

Borůvka 同样可以检测 MST 的唯一性：在一轮中，如果某个分量有多条*等权的*最便宜外连边，这些边就可以互相替代，MST 不唯一。Borůvka 在三种算法中最值得注意的特性是它天然适合并行化——因为每个分量的选择是独立的，各分量找最小值的工作可以并行执行。这使它在一定的高性能和分布式计算场景中仍有应用，不过在单机顺序执行的代码中，Kruskal 或 Prim 通常更容易实现。

(A final observation on its nature: like Kruskal and Prim, Borůvka is a greedy algorithm — each round makes locally optimal choices that collectively lead to a global optimum. One might wonder whether it "trades space for time" compared to Kruskal. Not quite. It does use extra space — an array of size O(V) to track each component's current cheapest external edge — and it scans all edges in every round. But its O(E log V) time complexity sits in the same league as Kruskal's O(E log E); on a single machine, the per-round full scan usually makes it *slower* in practice. What the extra space and repeated scanning truly buy is not raw speed, but **parallelism**: because each component's minimum-edge search is independent, the work can be distributed across multiple processors. In sequential code, Kruskal or Prim wins on simplicity; in a distributed system or on a GPU, Borůvka's structure shines.)

（最后补充一点关于它性质的观察：和 Kruskal、Prim 一样，Borůvka 也是贪心算法——每轮做局部最优选择，最终导向全局最优。或许有人会问：相比 Kruskal，它是不是"用空间换时间"？不完全是。它确实用了额外空间——一个 O(V) 的数组来追踪每个分量当前的最便宜外连边——而且每轮都要扫描所有边。但它的时间复杂度 O(E log V) 和 Kruskal 的 O(E log E) 在同一个量级；在单机上，每轮全扫描通常让它实际运行*更慢*。额外空间和反复扫描真正换来不是速度，而是**并行性**：因为每个分量的最小边搜索是独立的，这些工作可以分散到多个处理器上同时进行。顺序执行时，Kruskal 或 Prim 胜在简单；在分布式系统或 GPU 上，Borůvka 的结构优势才真正显现。）

As for practical significance, MST algorithms are not just exam material. They underpin real infrastructure — network design (minimum-cost connections for cables or circuits), approximation algorithms for the Traveling Salesman Problem (using the MST weight as a lower bound), image segmentation in computer vision (graph-based clustering where edges encode pixel similarity), and phylogenetic tree construction in bioinformatics. The ability to verify uniqueness adds a layer of robustness: in network design, for example, knowing that an MST is unique means there is no alternative wiring plan at the same minimum cost — a fact that can simplify decision-making or expose hidden redundancy.

至于实际意义，MST 算法绝不只是考试材料。它们支撑着真实的基础设施——网络布线设计（最小成本的电缆或电路连接）、旅行商问题的近似算法（用 MST 权重作为下界）、计算机视觉中的图像分割（基于图的聚类，边编码像素相似度）、生物信息学中的系统发育树构建。而唯一性判定的能力又增加了一层鲁棒性：例如在网络设计中，知道 MST 唯一意味着不存在同等成本下的替代布线方案——这个事实可以简化决策，或者反过来揭示隐藏的冗余可能性。

## Appendix: Full Kruskal Implementation with Uniqueness / 附录：带唯一性判定的完整 Kruskal 实现

```c
#define MAXV 1000

typedef struct {
    int from, to, weight;
} Edge;

int find(int parent[], int x) {
    if (parent[x] < 0) return x;
    return parent[x] = find(parent, parent[x]);
}

void unionSets(int parent[], int a, int b) {
    int ra = find(parent, a);
    int rb = find(parent, b);
    if (ra == rb) return;
    if (parent[ra] > parent[rb]) {  // ra is smaller in size
        int tmp = ra;
        ra = rb;
        rb = tmp;
    }
    parent[ra] += parent[rb];
    parent[rb] = ra;
}

int cmp(const void *a, const void *b) {
    return ((Edge*)a)->weight - ((Edge*)b)->weight;
}

int cc_count;  // connected component count if graph is disconnected

int Kruskal(bool *is_unique, Edge *array, int num_vertex, int num_edge) {
    int parent[MAXV + 1];
    for (int v = 0; v <= num_vertex; v++)
        parent[v] = -1;

    qsort(array, num_edge, sizeof(Edge), cmp);  // qsort!!!

    int total = 0;
    int edges_used = 0;
    *is_unique = true;

    int i = 0;
    while (i < num_edge) {
        int j = i;
        while (j < num_edge && array[j].weight == array[i].weight)
            j++;

        int tmp_parent[MAXV + 1];
        for (int v = 0; v <= num_vertex; v++)
            tmp_parent[v] = -1;

        for (int k = i; k < j; k++) {
            int u = array[k].from, v = array[k].to;
            int ru = find(parent, u);
            int rv = find(parent, v);
            if (ru != rv) {
                int tru = find(tmp_parent, ru);
                int trv = find(tmp_parent, rv);
                if (tru == trv) {
                    *is_unique = false;
                } else {
                    unionSets(tmp_parent, tru, trv);
                }
            }
        }

        for (int k = i; k < j; k++) {
            int u = array[k].from, v = array[k].to;
            int ru = find(parent, u);
            int rv = find(parent, v);
            if (ru != rv) {
                unionSets(parent, ru, rv);
                total += array[k].weight;
                edges_used++;
            }
        }

        i = j;
    }

    if (edges_used == num_vertex - 1) {
        return total;
    } else {
        cc_count = 0;
        for (int v = 1; v <= num_vertex; v++)
            if (parent[v] < 0)
                cc_count++;
        return -1;
    }
}
```