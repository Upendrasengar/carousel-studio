# Building a theme pack

A theme pack is a directory under `themes/`. Nothing outside it knows what a
theme looks like, so adding one is adding a directory — the renderer, the
validator and the deck schema stay untouched.

```
themes/<name>/
  theme.json        tokens: canvas, colour, type scale, spacing, budgets
  templates.js      exports slideHTML(slide, ctx), css(ctx), SLIDE_TYPES
  rules.md          what the system is, and what is forbidden in it
  assets/
    fonts/          .woff2 files named in theme.json
    ...             whatever else the theme draws with
```

## theme.json

Required top-level keys: `name`, `label`, `description`, `canvas`, `color`,
`font`, `type`, `space`, `budgets`.

`canvas` must carry `width`, `height`, `scale`, `safeTop`, `safeBottom`,
`margin`. The safe bands are the Instagram grid crop — see
`references/composition-rules.md`.

Two optional keys shape behaviour rather than looks:

- `fill: { min, maxGrow }` — the frame-fill target and the ceiling on the
  growth pass. Defaults to `0.62` / `1.35`. A deliberately sparse theme wants
  a lower `min` and a tighter `maxGrow`; `spotlight-minimal` runs `0.56` /
  `1.20`.
- `rowStyle: "rule" | "card"` — hairline rules or white cards. Default to
  `rule` unless the theme's identity genuinely needs the card.

`font` maps a role to `{ file, weight }`. Files live in `assets/fonts/` and
are base64-embedded at render time, so a missing file is a hard error rather
than a silent fallback to Times New Roman.

## templates.js

Must export:

- `SLIDE_TYPES` — array of type names the theme handles
- `slideHTML(slide, ctx)` — body markup for one slide
- `css(ctx)` — the full stylesheet, built from tokens

`ctx` carries `{ t, deck, rng, index, total, accent, fontFaces, textureCSS }`.
`t` is the parsed tokens; `rng` is the deck's seeded generator.

### The auto-fit contract

Non-negotiable. Every slide must render:

- `.body` — the clipping box, inset by the safe bands
- `.fit` — an inner wrapper inside it
- `[data-fit="<start>"] [data-min="<floor>"]` on any element whose size may
  step down

The renderer measures `.fit`'s real height against `.body`. Centred content
overflows *upward* as well as down, which `scrollHeight` cannot see — this is
the bug that ships a headline running off the top edge while the checker
reports success. Do not replace the wrapper with a scrollHeight check.

### Never put a second `style` attribute beside `fitAttr`

`fitAttr()` emits `style="font-size:…"` along with its data attributes. Adding
your own `style` to the same element produces two `style` attributes, and HTML
keeps the first and **silently drops the rest** — no warning, no error, the
element just renders in the wrong colour.

Put per-element values on an ancestor that carries no fit attributes, as a
custom property, and read them from the stylesheet:

```js
`<li class="row" style="--hue:${hue}">
   <span class="name" ${fitAttr(t.type.itemName)}>${esc(it.name)}</span></li>`
```

```css
.name { color:var(--hue); }
```

One source for the value, and it lands somewhere nothing else writes.
`manifest` is the worked example.

### No backticks inside `css()`

The stylesheet is a template literal, so a backtick anywhere in it — including
in a comment naming a class — ends the string. The failure is a confusing
`X is not a function` at render time, not a syntax error where you typed it.

## Shared libraries

Available to any theme, in `scripts/lib/`:

- `rng.js` — seeded randomness. Everything that varies goes through this.
- `marks.js` — hand-drawn SVG: `underline` `circle` `arrow` `bracket`
  `sparkle`. Jittered from the deck seed, so marks are stable per deck.
- `texture.js` — paper grain via `feTurbulence`. Procedural, so a theme ships
  no texture images and the grain never tiles visibly.

## Shared primitives

Structure is shared; look is per theme. `scripts/lib/blocks.js` owns escaping,
the `*accent*` markup, the auto-fit contract, and the two media cards. A theme
that wants a different terminal card **styles** `.term`; it does not
re-implement the markup.

Also shared, in `scripts/lib/`:

- `rng.js` — seeded randomness. Everything that varies goes through this.
- `marks.js` — hand-drawn SVG: `underline` `circle` `arrow` `bracket` `sparkle`
- `texture.js` — procedural paper grain via `feTurbulence`
- `mascot.js` — the pixel character, with a **palette override** so one
  character serves every theme. `spotlight-minimal` recolours it to the beam;
  `parchment-vault` recolours it purple. Override the prop colours too (`B`,
  `N`, `K`) or a blue wizard hat ends up on a purple body.
- `icons.js` — 14 line icons at one stroke weight

## Porting an existing look

Copy the closest existing pack, swap `theme.json`, rewrite only what genuinely
differs. All six packs share a layout skeleton; they differ in tokens, chrome
and one signature element each.

| Theme | Its signature element |
|---|---|
| pixel-mascot | the posed character, soft cards |
| scrapbook-editorial | the taped kraft margin note |
| parchment-vault | the two-line headline that turns purple on line two |
| spotlight-minimal | the beam, and the mascot recoloured to it |
| notebook-tabs | the inset card and its file-tab progress strip |
| vintage-print | **the reveal mechanic** |

### Stealing the reveal mechanic

It is the highest-value thing in the pack and it is portable. Copy the
`reveal` type and `revealList()` from `vintage-print/templates.js` plus the
`.rv-*` CSS. The step list lives once at `deck.reveal.steps`; each slide sets
`step`. `check.js` already validates it for any theme that declares the type.

One template, and a deck of otherwise identical slides reads as a designed
sequence rather than repetition.

## Checklist before shipping a theme

- [ ] `node scripts/render.js --themes` lists it
- [ ] `node scripts/check.js` reports no theme-level contrast errors
- [ ] A deck of every slide type renders with no overflow
- [ ] The same deck rendered twice is byte-identical
- [ ] `rules.md` says what the theme is **not** for
- [ ] `themes/<name>/preview.png` exists — `node scripts/previews.js <name>`,
      or render the sample with `--preview`. `doctor.js` warns until it does.

The preview is not decoration. A pack ships as a stylesheet and a paragraph of
prose, and the next agent choosing between thirty of them is matching a
mechanic described in words against a look it has never seen. One grid of the
pack's own output settles in a glance what `rules.md` argues for in a page.
