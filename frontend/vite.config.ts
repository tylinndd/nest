import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import { visualizer } from "rollup-plugin-visualizer";
import path from "path";

const ANALYZE = process.env.ANALYZE === "1";

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    ANALYZE &&
      visualizer({
        filename: "dist/bundle-stats.html",
        gzipSize: true,
        brotliSize: true,
        template: "treemap",
      }),
    ANALYZE &&
      visualizer({
        filename: "dist/bundle-stats.json",
        template: "raw-data",
      }),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false,
      manifest: false,
      includeAssets: [
        "icon.svg",
        "icon-maskable.svg",
        "icon-192.png",
        "icon-512.png",
        "icon-maskable-192.png",
        "icon-maskable-512.png",
        "apple-touch-icon.png",
        "og-image.png",
        "manifest.webmanifest",
      ],
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,webmanifest}"],
        globIgnores: ["**/bundle-stats.*"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api/, /^\/_/],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));
