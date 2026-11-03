// Takes the README screenshots from a running site. Run: node scripts/screenshots.mjs http://localhost:3200
import { mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:3200";
const out = new URL("../docs/screenshots/", import.meta.url);
mkdirSync(out, { recursive: true });
const file = (name) => new URL(`${name}.png`, out).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const shots = [
  { name: "home", path: "/" },
  { name: "services", path: "/services" },
  { name: "emergency", path: "/services/emergency-plumbing" },
  { name: "area-cults", path: "/areas/cults" },
  { name: "pricing", path: "/pricing" },
  { name: "contact", path: "/contact" },
  { name: "book", path: "/book" },
];

const browser = await chromium.launch();
for (const [size, viewport] of [["desktop", { width: 1280, height: 800 }], ["phone", { width: 390, height: 844 }]]) {
  for (const theme of ["light", "dark"]) {
    const page = await (await browser.newContext({ viewport, deviceScaleFactor: size === "phone" ? 2 : 1 })).newPage();
    for (const shot of shots) {
      await page.goto(`${base}${shot.path}`, { waitUntil: "networkidle" });
      if (theme === "dark") await page.locator("#theme-toggle").check({ force: true });
      await page.screenshot({ path: file(`${shot.name}-${size}-${theme}`), fullPage: shot.name !== "home" });
      if (shot.name === "home") await page.screenshot({ path: file(`home-full-${size}-${theme}`), fullPage: true });
    }
    await page.goto(`${base}/`, { waitUntil: "networkidle" });
    if (theme === "dark") await page.locator("#theme-toggle").check({ force: true });
    await page.getByRole("button", { name: "Ask our chatbot" }).click();
    await page.getByLabel("Your question").fill("I can smell gas in my kitchen");
    await page.getByRole("button", { name: "Send", exact: true }).click();
    await page.getByRole("log").getByRole("alert").waitFor();
    await page.screenshot({ path: file(`chat-${size}-${theme}`) });
    await page.context().close();
  }
}
await browser.close();
console.log("done");
