#!/usr/bin/env node
// Refreshes a theme's woff2 files from Google Fonts.
//
//   node scripts/get-fonts.js pixel-mascot
//
// Fonts are vendored into the theme, not fetched at render time, so a render
// never depends on the network or on whatever happens to be installed in the
// container. Run this only when changing a theme's typefaces.

import fs from 'node:fs';
import path from 'node:path';
import { THEMES_DIR } from './lib/theme.js';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

// Which family each theme's font roles map to.
const SHARED = [
  { file: 'grotesque-800.woff2', family: 'Bricolage+Grotesque:opsz,wght@12..96,800' },
  { file: 'grotesque-500.woff2', family: 'Bricolage+Grotesque:opsz,wght@12..96,500' },
  { file: 'sans-400.woff2',      family: 'IBM+Plex+Sans:wght@400' },
  { file: 'sans-600.woff2',      family: 'IBM+Plex+Sans:wght@600' },
  { file: 'serif-700.woff2',     family: 'Playfair+Display:wght@700' },
  { file: 'serif-900.woff2',     family: 'Playfair+Display:wght@900' },
  { file: 'serif-italic.woff2',  family: 'Playfair+Display:ital,wght@1,700' },
  { file: 'typewriter-400.woff2', family: 'Courier+Prime:wght@400' },
  { file: 'typewriter-700.woff2', family: 'Courier+Prime:wght@700' },
  { file: 'didone-500.woff2',    family: 'Bodoni+Moda:opsz,wght@6..96,500' },
  { file: 'didone-700.woff2',    family: 'Bodoni+Moda:opsz,wght@6..96,700' },
  { file: 'slab-400.woff2',      family: 'Alfa+Slab+One:wght@400' },
  { file: 'condensed-400.woff2', family: 'Oswald:wght@400' },
  { file: 'condensed-600.woff2', family: 'Oswald:wght@600' },
  { file: 'condensed-700.woff2', family: 'Oswald:wght@700' },
  { file: 'mono-400.woff2',      family: 'JetBrains+Mono:wght@400' },
  { file: 'mono-700.woff2',      family: 'JetBrains+Mono:wght@700' },
  { file: 'impact-400.woff2',    family: 'Archivo+Black:wght@400' },
  { file: 'geo-500.woff2',       family: 'Space+Grotesk:wght@500' },
  { file: 'geo-700.woff2',       family: 'Space+Grotesk:wght@700' },
  { file: 'hand-600.woff2',      family: 'Caveat:wght@600' },
  { file: 'hand-700.woff2',      family: 'Caveat:wght@700' },
];

const FACES = {
  promptcard: [
    { file: 'display.woff2',     family: 'Figtree:wght@800' },
    { file: 'displayMid.woff2',  family: 'Figtree:wght@600' },
    { file: 'body.woff2',        family: 'Figtree:wght@400' },
    { file: 'serifItalic.woff2', family: 'Playfair+Display:ital,wght@1,700' },
  ],
  briefing: [
    { file: 'display.woff2',    family: 'Figtree:wght@800' },
    { file: 'body.woff2',       family: 'Figtree:wght@400' },
    { file: 'bodyMid.woff2',    family: 'Figtree:wght@600' },
    { file: 'bodyBold.woff2',   family: 'Figtree:wght@700' },
    { file: 'italic.woff2',     family: 'Figtree:ital,wght@1,600' },
    { file: 'mono.woff2',       family: 'JetBrains+Mono:wght@500' },
    { file: 'monoBold.woff2',   family: 'JetBrains+Mono:wght@700' },
  ],
  'index-rail': [
    { file: 'display.woff2',  family: 'Source+Serif+4:opsz,wght@8..60,700' },
    { file: 'body.woff2',     family: 'Figtree:wght@500' },
    { file: 'bodyBold.woff2', family: 'Figtree:wght@700' },
    { file: 'mono.woff2',     family: 'JetBrains+Mono:wght@500' },
    { file: 'monoBold.woff2', family: 'JetBrains+Mono:wght@700' },
  ],
  'pixel-mascot': [
    { file: 'display.woff2',         family: 'Bricolage+Grotesque:opsz,wght@12..96,800' },
    { file: 'display-regular.woff2', family: 'Bricolage+Grotesque:opsz,wght@12..96,500' },
    { file: 'body.woff2',            family: 'IBM+Plex+Sans:wght@400' },
    { file: 'body-medium.woff2',     family: 'IBM+Plex+Sans:wght@600' },
  ],
  'scrapbook-editorial': [
    { file: 'display.woff2',      family: 'Playfair+Display:wght@700' },
    { file: 'display-black.woff2',family: 'Playfair+Display:wght@900' },
    { file: 'note.woff2',         family: 'Courier+Prime:wght@700' },
    { file: 'body.woff2',         family: 'IBM+Plex+Sans:wght@400' },
    { file: 'body-medium.woff2',  family: 'IBM+Plex+Sans:wght@600' },
  ],
  'parchment-vault': [
    { file: 'display.woff2',      family: 'Playfair+Display:wght@700' },
    { file: 'display-italic.woff2', family: 'Playfair+Display:ital,wght@1,700' },
    { file: 'note.woff2',         family: 'Courier+Prime:wght@400' },
    { file: 'body.woff2',         family: 'IBM+Plex+Sans:wght@400' },
    { file: 'body-medium.woff2',  family: 'IBM+Plex+Sans:wght@600' },
  ],
  'spotlight-minimal': [
    { file: 'display.woff2',      family: 'Bodoni+Moda:opsz,wght@6..96,500' },
    { file: 'display-bold.woff2', family: 'Bodoni+Moda:opsz,wght@6..96,700' },
    { file: 'body.woff2',         family: 'IBM+Plex+Sans:wght@400' },
    { file: 'body-medium.woff2',  family: 'IBM+Plex+Sans:wght@600' },
  ],
  'notebook-tabs': [
    { file: 'display.woff2',      family: 'Playfair+Display:wght@700' },
    { file: 'display-black.woff2',family: 'Playfair+Display:wght@900' },
    { file: 'body.woff2',         family: 'IBM+Plex+Sans:wght@400' },
    { file: 'body-medium.woff2',  family: 'IBM+Plex+Sans:wght@600' },
  ],
  'vintage-print': [
    { file: 'display.woff2',      family: 'Alfa+Slab+One:wght@400' },
    { file: 'label.woff2',        family: 'Oswald:wght@600' },
    { file: 'label-light.woff2',  family: 'Oswald:wght@400' },
    { file: 'body.woff2',         family: 'Courier+Prime:wght@400' },
    { file: 'body-medium.woff2',  family: 'Courier+Prime:wght@700' },
  ],
};

async function grab(face, dir) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${face.family}&display=swap`;
  const css = await (await fetch(cssUrl, { headers: { 'User-Agent': UA } })).text();

  // Keep only the latin subset block, then take the last woff2 url in it.
  const blocks = css.split('@font-face').filter((b) => b.includes('U+0000-00FF'));
  const block = blocks[blocks.length - 1] || css;
  const m = [...block.matchAll(/url\((https:[^)]+\.woff2)\)/g)].pop();
  if (!m) throw new Error(`No woff2 in the CSS for ${face.file}`);

  const buf = Buffer.from(await (await fetch(m[1])).arrayBuffer());
  fs.writeFileSync(path.join(dir, face.file), buf);
  console.log(`  ${face.file.padEnd(24)} ${(buf.length / 1024).toFixed(0)} KB`);
}

const theme = process.argv[2] || 'shared';
const faces = theme === 'shared' ? SHARED : FACES[theme];
if (!faces) {
  console.error(`No font manifest for "${theme}". Known: shared, ${Object.keys(FACES).join(', ')}`);
  process.exit(1);
}
const dir = theme === 'shared'
  ? path.join(THEMES_DIR, '..', 'assets', 'fonts')
  : path.join(THEMES_DIR, theme, 'assets', 'fonts');
fs.mkdirSync(dir, { recursive: true });
console.log(`\nFetching fonts for ${theme}`);
for (const f of faces) await grab(f, dir);
console.log('Done.\n');
