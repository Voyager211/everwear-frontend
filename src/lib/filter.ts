import type { Product, ProductCategory } from '../data/types'

export type SortKey = 'recommended' | 'newest' | 'price-asc' | 'price-desc'

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'recommended', label: 'Recommended' },
  { key: 'newest', label: 'Newest' },
  { key: 'price-asc', label: 'Lowest price' },
  { key: 'price-desc', label: 'Highest price' },
]

export type FilterState = {
  q: string
  scope: string
  category: ProductCategory | null
  sizes: string[]
  colours: string[]
  packSizes: number[]
  types: string[]
  sort: SortKey
}

export const emptyFilters: FilterState = {
  q: '',
  scope: 'all',
  category: null,
  sizes: [],
  colours: [],
  packSizes: [],
  types: [],
  sort: 'recommended',
}

export const activeCount = (f: FilterState) =>
  f.sizes.length + f.colours.length + f.packSizes.length + f.types.length

/**
 * Shoppers search for the category word ("underwear", "innerwear", "lingerie"), which never
 * appears in a product name. Without this, a search for "underwear men" returns nothing.
 */
const SYNONYMS: Record<string, string> = {
  Trunks: 'underwear innerwear boxer brief',
  Briefs: 'underwear innerwear',
  'Boxer shorts': 'underwear innerwear boxers',
  Thongs: 'underwear innerwear lingerie',
  Vests: 'innerwear undershirt vest',
  Camisoles: 'innerwear lingerie cami',
  Bras: 'underwear innerwear lingerie',
  Bralettes: 'underwear innerwear lingerie',
  'Sports bras': 'underwear lingerie activewear',
  Socks: 'hosiery',
  Thermals: 'innerwear thermal winter',
  Pyjamas: 'loungewear nightwear sleepwear',
  Shorts: 'loungewear',
  Tops: 'loungewear',
  Robes: 'loungewear nightwear',
  Sets: 'loungewear nightwear',
}

const matchesQuery = (p: Product, q: string) => {
  if (!q) return true
  const haystack =
    `${p.name} ${p.subCategory} ${p.category} ${p.concept ?? ''} ${SYNONYMS[p.subCategory] ?? ''}`.toLowerCase()
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term))
}

const matchesScope = (p: Product, scope: string) => {
  if (scope === 'all') return true
  if (scope === 'sale') return Boolean(p.originalPrice)
  return p.category === scope
}

/** Everything except one facet — so that facet's counts reflect the other selections. */
function matchesExcept(p: Product, f: FilterState, skip: keyof FilterState | null) {
  if (!matchesQuery(p, f.q)) return false
  if (!matchesScope(p, f.scope)) return false
  if (f.category && p.category !== f.category) return false
  if (skip !== 'sizes' && f.sizes.length && !p.sizes.some((s) => f.sizes.includes(s.label) && s.inStock))
    return false
  if (skip !== 'colours' && f.colours.length && !p.colors.some((c) => f.colours.includes(c.key)))
    return false
  if (skip !== 'packSizes' && f.packSizes.length && !f.packSizes.includes(p.packSize)) return false
  if (skip !== 'types' && f.types.length && !f.types.includes(p.subCategory)) return false
  return true
}

export function applyFilters(products: Product[], f: FilterState) {
  return products.filter((p) => matchesExcept(p, f, null))
}

export function sortProducts(list: Product[], sort: SortKey) {
  const out = [...list]
  switch (sort) {
    case 'price-asc':
      return out.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return out.sort((a, b) => b.price - a.price)
    case 'newest':
      return out.sort(
        (a, b) => Number(Boolean(b.marketingLabel)) - Number(Boolean(a.marketingLabel)),
      )
    default:
      return out
  }
}

/** Real counts, computed against the other active facets — never a fake number. */
export function facetCounts(products: Product[], f: FilterState) {
  const pool = (skip: keyof FilterState) => products.filter((p) => matchesExcept(p, f, skip))

  const tally = <T extends string | number>(list: Product[], pick: (p: Product) => T[]) => {
    const map = new Map<T, number>()
    for (const p of list) for (const key of new Set(pick(p))) map.set(key, (map.get(key) ?? 0) + 1)
    return map
  }

  return {
    sizes: tally(pool('sizes'), (p) => p.sizes.filter((s) => s.inStock).map((s) => s.label)),
    colours: tally(pool('colours'), (p) => p.colors.map((c) => c.key)),
    packSizes: tally(pool('packSizes'), (p) => [p.packSize]),
    types: tally(pool('types'), (p) => [p.subCategory]),
  }
}

export const toggle = <T,>(list: T[], value: T) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
