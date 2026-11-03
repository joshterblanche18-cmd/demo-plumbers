import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { defineConfig, devices } from "@playwright/test";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);

const PORT = 3100;

// Runs the real site against the separate test database. Emails are off, and the chat budget is zero, so no paid AI call can happen.
process.env.E2E_WEBHOOK_SECRET ??= `whsec_${randomBytes(24).toString("hex")}`;
process.env.E2E_ADMIN_PASSWORD ??= randomBytes(18).toString("base64url");

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  retries: 0,
  reporter: [["list"]],
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  use: { baseURL: `http://localhost:${PORT}`, trace: "off" },
  projects: [
    { name: "phone", use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } } },
    { name: "laptop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
  ],
  webServer: {
    command: "npx next build && npx next start --port 3100",
    url: `http://localhost:${PORT}`,
    timeout: 240_000,
    reuseExistingServer: false,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: env.TEST_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: env.TEST_SUPABASE_PUBLISHABLE_KEY,
      SUPABASE_SECRET_KEY: env.TEST_SUPABASE_SECRET_KEY,
      RESEND_API_KEY: "",
      DEMO_INBOX_EMAIL: "",
      CHAT_DAILY_BUDGET_NANO_USD: "0",
      IP_HASH_SALT: randomBytes(16).toString("hex"),
      SITE_URL: `http://localhost:${PORT}`,
      STRIPE_WEBHOOK_SECRET: process.env.E2E_WEBHOOK_SECRET,
      ADMIN_EMAIL: "e2e-admin@example.com",
      ADMIN_SESSION_SECRET: randomBytes(32).toString("hex"),
    },
  },
});
