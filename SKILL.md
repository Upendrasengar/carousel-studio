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
   | `assembly` | a capability round-up as **one animated frame** — empty numbered slots fill in one at a time, ending as a finished card. Not a carousel: exactly one slide. **Dark.** Animates. |
   | `audit` | one whole system on one dense reference card |
   | `briefing` | a system worth drawing — one exhibit per slide, flow/cycle/record |
   | `case-file` | something worth withholding; redactions lift |
   | `catalogue` | a directory — "N tools, M categories", numbered throughout |
   | `console` | a stack or build, diagrammed. **Dark.** |
   | `decision` | a branching "should you…" — heavily saved |
   | `datasheet` | a connector or integration round-up where each entry ends in setup **steps**. Fixed 3-field form. Animates. |
   | `handbuilt` | a build log in your own voice — "I made this" |
   | `index-rail` | a link roundup — "N pages worth your afternoon". Numbered rail, browser cards. |
   | `killlist` | "N things that stop X" — every row names what it kills. **Dark.** |
   | `kinetic` | a hook that loops as video. Render with `--animate`. **Dark.** |
   | `ladder` | a teardown where the improvement is the content — one task written weak/better/best, the best one taken apart. Animates. |
   | `ledger` | per-item data with figures — "N tools and what each is worth" |
   | `manifest` | a counted taxonomy — "30 things, 5 categories", a metric on every row. **Dark.** Animates. |
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
   | `workbench` | a setup guide the reader will **type** — kraft paper, taped code cards, a mark circling one token. Animates: a band of light crosses the card left to right and the diagram lights up as it passes. |

   `node scripts/render.js --themes` lists them with descriptions.

   **Nine themes render video**: `kinetic`, `swap`, `pixel-mascot`,
   `vintage-print`, `manifest`, `datasheet`, `ladder`, `assembly`, `workbench`. Mark a slide
   `"animate": true` and pass `--animate`; that slide writes an MP4 *and* a PNG. See
   "Animated slides" below. The other 21 themes have no motion and ignore the flag.

   `assembly` is the odd one out and the only **single-frame** theme: its deck is
   exactly one slide, it runs 14s rather than a 4s loop, and the video *is* the
   post — the PNG is a fallback. A theme declares this with `singleFrame: true`
   in `theme.json`, which makes `check.js` stop applying carousel rules to it.
2. **Read the theme's rules** — `themes/<name>/rules.md`. Read only the one
   theme you are using. Read `references/slide-grammar.md` if you are unsure
   which slide type fits a beat.
3. **Write the deck JSON** into `decks/<slug>.json`. Schema is in
   `references/deck-schema.md`.
4. **Validate**: `node scripts/check.js decks/<slug>.json`. Fix every ERROR.
   Warnings are judgement calls — a warning about copy length means trim the
   copy, not raise the budget.
5. **Render**: `node scripts/render.js decks/<slug>.json out/<slug>`.
6. **Look at the output.** Every render writes `out/<slug>/_review-sheet.png` —
   the whole deck as one labelled grid with each slide's fit measurements
   printed under it. Read that first: it is one image, and it is the only way
   to see the deck's rhythm rather than eight slides in isolation. Then read
   the hook and one dense slide at full size. The sheet flags which slides
   auto-shrank, still overflow, or lost decoration; those are copy problems, so
   fix the copy and re-render.
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

`build` — `workbench` only. A caption — label chip, two-line headline, body,
one italic aside — above a dark card taped to the kraft: a line-numbered
`code` file, a `terminal` session or a `graph`. A code card takes one
`mark` naming the line and the token to circle, and an unmatched token throws
rather than rendering a slide whose copy points at nothing. A `graph` card can
set `"flow": true` to send a dot down the wiring — see *A pulse along the
wiring* below.

`entry` — `datasheet` only. One connector as a filled-in form: a counter chip,
a dashed wire naming both ends, a brand tile, then `does`, `why` and a numbered
`how` recipe of 2-4 steps. Every entry fills the same fields — `check.js`
errors on a blank one, because a hole in a run of identical layouts reads as an
omission rather than as brevity.

`ladder` — `ladder` only. One `task` and exactly three `rungs` graded `weak`,
`better`, `best` in that order, each a prompt card; the best one may carry a
`parts` box naming what each clause of it is doing. Anything other than three
rungs throws. The middle rung is where the pack fails — if it is only
cosmetically better than the first, `check.js` warns, because three cards that
read as two is the one way this slide type disappoints silently.

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
node scripts/render.js decks/deck.json out/deck --preview    # also update the theme's preview
node scripts/sheet.js  out/deck --theme ledger         # rebuild a sheet, no re-render
node scripts/previews.js --all                         # give every pack a preview
```

The output directory is the second positional argument, not a flag. Those
seven options are the whole surface — anything else leading with `-` is
rejected by name rather than taken as a directory.

Platforms: `instagram-portrait` (default), `instagram-square`,
`instagram-story`, `linkedin`, `x`.

## Contact sheets and theme previews

**Every render writes `<outDir>/_review-sheet.png`** — all the deck's slides as
one labelled grid, with what the fit pass measured on each printed underneath:
fill percentage, `shrunk`, `OVERFLOWS`, dropped decoration, and a `video` badge
where an MP4 was written too. Those numbers are already in
`render-report.json`; nobody reads a JSON array, and under the picture that
caused them they get looked at. Read the sheet before the individual slides.

`--no-sheet` skips it. `node scripts/sheet.js <dir> --theme <name>` rebuilds one
for a directory that is already rendered.

**`themes/<name>/preview.png` is the pack's picture of itself** — the same sheet
built from a sample render of that theme. A pack is a stylesheet and a
`rules.md`, and neither tells you what it outputs.

- Render a sample of a theme with **`--preview`** and it lands in the pack.
- `node scripts/previews.js` builds one for every theme that lacks it;
  `--all` rebuilds them; `--decks <dir>` adds a deck search path.
- It picks the deck already written for that theme with the most slides, so
  the preview exercises the pack's signature slide types. Rendering
  `example.json` in all thirty would be cheaper and would show thirty packs
  doing the same four standard types.
- `doctor.js` warns when a pack has none. It warns rather than errors because
  previews are built from local decks, so a fresh clone legitimately has none.

Previews are **gitignored**: 40MB of PNG against 2MB of source, and most are
rendered from `decks/.local/` decks carrying a real handle. Rebuild, do not
store.

## Animated slides

Nine themes declare motion: `kinetic`, `swap`, `pixel-mascot`,
`vintage-print`, `manifest`, `datasheet`, `ladder`, `assembly`, `workbench`. Mark the slides that
should move and pass `--animate`:

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

Rules 1 and 3 assume a **seamless loop**, which is what a slide inside a
carousel is. A single-frame theme (`singleFrame: true`) is a one-shot build
that resets visibly, and `assembly` deliberately breaks both: its cards do
start at `opacity:0`, and they land on a stagger that runs to ~97% of the take
rather than 30%. Rule 2 still binds for every theme — the held end state must
be the resting design, because that is what the still fallback screenshots.

What replaces rule 3 for a one-shot build: **the frame must never be blank.**
Something structural — a rail, a header, empty placeholders — is on screen at
frame 0, so the reset reads as an empty form rather than a dropped frame.

Cost scales with the take, not the slide count: `assembly` at 14s is 420
screenshots, about 3 minutes for the one frame.

Prove it the way the existing themes were proven: render a deck with no
`animate` flags before and after your change and diff the PNG checksums. If a
still moved, the scoping leaked.

### A sweep, and the two ways it goes wrong

`workbench` is the one theme whose motion is a **light travelling across the
slide** rather than parts arriving. Two traps, both found by rendering:

**Stagger with negative delays only.** To make the diagram answer the light,
each part is delayed by its own horizontal position. A *positive*
`animation-delay` on an infinite animation puts the clip's last frame somewhere
other than frame 0, and the loop visibly jumps. A negative delay is a pure
phase shift, so the seam disappears. Put the flare near the END of the keyframe
timeline (~90%) and every delay you need comes out negative. `nodeGraph` stamps
`--nx` — the 0-100 horizontal position — on every node, wire and pin, so the
delay is arithmetic on that number and a re-laid-out graph still lights in the
right order.

**Tilt the band with `skewX`, not with an angled gradient.** An angled
gradient inside an upright box puts its zero stop on a *corner*, so alpha is
non-zero along the box's own left edge and the "light" arrives as a hard
vertical seam sliding across the card. Keep the gradient at `90deg` and skew
the element.

Also: the sweep's travel is stated in percentages of its own width, so the
start and end offsets must be **derived from the band width**, not typed. Narrow
the band with a hardcoded end offset and the light parks half-on the card — in
every still.

### A pulse along the wiring

`"flow": true` on a `graph` sends a dot down each edge: one leaves the source,
and the moment it lands on the hub every outgoing wire carries one. It is
opt-in per deck because it asserts a **direction of work** — true of a pipeline,
a lie about a diagram that merely groups things. `check.js` errors on a flowing
graph with an unreachable node and warns when two nodes have no incoming edge,
which is almost always a reversed edge making a second source.

Three things it will teach you again if you rebuild it:

**Waves are derived, not declared.** Breadth-first from the nodes with no
incoming edge gives every edge a hop number, and hop number is the wave. Add a
seventh platform and it joins the split with nothing to update.

**The dots are HTML at percentage positions, not SVG circles.** The wire `<svg>`
is `preserveAspectRatio="none"` so a 0-100 layout fills any box — and a
`<circle>` in that space renders as an ellipse whose squash depends on the
card's aspect.

**Hold full brightness through arrival, then go out at the node.** Fading a dot
across the tail of its journey reads as a dot that gave up: measured, the first
version died at 70 of the 80 units it had to cross. And it must be `opacity:0`
at both 0% and 100% — stills of an animated slide are made by seeking every
animation to just inside its last frame, so a dot that ended lit is parked
mid-wire on the PNG that ships to the platforms taking no video.

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

Themes are discovered by scanning `themes/`, so `render.js --themes` picks up
a new pack with no registration. **The table above does not** — it is
hand-maintained. Add the row when you add a pack, or the pack is invisible to
anyone reading this file.

## Cloning a reference post

Fourteen of these packs end their `theme.json` description with `Derived from
the <shortcode> reference deck.` That is the convention: when a pack is
modelled on a real post, record which one.

Working from a post someone shared? Follow the `clone-reference-post` skill.
The short version: fetch it with `ig-inspect` and **look** at it, name its
mechanic in one sentence, then match that mechanic against the table above —
never against its palette. Reuse a pack when it already owns that signature
element; build one only when no pack does.

Reproduce the mechanic, never the artwork or the copy. The result is a
sibling, not a forgery.

## Publishing

The pipeline stops at PNGs on disk. If the user has a social publishing MCP
connected, posting is a separate, explicit step — confirm the account and the
caption with them first. Never post without being asked.
