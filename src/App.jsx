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

  // The location actually rendered by the main <Routes> (always the latest).
  const [displayLocation, setDisplayLocation] = useState(location)
  // The location we render INSIDE the loader (the page being lifted away).
  const [prevLocation, setPrevLocation] = useState(null)
  const [transitioning, setTransitioning] = useState(false)
  const [routeReady, setRouteReady] = useState(true)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // On URL change: snapshot the OLD location into prevLocation,
  // swap displayLocation immediately, and mount the loader on top.
  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setPrevLocation(displayLocation)
      setDisplayLocation(location)
      setRouteReady(false)
      setTransitioning(true)
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [location, displayLocation])

  // Signal the loader once the new route has had a chance to paint.
  useEffect(() => {
    if (transitioning && !routeReady) {
      const id1 = requestAnimationFrame(() => {
        const id2 = requestAnimationFrame(() => setRouteReady(true))
        return () => cancelAnimationFrame(id2)
      })
      return () => cancelAnimationFrame(id1)
    }
  }, [transitioning, routeReady])

  const handleComplete = useCallback(() => {
    setTransitioning(false)
    setPrevLocation(null)
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
          onComplete={handleComplete}
          ready={routeReady}
          previousPage={
            prevLocation ? (
              <Routes location={prevLocation}>
                <Route path="/" element={<HomePage introStartRef={introStartRef} />} />
                <Route path="/work" element={<WorkPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="*" element={null} />
              </Routes>
            ) : null
          }
        />
      )}

      <Footer />
    </>
  )
}


