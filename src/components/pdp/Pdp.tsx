import { useRef, useState } from 'react'
import type { ColorVariant, Product } from '../../data/types'
import { formatPrice } from '../../lib/format'
import { useStore } from '../../context/useStore'
import { Accordion, Modal, StarRating } from '../ui'
import { FavouriteButton, PackLine, PriceBlock } from '../product/ProductCard'
import './Pdp.css'

/** A 2-column mosaic where each image spans 1 or 2 columns — no thumbnail rail, no arrows. */
export function ProductGallery({ colour, name }: { colour: ColorVariant; name: string }) {
  return (
    <div className="gallery">
      {colour.gallery.map((image) => (
        <img
          key={image.src}
          src={image.src}
          alt={name}
          className={image.span === 2 ? 'gallery__img gallery__img--wide' : 'gallery__img'}
          loading="lazy"
        />
      ))}
    </div>
  )
}

/** Connected lattice of hairlines, five per row — not separate outlined pills. */
function SizeGrid({
  product,
  value,
  onChange,
}: {
  product: Product
  value: string | null
  onChange: (size: string) => void
}) {
  return (
    <div className="sizegrid">
      {product.sizes.map((size) => (
        <button
          key={size.label}
          type="button"
          disabled={!size.inStock}
          aria-pressed={value === size.label}
          className={[
            'sizegrid__cell',
            value === size.label ? 'is-selected' : '',
            size.lowStock ? 'is-low' : '',
            !size.inStock ? 'is-out' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => onChange(size.label)}
        >
          {size.label}
        </button>
      ))}
    </div>
  )
}

function SizeGuide({ open, onClose }: { open: boolean; onClose: () => void }) {
  const rows = [
    ['XS', '71–76', '61–66'],
    ['S', '76–81', '66–71'],
    ['M', '81–89', '71–79'],
    ['L', '89–97', '79–87'],
    ['XL', '97–104', '87–94'],
    ['XXL', '104–112', '94–102'],
  ]
  return (
    <Modal open={open} onClose={onClose} title="Size guide">
      <table className="sizetable">
        <thead>
          <tr>
            <th>Size</th>
            <th>Hip (cm)</th>
            <th>Waist (cm)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([size, hip, waist]) => (
            <tr key={size}>
              <td>{size}</td>
              <td>{hip}</td>
              <td>{waist}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted" style={{ marginTop: 'var(--s-4)', fontSize: 'var(--fs-label)' }}>
        Measurements are body measurements, not garment measurements.
      </p>
    </Modal>
  )
}

export function ProductInfo({
  product,
  colourIndex,
  onColour,
}: {
  product: Product
  colourIndex: number
  onColour: (index: number) => void
}) {
  const { addToCart } = useStore()
  const [size, setSize] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [reviewsOpen, setReviewsOpen] = useState(false)
  const [storeOpen, setStoreOpen] = useState(false)
  const sizeRef = useRef<HTMLDivElement>(null)

  const colour = product.colors[colourIndex]

  const submit = () => {
    if (!size) {
      setError(true)
      sizeRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      return
    }
    setError(false)
    addToCart(product, colour.key, size)
  }

  return (
    <div className="pdp-info">
      <div className="pdp-info__namerow">
        <h1 className="pdp-info__name caps">{product.name}</h1>
        <FavouriteButton productId={product.id} className="pdp-info__heart" />
      </div>

      <PriceBlock product={product} spaced />
      <p className="pdp-info__mrp">MRP inclusive of all taxes</p>
      <PackLine product={product} spaced />

      <p className="pdp-info__colour">
        COLOUR: <span className="pdp-info__colourname">{colour.name}</span>
      </p>
      <div className="colourboxes">
        {product.colors.map((option, i) => (
          <button
            key={option.key}
            type="button"
            className={`colourbox${i === colourIndex ? ' is-selected' : ''}`}
            aria-label={option.name}
            aria-pressed={i === colourIndex}
            onClick={() => onColour(i)}
          >
            <img src={option.swatchImage} alt="" />
          </button>
        ))}
      </div>

      <div ref={sizeRef} className="pdp-info__sizes">
        <SizeGrid
          product={product}
          value={size}
          onChange={(next) => {
            setSize(next)
            setError(false)
          }}
        />
        {error && <p className="pdp-info__error">Please select a size</p>}
        <button type="button" className="pdp-info__guide link-underline caps" onClick={() => setGuideOpen(true)}>
          Size guide
        </button>
      </div>

      <button type="button" className="btn" onClick={submit}>
        Add to bag
      </button>

      <div className="pdp-row">
        <span>Find in store</span>
        <button type="button" className="link-underline caps" onClick={() => setStoreOpen(true)}>
          Check availability
        </button>
      </div>

      {product.rating && (
        <div className="pdp-row">
          <button type="button" className="link-underline caps" onClick={() => setReviewsOpen(true)}>
            Reviews [{product.rating.count}]
          </button>
          <StarRating average={product.rating.average} />
        </div>
      )}

      <div className="pdp-info__accordions">
        <Accordion
          items={[
            {
              title: 'Description',
              content: (
                <>
                  <p>{product.description}</p>
                  <p style={{ marginTop: 'var(--s-3)' }}>{product.fit}</p>
                  <ul className="pdp-list">
                    {product.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                  <p className="muted" style={{ marginTop: 'var(--s-3)' }}>
                    Art. no. {product.articleNumber}
                  </p>
                </>
              ),
            },
            {
              title: 'Material & care',
              content: (
                <>
                  <p>
                    <strong>Composition:</strong> {product.composition}
                  </p>
                  <ul className="pdp-list">
                    {product.careInstructions.map((care) => (
                      <li key={care}>{care}</li>
                    ))}
                  </ul>
                </>
              ),
            },
            {
              title: 'Delivery and payment',
              content: (
                <ul className="pdp-list">
                  <li>Free standard delivery on orders over {formatPrice(1999)}</li>
                  <li>Standard delivery 3–5 working days</li>
                  <li>Free returns within 30 days</li>
                  <li>Cash on delivery available</li>
                </ul>
              ),
            },
          ]}
        />
      </div>

      <SizeGuide open={guideOpen} onClose={() => setGuideOpen(false)} />

      <Modal open={reviewsOpen} onClose={() => setReviewsOpen(false)} title="Reviews">
        {product.rating && (
          <>
            <div className="reviews__summary">
              <StarRating average={product.rating.average} size={20} />
              <span className="muted">{product.rating.count} reviews</span>
            </div>
            <p className="muted" style={{ fontSize: 'var(--fs-label)' }}>
              Individual reviews are not part of this demo.
            </p>
          </>
        )}
      </Modal>

      <Modal open={storeOpen} onClose={() => setStoreOpen(false)} title="Find in store">
        <p>Store availability is not connected in this demo.</p>
      </Modal>
    </div>
  )
}
