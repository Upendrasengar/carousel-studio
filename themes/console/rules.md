# console — theme rules

Near-black with an amber glow. A two-tone serif headline, a wireframe node
graph as the standard visual, and a capability bar that advances along the
bottom.

## The two mechanics

**1. The node graph** is the pack's default visual — `wire` slides are
expected to diagram something, not decorate:

```json
{ "type": "wire", "headline": "Memory\nWithout context bloat",
  "graph": {
    "nodes": [
      { "id": "raw", "x": 10, "y": 22, "label": "Raw notes", "note": "md, pdf", "icon": "file-text" },
      { "id": "db",  "x": 68, "y": 22, "label": "Supabase", "kind": "hub", "logo": "supabase" }
    ],
    "edges": [ { "from": "raw", "to": "db", "label": "embed", "dashed": true } ]
  } }
```

`x`/`y` are percentages of the graph box and are the node's **centre**.
`kind` is `default`, `hub` (bigger, full accent, heavier glow) or `ghost`
(dimmed — for the part you are not talking about yet). Edges take `label`,
`dashed` and `live`.

Edges route as elbows, not straight lines. A circuit reads as deliberate; a
spider-web of diagonals reads as an accident.

**2. The capability bar** names the parts of the build once and lights the
one you are on:

```json
"rail": { "items": [ { "label": "Harness", "icon": "cpu" },
                     { "label": "Memory",  "icon": "database" } ] }
```

Each slide sets `"railAt": 2`. It is a progress indicator and a table of
contents at the same time — the reader always knows where they are and what
is still coming.

## Rules

- Four to six rail segments. Two is not a build; seven does not fit the width.
- Every slide should set `railAt`, including the hook and the cta. A slide
  with the bar unlit looks like a rendering fault.
- Three to six graph nodes. Past six the labels collide, and the diagram
  stops being readable at feed scale.
- One `hub` per graph. Two hubs and neither is the centre.
- Keep node `label` under about 16 characters and `note` under 22 — nodes do
  not wrap, they just get wider and overlap their neighbours.

## The headline

Splits on a newline: line one in ink, line two in amber. Always write two
lines — a single-line headline loses the device and the slide looks unfinished.

## What this theme is not for

Anything without a structure to draw. The pack promises a diagram on every
content slide, and a `wire` slide with no real graph is an empty promise the
reader can see.
