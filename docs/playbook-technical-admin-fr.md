# Guide de référence : Administrateur technique

> Pour la personne responsable du déploiement, de la maintenance et de la mise à l'échelle de l'infrastructure Observatoire 360.

---

## Table des matières

1. [Vue d'ensemble de l'architecture](#vue-densemble-de-larchitecture)
2. [Déploiement initial](#déploiement-initial)
3. [Environnement et secrets](#environnement-et-secrets)
4. [Gestion de la base de données](#gestion-de-la-base-de-données)
5. [Ajout d'une nouvelle municipalité](#ajout-dune-nouvelle-municipalité)
6. [Suppression d'une municipalité](#suppression-dune-municipalité)
7. [Gestion des utilisateurs via CLI](#gestion-des-utilisateurs-via-cli)
8. [Surveillance du pipeline de détection](#surveillance-du-pipeline-de-détection)
9. [Résolution de problèmes](#résolution-de-problèmes)
10. [Mise à jour et redéploiement](#mise-à-jour-et-redéploiement)
11. [Sauvegarde et récupération](#sauvegarde-et-récupération)
12. [Gestion des coûts](#gestion-des-coûts)
13. [Liste de vérification de sécurité](#liste-de-vérification-de-sécurité)

---

## Vue d'ensemble de l'architecture

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

**Services utilisés (tous en niveau gratuit) :**

| Service | Utilité | Limite gratuite |
|---------|---------|-----------------|
| Cloudflare Pages | Hébergement du frontend | Sites illimités, 500 builds/mois |
| Cloudflare Workers | API backend | 100 000 requêtes/jour |
| Cloudflare D1 | Base de données (SQLite) | 5 M lectures, 100 000 écritures/jour |
| Cloudflare R2 | Stockage d'images | 10 Go, 10 M lectures/mois |
| Cloudflare Queues | Traitement des tâches | 1 M d'opérations/mois |
| Cloudflare Workers AI | Détection de changements | Inclus avec Workers |
| Copernicus Data Space | Images satellitaires | Illimité (gratuit) |
| Resend | Alertes par courriel | 3 000 courriels/mois |

---

## Déploiement initial

### Prérequis

- Node.js 20+
- pnpm 9+ (`corepack enable && corepack prepare pnpm@9 --activate`)
- Compte Cloudflare (gratuit)
- Compte GitHub

### Étapes détaillées

```bash
# 1. Cloner le dépôt
git clone https://github.com/YOUR_ORG/observatoire360-v2.git
cd observatoire360-v2

# 2. Installer les dépendances
pnpm install

# 3. S'authentifier auprès de Cloudflare
cd apps/api
npx wrangler login

# 4. Créer les ressources Cloudflare
npx wrangler d1 create observatoire360-db
# ⚠️ Copier le database_id affiché dans la sortie

npx wrangler r2 bucket create observatoire360-images
npx wrangler queues create observatoire360-detection
npx wrangler queues create observatoire360-detection-dlq
npx wrangler pages project create observatoire360

# 5. Mettre à jour wrangler.toml avec le vrai database_id
# Modifier apps/api/wrangler.toml → remplacer le database_id aux deux endroits

# 6. Configurer les secrets
npx wrangler secret put JWT_SECRET
# Entrer une chaîne aléatoire robuste (générer avec : openssl rand -base64 48)

npx wrangler secret put COPERNICUS_CLIENT_ID
# Depuis https://dataspace.copernicus.eu → Dashboard → OAuth Clients

npx wrangler secret put COPERNICUS_CLIENT_SECRET

npx wrangler secret put RESEND_API_KEY
# Depuis https://resend.com → API Keys

# 7. Appliquer les migrations de la base de données
npx wrangler d1 migrations apply observatoire360-db --remote

# 8. Insérer les données initiales (optionnel — ou ajouter les municipalités manuellement)
npx wrangler d1 execute observatoire360-db --remote --file=src/db/seed.sql

# 9. Déployer
npx wrangler deploy
cd ../web
VITE_API_URL=https://observatoire360-api.YOUR_SUBDOMAIN.workers.dev/api pnpm build
npx wrangler pages deploy dist --project-name=observatoire360

# 10. Configurer GitHub Actions (pour les déploiements automatiques à chaque push)
# Ajouter ces secrets dans le dépôt GitHub :
#   CLOUDFLARE_API_TOKEN — jeton API avec permissions Workers + Pages + D1
#   CLOUDFLARE_ACCOUNT_ID — identifiant de votre compte Cloudflare
# Ajouter cette variable dans le dépôt GitHub :
#   VITE_API_URL — https://observatoire360-api.YOUR_SUBDOMAIN.workers.dev/api
```

---

## Environnement et secrets

### Secrets (chiffrés sur Cloudflare, jamais dans le code)

| Secret | Comment le configurer | Comment le faire tourner |
|--------|-----------------------|--------------------------|
| `JWT_SECRET` | `wrangler secret put JWT_SECRET` | Définir une nouvelle valeur — toutes les sessions actives seront invalidées |
| `COPERNICUS_CLIENT_ID` | `wrangler secret put COPERNICUS_CLIENT_ID` | Créer un nouveau client OAuth sur Copernicus, mettre le secret à jour |
| `COPERNICUS_CLIENT_SECRET` | `wrangler secret put COPERNICUS_CLIENT_SECRET` | Même procédure que ci-dessus |
| `RESEND_API_KEY` | `wrangler secret put RESEND_API_KEY` | Créer une nouvelle clé sur Resend, révoquer l'ancienne |

### Variables d'environnement (dans wrangler.toml)

| Variable | Utilité | Exemple |
|----------|---------|---------|
| `ENVIRONMENT` | Mode d'exécution | `production` |
| `ALLOWED_ORIGIN` | Liste blanche CORS | `https://observatoire360.pages.dev` |

### Secrets GitHub Actions

| Secret | Utilité |
|--------|---------|
| `CLOUDFLARE_API_TOKEN` | Déploie Workers + Pages + exécute les migrations D1 |
| `CLOUDFLARE_ACCOUNT_ID` | Identifiant du compte Cloudflare |

### Variables GitHub Actions

| Variable | Utilité |
|----------|---------|
| `VITE_API_URL` | URL de base de l'API injectée au moment du build (doit se terminer par `/api`) |

---

## Gestion de la base de données

### Se connecter à la base de données

```bash
cd apps/api

# Interroger la production
npx wrangler d1 execute observatoire360-db --remote --command="SELECT * FROM municipalities"

# Interroger l'environnement local de développement
npx wrangler d1 execute observatoire360-db --local --command="SELECT * FROM municipalities"

# Exécuter un fichier SQL
npx wrangler d1 execute observatoire360-db --remote --file=path/to/file.sql
```

### Appliquer les migrations

```bash
# Production
npx wrangler d1 migrations apply observatoire360-db --remote

# Développement local
npx wrangler d1 migrations apply observatoire360-db --local
```

### Schéma de la base de données

| Table | Utilité |
|-------|---------|
| `municipalities` | Profils des municipalités + configuration des scans |
| `users` | Comptes utilisateurs (courriel, mot de passe haché, rôle, municipalité) |
| `alerts` | Constructions détectées (coordonnées, risque, statut, images) |
| `inspections` | Inspections planifiées/complétées liées aux alertes |
| `notifications` | Notifications dans l'application |
| `scan_jobs` | Historique des scans satellitaires et suivi des statuts |
| `refresh_tokens` | Hachages des refresh tokens JWT |
| `contact_submissions` | Soumissions du formulaire de contact du site marketing |

---

## Ajout d'une nouvelle municipalité

### 1. Trouver la boîte englobante

Aller sur https://boundingbox.klokantech.com/, chercher la municipalité, sélectionner le format « CSV ». Vous obtiendrez : `west,south,east,north`.

### 2. Insérer dans la base de données

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

**Remplacer :**
- `NOM_MUNICIPALITE` — nom complet (p. ex., `Gatineau`)
- `CODE` — code à 3 lettres (p. ex., `GAT`)
- `REGION` — région administrative (p. ex., `Outaouais`)
- `LAT_N`, `LAT_S`, `LNG_E`, `LNG_W` — coordonnées de la boîte englobante

### 3. Créer le ou les utilisateurs administrateurs

Générer un hachage de mot de passe :
```bash
node -e "const c=require('crypto'),s=c.randomBytes(16);c.pbkdf2('THEIR_PASSWORD',s,100000,32,'sha256',(e,h)=>console.log('pbkdf2:100000:'+s.toString('base64')+':'+h.toString('base64')))"
```

Insérer l'utilisateur :
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

### 4. Déclencher le scan de référence initial

```bash
# Se connecter pour obtenir un jeton
TOKEN=$(node -e 'fetch("https://YOUR_API_URL/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:"user@email.com",password:"THEIR_PASSWORD"})}).then(r=>r.json()).then(j=>process.stdout.write(j.accessToken))')

# Déclencher le scan
curl -X POST "https://YOUR_API_URL/api/scans/trigger" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

Le premier scan enregistre une image de référence (0 détection). Les scans suivants la compareront avec cette référence.

---

## Suppression d'une municipalité

⚠️ **Cette opération supprime définitivement toutes les données de la municipalité.**

Enregistrer ceci dans `delete_municipality.sql` :
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

Exécuter le fichier :
```bash
npx wrangler d1 execute observatoire360-db --remote --file=delete_municipality.sql
```

Nettoyer également les images R2 :
```bash
# Lister les images de la municipalité selon son code
npx wrangler r2 object list observatoire360-images --prefix="sentinel/" | grep CODE
# Supprimer individuellement ou laisser en place (elles resteront inutilisées)
```

---

## Gestion des utilisateurs via CLI

### Lister les utilisateurs d'une municipalité
```bash
npx wrangler d1 execute observatoire360-db --remote \
  --command="SELECT id, email, name, role, is_active FROM users WHERE municipality_id = 'MUNICIPALITY_ID'"
```

### Désactiver un utilisateur (suppression logique)
```bash
npx wrangler d1 execute observatoire360-db --remote \
  --command="UPDATE users SET is_active = 0 WHERE email = 'user@email.com'"
```

### Réinitialiser le mot de passe d'un utilisateur
```bash
# Générer un nouveau hachage
node -e "const c=require('crypto'),s=c.randomBytes(16);c.pbkdf2('NewPassword1!',s,100000,32,'sha256',(e,h)=>console.log('pbkdf2:100000:'+s.toString('base64')+':'+h.toString('base64')))"

# Mettre à jour
npx wrangler d1 execute observatoire360-db --remote \
  --command="UPDATE users SET password_hash = 'HASH_FROM_ABOVE' WHERE email = 'user@email.com'"
```

### Changer le rôle d'un utilisateur
Rôles valides : `manager`, `inspector`, `analyst`, `readonly`

```bash
npx wrangler d1 execute observatoire360-db --remote \
  --command="UPDATE users SET role = 'inspector' WHERE email = 'user@email.com'"
```

---

## Surveillance du pipeline de détection

### Vérifier les tâches de scan récentes
```bash
npx wrangler d1 execute observatoire360-db --remote \
  --command="SELECT s.id, m.name, s.status, s.detections_count, s.error, s.created_at FROM scan_jobs s JOIN municipalities m ON s.municipality_id = m.id ORDER BY s.created_at DESC LIMIT 10"
```

### Vérifier que le Cron Trigger est actif
```bash
npx wrangler tail observatoire360-api --format=pretty
# Attendre le prochain déclenchement du Cron Trigger ou le déclencher manuellement pour voir les journaux
```

### Vérifier le contenu du bucket R2
```bash
npx wrangler r2 object list observatoire360-images --prefix="sentinel/"
```

### Vérifier le statut de la Queue
Aller dans Cloudflare Dashboard → Workers & Pages → Queues → `observatoire360-detection`

### Modifier la fréquence de scan d'une municipalité
```bash
npx wrangler d1 execute observatoire360-db --remote \
  --command="UPDATE municipalities SET scan_frequency = 'weekly' WHERE code = 'GAT'"
```

Fréquences valides : `daily`, `weekly`, `biweekly`, `monthly`

### Désactiver le scan pour une municipalité
```bash
npx wrangler d1 execute observatoire360-db --remote \
  --command="UPDATE municipalities SET scan_enabled = 0 WHERE code = 'GAT'"
```

---

## Résolution de problèmes

### « PBKDF2 failed: iteration counts above 100000 are not supported »
Cloudflare Workers limite PBKDF2 à 100 000 itérations. Si d'anciens hachages de mots de passe utilisaient 600 000 itérations, les régénérer :
```bash
# Générer un nouveau hachage avec 100 000 itérations
node -e "const c=require('crypto'),s=c.randomBytes(16);c.pbkdf2('Password',s,100000,32,'sha256',(e,h)=>console.log('pbkdf2:100000:'+s.toString('base64')+':'+h.toString('base64')))"

# Mettre à jour tous les utilisateurs
npx wrangler d1 execute observatoire360-db --remote \
  --command="UPDATE users SET password_hash = 'NEW_HASH'"
```

### Tâche de scan bloquée en statut « pending »
Le consommateur de Queue n'est peut-être pas configuré. Vérifier `apps/api/src/index.ts` — s'assurer que `handleQueue` est importé et exporté :
```typescript
import { handleQueue } from "./queue.js";
export default {
    fetch: app.fetch,
    async queue(batch, env, ctx) { ctx.waitUntil(handleQueue(batch, env)); },
    ...
};
```
Redéployer : `npx wrangler deploy`

### Tâche de scan en échec
```bash
npx wrangler d1 execute observatoire360-db --remote \
  --command="SELECT id, error FROM scan_jobs WHERE status = 'failed' ORDER BY created_at DESC LIMIT 5"
```

Erreurs fréquentes :
- `Copernicus CDSE token request failed` → Vérifier les secrets COPERNICUS_CLIENT_ID/SECRET
- `No data available` → Normal, aucune image sans nuages disponible au cours des 30 derniers jours
- `AI detection: before image not found in R2` → L'image R2 a été supprimée, déclencher un nouveau scan de référence

### Courriels non envoyés
1. Vérifier que le domaine est configuré dans Resend (https://resend.com/domains)
2. Vérifier que RESEND_API_KEY est défini : `npx wrangler secret list`
3. Vérifier que le domaine de l'adresse `from` correspond à un domaine vérifié dans Resend

### Erreurs CORS dans le navigateur
Vérifier que `ALLOWED_ORIGIN` dans `wrangler.toml` correspond exactement à votre URL Pages (avec `https://`, sans barre oblique finale).

### La connexion retourne une erreur 500
Consulter les journaux du Worker : `npx wrangler tail observatoire360-api --format=pretty`, puis tenter une connexion.

---

## Mise à jour et redéploiement

### Automatique (recommandé)
Pousser sur la branche `main`. GitHub Actions va :
1. Compiler le package partagé
2. Appliquer les migrations D1
3. Déployer l'API Workers
4. Compiler et déployer le frontend

### Manuel
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

### Retour arrière
```bash
# Lister les déploiements récents
npx wrangler deployments list

# Revenir à une version précédente
npx wrangler rollback
```

⚠️ Les migrations de base de données ne peuvent pas être annulées automatiquement. Si une migration cause un problème, rédiger manuellement une migration inverse.

---

## Sauvegarde et récupération

### Sauvegarde de la base de données
```bash
# Exporter toutes les données
npx wrangler d1 export observatoire360-db --remote --output=backup-$(date +%Y%m%d).sql
```

### Restauration de la base de données
```bash
npx wrangler d1 execute observatoire360-db --remote --file=backup-20260321.sql
```

### Sauvegarde des images R2
R2 ne dispose pas d'outil d'exportation intégré. Pour les images critiques, synchroniser vers un dossier local :
```bash
# Lister tous les objets
npx wrangler r2 object list observatoire360-images
# Télécharger des images spécifiques
npx wrangler r2 object get observatoire360-images sentinel/2026-03-21/GAT.png
```

---

## Gestion des coûts

Tout fonctionne dans les limites des niveaux gratuits. Pour ne jamais les dépasser :

| Ressource | Limite gratuite | Comment rester en dessous |
|-----------|----------------|---------------------------|
| Requêtes Workers | 100 000/jour | Ne pas ouvrir le tableau de bord dans 100 000 onglets de navigateur |
| Lectures D1 | 5 M/jour | Chaque chargement de page représente ~5 requêtes = 1 M d'utilisateurs quotidiens avant d'atteindre la limite |
| Écritures D1 | 100 000/jour | Chaque scan crée ~10 écritures = 10 000 scans/jour avant d'atteindre la limite |
| Stockage R2 | 10 Go | Chaque image fait ~200 Ko = ~50 000 images avant d'atteindre la limite |
| Lectures R2 | 10 M/mois | Vues des images dans le tableau de bord |
| Opérations Queue | 1 M/mois | Chaque scan représente 1 opération |
| Courriels Resend | 3 000/mois | Envoyés uniquement lors de nouvelles détections |

**Si vous dépassez les niveaux gratuits :** le forfait payant de Cloudflare est à 5 $/mois pour 10 M de requêtes Workers, D1 illimité, etc.

---

## Liste de vérification de sécurité

- [ ] JWT_SECRET est une chaîne aléatoire d'au moins 48 caractères
- [ ] Tous les secrets sont définis via `wrangler secret put`, jamais dans le code ni dans wrangler.toml
- [ ] `.dev.vars` est dans `.gitignore` (c'est le cas par défaut)
- [ ] ALLOWED_ORIGIN est défini sur votre domaine Pages exact
- [ ] Le domaine Resend dispose des enregistrements SPF, DKIM et DMARC configurés
- [ ] Le client OAuth Copernicus est limité à votre application uniquement
- [ ] Les secrets GitHub Actions sont définis (non codés en dur dans le workflow)
- [ ] Aucun vrai mot de passe ne figure dans le fichier seed.sql commis dans git
- [ ] La limitation de débit est active sur les points de terminaison d'authentification (20 req/15 min)
- [ ] La limitation de débit est active sur le formulaire de contact (10 req/10 min)
- [ ] Toutes les routes API, sauf health/contact/auth, exigent une authentification JWT
- [ ] Toutes les requêtes de base de données sont limitées à la municipalité de l'utilisateur
