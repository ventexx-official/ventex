-- ====================================================================
-- Ventex Database Migrations: Store Products & Promo Codes (Day 46)
-- Execute this script in your Supabase SQL Editor to enable product listing
-- and promo code generation.
-- ====================================================================

-- 1. Alter promo_codes table to add missing is_active column
ALTER TABLE public.promo_codes ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- 2. Setup RLS Policies for public.products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow public to select live products
DROP POLICY IF EXISTS "Allow public select on live products" ON public.products;
CREATE POLICY "Allow public select on live products"
  ON public.products FOR SELECT
  USING (status = 'live');

-- Allow sellers to see their own products (even if pending or rejected)
DROP POLICY IF EXISTS "Allow sellers to select their own products" ON public.products;
CREATE POLICY "Allow sellers to select their own products"
  ON public.products FOR SELECT
  TO authenticated
  USING (auth.uid() = seller_id);

-- Allow authenticated users to insert their own products
DROP POLICY IF EXISTS "Allow sellers to insert their own products" ON public.products;
CREATE POLICY "Allow sellers to insert their own products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

-- Allow authenticated users to update their own products (e.g. deals, edits)
DROP POLICY IF EXISTS "Allow sellers to update their own products" ON public.products;
CREATE POLICY "Allow sellers to update their own products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id);

-- Allow authenticated users to delete their own products
DROP POLICY IF EXISTS "Allow sellers to delete their own products" ON public.products;
CREATE POLICY "Allow sellers to delete their own products"
  ON public.products FOR DELETE
  TO authenticated
  USING (auth.uid() = seller_id);

-- Allow admins to read all products
DROP POLICY IF EXISTS "Allow admins to select all products" ON public.products;
CREATE POLICY "Allow admins to select all products"
  ON public.products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Allow admins to perform any actions on all products
DROP POLICY IF EXISTS "Allow admins to manage all products" ON public.products;
CREATE POLICY "Allow admins to manage all products"
  ON public.products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );


-- 3. Setup RLS Policies for public.promo_codes
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active, non-expired promo codes (for checkout validation)
DROP POLICY IF EXISTS "Allow public read access to promo codes" ON public.promo_codes;
CREATE POLICY "Allow public read access to promo codes"
  ON public.promo_codes FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Allow sellers to see their own promo codes
DROP POLICY IF EXISTS "Allow sellers to select their own promo codes" ON public.promo_codes;
CREATE POLICY "Allow sellers to select their own promo codes"
  ON public.promo_codes FOR SELECT
  TO authenticated
  USING (auth.uid() = seller_id);

-- Allow sellers to insert their own promo codes
DROP POLICY IF EXISTS "Allow sellers to insert their own promo codes" ON public.promo_codes;
CREATE POLICY "Allow sellers to insert their own promo codes"
  ON public.promo_codes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

-- Allow sellers to update their own promo codes (e.g. toggle active/inactive)
DROP POLICY IF EXISTS "Allow sellers to update their own promo codes" ON public.promo_codes;
CREATE POLICY "Allow sellers to update their own promo codes"
  ON public.promo_codes FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id);

-- Allow sellers to delete their own promo codes
DROP POLICY IF EXISTS "Allow sellers to delete their own promo codes" ON public.promo_codes;
CREATE POLICY "Allow sellers to delete their own promo codes"
  ON public.promo_codes FOR DELETE
  TO authenticated
  USING (auth.uid() = seller_id);

-- Allow admins to manage all promo codes
DROP POLICY IF EXISTS "Allow admins to manage all promo codes" ON public.promo_codes;
CREATE POLICY "Allow admins to manage all promo codes"
  ON public.promo_codes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Reload PostgREST Schema Cache to recognize new columns/policies
NOTIFY pgrst, 'reload schema';
