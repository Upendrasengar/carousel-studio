// Slide templates for the versus theme.
//
// A hard split: the old way on one side, the new way on the other. The split
// line MOVES across the deck — it starts at 80/20 in favour of the old way
// and ends at 20/80, so the new way visibly takes the frame over.
//
// The movement is the argument. A static before/after states a preference;
// one that advances shows a takeover.

import {
  esc, rich, fitAttr, fitFrame, mediaCard, objectVisual, rowBadge, baseCSS,
  standardSlides, accumulate,
} from '../../scripts/lib/blocks.js';
import { icon } from '../../scripts/lib/icons.js';
import * as marks from '../../scripts/lib/marks.js';

const T = (c) => c.t.type;
const headline = (s, c) => s.headline ? `<h1 class="hl" ${fitAttr(T(c).headline)}>${rich(s.headline)}</h1>` : '';
const headlineXL = (s, c) => s.headline ? `<h1 class="hl hl-xl" ${fitAttr(T(c).headline, 1.2)}>${rich(s.headline)}</h1>` : '';
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
   * The split. `at` is where the divider sits, 0-100. Slides run it from low
   * to high across the deck so the new side grows as you swipe — that
   * geometry is the argument, and it costs nothing to render.
   */
  split(s, ctx) {
    const { t } = ctx;
    const at = Math.max(12, Math.min(88, Number(s.at ?? 50)));
    const side = (data, cls, w) => `<div class="half ${cls}" style="flex:0 0 ${w}%">
      <span class="hlab">${esc(data.label || '')}</span>
      <span class="htitle" ${fitAttr(t.type.rowTitle, 1.15)}>${rich(data.title || '')}</span>
      <ul class="hlist">${(data.points || []).map((p) =>
        `<li ${fitAttr(t.type.rowBody)}>${rich(p)}</li>`).join('')}</ul>
    </div>`;
    return fitFrame(`
      ${s.headline ? `<h1 class="hl hl-mid" ${fitAttr(t.type.headline, 0.66)}>${rich(s.headline)}</h1>` : ''}
      <div class="split">
        ${side(s.old || {}, 'half-old', at)}
        ${side(s.now || {}, 'half-new', 100 - at)}
      </div>
      ${para(s, ctx)}`, 'body-split');
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
body { background:${c.bg}; color:${c.ink}; font-family:Body, system-ui, sans-serif; }
.hdr, .ftr { position:absolute; left:${cv.margin}px; right:${cv.margin}px; z-index:40;
  display:flex; align-items:center; justify-content:space-between; }
.hdr { top:${Math.round(cv.safeTop * 0.36)}px; }
.ftr { bottom:${Math.round(cv.safeBottom * 0.32)}px; font-family:BodyMid;
  font-size:${ty.footer.size}px; color:${c.inkFaint}; letter-spacing:${ty.footer.tracking}em; }
.eyebrow { font-family:Condensed; font-size:${ty.eyebrow.size + 4}px; letter-spacing:.14em;
  text-transform:uppercase; color:${accent}; }
.counter { font-family:BodyMid; font-size:${ty.eyebrow.size}px; color:${c.inkFaint}; }

.body { justify-content:flex-start; }
.body-hook, .body-cta, .body-quote, .body-split { justify-content:center; }
.fit { gap:${sp.md}px; }
.hl { font-family:Display; font-weight:700; color:${c.ink}; }
.hl-mid { font-family:Condensed; text-transform:uppercase; letter-spacing:.02em; }
.ac { color:${accent}; }

/* ── the moving split ─────────────────────────────────────────────── */
.split { display:flex; border-radius:${r.md}px; overflow:hidden;
  box-shadow:0 24px 54px -34px rgba(25,23,20,.5);
  min-height:${Math.round(cv.height * 0.5)}px; }
.half { padding:${sp.md}px; display:flex; flex-direction:column; gap:${sp.sm}px;
  transition:none; overflow:hidden; }
.half-old { background:${c.old}; color:${c.oldInk}; }
.half-new { background:${c.surface}; color:${c.ink}; }
.hlab { font-family:Condensed; font-size:20px; letter-spacing:.18em; text-transform:uppercase; opacity:.7; }
.half-new .hlab { color:${accent}; opacity:1; }
.htitle { font-family:Display; font-weight:700; line-height:1.12; }
.hlist { list-style:none; display:flex; flex-direction:column; gap:9px; margin-top:4px; }
.hlist li { font-family:Body; line-height:1.34; position:relative; padding-left:20px; }
.hlist li:before { content:"—"; position:absolute; left:0; opacity:.55; }
.half-new .hlist li:before { content:"+"; color:${accent}; opacity:1; }

/* ── shared parts ─────────────────────────────────────────────────── */
.hl { font-family:Display; font-size:${ty.headline.size}px; line-height:${ty.headline.leading};
  letter-spacing:${ty.headline.tracking}em; text-wrap:balance; }
.hl-xl { font-size:${Math.round(ty.headline.size * 1.2)}px; }
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
