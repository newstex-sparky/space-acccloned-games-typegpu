import { defineConfig } from 'vite'
import { resolve } from 'path'
import type { InlineConfig } from 'vite'

// Check for WebGPU support
const checkWebGPUSupport = (): void => {
  if (typeof navigator !== 'undefined' && 'gpu' in navigator) {
    console.log('✅ WebGPU supported')
  } else {
    console.warn('⚠️ WebGPU not supported. Please use a modern browser.')
    console.warn('Recommended browsers: Chrome 113+, Edge 113+, Firefox 121+, Safari 16.4+')
  }
}

export default defineConfig({
  root: resolve(__dirname),  // Use repo root so index.html is found
  base: '/space-acccloned-games-typegpu/',  // GitHub Pages subpath
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three'],
          'typegpu': ['typegpu']
        }
      }
    },
    // Optimize for production
    minify: 'esbuild',
  },
  server: {
    port: 8001,
    open: true,
    proxy: {
      '/api/ardy': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/api/controllers': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './setupTests.ts'
  },
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.webp'],
  // TypeGPU specific configuration
  optimizeDeps: {
    include: ['typegpu']
  },
}) as InlineConfig