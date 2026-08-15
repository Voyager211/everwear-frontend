/**
 * Batch-generates the real product photography from image-manifest.csv using the Gemini API.
 *
 *   export GEMINI_API_KEY=...          (or set it in your shell / CI)
 *   npm run manifest                   # refresh the list first
 *   node scripts/generate-images.mjs --dry-run
 *   node scripts/generate-images.mjs --only packshot --limit 5
 *   node scripts/generate-images.mjs
 *
 * Then flip the app over to the real files:
 *   npm run assets -- --real
 *
 * Already-generated files are skipped, so the run is resumable — safe to stop and restart.
 * Nothing is deleted; placeholders stay on disk until you remove them.
 */

import { readFile, writeFile, mkdir, access } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const MANIFEST = join(ROOT, 'image-manifest.csv')

const MODEL = 'gemini-2.5-flash-image'
const ENDPOINT = (model) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

const arg = (flag, fallback = null) => {
  const i = process.argv.indexOf(flag)
  return i > -1 ? (process.argv[i + 1] ?? true) : fallback
}
const has = (flag) => process.argv.includes(flag)

const DRY = has('--dry-run')
const FORCE = has('--force')
const ONLY = arg('--only')
const LIMIT = Number(arg('--limit', 0)) || 0
const CONCURRENCY = Number(arg('--concurrency', 3)) || 3

/**
 * Gemini accepts a fixed set of aspect ratios. Anything not on the list is mapped to the nearest
 * one — harmless here because packshots are rendered with `object-fit: contain` on the band
 * colour, so letterboxing is literally invisible, and everything else uses `cover`.
 */
const SUPPORTED = ['1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9']
const ratioValue = (r) => {
  const [w, h] = r.split(':').map(Number)
  return w / h
}
const nearestRatio = (wanted) => {
  const clean = String(wanted).split(' ')[0]
  if (SUPPORTED.includes(clean)) return clean
  const target = ratioValue(clean)
  return SUPPORTED.reduce((best, r) =>
    Math.abs(ratioValue(r) - target) < Math.abs(ratioValue(best) - target) ? r : best,
  )
}

/* ------------------------------------------------------------------- CSV */

function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else quoted = false
      } else field += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') {
      row.push(field)
      field = ''
    } else if (ch === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (ch !== '\r') field += ch
  }
  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }

  const [header, ...body] = rows
  return body
    .filter((r) => r.length === header.length)
    .map((r) => Object.fromEntries(header.map((h, i) => [h, r[i]])))
}

/* ------------------------------------------------------------------ API */

const exists = (p) =>
  access(p).then(
    () => true,
    () => false,
  )

async function callGemini(apiKey, { prompt, aspectRatio, referencePath }) {
  const parts = [{ text: prompt }]

  if (referencePath) {
    const abs = join(ROOT, 'public', referencePath.replace(/^\//, ''))
    if (await exists(abs)) {
      parts.unshift({
        inline_data: { mime_type: 'image/jpeg', data: (await readFile(abs)).toString('base64') },
      })
    }
  }

  const body = {
    contents: [{ parts }],
    generationConfig: {
      responseModalities: ['IMAGE'],
      imageConfig: { aspectRatio },
    },
  }

  const res = await fetch(ENDPOINT(MODEL), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const detail = await res.text()
    const err = new Error(`${res.status} ${res.statusText} — ${detail.slice(0, 400)}`)
    err.status = res.status
    throw err
  }

  const json = await res.json()
  const part = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData ?? p.inline_data)
  const inline = part?.inlineData ?? part?.inline_data
  if (!inline?.data) {
    const reason = json.candidates?.[0]?.finishReason ?? 'no image in response'
    throw new Error(`no image returned (${reason})`)
  }
  return Buffer.from(inline.data, 'base64')
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function withRetry(fn, label, attempts = 4) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn()
    } catch (err) {
      const retryable = [429, 500, 502, 503, 504].includes(err.status)
      if (!retryable || attempt === attempts) throw err
      const wait = 2000 * 2 ** (attempt - 1)
      console.warn(`  retry ${attempt}/${attempts - 1} in ${wait / 1000}s — ${label}: ${err.message.slice(0, 90)}`)
      await sleep(wait)
    }
  }
}

/* ------------------------------------------------------------------ main */

const apiKey = process.env.GEMINI_API_KEY
if (!apiKey && !DRY) {
  console.error('GEMINI_API_KEY is not set. Export it, or run with --dry-run to preview.')
  process.exit(1)
}

let rows = parseCsv(await readFile(MANIFEST, 'utf8'))
if (ONLY) rows = rows.filter((r) => r.kind === ONLY)

// Packshots first: model shots use them as a visual reference for the same garment.
rows.sort((a, b) => (a.kind === 'model' ? 1 : 0) - (b.kind === 'model' ? 1 : 0))

const queue = []
for (const row of rows) {
  const abs = join(ROOT, 'public', row.path.replace(/^\//, ''))
  if (!FORCE && (await exists(abs))) continue
  queue.push({ ...row, abs })
  if (LIMIT && queue.length >= LIMIT) break
}

console.log(`${rows.length} in manifest · ${queue.length} to generate · model ${MODEL}`)
if (DRY) {
  for (const item of queue.slice(0, 8)) {
    console.log(
      `\n${item.path}\n  ratio ${item.ratio} → ${nearestRatio(item.ratio)}${
        item.reference ? `\n  reference ${item.reference}` : ''
      }\n  ${item.prompt.slice(0, 150)}...`,
    )
  }
  console.log(`\n(dry run — nothing generated${queue.length > 8 ? `, showing 8 of ${queue.length}` : ''})`)
  process.exit(0)
}

let done = 0
let failed = 0
const started = Date.now()

async function worker() {
  for (;;) {
    const item = queue.shift()
    if (!item) return
    try {
      const bytes = await withRetry(
        () =>
          callGemini(apiKey, {
            prompt: item.prompt,
            aspectRatio: nearestRatio(item.ratio),
            referencePath: item.reference || null,
          }),
        item.path,
      )
      await mkdir(dirname(item.abs), { recursive: true })
      await writeFile(item.abs, bytes)
      done++
      console.log(`  ${String(done).padStart(3)} ✓ ${item.path} (${Math.round(bytes.length / 1024)}kb)`)
    } catch (err) {
      failed++
      console.error(`      ✗ ${item.path} — ${err.message.slice(0, 160)}`)
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker))

console.log(
  `\ndone: ${done} generated, ${failed} failed, ${Math.round((Date.now() - started) / 1000)}s`,
)
if (failed) console.log('Re-run to retry only the failures — existing files are skipped.')
if (done) console.log('Next: npm run assets -- --real   (switches the app to .jpg paths)')
