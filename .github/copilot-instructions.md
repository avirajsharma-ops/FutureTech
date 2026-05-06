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

- All GLB models live in `/public/models/` and **must be meshopt-compressed**
  via `gltfpack` (`npx gltfpack -i in.glb -o out-optimized.glb -cc`). Suffix
  the optimized file with `-optimized.glb`.
- Models are cached in browser Cache Storage (`mwft-model-cache-v2`) — never
  fetch a model directly. Always go through the shared model pipeline.
- Avoid `antialias: true` and high DPR on mobile/low-end devices
- Never load HDR `<Environment>` on mobile / low-power devices
- Always disable `castShadow`, `receiveShadow` on every hero/model mesh

## 3D Model Lighting — SHARED SILVER PROFILE

All hero/page GLB models should use the shared silver lighting/material
profile unless the user explicitly asks for a different art direction.

- Import `SILVER_MODEL_LIGHTING_PROPS` from `src/components/HeroScene.jsx`.
- Spread it into every page-level `<HeroScene />` that renders a GLB model:
  ```jsx
  <HeroScene
    modelUrl={modelUrl}
    title="..."
    tagline="..."
    introStartRef={introStartRef}
    {...SILVER_MODEL_LIGHTING_PROPS}
  />
  ```
- This profile sets front/rim/fill lighting, a light silvery material tint,
  reflective env-map intensity, subtle emissive fill, and tone-mapping
  exposure so metallic GLBs do not read black on desktop or mobile.
- Do not duplicate these numeric values in page files. Update the shared
  constant once if the global model look needs to change.

---

## 3D Model Pipeline — MANDATORY FOR EVERY NEW MODEL

Every 3D model added to the app **must** follow this pipeline. Do not
introduce one-off `useGLTF('/path.glb')` calls outside it.

### 1. Add the asset
- Drop the GLB in `public/models/` and run gltfpack with `-cc` (meshopt).
  ```bash
  npx gltfpack -i public/models/raw.glb -o public/models/<name>-optimized.glb -cc
  ```
- Delete the uncompressed source.

### 2. Register a cache module
Create `src/lib/<name>Model.js`:
```js
import { registerModel } from './modelCache'
export const FOO_MODEL_URL = '/models/foo-optimized.glb'
const entry = registerModel(FOO_MODEL_URL)
export const fooModelPromise = entry.promise
export const getFooModelReady = entry.isReady
export const getFooModelUrl = entry.getUrl
```
This guarantees: Cache-Storage warm-up on import, blob-URL hand-off, and a
synchronous `isReady() / getUrl()` pair for first-paint seeding.

### 3. Add the URL to the prefetch list
In `App.jsx`, append to `PREFETCH_ASSETS` so it's prefetched after the
homepage is idle (non-render-blocking via `<link rel="prefetch">`).

### 4. Build the scene component
- **Always clone the scene per instance**: `const cloned = useMemo(() => scene.clone(true), [scene])`.
  Drei's `useGLTF` shares one `Object3D` across consumers; without cloning,
  the page-exit overlay's duplicate canvas will steal the parent and the
  live page goes blank.
- **Seed `modelUrl` synchronously** when the cache is ready:
  `useState(getFooModelReady() ? getFooModelUrl() : null)`. Avoids the
  "blank canvas after route switch" race.
- **Delay `IntersectionObserver`** by ~2s before pinning `frameloop="never"`,
  so the canvas is guaranteed to paint its first frames after navigation.
- **Per-instance overlay rest pose**: if your component has a mount
  animation (drop, fade, etc.), check `document.documentElement.hasAttribute('data-transitioning')`
  on mount — when true, render the model in its **final rest pose** so the
  page-exit slide-up shows the model, not an empty canvas.
- **`useGLTF.preload(cachedUrl)`** the moment the blob URL resolves to warm
  drei's GLTF cache for the overlay clone.

### 5. Mount-time animation convention
When a model has a "drop / reveal / fade-in" mount animation, **arm the
timer when `<html data-transitioning>` is removed**, not on `useEffect`
mount. The route-switch overlay covers the page for ~1.2s; arming on mount
means the user never sees the animation. Use a `MutationObserver` on the
`data-transitioning` attribute with a `setTimeout(arm, 1800)` safety net.

Page-level model welcome animations play **every time a user visits a route
with a 3D model**. `App.jsx` owns the route-level `introStartRef`, resets it
on each model-route visit, and arms it after the loader/page transition delay.
Use one stable intro ref per model route so arming the incoming page does not
reset the outgoing model during route transitions. Do not start per-page intro
timers inside individual page components.

---

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
