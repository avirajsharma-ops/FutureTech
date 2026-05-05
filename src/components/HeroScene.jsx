import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, useGLTF } from '@react-three/drei'
import { Box3, Vector3 } from 'three'
import { HERO_MODEL_URL, heroModelPromise } from '../lib/heroModel'

const REST_Z = 0
const END_X_ROTATION = -0.18
const START_Y_ROTATION = 0.92
const REST_Y_ROTATION = -0.75
const TOP_OFFSET_RATIO = 0.15
const INTRO_ROTATE_SECONDS = 2.4

// Subtle parallax bounds (radians). Keep small so it feels alive but never busy.
const POINTER_TILT_X = 0.08 // tilt up/down based on mouse Y
const POINTER_TILT_Y = 0.12 // sway left/right based on mouse X

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
}) {
  const groupRef = useRef(null)
  const tiltCurrentRef = useRef({ x: 0, y: 0 })
  const { scene } = useGLTF(modelUrl)
  const { viewport, size, gl, camera } = useThree()
  const isMobile = size.width <= 768

  useEffect(() => {
    onLoaded?.()
  }, [onLoaded])

  useEffect(() => {
    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = false
        obj.receiveShadow = false
        obj.frustumCulled = true
        if (obj.material) {
          if (obj.material.map) {
            obj.material.map.anisotropy = 1
            obj.material.map.generateMipmaps = true
          }
          obj.material.flatShading = false
          obj.material.precision = isMobile ? 'mediump' : 'highp'
          obj.material.needsUpdate = true
        }
      }
    })
    try {
      gl.compile(scene, camera)
    } catch {
      // older three versions
    }
  }, [scene, gl, camera, isMobile])

  const bounds = useMemo(() => {
    const box = new Box3().setFromObject(scene)
    const s = new Vector3()
    box.getSize(s)
    return { sizeX: s.x, sizeY: s.y, minY: box.min.y }
  }, [scene])

  const topOffset = isMobile ? getTopOffsetRatio() : TOP_OFFSET_RATIO
  const heightScale = (viewport.height * (1 - topOffset)) / bounds.sizeY
  const maxWidth = isMobile ? viewport.width * 0.96 : viewport.width
  const widthScale = maxWidth / bounds.sizeX
  const scale = Math.min(heightScale, widthScale)
  const restY = -viewport.height / 2 - bounds.minY * scale

  useFrame((_, delta) => {
    if (!groupRef.current) return
    dragCurrentRef.current += (dragTargetRef.current - dragCurrentRef.current) * Math.min(1, delta * 7)

    // Smoothly chase the pointer-derived tilt targets.
    const targetTiltX = pointerTiltRef.current.x * POINTER_TILT_X
    const targetTiltY = pointerTiltRef.current.y * POINTER_TILT_Y
    const lerp = Math.min(1, delta * 4)
    tiltCurrentRef.current.x += (targetTiltX - tiltCurrentRef.current.x) * lerp
    tiltCurrentRef.current.y += (targetTiltY - tiltCurrentRef.current.y) * lerp

    let t = enableIntro ? 0 : 1
    if (enableIntro && introStartRef?.current != null) {
      const elapsed = (performance.now() - introStartRef.current) / 1000
      const linear = Math.min(1, Math.max(0, elapsed / INTRO_ROTATE_SECONDS))
      t = 1 - (1 - linear) ** 3
    }

    const scrollRotation = scrollYRef ? -(scrollYRef.current / 4000) * Math.PI * 2 : 0
    const scriptedY = START_Y_ROTATION + (REST_Y_ROTATION - START_Y_ROTATION) * t
    groupRef.current.rotation.y =
      scriptedY + dragCurrentRef.current + scrollRotation + tiltCurrentRef.current.y
    groupRef.current.rotation.x = END_X_ROTATION + tiltCurrentRef.current.x
    groupRef.current.position.z = REST_Z
    groupRef.current.position.y = restY
  })

  return (
    <group
      ref={groupRef}
      scale={scale}
      position={[0, restY, REST_Z]}
      rotation={[END_X_ROTATION, enableIntro ? START_Y_ROTATION : REST_Y_ROTATION, 0]}
    >
      <primitive object={scene} />
    </group>
  )
}

/**
 * Reusable hero section: full-viewport 3D model + headline overlay.
 *
 * Props:
 *  - title, tagline, eyebrow: overlay copy.
 *  - modelUrl: optional override (defaults to the cached homepage model).
 *  - introStartRef: optional ref carrying the intro start timestamp.
 *      When omitted (inner pages), the model snaps to its rest pose.
 */
export default function HeroScene({
  title,
  tagline,
  eyebrow,
  modelUrl: modelUrlProp,
  introStartRef,
}) {
  const enableIntro = Boolean(introStartRef)
  // Always start with the cached blob URL (resolved via heroModelPromise) when
  // no override is provided. Using the raw HERO_MODEL_URL initially and then
  // swapping causes useGLTF to load twice and can leave the canvas blank
  // after a page switch.
  const [modelUrl, setModelUrl] = useState(modelUrlProp || null)
  const [, setIsSceneReady] = useState(false)
  const [frameloop, setFrameloop] = useState('always')
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

  // Pause render loop when offscreen.
  useEffect(() => {
    const node = heroSectionRef.current
    if (!node || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([entry]) => setFrameloop(entry.isIntersecting ? 'always' : 'never'),
      { threshold: 0.01 },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [])

  // Scroll → model rotation hook (homepage uses this; harmless on inner pages).
  useEffect(() => {
    const onScroll = () => {
      scrollYRef.current = window.scrollY
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Resolve cached model URL (for the homepage hand-off path).
  useEffect(() => {
    if (modelUrlProp) return
    let isMounted = true
    heroModelPromise.then((cachedUrl) => {
      if (isMounted) setModelUrl(cachedUrl)
    })
    return () => {
      isMounted = false
    }
  }, [modelUrlProp])

  // Pointer-driven subtle tilt. Skipped on touch devices.
  useEffect(() => {
    if (deviceProfile.touch) return
    const node = heroSectionRef.current
    if (!node) return
    const onMove = (e) => {
      const rect = node.getBoundingClientRect()
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1 // -1..1
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1 // -1..1 (top = -1)
      pointerTiltRef.current.x = Math.max(-1, Math.min(1, ny))
      pointerTiltRef.current.y = Math.max(-1, Math.min(1, nx))
    }
    const onLeave = () => {
      pointerTiltRef.current.x = 0
      pointerTiltRef.current.y = 0
    }
    window.addEventListener('mousemove', onMove)
    node.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      node.removeEventListener('mouseleave', onLeave)
    }
  }, [deviceProfile.touch])

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
  }
  const handlePointerMove = (e) => {
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
    dragTargetRef.current = Math.max(
      -1.35,
      Math.min(1.35, dragTargetRef.current + dx * 0.006),
    )
  }
  const handlePointerUp = (e) => {
    pointerRef.current.active = false
    dragTargetRef.current = 0
    if (pointerRef.current.captured) {
      e.currentTarget.releasePointerCapture?.(e.pointerId)
      pointerRef.current.captured = false
    }
  }

  return (
    <section className="hero-section" ref={heroSectionRef}>
      <div
        className="hero-canvas-wrap"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {modelUrl && (
          <Canvas
            camera={{ fov: 10, position: [0, 0.95, 18] }}
            dpr={deviceProfile.lowPower ? [1, 1] : [1, 1.5]}
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
            performance={{ min: 0.5 }}
          >
            <ambientLight intensity={deviceProfile.lowPower ? 1.35 : 1.15} />
            <directionalLight
              position={[4, 7, 4]}
              intensity={deviceProfile.lowPower ? 2.6 : 2.3}
            />
            <directionalLight
              position={[-5, 3, -6]}
              intensity={deviceProfile.lowPower ? 1.5 : 1.25}
            />
            <Suspense fallback={null}>
              <HeroModel
                modelUrl={modelUrl}
                dragCurrentRef={dragCurrentRef}
                dragTargetRef={dragTargetRef}
                scrollYRef={scrollYRef}
                introStartRef={introStartRef}
                pointerTiltRef={pointerTiltRef}
                enableIntro={enableIntro}
                onLoaded={() => setIsSceneReady(true)}
              />
              {!deviceProfile.lowPower && <Environment preset="studio" />}
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

useGLTF.preload(HERO_MODEL_URL)
