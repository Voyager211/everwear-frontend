import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { StoreProvider } from './context/StoreContext'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { CartDrawer } from './components/cart/CartDrawer'
import { HomePage } from './pages/HomePage'
import { ListingPage } from './pages/ListingPage'
import { ProductPage } from './pages/ProductPage'
import { NotFoundPage, WishlistPage } from './pages/WishlistPage'

/**
 * `/shop/men` is a nicer URL to type, but filter state lives entirely in query params — keeping
 * two representations of "which category" is how they drift apart. Redirect to the canonical form.
 */
function CategoryRedirect() {
  const { category = '' } = useParams()
  return <Navigate to={`/shop?scope=${encodeURIComponent(category)}`} replace />
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <ScrollToTop />
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ListingPage />} />
            <Route path="/shop/:category" element={<CategoryRedirect />} />
            <Route path="/search" element={<ListingPage />} />
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
        <CartDrawer />
      </StoreProvider>
    </BrowserRouter>
  )
}
