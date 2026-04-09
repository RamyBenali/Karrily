-- ╔═══════════════════════════════════════════════════════════════╗
-- ║  Karrily — Migration 002 : Row Level Security (RLS)         ║
-- ║  À exécuter APRÈS la migration 001                          ║
-- ╚═══════════════════════════════════════════════════════════════╝

-- ─── Activer RLS sur toutes les tables ───────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.troc_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════
-- PROFILES — Policies
-- ═══════════════════════════════════════════════════════

-- Tout le monde peut voir les profils publics
CREATE POLICY "profiles_select_public" ON public.profiles
  FOR SELECT USING (true);

-- Un utilisateur peut modifier son propre profil
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Permet l'insertion via le trigger (service role)
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ═══════════════════════════════════════════════════════
-- CATEGORIES — Policies
-- ═══════════════════════════════════════════════════════

-- Tout le monde peut voir les catégories
CREATE POLICY "categories_select_public" ON public.categories
  FOR SELECT USING (true);

-- Seuls les admins peuvent gérer les catégories
CREATE POLICY "categories_admin_insert" ON public.categories
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "categories_admin_update" ON public.categories
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "categories_admin_delete" ON public.categories
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ═══════════════════════════════════════════════════════
-- ITEMS — Policies
-- ═══════════════════════════════════════════════════════

-- Tout le monde peut voir les items actifs
CREATE POLICY "items_select_public" ON public.items
  FOR SELECT USING (status = 'active' OR owner_id = auth.uid());

-- Un utilisateur connecté peut créer un item
CREATE POLICY "items_insert_auth" ON public.items
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Seul le propriétaire peut modifier son item
CREATE POLICY "items_update_own" ON public.items
  FOR UPDATE USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Seul le propriétaire peut supprimer son item
CREATE POLICY "items_delete_own" ON public.items
  FOR DELETE USING (auth.uid() = owner_id);

-- ═══════════════════════════════════════════════════════
-- BOOKINGS — Policies
-- ═══════════════════════════════════════════════════════

-- Le locataire ou le propriétaire peut voir la réservation
CREATE POLICY "bookings_select_own" ON public.bookings
  FOR SELECT USING (auth.uid() = renter_id OR auth.uid() = owner_id);

-- Un utilisateur connecté peut créer une réservation
CREATE POLICY "bookings_insert_auth" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = renter_id);

-- Le propriétaire ou le locataire peut mettre à jour le statut
CREATE POLICY "bookings_update_participants" ON public.bookings
  FOR UPDATE USING (auth.uid() = renter_id OR auth.uid() = owner_id);

-- ═══════════════════════════════════════════════════════
-- REVIEWS — Policies
-- ═══════════════════════════════════════════════════════

-- Tout le monde peut voir les avis
CREATE POLICY "reviews_select_public" ON public.reviews
  FOR SELECT USING (true);

-- Un utilisateur connecté peut laisser un avis
CREATE POLICY "reviews_insert_auth" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Un utilisateur peut modifier son propre avis
CREATE POLICY "reviews_update_own" ON public.reviews
  FOR UPDATE USING (auth.uid() = reviewer_id);

-- ═══════════════════════════════════════════════════════
-- FAVORITES — Policies
-- ═══════════════════════════════════════════════════════

-- Un utilisateur voit ses propres favoris
CREATE POLICY "favorites_select_own" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);

-- Un utilisateur peut ajouter un favori
CREATE POLICY "favorites_insert_own" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Un utilisateur peut retirer un favori
CREATE POLICY "favorites_delete_own" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════
-- CONVERSATIONS — Policies
-- ═══════════════════════════════════════════════════════

-- Un participant peut voir ses conversations
CREATE POLICY "conversations_select_own" ON public.conversations
  FOR SELECT USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Un utilisateur connecté peut créer une conversation
CREATE POLICY "conversations_insert_auth" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Un participant peut mettre à jour la conversation
CREATE POLICY "conversations_update_own" ON public.conversations
  FOR UPDATE USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- ═══════════════════════════════════════════════════════
-- MESSAGES — Policies
-- ═══════════════════════════════════════════════════════

-- Un participant de la conversation peut voir les messages
CREATE POLICY "messages_select_conversation" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );

-- L'expéditeur peut envoyer un message dans sa conversation
CREATE POLICY "messages_insert_sender" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );

-- Le destinataire peut marquer un message comme lu
CREATE POLICY "messages_update_read" ON public.messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
      AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );

-- ═══════════════════════════════════════════════════════
-- NOTIFICATIONS — Policies
-- ═══════════════════════════════════════════════════════

-- Un utilisateur voit ses propres notifications
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Le système (via service role) peut insérer des notifications
-- Les utilisateurs ne peuvent pas créer de notifications eux-mêmes
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════
-- TROC_PROPOSALS — Policies
-- ═══════════════════════════════════════════════════════

-- Les participants voient leurs propositions de troc
CREATE POLICY "troc_select_participants" ON public.troc_proposals
  FOR SELECT USING (auth.uid() = proposer_id OR auth.uid() = requested_owner_id);

-- Un utilisateur peut proposer un échange
CREATE POLICY "troc_insert_proposer" ON public.troc_proposals
  FOR INSERT WITH CHECK (auth.uid() = proposer_id);

-- Les participants peuvent mettre à jour le statut
CREATE POLICY "troc_update_participants" ON public.troc_proposals
  FOR UPDATE USING (auth.uid() = proposer_id OR auth.uid() = requested_owner_id);

-- ═══════════════════════════════════════════════════════
-- REPORTS — Policies
-- ═══════════════════════════════════════════════════════

-- Un utilisateur peut créer un signalement
CREATE POLICY "reports_insert_auth" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Un utilisateur peut voir ses propres signalements
CREATE POLICY "reports_select_own" ON public.reports
  FOR SELECT USING (
    auth.uid() = reporter_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Seuls les admins peuvent mettre à jour les signalements
CREATE POLICY "reports_update_admin" ON public.reports
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ═══════════════════════════════════════════════════════
-- FIN DE LA MIGRATION 002
-- ═══════════════════════════════════════════════════════
