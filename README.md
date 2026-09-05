# Carousel Studio

Turns a deck JSON into publication-ready social carousel PNGs. Built as a
reusable Claude skill: the agent writes content, a theme pack owns the design.

```bash
node scripts/render.js --themes                  # list theme packs
node scripts/check.js  decks/example.json        # validate copy against budgets
node scripts/render.js decks/example.json out/example
node scripts/render.js decks/example.json out/li --platform linkedin
```

Requires Node 20+ and `playwright` with the Chromium browser:

```bash
npm install
```

`postinstall` fetches Chromium. Nothing else is downloaded at render time —
fonts and assets are vendored, so a render never touches the network and the
same deck produces byte-identical pixels every run.

## How it is put together

```
SKILL.md                     agent entry point — routing and workflow only
references/                  cross-theme docs, read on demand
  deck-schema.md             the JSON the agent writes
  slide-grammar.md           what each slide type is for
  composition-rules.md       safe zone, one-loud-element, rhythm
  building-a-theme.md        how to add theme pack number two
themes/                      25 self-contained design systems
  pixel-mascot/              general explainer. the default
  briefing/                  a system worth drawing. one exhibit per slide
  index-rail/                link roundups. numbered rail + browser cards
  vintage-print/             sequences. has the reveal mechanic
  ...                        `npm run themes` lists all 25 with descriptions
    theme.json               tokens: colour, type scale, spacing, budgets
    templates.js             slide types + stylesheet
    rules.md                 what this system is, and is not, for
    assets/fonts/            vendored woff2
assets/                      downloaded, permissively licensed
  objects-3d/                586 3D objects across 5 packs (Fluent Emoji MIT, 3dicons CC0)
  logos/                     69 brand marks (Simple Icons, CC0)
  icons/                     122 line icons (Lucide, ISC)
  fonts/OFL.txt              the licence the vendored typefaces ship under
  LICENSES.md                sources, licences, font table, trademark caveat
scripts/
  render.js                  deck + theme -> PNGs
  get-assets.js              refresh the asset library
  check.js                   validates before you spend a render
  doctor.js                  audits whether an agent can actually discover it all
  get-fonts.js               refresh a theme's typefaces
  lib/blocks.js              structure shared by every theme
  lib/mascot.js              9 poses as ASCII grids -> SVG, recolourable
  lib/assets.js              loads the downloaded asset library
  lib/props.js               9 pixel objects, same grid model
  lib/scene.js               composes character + prop on one ground line
  lib/icons.js               14 line icons
  lib/rng.js                 seeded randomness
  lib/marks.js               hand-drawn SVG annotation
  lib/texture.js             procedural paper grain
  lib/fit.js                 the auto-fit pass
  lib/pagemock.js            synthetic browser cards (repo, docs, article...)
  lib/exhibits.js            drawn diagrams (fan, loop, chat, record, table)
```

## Design decisions worth knowing

**The mascot is code, not image files.** Nine poses authored as ASCII grids
that render to merged SVG rects. The character is byte-identical on every
slide, a new pose is a text edit, and recolouring is a palette swap — which
is how one character serves three themes: orange in `pixel-mascot`, purple in
`parchment-vault`, and recoloured to the beam in `spotlight-minimal`.
Generating the character per-slide with an image model is the single biggest
consistency risk in a pipeline like this.

**The asset library is curated, not mirrored.** `scripts/get-assets.js` holds
explicit name lists rather than cloning whole icon packs — a thousand icons
you never open is a download, not a library. Every source is checked for a
licence that covers embedding in a redistributed image, because most popular
illustration packs do not have one.

**Props are composed, not baked.** A character alone in a corner reads as a
sticker; the same character standing next to a monitor with a plant beside it
reads as an illustration. Poses and props stay separate grids and are combined
at render time on one ground line under one shadow. Authoring whole scenes
instead would mean redrawing the character for every object, which is the
consistency problem the ASCII approach exists to avoid.

**Structure is shared, look is not.** `lib/blocks.js` owns escaping, the
accent markup, the auto-fit contract and the media cards. Each theme owns its
own chrome, layout and CSS. Six packs, one copy of the parts that must not
drift.

**The reveal mechanic.** `vintage-print` repeats one step list across several
slides with a different step lit each time. The copy is written once at deck
level; the slides just name a step. One template, and a run of otherwise
identical slides reads as a designed sequence. It is portable to any theme.

**Texture is procedural.** Paper grain comes from `feTurbulence`, so the
theme ships no texture PNGs, has nothing to license, and the grain never
tiles visibly.

**Everything that varies is seeded from the deck slug.** Layout variant,
mascot pose, accent rotation, the wobble on each hand-drawn mark, the grain.
The same deck renders byte-identically forever — verified — while two
different decks look different. That is what makes visual regression testing
possible later.

**Auto-fit measures the wrapper, not scrollHeight.** Vertically centred
content overflows upward as well as down, which `scrollHeight` cannot see. A
naive check reports success while a headline runs off the top edge.

**The mascot loses to content.** When it would collide with a row list or a
media card the renderer drops it and says so, rather than leaving half a
character peeking out from behind a terminal window.

## Adding a theme

Copy the closest existing pack, swap `theme.json`, rewrite what genuinely
differs. See `references/building-a-theme.md`.
