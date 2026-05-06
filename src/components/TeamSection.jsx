import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import './TeamSection.css'

/**
 * Auto-cycling team card stack. Cards form a tight 4-deep depth stack
 * (same look as /team_card.html). Every CYCLE_MS the stack rotates:
 * the front card slides forward & off, the back card fades up, and
 * everything settles one slot closer to the viewer. On hover the cycle
 * pauses and the stack expands into a flat list. Click a card to open
 * a fullscreen profile modal that scales open from the card's center.
 */

const TEAM = [
  {
    name: 'Aadil Khan',
    role: 'Fullstack Developer',
    quote: '"Code with clarity, ship with intent."',
    img: '/team/Aadil Khan - Fullstack Developer.jpg',
    bio: 'Aadil bridges the front and back ends — turning Figma flows into shipping product and wiring up the APIs that power them. He cares about clean state, fast pages, and making the boring parts disappear.',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
  },
  {
    name: 'Lokesh Dhote',
    role: 'Fullstack Developer',
    quote: '"Simple systems scale the furthest."',
    img: '/team/Lokesh Dhote - Fullstack Developer.jpg',
    bio: 'Lokesh ships across the stack with a bias toward simplicity. He sweats build pipelines, keeps the bundle lean, and obsesses over the moments where UX and infra meet.',
    skills: ['Next.js', 'GraphQL', 'AWS', 'Postgres'],
  },
  {
    name: 'Sahil Sahu',
    role: 'UX / UI Designer',
    quote: '"Design should feel inevitable."',
    img: '/team/Sahil Sahu - UX UI Designer.jpg',
    bio: 'Sahil designs interfaces that feel inevitable — warm, modern, and effortless to use. He works in tight loops with engineering so the pixels we ship match the pixels we drew.',
    skills: ['Figma', 'Design systems', 'Motion', 'Prototyping'],
  },
  {
    name: 'Kushagra Pandey',
    role: 'Cyber Security Specialist',
    quote: '"Trust is built before launch."',
    img: '/team/Kushagra Pandey - Cyber Security Specialist.jpg',
    bio: 'Kushagra hardens everything we build — auth flows, infra, third-party integrations, the works. He treats security as a feature, not a checkbox, and audits each release before it lands.',
    skills: ['AppSec', 'Pen testing', 'Cloud security', 'Threat modeling'],
  },
]

const VISIBLE_COUNT = 4
const CYCLE_MS = 3200

export default function TeamSection() {
  const [offset, setOffset] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [activeIdx, setActiveIdx] = useState(null)
  const [modalOrigin, setModalOrigin] = useState(null)
  const timerRef = useRef(null)

  const isPaused = hovered || activeIdx !== null

  useEffect(() => {
    if (isPaused) return
    timerRef.current = setInterval(() => {
      setOffset((o) => (o + 1) % TEAM.length)
    }, CYCLE_MS)
    return () => clearInterval(timerRef.current)
  }, [isPaused])

  useEffect(() => {
    const onVis = () => {
      if (document.hidden) clearInterval(timerRef.current)
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  useEffect(() => {
    if (activeIdx === null) return
    const onKey = (e) => {
      if (e.key === 'Escape') setActiveIdx(null)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [activeIdx])

  const activeMember = activeIdx !== null ? TEAM[activeIdx] : null
  const viewportWidth = typeof window === 'undefined' ? 1280 : window.innerWidth
  const viewportHeight = typeof window === 'undefined' ? 720 : window.innerHeight
  const modalTargetWidth = Math.min(560, Math.max(viewportWidth - 32, 280))
  const modalInitial = modalOrigin
    ? {
        opacity: 0,
        x: modalOrigin.left + modalOrigin.width / 2 - viewportWidth / 2,
        y: modalOrigin.top + modalOrigin.height / 2 - viewportHeight / 2,
        scale: Math.min(0.98, Math.max(0.72, (modalOrigin.width / modalTargetWidth) * 0.72)),
      }
    : { opacity: 0, scale: 0.94, y: 10 }

  const openProfile = (idx, e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setModalOrigin({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    })
    setActiveIdx(idx)
  }

  return (
    <section className="team-section">
      <div className="team-section__head">
        <p className="team-section__eyebrow">The team</p>
        <h2 className="team-section__title">Builders, thinkers, and quiet operators.</h2>
        <p className="team-section__lead">
          A small bench of engineers, designers, and researchers shipping the
          next generation of intelligent products together.
        </p>
      </div>

      <div className="team-stack-wrap">
        <ul
          className={`team-stack${hovered ? ' is-hovered' : ''}`}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          aria-label="Team members"
        >
          {TEAM.map((m, idx) => {
            // slot 0 = back of stack, slot (VISIBLE_COUNT-1) = front.
            const slot = (idx - offset + TEAM.length) % TEAM.length
            const inStack = slot < VISIBLE_COUNT
            const slotClass = inStack ? `team-card--slot-${slot}` : 'team-card--out'
            return (
              <li
                key={m.name}
                className={`team-card ${slotClass}`}
                style={{ '--i': slot + 1 }}
                aria-hidden={!inStack}
                onClick={(e) => inStack && openProfile(idx, e)}
                role="button"
                tabIndex={inStack ? 0 : -1}
                onKeyDown={(e) => {
                  if (inStack && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault()
                    openProfile(idx, e)
                  }
                }}
              >
                <img src={m.img} alt="" className="team-card__avatar" />
                <div className="team-card__content">
                  <h3>{m.name}</h3>
                  <p className="team-card__quote">{m.quote}</p>
                  <p>{m.role}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <AnimatePresence>
        {activeMember && (
          <motion.div
            key="team-modal-backdrop"
            className="team-modal__backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            onClick={() => setActiveIdx(null)}
          >
            <motion.div
              className="team-modal"
              initial={modalInitial}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={modalInitial}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={`${activeMember.name} profile`}
            >
              <button
                type="button"
                className="team-modal__close"
                onClick={() => setActiveIdx(null)}
                aria-label="Close profile"
              >
                ×
              </button>
              <img
                src={activeMember.img}
                alt={activeMember.name}
                className="team-modal__avatar"
              />
              <div className="team-modal__content">
                <h3>{activeMember.name}</h3>
                <p className="team-modal__quote">{activeMember.quote}</p>
                <p className="team-modal__role">{activeMember.role}</p>
              </div>
              <p className="team-modal__bio">{activeMember.bio}</p>
              <ul className="team-modal__skills">
                {activeMember.skills.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
