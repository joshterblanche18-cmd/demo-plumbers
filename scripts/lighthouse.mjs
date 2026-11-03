// Runs Lighthouse on phone settings, 5 times per page, and reports the middle result of each score.
// Run: node scripts/lighthouse.mjs https://the-live-address
import { exec } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { chromium } from "@playwright/test";

const run = promisify(exec);
const base = process.argv[2]?.replace(/\/$/, "");
// Lighthouse connects to a browser Playwright has already opened, because it cannot start this copy itself.
// The wait must not block this program, or the open browser stops responding.
const browser = await chromium.launch({ args: ["--remote-debugging-port=9333"] });
const dir = mkdtempSync(join(tmpdir(), "lh-"));
const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
const summary = {};

for (const [name, path] of [["home", "/"], ["checkout", "/book"]]) {
  const runs = [];
  for (let i = 0; i < 5; i++) {
    const out = join(dir, `${name}-${i}.json`);
    try {
      await run(`npx.cmd --yes lighthouse@13.6.0 "${base}${path}" --quiet --output=json --output-path="${out}" --port=9333 --only-categories=performance,accessibility,best-practices,seo`, { timeout: 150_000 });
    } catch (error) {
      console.log(`${name} run ${i + 1} failed: ${String(error.message).slice(0, 160)}`);
      continue;
    }
    const report = JSON.parse(readFileSync(out, "utf8"));
    const score = (key) => Math.round(report.categories[key].score * 100);
    const result = { performance: score("performance"), accessibility: score("accessibility"), bestPractices: score("best-practices"), seo: score("seo"), lcpMs: Math.round(report.audits["largest-contentful-paint"].numericValue) };
    runs.push(result);
    if (i === 0) {
      const notFull = Object.values(report.categories).flatMap((c) => c.auditRefs.filter((a) => a.weight > 0 && report.audits[a.id].score !== null && report.audits[a.id].score < 1).map((a) => `${c.id}: ${a.id} (${report.audits[a.id].displayValue ?? report.audits[a.id].score})`));
      console.log(`${name} first run, not full marks:\n  ${notFull.slice(0, 14).join("\n  ") || "none"}`);
    }
    console.log(`${name} run ${i + 1}:`, JSON.stringify(result));
  }
  if (runs.length) {
    summary[name] = {
      runs: runs.length,
      performance: median(runs.map((r) => r.performance)),
      accessibility: median(runs.map((r) => r.accessibility)),
      bestPractices: median(runs.map((r) => r.bestPractices)),
      seo: median(runs.map((r) => r.seo)),
      lcpMs: median(runs.map((r) => r.lcpMs)),
    };
  }
}
await browser.close();
rmSync(dir, { recursive: true, force: true });
mkdirSync(new URL("../evals/", import.meta.url), { recursive: true });
writeFileSync(new URL("../evals/lighthouse-2026-11-03.json", import.meta.url), `${JSON.stringify({ date: "2026-11-03", url: base, summary }, null, 2)}\n`);
console.log("MEDIANS", JSON.stringify(summary));
