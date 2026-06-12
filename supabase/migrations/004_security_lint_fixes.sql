-- Supabase security lint fixes.
-- Apply after the existing schema/live-fix scripts.

-- 1. Lock function search_path for trigger/helper functions flagged by Supabase.
DO $$
DECLARE
  fn record;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure AS signature
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'handle_review_changes',
        'enforce_pitch_status_on_insert',
        'enforce_product_status_on_insert'
      )
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_temp', fn.signature);
  END LOOP;
END $$;

-- 2. Remove browser-role EXECUTE access from SECURITY DEFINER helpers.
-- Trigger functions still run via their triggers; this only blocks /rest/v1/rpc execution.
DO $$
DECLARE
  fn record;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure AS signature
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'append_product_question',
        'get_homepage_stats',
        'handle_new_user',
        'handle_review_changes',
        'rls_auto_enable'
      )
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC', fn.signature);
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon', fn.signature);
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM authenticated', fn.signature);
  END LOOP;
END $$;

-- 3. Replace permissive feature flag write policies with admin-only writes.
DO $$
BEGIN
  IF to_regclass('public.feature_flags') IS NOT NULL THEN
    ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Allow authenticated users to insert flags" ON public.feature_flags;
    DROP POLICY IF EXISTS "Allow authenticated users to update flags" ON public.feature_flags;
    DROP POLICY IF EXISTS "Public read feature flags" ON public.feature_flags;
    DROP POLICY IF EXISTS "Admins insert feature flags" ON public.feature_flags;
    DROP POLICY IF EXISTS "Admins update feature flags" ON public.feature_flags;

    CREATE POLICY "Public read feature flags"
      ON public.feature_flags
      FOR SELECT
      USING (true);

    CREATE POLICY "Admins insert feature flags"
      ON public.feature_flags
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.users
          WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
      );

    CREATE POLICY "Admins update feature flags"
      ON public.feature_flags
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.users
          WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.users
          WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
      );
  END IF;
END $$;
