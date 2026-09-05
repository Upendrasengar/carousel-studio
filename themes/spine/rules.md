# spine — theme rules

A timeline rail that runs continuously across the whole deck.

## The mechanic

The rail is drawn at a fixed height — `railY` in `theme.json`, a share of
canvas height — and bleeds off **both** edges of every slide. Because
Instagram butts slides together with no gutter, slide N's line meets slide
N+1's exactly, and the reader sees one line rather than four.

```json
{ "type": "stop", "era": "2024", "headline": "the setup",
  "marks": [
    { "at": 18, "title": "First script", "note": "40 lines, ran nightly" },
    { "at": 62, "title": "First client", "now": true, "note": "$400/mo" }
  ] }
```

`at` is a percentage across the slide. `now: true` lights the dot and its
label; everything else sits at 45%.

**Do not move `railY` per slide.** That constant is the entire trick — one
slide with a different rail height and the continuity is gone, which is worse
than never having attempted it.

## Rules

- Two or three marks per slide. The rail needs empty run between stops or it
  stops reading as a line and starts reading as a list.
- Place at least one mark near `at: 5` or `at: 95` so the line clearly
  carries something across the join.
- Four to six `stop` slides. Long enough to feel like a journey, short enough
  that the reader reaches the end.
- The `era` label is optional and belongs on the slide where the period
  changes, not on every slide.

## What this theme is not for

Anything non-chronological. The rail promises sequence, and content that has
no sequence will fight it.
