---
name: carousel-studio
description: Generates publication-ready social carousels as PNGs from a topic or a content brief. Use when the user asks for a carousel, a slide deck for Instagram or LinkedIn, a multi-slide explainer, or wants to turn an article, video or thread into swipeable slides. Also use when they ask to add or edit a carousel theme.
---

# Carousel Studio

Turns a topic into a rendered carousel. You write a deck JSON; a theme pack
turns it into PNGs at platform resolution.

**You never write HTML or CSS.** The theme owns the look. Your job is the
content plan and the slide types. If a deck looks wrong, the fix is in the
theme pack, not in the deck.

## Workflow

1. **Pick a theme.** Match it to the *shape* of the content, not to taste:

   | Theme | Reach for it when |
   |---|---|
   | `audit` | one whole system on one dense reference card |
   | `briefing` | a system worth drawing — one exhibit per slide, flow/cycle/record |
   | `case-file` | something worth withholding; redactions lift |
   | `catalogue` | a directory — "N tools, M categories", numbered throughout |
   | `console` | a stack or build, diagrammed. **Dark.** |
   | `decision` | a branching "should you…" — heavily saved |
   | `handbuilt` | a build log in your own voice — "I made this" |
   | `index-rail` | a link roundup — "N pages worth your afternoon". Numbered rail, browser cards. |
   | `killlist` | "N things that stop X" — every row names what it kills. **Dark.** |
   | `kinetic` | a hook that loops as video. Render with `--animate`. **Dark.** |
   | `ledger` | per-item data with figures — "N tools and what each is worth" |
   | `notebook-tabs` | a list deck — "12 folders". Inset card, tab strip. |
   | `parchment-vault` | a system or method; archival rather than urgent |
   | `pixel-mascot` | general explainer, a friendly walkthrough. **The default.** Animates. |
   | `schematic` | a structure worth drawing; each slide zooms in. **Dark.** |
   | `scrapbook-editorial` | an opinionated take that wants marginalia and craft |
   | `spine` | a real chronology; the rail crosses slide joins |
   | `spotlight-minimal` | one idea per slide, sparse and considered |
   | `stat-card` | a comparable set — collectible cards |
   | `swap` | paid vs free — "N tools I stopped paying for". Animates. |
   | `thread` | a tool, a command, a log. Session builds up. **Dark.** |
   | `tierlist` | a ranking worth arguing with |
   | `versus` | a genuine before/after; the split line moves |
   | `vintage-print` | a process with sequential steps. Has the **reveal** mechanic. Animates. |
   | `wide-cut` | one big idea as a 3-slide panorama. **Dark.** |

   `node scripts/render.js --themes` lists them with descriptions.

   **Four themes render video**: `kinetic`, `swap`, `pixel-mascot`,
   `vintage-print`. Mark a slide `"animate": true` and pass `--animate`; that
   slide writes an MP4 *and* a PNG. See "Animated slides" below. The other 21
   themes have no motion and ignore the flag.
2. **Read the theme's rules** — `themes/<name>/rules.md`. Read only the one
   theme you are using. Read `references/slide-grammar.md` if you are unsure
   which slide type fits a beat.
3. **Write the deck JSON** into `decks/<slug>.json`. Schema is in
   `references/deck-schema.md`.
4. **Validate**: `node scripts/check.js decks/<slug>.json`. Fix every ERROR.
   Warnings are judgement calls — a warning about copy length means trim the
   copy, not raise the budget.
5. **Render**: `node scripts/render.js decks/<slug>.json out/<slug>`.
6. **Look at the output.** Read at least the hook and one dense slide as
   images. The renderer reports which slides auto-shrank or lost the mascot;
   those are copy problems, so fix the copy and re-render.
7. **Publish** only if asked. See "Publishing" below.

## The two rules that matter most

**One loud element per slide.** The accent colour touches exactly one thing.
Mark it in the copy with `*asterisks*`. Two accent spans on one slide means
neither one is emphasis.

**Copy budgets are layout constraints.** They are the lengths at which the
design holds without the auto-fit safety net firing. `check.js` enforces them.
When a headline is over budget the answer is a shorter headline.

Budgets differ per theme, sometimes a lot — a headline is 42 characters in
`pixel-mascot` and 32 in `vintage-print`, because a wide slab face eats width
a grotesque does not. Never carry copy between themes without re-checking.

## Slide types

`hook` `problem` `point` `steps` `stat` `quote` `cta` — every theme has these.

`reveal` — `vintage-print` only. Repeats one step list across several slides
with a different step lit each time. Use it when the content is genuinely a
sequence; it is the strongest mechanic in the pack.

`exhibit` — `briefing` only. One drawn diagram or UI mock as the slide's
subject: a `fan`, a `loop`, a `chat`, a `record` or a `table`, all built from
data rather than screenshots. Reach for the theme when the honest answer to
"what does this look like" is a diagram.

`guide` — `index-rail` only. One entry from `deck.index.items`, with a rail
down the left edge showing how far through the list the reader is. The entry
carries its own copy, so the slide is just `{ "type": "guide", "upto": 3 }`.

A deck opens on `hook` and closes on `cta`. Everything between is
`problem` → `point`/`steps`/`stat` → `quote`. Seven to nine slides is the
range that holds attention; past ten, completion drops sharply.

Some fields are theme-specific: `note` (scrapbook-editorial, parchment-vault),
`callout` (notebook-tabs), `beam` (spotlight-minimal). `check.js` warns when a
field will be ignored by the theme you picked.

## Visuals

A slide with nothing to look at is the single biggest thing separating a
generated deck from a designed one. Three ways to give a slide a subject, all
available in every theme unless noted:

| Field | What it renders |
|---|---|
| `object` | one of 586 3D objects across 5 style packs — `rocket`, `bulb`, `chart` |
| `prop` | a pixel object the character stands with (mascot themes only) |
| `media` | a terminal card or a real screenshot |
| `logo` on a row | one of 69 brand marks, instead of a generic icon |

Browse the library: `assets/_objects-<pack>.png` (one sheet per style pack),
`assets/_logos.png`, `assets/_icons.png`. Machine-readable index of every
object name is `assets/objects-3d/packs.json`. Full rules in
`references/deck-schema.md`.

Set `objectPack` once at deck level — `fluent` (flat, bright), `3d-color`,
`3d-gradient`, `3d-premium` or `3d-clay` (matte white). One pack per deck.

Aim for a visual on most slides, but not all — three or four objects across a
deck, and never an `object` and a `prop` on the same slide.

## Commands

```bash
node scripts/render.js --themes                        # list theme packs
node scripts/check.js  decks/deck.json                 # validate before rendering
node scripts/render.js decks/deck.json out/deck        # render
node scripts/render.js decks/deck.json out/deck --platform linkedin
node scripts/render.js decks/deck.json out/deck --animate   # video where marked
node scripts/render.js decks/deck.json out/deck --theme vintage-print
node scripts/render.js decks/deck.json out/deck --panorama 3 # stitch a wide strip
```

The output directory is the second positional argument, not a flag. Those
five options are the whole surface — anything else leading with `-` is
rejected by name rather than taken as a directory.

Platforms: `instagram-portrait` (default), `instagram-square`,
`instagram-story`, `linkedin`, `x`.

## Animated slides

Four themes declare motion: `kinetic`, `swap`, `pixel-mascot`,
`vintage-print`. Mark the slides that should move and pass `--animate`:

```json
{ "type": "hook", "headline": "…", "animate": true }
```

An animated slide writes **both** `NN-type.mp4` and `NN-type.png`. The still is
mandatory, not a leftover: Instagram and Threads accept carousels that mix
video and images, Facebook takes images only, and LinkedIn takes no video at
all — so one render has to serve both. Never delete the PNG beside an MP4.

Motion is opt-in per slide and scoped to it, so an unmarked slide is
byte-identical to what it rendered before the theme had any animation.

**Use it on the hook, the stat, and `vintage-print`'s reveal.** Not on dense
body slides — movement there competes with reading.

Cost: a 4s slide at 30fps is 120 screenshots. `pixel-mascot` renders one in
~12s, `vintage-print` in ~40s because of the grain. An 8-slide all-video deck
is 5+ minutes.

Writing motion into a new theme? Three rules, all forced by how the renderer
settles animations before it screenshots the still:

1. Reach the final state by ~30% of the cycle and **hold it to 100%**.
2. The final keyframe must *be* the resting design — `opacity:1`,
   `transform:none` — so the still is interchangeable with an unanimated one.
3. **Never start a keyframe at `opacity:0`.** The clip loops, so frame 0
   follows the held final frame; starting from nothing blanks the slide once
   per cycle. Come up from ~0.2 instead.

Prove it the way the existing themes were proven: render a deck with no
`animate` flags before and after your change and diff the PNG checksums. If a
still moved, the scoping leaked.

## Determinism

Every varying choice — layout variant, mascot pose, accent rotation, the
wobble on a hand-drawn mark, the grain pattern — is seeded from the deck's
`slug`. The same deck renders identically forever; two different decks look
different. Never introduce `Math.random()` anywhere in this pipeline; it makes
visual regression testing impossible.

## Adding a theme

A theme pack is a directory under `themes/` with `theme.json`,
`templates.js`, `rules.md` and `assets/`. Nothing outside it knows what a
theme looks like. See `references/building-a-theme.md`.

## Publishing

The pipeline stops at PNGs on disk. If the user has a social publishing MCP
connected, posting is a separate, explicit step — confirm the account and the
caption with them first. Never post without being asked.
