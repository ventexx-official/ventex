# Founder Pitching Workspace & Dashboard Test Plan

This document details the manual testing steps and expected outcomes for the founder pitch workspace and dashboard features against `supabase/schema.sql`.

## Prerequisites
- Branch: `v3-rebuild`
- In `.env.local`: `NEXT_PUBLIC_ENABLE_APP=true`
- Two accounts:
  1. Founder user: Role `founder`
  2. Investor user: Role `investor`

---

### Test 1: Create a Draft Pitch
1. Log in as Founder.
2. Navigate to `/founder/dashboard`.
3. Click **"New Pitch"** -> opens `/founder/pitches/new` without creating a DB row yet.
4. Fill Basics: Title: `"CleanWater AI"`, Tagline: `"Decentralized water filtration monitoring"`, Stage: `mvp`, Industry: `CleanTech / Climate`.
5. Click **"Save"**.
6. Verify URL updates to `/founder/pitches/[new-id]`.
7. Verify save indicator displays `"Saved, version 1, [time]"`.
8. Verify status is **Private** (`draft`).

---

### Test 2: Automatic Version Increments (2 Real Saves -> 3 Versions)
1. On `/founder/pitches/[id]`, edit Problem to: `"Water supply networks suffer from undetected contamination."`
2. Click **"Save"**. Verify version indicator becomes `"v2"`.
3. Edit Solution to: `"Real-time IoT sensors paired with anomaly detection algorithms."`
4. Click **"Save"**. Verify version indicator becomes `"v3"`.
5. Click the version button `v3` to open the Version History dialog.
6. Verify versions 3, 2, and 1 are listed with their timestamps.

---

### Test 3: Blocked Publish with Checklist
1. Click **"Publish"** while core fields (e.g., target customer, stage or problem) are incomplete.
2. Verify publishing is blocked and the **"Cannot Publish Yet"** modal pops up showing which required fields are missing.
3. Click a missing field item in the checklist -> modal closes and page smooth-scrolls directly to that field with focus.

---

### Test 4: Complete Core Fields & Publish
1. Complete all 6 required publish fields (Title, Tagline, Industry, Stage, Problem, Solution).
2. Click **"Publish"**.
3. Verify status changes to **Public** (`live`).
4. Click **"Unpublish"** -> verify status changes back to **Private** (`draft`).

---

### Test 5: Upload Logo and Pitch Deck
1. Under Media & Links:
   - Upload a PNG/JPG logo under 5MB -> verify preview displays and URL stored in `logo_url`.
   - Attempt to upload an invalid file (e.g. .txt) -> verify browser alert rejects it.
2. Under Pitch Deck:
   - Upload a PDF deck under 20MB -> verify deck path uploaded to `pitch-decks` bucket under `{userId}/{pitchId}/deck.pdf`.
   - Verify green checkmark: `"Deck attached"`.

---

### Test 6: Restore a Version Snapshot
1. Click `v3` to open the Version History dialog.
2. Select Version 1 and click **"Restore"**.
3. Confirm the restoration prompt.
4. Verify the form fields reload the exact snapshot values of Version 1.
5. Click **"Save"** -> verify a new version (Version 4) is created based on the restored snapshot.

---

### Test 7: Delete Draft Pitch
1. With a draft pitch (`status = 'draft'`), click the Trash icon in the header.
2. Confirm the deletion prompt.
3. Verify redirected to `/founder/dashboard` and the pitch is no longer present.
4. Verify that for a **Public** pitch (`status = 'live'`), the delete button is hidden/unavailable.

---

### Test 8: Dashboard Tiles & Cards Update
1. On `/founder/dashboard`, verify:
   - Greeting matches time of day (e.g., `"Good morning, [Name]"`).
   - Pitches count reflects actual private vs public totals.
   - Versions saved reflects sum of current versions.
   - Road to Funding checklist accurately tracks completed vs pending milestones for the newest pitch, highlighting the current "Next Step".
   - Version Timeline shows the latest 5 versions of the active pitch.
   - Marketplace card shows count of seller's live and draft products with link to `/founder/store`.

---

### Test 9: Empty States
1. When a founder has no pitches:
   - "Plant your first seed" empty state with "New pitch" button.
   - Overview tiles show 0 pitches, "No ratings yet", 0 comments.
   - Investor interest card shows: `"No investor has expressed interest yet."`
   - Version timeline shows: `"No versions recorded yet."`

---

### Test 10: Admin Removed Status Banner
1. In Supabase (or admin panel), set a pitch status to `'removed'` and `removed_reason = 'Policy violation'`.
2. Reload `/founder/pitches/[id]` as the founder.
3. Verify:
   - Red banner shows: `"This pitch was removed by an administrator. Reason: Policy violation"`.
   - All form fields are disabled (read-only).
   - Save and publish controls are disabled.

---

### Test 11: Secure Pitch Deck Access
1. Test GET `/api/pitch-deck/[pitchId]`:
   - Without authorization header -> returns `401 Unauthorized`.
   - As an unrelated buyer or visitor -> returns `403 Forbidden`.
   - As the pitch founder -> returns `200` with 60-second signed URL.
   - As a verified investor when pitch is `live` -> returns `200` with signed URL.
   - As an investor when pitch is `draft` -> returns `403 Forbidden`.

---

### Test 12: Mobile Layout Verification (360px & 390px)
1. Inspect in DevTools at 360x640 and 390x844:
   - Confirm 0 horizontal scrolling.
   - Bottom navigation tab bar displays icons with 44px min tap targets.
   - Top header buttons and forms remain accessible.
   - Overview tiles render cleanly in 2 columns.
