// Line icons for row chips. Hand-drawn as 24x24 SVG paths so the theme has no
// icon-package dependency and every glyph shares one stroke weight. Keep the
// set small: a row list where every row has a different icon reads as noise.

import { lineIcon, ICON_NAMES as libIconNames } from './assets.js';

const S = (d, extra = '') =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${d}${extra}</svg>`;

export const ICONS = {
  check:  S('<path d="M4 12.5l5 5L20 6.5"/>'),
  bolt:   S('<path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/>'),
  doc:    S('<path d="M14 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V7z"/><path d="M14 2v5h5"/><path d="M9 13h6M9 17h4"/>'),
  link:   S('<path d="M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1"/><path d="M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1"/>'),
  clock:  S('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  money:  S('<circle cx="12" cy="12" r="9"/><path d="M12 6v12M15 9.5c0-1.4-1.3-2.2-3-2.2s-3 .8-3 2.2 1.3 1.9 3 2.5 3 1 3 2.5-1.3 2.2-3 2.2-3-.8-3-2.2"/>'),
  search: S('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4.3-4.3"/>'),
  folder: S('<path d="M3 7a2 2 0 012-2h4l2 2.5h8a2 2 0 012 2V18a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>'),
  star:   S('<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'),
  alert:  S('<path d="M12 3l9.5 16.5H2.5z"/><path d="M12 10v4M12 17.5v.01"/>'),
  cross:  S('<path d="M6 6l12 12M18 6L6 18"/>'),
  chat:   S('<path d="M21 12a8 8 0 01-8 8H5l-2 2V12a8 8 0 018-8h1a8 8 0 018 8z"/>'),
  eye:    S('<path d="M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/>'),
  code:   S('<path d="M9 7l-5 5 5 5M15 7l5 5-5 5"/>'),
};

export const ICON_NAMES = Object.keys(ICONS);

/**
 * Resolves an icon name. The hand-drawn set above wins so existing decks keep
 * rendering identically; anything else falls through to the downloaded Lucide
 * library, and only then to a dot.
 *
 * A missing icon must never lose you the whole render — but `check.js` still
 * flags unknown names, so a typo surfaces before you spend a render.
 */
export function icon(name) {
  if (!name) return ICONS.check;
  if (ICONS[name]) return ICONS[name];
  const lucide = lineIcon(name);
  if (lucide) return lucide;
  return S('<circle cx="12" cy="12" r="4.5"/>');
}

/** Every name `icon()` will resolve, for validation and for error messages. */
export function allIconNames() {
  return [...new Set([...ICON_NAMES, ...libIconNames()])].sort();
}
