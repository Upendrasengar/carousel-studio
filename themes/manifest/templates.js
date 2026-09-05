// Slide templates for the manifest theme.
//
// A counted taxonomy on near-black. The deck states a total, splits it into
// named categories, and gives each category one slide of numbered rows where
// every row carries a hard metric on the right.
//
// Three things separate it from `catalogue`, which is the pack it was ported
// from and the one to use instead when they do not apply:
//
//   1. Numbering restarts inside each category. catalogue numbers continuously
//      across the whole deck and calls that its one mechanic; here the count
//      that matters is the category's own, so 01-06 appears on every slide.
//   2. Every row ends in a metric. Not a tag naming what the thing is — a
//      figure saying how much of it there is. A row without one is a row that
//      belongs in catalogue.
//   3. Each category owns a hue, and it drives the icon tile, the row rail,
//      the row numbers and the metric chips on that slide. This is the one
//      place the pack overrides the studio's one-loud-element rule, and it
//      only works because the hue changes per slide rather than per element.
//
// The taxonomy chips are the closing mechanic: the hook shows the split, the
// CTA shows it again. The deck tells you its shape before you swipe and
// proves it kept the promise at the end.

import {
  esc, rich, fitAttr, fitFrame, mediaCard, objectVisual, baseCSS,
} from '../../scripts/lib/blocks.js';
import { icon } from '../../scripts/lib/icons.js';
import { brandMark } from '../../scripts/lib/assets.js';

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
 * Which hue this category owns.
 *
 * Keyed on the slide's declared `n`, falling back to its position among the
 * group slides. Never on object identity: the renderer hands each template a
 * structuredClone of the slide, so `s === slide` is false for every entry.
 */
function hueIndex(deck, slide, index) {
  if (Number.isInteger(slide.n) && slide.n > 0) return slide.n - 1;
  let seen = 0;
  for (let i = 0; i < index; i++) if (deck.slides[i]?.type === 'group') seen++;
  return seen;
}
const hueOf = (ctx, slide) => {
  const hues = ctx.t.color.catHues;
  return hues[hueIndex(ctx.deck, slide, ctx.index) % hues.length];
};
const tintOf = (ctx, slide) => {
  const tints = ctx.t.color.catTints;
  return tints[hueIndex(ctx.deck, slide, ctx.index) % tints.length];
};

/** Total rows across every group slide — the number the hook and CTA quote. */
export function totalItems(deck) {
  return (deck.slides || []).filter((s) => s.type === 'group')
    .reduce((n, s) => n + (s.items || []).length, 0);
}

/**
 * The taxonomy strip: one chip per category with its count, in category
 * order and category colour. Rendered from `deck.taxonomy`, which lives once
 * on the deck so the hook and the CTA cannot drift apart.
 */
function taxonomyChips(ctx) {
  const list = ctx.deck.taxonomy;
  if (!Array.isArray(list) || !list.length) return '';
  const { t } = ctx;
  const chips = list.map((g, i) => {
    const hue = t.color.catHues[i % t.color.catHues.length];
    const tint = t.color.catTints[i % t.color.catTints.length];
    return `<span class="tx" style="background:${tint};color:${hue}">
      <i style="background:${hue}"></i>${esc(g.label || '')}
      ${g.count != null ? `<b>${esc(String(g.count))}</b>` : ''}</span>`;
  }).join('');
  return `<div class="txs">${chips}</div>`;
}

/**
 * One row of a category: number, name, one-liner, metric.
 *
 * The hue rides on the row as a custom property rather than as an inline
 * colour on each child. `fitAttr` already emits a `style` attribute, so a
 * template that adds a second one to the same element loses it — HTML keeps
 * the first and drops the rest, silently. Setting `--hue` once on the `<li>`,
 * which carries no fit attributes, keeps one source for the colour and puts
 * it somewhere nothing else writes.
 */
function itemRow(it, n, hue, tint, ctx) {
  const { t } = ctx;
  return `<li class="mrow" style="--hue:${hue};--tint:${tint}">
    <span class="mnum">${String(n).padStart(2, '0')}</span>
    <span class="mtxt">
      <span class="mname" ${fitAttr(t.type.itemName)}>${esc(it.name || '')}</span>
      ${it.body ? `<span class="mbody" ${fitAttr(t.type.itemBody)}>${rich(it.body)}</span>` : ''}
    </span>
    ${it.metric ? `<span class="mmet" ${fitAttr(t.type.metric)}>${esc(it.metric)}</span>` : ''}
  </li>`;
}

/** A plain row list, for the standard slide types that are not a category. */
function rowList(list, ctx, numbered) {
  if (!list?.length) return '';
  const { t, accent } = ctx;
  return `<ul class="mrows">${list.map((r, i) => {
    const hue = t.color.catHues[i % t.color.catHues.length];
    const tint = t.color.catTints[i % t.color.catTints.length];
    const mark = numbered
      ? `<span class="mnum">${String(i + 1).padStart(2, '0')}</span>`
      : `<span class="mico">${r.icon ? icon(r.icon) : ''}</span>`;
    return `<li class="mrow" style="--hue:${hue};--tint:${tint}">${mark}
      <span class="mtxt"><span class="mname" ${fitAttr(t.type.rowTitle)}>${rich(r.title)}</span>
      ${r.body ? `<span class="mbody" ${fitAttr(t.type.rowBody)}>${rich(r.body)}</span>` : ''}</span>
    </li>`;
  }).join('')}</ul>`;
  void accent;
}

const TYPES = {
  hook: (s, ctx) => fitFrame(
    `${headline(s, ctx, 1.2)}${deckLine(s, ctx)}${taxonomyChips(ctx)}`,
    anim(s, 'body-hook'),
  ),

  /** One category: its icon, its name, its rows. The signature type. */
  group(s, ctx) {
    const { t } = ctx;
    const hue = hueOf(ctx, s);
    const tint = tintOf(ctx, s);
    const mark = brandMark(s.logo, hue);
    const glyph = mark ? mark.html : (s.icon ? icon(s.icon) : '');
    const rows = (s.items || []).map((it, i) => itemRow(it, i + 1, hue, tint, ctx)).join('');
    return fitFrame(`
      <div class="ghead" style="--hue:${hue};--tint:${tint}">
        <span class="gico">${glyph}</span>
        <span class="gn">// ${String(s.n ?? hueIndex(ctx.deck, s, ctx.index) + 1).padStart(2, '0')}</span>
        <span class="gname" ${fitAttr(t.type.category)}>${esc(s.category || '')}</span>
      </div>
      ${deckLine(s, ctx)}
      <ul class="mrows">${rows}</ul>`, anim(s, 'body-group'));
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
    const cells = (s.stats || []).map((v, i) => {
      const hue = ctx.t.color.catHues[i % ctx.t.color.catHues.length];
      return `<div class="stat" style="--hue:${hue}">
        <span class="stat-v" ${fitAttr(T(ctx).statValue)}>${rich(v.value)}</span>
        <span class="stat-l" ${fitAttr(T(ctx).statLabel)}>${rich(v.label)}</span></div>`;
    }).join('');
    const grid = cells
      ? `<div class="stats stats-${Math.min(2, (s.stats || []).length)}">${cells}</div>` : '';
    return fitFrame(`${headline(s, ctx)}${grid}${para(s, ctx)}`, anim(s, ''));
  },
  quote: (s, ctx) => fitFrame(`<div class="quote-wrap">
    <blockquote class="quote" ${fitAttr(T(ctx).quote)}>${rich(s.quote || s.headline)}</blockquote>
    ${s.attribution ? `<p class="attrib" ${fitAttr(T(ctx).caption)}>${esc(s.attribution)}</p>` : ''}
    </div>`, anim(s, 'body-quote')),

  cta: (s, ctx) => fitFrame(`${headline(s, ctx, 1.2)}
    ${s.action ? `<p class="action" ${fitAttr(T(ctx).deck)}>${rich(s.action)}</p>` : ''}
    ${para(s, ctx)}${taxonomyChips(ctx)}`, anim(s, 'body-cta')),
};

export const SLIDE_TYPES = Object.keys(TYPES);

function header(slide, ctx) {
  const { deck } = ctx;
  const left = slide.type === 'group'
    ? '' : `<span class="cat">${esc(slide.eyebrow || deck.brand || '')}</span>`;
  const count = slide.type === 'group' && (slide.items || []).length
    ? `<span class="count">${(slide.items || []).length} ${esc(deck.unit || 'items')}</span>` : '';
  return `<header class="hdr">${left || '<span></span>'}${count || '<span></span>'}</header>`;
}

/**
 * The swipe affordance is suppressed on the last slide. A deck that still
 * says "swipe" when there is nothing left to swipe to reads as a deck that
 * lost count of itself.
 */
const footer = (ctx) => {
  const last = ctx.index + 1 >= ctx.total;
  return `<footer class="ftr">
    <span>${String(ctx.index + 1).padStart(2, '0')} / ${String(ctx.total).padStart(2, '0')}</span>
    <span class="swipe">${last ? esc(ctx.deck.handle || '') : 'Swipe &rarr;'}</span>
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
  // Rows cascade in one after another. Six is the row cap, so six offsets is
  // the whole ladder; the last one must still land inside the hold window or
  // the still would screenshot a row mid-flight.
  const stagger = Array.from({ length: 6 }, (_, i) =>
    `.is-anim .mrow:nth-child(${i + 1}) { animation-delay:${(i * 0.075).toFixed(3)}s; }`).join('\n');

  return `${fontFaces}
${baseCSS(t)}
body { background:${c.bg}; color:${c.ink}; font-family:Body, system-ui, sans-serif;
  background-image:radial-gradient(78% 46% at 84% 2%, ${accent}14, transparent 64%); }

.hdr, .ftr { position:absolute; left:${cv.margin}px; right:${cv.margin}px; z-index:40;
  display:flex; align-items:center; justify-content:space-between; }
.hdr { top:${Math.round(cv.safeTop * 0.42)}px; }
.ftr { bottom:${Math.round(cv.safeBottom * 0.34)}px; font-family:Mono;
  font-size:${ty.footer.size}px; letter-spacing:${ty.footer.tracking}em; color:${c.inkFaint}; }
.cat { font-family:Mono; font-size:${ty.eyebrow.size}px; letter-spacing:${ty.eyebrow.tracking}em;
  text-transform:uppercase; color:${accent}; }
.count { font-family:Mono; font-size:${ty.eyebrow.size}px; letter-spacing:.16em;
  text-transform:uppercase; color:${c.inkFaint};
  border:1px solid ${c.rule}; border-radius:99px; padding:5px 13px; }
.swipe { color:${accent}; }

.body { justify-content:flex-start; top:${Math.round(cv.safeTop + 30)}px; }
.body-hook, .body-cta, .body-quote { justify-content:center; }
.fit { gap:${sp.sm}px; }
.body-group .fit { gap:${sp.sm}px; }

.hl { font-family:Display; font-weight:800; font-size:${ty.headline.size}px;
  line-height:${ty.headline.leading}; letter-spacing:${ty.headline.tracking}em; color:${c.ink}; }
.ac { color:${accent}; }
.deck { font-family:Body; font-size:${ty.deck.size}px; line-height:${ty.deck.leading};
  color:${c.inkSoft}; margin-bottom:${sp.xs}px; }
.deck b, .para b { color:${c.ink}; font-weight:600; font-family:BodyMid; }
.para { font-family:Body; font-size:${ty.body.size}px; line-height:${ty.body.leading}; color:${c.inkSoft}; }

/* ── the category head ────────────────────────────────────────────── */
.ghead { display:flex; align-items:center; gap:${sp.sm}px; }
.gico { flex:0 0 auto; width:56px; height:56px; border-radius:${r.md}px;
  display:grid; place-items:center; background:var(--hue); color:${c.bg}; }
.gico svg, .gico img { width:30px; height:30px; object-fit:contain; }
.gn { font-family:Mono; font-size:${ty.eyebrow.size}px; letter-spacing:.14em; color:var(--hue); }
.gname { font-family:Display; font-weight:800; font-size:${ty.category.size}px;
  line-height:${ty.category.leading}; letter-spacing:${ty.category.tracking}em; color:${c.ink}; }

/* ── the rows ─────────────────────────────────────────────────────────
   A height floor, not flex:1. The fit wrapper sizes to content by design, and
   forcing it to fill would make the fit pass measure zero overflow forever —
   so the list gets a floor and spreads its rows inside it. Without this the
   deck renders correct and top-heavy, bottom third of every slide empty.
   No backticks in this stylesheet: it is a template literal, and one in a
   comment ends the string. */
.mrows { list-style:none; display:flex; flex-direction:column;
  justify-content:space-between; gap:${sp.xs}px;
  min-height:${Math.round(cv.height * 0.65)}px; }
.mrow { display:flex; align-items:center; gap:${sp.md}px;
  background:${c.surface}; border-left:3px solid var(--hue);
  border-radius:0 ${r.sm}px ${r.sm}px 0; padding:${sp.md}px ${sp.md}px; }
.mnum, .mico { flex:0 0 auto; font-family:Mono; font-size:16px; width:26px;
  align-self:flex-start; padding-top:5px; color:var(--hue); }
.mico svg { width:20px; height:20px; }
.mtxt { display:flex; flex-direction:column; gap:3px; min-width:0; flex:1 1 auto; }
.mname { font-family:MonoBold; letter-spacing:-.01em; color:var(--hue); }
.mbody { font-family:Body; font-size:${ty.itemBody.size}px;
  line-height:${ty.itemBody.leading}; color:${c.inkSoft}; }
/* Emphasis inside a row is weight, never colour. The category hue is the one
   loud thing on the slide; a second colour in the body would compete with it
   and the rows would stop reading as one set. */
.mbody .ac, .mbody b { color:${c.ink}; font-weight:600; font-family:BodyMid; font-style:normal; }
.mmet { flex:0 0 auto; align-self:center; font-family:Mono;
  letter-spacing:${ty.metric.tracking}em; border-radius:99px; padding:6px 13px;
  color:var(--hue); background:var(--tint); border:1px solid var(--hue); }

/* ── the taxonomy strip ───────────────────────────────────────────── */
.txs { display:flex; flex-wrap:wrap; gap:${sp.xs}px; margin-top:${sp.md}px; }
.tx { display:inline-flex; align-items:center; gap:7px; font-family:Mono;
  font-size:${ty.tag.size}px; letter-spacing:${ty.tag.tracking}em;
  border-radius:99px; padding:6px 13px; }
.tx i { width:7px; height:7px; border-radius:99px; display:inline-block; }
.tx b { font-family:MonoBold; opacity:.75; }

.stats { display:grid; gap:${sp.sm}px; }
.stats-2 { grid-template-columns:1fr 1fr; }
.stat { background:${c.surface}; border-radius:${r.md}px; padding:${sp.md}px;
  display:flex; flex-direction:column; gap:5px; border:1px solid ${c.rule}; }
.stat-v { font-family:Display; font-weight:800; font-size:${ty.statValue.size}px; color:var(--hue);
  letter-spacing:-.03em; }
.stat-l { font-family:Mono; font-size:${ty.statLabel.size}px; text-transform:uppercase;
  letter-spacing:.08em; color:${c.inkSoft}; }

.quote-wrap { border-left:5px solid ${accent}; padding-left:${sp.lg}px; }
.quote { font-family:Display; font-weight:800; font-size:${ty.quote.size}px;
  line-height:${ty.quote.leading}; text-wrap:balance; color:${c.ink}; }
.attrib { font-family:Mono; font-size:${ty.caption.size}px; text-transform:uppercase;
  letter-spacing:.12em; color:${c.inkFaint}; margin-top:${sp.sm}px; }

.action { display:inline-block; align-self:flex-start; margin:${sp.md}px 0;
  font-family:MonoBold; font-size:${ty.deck.size}px; color:${c.accentInk};
  background:${accent}; border-radius:${r.sm}px; padding:${sp.sm}px ${sp.lg}px; }

.term { background:#070A10; border:1px solid ${c.rule}; border-radius:${r.md}px; }
.term-bar { padding:10px ${sp.md}px; background:rgba(255,255,255,.05);
  font-family:Mono; font-size:15px; color:${c.inkFaint}; }
.term-bar i { background:rgba(255,255,255,.18); }
.term-body { padding:${sp.md}px; gap:5px; font-size:19px; line-height:1.42; color:#C9D3E2; }
.shot { background:${c.surface}; border:1px solid ${c.rule}; border-radius:${r.md}px; }
.shot-bar { padding:10px ${sp.md}px; background:${c.panel}; color:${c.inkFaint};
  font-family:Mono; font-size:15px; }
.shot-bar i { background:${c.rule}; }

.object { right:${Math.round(cv.margin * 0.6)}px; bottom:${Math.round(cv.safeBottom * 1.1)}px; }

/* ── motion ───────────────────────────────────────────────────────────
   Scoped to .is-anim, which only appears on a slide marked "animate": true.
   Rows arrive top to bottom, land by ~34% of the cycle and hold to 100%, so
   the still the renderer screenshots is the resting design.

   Nothing starts at opacity:0. The clip loops, so frame 0 follows the held
   final frame — coming up from nothing blanks the slide once per cycle. */
@keyframes mf-row {
  0%,  4%   { opacity:.22; transform:translateY(14px); }
  34%, 100% { opacity:1; transform:none; }
}
@keyframes mf-head {
  0%        { opacity:.35; transform:translateY(8px); }
  26%, 100% { opacity:1; transform:none; }
}
@keyframes mf-met {
  0%,  20%  { opacity:.25; }
  46%, 100% { opacity:1; }
}
.is-anim .mrow { animation:mf-row ${D}s cubic-bezier(.2,.8,.2,1) infinite both; }
.is-anim .mmet { animation:mf-met ${D}s ease-out infinite both; }
.is-anim .ghead, .is-anim .hl { animation:mf-head ${D}s ease-out infinite both; }
${stagger}

${textureCSS}
`;
}
