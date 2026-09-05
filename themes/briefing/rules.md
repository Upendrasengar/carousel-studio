# briefing

An inset paper card on a warm grey ground. Every slide carries one drawn
exhibit — a flow, a cycle, a transcript, a record or a table — framed by a
kicker, a two-tone headline and one standfirst. One terracotta against
neutrals, and nothing else.

## Reach for it when

The deck has to **show a system**, not list things. How something works, where
data goes, why a process loops back on itself, what a record actually contains.
The kind of post where the honest answer to "what does this look like" is a
diagram, and where a stock illustration would be a lie.

It is the wrong theme for a ranking, a roundup of links, or a list of tools —
those want `tierlist`, `index-rail` and `catalogue`. A briefing slide with no
exhibit on it is a paragraph in an expensive frame.

## The two-tone headline

Line one takes the accent, line two the ink. Split with a newline:

```json
"headline": "You are the\nproduct being sold."
```

This is the pack's signature and it only works on **two lines**. One line
loses the device entirely. Three makes the accent a colour wash rather than
an emphasis, and the fit pass will shrink the whole slide to fit it.

Write the turn deliberately. Line one should be able to stand alone as a
fragment — "It is not", "Rendering clean", "One file in," — so the second line
lands as the completion. A break in the middle of a noun phrase reads as a
typesetting accident.

## The vertical budget

An exhibit owns roughly **500 of the 900 pixels** the content column has. What
is left is fixed, and the copy has to fit it:

| Band | Ceiling |
|---|---|
| kicker | one line, 34 chars |
| headline | two lines, 44 chars |
| standfirst (`deck`) | two lines, 112 chars |
| exhibit | ~500px, drawn from data |
| closing line (`body`) | two lines, 165 chars |

A third line of standfirst costs the exhibit 50px, and exhibits do not shrink —
their geometry is in pixels so the dotted connectors stay circular. The fit
pass will shrink the *copy* to compensate, which is the wrong thing getting
smaller. Cut the standfirst instead.

Not every slide needs the closing line. Use it when the exhibit needs a verdict
and leave it off when the exhibit already says it.

## The exhibits

`slide.exhibit.kind` picks one. All five are drawn from data — no screenshots,
no network, no measurement pass — so a deck renders offline and identically
every time.

| kind | Use it for | Shape |
|---|---|---|
| `fan` | many-to-one-to-many | `leftLabel`, `rightLabel`, `hub`, `left[]`, `right[]` |
| `loop` | a cycle that does not end | `label`, `nodes[{title, note}]` |
| `chat` | a prompt and what came back | `app`, `turns[{who, text}]`, `caption` |
| `record` | what a system holds on you | `app`, `title`, `sub`, `price`, `fields[{k,v}]`, `warn` |
| `table` | a comparison with a verdict | `head[]`, `widths[]`, `rows[][]`, optional `app` |

Sizing that holds:

- **fan** — four or five pills a side. Six overflows; three leaves the hub
  floating. Keep a pill to two or three words: the column is 270px and the
  pill height is fixed, so a fourth word clips rather than wraps.
- **loop** — three or four nodes. Two is not a cycle and five crowds the
  centre label off its own diagram. `title` must not wrap, so keep it short;
  `note` is the line that carries the detail.
- **chat** — one exchange. A subject line and one paragraph from Claude is the
  ceiling; a second paragraph pushes the card past its 500px and the fit pass
  starts shrinking the headline to pay for it.
- **record** — four or five fields. A `v` may be partly redacted (`•••• MG Road`)
  — that is the argument on a privacy or data slide, so write it as data rather
  than faking a black bar.
- **table** — four rows, three columns. A cell is a string, or
  `{ "v": "Warn", "status": "ok" | "warn" | "idle" | "bad" }` for a tinted pill.
  With `app` set it renders inside a window; without, under a dark header band.

Use `widths` when a column carries a verdict and another carries prose —
`["1.5fr", "0.7fr", "1.6fr"]` — or the status column takes a third of the table
for a five-character word.

## `stat` and the rest

`stat` renders a two-up grid of figure cards; four figures is what it is built
for, two reads fine, three leaves a hole. Labels are capped at 40 characters
because they sit under a 76px number, not beside it. Add `source` for the
provenance line — and if there is no source, cut the figure rather than
writing one.

`quote`, `steps`, `point` and `problem` all work, and all of them are a step
down from an exhibit. If two consecutive slides have no exhibit, the theme is
not earning itself.

## Do not

- Put two exhibits on one slide. There is not room, and the second one is
  always the weaker argument.
- Repeat a kind twice in a row. Two tables back to back read as one table that
  broke across a swipe.
- Use the accent for body copy. It is 3.2:1 on the card — a headline, a kicker
  or a keyword pill, never a paragraph.
- Invent numbers for `stat` or plausible-looking detail for a `record`. Small
  print inside an exhibit is texture at feed scale, but it is still a claim,
  and a fabricated commit message or price about a real company is a
  fabrication whether or not anybody zooms in.
