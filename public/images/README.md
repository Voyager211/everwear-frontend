# Image assets

Drop images in here. Everything under `public/` is served verbatim at the site root, so a file at
`public/images/home/hero.jpg` is referenced in code as `/images/home/hero.jpg`. No imports, no
rebuild — save the file, refresh the browser.

**Formats:** JPEG for photography, **PNG with transparency for packshots** (see below), SVG for the
wordmark. Keep each file under ~300KB; the whole folder under ~40MB so the demo loads fast on
conference wifi.

---

## Folder layout

```
public/images/
  brand/
    wordmark.svg              client logo, colour version   (header)
    wordmark-black.svg        black version                 (footer)

  home/
    hero.jpg                  full-bleed hero
    campaign-1.jpg            left campaign image
    campaign-2.jpg            right campaign image
    category-briefs.jpg       category tile
    category-vests.jpg
    category-lounge.jpg
    category-socks.jpg

  products/
    <product-slug>/           folder name MUST match the product's slug in data/products.ts
      packshot.png            ⚠️ transparent — home grid + listing cards + rails
      swatch-black.jpg        PDP colour swatch thumb, one per colourway
      swatch-navy.jpg
      01-model.jpg            gallery images, ordered by the number prefix
      02-model-crop.jpg
      03-pack.jpg
      04-flat.jpg
      05-detail.jpg
```

An `_example-3-pack-cotton-trunks/` folder is included to show the per-product convention. Delete it
once real products exist.

Because folder names match slugs, `data/products.ts` derives every path automatically — you only
need the folder name to be right, not to write out each path.

---

## Sizes and requirements

| Where | File | Export size | Aspect | Notes |
|---|---|---|---|---|
| Hero | `home/hero.jpg` | 2560 × 1100 | ~21:9 | **Needs a light, uncluttered bottom-left area** — the red headline sits there |
| Campaign pair | `home/campaign-*.jpg` | 1200 × 2250 | ~1:1.9 | **Must be very tall** — displayed at ~2× viewport height while a caption stays pinned at the bottom |
| Category tiles | `home/category-*.jpg` | 1200 × 1500 | 4:5 | |
| Packshot | `products/*/packshot.png` | 1000 × 1400 | 5:7 | **Transparent background** — see below |
| PDP gallery, full width | `products/*/0N-*.jpg` | 1600 × 2100 | ~3:4 | spans both gallery columns |
| PDP gallery, half width | `products/*/0N-*.jpg` | 1000 × 1300 | ~3:4 | spans one column |
| PDP colour swatch | `products/*/swatch-*.jpg` | 240 × 360 | 2:3 | small bordered thumbnail |

### The packshot rule (the one that matters)

Product images sit on a grey band (`#f5f5f5`) on the home grid, the listing cards and the PDP rails.
If a packshot has a baked-in white background it will show as a visible white rectangle against that
grey.

**Export packshots as transparent PNGs and let CSS supply the background.** That way the same file
works on any band colour, and if we change the grey later nothing needs re-exporting.

(The real H&M site doesn't do this — some of their tiles genuinely are white against grey. If you'd
rather reproduce that inconsistency, plain JPEGs are fine. Transparent is the safer default.)

### Gallery ordering

Files are ordered by their number prefix. Whether each image spans one or two columns of the PDP
mosaic is set per-product in `data/products.ts`, not in the filename — it's an editorial choice.
A good default rhythm, matching the reference:

```
01  span 2   model shot
02  span 1   model, cropped
03  span 1   flat pack shot
04  span 2   single garment
05  span 2   fabric / stitching macro
```

---

## Placeholders

If real photography isn't ready, the build can run on generated SVG placeholders at the exact
aspect ratios above. Layout, spacing and scroll behaviour will all be correct, and swapping in real
files later is a drop-in replacement — same paths, no code changes.
