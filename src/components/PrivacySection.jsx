import { motion, useInView, useScroll, useTransform, useMotionValue, useSpring, useMotionValueEvent, AnimatePresence } from 'motion/react';
import { useRef, useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, Database, Server, Fingerprint } from 'lucide-react';
import { lazy } from 'react';
import { useCompensatedMinWidth } from '../hooks/useZoomCompensatedViewport';

// Lottie + lottie-web together weigh ~250 KB. Pull them out of the main
// HomePage chunk so the initial paint never pays for them — they only
// load once PrivacySection mounts (already deep below the fold).
const Lottie = lazy(async () => {
  const mod = await import('lottie-react');
  const Component = mod.default?.default || mod.default;
  return { default: Component };
});

const PRIVACY_GRADIENT =
  'linear-gradient(90deg, #2368e8 0%, #4f8df0 35%, #69a7ff 65%, #c4a17b 100%)';

const PRIVACY_FEATURES = [
  {
    icon: Lock,
    title: 'End-to-End Encryption',
    description:
      'AES-256 at rest and TLS 1.3 in transit. Every byte is sealed in flight and at home.',
    color: 'from-[#2368e8]/15 to-[#69a7ff]/15',
    borderColor: 'border-[#2368e8]/35',
    iconColor: 'text-[#2368e8]',
  },
  {
    icon: EyeOff,
    title: 'Zero Data Sharing',
    description:
      'We never sell, share, or monetize your data. Your information stays inside your environment.',
    color: 'from-[#69a7ff]/15 to-[#4f8df0]/15',
    borderColor: 'border-[#69a7ff]/35',
    iconColor: 'text-[#4f8df0]',
  },
  {
    icon: Database,
    title: 'Hardened Infrastructure',
    description:
      'Audited environments and least-privilege controls keep sensitive data exactly where it belongs.',
    color: 'from-[#c4a17b]/15 to-[#b58c60]/15',
    borderColor: 'border-[#c4a17b]/40',
    iconColor: 'text-[#b58c60]',
  },
  {
    icon: Fingerprint,
    title: 'Role-Based Access',
    description:
      'Granular permissions ensure only the right people see the right data — verified on every request.',
    color: 'from-[#2368e8]/12 to-[#c4a17b]/12',
    borderColor: 'border-[#2368e8]/30',
    iconColor: 'text-[#2368e8]',
  },
];

export function PrivacySection() {
  const ref = useRef(null);
  const sectionRef = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });
  const hasTabletPrivacyGrid = useCompensatedMinWidth(768);
  const hasDesktopPrivacySplit = useCompensatedMinWidth(1024);
  const [lottieData, setLottieData] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hasRevealed, setHasRevealed] = useState(false);

  // Defer the lock-unlock JSON until the section is near the viewport.
  // Avoids parsing/decoding the animation data on first paint.
  useEffect(() => {
    if (!isInView) return undefined;
    let cancelled = false;
    fetch('/lock-unlock.json')
      .then((res) => res.json())
      .then((data) => { if (!cancelled) setLottieData(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isInView]);

  // Scroll-mapped Lottie frame control
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Map scroll to Lottie frame (0 → 1 through the section)
  const lottieProgress = useTransform(scrollYProgress, [0.15, 0.65], [0, 1]);
  const smoothProgress = useSpring(lottieProgress, { stiffness: 80, damping: 20 });

  // Lottie ref for frame control
  const lottieRef = useRef(null);

  useEffect(() => {
    return smoothProgress.on('change', (v) => {
      if (lottieRef.current) {
        const totalFrames = lottieRef.current.getDuration(true) || 75;
        lottieRef.current.goToAndStop(Math.round(v * totalFrames), true);
      }
    });
  }, [smoothProgress]);

  // Interactive glow position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  // ─── SVG Path Scroll Animation ───
  const PATH_POINTS = useMemo(() => [
    { x: 430, y: -60 },
    { x: 430, y: 80 },
    { x: 510, y: 80 },
    { x: 510, y: 200 },
    { x: 350, y: 200 },
    { x: 350, y: 320 },
    { x: 470, y: 320 },
    { x: 470, y: 440 },
    { x: 430, y: 440 },
    { x: 430, y: 520 },
  ], []);

  const pathD = useMemo(
    () =>
      `M ${PATH_POINTS[0].x} ${PATH_POINTS[0].y} ` +
      PATH_POINTS.slice(1)
        .map((p) => `L ${p.x} ${p.y}`)
        .join(' '),
    [PATH_POINTS]
  );

  const { totalLength, segmentLengths } = useMemo(() => {
    let total = 0;
    const segs = [];
    for (let i = 1; i < PATH_POINTS.length; i++) {
      const dx = PATH_POINTS[i].x - PATH_POINTS[i - 1].x;
      const dy = PATH_POINTS[i].y - PATH_POINTS[i - 1].y;
      total += Math.sqrt(dx * dx + dy * dy);
      segs.push({ x: PATH_POINTS[i].x, y: PATH_POINTS[i].y, cumLen: total });
    }
    return { totalLength: total, segmentLengths: segs };
  }, [PATH_POINTS]);

  const getPointAtLength = useCallback(
    (targetLen) => {
      let accumulated = 0;
      for (let i = 1; i < PATH_POINTS.length; i++) {
        const dx = PATH_POINTS[i].x - PATH_POINTS[i - 1].x;
        const dy = PATH_POINTS[i].y - PATH_POINTS[i - 1].y;
        const segLen = Math.sqrt(dx * dx + dy * dy);
        if (accumulated + segLen >= targetLen) {
          const t = segLen === 0 ? 0 : (targetLen - accumulated) / segLen;
          return {
            x: PATH_POINTS[i - 1].x + dx * t,
            y: PATH_POINTS[i - 1].y + dy * t,
          };
        }
        accumulated += segLen;
      }
      return PATH_POINTS[PATH_POINTS.length - 1];
    },
    [PATH_POINTS]
  );

  // Scroll progress for the SVG path container
  const svgContainerRef = useRef(null);
  const { scrollYProgress: svgScroll } = useScroll({
    target: svgContainerRef,
    offset: ['start 0.85', 'start 0.25'],
  });

  const drawProgress = useTransform(svgScroll, [0, 1], [0, 1]);
  const smoothDraw = useSpring(drawProgress, { stiffness: 60, damping: 25 });

  const [drawnLength, setDrawnLength] = useState(0);
  const [tipPos, setTipPos] = useState(null);

  useMotionValueEvent(smoothDraw, 'change', (p) => {
    const drawn = p * totalLength;
    setDrawnLength(drawn);

    if (p > 0.001 && p < 0.999) {
      setTipPos(getPointAtLength(drawn));
    } else {
      setTipPos(null);
    }
  });

  // Separate scroll tracker: reveal original content when privacy section is 40% visible
  const { scrollYProgress: sectionScroll } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  useMotionValueEvent(sectionScroll, 'change', (p) => {
    // Reveal when the original content area (below path) reaches ~40% into viewport
    if (p >= 0.45 && !hasRevealed) {
      setHasRevealed(true);
    } else if (p < 0.35 && hasRevealed) {
      setHasRevealed(false);
    }
  });

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ marginTop: '-18.875rem', paddingTop: '6.25rem', background: 'transparent', color: 'var(--text)' }}
      onMouseMove={handleMouseMove}
    >
      {/* Neon flicker CSS */}
      <style>{`
        @keyframes neonFlicker {
          0%   { opacity: 0; filter: brightness(0); }
          4%   { opacity: 0.9; filter: brightness(2.5); }
          6%   { opacity: 0.2; filter: brightness(0.5); }
          8%   { opacity: 1; filter: brightness(3); }
          10%  { opacity: 0; filter: brightness(0); }
          14%  { opacity: 0.85; filter: brightness(2); }
          16%  { opacity: 0.1; filter: brightness(0.3); }
          20%  { opacity: 1; filter: brightness(2.8); }
          24%  { opacity: 0.6; filter: brightness(1.5); }
          28%  { opacity: 1; filter: brightness(1); }
          100% { opacity: 1; filter: brightness(1); }
        }
        .neon-hidden { opacity: 0; filter: brightness(0); }
        .neon-flicker-in { animation: neonFlicker 1.2s ease-out forwards; }
      `}</style>

      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle, color-mix(in srgb, var(--text) 10%, transparent) 0.0625rem, transparent 0.0625rem)',
            backgroundSize: '2rem 2rem',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, #000 0%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, #000 0%, transparent 80%)',
          }}
        />
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[37.5rem] h-[37.5rem] rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, color-mix(in srgb, #2368e8 12%, transparent) 0%, color-mix(in srgb, #c4a17b 6%, transparent) 40%, transparent 70%)',
          }}
        />
      </div>

      {/* ─── SVG PATH SCROLL REVEAL ─── */}
      <div ref={svgContainerRef} className="relative" style={{ minHeight: '36.25rem' }}>
        {/* Centered SVG with path animation */}
        <div className="absolute inset-0 pointer-events-none z-10 px-4">
          <div
            className="absolute top-0 left-1/2"
            style={{ transform: 'translateX(-50%)', width: 'min(56.25rem, 100%)', height: '36.25rem' }}
          >
            <svg viewBox="-20 -70 900 630" width="100%" height="100%" preserveAspectRatio="xMidYMin meet" style={{ overflow: 'visible' }}>
              <defs>
                <filter id="privacy-glow" x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur stdDeviation="10" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="privacy-glow-sm" x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="privacyLineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2368e8" />
                  <stop offset="45%" stopColor="#69a7ff" />
                  <stop offset="100%" stopColor="#c4a17b" />
                </linearGradient>
                <linearGradient id="privacyAuraGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#69a7ff" />
                  <stop offset="50%" stopColor="#2368e8" />
                  <stop offset="100%" stopColor="#c4a17b" />
                </linearGradient>
              </defs>

              {/* Ghost path */}
              <path d={pathD} fill="none" stroke="rgba(20,20,30,0.12)" strokeWidth="1.2" />

              {/* Seamless connector line matching AI section's vertical line */}
              <line x1="430" y1="-70" x2="430" y2="0" stroke="#2368e8" strokeWidth="1.2" opacity="0.9" />
              <line x1="430" y1="-70" x2="430" y2="0" stroke="#2368e8" strokeWidth="8" opacity="0.1" />

              {/* Main line — gradient, matches AI section style */}
              <path
                d={pathD}
                fill="none"
                stroke="url(#privacyLineGradient)"
                strokeWidth="1.6"
                opacity="0.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={totalLength}
                strokeDashoffset={totalLength - drawnLength}
              />

              {/* Junction nodes */}
              {segmentLengths.slice(0, -1).map((node, i) => {
                const isActive = drawnLength >= node.cumLen;
                return (
                  <g key={i}>
                    <circle cx={node.x} cy={node.y} r={6.5} fill="none" stroke="rgba(20,20,30,0.18)" strokeWidth={1} />
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={3.8}
                      fill={isActive ? '#2368e8' : 'rgba(255,255,255,0.95)'}
                      stroke={isActive ? '#c4a17b' : 'rgba(20,20,30,0.2)'}
                      strokeWidth={1.4}
                      style={{ transition: 'all 0.14s ease-out' }}
                    />
                  </g>
                );
              })}

              {/* Moving tip */}
              {tipPos && (
                <g>
                  <circle cx={tipPos.x} cy={tipPos.y} r={6} fill="#c4a17b" opacity={0.25} />
                  <circle cx={tipPos.x} cy={tipPos.y} r={3} fill="#2368e8" opacity={0.95} />
                  <circle cx={tipPos.x} cy={tipPos.y} r={1.5} fill="#ffffff" />
                </g>
              )}
            </svg>
          </div>
        </div>

      </div>

      {/* ─── ORIGINAL SECTION CONTENT ─── */}
      <div
        ref={ref}
        className={`relative ${hasRevealed ? 'neon-flicker-in' : 'neon-hidden'}`}
        style={{ marginTop: '-3.75rem' }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 pt-8 pb-24 md:pb-32">
          {/* Top section: Lottie + Heading side by side */}
          <div className={`flex mb-20 ${hasDesktopPrivacySplit ? 'flex-row items-center gap-16' : 'flex-col items-center gap-12'}`}>
            {/* Left - Lottie Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-48 h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 flex-shrink-0"
            >
              {/* Soft brand glow ring behind the lock */}
              <div
                className="absolute -inset-3 rounded-full blur-2xl animate-pulse"
                style={{
                  background:
                    'radial-gradient(circle at 50% 50%, color-mix(in srgb, #2368e8 35%, transparent) 0%, color-mix(in srgb, #c4a17b 18%, transparent) 50%, transparent 80%)',
                }}
              />
              {/* Solid disc background so the lock animation reads clearly */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    'radial-gradient(circle at 30% 25%, #ffffff 0%, #f3f0e6 55%, #e7e0cc 100%)',
                  border: '1px solid color-mix(in srgb, var(--text) 14%, transparent)',
                  boxShadow:
                    '0 1.5rem 3rem -1rem color-mix(in srgb, #2368e8 25%, transparent), inset 0 0 1.5rem color-mix(in srgb, #c4a17b 22%, transparent)',
                }}
              />
              {/* Inner gradient ring for definition */}
              <div
                className="absolute inset-3 rounded-full"
                style={{
                  background:
                    'conic-gradient(from 140deg, #2368e8, #69a7ff, #c4a17b, #2368e8)',
                  opacity: 0.18,
                  filter: 'blur(0.25rem)',
                }}
              />
              <div className="relative w-full h-full flex items-center justify-center">
                {lottieData && (
                  <Suspense fallback={null}>
                    <Lottie
                      lottieRef={lottieRef}
                      animationData={lottieData}
                      autoplay={false}
                      loop={false}
                      className="w-32 h-32 md:w-44 md:h-44 lg:w-48 lg:h-48"
                      style={{
                        filter:
                          'drop-shadow(0 0.5rem 1rem color-mix(in srgb, #2368e8 35%, transparent)) contrast(1.05)',
                      }}
                    />
                  </Suspense>
                )}
              </div>
            </motion.div>

            {/* Right - Heading */}
            <div className={`flex flex-col ${hasDesktopPrivacySplit ? 'items-start text-left' : 'items-center text-center'}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest mb-10"
                style={{ color: 'color-mix(in srgb, var(--text) 55%, transparent)' }}
              >
                <ShieldCheck className="w-4 h-4" />
                Engineered for Trust
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tighter"
                style={{ color: 'var(--text)' }}
              >
                Security engineered
                <br />
                <span style={{ color: 'var(--text)' }}>into every </span>
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: PRIVACY_GRADIENT }}
                >
                  layer.
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg md:text-xl font-light leading-relaxed max-w-xl mt-8"
                style={{ color: 'color-mix(in srgb, var(--text) 65%, transparent)' }}
              >
                At MW Futuretech we build systems where security isn&apos;t an
                add-on — it&apos;s the architecture. Every byte encrypted,
                every action audited, every access verified.
              </motion.p>
            </div>
          </div>

          {/* Feature Cards Grid */}
        <div className={`grid gap-5 ${hasTabletPrivacyGrid ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {PRIVACY_FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`group relative rounded-2xl border ${feature.borderColor} backdrop-blur-sm p-6 md:p-8 transition-all duration-500 cursor-default overflow-hidden ${
                hoveredCard === i ? 'scale-[1.02]' : ''
              }`}
              style={{
                background: 'color-mix(in srgb, var(--bg) 60%, white 40%)',
              }}
            >
              {/* Hover glow */}
              <AnimatePresence>
                {hoveredCard === i && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-60 pointer-events-none`}
                  />
                )}
              </AnimatePresence>

              <div className="relative z-10 flex items-start gap-5">
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                  style={{ border: '1px solid color-mix(in srgb, var(--text) 8%, transparent)' }}
                >
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <div>
                  <h3
                    className="text-lg font-semibold mb-2 transition-colors"
                    style={{ color: 'var(--text)' }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed transition-colors"
                    style={{ color: 'color-mix(in srgb, var(--text) 62%, transparent)' }}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom trust bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-12"
        >
          {[
            { icon: Server, label: 'Protected infrastructure' },
            { icon: Lock, label: 'AES-256 Encryption' },
            { icon: Eye, label: 'Permission-based visibility' },
            { icon: ShieldCheck, label: 'Operational accountability' },
          ].map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-2.5 text-sm"
              style={{ color: 'color-mix(in srgb, var(--text) 55%, transparent)' }}
            >
              <badge.icon
                className="w-4 h-4"
                style={{ color: 'color-mix(in srgb, var(--text) 50%, transparent)' }}
              />
              {badge.label}
            </div>
          ))}
        </motion.div>
        </div>
      </div>
    </section>
  );
}

export default PrivacySection;
