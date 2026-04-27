# Supabase Migrations — Karrily

> ** Exécution manuelle** : Copier-coller chaque fichier SQL dans le SQL Editor de Supabase Dashboard.
> Les migrations sont numérotées et doivent être exécutées **dans l'ordre**.

## Comment utiliser

1. Ouvrir le [Dashboard Supabase](https://supabase.com/dashboard) → SQL Editor
2. Copier le contenu du fichier de migration
3. L'exécuter
4. Cocher la migration ci-dessous comme exécutée

## Historique des migrations

| # | Fichier | Description | Exécuté |
|---|---------|-------------|---------|
| 001 | `001_initial_schema.sql` | 11 tables + index |  |
| 002 | `002_rls_policies.sql` | RLS policies |  |
| 003 | `003_triggers_functions.sql` | 7 triggers + 2 storage buckets |  |
| 004 | `004_seed_categories.sql` | 15 catégories + 18 sous-catégories |  |
| 005 | `005_add_metadata.sql` | Colonne metadata JSONB + index GIN | ⬜ |
| 006 | `006_seed_items_part1.sql` | 3 users démo + ~30 items (Immobilier, Véhicules, Électronique) | ⬜ |
| 007 | `007_seed_items_part2.sql` | ~45 items (Événementiel, Outillage, Sport, Mode) | ⬜ |
| 008 | `008_seed_items_part3.sql` | ~35 items (Mobilier, Électroménager, Bébé, Livres, Santé) + prix vente/troc | ⬜ |
