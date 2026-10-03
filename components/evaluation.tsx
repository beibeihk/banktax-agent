"use client";
import { useState, useEffect } from "react";
import {
  BookOpen,
  Building2,
  Cpu,
  Check,
  Download,
  Calculator,
  GitBranch,
  ExternalLink,
} from "lucide-react";
import type { Dataset } from "@/lib/domain";
import { money } from "@/lib/domain";
import { Badge, SectionHead, Metric, repo } from "./ui";
function CalculatorPanel() {
  const [rd, setRd] = useState("10");
  const [rate, setRate] = useState("0.15");
  const n = Number(rd);
  const valid = rd.trim() !== "" && Number.isFinite(n) && n >= 0 && n <= 1e9;
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>
          <Calculator size={18} /> R&D deduction scenario
        </h2>
        <Badge>RMB millions</Badge>
      </div>
      <div className="panel-body calculator">
        <label>
          Eligible expensed R&D
          <input
            aria-label="Eligible expensed R&D"
            type="number"
            min="0"
            max="1000000000"
            step="0.1"
            value={rd}
            onChange={(e) => setRd(e.target.value)}
          />
        </label>
        <label>
          Illustrative CIT rate
          <select
            aria-label="Illustrative CIT rate"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          >
            <option value="0.15">15% · qualifying high-tech</option>
            <option value="0.25">25% · standard</option>
            <option value="0.05">5% · qualifying small low-profit</option>
          </select>
        </label>
        <div aria-live="polite">
          <strong>{valid ? money(n * Number(rate)) : "Invalid input"}</strong>
          <span>Illustrative extra-deduction tax effect</span>
          <p className="micro">
            Additional deduction {valid ? money(n) : "—"} · total deduction{" "}
            {valid ? money(n * 2) : "—"}
          </p>
        </div>
      </div>
      <div className="panel-note">
        Eligible expensed R&D only; sufficient taxable income assumed;
        interactions, carryforwards and timing excluded. This is not a cash
        refund. Basis:{" "}
        <a
          href="https://fgk.chinatax.gov.cn/zcfgk/c102416/c5201978/content.html"
          target="_blank"
          rel="noreferrer"
        >
          2023 No.7
        </a>
        .
      </div>
    </section>
  );
}
export function Evaluation({ d }: { d: Dataset }) {
  const [report, setReport] = useState<{
    total: number;
    passed: number;
    failed: number;
    categories: Record<string, { passed: number; total: number }>;
  } | null>(null);
  useEffect(() => {
    fetch("/data/evaluation.json")
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then(setReport)
      .catch(() => setReport(null));
  }, []);
  return (
    <>
      <SectionHead
        label="ENGINEERING THAT CAN BE INSPECTED"
        title="Evaluation & methods"
        description="Inspect rules, source records, model protocol and reproducible evaluation artifacts."
      />
      <div className="metrics four">
        <Metric
          label="Policy records"
          value={String(d.policies.length)}
          detail="Curated official sources / reports"
          icon={<BookOpen size={17} />}
        />
        <Metric
          label="Demo records"
          value="320"
          detail="80 fictional enterprises × 4 years"
          icon={<Building2 size={17} />}
        />
        <Metric
          label="Business agents"
          value="6"
          detail="Task routing + evidence orchestration"
          icon={<Cpu size={17} />}
        />
        <Metric
          label="Deterministic evals"
          value={report ? `${report.passed}/${report.total}` : "Pending"}
          detail={
            report
              ? "Actual stored execution result"
              : "Run python -m evals.run"
          }
          icon={<Check size={17} />}
        />
      </div>
      <section className="panel">
        <div className="panel-head">
          <h2>Evaluation suite</h2>
          <a className="subtle-link" href="/data/evaluation.json" download>
            <Download size={15} /> Download run
          </a>
        </div>
        <div className="eval-grid">
          {report &&
            Object.entries(report.categories).map(([name, v]) => (
              <div key={name}>
                <span>
                  <Check size={17} />
                  {name.replaceAll("_", " ")}
                </span>
                <strong>
                  {v.passed} / {v.total}
                </strong>
              </div>
            ))}
        </div>
        <div className="panel-note">
          Evaluates deterministic policy retrieval/provenance, tax arithmetic,
          rule boundaries, routing, abstention and regression. Does not measure
          live LLM accuracy or validate legal eligibility.
        </div>
      </section>
      <CalculatorPanel />
      <section className="panel">
        <div className="panel-head">
          <h2>Agent architecture</h2>
          <Badge>Focused responsibilities</Badge>
        </div>
        <div className="architecture">
          <div className="architecture-inputs">
            <div>
              <BookOpen />
              <strong>Public policy sources</strong>
              <small>Dated, curated official records</small>
            </div>
            <div>
              <Building2 />
              <strong>Synthetic enterprise panel</strong>
              <small>Coherent seeded generation</small>
            </div>
          </div>
          <div className="architecture-line" />
          <div className="architecture-agents">
            {d.meta.agents.slice(0, 5).map((a) => (
              <span key={a}>{a}</span>
            ))}
          </div>
          <div className="architecture-line" />
          <div className="architecture-orchestrator">
            <GitBranch size={20} />
            <strong>Agent Orchestrator</strong>
            <span>
              Intent routing · structured evidence · explicit abstention
            </span>
          </div>
          <div className="architecture-line" />
          <div className="architecture-output">
            <span>Relationship Manager Agent</span>
            <span>Business workspace / Research Mode</span>
          </div>
        </div>
        <div className="panel-note">
          Python engines produce versioned static demo artifacts. The local
          FastAPI service exposes the same engines and optional server-side
          OpenAI-compatible briefs.
        </div>
      </section>
      <section className="panel">
        <div className="panel-head">
          <h2>Limitations & roadmap</h2>
          <a
            href={repo}
            target="_blank"
            rel="noreferrer"
            className="subtle-link"
          >
            Full documentation <ExternalLink size={14} />
          </a>
        </div>
        <div className="two-col panel-body">
          <div>
            <h3>Current limitations</h3>
            <ul>
              <li>All enterprise and outcome records are synthetic.</li>
              <li>Policies form a fixed, human-curated snapshot.</li>
              <li>Rules and innovation weights are illustrative.</li>
              <li>Public demo makes no live LLM calls.</li>
              <li>No real-world lending, tax or causal conclusions.</li>
            </ul>
          </div>
          <div>
            <h3>Future roadmap</h3>
            <ul>
              <li>
                Versioned policy ingestion and stronger retrieval evaluations.
              </li>
              <li>Authorized enterprise data and external validation.</li>
              <li>PostgreSQL persistence and audit trail.</li>
              <li>Production access controls and monitoring.</li>
              <li>Scenario-specific calibration and prospective testing.</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
