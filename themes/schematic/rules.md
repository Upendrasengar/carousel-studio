# schematic — theme rules

A technical drawing that zooms in as you swipe.

## The mechanic

Each `detail` slide is a plate with numbered callout leaders. The `zoom` box
marks the region the **next** slide will enlarge:

```json
{ "type": "detail", "plate": "Fig. 2 — the agent loop",
  "dim": "one request, four hops",
  "callouts": [
    { "n": 1, "x": 12, "y": 20, "text": "prompt enters with the tool list" },
    { "n": 2, "x": 58, "y": 44, "text": "model picks a tool" }
  ],
  "zoom": { "x": 50, "y": 34, "w": 40, "h": 30 } }
```

Naming the zoom region on slide N and opening on it in slide N+1 is what
turns a set of diagrams into an exploded view. Without it you have four
unrelated figures.

## Rules

- Two to four callouts per plate. Leaders crossing each other is how a
  drawing stops being readable.
- Number callouts continuously across the deck — 1, 2 on plate one, 3, 4 on
  plate two. Restarting at 1 breaks the sense of one drawing.
- Every `zoom` must be honoured. A dashed box promising a detail that never
  arrives is worse than not drawing it.
- `x`/`y` are percentages of the plate. Keep callout text under 60 characters
  or the leader runs off the plate.

## Tokens

Cyan `#4FD1E0` on navy `#0B2136` with a 54px plotted grid. This is the second
dark pack, and the only one where the grid is structural rather than texture.

## What this theme is not for

Anything without a real structure to draw. A schematic of something that has
no parts is a diagram of nothing, and the format makes that painfully clear.
