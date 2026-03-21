# Guide de référence : Administrateur non technique

> Pour la personne qui gère les municipalités, les utilisateurs et supervise la plateforme au quotidien — sans avoir besoin de toucher au code ni à la ligne de commande.

---

## Table des matières

1. [Connexion](#connexion)
2. [Vue d'ensemble du tableau de bord](#vue-densemble-du-tableau-de-bord)
3. [Gestion des alertes](#gestion-des-alertes)
4. [Consultation des résultats de scan](#consultation-des-résultats-de-scan)
5. [Gestion des notifications](#gestion-des-notifications)
6. [Planification des inspections](#planification-des-inspections)
7. [Consultation des rapports](#consultation-des-rapports)
8. [Gestion des calques cartographiques](#gestion-des-calques-cartographiques)
9. [Gestion des utilisateurs](#gestion-des-utilisateurs)
10. [Comprendre le pipeline de détection](#comprendre-le-pipeline-de-détection)
11. [Questions fréquentes](#questions-fréquentes)
12. [Quand contacter l'administrateur technique](#quand-contacter-ladministrateur-technique)

---

## Connexion

1. Aller sur le site web d'Observatoire 360
2. Cliquer sur **ESPACE CLIENT** dans la barre de navigation supérieure (ou accéder directement à `/connexion`)
3. Entrer votre adresse courriel et votre mot de passe
4. Cliquer sur **SE CONNECTER**

Si vous avez oublié votre mot de passe, cliquer sur **Mot de passe oublié?** et suivre les instructions.

**Vos identifiants vous sont fournis par l'administrateur technique.** Si vous n'avez pas de compte, le contacter.

---

## Vue d'ensemble du tableau de bord

Après la connexion, vous verrez le tableau de bord principal composé de :

| Zone | Emplacement | Utilité |
|------|-------------|---------|
| **Barre supérieure** | Haut de l'écran | Nom de la municipalité, filtres, cloche de notifications, profil |
| **Barre latérale** | Côté gauche | Navigation : Carte, Rapport et Stat, Planif., Calque |
| **Carte** | Centre | Carte interactive avec les marqueurs d'alerte et les calques gouvernementaux |
| **Liste des alertes** | Panneau gauche (sur la page Carte) | Liste de toutes les alertes, avec recherche et filtres |
| **Panneau de notifications** | Côté droit | Alertes en temps réel et messages système |

### Navigation

| Élément de menu | Ce qu'il affiche |
|-----------------|-----------------|
| **Carte** | Carte interactive avec toutes les alertes représentées par des points colorés |
| **Rapport et Stat** | Statistiques, graphiques et indicateurs de performance sur les détections |
| **Planif.** | Calendrier de planification des inspections |
| **Calque** | Activation/désactivation des calques cartographiques (cadastre, orthophotos, etc.) |

---

## Gestion des alertes

### Signification des couleurs des alertes

Les alertes apparaissent sous forme de points colorés sur la carte :

| Couleur | Niveau de risque | Signification |
|---------|-----------------|---------------|
| Rouge | Élevé | Forte probabilité de construction sans permis — révision urgente requise |
| Jaune | Moyen | Infraction possible — nécessite une analyse |
| Vert | Faible | Changement mineur détecté — probablement conforme |

### Statuts des alertes (cycle de vie)

Chaque alerte progresse à travers les étapes suivantes :

```
À analyser → À inspecter → En cours → Infraction confirmée → Clôturée
```

| Statut | Qui agit | Quoi faire |
|--------|----------|------------|
| **À analyser** | Analyste/Gestionnaire | Examiner les images satellitaires, évaluer s'il s'agit d'une vraie infraction |
| **À inspecter** | Gestionnaire | Assigner un inspecteur, planifier une visite sur le terrain |
| **En cours** | Inspecteur | L'inspecteur mène activement l'enquête |
| **Infraction confirmée** | Gestionnaire | Émettre l'avis formel, lancer la procédure d'application |
| **Clôturée** | Gestionnaire | Dossier résolu (conforme, démoli, amende, etc.) |

### Consulter une alerte

1. Cliquer sur un point sur la carte, puis cliquer sur **Voir le détail**
2. Ou cliquer sur une alerte dans la liste de gauche
3. Vous verrez :
   - **Images satellitaires avant/après** (comparaison côte à côte)
   - **Données techniques** : coordonnées, superficie détectée, zone, statut du permis
   - **Score de confiance de l'IA** : degré de certitude de l'IA que ce changement est réel
   - **Historique des actions** : historique des changements de statut
   - **Actions** : changer le statut, assigner un inspecteur, planifier une inspection

### Mettre à jour une alerte

1. Ouvrir la page de détail de l'alerte
2. Utiliser le menu déroulant de statut pour modifier le statut
3. Ajouter des notes si nécessaire
4. Cliquer sur Enregistrer

---

## Consultation des résultats de scan

Le système analyse automatiquement le territoire de votre municipalité à l'aide d'images satellitaires. Chaque scan :

1. Télécharge la dernière image satellitaire Sentinel-2
2. La compare à l'image précédente à l'aide de l'IA
3. Crée des alertes pour toute nouvelle construction détectée
4. Vous envoie une notification par courriel

### Consulter l'historique des scans

L'historique des scans est accessible via l'API. Demander à votre administrateur technique un rapport sur l'état des scans si nécessaire.

### Ce qui se passe lors de chaque scan

| Premier scan | Scans suivants |
|--------------|----------------|
| Téléchargement de l'image de référence, 0 détection | Comparaison de la nouvelle image avec la précédente, l'IA identifie les changements |

### Fréquence de scan

La fréquence de scan de votre municipalité est configurée par l'administrateur technique. Options :
- **Daily** — scan tous les jours à 6 h HNE
- **Weekly** — une fois par semaine
- **Bi-weekly** — toutes les deux semaines
- **Monthly** — une fois par mois

---

## Gestion des notifications

### Cloche de notifications

L'icône de cloche dans la barre supérieure affiche un badge rouge indiquant le nombre de notifications non lues. Cliquer dessus pour ouvrir le panneau de notifications.

### Types de notifications

| Type | Déclencheur | Quoi faire |
|------|-------------|------------|
| **Nouvelle alerte** | L'IA a détecté une nouvelle construction | Examiner l'alerte, mettre son statut à jour |
| **Changement de statut** | Le statut d'une alerte a été modifié | Aucune action requise (informatif) |
| **Inspection à venir** | Une inspection planifiée approche | Se préparer pour l'inspection |
| **Système** | Maintenance ou mises à jour de la plateforme | Lire et prendre en compte |

### Actions

- **Cliquer sur une notification** → ouvre l'alerte associée
- **Tout marquer comme lu** → efface tous les badges de non-lecture

### Notifications par courriel

Les gestionnaires reçoivent automatiquement des alertes par courriel lorsque de nouvelles détections sont trouvées. Le courriel contient :
- Nom de la municipalité
- Type d'alerte et niveau de risque
- Adresse estimée
- Score de confiance de l'IA
- Lien direct vers l'alerte dans le tableau de bord

---

## Planification des inspections

1. Naviguer vers **Planif.** dans la barre latérale
2. Consulter le calendrier hebdomadaire avec les inspections planifiées
3. Pour planifier une nouvelle inspection :
   - Aller sur la page de détail d'une alerte
   - Cliquer sur **Planifier une inspection**
   - Sélectionner l'inspecteur, la date et l'heure
   - Ajouter des notes (instructions d'accès, éléments à vérifier, etc.)
4. L'inspecteur verra l'inspection dans son propre tableau de bord

### Statuts des inspections

| Statut | Signification |
|--------|---------------|
| **Planifiée** | Planifiée, pas encore commencée |
| **En cours** | L'inspecteur est sur place ou mène activement l'enquête |
| **Complétée** | Inspection terminée, résultats consignés |
| **Annulée** | Annulée (reprogrammée ou plus nécessaire) |

---

## Consultation des rapports

Naviguer vers **Rapport et Stat** dans la barre latérale pour consulter :

### Indicateurs de performance (rangée du haut)
- **Total alertes** — nombre d'alertes dans votre municipalité
- **Infractions confirmées** — alertes confirmées comme infractions
- **Taux de régularisation** — pourcentage des dossiers résolus
- **Inspections complétées** — nombre d'inspections réalisées

### Graphiques
- **Détections par mois** — courbe de tendance montrant le volume de détections dans le temps
- **Par type** — diagramme circulaire ventilant les détections par type (construction, extension, annexe, piscine)
- **Par niveau de risque** — diagramme à barres montrant la distribution des risques

Utilisez ces données pour :
- Rendre compte des activités d'application à votre conseil municipal
- Identifier des tendances (p. ex., plus de constructions de piscines en été)
- Justifier le budget pour des inspecteurs supplémentaires
- Mesurer le retour sur investissement de la plateforme

---

## Gestion des calques cartographiques

Naviguer vers **Calque** dans la barre latérale pour activer/désactiver les calques cartographiques du gouvernement du Québec :

| Calque | Ce qu'il affiche | Quand l'utiliser |
|--------|-----------------|------------------|
| **Cadastre (lots)** | Limites des propriétés | Vérifier sur quel lot tombe une détection |
| **Limites municipales** | Frontières municipales | Confirmer que la détection est dans votre territoire |
| **Orthophotos** | Photographies aériennes | Vue au sol en haute résolution |
| **Adresses Québec** | Adresses civiques | Trouver l'adresse d'une détection |
| **Hydrographie** | Rivières, lacs, zones humides | Vérifier si la construction est près de cours d'eau protégés |
| **Courbes de niveau** | Courbes de niveau d'altitude | Évaluer les risques liés au terrain (pentes, zones inondables) |
| **Écoforestière** | Couverture forestière | Vérifier si la construction empiète sur des zones boisées |

Chaque calque dispose d'un **curseur d'opacité** — ajustez-le pour superposer plusieurs calques simultanément sans encombrement visuel.

---

## Gestion des utilisateurs

En tant que **gestionnaire**, vous pouvez gérer les utilisateurs de votre municipalité.

### Explication des rôles

| Rôle | Peut faire | Ne peut pas faire |
|------|------------|-------------------|
| **Manager** | Tout : gérer les utilisateurs, mettre les alertes à jour, planifier les inspections, consulter les rapports, modifier les paramètres | — |
| **Inspector** | Consulter les alertes, mettre le statut des alertes à jour, gérer ses inspections, consulter les rapports | Gérer les utilisateurs, modifier les paramètres |
| **Analyst** | Consulter les alertes, mettre les évaluations de risque à jour, consulter les rapports | Gérer les utilisateurs, planifier les inspections |
| **Read-only** | Tout consulter (carte, alertes, rapports) | Modifier quoi que ce soit |

### Ajouter un utilisateur
Contacter votre administrateur technique avec :
- Nom complet
- Adresse courriel
- Rôle souhaité

Il créera le compte et fournira les identifiants de connexion.

### Désactiver un utilisateur
Contacter votre administrateur technique avec l'adresse courriel de l'utilisateur. Il désactivera le compte (l'utilisateur ne pourra plus se connecter, mais son historique sera conservé).

---

## Comprendre le pipeline de détection

### Comment fonctionne la détection satellitaire

```
Satellite (Sentinel-2)           Analyse par IA            Vous
     │                               │                     │
     ▼                               ▼                     ▼
Photographie                 Compare l'image          Examinez l'alerte,
votre municipalité           d'aujourd'hui avec        planifiez l'inspection,
tous les 5 jours             l'image précédente        appliquez si nécessaire
     │                               │                     │
     └──── Gratuit, automatique ─────┘                     │
                                     │                     │
                              Crée une alerte ───────► Courriel + tableau de bord
```

### Ce qui est détecté

L'IA recherche :
- **Nouveaux bâtiments** apparaissant là où il n'y en avait pas
- **Extensions** à des structures existantes (ajouts, étages supplémentaires)
- **Annexes** (garages, remises, dépendances)
- **Piscines** (hors-sol et creusées)

### Ce qui n'est PAS détecté

- Rénovations intérieures (non visibles depuis le satellite)
- Changements sous couvert d'arbres (le satellite ne peut pas voir à travers les arbres)
- Très petits changements (< ~15 m² en raison de la résolution des images)
- Changements lors d'une couverture nuageuse importante (le système attend un ciel dégagé)

### Score de confiance de l'IA

Chaque détection comprend un score de confiance (0–100 %) :

| Score | Signification | Action recommandée |
|-------|---------------|--------------------|
| 80–100 % | Haute confiance | Très probablement un changement réel — prioriser l'examen |
| 50–79 % | Confiance moyenne | Changement probable — examiner dès que possible |
| Moins de 50 % | Faible confiance | Faux positif possible — vérifier à la convenance |

---

## Questions fréquentes

### Quelle est la fréquence des scans du système ?
Par défaut, quotidiennement à 6 h HNE. Votre administrateur technique peut modifier la fréquence à hebdomadaire, bihebdomadaire ou mensuelle.

### L'IA peut-elle se tromper ?
Oui. L'IA peut produire :
- **Des faux positifs** : signale quelque chose qui n'est pas réellement une nouvelle construction (p. ex., une nouvelle voiture, une structure temporaire, un changement d'ombre)
- **Des faux négatifs** : rate une vraie construction (p. ex., trop petite, cachée par des arbres, images nuageuses)

Toujours vérifier les détections de l'IA par une révision humaine avant de prendre des mesures d'application.

### Pourquoi un scan affiche-t-il 0 détection ?
Raisons possibles :
- Premier scan (établissement de la référence — c'est normal)
- Aucun changement dans la municipalité depuis le dernier scan
- La couverture nuageuse a empêché des images claires
- Les changements étaient trop petits pour être détectés

### Puis-je demander un scan immédiatement ?
Oui — demander à votre administrateur technique de déclencher un scan manuel, ou utiliser le bouton de déclenchement de scan s'il est disponible dans votre tableau de bord.

### Les données satellitaires sont-elles en temps réel ?
Non. Sentinel-2 repasse tous les 5 jours. Le système vérifie quotidiennement la disponibilité de nouvelles images, mais les photos réelles peuvent avoir 1 à 5 jours selon l'orbite du satellite et les conditions nuageuses.

### Les alertes de ma municipalité sont-elles visibles par d'autres municipalités ?
**Non.** Chaque municipalité ne peut voir que ses propres alertes, utilisateurs et données. Le système applique une isolation stricte des données.

---

## Quand contacter l'administrateur technique

Contacter l'administrateur technique lorsque vous devez :

| Besoin | Qui contacter |
|--------|---------------|
| Ajouter/retirer un utilisateur | Administrateur technique |
| Réinitialiser un mot de passe | Administrateur technique |
| Modifier la fréquence de scan | Administrateur technique |
| Ajouter une nouvelle municipalité | Administrateur technique |
| Signaler un bogue ou une erreur | Administrateur technique |
| Le système est hors service | Administrateur technique |
| Questions sur ce guide | Administrateur technique |
| Comprendre une alerte | Utiliser ce guide ou votre propre expertise |
| Changer le statut d'une alerte | Le faire vous-même dans le tableau de bord |
| Planifier une inspection | Le faire vous-même dans le tableau de bord |
