// Slide templates for the stat-card theme.
//
// Each slide is a collectible card: a portrait frame, a rarity colour, a stat
// block and a flavour line. A deck is a set, and a set is something people
// screenshot to complete.
//
// The rarity colour is the only thing that varies between cards, which is
// what makes them read as one series rather than nine unrelated designs.

import {
  esc, rich, fitAttr, fitFrame, mediaCard, objectVisual, rowBadge, baseCSS,
  standardSlides, accumulate,
} from '../../scripts/lib/blocks.js';
import { icon } from '../../scripts/lib/icons.js';
import * as marks from '../../scripts/lib/marks.js';

const T = (c) => c.t.type;
const headline = (s, c) => s.headline ? `<h1 class="hl" ${fitAttr(T(c).headline)}>${rich(s.headline)}</h1>` : '';
const headlineXL = (s, c) => s.headline ? `<h1 class="hl hl-xl" ${fitAttr(T(c).headline, 1.18)}>${rich(s.headline)}</h1>` : '';
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
   * One card. Rarity drives the frame colour and the label, and it is the
   * only thing that varies between cards — that restraint is what makes a
   * deck read as one series instead of nine unrelated designs.
   */
  card(s, ctx) {
    const { t } = ctx;
    const rar = s.rarity || 'common';
    const col = t.color.rarity[rar] || t.color.rarity.common;
    const stats = (s.stats || []).map((st) => `<li class="cst">
      <span class="cst-l">${esc(st.label)}</span>
      <span class="cst-bar"><i style="width:${Math.max(4, Math.min(100, Number(st.pct ?? 50)))}%;background:${col}"></i></span>
      <span class="cst-v">${esc(st.value)}</span></li>`).join('');
    return fitFrame(`
      <div class="card" style="--rar:${col}">
        <div class="chead">
          <span class="cname" ${fitAttr(t.type.headline, 0.46)}>${rich(s.name || s.headline || '')}</span>
          <span class="crar">${esc(rar)}</span>
        </div>
        ${s.art ? `<div class="cart"><img src="${esc(s.art)}" alt=""></div>` : ''}
        ${s.body ? `<p class="cdesc" ${fitAttr(t.type.rowBody)}>${rich(s.body)}</p>` : ''}
        ${stats ? `<ul class="cstats">${stats}</ul>` : ''}
        ${s.flavour ? `<p class="cflav" ${fitAttr(t.type.caption)}>${esc(s.flavour)}</p>` : ''}
      </div>`, 'body-card');
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
body { background:${c.bg}; color:${c.ink}; font-family:Body, system-ui, sans-serif;
  background-image:radial-gradient(90% 60% at 50% 0%, rgba(255,255,255,.05), transparent 70%); }
.hdr, .ftr { position:absolute; left:${cv.margin}px; right:${cv.margin}px; z-index:40;
  display:flex; align-items:center; justify-content:space-between; }
.hdr { top:${Math.round(cv.safeTop * 0.36)}px; }
.ftr { bottom:${Math.round(cv.safeBottom * 0.32)}px; font-family:Mono;
  font-size:${ty.footer.size}px; color:${c.inkFaint}; letter-spacing:${ty.footer.tracking}em; }
.eyebrow { font-family:Condensed; font-size:${ty.eyebrow.size + 3}px; letter-spacing:.2em;
  text-transform:uppercase; color:${accent}; }
.counter { font-family:Mono; font-size:${ty.eyebrow.size}px; color:${c.inkFaint}; }

.body { justify-content:center; }
.fit { gap:${sp.md}px; }
.hl { font-family:Display; font-weight:700; color:${c.ink}; }
.ac { color:${accent}; }

/* ── the card ─────────────────────────────────────────────────────── */
.card { background:${c.surface}; border:3px solid var(--rar); border-radius:${r.lg}px;
  min-height:${Math.round(cv.height * 0.5)}px; justify-content:space-between;
  padding:${sp.md}px; display:flex; flex-direction:column; gap:${sp.sm}px;
  box-shadow:0 0 0 1px rgba(0,0,0,.4), 0 30px 70px -40px #000, 0 0 60px -30px var(--rar); }
.chead { display:flex; align-items:center; justify-content:space-between; gap:${sp.sm}px;
  border-bottom:2px solid var(--rar); padding-bottom:${sp.sm}px; }
.cname { font-family:Condensed; text-transform:uppercase; letter-spacing:.01em; line-height:1.02; }
.crar { flex:0 0 auto; font-family:Condensed; font-size:17px; letter-spacing:.2em;
  text-transform:uppercase; color:${c.bg}; background:var(--rar); padding:5px 12px;
  border-radius:99px; }
.cart { border-radius:${r.sm}px; overflow:hidden; background:${c.bg}; }
.cart img { width:100%; display:block; }
.cdesc { font-family:Body; color:${c.inkSoft}; line-height:1.4; }
.cstats { list-style:none; display:flex; flex-direction:column; gap:9px; }
.cst { display:flex; align-items:center; gap:${sp.sm}px; }
.cst-l { flex:0 0 33%; font-family:Mono; font-size:18px; letter-spacing:.1em;
  text-transform:uppercase; color:${c.inkFaint}; }
.cst-bar { flex:1; height:12px; background:${c.bg}; border-radius:99px; overflow:hidden; }
.cst-bar i { display:block; height:100%; border-radius:99px; }
.cst-v { flex:0 0 auto; font-family:Condensed; font-size:24px; color:${c.ink}; }
.cflav { font-family:Body; font-style:italic; color:${c.inkFaint};
  border-top:1px solid ${c.rule}; padding-top:${sp.sm}px; }

/* ── shared parts ─────────────────────────────────────────────────── */
.hl { font-family:Display; font-size:${ty.headline.size}px; line-height:${ty.headline.leading};
  letter-spacing:${ty.headline.tracking}em; text-wrap:balance; }
.hl-xl { font-size:${Math.round(ty.headline.size * 1.18)}px; }
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
