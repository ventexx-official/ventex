-- Ventex feature batches A-E schema updates

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS response_rate integer DEFAULT 100;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_interests integer DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS responded_interests integer DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS xp integer DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS level text DEFAULT 'Idea Stage';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS badges jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS investment_thesis text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS preferred_sectors text[];
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS preferred_stages text[];

ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS round_closes_at timestamptz;
ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS state text;

CREATE TABLE IF NOT EXISTS public.pitch_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
  overall integer,
  problem_clarity integer,
  market_size integer,
  team_strength integer,
  traction integer,
  business_model integer,
  feedback text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.catalysts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE SET NULL,
  name text,
  bio text,
  expertise text[],
  sectors text[],
  offers_investment boolean DEFAULT false,
  offers_mentorship boolean DEFAULT true,
  verified boolean DEFAULT false,
  photo_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pitch_battles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start date,
  pitch_id uuid REFERENCES public.pitches(id) ON DELETE CASCADE,
  votes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE (week_start, pitch_id)
);

ALTER TABLE public.pitch_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalysts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pitch_battles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pitch_scores owner read" ON public.pitch_scores;
CREATE POLICY "pitch_scores owner read" ON public.pitch_scores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pitches
      WHERE pitches.id = pitch_scores.pitch_id
      AND pitches.founder_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "catalysts public read" ON public.catalysts;
CREATE POLICY "catalysts public read" ON public.catalysts FOR SELECT USING (true);

DROP POLICY IF EXISTS "pitch_battles public read" ON public.pitch_battles;
CREATE POLICY "pitch_battles public read" ON public.pitch_battles FOR SELECT USING (true);

DROP POLICY IF EXISTS "pitch_battles logged in vote" ON public.pitch_battles;
CREATE POLICY "pitch_battles logged in vote" ON public.pitch_battles
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "pitch_battles logged in update" ON public.pitch_battles;
CREATE POLICY "pitch_battles logged in update" ON public.pitch_battles
  FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "public users read profiles" ON public.users;
CREATE POLICY "public users read profiles" ON public.users FOR SELECT USING (true);
