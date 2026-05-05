import { useCallback, useEffect, useRef, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Loader from './components/Loader'
import TransitionLoader from './components/TransitionLoader'
import LiquidGlassDefs from './components/LiquidGlassDefs'
import HomePage from './pages/HomePage'
import WorkPage from './pages/WorkPage'
import ServicesPage from './pages/ServicesPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import './styles/liquid-glass.css'
import './App.css'

export default function App() {
  const [theme] = useState('light')
  const introStartRef = useRef(null)
  const location = useLocation()

  const [displayLocation, setDisplayLocation] = useState(location)
  const [transitioning, setTransitioning] = useState(false)
  const [routeReady, setRouteReady] = useState(true)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setRouteReady(false)
      setTransitioning(true)
    }
  }, [location, displayLocation])

  // Once displayLocation has been swapped & painted, signal the loader.
  useEffect(() => {
    if (transitioning && displayLocation.pathname === location.pathname) {
      // Wait two frames so the new route has actually rendered/painted.
      const id1 = requestAnimationFrame(() => {
        const id2 = requestAnimationFrame(() => setRouteReady(true))
        return () => cancelAnimationFrame(id2)
      })
      return () => cancelAnimationFrame(id1)
    }
  }, [transitioning, displayLocation, location])

  const handleCovered = useCallback(() => {
    setDisplayLocation(location)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location])

  const handleComplete = useCallback(() => {
    setTransitioning(false)
  }, [])

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

      <Routes location={displayLocation}>
        <Route path="/" element={<HomePage introStartRef={introStartRef} />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<HomePage introStartRef={introStartRef} />} />
      </Routes>

      {transitioning && (
        <TransitionLoader
          onCovered={handleCovered}
          onComplete={handleComplete}
          ready={routeReady}
        />
      )}

      <Footer />
    </>
  )
}


