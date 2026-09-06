// The contact sheet: every slide of a render laid out as one labelled grid.
//
// This exists because a folder of numbered PNGs is not reviewable. You cannot
// see a deck's rhythm — where the dense slides fall, whether the hook and the
// CTA rhyme, whether one slide is suddenly a different design — by opening
// eight files one at a time. One image shows the shape.
//
// It is an audit artifact, not decoration. Each tile prints what the fit pass
// measured on that slide: fill percentage, whether the copy had to be shrunk,
// whether it still overflows, what decoration got dropped. Those numbers are
// already in render-report.json and nobody reads a JSON array; printed under
// the picture they caused, they get looked at.
//
// Built in Chromium rather than with ffmpeg or ImageMagick, so it needs no
// binary the still pipeline does not already have. ffmpeg is a hard dependency
// only of --animate; a stills render must stay installable without it.

import fs from 'node:fs';
import path from 'node:path';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** The slide stills of a render, in deck order. Animated slides always write a
 *  PNG alongside their MP4, so this never has holes. */
export function slideStills(dir) {
  return fs.readdirSync(dir)
    .filter((f) => /^\d{2}-[a-z-]+\.png$/.test(f))
    .sort();
}

function columns(n) {
  if (n <= 1) return 1;
  if (n <= 2) return 2;
  if (n <= 6) return 3;
  return 4;
}

/**
 * Renders the sheet for an already-rendered output directory.
 *
 * @param browser  an open Playwright browser — reused from the render so a
 *                 sheet costs one page, not one browser launch
 * @param dir      the output directory holding NN-type.png
 * @param outFile  where to write the sheet
 * @param theme    { name, tokens } of the theme used, or null
 * @param deck     the deck object, or null
 * @param report   the render report array, or null
 */
export async function buildSheet(browser, { dir, outFile, theme = null, deck = null, report = null, width = 2400 }) {
  const files = slideStills(dir);
  if (!files.length) throw new Error(`No slide PNGs in ${dir} — nothing to build a sheet from.`);

  const byIndex = new Map((report || []).map((r) => [r.index, r]));
  const cols = columns(files.length);

  const tiles = files.map((f) => {
    const index = parseInt(f.slice(0, 2), 10);
    const type = f.slice(3, -4);
    const r = byIndex.get(index) || {};
    const notes = [];
    if (r.stillOverflows) notes.push({ cls: 'bad', text: 'OVERFLOWS' });
    else if (r.shrunk) notes.push({ cls: 'warn', text: `shrunk ${Math.round(r.ratio * 100)}%` });
    if (r.grew) notes.push({ cls: 'ok', text: `grown ${Math.round(r.growRatio * 100)}%` });
    if (typeof r.fill === 'number') notes.push({ cls: r.fill < 62 ? 'warn' : 'ok', text: `fill ${r.fill}%` });
    if (r.droppedDecor?.length) notes.push({ cls: 'dim', text: `${r.droppedDecor.join('+')} dropped` });
    if (fs.existsSync(path.join(dir, f.replace(/\.png$/, '.mp4')))) notes.push({ cls: 'vid', text: 'video' });

    const b64 = fs.readFileSync(path.join(dir, f)).toString('base64');
    return `<figure>
      <img src="data:image/png;base64,${b64}" alt="">
      <figcaption><b>${String(index).padStart(2, '0')} ${esc(type)}</b>${notes.map((n) => `<i class="${n.cls}">${esc(n.text)}</i>`).join('')}</figcaption>
    </figure>`;
  }).join('');

  const canvas = theme?.tokens?.canvas;
  const title = theme ? `${theme.name}` : path.basename(dir);
  const sub = theme?.tokens?.label && theme.tokens.label !== theme.name ? theme.tokens.label : '';
  const meta = [
    `${files.length} slide${files.length === 1 ? '' : 's'}`,
    canvas ? `${canvas.width}x${canvas.height} @${canvas.scale}x` : null,
    deck?.slug ? `deck ${deck.slug}` : null,
  ].filter(Boolean).join('  ·  ');

  // No backticks anywhere below: this is a template literal, and one inside a
  // comment ends it silently.
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{width:${width}px;background:#101114;color:#e8e8ea;
       font-family:ui-sans-serif,-apple-system,"Helvetica Neue",Arial,sans-serif;padding:40px}
  header{display:flex;align-items:baseline;gap:16px;flex-wrap:wrap;
         border-bottom:2px solid #2a2c33;padding-bottom:20px;margin-bottom:28px}
  h1{font-size:40px;font-weight:700;letter-spacing:-0.01em}
  h1 span{color:#7f8492;font-weight:500}
  .desc{width:100%;color:#9aa0ad;font-size:19px;line-height:1.45;max-width:1500px}
  .meta{margin-left:auto;font-family:ui-monospace,"SF Mono",Menlo,monospace;
        font-size:17px;color:#7f8492;white-space:nowrap}
  .grid{display:grid;grid-template-columns:repeat(${cols},1fr);gap:26px}
  figure{background:#191b20;border:1px solid #2a2c33;border-radius:10px;overflow:hidden}
  img{width:100%;display:block}
  figcaption{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:12px 14px;
             font-family:ui-monospace,"SF Mono",Menlo,monospace;font-size:16px}
  figcaption b{color:#e8e8ea;font-weight:600}
  figcaption i{font-style:normal;font-size:14px;padding:2px 8px;border-radius:99px;
               background:#23262d;color:#9aa0ad}
  .bad{background:#4a1620!important;color:#ff8a9b!important}
  .warn{background:#4a3a12!important;color:#ffcf6b!important}
  .ok{background:#16321f!important;color:#7fd6a0!important}
  .vid{background:#1b2c48!important;color:#8ab6ff!important}
  </style></head><body>
  <header>
    <h1>${esc(title)}${sub ? ` <span>${esc(sub)}</span>` : ''}</h1>
    <div class="meta">${esc(meta)}</div>
    ${theme?.tokens?.description ? `<div class="desc">${esc(theme.tokens.description)}</div>` : ''}
  </header>
  <div class="grid">${tiles}</div>
  </body></html>`;

  const pg = await browser.newPage({ viewport: { width, height: 1200 }, deviceScaleFactor: 1 });
  await pg.setContent(html, { waitUntil: 'load' });
  await pg.evaluate(() => document.fonts.ready);
  fs.mkdirSync(path.dirname(path.resolve(outFile)), { recursive: true });
  await pg.screenshot({ path: outFile, fullPage: true, type: 'png' });
  await pg.close();
  return { file: outFile, slides: files.length, cols };
}
