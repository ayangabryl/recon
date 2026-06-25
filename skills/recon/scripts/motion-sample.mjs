#!/usr/bin/env node
/**
 * Sample motion choreography from a live page (continuous / looped motion).
 * Usage: node motion-sample.mjs <url> <output.json>
 *
 * NOT for page-load intros — uses networkidle (intro is over by then).
 * Use intro-sequence.mjs for opening sequences.
 */
import { writeFile } from "node:fs/promises";

const url = process.argv[2];
const outPath = process.argv[3];

if (!url || !outPath) {
  console.error("Usage: node motion-sample.mjs <url> <output.json>");
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
  const img = [...document.querySelectorAll("img,video,div")].find((el) => {
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
            })),
        }
      : null;

  const intervalMs = 200;
  const samples = [];
  let prevX = img?.getBoundingClientRect().x;

  for (let i = 0; i < 25; i++) {
    await new Promise((r) => setTimeout(r, intervalMs));
    const x = img?.getBoundingClientRect().x;
    samples.push({
      ms: i * intervalMs,
      x: x != null ? Math.round(x) : null,
      deltaX: prevX != null && x != null ? Math.round(x - prevX) : null,
    });
    prevX = x;
  }

  const deltas = samples.map((s) => s.deltaX).filter((d) => d != null && d !== 0);
  const medianDelta =
    deltas.length > 0 ? deltas.sort((a, b) => a - b)[Math.floor(deltas.length / 2)] : 0;

  return {
    gsapInfo,
    pxPerSecond: Math.round((medianDelta / intervalMs) * 1000 * 10) / 10,
    inferredEasing: deltas.every((d) => Math.abs(d - medianDelta) <= 2) ? "linear" : "unknown",
    samples,
  };
});

await writeFile(outPath, JSON.stringify(result, null, 2));
await browser.close();
console.log(`Saved motion samples → ${outPath}`);
console.log(`px/s: ${result.pxPerSecond}, easing: ${result.inferredEasing}, gsap: ${!!result.gsapInfo}`);
