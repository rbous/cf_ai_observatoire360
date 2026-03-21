# Playbook: Technical Administrator

> For the person responsible for deploying, maintaining, and scaling the Observatoire 360 infrastructure.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Initial Deployment](#initial-deployment)
3. [Environment & Secrets](#environment--secrets)
4. [Database Management](#database-management)
5. [Adding a New Municipality](#adding-a-new-municipality)
6. [Removing a Municipality](#removing-a-municipality)
7. [User Management via CLI](#user-management-via-cli)
8. [Monitoring the Detection Pipeline](#monitoring-the-detection-pipeline)
9. [Troubleshooting](#troubleshooting)
10. [Updating & Redeploying](#updating--redeploying)
11. [Backup & Recovery](#backup--recovery)
12. [Cost Management](#cost-management)
13. [Security Checklist](#security-checklist)

---

## Architecture Overview

```
Cloudflare Pages (CDN)          Cloudflare Workers (API)
   React SPA                       Hono + D1 + R2 + Queue
   ├── Marketing site              ├── Auth (JWT + PBKDF2)
   ├── Login                       ├── Alerts CRUD
   └── Dashboard                   ├── Notifications
       ├── Map (Leaflet + WMS)     ├── Scan management
       ├── Reports (Recharts)      ├── Image serving (R2)
       ├── Planning                ├── Cron scheduler
       └── Layers                  └── Queue consumer (AI detection)
```

**Services used (all free tier):**

| Service | Purpose | Free Limit |
|---------|---------|------------|
| Cloudflare Pages | Frontend hosting | Unlimited sites, 500 builds/month |
| Cloudflare Workers | Backend API | 100K requests/day |
| Cloudflare D1 | Database (SQLite) | 5M reads, 100K writes/day |
| Cloudflare R2 | Image storage | 10 GB, 10M reads/month |
| Cloudflare Queues | Job processing | 1M operations/month |
| Cloudflare Workers AI | Change detection | Free with Workers |
| Copernicus Data Space | Satellite imagery | Unlimited (free) |
| Resend | Email alerts | 3,000 emails/month |

---

## Initial Deployment

### Prerequisites

- Node.js 20+
- pnpm 9+ (`corepack enable && corepack prepare pnpm@9 --activate`)
- Cloudflare account (free)
- GitHub account

### Step-by-step

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_ORG/observatoire360-v2.git
cd observatoire360-v2

# 2. Install dependencies
pnpm install

# 3. Authenticate with Cloudflare
cd apps/api
npx wrangler login

# 4. Create Cloudflare resources
npx wrangler d1 create observatoire360-db
# ⚠️ Copy the database_id from the output

npx wrangler r2 bucket create observatoire360-images
npx wrangler queues create observatoire360-detection
npx wrangler queues create observatoire360-detection-dlq
npx wrangler pages project create observatoire360

# 5. Update wrangler.toml with the real database_id
# Edit apps/api/wrangler.toml → replace the database_id in both places

# 6. Set secrets
npx wrangler secret put JWT_SECRET
# Enter a strong random string (generate with: openssl rand -base64 48)

npx wrangler secret put COPERNICUS_CLIENT_ID
# From https://dataspace.copernicus.eu → Dashboard → OAuth Clients

npx wrangler secret put COPERNICUS_CLIENT_SECRET

npx wrangler secret put RESEND_API_KEY
# From https://resend.com → API Keys

# 7. Run database migrations
npx wrangler d1 migrations apply observatoire360-db --remote

# 8. Seed initial data (optional — or add municipalities manually)
npx wrangler d1 execute observatoire360-db --remote --file=src/db/seed.sql

# 9. Deploy
npx wrangler deploy
cd ../web
VITE_API_URL=https://observatoire360-api.YOUR_SUBDOMAIN.workers.dev/api pnpm build
npx wrangler pages deploy dist --project-name=observatoire360

# 10. Set up GitHub Actions (for automatic deploys on push)
# Add these GitHub repo secrets:
#   CLOUDFLARE_API_TOKEN — API token with Workers + Pages + D1 permissions
#   CLOUDFLARE_ACCOUNT_ID — your Cloudflare account ID
# Add this GitHub repo variable:
#   VITE_API_URL — https://observatoire360-api.YOUR_SUBDOMAIN.workers.dev/api
```

---

## Environment & Secrets

### Secrets (stored encrypted on Cloudflare, never in code)

| Secret | How to set | How to rotate |
|--------|-----------|---------------|
| `JWT_SECRET` | `wrangler secret put JWT_SECRET` | Set new value, all active sessions will be invalidated |
| `COPERNICUS_CLIENT_ID` | `wrangler secret put COPERNICUS_CLIENT_ID` | Create new OAuth client on Copernicus, update secret |
| `COPERNICUS_CLIENT_SECRET` | `wrangler secret put COPERNICUS_CLIENT_SECRET` | Same as above |
| `RESEND_API_KEY` | `wrangler secret put RESEND_API_KEY` | Create new key on Resend, revoke old one |

### Environment variables (in wrangler.toml)

| Variable | Purpose | Example |
|----------|---------|---------|
| `ENVIRONMENT` | Runtime mode | `production` |
| `ALLOWED_ORIGIN` | CORS whitelist | `https://observatoire360.pages.dev` |

### GitHub Actions secrets

| Secret | Purpose |
|--------|---------|
| `CLOUDFLARE_API_TOKEN` | Deploys Workers + Pages + runs D1 migrations |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account identifier |

### GitHub Actions variables

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | API base URL injected at build time (must end with `/api`) |

---

## Database Management

### Connect to the database

```bash
cd apps/api

# Query production
npx wrangler d1 execute observatoire360-db --remote --command="SELECT * FROM municipalities"

# Query local dev
npx wrangler d1 execute observatoire360-db --local --command="SELECT * FROM municipalities"

# Run a SQL file
npx wrangler d1 execute observatoire360-db --remote --file=path/to/file.sql
```

### Apply migrations

```bash
# Production
npx wrangler d1 migrations apply observatoire360-db --remote

# Local development
npx wrangler d1 migrations apply observatoire360-db --local
```

### Database schema

| Table | Purpose |
|-------|---------|
| `municipalities` | Municipality profiles + scan configuration |
| `users` | User accounts (email, hashed password, role, municipality) |
| `alerts` | Detected constructions (coordinates, risk, status, images) |
| `inspections` | Scheduled/completed inspections linked to alerts |
| `notifications` | In-app notifications |
| `scan_jobs` | Satellite scan history and status tracking |
| `refresh_tokens` | JWT refresh token hashes |
| `contact_submissions` | Marketing site contact form entries |

---

## Adding a New Municipality

### 1. Find the bounding box

Go to https://boundingbox.klokantech.com/, search for the municipality, select "CSV" format. You'll get: `west,south,east,north`.

### 2. Insert into the database

```bash
npx wrangler d1 execute observatoire360-db --remote --command="
INSERT INTO municipalities (id, name, code, region, bounds, scan_frequency, scan_enabled, created_at)
VALUES (
    '$(openssl rand -hex 13)',
    'NOM_MUNICIPALITE',
    'CODE',
    'REGION',
    '{\"north\":LAT_N,\"south\":LAT_S,\"east\":LNG_E,\"west\":LNG_W}',
    'daily',
    1,
    $(date +%s)
)
"
```

**Replace:**
- `NOM_MUNICIPALITE` — full name (e.g., `Gatineau`)
- `CODE` — 3-letter code (e.g., `GAT`)
- `REGION` — administrative region (e.g., `Outaouais`)
- `LAT_N`, `LAT_S`, `LNG_E`, `LNG_W` — bounding box coordinates

### 3. Create admin user(s)

Generate a password hash:
```bash
node -e "const c=require('crypto'),s=c.randomBytes(16);c.pbkdf2('THEIR_PASSWORD',s,100000,32,'sha256',(e,h)=>console.log('pbkdf2:100000:'+s.toString('base64')+':'+h.toString('base64')))"
```

Insert the user:
```bash
npx wrangler d1 execute observatoire360-db --remote --command="
INSERT INTO users (id, municipality_id, email, password_hash, name, role, is_active, created_at, updated_at)
VALUES (
    '$(openssl rand -hex 13)',
    'MUNICIPALITY_ID',
    'user@email.com',
    'HASH_FROM_ABOVE',
    'User Name',
    'manager',
    1,
    $(date +%s),
    $(date +%s)
)
"
```

### 4. Trigger initial baseline scan

```bash
# Log in to get a token
TOKEN=$(node -e 'fetch("https://YOUR_API_URL/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"user@email.com",password:"THEIR_PASSWORD"})}).then(r=>r.json()).then(j=>process.stdout.write(j.accessToken))')

# Trigger scan
curl -X POST "https://YOUR_API_URL/api/scans/trigger" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

The first scan stores a baseline image (0 detections). Subsequent scans will compare against it.

---

## Removing a Municipality

⚠️ **This permanently deletes all data for the municipality.**

Save this as `delete_municipality.sql`:
```sql
PRAGMA foreign_keys=OFF;
DELETE FROM inspections WHERE inspector_id IN (SELECT id FROM users WHERE municipality_id = 'MUNICIPALITY_ID');
DELETE FROM notifications WHERE municipality_id = 'MUNICIPALITY_ID';
DELETE FROM scan_jobs WHERE municipality_id = 'MUNICIPALITY_ID';
DELETE FROM alerts WHERE municipality_id = 'MUNICIPALITY_ID';
DELETE FROM refresh_tokens WHERE user_id IN (SELECT id FROM users WHERE municipality_id = 'MUNICIPALITY_ID');
DELETE FROM users WHERE municipality_id = 'MUNICIPALITY_ID';
DELETE FROM municipalities WHERE id = 'MUNICIPALITY_ID';
PRAGMA foreign_keys=ON;
```

Run it:
```bash
npx wrangler d1 execute observatoire360-db --remote --file=delete_municipality.sql
```

Also clean up R2 images:
```bash
# List images for the municipality code
npx wrangler r2 object list observatoire360-images --prefix="sentinel/" | grep CODE
# Delete individually or leave them (they'll just sit unused)
```

---

## User Management via CLI

### List users for a municipality
```bash
npx wrangler d1 execute observatoire360-db --remote \
  --command="SELECT id, email, name, role, is_active FROM users WHERE municipality_id = 'MUNICIPALITY_ID'"
```

### Deactivate a user (soft delete)
```bash
npx wrangler d1 execute observatoire360-db --remote \
  --command="UPDATE users SET is_active = 0 WHERE email = 'user@email.com'"
```

### Reset a user's password
```bash
# Generate new hash
node -e "const c=require('crypto'),s=c.randomBytes(16);c.pbkdf2('NewPassword1!',s,100000,32,'sha256',(e,h)=>console.log('pbkdf2:100000:'+s.toString('base64')+':'+h.toString('base64')))"

# Update
npx wrangler d1 execute observatoire360-db --remote \
  --command="UPDATE users SET password_hash = 'HASH_FROM_ABOVE' WHERE email = 'user@email.com'"
```

### Change a user's role
Valid roles: `manager`, `inspector`, `analyst`, `readonly`

```bash
npx wrangler d1 execute observatoire360-db --remote \
  --command="UPDATE users SET role = 'inspector' WHERE email = 'user@email.com'"
```

---

## Monitoring the Detection Pipeline

### Check recent scan jobs
```bash
npx wrangler d1 execute observatoire360-db --remote \
  --command="SELECT s.id, m.name, s.status, s.detections_count, s.error, s.created_at FROM scan_jobs s JOIN municipalities m ON s.municipality_id = m.id ORDER BY s.created_at DESC LIMIT 10"
```

### Check if cron is running
```bash
npx wrangler tail observatoire360-api --format=pretty
# Wait for the next cron trigger or trigger manually to see logs
```

### Check R2 bucket contents
```bash
npx wrangler r2 object list observatoire360-images --prefix="sentinel/"
```

### Check queue status
Go to Cloudflare Dashboard → Workers & Pages → Queues → `observatoire360-detection`

### Modify scan frequency for a municipality
```bash
npx wrangler d1 execute observatoire360-db --remote \
  --command="UPDATE municipalities SET scan_frequency = 'weekly' WHERE code = 'GAT'"
```

Valid frequencies: `daily`, `weekly`, `biweekly`, `monthly`

### Disable scanning for a municipality
```bash
npx wrangler d1 execute observatoire360-db --remote \
  --command="UPDATE municipalities SET scan_enabled = 0 WHERE code = 'GAT'"
```

---

## Troubleshooting

### "PBKDF2 failed: iteration counts above 100000 are not supported"
Cloudflare Workers limits PBKDF2 to 100K iterations. If old password hashes used 600K, regenerate them:
```bash
# Generate new hash with 100K iterations
node -e "const c=require('crypto'),s=c.randomBytes(16);c.pbkdf2('Password',s,100000,32,'sha256',(e,h)=>console.log('pbkdf2:100000:'+s.toString('base64')+':'+h.toString('base64')))"

# Update all users
npx wrangler d1 execute observatoire360-db --remote \
  --command="UPDATE users SET password_hash = 'NEW_HASH'"
```

### Scan job stuck in "pending"
The queue consumer might not be wired. Check `apps/api/src/index.ts` — ensure `handleQueue` is imported and exported:
```typescript
import { handleQueue } from "./queue.js";
export default {
    fetch: app.fetch,
    async queue(batch, env, ctx) { ctx.waitUntil(handleQueue(batch, env)); },
    ...
};
```
Redeploy: `npx wrangler deploy`

### Scan job failed
```bash
npx wrangler d1 execute observatoire360-db --remote \
  --command="SELECT id, error FROM scan_jobs WHERE status = 'failed' ORDER BY created_at DESC LIMIT 5"
```

Common errors:
- `Copernicus CDSE token request failed` → Check COPERNICUS_CLIENT_ID/SECRET secrets
- `No data available` → Normal, no cloud-free imagery in the last 30 days
- `AI detection: before image not found in R2` → R2 image was deleted, trigger a new baseline scan

### Emails not sending
1. Verify domain is configured in Resend (https://resend.com/domains)
2. Check RESEND_API_KEY is set: `npx wrangler secret list`
3. Check that the `from` address domain matches a verified domain in Resend

### CORS errors in browser
Verify `ALLOWED_ORIGIN` in `wrangler.toml` matches your Pages URL exactly (with `https://`, no trailing slash).

### Login returns 500
Check Worker logs: `npx wrangler tail observatoire360-api --format=pretty`, then attempt a login.

---

## Updating & Redeploying

### Automatic (recommended)
Push to `main` branch. GitHub Actions will:
1. Build the shared package
2. Run D1 migrations
3. Deploy Workers API
4. Build and deploy the frontend

### Manual
```bash
# API
cd apps/api
npx wrangler d1 migrations apply observatoire360-db --remote
npx wrangler deploy

# Frontend
cd apps/web
VITE_API_URL=https://YOUR_API_URL/api pnpm build
npx wrangler pages deploy dist --project-name=observatoire360
```

### Rolling back
```bash
# List recent deployments
npx wrangler deployments list

# Roll back to a previous version
npx wrangler rollback
```

⚠️ Database migrations cannot be rolled back automatically. If a migration breaks something, write a reverse migration manually.

---

## Backup & Recovery

### Database backup
```bash
# Export all data
npx wrangler d1 export observatoire360-db --remote --output=backup-$(date +%Y%m%d).sql
```

### Database restore
```bash
npx wrangler d1 execute observatoire360-db --remote --file=backup-20260321.sql
```

### R2 image backup
R2 doesn't have a built-in export tool. For critical images, sync to a local folder:
```bash
# List all objects
npx wrangler r2 object list observatoire360-images
# Download specific images
npx wrangler r2 object get observatoire360-images sentinel/2026-03-21/GAT.png
```

---

## Cost Management

Everything runs within free tiers. To avoid ever exceeding:

| Resource | Free limit | How to stay under |
|----------|-----------|-------------------|
| Workers requests | 100K/day | Don't open the dashboard in 100K browser tabs |
| D1 reads | 5M/day | Each page load is ~5 queries = 1M daily users before hitting limit |
| D1 writes | 100K/day | Each scan creates ~10 writes = 10K scans/day before hitting limit |
| R2 storage | 10 GB | Each image is ~200KB = ~50,000 images before hitting limit |
| R2 reads | 10M/month | Dashboard image views |
| Queue operations | 1M/month | Each scan is 1 operation |
| Resend emails | 3,000/month | Only sent on new detections |

**If you grow beyond free tiers:** Cloudflare's paid plan is $5/month for 10M Workers requests, unlimited D1, etc.

---

## Security Checklist

- [ ] JWT_SECRET is a random string of 48+ characters
- [ ] All secrets are set via `wrangler secret put`, never in code or wrangler.toml
- [ ] `.dev.vars` is in `.gitignore` (it is by default)
- [ ] ALLOWED_ORIGIN is set to your exact Pages domain
- [ ] Resend domain has SPF, DKIM, and DMARC records configured
- [ ] Copernicus OAuth client is scoped to your app only
- [ ] GitHub Actions secrets are set (not hardcoded in workflow)
- [ ] No real passwords are in the seed.sql file committed to git
- [ ] Rate limiting is active on auth endpoints (20 req/15 min)
- [ ] Rate limiting is active on contact form (10 req/10 min)
- [ ] All API routes except health/contact/auth require JWT authentication
- [ ] All database queries are scoped to the user's municipality
