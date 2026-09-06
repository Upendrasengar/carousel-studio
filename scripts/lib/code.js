// A source-code card: filename bar, a line-number gutter, shallow syntax
// colouring, and an optional hand-drawn mark anchored to one token.
//
// This is the primitive the pack was missing. `terminalCard` in blocks.js
// shows a *session* — commands and their output, where the interesting thing
// is what happened. A code card shows a *file*, where the interesting thing is
// one line of it, and the reader needs the line number to find it again.
//
// The anchored mark is the point. A screenshot of code says "here is some
// code"; a red circle round `media_urls` on line 7 says "this is the argument
// that decides whether you get a carousel or a single image". Every other way
// of doing that — bolding the line, an arrow in the margin, a caption
// underneath — needs the reader to work out which token you meant.
//
// Nothing here emits a colour. Tokens get class names and the theme's
// stylesheet decides what they look like; the mark takes its colour from the
// caller, which is how the theme's accent reaches it.

import { esc } from './blocks.js';
import * as marks from './marks.js';

/**
 * Keywords per language. Deliberately short: this is not a parser, and a
 * highlighter that tries to be one starts colouring things wrongly in a way
 * that is more distracting than no colour at all.
 */
const KEYWORDS = {
  python: ['from', 'import', 'as', 'def', 'class', 'return', 'if', 'elif', 'else',
    'for', 'while', 'in', 'not', 'and', 'or', 'is', 'None', 'True', 'False',
    'with', 'try', 'except', 'raise', 'await', 'async', 'lambda', 'pass', 'assert'],
  javascript: ['import', 'from', 'export', 'const', 'let', 'var', 'function',
    'return', 'if', 'else', 'for', 'while', 'of', 'in', 'new', 'await', 'async',
    'class', 'try', 'catch', 'throw', 'null', 'undefined', 'true', 'false'],
  json: ['true', 'false', 'null'],
  bash: ['if', 'then', 'fi', 'for', 'do', 'done', 'export', 'echo', 'cd'],
};

const TOKEN = new RegExp([
  '(?<com>#[^\\n]*|//[^\\n]*)',
  '(?<str>"(?:[^"\\\\]|\\\\.)*"|\'(?:[^\'\\\\]|\\\\.)*\')',
  '(?<dec>@[A-Za-z_]\\w*)',
  '(?<num>\\b\\d+(?:\\.\\d+)?\\b)',
  '(?<word>[A-Za-z_]\\w*)',
  '(?<ws>\\s+)',
  '(?<pun>[^\\sA-Za-z_0-9])',
].join('|'), 'g');

/**
 * Classifies one line into `{ text, cls }` tokens.
 *
 * A bare word is a keyword, then a call if a bracket follows, then a type if
 * it is capitalised, and otherwise plain. That order matters: `class State(`
 * should read as keyword + type, not keyword + call.
 */
function tokenize(line, lang) {
  const kw = new Set(KEYWORDS[lang] || KEYWORDS.python);
  const out = [];
  let m;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(line)) !== null) {
    const g = m.groups;
    const text = m[0];
    let cls = '';
    if (g.com) cls = 'c-com';
    else if (g.str) cls = 'c-str';
    else if (g.dec) cls = 'c-dec';
    else if (g.num) cls = 'c-num';
    else if (g.word) {
      const after = line.slice(m.index + text.length);
      if (kw.has(text)) cls = 'c-kw';
      else if (/^\s*\(/.test(after)) cls = 'c-fn';
      else if (/^[A-Z]/.test(text)) cls = 'c-type';
    } else if (g.pun) cls = 'c-pun';
    out.push({ text, cls });
  }
  return out;
}

/**
 * The hand-drawn mark, stretched to the box of the token it wraps.
 *
 * `marks.js` emits a fixed-size SVG, which would letterbox inside an inline
 * span of a different aspect. Forcing `preserveAspectRatio="none"` lets one
 * generated ellipse fit a three-character token and a thirty-character one
 * without the theme having to guess the width at authoring time.
 */
function annotate(kind, rng, color) {
  const svg = kind === 'underline'
    ? marks.underline(rng, 260, { color, weight: 6, h: 20 })
    : marks.circle(rng, 260, 74, { color, weight: 5 });
  return svg.replace('<svg ', '<svg preserveAspectRatio="none" ');
}

/**
 * A code card.
 *
 *   { "kind": "code", "title": "publish.py", "lang": "python",
 *     "lines": ["from myclawbots import client", "", "client.post(...)"],
 *     "mark": { "line": 3, "token": "post", "kind": "circle",
 *               "label": "one call, six feeds" } }
 *
 * `mark.token` must match a single token exactly. A token that is not found
 * throws rather than rendering a card with no annotation on it: a mark that
 * silently fails to appear is a slide that has quietly lost its subject, and
 * that is worse than a render that stops and tells you.
 */
export function codeCard(media, { rng, color = '#DC4E19', minLines = 0 } = {}) {
  const src = media.lines || [];
  if (!src.length) throw new Error('A code card needs at least one line.');
  const mark = media.mark;
  let marked = false;

  // Pad to a minimum height with empty numbered lines. An editor showing six
  // lines in a window sized for six lines looks like a crop; the trailing
  // blank numbers are what make it read as a file you could keep typing into,
  // and they are also how the card earns its share of the page instead of
  // floating in the middle of it.
  const want = Math.max(minLines, media.minLines || 0);
  const lines = src.length >= want ? src.slice()
    : src.concat(Array(want - src.length).fill(''));

  const gutter = lines.map((_, i) =>
    `<span>${i + 1}</span>`).join('');

  const body = lines.map((line, i) => {
    const toks = tokenize(line, media.lang || 'python');
    const html = toks.map((t) => {
      const text = esc(t.text);
      const hit = mark && mark.line === i + 1 && t.text === mark.token;
      const span = t.cls ? `<span class="${t.cls}">${text}</span>` : text;
      if (!hit) return span;
      marked = true;
      return `<em class="anno anno-${mark.kind || 'circle'}">${span}${annotate(mark.kind, rng, color)}</em>`;
    }).join('');
    return `<span class="cl">${html || '&nbsp;'}</span>`;
  }).join('');

  if (mark && !marked) {
    const have = tokenize(lines[mark.line - 1] || '', media.lang || 'python')
      .map((t) => t.text).filter((t) => t.trim());
    throw new Error(`Code card mark token "${mark.token}" is not a token on line ${mark.line}. That line has: ${have.join(' ')}`);
  }

  const label = mark && mark.label
    ? `<span class="anno-label">${esc(mark.label)}</span>` : '';

  // The label is a sibling of the card, not a child. Inside, the card's own
  // `overflow:hidden` clips it, and a handwritten note is meant to sit on the
  // paper anyway — that is the difference between an annotation and a caption.
  return `<div class="code">
    <div class="code-bar"><i></i><i></i><i></i><span>${esc(media.title || '')}</span></div>
    <div class="code-body">
      <div class="code-gutter">${gutter}</div>
      <pre class="code-lines">${body}</pre>
    </div>
  </div>${label}`;
}
