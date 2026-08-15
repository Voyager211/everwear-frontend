/**
 * Dev-only: downloads several candidates per query and lays them out as an HTML contact sheet,
 * so a human (or a screenshot) can pick rather than trusting the first search hit.
 *
 *   node scripts/contact-sheet.mjs "cotton underwear" "folded t shirts" --orientation portrait
 */

import { writeFile, mkdir } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

const run = promisify(execFile)
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

const args = process.argv.slice(2)
const oIndex = args.indexOf('--orientation')
const orientation = oIndex > -1 ? args[oIndex + 1] : 'landscape'
const queries = args.filter((a, i) => !a.startsWith('--') && i !== oIndex + 1)

const OUT = join(tmpdir(), 'contact-sheet')
await mkdir(OUT, { recursive: true })

const sections = []
for (const q of queries) {
  const url = `https://www.pexels.com/search/${encodeURIComponent(q)}/?orientation=${orientation}`
  const { stdout } = await run('curl', ['-sL', '-m', '30', '-A', UA, url], {
    maxBuffer: 32 * 1024 * 1024,
  })
  const seen = new Set()
  const hits = [...stdout.matchAll(/https:\/\/images\.pexels\.com\/photos\/(\d+)\/[A-Za-z0-9._-]+\.jpe?g/g)]
    .filter((m) => !seen.has(m[1]) && seen.add(m[1]))
    .slice(0, 6)

  sections.push(`
    <h2>${q} <small>(${orientation})</small></h2>
    <div class="row">
      ${hits
        .map(
          (m, i) =>
            `<figure><img src="${m[0]}?auto=compress&cs=tinysrgb&w=420"><figcaption>pick ${i + 1} · id ${m[1]}</figcaption></figure>`,
        )
        .join('')}
    </div>`)
  console.log(`${q}: ${hits.length} candidates`)
}

const html = `<!doctype html><meta charset="utf-8">
<style>
  body{font:13px system-ui;margin:24px;background:#fff}
  h2{font-size:15px;margin:28px 0 10px;text-transform:uppercase;letter-spacing:.04em}
  small{color:#888;text-transform:none;letter-spacing:0}
  .row{display:flex;gap:12px;flex-wrap:wrap}
  figure{margin:0;width:300px}
  img{width:100%;height:380px;object-fit:cover;background:#f5f5f5}
  figcaption{padding-top:6px;color:#666}
</style>
${sections.join('')}`

const file = join(OUT, 'sheet.html')
await writeFile(file, html, 'utf8')
console.log(`\n→ ${file}`)
