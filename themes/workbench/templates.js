// Slide templates for the workbench theme.
//
// A tutorial on kraft paper. Black label chip, a two-line headline that turns
// red italic on the second line, two or three sentences, one quiet aside — and
// then the subject, which is always a dark card taped to the page.
//
// The card is the pack. Everything above it is caption. Three kinds:
//
//   code      a line-numbered source file, syntax-coloured, with a hand-drawn
//             mark circling one token
//   terminal  the shared session card from blocks.js
//   graph     the shared node graph, for the slides that have to show shape
//             rather than syntax
//
// What makes it worth a pack of its own is the anchored mark. `handbuilt` has
// hand-drawn asides but they live in the margin and talk *about* the slide;
// `console` and `thread` put code on a dark page but nothing points at a line.
// Here the mark lands on a token, so "this is the argument that matters" is a
// thing the layout can say rather than something the copy has to explain.
//
// It is the wrong pack for anything the reader is not meant to type. Strip the
// cards out and this is a headline on brown paper.

import {
  esc, rich, fitAttr, fitFrame, terminalCard, shotCard, nodeGraph,
  objectVisual, baseCSS,
} from '../../scripts/lib/blocks.js';
import { codeCard } from '../../scripts/lib/code.js';
import { icon } from '../../scripts/lib/icons.js';
import { logo } from '../../scripts/lib/assets.js';

const T = (c) => c.t.type;

/**
 * Motion is opt-in per slide. Every keyframe is scoped under `.is-anim`, so a
 * slide without the flag carries no animation at all and its still is what the
 * pack rendered before it could move.
 */
const anim = (s, base) => (s.animate ? `${base} is-anim` : base);

/**
 * The two-line headline. Line one is ink in the heavy grotesque, line two is
 * the accent in serif italic — the pack's signature, and it only works on two
 * lines. One line loses the turn entirely; three makes the italic a colour
 * wash rather than an emphasis.
 *
 * Split on a newline rather than on `*asterisks*`: the accent here is a whole
 * line in a different face, not a phrase inside one, and asking authors to
 * mark it twice is how the two drift apart.
 */
function headline(s, ctx) {
  if (!s.headline) return '';
  const [one, two] = String(s.headline).split('\n');
  if (!two) {
    return `<h1 class="hl"><span class="hl-1" ${fitAttr(T(ctx).headline)}>${esc(one)}</span></h1>`;
  }
  return `<h1 class="hl">
    <span class="hl-1" ${fitAttr(T(ctx).headline)}>${esc(one)}</span>
    <span class="hl-2" ${fitAttr(T(ctx).headlineItalic)}>${esc(two)}</span>
  </h1>`;
}

const para = (s, c) => (s.body ? `<p class="para" ${fitAttr(T(c).body)}>${rich(s.body)}</p>` : '');
const deckLine = (s, c) => (s.deck ? `<p class="deck" ${fitAttr(T(c).deck)}>${rich(s.deck)}</p>` : '');

/**
 * The aside. One quiet italic line that must say something the paragraph
 * above it deliberately does not — the caveat, the consequence, the thing you
 * only find out on the second run. An aside that restates the body is wasted
 * ink in a second typeface.
 */
const aside = (s, c) => (s.aside
  ? `<p class="aside" ${fitAttr(T(c).aside)}>${rich(s.aside)}</p>` : '');

/** The black label chip: what section of the guide this slide belongs to. */
const chip = (s, ctx) => (s.eyebrow
  ? `<span class="chip" ${fitAttr(T(ctx).eyebrow)}>${esc(s.eyebrow)}</span>` : '');

/**
 * The taped card. Tape angles come from the deck seed, so a deck's cards are
 * always taped identically on re-render but no two slides match.
 *
 * The card is never tagged as decoration. It is the subject of the slide, and
 * the collision guard dropping it would leave a caption with nothing to
 * caption.
 */
function taped(inner, ctx) {
  const { rng } = ctx;
  const l = rng.float(-14, -4).toFixed(1);
  const r = rng.float(4, 14).toFixed(1);
  return `<div class="paper">
    <span class="tape tape-l" style="transform:rotate(${l}deg)"></span>
    <span class="tape tape-r" style="transform:rotate(${r}deg)"></span>
    ${inner}
  </div>`;
}

/** Dispatches the slide's subject card. Unknown kinds render nothing. */
function subject(s, ctx) {
  const m = s.media;
  if (!m) return '';
  let inner = '';
  if (m.kind === 'code') {
    inner = codeCard(m, {
      rng: ctx.rng, color: ctx.accent, minLines: ctx.t.budgets.codeMinLines || 0,
    });
  }
  else if (m.kind === 'terminal') inner = terminalCard(m, ctx.accent);
  else if (m.kind === 'image') inner = shotCard(m);
  else if (m.kind === 'graph') {
    // `flow` is opt-in per deck rather than on by default: dots travelling the
    // wires assert a direction of work, which is true of a pipeline and a lie
    // about a diagram that merely groups things.
    inner = `<div class="gcard">${nodeGraph(m.graph || m, {
      iconFn: icon, logoFn: logo, height: m.height || 420,
      flow: (m.graph || m).flow ? { seconds: ctx.t.animate?.seconds || 4 } : false,
    })}</div>`;
  }
  return inner ? taped(inner, ctx) : '';
}

/** Slide 2's shape: three hand-drawn marks naming what the thing is. */
function traits(s, ctx) {
  const list = s.traits;
  if (!Array.isArray(list) || !list.length) return '';
  return `<div class="traits">${list.map((tr) =>
    `<div class="trait">
      <span class="trait-i">${icon(tr.icon || 'star')}</span>
      <span class="trait-l" ${fitAttr(T(ctx).trait)}>${esc(tr.label || '')}</span>
    </div>`).join('')}</div>`;
}

function rowList(list, ctx, numbered) {
  if (!list?.length) return '';
  const { t } = ctx;
  return `<ul class="rows">${list.map((r, i) => {
    const mark = numbered
      ? `<span class="rnum">${String(i + 1).padStart(2, '0')}</span>`
      : `<span class="rico">${r.icon ? icon(r.icon) : ''}</span>`;
    return `<li class="row">${mark}
      <span class="rtxt"><span class="rname" ${fitAttr(t.type.rowTitle)}>${rich(r.title)}</span>
      ${r.body ? `<span class="rbody" ${fitAttr(t.type.rowBody)}>${rich(r.body)}</span>` : ''}</span>
    </li>`;
  }).join('')}</ul>`;
}

const TYPES = {
  /** The cover. Title, one line under it, and the card that sets the subject. */
  hook: (s, ctx) => fitFrame(
    `${chip(s, ctx)}${headline(s, ctx)}${deckLine(s, ctx)}${subject(s, ctx)}`,
    anim(s, 'body-hook'),
  ),

  /** The signature slide: caption, then the taped card it is captioning. */
  build: (s, ctx) => fitFrame(
    `${chip(s, ctx)}${headline(s, ctx)}${para(s, ctx)}${rowList(s.rows, ctx, false)}${aside(s, ctx)}
     ${traits(s, ctx)}${subject(s, ctx)}`,
    anim(s, 'body-build'),
  ),

  point: (s, ctx) => fitFrame(
    `${chip(s, ctx)}${headline(s, ctx)}${para(s, ctx)}${rowList(s.rows, ctx, false)}${aside(s, ctx)}${subject(s, ctx)}`,
    anim(s, 'body-build'),
  ),
  steps: (s, ctx) => fitFrame(
    `${chip(s, ctx)}${headline(s, ctx)}${para(s, ctx)}${rowList(s.steps || s.rows, ctx, true)}${subject(s, ctx)}`,
    anim(s, 'body-build'),
  ),
  stat(s, ctx) {
    const cells = (s.stats || []).map((v) =>
      `<div class="stat">
        <span class="stat-v" ${fitAttr(T(ctx).statValue)}>${rich(v.value)}</span>
        <span class="stat-l" ${fitAttr(T(ctx).statLabel)}>${rich(v.label)}</span></div>`).join('');
    const grid = cells ? `<div class="stats">${cells}</div>` : '';
    return fitFrame(`${chip(s, ctx)}${headline(s, ctx)}${grid}${para(s, ctx)}`, anim(s, 'body-build'));
  },
  quote: (s, ctx) => fitFrame(`${chip(s, ctx)}
    <blockquote class="quote" ${fitAttr(T(ctx).quote)}>${rich(s.quote || s.headline)}</blockquote>
    ${s.attribution ? `<p class="attrib" ${fitAttr(T(ctx).caption)}>${esc(s.attribution)}</p>` : ''}`,
  'body-quote'),

  cta: (s, ctx) => fitFrame(`${chip(s, ctx)}${headline(s, ctx)}
    ${s.action ? `<p class="action" ${fitAttr(T(ctx).deck)}>${rich(s.action)}</p>` : ''}
    ${para(s, ctx)}${subject(s, ctx)}`, anim(s, 'body-cta')),
};

export const SLIDE_TYPES = Object.keys(TYPES);

const header = (ctx) => `<header class="hdr">
  <span class="hd-h">${esc(ctx.deck.handle || '')}</span>
  <span class="hd-n">${String(ctx.index + 1).padStart(2, '0')}</span>
</header>`;

/**
 * The swipe affordance is suppressed on the last slide, where the deck's
 * byline takes its place. A guide still saying "swipe" with nothing left to
 * swipe to reads as a guide that lost count of itself.
 */
const footer = (ctx) => {
  const last = ctx.index + 1 >= ctx.total;
  return `<footer class="ftr">${last
    ? `<span class="byline">${esc(ctx.deck.footnote || ctx.deck.handle || '')}</span>`
    : '<span class="swipe">Swipe &rarr;</span>'}</footer>`;
};

export function slideHTML(slide, ctx) {
  const build = TYPES[slide.type];
  if (!build) throw new Error(`Unknown slide type "${slide.type}". This theme has: ${SLIDE_TYPES.join(', ')}`);
  return `${header(ctx)}${build(slide, ctx)}${objectVisual(slide, ctx.t, ctx.deck)}${footer(ctx)}`;
}

/**
 * The motion: one band of light crossing the taped card, left to right.
 *
 * The band is a `::after` on the card, so a still slide has no extra DOM. What
 * makes it read as light rather than as a moving rectangle is that the diagram
 * answers it — each node and each wire flares as the band reaches its own x,
 * which is why `nodeGraph` stamps `--nx` on every part. The delay is arithmetic
 * on that number, so a graph can be re-laid-out and the light still arrives in
 * the right order with nothing to update here.
 *
 * All three delays are NEGATIVE, and that is the whole reason the flare sits at
 * 90% of the keyframe timeline rather than in the middle. A positive delay on
 * an infinite animation puts the last frame of the clip somewhere other than
 * frame 0 — the loop visibly jumps. A negative delay is a phase shift: frame 0
 * and the frame after the last are the same picture, so the seam disappears.
 */
function motionCSS(t, c) {
  const spec = t.animate || {};
  const D = spec.seconds || 4;
  const s0 = spec.sweepStart ?? 0.04;   // band clears the left edge
  const s1 = spec.sweepEnd ?? 0.62;     // band clears the right edge
  const pk = spec.peak ?? 0.9;          // where in the keyframes a part flares

  // Geometry of the band, in card widths, so "when does the light reach x"
  // is a solved equation rather than four numbers tuned by eye.
  // FROM and TO are derived from the band width rather than typed, because
  // they are translate percentages of the band's OWN width: narrow the band
  // and a hardcoded end offset stops short, leaving the light parked half on
  // the card in every still.
  const BAND = 0.34, SKEW = 10;
  const FROM = -140, TO = Math.round(100 / BAND + 30);
  const c0 = BAND * (0.5 + FROM / 100), c1 = BAND * (0.5 + TO / 100);
  const perX = (D * (s1 - s0)) / (c1 - c0) / 100;          // seconds per 1% of x
  const base = D * (s0 - pk) - perX * 100 * c0;            // seconds at x = 0
  const delay = `calc(var(--nx, 50) * ${perX.toFixed(5)}s - ${(-base).toFixed(3)}s)`;

  return `
@keyframes wb-sheen {
  0%, ${(s0 * 100).toFixed(1)}%   { transform:translateX(${FROM}%) skewX(-${SKEW}deg); }
  ${(s1 * 100).toFixed(1)}%, 100% { transform:translateX(${TO}%) skewX(-${SKEW}deg); }
}
/* The flare returns to base at both 0% and 100%. Anything that does not is a
   visible cut once per cycle, whatever the delay. */
@keyframes wb-lit {
  0%, ${((pk - 0.12) * 100).toFixed(1)}% { border-color:${c.codeFn}; box-shadow:none; color:${c.cardInk}; }
  ${(pk * 100).toFixed(1)}% { border-color:#F0DDB0; color:#FFF6E2;
    box-shadow:0 0 0 1px rgba(255,240,205,.42), 0 0 26px rgba(255,229,180,.42); }
  100% { border-color:${c.codeFn}; box-shadow:none; color:${c.cardInk}; }
}
@keyframes wb-wire-lit {
  0%, ${((pk - 0.13) * 100).toFixed(1)}% { stroke:${c.gutter}; stroke-width:1.6; }
  ${(pk * 100).toFixed(1)}% { stroke:#F5E4B8; stroke-width:2.6; }
  100% { stroke:${c.gutter}; stroke-width:1.6; }
}

/* The band lives inside the card, which already clips, so it never spills onto
   the paper. It is above the card's contents and below nothing — light falls
   on the whole surface, mark included. */
.is-anim .gcard::after, .is-anim .code::after, .is-anim .term::after {
  content:""; position:absolute; top:-8%; bottom:-8%; left:0;
  width:${(BAND * 100).toFixed(0)}%; z-index:6; pointer-events:none;
  transform:translateX(${FROM}%) skewX(-${SKEW}deg);
  /* The tilt is a skew on the element, NOT an angled gradient. An angled
     gradient inside an upright box has its zero stop on a corner, so alpha is
     non-zero along the box's own left edge and the band arrives as a hard
     vertical seam sliding across the card. Skewing keeps the gradient
     horizontal — zero at both edges, on every row. */
  background:linear-gradient(90deg,
    rgba(255,246,222,0) 0%,   rgba(255,246,222,.03) 26%,
    rgba(255,248,228,.10) 43%, rgba(255,251,238,.28) 50%,
    rgba(255,248,228,.10) 57%, rgba(255,246,222,.03) 74%,
    rgba(255,246,222,0) 100%);
  animation:wb-sheen ${D}s linear infinite both; }

.is-anim .ng-node { animation:wb-lit ${D}s ease-out infinite both;
  animation-delay:${delay}; }
.is-anim .ng-wire:not(.ng-wire-dash) { animation:wb-wire-lit ${D}s ease-out infinite both;
  animation-delay:${delay}; }
`;
}

export function css(ctx) {
  const { t, accent, fontFaces, textureCSS } = ctx;
  const c = t.color, sp = t.space, ty = t.type, r = t.radius, cv = t.canvas;

  return `${fontFaces}
${baseCSS(t)}
body { background:${c.bg}; color:${c.ink}; font-family:Body, system-ui, sans-serif; }

/* Kraft is a fibre, not a flat fill. Two very soft radial washes plus the
   theme grain give the sheet an uneven tone, so the paper reads as stock
   rather than as a brown rectangle. */
body::before { content:""; position:absolute; inset:0; z-index:0; pointer-events:none;
  background-image:
    radial-gradient(62% 44% at 18% 12%, ${c.surface}55, transparent 70%),
    radial-gradient(70% 50% at 84% 88%, ${c.bgDeep}66, transparent 72%); }

.hdr, .ftr { position:absolute; left:${cv.margin}px; right:${cv.margin}px; z-index:40;
  display:flex; align-items:center; }
.hdr { top:${Math.round(cv.safeTop * 0.34)}px; justify-content:center; }
.hd-h { font-family:BodyMid; font-size:${ty.footer.size}px; color:${c.inkSoft}; }
.hd-n { position:absolute; right:0; font-family:Display; font-weight:800;
  font-size:${ty.footer.size + 6}px; color:${c.ink}; }
.ftr { bottom:${Math.round(cv.safeBottom * 0.3)}px; justify-content:flex-end; }
.swipe, .byline { font-family:Display; font-weight:800; font-size:${ty.footer.size}px;
  letter-spacing:${ty.footer.tracking}em; text-transform:uppercase; color:${c.ink}; }
.byline { font-family:BodyMid; text-transform:none; letter-spacing:0; color:${c.inkFaint}; }

.body { justify-content:flex-start; top:${Math.round(cv.safeTop + 8)}px; }
.body-quote, .body-cta { justify-content:center; }
.fit { gap:${sp.sm}px; }
/* A height floor on the frame, so the card's margin-top:auto has free space to
   consume. Without it the wrapper sizes exactly to its content, auto resolves
   to zero, and the card only reaches the foot of the page on the slides where
   it happens to be tall enough anyway. The floor stops just short of the box,
   which leaves the grow pass nothing to do — the type tokens above are the
   sizes that ship. Longer copy still overflows and still shrinks. */
.body-build .fit, .body-hook .fit { min-height:${Math.round(cv.height * 0.8)}px; }

/* the label chip */
.chip { align-self:flex-start; font-family:MonoBold; letter-spacing:${ty.eyebrow.tracking}em;
  text-transform:uppercase; background:${c.chip}; color:${c.chipInk};
  padding:9px 18px; margin-bottom:${sp.xs}px; }

/* the two-line headline */
.hl { display:flex; flex-direction:column; }
.hl-1 { font-family:Display; font-weight:800; line-height:${ty.headline.leading};
  letter-spacing:${ty.headline.tracking}em; color:${c.ink}; }
.hl-2 { font-family:DisplayItalic; font-style:italic; line-height:${ty.headlineItalic.leading};
  letter-spacing:${ty.headlineItalic.tracking}em; color:${accent}; margin-top:-.04em; }

.deck { font-family:BodyMid; font-size:${ty.deck.size}px; line-height:${ty.deck.leading};
  color:${c.inkSoft}; }
.para { font-family:Body; font-size:${ty.body.size}px; line-height:${ty.body.leading};
  color:${c.ink}; }
.para b, .para .ac, .deck b, .deck .ac { font-family:BodyMid; font-weight:600; color:${c.ink}; }
/* Emphasis in the body is weight, never colour. The red belongs to the second
   headline line and to the mark on the card; a third red thing on the page and
   none of them are pointing at anything. */
.aside { font-family:DisplayItalic; font-style:italic; font-size:${ty.aside.size}px;
  line-height:${ty.aside.leading}; color:${c.inkSoft}; margin-top:${sp.xs}px; }
.aside .ac, .aside b { color:${c.inkSoft}; font-weight:400; }

/* ── the taped card ───────────────────────────────────────────────────
   The tape is two strips over the top corners, sitting above the card so it
   reads as holding it down. The card carries a real shadow because it is the
   only object on the page that is meant to look like it has thickness. */
/* The card is pushed to the floor of the frame. Everything above it is
   caption, and a caption sits above the thing it captions — left in normal
   flow the slack piles up under the card instead, which reads as a slide that
   ran out of content rather than one built around a subject. */
.paper { position:relative; margin-top:auto; padding-top:${sp.lg}px;
  margin-bottom:${sp.xl}px; }
/* The tape straddles the card's top edge, which sits one padding-top down.
   Anchored to the top of .paper instead it rides up into the aside line and
   prints over the copy. */
.tape { position:absolute; top:${sp.lg - 16}px; width:132px; height:38px; z-index:3;
  background:${c.tape}; border-left:1px solid ${c.tapeEdge};
  border-right:1px solid ${c.tapeEdge};
  box-shadow:0 1px 3px rgba(60,48,30,.22); }
.tape-l { left:-24px; }
.tape-r { right:-24px; }

.code, .term, .shot, .gcard { position:relative; z-index:2; overflow:hidden;
  border-radius:${r.md}px; box-shadow:0 16px 34px rgba(48,36,18,.34); }
.code, .gcard { background:${c.card}; }
/* baseCSS lays out .term-bar and .shot-bar but knows nothing about .code-bar,
   so this rule has to do the whole job. Without the display:flex the traffic
   lights and the filename stack as blocks and the bar collapses. */
.code-bar { display:flex; align-items:center; gap:9px; }
.code-bar, .term-bar, .shot-bar { padding:13px ${sp.md}px; background:${c.cardBar}; }
.code-bar i, .term-bar i, .shot-bar i { width:14px; height:14px; border-radius:50%;
  flex:0 0 auto; }
.code-bar i:nth-child(1) { background:#E8615A; }
.code-bar i:nth-child(2) { background:#E9BE4E; }
.code-bar i:nth-child(3) { background:#5FC456; }
.code-bar span, .term-bar span, .shot-bar span { flex:1 1 auto; text-align:center;
  font-family:Mono; font-size:${ty.codeTitle.size}px; letter-spacing:${ty.codeTitle.tracking}em;
  color:${c.gutter}; margin-right:52px; }

.code-body { display:flex; padding:${sp.md}px ${sp.md}px ${sp.md}px 0; }
.code-gutter { display:flex; flex-direction:column; flex:0 0 auto;
  width:66px; text-align:right; padding-right:${sp.md}px; }
.code-gutter span { font-family:Mono; font-size:${ty.code.size}px;
  line-height:${ty.code.leading}; color:${c.gutter}; }
.code-lines { display:flex; flex-direction:column; min-width:0; flex:1 1 auto; }
.cl { font-family:Mono; font-size:${ty.code.size}px; line-height:${ty.code.leading};
  color:${c.cardInk}; white-space:pre; }
.c-kw { color:${c.codeKw}; }
.c-str { color:${c.codeStr}; }
.c-num { color:${c.codeNum}; }
.c-com { color:${c.codeCom}; font-style:italic; }
.c-fn { color:${c.codeFn}; }
.c-type { color:${c.codeType}; }
.c-dec { color:${c.codeDec}; }
.c-pun { color:${c.codePun}; }

/* ── the anchored mark ────────────────────────────────────────────────
   The token stays in normal flow and the drawing is stretched over it, so a
   three-character token and a thirty-character one both get a mark that fits.
   Nothing is measured at render time and nothing has to be positioned by
   hand, which is what makes the annotation survive a copy edit. */
.anno { position:relative; font-style:normal; display:inline-block; }
.anno svg { position:absolute; left:-16px; top:-13px;
  width:calc(100% + 32px); height:calc(100% + 26px); z-index:4;
  pointer-events:none; overflow:visible; }
.anno-underline svg { top:auto; bottom:-14px; height:20px; }
.anno-label { position:absolute; right:6px; bottom:-46px; z-index:5;
  font-family:Hand; font-size:34px; color:${accent}; transform:rotate(-2.5deg);
  white-space:nowrap; }

/* the three traits */
.traits { display:flex; justify-content:space-between; gap:${sp.md}px;
  margin-top:auto; margin-bottom:${sp.xl}px; }
.trait { display:flex; flex-direction:column; align-items:center; gap:${sp.sm}px;
  flex:1 1 0; }
.trait-i { width:92px; height:92px; color:${accent}; line-height:0; }
.trait-i svg { width:92px; height:92px; stroke-width:1.3; }
.trait-l { font-family:DisplayItalic; font-style:italic; color:${accent};
  text-align:center; }

/* the shared cards, restyled rather than re-implemented */
.term { background:${c.card}; }
.term-body { padding:${sp.md}px; gap:4px; font-family:Mono;
  font-size:${ty.code.size}px; line-height:${ty.code.leading}; color:${c.cardInk}; }
.term-bar i, .shot-bar i { background:${c.cardRule}; }
.shot { background:${c.card}; }
.gcard { padding:${sp.lg}px ${sp.md}px; }
.ng-node { font-family:Mono; font-size:19px; color:${c.cardInk};
  background:${c.cardBar}; border:1.5px solid ${c.codeFn}; border-radius:8px;
  padding:8px 14px; }
/* Badge sizing has to be stated here. Simple Icons marks ship with a viewBox
   and no width, so an unsized one lays out at the SVG default 300x150 and
   throws the whole diagram off the card. */
.ng-logo, .ng-ico { flex:0 0 auto; width:24px; height:24px; line-height:0; }
.ng-logo svg, .ng-ico svg { width:24px; height:24px; }
.ng-hub { border-color:${c.codeDec}; }
.ng-hub .ng-ico { color:${c.codeDec}; }
.ng-txt b { font-family:MonoBold; }
.ng-txt em { color:${c.gutter}; font-size:15px; }
.ng-wire { stroke:${c.gutter}; stroke-width:1.6; }
.ng-wire-dash { stroke-dasharray:5 4; stroke:${accent}; }
.ng-pin { fill:${c.gutter}; }
.ng-elab { font-family:Hand; font-size:24px; color:${accent}; }
/* The travelling dot. Same warm white as the sheen and the node flare, so the
   card reads as one light source rather than three effects. The halo is a
   shadow rather than a bigger dot: it has to sit over a 1.6px wire without
   swallowing it. Sizing and colour only — the primitive owns display and
   timing, and keeps the dot hidden on slides that never move. */
.ng-dot { width:11px; height:11px; border-radius:50%; background:#FFF6E2;
  box-shadow:0 0 0 3px rgba(245,228,184,.30), 0 0 16px 4px rgba(255,229,180,.55); }

.rows { list-style:none; display:flex; flex-direction:column; gap:${sp.xs}px;
  margin-top:${sp.xs}px; }
.row { display:flex; align-items:flex-start; gap:${sp.md}px;
  border-bottom:1.5px solid ${c.rule}; padding:${sp.sm}px 0; }
.rnum, .rico { flex:0 0 auto; font-family:MonoBold; font-size:19px; width:30px;
  padding-top:3px; color:${accent}; }
.rico svg { width:22px; height:22px; }
.rtxt { display:flex; flex-direction:column; gap:2px; min-width:0; flex:1 1 auto; }
.rname { font-family:BodyMid; font-weight:600; color:${c.ink}; }
.rbody { font-family:Body; font-size:${ty.rowBody.size}px;
  line-height:${ty.rowBody.leading}; color:${c.inkSoft}; }

.stats { display:grid; grid-template-columns:1fr 1fr; gap:${sp.md}px;
  margin:${sp.md}px 0; }
.stat { display:flex; flex-direction:column; gap:4px; }
.stat-v { font-family:Display; font-weight:800; color:${accent}; letter-spacing:-.03em; }
.stat-l { font-family:Mono; font-size:${ty.statLabel.size}px; text-transform:uppercase;
  letter-spacing:.08em; color:${c.inkSoft}; }

.quote { font-family:DisplayItalic; font-style:italic; line-height:${ty.quote.leading};
  color:${c.ink}; text-wrap:balance; }
.attrib { font-family:Mono; font-size:${ty.caption.size}px; text-transform:uppercase;
  letter-spacing:.12em; color:${c.inkFaint}; margin-top:${sp.sm}px; }

.action { align-self:flex-start; font-family:MonoBold; background:${c.chip};
  color:${c.chipInk}; padding:${sp.sm}px ${sp.lg}px; margin-top:${sp.md}px; }
.action .ac { color:${c.chipInk}; }

.object { right:${Math.round(cv.margin * 0.6)}px; bottom:${Math.round(cv.safeBottom * 1.1)}px; }

${motionCSS(t, c)}
${textureCSS}
`;
}
