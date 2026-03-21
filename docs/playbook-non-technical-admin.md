# Playbook: Non-Technical Administrator

> For the person who manages municipalities, users, and oversees the platform day-to-day — without needing to touch code or the command line.

---

## Table of Contents

1. [Logging In](#logging-in)
2. [Dashboard Overview](#dashboard-overview)
3. [Managing Alerts](#managing-alerts)
4. [Reviewing Scan Results](#reviewing-scan-results)
5. [Managing Notifications](#managing-notifications)
6. [Scheduling Inspections](#scheduling-inspections)
7. [Viewing Reports](#viewing-reports)
8. [Managing Map Layers](#managing-map-layers)
9. [Managing Users](#managing-users)
10. [Understanding the Detection Pipeline](#understanding-the-detection-pipeline)
11. [Common Questions](#common-questions)
12. [When to Contact the Technical Admin](#when-to-contact-the-technical-admin)

---

## Logging In

1. Go to the Observatoire 360 website
2. Click **ESPACE CLIENT** in the top navigation bar (or go directly to `/connexion`)
3. Enter your email and password
4. Click **SE CONNECTER**

If you forgot your password, click **Mot de passe oublié?** and follow the instructions.

**Your credentials are provided by the technical administrator.** If you don't have an account, contact them.

---

## Dashboard Overview

After logging in, you'll see the main dashboard with:

| Area | Location | Purpose |
|------|----------|---------|
| **Top bar** | Top of screen | Municipality name, filters, notifications bell, profile |
| **Sidebar** | Left side | Navigation: Carte, Rapport et Stat, Planif., Calque |
| **Map** | Center | Interactive map with alert markers and government map layers |
| **Alert list** | Left panel (on map page) | Searchable, filterable list of all alerts |
| **Notification panel** | Right side | Real-time alerts and system messages |

### Navigation

| Menu Item | What it shows |
|-----------|---------------|
| **Carte** | Interactive map with all alerts plotted as colored dots |
| **Rapport et Stat** | Statistics, charts, and KPIs about detections |
| **Planif.** | Inspection scheduling calendar |
| **Calque** | Toggle map layers on/off (cadastre, aerial photos, etc.) |

---

## Managing Alerts

### Understanding alert colors

Alerts appear as colored dots on the map:

| Color | Risk Level | Meaning |
|-------|------------|---------|
| 🔴 Red | High | High probability of unpermitted construction — urgent review needed |
| 🟡 Amber | Medium | Possible violation — needs analysis |
| 🟢 Green | Low | Minor change detected — likely compliant |

### Alert statuses (lifecycle)

Each alert progresses through these stages:

```
À analyser → À inspecter → En cours → Infraction confirmée → Clôturée
```

| Status | Who acts | What to do |
|--------|----------|------------|
| **À analyser** | Analyst/Manager | Review the satellite images, assess if it's a real violation |
| **À inspecter** | Manager | Assign an inspector, schedule a site visit |
| **En cours** | Inspector | Inspector is actively investigating |
| **Infraction confirmée** | Manager | Issue the formal notice, start enforcement |
| **Clôturée** | Manager | Case resolved (compliant, demolished, fined, etc.) |

### Viewing an alert

1. Click a dot on the map, then click **Voir le détail**
2. Or click an alert in the left-side list
3. You'll see:
   - **Before/after satellite images** (side by side comparison)
   - **Technical data**: coordinates, detected area, zone, permit status
   - **AI confidence score**: how confident the AI is that this is a real change
   - **Action timeline**: history of status changes
   - **Actions**: change status, assign inspector, schedule inspection

### Updating an alert

1. Open the alert detail page
2. Use the status dropdown to change the status
3. Add notes if needed
4. Click save

---

## Reviewing Scan Results

The system automatically scans your municipality's territory using satellite imagery. Each scan:

1. Downloads the latest Sentinel-2 satellite image
2. Compares it to the previous image using AI
3. Creates alerts for any new constructions detected
4. Sends you an email notification

### Viewing scan history

The scan history is available via the API. Ask your technical admin for a scan status report if needed.

### What happens on each scan

| First scan ever | Subsequent scans |
|----------------|-----------------|
| Downloads baseline image, 0 detections | Compares new image to previous, AI identifies changes |

### Scan frequency

Your municipality's scan frequency is configured by the technical admin. Options:
- **Daily** — scans every day at 6 AM EST
- **Weekly** — once per week
- **Bi-weekly** — every two weeks
- **Monthly** — once per month

---

## Managing Notifications

### Notification bell

The bell icon in the top bar shows a red badge with the number of unread notifications. Click it to open the notification panel.

### Notification types

| Type | Trigger | What to do |
|------|---------|------------|
| **Nouvelle alerte** | AI detected a new construction | Review the alert, update its status |
| **Changement de statut** | An alert's status was changed | No action needed (informational) |
| **Inspection à venir** | A scheduled inspection is approaching | Prepare for the inspection |
| **Système** | System maintenance or updates | Read and acknowledge |

### Actions

- **Click a notification** → opens the related alert
- **Tout marquer comme lu** → clears all unread badges

### Email notifications

Managers automatically receive email alerts when new detections are found. The email includes:
- Municipality name
- Alert type and risk level
- Estimated address
- AI confidence score
- Direct link to the alert in the dashboard

---

## Scheduling Inspections

1. Navigate to **Planif.** in the sidebar
2. View the weekly calendar with scheduled inspections
3. To schedule a new inspection:
   - Go to an alert's detail page
   - Click **Planifier une inspection**
   - Select the inspector, date, and time
   - Add notes (access instructions, what to look for, etc.)
4. The inspector will see the inspection in their own dashboard

### Inspection statuses

| Status | Meaning |
|--------|---------|
| **Planifiée** | Scheduled, not yet started |
| **En cours** | Inspector is on-site or actively investigating |
| **Complétée** | Inspection done, results recorded |
| **Annulée** | Cancelled (rescheduled or no longer needed) |

---

## Viewing Reports

Navigate to **Rapport et Stat** in the sidebar to see:

### KPI Cards (top row)
- **Total alertes** — number of alerts in your municipality
- **Infractions confirmées** — alerts confirmed as violations
- **Taux de régularisation** — percentage of resolved cases
- **Inspections complétées** — number of completed inspections

### Charts
- **Détections par mois** — trend line showing detection volume over time
- **Par type** — pie chart breaking down detections by type (construction, extension, annexe, piscine)
- **Par niveau de risque** — bar chart showing the risk distribution

Use these to:
- Report to your municipal council on enforcement activity
- Identify trends (e.g., more pool constructions in summer)
- Justify budget for additional inspectors
- Measure the ROI of the platform

---

## Managing Map Layers

Navigate to **Calque** in the sidebar to toggle Quebec government map layers:

| Layer | What it shows | When to use it |
|-------|---------------|----------------|
| **Cadastre (lots)** | Property boundaries | Verify which lot a detection falls on |
| **Limites municipales** | Municipal borders | Confirm the detection is in your jurisdiction |
| **Orthophotos** | Aerial photographs | High-resolution ground view |
| **Adresses Québec** | Civic addresses | Find the street address of a detection |
| **Hydrographie** | Rivers, lakes, wetlands | Check if construction is near protected waterways |
| **Courbes de niveau** | Elevation contours | Assess terrain risks (slopes, flood zones) |
| **Écoforestière** | Forest cover | Check if construction encroaches on forested areas |

Each layer has an **opacity slider** — adjust it to see multiple layers simultaneously without visual clutter.

---

## Managing Users

As a **manager**, you can manage users in your municipality.

### Roles explained

| Role | Can do | Can't do |
|------|--------|----------|
| **Manager** | Everything: manage users, update alerts, schedule inspections, view reports, change settings | — |
| **Inspector** | View alerts, update alert status, manage their inspections, view reports | Manage users, change settings |
| **Analyst** | View alerts, update risk assessments, view reports | Manage users, schedule inspections |
| **Read-only** | View everything (map, alerts, reports) | Modify anything |

### Adding a user
Contact your technical admin with:
- Full name
- Email address
- Desired role

They will create the account and provide login credentials.

### Deactivating a user
Contact your technical admin with the user's email. They will deactivate the account (the user can no longer log in, but their history is preserved).

---

## Understanding the Detection Pipeline

### How satellite detection works

```
Satellite (Sentinel-2)           AI Analysis              You
     │                               │                     │
     ▼                               ▼                     ▼
Takes photos of             Compares today's        Review the alert,
your municipality           image with the           schedule inspection,
every 5 days                previous image           enforce if needed
     │                               │                     │
     └──── Free, automatic ──────────┘                     │
                                     │                     │
                              Creates alert ──────────► Email + dashboard
```

### What gets detected

The AI looks for:
- **New buildings** appearing where there were none before
- **Extensions** to existing structures (additions, extra floors)
- **Annexes** (garages, sheds, outbuildings)
- **Swimming pools** (above-ground and in-ground)

### What does NOT get detected

- Interior renovations (not visible from satellite)
- Changes under tree cover (satellite can't see through trees)
- Very small changes (< ~15 m² due to image resolution)
- Changes during heavy cloud cover (the system waits for clear skies)

### AI confidence score

Each detection includes a confidence score (0–100%):

| Score | Meaning | Recommended action |
|-------|---------|-------------------|
| 80–100% | High confidence | Very likely a real change — prioritize review |
| 50–79% | Medium confidence | Probable change — review when possible |
| Below 50% | Low confidence | Possible false positive — check when convenient |

---

## Common Questions

### How often does the system scan?
By default, daily at 6 AM EST. Your technical admin can change this to weekly, bi-weekly, or monthly.

### Can the AI make mistakes?
Yes. The AI may produce:
- **False positives**: flags something that isn't actually a new construction (e.g., a new car, temporary structure, shadow change)
- **False negatives**: misses a real construction (e.g., too small, hidden by trees, cloudy imagery)

Always verify AI detections with human review before taking enforcement action.

### Why does a scan show 0 detections?
Possible reasons:
- First scan ever (establishing baseline — this is normal)
- No changes in the municipality since the last scan
- Cloud cover prevented clear imagery
- Changes were too small to detect

### Can I request a scan right now?
Yes — ask your technical admin to trigger a manual scan, or use the scan trigger button if available in your dashboard.

### Is the satellite data real-time?
No. Sentinel-2 revisits every 5 days. The system checks daily for new available imagery, but the actual photos may be 1–5 days old depending on satellite orbit and cloud conditions.

### Are my municipality's alerts visible to other municipalities?
**No.** Each municipality can only see its own alerts, users, and data. The system enforces strict data isolation.

---

## When to Contact the Technical Admin

Contact the technical admin when you need to:

| Need | Who to contact |
|------|---------------|
| Add/remove a user | Technical admin |
| Reset a password | Technical admin |
| Change scan frequency | Technical admin |
| Add a new municipality | Technical admin |
| Report a bug or error | Technical admin |
| System is down | Technical admin |
| Questions about this guide | Technical admin |
| Understanding an alert | Use this guide or your own expertise |
| Changing an alert's status | Do it yourself in the dashboard |
| Scheduling an inspection | Do it yourself in the dashboard |
