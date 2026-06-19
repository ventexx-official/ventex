-- ====================================================================
-- Ventex Production Audit Fix Migration
-- 
-- Fixes:
-- 1. Missing admin RLS policies for pitches (ROOT CAUSE of dashboard/queue inconsistency)
-- 2. Missing admin RLS policies for all other tables
-- 3. Missing tables (deals, blacklist, sponsorships, feature_flags, data_room_agreements)
-- 4. Missing indexes
-- 
-- Run: Execute in Supabase SQL Editor
-- ====================================================================

BEGIN;

-- ====================================================================
-- PART 1: CREATE MISSING TABLES
-- ====================================================================

-- 1.1 feature_flags table (referenced by admin dashboard)
CREATE TABLE IF NOT EXISTS public.feature_flags (
  key text PRIMARY KEY,
  enabled boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- 1.2 deals table (referenced by admin/deals page and pitch detail page)
CREATE TABLE IF NOT EXISTS public.deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE SET NULL,
  founder_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  investor_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  conversation_id uuid,
  agreed_amount bigint,
  status text DEFAULT 'interested',
  due_date timestamptz,
  paid_at timestamptz,
  partial_unlock_until timestamptz,
  investor_credit_until timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- 1.3 blacklist table (referenced by admin/deals page)
CREATE TABLE IF NOT EXISTS public.blacklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  email text,
  pan_number text,
  reason text,
  banned_at timestamptz DEFAULT now()
);

ALTER TABLE public.blacklist ENABLE ROW LEVEL SECURITY;

-- 1.4 sponsorships table (referenced by discover page)
CREATE TABLE IF NOT EXISTS public.sponsorships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  description text,
  link_url text,
  image_url text,
  type text DEFAULT 'startup',
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.sponsorships ENABLE ROW LEVEL SECURITY;

-- 1.5 data_room_agreements table (referenced by pitch detail page)
CREATE TABLE IF NOT EXISTS public.data_room_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
  agreed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, pitch_id)
);

ALTER TABLE public.data_room_agreements ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- PART 2: ADD ADMIN RLS POLICIES FOR ALL TABLES
-- 
-- CRITICAL: Pitches table was missing admin policy (ROOT CAUSE of 
-- inconsistency between admin dashboard and moderation queue).
-- ====================================================================

-- Helper function: check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  );
$$;

-- 2.1 PITCHES - Add admin override policies (CRITICAL MISSING POLICY)
DROP POLICY IF EXISTS "Allow admins to manage all pitches" ON public.pitches;
CREATE POLICY "Allow admins to manage all pitches"
  ON public.pitches
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Allow admins to select all pitches" ON public.pitches;
CREATE POLICY "Allow admins to select all pitches"
  ON public.pitches
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- 2.2 USERS - Add admin read policy
DROP POLICY IF EXISTS "Allow admins to read all users" ON public.users;
CREATE POLICY "Allow admins to read all users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Allow admins to update all users" ON public.users;
CREATE POLICY "Allow admins to update all users"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2.3 COMMENTS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admins to manage comments" ON public.comments;
CREATE POLICY "Allow admins to manage comments"
  ON public.comments
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2.4 CART_ITEMS
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admins to manage cart_items" ON public.cart_items;
CREATE POLICY "Allow admins to manage cart_items"
  ON public.cart_items
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2.5 NOTIFICATIONS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admins to manage notifications" ON public.notifications;
CREATE POLICY "Allow admins to manage notifications"
  ON public.notifications
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2.6 PITCH_SCORES
ALTER TABLE public.pitch_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admins to manage pitch_scores" ON public.pitch_scores;
CREATE POLICY "Allow admins to manage pitch_scores"
  ON public.pitch_scores
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2.7 INVESTOR_INTERESTS
DROP POLICY IF EXISTS "Allow admins to manage investor_interests" ON public.investor_interests;
CREATE POLICY "Allow admins to manage investor_interests"
  ON public.investor_interests
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2.8 DEAL_ROOM_MESSAGES
DROP POLICY IF EXISTS "Allow admins to manage deal_room_messages" ON public.deal_room_messages;
CREATE POLICY "Allow admins to manage deal_room_messages"
  ON public.deal_room_messages
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2.9 ORDER
DROP POLICY IF EXISTS "Allow admins to manage orders" ON public.orders;
CREATE POLICY "Allow admins to manage orders"
  ON public.orders
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2.10 REVIEWS
DROP POLICY IF EXISTS "Allow admins to manage reviews" ON public.reviews;
CREATE POLICY "Allow admins to manage reviews"
  ON public.reviews
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2.11 DISPUTES
DROP POLICY IF EXISTS "Allow admins to manage disputes" ON public.disputes;
CREATE POLICY "Allow admins to manage disputes"
  ON public.disputes
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2.12 SAVED_PITCHES
DROP POLICY IF EXISTS "Allow admins to manage saved_pitches" ON public.saved_pitches;
CREATE POLICY "Allow admins to manage saved_pitches"
  ON public.saved_pitches
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2.13 PROJET_REQUESTS
ALTER TABLE public.project_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admins to manage project_requests" ON public.project_requests;
CREATE POLICY "Allow admins to manage project_requests"
  ON public.project_requests
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2.14 DEALS
DROP POLICY IF EXISTS "Allow admins to manage deals" ON public.deals;
CREATE POLICY "Allow admins to manage deals"
  ON public.deals
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2.15 BLACKLIST
DROP POLICY IF EXISTS "Allow admins to manage blacklist" ON public.blacklist;
CREATE POLICY "Allow admins to manage blacklist"
  ON public.blacklist
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2.16 SPONSORSHIPS
DROP POLICY IF EXISTS "Allow admins to manage sponsorships" ON public.sponsorships;
CREATE POLICY "Allow admins to manage sponsorships"
  ON public.sponsorships
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2.17 FEATURE_FLAGS
DROP POLICY IF EXISTS "Allow admins to manage feature_flags" ON public.feature_flags;
CREATE POLICY "Allow admins to manage feature_flags"
  ON public.feature_flags
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2.18 DATA_ROOM_AGREEMENTS
DROP POLICY IF EXISTS "Allow admins to manage data_room_agreements" ON public.data_room_agreements;
CREATE POLICY "Allow admins to manage data_room_agreements"
  ON public.data_room_agreements
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 2.19 CATALYSTS
ALTER TABLE public.catalysts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow admins to manage catalysts" ON public.catalysts;
CREATE POLICY "Allow admins to manage catalysts"
  ON public.catalysts
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ====================================================================
-- PART 3: PUBLIC READ POLICIES FOR NEW TABLES
-- ====================================================================

DROP POLICY IF EXISTS "Public read sponsorships" ON public.sponsorships;
CREATE POLICY "Public read sponsorships"
  ON public.sponsorships
  FOR SELECT
  USING (is_active = true);

-- ====================================================================
-- PART 4: ADD MISSING INDEXES
-- ====================================================================

CREATE INDEX IF NOT EXISTS idx_pitches_status ON public.pitches(status);
CREATE INDEX IF NOT EXISTS idx_pitches_founder_id ON public.pitches(founder_id);
CREATE INDEX IF NOT EXISTS idx_pitches_industry ON public.pitches(industry);
CREATE INDEX IF NOT EXISTS idx_pitches_created_at ON public.pitches(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON public.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_pitch_id ON public.products(pitch_id);

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON public.orders(seller_id);

CREATE INDEX IF NOT EXISTS idx_investor_interests_pitch_id ON public.investor_interests(pitch_id);
CREATE INDEX IF NOT EXISTS idx_investor_interests_investor_id ON public.investor_interests(investor_id);

CREATE INDEX IF NOT EXISTS idx_comments_pitch_id ON public.comments(pitch_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_deals_pitch_id ON public.deals(pitch_id);
CREATE INDEX IF NOT EXISTS idx_deals_founder_id ON public.deals(founder_id);
CREATE INDEX IF NOT EXISTS idx_deals_investor_id ON public.deals(investor_id);

-- ====================================================================
-- PART 5: ADD MISSING COLUMNS
-- ====================================================================

-- verified_founder column for admin users page
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS verified_founder boolean DEFAULT false;

-- ====================================================================
-- Reload PostgREST Schema Cache
-- ====================================================================
NOTIFY pgrst, 'reload schema';

COMMIT;
