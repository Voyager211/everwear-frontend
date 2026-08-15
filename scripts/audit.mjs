/** Completeness audit: routes resolve to the right content, and mobile actually renders. */
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const OUT = process.argv[2] ?? './audit'
const BASE = 'http://localhost:5177'
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ executablePath: CHROME })
const errors = []

const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
page.on('console', (m) => m.type() === 'error' && errors.push(`${page.url()} :: ${m.text()}`))
page.on('pageerror', (e) => errors.push(`${page.url()} :: ${e}`))

const routes = [
  ['/', '.hero'],
  ['/shop', '.product-grid'],
  ['/shop/men', '.product-grid'],
  ['/search?q=trunks', '.product-grid'],
  ['/product/10-pack-short-cotton-trunks', '.pdp-info'],
  ['/product/does-not-exist', '.empty'],
  ['/wishlist', '.listing-head'],
  ['/nonsense-route', '.empty'],
]

console.log('ROUTES')
for (const [route, selector] of routes) {
  await page.goto(BASE + route, { waitUntil: 'networkidle' })
  const ok = await page.locator(selector).first().isVisible({ timeout: 2000 }).catch(() => false)
  const title = (await page.locator('h1').first().textContent({ timeout: 2000 }).catch(() => '')) ?? ''
  const count = (await page.locator('.resultbar__count').textContent({ timeout: 2000 }).catch(() => null)) ?? '-'
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${route.padEnd(38)} h1="${title.trim().slice(0, 28)}" ${count}`)
}

// Does /shop/:category actually scope the results?
await page.goto(BASE + '/shop/men', { waitUntil: 'networkidle' })
const catRoute = await page.locator('.resultbar__count').textContent({ timeout: 2000 }).catch(() => 'n/a')
await page.goto(BASE + '/shop?scope=men', { waitUntil: 'networkidle' })
const catQuery = await page.locator('.resultbar__count').textContent({ timeout: 2000 }).catch(() => 'n/a')
console.log(`\n/shop/men -> ${catRoute}   |   /shop?scope=men -> ${catQuery}`)

// PDP gallery: is any zoom affordance wired?
await page.goto(BASE + '/product/10-pack-short-cotton-trunks', { waitUntil: 'networkidle' })
console.log('gallery images:', await page.locator('.gallery__img').count())

// Mobile
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true })
mobile.on('pageerror', (e) => errors.push(`mobile :: ${e}`))
for (const [name, route] of [
  ['m-home', '/'],
  ['m-listing', '/shop'],
  ['m-pdp', '/product/10-pack-short-cotton-trunks'],
]) {
  await mobile.goto(BASE + route, { waitUntil: 'networkidle' })
  await mobile.waitForTimeout(400)
  const overflow = await mobile.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  )
  await mobile.screenshot({ path: `${OUT}/${name}.png` })
  console.log(`${name}: horizontal overflow = ${overflow}`)
}

// Mobile nav drawer
await mobile.goto(BASE + '/', { waitUntil: 'networkidle' })
await mobile.locator('button[aria-label="Menu"]').click()
await mobile.waitForTimeout(400)
console.log('mobile drawer opens:', await mobile.locator('.mobilenav').isVisible())
await mobile.screenshot({ path: `${OUT}/m-nav.png` })

console.log('\nconsole errors:', errors.length ? errors : 'none')
await browser.close()
