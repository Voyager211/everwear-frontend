import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../../data/types'
import { formatPieces, formatPrice, formatUnitPrice } from '../../lib/format'
import { useStore } from '../../context/useStore'
import { ChevronLeft, ChevronRight, HeartIcon } from '../ui/icons'
import './ProductCard.css'

/** Price + optional struck-through original. Shared with the PDP. */
export function PriceBlock({ product, spaced = false }: { product: Product; spaced?: boolean }) {
  return (
    <p className={`price${product.originalPrice ? ' price--sale' : ''}`}>
      {formatPrice(product.price, { spaced })}
      {product.originalPrice && (
        <span className="price__was">{formatPrice(product.originalPrice, { spaced })}</span>
      )}
    </p>
  )
}

/** "10 pcs | Rs.299.90/pc" — the multipack signature of this category. */
export function PackLine({ product, spaced = false }: { product: Product; spaced?: boolean }) {
  if (product.packSize <= 1) return null
  return (
    <p className="packline">
      <span className="packline__count">{formatPieces(product.packSize)}</span>
      <span className="packline__unit">
        {' | '}
        {formatUnitPrice(product.price, product.packSize, { spaced })}
      </span>
    </p>
  )
}

/** Small squares, never dots, with a plain "+N" overflow count. */
export function ColorSwatches({
  product,
  activeIndex,
  onSelect,
  max = 4,
}: {
  product: Product
  activeIndex: number
  onSelect?: (index: number) => void
  max?: number
}) {
  const shown = product.colors.slice(0, max)
  const overflow = product.colors.length - shown.length
  return (
    <div className="swatches">
      {shown.map((colour, i) => (
        <button
          key={colour.key}
          type="button"
          className={`swatches__dot${i === activeIndex ? ' is-active' : ''}`}
          style={{ background: colour.hex }}
          aria-label={colour.name}
          onClick={() => onSelect?.(i)}
        />
      ))}
      {overflow > 0 && <span className="swatches__more">+{overflow}</span>}
    </div>
  )
}

export function FavouriteButton({ productId, className }: { productId: string; className?: string }) {
  const { isWished, toggleWish } = useStore()
  const wished = isWished(productId)
  return (
    <button
      type="button"
      className={className}
      aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={wished}
      onClick={() => toggleWish(productId)}
    >
      <HeartIcon filled={wished} />
    </button>
  )
}

export function ProductCard({ product }: { product: Product }) {
  const [colourIndex, setColourIndex] = useState(0)
  const [imageIndex, setImageIndex] = useState(0)

  const colour = product.colors[colourIndex]
  // Packshot first, then the colourway's gallery — so paging starts on the flat shot.
  const images = [colour.packshot, ...colour.gallery.map((g) => g.src)]
  const src = images[imageIndex % images.length]

  const page = (delta: number) =>
    setImageIndex((i) => (i + delta + images.length) % images.length)

  return (
    <article className="card">
      <div className="card__media band">
        <Link to={`/product/${product.slug}`} className="card__imglink">
          <img src={src} alt={product.name} loading="lazy" />
        </Link>

        <button type="button" className="card__arrow card__arrow--prev" aria-label="Previous image" onClick={() => page(-1)}>
          <ChevronLeft />
        </button>
        <button type="button" className="card__arrow card__arrow--next" aria-label="Next image" onClick={() => page(1)}>
          <ChevronRight />
        </button>

        <FavouriteButton productId={product.id} className="card__heart" />
      </div>

      <div className="card__text">
        {product.concept && <p className="card__concept caps">{product.concept}</p>}
        <Link to={`/product/${product.slug}`} className="card__name caps">
          {product.name}
        </Link>
        <PriceBlock product={product} />
        <PackLine product={product} />
        {product.marketingLabel && <p className="card__label">{product.marketingLabel}</p>}
        <ColorSwatches
          product={product}
          activeIndex={colourIndex}
          onSelect={(i) => {
            setColourIndex(i)
            setImageIndex(0)
          }}
        />
      </div>
    </article>
  )
}
