/** Dev-only visual check: full-page screenshots + a click-through of the key interactions. */
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const OUT = process.argv[2] ?? './shots'
const BASE = process.argv[3] ?? 'http://localhost:5177'
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'

mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ executablePath: CHROME })
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })

const errors = []
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
page.on('pageerror', (e) => errors.push(String(e)))

const shot = async (name, url, opts = {}) => {
  if (url) await page.goto(BASE + url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: opts.full ?? false })
  console.log('shot', name)
}

await shot('01-home', '/', { full: false })

// Scroll to the packshot grid, past the viewport-taller campaign pair.
await page.goto(BASE + '/', { waitUntil: 'networkidle' })
await page.locator('.packshots').scrollIntoViewIfNeeded()
await page.waitForTimeout(500)
await shot('02-home-newin')

await page.locator('.tilepair').first().scrollIntoViewIfNeeded()
await page.waitForTimeout(400)
await shot('03-home-tiles')

await shot('04-listing', '/shop?q=underwear%20men')

// Filter drawer
await page.locator('.resultbar__filter').click()
await page.waitForTimeout(500)
await shot('05-filters')
await page.keyboard.press('Escape')

await shot('06-pdp', '/product/10-pack-short-cotton-trunks')

// Rails below the fold
await page.locator('.rail').first().scrollIntoViewIfNeeded()
await page.waitForTimeout(500)
await shot('07-pdp-rails')

// Add to bag without a size — should surface the inline error.
await page.goto(BASE + '/product/5-pack-cotton-short-trunks', { waitUntil: 'networkidle' })
await page.locator('.btn', { hasText: 'ADD TO BAG' }).first().click()
await page.waitForTimeout(400)
const errorShown = await page.locator('.pdp-info__error').isVisible()

// Now pick a size and add.
await page.locator('.sizegrid__cell', { hasText: /^M$/ }).click()
await page.locator('.btn', { hasText: 'ADD TO BAG' }).first().click()
await page.waitForTimeout(600)
await shot('08-cart')

const badge = await page.locator('.header__count').textContent().catch(() => null)

// Footer
await shot('09-footer', '/shop?scope=socks', { full: true })

console.log('\nsize-required error shown:', errorShown)
console.log('bag badge after add:', badge)
console.log('console errors:', errors.length ? errors : 'none')

await browser.close()
