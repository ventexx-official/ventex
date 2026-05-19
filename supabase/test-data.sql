-- Insert dummy users for foreign key references, or we can just leave the pitches unlinked if founder_id is not strictly NOT NULL.
-- But let's insert pitches assuming founder_id can be NULL for test data, or we could just insert them. Since founder_id is not strictly defined as NOT NULL in the prompt's schema, this will work.

INSERT INTO public.pitches (
  title, 
  industry, 
  company_stage, 
  country, 
  amount_seeking, 
  equity_pct, 
  is_raising, 
  status, 
  ai_summary
) VALUES 
(
  'Fintech Startup',
  'Fintech',
  'Seed',
  'India',
  5000000,
  10,
  true,
  'live',
  'A UPI-based micro-lending platform giving Indian farmers instant crop loans under ₹50,000 — approved in 4 minutes using land record verification. Already serving 2,400 farmers across Kerala.'
),
(
  'Edtech Startup',
  'Edtech',
  'Pre-seed',
  'India',
  8000000,
  15,
  true,
  'live',
  'A vernacular e-learning platform teaching vocational skills in 12 Indian languages via short video lessons. Targets Tier 2 and Tier 3 city students. 18,000 active learners in 6 months.'
),
(
  'SaaS Startup',
  'SaaS',
  'Early Growth',
  'India',
  10000000,
  8,
  false,
  'live',
  'A B2B SaaS tool helping small Indian retailers manage inventory, billing, and supplier payments from one dashboard. Currently used by 340 shops across Mumbai and Pune.'
);
