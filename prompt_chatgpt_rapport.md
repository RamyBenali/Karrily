# Prompt et Contexte Complet pour Génération du Rapport de Projet "Karrily"

Ce document contient l'intégralité du contexte, de l'architecture, des fonctionnalités et des technologies du projet Karrily. Vous pouvez copier-coller l'ensemble de ce texte à ChatGPT avec la consigne initiale en haut.

---
---

**À l'attention de ChatGPT :**
Je suis en train de rédiger mon rapport de projet de fin d'études / rapport académique en LaTeX concernant une plateforme nommée "Karrily".
Voici ci-dessous TOUTES les informations relatives au projet, détaillées à 100%. 
Je souhaite que tu analyses ces informations pour bien comprendre le projet, puis que tu m'aides à structurer et rédiger les différentes parties de mon rapport académique en LaTeX. 
Tu vas devoir adopter un ton formel, académique, précis et technique. 

Voici le contexte complet du projet :

## 1. Introduction et Problématique
**Le Marché et le Contexte :**
En Algérie (et plus largement dans le monde arabe et en Afrique), le marché de la consommation est très axé sur l'achat de produits neufs. Cependant, avec l'inflation et la baisse du pouvoir d'achat, de nombreux particuliers et professionnels n'ont pas les moyens ou l'envie d'acheter du matériel coûteux (outillage, électronique, matériel événementiel, véhicules, etc.) pour un usage ponctuel.
De plus, de nombreux objets dorment dans les placards sans être utilisés. Il existe un énorme potentiel pour l'économie circulaire.

**Les Problèmes existants :**
- Absence de plateforme centralisée et de confiance pour la **location** entre particuliers (C2C) et professionnels (B2C).
- Manque de systèmes d'**échange (troc)** sécurisés et modernes.
- Le marché de l'occasion est dominé par des sites d'annonces classiques (comme Ouedkniss), mais qui ne gèrent ni la location sécurisée avec caution, ni le troc, ni la gestion des réservations et des calendriers.
- Absence d'un design moderne, d'une expérience utilisateur (UX) fluide et d'une confiance garantie (système d'avis, vérification).

## 2. La Solution : Karrily
**Karrily** est une plateforme innovante et complète (Marketplace) permettant aux utilisateurs de :
1. **Louer** : Permettre à n'importe qui de louer ses objets à d'autres, ou à un professionnel de louer son matériel (avec gestion du calendrier, prix par jour/semaine/mois, caution).
2. **Vendre** : Vente classique de produits d'occasion ou neufs.
3. **Échanger (Troc)** : Un système intelligent permettant aux utilisateurs de proposer un objet en échange d'un autre (avec possibilité de compenser la différence de valeur avec de l'argent).

**Vision :** Devenir LA marketplace de référence pour l'économie circulaire en Algérie (48 wilayas), puis s'étendre au Maghreb et à l'international. L'application est multilingue (Français, Arabe Darja/MSA, Anglais) et utilise le Dinar Algérien (DZD).

## 3. Architecture Technique (Stack)
Le projet repose sur une architecture moderne, robuste et scalable :

**Frontend (Client) :**
- **Framework :** React 18 avec TypeScript (développé via Vite pour la rapidité).
- **Routage :** React Router 7.
- **Styling :** Tailwind CSS v4 combiné à `shadcn/ui` (basé sur Radix Primitives) pour des composants accessibles et modernes.
- **Animations :** Framer Motion (animations fluides, transitions de pages).
- **Gestion d'État :** Zustand (pour le state global, ex: panier, session) et React Query (pour le fetching de données, le cache et la synchronisation).
- **Validation :** Zod (pour la validation des formulaires côté client).
- **PWA / Mobile :** Préparation pour le mobile (Capacitor/React Native envisagé).

**Backend (Serveur API) :**
- **Framework :** Node.js avec Express.js et TypeScript.
- **Architecture :** Modèle MVC (Routes, Controllers, Services, Middleware).
- **Sécurité :** Middleware d'authentification, validation des requêtes avec Zod, gestion centralisée des erreurs (`ApiError`).

**Base de données & Services Tiers (Supabase) :**
- **SGBD :** PostgreSQL hébergé sur Supabase.
- **Authentification :** Supabase Auth (Email/Mot de passe, JWT).
- **Stockage :** Supabase Storage pour les images des annonces, avatars.
- **Realtime :** Supabase Realtime pour la messagerie instantanée (chat) et les notifications.
- **Sécurité BDD :** RLS (Row Level Security) activé sur toutes les tables pour garantir que chaque utilisateur n'accède qu'à ses propres données sensibles.

## 4. Modèle de Données (Base de données)
La base de données est structurée autour des entités suivantes (avec UUIDs) :
- `profiles` : Informations des utilisateurs (lié à `auth.users` de Supabase).
- `items` : Les annonces postées (contient le type d'annonce : `rent`, `sale`, `troc`, les prix, la description, l'état, la localisation).
- `categories` : Catégories hiérarchisées des objets (Immobilier, Électronique, Véhicules, etc.).
- `bookings` : Les réservations pour les locations (dates de début et de fin, statut, montant total).
- `troc_proposals` : Propositions d'échange entre utilisateurs.
- `reviews` : Système d'évaluation et de commentaires (sur les objets et les utilisateurs).
- `conversations` & `messages` : Pour la messagerie intégrée entre utilisateurs.
- `favorites` : Liste de souhaits des utilisateurs.
- `notifications` : Alertes pour les messages, statuts de réservation, etc.

## 5. Fonctionnalités Détaillées
- **Gestion des Utilisateurs :** Inscription, connexion, profils avec système de rôles (`user`, `lender`, `admin`).
- **Création d'Annonces :** Formulaire multi-étapes pour déposer un objet. Upload d'images (drag & drop), définition du mode (Vente, Location, Troc).
- **Recherche et Filtres :** Moteur de recherche avancé (par catégorie, prix, wilaya, type de transaction).
- **Système de Location :** Sélection de dates via un calendrier (date picker), calcul automatique du prix total (selon la durée), affichage de la caution.
- **Système de Troc :** Un utilisateur peut ouvrir une "modal de proposition de troc" sur une annonce, choisir un de ses propres objets à proposer en échange, et ajouter un message.
- **Messagerie Intégrée :** Chat en temps réel pour négocier ou organiser la remise de l'objet.
- **Tableaux de bord (Dashboards) :**
  - *User Dashboard* : Gérer ses locations en cours, ses favoris, ses messages.
  - *Lender Dashboard* : Suivi des annonces actives, revenus générés, demandes de réservation en attente.
  - *Admin Panel* : Modération des annonces et des utilisateurs, statistiques de la plateforme.
- **Thème Sombre / Clair :** Bascule intégrée (Theme Toggle) pour un confort visuel optimal.

## 6. Design et UX (Expérience Utilisateur)
L'interface est conçue pour être "Premium" et inspirer confiance :
- **Couleurs :** `#0F2A2E` (Dark Teal, professionnel et sécurisant) et `#FF4F5A` (Coral, dynamique pour les Call-to-Action).
- **Typographie :** Polices modernes sans-serif (Inter, Roboto).
- **Micro-interactions :** Effets de survol (hover), animations de chargement (skeletons au lieu de spinners basiques), transitions douces entre les pages.
- **Composants :** Utilisation de cartes (Cards) épurées, de badges (ex: "Premium", "Nouveau"), et d'effets "Glassmorphism" légers.

## 7. Pratiques d'Ingénierie Logicielle (CI/CD et Qualité)
- **Contrôle de version :** Git avec conventions de commit (`feat:`, `fix:`, `chore:`).
- **Intégration Continue (CI) :** Utilisation de GitHub Actions pour lancer automatiquement les linters (ESLint, Prettier) et la vérification TypeScript à chaque Push ou Pull Request.
- **Architecture du Code :** Code modulaire. Composants React réutilisables, Hooks personnalisés pour séparer la logique de l'UI.
- **Migrations SQL :** Gestion rigoureuse des schémas de base de données via des fichiers de migration numérotés (`001_initial.sql`, `002_add_tables.sql`, etc.).

---

### Instructions pour ChatGPT (après avoir lu le contexte) :

Je veux que tu agisses en tant qu'expert académique et architecte logiciel. 
Sur la base de ces informations, peux-tu me proposer un **plan détaillé** (Chapitres, Sections, Sous-sections) pour mon rapport de projet académique (qui sera rédigé en LaTeX) ? 
Le plan doit inclure les parties classiques : Introduction générale, État de l'art / Analyse de l'existant, Spécification des besoins, Conception (UML/Architecture), Réalisation (Technologies, interfaces) et Conclusion générale.

Une fois que tu m'auras proposé le plan et que je l'aurai validé, nous rédigerons ensemble le code LaTeX de chaque partie, étape par étape.
J'attends ta proposition de plan structuré.
