import { describe, expect, it } from "vitest";
import { isSpam, keepValues, validateEnquiry } from "./forms";

function form(overrides: Record<string, string | null> = {}) {
  const base: Record<string, string | null> = {
    name: "Test Person",
    phone: "01632 960 472",
    email: "test@example.com",
    postcode: "ab15",
    problem: "The boiler has stopped.",
    urgency: "soon",
    contact_method: "phone",
    preferred_time: "morning",
    consent: "yes",
    ...overrides,
  };
  const data = new FormData();
  for (const [k, v] of Object.entries(base)) if (v !== null) data.set(k, v);
  return data;
}

describe("validateEnquiry", () => {
  it("accepts a good enquiry and tidies the postcode", () => {
    const result = validateEnquiry(form());
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.postcode_area).toBe("AB15");
  });
  it.each(["AB15", "ab10 1aa", "AB21 9XY", "EH1"])("accepts postcode %s", (postcode) => {
    expect(validateEnquiry(form({ postcode })).ok).toBe(true);
  });
  it.each([
    ["name", { name: "" }],
    ["name", { name: "Real Name\nBcc: someone@example.com" }],
    ["phone", { phone: "123" }],
    ["phone", { phone: "call me maybe" }],
    ["email", { email: "nope" }],
    ["postcode", { postcode: "banana" }],
    ["problem", { problem: " " }],
    ["problem", { problem: "x".repeat(2001) }],
    ["urgency", { urgency: "tomorrow" }],
    ["contact_method", { contact_method: "pigeon" }],
    ["preferred_time", { preferred_time: "midnight" }],
    ["consent", { consent: null }],
  ])("reports %s next to the right field", (field, overrides) => {
    const result = validateEnquiry(form(overrides));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.errors)).toEqual([field]);
  });
});

describe("spam field", () => {
  it("spots a filled hidden field", () => expect(isSpam(form({ kg_leave_blank: "Spam Ltd" }))).toBe(true));
  it("leaves real people alone", () => expect(isSpam(form({ kg_leave_blank: "" }))).toBe(false));
  it("does not keep the hidden field when redisplaying the form", () => {
    expect(keepValues(form({ kg_leave_blank: "Spam Ltd" }))).not.toHaveProperty("kg_leave_blank");
  });
});
