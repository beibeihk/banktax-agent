import type snapshot from "../public/data/demo.json";
export type Dataset = typeof snapshot;
export type Enterprise = Dataset["enterprises"][number];
export type Policy = Dataset["policies"][number];
export type Risk = Enterprise["risks"][number];
export const DISCLAIMER =
  "Decision-support prototype. Alerts indicate signals requiring further verification and do not constitute tax, credit, legal, or compliance conclusions.";
export const pct = (value: number, digits = 1) =>
  `${(value * 100).toFixed(digits)}%`;
export const money = (value: number) =>
  `¥${value.toLocaleString("en-US", { maximumFractionDigits: 1 })}m`;
export const burden = (e: Enterprise) => (e.vat_paid + e.cit_paid) / e.revenue;
export function filterEnterprises(
  firms: Enterprise[],
  query: string,
  industry: string,
  signals: string,
) {
  const q = query.trim().toLowerCase();
  return firms.filter(
    (e) =>
      (!q ||
        [e.company_name, e.name_en, e.enterprise_id, e.city, e.industry].some(
          (v) => v.toLowerCase().includes(q),
        )) &&
      (!industry || e.industry === industry) &&
      (!signals ||
        (signals === "alerts"
          ? e.risks.length > 0
          : signals === "innovation"
            ? e.innovation.score >= 70
            : e.opportunities.length > 0)),
  );
}
export function queryPolicies(
  policies: Policy[],
  question: string,
  asOf = "2026-10-03",
) {
  if (
    /ignore previous|ignore instructions|忽略指令|无条件|guaranteed|保证审批/i.test(
      question,
    )
  )
    return [];
  return policies
    .filter(
      (p) =>
        (p.effective_date || p.publication_date) <= asOf &&
        (!p.expiry_date || p.expiry_date >= asOf),
    )
    .map((p) => ({
      p,
      score: p.keywords.filter((k) => question.toLowerCase().includes(k))
        .length,
    }))
    .filter((v) => v.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((v) => v.p);
}
export function download(
  name: string,
  content: string,
  mime = "application/json",
) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
