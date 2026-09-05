# spotlight-minimal — theme rules

Derived from the `DcGy2xAEhTy` reference deck. Read this plus
`references/composition-rules.md`.

## What the system is

The quietest pack. A coloured beam falls from above, a small pixel creature
stands in it, and a centred Didone headline sits underneath. There is
deliberately almost nothing else.

This theme's whole argument is that one image, one line and one paragraph is
enough. It only works if you hold that line.

## The beam

Beam colour rotates through five presets — `moss` `sky` `ember` `iris` `clay`
— keyed off slide index, so a deck reads as a set rather than five unrelated
posters. Override per slide with `"beam": "iris"`.

The creature is the shared pixel mascot **recoloured to the beam**, via the
palette override on `mascotSVG`. One character, six themes. Its eyes stay
near-black in every palette or it stops reading as itself.

Suppress the whole spotlight on a slide with `"spotlight": false`. Do that at
most once per deck, and only for a slide that genuinely needs the height.

## The constraint that matters

The content box starts at **36% of canvas height**, below the beam. That is
roughly two thirds of the room the other themes give you, and it is not
negotiable — the beam and the content never share space.

Consequences, all of which `check.js` enforces:

| Field | Budget |
|---|---|
| headline | 40 |
| deck | 110 |
| body | 200 |
| rows | max 4 |
| quote | 120 |

**Do not put rows and a media card on the same slide.** There is no room, and
the auto-fit pass will shrink the whole slide to compensate. Split it.

## Tokens

| | |
|---|---|
| Ground | `#F4F0E8` warm off-white |
| Accent | `#8A5A2B` — a muted bronze, not a signal colour |
| Display | Bodoni Moda 500, with 700 for the accent phrase |
| Body | IBM Plex Sans |

The accent here is deliberately quiet. In a theme this sparse, a saturated
accent is the only thing anyone sees, and the beam is already doing the
colour work.

## Composition

- Everything is centred except body paragraphs and rows, which stay
  left-aligned so they remain readable.
- One diamond divider per slide, at most. It is punctuation, not decoration.
- No cards, no chips, no hand-drawn marks except the circle on `cta`. A card
  would instantly be the loudest thing on the slide.

## What this theme is not for

List decks, tutorials, anything with more than four points per slide, or a
deck that needs to convey density and thoroughness. Use `notebook-tabs` for
those. This theme says "one idea, considered"; it cannot say "here are
fifty tools".
