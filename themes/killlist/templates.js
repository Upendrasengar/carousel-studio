// Slide templates for the killlist theme.
//
// Every row is a pair: the thing on the left, the specific bad thing it kills
// on the right. That is the whole pack.
//
// It is not `swap`, which compares two products. This is item + its negation —
// each row carries its own "before", so a list of five fixes reads as five
// arguments rather than five bullets. The format for "N things that stop X".
//
// Numbering runs across the whole deck the way `catalogue` does: page one is
// 01-05, page two picks up at 06. Computed from the pages before, so inserting
// a page renumbers everything below it.

import {
  esc, rich, fitAttr, fitFrame, mediaCard, objectVisual, rowBadge, baseCSS,
  standardSlides,
} from '../../scripts/lib/blocks.js';
import { icon } from '../../scripts/lib/icons.js';
import * as marks from '../../scripts/lib/marks.js';

const T = (c) => c.t.type;
const headline = (s, c, mul = 1) => s.headline
  ? `<h1 class="hl" ${fitAttr(T(c).headline, mul)}>${rich(s.headline)}</h1>` : '';
const headlineXL = (s, c) => headline(s, c, 1.22);
const deckLine = (s, c) => s.deck ? `<p class="deck" ${fitAttr(T(c).deck)}>${rich(s.deck)}</p>` : '';
const para = (s, c) => s.body ? `<p class="para" ${fitAttr(T(c).body)}>${rich(s.body)}</p>` : '';

/**
 * Items on `kills` pages before this one.
 *
 * Keyed on index, never on object identity — the renderer passes each template
 * a structuredClone of the slide, so `s === slide` is false for every entry
 * and an identity check silently counts the whole deck.
 */
function offsetOf(deck, index) {
  let n = 0;
  for (let i = 0; i < index; i++) {
    const s = deck.slides[i];
    if (s && s.type === 'kills') n += (s.items || []).length;
  }
  return n;
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

  /** One page of paired rows. */
  kills(s, ctx) {
    const { t, deck } = ctx;
    const start = offsetOf(deck, ctx.index);
    const rows = (s.items || []).slice(0, t.budgets.maxItems).map((it, i) => {
      const tint = t.color.chipTints[i % t.color.chipTints.length];
      const ink = t.color.chipInks[i % t.color.chipInks.length];
      return `<li class="pair">
        <span class="pnum" style="background:${tint};color:${ink}">${String(start + i + 1).padStart(2, '0')}</span>
        <span class="pmain">
          <span class="phead">
            <b ${fitAttr(t.type.itemName)}>${esc(it.name)}</b>
            ${it.slug ? `<i ${fitAttr(t.type.itemSlug)}>${esc(it.slug)}</i>` : ''}
          </span>
          ${it.body ? `<span class="pbody" ${fitAttr(t.type.itemBody)}>${esc(it.body)}</span>` : ''}
        </span>
        ${it.kills ? `<span class="pkill">
          <b ${fitAttr(t.type.killLabel)}>Kills</b>
          <span ${fitAttr(t.type.killBody)}>${esc(it.kills)}</span>
        </span>` : ''}
      </li>`;
    }).join('');
    return fitFrame(`${headline(s, ctx)}${deckLine(s, ctx)}
      <ul class="pairs">${rows}</ul>`, 'body-kills');
  },
};

export const SLIDE_TYPES = Object.keys(TYPES);

function header(slide, ctx) {
  const { deck } = ctx;
  const left = slide.type === 'kills' && slide.n != null && slide.of != null
    ? `${String(slide.n).padStart(2, '0')} / ${String(slide.of).padStart(2, '0')} &middot; ${esc(slide.category || '')}`
    : esc(slide.eyebrow || deck.brand || '');
  return `<header class="hdr">
    <span class="eb">${left}</span>
    ${deck.handle ? `<span class="brand"><i></i>${esc(deck.handle)}</span>` : ''}
  </header>`;
}
const footer = (ctx) => `<footer class="ftr">
  <span class="dots">${Array.from({ length: ctx.total }, (_, i) =>
    `<i class="${i === ctx.index ? 'on' : ''}"></i>`).join('')}</span>
  <span class="swipe">Swipe <b>&rarr;</b></span></footer>`;

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
  background-size:60px 60px; }

.hdr, .ftr { position:absolute; left:${cv.margin}px; right:${cv.margin}px; z-index:40;
  display:flex; align-items:center; justify-content:space-between; }
.hdr { top:${Math.round(cv.safeTop * 0.40)}px; }
.ftr { bottom:${Math.round(cv.safeBottom * 0.34)}px; }
.eb { font-family:Mono; font-size:${ty.eyebrow.size}px; letter-spacing:${ty.eyebrow.tracking}em;
  text-transform:uppercase; color:${c.inkFaint}; }
.brand { display:inline-flex; align-items:center; gap:8px; font-family:BodyMid; font-weight:600;
  font-size:${ty.footer.size}px; color:${c.inkSoft}; }
.brand i { width:26px; height:26px; border-radius:50%; background:${accent}; display:block; }
.dots { display:flex; gap:6px; }
.dots i { width:7px; height:7px; border-radius:50%; background:${c.rule}; display:block; }
.dots i.on { background:${accent}; width:20px; border-radius:99px; }
.swipe { font-family:Mono; font-size:${ty.footer.size}px; letter-spacing:${ty.footer.tracking}em;
  color:${c.inkFaint}; }
.swipe b { color:${accent}; }

.body { justify-content:flex-start; top:${Math.round(cv.safeTop + 28)}px; }
.body-hook, .body-cta, .body-quote { justify-content:center; }
.fit { gap:${sp.sm}px; }

.hl { font-family:Display; font-weight:700; font-size:${ty.headline.size}px;
  line-height:${ty.headline.leading}; letter-spacing:${ty.headline.tracking}em; color:${c.ink}; }
.ac { color:${accent}; }
.deck { font-family:Body; font-size:${ty.deck.size}px; line-height:${ty.deck.leading};
  color:${c.inkSoft}; margin-bottom:${sp.sm}px; }
.para { font-family:Body; font-size:${ty.body.size}px; line-height:${ty.body.leading}; color:${c.inkSoft}; }

/* ── the paired rows ──────────────────────────────────────────────── */
.pairs { list-style:none; display:flex; flex-direction:column; gap:${sp.sm}px; flex:1;
  min-height:${Math.round(cv.height * 0.68)}px; }
.pair { flex:1; display:grid; grid-template-columns:auto 1fr 0.78fr;
  align-items:center; gap:${sp.md}px;
  background:${c.surface}; border:1px solid ${c.rule}; border-radius:${r.md}px;
  padding:${sp.md}px; }
.pnum { flex:0 0 auto; width:48px; height:48px; border-radius:${r.sm}px;
  display:grid; place-items:center; font-family:MonoBold; font-size:20px; }
.pmain { display:flex; flex-direction:column; gap:5px; min-width:0; }
.phead { display:flex; align-items:baseline; gap:10px; flex-wrap:wrap; }
.phead b { font-family:Display; font-weight:700; color:${c.ink}; letter-spacing:-.02em; }
.phead i { font-style:normal; font-family:Mono; letter-spacing:${ty.itemSlug.tracking}em;
  color:${c.inkFaint}; }
.pbody { font-family:Body; color:${c.inkSoft}; line-height:${ty.itemBody.leading}; }

/* The negation. Inset, bordered and red-labelled so the eye reads it as the
   consequence of the row rather than as a second description. */
.pkill { display:flex; flex-direction:column; gap:4px;
  background:${c.inset}; border:1px solid ${c.rule}; border-radius:${r.sm}px;
  padding:${sp.sm}px ${sp.md}px; }
.pkill b { font-family:Mono; letter-spacing:${ty.killLabel.tracking}em; text-transform:uppercase;
  color:${c.kill}; }
.pkill span { font-family:Body; color:${c.ink}; line-height:${ty.killBody.leading}; }

.rows { list-style:none; display:flex; flex-direction:column; }
.row { display:flex; gap:${sp.md}px; align-items:flex-start;
  padding:${sp.sm}px 0 ${sp.md}px; border-bottom:1px solid ${c.rule}; }
.row:first-child { border-top:1px solid ${c.rule}; padding-top:${sp.md}px; }
.chip { flex:0 0 auto; width:46px; height:46px; border-radius:${r.sm}px; display:grid; place-items:center; }
.chip svg { width:24px; height:24px; }
.chip-num { font-family:MonoBold; font-size:21px; }
.rtxt { display:flex; flex-direction:column; gap:3px; padding-top:3px; }
.rt { font-family:BodyMid; font-weight:600; font-size:${ty.rowTitle.size}px; color:${c.ink}; }
.rb { font-family:Body; font-size:${ty.rowBody.size}px; line-height:${ty.rowBody.leading}; color:${c.inkSoft}; }

.stats { display:grid; gap:${sp.sm}px; }
.stats-2 { grid-template-columns:1fr 1fr; }
.stat { background:${c.surface}; border:1px solid ${c.rule}; border-radius:${r.md}px;
  padding:${sp.md}px; display:flex; flex-direction:column; gap:5px; }
.stat-v { font-family:Display; font-weight:700; font-size:${ty.statValue.size}px;
  letter-spacing:-.03em; color:${accent}; }
.stat-l { font-family:Mono; font-size:${ty.statLabel.size}px; text-transform:uppercase;
  letter-spacing:.08em; color:${c.inkSoft}; }

.quote-wrap { border-left:4px solid ${accent}; padding-left:${sp.lg}px; }
.quote { font-family:Display; font-weight:700; font-size:${ty.quote.size}px;
  line-height:${ty.quote.leading}; text-wrap:balance; }
.attrib { font-family:Mono; font-size:${ty.caption.size}px; text-transform:uppercase;
  letter-spacing:.12em; color:${c.inkFaint}; margin-top:${sp.sm}px; }

.action { position:relative; display:inline-block; margin:26px 0;
  font-family:MonoBold; font-size:${ty.deck.size}px; color:${c.accentInk};
  background:${accent}; border-radius:${r.sm}px; padding:${sp.sm}px ${sp.lg}px; }
.mk-circle { display:none; }

.term { background:#061220; border:1px solid ${c.rule}; border-radius:${r.md}px; }
.term-bar { padding:11px ${sp.md}px; font-family:Mono; font-size:15px; color:${c.inkFaint}; }
.term-bar i { background:${c.rule}; }
.term-body { padding:${sp.md}px; gap:6px; font-size:20px; line-height:1.44; color:${c.inkSoft}; }
.shot { background:${c.surface}; border:1px solid ${c.rule}; border-radius:${r.md}px; }
.shot-bar { padding:11px ${sp.md}px; background:${c.bg}; color:${c.inkFaint};
  font-family:Mono; font-size:15px; }
.shot-bar i { background:${c.rule}; }

.object { right:${Math.round(cv.margin * 0.6)}px; bottom:${Math.round(cv.safeBottom * 1.1)}px; }

${textureCSS}
`;
}
