import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export function Loader({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const start = performance.now();
    const duration = 2400;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(eased * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => setDone(true), 350);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[9999]"
          initial={{ scale: 1, y: 0, borderRadius: 0 }}
          exit={{
            scale: 0.82,
            y: "-110%",
            borderRadius: 32,
          }}
          transition={{
            duration: 1.4,
            ease: [0.76, 0, 0.24, 1],
            scale: { duration: 0.7, ease: [0.65, 0, 0.35, 1] },
            y: { duration: 1.2, ease: [0.76, 0, 0.24, 1], delay: 0.5 },
            borderRadius: { duration: 0.7, ease: [0.65, 0, 0.35, 1] },
          }}
          style={{ transformOrigin: "center center", overflow: "hidden" }}
        >
          <div className="absolute inset-0 bg-[#f4f1ec]" />

          <div className="relative h-full w-full flex items-end justify-between px-8 pb-10 text-[#111]">
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div
                style={{
                  fontSize: "clamp(80px, 18vw, 260px)",
                  lineHeight: 0.9,
                  fontWeight: 500,
                  letterSpacing: "-0.04em",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {count}
              </div>
            </motion.div>

            <motion.div
              className="pb-6 uppercase"
              style={{ fontSize: 12, letterSpacing: "0.2em" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Loading
            </motion.div>
          </div>

          <motion.div
            className="absolute left-0 bottom-0 h-px bg-[#111]/60"
            initial={{ width: 0 }}
            animate={{ width: `${count}%` }}
            transition={{ ease: "linear", duration: 0.05 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}