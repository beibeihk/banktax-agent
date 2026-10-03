"use client";
import { useState } from "react";
import { Search } from "lucide-react";
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
          <div className="eyebrow">{risk.code} · TAX RISK AGENT</div>
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
          {risk.severity}
        </Badge>
      </div>
      <div className="risk-evidence">
        <span>EVIDENCE</span>
        <p>{risk.evidence}</p>
      </div>
      <p>{risk.explanation}</p>
      <code className="rule">{risk.rule}</code>
      <div className="two-col risk-details">
        <div>
          <h4>Possible legitimate explanations</h4>
          <ul>
            {risk.legitimate_explanations.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Recommended verification</h4>
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
        label="EVIDENCE → RULE → VERIFICATION"
        title="Tax risk signals"
        description="Review accounting and tax reconciliation signals without inferring misconduct."
      />
      <Notice>{DISCLAIMER}</Notice>
      <div className="signal-toolbar">
        <label className="search">
          <Search size={17} />
          <input
            aria-label="Search risk signals"
            value={query}
            placeholder="Search company or signal…"
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <select
          aria-label="Filter severity"
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
        >
          <option value="">All severities</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
        <span className="micro">{all.length} signals</span>
      </div>
      <div className="risk-list">
        {all.map(({ e, r }) => (
          <RiskCard key={`${e.enterprise_id}/${r.code}`} risk={r} company={e} />
        ))}
      </div>
      {!all.length && (
        <div className="empty">
          No matching signals. Try another search or severity.
        </div>
      )}
    </>
  );
}
