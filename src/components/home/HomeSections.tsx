import { Link } from 'react-router-dom'
import { hero, type CampaignTile, type HomeModule } from '../../data/home'
import { offer } from '../../data/site'
import { byIds } from '../../data/products'
import { useCountdown } from '../../lib/hooks'
import { SectionHeaderRow } from '../ui'
import './Home.css'

/**
 * Full-bleed banner. When the artwork has no headline of its own, one is overlaid bottom-left in
 * brand red; when it does, the overlay is skipped and the page keeps a screen-reader-only h1 so
 * the document still has a heading.
 */
export function HeroBanner() {
  const overlaid = hero.headlineLines.length > 0
  return (
    <Link to={hero.href} className="hero">
      {/* A 2.36:1 banner is only ~165px tall on a phone, which makes baked-in copy unreadable.
          Point `mobileImage` at a portrait crop of the same artwork and it is used below 700px. */}
      <picture>
        {hero.mobileImage && <source media="(max-width: 699px)" srcSet={hero.mobileImage} />}
        <img src={hero.image} alt={overlaid ? '' : hero.alt} className="hero__img" />
      </picture>
      {overlaid ? (
        <h1 className="hero__headline display">
          {hero.headlineLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h1>
      ) : (
        <h1 className="sr-only">{hero.alt}</h1>
      )}
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

/**
 * A category tile: the whole column is one link, with a centred title over the top of the image
 * and an overlay that fades in on hover or keyboard focus carrying the EXPLORE call to action.
 */
function CampaignColumn({ tile }: { tile: CampaignTile }) {
  return (
    <Link to={tile.href} className="campaign__col" aria-label={`${tile.caption} — explore`}>
      <img src={tile.image} alt="" className="campaign__img" />
      <span className="campaign__title caps">{tile.caption}</span>
      <span className="campaign__overlay" aria-hidden>
        <span className="campaign__cta caps">Explore</span>
      </span>
    </Link>
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
