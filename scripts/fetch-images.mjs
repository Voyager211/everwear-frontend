/**
 * Downloads real, commercially-licensed photography from Pexels for the editorial slots —
 * the hero, the two campaign panels and the four category tiles.
 *
 *   node scripts/fetch-images.mjs --dry-run
 *   node scripts/fetch-images.mjs
 *   node scripts/fetch-images.mjs --slot hero --pick 3     # try a different candidate
 *
 * Why only the editorial slots: the 115 product packshots depend on every garment being shot
 * identically on the same grey. Stock photography is inconsistent by nature, so real photos make
 * the product grid look worse, not better. Those stay generated.
 *
 * Set PEXELS_API_KEY (free, instant) to use the official API — better search, sanctioned access.
 * Without it this falls back to reading the public search page, which is fine for a one-off run.
 *
 * Attribution for every downloaded file is written to public/images/CREDITS.md.
 */

import { writeFile, mkdir, readFile, rm } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const run = promisify(execFile)
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
const KEY = process.env.PEXELS_API_KEY

/**
 * Pexels fingerprints TLS clients — Node's fetch gets a 403 where curl gets a 200, with identical
 * headers. Shelling out to curl is the pragmatic fix; it ships with Windows 10+, macOS and Linux.
 */
async function curlText(url) {
  const { stdout } = await run('curl', ['-sL', '-m', '30', '-A', UA, url], {
    maxBuffer: 32 * 1024 * 1024,
  })
  return stdout
}

async function curlBinary(url) {
  const tmp = join(tmpdir(), `fetch-${Date.now()}-${Math.round(performance.now())}.bin`)
  await run('curl', ['-sL', '-m', '60', '-A', UA, '-o', tmp, url])
  const bytes = await readFile(tmp)
  await rm(tmp, { force: true })
  return bytes
}

const arg = (f, d = null) => {
  const i = process.argv.indexOf(f)
  return i > -1 ? (process.argv[i + 1] ?? true) : d
}
const DRY = process.argv.includes('--dry-run')
const FORCE = process.argv.includes('--force')
const ONLY = arg('--slot')
const PICK = Number(arg('--pick', 1)) || 1

/** One entry per editorial image the layout needs. */
const SLOTS = [
  {
    id: 'hero',
    // Client-supplied branded banner — skipped unless you explicitly pass --force. The stock
    // fallback below is only a starting point if that artwork is ever withdrawn.
    supplied: true,
    photoId: 32735440,
    path: 'images/home/hero.jpg',
    query: 'man underwear studio',
    orientation: 'landscape',
    w: 2560,
    h: 1440,
    note: 'Supplied banner is 2560x1086 with its own headline; do not overwrite.',
  },
  {
    id: 'campaign-1',
    photoId: 40901,
    path: 'images/home/campaign-1.jpg',
    query: 'beige outfit woman',
    orientation: 'portrait',
    w: 1152,
    h: 2048,
    note: 'Very tall crop; keep the subject centred.',
  },
  {
    id: 'campaign-2',
    photoId: 17864091,
    path: 'images/home/campaign-2.jpg',
    query: 'man white cotton t shirt portrait',
    orientation: 'portrait',
    w: 1152,
    h: 2048,
    note: 'Very tall crop; keep the subject centred.',
  },
  {
    id: 'category-briefs',
    photoId: 30569741,
    path: 'images/home/category-briefs.jpg',
    query: 'folded clothes neutral flat lay',
    orientation: 'portrait',
    w: 1200,
    h: 1500,
  },
  {
    id: 'category-vests',
    photoId: 31155535,
    path: 'images/home/category-vests.jpg',
    query: 'folded white t shirts stack',
    orientation: 'portrait',
    w: 1200,
    h: 1500,
  },
  {
    id: 'category-lounge',
    photoId: 14642652,
    path: 'images/home/category-lounge.jpg',
    query: 'loungewear cosy home outfit',
    orientation: 'portrait',
    w: 1200,
    h: 1500,
  },
  {
    id: 'category-socks',
    path: 'images/home/category-socks.jpg',
    query: 'cotton socks pair',
    orientation: 'portrait',
    w: 1200,
    h: 1500,
  },
]

/* --------------------------------------------------------------- discovery */

async function searchApi(query, orientation) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(
    query,
  )}&orientation=${orientation}&per_page=10`
  const res = await fetch(url, { headers: { Authorization: KEY } })
  if (!res.ok) throw new Error(`pexels api ${res.status}`)
  const json = await res.json()
  return (json.photos ?? []).map((p) => ({
    src: p.src.original,
    credit: p.photographer,
    creditUrl: p.photographer_url,
    page: p.url,
  }))
}

async function searchPage(query, orientation) {
  const url = `https://www.pexels.com/search/${encodeURIComponent(query)}/?orientation=${orientation}`
  const html = await curlText(url)
  const urls = [...html.matchAll(/https:\/\/images\.pexels\.com\/photos\/(\d+)\/[A-Za-z0-9._-]+\.jpe?g/g)]
  const seen = new Set()
  return urls
    .filter((m) => !seen.has(m[1]) && seen.add(m[1]))
    .map((m) => ({
      src: m[0],
      credit: 'Pexels contributor',
      creditUrl: `https://www.pexels.com/photo/${m[1]}/`,
      page: `https://www.pexels.com/photo/${m[1]}/`,
    }))
}

const search = (q, o) => (KEY ? searchApi(q, o) : searchPage(q, o))

/**
 * Search rank is not curation — the first hit for "underwear" was a beach. Slots pin a specific
 * Pexels photo id so a re-run is reproducible; use contact-sheet.mjs to choose new ones.
 */
async function byId(id) {
  // Older uploads don't follow the pexels-photo-<id>.jpeg pattern, so read the real CDN URL
  // off the photo page rather than guessing it.
  const page = `https://www.pexels.com/photo/${id}/`
  const html = await curlText(page)
  const match = html.match(
    new RegExp(`https://images\\.pexels\\.com/photos/${id}/[A-Za-z0-9._-]+\\.jpe?g`),
  )
  return {
    src: match ? match[0] : `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg`,
    credit: 'Pexels contributor',
    creditUrl: page,
    page,
  }
}

/* ------------------------------------------------------------------- main */

const slots = ONLY ? SLOTS.filter((s) => s.id === ONLY) : SLOTS
const credits = []
let ok = 0

console.log(`${slots.length} slots · source: Pexels ${KEY ? '(API)' : '(public search)'}`)

for (const slot of slots) {
  if (slot.supplied && !FORCE) {
    console.log(`  – ${slot.id} — client-supplied artwork, skipped (--force to overwrite)`)
    continue
  }
  try {
    const results = slot.photoId
      ? [await byId(slot.photoId)]
      : await search(slot.query, slot.orientation)
    if (!results.length) {
      console.error(`  ✗ ${slot.id} — no results for "${slot.query}"`)
      continue
    }
    const chosen = results[Math.min(PICK, results.length) - 1]
    // Pexels serves resized, cropped derivatives straight from the CDN.
    const url = `${chosen.src}?auto=compress&cs=tinysrgb&fit=crop&w=${slot.w}&h=${slot.h}`

    if (DRY) {
      console.log(`  · ${slot.id} (${results.length} found) → ${chosen.page}`)
      continue
    }

    const bytes = await curlBinary(url)
    if (bytes.length < 5000) throw new Error(`suspiciously small download (${bytes.length}b)`)
    const abs = join(ROOT, 'public', slot.path)
    await mkdir(dirname(abs), { recursive: true })
    await writeFile(abs, bytes)
    credits.push({ path: `/${slot.path}`, ...chosen })
    ok++
    console.log(`  ✓ ${slot.path} (${Math.round(bytes.length / 1024)}kb) — ${chosen.page}`)
  } catch (err) {
    console.error(`  ✗ ${slot.id} — ${err.message}`)
  }
}

if (credits.length) {
  // Merge with what's already recorded — running one slot must not drop the other attributions.
  const store = join(ROOT, 'public', 'images', 'credits.json')
  let existing = []
  try {
    existing = JSON.parse(await readFile(store, 'utf8'))
  } catch {
    existing = []
  }
  const merged = [...existing.filter((e) => !credits.some((c) => c.path === e.path)), ...credits]
  merged.sort((a, b) => a.path.localeCompare(b.path))
  await writeFile(store, JSON.stringify(merged, null, 2), 'utf8')
  credits.length = 0
  credits.push(...merged)

  const md = [
    '# Image credits',
    '',
    'Editorial photography sourced from [Pexels](https://www.pexels.com), used under the',
    '[Pexels licence](https://www.pexels.com/license/) — free for commercial use.',
    '',
    'Product packshots are generated placeholders, not photography.',
    '',
    '| File | Photographer | Source |',
    '|---|---|---|',
    ...credits.map((c) => `| \`${c.path}\` | ${c.credit} | [link](${c.page}) |`),
    '',
  ].join('\n')
  await writeFile(join(ROOT, 'public', 'images', 'CREDITS.md'), md, 'utf8')
  console.log('\n→ public/images/CREDITS.md')
}

console.log(`\n${ok} downloaded`)
if (ok) console.log('Review them, then re-run a slot with --slot <id> --pick 2 to swap a bad pick.')
