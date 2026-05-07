import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useScroll } from 'motion/react'
import './OffMenuGallery.css'

const PROJECTS = [
  { title: 'Resonant', slug: 'resonant', image: 'https://www.offmenu.design/images/work/resonant/thumbnail-light-xs@2x.webp' },
  { title: 'Control Tower', slug: 'controltower', image: 'https://www.offmenu.design/images/work/controltower/thumbnail-light-xs@2x.webp' },
  { title: 'Ditto', slug: 'ditto', image: 'https://www.offmenu.design/images/work/ditto/thumbnail-light-xs@2x.webp' },
  { title: 'Hanover Park', slug: 'hanover-park', image: 'https://www.offmenu.design/images/work/hanover-park/thumbnail-light-xs@2x.webp' },
  { title: 'Superintelligent', slug: 'super', image: 'https://www.offmenu.design/images/work/super/thumbnail-light-xs@2x.webp' },
  { title: 'Tenacity', slug: 'tenacity', image: 'https://www.offmenu.design/images/work/tenacity/thumbnail-light-xs@2x.webp' },
  { title: 'Utility', slug: 'utility', image: 'https://www.offmenu.design/images/work/utility/thumbnail-light-xs@2x.webp' },
  { title: 'Flex', slug: 'flex', image: 'https://www.offmenu.design/images/work/flex/thumbnail-light-xs@2x.webp' },
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

function SphereField({ projects, progress, onFocusedIndexChange, rotationRef }) {
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

    let frameId = 0
    const count = projects.length

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

        element.style.setProperty('--pos-x', positionX.toString())
        element.style.setProperty('--pos-y', (-positionY).toString())
        element.style.transform = `translate(calc(var(--pos-x) * max(400px, 80cqmin)), calc(var(--pos-y) * max(400px, 80cqmin))) scale(${focusScale * depthScale * hoverScale})`
      })
    }

    frameId = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frameId)
  }, [onFocusedIndexChange, projects.length, rotationRef])

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
                aria-label={project.title}
                onClick={(event) => event.preventDefault()}
                onMouseEnter={() => {
                  hoverIndexRef.current = index
                }}
                onMouseLeave={() => {
                  if (hoverIndexRef.current === index) hoverIndexRef.current = null
                }}
              >
                <img src={project.image} alt="" draggable="false" className="offmenu-gallery__sphere-image" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function WorkTitles({ projects, focusedIndex, visible }) {
  return (
    <div className="offmenu-gallery__titles" style={{ opacity: visible ? 1 : 0 }}>
      <div className="offmenu-gallery__titles-wrap">
        <div className="offmenu-gallery__title-stack">
          {projects.map((project, index) => {
            const active = index === focusedIndex
            const before = index < focusedIndex

            return (
              <div key={project.slug} className={index === 0 ? 'offmenu-gallery__title-item' : 'offmenu-gallery__title-item offmenu-gallery__title-item--stacked'}>
                <h3
                  className="offmenu-gallery__title"
                  style={{
                    transform: `translateY(${active ? 0 : before ? -110 : 110}%)`,
                    opacity: active ? 1 : 0,
                  }}
                >
                  {project.title}
                </h3>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function OrbitalDots({ count, rotationRef }) {
  const rootRef = useRef(null)
  const startRef = useRef(performance.now())

  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined

    const dots = Array.from(root.querySelectorAll('[data-dot-index]'))
    let frameId = 0

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
  }, [count, rotationRef])

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

export default function OffMenuGallery() {
  const sectionRef = useRef(null)
  const rotationRef = useRef(0)
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [controlsVisible, setControlsVisible] = useState(false)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  useEffect(() => {
    const update = (value) => setControlsVisible(value >= 0.2)
    update(scrollYProgress.get())

    return scrollYProgress.on('change', update)
  }, [scrollYProgress])

  return (
    <section ref={sectionRef} className="offmenu-gallery" aria-label="Orbital selected work gallery">
      <div className="offmenu-gallery__stage">
        <SphereField
          projects={PROJECTS}
          progress={scrollYProgress}
          onFocusedIndexChange={setFocusedIndex}
          rotationRef={rotationRef}
        />
        <div className="offmenu-gallery__intro">
          <IntroHeading progress={scrollYProgress} />
        </div>
        <WorkTitles projects={PROJECTS} focusedIndex={focusedIndex} visible={controlsVisible} />
        <OrbitalDots count={PROJECTS.length} rotationRef={rotationRef} />
      </div>
    </section>
  )
}