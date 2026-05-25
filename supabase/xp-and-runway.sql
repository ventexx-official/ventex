-- Run in Supabase SQL Editor before deploying app features

ALTER TABLE public.pitches ADD COLUMN IF NOT EXISTS round_closes_at TIMESTAMP;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'Idea Stage';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]'::jsonb;

-- Allow public read of founder profile fields for live pitch pages
CREATE POLICY IF NOT EXISTS "Public read pitch founders"
  ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pitches p
      WHERE p.founder_id = users.id AND p.status = 'live'
    )
  );
