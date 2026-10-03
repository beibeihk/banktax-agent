import { Info, ChevronRight, ShieldCheck, Lightbulb } from "lucide-react";
import { companyName } from "@/lib/labels";
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
              {["科技金融", "涉税信号", "税收政策智能"][i]}
            </Badge>
          </div>
          <h3>{c.title}</h3>
          <p>{c.subtitle}</p>
          <div className="case-bottom">
            <span>
              {companyName(
                d.enterprises.find((e) => e.enterprise_id === c.enterprise_id),
              )}
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
        <strong>创新投入为融资沟通提供更多线索。</strong>
        <span>结合现金流审查研发持续性与知识产权。政策线索应进一步核验。</span>
      </div>
      <a href="#company/P-001">
        查看星澜智能科技 <ChevronRight size={16} />
      </a>
    </div>
  );
}
export function SyntheticNotice() {
  return (
    <div className="synthetic-bar">
      <span>
        <ShieldCheck size={14} /> 所有企业记录均为合成、虚构数据。
      </span>
      <span>企业数据：2025 年度 · 政策快照：2026 年 10 月 3 日</span>
    </div>
  );
}
