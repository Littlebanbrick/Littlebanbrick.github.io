# Maximum Network Flow: Edmonds-Karp Algorithm

<!-- preview: 用Edmonds-Karp算法解决经典的最大网络流问题-->

# 最大网络流：Edmonds-Karp 算法

## 1. The Problem / 问题引入

Imagine a network of water pipes connecting a source to a sink. Each pipe has a diameter limiting how much water can flow through it per second. The source pumps water out, the sink consumes it, and at every junction the total inflow must equal the total outflow — no leaks, no accumulation. The question is: what is the maximum amount of water that can be delivered from the source to the sink?

想象一个水管网络，从水源连接到水龙头。每根水管有自己的粗细，限制了每秒能通过的水量。水源向外泵水，水龙头接收水，在每个连接点处，流入的水量必须等于流出的水量——不能漏水，也不能积水。问题是：从水源到水龙头，最多能输送多少水？

This is the **maximum flow problem**. Formally, we are given a directed graph with a source vertex `s` and a sink vertex `t`. Each directed edge `(u, v)` has a non-negative capacity `c(u, v)`. A flow `f` assigns a value to each edge such that: (1) capacity constraint: `0 ≤ f(u, v) ≤ c(u, v)`; (2) flow conservation: for every vertex except `s` and `t`, the sum of incoming flows equals the sum of outgoing flows. The total flow, or the value of the flow, is the sum leaving `s` (or equivalently, entering `t`). The goal is to maximize this value.

这就是**最大流问题**。形式上，我们有一个有向图，包含源点 `s` 和汇点 `t`。每条有向边 `(u, v)` 有一个非负容量 `c(u, v)`。一个流 `f` 给每条边分配一个流量，满足：(1) 容量限制：`0 ≤ f(u, v) ≤ c(u, v)`；(2) 流量守恒：对于除 `s` 和 `t` 外的所有顶点，流入之和等于流出之和。整个流的流量，即流的值，是从 `s` 流出的总量（也等于流入 `t` 的总量）。目标是最大化这个值。

The problem is not solvable by a naive greedy approach. Sending flow along the first available path can block better alternatives. A mechanism for "undoing" flow is needed — and that is precisely the role of the residual network and reverse edges.

这个问题不能用简单的贪心求解。沿着第一条可用路径推流，可能堵死更好的方案。必须有某种“反悔”机制——这正是残余网络和反向边的作用。

## 2. The Core Idea: Residual Network and Reverse Edges / 核心思想：残余网络与反向边

### 2.1 Residual Capacity / 残余容量

For each edge, the residual capacity is the original capacity minus the flow already assigned. At the start, no flow has been sent, so the residual capacity equals the full capacity. As flow is pushed through, the residual capacity decreases. An edge with positive residual capacity can still carry additional flow.

每条边的残余容量等于原始容量减去已分配的流量。一开始没有流量，残余容量就是全容量。随着流量推进，残余容量减少。残余容量大于零的边仍可承载额外流量。

The **residual network** is the graph consisting only of edges with positive residual capacity. Finding an augmenting path means finding any directed path from `s` to `t` in this residual network.

**残余网络**就是仅由残余容量大于零的边构成的图。找增广路径，就是在这个残余网络中寻找一条从 `s` 到 `t` 的有向路径。

### 2.2 The Necessity of Reverse Edges / 为什么需要反向边

To understand why reverse edges are indispensable, we must first clarify what an augmenting path is. An **augmenting path** is simply a directed path from the source `s` to the sink `t` in the residual network — the subgraph consisting only of edges that still have positive residual capacity. Pushing flow along an augmenting path means sending as much additional flow as the path's smallest residual capacity allows (the bottleneck). This operation increases the total flow. The algorithm works by repeatedly finding augmenting paths and pushing flow along them, until no such path exists.

要理解为什么反向边不可或缺，必须先明确什么是增广路径。**增广路径**就是残余网络中一条从源点 `s` 到汇点 `t` 的有向路径——残余网络是仅由残余容量仍为正的边构成的子图。沿一条增广路径推送流量，意味着在这条路径上发送额外的流量，发送量等于路径上所有边的最小残余容量（即瓶颈容量）。这个操作会增加总流量。整个算法就是不断寻找增广路径并沿其推送流量，直到再也找不到增广路径为止。

Now consider a simple counterexample. Suppose we have edges: `s -> a` (capacity 1), `s -> b` (capacity 1), `a -> t` (capacity 1), `b -> t` (capacity 1), and additionally `a -> b` (capacity 1). The optimal solution is clearly to send 1 unit along `s -> a -> t` and 1 unit along `s -> b -> t`, achieving a total flow of 2. However, if the algorithm makes an unfortunate early choice — say, pushing 1 unit along `s -> a -> b -> t` — it saturates `a -> b` and exhausts the capacities of `s -> a` and `b -> t`. The residual network after this first push contains only `s -> b` and `a -> t`, neither of which can form a complete `s -> t` path. Without a mechanism to revisit this decision, the algorithm would halt with a total flow of 1, missing the optimum.

现在看一个简单的反例。假设图中有这些边：`s -> a`（容量 1），`s -> b`（容量 1），`a -> t`（容量 1），`b -> t`（容量 1），此外还有 `a -> b`（容量 1）。最优解显然是沿 `s -> a -> t` 推送 1 单位，沿 `s -> b -> t` 推送 1 单位，总流量达到 2。但如果算法做了一个不幸的早期选择——比如沿 `s -> a -> b -> t` 推送了 1 单位流量——这饱和了 `a -> b`，并耗尽了 `s -> a` 和 `b -> t` 的容量。第一次推送后的残余网络只剩下 `s -> b` 和 `a -> t`，这两条边无法构成完整的 `s -> t` 路径。如果没有一种机制可以重新审视这个决策，算法会停在总流量 1，与最优解失之交臂。

Reverse edges provide exactly this mechanism. When we push flow along `(u, v)`, we simultaneously create a reverse edge `(v, u)` in the residual network, with a capacity equal to the amount of flow just pushed. This reverse edge represents the ability to later "undo" or "redirect" that flow. On a conceptual level, sending flow along a reverse edge means: "some of the flow that previously went from `u` to `v` is now being cancelled and rerouted elsewhere."

反向边恰好提供了这种机制。当沿着 `(u, v)` 推送流量时，我们同时在残余网络中创建一条反向边 `(v, u)`，容量等于刚推送的流量值。这条反向边代表了将来“撤销”或“重定向”这部分流量的能力。在概念层面，沿反向边发送流量，意思是：“之前从 `u` 流向 `v` 的一部分流量现在被取消，转而流向别处。”

Let's see how this plays out in the counterexample. After the first push `s -> a -> b -> t` (1 unit), the residual network gains a reverse edge `b -> a` with capacity 1. Now a subsequent BFS can find the augmenting path `s -> b -> a -> t`. Pushing 1 unit along this path uses `s -> b` (forward), `b -> a` (the reverse edge — which cancels the earlier flow on `a -> b`), and `a -> t` (forward). What has actually happened? The flow on `a -> b` has been cancelled, freeing the capacity on `s -> a` and `b -> t` to serve other paths. The net result is that 1 unit flows from `s` to `a` to `t`, and 1 unit flows from `s` to `b` to `t` — exactly the optimal configuration. The two paths found — `s -> a -> b -> t` and `s -> b -> a -> t` — do not each represent a physical routing of fluid. Rather, the first path establishes a temporary allocation, and the second path partially unwinds and reshuffles it. The final net flow, obtained by algebraically summing the two augmentations (cancelling the `a -> b` flow against the `b -> a` flow), is precisely the optimal `s -> a -> t` plus `s -> b -> t`. The formal justification for why this algebraic cancellation always works rests on the flow decomposition theorem, but for practical understanding it suffices to see that the reverse edge allows the algorithm to incrementally correct earlier greedy mistakes.

回到反例中看这个过程。第一次沿 `s -> a -> b -> t` 推送 1 单位后，残余网络中出现了容量为 1 的反向边 `b -> a`。此时后续的 BFS 可以找到增广路径 `s -> b -> a -> t`。沿这条路推送 1 单位流量，使用了 `s -> b`（正向），`b -> a`（反向边——这取消了之前 `a -> b` 上的流量），以及 `a -> t`（正向）。实际发生了什么？`a -> b` 上的流量被取消了，释放了 `s -> a` 和 `b -> t` 上的容量来服务其他路径。最终净效果是：1 单位从 `s` 经 `a` 到 `t`，1 单位从 `s` 经 `b` 到 `t`——正是最优配置。算法找到的两条路径——`s -> a -> b -> t` 和 `s -> b -> a -> t`——并不各自代表真实的物理路径。更准确的理解是：第一条路径建立了一个临时分配，第二条路径将其部分拆解并重组。将两次增广代数量加总（`a -> b` 上的流量与 `b -> a` 上的流量相互抵消），最终净流就是最优的 `s -> a -> t` 加 `s -> b -> t`。这种代数抵消为何总是有效，其形式化证明依赖于流分解定理（flow decomposition theorem），那不在我们讨论的范围内；但对实际理解而言，只需认识到反向边使算法有能力逐步纠正早期贪心决策的失误。

### 2.3 Implementation in the Code / 代码中的实现

In the adjacency-list implementation, each added edge creates two nodes: a forward edge and a backward edge, linked via a `rev` pointer.

在邻接表实现中，每添加一条边会创建两个节点：正向边和反向边，通过 `rev` 指针互指。

```c
forward->capacity = capacity;    // forward initial residual = capacity
backward->capacity = 0;          // backward initial residual = 0
forward->rev = backward;
backward->rev = forward;
```

When flow is pushed, the update applies symmetrically:

推送流量时，更新是对称的：

```c
e->capacity -= bottleneck;        // forward residual decreases
e->rev->capacity += bottleneck;   // backward residual increases
```

The forward edge's residual decreases, meaning less capacity remains in the original direction. The reverse edge's residual increases, meaning more capacity is available to push flow in the opposite direction — which is exactly the "undo" capability.

正向边的残余减少，意味着原方向剩余容量变小；反向边的残余增加，意味着反向推送流量的能力变大——这正是“反悔”的能力。

## 3. Edmonds-Karp Algorithm / Edmonds-Karp 算法

The Edmonds-Karp algorithm is a specific implementation of the Ford-Fulkerson method. It uses Breadth-First Search to find the shortest augmenting path (in terms of number of edges) in each iteration. This guarantees termination and bounds the number of augmentations.

Edmonds-Karp 算法是 Ford-Fulkerson 方法的一个具体实现。它每轮用广度优先搜索寻找边数最短的增广路径，这保证了算法一定会终止并控制了增广次数。

### 3.1 Step-by-step / 算法步骤

**Step 1: Initialization.** Build the residual graph. For each directed edge `(u, v, c)` in the input, create a forward edge with capacity `c` and a reverse edge with capacity `0`, linking them via `rev` pointers.

**第一步：初始化。** 建立残余图。对于输入的每条有向边 `(u, v, c)`，创建一条容量为 `c` 的正向边和一条容量为 `0` 的反向边，用 `rev` 指针互连。

**Step 2: BFS for an augmenting path.** Run a BFS from `s` on the residual network (only edges with capacity > 0 are traversable). Record for each visited vertex its predecessor in the path (`parent` array) and the specific edge through which it was reached (`parentEdge` array). If `t` is reached, an augmenting path exists; otherwise, the algorithm terminates.

**第二步：用 BFS 找增广路径。** 在残余网络上从 `s` 开始运行 BFS（只有容量 > 0 的边可以走）。为每个访问到的顶点记录路径前驱（`parent` 数组）以及到达该顶点所经过的边（`parentEdge` 数组）。若 `t` 被访问到，则存在增广路径；否则算法终止。

**Step 3: Trace back and find the bottleneck.** Walk backwards from `t` to `s` using the `parent` array. For each step, check the residual capacity of the edge recorded in `parentEdge`. The bottleneck is the minimum of these capacities along the path.

**第三步：回溯找到瓶颈容量。** 利用 `parent` 数组从 `t` 往回走到 `s`。每一步检查 `parentEdge` 中所记录边的残余容量。瓶颈容量即为路径上所有残余容量的最小值。

**Step 4: Augment flow.** Walk the path again, this time updating the residual capacities: for each forward edge on the path, subtract the bottleneck from its capacity; for the corresponding reverse edge (found via `rev`), add the bottleneck to its capacity. Add the bottleneck to the total flow.

**第四步：增广流量。** 再次沿路径回溯，更新残余容量：路径上的每条正向边减去瓶颈容量；对应的反向边（通过 `rev` 找到）加上瓶颈容量。总流量累加瓶颈容量。

**Step 5: Repeat.** Go back to Step 2 until no more augmenting paths exist.

**第五步：循环。** 回到第二步，直到再也找不到增广路径。

### 3.2 Why `parentEdge` is needed / 为什么需要 `parentEdge`

The `parent` array alone tells us which vertex precedes which, but to update residual capacities we need the actual edge object (the adjacency list node). The `parentEdge` array stores the pointer to the forward edge that was traversed during BFS to reach each vertex. Without it, we would have to search the adjacency list again to find the edge, which is cumbersome and inefficient.

仅有 `parent` 数组知道顶点的前驱是谁，但要更新残余容量，我们需要确切的边对象（邻接表节点）。`parentEdge` 数组存储了 BFS 过程中到达每个顶点所经过的那条正向边的指针。没有它，就需要再次搜索邻接表来找到对应边，繁琐且低效。

### 3.3 Complexity / 复杂度

Each BFS runs in O(E) time. In the worst case, each augmenting path saturates at least one edge — meaning that edge's forward residual capacity becomes zero. An edge's residual can become zero and then become positive again only when flow is pushed along its reverse, which requires another edge to be saturated first. Analysis shows the number of augmentations is bounded by O(V·E). Thus the total complexity is O(V·E²). In practice, on typical graphs and especially with BFS finding short paths, the performance is often much better.

每次 BFS 耗时 O(E)。最坏情况下，每条增广路径至少饱和一条边——该边的正向残余容量变为零。一条边的残余变为零后，只有当流沿着其反向边推送时才会再次变正，而这又需要先饱和另一条边。分析表明增广次数不超过 O(V·E)，因此总复杂度为 O(V·E²)。实际中，对典型图尤其是 BFS 寻找短路径，表现往往好得多。

## 4. Extended Reading / 延伸阅读

### 4.1 Dinic's Algorithm / Dinic 算法

Edmonds-Karp finds one augmenting path per BFS. Dinic's algorithm improves on this by finding and pushing flow along *all* shortest augmenting paths in one go. It does this using two phases per round.

Edmonds-Karp 每次 BFS 只找一条增广路。Dinic 算法对此的改进是：一次性找到*所有*最短增广路并沿它们推送流量。它每轮用两个阶段做到这点。

**Phase 1: Building the level graph.** Run a BFS from `s` on the residual network. But instead of just looking for `t`, record for *every* vertex its distance from `s` — where "distance" means the number of edges traversed along the shortest path from `s` to that vertex in the current residual network, *not* the sum of edge weights (capacities). Think of it as counting steps: `s` itself is at distance 0; vertices directly reachable from `s` are at distance 1; vertices reachable from those in one more step are at distance 2, and so on. This number is called the vertex's **level**. The **level graph** is then the subgraph containing only those edges that go from a vertex at level L to a vertex at level L+1 — edges that go "downhill" (from higher level to lower) or "sideways" (within the same level) are discarded for this round.

**第一阶段：构建分层图。** 在残余网络上从 `s` 运行一次 BFS。但不止是为了寻找 `t`，而是为*每个*顶点记录它距离 `s` 的距离——这里的"距离"指在当前残余网络中从 `s` 到该顶点的最短路径所经过的边数，*不是*边权重（容量）的总和。可以理解为数步数：`s` 自身距离为 0；从 `s` 直接可达的顶点距离为 1；从这些顶点再走一步可达的距离为 2，以此类推。这个数字被称为顶点的**层**。**分层图**就是仅保留从第 L 层走向第 L+1 层的边所构成的子图——"走下坡"（从高层回低层）或"平走"（同层内）的边在这一轮中被丢弃。

**A concrete example.** Suppose the residual network contains: `s -> a`, `s -> b`, `a -> b`, `a -> t`, `b -> t`. The BFS from `s` assigns: `s` at level 0; `a` and `b` both at level 1 (since each is one edge away from `s`); `t` at level 2 (one edge from `a` or `b`). The level graph keeps `s -> a` (level 0→1), `s -> b` (0→1), `a -> t` (1→2), `b -> t` (1→2), but discards `a -> b` (1→1, sideways). DFS then only walks on these "forward-only" edges, making it impossible to loop back and guaranteeing that any path found has length exactly equal to the shortest distance from `s` to `t`.

**一个具体例子。** 假设残余网络包含：`s -> a`，`s -> b`，`a -> b`，`a -> t`，`b -> t`。BFS 从 `s` 出发分配层数：`s` 第 0 层；`a` 和 `b` 都在第 1 层（各距 `s` 一步）；`t` 第 2 层（距 `a` 或 `b` 一步）。分层图保留 `s -> a`（0→1），`s -> b`（0→1），`a -> t`（1→2），`b -> t`（1→2），但丢弃 `a -> b`（1→1，平走）。DFS 接下来只在"向前"的边上行走，无法绕回，且找到的任何路径的长度恰好等于从 `s` 到 `t` 的最短距离。

**Phase 2: Blocking flow via DFS.** Starting from `s`, run a DFS that can follow only level-graph edges. Push flow along each discovered path, updating residual capacities. Crucially, when an edge's residual capacity drops to zero, remove it from the level graph; when a vertex has no more outgoing level-graph edges, backtrack. This ensures each DFS path saturates at least one edge, and the combined DFS exploration pushes a **blocking flow** — a flow such that every `s -> t` path in the current level graph uses at least one saturated edge. When no more paths exist in the level graph, the round ends.

**第二阶段：通过 DFS 寻找阻塞流。** 从 `s` 出发，运行只能走分层图边的 DFS。沿每条发现的路径推送流量，更新残余容量。关键：当一条边的残余容量降为零时，从分层图中移除；当一个顶点没有更多可走的分层图出边时，回溯。这保证了每条 DFS 路径至少饱和一条边，整个 DFS 探索推送的是一个**阻塞流**——在当前分层图中，每条 `s -> t` 路径都至少包含一条饱和边。分层图中不再存在路径时，本轮结束。

After each round, the residual network has changed (some edges saturated, new reverse edges created), so a fresh BFS rebuilds a new level graph. The key insight: each new BFS strictly increases `t`'s distance from `s`, because the previous round's level graph edges that went from level L to L+1 are all either saturated or had flow pushed back on their reverses (which go from L+1 to L — and these are discarded in the next level graph since they go "uphill"). With at most V levels, at most V rounds are needed. The total complexity drops to O(V²·E) for general graphs. Dinic's algorithm is often the practical choice for maximum flow.

每轮之后，残余网络已改变（一些边饱和了，新的反向边被创建），因此新的 BFS 重新构建分层图。关键洞察：每次新 BFS 严格增加了 `t` 距离 `s` 的层数，因为上一轮分层图中从 L 到 L+1 的边要么饱和了，要么被反向推送（反向边从 L+1 指向 L——在下一次的分层图中会被丢弃，因为它们是"走上坡"）。层数最多为 V，因此最多 V 轮。总复杂度降至 O(V²·E)（一般图）。实际应用中 Dinic 常常是最大流的首选。

### 4.2 Min-Cut Max-Flow Theorem / 最小割最大流定理

A fundamental result in network flow theory states that the value of the maximum flow equals the capacity of the minimum s-t cut. But what exactly is an s-t cut?

网络流理论的一个基本结论是：最大流的值等于最小 s-t 割的容量。但 s-t 割究竟是什么呢？

An **s-t cut** is a partition of all vertices into two disjoint sets, conventionally called `S` and `T`, such that the source `s` belongs to `S` and the sink `t` belongs to `T`. There are many possible cuts — any way of splitting the vertices with `s` on one side and `t` on the other counts as one. The **capacity** of a cut is the sum of capacities of all edges that go *from a vertex in `S` to a vertex in `T`* (edges going the opposite direction, from `T` to `S`, do not count toward the cut capacity). A **minimum s-t cut** is simply a cut whose capacity is the smallest among all possible s-t cuts.

**s-t 割**是将所有顶点划分入两个不相交集 `S` 和 `T` 的一种方式，要求源点 `s` 在 `S` 中，汇点 `t` 在 `T` 中。割有很多种——只要 `s` 在一侧、`t` 在另一侧，怎么划分都构成一个割。割的**容量**是所有*从 `S` 侧指向 `T` 侧*的边的容量之和（从 `T` 指向 `S` 的边不计入割的容量）。**最小 s-t 割**就是所有可能割中容量最小的那个。

**A concrete example.** Consider the same graph as before: `s -> a` (cap 1), `s -> b` (cap 1), `a -> t` (cap 1), `b -> t` (cap 1), `a -> b` (cap 1). Let's examine a few possible cuts:

**一个具体例子。** 考虑和之前相同的图：`s -> a`（容量 1），`s -> b`（容量 1），`a -> t`（容量 1），`b -> t`（容量 1），`a -> b`（容量 1）。来看看几种可能的割：

- Cut 1: `S = {s}`, `T = {a, b, t}`. Edges crossing from S to T: `s -> a` (1), `s -> b` (1). Total capacity = 2.  
  割 1：`S = {s}`，`T = {a, b, t}`。从 S 跨到 T 的边：`s -> a`（1），`s -> b`（1）。总容量 = 2。

- Cut 2: `S = {s, a, b}`, `T = {t}`. Edges crossing from S to T: `a -> t` (1), `b -> t` (1). Total capacity = 2.  
  割 2：`S = {s, a, b}`，`T = {t}`。从 S 跨到 T 的边：`a -> t`（1），`b -> t`（1）。总容量 = 2。

- Cut 3: `S = {s, a}`, `T = {b, t}`. Edges crossing from S to T: `s -> b` (1), `a -> b` (1), `a -> t` (1). Total capacity = 3.  
  割 3：`S = {s, a}`，`T = {b, t}`。从 S 跨到 T 的边：`s -> b`（1），`a -> b`（1），`a -> t`（1）。总容量 = 3。

- Cut 4: `S = {s, b}`, `T = {a, t}`. Edges crossing: `s -> a` (1), `b -> t` (1). Total capacity = 2. (Note: `a -> b` goes from T to S, so it is not counted.)  
  割 4：`S = {s, b}`，`T = {a, t}`。跨向边：`s -> a`（1），`b -> t`（1）。总容量 = 2。（注意 `a -> b` 从 T 到 S，不计入。）

The minimum cut capacity in this example is 2, which equals the maximum flow. This is no coincidence — the max-flow min-cut theorem guarantees this equality for every network. Intuitively, the maximum flow cannot exceed the capacity of *any* cut, because all flow must cross from the `s`-side to the `t`-side somewhere, and every such crossing point contributes to some cut's capacity. The theorem states that the maximum flow actually *achieves* this lower bound. It not only proves the correctness of max-flow algorithms (when no more augmenting paths exist, the set of vertices reachable from `s` in the residual network forms an `S` whose cut capacity equals the flow value) but also means that solving max flow immediately solves the min-cut problem — with applications in image segmentation, network reliability analysis, and more.

本例中的最小割容量是 2，恰好等于最大流。这并非巧合——最大流最小割定理保证了对每个网络这个等式都成立。直觉上，最大流不可能超过*任何*一个割的容量，因为所有流量必须在某处从 `s` 侧跨越到 `t` 侧，而每一个这样的跨越点都会贡献给某个割的容量。定理表明最大流实际上*达到了*这个下界。它不仅证明了最大流算法的正确性（当再也找不到增广路径时，残余网络中从 `s` 可达的顶点集合恰好构成一个 `S`，其割容量等于当前流量），也意味着求解最大流即立刻得到最小割——在图像分割、网络可靠性分析等领域有广泛应用。

### 4.3 Real-World Applications / 实际应用

Maximum flow is not just a classroom exercise. Bipartite matching (assigning workers to tasks, students to projects) is a direct reduction to max flow. In computer networks, routing and bandwidth allocation rely on max flow models. The min-cut side is used in image segmentation (graph-cut based segmentation) and in analyzing network vulnerability. Airline scheduling, circulation problems, and even some sports elimination problems can be cast as maximum flow.

最大流不只是一道课堂题。二分图匹配（工人分配任务、学生分配项目）直接归约为最大流。计算机网络中，路由和带宽分配依赖最大流模型。最小割一侧被用于图像分割（基于图割的分割）和分析网络脆弱性。航班调度、循环流问题、甚至某些体育淘汰问题都可以建模为最大流。

## Appendix 1: The Ford-Fulkerson Framework and the Original DFS-Based Algorithm / 附录1：Ford-Fulkerson 框架与原始 DFS 算法

The algorithm implemented in this note — Edmonds-Karp — is one member of a larger family. The overarching framework is called the **Ford-Fulkerson method**, and understanding it clarifies both what Edmonds-Karp improved and why.

本笔记中实现的算法——Edmonds-Karp——是一个更大族群的成员。这个总体框架称为 **Ford-Fulkerson 方法**，理解它能看清 Edmonds-Karp 改进了什么，以及为什么需要改进。

### The Ford-Fulkerson Framework / Ford-Fulkerson 框架

The Ford-Fulkerson method does not prescribe *how* to find an augmenting path. It only prescribes the following loop, repeated until termination:

Ford-Fulkerson 方法不规定*如何*寻找增广路径。它只规定了以下循环，反复执行直到终止：

1. Build the residual network (forward edges with remaining capacity, reverse edges with capacity equal to current flow).
   构建残余网络（正向边容量为剩余容量，反向边容量等于当前流量）。

2. Find *any* augmenting path from `s` to `t` in the residual network — any directed path where every edge has positive residual capacity.
   在残余网络中寻找*任意*一条从 `s` 到 `t` 的增广路径——任意一条每条边残余容量都为正的有向路径。

3. If no such path exists, terminate. The current flow is maximal.
   若不存在这样的路径，终止。当前流即为最大流。

4. Find the bottleneck (the smallest residual capacity along the path), push that amount of flow along the path, and update residual capacities: subtract the bottleneck from each forward edge, add the bottleneck to each reverse edge.
   找到瓶颈（路径上最小的残余容量），沿路径推送该数量的流量，并更新残余容量：每条正向边减去瓶颈，每条反向边加上瓶颈。

5. Repeat.
   重复。

Any algorithm that follows this skeleton is a Ford-Fulkerson algorithm. The difference between variants lies entirely in **Step 2: how the augmenting path is chosen**.

任何遵循这个骨架的算法都是 Ford-Fulkerson 算法。变种之间的区别完全在于**第二步：增广路径的选择方式**。

### The Original Ford-Fulkerson: DFS-Based / 原始 Ford-Fulkerson：基于 DFS

The original version, as described by Ford and Fulkerson in 1956, used **Depth-First Search (DFS)** to find an augmenting path.

Ford 和 Fulkerson 在 1956 年描述的原始版本，使用 **深度优先搜索 (DFS)** 来寻找增广路径。

What is DFS? Unlike BFS, which explores in layers (visiting all vertices one step away before any two steps away, like ripples in water), DFS explores by going as far as possible along one branch before backing up. Imagine entering a maze and always turning right until you hit a dead end, then backtracking to the last junction and trying the next right turn. DFS works similarly: it follows the first available edge, then the first available edge from there, going deeper and deeper until it either reaches `t` or hits a dead end (no more outgoing edges with positive residual capacity). When it hits a dead end, it backtracks and tries the next unexplored edge. This "go deep first" strategy can find a path very quickly in some cases, but the path it finds may be arbitrarily long and tortuous.

什么是 DFS？BFS 按层探索（像水波一样，先访问所有距离一步的顶点，再访问距离两步的），DFS 则不同：它沿着一条分支尽可能走到底，然后再回退。想象进入一个迷宫，总是右转，直到撞上死胡同，然后退回到上一个岔路口，试下一个右转。DFS 的工作原理类似：它沿着第一条可用边走，然后从那里继续沿第一条可用边走，不断深入，直到到达 `t` 或撞上死胡同（没有残余容量为正的出边）。撞上死胡同时，它回退并尝试下一条未探索的边。这种“先深入”的策略在某些情况下能很快找到路径，但找到的路径可能任意长、任意曲折。

The fatal flaw: DFS might repeatedly pick long, winding paths that push very little flow each time (because the bottleneck is a tiny capacity somewhere along the path), requiring an enormous number of iterations. Worse, the number of iterations can depend on the actual capacity values, not just the graph size. In a graph with large integer capacities, the algorithm might take millions of augmentations. With irrational capacities, it might not even terminate. This is why Ford-Fulkerson (DFS) is mainly of historical and pedagogical interest.

致命缺陷：DFS 可能反复选择又长又绕的路径，每次只推送极少的流量（因为瓶颈是路径上某处的一个微小容量），导致需要极多次迭代。更糟的是，迭代次数可能取决于实际的容量值，而不仅仅是图的规模。在容量为大量整数的图中，算法可能需要上百万次增广。对于无理数容量，它甚至可能不终止。这就是为什么 Ford-Fulkerson（DFS）主要只具有历史意义和教学价值。

### From Ford-Fulkerson to Edmonds-Karp / 从 Ford-Fulkerson 到 Edmonds-Karp

Edmonds-Karp's decisive improvement was to replace DFS with BFS in Step 2. By always selecting the **shortest** augmenting path (in terms of number of edges), it bounds the number of augmentations by O(V·E), completely independent of the capacity values. This turns an unreliable method into a provably polynomial algorithm.

Edmonds-Karp 的关键改进是在第二步中用 BFS 替换了 DFS。通过总是选择**最短的**增广路径（以边数计），它将增广次数限制在 O(V·E)，与容量值完全无关。这把一个不可靠的方法变成了一个可证明的多项式算法。

In summary: Ford-Fulkerson is the abstract blueprint ("keep finding augmenting paths, however you like"). Edmonds-Karp is the concrete, efficient realization ("use BFS to find the shortest one each time").

总结：Ford-Fulkerson 是抽象蓝图（“不断找增广路径，随便怎么找”）。Edmonds-Karp 是具体、高效的实现（“每次用 BFS 找最短的那条”）。

## Appendix 2: Core Code Skeleton / 附录2：核心代码框架

```c
/* Assume vertices are numbered 0 .. V-1. Graph built with adjacency list
   where each edge has a pointer 'rev' to its reverse edge. */

// BFS to find augmenting path
bool bfs(Graph *G, int s, int t, int parent[], AdjVNode *parentEdge[]) {
    int n = G->num_vertex;
    for (int i = 0; i < n; i++) {
        parent[i] = -1;
        parentEdge[i] = NULL;
    }
    queue *q = createQueue(n + 1);
    enqueue(q, s);
    parent[s] = s;

    while (!isEmpty(q)) {
        int u = dequeue(q);
        for (AdjVNode *p = G->list[u].FirstEdge; p != NULL; p = p->next) {
            int v = p->name;
            if (p->capacity > 0 && parent[v] == -1) {
                parent[v] = u;
                parentEdge[v] = p;
                if (v == t) { free(q); return true; }
                enqueue(q, v);
            }
        }
    }
    free(q);
    return false;
}

// Edmonds-Karp main loop
int maxFlow(Graph *G, int s, int t) {
    int total = 0;
    int parent[MAXV];
    AdjVNode *parentEdge[MAXV];

    while (bfs(G, s, t, parent, parentEdge)) {
        // find bottleneck
        int bottleneck = INF;
        for (int v = t; v != s; v = parent[v]) {
            if (parentEdge[v]->capacity < bottleneck)
                bottleneck = parentEdge[v]->capacity;
        }
        // augment
        for (int v = t; v != s; v = parent[v]) {
            parentEdge[v]->capacity -= bottleneck;
            parentEdge[v]->rev->capacity += bottleneck;
        }
        total += bottleneck;
    }
    return total;
}
```