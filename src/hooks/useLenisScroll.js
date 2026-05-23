import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

const prefersReducedMotion = () => (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
)

export function useLenisScroll({ disabled = false } = {}) {
    const lenisRef = useRef(null)

    useEffect(() => {
        if (disabled || prefersReducedMotion()) return undefined

        const lenis = new Lenis({
            duration: 1.08,
            easing: (time) => Math.min(1, 1.001 - 2 ** (-10 * time)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            syncTouch: false,
            wheelMultiplier: 0.9,
            touchMultiplier: 1.2,
            infinite: false,
        })

        lenisRef.current = lenis

        let frameId = 0
        const raf = (time) => {
            lenis.raf(time)
            frameId = window.requestAnimationFrame(raf)
        }

        frameId = window.requestAnimationFrame(raf)

        return () => {
            window.cancelAnimationFrame(frameId)
            lenis.destroy()
            lenisRef.current = null
        }
    }, [disabled])

    return lenisRef
}