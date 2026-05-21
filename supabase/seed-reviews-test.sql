-- ============================================================
-- VENTEX REVIEW SYSTEM TEST SEED
-- Run this in Supabase Dashboard → SQL Editor
-- Creates: 1 seller, 1 product, 3 buyers, 3 fulfilled orders, 3 reviews
-- ============================================================

-- 1. Insert seller into auth.users (Supabase built-in)
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, created_at, updated_at, aud, role
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'seller@ventex-test.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"full_name": "Alex Founder", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"}'::jsonb,
  now(), now(), 'authenticated', 'authenticated'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert 3 buyers into auth.users
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, aud, role)
VALUES
  (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'sarah@ventex-test.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"full_name": "Sarah Jenkins", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"}'::jsonb,
    now(), now(), 'authenticated', 'authenticated'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000000',
    'dan@ventex-test.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"full_name": "Developer Dan", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Dan"}'::jsonb,
    now(), now(), 'authenticated', 'authenticated'
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    '00000000-0000-0000-0000-000000000000',
    'elena@ventex-test.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"full_name": "Elena Rostova", "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena"}'::jsonb,
    now(), now(), 'authenticated', 'authenticated'
  )
ON CONFLICT (id) DO NOTHING;

-- 3. Sync public.users (trigger should do this automatically, but let's ensure)
INSERT INTO public.users (id, full_name, avatar_url, role, is_seller)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Alex Founder', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', 'founder', true),
  ('22222222-2222-2222-2222-222222222222', 'Sarah Jenkins', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', 'visitor', false),
  ('33333333-3333-3333-3333-333333333333', 'Developer Dan', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dan', 'visitor', false),
  ('44444444-4444-4444-4444-444444444444', 'Elena Rostova', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena', 'visitor', false)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert a test product
INSERT INTO public.products (
  id, seller_id, name, description,
  images_urls, price, discount_price,
  type, category, sector, status,
  deal_end_date, average_rating, review_count, featured
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  'SaaS Starter Kit Pro',
  'A complete Next.js SaaS boilerplate with authentication, payments, Supabase integration, and a gorgeous dashboard UI. Save 40+ hours of setup time and focus on your product.

Features:
- Auth with Supabase (email + Google OAuth)
- Stripe subscription billing
- Role-based access control
- Dark/light mode
- Mobile-responsive layout
- 20+ pre-built pages',
  ARRAY['https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200'],
  25000,
  15000,
  'fixed_price',
  'Templates',
  'SaaS',
  'live',
  (now() + interval '3 days'),
  4.7,
  3,
  true
)
ON CONFLICT (id) DO NOTHING;

-- 5. Insert 3 fulfilled orders (one per buyer)
INSERT INTO public.orders (id, buyer_id, seller_id, product_id, amount_paid, status, created_at)
VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 15000, 'fulfilled', now() - interval '14 days'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 15000, 'fulfilled', now() - interval '10 days'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 15000, 'fulfilled', now() - interval '7 days')
ON CONFLICT (id) DO NOTHING;

-- 6. Insert 3 verified reviews
INSERT INTO public.reviews (order_id, buyer_id, product_id, seller_id, rating, comment, seller_reply, created_at)
VALUES
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '22222222-2222-2222-2222-222222222222',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    5,
    'This template is absolutely stunning! The clean architecture and smooth Tailwind styling saved me over 40 hours of setup. Integration with Supabase auth was flawless. Would definitely buy again!',
    'Thank you Sarah! Glad you loved the Supabase setup. Let me know if you need help with deployment on Vercel.',
    now() - interval '3 days'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '33333333-3333-3333-3333-333333333333',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    4,
    'Excellent documentation and great code structure. Had a minor issue with the Stripe webhook routing initially, but the creator responded within an hour and helped me resolve it. Really solid product.',
    'Appreciate the feedback, Dan! Yes, Stripe webhooks can be tricky. I updated the docs to make that step clearer for future buyers.',
    now() - interval '7 days'
  ),
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '44444444-4444-4444-4444-444444444444',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    5,
    'The UI design alone is worth the price. I have bought three other starter kits before but this is by far the most premium-feeling and responsive one. The dark mode is especially impressive. Highly recommended!',
    NULL,
    now() - interval '14 days'
  );

-- 7. Manually sync product rating (the trigger should handle this going forward)
UPDATE public.products
SET
  review_count = (SELECT COUNT(*) FROM public.reviews WHERE product_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  average_rating = (SELECT ROUND(AVG(rating)::numeric, 1) FROM public.reviews WHERE product_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- Done! The product URL will be:
-- http://localhost:3000/marketplace/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
-- Login as any buyer (e.g. sarah@ventex-test.com / password123) to test writing a review
SELECT 'Seed complete! Visit /marketplace/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' AS message;
