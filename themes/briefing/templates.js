// Slide templates for the briefing theme.
//
// One inset paper card on a warm grey ground, and inside it a fixed rhythm:
// kicker, two-tone headline, standfirst, exhibit, closing line. The exhibit is
// the point. Everything else is set up so that when the reader reaches it,
// there is nothing else on the slide competing for the look.
//
// The two-tone headline — first line accent, second line ink — is the pack's
// signature and it only works on two lines. One line loses the device; three
// makes the accent a colour wash rather than an emphasis. Write to two.

import {
  esc, rich, fitAttr, fitFrame, baseCSS, standardSlides, mediaCard,
} from '../../scripts/lib/blocks.js';
import { exhibit, exhibitCSS } from '../../scripts/lib/exhibits.js';
import { icon } from '../../scripts/lib/icons.js';

/* ── chrome ────────────────────────────────────────────────────────────
   Folio, registration dots, rule and byline sit on the card, not in the
   content column, so nothing an author writes can push them around. */

const DOTGRID = (() => {
  const d = [];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 8; c++) d.push(`<circle cx="${c * 20 + 3}" cy="${r * 20 + 3}" r="2.6"/>`);
  }
  return `<svg class="dotgrid" viewBox="0 0 150 90" fill="currentColor">${d.join('')}</svg>`;
})();

function chrome(slide, ctx) {
  const { deck, index, t } = ctx;
  const folio = deck.showCounter === false ? ''
    : `<span class="folio">${String(index + 1).padStart(2, '0')}</span>`;
  const mark = deck.mark || deck.brand;
  return `<div class="card"></div>
    ${folio}${DOTGRID}
    <div class="byline">
      ${mark ? `<span class="bmark" style="color:${t.color.accent}">${esc(mark)}</span>` : '<span></span>'}
      ${deck.handle ? `<span class="bhandle">${esc(deck.handle)}</span>` : ''}
    </div>`;
}

/** The app tile: a rounded-square icon in the accent, with the house burst.
 *  Cover only — it is the deck's logo, and a logo repeated nine times is
 *  wallpaper. */
function appTile(ctx) {
  const { t } = ctx;
  const arms = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const len = 38 + (i % 3) * 3;
    arms.push(`<line x1="${(50 + Math.cos(a) * 7).toFixed(1)}" y1="${(50 + Math.sin(a) * 7).toFixed(1)}"
      x2="${(50 + Math.cos(a) * len).toFixed(1)}" y2="${(50 + Math.sin(a) * len).toFixed(1)}"/>`);
  }
  return `<div class="tile" style="background:${t.color.accent}"><svg viewBox="0 0 100 100"
    fill="none" stroke="${t.color.paper}" stroke-width="9" stroke-linecap="round">${arms.join('')}</svg></div>`;
}

/* ── parts ─────────────────────────────────────────────────────────── */

const kicker = (s, ctx) => (s.kicker || s.eyebrow
  ? `<span class="kick" ${fitAttr(ctx.t.type.eyebrow)}>${esc(s.kicker || s.eyebrow)}</span>` : '');

/* Line one takes the accent, line two the ink. Splitting on the newline is
   deliberate: leaving the turn to text-wrap means the colour break lands
   wherever the measure happens to fall, and the device stops being a
   decision. */
function headline(s, ctx, mul = 1) {
  if (!s.headline) return '';
  const [a, ...rest] = String(s.headline).split('\n');
  const b = rest.join(' ');
  return `<h1 class="hl" ${fitAttr(ctx.t.type.headline, mul)}>
    <span class="hl-1">${rich(a)}</span>${b ? `<span class="hl-2">${rich(b)}</span>` : ''}</h1>`;
}

const deckLine = (s, ctx) => (s.deck
  ? `<p class="deck" ${fitAttr(ctx.t.type.deck)}>${rich(s.deck)}</p>` : '');
const para = (s, ctx) => (s.body
  ? `<p class="para" ${fitAttr(ctx.t.type.body)}>${rich(s.body)}</p>` : '');
const source = (s, ctx) => (s.source
  ? `<p class="source" ${fitAttr(ctx.t.type.source)}>${esc(s.source)}</p>` : '');

/** Content width in px — the exhibits compute their geometry from it and
 *  never measure the DOM, which is what keeps them stable in panorama mode. */
const columnWidth = (t) => t.canvas.width - t.canvas.margin * 2;

const showcase = (s, ctx) => (s.exhibit
  ? `<div class="exwrap">${exhibit(s.exhibit, columnWidth(ctx.t))}</div>`
  : mediaCard(s, ctx.accent));

function rows(s, ctx, numbered) {
  const list = numbered ? (s.steps || s.rows) : s.rows;
  if (!list || !list.length) return '';
  const { t } = ctx;
  return `<ul class="rows">${list.map((r, i) => `<li class="row">
    <span class="rchip">${numbered ? i + 1 : icon(r.icon || 'check')}</span>
    <span class="rtxt">
      <span class="rt" ${fitAttr(t.type.rowTitle)}>${rich(r.title)}</span>
      ${r.body ? `<span class="rb" ${fitAttr(t.type.rowBody)}>${rich(r.body)}</span>` : ''}
    </span></li>`).join('')}</ul>`;
}

/** Figures as a two-up grid of cards. Four is the shape this is built for;
 *  two reads fine, three leaves a hole. */
function stats(s, ctx) {
  const list = s.stats || [];
  if (!list.length) return '';
  const { t } = ctx;
  return `<div class="figs">${list.map((v) => `<div class="fig">
    <span class="fig-v" ${fitAttr(t.type.statValue)}>${rich(v.value)}</span>
    <span class="fig-l" ${fitAttr(t.type.statLabel)}>${rich(v.label)}</span>
  </div>`).join('')}</div>`;
}

/** `[brackets]` become the solid keyword pill — the one thing on the closing
 *  slide a reader is meant to type back. */
function action(s, ctx) {
  if (!s.action) return '';
  const { t } = ctx;
  const txt = esc(s.action).replace(/\[([^\]]+)\]/g,
    `<span class="kpill" style="background:${t.color.accent};color:${t.color.accentInk}">$1</span>`);
  return `<p class="action" ${fitAttr(t.type.deck, 1.24)}>${txt}</p>`;
}

const follow = (s, ctx) => (s.follow
  ? `<p class="follow" ${fitAttr(ctx.t.type.caption)}>${esc(s.follow)}</p>` : '');

/* ── slide types ───────────────────────────────────────────────────── */

const STD = standardSlides({
  headline, deckLine, para, stats, action,
  rows: (s, c) => rows(s, c, false),
  steps: (s, c) => rows(s, c, true),
  media: showcase,
  quote: (s, c) => `${kicker(s, c)}<blockquote class="quote" ${fitAttr(c.t.type.quote)}>${
    rich(s.quote || s.headline)}</blockquote>${s.attribution
    ? `<p class="attrib">${esc(s.attribution)}</p>` : ''}`,
});

const TYPES = {
  ...STD,

  hook: (s, ctx) => fitFrame(
    `${kicker(s, ctx)}${headline(s, ctx)}${appTile(ctx)}${deckLine(s, ctx)}`, 'body-hook'),

  /** The signature: one drawn exhibit, framed by the copy that sets it up and
   *  the line that draws the conclusion. */
  exhibit: (s, ctx) => fitFrame(
    `${kicker(s, ctx)}${headline(s, ctx)}${deckLine(s, ctx)}${showcase(s, ctx)}${
      para(s, ctx)}${source(s, ctx)}`, 'body-exhibit'),

  stat: (s, ctx) => fitFrame(
    `${kicker(s, ctx)}${headline(s, ctx)}${deckLine(s, ctx)}${stats(s, ctx)}${
      para(s, ctx)}${source(s, ctx)}`, 'body-stat'),

  point: (s, ctx) => fitFrame(
    `${kicker(s, ctx)}${headline(s, ctx)}${deckLine(s, ctx)}${showcase(s, ctx)}${
      rows(s, ctx, false)}${para(s, ctx)}`, 'body-point'),
  problem: (s, ctx) => fitFrame(
    `${kicker(s, ctx)}${headline(s, ctx)}${deckLine(s, ctx)}${rows(s, ctx, false)}${
      showcase(s, ctx)}${para(s, ctx)}`, 'body-problem'),
  steps: (s, ctx) => fitFrame(
    `${kicker(s, ctx)}${headline(s, ctx)}${deckLine(s, ctx)}${rows(s, ctx, true)}${
      showcase(s, ctx)}`, 'body-steps'),

  cta: (s, ctx) => fitFrame(
    `${kicker(s, ctx)}${headline(s, ctx)}${deckLine(s, ctx)}${action(s, ctx)}${follow(s, ctx)}`,
    'body-cta'),
};

export const SLIDE_TYPES = Object.keys(TYPES);

export function slideHTML(slide, ctx) {
  const build = TYPES[slide.type];
  if (!build) throw new Error(`Unknown slide type "${slide.type}". This theme has: ${SLIDE_TYPES.join(', ')}`);
  return `${chrome(slide, ctx)}${build(slide, ctx)}`;
}

export function css(ctx) {
  const { t, fontFaces, textureCSS } = ctx;
  const c = t.color, sp = t.space, ty = t.type, r = t.radius, cv = t.canvas;

  return `${fontFaces}
${baseCSS(t)}
${exhibitCSS({
    ink: c.ink, inkSoft: c.inkSoft, inkFaint: c.inkFaint, rule: c.rule,
    accent: c.accent, accentSoft: c.accentSoft, surface: c.surface,
    paper: c.paper, card: c.card, dark: c.dark, status: c.status,
  })}

body { background:${c.bg}; color:${c.ink}; font-family:Body, system-ui, sans-serif; }

/* The card is the page. Everything sits on it; nothing sits outside it. */
.card { position:absolute; inset:${t.card.inset}px; z-index:0;
  background:${c.card}; border-radius:${t.card.radius}px;
  box-shadow:0 30px 70px -44px rgba(40,30,18,.42),
             0 2px 5px -2px rgba(40,30,18,.10); }

.folio { position:absolute; left:${cv.margin}px; top:${Math.round(cv.safeTop * 0.34)}px;
  z-index:40; font-family:Mono, monospace; font-size:${ty.folio.size}px;
  letter-spacing:${ty.folio.tracking}em; color:${c.inkFaint}; }
/* A printer's registration block. It is the only ornament in the pack, so it
   stays faint and never moves. */
.dotgrid { position:absolute; right:${cv.margin}px; top:${Math.round(cv.safeTop * 0.28)}px;
  width:150px; height:90px; z-index:40; color:${c.inkFaint}; opacity:.42; }

.byline { position:absolute; left:${cv.margin}px; right:${cv.margin}px;
  bottom:${Math.round(cv.safeBottom * 0.36)}px; z-index:40;
  display:flex; align-items:baseline; justify-content:space-between;
  padding-top:${sp.md}px; border-top:1px solid ${c.rule}; }
.bmark { font-family:Italic; font-size:${ty.footer.size}px; }
.bhandle { font-family:Italic; font-size:${ty.footer.size}px; color:${c.inkFaint}; }

.body { left:${cv.margin}px; right:${cv.margin}px;
  top:${cv.safeTop}px; bottom:${cv.safeBottom}px; justify-content:flex-start; }
.fit { gap:${sp.md}px; }
.body-hook, .body-cta { justify-content:center; align-items:center; text-align:center; }
.body-hook .fit, .body-cta .fit { align-items:center; gap:${sp.lg}px; }

.kick { font-family:MonoBold; font-weight:700;
  letter-spacing:${ty.eyebrow.tracking}em; text-transform:uppercase;
  color:${c.accent}; }

.hl { font-family:Display; font-weight:800; line-height:${ty.headline.leading};
  letter-spacing:${ty.headline.tracking}em; }
.hl-1 { display:block; color:${c.accent}; }
.hl-2 { display:block; color:${c.ink}; }
.ac { color:${c.accent}; }
.body-hook .hl, .body-cta .hl { max-width:96%; }

.deck { font-family:Body; font-size:${ty.deck.size}px; line-height:${ty.deck.leading};
  color:${c.inkSoft}; max-width:94%; }
.body-hook .deck, .body-cta .deck { color:${c.inkFaint}; max-width:88%; }
.para { font-family:Body; font-size:${ty.body.size}px; line-height:${ty.body.leading};
  color:${c.inkSoft}; }
.source { font-family:Mono, monospace; color:${c.inkFaint};
  letter-spacing:.04em; }

.exwrap { width:100%; margin:${sp.xs}px 0; }

.tile { width:170px; height:170px; border-radius:40px; display:grid; place-items:center;
  box-shadow:0 22px 40px -22px rgba(140,70,40,.55); }
.tile svg { width:104px; height:104px; }

.action { font-family:Display; font-weight:800; color:${c.ink}; line-height:1.28;
  display:flex; align-items:center; justify-content:center; flex-wrap:wrap; gap:.28em; }
.kpill { display:inline-block; font-family:Display; font-weight:800;
  border-radius:${r.sm}px; padding:.14em .46em .2em; letter-spacing:.01em; }
.follow { font-family:Italic; color:${c.inkFaint}; }

.rows { list-style:none; display:flex; flex-direction:column; gap:${sp.sm}px; width:100%; }
.row { display:flex; gap:${sp.md}px; align-items:flex-start;
  background:${c.surface}; border:2px solid ${c.accentSoft}; border-radius:${r.md}px;
  padding:${sp.sm + 3}px ${sp.md}px; }
.rchip { flex:0 0 auto; width:52px; height:52px; border-radius:14px;
  background:${c.accentSoft}; color:${c.accent}; display:grid; place-items:center;
  font-family:BodyBold; font-weight:700; font-size:26px; }
.rchip svg { width:26px; height:26px; }
.rtxt { display:flex; flex-direction:column; gap:3px; padding-top:3px; }
.rt { font-family:BodyBold; font-weight:700; line-height:${ty.rowTitle.leading}; color:${c.ink}; }
.rb { font-family:Body; line-height:${ty.rowBody.leading}; color:${c.inkSoft}; }

.figs { display:grid; grid-template-columns:1fr 1fr; gap:${sp.sm}px; width:100%; }
.fig { background:${c.surface}; border-radius:${r.lg}px; padding:${sp.md}px ${sp.md + 4}px;
  display:flex; flex-direction:column; gap:9px; min-height:186px;
  justify-content:center; }
.fig-v { font-family:Display; font-weight:800; color:${c.accent};
  line-height:${ty.statValue.leading}; letter-spacing:-.03em; }
.fig-l { font-family:Body; line-height:${ty.statLabel.leading}; color:${c.inkSoft}; }

.quote { font-family:Display; font-weight:800; line-height:${ty.quote.leading};
  text-wrap:balance; border-left:8px solid ${c.accent}; padding-left:${sp.lg}px; }
.attrib { font-family:MonoBold; font-weight:700; font-size:${ty.caption.size}px;
  text-transform:uppercase; letter-spacing:.16em; color:${c.inkFaint};
  margin-top:${sp.sm}px; }

.term { background:${c.dark}; border-radius:${r.lg}px; width:100%; }
.term-bar { padding:14px ${sp.md}px; background:rgba(255,255,255,.06);
  font-family:Mono, monospace; font-size:21px; color:rgba(255,255,255,.45); }
.term-bar i { background:rgba(255,255,255,.2); }
.term-body { padding:${sp.md}px; gap:7px; font-size:25px; line-height:1.45; color:#DAD2C4; }
.shot { background:${c.paper}; border-radius:${r.lg}px; overflow:hidden; width:100%; }
.shot-bar { padding:14px ${sp.md}px; background:${c.card}; color:${c.inkFaint};
  font-family:Mono, monospace; font-size:21px; }
.shot-bar i { background:${c.rule}; }

${textureCSS}
`;
}
