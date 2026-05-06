/**
 * Generic model cache + blob-URL helper.
 *
 * Every 3D model in the app should be loaded through this helper so that:
 *   1. The GLB is cached in the browser's Cache Storage on first visit
 *      (no re-download on subsequent navigations or page reloads).
 *   2. Consumers receive a blob-URL — drei's useGLTF caches by URL, so
 *      the stable blob-URL ensures the model is parsed exactly once even
 *      if multiple components load the same asset.
 *   3. A synchronous `isReady()` + `getUrl()` pair is available so
 *      components can seed initial state without an async round-trip
 *      (critical to avoid the "blank canvas after route switch" race).
 *
 * Usage:
 *   const COIN = registerModel('/models/about-coin-optimized.glb')
 *   COIN.url            // raw URL (for useGLTF.preload)
 *   COIN.promise        // Promise<blobUrl>
 *   COIN.isReady()      // boolean
 *   COIN.getUrl()       // current best URL (blob if ready, else raw)
 */

const CACHE_KEY = 'mwft-model-cache-v2'

async function fetchAndCache(url) {
  if (typeof window === 'undefined' || !('caches' in window)) return url
  try {
    const cache = await caches.open(CACHE_KEY)
    let response = await cache.match(url)
    if (!response) {
      const network = await fetch(url, { cache: 'force-cache' })
      if (network.ok) {
        await cache.put(url, network.clone())
        response = network
      }
    }
    if (!response) return url
    const blob = await response.blob()
    return URL.createObjectURL(blob)
  } catch {
    return url
  }
}

const REGISTRY = new Map()

export function registerModel(url) {
  if (REGISTRY.has(url)) return REGISTRY.get(url)

  const entry = {
    url,
    isReady: () => entry._resolved,
    getUrl: () => entry._resolvedUrl,
    _resolved: false,
    _resolvedUrl: url,
    promise: null,
  }
  entry.promise = fetchAndCache(url).then((resolvedUrl) => {
    entry._resolvedUrl = resolvedUrl
    entry._resolved = true
    return resolvedUrl
  })
  REGISTRY.set(url, entry)
  return entry
}

export function getRegisteredModels() {
  return Array.from(REGISTRY.values())
}
