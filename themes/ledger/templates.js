// Slide templates for the ledger theme.
//
// Modelled on a deck where every content slide was, structurally, a database
// row: a numbered entity with a description, real usage stats and a price.
// That is the point of this pack — the `entry` slide type takes data, not
// design decisions, so a seven-item deck is seven rows plus your commentary.
//
// The stat row and the colour bar under each card are deliberately literal
// copies of what a repository page looks like. That authenticity is what
// stops the card reading as a designed rectangle.

import {
  esc, rich, fitAttr, fitFrame, mediaCard, objectVisual, rowBadge, baseCSS,
  standardSlides, accumulate,
} from '../../scripts/lib/blocks.js';
import { icon } from '../../scripts/lib/icons.js';
import { logo } from '../../scripts/lib/assets.js';
import * as marks from '../../scripts/lib/marks.js';

const t_ = (ctx) => ctx.t.type;

const headline = (s, ctx) => s.headline
  ? `<h1 class="hl" ${fitAttr(t_(ctx).headline)}>${rich(s.headline)}</h1>` : '';
const headlineXL = (s, ctx) => s.headline
  ? `<h1 class="hl hl-xl" ${fitAttr(t_(ctx).headline, 1.24)}>${rich(s.headline)}</h1>` : '';
const deckLine = (s, ctx) => s.deck
  ? `<p class="deck" ${fitAttr(t_(ctx).deck)}>${rich(s.deck)}</p>` : '';
const para = (s, ctx) => s.body
  ? `<p class="para" ${fitAttr(t_(ctx).body)}>${rich(s.body)}</p>` : '';

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

/** The entity card. Everything below `name` is data, not copy. */
function entityCard(e, ctx) {
  const { t } = ctx;
  const mark = e.logo ? logo(e.logo, t.color.ink) : '';
  const [org, name] = String(e.name || '').includes('/')
    ? e.name.split('/') : ['', e.name || ''];
  const stats = (e.stats || []).map((st) => `<span class="st">
    <b>${esc(st.value)}</b><i>${esc(st.label)}</i></span>`).join('');
  // The language bar: proportional colour segments along the card's foot.
  // A real artifact, which is why it sells the card as real.
  const bar = (e.bars || []).map((b) =>
    `<i style="background:${b.color};flex:${b.share || 1}"></i>`).join('');
  return `<div class="ecard">
    <div class="ecard-top">
      <span class="ename">${org ? `<i>${esc(org)}/</i>` : ''}<b>${esc(name)}</b></span>
      ${mark ? `<span class="emark">${mark}</span>` : ''}
    </div>
    ${e.description ? `<p class="edesc" ${fitAttr(t.type.rowBody)}>${esc(e.description)}</p>` : ''}
    ${stats ? `<div class="estats">${stats}</div>` : ''}
    ${bar ? `<div class="ebar">${bar}</div>` : ''}
  </div>`;
}

const chips = (list, ctx) => (list && list.length)
  ? `<div class="pchips">${list.map(([label, value]) =>
      `<span class="pchip"><i>${esc(label)}</i><b>${esc(value)}</b></span>`).join('')}</div>`
  : '';

const PARTS = {
  headline, headlineXL, deckLine, para,
  rows: (s, ctx) => rowList(s.rows, ctx, false),
  steps: (s, ctx) => rowList(s.steps || s.rows, ctx, true),
  media: (s, ctx) => mediaCard(s, ctx.accent),
  stats(s, ctx) {
    const cells = (s.stats || []).map((v) => `<div class="stat">
      <span class="stat-v" ${fitAttr(t_(ctx).statValue)}>${rich(v.value)}</span>
      <span class="stat-l" ${fitAttr(t_(ctx).statLabel)}>${rich(v.label)}</span></div>`).join('');
    return cells ? `<div class="stats stats-${Math.min(2, (s.stats || []).length)}">${cells}</div>` : '';
  },
  quote(s, ctx) {
    const q = `<blockquote class="quote" ${fitAttr(t_(ctx).quote)}>${rich(s.quote || s.headline)}</blockquote>`;
    const a = s.attribution ? `<p class="attrib" ${fitAttr(t_(ctx).caption)}>${esc(s.attribution)}</p>` : '';
    return `<div class="quote-wrap">${q}${a}</div>`;
  },
  action(s, ctx) {
    if (!s.action) return '';
    return `<p class="action" ${fitAttr(t_(ctx).deck)}>${rich(s.action)}
      <span class="mk mk-circle">${marks.circle(ctx.rng, 400, 118, { color: ctx.accent, weight: 6 })}</span></p>`;
  },
};

const TYPES = {
  ...standardSlides(PARTS),

  /** One numbered entity. The workhorse: this is the slide the theme exists for. */
  entry(s, ctx) {
    const { t } = ctx;
    const e = s.entity || {};
    const n = s.n != null ? String(s.n).padStart(2, '0') : '';
    const meta = e.name
      ? `<span class="emeta">${e.logo ? `<i class="edot">${logo(e.logo, t.color.inkFaint) || ''}</i>` : ''}${esc(e.name)}</span>`
      : '';
    return fitFrame(`
      <div class="ehead">
        ${n ? `<span class="num" ${fitAttr(t.type.numeral)}>${n}</span>` : ''}
        <div class="ehl">${meta}${headline(s, ctx)}</div>
      </div>
      ${para(s, ctx)}
      ${entityCard(e, ctx)}
      ${chips(s.chips, ctx)}`, 'body-entry');
  },

  /** Totals the run. Reads the same shared list every entry slide drew from. */
  tally(s, ctx) {
    const { deck, t } = ctx;
    const lines = accumulate(deck, { ...s, upto: deck.entries?.items?.length || 1 },
      (e, i) => `<li class="tline">
        <span class="tn">${String(i + 1).padStart(2, '0')}</span>
        <span class="tname">${esc(e.name || '')}</span>
        <span class="tval">${esc(e.value || '')}</span>
      </li>`);
    return fitFrame(`${headline(s, ctx)}
      <ul class="tlist">${lines}</ul>
      ${s.total ? `<div class="ttotal"><span>${esc(s.totalLabel || 'Total')}</span>
        <b ${fitAttr(t.type.statValue, 0.8)}>${esc(s.total)}</b></div>` : ''}
      ${para(s, ctx)}`, 'body-tally');
  },
};

export const SLIDE_TYPES = Object.keys(TYPES);

function header(slide, ctx) {
  const { deck, index, total } = ctx;
  const counter = deck.showCounter === false ? ''
    : `<span class="counter">${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span>`;
  return `<header class="hdr"><span class="rule"></span>
    ${slide.eyebrow ? `<span class="eyebrow">${esc(slide.eyebrow)}</span>` : ''}${counter}</header>`;
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
body { background:${c.bg}; color:${c.ink}; font-family:Body, system-ui, sans-serif;
  background-image:
    linear-gradient(${c.grid} 1px, transparent 1px),
    linear-gradient(90deg, ${c.grid} 1px, transparent 1px);
  background-size:44px 44px; }

.hdr, .ftr { position:absolute; left:${cv.margin}px; right:${cv.margin}px; z-index:40;
  display:flex; align-items:center; gap:${sp.sm}px; }
.hdr { top:${Math.round(cv.safeTop * 0.36)}px; }
.ftr { bottom:${Math.round(cv.safeBottom * 0.32)}px; justify-content:space-between;
  font-family:Mono; font-size:${ty.footer.size}px; color:${c.inkFaint};
  letter-spacing:${ty.footer.tracking}em; }
.rule { width:44px; height:4px; background:${accent}; border-radius:2px; }
.eyebrow { font-family:BodyMid; font-weight:600; font-size:${ty.eyebrow.size}px;
  letter-spacing:${ty.eyebrow.tracking}em; text-transform:uppercase; color:${c.inkSoft}; }
.counter { margin-left:auto; font-family:Mono; font-size:${ty.eyebrow.size}px;
  letter-spacing:.12em; color:${c.inkFaint}; }

.body { justify-content:flex-start; }
.body-hook, .body-cta, .body-quote, .body-entry, .body-tally { justify-content:center; }
.fit { gap:${sp.md}px; }

.ehead { display:flex; gap:${sp.md}px; align-items:flex-start; }
.num { font-family:Numeral; font-size:${ty.numeral.size}px; line-height:.9;
  color:${accent}; flex:0 0 auto; }
.ehl { display:flex; flex-direction:column; gap:${sp.xs}px; }
.emeta { font-family:Mono; font-size:${ty.caption.size}px; color:${c.inkFaint};
  display:flex; align-items:center; gap:8px; }
.edot { width:22px; height:22px; display:grid; place-items:center; }
.edot svg { width:20px; height:20px; }

.hl { font-family:Display; font-weight:700; font-size:${ty.headline.size}px;
  line-height:${ty.headline.leading}; letter-spacing:${ty.headline.tracking}em;
  text-wrap:balance; }
.hl-xl { font-size:${Math.round(ty.headline.size * 1.24)}px; }
.ac { color:${accent}; }
.deck { font-family:Body; font-size:${ty.deck.size}px; line-height:${ty.deck.leading};
  color:${c.inkSoft}; max-width:86%; }
.para { font-family:Body; font-size:${ty.body.size}px; line-height:${ty.body.leading};
  color:${c.inkSoft}; max-width:90%; }

/* ── the entity card ──────────────────────────────────────────────── */
.ecard { background:${c.surface}; border-radius:${r.md}px; overflow:hidden;
  min-height:${Math.round(cv.height * 0.2)}px;
  box-shadow:0 20px 44px -30px rgba(27,23,18,.42), 0 1px 0 rgba(27,23,18,.05);
  padding:${sp.md}px ${sp.md}px 0; }
.ecard-top { display:flex; align-items:flex-start; justify-content:space-between; gap:${sp.md}px; }
.ename { font-family:Display; font-size:36px; letter-spacing:-.02em; line-height:1.15; }
.ename i { font-style:normal; font-weight:400; color:${c.inkSoft}; }
.ename b { font-weight:700; color:${c.ink}; }
.emark { flex:0 0 auto; width:52px; height:52px; display:grid; place-items:center;
  color:${c.ink}; }
.emark svg { width:44px; height:44px; }
.edesc { font-family:Body; color:${c.inkSoft}; margin-top:${sp.sm}px;
  line-height:${ty.rowBody.leading}; }
.estats { display:flex; gap:${sp.md}px; margin:${sp.md}px 0 ${sp.md}px; flex-wrap:wrap; }
.st { display:flex; flex-direction:column; gap:2px; font-family:Mono; }
.st b { font-size:22px; font-weight:400; color:${c.ink}; }
.st i { font-style:normal; font-size:16px; color:${c.inkFaint}; }
.ebar { display:flex; height:8px; margin:0 -${sp.md}px; }
.ebar i { display:block; }

.pchips { display:flex; gap:${sp.sm}px; }
.pchip { display:inline-flex; align-items:center; gap:10px;
  background:${c.surface}; border:1px solid ${c.rule}; border-radius:${r.sm}px;
  padding:8px 14px; font-family:Mono; }
.pchip i { font-style:normal; font-size:15px; letter-spacing:.1em;
  text-transform:uppercase; color:${c.inkFaint}; }
.pchip b { font-size:22px; color:${c.ink}; font-weight:400; }

/* ── tally ────────────────────────────────────────────────────────── */
.tlist { list-style:none; display:flex; flex-direction:column; }
.tline { display:flex; align-items:baseline; gap:${sp.md}px;
  padding:${sp.sm}px 0; border-bottom:1px solid ${c.rule}; font-family:Mono; }
.tn { color:${accent}; font-size:20px; }
.tname { font-size:24px; color:${c.ink}; }
.tval { margin-left:auto; font-size:24px; color:${c.ink}; }
.ttotal { display:flex; align-items:baseline; justify-content:space-between;
  border-top:3px solid ${c.ink}; padding-top:${sp.sm}px; }
.ttotal span { font-family:BodyMid; font-weight:600; text-transform:uppercase;
  letter-spacing:.1em; font-size:${ty.statLabel.size}px; color:${c.inkSoft}; }
.ttotal b { font-family:Display; font-weight:700; letter-spacing:-.03em; color:${accent}; }

.rows { list-style:none; display:flex; flex-direction:column; }
.row { display:flex; gap:${sp.md}px; align-items:flex-start;
  padding:${sp.sm}px 0 ${sp.md}px; border-bottom:1px solid ${c.rule}; }
.row:first-child { border-top:1px solid ${c.rule}; padding-top:${sp.md}px; }
.chip { flex:0 0 auto; width:46px; height:46px; border-radius:${r.sm}px;
  display:grid; place-items:center; }
.chip svg { width:24px; height:24px; }
.chip-num { font-family:Display; font-weight:700; font-size:24px; }
.rtxt { display:flex; flex-direction:column; gap:3px; padding-top:3px; }
.rt { font-family:BodyMid; font-weight:600; font-size:${ty.rowTitle.size}px; color:${c.ink}; }
.rb { font-family:Body; font-size:${ty.rowBody.size}px;
  line-height:${ty.rowBody.leading}; color:${c.inkSoft}; }

.stats { display:grid; gap:${sp.sm}px; }
.stats-2 { grid-template-columns:1fr 1fr; }
.stat { background:${c.surface}; border-radius:${r.md}px; padding:${sp.md}px;
  display:flex; flex-direction:column; gap:5px;
  box-shadow:0 16px 34px -28px rgba(27,23,18,.4); }
/* Display, not Numeral: Bodoni's hyphen and slash are hairlines that
   disappear at feed scale, and values carry both. The big index numeral is
   always digits, so it keeps the didone. */
.stat-v { font-family:Display; font-weight:700; letter-spacing:-.03em;
  font-size:${ty.statValue.size}px; color:${accent}; }
.stat-l { font-family:BodyMid; font-weight:600; font-size:${ty.statLabel.size}px;
  text-transform:uppercase; letter-spacing:.06em; color:${c.inkSoft}; }

.quote-wrap { border-left:5px solid ${accent}; padding-left:${sp.lg}px; }
.quote { font-family:Display; font-weight:700; font-size:${ty.quote.size}px;
  line-height:${ty.quote.leading}; text-wrap:balance; }
.attrib { font-family:Mono; font-size:${ty.caption.size}px; color:${c.inkFaint};
  text-transform:uppercase; letter-spacing:.12em; margin-top:${sp.sm}px; }

.action { position:relative; display:inline-block; margin:26px 0;
  font-family:BodyMid; font-weight:600; font-size:${ty.deck.size}px;
  color:${c.ink}; padding:${sp.sm}px ${sp.md}px; }
.mk-circle { position:absolute; left:-24px; top:50%; transform:translateY(-50%); }

.term { background:#1A1610; border-radius:${r.md}px; }
.term-bar { padding:11px ${sp.md}px; background:rgba(255,255,255,.06);
  font-family:Mono; font-size:16px; color:rgba(255,255,255,.5); }
.term-bar i { background:rgba(255,255,255,.2); }
.term-body { padding:${sp.md}px; gap:6px; font-size:20px; line-height:1.44; color:#D8CFBC; }
.shot { background:${c.surface}; border:1px solid ${c.rule}; border-radius:${r.md}px; }
.shot-bar { padding:11px ${sp.md}px; background:${c.bg}; color:${c.inkFaint};
  font-family:Mono; font-size:16px; }
.shot-bar i { background:${c.rule}; }

.object { right:${Math.round(cv.margin * 0.5)}px; bottom:${Math.round(cv.safeBottom * 0.9)}px; }

${textureCSS}
`;
}
