/**
 * Hidden SVG defs that power the Liquid Glass refraction.
 * Mount once near the root of the app.
 *
 * The displacement filter warps whatever sits behind any
 * element using `backdrop-filter: url(#liquid-glass-distortion)`.
 */
export default function LiquidGlassDefs() {
  return (
    <svg
      aria-hidden="true"
      width="0"
      height="0"
      style={{
        position: 'absolute',
        width: 0,
        height: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <defs>
        <filter
          id="liquid-glass-distortion"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.018"
            numOctaves="2"
            seed="7"
            result="noise"
          />
          <feGaussianBlur in="noise" stdDeviation="1.5" result="softNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="softNoise"
            scale="38"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  )
}
