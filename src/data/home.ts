import { products } from './products'

export const hero = {
  image: '/images/home/hero.jpg',
  /**
   * The supplied banner has its own headline set into the artwork, so the red overlay is off —
   * two headlines would collide. Put lines back here and the overlay returns.
   */
  headlineLines: [] as string[],
  /** Optional portrait crop used below 700px, where the wide banner is too short to read. */
  mobileImage: undefined as string | undefined,
  alt: 'Simple Shades, Premium Feel — everyday essentials crafted for clean style and a perfect fit',
  href: '/shop?scope=men',
}

export type CampaignTile = {
  image: string
  /** Rendered as a centred title over the top of the image. */
  caption: string
  href: string
}

export type HomeModule =
  | { type: 'campaignPair'; label: string; href: string; tiles: [CampaignTile, CampaignTile] }
  | { type: 'packshotGrid'; label: string; href: string; productIds: string[] }
  | {
      type: 'categoryPair'
      tiles: [
        { image: string; caption: string; href: string },
        { image: string; caption: string; href: string },
      ]
    }

// New arrivals first, then anything else to fill the 12 slots. Partitioning (rather than
// concatenating two overlapping slices) keeps the ids unique.
const newIn = products.filter((p) => p.marketingLabel)
const filler = products.filter((p) => !p.marketingLabel)
const newInIds = [...newIn, ...filler].slice(0, 12).map((p) => p.id)

/**
 * The page renders from this array rather than hardcoded JSX, so sections can be reordered
 * live during a client review.
 */
export const homeModules: HomeModule[] = [
  {
    type: 'campaignPair',
    label: 'EVERYDAY COMFORT',
    href: '/shop',
    tiles: [
      // Order follows the artwork: campaign-1 is the women's shot, campaign-2 the men's.
      {
        image: '/images/home/campaign-1.jpg',
        caption: "WOMEN'S COLLECTION",
        href: '/shop?scope=women',
      },
      {
        image: '/images/home/campaign-2.jpg',
        caption: "MEN'S COLLECTION",
        href: '/shop?scope=men',
      },
    ],
  },
  {
    type: 'packshotGrid',
    label: 'NEW IN',
    href: '/shop',
    productIds: newInIds,
  },
  {
    type: 'categoryPair',
    tiles: [
      { image: '/images/home/category-briefs.jpg', caption: 'BRIEFS', href: '/shop?types=Briefs' },
      { image: '/images/home/category-vests.jpg', caption: 'VESTS', href: '/shop?types=Vests' },
    ],
  },
  {
    type: 'categoryPair',
    tiles: [
      { image: '/images/home/category-lounge.jpg', caption: 'LOUNGE SETS', href: '/shop?scope=loungewear' },
      { image: '/images/home/category-socks.jpg', caption: 'SOCKS', href: '/shop?scope=socks' },
    ],
  },
]
