#!/usr/bin/env node
/**
 * Fallback screenshot capture when no browser MCP is available.
 * Usage: node capture.mjs <url> <output-dir>
 * Example: node capture.mjs https://wise.design ./docs/research/wise-design/screenshots
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const url = process.argv[2];
const outDir = process.argv[3];

if (!url || !outDir) {
  console.error("Usage: node capture.mjs <url> <output-dir>");
  process.exit(1);
}

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("Install Playwright first: npm install playwright && npx playwright install chromium");
  process.exit(1);
}

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });

await page.screenshot({ path: join(outDir, "00-full-page.png"), fullPage: true });
await page.screenshot({ path: join(outDir, "01-hero.png"), fullPage: false });

const headings = await page.evaluate(() =>
  [...document.querySelectorAll("h1")].map((h, i) => ({
    i,
    text: h.innerText.trim().slice(0, 60),
    y: Math.round(h.getBoundingClientRect().top + window.scrollY - 120),
  }))
);

for (const h of headings.slice(0, 5)) {
  await page.evaluate((y) => window.scrollTo(0, Math.max(0, y)), h.y);
  await page.waitForTimeout(300);
  const name = `0${h.i + 2}-${h.text.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}.png`;
  await page.screenshot({ path: join(outDir, name), fullPage: false });
}

const tokens = await page.evaluate(`(${(() => {
  const style = (el) => {
    const s = getComputedStyle(el);
    return {
      font: s.fontFamily,
      size: s.fontSize,
      weight: s.fontWeight,
      color: s.color,
      lh: s.lineHeight,
      bg: s.backgroundColor,
    };
  };
  const h1 = document.querySelector("h1");
  const body = document.querySelector("p");
  return {
    title: document.title,
    h1: h1 ? { text: h1.innerText.trim().slice(0, 80), ...style(h1) } : null,
    body: body ? style(body) : null,
    pageH: document.documentElement.scrollHeight,
    iframes: [...document.querySelectorAll("iframe")].map((f) => f.src),
  };
}).toString()})()`);

await writeFile(join(outDir, "tokens.json"), JSON.stringify(tokens, null, 2));

await browser.close();
console.log(`Saved screenshots + tokens.json → ${outDir}`);
