import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
   build: {
    outDir: 'dist',
    sourcemap: false
  },
  server: {
    port: 2909,
    proxy: {
      '/api': {
        target: 'http://54.37.159.225:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
