import { Link } from 'react-router-dom'
import { footerColumns, memberBlock, site, socials } from '../../data/site'
import { SocialIcon } from '../ui/icons'
import './Footer.css'

export function Footer() {
  return (
    <footer className="footer">
      {/* 1 — link columns. Sentence-case bold headings over all-caps links. */}
      <div className="footer__columns">
        {footerColumns.map((column) => (
          <div key={column.heading}>
            <h2 className="footer__heading">{column.heading}</h2>
            <ul className="footer__list">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h2 className="footer__heading">{memberBlock.heading}</h2>
          <p className="footer__member">{memberBlock.copy}</p>
          <a href="#signup" className="footer__signup link-underline">
            {memberBlock.cta}
          </a>
        </div>
      </div>

      {/* 2 — wordmark */}
      <div className="footer__wordmark">{site.brand}</div>

      {/* 3 — region */}
      <div className="footer__region">
        <strong>{site.region}</strong>
        <a href="#region" className="link-underline">
          CHANGE REGION
        </a>
      </div>

      {/* 4 — legal + social. No payment icons anywhere on the site. */}
      <div className="footer__legal">
        <p className="muted">{site.legal}</p>
        <div className="footer__social">
          {socials.map((name) => (
            <a key={name} href="#social" aria-label={name}>
              <SocialIcon name={name} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
