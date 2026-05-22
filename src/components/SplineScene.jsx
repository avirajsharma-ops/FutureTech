import { Component, Suspense, lazy, useState } from 'react'
import './SplineScene.css'

const SCENE_URL = 'https://prod.spline.design/zjCzTLsdWd0YEZ1f/scene.splinecode'
const Spline = lazy(() => import('@splinetool/react-spline'))

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
    const [loading, setLoading] = useState(true)
    const rootClassName = ['spline-scene', className].filter(Boolean).join(' ')

    function handleLoad(splineApp) {
        setLoading(false)
        if (onLoad) onLoad(splineApp)
    }

    return (
        <div className={rootClassName} style={style}>
            <ErrorBoundary>
                {loading && <Loader />}
                <div className="spline-scene__canvas-wrap">
                    <Suspense fallback={null}>
                        <Spline scene={SCENE_URL} onLoad={handleLoad} />
                    </Suspense>
                </div>
            </ErrorBoundary>
        </div>
    )
}