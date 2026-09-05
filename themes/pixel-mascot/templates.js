// Slide templates for the pixel-mascot theme.
//
// Each slide type is a function of (slide, ctx) returning body markup. The
// stylesheet is built once per slide from the theme tokens, so a token change
// moves every slide and there are no hard-coded pixel values below the
// token layer.
//
// Contract with the renderer's auto-fit pass:
//   .body      the clipping box — content must not exceed its height
//   .fit       an inner wrapper whose real height is measured
//   [data-fit] any element whose font-size may be stepped down, with
//              data-fit="<start px>" and data-min="<floor px>"
// Centring content vertically means overflow spills upward as well as down,
// which scrollHeight cannot see. Measuring .fit against .body is what catches
// it. Do not remove the wrapper.

import { icon } from '../../scripts/lib/icons.js';
import { mascotSVG } from '../../scripts/lib/mascot.js';
import { sceneSVG } from '../../scripts/lib/scene.js';
import * as marks from '../../scripts/lib/marks.js';
import { objectVisual, rowBadge } from '../../scripts/lib/blocks.js';

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Copy may mark emphasis with *asterisks*. That becomes the accent span —
 * the one loud element on the slide. Everything else stays ink-coloured.
 */
function rich(s = '') {
  return esc(s).replace(/\*([^*]+)\*/g, '<em class="ac">$1</em>');
}

const fitAttr = (spec) => `data-fit="${spec.size}" data-min="${spec.min || 12}"`;

// ── shared chrome ───────────────────────────────────────────────────

function header(slide, ctx) {
  const { t, index, total, deck } = ctx;
  const eyebrow = slide.eyebrow || deck.eyebrow || '';
  const num = String(index + 1).padStart(2, '0');
  if (eyebrow) {
    return `<header class="hdr">
      <span class="eyebrow"><b class="eb-n">${num}</b><span class="eb-t">${esc(eyebrow)}</span></span>
    </header>`;
  }
  const counter = deck.showCounter === false
    ? ''
    : `<span class="counter">${num} / ${String(total).padStart(2, '0')}</span>`;
  if (!counter) return '';
  return `<header class="hdr"><span></span>${counter}</header>`;
  void t;
}

function footer(ctx) {
  const { deck } = ctx;
  if (!deck.handle && !deck.footnote) return '';
  return `<footer class="ftr">
    <span>${esc(deck.handle || '')}</span>
    <span class="ftr-note">${esc(deck.footnote || '')}</span>
  </footer>`;
}

function mascot(slide, ctx) {
  const { t, rng } = ctx;
  if (slide.mascot === false) return '';
  const pose = slide.mascot || t.mascot.poseByType[slide.type] || t.mascot.defaultPose;
  // Side alternates by seed so a deck doesn't march the character down one rail.
  const side = slide.mascotSide || (rng.bool(0.65) ? 'right' : 'left');
  const flip = side === 'left';

  // With a prop, the character stops being a corner sticker and becomes a
  // scene. Scenes render a step smaller than the solo character because they
  // are roughly twice as wide.
  const art = slide.prop
    ? sceneSVG({
        pose, prop: slide.prop, dressing: slide.dressing,
        px: t.mascot.scenePx || Math.round(t.mascot.px * 0.85),
        flip, palette: t.mascotPalette,
      })
    : mascotSVG(pose, t.mascot.px, { flip, palette: t.mascotPalette });

  return `<div class="mascot mascot-${side}" data-decor="${slide.prop ? 'scene' : 'mascot'}">${art}</div>`;
}

/** A hand-drawn mark, positioned by the caller via a CSS class. */
function mark(ctx, kind, w, h, opts = {}) {
  const { rng, accent } = ctx;
  const o = { color: accent, ...opts };
  switch (kind) {
    case 'underline': return marks.underline(rng, w, o);
    case 'circle': return marks.circle(rng, w, h, o);
    case 'arrow': return marks.arrow(rng, w, h, o);
    case 'bracket': return marks.bracket(rng, w, h, o);
    case 'sparkle': return marks.sparkle(w, o);
    default: return '';
  }
}

// ── content blocks ──────────────────────────────────────────────────

function headline(slide, ctx) {
  const { t } = ctx;
  if (!slide.headline) return '';
  return `<h1 class="hl" ${fitAttr(t.type.headline)}>${rich(slide.headline)}</h1>`;
}

function deckLine(slide, ctx) {
  const { t } = ctx;
  if (!slide.deck) return '';
  return `<p class="deck" ${fitAttr(t.type.deck)}>${rich(slide.deck)}</p>`;
}

function bodyPara(slide, ctx) {
  const { t } = ctx;
  if (!slide.body) return '';
  return `<p class="para" ${fitAttr(t.type.body)}>${rich(slide.body)}</p>`;
}

/** Icon-chip rows. The workhorse block — most slides in the reference are this. */
function rows(list, ctx, { numbered = false } = {}) {
  const { t } = ctx;
  if (!list || !list.length) return '';
  const items = list.map((r, i) => {
    const tint = t.color.chipTints[i % t.color.chipTints.length];
    const ink = t.color.chipInks[i % t.color.chipInks.length];
    const badge = numbered
      ? `<span class="chip chip-num" style="background:${tint};color:${ink}">${i + 1}</span>`
      : rowBadge(r, { iconFn: icon, tint, ink });
    return `<li class="row">
      ${badge}
      <div class="row-txt">
        <span class="row-title" ${fitAttr(t.type.rowTitle)}>${rich(r.title)}</span>
        ${r.body ? `<span class="row-body" ${fitAttr(t.type.rowBody)}>${rich(r.body)}</span>` : ''}
      </div>
    </li>`;
  }).join('');
  return `<ul class="rows">${items}</ul>`;
}

/** Dark terminal card. Lines beginning with $ or / are treated as commands. */
function terminal(media, ctx) {
  const { accent } = ctx;
  const lines = (media.lines || []).map((l) => {
    const isCmd = /^\s*[$/>]/.test(l);
    return `<span class="tl${isCmd ? ' tl-cmd' : ''}" style="${isCmd ? `color:${accent}` : ''}">${esc(l)}</span>`;
  }).join('');
  return `<div class="term">
    <div class="term-bar"><i></i><i></i><i></i>${media.title ? `<span>${esc(media.title)}</span>` : ''}</div>
    <div class="term-body">${lines}</div>
  </div>`;
}

/** Browser-chrome frame around an embedded screenshot. */
function shot(media) {
  if (!media.dataURI) return '';
  return `<div class="shot">
    <div class="shot-bar"><i></i><i></i><i></i>${media.title ? `<span>${esc(media.title)}</span>` : ''}</div>
    <img src="${media.dataURI}" alt="">
  </div>`;
}

function media(slide, ctx) {
  const m = slide.media;
  if (!m) return '';
  if (m.kind === 'terminal') return terminal(m, ctx);
  if (m.kind === 'image') return shot(m);
  return '';
}

// ── slide types ─────────────────────────────────────────────────────
// Every type returns the same skeleton: header, a .body clipping box with a
// .fit wrapper inside it, mascot, footer. Only what goes in .fit differs.

function frame(slide, ctx, inner, extraClass = '') {
  return `${header(slide, ctx)}
    <main class="body ${extraClass}">
      <div class="fit">${inner}</div>
    </main>
    ${mascot(slide, ctx)}
    ${footer(ctx)}`;
}

const TYPES = {
  // Slide 1. Biggest type in the deck, no rows, mascot always present.
  hook(slide, ctx) {
    const { t } = ctx;
    const hl = `<h1 class="hl hl-xl" data-fit="${Math.round(t.type.headline.size * 1.18)}" data-min="${t.type.headline.min}">${rich(slide.headline)}</h1>`;
    const rule = `<div class="mk mk-under">${mark(ctx, 'underline', 300)}</div>`;
    return frame(slide, ctx, `${hl}${rule}${deckLine(slide, ctx)}`, 'body-hook');
  },

  // States the pain. Short, one mark, confused mascot.
  problem(slide, ctx) {
    return frame(slide, ctx,
      `${headline(slide, ctx)}${bodyPara(slide, ctx)}${rows(slide.rows, ctx)}${media(slide, ctx)}`);
  },

  // The default explainer slide.
  point(slide, ctx) {
    return frame(slide, ctx,
      `${headline(slide, ctx)}${deckLine(slide, ctx)}${media(slide, ctx)}${bodyPara(slide, ctx)}${rows(slide.rows, ctx)}`);
  },

  // Numbered procedure.
  steps(slide, ctx) {
    return frame(slide, ctx,
      `${headline(slide, ctx)}${bodyPara(slide, ctx)}${rows(slide.steps || slide.rows, ctx, { numbered: true })}${media(slide, ctx)}`);
  },

  // Numbers grid. Values are the loud element, so no accent word in the headline.
  stat(slide, ctx) {
    const { t } = ctx;
    const cells = (slide.stats || []).map((s) => `<div class="stat">
      <span class="stat-v" ${fitAttr(t.type.statValue)}>${rich(s.value)}</span>
      <span class="stat-l" ${fitAttr(t.type.statLabel)}>${rich(s.label)}</span>
    </div>`).join('');
    const grid = cells ? `<div class="stats stats-${Math.min(2, slide.stats.length)}">${cells}</div>` : '';
    return frame(slide, ctx,
      `${headline(slide, ctx)}${grid}${bodyPara(slide, ctx)}`);
  },

  // Pull quote. Bracket mark instead of an underline.
  quote(slide, ctx) {
    const { t } = ctx;
    const q = `<blockquote class="quote" ${fitAttr(t.type.quote)}>${rich(slide.quote || slide.headline)}</blockquote>`;
    const attrib = slide.attribution
      ? `<p class="attrib" ${fitAttr(t.type.caption)}>${esc(slide.attribution)}</p>` : '';
    // The bracket belongs to the quote, so it lives inside the same relatively
    // positioned wrapper. Left outside it, it floats at the top of the column.
    const br = `<span class="mk mk-bracket">${mark(ctx, 'bracket', 42, 260)}</span>`;
    return frame(slide, ctx,
      `<div class="quote-wrap">${br}${q}${attrib}</div>`, 'body-quote');
  },

  // Last slide. One instruction, one mark, celebrating mascot.
  cta(slide, ctx) {
    const { t } = ctx;
    const hl = `<h1 class="hl hl-xl" data-fit="${Math.round(t.type.headline.size * 1.1)}" data-min="${t.type.headline.min}">${rich(slide.headline)}</h1>`;
    const circ = slide.action
      ? `<p class="action" ${fitAttr(t.type.deck)}>${rich(slide.action)}
           <span class="mk mk-circle">${mark(ctx, 'circle', 420, 130)}</span></p>`
      : '';
    return frame(slide, ctx, `${hl}${circ}${bodyPara(slide, ctx)}`, 'body-cta');
  },
};

export const SLIDE_TYPES = Object.keys(TYPES);

export function slideHTML(slide, ctx) {
  const build = TYPES[slide.type];
  if (!build) {
    throw new Error(
      `Unknown slide type "${slide.type}". This theme has: ${SLIDE_TYPES.join(', ')}`,
    );
  }
  return `${build(slide, ctx)}${objectVisual(slide, ctx.t, ctx.deck)}`;
}

// ── stylesheet ──────────────────────────────────────────────────────

export function css(ctx) {
  const { t, accent, fontFaces, textureCSS } = ctx;
  const c = t.color, sp = t.space, ty = t.type, r = t.radius, cv = t.canvas;

  // Rows are hairline-ruled unless the theme asks for cards. Putting every
  // row in its own white card is the strongest "generated deck" tell there
  // is, and it competes with the image the slide should be carrying.
  const rowCSS = t.rowStyle === 'card' ? `
.rows { gap:${sp.sm}px; }
.row { background:${c.surface}; border:1px solid ${c.rule}; border-radius:${r.md}px;
  padding:${sp.md}px;
  box-shadow:0 1px 0 rgba(20,18,15,.03), 0 8px 20px -14px rgba(20,18,15,.28); }
` : `
.rows { gap:0; }
.row { padding:${sp.sm}px 0 ${sp.md}px; border-bottom:1px solid ${c.rule}; }
.row:first-child { border-top:1px solid ${c.rule}; padding-top:${sp.md}px; }
`;

  return `
${fontFaces}
* { margin:0; padding:0; box-sizing:border-box; }
html, body { width:${cv.width}px; height:${cv.height}px; }
body {
  background:${c.bg}; color:${c.ink};
  font-family:Body, system-ui, sans-serif;
  -webkit-font-smoothing:antialiased;
  position:relative; overflow:hidden;
}

/* Instagram crops 4:5 to a centre square in the profile grid. Anything in
   these bands vanishes there. Chrome may sit in them; content may not. */
.hdr, .ftr { position:absolute; left:${cv.margin}px; right:${cv.margin}px;
  display:flex; align-items:center; justify-content:space-between; z-index:40; }
.hdr { top:${Math.round(cv.safeTop * 0.42)}px; }
.ftr { bottom:${Math.round(cv.safeBottom * 0.40)}px;
  font-size:${ty.footer.size}px; color:${c.inkFaint};
  letter-spacing:${ty.footer.tracking}em; }
.ftr-note { color:${c.inkFaint}; opacity:.8; }

/* Two-part chip: number in the accent, label in a tint beside it. */
.eyebrow { display:inline-flex; align-items:stretch; border-radius:${r.sm}px;
  overflow:hidden; font-family:BodyMid; font-weight:${ty.eyebrow.weight};
  font-size:${ty.eyebrow.size}px; letter-spacing:${ty.eyebrow.tracking}em;
  text-transform:uppercase; }
.eb-n { background:${accent}; color:${c.accentInk}; padding:8px 13px 7px; }
.eb-t { background:${c.surface}; color:${c.inkSoft}; padding:8px 15px 7px;
  border:1px solid ${c.rule}; border-left:0; }
.counter { font-family:BodyMid; font-size:${ty.footer.size}px; color:${c.inkFaint};
  letter-spacing:.10em; }

/* The clipping box. Auto-fit measures .fit against this height. */
.body {
  position:absolute;
  left:${cv.margin}px; right:${cv.margin}px;
  top:${cv.safeTop}px; bottom:${cv.safeBottom}px;
  display:flex; flex-direction:column;
  z-index:30;
}
/* Content slides anchor to the top so all the slack pools at the bottom,
   which is where the character stands. Centring instead put content in the
   middle of the frame, left a dead band above it, and pushed the content down
   into the character until the collision guard deleted it. The three
   type-only slides stay centred — the growth pass fills those. */
.body { justify-content:flex-start; }
.body-hook, .body-cta, .body-quote { justify-content:center; }
.fit { display:flex; flex-direction:column; gap:${sp.md}px; }
.body-hook .fit, .body-cta .fit { gap:${sp.sm}px; }
.body-quote .fit { gap:${sp.sm}px; }

.hl {
  font-family:Display; font-weight:800;
  font-size:${ty.headline.size}px; line-height:${ty.headline.leading};
  letter-spacing:${ty.headline.tracking}em;
  text-wrap:balance;
}
.hl-xl { letter-spacing:-0.032em; }
.ac { color:${accent}; font-style:normal; }

.deck { font-family:Body; font-size:${ty.deck.size}px; line-height:${ty.deck.leading};
  color:${c.inkSoft}; max-width:82%; }
.para { font-family:Body; font-size:${ty.body.size}px; line-height:${ty.body.leading};
  color:${c.inkSoft}; max-width:82%; }

.rows { list-style:none; display:flex; flex-direction:column; }
.row { display:flex; gap:${sp.md}px; align-items:flex-start; }
${rowCSS}
.chip { flex:0 0 auto; width:58px; height:58px; border-radius:${r.sm}px;
  display:grid; place-items:center; }
.chip svg { width:30px; height:30px; }
.chip-num { font-family:Display; font-weight:800; font-size:28px; }
.row-txt { display:flex; flex-direction:column; gap:6px; padding-top:4px; }
.row-title { font-family:BodyMid; font-weight:600;
  font-size:${ty.rowTitle.size}px; line-height:${ty.rowTitle.leading}; color:${c.ink}; }
.row-body { font-family:Body; font-size:${ty.rowBody.size}px;
  line-height:${ty.rowBody.leading}; color:${c.inkSoft}; }

.stats { display:grid; gap:${sp.sm}px; }
.stats-2 { grid-template-columns:1fr 1fr; }
.stat { background:${c.surface}; border:1px solid ${c.rule}; border-radius:${r.md}px;
  padding:${sp.md}px ${sp.md}px ${sp.md}px; display:flex; flex-direction:column; gap:6px; }
.stat-v { font-family:Display; font-weight:800; font-size:${ty.statValue.size}px;
  line-height:${ty.statValue.leading}; letter-spacing:-0.03em; color:${accent}; }
.stat-l { font-family:BodyMid; font-weight:600; font-size:${ty.statLabel.size}px;
  line-height:${ty.statLabel.leading}; color:${c.inkSoft}; }

.quote-wrap { position:relative; padding-left:0; }
.quote { font-family:Display; font-weight:800; font-size:${ty.quote.size}px;
  line-height:${ty.quote.leading}; letter-spacing:-0.022em; text-wrap:balance;
  padding-left:${sp.lg}px; }
.attrib { font-family:BodyMid; font-weight:600; font-size:${ty.caption.size}px;
  color:${c.inkFaint}; padding-left:${sp.lg}px; letter-spacing:.04em;
  text-transform:uppercase; }

.action { position:relative; display:inline-block; margin:26px 0; font-family:BodyMid; font-weight:600;
  font-size:${ty.deck.size}px; color:${c.ink}; padding:${sp.sm}px ${sp.md}px; }

/* Marks sit behind text and never take layout space. */
.mk { position:absolute; pointer-events:none; z-index:-1; line-height:0; }
.mk-under { position:relative; z-index:1; margin-top:-${sp.xs}px; }
.mk-circle { position:absolute; left:-28px; top:50%; transform:translateY(-50%); }
.mk-bracket { position:absolute; left:-4px; top:50%; transform:translateY(-50%); }

.term { background:#141210; border-radius:${r.md}px; overflow:hidden;
  box-shadow:0 20px 44px -26px rgba(20,18,15,.65); }
.term-bar, .shot-bar { display:flex; align-items:center; gap:8px;
  padding:14px ${sp.md}px; background:rgba(255,255,255,.06);
  font-family:BodyMid; font-size:20px; color:rgba(255,255,255,.55); }
.term-bar i, .shot-bar i { width:12px; height:12px; border-radius:50%;
  background:rgba(255,255,255,.22); }
.term-body { padding:${sp.md}px; display:flex; flex-direction:column; gap:8px;
  font-family:ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size:24px; line-height:1.42; color:#D6D0C8; }

.shot { background:${c.surface}; border:1px solid ${c.rule}; border-radius:${r.md}px;
  overflow:hidden; box-shadow:0 20px 44px -28px rgba(20,18,15,.45); }
.shot-bar { background:#F0EDE7; color:${c.inkFaint}; }
.shot-bar i { background:#D6D0C6; }
.shot img { display:block; width:100%; }

/* Mascot is decoration: it sits under the text layer and outside the safe box. */
.mascot { position:absolute; bottom:${Math.round(cv.safeBottom * 0.72)}px; z-index:20; line-height:0; }
.mascot-right { right:${Math.round(cv.margin * 0.55)}px; }
.mascot-left  { left:${Math.round(cv.margin * 0.55)}px; }

.object { right:${Math.round(cv.margin * 0.55)}px; bottom:${Math.round(cv.safeBottom * 0.66)}px; }

${textureCSS}
`;
}
