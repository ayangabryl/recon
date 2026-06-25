# Wise Design — Design spec

**Source:** https://wise.design/  
**Screenshots:** `./screenshots/`  
**Captured:** 2026-06-25 (CDP)

---

## Summary

Minimal white canvas. **Desktop:** centered horizontal carousel in pill/circle masks; logo, Inspiration/Direction toggle, play/pause. **Mobile:** vertical card stack; logo top-left; no toggle. Bottom: attribution, progress, links on both.

---

## Responsive

**Audit:** `screenshots/responsive/responsive.json`

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | 375 | Vertical carousel, cards ~124×70–124px variable height, logo 40×40 @ (16,18) |
| Tablet/Desktop | ≥800 | Horizontal marquee, cards 96–213×120, toggle centered |

**Build:** Use `md:` (or separate mobile route) when `gates.axisDiffers` is true. Do not scale desktop marquee down for mobile.

**Clone `/wise`:** Desktop (horizontal marquee + intro swipe). Mobile (vertical stack, 124px cards, no toggle/progress).

---

## Colors

| Token | Value | Use |
|-------|-------|-----|
| canvas | `#ffffff` | Page bg |
| ink | `#000000` | Footer links, attribution |
| forest | `rgb(34, 61, 13)` / `#223d0d` | Active Inspiration pill |
| mint-track | `rgba(226, 246, 213, 0.6)` | Toggle container |
| progress-track | `#e5e5e5` | Progress bar track |
| progress-fill | `#1a1a1a` | Progress thumb |

---

## Typography

| Role | Font | Size | Weight |
|------|------|------|--------|
| toggle | Inter | 16px | 400 |
| footer-link | Inter | 12px | 400 |
| attribution | Inter | 12px | 400 |

---

## Spacing

| Token | Value | Notes |
|-------|-------|-------|
| card-height | `120px` | All carousel items |
| card-radius | `64px` | Pill/circle mask |
| card-gap | `12px` | Between items |
| toggle-padding | `4px` | Outer track |
| toggle-segment | `5px 23px` | Inner pills |
| toggle-height | `48px` | Segment container |
| header-padding | `24px 32px` | Top bar |
| footer-padding | `24px 32px` | Bottom bar |
| progress-width | `~480px` | Centered track |
| progress-height | `2px` | Thin bar |

### Card widths (CDP)

| Shape | W × H |
|-------|-------|
| circle | 120 × 120 |
| pill-narrow | 96 × 120 |
| pill-medium | 160 × 120 |
| pill-wide | 213 × 120 |

---

## Motion

| Element | Source | Clone (GSAP) |
|---------|--------|--------------|
| Carousel | CSS marquee infinite | `gsap.to(track, { x: -halfWidth, repeat: -1, ease: 'none' })` |
| Play/pause | `pause-carousel` button | `tween.pause()` / `play()` |
| Progress bar | Synced to scroll | `onUpdate` → set thumb width from tween progress |
| Toggle | Pill swap | **tabs-sliding** (transitions-dev) |
| Page load | None notable | Optional `gsap.from` stagger on cards (subtle) |

### GSAP implementation

```js
// Duplicate item set ×2 in DOM for seamless loop
// duration ~45s for full cycle (match calm scroll feel)
// useGSAP + scope ref, kill on unmount
```

**Do not implement:** Direction subsite IA, locale rotator keyframes.

---

## Behaviors

| Interaction | Trigger | Effect | Clone |
|-------------|---------|--------|-------|
| Card focus | `mouseenter` carousel card | Media expands 120→480px, radius 64→48px | GSAP `power2.out` ~0.45s |
| Metadata reveal | hover active card | 80px title col + desc + tags under desc | See `hover-layout.json` |
| Carousel pause | hover any card | Auto-scroll stops until leave | `tween.pause()` + 80ms resume debounce |
| Attribution rotator | auto ~2.5s | Cycles 8 language lines | `.vertical-text-rotator` |
| Play/pause | header button | Toggle scroll | `tween.play()` / `pause()` |

Probe data: `behaviors.json`, `hover-layout.json`. Screenshot: `screenshots/behavior-hover.png`.

---

## Components

### Header
- Logo 40×40 — fastflag pattern PNG + `#163300` SVG mask (`ui-chrome.json`)
- Center: `.t-tabs` Inspiration | Direction — active text `#9fe870`, inactive `#163300`
- Right: 44×44 pause/play SVG button (not generic bordered circle)

### Carousel
- Overflow hidden viewport, full width
- Flex row, duplicated slides
- Each slide: rounded mask + `next/image`

### Footer
- Left: **cycling attribution** — 8 languages, ~2.5s interval (`attribution-data.ts`)
- Center: progress track **160×9px** `rgba(0,0,0,0.08)`, thumb **63×9px** `rgb(31,41,55)`
- Right: Instagram, Careers (stacked)

---

## Build checklist

- [x] Research + screenshots
- [x] Nav + toggle (tabs-sliding)
- [x] GSAP infinite carousel
- [x] Play/pause + progress sync
- [x] Footer
- [x] Screenshot diff vs `00-hero-full.png`
- [x] Hover expand + metadata panel
- [x] Pause on card hover
- [x] `behaviors.json` captured
- [x] `compare/` — reference vs clone screenshots + `compare.json` pass
- [x] `ui-chrome.json` — logo, pause SVG, progress bar
- [x] `behavior-test.json` pass (incl. rotator + rapid-hover)
