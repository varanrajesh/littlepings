import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { resolve } from 'path'
import { VitePWA } from 'vite-plugin-pwa'
/// <reference types="vitest" />

// https://vite.dev/config/
export default defineConfig({
  // Root-relative — works for both Cloudflare Pages custom domain and *.pages.dev
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Service worker generated into dist/sw.js
      filename: 'sw.js',
      manifest: false, // we use our own public/manifest.json
      workbox: {
        // Pre-cache all Vite build artifacts
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // Stale-while-revalidate for navigation (offline-first)
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/\/api\//],
        runtimeCaching: [
          {
            // Google Fonts — cache-first
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      devOptions: {
        enabled: false, // don't pollute dev with SW
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5175,
    strictPort: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
