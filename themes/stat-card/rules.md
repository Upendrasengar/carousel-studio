# stat-card — theme rules

Each slide is a collectible card. A deck is a set.

## The mechanic

```json
{ "type": "card", "name": "Playwright", "rarity": "legendary",
  "body": "Gives Claude a real browser it can click, fill and screenshot.",
  "stats": [
    { "label": "Setup", "value": "2 min", "pct": 90 },
    { "label": "Power", "value": "9/10", "pct": 90 },
    { "label": "Risk", "value": "medium", "pct": 50 }
  ],
  "flavour": "The one that turns a chatbot into an operator." }
```

Rarity is `common`, `rare`, `epic` or `legendary`, and it drives the frame
colour, the glow and the badge.

**Rarity is the only thing that varies between cards.** That restraint is what
makes nine slides read as one series rather than nine unrelated designs. Do
not also change the layout, the stat count, or the frame per card.

## Rules

- Three stats per card, the same three labels on every card. A set where the
  cards measure different things is not a set.
- `pct` drives the bar; keep it honest against `value` or the bars become
  decoration and the reader stops trusting them.
- At most one `legendary` per deck. Rarity that is common is not rarity, and
  a deck of legendaries makes the whole scale meaningless.
- The `flavour` line is the shareable part. Write it last, and write it like
  a line someone would quote.

## Why this format

A set invites completion. People screenshot the whole run to keep it, and
argue about the rarities — which is a save and a DM from one deck.

## What this theme is not for

Processes, arguments, anything sequential. Cards are parallel by nature: if
slide 4 only makes sense after slide 3, this is the wrong pack.
