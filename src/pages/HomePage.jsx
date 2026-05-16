import HeroScene, { SILVER_MODEL_LIGHTING_PROPS } from '../components/HeroScene'
import FutureScrollReveal from '../components/FutureScrollReveal'
import HomeJourney from '../components/HomeJourney'
import HomeMagicSearch from '../components/HomeMagicSearch'

export default function HomePage({ introStartRef }) {
  return (
    <div className="home-page">
      <HeroScene
        title="Engineering Tomorrow, In Real Time."
        tagline="Intelligent systems, adaptive design, and next-generation technology built to move business forward."
        introStartRef={introStartRef}
        {...SILVER_MODEL_LIGHTING_PROPS}
      />
      <FutureScrollReveal />
      <HomeJourney />
      <HomeMagicSearch />
    </div>
  )
}
