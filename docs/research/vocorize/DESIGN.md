# Vocorize — Design spec

**Source:** https://vocorize.com/  
**Screenshots:** `./screenshots/`  
**Captured:** 2026-06-25 (spacing + motion audit via browser CDP)

---

## Summary

Minimal white editorial scroll page. Lowercase voice. Serif display + sans body. One Spline hero. Body is static — no scroll reveals. Spacing is **content-driven between sections**, but **fixed rhythm inside each block**.

---

## Colors

| Token | Value | Use |
|-------|-------|-----|
| canvas | `#ffffff` | Page bg |
| ink | `#262626` | Section headings |
| ink-body | `#515151` | Body, lists |
| ink-muted | `#7e7e7e` | Uppercase labels |
| ink-footer | `rgba(0,0,0,0.72)` | Footer links |
| cta-primary | `#222222` | Download button bg |
| cta-secondary | `#ebebeb` | GitHub button bg |
| cta-secondary-text | `#333333` | GitHub button text |
| divider | `rgba(0,0,0,0.1)` | Dashed rules + frame |

---

## Typography

| Role | Font | Size | Weight | Line-height | Transform |
|------|------|------|--------|-------------|-----------|
| display | Instrument Serif | 42px | 400 | 46.2px | lowercase |
| body | Inter | 16px | 400 | 22.4px | lowercase |
| label-caps | Inter | 12px | 400 | ~16px | uppercase, ls 0.48px |
| button | Inter | 14px | 700 | 1.4 | lowercase |
| footer-link | Inter | 16px | 400 | 1.4 | lowercase |

---

## Spacing

### Layout

| Token | Value | Notes |
|-------|-------|-------|
| page-frame | `420px` | Outer column; dashed vertical borders |
| content-column | `380px` | Inner text column (20px inset each side) |
| page-height | `~4380px` | Desktop 1920 viewport |
| hero-spline | `540px` | Full-width iframe height |
| hero-fade | `245px` | White gradient under Spline |

### Fixed rhythm (use these in build)

| Token | Value | Between |
|-------|-------|---------|
| heading-to-body | `24px` | `h1` → first paragraph |
| paragraph-stack | `22px` | Stacked lines / list items |
| body-to-buttons | `44px` | Last hero line → CTA row |
| button-gap | `15px` | Primary ↔ secondary CTA |
| buttons-to-label | `50px` | CTA row → "works in every app…" |
| label-to-icons | `16px` | Label → icon row |
| icon-size | `40px` | Each integration mark |
| icon-gap | `16–17px` | ~16.5px avg between icons |
| icons-to-divider | `70px` | Icon row → dashed rule |
| divider-to-heading | `70px` | Dashed rule → next `h1` |

### Section gaps (h1 → h1, content-driven)

Measured gap from bottom of one `h1` to top of next `h1` (includes section content + divider + margins):

| From | To | Gap |
|------|-----|-----|
| introducing vocorize | hi :) | 521px |
| hi :) | why i built it | 344px |
| why i built it | who it's for | 532px |
| who it's for | how it works | 277px |
| how it works | what you need to know | 232px |
| what you need to know | pricing | 345px |
| pricing | tl;dr | 509px |
| tl;dr | made by tanvir | 552px |

**Rule:** Do not use a single `mt-*` between sections. Let content height vary; keep **divider-to-heading: 70px** and **icons-to-divider: 70px** constant.

### Frames & dividers

| Element | Spec |
|---------|------|
| Vertical frame | `border-left/right: 1px dashed rgba(0,0,0,0.1)` on 420px wrapper |
| Horizontal divider | `border-top: 1px dashed rgba(0,0,0,0.1)`, width 380px |

### Audit data (CDP measured)

Divider Y positions: `1036, 1426, 2004, 2327, 2605, 2996, 3551, 4149`

CSS variables for build:

```css
--page-frame: 420px;
--column: 380px;
--hero-h: 540px;
--hero-fade-h: 245px;
--h1-body: 24px;
--stack: 22px;
--body-buttons: 44px;
--btn-gap: 15px;
--buttons-label: 50px;
--label-icons: 16px;
--icon: 40px;
--icon-gap: 16px;
--to-divider: 70px;
--divider-to-h1: 70px;
```

---

## Motion

| Layer | Behavior |
|-------|----------|
| Scroll reveals | **None** — `data-framer-appear-id` count = 0 |
| Page enter | None |
| Hero | Spline 3D loop — `my.spline.design/voiceinteractionanimation-…` |
| Hero fade | `linear-gradient(transparent → #fff)` over 245px |
| Icon row | Static at rest (`Stack Logos`; ticker layer exists in Framer but not required for clone) |
| Buttons | `transition: all` (Framer default; no dramatic hover) |
| Links | No custom motion detected |
| Scroll behavior | Native browser scroll |

**Clone rule:** Motion budget = Spline hero only. Do not add scroll animations unless audit detects them.

### Audit data (CDP measured)

| Check | Result |
|-------|--------|
| `data-framer-appear-id` | 0 |
| `@keyframes` in stylesheets | 2 (Framer internals) |
| Spline URL | `https://my.spline.design/voiceinteractionanimation-HUS75bKe034bgs2aR3N3AiML/?hideWatermark=true` |

**Do not implement:** scroll reveals, stagger, icon ticker, parallax.

**Optional:** `prefers-reduced-motion` → static hero poster instead of Spline.

---

## Components

### Hero
- Spline iframe 540px + fade overlay
- Headline block left-aligned in 380px column
- CTAs: primary `#222` radius 30px + layered shadow; secondary `#ebebeb` pill

### Integration row
- 7 icons × 40px, `justify-between` on 380px
- Order: ChatGPT, Cursor, Raycast, Figma, GitHub, Slack, Linear

### Section block
```
[content]
── dashed divider ──
70px
[h1]
24px
[body]
```

### Footer
- Split: credit left, social links right
- Same divider + 70px rhythm as sections

---

## Build checklist

- [ ] 420px dashed frame, 380px inner column
- [ ] Spacing tokens from **Fixed rhythm** table (not guessed `mt-[140px]`)
- [ ] Dashed dividers (not solid)
- [ ] 14px/700 buttons with exact shadow stack
- [ ] Spline hero + 245px fade
- [ ] No scroll-trigger animations
- [ ] Screenshot diff vs `./screenshots/`
