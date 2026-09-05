// Slide templates for the kinetic theme.
//
// Motion-first. The hook renders as a seamless looping MP4; every other slide
// is the same design held still, so a deck reads as one thing whether or not
// you rendered the video.
//
// Two rules govern the animation, and they are the whole craft of it:
//
//   1. Ambient motion must END where it STARTS — the drifting field returns to
//      its origin at 100%, so the ground never jumps when the loop restarts.
//      ENTRANCE motion is different: it assembles once and then holds for the
//      rest of the cycle. When the loop restarts it replays, which is what a
//      viewer expects from a looping hook. Every delayed track needs
//      `fill-mode: both`, or during its delay it shows the element's normal
//      state instead of its from-state and the first frames look broken.
//   2. Motion carries meaning or it does not exist. Words rise into place
//      because the claim assembles; the accent bar sweeps because it is
//      marking one phrase. Nothing moves to prove that it can.
//
// Frames are seeked, not waited on — see renderAnimated in scripts/render.js —
// so an animated slide is still byte-identical on re-render.

import {
  esc, rich, fitAttr, fitFrame, mediaCard, objectVisual, rowBadge, baseCSS,
  standardSlides,
} from '../../scripts/lib/blocks.js';
import { icon } from '../../scripts/lib/icons.js';
import { mascotSVG } from '../../scripts/lib/mascot.js';
import * as marks from '../../scripts/lib/marks.js';

const T = (c) => c.t.type;

/**
 * The headline, split into lines that each rise from behind a mask.
 *
 * Each line gets its own delay so the claim assembles top to bottom. The
 * emphasised span is wrapped so an accent bar can sweep it after the last
 * line has landed.
 */
function headline(s, c, mul = 1) {
  if (!s.headline) return '';
  const lines = String(s.headline).split('\n');
  const body = lines.map((l, i) => `
    <span class="hline" style="--i:${i}">
      <span class="hmask">${rich(l)}</span>
    </span>`).join('');
  return `<h1 class="hl" ${fitAttr(T(c).headline, mul)} style="--lines:${lines.length}">${body}</h1>`;
}
const headlineXL = (s, c) => headline(s, c, 1.06);
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
    return `<li class="row" style="--i:${i}">${badge}<span class="rtxt">
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
    const cells = (s.stats || []).map((v, i) => `<div class="stat" style="--i:${i}">
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

const TYPES = { ...standardSlides(PARTS) };
export const SLIDE_TYPES = Object.keys(TYPES);

function figure(slide, ctx) {
  const { t } = ctx;
  if (slide.mascot === false) return '';
  const pose = slide.mascot || t.mascot.poseByType[slide.type] || t.mascot.defaultPose;
  return `<div class="figure" data-decor="mascot">${mascotSVG(pose, t.mascot.px, { palette: t.mascotPalette })}</div>`;
}

const header = (s, ctx) => `<header class="hdr">
  <span class="eb">${esc(s.eyebrow || ctx.deck.brand || '')}</span>
  <span class="ct">${String(ctx.index + 1).padStart(2, '0')} / ${String(ctx.total).padStart(2, '0')}</span></header>`;
const footer = (ctx) => `<footer class="ftr">
  <span>${esc(ctx.deck.handle || '')}</span>
  <span>${esc(ctx.deck.footnote || '')}</span></footer>`;

export function slideHTML(slide, ctx) {
  const build = TYPES[slide.type];
  if (!build) throw new Error(`Unknown slide type "${slide.type}". This theme has: ${SLIDE_TYPES.join(', ')}`);
  // The drifting field is the only thing that moves on a still slide too — it
  // is what stops the ground reading as flat black.
  return `<div class="field"></div><div class="scan"></div>
    ${header(slide, ctx)}${build(slide, ctx)}${figure(slide, ctx)}${objectVisual(slide, ctx.t, ctx.deck)}${footer(ctx)}`;
}

export function css(ctx) {
  const { t, accent, fontFaces, textureCSS } = ctx;
  const c = t.color, sp = t.space, ty = t.type, r = t.radius, cv = t.canvas;
  const D = (t.animate?.seconds || 4);
  return `${fontFaces}
${baseCSS(t)}
body { background:${c.bg}; color:${c.ink}; font-family:Body, system-ui, sans-serif; }

/* ── the moving ground ────────────────────────────────────────────── */
/* Two offset gradients drifting on a cycle that divides the loop length, so
   the field is in the same place at t=0 and t=D. */
.field { position:absolute; inset:-20%; z-index:0;
  background:
    radial-gradient(38% 30% at 26% 30%, ${accent}2E, transparent 62%),
    radial-gradient(34% 28% at 74% 68%, ${c.accent2}22, transparent 64%);
  animation:drift ${D}s linear infinite; }
@keyframes drift {
  0%   { transform:translate3d(0,0,0) scale(1); }
  50%  { transform:translate3d(2.5%,-2%,0) scale(1.05); }
  100% { transform:translate3d(0,0,0) scale(1); }
}
.scan { position:absolute; inset:0; z-index:1; pointer-events:none;
  background:repeating-linear-gradient(0deg, #ffffff05 0 1px, transparent 1px 3px); }

.hdr, .ftr { position:absolute; left:${cv.margin}px; right:${cv.margin}px; z-index:40;
  display:flex; align-items:center; justify-content:space-between;
  font-family:Mono; font-size:${ty.footer.size}px;
  letter-spacing:${ty.footer.tracking}em; color:${c.inkFaint}; }
.hdr { top:${Math.round(cv.safeTop * 0.36)}px; }
.ftr { bottom:${Math.round(cv.safeBottom * 0.32)}px; }
.eb { text-transform:uppercase; color:${accent}; }

.body { justify-content:flex-start; }
.body-hook, .body-cta, .body-quote { justify-content:center; }
.fit { gap:${sp.md}px; }

/* ── the headline ─────────────────────────────────────────────────── */
.hl { font-family:Display; font-weight:700; text-transform:uppercase;
  line-height:${ty.headline.leading}; letter-spacing:${ty.headline.tracking}em;
  color:${c.ink}; display:flex; flex-direction:column; }
/* Each line is a window; the text inside rises through it. */
.hline { display:block; overflow:hidden; }
.hmask { display:block; transform:translateY(0);
  animation:rise ${D}s cubic-bezier(.2,.8,.2,1) infinite both;
  animation-delay:calc(var(--i) * 0.12s); }
@keyframes rise {
  0%   { transform:translateY(105%); }
  /* Landed by a fifth of the cycle, then held — a loop that eases back out
     reads as a glitch once a second. */
  20%, 100% { transform:translateY(0); }
}
.ac { color:${accent}; position:relative; }
/* The bar sweeps the emphasis after the last line has landed. */
.ac:after { content:""; position:absolute; left:-2%; right:-2%; top:12%; bottom:14%;
  background:${accent}; z-index:-1; transform-origin:left center;
  animation:sweep ${D}s cubic-bezier(.2,.8,.2,1) infinite both; animation-delay:.45s; }
@keyframes sweep {
  0%, 8%   { transform:scaleX(0); }
  26%, 100% { transform:scaleX(1); }
}
.hl .ac { color:${c.accentInk}; }

.deck { font-family:Body; font-size:${ty.deck.size}px; line-height:${ty.deck.leading};
  color:${c.inkSoft}; max-width:84%;
  animation:fade ${D}s ease-out infinite both; animation-delay:.7s; }
@keyframes fade { 0%, 14% { opacity:0; } 34%, 100% { opacity:1; } }
.para { font-family:Body; font-size:${ty.body.size}px; line-height:${ty.body.leading};
  color:${c.inkSoft}; max-width:90%; }

.rows { list-style:none; display:flex; flex-direction:column; }
.row { display:flex; gap:${sp.md}px; align-items:flex-start;
  padding:${sp.sm}px 0 ${sp.md}px; border-bottom:1px solid ${c.rule}; }
.row:first-child { border-top:1px solid ${c.rule}; padding-top:${sp.md}px; }
.chip { flex:0 0 auto; width:48px; height:48px; border-radius:${r.sm}px; display:grid; place-items:center; }
.chip svg { width:25px; height:25px; }
.chip-num { font-family:Display; font-size:24px; }
.rtxt { display:flex; flex-direction:column; gap:3px; padding-top:3px; }
.rt { font-family:BodyMid; font-weight:600; font-size:${ty.rowTitle.size}px; color:${c.ink}; }
.rb { font-family:Body; font-size:${ty.rowBody.size}px; line-height:${ty.rowBody.leading}; color:${c.inkSoft}; }

.stats { display:grid; gap:${sp.sm}px; }
.stats-2 { grid-template-columns:1fr 1fr; }
.stat { background:${c.surface}; border:1px solid ${c.rule}; border-radius:${r.md}px;
  padding:${sp.md}px; display:flex; flex-direction:column; gap:5px; }
.stat-v { font-family:Display; font-size:${ty.statValue.size}px; color:${accent}; }
.stat-l { font-family:Mono; font-size:${ty.statLabel.size}px; text-transform:uppercase;
  letter-spacing:.08em; color:${c.inkSoft}; }

.quote-wrap { border-left:4px solid ${accent}; padding-left:${sp.lg}px; }
.quote { font-family:Display; text-transform:uppercase; font-size:${ty.quote.size}px;
  line-height:${ty.quote.leading}; color:${c.ink}; }
.attrib { font-family:Mono; font-size:${ty.caption.size}px; text-transform:uppercase;
  letter-spacing:.14em; color:${c.inkFaint}; margin-top:${sp.sm}px; }

.action { position:relative; display:inline-block; margin:26px 0;
  font-family:Mono; font-size:${ty.deck.size}px; color:${c.ink}; padding:${sp.sm}px ${sp.md}px; }
.mk-circle { position:absolute; left:-24px; top:50%; transform:translateY(-50%); }

.figure { position:absolute; right:${Math.round(cv.margin * 0.5)}px;
  bottom:${Math.round(cv.safeBottom * 0.6)}px; z-index:20; line-height:0; }

.term { background:#08080B; border:1px solid ${c.rule}; border-radius:${r.md}px; }
.term-bar { padding:11px ${sp.md}px; font-family:Mono; font-size:16px; color:${c.inkFaint}; }
.term-bar i { background:${c.rule}; }
.term-body { padding:${sp.md}px; gap:6px; font-size:20px; line-height:1.44; color:${c.inkSoft}; }
.shot { background:${c.surface}; border:1px solid ${c.rule}; border-radius:${r.md}px; }
.shot-bar { padding:11px ${sp.md}px; background:${c.bg}; color:${c.inkFaint};
  font-family:Mono; font-size:16px; }
.shot-bar i { background:${c.rule}; }

.object { right:${Math.round(cv.margin * 0.5)}px; bottom:${Math.round(cv.safeBottom * 1.1)}px; }

${textureCSS}
`;
}
