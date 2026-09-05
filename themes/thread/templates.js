// Slide templates for the thread theme.
//
// A terminal session that accumulates. Every `line` slide replays the whole
// session so far with earlier blocks dimmed, and lights one new block. The
// reader watches a session run rather than reading N screenshots of one.
//
// This is the only dark pack, deliberately: six light themes in a row is a
// palette, not a library, and a log genuinely wants a dark ground.

import {
  esc, rich, fitAttr, fitFrame, mediaCard, objectVisual, rowBadge, baseCSS,
  standardSlides, accumulate,
} from '../../scripts/lib/blocks.js';
import { icon } from '../../scripts/lib/icons.js';
import * as marks from '../../scripts/lib/marks.js';

const T = (ctx) => ctx.t.type;
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
   * One step of the session. `deck.session.items` holds the whole log once;
   * each slide names how far in it has got. Past blocks stay visible but
   * recede, so the reader sees progress rather than repetition.
   */
  line(s, ctx) {
    const { deck, t } = ctx;
    const body = accumulate(deck, s, (entry, i, state) => {
      const cmdLines = (entry.cmd ? [entry.cmd] : []).map((l) =>
        `<span class="tl tl-cmd">${esc(l)}</span>`).join('');
      const outLines = (entry.out || []).map((l) =>
        `<span class="tl">${esc(l)}</span>`).join('');
      return `<div class="blk blk-${state}">
        ${entry.label ? `<span class="blab">${esc(entry.label)}</span>` : ''}
        ${cmdLines}${outLines}
      </div>`;
    }, { key: 'session' });

    return fitFrame(`
      ${s.headline ? `<h1 class="hl hl-sm" ${fitAttr(t.type.headline, 0.5)}>${rich(s.headline)}</h1>` : ''}
      <div class="term term-live">
        <div class="term-bar"><i></i><i></i><i></i><span>${esc(deck.session?.title || 'session')}</span></div>
        <div class="term-body">${body}<span class="cursor"></span></div>
      </div>
      ${para(s, ctx)}`, 'body-line');
  },
};

export const SLIDE_TYPES = Object.keys(TYPES);

function header(slide, ctx) {
  const { deck, index, total } = ctx;
  const counter = deck.showCounter === false ? ''
    : `<span class="counter">${String(index + 1).padStart(2, '0')}/${String(total).padStart(2, '0')}</span>`;
  return `<header class="hdr">
    <span class="dot" style="background:${ctx.accent}"></span>
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
  background-image:radial-gradient(120% 80% at 50% -10%, ${accent}14, transparent 60%); }

.hdr, .ftr { position:absolute; left:${cv.margin}px; right:${cv.margin}px; z-index:40;
  display:flex; align-items:center; gap:${sp.sm}px; }
.hdr { top:${Math.round(cv.safeTop * 0.36)}px; }
.ftr { bottom:${Math.round(cv.safeBottom * 0.32)}px; justify-content:space-between;
  font-family:Mono; font-size:${ty.footer.size}px; color:${c.inkFaint};
  letter-spacing:${ty.footer.tracking}em; }
.dot { width:12px; height:12px; border-radius:50%; }
.eyebrow { font-family:Mono; font-size:${ty.eyebrow.size}px;
  letter-spacing:${ty.eyebrow.tracking}em; text-transform:uppercase; color:${c.inkSoft}; }
.counter { margin-left:auto; font-family:Mono; font-size:${ty.eyebrow.size}px; color:${c.inkFaint}; }

.body { justify-content:flex-start; }
.body-hook, .body-cta, .body-quote, .body-line { justify-content:center; }
.fit { gap:${sp.md}px; }

.hl { font-family:Display; font-weight:700; font-size:${ty.headline.size}px;
  line-height:${ty.headline.leading}; letter-spacing:${ty.headline.tracking}em;
  color:${c.ink}; text-wrap:balance; }
.hl-xl { font-size:${Math.round(ty.headline.size * 1.2)}px; }
.hl-sm { font-family:Mono; font-weight:400; letter-spacing:.06em;
  text-transform:uppercase; color:${c.inkSoft}; }
.ac { color:${accent}; }
.deck { font-family:Body; font-size:${ty.deck.size}px; line-height:${ty.deck.leading}; color:${c.inkSoft}; max-width:88%; }
.para { font-family:Body; font-size:${ty.body.size}px; line-height:${ty.body.leading}; color:${c.inkSoft}; max-width:92%; }

/* ── the accumulating session ─────────────────────────────────────── */
.term-live { background:${c.surface}; border:1px solid ${c.rule}; border-radius:${r.md}px;
  box-shadow:0 30px 70px -40px #000; }
.term-live .term-bar { padding:13px ${sp.md}px; background:rgba(255,255,255,.03);
  border-bottom:1px solid ${c.rule}; font-family:Mono; font-size:17px; color:${c.inkFaint}; }
.term-live .term-bar i { background:${c.rule}; }
.term-live .term-body { padding:${sp.md}px; gap:${sp.sm}px;
  min-height:${Math.round(cv.height * 0.42)}px; }
.blk { display:flex; flex-direction:column; gap:5px; padding-left:${sp.md}px;
  border-left:3px solid transparent; }
.blab { font-family:Mono; font-size:15px; letter-spacing:.14em; text-transform:uppercase;
  color:${c.inkFaint}; margin-bottom:2px; }
.tl { font-family:Mono; font-size:${ty.line.size}px; line-height:${ty.line.leading};
  color:${c.inkSoft}; white-space:pre-wrap; }
.tl-cmd { color:${c.ink}; }

/* Everything already run recedes; the newest block is the only lit thing. */
.blk-past { opacity:.34; }
.blk-new { border-left-color:${accent}; }
.blk-new .tl-cmd { color:${accent}; }
.blk-new .tl { color:${c.ink}; }
.cursor { display:inline-block; width:14px; height:26px; background:${accent};
  margin-left:${sp.md}px; opacity:.9; }

.rows { list-style:none; display:flex; flex-direction:column; }
.row { display:flex; gap:${sp.md}px; align-items:flex-start;
  padding:${sp.sm}px 0 ${sp.md}px; border-bottom:1px solid ${c.rule}; }
.row:first-child { border-top:1px solid ${c.rule}; padding-top:${sp.md}px; }
.chip { flex:0 0 auto; width:46px; height:46px; border-radius:${r.sm}px; display:grid; place-items:center; }
.chip svg { width:24px; height:24px; }
.chip-num { font-family:MonoBold; font-size:22px; }
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
  line-height:${ty.quote.leading}; text-wrap:balance; color:${c.ink}; }
.attrib { font-family:Mono; font-size:${ty.caption.size}px; color:${c.inkFaint};
  text-transform:uppercase; letter-spacing:.12em; margin-top:${sp.sm}px; }

.action { position:relative; display:inline-block; margin:26px 0;
  font-family:MonoBold; font-size:${ty.deck.size}px; color:${c.ink}; padding:${sp.sm}px ${sp.md}px; }
.mk-circle { position:absolute; left:-24px; top:50%; transform:translateY(-50%); }

.term { background:#05070A; border:1px solid ${c.rule}; border-radius:${r.md}px; }
.term-bar { padding:11px ${sp.md}px; font-family:Mono; font-size:16px; color:${c.inkFaint}; }
.term-bar i { background:${c.rule}; }
.term-body { padding:${sp.md}px; gap:6px; font-size:20px; line-height:1.44; color:${c.inkSoft}; }
.shot { background:${c.surface}; border:1px solid ${c.rule}; border-radius:${r.md}px; }
.shot-bar { padding:11px ${sp.md}px; background:${c.bg}; color:${c.inkFaint}; font-family:Mono; font-size:16px; }
.shot-bar i { background:${c.rule}; }

.object { right:${Math.round(cv.margin * 0.5)}px; bottom:${Math.round(cv.safeBottom * 0.9)}px; }

${textureCSS}
`;
}
