"use client";
import {
  Download,
  Building2,
  FlaskConical,
  Activity,
  GitBranch,
} from "lucide-react";
import type { Dataset } from "@/lib/domain";
import { pct, download } from "@/lib/domain";
import { Badge, Notice, SectionHead, Metric } from "./ui";
import { ResearchCharts, ImportanceChart } from "./charts";
export function Research({ d }: { d: Dataset }) {
  const r = d.research;
  return (
    <>
      <SectionHead
        label="RESEARCH MODE · SYNTHETIC EXPERIMENT"
        title="Can tax signals add information?"
        description="Do tax and innovation signals improve credit-risk identification beyond conventional financial data?"
        action={
          <button
            className="button secondary"
            onClick={() =>
              download("model-comparison.json", JSON.stringify(r, null, 2))
            }
          >
            <Download size={16} /> Export results
          </button>
        }
      />
      <Notice>{r.limitations}</Notice>
      <div className="metrics four">
        <Metric
          label="Research enterprises"
          value={r.sample_size.toLocaleString()}
          detail="Independent from the 80-firm demo"
          icon={<Building2 size={17} />}
        />
        <Metric
          label="Held-out test set"
          value={String(r.test_n)}
          detail={`70/30 split · seed ${r.seed}`}
          icon={<FlaskConical size={17} />}
        />
        <Metric
          label="Simulated event rate"
          value={pct(r.default_rate)}
          detail="Bernoulli labels from a disclosed DGP"
          icon={<Activity size={17} />}
        />
        <Metric
          label="Paired AUC difference"
          value={`${r.auc_delta >= 0 ? "+" : ""}${r.auc_delta.toFixed(4)}`}
          detail={`95% bootstrap CI [${r.auc_delta_ci.join(", ")}]`}
          icon={<GitBranch size={17} />}
        />
      </div>
      <section className="panel">
        <div className="panel-head">
          <h2>Financial only vs. augmented model</h2>
          <Badge>Standardized logistic regression</Badge>
        </div>
        <div className="table-scroll">
          <table className="model-table">
            <thead>
              <tr>
                <th>Model · held-out results</th>
                <th>ROC-AUC ↑</th>
                <th>Precision ↑</th>
                <th>Recall ↑</th>
                <th>F1 ↑</th>
                <th>Brier ↓</th>
              </tr>
            </thead>
            <tbody>
              {r.models.map((m, i) => (
                <tr key={m.name}>
                  <td>
                    <div className="model-name">
                      <span className={`model-letter ${i ? "augmented" : ""}`}>
                        {i ? "B" : "A"}
                      </span>
                      <div>
                        <strong>{m.name.slice(4)}</strong>
                        <small>
                          {m.features.length} features · C=1 · threshold=0.5
                        </small>
                      </div>
                    </div>
                  </td>
                  {[m.roc_auc, m.precision, m.recall, m.f1, m.brier].map(
                    (v, j) => (
                      <td className="numeric" key={j}>
                        {v.toFixed(4)}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel-note">
          Higher AUC does not imply causal validity or a lending benefit.
          Metrics come from the checked-in Python pipeline.
        </div>
      </section>
      <ResearchCharts r={r} />
      <div className="two-col">
        <section className="panel">
          <div className="panel-head">
            <h2>Feature importance · Model B</h2>
            <span className="micro">Held-out permutation</span>
          </div>
          <ImportanceChart r={r} />
          <div className="panel-note">
            Mean AUC decrease across 10 shuffles. Negative values and
            correlated-feature limitations are retained. Standardized
            coefficients and variability are exported.
          </div>
        </section>
        <section className="panel">
          <div className="panel-head">
            <h2>Confusion matrices</h2>
            <span className="micro">Threshold 0.50</span>
          </div>
          <div className="confusions">
            {r.models.map((m) => (
              <div key={m.name}>
                <h3>{m.name}</h3>
                <div className="matrix-label">Predicted: no event / event</div>
                <div className="matrix">
                  {m.confusion_matrix.flat().map((n, i) => (
                    <div key={i}>
                      <small>
                        {
                          [
                            "True negative",
                            "False positive",
                            "False negative",
                            "True positive",
                          ][i]
                        }
                      </small>
                      <strong>{n}</strong>
                    </div>
                  ))}
                </div>
                <p className="micro">
                  Rows: observed [0, 1] · columns: predicted [0, 1]
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <section className="panel">
        <div className="panel-head">
          <h2>Research design & assumptions</h2>
          <Badge>Reproducible</Badge>
        </div>
        <div className="panel-body">
          <p>{r.protocol}</p>
          <h3>What generates the label?</h3>
          <p>
            A Bernoulli draw uses a logistic propensity based on leverage, cash
            flow, profitability, loan exposure, the revenue–VAT gap, tax-credit
            quality, R&D intensity and patent stock. These assumptions create a
            demonstration setting for studying incremental signals.
          </p>
          <code className="rule">
            logit(p) = −1.5 + 3(leverage−0.5) − 5 cash_flow_ratio − 3
            profit_margin + 2 loan_asset_ratio + 3 VAT_gap +
            1.3(1−tax_credit_quality) − 2 R&D_intensity − 0.1 log(1+patents)
          </code>
          <p>
            No labels, latent propensities or future outcomes enter the
            features. Portfolio enterprises are excluded from training and
            evaluation. Results are conditional on one DGP and one fixed split.
          </p>
        </div>
      </section>
      <section className="panel">
        <div className="panel-head">
          <h2>Feature descriptive statistics</h2>
          <span className="micro">Research cohort · n=1,600</span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Feature</th>
                <th>Mean</th>
                <th>SD</th>
                <th>P10</th>
                <th>Median</th>
                <th>P90</th>
              </tr>
            </thead>
            <tbody>
              {r.descriptives.map((x) => (
                <tr key={x.feature}>
                  <td>{x.feature}</td>
                  {[x.mean, x.std, x.p10, x.median, x.p90].map((v, i) => (
                    <td key={i} className="numeric">
                      {v.toFixed(4)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="panel">
        <div className="panel-head">
          <h2>Research sample distribution</h2>
          <Badge>Generated / not observed</Badge>
        </div>
        <div className="distribution">
          {r.distribution.map((x) => (
            <div key={x.industry}>
              <strong>{x.industry}</strong>
              <span>{x.count} enterprises</span>
              <div className="score-track">
                <i style={{ width: `${x.default_rate * 100}%` }} />
              </div>
              <small>Simulated event rate {pct(x.default_rate)}</small>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
