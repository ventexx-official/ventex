# Authentication & Onboarding Test Plan

This document outlines the step-by-step manual test checklist covering every branch of authentication, session management, and role onboarding in Ventex v3, including all front-end polish features.

---

## Pre-requisites & Test Configuration

1. **Database**: Supabase project configured with `supabase/schema.sql`.
2. **Storage**: `avatars` bucket exists with public read access (set in `schema.sql`).
3. **Environment**: `.env.local` configured with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. **Dev Server**: Run `npm run dev` and navigate to `http://localhost:3000`.

---

## 1. Landing Page Navigation
- [ ] **Step**: Open `http://localhost:3000`.
- [ ] **Action**: Check desktop and mobile navigation headers and hero section.
- [ ] **Expected**:
  - Unauthenticated user sees "Sign in" (`/login`) and "Get Started" (`/signup`).
  - Hero actions include ecosystem discovery links.
  - Footer includes "Start your pitch" (`/signup`) and "Sign in" navigation.

---

## 2. AuthShell & Responsive Split-Screen
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

## 3. Form Helpers & Accessibility
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

## 4. New User Registration (`/signup`)
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

## 5. Account Sign In (`/login`)
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

## 6. Protected Page & Open Redirect Protection
- [ ] **Step**: In an incognito window (logged out), navigate to `http://localhost:3000/founder/dashboard`.
- [ ] **Expected**: Middleware intercepts and redirects to `/login?next=%2Ffounder%2Fdashboard`.
- [ ] **Action**: Complete login.
- [ ] **Expected**: After successful login, user is returned directly to `/founder/dashboard`.
- [ ] **Open Redirect Test**:
  - [ ] Navigate to `/login?next=https://malicious.com` or `/login?next=//malicious.com`.
  - [ ] Complete login.
  - [ ] **Expected**: Sanitizer rejects malicious/external URL and routes safely to the user's role-appropriate internal dashboard.

---

## 7. Already-Authenticated Redirection
- [ ] **Step**: While logged in, open:
  - `http://localhost:3000/login`
  - `http://localhost:3000/signup`
  - `http://localhost:3000/forgot-password`
- [ ] **Expected**: User is immediately redirected away to their active dashboard or setup step.

---

## 8. Password Reset Flow (`/forgot-password` & `/reset-password`)
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

## 9. Role Selection (`/onboarding/role`)
- [ ] **Step**: First-time user logs in. User is directed to `/onboarding/role`.
- [ ] **Display Check**:
  - [ ] Plain role cards displayed: Founder, Investor, Buyer, Explorer.
  - [ ] Fifth card "Mentor" displayed as "Coming soon" and is disabled (cannot be selected).
  - [ ] Note displayed: *"Your choice sets up your account. You can contact support to change it later."*
- [ ] **Prevention of Re-selection**:
  - [ ] If an authenticated user who has already chosen a role attempts to revisit `/onboarding/role`, they are redirected away to their current onboarding step or dashboard.

---

## 10. Stepper & Pathway A: Founder Onboarding
- [ ] **Stepper**:
  - [ ] Displays thin progress line with glowing red dots: `You > Your idea > Launch`.
- [ ] **Step 1 (Basic Info)**:
  - [ ] URL: `/onboarding/founder` (active step 1).
  - [ ] Fill in: Display Name (required), Headline, Company, Country, City, Short Bio.
  - [ ] Optional: Upload avatar image (JPG/PNG/WebP, max 2MB). Verify preview and upload success to Supabase `avatars` bucket.
  - [ ] Click "Save & Continue".
  - [ ] **Expected**: Profile updated in Supabase with `onboarding_complete: true`. Progresses to Step 2.
- [ ] **Step 2 (Plant your first seed)**:
  - [ ] Heading: "Plant your first seed."
  - [ ] Optional inputs: "Name your idea" (max 150) and "Describe it in one line" (max 200).
  - [ ] Click "Plant it":
    - [ ] Creates draft pitch in `pitches` (status `draft`, title = entered or "Untitled idea", tagline, founder_id).
    - [ ] Prevents double clicks while submitting.
    - [ ] Redirects to `/founder/dashboard?welcome=1` (since `/founder/pitches/[id]` is built in a later slice).
  - [ ] Secondary link "Skip for now":
    - [ ] Bypasses draft creation and routes to `/founder/dashboard?welcome=1`.
- [ ] **Return Protection**:
  - [ ] Revisit `/onboarding/founder` or `/onboarding/role`.
  - [ ] **Expected**: Redirected immediately to `/founder/dashboard`.

---

## 11. Pathway B: Investor Onboarding
- [ ] **Stepper**:
  - [ ] Displays thin progress line with glowing red dots: `You > Your focus > Discover`.
- [ ] **Step 1 (Basic Info)**:
  - [ ] URL: `/onboarding/investor` (active step 1).
  - [ ] Fill in: Display Name (required), Firm (saved in `company`), Headline, Country, City, "What do you invest in?" (saved in `bio`), optional avatar.
  - [ ] Click "Save & Continue".
  - [ ] **Expected**: Profile updated with `onboarding_complete: true`. Progresses to Step 2.
- [ ] **Step 2 (Welcome Screen)**:
  - [ ] Shows "Ready to discover" screen with:
    - "Browse pitches" -> links to `/discover`.
    - "Go to my dashboard" -> links to `/investor/portal?welcome=1`.
- [ ] **Return Protection**:
  - [ ] Revisit `/onboarding/investor`.
  - [ ] **Expected**: Redirected immediately to `/investor/portal`.

---

## 12. Pathway C: Buyer Onboarding
- [ ] **Stepper**:
  - [ ] Displays thin progress line with glowing red dots: `You > Delivery > Shop`.
- [ ] **Step 1 (Basic Info)**:
  - [ ] URL: `/onboarding/buyer` (active step 1).
  - [ ] Fill in: Display Name (required), Country, City, optional avatar.
  - [ ] Click "Save & Continue".
  - [ ] **Expected**: Profile updated with `onboarding_complete: true`. Progresses to Step 2.
- [ ] **Step 2 (Delivery Address)**:
  - [ ] Optional shipping address form.
  - [ ] Click "Add later" -> Bypasses address insert and proceeds directly to Step 3.
  - [ ] Alternatively, fill address and click "Save Address" -> Row inserted into `buyer_addresses` with `is_default: true`.
- [ ] **Step 3 (Welcome Screen)**:
  - [ ] Shows welcome screen with:
    - "Browse the marketplace" -> links to `/marketplace`.
    - "Go to my dashboard" -> links to `/buyer/dashboard?welcome=1`.

---

## 13. Pathway D: Explorer Onboarding
- [ ] **Step**: User selects "Explorer" on `/onboarding/role`.
- [ ] **Action**: User is routed to `/onboarding/visitor` (no stepper shown).
- [ ] **Input**: Pre-filled or entered Display Name / Nickname.
- [ ] **Submit**: Click "Start Exploring".
- [ ] **Expected**: Role confirmed as `visitor`, `onboarding_complete` set to `true`, redirects to `/discover?welcome=1`.
- [ ] **Return Protection**:
  - [ ] Revisit `/onboarding/visitor` or `/onboarding/role`.
  - [ ] **Expected**: Redirected immediately to `/discover`.

---

## 14. Celebration Screen ("You're in")
- [ ] **Trigger**:
  - [ ] Finish setup or follow a redirect containing `?welcome=1`.
  - [ ] Modal appears: "You're in." with personalized message.
  - [ ] Pure-CSS confetti burst (24 brand-color pieces, ~1.5s animation duration).
  - [ ] If `prefers-reduced-motion` is enabled, confetti burst is completely disabled.
  - [ ] Parameter `?welcome=1` is stripped from browser URL immediately via `window.history.replaceState`.
  - [ ] Clicking "Enter Dashboard" closes the celebration dialog.
  - [ ] Re-visiting the dashboard does not show the celebration dialog again.

---

## 15. Quitting Midway & Resuming
- [ ] User selects "Founder" on `/onboarding/role`. Role is updated to `founder` in `profiles`.
- [ ] Before completing Step 1, user closes browser or navigates to `/`.
- [ ] User logs back in or opens `/dashboard`.
- [ ] **Expected**: Central routing detects `role: 'founder'` and `onboarding_complete: false`, automatically resuming at `/onboarding/founder`.

---

## 16. Logout & Session Invalidation
- [ ] Open user avatar menu in Navbar and click "Logout".
- [ ] **Expected**:
  - Supabase session is signed out.
  - Cookie `sb-ventex-auth-token` is cleared.
  - User is routed to `/`.
  - Navbar immediately updates to show "Sign in" and "Get Started".
- [ ] **Protected Access**: Try navigating to `/founder/dashboard`.
  - **Expected**: Redirected to `/login?next=%2Ffounder%2Fdashboard`.
