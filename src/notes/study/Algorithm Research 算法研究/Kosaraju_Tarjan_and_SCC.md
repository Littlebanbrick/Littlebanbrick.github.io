# Strongly Connected Components: Kosaraju and Tarjan

<!-- preview: 求解有向图强连通分量（SCC）的几种经典算法及其实现-->

# 强连通分量：Kosaraju 与 Tarjan

## 1. The Problem / 问题引入

A directed graph is **strongly connected** if there exists a path from every vertex to every other vertex. A **strongly connected component** (SCC) is a maximal strongly connected subgraph — the largest set of vertices where each can reach all others. Partitioning a directed graph into its SCCs is a fundamental operation with applications in cycle detection, program analysis (call graphs), and network science.

如果一个有向图中从任意顶点到任意另一顶点都存在一条路径，我们称它是**强连通的**。一个**强连通分量**（SCC）是一个极大的强连通子图——顶点之间彼此可达的最大集合。将有向图分解为它的 SCC 是图论中的基本操作，在环检测、程序分析（调用图）、网络科学等领域都有应用。

The task my data structures course assigned was: given a directed graph, output all its SCCs. Two classic algorithms solve this in linear time. Kosaraju's algorithm uses two passes of depth-first search, one on the original graph and one on the reverse graph. Tarjan's algorithm needs only a single DFS pass but maintains more state during the traversal. I implemented Kosaraju for my submission because of its conceptual simplicity, though both are covered in full here.

我的数据结构课布置的题目是：给定一个有向图，输出其所有 SCC。两个经典算法可以在线性时间内解决这个问题。Kosaraju 算法使用两趟深度优先搜索，一趟在原图上，一趟在反图上。Tarjan 算法只需一趟 DFS，但在遍历过程中维护更多状态。我提交作业时实现了 Kosaraju，因为它概念上更简单，不过这里两种算法都会完整讲解。

## 2. A Shared Foundation: DFS and Finish Times / 共同基础：DFS 与完成时间

Both Kosaraju and Tarjan rely on depth-first search to explore the graph. Understanding one property of DFS is essential before approaching either algorithm: the relationship between **finish times** and SCC structure.

Kosaraju 和 Tarjan 都依赖深度优先搜索来探索图。在接触任一算法之前，理解 DFS 的一个性质至关重要：**完成时间**与 SCC 结构之间的关系。

When a DFS runs on a directed graph, each vertex receives a **finish time** — the moment the search has finished exploring all vertices reachable from it and backtracks. If the SCCs of the graph are contracted into a **condensation graph**, the result is a directed acyclic graph (DAG). A fundamental property: the vertex with the largest finish time in the entire DFS always belongs to a **source** component of this condensation DAG — a component with no incoming edges from other components. Conversely, the vertex with the smallest finish time belongs to a **sink** component — one with no outgoing edges to other components.

当 DFS 在有向图上运行时，每个顶点获得一个**完成时间**——搜索探索完从它出发的所有可达顶点并回溯的那一刻。如果把图的所有 SCC 收缩成一个**凝聚图**，结果是一个有向无环图（DAG）。一个基本性质是：整个 DFS 中拥有最大完成时间的顶点，必然属于该凝聚 DAG 的一个**源**分量——即没有来自其他分量的入边的分量。反之，拥有最小完成时间的顶点属于一个**汇**分量——即没有通往其他分量的出边的分量。

This fact drives both algorithms. Kosaraju exploits it explicitly by running a second DFS on the reverse graph in decreasing order of finish times. Tarjan exploits it implicitly by tracking the highest reachable ancestor during a single DFS.

这一事实驱动了两个算法。Kosaraju 显式利用它，按完成时间降序在反图上运行第二趟 DFS。Tarjan 隐式利用它，在单趟 DFS 中追踪可达的最高祖先。

## 3. Kosaraju's Algorithm / Kosaraju 算法

Kosaraju's algorithm is conceptually the easiest linear-time SCC algorithm. It consists of three phases.

Kosaraju 算法在概念上是最容易的线性时间 SCC 算法。它由三个阶段组成。

**Phase 1: First DFS on the original graph.** Perform a full DFS traversal of the original directed graph. As each vertex finishes (all its descendants have been explored), push it onto a stack. After the traversal, the stack contains all vertices ordered by decreasing finish time — the last vertex pushed has the largest finish time.

**阶段一：在原图上的第一趟 DFS。** 对原图进行一次完整的 DFS 遍历。每当一个顶点完成（其所有后代都被探索完毕），将它压入一个栈中。遍历结束后，栈中按完成时间降序包含所有顶点——最后压入的顶点拥有最大的完成时间。

**Phase 2: Reverse the graph.** Build the reverse graph — for every directed edge `u → v` in the original graph, add `v → u` to the reverse graph. This is the operation that makes Kosaraju so clean: SCCs are invariant under edge reversal. A set of vertices mutually reachable in the original graph remains mutually reachable in the reverse graph. What changes is the direction of edges _between_ components.

**阶段二：反转图。** 构建反图——对原图中的每条有向边 `u → v`，在反图中添加 `v → u`。这个操作使得 Kosaraju 如此干净：SCC 在边反转下是不变的。一组在原图中彼此可达的顶点，在反图中仍然彼此可达。改变的是分量*之间*的边的方向。

**Phase 3: Second DFS on the reverse graph.** Pop vertices from the stack one by one. For each unvisited vertex, start a DFS on the reverse graph. The set of vertices reached during this DFS forms exactly one SCC. Output it, mark them all as visited, and continue popping.

**阶段三：在反图上的第二趟 DFS。** 从栈中逐个弹出顶点。对每个未访问的顶点，在反图上启动一次 DFS。这次 DFS 所能到达的顶点集合恰好构成一个 SCC。输出该集合，将它们全部标记为已访问，然后继续弹出。

**Why it works.** The first DFS produces a stack where the top vertex belongs to a source component of the original graph. When edges are reversed, source components become sink components — they have no outgoing edges in the reverse graph. Starting a DFS from that vertex on the reverse graph can only reach vertices within its own component, because all edges between components now point _toward_ it, not away. After extracting that component, the process repeats with the next vertex still on the stack that hasn't been visited, which now belongs to the next source component (in the updated graph with the first component removed).

**为什么有效。** 第一趟 DFS 产生了一个栈，其中栈顶顶点属于原图的一个源分量。当边被反转后，源分量变成了汇分量——在反图中它没有出边。从该顶点在反图上启动 DFS，只能到达它自己分量内的顶点，因为所有分量之间的边现在*指向*它，而非远离它。提取完该分量后，对栈中下一个尚未访问的顶点重复此过程，这个顶点现在属于（去掉了第一个分量之后的图的）下一个源分量。

**Complexity.** Each of the three phases — first DFS, graph reversal, second DFS — visits every vertex and every edge exactly once. The total time is O(V + E), strictly linear. The space requirement is O(V) for the stack and visited array, plus O(V + E) for storing both the original and reverse adjacency lists.

**复杂度。** 三个阶段——第一趟 DFS、图反转、第二趟 DFS——每个都恰好访问每个顶点和每条边一次。总时间 O(V + E)，严格线性。空间需求为 O(V)（栈和 visited 数组），加上 O(V + E)（存储原图和反图的邻接表）。

A subtlety in implementation: the reverse graph can be built lazily during the first DFS by creating reverse edges alongside the original ones, or it can be built explicitly in a separate pass. For the adjacency-list representation used here, building it explicitly is straightforward — iterate over all vertices and their outgoing edges, adding the reversed edge to a second adjacency list.

实现上的一个微妙之处：反图可以在第一趟 DFS 期间通过与原边一起创建反向边来惰性构建，也可以在单独一趟扫描中显式构建。对于这里使用的邻接表表示，显式构建是直接的——遍历所有顶点及其出边，将反向边添加到第二个邻接表中。

## 4. Tarjan's Algorithm / Tarjan 算法

Tarjan's algorithm achieves the same O(V + E) result in a single DFS pass. It requires no explicit graph reversal and no second traversal. The cost is additional state — each vertex tracks two integers during the DFS — and a more involved correctness argument. But the implementation is remarkably compact.

Tarjan 算法用单趟 DFS 达到了相同的 O(V + E) 结果。它不需要显式反转图，也不需要第二趟遍历。代价是额外的状态——每个顶点在 DFS 过程中追踪两个整数——以及更复杂的正确性论证。但实现异常紧凑。

**The core idea.** During a DFS, vertices are assigned a **discovery index** (the order they are first visited) and a **lowlink value**. The lowlink of a vertex `v` is the smallest discovery index of any vertex reachable from `v` by following zero or more tree edges and at most one back edge. In other words: how high up in the DFS tree can `v` reach? If a vertex's lowlink equals its own discovery index, then no vertex in its subtree can reach an ancestor above it — meaning this vertex is the **root** of an SCC. All vertices in its subtree that are not part of a lower SCC belong to this one.

**核心思想。** 在一次 DFS 中，顶点被赋予一个**发现序号**（它们首次被访问的顺序）和一个** lowlink 值**。顶点 `v` 的 lowlink 是从 `v` 出发，沿零条或多条树边和至多一条回边所能到达的任何顶点的最小发现序号。换句话说：`v` 在 DFS 树中能向上够到多高？如果一个顶点的 lowlink 等于它自己的发现序号，那么它的子树中没有顶点能够到达它上方的祖先——意味着这个顶点就是一个 SCC 的**根**。其子树中所有不属于更低 SCC 的顶点都属于当前这个 SCC。

**The algorithm in detail.** A stack explicitly tracks vertices currently in the active DFS path that have not yet been assigned to an SCC. When the DFS discovers a new vertex, it assigns it a discovery index, sets its lowlink to that index, pushes it onto the stack, and recurses on its neighbors. When returning from a neighbor `w`: if `w` is still on the stack (i.e., not yet assigned to an SCC), then `(v, w)` is either a tree edge or a back edge to an ancestor still being explored. In either case, `v`'s lowlink is updated to `min(v.lowlink, w.lowlink)`. If `w` has already been assigned to an SCC, the edge `(v, w)` crosses to a different component and is ignored. After all neighbors of `v` have been explored, if `v.lowlink == v.index`, then `v` is the root of an SCC. All vertices above `v` on the stack (including `v` itself) belong to this SCC. Pop them off the stack and output them as one component.

**算法详解。** 一个栈显式追踪当前在活跃 DFS 路径上、尚未被分配到任何 SCC 的顶点。当 DFS 发现一个新顶点时，赋予它一个发现序号，将其 lowlink 设为该序号，压入栈，然后递归其邻居。从邻居 `w` 返回时：若 `w` 仍在栈上（即尚未分配到 SCC），则 `(v, w)` 要么是一条树边，要么是一条连向仍在探索中的祖先的回边。无论哪种情况，`v` 的 lowlink 更新为 `min(v.lowlink, w.lowlink)`。若 `w` 已被分配到某个 SCC，边 `(v, w)` 跨越到另一个分量，被忽略。当 `v` 的所有邻居都探索完毕后，若 `v.lowlink == v.index`，则 `v` 是一个 SCC 的根。栈中 `v` 及以上（包括 `v`）的所有顶点属于这个 SCC。将它们弹出并作为一个分量输出。

**Complexity.** Each vertex is pushed and popped once. Each edge is examined once during the DFS. The only additional work per edge is a constant-time comparison. The total time is O(V + E), and the space is O(V) for the stack, index array, lowlink array, and visited array.

**复杂度。** 每个顶点压入并弹出一次。每条边在 DFS 中被检查一次。每条边上唯一的额外工作是常数时间的比较。总时间 O(V + E)，空间为 O(V)（栈、index 数组、lowlink 数组和 visited 数组）。

## 5. Kosaraju vs. Tarjan: A Comparison / Kosaraju 与 Tarjan 对比

Both algorithms run in O(V + E) time. The differences lie in implementation complexity, the number of passes, and debugging difficulty.

两种算法都在 O(V + E) 时间内运行。区别在于实现复杂度、遍历趟数和调试难度。

**Kosaraju** requires two full DFS passes and an explicit graph reversal. This makes the code longer but the logic is separated into three independent, easily testable phases. If the first DFS produces correct finish times and the graph reversal is correct, the second DFS trivially outputs components. Debugging is modular: you can inspect the finish-time stack before the second pass even begins. The downside is that the entire graph must be stored twice — once forward, once reversed — doubling the memory for adjacency lists. For very large graphs where memory is tight, this can be a liability.

**Kosaraju** 需要两趟完整 DFS 和一次显式图反转。这使得代码更长，但逻辑被分成了三个独立、容易测试的阶段。如果第一趟 DFS 产生正确的完成时间且图反转正确，第二趟 DFS 就平凡地输出分量。调试是模块化的：在第二趟甚至开始之前，就可以检查完成时间栈。缺点在于整张图必须被存储两次——一次正向，一次反向——使邻接表的内存翻倍。对于内存紧张的超大图，这可能是个负担。

**Tarjan** requires a single DFS pass, no graph reversal, and only the original adjacency list. The code is shorter and memory usage is lower. But the algorithm compresses three ideas — discovery times, lowlink propagation, and stack-based component extraction — into a single recursive function. When it fails, debugging requires tracing the interplay of these three mechanisms simultaneously. The `lowlink` update rule in particular has a subtle edge case when handling back edges versus cross edges, and a single misplaced `min` can produce incorrect component boundaries.

**Tarjan** 只需单趟 DFS，不需要图反转，仅需原始邻接表。代码更短，内存占用更低。但该算法将三个思想——发现时间、lowlink 传播和基于栈的分量提取——压缩进一个递归函数中。当它出错时，调试需要同时追踪这三个机制的相互作用。特别是 `lowlink` 更新规则在处理回边与横跨边时有一个微妙的边界情况，一次错放的 `min` 就会产生错误的分量边界。

**Which one to implement?** If you are writing an SCC finder for a production system where both passes can share the same memory, Tarjan's single-pass efficiency is appealing. If you are working on a programming assignment where correctness matters more than elegance, Kosaraju's modularity makes it easier to get right. I chose Kosaraju for my submission precisely for this reason: I could verify the finish-time stack before committing to the second pass.

**该选哪一个？** 如果你在为生产系统编写 SCC 查找器，两次遍历可以共享内存，Tarjan 的单趟效率很有吸引力。如果你在做一道编程作业，正确性比优雅更重要，Kosaraju 的模块化使得它更容易写对。我提交作业时选了 Kosaraju 正是出于这个原因：我可以在进入第二趟之前先验证完成时间栈是否正确。

## 6. Extended Reading: Other Approaches / 延伸阅读：其他方法

### 6.1 Gabow's Algorithm / Gabow 算法

A lesser-known linear-time SCC algorithm exists by Gabow. It is essentially a refinement of Kosaraju that avoids explicitly building the reverse graph. Instead of using a finish-time stack and a reverse graph, it maintains a second stack of vertices ordered by discovery, and uses a path-based approach similar in spirit to Tarjan but arguably easier to reason about than lowlink propagation. Gabow's algorithm uses two stacks: one for the current DFS path (like Tarjan) and one for the boundary vertices of partially completed components. When a component boundary is identified, vertices are popped from both stacks together. The complexity remains O(V + E) with O(V) space. It sees occasional use in competitive programming circles but is far less common in textbooks than Kosaraju or Tarjan.

Gabow 提出了一个不太为人所知的线性时间 SCC 算法。它本质上是 Kosaraju 的细化，避免了显式构建反图。它不使用完成时间栈和反图，而是维护第二个按发现顺序排列的顶点栈，并采用一种精神上类似 Tarjan 但可能比 lowlink 传播更容易推理的基于路径的方法。Gabow 算法使用两个栈：一个用于当前 DFS 路径（类似 Tarjan），另一个用于部分完成的分量的边界顶点。当分量的边界被识别时，顶点从两个栈中一同弹出。复杂度保持 O(V + E)，空间 O(V)。它偶尔出现在算法竞赛圈子中，但在教材中远不如 Kosaraju 或 Tarjan 常见。

### 6.2 Applications of SCC / SCC 的实际应用

SCC decomposition appears wherever directed graphs model real systems with cyclic dependencies. In compilers, call graphs are analyzed to find mutually recursive functions. In databases, dependency graphs detect cycles in schema definitions or transaction wait-for graphs. In social network analysis, SCCs identify echo chambers where every account can reach every other. In model checking, SCC decomposition is a preprocessing step for verifying properties of finite-state systems. The condensation DAG produced by any SCC algorithm is also directly useful: it reveals the hierarchical structure of a complex directed system — which components depend on which, and where the cycles are.

SCC 分解出现在任何以有向图建模含循环依赖的真实系统的地方。在编译器中，调用图被分析以找出相互递归的函数。在数据库中，依赖图检测模式定义或事务等待图中的环。在社交网络分析中，SCC 识别出每个账户都能触达彼此的“回音室”。在模型检测中，SCC 分解是验证有限状态系统性质的预处理步骤。任何 SCC 算法产生的凝聚 DAG 也直接有用：它揭示了一个复杂有向系统的层次结构——哪些分量依赖于哪些，以及环路位于何处。

## Appendix A: Kosaraju's Algorithm — Full Implementation / 附录 A：Kosaraju 算法完整实现

```c
/* Kosaraju's SCC algorithm on a directed graph represented by adjacency lists.
   Assumes the following types are defined:
   typedef int Vertex;
   typedef struct VNode *PtrToVNode;
   struct VNode { Vertex Vert; PtrToVNode Next; };
   typedef struct GNode *Graph;
   struct GNode { int NumOfVertices; int NumOfEdges; PtrToVNode *Array; };
*/

#include <stdlib.h>
#include <stdio.h>

#define MAX_VERTICES 1000

/* ---------- Graph construction utilities ---------- */
Graph CreateGraph(int VertexNum) {
    Graph G = (Graph)malloc(sizeof(struct GNode));
    G->NumOfVertices = VertexNum;
    G->NumOfEdges = 0;
    G->Array = (PtrToVNode *)malloc(VertexNum * sizeof(PtrToVNode));
    for (int i = 0; i < VertexNum; i++)
        G->Array[i] = NULL;
    return G;
}

void AddEdge(Graph G, Vertex from, Vertex to) {
    PtrToVNode newNode = (PtrToVNode)malloc(sizeof(struct VNode));
    newNode->Vert = to;
    newNode->Next = G->Array[from];
    G->Array[from] = newNode;
    G->NumOfEdges++;
}

/* ---------- Kosaraju ---------- */
void DFS1(Graph G, Vertex v, int visited[], int stack[], int *top) {
    visited[v] = 1;
    for (PtrToVNode p = G->Array[v]; p != NULL; p = p->Next) {
        if (!visited[p->Vert])
            DFS1(G, p->Vert, visited, stack, top);
    }
    stack[(*top)++] = v;   // Push after all descendants are processed
}

Graph ReverseGraph(Graph G) {
    Graph RG = CreateGraph(G->NumOfVertices);
    for (Vertex u = 0; u < G->NumOfVertices; u++) {
        for (PtrToVNode p = G->Array[u]; p != NULL; p = p->Next) {
            AddEdge(RG, p->Vert, u);   // Reverse the edge direction
        }
    }
    return RG;
}

void DFS2(Graph G, Vertex v, int visited[], int component[], int compIdx) {
    visited[v] = 1;
    component[v] = compIdx;
    printf("%d ", v);   // Print the vertex as part of current SCC
    for (PtrToVNode p = G->Array[v]; p != NULL; p = p->Next) {
        if (!visited[p->Vert])
            DFS2(G, p->Vert, visited, component, compIdx);
    }
}

void Kosaraju(Graph G) {
    int *visited = (int *)calloc(G->NumOfVertices, sizeof(int));
    int *stack   = (int *)malloc(G->NumOfVertices * sizeof(int));
    int *component = (int *)malloc(G->NumOfVertices * sizeof(int));
    int top = 0;

    // Phase 1: first DFS on original graph
    for (Vertex v = 0; v < G->NumOfVertices; v++) {
        if (!visited[v])
            DFS1(G, v, visited, stack, &top);
    }

    // Phase 2: build reverse graph
    Graph RG = ReverseGraph(G);

    // Phase 3: second DFS on reverse graph, in decreasing finish-time order
    for (int i = 0; i < G->NumOfVertices; i++)
        visited[i] = 0;   // reset visited for the second pass

    int compCount = 0;
    while (top > 0) {
        Vertex v = stack[--top];
        if (!visited[v]) {
            printf("SCC %d: { ", compCount);
            DFS2(RG, v, visited, component, compCount);
            printf("}\n");
            compCount++;
        }
    }

    // Cleanup (RG, visited, stack, component not shown for brevity)
    free(visited); free(stack); free(component);
    // Free RG: iterate and free each VNode, then Array, then GNode
}
```

## Appendix B: Tarjan's Algorithm — Full Implementation / 附录 B：Tarjan 算法完整实现

```c
/* Tarjan's SCC algorithm. Assumes the same graph representation as above. */

#include <stdlib.h>
#include <stdio.h>

#define UNDEFINED -1
#define MIN(a, b) ((a) < (b) ? (a) : (b))

void TarjanDFS(Graph G, Vertex v, int index[], int lowlink[],
               int onStack[], int stack[], int *stackTop, int *currentIndex) {
    index[v] = *currentIndex;
    lowlink[v] = *currentIndex;
    (*currentIndex)++;
    stack[(*stackTop)++] = v;
    onStack[v] = 1;

    for (PtrToVNode p = G->Array[v]; p != NULL; p = p->Next) {
        Vertex w = p->Vert;
        if (index[w] == UNDEFINED) {
            // Tree edge: w has not been visited
            TarjanDFS(G, w, index, lowlink, onStack, stack, stackTop, currentIndex);
            lowlink[v] = MIN(lowlink[v], lowlink[w]);
        } else if (onStack[w]) {
            // Back edge: w is an ancestor still on the stack
            lowlink[v] = MIN(lowlink[v], index[w]);
        }
        // If w is visited and NOT onStack, it's a cross edge to an already-completed SCC.
        // Ignore it: its lowlink is irrelevant to v's component.
    }

    // If v is the root of an SCC
    if (lowlink[v] == index[v]) {
        printf("SCC: { ");
        Vertex w;
        do {
            w = stack[--(*stackTop)];
            onStack[w] = 0;
            printf("%d ", w);
        } while (w != v);
        printf("}\n");
    }
}

void Tarjan(Graph G) {
    int *index    = (int *)malloc(G->NumOfVertices * sizeof(int));
    int *lowlink  = (int *)malloc(G->NumOfVertices * sizeof(int));
    int *onStack  = (int *)calloc(G->NumOfVertices, sizeof(int));
    int *stack    = (int *)malloc(G->NumOfVertices * sizeof(int));
    int stackTop  = 0;
    int currentIndex = 0;

    for (int v = 0; v < G->NumOfVertices; v++)
        index[v] = UNDEFINED;

    for (Vertex v = 0; v < G->NumOfVertices; v++) {
        if (index[v] == UNDEFINED)
            TarjanDFS(G, v, index, lowlink, onStack, stack,
                      &stackTop, &currentIndex);
    }

    free(index); free(lowlink); free(onStack); free(stack);
}
```
