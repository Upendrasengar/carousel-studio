#!/usr/bin/env node
// Renders a deck JSON to numbered PNGs through a theme pack.
//
//   node scripts/render.js decks/example.json out --theme pixel-mascot
//   node scripts/render.js decks/example.json out --platform linkedin
//   node scripts/render.js --themes
//
// Every slide is its own page load, so one broken slide cannot corrupt the
// rest of the deck.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import { chromium } from 'playwright';
import { loadTheme, listThemes, PLATFORMS, THEMES_DIR } from './lib/theme.js';
import { makeRng } from './lib/rng.js';
import { textureLayer } from './lib/texture.js';
import { FIT_FN } from './lib/fit.js';
import { buildSheet } from './lib/sheet.js';

const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' };

function embed(file, baseDir) {
  const p = path.resolve(baseDir, file);
  if (!fs.existsSync(p)) {
    console.warn(`  ! media not found, skipping: ${file}`);
    return null;
  }
  const mime = MIME[path.extname(p).toLowerCase()] || 'image/png';
  return `data:${mime};base64,${fs.readFileSync(p).toString('base64')}`;
}

/**
 * Any object anywhere in the deck may carry `shot: "path.png"` (a real
 * screenshot for a browser card) or `avatar: "face.jpg"`. Both are resolved
 * to data URIs the same way media is, so a theme never has to know where the
 * file came from — and so a deck stays renderable with no network.
 */
function embedShots(node, baseDir, seen = new Set()) {
  if (!node || typeof node !== 'object' || seen.has(node)) return;
  seen.add(node);
  for (const [k, v] of Object.entries(node)) {
    if ((k === 'shot' || k === 'avatar') && typeof v === 'string') {
      const uri = embed(v, baseDir);
      if (uri) node[`${k}URI`] = uri;
    } else if (v && typeof v === 'object') embedShots(v, baseDir, seen);
  }
}

const USAGE = `Usage: node scripts/render.js <deck.json> [outDir] [options]

  --theme <name>      override the deck's theme
  --platform <name>   override the theme's canvas (${Object.keys(PLATFORMS).join(', ')})
  --panorama <n>      stitch n slides into one wide image
  --animate           render slides marked "animate": true as video
  --preview           also write the sheet to themes/<theme>/preview.png
  --no-sheet          skip the contact sheet
  --themes            list theme packs and exit

Every render writes <outDir>/_review-sheet.png: all slides as one labelled
grid, with the fit measurements printed under each. Use --preview when the
render is a sample of the theme itself, so the pack carries a picture of what
it outputs.`;

/**
 * Unknown flags are an error, not a positional.
 *
 * The output directory is positional #2, so a mistyped flag used to be
 * silently adopted as the destination: `render.js deck.json --out /tmp/x`
 * wrote to a directory literally named `--out` and then died inside ffmpeg
 * with `Unrecognized option '-out/01-hook.mp4'` — an error that blames ffmpeg
 * for a mistake made on this command line. Anything leading with `-` is
 * therefore matched against the known set and rejected by name.
 */
function parseArgs(argv) {
  const a = argv.slice(2);
  const out = { input: null, outDir: 'out', theme: null, platform: null, list: false, panorama: 0, animate: false, preview: false, sheet: true };
  const pos = [];
  const fail = (msg) => { console.error(`${msg}\n\n${USAGE}`); process.exit(1); };

  // A flag's value is taken positionally, so a missing one would otherwise eat
  // the next flag: `--theme --animate` would set the theme to "--animate".
  const value = (flag, i) => {
    if (i + 1 >= a.length || a[i + 1].startsWith('-')) fail(`${flag} expects a value.`);
    return a[i + 1];
  };

  for (let i = 0; i < a.length; i++) {
    if (a[i] === '--theme') out.theme = value('--theme', i++);
    else if (a[i] === '--platform') out.platform = value('--platform', i++);
    else if (a[i] === '--panorama') {
      const n = parseInt(value('--panorama', i++), 10);
      if (!Number.isInteger(n) || n < 0) fail('--panorama expects a whole number.');
      out.panorama = n;
    } else if (a[i] === '--animate') out.animate = true;
    else if (a[i] === '--preview') out.preview = true;
    else if (a[i] === '--no-sheet') out.sheet = false;
    else if (a[i] === '--themes') out.list = true;
    else if (a[i].startsWith('-')) fail(`Unknown option "${a[i]}".`);
    else pos.push(a[i]);
  }

  if (pos.length > 2) fail(`Unexpected argument "${pos[2]}" — this takes at most a deck and an output directory.`);
  if (pos[0]) out.input = pos[0];
  if (pos[1]) out.outDir = pos[1];
  return out;
}

function page(bodyHTML, styles) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${styles}</style></head><body>${bodyHTML}</body></html>`;
}

async function main() {
  const args = parseArgs(process.argv);

  if (args.list) {
    console.log('\nTheme packs:\n');
    for (const t of listThemes()) console.log(`  ${t.name.padEnd(18)} ${t.label}\n${' '.repeat(20)}${t.description}\n`);
    console.log(`Platforms: ${Object.keys(PLATFORMS).join(', ')}\n`);
    return;
  }
  if (!args.input) {
    console.error(USAGE);
    process.exit(1);
  }

  const deck = JSON.parse(fs.readFileSync(args.input, 'utf8'));
  const deckDir = path.dirname(path.resolve(args.input));
  // Deck-level assets first: an author avatar, and any screenshots hanging off
  // a shared list. Slides that read from such a list are handed a clone, so
  // resolving per-slide alone would never reach them.
  embedShots(deck, deckDir);
  // Explicit flag wins over the deck's own field, which wins over the default.
  const theme = await loadTheme(args.theme || deck.theme || 'pixel-mascot');
  const t = structuredClone(theme.tokens);

  // Platform overrides the canvas box; the theme keeps everything else.
  const plat = args.platform || deck.platform;
  if (plat) {
    if (!PLATFORMS[plat]) throw new Error(`No platform "${plat}". Have: ${Object.keys(PLATFORMS).join(', ')}`);
    Object.assign(t.canvas, PLATFORMS[plat]);
  }

  // One seed for the whole deck. Same deck in, same pixels out, forever.
  const seed = deck.seed || deck.slug || deck.title || path.basename(args.input);
  const rng = makeRng(seed);
  const accents = rng.shuffle(t.accentRotation || [t.color.accent]);

  fs.mkdirSync(args.outDir, { recursive: true });

  // Slide files are named NN-<type>.png, so changing a slide's type leaves the
  // old file behind and the folder ends up with more slides than the deck has.
  // That matters because publishing uploads the folder: stale files become
  // duplicate slides in a live post. Clear them before writing.
  const stale = fs.readdirSync(args.outDir)
    .filter((f) => /^\d{2}-[a-z-]+\.(png|mp4)$/.test(f));
  for (const f of stale) fs.rmSync(path.join(args.outDir, f));
  if (stale.length) console.log(`  cleared ${stale.length} previous slide file(s)`);

  console.log(`\nTheme    ${theme.name}  (${theme.tokens.label})`);
  console.log(`Canvas   ${t.canvas.width}x${t.canvas.height} @${t.canvas.scale}x  ->  ${t.canvas.width * t.canvas.scale}x${t.canvas.height * t.canvas.scale}`);
  console.log(`Seed     ${seed}\n`);

  // Panorama mode. Instagram butts slides edge to edge with no gutter, so a
  // design N slides wide, cut into N equal slices, reads as one continuous
  // picture while you swipe. It is the strongest dwell-time format there is
  // and it costs one wide render plus a crop — the slides are slices of one
  // canvas, not N canvases that happen to line up.
  //
  // Slides marked `"panorama": true` join the wide strip, in order. Everything
  // else renders normally at slide width.
  const panoN = args.panorama || deck.panorama || 0;
  const panoSlides = panoN ? deck.slides.filter((s) => s.panorama) : [];
  if (panoN && panoSlides.length !== panoN) {
    throw new Error(`--panorama ${panoN} but ${panoSlides.length} slide(s) are marked "panorama": true. They must match.`);
  }

  const browser = await chromium.launch();
  const pg = await browser.newPage({
    viewport: { width: t.canvas.width, height: t.canvas.height },
    deviceScaleFactor: t.canvas.scale,
  });

  /**
   * Renders one slide as a looping MP4 instead of a PNG.
   *
   * Frames are produced by seeking every animation on the page through the
   * Web Animations API rather than by waiting on a clock — `a.currentTime = t`
   * on each entry of `document.getAnimations()`. That works whatever the theme
   * wrote its keyframes as, needs no CSS convention, and above all keeps the
   * render deterministic: the same deck produces the same frames forever,
   * which is the guarantee the rest of this pipeline depends on.
   *
   * The loop is closed by construction — frame count is duration x fps and the
   * last frame is one step short of the cycle end, so it butts against frame
   * zero with no stutter.
   */
  async function renderAnimated(slide, i, ctx, html, styles, file) {
    const spec = t.animate || {};
    const fps = spec.fps || 30;
    const secs = spec.seconds || 4;
    const frames = Math.round(fps * secs);

    const vp = await browser.newPage({
      viewport: { width: t.canvas.width, height: t.canvas.height },
      deviceScaleFactor: 1, // Instagram serves video at 1080 wide; 2x is bytes nobody sees
    });
    await vp.setContent(page(html, styles), { waitUntil: 'load' });
    await vp.evaluate(() => document.fonts.ready);
    await vp.evaluate(FIT_FN, { minFill: t.fill?.min ?? 0.62, maxGrow: t.fill?.maxGrow ?? 1.35 });

    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cs-frames-'));
    for (let f = 0; f < frames; f++) {
      const ms = (f / fps) * 1000;
      await vp.evaluate((tt) => {
        for (const a of document.getAnimations()) { a.pause(); a.currentTime = tt; }
      }, ms);
      await vp.screenshot({ path: path.join(dir, `${String(f).padStart(4, '0')}.png`), type: 'png' });
    }
    await vp.close();

    // yuv420p and even dimensions are what Instagram accepts without
    // re-encoding, and +faststart puts the moov atom first so ingestion can
    // start before the whole file has arrived.
    //
    // The silent AAC track is not optional: Instagram's API rejects video
    // with no audio stream. Verified the hard way — a soundless mp4 uploads
    // and publishes with success:true, then appears as a still.
    execFileSync('ffmpeg', [
      '-y', '-loglevel', 'error',
      '-framerate', String(fps),
      '-i', path.join(dir, '%04d.png'),
      '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20',
      '-c:a', 'aac', '-b:a', '96k', '-shortest',
      '-movflags', '+faststart',
      file,
    ]);
    fs.rmSync(dir, { recursive: true, force: true });
    return { frames, fps, seconds: secs };
  }

  const report = [];

  if (panoN) {
    const wide = await browser.newPage({
      viewport: { width: t.canvas.width * panoN, height: t.canvas.height },
      deviceScaleFactor: t.canvas.scale,
    });
    const wt = structuredClone(t);
    wt.canvas.width *= panoN;
    wt.panorama = panoN;
    const ctx = {
      t: wt, deck, rng, index: 0, total: deck.slides.length,
      accent: accents[0], fontFaces: theme.faces, textureCSS: '',
    };
    const strip = deck.slides.find((s) => s.panorama);
    const tex = textureLayer(rng.int(1, 9999), t.texture);
    ctx.textureCSS = tex.css;
    await wide.setContent(page(
      `${theme.templates.slideHTML({ ...strip, panoramaWidth: panoN }, ctx)}${tex.defs}${tex.html}`,
      theme.templates.css(ctx),
    ), { waitUntil: 'load' });
    await wide.evaluate(() => document.fonts.ready);
    await wide.evaluate(FIT_FN, { minFill: 0, maxGrow: 1 });

    for (let k = 0; k < panoN; k++) {
      const file = path.join(args.outDir, `${String(k + 1).padStart(2, '0')}-panorama.png`);
      await wide.screenshot({
        path: file, type: 'png',
        clip: { x: t.canvas.width * k, y: 0, width: t.canvas.width, height: t.canvas.height },
      });
      console.log(`  ${file}  (panorama slice ${k + 1}/${panoN})`);
      report.push({ index: k + 1, type: 'panorama', slice: k + 1, of: panoN });
    }
    await wide.close();
  }

  for (let i = 0; i < deck.slides.length; i++) {
    const slide = structuredClone(deck.slides[i]);
    if (panoN && slide.panorama) continue;

    if (slide.media && slide.media.kind === 'image' && slide.media.src) {
      slide.media.dataURI = embed(slide.media.src, deckDir);
    }
    embedShots(slide, deckDir);

    // Texture seed varies per slide so the grain never tiles across a swipe.
    const tex = textureLayer((rng.int(1, 9999)), t.texture);
    const ctx = {
      t, deck, rng, index: i, total: deck.slides.length,
      accent: slide.accent || accents[i % accents.length],
      fontFaces: theme.faces,
      textureCSS: tex.css,
    };

    const html = page(
      `${theme.templates.slideHTML(slide, ctx)}${tex.defs}${tex.html}`,
      theme.templates.css(ctx),
    );

    await pg.setContent(html, { waitUntil: 'load' });
    await pg.evaluate(() => document.fonts.ready);

    // Settle every animation to its END state before measuring or shooting.
    //
    // A theme's keyframes apply to every slide, not just the ones rendered as
    // video. Left running, a still captures whatever moment the screenshot
    // happened to land on — an entrance animation caught mid-rise renders as
    // clipped text, and which frame you get is a race. Seeking each animation
    // past its delay plus one iteration lands on the held final state, which
    // is what a still of an animated design is supposed to look like.
    await pg.evaluate(() => {
      for (const a of document.getAnimations()) {
        const timing = a.effect?.getComputedTiming?.() || {};
        a.pause();
        // One millisecond SHORT of the iteration end, not on it. These
        // animations are infinite, so `delay + duration` is exactly the loop
        // boundary — which is progress 0 of the next cycle, i.e. the start
        // state again. Landing just inside the last iteration gives the held
        // final state that a still is supposed to show.
        const dur = timing.duration || 0;
        a.currentTime = (timing.delay || 0) + Math.max(0, dur - 1);
      }
    });

    const fit = await pg.evaluate(FIT_FN, {
      minFill: t.fill?.min ?? 0.62,
      maxGrow: t.fill?.maxGrow ?? 1.35,
    });

    const animateThis = (args.animate || deck.animate) && slide.animate;
    const stem = path.join(args.outDir, `${String(i + 1).padStart(2, '0')}-${slide.type}`);
    let file = `${stem}.png`;
    let vid = null;
    if (animateThis) {
      file = `${stem}.mp4`;
      vid = await renderAnimated(slide, i, ctx, html, theme.templates.css(ctx), file);
      // A still of the same slide is always written too, and it is mandatory
      // rather than a leftover. Instagram and Threads accept a carousel that
      // mixes video and images; Facebook and LinkedIn take images only, and
      // LinkedIn takes no video at all. So one deck ships as video to two
      // platforms and as stills to two others, from the same render.
      //
      // (An earlier version of this comment said the publish path cannot mix
      // video into a carousel. That is true of Facebook and LinkedIn only.)
      await pg.screenshot({ path: `${stem}.png`, type: 'png' });
    } else {
      await pg.screenshot({ path: file, type: 'png' });
    }

    const notes = [];
    if (fit.stillOverflows) notes.push('OVERFLOWS — copy must be cut');
    else if (fit.shrunk) notes.push(`shrunk to ${Math.round(fit.ratio * 100)}%`);
    if (fit.grew) notes.push(`grown to ${Math.round(fit.growRatio * 100)}% to fill the frame`);
    if (fit.droppedDecor?.length) notes.push(`${fit.droppedDecor.join(' + ')} dropped, no room`);
    if (vid) notes.push(`${vid.frames} frames @ ${vid.fps}fps = ${vid.seconds}s loop, + still fallback`);
    const flag = notes.length ? `  (${notes.join('; ')})` : '';
    console.log(`  ${file}${flag}`);
    report.push({ index: i + 1, type: slide.type, ...fit });
  }

  // The contact sheet, built before the browser closes so it costs one page
  // rather than a second launch. It is written on every render, not on request:
  // a review artifact that has to be asked for is one that gets skipped, and
  // the numbers it prints are the ones worth looking at.
  if (args.sheet) {
    try {
      const sheetFile = path.join(args.outDir, '_review-sheet.png');
      const sheet = await buildSheet(browser, { dir: args.outDir, outFile: sheetFile, theme, deck, report });
      console.log(`\n  ${sheetFile}  (${sheet.slides} slides, ${sheet.cols} across)`);
      if (args.preview) {
        // The theme's own picture of itself. A pack is 900 lines of CSS and a
        // rules.md; neither tells you what it looks like.
        const previewFile = path.join(THEMES_DIR, theme.name, 'preview.png');
        fs.copyFileSync(sheetFile, previewFile);
        console.log(`  ${previewFile}  (theme preview updated)`);
      }
    } catch (e) {
      // A sheet is review scaffolding. Losing it must never lose the render
      // that produced it — the slides are already on disk and are the product.
      console.warn(`  ! contact sheet failed: ${e.message}`);
    }
  }

  await browser.close();

  const shrunk = report.filter((r) => r.shrunk);
  const broken = report.filter((r) => r.stillOverflows);
  console.log(`\n${report.length} slides written to ${args.outDir}`);
  if (shrunk.length) {
    console.log(`${shrunk.length} slide(s) auto-shrunk. That is the safety net firing, not a pass —`);
    console.log(`trim the copy on: ${shrunk.map((r) => `#${r.index} ${r.type}`).join(', ')}`);
  }
  if (broken.length) {
    console.log(`${broken.length} slide(s) STILL overflow at minimum size: ${broken.map((r) => `#${r.index}`).join(', ')}`);
    process.exitCode = 1;
  }
  fs.writeFileSync(path.join(args.outDir, 'render-report.json'), JSON.stringify(report, null, 2));
}

main().catch((e) => { console.error('\n' + e.message); process.exit(1); });
