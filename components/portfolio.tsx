"use client";
import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Download,
  ChevronRight,
  Building2,
  ShieldCheck,
  BookOpen,
  Cpu,
  Landmark,
} from "lucide-react";
import { filterEnterprises, money, pct } from "@/lib/domain";
import type { Dataset, Enterprise } from "@/lib/domain";
import {
  Badge,
  SectionHead,
  Metric,
  Cases,
  PortfolioCallout,
  Notice,
} from "./ui";

export function EnterpriseTable({
  firms,
  initialSignal = "",
}: {
  firms: Enterprise[];
  initialSignal?: string;
}) {
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("");
  const [signal, setSignal] = useState(initialSignal);
  const [page, setPage] = useState(0);
  const filtered = filterEnterprises(firms, query, industry, signal);
  const reset = () => setPage(0);
  return (
    <section className="panel enterprise-table">
      <div className="panel-head">
        <h2>
          Enterprise portfolio <span className="count">{filtered.length}</span>
        </h2>
        <a className="subtle-link" href="/data/enterprise-panel.csv" download>
          <Download size={15} /> Export panel
        </a>
      </div>
      <div className="table-toolbar">
        <label className="search">
          <Search size={17} />
          <input
            aria-label="Search enterprises"
            placeholder="Search enterprise, city or ID…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              reset();
            }}
          />
        </label>
        <label className="select-wrap">
          <SlidersHorizontal size={15} />
          <select
            aria-label="Filter by industry"
            value={industry}
            onChange={(e) => {
              setIndustry(e.target.value);
              reset();
            }}
          >
            <option value="">All industries</option>
            {Array.from(new Set(firms.map((e) => e.industry))).map((i) => (
              <option key={i}>{i}</option>
            ))}
          </select>
        </label>
        <select
          aria-label="Filter by signal"
          value={signal}
          onChange={(e) => {
            setSignal(e.target.value);
            reset();
          }}
        >
          <option value="">All signals</option>
          <option value="alerts">Tax alerts</option>
          <option value="innovation">Innovation ≥70</option>
          <option value="opportunities">Policy leads</option>
        </select>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Enterprise</th>
              <th>Revenue</th>
              <th>Growth</th>
              <th>R&D / sales</th>
              <th>Tax credit</th>
              <th>Signals</th>
              <th>Innovation</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(page * 10, page * 10 + 10).map((e) => (
              <tr key={e.enterprise_id}>
                <td>
                  <a
                    href={`#company/${e.enterprise_id}`}
                    className="company-cell"
                  >
                    <span className="mini-logo">
                      {e.name_en.slice(0, 2).toUpperCase()}
                    </span>
                    <span>
                      <strong>{e.company_name.replace("（虚构）", "")}</strong>
                      <small>
                        {e.enterprise_id} · {e.city} · {e.industry} · Fictional
                      </small>
                    </span>
                  </a>
                </td>
                <td className="numeric">{money(e.revenue)}</td>
                <td
                  className={
                    e.revenue_growth >= 0 ? "numeric positive" : "numeric"
                  }
                >
                  {e.revenue_growth >= 0 ? "+" : ""}
                  {pct(e.revenue_growth)}
                </td>
                <td className="numeric">{pct(e.rd_intensity)}</td>
                <td>
                  <Badge tone={e.tax_credit_grade === "A" ? "teal" : "neutral"}>
                    {e.tax_credit_grade}
                  </Badge>
                </td>
                <td>
                  {e.risks.length ? (
                    <a href={`#risks/${e.enterprise_id}`}>
                      <Badge tone="amber">{e.risks.length} to review</Badge>
                    </a>
                  ) : (
                    <span className="micro">No rule triggers</span>
                  )}
                </td>
                <td>
                  <div className="inline-score">
                    <span>{e.innovation.score.toFixed(0)}</span>
                    <div>
                      <i style={{ width: `${e.innovation.score}%` }} />
                    </div>
                  </div>
                </td>
                <td>
                  <a
                    aria-label={`Open ${e.name_en}`}
                    href={`#company/${e.enterprise_id}`}
                  >
                    <ChevronRight size={18} />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!filtered.length && (
        <div className="empty">
          <Search />
          <h3>No matching enterprises</h3>
          <p>Try another name or reset the filters.</p>
          <button
            className="button secondary"
            onClick={() => {
              setQuery("");
              setIndustry("");
              setSignal("");
              reset();
            }}
          >
            Reset filters
          </button>
        </div>
      )}
      <div className="pagination">
        <span>
          {filtered.length
            ? `${page * 10 + 1}–${Math.min(page * 10 + 10, filtered.length)}`
            : "0"}{" "}
          of {filtered.length} enterprises
        </span>
        <div>
          <button disabled={page === 0} onClick={() => setPage(page - 1)}>
            Previous
          </button>
          <button
            disabled={(page + 1) * 10 >= filtered.length}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
export function Dashboard({
  d,
  onlyTable = false,
}: {
  d: Dataset;
  onlyTable?: boolean;
}) {
  const firms = d.enterprises;
  const riskCount = firms.reduce((n, e) => n + e.risks.length, 0);
  const innov = firms.filter((e) => e.innovation.score >= 70).length;
  const finance = firms.filter(
    (e) => e.revenue_growth > 0.2 && e.rd_intensity > 0.08,
  ).length;
  return (
    <>
      <SectionHead
        label="RELATIONSHIP MANAGER WORKSPACE"
        title={onlyTable ? "Enterprise 360" : "Portfolio overview"}
        description={
          onlyTable
            ? "Find a company and inspect the evidence across financial, tax and innovation dimensions."
            : "A connected view of enterprise health, policy opportunities and financing conversations."
        }
        action={
          <a
            href="/data/enterprise-panel.csv"
            download
            className="button secondary"
          >
            <Download size={16} /> Download dataset
          </a>
        }
      />
      {!onlyTable && (
        <>
          <div className="metrics five">
            <Metric
              label="Customers"
              value={String(firms.length)}
              detail="Fictional enterprises · 8 industries"
              icon={<Building2 size={18} />}
              href="#companies"
            />
            <Metric
              label="Risk alerts"
              value={String(riskCount)}
              detail={`${firms.filter((e) => e.risks.length).length} enterprises need reconciliation`}
              icon={<ShieldCheck size={18} />}
              href="#signals"
            />
            <Metric
              label="Policy opportunities"
              value={String(firms.filter((e) => e.opportunities.length).length)}
              detail="Enterprises with preliminary leads"
              icon={<BookOpen size={18} />}
              href="#policies"
            />
            <Metric
              label="Innovation signals"
              value={String(innov)}
              detail="Illustrative score ≥70 / 100"
              icon={<Cpu size={18} />}
              href="#innovation"
            />
            <Metric
              label="Financing signals"
              value={String(finance)}
              detail="Growth >20% · R&D intensity >8%"
              icon={<Landmark size={18} />}
              href="#innovation"
            />
          </div>
          <div className="section-inline">
            <h2>Explore demo cases</h2>
            <span className="micro">
              Three evidence-led banking conversations
            </span>
          </div>
          <Cases d={d} />
          <PortfolioCallout />
        </>
      )}
      <EnterpriseTable firms={firms} />
    </>
  );
}
export function InnovationPortfolio({ d }: { d: Dataset }) {
  const firms = [...d.enterprises].sort(
    (a, b) => b.innovation.score - a.innovation.score,
  );
  return (
    <>
      <SectionHead
        label="TECH FINANCE AGENT"
        title="Technology finance intelligence"
        description="Bring sustained R&D and innovation evidence into enterprise financing discussions."
      />
      <Notice>
        The innovation score uses disclosed designer-defined weights. It is not
        a government classification, credit grade or validated lending model.
      </Notice>
      <div className="innovation-leaders">
        {firms.slice(0, 3).map((e, i) => (
          <a
            className="panel leader"
            key={e.enterprise_id}
            href={`#innovation/${e.enterprise_id}`}
          >
            <div className="eyebrow">
              PROFILE 0{i + 1} · {e.city}
            </div>
            <h3>{e.name_en}</h3>
            <strong>
              {e.innovation.score.toFixed(0)}
              <small>/100</small>
            </strong>
            <div>
              <span>R&D {pct(e.rd_intensity)}</span>
              <span>{e.patents} patents</span>
            </div>
            <p>{e.industry} · Fictional</p>
          </a>
        ))}
      </div>
      <EnterpriseTable firms={firms} initialSignal="innovation" />
    </>
  );
}
