import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { handleStripeEvent } from "./webhook";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
if (env.TEST_SUPABASE_URL === env.NEXT_PUBLIC_SUPABASE_URL) throw new Error("Test database must differ from the site database");

const db = createClient(env.TEST_SUPABASE_URL, env.TEST_SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
const ids = { session: `cs_test_${crypto.randomUUID()}`, intent: `pi_test_${crypto.randomUUID()}` };

const session = (overrides: Partial<Stripe.Checkout.Session> = {}) =>
  ({ id: ids.session, payment_status: "paid", amount_total: 2500, currency: "gbp", payment_intent: ids.intent, ...overrides }) as Stripe.Checkout.Session;
const event = (type: string, object: unknown, overrides: Partial<Stripe.Event> = {}) =>
  ({ id: `evt_${crypto.randomUUID()}`, type, livemode: false, data: { object }, ...overrides }) as unknown as Stripe.Event;

const status = async () => (await db.from("bookings").select("status, email_sent, paid_at").eq("stripe_session_id", ids.session).single()).data;

let emails = 0;
const sendEmail = async () => {
  emails += 1;
  return true;
};

beforeAll(async () => {
  const { error } = await db.from("bookings").insert({
    visit_date: "2030-01-07",
    visit_window: "morning",
    name: "Test Person",
    phone: "01632 960 472",
    email: "test@example.com",
    postcode_area: "AB15",
    problem: "Integration test",
    amount_pence: 2500,
    stripe_session_id: ids.session,
  });
  if (error) throw new Error(error.message);
});

afterAll(async () => {
  await db.from("bookings").delete().eq("stripe_session_id", ids.session);
});

describe("handleStripeEvent", () => {
  it("ignores a session that is not paid", async () => {
    await handleStripeEvent(db, event("checkout.session.completed", session({ payment_status: "unpaid" })), sendEmail);
    expect((await status())?.status).toBe("pending");
  });
  it("ignores the wrong amount", async () => {
    await handleStripeEvent(db, event("checkout.session.completed", session({ amount_total: 1 })), sendEmail);
    expect((await status())?.status).toBe("pending");
  });
  it("ignores the wrong currency", async () => {
    await handleStripeEvent(db, event("checkout.session.completed", session({ currency: "usd" })), sendEmail);
    expect((await status())?.status).toBe("pending");
  });
  it("ignores anything from a live account", async () => {
    await handleStripeEvent(db, event("checkout.session.completed", session(), { livemode: true }), sendEmail);
    expect((await status())?.status).toBe("pending");
  });
  it("confirms a paid booking and sends one email", async () => {
    await handleStripeEvent(db, event("checkout.session.completed", session()), sendEmail);
    const row = await status();
    expect(row?.status).toBe("paid");
    expect(row?.email_sent).toBe(true);
    expect(emails).toBe(1);
  });
  it("is safe when the same event arrives twice, even at once", async () => {
    const paidAt = (await status())?.paid_at;
    await Promise.all([1, 2, 3].map(() => handleStripeEvent(db, event("checkout.session.completed", session()), sendEmail)));
    expect(emails).toBe(1);
    expect((await status())?.paid_at).toBe(paidAt);
  });
  it("does not turn a paid booking back to expired", async () => {
    await handleStripeEvent(db, event("checkout.session.expired", session()), sendEmail);
    expect((await status())?.status).toBe("paid");
  });
  it("ignores a partial refund", async () => {
    await handleStripeEvent(db, event("charge.refunded", { refunded: false, payment_intent: ids.intent }), sendEmail);
    expect((await status())?.status).toBe("paid");
  });
  it("marks a full refund", async () => {
    await handleStripeEvent(db, event("charge.refunded", { refunded: true, payment_intent: ids.intent }), sendEmail);
    expect((await status())?.status).toBe("refunded");
  });
  it("does not let a late repeat payment event undo a refund", async () => {
    await handleStripeEvent(db, event("checkout.session.completed", session()), sendEmail);
    expect((await status())?.status).toBe("refunded");
    expect(emails).toBe(1);
  });
});

describe("abandoned checkout", () => {
  it("expires a pending booking and never confirms it", async () => {
    const id = `cs_test_${crypto.randomUUID()}`;
    await db.from("bookings").insert({
      visit_date: "2030-01-08",
      visit_window: "afternoon",
      name: "Test Person",
      phone: "01632 960 472",
      email: "test@example.com",
      postcode_area: "AB15",
      problem: "Integration test",
      amount_pence: 2500,
      stripe_session_id: id,
    });
    await handleStripeEvent(db, event("checkout.session.expired", { id }), sendEmail);
    const { data } = await db.from("bookings").select("status").eq("stripe_session_id", id).single();
    expect(data?.status).toBe("expired");
    await db.from("bookings").delete().eq("stripe_session_id", id);
  });
});
