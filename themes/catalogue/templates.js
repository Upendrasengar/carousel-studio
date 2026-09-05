// Slide templates for the catalogue theme.
//
// A paginated directory: ten items to a page, grouped into categories, with a
// tag on every card. It is the format for "120 tools, 12 categories" — the
// kind of post people save because it is a reference rather than a read.
//
// The one mechanic that matters is continuous numbering. Item 01 on page one
// runs to 10, page two starts at 11, and so on across the whole deck. Numbers
// are computed from the pages that came before, never written by hand, so
// inserting a page renumbers everything below it automatically and the count
// can never drift from the list.

import {
  esc, rich, fitAttr, fitFrame, mediaCard, objectVisual, rowBadge, baseCSS,
  standardSlides,
} from '../../scripts/lib/blocks.js';
import { icon } from '../../scripts/lib/icons.js';
import { brandMark } from '../../scripts/lib/assets.js';
import * as marks from '../../scripts/lib/marks.js';

const T = (c) => c.t.type;
const headline = (s, c, mul = 1) => s.headline
  ? `<h1 class="hl" ${fitAttr(T(c).headline, mul)}>${rich(s.headline)}</h1>` : '';
const headlineXL = (s, c) => headline(s, c, 1.22);
const deckLine = (s, c) => s.deck ? `<p class="deck" ${fitAttr(T(c).deck)}>${rich(s.deck)}</p>` : '';
const para = (s, c) => s.body ? `<p class="para" ${fitAttr(T(c).body)}>${rich(s.body)}</p>` : '';

/**
 * How many catalogue items appear on pages before this one.
 *
 * Keyed on the slide's index, never on object identity: the renderer passes
 * each template a structuredClone of the slide, so `s === slide` is false for
 * every entry and an identity check silently counts the whole deck.
 */
function offsetOf(deck, index) {
  let n = 0;
  for (let i = 0; i < index; i++) {
    const s = deck.slides[i];
    if (s && s.type === 'page') n += (s.items || []).length;
  }
  return n;
}

/** Total items across every page — the number the cover and cta quote. */
export function totalItems(deck) {
  return (deck.slides || []).filter((s) => s.type === 'page')
    .reduce((n, s) => n + (s.items || []).length, 0);
}

function itemCard(it, num, ctx) {
  const { t } = ctx;
  const m = brandMark(it.logo, t.color.ink);
  return `<div class="item">
    <div class="ihead">
      <span class="ilogo">${m ? m.html : `<b>${esc((it.name || '?').trim()[0].toUpperCase())}</b>`}</span>
      <span class="inum">${String(num).padStart(2, '0')}</span>
      <span class="iname" ${fitAttr(t.type.itemName)}>${esc(it.name || '')}</span>
      ${it.tag ? `<span class="itag" ${fitAttr(t.type.tag)}>${esc(it.tag)}</span>` : ''}
    </div>
    ${it.body ? `<span class="ibody" ${fitAttr(t.type.itemBody)}>${esc(it.body)}</span>` : ''}
    ${it.bestFor ? `<span class="imeta" ${fitAttr(t.type.itemMeta)}><b>Best for</b> &middot; ${esc(it.bestFor)}</span>` : ''}
  </div>`;
}

const TYPES = {
  ...standardSlides({
    headline, headlineXL, deckLine, para,
    rows: (s, c) => {
      if (!s.rows?.length) return '';
      const { t } = c;
      return `<ul class="rows">${s.rows.map((r, i) => {
        const tint = t.color.chipTints[i % t.color.chipTints.length];
        const ink = t.color.chipInks[i % t.color.chipInks.length];
        return `<li class="row">${rowBadge(r, { iconFn: icon, tint, ink })}
          <span class="rtxt"><span class="rt" ${fitAttr(t.type.rowTitle)}>${rich(r.title)}</span>
          ${r.body ? `<span class="rb" ${fitAttr(t.type.rowBody)}>${rich(r.body)}</span>` : ''}</span></li>`;
      }).join('')}</ul>`;
    },
    steps: (s, c) => {
      const list = s.steps || s.rows;
      if (!list?.length) return '';
      const { t } = c;
      return `<ul class="rows">${list.map((r, i) => `<li class="row">
        <span class="chip chip-num" style="background:${t.color.chipTints[i % 5]};color:${t.color.chipInks[i % 5]}">${i + 1}</span>
        <span class="rtxt"><span class="rt" ${fitAttr(t.type.rowTitle)}>${rich(r.title)}</span>
        ${r.body ? `<span class="rb" ${fitAttr(t.type.rowBody)}>${rich(r.body)}</span>` : ''}</span></li>`).join('')}</ul>`;
    },
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
         <span class="mk mk-circle">${marks.circle(c.rng, 380, 112, { color: c.accent, weight: 6 })}</span></p>` : '',
  }),

  /** One page of the directory. */
  page(s, ctx) {
    const { t, deck } = ctx;
    const start = offsetOf(deck, ctx.index);
    const items = (s.items || []).map((it, i) => itemCard(it, start + i + 1, ctx)).join('');
    return fitFrame(`
      ${headline(s, ctx)}
      ${deckLine(s, ctx)}
      <div class="grid">${items}</div>`, 'body-page');
    void t;
  },
};

export const SLIDE_TYPES = Object.keys(TYPES);

function header(slide, ctx) {
  const { deck } = ctx;
  if (slide.type !== 'page') {
    return `<header class="hdr"><span class="cat">${esc(slide.eyebrow || deck.brand || '')}</span></header>`;
  }
  const cat = slide.n != null && slide.of != null
    ? `Category ${String(slide.n).padStart(2, '0')} &middot; ${esc(slide.category || '')}`
    : esc(slide.category || '');
  return `<header class="hdr">
    <span class="cat">${cat}</span>
    <span class="count">${(slide.items || []).length} tools</span>
  </header>`;
}
const footer = (ctx) => `<footer class="ftr">
  <span>${esc(ctx.deck.handle || '')}</span>
  <span>${String(ctx.index + 1).padStart(2, '0')} / ${String(ctx.total).padStart(2, '0')}</span></footer>`;

export function slideHTML(slide, ctx) {
  const build = TYPES[slide.type];
  if (!build) throw new Error(`Unknown slide type "${slide.type}". This theme has: ${SLIDE_TYPES.join(', ')}`);
  return `${header(slide, ctx)}${build(slide, ctx)}${objectVisual(slide, ctx.t, ctx.deck)}${footer(ctx)}`;
}

export function css(ctx) {
  const { t, accent, fontFaces, textureCSS } = ctx;
  const c = t.color, sp = t.space, ty = t.type, r = t.radius, cv = t.canvas, g = t.grid || { cols: 2 };
  return `${fontFaces}
${baseCSS(t)}
body { background:${c.bg}; color:${c.ink}; font-family:Body, system-ui, sans-serif;
  background-image:radial-gradient(90% 55% at 78% 4%, ${accent}0E, transparent 66%); }

.hdr, .ftr { position:absolute; left:${cv.margin}px; right:${cv.margin}px; z-index:40;
  display:flex; align-items:center; justify-content:space-between; }
.hdr { top:${Math.round(cv.safeTop * 0.42)}px; }
.ftr { bottom:${Math.round(cv.safeBottom * 0.34)}px; font-family:Mono;
  font-size:${ty.footer.size}px; letter-spacing:${ty.footer.tracking}em; color:${c.inkFaint}; }
.cat { font-family:Mono; font-size:${ty.eyebrow.size}px; letter-spacing:${ty.eyebrow.tracking}em;
  text-transform:uppercase; color:${accent}; }
.count { font-family:Mono; font-size:${ty.eyebrow.size}px; letter-spacing:.16em;
  text-transform:uppercase; color:${c.inkFaint}; }

.body { justify-content:flex-start; top:${Math.round(cv.safeTop + 34)}px; }
.body-hook, .body-cta, .body-quote { justify-content:center; }
.fit { gap:${sp.sm}px; }
.body-page .fit { gap:${sp.xs}px; }

.hl { font-family:Display; font-weight:700; font-size:${ty.headline.size}px;
  line-height:${ty.headline.leading}; letter-spacing:${ty.headline.tracking}em; color:${c.ink}; }
.ac { color:${accent}; }
.deck { font-family:Body; font-size:${ty.deck.size}px; line-height:${ty.deck.leading};
  color:${c.inkSoft}; margin-bottom:${sp.sm}px; }
.para { font-family:Body; font-size:${ty.body.size}px; line-height:${ty.body.leading}; color:${c.inkSoft}; }

/* ── the directory grid ───────────────────────────────────────────── */
/* A height floor, not flex:1 — .fit sizes to content by design, and forcing
   it to fill would make the fit pass measure zero overflow forever. */
.grid { display:grid; grid-template-columns:repeat(${g.cols}, 1fr);
  grid-auto-rows:1fr; gap:${sp.sm}px;
  min-height:${Math.round(cv.height * 0.62)}px; }
.item { background:${c.surface}; border-radius:${r.md}px; padding:${sp.md}px;
  display:flex; flex-direction:column; gap:6px; justify-content:center;
  box-shadow:0 1px 2px rgba(21,18,15,.04), 0 10px 22px -18px rgba(21,18,15,.28); }
.ihead { display:flex; align-items:center; gap:8px; }
.ilogo { flex:0 0 auto; width:40px; height:40px; border-radius:10px; background:${c.panel};
  display:grid; place-items:center; color:${c.ink}; }
.ilogo svg, .ilogo img { width:23px; height:23px; object-fit:contain; }
.ilogo b { font-family:Display; font-size:19px; }
.inum { font-family:MonoBold; font-size:17px; color:${accent}; }
.iname { font-family:Display; font-weight:700; color:${c.ink}; letter-spacing:-.02em; }
.itag { margin-left:auto; font-family:Mono; letter-spacing:${ty.tag.tracking}em;
  text-transform:uppercase; color:${accent}; background:${c.accentTint};
  border-radius:99px; padding:4px 9px; }
.ibody { font-family:Body; color:${c.inkSoft}; line-height:${ty.itemBody.leading}; }
.imeta { font-family:Mono; letter-spacing:${ty.itemMeta.tracking}em; text-transform:uppercase;
  color:${c.inkFaint}; }
.imeta b { color:${c.inkSoft}; font-weight:400; }

.rows { list-style:none; display:flex; flex-direction:column; }
.row { display:flex; gap:${sp.md}px; align-items:flex-start;
  padding:${sp.sm}px 0 ${sp.md}px; border-bottom:1px solid ${c.rule}; }
.row:first-child { border-top:1px solid ${c.rule}; padding-top:${sp.md}px; }
.chip { flex:0 0 auto; width:44px; height:44px; border-radius:${r.sm}px; display:grid; place-items:center; }
.chip svg { width:23px; height:23px; }
.chip-num { font-family:Display; font-size:21px; }
.rtxt { display:flex; flex-direction:column; gap:3px; padding-top:3px; }
.rt { font-family:BodyMid; font-weight:600; font-size:${ty.rowTitle.size}px; color:${c.ink}; }
.rb { font-family:Body; font-size:${ty.rowBody.size}px; line-height:${ty.rowBody.leading}; color:${c.inkSoft}; }

.stats { display:grid; gap:${sp.sm}px; }
.stats-2 { grid-template-columns:1fr 1fr; }
.stat { background:${c.surface}; border-radius:${r.md}px; padding:${sp.md}px;
  display:flex; flex-direction:column; gap:5px;
  box-shadow:0 10px 24px -20px rgba(21,18,15,.3); }
.stat-v { font-family:Display; font-weight:700; font-size:${ty.statValue.size}px;
  letter-spacing:-.03em; color:${accent}; }
.stat-l { font-family:Mono; font-size:${ty.statLabel.size}px; text-transform:uppercase;
  letter-spacing:.08em; color:${c.inkSoft}; }

.quote-wrap { border-left:5px solid ${accent}; padding-left:${sp.lg}px; }
.quote { font-family:Display; font-weight:700; font-size:${ty.quote.size}px;
  line-height:${ty.quote.leading}; text-wrap:balance; }
.attrib { font-family:Mono; font-size:${ty.caption.size}px; text-transform:uppercase;
  letter-spacing:.12em; color:${c.inkFaint}; margin-top:${sp.sm}px; }

.action { position:relative; display:inline-block; margin:26px 0;
  font-family:MonoBold; font-size:${ty.deck.size}px; color:${c.accentInk};
  background:${accent}; border-radius:99px; padding:${sp.sm}px ${sp.lg}px; }
.mk-circle { display:none; }

.term { background:#17140F; border-radius:${r.md}px; }
.term-bar { padding:10px ${sp.md}px; background:rgba(255,255,255,.06);
  font-family:Mono; font-size:15px; color:rgba(255,255,255,.5); }
.term-bar i { background:rgba(255,255,255,.2); }
.term-body { padding:${sp.md}px; gap:5px; font-size:19px; line-height:1.42; color:#DCD5CA; }
.shot { background:${c.surface}; border:1px solid ${c.rule}; border-radius:${r.md}px; }
.shot-bar { padding:10px ${sp.md}px; background:${c.panel}; color:${c.inkFaint};
  font-family:Mono; font-size:15px; }
.shot-bar i { background:${c.rule}; }

.object { right:${Math.round(cv.margin * 0.6)}px; bottom:${Math.round(cv.safeBottom * 1.1)}px; }

${textureCSS}
`;
}
