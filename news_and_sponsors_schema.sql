-- ==========================================
-- VENTEX INTELLIGENCE & SPONSORSHIPS SCHEMA
-- ==========================================

-- 1. ARTICLES TABLE (News Hub)
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    summary TEXT,
    content TEXT,
    source_url TEXT UNIQUE,
    source_name TEXT,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    tags TEXT[] DEFAULT '{}',
    is_published BOOLEAN DEFAULT true
);

-- RLS for Articles
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published articles" 
ON public.articles FOR SELECT 
USING (is_published = true);

-- Only service role can insert/update articles via the cron job

-- 2. SPONSORSHIPS TABLE
CREATE TABLE IF NOT EXISTS public.sponsorships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL, -- e.g., 'startup', 'product', 'founder'
    target_id UUID, -- References the ID of the startup, product, or founder
    title TEXT NOT NULL,
    description TEXT,
    link_url TEXT NOT NULL,
    image_url TEXT,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    impressions INT DEFAULT 0,
    clicks INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS for Sponsorships
ALTER TABLE public.sponsorships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active sponsorships" 
ON public.sponsorships FOR SELECT 
USING (is_active = true AND (end_date IS NULL OR end_date > now()));

-- 3. TRUST & PLATFORM QUALITY
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
