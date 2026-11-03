import { describe, expect, it } from "vitest";
import { cleanReply, FALLBACK_REPLY, systemPrompt } from "./reply";

describe("cleanReply", () => {
  it("keeps real prices", () => {
    expect(cleanReply("A boiler service is from £85, and a new boiler from £2,200.", false)).toContain("£85");
  });
  it("accepts a real price written without its comma", () => {
    expect(cleanReply("A new boiler is from £2200.", false)).toContain("£2200");
  });
  it("replaces a reply containing an invented price", () => {
    expect(cleanReply("Moving a radiator is about £150.", false)).toBe(FALLBACK_REPLY);
  });
  it("removes em dashes and markdown bold", () => {
    expect(cleanReply("We cover **Cults** — and Westhill.", false)).toBe("We cover Cults, and Westhill.");
  });
  it("cuts a reply that stopped early at the last whole sentence", () => {
    expect(cleanReply("We cover Cults. We also cover West", true)).toBe("We cover Cults.");
  });
  it("uses the fallback for an empty reply", () => {
    expect(cleanReply("  ", false)).toBe(FALLBACK_REPLY);
  });
});

describe("systemPrompt", () => {
  it("contains the facts and rules, with no em dashes", () => {
    const prompt = systemPrompt();
    expect(prompt).toContain("<facts>");
    expect(prompt).toContain("Boiler service from £85");
    expect(prompt).not.toMatch(/—/);
  });
});
