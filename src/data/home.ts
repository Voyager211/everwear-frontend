import { products } from './products'

export const hero = {
  image: '/images/home/hero.svg',
  headlineLines: ['FLAT 15% OFF', 'MEMBER EXCLUSIVE'],
  href: '/shop?scope=sale',
}

export type HotspotSpec = { x: string; y: string; slug: string }

export type CampaignTile = {
  image: string
  caption: string
  href: string
  hotspots: HotspotSpec[]
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
      {
        image: '/images/home/campaign-1.svg',
        caption: 'SOFT COTTON ESSENTIALS',
        href: '/shop?scope=men',
        hotspots: [
          { x: '58%', y: '34%', slug: '3-pack-ribbed-cotton-vests' },
          { x: '40%', y: '68%', slug: '5-pack-cotton-briefs' },
        ],
      },
      {
        image: '/images/home/campaign-2.svg',
        caption: 'PERFORMANCE LAYERS',
        href: '/shop?q=performance',
        hotspots: [
          { x: '62%', y: '41%', slug: '3-pack-coolmax-mid-trunks' },
          { x: '46%', y: '72%', slug: 'seamless-performance-trunks' },
        ],
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
      { image: '/images/home/category-briefs.svg', caption: 'BRIEFS', href: '/shop?types=Briefs' },
      { image: '/images/home/category-vests.svg', caption: 'VESTS', href: '/shop?types=Vests' },
    ],
  },
  {
    type: 'categoryPair',
    tiles: [
      { image: '/images/home/category-lounge.svg', caption: 'LOUNGE SETS', href: '/shop?scope=loungewear' },
      { image: '/images/home/category-socks.svg', caption: 'SOCKS', href: '/shop?scope=socks' },
    ],
  },
]
