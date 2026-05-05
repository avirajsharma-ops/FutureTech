import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import './DataSection.css'

function BracketCard({ label, value, className = '', style, initial, whileInView, transition }) {
  return (
    <motion.div
      className={`ds-card ds-card--bracket ${className}`}
      style={style}
      initial={initial}
      whileInView={whileInView}
      viewport={{ once: false, amount: 0.15 }}
      transition={transition}
    >
      <span className="ds-bracket ds-bracket--tl" />
      <span className="ds-bracket ds-bracket--tr" />
      <span className="ds-bracket ds-bracket--bl" />
      <span className="ds-bracket ds-bracket--br" />
      <span className="ds-card__label">▸ {label}</span>
      <span className="ds-card__value">{value}</span>
    </motion.div>
  )
}

function MerchantCard({ accent, merchant, subtitle, amount, style, initial, whileInView, transition }) {
  return (
    <motion.div
      className="ds-card ds-card--merchant"
      style={style}
      initial={initial}
      whileInView={whileInView}
      viewport={{ once: false, amount: 0.15 }}
      transition={transition}
    >
      <div className="ds-chip" style={{ background: accent }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      </div>
      <div className="ds-merchant__body">
        <span className="ds-merchant__name">{merchant}</span>
        <span className="ds-merchant__sub">{subtitle}</span>
      </div>
      <span className="ds-merchant__amt">{amount}</span>
    </motion.div>
  )
}

export default function DataSection() {
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const phase1Opacity = useTransform(scrollYProgress, [0.30, 0.45], [1, 0])
  const phase1Scale = useTransform(scrollYProgress, [0.30, 0.50], [1, 0.92])
  const phase2Opacity = useTransform(scrollYProgress, [0.42, 0.55], [0, 1])
  const phase2Scale = useTransform(scrollYProgress, [0.42, 0.55], [1.05, 1])

  return (
    <section className="ds-section" ref={containerRef}>
      <div className="ds-sticky">
        {/* PHASE 1 — RAW */}
        <motion.div
          className="ds-phase ds-phase--raw"
          style={{ opacity: phase1Opacity, scale: phase1Scale }}
        >
          <div className="ds-phase__inner">
            <motion.h2
              className="ds-heading ds-heading--raw"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              Financial institutions process billions of transactions every day,{' '}
              <span className="ds-heading__accent">but most of that data is hard to use.</span>
            </motion.h2>

            <BracketCard label="LOCATION" value="DALLAS, TX U88"
              style={{ top: '10%', left: '40%' }}
              initial={{ opacity: 0, y: -30, scale: 0.7 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }} />

            <BracketCard label="CATEGORY" value={'MCC: 5814\nGAS STAT382'}
              style={{ top: '34%', left: '6%' }}
              initial={{ opacity: 0, x: -40, scale: 0.7 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }} />

            <BracketCard label="LOCATION" value="NEW YORK, NY"
              style={{ top: '38%', right: '6%' }}
              initial={{ opacity: 0, x: 40, scale: 0.7 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }} />

            <BracketCard label="MERCHANT" value="STORE HR4274288"
              style={{ bottom: '22%', left: '46%' }}
              initial={{ opacity: 0, y: 30, scale: 0.7 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }} />

            <BracketCard label="CATEGORY" value={'MCC: 2323\nFOOD AND DR529'}
              style={{ bottom: '14%', left: '10%' }}
              initial={{ opacity: 0, y: 30, scale: 0.7 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1] }} />

            <BracketCard label="MERCHANT" value="STORE MG4274284"
              style={{ bottom: '26%', right: '14%' }}
              initial={{ opacity: 0, x: 30, scale: 0.7 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }} />

            <MerchantCard accent="#a3e635" merchant="STORE HY248249242" subtitle="Food & Drink" amount="−$9.00"
              style={{ top: '14%', right: '10%' }}
              initial={{ opacity: 0, x: 50, scale: 0.7 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }} />

            <MerchantCard accent="#facc15" merchant="GAS STATION MG283235382" subtitle="Gas" amount="−$98.50"
              style={{ top: '54%', left: '16%' }}
              initial={{ opacity: 0, x: -50, scale: 0.7 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }} />

            <MerchantCard accent="#fb923c" merchant="STORE JU24829429" subtitle="Shopping" amount="−$67.00"
              style={{ bottom: '6%', right: '6%' }}
              initial={{ opacity: 0, y: 40, scale: 0.7 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.65, ease: [0.22, 1, 0.36, 1] }} />
          </div>
        </motion.div>

        {/* PHASE 2 — ENRICHED */}
        <motion.div
          className="ds-phase ds-phase--enriched"
          style={{ opacity: phase2Opacity, scale: phase2Scale }}
        >
          <div className="ds-grid-bg" aria-hidden="true" />
          <div className="ds-phase__inner">
            <motion.h2
              className="ds-heading ds-heading--enriched"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              MW Futuretech enriches transaction data in real time, adding structure, accuracy, and intelligence at every layer.
            </motion.h2>

            {/* JSON snippet */}
            <motion.div
              className="ds-card ds-card--json"
              style={{ top: '4%', left: '4%' }}
              initial={{ opacity: 0, y: -30, scale: 0.85 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="ds-json__head">
                <span className="ds-dot ds-dot--r" />
                <span className="ds-dot ds-dot--y" />
                <span className="ds-dot ds-dot--g" />
              </div>
              <pre className="ds-json__body">{`"de43":          "TST* STORE MGRSBUX75232    CAUS",
"amount":        "18.82",
"userId":        "csv_11_0_1.csv.gz",
"location": {
    "country":   "USA"
},
"acquirerId":    "4445062483714",
"occurredAt":    "2025-09-27 09:23:16",
"categoryCode":  "5812",
"categoryType":  "MCC",
"currencyCode":  "USD",
"transactionId": "38012128618"`}</pre>
            </motion.div>

            {/* API key */}
            <motion.div
              className="ds-card ds-card--api ds-card--bracket-light"
              style={{ bottom: '14%', left: '4%' }}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="ds-bracket ds-bracket--tl" />
              <span className="ds-bracket ds-bracket--tr" />
              <span className="ds-bracket ds-bracket--bl" />
              <span className="ds-bracket ds-bracket--br" />
              <span className="ds-card__label">[API KEY]</span>
              <code className="ds-api__token">AIzaSyDaGmWKa4JsXZ-HjGw7ISLn_3namBGewQe</code>
            </motion.div>

            {/* Right-side enriched cards */}
            <BracketCard className="ds-card--bracket-light" label="MERCHANT" value={'APPLE\nAPPLE, INC.'}
              style={{ top: '6%', right: '4%' }}
              initial={{ opacity: 0, x: 40, scale: 0.7 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }} />

            <BracketCard className="ds-card--bracket-light" label="LOCATION" value={'8770 S POLK ST, DALLAS, TX 75232\n(32.6416, -96.8395)'}
              style={{ top: '36%', right: '4%' }}
              initial={{ opacity: 0, x: 40, scale: 0.7 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }} />

            <BracketCard className="ds-card--bracket-light" label="CATEGORY" value={'TECHNOLOGY\nSOFTWARE AND SERVICES\n20493817569TRONICS'}
              style={{ bottom: '16%', right: '4%' }}
              initial={{ opacity: 0, x: 40, scale: 0.7 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1] }} />

            {/* Apple Store receipt */}
            <motion.div
              className="ds-card ds-card--receipt"
              style={{ bottom: '5%', left: '50%' }}
              initial={{ opacity: 0, y: 50, scale: 0.85 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="ds-receipt__top">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
                  <path d="M17.05 13.21c-.03-2.86 2.34-4.24 2.45-4.31-1.34-1.96-3.41-2.23-4.15-2.26-1.77-.18-3.45 1.04-4.35 1.04-.91 0-2.29-1.02-3.77-.99-1.94.03-3.74 1.13-4.74 2.86-2.02 3.51-.52 8.7 1.45 11.55.96 1.39 2.1 2.96 3.59 2.9 1.45-.06 2-.94 3.74-.94 1.74 0 2.24.94 3.77.91 1.56-.03 2.55-1.42 3.5-2.82 1.1-1.62 1.56-3.18 1.59-3.26-.04-.02-3.05-1.17-3.08-4.68zM14.6 4.49c.79-.97 1.32-2.3 1.18-3.64-1.14.05-2.53.77-3.35 1.73-.74.85-1.39 2.22-1.22 3.52 1.27.1 2.59-.65 3.39-1.61z" />
                </svg>
              </div>
              <div className="ds-receipt__body">
                <div>
                  <div className="ds-receipt__name">Apple Store Tribeca</div>
                  <div className="ds-receipt__date">2025-09-27 · 09:23:16</div>
                </div>
                <div className="ds-receipt__amt">−$78.36</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
