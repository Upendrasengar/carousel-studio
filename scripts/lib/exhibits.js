// Exhibits: the one thing a slide is built around.
//
// A reference deck that reads as designed almost always has a *drawn* answer
// to "what am I looking at" — a flow, a loop, a record, a transcript, a table.
// Prose plus a stock illustration does not do the same work, and neither does
// a generic node graph: the shapes below are specific because the shapes are
// the argument.
//
// Everything is drawn from data. No fetch, no screenshot, no measurement pass,
// so the same deck renders identically on any machine and in panorama mode.
// Geometry is computed in the exhibit's own pixel space and emitted into a
// viewBox, which is what keeps the dotted connectors circular at any size —
// a percentage viewBox with preserveAspectRatio="none" turns dots into dashes.

import { esc, rich } from './blocks.js';

const BURST = (n = 12) => {
  const arms = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    arms.push(`<line x1="${(50 + Math.cos(a) * 6).toFixed(1)}" y1="${(50 + Math.sin(a) * 6).toFixed(1)}"
      x2="${(50 + Math.cos(a) * 40).toFixed(1)}" y2="${(50 + Math.sin(a) * 40).toFixed(1)}"/>`);
  }
  return `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="9"
    stroke-linecap="round">${arms.join('')}</svg>`;
};

/** Round dots rather than dashes: a zero-length dash with a round cap. */
const DOTS = 'stroke-dasharray="0.1 12.5" stroke-linecap="round"';

/* ── fan ───────────────────────────────────────────────────────────────
   Sources on the left, a hub in the middle, buyers on the right, joined by
   dotted curves. The curves leave the hub horizontally and arrive at each
   pill horizontally, which is what makes the splay read as flow rather than
   as a starburst. */
function fan(x, W) {
  const L = x.left || [], R = x.right || [];
  const n = Math.max(L.length, R.length, 1);
  const PH = 84, GAP = 20, COL = Math.round(W * 0.325);
  const H = n * PH + (n - 1) * GAP;
  const hubW = 132, hubH = 162;
  const cx = W / 2, cy = H / 2;

  // A column with fewer rows is centred against the taller one, so the hub
  // always sits on the axis of both.
  const yOf = (i, len) => (H - (len * PH + (len - 1) * GAP)) / 2 + i * (PH + GAP) + PH / 2;

  // The curve leaves the hub travelling vertically and arrives at the pill
  // travelling horizontally. That asymmetry is what makes a fan read as a fan:
  // control points placed for a short horizontal run give near-straight lines
  // that vanish at feed scale, because there is only ~90px of clear width
  // between a wide pill and the hub.
  const curve = (side, i, len) => {
    const y = yOf(i, len);
    const hx = side < 0 ? cx - hubW / 2 - 10 : cx + hubW / 2 + 10;
    const px = side < 0 ? COL + 5 : W - COL - 5;
    // The second control point has to stay between the two endpoints. A fixed
    // offset overshoots — there is only ~60px of clear width between a wide
    // pill and the hub — and the curve then doubles back on itself.
    const bow = Math.abs(px - hx) * 0.55;
    return `<path d="M${hx},${cy} C${hx},${(cy + (y - cy) * 0.8).toFixed(1)} ${
      (px - side * bow).toFixed(1)},${y.toFixed(1)} ${px},${y.toFixed(1)}"/>`;
  };

  const paths = [
    ...L.map((_, i) => curve(-1, i, L.length)),
    ...R.map((_, i) => curve(1, i, R.length)),
  ].join('');

  const pills = (list, side) => `<div class="xf-col xf-${side}"
    style="width:${COL}px; height:${H}px">${list.map((p) =>
    `<span class="xf-pill" style="height:${PH}px">${rich(p)}</span>`).join('')}</div>`;

  return `<div class="xh xh-fan" style="height:${H}px">
    <svg class="xf-wires" viewBox="0 0 ${W} ${H}" fill="none"
      stroke="currentColor" stroke-width="4.2" ${DOTS}>${paths}</svg>
    ${x.leftLabel ? `<span class="xf-lab xf-lab-l">${esc(x.leftLabel)}</span>` : ''}
    ${x.rightLabel ? `<span class="xf-lab xf-lab-r">${esc(x.rightLabel)}</span>` : ''}
    ${pills(L, 'l')}
    <div class="xf-hub" style="width:${hubW}px; height:${hubH}px">
      <span class="xf-hubico">${BURST()}</span>
      <span class="xf-hubtxt">${esc(x.hub || 'HUB').replace(/\n/g, '<br>')}</span>
    </div>
    ${pills(R, 'r')}
  </div>`;
}

/* ── loop ──────────────────────────────────────────────────────────────
   Nodes on an ellipse, joined nose-to-tail by dotted arcs that bow outward,
   each arc carrying an arrowhead. A cycle drawn as a ring is understood
   before it is read; the same three facts as a numbered list are not. */
function loop(x, W) {
  const nodes = x.nodes || [];
  const n = nodes.length;
  if (!n) return '';
  const H = Math.round(W * 0.46);
  const rx = W * 0.33, ry = H * 0.32, cx = W / 2, cy = H / 2;
  const at = (i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry };
  };

  const arcs = [], heads = [];
  for (let i = 0; i < n; i++) {
    const a = at(i), b = at((i + 1) % n);
    // Trim both ends generously. The cards sit above the wires, so an arrow
    // that stops at the node centre has its head swallowed and the cycle
    // silently loses its direction.
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
    // Where the segment leaves a box the size of a node card. A flat distance
    // trim clears a card approached from above and is swallowed by the same
    // card approached from the side, because the cards are three times wider
    // than they are tall.
    const t = Math.min(0.42, 0.05 + Math.min(
      Math.abs(dx) > 1 ? 178 / Math.abs(dx) : 9,
      Math.abs(dy) > 1 ? 84 / Math.abs(dy) : 9,
    ));
    const s = { x: a.x + dx * t, y: a.y + dy * t };
    const e = { x: b.x - dx * t, y: b.y - dy * t };
    // Control point pushed away from the centre: the arc bows outward, which
    // is what keeps it clear of the label sitting in the middle.
    const mx = (s.x + e.x) / 2, my = (s.y + e.y) / 2;
    const ox = mx - cx, oy = my - cy, om = Math.hypot(ox, oy) || 1;
    const k = 0.42;
    arcs.push(`<path d="M${s.x.toFixed(1)},${s.y.toFixed(1)} Q${(mx + (ox / om) * rx * k).toFixed(1)},${
      (my + (oy / om) * ry * k).toFixed(1)} ${e.x.toFixed(1)},${e.y.toFixed(1)}"/>`);
    const ang = (Math.atan2(e.y - my, e.x - mx) * 180) / Math.PI;
    heads.push(`<path d="M0,-8 L13,0 L0,8 Z" fill="currentColor" stroke="none"
      transform="translate(${e.x.toFixed(1)},${e.y.toFixed(1)}) rotate(${ang.toFixed(1)})"/>`);
  }

  const cards = nodes.map((nd, i) => {
    const p = at(i);
    return `<div class="xl-node" style="left:${((p.x / W) * 100).toFixed(2)}%; top:${
      ((p.y / H) * 100).toFixed(2)}%">
      <b>${rich(nd.title)}</b>${nd.note ? `<i>${esc(nd.note)}</i>` : ''}</div>`;
  }).join('');

  return `<div class="xh xh-loop" style="height:${H}px">
    <svg class="xl-wires" viewBox="0 0 ${W} ${H}" fill="none" stroke="currentColor"
      stroke-width="3.4" ${DOTS}>${arcs.join('')}</svg>
    <svg class="xl-heads" viewBox="0 0 ${W} ${H}" stroke="none">${heads.join('')}</svg>
    ${x.label ? `<span class="xl-lab">${esc(x.label).replace(/\s+/, '<br>')}</span>` : ''}
    ${cards}
  </div>`;
}

/** A window chrome bar. Real traffic-light colours — grey dots read as a
 *  wireframe, and the point of these exhibits is that they look shipped. */
const chrome = (label) => `<div class="xw-bar">
  <i style="background:#EC6A5E"></i><i style="background:#F4BF4F"></i><i style="background:#61C554"></i>
  ${label ? `<span>${esc(label)}</span>` : ''}</div>`;

/* ── chat ─────────────────────────────────────────────────────────────── */
function chat(x) {
  const turns = (x.turns || []).map((t) => {
    if (t.who === 'claude') {
      const paras = (t.paras || (t.text ? [t.text] : []))
        .map((pp) => `<p>${rich(pp)}</p>`).join('');
      return `<div class="xc-turn">
        <span class="xc-who xc-ai"><i class="xc-mark">${BURST(10)}</i>${esc(t.name || 'Claude')}</span>
        <div class="xc-out">${t.subject ? `<b>${rich(t.subject)}</b>` : ''}${paras}</div>
      </div>`;
    }
    return `<div class="xc-turn"><div class="xc-in">
      <span class="xc-who">${esc(t.name || 'You')}</span>
      <p>${rich(t.text || '')}</p></div></div>`;
  }).join('');
  return `<div class="xh xw">${chrome(x.app)}
    <div class="xc-body">${turns}${x.caption ? `<span class="xc-cap">${esc(x.caption)}</span>` : ''}</div>
  </div>`;
}

/* ── record ────────────────────────────────────────────────────────────
   One person's file as the seller shows it. The redactions are the argument,
   so they are drawn as data (a value can be blanked) rather than faked with
   a black bar over finished text. */
function record(x) {
  const rows = (x.fields || []).map((f) => `<div class="xr-row">
    <span class="xr-k">${esc(f.k)}</span><span class="xr-v">${rich(f.v)}</span></div>`).join('');
  return `<div class="xh xw">${chrome(x.url || x.app)}
    <div class="xr-head">
      <span class="xr-face">?</span>
      <span class="xr-id"><b>${rich(x.title || '')}</b><i>${esc(x.sub || '')}</i></span>
      ${x.price ? `<span class="xr-price"><b>${esc(x.price)}</b><i>${
    esc(x.priceNote || 'to unlock')}</i></span>` : ''}
    </div>
    <div class="xr-rows">${rows}</div>
    ${x.warn ? `<span class="xr-warn">${rich(x.warn)}</span>` : ''}
  </div>`;
}

/* ── table ─────────────────────────────────────────────────────────────
   Two looks from one kind. With `app` it is a spreadsheet inside a window;
   without, a bare table under a dark header band. A cell may be a string or
   `{ v, status }`, which renders as a tinted pill. */
function table(x) {
  const head = (x.head || []).map((h) => `<span>${esc(h)}</span>`).join('');
  const rows = (x.rows || []).map((r) => `<div class="xt-row">${
    r.map((cell) => {
      if (cell && typeof cell === 'object') {
        return `<span><b class="xt-pill xt-${cell.status || 'idle'}">${esc(cell.v)}</b></span>`;
      }
      return `<span>${rich(String(cell ?? ''))}</span>`;
    }).join('')}</div>`).join('');
  const cols = (x.head || []).length || 3;
  const grid = `--cols:${x.widths ? x.widths.join(' ') : `repeat(${cols}, 1fr)`}`;
  const inner = `<div class="xt" style="${grid}">
    <div class="xt-head${x.app ? ' xt-head-soft' : ''}">${head}</div>${rows}</div>`;
  return x.app
    ? `<div class="xh xw">${chrome(x.app)}<div class="xt-wrap">${inner}</div></div>`
    : `<div class="xh">${inner}</div>`;
}

const KINDS = { fan, loop, chat, record, table };
export const EXHIBIT_KINDS = Object.keys(KINDS);

/** `width` is the content column in px — the exhibits need it to compute
 *  geometry, and no exhibit measures the DOM. */
export function exhibit(x, width) {
  if (!x) return '';
  const build = KINDS[x.kind];
  if (!build) {
    throw new Error(`Unknown exhibit kind "${x.kind}". Available: ${EXHIBIT_KINDS.join(', ')}`);
  }
  return build(x, width);
}

/**
 * Structure only. Every colour is passed in, so a theme can restyle the whole
 * set without touching the geometry that makes them read.
 */
export function exhibitCSS({
  ink, inkSoft, inkFaint, rule, accent, accentSoft, surface, paper, card, dark, status,
}) {
  const st = status || {};
  const pill = (k, v) => `.xt-${k} { background:${v.tint}; color:${v.ink}; }`;
  return `
.xh { position:relative; width:100%; }

/* window-framed exhibits */
.xw { background:${paper}; border-radius:20px; overflow:hidden;
  box-shadow:0 22px 46px -30px rgba(30,22,14,.42); }
.xw-bar { display:flex; align-items:center; gap:9px; padding:15px 22px;
  background:${card}; }
.xw-bar i { width:15px; height:15px; border-radius:50%; }
.xw-bar span { margin-left:11px; font-family:Mono, monospace; font-size:23px;
  color:${inkFaint}; }

/* fan */
.xh-fan { display:flex; align-items:center; justify-content:space-between;
  margin-top:46px; }
.xf-wires { position:absolute; inset:0; width:100%; height:100%;
  color:${accent}; opacity:.85; z-index:1; }
.xf-lab { position:absolute; top:-40px; font-family:MonoBold; font-weight:700;
  font-size:21px; letter-spacing:.18em; text-transform:uppercase; color:${inkFaint}; }
.xf-lab-l { left:0; }
.xf-lab-r { right:0; }
.xf-col { position:relative; z-index:2; display:flex; flex-direction:column;
  justify-content:center; gap:20px; }
.xf-pill { display:grid; place-items:center; background:${surface};
  border:2px solid ${accentSoft}; border-radius:16px; padding:0 18px;
  font-family:BodyMid; font-weight:600; font-size:30px; color:${ink};
  text-align:center; line-height:1.2; }
.xf-hub { position:relative; z-index:3; flex:0 0 auto; background:${dark};
  border-radius:22px; display:flex; flex-direction:column; align-items:center;
  justify-content:center; gap:11px;
  box-shadow:0 18px 34px -20px rgba(20,16,10,.6); }
.xf-hubico { width:46px; height:46px; border-radius:12px; background:rgba(255,255,255,.13);
  display:grid; place-items:center; color:${paper}; }
.xf-hubico svg { width:30px; height:30px; }
.xf-hubtxt { font-family:BodyBold; font-weight:700; font-size:19px; color:${paper};
  letter-spacing:.07em; text-transform:uppercase; text-align:center; line-height:1.24;
  max-width:104px; }

/* loop */
.xl-wires { position:absolute; inset:0; width:100%; height:100%; color:${accent}; opacity:.8; }
.xl-heads { position:absolute; inset:0; width:100%; height:100%; color:${accent}; }
.xl-lab { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
  font-family:BodyBold; font-weight:700; font-size:29px; line-height:1.16;
  letter-spacing:.08em; text-transform:uppercase; color:${accent}; text-align:center; }
.xl-node { position:absolute; transform:translate(-50%,-50%); z-index:3;
  background:${surface}; border-radius:15px; padding:15px 22px;
  display:flex; flex-direction:column; gap:3px; align-items:center; text-align:center;
  box-shadow:0 14px 28px -20px rgba(30,22,14,.5); max-width:44%; }
.xl-node b { font-family:BodyBold; font-weight:700; font-size:28px; color:${ink};
  line-height:1.2; white-space:nowrap; }
.xl-node i { font-style:normal; font-family:Body; font-size:24px; color:${inkFaint};
  line-height:1.25; }

/* chat */
.xc-body { padding:26px 26px 22px; display:flex; flex-direction:column; gap:20px; }
.xc-turn { display:flex; flex-direction:column; gap:11px; }
.xc-who { font-family:MonoBold; font-weight:700; font-size:21px; letter-spacing:.16em;
  text-transform:uppercase; color:${inkFaint}; display:flex; align-items:center; gap:11px; }
.xc-ai { color:${accent}; }
.xc-mark { width:34px; height:34px; border-radius:9px; background:${accent};
  display:grid; place-items:center; color:${paper}; }
.xc-mark svg { width:22px; height:22px; }
.xc-in { background:${card}; border-radius:16px; padding:18px 24px;
  display:flex; flex-direction:column; gap:9px; }
.xc-in p, .xc-out p { font-family:Body; font-size:29px; line-height:1.42; color:${ink}; }
.xc-out { border:2px solid ${rule}; border-left:7px solid ${accent};
  border-radius:5px 16px 16px 5px; padding:20px 24px;
  display:flex; flex-direction:column; gap:14px; }
.xc-out b { font-family:BodyBold; font-weight:700; font-size:29px; color:${ink};
  line-height:1.3; }
.xc-cap { font-family:Mono, monospace; font-size:21px; color:${inkFaint}; }

/* record */
.xr-head { display:flex; align-items:center; gap:18px; padding:24px 26px 18px; }
.xr-face { width:56px; height:56px; border-radius:50%; background:${card};
  display:grid; place-items:center; font-family:BodyBold; font-size:26px; color:${inkFaint}; }
.xr-id { flex:1; display:flex; flex-direction:column; gap:3px; }
.xr-id b { font-family:BodyBold; font-weight:700; font-size:33px; color:${ink}; }
.xr-id i { font-style:normal; font-family:Body; font-size:22px; color:${inkFaint}; }
.xr-price { text-align:right; display:flex; flex-direction:column; gap:2px; }
.xr-price b { font-family:BodyBold; font-weight:700; font-size:30px; color:${accent}; }
.xr-price i { font-style:normal; font-family:Body; font-size:20px; color:${inkFaint}; }
.xr-rows { display:flex; flex-direction:column; }
.xr-row { display:flex; justify-content:space-between; gap:20px;
  padding:16px 26px; border-top:1px solid ${rule}; }
.xr-k { font-family:Mono, monospace; font-size:23px; color:${inkFaint};
  letter-spacing:.04em; }
.xr-v { font-family:BodyMid; font-weight:600; font-size:25px; color:${ink};
  text-align:right; }
.xr-warn { display:block; padding:16px 26px 22px; font-family:Italic;
  font-size:23px; color:${accent}; }

/* table */
.xt { display:flex; flex-direction:column; border-radius:14px; overflow:hidden; }
.xt-wrap { padding:22px; }
.xt-head, .xt-row { display:grid; grid-template-columns:var(--cols); gap:20px;
  padding:18px 24px; align-items:center; }
.xt-head { background:${dark}; color:${paper};
  font-family:MonoBold; font-weight:700; font-size:20px; letter-spacing:.16em;
  text-transform:uppercase; }
.xt-head-soft { background:${card}; color:${inkFaint}; }
.xt-row { background:${paper}; border-top:1px solid ${rule};
  font-family:BodyMid; font-weight:600; font-size:26px; color:${ink}; line-height:1.28; }
.xt-row:first-of-type { border-top:0; }
.xt-row .ac { font-family:MonoBold; font-weight:700; font-size:.86em;
  letter-spacing:.04em; color:${accent}; }
.xt-pill { display:inline-block; font-family:BodyMid; font-weight:600; font-size:21px;
  border-radius:20px; padding:5px 15px 4px; }
${Object.entries(st).map(([k, v]) => pill(k, v)).join('\n')}
`;
}
