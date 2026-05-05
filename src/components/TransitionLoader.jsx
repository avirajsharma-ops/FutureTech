import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

/**
 * Page-switch loader using the EXACT original loader animation.
 * Counter rises to ~90% over a minimum duration, then completes to 100%
 * once `ready` is true (parent signals when the new route has mounted).
 *
 * `previousPage` is rendered inside the sliding panel so the exit
 * animation looks like the OLD page lifting away to reveal the NEW.
 */
export default function TransitionLoader({
  onComplete,
  ready,
  previousPage,
}) {
  const [count, setCount] = useState(0)
  const [done, setDone] = useState(false)
  const readyRef = useRef(ready)

  useEffect(() => {
    readyRef.current = ready
  }, [ready])

  useEffect(() => {
    const start = performance.now()
    const minDuration = 900
    const finishDuration = 300
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
        setTimeout(() => setDone(true), 250)
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
            zIndex: 9998,
            transformOrigin: 'center center',
            overflow: 'hidden',
          }}
          initial={{ scale: 1, y: 0, borderRadius: 0 }}
          exit={{
            scale: 0.82,
            y: '-110%',
            borderRadius: 32,
          }}
          transition={{
            duration: 1.4,
            ease: [0.76, 0, 0.24, 1],
            scale: { duration: 0.7, ease: [0.65, 0, 0.35, 1] },
            y: { duration: 1.2, ease: [0.76, 0, 0.24, 1], delay: 0.5 },
            borderRadius: { duration: 0.7, ease: [0.65, 0, 0.35, 1] },
          }}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)' }} />

          {/* Snapshot of the previous page underneath the counter overlay */}
          {previousPage && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
                pointerEvents: 'none',
              }}
              aria-hidden="true"
            >
              {previousPage}
            </div>
          )}

          {/* Subtle scrim so counter remains legible over any page bg */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.06) 100%)',
              pointerEvents: 'none',
            }}
          />

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
              exit={{ opacity: 0 }}
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
              exit={{ opacity: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              MW Futuretech
            </motion.div>
          </div>

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
