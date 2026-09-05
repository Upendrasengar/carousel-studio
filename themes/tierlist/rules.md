# tierlist — theme rules

A ranking board that fills in one item per slide.

## The mechanic

The board lives once on the deck:

```json
"board": {
  "tiers": ["S", "A", "B", "C"],
  "items": [
    { "name": "Claude Code", "tier": "S", "note": "the only one I'd pay for twice" },
    { "name": "Cursor", "tier": "A", "note": "great until the context runs out" }
  ]
}
```

Each slide names how many have been placed: `{ "type": "tier", "upto": 2 }`.

Every tier row is always drawn, even when empty — an empty S tier is
information, and a tier that only fills on the last slide is the payoff.
The newest card is the only lit one; that is the slide's news.

## Why this format

Tier lists travel by DM, and DM shares are the most heavily weighted signal
there is. People send them to disagree. Put the contentious placement late:
the board has to be worth arguing with by the time it is finished.

## Rules

- Five to eight items. Fewer is not a ranking; more is a list.
- Every item needs a `note`. The placement is the hook, the reason is the
  content, and a board with no reasons is bait without substance.
- Never place items in tier order. Going S, S, A, A, B is a countdown, not a
  reveal — mix it so the reader cannot predict the next slot.
- Do not rank things you sell. A tier list with your own product at S is an
  advert, and readers spot it instantly.

## What this theme is not for

Tutorials, processes, anything where the content is not comparative. If the
items do not compete with each other, there is nothing to rank.
