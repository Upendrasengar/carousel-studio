# pixel-mascot — theme rules

Derived from the `DaYFGZukjyH` and `DcTqPvUEq4v` reference decks. Two
different topics, one system — which is the proof it scales.

Read this plus `references/composition-rules.md`. You do not need the other
theme packs' rules.

## What the system is

A near-white editorial explainer. Heavy grotesque headline in near-black with
one accent word. A small caps eyebrow sitting on an accent rule. Soft white
cards with tinted icon chips. A pixel mascot in a different pose per slide,
sitting below the content, never overlapping it.

The mascot is why this system reads as a brand rather than a template. It is
also the thing that breaks it if overused.

## Chrome and rows

The eyebrow renders as a **two-part chip** — slide number in the accent, label
in a tint beside it. It replaces the separate page counter, so do not also ask
for one. A slide with no `eyebrow` falls back to a plain `03 / 07` on the
right.

Rows are **hairline-ruled**, not carded. `theme.json` carries
`"rowStyle": "rule"`; setting it to `"card"` restores white cards. Leave it on
`rule`: a stack of white rounded cards is the strongest "generated deck" tell
there is, and it competes with whatever image the slide is carrying.

## Tokens

Everything is in `theme.json`. Never hard-code a colour, size or spacing value
in a deck.

| | |
|---|---|
| Background | `#F8F6F2` — warm off-white, not `#FFF` |
| Ink | `#14120F` |
| Accent | `#DC4E19` (3.8:1 on bg — display type only) |
| Surface | `#FFFFFF` cards on the off-white ground |
| Headline | 104px / 0.96 line height / -0.028em |
| Canvas | 1080x1350 at 2x, 84px margin, 135px safe bands |

The mascot's body orange is `#F0663A` and is deliberately *warmer* than the
text accent. It is illustration, so contrast rules do not bind it, and the
warmer orange keeps the character friendly while the text accent stays legible.
Do not unify them.

## The mascot

Nine poses: `idle` `pointing` `working` `detective` `wizard` `confused`
`idea` `laptop` `celebrate`.

Defaults are mapped per slide type in `theme.json` under `mascot.poseByType`.
Override with `"mascot": "wizard"` on a slide, or `"mascot": false` to drop it.

**Rules**
- The mascot never overlaps content. The renderer enforces this by dropping it
  when it collides, and reports when it does.
- `celebrate` is for the `cta` and nothing else. A deck where the character
  celebrates on slide 3 has nothing left for slide 9.
- `wizard` at most once per deck.
- Do not use the same pose on consecutive slides.
- Two to three slides per deck with **no** mascot is correct. A character on
  every single slide stops being a signal.
- It renders at 39% of slide width with a bevelled silhouette and a contact
  shadow. It is a co-star, not a corner sticker — do not shrink it back.

Poses are ASCII grids in `assets/mascot.js`. Adding one is a text edit — keep
every row 28 characters and the last three rows as legs, so the new pose
stands on the same baseline as the others.

## Scenes

Give a slide a `prop` and the character stops being a corner sticker:

```json
{ "type": "point", "headline": "...", "prop": "monitor", "dressing": "plant" }
```

Props are composed with the pose at render time, never baked into it, so one
prop works with every pose and the character is never redrawn. They render in
their own palette — recolouring the mascot is the point, recolouring a
houseplant is a bug.

Scenes render at `mascot.scenePx` (13) rather than `mascot.px` (15), because
they are roughly twice as wide. The widest scene lands at about 81% of canvas
width.

Full prop list and selection rules are in `references/deck-schema.md`. The
short version: one prop per slide, chosen for meaning rather than variety,
and two or three propless slides per deck.

## Copy

Budgets in `theme.json` under `budgets`, enforced by `check.js`.

| Field | Budget |
|---|---|
| eyebrow | 26 |
| headline | 42 |
| deck | 120 |
| body | 260 |
| row title | 34 |
| row body | 96 |
| stat value | 7 |
| quote | 140 |

**Voice.** Plain declaratives. Contractions are fine. No em-dash pile-ups, no
"unlock", "supercharge", "game-changer", "in today's fast-paced". Headlines
end with a period — it is part of the system, not a typo.

The headline is a claim you could argue with. If nobody could disagree with
it, it is a label, not a headline.

## Marks

One hand-drawn mark per slide, at most, and only where the theme already
places one:

- `hook` — underline beneath the headline
- `quote` — bracket beside the quote
- `cta` — circle around the action

Do not add marks to `point`, `steps` or `stat` slides. Those slides carry
rows or values, which are already the visual interest.

## Media

- `terminal` — dark card, mono, command lines in accent. Max 8 lines, and
  fewer is better. This is a texture that says "real tool", not documentation.
- `image` — screenshot in a browser chrome frame. Export at 2x or it will look
  soft next to the crisp type.

A slide with media plus three or more rows will lose its mascot. Either accept
that or split the slide.

## What this theme is not for

Long-form text, dense data tables, anything needing more than five rows, or
image-led posts where a photo is the subject. Those want a different theme.
