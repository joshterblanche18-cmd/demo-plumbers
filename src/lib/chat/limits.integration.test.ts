import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { afterAll, describe, expect, it } from "vitest";
import { countVisitor, limitsClient, reserveBudget, settleBudget, visitorHash } from "./limits";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);

// Refuses to run against anything except the test project.
if (env.TEST_SUPABASE_URL === env.NEXT_PUBLIC_SUPABASE_URL) throw new Error("Test database must differ from the site database");

const db = limitsClient(env.TEST_SUPABASE_URL, env.TEST_SUPABASE_SECRET_KEY);
const visitorsKey = createClient(env.TEST_SUPABASE_URL, env.TEST_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } });
const DAY = "2001-01-01";
const OTHER_DAY = "2001-01-02";

afterAll(async () => {
  await db.from("chat_budget_days").delete().in("day", [DAY, OTHER_DAY]);
  await db.from("chat_visitor_days").delete().in("day", [DAY, OTHER_DAY]);
});

describe("daily budget", () => {
  it("lets exactly as many reservations through as the budget allows, even all at once", async () => {
    const results = await Promise.all(Array.from({ length: 20 }, () => reserveBudget(db, DAY, 10, 50)));
    expect(results.filter(Boolean).length).toBe(5);
    const { data } = await db.from("chat_budget_days").select("spent_nano_usd").eq("day", DAY).single();
    expect(Number(data?.spent_nano_usd)).toBe(50);
  });

  it("settles to the real cost, which frees up what was not used", async () => {
    await settleBudget(db, DAY, 10, 4);
    const { data } = await db.from("chat_budget_days").select("spent_nano_usd").eq("day", DAY).single();
    expect(Number(data?.spent_nano_usd)).toBe(44);
    expect(await reserveBudget(db, DAY, 6, 50)).toBe(true);
    expect(await reserveBudget(db, DAY, 1, 50)).toBe(false);
  });

  it("refuses everything when the limit is zero", async () => {
    expect(await reserveBudget(db, OTHER_DAY, 1, 0)).toBe(false);
  });

  it("refuses a single reservation larger than the limit", async () => {
    expect(await reserveBudget(db, OTHER_DAY, 51, 50)).toBe(false);
  });
});

describe("per-visitor limit", () => {
  it("stops a visitor at the limit, even when sent all at once", async () => {
    const hash = await visitorHash("203.0.113.5", DAY, "test-salt");
    const results = await Promise.all(Array.from({ length: 8 }, () => countVisitor(db, DAY, hash, 3)));
    expect(results.filter(Boolean).length).toBe(3);
  });

  it("counts each visitor separately", async () => {
    const hash = await visitorHash("203.0.113.6", DAY, "test-salt");
    expect(await countVisitor(db, DAY, hash, 3)).toBe(true);
  });

  it("gives a different hash on a different day", async () => {
    expect(await visitorHash("203.0.113.5", DAY, "s")).not.toBe(await visitorHash("203.0.113.5", OTHER_DAY, "s"));
  });
});

describe("visitors' public key", () => {
  it("cannot read the tables", async () => {
    const { data, error } = await visitorsKey.from("chat_budget_days").select("*");
    expect(error !== null || (data ?? []).length === 0).toBe(true);
  });
  it("cannot change the budget", async () => {
    const { error } = await visitorsKey.rpc("chat_settle_budget", { p_day: DAY, p_reserved: 1000, p_actual: 0 });
    expect(error).not.toBeNull();
  });
  it("cannot reserve budget", async () => {
    const { error } = await visitorsKey.rpc("chat_reserve_budget", { p_day: DAY, p_amount: 1, p_limit: 1000 });
    expect(error).not.toBeNull();
  });
  it("cannot write to the tables", async () => {
    const { error } = await visitorsKey.from("chat_budget_days").insert({ day: OTHER_DAY, spent_nano_usd: 0 });
    expect(error).not.toBeNull();
  });
});
