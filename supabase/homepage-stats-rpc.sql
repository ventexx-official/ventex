-- Public read policies (idempotent on Postgres 15+)
CREATE POLICY IF NOT EXISTS "Public read live pitches"
  ON public.pitches
  FOR SELECT
  USING (status = 'live');

CREATE POLICY IF NOT EXISTS "Public read live products"
  ON public.products
  FOR SELECT
  USING (status = 'live');

-- Homepage aggregates (bypasses users RLS for counts only)
CREATE OR REPLACE FUNCTION public.get_homepage_stats()
RETURNS TABLE(live_pitches bigint, investors bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT COUNT(*)::bigint FROM public.pitches WHERE status = 'live'),
    (SELECT COUNT(*)::bigint FROM public.users WHERE role = 'investor');
$$;

GRANT EXECUTE ON FUNCTION public.get_homepage_stats() TO anon, authenticated;
