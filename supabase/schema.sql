-- 1. users
CREATE TABLE IF NOT EXISTS public.users (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  role text DEFAULT 'visitor'::text,
  ventex_access boolean DEFAULT false,
  investor_premium boolean DEFAULT false,
  subscription_end_date timestamptz,
  stripe_customer_id text,
  phone_verified boolean DEFAULT false,
  is_seller boolean DEFAULT false,
  stripe_connect_id text,
  avatar_url text,
  banned boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 2. pitches
CREATE TABLE IF NOT EXISTS public.pitches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  title text,
  tagline text,
  logo_url text,
  website_url text,
  short_description text,
  ai_summary text,
  problem text,
  solution text,
  unique_insight text,
  tam bigint,
  sam bigint,
  som bigint,
  target_customer text,
  geography_focus text,
  market_trend text,
  competitors text,
  competitive_advantages text,
  moat text,
  revenue_model text,
  revenue_streams text,
  pricing text,
  cac text,
  ltv text,
  mrr bigint,
  arr bigint,
  users_count integer,
  mom_growth text,
  milestones text,
  notable_customers text,
  pitch_deck_url text,
  demo_video_url text,
  round_type text,
  security_type text,
  amount_seeking bigint,
  equity_pct numeric,
  already_committed bigint,
  committed_investors text,
  use_of_funds text,
  industry text,
  secondary_industry text,
  custom_industry text,
  tags text[],
  company_stage text,
  business_type text,
  product_type text,
  employees_count integer,
  annual_revenue bigint,
  linkedin_url text,
  facebook_url text,
  x_url text,
  instagram_url text,
  founding_year integer,
  country text,
  city text,
  status text DEFAULT 'draft'::text,
  is_raising boolean DEFAULT false,
  views integer DEFAULT 0,
  featured boolean DEFAULT false,
  qa_data jsonb DEFAULT '{}'::jsonb,
  team_data jsonb DEFAULT '[]'::jsonb,
  additional_docs jsonb DEFAULT '[]'::jsonb,
  video_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. products
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE SET NULL,
  name text,
  description text,
  images_urls text[],
  price bigint,
  discount_price bigint,
  type text,
  category text,
  sector text,
  status text DEFAULT 'pending'::text,
  deal_end_date timestamptz,
  stripe_price_id text,
  sales_count integer DEFAULT 0,
  average_rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 4. orders
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  seller_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  amount_paid bigint,
  ventex_fee bigint,
  seller_payout bigint,
  stripe_payment_id text,
  stripe_session_id text,
  status text DEFAULT 'paid'::text,
  download_url text,
  download_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 5. reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  buyer_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  seller_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  rating integer,
  comment text,
  seller_reply text,
  created_at timestamptz DEFAULT now()
);

-- 6. comments
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  content text,
  likes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 7. investor_interests
CREATE TABLE IF NOT EXISTS public.investor_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
  message text,
  status text DEFAULT 'pending'::text,
  created_at timestamptz DEFAULT now()
);

-- 8. deal_room_messages
CREATE TABLE IF NOT EXISTS public.deal_room_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interest_id uuid REFERENCES public.investor_interests(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  content text,
  flagged boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 9. notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  type text,
  message text,
  read boolean DEFAULT false,
  link text,
  created_at timestamptz DEFAULT now()
);

-- 10. cart_items
CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  added_at timestamptz DEFAULT now()
);

-- 11. saved_pitches
CREATE TABLE IF NOT EXISTS public.saved_pitches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- 12. promo_codes
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  code text UNIQUE,
  discount_pct integer,
  max_uses integer,
  used_count integer DEFAULT 0,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 13. disputes
CREATE TABLE IF NOT EXISTS public.disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  buyer_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  seller_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  reason text,
  description text,
  seller_response text,
  status text DEFAULT 'open'::text,
  created_at timestamptz DEFAULT now()
);

-- 14. project_requests
CREATE TABLE IF NOT EXISTS public.project_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  seller_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  requirements text,
  quoted_price bigint,
  status text DEFAULT 'pending'::text,
  created_at timestamptz DEFAULT now()
);

-- 15. Auth trigger for public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 16. RLS Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
  ON public.users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.users FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- 17. Pitches RLS Policies
ALTER TABLE public.pitches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Founders can view their own pitches"
  ON public.pitches FOR SELECT
  USING (auth.uid() = founder_id);

CREATE POLICY "Founders can update their own pitches"
  ON public.pitches FOR UPDATE
  USING (auth.uid() = founder_id);

CREATE POLICY "Founders can insert their own pitches"
  ON public.pitches FOR INSERT
  WITH CHECK (auth.uid() = founder_id);

CREATE POLICY "Founders can delete their own pitches"
  ON public.pitches FOR DELETE
  USING (auth.uid() = founder_id);

-- 18. Auto-calculate average_rating and review_count on products table
CREATE OR REPLACE FUNCTION public.handle_review_changes()
RETURNS trigger AS $$
DECLARE
  target_product_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_product_id := OLD.product_id;
  ELSE
    target_product_id := NEW.product_id;
  END IF;

  UPDATE public.products
  SET 
    review_count = (
      SELECT COUNT(*) 
      FROM public.reviews 
      WHERE product_id = target_product_id
    ),
    average_rating = COALESCE(
      (
        SELECT ROUND(AVG(rating)::numeric, 1) 
        FROM public.reviews 
        WHERE product_id = target_product_id
      ), 
      0
    )
  WHERE id = target_product_id;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_review_change ON public.reviews;
CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_review_changes();



