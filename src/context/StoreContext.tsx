import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { Product } from '../data/types'
import { StoreContext, type CartLine, type Store } from './useStore'

export function StoreProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])
  const [wishlist, setWishlist] = useState<string[]>([])
  const [cartOpen, setCartOpen] = useState(false)

  const addToCart = useCallback((product: Product, colorKey: string, size: string) => {
    const key = `${product.id}:${colorKey}:${size}`
    setLines((current) => {
      const existing = current.find((l) => l.key === key)
      if (existing) {
        return current.map((l) => (l.key === key ? { ...l, quantity: l.quantity + 1 } : l))
      }
      return [...current, { key, product, colorKey, size, quantity: 1 }]
    })
    setCartOpen(true)
  }, [])

  const setQuantity = useCallback((key: string, quantity: number) => {
    setLines((current) =>
      quantity <= 0
        ? current.filter((l) => l.key !== key)
        : current.map((l) => (l.key === key ? { ...l, quantity } : l)),
    )
  }, [])

  const removeLine = useCallback(
    (key: string) => setLines((current) => current.filter((l) => l.key !== key)),
    [],
  )

  const toggleWish = useCallback(
    (id: string) =>
      setWishlist((current) =>
        current.includes(id) ? current.filter((v) => v !== id) : [...current, id],
      ),
    [],
  )

  const value = useMemo<Store>(
    () => ({
      lines,
      count: lines.reduce((sum, l) => sum + l.quantity, 0),
      subtotal: lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0),
      cartOpen,
      addToCart,
      setQuantity,
      removeLine,
      openCart: () => setCartOpen(true),
      closeCart: () => setCartOpen(false),
      wishlist,
      wishlistCount: wishlist.length,
      isWished: (id: string) => wishlist.includes(id),
      toggleWish,
    }),
    [lines, wishlist, cartOpen, addToCart, setQuantity, removeLine, toggleWish],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
