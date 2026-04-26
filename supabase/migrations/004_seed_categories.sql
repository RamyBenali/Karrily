-- ╔═══════════════════════════════════════════════════════════════╗
-- ║  Karrily — Migration 004 : Seed Data (Données de base)      ║
-- ║  À exécuter APRÈS les migrations 001, 002, 003              ║
-- ╚═══════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════
-- CATÉGORIES PRINCIPALES
-- ═══════════════════════════════════════════════════════
INSERT INTO public.categories (name, slug, description, icon, sort_order) VALUES
  ('Immobilier', 'immobilier', 'Appartements, maisons, studios, locaux commerciaux', 'Building2', 1),
  ('Véhicules', 'vehicules', 'Voitures, motos, utilitaires, vélos', 'Car', 2),
  ('Électronique', 'electronique', 'Ordinateurs, téléphones, appareils photo, consoles', 'Laptop', 3),
  ('Électroménager', 'electromenager', 'Réfrigérateurs, machines à laver, climatiseurs', 'Refrigerator', 4),
  ('Outillage', 'outillage', 'Perceuses, scies, outils de jardinage, échafaudages', 'Wrench', 5),
  ('Événementiel', 'evenementiel', 'Tentes, sono, éclairage, tables, chaises, décoration', 'PartyPopper', 6),
  ('Sport & Loisirs', 'sport-loisirs', 'Équipement sportif, camping, randonnée, ski', 'Dumbbell', 7),
  ('Mode & Accessoires', 'mode-accessoires', 'Robes de soirée, costumes, bijoux, accessoires', 'Shirt', 8),
  ('Mobilier', 'mobilier', 'Meubles, canapés, tables, bureaux, rangements', 'Sofa', 9),
  ('Bébé & Enfants', 'bebe-enfants', 'Poussettes, lits bébé, jouets, vêtements enfants', 'Baby', 10),
  ('Livres & Éducation', 'livres-education', 'Manuels scolaires, livres, instruments de musique', 'BookOpen', 11),
  ('Santé & Bien-être', 'sante-bien-etre', 'Matériel médical, fauteuils roulants, équipement fitness', 'HeartPulse', 12),
  ('Animaux', 'animaux', 'Accessoires pour animaux, cages, aquariums', 'PawPrint', 13),
  ('Services', 'services', 'Prestation de services, cours particuliers, aide', 'HandHelping', 14),
  ('Autres', 'autres', 'Tout ce qui ne rentre pas dans les autres catégories', 'Package', 15)
ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════
-- SOUS-CATÉGORIES : Immobilier
-- ═══════════════════════════════════════════════════════
INSERT INTO public.categories (name, slug, description, icon, parent_id, sort_order)
SELECT sub.name, sub.slug, sub.description, sub.icon, c.id, sub.sort_order
FROM (VALUES
  ('Appartements', 'appartements', 'F2, F3, F4, studios', 'Home', 1),
  ('Maisons', 'maisons', 'Villas, maisons individuelles', 'House', 2),
  ('Locaux commerciaux', 'locaux-commerciaux', 'Bureaux, boutiques, entrepôts', 'Store', 3),
  ('Terrains', 'terrains', 'Terrains agricoles, constructibles', 'Map', 4),
  ('Salles des fêtes', 'salles-fetes', 'Salles de réception, événements', 'Crown', 5)
) AS sub(name, slug, description, icon, sort_order)
CROSS JOIN public.categories c
WHERE c.slug = 'immobilier'
ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════
-- SOUS-CATÉGORIES : Véhicules
-- ═══════════════════════════════════════════════════════
INSERT INTO public.categories (name, slug, description, icon, parent_id, sort_order)
SELECT sub.name, sub.slug, sub.description, sub.icon, c.id, sub.sort_order
FROM (VALUES
  ('Voitures', 'voitures', 'Citadines, berlines, SUV', 'Car', 1),
  ('Motos & Scooters', 'motos-scooters', 'Motos, scooters, quad', 'Bike', 2),
  ('Utilitaires', 'utilitaires', 'Fourgons, camionnettes, camions', 'Truck', 3),
  ('Vélos', 'velos', 'Vélos de ville, VTT, vélos électriques', 'Bike', 4)
) AS sub(name, slug, description, icon, sort_order)
CROSS JOIN public.categories c
WHERE c.slug = 'vehicules'
ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════
-- SOUS-CATÉGORIES : Électronique
-- ═══════════════════════════════════════════════════════
INSERT INTO public.categories (name, slug, description, icon, parent_id, sort_order)
SELECT sub.name, sub.slug, sub.description, sub.icon, c.id, sub.sort_order
FROM (VALUES
  ('Ordinateurs', 'ordinateurs', 'PC portables, PC de bureau, tablettes', 'Monitor', 1),
  ('Téléphones', 'telephones', 'Smartphones, accessoires', 'Smartphone', 2),
  ('Photo & Vidéo', 'photo-video', 'Appareils photo, caméras, drones', 'Camera', 3),
  ('Gaming', 'gaming', 'Consoles, manettes, jeux vidéo', 'Gamepad2', 4),
  ('Audio', 'audio', 'Enceintes, casques, micros, sono', 'Headphones', 5)
) AS sub(name, slug, description, icon, sort_order)
CROSS JOIN public.categories c
WHERE c.slug = 'electronique'
ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════
-- SOUS-CATÉGORIES : Événementiel
-- ═══════════════════════════════════════════════════════
INSERT INTO public.categories (name, slug, description, icon, parent_id, sort_order)
SELECT sub.name, sub.slug, sub.description, sub.icon, c.id, sub.sort_order
FROM (VALUES
  ('Sonorisation', 'sonorisation', 'Enceintes, tables de mixage, micros', 'Speaker', 1),
  ('Éclairage', 'eclairage', 'Spots, projecteurs, guirlandes', 'Lightbulb', 2),
  ('Mobilier événementiel', 'mobilier-evenementiel', 'Tables, chaises, buffets', 'Armchair', 3),
  ('Décoration', 'decoration', 'Déco mariage, anniversaire, fête', 'Sparkles', 4),
  ('Tentes & Chapiteaux', 'tentes-chapiteaux', 'Tentes, barnums, chapiteaux', 'Tent', 5)
) AS sub(name, slug, description, icon, sort_order)
CROSS JOIN public.categories c
WHERE c.slug = 'evenementiel'
ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════
-- FIN DE LA MIGRATION 004
-- ═══════════════════════════════════════════════════════

-- Vérifier les catégories créées
SELECT id, name, slug, parent_id, sort_order FROM public.categories ORDER BY sort_order, name;
