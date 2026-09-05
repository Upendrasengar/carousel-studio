// Hand-drawn annotation marks as inline SVG.
//
// Every mark is traced from a clean geometric path whose points are then
// jittered perpendicular to the direction of travel, and stroked twice with
// two different jitters. That double-stroke is what reads as "drawn by hand"
// rather than "CSS border". Jitter comes from the deck's seeded rng, so a
// given deck's marks are always identical on re-render.
//
// Marks are decoration with a job: they point at the one thing the slide is
// about. A slide with three marks has no emphasis at all.

const R = 2; // coordinate rounding, keeps the path strings short

const round = (n) => Math.round(n * R) / R;

/** Turns a point list into a smooth path via midpoint quadratics. */
function smooth(pts) {
  if (pts.length < 3) return `M${pts.map((p) => `${round(p[0])},${round(p[1])}`).join('L')}`;
  let d = `M${round(pts[0][0])},${round(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i];
    const mx = (x + pts[i + 1][0]) / 2;
    const my = (y + pts[i + 1][1]) / 2;
    d += `Q${round(x)},${round(y)} ${round(mx)},${round(my)}`;
  }
  const last = pts[pts.length - 1];
  d += `T${round(last[0])},${round(last[1])}`;
  return d;
}

/** Displaces each point perpendicular to the local direction of travel. */
function jitter(pts, rng, amp) {
  return pts.map((p, i) => {
    const prev = pts[Math.max(0, i - 1)];
    const nxt = pts[Math.min(pts.length - 1, i + 1)];
    const dx = nxt[0] - prev[0];
    const dy = nxt[1] - prev[1];
    const len = Math.hypot(dx, dy) || 1;
    // Taper the wobble at the ends so strokes start and stop cleanly.
    const t = i / (pts.length - 1);
    const taper = Math.sin(Math.PI * t) * 0.7 + 0.3;
    const off = rng.float(-amp, amp) * taper;
    return [p[0] + (-dy / len) * off, p[1] + (dx / len) * off];
  });
}

function wrap(w, h, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${round(w)}" height="${round(h)}" viewBox="0 0 ${round(w)} ${round(h)}" fill="none">${body}</svg>`;
}

function pass(pts, rng, amp, color, weight, opacity = 1) {
  return `<path d="${smooth(jitter(pts, rng, amp))}" stroke="${color}" stroke-width="${weight}" stroke-linecap="round" opacity="${opacity}"/>`;
}

/**
 * Underline for one emphasised phrase. Sits below the text baseline.
 * The second pass is offset and lighter, which is what sells the hand.
 */
export function underline(rng, w, { color = '#DC4E19', weight = 6, h = 18 } = {}) {
  const n = 14;
  const pts = Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    // Slight sag in the middle, the way a real pen stroke droops.
    return [t * w, h * 0.5 + Math.sin(Math.PI * t) * 2];
  });
  // Second pass rides slightly lower, the way a doubled pen stroke does.
  const lower = pts.map(([x, y]) => [x, y + weight * 0.45]);
  return wrap(w, h,
    pass(pts, rng, 3.4, color, weight) +
    pass(lower, rng, 4.2, color, weight * 0.55, 0.5));
}

/** Loose ellipse around a word or a number. Overshoots, like a real circle. */
export function circle(rng, w, h, { color = '#DC4E19', weight = 5 } = {}) {
  const cx = w / 2, cy = h / 2;
  const rx = w / 2 - weight, ry = h / 2 - weight;
  const n = 40;
  const start = rng.float(-0.6, 0.2);
  const turns = rng.float(1.06, 1.16); // overshoot past the start point
  const pts = Array.from({ length: n }, (_, i) => {
    const a = start + (i / (n - 1)) * Math.PI * 2 * turns;
    return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
  });
  return wrap(w, h,
    pass(pts, rng, 2.4, color, weight) +
    pass(pts, rng, 3.4, color, weight * 0.55, 0.45));
}

/**
 * Curved arrow. `dir` picks the sweep; the head is drawn from the true
 * end-tangent so it always points where the shaft is actually going.
 */
export function arrow(rng, w, h, { color = '#DC4E19', weight = 5, dir = 'right-down' } = {}) {
  const bows = {
    'right-down': [[0.02, 0.12], [0.45, 0.10], [0.80, 0.42], [0.92, 0.88]],
    'right-up':   [[0.02, 0.88], [0.45, 0.90], [0.80, 0.58], [0.92, 0.12]],
    'left-down':  [[0.98, 0.12], [0.55, 0.10], [0.20, 0.42], [0.08, 0.88]],
    'down':       [[0.50, 0.02], [0.62, 0.35], [0.38, 0.65], [0.50, 0.94]],
  };
  const ctrl = bows[dir] || bows['right-down'];

  // Sample a cubic through the control points.
  const n = 26;
  const bez = (t, p0, p1, p2, p3) => {
    const u = 1 - t;
    return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
  };
  const at = (t) => [
    bez(t, ctrl[0][0], ctrl[1][0], ctrl[2][0], ctrl[3][0]) * w,
    bez(t, ctrl[0][1], ctrl[1][1], ctrl[2][1], ctrl[3][1]) * h,
  ];
  const pts = Array.from({ length: n }, (_, i) => at(i / (n - 1)));

  // Head, aligned to the tangent at the tip.
  const tip = pts[n - 1];
  const back = pts[n - 4];
  const ang = Math.atan2(tip[1] - back[1], tip[0] - back[0]);
  const len = Math.min(w, h) * 0.30;
  const spread = 0.42;
  const head = [-1, 1].map((s) => {
    const a = ang + Math.PI + s * spread;
    return `<path d="M${round(tip[0])},${round(tip[1])} L${round(tip[0] + Math.cos(a) * len)},${round(tip[1] + Math.sin(a) * len)}" stroke="${color}" stroke-width="${weight}" stroke-linecap="round"/>`;
  }).join('');

  return wrap(w, h, pass(pts, rng, 2.0, color, weight) + head);
}

/** Four-point sparkle. Crisp on purpose — it is a glyph, not a pen stroke. */
export function sparkle(size, { color = '#F5C542' } = {}) {
  const c = size / 2;
  const arm = size / 2;
  const waist = size * 0.13;
  const d = `M${c},0 Q${c + waist},${c - waist} ${size},${c} Q${c + waist},${c + waist} ${c},${size} Q${c - waist},${c + waist} 0,${c} Q${c - waist},${c - waist} ${c},0 Z`;
  return wrap(size, size, `<path d="${d}" fill="${color}"/>`);
  void arm;
}

/** Square-bracket callout, for framing a stat or a short quote. */
export function bracket(rng, w, h, { color = '#DC4E19', weight = 5, side = 'left' } = {}) {
  const lip = w * 0.7;
  const x = side === 'left' ? weight : w - weight;
  const s = side === 'left' ? 1 : -1;
  const seg = (a, b) => {
    const n = 8;
    return Array.from({ length: n }, (_, i) => {
      const t = i / (n - 1);
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    });
  };
  return wrap(w, h,
    pass(seg([x + s * lip, weight], [x, weight]), rng, 1.6, color, weight) +
    pass(seg([x, weight], [x, h - weight]), rng, 1.6, color, weight) +
    pass(seg([x, h - weight], [x + s * lip, h - weight]), rng, 1.6, color, weight));
}

export const MARKS = { underline, circle, arrow, sparkle, bracket };

/** Data-URI form, for CSS background-image. */
export function markDataURI(svg) {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
