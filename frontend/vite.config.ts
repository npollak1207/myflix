import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// In dev, we proxy /jellyfin to your real Jellyfin server so the browser
// talks to a single same-origin host (no CORS). In prod, Caddy does this.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_JELLYFIN_TARGET || 'http://127.0.0.1:8096'
  // If your dev Jellyfin also serves under a base path, set it here (e.g. /jellyfin)
  // and the prefix will be preserved instead of stripped.
  const basePath = env.VITE_JELLYFIN_BASEPATH || ''
  return {
    plugins: [react()],
    resolve: {
      alias: { '@': path.resolve(__dirname, 'src') },
    },
    server: {
      port: 5173,
      proxy: {
        '/jellyfin': {
          target,
          changeOrigin: true,
          ws: true,
          // Dev Jellyfin runs at the root path, so strip the /jellyfin prefix.
          // In prod, Caddy keeps the prefix and Jellyfin's Base URL is /jellyfin.
          rewrite: (p) => (basePath ? p : p.replace(/^\/jellyfin/, '')),
          configure: (proxy) => {
            proxy.on('error', (err) => console.log('[proxy error]', err.message))
            proxy.on('proxyReq', (_req, req) =>
              console.log('[proxy]', req.url, '->', target),
            )
          },
        },
      },
    },
  }
})
