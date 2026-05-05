import './ThemeToggle.css'

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className="theme-toggle-fab liquid-glass liquid-glass--circle liquid-glass-button"
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      data-theme={theme}
    >
      <svg
        className="theme-toggle-fab__icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <defs>
          <mask id="theme-toggle-mask">
            <rect x="0" y="0" width="24" height="24" fill="white" />
            <circle
              className="theme-toggle-fab__cutout"
              cx={isDark ? 17 : 28}
              cy={isDark ? 8 : -4}
              r="7"
              fill="black"
            />
          </mask>
        </defs>

        <circle
          className="theme-toggle-fab__body"
          cx="12"
          cy="12"
          r={isDark ? 7 : 5}
          fill="currentColor"
          mask="url(#theme-toggle-mask)"
        />

        <g
          className="theme-toggle-fab__rays"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        >
          <line x1="12" y1="2" x2="12" y2="4.5" />
          <line x1="12" y1="19.5" x2="12" y2="22" />
          <line x1="2" y1="12" x2="4.5" y2="12" />
          <line x1="19.5" y1="12" x2="22" y2="12" />
          <line x1="4.6" y1="4.6" x2="6.4" y2="6.4" />
          <line x1="17.6" y1="17.6" x2="19.4" y2="19.4" />
          <line x1="4.6" y1="19.4" x2="6.4" y2="17.6" />
          <line x1="17.6" y1="6.4" x2="19.4" y2="4.6" />
        </g>
      </svg>
    </button>
  )
}
