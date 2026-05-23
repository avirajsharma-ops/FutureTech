import { motion, useInView, useScroll, useTransform } from 'motion/react';
import { useRef, useEffect, useState } from 'react';
import {
  Sparkles,
  CalendarCheck,
  DollarSign,
  BarChart3,
  Users,
  Brain,
  ShieldCheck,
} from 'lucide-react';
import { useCompensatedMinWidth } from '../hooks/useZoomCompensatedViewport';

/* ── Integration icons (6 icons at top) ── */
const ICONS = [
  { icon: CalendarCheck, color: '#2368e8', label: 'Schedule' },
  { icon: DollarSign, color: '#4f8df0', label: 'Revenue' },
  { icon: BarChart3, color: '#c4a17b', label: 'Analytics' },
  { icon: Users, color: '#69a7ff', label: 'Teams' },
  { icon: Brain, color: '#b58c60', label: 'Intelligence' },
  { icon: ShieldCheck, color: '#2368e8', label: 'Security' },
];

/* ── Stats data ── */
const STATS = [
  { value: '200M+', desc: 'real-time signals processed daily' },
  { value: '120+', desc: 'engineering systems delivered' },
  { value: '38%', desc: 'average performance lift achieved' },
  { value: '25+', desc: 'industries we engineer for' },
];

/* ── Gradient for stat numbers — MW Futuretech brand (blue → cyan → gold) ── */
const STAT_GRADIENT =
  'linear-gradient(315deg, #2368e8 0%, #4f8df0 35%, #69a7ff 60%, #c4a17b 100%)';

/*
 * Icon X positions in SVG viewBox(0 0 600 220).
 * Icons use justify-around in a container matched to the SVG width,
 * giving each icon W/6 space → centers at W/12, 3W/12 … 11W/12.
 * In viewBox 600: 50, 150, 250, 350, 450, 550.
 */
const ICON_X = [50, 150, 250, 350, 450, 550];
const CONVERGE = { x: 300, y: 220 };

const CONNECTOR_PATHS = ICON_X.map((x, i) => ({
  d: `M${x} 0 C${x} ${85 + Math.abs(x - 300) * 0.04}, 300 ${165 - Math.abs(x - 300) * 0.02}, ${CONVERGE.x} ${CONVERGE.y}`,
  color: ICONS[i].color,
  dur: 2.4 + i * 0.12,
}));

/* ── Unified SVG connector lines ── */
function ConnectorLines({ isInView, showDesktopConnector }) {
  if (!isInView || !showDesktopConnector) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 1, delay: 0.3 }}
      className="flex justify-center -mt-1 relative z-0"
      style={{ overflow: 'visible' }}
    >
      <svg viewBox="0 0 600 280" className="w-full max-w-4xl" style={{ overflow: 'visible', height: 'auto', minHeight: '13.75rem' }} fill="none">
        <defs>
          {CONNECTOR_PATHS.map((p, i) => (
            <linearGradient key={`g${i}`} id={`aiLineGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={p.color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={p.color} stopOpacity="0.1" />
            </linearGradient>
          ))}
          <radialGradient id="aiCenterGlow">
            <stop offset="0%" stopColor="#c4a17b" />
            <stop offset="100%" stopColor="#2368e8" />
          </radialGradient>
          <linearGradient id="aiVerticalLineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2368e8" />
            <stop offset="45%" stopColor="#69a7ff" />
            <stop offset="100%" stopColor="#c4a17b" />
          </linearGradient>
        </defs>

        {CONNECTOR_PATHS.map((p, i) => (
          <g key={i}>
            {/* Static faint trail */}
            <path d={p.d} stroke="rgba(20,20,30,0.08)" strokeWidth="1.5" strokeLinecap="round" />

            {/* Animated wave — slow start then sudden rush to bottom */}
            <path
              d={p.d}
              stroke={`url(#aiLineGrad-${i})`}
              strokeWidth="1.5"
              strokeLinecap="round"
              pathLength="100"
              strokeDasharray="18 82"
            >
              <animate
                attributeName="stroke-dashoffset"
                values="100;72;0"
                keyTimes="0;0.55;1"
                calcMode="spline"
                keySplines="0.08 0 0.25 1; 0.75 0 1 0.5"
                dur={`${p.dur}s`}
                repeatCount="indefinite"
              />
            </path>

            {/* Flowing dot */}
            <circle r="2.5" fill={p.color} opacity="0.9">
              <animateMotion
                dur={`${p.dur}s`}
                repeatCount="indefinite"
                keyPoints="0;0.28;1"
                keyTimes="0;0.55;1"
                calcMode="spline"
                keySplines="0.08 0 0.25 1; 0.75 0 1 0.5"
              >
                <mpath href={`#aiMotionPath-${i}`} />
              </animateMotion>
            </circle>
            {/* Dot glow */}
            <circle r="6" fill={p.color} opacity="0.15">
              <animateMotion
                dur={`${p.dur}s`}
                repeatCount="indefinite"
                keyPoints="0;0.28;1"
                keyTimes="0;0.55;1"
                calcMode="spline"
                keySplines="0.08 0 0.25 1; 0.75 0 1 0.5"
              >
                <mpath href={`#aiMotionPath-${i}`} />
              </animateMotion>
            </circle>

            {/* Origin glow burst at icon — pulses each cycle */}
            <circle cx={ICON_X[i]} cy="0" r="14" fill={p.color} opacity="0">
              <animate
                attributeName="opacity"
                values="0;0.25;0"
                keyTimes="0;0.06;0.25"
                dur={`${p.dur}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="r"
                values="10;22;10"
                keyTimes="0;0.06;0.25"
                dur={`${p.dur}s`}
                repeatCount="indefinite"
              />
            </circle>

            <path id={`aiMotionPath-${i}`} d={p.d} />
          </g>
        ))}

        {/* Converge point glow */}
        <circle cx={CONVERGE.x} cy={CONVERGE.y} r="3.5" fill="url(#aiCenterGlow)" opacity="0.8" />
        <circle cx={CONVERGE.x} cy={CONVERGE.y} r="8" fill="url(#aiCenterGlow)" opacity="0.15">
          <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.15;0.05;0.15" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Vertical line from converge point downward — clean, no glow halo. */}
        <line
          x1={CONVERGE.x}
          y1={CONVERGE.y}
          x2={CONVERGE.x}
          y2="500"
          stroke="#2368e8"
          strokeWidth="1.2"
          opacity="0.9"
        />
        {/* Flowing dot down the connector */}
        <circle r="2.5" fill="#2368e8" opacity="0.85">
          <animateMotion dur="2s" repeatCount="indefinite" path={`M${CONVERGE.x},${CONVERGE.y} L${CONVERGE.x},500`} />
        </circle>
      </svg>
    </motion.div>
  );
}

/* ── Icon box with repeating glow ── */
function IconBox({ icon: Icon, color, label, index, isInView }) {
  const dur = CONNECTOR_PATHS[index]?.dur ?? 2.5;
  const [glowing, setGlowing] = useState(false);

  useEffect(() => {
    if (!isInView) {
      setGlowing(false);
      return undefined;
    }

    // Start glow cycle — matches the SVG wave departure timing.
    const ms = dur * 1000;
    let intervalId = null;
    let glowOffTimeout = null;

    const pulse = () => {
      setGlowing(true);
      if (glowOffTimeout) window.clearTimeout(glowOffTimeout);
      glowOffTimeout = window.setTimeout(() => setGlowing(false), 280);
    };

    const startDelay = window.setTimeout(() => {
      pulse();
      intervalId = window.setInterval(pulse, ms);
    }, 300); // match SVG entry delay

    return () => {
      window.clearTimeout(startDelay);
      if (intervalId) window.clearInterval(intervalId);
      if (glowOffTimeout) window.clearTimeout(glowOffTimeout);
      setGlowing(false);
    };
  }, [isInView, dur]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.3 + index * 0.06 }}
      whileHover={{ scale: 1.15, y: -4 }}
      className="relative group cursor-default"
    >
      <div
        className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center border backdrop-blur-sm"
        style={{
          background: `linear-gradient(135deg, ${color}22 0%, ${color}0d 100%)`,
          borderColor: glowing ? `${color}60` : `${color}30`,
          boxShadow: glowing
            ? `0 0 1.5rem 0.375rem ${color}35, 0 0 0.5rem 0.125rem ${color}20`
            : `0 0 0 0 ${color}00`,
          transition: 'box-shadow 0.15s ease-out, border-color 0.15s ease-out',
        }}
      >
        <Icon className="w-5 h-5 md:w-6 md:h-6" style={{ color }} />
      </div>
      <span
        className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[0.625rem] font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
        style={{ color }}
      >
        {label}
      </span>
    </motion.div>
  );
}

export function AISection() {
  const sectionRef = useRef(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: '-10%' });
  const showDesktopConnector = useCompensatedMinWidth(768);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const iconY = useTransform(scrollYProgress, [0, 1], [15, -15]);

  return (
    <section
      ref={sectionRef}
      className="relative z-10 pt-6 pb-20 md:pt-10 md:pb-28"
      style={{ overflow: 'visible', background: 'var(--bg)', color: 'var(--text)' }}
    >
      {/* Background texture */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle, color-mix(in srgb, var(--text) 12%, transparent) 0.0625rem, transparent 0.0625rem)',
            backgroundSize: '2rem 2rem',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, #000 0%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, #000 0%, transparent 80%)',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[50rem] rounded-full"
          style={{
            background:
              'radial-gradient(circle at 50% 35%, color-mix(in srgb, #2368e8 9%, transparent) 0%, color-mix(in srgb, #c4a17b 6%, transparent) 35%, transparent 70%)',
            filter: 'blur(5rem)',
          }}
        />
      </div>

      <div ref={ref} className="relative mx-auto max-w-7xl px-6 md:px-8 lg:px-12">
        {/* ── Heading ── */}
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest mb-10"
            style={{ color: 'color-mix(in srgb, var(--text) 55%, transparent)' }}
          >
            <Sparkles className="w-4 h-4" />
            Intelligence Layer
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-10 leading-[1.05] tracking-tighter text-center"
            style={{ color: 'var(--text)' }}
          >
            Intelligence engineered from{' '}
            {showDesktopConnector ? <br /> : ' '}
            real-time signals across{' '}
            {showDesktopConnector ? <br /> : ' '}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, #2368e8 0%, #4f8df0 35%, #69a7ff 65%, #c4a17b 100%)',
              }}
            >
              modern enterprises
            </span>
          </motion.h2>
        </div>

        {/* ── Icon Stack — justify-around keeps centers at viewBox 50,150,…,550 ── */}
        <motion.div
          style={{ y: iconY }}
          className="relative z-10 mx-auto mt-4 mb-0 flex max-w-4xl items-center justify-around"
        >
          {ICONS.map(({ icon: Icon, color, label }, i) => (
            <IconBox key={label} icon={Icon} color={color} label={label} index={i} isInView={isInView} />
          ))}
        </motion.div>

        {/* ── SVG Connector Paths ── */}
        <ConnectorLines isInView={isInView} showDesktopConnector={showDesktopConnector} />

        {/* ── Sub-heading ── */}
        <div className="flex flex-col items-center text-center -mt-4 md:-mt-8 relative z-10">
          {/* Light gradient backdrop for readability over the line */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 60% 100% at 50% 50%, color-mix(in srgb, var(--bg) 95%, transparent) 0%, color-mix(in srgb, var(--bg) 70%, transparent) 40%, transparent 70%)',
            }}
          />
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative text-2xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight"
            style={{ color: 'var(--text)' }}
          >
            This isn&apos;t just code.{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, #2368e8 0%, #4f8df0 40%, #69a7ff 70%, #c4a17b 100%)',
              }}
            >
              It&apos;s engineered intelligence.
            </span>
          </motion.h3>
        </div>

        {/* ── Stats Grid ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className={`relative z-10 mx-auto mt-12 grid max-w-6xl gap-5 md:mt-16 md:gap-6 ${showDesktopConnector ? 'grid-cols-4' : 'grid-cols-2'}`}
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.value}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.7 + i * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="relative rounded-2xl border px-5 py-7 md:px-6 md:py-9 text-center cursor-default group overflow-visible min-h-[10rem] md:min-h-[11.875rem] flex flex-col items-center justify-center"
              style={{
                background: 'color-mix(in srgb, var(--bg) 60%, white 40%)',
                borderColor: 'color-mix(in srgb, var(--text) 9%, transparent)',
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle at 50% 0%, color-mix(in srgb, #2368e8 14%, transparent) 0%, transparent 70%)',
                }}
              />

              {/* Gradient number */}
              <div
                className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-2 bg-clip-text text-transparent whitespace-nowrap"
                style={{ backgroundImage: STAT_GRADIENT }}
              >
                {stat.value}
              </div>

              {/* Description */}
              <p
                className="text-[0.8125rem] md:text-sm leading-relaxed font-light"
                style={{ color: 'color-mix(in srgb, var(--text) 60%, transparent)' }}
              >
                {stat.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default AISection;
