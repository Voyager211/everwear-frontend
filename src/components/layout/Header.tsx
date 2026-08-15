import { useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { nav, promoBar, site } from '../../data/site'
import { bySlug } from '../../data/products'
import { useStore } from '../../context/useStore'
import { useMediaQuery, useScrolledPast } from '../../lib/hooks'
import { Drawer } from '../ui'
import { AccountIcon, BagIcon, HeartIcon, MenuIcon, SearchIcon } from '../ui/icons'
import './Header.css'

/**
 * Which nav item is highlighted. Derived from the *content*, not the route: a product page
 * highlights its category, and search results highlight nothing — matching the reference.
 */
function useActiveSection() {
  const { pathname } = useLocation()
  const [params] = useSearchParams()

  if (pathname.startsWith('/product/')) {
    return bySlug(pathname.split('/product/')[1])?.category ?? null
  }
  if (pathname.startsWith('/shop')) {
    const scope = params.get('scope')
    return scope && scope !== 'all' && scope !== 'sale' ? scope : null
  }
  return null
}

function PromoBar() {
  return (
    <Link to={promoBar.href} className="promobar caps">
      {promoBar.text}
    </Link>
  )
}

export function Header() {
  const active = useActiveSection()
  const stuck = useScrolledPast(8)
  const isMobile = useMediaQuery('(max-width: 899px)')
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [navOpen, setNavOpen] = useState(false)
  const { count, wishlistCount, openCart } = useStore()

  const menu = nav.find((item) => item.label === openMenu && item.columns)

  return (
    <>
      <PromoBar />
      <header
        className={`header${stuck ? ' header--stuck' : ''}`}
        onMouseLeave={() => setOpenMenu(null)}
      >
        <div className="header__bar">
          {isMobile && (
            <button type="button" className="header__icon" onClick={() => setNavOpen(true)} aria-label="Menu">
              <MenuIcon />
            </button>
          )}

          <Link to="/" className="header__logo">
            {site.brand}
          </Link>

          {!isMobile && (
            <nav className="header__nav">
              {nav.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`header__navlink caps${active === item.match ? ' is-active' : ''}`}
                  onMouseEnter={() => setOpenMenu(item.label)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          <div className="header__utils">
            <button type="button" className="header__icon" aria-label="Search">
              <SearchIcon />
            </button>
            {!isMobile && (
              <button type="button" className="header__icon" aria-label="Account">
                <AccountIcon />
              </button>
            )}
            <Link to="/wishlist" className="header__icon" aria-label="Wishlist">
              <HeartIcon filled={wishlistCount > 0} />
            </Link>
            <button type="button" className="header__icon" onClick={openCart} aria-label="Shopping bag">
              <BagIcon />
              {count > 0 && <span className="header__count">{count}</span>}
            </button>
          </div>
        </div>

        {menu && !isMobile && (
          <div className="megamenu" onMouseLeave={() => setOpenMenu(null)}>
            <div className="megamenu__inner">
              {menu.columns!.map((col) => (
                <div key={col.heading}>
                  <p className="megamenu__heading caps">{col.heading}</p>
                  <ul className="megamenu__list">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <Link to={link.href} onClick={() => setOpenMenu(null)}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="megamenu__tiles">
                {menu.tiles?.map((tile) => (
                  <Link key={tile.caption} to={tile.href} onClick={() => setOpenMenu(null)}>
                    <img src={tile.image} alt="" loading="lazy" />
                    <span className="caps">{tile.caption}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      <Drawer open={navOpen} onClose={() => setNavOpen(false)} title={site.brand} side="left">
        <ul className="mobilenav">
          {nav.map((item) => (
            <li key={item.label}>
              <Link to={item.href} className="caps" onClick={() => setNavOpen(false)}>
                {item.label}
              </Link>
              {item.columns && (
                <ul className="mobilenav__sub">
                  {item.columns.flatMap((c) => c.links).map((link) => (
                    <li key={link.label}>
                      <Link to={link.href} onClick={() => setNavOpen(false)}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </Drawer>
    </>
  )
}
