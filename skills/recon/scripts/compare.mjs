#!/usr/bin/env node
/**
 * Compare clone vs original — screenshot + layout metrics diff.
 * Usage: node compare.mjs <referenceUrl> <cloneUrl> <outputDir>
 * Example: node compare.mjs https://wise.design http://localhost:3000/wise ./docs/research/wise-design/compare
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const referenceUrl = process.argv[2];
const cloneUrl = process.argv[3];
const outDir = process.argv[4];

if (!referenceUrl || !cloneUrl || !outDir) {
  console.error("Usage: node compare.mjs <referenceUrl> <cloneUrl> <outputDir>");
  process.exit(1);
}

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("Install Playwright: npm install playwright && npx playwright install chromium");
  process.exit(1);
}

const VIEWPORT = { width: 1920, height: 1080 };

async function capture(page, url, label) {
  await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(800);
  const shotPath = join(outDir, `${label}-viewport.png`);
  await page.screenshot({ path: shotPath, fullPage: false });

  const metrics = await page.evaluate(() => {
    const cards = [
      ...document.querySelectorAll("[data-asset-index], .carousel-card, [class*='asset']"),
    ];
    const carouselCards = cards.length
      ? cards
      : [...document.querySelectorAll("img")].filter((img) => {
          const r = img.getBoundingClientRect();
          return r.height >= 80 && r.height <= 200 && r.top > 100 && r.top < 800;
        });

    const rects = carouselCards.slice(0, 30).map((el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return {
        w: Math.round(r.width),
        h: Math.round(r.height),
        x: Math.round(r.left),
        radius: s.borderRadius,
      };
    });

    const visibleInViewport = rects.filter(
      (r) => r.x >= -50 && r.x < innerWidth && r.w > 0
    ).length;

    const toggle = document.querySelector(
      '[class*="tabs"], [class*="toggle"], .t-tabs, .wise-tabs'
    );
    const toggleRect = toggle?.getBoundingClientRect();

    return {
      title: document.title,
      url: location.href,
      viewport: { w: innerWidth, h: innerHeight },
      carousel: {
        totalCandidates: carouselCards.length,
        visibleInViewport,
        sampleRects: rects.slice(0, 8),
        avgWidth:
          rects.length > 0
            ? Math.round(rects.reduce((a, r) => a + r.w, 0) / rects.length)
            : 0,
      },
      toggle: toggleRect
        ? { w: Math.round(toggleRect.width), h: Math.round(toggleRect.height) }
        : null,
      bodyBg: getComputedStyle(document.body).backgroundColor,
    };
  });

  return { shotPath, metrics };
}

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: VIEWPORT });

const reference = await capture(page, referenceUrl, "reference");
const clone = await capture(page, cloneUrl, "clone");

const deltas = {
  visibleCards: {
    reference: reference.metrics.carousel.visibleInViewport,
    clone: clone.metrics.carousel.visibleInViewport,
    delta: clone.metrics.carousel.visibleInViewport - reference.metrics.carousel.visibleInViewport,
  },
  avgCardWidth: {
    reference: reference.metrics.carousel.avgWidth,
    clone: clone.metrics.carousel.avgWidth,
    delta: clone.metrics.carousel.avgWidth - reference.metrics.carousel.avgWidth,
  },
};

const report = {
  captured: new Date().toISOString(),
  referenceUrl,
  cloneUrl,
  viewport: VIEWPORT,
  reference: reference.metrics,
  clone: clone.metrics,
  deltas,
  screenshots: {
    reference: reference.shotPath,
    clone: clone.shotPath,
  },
  pass:
    Math.abs(deltas.visibleCards.delta) <= 3 &&
    Math.abs(deltas.avgCardWidth.delta) <= 80,
  notes: [
    "Review screenshots side-by-side before marking clone done.",
    "visibleCards delta > 3 usually means wrong card slot width or missing items.",
    "avgCardWidth delta > 80 often means collapsed cards reserve expand width.",
  ],
};

const reportPath = join(outDir, "compare.json");
await writeFile(reportPath, JSON.stringify(report, null, 2));

await browser.close();

console.log(`Compare report: ${reportPath}`);
console.log(`Pass (heuristic): ${report.pass}`);
console.log(
  `Visible cards — ref: ${deltas.visibleCards.reference}, clone: ${deltas.visibleCards.clone} (Δ ${deltas.visibleCards.delta})`
);

if (!report.pass) {
  console.error("Compare FAILED heuristic — fix layout before shipping.");
  process.exit(1);
}
