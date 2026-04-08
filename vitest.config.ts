import { defineConfig } from "vitest/config";
import path from "node:path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    globals: true,
    include: ["tests/unit/**/*.test.ts", "tests/ui/**/*.test.tsx"],
    setupFiles: ["./tests/unit/setup.ts", "./tests/ui/setup.ts"],
    clearMocks: true
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
});
