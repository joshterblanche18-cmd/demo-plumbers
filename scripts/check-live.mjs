// Checks the live site without submitting any form or payment. It sends one real chat message, which costs a tiny amount.
// Run: node scripts/check-live.mjs https://the-live-address
import { chromium } from "@playwright/test";

const base = process.argv[2]?.replace(/\/$/, "");
const PAGES = ["/", "/services", "/services/emergency-plumbing", "/services/boiler-repair-and-replacement", "/services/boiler-servicing", "/services/bathrooms", "/areas/bridge-of-don", "/areas/cults", "/areas/westhill", "/about", "/pricing", "/faq", "/contact", "/book", "/privacy", "/terms", "/admin/login"];

const browser = await chromium.launch();
const problems = [];
for (const [name, viewport] of [["phone", { width: 390, height: 844 }], ["laptop", { width: 1280, height: 800 }]]) {
  const page = await (await browser.newContext({ viewport })).newPage();
  page.on("console", (m) => {
    if (m.type() === "error") problems.push(`${name} console: ${m.text().slice(0, 160)}`);
  });
  page.on("pageerror", (e) => problems.push(`${name} page error: ${e.message.slice(0, 160)}`));
  let slowest = 0;
  for (const path of PAGES) {
    const start = Date.now();
    const response = await page.goto(`${base}${path}`, { waitUntil: "load" });
    slowest = Math.max(slowest, Date.now() - start);
    if (response?.status() !== 200) problems.push(`${name} ${path} status ${response?.status()}`);
    if (!(await page.locator(".demo-banner").count())) problems.push(`${name} ${path} no banner`);
    if ((await page.locator('meta[name="robots"]').getAttribute("content")) !== "noindex, nofollow") problems.push(`${name} ${path} no noindex`);
    const size = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (size > 0) problems.push(`${name} ${path} scrolls sideways by ${size}`);
    const broken = await page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute("src")));
    if (broken.length) problems.push(`${name} ${path} broken images: ${broken.join(", ")}`);
  }
  console.log(`${name}: ${PAGES.length} pages loaded, slowest ${slowest} ms`);
  await page.context().close();
}

const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
page.on("console", (m) => {
  if (m.type() === "error") problems.push(`chat console: ${m.text().slice(0, 160)}`);
});
await page.goto(base, { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Ask our chatbot" }).click();
await page.getByLabel("Your question").fill("I can smell gas in my kitchen");
await page.getByRole("button", { name: "Send", exact: true }).click();
await page.getByRole("log").getByRole("alert").waitFor({ timeout: 15000 });
console.log("gas advice:", (await page.getByRole("log").getByRole("alert").innerText()).includes("0800 111 999") ? "shown" : "MISSING");
await page.getByLabel("Your question").fill("Do you cover Westhill?");
await page.getByRole("button", { name: "Send", exact: true }).click();
await page.locator('[role="log"] p', { hasText: "Assistant said" }).first().waitFor({ timeout: 30000 });
console.log("AI reply:", (await page.locator('[role="log"] p', { hasText: "Assistant said" }).first().innerText()).replace(/\s+/g, " ").slice(0, 170));
await browser.close();

for (const [label, init] of [
  ["webhook unsigned", { url: "/api/stripe/webhook", method: "POST", body: "{}" }],
  ["webhook forged", { url: "/api/stripe/webhook", method: "POST", body: "{}", headers: { "stripe-signature": "t=1,v1=fake" } }],
  ["chat from another site", { url: "/api/chat", method: "POST", body: "{}", headers: { Origin: "https://evil.example" } }],
]) {
  const r = await fetch(base + init.url, init);
  console.log(`${label}: ${r.status}`);
}
const missing = await fetch(`${base}/no-such-page`);
console.log(`missing page: ${missing.status}`);
for (const path of ["/robots.txt", "/sitemap.xml", "/icon.svg", "/photos/share.jpg"]) {
  const r = await fetch(base + path);
  console.log(`${path}: ${r.status}`);
}
const dynamic = [];
for (let i = 0; i < 15; i++) dynamic.push((await fetch(`${base}/book`)).status);
console.log("/book, 15 requests:", [...new Set(dynamic)].join(","));

console.log(problems.length ? `PROBLEMS (${problems.length}):\n${[...new Set(problems)].join("\n")}` : "No problems found.");
