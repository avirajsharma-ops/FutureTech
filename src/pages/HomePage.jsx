import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, useGLTF } from '@react-three/drei'
import { Box3, Vector3 } from 'three'
import DataSection from '../components/DataSection'
import { HERO_MODEL_URL, heroModelPromise } from '../lib/heroModel'

const MODEL_URL = HERO_MODEL_URL
const REST_Z = 0
const END_X_ROTATION = -0.18
const START_Y_ROTATION = 0.92
const REST_Y_ROTATION = -0.75
const TOP_OFFSET_RATIO = 0.15

const getTopOffsetRatio = () => {
  if (typeof window === 'undefined') return TOP_OFFSET_RATIO
  return window.innerWidth <= 480 ? 0.08 : window.innerWidth <= 768 ? 0.10 : TOP_OFFSET_RATIO
}
const INTRO_ROTATE_SECONDS = 2.4

function HeroModel({ modelUrl, dragCurrentRef, dragTargetRef, scrollYRef, introStartRef, onLoaded }) {
  const groupRef = useRef(null)
  const { scene } = useGLTF(modelUrl)
  const { viewport, size } = useThree()
  const isMobile = size.width <= 768

  useEffect(() => {
    onLoaded()
  }, [onLoaded])

  useEffect(() => {
    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = false
        obj.receiveShadow = false
        obj.frustumCulled = true
        if (obj.material?.map) obj.material.map.anisotropy = 1
      }
    })
  }, [scene])

  const bounds = useMemo(() => {
    const box = new Box3().setFromObject(scene)
    const size = new Vector3()
    box.getSize(size)
    return { sizeX: size.x, sizeY: size.y, minY: box.min.y }
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

    let t = 0
    if (introStartRef.current != null) {
      const elapsed = (performance.now() - introStartRef.current) / 1000
      const linear = Math.min(1, Math.max(0, elapsed / INTRO_ROTATE_SECONDS))
      t = 1 - (1 - linear) ** 3
    }

    const scrollRotation = -(scrollYRef.current / 4000) * Math.PI * 2
    const scriptedY = START_Y_ROTATION + (REST_Y_ROTATION - START_Y_ROTATION) * t
    groupRef.current.rotation.y = scriptedY + dragCurrentRef.current + scrollRotation
    groupRef.current.rotation.x = END_X_ROTATION
    groupRef.current.position.z = REST_Z
    groupRef.current.position.y = restY
  })

  return (
    <group
      ref={groupRef}
      scale={scale}
      position={[0, restY, REST_Z]}
      rotation={[END_X_ROTATION, START_Y_ROTATION, 0]}
    >
      <primitive object={scene} />
    </group>
  )
}

export default function HomePage({ introStartRef }) {
  const [modelUrl, setModelUrl] = useState(null)
  const [, setIsSceneReady] = useState(false)
  const dragCurrentRef = useRef(0)
  const dragTargetRef = useRef(0)
  const scrollYRef = useRef(0)
  const pointerRef = useRef({ active: false, lastX: 0 })

  useEffect(() => {
    const onScroll = () => { scrollYRef.current = window.scrollY }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    let isMounted = true
    heroModelPromise.then((cachedUrl) => {
      if (isMounted) setModelUrl(cachedUrl)
    })
    return () => {
      isMounted = false
    }
  }, [])

  const handlePointerDown = (e) => {
    pointerRef.current.active = true
    pointerRef.current.lastX = e.clientX
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const handlePointerMove = (e) => {
    if (!pointerRef.current.active) return
    const dx = e.clientX - pointerRef.current.lastX
    pointerRef.current.lastX = e.clientX
    dragTargetRef.current = Math.max(-1.35, Math.min(1.35, dragTargetRef.current + dx * 0.006))
  }
  const handlePointerUp = (e) => {
    pointerRef.current.active = false
    dragTargetRef.current = 0
    e.currentTarget.releasePointerCapture?.(e.pointerId)
  }

  return (
    <>
      <section className="hero-section">
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
              dpr={[1, 1.2]}
              gl={{ antialias: false, powerPreference: 'high-performance', alpha: true, stencil: false, depth: true }}
              performance={{ min: 0.5 }}
            >
              <ambientLight intensity={1.15} />
              <directionalLight position={[4, 7, 4]} intensity={2.3} />
              <directionalLight position={[-5, 3, -6]} intensity={1.25} />
              <Suspense fallback={null}>
                <HeroModel
                  modelUrl={modelUrl}
                  dragCurrentRef={dragCurrentRef}
                  dragTargetRef={dragTargetRef}
                  scrollYRef={scrollYRef}
                  introStartRef={introStartRef}
                  onLoaded={() => setIsSceneReady(true)}
                />
                <Environment preset="studio" />
              </Suspense>
            </Canvas>
          )}
        </div>

        <div className="hero-overlay">
          <p className="eyebrow">MW FUTURETECH</p>
          <h1>Engineering Tomorrow, In Real Time.</h1>
          <p className="tagline">
            Intelligent systems, adaptive design, and next-generation technology built to move business forward.
          </p>
        </div>
      </section>

      <DataSection />
    </>
  )
}

useGLTF.preload(MODEL_URL)
