import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: 'prompt',
    includeAssets: ['favicon.svg'],
    manifest: {
      name: 'Roll For Profit: The Startup Phase', short_name: 'Roll For Profit',
      description: 'An interactive, dice-rolling business adventure by Mark Kington.',
      theme_color: '#F7F1E8', background_color: '#F7F1E8', display: 'standalone',
      start_url: '/', scope: '/',
      icons: [{src:'/favicon.svg',sizes:'any',type:'image/svg+xml',purpose:'any'}],
    },
    workbox: {globPatterns:['**/*.{js,css,html,svg,woff,woff2,png,webp}'], navigateFallback:'/index.html'},
    devOptions: {enabled:false},
  })],
  server: {host:'0.0.0.0',port:5173,strictPort:true},
  preview: {host:'0.0.0.0',port:4173,strictPort:true},
  test: {include:['tests/**/*.test.ts'], environment:'node'},
});
