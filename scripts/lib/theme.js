// Theme-pack loader.
//
// A theme pack is a directory with theme.json (tokens), templates.js (slide
// types + stylesheet) and assets/. Nothing else in the pipeline knows what a
// theme looks like, which is the point: adding a sixth theme is adding a
// directory, not editing the renderer.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const THEMES_DIR = path.join(HERE, '..', '..', 'themes');

export function listThemes() {
  if (!fs.existsSync(THEMES_DIR)) return [];
  return fs.readdirSync(THEMES_DIR)
    .filter((d) => fs.existsSync(path.join(THEMES_DIR, d, 'theme.json')))
    .map((d) => {
      const t = JSON.parse(fs.readFileSync(path.join(THEMES_DIR, d, 'theme.json'), 'utf8'));
      return { name: d, label: t.label || d, description: t.description || '' };
    });
}

/** Embeds each declared face as base64 so headless Chromium can never fall
 *  back to a system font. A silent fallback is unreproducible and you only
 *  notice it after the deck is posted. */
function fontFaces(tokens, dir) {
  return Object.entries(tokens.font || {}).map(([role, f]) => {
    // A theme's own assets/fonts wins, then the shared pool. Ten theme packs
    // holding forty copies of IBM Plex is forty megabytes of duplication and
    // forty files to keep in sync.
    const local = path.join(dir, 'assets', 'fonts', f.file);
    const shared = path.join(THEMES_DIR, '..', 'assets', 'fonts', f.file);
    const file = fs.existsSync(local) ? local : shared;
    if (!fs.existsSync(file)) {
      throw new Error(`Theme "${tokens.name}" declares font ${role} -> ${f.file}, which is missing.\n  Looked in: ${local}\n  and: ${shared}\n  Run: node scripts/get-fonts.js shared`);
    }
    const b64 = fs.readFileSync(file).toString('base64');
    const family = role.charAt(0).toUpperCase() + role.slice(1);
    return `@font-face{font-family:${family};src:url(data:font/woff2;base64,${b64}) format('woff2');font-weight:${f.weight};font-display:block;}`;
  }).join('\n');
}

export async function loadTheme(name) {
  const dir = path.join(THEMES_DIR, name);
  const tokensPath = path.join(dir, 'theme.json');
  if (!fs.existsSync(tokensPath)) {
    const have = listThemes().map((t) => t.name).join(', ') || '(none)';
    throw new Error(`No theme "${name}". Available: ${have}`);
  }
  const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
  const mod = await import(pathToFileURL(path.join(dir, 'templates.js')).href);
  return { name, dir, tokens, faces: fontFaces(tokens, dir), templates: mod };
}

/** Platform presets. The theme owns the look; the platform owns the box. */
export const PLATFORMS = {
  'instagram-portrait': { width: 1080, height: 1350, scale: 2 },
  'instagram-square':   { width: 1080, height: 1080, scale: 2 },
  'instagram-story':    { width: 1080, height: 1920, scale: 2 },
  'linkedin':           { width: 1200, height: 1500, scale: 2 },
  'x':                  { width: 1600, height: 900,  scale: 2 },
};
