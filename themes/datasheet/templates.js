// Slide templates for the datasheet theme.
//
// Every entry slide is the same form filled in. A counter chip, a dashed wire
// naming the two ends of the connection, a brand tile, then three fields in a
// fixed order — what it does, why it is useful, and a numbered recipe — and a
// closing line. Nine slides of that is a spec sheet, and a spec sheet gets
// saved.
//
// Two things separate it from `index-rail`, which is the pack to use instead
// when they do not apply:
//
//   1. The last field is instructions. index-rail's entry ends in a link and
//      its own rules.md says the browser card is the device the whole layout
//      is built around — so an entry with nothing to link to renders as a grey
//      band. Everything here is set up inside somebody else's UI; there is no
//      URL to show, and the steps are the reason to save the post.
//   2. The schema is fixed, not per-entry. index-rail lets each item carry its
//      own shape. Here all three fields appear on every slide in the same
//      order, and an entry missing one is a hole you can see. That sameness is
//      the mechanic: by slide three the reader knows where to look, so they
//      read the value rather than the layout.
//
// It is the wrong theme for a round-up where the entries are not comparable,
// or where there is nothing to do after reading. Without the recipe this is a
// list with extra chrome.

import {
  esc, rich, fitAttr, fitFrame, mediaCard, objectVisual, baseCSS,
} from '../../scripts/lib/blocks.js';
import { icon } from '../../scripts/lib/icons.js';
import { brandMark } from '../../scripts/lib/assets.js';

const T = (c) => c.t.type;

/**
 * Motion is opt-in per slide. Every keyframe is scoped under `.is-anim`, so a
 * slide without the flag carries no animation at all and its still is
 * byte-identical to what the pack rendered before it could move.
 */
const anim = (s, base) => (s.animate ? `${base} is-anim` : base);

const headline = (s, c, mul = 1) => (s.headline
  ? `<h1 class="hl" ${fitAttr(T(c).headline, mul)}>${rich(s.headline)}</h1>` : '');
const deckLine = (s, c) => (s.deck ? `<p class="deck" ${fitAttr(T(c).deck)}>${rich(s.deck)}</p>` : '');
const para = (s, c) => (s.body ? `<p class="para" ${fitAttr(T(c).body)}>${rich(s.body)}</p>` : '');

/** The field labels, overridable once at deck level so they cannot drift. */
const LABELS = { does: 'What it does', why: "Why it's useful", how: 'How to connect' };
const labelFor = (deck, key) => (deck.labels && deck.labels[key]) || LABELS[key];

/** How many entry slides the deck has — the denominator on every counter. */
export function entryTotal(deck) {
  return (deck.slides || []).filter((s) => s.type === 'entry').length;
}

/**
 * This entry's number.
 *
 * Keyed on the slide's declared `n`, falling back to its position among the
 * entry slides. Never on object identity: the renderer hands each template a
 * structuredClone of the slide, so `s === slide` is false for every entry.
 */
function entryNumber(deck, slide, index) {
  if (Number.isInteger(slide.n) && slide.n > 0) return slide.n;
  let seen = 0;
  for (let i = 0; i < index; i++) if (deck.slides[i]?.type === 'entry') seen++;
  return seen + 1;
}

const pad = (n) => String(n).padStart(2, '0');

/**
 * The wire: two pins joined by a dashed run, naming what connects to what.
 *
 * It is the one piece of chrome that changes per slide and the reason the
 * deck reads as wiring rather than as a list. The left end is constant across
 * the deck — it is the thing doing the connecting — so it lives on the deck.
 */
function wire(s, ctx) {
  const from = s.from || ctx.deck.wireFrom;
  const to = s.to || s.name;
  if (!from || !to) return '';
  return `<div class="wire">
    <i class="pin"></i><span class="wl">${esc(from)}</span>
    <span class="wrun"></span>
    <span class="wgt">&gt;</span><span class="wl wl-to">${esc(to)}</span><i class="pin pin-on"></i>
  </div>`;
}

/** One labelled field. `tone` picks the filled pill or the quiet one. */
function field(labelText, text, tone, glyph, ctx) {
  if (!text) return '';
  return `<div class="fld fld-${tone}">
    <span class="lab"><i>${icon(glyph)}</i>${esc(labelText)}</span>
    <p class="ftx" ${fitAttr(T(ctx).field)}>${rich(text)}</p>
  </div>`;
}

/**
 * The recipe box. Dashed, mono, numbered, with a faint line drawing in the
 * corner — the payload of the whole slide.
 *
 * The doodle is a watermark, not a prop, and deliberately not tagged
 * `data-decor`. The collision guard drops any decoration that overlaps ink —
 * correct for a character standing next to a paragraph, wrong here, because
 * sitting behind the steps is the whole idea. Tagged, it was dropped on
 * every single entry slide and the box lost its one piece of character.
 * It is clipped by the box and sits under the text at low opacity instead.
 */
function recipe(s, ctx) {
  const steps = s.how;
  if (!Array.isArray(steps) || !steps.length) return '';
  const max = ctx.t.budgets.maxHow || 4;
  if (steps.length > max) {
    throw new Error(`Entry "${s.name}" has ${steps.length} how-steps against a max of ${max}. A recipe longer than that is a tutorial, not a card.`);
  }
  const list = steps.map((step, i) =>
    `<li><b>${i + 1}</b><span ${fitAttr(T(ctx).step)}>${esc(step)}</span></li>`).join('');
  const doodle = s.doodle
    ? `<span class="doodle">${icon(s.doodle)}</span>` : '';
  return `<div class="rcp">
    <span class="rcp-lab">${esc(labelFor(ctx.deck, 'how'))}</span>
    <ol class="rcp-steps">${list}</ol>${doodle}
  </div>`;
}

/** A plain row list, for the standard slide types that are not an entry. */
function rowList(list, ctx, numbered) {
  if (!list?.length) return '';
  const { t } = ctx;
  return `<ul class="rows">${list.map((r, i) => {
    const mark = numbered
      ? `<span class="rnum">${pad(i + 1)}</span>`
      : `<span class="rico">${r.icon ? icon(r.icon) : ''}</span>`;
    return `<li class="row">${mark}
      <span class="rtxt"><span class="rname" ${fitAttr(t.type.rowTitle)}>${rich(r.title)}</span>
      ${r.body ? `<span class="rbody" ${fitAttr(t.type.rowBody)}>${rich(r.body)}</span>` : ''}</span>
    </li>`;
  }).join('')}</ul>`;
}

/** The hook's meta pills — a count and a cost, nothing else. */
function metaPills(s, ctx) {
  const list = s.meta;
  if (!Array.isArray(list) || !list.length) return '';
  return `<div class="metas">${list.map((m) =>
    `<span class="meta"><i>${icon(m.icon || 'bolt')}</i>${esc(m.label || '')}</span>`).join('')}</div>`;
}

/**
 * The logo strip on the hook and the CTA. It lives once at deck level, so the
 * two slides cannot disagree about what the deck contains — the closing
 * mechanic only works if the set that comes back is the set that was promised.
 */
function logoChips(ctx) {
  const list = ctx.deck.chips;
  if (!Array.isArray(list) || !list.length) return '';
  const { t } = ctx;
  return `<div class="chips">${list.map((c) => {
    const mark = brandMark(c.logo, t.color.ink);
    const glyph = mark ? mark.html : icon(c.icon || 'link');
    return `<span class="chip"><i>${glyph}</i>${esc(c.label || '')}</span>`;
  }).join('')}</div>`;
}

/** The hook's centrepiece: one verb, drawn large, with a glyph beneath it. */
function bigWord(s, ctx) {
  if (!s.bigWord) return '';
  return `<div class="big">
    <span class="big-w">${esc(s.bigWord)}</span>
    <span class="big-g">${icon(s.bigIcon || 'link')}</span>
  </div>${void ctx || ''}`;
}

const TYPES = {
  hook: (s, ctx) => fitFrame(`${headline(s, ctx, 1.05)}${deckLine(s, ctx)}
    ${metaPills(s, ctx)}
    ${s.save ? `<p class="save"><i>${icon('star')}</i>${esc(s.save)}</p>` : ''}
    ${bigWord(s, ctx)}${logoChips(ctx)}`, anim(s, 'body-hook')),

  /** One connector: the wire, the tile, the three fields. The signature type. */
  entry(s, ctx) {
    const { t } = ctx;
    const mark = brandMark(s.logo, t.color.tileInk);
    const glyph = mark ? mark.html : icon(s.icon || 'link');
    return fitFrame(`
      ${wire(s, ctx)}
      <div class="ehead">
        <span class="tile">${glyph}</span>
        <span class="ename" ${fitAttr(T(ctx).name)}>${esc(s.name || '')}</span>
      </div>
      <div class="stack">
        ${field(labelFor(ctx.deck, 'does'), s.does, 'a', 'doc', ctx)}
        ${field(labelFor(ctx.deck, 'why'), s.why, 'b', 'bolt', ctx)}
        <div class="tail">
          ${recipe(s, ctx)}
          ${s.punch ? `<p class="punch" ${fitAttr(T(ctx).punch)}>${rich(s.punch)}</p>` : ''}
        </div>
      </div>`,
    anim(s, 'body-entry'));
  },

  problem: (s, ctx) => fitFrame(
    `${headline(s, ctx)}${para(s, ctx)}${rowList(s.rows, ctx, false)}${mediaCard(s, ctx.accent)}`,
    anim(s, ''),
  ),
  point: (s, ctx) => fitFrame(
    `${headline(s, ctx)}${deckLine(s, ctx)}${mediaCard(s, ctx.accent)}${rowList(s.rows, ctx, false)}${para(s, ctx)}`,
    anim(s, ''),
  ),
  steps: (s, ctx) => fitFrame(
    `${headline(s, ctx)}${para(s, ctx)}${rowList(s.steps || s.rows, ctx, true)}${mediaCard(s, ctx.accent)}`,
    anim(s, ''),
  ),
  stat(s, ctx) {
    const cells = (s.stats || []).map((v) =>
      `<div class="stat">
        <span class="stat-v" ${fitAttr(T(ctx).statValue)}>${rich(v.value)}</span>
        <span class="stat-l" ${fitAttr(T(ctx).statLabel)}>${rich(v.label)}</span></div>`).join('');
    const grid = cells
      ? `<div class="stats stats-${Math.min(2, (s.stats || []).length)}">${cells}</div>` : '';
    return fitFrame(`${headline(s, ctx)}${grid}${para(s, ctx)}`, anim(s, ''));
  },
  quote: (s, ctx) => fitFrame(`<div class="quote-wrap">
    <blockquote class="quote" ${fitAttr(T(ctx).quote)}>${rich(s.quote || s.headline)}</blockquote>
    ${s.attribution ? `<p class="attrib" ${fitAttr(T(ctx).caption)}>${esc(s.attribution)}</p>` : ''}
    </div>`, anim(s, 'body-quote')),

  cta: (s, ctx) => fitFrame(`${headline(s, ctx, 1.05)}${deckLine(s, ctx)}
    ${s.action ? `<p class="action" ${fitAttr(T(ctx).name, 0.62)}>${esc(s.action)}</p>` : ''}
    ${para(s, ctx)}${logoChips(ctx)}`, anim(s, 'body-cta')),
};

export const SLIDE_TYPES = Object.keys(TYPES);

/**
 * The counter chip. On an entry it names the position in the connector run,
 * which is a different count from the slide number in the footer — the hook
 * and the CTA are not connectors and must not consume a number.
 */
function header(slide, ctx) {
  const { deck } = ctx;
  if (slide.type === 'entry') {
    const label = deck.unit || 'Connector';
    return `<header class="hdr"><span class="ctr">
      <b>${esc(label)} ${pad(entryNumber(deck, slide, ctx.index))}/${pad(entryTotal(deck))}</b>
      <span>${esc(slide.name || '')}</span></span></header>`;
  }
  const text = slide.eyebrow || deck.brand || '';
  return `<header class="hdr">${text ? `<span class="eyb">${esc(text)}</span>` : '<span></span>'}</header>`;
}

/**
 * Handle, a segmented progress bar, and the swipe chevrons.
 *
 * The bar is the deck's own length, one segment per slide — a reader can see
 * how much is left without counting. The chevrons are suppressed on the last
 * slide: a deck still saying "swipe" with nothing left to swipe to reads as a
 * deck that lost count of itself.
 */
const footer = (ctx) => {
  const last = ctx.index + 1 >= ctx.total;
  const segs = Array.from({ length: ctx.total }, (_, i) =>
    `<i class="${i <= ctx.index ? 'on' : ''}"></i>`).join('');
  return `<footer class="ftr">
    <span class="fh">${esc(ctx.deck.handle || '')}</span>
    <span class="bar">${segs}</span>
    <span class="chev">${last ? esc(ctx.deck.footnote || '') : '&raquo;&raquo;&raquo;'}</span>
  </footer>`;
};

export function slideHTML(slide, ctx) {
  const build = TYPES[slide.type];
  if (!build) throw new Error(`Unknown slide type "${slide.type}". This theme has: ${SLIDE_TYPES.join(', ')}`);
  return `${header(slide, ctx)}${build(slide, ctx)}${objectVisual(slide, ctx.t, ctx.deck)}${footer(ctx)}`;
}

export function css(ctx) {
  const { t, accent, fontFaces, textureCSS } = ctx;
  const c = t.color, sp = t.space, ty = t.type, r = t.radius, cv = t.canvas;
  const D = (t.animate && t.animate.seconds) || 4;
  // Four is the recipe cap, so four offsets is the whole ladder. The last one
  // must still land inside the hold window or the still would screenshot a
  // step mid-flight.
  const stepStagger = Array.from({ length: 4 }, (_, i) =>
    `.is-anim .rcp-steps li:nth-child(${i + 1}) { animation-delay:${(0.18 + i * 0.09).toFixed(3)}s; }`).join('\n');

  return `${fontFaces}
${baseCSS(t)}
body { background:${c.bg}; color:${c.ink}; font-family:Body, system-ui, sans-serif; }

/* The paper is ruled, faintly. It is what makes the surface read as a sheet
   rather than as a flat fill, and it is the only decoration on the page. */
body::before { content:""; position:absolute; inset:0; z-index:0; pointer-events:none;
  background-image:repeating-linear-gradient(0deg, ${c.rule}00 0 43px, ${c.rule}55 43px 44px); }

.hdr, .ftr { position:absolute; left:${cv.margin}px; right:${cv.margin}px; z-index:40;
  display:flex; align-items:center; }
.hdr { top:${Math.round(cv.safeTop * 0.36)}px; }
.eyb { font-family:MonoBold; font-size:${ty.eyebrow.size}px; letter-spacing:${ty.eyebrow.tracking}em;
  text-transform:uppercase; color:${accent}; }
.ctr { display:inline-flex; align-items:center; gap:9px; background:${c.chrome};
  border:1px solid ${c.rule}; border-radius:99px; padding:7px 15px;
  font-family:Mono; font-size:${ty.eyebrow.size}px; letter-spacing:.1em; color:${c.inkFaint}; }
.ctr b { font-family:MonoBold; text-transform:uppercase; color:${accent}; }
.ctr span { font-family:BodyMid; letter-spacing:0; color:${c.ink}; }

.ftr { bottom:${Math.round(cv.safeBottom * 0.3)}px; justify-content:space-between; gap:${sp.md}px;
  font-family:Mono; font-size:${ty.footer.size}px; letter-spacing:${ty.footer.tracking}em;
  color:${c.inkFaint}; }
.fh { flex:0 0 auto; }
.bar { flex:1 1 auto; display:flex; gap:5px; align-items:center; }
.bar i { flex:1 1 0; height:4px; border-radius:99px; background:${c.rule}; }
.bar i.on { background:${accent}; }
.chev { flex:0 0 auto; color:${accent}; letter-spacing:.02em; }

.body { justify-content:flex-start; top:${Math.round(cv.safeTop + 26)}px; }
.body-hook, .body-cta, .body-quote { justify-content:center; }
.fit { gap:${sp.sm}px; }

.hl { font-family:Display; font-weight:800; font-size:${ty.headline.size}px;
  line-height:${ty.headline.leading}; letter-spacing:${ty.headline.tracking}em; color:${c.ink};
  text-wrap:balance; }
.ac { color:${accent}; }
.deck { font-family:Body; font-size:${ty.deck.size}px; line-height:${ty.deck.leading};
  color:${c.inkSoft}; }
.deck b, .para b, .deck .ac, .para .ac { color:${c.ink}; font-weight:600; font-family:BodyMid; }
.para { font-family:Body; font-size:${ty.body.size}px; line-height:${ty.body.leading}; color:${c.inkSoft}; }

/* the wire */
.wire { display:flex; align-items:center; gap:9px; font-family:Mono;
  font-size:${ty.wire.size}px; letter-spacing:${ty.wire.tracking}em;
  text-transform:uppercase; color:${c.inkFaint}; }
.pin { width:9px; height:9px; border-radius:99px; background:${c.wire}; flex:0 0 auto; }
.pin-on { background:${accent}; }
.wrun { flex:1 1 auto; border-top:2px dashed ${c.wire}; height:0; }
.wgt { color:${accent}; font-family:MonoBold; }
.wl-to { color:${c.inkSoft}; }

/* the entry head */
.ehead { display:flex; align-items:center; gap:${sp.md}px; margin-top:${sp.xs}px; }
.tile { flex:0 0 auto; width:70px; height:70px; border-radius:${r.md}px;
  display:grid; place-items:center; background:${c.tile}; color:${c.tileInk}; }
.tile svg, .tile img { width:36px; height:36px; object-fit:contain; }
.ename { font-family:Display; font-weight:800; font-size:${ty.name.size}px;
  line-height:${ty.name.leading}; letter-spacing:${ty.name.tracking}em; color:${c.ink}; }

/* ── the three fields ─────────────────────────────────────────────────
   A height floor on the stack, not flex:1 on the fit wrapper. The wrapper
   sizes to content by design, and forcing it to fill would make the fit pass
   measure zero overflow forever. Without the floor the form renders correct
   and top-heavy, with the bottom third of every entry empty, because .body
   is flex-start here and all the slack lands under the last element.

   The floor is set so the stack plus the wire and the head very nearly fill
   the box, which means the grow pass has nothing to do and the type tokens
   above are the sizes that actually ship. Longer copy still overflows and
   still shrinks — a min-height does not stop that. */
.stack { display:flex; flex-direction:column; gap:${sp.md}px;
  min-height:${Math.round(cv.height * 0.66)}px; }
/* The two prose fields sit snug at the top; the recipe and its closing line
   are pushed to the floor. One deliberate gap, always in the same place,
   rather than space-between spreading the slack into three uneven ones that
   change size with the length of the copy.

   The payoff is that the recipe box lands at an identical y on every entry.
   Swiping six slides of a fixed schema, the instructions never move — which
   is the whole reason the schema is fixed. */
.tail { margin-top:auto; display:flex; flex-direction:column; gap:${sp.md}px; }
.fld { border-radius:${r.md}px; padding:${sp.md}px; display:flex; flex-direction:column;
  gap:${sp.sm}px; }
.fld-a { background:${c.fieldA}; }
.fld-b { background:${c.fieldB}; border:1px solid ${c.rule}; }
.lab { display:inline-flex; align-items:center; align-self:flex-start; gap:7px;
  font-family:MonoBold; font-size:${ty.label.size}px; letter-spacing:${ty.label.tracking}em;
  text-transform:uppercase; border-radius:99px; padding:5px 13px; }
.lab i { display:block; width:15px; height:15px; line-height:0; }
.lab i svg { width:15px; height:15px; display:block; }
.fld-a .lab { background:${accent}; color:${c.accentInk}; }
.fld-b .lab { background:${c.accentTint}; color:${accent}; }
.ftx { font-family:Body; font-size:${ty.field.size}px; line-height:${ty.field.leading};
  color:${c.ink}; }
.ftx .ac { color:${c.ink}; font-family:BodyMid; font-weight:600; }

/* the recipe box — dashed, mono, numbered. The payload. */
.rcp { position:relative; overflow:hidden; border:2px dashed ${c.wire};
  border-radius:${r.md}px; padding:${sp.md}px; }
.rcp-lab { display:block; font-family:MonoBold; font-size:${ty.label.size}px;
  letter-spacing:${ty.label.tracking}em; text-transform:uppercase; color:${c.inkFaint};
  margin-bottom:${sp.sm}px; }
.rcp-steps { list-style:none; display:flex; flex-direction:column; gap:5px;
  position:relative; z-index:2; }
.rcp-steps li { display:flex; align-items:baseline; gap:${sp.sm}px;
  font-family:Mono; color:${c.inkSoft}; }
.rcp-steps li b { flex:0 0 auto; font-family:MonoBold; font-size:${ty.step.size}px;
  color:${accent}; width:16px; }
.doodle { position:absolute; right:${sp.md}px; bottom:${sp.sm}px; z-index:1;
  width:104px; height:104px; color:${c.wire}; opacity:.55; line-height:0; }
.doodle svg { width:104px; height:104px; stroke-width:1.1; }

/* the closing line */
.punch { font-family:Body; font-size:${ty.punch.size}px; line-height:${ty.punch.leading};
  color:${c.inkSoft}; }
.punch .ac { color:${c.ink}; font-family:BodyMid; font-weight:600; }

/* hook furniture */
.metas { display:flex; flex-wrap:wrap; gap:${sp.xs}px; margin-top:${sp.xs}px; }
.meta { display:inline-flex; align-items:center; gap:8px; font-family:MonoBold;
  font-size:${ty.chip.size}px; letter-spacing:.1em; text-transform:uppercase;
  background:${accent}; color:${c.accentInk}; border-radius:99px; padding:8px 16px; }
.meta i, .chip i { display:block; width:16px; height:16px; line-height:0; }
.meta i svg, .chip i svg { width:16px; height:16px; display:block; }
.save { display:flex; align-items:center; gap:10px; font-family:Mono;
  font-size:${ty.chip.size}px; letter-spacing:.04em; color:${c.inkSoft};
  border:2px dashed ${c.wire}; border-radius:${r.sm}px; padding:${sp.sm}px ${sp.md}px;
  margin-top:${sp.xs}px; }
.save i { display:block; width:17px; height:17px; color:${accent}; line-height:0; }
.save i svg { width:17px; height:17px; display:block; }
/* The hook's centrepiece. It was a letterspaced word in the rule colour with a
   loose glyph under it, which at this size read as a watermark somebody forgot
   to delete. The glyph now sits in a tinted disc, which gives the mark a
   centre of gravity and lets the word carry real weight without competing
   with the headline. */
.big { display:flex; flex-direction:column; align-items:center; gap:${sp.md}px;
  margin:${sp.lg}px 0; }
.big-w { font-family:Display; font-weight:800; font-size:72px; letter-spacing:.2em;
  color:${c.inkFaint}; text-transform:uppercase; padding-left:.2em; line-height:1; }
.big-g { width:132px; height:132px; border-radius:99px; background:${c.accentTint};
  color:${accent}; display:grid; place-items:center; line-height:0; }
.big-g svg { width:64px; height:64px; stroke-width:1.5; display:block; }
.chips { display:flex; flex-wrap:wrap; gap:${sp.xs}px; justify-content:center; }
.chip { display:inline-flex; align-items:center; gap:8px; font-family:Mono;
  font-size:${ty.chip.size}px; letter-spacing:.02em; color:${c.ink};
  background:${c.surface}; border:1px solid ${c.rule}; border-radius:99px;
  padding:7px 15px; }

/* rows, for the standard types */
.rows { list-style:none; display:flex; flex-direction:column; gap:${sp.xs}px; }
.row { display:flex; align-items:flex-start; gap:${sp.md}px; background:${c.surface};
  border:1px solid ${c.rule}; border-radius:${r.sm}px; padding:${sp.md}px; }
.rnum, .rico { flex:0 0 auto; font-family:MonoBold; font-size:17px; width:24px;
  padding-top:4px; color:${accent}; }
.rico svg { width:20px; height:20px; }
.rtxt { display:flex; flex-direction:column; gap:3px; min-width:0; flex:1 1 auto; }
.rname { font-family:BodyMid; font-weight:600; color:${c.ink}; }
.rbody { font-family:Body; font-size:${ty.rowBody.size}px;
  line-height:${ty.rowBody.leading}; color:${c.inkSoft}; }

.stats { display:grid; gap:${sp.sm}px; }
.stats-2 { grid-template-columns:1fr 1fr; }
.stat { background:${c.surface}; border:1px solid ${c.rule}; border-radius:${r.md}px;
  padding:${sp.md}px; display:flex; flex-direction:column; gap:5px; }
.stat-v { font-family:Display; font-weight:800; font-size:${ty.statValue.size}px;
  color:${accent}; letter-spacing:-.03em; }
.stat-l { font-family:Mono; font-size:${ty.statLabel.size}px; text-transform:uppercase;
  letter-spacing:.08em; color:${c.inkSoft}; }

.quote-wrap { border-left:5px solid ${accent}; padding-left:${sp.lg}px; }
.quote { font-family:Display; font-weight:800; font-size:${ty.quote.size}px;
  line-height:${ty.quote.leading}; text-wrap:balance; color:${c.ink}; }
.attrib { font-family:Mono; font-size:${ty.caption.size}px; text-transform:uppercase;
  letter-spacing:.12em; color:${c.inkFaint}; margin-top:${sp.sm}px; }

.action { align-self:center; font-family:Display; font-weight:800;
  letter-spacing:.06em; text-transform:uppercase; color:${accent};
  border:3px solid ${accent}; border-radius:${r.md}px;
  padding:${sp.sm}px ${sp.xl}px; margin:${sp.md}px 0; }
.body-cta .fit { align-items:center; text-align:center; }
.body-hook .fit { align-items:stretch; }

.term { background:#12161F; border-radius:${r.md}px; }
.term-bar { padding:10px ${sp.md}px; background:rgba(255,255,255,.06);
  font-family:Mono; font-size:15px; color:#8A93A3; }
.term-bar i { background:rgba(255,255,255,.2); }
.term-body { padding:${sp.md}px; gap:5px; font-size:19px; line-height:1.42; color:#D5DCE7; }
.shot { background:${c.surface}; border:1px solid ${c.rule}; border-radius:${r.md}px; }
.shot-bar { padding:10px ${sp.md}px; background:${c.chrome}; color:${c.inkFaint};
  font-family:Mono; font-size:15px; }
.shot-bar i { background:${c.rule}; }

.object { right:${Math.round(cv.margin * 0.6)}px; bottom:${Math.round(cv.safeBottom * 1.1)}px; }

/* ── motion ───────────────────────────────────────────────────────────
   Scoped to .is-anim, which only appears on a slide marked "animate": true.
   The form fills itself in reading order — wire, tile, field, field, recipe —
   and every step lands by ~55% of the cycle and holds to 100%, so the still
   the renderer screenshots is the resting design.

   Nothing starts at opacity:0. The clip loops, so frame 0 follows the held
   final frame, and coming up from nothing blanks the slide once per cycle. */
@keyframes ds-in {
  0%,  4%   { opacity:.25; transform:translateY(12px); }
  38%, 100% { opacity:1; transform:none; }
}
@keyframes ds-wire {
  0%        { opacity:.3; }
  24%, 100% { opacity:1; }
}
@keyframes ds-step {
  0%,  10%  { opacity:.2; transform:translateX(-8px); }
  55%, 100% { opacity:1; transform:none; }
}
@keyframes ds-tile {
  0%        { opacity:.4; transform:scale(.9); }
  30%, 100% { opacity:1; transform:none; }
}
.is-anim .wire { animation:ds-wire ${D}s ease-out infinite both; }
.is-anim .tile { animation:ds-tile ${D}s cubic-bezier(.2,.8,.2,1) infinite both; }
.is-anim .ename, .is-anim .hl { animation:ds-in ${D}s ease-out infinite both; }
.is-anim .fld { animation:ds-in ${D}s cubic-bezier(.2,.8,.2,1) infinite both; }
.is-anim .fld-b { animation-delay:.09s; }
.is-anim .rcp { animation:ds-in ${D}s cubic-bezier(.2,.8,.2,1) infinite both;
  animation-delay:.18s; }
.is-anim .punch { animation:ds-in ${D}s ease-out infinite both; animation-delay:.3s; }
.is-anim .meta, .is-anim .chip { animation:ds-in ${D}s ease-out infinite both; }
.is-anim .rcp-steps li { animation:ds-step ${D}s ease-out infinite both; }
${stepStagger}

${textureCSS}
`;
}
