# assembly — what the system is

One frame that assembles itself. A numbered rail of empty slots is on screen
from the first frame, and the entries land in it one at a time across a single
14-second take. The last frame is a finished reference card.

It is a **motion infographic, not a carousel**. There is no swipe, no slide 2,
no CTA slide. The whole post is one file.

## The three things that make it this pack

1. **The empty slots are drawn from frame 0.** Dashed placeholders and dim
   numbers, before anything lands. That is the promise — the viewer can count
   what is coming and has a reason to wait. A build that opens on a blank
   frame is a fade-in with extra steps.
2. **Entries arrive one at a time.** The stagger is the mechanic. Everything
   arriving together is decoration and belongs in a still.
3. **The final frame is a complete, legible card.** It is what the renderer
   screenshots as the still fallback, what the platforms show as the poster,
   and what someone screenshots to save. If it only works in motion, it does
   not work.

## Slide types

One: `assemble`. A deck in this theme is exactly one slide, and `check.js`
errors on any deck that is not — the theme declares `singleFrame: true` in
`theme.json`, which also switches off every carousel-shaped warning
(length, opener, CTA, slide-2-is-a-second-hook). Those rules are about the
swipe and there is no swipe here.

## What goes in a slot

`title`, `icon`, `tag`, `body`, `try`. The **try line is the payload** — the
instruction someone would retype. A slot without one is a bullet point wearing
a card, and `check.js` warns about it.

Three to six slots. Under three the build finishes before anyone has decided
to stay; over six the cards fall below reading size at feed scale.

## The timing contract

`theme.json` carries `animate: { seconds, fps, lead, step, build }`. The last
slot must land inside the take:

```
lead + (slots - 1) * step + build  <=  seconds
```

At the shipped defaults, six slots need 13.55s against 14s. `check.js`
computes this and **errors** when it fails, because nothing else would catch
it: the clip still encodes, the still fallback still looks right, and the only
symptom is a final card frozen mid-rise on a frame nobody re-watches. It warns
when the hold is under 0.4s — a finished card that is gone before it can be
read is the same failure, slower.

## The one studio rule this pack breaks, on purpose

carousel-studio's motion rule 3 says never start at `opacity:0`, because a
4-second loop puts frame 0 straight after the held final frame and the slide
blanks once per cycle. **This clip is not a loop.** It resets visibly, which
is what a build animation does and what the reference does.

The part of that rule which still binds, and which this pack keeps: **the
frame never goes blank.** At frame 0 the header, the rail, the numbers and the
empty slot outlines are all on screen. It is an empty form, not an empty
canvas.

## What this theme is not for

- **Anything without a fixed schema per entry.** Every slot is the same shape.
  Entries that each want a different treatment belong in a carousel pack.
- **Anything longer than six items.** Use `catalogue` or `manifest`; they are
  built to spread a list across slides.
- **A deck.** If the argument needs more than one frame, this is the wrong
  pack — the whole point is that it holds attention on one image.
- **Stills.** A deck here rendered without `--animate` is the fallback, not
  the post. `check.js` warns when `animate` is not set.

## Platform notes

The output is a single MP4. Instagram publishes a single video as a **Reel**,
not a feed image — that is a different surface with a different audience, and
it is the one thing to decide before posting. Threads takes it as a plain
video post. LinkedIn and Facebook take no video in this pipeline's carousel
path, so those two get the still.
