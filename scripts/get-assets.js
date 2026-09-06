#!/usr/bin/env node
// Downloads the shared asset library.
//
//   node scripts/get-assets.js            # everything
//   node scripts/get-assets.js objects    # one group
//
// Only permissively licensed sources are used, because these end up in images
// posted to a commercial account. Every group records its licence in
// assets/LICENSES.md. Do not add a source here without checking that its
// licence covers embedding in a redistributed image — most "free for personal
// use" illustration packs do not.
//
// Assets are curated, not mirrored. A thousand icons you never open is not a
// library, it is a download.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(HERE, '..', 'assets');

// ── Fluent Emoji, MIT. 3D-rendered objects. ─────────────────────────
// These are the closest thing to the reference decks' rendered props that is
// actually licensed for commercial reuse.
const OBJECTS = {
  // work + tools
  laptop: 'Laptop', desktop: 'Desktop computer', keyboard: 'Keyboard',
  gear: 'Gear', wrench: 'Wrench', hammer: 'Hammer and wrench',
  toolbox: 'Toolbox', electricplug: 'Electric plug', battery: 'Battery',
  // data + output
  chart: 'Bar chart', chartup: 'Chart increasing', chartdown: 'Chart decreasing',
  clipboard: 'Clipboard', abacus: 'Abacus', ledger: 'Ledger',
  card: 'Card index dividers', page: 'Page facing up', scroll: 'Scroll',
  // money
  moneybag: 'Money bag', moneywings: 'Money with wings', dollar: 'Dollar banknote',
  creditcard: 'Credit card', coin: 'Coin', receipt: 'Receipt', gem: 'Gem stone',
  // thinking + ideas
  bulb: 'Light bulb', brain: 'Brain', thinking: 'Thinking face',
  magnifier: 'Magnifying glass tilted left', telescope: 'Telescope',
  compass: 'Compass', map: 'World map',
  // speed + delivery
  rocket: 'Rocket', zap: 'High voltage', fire: 'Fire', package: 'Package',
  mailbox: 'Open mailbox with raised flag', envelope: 'Envelope',
  paperplane: 'Paperclip', truck: 'Delivery truck',
  // time
  clock: 'Alarm clock', hourglass: 'Hourglass done', calendar: 'Spiral calendar',
  stopwatch: 'Stopwatch',
  // knowledge
  books: 'Books', book: 'Open book', graduation: 'Graduation cap',
  memo: 'Memo', pencil: 'Pencil', paperclip: 'Paperclip',
  // signals
  warning: 'Warning', prohibited: 'Prohibited', check: 'Check mark button',
  cross: 'Cross mark', question: 'Red question mark', exclamation: 'Red exclamation mark',
  bell: 'Bell', megaphone: 'Megaphone', loudspeaker: 'Loudspeaker',
  // outcomes
  trophy: 'Trophy', medal: '1st place medal', target: 'Bullseye',
  star: 'Star', sparkles: 'Sparkles', partypopper: 'Party popper',
  crown: 'Crown', handshake: 'Handshake',
  // security
  lock: 'Locked', unlock: 'Unlocked', key: 'Key', shield: 'Shield',
  // machines + places
  robot: 'Robot', satellite: 'Satellite antenna', antenna: 'Antenna bars',
  factory: 'Factory', office: 'Office building', house: 'House',
  // misc scene dressing
  plant: 'Potted plant', coffee: 'Hot beverage', bulbon: 'Light bulb',
  camera: 'Camera', clapper: 'Clapper board', film: 'Film frames',
  microphone: 'Studio microphone', headphone: 'Headphone', tv: 'Television',
  phone: 'Mobile phone', printer: 'Printer', floppy: 'Floppy disk',
  folder: 'File folder', cabinet: 'File cabinet', link: 'Link',
  puzzle: 'Puzzle piece', bricks: 'Brick', ladder: 'Ladder',
  globe: 'Globe with meridians', crystalball: 'Crystal ball',
};

// ── Simple Icons, CC0. Brand marks. ─────────────────────────────────
const LOGOS = [
  'github', 'gitlab', 'slack', 'notion', 'figma', 'linear', 'jira', 'confluence',
  'obsidian', 'discord', 'zoom', 'gmail', 'googledrive', 'googlecalendar',
  'googlesheets', 'googlemaps', 'youtube', 'instagram', 'linkedin', 'x',
  'tiktok', 'facebook', 'threads', 'reddit', 'substack', 'medium',
  'stripe', 'paypal', 'shopify',
  'quickbooks', 'docker', 'kubernetes', 'postgresql', 'mysql', 'mongodb',
  'redis', 'supabase', 'firebase', 'vercel', 'netlify', 'cloudflare',
  'amazonwebservices', 'googlecloud', 'microsoftazure', 'openai', 'huggingface',
  'ollama', 'python', 'javascript', 'typescript', 'nodedotjs', 'react',
  'nextdotjs', 'vuedotjs', 'svelte', 'tailwindcss', 'git', 'npm', 'zapier',
  'airtable', 'webflow', 'wordpress', 'hubspot', 'salesforce', 'mailchimp',
  'sentry', 'grafana', 'elasticsearch', 'graphql', 'postman', 'insomnia',
  // Paid-vs-free comparison decks name a lot of tools on both sides.
  'dropbox', 'nextcloud', 'n8n', 'penpot', 'miro', 'excalidraw', 'loom',
  'obsstudio', 'typeform', 'googleforms', 'mixpanel', 'posthog', 'deepl',
  'bitwarden', '1password', 'intercom', 'chatwoot', 'calendly', 'caldotcom',
  'baserow', 'trello', 'asana', 'clickup', 'basecamp', 'mattermost',
  'rocketdotchat', 'jitsi', 'nocodb', 'appwrite', 'directus', 'strapi',
  'ghost', 'matomo', 'plausibleanalytics', 'umami', 'metabase', 'grafana',
  'linear', 'height', 'todoist', 'ticktick', 'evernote', 'joplin',
  'canva', 'gimp', 'inkscape', 'blender', 'audacity', 'davinciresolve',
  'adobephotoshop', 'adobeillustrator', 'sketch', 'framer', 'spline',
  'anthropic', 'perplexity', 'mistralai', 'replicate', 'langchain',
  // paid-vs-free swap decks
  'libreoffice', 'asana', 'trello', 'webflow', 'wordpress', 'cloudflare',
  'metabase', 'matomo', 'teamviewer', 'rustdesk', 'sharex', 'quickbooks',
  'hubspot', 'squarespace', 'ghost', 'gimp', 'capcut', 'kdenlive',
  'googledocs', 'adobe', 'looker', 'hotjar',

  // Catalogue decks name a lot of tools across a lot of categories.
  'hubspot', 'salesforce', 'ahrefs', 'semrush', 'googleanalytics', 'klaviyo',
  'canva', 'cloudinary', 'elevenlabs', 'ffmpeg', 'youtube', 'make',
  'pipedream', 'pinecone', 'qdrant', 'weaviate', 'ollama', 'openrouter',
  'amazonwebservices', 'googlecloud', 'terraform', 'square', 'plaid',
  'amplitude', 'polygon', 'metabase', 'apifox', 'apify',
];

// ── Lucide, ISC. Line icons at one stroke weight. ────────────────────
const ICONS = [
  'check', 'x', 'plus', 'minus', 'arrow-right', 'arrow-left', 'arrow-up',
  'arrow-down', 'arrow-up-right', 'chevron-right', 'chevrons-right',
  'zap', 'flame', 'sparkles', 'star', 'heart', 'bookmark', 'flag',
  'file-text', 'files', 'folder', 'folder-open', 'archive', 'clipboard-list',
  'link', 'link-2', 'external-link', 'paperclip', 'share-2',
  'clock', 'timer', 'calendar', 'history', 'hourglass',
  'dollar-sign', 'credit-card', 'wallet', 'trending-up', 'trending-down',
  'bar-chart-3', 'line-chart', 'pie-chart', 'activity', 'gauge',
  'search', 'filter', 'scan', 'eye', 'eye-off', 'target', 'crosshair',
  'lightbulb', 'brain', 'message-circle', 'message-square', 'mail', 'send',
  'users', 'user', 'user-check', 'building-2', 'briefcase',
  'settings', 'sliders-horizontal', 'wrench', 'terminal', 'code', 'code-2',
  'braces', 'git-branch', 'git-commit-horizontal', 'git-pull-request',
  'database', 'server', 'cloud', 'cpu', 'hard-drive', 'network',
  'lock', 'unlock', 'shield', 'shield-check', 'key', 'fingerprint',
  'alert-triangle', 'alert-circle', 'info', 'help-circle', 'ban', 'check-circle-2',
  'play', 'pause', 'skip-forward', 'repeat', 'refresh-cw', 'rotate-cw',
  'download', 'upload', 'package', 'truck', 'rocket', 'compass', 'map',
  'layers', 'box', 'grid-3x3', 'list', 'table', 'columns-3',
  'image', 'video', 'camera', 'mic', 'headphones', 'monitor', 'smartphone',
  'bot', 'wand-2', 'workflow', 'plug', 'puzzle', 'infinity',
];

const OUT = {
  objects: path.join(ASSETS, 'objects-3d'),
  logos: path.join(ASSETS, 'logos'),
  icons: path.join(ASSETS, 'icons'),
};

async function grab(url, dest) {
  const r = await fetch(url);
  if (!r.ok) return { ok: false, status: r.status };
  const buf = Buffer.from(await r.arrayBuffer());
  fs.writeFileSync(dest, buf);
  return { ok: true, bytes: buf.length };
}

/** jsdelivr rate-limits hard on bursts, so requests go out in small batches. */
async function pool(items, worker, size = 6) {
  const out = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(...await Promise.all(items.slice(i, i + size).map(worker)));
  }
  return out;
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

async function getObjects() {
  fs.mkdirSync(OUT.objects, { recursive: true });
  const entries = Object.entries(OBJECTS);
  const res = await pool(entries, async ([name, emoji]) => {
    const url = `https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/${encodeURIComponent(emoji)}/3D/${slug(emoji)}_3d.png`;
    const r = await grab(url, path.join(OUT.objects, `${name}.png`));
    if (!r.ok) fs.rmSync(path.join(OUT.objects, `${name}.png`), { force: true });
    return { name, emoji, ...r };
  });
  return res;
}

async function getLogos() {
  fs.mkdirSync(OUT.logos, { recursive: true });
  return pool(LOGOS, async (name) => {
    const url = `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${name}.svg`;
    const r = await grab(url, path.join(OUT.logos, `${name}.svg`));
    if (!r.ok) fs.rmSync(path.join(OUT.logos, `${name}.svg`), { force: true });
    return { name, ...r };
  });
}

async function getIcons() {
  fs.mkdirSync(OUT.icons, { recursive: true });
  return pool(ICONS, async (name) => {
    const url = `https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/${name}.svg`;
    const r = await grab(url, path.join(OUT.icons, `${name}.svg`));
    if (!r.ok) fs.rmSync(path.join(OUT.icons, `${name}.svg`), { force: true });
    return { name, ...r };
  });
}

const GROUPS = { objects: getObjects, logos: getLogos, icons: getIcons };

const only = process.argv[2];
const run = only ? { [only]: GROUPS[only] } : GROUPS;
if (only && !GROUPS[only]) {
  console.error(`Unknown group "${only}". Have: ${Object.keys(GROUPS).join(', ')}`);
  process.exit(1);
}

for (const [group, fn] of Object.entries(run)) {
  process.stdout.write(`\n${group}: `);
  const res = await fn();
  const ok = res.filter((r) => r.ok);
  const bad = res.filter((r) => !r.ok);
  const kb = Math.round(ok.reduce((a, r) => a + r.bytes, 0) / 1024);
  console.log(`${ok.length}/${res.length} downloaded, ${kb} KB`);
  if (bad.length) console.log(`  missing: ${bad.map((b) => b.name).join(', ')}`);
}
console.log('');
