# Composition rules

These apply to every theme. Theme-specific rules live in
`themes/<name>/rules.md`.

## The safe zone

Instagram crops a 4:5 slide to a centre square in the profile grid. At
1080x1350 that removes the top and bottom **135px**.

- Chrome — eyebrow, counter, handle, footnote — may live in those bands.
  It is meant to be lost in the grid view.
- Content — headline, body, rows, stats, quotes, media — may **never** enter
  them. The `.body` box is already inset by exactly this amount, so this holds
  automatically as long as content stays inside `.body`.
- The mascot may overlap the lower band. It is decoration.

This is invisible until your profile grid looks broken, at which point every
deck you have posted is wrong.

## One loud element

Each slide gets exactly one thing that shouts. Everything else is quiet.

- On most slides that is the accent span in the headline.
- On a `stat` slide it is the values, so the headline stays plain.
- On a `cta` it is the circled action.

A hand-drawn mark is emphasis too. Two marks on one slide is two loud
elements. One mark per slide, at most.

## The accent touches one thing

The accent colour appears on: the eyebrow, and one span. That is it. It is
not a body-text colour — at 3.8:1 against the background it is legible as
display type and illegible as a paragraph. `check.js` will tell you if a theme
drifts below the floor.

Note the mascot's orange is *not* the accent — it is illustration, so it has
no contrast requirement and stays warmer on purpose.

## Rhythm

Slides in a carousel are seen in sequence, so identical slides read as one
slide. Vary:

- **Density.** Never three row-list slides in a row. Put a `stat` or `quote`
  between them.
- **Mascot side.** Seeded, so it already alternates. Do not pin every slide to
  the same side.
- **Row count.** Three rows then five rows reads better than four then four.

## Type scale

Only sizes in `theme.json` under `type` exist. There is no ad-hoc size. If a
slide needs a size that is not in the scale, it needs a different slide type.

## Fill the frame

A slide whose content occupies a third of the frame reads as a draft, not as
restraint. After fitting, the renderer measures content height against the
content box and, if it is under the theme's `fill.min`, steps the type **up**
proportionally until it reaches the target or hits `fill.maxGrow`.

This is why a short hook or a one-line quote renders large rather than
marooned in the middle of the page. The render log says `grown to 123%` when
it fires.

It scales the whole type scale together, so the hierarchy you set in the
tokens survives. It cannot rescue a slide that has nothing on it — three
words and no supporting line will still look thin at any size.

Growth stops at the **illustration**, not just at the box edge. The three fit
passes run in this order, and the order matters: shrink to fit, grow to fill
(bounded by decoration), then drop whatever decoration still collides.
Checking collisions before growing instead let a headline grow straight
through a character that had already been cleared.

## Where content sits vertically

Slides carrying rows, stats or media **anchor to the top**. The slack pools at
the bottom, which is where a character stands in the themes that have one.
Centring instead leaves a dead band above the content and pushes the content
down into the character until the collision guard deletes it.

The three type-only slides — `hook`, `quote`, `cta` — stay centred, because
the growth pass fills those instead.

## Auto-fit is a safety net

The renderer steps type down until content fits. That exists so one long
headline cannot destroy a render — not so you can ignore budgets. A slide
that shrank is a slide whose copy is too long, and the render log names it.

A slide reported as `OVERFLOWS` has already hit the minimum size and is still
too big. There is no fix but cutting words.
