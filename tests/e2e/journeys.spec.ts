import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
test("recruiter journeys, real screenshots and mobile layout", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  mkdirSync("docs/screenshots", { recursive: true });
  await page.goto("/");
  await expect(page.getByText("40.4%", { exact: true })).toBeVisible();
  await page.screenshot({
    path: "docs/screenshots/landing.png",
    fullPage: false,
  });
  await page
    .getByRole("link", { name: "Launch Demo", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "Portfolio overview", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "docs/screenshots/dashboard.png",
    fullPage: false,
  });
  await page.getByLabel("Search enterprises").fill("no-such-firm");
  await expect(page.getByText("No matching enterprises")).toBeVisible();
  await page.getByRole("button", { name: "Reset filters" }).click();
  await page
    .getByRole("link", { name: /01 Tech finance High-growth AI company/ })
    .click();
  await expect(
    page.getByRole("heading", { name: "Xinglan AI", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Relationship manager brief" }),
  ).toBeVisible();
  await page.screenshot({
    path: "docs/screenshots/company-360.png",
    fullPage: false,
  });
  await page.getByRole("link", { name: "Innovation", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Innovation scorecard" }),
  ).toBeVisible();
  await page.screenshot({
    path: "docs/screenshots/innovation.png",
    fullPage: false,
  });
  await page.goto("/#risks/P-002");
  await expect(
    page.getByRole("heading", {
      name: "Revenue–VAT reconciliation",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Revenue-recognition timing", { exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "docs/screenshots/risk-analysis.png",
    fullPage: false,
  });
  await page.goto("/#company/P-003");
  await expect(
    page.getByRole("heading", { name: "Yuntuo Robotics", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "R&D super-deduction", exact: true }),
  ).toBeVisible();
  await page.goto("/#policies");
  await page
    .getByLabel("Enterprise context or policy question · English / 中文")
    .fill("Mars mining treaty");
  await page.getByRole("button", { name: "Find policy sources" }).click();
  await expect(
    page.getByText("Insufficient evidence", { exact: true }),
  ).toBeVisible();
  await page.goto("/#research");
  await expect(
    page.getByRole("heading", { name: "Can tax signals add information?" }),
  ).toBeVisible();
  await expect(page.getByText("0.7498", { exact: true })).toBeVisible();
  await expect(page.getByRole("img", { name: "ROC curves" })).toBeVisible();
  await page.screenshot({
    path: "docs/screenshots/research.png",
    fullPage: false,
  });
  await page.goto("/#evaluation");
  await page.getByLabel("Eligible expensed R&D").fill("10");
  await expect(page.getByText("¥1.5m", { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  for (const hash of [
    "",
    "#portfolio",
    "#company/P-001",
    "#risks/P-002",
    "#innovation/P-001",
    "#research",
    "#policies",
  ]) {
    await page.goto(`/${hash}`);
    await expect(page.locator("h1").first()).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
    ).toBe(true);
  }
  await page.goto("/#portfolio");
  await page.getByLabel("Open navigation").click();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Policy intelligence", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Policy intelligence", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
