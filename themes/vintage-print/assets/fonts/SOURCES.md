# Fonts

Vendored as woff2 so rendering never touches the network and never silently
falls back to a system font. Refresh with `node scripts/get-fonts.js vintage-print`.

| File | Family | Weight | Licence |
|---|---|---|---|
| `display.woff2` | Alfa Slab One | 400 | SIL Open Font License 1.1 |
| `label.woff2` | Oswald | 600 | SIL Open Font License 1.1 |
| `label-light.woff2` | Oswald | 400 | SIL Open Font License 1.1 |
| `body.woff2` | Courier Prime | 400 | SIL Open Font License 1.1 |
| `body-medium.woff2` | Courier Prime | 700 | SIL Open Font License 1.1 |

All OFL, so embedding them in rendered images is fine for commercial use. If
you swap in a licensed typeface, check that its licence covers embedding —
most webfont licences do not cover redistribution inside an image pipeline
without a separate grant.
