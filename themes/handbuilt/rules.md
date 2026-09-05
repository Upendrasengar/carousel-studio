# handbuilt — theme rules

A warm cream zine for build logs — "I made this myself, here is how".

## The four elements

A `build` slide usually carries three of these four:

**The headline** — condensed caps, split on a newline. Line one is ink, line
two is the accent with a hand-drawn underline beneath it. The underline is
what stops the accent line reading as merely a different colour, so always
write two lines.

**The note** — a white mono card holding the actual explanation:

```json
{ "type": "build",
  "headline": "One repo.\nFour moving parts",
  "note": ["1 · a vault it reads for context",
           "2 · a renderer for the images",
           "3 · a checker that refuses bad output"],
  "aside": "no chat window anywhere", "asideSide": "left",
  "mascot": "working", "prop": "server" }
```

**Note lines do not wrap.** They are set `nowrap` on purpose, so a long line
is clipped rather than reflowed into a paragraph. Keep each under about 40
characters — the budget is 130 for the whole card, but per-line length is what
actually bites.

**The character** — the shared pixel mascot recoloured orange, with an
optional `prop` for a scene.

**The aside** — a handwritten line with an arrow. This is the voice of the
pack: the builder talking over their own slide. It must say something the note
card deliberately does not. An aside that restates the note is wasted ink at a
jaunty angle.

## Rules

- One aside per slide, at most, and not on every slide. Roughly half.
- `asideSide` alternates naturally; set it explicitly when a slide's content
  leans one way.
- Asides are tagged as decoration, so the collision guard drops one that would
  print through the note. If yours disappears, the slide is too full — cut the
  note, do not move the aside.
- `tiles` is for naming what the thing connects to. Three to five marks. It is
  a claim about your stack, so only list what you actually run.

## Tokens

| | |
|---|---|
| Ground | `#F5F0E8` warm cream |
| Accent | `#E85615` |
| Display | Oswald 700, uppercase |
| Notes | JetBrains Mono |
| Asides | Caveat |

## What this theme is not for

Anything you did not build. The whole register is first-person craft — "I made
this, here is the folder" — and it reads as false immediately when applied to
a product roundup or someone else's work. Use `swap` or `ledger` for those.
