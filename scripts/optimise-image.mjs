/**
 * Resizes and re-encodes an image to web-ready JPEG, using the Chrome that Playwright drives.
 * Avoids adding a native image dependency (sharp) for what is an occasional one-off.
 *
 *   node scripts/optimise-image.mjs <src> <dest> [--width 2560] [--quality 0.85]
 */

import { readFile, writeFile } from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import { chromium } from 'playwright-core'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const [src, dest] = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const arg = (flag, fallback) => {
  const i = process.argv.indexOf(flag)
  return i > -1 ? Number(process.argv[i + 1]) : fallback
}
const width = arg('--width', 2560)
const quality = arg('--quality', 0.85)

if (!src || !dest) {
  console.error('usage: node scripts/optimise-image.mjs <src> <dest> [--width N] [--quality 0..1]')
  process.exit(1)
}

const bytes = await readFile(resolve(src))
const mime = extname(src).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg'
const dataUrl = `data:${mime};base64,${bytes.toString('base64')}`

const browser = await chromium.launch({ executablePath: CHROME })
const page = await browser.newPage()

const out = await page.evaluate(
  async ({ dataUrl, width, quality }) => {
    const img = new Image()
    img.src = dataUrl
    await img.decode()
    const scale = Math.min(1, width / img.naturalWidth)
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.naturalWidth * scale)
    canvas.height = Math.round(img.naturalHeight * scale)
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingQuality = 'high'
    // JPEG has no alpha; flatten onto white so transparent PNGs don't come out black.
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    return {
      data: canvas.toDataURL('image/jpeg', quality).split(',')[1],
      w: canvas.width,
      h: canvas.height,
      sourceW: img.naturalWidth,
      sourceH: img.naturalHeight,
    }
  },
  { dataUrl, width, quality },
)

await browser.close()

const buffer = Buffer.from(out.data, 'base64')
await writeFile(resolve(dest), buffer)

console.log(
  `${out.sourceW}x${out.sourceH} (${Math.round(bytes.length / 1024)}kb) -> ` +
    `${out.w}x${out.h} (${Math.round(buffer.length / 1024)}kb)  ${dest}`,
)
