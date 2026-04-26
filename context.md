# Karrily — Contexte Projet

> Ce fichier sert de **référence centrale** pour l'IA et les développeurs.
> Toute modification majeure du projet doit être reflétée ici.

---

##  Vision

**Karrily** est une plateforme innovante de **location, vente et échange (troc)** de biens entre particuliers et professionnels, lancée en **Algérie** avec une ambition **universelle**.

L'objectif est de devenir **LA** marketplace de référence pour :
-  **Louer** n'importe quoi (immobilier, véhicules, électronique, outillage, événementiel…)
-  **Vendre** des objets neufs ou d'occasion
-  **Échanger** (système de troc intelligent)

---

##  Marché Cible

- **Lancement** : Algérie (48 wilayas)
- **Expansion** : Maghreb → Monde arabe → International
- **Langues** : Français, Arabe (Darja + MSA), Anglais
- **Monnaie** : DZD (Dinar Algérien) — avec support multi-devises futur
- **Paiements** : CCP/Baridimob, Cash à la livraison, Edahabia, futurs paiements en ligne

---

##  Stack Technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v4 + shadcn/ui (Radix) |
| Animations | Motion (Framer Motion) |
| State | Zustand + React Query |
| Routing | React Router 7 |
| Backend | Express.js + TypeScript |
| Base de données | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| Validation | Zod |
| HTTP Client | Axios |

---

##  Architecture du Projet

```
Karrily/
├── frontend/              # Client React
│   ├── src/
│   │   ├── components/    # UI (49 shadcn) + layout + brand
│   │   ├── pages/         # Pages de l'app
│   │   ├── lib/           # Supabase, API client, utils
│   │   ├── services/      # Couche d'appels API
│   │   ├── store/         # Zustand stores
│   │   ├── hooks/         # Custom hooks
│   │   ├── types/         # Types TS
│   │   └── styles/        # Theme, Tailwind, fonts
│   └── package.json
│
├── backend/               # API Express
│   ├── src/
│   │   ├── config/        # Config + clients Supabase
│   │   ├── controllers/   # 5 controllers
│   │   ├── middleware/     # Auth, validation, errors
│   │   ├── routes/        # Routes RESTful
│   │   └── types/         # Types partagés
│   └── package.json
│
├── supabase/
│   └── migrations/        # Fichiers SQL numérotés
│
└── package.json           # Monorepo root
```

---

##  Base de Données (Supabase)

### Tables principales
| Table | Description |
|-------|-------------|
| `profiles` | Profils utilisateurs (lié à auth.users) |
| `categories` | Catégories d'objets |
| `items` | Annonces (location, vente, troc) |
| `bookings` | Réservations de location |
| `reviews` | Avis et notes |
| `messages` | Messagerie entre utilisateurs |
| `conversations` | Fils de conversation |
| `favorites` | Favoris utilisateur |
| `notifications` | Notifications |
| `transactions` | Historique des paiements |
| `troc_proposals` | Propositions d'échange |

### Conventions SQL
- Noms de tables en **snake_case**, pluriel
- UUIDs pour les clés primaires
- `created_at` et `updated_at` sur chaque table
- Row Level Security (RLS) **activé** sur toutes les tables
- Migrations numérotées : `001_initial_schema.sql`, `002_add_messages.sql`, etc.

###  Note importante
L'utilisateur exécute les migrations SQL **manuellement** dans le dashboard Supabase (pas de Docker/CLI local).

---

##  Rôles Utilisateur

| Rôle | Accès |
|------|-------|
| `user` | Parcourir, louer, acheter, échanger |
| `lender` | User + Publier des annonces, gérer les revenus |
| `admin` | Tout + Panel admin, modération, stats |

---

##  Design System

- **Source** : Export Figma Make (Karilly Brand Identity)
- **Couleurs primaires** : `#0F2A2E` (dark teal), `#FF4F5A` (coral/CTA)
- **Badges** : `#7C5CFC` (violet) pour "Premium"
- **Typo** : System font stack via Tailwind
- **Border radius** : `0.625rem` base
- **Animations** : Motion/Framer Motion pour les hover, page transitions
- **Mode** : Light par défaut, Dark mode disponible
- **Composants** : shadcn/ui (49 composants Radix-based)

---

##  Pages Existantes

| Page | Route | Status |
|------|-------|--------|
| Landing Page | `/` |  Design prêt |
| Explore | `/explore` |  Design prêt |
| Category | `/category/:name` |  Design prêt |
| Item Detail | `/item/:id` |  Design prêt |
| User Dashboard | `/dashboard` |  Design prêt |
| Lender Dashboard | `/lender` |  Design prêt |
| Admin Panel | `/admin` |  Design prêt |

---

##  Conventions de Code

### Frontend
- Composants en **PascalCase** (fichiers en kebab-case)
- Hooks préfixés `use` (ex: `useAuth`, `useItems`)
- Services dans `services/` pour les appels API
- Stores Zustand dans `store/`
- Types partagés dans `types/`

### Backend
- Architecture **MVC** (Controllers → Services → Supabase)
- Controllers en classes (ex: `ItemsController`)
- Routes groupées par domaine
- Validation Zod en middleware
- Gestion d'erreurs centralisée avec `ApiError`

### Git
- Branches : `main`, `develop`, `feature/*`, `fix/*`
- Commits conventionnels : `feat:`, `fix:`, `chore:`, `docs:`

---

##  Modes de Transaction

### Location
- Prix par jour / semaine / mois
- Caution (dépôt de garantie)
- Assurance optionnelle
- Calendrier de disponibilité

### Vente
- Prix fixe
- Négociation possible
- État du produit (neuf, comme neuf, bon, acceptable)

### Troc (Échange)
- Proposition d'échange d'objet contre objet
- Matching intelligent (IA)
- Valeur estimée pour équilibrer les échanges
- Possibilité d'ajouter un complément monétaire

---

##  Suivi des Migrations

Voir `supabase/migrations/README.md` pour l'historique complet.

Chaque migration est un fichier SQL numéroté que l'utilisateur exécute manuellement dans Supabase SQL Editor.
