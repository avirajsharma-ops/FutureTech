import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

export default function Loader({ onComplete }) {
  const [count, setCount] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const start = performance.now()
    const duration = 2400
    let raf = 0
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setCount(Math.floor(eased * 100))
      if (p < 1) {
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
