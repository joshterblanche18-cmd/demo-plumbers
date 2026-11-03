// Connects the live site: creates Stripe's webhook once, saves its secret, then uploads settings to Cloudflare.
// Prints only names and statuses, never a value. Run: node scripts/go-live.mjs https://the-live-address
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import Stripe from "stripe";

const siteUrl = process.argv[2]?.replace(/\/$/, "");
if (!siteUrl?.startsWith("https://")) {
  console.log("Use: node scripts/go-live.mjs https://the-live-address");
  process.exit(1);
}

const file = new URL("../.env.local", import.meta.url);
const read = () =>
  Object.fromEntries(
    readFileSync(file, "utf8")
      .split(/\r?\n/)
      .filter((l) => /^[A-Z_]+=/.test(l))
      .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
  );
function save(key, value) {
  let text = readFileSync(file, "utf8");
  const line = new RegExp(`^${key}=.*$`, "m");
  text = line.test(text) ? text.replace(line, () => `${key}=${value}`) : `${text.replace(/\s*$/, "\n")}${key}=${value}\n`;
  writeFileSync(file, text);
}

let env = read();
if (!/^(sk|rk)_test_/.test(env.STRIPE_SECRET_KEY)) throw new Error("Only Stripe test keys are allowed.");

const stripe = new Stripe(env.STRIPE_SECRET_KEY);
const url = `${siteUrl}/api/stripe/webhook`;
const existing = (await stripe.webhookEndpoints.list({ limit: 100 })).data.find((w) => w.url === url);
if (existing && env.STRIPE_LIVE_WEBHOOK_SECRET) {
  console.log("Stripe webhook already exists for this address.");
} else {
  if (existing) await stripe.webhookEndpoints.del(existing.id);
  const created = await stripe.webhookEndpoints.create({
    url,
    description: "Kirkgate demo",
    enabled_events: [
      "checkout.session.completed",
      "checkout.session.async_payment_succeeded",
      "checkout.session.async_payment_failed",
      "checkout.session.expired",
      "charge.refunded",
    ],
  });
  save("STRIPE_LIVE_WEBHOOK_SECRET", created.secret);
  console.log("Stripe webhook created, livemode:", created.livemode);
}
env = read();

const settings = {
  NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_SECRET_KEY: env.SUPABASE_SECRET_KEY,
  STRIPE_SECRET_KEY: env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: env.STRIPE_LIVE_WEBHOOK_SECRET,
  RESEND_API_KEY: env.RESEND_API_KEY,
  DEMO_INBOX_EMAIL: env.DEMO_INBOX_EMAIL,
  ANTHROPIC_API_KEY: env.ANTHROPIC_API_KEY,
  IP_HASH_SALT: env.IP_HASH_SALT,
  ADMIN_EMAIL: env.ADMIN_EMAIL,
  ADMIN_SESSION_SECRET: env.ADMIN_SESSION_SECRET,
  SITE_URL: siteUrl,
};
const missing = Object.entries(settings).filter(([, v]) => !v).map(([k]) => k);
if (missing.length) throw new Error(`Missing: ${missing.join(", ")}`);

const result = spawnSync("npx.cmd wrangler secret bulk", { input: JSON.stringify(settings), encoding: "utf8", shell: true, timeout: 180_000 });
const out = `${result.stdout}\n${result.stderr}`.replace(/\x1b\[[0-9;]*m/g, "");
console.log(out.split("\n").filter((l) => /success|finished|upload|error|fail/i.test(l)).map((l) => l.slice(0, 140)).join("\n"));
process.exit(result.status ?? 1);
