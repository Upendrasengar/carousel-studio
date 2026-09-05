# catalogue — theme rules

A paginated directory: ten items to a page, grouped into categories, with a
tag on every card. The format for "N tools, M categories" maps.

## Why this pack exists

It is a **reference, not a read**. People save a catalogue because they intend
to come back and pick something off it, which is why it earns saves that a
narrative deck does not. Write it to be scanned, not followed.

## The `page` slide

```json
{ "type": "page", "n": 1, "of": 4,
  "category": "Growth",
  "headline": "Marketing & Sales",
  "deck": "Research prospects, run the CRM and mine your growth data.",
  "items": [
    { "logo": "hubspot", "name": "HubSpot", "tag": "CRM",
      "body": "Contacts, deals and tickets.", "bestFor": "Inbound sales" }
  ] }
```

## Continuous numbering — the one mechanic

Item numbers run across the **whole deck**, not per page: 01–10 on page one,
11–20 on page two. They are computed from the pages before, never written by
hand, so inserting a page renumbers everything below it and the count can
never drift from the list.

That also means **you cannot renumber by editing a field** — reorder the pages
and the numbers follow.

## Rules

- **Ten items a page.** The grid is 2 × 5. Fewer looks sparse against the
  height floor; more will not fit and the fit pass will shrink the whole page
  rather than reflow it.
- Every item needs all five fields. A card missing `bestFor` or `tag` is
  visibly shorter than its neighbours and the grid stops reading as a table.
- `tag` is one word, twelve characters at most. It is a filter label, not a
  description — `CRM`, `VECTOR`, `EMAIL`.
- `bestFor` is the *use case*, not a repeat of the description. `body` says
  what it does; `bestFor` says who should reach for it.
- **Four to six pages.** Under four is a list, not a map; over six and nobody
  reaches the end, so the categories at the back are wasted.
- Order categories by how likely a reader is to want them, not alphabetically.
  Page two is the backup hook.

## Missing brand marks

`logo` resolves against the vector set first, then the colour fallback, then
an initial in a tinted tile. For a catalogue that names forty tools you will
hit gaps — fetch the missing ones with:

```bash
node scripts/get-brands.js pinecone:pinecone.io weaviate:weaviate.io
```

A tile of initials among thirty-nine real marks is the one thing that makes a
directory look unfinished.

## Tokens

| | |
|---|---|
| Ground | `#FAF7F3` warm cream |
| Accent | `#DB512C` — the category label, the item number, the tag |
| Cards | white, 16px radius, shadow rather than border |
| Grid | 2 × 5, floor at 62% of canvas height |

## What this theme is not for

An argument, a process, or anything with fewer than about twenty items. A
catalogue with twelve entries should be one `notebook-tabs` list slide, not
two pages of a map.
