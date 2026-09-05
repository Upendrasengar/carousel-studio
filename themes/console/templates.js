// Slide templates for the console theme.
//
// Near-black with an amber glow. Two things carry this pack:
//
//   1. A wireframe node graph as the *standard* visual, not an optional extra.
//      Every content slide is expected to diagram something.
//   2. A labelled capability bar along the bottom whose active segment
//      advances. It is a progress indicator and a table of contents at once —
//      the reader always knows which part of the build they are looking at.
//
// The headline splits on a newline: line one white, line two amber. Same
// device as parchment-vault, warmer register.

import {
  esc, rich, fitAttr, fitFrame, mediaCard, objectVisual, rowBadge, baseCSS,
  standardSlides, nodeGraph,
} from '../../scripts/lib/blocks.js';
import { icon } from '../../scripts/lib/icons.js';
import { logo } from '../../scripts/lib/assets.js';
import * as marks from '../../scripts/lib/marks.js';

const T = (c) => c.t.type;

/** Two-tone headline: line one in ink, line two in the accent. */
function headline(s, c, mul = 1) {
  if (!s.headline) return '';
  const [a, b] = String(s.headline).split('\n');
  return `<h1 class="hl" ${fitAttr(T(c).headline, mul)}>${rich(a)}${b ? `<span class="hl-2">${rich(b)}</span>` : ''}</h1>`;
}
const headlineXL = (s, c) => headline(s, c, 1.14);
const deckLine = (s, c) => s.deck ? `<p class="deck" ${fitAttr(T(c).deck)}>${rich(s.deck)}</p>` : '';
const para = (s, c) => s.body ? `<p class="para" ${fitAttr(T(c).body)}>${rich(s.body)}</p>` : '';

function rowList(list, ctx, numbered) {
  if (!list || !list.length) return '';
  const { t } = ctx;
  return `<ul class="rows">${list.map((r, i) => {
    const tint = t.color.chipTints[i % t.color.chipTints.length];
    const ink = t.color.chipInks[i % t.color.chipInks.length];
    const badge = numbered
      ? `<span class="chip chip-num" style="background:${tint};color:${ink}">${i + 1}</span>`
      : rowBadge(r, { iconFn: icon, tint, ink });
    return `<li class="row">${badge}<span class="rtxt">
      <span class="rt" ${fitAttr(t.type.rowTitle)}>${rich(r.title)}</span>
      ${r.body ? `<span class="rb" ${fitAttr(t.type.rowBody)}>${rich(r.body)}</span>` : ''}
    </span></li>`;
  }).join('')}</ul>`;
}

const PARTS = {
  headline, headlineXL, deckLine, para,
  rows: (s, c) => rowList(s.rows, c, false),
  steps: (s, c) => rowList(s.steps || s.rows, c, true),
  media: (s, c) => mediaCard(s, c.accent),
  stats(s, c) {
    const cells = (s.stats || []).map((v) => `<div class="stat">
      <span class="stat-v" ${fitAttr(T(c).statValue)}>${rich(v.value)}</span>
      <span class="stat-l" ${fitAttr(T(c).statLabel)}>${rich(v.label)}</span></div>`).join('');
    return cells ? `<div class="stats stats-${Math.min(2, (s.stats || []).length)}">${cells}</div>` : '';
  },
  quote: (s, c) => `<div class="quote-wrap">
    <blockquote class="quote" ${fitAttr(T(c).quote)}>${rich(s.quote || s.headline)}</blockquote>
    ${s.attribution ? `<p class="attrib" ${fitAttr(T(c).caption)}>${esc(s.attribution)}</p>` : ''}</div>`,
  action: (s, c) => s.action
    ? `<p class="action" ${fitAttr(T(c).deck)}>${rich(s.action)}
       <span class="mk mk-circle">${marks.circle(c.rng, 400, 118, { color: c.accent, weight: 6 })}</span></p>` : '',
};

const TYPES = {
  ...standardSlides(PARTS),

  /** The pack's default content slide: a headline over a wired diagram. */
  wire(s, ctx) {
    const { t } = ctx;
    return fitFrame(`
      ${headline(s, ctx)}
      ${deckLine(s, ctx)}
      ${nodeGraph(s.graph, { iconFn: icon, logoFn: (n) => logo(n, t.color.inkSoft), height: 560 })}
      ${para(s, ctx)}`, 'body-wire');
  },
};

export const SLIDE_TYPES = Object.keys(TYPES);

function header(slide, ctx) {
  const { deck, index, total } = ctx;
  const counter = deck.showCounter === false ? ''
    : `<span class="counter">${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span>`;
  const label = slide.eyebrow || deck.brand || '';
  return `<header class="hdr">
    <span class="brand"><i class="orn"></i>${esc(label)}<i class="orn"></i></span>${counter}</header>`;
}

/**
 * The capability bar. `deck.rail.items` names the parts of the build once;
 * each slide says which part it is on. It is a progress indicator and a table
 * of contents at the same time — the reader always knows where they are, and
 * what is still coming.
 */
function railBar(slide, ctx) {
  const items = ctx.deck.rail?.items || [];
  if (!items.length) return '';
  const at = Number(slide.railAt ?? 0);
  return `<div class="rail">${items.map((it, i) => `
    <span class="rseg${i + 1 === at ? ' rseg-on' : ''}">
      ${it.icon ? `<i>${icon(it.icon)}</i>` : ''}<b>${esc(it.label)}</b>
    </span>`).join('')}</div>`;
}

const footer = (ctx) => ctx.deck.handle
  ? `<footer class="ftr"><span>${esc(ctx.deck.handle)}</span></footer>` : '';

export function slideHTML(slide, ctx) {
  const build = TYPES[slide.type];
  if (!build) throw new Error(`Unknown slide type "${slide.type}". This theme has: ${SLIDE_TYPES.join(', ')}`);
  return `${header(slide, ctx)}${build(slide, ctx)}${objectVisual(slide, ctx.t, ctx.deck)}${railBar(slide, ctx)}${footer(ctx)}`;
}

export function css(ctx) {
  const { t, accent, fontFaces, textureCSS } = ctx;
  const c = t.color, sp = t.space, ty = t.type, r = t.radius, cv = t.canvas;
  return `${fontFaces}
${baseCSS(t)}
body { background:${c.bg}; color:${c.ink}; font-family:Body, system-ui, sans-serif;
  background-image:
    radial-gradient(70% 44% at 50% 42%, ${accent}1C, transparent 68%),
    radial-gradient(120% 60% at 50% 108%, ${accent}12, transparent 70%); }

.hdr { position:absolute; left:${cv.margin}px; right:${cv.margin}px;
  top:${Math.round(cv.safeTop * 0.34)}px; z-index:40;
  display:flex; align-items:center; justify-content:space-between; }
.brand { display:flex; align-items:center; gap:12px; font-family:Mono;
  font-size:${ty.eyebrow.size}px; letter-spacing:${ty.eyebrow.tracking}em;
  text-transform:uppercase; color:${c.inkSoft}; }
.orn { width:26px; height:1px; background:${accent}; opacity:.7; }
.counter { font-family:Mono; font-size:${ty.eyebrow.size}px; letter-spacing:.14em;
  color:${accent}; border:1px solid ${accent}55; border-radius:${r.sm}px; padding:5px 11px; }

.ftr { position:absolute; left:0; right:0; bottom:${Math.round(cv.safeBottom * 0.24)}px;
  display:flex; justify-content:center; z-index:50; font-family:Mono;
  font-size:${ty.footer.size}px; color:${c.inkFaint}; letter-spacing:${ty.footer.tracking}em; }

/* Content clears the capability bar, which owns the foot of every slide. */
.body { justify-content:flex-start; bottom:${Math.round(cv.safeBottom + 76)}px; }
.body-hook, .body-cta, .body-quote, .body-wire { justify-content:center; }
.fit { gap:${sp.md}px; }

.hl { font-family:Display; font-weight:700; font-size:${ty.headline.size}px;
  line-height:${ty.headline.leading}; letter-spacing:${ty.headline.tracking}em;
  color:${c.ink}; text-wrap:balance; }
.hl-2 { display:block; color:${accent}; }
.ac { color:${accent}; }
.deck { font-family:Body; font-size:${ty.deck.size}px; line-height:${ty.deck.leading};
  color:${c.inkSoft}; max-width:84%; }
.para { font-family:Body; font-size:${ty.body.size}px; line-height:${ty.body.leading};
  color:${c.inkSoft}; max-width:90%; }

/* ── node graph ───────────────────────────────────────────────────── */
.ng-wire { stroke:${accent}; stroke-width:1.5; opacity:.55;
  filter:drop-shadow(0 0 5px ${accent}88); }
.ng-wire-dash { stroke-dasharray:5 4; opacity:.35; }
.ng-wire-live { opacity:1; stroke-width:2.2; }
.ng-pin { fill:${accent}; stroke:none; }
.ng-node { background:${c.panel}; border:1px solid ${accent}44; border-radius:${r.md}px;
  padding:11px 15px; box-shadow:0 0 24px -10px ${accent}66, inset 0 1px 0 #ffffff08; }
.ng-hub { border-color:${accent}; background:${c.surface};
  box-shadow:0 0 46px -8px ${accent}88, inset 0 1px 0 #ffffff10; }
.ng-ghost { opacity:.42; border-color:${c.rule}; box-shadow:none; }
.ng-ico { color:${accent}; }
.ng-ico svg { width:20px; height:20px; }
.ng-logo { color:${c.inkSoft}; }
.ng-logo svg { width:20px; height:20px; }
.ng-txt b { font-family:BodyMid; font-size:${ty.node.size}px; color:${c.ink}; }
.ng-txt em { font-family:Mono; font-size:15px; color:${c.inkFaint}; margin-top:2px; }
.ng-elab { font-family:Mono; font-size:14px; letter-spacing:.14em; text-transform:uppercase;
  color:${accent}; background:${c.bg}; padding:2px 7px; border-radius:3px; }

/* ── the capability bar ───────────────────────────────────────────── */
.rail { position:absolute; left:${cv.margin}px; right:${cv.margin}px;
  bottom:${Math.round(cv.safeBottom * 0.58)}px; z-index:45;
  display:flex; gap:6px; border-top:1px solid ${c.rule}; padding-top:${sp.sm}px; }
.rseg { flex:1; display:flex; align-items:center; justify-content:center; gap:7px;
  padding:9px 6px; border-radius:${r.sm}px; opacity:.4; }
.rseg i { color:${c.inkSoft}; display:grid; place-items:center; }
.rseg i svg { width:16px; height:16px; }
.rseg b { font-family:Mono; font-weight:400; font-size:14px; letter-spacing:.16em;
  text-transform:uppercase; color:${c.inkSoft}; }
/* The active part is the only lit segment — it is a position cue, not decoration. */
.rseg-on { opacity:1; background:${accent}1A; border:1px solid ${accent}55; }
.rseg-on i, .rseg-on b { color:${accent}; }

.rows { list-style:none; display:flex; flex-direction:column; }
.row { display:flex; gap:${sp.md}px; align-items:flex-start;
  padding:${sp.sm}px 0 ${sp.md}px; border-bottom:1px solid ${c.rule}; }
.row:first-child { border-top:1px solid ${c.rule}; padding-top:${sp.md}px; }
.chip { flex:0 0 auto; width:44px; height:44px; border-radius:${r.sm}px; display:grid; place-items:center; }
.chip svg { width:23px; height:23px; }
.chip-num { font-family:Mono; font-size:21px; }
.rtxt { display:flex; flex-direction:column; gap:3px; padding-top:3px; }
.rt { font-family:BodyMid; font-weight:600; font-size:${ty.rowTitle.size}px; color:${c.ink}; }
.rb { font-family:Body; font-size:${ty.rowBody.size}px; line-height:${ty.rowBody.leading}; color:${c.inkSoft}; }

.stats { display:grid; gap:${sp.sm}px; }
.stats-2 { grid-template-columns:1fr 1fr; }
.stat { background:${c.panel}; border:1px solid ${accent}33; border-radius:${r.md}px;
  padding:${sp.md}px; display:flex; flex-direction:column; gap:5px;
  box-shadow:0 0 30px -16px ${accent}66; }
.stat-v { font-family:Display; font-weight:700; font-size:${ty.statValue.size}px; color:${accent}; }
.stat-l { font-family:Mono; font-size:${ty.statLabel.size}px; text-transform:uppercase;
  letter-spacing:.1em; color:${c.inkSoft}; }

.quote-wrap { border-left:3px solid ${accent}; padding-left:${sp.lg}px; }
.quote { font-family:DisplayItalic; font-style:italic; font-weight:700;
  font-size:${ty.quote.size}px; line-height:${ty.quote.leading}; color:${c.ink}; text-wrap:balance; }
.attrib { font-family:Mono; font-size:${ty.caption.size}px; color:${c.inkFaint};
  text-transform:uppercase; letter-spacing:.14em; margin-top:${sp.sm}px; }

.action { position:relative; display:inline-block; margin:26px 0;
  font-family:Mono; font-size:${ty.deck.size}px; color:${c.ink}; padding:${sp.sm}px ${sp.md}px; }
.mk-circle { position:absolute; left:-24px; top:50%; transform:translateY(-50%); }

.term { background:${c.panel}; border:1px solid ${c.rule}; border-radius:${r.md}px; }
.term-bar { padding:11px ${sp.md}px; font-family:Mono; font-size:15px; color:${c.inkFaint}; }
.term-bar i { background:${c.rule}; }
.term-body { padding:${sp.md}px; gap:6px; font-size:19px; line-height:1.44; color:${c.inkSoft}; }
.shot { background:${c.panel}; border:1px solid ${c.rule}; border-radius:${r.md}px; }
.shot-bar { padding:11px ${sp.md}px; background:${c.bg}; color:${c.inkFaint}; font-family:Mono; font-size:15px; }
.shot-bar i { background:${c.rule}; }

.object { right:${Math.round(cv.margin * 0.5)}px; bottom:${Math.round(cv.safeBottom + 90)}px; }

${textureCSS}
`;
}
