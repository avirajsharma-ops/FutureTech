import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { heroModelPromise } from '../lib/heroModel'

export default function Loader({ onComplete }) {
  const [count, setCount] = useState(0)
  const [done, setDone] = useState(false)
  const readyRef = useRef(false)

  // Mark ready only when BOTH the page has loaded AND the hero GLB
  // has finished downloading + caching.
  useEffect(() => {
    let pageLoaded =
      typeof document !== 'undefined' && document.readyState === 'complete'
    let modelLoaded = false

    const checkReady = () => {
      if (pageLoaded && modelLoaded) readyRef.current = true
    }

    const onLoad = () => {
      pageLoaded = true
      checkReady()
    }
    if (!pageLoaded) window.addEventListener('load', onLoad)

    heroModelPromise.then(() => {
      modelLoaded = true
      checkReady()
    })

    checkReady()
    return () => window.removeEventListener('load', onLoad)
  }, [])

  // Drive the counter: ease to 90% over a minimum duration, hold,
  // then complete to 100% once the page is ready.
  useEffect(() => {
    const start = performance.now()
    const minDuration = 1600
    const finishDuration = 400
    let raf = 0
    let finishStart = null

    const tick = (t) => {
      const elapsed = t - start
      const timeP = Math.min(1, elapsed / minDuration)
      const eased = 1 - Math.pow(1 - timeP, 3)
      let target = eased * 90

      if (readyRef.current && elapsed >= minDuration) {
        if (finishStart == null) finishStart = t
        const finishP = Math.min(1, (t - finishStart) / finishDuration)
        target = 90 + finishP * 10
      }

      setCount(Math.floor(target))

      if (target < 100) {
        raf = requestAnimationFrame(tick)
      } else {
        setTimeout(() => setDone(true), 350)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {!done && (
        <motion.div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            transformOrigin: 'center center',
            overflow: 'hidden',
          }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.9,
            ease: [0.65, 0, 0.35, 1],
          }}
        >
          {/* Background — matches light theme pearl white */}
          <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)' }} />

          {/* Counter + label */}
          <div
            style={{
              position: 'relative',
              height: '100%',
              width: '100%',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              padding: '0 clamp(1.5rem, 5vw, 3rem) clamp(2rem, 5vw, 3.5rem)',
              color: 'var(--text)',
              boxSizing: 'border-box',
            }}
          >
            <motion.div
              initial={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div
                style={{
                  fontSize: 'clamp(80px, 18vw, 260px)',
                  lineHeight: 0.9,
                  fontWeight: 500,
                  letterSpacing: '-0.04em',
                  fontVariantNumeric: 'tabular-nums',
                  fontFamily: 'inherit',
                }}
              >
                {count}
              </div>
            </motion.div>

            <motion.div
              style={{
                paddingBottom: '1.5rem',
                fontSize: 12,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                fontFamily: 'inherit',
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              MW Futuretech
            </motion.div>
          </div>

          {/* Progress line */}
          <motion.div
            style={{
              position: 'absolute',
              left: 0,
              bottom: 0,
              height: 1,
              background: 'var(--text)',
              opacity: 0.4,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${count}%` }}
            transition={{ ease: 'linear', duration: 0.05 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
