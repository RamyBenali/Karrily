-- ╔═══════════════════════════════════════════════════════════════╗
-- ║  Karrily — Migration 008 : Seed Items (Part 3/3)            ║
-- ║  Mobilier, Électroménager, Bébé, Livres, Santé, Autres      ║
-- ╚═══════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════
-- MOBILIER (~10 items)
-- ═══════════════════════════════════════════════════════
INSERT INTO public.items (title, description, listing_type, category_id, owner_id, condition, price_per_day, price_per_week, deposit_amount, wilaya_code, location, status, is_available, images, thumbnail_url, metadata, tags) VALUES
('Canapé 3 places cuir noir', 'Canapé en cuir véritable, 3 places, confortable et élégant. Idéal salon moderne.', 'sell', (SELECT id FROM categories WHERE slug='mobilier'), 'a0000000-0000-0000-0000-000000000001', 'good', NULL, NULL, NULL, 16, 'Alger, 16', 'active', true, ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'], 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800', '{}', ARRAY['canapé','cuir','salon']),
('Bureau ergonomique réglable', 'Bureau sit-stand électrique 140x70cm, blanc. Parfait pour télétravail.', 'rent', (SELECT id FROM categories WHERE slug='mobilier'), 'a0000000-0000-0000-0000-000000000002', 'like_new', 800, 4000, 15000, 16, 'Alger, 16', 'active', true, ARRAY['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800'], 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800', '{}', ARRAY['bureau','ergonomique','télétravail']),
('Lit double avec matelas orthopédique', 'Lit 160x200 avec sommier et matelas orthopédique. Excellent état.', 'sell', (SELECT id FROM categories WHERE slug='mobilier'), 'a0000000-0000-0000-0000-000000000003', 'good', NULL, NULL, NULL, 31, 'Oran, 31', 'active', true, ARRAY['https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800'], 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800', '{}', ARRAY['lit','matelas','chambre']),
('Étagère bibliothèque bois massif', 'Grande bibliothèque en bois massif, 5 étagères, style scandinave. H180xL120cm.', 'sell', (SELECT id FROM categories WHERE slug='mobilier'), 'a0000000-0000-0000-0000-000000000001', 'good', NULL, NULL, NULL, 25, 'Constantine, 25', 'active', true, ARRAY['https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800'], 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800', '{}', ARRAY['bibliothèque','bois','rangement']),
('Table à manger 8 personnes', 'Grande table en bois avec rallonge, peut accueillir 6 à 8 personnes. Style rustique chic.', 'rent', (SELECT id FROM categories WHERE slug='mobilier'), 'a0000000-0000-0000-0000-000000000002', 'good', 1500, 8000, 20000, 19, 'Sétif, 19', 'active', true, ARRAY['https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800'], 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800', '{}', ARRAY['table','bois','salle à manger']);

-- ═══════════════════════════════════════════════════════
-- ÉLECTROMÉNAGER (~10 items)
-- ═══════════════════════════════════════════════════════
INSERT INTO public.items (title, description, listing_type, category_id, owner_id, condition, price_per_day, price_per_week, deposit_amount, wilaya_code, location, status, is_available, images, thumbnail_url, metadata, tags) VALUES
('Machine à laver Samsung 9kg', 'Samsung AddWash 9kg, 1400tr/min, programme vapeur. Très bon état.', 'sell', (SELECT id FROM categories WHERE slug='electromenager'), 'a0000000-0000-0000-0000-000000000001', 'good', NULL, NULL, NULL, 16, 'Alger, 16', 'active', true, ARRAY['https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800'], 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800', '{"type":"machine_laver","energy_class":"A+++"}', ARRAY['machine','Samsung','laver']),
('Climatiseur Midea 12000 BTU', 'Climatiseur split Midea, chaud/froid, très silencieux. Installation non incluse.', 'sell', (SELECT id FROM categories WHERE slug='electromenager'), 'a0000000-0000-0000-0000-000000000002', 'good', NULL, NULL, NULL, 31, 'Oran, 31', 'active', true, ARRAY['https://images.unsplash.com/photo-1585338107529-13afc25806f2?w=800'], 'https://images.unsplash.com/photo-1585338107529-13afc25806f2?w=800', '{"type":"climatiseur","energy_class":"A++"}', ARRAY['climatiseur','Midea','froid']),
('Réfrigérateur LG No Frost 450L', 'Réfrigérateur combiné LG 450L, distributeur deau, inox. Économe en énergie.', 'sell', (SELECT id FROM categories WHERE slug='electromenager'), 'a0000000-0000-0000-0000-000000000003', 'good', NULL, NULL, NULL, 25, 'Constantine, 25', 'active', true, ARRAY['https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800'], 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800', '{"type":"refrigerateur","energy_class":"A+"}', ARRAY['réfrigérateur','LG','inox']),
('Robot pâtissier KitchenAid', 'KitchenAid Artisan 4.8L, fouet, crochet, batteur. Couleur rouge. Presque neuf.', 'rent', (SELECT id FROM categories WHERE slug='electromenager'), 'a0000000-0000-0000-0000-000000000001', 'like_new', 1500, 8000, 20000, 16, 'Alger, 16', 'active', true, ARRAY['https://images.unsplash.com/photo-1594385208974-2f8bb07dcc73?w=800'], 'https://images.unsplash.com/photo-1594385208974-2f8bb07dcc73?w=800', '{"type":"four","energy_class":"A"}', ARRAY['KitchenAid','pâtisserie','robot']);

-- ═══════════════════════════════════════════════════════
-- BÉBÉ & ENFANTS (~8 items)
-- ═══════════════════════════════════════════════════════
INSERT INTO public.items (title, description, listing_type, category_id, owner_id, condition, price_per_day, price_per_week, deposit_amount, wilaya_code, location, status, is_available, images, thumbnail_url, metadata, tags) VALUES
('Poussette Bugaboo Fox 3', 'Poussette Bugaboo Fox 3 tout terrain, nacelle + siège, pare-soleil. Comme neuve.', 'rent', (SELECT id FROM categories WHERE slug='bebe-enfants'), 'a0000000-0000-0000-0000-000000000002', 'like_new', 1000, 5000, 15000, 16, 'Alger, 16', 'active', true, ARRAY['https://images.unsplash.com/photo-1586982526557-1356b3397a6c?w=800'], 'https://images.unsplash.com/photo-1586982526557-1356b3397a6c?w=800', '{}', ARRAY['poussette','bébé','Bugaboo']),
('Lit bébé évolutif + matelas', 'Lit bébé 60x120, transformable en lit enfant, avec matelas bio. Bois naturel.', 'sell', (SELECT id FROM categories WHERE slug='bebe-enfants'), 'a0000000-0000-0000-0000-000000000003', 'good', NULL, NULL, NULL, 19, 'Sétif, 19', 'active', true, ARRAY['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800'], 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800', '{}', ARRAY['lit bébé','évolutif','bois']),
('Château gonflable enfants', 'Château gonflable 4x3m avec toboggan, soufflerie incluse. Parfait anniversaires.', 'rent', (SELECT id FROM categories WHERE slug='bebe-enfants'), 'a0000000-0000-0000-0000-000000000001', 'good', 5000, NULL, 20000, 9, 'Blida, 9', 'active', true, ARRAY['https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=800'], 'https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=800', '{}', ARRAY['gonflable','anniversaire','enfants']),
('Lot jouets éducatifs 2-5 ans (échange)', 'Grand lot de jouets éducatifs Montessori. Échange contre jouets 6-10 ans.', 'troc', (SELECT id FROM categories WHERE slug='bebe-enfants'), 'a0000000-0000-0000-0000-000000000002', 'good', NULL, NULL, NULL, 16, 'Alger, 16', 'active', true, ARRAY['https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800'], 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800', '{}', ARRAY['jouets','Montessori','éducatif']);

-- ═══════════════════════════════════════════════════════
-- LIVRES & ÉDUCATION (~8 items)
-- ═══════════════════════════════════════════════════════
INSERT INTO public.items (title, description, listing_type, category_id, owner_id, condition, price_per_day, price_per_week, deposit_amount, wilaya_code, location, status, is_available, images, thumbnail_url, metadata, tags) VALUES
('Lot manuels médecine 4ème année', 'Collection complète manuels médecine 4ème année. Bon état, quelques surlignages.', 'sell', (SELECT id FROM categories WHERE slug='livres-education'), 'a0000000-0000-0000-0000-000000000003', 'good', NULL, NULL, NULL, 25, 'Constantine, 25', 'active', true, ARRAY['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800'], 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800', '{}', ARRAY['médecine','manuels','université']),
('Piano numérique Yamaha P-125', 'Piano numérique 88 touches, toucher lourd, pédale sustain, support inclus. Son réaliste.', 'rent', (SELECT id FROM categories WHERE slug='livres-education'), 'a0000000-0000-0000-0000-000000000001', 'like_new', 1500, 8000, 25000, 16, 'Alger, 16', 'active', true, ARRAY['https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800'], 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800', '{}', ARRAY['piano','Yamaha','musique']),
('Guitare acoustique Martin (échange)', 'Guitare Martin D-28 en excellent état. Échange contre guitare électrique Fender ou Gibson.', 'troc', (SELECT id FROM categories WHERE slug='livres-education'), 'a0000000-0000-0000-0000-000000000002', 'good', NULL, NULL, NULL, 31, 'Oran, 31', 'active', true, ARRAY['https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800'], 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800', '{}', ARRAY['guitare','Martin','acoustique']),
('Collection livres développement personnel', '20 livres dveloppement personnel et business. Atomic Habits, Think Fast, Deep Work, etc.', 'sell', (SELECT id FROM categories WHERE slug='livres-education'), 'a0000000-0000-0000-0000-000000000003', 'good', NULL, NULL, NULL, 16, 'Alger, 16', 'active', true, ARRAY['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800'], 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800', '{}', ARRAY['livres','développement','business']);

-- ═══════════════════════════════════════════════════════
-- SANTÉ & BIEN-ÊTRE (~5 items)
-- ═══════════════════════════════════════════════════════
INSERT INTO public.items (title, description, listing_type, category_id, owner_id, condition, price_per_day, price_per_week, deposit_amount, wilaya_code, location, status, is_available, images, thumbnail_url, metadata, tags) VALUES
('Fauteuil roulant électrique', 'Fauteuil roulant électrique pliable, autonomie 25km, charge max 120kg.', 'rent', (SELECT id FROM categories WHERE slug='sante-bien-etre'), 'a0000000-0000-0000-0000-000000000001', 'good', 2000, 10000, 30000, 16, 'Alger, 16', 'active', true, ARRAY['https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800'], 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800', '{}', ARRAY['fauteuil roulant','mobilité','médical']),
('Concentrateur oxygène portable', 'Concentrateur doxygène portable 5L/min, silencieux, batterie 4h. Avec sac de transport.', 'rent', (SELECT id FROM categories WHERE slug='sante-bien-etre'), 'a0000000-0000-0000-0000-000000000002', 'like_new', 3000, 15000, 40000, 19, 'Sétif, 19', 'active', true, ARRAY['https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800'], 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800', '{}', ARRAY['oxygène','médical','portable']),
('Table de massage pliante pro', 'Table de massage aluminium, pliante, avec housse et appuie-tête. Confortable et légère.', 'rent', (SELECT id FROM categories WHERE slug='sante-bien-etre'), 'a0000000-0000-0000-0000-000000000003', 'good', 1000, 5000, 10000, 31, 'Oran, 31', 'active', true, ARRAY['https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800'], 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800', '{}', ARRAY['massage','bien-être','portable']);

-- ═══════════════════════════════════════════════════════
-- PRIX POUR ITEMS EN VENTE
-- ═══════════════════════════════════════════════════════
UPDATE public.items SET sale_price = 85000 WHERE title = 'Canapé 3 places cuir noir';
UPDATE public.items SET sale_price = 45000 WHERE title = 'Lit double avec matelas orthopédique';
UPDATE public.items SET sale_price = 25000 WHERE title = 'Étagère bibliothèque bois massif';
UPDATE public.items SET sale_price = 65000 WHERE title = 'Machine à laver Samsung 9kg';
UPDATE public.items SET sale_price = 45000 WHERE title = 'Climatiseur Midea 12000 BTU';
UPDATE public.items SET sale_price = 80000 WHERE title = 'Réfrigérateur LG No Frost 450L';
UPDATE public.items SET sale_price = 20000 WHERE title = 'Lit bébé évolutif + matelas';
UPDATE public.items SET sale_price = 8000 WHERE title = 'Lot manuels médecine 4ème année';
UPDATE public.items SET sale_price = 5000 WHERE title = 'Collection livres développement personnel';

-- Sets troc info
UPDATE public.items SET troc_description = 'Échange contre jouets 6-10 ans en bon état', troc_estimated_value = 8000 WHERE title LIKE '%Lot jouets éducatifs%';
UPDATE public.items SET troc_description = 'Échange contre guitare électrique Fender ou Gibson', troc_estimated_value = 120000 WHERE title LIKE '%Guitare acoustique Martin%';

-- ═══════════════════════════════════════════════════════
-- FIN DES SEED DATA
-- ═══════════════════════════════════════════════════════
