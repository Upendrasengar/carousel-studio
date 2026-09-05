// Synthetic web-page mocks for the browser card.
//
// The reference decks this pack imitates lean on one device hard: a rounded
// browser frame with a real URL in the bar and the actual page inside it. That
// is what turns "here is a link" into "here is the thing".
//
// Feeding it real screenshots would break two of the studio's rules at once —
// a render would depend on the network, and the same deck would come out
// different tomorrow. So the page is drawn from data instead. The mocks are
// deliberately coarse: at feed scale a reader registers the *shape* of a repo
// listing or a docs page in about a third of a second and never reads the
// small text. Getting the shape right is the whole job.
//
// A real screenshot is still supported — `page.shot` is embedded by the
// renderer and wins over every mock kind.

import { esc } from './blocks.js';

/* Glyphs live here rather than in icons.js: these are chrome, drawn filled at
   14px inside a mock, and nothing outside this file wants them. */
const G = {
  dir: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M1.75 2.5h3.9c.3 0 .58.14.76.38l.86 1.12h6.98c.55 0 1 .45 1 1v7.5c0 .55-.45 1-1 1H1.75c-.55 0-1-.45-1-1V3.5c0-.55.45-1 1-1z"/></svg>',
  file: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M4 1.5h5L13 5.5v9c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1v-12c0-.55.45-1 1-1z" opacity=".85"/><path d="M9 1.5L13 5.5H9.6a.6.6 0 01-.6-.6z" opacity=".45"/></svg>',
  gh: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 0a8 8 0 00-2.5 15.6c.4.07.55-.17.55-.38v-1.36C3.8 14.3 3.3 12.9 3.3 12.9c-.36-.9-.88-1.15-.88-1.15-.72-.5.05-.48.05-.48.8.05 1.22.82 1.22.82.7 1.2 1.86.86 2.31.66.07-.51.28-.86.5-1.06-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 014 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.14.46.55.38A8 8 0 008 0z"/></svg>',
  chev: '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 4.5L6 7.5 9 4.5"/></svg>',
  mag: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="7" cy="7" r="4.4"/><path d="M13.5 13.5l-3.2-3.2"/></svg>',
  info: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="8" cy="8" r="6.4"/><path d="M8 7.2v4M8 5.1v.01"/></svg>',
  branch: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M4.5 2a1.8 1.8 0 00-.7 3.46v5.08a1.8 1.8 0 101.4 0V8.9c.5.4 1.1.6 1.9.6h1.6a1.8 1.8 0 100-1.4H7.1c-1 0-1.9-.5-1.9-1.6v-.04A1.8 1.8 0 004.5 2z"/></svg>',
};

const line = (w, h, o) =>
  `<span class="pm-sk" style="width:${w}%;height:${h}px;opacity:${o}"></span>`;

/* ── kinds ─────────────────────────────────────────────────────────── */

/** A repository listing. Eight of the seventeen entries in the reference deck
 *  are GitHub repos, so this one earns the most detail. */
function repo(p) {
  const tabs = (p.tabs || [['Code'], ['Issues', '309'], ['Pull requests', '744'],
    ['Discussions'], ['Actions'], ['Insights']])
    .map(([t, n], i) => `<span class="pm-tab${i === 0 ? ' on' : ''}">${
      i === 0 ? `<i class="pm-g">${G.chev}</i>` : ''}${esc(t)}${
      n ? `<b class="pm-count">${esc(n)}</b>` : ''}</span>`).join('');

  const files = (p.files || []).map((f) => `<div class="pm-row">
      <i class="pm-g ${f.kind === 'file' ? 'pm-file' : 'pm-dir'}">${f.kind === 'file' ? G.file : G.dir}</i>
      <span class="pm-fname">${esc(f.name)}</span>
      <span class="pm-fmsg">${esc(f.msg || '')}</span>
      <span class="pm-fage">${esc(f.age || '')}</span>
    </div>`).join('');

  return `<div class="pm pm-repo">
    <div class="pm-ghbar">
      <i class="pm-g pm-ghmark">${G.gh}</i>
      ${['Platform', 'Solutions', 'Resources', 'Open Source', 'Enterprise', 'Pricing']
    .map((n) => `<span class="pm-ghnav">${n}<i class="pm-g">${G.chev}</i></span>`).join('')}
      <span class="pm-ghsearch"><i class="pm-g">${G.mag}</i>Search or jump to...</span>
    </div>
    <div class="pm-pad">
      <div class="pm-slug"><i class="pm-g">${G.gh}</i><a>${esc(p.org || 'anthropics')}</a>
        <span class="pm-sep">/</span><b>${esc(p.name || 'repo')}</b>
        <span class="pm-vis">${esc(p.vis || 'Public')}</span></div>
      <div class="pm-tabs">${tabs}</div>
      <div class="pm-branchbar">
        <span class="pm-btn"><i class="pm-g">${G.branch}</i>${esc(p.branch || 'main')}<i class="pm-g">${G.chev}</i></span>
        <span class="pm-meta"><i class="pm-g">${G.branch}</i>${esc(p.branches || '14 Branches')}</span>
        <span class="pm-meta">${esc(p.tags || '0 Tags')}</span>
        <span class="pm-grow"></span>
        <span class="pm-search"><i class="pm-g">${G.mag}</i>Go to file</span>
        <span class="pm-cta">${'<'}${'>'} Code</span>
      </div>
      <div class="pm-files">${files}</div>
      ${p.note ? `<div class="pm-note"><b>Note:</b> ${esc(p.note)}</div>` : ''}
    </div>
  </div>`;
}

/** A documentation page: breadcrumb, serif title, blurb, prose, info panel. */
function docs(p) {
  const nav = (p.nav || ['Messages', 'Managed Agents', 'Admin', 'Resources'])
    .map((n, i) => `<span class="pm-dnav${i === 3 ? ' on' : ''}">${esc(n)}${
      i === 3 ? `<i class="pm-g">${G.chev}</i>` : ''}</span>`).join('');
  const paras = (p.paras || []).map((t) => `<p class="pm-p">${esc(t)}</p>`).join('');
  return `<div class="pm pm-docs">
    <div class="pm-dbar">${nav}<span class="pm-grow"></span>
      <span class="pm-dmeta">{ } API reference</span>
      <span class="pm-dmeta">English<i class="pm-g">${G.chev}</i></span>
      <span class="pm-dbtn">Console</span></div>
    <div class="pm-pad">
      ${p.crumb ? `<div class="pm-crumb">${esc(p.crumb)}</div>` : ''}
      <h3 class="pm-dtitle">${esc(p.title || '')}</h3>
      ${p.blurb ? `<p class="pm-blurb">${esc(p.blurb)}</p>` : ''}
      ${paras}
      ${p.callout ? `<div class="pm-info"><i class="pm-g">${G.info}</i><span>${esc(p.callout)}</span></div>` : ''}
      ${p.sub ? `<h4 class="pm-dsub">${esc(p.sub)}</h4>` : ''}
      ${p.subParas ? p.subParas.map((t) => `<p class="pm-p">${esc(t)}</p>`).join('') : ''}
    </div>
  </div>`;
}

/** A long-form engineering write-up. Wide margins, one serif headline. */
function article(p) {
  return `<div class="pm pm-article">
    <div class="pm-abar"><b>${esc(p.brand || 'ANTHROPIC')}</b>
      ${(p.nav || ['Research', 'Policy', 'Commitments', 'Learn', 'News'])
    .map((n) => `<span>${esc(n)}</span>`).join('')}</div>
    <div class="pm-acols">
      <div class="pm-aside">
        ${p.kicker ? `<div class="pm-akick">${esc(p.kicker)}</div>` : ''}
        <div class="pm-amarks">${[0, 1, 2, 3, 4, 5].map((i) => `<span class="pm-am pm-am-${i}"></span>`).join('')}</div>
      </div>
      <div class="pm-amain">
        <h3 class="pm-atitle">${esc(p.title || '')}</h3>
        ${p.date ? `<div class="pm-adate">${esc(p.date)}</div>` : ''}
        ${(p.paras || []).map((t) => `<p class="pm-p">${esc(t)}</p>`).join('')}
      </div>
    </div>
  </div>`;
}

/** A notebook: alternating prose and code cells with a run gutter. */
function notebook(p) {
  const cells = (p.cells || []).map((c) => c.kind === 'code'
    ? `<div class="pm-cell pm-code"><span class="pm-run">▶</span><div class="pm-clines">${
      (c.lines || []).map((l) => `<span class="pm-cl">${esc(l)}</span>`).join('')}</div></div>`
    : `<div class="pm-cell pm-md"><div class="pm-clines">${
      (c.lines || []).map((l, i) => `<span class="pm-ml${i === 0 ? ' pm-mh' : ''}">${esc(l)}</span>`).join('')}</div></div>`,
  ).join('');
  return `<div class="pm pm-nb">
    <div class="pm-nbbar">${['File', 'Edit', 'View', 'Insert', 'Runtime', 'Tools', 'Help']
    .map((n) => `<span>${n}</span>`).join('')}</div>
    <div class="pm-pad">${cells}</div>
  </div>`;
}

/** A course or product listing: a stack of icon + title + blurb cards. */
function listing(p) {
  return `<div class="pm pm-list">
    <div class="pm-lbar"><b>${esc(p.brand || '')}</b><span class="pm-grow"></span>
      ${(p.nav || ['Topics', 'Sign in']).map((n) => `<span>${esc(n)}</span>`).join('')}</div>
    <div class="pm-pad">
      ${p.heading ? `<div class="pm-lhead">${esc(p.heading)}</div>` : ''}
      ${(p.rows || []).map((r) => `<div class="pm-lrow">
        <span class="pm-lico">${esc(r.glyph || '▧')}</span>
        <span class="pm-ltxt"><b>${esc(r.title)}</b><i>${esc(r.body || '')}</i></span>
      </div>`).join('')}
    </div>
  </div>`;
}

/** Nothing supplied: grey bars in a plausible page rhythm, so the frame still
 *  reads as a page rather than as a bug. */
function blank() {
  return `<div class="pm pm-blank"><div class="pm-pad">
    ${line(38, 16, 0.5)}${line(84, 30, 0.75)}${line(70, 14, 0.35)}
    ${line(96, 10, 0.28)}${line(92, 10, 0.28)}${line(88, 10, 0.28)}${line(54, 10, 0.28)}
    ${line(96, 10, 0.28)}${line(74, 10, 0.28)}
  </div></div>`;
}

/**
 * Skeleton rows below whatever the mock drew.
 *
 * A screenshot that ends in white space reads as a broken render; a real one
 * always continues past the fold. The tail guarantees the card is full and
 * that its bottom edge is a crop, which is the single detail that makes the
 * frame read as a window onto a page rather than a card with a picture in it.
 */
const tail = () => `<div class="pm-tail">
  ${[92, 96, 74, 0, 88, 94, 62, 0, 96, 80].map((w) => (w
    ? `<span class="pm-sk" style="width:${w}%"></span>`
    : '<span class="pm-gap"></span>')).join('')}
</div>`;

const KINDS = { repo, docs, article, notebook, listing };

/**
 * The framed browser card.
 *
 * `tint` colours the frame border and the active accents inside the mock, so
 * the card belongs to the section it illustrates.
 */
export function browserCard(page, { tint, radius = 26, height = 0 } = {}) {
  if (!page) return '';
  const body = page.shotURI
    ? `<img class="pm-shot" src="${page.shotURI}" alt="">`
    : (KINDS[page.kind] || blank)(page);
  const h = height ? `height:${height}px;` : '';
  return `<div class="pcard" style="${h}border-color:${tint};border-radius:${radius}px">
    <div class="pcard-bar">
      <i class="pcard-dot"></i><i class="pcard-dot"></i><i class="pcard-dot"></i>
      <span class="pcard-url">${esc(page.url || '')}</span>
    </div>
    <div class="pcard-body">${body}${page.shotURI ? '' : tail()}</div>
  </div>`;
}

export const PAGE_KINDS = [...Object.keys(KINDS), 'shot'];

/**
 * Styles for everything above. Kept beside the markup rather than in the
 * theme, because these sizes are not design choices — they are what makes a
 * mock read as a screenshot, and a theme that "improved" them would break it.
 * Only the two colours a caller passes in are themeable.
 */
export function pagemockCSS({ ink = '#1F2328', muted = '#59636E', link = '#0969DA', rule = '#E4E7EB', paper = '#FFFFFF' } = {}) {
  return `
.pcard { position:relative; overflow:hidden; background:${paper};
  border:3px solid; box-shadow:0 24px 54px -30px rgba(30,22,14,.45);
  display:flex; flex-direction:column; flex:0 0 auto; }
.pcard-bar { flex:0 0 auto; display:flex; align-items:center; gap:9px;
  padding:14px 18px; background:var(--chromebar,#F4EEE4); }
.pcard-dot { width:13px; height:13px; border-radius:50%; background:var(--chromedot,#CFC7B8); }
.pcard-url { flex:1; margin-left:9px; background:${paper}; border-radius:11px;
  padding:8px 16px; font-family:Mono, monospace; font-size:21px; color:${ink};
  white-space:nowrap; overflow:hidden; }
.pcard-body { flex:1; min-height:0; overflow:hidden; background:${paper}; }
.pm-shot { width:100%; display:block; }

/* Wider than its frame on purpose. Real screenshots are cropped at the right
   edge — a sidebar half cut off, a button running under the bezel — and a
   mock that fits its own window exactly is the giveaway that it is a mock. */
.pm { font-family:Body, system-ui, sans-serif; color:${ink}; font-size:15px;
  width:112%; }
.pm-pad { padding:16px 22px; display:flex; flex-direction:column; gap:9px; }
.pm-g { display:inline-flex; width:15px; height:15px; flex:0 0 auto; }
.pm-g svg { width:100%; height:100%; }
.pm-grow { flex:1; }
.pm-sk { display:block; background:${muted}; border-radius:4px;
  height:10px; opacity:.16; }
.pm-gap { display:block; height:12px; }
/* Masked to nothing well before the card's bottom edge. Hard-edged bars that
   simply stop read as a loading state; ones that fade out read as the page
   continuing past the crop, which is the whole point of the tail. */
.pm-tail { display:flex; flex-direction:column; gap:11px; padding:22px 22px 0;
  width:112%;
  -webkit-mask-image:linear-gradient(to bottom, #000 0%, rgba(0,0,0,.55) 45%, transparent 88%);
  mask-image:linear-gradient(to bottom, #000 0%, rgba(0,0,0,.55) 45%, transparent 88%); }
/* Follow the column the mock itself set up, or the bars run under a sidebar. */
.pm-article + .pm-tail { padding-left:222px; }
.pm-repo + .pm-tail, .pm-notebook + .pm-tail { padding-left:24px; }

/* repo */
.pm-ghbar { display:flex; align-items:center; gap:20px; padding:12px 20px;
  background:#1F2328; color:#E6EDF3; font-size:15px; }
.pm-ghmark { width:22px; height:22px; }
.pm-ghnav { display:inline-flex; align-items:center; gap:4px; opacity:.92;
  white-space:nowrap; }
.pm-ghsearch { margin-left:auto; display:inline-flex; align-items:center; gap:7px;
  border:1px solid #3D444D; border-radius:7px; padding:5px 13px;
  color:#8B949E; font-size:14px; min-width:210px; }
.pm-slug { display:flex; align-items:center; gap:7px; font-size:19px; color:${link}; }
.pm-slug .pm-g { color:${ink}; opacity:.15; }
.pm-slug b { color:${link}; }
.pm-sep { color:${muted}; opacity:.7; }
.pm-vis { border:1px solid ${rule}; border-radius:20px; padding:1px 9px;
  font-size:13px; color:${muted}; }
.pm-tabs { display:flex; gap:20px; border-bottom:1px solid ${rule}; padding-bottom:9px;
  font-size:15px; color:${ink}; }
.pm-tab { display:inline-flex; align-items:center; gap:6px; padding-bottom:9px;
  margin-bottom:-10px; }
.pm-tab.on { border-bottom:2px solid #FD8C73; font-weight:600; }
.pm-count { background:#EAEEF2; border-radius:20px; padding:0 7px; font-size:12px;
  font-weight:500; color:${muted}; }
.pm-branchbar { display:flex; align-items:center; gap:16px; font-size:14px; color:${ink}; }
.pm-btn { display:inline-flex; align-items:center; gap:6px; border:1px solid ${rule};
  border-radius:7px; padding:5px 11px; font-weight:600; }
.pm-meta { display:inline-flex; align-items:center; gap:6px; color:${muted}; }
.pm-search { display:inline-flex; align-items:center; gap:7px; border:1px solid ${rule};
  border-radius:7px; padding:5px 13px; color:${muted}; min-width:180px; }
.pm-cta { background:#1F883D; color:#fff; border-radius:7px; padding:5px 13px;
  font-weight:600; font-family:Mono, monospace; font-size:13px; }
.pm-files { border:1px solid ${rule}; border-radius:9px; overflow:hidden; }
.pm-row { display:flex; align-items:center; gap:11px; padding:9px 15px;
  border-top:1px solid ${rule}; font-size:15px; }
.pm-row:first-child { border-top:0; }
.pm-dir { color:#54AEFF; }
.pm-file { color:${muted}; }
.pm-fname { width:210px; flex:0 0 auto; overflow:hidden; white-space:nowrap; }
.pm-fmsg { flex:1; color:${muted}; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
.pm-fage { color:${muted}; font-size:14px; white-space:nowrap; }
.pm-note { border-left:3px solid ${rule}; padding:4px 0 4px 14px; color:${ink};
  font-size:15px; line-height:1.5; }

/* docs */
.pm-dbar { display:flex; align-items:center; gap:22px; padding:12px 22px;
  border-bottom:1px solid ${rule}; font-size:15px; color:${muted}; }
.pm-dnav.on { border:1px solid ${rule}; border-radius:20px; padding:4px 12px;
  color:${ink}; display:inline-flex; align-items:center; gap:5px; }
.pm-dmeta { display:inline-flex; align-items:center; gap:5px; font-size:14px; }
.pm-dbtn { border:1px solid ${rule}; border-radius:7px; padding:4px 12px;
  font-size:14px; color:${ink}; }
.pm-crumb { font-size:14px; color:${muted}; }
.pm-dtitle { font-family:Display, serif; font-weight:700; font-size:31px;
  line-height:1.15; color:${ink}; }
.pm-blurb { font-size:17px; line-height:1.5; color:${muted}; }
.pm-p { font-size:14px; line-height:1.55; color:${ink}; opacity:.86; }
.pm-info { display:flex; gap:11px; background:#EBF3FE; border:1px solid #CFE2FB;
  border-radius:8px; padding:13px 15px; font-size:14px; line-height:1.5; }
.pm-info .pm-g { color:${link}; margin-top:2px; }
.pm-dsub { font-family:Display, serif; font-weight:700; font-size:22px; margin-top:6px; }

/* article */
.pm-abar { display:flex; align-items:center; gap:22px; padding:14px 26px;
  border-bottom:1px solid ${rule}; font-size:14px; color:${muted}; }
.pm-abar b { color:${ink}; font-family:BodyBold; letter-spacing:.06em; font-size:15px; }
.pm-acols { display:flex; gap:26px; padding:24px 26px; }
.pm-aside { width:170px; flex:0 0 auto; }
.pm-akick { font-size:14px; color:${ink}; line-height:1.4; margin-bottom:18px; }
.pm-amarks { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
.pm-am { aspect-ratio:1; background:${ink}; opacity:.82; }
.pm-am-0 { clip-path:polygon(50% 0,100% 100%,0 100%); }
.pm-am-1 { border-radius:50%; background:#B9C4D4; }
.pm-am-2 { clip-path:polygon(0 0,100% 0,100% 60%,60% 60%,60% 100%,0 100%); background:#6C9E5E; }
.pm-am-3 { background:repeating-radial-gradient(circle at 50% 50%, ${ink} 0 1.5px, transparent 1.5px 5px); }
.pm-am-4 { background:radial-gradient(circle at 30% 30%, ${ink} 22%, transparent 23%),
  radial-gradient(circle at 72% 68%, ${ink} 22%, transparent 23%); }
.pm-am-5 { clip-path:polygon(0 0,100% 0,0 100%); }
.pm-amain { flex:1; display:flex; flex-direction:column; gap:11px; }
.pm-atitle { font-family:Display, serif; font-weight:700; font-size:33px; line-height:1.14; }
.pm-adate { font-size:13px; color:${muted}; }

/* notebook */
.pm-nbbar { display:flex; gap:20px; padding:11px 22px; border-bottom:1px solid ${rule};
  font-size:14px; color:${muted}; }
.pm-cell { display:flex; gap:12px; border:1px solid ${rule}; border-radius:8px;
  padding:12px 14px; }
.pm-code { background:#F7F8FA; font-family:Mono, monospace; }
.pm-run { color:${muted}; font-size:13px; }
.pm-clines { display:flex; flex-direction:column; gap:5px; flex:1; }
.pm-cl { font-size:13px; line-height:1.5; color:${ink}; white-space:pre; overflow:hidden; }
.pm-ml { font-size:14px; line-height:1.5; color:${ink}; opacity:.86; }
.pm-mh { font-family:Display, serif; font-weight:700; font-size:22px; opacity:1; }

/* listing */
.pm-lbar { display:flex; align-items:center; gap:20px; padding:13px 24px;
  border-bottom:1px solid ${rule}; font-size:14px; color:${muted}; }
.pm-lbar b { color:${ink}; font-size:15px; }
.pm-lhead { font-size:14px; color:${muted}; letter-spacing:.06em; text-transform:uppercase; }
.pm-lrow { display:flex; gap:15px; align-items:center; border:1px solid ${rule};
  border-radius:10px; padding:14px 16px; }
.pm-lico { width:38px; height:38px; flex:0 0 auto; border-radius:8px;
  background:#F0F2F5; display:grid; place-items:center; font-size:19px; }
.pm-ltxt { display:flex; flex-direction:column; gap:3px; }
.pm-ltxt b { font-size:16px; }
.pm-ltxt i { font-style:normal; font-size:13px; color:${muted}; line-height:1.45; }
`;
}
