-- ====================================================================
-- Ventex Database Migrations: Admin Features (Days 39–43)
-- Execute this script in your Supabase SQL Editor.
-- ====================================================================

-- 1. Day 41: Add verified_founder column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS verified_founder boolean DEFAULT false;

-- 2. Day 42: Create public.sectors table to hold official industry list
CREATE TABLE IF NOT EXISTS public.sectors (
  name text PRIMARY KEY,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on sectors table
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;

-- Setup RLS Policies for sectors
DROP POLICY IF EXISTS "Allow public read access to sectors" ON public.sectors;
CREATE POLICY "Allow public read access to sectors" 
  ON public.sectors FOR SELECT 
  TO authenticated, anon 
  USING (true);

DROP POLICY IF EXISTS "Allow admins to manage sectors" ON public.sectors;
CREATE POLICY "Allow admins to manage sectors" 
  ON public.sectors FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Populate official sectors reference list
INSERT INTO public.sectors (name) VALUES
  ('3D Printing'), ('Advanced Materials'), ('Aerospace'), ('AI'), ('Agriculture'), ('Alt Protein'), 
  ('Art & Design'), ('Automotive'), ('Big Data'), ('Biotechnology'), ('Blockchain'), ('Chemistry'), 
  ('CivicTech'), ('Cleantech'), ('Climate'), ('Construction'), ('CRM'), ('Data & Analytics'), 
  ('DeepTech'), ('DevOps'), ('Drones'), ('E-commerce'), ('Education'), ('Energy'), 
  ('Enterprise Software'), ('Fashion'), ('Fintech'), ('FMCG'), ('Food & Beverage'), ('Gaming'), 
  ('Generative AI'), ('Hardware'), ('Healthtech'), ('ICT'), ('Insurtech'), ('Legal'), 
  ('Logistics'), ('Marketplace'), ('Media'), ('PropTech'), ('Retail'), ('SaaS'), ('Travel'), ('Cybersecurity')
ON CONFLICT (name) DO NOTHING;

-- 3. Day 43: Add status column to public.flagged_attempts table
ALTER TABLE public.flagged_attempts ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Setup updated RLS policies for flagged_attempts to allow admins to manage them
DROP POLICY IF EXISTS "Allow admins to manage flagged attempts" ON public.flagged_attempts;
CREATE POLICY "Allow admins to manage flagged attempts" 
  ON public.flagged_attempts FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- 4. Set Jazin's account to admin role (Manually)
UPDATE public.users 
SET role = 'admin' 
WHERE id = '3f6096e0-1fe0-4f86-b2ac-4b2f372ff3c2';

-- 5. Reload PostgREST Schema Cache
NOTIFY pgrst, 'reload schema';
