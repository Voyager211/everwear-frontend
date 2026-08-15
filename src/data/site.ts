/** Everything client-brandable lives here. Change these and the whole storefront re-skins. */

export const site = {
  /** Rendered as a text wordmark, not an image — instantly rebrandable. */
  brand: 'EVERWEAR',
  region: 'INDIA (Rs.)',
  legal:
    'The content of this site is copyright-protected and is the property of Everwear Retail Pvt. Ltd.',
}

export const promoBar = {
  text: 'FLAT 15% OFF FOR MEMBERS | INDEPENDENCE DAY SALE',
  href: '/shop?scope=sale',
}

export const offer = {
  title: 'INDEPENDENCE DAY SALE',
  subtitle: 'VALID ON FULL-PRICE PURCHASES OF ₹3499 OR MORE',
  /** Offset from page load, so a demo never opens on an expired sale. */
  endsInHours: 33.5,
  finePrint: 'T&C apply. Online-only offer. Cannot be combined with sale styles.',
}

export type NavItem = {
  label: string
  href: string
  /** Which product category marks this item active. */
  match?: string
  columns?: { heading: string; links: { label: string; href: string }[] }[]
  tiles?: { image: string; caption: string; href: string }[]
}

const shop = (scope: string, type?: string) =>
  `/shop?scope=${scope}${type ? `&types=${encodeURIComponent(type)}` : ''}`

export const nav: NavItem[] = [
  {
    label: 'Men',
    href: shop('men'),
    match: 'men',
    columns: [
      {
        heading: 'New',
        links: [
          { label: 'New arrivals', href: shop('men') },
          { label: 'Bestsellers', href: shop('men') },
          { label: 'Sale', href: '/shop?scope=sale' },
        ],
      },
      {
        heading: 'Shop by product',
        links: [
          { label: 'Trunks', href: shop('men', 'Trunks') },
          { label: 'Briefs', href: shop('men', 'Briefs') },
          { label: 'Boxer shorts', href: shop('men', 'Boxer shorts') },
          { label: 'Vests', href: shop('men', 'Vests') },
          { label: 'Thermals', href: shop('men', 'Thermals') },
        ],
      },
      {
        heading: 'Shop by pack',
        links: [
          { label: '2 & 3-packs', href: '/shop?scope=men&packSizes=3' },
          { label: '5-packs', href: '/shop?scope=men&packSizes=5' },
          { label: '10-packs', href: '/shop?scope=men&packSizes=10' },
        ],
      },
    ],
    tiles: [
      { image: '/images/home/category-briefs.svg', caption: 'EVERYDAY COTTON', href: shop('men') },
      { image: '/images/home/category-vests.svg', caption: 'VESTS', href: shop('men', 'Vests') },
    ],
  },
  {
    label: 'Women',
    href: shop('women'),
    match: 'women',
    columns: [
      {
        heading: 'New',
        links: [
          { label: 'New arrivals', href: shop('women') },
          { label: 'Bestsellers', href: shop('women') },
          { label: 'Sale', href: '/shop?scope=sale' },
        ],
      },
      {
        heading: 'Shop by product',
        links: [
          { label: 'Briefs', href: shop('women', 'Briefs') },
          { label: 'Thongs', href: shop('women', 'Thongs') },
          { label: 'Bras', href: shop('women', 'Bras') },
          { label: 'Bralettes', href: shop('women', 'Bralettes') },
          { label: 'Camisoles', href: shop('women', 'Camisoles') },
        ],
      },
      {
        heading: 'Featured',
        links: [
          { label: 'Sports bras', href: shop('women', 'Sports bras') },
          { label: 'Seamless', href: '/shop?q=seamless' },
          { label: 'Premium modal', href: '/shop?q=modal' },
        ],
      },
    ],
    tiles: [{ image: '/images/home/category-lounge.svg', caption: 'LOUNGE', href: shop('loungewear') }],
  },
  { label: 'Kids', href: shop('kids'), match: 'kids' },
  { label: 'Loungewear', href: shop('loungewear'), match: 'loungewear' },
  { label: 'Socks', href: shop('socks'), match: 'socks' },
]

export const footerColumns = [
  {
    heading: 'Shop',
    links: [
      { label: 'MEN', href: shop('men') },
      { label: 'WOMEN', href: shop('women') },
      { label: 'KIDS', href: shop('kids') },
      { label: 'LOUNGEWEAR', href: shop('loungewear') },
      { label: 'SOCKS', href: shop('socks') },
      { label: 'SALE', href: '/shop?scope=sale' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'ABOUT US', href: '#' },
      { label: 'STORES', href: '#' },
      { label: 'CAREERS', href: '#' },
      { label: 'SUSTAINABILITY', href: '#' },
      { label: 'PRESS', href: '#' },
    ],
  },
  {
    heading: 'Help',
    links: [
      { label: 'CUSTOMER SERVICE', href: '#' },
      { label: 'MY ACCOUNT', href: '#' },
      { label: 'FIND A STORE', href: '#' },
      { label: 'DELIVERY & RETURNS', href: '#' },
      { label: 'SIZE GUIDE', href: '#' },
      { label: 'CONTACT', href: '#' },
    ],
  },
]

export const memberBlock = {
  heading: 'Become a member',
  copy: 'Join now and get 10% off your first purchase!',
  cta: 'SIGN UP NOW',
}

export const socials = ['Instagram', 'YouTube', 'Pinterest', 'X', 'Facebook'] as const
