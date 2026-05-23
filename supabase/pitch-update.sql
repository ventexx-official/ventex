-- 1. Remove all existing demo/test pitches
DELETE FROM public.pitches;

-- 2. Insert the real Ventex pitch with exact values
INSERT INTO public.pitches (
  title, tagline, short_description, ai_summary,
  problem, solution, unique_insight,
  tam, sam, som,
  target_customer, geography_focus, market_trend,
  competitors, competitive_advantages, moat,
  revenue_model, revenue_streams, pricing,
  mrr, arr, users_count, mom_growth, milestones,
  round_type, amount_seeking, equity_pct, security_type, use_of_funds,
  industry, secondary_industry, tags,
  company_stage, business_type, product_type,
  employees_count, founding_year, country, city,
  linkedin_url, instagram_url,
  is_raising, featured, status
) VALUES (
  'Ventex',
  'The global platform where startups pitch, fund and sell.',
  'Ventex is a three-in-one startup platform — a pitch hub, investor network, and product marketplace — built to give every startup idea a stage.',
  'Ventex is a three-in-one startup platform from India combining a public pitch hub, investor network, and product marketplace in one place. Founded by a solo student from Kerala, it uses Claude AI to auto-generate factual pitch briefings for every startup on the discovery feed. Currently in active development with 17+ pages built and launching on ventexx.com in mid-2026.',
  'Founders have no single place to pitch publicly, get discovered by investors, and sell their products simultaneously. A founder in Kerala has zero visibility compared to a founder in Bangalore or Silicon Valley. Investors waste hours searching fragmented closed databases. The startup ecosystem is broken and inaccessible for anyone outside major cities.',
  'Ventex combines a public pitch hub, investor network with premium deal flow tools, and a startup-made product marketplace in one platform. By doing so, it breaks down geographical barriers and gatekeepers, allowing any developer or student founder from Kozhikode or Kerala to showcase their products directly to a global audience of buyers and angel investors, creating a democratic and accessible ecosystem regardless of where the founder is from.',
  'By integrating a public pitch hub, investor deal rooms, and a creator product marketplace under one roof, Ventex creates a self-reinforcing ecosystem where developers monetize their products immediately while building investor-grade equity deal flow.',
  8900000000, 500000000, 10000000,
  'Early-stage startup founders in India and Southeast Asia, angel investors, and startup product buyers',
  'India first, then Southeast Asia, then global',
  'India has 100,000+ DPIIT-recognised startups. AI makes quality content generation cheap. Supabase and Stripe make enterprise-grade infrastructure affordable for solo founders.',
  'Vestbee, AngelList, Crunchbase',
  'Fully public discovery — anyone can find pitches. Combines pitching, investing AND marketplace in one platform. AI-generated pitch briefings. India-first pricing at ₹149/mo access and ₹1,499/mo premium.',
  'Network effects — more founders attract more investors, more investors attract more founders. Marketplace GMV creates a separate revenue flywheel. AI briefings cannot be gamed by founders — investors trust them more.',
  'Hybrid',
  'Ventex Access ₹149/mo · Investor Premium ₹1,499/mo · 5% marketplace commission · Booster packs · Featured slots · Verified badge fee',
  'Free for visitors. ₹149/mo for Ventex Access. ₹1,499/mo for Investor Premium.',
  0, 0, 0, '0%',
  'Platform in active development — Day 21 of 60-day build plan. 14-table Supabase database live. 17+ pages built. Stripe subscriptions integrated. Claude AI pitch briefing generation working. GitHub live at github.com/ventexx-official/ventex.',
  'Pre-seed', 5000000, 10, 'Equity',
  '40% product development · 30% marketing and user acquisition · 20% operations and legal · 10% reserve',
  'SaaS', 'Marketplace',
  ARRAY['SaaS', 'Marketplace', 'Generative AI', 'E-commerce', 'Startup Platform'],
  'Idea', 'B2B2C', 'Marketplace',
  1, 2026, 'India', 'Kozhikode',
  'https://linkedin.com/company/ventex',
  'https://instagram.com/ventexx',
  true, true, 'live'
);
