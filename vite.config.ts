import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'KTV 提詞機',
        short_name: 'KTV 提詞機',
        description: '專為視障者設計的 KTV 演唱輔助工具',
        theme_color: '#07080f',
        background_color: '#07080f',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'zh-TW',
        start_url: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Cache app shell and static assets
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Runtime cache for LRCLIB API responses
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/lrclib\.net\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'lrclib-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
