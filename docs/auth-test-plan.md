# Authentication & Onboarding Test Plan

This document outlines the step-by-step manual test checklist covering every branch of authentication, session management, and role onboarding in Ventex v3, including all front-end polish features and the v3-rebuild correction pass.

---

## Pre-requisites & Test Configuration

1. **Database**: Supabase project configured with `supabase/schema.sql`.
2. **Storage**: `avatars` bucket exists with public read access (set in `schema.sql`).
3. **Environment**: `.env.local` configured with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. **Dev Server**: Run `npm run dev` and navigate to `http://localhost:3000`.

---

## 1. Route Architecture Overview

- **Setup routes (`/onboarding/*`)**:
  - `/onboarding/role`: Plain 4-card role selector + disabled "Mentor" card.
  - `/onboarding/founder`: Founder basic info (requires `display_name` & `country`). Sets `onboarding_complete = true`, then redirects to `/welcome/founder?celebrate=1`.
  - `/onboarding/investor`: Investor basic info (requires `display_name` & `country`). Sets `onboarding_complete = true`, then redirects to `/welcome/investor?celebrate=1`.
  - `/onboarding/buyer`: Buyer step 1 basic info (requires `display_name` & `country`). Saves profile and routes to `/onboarding/buyer/address`.
  - `/onboarding/buyer/address`: Buyer step 2 optional shipping address. "Save Address" or "Add later" sets `onboarding_complete = true`, then redirects to `/welcome/buyer?celebrate=1`.
  - `/onboarding/explorer`: Explorer setup (requires `display_name`). Sets `onboarding_complete = true`, then redirects to `/discover`.
  - **Setup Guard**: Once `onboarding_complete = true`, any visit to `/onboarding/*` redirects immediately to the user's dashboard.
- **Next-Step routes (`/welcome/*`)**:
  - `/welcome/founder`: "Plant your first seed" step with draft pitch creation or skip.
  - `/welcome/investor`: Next-step choice: "Browse pitches" (`/discover`) or "Go to my dashboard" (`/investor/portal`).
  - `/welcome/buyer`: Next-step choice: "Browse the marketplace" (`/marketplace`) or "Go to my dashboard" (`/buyer/dashboard`).
  - **Role Guard**: Visiting `/welcome/*` requires authentication and the corresponding role (e.g., only founders can view `/welcome/founder`).
  - **Celebration Flag**: Query parameter `?celebrate=1` activates the pure CSS confetti celebration modal, which strips the param from the URL upon render.

---

## 2. Landing Page Navigation
- [ ] **Step**: Open `http://localhost:3000`.
- [ ] **Action**: Check desktop and mobile navigation headers and hero section.
- [ ] **Expected**:
  - Unauthenticated user sees "Sign in" (`/login`) and "Get Started" (`/signup`).
  - Hero actions include ecosystem discovery links.
  - Footer includes "Start your pitch" (`/signup`) and "Sign in" navigation.

---

## 3. AuthShell & Responsive Split-Screen
- [ ] **Desktop View (>= 1024px)**:
  - [ ] Open `/login`, `/signup`, `/forgot-password`, or `/reset-password`.
  - [ ] **Left Panel**:
    - Dark container with hero orbit ring animation (`VENTEX` central ring).
    - Rotating quote rotates every 6 seconds through the 3 quotes:
      1. *"Every big thing started as a small idea."*
      2. *"Build quietly. Go public when you're ready."*
      3. *"Good ideas deserve to be found."*
    - Hovering mouse over left panel pauses the quote rotation.
    - If `prefers-reduced-motion` is enabled, rotation is disabled and only the first quote is displayed.
  - [ ] **Right Panel**: Form card centered with high-contrast inputs and buttons.
- [ ] **Mobile View (< 1024px)**:
  - [ ] Resize browser to 360px–768px.
  - [ ] Left panel collapses gracefully; only the slim brand header and the form card remain visible.
  - [ ] Zero horizontal page overflow at 360px, 390px, 768px, 1024px, 1440px.

---

## 4. Form Helpers & Accessibility
- [ ] **Auto-focus**:
  - [ ] On `/login`: email input is auto-focused immediately upon mount.
  - [ ] On `/signup`: email input is auto-focused.
  - [ ] On `/forgot-password`: email input is auto-focused.
  - [ ] On `/reset-password`: new password input is auto-focused.
- [ ] **Autocomplete Attributes**:
  - [ ] Email field: `autocomplete="email"`.
  - [ ] Login password: `autocomplete="current-password"`.
  - [ ] Signup/Reset password: `autocomplete="new-password"`.
  - [ ] Password managers autofill without console warnings.
- [ ] **Keyboard Accessibility & Focus Rings**:
  - [ ] Pressing `Enter` in any field submits the form.
  - [ ] Tabbing through fields displays a visible red focus ring (`focus:ring-[var(--red)]`).
  - [ ] All inputs have associated `<label>` tags with matching `htmlFor` and `id`.
  - [ ] Error messages have `role="alert"` and `aria-live="polite"`.
  - [ ] Minimum 44px tap targets for buttons, inputs, and eye icon toggles.

---

## 5. New User Registration (`/signup`)
- [ ] **Validation Checks**:
  - [ ] Submit with empty fields -> Inline errors: "Email is required.", "Password is required.", "Please confirm your password."
  - [ ] Enter invalid email (e.g. `test@invalid`) -> Inline error: "Please enter a valid email address."
  - [ ] Enter password < 8 characters -> Inline error: "Password must be at least 8 characters."
  - [ ] Enter mismatched passwords -> Inline error: "Passwords do not match."
  - [ ] Toggle show/hide eye icon -> Toggles password mask with accessible aria labels ("Show password" / "Hide password").
- [ ] **Submission**:
  - [ ] Submit valid email and password.
  - [ ] **Expected**: "Check your inbox" screen is displayed showing the destination email, with instructions to confirm account.
  - [ ] Database verify: `auth.users` row is created, `public.profiles` row is created via trigger with `role: 'visitor'` and `onboarding_complete: false`.
- [ ] **Duplicate Email**:
  - [ ] Attempt to sign up again with the exact same email address.
  - [ ] **Expected**: Error banner displays "An account with this email already exists. Try logging in."

---

## 6. Account Sign In (`/login`)
- [ ] **Wrong Password**:
  - [ ] Enter valid email with an incorrect password.
  - [ ] **Expected**: Red error box displays "Email or password is incorrect."
- [ ] **Unconfirmed Email**:
  - [ ] If email confirmation is enabled and user has not clicked confirmation email, attempt login.
  - [ ] **Expected**: Error displays "Please confirm your email first, or contact support." with an active "Resend confirmation email →" button.
  - [ ] Clicking "Resend confirmation email" invokes Supabase resend and provides feedback.
- [ ] **Successful Login**:
  - [ ] Enter confirmed email and correct password.
  - [ ] Submit form.
  - [ ] **Expected**: Button shows "Signing in...", session cookie `sb-ventex-auth-token` is set, user is routed to `/dashboard` which evaluates role and onboarding state.

---

## 7. Protected Page & Open Redirect Protection
- [ ] **Step**: In an incognito window (logged out), navigate to `http://localhost:3000/founder/dashboard`.
- [ ] **Expected**: Middleware intercepts and redirects to `/login?next=%2Ffounder%2Fdashboard`.
- [ ] **Action**: Complete login.
- [ ] **Expected**: After successful login, user is returned directly to `/founder/dashboard`.
- [ ] **Open Redirect Test**:
  - [ ] Navigate to `/login?next=https://malicious.com` or `/login?next=//malicious.com`.
  - [ ] Complete login.
  - [ ] **Expected**: Sanitizer rejects malicious/external URL and routes safely to the user's role-appropriate internal dashboard.

---

## 8. Already-Authenticated Redirection
- [ ] **Step**: While logged in, open:
  - `http://localhost:3000/login`
  - `http://localhost:3000/signup`
  - `http://localhost:3000/forgot-password`
- [ ] **Expected**: User is immediately redirected away to their active dashboard or setup step.

---

## 9. Password Reset Flow (`/forgot-password` & `/reset-password`)
- [ ] **Step 1**: Go to `/forgot-password`.
- [ ] **Action**: Enter email address and submit.
- [ ] **Expected**: Form transitions to "Reset link sent" state with email address confirmation.
- [ ] **Step 2**: Open password reset link from email.
- [ ] **Expected**: User lands on `/reset-password` with new password & confirm new password fields.
- [ ] **Validation Checks**:
  - [ ] Passwords < 8 characters or mismatched show immediate validation errors.
- [ ] **Submission**:
  - [ ] Enter valid matching new password and submit.
  - [ ] **Expected**: "Password updated" confirmation is shown and user is automatically routed to their dashboard.

---

## 10. Role Selection (`/onboarding/role`)
- [ ] **Step**: First-time user logs in. User is directed to `/onboarding/role`.
- [ ] **Display Check**:
  - [ ] Plain role cards displayed: Founder, Investor, Buyer, Explorer.
  - [ ] Fifth card "Mentor" displayed as "Coming soon" and is disabled (cannot be selected).
  - [ ] Note displayed: *"Select the role that fits you best. Your choice sets up your workspace and can be refined later in settings."*
- [ ] **Prevention of Re-selection**:
  - [ ] If an authenticated user who has already chosen a role attempts to revisit `/onboarding/role`, they are redirected away to their current onboarding step or dashboard.

---

## 11. Stepper & Pathway A: Founder
- [ ] **Stepper**:
  - [ ] Displays progress dots: `You > Your idea`.
- [ ] **Step 1 (Basic Info - `/onboarding/founder`)**:
  - [ ] Inputs: Display Name (required), Headline, Company, Country (required), City, Short Bio.
  - [ ] Optional: Upload avatar image (JPG/PNG/WebP, max 2MB).
  - [ ] Click "Continue".
  - [ ] **Expected**: Profile updated with `onboarding_complete: true`. Redirects to `/welcome/founder?celebrate=1`.
- [ ] **Next-Step Screen (`/welcome/founder`)**:
  - [ ] Celebration popup shown if `?celebrate=1`, stripped from URL on mount.
  - [ ] Heading: "Plant your first seed."
  - [ ] Optional inputs: "Name your idea" (max 150) and "Describe it in one line" (max 200).
  - [ ] Click "Plant it":
    - [ ] Creates draft pitch in `pitches` (status `draft`, title = entered or "Untitled idea", tagline, founder_id).
    - [ ] Prevents double clicks while submitting.
    - [ ] Redirects to `/founder/dashboard`.
  - [ ] Secondary link "Skip for now":
    - [ ] Bypasses draft creation and routes to `/founder/dashboard`.
- [ ] **Return Protection**:
  - [ ] Revisit `/onboarding/founder` or `/onboarding/role`.
  - [ ] **Expected**: Redirected immediately to `/founder/dashboard`.

---

## 12. Stepper & Pathway B: Investor
- [ ] **Stepper**:
  - [ ] Displays progress dots: `You > Discover`.
- [ ] **Step 1 (Basic Info - `/onboarding/investor`)**:
  - [ ] Inputs: Display Name (required), Firm (company), Headline, Country (required), City, Bio, optional avatar.
  - [ ] Click "Continue".
  - [ ] **Expected**: Profile updated with `onboarding_complete: true`. Redirects to `/welcome/investor?celebrate=1`.
- [ ] **Next-Step Screen (`/welcome/investor`)**:
  - [ ] Celebration popup shown if `?celebrate=1`.
  - [ ] "Browse pitches" -> links to `/discover`.
  - [ ] "Go to my dashboard" -> links to `/investor/portal`.
- [ ] **Return Protection**:
  - [ ] Revisit `/onboarding/investor`.
  - [ ] **Expected**: Redirected immediately to `/investor/portal`.

---

## 13. Stepper & Pathway C: Buyer
- [ ] **Stepper**:
  - [ ] Displays progress dots: `You > Delivery > Shop`.
- [ ] **Step 1 (Basic Info - `/onboarding/buyer`)**:
  - [ ] Inputs: Display Name (required), Country (required), City, optional avatar.
  - [ ] Click "Continue to Delivery Address".
  - [ ] **Expected**: Profile saved. Redirects to `/onboarding/buyer/address`.
- [ ] **Step 2 (Delivery Address - `/onboarding/buyer/address`)**:
  - [ ] Optional shipping address form.
  - [ ] Click "Add later" -> Sets `onboarding_complete = true` and redirects to `/welcome/buyer?celebrate=1`.
  - [ ] Fill address and click "Save & Continue" -> Row inserted into `buyer_addresses`, sets `onboarding_complete = true`, and redirects to `/welcome/buyer?celebrate=1`.
- [ ] **Next-Step Screen (`/welcome/buyer`)**:
  - [ ] Celebration popup shown if `?celebrate=1`.
  - [ ] "Browse the marketplace" -> links to `/marketplace`.
  - [ ] "Go to my dashboard" -> links to `/buyer/dashboard`.

---

## 14. Pathway D: Explorer
- [ ] **Step**: User selects "Explorer" on `/onboarding/role`.
- [ ] **Action**: User is routed to `/onboarding/explorer` (single step, no stepper).
- [ ] **Input**: Display Name (required).
- [ ] **Submit**: Click "Start Exploring".
- [ ] **Expected**: Role confirmed as `visitor`, `onboarding_complete` set to `true`, redirects to `/discover`.
- [ ] **Return Protection**:
  - [ ] Revisit `/onboarding/explorer` or `/onboarding/role`.
  - [ ] **Expected**: Redirected immediately to `/discover`.

---

## 15. Celebration Screen ("You're in")
- [ ] **Trigger**:
  - [ ] Rendered on `/welcome/*` when `?celebrate=1` is present.
  - [ ] Modal appears: "You're in." with personalized first-name message.
  - [ ] Pure-CSS confetti burst (24 brand-color pieces, ~1.5s animation duration).
  - [ ] If `prefers-reduced-motion` is enabled, confetti burst is completely disabled.
  - [ ] Parameter `?celebrate=1` is stripped from browser URL immediately via `window.history.replaceState`.
  - [ ] Re-visiting the page does not show the celebration dialog again.

---

## 16. Quitting Midway & Resuming
- [ ] User selects "Buyer" on `/onboarding/role`. Role is updated to `buyer` in `profiles`.
- [ ] Completes Step 1 (`/onboarding/buyer`), then closes tab at `/onboarding/buyer/address`.
- [ ] User logs back in or opens `/dashboard`.
- [ ] **Expected**: Central routing detects `role: 'buyer'`, `display_name` + `country` present, and `onboarding_complete: false`, automatically resuming at Step 2 (`/onboarding/buyer/address`).

---

## 17. Logout & Session Invalidation
- [ ] Open user avatar menu in Navbar and click "Logout".
- [ ] **Expected**:
  - Supabase session is signed out.
  - Cookie `sb-ventex-auth-token` is cleared.
  - User is routed to `/`.
  - Navbar immediately updates to show "Sign in" and "Get Started".
- [ ] **Protected Access**: Try navigating to `/founder/dashboard`.
  - **Expected**: Redirected to `/login?next=%2Ffounder%2Fdashboard`.
