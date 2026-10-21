# Ventex Design Rules & Design Kit Specification

## 1. Palette & Typography

### Colors
- **Ink (Background)**: `#10100f`
- **Paper (Foreground / Text Primary)**: `#f1efe8`
- **Paper Dim (Text Secondary)**: `#c8c4ba` / `#aaa69e`
- **Smoke (Subtle metadata / labels)**: `#77756e`
- **Crimson / Red (Primary Accent)**: `#d6453b`
- **Crimson Dark**: `#a8322f` / `#8f2e2a`
- **Card Background**: `#191817`
- **Secondary / Muted Background**: `#22211f` / `#252421`
- **Line / Border**: `rgba(241, 239, 232, 0.14)` (Dark theme) or `rgba(16, 16, 15, 0.16)` (Light paper theme)

### Typography
- **Display font**: `Space Grotesk`, sans-serif (`--font-display`). Used for headings, stat numbers, marquee items, and wordmarks. All-caps with tight letter-spacing (`-0.08em` to `-0.12em`).
- **Body font**: `DM Sans`, Arial, sans-serif (`--font-sans`). Used for paragraph text, form inputs, buttons, and navigation labels.
- **Mono font**: `JetBrains Mono`, monospace (`--font-mono`). Used for index indicators, counters, status tags, and clocks.

---

## 2. Brand Standard
- The brand wordmark comes exclusively from `SITE_NAME` in `lib/brand.ts`.
- In headers, footers, stamps, and section kickers, it is rendered in clean uppercase: `SITE_NAME.toUpperCase()` (e.g., `VENTEX`).
- There is no separate "F" logo glyph or hardcoded brand name in component text.

---

## 3. UI Kit Components (`@/components/ui-kit`)

| Component | Purpose & Description |
| :--- | :--- |
| `PageFrame` | Full-height inner page wrapper with hero, meta eyebrow, title, intro paragraph, scroll indicator, and standardized footer. Supports `dark`, `red`, and `paper` accents. |
| `SectionHead` | Standardized uppercase index, section title, and right-aligned explanatory caption. |
| `Button` | Reusable pill button with `primary` (crimson), `secondary` (paper), `outline`, and `danger` variants. Minimum 44px height for mobile accessibility. |
| `MagneticButton` | Physics-based magnetic follower button with smooth pull towards cursor on pointer devices. Disabled on touch (`pointer: coarse`) and reduced-motion settings. |
| `Card` | Dark surface container with `var(--card)` background, rounded 24px (`rounded-3xl`), and subtle 1px border. |
| `Badge` | Pill label for stages, roles, or categories with variants (`default`, `red`, `paper`, `emerald`). |
| `StatusDot` | 6px glowing status indicator dot with radial pulse shadow. |
| `Input` / `Textarea` / `Select` | Form inputs with 16px minimum font size (eliminating iOS auto-zoom), dark background, rounded 16px, and 44px min-height. |
| `Checkbox` / `Toggle` | Accessible interactive switches and checkboxes with minimum 44px tap targets. |
| `FormField` | Combined label, hint, error message, and required asterisk wrapper. |
| `Alert` | Dismissible notification container for info, success, and error feedback. |
| `Modal` | Centered dialog overlay with blur backdrop, focus trapping, ESC listener, and mobile padding. |
| `EmptyState` | Dashed border container with uppercase display title, description, and action CTA. |
| `Skeleton` | Shimmer pulse placeholder for loading states. |
| `StarRating` | 1–5 star rating indicator with interactive mode for submitting ratings. |
| `ScoreBar` | 0–100% horizontal progress/score bar with crimson fill. |

---

## 4. Mobile & Responsive Rules

1. **Screen Width Testing**:
   - Must render cleanly with **zero horizontal page overflow** across widths: `360px`, `390px`, `768px`, `1024px`, and `1440px`.
   - Any multi-column table or wide grid must stack vertically or provide contained horizontal scroll (`overflow-x: auto`) rather than overflowing the page.

2. **Viewport & Sizing**:
   - Viewport meta is set with `width=device-width, initial-scale=1`.
   - Full-height elements use `100dvh` (or `min-h-[100dvh]`) to prevent layout shifts when mobile address bars appear or collapse.
   - Respect iOS safe-area insets (`padding-bottom: env(safe-area-inset-bottom)`).

3. **Touch Targets & Form Inputs**:
   - All interactive controls (buttons, links, tabs, menu toggles) must meet the **44×44px minimum tap target** requirement.
   - Text inputs, textareas, and dropdowns have a minimum **16px font size** to prevent automatic zooming on iOS Safari.
   - Body font size is maintained at minimum **15px–16px**.

4. **Navigation Behavior on Small Screens**:
   - On screens `<= 900px`, the desktop navigation collapses into a dedicated hamburger button.
   - Opening the menu presents a **full-screen overlay**:
     - Locks background scrolling (`body { overflow: hidden }`).
     - Closes on any link tap or `Escape` key press.
     - Provides clear tap targets for all main sections and auth actions.

5. **Motion, Cursors & Accessibility**:
   - **Cursor Follower & Atmosphere**: Automatically disabled when `pointer: coarse` (touch screens) or when `prefers-reduced-motion: reduce` is detected.
   - **Magnetic Effects**: Magnetic pull on buttons is disabled on touch screens and under reduced motion.
   - Heavy parallax scrolls and multi-layer floating glow elements are simplified or hidden on small screens (`max-width: 620px`).
   - Every animation adheres to `@media (prefers-reduced-motion: reduce)` with transition durations capped at `0.01ms`.
