---
name: recon
description: Recon any URL into a buildable design blueprint in the user's existing project — no web/ scaffold. Faithful mirror, original remix, or scout-only research. Respects existing DESIGN.md and repo layout. Captures browser screenshots, CDP tokens, spacing/motion/responsive audits. Output in docs/research/{slug}/. Triggers on "recon", "recon this site", "clone this site", "remix this design", "same vibe my copy", "research this URL", "match this design". Requires a real browser — not curl.
---

# Recon

Recon a live site into a screenshot-backed blueprint — then **mirror** it faithfully, **remix** it into something original, or **scout** and stop at docs.

Record the active mode at the top of `RESEARCH.md`: `mode: mirror | remix | scout`

**Do not** rely on `curl` HTML alone. Use a **real browser** — see [agents.md](./agents.md) for Cursor, Claude Code, Codex, and Playwright fallback.

## Install

```bash
npx skills add ayangabryl/recon --skill recon
```

## Project integration (read first)

Recon runs **inside the user's repo**. Never impose a template layout.

### Do not create `web/`

- **Never** scaffold `web/`, `clone/`, or a parallel app folder unless the user explicitly asks for a new project.
- **Never** assume the app lives at repo root — detect it first.

### Detect the user's project (before research or build)

Scan the workspace **before** writing code or choosing paths:

| Signal | Likely app root |
|--------|-----------------|
| `package.json` + `next.config.*` | Directory containing those files |
| `src/app/` or `app/` | Next.js App Router — build under that tree |
| `src/pages/` or `pages/` | Next.js Pages Router |
| `vite.config.*` + `src/` | Vite — components under `src/` |
| Monorepo (`apps/*`, `packages/*`) | Ask which app, or use the path the user names |

**Procedure:**

1. Find existing `package.json`, framework config, and where routes/pages live.
2. Use **that** directory for `npm run dev`, new routes, and components.
3. Match existing conventions: `src/` vs flat, `@/` aliases, CSS modules vs Tailwind, existing component folders.
4. Reuse existing primitives (Button, Tabs, layout shells) when building — do not duplicate a design system the project already has.

### Research output paths

Default research artifacts:

```
docs/research/{slug}/
```

If the user already uses a different docs layout (`design/`, `specs/`, `.cursor/docs/`), **follow their convention** and record the chosen path in `RESEARCH.md`.

Recon research files (`RESEARCH.md`, reference `DESIGN.md` for the **URL**) always live **under the research folder** — not at repo root — unless the user explicitly points elsewhere.

### Respect existing `DESIGN.md` (critical)

The user may already have a project-level `DESIGN.md` (repo root, `docs/`, `design/`). **That file is authoritative for their product.**

| File | Purpose | Overwrite? |
|------|---------|------------|
| User's `DESIGN.md` | Their product design system / brand | **Never overwrite** without explicit permission |
| `docs/research/{slug}/DESIGN.md` | Build spec **for the reference URL** | Create/update per recon run |

**Before writing any `DESIGN.md`:**

1. **Search** the repo: `DESIGN.md`, `design.md`, `docs/**/DESIGN.md`.
2. If a **user product** `DESIGN.md` exists:
   - **Read it fully** — colors, type, spacing, components are the build contract for *their* app.
   - Write reference research to `docs/research/{slug}/DESIGN.md` only.
   - In **remix** mode: merge reference patterns into implementation using the user's tokens from their `DESIGN.md`, not the reference site's brand.
   - In **mirror** mode: still keep reference spec in `docs/research/{slug}/` — implement the clone in an isolated route/section without replacing their design system doc.
3. If `docs/research/{slug}/DESIGN.md` **already exists** from a prior recon:
   - **Ask** before overwriting, or append a dated `## Recon update (YYYY-MM-DD)` section.
   - Preserve user edits inside that file.
4. If the user says "update my DESIGN.md" — **merge** reference findings as a new section (e.g. `## Reference: wise.design`) rather than replacing unrelated content.

### Build placement

- Add routes/pages in the **existing** app (`src/app/(marketing)/…`, `pages/…`, etc.).
- Add components next to existing ones (`components/`, `src/components/`, feature folders).
- Do **not** create a second Next app or duplicate `package.json` at repo root.

## Screenshot policy (default)

| User provides | Agent must use |
|---------------|----------------|
| **URL only** (no attached images) | **Agent browser screenshots** — mandatory |
| URL + attached reference images | User images + agent screenshots (agent fills gaps) |
| Existing `docs/research/{slug}/screenshots/` | Those files; re-capture only if stale or user asks |

When the user sends **no reference screenshot**, the agent is the photographer:

1. Navigate → reference URL
2. Screenshot → full page + one shot per major section
3. Copy PNGs into `docs/research/{slug}/screenshots/` on disk
4. **Gate:** do not write `DESIGN.md` or application code until ≥1 full-page + ≥3 section screenshots exist

Do **not** substitute: memory, HTML scrape, `curl`, or prose descriptions. Screenshots capture dashed rulers, icon rows, shadows.

**No browser MCP?** Run [scripts/capture.mjs](./scripts/capture.mjs) (Playwright), then continue with CDP scripts from [reference.md](./reference.md).

After build (**mirror** mode): navigate to localhost → compare to reference. **Remix** mode: taste-check against your goals, not pixel diff.

## Fidelity modes (pick on first prompt)

Ask if the user did not say. They can invoke explicitly:

> Recon **remix** https://wise.design — same carousel vibe, my SaaS brand

| Mode | User intent | Research | Build | Step 7 compare |
|------|-------------|----------|-------|----------------|
| **scout** | Learn the site | Full pipeline | **No code** | Skip |
| **mirror** | Faithful clone / match | Full pipeline | Match reference layout + chrome | **Required** — must pass |
| **remix** | Original product, reference **language** | Full + creative direction | Your copy, brand, assets | **Optional** — soft check only |

### scout

- Output `docs/research/{slug}/` only (`RESEARCH.md`, `DESIGN.md`, screenshots, audits)
- Do not write application code unless the user asks in a follow-up
- Default when user says "research", "audit", "what makes this site tick"

### mirror

- Treat reference screenshots as **ground truth**
- Run `compare.mjs` + `compare-responsive.mjs` when `gates.axisDiffers`
- Run `behavior-test.mjs` when interactions exist
- Ship only when compares pass (or user documents accepted gaps in `RESEARCH.md`)
- Default when user says "clone", "match", "one-shot", "same as"

### remix

- Extract **design language**: rhythm, type scale, motion patterns, IA, responsive behavior
- `RESEARCH.md` must include **Creative direction** — what to keep vs reinvent (see [reference.md](./reference.md))
- `DESIGN.md` must include **Substitutions** — your colors, fonts, copy, imagery; never pass off scraped logos as yours
- Implement **patterns** (marquee, hover expand, intro choreography) not **brand** (their logo, Docs link, proprietary copy)
- Step 7 compare scripts: **do not block** on `pass: false` — use for inspiration QA only
- Default when user says "same vibe", "inspired by", "like X but for my app", "original"

**Both remix and mirror** use the same research steps (responsive, intro, behaviors). Only build fidelity and verify gates change.

## Quick start

1. **Pick mode** → scout | mirror | remix (ask if unclear; default **scout** if only URL given)
2. Run research workflow → `docs/research/{slug}/`
3. If mirror or remix + user wants build → implement from `DESIGN.md`

## Output layout

```
docs/research/{slug}/
├── RESEARCH.md     # verdict, stack, findings, clone strategy
├── DESIGN.md       # single build contract: colors, type, spacing, motion, components
├── responsive.json # optional symlink — lives in screenshots/responsive/
├── responsive.md
└── screenshots/
    ├── 00-hero-full.png …
    └── responsive/     # Step 3i — mobile-375, tablet-800, desktop-1920
        ├── responsive.json
        ├── responsive.md
        └── *-viewport.png
```

**`DESIGN.md` is the only file agents need to build.** Spacing and motion are sections inside it — not separate files.

**Slug:** hostname without `www` (e.g. `example.com` → `example-com` or `example`).

## Research workflow

```
- [ ] Navigate to URL (see agents.md)
- [ ] Full-page screenshot
- [ ] Section viewport screenshots
- [ ] **Responsive audit — mobile + tablet + desktop (Step 3i)**
- [ ] Extract tokens via CDP / Runtime.evaluate
- [ ] Spacing audit (h1 positions, dividers, fixed rhythm)
- [ ] Motion audit (appear ids, keyframes, iframes, transitions)
- [ ] Detect non-CSS assets (Spline, video, Lottie)
- [ ] Map section IA
- [ ] Write RESEARCH.md + DESIGN.md
- [ ] Copy screenshots into workspace
```

### Step 1 — Open site

Use your agent's browser tool. Cursor: `browser_navigate` + `browser_lock`. Others: see [agents.md](./agents.md).

### Step 2 — Screenshots

1. **Full page:** `00-full-page.png` (`fullPage: true`)
2. **Sections:** scroll to each major `h1` / hero / footer → `01-hero.png`, `02-…`

Scroll via JS: `window.scrollTo(0, headingY - 120)`.

### Step 3i — Responsive / mobile design (required before build)

**Desktop-only research fails on Figma Sites and modern portfolios.** wise.design ships **two HTML breakpoint trees** (`data-breakpoint-id` 375 vs 800) — mobile is not “scaled desktop”.

| Desktop (1920) | Mobile (375) |
|----------------|--------------|
| Horizontal marquee | **Vertical** card stack |
| Inspiration/Direction toggle | **No toggle** |
| Cards 96–213 × 120px | Cards ~124px wide, **variable height** |
| Logo in header bar | Logo 40×40 at (16, 18) |

**Procedure:**

1. Run: `node skills/recon/scripts/responsive-audit.mjs <url> docs/research/{slug}/screenshots/responsive`
2. Read **`responsive.md`** first — know mobile vs desktop before writing code
3. Screenshot gate: need **mobile-375** + **desktop-1920** PNGs minimum
4. Record in `DESIGN.md` **Responsive** section:
   - Breakpoints (px) and what changes (axis, chrome, typography, hidden elements)
   - Figma `data-breakpoint` ids if present
   - Build approach: separate route/component vs CSS reflow vs `matchMedia`
5. Re-run intro/behavior audits **per viewport** when motion or interactions differ on mobile

**Detection in `responsive.json`:**

| Field | Meaning |
|-------|---------|
| `carousel.axis` | `horizontal` or `vertical` |
| `chrome.hasToggle` | Segmented control present |
| `figmaBreakpoints` | Which Figma tree is visible |
| `gates.axisDiffers` | **Must implement both layouts** |

**Build rule:** If `gates.axisDiffers: true`, do not clone desktop marquee only. Mobile gets its own layout spec from `responsive.md`. **After build, run `compare-responsive.mjs` — research screenshots alone do not verify the clone.**

**Playwright:** `node skills/recon/scripts/responsive-audit.mjs <url> <out-dir>`

### Step 3 — Token extraction (CDP)

Run `Runtime.evaluate` with `returnByValue: true`. Script: [reference.md](./reference.md).

Extract fonts, colors, type scale, layout widths, buttons, section map, iframes, motion hints, platform, icons (SVG/img vs emoji via `innerHTML`).

### Step 3b — Spacing audit

Measure via CDP → write **Spacing** section in `DESIGN.md`. Script: [reference.md](./reference.md).

**Rule:** Separate **fixed rhythm** (repeatable px) from **section gaps** (content-driven). Never guess `mt-[140px]`.

### Step 3c — Motion audit

Measure motion via CDP → write **Motion** section in `DESIGN.md`.

**Rule:** Only implement motion the audit finds.

Map each pattern to CSS snippets in [reference.md](./reference.md) (Motion CSS snippets section):

| UI pattern | Snippet class |
|------------|---------------|
| Text changes in place (rotating keyword, status) | **text-states-swap** (`.t-text-swap`) |
| Segmented control / filter pills / view toggle | **tabs-sliding** (`.t-tabs`) |
| Dropdown from trigger | **menu-dropdown** |
| Modal dialog | **modal** |
| Number updates | **number-pop-in** |
| Icon toggles | **icon-swap** |
| Stacked hero lines entering | **texts-reveal** |
| Loading / streaming label | **shimmer-text** |
| Hover hint bubble | **tooltip** |
| Marquee / carousel / GSAP timeline | Document in DESIGN.md; use GSAP or CSS animation |
| No clear match | Note in DESIGN.md; ask before guessing |

**Build procedure (when motion exists):**

1. Copy relevant tokens + snippet CSS into the user's project (from reference.md).
2. Paste CSS **verbatim** — do not collapse to `transition: all`.
3. Wire documented hooks (`.t-text-swap`, `.t-tabs`, `aria-selected`, …).
4. Add JS orchestration only when the pattern requires it.
5. **Keep every `prefers-reduced-motion` guard.**

### Step 3d — Motion choreography capture (timing)

**Screenshots alone cannot capture choreography.** When motion matters (marquees, GSAP timelines, scroll scenes), run a **time-series sample** before writing `DESIGN.md`.

**Motion type gate (required):** Before assuming auto-scroll, classify what the reference actually does:

| Type | How to verify | Do not assume from |
|------|---------------|-------------------|
| **Auto marquee** | Element `x` changes over 3s with no input; pause/play stops it | Progress bar alone |
| **Drag / swipe** | Position changes only while pointer down / touch active | Horizontal layout |
| **Scroll-linked** | Transform tied to `scrollY` / ScrollTrigger | Full-width row of cards |
| **Static** | No transform change over 5s sample | Carousel-looking layout |

Sample twice: seconds 0–3 and 3–6 (discard first second if page is still settling). If delta ≈ 0 with no interaction → **not** auto-scroll.

**wise.design (verified):** CSS infinite marquee ~**60px/s** linear; `pause-carousel` stops it; progress thumb tracks position. Clone uses GSAP equivalent — correct behavior, wrong to guess before sampling.

**Three capture modes** (use all that apply):

| Mode | When | Output |
|------|------|--------|
| **A. Transform sampling** | Any moving element (carousel, hero) | `motion-samples.json` — position every 200ms |
| **B. GSAP introspection** | `window.gsap` exists | Tween duration, ease, delay from live timelines |
| **C. CSS keyframe parse** | `@keyframes` in stylesheets | duration, easing, from/to values |

**Procedure:**

1. Identify the moving element (carousel img, hero track, pinned section).
2. Run the choreography script from [reference.md](./reference.md) via CDP (`awaitPromise: true`, ~5s sample).
3. Save result to `docs/research/{slug}/motion-samples.json`.
4. Optionally capture **burst screenshots** at 0s / 1s / 2s → `screenshots/motion-*.png` for visual diff.
5. Derive build tokens in `DESIGN.md` **Motion** section:

| Derived token | How |
|---------------|-----|
| `scroll-px-per-second` | `median(deltaX) / sampleIntervalMs * 1000` |
| `loop-duration` | `trackWidth / pxPerSecond` |
| `easing` | constant delta → `none` / linear; GSAP → copy `ease` string |
| `gsap-duration` | from introspection, not guessed |

**GSAP sites:** prefer Mode B — read `gsap.globalTimeline` children when accessible. If minified/bundled and Mode B fails, fall back to Mode A.

**Not GSAP:** wise.design uses CSS/JS transforms (~60px/s linear marquee). Do not assume GSAP — measure first.

**Playwright fallback:** `node skills/recon/scripts/motion-sample.mjs <url> <out.json>`

**Lenis detection:** `window.Lenis` / `window.lenis`, `[data-lenis-prevent]`, `html.lenis`. Record in `motion-samples.json` → `lenis: true|false`. Clone only if reference uses it.

Record choreography tokens in `DESIGN.md` — do not guess `duration: 50` without samples.

### Step 3h — Intro / page-load sequence (required on first paint)

**Most skills fail here:** `networkidle` waits until the intro is **already over**. A single screenshot captures the **end state only**. Sparse checkpoints (250ms → 1000ms → 3500ms) **skip the animation** — you see empty, then jump to final.

**wise.design intro (verified):** NOT GSAP, NOT Lenis. Figma React — **empty chrome → single centered card → full marquee** over ~3.5s. Opacity on DOM nodes stays `1`; detection must use **visible pixel area in viewport band**, not `opacity: 0` counts.

**Capture without screen recording** (AI cannot watch video — use a **dense flipbook**):

| Artifact | Purpose |
|----------|---------|
| `intro-sequence/frames/` | **Dense** burst PNGs — 33ms steps 0–1s, 50ms 1–2.5s, 100ms 2.5–5s (~70–90 frames) |
| `intro-sequence/keyframes/` | **Phase-change only** — empty → hero-focus → marquee-building → marquee-full |
| `intro-sequence/storyboard.md` | Ordered keyframes with descriptions — **read this first** |
| `intro-sequence/intro-sequence.json` | Per-ms: phase, visibleArea, spreadWidth, largestW |

**Procedure:**

1. Navigate with `waitUntil: 'commit'` — **not** `networkidle`
2. Run: `node skills/recon/scripts/intro-sequence.mjs <url> docs/research/{slug}/intro-sequence`
3. Read **`storyboard.md`** then **`keyframes/`** in time order — not 3 sparse PNGs
4. If gaps still too coarse, re-run without `--sparse` (default is dense)
5. Detect engine:

| Engine | Detection |
|--------|-----------|
| GSAP | `window.gsap` + `globalTimeline` children |
| Lenis | `window.Lenis`, `data-lenis-prevent` |
| CSS | `@keyframes` in stylesheets |
| React/Figma | phase: `hero-focus` → `marquee-full`, no global gsap |

6. Audit HTML for hidden duplicate views (`data-breakpoint`)
7. Write `DESIGN.md` **Intro** section from `storyboard.md` keyframes

**Intro detection gate (must pass):**
- `intro.type` ≠ `none`
- `keyframes.length` ≥ 2
- `phasesSeen` includes transition (e.g. `empty` → `hero-focus` → `marquee-full`)

**Build rule:** If `keyframes/` shows staged reveal, clone must implement intro — not mount final layout immediately.

### Step 3e — Interaction / behavior capture

**Static screenshots miss hover, focus, expand, pause, and drag behaviors.** After motion sampling, audit interactions before build.

**Procedure:**

1. List interactive elements from snapshot + CDP (`button`, `[data-asset-*]`, `aria-label`, toggles).
2. Run **behavior probe** — hover/focus each major control, record before/after:
   - dimensions, `data-*` state flags, opacity, child panels revealed
3. Save `docs/research/{slug}/behaviors.json`
4. Screenshot **each interaction state** → `screenshots/behavior-hover.png`, `behavior-focus.png`, etc.
5. Write `DESIGN.md` **Behaviors** section (required when interactions exist)

| Probe | How |
|-------|-----|
| Hover expand | `mouseenter` on carousel card → measure media `width/height/radius` |
| Pause on hover | Check CSS `:hover { animation-play-state }` or JS pause |
| Toggle / tab | Click → screenshot active vs inactive |
| Focus metadata | DOM nodes revealed on hover (title, description, tags) |
| **Hover layout tokens** | While hovered: measure title col width, desc font/color, tag placement — save `hover-layout.json` |
| Data attributes | `data-asset-title`, `data-asset-description`, `data-asset-active` |

**Hover layout gate:** A behavior screenshot is not enough. On active/hover state, CDP-measure:
- Title vs description **column widths** (wise.design: 80px title + flex desc — not 50/50 grid)
- Tag row **alignment** (under description column, not full width)
- Meta **offset** from expanded media (gap, horizontal padding)
- Typography per role (title **12px/600**, desc 12px/#666, tags 10px on **#f0f0f0** fill — not bordered)
- **Flex cross-axis:** `align-items: center`; active shell height grows, neighbors stay short — shared vertical center (measure card `y` + `height` for active vs inactive)
- **Expand origin:** media grows from center (`top: 50%`), not top-anchored

**Build rule:** Do not default to `grid-cols-2` for hover metadata without measuring column asymmetry. Do not wrap cards in extra divs that break flex alignment.

**CDP behavior script:** [reference.md](./reference.md) — `behaviorProbe()`

**Playwright:** `node skills/recon/scripts/behavior-audit.mjs <url> behaviors.json`

**Build rule:** If `behaviors.json` documents hover-expand, implement it (GSAP or CSS). Do not ship scroll-only when reference pauses/expands on hover.

### Step 3f — UI chrome capture (logo, icon buttons, progress)

**Screenshots miss exact chrome.** Extract measured specs for header/footer controls:

| Control | Capture |
|---------|---------|
| Logo | `img` src + mask SVG, container `width/height`, `border-radius`, padding |
| Icon buttons | `outerHTML` of `<svg>` per state (play vs pause) — do not guess bars/triangles |
| Progress bar | Track `width/height/bg`, thumb `width/bg`, scroll sync behavior |
| Toggle pill | Active/inactive text colors, pill bg, track bg |

Save `docs/research/{slug}/ui-chrome.json`. Record in `DESIGN.md` **Components** with exact px + colors.

**CDP:** extract `aria-label="pause-carousel"` SVG, `[aria-label="line"]` dimensions, logo link structure.

**Build rule:** Never substitute a generic bordered circle for a captured SVG button. Never use wrong logo asset (pattern PNG without mask = broken logo).

### Step 3g — Cycling micro-copy (footer rotators, tickers)

**Static text in screenshots lies.** Some labels animate or rotate languages.

**Detect:**
1. CDP: watch footer/header text for **3–8s** — collect all unique strings
2. Look for `.vertical-text-rotator`, `[class*="rotator"]`, `aria-live="polite"`, marquee text
3. Record `@keyframes` or JS interval timing
4. Save strings + interval in `behaviors.json` → `cyclingCopy`

**Build rule:** If reference cycles ≥2 attribution strings, clone must cycle the same lines (research use — paraphrase OK for proprietary sites, but **behavior** must match).

### Step 4 — Flag non-scrapeable assets

| Asset type | Action |
|------------|--------|
| Spline iframe | Record URL; embed or substitute |
| Video / Lottie | Record src; loop or poster |
| Framer/Webflow | Note builder; JS-hydrated layout |
| Brand logos / copy | Document pattern only — don't scrape literally |

### Step 5 — Write docs

Templates: [reference.md](./reference.md).

**Write to `docs/research/{slug}/` only** — not the user's root `DESIGN.md` unless they explicitly ask to merge.

- **`RESEARCH.md`** — verdict, findings, creative direction (remix), link to research `DESIGN.md`
- **`docs/research/{slug}/DESIGN.md`** — reference build spec: Summary, Colors, Typography, Spacing, Motion, **Behaviors**, Components, Build checklist

If the user has an existing product `DESIGN.md`, add a line in `RESEARCH.md`:

```markdown
## User design system
See [../../DESIGN.md](../../DESIGN.md) — remix builds must use these tokens.
```

(Adjust relative path to wherever their file lives.)

### Step 6 — Release browser session

Unlock / close browser when multi-step capture is done.

### Step 7 — Compare to original (**mirror mode** — required before "done")

**Skip blocking compare in remix mode** (optional soft run). **Skip entirely in scout mode.**

**Static research is not enough — verify the mirror against the live reference.**

**Desktop compare:**
1. Run dev server for the clone route
2. `node skills/recon/scripts/compare.mjs <ref> <clone> docs/research/{slug}/compare`
3. Screenshot review at 1920×1080 — card density, toggle, footer, hover states

**Responsive compare (required when `responsive.json` → `gates.axisDiffers: true`):**
1. `node skills/recon/scripts/compare-responsive.mjs <ref> <clone> docs/research/{slug}/compare-responsive`
2. Must pass **both** mobile-375 and desktop-1920 checks
3. Review `reference-mobile-375.png` vs `clone-mobile-375.png` — **header chrome is not optional**

| Mobile gate | What must match |
|-------------|-----------------|
| `mobile-carousel-axis` | `vertical` on clone |
| `mobile-icon-toggle` | Globe + Direction icon buttons (40×40), not text toggle |
| `mobile-docs-link` | Docs pill → `docs.wise.design` |
| `mobile-logo-size` | 40×40 @ ~(16, 18) |

**Do not mark mobile "done" after desktop compare only.** Screenshotting mobile in Step 3i is research — Step 7 proves the clone matches.

5. Re-run compares after fixes — do not mark done on first pass if metrics fail

**Behavior regression test:** `node skills/recon/scripts/behavior-test.mjs <ref> <clone> <out.json>`

Tests: chrome sizes, hover expand, **footer text rotator** (≥2 strings), **rapid-hover stress** (no stuck expanded cards). Required when site has carousel or cycling copy.

**Playwright:** `compare.mjs` (desktop) + `compare-responsive.mjs` (mobile + desktop gates)

**Heuristic fail signals:**
| Delta | Likely bug |
|-------|------------|
| `visibleCards` clone ≪ reference | Cards reserve hover width when collapsed |
| `avgCardWidth` clone ≫ reference | Same — 480px shells in flex row |
| Toggle colors wrong | Inactive tab same color as track |
| Missing meta on hover | Step 3e behaviors not implemented |
| Footer text never changes | Step 3g cycling copy missed |
| Hover glitches when moving fast | No `killTweensOf` / single active card / rapid-hover test |

**Build rule (mirror):** Ship only when compare screenshots are visually acceptable AND `compare.json` `pass: true` (or user explicitly accepts known gaps in `RESEARCH.md`).

**Build rule (remix):** Ship when your product meets the **Creative direction** in `RESEARCH.md` — not when pixels match the reference.

## Build workflow (when requested — mirror or remix)

1. **Detect project** — app root, framework, existing `DESIGN.md`, component conventions (see Project integration)
2. Confirm mode in `docs/research/{slug}/RESEARCH.md` (`mirror` or `remix`)
3. Read `docs/research/{slug}/DESIGN.md` + screenshots; **also read user's `DESIGN.md`** if present
4. **Remix:** implement reference **patterns** using **user** tokens from their `DESIGN.md`
5. **Mirror:** match reference layout in an existing route — spec stays in `docs/research/{slug}/`
6. Use **fixed rhythm tokens** from the appropriate spec; let section height vary naturally
7. Build section-by-section in the **existing** app tree — no new `web/` folder
8. Motion via CSS/GSAP snippets (Step 3c) — colocate styles with project's CSS approach
9. **Icons & emoji:** CDP-check each slot. Use emoji **only** when reference `innerHTML` contains emoji
10. **Mirror only:** Step 7 compare gates — fix until pass (use user's dev server URL/port)
11. **Remix:** optional compare for QA

**Stack:** Use whatever the repo already uses (Next, Vite, Remix, etc.). Do not introduce a new framework folder.

## Fidelity expectations

| Site type | Estimate |
|-----------|----------|
| Typography-heavy / Framer landing | 80–90% |
| Hand-coded React/Tailwind | 90–95% |
| Heavy 3D / WebGL hero | 60–75% without hero substitute |

## Rules

- **No user screenshot → agent browser screenshot** (non-negotiable)
- **Research before code** unless user explicitly skips
- **Screenshots are ground truth**
- **Never** commit scraped proprietary assets as your own
- **Never create `web/`** or a parallel app unless the user asks
- **Respect existing project layout** — detect app root, routes, and components before building
- **Never overwrite the user's product `DESIGN.md`** — research spec lives in `docs/research/{slug}/`
- **Overwrite guard:** ask before overwriting existing `docs/research/{slug}/` or any file the user may have edited

## Additional resources

- [agents.md](./agents.md) — browser tools per agent
- [reference.md](./reference.md) — CDP scripts, templates, motion CSS
