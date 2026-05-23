import { Component, Suspense, lazy, useEffect, useRef, useState } from 'react'
import './SplineScene.css'

const SCENE_URL = 'https://prod.spline.design/zjCzTLsdWd0YEZ1f/scene.splinecode'
const Spline = lazy(() => import('@splinetool/react-spline'))

function canRunSplineScene() {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false
    if (window.innerWidth <= 768) return false
    if ((navigator.hardwareConcurrency || 8) <= 4) return false
    if ((navigator.deviceMemory || 8) <= 4) return false
    return true
}

class ErrorBoundary extends Component {
    state = { hasError: false }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    componentDidCatch(error, info) {
        console.error('[SplineScene] Render error:', error, info)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="spline-scene__fallback">
                    3D scene failed to load.
                </div>
            )
        }

        return this.props.children
    }
}

function Loader() {
    return (
        <div className="spline-scene__loader" aria-label="Loading 3D scene">
            <div className="spline-scene__spinner" />
        </div>
    )
}

export default function SplineScene({ style, className, onLoad }) {
    const rootRef = useRef(null)
    const [loading, setLoading] = useState(true)
    const [canRunSpline] = useState(canRunSplineScene)
    const [shouldMount, setShouldMount] = useState(false)
    const rootClassName = ['spline-scene', className].filter(Boolean).join(' ')

    useEffect(() => {
        if (!canRunSpline) return undefined
        const node = rootRef.current
        if (!node) return undefined

        if (typeof IntersectionObserver === 'undefined') {
            setShouldMount(true)
            return undefined
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                setShouldMount(entry.isIntersecting)
            },
            { rootMargin: '0px', threshold: 0.01 },
        )
        observer.observe(node)

        return () => observer.disconnect()
    }, [canRunSpline])

    function handleLoad(splineApp) {
        setLoading(false)
        if (onLoad) onLoad(splineApp)
    }

    return (
        <div ref={rootRef} className={rootClassName} style={style}>
            <ErrorBoundary>
                {canRunSpline && shouldMount && loading && <Loader />}
                {!canRunSpline && <div className="spline-scene__fallback" aria-label="3D scene paused for this device" />}
                <div className="spline-scene__canvas-wrap">
                    {canRunSpline && shouldMount && (
                        <Suspense fallback={null}>
                            <Spline scene={SCENE_URL} onLoad={handleLoad} />
                        </Suspense>
                    )}
                </div>
            </ErrorBoundary>
        </div>
    )
}