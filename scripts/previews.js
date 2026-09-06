#!/usr/bin/env node
// Gives every theme pack a picture of itself.
//
//   node scripts/previews.js                       # every theme missing one
//   node scripts/previews.js manifest ladder       # just these
//   node scripts/previews.js --all                 # rebuild all, including existing
//   node scripts/previews.js --decks ../content/decks
//
// For each theme it finds the best deck available locally — the one already
// written for that theme, preferring the one with the most slides, because a
// preview is only useful if it exercises the pack's signature slide types —
// renders it, and writes the contact sheet to themes/<name>/preview.png.
//
// Rendering example.json in every theme would be cheaper and would lie: it has
// no `group`, no `entry`, no `wire`, no code card. A preview built from it
// would show thirty packs all doing the same four slide types.

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { listThemes, THEMES_DIR } from './lib/theme.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');

const USAGE = `Usage: node scripts/previews.js [theme ...] [options]

  --all              rebuild previews that already exist, not just missing ones
  --decks <dir>      also search this directory for decks (repeatable)
  --keep             keep the render output instead of using a temp directory`;

function parseArgs(argv) {
  const a = argv.slice(2);
  const out = { themes: [], all: false, deckDirs: ['decks', 'decks/.local'], keep: false };
  const fail = (m) => { console.error(`${m}\n\n${USAGE}`); process.exit(1); };
  const value = (flag, i) => {
    if (i + 1 >= a.length || a[i + 1].startsWith('-')) fail(`${flag} expects a value.`);
    return a[i + 1];
  };
  for (let i = 0; i < a.length; i++) {
    if (a[i] === '--all') out.all = true;
    else if (a[i] === '--keep') out.keep = true;
    else if (a[i] === '--decks') out.deckDirs.push(value('--decks', i++));
    else if (a[i].startsWith('-')) fail(`Unknown option "${a[i]}".`);
    else out.themes.push(a[i]);
  }
  return out;
}

const args = parseArgs(process.argv);

/** Every deck readable from the search paths, indexed by the theme it declares. */
function deckIndex(dirs) {
  const byTheme = new Map();
  for (const d of dirs) {
    const dir = path.isAbsolute(d) ? d : path.join(ROOT, d);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
      const file = path.join(dir, f);
      let deck;
      try { deck = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { continue; }
      if (!deck?.theme || !Array.isArray(deck.slides)) continue;
      const list = byTheme.get(deck.theme) || [];
      list.push({ file, slides: deck.slides.length });
      byTheme.set(deck.theme, list);
    }
  }
  // Most slides wins; the filename breaks ties so the choice is the same on
  // every machine and a preview does not silently change deck between runs.
  for (const list of byTheme.values()) {
    list.sort((a, b) => b.slides - a.slides || a.file.localeCompare(b.file));
  }
  return byTheme;
}

const decks = deckIndex(args.deckDirs);
const all = listThemes().map((t) => t.name);
const unknown = args.themes.filter((t) => !all.includes(t));
if (unknown.length) {
  console.error(`No theme "${unknown[0]}". Available: ${all.join(', ')}`);
  process.exit(1);
}

const targets = (args.themes.length ? args.themes : all)
  .filter((t) => args.all || args.themes.includes(t) || !fs.existsSync(path.join(THEMES_DIR, t, 'preview.png')));

if (!targets.length) {
  console.log('\nEvery theme already has a preview. Use --all to rebuild them.\n');
  process.exit(0);
}

const tmpRoot = args.keep ? path.join(ROOT, 'out', '_previews') : fs.mkdtempSync(path.join(os.tmpdir(), 'cs-previews-'));
fs.mkdirSync(tmpRoot, { recursive: true });

const done = [];
const skipped = [];
const failed = [];

console.log(`\n${targets.length} theme(s) to preview\n`);
for (const name of targets) {
  const pick = decks.get(name)?.[0];
  if (!pick) {
    skipped.push(name);
    console.log(`  SKIP   ${name.padEnd(20)} no deck declares this theme — write one, or pass --decks <dir>`);
    continue;
  }
  const outDir = path.join(tmpRoot, name);
  try {
    execFileSync('node', [
      path.join(HERE, 'render.js'), pick.file, outDir, '--theme', name, '--preview',
    ], { cwd: ROOT, stdio: 'pipe' });
    done.push(name);
    console.log(`  ok     ${name.padEnd(20)} ${pick.slides} slides from ${path.relative(ROOT, pick.file)}`);
  } catch (e) {
    // A deck that overflows exits 1 but still writes every slide and the
    // sheet. That is a preview worth having — it shows the pack under real
    // pressure. Only a missing preview file is a genuine failure.
    if (fs.existsSync(path.join(THEMES_DIR, name, 'preview.png'))) {
      done.push(name);
      console.log(`  ok*    ${name.padEnd(20)} ${pick.slides} slides, deck has fit warnings`);
    } else {
      failed.push(name);
      const tail = (e.stdout?.toString() || e.stderr?.toString() || e.message).trim().split('\n').slice(-2).join(' ');
      console.log(`  FAIL   ${name.padEnd(20)} ${tail}`);
    }
  }
}

if (!args.keep) fs.rmSync(tmpRoot, { recursive: true, force: true });

console.log(`\n${done.length} preview(s) written to themes/<name>/preview.png`);
if (skipped.length) console.log(`${skipped.length} skipped, no deck: ${skipped.join(', ')}`);
if (failed.length) {
  console.log(`${failed.length} failed: ${failed.join(', ')}`);
  process.exitCode = 1;
}
console.log('');
