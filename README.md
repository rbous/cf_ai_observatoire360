# Observatoire 360

Territorial surveillance platform for Quebec municipalities. Detects unpermitted constructions using satellite imagery and AI, alerts inspectors with timestamped evidence, and provides a full GIS dashboard for territory monitoring.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Cloudflare Edge                       │
│                                                         │
│   ┌─────────────────┐       ┌────────────────────────┐  │
│   │  Cloudflare      │       │  Cloudflare Workers    │  │
│   │  Pages (CDN)     │──────▶│  API (Hono + D1)       │  │
│   │                  │       │                        │  │
│   │  React SPA       │       │  Auth, Alerts, Reports │  │
│   │  Three.js Globe  │       │  Inspections, Users    │  │
│   │  Leaflet Maps    │       │  Contact, Health       │  │
│   └─────────────────┘       └────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Monorepo** with three packages:

| Package | Description | Runtime |
|---------|-------------|---------|
| `apps/web` | React SPA — marketing site + dashboard | Cloudflare Pages |
| `apps/api` | REST API — Hono framework | Cloudflare Workers |
| `packages/shared` | Types, Zod schemas, constants | Shared |

## Tech Stack

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, React Router, Three.js (3D globe), Leaflet + react-leaflet (GIS maps), Recharts, Framer Motion, shadcn/ui (Radix)

**Backend:** Hono, Drizzle ORM, Cloudflare D1 (SQLite), JWT auth via `jose`, PBKDF2 password hashing (Web Crypto API)

**Infrastructure:** Cloudflare Pages, Cloudflare Workers, Cloudflare D1, GitHub Actions CI/CD

## Local Development

### Prerequisites

- Node.js 20+
- pnpm 9+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (installed as dev dependency)

### Setup

```bash
# Install dependencies
pnpm install

# Build the shared package
pnpm --filter @observatoire360/shared build

# Set up the local database
cd apps/api
pnpm run db:migrate
pnpm run db:seed
cd ../..
```

### Run

Open two terminals:

```bash
# Terminal 1 — API (localhost:8787)
cd apps/api
pnpm dev

# Terminal 2 — Frontend (localhost:5173)
cd apps/web
pnpm dev
```

Open http://localhost:5173

### Demo Credentials

| Email | Password | Role |
|-------|----------|------|
| `demo@observatoire360.com` | `[REDACTED_PASSWORD]` | Manager |
| `inspector@obs360.com` | `[REDACTED_PASSWORD]` | Inspector |
| `analyst@obs360.com` | `[REDACTED_PASSWORD]` | Analyst |
| `readonly@obs360.com` | `[REDACTED_PASSWORD]` | Read-only |

## Deployment

### One-time setup

1. **Create D1 database:**
   ```bash
   cd apps/api
   npx wrangler d1 create observatoire360-db
   ```
   Update the `database_id` in `apps/api/wrangler.toml`.

2. **Set Workers secret:**
   ```bash
   npx wrangler secret put JWT_SECRET
   # Enter a strong random string (32+ chars)
   ```

3. **Create Pages project:**
   ```bash
   npx wrangler pages project create observatoire360
   ```

4. **GitHub repo secrets** (Settings → Secrets → Actions):

   | Secret | Value |
   |--------|-------|
   | `CLOUDFLARE_API_TOKEN` | API token with Workers + Pages + D1 permissions |
   | `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |

5. **GitHub repo variable** (Settings → Variables → Actions):

   | Variable | Value |
   |----------|-------|
   | `VITE_API_URL` | `https://observatoire360-api.<subdomain>.workers.dev` |

### Deploy

Push to `main`. GitHub Actions runs two parallel jobs:

- **API:** builds shared package → runs D1 migrations → deploys Worker
- **Web:** builds shared package → builds React app → deploys to Pages

```bash
git push origin main
```

### Manual deploy

```bash
# API
cd apps/api
npx wrangler d1 migrations apply observatoire360-db --remote
npx wrangler deploy

# Frontend
cd apps/web
VITE_API_URL=https://your-api.workers.dev pnpm build
npx wrangler pages deploy dist --project-name=observatoire360
```

## Project Structure

```
observatoire360/
├── apps/
│   ├── api/                        # Cloudflare Workers API
│   │   ├── src/
│   │   │   ├── db/
│   │   │   │   ├── schema.ts       # Drizzle ORM table definitions
│   │   │   │   ├── migrations/     # D1 SQL migrations
│   │   │   │   └── seed.sql        # Demo data
│   │   │   ├── lib/
│   │   │   │   ├── auth.ts         # PBKDF2 hashing, JWT sign/verify
│   │   │   │   └── ulid.ts         # ID generation
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts         # JWT verification + RBAC
│   │   │   │   ├── cors.ts         # CORS policy
│   │   │   │   ├── rateLimit.ts    # Sliding window rate limiter
│   │   │   │   └── security.ts     # CSP, HSTS, X-Frame-Options
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts         # Register, login, refresh, logout
│   │   │   │   ├── me.ts           # Current user profile
│   │   │   │   ├── alerts.ts       # Alert CRUD (municipality-scoped)
│   │   │   │   ├── inspections.ts  # Inspection scheduling
│   │   │   │   ├── reports.ts      # Stats and analytics
│   │   │   │   ├── users.ts        # User management (manager+)
│   │   │   │   ├── contact.ts      # Public contact form
│   │   │   │   └── health.ts       # Health check
│   │   │   └── index.ts            # Hono app entrypoint
│   │   └── wrangler.toml           # Workers + D1 config
│   │
│   └── web/                        # React SPA
│       └── src/
│           ├── app/
│           │   ├── components/
│           │   │   ├── marketing/   # Landing page sections
│           │   │   ├── dashboard/   # Map, alerts, reports, planning
│           │   │   ├── layout/      # Marketing + dashboard layouts
│           │   │   ├── shared/      # Risk/status badges, spinner
│           │   │   └── ui/          # shadcn/Radix primitives
│           │   ├── hooks/           # useAuth, useApi, useAlerts
│           │   ├── lib/             # API client, utilities
│           │   ├── pages/           # Route page components
│           │   └── providers/       # AuthProvider
│           └── styles/              # Tailwind + design tokens
│
├── packages/
│   └── shared/                     # Shared between web + api
│       └── src/
│           ├── constants.ts         # Roles, statuses, WMS layers
│           ├── types.ts             # TypeScript interfaces
│           └── schemas.ts           # Zod validation schemas
│
├── .github/workflows/deploy.yml    # CI/CD pipeline
├── turbo.json                       # Turborepo build config
└── pnpm-workspace.yaml             # Monorepo workspace config
```

## Security

- **Authentication:** JWT access tokens (15min) + HttpOnly refresh token cookies (30 days) with rotation
- **Password hashing:** PBKDF2-SHA256, 600,000 iterations via Web Crypto API
- **Rate limiting:** Sliding window per-IP on auth (20 req/15min) and contact (10 req/10min) endpoints
- **Headers:** HSTS, CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy
- **Data isolation:** All queries scoped to the authenticated user's municipality
- **Input validation:** Zod schemas shared between frontend and backend
- **CORS:** Restricted to the Pages domain + localhost

## GIS Data Sources

All map layers come from Quebec government open data:

| Source | Layers |
|--------|--------|
| [Géoindex du Québec](https://geoindex.mern.gouv.qc.ca) | Cadastre, limites municipales, orthophotos, adresses, hydrographie, courbes de niveau |
| [Forêt Ouverte](https://www.foretouverte.gouv.qc.ca) | Écoforestière, LiDAR, perturbations, couvert forestier |
| [Données Québec](https://www.donneesquebec.ca) | Zones inondables, milieux humides, zones agricoles, espèces menacées, bâtiments |
| [Sentinel-2](https://www.sentinel-hub.com) | Satellite imagery (planned) |

## License

Proprietary. All rights reserved.
