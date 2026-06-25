# Recon

URL → research → `DESIGN.md` → build. Screenshot-backed design specs any AI coding agent can build from.

## Install the skill (any agent)

Works with **Cursor**, **Claude Code**, **Codex**, **Windsurf**, and other agents that support the [open agent skills](https://skills.sh/) ecosystem.

```bash
npx skills add <owner>/recon --skill recon
```

Examples:

```bash
# After you publish this repo to GitHub (replace with your username/org):
npx skills add your-username/recon --skill recon

# Install globally (all projects on this machine):
npx skills add your-username/recon --skill recon -g

# Install every agent target the CLI supports:
npx skills add your-username/recon --skill recon --agent '*' -y

# Local development (from a clone of this repo):
npx skills add . --skill recon -y
```

Browse skills: [skills.sh](https://skills.sh/)

> **Note:** `clone-from-url` and `urlforge` were renamed to **recon**. Old names install redirect stubs.

### Peer dependency — motion

Builds use [transitions.dev](https://transitions.dev) for CSS motion (not hand-rolled keyframes):

```bash
npx skills add Jakubantalik/transitions.dev
```

## Fidelity modes

| Mode | What you get |
|------|----------------|
| **scout** | Research only — `RESEARCH.md` + `DESIGN.md`, no app code |
| **mirror** | Faithful clone — full compare gates before ship |
| **remix** | Same design language, your brand — no pixel-diff blocking |

## What the skill does

1. **Navigate** to a reference URL with a real browser (not `curl`)
2. **Screenshot** full page + sections — agent is the photographer when the user sends no images
3. **Audit** spacing, motion, responsive layouts, intro sequences via CDP / Playwright
4. **Write** `docs/research/{slug}/RESEARCH.md` + `DESIGN.md`
5. **Build** (optional) — implement from `DESIGN.md`; **mirror** mode verifies against reference

## Skill source

```
skills/recon/
├── SKILL.md       # Main workflow (agent-agnostic)
├── reference.md   # CDP scripts, templates
├── examples.md    # wise.design walkthrough
├── agents.md      # Per-agent browser tool mapping
└── scripts/       # capture, compare, responsive-audit, intro-sequence, …
```

Cursor project copy (optional symlink after install):

```
.cursor/skills/recon/
```

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

## This repo

| Path | Purpose |
|------|---------|
| `skills/recon/` | **Published skill** — install with `npx skills add` |
| `skills/urlforge/`, `skills/clone-from-url/` | Deprecated redirects → use `recon` |
| `docs/research/` | Example research output (wise-design) |
| `web/` | Next.js builds from research specs |

## Publish your fork

1. Push this repo to GitHub
2. Users run `npx skills add <owner>/recon --skill recon`
3. Optional: submit to [skills.sh](https://skills.sh/) leaderboard (happens via ecosystem indexing)

## License

MIT — skill instructions are plain markdown; example research and web code follow repo license.
