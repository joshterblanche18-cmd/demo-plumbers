import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { PAGES } from "./helpers";

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

for (const path of PAGES) {
  test.describe(`page ${path}`, () => {
    test("meets the honesty rules and basics", async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator(".demo-banner")).toHaveText("Demo website for a fictional business. Nothing is sold.");
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.{40,}/);
      await expect(page.locator('footer a[href="tel:+44800111999"]')).toHaveCount(1);
      await expect(page.locator('a[href="tel:+441632960472"]').first()).toBeAttached();
      await expect(page.locator('a[href="/contact"]').first()).toBeAttached();

      const text = await page.locator("body").innerText();
      expect(text).toContain("fictional firm and holds no registrations");
      expect(text).not.toMatch(/—/);
      expect(text).not.toMatch(/testimonial|years of experience|award.winning|\d+ (happy )?customers|as seen in/i);
      expect(text).not.toMatch(/\bclaude\b/i);

      const size = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
      expect(size.scroll).toBeLessThanOrEqual(size.client);
      const jsonLd = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? "{}");
      expect(jsonLd["@type"]).toBe("Plumber");
    });

    test("has no automatic accessibility failures, light and dark", async ({ page }) => {
      await page.goto(path);
      const light = await new AxeBuilder({ page }).withTags(WCAG).analyze();
      expect(light.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
      await page.locator("#theme-toggle").check({ force: true });
      const dark = await new AxeBuilder({ page }).withTags(WCAG).analyze();
      expect(dark.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
    });
  });
}

test("every page title and description is different", async ({ page }) => {
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  for (const path of PAGES) {
    await page.goto(path);
    titles.add(await page.title());
    descriptions.add((await page.locator('meta[name="description"]').getAttribute("content")) ?? "");
  }
  expect(titles.size).toBe(PAGES.length);
  expect(descriptions.size).toBe(PAGES.length);
});

test("every internal link works", async ({ page, request }) => {
  const seen = new Set<string>();
  for (const path of PAGES) {
    await page.goto(path);
    const links = await page.locator("a[href^='/']").evaluateAll((els) => els.map((e) => e.getAttribute("href") ?? ""));
    for (const link of links) seen.add(link.split("#")[0]);
  }
  for (const link of seen) {
    if (!link) continue;
    const response = await request.get(link);
    expect(response.status(), link).toBe(200);
  }
});

test("a missing page gives a helpful 404", async ({ page }) => {
  const response = await page.goto("/no-such-page");
  expect(response?.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText("This page is not here");
  await expect(page.locator("footer")).toContainText("holds no registrations");
  await expect(page.locator(".demo-banner")).toBeVisible();
  await expect(page.locator('main a[href="/contact"]')).toBeVisible();
});

test("the area pages say genuinely different things", async ({ page }) => {
  const bodies: string[] = [];
  for (const path of ["/areas/bridge-of-don", "/areas/cults", "/areas/westhill"]) {
    await page.goto(path);
    bodies.push(await page.locator("main").evaluate((el) => { const copy = el.cloneNode(true) as HTMLElement; copy.querySelector("aside")?.remove(); return copy.textContent ?? ""; }));
  }
  const sentences = bodies.map((b) => new Set(b.split(/(?<=[.!?])\s+/).filter((s) => s.length > 50)));
  const shared = [...sentences[0]].filter((s) => sentences[1].has(s) || sentences[2].has(s));
  expect(shared).toEqual([]);
});

test("the emergency page shows the safety box", async ({ page }) => {
  await page.goto("/services/emergency-plumbing");
  await expect(page.locator('main a[href="tel:+44800111999"]')).toBeVisible();
});

test("search files exist and do not hide the noindex", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const path of PAGES) expect(sitemap).toContain(path === "/" ? "<loc>" : path);
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toMatch(/Allow: \//);
  expect(robots).toContain("/admin");
});

test("the phone menu closes after choosing a page, and on Escape", async ({ page }, info) => {
  test.skip(info.project.name !== "phone", "The menu only appears on phones");
  await page.goto("/");
  await page.getByText("Menu", { exact: true }).click();
  await page.getByRole("link", { name: "Pricing" }).last().click();
  await expect(page).toHaveURL(/\/pricing/);
  await expect(page.locator("header details")).not.toHaveAttribute("open", "");
  await page.getByText("Menu", { exact: true }).click();
  await expect(page.locator("header details")).toHaveAttribute("open", "");
  await page.keyboard.press("Escape");
  await expect(page.locator("header details")).not.toHaveAttribute("open", "");
});

test("gas advice shows before the bottom bar on the emergency and home pages", async ({ page }, info) => {
  test.skip(info.project.name !== "phone", "A phone-size check");
  for (const path of ["/", "/services/emergency-plumbing"]) {
    await page.goto(path);
    const box = await page.locator('main a[href="tel:+44800111999"]').first().boundingBox();
    expect(box && box.y + box.height, path).toBeLessThan(788);
  }
});
