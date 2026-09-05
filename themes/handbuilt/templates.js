// Slide templates for the handbuilt theme.
//
// A warm cream zine for build logs — "I made this myself, here is how".
// Four things carry it, and a slide usually has three of them:
//
//   the headline   condensed caps, two tones, hand-drawn underline on the accent
//   the note       a white mono card holding the actual explanation
//   the character  the pixel mascot working, with a prop
//   the aside      a handwritten line with an arrow pointing at what it means
//
// The aside is the voice of the pack. It is the builder talking over their own
// slide, and it should say something the note deliberately does not.

import {
  esc, rich, fitAttr, fitFrame, mediaCard, objectVisual, rowBadge, baseCSS,
  standardSlides,
} from '../../scripts/lib/blocks.js';
import { icon } from '../../scripts/lib/icons.js';
import { brandMark } from '../../scripts/lib/assets.js';
import { mascotSVG } from '../../scripts/lib/mascot.js';
import { sceneSVG } from '../../scripts/lib/scene.js';
import * as marks from '../../scripts/lib/marks.js';

const T = (c) => c.t.type;

/**
 * Condensed caps, split on a newline. Line one is ink, line two is the accent
 * with a hand-drawn underline beneath it — the underline is what stops the
 * accent line reading as merely a different colour.
 */
function headline(s, c, mul = 1) {
  if (!s.headline) return '';
  const [a, b] = String(s.headline).split('\n');
  const rule = b
    ? `<span class="hrule">${marks.underline(c.rng, 420, { color: c.accent, weight: 8 })}</span>`
    : '';
  return `<h1 class="hl" ${fitAttr(T(c).headline, mul)}>
    <span>${rich(a)}</span>${b ? `<span class="hl-2">${rich(b)}${rule}</span>` : ''}</h1>`;
}
const headlineXL = (s, c) => headline(s, c, 1.14);
const deckLine = (s, c) => s.deck ? `<p class="deck" ${fitAttr(T(c).deck)}>${rich(s.deck)}</p>` : '';
const para = (s, c) => s.body ? `<p class="para" ${fitAttr(T(c).body)}>${rich(s.body)}</p>` : '';

/** The white mono card. Short lines — it is a note, not a paragraph. */
const noteCard = (s, c) => {
  const lines = Array.isArray(s.note) ? s.note : (s.note ? [s.note] : []);
  if (!lines.length) return '';
  return `<div class="note">${lines.map((l) =>
    `<span ${fitAttr(T(c).note)}>${rich(l)}</span>`).join('')}</div>`;
};

/** A row of app tiles — what the thing is wired to. */
const tiles = (s, c) => {
  if (!s.tiles?.length) return '';
  return `<div class="tiles">${s.tiles.map((t2) => {
    const m = brandMark(t2, c.t.color.ink);
    return `<span class="tile">${m ? m.html : `<b>${esc(String(t2)[0].toUpperCase())}</b>`}</span>`;
  }).join('')}</div>`;
};

/** The handwritten aside plus the arrow that points it at something. */
function aside(s, c) {
  if (!s.aside) return '';
  const dir = s.asideSide === 'left' ? 'right-down' : 'left-down';
  return `<div class="aside aside-${s.asideSide || 'right'}" data-decor="aside">
    <span class="hand" ${fitAttr(T(c).hand)}>${esc(s.aside)}</span>
    <span class="aarrow">${marks.arrow(c.rng, 110, 96, { color: c.accent, weight: 5, dir })}</span>
  </div>`;
}

function figure(s, c) {
  const { t } = c;
  if (s.mascot === false) return '';
  const pose = s.mascot || t.mascot.poseByType[s.type] || t.mascot.defaultPose;
  const art = s.prop
    ? sceneSVG({ pose, prop: s.prop, dressing: s.dressing, px: t.mascot.scenePx, palette: t.mascotPalette })
    : mascotSVG(pose, t.mascot.px, { palette: t.mascotPalette });
  return `<div class="figure" data-decor="mascot">${art}</div>`;
}

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

  /**
   * The pack's workhorse: headline, note card, optional app tiles, the
   * character with a prop, and a handwritten aside. Every field is optional,
   * so the same type carries a dense slide and a sparse one.
   */
  build(s, c) {
    return fitFrame(`${headline(s, c)}${noteCard(s, c)}${tiles(s, c)}${para(s, c)}`, 'body-build');
  },
};

export const SLIDE_TYPES = Object.keys(TYPES);

const header = (s, ctx) => (s.eyebrow || ctx.deck.brand)
  ? `<header class="hdr"><span class="star">&#10033;</span>
     <span>${esc(s.eyebrow || ctx.deck.brand)}</span></header>` : '<header class="hdr"><span class="star">&#10033;</span></header>';

const footer = (ctx) => `<footer class="ftr">
  <span class="fh">${icon('instagram') ? '' : ''}${esc(ctx.deck.handle || '')}</span>
  <span class="fs">${esc(ctx.deck.footnote || 'save for later')} ${icon('bookmark')}</span></footer>`;

export function slideHTML(slide, ctx) {
  const build = TYPES[slide.type];
  if (!build) throw new Error(`Unknown slide type "${slide.type}". This theme has: ${SLIDE_TYPES.join(', ')}`);
  return `${header(slide, ctx)}${build(slide, ctx)}${figure(slide, ctx)}${aside(slide, ctx)}${objectVisual(slide, ctx.t, ctx.deck)}${footer(ctx)}`;
}

export function css(ctx) {
  const { t, accent, fontFaces, textureCSS } = ctx;
  const c = t.color, sp = t.space, ty = t.type, r = t.radius, cv = t.canvas;
  return `${fontFaces}
${baseCSS(t)}
body { background:${c.bg}; color:${c.ink}; font-family:Body, system-ui, sans-serif;
  background-image:
    radial-gradient(70% 46% at 50% 78%, #FFFFFF88, transparent 70%),
    radial-gradient(90% 50% at 50% 4%, ${accent}12, transparent 66%); }

.hdr { position:absolute; left:0; right:0; top:${Math.round(cv.safeTop * 0.30)}px; z-index:40;
  display:flex; flex-direction:column; align-items:center; gap:4px; }
.star { font-size:38px; color:${accent}; line-height:1; }
.hdr span:last-child { font-family:BodyMid; font-weight:600; font-size:${ty.eyebrow.size}px;
  letter-spacing:${ty.eyebrow.tracking}em; text-transform:uppercase; color:${c.inkFaint}; }
.ftr { position:absolute; left:${cv.margin}px; right:${cv.margin}px;
  bottom:${Math.round(cv.safeBottom * 0.30)}px; z-index:50;
  display:flex; align-items:center; justify-content:space-between;
  font-family:Body; font-size:${ty.footer.size}px; color:${c.inkFaint}; }
.fs { display:inline-flex; align-items:center; gap:7px; }
.fs svg { width:17px; height:17px; }

.body { justify-content:flex-start; top:${Math.round(cv.safeTop + 46)}px; }
.body-hook, .body-cta, .body-quote { justify-content:center; }
.fit { gap:${sp.md}px; align-items:center; text-align:center; }

/* ── the headline ─────────────────────────────────────────────────── */
.hl { font-family:Display; font-weight:700; text-transform:uppercase;
  line-height:${ty.headline.leading}; letter-spacing:${ty.headline.tracking}em;
  color:${c.ink}; display:flex; flex-direction:column; align-items:center; }
.hl-2 { position:relative; color:${accent}; display:inline-block; }
.hrule { position:absolute; left:50%; transform:translateX(-50%); bottom:-.16em;
  width:104%; line-height:0; }
.hrule svg { width:100%; height:auto; }
.ac { color:${accent}; }

.deck { font-family:Body; font-size:${ty.deck.size}px; line-height:${ty.deck.leading};
  color:${c.inkSoft}; max-width:82%; }
.para { font-family:Body; font-size:${ty.body.size}px; line-height:${ty.body.leading};
  color:${c.inkSoft}; max-width:86%; }

/* ── the note card ────────────────────────────────────────────────── */
.note { background:${c.surface}; border:2px solid ${c.ink}; border-radius:${r.md}px;
  padding:${sp.md}px ${sp.lg}px; display:flex; flex-direction:column; gap:6px;
  box-shadow:5px 6px 0 ${c.ink}14; text-align:left; max-width:92%;
  overflow:hidden; }
.note span { font-family:Mono; color:${c.ink}; line-height:${ty.note.leading};
  white-space:nowrap; }
.note .ac { color:${accent}; }

.tiles { display:flex; gap:${sp.sm}px; justify-content:center; flex-wrap:wrap; }
.tile { width:92px; height:92px; border-radius:${r.md}px; background:${c.surface};
  border:1px solid ${c.rule}; display:grid; place-items:center; color:${c.ink};
  box-shadow:0 14px 26px -18px rgba(23,20,16,.4); }
.tile svg, .tile img { width:50px; height:50px; object-fit:contain; }
.tile b { font-family:Display; font-size:38px; }

/* ── the handwritten aside ────────────────────────────────────────── */
/* Tagged as decoration so the collision guard drops it when the copy on a
   dense slide would otherwise run straight through it. */
.aside { position:absolute; z-index:35; display:flex; align-items:flex-start; gap:2px;
  max-width:300px; }
.aside-right { right:${Math.round(cv.margin * 0.3)}px; bottom:${Math.round(cv.safeBottom * 1.25)}px; }
.aside-left { left:${Math.round(cv.margin * 0.3)}px; bottom:${Math.round(cv.safeBottom * 1.25)}px;
  flex-direction:row-reverse; }
.hand { font-family:Hand; color:${c.ink}; line-height:${ty.hand.leading};
  transform:rotate(-4deg); }
.aarrow { line-height:0; opacity:.9; }

.figure { position:absolute; left:50%; transform:translateX(-50%);
  bottom:${Math.round(cv.safeBottom * 0.52)}px; z-index:20; line-height:0; }

.rows { list-style:none; display:flex; flex-direction:column; text-align:left; width:88%; }
.row { display:flex; gap:${sp.md}px; align-items:flex-start;
  padding:${sp.sm}px 0 ${sp.md}px; border-bottom:1px solid ${c.rule}; }
.row:first-child { border-top:1px solid ${c.rule}; padding-top:${sp.md}px; }
.chip { flex:0 0 auto; width:48px; height:48px; border-radius:${r.sm}px; display:grid; place-items:center; }
.chip svg { width:25px; height:25px; }
.chip-num { font-family:Display; font-size:24px; }
.rtxt { display:flex; flex-direction:column; gap:3px; padding-top:3px; }
.rt { font-family:BodyMid; font-weight:600; font-size:${ty.rowTitle.size}px; color:${c.ink}; }
.rb { font-family:Body; font-size:${ty.rowBody.size}px; line-height:${ty.rowBody.leading}; color:${c.inkSoft}; }

.stats { display:grid; gap:${sp.sm}px; width:88%; }
.stats-2 { grid-template-columns:1fr 1fr; }
.stat { background:${c.surface}; border:2px solid ${c.ink}; border-radius:${r.md}px;
  padding:${sp.md}px; display:flex; flex-direction:column; gap:5px; text-align:left;
  box-shadow:5px 6px 0 ${c.ink}14; }
.stat-v { font-family:Display; font-size:${ty.statValue.size}px; color:${accent}; }
.stat-l { font-family:Mono; font-size:${ty.statLabel.size}px; text-transform:uppercase;
  letter-spacing:.06em; color:${c.inkSoft}; }

.quote-wrap { max-width:90%; }
.quote { font-family:Display; font-weight:700; text-transform:uppercase;
  font-size:${ty.quote.size}px; line-height:${ty.quote.leading}; }
.attrib { font-family:Hand; font-size:${Math.round(ty.hand.size * 0.9)}px;
  color:${c.inkFaint}; margin-top:${sp.sm}px; }

.action { position:relative; display:inline-block; margin:26px 0;
  font-family:Mono; font-size:${ty.deck.size}px; color:${c.ink}; padding:${sp.sm}px ${sp.md}px; }
.mk-circle { position:absolute; left:-24px; top:50%; transform:translateY(-50%); }

.term { background:#17140F; border-radius:${r.md}px; }
.term-bar { padding:11px ${sp.md}px; background:rgba(255,255,255,.06);
  font-family:Mono; font-size:16px; color:rgba(255,255,255,.5); }
.term-bar i { background:rgba(255,255,255,.2); }
.term-body { padding:${sp.md}px; gap:6px; font-size:20px; line-height:1.44; color:#DCD3C6; }
.shot { background:${c.surface}; border:2px solid ${c.ink}; border-radius:${r.md}px; }
.shot-bar { padding:11px ${sp.md}px; background:${c.panel}; color:${c.inkFaint};
  font-family:Mono; font-size:16px; }
.shot-bar i { background:${c.rule}; }

.object { right:${Math.round(cv.margin * 0.4)}px; bottom:${Math.round(cv.safeBottom * 1.1)}px; }

${textureCSS}
`;
}
