# index-rail

A warm graph-paper page with a numbered index down the left edge. Chips
already passed carry a tick in their own section's colour; the current one
grows, takes full colour and breaks the rail's edge. Each slide is one
catalogue entry: kicker, numbered badge, serif title, a browser card showing
the page itself, one "what it is" line, and a bordered "start here"
instruction.

## Reach for it when

The deck is a **roundup of things that live at URLs** — repos, docs pages,
write-ups, courses, tools. "N pages worth your afternoon", "the links I send
every new hire", "everything Anthropic publishes, ranked".

It is the wrong theme for anything without a link per item. The browser card
is the device the whole layout is built around, and a deck of entries with no
`page` renders as five grey bands stacked eight times.

## The mechanic

`deck.index.items` holds the catalogue. A slide is `{ "type": "guide",
"upto": 3 }` and nothing else — the entry carries its own kicker, title, what,
start and page. One `guide` slide per entry, in order.

The rail draws every entry, always. Eight entries is a rail of eight; twenty
is a rail of twenty, and past about eighteen the chips start to crowd. Six to
twelve is the band where the rail reads as a map rather than as a ruler.

## Sections are the colour key

Distinct `section` names take rail colours in the order they first appear.
That is what turns the rail from a progress bar into a shape — a reader sees
"four blue, three red, one gold" and knows the list has structure before
reading a word.

Two consequences worth planning for:

- **Group the deck by section.** Entries in appearance order means an index
  that alternates sections produces a striped rail that carries no information.
- **Five sections is the ceiling.** A sixth repeats a colour and the map
  breaks. `check.js` warns.

Three to five sections over eight to twelve entries is the shape that works.
One section is fine too — the rail then reads as one run, which is honest.

## Copy

| Field | Budget | What it is |
|---|---|---|
| `title` | 44 | The entry's name. A real name, not a description of it. |
| `what` | 110 | One sentence, present tense, no verb like "helps you". Say what the thing *is*. |
| `start` | 118 | An instruction with a first action in it. "Clone the repo and drop one folder in" beats "great for teams". |
| `kicker` | 30 | Comes from `section` unless the slide overrides it. |
| `badge` | — | Optional pill. Two or three across the whole deck, or it stops meaning anything. |

`start` is the field that earns the save. It is the difference between a list
of links and a list of next actions, and it is the one an agent is most likely
to write as a summary of the entry — which makes the slide say the same thing
twice.

## The page card

`page.kind` picks a mock; all five are drawn from data, never fetched. Use the
kind that matches the real page — a repo listing for a repo, a docs page for
docs. A `docs` mock on a GitHub URL is the one thing a reader will notice.

Write the real `url`. It goes in the address bar at full size and it is the
most-screenshotted part of the slide.

The mocks render wider and taller than the frame so the card is always a crop,
the way a real screenshot is. Do not pad the data to fill it.

Small print inside a mock is texture, not copy — nobody reads it at feed
scale. It still has to be *true*: a fabricated commit message on a real
repository is a claim about a real project.

## The cover and the closer

`hook` takes `deck.manual` — the tilted book whose page tabs are the index
seen edge-on, coloured by section and counted from the same list the rail
draws. It is a promise the rest of the deck keeps, so it costs nothing to be
literal: `caption` should state the real count.

The copy box on the cover stops at 47% height. Three lines of headline plus
two of deck is the ceiling; past that the fit pass shrinks rather than
crowding the book.

`cta` drops the rail entirely and centres. `[square brackets]` in `action`
render as the mono keyword chip — one per deck, and it should be a word
somebody can actually type in a comment.

## Do not

- Reach for `problem`/`point`/`steps` between `guide` slides. The rail counts
  entries, not slides; a non-guide slide in the middle leaves the rail frozen
  while the deck moves, and the position cue silently lies.
- Give an entry a `section` you invented for one item. A section of one is a
  colour spent on nothing.
- Use the accent for body copy. It is 3.9:1 on the field — fine for a headline
  or a label, not for a paragraph.
