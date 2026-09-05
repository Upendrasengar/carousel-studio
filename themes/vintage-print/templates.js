// Slide templates for the vintage-print theme.
//
// An aged-paper broadside: condensed slab caps, sepia grain, a corner
// sunburst. The distinguishing feature is not the styling — it is the
// `reveal` slide type, which repeats one diagram across several slides with a
// different step lit each time. That mechanic costs one template and reads as
// far more design work than it is. It is portable to any theme.

import {
  esc, rich, fitAttr, fitFrame, mediaCard, baseCSS, objectVisual,
} from '../../scripts/lib/blocks.js';
import * as marks from '../../scripts/lib/marks.js';

// ── chrome ──────────────────────────────────────────────────────────

function header(slide, ctx) {
  const { deck, index, total } = ctx;
  const brand = deck.brand || '';
  const counter = deck.showCounter === false ? ''
    : `<span class="counter">${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span>`;
  const eyebrow = slide.eyebrow ? `<span class="eyebrow">${esc(slide.eyebrow)}</span>` : '';
  if (!brand && !eyebrow && !counter) return '';
  return `<header class="hdr">
    <span class="brand">${esc(brand)}</span>
    <span class="hdr-right">${eyebrow}${counter}</span>
  </header>`;
}

/** The chip strip. In the reference it names the outputs the process makes. */
function footer(ctx) {
  const { deck, t } = ctx;
  const chips = (deck.chips || []).map((c, i) => {
    const tint = t.color.chipTints[i % t.color.chipTints.length];
    const ink = t.color.chipInks[i % t.color.chipInks.length];
    return `<span class="fchip" style="background:${tint};color:${ink}">${esc(c)}</span>`;
  }).join('');
  if (!chips && !deck.handle) return '';
  return `<footer class="ftr">
    <span class="handle">${esc(deck.handle || '')}</span>
    <span class="chips">${chips}</span>
  </footer>`;
}

/** Radiating rays in one corner. Pure CSS, seeded rotation so decks differ. */
function sunburst(ctx) {
  return `<div class="burst" style="transform:rotate(${ctx.rng.int(-18, 18)}deg)"></div>`;
}

const headline = (s, ctx) => s.headline
  ? `<h1 class="hl" ${fitAttr(ctx.t.type.headline)}>${rich(s.headline)}</h1>` : '';
const deckLine = (s, ctx) => s.deck
  ? `<p class="deck" ${fitAttr(ctx.t.type.deck)}>${rich(s.deck)}</p>` : '';
const para = (s, ctx) => s.body
  ? `<p class="para" ${fitAttr(ctx.t.type.body)}>${rich(s.body)}</p>` : '';

function rowList(list, ctx, numbered) {
  if (!list || !list.length) return '';
  const { t } = ctx;
  return `<ul class="rows">${list.map((r, i) => `
    <li class="row">
      <span class="rnum">${numbered ? i + 1 : '•'}</span>
      <span class="rtxt">
        <span class="rt" ${fitAttr(t.type.rowTitle)}>${rich(r.title)}</span>
        ${r.body ? `<span class="rb" ${fitAttr(t.type.rowBody)}>${rich(r.body)}</span>` : ''}
      </span>
    </li>`).join('')}</ul>`;
}

// ── the reveal mechanic ─────────────────────────────────────────────
//
// The step list lives once at deck level under `reveal.steps`. A `reveal`
// slide names which step is active via `step` (1-based). Every slide renders
// the whole list; the inactive steps drop to a low opacity and the active one
// gets a rule, a filled badge and full contrast.
//
// The reader sees the same diagram advancing rather than N unrelated slides,
// which is why it reads as designed. It also means the copy is written once.

function revealList(slide, ctx) {
  const { deck, t } = ctx;
  const steps = deck.reveal?.steps || [];
  if (!steps.length) {
    throw new Error('A "reveal" slide needs deck.reveal.steps — the shared step list.');
  }
  const active = Number(slide.step || 0);
  if (active < 1 || active > steps.length) {
    throw new Error(`Reveal slide points at step ${active}, but deck.reveal.steps has ${steps.length}.`);
  }
  const items = steps.map((s, i) => {
    const on = i + 1 === active;
    return `<li class="rv ${on ? 'rv-on' : 'rv-off'}">
      <span class="rv-num">${i + 1}</span>
      <span class="rv-txt">
        <span class="rv-t" ${fitAttr(t.type.rowTitle)}>${rich(s.title)}</span>
        ${s.body ? `<span class="rv-b" ${fitAttr(t.type.rowBody)}>${rich(s.body)}</span>` : ''}
      </span>
    </li>`;
  }).join('');
  const loop = deck.reveal.loopLabel
    ? `<span class="rv-loop">${esc(deck.reveal.loopLabel)}</span>` : '';
  return `<div class="rv-wrap">${loop}<ol class="rv-list">${items}</ol></div>`;
}

// ── slide types ─────────────────────────────────────────────────────

const TYPES = {
  hook(s, ctx) {
    const hl = `<h1 class="hl hl-xl" ${fitAttr(ctx.t.type.headline, 1.18)}>${rich(s.headline)}</h1>`;
    return fitFrame(`${hl}${deckLine(s, ctx)}`, 'body-hook');
  },

  // The star. Identical layout every time, one step lit.
  reveal(s, ctx) {
    const text = s.headline || ctx.deck.reveal?.title;
    const title = text
      ? `<h1 class="hl hl-sm" ${fitAttr(ctx.t.type.headline, 0.62)}>${rich(text)}</h1>` : '';
    const sub = ctx.deck.reveal?.subtitle
      ? `<p class="rv-sub" ${fitAttr(ctx.t.type.deck, 0.85)}>${rich(ctx.deck.reveal.subtitle)}</p>` : '';
    return fitFrame(`${title}${sub}${revealList(s, ctx)}`, 'body-reveal');
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
      <span class="stat-l" ${fitAttr(t.type.statLabel)}>${rich(v.label)}</span>
    </div>`).join('');
    const grid = cells ? `<div class="stats stats-${Math.min(2, (s.stats || []).length)}">${cells}</div>` : '';
    return fitFrame(`${headline(s, ctx)}${grid}${para(s, ctx)}`);
  },

  quote(s, ctx) {
    const { t, rng, accent } = ctx;
    const q = `<blockquote class="quote" ${fitAttr(t.type.quote)}>${rich(s.quote || s.headline)}</blockquote>`;
    const a = s.attribution ? `<p class="attrib" ${fitAttr(t.type.caption)}>${esc(s.attribution)}</p>` : '';
    const br = `<span class="mk mk-bracket">${marks.bracket(rng, 40, 250, { color: accent, weight: 6 })}</span>`;
    return fitFrame(`<div class="quote-wrap">${br}${q}${a}</div>`, 'body-quote');
  },

  cta(s, ctx) {
    const { t, rng, accent } = ctx;
    const hl = `<h1 class="hl hl-xl" ${fitAttr(t.type.headline, 1.1)}>${rich(s.headline)}</h1>`;
    const act = s.action
      ? `<p class="action" ${fitAttr(t.type.deck)}>${rich(s.action)}
           <span class="mk mk-circle">${marks.circle(rng, 400, 120, { color: accent, weight: 6 })}</span></p>` : '';
    return fitFrame(`${hl}${act}${para(s, ctx)}`, 'body-cta');
  },
};

export const SLIDE_TYPES = Object.keys(TYPES);

export function slideHTML(slide, ctx) {
  const build = TYPES[slide.type];
  if (!build) throw new Error(`Unknown slide type "${slide.type}". This theme has: ${SLIDE_TYPES.join(', ')}`);
  return `${header(slide, ctx)}${sunburst(ctx)}${build(slide, ctx)}${objectVisual(slide, ctx.t, ctx.deck)}${footer(ctx)}`;
}

// ── stylesheet ──────────────────────────────────────────────────────

export function css(ctx) {
  const { t, accent, fontFaces, textureCSS } = ctx;
  const c = t.color, sp = t.space, ty = t.type, r = t.radius, cv = t.canvas;

  return `${fontFaces}
${baseCSS(t)}

body { background:${c.bg}; color:${c.ink}; font-family:Body, ui-monospace, monospace; }

/* Radiating rays, bled off the top-right corner. Repeating conic gradient,
   so it costs nothing and never tiles visibly at this scale. */
.burst {
  position:absolute; top:-46%; right:-40%; width:104%; height:104%;
  background:repeating-conic-gradient(from 0deg at 50% 50%,
    ${accent}1F 0deg 3.2deg, transparent 3.2deg 9deg);
  border-radius:50%; z-index:1; pointer-events:none;
  -webkit-mask-image:radial-gradient(circle at 50% 50%, #000 34%, transparent 72%);
          mask-image:radial-gradient(circle at 50% 50%, #000 34%, transparent 72%);
}

.hdr, .ftr { position:absolute; left:${cv.margin}px; right:${cv.margin}px;
  display:flex; align-items:center; justify-content:space-between; z-index:40; }
.hdr { top:${Math.round(cv.safeTop * 0.40)}px; }
.ftr { bottom:${Math.round(cv.safeBottom * 0.34)}px; }

.brand { font-family:Label; font-weight:600; font-size:${ty.brand.size}px;
  letter-spacing:${ty.brand.tracking}em; color:${c.ink}; }
.hdr-right { display:flex; align-items:center; gap:${sp.sm}px; }
.eyebrow { font-family:Label; font-weight:600; font-size:${ty.eyebrow.size}px;
  letter-spacing:${ty.eyebrow.tracking}em; text-transform:uppercase;
  color:${c.accentInk}; background:${accent};
  padding:5px 12px 4px; border-radius:${r.sm}px; }
.counter { font-family:LabelLight; font-size:${ty.eyebrow.size}px;
  letter-spacing:.14em; color:${c.inkFaint}; }

.handle { font-family:Body; font-size:${ty.footer.size}px;
  letter-spacing:${ty.footer.tracking}em; color:${c.inkFaint}; }
.chips { display:flex; gap:8px; }
.fchip { font-family:Body; font-size:${ty.footer.size}px; padding:5px 11px 4px;
  border-radius:${r.sm}px; letter-spacing:.02em; }

.fit { gap:${sp.md}px; }
.body-hook .fit, .body-cta .fit, .body-quote .fit { gap:${sp.sm}px; }
.body-reveal .fit { gap:${sp.sm}px; justify-content:flex-start; }

.hl { font-family:Display; font-weight:400; text-transform:uppercase;
  font-size:${ty.headline.size}px; line-height:${ty.headline.leading};
  letter-spacing:${ty.headline.tracking}em; color:${c.ink};
  text-wrap:balance; }
.hl-xl { font-size:${Math.round(ty.headline.size * 1.18)}px; }
/* The reveal title is chrome, not content, so it stays accent on every slide. */
.hl-sm { font-size:${Math.round(ty.headline.size * 0.62)}px; color:${accent}; }
.ac { color:${accent}; }

.deck { font-family:LabelLight; font-size:${ty.deck.size}px;
  line-height:${ty.deck.leading}; color:${c.inkSoft}; max-width:88%; }
.rv-sub { font-family:LabelLight; font-size:${Math.round(ty.deck.size * 0.85)}px;
  color:${c.inkSoft}; letter-spacing:.03em; }
.para { font-family:Body; font-size:${ty.body.size}px;
  line-height:${ty.body.leading}; color:${c.inkSoft}; max-width:88%; }

/* generic rows */
.rows { list-style:none; display:flex; flex-direction:column; gap:${sp.sm}px; }
.row { display:flex; gap:${sp.md}px; align-items:baseline;
  border-bottom:1px solid ${c.rule}; padding-bottom:${sp.sm}px; }
.rnum { font-family:Display; color:${accent}; font-size:26px; min-width:34px; }
.rtxt { display:flex; flex-direction:column; gap:5px; }
.rt { font-family:Label; font-weight:600; text-transform:uppercase;
  font-size:${ty.rowTitle.size}px; line-height:${ty.rowTitle.leading};
  letter-spacing:.02em; color:${c.ink}; }
.rb { font-family:Body; font-size:${ty.rowBody.size}px;
  line-height:${ty.rowBody.leading}; color:${c.inkSoft}; }

/* ── reveal ─────────────────────────────────────────────────────── */
.rv-wrap { position:relative; padding-left:${sp.lg}px; }
.rv-loop { position:absolute; left:-2px; top:12%; bottom:12%; width:${sp.md}px;
  border-left:2px dashed ${accent}; border-top:2px dashed ${accent};
  border-bottom:2px dashed ${accent}; border-radius:${r.md}px 0 0 ${r.md}px;
  font-family:Body; font-size:17px; color:${accent};
  writing-mode:vertical-rl; transform:rotate(180deg);
  display:flex; align-items:center; justify-content:center; letter-spacing:.1em; }
.rv-list { list-style:none; display:flex; flex-direction:column; gap:10px; }
.rv { display:flex; gap:${sp.md}px; align-items:center;
  padding:${sp.sm}px ${sp.md}px; border-radius:${r.md}px;
  border:2px solid transparent; }
.rv-num { font-family:Display; font-size:30px; width:52px; height:52px;
  flex:0 0 auto; border-radius:50%; display:grid; place-items:center; }
.rv-txt { display:flex; flex-direction:column; gap:4px; }
.rv-t { font-family:Label; font-weight:600; text-transform:uppercase;
  font-size:${ty.rowTitle.size}px; line-height:${ty.rowTitle.leading};
  letter-spacing:.03em; }
.rv-b { font-family:Body; font-size:${ty.rowBody.size}px;
  line-height:${ty.rowBody.leading}; letter-spacing:.01em; }

/* The lit step. Everything about it is one notch louder than the rest. */
.rv-on { background:${c.surface}; border-color:${c.rule};
  box-shadow:3px 3px 0 ${c.rule}; }
.rv-on .rv-num { background:${c.ink}; color:${c.surface}; }
.rv-on .rv-t { color:${accent}; }
.rv-on .rv-b { color:${c.inkSoft}; }

/* The rest. Present, legible in outline, clearly not the subject. */
.rv-off { opacity:.34; }
.rv-off .rv-num { background:transparent; color:${c.inkFaint};
  border:2px solid ${c.rule}; }
.rv-off .rv-t { color:${c.inkSoft}; }
.rv-off .rv-b { color:${c.inkFaint}; }

.stats { display:grid; gap:${sp.sm}px; }
.stats-2 { grid-template-columns:1fr 1fr; }
.stat { background:${c.surface}; border:2px solid ${c.rule}; border-radius:${r.md}px;
  padding:${sp.md}px; display:flex; flex-direction:column; gap:6px;
  box-shadow:4px 4px 0 ${c.rule}; }
.stat-v { font-family:Display; font-size:${ty.statValue.size}px;
  line-height:${ty.statValue.leading}; color:${accent}; }
.stat-l { font-family:Label; font-weight:600; text-transform:uppercase;
  font-size:${ty.statLabel.size}px; line-height:${ty.statLabel.leading};
  letter-spacing:.05em; color:${c.inkSoft}; }

.quote-wrap { position:relative; }
.quote { font-family:Display; font-weight:400; font-size:${ty.quote.size}px;
  line-height:${ty.quote.leading}; color:${c.ink}; padding-left:${sp.lg}px;
  text-wrap:balance; }
.attrib { font-family:Label; font-weight:600; text-transform:uppercase;
  font-size:${ty.caption.size}px; color:${c.inkFaint};
  padding-left:${sp.lg}px; letter-spacing:.12em; margin-top:${sp.sm}px; }
.mk-bracket { position:absolute; left:-4px; top:50%; transform:translateY(-50%); }

.action { position:relative; display:inline-block; margin:26px 0; font-family:Label; font-weight:600;
  text-transform:uppercase; letter-spacing:.06em;
  font-size:${ty.deck.size}px; color:${c.ink}; padding:${sp.sm}px ${sp.md}px; }
.mk-circle { position:absolute; left:-24px; top:50%; transform:translateY(-50%); }

.term { background:#231A12; border-radius:${r.md}px;
  box-shadow:5px 5px 0 ${c.rule}; }
.term-bar { padding:12px ${sp.md}px; background:rgba(255,255,255,.06);
  font-family:Body; font-size:18px; color:rgba(247,241,228,.5); }
.term-bar i { background:rgba(247,241,228,.22); }
.term-body { padding:${sp.md}px; gap:7px; font-size:22px; line-height:1.45;
  color:#D8CDB8; }
.shot { background:${c.surface}; border:2px solid ${c.rule}; border-radius:${r.md}px;
  box-shadow:5px 5px 0 ${c.rule}; }
.shot-bar { padding:12px ${sp.md}px; background:${c.bg}; color:${c.inkFaint};
  font-family:Body; font-size:18px; }
.shot-bar i { background:${c.rule}; }

.object { right:${Math.round(cv.margin * 0.5)}px; bottom:${Math.round(cv.safeBottom * 0.75)}px; }

${textureCSS}
`;
}
