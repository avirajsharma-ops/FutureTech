import { useEffect } from 'react'
import { getBrowserZoomFactor } from './useZoomCompensatedViewport'

const DEFAULT_FONT_PERCENT = 100

export function useDesktopScaleCompensation(disabled = false) {
  useEffect(() => {
    const root = document.documentElement
    const viewport = window.visualViewport

    const reset = () => {
      root.style.removeProperty('--font-size')
      root.style.removeProperty('--desktop-density-scale')
      root.style.removeProperty('--browser-zoom-factor')
      root.classList.remove('compact-desktop-density')
      root.classList.remove('browser-zoom-compensated')
    }

    if (disabled) {
      reset()
      return undefined
    }

    const apply = () => {
      const browserZoomFactor = getBrowserZoomFactor()
      const hasBrowserZoomOffset = Math.abs(browserZoomFactor - 1) > 0.01
      const fontSizePercent = DEFAULT_FONT_PERCENT / browserZoomFactor

      if (hasBrowserZoomOffset) {
        root.style.setProperty('--font-size', `${fontSizePercent}%`)
      } else {
        root.style.removeProperty('--font-size')
      }

      root.style.setProperty('--desktop-density-scale', '1')
      root.style.setProperty('--browser-zoom-factor', browserZoomFactor.toFixed(3))
      root.classList.remove('compact-desktop-density')
      root.classList.toggle('browser-zoom-compensated', hasBrowserZoomOffset)
    }

    apply()

    window.addEventListener('resize', apply)
    window.addEventListener('orientationchange', apply)
    viewport?.addEventListener('resize', apply)

    return () => {
      window.removeEventListener('resize', apply)
      window.removeEventListener('orientationchange', apply)
      viewport?.removeEventListener('resize', apply)
      reset()
    }
  }, [disabled])
}
