#!/usr/bin/env node
// Audits the skill for the gaps that make it unusable by an agent.
//
//   node scripts/doctor.js
//
// Rendering correctness is covered by check.js and by looking at the output.
// This checks something different and easier to miss: whether a fresh agent,
// reading only SKILL.md and references/, could discover and correctly use
// everything that exists. A theme nobody can find is not a theme.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const STANDARD = ['hook', 'problem', 'point', 'steps', 'stat', 'quote', 'cta'];

const issues = [];
const add = (level, where, msg) => issues.push({ level, where, msg });

const themes = fs.readdirSync(path.join(ROOT, 'themes'))
  .filter((d) => fs.existsSync(path.join(ROOT, 'themes', d, 'theme.json')));

const skill = read('SKILL.md');
const schema = read('references/deck-schema.md');
const checker = read('scripts/check.js');

for (const t of themes) {
  if (!fs.existsSync(path.join(ROOT, 'themes', t, 'rules.md'))) {
    add('ERROR', t, 'no rules.md — SKILL.md tells the agent to read one');
  }
  if (!skill.includes('`' + t + '`')) {
    add('ERROR', t, 'not in SKILL.md — an agent cannot discover this theme');
  }

  const mod = await import(pathToFileURL(path.join(ROOT, 'themes', t, 'templates.js')).href);
  for (const ty of mod.SLIDE_TYPES.filter((x) => !STANDARD.includes(x))) {
    if (!schema.includes('`' + ty + '`')) {
      add('ERROR', `${t}/${ty}`, 'signature slide type is undocumented in deck-schema.md');
    }
    // A mechanic with no validation fails at render time instead of at check
    // time, which is backwards — check.js exists so a bad deck never renders.
    if (!checker.includes(`'${ty}'`)) {
      add('WARN', `${t}/${ty}`, 'no validation in check.js — malformed decks fail at render');
    }
  }
}

const errors = issues.filter((i) => i.level === 'ERROR');
console.log(`\n${themes.length} themes\n`);
for (const i of issues) {
  console.log(`  ${i.level.padEnd(5)}  ${i.where.padEnd(26)} ${i.msg}`);
}
console.log(issues.length
  ? `\n  ${errors.length} error(s), ${issues.length - errors.length} warning(s)\n`
  : '  everything discoverable and documented\n');
process.exitCode = errors.length ? 1 : 0;
