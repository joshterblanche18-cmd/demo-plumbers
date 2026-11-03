import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

export const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);

if (env.TEST_SUPABASE_URL === env.NEXT_PUBLIC_SUPABASE_URL) throw new Error("Tests must use the test database");

export const testDb = () => createClient(env.TEST_SUPABASE_URL, env.TEST_SUPABASE_SECRET_KEY, { auth: { persistSession: false } });

export const E2E_EMAIL = "e2e-visitor@example.com";
export const ADMIN_EMAIL = "e2e-admin@example.com";

export const PAGES = [
  "/",
  "/services",
  "/services/emergency-plumbing",
  "/services/boiler-repair-and-replacement",
  "/services/boiler-servicing",
  "/services/bathrooms",
  "/areas/bridge-of-don",
  "/areas/cults",
  "/areas/westhill",
  "/about",
  "/pricing",
  "/faq",
  "/contact",
  "/book",
  "/privacy",
  "/terms",
];
