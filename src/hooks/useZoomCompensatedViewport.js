import { useEffect, useState } from 'react'

function getViewportSnapshot() {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0, zoomFactor: 1 }
  }

  const visualViewportScale = window.visualViewport?.scale
  let zoomFactor = 1

  if (
    visualViewportScale &&
    Number.isFinite(visualViewportScale) &&
    visualViewportScale > 0 &&
    visualViewportScale !== 1
  ) {
    zoomFactor = visualViewportScale
  } else {
    const outerWidth = window.outerWidth
    const innerWidth = window.innerWidth
    const ratio = outerWidth && innerWidth ? outerWidth / innerWidth : 1

    if (Number.isFinite(ratio) && ratio > 0 && !(ratio > 0.9 && ratio < 1.1)) {
      zoomFactor = ratio
    }
  }

  return {
    width: Math.round(window.innerWidth * zoomFactor),
    height: Math.round(window.innerHeight * zoomFactor),
    zoomFactor,
  }
}

export function getBrowserZoomFactor() {
  return getViewportSnapshot().zoomFactor
}

export function getZoomCompensatedViewportWidth() {
  return getViewportSnapshot().width
}

export function getZoomCompensatedViewportHeight() {
  return getViewportSnapshot().height
}

export function useZoomCompensatedViewport() {
  const [viewport, setViewport] = useState(getViewportSnapshot)

  useEffect(() => {
    const updateViewport = () => {
      setViewport(getViewportSnapshot())
    }

    const visualViewport = window.visualViewport

    updateViewport()

    window.addEventListener('resize', updateViewport)
    window.addEventListener('orientationchange', updateViewport)
    visualViewport?.addEventListener('resize', updateViewport)

    return () => {
      window.removeEventListener('resize', updateViewport)
      window.removeEventListener('orientationchange', updateViewport)
      visualViewport?.removeEventListener('resize', updateViewport)
    }
  }, [])

  return viewport
}

export function useCompensatedMinWidth(minWidth) {
  const { width } = useZoomCompensatedViewport()
  return width >= minWidth
}
