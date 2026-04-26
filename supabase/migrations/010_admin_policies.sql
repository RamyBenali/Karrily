--          ╔═══════════════════════════════════════════════════════════╗
--          ║  Karrily — Migration 010 : Admin Policies (Impersonation) ║
--          ║  À exécuter dans : Supabase Dashboard → SQL Editor        ║
--          ╚═══════════════════════════════════════════════════════════╝ 

BEGIN;

-- Helper function pour vérifier si l'utilisateur courant est un admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 1. Ajout de policies pour PROFILES
-- Les admins peuvent modifier (update) tous les profils (ex: bannir)
DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;
CREATE POLICY "profiles_admin_update" ON public.profiles
  FOR UPDATE USING (public.is_admin());

-- Les admins peuvent supprimer (delete) n'importe quel profil (très rare, mais nécessaire pour RGPD/Bans définitifs)
DROP POLICY IF EXISTS "profiles_admin_delete" ON public.profiles;
CREATE POLICY "profiles_admin_delete" ON public.profiles
  FOR DELETE USING (public.is_admin());


-- 2. Ajout de policies pour ITEMS
-- Les admins peuvent modifier et supprimer n'importe quel item
DROP POLICY IF EXISTS "items_admin_update" ON public.items;
CREATE POLICY "items_admin_update" ON public.items
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "items_admin_delete" ON public.items;
CREATE POLICY "items_admin_delete" ON public.items
  FOR DELETE USING (public.is_admin());


-- 3. Ajout de policies pour BOOKINGS
-- Les admins peuvent tout faire (ALL) sur n'importe quelle réservation (pour forcer une annulation par exemple)
DROP POLICY IF EXISTS "bookings_admin_all" ON public.bookings;
CREATE POLICY "bookings_admin_all" ON public.bookings
  FOR ALL USING (public.is_admin());


-- 4. Ajout de policies pour CONVERSATIONS et MESSAGES
-- Les admins peuvent voir toutes les conversations (utile pour la modération ou l'impersonification)
DROP POLICY IF EXISTS "conversations_admin_all" ON public.conversations;
CREATE POLICY "conversations_admin_all" ON public.conversations
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "messages_admin_all" ON public.messages;
CREATE POLICY "messages_admin_all" ON public.messages
  FOR ALL USING (public.is_admin());


-- 5. Ajout de policies pour REVIEWS
-- Les admins peuvent supprimer et modifier n'importe quel avis (modération)
DROP POLICY IF EXISTS "reviews_admin_all" ON public.reviews;
CREATE POLICY "reviews_admin_all" ON public.reviews
  FOR ALL USING (public.is_admin());


-- 6. Ajout de policies pour FAVORITES
-- Mieux vaut que les admins puissent voir/agencer les favoris s'ils impersonifient qlqn
DROP POLICY IF EXISTS "favorites_admin_all" ON public.favorites;
CREATE POLICY "favorites_admin_all" ON public.favorites
  FOR ALL USING (public.is_admin());


-- 7. Ajout de policies pour REPORTS
-- Les admins peuvent voir, modifier, et même supprimer les signalements
-- NOTE: Les politiques étaient déjà partiellement couvertes dans 002, on s'assure d'un full access.
DROP POLICY IF EXISTS "reports_admin_all" ON public.reports;
CREATE POLICY "reports_admin_all" ON public.reports
  FOR ALL USING (public.is_admin());


-- 8. Ajout de policies pour TROC_PROPOSALS
-- Les admins peuvent tout faire
DROP POLICY IF EXISTS "troc_admin_all" ON public.troc_proposals;
CREATE POLICY "troc_admin_all" ON public.troc_proposals
  FOR ALL USING (public.is_admin());

COMMIT;