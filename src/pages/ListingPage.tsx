import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { products } from '../data/products'
import { applyFilters, emptyFilters, activeCount, sortProducts, type FilterState, type SortKey } from '../lib/filter'
import { FilterDrawer, ListingHeader, RefinementTabs, ResultBar } from '../components/listing/Listing'
import { ProductGrid } from '../components/product/ProductRail'

const STEP = 24

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'men', label: 'Men' },
  { key: 'women', label: 'Women' },
  { key: 'sale', label: 'Sale' },
]

const SCOPE_TITLES: Record<string, string> = {
  all: 'All products',
  men: 'Men',
  women: 'Women',
  kids: 'Kids',
  loungewear: 'Loungewear',
  socks: 'Socks',
  sale: 'Sale',
}

const list = (value: string | null) => (value ? value.split(',').filter(Boolean) : [])

export function ListingPage() {
  const [params, setParams] = useSearchParams()
  const [visible, setVisible] = useState(STEP)
  const [filterOpen, setFilterOpen] = useState(false)

  const filters: FilterState = {
    ...emptyFilters,
    q: params.get('q') ?? '',
    scope: params.get('scope') ?? 'all',
    sizes: list(params.get('sizes')),
    colours: list(params.get('colours')),
    packSizes: list(params.get('packSizes')).map(Number),
    types: list(params.get('types')),
    sort: (params.get('sort') as SortKey) ?? 'recommended',
  }

  const setFilters = (next: FilterState) => {
    const draft = new URLSearchParams()
    if (next.q) draft.set('q', next.q)
    if (next.scope !== 'all') draft.set('scope', next.scope)
    if (next.sizes.length) draft.set('sizes', next.sizes.join(','))
    if (next.colours.length) draft.set('colours', next.colours.join(','))
    if (next.packSizes.length) draft.set('packSizes', next.packSizes.join(','))
    if (next.types.length) draft.set('types', next.types.join(','))
    if (next.sort !== 'recommended') draft.set('sort', next.sort)
    setParams(draft, { replace: true })
    setVisible(STEP)
  }

  // 48 products — filtering is a few microseconds, so memoising it would only add a stale-dep risk.
  const results = sortProducts(applyFilters(products, filters), filters.sort)

  const colourNames = useMemo(() => {
    const map = new Map<string, { name: string; hex: string }>()
    for (const product of products)
      for (const colour of product.colors) map.set(colour.key, { name: colour.name, hex: colour.hex })
    return map
  }, [])

  const shown = results.slice(0, visible)
  const eyebrow = filters.q ? 'Search result' : 'Shop'
  const title = filters.q ? filters.q : (SCOPE_TITLES[filters.scope] ?? 'All products')

  return (
    <>
      <ListingHeader eyebrow={eyebrow} title={title} />

      <RefinementTabs
        tabs={TABS}
        value={filters.scope}
        onChange={(scope) => setFilters({ ...filters, scope })}
      />

      <ResultBar
        count={results.length}
        activeFilters={activeCount(filters)}
        onOpenFilters={() => setFilterOpen(true)}
      />

      {results.length === 0 ? (
        <div className="empty">
          <p>No products match those filters.</p>
          <button
            type="button"
            className="link-underline caps"
            onClick={() => setFilters({ ...emptyFilters, q: filters.q, scope: filters.scope })}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <ProductGrid products={shown} />

          <div className="loadmore">
            <p className="loadmore__text">
              You&rsquo;ve viewed {shown.length} of {results.length} products
            </p>
            <div className="loadmore__track">
              <div
                className="loadmore__fill"
                style={{ width: `${(shown.length / results.length) * 100}%` }}
              />
            </div>
            {shown.length < results.length && (
              <button
                type="button"
                className="btn btn--sm btn--ghost loadmore__btn"
                onClick={() => setVisible((v) => v + STEP)}
              >
                Load more products
              </button>
            )}
          </div>
        </>
      )}

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        products={products}
        filters={filters}
        setFilters={setFilters}
        resultCount={results.length}
        colourNames={colourNames}
      />
    </>
  )
}
