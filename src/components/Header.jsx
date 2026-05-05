import { Link, NavLink } from 'react-router-dom'
import './Header.css'

const NAV_ITEMS = [
  { label: 'Work', to: '/work' },
  { label: 'Services', to: '/services' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

export default function Header() {
  return (
    <header className="site-header" role="banner">
      <div className="site-header__pill liquid-glass liquid-glass--strong liquid-glass--animated">
        <Link to="/" className="site-header__brand">
          <img src="/favicon.png" alt="MW Futuretech logo" className="site-header__logo" />
          <span className="site-header__brand-mark">MW</span>
          <span className="site-header__brand-name">Futuretech</span>
        </Link>

        <nav className="site-header__nav" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.label} to={item.to} className="site-header__link">
              {item.label}
            </NavLink>
          ))}
        </nav>

        <Link to="/contact" className="site-header__cta liquid-glass liquid-glass-button">
          Let&rsquo;s Talk
        </Link>
      </div>
    </header>
  )
}
