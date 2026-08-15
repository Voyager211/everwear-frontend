import { Link } from 'react-router-dom'
import { hero, type CampaignTile, type HomeModule } from '../../data/home'
import { offer } from '../../data/site'
import { byIds, bySlug } from '../../data/products'
import { formatPrice } from '../../lib/format'
import { useCountdown } from '../../lib/hooks'
import { SectionHeaderRow } from '../ui'
import { LongArrow } from '../ui/icons'
import './Home.css'

/** Full-bleed image with the headline sitting inside it, bottom left. No CTA button. */
export function HeroBanner() {
  return (
    <Link to={hero.href} className="hero">
      <img src={hero.image} alt="" className="hero__img" />
      <h1 className="hero__headline display">
        {hero.headlineLines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </h1>
    </Link>
  )
}

export function OfferStrip() {
  // Counted from page load, so a demo never opens on an expired sale.
  const { label, expired } = useCountdown(offer.endsInHours * 3600_000)

  return (
    <section className="offer hairline-top">
      <div className="offer__body">
        <p className="offer__title caps">{offer.title}</p>
        <p className="offer__sub caps">{offer.subtitle}</p>
        {!expired && (
          <p className="offer__timer">
            <span className="offer__bullet" />
            {label}
          </p>
        )}
        <p className="offer__fine muted">{offer.finePrint}</p>
      </div>
    </section>
  )
}

/** Price chip pinned over campaign photography — click through to the product. */
function HotspotTag({ x, y, slug }: { x: string; y: string; slug: string }) {
  const product = bySlug(slug)
  if (!product) return null
  return (
    <Link
      to={`/product/${product.slug}`}
      className="hotspot"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      <span className="hotspot__mark" />
      <span className="hotspot__price">{formatPrice(product.price)}</span>
    </Link>
  )
}

/**
 * Two viewport-taller images side by side. The caption row is `sticky bottom: 0`, so it stays
 * pinned to the bottom of the screen while the image scrolls behind it — the module's whole trick.
 */
function CampaignColumn({ tile }: { tile: CampaignTile }) {
  return (
    <div className="campaign__col">
      <Link to={tile.href} className="campaign__imgwrap">
        <img src={tile.image} alt="" className="campaign__img" />
      </Link>
      {tile.hotspots.map((spot) => (
        <HotspotTag key={spot.slug} {...spot} />
      ))}
      <Link to={tile.href} className="campaign__caption">
        <span className="caps">{tile.caption}</span>
        <LongArrow className="arrow" />
      </Link>
    </div>
  )
}

export function HomeModules({ modules }: { modules: HomeModule[] }) {
  return (
    <>
      {modules.map((module, index) => {
        if (module.type === 'campaignPair') {
          return (
            <section key={index}>
              <SectionHeaderRow label={module.label} href={module.href} />
              <div className="campaign">
                {module.tiles.map((tile) => (
                  <CampaignColumn key={tile.caption} tile={tile} />
                ))}
              </div>
            </section>
          )
        }

        if (module.type === 'packshotGrid') {
          // Zero text: no name, price, swatch or heart. Just the packshot on the band.
          return (
            <section key={index}>
              <SectionHeaderRow label={module.label} href={module.href} />
              <div className="packshots band">
                {byIds(module.productIds).map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.slug}`}
                    className="packshots__tile"
                    aria-label={product.name}
                  >
                    <img src={product.colors[0].packshot} alt="" loading="lazy" />
                  </Link>
                ))}
              </div>
            </section>
          )
        }

        return (
          <section key={index} className="tilepair">
            {module.tiles.map((tile) => (
              <Link key={tile.caption} to={tile.href} className="tilepair__tile">
                <img src={tile.image} alt="" loading="lazy" />
                <span className="tilepair__caption caps">{tile.caption}</span>
                <span className="tilepair__cta caps">Explore</span>
              </Link>
            ))}
          </section>
        )
      })}
    </>
  )
}
