import PageShell from './PageShell'
import HeroScene from '../components/HeroScene'

const VALUES = [
  { title: 'Craft', desc: 'We believe in code, design, and details that hold up to scrutiny.' },
  { title: 'Velocity', desc: 'Move quickly without leaving a trail of debt behind.' },
  { title: 'Ownership', desc: 'We treat every system we build as if it were our own.' },
]

export default function AboutPage() {
  return (
    <>
      <HeroScene
        title="A studio engineering tomorrow, today."
        tagline="A small team of engineers, designers, and researchers building intelligent software for ambitious teams."
      />
      <PageShell
        eyebrow="About"
        title="A studio engineering tomorrow, today."
        lead="MW Futuretech is a small team of engineers, designers, and researchers building intelligent software for ambitious teams."
      >
        <div className="page-grid">
          {VALUES.map((v) => (
            <div key={v.title} className="page-card liquid-glass liquid-glass--card">
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </PageShell>
    </>
  )
}
