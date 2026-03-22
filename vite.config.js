import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import removeConsole from 'vite-plugin-remove-console';

export default defineConfig({
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
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
