# Karrily — Roadmap de Développement

---

##  Phase 1 : Fondations (Semaine 1-2) ← **ON EST ICI**

> Base de données, authentification, et structure de l'app.

### 1.1 — Base de données Supabase
- [ ] Migration `001` : Tables de base (`profiles`, `categories`, `items`, `bookings`, `reviews`)
- [ ] Migration `002` : RLS policies (sécurité par lignes)
- [ ] Migration `003` : Triggers auto (`updated_at`, profil auto-créé à l'inscription)
- [ ] Seed data : Catégories par défaut + items de démo

### 1.2 — Authentification
- [ ] Inscription / Connexion (email + mot de passe)
- [ ] Page de login / signup (nouveau design cohérent)
- [ ] Protection des routes (frontend)
- [ ] Gestion des rôles (user → lender → admin)
- [ ] Mot de passe oublié / reset

### 1.3 — Profils utilisateur
- [ ] Page profil (voir / éditer)
- [ ] Upload avatar (Supabase Storage)
- [ ] Informations personnelles + localisation (wilaya)

---

##  Phase 2 : Core Location (Semaine 3-4)

> Le cœur de la plateforme : publier, chercher et louer.

### 2.1 — Publication d'annonces
- [ ] Formulaire de création d'annonce (multi-étapes)
- [ ] Upload multi-images (drag & drop)
- [ ] Sélection catégorie + sous-catégorie
- [ ] Définition prix (jour/semaine/mois)
- [ ] Localisation (wilaya + adresse)
- [ ] Tags et mots-clés

### 2.2 — Recherche & Exploration
- [ ] Barre de recherche globale avec suggestions
- [ ] Filtres avancés (prix, catégorie, distance, état, note)
- [ ] Tri (pertinence, prix, date, popularité)
- [ ] Vue carte intégrée (wilayas d'Algérie)
- [ ] Pagination infinie (scroll)

### 2.3 — Système de réservation
- [ ] Calendrier de disponibilité
- [ ] Demande de réservation
- [ ] Confirmation / Refus par le loueur
- [ ] Calcul automatique du prix total
- [ ] Historique des réservations

### 2.4 — Messagerie
- [ ] Chat en temps réel (Supabase Realtime)
- [ ] Conversations par annonce
- [ ] Notifications de nouveaux messages
- [ ] Partage d'images dans le chat

---

##  Phase 3 : Vente & Troc (Semaine 5-6)

> Étendre au-delà de la location.

### 3.1 — Module Vente
- [ ] Type d'annonce : Location / Vente / Troc
- [ ] Prix fixe ou négociable
- [ ] Bouton "Faire une offre"
- [ ] Système de négociation dans le chat
- [ ] État du produit (neuf, comme neuf, bon, acceptable)
- [ ] Marquage "Vendu"

### 3.2 — Module Troc (Échange)
- [ ] Proposer un échange objet contre objet
- [ ] Estimation de valeur intégrée
- [ ] Complément monétaire possible
- [ ] Système de matching : "Ton objet intéresse X qui a ce que tu cherches"
- [ ] Chaînes de troc triangulaires (A→B→C→A)
- [ ] Historique des échanges

### 3.3 — Favoris & Collections
- [ ] Ajouter aux favoris ()
- [ ] Créer des collections personnalisées
- [ ] Alertes prix sur les favoris

---

##  Phase 4 : Dashboards & Admin (Semaine 7-8)

### 4.1 — Dashboard Loueur/Vendeur
- [ ] Vue d'ensemble (revenus, réservations, stats)
- [ ] Gestion des annonces (CRUD complet)
- [ ] Calendrier des locations
- [ ] Statistiques détaillées (vues, favoris, conversions)
- [ ] Gestion des paiements reçus
- [ ] Avis reçus et réputation

### 4.2 — Dashboard Utilisateur
- [ ] Mes réservations (en cours, passées, à venir)
- [ ] Mes achats
- [ ] Mes échanges (troc)
- [ ] Mes favoris
- [ ] Historique de paiements
- [ ] Paramètres du compte

### 4.3 — Panel Admin
- [ ] Statistiques globales (utilisateurs, annonces, revenus)
- [ ] Modération des annonces (approuver, rejeter, signaler)
- [ ] Gestion des utilisateurs (ban, vérification, rôles)
- [ ] Gestion des catégories
- [ ] Gestion des signalements
- [ ] Logs d'activité

---

## ⭐ Phase 5 : Features Différenciantes (Semaine 9-12)

> Ce qui va nous démarquer de la concurrence.

### 5.1 —  Système de Confiance
- [ ] **Vérification d'identité** (photo CIN + selfie)
- [ ] **Score de confiance** calculé (vérification, avis, ancienneté, transactions)
- [ ] **Badges** : Vérifié , Super Loueur ⭐, Top Vendeur 
- [ ] **Garantie Karrily** : Médiation en cas de litige

### 5.2 —  Intelligence Artificielle
- [ ] **Suggestion de prix** basée sur le marché local
- [ ] **Matching intelligent de troc** (NLP sur descriptions)
- [ ] **Recherche sémantique** ("je cherche un truc pour mon mariage")
- [ ] **Détection de fraude** sur les annonces
- [ ] **Catégorisation auto** des images uploadées
- [ ] **Chatbot d'assistance** intégré

### 5.3 —  Géolocalisation Algérie
- [ ] **Carte interactive par wilaya** (48 wilayas)
- [ ] **Recherche de proximité** ("à moins de 5km")
- [ ] **Points de rencontre sécurisés** (lieux publics suggérés)
- [ ] **Estimation de livraison** par wilaya

### 5.4 —  Notifications Intelligentes
- [ ] **Alertes de proximité** : "Un perceuse est dispo à 500m de chez toi"
- [ ] **Alertes de prix** : "Un objet de ta wishlist vient de baisser de prix"
- [ ] **Rappels** : "Ta location se termine dans 2 jours"
- [ ] **Suggestions saisonnières** : "L'été arrive, loue ta tente de camping !"

### 5.5 —  Système de Paiement (Adapté Algérie)
- [ ] **Cash à la remise** (le plus courant)
- [ ] **CCP / Baridimob** (virement postal)
- [ ] **Carte Edahabia** (CIB)
- [ ] **Wallet Karrily** (solde interne rechargeable)
- [ ] **Système de caution** (consignation)

### 5.6 —  Expérience Visuelle
- [ ] **Photos multiples** avec galerie swipeable
- [ ] **Comparaison avant/après** (état de l'objet)
- [ ] **QR Code de remise** (confirmer pickup/retour)
- [ ] **Stories d'objets** (Reels-style pour les annonces)

### 5.7 —  Social & Communauté
- [ ] **Profils publics** avec réputation
- [ ] **Suivre un loueur/vendeur**
- [ ] **Partage social** (WhatsApp, Facebook, Instagram)
- [ ] **Parrainage** : Invite un ami → bonus en crédit
- [ ] **Avis vérifiés** (seuls ceux qui ont loué/acheté)

### 5.8 —  Comptes Professionnels
- [ ] **Mode pro** pour les entreprises (agences, événementiel, BTP)
- [ ] **Vitrine personnalisée** (mini-site du pro)
- [ ] **Facturation automatique**
- [ ] **Multi-utilisateurs** par compte pro
- [ ] **API pour intégrations tierces**

---

##  Phase 6 : Mobile & PWA (Semaine 13-14)

### 6.1 — PWA (Progressive Web App)
- [ ] Service Worker pour le offline
- [ ] Manifest pour l'installation
- [ ] Notifications push
- [ ] Cache intelligent des images

### 6.2 — Responsive complet
- [ ] Bottom tab bar mobile
- [ ] Swipe gestures
- [ ] Pull-to-refresh
- [ ] Navigation adaptée mobile

### 6.3 — Capacitor (optionnel)
- [ ] Build Android (APK/AAB)
- [ ] Build iOS (IPA)
- [ ] Camera native pour photos
- [ ] GPS natif
- [ ] Notifications push natives

---

##  Phase 7 : Perspectives Futures

### Court terme (3-6 mois)
-  **Analytics avancées** pour les loueurs/vendeurs
-  **Système de promotions** et codes promo
-  **Livraison intégrée** (partenariat Yassir/Tempo)
-  **Enchères en temps réel** pour certains objets
-  **Multilingue complet** (FR/AR/EN)

### Moyen terme (6-12 mois)
-  **Porte-monnaie électronique** avec recharges
-  **Abonnements** : locations illimitées mensuelles
-  **Groupes de location** : partager les coûts entre amis
-  **Contrats intelligents** générés automatiquement
-  **Score écologique** : impact carbone économisé

### Long terme (1-2 ans)
-  **Marketplace B2B** pour les entreprises
-  **Expansion internationale** (Tunisie, Maroc, France)
-  **AR/VR** : Visualiser un meuble chez soi avant de louer
-  **Programme de fidélité** avec points Karrily
-  **Super App** : intégrer services, livraison, paiement

---

##  Stratégie de développement

### L'approche recommandée

On développe **par feature verticale** plutôt que par couche technique :

```
Pour chaque feature :
1. Migration SQL (si nécessaire)
2. Backend (routes + controllers)
3. Frontend (UI + intégration API)
4. Test & Polish
```

Cela permet :
-  D'avoir quelque chose de fonctionnel à chaque étape
-  De tester au fur et à mesure
-  De livrer incrémentalement

### Priorité de développement

```
URGENT & IMPORTANT (Phase 1-2)
├── Auth + Profils
├── CRUD Annonces
├── Recherche & Filtres
└── Système de réservation

IMPORTANT (Phase 3-4)
├── Vente / Troc
├── Messagerie
├── Dashboards
└── Admin Panel

DIFFÉRENCIANT (Phase 5)
├── Vérification d'identité
├── IA (suggestions, matching)
├── Paiements algériens
└── Géolocalisation wilayas

EXPANSION (Phase 6-7)
├── PWA / Mobile
├── Multi-langue
├── Livraison
└── Expansion géographique
```
