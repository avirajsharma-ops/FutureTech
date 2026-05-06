import { useEffect, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import PageShell from './PageShell'
import HeroScene from '../components/HeroScene'
import {
  SERVICES_MODEL_URL,
  servicesModelPromise,
  getServicesModelReady,
  getServicesModelUrl,
} from '../lib/servicesModel'

const SERVICES = [
  { title: 'AI & ML Engineering', desc: 'Bespoke model design, training, and deployment for production-scale workloads.' },
  { title: 'Real-time Data Platforms', desc: 'Streaming ingestion, enrichment, and analytics with sub-second latency.' },
  { title: 'Product Engineering', desc: 'End-to-end web and mobile applications built with modern, performant stacks.' },
  { title: 'Cloud & Infrastructure', desc: 'Kubernetes, serverless, and edge architectures designed for scale.' },
  { title: 'Design Systems', desc: 'Cohesive UI libraries, design tokens, and motion frameworks across products.' },
  { title: 'Strategy & Advisory', desc: 'Technical roadmaps, architecture reviews, and team augmentation.' },
]

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
      <PageShell
        eyebrow="What we do"
        title="A spectrum of services, engineered for scale."
        lead="From research to production, we architect software that ships, operates, and adapts."
      >
        <div className="page-grid">
          {SERVICES.map((s) => (
            <div key={s.title} className="page-card liquid-glass liquid-glass--card">
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </PageShell>
    </>
  )
}
