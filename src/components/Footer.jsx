import { Link } from 'react-router-dom'
import './Footer.css'

const COMPANY_LINKS = [
  { label: 'Work', to: '/work' },
  { label: 'News&Events', to: '/news-events' },
  { label: 'About', to: '/about' },
]

const CONNECT_LINKS = [
  {
    label: 'Linkedin',
    href: 'https://linkedin.com',
    rel: 'noopener noreferrer',
    target: '_blank',
    icon: '/footer/linkedin-circled.png',
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com',
    rel: 'noopener noreferrer',
    target: '_blank',
    icon: '/footer/instagram-circle.png',
  },
  {
    label: 'Whatsapp',
    href: 'https://www.whatsapp.com/',
    rel: 'noopener noreferrer',
    target: '_blank',
    icon: '/footer/whatsapp.png',
  },
]

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '#privacy-policy' },
  { label: 'Terms and Conditions', href: '#terms-and-conditions' },
]

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner liquid-glass liquid-glass--card">
        <div className="site-footer__top">
          <div className="site-footer__content">
            <Link to="/" className="site-footer__brand" aria-label="MW Futuretech home">
              <img src="/footer/mwfuturetech-logo.png" alt="MW Futuretech logo" className="site-footer__logo" />
              <span className="site-footer__brand-name">MW FutureTech</span>
            </Link>

            <p className="site-footer__description">
              Mushroom World Group, a place where ability to recognize and thrive on
              possibilities, refining risks into potential assets drives us towards
              growth and success,
            </p>

            <p className="site-footer__tagline">
              Engineering Tomorrow, In Real Time.
            </p>
          </div>

          <nav className="site-footer__nav" aria-label="Footer">
            <div className="site-footer__nav-group">
              <span className="site-footer__nav-label">Company</span>
              <ul className="site-footer__nav-list">
                {COMPANY_LINKS.map((item) => (
                  <li key={item.label}>
                    <Link to={item.to} className="site-footer__link">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="site-footer__nav-group">
              <span className="site-footer__nav-label">Connect</span>
              <ul className="site-footer__nav-list site-footer__nav-list--connect">
                {CONNECT_LINKS.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target={item.target}
                      rel={item.rel}
                      className="site-footer__link site-footer__link--connect"
                    >
                      <span className="site-footer__icon" aria-hidden="true">
                        <img src={item.icon} alt="" />
                      </span>
                      <span>{item.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        <div className="site-footer__bottom">
          <span className="site-footer__copyright">
            © {new Date().getFullYear()} MW Futuretech. All rights reserved.
          </span>
          <span className="site-footer__bottom-links">
            {LEGAL_LINKS.map((item) => (
              <a key={item.label} href={item.href} className="site-footer__legal-link">
                {item.label}
              </a>
            ))}
          </span>
        </div>
      </div>
    </footer>
  )
}
