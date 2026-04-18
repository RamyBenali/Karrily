-- public.increment_view_count
CREATE OR REPLACE FUNCTION public.increment_view_count(item_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.items
  SET view_count = view_count + 1
  WHERE id = item_id_param;
END;
$$;
