import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@renderer': resolve('src/renderer/src')
    }
  },
  envPrefix: ['PUBLIC_'],
  plugins: [react(), tailwindcss()],
  root: resolve('src/renderer'),
  envDir: resolve('.'),
  build: {
    outDir: resolve('out-web')
  }
})
