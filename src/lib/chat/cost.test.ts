import { describe, expect, it } from "vitest";
import { actualCost, dailyBudget, DEFAULT_DAILY_BUDGET_NANO_USD, londonDay, worstCaseCost } from "./cost";

describe("cost", () => {
  it("uses the published Haiku 5.5 rates", () => {
    expect(actualCost(1_000_000, 0)).toBe(100_000_000);
    expect(actualCost(0, 1_000_000)).toBe(500_000_000);
  });
  it("reserves at least the real cost for ordinary English", () => {
    const text = "How much is a boiler service in Aberdeen?".repeat(20);
    const roughTokens = Math.ceil(text.length / 4);
    expect(worstCaseCost(text.length, 350)).toBeGreaterThan(actualCost(roughTokens, 350));
  });
});

describe("dailyBudget", () => {
  it("defaults to the cap", () => expect(dailyBudget(undefined)).toBe(DEFAULT_DAILY_BUDGET_NANO_USD));
  it("can be set to zero to show the paused state", () => expect(dailyBudget("0")).toBe(0));
  it("can never be raised above the cap", () => expect(dailyBudget("999999999999")).toBe(DEFAULT_DAILY_BUDGET_NANO_USD));
  it("treats nonsense as no budget", () => {
    expect(dailyBudget("lots")).toBe(0);
    expect(dailyBudget("-5")).toBe(0);
  });
  it("stays under £0.10 at the rate checked on 3 November 2026", () => {
    expect((DEFAULT_DAILY_BUDGET_NANO_USD / 1e9) * 0.7457).toBeLessThan(0.1);
  });
});

describe("londonDay", () => {
  it("uses London time, not UTC, in British Summer Time", () => {
    expect(londonDay(new Date("2026-07-01T23:30:00Z"))).toBe("2026-07-02");
  });
  it("matches UTC in winter", () => {
    expect(londonDay(new Date("2026-12-01T23:30:00Z"))).toBe("2026-12-01");
  });
});
