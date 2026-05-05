import DataSection from '../components/DataSection'
import HeroScene from '../components/HeroScene'

export default function HomePage({ introStartRef }) {
  return (
    <>
      <HeroScene
        title="Engineering Tomorrow, In Real Time."
        tagline="Intelligent systems, adaptive design, and next-generation technology built to move business forward."
        introStartRef={introStartRef}
      />
      <DataSection />
    </>
  )
}
