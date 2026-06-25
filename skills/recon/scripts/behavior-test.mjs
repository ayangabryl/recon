#!/usr/bin/env node
/**
 * Test clone behaviors vs reference — chrome, hover, rotators, rapid-hover stress.
 * Usage: node behavior-test.mjs <referenceUrl> <cloneUrl> <output.json>
 */
import { writeFile } from "node:fs/promises";

const referenceUrl = process.argv[2];
const cloneUrl = process.argv[3];
const outPath = process.argv[4];

if (!referenceUrl || !cloneUrl || !outPath) {
  console.error("Usage: node behavior-test.mjs <referenceUrl> <cloneUrl> <output.json>");
  process.exit(1);
}

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  try {
    const { dirname, join } = await import("node:path");
    const { existsSync } = await import("node:fs");
    const { pathToFileURL } = await import("node:url");
    let dir = process.cwd();
    let resolved = null;
    while (dir !== dirname(dir)) {
      const candidate = join(dir, "node_modules", "playwright", "index.mjs");
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

const VIEWPORT = { width: 1920, height: 1080 };

async function collectRotatorTexts(page, waits = 4) {
  const texts = new Set();
  for (let i = 0; i < waits; i++) {
    await page.waitForTimeout(2000);
    const samples = await page.evaluate(() => {
      const rotator = document.querySelector(
        ".vertical-text-rotator, [class*='rotator'], [aria-live='polite']"
      );
      const items = rotator
        ? [...rotator.querySelectorAll("[class*='item'], p, span")].map((el) =>
            el.textContent?.trim()
          )
        : [];
      const footer = document.querySelector("footer, [class*='footer']");
      const footerText = footer?.textContent?.trim().slice(0, 120);
      return {
        primary: rotator?.textContent?.trim(),
        items: items.filter(Boolean),
        footerText,
      };
    });
    if (samples.primary) texts.add(samples.primary);
    for (const item of samples.items) if (item) texts.add(item);
  }
  return [...texts];
}

async function visibleCardBoxes(page) {
  const cardLocator = page.locator(".carousel-card, [data-asset-index]");
  const count = await cardLocator.count();
  const boxes = [];
  for (let i = 0; i < count; i++) {
    const box = await cardLocator.nth(i).boundingBox();
    if (!box || box.x < 0 || box.x + box.width > VIEWPORT.width) continue;
    if (box.y < 120 || box.y > 900) continue;
    boxes.push({ index: i, box });
  }
  return boxes;
}

async function probe(page, url, label) {
  await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(1500);

  const chrome = await page.evaluate(() => {
    const logo =
      document.querySelector('[aria-label="Wise Fastflag logo"]') ||
      document.querySelector('a[href*="wise"] img[alt*="Wise"]')?.closest("a");
    const pause = document.querySelector('[aria-label="pause-carousel"], [aria-label="play-carousel"]');
    const progressCandidates = [...document.querySelectorAll('[aria-label="line"]')];
    const progress =
      progressCandidates.find((el) => {
        const r = el.getBoundingClientRect();
        return r.width < 300 && r.height < 20 && r.y > 900;
      }) || progressCandidates[0];
    const progressThumb = progress?.querySelector("div > div:last-child, div[style*='left']");
    const cards = [...document.querySelectorAll(".carousel-card, [data-asset-index]")];
    const visibleCards = cards.filter((el) => {
      const r = el.getBoundingClientRect();
      return r.x > -40 && r.x < innerWidth && r.width > 0;
    });

    const pick = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return {
        w: Math.round(r.width),
        h: Math.round(r.height),
        bg: s.backgroundColor,
        borderRadius: s.borderRadius,
      };
    };

    return {
      logo: pick(logo),
      pause: pick(pause),
      progress: pick(progress),
      progressThumb: progressThumb ? pick(progressThumb) : null,
      visibleCards: visibleCards.length,
      avgCardWidth:
        visibleCards.length > 0
          ? Math.round(
              visibleCards.reduce((a, el) => a + el.getBoundingClientRect().width, 0) /
                visibleCards.length
            )
          : 0,
    };
  });

  const rotatorTexts = await collectRotatorTexts(page);

  let hover = null;
  let rapidHover = null;
  try {
    const pauseSel = '[aria-label="pause-carousel"], [aria-label="play-carousel"]';
    if (await page.locator(pauseSel).count()) {
      await page.click(pauseSel);
      await page.waitForTimeout(400);
    }

    const boxes = await visibleCardBoxes(page);
    if (boxes.length > 0) {
      await page.mouse.move(boxes[0].box.x + boxes[0].box.width / 2, boxes[0].box.y + boxes[0].box.height / 2);
      await page.waitForTimeout(900);

      hover = await page.evaluate(() => {
        const active =
          document.querySelector('[data-asset-active="true"], [data-active="true"]') ||
          document.querySelector('.carousel-card[data-active="true"]');
        const media =
          active?.querySelector("[data-active-asset-hit-area='media']") ||
          active?.querySelector("div.absolute");
        if (!media) return null;
        const r = media.getBoundingClientRect();
        return { w: Math.round(r.width), h: Math.round(r.height) };
      });

      const rapidTargets = boxes.slice(0, Math.min(6, boxes.length));
      for (const { box } of rapidTargets) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(120);
      }
      await page.mouse.move(40, 40);
      await page.waitForTimeout(500);

      rapidHover = await page.evaluate(() => {
        const expanded = [...document.querySelectorAll(".carousel-card, [data-asset-index]")].filter(
          (el) => {
            const media =
              el.querySelector("[data-active-asset-hit-area='media']") ||
              el.querySelector("div.absolute");
            const r = media?.getBoundingClientRect();
            return r && r.height > 200;
          }
        );
        const stuckMeta = [...document.querySelectorAll(".carousel-card [class*='opacity']")].filter(
          (el) => {
            const s = getComputedStyle(el);
            return parseFloat(s.opacity) > 0.5 && el.textContent && el.textContent.length > 40;
          }
        ).length;
        return {
          expandedCount: expanded.length,
          stuckMetaPanels: stuckMeta,
        };
      });
    } else {
      hover = { error: "no visible card in viewport" };
      rapidHover = { error: "no visible cards" };
    }
  } catch (err) {
    hover = { error: String(err.message || err) };
    rapidHover = { error: String(err.message || err) };
  }

  return { label, url, chrome, hover, rapidHover, rotatorTexts };
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: VIEWPORT });

const reference = await probe(page, referenceUrl, "reference");
const clone = await probe(page, cloneUrl, "clone");

await browser.close();

const refRotatorCycles = reference.rotatorTexts.length >= 2;
const cloneRotatorCycles = clone.rotatorTexts.length >= 2;

const checks = [
  {
    id: "visible-cards",
    pass: clone.chrome.visibleCards >= reference.chrome.visibleCards - 4,
    ref: reference.chrome.visibleCards,
    clone: clone.chrome.visibleCards,
  },
  {
    id: "avg-card-width",
    pass: Math.abs(clone.chrome.avgCardWidth - reference.chrome.avgCardWidth) <= 80,
    ref: reference.chrome.avgCardWidth,
    clone: clone.chrome.avgCardWidth,
  },
  {
    id: "logo-size",
    pass: clone.chrome.logo?.w === 40 && clone.chrome.logo?.h === 40,
    ref: reference.chrome.logo,
    clone: clone.chrome.logo,
  },
  {
    id: "pause-size",
    pass: clone.chrome.pause?.w >= 44 && clone.chrome.pause?.h >= 44,
    ref: reference.chrome.pause,
    clone: clone.chrome.pause,
  },
  {
    id: "progress-track",
    pass:
      clone.chrome.progress?.w === 160 &&
      clone.chrome.progress?.h >= 8 &&
      clone.chrome.progress?.h <= 10,
    ref: reference.chrome.progress,
    clone: clone.chrome.progress,
  },
  {
    id: "hover-expand-height",
    pass: (clone.hover?.h ?? 0) >= 400,
    ref: reference.hover,
    clone: clone.hover,
  },
  {
    id: "footer-text-rotator",
    pass: refRotatorCycles ? cloneRotatorCycles : true,
    ref: reference.rotatorTexts,
    clone: clone.rotatorTexts,
    note: "Reference cycles footer/attribution copy — clone must too",
  },
  {
    id: "rapid-hover-no-stuck",
    pass:
      (clone.rapidHover?.expandedCount ?? 99) === 0 &&
      (clone.rapidHover?.stuckMetaPanels ?? 99) === 0,
    ref: reference.rapidHover,
    clone: clone.rapidHover,
    note: "After fast hover across cards, none should stay expanded",
  },
];

const report = {
  captured: new Date().toISOString(),
  referenceUrl,
  cloneUrl,
  reference,
  clone,
  checks,
  pass: checks.every((c) => c.pass),
};

await writeFile(outPath, JSON.stringify(report, null, 2));

console.log(`Behavior test: ${outPath}`);
for (const c of checks) {
  console.log(`${c.pass ? "✓" : "✗"} ${c.id}${c.note ? ` — ${c.note}` : ""}`);
}
console.log(`Overall: ${report.pass ? "PASS" : "FAIL"}`);

if (!report.pass) process.exit(1);
