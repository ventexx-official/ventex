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

-- Enable RLS for reviews and orders
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 4. Reviews Policies
CREATE POLICY "Allow public select on reviews"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated users to insert reviews"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Allow sellers to update reviews (for replies)"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id);

-- 5. Orders Policies
CREATE POLICY "Allow users to select their own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Allow users to insert their own orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

