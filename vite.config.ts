import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

const isElectron = process.env.BUILD_TARGET === "electron";

export default defineConfig({
  base: isElectron ? "./" : "/",

  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },

  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "favicon.ico",
        "favicon-32x32.png",
        "apple-touch-icon.png",
        "icon-192x192.png",
        "icon-512x512.png",
      ],

      manifest: false,

      workbox: {
        // Fix build failures from large images
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,

        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,

        // Only precache core app files
        globPatterns: [
          "**/*.{js,css,html,ico,woff,woff2}"
        ],

        runtimeCaching: [
          {
            urlPattern: /\.(png|jpg|jpeg|svg|webp)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },

          {
            urlPattern: /\.pdf$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "pdf-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },

          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-stylesheets",
            },
          },

          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },

    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },

  build: {
    sourcemap: false,

    chunkSizeWarningLimit: 1200,

    rollupOptions: {
      output: {
        manualChunks: {
          react: [
            "react",
            "react-dom",
            "react-router-dom",
          ],

          ui: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-tooltip",
          ],

          query: [
            "@tanstack/react-query",
          ],

          charts: [
            "recharts",
          ],
        },
      },
    },
  },
});
