import { useEffect, useRef, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { motion, useAnimationControls } from 'motion/react'
import Header from './components/Header'
import Footer from './components/Footer'
import Loader from './components/Loader'
import LiquidGlassDefs from './components/LiquidGlassDefs'
import HomePage from './pages/HomePage'
import WorkPage from './pages/WorkPage'
import ServicesPage from './pages/ServicesPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import { HERO_MODEL_URL } from './lib/heroModel'
import './styles/liquid-glass.css'
import './App.css'

const PAGE_REST = { scale: 1, y: '0%', borderRadius: 0 }
const PAGE_EXIT = { scale: 0.92, y: '-110%', borderRadius: 24 }
const PAGE_EXIT_TRANSITION = {
  duration: 1.2,
  scale: { duration: 0.6, ease: [0.65, 0, 0.35, 1] },
  y: { duration: 1.0, ease: [0.76, 0, 0.24, 1], delay: 0.35 },
  borderRadius: { duration: 0.6, ease: [0.65, 0, 0.35, 1] },
}

// Assets to opportunistically prefetch once the homepage is idle.
// Non-render-blocking: injected via <link rel="prefetch"> after first paint.
const PREFETCH_ASSETS = [HERO_MODEL_URL]

function injectPrefetch(href, as) {
  if (typeof document === 'undefined') return
  if (document.querySelector(`link[data-prefetch="${href}"]`)) return
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = href
  if (as) link.as = as
  link.dataset.prefetch = href
  document.head.appendChild(link)
}

export default function App() {
  const [theme] = useState('light')
  const introStartRef = useRef(null)
  const location = useLocation()
  const prevLocationRef = useRef(location)
  const scrollSnapshotRef = useRef(0)

  const [outgoingLocation, setOutgoingLocation] = useState(null)
  const controls = useAnimationControls()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Background asset prefetch — runs after first paint, never blocks render.
  useEffect(() => {
    const idle =
      window.requestIdleCallback ||
      ((cb) => setTimeout(cb, 600))
    const id = idle(() => {
      PREFETCH_ASSETS.forEach((href) => injectPrefetch(href))
    })
    return () => {
      if (window.cancelIdleCallback && typeof id === 'number') {
        window.cancelIdleCallback(id)
      } else {
        clearTimeout(id)
      }
    }
  }, [])

  // On URL change: keep the OLD route mounted in a viewport-locked overlay
  // and animate it out. The NEW route mounts immediately in the live <main>
  // (so its assets begin loading during the animation, not after).
  useEffect(() => {
    if (location.pathname === prevLocationRef.current.pathname) return

    const outgoing = prevLocationRef.current
    prevLocationRef.current = location

    // Capture current scroll so the overlay shows what the user was looking at,
    // then jump the live page to the top so the new route renders cleanly.
    scrollSnapshotRef.current = window.scrollY || window.pageYOffset || 0
    window.scrollTo({ top: 0, behavior: 'instant' })

    document.documentElement.setAttribute('data-transitioning', 'true')
    setOutgoingLocation(outgoing)
  }, [location])

  // Drive the exit animation once the overlay has actually mounted.
  // (Calling controls.start before mount is a no-op because the controls
  // aren't bound to a component yet.)
  useEffect(() => {
    if (!outgoingLocation) return

    let cancelled = false
    controls.set(PAGE_REST)

    // Wait one frame so the overlay paints in its REST state before we
    // start animating — otherwise some browsers skip straight to the end.
    const raf = requestAnimationFrame(() => {
      if (cancelled) return
      controls.start(PAGE_EXIT, PAGE_EXIT_TRANSITION).then(() => {
        if (cancelled) return
        setOutgoingLocation(null)
        controls.set(PAGE_REST)
        document.documentElement.removeAttribute('data-transitioning')
      })
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
    }
  }, [outgoingLocation, controls])

  const renderRoutes = (loc) => (
    <Routes location={loc}>
      <Route path="/" element={<HomePage introStartRef={introStartRef} />} />
      <Route path="/work" element={<WorkPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="*" element={<HomePage introStartRef={introStartRef} />} />
    </Routes>
  )

  return (
    <>
      <Loader
        onComplete={() => {
          setTimeout(() => {
            introStartRef.current = performance.now()
          }, 500)
        }}
      />
      <LiquidGlassDefs />
      <Header />

      {/* Live page — always reflects the current URL.
          The new page starts mounting (and loading its assets) the moment
          the URL changes, in parallel with the exit animation above it. */}
      <main className="page-live">{renderRoutes(location)}</main>

      {/* Exit overlay — viewport-locked snapshot of the previous page,
          animates out (scale + slide-up). Pointer-events disabled. */}
      {outgoingLocation && (
        <motion.div
          className="page-exit-overlay"
          initial={PAGE_REST}
          animate={controls}
          style={{ originX: 0.5, originY: 0 }}
          aria-hidden="true"
        >
          <div
            className="page-exit-overlay__inner"
            style={{ transform: `translateY(-${scrollSnapshotRef.current}px)` }}
          >
            {renderRoutes(outgoingLocation)}
          </div>
        </motion.div>
      )}

      <Footer />
    </>
  )
}
