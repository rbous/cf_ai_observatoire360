# Playbook: Municipality User Guide

> For municipal employees (inspectors, analysts, managers) who use Observatoire 360 daily to monitor their territory, review alerts, and manage inspections.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [The Map — Your Main Workspace](#the-map--your-main-workspace)
3. [Working with Alerts](#working-with-alerts)
4. [Understanding What the AI Detects](#understanding-what-the-ai-detects)
5. [Scheduling and Managing Inspections](#scheduling-and-managing-inspections)
6. [Reports and Statistics](#reports-and-statistics)
7. [Notifications](#notifications)
8. [Map Layers](#map-layers)
9. [Typical Workflows](#typical-workflows)
10. [Tips and Best Practices](#tips-and-best-practices)
11. [FAQ](#faq)
12. [Getting Help](#getting-help)

---

## Getting Started

### First-time login

1. You'll receive an email from your administrator with your login credentials
2. Go to the Observatoire 360 website
3. Click **ESPACE CLIENT** in the top right
4. Enter your email and password
5. Click **SE CONNECTER**

**Change your password after first login** (Settings → Change password) for security.

### What you'll see

After login, you land on the **Map Dashboard** — an interactive map of your municipality with colored dots showing detected alerts.

| Element | What it means |
|---------|--------------|
| 🔴 Red dot | High-risk alert — likely unpermitted construction |
| 🟡 Amber dot | Medium-risk — needs further analysis |
| 🟢 Green dot | Low-risk — minor change, likely compliant |
| Left panel | List of all alerts (searchable and filterable) |
| Right panel | Notifications |
| Sidebar | Navigation to other pages |

---

## The Map — Your Main Workspace

### Navigating the map

| Action | How |
|--------|-----|
| Zoom in/out | Scroll wheel, or `+`/`-` buttons |
| Pan | Click and drag |
| View an alert | Click a colored dot → popup appears |
| Open alert detail | Click **Voir le détail** in the popup |
| Search alerts | Use the search bar in the left panel |
| Filter alerts | Use the dropdown filters (risk, status, type) |

### Map layers

Click the layer icon (top-right of map) to toggle government data layers:

- **Cadastre** — property lot boundaries
- **Limites municipales** — your municipality's borders
- **Orthophotos** — aerial photographs
- **Adresses** — civic addresses
- **Hydrographie** — rivers and lakes

These help you cross-reference a detection with official records without leaving the app.

---

## Working with Alerts

### Alert lifecycle

Every alert moves through these stages:

```
À analyser → À inspecter → En cours → Infraction confirmée → Clôturée
```

### What each status means

| Status | Description | Action required |
|--------|-------------|-----------------|
| **À analyser** | AI just detected this — no human has reviewed it yet | Open the alert, look at the before/after images, decide if it's real |
| **À inspecter** | Confirmed as suspicious — needs a site visit | Assign an inspector and schedule a visit |
| **En cours** | An inspector is actively investigating | Wait for the inspector's report |
| **Infraction confirmée** | Site visit confirmed the violation | Issue formal notice, start enforcement |
| **Clôturée** | Case is closed | No action needed |

### Reviewing an alert

1. Click the alert on the map or in the list
2. On the detail page, you'll see:

**Before / After images** — satellite photos taken at different dates. Look for:
- New structures (buildings, sheds, pools)
- Extensions to existing buildings
- Cleared land that may indicate construction

**Technical data:**
- Coordinates (latitude/longitude)
- Detected area (m²)
- Zone (residential, commercial, agricultural, etc.)
- Permit status (has permit or not)
- AI confidence score

**What to do:**
- If the change is real → update status to **À inspecter**
- If it's a false alarm (shadow, parking lot, temporary structure) → update status to **Clôturée** with a note explaining why
- If you're unsure → leave as **À analyser** and discuss with a colleague

### Updating an alert's status

1. Open the alert detail page
2. Select the new status from the dropdown
3. Add notes explaining your decision (this creates an audit trail)
4. Save

---

## Understanding What the AI Detects

### Detection types

| Type | What the AI looks for | Examples |
|------|----------------------|----------|
| **Construction** | Entirely new building | New house, commercial building, barn |
| **Extension** | Addition to existing structure | Added room, extra floor, deck |
| **Annexe** | Separate outbuilding | Garage, shed, workshop, greenhouse |
| **Piscine** | Swimming pool | In-ground pool, above-ground pool |

### Confidence score

Each detection has an AI confidence score:

| Score | What it means | Your approach |
|-------|---------------|---------------|
| **80–100%** | AI is very confident | Prioritize this — likely a real change |
| **50–79%** | Probable detection | Review carefully, compare images closely |
| **Below 50%** | AI is uncertain | May be a false positive — verify before acting |

### Common false positives (things the AI may flag incorrectly)

- Large vehicles (trucks, RVs) appearing or disappearing
- Seasonal changes (snow coverage, leaf growth)
- Shadows shifting between seasons
- Temporary structures (tents, market stalls)
- Agricultural activity (hay bales, soil changes)

**Always verify with the before/after images before taking enforcement action.**

### Things the AI cannot detect

- Interior renovations (invisible from satellite)
- Constructions hidden under heavy tree canopy
- Very small structures (under ~15 m²)
- Changes during persistent cloud cover

---

## Scheduling and Managing Inspections

### Creating an inspection

1. Open the alert you want to inspect
2. Click **Planifier une inspection**
3. Fill in:
   - **Inspector**: who will go on-site
   - **Date**: when the visit is scheduled
   - **Notes**: access instructions, what to look for, property owner info
4. Save

The inspector will see this in their **Planif.** calendar.

### Inspection workflow

1. **Before the visit**: review the alert details, print the before/after comparison if needed
2. **During the visit**: document with photos, measure the construction, speak with the owner
3. **After the visit**: update the inspection status and add notes
4. **Decision**: update the alert status based on findings
   - Construction has a valid permit → **Clôturée**
   - No permit, violation confirmed → **Infraction confirmée**
   - Need more investigation → keep **En cours**

### Calendar view

Navigate to **Planif.** in the sidebar to see:
- All scheduled inspections for the week
- Unscheduled alerts that need inspections
- Completed vs. pending inspections

---

## Reports and Statistics

Navigate to **Rapport et Stat** in the sidebar.

### KPI cards

| KPI | What it tells you |
|-----|-------------------|
| **Total alertes** | How many detections in your municipality |
| **Infractions confirmées** | How many were confirmed violations |
| **Taux de régularisation** | Percentage of alerts that have been resolved |
| **Inspections complétées** | How many site visits have been done |

### Charts

- **Détections par mois** — are detections increasing or decreasing?
- **Par type** — what kind of constructions are most common?
- **Par niveau de risque** — what's the risk distribution?

### Using reports for council presentations

These stats are useful for:
- Reporting enforcement activity to your municipal council
- Justifying the platform's value (ROI)
- Requesting additional inspector resources
- Tracking seasonal patterns (e.g., more construction in spring/summer)

---

## Notifications

### In-app notifications

The bell icon in the top bar shows unread notifications. Types:

| Icon | Type | When it triggers |
|------|------|-----------------|
| 🔔 | **Nouvelle alerte** | AI detected something new in your territory |
| 📋 | **Changement de statut** | A colleague updated an alert's status |
| 📅 | **Inspection à venir** | You have an inspection coming up |
| ⚙️ | **Système** | Platform update or maintenance |

Click a notification to go directly to the related alert.

### Email notifications

**Managers** automatically receive emails when new detections are found. The email includes:
- Alert type and risk level
- Estimated location
- AI confidence score
- Direct link to the alert in the dashboard

You don't need to be logged in to receive emails — they arrive in your inbox automatically.

---

## Map Layers

Navigate to **Calque** in the sidebar for full control over map layers.

### Recommended layer combinations

| Task | Enable these layers |
|------|-------------------|
| Verify property ownership | Cadastre + Adresses |
| Check environmental compliance | Hydrographie + Écoforestière |
| Compare with aerial photos | Orthophotos |
| Confirm jurisdiction | Limites municipales |
| Full investigation | All layers at reduced opacity |

### Adjusting opacity

Each layer has a slider (0–100%). Use lower opacity (30–50%) when overlaying multiple layers so you can still see the base map and alerts beneath.

---

## Typical Workflows

### Workflow 1: Daily alert review (Manager)

1. Log in → check notification count
2. Open each **Nouvelle alerte** notification
3. Review before/after images
4. For each:
   - False positive → **Clôturée** + note
   - Needs inspection → **À inspecter** + assign inspector
   - Needs more info → leave as **À analyser**
5. Check **Planif.** for today's inspections

### Workflow 2: Field inspection (Inspector)

1. Log in → go to **Planif.**
2. Review today's scheduled inspections
3. For each inspection:
   - Open the alert → review images and location
   - Drive to the site
   - Document findings (photos, measurements)
   - Return to dashboard → update inspection notes
   - Update alert status

### Workflow 3: Monthly council report (Manager)

1. Go to **Rapport et Stat**
2. Note the KPIs for the month
3. Review the detection trend chart
4. Prepare a summary:
   - X new detections this month
   - Y confirmed infractions
   - Z inspections completed
   - Estimated recovered revenue from enforcement

### Workflow 4: Investigating a specific address (Analyst)

1. Search for the address in the alert list
2. Enable **Cadastre** + **Adresses** layers
3. Review the alert detail
4. Cross-reference the detected area with the zoning regulations
5. Check if a permit was issued (external systems)
6. Update the alert with your analysis

---

## Tips and Best Practices

### For accurate reviews
- Always compare the before/after images carefully — don't rely solely on the AI's assessment
- Enable the **Orthophotos** layer for a higher-resolution ground view
- Use the **Cadastre** layer to check exact property boundaries
- Note the detection area (m²) — larger detections are more likely to be real

### For efficient workflow
- Sort alerts by risk level (high first) to prioritize
- Use filters to focus on specific types (e.g., only constructions)
- Review alerts in batches rather than one at a time
- Add clear notes on every status change — your colleagues will thank you

### For enforcement
- Always complete a physical inspection before issuing a formal notice
- Keep the before/after satellite images as evidence (they're stored permanently)
- Document the timeline: detection date → inspection date → notice date
- The AI confidence score supports your case but isn't legal proof on its own

---

## FAQ

### Can I see other municipalities' alerts?
No. You can only see data for your own municipality. This is enforced by the system.

### How recent are the satellite images?
Sentinel-2 takes new photos every 5 days. The system checks daily for new imagery, so images are typically 1–5 days old.

### What if the AI detects something on my neighbor's property but outside my jurisdiction?
Close the alert as **Clôturée** with a note: "Outside jurisdiction." If the neighboring municipality also uses Observatoire 360, they'll receive their own alert.

### Can I undo a status change?
You can change the status back to a previous stage if needed. The action timeline records all changes.

### The map seems slow. What can I do?
- Disable map layers you don't need (each layer downloads data from the Quebec government servers)
- Zoom in to reduce the area being loaded
- Use a modern browser (Chrome, Firefox, Edge)

### I found a bug or have a suggestion.
Contact your administrator, who will relay it to the technical team.

---

## Getting Help

| Question | Contact |
|----------|---------|
| Can't log in | Your municipality's administrator |
| Forgot password | Click "Mot de passe oublié?" on the login page |
| Don't understand an alert | Review this guide's [Working with Alerts](#working-with-alerts) section |
| Technical issue / bug | Your municipality's administrator |
| Billing or account questions | Observatoire 360 support team |
