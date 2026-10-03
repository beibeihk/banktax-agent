import { defineConfig } from "vitest/config";
import { resolve } from "node:path";
export default defineConfig({
  resolve: { alias: { "@": resolve(".") } },
  test: {
    environment: "jsdom",
    include: ["tests/frontend/**/*.test.tsx", "tests/frontend/**/*.test.ts"],
    setupFiles: ["./tests/frontend/setup.ts"],
  },
});
