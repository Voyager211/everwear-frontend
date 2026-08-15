# Image assets

Everything under `public/` is served at the site root, so `public/images/home/hero.jpg` is
referenced in code as `/images/home/hero.jpg`. No imports, no rebuild — drop a file in and refresh.

Today these are generated placeholder SVGs. Real photography replaces them at the same paths.

---

## How many images (and why it isn't 800)

A full retail catalogue shoot is ~7 images per colourway — over 800 for this range. That is far
more than a demo can shoot *or review*. Three rules cut it to **146** with no visible loss:

1. **The packshot does three jobs** — listing card, PDP swatch thumbnail, and the PDP's flat shot.
2. **Model shots only for the 12 hero products**, and only in the primary colour — so a
   wrong-coloured model shot is never shown.
3. **The fabric macro is shared per colour**, not per product. It's abstract texture; nobody can
   tell which garment it came from.

| Group | Count |
|---|---|
| Home (hero, 2 campaign, 4 category) | 7 |
| Packshots — one per colourway | 115 |
| Model shots — hero products, primary colour | 12 |
| Fabric macros — one per colour, shared | 12 |
| **Total** | **146** |

---

## Specifications

| File | Export | Ratio | Background | Content |
|---|---|---|---|---|
| `home/hero.jpg` | 2560 × 1440 | 16:9 | scene | **Left third must stay light and empty** — red headline sits on it |
| `home/campaign-1.jpg`, `-2.jpg` | 1152 × 2048 | 9:16 | scene | Displayed ~1:2.25, so **sides get cropped** — keep subject centred |
| `home/category-*.jpg` | 1200 × 1500 | 4:5 | scene | Styled still life |
| `products/<slug>/<colour>/packshot.jpg` | 1000 × 1400 | 5:7 | **flat `#F5F5F5`** | Flat lay, no model |
| `products/<slug>/<colour>/01-model.jpg` | 1600 × 2100 | 3:4 | scene | On-body, mid-torso |
| `shared/detail-<colour>.jpg` | 1600 × 2100 | 3:4 | macro | Fabric texture + one seam |

### The background rule

Packshots sit on a `#F5F5F5` band in the cards, the home grid, the rails and the PDP swatch box.
**Shoot or generate them on exactly that grey** and the photo edge disappears, so products look like
they're floating on the page — which is the whole H&M effect. Get the hex wrong and every product
gets a visible rectangle around it.

Don't bother with transparent PNGs: image models won't produce reliable alpha, and a flat `#F5F5F5`
background achieves the same result here.

---

## Generating them

`image-manifest.csv` in the repo root lists every image with its path, dimensions, background and a
ready-to-use prompt. Regenerate it any time:

```bash
npm run manifest
```

To batch-generate with the Gemini API:

```bash
export GEMINI_API_KEY=...
node scripts/generate-images.mjs --dry-run     # preview, costs nothing
node scripts/generate-images.mjs --only packshot --limit 5   # try a few first
node scripts/generate-images.mjs               # the whole run
```

The run is **resumable** — existing files are skipped, so stop and restart freely, and re-run to
retry only what failed. Packshots are generated before model shots, and each model shot is sent its
product's packshot as a reference image so the garment stays consistent across the two.

Roughly $5 and fifteen minutes for the full 146.

---

## Switching the app over to real photography

Placeholders are `.svg`; real images will be `.jpg`. One command flips every path:

```bash
npm run assets -- --real
```

That rewrites `src/data/products.ts` to point at `.jpg` and leaves the placeholder files alone.
Delete `public/images` first if you want a clean swap.
