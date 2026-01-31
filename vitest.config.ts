/**
 * @file vitest.config.ts
 * @description Vitest test runner configuration with jsdom environment and test file patterns
 * 
 * @dependencies vitest, @vitejs/plugin-react-swc
 * @usage Used by Vitest CLI to run unit tests
 */

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
