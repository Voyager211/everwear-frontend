/**
 * Emits the image shopping list for replacing placeholders with real photography.
 *
 *   npm run manifest
 *
 * Writes image-manifest.csv — one row per image that must exist, with its target path,
 * dimensions, background colour and a ready-to-use generation prompt.
 *
 * The list is deliberately small (~146, not 800+). See the image-economy note in
 * generate-assets.mjs for the three rules that make that possible.
 */

import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CATALOG, NAMES, C, HERO_COUNT } from './generate-assets.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const BAND = '#F5F5F5'

const NOUN = {
  trunks: 'mens boxer trunks, short-leg fitted underwear with a covered elastic waistband',
  briefs: 'mens cotton briefs with a covered elastic waistband',
  boxers: 'loose woven cotton boxer shorts with an elasticated waistband',
  vest: 'ribbed cotton vest tank top with narrow shoulder straps',
  tee: 'relaxed-fit cotton jersey t-shirt',
  bra: 'soft non-wired jersey bralette with adjustable straps',
  socks: 'ribbed cotton crew socks',
  shorts: 'jersey lounge shorts with a drawstring waist',
  robe: 'soft jersey loungewear set with long sleeves and a relaxed fit',
}

const rows = []
const add = (r) => rows.push(r)

/* ------------------------------------------------------------------- home (7) */

add({
  path: `/images/home/hero.jpg`,
  kind: 'home',
  product: '',
  colour: '',
  width: 2560,
  height: 1440,
  ratio: '16:9',
  background: 'scene',
  reference: '',
  prompt:
    'Wide editorial campaign photograph for a premium innerwear brand. Calm, light, airy scene in warm off-white and stone tones. CRITICAL: the entire left third of the frame must stay clean, light and empty — large red headline type is overlaid there. Place the subject and all visual interest on the right side. Soft natural daylight. No text, no logos.',
})

for (const [n, desc] of [
  [1, 'Soft cotton innerwear campaign. Model in neutral cream and stone tones against a warm grey backdrop.'],
  [2, 'Performance innerwear campaign. Cooler palette of sage and teal against pale grey-green.'],
]) {
  add({
    path: `/images/home/campaign-${n}.jpg`,
    kind: 'home',
    product: '',
    colour: '',
    width: 1152,
    height: 2048,
    ratio: '9:16 (tallest available)',
    background: 'scene',
    reference: '',
    prompt: `Tall vertical editorial photograph. ${desc} Full-length centred subject with generous headroom and footroom — the image is cropped hard at the left and right edges, so keep everything important centred. Soft daylight, premium, calm. No text.`,
  })
}

for (const [name, subject] of [
  ['briefs', 'neatly folded briefs and underwear in neutral tones'],
  ['vests', 'folded ribbed cotton vests in white and black'],
  ['lounge', 'a relaxed loungewear set in warm beige'],
  ['socks', 'rolled and folded cotton socks in navy and white'],
]) {
  add({
    path: `/images/home/category-${name}.jpg`,
    kind: 'home',
    product: '',
    colour: '',
    width: 1200,
    height: 1500,
    ratio: '4:5',
    background: 'scene',
    reference: '',
    prompt: `Category tile photograph: ${subject}, styled as a still life on a soft warm grey surface, gentle overhead angle, soft daylight, generous negative space, premium catalogue feel. No text.`,
  })
}

/* --------------------------------------------------- packshots + hero models */

const sharedColours = new Set()

CATALOG.forEach((row, index) => {
  const [slug, name, type, , , , , , colourKeys] = row
  const isHero = index < HERO_COUNT
  const noun = NOUN[type] ?? 'garment'

  colourKeys.forEach((key, colourIndex) => {
    const colour = NAMES[key].toLowerCase()
    const base = `/images/products/${slug}/${key}`

    add({
      path: `${base}/packshot.jpg`,
      kind: 'packshot',
      product: name,
      colour: NAMES[key],
      width: 1000,
      height: 1400,
      ratio: '5:7',
      background: BAND,
      reference: '',
      prompt: `Flat-lay e-commerce product photograph of a single ${colour} ${noun}. Centred and filling the frame, on a seamless flat ${BAND} light-grey background, soft even lighting, no shadows, no model, no props, no text. Clean catalogue style.`,
    })

    // Model shots only for hero products, and only in the primary colour — so the gallery can
    // never show a model wearing a colour the shopper did not select.
    if (isHero && colourIndex === 0) {
      add({
        path: `${base}/01-model.jpg`,
        kind: 'model',
        product: name,
        colour: NAMES[key],
        width: 1600,
        height: 2100,
        ratio: '3:4',
        background: 'scene',
        reference: `${base}/packshot.jpg`,
        prompt: `Editorial fashion photograph of a model wearing the ${colour} ${noun} from the reference image. Framed from mid-torso, calm neutral studio backdrop in warm light grey, soft daylight, natural relaxed pose, minimal styling. Match the garment in the reference exactly. No text.`,
      })
    }

    if (!sharedColours.has(key)) {
      sharedColours.add(key)
      add({
        path: `/images/shared/detail-${key}.jpg`,
        kind: 'detail',
        product: '(shared across all products in this colour)',
        colour: NAMES[key],
        width: 1600,
        height: 2100,
        ratio: '3:4',
        background: 'macro',
        reference: '',
        prompt: `Extreme macro photograph of ${colour} cotton jersey fabric (approximately ${C[key]}), showing fine rib-knit texture and a single flatlock seam running through the frame. Shallow depth of field, soft diffused light, no text.`,
      })
    }
  })
})

/* ------------------------------------------------------------------- output */

const esc = (v) => `"${String(v).replace(/"/g, '""')}"`
const header = 'path,kind,product,colour,width,height,ratio,background,reference,prompt'
writeFileSync(
  join(ROOT, 'image-manifest.csv'),
  [header, ...rows.map((r) => Object.values(r).map(esc).join(','))].join('\n'),
  'utf8',
)

const byKind = rows.reduce((acc, r) => ((acc[r.kind] = (acc[r.kind] ?? 0) + 1), acc), {})
console.log(`${rows.length} images`)
console.table(byKind)
console.log('→ image-manifest.csv')
