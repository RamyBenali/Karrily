-- ╔═══════════════════════════════════════════════════════════════╗
-- ║  Karrily — Migration 005 : Metadata JSONB pour filtres      ║
-- ║  À exécuter APRÈS les migrations 001-004                    ║
-- ╚═══════════════════════════════════════════════════════════════╝

-- Ajouter une colonne metadata JSONB pour les attributs spécifiques par catégorie
-- Exemples :
--   Immobilier: {"rooms": 3, "surface": 80, "floor": 2, "furnished": true}
--   Véhicules:  {"brand": "Toyota", "year": 2020, "km": 45000, "fuel": "diesel"}
--   Électronique: {"brand": "Apple", "storage": "256GB", "screen_size": 15.6}

ALTER TABLE public.items 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Index GIN pour les requêtes JSONB performantes
CREATE INDEX IF NOT EXISTS idx_items_metadata ON public.items USING gin(metadata);

-- ═══════════════════════════════════════════════════════
-- FIN DE LA MIGRATION 005
-- ═══════════════════════════════════════════════════════
