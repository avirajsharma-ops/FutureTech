import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env so that server-side variables like GROQ_API_KEY are available
  // to the dev middleware that proxies /api/ai-search during `npm run dev`.
  // (In production these are provided by Vercel's environment.)
  const env = loadEnv(mode, process.cwd(), '')
  for (const key of Object.keys(env)) {
    if (!key.startsWith('VITE_') && process.env[key] === undefined) {
      process.env[key] = env[key]
    }
  }

  return {
    plugins: [react(), devApiPlugin()],
    optimizeDeps: {
      // lottie-react imports lottie-web as a default import, but lottie-web's
      // ESM has no default export. Force-bundle both so Vite/esbuild produces
      // a proper CJS↔ESM interop shim. The component is imported via a
      // namespace+inner-default workaround in PrivacySection.jsx.
      include: ['lottie-react', 'lottie-web'],
    },
  }
})

function devApiPlugin() {
  let cachedHandler

  async function loadHandler() {
    if (cachedHandler) return cachedHandler
    const handlerPath = path.resolve(process.cwd(), 'api/ai-search.js')
    const mod = await import(pathToFileURL(handlerPath).href)
    cachedHandler = mod.default
    return cachedHandler
  }

  return {
    name: 'mwft-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/ai-search', async (req, res, next) => {
        if (req.method !== 'POST' && req.method !== 'OPTIONS') return next()
        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          return res.end()
        }
        try {
          const handler = await loadHandler()
          await handler(req, res)
        } catch (error) {
          console.error('[dev /api/ai-search] failed', error)
          if (!res.headersSent) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
          }
          res.end(JSON.stringify({ error: 'Dev API failure' }))
        }
      })
    },
  }
}
