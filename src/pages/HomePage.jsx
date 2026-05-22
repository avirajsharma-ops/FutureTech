import HeroScene, { SILVER_MODEL_LIGHTING_PROPS } from '../components/HeroScene'
import FutureScrollReveal from '../components/FutureScrollReveal'
import HomeJourney from '../components/HomeJourney'
import HomeMagicSearch from '../components/HomeMagicSearch'
import { AISection } from '../components/AISection'
import { PrivacySection } from '../components/PrivacySection'

export default function HomePage({ introStartRef }) {
  return (
    <div className="home-page">
      <HeroScene
        title="Engineering Tomorrow, In Real Time."
        tagline="Intelligent systems, adaptive design, and next-generation technology built to move business forward."
        introStartRef={introStartRef}
        backgroundImage="/images/hero-backgrounds/hero-bg-home.png"
        {...SILVER_MODEL_LIGHTING_PROPS}
      />
      <AISection />
      <PrivacySection />
      <FutureScrollReveal />
      <HomeJourney />
      <HomeMagicSearch />
    </div>
  )
}
