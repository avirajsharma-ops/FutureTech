import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'motion/react'
import { getDirectorProfile } from '../data/directors'
import './DirectorPage.css'

gsap.registerPlugin(ScrollTrigger)

const ELFSIGHT_PLATFORM_ORIGIN = 'https://elfsightcdn.com'
const ELFSIGHT_PLATFORM_SRC = 'https://elfsightcdn.com/platform.js'
const AVIRAJ_LINKEDIN_FEED_ID = '115030ed-f866-4296-8d18-dd283d434ede'

const sectionReveal = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] },
}

function clampNumber(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function renderRevealWords(text, keyPrefix) {
  return text.split(' ').map((word, index) => (
    <span className="director-hero__statement-word-clip" key={`${keyPrefix}-${word}-${index}`}>
      <span className="director-hero__statement-word">{word}</span>
    </span>
  ))
}

function createHeroLayout(containerRect, viewportHeight, headerBottom = 0) {
  const safeWidth = Math.max(containerRect.width || 0, 320)
  const safeTop = Math.max(containerRect.top || 0, 0)
  const availableHeight = clampNumber(viewportHeight - safeTop, 460, 980)
  const heroHeight = clampNumber(availableHeight, 460, 980)
  const heroNameSize = clampNumber(Math.min(safeWidth * 0.235, heroHeight * 0.305), 86, 230)
  const textInset = clampNumber(safeWidth * 0.085, 24, 132)
  const estimatedHeaderBottom = clampNumber(safeWidth * 0.015, 12, 20) + 64
  const headerClearance = Math.max(headerBottom, estimatedHeaderBottom) + clampNumber(safeWidth * 0.012, 10, 18)
  const firstTop = clampNumber(Math.max(heroHeight * 0.035, headerClearance), 18, 132)
  const lineGap = clampNumber(heroNameSize * 0.92, 82, 224)
  const heroImageWidth = clampNumber(Math.min(safeWidth * 0.46, heroHeight * 0.7) * 1.2, 288, 672)
  const aboutTitleTop = clampNumber(heroHeight * 0.25, 104, 260)

  return {
    '--director-hero-height': `${heroHeight.toFixed(2)}px`,
    '--director-hero-name-size': `${heroNameSize.toFixed(2)}px`,
    '--director-hero-letter-spacing': `${(-heroNameSize * 0.018).toFixed(2)}px`,
    '--director-hero-first-top': `${firstTop.toFixed(2)}px`,
    '--director-hero-last-top': `${(firstTop + lineGap).toFixed(2)}px`,
    '--director-hero-text-inset': `${textInset.toFixed(2)}px`,
    '--director-hero-image-width': `${heroImageWidth.toFixed(2)}px`,
    '--director-hero-image-offset': `${(-heroImageWidth / 2).toFixed(2)}px`,
    '--director-about-title-top': `${aboutTitleTop.toFixed(2)}px`,
  }
}

function injectHeadLink(rel, href, as) {
  if (typeof document === 'undefined') return
  if (document.querySelector(`link[rel="${rel}"][href="${href}"]`)) return

  const linkElement = document.createElement('link')
  linkElement.rel = rel
  linkElement.href = href

  if (as) {
    linkElement.as = as
  }

  if (rel === 'preconnect') {
    linkElement.crossOrigin = 'anonymous'
  }

  document.head.appendChild(linkElement)
}

function DirectorLinkedInFeed() {
  useEffect(() => {
    if (typeof document === 'undefined') return undefined

    injectHeadLink('dns-prefetch', ELFSIGHT_PLATFORM_ORIGIN)
    injectHeadLink('preconnect', ELFSIGHT_PLATFORM_ORIGIN)
    injectHeadLink('preload', ELFSIGHT_PLATFORM_SRC, 'script')

    const existingScript = document.querySelector(`script[src="${ELFSIGHT_PLATFORM_SRC}"]`)

    if (existingScript) return undefined

    const scriptElement = document.createElement('script')
    scriptElement.src = ELFSIGHT_PLATFORM_SRC
    scriptElement.async = true
    scriptElement.fetchPriority = 'high'
    document.body.appendChild(scriptElement)

    return undefined
  }, [])

  return (
    <section className="director-section director-linkedin-feed" aria-label="LinkedIn feed">
      <motion.div className="director-linkedin-feed__shell" {...sectionReveal}>
        <div className="director-linkedin-feed__widget">
          <div
            className={`elfsight-app-${AVIRAJ_LINKEDIN_FEED_ID}`}
          />
        </div>
      </motion.div>
    </section>
  )
}

export default function DirectorPage() {
  const { directorname = '' } = useParams()
  const profile = getDirectorProfile(directorname)
  const isAvirajProfile = profile?.slug === 'aviraj-sharma'
  const heroRef = useRef(null)
  const firstNameRef = useRef(null)
  const lastNameRef = useRef(null)
  const portraitRef = useRef(null)
  const aboutTitleRef = useRef(null)
  const heroStatementRef = useRef(null)
  const [heroLayout, setHeroLayout] = useState({})
  const hasMeasuredHero = Object.keys(heroLayout).length > 0

  useEffect(() => {
    if (!profile) return undefined

    const previousTitle = document.title
    document.title = `${profile.name} | MW Futuretech`

    return () => {
      document.title = previousTitle
    }
  }, [profile])

  useLayoutEffect(() => {
    if (typeof window === 'undefined' || !heroRef.current) return undefined

    let frameId = 0
    const heroElement = heroRef.current

    const syncHeroLayout = () => {
      window.cancelAnimationFrame(frameId)
      frameId = window.requestAnimationFrame(() => {
        const headerBottom = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0
        const nextLayout = createHeroLayout(
          heroElement.getBoundingClientRect(),
          window.innerHeight,
          headerBottom,
        )

        setHeroLayout((currentLayout) => {
          const hasChanged = Object.keys(nextLayout).some(
            (key) => currentLayout[key] !== nextLayout[key],
          )

          return hasChanged ? nextLayout : currentLayout
        })
      })
    }

    syncHeroLayout()

    const resizeObserver = new ResizeObserver(() => {
      syncHeroLayout()
    })

    const headerElement = document.querySelector('.site-header')

    resizeObserver.observe(heroElement)

    if (headerElement) {
      resizeObserver.observe(headerElement)
    }
    window.addEventListener('resize', syncHeroLayout)

    return () => {
      window.cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
      window.removeEventListener('resize', syncHeroLayout)
    }
  }, [])

  useLayoutEffect(() => {
    if (
      typeof window === 'undefined' ||
      !hasMeasuredHero ||
      !heroRef.current ||
      !firstNameRef.current ||
      !lastNameRef.current ||
      !portraitRef.current ||
      !aboutTitleRef.current ||
      !heroStatementRef.current
    ) {
      return undefined
    }

    const heroElement = heroRef.current
    const firstNameElement = firstNameRef.current
    const lastNameElement = lastNameRef.current
    const portraitElement = portraitRef.current
    const aboutTitleElement = aboutTitleRef.current
    const heroStatementElement = heroStatementRef.current
    const statementWordElements = gsap.utils.toArray(
      '.director-hero__statement-word',
      heroStatementElement,
    )
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      gsap.set(aboutTitleElement, { autoAlpha: 1, opacity: 0.1, y: 0, scale: 0.98 })
      gsap.set(heroStatementElement, { autoAlpha: 1, y: 0, clipPath: 'none' })
      gsap.set(statementWordElements, { yPercent: 0, opacity: 1 })
      return undefined
    }

    const context = gsap.context(() => {
      const getPinnedTop = () => {
        const pageElement = heroElement.closest('.director-page')
        const pagePaddingTop = pageElement ? parseFloat(getComputedStyle(pageElement).paddingTop) : 0

        return Math.max(0, Math.round(pagePaddingTop || heroElement.getBoundingClientRect().top))
      }
      const getScrollDistance = () => Math.max(window.innerHeight * 2.55, 1180)
      const getHeroTravel = (ratio) => heroElement.getBoundingClientRect().height * ratio
      const getStatementTravel = () => Math.min(heroElement.getBoundingClientRect().height * 0.34, 260)

      gsap.set([firstNameElement, lastNameElement, portraitElement, aboutTitleElement, heroStatementElement], {
        clearProps: 'transform,opacity,visibility,clipPath',
      })
      gsap.set(aboutTitleElement, {
        autoAlpha: 0,
        y: () => getHeroTravel(0.34),
        scale: 0.96,
      })
      gsap.set(heroStatementElement, {
        autoAlpha: 0,
        y: () => getStatementTravel(),
        clipPath: 'inset(100% 0% 0% 0%)',
      })
      gsap.set(statementWordElements, {
        yPercent: 115,
        opacity: 0,
      })

      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: heroElement,
          start: () => `top top+=${getPinnedTop()}`,
          end: () => `+=${getScrollDistance()}`,
          scrub: 0.85,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })
        .to(firstNameElement, {
          y: () => -getHeroTravel(1.08),
          opacity: 0.08,
          duration: 0.45,
        }, 0)
        .to(lastNameElement, {
          y: () => -getHeroTravel(0.46),
          opacity: 0.26,
          duration: 0.46,
        }, 0)
        .to(lastNameElement, {
          y: () => -getHeroTravel(0.82),
          opacity: 0.08,
          duration: 0.24,
        }, 0.46)
        .to(aboutTitleElement, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.3,
        }, 0.22)
        .to(aboutTitleElement, {
          opacity: 0.1,
          y: 0,
          scale: 0.98,
          duration: 0.28,
        }, 0.58)
        .to(heroStatementElement, {
          autoAlpha: 1,
          y: 0,
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 0.34,
        }, 0.58)
        .to(statementWordElements, {
          yPercent: 0,
          opacity: 1,
          duration: 0.52,
          stagger: {
            each: 0.018,
            from: 'start',
          },
        }, 0.62)

      ScrollTrigger.refresh()
    }, heroElement)

    return () => {
      context.revert()
    }
  }, [hasMeasuredHero, profile?.slug])

  if (!profile) {
    return <Navigate to="/" replace />
  }

  return (
    <div className={`director-page${isAvirajProfile ? ' director-page--aviraj' : ''}`}>
      <h1 className="director-page__sr-only">{profile.name}</h1>

      <section ref={heroRef} className="director-section director-hero" style={heroLayout}>
        <p ref={firstNameRef} className="director-hero__name director-hero__name--first" aria-hidden="true">
          {profile.firstName}
        </p>

        <div ref={portraitRef} className="director-portrait director-portrait--hero">
          <img
            src={profile.image}
            alt={`${profile.name} portrait`}
            loading="eager"
            decoding="async"
            onLoad={() => {
              ScrollTrigger.refresh()
            }}
          />
        </div>

        <div className="director-hero__about-anchor" aria-hidden="true">
          <p ref={aboutTitleRef} className="director-hero__about-title">
            {profile.ghostHeadline}
          </p>
        </div>

        <div className="director-hero__copy">
          <p ref={heroStatementRef} className="director-story__statement director-hero__statement">
            <span className="director-story__accent">
              {renderRevealWords(profile.statementLead, 'hero-lead')}
            </span>{' '}
            <span className="director-story__muted">
              {renderRevealWords(profile.statementBody, 'hero-body')}
            </span>
          </p>
        </div>

        <p
          ref={lastNameRef}
          className="director-hero__name director-hero__name--last"
          aria-hidden="true"
        >
          {profile.lastName}
        </p>

        <div className="director-section__mist" aria-hidden="true" />
      </section>

      {isAvirajProfile ? (
        <DirectorLinkedInFeed />
      ) : (
        <section className="director-section director-story" aria-label="Director statement">
          <motion.div className="director-portrait director-portrait--story" {...sectionReveal}>
            <img src={profile.image} alt="" loading="lazy" decoding="async" aria-hidden="true" />
          </motion.div>

          <motion.div className="director-story__copy" {...sectionReveal}>
            <p className="director-story__eyebrow">
              {profile.role} / {profile.organization}
            </p>
            <p className="director-story__narrative">{profile.narrative}</p>
          </motion.div>
        </section>
      )}
    </div>
  )
}