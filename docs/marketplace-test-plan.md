# Marketplace Test Plan (Manual & Access Control)

This test plan validates the marketplace products and inquiries slice against `supabase/schema.sql`.

## Prerequisites
- Branch: `v3-rebuild`
- In `.env.local`: `NEXT_PUBLIC_ENABLE_APP=true`
- Two test user accounts in Supabase:
  1. **User A**: Role `founder` (Seller)
  2. **User B**: Role `buyer` or `visitor` (Buyer)

---

### Test 1: Seller Creates a Product Draft
1. Log in as **User A** (Founder).
2. Navigate to `/founder/store`.
3. Click "New Product" (routes to `/founder/store/new`).
4. Enter Product Name: `"DevTool CLI"`, Product Type: `software`, Category: `Developer Tools`, Description: `"A high performance terminal tool."`, Price: `49`.
5. Click **"Save draft"**.
6. Verify redirected to `/founder/store` and the product is shown with a **Private** (draft) status badge.

---

### Test 2: Image Upload & Edit
1. On `/founder/store`, click the edit icon (Pencil) next to `"DevTool CLI"`.
2. Upload 2 valid images (`.png` / `.jpg`, under 5MB).
3. Verify previews appear immediately and upload succeeds into the `assets` bucket path `{userId}/products/{productId}/{filename}`.
4. Remove one image by clicking the "X" button.
5. Click **"Save Changes"**. Verify changes persist upon reload.

---

### Test 3: Publish Product
1. On `/founder/store/[id]`, review the Publish Checklist.
2. Click **"Publish to marketplace"**.
3. Verify status changes to **Public** (`live`).
4. Return to `/founder/store` and verify the status badge reads **Public**.

---

### Test 4: Marketplace Grid (SSR & Search/Filter)
1. Open an incognito / logged-out browser window and navigate to `/marketplace`.
2. Verify `"DevTool CLI"` appears in the product grid with its thumbnail, category, type, and price (`$49`).
3. Search for `"DevTool"` in the search input and hit Enter -> verifies product displays.
4. Filter by type `Hardware` -> verifies `"DevTool CLI"` disappears.
5. Filter by type `Software` -> verifies `"DevTool CLI"` reappears.

---

### Test 5: Product Detail & Seller Ownership
1. Click on `"DevTool CLI"` in `/marketplace` to navigate to `/marketplace/[id]`.
2. As a logged-out user:
   - Verify product name, image gallery, description, category, and price show correctly.
   - Verify seller card displays seller name and company from `public_profiles`.
   - Verify inquiry form shows a button prompting login (`"Sign in to contact seller"`).
3. Log in as **User A** (the Seller) and view the same page:
   - Verify inquiry form is replaced with banner: `"This is your listing"` with a link to manage it at `/founder/store/[id]`.

---

### Test 6: Buyer Submits Inquiry
1. Log in as **User B** (Buyer) in a separate session.
2. Navigate to `/marketplace/[id]` for `"DevTool CLI"`.
3. In the inquiry form:
   - Message: `"Hi, does this CLI support ARM64 macOS architectures?"`
   - Email: prefilled with User B's email.
   - Phone: optional phone number.
4. Click **"Send Inquiry"**.
5. Verify button shows loading state, double-submission is prevented, and success message appears: `"Inquiry sent successfully!"`.

---

### Test 7: Seller Manages Inquiry
1. Log in as **User A** (Seller).
2. Navigate to `/founder/store/inquiries`.
3. Verify the new inquiry from User B is listed with:
   - Product name `"DevTool CLI"`
   - Buyer's display name and contact info
   - Message text
   - Status selector initially showing **Status: New**.
4. Change status to **Replied**.
5. Refresh the page to verify status persisted in `product_inquiries`.

---

### Test 8: Buyer Views Sent Inquiries
1. Log in as **User B** (Buyer).
2. Navigate to `/marketplace/my-inquiries`.
3. Verify `"DevTool CLI"` is listed.
4. Verify the status badge has updated to **Replied**.
5. Click the product name link and verify it navigates to `/marketplace/[id]`.

---

### Test 9: Visibility & Deletion of Drafts
1. As **User A**, create another draft product `"Secret Hardware"`.
2. As **User B** (or logged out), navigate to `/marketplace` and verify `"Secret Hardware"` is **not** visible.
3. As **User A**, navigate to `/founder/store/[id]` for `"Secret Hardware"`.
4. Click **"Delete product"** and confirm.
5. Verify the draft is deleted and no longer appears on `/founder/store`.
6. Go back to `"DevTool CLI"` (which is `live`) and verify the delete button is **not** available for live products (only Unpublish to draft first).

---

### Test 10: RLS & Access Control
1. As logged-out user, attempt to access `/founder/store` -> redirected to login.
2. As logged-out user, attempt to access `/marketplace/my-inquiries` -> redirected to login.
3. Verify RLS prevents User B from directly modifying User A's products via direct Supabase API calls.
4. Verify `seller_id` is automatically set by the database trigger `inquiry_before_insert` during inquiry creation.
