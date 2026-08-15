export type Money = number // integer INR — 2999 renders as "Rs.2,999.00"

export type GalleryImage = {
  src: string
  /** How many columns of the PDP mosaic this image spans. */
  span: 1 | 2
}

export type ColorVariant = {
  key: string
  /** Rendered sentence case after "COLOUR:" */
  name: string
  hex: string
  /** Transparent packshot — cards, home grid, rails. */
  packshot: string
  /** Small portrait thumbnail for the bordered PDP swatch box. */
  swatchImage: string
  gallery: GalleryImage[]
}

export type SizeOption = {
  label: string
  inStock: boolean
  /** Renders in the warm accent, like the reference PDP's "M". */
  lowStock?: boolean
}

export type ProductCategory = 'men' | 'women' | 'kids' | 'loungewear' | 'socks'

export type Product = {
  id: string
  slug: string
  /** Stored uppercase — the design never lower-cases it. */
  name: string
  /** Warm-accent eyebrow above the name on cards, e.g. "PERFORMANCE". */
  concept?: string
  category: ProductCategory
  subCategory: string
  price: Money
  /** Presence means the product is on sale. */
  originalPrice?: Money
  /** Drives the "N pcs | Rs.X/pc" line. 1 means no pack line. */
  packSize: number
  /** Plain text line under the price, e.g. "New Arrival". */
  marketingLabel?: string
  colors: ColorVariant[]
  sizes: SizeOption[]
  rating?: { average: number; count: number }
  description: string
  fit: string
  details: string[]
  composition: string
  careInstructions: string[]
  articleNumber: string
  relatedIds: string[]
  styleWithIds: string[]
  alsoBoughtIds: string[]
}
