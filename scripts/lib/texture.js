// Paper grain and light, as SVG filters rather than image assets.
//
// feTurbulence generates the fibre noise procedurally, so the theme ships no
// texture PNGs, nothing to license, and the grain never tiles visibly. The
// filters are declared once in a hidden <svg> and referenced from CSS.

/**
 * Fine paper fibre. `seed` comes from the deck rng so the grain is stable
 * per deck but differs between decks — two slides from the same deck sitting
 * side by side in a feed won't show an identical noise pattern.
 */
export function grainFilter(id, seed, { freq = 0.85, octaves = 4 } = {}) {
  return `
    <filter id="${id}" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="${octaves}"
                    seed="${seed}" stitchTiles="stitch" result="noise"/>
      <feColorMatrix in="noise" type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.5"/>
      </feComponentTransfer>
    </filter>`;
}

/** Coarser, blotchier noise. Used at very low opacity as an uneven-ink pass. */
export function blotchFilter(id, seed) {
  return `
    <filter id="${id}" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3"
                    seed="${seed}" stitchTiles="stitch" result="n"/>
      <feColorMatrix in="n" type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.35"/>
      </feComponentTransfer>
    </filter>`;
}

/**
 * The full texture layer: a hidden filter defs block plus two absolutely
 * positioned overlay divs. Returns { defs, html, css } for the template to
 * drop in. Kept as one unit so a theme can't accidentally ship the overlay
 * without the filter that drives it.
 */
export function textureLayer(seed, { grain = 0.10, blotch = 0.05 } = {}) {
  const gid = `grain${seed}`;
  const bid = `blotch${seed}`;
  return {
    defs: `<svg class="fx" aria-hidden="true"><defs>${grainFilter(gid, seed)}${blotchFilter(bid, seed)}</defs></svg>`,
    html: `<div class="tex tex-grain"></div><div class="tex tex-blotch"></div>`,
    css: `
      .fx { position:absolute; width:0; height:0; }
      .tex { position:absolute; inset:0; pointer-events:none; z-index:60; }
      .tex-grain  { filter:url(#${gid});  opacity:${grain};  mix-blend-mode:multiply; }
      .tex-blotch { filter:url(#${bid}); opacity:${blotch}; mix-blend-mode:multiply; }`,
  };
}
