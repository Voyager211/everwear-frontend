/**
 * Imports real product photography supplied as one file per product, named after the product.
 *
 *   node scripts/import-photos.mjs "C:/Users/admin/Downloads/Men" --category men
 *   node scripts/import-photos.mjs ./incoming --category women --dry-run
 *
 * Matching ignores case, punctuation and trademark symbols, so "3-PACK BOXER BRIEFS WITH
 * DRYMOVE.jpg" still matches "3-PACK BOXER BRIEFS WITH DRYMOVE™".
 *
 * One supplied file covers every colourway of that product: the photographs are multipack shots
 * that already show several colours, and mixing a real photo with generated placeholders inside a
 * single product looks far worse than repeating the real one.
 *
 * Afterwards run `npm run assets` — it detects the .jpg files and rewrites the catalogue paths.
 */

import { readdirSync, copyFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CATALOG } from './generate-assets.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const IMG = join(ROOT, 'public', 'images', 'products')

const args = process.argv.slice(2)
const source = args.find((a) => !a.startsWith('--'))
const catIndex = args.indexOf('--category')
const category = catIndex > -1 ? args[catIndex + 1] : null
const DRY = args.includes('--dry-run')

if (!source) {
  console.error('usage: node scripts/import-photos.mjs <source-dir> [--category men] [--dry-run]')
  process.exit(1)
}

/** Strip everything that varies between a filename and a product name. */
const norm = (s) =>
  s
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9]/gi, '')
    .toUpperCase()

const files = readdirSync(source).filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
const byName = new Map(files.map((f) => [norm(f), f]))

const targets = CATALOG.filter((r) => !category || r[3] === category)
let copied = 0
const missing = []
const unused = new Set(byName.keys())

for (const row of targets) {
  const [slug, name, , , , , , , colourKeys] = row
  const file = byName.get(norm(name))
  if (!file) {
    missing.push(name)
    continue
  }
  unused.delete(norm(name))

  const ext = extname(file).toLowerCase() === '.png' ? '.png' : '.jpg'
  for (const key of colourKeys) {
    const dir = join(IMG, slug, key)
    const dest = join(dir, `packshot${ext}`)
    if (DRY) {
      console.log(`  would copy ${file} -> ${slug}/${key}/packshot${ext}`)
      continue
    }
    mkdirSync(dir, { recursive: true })
    copyFileSync(join(source, file), dest)
    copied++
  }
  if (!DRY) console.log(`  ✓ ${name.padEnd(38)} -> ${colourKeys.length} colourway(s)`)
}

console.log(`\n${copied} files written for ${targets.length - missing.length}/${targets.length} products`)
if (missing.length) console.log('no photo supplied for:\n  ' + missing.join('\n  '))
if (unused.size) console.log('files that matched no product:\n  ' + [...unused].join('\n  '))
if (!DRY && copied) console.log('\nNext: npm run assets   (repoints the catalogue at the real files)')

// Guard against a silent mismatch — if nothing matched, the naming convention is probably off.
if (!copied && !DRY) {
  console.error('\nNothing matched. Check that filenames equal the product names.')
  if (!existsSync(source)) console.error(`Source directory does not exist: ${source}`)
  process.exit(1)
}
