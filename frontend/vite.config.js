/* global process */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_ORIGIN || 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
        // Las URLs de las imágenes se guardan como /images/<empresa>/archivo.
        // En desarrollo deben pasar por Django, igual que las peticiones API.
        '/images': {
          target: env.VITE_BACKEND_ORIGIN || 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
      },
    },
  }
})
