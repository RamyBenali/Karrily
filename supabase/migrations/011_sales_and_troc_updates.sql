-- ╔═══════════════════════════════════════════════════════════════╗
-- ║  Karrily — Migration 011 : Sales & Troc Enhancements        ║
-- ║  À exécuter dans : Supabase Dashboard → SQL Editor           ║
-- ╚═══════════════════════════════════════════════════════════════╝

BEGIN;

-- 1. Création de la table sales
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  price NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'DZD',
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'accepted', 'completed', 'cancelled', 'rejected'
  )),
  
  message TEXT,
  delivery_info TEXT, -- Infos pour organiser la livraison
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT no_self_sale CHECK (buyer_id != seller_id)
);

CREATE INDEX IF NOT EXISTS idx_sales_item ON public.sales(item_id);
CREATE INDEX IF NOT EXISTS idx_sales_buyer ON public.sales(buyer_id);
CREATE INDEX IF NOT EXISTS idx_sales_seller ON public.sales(seller_id);
CREATE INDEX IF NOT EXISTS idx_sales_status ON public.sales(status);

-- 2. Mise à jour de troc_proposals
ALTER TABLE public.troc_proposals 
ADD COLUMN IF NOT EXISTS offered_item_data JSONB DEFAULT '{}';

-- 3. Activer RLS pour sales
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour sales
CREATE POLICY "Users can view their own sales as buyer or seller" 
  ON public.sales FOR SELECT 
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can create sale requests" 
  ON public.sales FOR INSERT 
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Relevant parties can update sale status" 
  ON public.sales FOR UPDATE 
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- 4. Activer Realtime pour sales et troc_proposals
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'sales'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.sales;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'troc_proposals'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.troc_proposals;
  END IF;
END $$;

COMMIT;
