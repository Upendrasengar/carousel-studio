# thread — theme rules

A dark terminal session that accumulates. **The only dark-first pack in the
set** — reach for it when the subject is a tool, a command, or a log.

## The mechanic

The session lives once on the deck:

```json
"session": { "title": "claude code — /watch", "items": [
  { "label": "step 1", "cmd": "/watch https://youtu.be/abcd",
    "out": ["resolving source…"] },
  { "label": "step 2", "cmd": "", "out": ["downloading  ████  100%"] }
]}
```

Each slide says how far it has got: `{ "type": "line", "upto": 2 }`.

Every slide replays the whole session, dims what already ran, and lights the
newest block with an accent rail. The reader watches a session **run** rather
than reading N screenshots of one.

## Rules

- Four to six `line` slides. Under four there is no sense of a session; over
  six the earliest blocks are unreadably dim.
- One new block per slide. Advancing two at once skips the thing the reader
  came to watch.
- Keep `cmd` under 62 characters — it is set in mono at 26px and does not
  wrap gracefully. Long URLs are the usual offender; shorten them.
- `out` lines are output, not narration. `downloading 100%` belongs there;
  "and then it downloads the file" belongs in the slide body.
- `label` is optional and works best as `step 1`, not as a sentence.

## Tokens

Ground `#0D1117`, accent `#4EE08A`. The accent is a terminal green on
purpose — it is the one colour that reads as "this actually ran".

`check.js` validates the `session`/`upto` pair: an out-of-range `upto`, a
`line` slide with no `session.items`, and a session whose tail is never shown
are all caught before you spend a render.

## What this theme is not for

Anything without commands. A dark terminal wrapped around marketing copy is
a costume, and readers who use terminals notice immediately.
