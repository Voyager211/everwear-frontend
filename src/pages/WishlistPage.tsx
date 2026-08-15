import { Link } from 'react-router-dom'
import { byIds } from '../data/products'
import { useStore } from '../context/useStore'
import { ListingHeader } from '../components/listing/Listing'
import { ProductGrid } from '../components/product/ProductRail'

export function WishlistPage() {
  const { wishlist } = useStore()
  const products = byIds(wishlist)

  return (
    <>
      <ListingHeader eyebrow="Saved" title="Wishlist" />
      {products.length === 0 ? (
        <div className="empty">
          <p>You haven&rsquo;t saved anything yet.</p>
          <Link to="/shop" className="link-underline caps">
            Start shopping
          </Link>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </>
  )
}

export function NotFoundPage() {
  return (
    <div className="empty">
      <h1 className="display">Page not found</h1>
      <Link to="/" className="link-underline caps">
        Back to home
      </Link>
    </div>
  )
}
