-- Create countries table
CREATE TABLE IF NOT EXISTS public.countries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create states table
CREATE TABLE IF NOT EXISTS public.states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_id UUID REFERENCES public.countries(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(country_id, name)
);

-- Alter users table to add new fields
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS state TEXT;

-- Create saved_products table
CREATE TABLE IF NOT EXISTS public.saved_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Seed basic countries
INSERT INTO public.countries (name, code) VALUES
('United States', 'US'),
('United Kingdom', 'UK'),
('India', 'IN'),
('Canada', 'CA'),
('Australia', 'AU')
ON CONFLICT (name) DO NOTHING;

-- Seed some states for US and India
INSERT INTO public.states (country_id, name, code) 
SELECT id, 'California', 'CA' FROM public.countries WHERE code = 'US'
ON CONFLICT DO NOTHING;

INSERT INTO public.states (country_id, name, code) 
SELECT id, 'New York', 'NY' FROM public.countries WHERE code = 'US'
ON CONFLICT DO NOTHING;

INSERT INTO public.states (country_id, name, code) 
SELECT id, 'Maharashtra', 'MH' FROM public.countries WHERE code = 'IN'
ON CONFLICT DO NOTHING;

INSERT INTO public.states (country_id, name, code) 
SELECT id, 'Karnataka', 'KA' FROM public.countries WHERE code = 'IN'
ON CONFLICT DO NOTHING;

-- Policies for countries and states (Public read, admin write)
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." ON public.countries FOR SELECT USING (true);
CREATE POLICY "Public profiles are viewable by everyone." ON public.states FOR SELECT USING (true);

-- Policies for saved_products
ALTER TABLE public.saved_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own saved products" ON public.saved_products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own saved products" ON public.saved_products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own saved products" ON public.saved_products FOR DELETE USING (auth.uid() = user_id);
