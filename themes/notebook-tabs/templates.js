// Slide templates for the notebook-tabs theme.
//
// Everything sits inside an inset paper card with a file-tab strip along the
// top. The card is the frame, so this theme carries more rows than the others
// without feeling loose — it is the one to reach for on a "50 MCP servers"
// style list deck.
//
// The tab strip doubles as a progress indicator: the tab matching the current
// slide is raised and coloured, the rest sit back.

import {
  esc, rich, fitAttr, fitFrame, mediaCard, baseCSS, objectVisual, rowBadge,
} from '../../scripts/lib/blocks.js';
import { icon } from '../../scripts/lib/icons.js';
import { mascotSVG } from '../../scripts/lib/mascot.js';
import * as marks from '../../scripts/lib/marks.js';

/** Tabs across the top of the card. The active one rides higher and takes
 *  colour, which turns decoration into a position cue for free. */
function tabs(ctx) {
  const { t, index, total } = ctx;
  const palette = t.color.tabs;
  const n = Math.min(total, palette.length);
  const active = index % n;
  const strip = Array.from({ length: n }, (_, i) => {
    const on = i === active;
    return `<span class="tab${on ? ' tab-on' : ''}" style="background:${palette[i]};opacity:${on ? 1 : 0.42}"></span>`;
  }).join('');
  return `<span class="tabs">${strip}</span>`;
}

function cardChrome(slide, ctx) {
  const { deck, index, total } = ctx;
  const label = deck.showCounter === false ? ''
    : `<span class="slidechip">Slide ${index + 1} / ${total}</span>`;
  return `<div class="chrome">
    <span class="chrome-l">${label}${tabs(ctx)}</span>
    <span class="dots"><i></i><i></i><i style="background:${ctx.accent}"></i></span>
  </div>${slide.eyebrow ? `<span class="eyebrow">${esc(slide.eyebrow)}</span>` : ''}`;
}

/** The mascot peeks over the card's top-right corner rather than sitting
 *  inside it, which is what makes the card read as a physical object. */
function mascot(slide, ctx) {
  if (slide.mascot === false) return '';
  const { t } = ctx;
  const pose = slide.mascot || t.mascot.poseByType[slide.type] || t.mascot.defaultPose;
  return `<div class="peek" data-decor="mascot">${mascotSVG(pose, t.mascot.px)}</div>`;
}

/** Tinted box at the foot of the card. Carries the "read this first" aside. */
function callout(slide, ctx) {
  if (!slide.callout) return '';
  const { t, accent } = ctx;
  return `<div class="callout" style="border-color:${accent}">
    <span class="callout-ico" style="color:${accent}">${icon(slide.calloutIcon || 'alert')}</span>
    <span class="callout-txt" ${fitAttr(t.type.rowTitle)}>${rich(slide.callout)}</span>
  </div>`;
}

/* Splits on a newline: line one ink, line two accent. Two lines is the shape
   the pack is built around — a single line loses the device. */
function headline(s, ctx, mul = 1) {
  if (!s.headline) return '';
  const [a, b] = String(s.headline).split('\n');
  return `<h1 class="hl" ${fitAttr(ctx.t.type.headline, mul)}>${rich(a)}${
    b ? `<span class="hl-2">${rich(b)}</span>` : ''}</h1>`;
}
const deckLine = (s, ctx) => s.deck
  ? `<p class="deck" ${fitAttr(ctx.t.type.deck)}>${rich(s.deck)}
     <span class="dline">${marks.underline(ctx.rng, 250, { color: ctx.accent, weight: 5 })}</span></p>` : '';
const para = (s, ctx) => s.body
  ? `<p class="para" ${fitAttr(ctx.t.type.body)}>${rich(s.body)}</p>` : '';

function rowList(list, ctx, numbered) {
  if (!list || !list.length) return '';
  const { t } = ctx;
  return `<ul class="rows">${list.map((r, i) => {
    const tint = t.color.chipTints[i % t.color.chipTints.length];
    const ink = t.color.chipInks[i % t.color.chipInks.length];
    const badge = numbered
      ? `<span class="chip chip-num" style="background:${tint};color:${ink}">${i + 1}</span>`
      : rowBadge(r, { iconFn: icon, tint, ink });
    const inline = t.rowStyle === 'inline';
    return `<li class="row">${badge}
      <span class="rtxt">${inline
        ? `<span class="rt rt-inline" ${fitAttr(t.type.rowTitle)}><b>${rich(r.title)}</b>${
            r.body ? ` &mdash; ${rich(r.body)}` : ''}</span>`
        : `<span class="rt" ${fitAttr(t.type.rowTitle)}>${rich(r.title)}</span>${
            r.body ? `<span class="rb" ${fitAttr(t.type.rowBody)}>${rich(r.body)}</span>` : ''}`}
      </span></li>`;
  }).join('')}</ul>`;
}

const TYPES = {
  hook: (s, ctx) => fitFrame(
    `<h1 class="hl hl-xl" ${fitAttr(ctx.t.type.headline, 1.2)}>${rich(s.headline)}</h1>${deckLine(s, ctx)}`,
    'body-hook'),
  problem: (s, ctx) => fitFrame(
    `${headline(s, ctx)}${para(s, ctx)}${rowList(s.rows, ctx, false)}${mediaCard(s, ctx.accent)}`),
  point: (s, ctx) => fitFrame(
    `${headline(s, ctx)}${deckLine(s, ctx)}${rowList(s.rows, ctx, false)}${mediaCard(s, ctx.accent)}${para(s, ctx)}`),
  steps: (s, ctx) => fitFrame(
    `${headline(s, ctx)}${para(s, ctx)}${rowList(s.steps || s.rows, ctx, true)}${mediaCard(s, ctx.accent)}`),
  stat(s, ctx) {
    const { t } = ctx;
    const cells = (s.stats || []).map((v) => `<div class="stat">
      <span class="stat-v" ${fitAttr(t.type.statValue)}>${rich(v.value)}</span>
      <span class="stat-l" ${fitAttr(t.type.statLabel)}>${rich(v.label)}</span></div>`).join('');
    const grid = cells ? `<div class="stats stats-${Math.min(2, (s.stats || []).length)}">${cells}</div>` : '';
    return fitFrame(`${headline(s, ctx)}${grid}${para(s, ctx)}`);
  },
  quote(s, ctx) {
    const { t } = ctx;
    const q = `<blockquote class="quote" ${fitAttr(t.type.quote)}>${rich(s.quote || s.headline)}</blockquote>`;
    const a = s.attribution ? `<p class="attrib" ${fitAttr(t.type.caption)}>${esc(s.attribution)}</p>` : '';
    return fitFrame(`<div class="quote-wrap">${q}${a}</div>`, 'body-quote');
  },
  cta(s, ctx) {
    const { t, rng, accent } = ctx;
    const hl = `<h1 class="hl hl-xl" ${fitAttr(t.type.headline, 1.1)}>${rich(s.headline)}</h1>`;
    const act = s.action
      ? `<p class="action" ${fitAttr(t.type.deck)}>${rich(s.action)}
           <span class="mk mk-circle">${marks.circle(rng, 420, 124, { color: accent, weight: 6 })}</span></p>` : '';
    return fitFrame(`${hl}${act}${para(s, ctx)}`, 'body-cta');
  },
};

export const SLIDE_TYPES = Object.keys(TYPES);

export function slideHTML(slide, ctx) {
  const build = TYPES[slide.type];
  if (!build) throw new Error(`Unknown slide type "${slide.type}". This theme has: ${SLIDE_TYPES.join(', ')}`);
  let inner = build(slide, ctx).replace('</main>', `${callout(slide, ctx)}</main>`);
  if (slide.mascot !== false) inner = inner.replace('class="body ', 'class="body has-peek ');
  return `${objectVisual(slide, ctx.t, ctx.deck)}<div class="card">${cardChrome(slide, ctx)}${inner}</div>
    ${mascot(slide, ctx)}
    ${ctx.deck.handle ? `<footer class="ftr"><span>${esc(ctx.deck.handle)}</span></footer>` : ''}`;
}

export function css(ctx) {
  const { t, accent, fontFaces, textureCSS } = ctx;
  const c = t.color, sp = t.space, ty = t.type, r = t.radius, cv = t.canvas;
  const inset = Math.round(cv.margin * 0.72);

  return `${fontFaces}
${baseCSS(t)}

body { background:${c.bg}; color:${c.ink}; font-family:Body, system-ui, sans-serif; }

/* The card is the frame. Everything but the mascot and the handle is inside it. */
.card { position:absolute; inset:${inset}px; background:${c.card};
  border:2px solid ${c.rule}; border-radius:${r.lg}px; z-index:20;
  box-shadow:0 26px 60px -40px rgba(28,24,19,.5); }

.chrome { position:absolute; top:${sp.md}px; left:${sp.md}px; right:${sp.md}px;
  display:flex; align-items:center; justify-content:space-between; z-index:40; }
.chrome-l { display:flex; align-items:center; gap:${sp.sm}px; }
.slidechip { font-family:BodyMid; font-weight:600; font-size:${ty.eyebrow.size}px;
  letter-spacing:.08em; text-transform:uppercase;
  background:${accent}; color:${c.accentInk};
  padding:6px 13px 5px; border-radius:${r.sm}px; }
.tabs { display:flex; align-items:flex-end; gap:5px; height:26px; }
.tab { width:26px; height:16px; border-radius:4px 4px 0 0; }
.tab-on { height:26px; }
.dots { display:flex; gap:8px; }
.dots i { width:13px; height:13px; border-radius:50%; background:${c.rule}; }

.eyebrow { position:absolute; top:${sp.md + 52}px; left:${sp.md}px;
  font-family:BodyMid; font-weight:600; font-size:${ty.eyebrow.size}px;
  letter-spacing:${ty.eyebrow.tracking}em; text-transform:uppercase;
  color:${c.inkFaint}; z-index:40; }

/* Content box is inset inside the card, not the canvas. Safe bands still
   apply because the card itself already sits well inside them. */
.body { left:${sp.lg}px; right:${sp.lg}px;
  top:${Math.round(cv.safeTop * 1.15)}px; bottom:${Math.round(cv.safeBottom * 0.5)}px;
  justify-content:flex-start; }
.fit { gap:${sp.md}px; }
.body-hook .fit, .body-cta .fit, .body-quote .fit { gap:${sp.sm}px; }

.ftr { position:absolute; left:0; right:0; bottom:${Math.round(cv.safeBottom * 0.22)}px;
  display:flex; justify-content:center; z-index:50;
  font-family:Body; font-size:${ty.footer.size}px; color:${c.inkFaint};
  letter-spacing:${ty.footer.tracking}em; }

.hl { font-family:Display; font-weight:700; font-size:${ty.headline.size}px;
  line-height:${ty.headline.leading}; letter-spacing:${ty.headline.tracking}em;
  text-wrap:balance; }
.hl-xl { font-size:${Math.round(ty.headline.size * 1.2)}px; }
.hl-2 { display:block; color:${accent}; }
.has-peek .hl, .has-peek .deck { max-width:62%; }
.dline { display:block; margin-top:-4px; line-height:0; }
.dline svg { width:min(250px, 60%); height:auto; }
.rt-inline { display:block; line-height:1.32; color:${c.inkSoft}; }
.rt-inline b { color:${c.ink}; }
.ac { font-family:DisplayBlack; font-weight:900; color:${accent}; }

.deck { font-family:Body; font-size:${ty.deck.size}px; line-height:${ty.deck.leading};
  color:${c.inkSoft}; max-width:84%; }
.para { font-family:Body; font-size:${ty.body.size}px; line-height:${ty.body.leading};
  color:${c.inkSoft}; max-width:88%; }

.rows { list-style:none; display:flex; flex-direction:column; gap:${sp.xs}px; }
.row { display:flex; gap:${sp.md}px; align-items:flex-start;
  background:${c.surface}; border-radius:${r.md}px;
  padding:${sp.sm}px ${sp.md}px; }
.chip { flex:0 0 auto; width:62px; height:62px; border-radius:50%;
  display:grid; place-items:center; }
.chip svg { width:31px; height:31px; }
.chip-num { font-family:Display; font-weight:700; font-size:25px; }
.rtxt { display:flex; flex-direction:column; gap:3px; padding-top:5px; }
.rt { font-family:BodyMid; font-weight:600; font-size:${ty.rowTitle.size}px;
  line-height:${ty.rowTitle.leading}; color:${c.ink}; }
.rb { font-family:Body; font-size:${ty.rowBody.size}px;
  line-height:${ty.rowBody.leading}; color:${c.inkSoft}; }

.stats { display:grid; gap:${sp.sm}px; }
.stats-2 { grid-template-columns:1fr 1fr; }
.stat { background:${c.surface}; border:1px solid ${c.rule}; border-radius:${r.md}px;
  padding:${sp.md}px; display:flex; flex-direction:column; gap:5px; }
.stat-v { font-family:Display; font-weight:700; font-size:${ty.statValue.size}px;
  line-height:${ty.statValue.leading}; letter-spacing:-.03em; color:${accent}; }
.stat-l { font-family:BodyMid; font-weight:600; font-size:${ty.statLabel.size}px;
  text-transform:uppercase; letter-spacing:.06em; color:${c.inkSoft}; }

.quote-wrap { border-left:5px solid ${accent}; padding-left:${sp.lg}px; }
.quote { font-family:Display; font-weight:700; font-size:${ty.quote.size}px;
  line-height:${ty.quote.leading}; text-wrap:balance; }
.attrib { font-family:BodyMid; font-weight:600; font-size:${ty.caption.size}px;
  text-transform:uppercase; letter-spacing:.12em; color:${c.inkFaint};
  margin-top:${sp.sm}px; }

.action { position:relative; display:inline-block; margin:26px 0; font-family:BodyMid; font-weight:600;
  font-size:${ty.deck.size}px; color:${c.ink}; padding:${sp.sm}px ${sp.md}px; }
.mk-circle { position:absolute; left:-26px; top:50%; transform:translateY(-50%); }

.callout { position:absolute; left:${sp.lg}px; right:${sp.lg}px;
  bottom:-${Math.round(cv.safeBottom * 0.42)}px;
  display:flex; gap:${sp.md}px; align-items:center;
  background:${c.chipTints[0]}; border:2px solid; border-radius:${r.md}px;
  padding:${sp.md}px; }
.callout-ico { flex:0 0 auto; width:54px; height:54px; border-radius:50%;
  background:${c.surface}; display:grid; place-items:center; }
.callout-ico svg { width:28px; height:28px; }
.callout-txt { font-family:BodyMid; font-weight:600;
  line-height:1.3; color:${c.ink}; }

/* Inside the card, level with the headline. Outside it the character reads as
   a sticker stuck on the page instead of part of the page. */
.peek { position:absolute; right:${Math.round(inset + 34)}px;
  top:${Math.round(inset + 92)}px; z-index:30; line-height:0; }

.term { background:#1F1B15; border-radius:${r.md}px; }
.term-bar { padding:11px ${sp.md}px; background:rgba(255,255,255,.06);
  font-family:Body; font-size:17px; color:rgba(252,248,241,.5); }
.term-bar i { background:rgba(252,248,241,.2); }
.term-body { padding:${sp.md}px; gap:6px; font-size:21px; line-height:1.44; color:#D5CCBB; }
.shot { background:${c.surface}; border:1px solid ${c.rule}; border-radius:${r.md}px; }
.shot-bar { padding:11px ${sp.md}px; background:${c.bg}; color:${c.inkFaint};
  font-family:Body; font-size:17px; }
.shot-bar i { background:${c.rule}; }

.object { right:${Math.round(cv.margin * 1.0)}px; bottom:${Math.round(cv.safeBottom * 1.1)}px; }

${textureCSS}
`;
}
