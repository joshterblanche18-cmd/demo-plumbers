import { describe, expect, it } from "vitest";
import { assertTestKey } from "./stripe";

describe("assertTestKey", () => {
  it.each(["sk_test_abc", "rk_test_abc"])("allows %s", (key) => expect(assertTestKey(key)).toBe(key));
  it.each(["sk_live_abc", "rk_live_abc", "pk_test_abc", "", undefined, "abc"])("refuses %s", (key) => {
    expect(() => assertTestKey(key)).toThrow();
  });
});
