import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: 'prompt',
    includeAssets: ['favicon.svg', 'icons/*.png'],
    manifest: {
      id: '/', lang: 'en',
      name: 'Roll For Profit: The Startup Phase', short_name: 'Roll For Profit',
      description: 'An interactive, dice-rolling business adventure by Mark Kington.',
      theme_color: '#F7F1E8', background_color: '#F7F1E8', display: 'standalone',
      start_url: '/', scope: '/',
      icons: [
        {src:'/icons/icon-192.png',sizes:'192x192',type:'image/png',purpose:'any'},
        {src:'/icons/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any'},
        {src:'/favicon.svg',sizes:'any',type:'image/svg+xml',purpose:'any'},
      ],
    },
    workbox: {
      globPatterns:['**/*.{js,css,html,svg,woff,woff2,png,webp,webmanifest}'],
      navigateFallback:'/index.html',
      cleanupOutdatedCaches:true,
      clientsClaim:true,
    },
    devOptions: {enabled:false},
  })],
  server: {host:'0.0.0.0',port:5173,strictPort:true},
  preview: {host:'0.0.0.0',port:4173,strictPort:true},
  test: {include:['tests/**/*.test.ts'], environment:'node'},
});
