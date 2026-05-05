import PageShell from './PageShell'
import HeroScene from '../components/HeroScene'

const PROJECTS = [
  { tag: 'FINTECH', title: 'Real-time risk engine', desc: 'Sub-50ms transaction scoring across 12 banking partners.' },
  { tag: 'COMMERCE', title: 'Adaptive checkout', desc: 'AI-routed payment flows lifting conversion by 18%.' },
  { tag: 'INFRA', title: 'Edge inference platform', desc: 'Globally distributed model serving for low-latency apps.' },
  { tag: 'CRM', title: 'Predictive CRM', desc: 'Forecasted lifetime value for 4M+ B2B customers.' },
  { tag: 'IOT', title: 'Industrial telemetry', desc: 'Sensor mesh ingestion at 1M events/sec with 99.99% uptime.' },
  { tag: 'HEALTH', title: 'Clinical assistant', desc: 'HIPAA-compliant LLM workflow for triage notes.' },
]

export default function WorkPage() {
  return (
    <>
      <HeroScene
        title="Work that ships, scales, and sticks."
        tagline="A glimpse into recent engagements across fintech, infrastructure, and intelligent applications."
      />
      <PageShell
        eyebrow="Selected Work"
        title="Systems we've shipped, scaled, and launched."
        lead="A glimpse into recent engagements across fintech, infrastructure, and intelligent applications."
      >
      <div className="page-grid">
        {PROJECTS.map((p) => (
          <div key={p.title} className="page-card liquid-glass liquid-glass--card">
            <span className="page-card__icon">{p.tag.slice(0, 1)}</span>
            <h3>{p.title}</h3>
            <p>{p.desc}</p>
          </div>
        ))}
      </div>
      </PageShell>
    </>
  )
}
