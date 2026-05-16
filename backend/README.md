# LetterAlchemy Backend ⚙️

> The edge-deployed API and realtime inference engine for LetterAlchemy, built on Cloudflare Workers for zero cold-start latency. ⚡️

---

## 🛠️ Tech Stack

- **Framework:** Hono + TypeScript 🦊
- **Runtime:** Cloudflare Workers (Edge) ☁️
- **Database:** PostgreSQL (Neon Serverless) 🐘
- **ORM:** Prisma ORM with Accelerate 🔗
- **AI Integration:** Google Gemini API (`@google/genai`) 🧠

---

## 🏗️ Architecture & Data Flow

The backend acts as the central brain of the platform. It handles all standard CRUD operations, enforces security rules, interacts with the database, and orchestrates complex, parallel AI tasks.

```mermaid
graph TD
    %% Backend Node Styling
    classDef edge fill:#f97316,stroke:#c2410c,stroke-width:2px,color:#fff;
    classDef route fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#fff;
    classDef service fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff;
    classDef db fill:#8b5cf6,stroke:#6d28d9,stroke-width:2px,color:#fff;

    Client((📱 Client)) --> |HTTP Requests / SSE| Router

    subgraph "Cloudflare Workers Edge (Hono)":::edge
        Router["🚦 Hono Router"]:::route
        Middleware["🔐 Auth & Validation<br/>(JWT, Zod)"]:::route
        
        subgraph "Services"
            PostService["📝 Post & CRUD Logic"]:::service
            AIService["🧠 AI Orchestrator<br/>(Streaming & Promise.all)"]:::service
        end

        Router --> Middleware
        Middleware --> PostService
        Middleware --> AIService
    end

    PostService <--> |Prisma Client| Database[("🐘 PostgreSQL (Neon)")]:::db
    AIService <--> |@google/genai| Gemini["🤖 Google Gemini API"]:::db
    
    Cron(("⏰ Cloudflare Cron")) -.-> |Scheduled Fetch| AIService
```

### 🎯 Key Responsibilities:
- **Edge Deployment 🌍:** Runs entirely on Cloudflare's global edge network, keeping latency extremely low.
- **AI Orchestration 🧠:** Manages parallel `Promise.all` requests to Gemini and streams back partial responses using `TransformStreams` and Server-Sent Events (SSE).
- **Background Jobs ⏰:** Utilizes Cloudflare Cron Triggers to run scheduled tasks (like fetching and summarizing Reddit headlines).
- **Authentication 🔐:** Custom JWT middleware handles secure user session validation.

---

## 🚀 Getting Started Locally

### 1️⃣ Install Dependencies
```bash
npm install
```

### 2️⃣ Environment Variables
Copy the example file and populate it with your actual secrets.
```bash
cp .dev.vars.example .dev.vars
```

Your `.dev.vars` needs:
- `DATABASE_URL` (Neon Postgres connection string)
- `JWT_SECRET` (For signing auth tokens)
- `GEMINI_API_KEY` (From Google AI Studio)

### 3️⃣ Database Setup
Push the Prisma schema to your database to sync the tables:
```bash
npx prisma db push
```

### 4️⃣ Run Development Server
```bash
npm run dev
```
The API will be available at `http://localhost:8787` 🌐.

---

## 🗄️ Database Schema Overview
- **Core Models:** `user`, `post`, `comment`, `like`
- **Feature Models:** `newsHeadline`, `aiTweet`
- **Future AI Observability:** `ai_logs`, `prompt_configs`

---

## 📁 Folder Structure

```text
backend/
├── src/
│   ├── index.ts           # 🚀 Hono app entry point + Cron handlers
│   ├── routes/            # 🚦 Route controllers (auth.ts, posts.ts)
│   ├── middleware/        # 🛡️ Custom middleware (auth.middleware.ts)
│   ├── services/          # 🧠 External service wrappers (gemini.ts)
│   ├── db/                # 🗄️ Database configuration (prisma.ts)
│   ├── schemas/           # ✅ Zod validation schemas
│   └── types/             # 🏷️ Type definitions (Cloudflare env bindings)
├── prisma/
│   └── schema.prisma      # 🗺️ Database schema definitions
└── wrangler.jsonc         # ☁️ Cloudflare Workers configuration
```
