import { Suspense, lazy, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import Header from './components/Header'
import Footer from './components/Footer'
import Loader from './components/Loader'
import LiquidGlassDefs from './components/LiquidGlassDefs'
const HomePage = lazy(() => import('./pages/HomePage'))
const WorkPage = lazy(() => import('./pages/WorkPage'))
const ServicesPage = lazy(() => import('./pages/ServicesPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const DirectorPage = lazy(() => import('./pages/DirectorPage'))
const SpadeClonePage = lazy(() => import('./pages/SpadeClonePage'))
import { HERO_MODEL_URL } from './lib/heroModel'
import { COIN_MODEL_URL } from './lib/coinModel'
import { WORK_MODEL_URL } from './lib/workModel'
import { SERVICES_MODEL_URL } from './lib/servicesModel'
import { useDesktopScaleCompensation } from './hooks/useDesktopScaleCompensation'
import './styles/liquid-glass.css'
import './App.css'

const PAGE_FADE_DURATION = 0.28
const MODEL_INTRO_ARM_DELAY = 500
const MODEL_INTRO_PATHS = new Set(['/', '/work', '/news-events', '/about'])

function getModelIntroPath(pathname) {
  const normalized = pathname === '/' ? '/' : pathname.replace(/\/+$/, '')
  return MODEL_INTRO_PATHS.has(normalized) ? normalized : null
}

export default function App() {
  useDesktopScaleCompensation()
  const [theme] = useState('light')
  const introStartRefs = useRef(
    Object.fromEntries([...MODEL_INTRO_PATHS].map((path) => [path, { current: null }])),
  )
  const [loaderComplete, setLoaderComplete] = useState(false)
  const location = useLocation()
  const isSpadeClone = location.pathname.replace(/\/+$/, '') === '/spade'
  const modelIntroPath = isSpadeClone ? null : getModelIntroPath(location.pathname)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Scroll to top whenever the route changes.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  useLayoutEffect(() => {
    if (!modelIntroPath) return undefined

    const introStartRef = introStartRefs.current[modelIntroPath]
    introStartRef.current = null

    if (!loaderComplete) return undefined

    const timer = window.setTimeout(() => {
      introStartRef.current = performance.now()
    }, MODEL_INTRO_ARM_DELAY)

    return () => window.clearTimeout(timer)
  }, [loaderComplete, modelIntroPath])

  const getIntroRef = (path) => (
    modelIntroPath === path ? introStartRefs.current[path] : null
  )

  return (
    <>
      {!isSpadeClone && (
        <Loader
          onComplete={() => {
            setLoaderComplete(true)
          }}
        />
      )}
      {!isSpadeClone && <LiquidGlassDefs />}
      {!isSpadeClone && <Header />}

      {/* Cross-fade between routes. mode="wait" lets the outgoing page
          finish fading out before the new one fades in, so the two
          never visually overlap. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={location.pathname}
          className="page-live"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: PAGE_FADE_DURATION, ease: 'easeOut' }}
        >
          <Suspense fallback={null}>
            <Routes location={location}>
              <Route path="/" element={<HomePage introStartRef={getIntroRef('/')} />} />
              <Route path="/work" element={<WorkPage introStartRef={getIntroRef('/work')} />} />
              <Route path="/news-events" element={<ServicesPage introStartRef={getIntroRef('/news-events')} />} />
              <Route path="/services" element={<Navigate to="/news-events" replace />} />
              <Route path="/about" element={<AboutPage introStartRef={getIntroRef('/about')} />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/director/:directorname" element={<DirectorPage />} />
              <Route path="/spade" element={<SpadeClonePage />} />
              <Route path="*" element={<HomePage introStartRef={getIntroRef('/')} />} />
            </Routes>
          </Suspense>
        </motion.main>
      </AnimatePresence>

      {!isSpadeClone && <Footer />}
    </>
  )
}
