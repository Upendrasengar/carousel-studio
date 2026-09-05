# killlist — theme rules

Navy editorial on a faint grid. Every row is a pair: the thing on the left,
the specific bad thing it kills on the right.

## Why this pack exists

**It is not `swap`.** `swap` compares two products. This is item + its
negation — each row carries its own *before*, so five fixes read as five
arguments rather than five bullets.

Reach for it on "N things that stop X", "N defaults to override", "N rules
that fixed Y". If your items have nothing they replace, use `catalogue` or
`notebook-tabs` instead; the empty right-hand panel is worse than no panel.

## The `kills` slide

```json
{ "type": "kills", "n": 1, "of": 2, "category": "5 defaults in the layout",
  "headline": "Fix the *layout* first.",
  "deck": "Each of these is a rule that removes one specific bad habit.",
  "items": [
    { "name": "fill-the-frame", "slug": "rule/min-fill",
      "body": "Grows type until content reaches the fill target.",
      "kills": "The slide that is two thirds empty paper." }
  ] }
```

Numbering runs across the **whole deck**: page one is 01–05, page two picks up
at 06. Computed from the pages before, never written by hand, so inserting a
page renumbers everything below it.

## The rules that make it work

- **Five items a page.** The rows stretch to fill a height floor; four looks
  padded, six will not fit.
- **`kills` is the point of the row.** Write it before you write `body`. If
  you cannot name the specific bad thing, the item does not belong in this
  deck.
- **`kills` names a behaviour, not a category.** `"Unlock, supercharge,
  game-changer"` works. `"Bad writing"` does not — the reader has to recognise
  it instantly or the row does nothing.
- **Keep `kills` under 56 characters.** It sits in a narrow inset panel at
  about 40% of the row width and does not get much room.
- **`slug` is optional and should look like a path** — `rule/min-fill`,
  `check/budgets`. It signals the thing is real and addressable. Invented
  slugs are worse than none.
- Two to three `kills` pages. Past fifteen items the negations start repeating
  and the device wears out.

## Tokens

| | |
|---|---|
| Ground | `#0A1728` navy on a 60px grid |
| Accent | `#4A9EFF` — headline emphasis, active dot, numbers |
| Kill | `#F1626A` — the `KILLS` label only, never body text |

The red is deliberately confined to the four-character label. Used on the
sentence beneath it, the row reads as an error message rather than a fix.

## What this theme is not for

Processes, comparisons, catalogues. And anything positive-only — the whole
frame is "here is what this removes", so a deck with nothing to remove will
fight it the entire way.
