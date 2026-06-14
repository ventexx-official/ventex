# Ventex Production Audit Report

Audit date: 2026-05-26  
Target: https://ventex.com/  
Repo: `C:\Users\HP\Ventex`

## Executive Summary

Ventex builds successfully and the public homepage performs reasonably well, but it is not payment-production-ready yet. The highest-risk issues are in checkout trust boundaries: subscription checkout trusts a client-supplied `userId` and `priceId`, marketplace checkout trusts a client-supplied `buyerId` and `discountPct`, and promo validation is not re-validated server-side during checkout.

The legal pages exist and are crawlable, and the site has HTTPS/HSTS via Vercel. However, `/robots.txt` is missing, most pages use generic SEO metadata, common browser security headers are not configured, and the marketplace currently shows no live products on production.

## Scope Tested

- Payment and checkout surface: pricing CTAs, cart redirect, marketplace checkout APIs, promo validation API, Stripe webhook code.
- UI/UX responsiveness: desktop and mobile viewport checks for home, marketplace, pricing, and login.
- SEO and technical health: metadata, sitemap, robots, build, lint, Lighthouse.
- Security: security headers, method handling, auth trust boundaries, service-role usage, webhook verification.
- Performance: Lighthouse homepage audit and production build output.
- Legal and compliance: availability and metadata for privacy, terms, and seller agreement.
- Additional coverage: accessibility, empty states, observability gaps, and deployment readiness.

## Test Results

### Build and Static Checks

- `npm run build`: Passed.
- `npm run lint`: Passed with warnings.
- Warnings:
  - `app/admin/pitches/[id]/page.tsx`: missing `useEffect` dependency `fetchPitchDetails`.
  - `app/layout.tsx`: Google Fonts loaded in `<head>` instead of Next font optimization.

### Lighthouse Homepage

Run against `https://ventex.com/`.

- Performance: 87
- Accessibility: 95
- Best Practices: 100
- SEO: 100
- FCP: 1.8s
- LCP: 2.5s
- Speed Index: 2.3s
- TBT: 380ms
- CLS: 0.003
- TTI: 3.8s

Note: Lighthouse wrote the JSON output to `scratch/lighthouse-home.json`, but the CLI ended with a Windows temp cleanup permission error after the audit completed.

### Live Route Checks

| Route | Status | Notes |
| --- | ---: | --- |
| `/` | 200 | Generic title and description |
| `/pricing` | 200 | Generic title and description |
| `/marketplace` | 200 | Generic title and description; no products visible |
| `/cart` | redirects to login in browser | Auth guard works for unauthenticated users |
| `/login` | 200 | Generic title and description |
| `/signup` | 200 | Generic title and description |
| `/privacy` | 200 | Custom metadata exists |
| `/terms` | 200 | Custom metadata exists |
| `/seller-agreement` | 200 | Custom metadata exists |
| `/sitemap.xml` | 200 | Present |
| `/robots.txt` | 404 | Missing |

## Critical Findings

### 1. Marketplace Checkout Trusts Client-Supplied Buyer and Discount

Severity: Critical  
Files:
- `app/api/marketplace/create-checkout/route.ts`
- `app/cart/page.tsx`
- `app/marketplace/[id]/page.tsx`

The marketplace checkout endpoint accepts `buyerId`, `discountPct`, and `promoCodeId` from the client. It uses a Supabase service role on the server, but it does not verify that the caller is authenticated as `buyerId`. It also applies `discountPct` directly to Stripe line items.

Impact:
- A malicious client can attempt checkout as another user ID.
- A malicious client can send `discountPct: 100` or higher and reduce payment amounts.
- Promo usage can be manipulated because validation and checkout are separate trust zones.

Evidence:
- `app/api/marketplace/create-checkout/route.ts:12` reads `cartItems`, `buyerId`, `discountPct`, and `promoCodeId` from request JSON.
- `app/api/marketplace/create-checkout/route.ts:96` computes `discountRate` from client-provided `discountPct`.
- `app/api/marketplace/create-checkout/route.ts:167` stores client-provided `buyerId` in Stripe metadata.
- `app/cart/page.tsx:166` sends `discountPct` to checkout.

Required fix:
- Require Supabase auth token on checkout requests.
- Resolve the buyer from `supabase.auth.getUser(token)` server-side.
- Re-validate promo code server-side inside checkout using `promoCodeId` or promo code, not client-provided `discountPct`.
- Clamp discounts server-side and reject invalid values.
- Verify cart items belong to the authenticated buyer when cart item IDs are submitted.

### 2. Subscription Checkout Trusts Client-Supplied User and Price

Severity: Critical  
Files:
- `app/api/stripe/create-checkout/route.ts`
- `app/pricing/page.tsx`
- `app/api/stripe/webhook/route.ts`

The subscription checkout endpoint accepts `userId` and `priceId` from the client and uses a service-role client to look up/update user billing state. There is no server-side verification that the caller owns `userId`, and there is no allowlist validation before passing `priceId` into Stripe checkout creation.

Impact:
- A malicious client can attempt to create checkout sessions for another user.
- A malicious client can attempt arbitrary Stripe price IDs.
- Webhook tier assignment relies on placeholder constants.

Evidence:
- `app/api/stripe/create-checkout/route.ts:12` reads `priceId` and `userId` from request JSON.
- `app/api/stripe/create-checkout/route.ts:55` passes client-provided `priceId` to Stripe.
- `app/pricing/page.tsx:69` and `app/pricing/page.tsx:87` use placeholder price IDs.
- `app/api/stripe/webhook/route.ts:28` and `app/api/stripe/webhook/route.ts:29` use placeholder price IDs.

Required fix:
- Authenticate the API request and derive `userId` server-side.
- Replace placeholder price IDs with environment variables.
- Validate `priceId` against a server-side allowlist.
- Consider storing plan mapping in config, not client code.

## High Findings

### 3. Marketplace Grid Buy Buttons Do Not Trigger Purchase

Severity: High  
File: `app/marketplace/page.tsx`

The product detail page has `handleBuyNow`, but the marketplace listing card's `Buy Now` and `Request Work` buttons have no click handler or link. Users can only proceed by opening a product detail page.

Evidence:
- `app/marketplace/page.tsx:458` renders `Request Work`.
- `app/marketplace/page.tsx:462` renders `Buy Now`.

Required fix:
- Make grid card actions link to product details or call the same add-to-cart/buy-now logic.
- Disable or hide direct purchase actions if checkout is unavailable.

### 4. Production Marketplace Is Empty

Severity: High  
Route: `/marketplace`

The production marketplace rendered filters and layout but no product cards. No visible empty-state card appeared in the browser text capture, even though the source has an empty-state branch.

Impact:
- Users cannot test or buy products from production.
- Payment testing cannot cover a full marketplace purchase without seeded live products and connected sellers.

Required fix:
- Seed production/staging with at least one live fixed-price product and one seller with Stripe Connect configured.
- Add a visible empty-state message if the product fetch returns zero rows.
- Surface fetch errors visibly in non-production logging/monitoring.

### 5. Security Headers Are Missing

Severity: High  
File: `next.config.mjs`

Observed on the homepage:
- Present: HTTPS and `strict-transport-security`
- Missing: `content-security-policy`
- Missing: `x-frame-options`
- Missing: `x-content-type-options`
- Missing: `referrer-policy`
- Missing: `permissions-policy`

Required fix:
- Add `headers()` in `next.config.mjs`.
- Start with conservative headers and explicitly allow Stripe, Supabase, Google Fonts, and any required analytics.
- Add a CSP report-only phase before enforcing if third-party scripts are still changing.

## Medium Findings

### 6. `/robots.txt` Is Missing

Severity: Medium  
Route: `/robots.txt`

`/sitemap.xml` exists, but `/robots.txt` returns 404.

Required fix:
- Add `app/robots.ts` and point crawlers to `/sitemap.xml`.

### 7. Page Metadata Is Too Generic

Severity: Medium  
File: `app/layout.tsx`

Most public pages use:
- Title: `Ventex`
- Description: `Where startups pitch, fund and sell.`

Impact:
- Search snippets are weak.
- Social previews are likely weak or missing.
- Duplicate titles reduce search clarity.

Required fix:
- Add page-specific `metadata` for home, pricing, marketplace, login/signup, discover, pitch pages, product pages, resources, and legal pages.
- Add absolute canonical URLs, Open Graph, and Twitter card metadata.

### 8. Legal Coverage Needs Checkout-Specific Policies

Severity: Medium

Existing legal pages:
- `/privacy`
- `/terms`
- `/seller-agreement`

Missing or needs verification before real payments:
- Refund and cancellation policy.
- Shipping/delivery policy, even if digital delivery only.
- Contact/support page with legal business contact.
- Grievance/contact officer details if targeting Indian users.
- Clear marketplace dispute, seller payout, tax/GST, and digital delivery terms.
- Consent language for DPDP Act 2023 data processing and deletion/access requests.

This is not legal advice; have counsel review before real-money launch.

### 9. Accessibility Contrast Issue

Severity: Medium

Lighthouse flagged insufficient foreground/background contrast on the homepage. Button names passed, links were crawlable, and accessibility score was strong overall at 95.

Required fix:
- Review low-contrast gray text on light backgrounds.
- Check focus states on filters, cards, and legal pages.
- Add accessible names to marketplace search/filter controls where labels are visual-only or ambiguous.

### 10. Performance Is Good But TBT Can Improve

Severity: Medium

Homepage performance score: 87. Total Blocking Time was 380ms, which is the main score drag. LCP was 2.5s, right on the threshold.

Required fix:
- Use `next/font` instead of Google font `<link>` in `app/layout.tsx`.
- Lazy-load heavier client sections.
- Audit large client components, especially ecosystem/admin/founder pages.
- Prefer server components for static marketing content where possible.

## Low Findings

### 11. Footer Copyright Is Stale

Severity: Low

The footer shows `© 2025 Ventex` while the audit date is 2026-05-26.

Required fix:
- Use the current year dynamically.

### 12. Contact Link Points to Missing Route

Severity: Low  
Route: `/pricing`

Pricing includes a support link to `/contact`, but that route was not found in the repo route list.

Required fix:
- Add `/contact` or change the link to a working support route/email.

## Payment Flow Test Notes

Unauthenticated pricing CTAs:
- `Get started free` navigates to `/signup`.
- `Get access` navigates to `/login?redirect=/pricing`.
- `Go Premium` navigates to `/login?redirect=/pricing`.

API behavior:
- `GET /api/marketplace/create-checkout`: 405.
- Empty `POST /api/marketplace/create-checkout`: 400 `Missing required fields`.
- `GET /api/stripe/create-checkout`: 405.
- Empty `POST /api/stripe/create-checkout`: 400 `Missing priceId or userId`.
- Empty `POST /api/promo/validate`: 400 with JSON error.

Not tested:
- Real Stripe card payment.
- Authenticated marketplace purchase.
- Stripe Connect seller payout.
- Webhook end-to-end processing.
- Real promo redemption against a populated cart.

Reason: no test credentials or seeded purchasable production product were available, and the audit avoided making a real charge.

## Recommended Fix Order

1. Lock down checkout auth and server-side validation for both subscription and marketplace checkout.
2. Replace Stripe placeholder price IDs with environment-backed real test/live price IDs.
3. Rework promo application so the checkout endpoint revalidates promo eligibility and computes discounts itself.
4. Add security headers in `next.config.mjs`.
5. Add `/robots.txt` and page-specific metadata/canonicals.
6. Seed staging/production test products and seller Stripe Connect accounts for repeatable checkout QA.
7. Fix marketplace grid CTA behavior.
8. Add refund/cancellation/shipping/contact/grievance policies before accepting real payments.
9. Improve contrast and `next/font` performance warning.
10. Add monitoring for checkout failures, webhook failures, Supabase errors, and payment conversion.

## Final Readiness Verdict

Current state: staging/demo-ready, not payment-production-ready.

The site is visually functional, responsive checks did not show horizontal overflow at tested desktop/mobile widths, and the build is healthy. The blockers are payment security and operational readiness. Fix the checkout trust boundaries before any real money goes through the platform.
