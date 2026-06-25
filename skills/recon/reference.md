# Recon — Templates & CDP snippets

## Project guard (before any file write)

```
1. SCAN repo for package.json, app root, existing DESIGN.md (any path)
2. NEVER create web/, clone/, or duplicate package.json
3. User DESIGN.md → read-only unless user says "merge" or "overwrite"
4. Reference spec → docs/research/{slug}/DESIGN.md only
5. IF docs/research/{slug}/ exists with user edits → ASK before overwrite
```

## Screenshot gate (run before DESIGN.md or build)

```
IF user attached reference images:
  save to docs/research/{slug}/screenshots/ (or note paths)
ELSE IF docs/research/{slug}/screenshots/ is empty:
  MUST run browser capture — do not proceed
ENDIF

Minimum capture set:
  - 00-full-page.png   (fullPage: true)
  - 01-hero.png        (viewport)
  - 02+ section shots  (scroll to each h1, screenshot)
  - responsive/        (Step 3i — mobile-375, tablet-800, desktop-1920)
  - copy all PNGs into workspace screenshots/

Responsive gate (before DESIGN.md or build):
  node skills/recon/scripts/responsive-audit.mjs <url> docs/research/{slug}/screenshots/responsive
  - read responsive.md — mobile layout is NOT optional for Figma Sites
  - gates.axisDiffers: true → implement both layouts

Post-build (**mirror mode** — required):
  - navigate reference URL + localhost clone (same viewport)
  - screenshot both → docs/research/{slug}/compare/
  - run: node skills/recon/scripts/compare.mjs <ref> <clone> <compare-dir>
  - read compare.json — fix if pass: false
  - visual side-by-side review before marking done

Post-build (**remix mode** — optional):
  - same scripts allowed for inspiration QA — do not block on pass: false
```

**Browser tools:** See [agents.md](./agents.md). Cursor: `cursor-ide-browser`. Fallback: [scripts/capture.mjs](./scripts/capture.mjs).

Not curl. Not guessed from HTML.

## CDP extraction script

Paste into `Runtime.evaluate` (`returnByValue: true`). Works in any Chromium CDP context.

```javascript
(() => {
  const style = (el) => {
    const s = getComputedStyle(el);
    return {
      font: s.fontFamily,
      size: s.fontSize,
      weight: s.fontWeight,
      color: s.color,
      lh: s.lineHeight,
      ls: s.letterSpacing,
      tt: s.textTransform,
      bg: s.backgroundColor,
      radius: s.borderRadius,
      padding: s.padding,
      shadow: s.boxShadow,
    };
  };
  const headings = [...document.querySelectorAll("h1, h2")].map((h) => ({
    tag: h.tagName,
    text: h.innerText.trim().slice(0, 80),
    y: Math.round(h.getBoundingClientRect().top + window.scrollY),
    w: h.offsetWidth,
    ...style(h),
  }));
  const buttons = [...document.querySelectorAll("a, button")]
    .filter((el) => el.innerText.trim() && el.offsetHeight >= 28 && el.offsetHeight <= 80)
    .slice(0, 8)
    .map((el) => ({ text: el.innerText.trim(), ...style(el) }));
  const body = document.querySelector("p");
  return JSON.stringify({
    title: document.title,
    url: location.href,
    pageH: document.documentElement.scrollHeight,
    viewport: { w: innerWidth, h: innerHeight },
    body: document.body ? style(document.body) : null,
    bodySample: body ? style(body) : null,
    headings,
    buttons,
    iframes: [...document.querySelectorAll("iframe")].map((f) => f.src),
    appearCount: document.querySelectorAll("[data-framer-appear-id]").length,
    generator: document.querySelector('meta[name="generator"]')?.content ?? null,
  });
})()
```

## Icon / emoji check (per button or nav slot)

```javascript
(() => {
  const pro = [...document.querySelectorAll("button, a")].find((el) =>
    /pro/i.test(el.innerText)
  );
  if (!pro) return "not found";
  return JSON.stringify({
    innerHTML: pro.innerHTML.slice(0, 200),
    hasSvg: !!pro.querySelector("svg"),
    hasImg: !!pro.querySelector("img"),
    hasEmoji: /\p{Extended_Pictographic}/u.test(pro.innerHTML),
  });
})()
```

## Section scroll positions

```javascript
JSON.stringify(
  [...document.querySelectorAll("h1")].map((h, i) => ({
    i,
    text: h.innerText.trim(),
    y: Math.round(h.getBoundingClientRect().top + window.scrollY - 120),
  }))
)
```

## RESEARCH.md template

```markdown
# {Site Name} — Reference Research

**Mode:** mirror | remix | scout
**Source:** {url}
**Captured:** {YYYY-MM-DD}
**Platform:** {Framer | Webflow | React | unknown}

---

## Verdict

{One paragraph: fidelity estimate for mirror, or creative opportunity for remix.}

| Layer | Auto-extractable | Notes |
|-------|------------------|-------|
| Typography | | |
| Colors | | |
| Layout | | |
| Motion | | In DESIGN.md |
| Spacing | | In DESIGN.md |
| Responsive | | See responsive.md |

---

## Screenshots

| File | Section |
|------|---------|
| [00-full-page.png](./screenshots/00-full-page.png) | Full scroll |
| [01-hero.png](./screenshots/01-hero.png) | Hero |

---

## Clone strategy

### Match closely (mirror — or remix: keep as language)
-

### Substitute — don't scrape (remix: your brand)
-

## Creative direction (remix mode)

**Keep from reference:**
- {motion patterns, IA, rhythm, responsive behavior}

**Reinvent:**
- {brand, copy, imagery, product name, CTAs}

**Your product context:**
- {what you're building, audience}

---

## Next step

See [DESIGN.md](./DESIGN.md).
```

## Spacing audit script

```javascript
(() => {
  const hs = [...document.querySelectorAll("h1")].map((h) => ({
    text: h.innerText.trim(),
    y: Math.round(h.getBoundingClientRect().top + window.scrollY),
    h: h.offsetHeight,
    w: h.offsetWidth,
  }));
  const gaps = hs.slice(1).map((h, i) => ({
    from: hs[i].text,
    to: h.text,
    px: h.y - (hs[i].y + hs[i].h),
  }));
  const h1 = document.querySelector("h1");
  const p = document.querySelector("p");
  return JSON.stringify({
    pageH: document.documentElement.scrollHeight,
    h1body:
      h1 && p
        ? Math.round(
            p.getBoundingClientRect().top +
              window.scrollY -
              (h1.getBoundingClientRect().top + window.scrollY + h1.offsetHeight)
          )
        : null,
    gaps,
  });
})()
```

## Motion audit script

```javascript
(() => {
  let keyframes = 0;
  try {
    [...document.styleSheets].forEach((ss) => {
      try {
        [...ss.cssRules].forEach((r) => {
          if (r.type === 7 || r.cssText?.includes("@keyframes")) keyframes++;
        });
      } catch (e) {}
    });
  } catch (e) {}
  return JSON.stringify({
    appearCount: document.querySelectorAll("[data-framer-appear-id]").length,
    keyframes,
    iframes: [...document.querySelectorAll("iframe")].map((f) => f.src),
    anims: [...document.querySelectorAll("*")]
      .filter((el) => getComputedStyle(el).animationName !== "none")
      .slice(0, 8)
      .map((el) => ({
        anim: getComputedStyle(el).animationName,
        text: el.innerText?.slice(0, 20),
      })),
  });
})()
```

## DESIGN.md template

```markdown
# {Name} — Design spec

**Mode:** mirror | remix | scout
**Source:** {url}
**Screenshots:** `./screenshots/`

## Summary

## Substitutions (remix mode)

| Reference | Your product |
|-----------|--------------|
| Logo / wordmark | |
| Primary CTA copy | |
| Color palette | |
| Hero imagery | |
| Product name | |

## Colors
| Token | Value | Use |

## Typography
| Role | Font | Size | Weight | Line-height |

## Spacing
### Layout | Fixed rhythm | Section gaps | Audit data

## Motion
| Layer | Behavior | CSS / GSAP |

### Choreography (sampled)
| Token | Value | Source |
|-------|-------|--------|
| scroll-px-per-second | | motion-samples.json |
| loop-duration | | calculated |
| easing | | gsap / constant delta |

### Motion snippets
| Pattern | Snippet | Hooks |

## Components

## Build checklist
```

One file only. No separate SPACING.md or MOTION.md.

## Motion CSS snippets

Copy into the user's project CSS. Tune tokens per `DESIGN.md`.

```css
:root {
  --text-swap-dur: 150ms;
  --text-swap-translate-y: 4px;
  --text-swap-blur: 2px;
  --text-swap-ease: ease-in-out;
  --tabs-dur: 250ms;
  --tabs-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --tabs-text-muted: rgba(15, 15, 15, 0.8);
  --tabs-text-active: #0f0f0f;
  --tabs-bar-bg: #f1f1f1;
  --tabs-pill-bg: #ffffff;
}

.t-text-swap {
  display: inline-block;
  transform: translateY(0);
  filter: blur(0);
  opacity: 1;
  transition:
    transform var(--text-swap-dur) var(--text-swap-ease),
    filter var(--text-swap-dur) var(--text-swap-ease),
    opacity var(--text-swap-dur) var(--text-swap-ease);
}

.t-text-swap.is-exit {
  transform: translateY(calc(var(--text-swap-translate-y) * -1));
  filter: blur(var(--text-swap-blur));
  opacity: 0;
}

.t-tabs {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px;
  border-radius: 48px;
  background: var(--tabs-bar-bg);
}

.t-tab {
  position: relative;
  appearance: none;
  border: 0;
  background: transparent;
  height: 30px;
  padding: 4px 12px;
  color: var(--tabs-text-muted);
  cursor: pointer;
  border-radius: 48px;
  z-index: 1;
  transition: color var(--tabs-dur) var(--tabs-ease);
}

.t-tabs-pill {
  position: absolute;
  top: 3px;
  left: 0;
  height: 30px;
  width: 0;
  background: var(--tabs-pill-bg);
  border-radius: 48px;
  transform: translateX(0);
  transition:
    transform var(--tabs-dur) var(--tabs-ease),
    width var(--tabs-dur) var(--tabs-ease);
  z-index: 0;
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .t-text-swap,
  .t-tabs-pill,
  .t-tab {
    transition: none !important;
  }
}
```

Wire tabs with `.t-tabs`, `.t-tab`, `.t-tabs-pill`, and `aria-selected` on buttons (see Step 3c in SKILL.md).

## Playwright fallback

```bash
node skills/recon/scripts/capture.mjs https://example.com docs/research/example/screenshots
```

Requires: `npm install playwright && npx playwright install chromium`

## Motion choreography script

Run via CDP `Runtime.evaluate` with **`awaitPromise: true`** (samples ~5 seconds):

```javascript
(async () => {
  const img = [...document.querySelectorAll("img,video,div")]
    .find((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 80 && r.height > 40 && r.y > 100 && r.y < innerHeight - 100;
    });

  const gsapInfo =
    typeof window.gsap !== "undefined"
      ? {
          version: gsap.version,
          children: gsap.globalTimeline
            .getChildren(true, true, false)
            .slice(0, 20)
            .map((t) => ({
              duration: t.duration?.(),
              delay: t.delay?.(),
              ease: t.vars?.ease,
              x: t.vars?.x,
              y: t.vars?.y,
              opacity: t.vars?.opacity,
            })),
        }
      : null;

  const keyframes = [];
  try {
    [...document.styleSheets].forEach((ss) => {
      try {
        [...ss.cssRules].forEach((rule) => {
          if (rule.cssText?.includes("@keyframes"))
            keyframes.push(rule.cssText.slice(0, 300));
        });
      } catch (e) {}
    });
  } catch (e) {}

  const intervalMs = 200;
  const samples = [];
  let prevX = img?.getBoundingClientRect().x;

  for (let i = 0; i < 25; i++) {
    await new Promise((r) => setTimeout(r, intervalMs));
    const x = img?.getBoundingClientRect().x;
    const y = img?.getBoundingClientRect().y;
    const transform = img ? getComputedStyle(img).transform : null;
    samples.push({
      ms: i * intervalMs,
      x: x != null ? Math.round(x) : null,
      y: y != null ? Math.round(y) : null,
      deltaX: prevX != null && x != null ? Math.round(x - prevX) : null,
      transform: transform?.slice(0, 80),
    });
    prevX = x;
  }

  const deltas = samples.map((s) => s.deltaX).filter((d) => d != null && d !== 0);
  const medianDelta =
    deltas.length > 0
      ? deltas.sort((a, b) => a - b)[Math.floor(deltas.length / 2)]
      : 0;
  const pxPerSecond = (medianDelta / intervalMs) * 1000;

  return JSON.stringify({
    gsapInfo,
    keyframes,
    pxPerSecond: Math.round(pxPerSecond * 10) / 10,
    inferredEasing: deltas.every((d) => Math.abs(d - medianDelta) <= 2)
      ? "linear"
      : "unknown",
    samples,
    target: img ? { tag: img.tagName, class: img.className?.toString?.().slice(0, 60) } : null,
  });
})()
```

Save JSON to `docs/research/{slug}/motion-samples.json`. Copy derived tokens into `DESIGN.md` Motion → Choreography table.

### Burst screenshots (optional)

Capture viewport shots at 0ms, 1000ms, 2000ms while animation runs → `screenshots/motion-00.png`, `motion-10.png`, `motion-20.png`. Helps verify loop phase and stagger.

## Behavior capture script

Run via CDP with **`awaitPromise: true`**. Hover a visible interactive target, compare before/after:

```javascript
(async () => {
  const cards = [...document.querySelectorAll("[data-asset-index]")];
  const center = innerWidth / 2;
  const target = cards.reduce((best, c) => {
    const r = c.getBoundingClientRect();
    const dist = Math.abs(r.x + r.width / 2 - center);
    if (r.width < 40 || r.x < 0 || r.x > innerWidth) return best;
    return !best || dist < best.dist ? { c, dist } : best;
  }, null)?.c;

  if (!target) return JSON.stringify({ error: "no visible card" });

  const read = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return {
      w: Math.round(r.width),
      h: Math.round(r.height),
      radius: s.borderRadius,
      opacity: s.opacity,
      active: el.getAttribute("data-asset-active"),
    };
  };

  const media = target.querySelector('[data-active-asset-hit-area="media"]');
  const before = { container: read(target), media: media ? read(media) : null };
  target.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
  await new Promise((r) => setTimeout(r, 500));
  const after = { container: read(target), media: media ? read(media) : null };
  const meta = {
    title: target.getAttribute("data-asset-title"),
    description: target.getAttribute("data-asset-description"),
    h3: document.querySelector("h3")?.innerText,
    tags: [...document.querySelectorAll("h3 ~ *")]
      .map((el) => el.innerText?.trim())
      .filter((t) => t && t.length < 40)
      .slice(0, 6),
  };
  target.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));

  const hoverCss = [...document.querySelectorAll("style")]
    .map((s) => s.textContent)
    .join(" ")
    .match(/:hover[^{]+{[^}]+}/g);

  return JSON.stringify({ before, after, meta, hoverCss }, null, 2);
})()
```

Save to `behaviors.json`. Add to `DESIGN.md`:

```markdown
## Behaviors

| Interaction | Trigger | Effect | Tokens |
|-------------|---------|--------|--------|
| Card focus | hover | media 120→480px, radius 64→48px, show meta | duration 0.4s, power2.out |
| Carousel | hover card | pause scroll | animation-play-state: paused |
```

### Playwright behavior audit

```bash
node skills/recon/scripts/behavior-audit.mjs https://example.com docs/research/example/behaviors.json
```
