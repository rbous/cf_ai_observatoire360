# cf_ai_observatoire360

AI-powered territorial surveillance platform that detects unpermitted constructions using satellite imagery, change detection AI, and an agentic chat assistant. Built entirely on Cloudflare's developer platform.

**Live demo:** [observatoire360.pages.dev](https://observatoire360.pages.dev)

---

## Quick Start — Try It Now

### Option 1: Live demo (no setup)

1. Go to [observatoire360.pages.dev/connexion](https://observatoire360.pages.dev/connexion)
2. Click any demo city button (Gatineau, Austin, London, or Lisbon)
3. You're in the dashboard — explore the map, alerts, and reports
4. **Click the blue chat bubble** (bottom-right) to talk to the AI assistant
5. Try: *"How many alerts do I have?"*, *"Show me the stats"*, *"List users"*

### Option 2: Run locally

```bash
git clone https://github.com/rbous/cf_ai_observatoire360.git
cd cf_ai_observatoire360
pnpm install
pnpm --filter @observatoire360/shared build

# Terminal 1 — API
cd apps/api
pnpm run db:migrate && pnpm run db:seed
pnpm dev

# Terminal 2 — Frontend
cd apps/web
pnpm dev
```

Open http://localhost:5173 → click a demo city to log in.

---

## Cloudflare AI Components

| Requirement | Implementation |
|-------------|---------------|
| **LLM** | Llama 3.3 70B (`@cf/meta/llama-3.3-70b-instruct-fp8-fast`) via Workers AI for the agentic chat + Llama 3.2 11B Vision for satellite image classification |
| **Workflow / coordination** | Workers (Hono API) + Queues (async detection pipeline) + Cron Triggers (scheduled scans) + D1 (state) |
| **User input via chat** | Agentic chat assistant with 13 tools — can do everything the UI can via natural language |
| **Memory / state** | D1 database (alerts, users, scans, inspections, chat history), R2 (satellite images), conversation memory |

### Agentic Chat — 13 Tools

The chat assistant uses a **ReAct-style tool-calling loop**: the LLM decides which tool to use, executes it, reads the result, and responds.

| Tool | Action |
|------|--------|
| `list_alerts` | Search and filter alerts |
| `get_alert` | Get alert details |
| `update_alert` | Change alert status/risk |
| `list_inspections` | View scheduled inspections |
| `create_inspection` | Schedule a new inspection |
| `get_stats` | Dashboard statistics |
| `trigger_scan` | Launch satellite analysis |
| `list_scans` | View scan history |
| `list_users` | List municipality users |
| `create_user` | Add a new user |
| `list_notifications` | View notifications |
| `mark_notifications_read` | Mark all as read |
| `get_profile` | Current user info |

### Detection Pipeline

```
Cron Trigger (daily)
    │
    ▼
Check for new Esri Wayback satellite imagery releases
    │
    ▼
Queue: Fetch before/after images at same zoom level
    │
    ▼
Stage 1: Pixel-diff (byte-level comparison, no AI)
    ├── Score < 12% → No change → skip
    └── Score ≥ 12% → Change detected
            │
            ▼
        Stage 2: Llama 3.2 Vision classifies the change
            │
            ▼
        Create alert + notification + email
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Cloudflare Edge                          │
│                                                              │
│  Pages (React SPA)  ←→  Workers (Hono API)  ←→  D1 (SQLite) │
│                          │        │                          │
│                     Workers AI    R2 (images)                │
│                     (Llama 3.3)   Queues (pipeline)          │
│                                   Cron Triggers              │
└─────────────────────────────────────────────────────────────┘
```

**Monorepo** with pnpm workspaces + Turborepo:

| Package | Description | Runtime |
|---------|-------------|---------|
| `apps/web` | React 19 SPA — marketing + dashboard | Cloudflare Pages |
| `apps/api` | REST API — Hono + Drizzle ORM | Cloudflare Workers |
| `packages/shared` | Types, Zod schemas, constants | Shared |

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Leaflet (GIS maps), Recharts, Framer Motion
- **Backend:** Hono, Drizzle ORM, Cloudflare D1, JWT auth (PBKDF2 via Web Crypto)
- **AI:** Llama 3.3 70B (chat), Llama 3.2 11B Vision (image classification), Workers AI
- **Imagery:** Esri World Imagery Wayback (historical), Esri MapServer (current), Copernicus Sentinel-2
- **Email:** Resend
- **CI/CD:** GitHub Actions → Cloudflare Pages + Workers

## Features

- **Marketing site** — dark professional landing page with satellite globe illustration
- **Multi-city demo** — one-click login for Gatineau, Austin, London, Lisbon
- **GIS dashboard** — Leaflet map with Quebec WMS layers, colored alert markers
- **Alert management** — list, filter, update status, view before/after satellite images
- **Image comparison** — drag-line slider for before/after satellite imagery
- **AI detection pipeline** — automated two-stage change detection (pixel-diff + LLM vision)
- **Agentic chat** — natural language interface to all dashboard actions
- **Inspection planning** — schedule and track field inspections
- **Reports** — KPIs, charts (by month, type, risk level)
- **User management** — RBAC (manager, inspector, analyst, readonly)
- **Notifications** — in-app + email alerts on new detections
- **FR/EN** — full bilingual support with language toggle
- **Security** — JWT + refresh tokens, rate limiting, CSP headers, municipality-scoped data isolation

## Security

- JWT access tokens (15min) + HttpOnly refresh cookies (30 days) with rotation
- PBKDF2-SHA256 password hashing (100K iterations, Web Crypto API)
- Rate limiting on auth (20 req/15min) and contact (10 req/10min)
- HSTS, CSP, X-Frame-Options, Referrer-Policy headers
- All queries scoped to authenticated user's municipality
- Zod validation shared between frontend and backend
- CORS restricted to Pages domain

## Deployment

### Prerequisites

- Node.js 20+, pnpm 9+
- Cloudflare account (free tier covers everything)

### One-time setup

```bash
cd apps/api
npx wrangler login
npx wrangler d1 create observatoire360-db    # Copy the database_id
npx wrangler r2 bucket create observatoire360-images
npx wrangler queues create observatoire360-detection
npx wrangler queues create observatoire360-detection-dlq
npx wrangler pages project create observatoire360

# Set secrets
npx wrangler secret put JWT_SECRET            # Random 48+ char string
npx wrangler secret put COPERNICUS_CLIENT_ID  # From dataspace.copernicus.eu
npx wrangler secret put COPERNICUS_CLIENT_SECRET
npx wrangler secret put RESEND_API_KEY        # From resend.com
npx wrangler secret put EMAIL_FROM            # e.g. "App <alerts@yourdomain.com>"
```

Update `database_id` in `apps/api/wrangler.toml`, then:

```bash
# GitHub repo secrets: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, D1_DATABASE_ID
# GitHub repo variable: VITE_API_URL (your Workers URL + /api)
git push origin main  # GitHub Actions deploys everything
```

## Project Structure

```
cf_ai_observatoire360/
├── apps/
│   ├── api/                          # Cloudflare Workers API
│   │   └── src/
│   │       ├── routes/chat.ts        # Agentic chat (Llama 3.3 + ReAct loop)
│   │       ├── lib/chat-tools.ts     # 13 tool executors
│   │       ├── lib/change-detection.ts # Two-stage pixel-diff + AI classification
│   │       ├── lib/wayback.ts        # Esri Wayback historical imagery
│   │       ├── scheduled.ts          # Cron Trigger handler
│   │       └── queue.ts              # Queue consumer (detection pipeline)
│   └── web/                          # React SPA
│       └── src/app/
│           ├── components/dashboard/ChatPanel.tsx  # Chat UI
│           ├── components/dashboard/MapView.tsx    # Leaflet GIS map
│           ├── hooks/useChat.ts                    # Chat state management
│           └── i18n/translations.ts                # FR/EN translations
├── packages/shared/                  # Types, schemas, constants
├── docs/                             # 6 playbooks (EN + FR)
├── PROMPTS.md                        # AI prompts used during development
└── e2e-test.mjs                      # 22 Playwright E2E tests
```

## License

MIT
