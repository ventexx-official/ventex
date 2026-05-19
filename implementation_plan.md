# Goal
Integrate dark mode into Ventex using Next.js, `next-themes`, and Tailwind CSS, adding a toggle in the Navbar and updating all components to respect the selected theme.

## User Review Required
- The chosen default theme will be **Light** mode.
- User preference will be persisted in `localStorage` via `next-themes`.
- `tailwind.config.ts` will be updated to use `darkMode: 'class'`.

## Proposed Changes

### Configuration
#### [MODIFY] `package.json`
- Run `npm install next-themes` to add the dependency.

#### [MODIFY] `tailwind.config.ts`
- Add `darkMode: 'class'` to enable class-based dark mode switching.

---

### Components
#### [NEW] `components/ThemeProvider.tsx`
- A client component wrapper for `next-themes` `<ThemeProvider attribute="class" defaultTheme="light">` to handle theme context.

#### [MODIFY] `app/layout.tsx`
- Wrap the `<Layout>` component with `<ThemeProvider>` to provide theme context to the entire application.
- Apply global background and text colors to the `<body>` tag: `bg-white dark:bg-[#111111] text-[#222222] dark:text-[#ffffff]`.

#### [MODIFY] `components/Navbar.tsx`
- Add a new theme toggle button (using `lucide-react` Sun and Moon icons) next to the "Login" button.
- Update styles to reflect dark mode:
  - Background: `bg-[#222222] dark:bg-[#111111]`
  - Ensure mobile menu also respects the theme changes.

#### [MODIFY] `components/Footer.tsx`
- Update background styles: `bg-[#222222] dark:bg-[#111111]`.

#### [MODIFY] `app/page.tsx`
- Update the **Hero Section**: `bg-[#222222] dark:bg-[#111111]`.
- Update the **How it works Section**:
  - Background: `bg-white dark:bg-[#111111]`
  - Text: `text-[#222222] dark:text-[#ffffff]`
  - Cards: `bg-white dark:bg-[#222222]`
  - Borders: `border-[#e5e5e5] dark:border-[#444444]`
  - Icons inside cards: The small dark square will stay `#222222` or change to match the design (probably `#111111` or `#333333` so it's visible against the `#222222` card). We'll set the icon wrapper to `bg-[#222222] dark:bg-[#111111]`.

## Verification Plan
### Automated Tests
- Run Next.js build to verify there are no hydration mismatches or compilation errors.

### Manual Verification
- Use the browser subagent to:
  1. Load the home page and verify the default light mode.
  2. Click the theme toggle in the Navbar.
  3. Verify dark mode is applied (backgrounds turn `#111111`, cards `#222222`, borders `#444444`, text `#ffffff`).
  4. Ensure the state persists.
