// Fails if a real key could become public. Compares the exact values in .env.local, and key-like patterns,
// against every tracked file, the whole git history, and optionally the live site. Prints names, never values.
// Run: node scripts/scan-secrets.mjs [https://the-live-address]
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const PATTERNS = [
  ["Anthropic key", /sk-ant-[A-Za-z0-9_-]{20,}/],
  ["Stripe secret key", /\b(sk|rk)_(test|live)_[A-Za-z0-9]{20,}/],
  ["Stripe webhook secret", /whsec_[A-Za-z0-9]{20,}/],
  ["Supabase secret key", /sb_secret_[A-Za-z0-9_-]{10,}/],
  ["Resend key", /\bre_[A-Za-z0-9]{8,}_[A-Za-z0-9]{16,}/],
  ["Cloud token", /\b(gho|ghp|github_pat)_[A-Za-z0-9_]{20,}/],
  ["Private key", /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
];

// Fine to be public by design, or not secret at all.
const NOT_SECRET = new Set(["NEXT_PUBLIC_SUPABASE_URL", "TEST_SUPABASE_URL", "SITE_URL", "ADMIN_EMAIL", "DEMO_INBOX_EMAIL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "TEST_SUPABASE_PUBLISHABLE_KEY", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"]);

const env = existsSync(".env.local")
  ? Object.fromEntries(
      readFileSync(".env.local", "utf8")
        .split(/\r?\n/)
        .filter((l) => /^[A-Z_]+=/.test(l))
        .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
    )
  : {};
const secrets = Object.entries(env).filter(([k, v]) => !NOT_SECRET.has(k) && v.length >= 12);

const findings = [];
function check(where, text) {
  for (const [name, value] of secrets) if (text.includes(value)) findings.push(`${where}: real value of ${name}`);
  for (const [name, re] of PATTERNS) if (re.test(text)) findings.push(`${where}: looks like a ${name}`);
}

const git = (...args) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 1024 * 1024 * 512 });

// Files that must never be tracked at all.
const tracked = git("ls-files").split("\n").filter(Boolean);
for (const file of tracked) {
  if (/(^|\/)\.env($|\.(?!example$))|\.dev\.vars$|\.pem$|(^|\/)\.wrangler/.test(file)) findings.push(`${file}: secret file is tracked`);
}

// Every version of every file ever committed, on every branch.
const history = git("log", "--all", "-p", "--no-color", "--text");
check("git history", history);
const commits = git("rev-list", "--all").split("\n").filter(Boolean).length;

// Everything that a commit would include right now, tracked or new.
const pending = git("ls-files", "--cached", "--others", "--exclude-standard").split("\n").filter(Boolean);
for (const file of pending) {
  if (!existsSync(file) || /\.(webp|jpe?g|png|ico)$/.test(file)) continue;
  check(file, readFileSync(file, "utf8"));
}

let liveNote = "";
const base = process.argv[2]?.replace(/\/$/, "");
if (base) {
  const seen = new Set();
  const queue = ["/", "/contact", "/book", "/admin/login", "/privacy", "/api/health", "/robots.txt", "/sitemap.xml"];
  while (queue.length) {
    const path = queue.shift();
    if (seen.has(path)) continue;
    seen.add(path);
    const response = await fetch(new URL(path, base));
    const text = await response.text();
    check(`live ${path}`, text);
    for (const [, asset] of text.matchAll(/["'](\/_next\/static\/[^"'\\]+\.(?:js|css))/g)) queue.push(asset);
  }
  liveNote = `, ${seen.size} live files`;
}

console.log(`Scanned ${pending.length} files, ${commits} commits${liveNote}, against ${secrets.length} real secret values.`);
if (findings.length) {
  console.log(`FOUND ${findings.length}:\n${[...new Set(findings)].join("\n")}`);
  process.exit(1);
}
console.log("No secrets found.");
