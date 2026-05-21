import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { EXPERTISE_CARDS as expertiseCards } from '../data/expertise.js'
import './ExpertiseSection.css'

const visualBars = [0, 1, 2, 3, 4]
const visualTiles = [0, 1, 2, 3, 4, 5]

const clampProgress = (value) => Math.min(Math.max(value, 0), 1)

const mapScrollRange = (progress, inputStart, inputEnd, outputStart, outputEnd) => {
    const normalized = clampProgress((progress - inputStart) / (inputEnd - inputStart))
    return outputStart + (outputEnd - outputStart) * normalized
}

function usePrefersReducedMotion() {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
        const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches)

        updatePreference()
        mediaQuery.addEventListener('change', updatePreference)
        return () => mediaQuery.removeEventListener('change', updatePreference)
    }, [])

    return prefersReducedMotion
}

function usePinnedScrollProgress(sectionRef) {
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

function getCardMotion(progress, index, totalCards, prefersReducedMotion) {
    const depth = totalCards - index - 1
    const maxDepth = Math.max(totalCards - 1, 1)

    if (prefersReducedMotion) {
        return {
            opacity: 1,
            scale: 1,
            y: 0,
            boxShadow: '0 16px 42px color-mix(in srgb, var(--text) 5%, transparent)',
        }
    }

    const isMobileViewport = typeof window !== 'undefined' && window.innerWidth <= 768
    const revealStart = index * 0.08
    const revealEnd = revealStart + 0.13
    const reveal = mapScrollRange(progress, revealStart, revealEnd, 0, 1)
    const settle = mapScrollRange(progress, 0.72 + index * 0.015, 1, 0, 1)
    const depthRatio = depth / maxDepth
    const stackSoftness = clampProgress(progress * 1.1)
    const shadowLift = Math.round(26 - depthRatio * 11 - stackSoftness * depthRatio * 7)
    const shadowBlur = Math.round(68 - depthRatio * 18 - stackSoftness * depthRatio * 20)
    const shadowSpread = Math.round(2 - depthRatio * 3)
    const shadowStrength = Math.max(3, Math.round(8 - depthRatio * 2 - stackSoftness * depthRatio * 3))

    return {
        opacity: mapScrollRange(reveal, 0, 1, 0.78, 1),
        scale: mapScrollRange(reveal, 0, 1, 0.975, 1) - settle * depth * 0.004,
        y: mapScrollRange(reveal, 0, 1, isMobileViewport ? 18 : 42, 0) + settle * depth * 14,
        boxShadow: `0 ${shadowLift}px ${shadowBlur}px ${shadowSpread}px color-mix(in srgb, var(--text) ${shadowStrength}%, transparent)`,
    }
}

function ExpertiseVisual({ card }) {
    return (
        <div className={`expertise-card__visual expertise-card__visual--${card.type}`} aria-hidden="true">
            <div className="expertise-visual__frame">
                <div className="expertise-visual__header">
                    <span>{card.signal}</span>
                    <strong>{card.metric}</strong>
                </div>

                <div className="expertise-visual__matrix">
                    {visualTiles.map((tile) => (
                        <span key={tile} />
                    ))}
                </div>

                <div className="expertise-visual__bars">
                    {visualBars.map((bar) => (
                        <span key={bar} />
                    ))}
                </div>

                <div className="expertise-visual__route">
                    <span />
                    <span />
                    <span />
                </div>
            </div>
        </div>
    )
}

export default function ExpertiseSection() {
    const sectionRef = useRef(null)
    const progress = usePinnedScrollProgress(sectionRef)
    const prefersReducedMotion = usePrefersReducedMotion()

    return (
        <section ref={sectionRef} className="expertise-showcase" aria-labelledby="expertise-showcase-title">
            <div className="expertise-showcase__top">
                <div className="expertise-showcase__top-inner">
                    <motion.p
                        className="expertise-showcase__eyebrow"
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.7 }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    >
                        Services / Expertise
                    </motion.p>
                    <motion.h2
                        id="expertise-showcase-title"
                        className="expertise-showcase__title"
                        initial={{ opacity: 0, y: 34 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.5 }}
                        transition={{ duration: 0.9, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                    >
                        Where ideas become <em>momentum.</em>
                    </motion.h2>
                    <motion.p
                        className="expertise-showcase__intro"
                        initial={{ opacity: 0, y: 26 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.6 }}
                        transition={{ duration: 0.75, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    >
                        Strategy, design, engineering, and intelligent automation shaped into polished digital systems.
                    </motion.p>
                </div>
            </div>

            <div className="expertise-showcase__cards" aria-label="Service expertise areas">
                <div className="expertise-showcase__cards-container">
                    {expertiseCards.map((card, index) => {
                        const cardMotion = getCardMotion(progress, index, expertiseCards.length, prefersReducedMotion)

                        return (
                            <motion.article
                                key={card.title}
                                className="expertise-card liquid-glass liquid-glass--card"
                                style={cardMotion}
                            >
                                <div className="expertise-card__surface">
                                    <header className="expertise-card__top">
                                        <h3>
                                            <span className="expertise-card__number">{card.number}</span>
                                            <span className="expertise-card__title-text">{card.title}</span>
                                        </h3>
                                        <a
                                            className="expertise-card__action liquid-glass liquid-glass--card liquid-glass-button"
                                            href="/news-events"
                                            aria-label={`Explore ${card.title}`}
                                        >
                                            <span className="expertise-card__action-hover">Explore</span>
                                            <span className="expertise-card__action-arrow" aria-hidden="true" />
                                        </a>
                                    </header>

                                    <div className="expertise-card__middle">
                                        <div className="expertise-card__copy">
                                            <p>{card.description}</p>
                                            <a className="expertise-card__text-link liquid-glass liquid-glass-button" href="/news-events">
                                                Explore
                                            </a>
                                        </div>
                                        <ExpertiseVisual card={card} />
                                    </div>
                                </div>
                            </motion.article>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}