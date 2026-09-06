# ladder — theme rules

Cool paper, graded rungs. One task, written three times, with the last one
taken apart beside it.

## Reach for it when

The improvement **is** the content. Prompt teardowns, brief rewrites, spec
reviews, "here is what I actually send" — anywhere the reader already knows
they should be more specific and needs to see what that costs in words.

It is the wrong pack for a comparison of two things: that is `versus`, whose
divider moves and whose argument is geometric. It is the wrong pack for a list
of fixes, which is `killlist`. And it is the wrong pack when you only have two
real attempts — see below.

## The `ladder` slide

```json
{ "type": "ladder", "n": 1, "task": "Writing the day's post",
  "rungs": [
    { "grade": "weak",   "text": "Write me a post about AI automation." },
    { "grade": "better", "text": "Write an Instagram carousel about ..." },
    { "grade": "best",   "text": "You write for a 6-person agency ...",
      "parts": { "title": "What makes it work",
                 "items": [{ "key": "Role", "text": "who it writes for" }] } } ]
}
```

**Exactly three rungs, in `weak` / `better` / `best` order.** The template
throws on anything else. Two is a comparison and belongs in `versus`; four
stops being a climb and becomes a list.

`text` keeps its newlines. A shipped prompt has structure — a role line, a
numbered body, an output contract — and flattening it into one paragraph hides
the exact thing the best rung is being praised for. Write it the way you would
paste it.

## The middle rung is where this pack fails

A weak rung and a best rung write themselves. If the middle one is only
cosmetically better than the first — a few more words, no new commitment — the
slide is two rungs with a step painted on, and the reader sees that in one
swipe.

The test: **the better rung should be a prompt somebody would actually send
and be mildly disappointed by.** It names the platform, the length, the shape.
It just never says what to do when the job cannot be done.

## The parts box

Only on the `best` rung, and only when the parts are the same on every slide.
Two to five items, four is the shape it was built for. Each is `key` plus
`text`: the name of the thing, then the specific clause in this prompt that is
that thing.

Keeping the keys fixed across the deck is the whole payoff — by the third
task the reader is reading the value rather than the layout, and the closing
slide can name the four and land.

Do not invent an acronym for them. A named formula that only holds for your
own four examples is a mnemonic for nothing.

## Copy budgets

| Field | Ceiling |
|---|---|
| `task` | one line, 46 chars |
| weak rung | one sentence — it is meant to look thin |
| better rung | 2–3 lines |
| best rung | 520 chars including newlines |
| `parts.items[].key` | 14 chars |
| `parts.items[].text` | 86 chars |

A best rung over budget still renders — the fit pass shrinks the slide — but
`check.js` will tell you first, and shrinking the whole slide to fit one long
prompt makes the two rungs above it smaller for no reason.

## Tokens

Cool paper `#EDEFF3`, indigo chrome `#4338CA`, and the three grade colours:
red `#C4342A`, teal `#0F7A70`, green `#1B7A36`. The grade rides on the rung as
a custom property, never inline on the chip — the chip carries fit attributes,
and a second `style` attribute beside those is silently dropped.

The card border is the grade at low weight, so a glance down the slide reads
as a ramp before any word is read. That is doing the work; do not add a second
signal for it.

## What this theme is not for

Anything where the three versions are not the same task. Three different
prompts side by side is a roundup, and the escalation the pack promises is a
lie the reader can check by reading.
