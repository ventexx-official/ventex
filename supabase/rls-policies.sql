-- Enable Row Level Security (RLS) on tables
ALTER TABLE public.pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 1. Allow anyone (including logged out visitors) to SELECT from pitches where status = 'live'
CREATE POLICY "Allow public select on live pitches"
  ON public.pitches
  FOR SELECT
  USING (status = 'live');

-- 2. Allow anyone to SELECT from products where status = 'live'
CREATE POLICY "Allow public select on live products"
  ON public.products
  FOR SELECT
  USING (status = 'live');

-- 3. Allow authenticated users to SELECT their own row from users where id = auth.uid()
CREATE POLICY "Allow users to read their own data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());
