-- Change reports foreign keys from CASCADE to SET NULL
-- This allows keeping traces of reports even after deletion of the target

ALTER TABLE public.reports 
DROP CONSTRAINT IF EXISTS reports_reported_item_id_fkey,
DROP CONSTRAINT IF EXISTS reports_reported_user_id_fkey,
DROP CONSTRAINT IF EXISTS reports_reported_review_id_fkey;

ALTER TABLE public.reports
ADD CONSTRAINT reports_reported_item_id_fkey 
    FOREIGN KEY (reported_item_id) 
    REFERENCES public.items(id) 
    ON DELETE SET NULL,
ADD CONSTRAINT reports_reported_user_id_fkey 
    FOREIGN KEY (reported_user_id) 
    REFERENCES public.profiles(id) 
    ON DELETE SET NULL,
ADD CONSTRAINT reports_reported_review_id_fkey 
    FOREIGN KEY (reported_review_id) 
    REFERENCES public.reviews(id) 
    ON DELETE SET NULL;
