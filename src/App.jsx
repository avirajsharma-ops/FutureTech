import { useEffect, useRef, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Loader from './components/Loader'
import LiquidGlassDefs from './components/LiquidGlassDefs'
import HomePage from './pages/HomePage'
import WorkPage from './pages/WorkPage'
import ServicesPage from './pages/ServicesPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import './styles/liquid-glass.css'
import './App.css'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

export default function App() {
  const [theme] = useState('light')
  const introStartRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <>
      <Loader
        onComplete={() => {
          setTimeout(() => {
            introStartRef.current = performance.now()
          }, 1000)
        }}
      />
      <LiquidGlassDefs />
      <ScrollToTop />
      <Header />

      <Routes>
        <Route path="/" element={<HomePage introStartRef={introStartRef} />} />
        <Route path="/work" element={<WorkPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<HomePage introStartRef={introStartRef} />} />
      </Routes>

      <Footer />
    </>
  )
}
