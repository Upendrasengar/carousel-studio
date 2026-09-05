// Slide templates for the spotlight-minimal theme.
//
// The quietest of the packs. A coloured beam falls from above, a small pixel
// creature stands in it, and a centred Didone headline sits underneath. There
// is deliberately almost nothing else: this theme's whole argument is that one
// image, one line and one paragraph is enough.
//
// The creature is the shared mascot recoloured to the beam. That is what the
// palette override on mascotSVG exists for — one character, six themes.

import {
  esc, rich, fitAttr, fitFrame, mediaCard, baseCSS, objectVisual,
} from '../../scripts/lib/blocks.js';
import { mascotSVG } from '../../scripts/lib/mascot.js';
import { sceneSVG } from '../../scripts/lib/scene.js';
import * as marks from '../../scripts/lib/marks.js';

/** Beam colour rotates through the palette, keyed off slide index so a deck
 *  reads as a set rather than five unrelated posters. */
function beamOf(ctx, slide) {
  const list = ctx.t.beams;
  if (slide.beam) {
    const found = list.find((b) => b.name === slide.beam);
    if (!found) throw new Error(`Unknown beam "${slide.beam}". Have: ${list.map((b) => b.name).join(', ')}`);
    return found;
  }
  return list[ctx.index % list.length];
}

/**
 * The beam plus the creature standing in it. The creature is recoloured to
 * the beam so the two read as one object; the eyes stay near-black in every
 * palette or the character stops reading as itself.
 */
function spotlight(slide, ctx, beam) {
  if (slide.spotlight === false) return '';
  const { t } = ctx;
  const pose = slide.mascot || t.mascot.poseByType[slide.type] || t.mascot.defaultPose;
  const tint = { O: beam.body, L: beam.light, D: beam.body };
  const sprite = slide.prop
    ? sceneSVG({
        pose, prop: slide.prop, dressing: slide.dressing,
        px: t.mascot.scenePx || Math.round(t.mascot.px * 0.85), palette: tint,
      })
    : mascotSVG(pose, t.mascot.px, { palette: tint });
  return `<div class="spot">
    <div class="beam" style="--beam:${beam.light}"></div>
    <div class="creature">${sprite}</div>
  </div>`;
}

function header(slide, ctx) {
  const { deck, index, total } = ctx;
  const counter = deck.showCounter === false ? ''
    : `<span class="counter">${String(index + 1).padStart(2, '0')} &mdash; ${String(total).padStart(2, '0')}</span>`;
  const eyebrow = slide.eyebrow ? `<span class="eyebrow">${esc(slide.eyebrow)}</span>` : '';
  return `<header class="hdr">${eyebrow}${counter}</header>`;
}

const footer = (ctx) => ctx.deck.handle
  ? `<footer class="ftr"><span>${esc(ctx.deck.handle)}</span></footer>` : '';

const diamond = '<span class="dia">&#9670;</span>';

const headline = (s, ctx) => s.headline
  ? `<h1 class="hl" ${fitAttr(ctx.t.type.headline)}>${rich(s.headline)}</h1>` : '';
const para = (s, ctx) => s.body
  ? `<p class="para" ${fitAttr(ctx.t.type.body)}>${rich(s.body)}</p>` : '';
const deckLine = (s, ctx) => s.deck
  ? `<p class="deck" ${fitAttr(ctx.t.type.deck)}>${rich(s.deck)}</p>` : '';

/** Rows here are plain lines with a rule between them. No chips, no cards —
 *  a card would be the loudest thing on a slide this quiet. */
function rowList(list, ctx, numbered) {
  if (!list || !list.length) return '';
  const { t } = ctx;
  return `<ul class="rows">${list.map((r, i) => `<li class="row">
    ${numbered ? `<span class="rnum">${i + 1}</span>` : ''}
    <span class="rtxt">
      <span class="rt" ${fitAttr(t.type.rowTitle)}>${rich(r.title)}</span>
      ${r.body ? `<span class="rb" ${fitAttr(t.type.rowBody)}>${rich(r.body)}</span>` : ''}
    </span></li>`).join('')}</ul>`;
}

const TYPES = {
  hook: (s, ctx) => fitFrame(
    `<h1 class="hl hl-xl" ${fitAttr(ctx.t.type.headline, 1.16)}>${rich(s.headline)}</h1>${diamond}${deckLine(s, ctx)}`,
    'body-centre'),
  problem: (s, ctx) => fitFrame(
    `${headline(s, ctx)}${diamond}${para(s, ctx)}${rowList(s.rows, ctx, false)}`, 'body-centre'),
  point: (s, ctx) => fitFrame(
    `${headline(s, ctx)}${mediaCard(s, ctx.accent)}${para(s, ctx)}${rowList(s.rows, ctx, false)}`, 'body-centre'),
  steps: (s, ctx) => fitFrame(
    `${headline(s, ctx)}${rowList(s.steps || s.rows, ctx, true)}${mediaCard(s, ctx.accent)}`, 'body-centre'),
  stat(s, ctx) {
    const { t } = ctx;
    const cells = (s.stats || []).map((v) => `<div class="stat">
      <span class="stat-v" ${fitAttr(t.type.statValue)}>${rich(v.value)}</span>
      <span class="stat-l" ${fitAttr(t.type.statLabel)}>${rich(v.label)}</span></div>`).join('');
    return fitFrame(`${headline(s, ctx)}<div class="stats">${cells}</div>${para(s, ctx)}`, 'body-centre');
  },
  quote(s, ctx) {
    const { t } = ctx;
    const q = `<blockquote class="quote" ${fitAttr(t.type.quote)}>${rich(s.quote || s.headline)}</blockquote>`;
    const a = s.attribution ? `<p class="attrib" ${fitAttr(t.type.caption)}>${esc(s.attribution)}</p>` : '';
    return fitFrame(`${q}${diamond}${a}`, 'body-centre');
  },
  cta(s, ctx) {
    const { t, rng, accent } = ctx;
    const hl = `<h1 class="hl hl-xl" ${fitAttr(t.type.headline, 1.1)}>${rich(s.headline)}</h1>`;
    const act = s.action
      ? `<p class="action" ${fitAttr(t.type.deck)}>${rich(s.action)}
           <span class="mk mk-circle">${marks.circle(rng, 400, 118, { color: accent, weight: 5 })}</span></p>` : '';
    return fitFrame(`${hl}${act}${para(s, ctx)}`, 'body-centre');
  },
};

export const SLIDE_TYPES = Object.keys(TYPES);

export function slideHTML(slide, ctx) {
  const build = TYPES[slide.type];
  if (!build) throw new Error(`Unknown slide type "${slide.type}". This theme has: ${SLIDE_TYPES.join(', ')}`);
  const beam = beamOf(ctx, slide);
  return `${objectVisual(slide, ctx.t, ctx.deck)}${spotlight(slide, ctx, beam)}${header(slide, ctx)}${build(slide, ctx)}${footer(ctx)}`;
}

export function css(ctx) {
  const { t, accent, fontFaces, textureCSS } = ctx;
  const c = t.color, sp = t.space, ty = t.type, r = t.radius, cv = t.canvas;

  return `${fontFaces}
${baseCSS(t)}

body { background:${c.bg}; color:${c.ink}; font-family:Body, system-ui, sans-serif; }

/* The spotlight sits above the content box, in the upper third, and the
   content column is pushed below it — so the two never negotiate for space. */
.spot { position:absolute; top:0; left:0; right:0; height:${Math.round(cv.height * 0.34)}px;
  z-index:5; display:flex; align-items:flex-end; justify-content:center; }
.beam { position:absolute; top:-8%; left:50%; transform:translateX(-50%);
  width:${Math.round(cv.width * 0.62)}px; height:112%;
  background:linear-gradient(to bottom, var(--beam) 0%, transparent 88%);
  opacity:.60; filter:blur(26px);
  -webkit-mask-image:linear-gradient(to bottom, #000 0%, transparent 96%);
          mask-image:linear-gradient(to bottom, #000 0%, transparent 96%);
  clip-path:polygon(34% 0%, 66% 0%, 88% 100%, 12% 100%); }
.creature { position:relative; z-index:2; line-height:0; padding-bottom:${sp.md}px; }

.hdr, .ftr { position:absolute; left:${cv.margin}px; right:${cv.margin}px;
  display:flex; align-items:center; z-index:40; }
.hdr { top:${Math.round(cv.safeTop * 0.34)}px; justify-content:space-between; }
.ftr { bottom:${Math.round(cv.safeBottom * 0.36)}px; justify-content:center;
  font-family:Body; font-size:${ty.footer.size}px; color:${c.inkFaint};
  letter-spacing:${ty.footer.tracking}em; }

.eyebrow { font-family:BodyMid; font-weight:600; font-size:${ty.eyebrow.size}px;
  letter-spacing:${ty.eyebrow.tracking}em; text-transform:uppercase; color:${c.inkFaint}; }
.counter { font-family:BodyMid; font-size:${ty.eyebrow.size}px;
  letter-spacing:.14em; color:${c.inkFaint}; }

/* Content lives in the lower two-thirds, under the beam. */
.body { top:${Math.round(cv.height * 0.36)}px; }
.body-centre .fit { align-items:center; text-align:center; gap:${sp.md}px; }

.hl { font-family:Display; font-weight:500; font-size:${ty.headline.size}px;
  line-height:${ty.headline.leading}; letter-spacing:${ty.headline.tracking}em;
  text-wrap:balance; max-width:94%; }
.hl-xl { font-size:${Math.round(ty.headline.size * 1.16)}px; }
.ac { font-family:DisplayBold; font-weight:700; color:${accent}; }

.dia { color:${c.rule}; font-size:15px; letter-spacing:.6em; }

.deck { font-family:Body; font-size:${ty.deck.size}px; line-height:${ty.deck.leading};
  color:${c.inkSoft}; max-width:76%; }
.para { font-family:Body; font-size:${ty.body.size}px; line-height:${ty.body.leading};
  color:${c.inkSoft}; max-width:78%; text-align:left; }

.rows { list-style:none; display:flex; flex-direction:column; gap:0;
  width:82%; text-align:left; }
.row { display:flex; gap:${sp.md}px; align-items:baseline;
  padding:${sp.sm}px 0; border-bottom:1px solid ${c.rule}; }
.row:first-child { border-top:1px solid ${c.rule}; }
.rnum { font-family:Display; font-weight:500; color:${accent}; font-size:26px; min-width:30px; }
.rtxt { display:flex; flex-direction:column; gap:4px; }
.rt { font-family:BodyMid; font-weight:600; font-size:${ty.rowTitle.size}px;
  line-height:${ty.rowTitle.leading}; color:${c.ink}; }
.rb { font-family:Body; font-size:${ty.rowBody.size}px;
  line-height:${ty.rowBody.leading}; color:${c.inkSoft}; }

.stats { display:flex; gap:${sp.xl}px; justify-content:center; }
.stat { display:flex; flex-direction:column; gap:6px; align-items:center; }
.stat-v { font-family:Display; font-weight:700; font-size:${ty.statValue.size}px;
  line-height:${ty.statValue.leading}; color:${c.ink}; }
.stat-l { font-family:BodyMid; font-weight:600; font-size:${ty.statLabel.size}px;
  text-transform:uppercase; letter-spacing:.08em; color:${c.inkFaint}; }

.quote { font-family:Display; font-weight:500; font-size:${ty.quote.size}px;
  line-height:${ty.quote.leading}; text-wrap:balance; max-width:92%; }
.attrib { font-family:BodyMid; font-weight:600; font-size:${ty.caption.size}px;
  text-transform:uppercase; letter-spacing:.14em; color:${c.inkFaint}; }

.action { position:relative; display:inline-block; margin:26px 0; font-family:BodyMid; font-weight:600;
  font-size:${ty.deck.size}px; color:${c.ink}; padding:${sp.sm}px ${sp.md}px; }
.mk-circle { position:absolute; left:-24px; top:50%; transform:translateY(-50%); }

.term { background:#1E1A14; border-radius:${r.md}px; width:88%;
  box-shadow:0 24px 50px -32px rgba(26,23,18,.7); }
.term-bar { padding:12px ${sp.md}px; background:rgba(255,255,255,.06);
  font-family:Body; font-size:17px; color:rgba(251,249,244,.5); }
.term-bar i { background:rgba(251,249,244,.2); }
.term-body { padding:${sp.md}px; gap:7px; font-size:21px; line-height:1.45;
  color:#D6CFC0; text-align:left; }
.shot { background:${c.surface}; border:1px solid ${c.rule}; border-radius:${r.md}px;
  width:88%; box-shadow:0 24px 50px -34px rgba(26,23,18,.5); }
.shot-bar { padding:12px ${sp.md}px; background:${c.bg}; color:${c.inkFaint};
  font-family:Body; font-size:17px; }
.shot-bar i { background:${c.rule}; }

.object { left:50%; transform:translateX(-50%); top:${Math.round(cv.height * 0.09)}px; }

${textureCSS}
`;
}
