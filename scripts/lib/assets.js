// The shared asset library: 3D objects, brand logos and line icons.
//
// Files live in ../../assets and are downloaded by scripts/get-assets.js.
// Licences are recorded in assets/LICENSES.md — all permissive, because these
// end up inside images posted to a commercial account.
//
// Everything is read from disk and embedded at render time, exactly like the
// fonts: a render never touches the network, and a missing asset is a loud
// error rather than a silently empty box.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(HERE, '..', '..', 'assets');
const DIRS = {
  object: path.join(ASSETS, 'objects-3d'),
  logo: path.join(ASSETS, 'logos'),
  icon: path.join(ASSETS, 'icons'),
  // Colour fallbacks for brands Simple Icons does not carry. Filled by
  // scripts/get-brands.js, never fetched at render time.
  brand: path.join(ASSETS, 'logos-color'),
};

const cache = new Map();

function list(kind, ext) {
  const key = `list:${kind}`;
  if (!cache.has(key)) {
    const dir = DIRS[kind];
    const names = fs.existsSync(dir)
      ? fs.readdirSync(dir).filter((f) => f.endsWith(ext)).map((f) => f.slice(0, -ext.length)).sort()
      : [];
    cache.set(key, names);
  }
  return cache.get(key);
}

/**
 * 3D objects are organised into style packs that share icon names, so `bulb`
 * exists in every pack and switching pack restyles a whole deck without
 * touching a single slide. `fluent` is the default, which is what keeps decks
 * written before packs existed working unchanged.
 */
export const DEFAULT_PACK = 'fluent';

function packs() {
  if (!cache.has('packs')) {
    const f = path.join(DIRS.object, 'packs.json');
    let m = {};
    if (fs.existsSync(f)) m = JSON.parse(fs.readFileSync(f, 'utf8'));
    else if (fs.existsSync(DIRS.object)) {
      // No manifest yet — derive it from the directories on disk.
      for (const d of fs.readdirSync(DIRS.object)) {
        const dir = path.join(DIRS.object, d);
        if (fs.statSync(dir).isDirectory()) {
          m[d] = fs.readdirSync(dir).filter((x) => x.endsWith('.png')).map((x) => x.slice(0, -4)).sort();
        }
      }
    }
    cache.set('packs', m);
  }
  return cache.get('packs');
}

export const OBJECT_PACKS = () => Object.keys(packs()).sort();
export const OBJECT_NAMES = (pack = DEFAULT_PACK) => packs()[pack] || [];

/** Splits "3d-color:bulb" into { pack, name }; a bare name uses the default. */
export function parseObject(spec, fallbackPack) {
  const s2 = String(spec || '');
  const i = s2.indexOf(':');
  return i > 0
    ? { pack: s2.slice(0, i), name: s2.slice(i + 1) }
    : { pack: fallbackPack || DEFAULT_PACK, name: s2 };
}
export const LOGO_NAMES = () => list('logo', '.svg');
export const ICON_NAMES = () => list('icon', '.svg');

function read(kind, name, ext) {
  const key = `${kind}:${name}`;
  if (cache.has(key)) return cache.get(key);
  const file = path.join(DIRS[kind], `${name}${ext}`);
  if (!fs.existsSync(file)) return null;
  const data = ext === '.png'
    ? `data:image/png;base64,${fs.readFileSync(file).toString('base64')}`
    : fs.readFileSync(file, 'utf8');
  cache.set(key, data);
  return data;
}

export function hasObject(spec, fallbackPack) {
  const { pack, name } = parseObject(spec, fallbackPack);
  return !!name && (OBJECT_NAMES(pack) || []).includes(name);
}
export function hasLogo(name) { return !!name && !!read('logo', name, '.svg'); }
export function hasIcon(name) { return !!name && !!read('icon', name, '.svg'); }

/** A 3D-rendered object as a data URI. Throws on a typo — a silently missing
 *  hero image is worse than a failed render. */
export function object3d(spec, fallbackPack) {
  const { pack, name } = parseObject(spec, fallbackPack);
  const d = read('object', path.join(pack, name), '.png');
  if (!d) {
    const known = OBJECT_NAMES(pack);
    if (!known.length) {
      throw new Error(`No object pack "${pack}". Have: ${OBJECT_PACKS().join(', ') || '(none — run scripts/get-assets.js)'}`);
    }
    throw new Error(`No object "${name}" in pack "${pack}". ${known.length} available, e.g. ${known.slice(0, 12).join(', ')}`);
  }
  return d;
}

/**
 * A brand mark as inline SVG. Simple Icons ship a solid path with no fill
 * attribute, so it inherits — passing a colour sets it explicitly, and
 * omitting it lets the surrounding CSS drive.
 */
export function logo(name, color) {
  const svg = read('logo', name, '.svg');
  if (!svg) return null;
  const cleaned = svg.replace(/<title>.*?<\/title>/s, '');
  return color
    ? cleaned.replace('<svg ', `<svg fill="${color}" `)
    : cleaned.replace('<svg ', '<svg fill="currentColor" ');
}

export const BRAND_NAMES = () => list('brand', '.png');
export function hasBrand(name) { return !!name && !!read('brand', name, '.png'); }

/**
 * A brand mark, preferring the vector monochrome set.
 *
 * Simple Icons first, always: every mark there is the same silhouette at the
 * same weight, so a row of them reads as one set. A colour favicon dropped
 * into that row is instantly the loudest thing on the slide. The colour
 * fallback exists for tools Simple Icons genuinely lacks — and returns a
 * data-URI <img>, so callers can tell the two apart if they want to.
 */
export function brandMark(name, color) {
  const svg = logo(name, color);
  if (svg) return { kind: 'vector', html: svg };
  const png = read('brand', name, '.png');
  if (png) return { kind: 'color', html: `<img src="${png}" alt="">` };
  return null;
}

/** A Lucide line icon as inline SVG. Stroke is currentColor already. */
export function lineIcon(name) {
  const svg = read('icon', name, '.svg');
  if (!svg) return null;
  return svg.replace(/<!--.*?-->/s, '').trim();
}
