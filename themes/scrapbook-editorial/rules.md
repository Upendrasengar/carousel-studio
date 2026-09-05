# scrapbook-editorial — theme rules

Derived from the `DYkNONFkvkc` reference deck. Read this plus
`references/composition-rules.md`.

## What the system is

Cream paper with real grain. A serif display headline where exactly one phrase
turns orange and heavy. A taped kraft note in the margin, in typewriter caps.
Thin rules instead of cards. One hand-drawn arrow per slide, if it fits.

The margin note is the signature. It carries the aside the headline should not
have to make.

## The margin note

```json
{ "type": "point", "headline": "...", "note": "SIMPLE IDEA.\nREAL IMPACT.\nNO NEW TOOLS." }
```

Rotation and tape angle come from the deck seed, so a slide always lands the
same way while two decks differ.

**Rules**
- Write notes in caps. They are set in a typewriter face and lowercase reads
  as a bug.
- Under 90 characters, three short lines. It is a margin note, not a column.
- The note says something the headline does not. A note that restates the
  headline is wasted space with a shadow on it.
- Roughly half the slides should carry one. On every slide it stops being an
  aside; on one slide it looks like an accident.
- A slide with a note gives up a third of its headline width — that is
  automatic, but write the headline knowing it.
- Never on `quote` slides. The theme suppresses it there: a pull quote with a
  margin note beside it is two voices competing, which is exactly what the
  pacing slide exists to avoid.

## Tokens

| | |
|---|---|
| Ground | `#F3EEE2` cream, grain at 0.15 |
| Kraft | `#E4D6B6` for the note |
| Accent | `#B4400E` |
| Display | Playfair Display 700, with 900 for the accent phrase |
| Note | Courier Prime 700, uppercase |
| Body | IBM Plex Sans |

The accent phrase is not just recoloured — it steps up from Playfair 700 to
900. That weight jump is what makes it read as emphasis at thumbnail size,
where colour alone gets lost.

## Copy

| Field | Budget |
|---|---|
| headline | 38 |
| deck | 120 |
| body | 250 |
| note | 90 |
| quote | 140 |

Voice is editorial: plain declaratives, no hype, no "unlock" or "supercharge".
Headlines end with a period.

## Marks

One arrow per slide, placed in a corner, dropped automatically when content
fills the slide. Plus an underline on `hook` and a circle on `cta`.

Do not add marks by hand. The theme places them, and the whole point of the
collision guard is that it decides when there is no room.

## What this theme is not for

Dense lists over five rows, product screenshots as the subject, or anything
that needs to feel current rather than crafted.
