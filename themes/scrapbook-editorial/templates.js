// Slide templates for the scrapbook-editorial theme.
//
// Cream paper, a serif display headline with exactly one orange keyword, and
// a taped kraft margin note. The note is the theme's signature: it carries an
// aside in typewriter caps that the headline itself should not have to make.
//
// The scatter — note rotation and tape angle — is seeded, so a deck's marks
// are always in the same place while two decks differ.

import {
  esc, rich, fitAttr, fitFrame, mediaCard, baseCSS, objectVisual, rowBadge,
} from '../../scripts/lib/blocks.js';
import { icon } from '../../scripts/lib/icons.js';
import * as marks from '../../scripts/lib/marks.js';

function header(slide, ctx) {
  const { deck, index, total } = ctx;
  const counter = deck.showCounter === false ? ''
    : `<span class="counter">${String(index + 1).padStart(2, '0')}</span>`;
  return `<header class="hdr">
    <span class="brand">${esc(deck.brand || deck.handle || '')}</span>
    ${counter}
  </header>`;
  void slide;
}

function footer(ctx) {
  const { deck } = ctx;
  if (!deck.mantra && !deck.handle) return '';
  return `<footer class="ftr">
    <span class="mantra">${esc(deck.mantra || '')}</span>
    <span class="crown">&#9819;</span>
  </footer>`;
}

/**
 * The taped kraft note. Rotation and tape angle come from the deck seed, so
 * the same slide always lands in the same place — but two different decks do
 * not look stamped from one mould.
 */
function note(slide, ctx) {
  if (!slide.note) return '';
  const { rng, t } = ctx;
  const rot = rng.float(-3.2, 3.2).toFixed(2);
  const tape = rng.float(-12, 12).toFixed(1);
  return `<aside class="note" style="transform:rotate(${rot}deg)">
    <span class="tape" style="transform:translateX(-50%) rotate(${tape}deg)"></span>
    <span class="note-txt" ${fitAttr(t.type.note)}>${esc(slide.note)}</span>
  </aside>`;
}

/** One hand-drawn arrow, placed in a corner the content does not occupy. */
function scatter(slide, ctx) {
  if (slide.arrow === false) return '';
  const { rng, accent } = ctx;
  const dir = rng.pick(['right-down', 'right-up', 'left-down']);
  const pos = dir === 'left-down' ? 'sc-left' : 'sc-right';
  return `<span class="mk scatter ${pos}" data-decor="arrow">${marks.arrow(rng, 150, 160, { color: accent, weight: 5, dir })}</span>`;
}

/* The slide's eyebrow was silently dropped before — decks set it and nothing
   rendered it. It belongs above the headline, not in the running header,
   which already carries the brand line. */
const eyebrow = (s) => s.eyebrow ? `<span class="eyebrow">${esc(s.eyebrow)}</span>` : '';
const headline = (s, ctx) => s.headline
  ? `${eyebrow(s)}<h1 class="hl" ${fitAttr(ctx.t.type.headline)}>${rich(s.headline)}</h1>` : '';
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
  hook(s, ctx) {
    const hl = `${eyebrow(s)}<h1 class="hl hl-xl" ${fitAttr(ctx.t.type.headline, 1.14)}>${rich(s.headline)}</h1>`;
    const rule = `<span class="mk-under">${marks.underline(ctx.rng, 320, { color: ctx.accent, weight: 7 })}</span>`;
    return fitFrame(`${hl}${rule}${deckLine(s, ctx)}`, 'body-hook');
  },
  problem(s, ctx) {
    return fitFrame(`${headline(s, ctx)}${para(s, ctx)}${rowList(s.rows, ctx, false)}${mediaCard(s, ctx.accent)}`);
  },
  point(s, ctx) {
    return fitFrame(`${headline(s, ctx)}${deckLine(s, ctx)}${mediaCard(s, ctx.accent)}${para(s, ctx)}${rowList(s.rows, ctx, false)}`);
  },
  steps(s, ctx) {
    return fitFrame(`${headline(s, ctx)}${para(s, ctx)}${rowList(s.steps || s.rows, ctx, true)}${mediaCard(s, ctx.accent)}`);
  },
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
    const hl = `${eyebrow(s)}<h1 class="hl hl-xl" ${fitAttr(t.type.headline, 1.06)}>${rich(s.headline)}</h1>`;
    const act = s.action
      ? `<p class="action" ${fitAttr(t.type.deck)}>${rich(s.action)}
           <span class="mk mk-circle">${marks.circle(rng, 430, 130, { color: accent, weight: 6 })}</span></p>` : '';
    return fitFrame(`${hl}${act}${para(s, ctx)}`, 'body-cta');
  },
};

export const SLIDE_TYPES = Object.keys(TYPES);

export function slideHTML(slide, ctx) {
  const build = TYPES[slide.type];
  if (!build) throw new Error(`Unknown slide type "${slide.type}". This theme has: ${SLIDE_TYPES.join(', ')}`);
  // Quote slides stay bare — a pull quote with a margin note beside it is two
  // voices competing, which is exactly what the pacing slide is meant to avoid.
  const decor = slide.type === 'quote' ? '' : `${note(slide, ctx)}${scatter(slide, ctx)}`;
  // The note occupies the top-right corner, so a slide carrying one has to
  // give up that width in the headline. Without this the two overlap and the
  // headline is the thing that loses.
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
  font-family:BodyMid; font-size:${ty.brand.size}px; color:${c.inkFaint};
  letter-spacing:${ty.brand.tracking}em; }
.hdr { top:${Math.round(cv.safeTop * 0.38)}px;
  padding-bottom:${sp.xs}px; border-bottom:1px solid ${c.rule}; }
.ftr { bottom:${Math.round(cv.safeBottom * 0.32)}px;
  padding-top:${sp.xs}px; border-top:1px solid ${c.rule}; }
.mantra { font-family:Note; font-size:${ty.footer.size}px;
  letter-spacing:${ty.footer.tracking}em; text-transform:uppercase; }
.crown { font-size:24px; color:${c.inkFaint}; }
.counter { font-family:Note; }

.fit { gap:${sp.md}px; }
.body-hook .fit, .body-cta .fit, .body-quote .fit { gap:${sp.sm}px; }

.eyebrow { font-family:Note; font-size:${ty.eyebrow.size}px;
  letter-spacing:${ty.eyebrow.tracking}em; text-transform:uppercase;
  color:${accent}; margin-bottom:-${sp.xs}px; }
.hl { font-family:Display; font-weight:700;
  font-size:${ty.headline.size}px; line-height:${ty.headline.leading};
  letter-spacing:${ty.headline.tracking}em; color:${c.ink};
  text-wrap:balance; max-width:92%; }
.hl-xl { font-size:${Math.round(ty.headline.size * 1.14)}px; }
.has-note .hl { max-width:63%; }
.has-note .deck, .has-note .para { max-width:74%; }
.ac { color:${accent}; font-family:DisplayBlack; font-weight:900; }
.mk-under { display:block; margin-top:-${sp.sm}px; line-height:0; }

.deck { font-family:Body; font-size:${ty.deck.size}px;
  line-height:${ty.deck.leading}; color:${c.inkSoft}; max-width:80%; }
.para { font-family:Body; font-size:${ty.body.size}px;
  line-height:${ty.body.leading}; color:${c.inkSoft}; max-width:80%; }

.rows { list-style:none; display:flex; flex-direction:column; gap:0; }
.row { display:flex; gap:${sp.md}px; align-items:flex-start;
  padding:${sp.sm}px 0; border-bottom:1px solid ${c.rule}; }
.row:first-child { border-top:1px solid ${c.rule}; }
.chip { flex:0 0 auto; width:52px; height:52px; border-radius:${r.md}px;
  display:grid; place-items:center; }
.chip svg { width:27px; height:27px; }
.chip-num { font-family:Display; font-weight:700; font-size:27px; }
.rtxt { display:flex; flex-direction:column; gap:5px; padding-top:3px; }
.rt { font-family:BodyMid; font-weight:600; font-size:${ty.rowTitle.size}px;
  line-height:${ty.rowTitle.leading}; color:${c.ink}; }
.rb { font-family:Body; font-size:${ty.rowBody.size}px;
  line-height:${ty.rowBody.leading}; color:${c.inkSoft}; }

.stats { display:grid; gap:${sp.sm}px; }
.stats-2 { grid-template-columns:1fr 1fr; }
.stat { border-top:3px solid ${c.ink}; padding-top:${sp.sm}px;
  display:flex; flex-direction:column; gap:6px; }
.stat-v { font-family:Display; font-weight:700; font-size:${ty.statValue.size}px;
  line-height:${ty.statValue.leading}; letter-spacing:-.03em; color:${accent}; }
.stat-l { font-family:Note; font-size:${ty.statLabel.size}px;
  line-height:${ty.statLabel.leading}; text-transform:uppercase;
  letter-spacing:.05em; color:${c.inkSoft}; }

.quote-wrap { border-left:5px solid ${accent}; padding-left:${sp.lg}px; }
.quote { font-family:Display; font-weight:700; font-size:${ty.quote.size}px;
  line-height:${ty.quote.leading}; letter-spacing:-.018em; text-wrap:balance; }
.attrib { font-family:Note; font-size:${ty.caption.size}px; color:${c.inkFaint};
  text-transform:uppercase; letter-spacing:.1em; margin-top:${sp.sm}px; }

.action { position:relative; display:inline-block; margin:26px 0; font-family:BodyMid; font-weight:600;
  font-size:${ty.deck.size}px; color:${c.ink}; padding:${sp.sm}px ${sp.md}px; }
.mk-circle { position:absolute; left:-26px; top:50%; transform:translateY(-50%); }

/* ── the taped kraft note ────────────────────────────────────────── */
.note {
  position:absolute; right:${Math.round(cv.margin * 0.7)}px;
  top:${Math.round(cv.safeTop + 40)}px; width:288px; z-index:35;
  background:${c.kraft}; color:${c.kraftInk};
  padding:${sp.md}px ${sp.md}px ${sp.md}px;
  box-shadow:0 14px 26px -18px rgba(29,25,19,.5);
}
.note-txt { font-family:Note; font-size:${ty.note.size}px;
  line-height:${ty.note.leading}; text-transform:uppercase;
  letter-spacing:.02em; display:block; }
.tape { position:absolute; top:-16px; left:50%; width:120px; height:32px;
  background:rgba(255,252,240,.62); border-left:1px solid rgba(0,0,0,.05);
  border-right:1px solid rgba(0,0,0,.05); }

.scatter { z-index:10; opacity:.9; }
.sc-right { right:${Math.round(cv.margin * 0.4)}px; bottom:${Math.round(cv.safeBottom + 30)}px; }
.sc-left  { left:${Math.round(cv.margin * 0.4)}px;  bottom:${Math.round(cv.safeBottom + 30)}px; }

.term { background:#221D15; border-radius:${r.lg}px;
  box-shadow:0 18px 40px -26px rgba(29,25,19,.7); }
.term-bar { padding:13px ${sp.md}px; background:rgba(255,255,255,.06);
  font-family:Note; font-size:18px; color:rgba(251,248,240,.5); }
.term-bar i { background:rgba(251,248,240,.2); }
.term-body { padding:${sp.md}px; gap:7px; font-size:23px; line-height:1.44; color:#D9CFB8; }
.shot { background:${c.surface}; border:1px solid ${c.rule}; border-radius:${r.lg}px;
  box-shadow:0 18px 40px -28px rgba(29,25,19,.5); }
.shot-bar { padding:13px ${sp.md}px; background:${c.bg}; color:${c.inkFaint};
  font-family:Note; font-size:18px; }
.shot-bar i { background:${c.rule}; }

.object { right:${Math.round(cv.margin * 0.5)}px; bottom:${Math.round(cv.safeBottom * 0.75)}px; }

${textureCSS}
`;
}
