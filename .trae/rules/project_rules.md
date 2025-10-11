# Design System Specification — Nuxt UI 4 Default Tokens (Final)

Purpose: Provide concrete, ready‑to‑use design tokens for generating and maintaining the project UI via AI assistants (gpt5, Claude, Grok). All placeholders are removed and replaced with direct values aligned to Nuxt UI defaults and the existing `app/app.config.ts`.

## 0. Token Overview

- Spacing tokens: `space.xs`, `space.sm`, `space.md`, `space.lg`, `space.xl`
- Typography tokens: `font.primary`, `font.secondary`, `font.size.base`, `font.lineHeight.base`, `heading.h1..h6`
- Color tokens (Nuxt UI): `ui.colors.primary`, `ui.colors.neutral`, `ui.colors.success`, `ui.colors.warning`, `ui.colors.error`, `ui.colors.info`
- Layout tokens: `grid.columns`, `grid.gutter`, `breakpoints`, `container.widths`

---

## 1. Spacing System (Final)

- Base unit: 4px
- Padding/margin increments: 4px intervals
- Section spacing: 32px
- Element spacing: 8px

Derived scale:
- `space.xs = 8px`
- `space.sm = 12px`
- `space.md = 16px`
- `space.lg = 32px`
- `space.xl = 36px`

Usage rules:
- Vertical rhythm: `space.sm` by default.
- Card padding: `space.md`; Section padding: `space.lg`.
- Grid gutters use `grid.gutter = 24px` (see Layout).

Visual example (spacing rhythm):
```
<section style="padding: var(--space-lg)">
  <h2 style="margin-bottom: var(--space-sm)">Section Title</h2>
  <p style="margin-bottom: var(--space-sm)">Lead paragraph</p>
  <div style="margin-top: var(--space-md)">Card stack starts</div>
</section>
```

---

## 2. Typography (Final)

- Primary font: Inter (weights: 300, 400, 500, 600, 700)
- Secondary font: JetBrains Mono for code, metrics, technical labels
- Base size: 16px
- Line height: 150%
- Heading hierarchy:
  - `h1 = 32px`
  - `h2 = 26px`
  - `h3 = 21px`
  - `h4 = 18px`
  - `h5 = 16px`
  - `h6 = 14px`

Visual examples:
```
<h1 style="font-family: var(--font-primary); font-size: var(--h1-size)">H1 Title</h1>
<h2 style="font-family: var(--font-primary); font-size: var(--h2-size)">H2 Subtitle</h2>
<p style="font-size: var(--font-size-base); line-height: var(--line-height-base)">Body copy</p>
<small style="font-family: var(--font-secondary)">Caption (secondary font)</small>
```

---

## 3. Color Palette (Final, Nuxt UI)

Aligned with `app/app.config.ts`:
- Primary: `amber` (Tailwind shades 50–900)
- Neutral: `zinc` (grayscale 50–900)
- Functional:
  - Success: `emerald`
  - Warning: `amber`
  - Error: `rose`
  - Info: `sky`
- Secondary (accent, optional): `indigo` (50–900) — use for complementary accents.

Guidelines:
- Primary for actions/highlights; neutral for backgrounds, borders, text.
- Status colors for feedback; ensure AA contrast.

Visual examples:
```
<button style="background: var(--color-primary-600); color: white">Primary Action</button>
<button style="background: var(--color-secondary-600); color: white">Secondary Action</button>
<div style="background: var(--color-neutral-100); border: 1px solid var(--color-neutral-300)">Card</div>
<p style="color: var(--color-status-error)">Error message</p>
```

---

## 4. Layout Principles (Final)

- Grid system: 12 columns
- Gutter width: 24px
- Breakpoints (Tailwind defaults) for mobile/tablet/desktop/wide:
  - `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`, `2xl: 1536px`
- Container widths (max): `640px`, `768px`, `1024px`, `1280px`, `1536px`

Guidelines:
- Use responsive grid; containers center content and cap width per breakpoint.
- Breakpoints gate typography, spacing, and layout changes.

Visual example (responsive container + grid):
```
<div class="container">
  <div class="row">
    <div class="col" style="padding: var(--grid-gutter)">Col 1</div>
    <div class="col" style="padding: var(--grid-gutter)">Col 2</div>
  </div>
</div>
```

---

## 5. Target Audience (Final)

- Primary: DoW players and community (18–45 years)
- Secondary: Tournament organizers, streamers, analysts
- Key needs: Fast ladder browsing, reliable player stats, clear filters, mobile access
- Accessibility: WCAG 2.1 AA compliance

---

## 6. Functional Focus (Final)

- Core features: Ladder tables, player profiles, filters (race, season, mod, server), i18n
- User flows: Browse ladder → apply filters → inspect player → compare stats
- Interaction patterns: Sortable tables, selectors, search, pagination, responsive cards
- Performance targets: LCP < 2.5s, INP < 200ms, CLS < 0.1

---

## 7. Design Tokens → CSS Variables (Final Values)

Define variables globally:
```
:root {
  /* Spacing */
  --space-xs: 8px;
  --space-sm: 12px;
  --space-md: 16px;
  --space-lg: 32px;
  --space-xl: 36px;

  /* Typography */
  --font-primary: Inter, ui-sans-serif, system-ui, -apple-system;
  --font-secondary: "JetBrains Mono", ui-monospace, SFMono-Regular;
  --font-size-base: 16px;
  --line-height-base: 150%;
  --h1-size: 32px;
  --h2-size: 26px;
  --h3-size: 21px;
  --h4-size: 18px;
  --h5-size: 16px;
  --h6-size: 14px;

  /* Layout */
  --grid-columns: 12;
  --grid-gutter: 24px;

  /* Colors (Tailwind defaults mapped to variables) */
  /* Amber (primary) */
  --color-primary-600: #d97706; /* amber-600 */
  --color-primary: #f59e0b; /* amber-500 */
  /* Indigo (secondary, optional) */
  --color-secondary-600: #4f46e5; /* indigo-600 */
  --color-secondary: #6366f1; /* indigo-500 */
  /* Zinc (neutral) */
  --color-neutral-900: #18181b; /* zinc-900 */
  --color-neutral-600: #52525b; /* zinc-600 */
  --color-neutral-300: #d4d4d8; /* zinc-300 */
  --color-neutral-100: #f4f4f5; /* zinc-100 */
  /* Status */
  --color-status-error: #f43f5e; /* rose-500 */
  --color-status-warning: #f59e0b; /* amber-500 */
  --color-status-success: #10b981; /* emerald-500 */
  --color-status-info: #0ea5e9; /* sky-500 */
}
```

---

## 8. Components — Visual Specs and Examples

Each component defines structure, spacing, typography, colors, states, and responsive rules. Examples assume variables above or Nuxt UI analogs.

### 8.1 Button
- Spacing: vertical `--space-xs`, horizontal `--space-sm`.
- Typography: base text at `--font-size-base`; weight 500–600.
- Colors: primary/secondary/background per palette; disabled uses neutral.
- States: hover darken 8–12%, focus ring 2px, active pressed 4%.

Example:
```
<button
  style="
    padding: var(--space-xs) var(--space-sm);
    font-family: var(--font-primary);
    font-size: var(--font-size-base);
    background: var(--color-primary);
    color: #fff; border: 0; border-radius: 6px;
  "
>Primary</button>
```

### 8.2 Card
- Spacing: internal `--space-md`; external margin `--space-sm`.
- Typography: title h3, body base.
- Colors: background neutral‑100, border neutral‑300.

Example:
```
<article style="background: var(--color-neutral-100); border: 1px solid var(--color-neutral-300); padding: var(--space-md);">
  <h3 style="font-size: var(--h3-size); margin-bottom: var(--space-sm)">Card Title</h3>
  <p>Body text with standard line height.</p>
</article>
```

### 8.3 Form Controls (Input/Select/Checkbox)
- Spacing: label bottom `--space-xs`; field vertical `--space-xs`.
- Typography: base size; helper text in secondary font.
- Colors: border neutral‑300; focus ring primary.

Example:
```
<label style="display:block; margin-bottom: var(--space-xs)">Name</label>
<input style="padding: var(--space-xs); border: 1px solid var(--color-neutral-300); outline: none" />
<small style="font-family: var(--font-secondary)">Helper or error message</small>
```

### 8.4 Table
- Spacing: cell padding `--space-xs`/`--space-sm`.
- Typography: header semi‑bold; body base.
- Colors: header background neutral‑100; row hover neutral‑100.

Example:
```
<table style="width:100%; border-collapse: collapse">
  <thead>
    <tr>
      <th style="padding: var(--space-sm); text-align:left; border-bottom:1px solid var(--color-neutral-300)">Player</th>
      <th style="padding: var(--space-sm); text-align:right; border-bottom:1px solid var(--color-neutral-300)">Rating</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: var(--space-xs)">User A</td>
      <td style="padding: var(--space-xs); text-align:right">1234</td>
    </tr>
  </tbody>
</table>
```

### 8.5 Modal
- Spacing: content `--space-md`; footer `--space-sm` gap.
- Typography: title h4.
- Colors: backdrop rgba(neutral‑900, 0.5); surface neutral‑100.

Example:
```
<div class="backdrop" style="position:fixed; inset:0; background: rgba(0,0,0,0.5)">
  <div class="modal" style="margin: 10vh auto; max-width: 640px; background: var(--color-neutral-100); padding: var(--space-md); border-radius: 8px">
    <h4 style="font-size: var(--h4-size)">Confirm Action</h4>
    <p>Are you sure?</p>
    <footer style="margin-top: var(--space-sm)">
      <button>Cancel</button>
      <button style="background: var(--color-primary); color:#fff">Confirm</button>
    </footer>
  </div>
}</div>
```

### 8.6 Alert / Toast
- Spacing: `--space-sm` padding.
- Typography: base; title optional.
- Colors: status color backgrounds; text high contrast.

Example:
```
<div style="background: var(--color-status-success); color:#fff; padding: var(--space-sm)">Saved successfully</div>
```

### 8.7 Badge / Tag
- Spacing: inline `--space-xs`/`--space-sm`.
- Typography: small text; uppercase optional.
- Colors: primary/secondary/neutrals.

Example:
```
<span style="background: var(--color-secondary); color:#fff; padding: 2px var(--space-xs); border-radius: 9999px">ELO 1500+</span>
```

### 8.8 Navigation Bar
- Spacing: vertical `--space-sm`; horizontal `--space-md`.
- Typography: base/medium weight.
- Colors: background neutral; active link primary.

Example:
```
<nav style="display:flex; gap: var(--space-md); padding: var(--space-sm); background: var(--color-neutral-100)">
  <a style="color: var(--color-primary)">Home</a>
  <a>Players</a>
  <a>Ladder</a>
</nav>
```

### 8.9 Grid / Section
- Spacing: section padding `--space-lg`.
- Layout: columns `--grid-columns`; gutter `--grid-gutter`.

Example:
```
<section style="padding: var(--space-lg)">
  <div style="display:grid; grid-template-columns: repeat(var(--grid-columns), 1fr); gap: var(--grid-gutter)">
    <div>Block A</div>
    <div>Block B</div>
  </div>
</section>
```

### 8.10 Pagination
- Spacing: button `--space-xs`/`--space-sm`.
- Colors: active primary; disabled neutral.

Example:
```
<div style="display:flex; gap: var(--space-xs)">
  <button disabled>&laquo;</button>
  <button style="background: var(--color-primary); color:#fff">1</button>
  <button>2</button>
  <button>&raquo;</button>
</div>
```

---

## 9. Responsive Rules (Final)

Breakpoints: `sm 640px`, `md 768px`, `lg 1024px`, `xl 1280px`, `2xl 1536px` for mobile/tablet/desktop/wide
- Typography scales down/up per breakpoint; maintain legibility.
- Spacing compresses ~15% on smaller devices; expands up to 20% on large.
- Grid columns reduce progressively (e.g., 12→8→4→1).

Example:
```
@media (max-width: 640px) {
  :root { --h1-size: 26px; }
}
```

---

## 10. Performance Targets (Final)

- Targets: LCP < 2.5s, INP < 200ms, CLS < 0.1
- Optimize images, defer non‑critical scripts, cache data.
- Keep DOM complexity moderate; virtualize long lists when necessary.

---

## 11. Content & i18n (Final)

- Text must be internationalized (en/ru) using project i18n.
- Avoid hard‑coded strings; use semantic keys.
- Follow accessibility copy guidelines (clear, concise, descriptive).

---

## 12. Implementation Notes (Nuxt UI)

Current Nuxt UI colors (from `app/app.config.ts`):
```
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'amber',
      neutral: 'zinc',
      success: 'emerald',
      warning: 'amber',
      error: 'rose',
      info: 'sky',
    },
  },
})
```

Using Nuxt UI components:
```
<UButton color="primary" size="md">Primary</UButton>
<UCard class="p-md">
  <template #header><h3>Card Title</h3></template>
  Content
</UCard>
```

---

## 13. Checklist for AI Generation (Final)

- Use tokens above directly; no `${...}` placeholders remain.
- Map CSS variables and Nuxt UI theme consistently.
- Apply component specs and visual examples to templates.
- Validate a11y (color contrast, focus states, keyboard nav).
- Confirm performance budgets per page.

— End of Design System Specification —