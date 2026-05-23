import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useScroll } from 'motion/react'
import {
  BarChart3,
  Bot,
  Cloud,
  Code2,
  Cpu,
  Database,
  Globe,
  Server,
  ShieldCheck,
  Smartphone,
  Workflow,
  Zap,
} from 'lucide-react'
import './OffMenuGallery.css'

const STACK_ICON_MAP = {
  react: { label: 'React', Icon: Code2 },
  vite: { label: 'Vite', Icon: Zap },
  node: { label: 'Node.js', Icon: Server },
  express: { label: 'Express', Icon: Workflow },
  postgres: { label: 'PostgreSQL', Icon: Database },
  mongodb: { label: 'MongoDB', Icon: Database },
  redis: { label: 'Redis', Icon: Database },
  aws: { label: 'AWS', Icon: Cloud },
  gcp: { label: 'GCP', Icon: Cloud },
  mobile: { label: 'Mobile', Icon: Smartphone },
  ai: { label: 'AI', Icon: Bot },
  analytics: { label: 'Analytics', Icon: BarChart3 },
  iot: { label: 'IoT', Icon: Cpu },
  web: { label: 'Web', Icon: Globe },
  secure: { label: 'Security', Icon: ShieldCheck },
}

const PROJECTS = [
  {
    title: 'Gurujii AI Companion',
    slug: 'gurujii-ai-companion',
    image: '/mockups/Mockup%201.webp',
    category: 'AI avatar experience',
    description: 'A conversational spiritual guide experience with live face detection, voice interaction, and an immersive mobile-first flow.',
    details: ['Realtime AI conversation', 'Character-led voice UX', 'Mobile app interface'],
    stack: ['react', 'vite', 'node', 'ai', 'mobile'],
  },
  {
    title: 'Poonam Sagar Wellness',
    slug: 'poonam-sagar-wellness',
    image: '/mockups/Mockup%20Scene%204.webp',
    category: 'Health and wellness platform',
    description: 'A polished digital presence for diet consultation, appointment booking, and conversion-focused wellness discovery.',
    details: ['Responsive marketing site', 'Appointment funnel', 'Wellness brand system'],
    stack: ['web', 'react', 'vite', 'analytics', 'secure'],
  },
  {
    title: 'Tallo Productivity OS',
    slug: 'tallo-productivity-os',
    image: '/mockups/Mockup%20Ribbon%206.webp',
    category: 'AI productivity workspace',
    description: 'A sharp SaaS interface for planning, visibility, and team workflows, built around fast scanning and confident action.',
    details: ['SaaS dashboard design', 'Task workflow UX', 'AI planning surface'],
    stack: ['react', 'node', 'postgres', 'analytics', 'ai'],
  },
  {
    title: 'MedFlow HMS',
    slug: 'medflow-hms',
    image: '/mockups/Mockup%205.webp',
    category: 'Hospital management system',
    description: 'A hospital operations platform for bed management, role-based access, revenue analytics, and real-time care coordination.',
    details: ['Operations dashboard', 'Role-based access', 'Revenue analytics'],
    stack: ['react', 'node', 'postgres', 'secure', 'analytics'],
  },
  {
    title: 'Mayalogy',
    slug: 'mayalogy',
    image: '/mockups/Mockup%207.webp',
    category: 'Astrology AI assistant',
    description: 'A dual-device conversational astrology product with guided onboarding, Hindi-first content, and a premium dark interface.',
    details: ['Conversational AI', 'Native mobile flows', 'Hindi-first experience'],
    stack: ['mobile', 'ai', 'react', 'node', 'aws'],
  },
  {
    title: 'AlgaeTree Control Center',
    slug: 'algaetree-control-center',
    image: '/mockups/Mockup%2012.webp',
    category: 'IoT monitoring dashboard',
    description: 'A device control center for bio-reactor monitoring, system health, and environmental controls across connected hardware.',
    details: ['IoT device controls', 'Sensor health tracking', 'Environmental automation'],
    stack: ['iot', 'react', 'node', 'mongodb', 'cloud'],
  },
  {
    title: 'Canact Social Motion',
    slug: 'canact-social-motion',
    image: '/mockups/Mockup%2013.webp',
    category: 'Social impact mobile app',
    description: 'A location-aware social product that turns community actions into measurable impact with scores, discovery, and progress loops.',
    details: ['Location-aware UX', 'Impact scoring', 'Mobile community flows'],
    stack: ['mobile', 'react', 'node', 'analytics', 'gcp'],
  },
  {
    title: 'DubWala',
    slug: 'dubwala',
    image: '/mockups/Mockup%20Scene%206.webp',
    category: 'AI video dubbing tool',
    description: 'A creator workflow for uploading video or audio, selecting target languages, and generating multilingual voice output.',
    details: ['AI dubbing workflow', 'Multilingual selection', 'Creator upload system'],
    stack: ['ai', 'react', 'node', 'aws', 'web'],
  },
]

const TAU = Math.PI * 2
const SPRING_STEP = 1 / 120
const TAGLINE = 'AI-native studio building brands and web experiences for high-growth startups'

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value))
}

function interpolate(value, input, output) {
  if (value <= input[0]) return output[0]

  for (let index = 1; index < input.length; index += 1) {
    if (value <= input[index]) {
      const range = input[index] - input[index - 1]
      const amount = range === 0 ? 0 : (value - input[index - 1]) / range
      return output[index - 1] + (output[index] - output[index - 1]) * amount
    }
  }

  return output[output.length - 1]
}

function smootherstep(value) {
  return value * value * value * (value * (value * 6 - 15) + 10)
}

function stepSpring(state, target, stiffness, damping, mass, seconds) {
  const displacement = state.value - target
  const force = -stiffness * displacement - damping * state.velocity
  const velocity = state.velocity + (force / mass) * seconds

  return {
    value: state.value + velocity * seconds,
    velocity,
  }
}

function easeOutQuart(value) {
  return 1 - Math.pow(1 - value, 4)
}

function easeOutPower2(value) {
  return 1 - Math.pow(1 - value, 2)
}

function wrapIndex(value, count) {
  return ((value % count) + count) % count
}

function useElementVisibility(ref, rootMargin = '0px') {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin, threshold: 0.01 },
    )
    observer.observe(node)

    return () => observer.disconnect()
  }, [ref, rootMargin])

  return visible
}

function getRotationTarget(progress, count) {
  if (progress <= 0.2) {
    return -(progress / 0.2) * TAU
  }

  const step = Math.round(((progress - 0.2) / 0.8) * count) % count
  return -TAU - step * (TAU / count)
}

function IntroHeading({ progress }) {
  const words = useMemo(() => TAGLINE.split(' '), [])
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const update = (value) => setVisible(value < 0.15)
    update(progress.get())

    return progress.on('change', update)
  }, [progress])

  return (
    <h2 className="offmenu-gallery__intro-heading">
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className="offmenu-gallery__word-clip">
          <motion.span
            className="offmenu-gallery__word"
            initial={{ y: '115%' }}
            animate={{ y: visible ? '0%' : '115%' }}
            transition={{
              duration: 0.6,
              delay: visible ? 0.5 + index * 0.03 : (words.length - index) * 0.02,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}&nbsp;
          </motion.span>
        </span>
      ))}
    </h2>
  )
}

function SphereField({ projects, progress, onFocusedIndexChange, onProjectOpen, rotationRef, active }) {
  const rootRef = useRef(null)
  const containerRef = useRef(null)
  const spheresRef = useRef([])
  const focusedSmoothRef = useRef(0)
  const focusedRef = useRef(-1)
  const targetRotationRef = useRef(getRotationTarget(progress.get(), projects.length))
  const targetTiltYRef = useRef(interpolate(progress.get(), [0, 0.2, 1], [-0.6, 0, 0]))
  const targetTiltXRef = useRef(interpolate(progress.get(), [0, 0.2, 1], [0.5236, 0, 0]))
  const rotationStateRef = useRef({ value: 0, velocity: 0 })
  const tiltYStateRef = useRef({ value: -0.6, velocity: 0 })
  const tiltXStateRef = useRef({ value: 0.5236, velocity: 0 })
  const initialZoom = progress.get() >= 0.2 ? 1 : 0
  const zoomTweenRef = useRef({ from: 0, to: initialZoom, value: initialZoom, start: performance.now() })
  const hoverScaleRef = useRef(new Map())
  const hoverIndexRef = useRef(null)
  const lastTimeRef = useRef(performance.now())
  const introStartRef = useRef(performance.now())

  useEffect(() => {
    const update = (value) => {
      targetRotationRef.current = getRotationTarget(value, projects.length)
      targetTiltYRef.current = interpolate(value, [0, 0.2, 1], [-0.6, 0, 0])
      targetTiltXRef.current = interpolate(value, [0, 0.2, 1], [0.5236, 0, 0])

      const nextZoom = value >= 0.2 ? 1 : 0
      if (nextZoom !== zoomTweenRef.current.to) {
        zoomTweenRef.current = {
          from: zoomTweenRef.current.value,
          to: nextZoom,
          value: zoomTweenRef.current.value,
          start: performance.now(),
        }
      }
    }

    update(progress.get())

    return progress.on('change', update)
  }, [progress, projects.length])

  useEffect(() => {
    if (!rootRef.current || !containerRef.current) return undefined
    if (!active) return undefined

    let frameId = 0
    const count = projects.length
    lastTimeRef.current = performance.now()
    introStartRef.current = performance.now()

    const tick = (time) => {
      frameId = requestAnimationFrame(tick)

      let elapsed = Math.min(Math.max(0, (time - lastTimeRef.current) / 1000), 0.1)
      lastTimeRef.current = time

      while (elapsed > 0) {
        const step = Math.min(elapsed, SPRING_STEP)
        rotationStateRef.current = stepSpring(rotationStateRef.current, targetRotationRef.current, 60, 25, 0.8, step)
        tiltYStateRef.current = stepSpring(tiltYStateRef.current, targetTiltYRef.current, 100, 30, 0.5, step)
        tiltXStateRef.current = stepSpring(tiltXStateRef.current, targetTiltXRef.current, 100, 30, 0.5, step)
        elapsed -= step
      }

      const zoomTween = zoomTweenRef.current
      const zoomElapsed = clamp((time - zoomTween.start) / 1500)
      const zoom = zoomTween.from + (zoomTween.to - zoomTween.from) * easeOutPower2(zoomElapsed)
      zoomTween.value = zoom

      const introElapsed = clamp((time - introStartRef.current) / 3000)
      const introRotation = Math.PI * (1 - easeOutQuart(introElapsed))
      const rotation = rotationStateRef.current.value + introRotation
      const tiltY = clamp(tiltYStateRef.current.value, -0.75, 0.75)
      const tiltX = clamp(tiltXStateRef.current.value, -0.75, 0.75)
      const container = containerRef.current

      if (!container) return

      rotationRef.current = rotationStateRef.current.value
      container.style.setProperty('--rotation-deg', `${(rotation * 180) / Math.PI}deg`)
      container.style.setProperty('--container-scale', `${0.5 + 0.5 * zoom}`)
      container.style.setProperty('--zoom-offset', `calc(${zoom} * max(400px, 80cqmin))`)
      container.style.setProperty('--tilt-offset-x', `${5 * tiltY}%`)
      container.style.setProperty('--tilt-offset-y', `${-(5 * tiltX)}%`)
      container.style.setProperty('--sphere-size-scale', `${0.6 + 0.4 * zoom}`)

      const rawFocus = wrapIndex(-rotation / (TAU / count), count)
      const focusedIndex = Math.round(rawFocus) % count
      const previousSmoothFocus = focusedSmoothRef.current
      let focusDelta = focusedIndex - previousSmoothFocus

      if (Math.abs(focusDelta) > count / 2) {
        focusDelta += focusDelta > 0 ? -count : count
      }

      focusedSmoothRef.current = wrapIndex(previousSmoothFocus + 0.05 * focusDelta, count)

      if (focusedIndex !== focusedRef.current) {
        focusedRef.current = focusedIndex
        onFocusedIndexChange(focusedIndex)
      }

      spheresRef.current.forEach((element, index) => {
        if (!element) return

        let focusDistance = Math.abs(index - focusedSmoothRef.current)
        if (focusDistance > count / 2) focusDistance = count - focusDistance

        const limitedDistance = Math.min(focusDistance, 1)
        const maxScale = 1.5 + 0.5 * zoom
        const focusScale = maxScale - smootherstep(limitedDistance) * (maxScale - 1)
        const angle = (index / count) * TAU + rotation + Math.PI
        let positionX = Math.cos(angle)
        let positionY = Math.sin(angle)
        let depth = 0

        const tiltYCos = Math.cos(tiltY)
        const tiltYSin = Math.sin(tiltY)
        const nextPositionX = positionX * tiltYCos + depth * tiltYSin
        const nextDepth = -positionX * tiltYSin + depth * tiltYCos
        positionX = nextPositionX
        depth = nextDepth

        const tiltXCos = Math.cos(tiltX)
        const tiltXSin = Math.sin(tiltX)
        const nextPositionY = positionY * tiltXCos - depth * tiltXSin
        depth = positionY * tiltXSin + depth * tiltXCos
        positionY = nextPositionY

        const depthScale = 1 + 0.1 * depth
        const hoverTarget = hoverIndexRef.current === index ? 1.1 : 1
        const previousHoverScale = hoverScaleRef.current.get(index) ?? 1
        const hoverScale = previousHoverScale + (hoverTarget - previousHoverScale) * 0.15
        hoverScaleRef.current.set(index, hoverScale)

        // Fade spheres near top/bottom of the orbit — only once they enter large/zoomed mode.
        const verticalAbs = Math.abs(positionY)
        const edgeFade = 1 - clamp((verticalAbs - 0.34) / 0.55)
        const fadedOpacity = 0.08 + 0.92 * smootherstep(edgeFade)
        const sphereOpacity = 1 - (1 - fadedOpacity) * zoom

        element.style.setProperty('--pos-x', positionX.toString())
        element.style.setProperty('--pos-y', (-positionY).toString())
        element.style.transform = `translate(calc(var(--pos-x) * max(400px, 80cqmin)), calc(var(--pos-y) * max(400px, 80cqmin))) scale(${focusScale * depthScale * hoverScale})`
        element.style.opacity = sphereOpacity.toFixed(3)
      })
    }

    frameId = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frameId)
  }, [active, onFocusedIndexChange, projects.length, rotationRef])

  return (
    <motion.div
      ref={rootRef}
      className="offmenu-gallery__sphere-layer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
    >
      <div className="offmenu-gallery__sphere-center">
        <div ref={containerRef} className="offmenu-gallery__sphere-container">
          <div className="offmenu-gallery__sphere-grid">
            {projects.map((project, index) => (
              <a
                key={project.slug}
                ref={(element) => {
                  spheresRef.current[index] = element
                }}
                data-sphere-index={index}
                href={`#${project.slug}`}
                className="offmenu-gallery__sphere"
                aria-label={`Open ${project.title} project details`}
                onClick={(event) => {
                  event.preventDefault()
                  const origin = event.currentTarget.getBoundingClientRect()
                  onProjectOpen(project, {
                    centerX: origin.left + origin.width / 2,
                    centerY: origin.top + origin.height / 2,
                    radius: Math.max(origin.width, origin.height) / 2,
                    endRadius: Math.hypot(
                      Math.max(origin.left + origin.width / 2, window.innerWidth - (origin.left + origin.width / 2)),
                      Math.max(origin.top + origin.height / 2, window.innerHeight - (origin.top + origin.height / 2)),
                    ),
                  })
                }}
                onMouseEnter={() => {
                  hoverIndexRef.current = index
                }}
                onMouseLeave={() => {
                  if (hoverIndexRef.current === index) hoverIndexRef.current = null
                }}
              >
                <img src={active ? project.image : undefined} alt="" draggable="false" loading="lazy" decoding="async" className="offmenu-gallery__sphere-image" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function ProjectSidePanels({ projects, focusedIndex, settledIndex, visible }) {
  const activeIndex = settledIndex ?? focusedIndex
  const project = projects[activeIndex]

  return (
    <div className="offmenu-gallery__project-meta" style={{ opacity: visible ? 1 : 0 }}>
      <AnimatePresence mode="wait">
        {visible && settledIndex !== null && project ? (
          <motion.div
            key={project.slug}
            className="offmenu-gallery__project-meta-grid"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.aside
              className="offmenu-gallery__meta-card offmenu-gallery__meta-card--left"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="offmenu-gallery__meta-eyebrow">Project Snapshot</p>
              <h3 className="offmenu-gallery__meta-title">{project.title}</h3>
              <p className="offmenu-gallery__meta-description">{project.description}</p>
            </motion.aside>

            <motion.aside
              className="offmenu-gallery__meta-card offmenu-gallery__meta-card--right"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="offmenu-gallery__meta-eyebrow">Stack Used</p>
              <ul className="offmenu-gallery__stack-list" aria-label="Project technology stack">
                {project.stack.map((stackKey) => {
                  const stackMeta = STACK_ICON_MAP[stackKey]
                  if (!stackMeta) return null
                  const Icon = stackMeta.Icon

                  return (
                    <li key={`${project.slug}-${stackKey}`} className="offmenu-gallery__stack-pill">
                      <span className="offmenu-gallery__stack-icon" aria-hidden="true">
                        <Icon size={14} strokeWidth={2.1} />
                      </span>
                      <span>{stackMeta.label}</span>
                    </li>
                  )
                })}
              </ul>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function OrbitalDots({ count, rotationRef, active }) {
  const rootRef = useRef(null)
  const startRef = useRef(performance.now())

  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined
    if (!active) return undefined

    const dots = Array.from(root.querySelectorAll('[data-dot-index]'))
    let frameId = 0
    startRef.current = performance.now()

    const tick = (time) => {
      frameId = requestAnimationFrame(tick)

      const introElapsed = clamp((time - startRef.current) / 3000)
      const introRotation = 0.5 * Math.PI * (1 - easeOutQuart(introElapsed))
      const rotation = rotationRef.current + introRotation + Math.PI
      const activeIndex = Math.round(wrapIndex(-rotation / (TAU / count), count)) % count
      const dotSize = Math.min(5, ((TAU * 18) / count) * 0.6)

      dots.forEach((dot, index) => {
        const angle = (index / count) * TAU + rotation + Math.PI
        const offsetX = 18 * Math.cos(angle)
        const offsetY = -18 * Math.sin(angle)
        const active = index === activeIndex

        dot.style.transform = `translate(${offsetX}px, ${offsetY}px)`
        dot.style.width = `${dotSize}px`
        dot.style.height = `${dotSize}px`
        dot.style.marginLeft = `${-dotSize / 2}px`
        dot.style.marginTop = `${-dotSize / 2}px`
        dot.style.backgroundColor = active ? 'currentColor' : 'transparent'
        dot.style.border = active ? 'none' : '1px solid currentColor'
        dot.style.opacity = active ? '1' : '0.4'
      })
    }

    frameId = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frameId)
  }, [active, count, rotationRef])

  return (
    <div className="offmenu-gallery__dots" ref={rootRef} aria-hidden="true">
      <div className="offmenu-gallery__dots-inner">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} data-dot-index={index} className="offmenu-gallery__dot" />
        ))}
      </div>
    </div>
  )
}

function ProjectDetailOverlay({ activeProject, onClose }) {
  useEffect(() => {
    if (!activeProject) return undefined

    const previousOverflow = document.body.style.overflow
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [activeProject, onClose])

  return (
    <AnimatePresence>
      {activeProject && (
        <motion.div
          className="offmenu-project"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
        >
          <button
            type="button"
            className="offmenu-project__backdrop"
            aria-label="Close project details"
            onClick={onClose}
          />
          <motion.div
            className="offmenu-project__reveal"
            initial={{
              clipPath: `circle(${activeProject.origin.radius}px at ${activeProject.origin.centerX}px ${activeProject.origin.centerY}px)`,
            }}
            animate={{
              clipPath: `circle(${activeProject.origin.endRadius}px at ${activeProject.origin.centerX}px ${activeProject.origin.centerY}px)`,
            }}
            exit={{
              clipPath: `circle(${activeProject.origin.radius}px at ${activeProject.origin.centerX}px ${activeProject.origin.centerY}px)`,
            }}
            transition={{ duration: 0.68, ease: [0.16, 1, 0.3, 1] }}
          >
            <article
              className="offmenu-project__card"
              role="dialog"
              aria-modal="true"
              aria-labelledby={`offmenu-project-title-${activeProject.project.slug}`}
            >
              <div className="offmenu-project__media">
                <img src={activeProject.project.image} alt={`${activeProject.project.title} mockup`} loading="lazy" decoding="async" />
              </div>

              <motion.div
                className="offmenu-project__content"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.3, delay: 0.18, ease: 'easeOut' }}
              >
                <button
                  type="button"
                  className="offmenu-project__close liquid-glass liquid-glass--circle liquid-glass-button"
                  aria-label="Close project details"
                  onClick={onClose}
                >
                  <span aria-hidden="true">×</span>
                </button>
                <p className="offmenu-project__eyebrow">{activeProject.project.category}</p>
                <h2 id={`offmenu-project-title-${activeProject.project.slug}`}>{activeProject.project.title}</h2>
                <p className="offmenu-project__description">{activeProject.project.description}</p>
                <div className="offmenu-project__details" aria-label="Project highlights">
                  {activeProject.project.details.map((detail) => (
                    <span key={detail}>{detail}</span>
                  ))}
                </div>
              </motion.div>
            </article>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function OffMenuGallery() {
  const sectionRef = useRef(null)
  const rotationRef = useRef(0)
  const galleryActive = useElementVisibility(sectionRef)
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [settledIndex, setSettledIndex] = useState(null)
  const [controlsVisible, setControlsVisible] = useState(false)
  const [activeProject, setActiveProject] = useState(null)
  const audioCtxRef = useRef(null)
  const lastTickTimeRef = useRef(0)
  const previousFocusedIndexRef = useRef(0)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  const playScrollTick = useCallback(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    const now = performance.now()
    if (now - lastTickTimeRef.current < 90) return
    lastTickTimeRef.current = now

    try {
      const AudioCtor = window.AudioContext || window.webkitAudioContext
      if (!AudioCtor) return
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtor()
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') ctx.resume()

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = 1320
      gain.gain.setValueAtTime(0.0001, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.03, ctx.currentTime + 0.005)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05)
      osc.connect(gain).connect(ctx.destination)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.06)
    } catch {
      // Audio is optional for scroll feedback.
    }
  }, [])

  useEffect(() => {
    const update = (value) => setControlsVisible(value >= 0.2)
    update(scrollYProgress.get())

    return scrollYProgress.on('change', update)
  }, [scrollYProgress])

  useEffect(() => {
    if (!controlsVisible) {
      setSettledIndex(null)
      return undefined
    }

    setSettledIndex(null)
    const timer = window.setTimeout(() => {
      setSettledIndex(focusedIndex)
    }, 1500)

    return () => window.clearTimeout(timer)
  }, [focusedIndex, controlsVisible])

  useEffect(() => {
    if (!controlsVisible) {
      previousFocusedIndexRef.current = focusedIndex
      return
    }

    if (previousFocusedIndexRef.current !== focusedIndex) {
      playScrollTick()
      previousFocusedIndexRef.current = focusedIndex
    }
  }, [controlsVisible, focusedIndex, playScrollTick])

  useEffect(() => () => {
    if (!audioCtxRef.current) return
    try {
      audioCtxRef.current.close()
    } catch {
      // ignore close failures
    }
  }, [])

  return (
    <section ref={sectionRef} className="offmenu-gallery" aria-label="Orbital selected work gallery">
      <div className="offmenu-gallery__stage">
        <SphereField
          projects={PROJECTS}
          progress={scrollYProgress}
          onFocusedIndexChange={setFocusedIndex}
          onProjectOpen={(project, origin) => setActiveProject({ project, origin })}
          rotationRef={rotationRef}
          active={galleryActive}
        />
        <div className="offmenu-gallery__intro">
          <IntroHeading progress={scrollYProgress} />
        </div>
        <ProjectSidePanels
          projects={PROJECTS}
          focusedIndex={focusedIndex}
          settledIndex={settledIndex}
          visible={controlsVisible}
        />
        <OrbitalDots count={PROJECTS.length} rotationRef={rotationRef} active={galleryActive} />
      </div>
      <ProjectDetailOverlay activeProject={activeProject} onClose={() => setActiveProject(null)} />
    </section>
  )
}