import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

/**
 * Page-switch animation — uses the original loader's slide-up exit but
 * WITHOUT the counter, since route changes in a React SPA are effectively
 * instant. The first-load Loader still uses the counter because it
 * actually waits on the GLB download.
 *
 * `previousPage` is rendered inside the sliding panel so the panel that
 * lifts away visually IS the old page.
 */
const HOLD_MS = 200

export default function TransitionLoader({ onComplete, previousPage }) {
  const [done, setDone] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setDone(true), HOLD_MS)
    return () => clearTimeout(id)
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
            pointerEvents: 'none',
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
        </motion.div>
      )}
    </AnimatePresence>
  )
}
