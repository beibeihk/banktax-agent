"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import { label } from "@/lib/labels";
import { DISCLAIMER } from "@/lib/domain";
import type { Dataset, Enterprise, Risk } from "@/lib/domain";
import { Badge, SectionHead, Notice } from "./ui";
export function RiskCard({
  risk,
  company,
}: {
  risk: Risk;
  company?: Enterprise;
}) {
  return (
    <article className="risk-card">
      <div className="risk-title">
        <div>
          <div className="eyebrow">{risk.code} · 税务风险 Agent</div>
          <h3>{risk.name}</h3>
          {company && (
            <a
              className="subtle-link"
              href={`#company/${company.enterprise_id}`}
            >
              {company.company_name}
            </a>
          )}
        </div>
        <Badge
          tone={
            risk.severity === "High"
              ? "red"
              : risk.severity === "Medium"
                ? "amber"
                : "neutral"
          }
        >
          {label(risk.severity)}
        </Badge>
      </div>
      <div className="risk-evidence">
        <span>触发依据</span>
        <p>{risk.evidence}</p>
      </div>
      <p>{risk.explanation}</p>
      <code className="rule">{risk.rule}</code>
      <div className="two-col risk-details">
        <div>
          <h4>可能的合理成因</h4>
          <ul>
            {risk.legitimate_explanations.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4>建议核验步骤</h4>
          <ul>
            {risk.verification.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
export function AllSignals({ d }: { d: Dataset }) {
  const [severity, setSeverity] = useState("");
  const [query, setQuery] = useState("");
  const all = d.enterprises
    .flatMap((e) => e.risks.map((r) => ({ e, r })))
    .filter(
      ({ e, r }) =>
        (!severity || r.severity === severity) &&
        (!query ||
          `${e.company_name} ${e.name_en} ${r.name}`
            .toLowerCase()
            .includes(query.toLowerCase())),
    );
  return (
    <>
      <SectionHead
        label="依据 → 规则 → 核验"
        title="税务风险信号"
        description="审查会计与税务勾稽异常，不据此认定违法或违规。"
      />
      <Notice>{DISCLAIMER}</Notice>
      <div className="signal-toolbar">
        <label className="search">
          <Search size={17} />
          <input
            aria-label="搜索风险信号"
            value={query}
            placeholder="搜索企业或风险信号…"
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <select
          aria-label="按提示等级筛选"
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
        >
          <option value="">全部等级</option>
          <option value="High">高</option>
          <option value="Medium">中</option>
          <option value="Low">低</option>
        </select>
        <span className="micro">{all.length} 条信号</span>
      </div>
      <div className="risk-list">
        {all.map(({ e, r }) => (
          <RiskCard key={`${e.enterprise_id}/${r.code}`} risk={r} company={e} />
        ))}
      </div>
      {!all.length && (
        <div className="empty">没有匹配的信号，请更换搜索词或提示等级。</div>
      )}
    </>
  );
}
