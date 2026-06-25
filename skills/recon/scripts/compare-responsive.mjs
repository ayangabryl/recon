#!/usr/bin/env node
/**
 * Compare clone vs reference at mobile + desktop viewports.
 * Fails if responsive gates not met (carousel axis, mobile header chrome).
 *
 * Usage: node compare-responsive.mjs <referenceUrl> <cloneUrl> <outputDir>
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const referenceUrl = process.argv[2];
const cloneUrl = process.argv[3];
const outDir = process.argv[4];

if (!referenceUrl || !cloneUrl || !outDir) {
  console.error("Usage: node compare-responsive.mjs <referenceUrl> <cloneUrl> <outputDir>");
  process.exit(1);
}

const VIEWPORTS = [
  { id: "mobile-375", label: "mobile", width: 375, height: 812, isMobile: true },
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
    console.error("Install Playwright in project: npm install -D playwright && npx playwright install chromium");
    process.exit(1);
  }
}

async function measure(page) {
  return page.evaluate(() => {
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

    const pick = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) };
    };

    const logo = pick(document.querySelector('[aria-label*="logo" i]'));
    const globe = pick(
      document.querySelector('svg[aria-label="Globe icon"], svg[aria-label*="Globe" i]')?.closest("a")
    );
    const direction = pick(
      document.querySelector('svg[aria-label="Direction icon"], svg[aria-label*="Direction" i]')?.closest("a")
    );
    const docs = pick([...document.querySelectorAll("a")].find((a) => /docs\.wise\.design/i.test(a.href || "")));
    const textToggle = [...document.querySelectorAll("*")].some((el) => {
      if (!(el instanceof HTMLElement)) return false;
      if (el.offsetParent === null && getComputedStyle(el).display === "none") return false;
      return el.textContent?.trim() === "Inspiration";
    });
    const pause = pick(
      document.querySelector('[aria-label*="pause" i], [aria-label*="play" i], [aria-label*="carousel" i]')
    );

    return {
      carouselAxis: ySpread > xSpread && ySpread > 40 ? "vertical" : "horizontal",
      visibleCards: inView.length,
      avgCardWidth: inView.length
        ? Math.round(inView.reduce((s, c) => s + c.w, 0) / inView.length)
        : 0,
      chrome: {
        logo,
        hasIconToggle: !!(globe && direction),
        hasTextToggle: textToggle,
        hasDocsLink: !!docs,
        globe,
        direction,
        docs,
        pause,
      },
    };
  });
}

async function capture(browser, url, label, vp) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.isMobile ?? false,
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(2000);
  const shot = join(outDir, `${label}-${vp.id}.png`);
  await page.screenshot({ path: shot });
  const metrics = await measure(page);
  await context.close();
  return { shot, metrics };
}

function checksForViewport(ref, clone, label) {
  const items = [];

  items.push({
    id: `${label}-carousel-axis`,
    pass: ref.metrics.carouselAxis === clone.metrics.carouselAxis,
    ref: ref.metrics.carouselAxis,
    clone: clone.metrics.carouselAxis,
  });

  if (label === "mobile") {
    items.push({
      id: "mobile-icon-toggle",
      pass: clone.metrics.chrome.hasIconToggle,
      ref: ref.metrics.chrome.hasIconToggle,
      clone: clone.metrics.chrome.hasIconToggle,
      note: "Mobile header needs globe + direction icon buttons",
    });
    items.push({
      id: "mobile-docs-link",
      pass: clone.metrics.chrome.hasDocsLink,
      ref: ref.metrics.chrome.hasDocsLink,
      clone: clone.metrics.chrome.hasDocsLink,
      note: "Mobile header needs Docs pill linking to docs.wise.design",
    });
    items.push({
      id: "mobile-no-text-toggle",
      pass: !clone.metrics.chrome.hasTextToggle || ref.metrics.chrome.hasTextToggle,
      ref: ref.metrics.chrome.hasTextToggle,
      clone: clone.metrics.chrome.hasTextToggle,
      note: "Mobile should use icons not desktop text toggle",
    });
    if (ref.metrics.chrome.logo && clone.metrics.chrome.logo) {
      items.push({
        id: "mobile-logo-size",
        pass:
          Math.abs(ref.metrics.chrome.logo.w - clone.metrics.chrome.logo.w) <= 4 &&
          Math.abs(ref.metrics.chrome.logo.h - clone.metrics.chrome.logo.h) <= 4,
        ref: ref.metrics.chrome.logo,
        clone: clone.metrics.chrome.logo,
      });
    }
  }

  if (label === "desktop") {
    items.push({
      id: "desktop-text-toggle",
      pass: clone.metrics.chrome.hasTextToggle,
      ref: ref.metrics.chrome.hasTextToggle,
      clone: clone.metrics.chrome.hasTextToggle,
    });
    items.push({
      id: "desktop-pause-visible",
      pass: !!(clone.metrics.chrome.pause && clone.metrics.chrome.pause.w <= 60),
      ref: ref.metrics.chrome.pause,
      clone: clone.metrics.chrome.pause,
    });
  }

  return items;
}

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const viewports = [];

for (const vp of VIEWPORTS) {
  const reference = await capture(browser, referenceUrl, "reference", vp);
  const clone = await capture(browser, cloneUrl, "clone", vp);
  const checks = checksForViewport(reference, clone, vp.label);
  viewports.push({
    id: vp.id,
    label: vp.label,
    reference: { screenshot: reference.shot, metrics: reference.metrics },
    clone: { screenshot: clone.shot, metrics: clone.metrics },
    checks,
  });
}

await browser.close();

const allChecks = viewports.flatMap((v) => v.checks);
const pass = allChecks.every((c) => c.pass);

const report = {
  captured: new Date().toISOString(),
  referenceUrl,
  cloneUrl,
  viewports,
  checks: allChecks,
  pass,
  notes: [
    "Run after implementing mobile layout when responsive.json gates.axisDiffers is true.",
    "Review reference-* and clone-* PNGs side-by-side per viewport.",
  ],
};

await writeFile(join(outDir, "compare-responsive.json"), JSON.stringify(report, null, 2));

console.log(`Compare responsive → ${join(outDir, "compare-responsive.json")}`);
for (const c of allChecks) {
  console.log(`${c.pass ? "✓" : "✗"} ${c.id}`);
}
console.log(`Overall: ${pass ? "PASS" : "FAIL"}`);

if (!pass) process.exit(1);
