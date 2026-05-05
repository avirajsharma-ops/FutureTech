import { motion } from 'motion/react'
import './PageShell.css'

export default function PageShell({ eyebrow, title, lead, children }) {
  return (
    <main className="page-shell">
      <section className="page-shell__hero">
        <motion.p
          className="page-shell__eyebrow"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          {eyebrow}
        </motion.p>
        <motion.h1
          className="page-shell__title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          {title}
        </motion.h1>
        {lead && (
          <motion.p
            className="page-shell__lead"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {lead}
          </motion.p>
        )}
      </section>
      <section className="page-shell__body">{children}</section>
    </main>
  )
}
