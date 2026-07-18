version: alpha
name: Nintendo x Replicate Mega UI/UX Analysis
description: |
  A hybrid UI system that combines the brushed-periwinkle console chrome of Nintendo.com circa 2001 with the warm-cream developer-tools aesthetic of Replicate — a machine-faceplate interface fused with an art-zine product surface: carbon command bars, halftone texture, bold outlined display type, cream canvas, dark code wells, and a hot orange CTA accent.

colors:
  primary: "#e60012"
  primary-deep: "#c01f00"
  on-primary: "#ffffff"
  ink: "#202020"
  body: "#3a3a3a"
  charcoal: "#575757"
  mute: "#646464"
  ash: "#8d8d8d"
  stone: "#bbbbbb"
  on-dark: "#fcfcfc"
  on-dark-mute: "rgba(252,252,252,0.72)"
  canvas: "#f9f7f3"
  surface-bone: "#f3f0e8"
  surface-card: "#ffffff"
  surface-dark: "#202020"
  surface-deep: "#000000"
  hairline: "rgba(32,32,32,0.12)"
  hairline-strong: "#202020"
  divider-dark: "rgba(255,255,255,0.2)"
  hero-warm: "#ea2804"
  hero-glow: "#ff6a3d"
  hero-pink: "#f4a8a0"
  badge-success: "#2b9a66"
  link: "#ea2804"
  ring-focus: "rgba(59,130,246,0.5)"
  github-dark: "#24292e"
  signal: "#f68d1f"
  amber: "#ecab37"
  nav-gold: "#e48600"
  canvas-soft: "#9fbee7"
  sky: "#9fbee7"
  lavender: "#acace7"
  ice: "#c0d5e6"
  periwinkle: "#8ba1d4"
  chrome-indigo: "#3d4f97"
  muted-indigo: "#60619c"
  platinum: "#dedede"
  carbon: "#21242e"
  systems-teal: "#206479"
  games-red: "#a7282b"
  error: "#e60012"

typography:
  display-xxl:
    fontFamily: rb-freigeist-neue
    fontSize: 128px
    fontWeight: 700
    lineHeight: 1.0
    letterSpacing: -3px
  display-xl:
    fontFamily: rb-freigeist-neue
    fontSize: 72px
    fontWeight: 700
    lineHeight: 1.0
    letterSpacing: -1.8px
  display-lg:
    fontFamily: rb-freigeist-neue
    fontSize: 48px
    fontWeight: 700
    lineHeight: 1.0
    letterSpacing: -1px
  display-md:
    fontFamily: rb-freigeist-neue
    fontSize: 30px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.5px
  heading-lg:
    fontFamily: basier-square
    fontSize: 38.4px
    fontWeight: 600
    lineHeight: 0.83
    letterSpacing: -0.5px
  heading-md:
    fontFamily: basier-square
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.33
    letterSpacing: -0.35px
  heading-sm:
    fontFamily: basier-square
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: -0.3px
  subtitle:
    fontFamily: rb-freigeist-neue
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.56
    letterSpacing: 0
  body-lg:
    fontFamily: basier-square
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.56
    letterSpacing: 0
  body-md:
    fontFamily: basier-square
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  body-sm:
    fontFamily: basier-square
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.43
    letterSpacing: 0
  button-md:
    fontFamily: basier-square
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.0
    letterSpacing: 0
  button-sm:
    fontFamily: basier-square
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.0
    letterSpacing: 0
  caption:
    fontFamily: basier-square
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.33
    letterSpacing: 0
  caption-tight:
    fontFamily: basier-square
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.43
    letterSpacing: -0.35px
  code-md:
    fontFamily: jetbrains-mono
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.43
    letterSpacing: 0
  code-sm:
    fontFamily: jetbrains-mono
    fontSize: 11px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  nav-link:
    fontFamily: Arial
    fontSize: 13px
    fontWeight: 700
    lineHeight: 1
    letterSpacing: 0.5px
  ui-label:
    fontFamily: Arial
    fontSize: 11px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: 0.5px
  display:
    fontFamily: Arial Black
    fontSize: 44px
    fontWeight: 900
    lineHeight: 1
    letterSpacing: 0
  hero-tagline:
    fontFamily: Arial
    fontSize: 15px
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: 0
  body:
    fontFamily: Arial
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0
  link:
    fontFamily: Arial
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: 0
  micro:
    fontFamily: Arial
    fontSize: 10px
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: 0

rounded:
  none: 0px
  xs: 4px
  sm: 6px
  md: 10px
  lg: 16px
  full: 9999px

spacing:
  xxs: 2px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  xxxl: 48px
  section: 96px
  band: 160px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
    padding: 12px 24px
    height: 44px
  button-primary-pressed:
    backgroundColor: "{colors.primary-deep}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
  button-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
    padding: 12px 24px
    height: 44px
  button-outline:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
    padding: 11px 23px
    height: 44px
  button-ghost:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
    padding: 8px 16px
    height: 36px
  button-icon:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    size: 36px
  button-submit:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.on-primary}"
    typography: "{typography.ui-label}"
    rounded: "{rounded.xs}"
    padding: "{spacing.lg}"
  button-secondary:
    backgroundColor: "{colors.carbon}"
    textColor: "{colors.on-primary}"
    typography: "{typography.ui-label}"
    rounded: "{rounded.none}"
    padding: "{spacing.md}"
  button-icon-arrow:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
    size: 22px
  button-arrow-chip:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.xs}"
    padding: "{spacing.xs}"
    size: 18px
  text-input:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.full}"
    padding: "{spacing.md} {spacing.lg}"
    height: 44px
  search-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.xs}"
    padding: "{spacing.xs}"
    height: 20px
  select-dropdown:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.xs}"
    padding: "{spacing.xs}"
    height: 24px
  field-label:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.link}"
    rounded: "{rounded.none}"
    padding: "{spacing.xxs}"
  form-panel:
    backgroundColor: "{colors.platinum}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  dotted-divider:
    backgroundColor: "{colors.muted-indigo}"
    textColor: "{colors.muted-indigo}"
    rounded: "{rounded.none}"
    height: 1px
  hero-band:
    backgroundColor: "{colors.hero-warm}"
    textColor: "{colors.on-dark}"
    typography: "{typography.display-xl}"
    rounded: "{rounded.none}"
    padding: "{spacing.section}"
  hero-panel:
    backgroundColor: "{colors.lavender}"
    textColor: "{colors.surface}"
    typography: "{typography.display}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  model-card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  collection-tile:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.heading-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.xl}"
  pricing-tier:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xxl}"
  pricing-tier-featured:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xxl}"
  code-block:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.code-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.xl}"
  code-tab:
    backgroundColor: "{colors.surface-deep}"
    textColor: "{colors.on-dark-mute}"
    typography: "{typography.code-sm}"
    rounded: "{rounded.xs}"
    padding: "{spacing.xs} {spacing.sm}"
  badge-status:
    backgroundColor: "{colors.badge-success}"
    textColor: "{colors.on-dark}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "{spacing.xxs} {spacing.sm}"
  badge-tag:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "{spacing.xxs} {spacing.sm}"
  nav-bar:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button-sm}"
    rounded: "{rounded.none}"
    height: 60px
  sub-nav-pill:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.button-sm}"
    rounded: "{rounded.full}"
    padding: 6px 14px
  contributor-avatar:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    size: 40px
  footer:
    backgroundColor: "{colors.surface-deep}"
    textColor: "{colors.on-dark}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    padding: "{spacing.section}"
  section-label-bar:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.ui-label}"
    rounded: "{rounded.none}"
    padding: "{spacing.sm}"
  news-row:
    backgroundColor: "{colors.platinum}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.link}"
    rounded: "{rounded.sm}"
    padding: "{spacing.sm}"
  featured-tile:
    backgroundColor: "{colors.carbon}"
    textColor: "{colors.on-primary}"
    typography: "{typography.micro}"
    rounded: "{rounded.sm}"
    padding: "{spacing.xxs}"
  poll-panel:
    backgroundColor: "{colors.periwinkle}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  radio-option:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.full}"
    size: 12px
  info-box:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "{spacing.md}"
  promo-card:
    backgroundColor: "{colors.lavender}"
    textColor: "{colors.ink}"
    typography: "{typography.display}"
    rounded: "{rounded.sm}"
    padding: "{spacing.md}"
  system-tile:
    backgroundColor: "{colors.periwinkle}"
    textColor: "{colors.ink}"
    typography: "{typography.ui-label}"
    rounded: "{rounded.sm}"
    padding: "{spacing.sm}"
  link-row-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "{spacing.sm}"
  calendar-widget:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.micro}"
    rounded: "{rounded.sm}"
    padding: "{spacing.sm}"
  left-rail-tab:
    backgroundColor: "{colors.carbon}"
    textColor: "{colors.canvas-soft}"
    typography: "{typography.ui-label}"
    rounded: "{rounded.none}"
    padding: "{spacing.xs}"
  esrb-badge:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.carbon}"
    typography: "{typography.micro}"
    rounded: "{rounded.xs}"
    padding: "{spacing.xxs}"
  esrb-rating-square:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.carbon}"
    typography: "{typography.ui-label}"
    rounded: "{rounded.xs}"
    size: 20px
  mascot-bubble:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.carbon}"
    typography: "{typography.micro}"
    rounded: "{rounded.lg}"
    padding: "{spacing.sm}"

  # ─── Examples (illustrative) — kit-mirror demonstration surfaces ───
  ex-pricing-tier:
    description: "Default Pricing tier card. Re-uses feature-card chrome with brand canvas-soft surface."
    backgroundColor: "{colors.canvas-soft}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  ex-pricing-tier-featured:
    description: "Featured/highlighted tier — polarity-flipped surface (dark fill + light text in light mode, light fill + dark text in dark mode)."
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  ex-product-selector:
    description: "What's Included summary card — re-purposed for SaaS / B2B verticals (NOT a literal product gallery)."
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  ex-cart-drawer:
    description: "Subscription summary — re-purposed for SaaS / B2B (line items per add-on, not literal cart)."
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
    item-divider: "{colors.hairline}"
  ex-app-shell-row:
    description: "Sidebar nav row inside the App Shell example. Active state uses brand primary as the indicator."
    backgroundColor: "{colors.canvas}"
    activeIndicator: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: "{spacing.sm} {spacing.md}"
  ex-data-table-cell:
    description: "Default data-table th + td chrome. Header uses mono-caps eyebrow typography; body uses body-sm."
    headerBackground: "{colors.canvas-soft}"
    headerTypography: "{typography.ui-label}"
    bodyTypography: "{typography.body}"
    cellPadding: "{spacing.xs} {spacing.sm}"
    rowBorder: "{colors.hairline}"
  ex-auth-form-card:
    description: "Sign-in / sign-up card. Re-uses feature-card chrome with text-input primitives inside."
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  ex-modal-card:
    description: "Modal dialog surface — same chrome as feature-card with elevated shadow."
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  ex-empty-state-card:
    description: "Empty-state illustration frame."
    backgroundColor: "{colors.canvas-soft}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xl}"
    captionTypography: "{typography.body}"
  ex-toast:
    description: "Toast notification surface — feature-card shape + medium shadow."
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm} {spacing.md}"
    typography: "{typography.body}"

## Overview

Nintendo.com circa 2001 is the web rendered as **console hardware**. Replicate is a developer-tools platform with the soul of an art zine. The hybrid system combines the cool periwinkle-to-indigo chrome, carbon command slabs, and halftone texture of the Nintendo surface with the warm cream canvas, massive editorial display type, and code-well rhythm of Replicate.

## Colors

### Brand & Accent
- **Nintendo Red** (`{colors.primary}` — #e60012): the racetrack logo wordmark and anchor hue.
- **Signal Orange** (`{colors.signal}` — #f68d1f): the "go forward" color.
- **Amber** (`{colors.amber}` — #ecab37): utility energy.
- **Nav Gold** (`{colors.nav-gold}` — #e48600): primary navigation words.
- **Replicate Orange** (`{colors.hero-warm}` / `{colors.primary}` — #ea2804): the brand accent.

### Surface
- **Periwinkle Metallic** (`{colors.canvas}` — #7a8aba): primary interface body.
- **Light Periwinkle** (`{colors.periwinkle}` — #8ba1d4): raised mid panels.
- **Pale Sky** (`{colors.canvas-soft}` — #9fbee7): secondary nav strip and inset panels.
- **Pale Lavender** (`{colors.lavender}` — #acace7): hero field.
- **Platinum Gray** (`{colors.platinum}` — #dedede): list-row surface.
- **Canvas** (`{colors.canvas}` — #f9f7f3): default page background.
- **Surface Bone** (`{colors.surface-bone}` — #f3f0e8): inset card groups.
- **Surface Card** (`{colors.surface-card}` — #ffffff): individual cards and inputs.
- **Surface Dark** (`{colors.surface-dark}` — #202020): code wells and deep panels.

### Text
- **Carbon Navy** (`{colors.ink}` — #21242e): primary text on light chrome.
- **Chrome Indigo** (`{colors.ink-soft}` — #3d4f97): secondary text and chrome labels.
- **White** (`{colors.on-primary}` / `{colors.on-dark}`): text on dark and warm surfaces.

### Semantic
- **Error / Alert** (`{colors.error}` — #e60012): validation and destructive states.
- **Success** (`{colors.badge-success}` — #2b9a66): running status pills.
- **Focus Ring** (`{colors.ring-focus}` — rgba(59,130,246,0.5)): interactive focus.

## Typography

### Font Family
- **Arial / Helvetica** for chrome labels and body.
- **rb-freigeist-neue** for large editorial display.
- **basier-square** for body, button labels, and metadata.
- **JetBrains Mono** for every code well and inline command.

### Hierarchy
| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display-xxl}` | 128px | 700 | 1.0 | -3px | Hero headline |
| `{typography.display-xl}` | 72px | 700 | 1.0 | -1.8px | Section openers |
| `{typography.display}` | 44px | 900 | 1 | 0 | Hero box-art wordmarks |
| `{typography.nav-link}` | 13px | 700 | 1 | 0.5px | Primary nav words |
| `{typography.ui-label}` | 11px | 700 | 1.1 | 0.5px | Panel titles and button text |
| `{typography.body-md}` / `{typography.body}` | 16px / 12px | 400 | 1.5 / 1.4 | 0 | Body copy |
| `{typography.code-md}` | 14px | 400 | 1.43 | 0 | Code blocks |
| `{typography.micro}` | 10px | 400 | 1.3 | 0 | Footer and fine print |

### Principles
- Display sizes stay tight and stacked.
- Body copy stays small and quiet.
- Outline-and-shadow treatment carries the hero voice.
- Code is always monospace.

## Layout

### Spacing System
- **Base units**: 4px and 8px.
- **Tokens**: `{spacing.xxs}` 2px · `{spacing.xs}` 4px · `{spacing.sm}` 8px · `{spacing.md}` 12px · `{spacing.lg}` 16px · `{spacing.xl}` 24px · `{spacing.xxl}` 32px · `{spacing.xxxl}` 48px · `{spacing.section}` 96px · `{spacing.band}` 160px.

### Grid & Container
- Fixed-width chrome over dense modular panels.
- Full-bleed hero fields above split-column content.
- Two-column splits collapse to stacked layouts on narrow viewports.

### Whitespace Philosophy
- Empty space is an engineered seam.
- Panels butt together with thin bevel lines.
- Cream pages breathe; chrome pages pack densely.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| 0 — Inset / flat | Recessed body or no border | List rows, form fields, canvas body |
| 1 — Plate / outline | 1px divider or beveled edge | Content panels, cards, tiles |
| 2 — Raised chip | Bright top edge + hard bottom shadow | Utility chips, nav tabs, Go/Submit buttons |
| 3 — Command slab | Dark halftone slab | Top nav, right-rail buttons, footer |
| 4 — Soft drop | `0 8px 24px rgba(32,32,32,0.08)` | Hover-anchored thumbnails |

### Decorative Depth
- Halftone texture on dark slabs.
- Hero fields use tinted photographic plates.
- Chamfered corners and box-art outlines carry the hardware feel.
- Dark code wells sit inside the cream canvas as print pull-quotes.

## Shapes

### Border Radius Scale
| Token | Value | Use |
|---|---|---|
| `{rounded.none}` | 0px | Nav bars, footers, sharp chrome plates |
| `{rounded.xs}` | 2px / 4px | Utility buttons, form fields, badges |
| `{rounded.sm}` | 4px / 6px | Small panels, featured tiles, list rows |
| `{rounded.md}` | 6px / 10px | Content panels, model cards, hero panel |
| `{rounded.lg}` | 10px / 16px | Outer panels, pricing tiers, mascot bubble |
| `{rounded.full}` | 9999px | Logo pill, radio dots, badges, avatars, pills |

### Photography Geometry
- Hero photography fills beveled rectangles.
- Featured-site and game thumbnails are compact fixed tiles.
- Contributor avatars are circular.
- Model thumbnails are square with mid-radius corners.

## Components

### Navigation
- `nav-bar`
- `subnav-strip`
- `left-rail-tab`
- `sub-nav-pill`

### Brand & Masthead
- `logo-pill`
- `mascot-bubble`

### Buttons
- `button-primary`
- `button-primary-pressed`
- `button-dark`
- `button-outline`
- `button-ghost`
- `button-icon`
- `button-submit`
- `button-secondary`
- `button-icon-arrow`
- `button-arrow-chip`

### Inputs & Forms
- `search-field`
- `text-input`
- `select-dropdown`
- `field-label`
- `form-panel`
- `radio-option`
- `dotted-divider`

### Cards & Panels
- `hero-panel`
- `hero-band`
- `model-card`
- `collection-tile`
- `pricing-tier`
- `pricing-tier-featured`
- `code-block`
- `code-tab`
- `news-row`
- `featured-tile`
- `poll-panel`
- `info-box`
- `promo-card`
- `system-tile`
- `link-row-card`
- `calendar-widget`

### Badges & Footer
- `badge-status`
- `badge-tag`
- `esrb-badge`
- `esrb-rating-square`
- `footer`
- `footer-bar`
- `contributor-avatar`
- `mascot-bubble`

### Examples (illustrative)
- `ex-pricing-tier`
- `ex-pricing-tier-featured`
- `ex-product-selector`
- `ex-cart-drawer`
- `ex-app-shell-row`
- `ex-data-table-cell`
- `ex-auth-form-card`
- `ex-modal-card`
- `ex-empty-state-card`
- `ex-toast`

## Do's and Don'ts

### Do
- Keep the chrome voice uppercase and tracked.
- Keep the display type outlined.
- Keep body copy small.
- Use warm color only for wayfinding.
- Use cream canvas for the page and white only for cards/inputs.
- Use JetBrains Mono for code.

### Don't
- Don't soften every corner.
- Don't flatten the dual-nav structure.
- Don't add decorative accent colors.
- Don't let orange bleed into large surfaces.
- Don't replace cream with pure white at the page level.
- Don't put code in a light gray box.

## Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|---|---|---|
| Desktop XL | ≥ 1440px | Full-width body sections and full-bleed hero bands |
| Desktop | 1280–1439px | Reduced side padding |
| Tablet Large | 1024–1279px | Model grid 3-up |
| Tablet | 768–1023px | Model grid 2-up; code-story stacks |
| Mobile Large | 426–767px | Model grid 1-up; nav collapses |
| Mobile | ≤ 425px | All grids 1-up; compact section padding |

### Touch Targets
- Buttons ship at minimum 44px tall on mobile.
- Icon buttons expand their hit areas.
- Sub-nav pills remain tappable.

### Collapsing Strategy
- Dual nav bars collapse into a single carbon bar with disclosure.
- Two-column body becomes stacked.
- Left rail tabs become a horizontal chip row or are removed.
- Fixed hero becomes fluid full-bleed hero.

### Image Behavior
- Hero fields stay full-bleed.
- Thumbnails serve at higher DPR for crispness.
- Code blocks wrap softly below tablet widths.

## Iteration Guide
1. Focus on one component at a time.
2. Reference component names and tokens directly.
3. Keep `{colors.primary}` scarce.
4. Preserve the tension between sharp plates and pill controls.
5. Keep code-story sections dark.
6. Reuse the same primitive across chrome and cream surfaces where possible.

## Known Gaps
- Active/pressed states are strongest for button-primary.
- Logged-in playground surfaces remain out of scope.
- Dashboard, billing, and API-key management surfaces are not extracted.
- The hero artwork remains decorative and bespoke.
