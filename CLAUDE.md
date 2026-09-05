# CLAUDE.md

Guidance for Claude Code working in this repository.

## What this is

Carousel Studio: a Claude *skill* that turns a topic into publication-ready
social carousel PNGs. `SKILL.md` is the agent-facing entry point and the
authoring workflow — **read it before writing any deck**. This file covers the
engineering side: how the pipeline is built and what will bite you.

Pipeline: `decks/<slug>.json` → `scripts/check.js` (validate) →
`scripts/render.js` (Playwright/Chromium screenshots) → `out/<slug>/NN-<type>.png`.

## Environment

- `npm install` here installs Playwright and, via `postinstall`, Chromium.
  Nothing is fetched at render time — fonts and assets are vendored.
- Node 22, ESM only (`import`, `.js` extensions required in relative paths).
- No build step, no test suite, no linter. `check.js` is the only gate.
- `out/` and `decks/.local/` are gitignored. Personal decks live in
  `decks/.local/` and render exactly the same way; `decks/` ships four neutral
  examples only.

## Commands

```bash
node scripts/render.js --themes                          # list theme packs + platforms
node scripts/check.js  decks/<slug>.json                 # validate; exits 1 on ERROR
node scripts/render.js decks/<slug>.json out/<slug>      # render
node scripts/render.js decks/<slug>.json out/<slug> --theme thread --platform linkedin
node scripts/get-fonts.js shared                         # refresh typefaces
node scripts/get-assets.js                               # refresh the asset library
```

Both scripts resolve the theme the same way: `--theme` flag → `deck.theme`
field → `pixel-mascot`. `render.js` exits 1 if any slide still overflows at
minimum type size, and always writes `out/<dir>/render-report.json`.

Rendering is the slow part. Always `check.js` first.

## Architecture

```
scripts/render.js      deck + theme -> PNGs. One page load per slide.
scripts/check.js       budgets, slide grammar, asset names, WCAG contrast
scripts/lib/theme.js   theme-pack loader + PLATFORMS presets
scripts/lib/blocks.js  structure shared by every theme
scripts/lib/fit.js     the in-page auto-fit pass (FIT_FN)
scripts/lib/*.js       mascot, props, scene, assets, icons, marks, texture, rng
themes/<name>/         24 self-contained design systems
references/*.md        deck-schema, slide-grammar, composition-rules, building-a-theme
assets/                3D objects (5 packs), logos, icons, shared fonts
```

**Nothing outside `themes/<name>/` knows what a theme looks like.** Adding a
theme is adding a directory, never editing the renderer. If a deck looks
wrong, the fix belongs in the theme pack.

### The theme-pack contract

A pack is `theme.json` (tokens), `templates.js`, `rules.md`, `assets/`.
`templates.js` must export exactly:

- `SLIDE_TYPES` — array of type names
- `slideHTML(slide, ctx)` — markup for one slide
- `css(ctx)` — the whole stylesheet

`ctx` is `{ t (tokens, cloned+platform-patched), deck, rng, index, total,
accent, fontFaces, textureCSS }`.

Every theme implements the seven core types
(`hook problem point steps stat quote cta`). Eleven of the seventeen add
exactly **one** signature type on top, named after what the theme is for:
`reveal` (vintage-print), `tier` (tierlist), `split` (versus), `file`
(case-file), `wire` (console), `node` (decision), `detail` (schematic), `stop`
(spine), `card` (stat-card), `line` (thread), `strip` (wide-cut). `ledger` is
the one exception, adding both `entry` and `tally`. Check a theme's
`SLIDE_TYPES` before reaching for a signature type.

### Structure vs. look

`lib/blocks.js` owns escaping, the `*asterisks*` → `.ac` accent span, the
auto-fit contract and the media cards. It never emits a colour or a size.
Themes own chrome, layout and CSS. Don't reimplement a shared primitive inside
a theme — style its class instead.

## Invariants — do not break these

**No `Math.random()` anywhere in the pipeline.** Every varying choice (layout
variant, mascot pose, accent rotation, mark wobble, grain) is seeded from
`deck.slug` via `lib/rng.js`. Same deck in, same pixels out, forever — that is
what makes visual regression testing possible.

**Every theme must wrap slide content in `fitFrame()`** (`.body` clipping box
containing a `.fit` wrapper). Auto-fit measures the *wrapper's* height, not
`scrollHeight`: vertically centred content overflows upward as well as down,
which `scrollHeight` cannot see. A naive check reports success while a
headline runs off the top edge.

**The fit pass order in `lib/fit.js` is shrink → grow → drop decoration.**
Dropping decoration before the growth pass was a real bug: decoration cleared
the check, then copy grew straight through it.

**Fonts are embedded as base64** so headless Chromium can never silently fall
back to a system font. A theme's `assets/fonts/` wins over the shared
`assets/fonts/` pool.

**Copy budgets in `theme.json` are layout constraints, not preferences.** They
are the lengths at which the design holds without auto-fit firing. When
`check.js` flags a headline, shorten the headline — do not raise the budget.
Budgets differ substantially between themes; never carry copy across themes
without re-running `check.js`.

## Known drift

`README.md` describes six themes and a `themes/` listing that predates the
current twenty-four. `SKILL.md` and `node scripts/render.js --themes` are
authoritative.
