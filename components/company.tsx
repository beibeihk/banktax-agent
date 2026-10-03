"use client";
import { useState } from "react";
import {
  Activity,
  Landmark,
  Cpu,
  ShieldCheck,
  Download,
  ChevronRight,
  BadgeCheck,
  Lightbulb,
  ExternalLink,
} from "lucide-react";
import { DISCLAIMER, pct, money, burden, download } from "@/lib/domain";
import type { Dataset, Enterprise } from "@/lib/domain";
import { Badge, Metric, Notice, repo } from "./ui";
import { HistoryChart } from "./charts";
import { RiskCard } from "./risks";
import { PolicyCard } from "./policies";
export function Scorecard({ e }: { e: Enterprise }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Innovation scorecard</h2>
        <Badge>Explainable / illustrative</Badge>
      </div>
      <div className="score-layout">
        <div className="score-total">
          <strong>
            {e.innovation.score.toFixed(0)}
            <span>/100</span>
          </strong>
          <div>Innovation profile</div>
          <p>
            Weights are explicit.
            <br />
            Eligibility is reviewed separately.
          </p>
        </div>
        <div className="score-components">
          {e.innovation.components.map((c) => (
            <div key={c.name}>
              <div>
                <strong>{c.name}</strong>
                <span>
                  {c.points.toFixed(1)} / {c.weight}
                </span>
              </div>
              <div className="score-track">
                <i style={{ width: `${(c.points / c.weight) * 100}%` }} />
              </div>
              <small>{c.formula}</small>
            </div>
          ))}
        </div>
      </div>
      <div className="panel-note">{e.innovation.limitation}</div>
    </section>
  );
}
export function Credit({ e }: { e: Enterprise }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Credit decision support</h2>
        <Badge>Simulated outcome</Badge>
      </div>
      <div className="credit-comparison">
        <div>
          <span>Financial only</span>
          <strong>{pct(e.credit.financial_only)}</strong>
          <small>Model A · 6 features</small>
        </div>
        <div>
          <span>Financial + tax + innovation</span>
          <strong>{pct(e.credit.augmented)}</strong>
          <small>Model B · 13 features</small>
        </div>
      </div>
      <div className="panel-body">
        <p>
          Probabilities refer to the simulated following-year label, with no
          real-world PD interpretation. Review cash flow, exposure and financing
          purpose before a lending discussion.
        </p>
        <a className="subtle-link" href="#research">
          Inspect models, calibration & assumptions <ChevronRight size={15} />
        </a>
      </div>
      <div className="panel-note">
        No lending recommendation, approval or limit is generated.
      </div>
    </section>
  );
}
export function Brief({ e }: { e: Enterprise }) {
  const [live, setLive] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const api = process.env.NEXT_PUBLIC_API_BASE_URL;
  async function generate() {
    setBusy(true);
    setError("");
    try {
      const r = await fetch(
        `${api}/api/enterprises/${e.enterprise_id}/live-brief`,
        { method: "POST" },
      );
      if (!r.ok)
        throw new Error(
          "Live AI is unavailable. The evidence brief below remains available.",
        );
      const data = await r.json();
      setLive(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Live AI is unavailable.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="panel brief">
      <div className="panel-head">
        <h2>
          <Cpu size={19} /> Relationship manager brief
        </h2>
        <Badge tone="teal">Deterministic evidence brief</Badge>
      </div>
      <div className="brief-grid">
        <div>
          <h4>What’s happening</h4>
          <p>{e.brief.whats_happening}</p>
        </div>
        <div>
          <h4>Opportunities</h4>
          <p>{e.brief.opportunities}</p>
        </div>
        <div>
          <h4>Signals to verify</h4>
          <p>{e.brief.risks}</p>
        </div>
        <div>
          <h4>Recommended next actions</h4>
          <ol>
            {e.brief.next_actions.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ol>
        </div>
      </div>
      <details className="agent-trace">
        <summary>Inspect agent orchestration & evidence trace</summary>
        <div className="trace-grid">
          {e.brief.trace.map((a, i) => (
            <div key={a.agent}>
              <span>{i + 1}</span>
              <div>
                <strong>{a.agent}</strong>
                <small>{a.tool}</small>
                <p>{a.result}</p>
              </div>
            </div>
          ))}
        </div>
      </details>
      <div className="brief-footer">
        <span className="micro">
          Public demo briefs use computed facts and no LLM calls.
        </span>
        {api ? (
          <button className="button compact" disabled={busy} onClick={generate}>
            {busy ? "Generating…" : "Generate live AI brief"}
          </button>
        ) : (
          <a href={`${repo}#live-ai-mode`} target="_blank" rel="noreferrer">
            Live AI setup <ExternalLink size={13} />
          </a>
        )}
      </div>
      {error && <Notice>{error}</Notice>}
      {live && (
        <details open>
          <summary>Live model output · human review required</summary>
          <pre className="live-output">{live}</pre>
        </details>
      )}
    </section>
  );
}
export function Company({
  d,
  e,
  view,
}: {
  d: Dataset;
  e: Enterprise;
  view: string;
}) {
  const matchedCase = d.cases.find((c) => c.enterprise_id === e.enterprise_id);
  const tabs = [
    { id: "company", label: "Overview" },
    { id: "risks", label: "Tax & signals" },
    { id: "innovation", label: "Innovation" },
    { id: "credit", label: "Credit support" },
  ];
  return (
    <>
      <div className="back-row">
        <a href="#companies">Enterprise portfolio</a>
        <ChevronRight size={14} />
        <span>{e.enterprise_id}</span>
      </div>
      <div className="company-heading">
        <div className="firm-logo large">
          {e.name_en.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div className="company-title">
            <h1>{e.name_en}</h1>
            <Badge>Fictional enterprise</Badge>
          </div>
          <p>{e.company_name}</p>
          <div className="company-meta">
            {e.city}
            <span>·</span>
            {e.industry}
            <span>·</span>FY {e.year}
            {e.high_tech_status && (
              <Badge tone="teal">
                <BadgeCheck size={12} /> Synthetic high-tech flag
              </Badge>
            )}
          </div>
        </div>
        <button
          className="button secondary"
          onClick={() =>
            download(
              `${e.enterprise_id}-evidence-report.json`,
              JSON.stringify({ disclaimer: DISCLAIMER, ...e }, null, 2),
            )
          }
        >
          <Download size={16} /> Export evidence
        </button>
      </div>
      {matchedCase && (
        <div className="case-banner">
          <Lightbulb size={19} />
          <div>
            <strong>Demo case · {matchedCase.title}</strong>
            <span>{matchedCase.question}</span>
          </div>
        </div>
      )}
      <nav className="company-tabs" aria-label="Company sections">
        {tabs.map((t) => (
          <a
            key={t.id}
            className={view === t.id ? "active" : ""}
            href={`#${t.id}/${e.enterprise_id}`}
          >
            {t.label}
          </a>
        ))}
      </nav>
      <div className="metrics four">
        <Metric
          label="Revenue"
          value={money(e.revenue)}
          detail={`Growth ${pct(e.revenue_growth)}`}
          icon={<Activity size={17} />}
        />
        <Metric
          label="Profit"
          value={money(e.profit)}
          detail={`Margin ${pct(e.profit / e.revenue)}`}
          icon={<Landmark size={17} />}
        />
        <Metric
          label="R&D intensity"
          value={pct(e.rd_intensity)}
          detail={`${money(e.rd_expense)} invested`}
          icon={<Cpu size={17} />}
        />
        <Metric
          label="Cash-tax burden"
          value={pct(burden(e))}
          detail="(VAT paid + CIT paid) / revenue"
          icon={<ShieldCheck size={17} />}
        />
      </div>
      {view === "company" && (
        <>
          <div className="two-col">
            <section className="panel">
              <div className="panel-head">
                <h2>Financial trajectory</h2>
                <span className="micro">RMB millions · 2022–2025</span>
              </div>
              <HistoryChart e={e} />
              <div className="financial-mini">
                <div>
                  <span>Assets</span>
                  <strong>{money(e.total_assets)}</strong>
                </div>
                <div>
                  <span>Leverage</span>
                  <strong>{pct(e.liabilities / e.total_assets)}</strong>
                </div>
                <div>
                  <span>Operating cash flow</span>
                  <strong>{money(e.cash_flow)}</strong>
                </div>
              </div>
            </section>
            <section className="panel tax-summary">
              <div className="panel-head">
                <h2>Tax profile</h2>
                <Badge tone="teal">Credit grade {e.tax_credit_grade}</Badge>
              </div>
              <dl className="indicator-list">
                <dt>VAT sales</dt>
                <dd>{money(e.vat_sales)}</dd>
                <dt>VAT cash payments</dt>
                <dd>{money(e.vat_paid)}</dd>
                <dt>CIT cash payments</dt>
                <dd>{money(e.cit_paid)}</dd>
                <dt>Synthetic taxable income</dt>
                <dd>{money(e.taxable_income)}</dd>
                <dt>Sales invoices</dt>
                <dd>{money(e.invoice_sales)}</dd>
                <dt>Purchase invoices</dt>
                <dd>{money(e.invoice_purchase)}</dd>
              </dl>
              <div className="panel-note">
                Book profit and taxable income differ. Amounts are in RMB
                millions.
              </div>
            </section>
          </div>
          <Brief e={e} />
          <div className="two-col">
            <Scorecard e={e} />
            <Credit e={e} />
          </div>
        </>
      )}
      {view === "risks" && (
        <>
          <Notice>{DISCLAIMER}</Notice>
          <div className="section-inline">
            <h2>
              Reconciliation signals{" "}
              <span className="count">{e.risks.length}</span>
            </h2>
            <span className="micro">Illustrative rules · R1–R6</span>
          </div>
          {e.risks.length ? (
            e.risks.map((r) => <RiskCard key={r.code} risk={r} />)
          ) : (
            <div className="panel empty">
              <ShieldCheck />
              <h3>No configured tax rule is triggered</h3>
              <p>
                This does not establish compliance. Review data completeness and
                business context.
              </p>
            </div>
          )}
        </>
      )}
      {view === "innovation" && (
        <>
          <Scorecard e={e} />
          <section className="panel">
            <div className="panel-head">
              <h2>Innovation evidence</h2>
              <Badge>All indicators simulated</Badge>
            </div>
            <div className="innovation-evidence">
              <div>
                <span>R&D growth</span>
                <strong>{pct(e.rd_growth)}</strong>
              </div>
              <div>
                <span>R&D staff ratio</span>
                <strong>{pct(e.rd_staff_ratio)}</strong>
              </div>
              <div>
                <span>Patent stock / growth</span>
                <strong>
                  {e.patents} / +{e.patent_growth}
                </strong>
              </div>
              <div>
                <span>Specialized SME flag</span>
                <strong>{e.specialized_sme ? "Yes" : "No"}</strong>
              </div>
              <div>
                <span>Government innovation flag</span>
                <strong>
                  {e.government_innovation_indicator ? "Yes" : "No"}
                </strong>
              </div>
              <div>
                <span>High-tech flag</span>
                <strong>{e.high_tech_status ? "Yes" : "No"}</strong>
              </div>
            </div>
            <div className="panel-body">
              <p>{e.innovation.interpretation}</p>
              <p className="micro">
                Patent counts do not establish IP quality or pledgeability.
                Government and qualification flags are synthetic.
              </p>
            </div>
          </section>
        </>
      )}
      {view === "credit" && (
        <>
          <Credit e={e} />
          <Brief e={e} />
        </>
      )}
      <div className="section-inline">
        <h2>
          Policy opportunities{" "}
          <span className="count">{e.opportunities.length}</span>
        </h2>
        <a className="subtle-link" href="#policies">
          Full policy library <ChevronRight size={14} />
        </a>
      </div>
      <div className="policy-grid">
        {e.opportunities.map((o) => {
          const p = d.policies.find((p) => p.id === o.policy_id);
          return p ? (
            <PolicyCard
              key={o.policy_id}
              p={p}
              evidence={o.evidence}
              status={o.status}
            />
          ) : null;
        })}
      </div>
      <Notice>
        Screening identifies candidate opportunities. Certification, eligible
        expense scope, annual averages, approved lists and current programme
        availability require evidence.
      </Notice>
    </>
  );
}
