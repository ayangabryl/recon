# Recon

[![GitHub](https://img.shields.io/github/stars/ayangabryl/recon?style=social)](https://github.com/ayangabryl/recon)

**Recon any URL** into a screenshot-backed blueprint your agent can build from — faithful **mirror**, original **remix**, or research-only **scout**.

**Repo:** [github.com/ayangabryl/recon](https://github.com/ayangabryl/recon)

## Install

Works with **Cursor**, **Claude Code**, **Codex**, **Windsurf**, and other [agent skills](https://skills.sh/) hosts.

```bash
npx skills add ayangabryl/recon --skill recon
```

More options:

```bash
# Global install (all projects on this machine)
npx skills add ayangabryl/recon --skill recon -g

# Every agent target the CLI supports
npx skills add ayangabryl/recon --skill recon --agent '*' -y

# Local development (from a clone of this repo)
git clone https://github.com/ayangabryl/recon.git
cd recon
npx skills add . --skill recon -y
```

## Fidelity modes

| Mode | What you get |
|------|----------------|
| **scout** | Research only — `RESEARCH.md` + `DESIGN.md`, no app code |
| **mirror** | Faithful clone — compare gates required before ship |
| **remix** | Same design language, your brand — no pixel-diff blocking |

## What it does

1. **Navigate** to a reference URL with a real browser (not `curl`)
2. **Screenshot** full page, sections, responsive breakpoints, intro sequences
3. **Audit** spacing, motion, behaviors, and UI chrome via CDP / Playwright
4. **Write** `docs/research/{slug}/RESEARCH.md` + `DESIGN.md`
5. **Build** (optional) — implement from `DESIGN.md`; **mirror** mode verifies against the reference

## Example prompts

```
recon scout https://wise.design/ — screenshots + DESIGN.md
```

```
recon mirror https://wise.design — one-shot clone
```

```
recon remix https://wise.design — carousel vibe, my SaaS brand
```

## Repo layout

| Path | Purpose |
|------|---------|
| `skills/recon/` | Published skill — `SKILL.md`, scripts, templates |
| `docs/research/wise-design/` | Example research + compare artifacts |
| `web/` | Next.js demo — `/wise` clone from research spec |

```
skills/recon/
├── SKILL.md          # Main workflow
├── reference.md      # CDP snippets + doc templates
├── examples.md       # wise.design walkthrough
├── agents.md         # Per-agent browser tool mapping
└── scripts/          # capture, compare, responsive-audit, intro-sequence, …
```

## Demo

From the `web/` directory:

```bash
npm install
npm run dev
```

Open [localhost:3000/wise](http://localhost:3000/wise) for the wise.design mirror build.

## License

MIT
