// Slide templates for the assembly theme.
//
// One frame that assembles itself.
//
// Every other pack in this studio spends its motion budget inside a 4-second
// loop and its structure across 8 slides. This one inverts both: the deck is a
// single slide, and the animation is a 14-second one-shot build that ends held
// on a finished reference card.
//
// Three things define the system, and a pack that drops any of them is a
// different pack:
//
//   1. The empty slots are drawn from frame 0. A numbered rail with N dim
//      placeholders is the promise — the viewer can count what is coming and
//      waits for it. A build that starts on a blank frame has no promise and
//      no reason to hold anyone.
//   2. Entries arrive one at a time, never together. The stagger is the whole
//      mechanic; simultaneous arrival is a fade-in, which is decoration.
//   3. The last frame is a complete, legible card. It is what the renderer
//      screenshots as the still fallback and what a viewer screenshots to
//      save, so the design has to work with the motion removed.
//
// Motion here deliberately breaks the studio's usual "nothing starts at
// opacity:0" rule, because that rule exists for seamless loops and this clip
// is not one — it resets visibly, exactly as the reference does. The rule it
// keeps is the one that mattered: the frame never goes blank. Slots sit at a
// visible ghost state, so frame 0 is an empty form, not an empty canvas.

import {
  esc, rich, fitAttr, fitFrame, baseCSS,
} from '../../scripts/lib/blocks.js';
import { icon } from '../../scripts/lib/icons.js';
import { brandMark } from '../../scripts/lib/assets.js';

const T = (c) => c.t.type;

/**
 * Motion is opt-in per slide, as everywhere else in the studio. Every keyframe
 * is scoped under `.is-anim`, so a slide without the flag carries no animation
 * and its still is byte-identical to the same deck rendered before this pack
 * could move.
 */
const anim = (s, base) => (s.animate ? `${base} is-anim` : base);

/**
 * One slot: rail number, then the card that lands in it.
 *
 * The hue rides on the `<li>` as a custom property. `fitAttr` already emits a
 * style attribute, and a second one on the same element is silently dropped by
 * the HTML parser — so per-slot values go on the ancestor that carries no fit
 * attributes and the stylesheet reads them back.
 */
function slotRow(it, n, hue, ctx) {
  const { t } = ctx;
  const mark = brandMark(it.logo, hue);
  const glyph = mark ? mark.html : (it.icon ? icon(it.icon) : '');
  return `<li class="slot" style="--hue:${hue}">
    <span class="snum">${String(n).padStart(2, '0')}</span>
    <span class="scard">
      <span class="stop">
        <span class="sico">${glyph}</span>
        <span class="stitle" ${fitAttr(t.type.slotTitle)}>${esc(it.title || '')}</span>
        ${it.tag ? `<span class="stag" ${fitAttr(t.type.tag)}>${esc(it.tag)}</span>` : ''}
      </span>
      ${it.body ? `<span class="sbody" ${fitAttr(t.type.slotBody)}>${rich(it.body)}</span>` : ''}
      ${it.try ? `<span class="stry" ${fitAttr(t.type.slotTry)}><b>${esc(it.tryLabel || 'TRY')}</b>${rich(it.try)}</span>` : ''}
    </span>
  </li>`;
}

const TYPES = {
  /**
   * The only real type in this pack. Header, title block, then the rail of
   * slots that fills across the take.
   */
  assemble(s, ctx) {
    const { t } = ctx;
    const hues = t.color.slotHues;
    const rows = (s.slots || [])
      .map((it, i) => slotRow(it, i + 1, hues[i % hues.length], ctx)).join('');
    return fitFrame(`
      <div class="titles">
        ${s.headline ? `<h1 class="hl" ${fitAttr(T(ctx).headline)}>${rich(s.headline)}</h1>` : ''}
        ${s.deck ? `<p class="deck" ${fitAttr(T(ctx).deck)}>${rich(s.deck)}</p>` : ''}
      </div>
      <div class="stack">
        <ul class="slots">${rows}</ul>
      </div>
      ${s.source ? `<p class="src">${esc(s.source)}</p>` : ''}`, anim(s, 'body-assemble'));
  },
};

export const SLIDE_TYPES = Object.keys(TYPES);

function header(slide, ctx) {
  const { deck } = ctx;
  const mark = brandMark(deck.logo, ctx.accent);
  const right = mark ? `<span class="brand">${mark.html}</span>` : '<span></span>';
  return `<header class="hdr">
    <span class="cat">${esc(slide.eyebrow || deck.brand || '')}</span>${right}</header>`;
}

/**
 * No swipe affordance and no slide counter: there is one frame, and telling a
 * viewer to swipe a single image is the kind of detail that reads as a
 * template nobody adjusted.
 */
const footer = (slide, ctx) => `<footer class="ftr">
  <span>${esc(ctx.deck.handle || '')}</span>
  <span class="save">${esc(slide.save || ctx.deck.footnote || '')}</span>
</footer>`;

export function slideHTML(slide, ctx) {
  const build = TYPES[slide.type];
  if (!build) throw new Error(`Unknown slide type "${slide.type}". This theme has: ${SLIDE_TYPES.join(', ')}`);
  return `${header(slide, ctx)}${build(slide, ctx)}${footer(slide, ctx)}`;
}

export function css(ctx) {
  const { t, accent, fontFaces, textureCSS } = ctx;
  const c = t.color, sp = t.space, ty = t.type, r = t.radius, cv = t.canvas;
  const A = t.animate || {};
  const D = A.seconds || 14;
  const lead = A.lead ?? 1.1;      // when the first slot starts
  const step = A.step ?? 2.3;      // gap between slots
  const build = A.build ?? 0.95;   // how long one slot takes to land
  const cap = (t.budgets && t.budgets.maxRows) || 6;

  // Per-slot delays. Finite animations with fill:both, not an infinite loop —
  // seek past delay+duration and the slot holds its landed state, which is
  // what both the tail of the clip and the still fallback depend on.
  //
  // The last slot must finish inside the take. At the shipped defaults that is
  // 1.1 + 5x2.3 + 0.95 = 13.55s against 14s, so the card holds for the last
  // half second. Widening step without lengthening seconds silently truncates
  // the final slot mid-rise.
  const delays = Array.from({ length: cap }, (_, i) => {
    const at = (lead + i * step).toFixed(3);
    const n = i + 1;
    return `.is-anim .slot:nth-child(${n}) .scard,
.is-anim .slot:nth-child(${n}) .snum { animation-delay:${at}s; }
.is-anim .slot:nth-child(${n}) .sbody { animation-delay:${(Number(at) + build * 0.35).toFixed(3)}s; }
.is-anim .slot:nth-child(${n}) .stry { animation-delay:${(Number(at) + build * 0.6).toFixed(3)}s; }
.is-anim .slot:nth-child(${n}) .stag { animation-delay:${(Number(at) + build * 0.8).toFixed(3)}s; }`;
  }).join('\n');

  return `${fontFaces}
${baseCSS(t)}
body { background:${c.bg}; color:${c.ink}; font-family:Body, system-ui, sans-serif;
  background-image:
    radial-gradient(72% 40% at 12% 0%, ${accent}1F, transparent 62%),
    radial-gradient(64% 38% at 96% 100%, #8E8CFF14, transparent 66%); }

.hdr, .ftr { position:absolute; left:${cv.margin}px; right:${cv.margin}px; z-index:40;
  display:flex; align-items:center; justify-content:space-between; }
.hdr { top:${Math.round(cv.safeTop * 0.46)}px; }
.ftr { bottom:${Math.round(cv.safeBottom * 0.4)}px; font-family:Mono;
  font-size:${ty.footer.size}px; letter-spacing:${ty.footer.tracking}em; color:${c.inkFaint}; }
.cat { font-family:Mono; font-size:${ty.eyebrow.size}px; letter-spacing:${ty.eyebrow.tracking}em;
  text-transform:uppercase; color:${c.inkSoft}; }
.brand { display:block; width:46px; height:46px; opacity:.9; }
.brand svg, .brand img { width:100%; height:100%; object-fit:contain; }
.save { color:${c.inkSoft}; }

/* The source line sits in the flow under the rail, not pinned to the frame.
   Absolute positioning put it on a collision course with the footer, and the
   two only stayed apart while the copy fitted on one line. */
.src { font-family:Mono; font-size:${ty.source.size}px;
  line-height:${ty.source.leading}; color:${c.inkFaint}; opacity:.8;
  padding-left:${43 + sp.md}px; }

.body { justify-content:flex-start; top:${Math.round(cv.safeTop + 18)}px; }
.fit { gap:${sp.md}px; }

.titles { display:flex; flex-direction:column; gap:${sp.xs}px; }
.hl { font-family:Display; font-weight:800; font-size:${ty.headline.size}px;
  line-height:${ty.headline.leading}; letter-spacing:${ty.headline.tracking}em; color:${c.ink}; }
.ac { color:${accent}; }
.deck { font-family:Body; font-size:${ty.deck.size}px; line-height:${ty.deck.leading};
  color:${c.inkSoft}; }
.deck b { color:${c.ink}; font-weight:600; font-family:BodyMid; }

/* ── the rail and its slots ───────────────────────────────────────────
   The ghost rail and the real slots are stacked in the same box, so a slot
   card lands exactly on top of the placeholder it fills. Both use the same
   row template, which is what keeps them registered as one column.
   No backticks anywhere in this stylesheet: it is a template literal, and one
   inside a comment ends the string. */
/* A height floor, not flex:1 — the fit wrapper sizes to content by design, so
   forcing it to fill would make the fit pass measure zero overflow forever.
   The floor is what stops the deck rendering correct and top-heavy with the
   bottom fifth of the frame empty; the slack lands in the gaps between slots.

   The empty placeholder is drawn by the slot itself, as a pseudo-element
   behind its own card. The first build gave the ghosts their own grid laid
   over the real one, and the two drifted the moment the rows stopped being
   equal height — a second column of numbers beside the first. One element
   cannot come out of register with itself. */
.stack { position:relative; display:grid; min-height:${Math.round(cv.height * 0.68)}px; }
.slots { display:grid; gap:${sp.sm}px;
  grid-auto-rows:min-content; align-content:space-between; list-style:none; }

/* The vertical wire. Drawn behind everything, full height of the stack, so
   the column reads as one run rather than as separate cards. */
.stack::before { content:''; position:absolute; left:21px; top:14px; bottom:14px;
  width:1px; background:linear-gradient(${c.rule}, ${c.rule} 70%, transparent); }

.slot { position:relative; display:grid; grid-template-columns:43px 1fr;
  gap:${sp.md}px; align-items:start; }

/* The empty slot: a dim outline occupying exactly the card's box, sitting
   behind it. The card's background is opaque, so a card that has landed hides
   its own placeholder with no extra state to manage. */
.slot::before { content:''; position:absolute; z-index:0;
  left:${43 + sp.md}px; right:0; top:0; bottom:0;
  border:1px dashed ${c.rule}; border-radius:${r.sm}px ${r.md}px ${r.md}px ${r.sm}px; }
.snum { display:grid; place-items:center; align-self:start;
  width:43px; height:43px; border-radius:99px; box-sizing:border-box;
  border:1px solid var(--hue); background:${c.bg};
  font-family:MonoBold; font-size:15px; color:var(--hue); }

.scard { position:relative; z-index:1;
  display:flex; flex-direction:column; gap:${sp.xs}px; min-width:0;
  background:${c.surface}; border:1px solid ${c.rule};
  border-left:2px solid var(--hue);
  border-radius:${r.sm}px ${r.md}px ${r.md}px ${r.sm}px;
  padding:${sp.md}px ${sp.md}px ${sp.md}px ${sp.md}px; }
.stop { display:flex; align-items:center; gap:${sp.sm}px; }
.sico { flex:0 0 auto; width:30px; height:30px; display:grid; place-items:center;
  color:var(--hue); }
.sico svg, .sico img { width:26px; height:26px; object-fit:contain; }
.stitle { font-family:Display; font-weight:800; letter-spacing:-.02em; color:${c.ink};
  flex:1 1 auto; min-width:0; }
.stag { flex:0 0 auto; font-family:Mono; letter-spacing:${ty.tag.tracking}em;
  text-transform:uppercase; color:${c.inkFaint}; }
.sbody { font-family:Body; color:${c.inkSoft}; }
.sbody b { color:${c.ink}; font-weight:600; font-family:BodyMid; }

/* The try line is the payload — the thing a viewer would actually retype. It
   is the one element allowed to carry the slot hue in running text, because
   it is an instruction rather than prose. */
.stry { display:flex; align-items:baseline; gap:${sp.sm}px; font-family:Mono;
  color:var(--hue); }
.stry b { flex:0 0 auto; font-family:MonoBold; font-size:.72em; letter-spacing:.16em;
  color:${c.inkFaint}; }
.stry .ac { color:${c.ink}; font-style:normal; }

.object { right:${Math.round(cv.margin * 0.6)}px; bottom:${Math.round(cv.safeBottom * 1.2)}px; }

/* ── motion ───────────────────────────────────────────────────────────
   A one-shot build, not a loop: every animation is finite with fill:both, so
   seeking past its end holds the landed state. That is what makes the tail of
   the clip a still card and what the renderer's still fallback screenshots.

   Nothing fades from zero. Slots start at a visible ghost state and the rail
   node is already drawn, so frame 0 is an empty form rather than an empty
   frame — the promise the viewer waits on. */
@keyframes as-in {
  0%   { opacity:0; transform:translateY(12px) scale(.985); }
  100% { opacity:1; transform:none; }
}
@keyframes as-node {
  0%   { border-color:${c.rule}; color:${c.rule}; }
  100% { border-color:var(--hue); color:var(--hue); }
}
@keyframes as-head {
  0%   { opacity:.25; transform:translateY(6px); }
  100% { opacity:1; transform:none; }
}
@keyframes as-fade {
  0%   { opacity:0; }
  100% { opacity:1; }
}

.is-anim .titles { animation:as-head .8s ease-out both; }
.is-anim .slot .scard { animation:as-in ${build}s cubic-bezier(.22,.9,.24,1) both; }
.is-anim .slot .snum { animation:as-node ${build}s ease-out both; }
.is-anim .slot .sbody,
.is-anim .slot .stry,
.is-anim .slot .stag { animation:as-fade ${(build * 0.5).toFixed(2)}s ease-out both; }
${delays}

${textureCSS}
`;
}
