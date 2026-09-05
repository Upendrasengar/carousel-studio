// Slide templates for the audit theme.
//
// A dense three-column reference card. Waste on the left in red, the numbered
// pipeline down the middle, the clean result on the right in green, and a
// summary strip along the foot.
//
// This is the opposite of every other pack in the set. They put one idea on a
// slide; this puts a whole system on one, because that is the format people
// screenshot and keep. Density is the design, which is why the fit pass is
// configured not to grow anything: growth would break the columns.

import {
  esc, rich, fitAttr, fitFrame, mediaCard, objectVisual, rowBadge, baseCSS,
  standardSlides,
} from '../../scripts/lib/blocks.js';
import { icon } from '../../scripts/lib/icons.js';
import { mascotSVG } from '../../scripts/lib/mascot.js';
import * as marks from '../../scripts/lib/marks.js';

const T = (c) => c.t.type;
const para = (s, c) => s.body ? `<p class="para" ${fitAttr(T(c).body)}>${rich(s.body)}</p>` : '';
const deckLine = (s, c) => s.deck ? `<p class="deck" ${fitAttr(T(c).deck)}>${rich(s.deck)}</p>` : '';

function headline(s, c, mul = 1) {
  if (!s.headline) return '';
  const lines = String(s.headline).split('\n');
  return `<h1 class="hl" ${fitAttr(T(c).headline, mul)}>${lines.map(rich).join('<br>')}</h1>`;
}
const headlineXL = (s, c) => headline(s, c, 1.2);

/** One side column: a tinted panel of icon rows closing on a result block. */
function column(col, kind, ctx) {
  if (!col) return '';
  const { t } = ctx;
  const rows = (col.items || []).slice(0, t.budgets.maxCells).map((it) => `
    <li class="cell">
      <span class="cico">${icon(it.icon || (kind === 'bad' ? 'x' : 'check'))}</span>
      <span class="ctxt">
        <b ${fitAttr(t.type.cellTitle)}>${esc(it.title)}</b>
        ${it.body ? `<em ${fitAttr(t.type.cellBody)}>${esc(it.body)}</em>` : ''}
      </span>
    </li>`).join('');
  const result = (col.result || []).length
    ? `<div class="result">
        <span class="rico">${icon(kind === 'bad' ? 'alert-triangle' : 'rocket')}</span>
        <span class="rtxt"><b>Result:</b>${col.result.map((r) =>
          `<em ${fitAttr(t.type.cellBody)}>${esc(r)}</em>`).join('')}</span>
      </div>` : '';
  return `<div class="col col-${kind}">
    <div class="chead">
      <span class="clabel" ${fitAttr(t.type.colLabel)}>${esc(col.label || '')}</span>
      <span class="cbadge">${icon(kind === 'bad' ? 'x' : 'check')}</span>
    </div>
    <ul class="cells">${rows}</ul>
    ${result}
  </div>`;
}

/** The middle rail: numbered steps with arrows between them. */
function pipeline(mid, ctx) {
  if (!mid) return '';
  const { t } = ctx;
  const cols = t.color.steps;
  const steps = (mid.steps || []).slice(0, t.budgets.maxCells).map((st, i) => `
    ${i ? '<span class="parrow">&darr;</span>' : ''}
    <div class="step">
      <span class="snum" style="background:${cols[i % cols.length]}">${String(i + 1).padStart(2, '0')}</span>
      <span class="sico" style="color:${cols[i % cols.length]}">${icon(st.icon || 'check')}</span>
      <span class="stitle" ${fitAttr(t.type.stepTitle)}>${esc(st.title)}</span>
    </div>`).join('');
  return `<div class="mid">
    <span class="mlabel" ${fitAttr(t.type.colLabel)}>${esc(mid.label || '')}</span>
    <span class="parrow">&darr;</span>
    ${steps}
  </div>`;
}

const TYPES = {
  ...standardSlides({
    headline, headlineXL, deckLine, para,
    rows: (s, c) => {
      if (!s.rows?.length) return '';
      const { t } = c;
      return `<ul class="rows">${s.rows.map((r, i) => {
        const tint = t.color.chipTints[i % t.color.chipTints.length];
        const ink = t.color.chipInks[i % t.color.chipInks.length];
        return `<li class="row">${rowBadge(r, { iconFn: icon, tint, ink })}
          <span class="rtxt2">
            <span class="rt" ${fitAttr(t.type.rowTitle)}>${rich(r.title)}</span>
            ${r.body ? `<span class="rb" ${fitAttr(t.type.rowBody)}>${rich(r.body)}</span>` : ''}
          </span></li>`;
      }).join('')}</ul>`;
    },
    steps: (s, c) => {
      const list = s.steps || s.rows;
      if (!list?.length) return '';
      const { t } = c;
      return `<ul class="rows">${list.map((r, i) => `<li class="row">
        <span class="chip chip-num" style="background:${t.color.chipTints[i % 5]};color:${t.color.chipInks[i % 5]}">${i + 1}</span>
        <span class="rtxt2"><span class="rt" ${fitAttr(t.type.rowTitle)}>${rich(r.title)}</span>
        ${r.body ? `<span class="rb" ${fitAttr(t.type.rowBody)}>${rich(r.body)}</span>` : ''}</span></li>`).join('')}</ul>`;
    },
    media: (s, c) => mediaCard(s, c.accent),
    stats(s, c) {
      const cells = (s.stats || []).map((v) => `<div class="stat">
        <span class="stat-v" ${fitAttr(T(c).statValue)}>${rich(v.value)}</span>
        <span class="stat-l" ${fitAttr(T(c).statLabel)}>${rich(v.label)}</span></div>`).join('');
      return cells ? `<div class="stats stats-${Math.min(2, (s.stats || []).length)}">${cells}</div>` : '';
    },
    quote: (s, c) => `<div class="quote-wrap">
      <blockquote class="quote" ${fitAttr(T(c).quote)}>${rich(s.quote || s.headline)}</blockquote>
      ${s.attribution ? `<p class="attrib" ${fitAttr(T(c).caption)}>${esc(s.attribution)}</p>` : ''}</div>`,
    action: (s, c) => s.action
      ? `<p class="action" ${fitAttr(T(c).deck)}>${rich(s.action)}
         <span class="mk mk-circle">${marks.circle(c.rng, 380, 112, { color: c.accent, weight: 6 })}</span></p>` : '',
  }),

  /** The reference card. Everything the pack exists for is on this one slide. */
  flow(s, ctx) {
    const { t } = ctx;
    const chain = (s.bottom?.chain || []).map(esc).join(' &rarr; ');
    return `<div class="sheet">
      <div class="top">
        <div class="tl">
          ${headline(s, ctx)}
          ${s.subline ? `<span class="subline" ${fitAttr(t.type.subline)}>${esc(s.subline)}</span>` : ''}
        </div>
        <div class="tfig">${mascotSVG(s.mascot || t.mascot.defaultPose, t.mascot.px, { palette: t.mascotPalette })}</div>
        ${s.pattern ? `<div class="pattern">
          <b ${fitAttr(t.type.colLabel)}>${esc(s.pattern.title || 'The pattern')}</b>
          <span ${fitAttr(t.type.cellTitle)}>${esc(s.pattern.a || '')}</span>
          <i class="pdown">&darr;</i>
          <span ${fitAttr(t.type.cellTitle)}>${esc(s.pattern.b || '')}</span>
        </div>` : '<span></span>'}
      </div>
      <div class="cols">
        ${column(s.left, 'bad', ctx)}
        ${pipeline(s.mid, ctx)}
        ${column(s.right, 'good', ctx)}
      </div>
      ${s.bottom ? `<div class="strip">
        <span class="sstar">${icon('star')}</span>
        <span class="stxt">
          <b ${fitAttr(t.type.subline, 0.86)}>${esc(s.bottom.line || '')}</b>
          ${chain ? `<em ${fitAttr(t.type.cellBody)}>${chain}</em>` : ''}
        </span>
      </div>` : ''}
    </div>`;
  },

  /**
   * The before/after pair with a saving badge between them. The badge is the
   * slide's whole claim, so it sits on the seam rather than beside it.
   */
  compare(s, ctx) {
    const { t } = ctx;
    const side = (d, kind) => `<div class="cmp cmp-${kind}">
      <span class="cmph"><i>${icon(kind === 'bad' ? 'x' : 'check')}</i>
        <b ${fitAttr(t.type.colLabel)}>${esc(d.label || '')}</b></span>
      <span class="cmpv" ${fitAttr(t.type.stepTitle, 1.25)}>${esc(d.value || '')}</span>
      <ul>${(d.notes || []).map((n) => `<li ${fitAttr(t.type.cellBody)}>${esc(n)}</li>`).join('')}</ul>
    </div>`;
    return fitFrame(`
      ${headline(s, ctx)}
      ${s.checklist?.length ? `<ul class="checks">${s.checklist.map((x) =>
        `<li ${fitAttr(t.type.cellBody)}><i>${icon('x')}</i>${esc(x)}</li>`).join('')}</ul>` : ''}
      <div class="cmps">
        ${side(s.bad || {}, 'bad')}
        ${s.badge ? `<span class="badge"><b>${esc(s.badge)}</b><em>${esc(s.badgeLabel || '')}</em></span>` : ''}
        ${side(s.good || {}, 'good')}
      </div>
      ${s.rule ? `<div class="rule"><span>Quick rule</span><code>${esc(s.rule)}</code></div>` : ''}
      ${s.bottom ? `<div class="bline"><b>Bottom line</b><span ${fitAttr(t.type.cellBody)}>${esc(s.bottom)}</span></div>` : ''}
    `, 'body-compare');
  },
};

export const SLIDE_TYPES = Object.keys(TYPES);

const header = (s, ctx) => (s.type === 'flow') ? '' :
  `<header class="hdr"><span>${esc(s.eyebrow || ctx.deck.brand || '')}</span>
   <span class="counter">${String(ctx.index + 1).padStart(2, '0')} / ${String(ctx.total).padStart(2, '0')}</span></header>`;
const footer = (ctx) => `<footer class="ftr"><span>${esc(ctx.deck.handle || '')}</span>
  <span>${esc(ctx.deck.footnote || '')}</span></footer>`;

export function slideHTML(slide, ctx) {
  const build = TYPES[slide.type];
  if (!build) throw new Error(`Unknown slide type "${slide.type}". This theme has: ${SLIDE_TYPES.join(', ')}`);
  return `${header(slide, ctx)}${build(slide, ctx)}${objectVisual(slide, ctx.t, ctx.deck)}${footer(ctx)}`;
}

export function css(ctx) {
  const { t, accent, fontFaces, textureCSS } = ctx;
  const c = t.color, sp = t.space, ty = t.type, r = t.radius, cv = t.canvas;
  return `${fontFaces}
${baseCSS(t)}
body { background:${c.bg}; color:${c.ink}; font-family:Body, system-ui, sans-serif; }

.hdr, .ftr { position:absolute; left:${cv.margin + 8}px; right:${cv.margin + 8}px; z-index:40;
  display:flex; align-items:center; justify-content:space-between;
  font-family:BodyMid; font-weight:600; font-size:${ty.footer.size}px;
  letter-spacing:${ty.footer.tracking}em; text-transform:uppercase; color:${c.inkFaint}; }
.hdr { top:${Math.round(cv.safeTop * 0.36)}px; }
.ftr { bottom:${Math.round(cv.safeBottom * 0.32)}px; text-transform:none; }

.body { justify-content:flex-start; }
.body-hook, .body-cta, .body-quote, .body-compare { justify-content:center; }
.fit { gap:${sp.md}px; }
.hl { font-family:Display; text-transform:uppercase; letter-spacing:${ty.headline.tracking}em;
  line-height:${ty.headline.leading}; color:${c.ink}; }
.ac { color:${accent}; }
.deck { font-family:Body; font-size:${ty.deck.size}px; line-height:${ty.deck.leading}; color:${c.inkSoft}; }
.para { font-family:Body; font-size:${ty.body.size}px; line-height:${ty.body.leading}; color:${c.inkSoft}; }

/* ── the reference card ───────────────────────────────────────────── */
.sheet { position:absolute; inset:${cv.safeTop * 0.34}px ${cv.margin}px ${cv.safeBottom * 0.5}px;
  display:flex; flex-direction:column; gap:${sp.sm}px; z-index:30; }
.top { display:grid; grid-template-columns:1.05fr .62fr .95fr; align-items:start; gap:${sp.sm}px; }
.tl { display:flex; flex-direction:column; gap:6px; }
.subline { font-family:BodyMid; font-weight:600; text-transform:uppercase;
  letter-spacing:${ty.subline.tracking}em; color:${accent}; }
.tfig { justify-self:center; line-height:0; }
.pattern { border:1px solid ${accent}66; border-radius:${r.sm}px; padding:${sp.sm}px ${sp.md}px;
  display:flex; flex-direction:column; align-items:center; gap:2px; text-align:center; }
.pattern b { font-family:BodyMid; font-weight:600; text-transform:uppercase;
  letter-spacing:.06em; color:${accent}; }
.pattern span { font-family:BodyMid; font-weight:600; color:${c.ink}; }
.pdown { font-style:normal; color:${accent}; font-size:20px; line-height:1; }

.cols { flex:1; display:grid; grid-template-columns:1fr .92fr 1fr; gap:${sp.sm}px;
  align-items:stretch; }
.col { display:flex; flex-direction:column; }
.cells { flex:1; }
.col { border-radius:${r.md}px; padding:${sp.sm}px ${sp.md}px ${sp.md}px; }
.col-bad { background:${c.badTint}; }
.col-good { background:${c.goodTint}; }
.chead { display:flex; flex-direction:column; align-items:center; gap:5px; padding-bottom:${sp.sm}px; }
.clabel { font-family:BodyMid; font-weight:600; text-transform:uppercase;
  letter-spacing:${ty.colLabel.tracking}em; }
.col-bad .clabel { color:${c.bad}; } .col-good .clabel { color:${c.good}; }
.cbadge { width:30px; height:30px; border-radius:50%; display:grid; place-items:center; color:#fff; }
.col-bad .cbadge { background:${c.bad}; } .col-good .cbadge { background:${c.good}; }
.cbadge svg { width:17px; height:17px; }

.cells { list-style:none; display:flex; flex-direction:column; }
.cell { display:flex; gap:9px; align-items:flex-start; padding:8px 0; }
.cell + .cell { border-top:1px solid; }
.col-bad .cell + .cell { border-color:${c.badRule}; }
.col-good .cell + .cell { border-color:${c.goodRule}; }
.cico { flex:0 0 auto; width:32px; height:32px; border-radius:50%; display:grid; place-items:center; }
.col-bad .cico { background:#F7DEDB; color:${c.bad}; }
.col-good .cico { background:#DCEEE1; color:${c.good}; }
.cico svg { width:17px; height:17px; }
.ctxt { display:flex; flex-direction:column; gap:2px; }
.ctxt b { font-family:BodyMid; font-weight:600; text-transform:uppercase; letter-spacing:.02em; }
.col-bad .ctxt b { color:${c.bad}; } .col-good .ctxt b { color:${c.good}; }
.ctxt em { font-style:normal; font-family:Body; color:${c.inkSoft}; }

.result { display:flex; gap:9px; align-items:flex-start; margin-top:${sp.sm}px;
  border-radius:${r.sm}px; padding:${sp.sm}px; }
.col-bad .result { background:#F9E2DF; } .col-good .result { background:#DFEFE4; }
.rico { flex:0 0 auto; width:26px; height:26px; display:grid; place-items:center; }
.col-bad .rico { color:${c.bad}; } .col-good .rico { color:${c.good}; }
.rico svg { width:22px; height:22px; }
.rtxt { display:flex; flex-direction:column; }
.rtxt b { font-family:BodyMid; font-weight:600; font-size:17px; text-transform:uppercase; letter-spacing:.05em; }
.col-bad .rtxt b { color:${c.bad}; } .col-good .rtxt b { color:${c.good}; }
.rtxt em { font-style:normal; font-family:BodyMid; font-weight:600; text-transform:uppercase;
  letter-spacing:.02em; color:${c.ink}; }

.mid { display:flex; flex-direction:column; align-items:center; gap:2px; padding-top:2px; }
.mlabel { font-family:BodyMid; font-weight:600; text-transform:uppercase;
  letter-spacing:${ty.colLabel.tracking}em; color:${c.ink}; }
.parrow { color:${c.inkFaint}; font-size:17px; line-height:1; }
.step { width:100%; display:flex; align-items:center; gap:8px;
  border:1px solid ${c.rule}; border-radius:${r.sm}px; padding:8px 9px; background:${c.surface}; }
.snum { flex:0 0 auto; width:34px; height:30px; border-radius:6px; color:#fff;
  font-family:BodyMid; font-weight:600; font-size:16px; display:grid; place-items:center; }
.sico { flex:0 0 auto; width:26px; height:26px; display:grid; place-items:center; }
.sico svg { width:22px; height:22px; }
.stitle { font-family:BodyMid; font-weight:600; text-transform:uppercase;
  line-height:${ty.stepTitle.leading}; color:${c.ink}; }

.strip { display:flex; gap:${sp.md}px; align-items:center;
  border:1px solid ${c.rule}; border-radius:${r.md}px; padding:${sp.sm}px ${sp.md}px; }
.sstar { flex:0 0 auto; width:32px; height:32px; color:#1A73E8; }
.sstar svg { width:32px; height:32px; }
.stxt { display:flex; flex-direction:column; gap:3px; }
.stxt b { font-family:BodyMid; font-weight:600; text-transform:uppercase; letter-spacing:.03em; color:${c.ink}; }
.stxt em { font-style:normal; font-family:Body; color:${c.inkSoft}; }

/* ── the before / after pair ──────────────────────────────────────── */
.checks { list-style:none; display:flex; flex-direction:column; gap:5px; }
.checks li { display:flex; align-items:center; gap:8px; font-family:Body; color:${c.inkSoft}; }
.checks i { color:${c.bad}; width:16px; height:16px; display:grid; place-items:center; }
.checks svg { width:14px; height:14px; }
.cmps { display:grid; grid-template-columns:1fr auto 1fr; gap:${sp.sm}px; align-items:center; }
.cmp { border-radius:${r.md}px; padding:${sp.md}px; display:flex; flex-direction:column; gap:7px; }
.cmp-bad { background:${c.badTint}; border:1px solid ${c.badRule}; }
.cmp-good { background:${c.goodTint}; border:1px solid ${c.goodRule}; }
.cmph { display:flex; align-items:center; gap:8px; }
.cmph i { width:24px; height:24px; border-radius:50%; display:grid; place-items:center; color:#fff; }
.cmp-bad .cmph i { background:${c.bad}; } .cmp-good .cmph i { background:${c.good}; }
.cmph svg { width:14px; height:14px; }
.cmph b { font-family:BodyMid; font-weight:600; text-transform:uppercase; letter-spacing:.05em; }
.cmp-bad .cmph b { color:${c.bad}; } .cmp-good .cmph b { color:${c.good}; }
.cmpv { font-family:Display; text-transform:uppercase; color:${c.ink}; }
.cmp ul { list-style:none; display:flex; flex-direction:column; gap:3px; }
.cmp li { font-family:Body; color:${c.inkSoft}; }
/* The badge is the slide's whole claim, so it sits on the seam between the
   two cards rather than beside them. */
.badge { display:flex; flex-direction:column; align-items:center; gap:1px;
  background:${c.surface}; border:2px solid ${c.rule}; border-radius:50%;
  width:118px; height:118px; justify-content:center; text-align:center; }
.badge b { font-family:Display; font-size:34px; color:${c.good}; }
.badge em { font-style:normal; font-family:BodyMid; font-weight:600; font-size:13px;
  line-height:1.15; color:${c.inkSoft}; padding:0 10px; }

.rule { display:flex; align-items:center; gap:${sp.sm}px;
  border:1px solid ${c.rule}; border-radius:${r.sm}px; padding:${sp.sm}px ${sp.md}px; }
.rule span { font-family:BodyMid; font-weight:600; font-size:16px; text-transform:uppercase;
  letter-spacing:.08em; color:${c.inkFaint}; }
.rule code { font-family:Mono; font-size:20px; color:${c.ink}; }
.bline { display:flex; flex-direction:column; gap:2px; background:${c.badTint};
  border-radius:${r.sm}px; padding:${sp.sm}px ${sp.md}px; }
.bline b { font-family:BodyMid; font-weight:600; font-size:16px; text-transform:uppercase;
  letter-spacing:.08em; color:${c.bad}; }
.bline span { font-family:Body; color:${c.ink}; }

.rows { list-style:none; display:flex; flex-direction:column; }
.row { display:flex; gap:${sp.md}px; align-items:flex-start;
  padding:${sp.sm}px 0 ${sp.md}px; border-bottom:1px solid ${c.rule}; }
.row:first-child { border-top:1px solid ${c.rule}; padding-top:${sp.md}px; }
.chip { flex:0 0 auto; width:44px; height:44px; border-radius:${r.sm}px; display:grid; place-items:center; }
.chip svg { width:23px; height:23px; }
.chip-num { font-family:Display; font-size:21px; }
.rtxt2 { display:flex; flex-direction:column; gap:3px; padding-top:3px; }
.rt { font-family:BodyMid; font-weight:600; font-size:${ty.rowTitle.size}px; color:${c.ink}; }
.rb { font-family:Body; font-size:${ty.rowBody.size}px; line-height:${ty.rowBody.leading}; color:${c.inkSoft}; }

.stats { display:grid; gap:${sp.sm}px; }
.stats-2 { grid-template-columns:1fr 1fr; }
.stat { background:${c.panel}; border:1px solid ${c.rule}; border-radius:${r.md}px;
  padding:${sp.md}px; display:flex; flex-direction:column; gap:5px; }
.stat-v { font-family:Display; font-size:${ty.statValue.size}px; color:${accent}; }
.stat-l { font-family:BodyMid; font-weight:600; font-size:${ty.statLabel.size}px;
  text-transform:uppercase; letter-spacing:.06em; color:${c.inkSoft}; }

.quote-wrap { border-left:5px solid ${accent}; padding-left:${sp.lg}px; }
.quote { font-family:Display; text-transform:uppercase; font-size:${ty.quote.size}px;
  line-height:${ty.quote.leading}; }
.attrib { font-family:BodyMid; font-weight:600; font-size:${ty.caption.size}px;
  text-transform:uppercase; letter-spacing:.1em; color:${c.inkFaint}; margin-top:${sp.sm}px; }

.action { position:relative; display:inline-block; margin:26px 0;
  font-family:Mono; font-size:${ty.deck.size}px; color:${c.ink}; padding:${sp.sm}px ${sp.md}px; }
.mk-circle { position:absolute; left:-22px; top:50%; transform:translateY(-50%); }

.term { background:#141414; border-radius:${r.md}px; }
.term-bar { padding:10px ${sp.md}px; background:rgba(255,255,255,.06);
  font-family:Mono; font-size:15px; color:rgba(255,255,255,.5); }
.term-bar i { background:rgba(255,255,255,.2); }
.term-body { padding:${sp.md}px; gap:5px; font-size:19px; line-height:1.42; color:#D8D8D8; }
.shot { background:${c.surface}; border:1px solid ${c.rule}; border-radius:${r.md}px; }
.shot-bar { padding:10px ${sp.md}px; background:${c.panel}; color:${c.inkFaint};
  font-family:Mono; font-size:15px; }
.shot-bar i { background:${c.rule}; }

.object { right:${Math.round(cv.margin)}px; bottom:${Math.round(cv.safeBottom * 1.1)}px; }

${textureCSS}
`;
}
