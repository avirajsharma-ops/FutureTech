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
  const [loaderVisible, setLoaderVisible] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // On URL change: trigger header fade-out, then after the fade is done
  // swap displayLocation and mount the loader cover on top.
  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      const snapshot = displayLocation
      setTransitioning(true) // header begins fading out

      // Wait for the header fade (~180ms) before covering the screen.
      const id = setTimeout(() => {
        setPrevLocation(snapshot)
        setDisplayLocation(location)
        setLoaderVisible(true)
        window.scrollTo({ top: 0, behavior: 'instant' })
      }, 180)
      return () => clearTimeout(id)
    }
  }, [location, displayLocation])

  // Reflect transition state on <html> so global UI (header) can react.
  useEffect(() => {
    if (transitioning) {
      document.documentElement.setAttribute('data-transitioning', 'true')
    } else {
      document.documentElement.removeAttribute('data-transitioning')
    }
  }, [transitioning])

  const handleComplete = useCallback(() => {
    setLoaderVisible(false)
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

      {loaderVisible && (
        <TransitionLoader
          onComplete={handleComplete}
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


