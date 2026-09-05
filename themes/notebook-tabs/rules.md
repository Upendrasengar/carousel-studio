# notebook-tabs — theme rules

Derived from the `Db_GqlYkqal` reference deck. Read this plus
`references/composition-rules.md`.

## What the system is

Everything sits inside an inset paper card with a file-tab strip along the
top and a slide chip in the corner. The card is a frame, and a frame is what
lets this theme carry more rows than any other pack without feeling loose.

**This is the list-deck theme.** Reach for it on "50 MCP servers", "12 tools",
"the 8 folders" — anything where density is the point.

## The tab strip

The tabs double as a progress indicator: the tab matching the current slide
rides higher and takes full colour, the rest sit back at 42%. This is
automatic — there is nothing to configure, and nothing to switch off.

It caps at five tabs regardless of deck length, and cycles. Do not read it as
an exact slide counter; the chip beside it already does that job precisely.

## The callout

A tinted box pinned to the foot of the card:

```json
{ "callout": "Pin versions. Start read-only.", "calloutIcon": "alert" }
```

**Rules**
- One per deck, maybe two. It is the "read this before you act" box, and its
  authority comes from being rare.
- Under 110 characters. It sits below the content box and does not grow.
- Use it for a caution or a precondition, never for an extra bullet. If it
  would work as a row, make it a row.

## Tokens

| | |
|---|---|
| Ground | `#E7DCCA` |
| Card | `#FDFAF4`, 2px rule, 26px radius, inset 66px |
| Accent | `#B8410F` |
| Display | Playfair Display 700, 900 for the accent phrase |
| Body | IBM Plex Sans |

The mascot peeks over the card's **top-right corner**, half outside it. That
overlap is what makes the card read as a physical object on the page rather
than a coloured rectangle. Do not move it fully inside.

## Copy

| Field | Budget |
|---|---|
| headline | 34 |
| deck | 110 |
| body | 220 |
| row title | 32 |
| row body | 90 |
| rows | max 6 |

Six rows is the highest ceiling of any pack, and it is still a ceiling. Rows
here are `title` + one line: the title is the thing, the body is why it earns
a place on the list. A row with three lines of body belongs on its own slide.

Headlines are shorter here than in the sparse themes, because the card eats
width on both sides. 34 characters is real.

## What this theme is not for

A single big idea, an emotional hook, or anything where the frame would feel
bureaucratic. A one-line manifesto inside a bordered card reads as a form.
Use `spotlight-minimal` or `scrapbook-editorial` for those.
