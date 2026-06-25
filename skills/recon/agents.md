# Agent browser adapters

The recon skill requires a **real browser** for screenshots and CDP token extraction. Use the first option your agent has.

## Capability checklist

| Capability | Used for |
|------------|----------|
| Navigate to URL | Open reference site |
| Viewport + full-page screenshot | Ground-truth visuals |
| `Runtime.evaluate` (or equivalent) | Colors, type, spacing, motion audit |
| Scroll to Y position | Section captures |

**Do not** substitute `curl`, HTML scrape, or memory for screenshots.

---

## By agent

### Cursor

**Tool:** `cursor-ide-browser` MCP

| Action | Tool |
|--------|------|
| Open URL | `browser_navigate` |
| Screenshot | `browser_take_screenshot` |
| CDP / JS | `browser_cdp` → `Runtime.evaluate` |
| Scroll | `browser_scroll` or CDP `window.scrollTo` |
| Multi-step | `browser_lock` / `unlock` |

### Claude Code

**Tool:** [agent-browser](https://github.com/vercel-labs/agent-browser) skill (recommended)

```bash
npx skills add vercel-labs/agent-browser
```

Map recon steps to agent-browser commands (navigate, screenshot, evaluate).

### Codex / OpenAI agents

Use whichever browser MCP or Playwright integration the runtime exposes. Same workflow — navigate, screenshot, evaluate JS from [reference.md](./reference.md).

### No browser MCP

Run Playwright locally, then continue the skill with saved screenshots:

```bash
cd skills/recon/scripts
npm install playwright   # once
node capture.mjs https://example.com ../../docs/research/example/screenshots
```

Then proceed with token extraction in a headed browser or paste CDP scripts manually.

---

## Screenshot storage

Always copy captures into the workspace:

```
docs/research/{slug}/screenshots/
  00-full-page.png
  01-hero.png
  02-…
  build/          # post-build verification shots
```

**Gate:** Do not write `DESIGN.md` or application code until ≥1 full-page + ≥3 section screenshots exist on disk.

---

## Post-build verification

1. Start dev server (`npm run dev`, etc.)
2. Navigate to localhost in the same browser tool
3. Screenshot → `docs/research/{slug}/screenshots/build/`
4. Compare to reference shots
