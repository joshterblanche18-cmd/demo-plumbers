import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Runs only against the separate test database, whose address comes from TEST_SUPABASE_URL.
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: { include: ["src/**/*.integration.test.ts"], testTimeout: 30_000 },
});
