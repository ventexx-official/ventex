-- Fix infinite recursion on users table

-- 1. Create a security definer function to check admin status
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
DECLARE
  _is_admin BOOLEAN;
BEGIN
  SELECT (role = 'admin' OR is_admin = true) INTO _is_admin
  FROM public.users
  WHERE id = auth.uid();
  
  RETURN COALESCE(_is_admin, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the recursive policies
DROP POLICY IF EXISTS "Allow admins to manage all users" ON public.users;
DROP POLICY IF EXISTS "Allow admins to manage all pitches" ON public.pitches;
DROP POLICY IF EXISTS "Allow admins to manage all deals" ON public.deals;
DROP POLICY IF EXISTS "Allow admins to manage blacklist" ON public.blacklist;
DROP POLICY IF EXISTS "Allow admins to manage sponsorships" ON public.sponsorships;
DROP POLICY IF EXISTS "Allow admins to manage feature flags" ON public.feature_flags;
DROP POLICY IF EXISTS "Allow admins to manage articles" ON public.articles;
DROP POLICY IF EXISTS "Allow admins to manage pitch scores" ON public.pitch_scores;
DROP POLICY IF EXISTS "Allow admins to manage comments" ON public.comments;
DROP POLICY IF EXISTS "Allow admins to manage promo codes" ON public.promo_codes;

-- 3. Recreate them using the security definer function to avoid recursion
CREATE POLICY "Allow admins to manage all users"
  ON public.users FOR ALL
  USING (public.is_current_user_admin());

CREATE POLICY "Allow admins to manage all pitches"
  ON public.pitches FOR ALL
  USING (public.is_current_user_admin());

CREATE POLICY "Allow admins to manage all deals"
  ON public.deals FOR ALL
  USING (public.is_current_user_admin());

CREATE POLICY "Allow admins to manage blacklist"
  ON public.blacklist FOR ALL
  USING (public.is_current_user_admin());

CREATE POLICY "Allow admins to manage sponsorships"
  ON public.sponsorships FOR ALL
  USING (public.is_current_user_admin());

CREATE POLICY "Allow admins to manage feature flags"
  ON public.feature_flags FOR ALL
  USING (public.is_current_user_admin());

CREATE POLICY "Allow admins to manage articles"
  ON public.articles FOR ALL
  USING (public.is_current_user_admin());

CREATE POLICY "Allow admins to manage pitch scores"
  ON public.pitch_scores FOR ALL
  USING (public.is_current_user_admin());

CREATE POLICY "Allow admins to manage comments"
  ON public.comments FOR ALL
  USING (public.is_current_user_admin());

CREATE POLICY "Allow admins to manage promo codes"
  ON public.promo_codes FOR ALL
  USING (public.is_current_user_admin());
