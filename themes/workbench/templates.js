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
    inner = `<div class="gcard">${nodeGraph(m.graph || m, {
      iconFn: icon, logoFn: logo, height: m.height || 420,
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
    'body-hook',
  ),

  /** The signature slide: caption, then the taped card it is captioning. */
  build: (s, ctx) => fitFrame(
    `${chip(s, ctx)}${headline(s, ctx)}${para(s, ctx)}${rowList(s.rows, ctx, false)}${aside(s, ctx)}
     ${traits(s, ctx)}${subject(s, ctx)}`,
    'body-build',
  ),

  point: (s, ctx) => fitFrame(
    `${chip(s, ctx)}${headline(s, ctx)}${para(s, ctx)}${rowList(s.rows, ctx, false)}${aside(s, ctx)}${subject(s, ctx)}`,
    'body-build',
  ),
  steps: (s, ctx) => fitFrame(
    `${chip(s, ctx)}${headline(s, ctx)}${para(s, ctx)}${rowList(s.steps || s.rows, ctx, true)}${subject(s, ctx)}`,
    'body-build',
  ),
  stat(s, ctx) {
    const cells = (s.stats || []).map((v) =>
      `<div class="stat">
        <span class="stat-v" ${fitAttr(T(ctx).statValue)}>${rich(v.value)}</span>
        <span class="stat-l" ${fitAttr(T(ctx).statLabel)}>${rich(v.label)}</span></div>`).join('');
    const grid = cells ? `<div class="stats">${cells}</div>` : '';
    return fitFrame(`${chip(s, ctx)}${headline(s, ctx)}${grid}${para(s, ctx)}`, 'body-build');
  },
  quote: (s, ctx) => fitFrame(`${chip(s, ctx)}
    <blockquote class="quote" ${fitAttr(T(ctx).quote)}>${rich(s.quote || s.headline)}</blockquote>
    ${s.attribution ? `<p class="attrib" ${fitAttr(T(ctx).caption)}>${esc(s.attribution)}</p>` : ''}`,
  'body-quote'),

  cta: (s, ctx) => fitFrame(`${chip(s, ctx)}${headline(s, ctx)}
    ${s.action ? `<p class="action" ${fitAttr(T(ctx).deck)}>${rich(s.action)}</p>` : ''}
    ${para(s, ctx)}${subject(s, ctx)}`, 'body-cta'),
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
.ng-txt b { font-family:MonoBold; }
.ng-txt em { color:${c.gutter}; font-size:15px; }
.ng-wire { stroke:${c.gutter}; stroke-width:1.6; }
.ng-wire-dash { stroke-dasharray:5 4; stroke:${accent}; }
.ng-pin { fill:${c.gutter}; }
.ng-elab { font-family:Hand; font-size:24px; color:${accent}; }

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

${textureCSS}
`;
}
