import { describe, expect, it } from "vitest";
import { createSession, isValidSession, SESSION_HOURS } from "./session";

const SECRET = "test-secret";
const NOW = 1_800_000_000_000;

describe("admin session", () => {
  it("accepts a fresh session", async () => {
    expect(await isValidSession(await createSession(SECRET, NOW), SECRET, NOW + 1000)).toBe(true);
  });
  it("refuses an expired session", async () => {
    const session = await createSession(SECRET, NOW);
    expect(await isValidSession(session, SECRET, NOW + SESSION_HOURS * 3_600_000 + 1)).toBe(false);
  });
  it("refuses a session signed with another secret", async () => {
    expect(await isValidSession(await createSession("other", NOW), SECRET, NOW)).toBe(false);
  });
  it("refuses a changed expiry date", async () => {
    const [, signature] = (await createSession(SECRET, NOW)).split(".");
    expect(await isValidSession(`${NOW * 2}.${signature}`, SECRET, NOW)).toBe(false);
  });
  it.each([undefined, "", "abc", "1.2.3", ".", "9999999999999."])("refuses %s", async (value) => {
    expect(await isValidSession(value, SECRET, NOW)).toBe(false);
  });
  it("refuses everything when no secret is set", async () => {
    expect(await isValidSession(await createSession(SECRET, NOW), undefined, NOW)).toBe(false);
  });
});
