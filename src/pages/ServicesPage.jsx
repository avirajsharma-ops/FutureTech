import { useEffect, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import HeroScene from '../components/HeroScene'
import ExpertiseSection from '../components/ExpertiseSection'
import {
  SERVICES_MODEL_URL,
  servicesModelPromise,
  getServicesModelReady,
  getServicesModelUrl,
} from '../lib/servicesModel'

export default function ServicesPage({ introStartRef }) {
  const [servicesModelUrl, setServicesModelUrl] = useState(
    getServicesModelReady() ? getServicesModelUrl() : SERVICES_MODEL_URL,
  )

  useEffect(() => {
    if (getServicesModelReady()) return
    let mounted = true
    servicesModelPromise.then((url) => {
      if (!mounted) return
      setServicesModelUrl(url)
      try {
        useGLTF.preload(url)
      } catch {
        // Best-effort cache warm-up for route transition clones.
      }
    })
    return () => {
      mounted = false
    }
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
      />
      <ExpertiseSection />
    </>
  )
}
