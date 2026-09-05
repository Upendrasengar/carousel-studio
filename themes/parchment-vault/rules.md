# parchment-vault — theme rules

Derived from the `DYmyTZfkqC0` reference deck. Read this plus
`references/composition-rules.md`.

## What the system is

Kraft parchment with heavy grain. A two-line serif headline where the second
line turns purple and italic. A chevron badge marking the start of it.
Screenshots in a purple-chromed window. A torn margin note.

## The two-line headline

This theme's headline **splits on a newline**, and the split is the design:

```json
"headline": "Eight folders.\nThat is the whole thing."
```

Line one is ink. Line two is purple italic. That is where the emphasis lives.

**Rules**
- Always two lines. A single-line headline loses the mechanic and the slide
  looks unfinished.
- Line one states the fact; line two turns it. `"Your notes do not" / "do
  anything."` — the turn is the payoff.
- The budget is 52 characters for **both lines together**, including the
  newline. That is short. It has to be.
- `*asterisk*` emphasis still works and still renders purple, but you rarely
  need it: line two is already the accent.

## The torn note

```json
{ "note": "Build the vault like a business, not like a brain." }
```

The ragged top edge is a seeded clip-path, so every note tears differently
while the same deck tears identically on every render. Sentence case here,
unlike scrapbook-editorial's typewriter caps.

Same discipline as any margin note: under 90 characters, says something the
headline does not, on roughly half the slides, never on `quote`.

## The character

The reference deck used licensed cartoon cut-outs. **Those are not shippable
on a brand account.** This pack uses the shared pixel mascot recoloured to the
theme's purple via `mascotPalette` in `theme.json`, which overrides the body,
highlight, shadow and the prop colours — otherwise a blue wizard hat ends up
on a purple body.

If you replace it with your own character, keep it original. Do not put the
reference deck's characters into anything you post.

## Tokens

| | |
|---|---|
| Ground | `#E9DFC6` kraft, grain at 0.16 |
| Accent | `#5B34A6` violet |
| Display | Playfair Display 700, italic for line two |
| Note | Courier Prime 400 |
| Body | IBM Plex Sans |

Window chrome on terminal and screenshot cards is the accent, not grey. That
is what makes a product shot read as part of the system rather than pasted
onto it.

## Scenes

The character supports `prop` and `dressing` — see the scene section in
`references/deck-schema.md`. Props keep their own palette, so a purple mascot
stands next to a normally-coloured monitor rather than a purple one.

## Copy

| Field | Budget |
|---|---|
| headline | 52 across two lines |
| deck | 110 |
| body | 230 |
| row title | 32 |
| note | 90 |
| quote | 130 |

Quotes are set in the italic, which is beautiful and slower to read. Keep them
under 130 characters and do not use the italic for anything longer.

## What this theme is not for

Anything needing urgency or a modern-product feel. The parchment and violet
read as considered and archival — good for systems, workflows and methods;
wrong for launches and news.
