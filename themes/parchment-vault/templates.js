// Slide templates for the parchment-vault theme.
//
// Kraft parchment, a two-line serif headline where the second line carries
// the accent, a purple chevron badge, and a torn margin note. Screenshots go
// in a purple-chromed window so product shots read as part of the system
// rather than pasted on top of it.
//
// The reference deck used licensed cartoon cut-outs. Those are not shippable
// on a brand account, so this pack uses the shared pixel mascot recoloured to
// the theme's purple — see `mascotPalette` in theme.json.

import {
  esc, rich, fitAttr, fitFrame, mediaCard, baseCSS, objectVisual, rowBadge,
} from '../../scripts/lib/blocks.js';
import { icon } from '../../scripts/lib/icons.js';
import { mascotSVG } from '../../scripts/lib/mascot.js';
import { sceneSVG } from '../../scripts/lib/scene.js';
import * as marks from '../../scripts/lib/marks.js';

function header(slide, ctx) {
  const { deck, index, total } = ctx;
  const counter = deck.showCounter === false ? ''
    : `<span class="counter">${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span>`;
  return `<header class="hdr">
    <span class="hdr-l">${counter}<span class="brand">${esc(deck.brand || '')}</span></span>
    <span class="tagline">${esc(deck.tagline || '')}</span>
  </header>`;
  void slide;
}

const footer = (ctx) => ctx.deck.handle
  ? `<footer class="ftr"><span>${esc(ctx.deck.handle)}</span>
     <span>${esc(ctx.deck.footnote || '')}</span></footer>` : '';

/** Chevron badge. Marks the start of the headline the way a section mark does. */
const chevron = `<span class="chev" aria-hidden="true">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
       stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></span>`;

function mascot(slide, ctx) {
  if (slide.mascot === false) return '';
  const { t } = ctx;
  const pose = slide.mascot || t.mascot.poseByType[slide.type] || t.mascot.defaultPose;
  // Props render in their own palette, never the theme's character override —
  // recolouring the mascot is the point, recolouring a houseplant is a bug.
  const art = slide.prop
    ? sceneSVG({
        pose, prop: slide.prop, dressing: slide.dressing,
        px: t.mascot.scenePx || Math.round(t.mascot.px * 0.85),
        palette: t.mascotPalette,
      })
    : mascotSVG(pose, t.mascot.px, { palette: t.mascotPalette });
  return `<div class="figure" data-decor="${slide.prop ? 'scene' : 'mascot'}">${art}</div>`;
}

/**
 * Torn margin note. The ragged edge is a clip-path whose points come from the
 * deck seed, so every note tears differently but the same deck tears the same
 * way on every render.
 */
function note(slide, ctx) {
  if (!slide.note) return '';
  const { rng, t } = ctx;
  const steps = 14;
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    pts.push(`${(i / steps * 100).toFixed(1)}% ${rng.float(0, 4.5).toFixed(1)}%`);
  }
  pts.push('100% 100%', '0% 100%');
  const rot = rng.float(-2.6, 2.6).toFixed(2);
  return `<aside class="note" data-decor="note"
      style="transform:rotate(${rot}deg); clip-path:polygon(${pts.join(',')})">
    <span class="note-txt" ${fitAttr(t.type.note)}>${esc(slide.note)}</span>
  </aside>`;
}

/** Headline splits on a newline: line one in ink, line two in the accent. */
function headline(s, ctx) {
  if (!s.headline) return '';
  const { t } = ctx;
  const [a, b] = String(s.headline).split('\n');
  const second = b ? `<span class="hl-2">${rich(b)}</span>` : '';
  return `<h1 class="hl" ${fitAttr(t.type.headline)}>${chevron}${rich(a)}${second}</h1>`;
}

const deckLine = (s, ctx) => s.deck
  ? `<p class="deck" ${fitAttr(ctx.t.type.deck)}>${rich(s.deck)}</p>` : '';
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
    return `<li class="row">${badge}
      <span class="rtxt">
        <span class="rt" ${fitAttr(t.type.rowTitle)}>${rich(r.title)}</span>
        ${r.body ? `<span class="rb" ${fitAttr(t.type.rowBody)}>${rich(r.body)}</span>` : ''}
      </span></li>`;
  }).join('')}</ul>`;
}

const TYPES = {
  hook: (s, ctx) => fitFrame(`${headline(s, ctx)}${deckLine(s, ctx)}`, 'body-hook'),
  problem: (s, ctx) => fitFrame(
    `${headline(s, ctx)}${para(s, ctx)}${rowList(s.rows, ctx, false)}${mediaCard(s, ctx.accent)}`),
  point: (s, ctx) => fitFrame(
    `${headline(s, ctx)}${deckLine(s, ctx)}${mediaCard(s, ctx.accent)}${rowList(s.rows, ctx, false)}${para(s, ctx)}`),
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
    const act = s.action
      ? `<p class="action" ${fitAttr(t.type.deck)}>${rich(s.action)}
           <span class="mk mk-circle">${marks.circle(rng, 420, 124, { color: accent, weight: 6 })}</span></p>` : '';
    return fitFrame(`${headline(s, ctx)}${act}${para(s, ctx)}`, 'body-cta');
  },
};

export const SLIDE_TYPES = Object.keys(TYPES);

export function slideHTML(slide, ctx) {
  const build = TYPES[slide.type];
  if (!build) throw new Error(`Unknown slide type "${slide.type}". This theme has: ${SLIDE_TYPES.join(', ')}`);
  const decor = slide.type === 'quote' ? '' : `${note(slide, ctx)}${mascot(slide, ctx)}`;
  const body = slide.note && slide.type !== 'quote'
    ? build(slide, ctx).replace('class="body ', 'class="body has-note ')
    : build(slide, ctx);
  return `${header(slide, ctx)}${body}${decor}${objectVisual(slide, ctx.t, ctx.deck)}${footer(ctx)}`;
}

export function css(ctx) {
  const { t, accent, fontFaces, textureCSS } = ctx;
  const c = t.color, sp = t.space, ty = t.type, r = t.radius, cv = t.canvas;

  return `${fontFaces}
${baseCSS(t)}

body { background:${c.bg}; color:${c.ink}; font-family:Body, system-ui, sans-serif; }

.hdr, .ftr { position:absolute; left:${cv.margin}px; right:${cv.margin}px;
  display:flex; align-items:center; justify-content:space-between; z-index:40;
  font-family:BodyMid; font-weight:600; font-size:${ty.brand.size}px;
  letter-spacing:${ty.brand.tracking}em; text-transform:uppercase; color:${c.inkFaint}; }
.hdr { top:${Math.round(cv.safeTop * 0.36)}px;
  padding-bottom:${sp.xs}px; border-bottom:1px solid ${c.rule}; }
.ftr { bottom:${Math.round(cv.safeBottom * 0.30)}px;
  font-family:Body; font-weight:400; text-transform:none;
  font-size:${ty.footer.size}px; letter-spacing:${ty.footer.tracking}em; }
.hdr-l { display:flex; align-items:center; gap:${sp.sm}px; }
.counter { background:${accent}; color:${c.accentInk};
  padding:5px 11px 4px; border-radius:${r.sm}px; letter-spacing:.1em; }

/* Content slides anchor to the top so all the slack pools at the bottom,
   which is where the character stands. Centring instead put content in the
   middle of the frame, left a dead band above it, and pushed the content down
   into the character until the collision guard deleted it. The three
   type-only slides stay centred — the growth pass fills those. */
.body { justify-content:flex-start; }
.body-hook, .body-cta, .body-quote { justify-content:center; }
.fit { gap:${sp.md}px; }
.body-hook .fit, .body-cta .fit, .body-quote .fit { gap:${sp.sm}px; }

.hl { font-family:Display; font-weight:700; font-size:${ty.headline.size}px;
  line-height:${ty.headline.leading}; letter-spacing:${ty.headline.tracking}em;
  text-wrap:balance; position:relative; padding-left:${sp.lg}px; }
.hl-2 { display:block; font-family:DisplayItalic; font-style:italic; color:${accent}; }
.ac { color:${accent}; }
.chev { position:absolute; left:-4px; top:.16em; width:34px; height:34px;
  background:${accent}; color:${c.accentInk}; border-radius:50%;
  display:grid; place-items:center; }
.chev svg { width:19px; height:19px; }

.deck { font-family:Body; font-size:${ty.deck.size}px; line-height:${ty.deck.leading};
  color:${c.inkSoft}; max-width:80%; padding-left:${sp.lg}px; }
.para { font-family:Body; font-size:${ty.body.size}px; line-height:${ty.body.leading};
  color:${c.inkSoft}; max-width:84%; }
.has-note .hl { max-width:66%; }
.has-note .deck, .has-note .para { max-width:72%; }

.rows { list-style:none; display:flex; flex-direction:column; }
.row { display:flex; gap:${sp.md}px; align-items:flex-start;
  padding:${sp.sm}px 0 ${sp.md}px; border-bottom:1px solid ${c.rule}; }
.row:first-child { border-top:1px solid ${c.rule}; padding-top:${sp.md}px; }
.chip { flex:0 0 auto; width:48px; height:48px; border-radius:${r.sm}px;
  display:grid; place-items:center; }
.chip svg { width:25px; height:25px; }
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
.quote { font-family:DisplayItalic; font-style:italic; font-weight:700;
  font-size:${ty.quote.size}px; line-height:${ty.quote.leading}; text-wrap:balance; }
.attrib { font-family:BodyMid; font-weight:600; font-size:${ty.caption.size}px;
  text-transform:uppercase; letter-spacing:.12em; color:${c.inkFaint}; margin-top:${sp.sm}px; }

.action { position:relative; display:inline-block; margin:26px 0; font-family:BodyMid; font-weight:600;
  font-size:${ty.deck.size}px; color:${c.ink}; padding:${sp.sm}px ${sp.md}px;
  margin-left:${sp.lg}px; }
.mk-circle { position:absolute; left:-26px; top:50%; transform:translateY(-50%); }

/* Torn margin note. The ragged top edge is a seeded clip-path. */
.note { position:absolute; right:${Math.round(cv.margin * 0.6)}px;
  top:${Math.round(cv.safeTop + 30)}px; width:270px; z-index:35;
  background:${c.note}; color:${c.inkSoft};
  padding:${sp.lg}px ${sp.md}px ${sp.md}px;
  box-shadow:0 16px 30px -22px rgba(30,26,19,.55); }
.note-txt { font-family:Note; font-size:${ty.note.size}px;
  line-height:${ty.note.leading}; display:block; }

.figure { position:absolute; right:${Math.round(cv.margin * 0.45)}px;
  bottom:${Math.round(cv.safeBottom * 0.68)}px; z-index:20; line-height:0; }

/* Purple window chrome, so a product shot reads as part of the system. */
.term { background:#1B1526; border-radius:${r.md}px;
  box-shadow:0 22px 44px -30px rgba(30,26,19,.7); }
.term-bar { padding:12px ${sp.md}px; background:${accent};
  font-family:Body; font-size:17px; color:${c.accentInk}; }
.term-bar i { background:rgba(246,239,221,.45); }
.term-body { padding:${sp.md}px; gap:6px; font-size:21px; line-height:1.44; color:#D6CDBB; }
.shot { background:${c.surface}; border:2px solid ${accent}; border-radius:${r.md}px;
  box-shadow:0 22px 44px -32px rgba(30,26,19,.5); }
.shot-bar { padding:12px ${sp.md}px; background:${accent}; color:${c.accentInk};
  font-family:Body; font-size:17px; }
.shot-bar i { background:rgba(246,239,221,.45); }

.object { right:${Math.round(cv.margin * 0.55)}px; bottom:${Math.round(cv.safeBottom * 0.66)}px; }

${textureCSS}
`;
}
