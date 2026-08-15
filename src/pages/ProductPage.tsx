import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { bySlug, byIds } from '../data/products'
import type { Product } from '../data/types'
import { ProductGallery, ProductInfo } from '../components/pdp/Pdp'
import { ProductRail } from '../components/product/ProductRail'

function ProductDetail({ product }: { product: Product }) {
  const [colourIndex, setColourIndex] = useState(0)

  return (
    <>
      {/* No breadcrumb — the gallery starts straight under the header. */}
      <div className="pdp">
        <ProductGallery colour={product.colors[colourIndex]} name={product.name} />
        <ProductInfo product={product} colourIndex={colourIndex} onColour={setColourIndex} />
      </div>

      <ProductRail label="Style with" products={byIds(product.styleWithIds)} />
      <ProductRail label="Similar items" products={byIds(product.relatedIds)} />
      <ProductRail label="Others also bought" products={byIds(product.alsoBoughtIds)} />
    </>
  )
}

export function ProductPage() {
  const { slug = '' } = useParams()
  const product = bySlug(slug)

  if (!product) {
    return (
      <div className="empty">
        <p>That product doesn&rsquo;t exist.</p>
        <Link to="/shop" className="link-underline caps">
          Back to shop
        </Link>
      </div>
    )
  }

  // Keyed by slug so colour/size selection resets on navigation without an effect.
  return <ProductDetail key={slug} product={product} />
}
