-- Drop the existing constraint
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_status_check;

-- Add the new constraint with 'ignored' and 'dismissed'
ALTER TABLE public.reports ADD CONSTRAINT reports_status_check CHECK (status IN ('pending', 'resolved', 'ignored', 'dismissed'));
