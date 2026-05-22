import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const EARTH_TEXTURE_URL = '/images/earth-blue-marble-8192.png'
const MAX_RENDER_SIZE = 3200

export default function Globe({
  className = '',
  style,
  phiRef,
}) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    let disposed = false
    let frameId = 0
    let earthTexture = null

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.NoToneMapping

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
    camera.position.set(0, 0, 3.5)

    const globeGroup = new THREE.Group()
    globeGroup.rotation.x = -0.08
    scene.add(globeGroup)

    const earthGeometry = new THREE.SphereGeometry(1, 64, 64)
    const earthMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.98,
    })
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial)
    globeGroup.add(earthMesh)

    const textureLoader = new THREE.TextureLoader()
    textureLoader.setCrossOrigin('anonymous')
    textureLoader.load(
      EARTH_TEXTURE_URL,
      (texture) => {
        if (disposed) {
          texture.dispose()
          return
        }

        earthTexture = texture
        texture.colorSpace = THREE.SRGBColorSpace
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
        earthMaterial.map = texture
        earthMaterial.needsUpdate = true
        canvas.style.opacity = '1'
      },
      undefined,
      () => {
        canvas.style.opacity = '1'
      },
    )

    const resize = () => {
      const width = Math.max(canvas.offsetWidth, 1)
      const height = Math.max(canvas.offsetHeight, 1)
      const renderScale = Math.min(1, MAX_RENDER_SIZE / Math.max(width, height))
      renderer.setSize(Math.ceil(width * renderScale), Math.ceil(height * renderScale), false)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()

    const render = () => {
      globeGroup.rotation.y = phiRef?.current ?? 0
      renderer.render(scene, camera)
      frameId = window.requestAnimationFrame(render)
    }
    render()

    return () => {
      disposed = true
      window.cancelAnimationFrame(frameId)
      observer.disconnect()

      earthGeometry.dispose()
      earthMaterial.dispose()
      earthTexture?.dispose()
      renderer.dispose()
    }
  }, [phiRef])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        opacity: 0,
        transition: 'opacity 800ms ease',
        contain: 'layout paint size',
        ...style,
      }}
    />
  )
}