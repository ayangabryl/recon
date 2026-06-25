#!/usr/bin/env node
/**
 * Capture interaction behaviors via hover simulation.
 * Usage: node behavior-audit.mjs <url> <output.json>
 */
import { writeFile } from "node:fs/promises";

const url = process.argv[2];
const outPath = process.argv[3];

if (!url || !outPath) {
  console.error("Usage: node behavior-audit.mjs <url> <output.json>");
  process.exit(1);
}

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("Install Playwright: npm install playwright && npx playwright install chromium");
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });

const result = await page.evaluate(async () => {
  const cards = [...document.querySelectorAll("[data-asset-index], [data-interactive], button, a[href]")];
  const assetCards = [...document.querySelectorAll("[data-asset-index]")];

  const assets = assetCards.slice(0, 20).map((c) => ({
    title: c.getAttribute("data-asset-title"),
    description: c.getAttribute("data-asset-description"),
    img: c.querySelector("img")?.src,
    collapsed: {
      w: c.getBoundingClientRect().width,
      h: c.getBoundingClientRect().height,
    },
  }));

  const hoverResults = [];
  const target =
    assetCards.find((c) => {
      const r = c.getBoundingClientRect();
      return r.x > 200 && r.x < innerWidth - 200 && r.width > 40;
    }) || assetCards[0];

  if (target) {
    const before = {
      w: target.getBoundingClientRect().width,
      h: target.getBoundingClientRect().height,
      active: target.getAttribute("data-asset-active"),
    };
    target.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 500));
    const media = target.querySelector('[data-active-asset-hit-area="media"]');
    const after = {
      w: target.getBoundingClientRect().width,
      h: target.getBoundingClientRect().height,
      active: target.getAttribute("data-asset-active"),
      media: media
        ? {
            w: media.getBoundingClientRect().width,
            h: media.getBoundingClientRect().height,
            radius: getComputedStyle(media).borderRadius,
          }
        : null,
    };
    const tags = [...document.querySelectorAll("h3 + p ~ *, h3 ~ span")]
      .map((el) => el.innerText?.trim())
      .filter((t) => t && t.length < 40);
    hoverResults.push({
      title: target.getAttribute("data-asset-title"),
      before,
      after,
      tags: [...new Set(tags)].slice(0, 6),
    });
    target.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
  }

  const hoverCss = [...document.querySelectorAll("style")]
    .map((s) => s.textContent)
    .join(" ")
    .match(/:hover[^{]+{[^}]+}/g);

  return {
    assetCount: assetCards.length,
    assets,
    hoverProbe: hoverResults,
    hoverCssRules: hoverCss?.slice(0, 10) || [],
    interactiveCount: cards.length,
  };
});

await writeFile(outPath, JSON.stringify(result, null, 2));
await browser.close();
console.log(`Saved behavior audit → ${outPath}`);
