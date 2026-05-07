import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import './FutureScrollReveal.css'

const clampProgress = (value) => Math.min(Math.max(value, 0), 1)

const mapScrollRange = (progress, inputStart, inputEnd, outputStart, outputEnd) => {
  const normalized = clampProgress((progress - inputStart) / (inputEnd - inputStart))

  return outputStart + (outputEnd - outputStart) * normalized
}

const tightenWindow = (start, end, factor = 0.58) => start + (end - start) * factor

const cardFade = (progress, inStart, inEnd) => mapScrollRange(progress, inStart, tightenWindow(inStart, inEnd, 0.56), 0, 1)

const cardFilter = (progress, inStart, inEnd) => `blur(${mapScrollRange(progress, inStart, tightenWindow(inStart, inEnd, 0.54), 5, 0)}px)`

const popScaleWindow = (progress, inStart, inPeak, inEnd, from = 0.68, peak = 1.1, settle = 1) => (
  Math.min(
    mapScrollRange(progress, inStart, tightenWindow(inStart, inPeak, 0.64), from, peak),
    mapScrollRange(progress, tightenWindow(inStart, inPeak, 0.64), tightenWindow(inStart, inEnd, 0.62), peak, settle),
  )
)

const popYWindow = (progress, inStart, inPeak, inEnd, from = 28, peak = -8, settle = 0) => (
  Math.min(
    mapScrollRange(progress, inStart, tightenWindow(inStart, inPeak, 0.64), from, peak),
    mapScrollRange(progress, tightenWindow(inStart, inPeak, 0.64), tightenWindow(inStart, inEnd, 0.62), peak, settle),
  )
)

function usePinnedScrollProgress(sectionRef) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let animationFrame = 0

    const updateProgress = () => {
      const section = sectionRef.current
      if (!section) return

      const sectionTop = section.getBoundingClientRect().top + window.scrollY
      const scrollRange = Math.max(section.offsetHeight - window.innerHeight, 1)
      setProgress(clampProgress((window.scrollY - sectionTop) / scrollRange))
    }

    const scheduleUpdate = () => {
      if (animationFrame) return
      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = 0
        updateProgress()
      })
    }

    updateProgress()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)

    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
    }
  }, [sectionRef])

  return progress
}

export default function FutureScrollReveal() {
  const sectionRef = useRef(null)
  const progress = usePinnedScrollProgress(sectionRef)

  const darkFieldOpacity = mapScrollRange(progress, 0.8, 0.9, 1, 0)
  const darkCardsOpacity = Math.min(
    mapScrollRange(progress, 0.01, 0.07, 0, 1),
    mapScrollRange(progress, 0.78, 0.86, 1, 0),
  )
  const darkCardsVisibility = progress < 0.88 ? 'visible' : 'hidden'
  const darkCardsScale = mapScrollRange(progress, 0.01, 0.22, 0.94, 1)
  const cardSpread = mapScrollRange(progress, 0.18, 0.72, 0, 1.85)
  // Per-card sequential exit — each starts/ends at a different scroll offset and travels a different distance
  const exit_metaTop      = mapScrollRange(progress, 0.42, 0.66, 0, -520)
  const exit_metaRight    = mapScrollRange(progress, 0.44, 0.68, 0, -560)
  const exit_pillTop      = mapScrollRange(progress, 0.46, 0.70, 0, -560)
  const exit_metaLeft     = mapScrollRange(progress, 0.48, 0.72, 0, -600)
  const exit_pillLeft     = mapScrollRange(progress, 0.50, 0.74, 0, -760)
  const exit_chart        = mapScrollRange(progress, 0.51, 0.75, 0, -690)
  const exit_pillRight    = mapScrollRange(progress, 0.52, 0.76, 0, -760)
  const exit_alert        = mapScrollRange(progress, 0.53, 0.77, 0, -690)
  const exit_metaBotLeft  = mapScrollRange(progress, 0.54, 0.78, 0, -820)
  const exit_metaBotRight = mapScrollRange(progress, 0.55, 0.79, 0, -780)
  const exit_image        = mapScrollRange(progress, 0.56, 0.80, 0, -920)
  const exitX_metaTop      = mapScrollRange(progress, 0.42, 0.66, 0, -220)
  const exitX_metaRight    = mapScrollRange(progress, 0.44, 0.68, 0, 300)
  const exitX_pillTop      = mapScrollRange(progress, 0.46, 0.70, 0, 260)
  const exitX_metaLeft     = mapScrollRange(progress, 0.48, 0.72, 0, -300)
  const exitX_pillLeft     = mapScrollRange(progress, 0.50, 0.74, 0, -430)
  const exitX_chart        = mapScrollRange(progress, 0.51, 0.75, 0, -360)
  const exitX_pillRight    = mapScrollRange(progress, 0.52, 0.76, 0, 460)
  const exitX_alert        = mapScrollRange(progress, 0.53, 0.77, 0, 380)
  const exitX_metaBotLeft  = mapScrollRange(progress, 0.54, 0.78, 0, -360)
  const exitX_metaBotRight = mapScrollRange(progress, 0.55, 0.79, 0, 380)
  const exitX_image        = mapScrollRange(progress, 0.56, 0.80, 0, -120)
  const firstTextOpacity = mapScrollRange(progress, 0.76, 0.88, 1, 0)
  const firstTextY = mapScrollRange(progress, 0.76, 0.88, 0, -58)
  const gridOpacity = mapScrollRange(progress, 0.82, 0.96, 0.2, 1)
  const gridScale = mapScrollRange(progress, 0.82, 0.98, 1.08, 1)
  const gridShift = mapScrollRange(progress, 0.82, 1, 76, 0)
  const gridBuild = mapScrollRange(progress, 0.82, 0.98, 100, 0)
  const gridCellSize = mapScrollRange(progress, 0.82, 1, 86, 48)
  const gridClipPath = `polygon(${gridBuild}% 0%, 100% 0%, 100% ${100 - gridBuild}%, ${gridBuild}% ${100 - gridBuild}%)`
  const secondTextOpacity = mapScrollRange(progress, 0.88, 1, 0, 1)
  const secondTextY = mapScrollRange(progress, 0.88, 1, 42, 0)
  const codeOpacity = mapScrollRange(progress, 0.84, 0.96, 0, 1)
  const codeY = mapScrollRange(progress, 0.84, 1, -58, 0)
  const codeScale = mapScrollRange(progress, 0.84, 0.98, 0.94, 1)
  const apiOpacity = mapScrollRange(progress, 0.88, 1, 0, 1)
  const apiY = mapScrollRange(progress, 0.88, 1, 68, 0)
  const gridNotesOpacity = mapScrollRange(progress, 0.9, 1, 0, 1)
  const gridNotesY = mapScrollRange(progress, 0.9, 1, 72, 0)
  const phoneOpacity = mapScrollRange(progress, 0.92, 1, 0, 1)
  const phoneY = mapScrollRange(progress, 0.92, 1, 92, 0)
  const phoneScale = mapScrollRange(progress, 0.92, 1, 0.9, 1)

  return (
    <section ref={sectionRef} className="future-scroll-reveal" aria-label="Futuretech intelligence reveal">
      <div className="future-scroll-reveal__sticky">
        <motion.div className="future-scroll-reveal__field" style={{ opacity: darkFieldOpacity }} />

        <motion.div className="future-dark-card-layer" style={{ opacity: darkCardsOpacity, scale: darkCardsScale, visibility: darkCardsVisibility }} aria-hidden="true">
          <motion.div className="future-meta-card future-meta-card--top is-back" style={{ opacity: cardFade(progress, 0.01, 0.1), scale: popScaleWindow(progress, 0.01, 0.05, 0.1), x: exitX_metaTop + cardSpread * -26, y: exit_metaTop + mapScrollRange(progress, 0.01, 0.18, 52, 0) + popYWindow(progress, 0.01, 0.05, 0.1, 16, -6, 0) + cardSpread * -18, filter: cardFilter(progress, 0.01, 0.18) }}>
            <span>SIGNAL HUB</span><b>LIVE EVENT MESH</b>
          </motion.div>
          <motion.div className="future-meta-card future-meta-card--left is-back" style={{ opacity: cardFade(progress, 0.04, 0.14), scale: popScaleWindow(progress, 0.04, 0.08, 0.14), x: exitX_metaLeft + cardSpread * -64, y: exit_metaLeft + mapScrollRange(progress, 0.04, 0.21, 42, 0) + popYWindow(progress, 0.04, 0.08, 0.14, 18, -8, 0) + cardSpread * -10, filter: cardFilter(progress, 0.04, 0.21) }}>
            <span>SERVICE</span><b>AI WORKFLOW<br />ORCHESTRATION</b>
          </motion.div>
          <motion.div className="future-meta-card future-meta-card--right is-back" style={{ opacity: cardFade(progress, 0.07, 0.17), scale: popScaleWindow(progress, 0.07, 0.11, 0.17), x: exitX_metaRight + cardSpread * 62, y: exit_metaRight + mapScrollRange(progress, 0.07, 0.24, 44, 0) + popYWindow(progress, 0.07, 0.11, 0.17, 16, -7, 0) + cardSpread * -16, filter: cardFilter(progress, 0.07, 0.24) }}>
            <span>DEPLOYMENT</span><b>GLOBAL EDGE</b>
          </motion.div>
          <motion.div className="future-meta-card future-meta-card--bottom-left is-deep" style={{ opacity: cardFade(progress, 0.13, 0.24), scale: popScaleWindow(progress, 0.13, 0.18, 0.24), x: exitX_metaBotLeft + cardSpread * -58, y: exit_metaBotLeft + mapScrollRange(progress, 0.13, 0.3, -44, 0) + popYWindow(progress, 0.13, 0.18, 0.24, 14, -6, 0) + cardSpread * 52, filter: cardFilter(progress, 0.13, 0.3) }}>
            <span>STACK</span><b>RAG + AGENTS<br />VISION MODELS</b>
          </motion.div>
          <motion.div className="future-meta-card future-meta-card--bottom-right is-deep" style={{ opacity: cardFade(progress, 0.16, 0.27), scale: popScaleWindow(progress, 0.16, 0.21, 0.27), x: exitX_metaBotRight + cardSpread * 54, y: exit_metaBotRight + mapScrollRange(progress, 0.16, 0.33, -44, 0) + popYWindow(progress, 0.16, 0.21, 0.27, 14, -6, 0) + cardSpread * 44, filter: cardFilter(progress, 0.16, 0.33) }}>
            <span>CONTROL</span><b>HUMAN-IN-LOOP</b>
          </motion.div>
          <motion.div className="future-transaction-pill future-transaction-pill--left is-front" style={{ opacity: cardFade(progress, 0.1, 0.2), scale: popScaleWindow(progress, 0.1, 0.15, 0.2), x: exitX_pillLeft + cardSpread * -84, y: exit_pillLeft + mapScrollRange(progress, 0.1, 0.27, 36, 0) + popYWindow(progress, 0.1, 0.15, 0.2, 18, -8, 0) + cardSpread * 34, filter: cardFilter(progress, 0.1, 0.27) }}>
            <i>▣</i><div><b>INTAKE PIPELINE</b><span>Signals normalized</span></div><strong>12K/MIN</strong>
          </motion.div>
          <motion.div className="future-transaction-pill future-transaction-pill--top is-front" style={{ opacity: cardFade(progress, 0.03, 0.13), scale: popScaleWindow(progress, 0.03, 0.08, 0.13), x: exitX_pillTop + cardSpread * 48, y: exit_pillTop + mapScrollRange(progress, 0.03, 0.19, 54, 0) + popYWindow(progress, 0.03, 0.08, 0.13, 18, -8, 0) + cardSpread * -36, filter: cardFilter(progress, 0.03, 0.19) }}>
            <i>▣</i><div><b>MODEL ROUTER</b><span>Intent classified</span></div><strong>99.4%</strong>
          </motion.div>
          <motion.div className="future-transaction-pill future-transaction-pill--right is-front" style={{ opacity: cardFade(progress, 0.18, 0.3), scale: popScaleWindow(progress, 0.18, 0.23, 0.3), x: exitX_pillRight + cardSpread * 82, y: exit_pillRight + mapScrollRange(progress, 0.18, 0.35, -44, 0) + popYWindow(progress, 0.18, 0.23, 0.3, 18, -8, 0) + cardSpread * 30, filter: cardFilter(progress, 0.18, 0.35) }}>
            <i>▣</i><div><b>AUTOMATION RUN</b><span>Workflow dispatched</span></div><strong>1.2S</strong>
          </motion.div>
          <motion.div className="future-alert-card" style={{ opacity: cardFade(progress, 0.2, 0.31), scale: popScaleWindow(progress, 0.2, 0.25, 0.31), x: exitX_alert + cardSpread * 74, y: exit_alert + mapScrollRange(progress, 0.2, 0.38, 40, 0) + popYWindow(progress, 0.2, 0.25, 0.31, 16, -7, 0) + cardSpread * 6, filter: cardFilter(progress, 0.2, 0.38) }}>
            <span>OPS SIGNAL</span>
            <b>ESCALATION READY</b>
            <p>Agent routed high-priority work to the right team.</p>
          </motion.div>
          <motion.div className="future-mini-chart-card" style={{ opacity: cardFade(progress, 0.22, 0.33), scale: popScaleWindow(progress, 0.22, 0.27, 0.33), x: exitX_chart + cardSpread * -76, y: exit_chart + mapScrollRange(progress, 0.22, 0.4, 40, 0) + popYWindow(progress, 0.22, 0.27, 0.33, 14, -6, 0) + cardSpread * 2, filter: cardFilter(progress, 0.22, 0.4) }}>
            <span>MODEL HEALTH</span>
            <div>{Array.from({ length: 10 }).map((_, index) => <i key={index} />)}</div>
            <b>UPTIME 99.8%</b>
          </motion.div>
          <motion.div className="future-meta-card future-meta-card--product is-deep" style={{ opacity: cardFade(progress, 0.25, 0.36), scale: popScaleWindow(progress, 0.25, 0.3, 0.36), x: exitX_image + cardSpread * -10, y: exit_image + mapScrollRange(progress, 0.25, 0.42, -42, 0) + popYWindow(progress, 0.25, 0.3, 0.36, 12, -5, 0) + cardSpread * 58, filter: cardFilter(progress, 0.25, 0.42) }}>
            <span>MEMORY LAYER</span><b>CONTEXT GRAPH<br />CLIENT SIGNALS</b>
          </motion.div>
        </motion.div>

        <motion.div
          className="future-scroll-reveal__grid-stage"
          style={{
            opacity: gridOpacity,
            scale: gridScale,
            '--future-grid-position': `${gridShift}px ${24 + gridShift}px`,
            '--future-grid-size': `${gridCellSize}px ${gridCellSize}px`,
            '--future-grid-clip': gridClipPath,
          }}
          aria-hidden="true"
        >
          <motion.div className="future-code-card" style={{ opacity: codeOpacity, y: codeY, scale: codeScale }}>
            <div className="future-card-bar"><span /><span /><span /><b>API</b><i>□</i><i>+</i></div>
            <pre>{`{
  "workspace": "mw_futuretech.ops",
  "signal": "CLIENT_EVENT_STREAM",
  "latency": "1.2ms",
  "model": "adaptive_agent_core",
  "intent": {
    "route": "launch_workflow",
    "confidence": "99.4%"
  },
  "status": "automation_ready"
}`}</pre>
          </motion.div>

          <motion.div className="future-api-stack" style={{ opacity: apiOpacity, y: apiY }}>
            <div className="future-api-card"><span>[WORKFLOW ENDPOINT]</span><b>mwft.ai/orchestrate/client-intake</b></div>
            <div className="future-latency-card"><span>DECISION</span><div>{Array.from({ length: 12 }).map((_, index) => <i key={index} />)}</div><b>1MS</b></div>
          </motion.div>

          <motion.div className="future-grid-note future-grid-note--merchant" style={{ opacity: gridNotesOpacity, y: gridNotesY }}>
            <span>PLATFORM</span><b>MW FUTURETECH<br />AGENT OS</b>
          </motion.div>
          <motion.div className="future-grid-note future-grid-note--location" style={{ opacity: gridNotesOpacity, y: mapScrollRange(progress, 0.9, 1, 58, 0) }}>
            <span>EDGE REGION</span><b>GLOBAL CLOUD<br />LOW-LATENCY ROUTING</b>
          </motion.div>
          <motion.div className="future-grid-note future-grid-note--category" style={{ opacity: gridNotesOpacity, y: mapScrollRange(progress, 0.9, 1, 70, 0) }}>
            <span>DELIVERY</span><b>AI PRODUCTS<br />CUSTOM AUTOMATION</b>
          </motion.div>

          <motion.div className="future-device-card" style={{ opacity: phoneOpacity, x: '-50%', y: phoneY, scale: phoneScale }}>
            <div className="future-device-card__screen"><span>MW</span><div><b>Decision Engine</b><small>Live agent run 18:04:12</small></div><strong>ACTIVE</strong></div>
            <div className="future-device-card__map"><i /></div>
            <div className="future-device-card__table"><span>Model</span><b>Agent Core</b><span>Route</span><b>Deploy</b></div>
            <div className="future-device-card__lines"><i /><i /><i /></div>
          </motion.div>
        </motion.div>

        <motion.div className="future-reveal-copy future-reveal-copy--first" style={{ opacity: firstTextOpacity, y: firstTextY }}>
          <p>Modern teams process<br className="future-desktop-break" /> thousands of signals every<br className="future-desktop-break" /> second, <span>but most systems<br className="future-desktop-break" /> are too slow to act.</span></p>
        </motion.div>
        <motion.div className="future-reveal-copy future-reveal-copy--second" style={{ opacity: secondTextOpacity, y: secondTextY }}>
          <p>MW Futuretech turns live data into intelligent workflows, adaptive interfaces, and automated decisions.</p>
        </motion.div>
      </div>
    </section>
  )
}