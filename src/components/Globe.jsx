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

    const earthGeometry = new THREE.SphereGeometry(1, 64, 64)
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

    const depthGeometry = new THREE.SphereGeometry(1.004, 64, 64)
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