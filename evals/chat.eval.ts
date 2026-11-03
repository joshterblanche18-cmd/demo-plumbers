// The locked 25-question test. It makes real paid API calls, and records the honest score, including failures.
import { readFileSync, writeFileSync } from "node:fs";
import { it } from "vitest";
import { chatClient, generateReply } from "@/lib/chat/answer";
import { detectEmergency } from "@/lib/chat/safety";

type Question = { id: number; group: string; ask: string; expect: string; mustMatch?: string[]; mustNotMatch?: string[] };

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
const { questions } = JSON.parse(readFileSync("evals/chat-questions.json", "utf8")) as { questions: Question[] };

it("runs the locked questions", async () => {
  const client = chatClient(env.ANTHROPIC_API_KEY);
  const results = [];
  let totalNano = 0;
  for (const q of questions) {
    const problems: string[] = [];
    let reply = "";
    const emergency = detectEmergency(q.ask);
    if (q.expect.startsWith("emergency:")) {
      if (emergency !== q.expect.split(":")[1]) problems.push(`expected ${q.expect}, got ${emergency}`);
      reply = `[official advice, no AI call: ${emergency}]`;
    } else if (emergency) {
      problems.push(`wrongly treated as an emergency: ${emergency}`);
    } else {
      const answer = await generateReply(client, [{ role: "user", content: q.ask }]);
      reply = answer.text;
      totalNano += answer.costNanoUsd;
      for (const re of q.mustMatch ?? []) if (!new RegExp(re, "i").test(reply)) problems.push(`missing: ${re}`);
      for (const re of q.mustNotMatch ?? []) if (new RegExp(re, "i").test(reply)) problems.push(`must not say: ${re}`);
      if (/—/.test(reply)) problems.push("contains an em dash");
    }
    results.push({ id: q.id, group: q.group, ask: q.ask, pass: problems.length === 0, problems, reply });
    console.log(`${problems.length === 0 ? "PASS" : "FAIL"} ${q.id} [${q.group}] ${q.ask}\n   -> ${reply}${problems.length ? `\n   !! ${problems.join("; ")}` : ""}`);
  }
  const passed = results.filter((r) => r.pass).length;
  const dollars = totalNano / 1e9;
  console.log(`\nSCORE ${passed} of ${results.length}. Cost $${dollars.toFixed(5)}, about £${(dollars * 0.7457).toFixed(5)}.`);
  writeFileSync(`evals/results-2026-11-03-run${process.env.EVAL_RUN ?? "1"}.json`, `${JSON.stringify({ date: "2026-11-03", model: "claude-haiku-5-5", passed, total: results.length, costUsd: dollars, results }, null, 2)}\n`);
});
