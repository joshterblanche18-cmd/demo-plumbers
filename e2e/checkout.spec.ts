import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import Stripe from "stripe";
import { ADMIN_EMAIL, E2E_EMAIL, env, testDb } from "./helpers";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

async function fillBooking(page: Page, problem: string) {
  await page.getByLabel("Date").selectOption({ index: 1 });
  await page.getByRole("group", { name: "Time window" }).getByRole("radio").first().check();
  await page.getByLabel("Your name").fill("E2E Visitor");
  await page.getByLabel("Phone number").fill("01632 960 111");
  await page.getByLabel("Email address").fill(E2E_EMAIL);
  await page.getByLabel("Postcode area").fill("AB15");
  await page.getByLabel("What is the problem?").fill(problem);
  await page.getByRole("checkbox", { name: /I agree to the/ }).check();
}

// Sends Stripe's real event for a session to the local site, signed as Stripe would sign it.
async function deliver(page: Page, event: Stripe.Event) {
  const payload = JSON.stringify(event);
  const header = stripe.webhooks.generateTestHeaderString({ payload, secret: process.env.E2E_WEBHOOK_SECRET ?? "" });
  return page.request.post("/api/stripe/webhook", { data: payload, headers: { "stripe-signature": header, "Content-Type": "application/json" } });
}

test("Book page shows the test card and only offers real windows", async ({ page }) => {
  await page.goto("/book");
  await expect(page.locator("main")).toContainText("4242 4242 4242 4242");
  const options = await page.getByLabel("Date").locator("option").allInnerTexts();
  expect(options.length).toBe(13);
  expect(options.some((o) => o.startsWith("Sunday"))).toBe(false);
  const saturday = options.find((o) => o.startsWith("Saturday")) ?? "";
  await page.getByLabel("Date").selectOption({ label: saturday });
  await expect(page.getByRole("group", { name: "Time window" }).getByRole("radio")).toHaveCount(1);
  await expect(page.getByRole("group", { name: "Time window" })).toContainText("09:00 to 13:00");
});

test("missing fields show errors and start no payment", async ({ page }) => {
  await page.goto("/book");
  await page.getByRole("button", { name: /Pay £25/ }).click();
  await expect(page.locator("#date-error")).toBeVisible();
  await expect(page).toHaveURL(/\/book/);
});

test("the webhook refuses anything not signed by Stripe", async ({ request }) => {
  const r = await request.post("/api/stripe/webhook", { data: "{}", headers: { "stripe-signature": "t=1,v1=fake" } });
  expect(r.status()).toBe(400);
});

test("a faked confirmation link confirms nothing", async ({ page }) => {
  await page.goto("/book/confirmed?session_id=cs_test_madeup");
  await expect(page.locator("h1")).toHaveText("We could not find that booking");
});

test("the admin page needs a sign-in, and a wrong password fails", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.getByLabel("Email address").fill(ADMIN_EMAIL);
  await page.getByLabel("Password").fill("not-the-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("That email and password did not work.")).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("abandoning the payment page books nothing", async ({ page }, info) => {
  test.skip(info.project.name !== "laptop", "Only needs to run once");
  const problem = `Abandoned ${Date.now()}`;
  await page.goto("/book");
  await fillBooking(page, problem);
  await page.getByRole("button", { name: /Pay £25/ }).click();
  await page.waitForURL(/checkout\.stripe\.com/);
  const { data } = await testDb().from("bookings").select("status, stripe_session_id").eq("problem", problem).single();
  expect(data?.status).toBe("pending");
  await page.goto(`/book/confirmed?session_id=${data?.stripe_session_id}`);
  await expect(page.locator("h1")).toHaveText("Waiting for payment confirmation");
});

test("a test payment, its confirmation and a refund all work", async ({ page }, info) => {
  test.skip(info.project.name !== "laptop", "Only needs to run once");
  const problem = `Paid ${Date.now()}`;
  await page.goto("/book");
  await fillBooking(page, problem);
  await page.getByRole("button", { name: /Pay £25/ }).click();
  await page.waitForURL(/checkout\.stripe\.com/);

  await page.locator("#cardNumber").fill("4242 4242 4242 4242");
  await page.locator("#cardExpiry").fill("12 / 34");
  await page.locator("#cardCvc").fill("123");
  await page.locator("#billingName").fill("E2E Visitor");
  const postcode = page.locator("#billingPostalCode");
  if (await postcode.isVisible()) await postcode.fill("AB15 1AA");
  await page.locator(".SubmitButton, button[type=submit]").first().click();
  await page.waitForURL(/\/book\/confirmed/, { timeout: 45_000 });

  // Paying alone does not confirm the booking: only the webhook can.
  const sessionId = new URL(page.url()).searchParams.get("session_id") ?? "";
  await expect(page.locator("h1")).toHaveText("Waiting for payment confirmation");

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  expect(session.payment_status).toBe("paid");
  expect(session.amount_total).toBe(2500);
  expect(session.currency).toBe("gbp");
  const completed = { id: `evt_e2e_${Date.now()}`, type: "checkout.session.completed", livemode: false, data: { object: session } } as unknown as Stripe.Event;

  expect((await deliver(page, completed)).status()).toBe(200);
  expect((await deliver(page, completed)).status()).toBe(200);
  await page.reload();
  await expect(page.locator("h1")).toHaveText("Your call-out is booked");

  await page.goto("/admin/login");
  await page.getByLabel("Email address").fill(ADMIN_EMAIL);
  await page.getByLabel("Password").fill(process.env.E2E_ADMIN_PASSWORD ?? "");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.getByRole("button", { name: "Refund the deposit for E2E Visitor" }).first().click();
  await expect(page.getByText("Refunded in test mode.")).toBeVisible({ timeout: 20_000 });

  const refunds = await stripe.refunds.list({ payment_intent: String(session.payment_intent) });
  expect(refunds.data.length).toBe(1);
  expect(refunds.data[0].amount).toBe(2500);
  const { data } = await testDb().from("bookings").select("status").eq("problem", problem).single();
  expect(data?.status).toBe("refunded");
});
