// Demo-only config: uses the Babel React plugin so no native @swc binary is needed.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: { host: true, port: 8080, hmr: { overlay: false } },
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  define: {
    "process.env.NODE_ENV": JSON.stringify(mode || "development"),
    global: "globalThis",
  },
}));
