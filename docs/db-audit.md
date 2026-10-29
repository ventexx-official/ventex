# Database & Architecture Audit Report

**Branch:** `v3-rebuild`  
**Date:** October 20, 2026  
**Mode:** Read-Only Audit (No code or migrations modified)

---

## 1. TABLES

Every database table queried via `.from("...")` or `.rpc("...")` in the current codebase (`app/`, `components/`, `lib/`, `services/`, `providers/`, and `middleware.ts`), checked against the SQL files in `supabase/` and `supabase/migrations/`:

| # | Table Name | Created in Migrations / SQL? | Files Where Defined in `supabase/` | Main App Code Locations |
|---|---|---|---|---|
| 1 | `blacklist` | **Yes** | `early-access-features.sql`, `migrations/20260616000000_audit_fixes.sql`, `migrations/20260619000000_missing_tables_and_rls.sql` | `app/admin/deals/page.tsx` |
| 2 | `build_requests` | **No** | *Not found in any SQL or migration file* | `app/marketplace/[id]/page.tsx` |
| 3 | `buyer_addresses` | **Yes** | `migrations/007_investor_buyer.sql` | `app/onboarding/buyer/page.tsx` |
| 4 | `comments` | **Yes** | `schema.sql` | `app/pitch/[id]/page.tsx` |
| 5 | `contact_submissions` | **No** | *Not found in any SQL or migration file* | `app/contact/page.tsx` |
| 6 | `conversations` | **Yes** | `early-access-features.sql`, `migrations/001_conversations.sql` | `app/messages/page.tsx`, `app/pitch/[id]/page.tsx`, `components/Navbar.tsx` |
| 7 | `countries` | **Yes** | `migrations/20260615010000_buyer_locations.sql` | `app/admin/locations/actions.ts`, `app/admin/locations/page.tsx`, `app/onboarding/buyer/page.tsx` |
| 8 | `data_room_agreements` | **Yes** | `events-arena.sql`, `migrations/20260616000000_audit_fixes.sql`, `migrations/20260619000000_missing_tables_and_rls.sql` | `app/pitch/[id]/page.tsx` |
| 9 | `deals` | **Yes** | `early-access-features.sql`, `migrations/20260616000000_audit_fixes.sql`, `migrations/20260619000000_missing_tables_and_rls.sql` | `app/admin/deals/page.tsx`, `app/founder/create-pitch/page.tsx`, `app/investor/portal/page.tsx`, `app/pitch/[id]/page.tsx` |
| 10 | `disputes` | **Yes** | `schema.sql` | `app/admin/disputes/page.tsx` |
| 11 | `feature_flags` | **Yes** | `migrations/20260616000000_audit_fixes.sql`, `migrations/20260619000000_missing_tables_and_rls.sql` | `app/admin/page.tsx`, `app/api/digests/weekly/route.ts`, `app/investors/leaderboard/page.tsx` |
| 12 | `flagged_attempts` | **Yes** | `flagged-attempts.sql` | `app/admin/flagged/page.tsx`, `app/marketplace/[id]/page.tsx` |
| 13 | `founder_stories` | **No** | *Not found in any SQL or migration file* | `components/Testimonials.tsx` |
| 14 | `investor_interests` | **Yes** | `schema.sql` | `app/founder/dashboard/page.tsx`, `app/investor/portal/page.tsx`, `app/pitch/[id]/page.tsx` |
| 15 | `messages` | **Yes** | `early-access-features.sql`, `migrations/001_conversations.sql` | `components/Navbar.tsx` |
| 16 | `notifications` | **Yes** | `schema.sql` | `app/founder/create-pitch/page.tsx`, `app/marketplace/[id]/page.tsx`, `app/pitch/[id]/page.tsx` |
| 17 | `orders` | **Yes** | `schema.sql` | `app/admin/disputes/page.tsx`, `app/buyer/purchases/page.tsx`, `app/founder/dashboard/page.tsx`, `app/marketplace/page.tsx`, `app/marketplace/[id]/page.tsx` |
| 18 | `pitch_scores` | **Yes** | `schema.sql`, `batches-a-to-e.sql` | `app/api/score-pitch/route.ts` |
| 19 | `pitches` | **Yes** | `schema.sql`, `pitch-update.sql`, `early-access-features.sql` | `app/admin/pitches/page.tsx`, `app/admin/pitches/[id]/page.tsx`, `app/discover/page.tsx`, `app/founder/dashboard/page.tsx`, `app/founder/pitches/page.tsx`, `app/founder/create-pitch/page.tsx`, `app/pitch/[id]/page.tsx`, `app/page.tsx` |
| 20 | `portfolio_entries` | **Yes** | `early-access-features.sql` | `app/investor/portfolio/page.tsx` |
| 21 | `portfolio_updates` | **Yes** | `early-access-features.sql` | `app/investor/portfolio/page.tsx` |
| 22 | `products` | **Yes** | `schema.sql` | `app/admin/products/page.tsx`, `app/founder/store/page.tsx`, `app/founder/store/new-product/page.tsx`, `app/founder/store/deals/page.tsx`, `app/marketplace/page.tsx`, `app/marketplace/[id]/page.tsx` |
| 23 | `promo_codes` | **Yes** | `schema.sql`, `migrations/20260619000000_missing_tables_and_rls.sql` | `app/api/promo/validate/route.ts`, `app/founder/store/deals/page.tsx` |
| 24 | `purchase_intents` | **Yes** | `migrations/002_purchase_intents.sql` | `app/api/purchase-intent/route.ts` |
| 25 | `reviews` | **Yes** | `schema.sql` | `app/marketplace/[id]/page.tsx` |
| 26 | `saved_pitches` | **Yes** | `schema.sql`, `batches-a-to-e.sql`, `migrations/20260619000000_missing_tables_and_rls.sql` | `app/founder/create-pitch/page.tsx`, `app/investor/portal/page.tsx`, `app/pitch/[id]/page.tsx` |
| 27 | `sectors` | **Yes** | `admin-features.sql` | `app/admin/industries/page.tsx` |
| 28 | `sponsorships` | **Yes** | `migrations/20260616000000_audit_fixes.sql`, `migrations/20260619000000_missing_tables_and_rls.sql` | `app/discover/page.tsx` |
| 29 | `states` | **Yes** | `migrations/20260615010000_buyer_locations.sql` | `app/admin/locations/actions.ts`, `app/admin/locations/page.tsx`, `app/onboarding/buyer/page.tsx` |
| 30 | `users` | **Yes** | `schema.sql`, `migrations/006_roles.sql`, `migrations/007_investor_buyer.sql` | `middleware.ts`, `app/dashboard/page.tsx`, `components/Navbar.tsx`, `components/*Guard.tsx`, `app/settings/page.tsx`, `app/onboarding/*` |

**Stored Procedures (`.rpc(...)` calls):**  
* **None** currently called directly in application code (`.rpc(...)` count = 0). SQL files still define functions like `handle_new_user()`, `append_product_question()`, and `handle_review_changes()`.

---

## 2. COLUMNS

Comparison between columns read or written by frontend/backend code versus columns defined across `schema.sql` and migration scripts:

### Pitch Queries Breakdown
* **Founder Dashboard Query (`app/founder/dashboard/page.tsx`):**
  * Reads: `id, title, status, created_at` where `founder_id = session.user.id`
  * Status in Database: **Match.** All 5 columns (`id`, `title`, `status`, `created_at`, `founder_id`) exist in `schema.sql` and `pitch-update.sql`.
* **Founder Pitch Creation/Update (`app/founder/create-pitch/page.tsx`):**
  * Fallback present: The code explicitly catches errors on `custom_qa` and retries without it (`if (error && error.message?.includes('custom_qa'))`), because `custom_qa` was added in later scripts (`pitch-update.sql`).
* **Discover Page Query (`app/discover/page.tsx`):**
  * Reads: `id, title, is_raising, industry, company_stage, round_closes_at, tagline, ai_summary, short_description, amount_seeking, state, country, created_at`
  * Status in Database: **Match.** All these columns are defined on `pitches`.

### Column Mismatches Detected Across Other Tables
1. **`users` Table:**
   * Code in `app/investors/leaderboard/page.tsx` selects `pitches_reviewed_count` and `intros_made_count`.
   * Neither column is defined in `schema.sql` or any migration file. If a user visits the leaderboard, Supabase returns a column missing error or nulls.
2. **`products` Table:**
   * One file previously referenced `user_id` instead of `seller_id`, though `app/founder/store/page.tsx` correctly uses `.eq("seller_id", session.user.id)`. The column in the database is `seller_id`.
3. **`build_requests` Table:**
   * Used in `app/marketplace/[id]/page.tsx` (requests custom builds with fields `buyer_id`, `seller_id`, `product_id`, `name`, `project_description`, `budget_range`, `timeline_needed`, `contact_email`, `status`).
   * The database defines `project_requests` in `schema.sql` with columns `buyer_id`, `seller_id`, `product_id`, `requirements`, `quoted_price`, `status`, but the table named `build_requests` is **never created**.
4. **`contact_submissions` Table:**
   * Form in `app/contact/page.tsx` inserts `{ name, email, subject, message }`.
   * Table `contact_submissions` has no `CREATE TABLE` statement in any SQL file.
5. **`founder_stories` Table:**
   * Component `components/Testimonials.tsx` selects from `founder_stories`.
   * Table does not exist in any SQL file.

---

## 3. SECURITY (ROW LEVEL SECURITY - RLS)

### Status by Table
* **Tables with RLS Enabled in SQL:**
  * `users` — Enabled (`schema.sql`, `migrations/20260620000000_fix_rls_infinite_recursion.sql`)
  * `pitches` — Enabled (`schema.sql`, `rls-policies.sql`, `migrations/20260620000000_fix_rls_infinite_recursion.sql`)
  * `products` — Enabled (`rls-policies.sql`, `migrations/008_products_mentorships.sql`)
  * `orders` — Enabled (`rls-policies.sql`)
  * `reviews` — Enabled (`rls-policies.sql`)
  * `saved_pitches` — Enabled (`schema.sql`, `migrations/20260619000000_missing_tables_and_rls.sql`)
  * `investor_interests` — Enabled (`migrations/20260615030000_investor_interests_rls.sql`)
  * `deals` — Enabled (`migrations/20260616000000_audit_fixes.sql`, `migrations/20260619000000_missing_tables_and_rls.sql`)
  * `blacklist` — Enabled (`migrations/20260616000000_audit_fixes.sql`, `migrations/20260619000000_missing_tables_and_rls.sql`)
  * `conversations` & `messages` — Enabled (`migrations/001_conversations.sql`, `migrations/20260620020000_auth_rls_initplan_fix.sql`)
  * `purchase_intents` — Enabled (`migrations/002_purchase_intents.sql`, `migrations/20260620020000_auth_rls_initplan_fix.sql`)
  * `buyer_addresses` — Enabled (`migrations/007_investor_buyer.sql`)
  * `feature_flags` — Enabled (`migrations/004_security_lint_fixes.sql`)
  * `sponsorships` — Enabled (`migrations/20260616000000_audit_fixes.sql`)
  * `promo_codes` — Enabled (`rls-policies.sql`)
  * `notifications` — Enabled (`migrations/20260619000000_missing_tables_and_rls.sql`, `migrations/20260620020000_auth_rls_initplan_fix.sql`)
  * `data_room_agreements` — Enabled (`events-arena.sql`, `migrations/20260616000000_audit_fixes.sql`)
  * `flagged_attempts` — Enabled (`flagged-attempts.sql`)
  * `portfolio_entries` & `portfolio_updates` — Enabled (`early-access-features.sql`)

* **Tables with NO RLS Found in SQL:**
  * `build_requests` (table does not exist)
  * `contact_submissions` (table does not exist)
  * `founder_stories` (table does not exist)
  * `sectors` (defined in `admin-features.sql` without an explicit `ALTER TABLE sectors ENABLE ROW LEVEL SECURITY`)
  * `countries` & `states` (defined in `migrations/20260615010000_buyer_locations.sql` with public read access but lacking explicit RLS enable statements)

### Critical Permission Checks on `pitches`
1. **Can an admin read and update ALL pitches (to approve/reject)?**
   * **Yes.** In `migrations/20260620000000_fix_rls_infinite_recursion.sql` and `migrations/20260620020000_auth_rls_initplan_fix.sql`, the policy `"Allow admins to manage all pitches"` grants `FOR ALL` access to admins using either `public.is_current_user_admin()` or `EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')`.
2. **Can a founder read their own private/draft pitches?**
   * **Yes.** In `schema.sql`:
     ```sql
     CREATE POLICY "Founders can view their own pitches" ON public.pitches FOR SELECT USING (auth.uid() = founder_id);
     CREATE POLICY "Founders can update their own pitches" ON public.pitches FOR UPDATE USING (auth.uid() = founder_id);
     ```
     This allows founders to view and edit draft, pending, or live pitches they own.
3. **Can the public read only published pitches?**
   * **Yes.** In `supabase/rls-policies.sql`:
     ```sql
     CREATE POLICY "Allow public select on live pitches" ON public.pitches FOR SELECT USING (status = 'live');
     ```
     Visitors and non-owners can only see rows where `status = 'live'`.

---

## 4. STORAGE BUCKETS

Storage buckets referenced in application code vs. defined in SQL:

| Bucket Name Used in Code | Referenced Files | Created in SQL / Migrations? |
|---|---|---|
| `pitch_decks` | `app/api/pitch-deck/[pitchId]/route.ts` | **No.** No SQL file executes `INSERT INTO storage.buckets (id, name, ...) VALUES ('pitch_decks', ...);`. |
| `ventex-assets` | `app/founder/create-pitch/page.tsx` (logos, pitch decks, demo videos, documents) | **No.** No SQL file executes `INSERT INTO storage.buckets ... ('ventex-assets', ...)`. |
| `avatars` | (Referenced as default in Supabase storage types) | **No.** Not created in migrations. |

*Storage buckets are currently created manually in the Supabase Dashboard, not via automated migration scripts.*

---

## 5. REDIRECTS & AUTH NAVIGATION

All redirects triggered across authentication, onboarding, and role guards, and whether the destination page exists:

| Trigger / Source | Target Route | Intended Role / Condition | Destination Exists? | Target File |
|---|---|---|---|---|
| Signup submit (`app/signup/page.tsx`) | `/dashboard` | All new signups | **Yes** | `app/dashboard/page.tsx` |
| Login submit (`app/login/page.tsx`) | `/dashboard` | All authenticated users | **Yes** | `app/dashboard/page.tsx` |
| Dashboard router (`app/dashboard/page.tsx`) | `/admin` | Admin role | **Yes** | `app/admin/page.tsx` |
| Dashboard router (`app/dashboard/page.tsx`) | `/founder/dashboard` | Founder role (onboarding complete) | **Yes** | `app/founder/dashboard/page.tsx` |
| Dashboard router (`app/dashboard/page.tsx`) | `/investor/portal` | Investor role (onboarding complete) | **Yes** | `app/investor/portal/page.tsx` |
| Dashboard router (`app/dashboard/page.tsx`) | `/buyer/dashboard` | Buyer role (onboarding complete) | **Yes** | `app/buyer/dashboard/page.tsx` |
| Dashboard router (`app/dashboard/page.tsx`) | `/discover` | Visitor or fallback | **Yes** | `app/discover/page.tsx` |
| Dashboard router (`app/dashboard/page.tsx`) | `/onboarding/role` | Missing or visitor role | **Yes** | `app/onboarding/role/page.tsx` |
| Dashboard router (`app/dashboard/page.tsx`) | `/onboarding/founder` | Founder (incomplete onboarding) | **Yes** | `app/onboarding/founder/page.tsx` |
| Dashboard router (`app/dashboard/page.tsx`) | `/onboarding/investor` | Investor (incomplete onboarding) | **Yes** | `app/onboarding/investor/page.tsx` |
| Dashboard router (`app/dashboard/page.tsx`) | `/onboarding/buyer` | Buyer (incomplete onboarding) | **Yes** | `app/onboarding/buyer/page.tsx` |
| Role picker (`app/onboarding/role/page.tsx`) | `/onboarding/founder` | Chose Founder | **Yes** | `app/onboarding/founder/page.tsx` |
| Role picker (`app/onboarding/role/page.tsx`) | `/onboarding/investor` | Chose Investor | **Yes** | `app/onboarding/investor/page.tsx` |
| Role picker (`app/onboarding/role/page.tsx`) | `/onboarding/buyer` | Chose Buyer | **Yes** | `app/onboarding/buyer/page.tsx` |
| Role picker (`app/onboarding/role/page.tsx`) | `/onboarding/visitor` | Chose Visitor / Explorer | **Yes** | `app/onboarding/visitor/page.tsx` |
| Founder Dashboard (`app/founder/dashboard/page.tsx`) | `/founder/create-pitch` | Founder has 0 pitches | **Yes** | `app/founder/create-pitch/page.tsx` |
| Navbar Logout (`components/Navbar.tsx`) | `/` | All roles after sign out | **Yes** | `app/page.tsx` |
| Unauthenticated guard redirect | `/login` | Logged-out user accessing private route | **Yes** | `app/login/page.tsx` |
| Saved Products stub (`app/saved-products/page.tsx`) | `/marketplace` | Any user | **Yes** | `app/marketplace/page.tsx` |

*Every single redirect target currently resolves to an existing Next.js page (`page.tsx`). No 404 dead-ends were found among the redirect paths.*

---

## 6. AUTH ROLES

### Storage of Roles
* **Database Column:** `public.users.role` (text).
* **Allowed Values (defined in `migrations/006_roles.sql`):**
  * `'founder'`
  * `'investor'`
  * `'buyer'`
  * `'visitor'` (also supports `'explorer'` in check constraint)
  * `'admin'`
* **Secondary Admin Indicator:** `public.users.is_admin` (boolean, defaults to `false`).

### Checking Roles in Code
1. **Server-Side (`middleware.ts`):**
   * Uses `@supabase/ssr` to inspect active session user.
   * Fetches `profile.role` from `public.users`.
   * Enforces path prefixes:
     * `/founder/*` requires `role === 'founder' || role === 'admin'`
     * `/investor/*` requires `role === 'investor' || role === 'admin'`
     * `/admin/*` requires `role === 'admin'`
     * Non-authorized requests get redirected to `/discover`.
2. **Client-Side Page Guards:**
   * `components/FounderGuard.tsx`: checks `profile.role`. If investor, sends to `/investor/portal`; if buyer, sends to `/buyer/dashboard`; if not logged in, sends to `/login`.
   * `components/InvestorGuard.tsx`: checks `profile.role`. If founder, sends to `/founder/dashboard`; if buyer, sends to `/buyer/dashboard`.
   * `components/BuyerGuard.tsx`: checks `profile.role`. If investor, sends to `/investor/portal`; if founder, sends to `/founder/dashboard`.
3. **Database Level (RLS):**
   * Admin actions verify either `is_current_user_admin()` or `(SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'`.

---

## 7. MIGRATIONS AUDIT: DUPLICATIONS & CONFLICTS

There are **two competing sources of truth** in the `supabase/` directory:
1. **Root SQL Scripts:** `supabase/*.sql` (16 ad-hoc development scripts like `schema.sql`, `admin-features.sql`, `batches-a-to-e.sql`, `pitch-update.sql`, `early-access-features.sql`, `rls-policies.sql`, etc.)
2. **Timestamped / Numbered Migration Folder:** `supabase/migrations/*.sql` (16 formal migration files).

### Specific Duplications & Ordering Conflicts:
1. **Root scripts vs. Migrations folder duplication:**
   * `supabase/schema.sql` creates baseline tables (`users`, `pitches`, `orders`, `reviews`, etc.).
   * `supabase/migrations/001_conversations.sql` through `008_products_mentorships.sql` then modify those same tables.
   * `supabase/early-access-features.sql` creates `deals`, `blacklist`, `portfolio_entries`. But `migrations/20260616000000_audit_fixes.sql` and `migrations/20260619000000_missing_tables_and_rls.sql` recreate those exact same tables with `CREATE TABLE IF NOT EXISTS`.
2. **Admin Policy Recursion Flip-Flops:**
   * In `migrations/20260619000000_missing_tables_and_rls.sql`: admin policies were written as `USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))`. This caused Postgres infinite recursion when querying `users`.
   * In `migrations/20260620000000_fix_rls_infinite_recursion.sql`: dropped those recursive policies and introduced `public.is_current_user_admin()` (a `SECURITY DEFINER` function).
   * In `migrations/20260620020000_auth_rls_initplan_fix.sql` (dated just 2 hours later): the script reverted the policies back to `EXISTS (SELECT 1 FROM public.users WHERE id = (select auth.uid()) AND role = 'admin')`, potentially re-introducing the recursion warning.
   * In `migrations/20260622000000_consolidate_rls_policies.sql`: policy names were changed yet again to consolidated names (e.g. `articles_select_policy`, `cart_items_admin_policy`).
3. **Out-of-Order / Orphaned Schema Files:**
   * `supabase/batches-a-to-e.sql`, `events-arena.sql`, and `xp-and-runway.sql` contain tables for removed features (e.g., `arena_applications`, `catalysts`, `xp` columns).
   * `supabase/seed-folenzo-demo.sql` and `supabase/seed-reviews-test.sql` contain hardcoded test seed data referencing old names and deprecated columns (`folenzo_access`).
4. **Dropped Column Conflict:**
   * `migrations/005_remove_folenzo_access.sql` explicitly drops the `folenzo_access` column from `public.users`.
   * However, `supabase/schema.sql` still includes `folenzo_access boolean DEFAULT false` in its definition of `CREATE TABLE public.users`. Running `schema.sql` on a fresh database will recreate this unwanted column.
