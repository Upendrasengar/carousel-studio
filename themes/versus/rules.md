# versus — theme rules

A hard before/after split where the divider **moves** across the deck.

## The mechanic

```json
{ "type": "split", "at": 74, "headline": "Writing the first draft",
  "old": { "label": "Before", "title": "Two hours, blank page",
           "points": ["stare at it", "write three openings", "delete all three"] },
  "now": { "label": "After", "title": "Ten minutes, edit mode",
           "points": ["describe the shape", "argue with the draft"] } }
```

`at` is where the divider sits, 0–100. **Run it from high to low across your
split slides** — 78, then 62, then 44, then 26 — so the new side visibly takes
the frame over as the reader swipes.

That movement is the argument. A static before/after states a preference; one
that advances shows a takeover, and it costs nothing to render.

## Rules

- Three to five split slides. Fewer and the movement is not visible; more and
  the geometry stops being a surprise.
- Never start below 60 or end above 40. If the new side starts winning, there
  was no tension to resolve.
- Two to four points per side, and match the counts. An old side with five
  bullets against a new side with one is a strawman, and it reads as one.
- The old side is dark and the new side is light on purpose. Do not invert it
  to be clever — the reader is reading brightness before they read words.

## What this theme is not for

Anything without a genuine before. If the "old way" is a straw man you
invented for the slide, this format makes that obvious rather than hiding it.
