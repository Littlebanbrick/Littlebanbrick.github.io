# Asynchronous and Atomic: Starting from a Blog Like Bug

<!--preview: 异步和原子的核心概念与协作方式-->

# 异步与原子：从博客点赞 Bug 说起

## 1. The Birth of a Real Bug / 一个真实 Bug 的诞生

In the earliest version of my blog's like feature, the frontend code followed a disastrously simple logic: whenever a user clicked the heart icon, the UI toggled the like state immediately — before the request even reached the backend, let alone received a response. The result was predictable chaos. A user would click like, the heart would light up, but the network request might fail silently. If the user then clicked again to unlike, and _that_ request succeeded, the backend would decrement the like count — even though the like was never actually recorded in the first place. The net effect: the like count drifted negative, and the data became unreliable.

在我博客最早的点赞功能里，前端遵循了一套灾难性的简单逻辑：用户一点爱心图标，UI 立刻切换点赞状态——请求甚至还没到达后端，更别说拿到响应了。结果是可预见的混乱：用户点赞，爱心亮了，但网络请求可能悄无声息地失败；用户再点一下取消点赞，偏偏*这次*请求成功了——于是后端的点赞数减了一，可实际上这个赞从来就没加上去过。最终效果：点赞数变成负数，数据不可信。

This bug contains two intertwined problems that took me a long time to even name: **asynchronous** — the frontend didn't wait for the request to complete before acting, and **atomic** — the backend's multiple database operations weren't bundled into an indivisible unit. What follows is what I've learned about these two concepts, explained through the very code that now keeps my blog running correctly.

这个 bug 里藏着两个纠缠在一起的问题，我花了很久才知道该怎么称呼它们：**异步**——前端没等请求完成就抢先行动；**原子**——后端的多步数据库操作没有被捆成一个不可分割的单元。下面就是我对这两个概念的学习总结，全部用我博客里现在正在运行的代码来解释。

## 2. Terminology: Let's Get the Terms Straight First / 名词解释：先把术语讲清楚

**Asynchronous** describes a way of executing tasks where you _don't_ stand around waiting for a slow operation to finish. You submit the task, continue with other work, and handle the result when it eventually arrives. In my blog, the slow operations are network requests — `fetch` calls from the browser to my FastAPI server — and the "don't stand around" part is what keeps the page responsive while waiting.

**异步**描述的是一种执行任务的方式：你*不*站在那干等一个慢操作完成。你提交任务，继续干别的事，等结果到了再处理。在我的博客里，慢操作就是网络请求——从浏览器到 FastAPI 服务器的 `fetch` 调用——而“不干等”这点就是页面在等待时还能保持响应的原因。

**Promise** is JavaScript's object representing a value that doesn't exist yet but will exist at some point in the future. When you call `fetch()`, it doesn't return the response data directly — it returns a Promise _of_ that data. You then use `.then()` to say "when the value arrives, do this with it," or `await` to pause execution inside an `async` function until the value lands.

**Promise** 是 JavaScript 里用来表示“一个现在还不存在、但未来某个时刻会出现的值”的对象。当你调用 `fetch()` 时，它不会直接返回响应数据——它返回的是一个*包裹了未来数据*的 Promise。你接着用 `.then()` 来表达“等值到了就拿它做这个”，或者用 `await` 让 `async` 函数里的代码暂停，直到值落地。

**async / await** is syntax sugar built on top of Promises. An `async` function automatically returns a Promise, and inside it, `await` pauses execution until the Promise it's waiting on resolves. It makes asynchronous code _look_ synchronous, which is easier to read, but it's still doing the same thing under the hood as `.then()`.

**async / await** 是构建在 Promise 之上的语法糖。一个 `async` 函数自动返回 Promise，在里面 `await` 会暂停执行，直到它所等的 Promise 解决。它让异步代码*看起来*像同步的，读起来更舒服，但本质上和 `.then()` 做的是同一件事。

**Side Effect** is any operation that reaches outside a function's local scope — making an HTTP request, writing to a database, modifying a DOM element, setting a timer. In React, side effects belong inside `useEffect` hooks, not directly in the component body. My `handleLike` function is a side effect: it fires off a network request that changes state on the server.

**副作用**是指任何超出函数本地范围的操作——发 HTTP 请求、写数据库、修改 DOM 元素、设定时器。在 React 里，副作用应该放在 `useEffect` 钩子里，而不是直接写在组件主体中。我的 `handleLike` 函数就是一个副作用：它发起一次网络请求，改变服务器上的状态。

**Database Transaction** is a group of database operations that are treated as a single, indivisible unit. If all operations succeed, they're committed together. If any one fails, the entire group is rolled back — nothing is left half-done. In my FastAPI backend, this is done with `async with database.transaction():` blocks. Without transactions, a crash in the middle of a multi-step update leaves the database in an inconsistent state.

**数据库事务**是一组被当作单个不可分割单元处理的数据库操作。所有操作成功就一起提交；任何一个失败就整体回滚——不会留下完成一半的烂摊子。在我的 FastAPI 后端里，这用 `async with database.transaction():` 代码块来实现。没有事务的话，多步更新中途崩溃就会让数据库停留在不一致的状态。

## 3. Asynchronous: The Frontend Must Wait / 异步：前端不能“先斩后奏”

### 3.1 Why the Old Implementation Failed / 旧版写法为什么出错

The original like button logic (which I thankfully no longer have the exact code for) followed this pattern:

原始点赞按钮的逻辑（幸好我已经找不到确切代码了）遵循了这样的模式：

```
User clicks like
↓
Frontend immediately toggles the heart icon and updates the count
↓
A request is sent to the backend... maybe, at some point
↓
If the request fails? Too late — the UI already changed.
```

The problem is that the UI update happened _before_ the asynchronous operation completed. This is the essence of mishandling asynchrony: acting on the assumption that a future result is guaranteed, when in reality networks are unreliable and servers can return errors.

问题在于 UI 更新发生在了异步操作完成*之前*。这就是异步处理不当的本质：假设一个未来的结果已经稳了，但实际上网络不可靠，服务器也会返回错误。

### 3.2 The Fix: Wait for the Result, Then Update / 修复后的写法：等结果，再更新

Here is the `handleLike` function from my current `PostPage.jsx`:

下面是我现在 `PostPage.jsx` 里的 `handleLike` 函数：

```javascript
const handleLike = async () => {
  if (isLiking) return;
  const userRes = await getCurrentUser();
  if (!userRes?.data?.username) {
    alert("Please login to like the post.");
    return;
  }

  try {
    const res = await authFetch(`/api/posts/${id}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const data = await res.json();
    if (data?.data) {
      setPost({ ...post, likes_count: data.data.likes_count });
      setIsLiked(data.data.liked);
      authFetch(`/api/posts/${id}/likes`)
        .then((r) => r.json())
        .then((res) => setLikesUsers(res.data || []));
    }
  } catch (error) {
    console.log("Please login to like the post.");
  }
};
```

The key difference from the old version is the sequence:

和旧版的关键区别在于顺序：

1. `await getCurrentUser()` — first, check if the user is logged in. The code _waits_ for this to complete.
   `await getCurrentUser()` —— 先检查用户是否登录。代码*等待*这个完成。

2. `await authFetch(...)` — send the like request and _wait_ for the server's response.
   `await authFetch(...)` —— 发出点赞请求，*等待*服务器响应。

3. `const data = await res.json()` — parse the response body and _wait_ for that too.
   `const data = await res.json()` —— 解析响应体，也*等待*。

4. Only if `data?.data` exists — meaning the server confirmed success — does the UI update.
   只有在 `data?.data` 存在时——意味着服务器确认成功——UI 才更新。

The frontend no longer "shoots first and asks questions later." It submits the request, waits for confirmation, and only then reflects the change in the UI. This is the correct mental model for asynchronous operations: the UI is a _mirror_ of the server's state, not a source of truth.

前端不再“先斩后奏”。它提交请求，等待确认，然后才在 UI 中反映变化。这才是异步操作正确的心智模型：UI 是服务器状态的*镜子*，不是真相的来源。

### 3.3 The Missing `isLiking`: A Hidden Risk / `isLiking` 的缺失：一个藏着的隐患

其实，上面这段修复后的代码似乎存在一个我最初没有注意到的问题。虽然 `handleLike` 开头有 `if (isLiking) return;` 这行守卫，但我仔细检查后发现 `isLiking` 从 `useState(false)` 声明之后就再也没有被设置过。也就是说，这个守卫形同虚设——`isLiking` 永远是 `false`，永远不会挡住第二次点击。如果用户快速双击爱心按钮，两个 `handleLike` 调用会先后触发，同时发出两个 `POST` 请求。后端的事务虽然能保证数据一致性（见原子篇），但我们无端地发送了重复请求，把竞态压力完全推给了后端。正确的做法是，在函数开始真正逻辑之前把门锁上，最后在 `finally` 里解锁，不管成功还是失败都要保证按钮恢复正常。

The fix should look like this:

修复后的写法应该是这样：

```javascript
const handleLike = async () => {
  if (isLiking) return; // Guard against concurrent calls
  setIsLiking(true); // Lock the door
  try {
    // ... the actual logic ...
  } catch (error) {
    // ... error handling ...
  } finally {
    setIsLiking(false); // Unlock, regardless of success or failure
  }
};
```

The `finally` block ensures the lock is released even if an error occurs, so the button doesn't stay permanently disabled. This is a standard pattern for handling race conditions in async button handlers.

`finally` 块确保即使发生错误，锁也会被释放，按钮不会永久禁用。这是异步按钮处理器中处理竞态条件的标准模式。

### 3.4 Is Frontend `await` the Same Concept as Backend `async def`? / 前端 await 和后端 async def 是同一个概念吗？

Yes — and no. They are the same _idea_: pause this code path until the awaited operation finishes, freeing up the thread to handle other work in the meantime. But they operate in different runtime environments. In JavaScript (the browser), `await` pauses inside an `async` function while the browser's event loop keeps handling clicks, timers, and other events. In Python (FastAPI with `async def`), `await` pauses the coroutine while the asyncio event loop serves other requests. Same pattern, different engines under the hood. The important takeaway: both are saying "don't block — keep the system responsive while waiting."

是——也不是。它们有相同的*思想*：暂停当前代码路径直到等待的操作完成，同时释放线程去处理其他工作。但它们运行在不同的运行时环境里。在 JavaScript（浏览器）中，`await` 在 `async` 函数里暂停，同时浏览器的事件循环继续处理点击、定时器和其他事件。在 Python（FastAPI 的 `async def`）中，`await` 暂停协程，同时 asyncio 事件循环服务其他请求。模式一样，底层引擎不同。重要的结论是：两者都在说“别堵住——在等待的时候保持系统响应”。

## 4. Atomic: The Backend Must Not Half-Finish / 原子：后端不能“完成一半”

### 4.1 What Atomicity Is and Why Databases Need It / 什么是原子性，为什么数据库需要它

Atomicity means a group of operations is treated as a single, indivisible unit. Either everything happens, or nothing happens. There is no "halfway done" state visible to the outside world. In database terms, this is the "A" in ACID (Atomicity, Consistency, Isolation, Durability).

原子性意味着一组操作被当作单个不可分割的单元处理。要么全部发生，要么全部不发生。外界永远不会看到一个“完成一半”的中间状态。用数据库术语来说，这就是 ACID（原子性、一致性、隔离性、持久性）里的 "A"。

A classic example: transferring money from account A to account B requires two operations — deduct from A, add to B. If the system crashes after deducting from A but before adding to B, the money simply disappears. Wrapping both in a transaction prevents this: if the second operation fails, the first is rolled back.

经典例子：从 A 账户转账到 B 账户需要两步操作——从 A 扣款，往 B 加款。如果在扣完 A 之后、加给 B 之前系统崩溃了，钱就凭空消失了。把两者包在一个事务里就能防止这种事：第二个操作失败的话，第一个会回滚。

### 4.2 A Real Transaction in My Blog: The Like Feature / 我博客里的实际事务：点赞

Here is the `toggle_like` endpoint from my `main.py`:

下面是我 `main.py` 里的 `toggle_like` 端点：

```python
async with database.transaction():
    existing = await database.fetch_one(check_query)

    if existing:
        delete_query = likes.delete().where(likes.c.id == existing["id"])
        await database.execute(delete_query)

        update_query = posts.update().where(posts.c.id == post_id).values(
            likes_count=posts.c.likes_count - 1
        )
        await database.execute(update_query)
        liked = False
    else:
        now = get_current_time()
        insert_query = likes.insert().values(
            user_name=user_name,
            post_id=post_id,
            created_at=now
        )
        await database.execute(insert_query)

        update_query = posts.update().where(posts.c.id == post_id).values(
            likes_count=posts.c.likes_count + 1
        )
        await database.execute(update_query)
        liked = True
```

Inside this `async with database.transaction():` block, there are two database operations that must succeed or fail together: inserting (or deleting) a row in the `likes` table, and incrementing (or decrementing) the `likes_count` in the `posts` table. If the insert succeeds but the counter update fails, the database would show a like record with no corresponding count change — an inconsistency that is very hard to debug later. The transaction guarantees that both succeed or both roll back. No half-likes.

在这个 `async with database.transaction():` 代码块里，有两个数据库操作必须一起成功或一起失败：在 `likes` 表里插入（或删除）一行，以及在 `posts` 表里更新（或减少）`likes_count`。如果插入成功了但计数器更新失败了，数据库就会出现一条点赞记录却没有对应的计数变化——这种不一致后期非常难排查。事务保证了要么两者都成功，要么都回滚。不存在半个赞。

### 4.3 Comments Use Transactions Too / 评论功能同样用了事务

My `add_comment` endpoint follows the same pattern:

我的 `add_comment` 端点遵循同样的模式：

```python
async with database.transaction():
    query = comments.insert().values(...)
    user_comment_id = await database.execute(query)

    await database.execute(
        posts.update().where(posts.c.id == post_id).values(
            comment_count=posts.c.comment_count + 1
        )
    )
```

Inserting a comment and incrementing the comment count are bound together. Without the transaction, a crash between these two operations would leave the comment count permanently wrong.

插入评论和增加评论计数被绑定在一起。没有事务的话，这两步之间如果崩溃，评论计数就会永久性地错下去。

### 4.4 Does the Frontend Have Atomic Operations? / 前端有没有原子操作？

No. The frontend's `handleLike` function does multiple things: it calls `setPost`, `setIsLiked`, and then fires another `authFetch` to refresh the likes user list. These are not atomic. Between `setIsLiked(true)` and the likes list refresh, the UI is temporarily in an intermediate state where the heart is colored but the likers list hasn't updated yet. This is usually fine for UI purposes because React batches state updates and re-renders efficiently, but it's not atomic in the database sense. The key difference: databases need atomicity to prevent permanent data corruption; frontends need only to manage user expectations during brief transitions, which is why we have loading spinners and disabled buttons during requests.

没有。前端的 `handleLike` 函数做了好几件事：调用 `setPost`、`setIsLiked`，再发一个 `authFetch` 刷新点赞用户列表。这些不是原子的。在 `setIsLiked(true)` 和点赞列表刷新之间，UI 短暂地处于中间状态——爱心变色了，但点赞列表还没更新。这在 UI 层面通常没问题，因为 React 会批量处理状态更新并高效重渲染，但从数据库的语义来说它不原子。关键区别在于：数据库需要原子性来防止永久性的数据损坏；前端只需要在短暂过渡期间管理用户预期，所以我们在请求期间会有 loading 动画和禁用按钮。

## 5. Async + Atomic: How They Work Together / 异步 + 原子：它们如何协作

In my blog's like feature, the asynchronous frontend and the atomic backend now form a complete safety net:

在我博客的点赞功能里，异步的前端和原子的后端现在构成了一张完整的安全网：

1. **Frontend (async):** The `handleLike` function _awaits_ the server's response before changing the UI. If the request fails, the UI doesn't change.
   **前端（异步）：**`handleLike` 函数在改变 UI 之前*等待*服务器的响应。请求失败，UI 就不变。

2. **Backend (atomic):** The `toggle_like` endpoint wraps its two database writes in a transaction. If either fails, both roll back.
   **后端（原子）：**`toggle_like` 端点把两次数据库写入包在事务里。任何一步失败，两者都回滚。

3. **Together:** The frontend waits for a real answer; the backend guarantees that answer reflects a consistent database state.
   **配合起来：** 前端等待真实的答案；后端保证那个答案反映的是数据库的一致状态。

These two concepts are fundamentally _orthogonal_ — they solve different problems on different layers of the stack — but they compose elegantly. Asynchrony handles "this takes time, I shouldn't freeze while waiting." Atomicity handles "these multiple steps form one logical unit, and nobody should see the space between them."

这两个概念本质上是*正交*的——它们解决栈上不同层面的不同问题——但组合起来很优雅。异步处理“这需要时间，我不该在等待时卡死”；原子处理“这些多步骤组成一个逻辑单元，没人应该看到它们之间的缝隙”。

## 6. A Cheat Sheet: Common Patterns and Key Points / 一张小抄：常用模式与要点

| Concept / 概念                      | Where it matters / 哪里重要           | Signal phrase / 标志性写法                                   |
| ----------------------------------- | ------------------------------------- | ------------------------------------------------------------ |
| Asynchronous / 异步                 | Frontend network requests, backend IO | `async`, `await`, `.then()`, `fetch`                         |
| Atomic / 原子                       | Backend multi-step database writes    | `async with database.transaction():`                         |
| Not atomic / 不原子                 | Frontend UI state updates             | `setState` calls — these are batched but not transactional   |
| Race condition guard / 竞态条件防护 | Frontend button handlers              | `if (isLiking) return;` + `setIsLiking(true)` in try/finally |

One sentence I'm taking away from all of this: **wait for the truth from the server before updating the UI, and never let the database see a half-finished logical operation.**

我从这一切里带走一句话：**等服务器给你真相再更新 UI，别让数据库看到完成一半的逻辑操作。**

## 7. Where to Go from Here / 还能往哪深入

For now, my blog's like and comment features are solid. But as the codebase grows, there are natural next steps worth being aware of:

目前我的博客点赞和评论功能已经稳了。但随着代码库增长，有一些自然的进阶方向值得知道：

- **Optimistic UI updates (乐观 UI 更新):** The opposite of what I do now — update the UI _immediately_, then roll back if the server returns an error. Used by Twitter, GitHub, and other apps where perceived speed matters more than strict accuracy. It requires careful error recovery and is not something to reach for lightly.
  和我现在的做法相反——*立刻*更新 UI，如果服务器返回错误再回滚。Twitter、GitHub 等应用都这么干，在感知速度比严格准确更重要的场景下用。它需要精细的错误恢复，不是随便就上的。

- **React Query / TanStack Query:** A library that handles caching, automatic refetching, and optimistic updates for server state. It would replace my manual `loading` / `error` / `data` tri-state pattern with a battle-tested abstraction.
  一个库，专门处理服务端状态的缓存、自动重刷和乐观更新。它能用久经考验的抽象替换我手写的 `loading` / `error` / `data` 三态模式。

- **Idempotency keys (幂等键):** For payment-like operations where a duplicate request could be catastrophic, you assign a unique key to each request so the server can detect and ignore duplicates. My like toggle is already naturally idempotent (toggling twice takes you back), but this becomes critical for non-idempotent operations.
  对类似支付这种重复请求可能灾难性的操作，你给每个请求分配一个唯一的键，服务器就能检测并忽略重复。我的点赞切换天然幂等（切两次就回去了），但这对不幂等的操作至关重要。

None of these are urgent for my current project. The point of learning async and atomic isn't to immediately adopt every advanced pattern — it's to recognize which problems each concept solves, and to know when you need them.

这些对我当前的项目都不紧急。学习异步和原子的意义不在于立刻用上每一个高级模式，而是认清每个概念解决什么问题，在需要的时候知道该搬出哪个。
