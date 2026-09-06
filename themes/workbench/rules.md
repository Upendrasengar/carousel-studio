# workbench — theme rules

Kraft paper, a black label chip, a two-line headline that turns red italic on
the second line, and a dark card taped to the page carrying the subject.

## Reach for it when

The reader is meant to **type what they see**. Setup guides, integration
walkthroughs, "here is the call that does it" — decks where the payload is a
file, a command or a wiring diagram, and the prose exists to say which part of
it matters.

It is the wrong pack for anything with nothing to type. Take the cards away
and this is a headline on brown paper. A roundup wants `catalogue` or
`datasheet`; an argument wants `spotlight-minimal`; a system you can only draw
wants `briefing`.

## The signature: a mark anchored to a token

Every other way of saying "look at line 7" needs the reader to do the
matching. Here the drawing lands on the token itself:

```json
"media": {
  "kind": "code", "title": "publish.py", "lang": "python",
  "lines": ["mcp.post_to_social(", "    media_urls=slides)"],
  "mark": { "line": 2, "token": "media_urls", "kind": "circle",
            "label": "plural = carousel" }
}
```

`token` must match **one whole token** as the highlighter sees it, which is
not always what you would say out loud — a quoted key is the token `'id'`,
including its quotes. A token that is not found **throws**. That is
deliberate: a mark that silently fails to draw leaves a slide whose copy
refers to an emphasis that is not there, and a stopped render is cheaper than
finding that in the feed.

One mark per card. Two marks and neither is pointing at anything.

`label` is the handwritten note, set on the paper *below* the card so the
card's own clipping cannot eat it.

## The two-line headline

Line one is ink in the heavy grotesque, line two is the accent in serif
italic. Split on a newline — there is no asterisk markup here, because the
accent is a whole line in a different face rather than a phrase inside one:

```json
"headline": "Instagram wants\na public URL"
```

One line loses the turn entirely. Three makes the italic a colour wash. Line
one should stand alone as a fragment so line two lands as the completion.

## Cards

| kind | Use |
|---|---|
| `code` | a source file — line numbers, syntax colour, an anchored mark |
| `terminal` | a session; commands in accent, output plain. Wraps, unlike code. |
| `graph` | `nodes` and `edges`, for the slides that show shape rather than syntax |

**Code does not wrap.** `white-space: pre` means an over-long line is clipped
by the card edge with no warning, so `codeLine` is a hard budget and
`check.js` errors on it. Short lines are also just better code.

Cards pad out to `codeMinLines` with empty numbered rows. That is not
decoration: the trailing numbers are what make the card read as a file rather
than a crop, and they are how it earns its half of the page.

## The aside

One quiet italic line that must say something the paragraph deliberately does
not — the caveat, the consequence, the thing you only learn on the second run.
An aside that restates the body is wasted ink in a second typeface.

## Forbidden

- **A third red thing.** The accent belongs to the second headline line and to
  the mark. Emphasis in body copy is weight, never colour.
- **A slide with no card and no rows.** That is a caption with nothing to
  caption.
- **More than five rows**, or more than `maxCodeLines` lines. The card does
  not scroll.
- **Inline `**bold**` or backticks in copy.** Neither is markup here —
  `*single asterisks*` set bold ink and everything else renders literally.
