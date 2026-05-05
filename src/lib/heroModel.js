/**
 * Kicks off the hero GLB download (using the Cache Storage layer)
 * the moment this module is imported. Exposes:
 *   - HERO_MODEL_URL: the original URL (used by useGLTF.preload elsewhere)
 *   - heroModelPromise: resolves with a blob URL once the model is cached
 *   - getHeroModelReady: synchronous "is it done?" check for loaders
 */

export const HERO_MODEL_URL = '/models/mwft-hero-optimized.glb'
const HERO_MODEL_CACHE_KEY = 'mwft-model-cache-v2'

let resolved = false
let resolvedUrl = HERO_MODEL_URL

async function fetchHeroModel() {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return HERO_MODEL_URL
  }
  try {
    const cache = await caches.open(HERO_MODEL_CACHE_KEY)
    let response = await cache.match(HERO_MODEL_URL)
    if (!response) {
      const networkResponse = await fetch(HERO_MODEL_URL, { cache: 'force-cache' })
      if (networkResponse.ok) {
        await cache.put(HERO_MODEL_URL, networkResponse.clone())
        response = networkResponse
      }
    }
    if (!response) return HERO_MODEL_URL
    const modelBlob = await response.blob()
    return URL.createObjectURL(modelBlob)
  } catch {
    return HERO_MODEL_URL
  }
}

export const heroModelPromise = fetchHeroModel().then((url) => {
  resolvedUrl = url
  resolved = true
  return url
})

export const getHeroModelReady = () => resolved
export const getHeroModelUrl = () => resolvedUrl
