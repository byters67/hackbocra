/**
 * vite.config.js — Build Configuration for the BOCRA Website
 *
 * Key features:
 *   - React SPA with hot module replacement (HMR) in dev
 *   - Progressive Web App (PWA) with offline support via Workbox
 *   - Console.log/warn stripping in production builds (security: F06)
 *   - GitHub Pages deployment under /hackbocra/ base path
 *   - Service Worker caches fonts, images, and static assets
 *   - Supabase API calls are NetworkOnly (never cached — always fresh data)
 *   - Path alias: '@/' maps to 'src/' for clean imports
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import removeConsole from 'vite-plugin-remove-console';

export default defineConfig({
  /* Single copy of React + helmet: avoids broken Context (Helmet without
     HelmetProvider) and "Cannot read properties of undefined (reading 'add')". */
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-helmet-async'],
  },
  plugins: [
    react(),
    removeConsole({ includes: ['log', 'warn'] }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'icons/icon-192.png',
        'icons/icon-512.png',
        'images/**/*',
        'documents/**/*',
      ],
      manifest: {
        name: 'BOCRA - Botswana Communications Regulatory Authority',
        short_name: 'BOCRA',
        description: 'Regulating telecommunications, broadcasting, postal and internet services in Botswana',
        start_url: '/hackbocra/',
        scope: '/hackbocra/',
        display: 'standalone',
        background_color: '#00458B',
        theme_color: '#00458B',
        orientation: 'portrait-primary',
        categories: ['government', 'utilities'],
        icons: [
          {
            src: '/hackbocra/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/hackbocra/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-css',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/(posts|documents|pages|faqs|consultations|job_openings|tenders).*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'supabase-public-data',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/services\.nvd\.nist\.gov\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'nvd-api',
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 30 },
            },
          },
          {
            urlPattern: /^https:\/\/dns\.google\/.*/i,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/api\.anthropic\.com\/.*/i,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/www\.google\.com\/recaptcha\/.*/i,
            handler: 'NetworkOnly',
          },
        ],
        navigateFallback: '/hackbocra/index.html',
        navigateFallbackDenylist: [/^\/hackbocra\/api/, /^\/hackbocra\/auth/],
      },
    }),
  ],
  base: '/hackbocra/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('@tiptap')) return 'vendor-editor';
            if (id.includes('gsap')) return 'vendor-animation';
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
    dedupe: ['react', 'react-dom', 'react-helmet-async'],
  },
});
