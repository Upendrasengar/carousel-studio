// Slide templates for the schematic theme.
//
// A technical drawing: cyan on navy, a plotted grid, dimension lines and
// numbered callout leaders. Each `detail` slide is a zoom into the part the
// previous slide pointed at, so the deck reads as an exploded view rather
// than as a list of components.

import {
  esc, rich, fitAttr, fitFrame, mediaCard, objectVisual, rowBadge, baseCSS,
  standardSlides, accumulate, nodeGraph,
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
   * One plate of the drawing. Callouts are numbered leaders pointing at
   * positions on the plate; `zoom` marks the region the NEXT slide will
   * enlarge, which is what turns a set of diagrams into an exploded view.
   */
  detail(s, ctx) {
    const { t } = ctx;
    const calls = (s.callouts || []).map((k, i) => `<span class="call ${k.x > 52 ? 'call-l' : ''}"
        style="left:${k.x}%; top:${k.y}%">
        <i class="cnum">${k.n ?? i + 1}</i>
        <span class="clead"></span>
        <span class="ctext" ${fitAttr(t.type.rowBody)}>${rich(k.text)}</span>
      </span>`).join('');
    const zoom = s.zoom
      ? `<span class="zoom" style="left:${s.zoom.x}%; top:${s.zoom.y}%;
          width:${s.zoom.w}%; height:${s.zoom.h}%"><i>next</i></span>` : '';
    return fitFrame(`
      ${s.headline ? `<h1 class="hl hl-sm" ${fitAttr(t.type.headline, 0.56)}>${rich(s.headline)}</h1>` : ''}
      <div class="plate">
        <span class="pnum">${esc(s.plate || '')}</span>
        <div class="pbody">${s.art ? `<img src="${esc(s.art)}" alt="">` : ''}${
          s.graph ? nodeGraph(s.graph, { iconFn: icon }) : ''
        }${calls}${zoom}</div>
        <span class="dim"><i></i><b>${esc(s.dim || '')}</b><i></i></span>
      </div>
      ${para(s, ctx)}`, 'body-detail');
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
  background-image:
    linear-gradient(${c.grid} 1px, transparent 1px),
    linear-gradient(90deg, ${c.grid} 1px, transparent 1px);
  background-size:54px 54px; }
.hdr, .ftr { position:absolute; left:${cv.margin}px; right:${cv.margin}px; z-index:40;
  display:flex; align-items:center; justify-content:space-between; }
.hdr { top:${Math.round(cv.safeTop * 0.34)}px; padding-bottom:8px;
  border-bottom:1px solid ${accent}66; }
.ftr { bottom:${Math.round(cv.safeBottom * 0.3)}px; font-family:Mono;
  font-size:${ty.footer.size}px; color:${c.inkFaint}; letter-spacing:${ty.footer.tracking}em;
  padding-top:8px; border-top:1px solid ${accent}44; }
.eyebrow { font-family:Mono; font-size:${ty.eyebrow.size}px; letter-spacing:.2em;
  text-transform:uppercase; color:${accent}; }
.counter { font-family:Mono; font-size:${ty.eyebrow.size}px; color:${c.inkFaint}; }

.body { justify-content:flex-start; }
.body-hook, .body-cta, .body-quote, .body-detail { justify-content:center; }
.fit { gap:${sp.md}px; }
.hl { font-family:Display; font-weight:700; color:${c.ink}; }
.hl-sm { font-family:Mono; letter-spacing:.14em; text-transform:uppercase; color:${accent}; }
.ac { color:${accent}; }

/* ── the plate ────────────────────────────────────────────────────── */
.plate { position:relative; border:1px solid ${accent}88; border-radius:2px;
  padding:${sp.md}px; background:${c.surface}88; }
.pnum { position:absolute; top:-13px; left:${sp.md}px; background:${c.bg};
  font-family:Mono; font-size:17px; letter-spacing:.18em; text-transform:uppercase;
  color:${accent}; padding:0 10px; }
.pbody { position:relative; min-height:${Math.round(cv.height * 0.42)}px; }
.pbody img { width:100%; display:block; opacity:.9; }
.call { position:absolute; display:flex; align-items:flex-start; gap:8px; }
.cnum { flex:0 0 auto; width:30px; height:30px; border-radius:50%;
  border:1px solid ${accent}; color:${accent}; background:${c.bg};
  display:grid; place-items:center; font-family:MonoBold; font-size:16px; font-style:normal; }
.clead { position:absolute; left:15px; top:15px; width:44px; height:1px;
  background:${accent}88; transform-origin:left center; transform:rotate(28deg); }
/* em-based, so the column grows with the type the fit pass just scaled.
   At a fixed pixel width a grown callout wraps to about nine characters. */
.ctext { font-family:Mono; color:${c.inkSoft}; width:11em; padding-left:34px; }
/* Past the halfway mark the callout opens leftward so its text stays on the plate. */
.call-l { flex-direction:row-reverse; transform:translateX(-100%); }
.call-l .ctext { padding-left:0; padding-right:34px; text-align:right; }
.call-l .clead { left:auto; right:15px; transform:rotate(152deg); transform-origin:right center; }
/* The graph fills the plate. Styled flat and square — this is a drawing, not
   the console theme's lit circuit. */
.ng { position:absolute; inset:0; height:100% !important; }
.ng-wire { stroke:${accent}; stroke-width:1.2; opacity:.85; }
.ng-wire-dash { stroke-dasharray:4 3; opacity:.45; }
.ng-wire-live { stroke-width:2.2; }
.ng-pin { fill:${accent}; }
.ng-node { background:${c.bg}; border:1px solid ${accent}AA; border-radius:2px; padding:9px 13px; }
.ng-hub { border-width:2px; background:${c.surface}; }
.ng-ghost { opacity:.45; border-style:dashed; }
.ng-ico { color:${accent}; }
.ng-ico svg { width:17px; height:17px; }
.ng-txt b { font-family:MonoBold; font-size:19px; color:${c.ink}; letter-spacing:.02em; }
.ng-txt em { font-family:Mono; font-size:14px; color:${c.inkFaint}; margin-top:2px; }
.ng-elab { font-family:Mono; font-size:13px; letter-spacing:.16em; text-transform:uppercase;
  color:${accent}; background:${c.bg}; padding:2px 6px; }

/* The region the next slide enlarges. Naming it is what makes the zoom read. */
.zoom { position:absolute; border:1px dashed ${accent}; border-radius:2px; }
.zoom i { position:absolute; right:-4px; bottom:-24px; font-style:normal;
  font-family:Mono; font-size:14px; letter-spacing:.2em; text-transform:uppercase;
  color:${accent}; }
.dim { display:flex; align-items:center; gap:10px; margin-top:${sp.sm}px; }
.dim i { flex:1; height:1px; background:${accent}66; position:relative; }
.dim i:before, .dim i:after { content:""; position:absolute; top:-4px; width:1px;
  height:9px; background:${accent}66; }
.dim i:before { left:0; } .dim i:after { right:0; }
.dim b { font-family:Mono; font-weight:400; font-size:17px; letter-spacing:.14em;
  text-transform:uppercase; color:${c.inkFaint}; }

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
