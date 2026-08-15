import { useRef, useState } from 'react'
import type { Product } from '../../data/types'
import { ProductCard } from './ProductCard'
import { SectionHeaderRow, SquareDots } from '../ui'
import { ChevronLeft, ChevronRight } from '../ui/icons'

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

/**
 * Rail: caps label left, ‹ › flush right, 4 cards plus a peek of the 5th, square dots below.
 */
export function ProductRail({ label, products }: { label: string; products: Product[] }) {
  const track = useRef<HTMLDivElement>(null)
  const [page, setPage] = useState(0)

  if (!products.length) return null

  const pages = Math.max(1, Math.ceil(products.length / 4))

  const scrollBy = (delta: number) => {
    const el = track.current
    if (!el) return
    const next = Math.min(pages - 1, Math.max(0, page + delta))
    el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' })
    setPage(next)
  }

  const onScroll = () => {
    const el = track.current
    if (!el) return
    setPage(Math.round(el.scrollLeft / el.clientWidth))
  }

  return (
    <section className="rail">
      <SectionHeaderRow
        label={label}
        controls={
          <div className="rail-controls">
            <button type="button" onClick={() => scrollBy(-1)} disabled={page === 0} aria-label="Previous">
              <ChevronLeft />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              disabled={page >= pages - 1}
              aria-label="Next"
            >
              <ChevronRight />
            </button>
          </div>
        }
      />
      <div className="rail__track band" ref={track} onScroll={onScroll}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <SquareDots count={pages} active={page} />
    </section>
  )
}
