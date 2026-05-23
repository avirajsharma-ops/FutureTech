import { useEffect } from 'react'
import HeroScene, { SILVER_MODEL_LIGHTING_PROPS } from '../components/HeroScene'
import TeamSection from '../components/TeamSection'
import {
  COIN_MODEL_URL,
  coinModelPromise,
  getCoinModelReady,
  getCoinModelUrl,
} from '../lib/coinModel'

export default function AboutPage({ introStartRef }) {
  // Seed synchronously when the cached blob URL is already resolved
  // (true on every navigation after the coin has been prefetched).
  const coinUrl = getCoinModelReady() ? getCoinModelUrl() : COIN_MODEL_URL

  useEffect(() => {
    if (getCoinModelReady()) return
    coinModelPromise.catch(() => { })
  }, [])

  return (
    <>
      <HeroScene
        modelUrl={coinUrl}
        title="A studio engineering tomorrow, today."
        tagline="MW Futuretech is a small team of engineers, designers, and researchers building intelligent software for ambitious teams."
        // Coin GLB lies flat on the XZ plane with the logo on +Y.
        // Stand it up by π/2 around X (logo facing camera), add Y yaw
        // for a 3D read, then roll on Z so the logo sits upright.
        baseRotation={[Math.PI / 2 - 0.25, 0, -0.3]}
        // Desktop: shrink down so the coin reads as a hero element, not
        // a wallpaper. Mobile: keep the larger size so it still fills
        // the narrower viewport.
        scaleMultiplier={0.5}
        mobileScaleMultiplier={1.48}
        mobileYOffset={0.28}
        centerVertically
        // The coin's drag rolls it around its Z (depth) axis.
        dragAxis="z"
        dragDirection={-1}
        {...SILVER_MODEL_LIGHTING_PROPS}
        // Welcome animation: enters spun ~90° to the right on Z, eases
        // back to its rest pose. Armed 1s after the loader/page transition.
        introStartRef={introStartRef}
        introAxis="z"
        introStartOffset={1.6}
        backgroundImage="/images/hero-backgrounds/hero-bg-about.webp"
      />
      <TeamSection />
    </>
  )
}
