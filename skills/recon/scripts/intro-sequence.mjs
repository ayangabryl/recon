#!/usr/bin/env node
/**
 * Capture page-load intro / opening sequence without screen recording.
 * Dense burst frames + visual-phase detection — storyboard for AI agents.
 *
 * Usage: node intro-sequence.mjs <url> <output-dir> [--sparse]
 *
 * IMPORTANT: Uses waitUntil "commit" — NOT networkidle (intro finishes before idle).
 */
import { mkdir, writeFile, copyFile } from "node:fs/promises";
import { join } from "node:path";

const url = process.argv[2];
const outDir = process.argv[3];
const sparse = process.argv.includes("--sparse");

if (!url || !outDir) {
  console.error("Usage: node intro-sequence.mjs <url> <output-dir> [--sparse]");
  process.exit(1);
}

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

/** Dense early (animation lives here), sparser after settle. ~70–90 frames default. */
function buildCheckpoints() {
  if (sparse) {
    return [0, 50, 100, 200, 400, 800, 1200, 2000, 3500, 5000];
  }
  const ms = new Set();
  // 0–1s: every 33ms (~30fps) — catches fast fades and mounts
  for (let t = 0; t <= 1000; t += 33) ms.add(t);
  // 1–2.5s: every 50ms — hero → marquee transition on wise.design
  for (let t = 1050; t <= 2500; t += 50) ms.add(t);
  // 2.5–5s: every 100ms — late settle
  for (let t = 2600; t <= 5000; t += 100) ms.add(t);
  return [...ms].sort((a, b) => a - b);
}

const CHECKPOINTS_MS = buildCheckpoints();

async function sampleVisualState(page) {
  return page.evaluate(() => {
    const root = document.body ?? document.documentElement;
    if (!root) {
      return {
        phase: "loading",
        visibleMedia: 0,
        visibleArea: 0,
        spreadWidth: 0,
        largestW: 0,
        centerCount: 0,
        opacityHidden: 0,
        domCardCount: 0,
        gsap: null,
        lenis: { present: false, markers: false },
        scrollTrigger: false,
      };
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const band = {
      left: vw * 0.08,
      right: vw * 0.92,
      top: vh * 0.15,
      bottom: vh * 0.85,
    };
    const center = { x: vw / 2, y: vh / 2 };

    function intersectArea(r) {
      const w = Math.min(r.right, band.right) - Math.max(r.left, band.left);
      const h = Math.min(r.bottom, band.bottom) - Math.max(r.top, band.top);
      return Math.max(0, w) * Math.max(0, h);
    }

    function isRenderable(el) {
      if (!(el instanceof Element)) return false;
      const style = getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") return false;
      if (parseFloat(style.opacity) < 0.04) return false;
      const r = el.getBoundingClientRect();
      return r.width >= 24 && r.height >= 24;
    }

    const candidates = [
      ...document.querySelectorAll(
        "img, video, picture, canvas, [data-asset-index], [class*='marquee'] *, [class*='carousel'] *"
      ),
    ].filter(isRenderable);

    const inBand = [];
    let opacityHidden = 0;
    for (const el of candidates) {
      const o = parseFloat(getComputedStyle(el).opacity);
      if (o < 0.04) opacityHidden++;
      const r = el.getBoundingClientRect();
      const area = intersectArea(r);
      if (area > 800) {
        inBand.push({
          w: Math.round(r.width),
          h: Math.round(r.height),
          cx: r.left + r.width / 2,
          cy: r.top + r.height / 2,
          area: Math.round(area),
          opacity: +o.toFixed(2),
        });
      }
    }

    const rects = inBand.map((x) => x);
    const spreadWidth =
      rects.length >= 2
        ? Math.round(Math.max(...rects.map((r) => r.cx)) - Math.min(...rects.map((r) => r.cx)))
        : rects[0]?.w ?? 0;
    const visibleArea = rects.reduce((s, r) => s + r.area, 0);
    const largestW = rects.length ? Math.max(...rects.map((r) => r.w)) : 0;
    const centerCount = rects.filter(
      (r) => Math.abs(r.cx - center.x) < vw * 0.2 && Math.abs(r.cy - center.y) < vh * 0.2
    ).length;

    const domCardCount = document.querySelectorAll("[data-asset-index], .carousel-card").length;

    let phase = "empty";
    if (visibleArea < 5000) phase = "empty";
    else if (rects.length <= 2 && spreadWidth < 500) phase = "hero-focus";
    else if (spreadWidth < 900 || rects.length < 6) phase = "marquee-building";
    else phase = "marquee-full";

    const gsapInfo =
      typeof window.gsap !== "undefined"
        ? {
            version: window.gsap.version,
            tweenCount: window.gsap.globalTimeline.getChildren(true, true, false).length,
          }
        : null;

    const lenisInfo =
      typeof window.Lenis !== "undefined" || typeof window.lenis !== "undefined"
        ? { present: true }
        : {
            present: false,
            markers: !!document.querySelector("[data-lenis-prevent], .lenis, html.lenis"),
          };

    return {
      phase,
      visibleMedia: rects.length,
      visibleArea: Math.round(visibleArea),
      spreadWidth,
      largestW,
      centerCount,
      opacityHidden,
      domCardCount,
      gsap: gsapInfo,
      lenis: lenisInfo,
      scrollTrigger: typeof window.ScrollTrigger !== "undefined",
    };
  });
}


function inferIntro(sequence, keyframes) {
  const phases = [...new Set(sequence.map((s) => s.phase))];
  const hasMotion = phases.length > 1 || (keyframes.length > 2 && sequence[0]?.phase === "empty");
  const startMs = sequence.find((s) => s.phase !== "empty")?.t ?? 0;
  const endMs = sequence.find((s) => s.phase === "marquee-full")?.t ?? sequence.at(-1)?.t ?? null;

  let type = "none";
  if (!hasMotion) type = "none";
  else if (phases.includes("hero-focus") && phases.includes("marquee-full")) type = "hero-then-marquee";
  else if (phases.includes("marquee-building")) type = "staged-marquee-reveal";
  else if (sequence.some((s) => s.opacityHidden > 5)) type = "stagger-opacity-fade-in";
  else if (sequence[0]?.domCardCount === 0 && sequence.some((s) => s.domCardCount > 0))
    type = "delayed-mount";
  else type = "visual-transition";

  return {
    type,
    startMs,
    endMs,
    phasesSeen: phases,
    keyframeCount: keyframes.length,
    frameCount: sequence.length,
    hasGsap: sequence.some((s) => s.gsap),
    hasLenis: sequence.some((s) => s.lenis?.present || s.lenis?.markers),
  };
}

function describePhase(s) {
  switch (s.phase) {
    case "empty":
      return "Chrome only — no visible media in carousel band";
    case "hero-focus":
      return `Single/few centered elements (largest ${s.largestW}px, spread ${s.spreadWidth}px)`;
    case "marquee-building":
      return `Marquee assembling (${s.visibleMedia} visible, spread ${s.spreadWidth}px)`;
    case "marquee-full":
      return `Full marquee (${s.visibleMedia} visible, spread ${s.spreadWidth}px)`;
    default:
      return s.phase;
  }
}

function buildStoryboardMd(intro, keyframes, url) {
  const lines = [
    `# Intro storyboard`,
    ``,
    `**Source:** ${url}`,
    `**Detected:** ${intro.type} (${intro.startMs}ms → ${intro.endMs}ms)`,
    `**Frames:** ${intro.frameCount} burst captures in \`frames/\`, ${intro.keyframeCount} phase keyframes in \`keyframes/\``,
    `**Engine:** GSAP ${intro.hasGsap ? "yes" : "no"}, Lenis ${intro.hasLenis ? "yes" : "no"}`,
    ``,
    `## Phase keyframes (read in order)`,
    ``,
  ];
  for (const k of keyframes) {
    lines.push(`### ${k.ms}ms — ${k.phase}`);
    lines.push(`![${k.ms}ms](${k.file})`);
    lines.push(`${k.description}`);
    lines.push(``);
  }
  lines.push(`## Dense flipbook`);
  lines.push(`For motion between phases, scrub \`frames/\` — **33ms steps 0–1s**, 50ms 1–2.5s, 100ms after.`);
  lines.push(`Suggested scrub: 0 → 33 → 66 → 132 → 330 → 660 → 990 → 1200 → 1450 → 1500 → 1650 → 1750ms`);
  return lines.join("\n");
}

const framesDir = join(outDir, "frames");
const keyframesDir = join(outDir, "keyframes");
await mkdir(framesDir, { recursive: true });
await mkdir(keyframesDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  bypassCSP: true,
});
await context.route("**/*", (route) =>
  route.continue({ headers: { ...route.request().headers(), "cache-control": "no-cache" } })
);
const page = await context.newPage();

await page.goto(url, { waitUntil: "commit", timeout: 60_000 });

const sequence = [];
const keyframes = [];
let prevPhase = "";
let prev = 0;

for (const t of CHECKPOINTS_MS) {
  if (t > prev) await page.waitForTimeout(t - prev);
  prev = t;

  const state = await sampleVisualState(page);
  const file = `intro-${String(t).padStart(5, "0")}ms.png`;
  const framePath = join(framesDir, file);
  await page.screenshot({ path: framePath });

  const entry = { t, ...state };
  sequence.push(entry);

  // Keyframes on phase change only — not every spreadWidth tick from marquee motion
  if (state.phase !== prevPhase) {
    prevPhase = state.phase;
    await copyFile(framePath, join(keyframesDir, file));
    keyframes.push({
      ms: t,
      phase: state.phase,
      file: `keyframes/${file}`,
      description: describePhase(state),
      metrics: {
        visibleMedia: state.visibleMedia,
        visibleArea: state.visibleArea,
        spreadWidth: state.spreadWidth,
        largestW: state.largestW,
      },
    });
  }
}

const htmlAudit = await page.evaluate(() => ({
  dualBreakpoint: document.querySelectorAll("[data-breakpoint]").length >= 2,
  breakpointIds: [...document.querySelectorAll("[data-breakpoint-id]")].map(
    (el) => el.getAttribute("data-breakpoint-id")
  ),
  overflowHidden: document.querySelector("[data-page-overflowx='hidden']") !== null,
  animationKeyframes: [...document.styleSheets]
    .flatMap((ss) => {
      try {
        return [...ss.cssRules].map((r) => r.cssText);
      } catch {
        return [];
      }
    })
    .filter((text) => text.includes("@keyframes"))
    .slice(0, 8)
    .map((text) => text.slice(0, 120)),
}));

const intro = inferIntro(sequence, keyframes);

const report = {
  captured: new Date().toISOString(),
  url,
  intro,
  htmlAudit,
  checkpoints: CHECKPOINTS_MS,
  sequence: sequence.map(
    ({ t, phase, visibleMedia, visibleArea, spreadWidth, largestW, domCardCount, gsap, lenis }) => ({
      t,
      phase,
      visibleMedia,
      visibleArea,
      spreadWidth,
      largestW,
      domCardCount,
      gsap: !!gsap,
      lenis: lenis?.present || lenis?.markers,
    })
  ),
  keyframes,
  captureNote:
    "Dense burst in frames/ (~33ms early). keyframes/ = phase changes only. Read storyboard.md in order.",
};

await writeFile(join(outDir, "intro-sequence.json"), JSON.stringify(report, null, 2));
await writeFile(join(outDir, "storyboard.md"), buildStoryboardMd(intro, keyframes, url));
await context.close();
await browser.close();

console.log(`Intro → ${join(outDir, "intro-sequence.json")}`);
console.log(`Storyboard → ${join(outDir, "storyboard.md")}`);
console.log(`Frames: ${sequence.length} (${framesDir}), keyframes: ${keyframes.length} (${keyframesDir})`);
console.log(`Type: ${intro.type}, phases: ${intro.phasesSeen.join(" → ")}, GSAP: ${intro.hasGsap}`);

if (intro.type === "none") {
  console.warn("WARN: No intro phases detected — inspect frames/ manually; try without --sparse.");
}
