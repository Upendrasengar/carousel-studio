# Slide grammar

What each slide type is for, what goes in it, and what is forbidden.
Budgets are in `themes/<theme>/theme.json` and enforced by `check.js`.

---

## hook — slide 1, always

The only job is to stop the scroll. Biggest type in the deck.

**Anatomy:** eyebrow, headline at 118% of base size, hand-drawn underline,
one supporting sentence, mascot.

**Rules**
- No rows, no media, no stats. If the hook needs a list, it is not a hook.
- The headline makes a claim, not an announcement. "My Claude can now watch
  any video" beats "Introducing the watch skill".
- The accent lands on the surprising part of the claim, not the subject.
- The supporting sentence pre-empts the obvious objection. On the video deck
  that is "Not the transcript" — because transcript tools are what the reader
  already assumes you mean.

---

## problem — the pain, stated once

Comes second if the reader might not feel the problem yet. Skip it when the
hook already implies it.

**Anatomy:** eyebrow, headline, short paragraph, up to two rows with `cross`
icons, confused mascot.

**Rules**
- Two rows maximum. A problem slide with five bullets is a list slide.
- State what is lost, not what is wrong. "Miss every visual the speaker
  points at" beats "incomplete data extraction".

---

## point — the default explainer

Most slides in a deck are this. Carries one idea.

**Anatomy:** eyebrow, headline, optional supporting sentence, optional media,
up to five icon rows.

**Rules**
- One idea per slide. If the headline needs "and", split the slide.
- Rows are `title` + one line of `body`. The title is the claim; the body is
  the mechanism. A row with a title and no body is fine; a row with a body and
  no title is not.
- Vary the icons but do not make every row a different one — repeated icons
  across parallel rows read as a set, all-different reads as clip art.

---

## steps — a numbered procedure

**Anatomy:** eyebrow, headline, numbered rows, optional terminal card.

**Rules**
- Three to five steps. Two is not a procedure; six needs two slides.
- Every step starts with a verb.
- A terminal card plus three or more steps leaves no room for the mascot and
  the renderer will drop it. That is fine — but know it is happening.

---

## stat — numbers as the loud element

**Anatomy:** eyebrow, plain headline, two to four stat cells, short paragraph.

**Rules**
- No accent span in the headline. The values are already the loud element and
  a second one splits the emphasis.
- Two stats read best. Four is the ceiling and already crowded.
- Values are short — `39c`, `2 min`, `685`. A value that needs units spelled
  out belongs in the label.
- The paragraph explains why the number is true, not what it is.

---

## quote — one line, big

A pacing device. Use once per deck, roughly two thirds through.

**Anatomy:** bracket mark, quote at display size, small caps attribution.

**Rules**
- Under 140 characters. This is the slide people screenshot.
- No rows, no media, no stats.
- The attribution can be a source, or a note on what the line means. It does
  not have to be a person.

---

## cta — the last slide, always

**Anatomy:** eyebrow, headline, circled action, one closing sentence,
celebrating mascot.

**Rules**
- One ask. "Comment SEND" or "Save this" — never both.
- The headline earns the ask; the `action` is the ask. Do not repeat the ask
  in the headline.
- The closing sentence says what the reader gets, not what to do again.

---

## Deck shape

A deck that works has this rhythm:

```
hook -> problem -> point -> point/steps -> stat -> quote -> cta
```

Seven to nine slides. Under four is not worth a swipe; past ten, completion
falls off sharply. Never two `stat` slides in a row, and never two `quote`
slides in one deck.
