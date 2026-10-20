# Ventex V3 Codebase & Architecture Audit

**Branch:** `v3-rebuild`  
**Date:** October 20, 2026  
**Mode:** Read-Only Audit (No code modified, no databases touched)

---

## 1. Build, Lint & Type Validation

Commands executed from project root:
* **`npm run lint`**: **0 errors, 0 warnings** (`✔ No ESLint warnings or errors`).
* **`npx tsc --noEmit`**: **0 errors** (TypeScript validation passed completely).
* **`npm run build`**: **Build passed (exit code 0)**. Generated all 79 static & dynamic pages successfully.
  * Notice / Warning: Next.js edge runtime warning on `/api/og` (expected for edge image generation), and `caniuse-lite` 6 months old warning from browserslist.

---

## 2. Dependency Vulnerabilities (`npm audit`)

Audit results across 1,085 packages:
* **Total Vulnerabilities:** 29
  * **Critical:** 2 (`serialize-javascript` RCE in terser/workbox dependency chain)
  * **High:** 23 (e.g. `brace-expansion`, `micromatch`, `glob`, `source-map-js`, `rollup-plugin-terser` inside `next-pwa` build tools)
  * **Moderate:** 4 (`argparse`, `sprintf-js`, `baseline-browser-mapping`)
  * **Low:** 0
  * **Info:** 0
* **Cause:** The vulnerabilities are concentrated in build tools, specifically `next-pwa` (which bundles an older `workbox-build` and `rollup-plugin-terser`), and dev CLI utilities. No direct client-facing application libraries have critical exploits.

---

## 3. Unused Dependencies & Dead Components

### Unused Packages in `package.json`
* **Production Dependencies:**
  * `pg` — Postgres node client, completely unused in code (Supabase client `@supabase/ssr` is used instead).
  * `react-simple-maps` & `@types/react-simple-maps` — Leftover from removed map/intelligence screens.
* **Dev Dependencies:**
  * `@playwright/test` — Root test files were deleted in early cleanup; dev script still present.

### Unused Components (Nothing imports or renders them)
1. `components/BuyerGuard.tsx` — Unused role guard (onboarding and dashboard handle buyer routing; no page imports this component).
2. `components/FloatingStatusRail.tsx` — Old layout status ticker (removed from `Layout.tsx`).
3. `components/marketplace/BuyViaWhatsApp.tsx` — Leftover from old direct store purchase button.
4. `components/PitchScorePanel.tsx` — Standalone scoring widget not imported anywhere.
5. `components/RevealBoot.tsx` — Old animation boot component removed in design foundation.
6. `components/StratosphereBackground.tsx` — Previous animated canvas background (replaced by design foundation CSS grain).
7. `components/Testimonials.tsx` — Queries missing `founder_stories` table; not used on home page.

---

## 4. File-by-File & Folder-by-Folder Verdicts

Evaluation against Ventex V3 Plan:
* **In Plan:** Founder workspace (private pitches, versions, AI mentor), Discover (AI score + star rating), Pitch page (stars, comments, express funding interest), Marketplace (founders list first product, buyers send "I'm interested"), Login/Roles (founder, investor, buyer, admin), Admin moderation, plus About, FAQ, Contact, Terms, Privacy, Seller Agreement, Refund Policy.
* **Verdicts:**
  * **KEEP**: Works cleanly and aligns with the V3 plan.
  * **REBUILD**: In plan, but uses the old layout/colors or requires modernization.
  * **REMOVE**: Out of plan (leftover legacy features, schemes, portfolios, deals).

### `app/` (Pages & Layouts)

| Path / Folder | Verdict | Plain-Language Reason |
|---|---|---|
| `app/layout.tsx` | **KEEP** | Root layout, loads Space Grotesk & DM Sans via next/font, dark theme metadata. |
| `app/globals.css` | **KEEP** | Core design system tokens (`--ink`, `--paper`, `--red`, typography, motion). |
| `app/page.tsx` | **KEEP** | Rebuilt landing page matching design foundation. |
| `app/admin/page.tsx` | **REBUILD** | In plan, but uses old styling and lacks clean modern admin cards. |
| `app/admin/pitches/page.tsx` | **REBUILD** | In plan (pitch review queue), but old styling and bulky layout. |
| `app/admin/pitches/[id]/page.tsx` | **REBUILD** | In plan (pitch moderation detail & approval), needs design polish. |
| `app/admin/products/page.tsx` | **REBUILD** | In plan (product moderation), needs design foundation update. |
| `app/admin/users/page.tsx` | **REBUILD** | In plan (user management & banning), needs design foundation update. |
| `app/admin/deals/page.tsx` | **REMOVE** | Out of plan (Deals feature removed). |
| `app/admin/disputes/page.tsx` | **REMOVE** | Out of plan (No payments/escrow orders in V3). |
| `app/admin/flagged/page.tsx` | **REMOVE** | Out of plan (Old automated contact filter flags). |
| `app/admin/industries/page.tsx` | **KEEP** | In plan (Manage industry categories). |
| `app/admin/locations/page.tsx` | **KEEP** | In plan (Manage country and state taxonomy). |
| `app/buyer/dashboard/page.tsx` | **REBUILD** | In plan (Buyer role dashboard), currently uses old styling. |
| `app/buyer/purchases/page.tsx` | **REMOVE** | Out of plan (Order history from removed payment system). |
| `app/contact/page.tsx` | **REBUILD** | In plan, needs design foundation styling and wiring to `contact_submissions`. |
| `app/dashboard/page.tsx` | **KEEP** | In plan (Central role router redirecting users to appropriate dashboard). |
| `app/discover/page.tsx` | **REBUILD** | In plan, but needs modern redesign and connection to `discover_pitches` view. |
| `app/faq/page.tsx` | **REBUILD** | In plan, needs design foundation styling. |
| `app/about/page.tsx` | **REBUILD** | In plan, needs design foundation styling. |
| `app/terms/page.tsx` | **REBUILD** | In plan, needs design foundation styling. |
| `app/privacy/page.tsx` | **REBUILD** | In plan, needs design foundation styling. |
| `app/seller-agreement/page.tsx` | **REBUILD** | In plan, needs design foundation styling. |
| `app/refund-policy/page.tsx` | **REBUILD** | In plan, needs design foundation styling. |
| `app/delivery-policy/page.tsx` | **REMOVE** | Out of plan (Physical delivery policy leftover from old store). |
| `app/forgot-password/page.tsx` | **REBUILD** | In plan, needs design foundation styling. |
| `app/founder/dashboard/page.tsx` | **REBUILD** | In plan (Founder hub), needs design foundation styling and pitch versions widget. |
| `app/founder/pitches/page.tsx` | **REBUILD** | In plan (List of founder pitches), needs design foundation styling. |
| `app/founder/create-pitch/page.tsx`| **REBUILD** | In plan (Pitch editor & snapshot saver), needs cleanup & design refresh. |
| `app/founder/settings/page.tsx` | **REBUILD** | In plan (Founder profile settings), needs design foundation styling. |
| `app/founder/store/page.tsx` | **REBUILD** | In plan (Marketplace product listing management for founders). |
| `app/founder/store/new-product/page.tsx` | **REBUILD** | In plan (Create marketplace product). |
| `app/founder/store/deals/page.tsx`| **REMOVE** | Out of plan (Discount deals and promo codes system). |
| `app/founder/boost/page.tsx` | **REMOVE** | Out of plan (Paid boost packs). |
| `app/investor/portal/page.tsx` | **REBUILD** | In plan (Investor view of startups), needs design foundation styling. |
| `app/investor/portfolio/page.tsx` | **REMOVE** | Out of plan (Complex portfolio tracker not in V3 plan). |
| `app/investor/settings/page.tsx` | **REBUILD** | In plan (Investor profile settings), needs design foundation styling. |
| `app/investors/page.tsx` | **REBUILD** | In plan (Landing page for investors), needs design foundation styling. |
| `app/investors/leaderboard/page.tsx` | **REMOVE** | Out of plan (Queries non-existent columns `pitches_reviewed_count`). |
| `app/learn/*` (8 guides) | **REMOVE** | Out of plan (Static SEO content articles, out of V3 scope). |
| `app/login/page.tsx` | **REBUILD** | In plan, currently uses old card styling with hardcoded white borders. |
| `app/marketplace/page.tsx` | **REBUILD** | In plan (Browse products), needs redesign and inquiry flow integration. |
| `app/marketplace/[id]/page.tsx` | **REBUILD** | In plan (Product detail), contains old payment stubs and broken `build_requests`. |
| `app/messages/page.tsx` | **REBUILD** | In plan (Founder-investor chat), needs design foundation styling. |
| `app/messages/[conversationId]/page.tsx` | **REBUILD** | In plan, needs design foundation styling. |
| `app/onboarding/*` (8 subpages) | **REBUILD** | In plan (Role selection & onboarding), needs design foundation styling. |
| `app/pitch/[id]/page.tsx` | **REBUILD** | In plan (Public pitch page), needs stars rating and inquiry flow. |
| `app/pitches/new/page.tsx` | **REMOVE** | Duplicate of `app/founder/create-pitch/page.tsx`. |
| `app/profile/[userId]/page.tsx` | **REBUILD** | In plan (Public user profile), needs design foundation styling. |
| `app/resources/schemes/page.tsx`| **REMOVE** | Out of plan (Government grant scheme search). |
| `app/saved-products/page.tsx` | **REMOVE** | Dead redirect stub to `/marketplace`. |
| `app/settings/page.tsx` | **REBUILD** | In plan (Global user account settings). |
| `app/signup/page.tsx` | **REBUILD** | In plan, needs design foundation styling. |
| `app/unauthorized/page.tsx` | **KEEP** | In plan (Access denied fallback page). |

### `components/`

| Path | Verdict | Plain-Language Reason |
|---|---|---|
| `components/Navbar.tsx` | **KEEP** | Rebuilt in design foundation; fully functional. |
| `components/Footer.tsx` | **KEEP** | Rebuilt in design foundation; fully functional. |
| `components/Layout.tsx` | **KEEP** | Rebuilt in design foundation; manages grain and cursor atmosphere. |
| `components/MagneticButton.tsx` | **KEEP** | Core design system component. |
| `components/ScrollMotion.tsx` | **KEEP** | Core scroll tracker component. |
| `components/ScrollReveal.tsx` | **KEEP** | Core typography and reveal animation component. |
| `components/CursorFollower.tsx` | **KEEP** | Core interactive cursor atmosphere component. |
| `components/FounderGuard.tsx` | **KEEP** | Protects founder-only routes. |
| `components/InvestorGuard.tsx` | **KEEP** | Protects investor-only routes. |
| `components/BuyerGuard.tsx` | **REMOVE** | Unused component. |
| `components/ThemeToggle.tsx` | **REMOVE** | App is locked to dark theme (`--ink`), toggle is obsolete. |
| `components/PitchCard.tsx` | **REBUILD** | Needs design foundation restyling for the Discover feed. |
| `components/SponsoredCard.tsx` | **REMOVE** | Out of plan (Ad sponsorships removed from V3). |
| `components/marketplace/ProductCard.tsx` | **REBUILD** | Needs design foundation restyling. |
| `components/marketplace/BuyViaWhatsApp.tsx` | **REMOVE** | Unused dead component. |
| `components/PitchScorePanel.tsx` | **REMOVE** | Unused dead component. |
| `components/FloatingStatusRail.tsx` | **REMOVE** | Unused dead component. |
| `components/RevealBoot.tsx` | **REMOVE** | Unused dead component. |
| `components/StratosphereBackground.tsx` | **REMOVE** | Unused dead component. |
| `components/Testimonials.tsx` | **REMOVE** | Queries missing table and unused on landing page. |

### `lib/`, `services/`, `providers/`, `public/` & Config

| Path | Verdict | Plain-Language Reason |
|---|---|---|
| `lib/brand.ts` | **KEEP** | Central brand constant (`SITE_NAME = "Ventex"`). |
| `lib/site.ts` | **KEEP** | Metadata and site URL helpers. |
| `lib/supabase.ts` | **KEEP** | Browser Supabase client. |
| `lib/role-routing.ts` | **KEEP** | Clean role redirection logic. |
| `lib/api-security.ts` | **KEEP** | Rate limiting and request sanitation helpers. |
| `lib/email.ts` | **KEEP** | Notification email helper. |
| `lib/pitch-validation.ts` | **KEEP** | Pitch input validator. |
| `services/newsService.ts` | **REMOVE** | News fetcher service (news feature was removed). |
| `public/manifest.json` | **KEEP** | PWA manifest configured for Ventex. |
| `public/robots.txt` & `sitemap-0.xml` | **KEEP** | SEO and crawler discovery files. |
| `next-sitemap.config.js` | **REBUILD** | Still contains old `https://www.folenzo.com` URL. Needs update to ventex domain. |
| `next.config.mjs` | **KEEP** | Configured with PWA and security headers. |
| `tailwind.config.ts` | **KEEP** | Foundation tokens mapped. |

---

## 5. API Routes Audit

| Route | In Plan? | Checks Auth? | Checks Role? | Validates Input? | Server-Only Key? | Plain-Language Notes |
|---|---|---|---|---|---|---|
| `/api/auth/callback` | **YES** | Yes | N/A | Yes | No | OAuth exchange route. Safe. |
| `/api/digests/weekly` | **NO** | No | Yes (secret) | Yes | No | Cron digest route. Out of plan. |
| `/api/emails` | **YES** | No | Yes (secret) | Yes | No | Transactional email sender. Uses `INTERNAL_API_SECRET`. |
| `/api/emails/trigger` | **YES** | No | Yes (secret) | Yes | No | Trigger email sender. Uses `TRIGGER_SECRET`. |
| `/api/generate-summary`| **YES** | Yes | Yes (admin/owner) | Yes | No | AI pitch summary generator using Anthropic/Gemini. |
| `/api/og` | **YES** | N/A | N/A | Yes | No | Dynamic OpenGraph image generator. Safe. |
| `/api/pitch-deck/[pitchId]` | **YES** | No | No | Yes | **YES** | **SECURITY VULNERABILITY**: Uses `SUPABASE_SERVICE_ROLE_KEY` to download private pitch decks without verifying user session or ownership. |
| `/api/products/questions` | **YES** | No | No | Yes | No | Inserts Q&A. Relies on Supabase trigger auth. |
| `/api/promo/validate` | **NO** | No | No | Yes | **YES** | Uses service role key to check discount codes. Out of plan. |
| `/api/purchase-intent` | **YES** | Yes | Yes | Yes | No | Marketplace "I'm interested" inquiry creation. In plan. |
| `/api/schemes` | **NO** | No | No | No | No | Government scheme lookup. Out of plan. |
| `/api/score-pitch` | **YES** | Yes | Yes | Yes | No | AI pitch evaluation endpoint. In plan. |
| `/api/whatsapp-link` | **NO** | No | No | Yes | No | Old WhatsApp contact generator. Out of plan. |

---

## 6. Security Analysis

1. **Client-Side Secret Exposure:**
   * **Clean:** No service role keys, API keys (OpenAI, Gemini, Resend), or secrets are referenced or exposed in client bundles (`process.env.NEXT_PUBLIC_*` only contains public Supabase URL/Anon key, site URL, and contact email addresses).
2. **Missing Auth / IDOR Vulnerability in API:**
   * **`app/api/pitch-deck/[pitchId]/route.ts`**: Uses `SUPABASE_SERVICE_ROLE_KEY` to sign download URLs for pitch decks from private storage without checking whether the requesting user is authenticated, the founder, or an authorized investor. Any visitor with a pitch UUID can download the confidential pitch deck. Needs session check.
3. **Open Redirects:**
   * **Clean:** All router push and redirect destinations are hardcoded string paths or safe role mappings. None read unvalidated URL query parameters (`?redirect=...`).
4. **Service Worker & PWA Caching:**
   * `next-pwa` registers `/sw.js` covering the entire root scope (`scope: '/'`). If cached heavily, users might see stale versions of client dashboards unless explicitly bypassed with cache-busting headers.

---

## 7. Code Quality & Technical Debt

* **Leftover "Folenzo" Brand References:**
  * Only **1** mention remains across all active code: line 3 of `next-sitemap.config.js` (`siteUrl: 'https://www.folenzo.com'`).
* **TODO / FIXME Comments (3 occurrences):**
  * `app/marketplace/page.tsx:537`: `{/* TODO: wire to inquiry flow */}`
  * `app/marketplace/[id]/page.tsx:695`: `{/* TODO: wire to inquiry flow */}`
  * `app/pitch/[id]/page.tsx:1031`: `{/* TODO: wire to inquiry flow */}`
* **Active `console.log` Calls:**
  * Only **2** active debugging logs found: `app/founder/create-pitch/page.tsx` (lines 373 & 392).
* **Huge Files Over 500 Lines (Candidates for refactoring):**
  1. `app/pitch/[id]/page.tsx` (1,375 lines) — Monolithic pitch display page.
  2. `app/founder/create-pitch/page.tsx` (1,174 lines) — Multi-step form.
  3. `app/marketplace/[id]/page.tsx` (1,054 lines) — Monolithic product page.
  4. `app/globals.css` (1,052 lines) — Consolidated CSS design foundation.
  5. `app/founder/store/deals/page.tsx` (813 lines) — To be removed.
  6. `app/page.tsx` (742 lines) — Landing page.
  7. `app/admin/pitches/[id]/page.tsx` (639 lines) — Pitch moderation view.
  8. `app/marketplace/page.tsx` (610 lines) — Marketplace catalog.

---

## 8. Environment Variables Specification

The application references the following environment variables (names only, no secrets):

| Variable Name | Client or Server? | Purpose / Used For |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public (Client & Server) | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (Client & Server) | Supabase public anonymous access key |
| `NEXT_PUBLIC_SITE_URL` | Public (Client & Server) | Site domain URL for canonical SEO & auth callbacks |
| `NEXT_PUBLIC_BASE_URL` | Public (Client & Server) | Secondary base domain URL |
| `NEXT_PUBLIC_APP_NAME` | Public (Client & Server) | Application display name |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Public (Client & Server) | Support contact link |
| `NEXT_PUBLIC_LEGAL_EMAIL` | Public (Client & Server) | Terms & legal contact link |
| `NEXT_PUBLIC_PRIVACY_EMAIL` | Public (Client & Server) | Privacy policy contact link |
| `NEXT_PUBLIC_ADMIN_EMAIL` | Public (Client & Server) | Default administrator contact |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-Only (Private) | Admin client for summary generation & pitch deck access |
| `INTERNAL_API_SECRET` | Server-Only (Private) | Secret protecting internal `/api/emails` endpoints |
| `TRIGGER_SECRET` | Server-Only (Private) | Secret protecting background event triggers |
| `RESEND_API_KEY` | Server-Only (Private) | Transactional email delivery via Resend |
| `GEMINI_API_KEY` | Server-Only (Private) | AI pitch scoring and summary extraction |
| `OPENAI_API_KEY` | Server-Only (Private) | Optional fallback LLM provider for AI evaluations |
| `ANTHROPIC_API_KEY` | Server-Only (Private) | Optional fallback LLM provider for AI evaluations |
| `DEEPSEEK_API_KEY` | Server-Only (Private) | Optional fallback LLM provider for AI evaluations |
| `NODE_ENV` | System Runtime | Production vs development environment indicator |

---

## Summary of Key Recommendations

1. **Security Fix Required:** Add authentication and authorization checks to `/api/pitch-deck/[pitchId]/route.ts` to prevent unauthorized pitch deck downloads.
2. **Clean Dead Files:** Safely delete out-of-plan legacy pages (`app/admin/deals`, `app/admin/disputes`, `app/buyer/purchases`, `app/learn/*`, `app/resources/schemes`, `app/founder/store/deals`) and the 7 unused components to reduce bundle weight and simplify maintenance.
3. **Domain Fix:** Update `siteUrl` in `next-sitemap.config.js` to eliminate the last leftover "folenzo" domain reference.
4. **Wire Inquiries:** Replace the 3 `{/* TODO: wire to inquiry flow */}` placeholder comments with the active `/api/purchase-intent` modal.
