"use client";
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { queryPolicies } from "@/lib/domain";
import type { Dataset, Policy } from "@/lib/domain";
import { Badge, Notice, SectionHead } from "./ui";
export function PolicyCard({
  p,
  evidence,
  status,
}: {
  p: Policy;
  evidence?: string;
  status?: string;
}) {
  return (
    <article className="policy-card">
      <div className="policy-top">
        <Badge tone="teal">{p.jurisdiction}</Badge>
        <span className="micro">{p.policy_type}</span>
        {status && <Badge tone="amber">{status}</Badge>}
      </div>
      <h3>{p.short_title}</h3>
      <p className="policy-cn">{p.policy_title}</p>
      <p>{p.benefits}</p>
      {evidence && (
        <div className="evidence-inline">
          <strong>Enterprise evidence</strong>
          <p>{evidence}</p>
        </div>
      )}
      <details>
        <summary>Conditions & source record</summary>
        <ul>
          {p.conditions.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <dl className="record">
          <dt>Issuer</dt>
          <dd>{p.issuer}</dd>
          <dt>Reference</dt>
          <dd>{p.reference}</dd>
          <dt>Published</dt>
          <dd>{p.publication_date}</dd>
          <dt>Effective</dt>
          <dd>{p.effective_date || "Not specified in this report"}</dd>
          <dt>Expiry / horizon</dt>
          <dd>{p.expiry_date || "No end date stated in this record"}</dd>
          <dt>Source type</dt>
          <dd>{p.source_kind}</dd>
          <dt>Source checked</dt>
          <dd>{p.verified_on}</dd>
        </dl>
      </details>
      <div className="policy-footer">
        <span>
          {p.effective_date || "Directional report"}
          {p.expiry_date ? ` — ${p.expiry_date}` : ""}
        </span>
        <a href={p.original_source} target="_blank" rel="noreferrer">
          Original source <ExternalLink size={14} />
        </a>
      </div>
    </article>
  );
}
export function PolicyPage({ d }: { d: Dataset }) {
  const [question, setQuestion] = useState(
    "深圳一家研发密集型科技企业可能有哪些税收政策值得关注？",
  );
  const [submitted, setSubmitted] = useState(question);
  const [all, setAll] = useState(false);
  const found = all ? d.policies : queryPolicies(d.policies, submitted);
  return (
    <>
      <SectionHead
        label="TAX POLICY AGENT"
        title="Policy intelligence"
        description="A deliberately small, dated library of official sources. Conclusions stay inside the evidence."
      />
      <section className="panel policy-query">
        <div className="panel-head">
          <h2>Ask the curated policy library</h2>
          <Badge>Grounded demo retrieval</Badge>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(question);
            setAll(false);
          }}
        >
          <label htmlFor="policy-question">
            Enterprise context or policy question · English / 中文
          </label>
          <div className="query-row">
            <input
              id="policy-question"
              maxLength={1000}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
            />
            <button className="button">Find policy sources</button>
          </div>
        </form>
        <div className="prompt-chips">
          {[
            "R&D super-deduction",
            "小型微利企业所得税优惠",
            "2026 小规模增值税",
            "广东银税互动",
          ].map((q) => (
            <button
              key={q}
              onClick={() => {
                setQuestion(q);
                setSubmitted(q);
                setAll(false);
              }}
            >
              {q}
            </button>
          ))}
        </div>
        <div className="policy-response">
          <Badge tone={found.length ? "teal" : "amber"}>
            {found.length
              ? "Supported source matches"
              : "Insufficient evidence"}
          </Badge>
          <p>
            {found.length
              ? "Potential policies to verify. Review applicability, effective dates and original sources before use."
              : "The curated library has no supported answer. Provide a jurisdiction, tax type or policy reference. No rule is inferred."}
          </p>
          <span className="micro">
            Deterministic keyword retrieval · Policy snapshot{" "}
            {d.meta.policy_as_of} · Reports are distinguished from statutory
            policies.
          </span>
        </div>
      </section>
      <div className="section-inline">
        <h2>
          {all ? "Full source library" : "Policy sources"}{" "}
          <span className="count">{found.length}</span>
        </h2>
        <button className="text-button" onClick={() => setAll(!all)}>
          {all ? "Return to answer" : "Browse all 8 records"}
        </button>
      </div>
      <div className="policy-grid">
        {found.map((p) => (
          <PolicyCard p={p} key={p.id} />
        ))}
      </div>
      <Notice>
        FY2025 financial records and the October 2026 policy snapshot serve
        different purposes. Future leads are not applied retrospectively. Batch
        deadlines and current programme availability require review.
      </Notice>
    </>
  );
}
