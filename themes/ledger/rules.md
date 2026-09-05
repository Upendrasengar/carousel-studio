# ledger — theme rules

Graph-paper cream. A big serif index numeral, an entity card carrying real
stats, and two proof chips. Built for decks where every slide is a database
row.

## The mechanic

`entry` is the workhorse. It takes **data**, not design decisions:

```json
{ "type": "entry", "n": 2, "eyebrow": "Build",
  "headline": "The *$5,000* website.",
  "body": "It hands Claude the keyboard and builds the site while you watch.",
  "entity": {
    "name": "cline/cline", "logo": "typescript",
    "description": "Autonomous coding agent as an SDK, IDE extension or CLI.",
    "stats": [{ "value": "339", "label": "Contributors" },
              { "value": "66k", "label": "Stars" }],
    "bars": [{ "color": "#3178C6", "share": 88 }, { "color": "#F1E05A", "share": 12 }]
  },
  "chips": [["Repo", "66k stars"], ["Clients pay", "$5,000"]] }
```

`tally` closes the run. It reads `deck.entries.items` and totals them:

```json
"entries": { "items": [ { "name": "cline", "value": "$5,000" } ] }
```

`entries.items` and your `entry` slides are **two separate lists** — nothing
makes them agree. Keep them in step by hand, or the tally will confidently
total a set that does not match the slides the reader just saw.

## The card is the point

The stat row and the colour bar are literal copies of what a repository page
looks like. That authenticity is what stops the card reading as a designed
rectangle. Feed `bars` only ratios your source actually states; inventing
shares to make the stripe look nice is the one thing that breaks the effect.

## Copy

| Field | Budget |
|---|---|
| headline | 34 |
| body | 200 |
| entity description | ~110 (2 lines in the card) |
| chip label / value | 12 / 12 |

Two chips per slide, always: one is credibility (`66k stars`), one is the
payoff (`$5,000`). Same shape on every slide.

## Typography trap

The `Numeral` face is Bodoni, and Bodoni's hyphen, slash and thin strokes are
**hairlines that vanish at feed scale**. It is used for the big index only,
which is always digits. Stat values and the tally total deliberately use the
display face instead, because those carry `70-85%`, `$10/$50` and `5-30x`.

If you add a new numeric slot, use `Display`, not `Numeral`, unless you are
certain it will only ever hold digits.

## What this theme is not for

Arguments, processes, anything without per-item data. If your slides have no
figures to put in the card, the card is an empty box and the whole pack is
doing nothing.
