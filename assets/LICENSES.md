# Asset licences

Everything here is permissively licensed for commercial use, because it ends
up inside images posted to a brand account. **Do not add a source without
checking that its licence covers embedding in a redistributed image** — most
"free for personal use" illustration packs do not, and several popular ones
(Storyset, Icons8/Ouch, Blush) require attribution or a paid licence for this
exact use.

| Folder | Source | Licence | Attribution |
|---|---|---|---|
| `objects-3d/fluent/` | [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) (Microsoft) | MIT | Not required |
| `objects-3d/3d-clay/` `3d-color/` `3d-gradient/` `3d-premium/` | [3dicons](https://3dicons.co) (Vijay Verma) | CC0 1.0 | Not required |
| `logos/` | [Simple Icons](https://github.com/simple-icons/simple-icons) | CC0 1.0 | Not required |
| `icons/` | [Lucide](https://github.com/lucide-icons/lucide) | ISC | Not required |
| `fonts/` and `themes/*/assets/fonts/` | Google Fonts — see the table below | SIL OFL 1.1 | Not required, but the licence must travel with the files |

Refresh or extend with `node scripts/get-assets.js [objects|logos|icons]`.
The 3dicons packs come from a local download rather than a URL — re-ingest
them with `node scripts/ingest-3dicons.js`.

## Why the 3dicons are PNGs and not the SVGs you downloaded

The source files are 3D renders exported as vector meshes: 569KB median,
1.3MB worst case. Embedding one would put ~760KB of base64 in a page that
displays the result at roughly 300 CSS pixels. `ingest-3dicons.js` rasterises
each at 512px — the largest size it can ever be shown at 2x — which took the
four packs from 279MB to 46MB with no visible difference. Keep the original
SVG folders if you want to re-export at another size; nothing reads them at
render time.
The curated lists live at the top of that script — add a name there rather
than dropping files in by hand, so the library stays reproducible.

## Fonts

Every typeface is vendored as a `.woff2` rather than fetched at render time, so
a render never depends on the network and a deck rendered today looks identical
in a year. That makes this repo a **redistributor** of the fonts, which the SIL
Open Font License permits — provided the licence travels with them. The full
text is at `assets/fonts/OFL.txt`.

| Family | Used for | Upstream |
|---|---|---|
| Alfa Slab One | `slab-400` | [specimen](https://fonts.google.com/specimen/Alfa+Slab+One) |
| Archivo Black | `impact-400` | [specimen](https://fonts.google.com/specimen/Archivo+Black) |
| Bodoni Moda | `didone-*` | [specimen](https://fonts.google.com/specimen/Bodoni+Moda) |
| Bricolage Grotesque | `grotesque-*`, pixel-mascot display | [specimen](https://fonts.google.com/specimen/Bricolage+Grotesque) |
| Caveat | `hand-*` | [specimen](https://fonts.google.com/specimen/Caveat) |
| Courier Prime | `typewriter-*` | [specimen](https://fonts.google.com/specimen/Courier+Prime) |
| Figtree | briefing, index-rail body | [specimen](https://fonts.google.com/specimen/Figtree) |
| IBM Plex Sans | `sans-*` | [specimen](https://fonts.google.com/specimen/IBM+Plex+Sans) |
| JetBrains Mono | `mono-*` | [specimen](https://fonts.google.com/specimen/JetBrains+Mono) |
| Oswald | `condensed-*` | [specimen](https://fonts.google.com/specimen/Oswald) |
| Playfair Display | `serif-*` | [specimen](https://fonts.google.com/specimen/Playfair+Display) |
| Source Serif 4 | index-rail display | [specimen](https://fonts.google.com/specimen/Source+Serif+4) |
| Space Grotesk | `geo-*` | [specimen](https://fonts.google.com/specimen/Space+Grotesk) |

Two things to keep true when you add a family:

- **Check its licence on the specimen page first.** Google Fonts hosts a small
  number of families under Apache-2.0 and Ubuntu-FL rather than OFL. All of
  those permit redistribution too, but they are different documents and the
  right one has to ship alongside.
- **The OFL forbids selling the fonts on their own** and forbids using a
  Reserved Font Name on a modified version. Neither is a risk here — the files
  are embedded as base64 inside a rendered PNG, which is a normal use — but it
  is why "just copy the woff2 into your project" is not always the whole story.

## One caveat on brand logos

Simple Icons is CC0, so the *files* are free. That does not grant you rights
to the **trademarks** they depict. Using the GitHub or Stripe mark to identify
GitHub or Stripe in an editorial context is normal and fine. Using it to imply
endorsement, or as part of your own branding, is not. That is trademark law,
not licensing, and no asset licence changes it.

## What is deliberately absent

- **Photography.** No source offers bulk download under a licence this clean.
  Shoot your own, or generate.
- **Character illustrations / people cutouts.** unDraw's licence is fine but
  it offers no bulk download; Open Peeps' repo is gone. The pixel mascot in
  `scripts/lib/mascot.js` covers this need and is fully ours.
