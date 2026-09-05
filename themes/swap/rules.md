# swap — theme rules

Paid-versus-free comparison cards. Built for "N tools I stopped paying for".

## The `swap` slide

Every part of it is data:

```json
{ "type": "swap", "n": 3,
  "paid": { "name": "Zapier", "logo": "zapier", "price": "$49 / mo", "score": 80,
            "desc": "Easy automation. Priced per task, which adds up fast." },
  "free": { "name": "n8n", "logo": "n8n", "price": "$0 / mo", "score": 94,
            "desc": "Powerful workflows, self-hosted." },
  "tagline": "Automate anything. *Pay nothing.*",
  "features": [{ "icon": "infinity", "title": "No task limits", "body": "Self-hosted means unmetered." }],
  "winner": "free", "saves": "$49/mo" }
```

Write the JSON and the slide assembles itself. That is what makes a fifteen
item deck tractable rather than fifteen design jobs.

## Rules

- **Exactly three features** — the strip is a three-cell grid. They are the
  *free* tool's selling points for that specific comparison, and they change
  from swap to swap. The reference deck runs `OWN YOUR DATA / NO LIMITS /
  PRIVATE & SECURE` against Dropbox and `REAL-TIME COLLAB / INFINITE CANVAS /
  FAST & MINIMAL` against Miro. Do not try to hold three fixed axes across the
  deck — that is `stat-card`'s job, not this one.
- **Scores must be defensible.** A number out of 100 reads as measured. If you
  are eyeballing it, say so in the caption or drop the verdict card.
- The free side does not always win. A deck where the free tool wins every
  time is an advert, and readers spot it by slide four. The reference deck
  this came from scores Figma 96 and its free rival 74, and still swaps.
- **Screenshots are the substance.** Set `paid.shot` / `free.shot` to real
  images where you have them. Without one the slide falls back to a large logo
  tile — deliberately, because an empty frame reads as broken — but a tile is
  a placeholder, not a product shot.
- `saves` is the payoff. Keep it in the same unit across the deck so the
  totals slide can add them up honestly.

## The three supporting types

**`cover`** — a logo cloud built from the deck's own swap slides, around a
split `FREE / PAID` headline. It reads the brands off the swaps, so it can
never drift out of sync with what the deck compares.

**`receipt`** — the subscriptions adding up, itemised with a total. Use it as
slide 2: the argument is that small charges accumulate, so show them
accumulating rather than asserting it in a bullet.

**`quote`** — a filled accent card with the deck's logos muted along its foot.

## Tokens

| | |
|---|---|
| Ground | `#F6F4FE` lavender |
| Accent | `#5B4BE8` |
| Paid | `#D63A5A` on `#FDEAEE` |
| Free | `#1E9E63` on `#E6F6EE` |

Red for paid and green for free is doing real work — the reader parses colour
before they parse the price. Do not invert it.

## What this theme is not for

Anything that is not a genuine like-for-like comparison. If the two things do
different jobs, the scores are meaningless and the format makes that obvious.
