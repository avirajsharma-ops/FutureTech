import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const EARTH_TEXTURE_URL = '/images/earth-blue-marble-2048.webp'
const MAX_RENDER_SIZE = 1800

const isLowPowerDevice = () => {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return false
  const cores = navigator.hardwareConcurrency || 8
  const memory = navigator.deviceMemory || 8
  return window.innerWidth <= 768 || cores <= 4 || memory <= 4
}

export default function Globe({
  className = '',
  style,
  phi = 0,
  phiRef,
}) {
  const canvasRef = useRef(null)
  const latestPhiRef = useRef(phi)
  const requestRenderRef = useRef(null)

  useEffect(() => {
    latestPhiRef.current = phi
    requestRenderRef.current?.()
  }, [phi])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const lowPower = isLowPowerDevice()
    let disposed = false
    let frameId = 0
    let visible = true
    let earthTexture = null

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !lowPower,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1 : 1.4))
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.NoToneMapping

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
    camera.position.set(0, 0, 3.5)

    scene.add(new THREE.HemisphereLight(0xf8fbff, 0xb9d7ff, 1.85))

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2)
    keyLight.position.set(-2.4, 2.8, 4)
    scene.add(keyLight)

    const rimLight = new THREE.DirectionalLight(0x9fc8ff, 1.35)
    rimLight.position.set(2.7, -1.5, 3.2)
    scene.add(rimLight)

    const globeGroup = new THREE.Group()
    globeGroup.rotation.x = -0.08
    scene.add(globeGroup)

    const segmentCount = lowPower ? 32 : 48
    const earthGeometry = new THREE.SphereGeometry(1, segmentCount, segmentCount)
    const earthMaterial = new THREE.MeshStandardMaterial({
      transparent: true,
      opacity: 0.98,
      roughness: 0.82,
      metalness: 0,
      emissive: new THREE.Color(0x12325a),
      emissiveIntensity: 0.1,
    })
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial)
    globeGroup.add(earthMesh)

    const depthGeometry = new THREE.SphereGeometry(1.004, segmentCount, segmentCount)
    const depthMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      vertexShader: `
        varying vec3 vViewNormal;

        void main() {
          vViewNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vViewNormal;

        void main() {
          float facing = clamp(vViewNormal.z, 0.0, 1.0);
          float rimShade = pow(1.0 - facing, 2.2);
          float lowerShade = smoothstep(0.42, -0.72, vViewNormal.y);
          float upperGlow = smoothstep(-0.14, 0.78, vViewNormal.y) * smoothstep(0.32, 0.94, facing);
          vec3 shadeColor = mix(vec3(0.025, 0.08, 0.16), vec3(0.62, 0.8, 1.0), upperGlow * 0.32);
          float alpha = clamp(rimShade * 0.18 + lowerShade * 0.12 + upperGlow * 0.055, 0.0, 0.28);
          gl_FragColor = vec4(shadeColor, alpha);
        }
      `,
    })
    const depthMesh = new THREE.Mesh(depthGeometry, depthMaterial)
    globeGroup.add(depthMesh)

    const textureLoader = new THREE.TextureLoader()
    textureLoader.setCrossOrigin('anonymous')
    let textureLoadStarted = false
    const startTextureLoad = () => {
      if (textureLoadStarted || disposed) return
      textureLoadStarted = true
      textureLoader.load(
        EARTH_TEXTURE_URL,
        (texture) => {
          if (disposed) {
            texture.dispose()
            return
          }

        earthTexture = texture
        texture.colorSpace = THREE.SRGBColorSpace
        texture.anisotropy = lowPower ? 1 : Math.min(renderer.capabilities.getMaxAnisotropy(), 4)
        earthMaterial.map = texture
        earthMaterial.needsUpdate = true
        canvas.style.opacity = '1'
        requestRenderRef.current?.()
      },
      undefined,
      () => {
        canvas.style.opacity = '1'
        requestRenderRef.current?.()
      },
    )
    }

    const resize = () => {
      const width = Math.max(canvas.offsetWidth, 1)
      const height = Math.max(canvas.offsetHeight, 1)
      const renderScale = Math.min(1, MAX_RENDER_SIZE / Math.max(width, height))
      renderer.setSize(Math.ceil(width * renderScale), Math.ceil(height * renderScale), false)
      requestRenderRef.current?.()
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    resize()

    const render = () => {
      frameId = 0
      if (disposed || !visible) return
      globeGroup.rotation.y = phiRef?.current ?? latestPhiRef.current
      renderer.render(scene, camera)
    }

    const requestRender = () => {
      if (disposed || !visible || frameId) return
      frameId = window.requestAnimationFrame(render)
    }

    requestRenderRef.current = requestRender

    let intersectionObserver
    if (typeof IntersectionObserver !== 'undefined') {
      visible = false
      intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting
          if (visible) {
            startTextureLoad()
            requestRender()
          }
        },
        { rootMargin: '200px', threshold: 0.01 },
      )
      intersectionObserver.observe(canvas)
    } else {
      startTextureLoad()
    }

    requestRender()

    return () => {
      disposed = true
      window.cancelAnimationFrame(frameId)
      requestRenderRef.current = null
      resizeObserver.disconnect()
      intersectionObserver?.disconnect()

      earthGeometry.dispose()
      depthGeometry.dispose()
      earthMaterial.dispose()
      depthMaterial.dispose()
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