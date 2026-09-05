#!/usr/bin/env node
// Ingests the 3dicons packs into the shared object library.
//
//   node scripts/ingest-3dicons.js
//
// The source files are 3D renders exported as SVG: a 569KB median and a
// 1.3MB worst case, because each one is thousands of gradient meshes. Base64
// embedding those would put ~760KB of markup on a slide that displays the
// result at roughly 300 CSS pixels — so they are rasterised once, here, at
// the size they will actually be shown, and the renderer embeds a PNG.
//
// Packs share icon names, so `bulb` exists in all four styles. That is what
// makes the pack a *style* choice rather than a different library.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(HERE, '..', 'assets');
const OBJECTS = path.join(ASSETS, 'objects-3d');

// Rendered at ~0.2-0.3 of a 1080 canvas at 2x device scale, so ~650px is the
// largest it can ever be displayed. 512 is the honest size; anything more is
// bytes the reader never sees.
const SIZE = 512;

const SOURCES = [
  { dir: '3dicons - Clay white', pack: '3d-clay' },
  { dir: '3dicons - Color', pack: '3d-color' },
  { dir: '3dicons - Gradient', pack: '3d-gradient' },
  { dir: '3dicons - Premium', pack: '3d-premium' },
];

async function main() {
  // The Fluent set predates packs and lives flat. Move it into its own pack so
  // every object has the same shape; `fluent` stays the default, so existing
  // decks that say "object": "rocket" keep working untouched.
  const fluentDir = path.join(OBJECTS, 'fluent');
  const loose = fs.existsSync(OBJECTS)
    ? fs.readdirSync(OBJECTS).filter((f) => f.endsWith('.png'))
    : [];
  if (loose.length) {
    fs.mkdirSync(fluentDir, { recursive: true });
    for (const f of loose) fs.renameSync(path.join(OBJECTS, f), path.join(fluentDir, f));
    console.log(`moved ${loose.length} existing objects into objects-3d/fluent/`);
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: SIZE, height: SIZE } });
  const manifest = {};

  for (const src of SOURCES) {
    const from = path.join(ASSETS, src.dir);
    if (!fs.existsSync(from)) { console.log(`skip ${src.dir} — not found`); continue; }
    const to = path.join(OBJECTS, src.pack);
    fs.mkdirSync(to, { recursive: true });

    const files = fs.readdirSync(from)
      .filter((f) => f.endsWith('.svg') && !f.includes(' ')); // drop the cover art
    let bytes = 0;
    const names = [];

    for (const f of files) {
      const name = f.replace(/\.svg$/, '').toLowerCase();
      const svg = fs.readFileSync(path.join(from, f), 'utf8');
      await page.setContent(
        `<style>html,body{margin:0;background:transparent}
         svg{display:block;width:${SIZE}px;height:${SIZE}px}</style>${svg}`,
        { waitUntil: 'load' });
      const el = await page.$('svg');
      if (!el) { console.log(`  ! no <svg> in ${f}`); continue; }
      const out = path.join(to, `${name}.png`);
      await el.screenshot({ path: out, omitBackground: true });
      bytes += fs.statSync(out).size;
      names.push(name);
    }

    manifest[src.pack] = names.sort();
    console.log(`${src.pack.padEnd(14)} ${names.length} icons, ${(bytes / 1048576).toFixed(1)} MB`);
  }

  await browser.close();

  if (fs.existsSync(fluentDir)) {
    manifest.fluent = fs.readdirSync(fluentDir)
      .filter((f) => f.endsWith('.png')).map((f) => f.slice(0, -4)).sort();
  }
  fs.writeFileSync(path.join(OBJECTS, 'packs.json'), JSON.stringify(manifest, null, 2));
  console.log(`\nmanifest: objects-3d/packs.json (${Object.keys(manifest).length} packs)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
