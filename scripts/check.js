#!/usr/bin/env node
// Validates a deck against a theme's rules before anything is rendered.
//
//   node scripts/check.js decks/example.json
//   node scripts/check.js decks/example.json --theme pixel-mascot
//
// Rendering is the slow part, so copy problems should be caught here. The
// budgets are not style preferences: they are the lengths at which the
// layout still holds without the auto-fit safety net firing. A deck that
// passes check.js and still shrinks at render time means a budget is wrong,
// which is worth knowing.

import fs from 'node:fs';
import path from 'node:path';
import { loadTheme } from './lib/theme.js';
import { POSE_NAMES } from './lib/mascot.js';
import { allIconNames } from './lib/icons.js';
import { OBJECT_NAMES, OBJECT_PACKS, LOGO_NAMES, BRAND_NAMES, parseObject, DEFAULT_PACK } from './lib/assets.js';

const hasBrandFallback = (n) => BRAND_NAMES().includes(n);
import { PROP_NAMES, DRESSING_NAMES } from './lib/props.js';

const ERR = 'error', WARN = 'warn';

/** Relative luminance per WCAG 2.1. */
function luminance(hex) {
  const v = hex.replace('#', '');
  const full = v.length === 3 ? [...v].map((c) => c + c).join('') : v;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(full.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

function textOf(s) {
  return String(s == null ? '' : s).replace(/\*/g, '');
}

export function checkDeck(deck, theme) {
  const t = theme.tokens;
  const B = t.budgets || {};
  const types = new Set(theme.templates.SLIDE_TYPES);
  const issues = [];
  const add = (level, where, msg) => issues.push({ level, where, msg });

  if (!Array.isArray(deck.slides) || !deck.slides.length) {
    add(ERR, 'deck', 'No slides.');
    return issues;
  }
  if (deck.slides.length < 4) add(WARN, 'deck', `${deck.slides.length} slides. Carousels under 4 rarely earn the swipe.`);
  if (deck.slides.length > 12) add(WARN, 'deck', `${deck.slides.length} slides. Past ~10 the completion rate falls off a cliff.`);
  if (!deck.slug && !deck.seed) add(WARN, 'deck', 'No slug or seed. Layout variation will key off the title, so renaming the deck reshuffles it.');

  const first = deck.slides[0].type;
  const last = deck.slides[deck.slides.length - 1].type;
  const OPENERS = ['hook', 'cover', 'strip'];
  if (!OPENERS.includes(first)) {
    add(WARN, 'slide 1', `First slide is "${first}". A deck opens on a hook — or on this theme's equivalent (${OPENERS.slice(1).join(', ')}).`);
  }
  if (last !== 'cta') add(WARN, `slide ${deck.slides.length}`, `Last slide is "${last}". Without a cta the deck has no ask.`);

  // Instagram re-serves a carousel starting from slide 2, so slide 2 is a
  // second hook, not a continuation. A slide that only makes sense after
  // slide 1 is a slide most viewers will meet cold.
  const second = deck.slides[1];
  if (second) {
    const text = textOf(second.headline || second.quote || '');
    if (/^(and|but|so|then|that|this means|which)\b/i.test(text.trim())) {
      add(WARN, 'slide 2', 'Opens with a continuation word. Instagram re-serves the deck from slide 2, so it has to stand alone as a second hook.');
    }
    if (text && text.length < 12) {
      add(WARN, 'slide 2', 'Very short. Slide 2 is the backup hook and carries almost as much weight as slide 1.');
    }
  }

  if (deck.slides.length < 8) {
    add(WARN, 'deck', `${deck.slides.length} slides. The current engagement band is 8-10; under 8 tends to underperform.`);
  }

  const cap = (where, field, str, limit) => {
    if (!limit) return;
    const n = textOf(str).length;
    if (n > limit * 1.35) add(ERR, where, `${field} is ${n} chars against a ${limit} budget. Auto-fit cannot save this — cut it.`);
    else if (n > limit) add(WARN, where, `${field} is ${n} chars against a ${limit} budget. It will render, slightly shrunk.`);
  };

  deck.slides.forEach((s, i) => {
    const where = `slide ${i + 1} (${s.type})`;

    if (!types.has(s.type)) {
      add(ERR, where, `Unknown type "${s.type}". Theme has: ${[...types].join(', ')}`);
      return;
    }

    cap(where, 'eyebrow', s.eyebrow, B.eyebrow);
    cap(where, 'headline', s.headline, B.headline);
    cap(where, 'deck', s.deck, B.deck);
    cap(where, 'body', s.body, B.body);
    cap(where, 'quote', s.quote, B.quote);
    cap(where, 'note', s.note, B.note);
    cap(where, 'callout', s.callout, B.caption);

    // Theme-specific fields, checked only where the theme actually has them.
    if (s.note && !B.note) add(WARN, where, 'This theme has no margin note; the "note" field will be ignored.');
    if (s.callout && !types.has('point')) add(WARN, where, 'Callout on a theme that does not render one.');
    if (s.beam) {
      const names = (t.beams || []).map((b) => b.name);
      if (!names.length) add(WARN, where, 'This theme has no beams; the "beam" field will be ignored.');
      else if (!names.includes(s.beam)) add(ERR, where, `Unknown beam "${s.beam}". Have: ${names.join(', ')}`);
    }

    // One loud element per slide. Two accent spans is two loud elements.
    const accents = (String(s.headline || s.quote || '').match(/\*[^*]+\*/g) || []).length;
    if (accents > 1) add(WARN, where, `${accents} accent spans in the headline. The accent should touch exactly one thing.`);
    if (s.type === 'stat' && accents > 0) add(WARN, where, 'Accent in a stat headline competes with the stat values, which are already the loud element.');

    const list = s.steps || s.rows;
    if (list) {
      const max = s.type === 'steps' ? (B.maxSteps || 5) : (B.maxRows || 5);
      if (list.length > max) add(ERR, where, `${list.length} rows against a max of ${max}. Split the slide.`);
      list.forEach((r, j) => {
        cap(`${where} row ${j + 1}`, 'title', r.title, B.rowTitle);
        cap(`${where} row ${j + 1}`, 'body', r.body, B.rowBody);
        if (r.icon && !allIconNames().includes(r.icon)) {
          add(WARN, `${where} row ${j + 1}`, `Unknown icon "${r.icon}" — falls back to a dot. ${allIconNames().length} names available; run scripts/get-assets.js if the library is missing.`);
        }
        if (r.logo && !LOGO_NAMES().includes(r.logo)) {
          add(ERR, `${where} row ${j + 1}`, `Unknown logo "${r.logo}". Have: ${LOGO_NAMES().join(', ')}`);
        }
        if (r.logo && r.icon) {
          add(WARN, `${where} row ${j + 1}`, 'Both a logo and an icon. The logo wins; drop the icon.');
        }
      });
    }

    if (s.type === 'stat') {
      if (!s.stats || !s.stats.length) add(ERR, where, 'Stat slide with no stats.');
      else {
        if (s.stats.length > 4) add(ERR, where, `${s.stats.length} stats. Past 4 nothing reads as important.`);
        s.stats.forEach((st, j) => {
          cap(`${where} stat ${j + 1}`, 'value', st.value, B.statValue);
          cap(`${where} stat ${j + 1}`, 'label', st.label, B.statLabel);
        });
      }
    }

    if (s.type === 'steps' && !list) add(ERR, where, 'Steps slide with no steps.');

    // The reveal mechanic keeps its step list once at deck level and lights a
    // different one per slide, so both halves have to line up.
    if (s.type === 'reveal') {
      const steps = deck.reveal?.steps;
      if (!steps || !steps.length) {
        add(ERR, where, 'Reveal slide but the deck has no reveal.steps. Put the shared step list there.');
      } else {
        const n = Number(s.step || 0);
        if (!Number.isInteger(n) || n < 1 || n > steps.length) {
          add(ERR, where, `step is ${s.step}, but deck.reveal.steps has ${steps.length} entries (1-${steps.length}).`);
        }
        steps.forEach((st, j) => {
          cap(`deck reveal step ${j + 1}`, 'title', st.title, B.rowTitle);
          cap(`deck reveal step ${j + 1}`, 'body', st.body, B.rowBody);
        });
      }
    }
    // The datasheet entry is a fixed form, and the value of a fixed form is
    // that every slide fills the same fields. A missing one is not a shorter
    // slide, it is a visible hole in a run of identical layouts — so these
    // are errors rather than the usual budget warnings.
    if (s.type === 'entry') {
      if (!s.name) add(ERR, where, 'Entry with no name. The name heads the slide and labels the wire.');
      cap(where, 'name', s.name, B.name);
      cap(where, 'does', s.does, B.does);
      cap(where, 'why', s.why, B.why);
      cap(where, 'punch', s.punch, B.punch);
      for (const f of ['does', 'why']) {
        if (!s[f]) add(ERR, where, `Entry has no "${f}". Every entry fills the same fields; one left blank reads as an omission.`);
      }
      if (!Array.isArray(s.how) || !s.how.length) {
        add(ERR, where, 'Entry with no "how" steps. The recipe is the reason the post gets saved.');
      } else {
        const maxHow = B.maxHow || 4;
        if (s.how.length > maxHow) {
          add(ERR, where, `${s.how.length} how-steps against a max of ${maxHow}. Longer than that is a tutorial, not a card.`);
        }
        s.how.forEach((st, j) => cap(`${where} step ${j + 1}`, 'step', st, B.step));
      }
      if (s.logo && !LOGO_NAMES().includes(s.logo)) {
        add(ERR, where, `Unknown logo "${s.logo}". Have: ${LOGO_NAMES().join(', ')}`);
      }
      if (s.doodle && !allIconNames().includes(s.doodle)) {
        add(WARN, where, `Unknown doodle "${s.doodle}" — falls back to a dot.`);
      }
    }

    if (s.type === 'quote' && !s.quote && !s.headline) add(ERR, where, 'Quote slide with no quote.');

    if (s.mascot && s.mascot !== false && !POSE_NAMES.includes(s.mascot)) {
      add(ERR, where, `Unknown mascot pose "${s.mascot}". Have: ${POSE_NAMES.join(', ')}`);
    }

    if (s.object) {
      const { pack, name } = parseObject(s.object, s.objectPack || deck.objectPack);
      const known = OBJECT_NAMES(pack);
      if (!known.length) {
        add(ERR, where, `Unknown object pack "${pack}". Have: ${OBJECT_PACKS().join(', ')}`);
      } else if (!known.includes(name)) {
        // Same names exist across packs, so a name that is simply in the
        // wrong pack is the likely mistake — say so rather than dumping 122.
        const elsewhere = OBJECT_PACKS().filter((pk) => pk !== pack && OBJECT_NAMES(pk).includes(name));
        add(ERR, where, elsewhere.length
          ? `Object "${name}" is not in pack "${pack}", but it is in: ${elsewhere.join(', ')}. Write it as "${elsewhere[0]}:${name}".`
          : `Unknown 3D object "${name}" in pack "${pack}". ${known.length} available — browse assets/_objects-${pack}.png.`);
      }
    }
    if (s.objectPack && !OBJECT_PACKS().includes(s.objectPack)) {
      add(ERR, where, `Unknown objectPack "${s.objectPack}". Have: ${OBJECT_PACKS().join(', ')}`);
    }
    if (s.object && s.prop) {
      add(WARN, where, 'A 3D object and a pixel prop on one slide. They are different illustration styles and will read as a collage.');
    }

    if (s.prop && !PROP_NAMES.includes(s.prop)) {
      add(ERR, where, `Unknown prop "${s.prop}". Have: ${PROP_NAMES.join(', ')}`);
    }
    if (s.dressing && !PROP_NAMES.includes(s.dressing)) {
      add(ERR, where, `Unknown dressing "${s.dressing}". Have: ${PROP_NAMES.join(', ')}`);
    } else if (s.dressing && !DRESSING_NAMES.includes(s.dressing)) {
      add(WARN, where, `"${s.dressing}" is a full-size prop used as dressing; it will compete with the main object. Dressing: ${DRESSING_NAMES.join(', ')}`);
    }
    if (s.dressing && !s.prop) add(WARN, where, 'Dressing with no prop. Set dressing is background for a scene, not a subject.');
    if (s.prop && s.media) add(WARN, where, 'A prop and a media card on one slide. One of them will be dropped for lack of room.');

    if (s.media?.kind === 'image' && !s.media.src) add(ERR, where, 'Image media with no src.');
    if (s.media?.kind === 'terminal' && !(s.media.lines || []).length) add(ERR, where, 'Terminal media with no lines.');
    if (s.media && (s.media.lines || []).length > 8) add(WARN, where, 'Terminal card over 8 lines. It will crowd out everything else.');

    // Slides carrying media plus a full row list have no room left for the
    // mascot, and the renderer will silently drop it. Say so now instead.
    if (s.media && list && list.length >= 3) {
      add(WARN, where, 'Media plus 3+ rows. The mascot will be dropped at render time for lack of space.');
    }
  });

  // ── signature mechanics ───────────────────────────────────────────
  // Each entry describes one theme's signature slide type: where its shared
  // list lives on the deck, which field indexes into it, and what must hold.
  const MECHANICS = [
    { type: 'line',   deckKey: 'session', listKey: 'items',  index: 'upto',
      titleBudget: 'rowTitle', note: 'a terminal session that builds up' },
    { type: 'tier',   deckKey: 'board',   listKey: 'items',  index: 'upto',
      titleBudget: 'rowTitle', note: 'a ranking board that fills in' },
    { type: 'entry',  deckKey: null },
    // The index rail. `title` heads the slide at display scale, so it is
    // charged the title budget rather than a row's.
    { type: 'guide',  deckKey: 'index',   listKey: 'items',  index: 'upto',
      titleBudget: 'title', note: 'a catalogue index the rail walks through' },
    // A tree question is the slide's headline when it is current, so it gets
    // headline room rather than row room.
    { type: 'node',   deckKey: 'tree',    listKey: 'nodes',  index: 'at',
      titleBudget: 'headline', note: 'a decision tree walked one node at a time' },
    { type: 'file',   deckKey: 'file',    listKey: 'facts',  index: null,
      titleBudget: 'rowTitle', note: 'a dossier with redactions that lift' },
  ];

  for (const m of MECHANICS) {
    const used = deck.slides.filter((s2) => s2.type === m.type);
    if (!used.length || !m.deckKey) continue;
    const list = deck[m.deckKey]?.[m.listKey];
    if (!list || !list.length) {
      add(ERR, 'deck', `${used.length} "${m.type}" slide(s) but deck.${m.deckKey}.${m.listKey} is missing. That list is ${m.note}, and it lives once on the deck.`);
      continue;
    }
    list.forEach((it, j) => {
      const w = `deck ${m.deckKey} ${j + 1}`;
      // `title`/`q`/`key` head a row; `body` sits under it at row scale. A
      // `note` is different — themes render it through the larger body type,
      // so charging it the row budget would flag correct copy as too long.
      cap(w, 'title', it.title || it.name || it.q || it.key, B[m.titleBudget || 'rowTitle']);
      cap(w, 'body', it.body || it.value, B.rowBody);
      cap(w, 'note', it.note, B.body);
    });
    if (!m.index) continue;

    const seen = [];
    used.forEach((s2, k) => {
      const n = Number(s2[m.index]);
      if (!Number.isInteger(n) || n < 1 || n > list.length) {
        add(ERR, `slide ${deck.slides.indexOf(s2) + 1} (${m.type})`,
          `${m.index}=${s2[m.index]}, but deck.${m.deckKey}.${m.listKey} has ${list.length} entries (1-${list.length}).`);
      } else seen.push(n);
      void k;
    });
    if (seen.length) {
      const ordered = seen.every((n, i) => i === 0 || n >= seen[i - 1]);
      if (!ordered) add(WARN, 'deck', `"${m.type}" slides are out of order. The mechanic only reads as progress if it advances.`);
      if (Math.max(...seen) < list.length) {
        add(WARN, 'deck', `deck.${m.deckKey}.${m.listKey} has ${list.length} entries but the last "${m.type}" slide only reaches ${Math.max(...seen)}. The tail is written and never shown.`);
      }
    }
  }

  // Exhibits. The geometry is fixed in pixels — an exhibit does not shrink to
  // fit — so the counts below are hard limits rather than taste. Too many
  // pills or nodes does not reflow, it clips, and the fit pass answers by
  // shrinking the headline instead.
  const EXHIBITS = {
    fan:    { need: ['hub'], counts: [['left', 2, 5], ['right', 2, 5]] },
    loop:   { need: ['nodes'], counts: [['nodes', 3, 4]] },
    chat:   { need: ['turns'], counts: [['turns', 1, 3]] },
    record: { need: ['fields'], counts: [['fields', 2, 6]] },
    table:  { need: ['head', 'rows'], counts: [['rows', 2, 5]] },
  };
  const STATUSES = ['ok', 'warn', 'idle', 'bad'];
  for (const s2 of deck.slides.filter((x) => x.exhibit)) {
    const w = `slide ${deck.slides.indexOf(s2) + 1} (${s2.type})`;
    const x = s2.exhibit;
    const spec = EXHIBITS[x.kind];
    if (!spec) {
      add(ERR, w, `exhibit kind "${x.kind}" does not exist. Available: ${Object.keys(EXHIBITS).join(', ')}.`);
      continue;
    }
    for (const f of spec.need) {
      if (!x[f] || (Array.isArray(x[f]) && !x[f].length)) {
        add(ERR, `${w} ${x.kind}`, `no "${f}". The exhibit renders empty.`);
      }
    }
    for (const [f, lo, hi] of spec.counts) {
      const n = (x[f] || []).length;
      if (!n) continue;
      if (n < lo) add(WARN, `${w} ${x.kind}`, `${n} ${f} against a layout built for ${lo}-${hi}. It will look unfinished.`);
      if (n > hi) add(ERR, `${w} ${x.kind}`, `${n} ${f} against a ceiling of ${hi}. Exhibit geometry is fixed — this clips rather than reflows.`);
    }
    if (x.kind === 'loop') {
      (x.nodes || []).forEach((nd, j) => {
        if (!nd.title) add(ERR, `${w} loop node ${j + 1}`, 'no title.');
        // The title sits on one line by design; a wrapped one overlaps its arc.
        else cap(`${w} loop node ${j + 1}`, 'title', nd.title, 22);
        cap(`${w} loop node ${j + 1}`, 'note', nd.note, 30);
      });
    }
    if (x.kind === 'fan') {
      [...(x.left || []), ...(x.right || [])].forEach((p) => cap(`${w} fan`, 'pill', p, B.pill || 26));
    }
    if (x.kind === 'table') {
      const cols = (x.head || []).length;
      (x.rows || []).forEach((r, j) => {
        if (r.length !== cols) {
          add(ERR, `${w} table row ${j + 1}`, `${r.length} cells against ${cols} columns. The grid will not line up.`);
        }
        for (const cell of r) {
          if (cell && typeof cell === 'object' && cell.status && !STATUSES.includes(cell.status)) {
            add(ERR, `${w} table row ${j + 1}`, `status "${cell.status}" is not one of ${STATUSES.join(', ')}.`);
          }
        }
      });
      if (x.widths && x.widths.length !== cols) {
        add(ERR, `${w} table`, `${x.widths.length} widths against ${cols} columns.`);
      }
    }
    if (x.kind === 'chat') {
      (x.turns || []).forEach((tn, j) => {
        if (!tn.who) add(ERR, `${w} chat turn ${j + 1}`, 'no "who" — use "you" or "claude".');
        if (!tn.text && !(tn.paras || []).length) add(ERR, `${w} chat turn ${j + 1}`, 'no text.');
        (tn.paras || []).forEach((pp) => cap(`${w} chat turn ${j + 1}`, 'para', pp, 130));
      });
    }
  }

  // The two-tone headline is briefing's signature and it is a two-line device.
  // One line loses it; three turns the accent into a colour wash and forces
  // the fit pass to shrink the slide to pay for it.
  if (types.has('exhibit') && theme.name === 'briefing') {
    for (const s2 of deck.slides) {
      if (!s2.headline || s2.type === 'quote') continue;
      const lines = String(s2.headline).split('\n').length;
      if (lines !== 2) {
        add(WARN, `slide ${deck.slides.indexOf(s2) + 1} (${s2.type})`,
          `headline is ${lines} line(s). This theme colours line one and inks line two — write exactly two, split on a newline.`);
      }
    }
  }

  // The index rail. Every entry carries the copy for its own slide, so a
  // missing field here is a hole in the layout rather than a shorter slide —
  // and the section name doubles as the colour key, so an entry without one
  // silently joins whichever section happens to sort first.
  if (deck.slides.some((x) => x.type === 'guide')) {
    const items = deck.index?.items || [];
    const sections = new Set();
    items.forEach((it, j) => {
      const w = `deck index ${j + 1}`;
      if (!it.title) add(ERR, w, 'no title. The entry has nothing to head its slide.');
      if (!it.section) add(WARN, w, 'no section. The rail colours chips by section; without one every chip is the same colour and the rail stops carrying structure.');
      else sections.add(it.section);
      if (!it.what) add(WARN, w, 'no "what" line. That is the one sentence a reader takes away.');
      if (!it.start) add(WARN, w, 'no "start" instruction. The bordered box renders empty.');
      if (!it.page) add(WARN, w, 'no page. The browser card is the device this theme is built around.');
      else if (!it.page.url) add(WARN, `${w} page`, 'no url. The browser bar renders blank.');
      cap(w, 'what', it.what, B.what);
      cap(w, 'start', it.start, B.start);
    });
    if (sections.size > 5) {
      add(WARN, 'deck index', `${sections.size} sections against a five-colour palette. Sections six and up repeat colours, and the rail stops reading as a map.`);
    }
    if (items.length && deck.slides.filter((x) => x.type === 'guide').length !== items.length) {
      add(WARN, 'deck', `${items.length} index entries but ${deck.slides.filter((x) => x.type === 'guide').length} guide slides. The rail counts entries, so the numbering will not match the deck length.`);
    }
    if (deck.manual && !deck.manual.title) add(WARN, 'deck manual', 'no title. The cover object renders as a blank book.');
  }

  // The dossier's declassify indices have to name facts that are actually
  // redacted, or the slide renders as a no-op that looks like it advanced.
  for (const s2 of deck.slides.filter((x) => x.type === 'file')) {
    const facts = deck.file?.facts || [];
    const where = `slide ${deck.slides.indexOf(s2) + 1} (file)`;
    for (const n of (s2.declassify || [])) {
      if (!Number.isInteger(n) || n < 1 || n > facts.length) {
        add(ERR, where, `declassify names fact ${n}, but deck.file.facts has ${facts.length}.`);
      } else if (!facts[n - 1].redacted) {
        add(WARN, where, `declassify names fact ${n} ("${facts[n - 1].key}"), which is not redacted. That slide will look like it advances and change nothing.`);
      }
    }
  }

  // catalogue and killlist both take arrays of items with required fields and
  // deck-wide numbering. They are the two an agent is most likely to get wrong
  // — a missing field there does not error, it renders a card visibly shorter
  // than its neighbours and the grid stops reading as a table.
  // The third entry is the item count the layout is built for: a number when
  // the grid is fixed, or a [min, max] band when the pack holds across a range.
  for (const [type, need, want] of [['page', ['name'], 10], ['kills', ['name', 'kills'], 5], ['group', ['name'], [5, 6]]]) {
    const pages = deck.slides.filter((x) => x.type === type);
    const [lo, hi] = Array.isArray(want) ? want : [want, want];
    for (const s2 of pages) {
      const w = `slide ${deck.slides.indexOf(s2) + 1} (${type})`;
      const items = s2.items || [];
      if (!items.length) { add(ERR, w, `A "${type}" slide needs items.`); continue; }
      if (items.length < lo || items.length > hi) {
        const built = lo === hi ? `${lo}` : `${lo}-${hi}`;
        add(WARN, w, `${items.length} items against a layout built for ${built}. Fewer looks padded against the height floor; more will not fit.`);
      }
      items.forEach((it, j) => {
        const iw = `${w} item ${j + 1}`;
        for (const f of need) {
          if (!it[f]) add(ERR, iw, `missing "${f}" — every ${type} item needs one.`);
        }
        cap(iw, 'name', it.name, B.itemName);
        cap(iw, 'body', it.body, B.itemBody);
        cap(iw, 'kills', it.kills, B.killBody);
        cap(iw, 'tag', it.tag, B.tag);
        cap(iw, 'bestFor', it.bestFor, B.itemMeta);
        cap(iw, 'slug', it.slug, B.itemSlug);
        cap(iw, 'metric', it.metric, B.metric);
        if (it.logo && !LOGO_NAMES().includes(it.logo) && !hasBrandFallback(it.logo)) {
          add(WARN, iw, `logo "${it.logo}" resolves to an initial tile. One tile among real marks is what makes a directory look unfinished — fetch it with scripts/get-brands.js.`);
        }
      });
    }
  }

  // audit: the three columns are read across, not down — left item n, step n
  // and right item n are the same problem, its fix and its result. Mismatched
  // counts break the whole device.
  for (const s2 of deck.slides.filter((x) => x.type === 'flow')) {
    const w = `slide ${deck.slides.indexOf(s2) + 1} (flow)`;
    const L = (s2.left?.items || []).length;
    const M = (s2.mid?.steps || []).length;
    const R = (s2.right?.items || []).length;
    if (!L || !M || !R) {
      add(ERR, w, 'A flow slide needs left.items, mid.steps and right.items.');
    } else if (!(L === M && M === R)) {
      add(ERR, w, `Columns are ${L} / ${M} / ${R}. They are read across, not down — left item n, step n and right item n must be the same thing, so the counts have to match.`);
    }
    const max = B.maxCells || 7;
    if (Math.max(L, M, R) > max) {
      add(ERR, w, `${Math.max(L, M, R)} rows against a max of ${max}. Past that the type drops below readable at feed scale.`);
    }
    // flow is deliberately not auto-fitted, so nothing will rescue long copy.
    (s2.left?.items || []).concat(s2.right?.items || []).forEach((it, j) => {
      cap(`${w} cell ${j + 1}`, 'title', it.title, B.cellTitle);
      cap(`${w} cell ${j + 1}`, 'body', it.body, B.cellBody);
    });
    (s2.mid?.steps || []).forEach((st, j) => cap(`${w} step ${j + 1}`, 'title', st.title, B.stepTitle));
    for (const side of ['left', 'right']) {
      cap(w, `${side} label`, s2[side]?.label, B.colLabel);
    }
  }

  // swap: the feature axes are what makes a run of cards a comparison rather
  // than a set of posters.
  const swaps = deck.slides.filter((x) => x.type === 'swap');
  if (swaps.length) {
    let freeWins = 0, freeOutscores = 0;
    swaps.forEach((s2) => {
      const w = `slide ${deck.slides.indexOf(s2) + 1} (swap)`;
      if (!s2.paid?.name || !s2.free?.name) add(ERR, w, 'A swap slide needs paid.name and free.name.');
      if ((s2.features || []).length !== 3) {
        add(WARN, w, `${(s2.features || []).length} features. Three is the layout; the strip is a three-cell grid.`);
      }
      if (s2.winner !== 'paid') freeWins++;
      if ((s2.free?.score ?? 0) > (s2.paid?.score ?? 0)) freeOutscores++;
      cap(w, 'tagline', s2.tagline, B.tagline);
      for (const side of ['paid', 'free']) {
        cap(`${w} ${side}`, 'desc', s2[side]?.desc, B.rowBody);
        const sc = s2[side]?.score;
        if (sc != null && !(sc >= 0 && sc <= 100)) add(ERR, `${w} ${side}`, `score is ${sc}; it renders as n/100.`);
      }
    });
    if (swaps.length >= 4 && freeWins === swaps.length && freeOutscores === swaps.length) {
      add(WARN, 'deck', 'The free side wins every swap AND outscores on every one. Free winning is the format; never conceding a point is what reads as an advert. Score at least one paid tool higher and swap anyway.');
    }
  }

  // handbuilt: note lines are set nowrap, so length is clipped not reflowed.
  for (const s2 of (t.noteNoWrap ? deck.slides.filter((x) => x.note) : [])) {
    const w = `slide ${deck.slides.indexOf(s2) + 1} (${s2.type})`;
    const lines = Array.isArray(s2.note) ? s2.note : [s2.note];
    lines.forEach((l, j) => {
      if (textOf(l).length > 44) {
        add(WARN, `${w} note ${j + 1}`, `${textOf(l).length} chars on one line. Note lines do not wrap — over about 44 they clip.`);
      }
    });
  }

  // versus runs its divider from high to low so the new side takes over.
  const splits = deck.slides.filter((s2) => s2.type === 'split');
  if (splits.length) {
    const ats = splits.map((s2) => Number(s2.at ?? 50));
    if (!ats.every((n, i) => i === 0 || n <= ats[i - 1])) {
      add(WARN, 'deck', `split slides run ${ats.join(', ')}. Run "at" from high to low so the new side visibly takes the frame over — that movement is the argument.`);
    }
    splits.forEach((s2) => {
      const w = `slide ${deck.slides.indexOf(s2) + 1} (split)`;
      const a = (s2.old?.points || []).length, b = (s2.now?.points || []).length;
      if (a && b && Math.abs(a - b) > 1) {
        add(WARN, w, `${a} points against ${b}. Lopsided sides read as a straw man.`);
      }
      cap(w, 'old title', s2.old?.title, B.rowTitle);
      cap(w, 'now title', s2.now?.title, B.rowTitle);
    });
  }

  // stat-card: a set only works if every card measures the same things.
  const cards = deck.slides.filter((s2) => s2.type === 'card');
  if (cards.length) {
    const labelsOf = (s2) => (s2.stats || []).map((x) => x.label).join('|');
    const first = labelsOf(cards[0]);
    cards.forEach((s2) => {
      const w = `slide ${deck.slides.indexOf(s2) + 1} (card)`;
      if (labelsOf(s2) !== first) {
        add(WARN, w, 'Different stat labels from the first card. A set where the cards measure different things is not a set.');
      }
      const rar = t.color.rarity || {};
      if (s2.rarity && !(s2.rarity in rar)) {
        add(ERR, w, `Unknown rarity "${s2.rarity}". Have: ${Object.keys(rar).join(', ')}`);
      }
      cap(w, 'name', s2.name, B.rowTitle);
      cap(w, 'flavour', s2.flavour, B.caption);
    });
    const legendary = cards.filter((s2) => s2.rarity === 'legendary').length;
    if (legendary > 1) add(WARN, 'deck', `${legendary} legendary cards. Rarity that is common is not rarity.`);
  }

  // wide-cut: the strip is the deck's opening picture, not a mid-deck slide.
  const strips = deck.slides.filter((s2) => s2.type === 'strip');
  if (strips.length) {
    const idx = deck.slides.map((s2, i) => (s2.type === 'strip' ? i : -1)).filter((i) => i >= 0);
    if (idx[0] !== 0) add(WARN, 'deck', 'Panorama strips do not start the deck. The effect is a hook; buried later, most viewers never reach it.');
    const marked = deck.slides.filter((s2) => s2.panorama).length;
    if (marked !== strips.length) {
      add(ERR, 'deck', `${strips.length} strip slide(s) but ${marked} marked "panorama": true. They must match, and --panorama N must equal both.`);
    }
    strips.forEach((s2) => {
      const w = `slide ${deck.slides.indexOf(s2) + 1} (strip)`;
      const ats = (s2.beats || []).map((b) => Number(b.at));
      if (ats.some((n) => !(n >= 0 && n <= 100))) add(ERR, w, 'beat "at" values must be 0-100, as a percentage of the WIDE canvas.');
      for (let i = 1; i < ats.length; i++) {
        if (Math.abs(ats[i] - ats[i - 1]) < 22) add(WARN, w, `beats at ${ats[i - 1]} and ${ats[i]} are under 22 apart and will overlap.`);
      }
      // A beat is 22% wide. Centred within 11 of a cut, its label is sliced
      // mid-word — which reads as a broken export, not as one picture.
      const n2 = Number(deck.panorama) || 3;
      for (let k = 1; k < n2; k++) {
        const cut = (k / n2) * 100;
        for (const a of ats) {
          if (Math.abs(a - cut) < 11) {
            add(WARN, w, `beat at ${a} sits on the cut at ${cut.toFixed(0)} and its label will be sliced mid-word. Cross the cuts with the rail, not with words.`);
          }
        }
      }
      (s2.beats || []).forEach((b, j) => {
        cap(`${w} beat ${j + 1}`, 'title', b.title, B.rowTitle);
        cap(`${w} beat ${j + 1}`, 'body', b.body, B.rowBody);
      });
    });
  }

  // console: the capability bar is a position cue, so it has to point somewhere.
  for (const s2 of deck.slides.filter((x) => x.railAt != null)) {
    const items = deck.rail?.items || [];
    const w = `slide ${deck.slides.indexOf(s2) + 1} (${s2.type})`;
    if (!items.length) add(ERR, w, 'railAt is set but deck.rail.items is missing.');
    else if (!(s2.railAt >= 1 && s2.railAt <= items.length)) {
      add(ERR, w, `railAt=${s2.railAt}, but deck.rail.items has ${items.length}.`);
    }
  }
  for (const s2 of deck.slides.filter((x) => x.graph)) {
    const w = `slide ${deck.slides.indexOf(s2) + 1} (${s2.type})`;
    const ids = new Set((s2.graph.nodes || []).map((n) => n.id));
    for (const e of (s2.graph.edges || [])) {
      if (!ids.has(e.from) || !ids.has(e.to)) {
        add(ERR, w, `graph edge ${e.from} -> ${e.to} names a node that does not exist.`);
      }
    }
    for (const n of (s2.graph.nodes || [])) {
      if (!(n.x >= 0 && n.x <= 100 && n.y >= 0 && n.y <= 100)) {
        add(ERR, w, `graph node "${n.id}" is at ${n.x},${n.y} — both must be 0-100.`);
      }
    }
  }

  if (deck.reveal?.steps) {
    const used = deck.slides.filter((s) => s.type === 'reveal').map((s) => Number(s.step));
    const missing = deck.reveal.steps.map((_, i) => i + 1).filter((n) => !used.includes(n));
    if (used.length && missing.length) {
      add(WARN, 'deck', `reveal.steps has ${deck.reveal.steps.length} steps but no slide lights ${missing.join(', ')}. A skipped step reads as a mistake.`);
    }
    const ordered = used.every((n, i) => i === 0 || n >= used[i - 1]);
    if (!ordered) add(WARN, 'deck', 'Reveal slides are out of order. The mechanic only reads as progress if it advances.');
  }

  {
    const used = new Set(deck.slides.filter((s2) => s2.object)
      .map((s2) => parseObject(s2.object, s2.objectPack || deck.objectPack).pack));
    if (used.size > 1) {
      add(WARN, 'deck', `Objects mixed across packs (${[...used].join(', ')}). Each pack is a distinct 3D style; mixing them reads as a collage. Set objectPack once on the deck.`);
    }
  }
  if (deck.objectPack && !OBJECT_PACKS().includes(deck.objectPack)) {
    add(ERR, 'deck', `Unknown objectPack "${deck.objectPack}". Have: ${OBJECT_PACKS().join(', ')}`);
  }
  void DEFAULT_PACK;

  // Colour. The accent lands on the background as headline text, so it has to
  // clear normal-text contrast, not just large-text.
  const acc = t.color.accent;
  const cAccent = contrast(acc, t.color.bg);
  const cInk = contrast(t.color.ink, t.color.bg);
  const cSoft = contrast(t.color.inkSoft, t.color.bg);
  if (cInk < 7) add(WARN, 'theme', `Ink on background is ${cInk.toFixed(1)}:1. Body copy wants 7:1.`);
  if (cSoft < 4.5) add(ERR, 'theme', `Soft ink on background is ${cSoft.toFixed(1)}:1, under the 4.5:1 floor for body text.`);
  if (cAccent < 3) add(ERR, 'theme', `Accent on background is ${cAccent.toFixed(1)}:1. Below 3:1 it fails even as large display text.`);
  else if (cAccent < 4.5) add(WARN, 'theme', `Accent on background is ${cAccent.toFixed(1)}:1 — fine for headlines, do not use it for body copy.`);

  return issues;
}

async function main() {
  const file = process.argv[2];
  if (!file) { console.error('Usage: node scripts/check.js <deck.json> [--theme name]'); process.exit(1); }
  const ti = process.argv.indexOf('--theme');
  const deck = JSON.parse(fs.readFileSync(file, 'utf8'));
  // Same precedence as render.js: flag, then deck field, then default.
  const theme = await loadTheme(ti > -1 ? process.argv[ti + 1] : (deck.theme || 'pixel-mascot'));

  const issues = checkDeck(deck, theme);
  const errors = issues.filter((i) => i.level === ERR);
  const warns = issues.filter((i) => i.level === WARN);

  console.log(`\n${path.basename(file)}  against theme "${theme.name}"\n`);
  for (const i of issues) {
    console.log(`  ${i.level === ERR ? 'ERROR' : 'warn '}  ${i.where.padEnd(22)} ${i.msg}`);
  }
  if (!issues.length) console.log('  clean\n');
  else console.log(`\n  ${errors.length} error(s), ${warns.length} warning(s)\n`);

  process.exitCode = errors.length ? 1 : 0;
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(e.message); process.exit(1); });
