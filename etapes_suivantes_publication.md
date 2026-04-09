# Guide Complet : Étapes de Finalisation et Publication de Karrily

Ce document détaille toutes les étapes nécessaires pour passer de l'état actuel de **Karrily** à une plateforme **100% complète, sécurisée et prête à être lancée au grand public**. Il couvre l'architecture, la sécurité, l'expérience utilisateur, et les prérequis de type "business/légal".

---

## 1. 🔐 Sécurité & Infrastructure (Le plus critique)
Avant toute publication, la sécurité des données et des transactions est primordiale.

### Base de Données (Supabase)
- [ ] **RLS (Row Level Security) Blindé** : Toutes les tables doivent avoir des politiques strictes.
  - *Items* : Tout le monde peut lire (`SELECT`), seul le propriétaire peut `UPDATE` ou `DELETE`.
  - *Bookings / Messages* : Seuls l'emprunteur et le prêteur concernés peuvent y accéder.
- [ ] **Validation des types** : Générer et tenir à jour les types TypeScript avec la CLI Supabase pour éviter les bugs frontend.
- [ ] **Sauvegardes (Backups)** : Activer les backups automatiques point-in-time sur Supabase (plan Pro).

### Backend (Express)
- [ ] **CORS strict** : Restreindre les origines autorisées dans le backend (uniquement le domaine de production en prod).
- [ ] **Rate Limiting (Limitation de requêtes)** : Ajouter `express-rate-limit` pour bloquer les attaques DDoS ou le spam sur les routes sensibles (login, création d'annonces).
- [ ] **Sanitisation des inputs** : Toujours utiliser Zod pour vérifier les données envoyées afin d'éviter les attaques XSS et les injections.
- [ ] **Upload d'images sécurisé** : Limiter le poids (ex: 5MB) et le format (JPEG, PNG, WebP) des images envoyées vers Supabase Storage, et compresser les images côté client avant l'upload.

---

## 2. 🗺️ Pages Essentielles (Frontend)
Voici la liste de **toutes les pages** dont une marketplace complète a besoin.

### A. Pages Publiques (Accessibles à tous)
- [ ] **Accueil (Landing Page)** : Barre de recherche centrale, Catégories populaires, "Nos sélections", Comment ça marche, Preuve sociale (Avis).
- [ ] **Recherche / Explorer** : Vue liste et carte (Google Maps / Leaflet pour l'Algérie). Filtres avancés (Prix, Etat, Notation, Wilaya).
- [ ] **Détail de l'annonce** :
  - Galerie d'images (carrousel).
  - Détails (Prix jour/semaine/mois, caution, règles).
  - Calendrier des dates indisponibles.
  - Carte (zone approximative).
  - Profil du loueur/vendeur avec sa note.
  - Bouton "Réserver" ou "Acheter" ou "Proposer un échange".
- [ ] **Profil Public Utilisateur** : Ses annonces actives, ses badges (Vérifié), les avis laissés par d'autres.
- [ ] **Pages d'Information (Crucial pour la confiance) :**
  - À propos de nous (Notre mission)
  - Comment ça marche ? / FAQ
  - Centre d'aide / Contact

### B. Pages Authentification & Compte
- [ ] **Authentification** : Login, Inscription, Confirmation d'email obligatoire, Mot de passe oublié/Réinitialisation.
- [ ] **Dashboard Utilisateur (Client)** :
  - Mes demandes de location / Mes achats.
  - Modale de paiement (même si "Payez sur place", l'utilisateur confirme l'action).
  - Mes messages.
  - Mes annonces favorites.
  - Paramètres (Infos personnelles, avatar, changement de mot de passe).

### C. Pages Prêteur / Vendeur
- [ ] **Dashboard Prêteur** :
  - Création/Édition d'annonce (Formulaire multi-étapes optimisé).
  - Gestion des réservations (Accepter / Refuser une demande).
  - Calendrier partagé (Bloquer des dates manuellement).
  - Statistiques (Vues des annonces, revenus générés).

### D. Pages "Légal" (Obligatoire pour le lancement)
- [ ] **CGU (Conditions Générales d'Utilisation)** : Règle l'utilisation du site, décharge la responsabilité de la plateforme en cas de casse.
- [ ] **Politique de Confidentialité** : Indispensable selon les régulations.
- [ ] **Mentions Légales** : Informations sur l'entité derrière Karrily.

---

## 3. 🔄 Flux Logiques (Flows) à Parfaire
Ces flux doivent être infaillibles pour une bonne expérience.

### A. Le Flux de Location (Location parfaite)
1. **Demande** : L'emprunteur sélectionne les dates, voit le prix Total (+ caution éventuelle) et "Demande". *Les dates passent en statut "pending".*
2. **Validation** : Le prêteur reçoit une notification/email. Il accepte. *Les dates se bloquent (booked).*
3. **Paiement (Optionnel/Plus tard)** : Intégration future d'Edahabia, ou validation "Remise en main propre".
4. **Remise** : L'app génère un QR code pour la remise de l'objet, ce qui certifie le début de location.
5. **Retour** : QR code scanné au retour → Fin de location sécurisée.
6. **Avis** : Notification "Comment c'était ?". Les deux se notent.

### B. Le Flux de Notification
- [ ] **Notifications In-App** via la table `notifications` + Realtime.
- [ ] **Emails transactionnels** (ex: SendGrid/Resend) : Confirmation de demande, message non lu, compte créé, annulation. *Vital pour ramener l'utilisateur sur l'app.*

---

## 4. 🧰 SEO & Performance (Référencement)
Si le site ne sort pas dans Google, vous n'aurez pas de trafic gratuit.
- [ ] **Meta Tags & OpenGraph** : `react-helmet-async` pour que chaque page d'annonce ait un titre généré (ex: "Location Perceuse Bosch à Alger - Karrily") et une image de partage pour Facebook/WhatsApp.
- [ ] **Sitemap.xml** : Génération périodique d'un sitemap avec toutes les annonces.
- [ ] **SSR ou Pré-rendering** : Comme vous utilisez Vite (SPA), Google peut avoir du mal. Envisager de passer au mode SSR (Server-Side Rendering) ou utiliser un service comme Prerender.io pour que les annonces soient partagées avec images/textes.
- [ ] **Optimisation Core Web Vitals** : Minifier le CSS/JS, lazy-loading des images (`loading="lazy"`).

---

## 5. 🚀 Préparation Finale avant Lancement
- [ ] **Analytics** : Intégrer un outil (Posthog, Google Analytics) pour comprendre où les utilisateurs cliquent et où ils bloquent.
- [ ] **Error Tracking** : Ajouter **Sentry** frontend et backend. Si un utilisateur a une page blanche, Sentry vous alerte immédiatement avec l'erreur.
- [ ] **Déploiement Frontend** : Vercel ou Netlify (avec vos propres domaines et certificats SSL / HTTPS activé).
- [ ] **Déploiement Backend** : Render, Railway ou VPS.
- [ ] **Test "Monkey Testing"** : Essayer de casser le site -> Mettre des dates absurdes (fin avant début), uploader des images de 50 Mo, créer un compte sans arrobase, etc.

## Conclusion / Plan d'Attaque
La maquette actuelle se concentre sur les **Fondations**.
**La prochaine étape réelle la plus importante pour vous** est :
1. Régler les variables d'environnement (`npm run dev` reboot).
2. Compléter le **CRUD des annonces** (un utilisateur peut créer, voir, éditer, supprimer son annonce sans bug).
3. Faire marcher de bout en bout le **Flux de Réservation**.
4. Ajouter les pages légales et sécuriser la base.
