import { defineConfig } from 'vite'
import { resolve } from 'path'
import type { InlineConfig } from 'vite'

export default defineConfig({
  root: resolve(__dirname),  // Use repo root so index.html is found
  base: '/space-acccloned-games-typegpu/',  // GitHub Pages subpath
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react': ['react', 'react-dom']
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
}) as InlineConfig