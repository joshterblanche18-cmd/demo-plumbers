import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// The locked 25-question test. Makes real, paid API calls, so it never runs with the normal tests.
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: { include: ["evals/**/*.eval.ts"], testTimeout: 300_000 },
});
