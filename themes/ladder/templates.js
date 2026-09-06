// Slide templates for the ladder theme.
//
// One task, written three times. A weak attempt, a better one, and the one you
// would actually ship, stacked down the page as three prompt cards with a
// graded chip on each. Beside the last card, the same prompt broken into named
// parts, so the reader leaves with a rule rather than an example.
//
// The escalation is the argument. A slide that says "be specific" is advice; a
// slide where you can see the gap between rung one and rung three is evidence,
// and the reader does the concluding themselves.
//
// Two packs sit near it and are the ones to use instead when they apply:
//
//   1. `versus` is a two-sided before/after whose divider moves across the
//      deck. Two rungs, and the geometry carries the argument. Use it when
//      there is a genuine old way being replaced. There is no old way here —
//      all three rungs are things the same person could write today.
//   2. `killlist` pairs an item with the one bad thing it removes. Also two
//      sided, and its right-hand panel is a negation rather than a rewrite.
//
// It is the wrong pack when the middle rung is filler. Three attempts where
// the second is only cosmetically different from the first is two rungs with a
// step painted on, and the reader can see that in one swipe.

import {
  esc, rich, fitAttr, fitFrame, mediaCard, objectVisual, baseCSS,
} from '../../scripts/lib/blocks.js';
import { icon } from '../../scripts/lib/icons.js';

const T = (c) => c.t.type;

/**
 * Motion is opt-in per slide. Every keyframe is scoped under `.is-anim`, so a
 * slide without the flag carries no animation at all and its still is
 * byte-identical to what the pack rendered before it could move.
 */
const anim = (s, base) => (s.animate ? `${base} is-anim` : base);

const headline = (s, c, mul = 1) => (s.headline
  ? `<h1 class="hl" ${fitAttr(T(c).headline, mul)}>${rich(s.headline)}</h1>` : '');
const deckLine = (s, c) => (s.deck ? `<p class="deck" ${fitAttr(T(c).deck)}>${rich(s.deck)}</p>` : '');
const para = (s, c) => (s.body ? `<p class="para" ${fitAttr(T(c).body)}>${rich(s.body)}</p>` : '');

/**
 * The three rungs, in order, worst first.
 *
 * The names live once on the deck so eight slides cannot disagree about what
 * the middle rung is called. A rung may still override its own label when the
 * grade genuinely reads differently on that task.
 */
const GRADES = ['weak', 'better', 'best'];
const GRADE_LABELS = { weak: 'Weak', better: 'Better', best: 'Best' };
const gradeLabel = (deck, grade) =>
  (deck.grades && deck.grades[grade]) || GRADE_LABELS[grade];

/** How many ladder slides the deck has — the denominator on every counter. */
export function ladderTotal(deck) {
  return (deck.slides || []).filter((s) => s.type === 'ladder').length;
}

/**
 * This ladder's number.
 *
 * Keyed on the slide's declared `n`, falling back to its position among the
 * ladder slides. Never on object identity: the renderer hands each template a
 * structuredClone of the slide, so `s === slide` is false for every one.
 */
function ladderNumber(deck, slide, index) {
  if (Number.isInteger(slide.n) && slide.n > 0) return slide.n;
  let seen = 0;
  for (let i = 0; i < index; i++) if (deck.slides[i]?.type === 'ladder') seen++;
  return seen + 1;
}

const pad = (n) => String(n).padStart(2, '0');

/**
 * The prompt card: a text box with an input footer under it.
 *
 * The footer is what makes it read as something you paste rather than a
 * quotation. It carries no information, which is the point — the card has to
 * look like the place the words go, or the three rungs read as three
 * paragraphs of prose about prompts instead of three prompts.
 *
 * `text` keeps its newlines. A shipped prompt has structure — a role line, a
 * numbered body, an output contract — and flattening that into one paragraph
 * hides the exact thing the best rung is being praised for.
 */
function promptCard(text, ctx) {
  const model = ctx.deck.model || '';
  return `<div class="pcard">
    <p class="ptx" ${fitAttr(T(ctx).prompt)}>${rich(text)}</p>
    <span class="pfoot"><i class="pplus">+</i>${model ? `<b>${esc(model)}</b>` : ''}</span>
  </div>`;
}

/**
 * The parts box: the best rung, taken apart and named.
 *
 * It sits beside the last card rather than under it because the reader should
 * be able to look from a clause to the name for that clause without leaving
 * the rung. Underneath, it becomes a separate lesson about a prompt they have
 * already scrolled past.
 */
function partsBox(parts, ctx) {
  if (!parts || !Array.isArray(parts.items) || !parts.items.length) return '';
  const max = ctx.t.budgets.maxParts || 5;
  if (parts.items.length > max) {
    throw new Error(`A parts box has ${parts.items.length} items against a max of ${max}. Past that it is a second prompt, not a key to the first.`);
  }
  const list = parts.items.map((p) =>
    `<li><b ${fitAttr(T(ctx).partKey)}>${esc(p.key || '')}</b>
      <span ${fitAttr(T(ctx).partText)}>${rich(p.text || '')}</span></li>`).join('');
  return `<aside class="parts">
    <span class="parts-lab">${esc(parts.title || 'What makes it work')}</span>
    <ul class="parts-list">${list}</ul>
  </aside>`;
}

/** One rung: the graded chip, then the card. */
function rung(r, ctx, isBest) {
  const label = r.label || gradeLabel(ctx.deck, r.grade);
  const card = promptCard(r.text || '', ctx);
  const inner = isBest && r.parts
    ? `<div class="best-row">${card}${partsBox(r.parts, ctx)}</div>`
    : card;
  return `<div class="rung rung-${r.grade}">
    <span class="gchip" ${fitAttr(T(ctx).grade)}>${esc(label)}</span>
    ${inner}
  </div>`;
}

/** A plain row list, for the standard slide types that are not a ladder. */
function rowList(list, ctx, numbered) {
  if (!list?.length) return '';
  const { t } = ctx;
  return `<ul class="rows">${list.map((r, i) => {
    const mark = numbered
      ? `<span class="rnum">${pad(i + 1)}</span>`
      : `<span class="rico">${r.icon ? icon(r.icon) : ''}</span>`;
    return `<li class="row">${mark}
      <span class="rtxt"><span class="rname" ${fitAttr(t.type.rowTitle)}>${rich(r.title)}</span>
      ${r.body ? `<span class="rbody" ${fitAttr(t.type.rowBody)}>${rich(r.body)}</span>` : ''}</span>
    </li>`;
  }).join('')}</ul>`;
}

/**
 * The hook's centrepiece: the three rung names, stacked, in their own colours.
 *
 * It states the deck's shape before any content arrives, which is the only job
 * slide one has. It reads off the same deck-level names every ladder slide
 * uses, so the promise and the delivery cannot drift apart.
 */
function gradeStack(ctx) {
  const { deck } = ctx;
  return `<div class="gstack">${GRADES.map((g, i) =>
    `<span class="gs-row">
      ${i ? '<em class="gs-vs">vs</em>' : ''}
      <span class="gs gs-${g}">${esc(gradeLabel(deck, g))}</span>
    </span>`).join('')}</div>`;
}

const TYPES = {
  hook: (s, ctx) => fitFrame(`${headline(s, ctx, 1.05)}${deckLine(s, ctx)}
    ${gradeStack(ctx)}
    ${s.save ? `<p class="save"><i>${icon('star')}</i>${esc(s.save)}</p>` : ''}`,
  anim(s, 'body-hook')),

  /** One task, three attempts, the last one taken apart. The signature type. */
  ladder(s, ctx) {
    const rungs = s.rungs;
    if (!Array.isArray(rungs) || rungs.length !== 3) {
      throw new Error(`A ladder slide needs exactly three rungs, got ${rungs?.length ?? 0}. Two is a comparison and belongs in "versus"; four is a list.`);
    }
    rungs.forEach((r) => {
      if (!GRADES.includes(r.grade)) {
        throw new Error(`Rung grade "${r.grade}" is not one of ${GRADES.join(', ')}.`);
      }
    });
    return fitFrame(`
      ${s.task ? `<h2 class="task" ${fitAttr(T(ctx).task)}>${rich(s.task)}</h2>` : ''}
      <div class="rungs">
        ${rungs.map((r, i) => rung(r, ctx, i === rungs.length - 1)).join('')}
      </div>`, anim(s, 'body-ladder'));
  },

  problem: (s, ctx) => fitFrame(
    `${headline(s, ctx)}${para(s, ctx)}${rowList(s.rows, ctx, false)}${mediaCard(s, ctx.accent)}`,
    anim(s, ''),
  ),
  point: (s, ctx) => fitFrame(
    `${headline(s, ctx)}${deckLine(s, ctx)}${mediaCard(s, ctx.accent)}${rowList(s.rows, ctx, false)}${para(s, ctx)}`,
    anim(s, ''),
  ),
  steps: (s, ctx) => fitFrame(
    `${headline(s, ctx)}${para(s, ctx)}${rowList(s.steps || s.rows, ctx, true)}${mediaCard(s, ctx.accent)}`,
    anim(s, ''),
  ),
  stat(s, ctx) {
    const cells = (s.stats || []).map((v) =>
      `<div class="stat">
        <span class="stat-v" ${fitAttr(T(ctx).statValue)}>${rich(v.value)}</span>
        <span class="stat-l" ${fitAttr(T(ctx).statLabel)}>${rich(v.label)}</span></div>`).join('');
    const grid = cells
      ? `<div class="stats stats-${Math.min(2, (s.stats || []).length)}">${cells}</div>` : '';
    return fitFrame(`${headline(s, ctx)}${grid}${para(s, ctx)}`, anim(s, ''));
  },
  quote: (s, ctx) => fitFrame(`<div class="quote-wrap">
    <blockquote class="quote" ${fitAttr(T(ctx).quote)}>${rich(s.quote || s.headline)}</blockquote>
    ${s.attribution ? `<p class="attrib" ${fitAttr(T(ctx).caption)}>${esc(s.attribution)}</p>` : ''}
    </div>`, anim(s, 'body-quote')),

  cta: (s, ctx) => fitFrame(`${headline(s, ctx, 1.05)}${deckLine(s, ctx)}
    ${s.action ? `<p class="action" ${fitAttr(T(ctx).task, 0.7)}>${esc(s.action)}</p>` : ''}
    ${para(s, ctx)}`, anim(s, 'body-cta')),
};

export const SLIDE_TYPES = Object.keys(TYPES);

/**
 * The counter chip. On a ladder it names the position in the run of tasks,
 * which is a different count from the slide number in the footer — the hook
 * and the CTA are not tasks and must not consume a number.
 */
function header(slide, ctx) {
  const { deck } = ctx;
  if (slide.type === 'ladder') {
    const label = deck.unit || 'Example';
    return `<header class="hdr"><span class="ctr">
      <b>${esc(label)} ${pad(ladderNumber(deck, slide, ctx.index))}/${pad(ladderTotal(deck))}</b>
      </span></header>`;
  }
  const text = slide.eyebrow || deck.brand || '';
  return `<header class="hdr">${text ? `<span class="eyb">${esc(text)}</span>` : '<span></span>'}</header>`;
}

/**
 * Handle, a segmented progress bar, and the swipe chevrons. The bar is the
 * deck's own length, one segment per slide, so a reader can see how much is
 * left without counting.
 */
const footer = (ctx) => {
  const last = ctx.index + 1 >= ctx.total;
  const segs = Array.from({ length: ctx.total }, (_, i) =>
    `<i class="${i <= ctx.index ? 'on' : ''}"></i>`).join('');
  return `<footer class="ftr">
    <span class="fh">${esc(ctx.deck.handle || '')}</span>
    <span class="bar">${segs}</span>
    <span class="chev">${last ? esc(ctx.deck.footnote || '') : '&raquo;&raquo;&raquo;'}</span>
  </footer>`;
};

export function slideHTML(slide, ctx) {
  const build = TYPES[slide.type];
  if (!build) throw new Error(`Unknown slide type "${slide.type}". This theme has: ${SLIDE_TYPES.join(', ')}`);
  return `${header(slide, ctx)}${build(slide, ctx)}${objectVisual(slide, ctx.t, ctx.deck)}${footer(ctx)}`;
}

export function css(ctx) {
  const { t, accent, fontFaces, textureCSS } = ctx;
  const c = t.color, sp = t.space, ty = t.type, r = t.radius, cv = t.canvas;
  const D = (t.animate && t.animate.seconds) || 4;
  // Three rungs, so three offsets is the whole climb. The last one has to land
  // well inside the hold window or the still would screenshot a card in
  // flight, and the stills are what four of the six platforms receive.
  const rungStagger = Array.from({ length: 3 }, (_, i) =>
    `.is-anim .rung:nth-child(${i + 1}) { animation-delay:${(i * 0.11).toFixed(2)}s; }`).join('\n');

  return `${fontFaces}
${baseCSS(t)}
body { background:${c.bg}; color:${c.ink}; font-family:Body, system-ui, sans-serif; }

/* A faint cross-hatch, not a rule. Ruled paper reads as a page you write on,
   which is the wrong metaphor here — every card on the slide is already a
   field somebody typed into. */
body::before { content:""; position:absolute; inset:0; z-index:0; pointer-events:none;
  background-image:
    repeating-linear-gradient(0deg, ${c.rule}00 0 59px, ${c.rule}33 59px 60px),
    repeating-linear-gradient(90deg, ${c.rule}00 0 59px, ${c.rule}22 59px 60px); }

.hdr, .ftr { position:absolute; left:${cv.margin}px; right:${cv.margin}px; z-index:40;
  display:flex; align-items:center; }
.hdr { top:${Math.round(cv.safeTop * 0.34)}px; }
.eyb { font-family:MonoBold; font-size:${ty.eyebrow.size}px; letter-spacing:${ty.eyebrow.tracking}em;
  text-transform:uppercase; color:${accent}; }
.ctr { display:inline-flex; align-items:center; gap:9px; background:${c.chrome};
  border:1px solid ${c.rule}; border-radius:99px; padding:7px 15px;
  font-family:Mono; font-size:${ty.eyebrow.size}px; letter-spacing:.1em; color:${c.inkFaint}; }
.ctr b { font-family:MonoBold; text-transform:uppercase; color:${accent}; }

.ftr { bottom:${Math.round(cv.safeBottom * 0.3)}px; justify-content:space-between; gap:${sp.md}px;
  font-family:Mono; font-size:${ty.footer.size}px; letter-spacing:${ty.footer.tracking}em;
  color:${c.inkFaint}; }
.fh { flex:0 0 auto; }
.bar { flex:1 1 auto; display:flex; gap:5px; align-items:center; }
.bar i { flex:1 1 0; height:4px; border-radius:99px; background:${c.rule}; }
.bar i.on { background:${accent}; }
.chev { flex:0 0 auto; color:${accent}; letter-spacing:.02em; }

.body { justify-content:flex-start; top:${Math.round(cv.safeTop + 22)}px; }
.body-hook, .body-cta, .body-quote { justify-content:center; }
.fit { gap:${sp.sm}px; }

.hl { font-family:Display; font-weight:800; font-size:${ty.headline.size}px;
  line-height:${ty.headline.leading}; letter-spacing:${ty.headline.tracking}em; color:${c.ink};
  text-wrap:balance; }
.ac { color:${accent}; }
.deck { font-family:Body; font-size:${ty.deck.size}px; line-height:${ty.deck.leading};
  color:${c.inkSoft}; }
.deck b, .para b, .deck .ac, .para .ac { color:${c.ink}; font-weight:600; font-family:BodyMid; }
.para { font-family:Body; font-size:${ty.body.size}px; line-height:${ty.body.leading}; color:${c.inkSoft}; }

/* ── the ladder ───────────────────────────────────────────────────────
   A height floor on the rung stack, not flex:1 on the fit wrapper. The
   wrapper sizes to content by design, and forcing it to fill would make the
   fit pass measure zero overflow forever. Without the floor the three rungs
   render correct and top-heavy, with the bottom of every slide empty, because
   .body is flex-start here and all the slack lands under the last card.

   The last rung takes the slack rather than the gaps taking it, so the best
   prompt lands at the same y on every task. Swiping four of these, the thing
   the reader came for does not move. */
.task { font-family:Display; font-weight:800; font-size:${ty.task.size}px;
  line-height:${ty.task.leading}; letter-spacing:${ty.task.tracking}em; color:${c.ink}; }
.rungs { display:flex; flex-direction:column; gap:${sp.md}px;
  min-height:${Math.round(cv.height * 0.7)}px; }
.rung { display:flex; flex-direction:column; gap:${sp.sm}px; align-items:flex-start; }
.rung-best { margin-top:auto; align-self:stretch; }

/* The graded chip. Its colour is the whole grammar of the pack, so it is set
   from a custom property on the rung rather than inline on the chip — the
   chip carries fit attributes, and a second style attribute beside those is
   silently dropped. */
.rung-weak   { --grade:${c.gradeWeak};   --grade-tint:${c.gradeWeakTint}; }
.rung-better { --grade:${c.gradeBetter}; --grade-tint:${c.gradeBetterTint}; }
.rung-best   { --grade:${c.gradeBest};   --grade-tint:${c.gradeBestTint}; }
.gchip { display:inline-flex; align-items:center; font-family:Display; font-weight:800;
  letter-spacing:-.01em; color:${c.ink}; background:var(--grade-tint);
  border:2px solid var(--grade); border-radius:99px; padding:5px 20px; }

/* The prompt card. The border is the grade, at low weight — enough that a
   glance down the slide reads as a ramp, not enough to compete with the chip. */
.pcard { align-self:stretch; background:${c.surface}; border:2px solid var(--grade);
  border-radius:${r.md}px; overflow:hidden; display:flex; flex-direction:column; }
.ptx { font-family:Body; font-size:${ty.prompt.size}px; line-height:${ty.prompt.leading};
  color:${c.ink}; white-space:pre-wrap; padding:${sp.md}px ${sp.md}px ${sp.sm}px; }
.ptx .ac { color:${c.ink}; font-family:BodyMid; font-weight:600; }
.pfoot { display:flex; align-items:center; justify-content:space-between;
  border-top:1px solid ${c.rule}; padding:8px ${sp.md}px;
  font-family:Mono; font-size:${ty.chip.size}px; color:${c.inkFaint}; }
.pplus { font-family:Mono; font-size:24px; line-height:1; color:${c.inkFaint};
  font-style:normal; }
.pfoot b { font-family:Mono; font-weight:400; }

/* The best rung and its key, side by side. */
.best-row { align-self:stretch; display:grid; grid-template-columns:1.55fr 1fr;
  gap:${sp.sm}px; align-items:stretch; }
.best-row .pcard { align-self:stretch; }
.parts { border:2px dashed var(--grade); border-radius:${r.md}px; padding:${sp.md}px;
  display:flex; flex-direction:column; gap:${sp.sm}px; }
.parts-lab { align-self:flex-start; font-family:MonoBold; font-size:${ty.label.size}px;
  letter-spacing:${ty.label.tracking}em; text-transform:uppercase; color:${c.ink};
  background:var(--grade-tint); border-radius:99px; padding:4px 12px; }
.parts-list { list-style:none; display:flex; flex-direction:column; gap:${sp.sm}px; }
.parts-list li { display:block; }
.parts-list b { font-family:BodyMid; font-weight:600; color:var(--grade); margin-right:6px; }
.parts-list span { font-family:Body; color:${c.inkSoft}; }

/* hook furniture — the deck's shape, stated once */
.gstack { display:flex; flex-direction:column; align-items:flex-start; gap:${sp.xs}px;
  margin:${sp.md}px 0; }
.gs-row { display:flex; align-items:center; gap:${sp.md}px; }
.gs { font-family:Display; font-weight:800; font-size:96px; line-height:1.1;
  letter-spacing:-.03em; border-bottom:8px solid currentColor; }
.gs-weak { color:${c.gradeWeak}; }
.gs-better { color:${c.gradeBetter}; }
.gs-best { color:${c.gradeBest}; }
.gs-vs { font-family:Mono; font-style:normal; font-size:${ty.chip.size}px;
  letter-spacing:.2em; text-transform:uppercase; color:${c.inkFaint}; }
.save { display:flex; align-items:center; gap:10px; font-family:Mono;
  font-size:${ty.chip.size}px; letter-spacing:.04em; color:${c.inkSoft};
  border:2px dashed ${c.rule}; border-radius:${r.sm}px; padding:${sp.sm}px ${sp.md}px; }
.save i { display:block; width:17px; height:17px; color:${accent}; line-height:0; }
.save i svg { width:17px; height:17px; display:block; }

/* rows, for the standard types */
.rows { list-style:none; display:flex; flex-direction:column; gap:${sp.xs}px; }
.row { display:flex; align-items:flex-start; gap:${sp.md}px; background:${c.surface};
  border:1px solid ${c.rule}; border-radius:${r.sm}px; padding:${sp.md}px; }
.rnum, .rico { flex:0 0 auto; font-family:MonoBold; font-size:17px; width:24px;
  padding-top:4px; color:${accent}; }
.rico svg { width:20px; height:20px; }
.rtxt { display:flex; flex-direction:column; gap:3px; min-width:0; flex:1 1 auto; }
.rname { font-family:BodyMid; font-weight:600; color:${c.ink}; }
.rbody { font-family:Body; font-size:${ty.rowBody.size}px;
  line-height:${ty.rowBody.leading}; color:${c.inkSoft}; }

.stats { display:grid; gap:${sp.sm}px; }
.stats-2 { grid-template-columns:1fr 1fr; }
.stat { background:${c.surface}; border:1px solid ${c.rule}; border-radius:${r.md}px;
  padding:${sp.md}px; display:flex; flex-direction:column; gap:5px; }
.stat-v { font-family:Display; font-weight:800; font-size:${ty.statValue.size}px;
  color:${accent}; letter-spacing:-.03em; }
.stat-l { font-family:Mono; font-size:${ty.statLabel.size}px; text-transform:uppercase;
  letter-spacing:.08em; color:${c.inkSoft}; }

.quote-wrap { border-left:5px solid ${accent}; padding-left:${sp.lg}px; }
.quote { font-family:Display; font-weight:800; font-size:${ty.quote.size}px;
  line-height:${ty.quote.leading}; text-wrap:balance; color:${c.ink}; }
.attrib { font-family:Mono; font-size:${ty.caption.size}px; text-transform:uppercase;
  letter-spacing:.12em; color:${c.inkFaint}; margin-top:${sp.sm}px; }

.action { align-self:center; font-family:Display; font-weight:800;
  letter-spacing:.06em; text-transform:uppercase; color:${accent};
  border:3px solid ${accent}; border-radius:${r.md}px;
  padding:${sp.sm}px ${sp.xl}px; margin:${sp.md}px 0; }
.body-cta .fit { align-items:center; text-align:center; }
.body-hook .fit { align-items:flex-start; }
/* Without this the rung stack is shrink-to-fit, so its width is set by the
   longest prompt on that slide — a task whose middle rung happens to be short
   renders every card narrow, and the deck's columns wander from slide to
   slide. The cards have to be the same width across the run or the three-rung
   comparison stops reading as one form. */
.body-ladder .fit { align-items:stretch; }

.term { background:#12161F; border-radius:${r.md}px; }
.term-bar { padding:10px ${sp.md}px; background:rgba(255,255,255,.06);
  font-family:Mono; font-size:15px; color:#8A93A3; }
.term-bar i { background:rgba(255,255,255,.2); }
.term-body { padding:${sp.md}px; gap:5px; font-size:19px; line-height:1.42; color:#D5DCE7; }
.shot { background:${c.surface}; border:1px solid ${c.rule}; border-radius:${r.md}px; }
.shot-bar { padding:10px ${sp.md}px; background:${c.chrome}; color:${c.inkFaint};
  font-family:Mono; font-size:15px; }
.shot-bar i { background:${c.rule}; }

.object { right:${Math.round(cv.margin * 0.6)}px; bottom:${Math.round(cv.safeBottom * 1.1)}px; }

/* ── motion ───────────────────────────────────────────────────────────
   Scoped to .is-anim, which only appears on a slide marked "animate": true.
   The rungs climb worst-first and the key lands last, which is the reading
   order anyway — the motion states the argument rather than decorating it.

   Nothing starts at opacity:0. The clip loops, so frame 0 follows the held
   final frame, and coming up from nothing blanks the slide once per cycle. */
@keyframes ld-in {
  0%,  4%   { opacity:.28; transform:translateY(14px); }
  40%, 100% { opacity:1; transform:none; }
}
@keyframes ld-chip {
  0%        { opacity:.4; transform:scale(.94); }
  32%, 100% { opacity:1; transform:none; }
}
.is-anim .task, .is-anim .hl { animation:ld-in ${D}s ease-out infinite both; }
.is-anim .rung { animation:ld-in ${D}s cubic-bezier(.2,.8,.2,1) infinite both; }
.is-anim .gchip { animation:ld-chip ${D}s cubic-bezier(.2,.8,.2,1) infinite both; }
.is-anim .parts { animation:ld-in ${D}s cubic-bezier(.2,.8,.2,1) infinite both;
  animation-delay:.4s; }
.is-anim .gs { animation:ld-in ${D}s ease-out infinite both; }
.is-anim .gs-better { animation-delay:.1s; }
.is-anim .gs-best { animation-delay:.2s; }
${rungStagger}

${textureCSS}
`;
}
