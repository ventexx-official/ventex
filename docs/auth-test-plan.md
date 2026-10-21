# Authentication & Onboarding Test Plan

This document outlines the step-by-step manual test checklist covering every branch of authentication, session management, and role onboarding in Ventex v3.

---

## Pre-requisites & Test Configuration

1. **Database**: Supabase project configured with `supabase/schema.sql`.
2. **Storage**: `avatars` bucket exists with public read access (set in `schema.sql`).
3. **Environment**: `.env.local` configured with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. **Dev Server**: Run `npm run dev` and navigate to `http://localhost:3000`.

---

## 1. Landing Page Navigation
- [ ] **Step**: Open `http://localhost:3000`.
- [ ] **Action**: Check the desktop and mobile navigation headers and the hero section.
- [ ] **Expected**:
  - Unauthenticated user sees "Sign in" (`/login`) and "Get Started" (`/signup`).
  - Hero actions include ecosystem discovery links.
  - Footer includes "Start your pitch" (`/signup`) and "Sign in" navigation.

---

## 2. New User Registration (`/signup`)
- [ ] **Step**: Navigate to `/signup`.
- [ ] **Validation Checks**:
  - [ ] Submit with empty fields -> Inline errors: "Email is required.", "Password is required.", "Please confirm your password."
  - [ ] Enter invalid email (e.g. `test@invalid`) -> Inline error: "Please enter a valid email address."
  - [ ] Enter password < 8 characters -> Inline error: "Password must be at least 8 characters."
  - [ ] Enter mismatched passwords -> Inline error: "Passwords do not match."
  - [ ] Toggle show/hide eye icon on password fields -> Text switches between hidden (`•••••••`) and visible plaintext with accessible aria labels.
- [ ] **Submission**:
  - [ ] Submit valid email and password.
  - [ ] **Expected**: "Check your inbox" screen is displayed showing the destination email, with instructions to confirm account.
  - [ ] Database verify: `auth.users` row is created, `public.profiles` row is created via trigger with `role: 'visitor'` and `onboarding_complete: false`.
- [ ] **Duplicate Email**:
  - [ ] Attempt to sign up again with the exact same email address.
  - [ ] **Expected**: Error banner displays "An account with this email already exists. Try logging in."

---

## 3. Account Sign In (`/login`)
- [ ] **Step**: Navigate to `/login`.
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

## 4. Protected Page & Open Redirect Protection
- [ ] **Step**: In an incognito window (logged out), navigate to `http://localhost:3000/founder/dashboard`.
- [ ] **Expected**: Middleware intercepts and redirects to `/login?next=%2Ffounder%2Fdashboard`.
- [ ] **Action**: Complete login.
- [ ] **Expected**: After successful login, user is returned directly to `/founder/dashboard`.
- [ ] **Open Redirect Test**:
  - [ ] Navigate to `/login?next=https://malicious.com` or `/login?next=//malicious.com`.
  - [ ] Complete login.
  - [ ] **Expected**: Sanitizer rejects malicious/external URL and routes safely to the user's role-appropriate internal dashboard.

---

## 5. Already-Authenticated Redirection
- [ ] **Step**: While logged in, open:
  - `http://localhost:3000/login`
  - `http://localhost:3000/signup`
  - `http://localhost:3000/forgot-password`
- [ ] **Expected**: User is immediately redirected away to their active dashboard or setup step.

---

## 6. Password Reset Flow (`/forgot-password` & `/reset-password`)
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

## 7. Role Selection (`/onboarding/role`)
- [ ] **Step**: First-time user logs in. User is directed to `/onboarding/role`.
- [ ] **Display Check**:
  - [ ] Cards displayed: Founder, Investor, Buyer, Explorer.
  - [ ] Fifth card "Mentor" displayed as "Coming soon" and is disabled (cannot be selected).
  - [ ] Note displayed: *"Your choice sets up your account. You can contact support to change it later."*
- [ ] **Prevention of Re-selection**:
  - [ ] If an authenticated user who has already chosen a role attempts to revisit `/onboarding/role`, they are redirected away to their current onboarding step or dashboard.

---

## 8. Pathway A: Founder Onboarding
- [ ] **Step 1 (Basic Info)**:
  - [ ] URL: `/onboarding/founder` (shows "STEP 1 OF 2").
  - [ ] Fill in: Display Name (required), Headline, Company, Country, City, Short Bio.
  - [ ] Optional: Upload avatar image (JPG/PNG/WebP, max 2MB). Verify preview and upload success to Supabase `avatars` bucket.
  - [ ] Click "Save & Continue".
  - [ ] **Expected**: Profile updated in Supabase with `onboarding_complete: true`. Progresses to Step 2.
- [ ] **Step 2 (Your First Pitch Welcome)**:
  - [ ] Shows "Your first pitch" screen with two options:
    - "Start my first pitch" -> links to `/founder/pitches/new?welcome=1`.
    - "Skip for now" -> links to `/founder/dashboard`.
- [ ] **Return Protection**:
  - [ ] Revisit `/onboarding/founder` or `/onboarding/role`.
  - [ ] **Expected**: Redirected immediately to `/founder/dashboard`.

---

## 9. Pathway B: Investor Onboarding
- [ ] **Step 1 (Basic Info)**:
  - [ ] URL: `/onboarding/investor` (shows "STEP 1 OF 2").
  - [ ] Fill in: Display Name (required), Firm (saved in `company`), Headline, Country, City, "What do you invest in?" (saved in `bio`), optional avatar.
  - [ ] Click "Save & Continue".
  - [ ] **Expected**: Profile updated with `onboarding_complete: true`. Progresses to Step 2.
- [ ] **Step 2 (Welcome Screen)**:
  - [ ] Shows "Ready to discover" screen with:
    - "Browse pitches" -> links to `/discover`.
    - "Go to my dashboard" -> links to `/investor/portal`.
- [ ] **Return Protection**:
  - [ ] Revisit `/onboarding/investor`.
  - [ ] **Expected**: Redirected immediately to `/investor/portal`.

---

## 10. Pathway C: Buyer Onboarding
- [ ] **Step 1 (Basic Info)**:
  - [ ] URL: `/onboarding/buyer` (shows "STEP 1 OF 3").
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
    - "Go to my dashboard" -> links to `/buyer/dashboard`.

---

## 11. Pathway D: Explorer Onboarding
- [ ] **Step**: User selects "Explorer" on `/onboarding/role`.
- [ ] **Action**: User is routed to `/onboarding/visitor`.
- [ ] **Input**: Pre-filled or entered Display Name / Nickname.
- [ ] **Submit**: Click "Start Exploring".
- [ ] **Expected**: Role confirmed as `visitor`, `onboarding_complete` set to `true`, redirects to `/discover`.
- [ ] **Return Protection**:
  - [ ] Revisit `/onboarding/visitor` or `/onboarding/role`.
  - [ ] **Expected**: Redirected immediately to `/discover`.

---

## 12. Quitting Midway & Resuming
- [ ] **Test**:
  - [ ] User selects "Founder" on `/onboarding/role`. Role is updated to `founder` in `profiles`.
  - [ ] Before completing Step 1, user closes browser or navigates to `/`.
  - [ ] User logs back in or opens `/dashboard`.
  - [ ] **Expected**: Central routing detects `role: 'founder'` and `onboarding_complete: false`, automatically resuming at `/onboarding/founder`.

---

## 13. Logout & Session Invalidation
- [ ] **Action**: Open user avatar menu in Navbar and click "Logout".
- [ ] **Expected**:
  - Supabase session is signed out.
  - Cookie `sb-ventex-auth-token` is cleared.
  - User is routed to `/`.
  - Navbar immediately updates to show "Sign in" and "Get Started".
- [ ] **Protected Access**: Try navigating to `/founder/dashboard`.
  - **Expected**: Redirected to `/login?next=%2Ffounder%2Fdashboard`.
