# Build Investor Portal

This plan outlines the creation of the main dashboard for premium investors at `/app/investor/portal/page.tsx`.

## User Review Required
No critical blockers, but please confirm if the advanced search ranges (Funding Range, MRR Range) should be specific fixed options (e.g., "$0-$10k", "$10k-$50k") or numeric input fields. I will implement them as dropdowns with predefined ranges for a better user experience by default.

## Proposed Changes

### Investor Portal Page
#### [NEW] [page.tsx](file:///c:/Users/HP/Ventex/app/investor/portal/page.tsx)
- **Route Protection**: Fetch user session and profile. Redirect to `/pricing` if `investor_premium` is false or `subscription_end_date` is past the current date.
- **Sidebar Navigation**: Build a responsive sidebar (similar to Founder Dashboard) with Avatar, name, "Investor Premium" badge, and navigation links.
- **Main Content Layout**:
  - **Stats Section**: Display 4 metric cards: Pitches viewed (mocked or aggregated), Interests expressed (count from `investor_interests`), Watchlist size (count from `saved_pitches`), Subscription days remaining (calculated from `subscription_end_date`).
  - **New Pitches This Week**: Fetch up to 4 recent pitches from the `pitches` table where `status = 'live'`. Display them in premium cards showing financial details like MRR, ARR, and amount seeking.
  - **My Saved Pitches**: Fetch from `saved_pitches` joined with `pitches`. Display as a list with "View" and "Remove" actions.
  - **Expressed Interests**: Fetch from `investor_interests` joined with `pitches`. Display status (Pending/Accepted/Declined) and a "View thread" button if accepted.
  - **Advanced Search**: 
    - Create state variables for filters: `industry`, `stage`, `country`, `fundingMin`, `fundingMax`, `mrrMin`, `mrrMax`, `activelyRaising`.
    - Implement a real-time `useEffect` that queries the `pitches` table based on these filters.
    - Display results in a grid.

## Verification Plan

### Manual Verification
1. Run the dev server.
2. Login with a user that has `investor_premium = true` and a valid `subscription_end_date`.
3. Navigate to `/investor/portal`.
4. Verify the stats, new pitches, saved pitches, and expressed interests load correctly.
5. Test the Advanced Search filters to ensure the query updates in real-time.
6. Login with a non-premium user and verify the redirect to `/pricing`.
