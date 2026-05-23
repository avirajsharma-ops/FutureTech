import { useEffect } from 'react'
import HeroScene from '../components/HeroScene'
import ExpertiseSection from '../components/ExpertiseSection'
import {
  SERVICES_MODEL_URL,
  servicesModelPromise,
  getServicesModelReady,
  getServicesModelUrl,
} from '../lib/servicesModel'

export default function ServicesPage({ introStartRef }) {
  const servicesModelUrl = getServicesModelReady() ? getServicesModelUrl() : SERVICES_MODEL_URL

  useEffect(() => {
    if (getServicesModelReady()) return
    servicesModelPromise.catch(() => { })
  }, [])

  return (
    <>
      <HeroScene
        modelUrl={servicesModelUrl}
        title="Services engineered for scale."
        tagline="From research to production, we architect software that ships, operates, and adapts."
        introStartRef={introStartRef}
        scaleMultiplier={0.86}
        mobileScaleMultiplier={1.56}
        yOffset={0.32}
        mobileYOffset={0.44}
        backgroundImage="/images/hero-backgrounds/hero-bg-services.png"
      />
      <ExpertiseSection />
    </>
  )
}
