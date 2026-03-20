import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite Configuration for BOCRA Website
 * 
 * - base: Set to '/hackathonteamproject/' for GitHub Pages deployment
 *   Change to '/' if deploying to a custom domain (www.bocra.org.bw)
 * - build.outDir: Output to 'dist' folder for GitHub Actions pickup
 */
export default defineConfig({
  plugins: [react()],
  base: '/hackathonteamproject/',
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
