#!/usr/bin/env node
/**
 * Capture responsive / mobile design at multiple viewports.
 * Produces screenshots + responsive.json so agents know layout per breakpoint on first prompt.
 *
 * Usage: node responsive-audit.mjs <url> <output-dir>
 *
 * Output:
 *   <out>/responsive.json
 *   <out>/responsive.md
 *   <out>/mobile-375-viewport.png
 *   <out>/tablet-800-viewport.png
 *   <out>/desktop-1920-viewport.png
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const url = process.argv[2];
const outDir = process.argv[3];

if (!url || !outDir) {
  console.error("Usage: node responsive-audit.mjs <url> <output-dir>");
  process.exit(1);
}

const VIEWPORTS = [
  { id: "mobile-375", label: "mobile", width: 375, height: 812, deviceScaleFactor: 2 },
  { id: "tablet-800", label: "tablet", width: 800, height: 600 },
  { id: "desktop-1920", label: "desktop", width: 1920, height: 1080 },
];

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  try {
    const { dirname, join: joinPath } = await import("node:path");
    const { existsSync } = await import("node:fs");
    const { pathToFileURL } = await import("node:url");
    let dir = process.cwd();
    let resolved = null;
    while (dir !== dirname(dir)) {
      const candidate = joinPath(dir, "node_modules", "playwright", "index.mjs");
      if (existsSync(candidate)) {
        resolved = candidate;
        break;
      }
      dir = dirname(dir);
    }
    if (!resolved) throw new Error("missing");
    ({ chromium } = await import(pathToFileURL(resolved).href));
  } catch {
    console.error("Install Playwright: npm install -D playwright && npx playwright install chromium");
    process.exit(1);
  }
}

function pick(el) {
  if (!el || !(el instanceof Element)) return null;
  const r = el.getBoundingClientRect();
  const s = getComputedStyle(el);
  return {
    w: Math.round(r.width),
    h: Math.round(r.height),
    x: Math.round(r.x),
    y: Math.round(r.y),
    display: s.display,
    fontSize: s.fontSize,
  };
}

async function auditViewport(page) {
  return page.evaluate(() => {
    const pickEl = (el) => {
      if (!el || !(el instanceof Element)) return null;
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return {
        w: Math.round(r.width),
        h: Math.round(r.height),
        x: Math.round(r.x),
        y: Math.round(r.y),
        display: s.display,
        fontSize: s.fontSize,
      };
    };

    const breakpoints = [...document.querySelectorAll("[data-breakpoint]")].map((el) => ({
      id: el.getAttribute("data-breakpoint-id"),
      designWidth: el.getAttribute("data-width"),
      display: getComputedStyle(el).display,
      visible: el.offsetParent !== null,
      w: Math.round(el.getBoundingClientRect().width),
      h: Math.round(el.getBoundingClientRect().height),
    }));

    const cards = [...document.querySelectorAll("[data-asset-index], .carousel-card")].map((el) => {
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) };
    });

    const inView = cards.filter(
      (c) => c.w > 20 && c.x > -100 && c.x < innerWidth + 100 && c.y > -50 && c.y < innerHeight + 50
    );

    const ys = inView.slice(0, 6).map((c) => c.y);
    const xs = inView.slice(0, 6).map((c) => c.x);
    const ySpread = ys.length >= 2 ? Math.max(...ys) - Math.min(...ys) : 0;
    const xSpread = xs.length >= 2 ? Math.max(...xs) - Math.min(...xs) : 0;
    const carouselAxis = ySpread > xSpread && ySpread > 40 ? "vertical" : "horizontal";

    const toggleEl = [...document.querySelectorAll("button, div, span")].find(
      (el) => el.textContent?.trim() === "Inspiration"
    );
    const toggle = toggleEl ? pickEl(toggleEl.closest("div")) : null;

    const globeIcon = document.querySelector('svg[aria-label="Globe icon"], svg[aria-label*="Globe" i]');
    const directionIcon = document.querySelector(
      'svg[aria-label="Direction icon"], svg[aria-label*="Direction" i]'
    );
    const iconToggle =
      globeIcon && directionIcon
        ? {
            globe: pickEl(globeIcon.closest("a")),
            direction: pickEl(directionIcon.closest("a")),
          }
        : null;

    const docsLink = [...document.querySelectorAll("a")].find((a) =>
      /docs\.wise\.design/i.test(a.href || "")
    );
    const docs = docsLink ? pickEl(docsLink) : null;

    const logo =
      pickEl(document.querySelector('[aria-label*="logo" i]')) ||
      pickEl(document.querySelector("header a img, nav a img"));

    const pause = pickEl(
      document.querySelector('[aria-label*="pause" i], [aria-label*="play" i], [aria-label*="carousel" i]')
    );

    const progress = [...document.querySelectorAll('[aria-label="line"], [class*="progress"]')]
      .map(pickEl)
      .filter((p) => p && p.w < 400 && p.h < 24)[0];

    const attribution = [...document.querySelectorAll("p, span, div")]
      .find((el) => /designed by wise|ワイズ/i.test(el.textContent || ""))
      ? pickEl(
          [...document.querySelectorAll("p, span, div")].find((el) =>
            /designed by wise|ワイズ/i.test(el.textContent || "")
          )
        )
      : null;

    return {
      viewport: { w: innerWidth, h: innerHeight },
      scrollHeight: document.documentElement.scrollHeight,
      overflowX: getComputedStyle(document.body).overflowX,
      figmaBreakpoints: breakpoints,
      dualBreakpointHtml: breakpoints.length >= 2 || document.querySelectorAll("[data-breakpoint-id]").length >= 2,
      carousel: {
        axis: carouselAxis,
        visibleCount: inView.length,
        sampleCards: inView.slice(0, 4),
        avgWidth: inView.length
          ? Math.round(inView.reduce((s, c) => s + c.w, 0) / inView.length)
          : 0,
      },
      chrome: {
        hasTextToggle: !!toggle,
        hasIconToggle: !!iconToggle,
        hasDocsLink: !!docs,
        toggle,
        iconToggle,
        docs,
        logo,
        pause,
        progress,
        attribution,
      },
      videoCount: document.querySelectorAll("video").length,
    };
  });
}

function inferStrategy(results) {
  const mobile = results.find((r) => r.label === "mobile");
  const desktop = results.find((r) => r.label === "desktop");
  if (!mobile || !desktop) return "Capture at least mobile + desktop before build.";

  const diffs = [];
  if (mobile.audit.carousel.axis !== desktop.audit.carousel.axis) {
    diffs.push(`Carousel: ${desktop.audit.carousel.axis} (desktop) → ${mobile.audit.carousel.axis} (mobile)`);
  }
  if (mobile.audit.chrome.hasTextToggle !== desktop.audit.chrome.hasTextToggle) {
    diffs.push(
      desktop.audit.chrome.hasTextToggle
        ? "Toggle: text pill on desktop, icon buttons on mobile"
        : "Toggle: text on mobile, icons on desktop"
    );
  }
  if (mobile.audit.chrome.hasIconToggle !== desktop.audit.chrome.hasIconToggle) {
    diffs.push("Mobile uses icon Inspiration/Direction buttons — not text toggle");
  }
  if (mobile.audit.chrome.hasDocsLink !== desktop.audit.chrome.hasDocsLink) {
    diffs.push("Docs link: present on mobile header");
  }
  if (mobile.audit.figmaBreakpoints[0]?.id !== desktop.audit.figmaBreakpoints[0]?.id) {
    diffs.push("Figma: separate breakpoint trees in HTML — not CSS-only reflow");
  }
  return diffs.length ? diffs.join("; ") : "Layout reflow only — verify spacing per viewport.";
}

function buildResponsiveMd(report) {
  const lines = [
    `# Responsive design — ${report.url}`,
    ``,
    `Captured: ${report.captured}`,
    ``,
    `## Strategy`,
    report.strategy,
    ``,
    `## Viewports`,
    ``,
    `| Viewport | Screenshot | Carousel | Toggle | Cards visible |`,
    `|----------|------------|----------|--------|---------------|`,
  ];

  for (const r of report.viewports) {
    const a = r.audit;
    lines.push(
      `| ${r.id} (${a.viewport.w}×${a.viewport.h}) | \`${r.screenshot}\` | ${a.carousel.axis} | ${a.chrome.hasToggle ? "yes" : "no"} | ${a.carousel.visibleCount} |`
    );
  }

  lines.push(``);
  lines.push(`## Per-viewport notes`);
  lines.push(``);

  for (const r of report.viewports) {
    const a = r.audit;
    lines.push(`### ${r.label} (${r.id})`);
    if (a.figmaBreakpoints.length) {
      lines.push(
        `- Figma breakpoint: \`${a.figmaBreakpoints.find((b) => b.visible)?.id ?? a.figmaBreakpoints[0]?.id}\` (design width ${a.figmaBreakpoints.find((b) => b.visible)?.designWidth ?? "?"})`
      );
    }
    lines.push(`- Carousel axis: **${a.carousel.axis}**`);
    if (a.chrome.hasIconToggle) {
      lines.push(`- Header: icon toggle (globe + direction) + Docs link`);
    } else if (a.chrome.hasTextToggle) {
      lines.push(`- Header: text Inspiration/Direction toggle`);
    }
    if (a.chrome.hasDocsLink && a.chrome.docs) {
      lines.push(`- Docs button: ${a.chrome.docs.w}×${a.chrome.docs.h} at (${a.chrome.docs.x}, ${a.chrome.docs.y})`);
    }
    if (a.carousel.sampleCards.length) {
      const sizes = a.carousel.sampleCards.map((c) => `${c.w}×${c.h}`).join(", ");
      lines.push(`- Sample card sizes: ${sizes}`);
    }
    if (a.chrome.logo) {
      lines.push(`- Logo: ${a.chrome.logo.w}×${a.chrome.logo.h} at (${a.chrome.logo.x}, ${a.chrome.logo.y})`);
    }
    if (a.chrome.progress) {
      lines.push(`- Progress: ${a.chrome.progress.w}×${a.chrome.progress.h}`);
    }
    lines.push(``);
  }

  lines.push(`## Build rule`);
  lines.push(`Do not ship desktop-only clone. Implement mobile layout or document \`Skip: mobile\` with reason.`);
  return lines.join("\n");
}

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const results = [];

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.deviceScaleFactor ?? 1,
    isMobile: vp.label === "mobile",
    hasTouch: vp.label === "mobile",
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(2000);

  const audit = await auditViewport(page);
  const screenshot = `${vp.id}-viewport.png`;
  await page.screenshot({ path: join(outDir, screenshot) });

  results.push({
    id: vp.id,
    label: vp.label,
    width: vp.width,
    height: vp.height,
    screenshot,
    audit,
  });

  await context.close();
}

await browser.close();

const report = {
  captured: new Date().toISOString(),
  url,
  viewports: results,
  strategy: inferStrategy(results),
  gates: {
    mobileCaptured: results.some((r) => r.label === "mobile"),
    desktopCaptured: results.some((r) => r.label === "desktop"),
    axisDiffers: results.some((r) => r.label === "mobile") &&
      results.some((r) => r.label === "desktop") &&
      results.find((r) => r.label === "mobile")?.audit.carousel.axis !==
        results.find((r) => r.label === "desktop")?.audit.carousel.axis,
  },
};

await writeFile(join(outDir, "responsive.json"), JSON.stringify(report, null, 2));
await writeFile(join(outDir, "responsive.md"), buildResponsiveMd(report));

console.log(`Responsive audit → ${join(outDir, "responsive.json")}`);
console.log(`Summary → ${join(outDir, "responsive.md")}`);
console.log(`Strategy: ${report.strategy}`);
if (report.gates.axisDiffers) {
  console.warn("WARN: Mobile and desktop use different carousel axis — clone needs both layouts.");
}
