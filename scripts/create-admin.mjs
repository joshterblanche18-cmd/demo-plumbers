// Creates the site's one admin sign-in, with a random password saved only in .env.local. Prints no secret.
// Run: node scripts/create-admin.mjs someone@example.com
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const file = new URL("../.env.local", import.meta.url);
let text = readFileSync(file, "utf8");
const env = Object.fromEntries(text.split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));

const email = process.argv[2];
if (!email) {
  console.log("Use: node scripts/create-admin.mjs someone@example.com");
  process.exit(1);
}
if (env.ADMIN_PASSWORD) {
  console.log("An admin password is already saved in .env.local, so nothing was changed.");
  process.exit(0);
}

const password = randomBytes(18).toString("base64url");
const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users`, {
  method: "POST",
  headers: { apikey: env.SUPABASE_SECRET_KEY, "Content-Type": "application/json" },
  body: JSON.stringify({ email, password, email_confirm: true }),
});
if (!response.ok) {
  console.log(`Could not create the admin (status ${response.status}).`);
  process.exit(1);
}

const set = (key, value) => {
  const line = new RegExp(`^${key}=.*$`, "m");
  text = line.test(text) ? text.replace(line, () => `${key}=${value}`) : `${text.replace(/\s*$/, "\n")}${key}=${value}\n`;
};
set("ADMIN_EMAIL", email);
set("ADMIN_PASSWORD", password);
set("ADMIN_SESSION_SECRET", randomBytes(32).toString("hex"));
writeFileSync(file, text);
console.log("Admin created. The password is in .env.local as ADMIN_PASSWORD.");
