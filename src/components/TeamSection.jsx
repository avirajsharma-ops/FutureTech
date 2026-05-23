import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { TEAM } from '../data/team.js'
import './TeamSection.css'

/**
 * Auto-cycling team card stack. Cards form a tight 4-deep depth stack
 * (same look as /team_card.html). Every CYCLE_MS the stack rotates:
 * the front card slides forward & off, the back card fades up, and
 * everything settles one slot closer to the viewer. On hover the cycle
 * pauses and the stack expands into a flat list. Click a card to open
 * a fullscreen profile modal that scales open from the card's center.
 */

const VISIBLE_COUNT = 6
const CYCLE_MS = 3200

export default function TeamSection() {
  const [offset, setOffset] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [activeIdx, setActiveIdx] = useState(null)
  const [modalOrigin, setModalOrigin] = useState(null)
  const timerRef = useRef(null)
  const hoverLeaveTimerRef = useRef(null)

  const handleStackEnter = () => {
    if (hoverLeaveTimerRef.current) {
      clearTimeout(hoverLeaveTimerRef.current)
      hoverLeaveTimerRef.current = null
    }
    setHovered(true)
  }

  const handleStackLeave = () => {
    if (hoverLeaveTimerRef.current) clearTimeout(hoverLeaveTimerRef.current)
    hoverLeaveTimerRef.current = setTimeout(() => {
      setHovered(false)
      hoverLeaveTimerRef.current = null
    }, 2000)
  }

  useEffect(() => () => {
    if (hoverLeaveTimerRef.current) clearTimeout(hoverLeaveTimerRef.current)
  }, [])

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
      if (e.key === 'ArrowLeft') {
        setModalOrigin(null)
        setActiveIdx((idx) => (idx === null ? idx : (idx - 1 + TEAM.length) % TEAM.length))
      }
      if (e.key === 'ArrowRight') {
        setModalOrigin(null)
        setActiveIdx((idx) => (idx === null ? idx : (idx + 1) % TEAM.length))
      }
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
  const modalTargetWidth = Math.min(1040, Math.max(viewportWidth - 32, 320))
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

  const moveProfile = (direction) => {
    setModalOrigin(null)
    setActiveIdx((idx) => (idx === null ? idx : (idx + direction + TEAM.length) % TEAM.length))
  }

  const getModalSlideOffset = (idx) => {
    if (activeIdx === null) return 0
    let distance = idx - activeIdx
    if (distance > TEAM.length / 2) distance -= TEAM.length
    if (distance < -TEAM.length / 2) distance += TEAM.length
    return distance
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
          onMouseEnter={handleStackEnter}
          onMouseLeave={handleStackLeave}
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
                <img src={m.img} alt="" loading="lazy" decoding="async" className="team-card__avatar" />
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
              className="team-modal__slider-shell"
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
              <button
                type="button"
                className="team-modal__nav team-modal__nav--prev"
                onClick={() => moveProfile(-1)}
                aria-label="Show previous team member"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M15 5 8 12l7 7" />
                </svg>
              </button>
              <div className="team-modal__slider" aria-live="polite">
                {TEAM.map((member, idx) => {
                  const slideOffset = getModalSlideOffset(idx)
                  const isActive = idx === activeIdx
                  return (
                    <article
                      key={member.name}
                      className={`team-modal${isActive ? ' is-active' : ''}`}
                      style={{
                        '--slide-offset': slideOffset,
                        '--slide-distance': Math.abs(slideOffset),
                        '--slide-z': TEAM.length - Math.abs(slideOffset),
                      }}
                      aria-hidden={!isActive}
                      onClick={() => {
                        if (!isActive) {
                          setModalOrigin(null)
                          setActiveIdx(idx)
                        }
                      }}
                    >
                      <div className="team-modal__inner">
                        <img
                          className="team-modal__cover"
                          src={member.img}
                          alt={member.name}
                        />
                        <div className="team-modal__body">
                          <h2 className="team-modal__header">
                            <span className="team-modal__chips">
                              {member.name}
                              <svg className="team-modal__icon" aria-hidden="true">
                                <use xlinkHref="#team-icon-check" />
                              </svg>
                            </span>
                          </h2>
                          <p className="team-modal__role-line">{member.role}</p>
                          <div className="team-modal__details">
                          <p className="team-modal__tagline">{member.quote}</p>
                          <p className="team-modal__bio">{member.bio}</p>
                          <p className="team-modal__meta">
                            <span className="team-modal__chips">
                              <svg className="team-modal__icon" aria-hidden="true">
                                <use xlinkHref="#team-icon-user" />
                              </svg>
                              {member.role}
                            </span>
                            <span className="team-modal__chips">
                              <svg className="team-modal__icon" aria-hidden="true">
                                <use xlinkHref="#team-icon-cards" />
                              </svg>
                              {member.skills.length}
                            </span>
                            <button
                              type="button"
                              className="team-modal__button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveIdx(null)
                              }}
                              tabIndex={isActive ? 0 : -1}
                            >
                              Connect
                              <svg className="team-modal__icon" aria-hidden="true">
                                <use xlinkHref="#team-icon-plus" />
                              </svg>
                            </button>
                          </p>
                          <ul className="team-modal__skills">
                            {member.skills.map((s) => (
                              <li key={s}>{s}</li>
                            ))}
                          </ul>
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
              <button
                type="button"
                className="team-modal__nav team-modal__nav--next"
                onClick={() => moveProfile(1)}
                aria-label="Show next team member"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m9 5 7 7-7 7" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute' }}>
        <symbol id="team-icon-plus" viewBox="0 -960 960 960">
          <path fill="currentColor" d="M453-140v-313H140v-54h313v-313h54v313h313v54H507v313h-54Z" />
        </symbol>
        <symbol id="team-icon-user" viewBox="0 -960 960 960">
          <path fill="currentColor" d="M480-524q-54.55 0-92.27-37.72Q350-599.45 350-654q0-54.55 37.73-92.28Q425.45-784 480-784t92.28 37.72Q610-708.55 610-654q0 54.55-37.72 92.28Q534.55-524 480-524ZM182-171v-83q0-29 15.69-52.85Q213.38-330.71 240-344q59-29 119.41-43.5t120.5-14.5q60.09 0 120.59 14.5T720-344q26.63 13.29 42.31 37.15Q778-283 778-254v83H182Zm54-54h488v-29q0-14-7.5-24.5T695-296q-49-23-105.19-37.5Q533.63-348 480-348t-109.81 14Q314-320 265-296q-14 6-21.5 17t-7.5 25v29Zm244-353q32 0 54-22t22-54q0-32-22-54t-54-22q-32 0-54 22t-22 54q0 32 22 54t54 22Zm0-76Zm0 429Z" />
        </symbol>
        <symbol id="team-icon-cards" viewBox="0 -960 960 960">
          <path fill="currentColor" d="m493-469 87-52 87 52-24-98 77-67-101-9-39-92-39 92-101 9 77 67-24 98Zm129 257h118q9 18-10.5 28.5T691-170l-447 58q-36 3-63.4-18.65Q153.19-152.3 149-188l-49-382q-4-36 18.35-64.86Q140.7-663.71 177-667l33-1v54l-28 1q-14 1-22 11.5t-6 24.5l48 383q2 14 12 22t24 6l384-46Zm-246-80q-36.73 0-61.36-24.64Q290-341.27 290-378v-408q0-36.72 24.64-61.36Q339.27-872 376-872h408q36.72 0 61.36 24.64T870-786v408q0 36.73-24.64 61.36Q820.72-292 784-292H376Zm0-54h408q14 0 23-9t9-23v-408q0-14-9-23t-23-9H376q-14 0-23 9t-9 23v408q0 14 9 23t23 9Zm204-236ZM196-162Z" />
        </symbol>
        <symbol id="team-icon-check" viewBox="0 -960 960 960">
          <path fill="currentColor" d="m443-429 169-169-38-39-131 132-57-56-38 38 95 94ZM222-160v-578q0-36.72 24.64-61.36Q271.27-824 308-824h344q36.72 0 61.36 24.64T738-738v578L480-270 222-160Zm54-82 204-87.66L684-242v-496q0-12-10-22t-22-10H308q-12 0-22 10t-10 22v496Zm0-528h408-408Z" />
        </symbol>
      </svg>
    </section>
  )
}
