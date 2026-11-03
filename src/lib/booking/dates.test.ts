import { describe, expect, it } from "vitest";
import { bookableDays, isBookable, windowLabel } from "./dates";

// Tuesday 3 November 2026, 12:00 UTC.
const NOW = new Date("2026-11-03T12:00:00Z");

describe("bookableDays", () => {
  const days = bookableDays(NOW);
  it("starts the next day", () => expect(days[0].value).toBe("2026-11-04"));
  it("ends 14 days ahead", () => expect(days[days.length - 1].value).toBe("2026-11-17"));
  it("has no Sundays", () => {
    expect(days.some((d) => new Date(`${d.value}T12:00:00Z`).getUTCDay() === 0)).toBe(false);
    expect(days.length).toBe(12);
  });
  it("offers two windows on a weekday", () => {
    expect(days.find((d) => d.value === "2026-11-04")?.windows.map((w) => w.value)).toEqual(["morning", "afternoon"]);
  });
  it("offers only the morning on a Saturday", () => {
    expect(days.find((d) => d.value === "2026-11-07")?.windows.map((w) => w.value)).toEqual(["morning"]);
  });
  it("uses the London date just after midnight in summer", () => {
    expect(bookableDays(new Date("2026-07-01T23:30:00Z"))[0].value).toBe("2026-07-03");
  });
});

describe("isBookable", () => {
  it.each([
    ["today", "2026-11-03", "morning"],
    ["a Sunday", "2026-11-08", "morning"],
    ["too far ahead", "2026-11-18", "morning"],
    ["a Saturday afternoon", "2026-11-07", "afternoon"],
    ["a made-up window", "2026-11-04", "midnight"],
    ["nonsense", "soon", "morning"],
  ])("refuses %s", (_name, date, visitWindow) => {
    expect(isBookable(date, visitWindow, NOW)).toBe(false);
  });
  it("accepts a weekday afternoon", () => expect(isBookable("2026-11-05", "afternoon", NOW)).toBe(true));
});

describe("windowLabel", () => {
  it("names weekday windows", () => expect(windowLabel("2026-11-04", "afternoon")).toContain("12:00 to 18:00"));
  it("names the Saturday window", () => expect(windowLabel("2026-11-07", "morning")).toContain("09:00 to 13:00"));
});
