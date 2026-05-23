import { useEffect } from 'react'
import HeroScene, { SILVER_MODEL_LIGHTING_PROPS } from '../components/HeroScene'
import OffMenuGallery from '../components/OffMenuGallery'
import {
  WORK_MODEL_URL,
  workModelPromise,
  getWorkModelReady,
  getWorkModelUrl,
} from '../lib/workModel'
import './WorkPage.css'

export default function WorkPage({ introStartRef }) {
  // Seed cached blob URL synchronously when available.
  const workModelUrl = getWorkModelReady() ? getWorkModelUrl() : WORK_MODEL_URL

  useEffect(() => {
    if (getWorkModelReady()) return
    workModelPromise.catch(() => { })
  }, [])

  return (
    <>
      <HeroScene
        modelUrl={workModelUrl}
        title="Work that ships, scales, and sticks."
        tagline="A glimpse into recent engagements across fintech, infrastructure, and intelligent applications."
        introStartRef={introStartRef}
        mobileScaleMultiplier={1.42}
        mobileYOffset={0.24}
        {...SILVER_MODEL_LIGHTING_PROPS}
        backgroundImage="/images/hero-backgrounds/hero-bg-work.webp"
      />
      <OffMenuGallery />
    </>
  )
}