-- ╔═══════════════════════════════════════════════════════════════╗
-- ║  Karrily — Migration 003 : Triggers & Fonctions             ║
-- ║  À exécuter APRÈS les migrations 001 et 002                 ║
-- ╚═══════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════
-- FONCTION : updated_at automatique
-- ═══════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger sur toutes les tables avec updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.troc_proposals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ═══════════════════════════════════════════════════════
-- FONCTION : Créer un profil automatiquement à l'inscription
-- ═══════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════════════════════
-- FONCTION : Mettre à jour les compteurs d'items par catégorie
-- ═══════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.update_category_item_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour l'ancienne catégorie (si changement)
  IF TG_OP = 'UPDATE' AND OLD.category_id != NEW.category_id THEN
    UPDATE public.categories
    SET item_count = (
      SELECT COUNT(*) FROM public.items 
      WHERE category_id = OLD.category_id AND status = 'active'
    )
    WHERE id = OLD.category_id;
  END IF;

  -- Mettre à jour la nouvelle catégorie
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.categories
    SET item_count = (
      SELECT COUNT(*) FROM public.items 
      WHERE category_id = NEW.category_id AND status = 'active'
    )
    WHERE id = NEW.category_id;
  END IF;

  -- Sur suppression, mettre à jour l'ancienne catégorie
  IF TG_OP = 'DELETE' THEN
    UPDATE public.categories
    SET item_count = (
      SELECT COUNT(*) FROM public.items 
      WHERE category_id = OLD.category_id AND status = 'active'
    )
    WHERE id = OLD.category_id;
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_category_count
  AFTER INSERT OR UPDATE OR DELETE ON public.items
  FOR EACH ROW EXECUTE FUNCTION public.update_category_item_count();

-- ═══════════════════════════════════════════════════════
-- FONCTION : Mettre à jour la note moyenne d'un item
-- ═══════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.update_item_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.items
  SET 
    rating = (SELECT COALESCE(AVG(rating), 0) FROM public.reviews WHERE item_id = NEW.item_id),
    total_reviews = (SELECT COUNT(*) FROM public.reviews WHERE item_id = NEW.item_id)
  WHERE id = NEW.item_id;

  -- Mettre à jour aussi le profil du propriétaire
  UPDATE public.profiles
  SET 
    rating = (
      SELECT COALESCE(AVG(r.rating), 0) 
      FROM public.reviews r 
      JOIN public.items i ON r.item_id = i.id 
      WHERE i.owner_id = NEW.reviewed_user_id
    ),
    total_reviews = (
      SELECT COUNT(*) 
      FROM public.reviews r 
      JOIN public.items i ON r.item_id = i.id 
      WHERE i.owner_id = NEW.reviewed_user_id
    )
  WHERE id = NEW.reviewed_user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_rating_on_review
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_item_rating();

-- ═══════════════════════════════════════════════════════
-- FONCTION : Mettre à jour last_message dans conversation
-- ═══════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET 
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.content, 100)
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_conversation_last_message
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_conversation_on_message();

-- ═══════════════════════════════════════════════════════
-- FONCTION : Mettre à jour le compteur de favoris
-- ═══════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.update_item_favorite_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.items
    SET favorite_count = favorite_count + 1
    WHERE id = NEW.item_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.items
    SET favorite_count = GREATEST(favorite_count - 1, 0)
    WHERE id = OLD.item_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_favorite_count
  AFTER INSERT OR DELETE ON public.favorites
  FOR EACH ROW EXECUTE FUNCTION public.update_item_favorite_count();

-- ═══════════════════════════════════════════════════════
-- FONCTION : Incrémenter le total_bookings d'un item
-- ═══════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.update_item_booking_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND (TG_OP = 'INSERT' OR OLD.status != 'confirmed') THEN
    UPDATE public.items
    SET total_bookings = total_bookings + 1
    WHERE id = NEW.item_id;
    
    UPDATE public.profiles
    SET total_transactions = total_transactions + 1
    WHERE id = NEW.owner_id OR id = NEW.renter_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_booking_count
  AFTER INSERT OR UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_item_booking_count();

-- ═══════════════════════════════════════════════════════
-- STORAGE : Créer le bucket pour les images
-- ═══════════════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'item-images',
  'item-images',
  TRUE,
  5242880, -- 5MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  TRUE,
  2097152, -- 2MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Policies pour le storage
CREATE POLICY "item_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'item-images');

CREATE POLICY "item_images_auth_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'item-images' AND auth.role() = 'authenticated');

CREATE POLICY "item_images_owner_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_auth_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "avatars_owner_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ═══════════════════════════════════════════════════════
-- FIN DE LA MIGRATION 003
-- ═══════════════════════════════════════════════════════
