# Ventex Production Audit Report

**Audit Date:** 2026-06-16  
**Auditor:** Principal Software Architect / Staff Engineer  
**Target:** Ventex platform (ventex-eight.vercel.app)

---

## Executive Summary

**Verdict: NOT PRODUCTION READY. Core business flow is broken at multiple points.**

Ventex is a startup pitch + marketplace platform built on Next.js 14 + Supabase. The front-end UI is polished, but nearly every backend system has critical flaws:

- **Stripe is NOT integrated.** There are `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `.env.local` (test keys), but zero server-side Stripe code exists — no checkout creation, no webhook handler, no charge processing. The entire payment system is UI only.
- **Every Supabase admin API call fails.** `SUPABASE_SERVICE_ROLE_KEY` is set to `service_role_placeholder`. All server-side routes using `createSupabaseAdmin()` will fail.
- **Admin moderation is broken by RLS.** The `pitches` table lacks admin RLS policies. Admin dashboard and moderation queue use the browser client, so admins only see their own pitches. Approve/reject operations silently fail.
- **Founder dashboard shows no pitches.** It queries `.eq('user_id', ...)` but the column is `founder_id`.
- **No AI provider keys configured.** `GEMINI_API_KEY`, `OPENAI_API_KEY`, `DEEPSEEK_API_KEY` are all unset. The Anthropic key in `.env.local` is never used. AI summary generation and pitch scoring silently fall through all providers and fail.
- **Email delivery is dead.** `RESEND_API_KEY` is `re_placeholder`. Emails are logged, not sent.
- **Missing database tables.** `deals`, `blacklist`, `sponsorships`, `feature_flags`, `data_room_agreements`, and `articles` are queried by production pages but do not exist in any migration.
- **Redirects point to non-existent routes.** Auth callback redirects to `/investor/portal`, `/buyer/dashboard`, `/onboarding/role` — none exist.

---

# 1. ARCHITECTURE REPORT

| Component | Technology | Status |
|-----------|-----------|--------|
| Framework | Next.js 14.2.35 (App Router) | ✅ |
| Language | TypeScript 5 | ✅ |
| Styling | Tailwind CSS 3 | ✅ |
| Database | Supabase (PostgreSQL) | ⚠️ Missing tables |
| Auth | Supabase Auth (email + Google OAuth) | ✅ |
| Storage | None | ❌ No file storage configured |
| Email | Resend (free tier) | ❌ Placeholder key |
| Payment | Stripe | ❌ No server-side integration |
| AI | Gemini → OpenAI → DeepSeek fallback | ❌ No keys configured |
| State | React useState + useEffect | ✅ |
| Testing | Jest + Playwright | ⚠️ No meaningful tests |
| CI/CD | Vercel | ✅ |
| SEO | next-sitemap | ✅ Sitemap exists |

**Critical:** `package.json` has no `@stripe/stripe-js` or `stripe` in dependencies. Stripe is referenced only in `.env.local` and one UI field marked as `stripe_price_id` (whose placeholder says "ko-fi.com").

---

# 2. ROUTE REPORT

## Public Routes (no auth required)

| Route | Purpose | Navbar | Footer | Working? |
|-------|---------|--------|--------|----------|
| `/` | Homepage | ✅ | ✅ | ✅ |
| `/discover` | Startup discovery feed | ✅ | ✅ | ⚠️ (sponsorships table missing) |
| `/marketplace` | Product marketplace | ✅ | ✅ | ⚠️ (sponsorships table missing) |
| `/marketplace/[id]` | Product detail | Link | - | ⚠️ (build was broken, now fixed) |
| `/pricing` | Pricing page | ✅ | ✅ | ✅ |
| `/login` | Login | ✅ | - | ✅ |
| `/signup` | Signup | ✅ | - | ✅ |
| `/about` | About page | - | ✅ | ✅ |
| `/contact` | Contact | ✅ | - | ✅ |
| `/events` | Events/live | ✅ | - | ✅ |
| `/investors` | Investors page | ✅ | - | ✅ |
| `/catalyst` | Catalyst program | ✅ | - | ✅ |
| `/terms` | Terms of service | - | ✅ | ✅ |
| `/privacy` | Privacy policy | - | ✅ | ✅ |
| `/seller-agreement` | Seller agreement | - | ✅ | ✅ |
| `/refund-policy` | Refund policy | - | ✅ | ✅ |
| `/delivery-policy` | Delivery policy | - | ✅ | ✅ |
| `/resources` | Resources | ✅ | - | ✅ |
| `/intelligence` | Intelligence center | ✅ | - | ✅ |
| `/pitches` | All pitches listing | - | - | ⚠️ (check separately) |
| `/robots.txt` | Crawler config | - | - | ✅ (app/robots.ts exists) |
| `/sitemap.xml` | Sitemap | - | - | ✅ (app/sitemap.ts exists) |

## Protected Routes (auth required)

| Route | Purpose | Working? |
|-------|---------|----------|
| `/dashboard` | Role-based redirect | ⚠️ Redirects to non-existent routes |
| `/founder/dashboard` | Founder dashboard | ❌ `user_id` instead of `founder_id` |
| `/founder/create-pitch` | Create pitch | ⚠️ (untested form submission) |
| `/founder/pitches` | My pitches | ? |
| `/founder/store` | My store | ? |
| `/founder/store/new-product` | New product | ? |
| `/founder/become-seller` | Become seller | ? |
| `/founder/settings` | Founder settings | ? |
| `/founder/boost` | Boost pitch | ? |
| `/pitch/[id]` | Pitch detail | ⚠️ (references `deals` table) |
| `/admin` | Admin overview | ⚠️ (RLS blocks pitch stats) |
| `/admin/pitches` | Moderation queue | ⚠️ (RLS blocks non-live pitches) |
| `/admin/pitches/[id]` | Pitch review | ❌ (RLS + service role both fail) |
| `/admin/products` | Product moderation | ✅ (has admin RLS policy) |
| `/admin/users` | User management | ⚠️ (RLS on users table blocks) |
| `/admin/deals` | Deal management | ❌ (`deals` + `blacklist` tables missing) |
| `/admin/disputes` | Dispute management | ? |
| `/admin/flagged` | Flagged content | ✅ |
| `/admin/industries` | Industry management | ✅ (`sectors` table exists) |
| `/admin/locations` | Location management | ✅ (`countries`/`states` tables exist) |
| `/onboarding/role` | Role selection | ❌ Route does not exist |
| `/onboarding/founder` | Founder onboarding | ? |
| `/onboarding/investor` | Investor onboarding | ? |
| `/onboarding/buyer` | Buyer onboarding | ? |
| `/onboarding/visitor` | Visitor onboarding | ? |
| `/messages` | Messages | ? |
| `/orders` | My orders | ? |
| `/order-confirmation` | Order confirmation | ❌ (no payment system) |
| `/payment-success` | Payment success | ❌ (legacy/broken) |
| `/saved-products` | Saved products | ? |
| `/settings` | Settings | ? |
| `/profile` | Profile | ? |
| `/deal-room` | Deal room | ? |
| `/arena` | Pitch arena | ? |
| `/battle` | Pitch battles | ? |
| `/live` | Live events | ? |
| `/challenge` | Cold pitch challenge | ? |
| `/ecosystem` | Ecosystem | ? |

## Orphan Routes (not linked anywhere in Navbar/Footer)
- `/about`
- `/arena`
- `/battle`
- `/booster-packs`
- `/catalyst`
- `/challenge`
- `/ecosystem`
- `/events`
- `/intelligence`
- `/live`
- `/messages`
- `/orders`
- `/order-confirmation`
- `/payment-success`
- `/saved-products`
- `/settings`
- `/profile`
- `/deal-room`
- `/forgot-password`
- `/unauthorized`
- `/founder/boost`
- `/founder/settings`
- `/founder/store`
- `/founder/store/new-product`
- `/founder/become-seller`

## Non-Existent Routes (referenced in code)
- `/investor/portal` — referenced by `app/dashboard/page.tsx` and `app/auth/callback/page.tsx`
- `/buyer/dashboard` — referenced by `app/dashboard/page.tsx` and `app/auth/callback/page.tsx`
- `/onboarding/role` — referenced by `app/auth/callback/page.tsx`, file exists but it's a directory (no `page.tsx`)
- `/onboarding/founder` — directory exists but `page.tsx` content unknown
- `/markeplace/orders` — referenced in email template `app/api/emails/route.ts` (typo: "markeplace" vs "marketplace")
- `/unsubscribe` — referenced in email footer `app/api/emails/route.ts`
- `/pitches/new` — referenced by dashboard but this path is `/founder/create-pitch`

---

# 3. DATABASE REPORT

## Tables in `schema.sql` (core)
| Table | Purpose | RLS Enabled | Admin RLS Policy | Queried By |
|-------|---------|------------|-----------------|------------|
| `users` | User profiles | ✅ | ❌ | All pages |
| `pitches` | Startup pitches | ✅ | ❌ | Admin, Discover, Pitch detail |
| `products` | Marketplace products | ✅ | ✅ | Admin products, Marketplace |
| `orders` | Purchase orders | ✅ | ❌ | Admin dashboard |
| `reviews` | Product reviews | ✅ | ❌ | Product detail |
| `comments` | Pitch comments | ❌ | ❌ | Pitch detail |
| `investor_interests` | Investor pitch interests | ❌ | ❌ | Pitch detail, Founder dash |
| `deal_room_messages` | Deal room chat | ❌ | ❌ | Deal room |
| `notifications` | User notifications | ❌ | ❌ | (unclear) |
| `cart_items` | Shopping cart | ❌ | ❌ | Cart page |
| `saved_pitches` | Saved/bookmarked pitches | ✅ | ❌ | Saved pitches |
| `pitch_scores` | AI pitch scores | ❌ | ❌ | Pitch detail |
| `catalysts` | Catalyst program members | ❌ | ❌ | Catalyst page |
| `pitch_battles` | Pitch battle votes | ❌ | ❌ | Battle page |
| `promo_codes` | Discount codes | ✅ | ✅ | Promo validation API |
| `disputes` | Order disputes | ❌ | ❌ | Admin disputes |
| `project_requests` | Custom build requests | ❌ | ❌ | Marketplace detail |

## Tables from Migrations (separate SQL files)
| Table | Migration File | Exists in DB? |
|-------|---------------|--------------|
| `conversations` | `001_conversations.sql` | ⚠️ Unknown (must be applied) |
| `messages` | `001_conversations.sql` | ⚠️ Unknown |
| `purchase_intents` | `002_purchase_intents.sql` | ⚠️ Unknown |
| `whatsapp` (column) | `003_whatsapp_field.sql` | ⚠️ Unknown |
| `kofi_donations` | `20260615040000_kofi_donations.sql` | ⚠️ Unknown |
| `countries` | `20260615010000_buyer_locations.sql` | ⚠️ Unknown |
| `states` | `20260615010000_buyer_locations.sql` | ⚠️ Unknown |

## Tables from Standalone SQL files (may NOT be applied)
| Table | SQL File | In schema.sql or migrations? |
|-------|---------|---------------------------|
| `sectors` | `admin-features.sql` | ❌ Separate file |
| `flagged_attempts` | `flagged-attempts.sql` | ❌ Separate file |
| `xp` / `runway` | `xp-and-runway.sql` | ❌ Separate file |

## Missing Tables (queried by production code, NOT in any SQL file)
| Table | Queried By | Impact |
|-------|-----------|--------|
| `deals` | `admin/deals/page.tsx`, `lib/deal-enforcement.ts` | ❌ Admin deals page shows empty, enforcement code is dead |
| `blacklist` | `admin/deals/page.tsx` | ❌ Blacklist table empty |
| `sponsorships` | `discover/page.tsx:56`, `marketplace/page.tsx` | ❌ Sponsorships never load |
| `feature_flags` | `admin/page.tsx:101` | ❌ Feature flags silently fail to load/save |
| `data_room_agreements` | `pitch/[id]/page.tsx` (import references) | ❌ Data room fails |
| `articles` | `api/cron/fetch-news/route.ts` | ❌ Cron job silently fails |

## `verified_founder` Column
- Used by: `admin/users/page.tsx` (column `verified_founder`)
- Added by: `admin-features.sql` (Day 41 migration, separate from schema)
- **Risk:** Column may not exist if `admin-features.sql` was never applied

---

# 4. API REPORT

| Route | Purpose | Status | Issue |
|-------|---------|--------|-------|
| `POST /api/emails` | Send transactional emails | ❌ | `RESEND_API_KEY` = `re_placeholder` (logs, doesn't send) |
| `POST /api/emails/trigger` | Trigger email by event | ❌ | Uses `createSupabaseAdmin()` = placeholder key |
| `POST /api/generate-summary` | AI summary for pitches | ❌ | `createSupabaseAdmin()` module-level = fails; no AI keys |
| `POST /api/score-pitch` | AI pitch scoring | ❌ | `createSupabaseAdmin()` module-level = fails; no AI keys |
| `POST /api/promo/validate` | Validate promo code | ❌ | `createSupabaseAdmin()` module-level = fails |
| `POST /api/purchase-intent` | Create purchase intent | ❌ | `createSupabaseAdmin()` module-level = fails |
| `POST /api/products/questions` | Ask product question | ❌ | `createSupabaseAdmin()` module-level = fails |
| `POST /api/kofi-webhook` | Ko-fi donation webhook | ❌ | `createSupabaseAdmin()` = fails; `kofi_donations` table may not exist |
| `POST /api/xp/award` | Award XP to user | ❌ | `createSupabaseAdmin()` = fails |
| `POST /api/schemes` | Government scheme lookup | ❌ | No AI keys configured |
| `GET /api/cron/fetch-news` | Fetch Hacker News articles | ❌ | `createSupabaseAdmin()` = fails; `articles` table missing |
| `GET /api/og` | Open Graph images | ? | `route.tsx` exists |
| `POST /api/digests/weekly` | Weekly email digests | ❌ | Email system is broken |

### API Failure Chain

Every API route that calls `createSupabaseAdmin()` (`lib/supabase-admin.ts`) creates:
```typescript
createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // = 'service_role_placeholder'
);
```

The service role key is a literal placeholder string. The resulting Supabase client:
- Will connect to the Supabase URL successfully (it doesn't validate on creation)
- Will fail on every actual query/operation because the key is invalid
- Errors are silently caught and logged in most routes, causing silent failures

**6 out of 11 API routes** have this exact problem due to module-level service role client creation.

---

# 5. PAYMENT / STRIPE AUDIT

## Stripe Dependency Graph

```
.env.local
  ├─ STRIPE_SECRET_KEY = sk_test_...     (test key, unused)
  ├─ STRIPE_WEBHOOK_SECRET = whsec_placeholder  (unused)
  └─ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_...  (test key, unused)

package.json dependencies: ❌ stripe / @stripe/stripe-js NOT INSTALLED

Usage in code:
  ├─ app/founder/store/new-product/page.tsx
  │   └─ stripe_price_id field (text input, placeholder says "ko-fi.com URL")
  ├─ app/marketplace/[id]/page.tsx
  │   └─ Links to stripe_price_id (dead link)
  ├─ app/order-confirmation/page.tsx
  │   └─ Queries stripe_session_id (dead field)
  └─ app/founder/become-seller/page.tsx
      └─ Stripe Connect UI (disconnected shell)
```

## What Would Break If Stripe Is Removed

**Nothing.** Stripe has zero functional integration. Removing Stripe from `.env.local` changes:
- Nothing in the running application
- No build errors (no Stripe imports exist)
- No runtime errors

**What to do:** Either remove Stripe entirely or implement proper Stripe integration with the official SDK.

---

# 6. ADMIN AUDIT

## Root Cause: Dashboard/Queue Inconsistency

**The admin dashboard shows pitch counts; the moderation queue shows zero items.**

**Why:** The `pitches` table has RLS policies for:
1. Founders (own pitches) — in `schema.sql`
2. Public (status = 'live' only) — in `rls-policies.sql`

**What's missing:** Admin override policy for `pitches`, like the one `products` has:
```sql
-- EXISTS for products (app/admin/products/page.tsx works)
CREATE POLICY "Allow admins to manage all products"
  ON public.products FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- MISSING for pitches (app/admin/pitches/page.tsx is broken)
```

**Detailed flow:**
1. Admin visits `/admin` — dashboard queries `pitches` via browser client
2. RLS applies: only founder's own pitches + public live pitches are visible
3. Dashboard shows total: some pitches visible (mostly live ones)
4. Admin clicks Pending tab in `/admin/pitches` — filtered by `status = 'pending'`
5. RLS applies: no pending pitches are visible (they're not `status = 'live'` and not owned by admin)
6. **Zero pending pitches shown** despite dashboard showing non-zero pending count

**Evidence:**
- `app/admin/page.tsx:46`: `supabase.from("pitches").select("status")` — RLS filters results
- `app/admin/pitches/page.tsx:44`: `supabase.from("pitches").select(...)` — same issue
- `app/admin/pitches/[id]/page.tsx:132`: update `{ status: "live" }` — RLS blocks UPDATE

## All Admin Pages Uses Browser Client
Every admin page imports `supabase` from `@/lib/supabase` (browser client with anon key). This means:
- **Working**: Products (has admin RLS policy), Flagged (has admin policies), Industries (sectors table), Locations (countries/states)
- **Broken**: Pitches (no admin RLS), Users (own profile only), Deals (missing tables)
- **Potentially broken**: Disputes (no admin RLS unless created separately)

---

# 7. STARTUP WORKFLOW REPORT (Core Business Flow)

**Buggy at every step:**

### Step 1: User signs up
✅ `app/signup/page.tsx` — Works. Creates auth user, trigger creates profile row.

### Step 2: User chooses role
❌ Auth callback redirects to `/onboarding/role` — **directory exists but no `page.tsx` at that path**. The `onboarding/role/` is a directory with subdirectories, not a page. This redirect returns a 404.

### Step 3: User navigates to create pitch
❌ `app/founder/dashboard/page.tsx:18` queries `.eq('user_id', session.user.id)` — column is `founder_id`, not `user_id`. **Dashboard shows no pitches.**

### Step 4: User creates pitch
⚠️ `app/founder/create-pitch/page.tsx` — 1182 lines of complex form. Untested.

### Step 5: User submits pitch
❌ Form submission likely calls `supabase.from("pitches").insert(...)` — would need to check.

### Step 6: Pitch enters moderation queue
❌ Admin queue at `/admin/pitches` — RLS blocks display of non-live pitches.

### Step 7: Admin reviews pitch
❌ `/admin/pitches/[id]/page.tsx` — approve calls:
1. `supabase.from("pitches").update({ status: "live" })` — **BLOCKED by RLS** (no admin policy)
2. `fetch("/api/generate-summary")` — **FAILS** (service role key is placeholder, no AI keys)

### Step 8: Pitch appears in discovery feed
❌ Cannot reach this step if admin moderation is broken.

**Core business flow is COMPLETELY broken.** A pitch cannot be created → moderated → published to discovery.

---

# 8. AUTH AUDIT

| Feature | Status | Details |
|---------|--------|---------|
| Registration | ✅ | Email + Google OAuth via Supabase |
| Login | ✅ | Email/password + Google |
| Session persistence | ✅ | Supabase SSR cookies |
| Auth trigger (new user) | ✅ | `handle_new_user()` function works |
| Role assignment | ❌ | No role selection after signup; `/onboarding/role` 404s |
| Role routing in middleware | ⚠️ | Routes to `/buyer/dashboard`, `/investor/portal` which don't exist |
| Admin check (middleware) | ⚠️ | Admin layout checks `profile.role !== "admin"` — works |
| Password reset | ? | `/forgot-password` exists |

**RLS Policy Audit:**
- `users` table: Users can only see/update their own profile. **Admin users page broken**.
- `pitches` table: Founders own, public reads live only. **No admin override.**
- `comments`, `cart_items`, `notifications`, `pitch_scores`, `investor_interests`, `deal_room_messages`, `catalysts`, `project_requests`: **No RLS at all.**
- `orders`, `reviews`, `saved_pitches`, `promo_codes`, `conversations`, `messages`, `purchase_intents`: Have RLS.

---

# 9. DATA INTEGRITY REPORT

## Placeholder Values in `.env.local`
- `SUPABASE_SERVICE_ROLE_KEY=service_role_placeholder` — **every admin API fails**
- `RESEND_API_KEY=re_placeholder` — **email silently logs instead of sending**
- `STRIPE_WEBHOOK_SECRET=whsec_placeholder` — **webhook verification broken**
- No `GEMINI_API_KEY`, `OPENAI_API_KEY`, `DEEPSEEK_API_KEY` — **AI features dead**
- `NEXT_PUBLIC_BASE_URL=https://ventex-eight.vercel.app` — **deployment URL, may change**

## Mock/Demo Data
- `app/marketplace/[id]/page.tsx:54`: `MOCK_REVIEWS` constant (used in demo mode)
- `app/founder/create-pitch/page.tsx`: Hardcoded `SECTORS` array (duplicated from DB sectors table)
- `app/discover/page.tsx:10`: Hardcoded `INDUSTRIES` and `STAGES` arrays (should come from DB)
- `app/pricing/page.tsx`: Static pricing page content
- `supabase/seed-ventex-demo.sql`: Demo seed data (would load fake pitches)

## Hardcoded Values
- `app/discover/page.tsx:98`: Filter country options hardcoded as `['United States', 'United Kingdom', 'Germany', 'India']`
- `app/founder/create-pitch/page.tsx:24`: 44 SECTORS hardcoded (also in admin-features.sql)
- `app/admin/page.tsx:16`: 11 FEATURE_FLAGS hardcoded
- `app/api/schemes/route.ts:4`: 5 FALLBACK_SCHEMES hardcoded (AI fallback)

---

# 10. UX AUDIT

| Issue | Location | Severity |
|-------|----------|----------|
| Empty state on admin deals | `admin/deals/page.tsx` | Major (silent failure, no error shown) |
| Empty state on admin moderation queue | `admin/pitches/page.tsx` | Critical (shows zero items, not empty state) |
| Wrong redirect after login | `login/page.tsx:33` redirects to `/auth/callback` (spinner, then redirects again) | Minor |
| Broken "Create Pitch" link in dashboard | `founder/dashboard/page.tsx:21` redirects to `/pitches/new` | Minor (no such route) |
| "View My Order" links to `marketplace/orders` (typo) | `api/emails/route.ts:197` | Minor |
| `/unsubscribe` referenced but doesn't exist | `api/emails/route.ts:59` | Minor |
| No error state when pitches fail to load in admin | `admin/pitches/page.tsx` | Major |
| No loading state on admin pages (generic spinner only) | All admin pages | Minor |
| Cart CTA buttons may not work | `app/cart/page.tsx` | Major (no server-side checkout) |
| Buy Now / Request Work buttons on grid | `app/marketplace/page.tsx:458` (per prior audit) | Major |

---

# 11. ALL CRITICAL AND MAJOR ISSUES

## CRITICAL (blocking issues — platform is non-functional)

| # | Issue | Location | Root Cause |
|---|-------|----------|------------|
| C1 | **Admin RLS missing for pitches** | `supabase/rls-policies.sql` | No admin override policy; all admin operations on pitches fail |
| C2 | **Supabase service role key is placeholder** | `.env.local` | `SUPABASE_SERVICE_ROLE_KEY=service_role_placeholder` breaks 6+ API routes |
| C3 | **No Stripe server-side integration** | Entire app | `package.json` has no stripe dep; no checkout, webhook, or payment code exists |
| C4 | **No AI provider keys** | `.env.local` | `GEMINI_API_KEY`, `OPENAI_API_KEY`, `DEEPSEEK_API_KEY` all unset |
| C5 | **Resend API key is placeholder** | `.env.local` | `RESEND_API_KEY=re_placeholder` — all emails silently fail |
| C6 | **Missing database tables** | `schema.sql` + migrations | `deals`, `blacklist`, `sponsorships`, `feature_flags`, `data_room_agreements`, `articles` don't exist |
| C7 | **Founder dashboard broken** | `app/founder/dashboard/page.tsx:18` | Queries `.eq('user_id', ...)` instead of `.eq('founder_id', ...)` |
| C8 | **Auth callback redirects to 404** | `app/auth/callback/page.tsx:38` | Redirects to `/onboarding/role` which has no `page.tsx` |
| C9 | **Admin moderation approve/reject flow broken** | `app/admin/pitches/[id]/page.tsx` | RLS blocks update + API call to generate-summary fails |

## MAJOR (features work inconsistently or have significant impact)

| # | Issue | Location | Root Cause |
|---|-------|----------|------------|
| M1 | **Admin user management broken** | `app/admin/users/page.tsx` | RLS on `users` table restricts to own profile; admin can't see/update others |
| M2 | **Admin deals page broken** | `app/admin/deals/page.tsx` | `deals` and `blacklist` tables don't exist |
| M3 | **Discover sponsorships never load** | `app/discover/page.tsx:56` | `sponsorships` table doesn't exist |
| M4 | **Dashboard feature flags silent fail** | `app/admin/page.tsx:101` | `feature_flags` table doesn't exist |
| M5 | **All admin API routes fail** | 6 API route files | Module-level `createSupabaseAdmin()` with placeholder service role key |
| M6 | **Email trigger API broken** | `app/api/emails/trigger/route.ts:20` | Uses `createSupabaseAdmin()` at module level |
| M7 | **Pitch scoring API broken** | `app/api/score-pitch/route.ts:47` | AI provider chain fails + service role key |
| M8 | **Purchase intent API broken** | `app/api/purchase-intent/route.ts:6` | Service role key is placeholder |
| M9 | **Promo validation API broken** | `app/api/promo/validate/route.ts:4` | Service role key is placeholder |
| M10 | **News cron job broken** | `app/api/cron/fetch-news/route.ts` | `articles` table + AI provider + service role key all fail |
| M11 | **Missing RLS on 5+ tables** | `supabase/schema.sql` | `comments`, `cart_items`, `notifications`, `pitch_scores`, `investor_interests`, `deal_room_messages`, `catalysts`, `project_requests` have no RLS |
| M12 | **No pagination on admin pages** | All admin pages | Fetches ALL records; will break at scale |
| M13 | **Currency inconsistency** | Admin (USD) vs Discover (INR) | Different pages render same data in different currencies |
| M14 | **Standalone SQL files may not be applied** | `supabase/` root | `admin-features.sql`, `flagged-attempts.sql`, `xp-and-runway.sql`, etc. are outside `migrations/` |
| M15 | **Role-based routing to non-existent pages** | `app/dashboard/page.tsx` | `/investor/portal`, `/buyer/dashboard`, `/onboarding/role` don't exist |
| M16 | **Static placeholder price IDs** | `app/pricing/page.tsx` (per prior audit) | Placeholder Stripe price IDs |
| M17 | **Marketplace checkout trusts client** | `app/cart/page.tsx` (per prior audit) | No server-side checkout validation |

---

# 12. RECOMMENDED FIX ORDER

## Phase 1: Database and Configuration (fix the foundation)
1. **Apply all SQL migrations** to Supabase — run every `.sql` file in `supabase/` root AND `supabase/migrations/`
2. **Add admin RLS policies to `pitches`** (and other tables on this list)
3. **Add missing tables** (`deals`, `blacklist`, `sponsorships`, `feature_flags`, `data_room_agreements`, `articles`)
4. **Set real environment variables** in Vercel:
   - `SUPABASE_SERVICE_ROLE_KEY` — real service role key
   - `RESEND_API_KEY` — real Resend key
   - `GEMINI_API_KEY` (or one AI provider key)
   - `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` if implementing Stripe

## Phase 2: Core Business Flow (make the platform work)
5. **Fix auth callback** — add `app/onboarding/role/page.tsx` or fix redirect
6. **Fix founder dashboard** — change `user_id` → `founder_id`
7. **Fix admin moderation flow** — verify RLS policies work end-to-end
8. **Verify pitch submission → moderation → discovery pipeline**

## Phase 3: Payment (decide on payment strategy)
9. **Either remove Stripe or implement properly:**
   - If removing: delete `.env` vars, remove Stripe UI references
   - If implementing: add `@stripe/stripe-js` and `stripe` packages, build checkout + webhook

## Phase 4: APIs and Integrations
10. **Fix all API routes** — ensure service role key works, add proper error handling
11. **Fix email system** — real Resend key
12. **Fix AI system** — at minimum one AI provider key

## Phase 5: Security and Data
13. **Add RLS to unprotected tables**
14. **Standardize currency** across all pages
15. **Add pagination** to admin list pages
16. **Replace hardcoded data** with database-driven values

## Phase 6: User Experience
17. **Add missing routes** (`/investor/portal`, `/buyer/dashboard`)
18. **Fix dead links** (typos, non-existent routes)
19. **Add proper error states** to admin pages
20. **Implement proper empty states**

---

# FINAL VERDICT

**Ventex is NOT production ready. The core business flow is broken at every critical juncture.**

The platform has a polished front-end with significant architectural flaws underneath:
- The admin system cannot moderate content (RLS)
- The API layer cannot perform operations (placeholder keys)
- The payment system is a facade (no Stripe integration)
- The email system silently logs instead of sending
- The AI features are decorative (no provider keys)
- Authentication redirects to non-existent pages
- The founder dashboard shows no data (wrong column name)

**Estimated effort to fix: 2-4 weeks for a single developer**, assuming environment variables are obtained and SQL migrations are applied correctly. The most time-consuming fix would be implementing proper Stripe integration (or removing it), followed by fixing the API layer.
