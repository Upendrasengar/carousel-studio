#!/usr/bin/env node
// Fetches colour brand marks for tools that Simple Icons does not carry.
//
//   node scripts/get-brands.js granola:granola.ai otterai:otter.ai
//   node scripts/get-brands.js --list
//
// Simple Icons is the default source and should stay that way: it is CC0,
// vector, and every mark is the same monochrome silhouette, so a row of them
// reads as one set. Favicons are the opposite — some are transparent glyphs,
// some are coloured app tiles, all at different res. Use this only for brands
// Simple Icons genuinely lacks.
//
// DuckDuckGo rather than Google: tested side by side, DDG returns transparent
// PNGs where Google returns the mark baked onto a black square, and DDG has
// the higher native resolution more often.
//
// Fetched ONCE, here, and cached to disk. Nothing in this pipeline touches
// the network at render time, and a favicon URL in a template would break
// that and make renders non-reproducible.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, '..', 'assets', 'logos-color');
const SIMPLE = path.join(HERE, '..', 'assets', 'logos');
const SIZE = 128;

if (process.argv[2] === '--list') {
  const have = fs.existsSync(OUT) ? fs.readdirSync(OUT).filter((f) => f.endsWith('.png')) : [];
  console.log(have.length ? have.map((f) => '  ' + f.slice(0, -4)).join('\n') : '  (none yet)');
  process.exit(0);
}

const pairs = process.argv.slice(2).map((a) => {
  const [name, domain] = a.split(':');
  if (!name || !domain) throw new Error(`Expected name:domain, got "${a}"`);
  return { name: name.toLowerCase(), domain };
});
if (!pairs.length) {
  console.error('Usage: node scripts/get-brands.js <name>:<domain> [...]  |  --list');
  process.exit(1);
}

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: SIZE, height: SIZE } });

for (const { name, domain } of pairs) {
  if (fs.existsSync(path.join(SIMPLE, `${name}.svg`))) {
    console.log(`  ${name.padEnd(16)} skipped — already in Simple Icons (vector, use that)`);
    continue;
  }
  const r = await fetch(`https://icons.duckduckgo.com/ip3/${domain}.ico`, { redirect: 'follow' });
  if (!r.ok) { console.log(`  ${name.padEnd(16)} FAILED ${r.status}`); continue; }
  const buf = Buffer.from(await r.arrayBuffer());

  // Normalise through the browser: it decodes .ico, and object-fit trims the
  // letterboxing that favicons habitually ship with.
  await page.setContent(`<style>html,body{margin:0;background:transparent}
    img{width:${SIZE}px;height:${SIZE}px;object-fit:contain;display:block}</style>
    <img src="data:image/x-icon;base64,${buf.toString('base64')}">`, { waitUntil: 'load' });
  const el = await page.$('img');
  const out = path.join(OUT, `${name}.png`);
  await el.screenshot({ path: out, omitBackground: true });
  console.log(`  ${name.padEnd(16)} ${(fs.statSync(out).size / 1024).toFixed(0)} KB  <- ${domain}`);
}

await browser.close();
console.log('\nColour marks are a fallback. Simple Icons stays the default source.');
