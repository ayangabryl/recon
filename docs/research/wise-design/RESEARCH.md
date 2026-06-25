# Wise Design — Research

**Source:** https://wise.design/  
**Scope:** Full landing (nav + carousel + footer)  
**Captured:** 2026-06-25 via cursor-ide-browser + CDP

---

## Verdict

Single-screen Figma Sites portfolio. No scroll sections — one infinite horizontal marquee of pill/circle image cards. Motion is **CSS marquee** on source (not GSAP); clone uses **GSAP** for smoother control + play/pause + progress sync. Highly cloneable for layout; images hotlink from `wise-design.figma.site` CDN.

**Fidelity estimate:** 85–90% desktop; mobile requires separate layout (not yet in clone).

---

## Responsive (Step 3i)

Read `screenshots/responsive/responsive.md` before any build prompt.

| Viewport | Figma breakpoint | Carousel | Chrome |
|----------|------------------|----------|--------|
| 375 mobile | `node-537_18296` | **Vertical** stack, cards ~124px wide | Logo only — **no toggle** |
| 800+ desktop | `node-537_18253` | **Horizontal** marquee | Logo + toggle + pause |

**Clone status:** `/wise` — desktop (marquee + intro) and mobile (vertical marquee) at 768px breakpoint.

---

## Stack (detected)

| Layer | Finding |
|-------|---------|
| Platform | Figma Sites (`wise-design.figma.site` assets) |
| Font | Inter Regular / Semi Bold |
| Motion (source) | CSS `@keyframes` marquee, `vertical-text-rotator-slide` |
| Motion (clone) | GSAP infinite `x` tween + `@gsap/react` |
| GSAP on source | No — Figma-native animation |
| Lenis on source | No |
| Intro (page load) | Card swipe reveals intro video → full marquee (see intro-sequence/) |
| **Responsive** | **Separate Figma trees:** 375 mobile (vertical stack) vs 800+ desktop (horizontal marquee) — see `screenshots/responsive/responsive.md` |
| Carousel (desktop) | Horizontal auto-scroll, pause button |
| Carousel (mobile) | Vertical stack, no toggle, variable card heights |

---

## Screenshots

| File | Section |
|------|---------|
| `00-hero-full.png` | Full viewport |
| `01-carousel.png` | Carousel row |
| `02-nav.png` | Logo + toggle + play |
| `03-footer.png` | Attribution + progress + links |
| `intro-sequence/` | Burst keyframes 0–5s + `intro-sequence.json` (page-load storyboard) |

---

## Intro sequence (page load)

**Engine:** Figma React + HTML `<video>` — not GSAP on source.

**Type:** `card-swipe-reveal-video` (from dense frame capture + HTML audit)

**Phases:**

| Phase | Timing | What happens |
|-------|--------|----------------|
| `empty` | 0ms | Chrome only |
| `hero-card` | ~660ms | Centered Wise **debit card** image (190×120, 14px radius) — separate asset, not carousel item |
| `swipe-reveal` | ~950–1200ms | Card **slides right**, intro **video** plays underneath in pill mask |
| `expand` | ~1300ms | Pill expands to full-width video strip (`_videos/v1/4c35455d…`) |
| `marquee-full` | ~1600ms | Carousel row appears, auto-scroll begins |

**Assets (from HTML):**
- Card: `_assets/v11/27f2af5f78714db52f8cd29a48b3146bfd534044.png`
- Video: `_videos/v1/4c35455d00070d26706956a8ce54aedef6d14a01`

**Do not assume** stagger opacity — read `intro-sequence/frames/` 990→1200ms for swipe.

---

## Clone strategy

- **Route:** `/wise` in `web/`
- **Images:** Hotlink `wise-design.figma.site/_assets/...` (document pattern, research use)
- **Shapes:** Parent `border-radius: 64px`, `overflow: hidden` — circles (120×120) and pills (96–213 × 120)
- **Toggle:** transitions-dev **tabs-sliding** for Inspiration / Direction pill
- **Carousel:** GSAP infinite horizontal loop, duplicated track, play/pause, progress bar synced
- **Skip:** Full Direction subsite content (toggle is visual + link stub)

**Build contract:** [DESIGN.md](./DESIGN.md)
