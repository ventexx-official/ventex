-- Seed demo data when tables are empty (schema-aligned with supabase/schema.sql)

INSERT INTO public.pitches (
  title,
  tagline,
  industry,
  company_stage,
  country,
  city,
  status,
  amount_seeking,
  equity_pct,
  is_raising,
  ai_summary
)
SELECT
  'VentexDemo',
  'India startup platform',
  'SaaS',
  'Seed',
  'India',
  'Kerala',
  'live',
  5000000,
  10,
  true,
  'Demo pitch for Ventex early access.'
WHERE NOT EXISTS (
  SELECT 1 FROM public.pitches WHERE status = 'live' LIMIT 1
);

INSERT INTO public.products (name, description, price, category, status, type)
SELECT v.name, v.description, v.price, v.category, v.status, v.type
FROM (
  VALUES
    ('Pitch Deck Template', 'Investor-ready 12-slide template', 999::bigint, 'Templates', 'live', 'fixed_price'),
    ('SaaS Financial Model', 'Excel + Google Sheets model', 1499::bigint, 'Templates', 'live', 'fixed_price')
) AS v(name, description, price, category, status, type)
WHERE (SELECT COUNT(*) FROM public.products WHERE status = 'live') < 2;
