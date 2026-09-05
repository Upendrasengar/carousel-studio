# Fonts

Vendored as woff2 so rendering never touches the network and never silently
falls back to a system font. Refresh with `node scripts/get-fonts.js pixel-mascot`.

| File | Family | Weight | Licence |
|---|---|---|---|
| `display.woff2` | Bricolage Grotesque | 800 | SIL Open Font License 1.1 |
| `display-regular.woff2` | Bricolage Grotesque | 500 | SIL Open Font License 1.1 |
| `body.woff2` | IBM Plex Sans | 400 | SIL Open Font License 1.1 |
| `body-medium.woff2` | IBM Plex Sans | 600 | SIL Open Font License 1.1 |

Both families are OFL, so embedding them in rendered images is fine for
commercial use. If you swap in a licensed typeface, check that its licence
covers embedding — most webfont licences do not cover redistribution inside
an image pipeline without a separate grant.
