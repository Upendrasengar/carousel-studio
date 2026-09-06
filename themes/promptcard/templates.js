// Slide templates for the promptcard theme.
//
// A prompt pack. The subject of every slide is one prompt, drawn inside a
// facsimile of the assistant's own composer: dark rounded card, the bracketed
// slots the reader has to fill picked out in white, a model label and a send
// button along the foot. Above it, a serif-italic title swiped with a pink
// highlighter.
//
// The composer is the whole idea. A prompt set as body copy is a paragraph the
// reader has to be told to copy; the same words in the box they will paste them
// into is an instruction that needs no caption. It also does the honest thing
// with slots — `[topic]` reads as a blank to fill rather than as punctuation.
//
// Wrong pack for anything that is not literally copy-and-paste. A list of tips
// wants `catalogue`; an argument wants `spotlight-minimal`; a setup guide whose
// payload is code wants `workbench`, whose card is line-numbered and can point
// at one token.

import {
  esc, rich, fitAttr, fitFrame, baseCSS, standardSlides, mediaCard,
} from '../../scripts/lib/blocks.js';
import { icon } from '../../scripts/lib/icons.js';

const T = (c) => c.t.type;

/* ── the house mark ────────────────────────────────────────────────────
   One asterisk, twelve arms, drawn rather than set — it appears solid and
   small in the corner, and again enormous and barely-there behind the cover
   and the closer. Seeded so the arm lengths are stable per deck. */
function burst(ctx, { px = 120, cls = '', color, opacity = 1 } = {}) {
  const { rng } = ctx;
  const arms = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const len = 38 + rng.int(0, 10);
    const w = 7 + rng.int(0, 20) / 10;
    arms.push(`<line x1="${(50 + Math.cos(a) * 5).toFixed(1)}" y1="${(50 + Math.sin(a) * 5).toFixed(1)}"
      x2="${(50 + Math.cos(a) * len).toFixed(1)}" y2="${(50 + Math.sin(a) * len).toFixed(1)}"
      stroke-width="${w.toFixed(1)}"/>`);
  }
  return `<div class="burst ${cls}" style="width:${px}px; opacity:${opacity}"><svg viewBox="0 0 100 100"
    fill="none" stroke="${color || ctx.t.color.accent}" stroke-linecap="round">${arms.join('')}</svg></div>`;
}

/* ── chrome ────────────────────────────────────────────────────────────
   The running name, and a drawn progress bar. The bar is not decoration: a
   prompt pack is a deck people swipe to the end of and then swipe back
   through, and a filled track tells them how much is left far more directly
   than a row of identical dots. The dots stay underneath it because they are
   what Instagram's own UI trains the eye to look for. */
function chrome(slide, ctx) {
  const { deck, index, total, t } = ctx;
  const name = deck.author?.name || deck.brand;
  const pct = total > 1 ? ((index + 1) / total) * 100 : 100;
  const dots = Array.from({ length: total }, (_, i) =>
    `<i class="${i === index ? 'on' : ''}"></i>`).join('');
  return `${name ? `<header class="runname">${esc(name)}</header>` : ''}
    <div class="prog">
      <div class="prog-track"><span style="width:${pct.toFixed(2)}%"></span></div>
      ${deck.showCounter === false ? '' : `<span class="prog-n">${index + 1}/${total}</span>`}
    </div>
    <div class="pdots">${dots}</div>
    ${slide.blush === false ? '' : ''}`;
}

/** Avatar plus name plus handle. The photo is optional — initials in a tinted
 *  disc is the fallback, and it is the honest one for a deck with no face. */
function authorChip(deck, ctx) {
  const a = deck.author;
  if (!a) return '';
  const initials = a.initials
    || String(a.name || '').split(/\s+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const face = a.avatarURI
    ? `<img class="chip-face" src="${a.avatarURI}" alt="">`
    : `<span class="chip-face chip-init" style="background:${ctx.t.color.accent}">${esc(initials)}</span>`;
  return `<div class="authchip">${face}
    <span class="chip-txt"><b>${esc(a.name || '')}</b>${
  a.handle ? `<i>${esc(a.handle)}</i>` : ''}</span></div>`;
}

/* ── the composer ──────────────────────────────────────────────────────
   `[bracketed]` runs become the slots. They are set in white against the
   card's grey body text, which is the one piece of hierarchy the reference
   deck uses and the reason its prompts read as templates rather than as
   examples: the eye lands on what you have to change.

   The card pads to `minLines` with empty rows so a two-line prompt and a
   six-line prompt produce cards of the same weight. Without that, a short
   prompt reads as a caption box and the deck loses its rhythm. */
function composer(text, ctx, opts = {}) {
  const { t } = ctx;
  const model = opts.model || ctx.deck.model || 'Claude Opus 4.8';
  const body = esc(text || '')
    .replace(/\[([^\]]+)\]/g, '<b class="slot">[$1]</b>');
  return `<div class="composer" style="border-radius:${t.composer.radius}px">
    <p class="cbody" ${fitAttr(t.type.promptText)}>${body}</p>
    <div class="cfoot">
      <span class="cplus">+</span>
      <span class="cgrow"></span>
      <span class="cmodel" ${fitAttr(t.type.composerMeta)}>${esc(model)} &#9662;</span>
      <span class="csend" style="background:${t.color.accent}">
        <svg viewBox="0 0 24 24" fill="none" stroke="${t.color.accentInk}" stroke-width="2.6"
          stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
      </span>
    </div>
  </div>`;
}

/* ── parts ─────────────────────────────────────────────────────────── */

const kicker = (s, ctx, text) => {
  const k = text ?? (s.kicker || s.eyebrow);
  return k ? `<span class="kick" ${fitAttr(T(ctx).eyebrow)}>${esc(k)}</span>` : '';
};

/** The outlined pill. Cover only — it is the deck's label, and a label on
 *  every slide is a border. */
const kickPill = (s, ctx) => (s.kicker || s.eyebrow
  ? `<span class="kpill" ${fitAttr(T(ctx).eyebrow)}>${esc(s.kicker || s.eyebrow)}</span>` : '');

/* Words wrapped in *asterisks* take the accent. On the cover that is two or
   three words scattered down a five-line headline rather than one phrase —
   which is why this pack keeps the shared `rich()` markup instead of the
   whole-line colour split that briefing and workbench use. */
const headline = (s, ctx, mul = 1) => (s.headline
  ? `<h1 class="hl" ${fitAttr(T(ctx).headline, mul)}>${
    String(s.headline).split('\n').map((l) => rich(l)).join('<br>')}</h1>` : '');

/** The highlighter swipe sits behind the text as a painted box rather than a
 *  background on the line, so a two-line title gets one continuous bar per
 *  line and never a ragged rectangle behind the whole block. */
const swipeTitle = (s, ctx) => (s.title
  ? `<h2 class="stitle" ${fitAttr(T(ctx).title)}><span>${rich(s.title)}</span></h2>` : '');

const deckLine = (s, ctx) => (s.deck
  ? `<p class="deck" ${fitAttr(T(ctx).deck)}>${rich(s.deck)}</p>` : '');
const para = (s, ctx) => (s.body
  ? `<p class="para" ${fitAttr(T(ctx).body)}>${rich(s.body)}</p>` : '');
const note = (s, ctx) => (s.note
  ? `<p class="note" ${fitAttr(T(ctx).caption)}>${rich(s.note)}</p>` : '');

function rows(s, ctx, numbered) {
  const list = numbered ? (s.steps || s.rows) : s.rows;
  if (!list || !list.length) return '';
  return `<ul class="rows">${list.map((r, i) => `<li class="row">
    <span class="rchip">${numbered ? i + 1 : icon(r.icon || 'check')}</span>
    <span class="rtxt"><span class="rt" ${fitAttr(T(ctx).rowTitle)}>${rich(r.title)}</span>
    ${r.body ? `<span class="rb" ${fitAttr(T(ctx).rowBody)}>${rich(r.body)}</span>` : ''}</span>
  </li>`).join('')}</ul>`;
}

function stats(s, ctx) {
  const list = s.stats || [];
  if (!list.length) return '';
  return `<div class="figs">${list.map((v) => `<div class="fig">
    <span class="fig-v" ${fitAttr(T(ctx).statValue)}>${rich(v.value)}</span>
    <span class="fig-l" ${fitAttr(T(ctx).statLabel)}>${rich(v.label)}</span></div>`).join('')}</div>`;
}

/** `"quoted"` runs become the big terracotta serif word on the closer — the
 *  thing the reader is meant to type into the comments. */
function ctaLines(s, ctx) {
  if (!s.headline) return '';
  const html = String(s.headline).split('\n').map((l) => esc(l)
    .replace(/&quot;([^&]+)&quot;/g, '<em class="qword">&ldquo;$1&rdquo;</em>')
    .replace(/"([^"]+)"/g, '<em class="qword">&ldquo;$1&rdquo;</em>'))
    .map((l) => `<span class="ctal">${l}</span>`).join('');
  return `<h1 class="ctahl" ${fitAttr(T(ctx).title, 1.16)}>${html}</h1>`;
}

/* ── slide types ───────────────────────────────────────────────────── */

const STD = standardSlides({
  headline, deckLine, para, stats,
  rows: (s, c) => rows(s, c, false),
  steps: (s, c) => rows(s, c, true),
  media: (s, c) => (s.prompt ? composer(s.prompt, c, s) : mediaCard(s, c.accent)),
  quote: (s, c) => `<blockquote class="quote" ${fitAttr(T(c).quote)}>${
    rich(s.quote || s.headline)}</blockquote>${s.attribution
    ? `<p class="attrib">${esc(s.attribution)}</p>` : ''}`,
});

const TYPES = {
  ...STD,

  hook: (s, ctx) => `${burst(ctx, { px: 300, cls: 'burst-bg', color: ctx.t.color.blush })}
    ${fitFrame(`${kickPill(s, ctx)}${headline(s, ctx)}${deckLine(s, ctx)}${authorChip(ctx.deck, ctx)}`,
    'body-hook')}
    ${burst(ctx, { px: 118, cls: 'burst-tr' })}`,

  /** The signature. Numbered across the deck rather than per slide, so the
   *  count survives a slide being inserted in the middle. */
  prompt(s, ctx) {
    if (!s.prompt) {
      throw new Error('A "prompt" slide needs a "prompt" string — the text that goes in the composer.');
    }
    const n = ctx.deck.slides.filter((x, i) => x.type === 'prompt' && i <= ctx.index).length;
    const label = s.kicker || `Prompt ${String(n).padStart(2, '0')}`;
    return fitFrame(
      `${kicker(s, ctx, label)}${swipeTitle(s, ctx)}${composer(s.prompt, ctx, s)}${note(s, ctx)}`,
      'body-prompt');
  },

  cta: (s, ctx) => `${burst(ctx, { px: 340, cls: 'burst-bg burst-bg-cta', color: ctx.t.color.blush })}
    ${fitFrame(`<div class="tile" style="background:${ctx.t.color.accent}">${
      burst(ctx, { px: 92, color: ctx.t.color.accentInk })}</div>
      ${ctaLines(s, ctx)}<span class="ctarule" style="background:${ctx.t.color.accent}"></span>
      ${deckLine(s, ctx)}${authorChip(ctx.deck, ctx)}${note(s, ctx)}`, 'body-cta')}`,
};

export const SLIDE_TYPES = Object.keys(TYPES);

export function slideHTML(slide, ctx) {
  const build = TYPES[slide.type];
  if (!build) throw new Error(`Unknown slide type "${slide.type}". This theme has: ${SLIDE_TYPES.join(', ')}`);
  const cover = slide.type === 'hook' || slide.type === 'cta';
  return `<div class="page${cover ? ' page-cover' : ''}"></div>${chrome(slide, ctx)}${build(slide, ctx)}`;
}

export function css(ctx) {
  const { t, fontFaces, textureCSS } = ctx;
  const c = t.color, sp = t.space, ty = t.type, r = t.radius, cv = t.canvas;

  return `${fontFaces}
${baseCSS(t)}

body { background:${c.bg}; color:${c.ink}; font-family:Body, system-ui, sans-serif; }
.page { position:absolute; inset:0; z-index:0; background:${c.bg}; }
.page-cover { background:${c.bgCover}; }

.runname { position:absolute; top:${Math.round(cv.safeTop * 0.30)}px; left:0; right:0;
  z-index:40; text-align:center; font-family:Display; font-weight:800;
  font-size:34px; letter-spacing:-.01em; color:${c.ink}; }

/* progress */
.prog { position:absolute; left:${cv.margin}px; right:${cv.margin}px;
  bottom:${Math.round(cv.safeBottom * 0.42)}px; z-index:40;
  display:flex; align-items:center; gap:${sp.md}px; }
.prog-track { flex:1; height:7px; border-radius:4px; background:${c.rule}; overflow:hidden; }
.prog-track span { display:block; height:100%; border-radius:4px; background:${c.accent}; }
.prog-n { font-family:Body; font-size:${ty.counter.size}px;
  letter-spacing:${ty.counter.tracking}em; color:${c.inkFaint}; }
.pdots { position:absolute; left:0; right:0; bottom:${Math.round(cv.safeBottom * 0.22)}px;
  z-index:40; display:flex; justify-content:center; gap:8px; }
.pdots i { width:8px; height:8px; border-radius:50%; background:${c.rule}; }
.pdots i.on { background:${c.accent}; }

/* the mark */
.burst { position:absolute; line-height:0; z-index:5; }
.burst-tr { top:${Math.round(cv.safeTop * 0.42)}px; right:${cv.margin}px; z-index:20; }
.burst-bg { left:-${Math.round(cv.width * 0.20)}px; bottom:${Math.round(cv.height * 0.10)}px; }
.burst-bg-cta { left:auto; right:-${Math.round(cv.width * 0.22)}px;
  top:${Math.round(cv.height * 0.10)}px; bottom:auto; }

.body { left:${cv.margin}px; right:${cv.margin}px;
  top:${cv.safeTop}px; bottom:${cv.safeBottom}px; justify-content:flex-start; }
.fit { gap:${sp.md}px; }
/* Centred, not top-aligned. The card is the slide — hung from the top it
   leaves a void above the progress bar that reads as a rendering fault. */
.body-hook, .body-cta, .body-prompt { justify-content:center; }
.body-cta { align-items:center; text-align:center; }
.body-cta .fit { align-items:center; gap:${sp.sm}px; }
.body-hook .fit { gap:${sp.lg}px; }

/* cover */
.kpill { align-self:flex-start; font-family:DisplayMid; font-weight:600;
  letter-spacing:${ty.eyebrow.tracking}em; text-transform:uppercase; color:${c.accent};
  border:2px solid ${c.accent}; border-radius:60px; padding:12px 26px 11px; }
.hl { font-family:Display; font-weight:800; line-height:${ty.headline.leading};
  letter-spacing:${ty.headline.tracking}em; color:${c.ink}; }
.ac { color:${c.accent}; }
.deck { font-family:Body; font-size:${ty.deck.size}px; line-height:${ty.deck.leading};
  color:${c.inkSoft}; }
.body-cta .deck { color:${c.inkSoft}; max-width:88%; }
.para { font-family:Body; font-size:${ty.body.size}px; line-height:${ty.body.leading};
  color:${c.inkSoft}; }
.note { font-family:Body; color:${c.inkFaint}; margin-top:-${sp.sm}px; }

.authchip { display:flex; align-items:center; gap:${sp.sm}px; }
.body-hook .authchip { margin-top:${sp.md}px; }
.body-cta .authchip { margin-top:${sp.sm}px; }
.chip-face { width:62px; height:62px; border-radius:50%; flex:0 0 auto;
  object-fit:cover; display:grid; place-items:center; border:2px solid ${c.accent};
  font-family:Display; font-weight:800; font-size:24px; color:${c.accentInk}; }
.chip-txt { display:flex; flex-direction:column; line-height:1.22; text-align:left; }
.chip-txt b { font-family:DisplayMid; font-weight:600; font-size:27px; color:${c.ink}; }
.chip-txt i { font-style:normal; font-family:Body; font-size:25px; color:${c.accent}; }

/* prompt slide */
.kick { font-family:DisplayMid; font-weight:600;
  letter-spacing:${ty.eyebrow.tracking}em; text-transform:uppercase; color:${c.accent}; }
/* The swipe is an inline background on the text span, so each wrapped line
   gets its own bar and the block never paints a rectangle behind the ragged
   right edge. box-decoration-break is what keeps the ends square rather than
   rounding only the first and last fragment. */
.stitle { font-family:SerifItalic, Georgia, serif; font-weight:700; font-style:italic;
  line-height:${ty.title.leading}; letter-spacing:${ty.title.tracking}em; color:${c.ink}; }
.stitle span { background:${c.highlight}; box-shadow:0 0 0 9px ${c.highlight};
  -webkit-box-decoration-break:clone; box-decoration-break:clone; }

.composer { background:${c.card}; padding:${sp.lg}px ${sp.lg}px ${sp.md}px;
  display:flex; flex-direction:column; gap:${sp.lg}px;
  box-shadow:0 28px 60px -34px rgba(20,14,10,.6); margin-top:${sp.sm}px; }
.cbody { font-family:Body; line-height:${ty.promptText.leading}; color:${c.cardInk};
  min-height:${t.composer.minLines * Math.round(ty.promptText.size * ty.promptText.leading)}px; }
.slot { font-family:DisplayMid; font-weight:600; color:${c.cardInkStrong}; }
.cfoot { display:flex; align-items:center; gap:${sp.md}px; }
.cplus { width:56px; height:56px; border-radius:50%; border:2px solid ${c.cardRule};
  display:grid; place-items:center; font-family:Body; font-size:32px;
  color:${c.cardInk}; line-height:1; padding-bottom:4px; }
.cgrow { flex:1; }
.cmodel { font-family:Body; color:${c.cardInk}; opacity:.72; white-space:nowrap; }
.csend { width:60px; height:60px; border-radius:16px; display:grid; place-items:center;
  flex:0 0 auto; }
.csend svg { width:30px; height:30px; }

/* closer */
.tile { width:150px; height:150px; border-radius:38px; display:grid; place-items:center;
  box-shadow:0 22px 44px -24px rgba(150,70,45,.6); margin-bottom:${sp.sm}px; }
.tile .burst { position:static; }
.ctahl { font-family:SerifItalic, Georgia, serif; font-weight:700; font-style:italic;
  line-height:1.18; color:${c.ink}; }
.ctal { display:block; }
.qword { font-style:italic; color:${c.accent}; font-size:1.46em; line-height:1.1;
  display:inline-block; margin:.06em 0; }
.ctarule { display:block; width:104px; height:7px; border-radius:4px; margin:${sp.md}px 0; }

/* shared blocks */
.rows { list-style:none; display:flex; flex-direction:column; gap:${sp.sm}px; width:100%; }
.row { display:flex; gap:${sp.md}px; align-items:flex-start; background:${c.bgCover};
  border:2px solid ${c.rule}; border-radius:${r.md}px; padding:${sp.sm + 3}px ${sp.md}px; }
.rchip { flex:0 0 auto; width:54px; height:54px; border-radius:15px; background:${c.highlight};
  color:${c.accent}; display:grid; place-items:center;
  font-family:Display; font-weight:800; font-size:26px; }
.rchip svg { width:26px; height:26px; }
.rtxt { display:flex; flex-direction:column; gap:3px; padding-top:3px; }
.rt { font-family:DisplayMid; font-weight:600; line-height:${ty.rowTitle.leading}; color:${c.ink}; }
.rb { font-family:Body; line-height:${ty.rowBody.leading}; color:${c.inkSoft}; }

.figs { display:grid; grid-template-columns:1fr 1fr; gap:${sp.sm}px; width:100%; }
.fig { background:${c.bgCover}; border:2px solid ${c.rule}; border-radius:${r.lg}px;
  padding:${sp.md}px; display:flex; flex-direction:column; gap:8px; min-height:180px;
  justify-content:center; }
.fig-v { font-family:Display; font-weight:800; color:${c.accent};
  line-height:${ty.statValue.leading}; letter-spacing:-.03em; }
.fig-l { font-family:Body; line-height:${ty.statLabel.leading}; color:${c.inkSoft}; }

.quote { font-family:SerifItalic, Georgia, serif; font-weight:700; font-style:italic;
  line-height:${ty.quote.leading}; text-wrap:balance;
  border-left:8px solid ${c.accent}; padding-left:${sp.lg}px; }
.attrib { font-family:DisplayMid; font-weight:600; font-size:${ty.caption.size}px;
  text-transform:uppercase; letter-spacing:.14em; color:${c.inkFaint}; margin-top:${sp.sm}px; }

.term { background:${c.card}; border-radius:${r.lg}px; width:100%; }
.term-bar { padding:14px ${sp.md}px; background:rgba(255,255,255,.06);
  font-family:Body; font-size:21px; color:rgba(255,255,255,.45); }
.term-bar i { background:rgba(255,255,255,.2); }
.term-body { padding:${sp.md}px; gap:7px; font-size:25px; line-height:1.45; color:${c.cardInk}; }
.shot { background:${c.bgCover}; border:2px solid ${c.rule}; border-radius:${r.lg}px;
  overflow:hidden; width:100%; }
.shot-bar { padding:14px ${sp.md}px; background:${c.bg}; color:${c.inkFaint};
  font-family:Body; font-size:21px; }
.shot-bar i { background:${c.rule}; }

${textureCSS}
`;
}
