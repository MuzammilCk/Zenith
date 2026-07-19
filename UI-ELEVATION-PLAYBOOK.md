# UI Elevation Playbook
*Turning a working site into a premium one — using only agent prompts*

## How to run this

1. Drop this file into the repo you're upgrading — same place `DESIGN.md` and its source files live, if this project has one.
2. Open your agent (Claude Code, Cursor, whatever you're using) with that repo loaded. You don't have to copy-paste the stage blocks below — just say "read UI-ELEVATION-PLAYBOOK.md and run Stage 0" and it'll pull the actual prompt from the file itself.
3. Stop and skim the output after Stage 0 (`UI-INVENTORY.md`) and after Stage 1 (the proposed direction). Everything downstream depends on these two being right — a bad call here gets applied everywhere in Stage 2, which is expensive to redo. Stage 2 and 3 can mostly run unattended.
4. Reusing this on another site: same file, same four messages, fresh repo. Decide once whether each site keeps its own distinct look or all of them share one signature — if the latter, tell Stage 1 to match the direction from the first project instead of inventing a new one.
5. Not a one-time treatment. When a new page or component gets added later, the cheapest move is adding it to `UI-INVENTORY.md` and re-running Stage 2 and 3 on just that item, not a full re-audit.

Part 1 below is background, worth reading once. Part 3 is the list Stage 0 should surface — keep it open as a sanity check. Part 4 is quick reference for two calls you'll hit on every project.

## Why one prompt isn't enough

Tell an agent to "make this look premium" and it will confidently redesign the hero, the primary button, maybe the pricing cards — and call it done. Not because it's lazy, but because those are the parts it happened to open. It has no built-in mechanism for noticing the native `<select>` dropdown four routes deep that's had browser-default styling since day one.

Two failure modes to design around:

1. **The generic-AI-tell aesthetic.** Left with creative freedom, agents cluster around a small number of defaults: a warm cream background with a serif headline and a terracotta accent; a near-black background with one acid-green or vermilion accent; or a broadsheet layout with hairline rules and zero border-radius. All three can look great — but only if you chose them. If you didn't ask for cream-and-serif and you got it anyway, that's the tell, not a style.
2. **The shallow pass.** A single "redesign this" prompt gets a breadth-first sweep, not a depth-first one. It fixes what's visible and stops.

Neither is fixed by a longer single prompt. Both are fixed by structure: an inventory that has to be checked off, and a verification pass that looks at rendered output, not just code.

## Part 1 — What actually reads as premium

**Restraint is the tell, not the decoration.** Every genuinely premium interface you can name runs on one accent color, used sparingly. Apple spends its one blue only on interactive elements. Claude's coral shows up on primary CTAs and full-bleed callout moments, and is deliberately absent everywhere else. Linear's lavender is spent only on the brand mark, focus rings, and the primary CTA — never a section background or card fill. The trick isn't the hue, it's that there's exactly one and it's scarce. There's an old styling rule that applies directly here: before you leave the house, look in the mirror and remove one accessory. Run the same pass on your palette and your hero section before calling either done.

**Depth is a system, not a shadow you added to one card.** Pick one elevation philosophy and hold it everywhere — either "shadows are rare and reserved for one purpose" (Apple uses exactly one shadow, system-wide, only under product photography) or "depth comes from a surface ladder, not shadows at all" (Linear lifts through four flat surface tones plus hairline borders and never reaches for `box-shadow`). What reads as cheap is a card with a random `0 4px 12px rgba(0,0,0,0.1)` sitting next to a flat one with none — the inconsistency, not the presence or absence of shadow itself.

**Type is doing more work than your color palette.** Two roles, used deliberately, beats five fonts used timidly — Claude pairs a serif display (Copernicus) with a humanist sans (StyreneB) for exactly this reason. Negative letter-spacing at large sizes is what separates "headline" from "paragraph, but bigger": Apple tightens to -0.28px at 56px, Linear goes as far as -3px at 80px. And resist filling in every weight your font ships — a deliberate gap in the ladder (Apple skips weight 500 entirely) reads as intentional in a way a full 300–900 ramp never does.

**Motion is physics, not decoration.** Spring-based easing (the default in libraries like Motion, formerly Framer Motion) over linear or generic ease-in-out; one orchestrated moment — a staggered entrance, a scroll-triggered reveal — instead of five different hover effects scattered across the page. And this one cuts against instinct: sometimes the most premium choice is less motion, not more. Animation on every hover is one of the fastest ways to make an interface read as AI-generated.

**Glass, at the level it's actually shipping now.** Apple's Liquid Glass (iOS 26 / macOS Tahoe onward) is the current reference point, and it's worth knowing both halves of its story: it's a functional layer that reflects and refracts what's behind it and morphs with context, not decorative blur on a div — but Apple's own first release drew real legibility complaints (transparent text was hard to read in bright light), and the following year's WWDC was spent dialing back translucency and adding opaque backing to toolbars and sidebars specifically to fix it. The lesson: glass needs a tinted backing layer for contrast, not just blur.

```css
.glass-surface {
  background: rgba(20, 18, 16, 0.55);       /* tint for legibility — blur alone isn't enough */
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-top-color: rgba(255, 255, 255, 0.22); /* brighter top edge catches light like real glass */
}
```

Use it on things that float above content — nav bars, modals, command palettes. Skip it on primary reading surfaces, data tables, and anywhere contrast is safety-critical (forms, prices, error text).

**3D earns its place; it doesn't decorate every card.** A tilt-on-hover product card in a hero section is a signature moment. The same tilt on every row of a 40-row admin table is motion sickness. Use CSS `perspective` + `transform` for hover-level 3D; reach for Three.js / React Three Fiber only when you genuinely need a WebGL scene (a rotatable product, a generative background) — not as the default way to add "3D."

```css
.card-3d { perspective: 1000px; }
.card-3d:hover .card-3d-inner {
  transform: rotateX(4deg) rotateY(-6deg) translateZ(10px);
  transition: transform 400ms cubic-bezier(0.2, 0, 0, 1);
}
```

**The boring 80% is where premium is actually won.** Anyone can make a hero section look good. What separates a polished product from a landing-page skin is whether the empty state, the error state, and the disabled state got the same attention. Write these in the interface's voice, not a person's: an error names what happened and how to fix it, and never apologizes or hedges; an empty state is an invitation to act, not a mood — "No projects yet — create your first one" beats a sad illustration and silence.

## Part 2 — The workflow

Run these as separate turns, in order, in your agent of choice. Each stage's output becomes the next stage's input — that dependency is what prevents the shallow-pass problem.

### Stage 0 — Inventory, before anything gets styled

```
Before changing any styling, build a complete inventory of every UI surface in this codebase — don't rely on what you remember seeing, actually search for it. Cover:
- every page/route
- every reusable component, and every place styling is done inline/ad hoc instead of through a shared component
- every native form element: <select>, date/time/range/file inputs, checkboxes, radios, switches
- every dropdown, popover, tooltip, modal, toast, or context menu (check for library imports like Radix/Headless UI as well as custom implementations)
- every loading, empty, error, and disabled state you can find
- every breakpoint currently handled, and where it's handled inconsistently

Output this as a literal checklist in UI-INVENTORY.md, grouped by category, with a file path next to each item. Don't skip anything for seeming minor — an untouched native dropdown is exactly what this file exists to catch. Don't style anything yet.
```

### Stage 1 — Direction and tokens, critiqued before you build

```
Propose a design direction for this project: 4-6 named colors, two type roles used deliberately (not the same pairing you'd default to on any project), a spacing/radius scale, and one signature element this UI should be remembered by. If a DESIGN.md or similar design-token file already exists in this repo, use it as the foundation instead of starting from scratch.

Before implementing anything, critique your own plan against these AI-generic defaults and say explicitly whether you're avoiding them on purpose or by accident: (1) warm cream background with a serif headline and a terracotta accent, (2) near-black background with a single acid-green or vermilion accent, (3) broadsheet layout with hairline rules and zero border-radius. If your plan matches one of these and you didn't choose it deliberately for this brief, revise it and say what changed.

Only after that critique, move to implementation.
```

### Stage 2 — Systematic application against the inventory

```
Using UI-INVENTORY.md as a literal checklist and the design direction from the previous step as the token source, apply the system to every item on the list, checking each one off as you finish it. Work component-by-component, not page-by-page — fixing a shared Button or Dropdown once fixes every instance of it; anything inline/ad hoc needs individual attention, and those are usually the ones that get missed. Don't consider this stage done until every line in UI-INVENTORY.md is checked off. If you find something during this pass that wasn't in the inventory, add it before moving on.
```

### Stage 3 — Screenshot verification and the detail sweep

```
Take a screenshot of every page at mobile, tablet, and desktop widths, plus every interactive state you can trigger without a live user: hover, focus, an open dropdown, an open modal, an empty state, an error state, a disabled state, a loading state, and dark mode if this project has one. Critique each screenshot against the design direction — call out anything that still reads as a default: an unstyled native select, the browser's default focus ring, an unstyled scrollbar, a mismatched icon set, an untouched 404 page. Fix what you find, then repeat the screenshot pass. Stop when a full pass turns up nothing new.
```

**One implementation gotcha worth watching for:** agents often generate classes that cancel each other out — a type-based selector like `.card` and an element-based one like `.button` both setting padding on the same element, with specificity deciding the winner unpredictably. This shows up most often as inconsistent gaps between sections. If Stage 3's screenshots show spacing that doesn't match the token spec, check for a specificity collision before assuming the token itself is wrong.

### The compressed version, if you want one shot

Staged catches more, but for something small this folds all four stages into one prompt — it relies on the agent's discipline instead of a forced checkpoint between steps:

```
Audit this codebase for every UI surface — pages, components, native form elements, dropdowns/modals/tooltips/toasts, loading/empty/error/disabled states, and every breakpoint — and write it to UI-INVENTORY.md before touching any styling. Then propose a design direction (colors, two type roles, spacing/radius scale, one signature element), check it against generic AI defaults (cream+serif+terracotta / near-black+single-neon-accent / broadsheet-hairline) and revise if it matches one by accident. Then apply that direction to every item in the inventory, checking items off as you go. Finish by screenshotting every page at three breakpoints plus every interactive state you can trigger, and fix anything that still looks unstyled or default. Don't stop until the inventory is fully checked off and a screenshot pass turns up nothing new.
```

## Part 3 — What vibe-coded redesigns miss

**Navigation & wayfinding** — primary nav (desktop + mobile hamburger, including its open/close animation), dropdown/mega menus inside the nav, breadcrumbs, pagination (including disabled prev/next at the boundaries), tabs (active/inactive/hover/focus), sidebar collapsed vs. expanded.

**Form controls** — native `<select>`, checkbox/radio/switch, date/time/range inputs, file upload (drag zone, selected-file chip, remove action), text input in every state (default/focus/error/disabled/with-icon), textarea resize handle, autocomplete dropdowns, label vs. placeholder distinction, validation messaging, required-field markers.

**Feedback & status** — toasts/snackbars, loading treatment (pick skeleton *or* spinner *or* progress bar, don't mix systems), empty states (first-use, no-results, cleared-all), error states (inline, page-level, 404, 500), disabled states, tooltips (including a touch equivalent), success confirmations.

**Overlays** — modals/dialogs (scrim opacity, close affordance, focus handling), dropdown menus/popovers, right-click context menus, command palette / search overlay.

**Content atoms** — badges/tags/status pills, avatars with a fallback (initials, not a broken image icon), table headers with sort indicators and row hover, card hover/focus states, one consistent icon set at one consistent stroke width.

**Browser chrome** — scrollbar styling (or a deliberate decision to leave it native), `::selection` color, the keyboard focus-visible ring (the single most-skipped item on this list, and the most important for accessibility), cursor states, favicon and `theme-color` meta tag.

**Cross-cutting** — dark mode parity for every item above, `prefers-reduced-motion` fallback for every animation, 44px minimum touch targets on mobile.

## Part 4 — Quick calls

**3D or flat?** 3D for a hero, a product showcase, a portfolio piece — anywhere someone looks once and moves on. Flat for dashboards, admin panels, data tables — anywhere someone works for extended periods; sustained 3D motion in a workspace becomes fatigue, not delight.

**Glass or solid?** Glass for things floating above content that still need spatial context — nav bars, modals, command palettes. Solid for primary reading surfaces, data tables, and anywhere legibility is non-negotiable (forms, prices, error messages) — exactly where Apple's first pass at Liquid Glass had to add opacity back in.
