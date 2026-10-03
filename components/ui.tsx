import { Info, ChevronRight, ShieldCheck, Lightbulb } from "lucide-react";
import type { Dataset } from "@/lib/domain";
export const repo = "https://github.com/beibeihk/banktax-agent";
export function Brand() {
  return (
    <a className="brand" href="#">
      <span className="mark">
        B<span>t</span>
      </span>{" "}
      BankTax<span className="brand-sub">/ Agent</span>
    </a>
  );
}
export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="notice">
      <Info size={16} />
      <span>{children}</span>
    </div>
  );
}
export function SectionHead({
  label,
  title,
  description,
  action,
}: {
  label: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="section-head">
      <div>
        <div className="eyebrow accent">{label}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
export function Metric({
  label,
  value,
  detail,
  icon,
  href,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  href?: string;
}) {
  const inner = (
    <>
      <div className="metric-label">
        {label}
        {icon}
      </div>
      <strong>{value}</strong>
      <span>{detail}</span>
    </>
  );
  return href ? (
    <a className="metric" href={href}>
      {inner}
    </a>
  ) : (
    <div className="metric">{inner}</div>
  );
}
export function Cases({ d }: { d: Dataset }) {
  return (
    <div className="case-grid">
      {d.cases.map((c, i) => (
        <a
          href={`#company/${c.enterprise_id}`}
          className="case-card"
          key={c.id}
        >
          <div className="case-top">
            <span className="case-number">0{i + 1}</span>
            <Badge tone={i === 1 ? "amber" : "teal"}>
              {["Tech finance", "Tax signals", "Policy intelligence"][i]}
            </Badge>
          </div>
          <h3>{c.title}</h3>
          <p>{c.subtitle}</p>
          <div className="case-bottom">
            <span>
              {
                d.enterprises.find((e) => e.enterprise_id === c.enterprise_id)
                  ?.name_en
              }
            </span>
            <ChevronRight size={17} />
          </div>
        </a>
      ))}
    </div>
  );
}
export function PortfolioCallout() {
  return (
    <div className="portfolio-callout">
      <Lightbulb size={22} />
      <div>
        <strong>Innovation can change the conversation.</strong>
        <span>
          Review R&D persistence and IP alongside cash flow. A policy lead is a
          prompt for diligence.
        </span>
      </div>
      <a href="#company/P-001">
        Explore Xinglan AI <ChevronRight size={16} />
      </a>
    </div>
  );
}
export function SyntheticNotice() {
  return (
    <div className="synthetic-bar">
      <span>
        <ShieldCheck size={14} /> All company records are synthetic / fictional.
      </span>
      <span>Enterprise data: FY2025 · Policy snapshot: 03 Oct 2026</span>
    </div>
  );
}
