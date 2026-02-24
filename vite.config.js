import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  // Define environment variables as fallback if .env file isn't loaded
  define: {
    "import.meta.env.VITE_FIREBASE_API_KEY": JSON.stringify(
      "AIzaSyADEdqlObExEeZH2lGczR0NV9wY6gtQ1MY",
    ),
    "import.meta.env.VITE_FIREBASE_AUTH_DOMAIN": JSON.stringify(
      "dashboard-c23c8.firebaseapp.com",
    ),
    "import.meta.env.VITE_FIREBASE_PROJECT_ID":
      JSON.stringify("dashboard-c23c8"),
    "import.meta.env.VITE_FIREBASE_STORAGE_BUCKET": JSON.stringify(
      "dashboard-c23c8.firebasestorage.app",
    ),
    "import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID":
      JSON.stringify("115815405530"),
    "import.meta.env.VITE_FIREBASE_APP_ID": JSON.stringify(
      "1:115815405530:web:de1a139df2b4ef437752e3",
    ),
    "import.meta.env.VITE_FIREBASE_MEASUREMENT_ID":
      JSON.stringify("G-JVGS6QCJSL"),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      devOptions: {
        enabled: true,
        type: "module",
      },
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
        shortcuts: [
          {
            name: "Painel",
            short_name: "Painel",
            description: "Ver resumo financeiro",
            url: "/",
            icons: [{ src: "pwa-192x192.png", sizes: "192x192" }],
          },
          {
            name: "Nova Transação",
            short_name: "Transação",
            description: "Adicionar transação rapidamente",
            url: "/transactions",
            icons: [{ src: "pwa-192x192.png", sizes: "192x192" }],
          },
          {
            name: "Relatórios",
            short_name: "Relatórios",
            description: "Ver relatórios financeiros",
            url: "/reports",
            icons: [{ src: "pwa-192x192.png", sizes: "192x192" }],
          },
          {
            name: "Desafios",
            short_name: "Desafios",
            description: "Ver desafios de economia",
            url: "/challenges",
            icons: [{ src: "pwa-192x192.png", sizes: "192x192" }],
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4MB
        clientsClaim: true,
        skipWaiting: true,
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
    environment: "happy-dom",
    setupFiles: "./src/setupTests.js",
  },
});
