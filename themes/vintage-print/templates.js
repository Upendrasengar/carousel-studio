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

/**
 * Motion is opt-in per slide. The marker rides in on the body's extra class
 * rather than through `fitFrame`, whose signature twenty-three themes share
 * and none of the others need changed. Every keyframe in this theme is scoped
 * under `.is-anim`, so an unmarked slide carries no animation at all.
 */
const anim = (s, base) => (s.animate ? `${base} is-anim` : base);

const TYPES = {
  hook(s, ctx) {
    const hl = `<h1 class="hl hl-xl" ${fitAttr(ctx.t.type.headline, 1.18)}>${rich(s.headline)}</h1>`;
    return fitFrame(`${hl}${deckLine(s, ctx)}`, anim(s, 'body-hook'));
  },

  // The star. Identical layout every time, one step lit.
  reveal(s, ctx) {
    const text = s.headline || ctx.deck.reveal?.title;
    const title = text
      ? `<h1 class="hl hl-sm" ${fitAttr(ctx.t.type.headline, 0.62)}>${rich(text)}</h1>` : '';
    const sub = ctx.deck.reveal?.subtitle
      ? `<p class="rv-sub" ${fitAttr(ctx.t.type.deck, 0.85)}>${rich(ctx.deck.reveal.subtitle)}</p>` : '';
    return fitFrame(`${title}${sub}${revealList(s, ctx)}`, anim(s, 'body-reveal'));
  },

  problem(s, ctx) {
    return fitFrame(`${headline(s, ctx)}${para(s, ctx)}${rowList(s.rows, ctx, false)}${mediaCard(s, ctx.accent)}`, anim(s, ''));
  },

  point(s, ctx) {
    return fitFrame(`${headline(s, ctx)}${deckLine(s, ctx)}${mediaCard(s, ctx.accent)}${para(s, ctx)}${rowList(s.rows, ctx, false)}`, anim(s, ''));
  },

  steps(s, ctx) {
    return fitFrame(`${headline(s, ctx)}${para(s, ctx)}${rowList(s.steps || s.rows, ctx, true)}${mediaCard(s, ctx.accent)}`, anim(s, ''));
  },

  stat(s, ctx) {
    const { t } = ctx;
    const cells = (s.stats || []).map((v) => `<div class="stat">
      <span class="stat-v" ${fitAttr(t.type.statValue)}>${rich(v.value)}</span>
      <span class="stat-l" ${fitAttr(t.type.statLabel)}>${rich(v.label)}</span>
    </div>`).join('');
    const grid = cells ? `<div class="stats stats-${Math.min(2, (s.stats || []).length)}">${cells}</div>` : '';
    return fitFrame(`${headline(s, ctx)}${grid}${para(s, ctx)}`, anim(s, ''));
  },

  quote(s, ctx) {
    const { t, rng, accent } = ctx;
    const q = `<blockquote class="quote" ${fitAttr(t.type.quote)}>${rich(s.quote || s.headline)}</blockquote>`;
    const a = s.attribution ? `<p class="attrib" ${fitAttr(t.type.caption)}>${esc(s.attribution)}</p>` : '';
    const br = `<span class="mk mk-bracket">${marks.bracket(rng, 40, 250, { color: accent, weight: 6 })}</span>`;
    return fitFrame(`<div class="quote-wrap">${br}${q}${a}</div>`, anim(s, 'body-quote'));
  },

  cta(s, ctx) {
    const { t, rng, accent } = ctx;
    const hl = `<h1 class="hl hl-xl" ${fitAttr(t.type.headline, 1.1)}>${rich(s.headline)}</h1>`;
    const act = s.action
      ? `<p class="action" ${fitAttr(t.type.deck)}>${rich(s.action)}
           <span class="mk mk-circle">${marks.circle(rng, 400, 120, { color: accent, weight: 6 })}</span></p>` : '';
    return fitFrame(`${hl}${act}${para(s, ctx)}`, anim(s, 'body-cta'));
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

  // Loop length drives every duration in the motion block, so retiming the
  // theme is one number in theme.json rather than a sweep through keyframes.
  const D = t.animate?.seconds || 4;

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

/* ── motion ─────────────────────────────────────────────────────────
   Scoped to .is-anim, which only appears on a slide marked "animate": true.

   The reveal is the one mechanic in this pack that was already animation
   pretending to be stills: five slides showing the same diagram with a
   different step lit is a hand-cranked flipbook. So the video does not
   invent a new gesture — it plays the transition the still deck implies.
   The lit row starts wearing the dim treatment every other row has and
   arrives at the lit one, which is why every keyframe below begins at a
   value taken from the .rv-off rules rather than at zero or transparent.

   That also means no frame of this loop is ever blank: frame 0 is a
   legible slide with nothing yet highlighted, which is exactly the state
   the previous slide left the reader in. The loop seam reads as the step
   advancing rather than as a flash. Everything settles by a third of the
   cycle and holds, so the still the renderer writes beside the MP4 is the
   lit design the unanimated deck produces. */

@keyframes vp-light {
  0%        { opacity:.34; background:transparent;
              border-color:transparent; box-shadow:0 0 0 transparent; }
  34%, 100% { opacity:1; background:${c.surface};
              border-color:${c.rule}; box-shadow:3px 3px 0 ${c.rule}; }
}
@keyframes vp-badge {
  0%        { background:transparent; color:${c.inkFaint}; border-color:${c.rule}; }
  34%, 100% { background:${c.ink}; color:${c.surface}; border-color:transparent; }
}
@keyframes vp-title { 0% { color:${c.inkSoft}; } 34%, 100% { color:${accent}; } }
@keyframes vp-bodytext { 0% { color:${c.inkFaint}; } 34%, 100% { color:${c.inkSoft}; } }
/* The bracket is chrome for the whole run, so it wakes before the step does. */
@keyframes vp-loop { 0% { opacity:.3; } 22%, 100% { opacity:1; } }
@keyframes vp-rise {
  0%        { opacity:.25; transform:translateY(18px); }
  28%, 100% { opacity:1; transform:none; }
}
@keyframes vp-fade {
  0%,  8%   { opacity:.2; transform:translateY(10px); }
  36%, 100% { opacity:1; transform:none; }
}

/* The off rows hold still. Dimming something that is already dim is noise,
   and moving them would pull the eye away from the row that is arriving. */
.is-anim .rv-on { animation:vp-light ${D}s cubic-bezier(.2,.8,.2,1) infinite both; }
/* .rv-num carries no border in the lit state, so it needs one declared here
   for border-color to have something to animate against. */
.is-anim .rv-on .rv-num { border:2px solid transparent;
  animation:vp-badge ${D}s cubic-bezier(.2,.8,.2,1) infinite both; }
.is-anim .rv-on .rv-t { animation:vp-title ${D}s ease-out infinite both; }
.is-anim .rv-on .rv-b { animation:vp-bodytext ${D}s ease-out infinite both; }
.is-anim .rv-loop { animation:vp-loop ${D}s ease-out infinite both; }
.is-anim .hl, .is-anim .quote {
  animation:vp-rise ${D}s cubic-bezier(.2,.8,.2,1) infinite both; }
.is-anim .rv-sub, .is-anim .deck, .is-anim .para,
.is-anim .action, .is-anim .attrib {
  animation:vp-fade ${D}s ease-out infinite both; }

/* Rows and stat cells arrive in reading order. vintage-print's row markup is
   shared with three other slide types and carries no index, so the stagger is
   spelled out per position rather than driven by a custom property — six
   covers the theme's maxRows budget with one to spare. */
.is-anim .rows .row, .is-anim .stat {
  animation:vp-fade ${D}s ease-out infinite both; }
.is-anim .rows .row:nth-child(1), .is-anim .stat:nth-child(1) { animation-delay:.06s; }
.is-anim .rows .row:nth-child(2), .is-anim .stat:nth-child(2) { animation-delay:.14s; }
.is-anim .rows .row:nth-child(3) { animation-delay:.22s; }
.is-anim .rows .row:nth-child(4) { animation-delay:.30s; }
.is-anim .rows .row:nth-child(5) { animation-delay:.38s; }
.is-anim .rows .row:nth-child(6) { animation-delay:.46s; }

${textureCSS}
`;
}
