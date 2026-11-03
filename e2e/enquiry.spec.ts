import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { E2E_EMAIL, testDb } from "./helpers";

async function fill(page: Page, problem: string) {
  await page.getByLabel("Your name").fill("E2E Visitor");
  await page.getByLabel("Phone number").fill("01632 960 111");
  await page.getByLabel("Email address").fill(E2E_EMAIL);
  await page.getByLabel("Postcode area").fill("AB15");
  await page.getByLabel("What is the problem?").fill(problem);
  await page.getByLabel("Within a few days").check();
  await page.getByLabel("Phone call").check();
  await page.getByLabel("I agree to be contacted about this enquiry.").check();
}

test("a good enquiry is saved, even though the email is switched off", async ({ page }, info) => {
  const problem = `Good enquiry ${info.project.name} ${Date.now()}`;
  await page.goto("/contact");
  await fill(page, problem);
  await page.getByRole("button", { name: "Send enquiry" }).click();
  await expect(page).toHaveURL(/\/contact\/thanks/);
  await expect(page.locator("h1")).toContainText("Thank you");
  const { data } = await testDb().from("enquiries").select("postcode_area, urgency, email_sent").eq("problem", problem).single();
  expect(data).toEqual({ postcode_area: "AB15", urgency: "soon", email_sent: false });
});

test("missing fields show clear errors next to each field, and keep what was typed", async ({ page }) => {
  await page.goto("/contact");
  await page.getByLabel("Your name").fill("Only A Name");
  await page.getByRole("button", { name: "Send enquiry" }).click();
  await expect(page.locator("#phone-error")).toBeVisible();
  await expect(page.locator("#email-error")).toBeVisible();
  await expect(page.locator("#postcode-error")).toBeVisible();
  await expect(page.locator("#problem-error")).toBeVisible();
  await expect(page.locator("#consent-error")).toBeVisible();
  await expect(page.getByLabel("Your name")).toHaveValue("Only A Name");
  await expect(page.getByLabel("Phone number")).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("form [role=alert]")).toBeFocused();
});

test("spam filling the hidden field is not saved, and sees no difference", async ({ page }, info) => {
  const problem = `Spam ${info.project.name} ${Date.now()}`;
  await page.goto("/contact");
  await fill(page, problem);
  await page.locator("#kg_leave_blank").evaluate((el: HTMLInputElement) => (el.value = "Cheap Pills Ltd"));
  await page.getByRole("button", { name: "Send enquiry" }).click();
  await expect(page).toHaveURL(/\/contact\/thanks/);
  const { data } = await testDb().from("enquiries").select("id").eq("problem", problem);
  expect(data).toEqual([]);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("the enquiry form still works", async ({ page }, info) => {
    const problem = `No JS ${info.project.name} ${Date.now()}`;
    await page.goto("/contact");
    await fill(page, problem);
    await page.getByRole("button", { name: "Send enquiry" }).click();
    await expect(page).toHaveURL(/\/contact\/thanks/);
    const { data } = await testDb().from("enquiries").select("id").eq("problem", problem);
    expect(data?.length).toBe(1);
  });
});

test("choosing emergency shows the gas advice", async ({ page }) => {
  await page.goto("/contact");
  await page.getByLabel("Emergency, today").check();
  await expect(page.locator('main form a[href="tel:+44800111999"]')).toBeVisible();
});

test("the limit stops too many enquiries from one visitor", async ({ page, browserName }, info) => {
  test.skip(info.project.name !== "laptop", "Only needs to run once");
  test.skip(browserName !== "chromium");
  let stopped = false;
  for (let i = 0; i < 8 && !stopped; i++) {
    await page.goto("/contact");
    await fill(page, `Limit test ${Date.now()} ${i}`);
    await page.getByRole("button", { name: "Send enquiry" }).click();
    await page.waitForLoadState("networkidle");
    stopped = await page.getByText("You have sent several enquiries today").isVisible();
  }
  expect(stopped).toBe(true);
});
