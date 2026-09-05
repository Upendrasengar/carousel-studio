// Scene composition: the character plus an object, on one ground line.
//
// A character alone in a corner reads as a sticker. The same character
// standing next to a monitor, with a plant on the other side, reads as an
// illustration — and that is most of the distance between a generated deck
// and a designed one.
//
// Composition rather than authoring: the poses and the props stay separate
// files and are combined here. Baking a scene into a single grid would mean
// redrawing the character for every object, which is exactly the consistency
// problem the ASCII approach exists to avoid.

import {
  GRID_W, poseGrid, charPalette, renderGrid, groundShadow,
} from './mascot.js';
import { PROPS, PROP_PALETTE, PROP_NAMES } from './props.js';

export { PROP_NAMES };

function resolve(name) {
  if (!name) return null;
  const p = PROPS[name];
  if (!p) throw new Error(`Unknown prop "${name}". Have: ${PROP_NAMES.join(', ')}`);
  return p;
}

/**
 * Renders a scene.
 *
 * `prop` stands beside the character; `dressing` is a smaller object on the
 * far side. Everything is bottom-aligned to one ground line, so the character
 * and the objects share a floor rather than floating at different heights —
 * except props marked `float`, which hang (a wall clock stands on nothing).
 *
 * Props always render in PROP_PALETTE. The theme's character override is
 * applied only to the character: recolouring the mascot is the point,
 * recolouring a houseplant is a bug.
 */
export function sceneSVG({
  pose = 'idle', prop = null, dressing = null,
  px = 10, flip = false, palette, shadow = true,
} = {}) {
  const charRows = poseGrid(pose);
  const P = charPalette(palette);
  const propDef = resolve(prop);
  const dressDef = resolve(dressing);

  // Dressing renders smaller so it reads as background, not as a second subject.
  const dpx = Math.max(2, Math.round(px * 0.72));

  const items = [];
  if (dressDef) items.push({ def: dressDef, px: dpx, palette: PROP_PALETTE, w: dressDef.w * dpx, h: dressDef.rows.length * dpx });
  items.push({ char: true, rows: charRows, px, palette: P, w: GRID_W * px, h: charRows.length * px });
  if (propDef) items.push({ def: propDef, px, palette: PROP_PALETTE, w: propDef.w * px, h: propDef.rows.length * px });

  const gap = Math.round(px * 1.2);
  const order = flip ? items.slice().reverse() : items;

  const totalW = order.reduce((a, it) => a + it.w, 0) + gap * (order.length - 1);
  const floorH = Math.max(...order.map((it) => (it.def?.float ? 0 : it.h)));
  // A hanging prop is lifted clear of the ground rather than resting on it.
  const lift = Math.round(px * 3.2);
  const bodyH = Math.max(floorH, ...order.map((it) => (it.def?.float ? it.h + lift : 0)));
  const pad = shadow ? Math.round(px * 1.7) : 0;

  let x = 0;
  const parts = [];
  for (const it of order) {
    const y = it.def?.float ? bodyH - it.h - lift : bodyH - it.h;
    if (it.char) {
      const art = renderGrid(it.rows, GRID_W, it.px, it.palette, 0, 0);
      // The character faces the object: mirrored when it stands on the right.
      parts.push(flip
        ? `<g transform="translate(${x + it.w},${y}) scale(-1,1)">${art}</g>`
        : `<g transform="translate(${x},${y})">${art}</g>`);
    } else {
      parts.push(renderGrid(it.def.rows, it.def.w, it.px, it.palette, x, y));
    }
    x += it.w + gap;
  }

  // One shadow for the whole group, not one per object — they are standing on
  // the same floor and separate shadows read as cut-outs on a page.
  const ground = shadow
    ? groundShadow(`scn${pose}${prop || 'x'}${px}`, totalW / 2, bodyH + pad * 0.34, totalW * 0.40, pad * 0.50)
    : '';

  const h = bodyH + pad;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${h}" viewBox="0 0 ${totalW} ${h}" shape-rendering="crispEdges">${ground}${parts.join('')}</svg>`;
}
