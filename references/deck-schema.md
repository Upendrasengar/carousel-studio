# Deck schema

One JSON file per carousel. Everything is optional unless marked required.

## Deck level

| Field | Type | Notes |
|---|---|---|
| `slug` | string | **Required in practice.** Seeds all variation. Renaming it reshuffles the deck's layout choices. |
| `title` | string | Human label. Not rendered. |
| `theme` | string | Theme pack name. Overridable with `--theme`. |
| `platform` | string | Overridable with `--platform`. |
| `handle` | string | Rendered in the footer, e.g. `@yourhandle`. |
| `footnote` | string | Right side of the footer, e.g. `Save for later`. |
| `showCounter` | boolean | Defaults true. Renders `03 / 07` top right. |
| `seed` | string | Overrides `slug` for variation only. |
| `slides` | array | **Required.** |
| `brand` | string | Running brand line. scrapbook-editorial, vintage-print, parchment-vault. |
| `tagline` | string | Right side of the header. parchment-vault. |
| `mantra` | string | Footer line in typewriter caps. scrapbook-editorial. |
| `chips` | string[] | Footer chip strip. vintage-print. |
| `reveal` | object | The shared step list. vintage-print — see below. |
| `author` | object | `{ name, site, initials?, avatar? }`. The pill top-right. index-rail. |
| `index` | object | The shared catalogue. index-rail — see below. |
| `manual` | object | The cover object: `{ brand, title, caption, mascot }`. index-rail. |
| `mark` | string | Short brand mark, bottom-left of the card. briefing. |

## Slide level

Every slide needs `type`. The rest depends on the type.

| Field | Used by | Notes |
|---|---|---|
| `type` | all | One of `hook` `problem` `point` `steps` `stat` `quote` `cta` |
| `eyebrow` | all | Small caps label above the headline. |
| `headline` | all but `quote` | The main line. Mark the accent with `*asterisks*`. |
| `deck` | `hook` `point` | One supporting sentence under the headline. |
| `body` | most | A short paragraph. |
| `rows` | `problem` `point` | Array of `{ icon \| logo, title, body }`. Max 5. |
| `steps` | `steps` | Same shape as `rows`, rendered with numbers instead of icons. Max 5. |
| `stats` | `stat` | Array of `{ value, label }`. Max 4, two reads best. |
| `quote` | `quote` | The pull quote. |
| `attribution` | `quote` | Small caps line under it. |
| `action` | `cta` | The ask, e.g. `Comment SEND`. Gets the circled mark. |
| `media` | most | See below. |
| `mascot` | all | A pose name, or `false` to suppress. Defaults per slide type. |
| `note` | most | Margin note. scrapbook-editorial (caps), parchment-vault (sentence case). |
| `callout` | most | Tinted box at the foot of the card. notebook-tabs. |
| `calloutIcon` | most | Icon name for the callout. Defaults to `alert`. |
| `beam` | all | Beam preset name. spotlight-minimal. |
| `spotlight` | all | `false` suppresses the beam. spotlight-minimal. |
| `step` | `reveal` | Which step is lit, 1-based. vintage-print. |
| `mascotSide` | all | `left` or `right`. Defaults to seeded choice. |
| `object` | all | A 3D-rendered object as the slide's visual. Works in every theme. |
| `prop` | all | A pixel object the character stands with, turning it into a scene. |
| `dressing` | all | A smaller object on the far side. Needs a `prop`. |
| `accent` | all | Overrides the rotated accent for this slide. |

## Media

```json
{ "kind": "terminal", "title": "claude code",
  "lines": ["/watch https://youtu.be/abcd", "extracting 214 frames"] }
```
Lines starting with `$`, `/` or `>` render in the accent colour as commands.
Max 8 lines.

```json
{ "kind": "code", "title": "publish.py", "lang": "python",
  "lines": ["mcp.post_to_social(", "    media_urls=slides)"],
  "minLines": 9,
  "mark": { "line": 2, "token": "media_urls", "kind": "circle",
            "label": "plural = carousel" } }
```
A line-numbered source card with shallow syntax colour — `workbench` renders
it. `lang` is `python`, `javascript`, `json` or `bash`. `mark` circles one
token: `token` must match a whole token as the highlighter sees it, so a
quoted key is `'id'` including the quotes, and a token that is not found
throws rather than dropping the annotation. `label` is a handwritten note set
below the card. **Code does not wrap** — an over-long line is clipped by the
card edge, so the theme's `codeLine` budget is a hard limit `check.js` errors
on. `minLines` pads the card with empty numbered rows.

```json
{ "kind": "image", "src": "../shots/dashboard.png", "title": "app.example.com" }
```
`src` is relative to the deck JSON. Embedded as a data URI inside a browser
chrome frame.

## Exhibits — briefing

A `briefing` slide carries one drawn exhibit as its subject. Five kinds, all
built from data — no screenshot, no network, no measurement — so the geometry
is identical on every machine and in panorama mode.

```json
{ "type": "exhibit",
  "kicker": "How it works",
  "headline": "One file in,\na finished deck out.",
  "deck": "Two lines at most. An exhibit owns half the page.",
  "exhibit": { "kind": "fan", "...": "..." },
  "body": "Optional closing line.",
  "source": "Optional provenance, mono, small." }
```

| kind | Fields |
|---|---|
| `fan` | `leftLabel`, `rightLabel`, `hub` (`\n` allowed), `left[]`, `right[]` — 4-5 a side |
| `loop` | `label`, `nodes[{ title, note }]` — 3-4 nodes |
| `chat` | `app`, `caption`, `turns[{ who: "you"\|"claude", name?, text?, subject?, paras[] }]` |
| `record` | `app`, `title`, `sub`, `price`, `priceNote`, `fields[{ k, v }]`, `warn` |
| `table` | `head[]`, `widths[]`, `rows[][]`, optional `app`; a cell may be `{ v, status }` |

`status` is one of `ok`, `warn`, `idle`, `bad` and renders as a tinted pill.

The headline splits on a newline: line one takes the accent, line two the ink.
Two lines exactly — that is the theme's signature and it does not survive one
line or three.

## The index mechanic — index-rail

Every entry carries the whole of its own slide, so a `guide` slide names
nothing but its position. That is the point: nineteen slides of catalogue is
where copy drifts out of step with numbering, and here it cannot.

```json
"author": { "name": "Your Name", "site": "example.com", "initials": "YN" },
"manual": { "brand": "ANTHROPIC", "title": "The\nManual",
            "caption": "8 pages · never sent to you", "mascot": "idle" },
"index": {
  "items": [
    {
      "section": "The Cookbooks",
      "badge": "Start here",
      "title": "Agent Skills",
      "what":  "Anthropic's own skills, including the ones that build Word and PDF files.",
      "start": "Clone the repo, drop one folder into your skills directory.",
      "page": { "kind": "repo", "url": "github.com/anthropics/skills", "...": "..." }
    }
  ]
},
"slides": [
  { "type": "hook", "kicker": "…", "headline": "…", "deck": "…" },
  { "type": "guide", "upto": 1 },
  { "type": "cta", "headline": "All 8 links,\nin one *place*",
    "action": "Comment [MANUAL] and I'll send it over." }
]
```

`section` is the colour key: distinct names take rail colours in the order
they first appear, so the rail turns the list's structure into a shape. Five
sections is the ceiling — a sixth repeats a colour. `badge` is optional and
renders as a pill beside the kicker; use it sparingly, on two or three entries
at most, or it stops meaning anything.

`[square brackets]` in a `cta`'s `action` render as the keyword chip.

### page — the browser card

`page.kind` picks a mock, and every mock is drawn from data rather than
screenshotted, so a deck renders offline and identically every time.

| kind | Fields |
|---|---|
| `repo` | `org`, `name`, `vis`, `branch`, `branches`, `tags`, `tabs[[label, count]]`, `files[{kind:"dir"\|"file", name, msg, age}]`, `note` |
| `docs` | `crumb`, `title`, `blurb`, `nav[]`, `paras[]`, `callout`, `sub`, `subParas[]` |
| `article` | `brand`, `kicker`, `title`, `date`, `paras[]` |
| `notebook` | `cells[{kind:"md"\|"code", lines[]}]` |
| `listing` | `brand`, `nav[]`, `heading`, `rows[{glyph, title, body}]` |

Every kind takes `url`, which is what renders in the address bar — write the
real one. A real screenshot instead: `"page": { "url": "…", "shot": "../shots/x.png" }`.

Mocks render wider and taller than the frame on purpose, so the card is always
a crop. Do not pad the data to make it "fit" — it is not meant to.

## The reveal mechanic — vintage-print

The step list lives once at deck level; each `reveal` slide lights one of them.
Every slide draws the whole list, dimming the rest.

```json
"reveal": {
  "title": "The loop",
  "subtitle": "Build a new AI expert in 5 minutes",
  "loopLabel": "loop",
  "steps": [
    { "title": "Open NotebookLM", "body": "add your best sources" },
    { "title": "Ask for a SKILL.md", "body": "based only on those sources" }
  ]
},
"slides": [
  { "type": "reveal", "step": 1 },
  { "type": "reveal", "step": 2 }
]
```

Light every step, in order. `check.js` warns on a gap or a jump.

## Two-line headlines — parchment-vault

The headline splits on `\n`. Line one is ink; line two is purple italic and
carries the emphasis.

```json
"headline": "Eight folders.\nThat is the whole thing."
```

## The asset library

Three groups live in `assets/`, downloaded by `node scripts/get-assets.js`.
All permissively licensed for commercial use — see `assets/LICENSES.md`, and
read the trademark caveat there before putting a brand mark on a slide.

**`object` — 586 3D-rendered objects in 5 style packs.** The slide's visual,
bottom-right in most themes, centred under the beam in `spotlight-minimal`.
Works in every theme, with or without a mascot.

| Pack | Style | Icons | Source |
|---|---|---|---|
| `fluent` | flat-shaded, bright, emoji-like | 97 | Fluent Emoji (MIT) |
| `3d-color` | saturated 3D render | 122 | 3dicons (CC0) |
| `3d-gradient` | 3D with gradient lighting | 123 | 3dicons (CC0) |
| `3d-premium` | 3D, richer materials | 123 | 3dicons (CC0) |
| `3d-clay` | matte white clay | 121 | 3dicons (CC0) |

The four 3dicons packs **share icon names**, so `bulb` exists in all of them
and switching pack restyles a whole deck without touching a slide.

```json
"objectPack": "3d-gradient",              // deck level — set it once
"slides": [
  { "type": "cta", "headline": "...", "object": "rocket" },
  { "type": "point", "headline": "...", "object": "fluent:package" }  // override
]
```

A bare name uses the deck's `objectPack`, or `fluent` if none is set — which
is why decks written before packs existed still render unchanged.

**Pick one pack per deck.** Each is a distinct 3D style and mixing them reads
as a collage; `check.js` warns when a deck uses more than one.

Browse them in `assets/_objects-<pack>.png` — one labelled sheet per pack.
Names are plain: `rocket` `bulb` `chart` `clock` `book` `lock` `rocket`
`target` `trophy` `wallet` …

**`logo` on a row — 69 brand marks** (Simple Icons, CC0). On a slide naming
real tools, the brand mark carries more information than any generic glyph.

```json
{ "logo": "github", "title": "GitHub", "body": "read PRs and issues" }
```

Browse them in `assets/_logos.png`. A row takes `logo` **or** `icon`, not both.

**`icon` on a row — 122 line icons** (Lucide, ISC) on top of the 14 built-ins.
Any Lucide name works: `git-branch` `shield-check` `trending-up` `database`.
Browse them in `assets/_icons.png`.

**Rules**
- One `object` per slide, and not on every slide — the same discipline as
  scenes. Three or four across a deck.
- Don't combine `object` with `prop`. A 3D render next to pixel art reads as
  a collage, and `check.js` warns.
- Pick the object for meaning. A rocket on a slide about pricing is a
  decoration; a rocket on a slide about shipping is information.

## Scenes — pixel-mascot, parchment-vault, spotlight-minimal

A character alone in a corner reads as a sticker. The same character standing
next to an object reads as an illustration, and that is most of the distance
between a generated deck and a designed one.

```json
{ "type": "point", "headline": "...", "prop": "monitor", "dressing": "plant" }
```

| Prop | Use it for |
|---|---|
| `monitor` | watching, dashboards, output, anything on a screen |
| `microwave` | speed — "done in two minutes" |
| `books` | sources, docs, research, reading |
| `server` | infrastructure, connected tools, storage |
| `chart` | stats, results, growth |
| `box` | shipping, packaging, delivery, what you get |
| `clock` | time, deadlines, how long something takes |

Dressing is background, not a subject. Only `plant` and `mug` are meant for
it; anything else competes with the main object and `check.js` warns.

**Rules**
- One prop per slide. There is no second-prop slot on purpose.
- Pick the prop for the *meaning*, not for variety. A microwave on a slide
  about storage is a joke the reader has to decode.
- Don't put a `prop` and a `media` card on the same slide — there is no room
  and one of them will be dropped.
- Two or three propless slides per deck is right. A scene on every slide
  stops being a scene and becomes wallpaper.

## Signature slide types

Each theme adds one type carrying its mechanic. All of them keep their shared
list **once on the deck** and index into it per slide, so the copy is written
once and cannot drift out of step. `check.js` validates every one of these.

| Theme | Type | Deck key | Slide field |
|---|---|---|---|
| `vintage-print` | `reveal` | `reveal.steps` | `step` |
| `ledger` | `entry` / `tally` | `entries.items` | `n` |
| `swap` | `swap` / `cover` / `receipt` | — | `paid`, `free`, `features` |
| `handbuilt` | `build` | — | `note[]`, `aside`, `prop` |
| `workbench` | `build` | — | `media` (`code`/`terminal`/`graph`), `aside`, `traits[]` |
| `audit` | `flow` / `compare` | — | `left`/`mid`/`right`, `bad`/`good` |
| `catalogue` | `page` | — | `items[]`, numbered deck-wide |
| `killlist` | `kills` | — | `items[]` with `kills`, numbered deck-wide |
| `thread` | `line` | `session.items` | `upto` |
| `tierlist` | `tier` | `board.items` | `upto` |
| `decision` | `node` | `tree.nodes` | `at` + `path` |
| `case-file` | `file` | `file.facts` | `declassify[]` |
| `ledger` | `entry` / `tally` | `entries.items` | `n` / — |
| `versus` | `split` | — | `at`, `old`, `now` |
| `spine` | `stop` | — | `marks[]`, `era` |
| `stat-card` | `card` | — | `rarity`, `stats[]`, `flavour` |
| `schematic` | `detail` | — | `callouts[]`, `zoom` |
| `wide-cut` | `strip` | — | `beats[]`, `panorama: true` |
| `console` | `wire` | `rail.items` | `graph`, `railAt` |
| `ladder` | `ladder` | `grades` | `task`, `rungs[3]`, `rungs[2].parts` |
| `index-rail` | `guide` | `index.items` | `upto` |
| `briefing` | `exhibit` | — | `exhibit{kind,...}` |

Each theme's `rules.md` has the full shape and the rules for using it. Read
the one theme you are using, not all twelve.

## The newer signature types, in brief

Each theme's `rules.md` has the full shape. These are the one-line versions so
you can tell from here which type you want.

**`swap`** — a paid/free comparison card. `paid` and `free` each take `name`,
`logo`, `price`, `score`, `desc`; plus three `features`, a `winner` and
`saves`. `cover` builds a logo cloud from the deck's own swaps; `receipt`
itemises the paid side into a total.

**`build`** (handbuilt) — `note` is an array of short lines rendered in a mono
card, and they **do not wrap**, so keep each under about 40 characters.
`aside` is a handwritten margin line with an arrow; `prop` puts the character
in a scene.

**`build`** (workbench) — a caption above a taped card. `headline` splits on a
newline into an ink line and a red italic line, and there is no asterisk
markup for it. `aside` is one quiet italic line that must say something the
body does not. `traits[]` is the icon strip. A build slide with no `media`,
`rows`, `traits` or `note` is a caption with nothing to caption, and
`check.js` errors on it.

**`flow`** (audit) — three columns read *across*, not down: `left.items[n]`,
`mid.steps[n]` and `right.items[n]` are the same problem, its fix and its
result. The counts must match; `check.js` errors if they do not.

**`compare`** (audit) — a before/after pair with a saving `badge` on the seam.

**`page`** (catalogue) — ten `items` of `{ logo, name, tag, body, bestFor }`.
Numbers run across the whole deck and are computed, never written.

**`kills`** (killlist) — five `items` of `{ name, slug, body, kills }`. The
`kills` value is the point of the row: name the specific bad thing it removes,
under about 56 characters. Numbered deck-wide like `page`.

**`wire`** (console) — a `graph` of nodes and edges, plus `railAt` pointing at
one of `deck.rail.items`.

**`ladder`** (ladder) — one `task` and exactly three `rungs`, graded `weak`,
`better`, `best` in that order. Each rung is `{ grade, text }`; `text` keeps
its newlines, because the shape of the best prompt is the thing being praised.
The `best` rung may carry `parts` — two to five `{ key, text }` pairs naming
what each clause of it is doing. Keep the keys identical across the deck.
`deck.grades` renames the three rungs once. Anything other than three rungs
throws.

**`group`** (manifest) — one category: `n` (its position, which picks the hue),
`category`, `icon` or `logo`, `deck`, and five or six `items` of
`{ name, body, metric }`. `metric` is the point of the row — a figure worth
comparing against the row above, under about 9 characters. Numbering restarts
inside each group, unlike `page` and `kills`. The deck also carries
`taxonomy: [{ label, count }]`, rendered as chips on both the hook and the CTA,
and `unit` for the header count ("6 repos").

**`assemble`** (assembly) — the whole post. Three to six `slots` of
`{ title, icon, tag, body, try }`, plus `headline`, `deck`, `eyebrow` and an
optional `source` line. The `try` line is the payload — the instruction
someone would retype — and a slot without one is a label; `check.js` warns.
The deck is **exactly one slide** and the theme errors on any other count.
`check.js` also computes whether the last slot lands inside the take from the
theme's `animate` spec and errors if it would be caught mid-rise.

**Animation.** Any slide can set `"animate": true`; render with `--animate` and
it becomes an MP4 with a PNG fallback beside it. Eight themes have keyframes
written for them: `kinetic`, `swap`, `pixel-mascot`, `vintage-print`,
`manifest`, `datasheet`, `ladder` and `assembly`. On the other 22 the flag is
not an error — it produces a perfectly valid MP4 of a motionless image, which
on Instagram looks broken.

Seven of the eight are 4-second seamless loops. `assembly` is not: it is a
14-second one-shot build that holds on its final state, and for it the video
is the post rather than a moving version of the still.

## Emphasis

`*text*` inside `headline`, `deck`, `body`, `quote`, `row.title` and
`row.body` renders in the accent colour. Use it once per slide.

## Minimal example

```json
{
  "slug": "my-deck",
  "handle": "@yourhandle",
  "slides": [
    { "type": "hook", "eyebrow": "The idea",
      "headline": "This changes *everything*.",
      "deck": "One sentence of context." },
    { "type": "cta", "eyebrow": "Get it",
      "headline": "It's *free*.", "action": "Comment SEND" }
  ]
}
```
