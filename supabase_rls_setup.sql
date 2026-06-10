-- ==========================================
-- VENTEX SUPABASE RLS SECURITY POLICIES
-- ==========================================
-- WARNING: Run this in your Supabase SQL Editor to secure your database.
-- It enforces that users can only modify their own data.

-- 1. USERS TABLE
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" 
ON public.users FOR SELECT 
USING (true);

CREATE POLICY "Users can update own profile" 
ON public.users FOR UPDATE 
USING (auth.uid() = id);

-- 2. PITCHES TABLE
ALTER TABLE public.pitches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view live pitches" 
ON public.pitches FOR SELECT 
USING (status = 'live' OR founder_id = auth.uid());

CREATE POLICY "Founders can insert own pitches" 
ON public.pitches FOR INSERT 
WITH CHECK (founder_id = auth.uid());

CREATE POLICY "Founders can update own pitches" 
ON public.pitches FOR UPDATE 
USING (founder_id = auth.uid());

CREATE POLICY "Founders can delete own pitches" 
ON public.pitches FOR DELETE 
USING (founder_id = auth.uid());

-- 3. PRODUCTS TABLE (Marketplace)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view live products" 
ON public.products FOR SELECT 
USING (status = 'live' OR status = 'published' OR seller_id = auth.uid());

CREATE POLICY "Sellers can insert own products" 
ON public.products FOR INSERT 
WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Sellers can update own products" 
ON public.products FOR UPDATE 
USING (seller_id = auth.uid());

CREATE POLICY "Sellers can delete own products" 
ON public.products FOR DELETE 
USING (seller_id = auth.uid());

-- 4. ORDERS & TRANSACTIONS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers and sellers can view their orders" 
ON public.orders FOR SELECT 
USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- NOTE: Inserts/Updates to orders should ideally be done ONLY via the secure 
-- Server API (Service Role key) after Stripe checkout completes. 
-- Disallowing direct client inserts prevents forged orders.
CREATE POLICY "Clients cannot insert orders directly" 
ON public.orders FOR INSERT 
WITH CHECK (false);

CREATE POLICY "Clients cannot update orders directly" 
ON public.orders FOR UPDATE 
USING (false);

-- 5. REVIEWS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" 
ON public.reviews FOR SELECT 
USING (true);

CREATE POLICY "Buyers can insert reviews" 
ON public.reviews FOR INSERT 
WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Buyers can update their reviews" 
ON public.reviews FOR UPDATE 
USING (buyer_id = auth.uid());

CREATE POLICY "Buyers can delete their reviews" 
ON public.reviews FOR DELETE 
USING (buyer_id = auth.uid());


