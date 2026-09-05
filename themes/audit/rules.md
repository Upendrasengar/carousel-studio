# audit — theme rules

A dense three-column reference card. Waste on the left in red, the numbered
pipeline down the middle, the clean result on the right in green, a summary
strip along the foot.

## What this pack is for

**This is the opposite of every other theme in the set.** They put one idea on
a slide. This puts a whole system on one, because that is the format people
screenshot and keep rather than swipe past.

Use it for the slide someone would print and pin up: an audit, a checklist, a
pipeline, a "here is the whole thing on one page".

## The `flow` slide

```json
{ "type": "flow",
  "headline": "The full\ncontext\nstack",
  "subline": "Fix these 7 leaks",
  "pattern": { "title": "The pattern", "a": "Better context", "b": "fewer wasted tokens" },
  "left":  { "label": "High token waste", "items": [{ "icon": "search", "title": "Search everything",
             "body": "Unstructured search pulls too much." }],
             "result": ["Bloated context.", "High cost.", "Slower."] },
  "mid":   { "label": "The pipeline", "steps": [{ "icon": "code-2", "title": "Structured code search" }] },
  "right": { "label": "Lean context", "items": [ … ], "result": ["Lean context.", "Faster."] },
  "bottom": { "line": "7 leaks fixed. 1 system optimised.",
              "chain": ["Code search", "Model router", "CLI filter"] } }
```

**The three columns must line up one-to-one.** Left item *n*, pipeline step
*n* and right item *n* are the same leak, its fix, and its result. A reader
scans across, not down. Mismatched counts break the whole device, which is why
`check.js` errors on it.

Five to seven rows. Under five is not a system; over seven and the type drops
below readable at feed scale.

## The `compare` slide

The before/after pair with a saving badge on the seam between them:

```json
{ "type": "compare", "headline": "Make it\nsay *less*",
  "checklist": ["Long preambles", "Huge comments"],
  "bad":  { "label": "Default verbose", "value": "~3,000 tokens", "notes": ["Costs more."] },
  "good": { "label": "Concise mode", "value": "~1,000 tokens", "notes": ["Saves tokens."] },
  "badge": "~65%", "badgeLabel": "fewer output tokens",
  "rule": "output_mode: concise",
  "bottom": "Default to short. Expand only when you ask." }
```

The badge is the slide's whole claim, so it sits **on the seam**, not beside
it. Make it a real measured number or leave it out — a made-up percentage in a
circle is the fastest way to lose a technical audience.

## The thing to know about density

`flow` is **not** auto-fitted. It renders absolutely positioned at token sizes
and the fit pass skips it, because growing type would break the column grid
and density is the design.

That means **`flow` has no overflow protection**. If you overrun the row
budgets it will clip rather than shrink, and nothing will warn you. Stay
inside the budgets:

| Field | Budget |
|---|---|
| cell title | 22 |
| cell body | 62 |
| step title | 26 |
| column label | 22 |
| rows per column | 7 max |

Every other slide type in the pack is fitted normally.

## What this theme is not for

Narrative, argument, anything with a sequence the reader is meant to follow
slide by slide. A reference card has no swipe rhythm — it is one destination.
Put at most one `flow` in a deck and let the surrounding slides do the
storytelling.
