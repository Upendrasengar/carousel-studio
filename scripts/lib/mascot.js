// Pixel mascot sprite library.
//
// The mascot is authored as ASCII grids, not image files. That buys three
// things an image model can't: the character is byte-identical on every
// slide, a new pose is a text edit, and recolouring for another theme is a
// palette swap. Poses render to merged SVG <rect> runs, so they stay crisp
// at any export scale and add ~2KB to the page instead of ~200KB.
//
// Themes recolour it by passing a partial `palette` to mascotSVG.
//
// Grid is 28 wide. The body always occupies columns 4-23, which leaves four
// columns on each side for props. Poses may differ in height; the renderer
// bottom-aligns them, and the last three rows are always legs, so every pose
// stands on the same baseline.

export const GRID_W = 28;

export const BASE_PALETTE = {
  '.': null,              // transparent
  O: '#F0663A',           // body
  L: '#FF8E63',           // top highlight
  D: '#C2481F',           // underside / legs
  E: '#14120F',           // eyes, outlines
  W: '#FFFFFF',
  K: '#2B2724',           // dark prop (laptop shell)
  S: '#4A9DE0',           // screen / lens glow
  B: '#2F5FC4',           // blue prop (headphones, wizard hat)
  Y: '#F5C542',           // yellow prop (idea, sparkle, question)
  P: '#7C4DFF',           // purple prop
  G: '#B9B2A6',           // grey prop (bulb base)
  N: '#8A5A34',           // brown prop (deerstalker)
};

export const POSES = {
  // Neutral. The default when a slide has no reason to say anything more.
  idle: [
    '.......LLLLLLLLLLLLLL.......',
    '.....LLLLLLLLLLLLLLLLLL.....',
    '....LOOOOOOOOOOOOOOOOOOL....',
    '....OOOOOOOOOOOOOOOOOOOO....',
    '....OOOEEEEOOOOOOEEEEOOO....',
    '....OOOEEEEOOOOOOEEEEOOO....',
    '....OOOEEEEOOOOOOEEEEOOO....',
    '....OOOOOOOOOOOOOOOOOOOO....',
    '....OOOOOOOOOOOOOOOOOOOO....',
    '....OOOOOOOOOOOOOOOOOOOO....',
    '....DOOOOOOOOOOOOOOOOOOD....',
    '....DDDDDDDDDDDDDDDDDDDD....',
    '.....OO...OO....OO...OO.....',
    '.....OO...OO....OO...OO.....',
    '.....DD...DD....DD...DD.....',
  ],

  // Arm out to the right. Use where the slide introduces a diagram or list.
  pointing: [
    '.......LLLLLLLLLLLLLL.......',
    '.....LLLLLLLLLLLLLLLLLL.....',
    '....LOOOOOOOOOOOOOOOOOOL....',
    '....OOOOOOOOOOOOOOOOOOOO....',
    '....OOOEEEEOOOOOOEEEEOOO....',
    '....OOOEEEEOOOOOOEEEEOOO....',
    '....OOOEEEEOOOOOOEEEEOOO....',
    '....OOOOOOOOOOOOOOOOOOOOOOO.',
    '....OOOOOOOOOOOOOOOOOOOOOOO.',
    '....OOOOOOOOOOOOOOOOOOOO....',
    '....DOOOOOOOOOOOOOOOOOOD....',
    '....DDDDDDDDDDDDDDDDDDDD....',
    '.....OO...OO....OO...OO.....',
    '.....OO...OO....OO...OO.....',
    '.....DD...DD....DD...DD.....',
  ],

  // Headphones on. The "heads-down, doing the work" pose.
  working: [
    '.......BBBBBBBBBBBBBB.......',
    '.....BB..............BB.....',
    '....LBBOOOOOOOOOOOOOOBBL....',
    '....OBBOOOOOOOOOOOOOOBBO....',
    '....OBBEEEEOOOOOOEEEEBBO....',
    '....OBBEEEEOOOOOOEEEEBBO....',
    '....OBBEEEEOOOOOOEEEEBBO....',
    '....OOOOOOOOOOOOOOOOOOOO....',
    '....OOOOOOOOOOOOOOOOOOOO....',
    '....OOOOOOOOOOOOOOOOOOOO....',
    '....DOOOOOOOOOOOOOOOOOOD....',
    '....DDDDDDDDDDDDDDDDDDDD....',
    '.....OO...OO....OO...OO.....',
    '.....OO...OO....OO...OO.....',
    '.....DD...DD....DD...DD.....',
  ],

  // Deerstalker and magnifier. For "here is what we found" slides.
  detective: [
    '........NNNNNNNNNNNN........',
    '......NNNNNNNNNNNNNNNN......',
    '....NNNNNNNNNNNNNNNNNNNN....',
    '....OOOOOOOOOOOOOOOOOOOO....',
    '....OOOEEEEOOOOOOEEEEOOO....',
    '....OOOEEEEOOOOOOEEEEOOO....',
    '....OOOEEEEOOOOOOEEEEOOO....',
    '....OOOOOOOOOOOOOOOOOOOO.EEE',
    '....OOOOOOOOOOOOOOOOOOOOOESE',
    '....OOOOOOOOOOOOOOOOOOOO.EEE',
    '....DOOOOOOOOOOOOOOOOOOD....',
    '....DDDDDDDDDDDDDDDDDDDD....',
    '.....OO...OO....OO...OO.....',
    '.....OO...OO....OO...OO.....',
    '.....DD...DD....DD...DD.....',
  ],

  // Wizard hat and wand spark. For the "here is the trick" slide.
  wizard: [
    '.............BB.............',
    '............BBBB............',
    '...........BBBBBB...........',
    '..........BBBBBBBB..........',
    '.........BBBBBBBBBB.........',
    '.......BBBBBBBBBBBBBB.......',
    '....OOOOOOOOOOOOOOOOOOOO....',
    '....OOOEEEEOOOOOOEEEEOOO....',
    '....OOOEEEEOOOOOOEEEEOOO....',
    '....OOOEEEEOOOOOOEEEEOOO....',
    '....OOOOOOOOOOOOOOOOOOOO..Y.',
    '....OOOOOOOOOOOOOOOOOOOOYYYY',
    '....DOOOOOOOOOOOOOOOOOOD..Y.',
    '....DDDDDDDDDDDDDDDDDDDD....',
    '.....OO...OO....OO...OO.....',
    '.....OO...OO....OO...OO.....',
    '.....DD...DD....DD...DD.....',
  ],

  // Question mark overhead. For the slide that states the problem.
  confused: [
    '....................YYY.....',
    '...................Y...Y....',
    '.......................Y....',
    '......................Y.....',
    '............................',
    '......................Y.....',
    '.......LLLLLLLLLLLLLL.......',
    '.....LLLLLLLLLLLLLLLLLL.....',
    '....LOOOOOOOOOOOOOOOOOOL....',
    '....OOOOOOOOOOOOOOOOOOOO....',
    '....OOOEEEEOOOOOOEEEEOOO....',
    '....OOOEEEEOOOOOOEEEEOOO....',
    '....OOOEEEEOOOOOOEEEEOOO....',
    '....OOOOOOOOOOOOOOOOOOOO....',
    '....OOOOOOOOOOOOOOOOOOOO....',
    '....DOOOOOOOOOOOOOOOOOOD....',
    '....DDDDDDDDDDDDDDDDDDDD....',
    '.....OO...OO....OO...OO.....',
    '.....OO...OO....OO...OO.....',
    '.....DD...DD....DD...DD.....',
  ],

  // Bulb overhead. For the payoff / insight slide.
  idea: [
    '............YYYY............',
    '...........YYYYYY...........',
    '...........YYYYYY...........',
    '............YYYY............',
    '.............GG.............',
    '.............GG.............',
    '.......LLLLLLLLLLLLLL.......',
    '.....LLLLLLLLLLLLLLLLLL.....',
    '....LOOOOOOOOOOOOOOOOOOL....',
    '....OOOOOOOOOOOOOOOOOOOO....',
    '....OOOEEEEOOOOOOEEEEOOO....',
    '....OOOEEEEOOOOOOEEEEOOO....',
    '....OOOEEEEOOOOOOEEEEOOO....',
    '....OOOOOOOOOOOOOOOOOOOO....',
    '....OOOOOOOOOOOOOOOOOOOO....',
    '....DOOOOOOOOOOOOOOOOOOD....',
    '....DDDDDDDDDDDDDDDDDDDD....',
    '.....OO...OO....OO...OO.....',
    '.....OO...OO....OO...OO.....',
    '.....DD...DD....DD...DD.....',
  ],

  // At the laptop. For install, setup and command slides.
  laptop: [
    '.......LLLLLLLLLLLLLL.......',
    '.....LLLLLLLLLLLLLLLLLL.....',
    '....LOOOOOOOOOOOOOOOOOOL....',
    '....OOOOOOOOOOOOOOOOOOOO....',
    '....OOOEEEEOOOOOOEEEEOOO....',
    '....OOOEEEEOOOOOOEEEEOOO....',
    '....OOOEEEEOOOOOOEEEEOOO....',
    '....OOOOOOOOOOOOOOOOOOOO....',
    '....OOOOOOOOOOOOOOOOOOOO.KKK',
    '....DOOOOOOOOOOOOOOOOOOD.KSK',
    '....DDDDDDDDDDDDDDDDDDDDOKSK',
    '.....OO...OO....OO...OO.KKKK',
    '.....OO...OO....OO...OO.....',
    '.....DD...DD....DD...DD.....',
  ],

  // Arms up. For the result slide, and only the result slide.
  celebrate: [
    'Y..........................Y',
    '..OO....................OO..',
    '..OO...LLLLLLLLLLLLLL...OO..',
    '..OO.LLLLLLLLLLLLLLLLLL.OO..',
    '....LOOOOOOOOOOOOOOOOOOL....',
    '....OOOOOOOOOOOOOOOOOOOO....',
    '....OOOEEEEOOOOOOEEEEOOO....',
    '....OOOEEEEOOOOOOEEEEOOO....',
    '....OOOEEEEOOOOOOEEEEOOO....',
    '....OOOOOOOOOOOOOOOOOOOO....',
    '....OOOOOOOOOOOOOOOOOOOO....',
    '....DOOOOOOOOOOOOOOOOOOD....',
    '....DDDDDDDDDDDDDDDDDDDD....',
    '.....OO...OO....OO...OO.....',
    '.....OO...OO....OO...OO.....',
    '.....DD...DD....DD...DD.....',
  ],
};

export const POSE_NAMES = Object.keys(POSES);

/** Throws on any malformed row. A silent off-by-one skews the whole sprite. */
export function validatePoses() {
  const bad = [];
  for (const [name, rows] of Object.entries(POSES)) {
    rows.forEach((r, i) => {
      if (r.length !== GRID_W) bad.push(`${name} row ${i}: ${r.length} chars, expected ${GRID_W}`);
      for (const c of r) if (!(c in PALETTE)) bad.push(`${name} row ${i}: unknown glyph "${c}"`);
    });
  }
  if (bad.length) throw new Error(`Bad mascot poses:\n  ${bad.join('\n  ')}`);
  return true;
}

/** Shifts a hex colour toward white (amount > 0) or black (amount < 0). */
export function shade(hex, amount) {
  const v = hex.replace('#', '');
  const n = parseInt(v.length === 3 ? [...v].map((c) => c + c).join('') : v, 16);
  const mix = (c) => {
    const t = amount > 0 ? 255 : 0;
    return Math.round(c + (t - c) * Math.abs(amount));
  };
  const r = mix((n >> 16) & 255), g = mix((n >> 8) & 255), b = mix(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/**
 * Renders any ASCII grid to SVG rects at an offset. Shared by the character
 * and by every prop, so both get the same treatment and a prop can never
 * drift into a different rendering style from the thing standing next to it.
 *
 * Two passes give the flat grid depth without leaving the grid model: runs of
 * one colour merge into single rects, then a bevel runs along the silhouette
 * — lighter where the shape faces up and left, darker where it faces down and
 * right. The bevel only runs against transparency, not against interior
 * colour changes, so eyes and screens stay clean instead of being outlined.
 */
export function renderGrid(rows, gridW, px, palette, ox = 0, oy = 0) {
  const H = rows.length;
  const at = (x, y) => (y < 0 || y >= H || x < 0 || x >= gridW ? '.' : rows[y][x]);
  const filled = (x, y) => palette[at(x, y)] != null;
  const out = [];

  rows.forEach((row, y) => {
    let x = 0;
    while (x < gridW) {
      const glyph = row[x];
      const fill = palette[glyph];
      if (!fill) { x++; continue; }
      let run = 1;
      while (x + run < gridW && row[x + run] === glyph) run++;
      out.push(`<rect x="${ox + x * px}" y="${oy + y * px}" width="${run * px}" height="${px}" fill="${fill}"/>`);
      x += run;
    }
  });

  const lip = Math.max(1, Math.round(px * 0.24));
  const edge = (dx, dy, amount) => {
    const horizontal = dy !== 0;
    for (let a = 0; a < (horizontal ? H : gridW); a++) {
      let b = 0;
      while (b < (horizontal ? gridW : H)) {
        const [x, y] = horizontal ? [b, a] : [a, b];
        if (!filled(x, y) || filled(x + dx, y + dy)) { b++; continue; }
        const colour = shade(palette[at(x, y)], amount);
        let run = 1;
        for (;;) {
          const [nx, ny] = horizontal ? [x + run, y] : [x, y + run];
          if (!filled(nx, ny) || filled(nx + dx, ny + dy)) break;
          if (shade(palette[at(nx, ny)], amount) !== colour) break;
          run++;
        }
        const w = horizontal ? run * px : lip;
        const h = horizontal ? lip : run * px;
        const x0 = ox + x * px + (dx > 0 ? px - lip : 0);
        const y0 = oy + y * px + (dy > 0 ? px - lip : 0);
        out.push(`<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="${colour}"/>`);
        b += run;
      }
    }
  };
  edge(0, -1, 0.26);   // faces up    -> lighter
  edge(-1, 0, 0.14);   // faces left  -> lighter
  edge(0, 1, -0.24);   // faces down  -> darker
  edge(1, 0, -0.14);   // faces right -> darker
  return out.join('');
}

/** A soft elliptical contact shadow, so things sit on the page. */
export function groundShadow(id, cx, cy, rx, ry) {
  return `<defs><radialGradient id="${id}">
      <stop offset="0%" stop-color="#000" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </radialGradient></defs>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${id})"/>`;
}

/** Resolves a pose name to its rows, and a theme override to a full palette. */
export function poseGrid(pose) { return POSES[pose] || POSES.idle; }
export function charPalette(palette) {
  return palette ? { ...BASE_PALETTE, ...palette } : BASE_PALETTE;
}

/**
 * The character on its own. `px` is the size of one grid cell, so the sprite
 * is GRID_W * px wide.
 */
export function mascotSVG(pose = 'idle', px = 12, { flip = false, palette, shadow = true } = {}) {
  const rows = poseGrid(pose);
  const P = charPalette(palette);
  const w = GRID_W * px;
  const spriteH = rows.length * px;
  const pad = shadow ? Math.round(px * 1.6) : 0;
  const art = renderGrid(rows, GRID_W, px, P);
  const ground = shadow
    ? groundShadow(`sh${pose}${px}`, w / 2, spriteH + pad * 0.34, w * 0.34, pad * 0.52)
    : '';
  const g = flip ? `<g transform="scale(-1,1) translate(${-w},0)">${art}</g>` : art;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${spriteH + pad}" viewBox="0 0 ${w} ${spriteH + pad}" shape-rendering="crispEdges">${ground}${g}</svg>`;
}

/** Data-URI form, for CSS background-image or an <img src>. */
export function mascotDataURI(pose, px, opts) {
  return `data:image/svg+xml;base64,${Buffer.from(mascotSVG(pose, px, opts)).toString('base64')}`;
}
