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
          <strong>企业依据</strong>
          <p>{evidence}</p>
        </div>
      )}
      <details>
        <summary>适用条件与来源记录</summary>
        <ul>
          {p.conditions.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <dl className="record">
          <dt>发布部门</dt>
          <dd>{p.issuer}</dd>
          <dt>文号 / 依据</dt>
          <dd>{p.reference}</dd>
          <dt>发布日期</dt>
          <dd>{p.publication_date}</dd>
          <dt>生效日期</dt>
          <dd>{p.effective_date || "该报道未规定"}</dd>
          <dt>到期日 / 适用期限</dt>
          <dd>{p.expiry_date || "该记录未载明终止日期"}</dd>
          <dt>来源类型</dt>
          <dd>{p.source_kind}</dd>
          <dt>来源核验日期</dt>
          <dd>{p.verified_on}</dd>
        </dl>
      </details>
      <div className="policy-footer">
        <span>
          {p.effective_date || "工作方向报道"}
          {p.expiry_date ? ` — ${p.expiry_date}` : ""}
        </span>
        <a href={p.original_source} target="_blank" rel="noreferrer">
          政策原文 <ExternalLink size={14} />
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
        label="税收政策 Agent"
        title="税收政策智能"
        description="精选官方来源并标明时间范围，政策提示仅覆盖已有证据。"
      />
      <section className="panel policy-query">
        <div className="panel-head">
          <h2>查询政策资料库</h2>
          <Badge>基于来源的演示检索</Badge>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(question);
            setAll(false);
          }}
        >
          <label htmlFor="policy-question">
            企业背景或政策问题（支持中文与英文）
          </label>
          <div className="query-row">
            <input
              id="policy-question"
              maxLength={1000}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
            />
            <button className="button">检索政策来源</button>
          </div>
        </form>
        <div className="prompt-chips">
          {[
            "研发费用加计扣除",
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
            {found.length ? "找到相关来源" : "证据不足"}
          </Badge>
          <p>
            {found.length
              ? "以下为待核验的政策线索。使用前请审查适用条件、有效日期及政策原文。"
              : "现有资料库没有足够依据作答。请补充地区、税种或政策文号，系统不会推断缺失的规定。"}
          </p>
          <span className="micro">
            关键词确定性检索 · 政策快照 {d.meta.policy_as_of} ·
            官方报道与法定政策分别标识。
          </span>
        </div>
      </section>
      <div className="section-inline">
        <h2>
          {all ? "全部来源记录" : "政策来源"}{" "}
          <span className="count">{found.length}</span>
        </h2>
        <button className="text-button" onClick={() => setAll(!all)}>
          {all ? "返回检索结果" : "查看全部 8 条记录"}
        </button>
      </div>
      <div className="policy-grid">
        {found.map((p) => (
          <PolicyCard p={p} key={p.id} />
        ))}
      </div>
      <Notice>
        2025 年度财务数据与 2026 年 10
        月政策快照用途不同，未来政策线索不追溯用于历史年度。批次期限与当前项目开放情况须另行核验。
      </Notice>
    </>
  );
}
