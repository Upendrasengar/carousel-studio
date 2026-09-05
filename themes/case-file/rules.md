# case-file — theme rules

A manila dossier where redaction bars lift as you swipe.

## The mechanic

The facts live once on the deck, with the withheld ones marked:

```json
"file": { "stamp": "Confidential", "facts": [
  { "key": "Subject", "value": "Claude Code" },
  { "key": "Monthly cost", "value": "$0 on the free tier", "redacted": true },
  { "key": "The catch", "value": "context, not credits", "redacted": true }
]}
```

Each slide names which numbers it declassifies:

```json
{ "type": "file", "declassify": [2] }
```

Facts not yet declassified render as a solid black bar. Lifting one is the
only news a file slide has, so lift **one per slide**.

## Rules

- The mechanic is withholding, which means it only works if what is under the
  bar earns the wait. A redacted line that turns out to be obvious is worse
  than no redaction at all — the reader feels tricked, and they remember.
- Two to four redactions. Every line blacked out is a wall, not a document.
- Redact the *answer*, never the question. `Monthly cost: ████` is a hook.
  `████: $0` is a puzzle nobody asked for.
- One stamp per deck. It is a texture, not a label.

## Tokens

Typewriter throughout, on manila `#D9CDA9` with the grain pushed to 0.2 —
this pack is the most textured of the set on purpose. Headline budget is 44
rather than 36, because a monospace face at this size fits more.

## What this theme is not for

Anything upbeat, and anything where you have nothing to withhold. Forcing the
redaction mechanic onto content that has no secret is the fastest way to make
a deck feel like a gimmick.
