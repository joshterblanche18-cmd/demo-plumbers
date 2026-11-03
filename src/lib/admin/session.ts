// A signed, expiring admin session. Only the admin ever gets a cookie: visitors get none.
export const SESSION_HOURS = 8;

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(signature), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createSession(secret: string, now = Date.now()): Promise<string> {
  const expires = String(now + SESSION_HOURS * 3_600_000);
  return `${expires}.${await sign(expires, secret)}`;
}

export async function isValidSession(value: string | undefined, secret: string | undefined, now = Date.now()): Promise<boolean> {
  if (!value || !secret) return false;
  const [expires, signature, extra] = value.split(".");
  if (!expires || !signature || extra !== undefined) return false;
  if (!/^\d+$/.test(expires) || Number(expires) <= now) return false;
  const expected = await sign(expires, secret);
  if (expected.length !== signature.length) return false;
  let difference = 0;
  for (let i = 0; i < expected.length; i++) difference |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return difference === 0;
}
