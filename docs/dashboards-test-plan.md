# Investor, Buyer, Explorer, and Admin Dashboards Test Plan

This manual test plan verifies all dashboards, shared settings, and access control policies against `supabase/schema.sql` and `components/ui-kit`.

## Prerequisites
- Branch: `v3-rebuild`
- In `.env.local`: `NEXT_PUBLIC_ENABLE_APP=true`
- Accounts required (or role updated via Supabase Table Editor on `profiles`):
  1. **User - Investor**: `role = 'investor'`, `onboarding_complete = true`
  2. **User - Buyer**: `role = 'buyer'`, `onboarding_complete = true`
  3. **User - Explorer**: `role = 'visitor'`, `onboarding_complete = true`
  4. **User - Admin**: `role = 'admin'`, `onboarding_complete = true`

---

### Test 1: Investor Dashboard (`/investor/portal`)
1. Log in as Investor.
2. Verify redirect or navigation lands on `/investor/portal`.
3. Check UI elements:
   - Header: `"Welcome, [FirstName]"` with subtitle.
   - Profile summary card: Displays display name, headline, avatar, completeness hint, and button to `/settings`.
   - Top Pitches Right Now: Up to 6 live pitches ordered by combined score from `discover_pitches`. Shows logo or initial, title, tagline, stage, AI score, rating with count, founder name.
   - Public page link: Verify cards are **not links** when `ENABLE_PUBLIC_PITCH_PAGE = false` (or links to `/pitch/[id]` when true).
   - My Funding Interests: Lists submitted expressions of interest with pitch title, date, and message.
   - Action: Click **"Withdraw interest"** -> confirm dialog -> record deleted from `funding_interests`.
   - "Messages" card: Shows `"Talk directly with founders. Coming soon."` with no button while `ENABLE_MESSAGING = false`.
   - Navigation: Sidebar has Dashboard, Discover, Messages (disabled with "Soon"), Settings.
4. Try accessing `/admin` as this investor -> redirected to `/discover`.

---

### Test 2: Buyer Dashboard (`/buyer/dashboard`)
1. Log in as Buyer.
2. Navigate to `/buyer/dashboard`.
3. Check UI elements:
   - Header: `"Welcome, [FirstName]"`.
   - My Requests: Lists sent product inquiries from `product_inquiries` with product name, message excerpt, date, and status tag (new, replied, closed).
   - Delivery Addresses:
     - Click **"Add address"** -> enter Full Name, Line 1, City, Country -> save. Verify appears in list.
     - Edit an existing address -> verify changes persist.
     - Click **"Set default"** -> updates `is_default` flag.
     - Click **"Delete"** -> confirms and removes address.
   - Marketplace Highlights: Up to 4 live products linking to `/marketplace/[id]`.
   - "Messages" card: Shows `"Message sellers directly. Coming soon."`
   - Navigation: Sidebar has Dashboard, Marketplace, Messages (disabled with "Soon"), Settings.
4. Try accessing `/investor/portal` as this buyer -> redirected to `/discover`.

---

### Test 3: Explorer Home (`/explorer`)
1. Log in as an Explorer (`role = 'visitor'`, `onboarding_complete = true`).
2. Verify landing route is `/explorer` (not `/discover`).
3. Check UI elements:
   - Header: `"Welcome, [FirstName]"`.
   - "Ready to build, back or buy?" card explaining Founder, Investor, and Buyer roles, with note `"Role upgrades are coming soon"`.
   - Trending Pitches: Up to 6 live pitches from `discover_pitches`.
   - Fresh in the Marketplace: Up to 4 newest live products.
   - Navigation: Sidebar has Home (`/explorer`), Discover (`/discover`), Marketplace (`/marketplace`), Settings (`/settings`).
4. Try accessing `/admin` or `/founder/dashboard` -> redirected away.

---

### Test 4: Admin Governance Portal (`/admin`)
1. Log in as Admin.
2. Navigate to `/admin`.
3. Check UI elements:
   - Overview tiles with live counts: Total Users (breakdown by role), Pitches (live vs removed), Products (live vs removed), Inquiries, Contact submissions.
   - **Pitches Table**:
     - Filter by status (All, Live, Draft, Removed) and search by title or founder.
     - Action **"Take down"**: Click -> enters required removal reason -> confirms -> status becomes `removed` and `removed_reason` recorded.
     - Action **"Restore"**: Click -> confirms -> status returns to `draft` and removal reason cleared.
   - **Products Table**:
     - Filter and search by product or seller.
     - Action **"Take down"** with reason and **"Restore"** to draft.
   - **Users Table**:
     - Displays all registered profiles with joined date and country.
     - Role dropdown: Change a user from `visitor` to `founder` -> confirms -> role updates in `profiles`.
     - Self-protection: Attempting to remove your own `admin` role triggers an alert block.
   - **Contact Messages Table**:
     - Lists all submissions from `contact_submissions` in reverse chronological order with name, email, subject, date, and full message.
4. Try accessing as a regular user -> redirected to `/discover`.

---

### Test 5: Shared Settings (`/settings`)
1. Log in as any role and navigate to `/settings`.
2. Check UI elements:
   - Profile Details: Displays editable Display Name (max 100), Company (max 150), Headline (max 200), Bio (max 2000), Country, City.
   - Current Role: Displayed as read-only badge.
   - Avatar Upload: Upload a JPG/PNG/WebP image under 2MB -> uploaded to `avatars` bucket at `{userId}/avatar.{ext}` and `avatar_url` updated in `profiles`.
   - Change Password: Enter new password (min 8 chars) and confirm -> submits `supabase.auth.updateUser`.
   - Sign Out button: Logs user out and redirects to `/login`.

---

### Test 6: Mobile Responsiveness (360px & 390px)
1. In Chrome DevTools, inspect in mobile view (360x640 and 390x844).
2. Verify:
   - Zero horizontal scroll across all dashboards.
   - Sticky bottom navigation bar with icons and minimum 44px tap targets.
   - Tables collapse cleanly with horizontal scrolling container or stacked view.
   - Form inputs and dialogs fit viewport with comfortable padding.
