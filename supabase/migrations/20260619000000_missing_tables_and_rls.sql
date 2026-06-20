-- ============================================================
-- Ventex – Idempotent Migration v2
-- Run safely multiple times; no errors on repeat execution.
-- ============================================================

-- ─── Missing Tables ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.deals (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  pitch_id              uuid        REFERENCES public.pitches(id) ON DELETE CASCADE,
  investor_id           uuid        REFERENCES public.users(id)  ON DELETE CASCADE,
  founder_id            uuid        REFERENCES public.users(id)  ON DELETE CASCADE,
  amount                bigint,
  equity_percent        numeric,
  status                text        DEFAULT 'pending'::text,
  due_date              timestamptz,
  paid_at               timestamptz,
  partial_unlock_until  timestamptz,
  notes                 text,
  created_at            timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.blacklist (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        REFERENCES public.users(id) ON DELETE CASCADE,
  reason     text,
  added_by   uuid        REFERENCES public.users(id) ON DELETE SET NULL,
  banned_at  timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- sponsorships: all columns match SponsoredCard props + discover/marketplace queries
CREATE TABLE IF NOT EXISTS public.sponsorships (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_name text,
  title        text,
  description  text,
  sponsor_url  text,
  link_url     text,
  image_url    text,
  amount       bigint,
  is_active    boolean     DEFAULT true,
  type         text        DEFAULT 'startup',   -- 'startup' | 'marketplace' | 'homepage'
  created_at   timestamptz DEFAULT now()
);

-- feature_flags: key is the lookup column, matches admin upsert onConflict:"key"
CREATE TABLE IF NOT EXISTS public.feature_flags (
  key         text        PRIMARY KEY,
  enabled     boolean     DEFAULT false,
  description text,
  updated_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.data_room_agreements (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  pitch_id    uuid        REFERENCES public.pitches(id) ON DELETE CASCADE,
  investor_id uuid        REFERENCES public.users(id)  ON DELETE CASCADE,
  agreed_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.articles (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text,
  slug         text        UNIQUE,
  summary      text,
  content      text,
  image_url    text,
  source_name  text,
  source_url   text,
  tags         text[],
  is_published boolean     DEFAULT false,
  published_at timestamptz,
  created_at   timestamptz DEFAULT now()
);

-- promo_codes: referenced by /api/promo/validate
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  code         text        UNIQUE NOT NULL,
  discount_pct numeric     NOT NULL DEFAULT 0,
  is_active    boolean     DEFAULT true,
  max_uses     integer,
  used_count   integer     DEFAULT 0,
  expires_at   timestamptz,
  product_id   uuid        REFERENCES public.products(id) ON DELETE SET NULL,
  created_at   timestamptz DEFAULT now()
);

-- saved_pitches: referenced by investor portal stats
CREATE TABLE IF NOT EXISTS public.saved_pitches (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        REFERENCES public.users(id)    ON DELETE CASCADE,
  pitch_id   uuid        REFERENCES public.pitches(id)  ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, pitch_id)
);

-- ─── Add missing columns safely ──────────────────────────────
-- sponsorships: add is_active/type if table already existed with old schema
ALTER TABLE public.sponsorships ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE public.sponsorships ADD COLUMN IF NOT EXISTS type text DEFAULT 'startup';

-- feature_flags: add key column if table already existed with old 'id' schema
-- sponsorships: add all frontend-expected columns if table pre-existed with old schema
ALTER TABLE public.sponsorships ADD COLUMN IF NOT EXISTS title        text;
ALTER TABLE public.sponsorships ADD COLUMN IF NOT EXISTS description  text;
ALTER TABLE public.sponsorships ADD COLUMN IF NOT EXISTS link_url     text;
ALTER TABLE public.sponsorships ADD COLUMN IF NOT EXISTS is_active    boolean DEFAULT true;
ALTER TABLE public.sponsorships ADD COLUMN IF NOT EXISTS type         text    DEFAULT 'startup';
-- Rename old 'active' col to is_active (safe no-op if already correct)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sponsorships' AND column_name='active') THEN
    UPDATE public.sponsorships SET is_active = active WHERE is_active IS NULL;
  END IF;
END $$;

-- feature_flags: add key column if table pre-existed with old 'id' schema
ALTER TABLE public.feature_flags ADD COLUMN IF NOT EXISTS key text;
-- Backfill key from id where key is null (old rows used id as the key value)
UPDATE public.feature_flags SET key = id WHERE key IS NULL;

-- ─── RLS Enablement (safe to run multiple times) ─────────────
ALTER TABLE public.deals              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blacklist          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsorships       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_room_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pitch_scores       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_room_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalysts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_requests   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_pitches      ENABLE ROW LEVEL SECURITY;

-- ─── Drop existing policies before recreating ────────────────
DROP POLICY IF EXISTS "Users manage own cart items"          ON public.cart_items;
DROP POLICY IF EXISTS "Users read own notifications"         ON public.notifications;
DROP POLICY IF EXISTS "Users manage own project requests"    ON public.project_requests;
DROP POLICY IF EXISTS "Public read comments"                 ON public.comments;
DROP POLICY IF EXISTS "Public read sponsorships"             ON public.sponsorships;
DROP POLICY IF EXISTS "Public read articles"                 ON public.articles;
DROP POLICY IF EXISTS "Public read catalysts"                ON public.catalysts;
DROP POLICY IF EXISTS "Public read promo codes"              ON public.promo_codes;
DROP POLICY IF EXISTS "Users manage own saved pitches"       ON public.saved_pitches;
DROP POLICY IF EXISTS "Founders read pitch scores"           ON public.pitch_scores;
DROP POLICY IF EXISTS "Investors read own interests"         ON public.investor_interests;
DROP POLICY IF EXISTS "Allow admins to manage all users"     ON public.users;
DROP POLICY IF EXISTS "Allow admins to manage all pitches"   ON public.pitches;
DROP POLICY IF EXISTS "Allow admins to manage all deals"     ON public.deals;
DROP POLICY IF EXISTS "Allow admins to manage blacklist"     ON public.blacklist;
DROP POLICY IF EXISTS "Allow admins to manage sponsorships"  ON public.sponsorships;
DROP POLICY IF EXISTS "Allow admins to manage feature flags" ON public.feature_flags;
DROP POLICY IF EXISTS "Allow admins to manage articles"      ON public.articles;
DROP POLICY IF EXISTS "Allow admins to manage pitch scores"  ON public.pitch_scores;
DROP POLICY IF EXISTS "Allow admins to manage comments"      ON public.comments;
DROP POLICY IF EXISTS "Allow admins to manage promo codes"   ON public.promo_codes;

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
  USING (is_published = true);

CREATE POLICY "Public read catalysts"
  ON public.catalysts FOR SELECT
  USING (true);

CREATE POLICY "Public read promo codes"
  ON public.promo_codes FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users manage own saved pitches"
  ON public.saved_pitches FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Founders read pitch scores"
  ON public.pitch_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pitches p
      WHERE p.id = pitch_id
        AND p.founder_id = auth.uid()
    )
  );

CREATE POLICY "Investors read own interests"
  ON public.investor_interests FOR SELECT
  USING (auth.uid() = investor_id);

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

CREATE POLICY "Allow admins to manage promo codes"
  ON public.promo_codes FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- ─── Performance Indexes ─────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_pitches_status       ON public.pitches(status);
CREATE INDEX IF NOT EXISTS idx_pitches_founder_id   ON public.pitches(founder_id);
CREATE INDEX IF NOT EXISTS idx_deals_investor_id    ON public.deals(investor_id);
CREATE INDEX IF NOT EXISTS idx_deals_founder_id     ON public.deals(founder_id);
CREATE INDEX IF NOT EXISTS idx_deals_pitch_id       ON public.deals(pitch_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user   ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id      ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id     ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_investor_interests_investor ON public.investor_interests(investor_id);
CREATE INDEX IF NOT EXISTS idx_investor_interests_pitch    ON public.investor_interests(pitch_id);
CREATE INDEX IF NOT EXISTS idx_saved_pitches_user   ON public.saved_pitches(user_id);
CREATE INDEX IF NOT EXISTS idx_articles_slug        ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published   ON public.articles(is_published, published_at DESC);
