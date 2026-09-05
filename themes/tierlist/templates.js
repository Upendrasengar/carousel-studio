// Slide templates for the tierlist theme.
//
// An S/A/B/C board that fills in as you swipe. Each slide places one more
// item; the last slide is the completed board.
//
// Tier lists get shared because people disagree with them, and a disagreement
// is a DM. Put the contentious placement late — the board has to be worth
// arguing with by the time it is finished.

import {
  esc, rich, fitAttr, fitFrame, mediaCard, objectVisual, rowBadge, baseCSS,
  standardSlides, accumulate,
} from '../../scripts/lib/blocks.js';
import { icon } from '../../scripts/lib/icons.js';
import * as marks from '../../scripts/lib/marks.js';

const T = (c) => c.t.type;
const headline = (s, c) => s.headline ? `<h1 class="hl" ${fitAttr(T(c).headline)}>${rich(s.headline)}</h1>` : '';
const headlineXL = (s, c) => s.headline ? `<h1 class="hl hl-xl" ${fitAttr(T(c).headline, 1.22)}>${rich(s.headline)}</h1>` : '';
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
   * One placement. The board lives once on the deck; each slide says how many
   * items have been placed. Rows are always all shown — an empty S tier is
   * information, and a tier that fills late is the payoff.
   */
  tier(s, ctx) {
    const { deck, t } = ctx;
    const items = deck.board?.items || [];
    const upto = Number(s.upto ?? 0);
    if (!items.length) throw new Error('A "tier" slide needs deck.board.items.');
    if (upto < 1 || upto > items.length) {
      throw new Error(`Tier slide has upto=${s.upto}, but deck.board.items has ${items.length}.`);
    }
    const order = deck.board.tiers || ['S', 'A', 'B', 'C', 'D'];
    const placed = items.slice(0, upto);
    const rows = order.map((label) => {
      const inTier = placed
        .map((it, i) => ({ ...it, i }))
        .filter((it) => it.tier === label);
      const cards = inTier.map((it) => `<span class="tcard${it.i + 1 === upto ? ' tcard-new' : ''}">
        ${esc(it.name)}</span>`).join('');
      return `<div class="trow">
        <span class="tlab" style="background:${t.color.tiers[label] || t.color.rule}">${esc(label)}</span>
        <span class="tcards">${cards}</span>
      </div>`;
    }).join('');
    const latest = placed[upto - 1];
    return fitFrame(`
      ${s.headline ? `<h1 class="hl hl-sm" ${fitAttr(t.type.headline, 0.52)}>${rich(s.headline)}</h1>` : ''}
      <div class="board">${rows}</div>
      ${latest?.note ? `<p class="tnote" ${fitAttr(t.type.body)}><b>${esc(latest.name)}</b> — ${rich(latest.note)}</p>` : ''}`,
      'body-tier');
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
.ftr { bottom:${Math.round(cv.safeBottom * 0.32)}px; font-family:Mono;
  font-size:${ty.footer.size}px; color:${c.inkFaint}; letter-spacing:${ty.footer.tracking}em; }
.eyebrow { font-family:BodyMid; font-weight:600; font-size:${ty.eyebrow.size}px;
  letter-spacing:${ty.eyebrow.tracking}em; text-transform:uppercase; color:${accent}; }
.counter { font-family:Mono; font-size:${ty.eyebrow.size}px; color:${c.inkFaint}; }

.body { justify-content:flex-start; }
.body-hook, .body-cta, .body-quote, .body-tier { justify-content:center; }
.fit { gap:${sp.md}px; }
.hl { font-family:Impact; font-weight:400; color:${c.ink}; text-transform:uppercase; }
.hl-sm { font-family:BodyMid; font-weight:600; text-transform:uppercase;
  letter-spacing:.14em; color:${c.inkSoft}; }
.ac { color:${accent}; }

/* ── the board ────────────────────────────────────────────────────── */
.board { display:flex; flex-direction:column; gap:6px;
  min-height:${Math.round(cv.height * 0.46)}px;
  background:${c.surface}; border:1px solid ${c.rule}; border-radius:${r.md}px; padding:8px; }
.trow { display:flex; align-items:stretch; gap:8px; flex:1; min-height:92px; }
.tlab { flex:0 0 92px; display:grid; place-items:center; border-radius:${r.sm}px;
  font-family:Impact; font-size:40px; color:#15171C; }
.tcards { flex:1; display:flex; flex-wrap:wrap; gap:6px; align-content:center;
  background:${c.bg}; border-radius:${r.sm}px; padding:8px; }
.tcard { font-family:BodyMid; font-weight:600; font-size:22px; color:${c.inkSoft};
  background:${c.surface}; border:1px solid ${c.rule}; border-radius:${r.sm}px;
  padding:9px 14px; }
/* The newest placement is the only lit card — that is the slide's news. */
.tcard-new { color:${c.bg}; background:${accent}; border-color:${accent}; }
.tnote { font-family:Body; color:${c.inkSoft}; }
.tnote b { color:${c.ink}; }

/* ── shared parts ─────────────────────────────────────────────────── */
.hl { font-family:Display; font-size:${ty.headline.size}px; line-height:${ty.headline.leading};
  letter-spacing:${ty.headline.tracking}em; text-wrap:balance; }
.hl-xl { font-size:${Math.round(ty.headline.size * 1.22)}px; }
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
