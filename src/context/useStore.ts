import { createContext, useContext } from 'react'
import type { Product } from '../data/types'

export type CartLine = {
  key: string
  product: Product
  colorKey: string
  size: string
  quantity: number
}

export type Store = {
  lines: CartLine[]
  count: number
  subtotal: number
  cartOpen: boolean
  addToCart: (product: Product, colorKey: string, size: string) => void
  setQuantity: (key: string, quantity: number) => void
  removeLine: (key: string) => void
  openCart: () => void
  closeCart: () => void
  wishlist: string[]
  wishlistCount: number
  isWished: (id: string) => boolean
  toggleWish: (id: string) => void
}

export const StoreContext = createContext<Store | null>(null)

export function useStore() {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used inside <StoreProvider>')
  return store
}
