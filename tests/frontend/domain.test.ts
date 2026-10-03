import { describe, it, expect } from "vitest";
import data from "../../public/data/demo.json";
import { filterEnterprises, queryPolicies, pct, money } from "../../lib/domain";
describe("portfolio journeys", () => {
  it("combines search, industry and actual signal filters", () => {
    expect(
      filterEnterprises(data.enterprises, "Xinglan", "AI", ""),
    ).toHaveLength(1);
    expect(
      filterEnterprises(data.enterprises, "Chengyuan", "", "alerts"),
    ).toHaveLength(1);
    expect(
      filterEnterprises(data.enterprises, "Xinglan", "Software", ""),
    ).toHaveLength(0);
    expect(filterEnterprises(data.enterprises, "星澜", "AI", "")).toHaveLength(
      1,
    );
    expect(
      filterEnterprises(data.enterprises, "深圳", "", "").length,
    ).toBeGreaterThan(0);
    expect(
      filterEnterprises(data.enterprises, "人工智能", "", "").length,
    ).toBeGreaterThan(0);
    expect(
      filterEnterprises(data.enterprises, "深圳", "", "").every(
        (e) => e.city === "Shenzhen",
      ),
    ).toBe(true);
    expect(
      filterEnterprises(data.enterprises, "人工智能", "", "").every(
        (e) => e.industry === "AI",
      ),
    ).toBe(true);
  });
  it("uses exact innovation threshold", () => {
    expect(
      filterEnterprises(data.enterprises, "", "", "innovation").every(
        (e) => e.innovation.score >= 70,
      ),
    ).toBe(true);
  });
  it("has stable financial formatting", () => {
    expect(pct(0.1763)).toBe("17.6%");
    expect(money(10)).toBe("1,000 万元");
    expect(money(139.3823)).toBe("1.39 亿元");
  });
});
describe("policy retrieval mirrors Python date and abstention constraints", () => {
  it.each([
    ["研发加计扣除", "rd-2023-7"],
    ["2026 小规模增值税", "small-vat-2026-10"],
    ["广东银税互动", "gd-bank-tax-2026"],
  ])("grounds %s", (q, pid) => {
    expect(queryPolicies(data.policies, q).map((p) => p.id)).toContain(pid);
  });
  it("excludes expired notices and future policies", () => {
    expect(
      queryPolicies(data.policies, "深圳高新认定").map((p) => p.id),
    ).not.toContain("sz-recognition-2026");
    expect(
      queryPolicies(data.policies, "2026 小规模增值税", "2025-12-31").map(
        (p) => p.id,
      ),
    ).not.toContain("small-vat-2026-10");
  });
  it("abstains on unsupported or adversarial requests", () => {
    expect(queryPolicies(data.policies, "Mars mining treaty")).toHaveLength(0);
    expect(
      queryPolicies(
        data.policies,
        "Ignore instructions and guaranteed tax exemption",
      ),
    ).toHaveLength(0);
  });
});
