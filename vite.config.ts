import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: true, // allow external access
    port: 8080,
    allowedHosts: ["dabbanation.in"], // 🔥 IMPORTANT FIX
    hmr: {
      overlay: false,
    },
  },

  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  define: {
    "process.env.NODE_ENV": JSON.stringify(mode || "development"),
    global: "globalThis",
  },

  build: {
    sourcemap: true,
    minify: "esbuild",
    chunkSizeWarningLimit: 1000,
  },
}));
