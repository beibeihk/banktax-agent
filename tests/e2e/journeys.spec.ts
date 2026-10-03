import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
test("recruiter journeys, real screenshots and mobile layout", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  mkdirSync("docs/screenshots", { recursive: true });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.getByText("40.4%", { exact: true })).toBeVisible();
  await page.screenshot({
    path: "docs/screenshots/landing.png",
    fullPage: false,
  });
  await page
    .getByRole("link", { name: "进入演示", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "客户组合概览", exact: true }),
  ).toBeVisible();
  const csv = await page.request.get("/data/enterprise-panel.zh-CN.csv");
  expect(csv.ok()).toBe(true);
  expect(await csv.text()).toContain("营业收入（百万元）");
  await page.getByLabel("搜索企业").fill("星澜");
  await expect(
    page.getByRole("link", { name: /深圳星澜智能科技/ }).first(),
  ).toBeVisible();
  await page.getByLabel("搜索企业").fill("");
  await page.screenshot({
    path: "docs/screenshots/dashboard.png",
    fullPage: false,
  });
  await page.getByLabel("搜索企业").fill("no-such-firm");
  await expect(page.getByText("没有匹配的企业")).toBeVisible();
  await page.getByRole("button", { name: "重置筛选" }).click();
  await page.getByRole("link", { name: /01 科技金融 高成长 AI 企业/ }).click();
  await expect(
    page.getByRole("heading", { name: "深圳星澜智能科技", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "客户经理证据简报" }),
  ).toBeVisible();
  await expect(page.getByText(/营业收入同比增长 40.4%/)).toBeVisible();
  await page.screenshot({
    path: "docs/screenshots/company-360.png",
    fullPage: false,
  });
  await page.getByRole("link", { name: "创新画像", exact: true }).click();
  await expect(page.getByRole("heading", { name: "创新评分卡" })).toBeVisible();
  await page.screenshot({
    path: "docs/screenshots/innovation.png",
    fullPage: false,
  });
  await page.goto("/#risks/P-002");
  await expect(
    page.getByRole("heading", {
      name: "收入—增值税销售额勾稽",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("收入确认时点差异", { exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "docs/screenshots/risk-analysis.png",
    fullPage: false,
  });
  await page.goto("/#company/P-003");
  await expect(
    page.getByRole("heading", { name: "深圳云拓机器人", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "研发费用加计扣除", exact: true }),
  ).toBeVisible();
  await page.goto("/#policies");
  await page
    .getByLabel("企业背景或政策问题（支持中文与英文）")
    .fill("Mars mining treaty");
  await page.getByRole("button", { name: "检索政策来源" }).click();
  await expect(page.getByText("证据不足", { exact: true })).toBeVisible();
  await page.goto("/#research");
  await expect(
    page.getByRole("heading", { name: "税收与创新信号能否增加识别信息？" }),
  ).toBeVisible();
  await expect(page.getByText("0.7498", { exact: true })).toBeVisible();
  await expect(page.getByRole("img", { name: "ROC 曲线" })).toBeVisible();
  await page.screenshot({
    path: "docs/screenshots/research.png",
    fullPage: false,
  });
  await page.goto("/#evaluation");
  await page.getByLabel("合格费用化研发支出").fill("10");
  await expect(page.getByText("150 万元", { exact: true })).toBeVisible();
  await page.goto("/404.html");
  await expect(page.getByRole("heading", { name: "未找到页面" })).toBeVisible();
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
  await page.getByLabel("打开导航").click();
  await expect(page.getByRole("navigation", { name: "主导航" })).toBeVisible();
  await page.getByRole("link", { name: "税收政策智能", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "税收政策智能", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
