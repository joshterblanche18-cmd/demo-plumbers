// Shows the chat's "paused" state by pretending today's budget is used up, then puts it back.
// Run: node scripts/chat-budget.mjs pause      or      node scripts/chat-budget.mjs resume
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);

const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
const get = (type) => parts.find((p) => p.type === type).value;
const day = `${get("year")}-${get("month")}-${get("day")}`;

const action = process.argv[2];
if (action !== "pause" && action !== "resume") {
  console.log("Use: node scripts/chat-budget.mjs pause   or   node scripts/chat-budget.mjs resume");
  process.exit(1);
}

const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/chat_budget_days?on_conflict=day`, {
  method: "POST",
  headers: {
    apikey: env.SUPABASE_SECRET_KEY,
    "Content-Type": "application/json",
    Prefer: "resolution=merge-duplicates,return=minimal",
  },
  body: JSON.stringify({ day, spent_nano_usd: action === "pause" ? 130_000_000 : 0 }),
});
console.log(response.ok ? `Done: the chat is ${action === "pause" ? "paused" : "back on"} for ${day}.` : `That did not work (status ${response.status}).`);
