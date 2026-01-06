import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "Financial Dashboard",
        short_name: "Dashboard",
        description: "Personal Financial Dashboard Application",
        theme_color: "#ffffff",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4MB
        navigateFallbackDenylist: [/^\/version.json$/],
        runtimeCaching: [
          {
            urlPattern: /\/version\.json$/,
            handler: "NetworkOnly",
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: [
            "@radix-ui/react-slot",
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-progress",
            "class-variance-authority",
            "clsx",
            "tailwind-merge",
            "lucide-react",
            "sonner",
          ],
          charts: ["recharts"],
          firebase: ["firebase/app", "firebase/auth", "firebase/firestore"],
          utils: [
            "jspdf",
            "jspdf-autotable",
            "xlsx",
            "papaparse",

            "i18next",
            "react-i18next",
          ],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
  },
});
