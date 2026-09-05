# vintage-print — theme rules

Derived from the `DcgjCLukmDp` reference deck. Read this plus
`references/composition-rules.md`.

## What the system is

An aged-paper broadside. Condensed slab caps in a warm brick red, sepia grain,
a radiating sunburst bled off one corner, hairline rules instead of cards.

The distinguishing feature is not the styling. It is the **reveal** mechanic.

## The reveal mechanic

The step list lives **once**, at deck level:

```json
"reveal": {
  "title": "The loop",
  "subtitle": "Build a new AI expert in 5 minutes",
  "loopLabel": "loop",
  "steps": [
    { "title": "Open NotebookLM", "body": "add your best sources" },
    { "title": "Ask for a SKILL.md", "body": "based only on those sources" }
  ]
}
```

Each reveal slide names which step is lit:

```json
{ "type": "reveal", "step": 2 }
```

Every slide renders the whole list. The inactive steps drop to 34% and lose
their fill; the active one gets a card, a filled badge and the accent.

**Why it works.** The reader sees one diagram advancing rather than five
unrelated slides, so the deck reads as designed rather than assembled. It also
means the copy is written once, and the steps cannot drift out of sync.

**Rules**
- Light every step, in order. `check.js` warns on a gap or a jump, because a
  skipped step reads as a mistake rather than a choice.
- Three to six steps. Two is not a process; seven does not fit.
- Step bodies are one short line. They are read five times, so length hurts
  five times over.
- One reveal run per deck. Two runs and neither is the spine.
- Put a `hook` before the run and a `stat` or `quote` after it. A deck that is
  nothing but reveal slides is one slide shown six times.

This mechanic is portable. Any theme can adopt it by copying the `reveal`
slide type and its CSS — see `references/building-a-theme.md`.

## Tokens

| | |
|---|---|
| Ground | `#EFE7D6` aged paper, grain at 0.16 |
| Ink | `#241C14` |
| Accent | `#B03A12` brick |
| Display | Alfa Slab One, uppercase |
| Labels | Oswald 600, uppercase, wide tracking |
| Body | Courier Prime |

Alfa Slab is a **wide** face. Its headline size is 84px where the grotesque
themes run 104px, and the budget is 32 characters rather than 42. Do not copy
sizes between themes; copy the intent.

## Copy

| Field | Budget |
|---|---|
| headline | 32 |
| deck | 110 |
| body | 240 |
| row title | 38 |
| quote | 130 |

Headlines are set in caps, so they read about 15% wider than the same string
in sentence case. Write shorter than feels necessary.

Body copy is a typewriter face at 26px — it is deliberately slower to read
than the sans themes. Do not put a long paragraph in it.

## Marks and decoration

The sunburst is automatic and seeded; it needs no configuration and should not
be turned off. Beyond it: a bracket on `quote`, a circle on `cta`. Nothing
else. This theme's texture is already loud, and a hand-drawn arrow on top of a
sunburst on top of grain is three decorations arguing.

## What this theme is not for

Product screenshots as the subject, anything needing a light or modern feel,
or decks aimed at a corporate audience. The paper and slab read as zine, not
as report.
