import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, useGLTF } from '@react-three/drei'
import { Box3, Color, PMREMGenerator, Vector3 } from 'three'
import { heroModelPromise, getHeroModelReady, getHeroModelUrl } from '../lib/heroModel'

const REST_Z = 0
const END_X_ROTATION = -0.18
const START_Y_ROTATION = 0.92
const REST_Y_ROTATION = -0.75
const TOP_OFFSET_RATIO = 0.15
const INTRO_ROTATE_SECONDS = 2.4
const INTRO_ACTIVE_RENDER_MS = 5200
const STATIC_ACTIVE_RENDER_MS = 1800
const INTERACTION_ACTIVE_RENDER_MS = 900
const POINTER_ACTIVE_RENDER_MS = 220
const SCROLL_ACTIVE_RENDER_MS = 320

// Subtle parallax bounds (radians). Keep small so it feels alive but never busy.
const POINTER_TILT_X = 0.08 // tilt up/down based on mouse Y
const POINTER_TILT_Y = 0.12 // sway left/right based on mouse X
// Even subtler bounds used when dragAxis === 'z' (e.g. the coin).
const SUBTLE_TILT_Y = 0.04
const SUBTLE_TILT_Z = 0.05

export const SILVER_MODEL_LIGHTING_PROPS = {
  frontLight: true,
  ambientIntensity: 1.65,
  keyLightIntensity: 3.4,
  fillLightIntensity: 2.1,
  frontLightIntensity: 3.1,
  rimLightIntensity: 1.6,
  materialColor: '#dbe3ec',
  materialMetalness: 0.82,
  materialRoughness: 0.34,
  materialEnvMapIntensity: 2.4,
  materialEmissive: '#c9d2dc',
  materialEmissiveIntensity: 0.08,
  toneMappingExposure: 1.18,
}

const isTouchDevice = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(pointer: coarse)').matches || 'ontouchstart' in window)

const isMobileViewport = () =>
  typeof window !== 'undefined' && window.innerWidth <= 768

const isLowPowerDevice = () => {
  if (typeof navigator === 'undefined') return false
  const cores = navigator.hardwareConcurrency || 8
  const mem = navigator.deviceMemory || 8
  return isMobileViewport() || cores <= 4 || mem <= 4
}

const getTopOffsetRatio = () => {
  if (typeof window === 'undefined') return TOP_OFFSET_RATIO
  return window.innerWidth <= 480 ? 0.08 : window.innerWidth <= 768 ? 0.10 : TOP_OFFSET_RATIO
}

function HeroModel({
  modelUrl,
  dragCurrentRef,
  dragTargetRef,
  scrollYRef,
  introStartRef,
  pointerTiltRef,
  enableIntro,
  onLoaded,
  baseRotation,
  scaleMultiplier,
  mobileOnlyScale,
  mobileScaleMultiplier,
  yOffset,
  mobileYOffset,
  centerVertically,
  dragAxis,
  introAxis,
  introStartOffset,
  materialColor,
  materialMetalness,
  materialRoughness,
  materialEnvMapIntensity,
  materialEmissive,
  materialEmissiveIntensity,
}) {
  const groupRef = useRef(null)
  const tiltCurrentRef = useRef({ x: 0, y: 0, z: 0 })
  const { scene } = useGLTF(modelUrl)
  // Clone the scene per instance. useGLTF caches and SHARES a single
  // Three.js Object3D across all consumers — a Three object can only
  // belong to one parent, so when two HeroScene canvases mount
  // simultaneously (the live page and the page-exit overlay) the second
  // mount steals the scene from the first. Cloning gives every canvas
  // its own independent copy.
  const clonedScene = useMemo(() => scene.clone(true), [scene])
  const { viewport, size } = useThree()
  const isMobile = size.width <= 768

  useEffect(() => {
    onLoaded?.()
  }, [onLoaded])

  useEffect(() => {
    clonedScene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = false
        obj.receiveShadow = false
        obj.frustumCulled = true
        if (obj.material) {
          const shouldCloneMaterial =
            materialColor != null ||
            materialMetalness != null ||
            materialRoughness != null ||
            materialEnvMapIntensity != null ||
            materialEmissive != null ||
            materialEmissiveIntensity != null
          if (shouldCloneMaterial && !obj.userData.materialClonedForHero) {
            obj.material = Array.isArray(obj.material)
              ? obj.material.map((mat) => mat.clone())
              : obj.material.clone()
            obj.userData.materialClonedForHero = true
          }
          const materials = Array.isArray(obj.material) ? obj.material : [obj.material]
          materials.forEach((material) => {
            if (material.map) {
              material.map.anisotropy = 1
              material.map.generateMipmaps = true
            }
            if (materialColor && material.color) {
              material.color = new Color(materialColor)
            }
            if (materialMetalness != null && 'metalness' in material) {
              material.metalness = materialMetalness
            }
            if (materialRoughness != null && 'roughness' in material) {
              material.roughness = materialRoughness
            }
            if (materialEnvMapIntensity != null && 'envMapIntensity' in material) {
              material.envMapIntensity = materialEnvMapIntensity
            }
            if (materialEmissive && material.emissive) {
              material.emissive = new Color(materialEmissive)
            }
            if (materialEmissiveIntensity != null && 'emissiveIntensity' in material) {
              material.emissiveIntensity = materialEmissiveIntensity
            }
            material.flatShading = false
            material.precision = isMobile ? 'mediump' : 'highp'
            material.needsUpdate = true
          })
        }
      }
    })
  }, [
    clonedScene,
    isMobile,
    materialColor,
    materialMetalness,
    materialRoughness,
    materialEnvMapIntensity,
    materialEmissive,
    materialEmissiveIntensity,
  ])

  const bounds = useMemo(() => {
    const box = new Box3().setFromObject(clonedScene)
    const s = new Vector3()
    const c = new Vector3()
    box.getSize(s)
    box.getCenter(c)
    return { sizeX: s.x, sizeY: s.y, minY: box.min.y, centerY: c.y }
  }, [clonedScene])

  const topOffset = isMobile ? getTopOffsetRatio() : TOP_OFFSET_RATIO
  const heightScale = (viewport.height * (1 - topOffset)) / bounds.sizeY
  const maxWidth = isMobile ? viewport.width * 0.96 : viewport.width
  const widthScale = maxWidth / bounds.sizeX
  // Resolve the active scale multiplier:
  //  - mobileScaleMultiplier (when set) overrides on mobile.
  //  - mobileOnlyScale gates scaleMultiplier to mobile only.
  let effectiveScaleMul = scaleMultiplier ?? 1
  if (isMobile && mobileScaleMultiplier != null) {
    effectiveScaleMul = mobileScaleMultiplier
  } else if (mobileOnlyScale && !isMobile) {
    effectiveScaleMul = 1
  }
  const effectiveYOffset = isMobile && mobileYOffset != null ? mobileYOffset : yOffset ?? 0
  const scale = Math.min(heightScale, widthScale) * effectiveScaleMul
  // Default: anchor model so its bottom sits at the bottom of the viewport.
  // centerVertically: anchor by centre, so a flat coin reads as floating.
  const restY = centerVertically
    ? -bounds.centerY * scale + effectiveYOffset
    : -viewport.height / 2 - bounds.minY * scale + effectiveYOffset

  useFrame((_, delta) => {
    if (!groupRef.current) return
    dragCurrentRef.current += (dragTargetRef.current - dragCurrentRef.current) * Math.min(1, delta * 7)

    // Smoothly chase the pointer-derived tilt targets. The axes used
    // depend on dragAxis: 'z' mode produces a subtle Z+Y parallax,
    // every other mode keeps the original X+Y parallax.
    const lerp = Math.min(1, delta * 4)
    if (dragAxis === 'z') {
      const targetTiltZ = -pointerTiltRef.current.y * SUBTLE_TILT_Z // mouse X -> roll
      const targetTiltY = pointerTiltRef.current.x * SUBTLE_TILT_Y // mouse Y -> yaw
      tiltCurrentRef.current.z += (targetTiltZ - tiltCurrentRef.current.z) * lerp
      tiltCurrentRef.current.y += (targetTiltY - tiltCurrentRef.current.y) * lerp
      tiltCurrentRef.current.x += (0 - tiltCurrentRef.current.x) * lerp
    } else {
      const targetTiltX = pointerTiltRef.current.x * POINTER_TILT_X
      const targetTiltY = pointerTiltRef.current.y * POINTER_TILT_Y
      tiltCurrentRef.current.x += (targetTiltX - tiltCurrentRef.current.x) * lerp
      tiltCurrentRef.current.y += (targetTiltY - tiltCurrentRef.current.y) * lerp
      tiltCurrentRef.current.z += (0 - tiltCurrentRef.current.z) * lerp
    }

    let t = enableIntro ? 0 : 1
    if (enableIntro && introStartRef?.current != null) {
      const elapsed = (performance.now() - introStartRef.current) / 1000
      const linear = Math.min(1, Math.max(0, elapsed / INTRO_ROTATE_SECONDS))
      t = 1 - (1 - linear) ** 3
    }

    const scrollRotation = scrollYRef ? -(scrollYRef.current / 4000) * Math.PI * 2 : 0
    const baseX = baseRotation?.[0] ?? END_X_ROTATION
    const baseY = baseRotation?.[1] ?? REST_Y_ROTATION
    const baseZ = baseRotation?.[2] ?? 0
    // Scripted intro: by default we lerp Y from START_Y_ROTATION -> baseY
    // (the homepage hero behaviour). When introAxis==='z' we instead lerp
    // Z from (baseZ + introStartOffset) -> baseZ, used for the coin which
    // enters spun on its depth axis.
    const introIsZ = introAxis === 'z'
    const scriptedY = !introIsZ && enableIntro
      ? START_Y_ROTATION + (baseY - START_Y_ROTATION) * t
      : baseY
    const introZStart = baseZ + (introStartOffset ?? 1.6)
    const scriptedZ = introIsZ && enableIntro
      ? introZStart + (baseZ - introZStart) * t
      : baseZ
    // Drag axis routing.
    if (dragAxis === 'x') {
      groupRef.current.rotation.y = scriptedY + scrollRotation + tiltCurrentRef.current.y
      groupRef.current.rotation.x = baseX + dragCurrentRef.current + tiltCurrentRef.current.x
      groupRef.current.rotation.z = scriptedZ + tiltCurrentRef.current.z
    } else if (dragAxis === 'z') {
      groupRef.current.rotation.y = scriptedY + scrollRotation + tiltCurrentRef.current.y
      groupRef.current.rotation.x = baseX + tiltCurrentRef.current.x
      groupRef.current.rotation.z = scriptedZ + dragCurrentRef.current + tiltCurrentRef.current.z
    } else {
      groupRef.current.rotation.y =
        scriptedY + dragCurrentRef.current + scrollRotation + tiltCurrentRef.current.y
      groupRef.current.rotation.x = baseX + tiltCurrentRef.current.x
      groupRef.current.rotation.z = scriptedZ + tiltCurrentRef.current.z
    }
    groupRef.current.position.z = REST_Z
    groupRef.current.position.y = restY
  })

  const initialBaseX = baseRotation?.[0] ?? END_X_ROTATION
  const initialBaseY = baseRotation?.[1] ?? REST_Y_ROTATION
  const initialBaseZ = baseRotation?.[2] ?? 0
  const introIsZInit = introAxis === 'z'
  const initialY = enableIntro && !introIsZInit ? START_Y_ROTATION : initialBaseY
  const initialZ = enableIntro && introIsZInit
    ? initialBaseZ + (introStartOffset ?? 1.6)
    : initialBaseZ

  return (
    <group
      ref={groupRef}
      scale={scale}
      position={[0, restY, REST_Z]}
      rotation={[initialBaseX, initialY, initialZ]}
    >
      <primitive object={clonedScene} />
    </group>
  )
}

// Lightweight, procedurally-generated PBR environment. We use this on
// low-power / mobile devices where the full HDR <Environment preset>
// is too heavy. Without an env map, metallic materials read as flat
// black on phones — RoomEnvironment gives them something to reflect
// without any network fetch.
function ProceduralEnv() {
  const { gl, scene } = useThree()
  useEffect(() => {
    let envTex
    let pmrem
    let cancelled = false
    import('three/examples/jsm/environments/RoomEnvironment.js').then(
      ({ RoomEnvironment }) => {
        if (cancelled) return
        pmrem = new PMREMGenerator(gl)
        const room = new RoomEnvironment()
        envTex = pmrem.fromScene(room, 0.04).texture
        scene.environment = envTex
      },
    )
    return () => {
      cancelled = true
      if (envTex) envTex.dispose()
      if (pmrem) pmrem.dispose()
      scene.environment = null
    }
  }, [gl, scene])
  return null
}

/**
 * Reusable hero section: full-viewport 3D model + headline overlay.
 *
 * Props:
 *  - title, tagline, eyebrow: overlay copy.
 *  - modelUrl: optional override (defaults to the cached homepage model).
 *  - introStartRef: optional ref carrying the intro start timestamp.
 *      When omitted (inner pages), the model snaps to its rest pose.
 *  - baseRotation: [x, y, z] in radians — per-model rest pose. Defaults
 *      to the homepage hero values. Use for models that need a different
 *      orientation (e.g. a coin lying flat needs an X tilt to face camera).
 *  - scaleMultiplier: number (default 1) — scales the auto-fit size.
 *      Use values < 1 for models that fill the viewport too aggressively.
 *  - mobileOnlyScale: boolean (default false) — only apply scaleMultiplier
 *      on mobile viewports (≤ 768px). Use when a model is correctly
 *      sized on desktop but needs enlarging on phones.
 *  - mobileScaleMultiplier: number — overrides scaleMultiplier on mobile.
 *      Use to set independent sizes for desktop vs. phones.
 *  - yOffset/mobileYOffset: optional world-space vertical offsets for
 *      per-model framing. Positive values move the model upward.
 *  - centerVertically: boolean (default false) — anchor the model by its
 *      centre instead of resting it on the bottom of the viewport.
 *  - dragAxis: 'x' | 'y' | 'z' (default 'y') — which rotation axis
 *      receives pointer drag. 'z' also switches parallax to a subtle
 *      Z+Y blend (used by the about-page coin).
 *  - dragDirection: 1 | -1 (default 1) — flips pointer drag direction
 *      for models whose natural orientation feels inverted.
 *  - frontLight: boolean (default false) — add a directional light
 *      placed along the camera axis so a model's front face reads bright.
 *  - introAxis: 'y' | 'z' (default 'y') — which axis the scripted intro
 *      animates. 'z' starts the model rolled around its depth axis and
 *      eases back to its rest pose.
 *  - introStartOffset: number (radians, default 1.6 for 'z') — how far
 *      off the rest pose the intro starts on its chosen axis.
 *  - ambientIntensity, keyLightIntensity, fillLightIntensity,
 *      frontLightIntensity, rimLightIntensity: optional light overrides.
 *  - materialColor/materialMetalness/materialRoughness/materialEnvMapIntensity:
 *      optional per-instance material lift for dark metallic GLBs.
 *  - materialEmissive/materialEmissiveIntensity: optional soft self-fill.
 */
export default function HeroScene({
  title,
  tagline,
  eyebrow,
  modelUrl: modelUrlProp,
  introStartRef,
  baseRotation,
  scaleMultiplier,
  mobileOnlyScale,
  mobileScaleMultiplier,
  yOffset,
  mobileYOffset,
  centerVertically,
  dragAxis,
  dragDirection,
  frontLight,
  ambientIntensity,
  keyLightIntensity,
  fillLightIntensity,
  frontLightIntensity,
  rimLightIntensity,
  materialColor,
  materialMetalness,
  materialRoughness,
  materialEnvMapIntensity,
  materialEmissive,
  materialEmissiveIntensity,
  toneMappingExposure,
  introAxis,
  introStartOffset,
  backgroundImage,
}) {
  const enableIntro = Boolean(introStartRef)
  // If the cached blob URL is already resolved (true on every navigation
  // after the homepage), seed state synchronously so the Canvas mounts on
  // the very first render with a valid URL — no microtask round-trip,
  // no "blank canvas until reload" race after a route switch.
  const [modelUrl, setModelUrl] = useState(
    modelUrlProp || (getHeroModelReady() ? getHeroModelUrl() : null),
  )
  const [, setIsSceneReady] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [isRenderActive, setIsRenderActive] = useState(true)
  const renderActiveRef = useRef(true)
  const renderIdleTimerRef = useRef(null)
  const dragCurrentRef = useRef(0)
  const dragTargetRef = useRef(0)
  const scrollYRef = useRef(0)
  const pointerRef = useRef({ active: false, lastX: 0 })
  const pointerTiltRef = useRef({ x: 0, y: 0 })
  const heroSectionRef = useRef(null)

  const deviceProfile = useMemo(
    () => ({
      lowPower: isLowPowerDevice(),
      touch: isTouchDevice(),
      mobile: isMobileViewport(),
    }),
    [],
  )
  const frameloop = isVisible ? (isRenderActive ? 'always' : 'demand') : 'never'
  const ambientLightIntensity = ambientIntensity ?? (deviceProfile.lowPower ? 1.35 : 1.15)
  const keyLight = keyLightIntensity ?? (deviceProfile.lowPower ? 2.6 : 2.3)
  const fillLight = fillLightIntensity ?? (deviceProfile.lowPower ? 1.5 : 1.25)
  const frontLightValue = frontLightIntensity ?? (deviceProfile.lowPower ? 2.4 : 2.0)

  const scheduleRenderIdle = useCallback((duration) => {
    window.clearTimeout(renderIdleTimerRef.current)
    renderIdleTimerRef.current = window.setTimeout(() => {
      renderActiveRef.current = false
      setIsRenderActive(false)
    }, duration)
  }, [])

  const activateRenderLoop = useCallback((duration = INTERACTION_ACTIVE_RENDER_MS) => {
    if (!renderActiveRef.current) {
      renderActiveRef.current = true
      setIsRenderActive(true)
    }
    scheduleRenderIdle(duration)
  }, [scheduleRenderIdle])

  useEffect(() => () => {
    window.clearTimeout(renderIdleTimerRef.current)
  }, [])

  useEffect(() => {
    if (!modelUrl) return undefined
    const startTimer = window.setTimeout(() => {
      activateRenderLoop(enableIntro ? INTRO_ACTIVE_RENDER_MS : STATIC_ACTIVE_RENDER_MS)
    }, 0)
    return () => window.clearTimeout(startTimer)
  }, [activateRenderLoop, enableIntro, modelUrl])

  const updatePointerTilt = (node, clientX, clientY) => {
    const rect = node.getBoundingClientRect()
    const nx = ((clientX - rect.left) / rect.width) * 2 - 1 // -1..1
    const ny = ((clientY - rect.top) / rect.height) * 2 - 1 // -1..1 (top = -1)
    pointerTiltRef.current.x = Math.max(-1, Math.min(1, ny))
    pointerTiltRef.current.y = Math.max(-1, Math.min(1, nx))
  }

  const resetPointerTilt = () => {
    pointerTiltRef.current.x = 0
    pointerTiltRef.current.y = 0
  }

  // Pause render loop when offscreen — but only AFTER the canvas has
  // had time to mount and render its first frames. If we attach the
  // observer immediately, the new live page's canvas (which mounts
  // beneath the fixed exit overlay during a route switch) can be
  // mis-measured and pinned to frameloop="never" before it ever paints,
  // leaving the model invisible until a manual reload.
  useEffect(() => {
    const node = heroSectionRef.current
    if (!node || typeof IntersectionObserver === 'undefined') return
    let io
    const startTimer = setTimeout(() => {
      io = new IntersectionObserver(
        ([entry]) => {
          setIsVisible(entry.isIntersecting)
          if (entry.isIntersecting) activateRenderLoop(STATIC_ACTIVE_RENDER_MS)
        },
        { threshold: 0.01 },
      )
      io.observe(node)
    }, 2000)
    return () => {
      clearTimeout(startTimer)
      io?.disconnect()
    }
  }, [activateRenderLoop])

  // Scroll → model rotation hook (homepage uses this; harmless on inner pages).
  useEffect(() => {
    let frameId = 0
    const onScroll = () => {
      scrollYRef.current = window.scrollY
      if (frameId) return
      frameId = window.requestAnimationFrame(() => {
        frameId = 0
        activateRenderLoop(SCROLL_ACTIVE_RENDER_MS)
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frameId) window.cancelAnimationFrame(frameId)
    }
  }, [activateRenderLoop])

  // Resolve cached model URL (for the homepage hand-off path) and
  // pre-warm drei's GLTF cache for that exact URL so subsequent mounts
  // (e.g. the page-exit overlay) get the model synchronously and don't
  // re-suspend mid-transition (which would cause the model to pop in
  // at a different visual size).
  useEffect(() => {
    if (modelUrlProp) return
    let isMounted = true
    heroModelPromise.then((cachedUrl) => {
      if (!isMounted) return
      setModelUrl(cachedUrl)
      try {
        useGLTF.preload(cachedUrl)
      } catch {
        // ignore — preload is best-effort
      }
    })
    return () => {
      isMounted = false
    }
  }, [modelUrlProp])

  const handlePointerDown = (e) => {
    pointerRef.current.active = true
    pointerRef.current.lastX = e.clientX
    pointerRef.current.startX = e.clientX
    pointerRef.current.startY = e.clientY
    pointerRef.current.captured = false
    pointerRef.current.pointerType = e.pointerType
    if (e.pointerType === 'mouse') {
      e.currentTarget.setPointerCapture?.(e.pointerId)
      pointerRef.current.captured = true
    }
    activateRenderLoop(INTERACTION_ACTIVE_RENDER_MS)
  }
  const handlePointerMove = (e) => {
    if (!deviceProfile.lowPower && (e.pointerType === 'mouse' || e.pointerType === 'pen')) {
      updatePointerTilt(e.currentTarget, e.clientX, e.clientY)
      activateRenderLoop(POINTER_ACTIVE_RENDER_MS)
    }
    if (!pointerRef.current.active) return
    const dx = e.clientX - pointerRef.current.lastX
    if (!pointerRef.current.captured && pointerRef.current.pointerType !== 'mouse') {
      const totalDx = Math.abs(e.clientX - pointerRef.current.startX)
      const totalDy = Math.abs(e.clientY - pointerRef.current.startY)
      if (totalDy > 8 && totalDy > totalDx) {
        pointerRef.current.active = false
        return
      }
      if (totalDx > 8 && totalDx > totalDy) {
        e.currentTarget.setPointerCapture?.(e.pointerId)
        pointerRef.current.captured = true
      } else {
        pointerRef.current.lastX = e.clientX
        return
      }
    }
    pointerRef.current.lastX = e.clientX
    const dragSign = dragDirection ?? 1
    dragTargetRef.current = Math.max(
      -1.35,
      Math.min(1.35, dragTargetRef.current + dx * 0.006 * dragSign),
    )
    activateRenderLoop(INTERACTION_ACTIVE_RENDER_MS)
  }
  const handlePointerUp = (e) => {
    pointerRef.current.active = false
    dragTargetRef.current = 0
    if (pointerRef.current.captured) {
      e.currentTarget.releasePointerCapture?.(e.pointerId)
      pointerRef.current.captured = false
    }
    activateRenderLoop(INTERACTION_ACTIVE_RENDER_MS)
  }

  const handlePointerLeave = (e) => {
    resetPointerTilt()
    handlePointerUp(e)
  }

  return (
    <section
      className="hero-section"
      ref={heroSectionRef}
      style={backgroundImage ? { '--hero-bg-image': `url('${backgroundImage}')` } : undefined}
    >
      <div
        className="hero-canvas-wrap"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      >
        {modelUrl && (
          <Canvas
            camera={{ fov: 10, position: [0, 0.95, 18] }}
            dpr={deviceProfile.lowPower ? [0.75, 1] : [1, 1.15]}
            frameloop={frameloop}
            gl={{
              antialias: false,
              powerPreference: 'high-performance',
              alpha: true,
              stencil: false,
              depth: true,
              preserveDrawingBuffer: false,
              failIfMajorPerformanceCaveat: false,
            }}
            onCreated={({ gl }) => {
              if (toneMappingExposure != null) {
                gl.toneMappingExposure = toneMappingExposure
              }
            }}
            performance={{ min: 0.35 }}
          >
            <ambientLight intensity={ambientLightIntensity} />
            <directionalLight
              position={[4, 7, 4]}
              intensity={keyLight}
            />
            <directionalLight
              position={[-5, 3, -6]}
              intensity={fillLight}
            />
            {frontLight && (
              <directionalLight
                position={[0, 1.5, 12]}
                intensity={frontLightValue}
              />
            )}
            {rimLightIntensity != null && (
              <directionalLight
                position={[0, 5, -9]}
                intensity={rimLightIntensity}
              />
            )}
            <Suspense fallback={null}>
              <HeroModel
                modelUrl={modelUrl}
                dragCurrentRef={dragCurrentRef}
                dragTargetRef={dragTargetRef}
                scrollYRef={scrollYRef}
                introStartRef={introStartRef}
                pointerTiltRef={pointerTiltRef}
                enableIntro={enableIntro}
                onLoaded={() => {
                  setIsSceneReady(true)
                  activateRenderLoop(enableIntro ? INTRO_ACTIVE_RENDER_MS : STATIC_ACTIVE_RENDER_MS)
                }}
                baseRotation={baseRotation}
                scaleMultiplier={scaleMultiplier}
                mobileOnlyScale={mobileOnlyScale}
                mobileScaleMultiplier={mobileScaleMultiplier}
                yOffset={yOffset}
                mobileYOffset={mobileYOffset}
                centerVertically={centerVertically}
                dragAxis={dragAxis}
                introAxis={introAxis}
                introStartOffset={introStartOffset}
                materialColor={materialColor}
                materialMetalness={materialMetalness}
                materialRoughness={materialRoughness}
                materialEnvMapIntensity={materialEnvMapIntensity}
                materialEmissive={materialEmissive}
                materialEmissiveIntensity={materialEmissiveIntensity}
              />
              {deviceProfile.lowPower ? null : <Environment preset="studio" />}
              {deviceProfile.lowPower && <ProceduralEnv />}
            </Suspense>
          </Canvas>
        )}
      </div>

      <div className="hero-overlay">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {tagline && <p className="tagline">{tagline}</p>}
      </div>
    </section>
  )
}
