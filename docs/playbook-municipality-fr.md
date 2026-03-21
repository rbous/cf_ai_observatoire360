# Guide de référence : Utilisateurs municipaux

> Pour les employés municipaux (inspecteurs, analystes, gestionnaires) qui utilisent Observatoire 360 au quotidien pour surveiller leur territoire, examiner les alertes et gérer les inspections.

---

## Table des matières

1. [Démarrage](#démarrage)
2. [La carte — votre espace de travail principal](#la-carte--votre-espace-de-travail-principal)
3. [Travailler avec les alertes](#travailler-avec-les-alertes)
4. [Comprendre ce que l'IA détecte](#comprendre-ce-que-lia-détecte)
5. [Planification et gestion des inspections](#planification-et-gestion-des-inspections)
6. [Rapports et statistiques](#rapports-et-statistiques)
7. [Notifications](#notifications)
8. [Calques cartographiques](#calques-cartographiques)
9. [Flux de travail types](#flux-de-travail-types)
10. [Conseils et bonnes pratiques](#conseils-et-bonnes-pratiques)
11. [FAQ](#faq)
12. [Obtenir de l'aide](#obtenir-de-laide)

---

## Démarrage

### Première connexion

1. Vous recevrez un courriel de votre administrateur avec vos identifiants de connexion
2. Aller sur le site web d'Observatoire 360
3. Cliquer sur **ESPACE CLIENT** en haut à droite
4. Entrer votre adresse courriel et votre mot de passe
5. Cliquer sur **SE CONNECTER**

**Modifiez votre mot de passe après la première connexion** (Paramètres → Changer le mot de passe) pour des raisons de sécurité.

### Ce que vous verrez

Après la connexion, vous arrivez sur le **tableau de bord cartographique** — une carte interactive de votre municipalité avec des points colorés indiquant les alertes détectées.

| Élément | Ce qu'il signifie |
|---------|------------------|
| Point rouge | Alerte à risque élevé — construction sans permis probable |
| Point jaune | Risque moyen — nécessite une analyse approfondie |
| Point vert | Risque faible — changement mineur, probablement conforme |
| Panneau gauche | Liste de toutes les alertes (avec recherche et filtres) |
| Panneau droit | Notifications |
| Barre latérale | Navigation vers les autres pages |

---

## La carte — votre espace de travail principal

### Naviguer sur la carte

| Action | Comment |
|--------|---------|
| Zoom avant/arrière | Molette de défilement, ou boutons `+`/`-` |
| Déplacer la vue | Cliquer et faire glisser |
| Consulter une alerte | Cliquer sur un point coloré → une fenêtre contextuelle apparaît |
| Ouvrir le détail d'une alerte | Cliquer sur **Voir le détail** dans la fenêtre contextuelle |
| Rechercher des alertes | Utiliser la barre de recherche dans le panneau gauche |
| Filtrer les alertes | Utiliser les filtres déroulants (risque, statut, type) |

### Calques cartographiques

Cliquer sur l'icône de calque (en haut à droite de la carte) pour activer/désactiver les calques de données gouvernementales :

- **Cadastre** — limites des lots de propriété
- **Limites municipales** — les frontières de votre municipalité
- **Orthophotos** — photographies aériennes
- **Adresses** — adresses civiques
- **Hydrographie** — rivières et lacs

Ces calques vous permettent de croiser une détection avec les registres officiels sans quitter l'application.

---

## Travailler avec les alertes

### Cycle de vie d'une alerte

Chaque alerte passe par les étapes suivantes :

```
À analyser → À inspecter → En cours → Infraction confirmée → Clôturée
```

### Signification de chaque statut

| Statut | Description | Action requise |
|--------|-------------|----------------|
| **À analyser** | Vient d'être détecté par l'IA — aucun humain ne l'a encore examiné | Ouvrir l'alerte, regarder les images avant/après, décider si c'est réel |
| **À inspecter** | Confirmé comme suspect — nécessite une visite sur place | Assigner un inspecteur et planifier une visite |
| **En cours** | Un inspecteur mène activement l'enquête | Attendre le rapport de l'inspecteur |
| **Infraction confirmée** | La visite sur place a confirmé l'infraction | Émettre l'avis formel, lancer la procédure d'application |
| **Clôturée** | Dossier fermé | Aucune action requise |

### Examiner une alerte

1. Cliquer sur l'alerte sur la carte ou dans la liste
2. Sur la page de détail, vous verrez :

**Images avant / après** — photos satellitaires prises à différentes dates. Cherchez :
- Nouvelles structures (bâtiments, remises, piscines)
- Extensions à des bâtiments existants
- Terrain défriché pouvant indiquer une construction

**Données techniques :**
- Coordonnées (latitude/longitude)
- Superficie détectée (m²)
- Zone (résidentielle, commerciale, agricole, etc.)
- Statut du permis (permis délivré ou non)
- Score de confiance de l'IA

**Quoi faire :**
- Si le changement est réel → mettre le statut à **À inspecter**
- Si c'est une fausse alarme (ombre, stationnement, structure temporaire) → mettre le statut à **Clôturée** avec une note explicative
- Si vous n'êtes pas certain → laisser en **À analyser** et en discuter avec un collègue

### Mettre à jour le statut d'une alerte

1. Ouvrir la page de détail de l'alerte
2. Sélectionner le nouveau statut dans le menu déroulant
3. Ajouter des notes expliquant votre décision (cela crée un journal d'audit)
4. Enregistrer

---

## Comprendre ce que l'IA détecte

### Types de détection

| Type | Ce que l'IA recherche | Exemples |
|------|-----------------------|----------|
| **Construction** | Nouveau bâtiment entièrement nouveau | Nouvelle maison, bâtiment commercial, grange |
| **Extension** | Ajout à une structure existante | Pièce ajoutée, étage supplémentaire, terrasse |
| **Annexe** | Dépendance séparée | Garage, remise, atelier, serre |
| **Piscine** | Piscine | Piscine creusée, piscine hors-sol |

### Score de confiance

Chaque détection est accompagnée d'un score de confiance de l'IA :

| Score | Ce que cela signifie | Votre approche |
|-------|---------------------|----------------|
| **80–100 %** | L'IA est très confiante | Prioriser — très probablement un changement réel |
| **50–79 %** | Détection probable | Examiner attentivement, comparer les images de près |
| **Moins de 50 %** | L'IA est incertaine | Peut être un faux positif — vérifier avant d'agir |

### Faux positifs fréquents (éléments que l'IA peut signaler à tort)

- Gros véhicules (camions, véhicules récréatifs) apparaissant ou disparaissant
- Changements saisonniers (couverture de neige, feuillaison)
- Déplacements d'ombres entre les saisons
- Structures temporaires (tentes, kiosques de marché)
- Activité agricole (balles de foin, changements de sol)

**Toujours vérifier avec les images avant/après avant de prendre des mesures d'application.**

### Ce que l'IA ne peut pas détecter

- Rénovations intérieures (invisibles depuis le satellite)
- Constructions cachées sous un couvert arboré dense
- Très petites structures (moins de ~15 m²)
- Changements lors d'une couverture nuageuse persistante

---

## Planification et gestion des inspections

### Créer une inspection

1. Ouvrir l'alerte que vous souhaitez inspecter
2. Cliquer sur **Planifier une inspection**
3. Remplir les champs :
   - **Inspecteur** : qui se rendra sur place
   - **Date** : quand la visite est prévue
   - **Notes** : instructions d'accès, éléments à vérifier, informations sur le propriétaire
4. Enregistrer

L'inspecteur verra cette inspection dans son calendrier **Planif.**

### Flux de travail d'une inspection

1. **Avant la visite** : examiner les détails de l'alerte, imprimer la comparaison avant/après si nécessaire
2. **Pendant la visite** : documenter avec des photos, mesurer la construction, parler avec le propriétaire
3. **Après la visite** : mettre à jour le statut de l'inspection et ajouter des notes
4. **Décision** : mettre à jour le statut de l'alerte selon les constatations
   - La construction est munie d'un permis valide → **Clôturée**
   - Aucun permis, infraction confirmée → **Infraction confirmée**
   - Enquête supplémentaire nécessaire → laisser en **En cours**

### Vue du calendrier

Naviguer vers **Planif.** dans la barre latérale pour consulter :
- Toutes les inspections planifiées pour la semaine
- Les alertes non planifiées qui nécessitent des inspections
- Les inspections complétées et en attente

---

## Rapports et statistiques

Naviguer vers **Rapport et Stat** dans la barre latérale.

### Indicateurs de performance

| Indicateur | Ce qu'il vous indique |
|------------|----------------------|
| **Total alertes** | Nombre de détections dans votre municipalité |
| **Infractions confirmées** | Nombre d'alertes confirmées comme infractions |
| **Taux de régularisation** | Pourcentage des alertes qui ont été résolues |
| **Inspections complétées** | Nombre de visites sur place effectuées |

### Graphiques

- **Détections par mois** — les détections augmentent-elles ou diminuent-elles ?
- **Par type** — quel type de construction est le plus fréquent ?
- **Par niveau de risque** — quelle est la distribution des risques ?

### Utiliser les rapports pour les présentations au conseil

Ces statistiques sont utiles pour :
- Rendre compte des activités d'application à votre conseil municipal
- Justifier la valeur de la plateforme (retour sur investissement)
- Demander des ressources supplémentaires en inspecteurs
- Suivre les tendances saisonnières (p. ex., davantage de construction au printemps/été)

---

## Notifications

### Notifications dans l'application

L'icône de cloche dans la barre supérieure affiche les notifications non lues. Types :

| Icône | Type | Quand il se déclenche |
|-------|------|----------------------|
| Cloche | **Nouvelle alerte** | L'IA a détecté quelque chose de nouveau dans votre territoire |
| Presse-papiers | **Changement de statut** | Un collègue a mis à jour le statut d'une alerte |
| Calendrier | **Inspection à venir** | Vous avez une inspection à venir |
| Engrenage | **Système** | Mise à jour ou maintenance de la plateforme |

Cliquer sur une notification pour accéder directement à l'alerte associée.

### Notifications par courriel

Les **gestionnaires** reçoivent automatiquement des courriels lorsque de nouvelles détections sont trouvées. Le courriel contient :
- Type d'alerte et niveau de risque
- Emplacement estimé
- Score de confiance de l'IA
- Lien direct vers l'alerte dans le tableau de bord

Vous n'avez pas besoin d'être connecté pour recevoir les courriels — ils arrivent automatiquement dans votre boîte de réception.

---

## Calques cartographiques

Naviguer vers **Calque** dans la barre latérale pour un contrôle complet des calques cartographiques.

### Combinaisons de calques recommandées

| Tâche | Activer ces calques |
|-------|---------------------|
| Vérifier la propriété d'un lot | Cadastre + Adresses |
| Vérifier la conformité environnementale | Hydrographie + Écoforestière |
| Comparer avec des photos aériennes | Orthophotos |
| Confirmer la juridiction | Limites municipales |
| Enquête complète | Tous les calques à opacité réduite |

### Ajuster l'opacité

Chaque calque dispose d'un curseur (0–100 %). Utiliser une opacité plus faible (30–50 %) lors de la superposition de plusieurs calques afin de conserver la visibilité de la carte de base et des alertes en dessous.

---

## Flux de travail types

### Flux 1 : Examen quotidien des alertes (Gestionnaire)

1. Se connecter → vérifier le nombre de notifications
2. Ouvrir chaque notification **Nouvelle alerte**
3. Examiner les images avant/après
4. Pour chacune :
   - Faux positif → **Clôturée** + note
   - Nécessite une inspection → **À inspecter** + assigner un inspecteur
   - Nécessite plus d'informations → laisser en **À analyser**
5. Consulter **Planif.** pour les inspections du jour

### Flux 2 : Inspection sur le terrain (Inspecteur)

1. Se connecter → aller dans **Planif.**
2. Consulter les inspections planifiées pour aujourd'hui
3. Pour chaque inspection :
   - Ouvrir l'alerte → examiner les images et l'emplacement
   - Se rendre sur les lieux
   - Documenter les constatations (photos, mesures)
   - Revenir au tableau de bord → mettre à jour les notes d'inspection
   - Mettre à jour le statut de l'alerte

### Flux 3 : Rapport mensuel au conseil (Gestionnaire)

1. Aller dans **Rapport et Stat**
2. Noter les indicateurs de performance du mois
3. Examiner le graphique de tendance des détections
4. Préparer un résumé :
   - X nouvelles détections ce mois-ci
   - Y infractions confirmées
   - Z inspections complétées
   - Revenus estimés récupérés grâce aux mesures d'application

### Flux 4 : Enquête sur une adresse spécifique (Analyste)

1. Rechercher l'adresse dans la liste des alertes
2. Activer les calques **Cadastre** + **Adresses**
3. Examiner le détail de l'alerte
4. Croiser la superficie détectée avec la réglementation de zonage
5. Vérifier si un permis a été délivré (systèmes externes)
6. Mettre à jour l'alerte avec votre analyse

---

## Conseils et bonnes pratiques

### Pour des examens précis
- Toujours comparer attentivement les images avant/après — ne pas se fier uniquement à l'évaluation de l'IA
- Activer le calque **Orthophotos** pour une vue au sol en plus haute résolution
- Utiliser le calque **Cadastre** pour vérifier les limites exactes de la propriété
- Noter la superficie de détection (m²) — les détections plus grandes ont plus de chances d'être réelles

### Pour un flux de travail efficace
- Trier les alertes par niveau de risque (les plus élevés en premier) pour prioriser
- Utiliser les filtres pour se concentrer sur des types spécifiques (p. ex., uniquement les constructions)
- Examiner les alertes par lots plutôt qu'une à la fois
- Ajouter des notes claires à chaque changement de statut — vos collègues vous en seront reconnaissants

### Pour l'application des règlements
- Toujours effectuer une inspection physique avant d'émettre un avis formel
- Conserver les images satellitaires avant/après comme preuves (elles sont stockées de façon permanente)
- Documenter le calendrier : date de détection → date d'inspection → date d'avis
- Le score de confiance de l'IA soutient votre dossier, mais ne constitue pas une preuve légale à lui seul

---

## FAQ

### Puis-je voir les alertes des autres municipalités ?
Non. Vous ne pouvez consulter que les données de votre propre municipalité. Cela est imposé par le système.

### Quelle est la récence des images satellitaires ?
Sentinel-2 prend de nouvelles photos tous les 5 jours. Le système vérifie quotidiennement la disponibilité de nouvelles images, de sorte que les images ont généralement 1 à 5 jours.

### Que faire si l'IA détecte quelque chose sur la propriété d'un voisin hors de ma juridiction ?
Fermer l'alerte en **Clôturée** avec une note : « Hors juridiction. » Si la municipalité voisine utilise également Observatoire 360, elle recevra sa propre alerte.

### Puis-je annuler un changement de statut ?
Vous pouvez modifier le statut pour revenir à une étape précédente si nécessaire. L'historique des actions enregistre tous les changements.

### La carte semble lente. Que puis-je faire ?
- Désactiver les calques cartographiques dont vous n'avez pas besoin (chaque calque télécharge des données depuis les serveurs du gouvernement du Québec)
- Zoomer pour réduire la zone chargée
- Utiliser un navigateur moderne (Chrome, Firefox, Edge)

### J'ai trouvé un bogue ou j'ai une suggestion.
Contacter votre administrateur, qui le transmettra à l'équipe technique.

---

## Obtenir de l'aide

| Question | Contact |
|----------|---------|
| Impossible de se connecter | L'administrateur de votre municipalité |
| Mot de passe oublié | Cliquer sur « Mot de passe oublié? » sur la page de connexion |
| Je ne comprends pas une alerte | Consulter la section [Travailler avec les alertes](#travailler-avec-les-alertes) de ce guide |
| Problème technique / bogue | L'administrateur de votre municipalité |
| Questions de facturation ou de compte | L'équipe de soutien d'Observatoire 360 |
