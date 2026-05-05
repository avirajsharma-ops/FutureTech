# MW Futuretech — Copilot Instructions

## Project Context
- React + Vite SPA, hosted on Vercel
- Hero section uses React Three Fiber (Three.js) to render a 3D GLB model
- Light/dark theme toggle (default: light)
- Light bg: pearl white (#fdfcf7), Dark bg: near-black (#050505)

---

## Responsiveness — MANDATORY FOR EVERY COMPONENT

Every element, section, and component **must** be fully responsive across all three tiers.
Never ship CSS without rules for all three breakpoints below.

### Breakpoint tiers

| Name        | Max-width | Targets                        |
|-------------|-----------|--------------------------------|
| Desktop     | (default) | 1025px and above               |
| Tablet      | 1024px    | iPad, landscape tablets        |
| Mobile      | 768px     | Phones, portrait tablets       |
| Small phone | 480px     | Compact phones (SE, small Android) |

### Rules

1. **Always use `clamp()` for font sizes** — never hard-code `px` font values that don't scale.
   ```css
   font-size: clamp(1rem, 2.5vw, 2rem);
   ```

2. **Use fluid spacing** — prefer `clamp()` or `min()` for `padding`, `gap`, `margin` where appropriate.

3. **Write CSS mobile-first or include all breakpoints** — default styles serve desktop, then add `@media (max-width: ...)` blocks for tablet and mobile in that order.

4. **Every `@media` block must cascade correctly:**
   ```css
   /* Default (desktop) */
   .element { ... }

   /* Tablet */
   @media (max-width: 1024px) { .element { ... } }

   /* Mobile */
   @media (max-width: 768px) { .element { ... } }

   /* Small phone */
   @media (max-width: 480px) { .element { ... } }
   ```

5. **Touch targets** — all interactive elements must be at least 44×44px on mobile.

6. **No fixed widths in px for layout containers** — use `%`, `vw`, `max-width`, or CSS Grid/Flex.

7. **3D canvas (Three.js / R3F)** — the canvas must always be `width: 100vw; height: 100vh`. Model framing must account for narrower aspect ratios on mobile by adjusting `topOffsetRatio` dynamically.

8. **Overlay text over 3D canvas** — ensure gradient fade height grows on mobile so text never overlaps the model focal point.

9. **Test mentality** — before completing any UI task, mentally verify at 375px, 768px, 1280px, and 1920px widths.

---

## Theme

- Use CSS custom properties defined in `src/index.css`
- Never hardcode color values outside of those variables
- Default theme is **light**
- Dark theme is toggled via `data-theme="dark"` on `<html>`
- Theme toggle = floating sun↔moon FAB at bottom-left (`<ThemeToggle />`).
  Never put a theme switch button anywhere else.

---

## Liquid Glass Design System — USE FOR ALL UI SURFACES

All buttons, pills, headers, cards, modals, FABs, and floating panels
**must** use the shared Liquid Glass system in `src/styles/liquid-glass.css`.
Do not invent new glass styles or one-off `backdrop-filter` rules per element.

### Required setup
- `<LiquidGlassDefs />` is mounted once near the root of `App.jsx` and
  provides the SVG displacement filter (`#liquid-glass-distortion`) used
  for refraction. Never remove it.
- `liquid-glass.css` is imported once globally in `App.jsx`.

### How to apply
```jsx
<button className="liquid-glass liquid-glass-button">Click me</button>
<div className="liquid-glass liquid-glass--card">Card</div>
<div className="liquid-glass liquid-glass--strong">Floating panel</div>
<div className="liquid-glass liquid-glass--circle liquid-glass-button">FAB</div>
```

### Class reference
| Class                       | Purpose                                  |
|----------------------------|------------------------------------------|
| `.liquid-glass`            | Base glass surface (pill shape default)  |
| `.liquid-glass--card`      | 18px radius card                         |
| `.liquid-glass--circle`    | Perfect circle (FABs / icon buttons)     |
| `.liquid-glass--strong`    | Heavier blur for floating panels         |
| `.liquid-glass--animated`  | Adds liquid shimmer animation            |
| `.liquid-glass-button`     | Adds button cursor + hover/active states |

### Rules
1. **Never use raw `backdrop-filter` on UI surfaces.** Always go through the shared classes.
2. **All interactive surfaces must include `.liquid-glass-button`** for touch + focus styling.
3. **Refraction is automatic** via the `::before` displacement layer — do not duplicate it.
4. **Top light highlight is automatic** via `::after` — do not duplicate it.
5. **Color tokens** (`--lg-tint`, `--lg-border`, `--lg-text`) auto-switch with theme. Never hardcode.
6. **Floating header** uses `.liquid-glass--strong .liquid-glass--animated`.
7. **Bottom-left theme FAB** uses `.liquid-glass--circle .liquid-glass-button`.
8. **Always test** glass surfaces against both light and dark backdrops.

---

## Performance

- GLB model served from `/public/models/mwft-hero-optimized.glb` (28 MB, meshopt compressed)
- Model is cached in browser Cache Storage (`mwft-model-cache-v2`)
- Avoid `antialias: true` and high DPR on mobile/low-end devices
- Never load HDR environment on mobile
- Always disable `castShadow`, `receiveShadow` on hero model meshes

## File Structure

```
src/
  App.jsx       — main page with hero section + 3D scene
  App.css       — hero, overlay, loader, responsive styles
  index.css     — CSS variables + base reset
public/
  models/
    mwft-hero-optimized.glb
```
