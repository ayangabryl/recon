# Recon — Examples

## Example 1: wise.design (carousel + behaviors)

**Input:** `https://wise.design/` — full landing

**Output:** `docs/research/wise-design/`

| File | Purpose |
|------|---------|
| `RESEARCH.md` | Verdict, stack, section map, clone strategy |
| `DESIGN.md` | Colors, type, spacing, motion, components |
| `screenshots/` | Agent-captured reference shots |
| `responsive/` | mobile-375, tablet-800, desktop-1920 |
| `intro-sequence/` | Dense burst frames + storyboard |

**Key learnings:**
- Static screenshots **miss** hover-expand — run Step 3e behavior probe
- Intro is **card swipe → video → expand → marquee**, not stagger fade-in
- Carousel cards: 120→480px expand, radius 64→48px, metadata panel on hover
- Mobile is a **separate layout** (vertical stack, icon header) — not scaled desktop
- Carousel **pauses** on card hover (`animation-play-state` on source)
- Scroll is CSS marquee ~60px/s linear (not GSAP on source); clone uses GSAP

**Artifacts:** `behaviors.json`, `compare-responsive/`, DESIGN.md **Behaviors** section

**Build:** `web/src/app/wise/` — GSAP marquee + hover expand + pause + intro swipe

## Example 2: vocorize.com (optional — own product)

**Input:** `https://vocorize.com/`

**Output:** `docs/research/vocorize/`

**Key learnings:**
- Hero is a **Spline iframe** — document URL, don't scrape
- 380px centered column, dashed frame dividers
- Static body — no scroll reveals
- Good **remix** case: same rhythm, your copy

## Example prompts

**Scout (research only):**
> Recon scout https://wise.design/ — screenshots + DESIGN.md

**Mirror (faithful clone):**
> Recon mirror https://wise.design — one-shot, compare gates

**Remix (same vibe, your brand):**
> Recon remix https://wise.design — carousel language, my SaaS copy

**Skill invoke:**
> Use recon on https://example.com

## Install (any agent)

```bash
npx skills add ayangabryl/recon --skill recon
```

## What good output looks like

- User sent no images → agent captured all reference shots via browser
- ≥1 full-page + ≥3 section screenshots before `DESIGN.md`
- `DESIGN.md` has measured tokens, not guesses
- `behaviors.json` + behavior screenshots when site has hover/focus/expand
- `compare/` folder with reference + clone screenshots and `compare.json` pass (**mirror** mode)
- Motion uses CSS/GSAP snippets with reduced-motion guards
- Fidelity estimate is honest
