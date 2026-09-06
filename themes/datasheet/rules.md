# datasheet — theme rules

Warm technical paper with an ink-blue rule. Every entry is the same form
filled in, and the last field is a numbered recipe.

## Why this pack exists

A round-up is a scroll. A round-up where every entry ends in *do this* is a
save. That is the whole difference, and it is the reason to reach for this
pack over any other list theme in the studio.

The sameness is the mechanic, not laziness. Three fields in a fixed order on
every slide means that by slide three the reader has stopped parsing layout
and started reading value. Vary the shape per entry and you spend the reader's
attention on navigation instead.

## The `entry` slide

```json
{ "type": "entry", "n": 1,
  "name": "Instagram", "logo": "instagram", "to": "INSTAGRAM",
  "does": "Publishes a 2-10 slide carousel, stills or video, from one deck.",
  "why": "The carousel is the format people *save*. This ships it without a phone.",
  "how": ["create_upload_url -> stage each PNG",
          "post_to_social with media_urls",
          "get_recent_posts to read it back"],
  "doodle": "image",
  "punch": "*Media is required.* Public HTTPS only - a local path will not post." }
```

| Field | Required | Notes |
|---|---|---|
| `name` | yes | The thing being connected to. Sets the wire's right label unless `to` overrides it. |
| `logo` | — | A Simple Icons name. Falls back to `icon`, then to a link glyph. |
| `n` | — | Position in the connector run. Defaults to order of appearance among `entry` slides. |
| `from` / `to` | — | The wire's two ends. `from` defaults to `deck.wireFrom`. |
| `does` / `why` | yes in practice | The two prose fields. A slide missing one is a visible hole. |
| `how` | yes | 2-4 steps. Past four it is a tutorial, not a card, and the render throws. |
| `doodle` | — | A faint line drawing watermarked into the recipe box, behind the steps. |
| `punch` | — | The closing line. `*asterisks*` set bold ink, not accent. |

## Deck level

```json
{ "wireFrom": "CLAUDE", "unit": "Connector",
  "labels": { "does": "What it does", "why": "Why it's useful", "how": "How to connect" },
  "chips": [ { "logo": "instagram", "label": "Instagram" } ] }
```

`chips` is the closing mechanic. It lives once on the deck, so the hook and
the CTA cannot disagree about what the deck contains — the set that comes back
at the end has to be the set that was promised at the start.

`labels` exists because the recipe is not always a setup. When the steps are
calls rather than clicks, say so — `"how": "How to post"` — rather than
labelling a call sequence as a connection flow.

## Forbidden

- **An entry without a recipe.** That is a list with extra chrome. Use
  `catalogue` or `manifest`.
- **Entries that are not comparable.** The fixed schema only pays off if the
  same three questions are worth asking of every item.
- **A second accent.** The filled `What it does` pill and the wire's live pin
  are the accent's whole budget on an entry slide. Bold ink carries emphasis
  inside the prose.
- **More than four steps**, enforced at render time rather than left to taste.

## Not this pack

- `index-rail` — its entry ends in a **link**, and its browser card is the
  device the layout is built around. Use it when every item has a URL.
- `manifest` — its row ends in a **metric**. Use it when the comparison is a
  number, not an instruction.
- `catalogue` — continuous numbering across the deck, ten entries to a page.
  Use it when the count is the point and the entries need one line each.
- `briefing` — one drawn exhibit per slide. A fixed field schema is not an
  exhibit.
