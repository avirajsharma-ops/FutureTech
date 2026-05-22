import { useEffect, useRef, useState } from 'react'
import Globe from './Globe'
import './HomeJourney.css'

const JOURNEY_MILESTONES = [
  {
    kicker: 'Discovery',
    title: 'Signal Mapping',
    body: 'We start by reading the live data patterns, operational gaps, and decision moments that shape the business.',
    phase: '01',
    icon: 'SM',
  },
  {
    kicker: 'Intelligence',
    title: 'Context Layer',
    body: 'Streams become clean events, memory, and model-ready context that every interface can understand.',
    phase: '02',
    icon: 'CL',
  },
  {
    kicker: 'Interface',
    title: 'Adaptive Screens',
    body: 'Workspaces adjust to role, intent, and urgency so teams see what matters before the queue gets noisy.',
    phase: '03',
    icon: 'UI',
  },
  {
    kicker: 'Automation',
    title: 'Workflow Agents',
    body: 'AI-assisted agents route approvals, follow-ups, and escalations across people, APIs, and products.',
    phase: '04',
    icon: 'AI',
  },
  {
    kicker: 'Operations',
    title: 'Decision Mesh',
    body: 'Every launch keeps learning from outcomes, closing the loop between live signals and better decisions.',
    phase: '05',
    icon: 'DM',
  },
]

const TICK_COUNT = 92
const TICK_LENGTH = 22
const LONG_TICK_LENGTH = 32
const RAIL_VIEWBOX_WIDTH = 1200
const RAIL_VIEWBOX_HEIGHT = 220
const JOURNEY_ARC_STEP = 0.235
const RAIL_PATH_SAMPLES = 96
const GLOBE_SCROLL_ROTATION = Math.PI * 3.1

const clampProgress = (value) => Math.min(Math.max(value, 0), 1)

const getRailPoint = (ratio) => {
  const clampedRatio = clampProgress(ratio)
  const coordinateX = -80 + clampedRatio * 1360
  const coordinateY = 184 - Math.sin(Math.PI * clampedRatio) * 92

  return { coordinateX, coordinateY }
}

const railPathPoints = Array.from({ length: RAIL_PATH_SAMPLES + 1 }, (unusedValue, index) => {
  void unusedValue
  const ratio = index / RAIL_PATH_SAMPLES
  return getRailPoint(ratio)
})

const RAIL_PATH_D = railPathPoints
  .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.coordinateX.toFixed(2)} ${point.coordinateY.toFixed(2)}`)
  .join(' ')

const getRailTangent = (ratio) => {
  const clampedRatio = clampProgress(ratio)
  const tangentX = 1360
  const tangentY = -Math.cos(Math.PI * clampedRatio) * Math.PI * 92
  const length = Math.hypot(tangentX, tangentY)

  return { tangentX, tangentY, length }
}

const getRailAngle = (ratio) => {
  const { tangentX, tangentY } = getRailTangent(ratio)

  return (Math.atan2(tangentY, tangentX) * 180) / Math.PI
}

const getRailUpperNormal = (ratio) => {
  const { tangentX, tangentY, length } = getRailTangent(ratio)

  return {
    normalX: tangentY / length,
    normalY: -tangentX / length,
  }
}

const getJourneyTextPoint = (ratio) => {
  const clampedRatio = clampProgress(ratio)
  const coordinateX = -80 + ratio * 1360
  const endpointDrop = ratio < 0 ? Math.abs(ratio) * 96 : Math.max(ratio - 1, 0) * 96
  const coordinateY = 184 - Math.sin(Math.PI * clampedRatio) * 92 + endpointDrop

  return { coordinateX, coordinateY }
}

const railTicks = Array.from({ length: TICK_COUNT }, (unusedValue, index) => {
  void unusedValue
  const ratio = index / (TICK_COUNT - 1)
  const { coordinateX, coordinateY } = getRailPoint(ratio)
  const { normalX, normalY } = getRailUpperNormal(ratio)
  const tickLength = index % 5 === 0 ? LONG_TICK_LENGTH : TICK_LENGTH

  return {
    coordinateX,
    coordinateY,
    tickEndX: coordinateX + normalX * tickLength,
    tickEndY: coordinateY + normalY * tickLength,
  }
})

function useSectionProgress(sectionRef) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let animationFrame = 0

    const updateProgress = () => {
      const section = sectionRef.current
      if (!section) return

      const sectionTop = section.getBoundingClientRect().top + window.scrollY
      const scrollRange = Math.max(section.offsetHeight - window.innerHeight, 1)
      setProgress(clampProgress((window.scrollY - sectionTop) / scrollRange))
    }

    const scheduleUpdate = () => {
      if (animationFrame) return
      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = 0
        updateProgress()
      })
    }

    updateProgress()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)

    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
    }
  }, [sectionRef])

  return progress
}

export default function HomeJourney() {
  const sectionRef = useRef(null)
  const progress = useSectionProgress(sectionRef)
  const trackPosition = progress * (JOURNEY_MILESTONES.length - 1)
  const activeIndex = Math.min(JOURNEY_MILESTONES.length - 1, Math.max(0, Math.round(trackPosition)))
  const beadPoint = getRailPoint(progress)
  const globePhiRef = useRef(-2.2)

  useEffect(() => {
    globePhiRef.current = progress * GLOBE_SCROLL_ROTATION - 2.2
  }, [progress])

  useEffect(() => {
    // Scroll snap intentionally disabled.
  }, [])

  const handleMilestoneSelect = (index) => {
    const section = sectionRef.current
    if (!section) return

    const sectionTop = section.getBoundingClientRect().top + window.scrollY
    const scrollRange = Math.max(section.offsetHeight - window.innerHeight, 1)
    const targetProgress = index / (JOURNEY_MILESTONES.length - 1)

    window.scrollTo({
      top: sectionTop + scrollRange * targetProgress,
      behavior: 'smooth',
    })
  }

  return (
    <section ref={sectionRef} className="home-journey" aria-labelledby="home-journey-title">
      <div className="home-journey__sticky">
        <div className="home-journey__header">
          <p className="home-journey__eyebrow">Built in motion</p>
          <h2 id="home-journey-title" className="home-journey__title"><span>Our journey</span> so far</h2>
        </div>

        <div className="home-journey__stage">
          <div className="home-journey__globe" aria-hidden="true">
            <Globe phiRef={globePhiRef} />
          </div>
          <svg className="home-journey__rail" viewBox="0 0 1200 220" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            <path className="home-journey__rail-path home-journey__rail-path--ghost" d={RAIL_PATH_D} />
            <path className="home-journey__rail-path" d={RAIL_PATH_D} />
            <g className="home-journey__rail-ticks">
              {railTicks.map((tick, index) => (
                <line
                  key={index}
                  x1={tick.coordinateX}
                  y1={tick.coordinateY}
                  x2={tick.tickEndX}
                  y2={tick.tickEndY}
                />
              ))}
            </g>
            <g className="home-journey__rail-checkpoints">
              {JOURNEY_MILESTONES.map((milestone, index) => {
                const ratio = index / (JOURNEY_MILESTONES.length - 1)
                const point = getRailPoint(ratio)
                const isActive = index === activeIndex

                return (
                  <circle
                    key={milestone.phase}
                    className={`home-journey__rail-checkpoint${isActive ? ' is-active' : ''}`}
                    cx={point.coordinateX}
                    cy={point.coordinateY}
                    r={isActive ? 7 : 5}
                  />
                )
              })}
            </g>
            <g
              className="home-journey__rail-bead"
              style={{
                transform: `translate(${beadPoint.coordinateX}px, ${beadPoint.coordinateY}px) rotate(${getRailAngle(progress)}deg)`,
              }}
            >
              <image
                href="/images/satellite-bead.png"
                x="-22"
                y="-22"
                width="44"
                height="44"
                preserveAspectRatio="xMidYMid meet"
              />
            </g>
          </svg>

          <div className="home-journey__cards" role="list" aria-label="MW Futuretech journey milestones">
            {JOURNEY_MILESTONES.map((milestone, index) => {
              const offset = index - trackPosition
              const distance = Math.abs(offset)
              const isActive = index === activeIndex
              const arcPoint = getJourneyTextPoint(0.5 + offset * JOURNEY_ARC_STEP)
              const scale = Math.max(0.64, 1 - distance * 0.13)
              const opacity = Math.max(0.16, 1 - distance * 0.44)

              return (
                <button
                  key={milestone.phase}
                  type="button"
                  role="listitem"
                  className={`home-journey__card${isActive ? ' is-active' : ''}`}
                  aria-label={milestone.title}
                  aria-current={isActive ? 'step' : undefined}
                  tabIndex={distance <= 1.55 ? 0 : -1}
                  onClick={() => handleMilestoneSelect(index)}
                  style={{
                    left: `${(arcPoint.coordinateX / RAIL_VIEWBOX_WIDTH) * 100}%`,
                    top: `${(arcPoint.coordinateY / RAIL_VIEWBOX_HEIGHT) * 100}%`,
                    zIndex: Math.round(20 - distance * 4),
                    pointerEvents: distance > 2.2 ? 'none' : 'auto',
                    opacity,
                    transform: `translate3d(-50%, calc(-100% - var(--journey-text-lift)), 0) scale(${scale})`,
                  }}
                >
                  <span className="home-journey__icon" aria-hidden="true">{milestone.icon}</span>
                  <span className="home-journey__kicker">{milestone.kicker}</span>
                  <strong>{milestone.title}</strong>
                  <span className="home-journey__body">{milestone.body}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}