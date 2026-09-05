// Prop library.
//
// Props are objects the character stands next to, authored the same way the
// character is: ASCII grids that render to merged SVG rects. They are kept
// separate from the poses rather than baked into them, so one prop works with
// every pose and the character itself is never redrawn — which is the whole
// reason the character stays consistent.
//
// Props always render in their own palette, never the theme's character
// override. A purple mascot is a recolour; a purple houseplant is a bug.
//
// Every row of a prop must be exactly `w` characters. Props are bottom-
// aligned with the character, so the last row is the one that touches the
// ground.

export const PROP_PALETTE = {
  '.': null,
  M: '#B4ADA3',   // light metal / casing
  m: '#6E6862',   // dark metal / shadow side
  K: '#26221E',   // near-black, bezels and screens
  S: '#3E7FB8',   // lit screen
  w: '#EDE8DE',   // off-white, paper and ceramic
  W: '#FFFFFF',
  Y: '#E8A93C',   // warm glow, amber
  B: '#3F6BC4',   // blue
  g: '#4E8C55',   // green, foliage and status lights
  d: '#356A3D',   // dark green
  t: '#C3794C',   // terracotta
  r: '#D2452C',   // red
  N: '#A87B4F',   // cardboard / wood
  n: '#8A6339',   // cardboard shadow
};

/**
 * `w` is the exact row width. `float` marks a prop that hangs rather than
 * stands — a wall clock is bottom-aligned to nothing, so it gets lifted
 * clear of the ground line instead.
 */
export const PROPS = {
  // A screen, for anything about watching, dashboards or output.
  monitor: { w: 20, float: false, rows: [
    'MMMMMMMMMMMMMMMMMMMM',
    'MSSSSSSSSSSSSSSSSSSM',
    'MSSSSSSSwSSSSSSSSSSM',
    'MSSSSSSSwwSSSSSSSSSM',
    'MSSSSSSSwwwSSSSSSSSM',
    'MSSSSSSSwwSSSSSSSSSM',
    'MSSSSSSSwSSSSSSSSSSM',
    'MSSSSSSSSSSSSSSSSSSM',
    'MMMMMMMMMMMMMMMMMMMM',
    '........mmmm........',
    '........mmmm........',
    '.....mmmmmmmmmm.....',
    '....MMMMMMMMMMMM....',
  ]},

  // Straight from the reference deck. For speed, "done in two minutes".
  microwave: { w: 20, float: false, rows: [
    'MMMMMMMMMMMMMMMMMMMM',
    'MmmmmmmmmmmmmmMMMMMM',
    'MmKKKKKKKKKKKKmMwwwM',
    'MmKYYYYYYYYYYKmMwwwM',
    'MmKYYYYYYYYYYKmMMMMM',
    'MmKYYYYYYYYYYKmMwMwM',
    'MmKYYYYYYYYYYKmMwMwM',
    'MmKKKKKKKKKKKKmMrrrM',
    'MmmmmmmmmmmmmmMMMMMM',
    'MMMMMMMMMMMMMMMMMMMM',
    '.MM..............MM.',
  ]},

  // A stack, for sources, docs, research.
  books: { w: 14, float: false, rows: [
    '...rrrrrrrr...',
    '...rwwwwwwr...',
    '...rrrrrrrr...',
    '..gggggggggg..',
    '..gwwwwwwwwg..',
    '..gggggggggg..',
    '.BBBBBBBBBBBB.',
    '.BwwwwwwwwwwB.',
    '.BBBBBBBBBBBB.',
    'YYYYYYYYYYYYYY',
    'YwwwwwwwwwwwwY',
    'YYYYYYYYYYYYYY',
  ]},

  // A rack, for infrastructure, servers, connected tools.
  server: { w: 14, float: false, rows: [
    'mmmmmmmmmmmmmm',
    'mKKKKKKKKKKKKm',
    'mKMMMMMMMMMgKm',
    'mKKKKKKKKKKKKm',
    'mKMMMMMMMMMgKm',
    'mKKKKKKKKKKKKm',
    'mKMMMMMMMMMYKm',
    'mKKKKKKKKKKKKm',
    'mKMMMMMMMMMgKm',
    'mKKKKKKKKKKKKm',
    'mKMMMMMMMMMgKm',
    'mKKKKKKKKKKKKm',
    'mmmmmmmmmmmmmm',
    '.mm........mm.',
  ]},

  // Bars on a board, for stats and results.
  chart: { w: 16, float: false, rows: [
    'wwwwwwwwwwwwwwww',
    'w..............w',
    'w..........gg..w',
    'w.......BBBgg..w',
    'w.......BBBgg..w',
    'w..YY...BBBgg..w',
    'w..YY...BBBgg..w',
    'w..YY.rrBBBgg..w',
    'w..YY.rrBBBgg..w',
    'wmmmmmmmmmmmmmmw',
    'wwwwwwwwwwwwwwww',
    '...mm......mm...',
    '...mm......mm...',
  ]},

  // A parcel, for shipping, delivery, packaging something up.
  box: { w: 14, float: false, rows: [
    'NNNNNNNNNNNNNN',
    'NNNNNNwwNNNNNN',
    'NNNNNNwwNNNNNN',
    'nnnnnnwwnnnnnn',
    'NNNNNNwwNNNNNN',
    'NNNNNNwwNNNNNN',
    'NNNNNNwwNNNNNN',
    'NNNNNNwwNNNNNN',
    'NNNNNNwwNNNNNN',
    'nnnnnnnnnnnnnn',
  ]},

  // For time and deadlines. Stands rather than hangs — a hanging prop over a
  // shared ground shadow reads as floating, not as mounted.
  clock: { w: 13, float: false, rows: [
    '....MMMMM....',
    '..MMwwwwwMM..',
    '.MwwwwwwwwwM.',
    'MwwwwwwwwwwwM',
    'MwwwwKwwwwwwM',
    'MwwwwwKwwwwwM',
    'MwwwwwKKKwwwM',
    'MwwwwwwwwwwwM',
    'MwwwwwwwwwwwM',
    '.MwwwwwwwwwM.',
    '..MMwwwwwMM..',
    '....MMMMM....',
    '.....mmm.....',
    '...mmmmmmm...',
  ]},

  // ── set dressing ──────────────────────────────────────────────────
  // Small, and never the subject. These fill the far side of a scene so the
  // character is standing somewhere rather than floating next to one object.

  plant: { w: 12, float: false, rows: [
    '.....gg.....',
    '..g..gg..g..',
    '.ggg.gg.ggg.',
    '.gggggggggg.',
    '..gggggggg..',
    '...gggggg...',
    '....dddd....',
    '.....dd.....',
    '..tttttttt..',
    '..tttttttt..',
    '..tttttttt..',
    '...tttttt...',
    '...tttttt...',
  ]},

  mug: { w: 11, float: false, rows: [
    '..wwwwww...',
    '.wNNNNNNw..',
    '.wNNNNNNwww',
    '.wNNNNNNw.w',
    '.wNNNNNNwww',
    '.wwwwwwww..',
    '..wwwwww...',
  ]},
};

export const PROP_NAMES = Object.keys(PROPS);
/** Props small enough to sit on the far side without competing. */
export const DRESSING_NAMES = ['plant', 'mug'];

export function validateProps() {
  const bad = [];
  for (const [name, p] of Object.entries(PROPS)) {
    p.rows.forEach((r, i) => {
      if (r.length !== p.w) bad.push(`${name} row ${i}: ${r.length} chars, expected ${p.w}`);
      for (const c of r) if (!(c in PROP_PALETTE)) bad.push(`${name} row ${i}: unknown glyph "${c}"`);
    });
  }
  if (bad.length) throw new Error(`Bad props:\n  ${bad.join('\n  ')}`);
  return true;
}
