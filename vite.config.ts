import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
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
    // Fix "process is not defined" error
    'process.env.NODE_ENV': JSON.stringify(mode || 'development'),
    global: 'globalThis',
  },

  build: {
    sourcemap: true,        // 🔥 VERY IMPORTANT (for debugging live errors)
    minify: "esbuild",
    chunkSizeWarningLimit: 1000,
  },
}));