import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // manifest sudah ada & di-link manual di index.html (public/site.webmanifest),
      // jadi jangan generate manifest baru dari sini — cukup service worker-nya saja.
      manifest: false,
      injectRegister: "auto",
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "favicon-16x16.png",
        "favicon-32x32.png",
        "favicon-48x48.png",
        "apple-touch-icon.png",
        "icon-192.png",
        "icon-512.png",
        "icon-512-maskable.png",
        "offline.html",
      ],
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
        navigateFallback: "offline.html",
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            // Cover art game (RAWG) — cache-first, boleh basi karena jarang berubah
            urlPattern: ({ url }) => url.hostname.includes("rawg.io") || url.hostname.includes("media.rawg.io"),
            handler: "CacheFirst",
            options: {
              cacheName: "rawg-images",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
  server: { port: 8080 },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

