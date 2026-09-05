// Slide templates for the case-file theme.
//
// A dossier: manila card, typewriter, a stamp, and redaction bars that get
// REMOVED as you swipe. Earlier slides show a fact blacked out; a later slide
// un-redacts it.
//
// The mechanic is withholding. It only works if what is under the bar is
// genuinely worth the wait, which is a content constraint before it is a
// design one.

import {
  esc, rich, fitAttr, fitFrame, mediaCard, objectVisual, rowBadge, baseCSS,
  standardSlides, accumulate,
} from '../../scripts/lib/blocks.js';
import { icon } from '../../scripts/lib/icons.js';
import * as marks from '../../scripts/lib/marks.js';

const T = (c) => c.t.type;
const headline = (s, c) => s.headline ? `<h1 class="hl" ${fitAttr(T(c).headline)}>${rich(s.headline)}</h1>` : '';
const headlineXL = (s, c) => s.headline ? `<h1 class="hl hl-xl" ${fitAttr(T(c).headline, 1.16)}>${rich(s.headline)}</h1>` : '';
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

  /**
   * A file entry. Facts marked `redacted: true` render as a black bar until
   * the slide's `declassify` list names them, at which point the bar lifts
   * and the text underneath is revealed in the accent.
   */
  file(s, ctx) {
    const { deck, t } = ctx;
    const facts = deck.file?.facts || [];
    if (!facts.length) throw new Error('A "file" slide needs deck.file.facts.');
    const open = new Set(s.declassify || []);
    const lines = facts.map((f, i) => {
      const shown = !f.redacted || open.has(i + 1);
      return `<li class="fline">
        <span class="fkey">${esc(f.key)}</span>
        <span class="fval ${shown ? 'fval-open' : 'fval-bar'}">${shown ? rich(f.value) : ''}</span>
      </li>`;
    }).join('');
    return fitFrame(`
      ${s.headline ? `<h1 class="hl hl-sm" ${fitAttr(t.type.headline, 0.62)}>${rich(s.headline)}</h1>` : ''}
      <div class="folder">
        <span class="stamp">${esc(s.stamp || deck.file?.stamp || 'Confidential')}</span>
        <ul class="flist">${lines}</ul>
      </div>
      ${para(s, ctx)}`, 'body-file');
  },
};

export const SLIDE_TYPES = Object.keys(TYPES);

function header(slide, ctx) {
  const { deck, index, total } = ctx;
  const counter = deck.showCounter === false ? ''
    : `<span class="counter">${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span>`;
  return `<header class="hdr">
    ${slide.eyebrow ? `<span class="eyebrow">${esc(slide.eyebrow)}</span>` : '<span></span>'}${counter}</header>`;
}
const footer = (ctx) => (ctx.deck.handle || ctx.deck.footnote)
  ? `<footer class="ftr"><span>${esc(ctx.deck.handle || '')}</span>
     <span>${esc(ctx.deck.footnote || '')}</span></footer>` : '';

export function slideHTML(slide, ctx) {
  const build = TYPES[slide.type];
  if (!build) throw new Error(`Unknown slide type "${slide.type}". This theme has: ${SLIDE_TYPES.join(', ')}`);
  return `${header(slide, ctx)}${build(slide, ctx)}${objectVisual(slide, ctx.t, ctx.deck)}${footer(ctx)}`;
}

export function css(ctx) {
  const { t, accent, fontFaces, textureCSS } = ctx;
  const c = t.color, sp = t.space, ty = t.type, r = t.radius, cv = t.canvas;
  return `${fontFaces}
${baseCSS(t)}
body { background:${c.bg}; color:${c.ink}; font-family:Body, ui-monospace, monospace; }
.hdr, .ftr { position:absolute; left:${cv.margin}px; right:${cv.margin}px; z-index:40;
  display:flex; align-items:center; justify-content:space-between; }
.hdr { top:${Math.round(cv.safeTop * 0.34)}px; padding-bottom:8px;
  border-bottom:2px solid ${c.ink}; }
.ftr { bottom:${Math.round(cv.safeBottom * 0.3)}px; font-size:${ty.footer.size}px;
  color:${c.inkSoft}; letter-spacing:${ty.footer.tracking}em; }
.eyebrow { font-family:Stamp; font-size:${ty.eyebrow.size + 3}px; letter-spacing:.2em;
  text-transform:uppercase; color:${c.ink}; }
.counter { font-size:${ty.eyebrow.size}px; color:${c.inkSoft}; letter-spacing:.14em; }

.body { justify-content:flex-start; }
.body-hook, .body-cta, .body-quote, .body-file { justify-content:center; }
.fit { gap:${sp.md}px; }
.hl { font-family:Display; font-weight:700; color:${c.ink}; text-transform:uppercase;
  letter-spacing:-.01em; }
.hl-sm { font-size:${Math.round(ty.headline.size * 0.62)}px; }
.ac { color:${accent}; }

/* ── the folder ───────────────────────────────────────────────────── */
.folder { position:relative; min-height:${Math.round(cv.height * 0.34)}px;
  background:${c.surface}; border:2px solid ${c.rule};
  border-radius:2px; padding:${sp.lg}px ${sp.md}px ${sp.md}px;
  box-shadow:6px 6px 0 rgba(32,28,20,.16); }
.stamp { position:absolute; right:${sp.md}px; top:-16px;
  font-family:Stamp; font-size:22px; letter-spacing:.22em; text-transform:uppercase;
  color:${accent}; border:3px solid ${accent}; padding:5px 14px;
  transform:rotate(-4deg); background:${c.surface}; }
.flist { list-style:none; display:flex; flex-direction:column; }
.fline { display:flex; gap:${sp.md}px; align-items:baseline; padding:11px 0;
  border-bottom:1px dashed ${c.rule}; }
.fkey { flex:0 0 34%; font-size:19px; letter-spacing:.1em; text-transform:uppercase;
  color:${c.inkFaint}; }
.fval { flex:1; font-size:23px; line-height:1.4; }
/* A redaction is a solid bar. Removing it is the only news a file slide has. */
.fval-bar { background:${c.ink}; height:26px; border-radius:1px; }
.fval-open { color:${accent}; font-family:BodyMid; font-weight:700; }

/* ── shared parts ─────────────────────────────────────────────────── */
.hl { font-family:Display; font-size:${ty.headline.size}px; line-height:${ty.headline.leading};
  letter-spacing:${ty.headline.tracking}em; text-wrap:balance; }
.hl-xl { font-size:${Math.round(ty.headline.size * 1.16)}px; }
.deck { font-family:Body; font-size:${ty.deck.size}px; line-height:${ty.deck.leading};
  color:${c.inkSoft}; max-width:88%; }
.para { font-family:Body; font-size:${ty.body.size}px; line-height:${ty.body.leading};
  color:${c.inkSoft}; max-width:92%; }

.rows { list-style:none; display:flex; flex-direction:column; }
.row { display:flex; gap:${sp.md}px; align-items:flex-start;
  padding:${sp.sm}px 0 ${sp.md}px; border-bottom:1px solid ${c.rule}; }
.row:first-child { border-top:1px solid ${c.rule}; padding-top:${sp.md}px; }
.chip { flex:0 0 auto; width:46px; height:46px; border-radius:${r.sm}px; display:grid; place-items:center; }
.chip svg { width:24px; height:24px; }
.chip-num { font-family:Display; font-size:22px; }
.rtxt { display:flex; flex-direction:column; gap:3px; padding-top:3px; }
.rt { font-family:BodyMid; font-weight:600; font-size:${ty.rowTitle.size}px; color:${c.ink}; }
.rb { font-family:Body; font-size:${ty.rowBody.size}px; line-height:${ty.rowBody.leading}; color:${c.inkSoft}; }

.stats { display:grid; gap:${sp.sm}px; }
.stats-2 { grid-template-columns:1fr 1fr; }
.stat { background:${c.surface}; border:1px solid ${c.rule}; border-radius:${r.md}px;
  padding:${sp.md}px; display:flex; flex-direction:column; gap:5px; }
.stat-v { font-family:Display; font-size:${ty.statValue.size}px; letter-spacing:-.03em; color:${accent}; }
.stat-l { font-family:BodyMid; font-weight:600; font-size:${ty.statLabel.size}px;
  text-transform:uppercase; letter-spacing:.07em; color:${c.inkSoft}; }

.quote-wrap { border-left:5px solid ${accent}; padding-left:${sp.lg}px; }
.quote { font-family:Display; font-size:${ty.quote.size}px; line-height:${ty.quote.leading}; text-wrap:balance; }
.attrib { font-family:BodyMid; font-weight:600; font-size:${ty.caption.size}px; color:${c.inkFaint};
  text-transform:uppercase; letter-spacing:.12em; margin-top:${sp.sm}px; }

.action { position:relative; display:inline-block; margin:26px 0;
  font-family:BodyMid; font-weight:600; font-size:${ty.deck.size}px; color:${c.ink};
  padding:${sp.sm}px ${sp.md}px; }
.mk-circle { position:absolute; left:-24px; top:50%; transform:translateY(-50%); }

.term { background:#12100D; border-radius:${r.md}px; }
.term-bar { padding:11px ${sp.md}px; background:rgba(255,255,255,.06);
  font-family:BodyMid; font-size:16px; color:rgba(255,255,255,.5); }
.term-bar i { background:rgba(255,255,255,.2); }
.term-body { padding:${sp.md}px; gap:6px; font-size:20px; line-height:1.44; color:#D6CFC2; }
.shot { background:${c.surface}; border:1px solid ${c.rule}; border-radius:${r.md}px; }
.shot-bar { padding:11px ${sp.md}px; background:${c.bg}; color:${c.inkFaint}; font-family:BodyMid; font-size:16px; }
.shot-bar i { background:${c.rule}; }

.object { right:${Math.round(cv.margin * 0.5)}px; bottom:${Math.round(cv.safeBottom * 0.9)}px; }

${textureCSS}
`;
}
