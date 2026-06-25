# Vocorize.com — Reference Research

**Source:** https://vocorize.com/  
**Captured:** 2026-06-25  
**Platform:** Framer (published Feb 19, 2026)  
**Purpose:** Validate URL → screenshot + token extraction → `DESIGN.md` workflow

---

## Verdict

**This workflow works well for vocorize.** ~85% of the design is typography, spacing, and copy structure — all extractable. The hero is a Spline 3D embed and must be substituted, not scraped.

| Layer | Auto-extractable | Notes |
|-------|------------------|-------|
| Typography | Yes | Instrument Serif + Inter |
| Colors | Yes | Monochrome + gray scale |
| Layout | Yes | 380px centered column |
| Section IA | Yes | 9 scroll sections |
| Components | Yes | Pill CTAs, lists, dividers, icon row |
| Hero visual | Partial | Spline iframe URL found |
| Motion | Yes | `DESIGN.md` § Motion — static body, Spline hero only |
| Spacing | Yes | `DESIGN.md` § Spacing — fixed rhythm + section gaps |

---

## Screenshots

| File | Section |
|------|---------|
| [00-full-page.png](./screenshots/00-full-page.png) | Full scroll capture |
| [01-hero.png](./screenshots/01-hero.png) | Spline orb + headline + CTAs + app icons |
| [02-hi.png](./screenshots/02-hi.png) | "hi :)" story block |
| [03-why.png](./screenshots/03-why.png) | why / who it's for |
| [04-how-specs.png](./screenshots/04-how-specs.png) | how it works / specs |
| [05-pricing-tldr.png](./screenshots/05-pricing-tldr.png) | pricing / tl;dr |
| [06-footer.png](./screenshots/06-footer.png) | made by tanvir + social links |

Use these as visual ground truth during build. Compare viewport screenshots section-by-section, not just the full-page capture.

---

## Technical findings

### Stack
- **Builder:** Framer 4ec240c
- **Hero:** Spline 3D iframe  
  `https://my.spline.design/voiceinteractionanimation-HUS75bKe034bgs2aR3N3AiML/?hideWatermark=true`
- **Fonts:** Instrument Serif (Google Fonts) + Inter (Framer CDN)
- **Page height:** ~4,380px desktop (1920px viewport)

### Motion

In **DESIGN.md § Motion** — no scroll reveals, Spline hero + 245px fade, static body.

### Spacing

In **DESIGN.md § Spacing** — 420/380px frame, fixed rhythm (70px divider gaps), content-driven section gaps.

### Layout (legacy notes)
- Content column: **380px** wide, centered (`x ≈ 762px` on 1920 viewport)
- No top nav — single scroll story
- Section gaps vary: **277–552px** (asymmetric, not a fixed spacing scale)
- Hairline dividers: **1px** rules spanning column width

### Typography (computed)
| Role | Font | Size | Weight | Color | Line-height |
|------|------|------|--------|-------|-------------|
| Section title | Instrument Serif | 42px | 400 | `#262626` | 46.2px |
| Body | Inter | 16px | 400 | `#515151` | 22.4px |
| Micro label | Inter | 12px | 400 | `#7e7e7e` | — |
| Footer links | Inter | 16px | 400 | `rgba(0,0,0,0.72)` | — |

**Voice:** all lowercase. Headings and body. Casual, indie, anti-startup tone.

### Components (computed)
| Component | Values |
|-----------|--------|
| Primary CTA | bg `#222`, radius `30px`, padding `15px`, font 12px, layered soft shadow |
| Secondary CTA | bg `#ebebeb`, radius `99px`, padding `15px`, no shadow |
| Micro label | uppercase, letter-spacing `0.48px` |
| Lists | Standard bullets; numbered list in "how it works" |

---

## Section map

1. **Hero** — Spline orb, "introducing vocorize", taglines, CTAs, app icon row
2. **hi :)** — personal manifesto paragraph
3. **why i built it** — narrative bullet block
4. **who it's for** — 5-item bullet list
5. **how it works** — 3-step numbered list
6. **what you need to know** — 7-item spec list
7. **pricing** — beta / lifetime copy
8. **tl;dr** — summary bullets
9. **made by tanvir** — split footer: credit left, social links right

---

## Clone strategy

### Match closely (from research)
- Instrument Serif + Inter pairing
- 380px column, generous vertical rhythm
- Lowercase voice, short line-based copy
- Black/gray pill buttons
- 1px section dividers
- No navigation chrome

### Substitute (don't scrape)
- **Hero orb:** embed same Spline scene, or use CSS gradient sphere + blur, or looped WebM
- **App icons:** use your own integrations, not their brand row
- **Copy:** write original content in the same tone

### Build fidelity estimate
- **Without hero craft:** ~75%
- **With Spline embed or good hero substitute:** ~85–90%
- **With screenshot diff loop:** ~90–95%

---

## Next step

See [DESIGN.md](./DESIGN.md) for all tokens (spacing, motion, components).
