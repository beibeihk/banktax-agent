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
import { label, companyName, companyMark } from "@/lib/labels";
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
        <h2>创新评分卡</h2>
        <Badge>可解释 / 演示评分</Badge>
      </div>
      <div className="score-layout">
        <div className="score-total">
          <strong>
            {e.innovation.score.toFixed(0)}
            <span>/100</span>
          </strong>
          <div>创新画像</div>
          <p>
            权重公开。
            <br />
            政策资格另行核验。
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
        <h2>信贷决策支持</h2>
        <Badge>模拟结果</Badge>
      </div>
      <div className="credit-comparison">
        <div>
          <span>仅财务信息</span>
          <strong>{pct(e.credit.financial_only)}</strong>
          <small>模型 A · 6 项特征</small>
        </div>
        <div>
          <span>财务 + 税务 + 创新信息</span>
          <strong>{pct(e.credit.augmented)}</strong>
          <small>模型 B · 13 项特征</small>
        </div>
      </div>
      <div className="panel-body">
        <p>
          概率对应模拟的下一年度风险事件，不能解释为真实违约概率。融资沟通前须审查现金流、敞口与资金用途。
        </p>
        <a className="subtle-link" href="#research">
          查看模型、校准与假设 <ChevronRight size={15} />
        </a>
      </div>
      <div className="panel-note">系统不生成贷款建议、审批结论或授信额度。</div>
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
      if (!r.ok) throw new Error("实时 AI 暂不可用，下方证据简报仍可查看。");
      const data = await r.json();
      setLive(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : "实时 AI 暂不可用。");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="panel brief">
      <div className="panel-head">
        <h2>
          <Cpu size={19} /> 客户经理证据简报
        </h2>
        <Badge tone="teal">基于已计算证据</Badge>
      </div>
      <div className="brief-grid">
        <div>
          <h4>经营概况</h4>
          <p>{e.brief.whats_happening}</p>
        </div>
        <div>
          <h4>业务机会</h4>
          <p>{e.brief.opportunities}</p>
        </div>
        <div>
          <h4>待核验信号</h4>
          <p>{e.brief.risks}</p>
        </div>
        <div>
          <h4>建议下一步行动</h4>
          <ol>
            {e.brief.next_actions.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ol>
        </div>
      </div>
      <details className="agent-trace">
        <summary>查看智能体编排与证据轨迹</summary>
        <div className="trace-grid">
          {e.brief.trace.map((a, i) => (
            <div key={label(a.agent)}>
              <span>{i + 1}</span>
              <div>
                <strong>{label(a.agent)}</strong>
                <small>{label(a.tool)}</small>
                <p>{a.result}</p>
              </div>
            </div>
          ))}
        </div>
      </details>
      <div className="brief-footer">
        <span className="micro">
          公开演示简报使用已计算事实，不调用大语言模型。
        </span>
        {api ? (
          <button className="button compact" disabled={busy} onClick={generate}>
            {busy ? "正在生成…" : "生成实时 AI 简报"}
          </button>
        ) : (
          <a href={`${repo}#live-ai-mode`} target="_blank" rel="noreferrer">
            实时 AI 配置说明 <ExternalLink size={13} />
          </a>
        )}
      </div>
      {error && <Notice>{error}</Notice>}
      {live && (
        <details open>
          <summary>实时模型输出 · 须经人工审查</summary>
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
    { id: "company", label: "概览" },
    { id: "risks", label: "税务与核验" },
    { id: "innovation", label: "创新画像" },
    { id: "credit", label: "信贷支持" },
  ];
  return (
    <>
      <div className="back-row">
        <a href="#companies">企业客户列表</a>
        <ChevronRight size={14} />
        <span>{e.enterprise_id}</span>
      </div>
      <div className="company-heading">
        <div className="firm-logo large">{companyMark(e)}</div>
        <div>
          <div className="company-title">
            <h1>{companyName(e)}</h1>
            <Badge>虚构企业</Badge>
          </div>
          <p>{e.company_name}</p>
          <div className="company-meta">
            {label(e.city)}
            <span>·</span>
            {label(e.industry)}
            <span>·</span>
            {e.year} 年度
            {e.high_tech_status && (
              <Badge tone="teal">
                <BadgeCheck size={12} /> 模拟高企标记
              </Badge>
            )}
          </div>
        </div>
        <button
          className="button secondary"
          onClick={() =>
            download(
              `${e.enterprise_id}-企业证据.json`,
              JSON.stringify({ disclaimer: DISCLAIMER, ...e }, null, 2),
            )
          }
        >
          <Download size={16} /> 导出企业证据
        </button>
      </div>
      {matchedCase && (
        <div className="case-banner">
          <Lightbulb size={19} />
          <div>
            <strong>演示案例 · {matchedCase.title}</strong>
            <span>{matchedCase.question}</span>
          </div>
        </div>
      )}
      <nav className="company-tabs" aria-label="企业分析栏目">
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
          label="营业收入"
          value={money(e.revenue)}
          detail={`同比增长 ${pct(e.revenue_growth)}`}
          icon={<Activity size={17} />}
        />
        <Metric
          label="利润"
          value={money(e.profit)}
          detail={`利润率 ${pct(e.profit / e.revenue)}`}
          icon={<Landmark size={17} />}
        />
        <Metric
          label="研发强度"
          value={pct(e.rd_intensity)}
          detail={`${money(e.rd_expense)} 研发投入`}
          icon={<Cpu size={17} />}
        />
        <Metric
          label="现金税负"
          value={pct(burden(e))}
          detail="（实缴增值税 + 实缴企业所得税）/ 收入"
          icon={<ShieldCheck size={17} />}
        />
      </div>
      {view === "company" && (
        <>
          <div className="two-col">
            <section className="panel">
              <div className="panel-head">
                <h2>财务变化趋势</h2>
                <span className="micro">金额：百万元 · 2022–2025 年</span>
              </div>
              <HistoryChart e={e} />
              <div className="financial-mini">
                <div>
                  <span>资产总额</span>
                  <strong>{money(e.total_assets)}</strong>
                </div>
                <div>
                  <span>资产负债率</span>
                  <strong>{pct(e.liabilities / e.total_assets)}</strong>
                </div>
                <div>
                  <span>经营现金流</span>
                  <strong>{money(e.cash_flow)}</strong>
                </div>
              </div>
            </section>
            <section className="panel tax-summary">
              <div className="panel-head">
                <h2>税务画像</h2>
                <Badge tone="teal">纳税信用 {e.tax_credit_grade} 级</Badge>
              </div>
              <dl className="indicator-list">
                <dt>增值税申报销售额</dt>
                <dd>{money(e.vat_sales)}</dd>
                <dt>实缴增值税</dt>
                <dd>{money(e.vat_paid)}</dd>
                <dt>实缴企业所得税</dt>
                <dd>{money(e.cit_paid)}</dd>
                <dt>模拟应纳税所得额</dt>
                <dd>{money(e.taxable_income)}</dd>
                <dt>销项开票金额</dt>
                <dd>{money(e.invoice_sales)}</dd>
                <dt>购进开票金额</dt>
                <dd>{money(e.invoice_purchase)}</dd>
              </dl>
              <div className="panel-note">
                会计利润与应纳税所得额口径不同。金额按万元或亿元显示，底层数据单位为百万元。
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
              勾稽核验信号 <span className="count">{e.risks.length}</span>
            </h2>
            <span className="micro">演示规则 · R1–R6</span>
          </div>
          {e.risks.length ? (
            e.risks.map((r) => <RiskCard key={r.code} risk={r} />)
          ) : (
            <div className="panel empty">
              <ShieldCheck />
              <h3>未触发已配置的涉税规则</h3>
              <p>这并不能证明合规，仍须审查数据完整性与业务背景。</p>
            </div>
          )}
        </>
      )}
      {view === "innovation" && (
        <>
          <Scorecard e={e} />
          <section className="panel">
            <div className="panel-head">
              <h2>创新依据</h2>
              <Badge>全部指标均为模拟</Badge>
            </div>
            <div className="innovation-evidence">
              <div>
                <span>研发支出增长率</span>
                <strong>{pct(e.rd_growth)}</strong>
              </div>
              <div>
                <span>研发人员占比</span>
                <strong>{pct(e.rd_staff_ratio)}</strong>
              </div>
              <div>
                <span>专利存量 / 新增</span>
                <strong>
                  {e.patents} / +{e.patent_growth}
                </strong>
              </div>
              <div>
                <span>专精特新企业标记</span>
                <strong>{e.specialized_sme ? "是" : "否"}</strong>
              </div>
              <div>
                <span>政府创新指标标记</span>
                <strong>
                  {e.government_innovation_indicator ? "是" : "否"}
                </strong>
              </div>
              <div>
                <span>高新技术企业标记</span>
                <strong>{e.high_tech_status ? "是" : "否"}</strong>
              </div>
            </div>
            <div className="panel-body">
              <p>{e.innovation.interpretation}</p>
              <p className="micro">
                专利数量不能证明知识产权质量或可质押性，政府与资格标记均为模拟。
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
          政策机会 <span className="count">{e.opportunities.length}</span>
        </h2>
        <a className="subtle-link" href="#policies">
          完整政策资料库 <ChevronRight size={14} />
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
        筛选仅识别候选机会。资质认定、合格费用范围、年度平均指标、批准名单及当前项目可用性均须提供证据。
      </Notice>
    </>
  );
}
