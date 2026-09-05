// The fit pass, run inside the page after fonts are ready.
//
// Three things happen here, in this order, and the order is the whole point:
//
//   1. Shrink until the content fits its box.
//   2. Grow until it fills the frame — bounded by the illustration.
//   3. Drop any decoration that still collides.
//
// Doing (3) before (2) was a real bug: decoration cleared the check, then the
// growth pass grew the copy straight through it, and a headline ended up
// sitting on the character's face.

export const FIT_FN = (opts) => {
  const { minFill = 0.62, maxGrow = 1.35 } = opts || {};

  const box = document.querySelector('.body');
  const inner = document.querySelector('.fit');
  if (!box || !inner) return { shrunk: false, ratio: 1, reason: 'no fit box' };

  const els = [...document.querySelectorAll('[data-fit]')].map((el) => ({
    el,
    start: parseFloat(el.dataset.fit),
    size: parseFloat(el.dataset.fit),
    min: parseFloat(el.dataset.min || '12'),
  }));

  // Width overflow means "a line of text is wider than the content box",
  // which in practice is one unbreakable long word. It must NOT be measured
  // with scrollWidth: an absolutely positioned child — a hand-drawn circle
  // around a call to action, say — inflates scrollWidth without occupying any
  // layout width, and the element then shrinks to its floor and still reports
  // overflow. Measuring the element's own text line boxes ignores decoration.
  const boxWidth = box.clientWidth;
  const measure = document.createRange();
  const tooWide = (el) => {
    // Measure against the element's OWN width, not the content box. A stat
    // value lives in a card half the box wide, so a value that fits the box
    // and overflows the card passed silently and rendered clipped at the
    // slide edge. The element's own rect is the real constraint.
    //
    // It must still be the rect and not scrollWidth: an absolutely positioned
    // child — a hand-drawn circle round a call to action — inflates
    // scrollWidth without occupying layout width, and the element then
    // shrinks to its floor and still reports overflow.
    const own = el.getBoundingClientRect().width;
    const limit = own > 1 ? Math.min(own, boxWidth) : boxWidth;

    // Decoration nested INSIDE a fitted element must be hidden while we
    // measure. A Range over the element's contents returns rects for
    // absolutely positioned descendants too — a hand-drawn underline beneath
    // a headline, a circle around a call to action — and those are wider than
    // the text by design. Left visible, the element shrinks to its floor and
    // still reports overflow, forever. Neither scrollWidth nor the raw Range
    // can tell layout width from decoration; hiding it can.
    const hidden = [];
    for (const d of el.querySelectorAll('*')) {
      if (getComputedStyle(d).position === 'absolute') {
        hidden.push([d, d.style.display]);
        d.style.display = 'none';
      }
    }
    measure.selectNodeContents(el);
    let wide = false;
    for (const r of measure.getClientRects()) {
      if (r.width > limit + 1) { wide = true; break; }
    }
    for (const [d, prev] of hidden) d.style.display = prev;
    return wide;
  };

  const overflows = () =>
    inner.getBoundingClientRect().height > box.clientHeight + 1 ||
    els.some(({ el }) => tooWide(el));

  // ── 1. shrink ──────────────────────────────────────────────────────
  // This is the failure that actually happens in production: an agent writes
  // 40 characters on one slide and 180 on the next. Naive checks use
  // scrollHeight, which cannot see overflow on a vertically centred column —
  // content spills upward past the top edge and the checker reports success.
  let guard = 0;
  while (overflows() && guard++ < 400) {
    let moved = false;
    for (const f of els) {
      if (f.size > f.min) {
        f.size = Math.max(f.min, f.size * 0.975);
        f.el.style.fontSize = f.size + 'px';
        moved = true;
      }
    }
    if (!moved) break; // everything is already at its floor
  }

  // ── where the ink actually is ──────────────────────────────────────
  // Testing against the .fit wrapper is wrong: the wrapper is full-width even
  // where the text inside it is not, so a corner illustration would always
  // read as colliding. What matters is the line boxes of the text, plus
  // anything that paints a background or is an image.
  const inkRects = () => {
    const out = [];
    const range = document.createRange();
    range.selectNodeContents(inner);
    for (const r of range.getClientRects()) {
      if (r.width > 0 && r.height > 0) out.push(r);
    }
    for (const el of inner.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      const paints = el.tagName === 'IMG'
        || (cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent')
        || cs.backgroundImage !== 'none';
      if (paints) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) out.push(r);
      }
    }
    return out;
  };

  const PAD = 14;
  const decorEls = [...document.querySelectorAll('[data-decor]')];
  const overlaps = (a, rects) => rects.some((b) =>
    a.left < b.right + PAD && a.right > b.left - PAD &&
    a.top < b.bottom + PAD && a.bottom > b.top - PAD);
  const touchesDecor = () => {
    const rects = inkRects();
    return decorEls.some((el) => overlaps(el.getBoundingClientRect(), rects));
  };

  // ── 2. grow ────────────────────────────────────────────────────────
  // A slide whose content occupies a third of the frame reads as a draft, not
  // as restraint. Scale the whole type scale together so the hierarchy set in
  // the tokens survives, capped at maxGrow, and stop at the illustration
  // rather than at the box edge.
  const fill = () => inner.getBoundingClientRect().height / box.clientHeight;
  const blocked = () => overflows() || touchesDecor();
  let grew = false;
  if (!blocked()) {
    let g = 0;
    while (fill() < minFill && g++ < 300) {
      let moved = false;
      for (const f of els) {
        const cap = f.start * maxGrow;
        if (f.size < cap) {
          f.size = Math.min(cap, f.size * 1.015);
          f.el.style.fontSize = f.size + 'px';
          moved = true;
        }
      }
      if (!moved) break;
      if (blocked()) {
        // Overshot on the last step. Walk it back and stop.
        for (const f of els) {
          f.size /= 1.015;
          f.el.style.fontSize = f.size + 'px';
        }
        break;
      }
      grew = true;
    }
  }

  // ── 3. drop what still collides ────────────────────────────────────
  // Decoration loses to content. On a slide with a long row list or a media
  // card there is genuinely no room for a character or a margin arrow, and
  // half an element peeking out from behind a terminal window looks like a
  // bug rather than a choice.
  const droppedDecor = [];
  {
    const rects = inkRects();
    for (const el of decorEls) {
      if (overlaps(el.getBoundingClientRect(), rects)) {
        el.style.display = 'none';
        droppedDecor.push(el.dataset.decor || 'decoration');
      }
    }
  }

  const worst = els.reduce((acc, f) => Math.min(acc, f.size / f.start), 1);
  const best = els.reduce((acc, f) => Math.max(acc, f.size / f.start), 1);
  return {
    shrunk: worst < 0.999,
    ratio: worst,
    grew,
    growRatio: best,
    fill: Math.round(fill() * 100),
    stillOverflows: overflows(),
    droppedDecor,
    height: Math.round(inner.getBoundingClientRect().height),
    boxHeight: box.clientHeight,
  };
};
