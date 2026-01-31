/**
 * @file vite.config.ts
 * @description Vite build configuration with React SWC plugin, dev server settings, and path aliases
 * 
 * @dependencies vite, @vitejs/plugin-react-swc, lovable-tagger
 * @usage Used by Vite CLI to build and serve the application
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
