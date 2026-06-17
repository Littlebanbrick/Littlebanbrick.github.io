# Littlebanbrick's Full-Stack Blog

> **Notice**: This dynamic blog is planned to cease maintenance in **August 2026**. At that time, all essential features will be migrated to this static site. The source code will remain intact on **GitHub**.

A modern, fully-featured personal blog platform built from scratch. It allows you to write and manage posts, interact with visitors through comments and likes, showcase your photography and projects, and even enjoy music integration – all while being easily deployable via Docker and automatically updated with CI/CD.

## Features

- **Rich Content Creation**: Markdown editor for posts and study notes, with syntax highlighting and HTML support.
- **Engagement**: Nested comments with replies, post likes, and a contact/messaging system between admin and users (with unread notifications).
- **Media Management**: Upload images for posts and a photography portfolio; look up songs via QQ Music API or upload MP3 for a customizable music player (APlayer + Meting).
- **Admin Dashboard**: Manage posts, comments, projects, notes, and music via an intuitive admin interface.
- **CLI Chatbot**: A fun terminal-style chatbot with custom commands (whoami, whatis, etc.).
- **GitHub Trending Digest**: Automatically fetches daily trending repositories and generates an AI-powered summary using DeepSeek.
- **Dark Mode**: Follows system preference; all components adapt beautifully.
- **Security**: JWT authentication (httpOnly cookies), email verification, CSRF protection, login rate limiting.
- **DevOps Ready**: Docker containerization for frontend (Nginx + React) and backend (FastAPI); GitHub Actions workflows for continuous deployment.
- **Remote Post Creation API**: Expose blog post creation as a REST endpoint with API key authentication, allowing AI assistants (Cursor, Claude Desktop) to create posts remotely.

## Tech Stack

| Frontend                   | Backend                     | Database                                       | DevOps                 |
| -------------------------- | --------------------------- | ---------------------------------------------- | ---------------------- |
| React (Vite)               | FastAPI (Python)            | SQLite (with SQLAlchemy, PostgreSQL-swappable) | Docker, Docker Compose |
| Bulma CSS                  | SQLAlchemy Core + databases |                                                | GitHub Actions         |
| React Router               | JWT, bcrypt                 |                                                | Nginx                  |
| APlayer, DOMPurify, Meting |                             |                                                |                        |

## Getting Started

### Prerequisites

- Docker & Docker Compose installed on your machine or server.
- A domain name and valid SSL certificate if deploying to production (see deployment notes below).

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/Littlebanbrick/my-blog.git
   cd my-blog
   ```
2. Create an `.env` file from the provided template and fill in your secrets:

   ```bash
   cp .env.example .env
   # edit .env with JWT_SECRET_KEY, ADMIN_SECRET_KEY, email credentials, etc.
   ```

   > **Important**: See the Environment Variables table below for the full list.

3. Build and start all services:
   ```bash
   docker compose up -d --build
   ```
4. Open `http://localhost` in your browser. All API requests are proxied through Nginx on port 80; the backend is **not** directly exposed to the host.

### First-time Admin Setup

After the services are running, you need to create an admin user in the database:

```bash
# Open a shell in the running backend container
docker exec -it my-blog-backend-1 python3
```

```python
import asyncio
from database import database, users
from main import get_password_hash

async def init_admin():
    await database.connect()
    query = users.insert().values(
        username="admin",
        email="admin@blog.com",
        hashed_password=get_password_hash("your-admin-password"),
        role="admin",
        is_verified=1
    )
    await database.execute(query)
    print("Admin user created.")
    await database.disconnect()

asyncio.run(init_admin())
```

After that, you can log in via `/api/admin/login` using the `ADMIN_SECRET_KEY` from your `.env`.

### Deployment to Cloud Server

- The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that deploys to your server on push to `main`. Configure the required secrets (`REMOTE_HOST`, `REMOTE_USER`, `SSH_PRIVATE_KEY`) in your GitHub repository.
- On your server, clone the repository and set up the `.env`:
  ```bash
  cd ~/blog && git clone https://github.com/Littlebanbrick/my-blog.git
  cd my-blog
  # create .env with your secrets
  docker compose up -d --build
  ```
- **SSL Certificate**: The included Nginx configuration and certbot service assume a Let's Encrypt setup for `littlebanbrick.cn`. For other domains, modify `nginx.conf` and run certbot manually first:
  ```bash
  docker compose run --rm certbot certonly --webroot -w /var/www/certbot -d yourdomain.com
  ```
  Then update the `ssl_certificate` paths in `nginx.conf` accordingly.
- Subsequent updates are handled automatically via the CI/CD workflow.

## Project Structure

```
my-blog/
├── my-blog-frontend/          # React app
│   ├── src/                   # Components, utils, styles
│   ├── public/                # Static assets (APlayer, Meting libs, images)
│   ├── Dockerfile
│   └── nginx.conf
├── my-blog-backend/           # FastAPI app
│   ├── main.py                # API endpoints
│   ├── database.py            # Database models & schema migration
│   ├── github_trending.py     # Trending scraper & AI summary
│   └── static/                # Uploaded files (photos, music, post images)
├── learning_notes/            # Development notes & documentation
├── data/                      # SQLite database (persistent volume)
├── .github/workflows/
│   └── deploy.yml             # CI/CD deployment workflow
├── requirements.txt           # Python dependencies (shared between root & backend)
├── package.json               # Node.js dev dependencies (prettier, etc.)
├── docker-compose.yml
├── .env.example
└── update.ps1                 # Local update script (Windows)
```

## Environment Variables

| Variable            | Required  | Description                                                                    |
| ------------------- | --------- | ------------------------------------------------------------------------------ |
| `JWT_SECRET_KEY`    | Yes       | Key for signing JWT tokens (generate with `openssl rand -hex 32`)              |
| `ADMIN_SECRET_KEY`  | Yes       | Secret key for admin login via `/api/admin/login`                              |
| `SENDER_EMAIL`      | For email | Email address for sending verification emails (163.com)                        |
| `SENDER_AUTH_CODE`  | For email | SMTP authorization code for the sender email                                   |
| `DEEPSEEK_API_KEY`  | For AI    | DeepSeek API key for GitHub Trending summaries and `@deepseek` comment replies |
| `MCP_SECRET_KEY`    | No        | Key for remote post creation API authentication                                |
| `FRONTEND_BASE_URL` | Yes       | Public URL of your frontend (used in email verification links)                 |
| `ENV`               | Yes       | Set to `production` for HTTPS cookies, `development` otherwise                 |

---

# Littlebanbrick 全栈博客

> **注意**：此动态博客预计在 **2026 年 8 月** 停止维护，届时所有必要功能将移动至此静态博客，但源代码会在 GitHub 上原封不动予以保留。

一个从头构建的现代化、功能齐全的个人博客平台。支持撰写和管理文章、评论与点赞互动、展示摄影作品和项目，甚至集成音乐播放 — 同时可通过 Docker 轻松部署，并通过 CI/CD 自动更新。

## 功能特性

- **丰富的内容创作**：支持 Markdown 编辑器撰写文章和学习笔记，包含语法高亮和 HTML 支持。
- **用户互动**：嵌套评论（支持回复）、文章点赞、管理员与用户之间的私信系统（含未读通知）。
- **媒体管理**：上传文章图片及摄影作品集；通过 QQ 音乐 API 查询歌曲或上传 MP3，配合可自定义的音乐播放器（APlayer + Meting）。
- **管理后台**：通过直观的管理界面管理文章、评论、项目、笔记和音乐。
- **CLI 聊天机器人**：一个有趣的终端风格聊天机器人，支持自定义指令（whoami、whatis等）。
- **GitHub 趋势摘要**：自动抓取每日 GitHub 趋势仓库，使用 DeepSeek 生成 AI 摘要。
- **深色模式**：跟随系统偏好，所有组件完美适配。
- **安全机制**：JWT 认证（httpOnly Cookie）、邮箱验证、CSRF 保护、登录频率限制。
- **DevOps 就绪**：前端（Nginx + React）和后端（FastAPI）的 Docker 容器化；GitHub Actions 持续部署工作流。
- **远程文章创建 API**：将博客文章创建暴露为 REST 端点，通过 API 密钥认证，允许 AI 助手（Cursor、Claude Desktop）远程发布文章。

## 技术栈

| 前端                     | 后端                     | 数据库                                        | DevOps                 |
| ------------------------ | ------------------------ | --------------------------------------------- | ---------------------- |
| React (Vite)             | FastAPI (Python)         | SQLite（SQLAlchemy，可切换至 PostgreSQL）       | Docker、Docker Compose |
| Bulma CSS                | SQLAlchemy Core + 数据库  |                                               | GitHub Actions         |
| React Router             | JWT、bcrypt              |                                               | Nginx                  |
| APlayer、DOMPurify、Meting |                         |                                               |                        |

## 快速开始

### 前置要求

- 在本地或服务器上安装 Docker 和 Docker Compose。
- 若部署到生产环境，需准备域名和有效的 SSL 证书（参见下方部署说明）。

### 本地开发

1. 克隆仓库：
   ```bash
   git clone https://github.com/Littlebanbrick/my-blog.git
   cd my-blog
   ```
2. 基于模板创建 `.env` 文件并填入密钥：

   ```bash
   cp .env.example .env
   # 编辑 .env，填入 JWT_SECRET_KEY、ADMIN_SECRET_KEY、邮箱凭据等
   ```

   > **重要**：完整变量列表请参见下方的环境变量表。

3. 构建并启动所有服务：
   ```bash
   docker compose up -d --build
   ```
4. 在浏览器中打开 `http://localhost`。所有 API 请求通过 Nginx 代理到 80 端口；后端**不直接**暴露给宿主机。

### 首次管理员设置

服务启动后，需要在数据库中创建管理员用户：

```bash
# 进入正在运行的后端容器
docker exec -it my-blog-backend-1 python3
```

```python
import asyncio
from database import database, users
from main import get_password_hash

async def init_admin():
    await database.connect()
    query = users.insert().values(
        username="admin",
        email="admin@blog.com",
        hashed_password=get_password_hash("your-admin-password"),
        role="admin",
        is_verified=1
    )
    await database.execute(query)
    print("Admin user created.")
    await database.disconnect()

asyncio.run(init_admin())
```

创建后，使用 `.env` 中的 `ADMIN_SECRET_KEY` 通过 `/api/admin/login` 登录。

### 部署到云服务器

- 项目中包含 GitHub Actions 工作流（`.github/workflows/deploy.yml`），推送至 `main` 分支时会自动部署到你的服务器。请在 GitHub 仓库中配置所需密钥（`REMOTE_HOST`、`REMOTE_USER`、`SSH_PRIVATE_KEY`）。
- 在服务器上克隆仓库并配置 `.env`：
  ```bash
  cd ~/blog && git clone https://github.com/Littlebanbrick/my-blog.git
  cd my-blog
  # 创建 .env 并填入密钥
  docker compose up -d --build
  ```
- **SSL 证书**：附带的 Nginx 配置和 certbot 服务预设了 `littlebanbrick.cn` 的 Let's Encrypt 证书。若使用其他域名，请先修改 `nginx.conf` 并手动运行 certbot：
  ```bash
  docker compose run --rm certbot certonly --webroot -w /var/www/certbot -d yourdomain.com
  ```
  然后相应更新 `nginx.conf` 中的 `ssl_certificate` 路径。
- 后续更新由 CI/CD 工作流自动处理。

## 项目结构

```
my-blog/
├── my-blog-frontend/          # React 应用
│   ├── src/                   # 组件、工具函数、样式
│   ├── public/                # 静态资源（APlayer、Meting 库、图片）
│   ├── Dockerfile
│   └── nginx.conf
├── my-blog-backend/           # FastAPI 应用
│   ├── main.py                # API 端点
│   ├── database.py            # 数据库模型与 schema 迁移
│   ├── github_trending.py     # 趋势仓库抓取与 AI 摘要
│   └── static/                # 上传文件（照片、音乐、文章图片）
├── learning_notes/            # 开发笔记与文档
├── data/                      # SQLite 数据库（持久化卷）
├── .github/workflows/
│   └── deploy.yml             # CI/CD 部署工作流
├── requirements.txt           # Python 依赖（根目录与后端共享）
├── package.json               # Node.js 开发依赖（prettier 等）
├── docker-compose.yml
├── .env.example
└── update.ps1                 # 本地更新脚本（Windows）
```

## 环境变量

| 变量                 | 必需     | 说明                                                  |
| -------------------- | -------- | ---------------------------------------------------- |
| `JWT_SECRET_KEY`     | 是       | 用于签名 JWT Token（通过 `openssl rand -hex 32` 生成） |
| `ADMIN_SECRET_KEY`   | 是       | 通过 `/api/admin/login` 管理员登录的密钥               |
| `SENDER_EMAIL`       | 邮箱功能 | 发送验证邮件的邮箱地址（163.com）                      |
| `SENDER_AUTH_CODE`   | 邮箱功能 | 发送邮箱的 SMTP 授权码                                 |
| `DEEPSEEK_API_KEY`   | AI 功能  | DeepSeek API 密钥，用于 GitHub 趋势摘要和 `@deepseek` 评论回复 |
| `MCP_SECRET_KEY`     | 否       | 远程文章创建 API 认证密钥                              |
| `FRONTEND_BASE_URL`  | 是       | 前端的公开 URL（用于邮箱验证链接）                      |
| `ENV`                | 是       | 生产环境设为 `production`（启用 HTTPS Cookie），开发环境设为其他值 |
