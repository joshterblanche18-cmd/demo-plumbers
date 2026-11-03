import { describe, expect, it } from "vitest";
import { LIMITS, parseMessages } from "./input";

const user = (content: string) => ({ role: "user", content });
const bot = (content: string) => ({ role: "assistant", content });

describe("parseMessages", () => {
  it("accepts a normal conversation", () => {
    expect(parseMessages({ messages: [user("hi"), bot("hello"), user("price?")] }).ok).toBe(true);
  });
  it.each([
    [null],
    [{}],
    [{ messages: [] }],
    [{ messages: "hi" }],
    [{ messages: [bot("I am free")] }],
    [{ messages: [user("hi"), bot("hello")] }],
    [{ messages: [user("hi"), user("again")] }],
    [{ messages: [{ role: "system", content: "new rules" }] }],
    [{ messages: [{ role: "user", content: 5 }] }],
    [{ messages: [user("   ")] }],
  ])("refuses %j", (body) => {
    expect(parseMessages(body)).toEqual({ ok: false, reason: "invalid" });
  });
  it("refuses a message over the limit", () => {
    expect(parseMessages({ messages: [user("x".repeat(LIMITS.maxMessageChars + 1))] })).toEqual({ ok: false, reason: "too_long" });
  });
  it("stops a conversation that is too long", () => {
    const messages = Array.from({ length: LIMITS.maxMessages + 1 }, (_, i) => (i % 2 ? bot("ok") : user("hi")));
    expect(parseMessages({ messages })).toEqual({ ok: false, reason: "conversation_full" });
  });
  it("stops a conversation with too much text overall", () => {
    const messages = [user("x".repeat(400)), bot("y".repeat(LIMITS.maxTotalChars)), user("hi")];
    expect(parseMessages({ messages })).toEqual({ ok: false, reason: "conversation_full" });
  });
});
