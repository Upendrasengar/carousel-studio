# decision — theme rules

A yes/no tree, one question per slide, with the path so far shown behind you.

## The mechanic

The tree lives once on the deck:

```json
"tree": { "nodes": [
  { "q": "Does it run more than once a week?",
    "note": "Once-off work is never worth automating.",
    "yes": "keep going", "no": "stop — do it by hand" },
  { "q": "Would a wrong answer cost you money?",
    "yes": "human in the loop", "no": "let it run" }
]}
```

Each slide names where it is and how it got there:

```json
{ "type": "node", "at": 2, "path": ["yes"] }
```

`path` is the answers given to reach this node, in order. Answered questions
stay on screen greyed with their answer stamped — **the path is the thing the
reader is meant to keep**, and keeping is saving.

## Why this format

Decision trees are among the most-saved carousel formats, and saves are now
the most heavily weighted signal. People save one because they intend to come
back and walk it again with a real decision in hand.

## Rules

- Three to five nodes. Two is not a tree; six is a flowchart nobody finishes.
- Every question must be answerable in under two seconds by someone who knows
  their own situation. "Is your data sensitive?" works. "What is your risk
  tolerance?" does not.
- Both branches need a real destination. A `no` that just says "then no"
  wastes half the slide.
- End on a `cta` that hands over the tree itself. The deck is the advert for
  the thing people actually want.

## What this theme is not for

Linear processes — use `vintage-print`'s reveal for those. This pack is for
branching, and if nothing branches the format is doing nothing.
