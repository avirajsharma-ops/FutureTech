import './Footer.css'

const LINKS = {
  Company: [
    { label: 'Work', href: '#work' },
    { label: 'Services', href: '#services' },
    { label: 'About', href: '#about' },
  ],
  Connect: [
    { label: 'Contact', href: '#contact' },
    { label: 'LinkedIn', href: 'https://linkedin.com', rel: 'noopener noreferrer', target: '_blank' },
    { label: 'Twitter / X', href: 'https://x.com', rel: 'noopener noreferrer', target: '_blank' },
  ],
}

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner liquid-glass liquid-glass--card">
        {/* Top row */}
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <span className="site-footer__brand-mark">MW</span>
            <span className="site-footer__brand-name">Futuretech</span>
            <p className="site-footer__tagline">
              Engineering Tomorrow, In Real Time.
            </p>
          </div>

          <nav className="site-footer__nav" aria-label="Footer">
            {Object.entries(LINKS).map(([group, items]) => (
              <div key={group} className="site-footer__nav-group">
                <span className="site-footer__nav-label">{group}</span>
                <ul>
                  {items.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        target={item.target}
                        rel={item.rel}
                        className="site-footer__link"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Divider */}
        <div className="site-footer__divider" role="separator" />

        {/* Bottom row */}
        <div className="site-footer__bottom">
          <span>© {new Date().getFullYear()} MW Futuretech. All rights reserved.</span>
          <span className="site-footer__bottom-links">
            <a href="#privacy" className="site-footer__link">Privacy</a>
            <a href="#terms" className="site-footer__link">Terms</a>
          </span>
        </div>
      </div>
    </footer>
  )
}
