-- ╔═══════════════════════════════════════════════════════════════╗
-- ║  Karrily — Migration 001 : Schéma Initial                   ║
-- ║  À exécuter dans : Supabase Dashboard → SQL Editor           ║
-- ╚═══════════════════════════════════════════════════════════════╝

-- ─── Extensions ──────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Pour la recherche full-text

-- ═══════════════════════════════════════════════════════
-- TABLE : profiles
-- Liée automatiquement à auth.users
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  phone TEXT,
  bio TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'lender', 'admin')),
  location TEXT,                    -- Wilaya / Ville
  wilaya_code INTEGER,              -- Code wilaya (1-58)
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_verified BOOLEAN DEFAULT FALSE,
  rating NUMERIC(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  trust_score INTEGER DEFAULT 0 CHECK (trust_score >= 0 AND trust_score <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour la recherche
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_wilaya ON public.profiles(wilaya_code);
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON public.profiles USING gin(full_name gin_trgm_ops);

-- ═══════════════════════════════════════════════════════
-- TABLE : categories
-- Catégories d'annonces avec hiérarchie parent/enfant
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,                        -- Nom de l'icône Lucide
  image_url TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  item_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON public.categories(parent_id);

-- ═══════════════════════════════════════════════════════
-- TABLE : items
-- Annonces de location, vente ou troc
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  
  -- Type d'annonce
  listing_type TEXT NOT NULL DEFAULT 'rent' CHECK (listing_type IN ('rent', 'sell', 'troc', 'rent_sell')),
  
  -- Prix
  price_per_day NUMERIC(12,2),       -- Location : prix/jour
  price_per_week NUMERIC(12,2),      -- Location : prix/semaine
  price_per_month NUMERIC(12,2),     -- Location : prix/mois
  sale_price NUMERIC(12,2),          -- Vente : prix de vente
  is_negotiable BOOLEAN DEFAULT FALSE, -- Prix négociable ?
  deposit_amount NUMERIC(12,2),      -- Caution
  currency TEXT DEFAULT 'DZD',
  
  -- Relations
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Localisation
  location TEXT NOT NULL DEFAULT '',
  wilaya_code INTEGER,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  
  -- Médias
  images TEXT[] DEFAULT '{}',         -- Array d'URLs d'images
  thumbnail_url TEXT,
  
  -- Détails
  condition TEXT DEFAULT 'good' CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
  tags TEXT[] DEFAULT '{}',
  
  -- Status
  is_available BOOLEAN DEFAULT TRUE,
  is_premium BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_sold BOOLEAN DEFAULT FALSE,      -- Pour les ventes
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'pending', 'active', 'paused', 'sold', 'archived')),
  
  -- Troc
  troc_description TEXT,              -- Ce que le propriétaire accepte en échange
  troc_estimated_value NUMERIC(12,2), -- Valeur estimée pour le troc
  
  -- Stats
  view_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_items_owner ON public.items(owner_id);
CREATE INDEX IF NOT EXISTS idx_items_category ON public.items(category_id);
CREATE INDEX IF NOT EXISTS idx_items_listing_type ON public.items(listing_type);
CREATE INDEX IF NOT EXISTS idx_items_status ON public.items(status);
CREATE INDEX IF NOT EXISTS idx_items_wilaya ON public.items(wilaya_code);
CREATE INDEX IF NOT EXISTS idx_items_price_day ON public.items(price_per_day);
CREATE INDEX IF NOT EXISTS idx_items_sale_price ON public.items(sale_price);
CREATE INDEX IF NOT EXISTS idx_items_created ON public.items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_available ON public.items(is_available) WHERE is_available = TRUE;
CREATE INDEX IF NOT EXISTS idx_items_title_search ON public.items USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_items_description_search ON public.items USING gin(description gin_trgm_ops);

-- ═══════════════════════════════════════════════════════
-- TABLE : bookings
-- Réservations de location
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  renter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER GENERATED ALWAYS AS (end_date - start_date) STORED,
  
  -- Prix
  price_per_day NUMERIC(12,2) NOT NULL, -- Prix fixé au moment de la résa
  total_price NUMERIC(12,2) NOT NULL,
  deposit_amount NUMERIC(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'DZD',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'active', 'completed', 'cancelled', 'rejected'
  )),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN (
    'pending', 'paid', 'deposit_paid', 'refunded', 'partial_refund'
  )),
  payment_method TEXT,
  
  -- Communication
  message TEXT,                       -- Message du locataire
  owner_response TEXT,                -- Réponse du propriétaire
  cancellation_reason TEXT,
  
  -- Remise / Retour
  pickup_confirmed_at TIMESTAMPTZ,
  return_confirmed_at TIMESTAMPTZ,
  pickup_qr_code TEXT,
  return_qr_code TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT valid_dates CHECK (end_date > start_date),
  CONSTRAINT no_self_booking CHECK (renter_id != owner_id)
);

CREATE INDEX IF NOT EXISTS idx_bookings_item ON public.bookings(item_id);
CREATE INDEX IF NOT EXISTS idx_bookings_renter ON public.bookings(renter_id);
CREATE INDEX IF NOT EXISTS idx_bookings_owner ON public.bookings(owner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON public.bookings(start_date, end_date);

-- ═══════════════════════════════════════════════════════
-- TABLE : reviews
-- Avis sur les items et les utilisateurs
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewed_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  
  -- Réponse du propriétaire
  owner_response TEXT,
  owner_responded_at TIMESTAMPTZ,
  
  -- Modération
  is_verified BOOLEAN DEFAULT FALSE,  -- L'avis vient d'une vraie transaction
  is_reported BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Un seul avis par utilisateur par booking
  CONSTRAINT unique_review_per_booking UNIQUE(booking_id, reviewer_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_item ON public.reviews(item_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed ON public.reviews(reviewed_user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);

-- ═══════════════════════════════════════════════════════
-- TABLE : favorites
-- Favoris utilisateur
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_favorite UNIQUE(user_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_item ON public.favorites(item_id);

-- ═══════════════════════════════════════════════════════
-- TABLE : conversations
-- Fils de conversation entre utilisateurs
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES public.items(id) ON DELETE SET NULL,
  participant_1 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_2 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_preview TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_conversation UNIQUE(item_id, participant_1, participant_2),
  CONSTRAINT different_participants CHECK (participant_1 != participant_2)
);

CREATE INDEX IF NOT EXISTS idx_conversations_p1 ON public.conversations(participant_1);
CREATE INDEX IF NOT EXISTS idx_conversations_p2 ON public.conversations(participant_2);
CREATE INDEX IF NOT EXISTS idx_conversations_last_msg ON public.conversations(last_message_at DESC);

-- ═══════════════════════════════════════════════════════
-- TABLE : messages
-- Messages dans les conversations
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'offer', 'system')),
  image_url TEXT,
  
  -- Pour les offres de prix
  offer_amount NUMERIC(12,2),
  offer_status TEXT CHECK (offer_status IN ('pending', 'accepted', 'rejected')),
  
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON public.messages(is_read) WHERE is_read = FALSE;

-- ═══════════════════════════════════════════════════════
-- TABLE : notifications
-- Notifications utilisateur
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'booking_request', 'booking_confirmed', 'booking_cancelled',
    'message', 'review', 'price_alert', 'system',
    'troc_proposal', 'troc_accepted', 'troc_rejected'
  )),
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',           -- Données additionnelles (item_id, booking_id, etc.)
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

-- ═══════════════════════════════════════════════════════
-- TABLE : troc_proposals
-- Propositions d'échange
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.troc_proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- L'item demandé
  requested_item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  requested_owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- L'item proposé en échange
  offered_item_id UUID REFERENCES public.items(id) ON DELETE SET NULL,
  proposer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Détails
  message TEXT,
  cash_complement NUMERIC(12,2) DEFAULT 0,  -- Complément monétaire
  complement_payer TEXT CHECK (complement_payer IN ('proposer', 'owner')),
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'counter', 'completed', 'cancelled')),
  
  -- Contre-proposition
  counter_item_id UUID REFERENCES public.items(id) ON DELETE SET NULL,
  counter_cash NUMERIC(12,2),
  counter_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT no_self_troc CHECK (proposer_id != requested_owner_id)
);

CREATE INDEX IF NOT EXISTS idx_troc_requested_item ON public.troc_proposals(requested_item_id);
CREATE INDEX IF NOT EXISTS idx_troc_offered_item ON public.troc_proposals(offered_item_id);
CREATE INDEX IF NOT EXISTS idx_troc_proposer ON public.troc_proposals(proposer_id);
CREATE INDEX IF NOT EXISTS idx_troc_owner ON public.troc_proposals(requested_owner_id);
CREATE INDEX IF NOT EXISTS idx_troc_status ON public.troc_proposals(status);

-- ═══════════════════════════════════════════════════════
-- TABLE : reports
-- Signalements
-- ═══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_item_id UUID REFERENCES public.items(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'fraud', 'inappropriate', 'fake', 'harassment', 'other')),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  admin_notes TEXT,
  resolved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_item ON public.reports(reported_item_id);
CREATE INDEX IF NOT EXISTS idx_reports_user ON public.reports(reported_user_id);

-- ═══════════════════════════════════════════════════════
-- FIN DE LA MIGRATION 001
-- ═══════════════════════════════════════════════════════

-- Vérification : lister toutes les tables créées
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
