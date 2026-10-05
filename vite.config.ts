import path from "path"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",
      injectRegister: "auto",
      includeAssets: ["favicon.svg", "icons/*.png"],
      manifest: {
        name: "HabitFlow – Habit Tracker",
        short_name: "HabitFlow",
        description: "Track your daily habits, build momentum, and stay consistent — even offline.",
        theme_color: "#7c3aed",
        background_color: "#0f1117",
        display: "standalone",
        orientation: "portrait-primary",
        scope: "/",
        start_url: "/",
        icons: [
          { src: "/icons/icon-72x72.png",   sizes: "72x72",   type: "image/png" },
          { src: "/icons/icon-96x96.png",   sizes: "96x96",   type: "image/png" },
          { src: "/icons/icon-128x128.png", sizes: "128x128", type: "image/png" },
          { src: "/icons/icon-144x144.png", sizes: "144x144", type: "image/png" },
          { src: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
          { src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-384x384.png", sizes: "384x384", type: "image/png" },
          { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/icons/icon-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Precache the entire app shell (HTML, JS, CSS bundles)
        // Strategy: Cache-First — these assets are fingerprinted, safe to serve stale
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],

        runtimeCaching: [
          // Google Fonts — Cache-First (fonts rarely change)
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Supabase Storage (avatars / images) — StaleWhileRevalidate
          // Serve cached image immediately while fetching a fresh copy in background.
          // Good balance: instant display + eventual freshness
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "supabase-images-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Supabase REST API — NetworkOnly. Habit responses are user-specific and
          // must never fall back to a shared browser cache. Offline writes use the local queue.
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/.*/i,
            handler: "NetworkOnly",
          },
        ],
      },
      devOptions: {
        // Enable SW in dev mode to test (but use production build for real offline tests)
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
})
