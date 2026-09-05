// Slide templates for the swap theme.
//
// A paid-versus-free comparison card. Every part of a `swap` slide is data:
// two products, their prices, their scores, three shared features and a
// verdict. Write the JSON and the slide assembles itself — which is what
// makes a fifteen-item deck tractable rather than fifteen design jobs.
//
// The two product screenshots are the substance. When they are missing the
// slide falls back to a large logo tile rather than leaving a hole, because
// an empty frame reads as a broken export.

import {
  esc, rich, fitAttr, fitFrame, mediaCard, objectVisual, rowBadge, baseCSS,
  standardSlides,
} from '../../scripts/lib/blocks.js';
import { icon } from '../../scripts/lib/icons.js';
import { logo, hasLogo, brandMark } from '../../scripts/lib/assets.js';
import * as marks from '../../scripts/lib/marks.js';

const T = (c) => c.t.type;
const headline = (s, c) => s.headline ? `<h1 class="hl" ${fitAttr(T(c).headline)}>${rich(s.headline)}</h1>` : '';
const headlineXL = (s, c) => s.headline ? `<h1 class="hl hl-xl" ${fitAttr(T(c).headline, 1.2)}>${rich(s.headline)}</h1>` : '';
const deckLine = (s, c) => s.deck ? `<p class="deck" ${fitAttr(T(c).deck)}>${rich(s.deck)}</p>` : '';
const para = (s, c) => s.body ? `<p class="para" ${fitAttr(T(c).body)}>${rich(s.body)}</p>` : '';

/** Vector mark, then colour fallback, then the initial in a tinted tile. */
function mark(name, brand, tint, ink) {
  const m = brandMark(brand, ink);
  const inner = m ? m.html : `<b>${esc((name || '?').trim()[0].toUpperCase())}</b>`;
  return `<span class="bmark${m?.kind === 'color' ? ' bmark-img' : ''}" style="background:${tint};color:${ink}">${inner}</span>`;
}

function rowList(list, ctx, numbered) {
  if (!list || !list.length) return '';
  const { t } = ctx;
  return `<ul class="rows">${list.map((r, i) => {
    const tint = t.color.chipTints[i % t.color.chipTints.length];
    const ink = t.color.chipInks[i % t.color.chipInks.length];
    const badge = numbered
      ? `<span class="chip chip-num" style="background:${tint};color:${ink}">${i + 1}</span>`
      : rowBadge(r, { iconFn: icon, tint, ink });
    return `<li class="row">${badge}<span class="rtxt">
      <span class="rt" ${fitAttr(t.type.rowTitle)}>${rich(r.title)}</span>
      ${r.body ? `<span class="rb" ${fitAttr(t.type.rowBody)}>${rich(r.body)}</span>` : ''}
    </span></li>`;
  }).join('')}</ul>`;
}

const PARTS = {
  headline, headlineXL, deckLine, para,
  rows: (s, c) => rowList(s.rows, c, false),
  steps: (s, c) => rowList(s.steps || s.rows, c, true),
  media: (s, c) => mediaCard(s, c.accent),
  stats(s, c) {
    const cells = (s.stats || []).map((v) => `<div class="stat">
      <span class="stat-v" ${fitAttr(T(c).statValue)}>${rich(v.value)}</span>
      <span class="stat-l" ${fitAttr(T(c).statLabel)}>${rich(v.label)}</span></div>`).join('');
    return cells ? `<div class="stats stats-${Math.min(2, (s.stats || []).length)}">${cells}</div>` : '';
  },
  // A hairline-ruled quote is the quietest slide in a loud pack. Filled card,
  // oversized opening mark, and the deck's own logos muted along the foot.
  quote: (s, c) => {
    const brands = brandsInDeck(c.deck).slice(0, 8);
    const strip = brands.map((b) => {
      const m = brandMark(b.logo, '#FFFFFF');
      return `<span class="qmark">${m ? m.html : ''}</span>`;
    }).join('');
    return `<div class="quote-card">
      <span class="qmarkbig">&ldquo;</span>
      <blockquote class="quote" ${fitAttr(T(c).quote)}>${rich(s.quote || s.headline)}</blockquote>
      ${s.attribution ? `<p class="attrib" ${fitAttr(T(c).caption)}>${esc(s.attribution)}</p>` : ''}
      ${strip ? `<div class="qstrip">${strip}</div>` : ''}
    </div>`;
  },
  action: (s, c) => s.action
    ? `<p class="action" ${fitAttr(T(c).deck)}>${rich(s.action)}
       <span class="mk mk-circle">${marks.circle(c.rng, 400, 118, { color: c.accent, weight: 6 })}</span></p>` : '',
};

/**
 * Every brand named anywhere in the deck, in order. The cover and the receipt
 * are both built from this: the deck already knows which tools it is about,
 * so neither slide needs its own list to drift out of sync with the swaps.
 */
function brandsInDeck(deck) {
  const out = [];
  for (const sl of deck.slides || []) {
    if (sl.type !== 'swap') continue;
    for (const side of [sl.paid, sl.free]) {
      if (side?.logo && !out.some((b) => b.logo === side.logo)) {
        out.push({ logo: side.logo, name: side.name, price: side.price, paid: side === sl.paid });
      }
    }
  }
  return out;
}

const TYPES = {
  ...standardSlides(PARTS),

  /**
   * The cover. A cloud of the deck's own logos around a split headline.
   *
   * A text-only opener in a theme built on logos and prices wastes the one
   * slide that decides whether anyone swipes. Tiles are placed on a ring so
   * they never cross the headline, with seeded jitter and rotation so the
   * arrangement looks handled rather than generated.
   */
  cover(s, ctx) {
    const { t, deck, rng } = ctx;
    const c = t.color;
    const brands = brandsInDeck(deck).slice(0, 10);
    // Two bands rather than a ring. A ring puts tiles at the horizontal
    // extremes of the ellipse — which is exactly the height the headline
    // occupies — so they collided with the type. Bands guarantee the middle
    // stays clear; jitter and rotation stop them reading as two neat rows.
    const half = Math.ceil(brands.length / 2);
    const tiles = brands.map((b, i) => {
      const top = i < half;
      const k = top ? i : i - half;
      const m = Math.max(1, (top ? half : brands.length - half) - 1);
      const x = 9 + (m ? (k / m) * 82 : 41);
      // The lower band has to clear the summary line at the foot; at 78 with
      // six points of jitter a tile landed on top of the copy.
      const y = (top ? 15 : 70) + rng.float(-4, 4);
      const mk = brandMark(b.logo, c.ink);
      return `<span class="tile" style="left:${x.toFixed(1)}%; top:${y.toFixed(1)}%; --i:${i}">
        <span class="tin" style="transform:rotate(${rng.float(-11, 11).toFixed(1)}deg)">${
        mk ? mk.html : `<b>${esc((b.name || '?')[0].toUpperCase())}</b>`}</span></span>`;
    }).join('');
    const [a, b] = String(s.headline || 'Free\nPaid').split('\n');
    const D = ctx.t.animate?.seconds || 4;
    return `<div class="cover" style="--D:${D}s">
      ${tiles}
      <div class="cover-mid">
        <span class="cw cw-a" ${fitAttr(t.type.headline, 2.5)}>${esc(a)}</span>
        <span class="cw-vs">vs</span>
        <span class="cw cw-b" ${fitAttr(t.type.headline, 2.5)}>${esc(b || '')}</span>
      </div>
    </div>
    ${fitFrame(`${s.deck ? `<p class="csum" ${fitAttr(t.type.deck)}>${rich(s.deck)}</p>` : ''}`, 'body-cover')}`;
  },

  /**
   * The receipt. The problem slide's argument is that small subscriptions add
   * up, so show them adding up rather than asserting it in a bullet.
   */
  receipt(s, ctx) {
    const { t, deck } = ctx;
    const c = t.color;
    const items = (s.items && s.items.length)
      ? s.items
      : brandsInDeck(deck).filter((b) => b.paid).map((b) => ({ name: b.name, logo: b.logo, price: b.price }));
    const lines = items.map((it) => {
      const m = brandMark(it.logo, c.ink);
      return `<li class="rline">
        <span class="rmark">${m ? m.html : `<b>${esc((it.name || '?')[0].toUpperCase())}</b>`}</span>
        <span class="rname">${esc(it.name || '')}</span>
        <span class="rdots"></span>
        <span class="rprice">${esc(it.price || '')}</span>
      </li>`;
    }).join('');
    return fitFrame(`
      ${headline(s, ctx)}
      <div class="receipt">
        <span class="rhead">Monthly · recurring</span>
        <ul class="rlist">${lines}</ul>
        <div class="rtotal">
          <span>Total</span>
          <b ${fitAttr(t.type.score, 1.1)}>${esc(s.total || '')}</b>
        </div>
        ${s.note ? `<span class="rnote">${rich(s.note)}</span>` : ''}
      </div>
      ${para(s, ctx)}`, 'body-receipt');
  },

  /**
   * One swap. Reads top to bottom as an argument: who they are, what they
   * cost, what they look like, what they share, and who won by how much.
   */
  swap(s, ctx) {
    const { t, deck } = ctx;
    const c = t.color;
    const paid = s.paid || {}, free = s.free || {};

    const side = (p, kind) => {
      const tint = kind === 'paid' ? c.paidTint : c.freeTint;
      const ink = kind === 'paid' ? c.paid : c.free;
      const shot = p.dataURI
        ? `<img src="${p.dataURI}" alt="">`
        // No screenshot: a big logo tile beats an empty frame.
        : (() => {
            const m = brandMark(p.logo, ink);
            return `<span class="noshot${m?.kind === 'color' ? ' noshot-img' : ''}" style="background:${tint};color:${ink}">${
              m ? m.html : `<b>${esc((p.name || '?').trim()[0].toUpperCase())}</b>`}</span>`;
          })();
      return `<div class="prod">
        <div class="shotbox">${shot}</div>
        <span class="pname" ${fitAttr(t.type.rowTitle, 1.1)}>${esc(p.name || '')}</span>
        ${p.desc ? `<span class="pdesc" ${fitAttr(t.type.rowBody)}>${esc(p.desc)}</span>` : ''}
      </div>`;
    };

    const feats = (s.features || []).slice(0, 3).map((f, i) => `<div class="feat">
      <span class="fico" style="background:${c.chipTints[i % c.chipTints.length]};color:${c.chipInks[i % c.chipInks.length]}">${icon(f.icon || 'check')}</span>
      <span class="ftxt">
        <b ${fitAttr(t.type.featTitle)}>${esc(f.title)}</b>
        <em ${fitAttr(t.type.featBody)}>${esc(f.body || '')}</em>
      </span></div>`).join('');

    const winner = s.winner === 'paid' ? paid : free;
    const verdict = `<div class="verdict">
      <span class="trophy">${icon('trophy')}</span>
      <div class="vcell">
        <span class="vhead">${mark(paid.name, paid.logo, c.chipTints[0], c.ink)}<b>${esc(paid.name || '')}</b></span>
        <em>Score</em><span class="vscore" ${fitAttr(t.type.score)}>${esc(String(paid.score ?? '—'))}/100</span>
      </div>
      <span class="vs">VS</span>
      <div class="vcell">
        <span class="vhead">${mark(free.name, free.logo, c.chipTints[1], c.ink)}<b>${esc(free.name || '')}</b></span>
        <em>Score</em><span class="vscore" ${fitAttr(t.type.score)}>${esc(String(free.score ?? '—'))}/100</span>
      </div>
      <div class="vcell vcell-win">
        <span class="vwin">${icon('check-circle-2')} Winner</span>
        <span class="vname" ${fitAttr(t.type.score, 0.82)}>${esc(winner.name || '')}</span>
        ${s.saves ? `<span class="vsave">Saves ${esc(s.saves)}</span>` : ''}
      </div>
    </div>`;

    return fitFrame(`
      ${s.n != null ? `<span class="num">${String(s.n).padStart(2, '0')}</span>` : ''}
      <div class="brands">
        <span class="brand">${mark(paid.name, paid.logo, c.chipTints[0], c.ink)}
          <b ${fitAttr(t.type.brand)}>${esc(paid.name || '')}</b></span>
        <span class="arrow">&rarr;</span>
        <span class="brand">${mark(free.name, free.logo, c.chipTints[1], c.ink)}
          <b ${fitAttr(t.type.brand)}>${esc(free.name || '')}</b></span>
      </div>
      <div class="prices">
        <span class="pill pill-paid">${icon('lock')} Paid &bull; ${esc(paid.price || '')}</span>
        <span class="pill pill-free">${icon('gift') === '' ? '' : icon('star')} Free &bull; ${esc(free.price || '$0 / mo')}</span>
      </div>
      ${s.tagline ? `<p class="tagline" ${fitAttr(t.type.tagline)}>${rich(s.tagline)}</p>` : ''}
      <div class="prods">${side(paid, 'paid')}${side(free, 'free')}</div>
      ${feats ? `<div class="feats">${feats}</div>` : ''}
      ${verdict}`, 'body-swap');
    void deck;
  },
};

export const SLIDE_TYPES = Object.keys(TYPES);

function header(slide, ctx) {
  const { deck } = ctx;
  const rail = deck.rail || deck.brand || '';
  if (!rail && !slide.eyebrow) return '';
  return `<header class="hdr"><i></i><span>${esc(slide.eyebrow || rail)}</span><i></i></header>`;
}
const footer = (ctx) => (ctx.deck.handle || ctx.deck.footnote)
  ? `<footer class="ftr"><span>${esc(ctx.deck.handle || '')}</span>
     <span>${esc(ctx.deck.footnote || '')}</span></footer>` : '';

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
body { background:${c.bg}; color:${c.ink}; font-family:Body, system-ui, sans-serif;
  background-image:radial-gradient(120% 70% at 50% 108%, ${accent}18, transparent 64%); }

.hdr { position:absolute; left:${cv.margin}px; right:${cv.margin}px;
  top:${Math.round(cv.safeTop * 0.34)}px; z-index:40;
  display:flex; align-items:center; gap:${sp.md}px; }
.hdr i { flex:1; height:1px; background:${c.rule}; }
.hdr span { font-family:BodyMid; font-weight:600; font-size:${ty.eyebrow.size}px;
  letter-spacing:${ty.eyebrow.tracking}em; text-transform:uppercase; color:${c.inkSoft}; }
.ftr { position:absolute; left:${cv.margin}px; right:${cv.margin}px;
  bottom:${Math.round(cv.safeBottom * 0.3)}px; z-index:40;
  display:flex; align-items:center; justify-content:space-between;
  font-family:BodyMid; font-size:${ty.footer.size}px; color:${c.inkFaint};
  letter-spacing:${ty.footer.tracking}em; }

.body { justify-content:flex-start; }
.body-hook, .body-cta, .body-quote { justify-content:center; }
.body-swap { top:${Math.round(cv.safeTop * 0.68)}px; bottom:${Math.round(cv.safeBottom * 0.58)}px;
  left:${Math.round(cv.margin * 0.8)}px; right:${Math.round(cv.margin * 0.8)}px; }
.fit { gap:${sp.sm}px; align-items:stretch; }
.body-swap .fit { gap:${sp.sm}px; }

.hl { font-family:Display; font-weight:700; color:${c.ink}; }
.ac { color:${accent}; }
.deck { font-family:Body; font-size:${ty.deck.size}px; line-height:${ty.deck.leading}; color:${c.inkSoft}; max-width:88%; }
.para { font-family:Body; font-size:${ty.body.size}px; line-height:${ty.body.leading}; color:${c.inkSoft}; max-width:92%; }

/* ── the cover ────────────────────────────────────────────────────── */
.cover { position:absolute; inset:0; z-index:25; }

/* Tiles pop in around the words, then hold. The stagger runs off --i so the
   arrangement assembles rather than appearing all at once. */
@keyframes tilepop {
  0%   { transform:translate(-50%,-50%) scale(0.82); opacity:.30; }
  11%  { transform:translate(-50%,-50%) scale(1.06); opacity:1; }
  17%, 100% { transform:translate(-50%,-50%) scale(1); opacity:1; }
}
@keyframes wordin {
  0%   { transform:translateY(14%); opacity:.28; }
  18%, 100% { transform:translateY(0); opacity:1; }
}
@keyframes vsin { 0% { opacity:.2; } 24%, 100% { opacity:.9; } }
@keyframes sumin { 0% { opacity:.15; transform:translateY(6px); }
                   30%, 100% { opacity:1; transform:translateY(0); } }
.tile { position:absolute; width:124px; height:124px; border-radius:28px;
  background:${c.surface}; border:1px solid ${c.rule};
  display:grid; place-items:center; color:${c.ink};
  transform:translate(-50%,-50%);
  box-shadow:0 22px 40px -22px rgba(23,21,40,.42), 0 2px 0 rgba(255,255,255,.9) inset;
  animation:tilepop var(--D, 4s) cubic-bezier(.2,.9,.25,1) infinite both;
  animation-delay:calc(var(--i, 0) * 0.035s); }
.tin { display:grid; place-items:center; }
.tile svg, .tile img { width:66px; height:66px; object-fit:contain; }
.tile b { font-family:Display; font-size:52px; }
.cover-mid { position:absolute; left:0; right:0; top:47%; transform:translateY(-50%);
  display:flex; flex-direction:column; align-items:center; gap:2px; }
.cw { font-family:Display; font-weight:700; letter-spacing:-.04em; line-height:.92;
  text-transform:uppercase;
  animation:wordin var(--D, 4s) cubic-bezier(.2,.85,.2,1) infinite both; }
.cw-b { animation-delay:.10s; }
.cw-a { background:linear-gradient(96deg, ${accent}, #8E5BE8 55%, #C24BC8);
  -webkit-background-clip:text; background-clip:text; color:transparent; }
.cw-b { color:${c.ink}; }
.cw-vs { font-family:BodyMid; font-weight:600; font-size:30px; letter-spacing:.4em;
  text-transform:uppercase; color:${c.inkFaint}; margin:2px 0;
  animation:vsin var(--D, 4s) linear infinite both; }
.body-cover { top:auto; bottom:${Math.round(cv.safeBottom * 1.5)}px; height:auto; }
.body-cover .fit { align-items:center; }
.csum { text-align:center; font-family:Body; color:${c.inkSoft}; max-width:78%;
  animation:sumin var(--D, 4s) ease-out infinite both; }
.csum .ac { color:${accent}; font-family:BodyMid; font-weight:600; }

/* ── the receipt ──────────────────────────────────────────────────── */
.receipt { background:${c.surface}; border:1px solid ${c.rule}; border-radius:${r.md}px;
  padding:${sp.md}px; display:flex; flex-direction:column; gap:${sp.sm}px;
  box-shadow:0 22px 50px -34px rgba(23,21,40,.5); }
.rhead { font-family:BodyMid; font-weight:600; font-size:19px; letter-spacing:.16em;
  text-transform:uppercase; color:${c.inkFaint}; }
.rlist { list-style:none; display:flex; flex-direction:column; }
.rline { display:flex; align-items:center; gap:${sp.sm}px; padding:11px 0; }
.rline + .rline { border-top:1px dashed ${c.rule}; }
.rmark { width:38px; height:38px; flex:0 0 auto; border-radius:9px;
  background:${c.panel}; display:grid; place-items:center; color:${c.ink}; }
.rmark svg, .rmark img { width:22px; height:22px; object-fit:contain; }
.rmark b { font-family:Display; font-size:18px; }
.rname { font-family:BodyMid; font-weight:600; font-size:25px; color:${c.ink}; }
.rdots { flex:1; border-bottom:2px dotted ${c.rule}; margin:0 6px; height:1px; }
.rprice { font-family:Display; font-weight:700; font-size:26px; color:${c.paid}; }
.rtotal { display:flex; align-items:baseline; justify-content:space-between;
  border-top:3px solid ${c.ink}; padding-top:${sp.sm}px; margin-top:4px; }
.rtotal span { font-family:BodyMid; font-weight:600; font-size:21px;
  letter-spacing:.14em; text-transform:uppercase; color:${c.inkSoft}; }
.rtotal b { font-family:Display; font-weight:700; color:${c.paid}; letter-spacing:-.03em; }
.rnote { font-family:Body; font-size:20px; color:${c.inkSoft}; }
.rnote .ac { color:${accent}; font-family:BodyMid; font-weight:600; }

/* ── the quote card ───────────────────────────────────────────────── */
.quote-card { position:relative; background:${accent}; border-radius:${r.lg}px;
  padding:${sp.xl}px ${sp.lg}px ${sp.lg}px; overflow:hidden;
  box-shadow:0 30px 60px -34px ${accent}AA; }
.qmarkbig { position:absolute; top:-28px; left:${sp.md}px; font-family:Display;
  font-weight:700; font-size:200px; color:#FFFFFF33; line-height:1; }
.quote-card .quote { position:relative; color:#FFFFFF; }
.quote-card .attrib { color:#FFFFFFB0; }
.qstrip { display:flex; gap:${sp.md}px; align-items:center; flex-wrap:wrap;
  margin-top:${sp.lg}px; padding-top:${sp.md}px; border-top:1px solid #FFFFFF33; }
.qmark { width:34px; height:34px; opacity:.75; }
.qmark svg, .qmark img { width:100%; height:100%; object-fit:contain; }

/* ── the swap card ────────────────────────────────────────────────── */
.num { align-self:center; font-family:Display; font-weight:700; font-size:40px;
  color:${accent}; background:${c.surface}; border:1px solid ${c.rule};
  border-radius:${r.sm}px; padding:6px 18px; }
.brands { display:flex; align-items:center; justify-content:center; gap:${sp.md}px; }
.brand { display:flex; align-items:center; gap:12px; }
.brand b { font-family:Display; font-weight:700; letter-spacing:-.02em; color:${c.ink}; }
.bmark { width:68px; height:68px; flex:0 0 auto; border-radius:${r.sm}px;
  display:grid; place-items:center; }
.bmark svg, .bmark img { width:40px; height:40px; object-fit:contain; }
.bmark-img { background:transparent !important; }
.bmark b { font-family:Display; font-size:34px; }
.arrow { font-size:50px; color:${accent}; }

.prices { display:flex; justify-content:center; gap:${sp.md}px; }
.pill { display:inline-flex; align-items:center; gap:9px; border-radius:99px;
  padding:11px 20px; font-family:BodyMid; font-weight:600; font-size:25px; }
.pill svg { width:21px; height:21px; }
.pill-paid { background:${c.paidTint}; color:${c.paid}; }
.pill-free { background:${c.freeTint}; color:${c.free}; }

.tagline { text-align:center; font-family:BodyMid; font-weight:600;
  font-size:${ty.tagline.size}px; color:${c.ink}; }
.tagline .ac { color:${accent}; }

.prods { display:grid; grid-template-columns:1fr 1fr; gap:${sp.md}px; }
.prod { display:flex; flex-direction:column; gap:8px; text-align:center; }
.shotbox { background:${c.surface}; border:1px solid ${c.rule}; border-radius:${r.md}px;
  overflow:hidden; min-height:${Math.round(cv.height * 0.30)}px; display:grid; place-items:center;
  box-shadow:0 18px 40px -30px rgba(23,21,40,.5); }
.shotbox img { width:100%; height:100%; object-fit:cover; display:block; }
.noshot { width:100%; height:100%; display:grid; place-items:center; }
.noshot svg, .noshot img { width:34%; height:34%; object-fit:contain; }
.noshot b { font-family:Display; font-size:76px; }
.pname { font-family:Display; font-weight:700; color:${c.ink}; }
.pdesc { font-family:Body; color:${c.inkSoft}; line-height:${ty.rowBody.leading}; }

.feats { display:grid; grid-template-columns:1fr 1fr 1fr; gap:0;
  background:${c.surface}; border:1px solid ${c.rule}; border-radius:${r.md}px;
  padding:${sp.sm}px; }
.feat { display:flex; gap:10px; align-items:flex-start; padding:6px 10px; }
.feat + .feat { border-left:1px solid ${c.rule}; }
.fico { flex:0 0 auto; width:48px; height:48px; border-radius:50%; display:grid; place-items:center; }
.fico svg { width:25px; height:25px; }
.ftxt { display:flex; flex-direction:column; gap:3px; }
.ftxt b { font-family:BodyMid; font-weight:600; text-transform:uppercase;
  letter-spacing:${ty.featTitle.tracking}em; color:${c.ink}; }
.ftxt em { font-style:normal; font-family:Body; color:${c.inkSoft}; }

/* The verdict. The trophy overlaps the card's top edge, which is what makes
   it read as a stamp on the result rather than another row of the table. */
.verdict { position:relative; display:grid; grid-template-columns:1fr auto 1fr 1.15fr;
  align-items:center; gap:${sp.sm}px; margin-top:${sp.md}px;
  background:${c.surface}; border:1px solid ${c.rule}; border-radius:${r.md}px;
  padding:${sp.md}px ${sp.sm}px ${sp.sm}px;
  box-shadow:0 18px 44px -32px rgba(23,21,40,.5); }
.trophy { position:absolute; top:-24px; left:50%; transform:translateX(-50%);
  width:48px; height:48px; border-radius:50%; background:${c.surface};
  border:1px solid ${c.rule}; display:grid; place-items:center; color:${accent}; }
.trophy svg { width:24px; height:24px; }
.vcell { display:flex; flex-direction:column; align-items:center; gap:2px; }
.vcell + .vcell, .vs + .vcell { border-left:1px solid ${c.rule}; }
.vhead { display:flex; align-items:center; gap:8px; }
.vhead b { font-family:BodyMid; font-weight:600; font-size:27px; color:${c.ink}; }
.vhead .bmark { width:34px; height:34px; border-radius:8px; }
.vhead .bmark svg { width:20px; height:20px; }
.vhead .bmark b { font-size:17px; }
.vcell em { font-style:normal; font-family:Body; font-size:21px; color:${c.inkFaint}; }
.vscore { font-family:Display; font-weight:700; color:${accent}; }
.vs { font-family:Display; font-weight:700; font-size:28px; color:${accent};
  background:${c.chipTints[0]}; border-radius:99px; padding:8px 14px; }
.vcell-win { gap:4px; }
.vwin { display:inline-flex; align-items:center; gap:7px; font-family:BodyMid;
  font-weight:600; font-size:21px; letter-spacing:.1em; text-transform:uppercase; color:${c.free}; }
.vwin svg { width:18px; height:18px; }
.vname { font-family:Display; font-weight:700; color:${accent}; }
.vsave { font-family:BodyMid; font-weight:600; font-size:22px; color:${c.free}; }

.rows { list-style:none; display:flex; flex-direction:column; }
.row { display:flex; gap:${sp.md}px; align-items:flex-start;
  padding:${sp.sm}px 0 ${sp.md}px; border-bottom:1px solid ${c.rule}; }
.row:first-child { border-top:1px solid ${c.rule}; padding-top:${sp.md}px; }
.chip { flex:0 0 auto; width:46px; height:46px; border-radius:${r.sm}px; display:grid; place-items:center; }
.chip svg { width:24px; height:24px; }
.chip-num { font-family:Display; font-size:22px; }
.rtxt { display:flex; flex-direction:column; gap:3px; padding-top:3px; }
.rt { font-family:BodyMid; font-weight:600; font-size:${ty.rowTitle.size}px; color:${c.ink}; }
.rb { font-family:Body; font-size:${ty.rowBody.size}px; line-height:${ty.rowBody.leading}; color:${c.inkSoft}; }

.stats { display:grid; gap:${sp.sm}px; }
.stats-2 { grid-template-columns:1fr 1fr; }
.stat { background:${c.surface}; border:1px solid ${c.rule}; border-radius:${r.md}px;
  padding:${sp.md}px; display:flex; flex-direction:column; gap:5px; }
.stat-v { font-family:Display; font-weight:700; font-size:${ty.statValue.size}px;
  letter-spacing:-.03em; color:${accent}; }
.stat-l { font-family:BodyMid; font-weight:600; font-size:${ty.statLabel.size}px;
  text-transform:uppercase; letter-spacing:.07em; color:${c.inkSoft}; }

.quote-wrap { border-left:5px solid ${accent}; padding-left:${sp.lg}px; }
.quote { font-family:Display; font-weight:700; font-size:${ty.quote.size}px;
  line-height:${ty.quote.leading}; text-wrap:balance; }
.attrib { font-family:BodyMid; font-weight:600; font-size:${ty.caption.size}px;
  color:${c.inkFaint}; text-transform:uppercase; letter-spacing:.12em; margin-top:${sp.sm}px; }

.action { position:relative; display:inline-block; margin:26px 0;
  font-family:BodyMid; font-weight:600; font-size:${ty.deck.size}px; color:${c.ink};
  padding:${sp.sm}px ${sp.md}px; }
.mk-circle { position:absolute; left:-24px; top:50%; transform:translateY(-50%); }

.term { background:#141225; border-radius:${r.md}px; }
.term-bar { padding:11px ${sp.md}px; background:rgba(255,255,255,.06);
  font-family:BodyMid; font-size:16px; color:rgba(255,255,255,.5); }
.term-bar i { background:rgba(255,255,255,.2); }
.term-body { padding:${sp.md}px; gap:6px; font-size:20px; line-height:1.44; color:#D8D4EE; }
.shot { background:${c.surface}; border:1px solid ${c.rule}; border-radius:${r.md}px; }
.shot-bar { padding:11px ${sp.md}px; background:${c.bg}; color:${c.inkFaint};
  font-family:BodyMid; font-size:16px; }
.shot-bar i { background:${c.rule}; }

.object { right:${Math.round(cv.margin * 0.5)}px; bottom:${Math.round(cv.safeBottom * 0.9)}px; }

${textureCSS}
`;
}
