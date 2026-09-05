// Slide templates for the decision theme.
//
// A yes/no tree walked one node at a time. Each slide shows the path taken so
// far behind you, greyed, and the question you are on now.
//
// Decision trees are among the most-saved formats there is, because a save is
// how you come back to one. That is the whole reason this pack exists.

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
   * One node of the tree. `deck.tree.nodes` holds every question once; the
   * slide names which one it is on and which branch was taken to get here.
   * Answered nodes stay on screen, greyed, with their answer stamped — the
   * path is the thing the reader is meant to keep.
   */
  node(s, ctx) {
    const { deck, t } = ctx;
    const nodes = deck.tree?.nodes || [];
    if (!nodes.length) throw new Error('A "node" slide needs deck.tree.nodes.');
    const at = Number(s.at ?? 0);
    if (at < 1 || at > nodes.length) {
      throw new Error(`Node slide has at=${s.at}, but deck.tree.nodes has ${nodes.length}.`);
    }
    const path = (s.path || []);
    const trail = nodes.slice(0, at - 1).map((n, i) => {
      const ans = path[i];
      return `<li class="tn tn-past">
        <span class="tq">${rich(n.q)}</span>
        <span class="ta ta-${ans === 'yes' ? 'y' : 'n'}">${ans === 'yes' ? 'Yes' : 'No'}</span>
      </li>`;
    }).join('');
    const cur = nodes[at - 1];
    return fitFrame(`
      ${trail ? `<ul class="tpath">${trail}</ul>` : ''}
      <div class="tnow">
        <span class="tstep">Question ${at} of ${nodes.length}</span>
        <h1 class="tqbig" ${fitAttr(t.type.headline, 0.72)}>${rich(cur.q)}</h1>
        ${cur.note ? `<p class="tnote" ${fitAttr(t.type.body)}>${rich(cur.note)}</p>` : ''}
        <div class="tbranch">
          <span class="tb tb-y">Yes → ${esc(cur.yes || '')}</span>
          <span class="tb tb-n">No → ${esc(cur.no || '')}</span>
        </div>
      </div>`, 'body-node');
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
.eyebrow { font-family:BodyMid; font-weight:600; font-size:${ty.eyebrow.size}px;
  letter-spacing:${ty.eyebrow.tracking}em; text-transform:uppercase; color:${accent}; }
.counter { font-family:Mono; font-size:${ty.eyebrow.size}px; color:${c.inkFaint}; }

.body { justify-content:flex-start; }
.body-hook, .body-cta, .body-quote, .body-node { justify-content:center; }
.fit { gap:${sp.md}px; }
.hl { font-family:Display; font-weight:700; color:${c.ink}; }
.ac { color:${accent}; }

/* ── the walked path ──────────────────────────────────────────────── */
.tpath { list-style:none; display:flex; flex-direction:column; gap:8px; }
.tn { display:flex; align-items:center; gap:${sp.sm}px; padding:12px ${sp.md}px;
  border-radius:${r.sm}px; background:${c.surface}; border:1px solid ${c.rule}; }
.tn-past { opacity:.5; }
.tq { font-family:Body; font-size:22px; color:${c.inkSoft}; flex:1; }
.ta { font-family:BodyMid; font-weight:600; font-size:19px; padding:4px 12px;
  border-radius:99px; color:#fff; }
.ta-y { background:${c.yes}; }
.ta-n { background:${c.no}; }

.tnow { background:${c.surface}; border:2px solid ${accent}; border-radius:${r.md}px;
  min-height:${Math.round(cv.height * 0.34)}px; justify-content:center;
  padding:${sp.md}px; display:flex; flex-direction:column; gap:${sp.sm}px;
  box-shadow:0 22px 50px -32px rgba(21,23,26,.4); }
.tstep { font-family:Mono; font-size:17px; letter-spacing:.12em; text-transform:uppercase;
  color:${accent}; }
.tqbig { font-family:Display; font-weight:700; line-height:1.1; letter-spacing:-.02em; }
.tnote { font-family:Body; color:${c.inkSoft}; }
.tbranch { display:flex; gap:${sp.sm}px; margin-top:4px; flex-wrap:wrap; }
.tb { font-family:BodyMid; font-weight:600; font-size:21px; padding:11px 16px;
  border-radius:${r.sm}px; flex:1 1 45%; }
.tb-y { background:${c.yes}1A; color:${c.yes}; }
.tb-n { background:${c.no}1A; color:${c.no}; }

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
