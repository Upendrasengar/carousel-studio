// Slide templates for the index-rail theme.
//
// The signature is the left rail: a numbered chip for every entry in the
// deck's index, running the full height of the slide. Chips already passed
// carry a tick in their own section's colour; the current one grows, takes
// full colour and breaks the rail's edge. It costs a hundred pixels of width
// and buys the two things a long list deck normally lacks — a reader always
// knows how far in they are, and the sections stay legible as a shape.
//
// Everything else follows from that. The body is a fixed five-band stack:
// section kicker, numbered badge + serif title, a browser card showing the
// page itself, a one-line "what it is", and a bordered instruction. The bands
// do not reflow, which is what lets nineteen slides read as one artefact
// rather than nineteen layouts.

import {
  esc, rich, fitAttr, fitFrame, baseCSS, standardSlides, accumulate, mediaCard,
} from '../../scripts/lib/blocks.js';
import { browserCard, pagemockCSS } from '../../scripts/lib/pagemock.js';
import { icon } from '../../scripts/lib/icons.js';
import { mascotSVG } from '../../scripts/lib/mascot.js';

/* ── section colours ───────────────────────────────────────────────────
   Distinct section names, in the order they first appear, take palette
   entries in order. Deriving it beats declaring it: the deck cannot end up
   with a colour map that disagrees with its own contents. */
function sectionMap(deck, t) {
  const names = [];
  for (const it of deck.index?.items || []) {
    const s = it.section || '';
    if (!names.includes(s)) names.push(s);
  }
  const pal = t.color.sections, tints = t.color.sectionTints;
  return {
    color: (s) => pal[Math.max(0, names.indexOf(s || '')) % pal.length],
    tint: (s) => tints[Math.max(0, names.indexOf(s || '')) % tints.length],
  };
}

const CHIP_GLYPHS = ['grid', 'plus', 'search', 'calendar', 'folder', 'code'];
const GLYPH = {
  grid: '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="6.4"/><path d="M19.5 19.5l-4-4"/>',
  calendar: '<rect x="4" y="6" width="16" height="14" rx="2"/><path d="M4 11h16M9 4v4M15 4v4"/>',
  folder: '<path d="M3 7a2 2 0 012-2h4l2 2.5h8a2 2 0 012 2V18a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>',
  code: '<path d="M9 7l-5 5 5 5M15 7l5 5-5 5"/>',
};
const TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12.5l5 5L20 6.5"/></svg>';

/** The rail. Numbered when the deck has an index, an app sidebar otherwise —
 *  which is what makes the cover read as the inside of a product. */
function rail(slide, ctx) {
  const { t, deck } = ctx;
  if (slide.rail === false) return '';
  const items = deck.index?.items;
  const at = Number(slide.upto ?? slide.at ?? 0);

  let chips;
  if (items && items.length && at >= 1) {
    const sm = sectionMap(deck, t);
    chips = items.map((it, i) => {
      const n = i + 1, col = sm.color(it.section), tint = sm.tint(it.section);
      if (n < at) {
        return `<span class="rc rc-done" style="background:${col}">${TICK}</span>`;
      }
      if (n === at) {
        return `<span class="rc rc-now" style="background:${col};box-shadow:0 0 0 7px ${tint}">${n}</span>`;
      }
      return `<span class="rc rc-next">${n}</span>`;
    }).join('');
  } else {
    chips = CHIP_GLYPHS.map((g) => `<span class="rc rc-glyph">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"
        stroke-linecap="round" stroke-linejoin="round">${GLYPH[g]}</svg></span>`).join('');
  }

  const badge = deck.author
    ? `<span class="rbadge" style="background:${t.color.accent}">${esc(initials(deck.author))}</span>` : '';
  return `<aside class="rail"><div class="rchips">${chips}</div>${badge}</aside>`;
}

const initials = (a) => a.initials
  || String(a.name || '').split(/\s+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

/** Author pill. Top-right on a working slide, centred at the foot of the
 *  closer where it is the signature rather than a watermark. */
function authorPill(deck, where = 'top') {
  const a = deck.author;
  if (!a) return '';
  const face = a.avatarURI
    ? `<img class="ap-face" src="${a.avatarURI}" alt="">`
    : `<span class="ap-face ap-init">${esc(initials(a))}</span>`;
  return `<div class="apill ap-${where}">${face}<b>${esc(a.name || '')}</b>${
    a.site ? `<span>&middot; ${esc(a.site)}</span>` : ''}</div>`;
}

/** Progress dots. The active one is a capsule, not a bigger dot — at feed
 *  scale a size difference between two 12px circles is invisible. */
function dots(ctx) {
  const { total, index } = ctx;
  if (total < 2) return '';
  return `<div class="pdots">${Array.from({ length: total }, (_, i) =>
    `<i class="${i === index ? 'on' : ''}"></i>`).join('')}</div>`;
}

/** The house mark: a twelve-petal asterisk with uneven arms, so it reads as
 *  drawn rather than as a dingbat. Deterministic — the jitter is seeded. */
function sunburst(ctx, px = 130) {
  const { rng, accent } = ctx;
  const n = 12, arms = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const len = 39 + rng.int(0, 8);
    const w = 8.2 + rng.int(0, 22) / 10;
    arms.push(`<line x1="${(50 + Math.cos(a) * 5).toFixed(2)}" y1="${(50 + Math.sin(a) * 5).toFixed(2)}"
      x2="${(50 + Math.cos(a) * len).toFixed(2)}" y2="${(50 + Math.sin(a) * len).toFixed(2)}"
      stroke-width="${w.toFixed(2)}"/>`);
  }
  return `<div class="burst" style="width:${px}px"><svg viewBox="0 0 100 100"
    stroke="${accent}" stroke-linecap="round" fill="none">${arms.join('')}</svg></div>`;
}

/* ── the cover object: a tabbed manual ─────────────────────────────────
   The page tabs are the index, seen edge-on. Their colours and their counts
   come from the same list the rail is drawn from, so the object on slide one
   is a promise the rest of the deck keeps. */
function manual(ctx) {
  const { t, deck } = ctx;
  const m = deck.manual;
  if (!m) return '';
  const items = deck.index?.items || [];
  const sm = sectionMap(deck, t);
  const tabs = items.length
    ? items.map((it) => `<span class="mtab" style="background:${sm.color(it.section)}"></span>`).join('')
    : '';
  const px = Math.round(t.canvas.width * (t.objectSize || 0.5));
  return `<div class="manual" data-decor="object" style="width:${px}px">
    <div class="mbook">
      <span class="mspine" style="background:${t.color.accent}"></span>
      <div class="mface">
        ${m.brand ? `<span class="mbrand" style="color:${t.color.accent}">${esc(m.brand)}</span>` : ''}
        <span class="mtitle">${rich(m.title || '')}</span>
        <span class="mrule"></span>
        ${m.caption ? `<span class="mcap">${esc(m.caption)}</span>` : ''}
      </div>
      <div class="mtabs">${tabs}</div>
    </div>
    ${m.mascot === false ? '' : `<div class="msticker">${mascotSVG(m.mascot || 'idle', 6)}</div>`}
  </div>`;
}

/* ── parts ─────────────────────────────────────────────────────────── */

const kicker = (s, ctx, col) => {
  if (!s.kicker && !s.eyebrow) return '';
  const badge = s.badge
    ? `<span class="kpill" style="background:${col}">${esc(s.badge)}</span>` : '';
  return `<div class="krow"><span class="kick" style="color:${col}"
    ${fitAttr(ctx.t.type.eyebrow)}>${esc(s.kicker || s.eyebrow)}</span>${badge}</div>`;
};

const titleRow = (s, ctx, col, num) => {
  if (!s.title && !s.headline) return '';
  const n = num == null ? '' : `<span class="numbadge" style="background:${col}">${
    String(num).padStart(2, '0')}</span>`;
  return `<div class="trow">${n}<h2 class="title" ${fitAttr(ctx.t.type.title)}>${
    rich(s.title || s.headline)}</h2></div>`;
};

const whatLine = (s, ctx, col) => (s.what
  ? `<p class="what" ${fitAttr(ctx.t.type.what)}><span class="wlab" style="color:${col}">${
    esc(s.whatLabel || 'What it is')}</span>${rich(s.what)}</p>` : '');

const startBox = (s, ctx, col) => (s.start
  ? `<div class="sbox" style="--bar:${col}">
      <span class="slab" style="color:${col}">${esc(s.startLabel || 'Start here')}</span>
      <span class="stxt" ${fitAttr(ctx.t.type.start)}>${rich(s.start)}</span>
    </div>` : '');

/* Newlines in a headline are honoured as breaks. On a cover and a closer the
   line turns is the composition — leaving it to text-wrap:balance means the
   same copy breaks differently the moment a word changes length. */
function headline(s, ctx, mul = 1) {
  if (!s.headline) return '';
  const body = String(s.headline).split('\n').map((l) => rich(l)).join('<br>');
  return `<h1 class="hl" ${fitAttr(ctx.t.type.headline, mul)}>${body}</h1>`;
}
const deckLine = (s, ctx) => (s.deck
  ? `<p class="deck" ${fitAttr(ctx.t.type.deck)}>${rich(s.deck)}</p>` : '');
const para = (s, ctx) => (s.body
  ? `<p class="para" ${fitAttr(ctx.t.type.body)}>${rich(s.body)}</p>` : '');

function rows(s, ctx, numbered) {
  const list = numbered ? (s.steps || s.rows) : s.rows;
  if (!list || !list.length) return '';
  const { t } = ctx;
  const pal = t.color.sections, tints = t.color.sectionTints;
  return `<ul class="rows">${list.map((r, i) => {
    const col = pal[i % pal.length], tint = tints[i % tints.length];
    const badge = numbered
      ? `<span class="rchip" style="background:${col};color:#fff">${i + 1}</span>`
      : `<span class="rchip" style="background:${tint};color:${col}">${icon(r.icon || 'check')}</span>`;
    return `<li class="row">${badge}<span class="rtxt">
      <span class="rt" ${fitAttr(t.type.rowTitle)}>${rich(r.title)}</span>
      ${r.body ? `<span class="rb" ${fitAttr(t.type.rowBody)}>${rich(r.body)}</span>` : ''}
    </span></li>`;
  }).join('')}</ul>`;
}

function stats(s, ctx) {
  const list = s.stats || [];
  if (!list.length) return '';
  const { t } = ctx;
  return `<div class="stats stats-${Math.min(2, list.length)}">${list.map((v, i) => {
    const col = t.color.sections[i % t.color.sections.length];
    return `<div class="stat">
      <span class="stat-v" style="color:${col}" ${fitAttr(t.type.statValue)}>${rich(v.value)}</span>
      <span class="stat-l" ${fitAttr(t.type.statLabel)}>${rich(v.label)}</span></div>`;
  }).join('')}</div>`;
}

/** The call to action's keyword sits in a bordered mono chip — the reference
 *  deck's one loud element, and the thing a reader is meant to type back. */
function action(s, ctx) {
  if (!s.action) return '';
  const { t } = ctx;
  const txt = esc(s.action).replace(/\[([^\]]+)\]/g,
    `<span class="kchip" style="color:${t.color.accent};background:${t.color.sectionTints[1]};border-color:${t.color.accent}">$1</span>`);
  return `<p class="action" ${fitAttr(t.type.deck, 1.12)}>${txt}</p>`;
}

/* ── slide types ───────────────────────────────────────────────────── */

const STD = standardSlides({
  headline, headlineXL: (s, c) => headline(s, c, 1.06), deckLine, para,
  rows: (s, c) => rows(s, c, false),
  steps: (s, c) => rows(s, c, true),
  stats, action,
  media: (s, c) => (s.page
    ? browserCard(s.page, { tint: c.tint, radius: c.t.radius.lg, height: s.pageHeight || c.t.page.height })
    : mediaCard(s, c.accent)),
  quote: (s, c) => `<blockquote class="quote" ${fitAttr(c.t.type.quote)}>${
    rich(s.quote || s.headline)}</blockquote>${s.attribution
    ? `<p class="attrib">${esc(s.attribution)}</p>` : ''}`,
});

const TYPES = {
  ...STD,

  /** The cover. */
  hook: (s, ctx) => `${fitFrame(
    `${sunburst(ctx, 132)}${kicker(s, ctx, ctx.t.color.accent)}${headline(s, ctx, 1.06)}${deckLine(s, ctx)}`,
    'body-hook')}${manual(ctx)}`,

  /** The signature: one entry from the deck's index, drawn in five bands. */
  guide(s, ctx) {
    const { t, deck } = ctx;
    const at = Number(s.upto);
    const items = deck.index?.items || [];
    const it = items[at - 1];
    if (!it) {
      throw new Error(`guide slide has upto=${s.upto}, but deck.index.items has ${items.length} entries.`);
    }
    const sm = sectionMap(deck, t);
    const col = sm.color(it.section), tint = sm.tint(it.section);
    const merged = { ...it, ...s, kicker: s.kicker || it.section, title: s.title || it.title };
    const card = browserCard(merged.page, {
      tint, radius: t.radius.lg, height: merged.pageHeight || t.page.height,
    });
    return fitFrame(
      `${kicker(merged, ctx, col)}${titleRow(merged, ctx, col, at)}${card}${
        whatLine(merged, ctx, col)}${startBox(merged, ctx, col)}`,
      'body-guide');
  },

  /** The closer. */
  cta: (s, ctx) => fitFrame(
    `${sunburst(ctx, 156)}${headline(s, ctx, 1.06)}${deckLine(s, ctx)}${action(s, ctx)}`,
    'body-cta'),
};

export const SLIDE_TYPES = Object.keys(TYPES);

export function slideHTML(slide, ctx) {
  const build = TYPES[slide.type];
  if (!build) throw new Error(`Unknown slide type "${slide.type}". This theme has: ${SLIDE_TYPES.join(', ')}`);
  const { t, deck } = ctx;
  // `tint` is what a standard type reaches for when it draws a browser card
  // without an index entry to take its colour from.
  ctx.tint = t.color.sectionTints[1];
  const closer = slide.type === 'cta';
  const body = build(slide, ctx);
  return `<div class="field"></div>${closer ? '' : rail(slide, ctx)}
    ${authorPill(deck, closer ? 'foot' : 'top')}
    ${body}${dots(ctx)}`;
}

export function css(ctx) {
  const { t, fontFaces, textureCSS } = ctx;
  const c = t.color, sp = t.space, ty = t.type, r = t.radius, cv = t.canvas, rl = t.rail;
  const left = rl.width + t.canvas.margin;

  return `${fontFaces}
${baseCSS(t)}
${pagemockCSS({ paper: c.surface })}
:root { --chromebar:${c.chromeBar}; --chromedot:${c.chromeDot}; }

body { background:${c.bg}; color:${c.ink}; font-family:Body, system-ui, sans-serif; }

/* Graph paper plus one warm bloom in the top-right corner. Both are flat
   gradients, so they cost nothing and never band. */
.field { position:absolute; inset:0; z-index:0;
  background:
    radial-gradient(58% 42% at 88% 6%, ${c.blush} 0%, transparent 70%),
    repeating-linear-gradient(to right, ${c.grid} 0 1px, transparent 1px 52px),
    repeating-linear-gradient(to bottom, ${c.grid} 0 1px, transparent 1px 52px); }

/* ── rail ─────────────────────────────────────────────────────────── */
.rail { position:absolute; left:0; top:0; bottom:0; width:${rl.width}px; z-index:25;
  background:${c.rail}; border-right:1px solid ${c.rule}; }
.rchips { position:absolute; left:0; right:0; top:${rl.top}px;
  display:flex; flex-direction:column; align-items:center; }
.rc { width:${rl.chip}px; height:${rl.chip}px; border-radius:15px;
  flex:0 0 auto; margin-bottom:${rl.gap - rl.chip}px;
  display:grid; place-items:center;
  font-family:BodyBold; font-weight:700; font-size:27px; color:#fff; }
.rc svg { width:26px; height:26px; }
.rc-done { opacity:.45; }
.rc-now { width:${rl.chipCurrent}px; height:${rl.chipCurrent}px; border-radius:18px;
  font-size:31px; margin:-5px 0 ${rl.gap - rl.chip - 5}px; }
.rc-next { background:${c.rule}; opacity:.5; color:${c.inkSoft}; }
.rc-glyph { background:transparent; color:${c.inkFaint}; }
.rc-glyph svg { width:30px; height:30px; }
.rbadge { position:absolute; left:50%; transform:translateX(-50%);
  bottom:${Math.round(cv.safeBottom * 0.44)}px;
  width:58px; height:58px; border-radius:50%; display:grid; place-items:center;
  font-family:BodyBold; font-weight:700; font-size:24px; color:${c.accentInk};
  letter-spacing:.02em; }

/* ── author pill ──────────────────────────────────────────────────── */
.apill { position:absolute; z-index:40; display:flex; align-items:center; gap:11px;
  background:${c.surface}; border-radius:60px; padding:9px 22px 9px 9px;
  box-shadow:0 12px 30px -18px rgba(30,22,14,.5);
  font-family:Body; font-size:19px; color:${c.inkSoft}; white-space:nowrap; }
.apill b { font-family:BodyBold; font-weight:700; color:${c.ink};
  letter-spacing:.04em; text-transform:uppercase; }
.ap-face { width:42px; height:42px; border-radius:50%; flex:0 0 auto;
  object-fit:cover; display:grid; place-items:center; }
.ap-init { background:${c.accent}; color:${c.accentInk};
  font-family:BodyBold; font-weight:700; font-size:17px; }
.ap-top { top:${Math.round(cv.safeBottom * 0.3)}px; right:${t.canvas.margin - 12}px; }
.ap-foot { left:50%; transform:translateX(-50%); bottom:${Math.round(cv.safeBottom * 0.62)}px; }

/* ── progress dots ────────────────────────────────────────────────── */
.pdots { position:absolute; left:${left}px; right:${t.canvas.margin}px;
  bottom:${Math.round(cv.safeBottom * 0.3)}px; z-index:40;
  display:flex; justify-content:center; align-items:center; gap:9px; }
.pdots i { width:11px; height:11px; border-radius:50%; background:${c.rule}; }
.pdots i.on { width:31px; border-radius:6px; background:${c.accent}; }

/* ── body ─────────────────────────────────────────────────────────── */
.body { left:${left}px; right:${t.canvas.margin}px;
  top:${cv.safeTop}px; bottom:${cv.safeBottom}px; justify-content:flex-start; }
.fit { gap:${sp.md}px; }
.body-cta { justify-content:center; }
/* The cover reads top-down: mark, kicker, headline, deck, then the object
   fills the lower half. Centring the column would push the copy into it. */
/* The copy box stops short of half height. Without that floor the growth
   pass has the whole page to fill and swells the headline until it crowds
   the object — the fit pass cannot see an absolutely positioned book. */
.body-hook { justify-content:flex-start; padding-top:${sp.md}px; bottom:47%; }
.body-hook .fit { gap:${sp.sm}px; }
.body-hook .hl, .body-hook .deck { max-width:80%; }
/* The closer drops the rail, so its column takes the whole page back. */
.body-cta { left:${t.canvas.margin}px; align-items:center; text-align:center; }
.body-cta .fit { gap:${sp.md}px; align-items:center; }
.body-guide .fit { gap:${sp.md}px; }

.burst { line-height:0; margin-bottom:${sp.sm}px;
  filter:drop-shadow(0 10px 16px rgba(140,70,40,.22)); }
.body-cta .burst { margin-bottom:${sp.lg}px; }

.krow { display:flex; align-items:center; gap:${sp.sm}px; }
.kick { font-family:BodyBold; font-weight:700; letter-spacing:${ty.eyebrow.tracking}em;
  text-transform:uppercase; }
.kpill { font-family:MonoBold; font-weight:700; font-size:${ty.pill.size - 2}px;
  letter-spacing:${ty.pill.tracking}em; text-transform:uppercase; color:${c.accentInk};
  padding:7px 13px 6px; border-radius:${r.sm}px; white-space:nowrap; }

.trow { display:flex; align-items:center; gap:${sp.md}px; }
.numbadge { flex:0 0 auto; width:104px; height:100px; border-radius:${r.lg}px;
  display:grid; place-items:center; color:${c.accentInk};
  font-family:BodyBold; font-weight:700; font-size:56px; letter-spacing:-.01em;
  box-shadow:0 14px 28px -18px rgba(30,22,14,.6); }
.title { font-family:Display, serif; font-weight:700;
  line-height:${ty.title.leading}; letter-spacing:${ty.title.tracking}em;
  text-wrap:balance; }

.hl { font-family:Display, serif; font-weight:700; font-size:${ty.headline.size}px;
  line-height:${ty.headline.leading}; letter-spacing:${ty.headline.tracking}em;
  text-wrap:balance; }
.ac { color:${c.accent}; }
.deck { font-family:Body; font-size:${ty.deck.size}px; line-height:${ty.deck.leading};
  color:${c.inkSoft}; max-width:82%; }
.body-cta .deck { max-width:100%; }
.para { font-family:Body; font-size:${ty.body.size}px; line-height:${ty.body.leading};
  color:${c.inkSoft}; max-width:90%; }

.what { font-family:Display, serif; font-weight:700; line-height:${ty.what.leading};
  color:${c.ink}; }
.wlab { font-family:BodyBold; font-weight:700; font-size:.62em;
  letter-spacing:.13em; text-transform:uppercase; margin-right:.5em;
  vertical-align:.1em; }

/* The bar is a separate element rather than a border so it can round on all
   four corners and stand slightly proud of the card, which is what makes the
   box read as bracketed instead of underlined down one side. */
.sbox { position:relative; background:${c.surface}; border-radius:${r.md}px;
  padding:${sp.md}px ${sp.lg}px ${sp.md + 2}px ${sp.lg}px; margin-left:9px;
  box-shadow:0 16px 34px -26px rgba(30,22,14,.55);
  display:flex; flex-direction:column; gap:7px; }
.sbox::before { content:''; position:absolute; left:-9px; top:-7px; bottom:-7px;
  width:11px; border-radius:6px; background:var(--bar); }
.slab { font-family:BodyBold; font-weight:700; font-size:${ty.pill.size}px;
  letter-spacing:.14em; text-transform:uppercase; }
.stxt { font-family:BodyBold; font-weight:700; line-height:${ty.start.leading};
  color:${c.ink}; }

.action { font-family:BodyBold; font-weight:700; color:${c.ink};
  line-height:1.34; margin-top:${sp.xs}px; }
.kchip { font-family:MonoBold; font-weight:700; font-size:.92em;
  letter-spacing:.06em; border:2px solid; border-radius:${r.sm}px;
  padding:4px 14px 3px; margin:0 6px; }

.rows { list-style:none; display:flex; flex-direction:column; gap:${sp.sm}px; }
.row { display:flex; gap:${sp.md}px; align-items:flex-start;
  background:${c.surface}; border-radius:${r.md}px; padding:${sp.sm + 2}px ${sp.md}px;
  box-shadow:0 12px 26px -22px rgba(30,22,14,.5); }
.rchip { flex:0 0 auto; width:58px; height:58px; border-radius:15px;
  display:grid; place-items:center; font-family:BodyBold; font-weight:700; font-size:26px; }
.rchip svg { width:28px; height:28px; }
.rtxt { display:flex; flex-direction:column; gap:3px; padding-top:4px; }
.rt { font-family:BodyBold; font-weight:700; line-height:${ty.rowTitle.leading}; color:${c.ink}; }
.rb { font-family:Body; line-height:${ty.rowBody.leading}; color:${c.inkSoft}; }

.stats { display:grid; gap:${sp.sm}px; }
.stats-2 { grid-template-columns:1fr 1fr; }
.stat { background:${c.surface}; border-radius:${r.md}px; padding:${sp.md}px ${sp.lg}px;
  display:flex; flex-direction:column; gap:6px;
  box-shadow:0 14px 30px -24px rgba(30,22,14,.5); }
.stat-v { font-family:Display, serif; font-weight:700;
  line-height:${ty.statValue.leading}; letter-spacing:-.03em; }
.stat-l { font-family:BodyBold; font-weight:700; text-transform:uppercase;
  letter-spacing:.08em; color:${c.inkSoft}; }

.quote { font-family:Display, serif; font-weight:700; line-height:${ty.quote.leading};
  text-wrap:balance; background:${c.surface}; border-radius:${r.md}px;
  padding:${sp.lg}px; border-left:11px solid ${c.accent};
  box-shadow:0 18px 38px -28px rgba(30,22,14,.55); }
.attrib { font-family:BodyBold; font-weight:700; font-size:${ty.caption.size}px;
  text-transform:uppercase; letter-spacing:.12em; color:${c.inkFaint};
  margin-top:${sp.sm}px; }

/* ── the cover object ─────────────────────────────────────────────── */
.manual { position:absolute; right:${Math.round(t.canvas.margin * 1.15)}px;
  bottom:${Math.round(cv.safeBottom * 1.05)}px; z-index:20; }
.mbook { position:relative; display:flex; border-radius:5px 12px 12px 5px;
  transform:rotate(-3.2deg); background:#FBF7EF;
  box-shadow:0 34px 60px -34px rgba(40,28,16,.55), 0 3px 0 0 #E2D9C8; }
.mspine { flex:0 0 auto; width:8.5%; border-radius:5px 0 0 5px; }
.mface { flex:1; display:flex; flex-direction:column; gap:11px;
  padding:14% 12% 12% 11%; }
.mbrand { font-family:MonoBold; font-weight:700; font-size:20px; letter-spacing:.24em; }
.mtitle { font-family:Display, serif; font-weight:700; font-size:50px;
  line-height:1.02; letter-spacing:-.02em; color:${c.ink}; white-space:pre-line; }
.mrule { height:1px; background:${c.rule}; margin:5px 0 2px; }
.mcap { font-family:Mono, monospace; font-size:19px; color:${c.inkSoft}; }
.mtabs { position:absolute; right:-13px; top:9%; bottom:9%;
  display:flex; flex-direction:column; justify-content:space-between; }
.mtab { width:44px; height:11px; border-radius:2px;
  box-shadow:0 1px 0 rgba(0,0,0,.12); }
/* Eight zero-blur shadows in a ring make the solid white sticker edge that
   drop-shadow has no spread parameter for. The ninth is the real shadow. */
.msticker { position:absolute; right:-13%; bottom:-15%; line-height:0;
  filter:drop-shadow(4px 0 0 #fff) drop-shadow(-4px 0 0 #fff)
         drop-shadow(0 4px 0 #fff) drop-shadow(0 -4px 0 #fff)
         drop-shadow(3px 3px 0 #fff) drop-shadow(-3px -3px 0 #fff)
         drop-shadow(3px -3px 0 #fff) drop-shadow(-3px 3px 0 #fff)
         drop-shadow(0 16px 20px rgba(40,28,16,.32)); }

${textureCSS}
`;
}
