-- ============================================================================
-- Migration: 20261020000000_v3_clean_setup.sql
-- Description: Ventex V3 Clean Database Setup & Schema Hardening
-- Safety: Safe for databases with existing data. No DROP TABLE, TRUNCATE,
--         DELETE FROM, or DROP COLUMN. Uses CREATE TABLE IF NOT EXISTS,
--         ADD COLUMN IF NOT EXISTS, and idempotent RLS policy consolidation.
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. ADMIN HELPER FUNCTION
-- Provides a recursion-safe check for admin status without self-referential
-- subqueries on public.users.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  _is_admin BOOLEAN;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT (role = 'admin' OR is_admin = true)
  INTO _is_admin
  FROM public.users
  WHERE id = auth.uid();

  RETURN COALESCE(_is_admin, FALSE);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.is_current_user_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO anon, authenticated;


-- ============================================================================
-- 2. PITCH VERSIONS (Version Control for Pitches)
-- Stores snapshots of pitch details on each save or milestone.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.pitch_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pitch_id uuid NOT NULL REFERENCES public.pitches(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  note text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pitch_versions_pitch_version_unique UNIQUE (pitch_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_pitch_versions_pitch_id ON public.pitch_versions(pitch_id);

ALTER TABLE public.pitch_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Founders can read versions of own pitch" ON public.pitch_versions;
CREATE POLICY "Founders can read versions of own pitch"
  ON public.pitch_versions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pitches p
      WHERE p.id = pitch_versions.pitch_id
        AND p.founder_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Founders can insert versions for own pitch" ON public.pitch_versions;
CREATE POLICY "Founders can insert versions for own pitch"
  ON public.pitch_versions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pitches p
      WHERE p.id = pitch_versions.pitch_id
        AND p.founder_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can view all pitch versions" ON public.pitch_versions;
CREATE POLICY "Admins can view all pitch versions"
  ON public.pitch_versions FOR SELECT
  TO authenticated
  USING (public.is_current_user_admin());


-- ============================================================================
-- 3. PITCH RATINGS (Community Stars)
-- Allows authenticated community members to rate pitches from 1 to 5 stars.
-- Founders cannot rate their own pitch.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.pitch_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pitch_id uuid NOT NULL REFERENCES public.pitches(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stars smallint NOT NULL CHECK (stars >= 1 AND stars <= 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pitch_ratings_pitch_user_unique UNIQUE (pitch_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_pitch_ratings_pitch_id ON public.pitch_ratings(pitch_id);
CREATE INDEX IF NOT EXISTS idx_pitch_ratings_user_id ON public.pitch_ratings(user_id);

ALTER TABLE public.pitch_ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read ratings of live pitches" ON public.pitch_ratings;
CREATE POLICY "Anyone can read ratings of live pitches"
  ON public.pitch_ratings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pitches p
      WHERE p.id = pitch_ratings.pitch_id
        AND p.status = 'live'
    )
  );

DROP POLICY IF EXISTS "Users can insert own rating on non-owned pitches" ON public.pitch_ratings;
CREATE POLICY "Users can insert own rating on non-owned pitches"
  ON public.pitch_ratings FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.pitches p
      WHERE p.id = pitch_ratings.pitch_id
        AND p.founder_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update own rating" ON public.pitch_ratings;
CREATE POLICY "Users can update own rating"
  ON public.pitch_ratings FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own rating" ON public.pitch_ratings;
CREATE POLICY "Users can delete own rating"
  ON public.pitch_ratings FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Admins can delete any rating" ON public.pitch_ratings;
CREATE POLICY "Admins can delete any rating"
  ON public.pitch_ratings FOR DELETE
  TO authenticated
  USING (public.is_current_user_admin());


-- ============================================================================
-- 4. PITCHES TABLE EXTENSIONS & STATUS CHECK
-- Adds versioning metadata and ensures allowed statuses match app requirements.
-- ============================================================================

ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS published_at timestamptz;
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS current_version integer DEFAULT 1;
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS last_saved_at timestamptz;

-- Update status check constraint to include all app statuses plus 'removed'
ALTER TABLE public.pitches DROP CONSTRAINT IF EXISTS pitches_status_check;
ALTER TABLE public.pitches ADD CONSTRAINT pitches_status_check
  CHECK (status IN ('draft', 'pending', 'live', 'published', 'rejected', 'removed'));


-- ============================================================================
-- 5. PITCH SCORES EXTENSIONS (AI & Quality Scoring)
-- Ensures overall, quality, sustainability, longevity, and breakdown columns exist.
-- ============================================================================

ALTER TABLE public.pitch_scores ADD COLUMN IF NOT EXISTS overall integer;
ALTER TABLE public.pitch_scores ADD COLUMN IF NOT EXISTS pitch_quality integer;
ALTER TABLE public.pitch_scores ADD COLUMN IF NOT EXISTS longevity integer;
ALTER TABLE public.pitch_scores ADD COLUMN IF NOT EXISTS sustainability integer;
ALTER TABLE public.pitch_scores ADD COLUMN IF NOT EXISTS breakdown jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.pitch_scores ADD COLUMN IF NOT EXISTS computed_at timestamptz DEFAULT now();


-- ============================================================================
-- 6. RANKING VIEW (public.discover_pitches)
-- Security invoker view ranking live pitches by combining AI score (60%)
-- and Bayesian community star rating (40%).
-- Weights and prior parameters are centralized for easy tuning.
-- ============================================================================

CREATE OR REPLACE VIEW public.discover_pitches
WITH (security_invoker = true)
AS
WITH config AS (
  SELECT
    0.60::numeric AS w_ai,         -- Weight for AI evaluation score (0.0 to 1.0)
    0.40::numeric AS w_comm,       -- Weight for community rating (0.0 to 1.0)
    50.0::numeric AS default_ai,   -- Default AI score when score is pending
    3.0::numeric  AS prior_rating, -- Bayesian prior rating (neutral average: 3.0 out of 5)
    5.0::numeric  AS prior_weight  -- Bayesian prior count (confidence threshold)
),
latest_scores AS (
  SELECT DISTINCT ON (pitch_id)
    pitch_id,
    overall AS ai_score,
    pitch_quality,
    longevity,
    sustainability,
    breakdown,
    computed_at
  FROM public.pitch_scores
  ORDER BY pitch_id, computed_at DESC NULLS LAST, created_at DESC NULLS LAST
),
rating_aggregates AS (
  SELECT
    pitch_id,
    ROUND(AVG(stars)::numeric, 2) AS rating_avg,
    COUNT(*)::bigint              AS rating_count
  FROM public.pitch_ratings
  GROUP BY pitch_id
)
SELECT
  p.id,
  p.founder_id,
  p.title,
  p.tagline,
  p.logo_url,
  p.website_url,
  p.short_description,
  p.ai_summary,
  p.problem,
  p.solution,
  p.unique_insight,
  p.tam,
  p.sam,
  p.som,
  p.target_customer,
  p.geography_focus,
  p.market_trend,
  p.competitors,
  p.competitive_advantages,
  p.moat,
  p.revenue_model,
  p.revenue_streams,
  p.pricing,
  p.cac,
  p.ltv,
  p.mrr,
  p.arr,
  p.users_count,
  p.mom_growth,
  p.milestones,
  p.notable_customers,
  p.pitch_deck_url,
  p.demo_video_url,
  p.round_type,
  p.security_type,
  p.amount_seeking,
  p.equity_pct,
  p.already_committed,
  p.committed_investors,
  p.use_of_funds,
  p.industry,
  p.secondary_industry,
  p.custom_industry,
  p.tags,
  p.company_stage,
  p.business_type,
  p.product_type,
  p.employees_count,
  p.annual_revenue,
  p.linkedin_url,
  p.facebook_url,
  p.x_url,
  p.instagram_url,
  p.founding_year,
  p.country,
  p.state,
  p.city,
  p.status,
  p.is_raising,
  p.views,
  p.featured,
  p.current_version,
  p.published_at,
  p.last_saved_at,
  p.created_at,
  p.updated_at,
  -- Scoring metrics
  s.ai_score,
  s.pitch_quality,
  s.longevity,
  s.sustainability,
  COALESCE(r.rating_avg, 0)   AS rating_avg,
  COALESCE(r.rating_count, 0) AS rating_count,
  -- Bayesian Community Score normalized to 0-100:
  -- ((rating_avg * rating_count + prior_rating * prior_weight) / (rating_count + prior_weight)) * 20
  ROUND(
    (
      (
        (COALESCE(r.rating_avg, cfg.prior_rating) * COALESCE(r.rating_count, 0) + (cfg.prior_rating * cfg.prior_weight))
        / (COALESCE(r.rating_count, 0) + cfg.prior_weight)
      ) * 20.0
    )::numeric,
    2
  ) AS community_score,
  -- Combined ranking score (60% AI Score + 40% Community Score)
  ROUND(
    (
      (cfg.w_ai * COALESCE(s.ai_score::numeric, cfg.default_ai))
      + (
          cfg.w_comm * (
            (
              (COALESCE(r.rating_avg, cfg.prior_rating) * COALESCE(r.rating_count, 0) + (cfg.prior_rating * cfg.prior_weight))
              / (COALESCE(r.rating_count, 0) + cfg.prior_weight)
            ) * 20.0
          )
        )
    )::numeric,
    2
  ) AS combined_score
FROM public.pitches p
CROSS JOIN config cfg
LEFT JOIN latest_scores s ON s.pitch_id = p.id
LEFT JOIN rating_aggregates r ON r.pitch_id = p.id
WHERE p.status = 'live';


-- ============================================================================
-- 7. COMMENTS (Community Discussion on Pitches)
-- Public can view comments on live pitches. Logged in users manage their own.
-- ============================================================================

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read comments" ON public.comments;
DROP POLICY IF EXISTS "comments_select_policy" ON public.comments;
DROP POLICY IF EXISTS "Allow admins to manage comments" ON public.comments;
DROP POLICY IF EXISTS "Users can insert own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;
DROP POLICY IF EXISTS "comments_insert_policy" ON public.comments;
DROP POLICY IF EXISTS "comments_update_policy" ON public.comments;
DROP POLICY IF EXISTS "comments_delete_policy" ON public.comments;

CREATE POLICY "Anyone can view comments on live pitches"
  ON public.comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pitches p
      WHERE p.id = comments.pitch_id
        AND p.status = 'live'
    )
  );

CREATE POLICY "Logged in users can post comments"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins can delete any comment"
  ON public.comments FOR DELETE
  TO authenticated
  USING (public.is_current_user_admin());


-- ============================================================================
-- 8. CONTACT SUBMISSIONS
-- Allows visitors to send contact inquiries. Admins read submissions.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert contact submission" ON public.contact_submissions;
CREATE POLICY "Anyone can insert contact submission"
  ON public.contact_submissions FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Only admins can view contact submissions" ON public.contact_submissions;
CREATE POLICY "Only admins can view contact submissions"
  ON public.contact_submissions FOR SELECT
  TO authenticated
  USING (public.is_current_user_admin());


-- ============================================================================
-- 9. LOOKUP TABLES (sectors, countries, states)
-- Read access is public; modifications are restricted to administrators.
-- ============================================================================

-- Sectors
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read sectors" ON public.sectors;
CREATE POLICY "Public read sectors"
  ON public.sectors FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins manage sectors" ON public.sectors;
CREATE POLICY "Admins manage sectors"
  ON public.sectors FOR ALL
  TO authenticated
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

-- Countries
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read countries" ON public.countries;
CREATE POLICY "Public read countries"
  ON public.countries FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins manage countries" ON public.countries;
CREATE POLICY "Admins manage countries"
  ON public.countries FOR ALL
  TO authenticated
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

-- States
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read states" ON public.states;
CREATE POLICY "Public read states"
  ON public.states FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins manage states" ON public.states;
CREATE POLICY "Admins manage states"
  ON public.states FOR ALL
  TO authenticated
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());


-- ============================================================================
-- 10. CLEAN & CONSOLIDATED RLS POLICIES FOR EXISTING CORE TABLES
-- Drops conflicting legacy policies and establishes clear owner, admin,
-- and public access without recursive subqueries.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- USERS
-- ----------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow users to read their own data" ON public.users;
DROP POLICY IF EXISTS "Allow admins to manage all users" ON public.users;

CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Admins can manage all users"
  ON public.users FOR ALL
  TO authenticated
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

-- ----------------------------------------------------------------------------
-- PITCHES
-- ----------------------------------------------------------------------------
ALTER TABLE public.pitches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Founders can view their own pitches" ON public.pitches;
DROP POLICY IF EXISTS "Founders can update their own pitches" ON public.pitches;
DROP POLICY IF EXISTS "Founders can insert their own pitches" ON public.pitches;
DROP POLICY IF EXISTS "Founders can delete their own pitches" ON public.pitches;
DROP POLICY IF EXISTS "Allow public select on live pitches" ON public.pitches;
DROP POLICY IF EXISTS "Allow admins to manage all pitches" ON public.pitches;

CREATE POLICY "Anyone can view live pitches"
  ON public.pitches FOR SELECT
  USING (status = 'live');

CREATE POLICY "Founders can select own pitches"
  ON public.pitches FOR SELECT
  TO authenticated
  USING (founder_id = (SELECT auth.uid()));

CREATE POLICY "Founders can insert own pitches"
  ON public.pitches FOR INSERT
  TO authenticated
  WITH CHECK (founder_id = (SELECT auth.uid()));

CREATE POLICY "Founders can update own pitches"
  ON public.pitches FOR UPDATE
  TO authenticated
  USING (founder_id = (SELECT auth.uid()))
  WITH CHECK (founder_id = (SELECT auth.uid()));

CREATE POLICY "Founders can delete own pitches"
  ON public.pitches FOR DELETE
  TO authenticated
  USING (founder_id = (SELECT auth.uid()));

CREATE POLICY "Admins can manage all pitches"
  ON public.pitches FOR ALL
  TO authenticated
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

-- ----------------------------------------------------------------------------
-- PRODUCTS
-- ----------------------------------------------------------------------------
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select on live products" ON public.products;
DROP POLICY IF EXISTS "Allow sellers to select their own products" ON public.products;
DROP POLICY IF EXISTS "Allow sellers to insert their own products" ON public.products;
DROP POLICY IF EXISTS "Allow sellers to update their own products" ON public.products;
DROP POLICY IF EXISTS "Allow sellers to delete their own products" ON public.products;
DROP POLICY IF EXISTS "Allow admins to manage all products" ON public.products;

CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (status = 'live' OR status = 'approved' OR status = 'active');

CREATE POLICY "Sellers can select own products"
  ON public.products FOR SELECT
  TO authenticated
  USING (seller_id = (SELECT auth.uid()));

CREATE POLICY "Sellers can insert own products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (seller_id = (SELECT auth.uid()));

CREATE POLICY "Sellers can update own products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (seller_id = (SELECT auth.uid()))
  WITH CHECK (seller_id = (SELECT auth.uid()));

CREATE POLICY "Sellers can delete own products"
  ON public.products FOR DELETE
  TO authenticated
  USING (seller_id = (SELECT auth.uid()));

CREATE POLICY "Admins can manage all products"
  ON public.products FOR ALL
  TO authenticated
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

-- ----------------------------------------------------------------------------
-- PURCHASE INTENTS (Marketplace "I'm interested" leads)
-- ----------------------------------------------------------------------------
ALTER TABLE public.purchase_intents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "buyer sees own" ON public.purchase_intents;
DROP POLICY IF EXISTS "seller sees theirs" ON public.purchase_intents;
DROP POLICY IF EXISTS "buyer inserts" ON public.purchase_intents;

CREATE POLICY "Buyers can insert own purchase intent"
  ON public.purchase_intents FOR INSERT
  TO authenticated
  WITH CHECK (buyer_id = (SELECT auth.uid()));

CREATE POLICY "Buyers can view own purchase intents"
  ON public.purchase_intents FOR SELECT
  TO authenticated
  USING (buyer_id = (SELECT auth.uid()));

CREATE POLICY "Sellers can view purchase intents for their products"
  ON public.purchase_intents FOR SELECT
  TO authenticated
  USING (
    seller_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.products pr
      WHERE pr.id = purchase_intents.product_id
        AND pr.seller_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Admins can view all purchase intents"
  ON public.purchase_intents FOR SELECT
  TO authenticated
  USING (public.is_current_user_admin());

-- ----------------------------------------------------------------------------
-- INVESTOR INTERESTS (Pitch connections)
-- ----------------------------------------------------------------------------
ALTER TABLE public.investor_interests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Investors read own interests" ON public.investor_interests;
DROP POLICY IF EXISTS "investors_insert_policy" ON public.investor_interests;
DROP POLICY IF EXISTS "founders_read_interests" ON public.investor_interests;

CREATE POLICY "Investors can insert own interest"
  ON public.investor_interests FOR INSERT
  TO authenticated
  WITH CHECK (investor_id = (SELECT auth.uid()));

CREATE POLICY "Investors can view own interests"
  ON public.investor_interests FOR SELECT
  TO authenticated
  USING (investor_id = (SELECT auth.uid()));

CREATE POLICY "Founders can view interests on own pitches"
  ON public.investor_interests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pitches p
      WHERE p.id = investor_interests.pitch_id
        AND p.founder_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Admins can view all investor interests"
  ON public.investor_interests FOR SELECT
  TO authenticated
  USING (public.is_current_user_admin());

-- ----------------------------------------------------------------------------
-- SAVED PITCHES (Bookmarks)
-- ----------------------------------------------------------------------------
ALTER TABLE public.saved_pitches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their saved pitches" ON public.saved_pitches;
DROP POLICY IF EXISTS "Users can save pitches" ON public.saved_pitches;
DROP POLICY IF EXISTS "Users can remove saved pitches" ON public.saved_pitches;
DROP POLICY IF EXISTS "Users manage own saved pitches" ON public.saved_pitches;

CREATE POLICY "Users can manage own saved pitches"
  ON public.saved_pitches FOR ALL
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins can view all saved pitches"
  ON public.saved_pitches FOR SELECT
  TO authenticated
  USING (public.is_current_user_admin());

-- ----------------------------------------------------------------------------
-- NOTIFICATIONS
-- ----------------------------------------------------------------------------
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ----------------------------------------------------------------------------
-- CONVERSATIONS & MESSAGES
-- ----------------------------------------------------------------------------
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "participant view convos" ON public.conversations;
DROP POLICY IF EXISTS "participant insert convos" ON public.conversations;
DROP POLICY IF EXISTS "participant update convos" ON public.conversations;

CREATE POLICY "Participants can view conversations"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (
    participant_a = (SELECT auth.uid())
    OR participant_b = (SELECT auth.uid())
  );

CREATE POLICY "Participants can create conversations"
  ON public.conversations FOR INSERT
  TO authenticated
  WITH CHECK (
    participant_a = (SELECT auth.uid())
    OR participant_b = (SELECT auth.uid())
  );

CREATE POLICY "Participants can update conversations"
  ON public.conversations FOR UPDATE
  TO authenticated
  USING (
    participant_a = (SELECT auth.uid())
    OR participant_b = (SELECT auth.uid())
  );

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "participant view msgs" ON public.messages;
DROP POLICY IF EXISTS "participant send" ON public.messages;

CREATE POLICY "Participants can view messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (c.participant_a = (SELECT auth.uid()) OR c.participant_b = (SELECT auth.uid()))
    )
  );

CREATE POLICY "Participants can send messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (c.participant_a = (SELECT auth.uid()) OR c.participant_b = (SELECT auth.uid()))
    )
  );

-- ----------------------------------------------------------------------------
-- BUYER ADDRESSES
-- ----------------------------------------------------------------------------
ALTER TABLE public.buyer_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own addresses" ON public.buyer_addresses;

CREATE POLICY "Users can manage own addresses"
  ON public.buyer_addresses FOR ALL
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ----------------------------------------------------------------------------
-- FEATURE FLAGS
-- ----------------------------------------------------------------------------
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read feature flags" ON public.feature_flags;
DROP POLICY IF EXISTS "Admins insert feature flags" ON public.feature_flags;
DROP POLICY IF EXISTS "Admins update feature flags" ON public.feature_flags;
DROP POLICY IF EXISTS "Allow admins to manage feature flags" ON public.feature_flags;

CREATE POLICY "Anyone can view feature flags"
  ON public.feature_flags FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage feature flags"
  ON public.feature_flags FOR ALL
  TO authenticated
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());


-- ============================================================================
-- 11. STORAGE BUCKETS & STORAGE RLS POLICIES
-- Idempotently creates storage buckets and locks down folder-level user access.
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('ventex-assets', 'ventex-assets', true),
  ('avatars', 'avatars', true),
  ('pitch_decks', 'pitch_decks', false)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public;

-- Drop previous storage policies to ensure clean state
DROP POLICY IF EXISTS "Public read for public buckets" ON storage.objects;
DROP POLICY IF EXISTS "Users upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users update own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users delete from own folder" ON storage.objects;
DROP POLICY IF EXISTS "Admins manage all storage" ON storage.objects;
DROP POLICY IF EXISTS "Private pitch deck access" ON storage.objects;

-- Public read for ventex-assets and avatars
CREATE POLICY "Public read for public buckets"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('ventex-assets', 'avatars'));

-- Authenticated users upload to folder matching their user id: /<uid>/filename
CREATE POLICY "Users upload to own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id IN ('ventex-assets', 'avatars', 'pitch_decks')
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- Authenticated users update their own files
CREATE POLICY "Users update own folder"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id IN ('ventex-assets', 'avatars', 'pitch_decks')
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  )
  WITH CHECK (
    bucket_id IN ('ventex-assets', 'avatars', 'pitch_decks')
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- Authenticated users delete their own files
CREATE POLICY "Users delete from own folder"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id IN ('ventex-assets', 'avatars', 'pitch_decks')
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- Private pitch deck read policy: only owner and admin can view pitch_decks files
CREATE POLICY "Private pitch deck access"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'pitch_decks'
    AND (
      (storage.foldername(name))[1] = (SELECT auth.uid())::text
      OR public.is_current_user_admin()
    )
  );

-- Admins full access to all storage objects
CREATE POLICY "Admins manage all storage"
  ON storage.objects FOR ALL
  TO authenticated
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

COMMIT;
