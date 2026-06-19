-- ============================================================
-- Ventex – Idempotent Migration
-- Run this safely multiple times; it will not error if objects
-- already exist.
-- ============================================================

-- ─── Missing Tables ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
  investor_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  founder_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  amount bigint,
  equity_percent numeric,
  status text DEFAULT 'pending'::text,
  due_date timestamptz,
  paid_at timestamptz,
  partial_unlock_until timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.blacklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  reason text,
  added_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  banned_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sponsorships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_name text,
  sponsor_url text,
  image_url text,
  amount bigint,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.feature_flags (
  id text PRIMARY KEY,
  enabled boolean DEFAULT false,
  description text,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.data_room_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
  investor_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  agreed_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  slug text UNIQUE,
  summary text,
  content text,
  image_url text,
  source_name text,
  source_url text,
  tags text[],
  is_published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ─── RLS Enablement (safe to run multiple times) ─────────────
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_room_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pitch_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_room_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalysts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_requests ENABLE ROW LEVEL SECURITY;

-- ─── Drop existing policies before recreating ────────────────
-- (PostgreSQL has no CREATE POLICY IF NOT EXISTS)
DROP POLICY IF EXISTS "Users manage own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users read own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users manage own project requests" ON public.project_requests;
DROP POLICY IF EXISTS "Public read comments" ON public.comments;
DROP POLICY IF EXISTS "Public read sponsorships" ON public.sponsorships;
DROP POLICY IF EXISTS "Public read articles" ON public.articles;
DROP POLICY IF EXISTS "Public read catalysts" ON public.catalysts;
DROP POLICY IF EXISTS "Founders read pitch scores" ON public.pitch_scores;
DROP POLICY IF EXISTS "Allow admins to manage all users" ON public.users;
DROP POLICY IF EXISTS "Allow admins to manage all pitches" ON public.pitches;
DROP POLICY IF EXISTS "Allow admins to manage all deals" ON public.deals;
DROP POLICY IF EXISTS "Allow admins to manage blacklist" ON public.blacklist;
DROP POLICY IF EXISTS "Allow admins to manage sponsorships" ON public.sponsorships;
DROP POLICY IF EXISTS "Allow admins to manage feature flags" ON public.feature_flags;
DROP POLICY IF EXISTS "Allow admins to manage articles" ON public.articles;
DROP POLICY IF EXISTS "Allow admins to manage pitch scores" ON public.pitch_scores;
DROP POLICY IF EXISTS "Allow admins to manage comments" ON public.comments;

-- ─── Base RLS Policies ───────────────────────────────────────
CREATE POLICY "Users manage own cart items"
  ON public.cart_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage own project requests"
  ON public.project_requests FOR ALL
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Public read comments"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Public read sponsorships"
  ON public.sponsorships FOR SELECT
  USING (true);

CREATE POLICY "Public read articles"
  ON public.articles FOR SELECT
  USING (true);

CREATE POLICY "Public read catalysts"
  ON public.catalysts FOR SELECT
  USING (true);

CREATE POLICY "Founders read pitch scores"
  ON public.pitch_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pitches p
      WHERE p.id = pitch_id
        AND p.founder_id = auth.uid()
    )
  );

-- ─── Admin Override Policies ─────────────────────────────────
CREATE POLICY "Allow admins to manage all users"
  ON public.users FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Allow admins to manage all pitches"
  ON public.pitches FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Allow admins to manage all deals"
  ON public.deals FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Allow admins to manage blacklist"
  ON public.blacklist FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Allow admins to manage sponsorships"
  ON public.sponsorships FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Allow admins to manage feature flags"
  ON public.feature_flags FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Allow admins to manage articles"
  ON public.articles FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Allow admins to manage pitch scores"
  ON public.pitch_scores FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Allow admins to manage comments"
  ON public.comments FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
