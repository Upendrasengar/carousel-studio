# manifest — theme rules

A counted taxonomy on near-black. A total splits into colour-coded categories,
one slide each, and every row carries a hard metric on the right.

## Why this pack exists

The saveable version of a list is one that **states its own shape**. "30
things" is a number you can hold; "30 things in five groups, and here is how
many are in each" is a map. The taxonomy chips on the hook let a reader decide
to swipe before they have read a single entry, and the same chips on the CTA
prove the deck delivered what it promised.

The metric is the second half of that contract. A row that says only what a
thing is belongs in `catalogue`. A row here earns its place by carrying a
figure — stars, installs, hours saved, cost — that a reader can compare
against the row above it.

## The `group` slide

```json
{ "type": "group", "n": 1, "category": "Harness",
  "icon": "wrench",
  "deck": "The setup that decides *before* it types.",
  "items": [
    { "name": "superpowers", "body": "*Plans and debugs* before it writes.",
      "metric": "+270.7k" }
  ] }
```

`n` is the category's position, and it picks the hue. `logo` works in place of
`icon` when the category has a real brand mark.

## The three mechanics

**Numbering restarts per category.** 01–06 on every group slide. This is the
deliberate opposite of `catalogue`, whose continuous 01–10, 11–20 numbering is
its declared signature. Reach for catalogue when the reader's question is "how
far through the list am I"; reach for manifest when it is "how big is *this*
category".

**Every row ends in a metric.** Enforced by convention, not by the validator:
a row without one still renders, and looks like a gap in a column of figures.
If half the rows have no number, the deck is a catalogue.

**Each category owns a hue.** It drives the icon tile, the row rail, the row
numbers and the metric chips — everything on that slide. This is the one place
this pack overrides the studio's *one loud element per slide* rule, and it
only holds because the hue changes per slide rather than per element. Five
hues ship in `catHues`; a sixth category reuses the first.

## Forbidden

**Do not mix hues inside one group slide.** The moment two categories' colours
share a slide, the colour stops meaning "category" and becomes decoration.

**Do not put more than six rows on a group slide.** The layout is built for
five or six. More does not shrink gracefully — it drives the auto-fit floor
and the metric chips start colliding with the body text.

**Do not use this for a narrative.** There is no argument here, no before and
after, no build-up. It is a reference. If the slides need to be read in order
to make sense, the content wants `spine` or `vintage-print` instead.

**Do not animate the group slides in a deck bound for LinkedIn or Facebook.**
Neither accepts video in a carousel. The PNG beside every MP4 is mandatory —
never delete it.

## Motion

Rows cascade in top to bottom, land by ~34% of the cycle and hold. Mark the
slides that should move with `"animate": true` and render with `--animate`.

The stagger ladder is six deep because six is the row cap. A seventh row would
inherit the sixth's delay and arrive alongside it.
