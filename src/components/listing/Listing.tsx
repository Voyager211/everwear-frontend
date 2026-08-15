import type { ReactNode } from 'react'
import type { Product } from '../../data/types'
import {
  SORT_OPTIONS,
  facetCounts,
  toggle,
  type FilterState,
  type SortKey,
} from '../../lib/filter'
import { Drawer } from '../ui'
import { FilterIcon } from '../ui/icons'
import './Listing.css'

/** Eyebrow over a display-size H1. There is no breadcrumb anywhere on the site. */
export function ListingHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="listing-head">
      <p className="listing-head__eyebrow caps">{eyebrow}</p>
      <h1 className="display">{title}</h1>
    </div>
  )
}

/** A lighter scope switch than the filter drawer, sitting above the count. */
export function RefinementTabs({
  tabs,
  value,
  onChange,
}: {
  tabs: { key: string; label: string }[]
  value: string
  onChange: (key: string) => void
}) {
  return (
    <div className="tabs hairline-bottom">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={`tabs__tab caps${tab.key === value ? ' is-active' : ''}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export function ResultBar({
  count,
  activeFilters,
  onOpenFilters,
}: {
  count: number
  activeFilters: number
  onOpenFilters: () => void
}) {
  return (
    <div className="resultbar">
      <span className="resultbar__count">{count} products</span>
      <button type="button" className="resultbar__filter caps" onClick={onOpenFilters}>
        Filter{activeFilters > 0 ? ` (${activeFilters})` : ''}
        <FilterIcon />
      </button>
    </div>
  )
}

function Group({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="fgroup">
      <h3 className="fgroup__heading caps">{heading}</h3>
      {children}
    </section>
  )
}

function Option({
  label,
  count,
  checked,
  onChange,
  swatch,
}: {
  label: string
  count?: number
  checked: boolean
  onChange: () => void
  swatch?: string
}) {
  const disabled = count === 0
  return (
    <label className={`fopt${disabled ? ' is-disabled' : ''}`}>
      <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} />
      <span className="fopt__box" aria-hidden />
      {swatch && <span className="fopt__swatch" style={{ background: swatch }} aria-hidden />}
      <span className="fopt__label">{label}</span>
      {count !== undefined && <span className="fopt__count muted">({count})</span>}
    </label>
  )
}

/**
 * The reference exposes a single FILTER trigger and no visible sort control, so sort lives
 * inside the drawer alongside the facets.
 */
export function FilterDrawer({
  open,
  onClose,
  products,
  filters,
  setFilters,
  resultCount,
  colourNames,
}: {
  open: boolean
  onClose: () => void
  products: Product[]
  filters: FilterState
  setFilters: (next: FilterState) => void
  resultCount: number
  colourNames: Map<string, { name: string; hex: string }>
}) {
  const counts = facetCounts(products, filters)
  const patch = (next: Partial<FilterState>) => setFilters({ ...filters, ...next })

  // Alphabetical would give L, M, S, XL, XS, XXL — sizes need their own order.
  const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  const sizes = [...counts.sizes.keys()].sort((a, b) => {
    const ia = SIZE_ORDER.indexOf(a)
    const ib = SIZE_ORDER.indexOf(b)
    if (ia === -1 && ib === -1) return a.localeCompare(b, undefined, { numeric: true })
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })
  const colours = [...counts.colours.keys()].sort()
  const packs = [...counts.packSizes.keys()].sort((a, b) => a - b)
  const types = [...counts.types.keys()].sort()

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Filter & sort"
      footer={
        <div className="fdrawer__foot">
          <button
            type="button"
            className="link-underline caps"
            onClick={() =>
              patch({ sizes: [], colours: [], packSizes: [], types: [], sort: 'recommended' })
            }
          >
            Clear all
          </button>
          <button type="button" className="btn btn--sm" onClick={onClose}>
            Show {resultCount} products
          </button>
        </div>
      }
    >
      <div className="fdrawer">
        <Group heading="Sort by">
          {SORT_OPTIONS.map((option) => (
            <label key={option.key} className="fopt">
              <input
                type="radio"
                name="sort"
                checked={filters.sort === option.key}
                onChange={() => patch({ sort: option.key as SortKey })}
              />
              <span className="fopt__box fopt__box--radio" aria-hidden />
              <span className="fopt__label">{option.label}</span>
            </label>
          ))}
        </Group>

        <Group heading="Size">
          <div className="fgroup__wrap">
            {sizes.map((size) => (
              <Option
                key={size}
                label={size}
                count={counts.sizes.get(size) ?? 0}
                checked={filters.sizes.includes(size)}
                onChange={() => patch({ sizes: toggle(filters.sizes, size) })}
              />
            ))}
          </div>
        </Group>

        <Group heading="Colour">
          {colours.map((key) => (
            <Option
              key={key}
              label={colourNames.get(key)?.name ?? key}
              swatch={colourNames.get(key)?.hex}
              count={counts.colours.get(key) ?? 0}
              checked={filters.colours.includes(key)}
              onChange={() => patch({ colours: toggle(filters.colours, key) })}
            />
          ))}
        </Group>

        <Group heading="Pack size">
          {packs.map((pack) => (
            <Option
              key={pack}
              label={pack === 1 ? 'Single' : `${pack}-pack`}
              count={counts.packSizes.get(pack) ?? 0}
              checked={filters.packSizes.includes(pack)}
              onChange={() => patch({ packSizes: toggle(filters.packSizes, pack) })}
            />
          ))}
        </Group>

        <Group heading="Product type">
          {types.map((type) => (
            <Option
              key={type}
              label={type}
              count={counts.types.get(type) ?? 0}
              checked={filters.types.includes(type)}
              onChange={() => patch({ types: toggle(filters.types, type) })}
            />
          ))}
        </Group>
      </div>
    </Drawer>
  )
}
