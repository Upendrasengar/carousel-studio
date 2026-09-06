# promptcard — theme rules

Warm cream page, one terracotta. Every slide is a single prompt drawn inside a
facsimile of the assistant's composer — dark rounded card, bracketed slots
picked out in white, model label and send button along the foot. Above it, a
serif-italic title swiped with a pink highlighter. A drawn progress bar runs
along the bottom.

## Reach for it when

The deck is **something to copy out and use**. Prompt packs, snippet libraries,
the five messages that unstick a negotiation, the three emails that get replies.
Anything where the payload is a block of text the reader is meant to lift
verbatim.

It is the wrong pack for a list of tips, an argument, or a walkthrough. Take the
composer away and this is a title on cream paper. A roundup wants `catalogue`;
an argument wants `spotlight-minimal`; a setup guide whose payload is code wants
`workbench`, whose card is line-numbered and can point at one token.

## The signature: the composer

```json
{ "type": "prompt",
  "title": "The Account Audit",
  "prompt": "List every account I have connected. Group them by platform and tell me which ones I have not posted to in the last [30] days.",
  "note": "Ids, never names. Two Pages can share a name." }
```

`[bracketed]` runs become **slots** — set in white against the card's grey body
text. That is the pack's one piece of hierarchy and it is doing real work: the
eye lands on exactly what the reader has to change, so the prompt reads as a
template rather than as somebody else's example.

Put a slot in every prompt. A prompt with nothing bracketed is a prompt the
reader cannot make theirs, and on this layout it looks like a mistake.

Cards pad to `composer.minLines` so a short prompt and a long one produce cards
of the same weight. That is not decoration — it is why nine slides read as one
pack rather than nine unrelated boxes.

**`promptText` is a hard budget at 330 characters.** The card does not scroll
and does not shrink below its floor. A prompt that will not fit in 330 is two
prompts, or one prompt with a sentence that was not earning its place.

## Numbering

`prompt` slides are numbered across the deck automatically — `PROMPT 01`,
`PROMPT 02` — counted by position, so inserting one in the middle renumbers the
rest rather than leaving a gap. Override with `kicker` only when the deck is not
a numbered sequence.

## The title

Serif italic under a pink highlighter swipe. Name the prompt like a tool, not
like a summary: *The Account Audit*, *The Honest Read-Back*, *The Slot Planner*.
A title that describes what the prompt says ("Ask about your accounts") wastes
the one line the reader will actually remember it by.

The swipe paints per line, so a two-line title gets two bars. It still reads
better as one line — 34 characters is the budget for a reason.

## The cover

The only place the accent lands on more than one thing. Words wrapped in
`*asterisks*` alternate down a four-line headline, which is a rhythm rather than
two competing emphases — the pack declares `budgets.maxAccents: 3` so `check.js`
allows it. Everywhere else, one accent, or none.

The outlined kicker pill is the cover's label. Do not repeat it on body slides;
a label on every slide is a border.

## The closer

`"quoted"` text in the `cta` headline becomes the big terracotta serif word —
the thing the reader is meant to type into the comments. One per deck, and it
should be a word somebody can actually type without looking back.

## Do not

- **Write a prompt with no slot.** See above.
- **Change `model` per slide** unless the prompt genuinely needs a different
  one. It sits on every card; varying it makes the reader look for a meaning
  that is not there. Set it once on the deck.
- **Use the accent for body copy.** It is 3.7:1 on the page — a headline, a
  kicker, a slot label, never a paragraph.
- **Let `note` restate the prompt.** It is the caveat, the reason, or the thing
  you only learn on the second run. An echo of the card above it is wasted ink.
