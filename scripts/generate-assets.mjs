/**
 * Generates placeholder imagery + the product catalogue.
 *
 *   node scripts/generate-assets.mjs
 *
 * Writes:
 *   public/images/home/*.svg          hero, campaign pair, category tiles
 *   public/images/products/<slug>/<colour>/{packshot,swatch,01..05}.svg
 *   src/data/products.ts              the typed catalogue
 *
 * The SVGs are placeholders at the exact aspect ratios the layout expects. Real photography
 * drops into the same paths with the same basenames — see public/images/README.md.
 */

import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const IMG = join(ROOT, 'public', 'images')

/* ------------------------------------------------------------------ palette */

export const C = {
  black: '#1a1a1a',
  white: '#f2f2f2',
  navy: '#232f47',
  grey: '#9a9a9a',
  teal: '#2f5f5c',
  burgundy: '#5e2230',
  beige: '#c8b49b',
  olive: '#4a4f3a',
  sky: '#a8c4dd',
  blush: '#d8a9a9',
  sage: '#9aab96',
  brown: '#4a3a30',
}
export const NAMES = {
  black: 'Black', white: 'White', navy: 'Navy', grey: 'Grey melange', teal: 'Teal',
  burgundy: 'Burgundy', beige: 'Beige', olive: 'Olive', sky: 'Light blue',
  blush: 'Blush', sage: 'Sage', brown: 'Dark brown',
}

const shade = (hex, amount) => {
  const n = parseInt(hex.slice(1), 16)
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) =>
    Math.max(0, Math.min(255, Math.round(v + amount))),
  )
  return '#' + ch.map((v) => v.toString(16).padStart(2, '0')).join('')
}

/* ----------------------------------------------------------------- garments */
/* All drawn in a 1000x1400 box so they compose consistently at any size. */

const luminance = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255
}

function garment(type, main) {
  const band = shade(main, -22)
  const fold = shade(main, main === C.white ? -18 : 26)
  const edge = shade(main, -40)
  // Light garments sit on a #f5f5f5 band and would otherwise disappear into it.
  const outline = luminance(main) > 0.82 ? ` stroke="${shade(main, -34)}" stroke-width="3"` : ''
  const g = (d, fill) => `<path d="${d}" fill="${fill}"${outline}/>`

  switch (type) {
    case 'trunks':
      return [
        g('M240 490 L760 490 L760 720 C760 782 700 802 640 802 L618 802 C598 760 556 738 500 738 C444 738 402 760 382 802 L360 802 C300 802 240 782 240 720 Z', main),
        g('M236 418 L764 418 L764 496 L236 496 Z', band),
        g('M496 500 L504 500 L504 736 L496 736 Z', edge),
      ].join('')
    case 'briefs':
      return [
        g('M262 492 L738 492 L732 640 C732 700 688 730 628 736 L612 736 C594 690 552 668 500 668 C448 668 406 690 388 736 L372 736 C312 730 268 700 268 640 Z', main),
        g('M258 428 L742 428 L742 498 L258 498 Z', band),
      ].join('')
    case 'boxers':
      return [
        g('M232 470 L768 470 L788 862 L618 884 L560 700 C540 656 460 656 440 700 L382 884 L212 862 Z', main),
        g('M228 398 L772 398 L772 476 L228 476 Z', band),
        g('M496 480 L504 480 L504 690 L496 690 Z', fold),
      ].join('')
    case 'vest':
      return [
        g('M398 296 L602 296 L684 358 L706 486 L642 504 L642 1052 L358 1052 L358 504 L294 486 L316 358 Z', main),
        g('M398 296 C440 340 560 340 602 296 L602 316 C560 362 440 362 398 316 Z', band),
      ].join('')
    case 'tee':
      return [
        g('M372 306 L628 306 L760 372 L800 540 L706 572 L706 1010 L294 1010 L294 572 L200 540 L240 372 Z', main),
        g('M372 306 C424 356 576 356 628 306 L628 328 C576 380 424 380 372 328 Z', band),
      ].join('')
    case 'bra':
      return [
        g('M296 486 C296 604 396 664 500 664 C604 664 704 604 704 486 L704 472 C620 522 380 522 296 472 Z', main),
        g('M282 656 L718 656 L718 726 L282 726 Z', band),
        g('M312 470 L336 300 L360 306 L340 472 Z', main),
        g('M688 470 L664 300 L640 306 L660 472 Z', main),
        g('M498 520 L502 520 L502 662 L498 662 Z', fold),
      ].join('')
    case 'socks':
      return [
        g('M418 372 L582 372 L582 776 C582 858 622 898 700 918 L762 936 C804 950 804 1008 762 1024 L558 1082 C478 1104 418 1052 418 970 Z', main),
        g('M414 340 L586 340 L586 400 L414 400 Z', band),
      ].join('')
    case 'shorts':
      return [
        g('M244 466 L756 466 L780 800 L616 822 L558 664 C540 626 460 626 442 664 L384 822 L220 800 Z', main),
        g('M240 400 L760 400 L760 472 L240 472 Z', band),
      ].join('')
    case 'robe':
      return [
        g('M360 300 L640 300 L742 366 L778 540 L700 566 L700 1120 L300 1120 L300 566 L222 540 L258 366 Z', main),
        g('M470 300 L530 300 L530 1120 L470 1120 Z', band),
        g('M300 700 L700 700 L700 736 L300 736 Z', band),
      ].join('')
    default:
      return g('M300 400 L700 400 L700 1000 L300 1000 Z', main)
  }
}

const svg = (w, h, body, opts = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"${
    opts.attrs ? ' ' + opts.attrs : ''
  }>${body}</svg>\n`

/**
 * Ink bounds of each garment inside the 1000x1400 box. Packshots crop to these so the product
 * fills its frame instead of floating in the middle of a mostly-empty viewBox.
 */
const BOUNDS = {
  trunks: [236, 418, 528, 384],
  briefs: [258, 428, 484, 308],
  boxers: [212, 398, 576, 486],
  vest: [294, 296, 412, 756],
  tee: [200, 306, 600, 704],
  bra: [282, 300, 436, 426],
  socks: [414, 340, 172, 742],
  shorts: [220, 400, 560, 422],
  robe: [222, 300, 556, 820],
}

/** An SVG cropped to the garment, letterboxed into the target aspect by `meet`. */
const fitted = (type, main, w, h, { pad = 40, background, body } = {}) => {
  const [x, y, bw, bh] = BOUNDS[type] ?? [0, 0, 1000, 1400]
  const vb = `${x - pad} ${y - pad} ${bw + pad * 2} ${bh + pad * 2}`
  const bg = background
    ? `<rect x="${x - pad}" y="${y - pad}" width="${bw + pad * 2}" height="${
        bh + pad * 2
      }" fill="${background}"/>`
    : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${w}" height="${h}">${bg}${
    body ?? garment(type, main)
  }</svg>\n`
}

/* Place the 1000x1400 garment box inside an arbitrary canvas. */
const place = (type, main, { w, h, scale = 1, dx = 0, dy = 0 }) => {
  const s = (Math.min(w / 1000, h / 1400) * scale).toFixed(4)
  const x = (w / 2 - 500 * s + dx).toFixed(1)
  const y = (h / 2 - 700 * s + dy).toFixed(1)
  return `<g transform="translate(${x} ${y}) scale(${s})">${garment(type, main)}</g>`
}

/* --------------------------------------------------------- image templates */

const BAND = '#f5f5f5'

/** Transparent background — CSS supplies the band colour. */
const packshot = (type, main) => fitted(type, main, 1000, 1400, { pad: 60 })

const swatch = (type, main) => fitted(type, main, 240, 360, { pad: 50, background: '#ffffff' })

/** Soft studio backdrop + an abstract figure, with the garment on top. */
const modelShot = (type, main, { w, h, crop = false }) => {
  const fig = crop
    ? `<ellipse cx="${w * 0.5}" cy="${h * 0.16}" rx="${w * 0.3}" ry="${h * 0.24}" fill="#d3cbc3"/>
       <rect x="${w * 0.24}" y="${h * 0.34}" width="${w * 0.52}" height="${h * 0.7}" rx="${w * 0.16}" fill="#dad3cb"/>`
    : `<circle cx="${w * 0.5}" cy="${h * 0.16}" r="${w * 0.135}" fill="#d3cbc3"/>
       <rect x="${w * 0.29}" y="${h * 0.27}" width="${w * 0.42}" height="${h * 0.44}" rx="${w * 0.19}" fill="#dad3cb"/>
       <rect x="${w * 0.33}" y="${h * 0.58}" width="${w * 0.34}" height="${h * 0.46}" rx="${w * 0.15}" fill="#d3cbc3"/>`
  return svg(
    w,
    h,
    `<defs><linearGradient id="b" x1="0" y1="0" x2="0" y2="1">
       <stop offset="0" stop-color="#efecea"/><stop offset="1" stop-color="#e2dedb"/></linearGradient></defs>
     <rect width="${w}" height="${h}" fill="url(#b)"/>${fig}` +
      place(type, main, { w, h, scale: crop ? 0.78 : 0.46, dy: crop ? h * 0.1 : h * 0.14 }),
  )
}

/** A stack of folded garments, as multipacks are shot. */
const packStack = (type, main, count, { w, h }) => {
  const n = Math.min(count, 6)
  const step = 46
  const layers = Array.from({ length: n }, (_, i) => {
    const off = (n - 1 - i) * step
    const tone = shade(main, i * 6 - 12)
    return `<g transform="translate(${(-off * 0.4).toFixed(0)} ${-off})" opacity="${(
      0.6 +
      (i / n) * 0.4
    ).toFixed(2)}">${garment(type, tone)}</g>`
  }).join('')
  return fitted(type, main, w, h, {
    pad: 60 + (n - 1) * step * 0.6,
    background: BAND,
    body: layers,
  })
}

const flatShot = (type, main, { w, h }) => fitted(type, main, w, h, { pad: 90, background: BAND })

/** Extreme fabric macro — ribbing and a seam. */
const detailShot = (main, { w, h }) => {
  const rib = shade(main, main === C.white ? -12 : 18)
  const lines = Array.from({ length: Math.ceil(w / 46) }, (_, i) => {
    const x = i * 46
    return `<rect x="${x}" y="0" width="22" height="${h}" fill="${rib}" opacity=".5"/>`
  }).join('')
  const seam = Array.from({ length: Math.ceil(w / 40) }, (_, i) => `<rect x="${i * 40 + 8}" y="${h * 0.5 - 3}" width="20" height="6" fill="${shade(main, -46)}"/>`).join('')
  return svg(w, h, `<rect width="${w}" height="${h}" fill="${main}"/>${lines}${seam}`)
}

/* ------------------------------------------------------------- home imagery */

function writeHomeImages() {
  // Hero — light, with a deliberately clean bottom-left for the red headline.
  writeFileSync(
    join(IMG, 'home', 'hero.svg'),
    svg(
      2560,
      1100,
      `<defs><linearGradient id="h" x1="0" y1="0" x2="1" y2="1">
         <stop offset="0" stop-color="#f6f4f2"/><stop offset="1" stop-color="#e6e0da"/></linearGradient></defs>
       <rect width="2560" height="1100" fill="url(#h)"/>
       <circle cx="1720" cy="420" r="330" fill="#dcd3c9" opacity=".85"/>
       <rect x="1420" y="600" width="960" height="500" rx="220" fill="#e4ded7"/>` +
        place('trunks', C.black, { w: 2560, h: 1100, scale: 0.78, dx: 460, dy: 90 }),
    ),
  )

  // Campaign pair — must be ~2x viewport height.
  const campaign = (tint, type, main) =>
    svg(
      1200,
      2250,
      `<defs><linearGradient id="c" x1="0" y1="0" x2="0" y2="1">
         <stop offset="0" stop-color="${tint[0]}"/><stop offset="1" stop-color="${tint[1]}"/></linearGradient></defs>
       <rect width="1200" height="2250" fill="url(#c)"/>
       <circle cx="600" cy="470" r="235" fill="#ffffff" opacity=".5"/>
       <rect x="320" y="760" width="560" height="1180" rx="270" fill="#ffffff" opacity=".42"/>` +
        place(type, main, { w: 1200, h: 2250, scale: 0.52, dy: 300 }),
    )
  writeFileSync(join(IMG, 'home', 'campaign-1.svg'), campaign(['#e7e2dd', '#cfc6bb'], 'vest', C.white))
  writeFileSync(join(IMG, 'home', 'campaign-2.svg'), campaign(['#dfe5e4', '#b9c6c4'], 'trunks', C.teal))

  const tiles = [
    ['category-briefs', 'briefs', C.black],
    ['category-vests', 'vest', C.white],
    ['category-lounge', 'shorts', C.beige],
    ['category-socks', 'socks', C.navy],
  ]
  for (const [name, type, main] of tiles) {
    writeFileSync(
      join(IMG, 'home', `${name}.svg`),
      svg(1200, 1500, `<rect width="1200" height="1500" fill="#eceae7"/>` + place(type, main, { w: 1200, h: 1500, scale: 0.66 })),
    )
  }
}

/* ------------------------------------------------------------- the catalogue */

const A = ['XS', 'S', 'M', 'L', 'XL', 'XXL']          // apparel
const K = ['2-4Y', '4-6Y', '6-8Y', '8-10Y', '10-12Y'] // kids
const S = ['35-38', '39-42', '43-46']                 // socks

// slug, name, garment, category, sub, price, pack, sizes, colours, extras
export const CATALOG = [
  // ---- men
  ['10-pack-short-cotton-trunks', '10-PACK SHORT COTTON TRUNKS', 'trunks', 'men', 'Trunks', 2999, 10, A, ['black'], { rating: [4.7, 39] }],
  ['5-pack-cotton-short-trunks', '5-PACK COTTON SHORT TRUNKS', 'trunks', 'men', 'Trunks', 1499, 5, A, ['black', 'navy', 'burgundy', 'grey'], { rating: [4.6, 214] }],
  ['5-pack-short-trunks-with-lycra', '5-PACK SHORT TRUNKS WITH LYCRA®', 'trunks', 'men', 'Trunks', 2299, 5, A, ['black', 'teal', 'grey'], { concept: 'EVERYDAY COTTON', rating: [4.5, 88] }],
  ['3-pack-cotton-short-trunks', '3-PACK COTTON SHORT TRUNKS', 'trunks', 'men', 'Trunks', 1499, 3, A, ['black', 'navy'], { label: 'New Arrival' }],
  ['3-pack-coolmax-mid-trunks', '3-PACK COOLMAX® MID TRUNKS', 'trunks', 'men', 'Trunks', 1499, 3, A, ['teal', 'black', 'olive'], { concept: 'PERFORMANCE', label: 'New Arrival', rating: [4.4, 51] }],
  ['4-pack-woven-boxer-shorts', '4-PACK WOVEN BOXER SHORTS', 'boxers', 'men', 'Boxer shorts', 2299, 4, A, ['burgundy', 'navy', 'sky', 'teal'], { label: 'New Arrival' }],
  ['3-pack-woven-boxer-shorts', '3-PACK WOVEN BOXER SHORTS', 'boxers', 'men', 'Boxer shorts', 1799, 3, A, ['sky', 'brown', 'olive'], {}],
  ['5-pack-cotton-briefs', '5-PACK COTTON BRIEFS', 'briefs', 'men', 'Briefs', 1299, 5, A, ['white', 'black'], { rating: [4.3, 126] }],
  ['3-pack-microfibre-trunks', '3-PACK MICROFIBRE TRUNKS', 'trunks', 'men', 'Trunks', 1699, 3, A, ['black', 'grey'], { concept: 'PERFORMANCE' }],
  ['2-pack-long-trunks', '2-PACK LONG TRUNKS', 'trunks', 'men', 'Trunks', 1299, 2, A, ['black', 'navy'], {}],
  ['3-pack-ribbed-cotton-vests', '3-PACK RIBBED COTTON VESTS', 'vest', 'men', 'Vests', 1499, 3, A, ['white', 'black', 'grey'], { rating: [4.5, 73] }],
  ['5-pack-cotton-vests', '5-PACK COTTON VESTS', 'vest', 'men', 'Vests', 1999, 5, A, ['white', 'black'], {}],
  ['seamless-performance-trunks', 'SEAMLESS PERFORMANCE TRUNKS', 'trunks', 'men', 'Trunks', 799, 1, A, ['black', 'olive', 'navy'], { concept: 'PERFORMANCE', sale: 999 }],
  ['3-pack-modal-trunks', '3-PACK MODAL TRUNKS', 'trunks', 'men', 'Trunks', 1899, 3, A, ['brown', 'black', 'sage'], { concept: 'PREMIUM', rating: [4.8, 42] }],
  ['3-pack-boxer-briefs-with-drymove', '3-PACK BOXER BRIEFS WITH DRYMOVE™', 'trunks', 'men', 'Trunks', 1799, 3, A, ['black', 'navy'], { concept: 'PERFORMANCE' }],
  ['2-pack-thermal-long-johns', '2-PACK THERMAL LONG JOHNS', 'trunks', 'men', 'Thermals', 1999, 2, A, ['black', 'grey'], {}],
  ['3-pack-jersey-boxer-shorts', '3-PACK JERSEY BOXER SHORTS', 'boxers', 'men', 'Boxer shorts', 1599, 3, A, ['grey', 'navy'], {}],
  ['5-pack-mid-rise-briefs', '5-PACK MID-RISE BRIEFS', 'briefs', 'men', 'Briefs', 1399, 5, A, ['black', 'white', 'grey'], {}],

  // ---- women
  ['3-pack-cotton-hipster-briefs', '3-PACK COTTON HIPSTER BRIEFS', 'briefs', 'women', 'Briefs', 1299, 3, A, ['black', 'blush', 'white'], { rating: [4.6, 190] }],
  ['5-pack-cotton-briefs-women', '5-PACK COTTON BRIEFS', 'briefs', 'women', 'Briefs', 1499, 5, A, ['white', 'black', 'sage'], { label: 'New Arrival' }],
  ['3-pack-seamless-thongs', '3-PACK SEAMLESS THONGS', 'briefs', 'women', 'Thongs', 1199, 3, A, ['black', 'beige'], {}],
  ['2-pack-soft-bralettes', '2-PACK SOFT BRALETTES', 'bra', 'women', 'Bralettes', 1799, 2, A, ['black', 'blush'], { rating: [4.4, 61] }],
  ['non-wired-cotton-bra', 'NON-WIRED COTTON BRA', 'bra', 'women', 'Bras', 1299, 1, A, ['beige', 'black', 'white'], {}],
  ['lace-trim-bralette', 'LACE-TRIM BRALETTE', 'bra', 'women', 'Bralettes', 999, 1, A, ['black', 'blush', 'sage'], { sale: 1299, label: 'New Arrival' }],
  ['3-pack-microfibre-hipsters', '3-PACK MICROFIBRE HIPSTERS', 'briefs', 'women', 'Briefs', 1399, 3, A, ['black', 'navy'], { concept: 'PERFORMANCE' }],
  ['5-pack-cotton-thongs', '5-PACK COTTON THONGS', 'briefs', 'women', 'Thongs', 1299, 5, A, ['black', 'white', 'blush'], {}],
  ['2-pack-camisoles', '2-PACK CAMISOLES', 'vest', 'women', 'Camisoles', 1199, 2, A, ['white', 'black'], {}],
  ['ribbed-cotton-vest-top', 'RIBBED COTTON VEST TOP', 'vest', 'women', 'Camisoles', 699, 1, A, ['white', 'sage', 'black'], { sale: 899 }],
  ['3-pack-high-waist-briefs', '3-PACK HIGH-WAIST BRIEFS', 'briefs', 'women', 'Briefs', 1499, 3, A, ['black', 'beige'], { rating: [4.7, 108] }],
  ['sports-bra-medium-support', 'SPORTS BRA MEDIUM SUPPORT', 'bra', 'women', 'Sports bras', 1499, 1, A, ['black', 'olive'], { concept: 'PERFORMANCE', rating: [4.5, 77] }],
  ['2-pack-modal-bralettes', '2-PACK MODAL BRALETTES', 'bra', 'women', 'Bralettes', 1699, 2, A, ['brown', 'black'], { concept: 'PREMIUM' }],

  // ---- kids
  ['7-pack-cotton-briefs-kids', '7-PACK COTTON BRIEFS', 'briefs', 'kids', 'Briefs', 1299, 7, K, ['white', 'sky'], { rating: [4.6, 55] }],
  ['5-pack-boxer-shorts-kids', '5-PACK BOXER SHORTS', 'boxers', 'kids', 'Boxer shorts', 1199, 5, K, ['navy', 'grey'], {}],
  ['3-pack-cotton-vests-kids', '3-PACK COTTON VESTS', 'vest', 'kids', 'Vests', 799, 3, K, ['white'], {}],
  ['7-pack-socks-kids', '7-PACK SOCKS', 'socks', 'kids', 'Socks', 899, 7, S, ['white', 'navy'], { label: 'New Arrival' }],
  ['2-pack-thermal-sets-kids', '2-PACK THERMAL SETS', 'vest', 'kids', 'Thermals', 1499, 2, K, ['grey', 'blush'], {}],
  ['5-pack-printed-briefs-kids', '5-PACK PRINTED BRIEFS', 'briefs', 'kids', 'Briefs', 1099, 5, K, ['sky', 'blush'], {}],

  // ---- loungewear
  ['cotton-pyjama-set', 'COTTON PYJAMA SET', 'robe', 'loungewear', 'Pyjamas', 2499, 1, A, ['navy', 'grey'], { rating: [4.5, 34] }],
  ['ribbed-lounge-shorts', 'RIBBED LOUNGE SHORTS', 'shorts', 'loungewear', 'Shorts', 1299, 1, A, ['beige', 'black', 'sage'], { label: 'New Arrival' }],
  ['jersey-lounge-tee', 'JERSEY LOUNGE TEE', 'tee', 'loungewear', 'Tops', 999, 1, A, ['white', 'grey', 'olive'], {}],
  ['2-pack-lounge-shorts', '2-PACK LOUNGE SHORTS', 'shorts', 'loungewear', 'Shorts', 1799, 2, A, ['grey', 'navy'], {}],
  ['modal-robe', 'MODAL ROBE', 'robe', 'loungewear', 'Robes', 2999, 1, A, ['beige', 'black'], { concept: 'PREMIUM' }],
  ['waffle-lounge-set', 'WAFFLE LOUNGE SET', 'robe', 'loungewear', 'Sets', 3499, 1, A, ['sage', 'beige'], { concept: 'PREMIUM', rating: [4.8, 22] }],

  // ---- socks
  ['10-pack-cotton-socks', '10-PACK COTTON SOCKS', 'socks', 'socks', 'Socks', 1999, 10, S, ['black', 'white'], { rating: [4.6, 302] }],
  ['7-pack-sports-socks-with-drymove', '7-PACK SPORTS SOCKS WITH DRYMOVE™', 'socks', 'socks', 'Socks', 1499, 7, S, ['black', 'white', 'grey'], { concept: 'PERFORMANCE' }],
  ['3-pack-wool-blend-socks', '3-PACK WOOL-BLEND SOCKS', 'socks', 'socks', 'Socks', 1499, 3, S, ['grey', 'olive', 'burgundy'], { concept: 'PREMIUM' }],
  ['5-pack-no-show-socks', '5-PACK NO-SHOW SOCKS', 'socks', 'socks', 'Socks', 999, 5, S, ['white', 'black'], {}],
  ['2-pack-thermal-socks', '2-PACK THERMAL SOCKS', 'socks', 'socks', 'Socks', 899, 2, S, ['grey', 'navy'], { sale: 1099 }],
]

const FIT = {
  trunks: 'Regular fit', briefs: 'Regular fit', boxers: 'Relaxed fit', vest: 'Regular fit',
  bra: 'Soft fit', socks: 'Regular fit', shorts: 'Relaxed fit', tee: 'Relaxed fit', robe: 'Relaxed fit',
}
const DESC = {
  trunks: 'Trunks in soft cotton jersey with a covered elastic waistband and short legs.',
  briefs: 'Briefs in soft cotton jersey with a covered elastic waistband and high-cut legs.',
  boxers: 'Boxer shorts in woven cotton with an elasticated waistband and a concealed button fly.',
  vest: 'Vest top in soft cotton jersey with narrow shoulder straps and a straight-cut hem.',
  bra: 'Soft bra in stretch jersey with adjustable shoulder straps and no underwiring.',
  socks: 'Socks in a soft cotton blend with ribbed tops and reinforced heels and toes.',
  shorts: 'Lounge shorts in soft jersey with an elasticated drawstring waist and side pockets.',
  tee: 'Relaxed-fit top in soft jersey with dropped shoulders and a straight-cut hem.',
  robe: 'Set in soft jersey with a relaxed fit, long sleeves and an elasticated waist.',
}
const COMP = {
  trunks: 'Cotton 95%, Elastane 5%', briefs: 'Cotton 95%, Elastane 5%',
  boxers: 'Cotton 100%', vest: 'Cotton 100%', bra: 'Polyamide 82%, Elastane 18%',
  socks: 'Cotton 78%, Polyester 20%, Elastane 2%', shorts: 'Cotton 92%, Elastane 8%',
  tee: 'Cotton 100%', robe: 'Lyocell 62%, Cotton 34%, Elastane 4%',
}
const CARE = [
  'Machine wash warm 40°C',
  'Do not bleach',
  'Tumble dry low heat',
  'Iron medium heat',
  'Do not dry clean',
]
const DETAILS = {
  trunks: ['Covered elastic waistband', 'Short legs', 'Soft combed cotton'],
  briefs: ['Covered elastic waistband', 'High-cut legs', 'Soft combed cotton'],
  boxers: ['Elasticated waistband', 'Concealed button fly', 'Woven cotton poplin'],
  vest: ['Narrow shoulder straps', 'Straight-cut hem', 'Ribbed jersey'],
  bra: ['Adjustable shoulder straps', 'No underwiring', 'Removable padding'],
  socks: ['Ribbed tops', 'Reinforced heel and toe', 'Flat toe seam'],
  shorts: ['Drawstring waist', 'Side pockets', 'Soft brushed jersey'],
  tee: ['Dropped shoulders', 'Straight-cut hem', 'Soft jersey'],
  robe: ['Elasticated waist', 'Long sleeves', 'Relaxed fit'],
}

/* ------------------------------------------------------------------- writing */

/**
 * Image economy. A full catalogue shoot is 7 images per colourway — 800+ for this range, which is
 * far more than a demo can review, let alone shoot. Three rules cut it to ~146 with no visible loss:
 *
 *   1. The packshot doubles as the swatch thumbnail and as the PDP's flat shot.
 *   2. Model shots exist only for the HERO_COUNT products a client will actually open, and only in
 *      the primary colour — so a wrong-coloured model shot is never displayed.
 *   3. The fabric macro is shared per colour, not per product. It is abstract texture; nobody can
 *      tell which garment it was cropped from.
 */
export const HERO_COUNT = 12

/** `--real` emits .jpg paths and skips placeholder drawing, for when real photography lands. */
const REAL = process.argv.includes('--real')
export const EXT = REAL ? 'jpg' : 'svg'

/** Every colourway shows model?/packshot/detail — 2 or 3 images, so the mosaic never looks bare. */
export function galleryFor({ slug, colourKey, hasModel }) {
  const base = `/images/products/${slug}/${colourKey}`
  const model = hasModel ? { src: `${base}/01-model.${EXT}`, span: 2 } : null
  return [
    model,
    { src: `${base}/packshot.${EXT}`, span: model ? 1 : 2 },
    { src: `/images/shared/detail-${colourKey}.${EXT}`, span: model ? 1 : 2 },
  ].filter(Boolean)
}

function build() {
  rmSync(join(IMG, 'products'), { recursive: true, force: true })
  rmSync(join(IMG, 'shared'), { recursive: true, force: true })
  mkdirSync(join(IMG, 'home'), { recursive: true })
  mkdirSync(join(IMG, 'shared'), { recursive: true })
  if (!REAL) writeHomeImages()

  const products = []
  let imageCount = REAL ? 0 : 7
  const sharedColours = new Set()

  CATALOG.forEach((row, index) => {
    const [slug, name, type, category, subCategory, price, packSize, sizes, colourKeys, extra] = row
    const isHero = index < HERO_COUNT

    const colors = colourKeys.map((key, colourIndex) => {
      const main = C[key]
      const hasModel = isHero && colourIndex === 0
      const dir = join(IMG, 'products', slug, key)

      if (!REAL) {
        mkdirSync(dir, { recursive: true })
        writeFileSync(join(dir, 'packshot.svg'), packshot(type, main))
        imageCount += 1
        if (hasModel) {
          writeFileSync(join(dir, '01-model.svg'), modelShot(type, main, { w: 1600, h: 2100 }))
          imageCount += 1
        }
        if (!sharedColours.has(key)) {
          writeFileSync(
            join(IMG, 'shared', `detail-${key}.svg`),
            detailShot(main, { w: 1600, h: 2100 }),
          )
          imageCount += 1
        }
      }
      sharedColours.add(key)

      const base = `/images/products/${slug}/${key}`
      return {
        key,
        name: NAMES[key],
        hex: main,
        packshot: `${base}/packshot.${EXT}`,
        // The packshot is already a clean flat-lay on the band colour — a separate swatch
        // crop would be the same photograph at a smaller size.
        swatchImage: `${base}/packshot.${EXT}`,
        gallery: galleryFor({ slug, colourKey: key, hasModel }),
      }
    })

    // A couple of sizes short in the middle of the run, like the reference.
    const lowIndex = index % 3 === 0 ? 2 : -1
    const outIndex = index % 5 === 0 ? sizes.length - 1 : -1

    products.push({
      id: `p${String(index + 1).padStart(3, '0')}`,
      slug,
      name,
      concept: extra.concept,
      category,
      subCategory,
      price,
      originalPrice: extra.sale,
      packSize,
      marketingLabel: extra.label,
      colors,
      sizes: sizes.map((label, i) => ({
        label,
        inStock: i !== outIndex,
        lowStock: i === lowIndex,
      })),
      rating: extra.rating ? { average: extra.rating[0], count: extra.rating[1] } : undefined,
      description: DESC[type],
      fit: FIT[type],
      details: DETAILS[type],
      composition: COMP[type],
      careInstructions: CARE,
      articleNumber: `1${String(72556 + index * 137).padStart(6, '0')}00${(index % 9) + 1}`,
    })
  })

  // similar = same subCategory · styleWith = things the same shopper would wear with it
  // (own category or the unisex lounge/sock lines, never a different gender's underwear).
  const withRelations = products.map((p, i) => {
    const similar = products.filter((o) => o.subCategory === p.subCategory && o.slug !== p.slug)
    const other = products.filter(
      (o) =>
        o.slug !== p.slug &&
        o.subCategory !== p.subCategory &&
        (o.category === p.category || o.category === 'loungewear' || o.category === 'socks'),
    )
    // Rotate by seed and walk with stride 1, so a short pool can never yield the same id twice.
    const pick = (list, n, seed) => {
      const out = []
      for (let k = 0; k < list.length && out.length < n; k++) {
        const id = list[(seed + k) % list.length].id
        if (!out.includes(id)) out.push(id)
      }
      return out
    }
    return {
      ...p,
      relatedIds: pick(similar.length >= 4 ? similar : products.filter((o) => o.slug !== p.slug), 8, i),
      styleWithIds: pick(other, 6, i * 2),
      alsoBoughtIds: pick(
        products.filter((o) => o.slug !== p.slug),
        6,
        i * 5 + 7,
      ),
    }
  })

  const ts = `// AUTO-GENERATED by scripts/generate-assets.mjs — do not edit by hand.
// Edit the CATALOG array in that script and re-run \`npm run assets\`.
import type { Product } from './types'

export const products: Product[] = ${JSON.stringify(withRelations, null, 2)
    .replace(/"([a-zA-Z_][a-zA-Z0-9_]*)":/g, '$1:')
    .replace(/"/g, "'")}

export const bySlug = (slug: string) => products.find((p) => p.slug === slug)
export const byId = (id: string) => products.find((p) => p.id === id)
export const byIds = (ids: string[]) =>
  ids.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => Boolean(p))
`

  mkdirSync(join(ROOT, 'src', 'data'), { recursive: true })
  writeFileSync(join(ROOT, 'src', 'data', 'products.ts'), ts)

  console.log(`✓ ${withRelations.length} products`)
  console.log(
    REAL
      ? '✓ paths switched to .jpg — placeholders left untouched'
      : `✓ ${imageCount} placeholder images`,
  )
  console.log('✓ src/data/products.ts')
}

// Only build when run directly, so image-manifest.mjs can import CATALOG without side effects.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) build()
