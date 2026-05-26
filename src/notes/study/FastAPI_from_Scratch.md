# FastAPI from Scratch

<!-- preview: 一份基于逆向学习视角的、从零开始的 FastAPI 学习笔记-->

# 从零开始学 FastAPI

## 0. Why FastAPI (and Leaving Flask Behind) / 为什么用 FastAPI（以及告别 Flask）

I first learned backend web development with Flask. Harvard's CS50 introduced it as the go‑to Python micro‑framework: a few decorators, a `jsonify` call, and a server was running. Flask is elegant in its minimalism. But when I started building my blog, Flask's minimalism began to feel like a constraint. Request validation was manual. API documentation had to be written separately with extensions like `flasgger`. Async support was bolted on rather than native. And every endpoint required boilerplate to convert request data into Python objects and validate them.

我最开始学后端是用 Flask。哈佛 CS50 把 Flask 作为 Python 微框架的首选：几个装饰器，调一下 `jsonify`，服务器就跑起来了。Flask 的极简是优雅的。但当我开始搭建博客时，Flask 的简约开始让我感到束缚。请求验证要手写。API 文档得靠 `flasgger` 这样的扩展单独维护。异步支持是外挂而非原生。每个端点都需要一堆样板代码，把请求数据转成 Python 对象再校验。

FastAPI addresses these exact pain points without sacrificing the simplicity that made Flask appealing. The decorator syntax is similar — `@app.get("/")` instead of `@app.route("/")` — but the infrastructure beneath it is fundamentally different. FastAPI is built on three pillars:

FastAPI 正好解决了这些痛点，同时没有丢掉让 Flask 吸引人的那种简单。装饰器语法很相似——`@app.get("/")` 代替了 `@app.route("/")`——但底层基础设施截然不同。FastAPI 建立在三个支柱上：

- **Native async/await.** Unlike Flask's synchronous core (where async requires extensions like `quart`), FastAPI is built on Starlette and runs async natively. Long‑running operations like database queries or external API calls don't block the server. My blog backend uses `async def` for every endpoint, and `await database.fetch_all(...)` for database access — these are not afterthoughts; they are the default.
  **原生 async/await。** 与 Flask 的同步核心不同（那里异步需要 `quart` 这样的扩展），FastAPI 基于 Starlette，原生支持异步运行。长时间运行的操作，比如数据库查询或调用外部 API，不会阻塞服务器。我的博客后端每个端点都用 `async def`，数据库访问用 `await database.fetch_all(...)`——这些不是事后补充，而是默认做法。

- **Automatic API documentation.** FastAPI generates OpenAPI schemas from your Python type hints. The `/docs` (Swagger UI) and `/redoc` endpoints appear automatically. You don't write a separate specification file. You write Python, and the documentation exists. This alone saves hours on a multi‑endpoint project like a blog.
  **自动生成 API 文档。** FastAPI 从 Python 类型提示生成 OpenAPI 模式。`/docs`（Swagger UI）和 `/redoc` 端点自动出现。你不需要写单独的规范文件。你写 Python，文档就存在了。光这一点，在一个像博客这样的多端点项目上就能省下数小时。

- **Pydantic‑powered validation.** Request bodies are defined as Pydantic models. FastAPI parses incoming JSON, validates types, and returns a clear 422 error if validation fails — all without you writing a single `if not isinstance(...)` check. The same models document the expected request and response shapes in the OpenAPI schema.
  **基于 Pydantic 的验证。** 请求体用 Pydantic 模型定义。FastAPI 解析收到的 JSON，验证类型，如果验证失败就返回清晰的 422 错误——所有这些都不需要你写哪怕一行 `if not isinstance(...)` 检查。同样的模型在 OpenAPI 模式中记录预期的请求和响应结构。

The transition from Flask is not a rejection of Flask. It is an acknowledgement that different projects have different requirements. Flask remains excellent for prototypes, small tools, and situations where simplicity is the highest virtue. FastAPI is the natural choice when you know from the start that your API will grow, that you will need async database access, and that you want auto‑generated documentation without extra tooling. My blog began with these requirements. FastAPI met them.

从 Flask 迁移过来并非对 Flask 的否定。这是承认不同项目有不同的需求。Flask 在原型、小工具以及简单性为最高美德的情境中依然出色。当你知道自己的 API 会增长，会需要异步数据库访问，而且你希望在没有额外工具的情况下拥有自动生成的文档时，FastAPI 是自然而然的选择。我的博客一开始就有这些需求。FastAPI 满足了它们。

## 1. A Minimal Application / 最小的应用

A FastAPI application starts with a file — conventionally `main.py` — and two lines that create an app instance.

一个 FastAPI 应用从一个文件开始——通常叫 `main.py`——以及创建应用实例的两行代码。

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello, World"}
```

Save this and run it with `uvicorn main:app --reload`. The server starts on `http://127.0.0.1:8000`. Visiting the URL returns a JSON response. That's the entire application. There is no `app.run()`, no `if __name__ == "__main__"` boilerplate. Uvicorn handles the server; FastAPI handles the routing.

保存后用 `uvicorn main:app --reload` 运行。服务器在 `http://127.0.0.1:8000` 启动。访问这个 URL 会返回一个 JSON 响应。这就是整个应用。没有 `app.run()`，没有 `if __name__ == "__main__"` 样板。Uvicorn 处理服务器；FastAPI 处理路由。

If you come from Flask, this will look familiar. The Flask equivalent would be:

如果你从 Flask 过来，这看起来很熟悉。Flask 的等价写法是：

```python
from flask import Flask

app = Flask(__name__)

@app.route("/")
def root():
    return {"message": "Hello, World"}  # Flask would need jsonify
```

The differences are subtle but significant. FastAPI automatically converts the returned dictionary to JSON. Flask requires `jsonify()` for the same behavior. FastAPI's `@app.get("/")` is explicit about the HTTP method; Flask's `@app.route("/")` defaults to GET but can accept any method unless specified. And critically, the FastAPI endpoint is `async def` — it can await asynchronous operations directly, whereas Flask's synchronous view function would need a different setup for async.

区别细微但重要。FastAPI 自动将返回的字典转换为 JSON。Flask 需要 `jsonify()` 才能达到同样效果。FastAPI 的 `@app.get("/")` 显式声明了 HTTP 方法；Flask 的 `@app.route("/")` 默认为 GET 但除非特别指定，否则可以接受任何方法。而且关键的是，FastAPI 的端点是 `async def`——它可以直接 await 异步操作，而 Flask 的同步视图函数需要不同的配置才能支持异步。

To see the automatic documentation, go to `http://127.0.0.1:8000/docs`. You'll find an interactive Swagger UI showing your `GET /` endpoint, its expected response, and the ability to test it directly from the browser. The `/redoc` endpoint provides a cleaner, read‑only documentation page. Neither requires configuration.

要看到自动文档，访问 `http://127.0.0.1:8000/docs`。你会看到一个交互式 Swagger UI，显示你的 `GET /` 端点、它的预期响应，以及直接在浏览器中测试它的能力。`/redoc` 端点提供一个更干净、只读的文档页面。两者都不需要配置。

This automatic documentation is not a gimmick. In a project with dozens of endpoints — like my blog, which has endpoints for posts, comments, likes, messages, photos, notes, user management, admin operations, and more — manually maintaining API documentation is a constant source of drift between what the code does and what the documentation claims. FastAPI eliminates that drift by making the code the documentation.

这种自动文档不是花招。在一个拥有几十个端点的项目中——比如我的博客，有帖子、评论、点赞、留言、照片、笔记、用户管理、管理员操作等等——手动维护 API 文档会导致代码实际行为与文档声称之间的持续漂移。FastAPI 通过让代码成为文档消除了这种漂移。

## 2. Path Parameters, Query Strings, and Request Body / 路径参数、查询字符串与请求体

Most API endpoints are not static. They accept input from the client: an ID in the URL, filter parameters in the query string, or JSON data in the request body. FastAPI handles all three using Python type hints as the single source of truth.

大多数 API 端点不是静态的。它们接受客户端的输入：URL 中的 ID、查询字符串中的过滤参数，或请求体中的 JSON 数据。FastAPI 使用 Python 类型提示作为唯一真源来处理这三种输入。

### 2.1 Path Parameters / 路径参数

A path parameter is a dynamic segment of the URL, like `/posts/3` or `/users/joshua`. In FastAPI, you declare it as a function parameter with a type hint.

路径参数是 URL 中的动态片段，比如 `/posts/3` 或 `/users/joshua`。在 FastAPI 中，你把它声明为带类型提示的函数参数。

```python
@app.get("/posts/{post_id}")
async def get_post(post_id: int):
    # FastAPI automatically converts the string "3" to integer 3
    # FastAPI 自动把字符串 "3" 转换为整数 3
    return {"post_id": post_id}
```

If the client requests `/posts/abc`, FastAPI returns a clear 422 error: "value is not a valid integer." You didn't write that error handling. The type hint `int` triggered automatic parsing and validation. This is the pattern that runs throughout FastAPI: declare what you expect, and the framework enforces it.

如果客户端请求 `/posts/abc`，FastAPI 返回一个清晰的 422 错误："value is not a valid integer"。你没有写那段错误处理。类型提示 `int` 触发了自动解析和验证。这就是贯穿 FastAPI 的模式：声明你期望什么，框架来强制执行。

### 2.2 Query Parameters / 查询参数

Query parameters are the key‑value pairs after the `?` in a URL: `/posts?page=2&size=10`. In FastAPI, function parameters that are not part of the path are automatically treated as query parameters.

查询参数是 URL 中 `?` 后面的键值对：`/posts?page=2&size=10`。在 FastAPI 中，不属于路径的函数参数自动被视为查询参数。

```python
@app.get("/posts")
async def list_posts(page: int = 1, size: int = 10):
    # page and size come from the query string
    # page 和 size 来自查询字符串
    return {"page": page, "size": size}
```

Default values make parameters optional. `page: int = 1` means the client can omit `page`, and it defaults to 1. Parameters without defaults (e.g., `q: str`) become required query parameters. Again, the type hints handle validation: `page=abc` returns a 422 error.

默认值让参数可选。`page: int = 1` 意味着客户端可以省略 `page`，它默认为 1。没有默认值的参数（如 `q: str`）变成必填查询参数。同样，类型提示处理验证：`page=abc` 返回 422 错误。

A common beginner mistake is confusing query parameters with path parameters. The rule: if the value identifies a _resource_, it belongs in the path (`/posts/3`). If it _modifies_ how the resource is fetched (`/posts?sort=date`), it belongs in the query string. FastAPI enforces this distinction structurally — path parameters are part of the URL template; query parameters are function arguments with default values.

一个常见的新手错误是混淆查询参数和路径参数。规则是：如果值标识一个*资源*，它属于路径（`/posts/3`）。如果它*修改*资源的获取方式（`/posts?sort=date`），它属于查询字符串。FastAPI 从结构上强制执行这种区分——路径参数是 URL 模板的一部分；查询参数是带默认值的函数参数。

### 2.3 Request Body / 请求体

When the client needs to send structured data — creating a new post, updating a profile, submitting a form — it sends a JSON object in the request body. In FastAPI, the structure of that JSON is defined as a Pydantic model.

当客户端需要发送结构化数据——创建新帖子、更新个人信息、提交表单——它在请求体中发送一个 JSON 对象。在 FastAPI 中，那个 JSON 的结构被定义为一个 Pydantic 模型。

```python
from pydantic import BaseModel

class PostCreate(BaseModel):
    title: str
    content: str
    published: bool = False  # optional field with default

@app.post("/posts")
async def create_post(post: PostCreate):
    # post is already a validated PostCreate instance
    # post 已经是一个验证过的 PostCreate 实例
    return {"title": post.title, "published": post.published}
```

The `PostCreate` class is a Pydantic model. It declares three fields: `title` (required string), `content` (required string), and `published` (optional boolean, defaulting to `False`). When a client sends a POST request to `/posts` with a JSON body, FastAPI parses the JSON, validates each field against the model, and constructs a `PostCreate` object. If the JSON is missing a required field, or has a field of the wrong type, FastAPI returns a 422 error with a detailed breakdown of what failed.

`PostCreate` 类是一个 Pydantic 模型。它声明了三个字段：`title`（必填字符串）、`content`（必填字符串）和 `published`（可选布尔值，默认 `False`）。当客户端向 `/posts` 发送一个带 JSON 请求体的 POST 请求时，FastAPI 解析 JSON，根据模型验证每个字段，并构造一个 `PostCreate` 对象。如果 JSON 缺少必填字段，或某个字段类型错误，FastAPI 返回 422 错误，并详细说明哪里失败了。

In a Flask application, achieving the same level of validation would require either a library like `marshmallow` or manual checks:

在 Flask 应用中，要达到同样的验证水平，要么需要 `marshmallow` 这样的库，要么手写检查：

```python
# Flask equivalent — manual validation
@app.route("/posts", methods=["POST"])
def create_post():
    data = request.get_json()
    if not data or "title" not in data:
        return {"error": "title is required"}, 400
    # ... more checks
```

The FastAPI version eliminates this boilerplate entirely. The Pydantic model is the validation, the documentation, and the type safety — all from a single class definition.

FastAPI 版本完全消除了这些样板。Pydantic 模型就是验证、文档和类型安全——都来自一个单一类定义。

### 2.4 Combining All Three / 组合三者

A real endpoint often uses path parameters, query parameters, and a request body simultaneously. FastAPI distinguishes them by their position: values in the path template are path parameters, remaining primitive‑typed arguments are query parameters, and the one argument typed as a Pydantic model is the request body.

一个真实的端点经常同时使用路径参数、查询参数和请求体。FastAPI 根据它们的位置来区分：路径模板中的值是路径参数，其余原始类型参数是查询参数，那个被标注为 Pydantic 模型的参数是请求体。

```python
@app.put("/posts/{post_id}")
async def update_post(
    post_id: int,            # path parameter
    notify: bool = False,    # query parameter (/posts/3?notify=true)
    post: PostCreate = None  # request body
):
    return {"post_id": post_id, "notify": notify, "title": post.title}
```

This composability — where the framework deduces the source of each parameter from its declaration — is one of FastAPI's most productive design choices. You write the function signature; FastAPI handles the HTTP plumbing.

这种可组合性——框架从参数声明推断每个参数的来源——是 FastAPI 最富有生产力的设计选择之一。你写函数签名；FastAPI 处理 HTTP 管道。

## 3. Pydantic Models: The Backbone of FastAPI / Pydantic 模型：FastAPI 的脊梁

If FastAPI had a single feature that most distinguishes it from manual validation frameworks, it would be Pydantic. In a typical FastAPI application, you rarely write parsing or validation code. You define a class that inherits from `BaseModel`, declare fields with type hints, and FastAPI handles the rest. The same class documents your API, validates incoming requests, and provides editor autocompletion — all from a single source of truth.

如果说 FastAPI 有一个最不同于手动验证框架的特性，那就是 Pydantic。在一个典型的 FastAPI 应用中，你几乎不需要手写解析或验证代码。你定义一个继承 `BaseModel` 的类，用类型提示声明字段，剩下的交给 FastAPI。同一个类记录你的 API 文档、验证传入请求，并提供编辑器自动补全——所有这些都来自单一真源。

### 3.1 Defining a Model / 定义模型

A Pydantic model is a Python class with typed fields. Each field becomes both a type annotation and a runtime validator.

Pydantic 模型是一个带有类型字段的 Python 类。每个字段既是类型注解，也是运行时验证器。

```python
from pydantic import BaseModel

class CommentRequest(BaseModel):
    content: str
    parent_id: int | None = None
```

In my blog, `CommentRequest` is used to accept new comments. The `content` field is required and must be a string. The `parent_id` field is optional — it can be an integer, or `None`, or omitted entirely. If the client sends `parent_id: "abc"`, FastAPI returns a 422 error before the request ever reaches the endpoint function. The validation happens automatically, at the framework level.

在我的博客中，`CommentRequest` 用于接收新评论。`content` 字段是必填项且必须是字符串。`parent_id` 字段是可选的——可以是整数、`None` 或完全省略。如果客户端发送 `parent_id: "abc"`，FastAPI 在请求到达端点函数之前就返回 422 错误。验证在框架层面自动发生。

You can also use default values and the `Field` function for additional constraints.

你也可以使用默认值和 `Field` 函数添加额外约束。

```python
from pydantic import BaseModel, Field

class PostCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    preview: str = Field(..., min_length=1)
    images: list[str] = []
```

`Field(...)` with `...` as the first argument means the field is required. The `min_length` and `max_length` constraints are enforced at validation time. `images` defaults to an empty list if not provided. This model appears in my blog's post creation endpoint.

`Field(...)` 用 `...` 作为第一个参数表示该字段是必填的。`min_length` 和 `max_length` 约束在验证时强制执行。如果不提供，`images` 默认为空列表。这个模型出现在我博客的帖子创建端点中。

### 3.2 Nested Models and Complex Structures / 嵌套模型与复杂结构

Models can contain other models. This allows you to describe arbitrarily complex JSON structures and have them validated recursively.

模型可以包含其他模型。这让你能够描述任意复杂的 JSON 结构，并递归验证它们。

```python
class Image(BaseModel):
    url: str
    width: int | None = None
    height: int | None = None

class PostWithImages(BaseModel):
    title: str
    images: list[Image] = []
```

FastAPI will expect a JSON body like `{"title": "...", "images": [{"url": "...", "width": 800}]}` and validate every nested field. The documentation generated from this model will show the full structure, including nested objects.

FastAPI 会预期一个类似 `{"title": "...", "images": [{"url": "...", "width": 800}]}` 的 JSON 体，并验证每个嵌套字段。从这个模型生成的文档会展示完整结构，包括嵌套对象。

### 3.3 Response Models / 响应模型

So far we've looked at models for request bodies. Pydantic models can also be used to filter and validate response data. The `response_model` parameter on a route decorator tells FastAPI to serialize the return value through the specified model, stripping out any extra fields and converting types as needed.

到目前为止我们看了用于请求体的模型。Pydantic 模型也可用于过滤和验证响应数据。路由装饰器上的 `response_model` 参数告诉 FastAPI 将返回值通过指定的模型序列化，去掉任何额外字段并按需转换类型。

```python
class UserOut(BaseModel):
    username: str
    email: str
    role: str

@app.get("/api/me", response_model=UserOut)
async def get_me(current_user = Depends(get_current_user)):
    # The actual database row might have hashed_password, is_verified, etc.
    # response_model ensures only username, email, role appear in the response
    # 实际的数据库行可能有 hashed_password、is_verified 等
    # response_model 确保只有 username、email、role 出现在响应中
    user_row = await database.fetch_one(...)
    return dict(user_row)
```

This serves two purposes. First, it protects sensitive fields — `hashed_password` will never accidentally leak to the client. Second, it documents the response shape in the OpenAPI schema. The `/docs` page will show exactly what the client can expect to receive.

这有两个作用。第一，保护敏感字段——`hashed_password` 永远不会意外泄露给客户端。第二，在 OpenAPI 模式中记录响应形状。`/docs` 页面会精确显示客户端可以期待接收到的内容。

Note that FastAPI will try to convert the returned data to match the `response_model`. If a required field is missing from the return value, the endpoint will fail at runtime with an internal error — not a client‑visible 422. This means `response_model` also serves as a safety net that catches incomplete returns during development.

注意 FastAPI 会尝试将返回的数据转换为匹配 `response_model`。如果返回值缺少一个必填字段，端点会在运行时内部报错——而不是客户端可见的 422。这意味着 `response_model` 在开发过程中也是一个安全网，可以捕获不完整的返回值。

### 3.4 Common Pitfalls with Pydantic / Pydantic 的常见陷阱

The most frequent surprise when working with Pydantic is that **validation runs at the edge of the application**, not inside your business logic. A Pydantic model is constructed from raw input (JSON, form data, query strings), and once it passes validation, you have a fully‑formed Python object with the correct types. There is no need to write `isinstance` checks inside your endpoint functions. The model already guarantees the types.

使用 Pydantic 时最常遇到的意外是**验证在应用边缘运行**，而不是在你的业务逻辑内部。一个 Pydantic 模型从原始输入（JSON、表单数据、查询字符串）构造，一旦通过验证，你就拥有了一个类型正确的完整 Python 对象。不需要在端点函数内部写 `isinstance` 检查。模型已经保证了类型。

A related pitfall is forgetting that Pydantic models are **not** database models. They describe the shape of HTTP messages, not database rows. In FastAPI, it's common to have separate Pydantic models for request (`PostCreate`), response (`PostOut`), and internal logic, while the database table is defined with SQLAlchemy or raw SQL. My blog does exactly this: `PostCreate` is a Pydantic model for the endpoint input, while the `posts` table is a SQLAlchemy `Table` object in `database.py`. They serve different layers and should not be conflated.

一个相关的陷阱是忘了 Pydantic 模型**不是**数据库模型。它们描述的是 HTTP 消息的形状，而不是数据库行。在 FastAPI 中，为请求（`PostCreate`）、响应（`PostOut`）和内部逻辑分别拥有不同的 Pydantic 模型很常见，而数据库表则用 SQLAlchemy 或原生 SQL 定义。我的博客正是这样做的：`PostCreate` 是端点输入的 Pydantic 模型，而 `posts` 表是 `database.py` 中的 SQLAlchemy `Table` 对象。它们服务不同层次，不应混为一谈。

## 4. Dependency Injection with `Depends` / 依赖注入

FastAPI has a feature that has no direct equivalent in many other web frameworks: a built‑in dependency injection system. It is accessed through the `Depends` function, and it solves a specific problem that arises in every non‑trivial API: how to share common logic — authentication checks, database session management, permission verification — across multiple endpoints without copy‑pasting code.

FastAPI 有一个许多其他 web 框架没有直接对应物的特性：内置的依赖注入系统。通过 `Depends` 函数访问，它解决了一个在每个非平凡 API 中都会出现的具体问题：如何在多个端点之间共享公共逻辑——认证检查、数据库会话管理、权限验证——而不复制粘贴代码。

### 4.1 The Concept / 概念

A dependency is simply a callable — a function or a class — that returns a value. You declare it as a parameter with `Depends(...)`, and FastAPI calls it automatically before the endpoint function runs, injecting its return value into the parameter.

依赖就是一个可调用对象——一个函数或类——返回一个值。你用 `Depends(...)` 将其声明为参数，FastAPI 会在端点函数运行前自动调用它，将其返回值注入参数。

```python
from fastapi import Depends

def get_pagination(page: int = 1, size: int = 10) -> dict:
    return {"offset": (page - 1) * size, "limit": size}

@app.get("/posts")
async def list_posts(pagination: dict = Depends(get_pagination)):
    # pagination is the result of get_pagination()
    return pagination
```

This example is trivial, but it demonstrates the core mechanism: `get_pagination` is a reusable piece of logic. Any endpoint that needs pagination can declare it as a dependency. If the pagination logic changes, you change it in one place. The dependency can itself have parameters — in this case, `page` and `size` are automatically parsed as query parameters. FastAPI handles nested dependencies naturally: the parameters of `get_pagination` become parameters of the endpoint.

这个例子很简单，但它展示了核心机制：`get_pagination` 是一个可复用的逻辑块。任何需要分页的端点都可以将它声明为依赖。如果分页逻辑变了，你只需在一处修改。依赖自身可以有参数——在这个例子中，`page` 和 `size` 被自动解析为查询参数。FastAPI 自然地处理嵌套依赖：`get_pagination` 的参数变成端点的参数。

### 4.2 Authentication as a Dependency / 认证作为依赖

The most common use of `Depends` is extracting the current user from a request. In my blog, almost every protected endpoint needs to know who is making the request. The `get_current_user` dependency encapsulates the JWT parsing, token validation, and database lookup.

`Depends` 最常见的用途是从请求中提取当前用户。在我的博客中，几乎每个受保护端点都需要知道是谁在发起请求。`get_current_user` 依赖封装了 JWT 解析、令牌验证和数据库查询。

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials",
    )
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user_row = await database.fetch_one(
        users.select().where(users.c.username == username)
    )
    if user_row is None:
        raise credentials_exception

    return user_row  # full user record
```

The dependency chain works as follows: `OAuth2PasswordBearer` extracts the token from the `Authorization` header (or from a cookie, if configured). FastAPI passes the token string to `get_current_user`. The function decodes the JWT, looks up the user in the database, and returns the user record. If anything fails, it raises an `HTTPException`, and FastAPI returns the appropriate 401 response to the client without ever calling the endpoint function.

依赖链是这样工作的：`OAuth2PasswordBearer` 从 `Authorization` 头部提取令牌（或从 cookie 中，如果配置了）。FastAPI 将令牌字符串传递给 `get_current_user`。该函数解码 JWT，在数据库中查找用户，并返回用户记录。如果任何一步失败，它抛出 `HTTPException`，FastAPI 将相应的 401 响应返回给客户端，而不会调用端点函数。

To use this dependency in an endpoint, you add a parameter:

要在端点中使用这个依赖，你只需添加一个参数：

```python
@app.get("/api/me")
async def get_my_profile(current_user = Depends(get_current_user)):
    return {"username": current_user["username"], "role": current_user["role"]}
```

The endpoint function never touches the token. It never queries the user table. It simply receives a verified `current_user` object. The dependency handles everything upstream. This separation of concerns — authentication logic lives in the dependency, business logic lives in the endpoint — is the primary value of FastAPI's dependency system.

端点函数从不接触令牌。它从不查询用户表。它只是接收一个已验证的 `current_user` 对象。依赖在上游处理了一切。这种关注点分离——认证逻辑在依赖中，业务逻辑在端点中——是 FastAPI 依赖系统的主要价值。

### 4.3 Stacking Dependencies / 堆叠依赖

Dependencies can depend on other dependencies. A common pattern is a permission check that depends on the current user.

依赖可以依赖于其他依赖。一个常见模式是权限检查，它依赖于当前用户。

```python
def require_admin(current_user = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return current_user

@app.delete("/api/admin/posts/{post_id}")
async def delete_post(
    post_id: int,
    admin_user = Depends(require_admin)
):
    # Only reached if the user is an authenticated admin
    ...
```

Here, `require_admin` depends on `get_current_user`. FastAPI resolves the chain: first `get_current_user` runs, its result is passed to `require_admin`, and if `require_admin` doesn't raise, its result is passed to the endpoint. The endpoint itself can remain completely oblivious to the authentication and authorization logic — it just receives an `admin_user` it can trust.

这里，`require_admin` 依赖于 `get_current_user`。FastAPI 解析这条链：首先运行 `get_current_user`，其结果传递给 `require_admin`，如果 `require_admin` 没有抛出异常，其结果传递给端点。端点本身可以对认证和授权逻辑完全不知情——它只是接收一个可信赖的 `admin_user`。

My blog uses this pattern extensively. The `verify_csrf` dependency runs after `get_current_user` and checks the CSRF token. The `get_like_status` endpoint depends on both `get_current_user` and a path parameter `post_id`. FastAPI orchestrates all of them without any explicit wiring.

我的博客广泛使用了这个模式。`verify_csrf` 依赖在 `get_current_user` 之后运行并检查 CSRF 令牌。`get_like_status` 端点同时依赖于 `get_current_user` 和路径参数 `post_id`。FastAPI 编排它们，无需任何显式接线。

### 4.4 Dependencies Without Return Values / 不返回值的依赖

Not all dependencies return data. Some exist purely for their side effects — logging, rate limiting, CSRF verification. A dependency can return `None`, and the endpoint parameter can be omitted entirely or typed as `None`.

并非所有依赖都返回数据。有些纯粹因为副作用而存在——日志记录、速率限制、CSRF 验证。依赖可以返回 `None`，端点参数可以完全省略或标注为 `None`。

```python
async def verify_csrf(
    request: Request,
    current_user = Depends(get_current_user)
):
    if request.method == "OPTIONS":
        return
    csrf_cookie = request.cookies.get("csrf_token")
    csrf_header = request.headers.get("X-CSRF-Token")
    if not csrf_cookie or not csrf_header or csrf_cookie != csrf_header:
        raise HTTPException(status_code=403, detail="CSRF validation failed")
    # Returns None — the endpoint only cares that it didn't raise

@app.post("/api/posts/{post_id}/like")
async def toggle_like(
    post_id: int,
    current_user = Depends(get_current_user),
    _ = Depends(verify_csrf)  # underscore means "I don't need the return value"
):
    ...
```

The pattern `_ = Depends(verify_csrf)` is idiomatic FastAPI. It tells the reader: "This dependency runs as a guard. Its return value is irrelevant." If `verify_csrf` raises an exception, the endpoint never executes. If it returns, the request is safe to process.

`_ = Depends(verify_csrf)` 是惯用的 FastAPI 写法。它告诉读者：“这个依赖作为守卫运行。它的返回值无关紧要。”如果 `verify_csrf` 抛出异常，端点不会执行。如果它返回了，请求就可以安全处理。

## 5. Asynchronous Database Operations / 异步数据库操作

FastAPI's async capabilities are only useful if the operations you perform inside your endpoints are themselves async. Database access is the most critical of these. In my blog, I use the `databases` library with SQLAlchemy Core for async SQLite access. This section explains the setup and the essential patterns.

FastAPI 的异步能力只有在你在端点内部执行的操作本身也是异步的时才有用。数据库访问是其中最关键的。在我的博客中，我使用 `databases` 库配合 SQLAlchemy Core 实现异步 SQLite 访问。本节讲解设置和基本模式。

### 5.1 The Setup / 设置

The `databases` library provides an async interface to relational databases. Combined with SQLAlchemy Core for table definitions, it gives you async query execution without the overhead of a full ORM.

`databases` 库提供关系数据库的异步接口。与 SQLAlchemy Core 结合用于表定义，它让你拥有异步查询执行，而没有完整 ORM 的开销。

```python
import databases
import sqlalchemy

DATABASE_URL = "sqlite:///./data/blog.db"

database = databases.Database(DATABASE_URL)
metadata = sqlalchemy.MetaData()

posts = sqlalchemy.Table(
    "posts",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("title", sqlalchemy.String),
    sqlalchemy.Column("preview", sqlalchemy.Text),
)

# In the app startup and shutdown events
@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()
```

The critical detail is that `database` is a global object, but all its methods are async. You `await` every query. The connection pool is managed internally — you don't need to worry about opening or closing connections per request.

关键细节是 `database` 是一个全局对象，但其所有方法都是异步的。你对每个查询都 `await`。连接池由内部管理——你不需要担心为每个请求打开或关闭连接。

### 5.2 Querying / 查询

The query API of `databases` is similar to SQLAlchemy Core, but with `await`. You use the table objects defined in your `database.py`.

`databases` 的查询 API 与 SQLAlchemy Core 类似，但带有 `await`。你使用在 `database.py` 中定义的表对象。

**Fetching multiple rows:**

```python
query = posts.select().order_by(posts.c.date.desc())
rows = await database.fetch_all(query)
result = [dict(row) for row in rows]
```

**Fetching a single row:**

```python
query = posts.select().where(posts.c.id == post_id)
row = await database.fetch_one(query)
if row is None:
    raise HTTPException(status_code=404, detail="Post not found")
```

**Inserting:**

```python
query = posts.insert().values(title="New Post", preview="...", date="...")
last_id = await database.execute(query)
```

**Updating:**

```python
query = posts.update().where(posts.c.id == post_id).values(title="Updated Title")
await database.execute(query)
```

**Deleting:**

```python
query = posts.delete().where(posts.c.id == post_id)
await database.execute(query)
```

The pattern is always the same: build a query object using the table's methods, then `await` its execution. `fetch_all` and `fetch_one` return rows that can be converted to dictionaries. `execute` returns the last inserted ID for inserts, or the number of affected rows for updates and deletes (which is usually ignored).

模式始终相同：使用表的方法构建查询对象，然后 `await` 它的执行。`fetch_all` 和 `fetch_one` 返回可以转换为字典的行。`execute` 对于插入返回最后插入的 ID，对于更新和删除返回受影响的行数（通常被忽略）。

### 5.3 Transactions / 事务

The database operations that change multiple tables in a logically‑related way must be atomic. In my blog, toggling a like involves inserting or deleting a row in the `likes` table and simultaneously updating the `likes_count` in the `posts` table. These two operations must succeed or fail together.

那些以逻辑相关的方式更改多个表的数据库操作必须是原子的。在我的博客中，切换点赞涉及在 `likes` 表中插入或删除一行，同时更新 `posts` 表中的 `likes_count`。这两个操作必须一起成功或失败。

```python
async with database.transaction():
    await database.execute(insert_or_delete_like)
    await database.execute(update_likes_count)
```

The `async with database.transaction()` block ensures atomicity. If the second `execute` raises an exception, the first is automatically rolled back. Without the transaction, a crash between the two statements would leave the database in an inconsistent state — a like record with no corresponding count, or a count that doesn't match the actual likes.

`async with database.transaction()` 块确保原子性。如果第二个 `execute` 抛出异常，第一个会自动回滚。没有事务的话，在两条语句之间崩溃会留下数据库的不一致状态——一条点赞记录没有对应的计数，或者计数与实际点赞不匹配。

This is not theoretical. The earlier version of my blog had exactly this vulnerability, and it caused corrupted like data when requests failed mid‑operation. The transaction wrapper fixed it. (This is covered in detail in the async/atomic learning note earlier in this series.)

这不是理论上的。我博客的早期版本确实有这个漏洞，当请求在操作中途失败时，它导致了点赞数据损坏。事务包装器修复了它。（这在本系列前面的异步/原子学习笔记中有详细说明。）

### 5.4 A Common Footgun: Forgetting `await` / 一个常见雷区：忘记 `await`

The most common mistake when using an async database library is forgetting the `await` keyword. A query like:

使用异步数据库库最常见的错误是忘了 `await` 关键字。像这样的查询：

```python
# Bug: missing await — row is a coroutine object, not a database row
row = database.fetch_one(query)
if row is None:  # This always evaluates to False because a coroutine is not None
    raise HTTPException(status_code=404)
```

Without `await`, the function call returns a coroutine object immediately, without executing the query. The variable `row` is never `None` — it's a coroutine. The check passes silently, and the code proceeds with a completely wrong value. The resulting error is often cryptic and appears far from the actual bug.

没有 `await`，函数调用立即返回一个协程对象，而不执行查询。变量 `row` 永远不会是 `None`——它是一个协程。检查静默通过，代码用一个完全错误的值继续执行。由此产生的错误往往是隐晦的，且出现在离实际 bug 很远的地方。

The solution is mechanical: every call to `database.fetch_*` or `database.execute` must be preceded by `await`. FastAPI will warn if you pass a coroutine to a response (it can't serialize it), but if you accidentally pass it through to further logic without serializing, the bug can go unnoticed until a runtime type error. Adopting a habit of always reading database calls aloud with "await" in front helps.

解决方案是机械的：每次调用 `database.fetch_*` 或 `database.execute` 都必须以 `await` 开头。FastAPI 会在你向响应传递协程时警告（它无法序列化协程），但如果你意外地将它传递给后续逻辑而没有序列化，这个 bug 可能会一直不被注意，直到出现运行时类型错误。养成一个习惯：总是在心里把数据库调用前面加上“await”来读，会有所帮助。

### 5.5 Synchronous Side Operations / 同步副作用操作

Not everything in an async endpoint needs to be async. CPU‑bound work — image processing, generating thumbnails, parsing large files — blocks the event loop if run inline. For these, use a thread pool or an async‑friendly library.

并非异步端点中的所有东西都需要异步。CPU 密集型工作——图像处理、生成缩略图、解析大文件——如果在内联运行会阻塞事件循环。对于这些，使用线程池或异步友好的库。

My blog generates thumbnails for uploaded images using Pillow, which is synchronous. This works because the upload endpoints are low‑traffic admin operations, and the image sizes are small enough that the blocking time is negligible. For a high‑traffic endpoint doing heavy image processing, you would offload the work with `run_in_executor`.

我的博客使用 Pillow 为上传的图片生成缩略图，它是同步的。这行得通，因为上传端点是低流量的管理员操作，且图片尺寸足够小，阻塞时间可忽略不计。对于执行大量图像处理的高流量端点，你会用 `run_in_executor` 将工作卸载。

```python
from concurrent.futures import ThreadPoolExecutor
import asyncio

executor = ThreadPoolExecutor()

@app.post("/upload")
async def upload_image(file: UploadFile):
    contents = await file.read()
    # Offload CPU‑bound thumbnail generation to a thread
    loop = asyncio.get_running_loop()
    thumbnail = await loop.run_in_executor(executor, generate_thumbnail, contents)
    ...
```

This pattern keeps the async event loop responsive while the heavy work runs in a background thread. It is the standard bridge between async FastAPI and synchronous libraries.

这种模式让异步事件循环保持响应，同时重活在后台线程中运行。它是异步 FastAPI 和同步库之间的标准桥梁。

## 6. Authentication and Security / 认证与安全

### 6.1 The OAuth2 Password Flow with JWT / OAuth2 密码流与 JWT

FastAPI provides a `fastapi.security` module that handles much of the OAuth2 boilerplate. The `OAuth2PasswordBearer` class extracts a Bearer token from the `Authorization` header. Combined with a JWT library like `python-jose`, it forms the most common authentication pattern in FastAPI applications.

```python
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

JWT_SECRET_KEY = "your-secret-key"   # In production, load from environment
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7   # one week
```

The `tokenUrl` parameter tells the OpenAPI docs where the login endpoint lives. This is only used for documentation — FastAPI does not enforce it. The actual login endpoint is a regular POST route that validates credentials and returns a token.

**Creating tokens.** After verifying a username and password, you generate a JWT containing the user's identity and expiration time.

```python
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=ALGORITHM)
```

The token carries a `sub` claim (subject, typically the username) and optionally a `role` claim. These claims are not encrypted — anyone with the token can decode them. But they are signed, so tampering is detectable. Never put secrets in a JWT payload.

### 6.2 Password Hashing with bcrypt / 用 bcrypt 做密码哈希

Passwords must never be stored in plaintext. The `bcrypt` library provides a well-tested hashing function that includes a random salt automatically.

```python
import bcrypt

def get_password_hash(password: str) -> str:
    # bcrypt requires bytes, and passwords longer than 72 bytes must be truncated
    return bcrypt.hashpw(password.encode('utf-8')[:72], bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8')[:72], hashed_password.encode('utf-8'))
```

The 72-byte truncation is a bcrypt limitation worth knowing. It is rarely relevant for human-chosen passwords, but if your system generates long API keys or passphrases, consider using a hash function like argon2 instead, or pre-hashing with SHA-256 before bcrypt.

### 6.3 CSRF Protection / CSRF 防护

Since my blog uses cookies for authentication (`httponly` cookie with the JWT), it is vulnerable to cross-site request forgery. A malicious site could trick a logged-in user's browser into making a request that carries the cookie automatically. The defense is the double-submit cookie pattern.

When a user logs in, the backend sets two cookies: an `httponly` `access_token` (inaccessible to JavaScript) and a readable `csrf_token` (a random string). On every mutating request (POST, PUT, DELETE), the frontend reads the `csrf_token` cookie and sends it back in an `X-CSRF-Token` header. The backend verifies that the cookie value and header value match. A cross-origin attacker cannot read the cookie, so they cannot forge the header.

```python
async def verify_csrf(request: Request):
    if request.method == "OPTIONS":
        return   # preflight requests carry no CSRF token
    csrf_cookie = request.cookies.get("csrf_token")
    csrf_header = request.headers.get("X-CSRF-Token")
    if not csrf_cookie or not csrf_header or csrf_cookie != csrf_header:
        raise HTTPException(status_code=403, detail="CSRF validation failed")
```

This dependency is added to every protected mutating endpoint alongside `get_current_user`. The `_ = Depends(verify_csrf)` pattern signals that it acts purely as a guard, returning no data.

A subtle detail: `verify_csrf` must depend on `get_current_user` if you want authentication to be checked first. In FastAPI, you can declare multiple dependencies that depend on the same parent, and the framework only executes the parent once per request. In my blog, both `get_current_user` and `verify_csrf` are listed as endpoint parameters. `verify_csrf` itself takes `request: Request` as its first parameter, which FastAPI injects automatically without needing `Depends`.

### 6.4 CORS Configuration / CORS 配置

If your frontend and backend are served from different origins — even different subdomains — the browser's same-origin policy will block requests. For my blog, the frontend is at `https://littlebanbrick.cn` and the backend serves API routes under the same domain through an Nginx reverse proxy. But during development, or if the frontend and backend are on different ports, CORS must be configured.

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://littlebanbrick.cn",
        "https://littlebanbrick.cn",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

The `allow_credentials=True` is critical when using cookies for authentication. Without it, the browser will not attach cookies to cross-origin requests. The `allow_origins` list should be as restrictive as possible — never use `["*"]` when `allow_credentials=True`, as this is explicitly forbidden by the CORS specification and will be rejected by browsers.

## 7. Static Files and File Uploads / 静态文件与文件上传

### 7.1 Serving Static Files / 提供静态文件

FastAPI can mount entire directories as static file servers using the `StaticFiles` middleware. My blog serves uploaded photos and Markdown notes this way.

FastAPI 可以使用 `StaticFiles` 中间件将整个目录挂载为静态文件服务器。我的博客就是用这种方式提供上传的照片和 Markdown 笔记的。

```python
from fastapi.staticfiles import StaticFiles

app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/photos", StaticFiles(directory="static/photos"), name="photos")
```

Files under `static/photos/` are now accessible at `/photos/filename.jpg`. The `name` parameter is required for the OpenAPI documentation to correctly reference the mount point. The order of mounting matters: routes defined before a mount take priority, so `/api/photos` as a dynamic endpoint would shadow `/photos` if defined earlier.

`static/photos/` 下的文件现在可以通过 `/photos/filename.jpg` 访问。`name` 参数是必需的，用于 OpenAPI 文档正确引用挂载点。挂载顺序很重要：在挂载之前定义的路由优先级更高，所以 `/api/photos` 作为动态端点如果定义在前面，会遮盖 `/photos`。

A common pitfall: `StaticFiles` serves files as-is. It does not handle authentication. If you need protected file access (e.g., only admins can download certain files), you must create a dedicated endpoint that reads the file and returns a `FileResponse`, rather than mounting the entire directory.

一个常见陷阱：`StaticFiles` 按原样提供文件。它不处理认证。如果你需要受保护的文件访问（例如，只有管理员可以下载某些文件），你必须创建一个专用端点来读取文件并返回 `FileResponse`，而不是挂载整个目录。

### 7.2 File Uploads / 文件上传

FastAPI's `UploadFile` provides an async interface for receiving files. It is built on Python's `tempfile` module and supports reading files as bytes or saving them directly to disk.

FastAPI 的 `UploadFile` 为接收文件提供了异步接口。它基于 Python 的 `tempfile` 模块构建，支持以字节形式读取文件或直接将文件保存到磁盘。

```python
from fastapi import UploadFile, File

@app.post("/api/admin/photos/upload")
async def upload_photo(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user),
    _ = Depends(verify_csrf)
):
    # Validate file type
    allowed = {'.png', '.jpg', '.jpeg', '.gif', '.bmp'}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    # Generate a safe filename to prevent path traversal
    timestamp = str(int(time.time() * 1000))
    safe_name = f"{timestamp}_{os.path.basename(file.filename)}"
    file_path = os.path.join(PHOTOS_DIR, safe_name)

    # Write to disk
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
```

Several security considerations are embedded here. `os.path.basename` strips any directory components from the uploaded filename, preventing a malicious client from writing to arbitrary paths. The timestamp prefix avoids collisions and obscures the original filename. The file extension is validated against a whitelist, not a blacklist — this is the correct approach, as blacklisting specific extensions inevitably misses dangerous ones.

这里嵌入了几个安全考虑。`os.path.basename` 会去除上传文件名中的所有目录部分，防止恶意客户端写入任意路径。时间戳前缀避免了文件名冲突并隐藏了原始文件名。文件扩展名通过白名单验证，而不是黑名单——这是正确的做法，因为黑名单特定扩展名不可避免地会遗漏危险的扩展名。

`UploadFile` provides both synchronous (`file.read()`, `file.file`) and asynchronous (`await file.read()`) access. For large files, the async version is preferred to avoid blocking the event loop. For small files like photos, the synchronous version is usually fine.

`UploadFile` 同时提供同步（`file.read()`、`file.file`）和异步（`await file.read()`）访问方式。对于大文件，推荐使用异步版本以避免阻塞事件循环。对于照片这样的小文件，同步版本通常就足够了。

### 7.3 Generating Thumbnails / 生成缩略图

My blog generates JPEG thumbnails for uploaded photos to reduce bandwidth on the frontend. This uses Pillow, a synchronous image processing library.

我的博客为上传的照片生成 JPEG 缩略图，以减少前端的带宽消耗。这使用了 Pillow，一个同步的图像处理库。

```python
from PIL import Image

THUMB_MAX_WIDTH = 600
THUMB_QUALITY = 75

def create_thumbnail(original_path: str, thumb_path: str):
    os.makedirs(os.path.dirname(thumb_path), exist_ok=True)
    with Image.open(original_path) as img:
        if img.width > THUMB_MAX_WIDTH:
            ratio = THUMB_MAX_WIDTH / img.width
            new_height = int(img.height * ratio)
            img = img.resize((THUMB_MAX_WIDTH, new_height), Image.Resampling.LANCZOS)
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')
        img.save(thumb_path, 'JPEG', quality=THUMB_QUALITY, optimize=True)
```

The function is called synchronously after the upload completes. For a low-traffic admin endpoint, this blocking call is acceptable. If thumbnail generation becomes a bottleneck, it can be offloaded to a background thread with `run_in_executor`, as discussed in Section 5.5.

该函数在上传完成后同步调用。对于一个低流量的管理端点，这种阻塞调用是可以接受的。如果缩略图生成成为瓶颈，可以通过 `run_in_executor` 将其卸载到后台线程，如第 5.5 节所述。

The conversion from RGBA/P mode to RGB is necessary because JPEG does not support transparency. Without this conversion, saving a PNG with an alpha channel as JPEG would raise an error. This is the kind of edge case that only surfaces when you test with real user-uploaded images.

从 RGBA/P 模式转换为 RGB 是必要的，因为 JPEG 不支持透明通道。如果没有这个转换，将带有 alpha 通道的 PNG 保存为 JPEG 会引发错误。这种边缘情况只有在你用真实用户上传的图片测试时才会暴露。

## 8. Putting It All Together: Blog Backend Architecture / 综合：博客后端架构

### 8.1 Route Organization / 路由组织

A blog backend with posts, comments, likes, photos, notes, messages, user management, admin operations, and third-party integrations quickly accumulates dozens of endpoints. FastAPI does not enforce a particular file structure, but a common pattern is to group related routes by resource and register them on a shared `app` instance.

一个包含帖子、评论、点赞、照片、笔记、留言、用户管理、管理员操作和第三方集成的博客后端，很快就会积累几十个端点。FastAPI 不强加特定的文件结构，但一个常见的模式是按资源将相关路由分组，并在共享的 `app` 实例上注册它们。

My blog keeps all routes in `main.py`, which is viable for a single-developer project with a manageable number of endpoints. The implicit convention is:

我的博客将所有路由保存在`main.py`中，这对于一个端点数量可控的单开发者项目来说是可行的。隐含的约定是：

- `/api/posts` — public post listing and detail
- `/api/posts/{post_id}/comments` — comment operations
- `/api/posts/{post_id}/like` — like toggling
- `/api/admin/posts` — admin post management
- `/api/admin/photos` — photo uploads and deletions
- `/api/notes` — study notes (Markdown files)
- `/api/messages` — guestbook messages
- `/api/user` — profile and username changes

The `/api` prefix is not required by FastAPI, but it serves a practical purpose in deployment: Nginx can proxy only `/api` requests to the FastAPI server while serving the React frontend directly. This separation of concerns at the reverse-proxy level simplifies caching and static asset delivery.

`/api` 前缀并非 FastAPI 所强制要求，但它在部署中有实用目的：Nginx 可以只将 `/api` 请求代理到 FastAPI 服务器，同时直接提供 React 前端。这种反向代理层面的关注点分离简化了缓存和静态资源交付。

### 8.2 Layered Design / 分层设计

Although my blog's `main.py` is a single file, the code follows an implicit layered architecture.

虽然我的博客的 `main.py` 是一个单一文件，但代码遵循隐式的分层架构。

The route functions form the **presentation layer**. They receive HTTP requests, parse parameters, call dependencies, invoke database operations, and return responses. They contain no raw SQL.

路由函数构成**表示层**。它们接收 HTTP 请求、解析参数、调用依赖、执行数据库操作并返回响应。它们不包含原始 SQL。

The dependency functions (`get_current_user`, `verify_csrf`, `get_pagination`) form the **middleware layer**. They handle cross-cutting concerns — authentication, authorization, request validation — and are injected into routes via `Depends`.

依赖函数（`get_current_user`、`verify_csrf`、`get_pagination`）构成**中间件层**。它们处理横切关注点——认证、授权、请求验证——并通过 `Depends` 注入到路由中。

The Pydantic models (`PostCreate`, `CommentRequest`, `UserRegister`) form the **validation layer**. They define the contract between client and server.

Pydantic 模型（`PostCreate`、`CommentRequest`、`UserRegister`）构成**验证层**。它们定义了客户端和服务器之间的契约。

The SQLAlchemy table definitions and `database.py` form the **data access layer**. Raw queries are built using SQLAlchemy Core and executed through the async `databases` interface.

SQLAlchemy 表定义和 `database.py` 构成**数据访问层**。原始查询使用 SQLAlchemy Core 构建，并通过异步 `databases` 接口执行。

This is not a formal architecture — there are no separate modules or interfaces. But the responsibilities are distinct enough that refactoring into separate files (e.g., `routers/posts.py`, `dependencies/auth.py`, `models/post.py`) would be straightforward.

这不是一个正式的架构——没有独立的模块或接口。但职责已经足够清晰，重构为单独的文件（例如 `routers/posts.py`、`dependencies/auth.py`、`models/post.py`）会非常直接。

### 8.3 Rate Limiting / 限流

Public endpoints — login, registration, comments, likes — are vulnerable to abuse. My blog uses the `slowapi` library, which integrates with FastAPI to apply rate limits per client IP.

公共端点——登录、注册、评论、点赞——容易被滥用。我的博客使用 `slowapi` 库，它与 FastAPI 集成，按客户端 IP 应用速率限制。

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/api/login")
@limiter.limit("5/15min")
async def login(user: UserLogin, response: Response, request: Request):
    ...
```

The `@limiter.limit` decorator accepts a string like `"5/15min"` (5 requests per 15-minute window per IP). Multiple limits can be stacked: `@limiter.limit("5/15min; 20/day")`. The `request: Request` parameter is required in the endpoint signature — slowapi uses it to extract the client's IP address.

`@limiter.limit` 装饰器接受像 `"5/15min"` 这样的字符串（每个 IP 每 15 分钟窗口 5 次请求）。多个限制可以叠加：`@limiter.limit("5/15min; 20/day")`。`request: Request` 参数在端点签名中是必需的——slowapi 用它来提取客户端的 IP 地址。

Rate limiting is an infrastructure concern that is often deferred to the reverse proxy (Nginx) or a dedicated API gateway. But for a small self-hosted blog, in-application rate limiting is simpler to set up and sufficient for protecting against basic brute-force attempts.

限流是一个基础设施问题，通常委托给反向代理（Nginx）或专用 API 网关。但对于一个小型自托管博客来说，应用层面的限流设置更简单，并且足以防止基本的暴力攻击。

### 8.4 Background Tasks / 后台任务

Some operations should not block the HTTP response. My blog's DeepSeek integration — where a comment asking `@deepseek` triggers an AI-generated reply — is implemented as a background task. The endpoint returns immediately after saving the comment, and the AI reply is generated and posted asynchronously.

有些操作不应该阻塞 HTTP 响应。我的博客的 DeepSeek 集成——当评论中包含 `@deepseek` 时会触发 AI 生成的回复——被实现为后台任务。端点保存评论后立即返回，AI 回复被异步生成并发布。

```python
import asyncio

@app.post("/api/posts/{post_id}/comments")
async def add_comment(post_id: int, req: CommentRequest, ...):
    # Save the comment synchronously (inside a transaction)
    async with database.transaction():
        comment_id = await database.execute(comments.insert().values(...))

    # If the comment triggers a DeepSeek reply, schedule it as a background task
    if req.content.strip().lower().startswith("@deepseek"):
        asyncio.create_task(process_deepseek_reply(post_id, comment_id, ...))

    return success(msg="Comment added")
```

`asyncio.create_task` schedules a coroutine to run concurrently in the same event loop. It is not a true background worker — if the server shuts down, pending tasks are cancelled. For reliable background processing, a task queue like Celery or Redis Queue is needed. But for a low-stakes feature like an AI chatbot reply, `asyncio.create_task` is appropriate and requires no additional infrastructure.

`asyncio.create_task` 将一个协程调度到同一事件循环中并发运行。它不是一个真正的后台工作器——如果服务器关闭，待处理的任务会被取消。对于可靠的背景处理，需要像 Celery 或 Redis Queue 这样的任务队列。但对于像 AI 聊天机器人回复这样的低风险功能，`asyncio.create_task` 已经足够，且不需要额外的基础设施。

The pattern also appears in the startup event, where `asyncio.create_task` launches periodic jobs like the GitHub trending scheduler and the unverified user cleanup loop.

这种模式也出现在启动事件中，`asyncio.create_task` 在那里启动周期性任务，如 GitHub 趋势调度器和未验证用户清理循环。

```python
@app.on_event("startup")
async def startup():
    await database.connect()
    asyncio.create_task(cleanup_unverified_users())
    asyncio.create_task(trending_scheduler())
```

## 9. Testing and Deployment / 测试与部署

### 9.1 Testing with TestClient / 使用 TestClient 测试

FastAPI ships with a `TestClient` based on `httpx`, allowing you to write tests that call your endpoints without running a live server. A test simulates an HTTP request and receives a response object that can be inspected for status codes, JSON bodies, and headers.

FastAPI 自带了一个基于 `httpx` 的 `TestClient`，让你可以编写测试调用端点而无需运行真实的服务器。测试模拟一个 HTTP 请求并接收一个响应对象，可以检查其状态码、JSON 体和头部信息。

```python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["msg"] == "Hello from fastAPI!"
```

For endpoints that require authentication, you must configure the test client to include the appropriate cookies or headers. A common pattern is to write a helper fixture that logs in and captures the `access_token` and `csrf_token` cookies, then passes them to subsequent requests.

对于需要认证的端点，你必须配置测试客户端以包含适当的 cookies 或头部信息。一个常见模式是编写一个辅助 fixture，先登录并捕获 `access_token` 和 `csrf_token` 的 cookies，然后将它们传递给后续请求。

Testing async database operations requires either a test database (a separate SQLite file or a test‑specific database URL) or mocking the `database` object. For a personal project, running tests against a dedicated test database is simpler and catches real query errors.

测试异步数据库操作需要一个测试数据库（一个单独的 SQLite 文件或测试专用的数据库 URL），或者模拟 `database` 对象。对于个人项目，使用专用测试数据库运行测试更简单，并能捕获真正的查询错误。

### 9.2 Production Deployment / 生产部署

The development server `uvicorn main:app --reload` is not suitable for production. For a production deployment, two changes are needed: a process manager and a reverse proxy.

开发服务器 `uvicorn main:app --reload` 不适合生产环境。对于生产部署，需要两个变化：进程管理器和反向代理。

**Process manager.** `gunicorn` with Uvicorn workers handles concurrency, worker lifecycle, and graceful restarts.

**进程管理器。** 使用 Uvicorn 工作器的 `gunicorn` 处理并发、工作器生命周期和优雅重启。

```bash
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

**Reverse proxy.** Nginx sits in front of FastAPI, serving static files directly and forwarding API requests. This is exactly the setup my blog uses, with Docker Compose orchestrating both the React frontend (served by Nginx) and the FastAPI backend.

**反向代理。** Nginx 位于 FastAPI 前面，直接提供静态文件并转发 API 请求。这正是我的博客使用的配置，Docker Compose 协调 React 前端（由 Nginx 提供）和 FastAPI 后端。

```
location /api {
    proxy_pass http://backend:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

location / {
    root /usr/share/nginx/html;
    try_files $uri /index.html;   # SPA routing fallback
}
```

The `try_files $uri /index.html` rule handles React's client‑side routing. If a user directly navigates to `/posts/5`, Nginx returns `index.html`, and React's router handles the URL client‑side.

`try_files $uri /index.html` 规则处理 React 的客户端路由。如果用户直接导航到 `/posts/5`，Nginx 返回 `index.html`，然后 React 的路由器在客户端处理 URL。

### 9.3 Docker Compose / Docker Compose

My blog's entire infrastructure — React frontend, FastAPI backend, Nginx reverse proxy — is defined in a single `docker-compose.yml`. The backend and frontend are built as separate images, and Nginx is configured to proxy `/api` to the backend container while serving the frontend's static files.

我的博客的整个基础设施——React 前端、FastAPI 后端、Nginx 反向代理——都在一个 `docker-compose.yml` 中定义。后端和前端被构建为单独的镜像，Nginx 被配置为将 `/api` 代理到后端容器，同时提供前端的静态文件。

The `.env` file management is critical in this setup. Secrets like `JWT_SECRET_KEY` and `ADMIN_SECRET_KEY` are loaded from environment variables in production but from a local `.env` file during development. The `load_dotenv` call at the top of `main.py` handles both.

`.env` 文件管理在此设置中至关重要。像 `JWT_SECRET_KEY` 和 `ADMIN_SECRET_KEY` 这样的密钥在生产环境中从环境变量加载，但在开发过程中从本地的 `.env` 文件加载。`main.py` 顶部的 `load_dotenv` 调用处理这两种情况。

## 10. FastAPI vs. Flask: A Final Comparison / FastAPI 与 Flask 最终对比

This note opened by describing the transition from Flask to FastAPI. Having now covered FastAPI in depth, we can draw a more precise comparison. The two frameworks are not in opposition — they occupy different points on a spectrum, and the right choice depends on the project.

这篇笔记开头描述了从 Flask 到 FastAPI 的转变。现在我们已经深入介绍了 FastAPI，可以做出更精确的对比了。这两个框架并非对立——它们位于光谱上的不同点，正确的选择取决于项目。

**Development speed.** For a small API with a handful of endpoints, Flask is faster to get started. A single `app.py` with a few `@app.route` decorators is all you need. FastAPI's startup cost is slightly higher because of the Pydantic model definitions and dependency injection wiring. But this advantage flips sharply as the project grows. Once you have ten endpoints, Flask's lack of built-in validation means you are writing the same `if "title" not in request.json` checks in every endpoint. FastAPI's Pydantic models eliminate that duplication, and the automatic documentation compounds the time savings with every new endpoint.

**开发速度。** 对于只有少数端点的简单 API，Flask 上手更快。一个 `app.py` 加上几个 `@app.route` 装饰器就足够了。FastAPI 的启动成本稍高，因为需要 Pydantic 模型定义和依赖注入的配置。但随着项目的增长，这种优势急剧反转。一旦你有了十个端点，Flask 缺乏内置验证意味着你在每个端点中都要写同样的 `if "title" not in request.json` 检查。FastAPI 的 Pydantic 模型消除了这种重复，而且自动文档随着每个新端点叠加节省时间。

**Performance.** FastAPI's async-native architecture gives it a significant advantage under concurrent load. Flask can achieve async through extensions like `quart`, but the ecosystem of Flask extensions is largely synchronous, so mixing async and sync code creates friction. FastAPI's async support is native and pervasive — every database query, every external API call, every file read can be `await`ed without changing frameworks or importing special extensions.

**性能。** FastAPI 的原生异步架构使其在并发负载下具有显著优势。Flask 可以通过像 `quart` 这样的扩展实现异步，但 Flask 扩展的生态系统基本上是同步的，混用异步和同步代码会产生摩擦。FastAPI 的异步支持是原生且遍及全栈的——每个数据库查询、每个外部 API 调用、每个文件读取都可以 `await`，而无需更换框架或导入特殊扩展。

**Learning curve.** FastAPI requires understanding two additional concepts: type hints (for Pydantic models and dependency injection) and async/await. For someone coming from Flask, these are the main adaptation points. The routing syntax is similar enough to feel familiar, but the mental model of dependencies and async database access takes practice. Once internalized, these concepts feel natural and reduce boilerplate, but the initial learning curve is real.

**学习曲线。** FastAPI 需要理解两个额外的概念：类型提示（用于 Pydantic 模型和依赖注入）和 async/await。对于从 Flask 过来的人，这些是主要的适应点。路由语法足够相似，让人感觉熟悉，但依赖关系和异步数据库访问的思维模型需要练习。一旦内化，这些概念会感觉很自然并减少样板代码，但初始的学习曲线是真实存在的。

**When to use Flask.** Flask remains an excellent choice for quick prototypes, single-file microservices, or projects where the entire API has fewer than five endpoints. If the project already uses a Flask‑based ecosystem (Flask-SQLAlchemy, Flask-Login, Flask-Admin), the migration cost to FastAPI may not be justified. Flask also has a larger ecosystem of extensions for niche use cases, though this gap has narrowed considerably.

**什么时候用 Flask。** Flask 仍然是快速原型、单文件微服务或整个 API 不超过五个端点的项目的出色选择。如果项目已经在使用基于 Flask 的生态系统（Flask-SQLAlchemy、Flask-Login、Flask-Admin），迁移到 FastAPI 的成本可能不值得。Flask 在细分用例中也有更大的扩展生态系统，尽管这个差距已经大大缩小。

**When to use FastAPI.** FastAPI is the natural choice for new projects that need async database access, automatic documentation, WebSocket support, or Pydantic‑based validation. If you are building a REST API with more than a handful of endpoints, FastAPI's productivity advantages outweigh the learning investment. My blog project met all these criteria: it needed async database access for concurrent requests, automatic docs for iterating quickly on the API design, and validation for dozens of request types. FastAPI was the right call.

**什么时候用 FastAPI。** FastAPI 是那些需要异步数据库访问、自动文档、WebSocket 支持或基于 Pydantic 的验证的新项目的自然选择。如果你在构建一个端点数量不止几个的 REST API，FastAPI 的生产力优势超过了学习投入。我的博客项目符合所有这些标准：它需要异步数据库访问来支持并发请求、自动文档以便快速迭代 API 设计、以及针对几十种请求类型的验证。FastAPI 是正确的选择。

The transition from Flask to FastAPI is not a rejection of one framework in favor of another. It is a recognition that different tools solve different problems, and that as a project grows from a prototype into a production system, its requirements change. Flask taught me how to think about web servers and routing. FastAPI taught me how to think about data validation, dependency injection, and asynchronous infrastructure. Both lessons are valuable, and both frameworks have their place.

从 Flask 到 FastAPI 的转变不是对一个框架的否定而是对另一个的偏爱。这是认识到不同的工具解决不同的问题，并且随着项目从原型发展到生产系统，它的需求也在变化。Flask 教会我如何思考 Web 服务器和路由。FastAPI 教会我如何思考数据验证、依赖注入和异步基础设施。两种经验都很有价值，两个框架各有其位置。
