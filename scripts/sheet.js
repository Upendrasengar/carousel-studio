#!/usr/bin/env node
// Rebuilds the contact sheet for a directory that is already rendered.
//
//   node scripts/sheet.js out/mcb-agent-anatomy --theme console
//   node scripts/sheet.js out/manifest-demo --theme manifest --preview
//
// render.js writes the sheet itself on every run, so this is for the cases
// where that is not what you have: an older output directory, a folder of
// slides assembled by hand, or a preview you want refreshed without paying for
// the render again.

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { loadTheme, THEMES_DIR } from './lib/theme.js';
import { buildSheet } from './lib/sheet.js';

const USAGE = `Usage: node scripts/sheet.js <dir> [options]

  --theme <name>   label the sheet with this theme pack's name and description
  --out <file>     write here instead of <dir>/_review-sheet.png
  --preview        also write to themes/<theme>/preview.png (needs --theme)
  --width <px>     sheet width, default 2400`;

function parseArgs(argv) {
  const a = argv.slice(2);
  const out = { dir: null, theme: null, file: null, preview: false, width: 2400 };
  const fail = (m) => { console.error(`${m}\n\n${USAGE}`); process.exit(1); };
  const value = (flag, i) => {
    if (i + 1 >= a.length || a[i + 1].startsWith('-')) fail(`${flag} expects a value.`);
    return a[i + 1];
  };
  const pos = [];
  for (let i = 0; i < a.length; i++) {
    if (a[i] === '--theme') out.theme = value('--theme', i++);
    else if (a[i] === '--out') out.file = value('--out', i++);
    else if (a[i] === '--preview') out.preview = true;
    else if (a[i] === '--width') {
      const n = parseInt(value('--width', i++), 10);
      if (!Number.isInteger(n) || n < 400) fail('--width expects a whole number of pixels, 400 or more.');
      out.width = n;
    } else if (a[i].startsWith('-')) fail(`Unknown option "${a[i]}".`);
    else pos.push(a[i]);
  }
  if (pos.length > 1) fail(`Unexpected argument "${pos[1]}" — this takes one directory.`);
  out.dir = pos[0];
  return out;
}

const args = parseArgs(process.argv);
if (!args.dir) { console.error(USAGE); process.exit(1); }
if (!fs.existsSync(args.dir)) { console.error(`No such directory: ${args.dir}`); process.exit(1); }
if (args.preview && !args.theme) { console.error('--preview needs --theme: the preview is written into that pack.\n\n' + USAGE); process.exit(1); }

const theme = args.theme ? await loadTheme(args.theme) : null;

// The fit measurements come from the render that produced these slides. Absent,
// the sheet still builds — it just carries pictures and no numbers.
const reportPath = path.join(args.dir, 'render-report.json');
const report = fs.existsSync(reportPath) ? JSON.parse(fs.readFileSync(reportPath, 'utf8')) : null;
if (!report) console.warn('  ! no render-report.json here — the sheet will carry no fit measurements');

const browser = await chromium.launch();
try {
  const outFile = args.file || path.join(args.dir, '_review-sheet.png');
  const sheet = await buildSheet(browser, { dir: args.dir, outFile, theme, report, width: args.width });
  console.log(`  ${outFile}  (${sheet.slides} slides, ${sheet.cols} across)`);
  if (args.preview) {
    const previewFile = path.join(THEMES_DIR, theme.name, 'preview.png');
    fs.copyFileSync(outFile, previewFile);
    console.log(`  ${previewFile}  (theme preview updated)`);
  }
} finally {
  await browser.close();
}
