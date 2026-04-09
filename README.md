# Karrily 🏠

> **Plateforme de location de tout et n'importe quoi**

## 🏗️ Architecture

Le projet est organisé en **monorepo** avec deux parties distinctes :

```
Karrily/
├── frontend/       # React + Vite + Tailwind CSS v4
├── backend/        # ExpressJS + Supabase
└── package.json    # Scripts monorepo
```

## 🚀 Démarrage rapide

### Prérequis
- Node.js >= 18
- npm >= 9
- Un projet [Supabase](https://supabase.com) configuré

### Installation

```bash
# Installer toutes les dépendances
npm run install:all

# Installer concurrently (root)
npm install
```

### Configuration

1. **Frontend** : Copier `frontend/.env.example` → `frontend/.env` et remplir les valeurs Supabase
2. **Backend** : Copier `backend/.env.example` → `backend/.env` et remplir les valeurs Supabase

### Lancement

```bash
# Lancer frontend + backend en même temps
npm run dev

# Ou séparément :
npm run dev:frontend    # → http://localhost:5173
npm run dev:backend     # → http://localhost:3001
```

## 📦 Stack Technique

### Frontend
- **React 18** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS v4** + **shadcn/ui** (Radix)
- **React Router 7** (routing)
- **Zustand** (state management)
- **React Query** (server state)
- **Axios** (HTTP client)
- **Motion** (animations)
- **Lucide React** (icônes)

### Backend
- **Express.js** + **TypeScript**
- **Supabase** (auth + PostgreSQL + storage)
- **Zod** (validation)
- **Helmet** (sécurité)
- **CORS** + **Morgan** (logging)

## 🗂️ Structure Frontend

```
frontend/src/
├── components/
│   ├── brand/       # Logo Karrily
│   ├── layout/      # Navigation, Footer
│   ├── shared/      # Composants partagés
│   └── ui/          # shadcn/ui (49 composants)
├── hooks/           # Custom React hooks
├── lib/             # Supabase client, API client, utils
├── pages/           # 7 pages principales
├── services/        # Appels API
├── store/           # Zustand stores
├── styles/          # CSS, thème, fonts
└── types/           # Types TypeScript
```

## 🗂️ Structure Backend

```
backend/src/
├── config/          # Config serveur + Supabase
├── controllers/     # Logique des endpoints
├── middleware/       # Auth, validation, erreurs
├── routes/          # Définition des routes API
├── types/           # Types partagés
└── app.ts           # Point d'entrée Express
```

## 🔗 API Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/signup` | Inscription |
| POST | `/api/auth/login` | Connexion |
| GET | `/api/items` | Liste des items |
| GET | `/api/items/featured` | Items en vedette |
| GET | `/api/items/:id` | Détail d'un item |
| POST | `/api/items` | Créer un item |
| GET | `/api/bookings` | Mes réservations |
| POST | `/api/bookings` | Créer une réservation |
| GET | `/api/categories` | Liste des catégories |
| GET | `/api/users/:id` | Profil public |