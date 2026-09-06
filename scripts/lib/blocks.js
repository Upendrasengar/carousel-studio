// Structure shared by every theme pack.
//
// The split is deliberate: this file owns *structure* — escaping, the accent
// markup, the auto-fit contract, and the two media cards. Each theme owns
// *look*, in its own templates.js and CSS. A theme that wants a different
// terminal card styles `.term`; it does not re-implement the markup.
//
// Nothing here emits a colour or a size. Those come from theme tokens.

import { object3d, logo as brandLogo } from './assets.js';

export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Copy marks emphasis with *asterisks*. That becomes the accent span — the
 * one loud element on the slide. Themes style `.ac`.
 */
export const rich = (s = '') =>
  esc(s).replace(/\*([^*]+)\*/g, '<em class="ac">$1</em>');

/**
 * Marks an element as fitted, and sets its starting size.
 *
 * The inline font-size matters: the data attributes only tell the fit pass
 * where to start and stop, they do not style anything. An element carrying
 * fitAttr but no font-size in CSS silently inherits the body default and
 * renders tiny — and because the fit pass then measures that tiny text as
 * fitting comfortably, nothing reports a problem. Emitting the size here
 * makes the token the single source of truth and removes the trap.
 */
export const fitAttr = (spec, mul = 1) => {
  const px = Math.round(spec.size * mul);
  return `data-fit="${px}" data-min="${spec.min || 12}" style="font-size:${px}px"`;
};

/**
 * The auto-fit contract. Every theme must wrap its slide content in this.
 *
 * `.body` is the clipping box, inset by the safe bands; `.fit` is the inner
 * wrapper whose real height gets measured against it. Vertically centred
 * content overflows *upward* as well as down, which scrollHeight cannot see —
 * measuring the wrapper is what catches a headline running off the top edge
 * while a naive checker reports success. Do not replace this with a
 * scrollHeight check.
 */
export const fitFrame = (inner, extraClass = '') =>
  `<main class="body ${extraClass}"><div class="fit">${inner}</div></main>`;

/** Dark terminal card. Lines starting with $, / or > read as commands. */
export function terminalCard(media, accent) {
  const lines = (media.lines || []).map((l) => {
    const isCmd = /^\s*[$/>]/.test(l);
    return `<span class="tl${isCmd ? ' tl-cmd' : ''}"${isCmd ? ` style="color:${accent}"` : ''}>${esc(l)}</span>`;
  }).join('');
  return `<div class="term">
    <div class="term-bar"><i></i><i></i><i></i>${media.title ? `<span>${esc(media.title)}</span>` : ''}</div>
    <div class="term-body">${lines}</div>
  </div>`;
}

/** Screenshot in a chrome frame. `dataURI` is filled in by the renderer. */
export function shotCard(media) {
  if (!media.dataURI) return '';
  return `<div class="shot">
    <div class="shot-bar"><i></i><i></i><i></i>${media.title ? `<span>${esc(media.title)}</span>` : ''}</div>
    <img src="${media.dataURI}" alt="">
  </div>`;
}

/**
 * A 3D-rendered object as the slide's visual. Sized by the theme's
 * `objectSize` token as a share of canvas width.
 *
 * These are Fluent Emoji renders (MIT), which is the closest thing to the
 * reference decks' rendered props that is actually licensed for commercial
 * reuse. They are tagged as decoration, so the collision guard drops them
 * when the copy genuinely needs the room.
 */
export function objectVisual(slide, t, deck) {
  if (!slide.object) return '';
  const pct = t.objectSize || 0.34;
  const px = Math.round(t.canvas.width * pct);
  // Positioning is inline, not in baseCSS: not every theme includes baseCSS
  // (pixel-mascot predates it and carries its own reset), and an object with
  // no `position` silently lands top-left in document flow instead of where
  // the theme placed it. The theme rule supplies only the offsets.
  return `<div class="object" data-decor="object"
    style="position:absolute; z-index:20; line-height:0; width:${px}px">
    <img src="${object3d(slide.object, slide.objectPack || deck?.objectPack)}" alt=""
      style="width:100%; height:auto; display:block">
  </div>`;
}

/**
 * Row badge. A `logo` wins over an `icon` — on a slide naming real tools the
 * brand mark carries more information than any generic glyph.
 */
export function rowBadge(row, { iconFn, tint, ink }) {
  if (row.logo) {
    const mark = brandLogo(row.logo, ink);
    if (mark) return `<span class="chip chip-logo" style="background:${tint}">${mark}</span>`;
  }
  return `<span class="chip" style="background:${tint};color:${ink}">${iconFn(row.icon || 'check')}</span>`;
}

/**
 * A node graph: labelled boxes joined by routed connectors.
 *
 * This is the diagram primitive the pack was missing. Reference decks lean on
 * one heavily — a wireframe of boxes and glowing lines is the visual anchor on
 * every slide — and until now the only way to get one here was to supply a
 * finished image.
 *
 * Positions are percentages of the graph box, so the same graph works at any
 * canvas size and in panorama mode. Edges are routed as elbows rather than
 * straight lines: a circuit reads as deliberate where a spider-web of
 * diagonals reads as an accident.
 *
 *   "graph": {
 *     "nodes": [
 *       { "id": "in",  "x": 12, "y": 50, "label": "Prompt", "note": "+ tool list" },
 *       { "id": "m",   "x": 50, "y": 50, "label": "Model", "kind": "hub" },
 *       { "id": "t",   "x": 86, "y": 22, "label": "Browser", "logo": "chrome" }
 *     ],
 *     "edges": [ { "from": "in", "to": "m" },
 *                { "from": "m", "to": "t", "label": "calls", "dashed": true } ]
 *   }
 *
 * Themes style `.ng-*`; nothing here sets a colour.
 */
export function nodeGraph(graph, { iconFn, logoFn, height = 460, flow = false } = {}) {
  if (!graph || !graph.nodes?.length) return '';
  const at = Object.fromEntries(graph.nodes.map((n) => [n.id, n]));

  // Elbow routing, as a list of corners. The longer axis moves first, so a
  // mostly-horizontal edge leaves its node sideways — which is what makes the
  // result read as wiring.
  //
  // This returns points rather than a `d` string because the travelling dot
  // walks the same corners. One router, so a change to how wires bend cannot
  // leave the dot cutting a corner the wire does not take.
  const route = (a, b) => {
    const dx = b.x - a.x, dy = b.y - a.y;
    if (Math.abs(dx) < 0.5 || Math.abs(dy) < 0.5) return [a, b];
    return Math.abs(dx) >= Math.abs(dy)
      ? [a, { x: a.x + dx / 2, y: a.y }, { x: a.x + dx / 2, y: b.y }, b]
      : [a, { x: a.x, y: a.y + dy / 2 }, { x: b.x, y: a.y + dy / 2 }, b];
  };
  const path = (a, b) => route(a, b).map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ');

  // Every part of the graph carries `--nx`, its horizontal position as a bare
  // 0-100 number. Nothing here reads it: it exists so a theme can key motion
  // to where a thing sits on the page — `animation-delay: calc(var(--nx) *
  // Ns)` is a light crossing the diagram left to right, with no theme needing
  // to know the node order or hardcode nth-child. A wire's is its midpoint,
  // which for elbow routing is where its horizontal run happens.
  const wires = (graph.edges || []).map((e) => {
    const a = at[e.from], b = at[e.to];
    if (!a || !b) throw new Error(`Graph edge ${e.from} -> ${e.to} names a node that does not exist.`);
    return `<path d="${path(a, b)}" class="ng-wire${e.dashed ? ' ng-wire-dash' : ''}${e.live ? ' ng-wire-live' : ''}"
      style="--nx:${(a.x + b.x) / 2}" vector-effect="non-scaling-stroke" fill="none"/>`;
  }).join('');

  const pins = graph.nodes.map((n) =>
    `<circle cx="${n.x}" cy="${n.y}" r="0.7" class="ng-pin" style="--nx:${n.x}" vector-effect="non-scaling-stroke"/>`).join('');

  const labels = (graph.edges || []).filter((e) => e.label).map((e) => {
    const a = at[e.from], b = at[e.to];
    return `<span class="ng-elab" style="left:${(a.x + b.x) / 2}%; top:${(a.y + b.y) / 2}%">${esc(e.label)}</span>`;
  }).join('');

  const boxes = graph.nodes.map((n) => {
    const badge = n.logo && logoFn ? `<i class="ng-logo">${logoFn(n.logo) || ''}</i>`
      : n.icon && iconFn ? `<i class="ng-ico">${iconFn(n.icon)}</i>` : '';
    return `<span class="ng-node ng-${n.kind || 'default'}" style="left:${n.x}%; top:${n.y}%; --nx:${n.x}">
      ${badge}<span class="ng-txt">
        <b>${esc(n.label)}</b>${n.note ? `<em>${esc(n.note)}</em>` : ''}
      </span></span>`;
  }).join('');

  const pulse = flow ? flowPulse(graph, at, route, flow === true ? {} : flow) : '';

  return `<div class="ng" style="height:${height}px">
    <svg class="ng-wires" viewBox="0 0 100 100" preserveAspectRatio="none">${wires}${pins}</svg>
    ${boxes}${labels}${pulse}
  </div>`;
}

/**
 * Travelling dots along the wiring: one leaves the source, and the moment it
 * lands on the hub every outgoing wire carries one at once. A static diagram
 * says these things are connected; this says which way the work moves.
 *
 * Wave order is DERIVED, not declared. Breadth-first from whichever nodes have
 * no incoming edge gives every edge a hop number, and hop number is the wave.
 * Add a seventh platform to the graph and it joins the split with nothing to
 * change here — the same reason `--nx` is stamped rather than hand-tuned.
 *
 * Two things forced the shape of this:
 *
 * The dots are HTML at percentage positions, not SVG circles. The wire `<svg>`
 * is `preserveAspectRatio="none"` — deliberately, so a graph laid out in 0-100
 * fills any box — and a `<circle>` in that space renders as an ellipse whose
 * squash depends on the card's aspect. A div at `left:%/top:%` is round at
 * every size.
 *
 * Every dot holds `opacity:0` at both 0% and 100%. Stills of an animated slide
 * are produced by seeking each animation to just inside its final frame, so a
 * dot that ended lit would be parked mid-wire on the PNG that ships to the
 * platforms that take no video.
 */
let FLOW_SEQ = 0;

function flowPulse(graph, at, route, opts = {}) {
  const edges = (graph.edges || []).filter((e) => at[e.from] && at[e.to]);
  if (!edges.length) return '';

  const D = opts.seconds || 4;
  const lead = opts.lead ?? 0.05;         // quiet beat before the first dot
  const end = opts.end ?? 0.88;           // last dot lands, then the loop rests
  const rise = opts.rise ?? 0.08;         // of one wave, spent appearing
  const land = opts.land ?? 0.02;         // of the loop, spent going out at the node

  // Hop number per node: 0 for the sources, +1 across each edge.
  const incoming = new Set(edges.map((e) => e.to));
  const roots = graph.nodes.filter((n) => !incoming.has(n.id)).map((n) => n.id);
  const out = new Map();
  for (const e of edges) out.set(e.from, [...(out.get(e.from) || []), e]);
  const hop = new Map((roots.length ? roots : [graph.nodes[0].id]).map((id) => [id, 0]));
  for (const q = [...hop.keys()]; q.length;) {
    const id = q.shift();
    for (const e of out.get(id) || []) {
      if (hop.has(e.to)) continue;
      hop.set(e.to, hop.get(id) + 1);
      q.push(e.to);
    }
  }
  const waves = Math.max(...edges.map((e) => hop.get(e.from) ?? 0)) + 1;
  const span = (end - lead) / waves;

  const uid = `ngf${++FLOW_SEQ}`;
  const rules = [];
  const dots = edges.map((e, i) => {
    const pts = route(at[e.from], at[e.to]);
    const legs = pts.slice(1).map((p, k) => Math.hypot(p.x - pts[k].x, p.y - pts[k].y));
    const total = legs.reduce((s, v) => s + v, 0) || 1;

    // Waypoint times are proportional to leg length in graph units, which is
    // exact only on a square box. The dot changes pace slightly at a corner on
    // a tall card; a constant-speed version would need the box's pixel aspect,
    // which is not known until layout.
    const w0 = lead + (hop.get(e.from) ?? 0) * span;
    const at01 = (k) => w0 + span * (legs.slice(0, k).reduce((s, v) => s + v, 0) / total);

    const key = new Map();
    const put = (pct, decl) => {
      const at2 = Math.max(0, Math.min(100, pct * 100)).toFixed(2);
      key.set(at2, { ...(key.get(at2) || {}), ...decl });
    };
    const stop = (pct, p) => put(pct, { left: `${p.x}%`, top: `${p.y}%` });

    // Full brightness right through arrival, then out over `land` — the dot is
    // absorbed by the node it reached. Fading it out across the tail of the
    // journey instead reads as a dot that gave up: measured, the first version
    // died at 70 of the 80 units it had to cross.
    put(0, { opacity: 0 });
    stop(w0, pts[0]);
    put(w0, { opacity: 0 });
    put(w0 + span * rise, { opacity: 1 });
    pts.slice(1, -1).forEach((p, k) => stop(at01(k + 1), p));
    stop(w0 + span, pts[pts.length - 1]);
    put(w0 + span, { opacity: 1 });
    put(w0 + span + land, { opacity: 0 });
    put(1, { opacity: 0 });

    const frames = [...key.entries()].sort((x, y) => Number(x[0]) - Number(y[0]))
      .map(([pct, decl]) => `${pct}%{${Object.entries(decl).map(([k, v]) => `${k}:${v}`).join(';')}}`)
      .join('');
    rules.push(`@keyframes ${uid}-${i}{${frames}}`);
    return `<span class="ng-dot" style="left:${pts[0].x}%; top:${pts[0].y}%; opacity:0; animation-name:${uid}-${i}"></span>`;
  }).join('');

  // Hidden unless the slide opted into motion, and hidden here rather than in
  // the theme: a pack that styles `.ng-dot` and forgets the guard would leak
  // seven dots onto every still.
  return `<style>.ng-dot{display:none; position:absolute; transform:translate(-50%,-50%);
    pointer-events:none; z-index:5}
  .is-anim .ng-dot{display:block; animation-duration:${D}s; animation-timing-function:linear;
    animation-iteration-count:infinite; animation-fill-mode:both}
  ${rules.join('\n  ')}</style>${dots}`;
}

/**
 * Builds the seven standard slide types from a theme's part renderers.
 *
 * Every theme lays out `hook`, `problem`, `point`, `steps`, `stat`, `quote`
 * and `cta` in the same order — headline, then supporting line, then the
 * body block — and differs only in how each *part* looks. Writing the
 * assembly out per theme meant seventy near-identical functions and seventy
 * chances for one of them to drift.
 *
 * A theme supplies whichever parts it has; missing ones render nothing. It
 * can override any type afterwards by spreading its own on top, and adds its
 * signature type the same way.
 */
export function standardSlides(parts) {
  const p = (name) => (typeof parts[name] === 'function' ? parts[name] : () => '');
  const hl = p('headline'), hlXL = parts.headlineXL ? p('headlineXL') : p('headline');
  const deckLine = p('deckLine'), para = p('para'), rows = p('rows'), steps = p('steps');
  const stats = p('stats'), quote = p('quote'), action = p('action'), media = p('media');
  const frame = parts.frame || ((inner, cls) => fitFrame(inner, cls));

  return {
    hook: (s, c) => frame(`${hlXL(s, c)}${parts.hookMark ? parts.hookMark(s, c) : ''}${deckLine(s, c)}`, 'body-hook'),
    problem: (s, c) => frame(`${hl(s, c)}${para(s, c)}${rows(s, c)}${media(s, c)}`, 'body-problem'),
    point: (s, c) => frame(`${hl(s, c)}${deckLine(s, c)}${media(s, c)}${rows(s, c)}${para(s, c)}`, 'body-point'),
    steps: (s, c) => frame(`${hl(s, c)}${para(s, c)}${steps(s, c)}${media(s, c)}`, 'body-steps'),
    stat: (s, c) => frame(`${hl(s, c)}${stats(s, c)}${para(s, c)}`, 'body-stat'),
    quote: (s, c) => frame(`${quote(s, c)}`, 'body-quote'),
    cta: (s, c) => frame(`${hlXL(s, c)}${action(s, c)}${para(s, c)}`, 'body-cta'),
  };
}

/**
 * The accumulator. A shared list lives once on the deck; each slide names how
 * far through it we are, and renders everything up to that point with only
 * the newest entry lit.
 *
 * This is the sibling of vintage-print's `reveal`: reveal spotlights one item
 * in a fixed list, the accumulator grows the list. Both exist because a run
 * of slides that visibly *advances* reads as designed, while the same content
 * on N unrelated slides reads as repetition — and both write the copy once,
 * so the steps cannot drift out of sync with each other.
 *
 * `render(entry, i, state)` is supplied by the theme; `state` is 'past',
 * 'new' or 'future'. Future entries are usually omitted, but a theme can
 * render them ghosted if the shape of what is coming is part of the point.
 */
export function accumulate(deck, slide, render, { showFuture = false, key = 'entries' } = {}) {
  const all = deck[key]?.items;
  if (!all || !all.length) {
    throw new Error(`This slide type needs deck.${key}.items — the shared list every slide draws from.`);
  }
  const upto = Number(slide.upto ?? slide.step ?? 0);
  if (!Number.isInteger(upto) || upto < 1 || upto > all.length) {
    throw new Error(`Slide has upto=${slide.upto}, but deck.${key}.items has ${all.length} entries (1-${all.length}).`);
  }
  const limit = showFuture ? all.length : upto;
  return all.slice(0, limit).map((entry, i) => {
    const state = i + 1 < upto ? 'past' : i + 1 === upto ? 'new' : 'future';
    return render(entry, i, state);
  }).join('');
}

/** Dispatches on media kind. Unknown kinds render nothing rather than throw. */
export function mediaCard(slide, accent) {
  const m = slide.media;
  if (!m) return '';
  if (m.kind === 'terminal') return terminalCard(m, accent);
  if (m.kind === 'image') return shotCard(m);
  return '';
}

/**
 * Reset plus the geometry every theme shares: canvas size, the safe-band
 * inset on `.body`, and the media cards' structural rules. Themes append
 * their own stylesheet after this and are free to restyle any of it.
 */
export function baseCSS(t) {
  const cv = t.canvas;
  return `
* { margin:0; padding:0; box-sizing:border-box; }
html, body { width:${cv.width}px; height:${cv.height}px; }
body { position:relative; overflow:hidden; -webkit-font-smoothing:antialiased; }

/* Instagram crops 4:5 to a centre square in the profile grid. Content never
   enters the safe bands; chrome may, because it is meant to be lost there. */
.body {
  position:absolute;
  left:${cv.margin}px; right:${cv.margin}px;
  top:${cv.safeTop}px; bottom:${cv.safeBottom}px;
  display:flex; flex-direction:column; justify-content:center;
  z-index:30;
}
.fit { display:flex; flex-direction:column; }
.ac { font-style:normal; }

.term { overflow:hidden; }
.term-bar, .shot-bar { display:flex; align-items:center; gap:8px; }
.term-bar i, .shot-bar i { width:12px; height:12px; border-radius:50%; }
.term-body { display:flex; flex-direction:column;
  font-family:ui-monospace, SFMono-Regular, Menlo, monospace; }
.shot { overflow:hidden; }
.shot img { display:block; width:100%; }

/* ── node graph: structure only, themes own every colour ─────────── */
.ng { position:relative; width:100%; }
.ng-wires { position:absolute; inset:0; width:100%; height:100%; }
.ng-node { position:absolute; transform:translate(-50%, -50%);
  display:flex; align-items:center; gap:10px; white-space:nowrap; }
.ng-txt { display:flex; flex-direction:column; }
.ng-txt b { font-weight:600; }
.ng-txt em { font-style:normal; }
.ng-ico svg, .ng-logo svg { display:block; }
.ng-elab { position:absolute; transform:translate(-50%, -50%); }

/* Object positioning is inline — see objectVisual. Only the badge needs CSS. */
.chip-logo svg { width:60%; height:60%; }

/* Marks are decoration and never take layout space. */
.mk { position:absolute; pointer-events:none; line-height:0; }
`;
}
