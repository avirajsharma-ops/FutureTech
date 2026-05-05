import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import './Header.css'

const NAV_ITEMS = [
  { label: 'Work', to: '/work' },
  { label: 'Services', to: '/services' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (menuOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [menuOpen])

  // Close on Escape.
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return (
    <>
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

          <button
            type="button"
            className="site-header__hamburger liquid-glass liquid-glass--circle liquid-glass-button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-drawer"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className={`hamburger-icon${menuOpen ? ' is-open' : ''}`} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="drawer-scrim"
              className="mobile-drawer__scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.65, 0, 0.35, 1] }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              key="drawer"
              id="mobile-drawer"
              className="mobile-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Site menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
            >
              <div className="mobile-drawer__head">
                <Link to="/" className="mobile-drawer__brand" onClick={() => setMenuOpen(false)}>
                  <img src="/favicon.png" alt="" className="mobile-drawer__logo" />
                  <span>MW Futuretech</span>
                </Link>
                <button
                  type="button"
                  className="mobile-drawer__close"
                  aria-label="Close menu"
                  onClick={() => setMenuOpen(false)}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              <nav className="mobile-drawer__nav" aria-label="Mobile">
                {NAV_ITEMS.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: 0.1 + i * 0.05, ease: [0.65, 0, 0.35, 1] }}
                  >
                    <NavLink to={item.to} className="mobile-drawer__link">
                      {item.label}
                    </NavLink>
                  </motion.div>
                ))}
              </nav>

              <motion.div
                className="mobile-drawer__footer"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25, ease: [0.65, 0, 0.35, 1] }}
              >
                <Link
                  to="/contact"
                  className="mobile-drawer__cta"
                >
                  Let&rsquo;s Talk
                </Link>
              </motion.div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
