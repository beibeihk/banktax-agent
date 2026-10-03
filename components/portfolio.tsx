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
import { label, companyName, companyMark } from "@/lib/labels";
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
          企业客户列表 <span className="count">{filtered.length}</span>
        </h2>
        <a
          className="subtle-link"
          href="/data/enterprise-panel.zh-CN.csv"
          download
        >
          <Download size={15} /> 导出中文数据
        </a>
      </div>
      <div className="table-toolbar">
        <label className="search">
          <Search size={17} />
          <input
            aria-label="搜索企业"
            placeholder="搜索企业、城市、行业或编号…"
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
            aria-label="按行业筛选"
            value={industry}
            onChange={(e) => {
              setIndustry(e.target.value);
              reset();
            }}
          >
            <option value="">全部行业</option>
            {Array.from(new Set(firms.map((e) => e.industry))).map((i) => (
              <option key={i} value={i}>
                {label(i)}
              </option>
            ))}
          </select>
        </label>
        <select
          aria-label="按信号筛选"
          value={signal}
          onChange={(e) => {
            setSignal(e.target.value);
            reset();
          }}
        >
          <option value="">全部信号</option>
          <option value="alerts">税务核验提示</option>
          <option value="innovation">创新评分 ≥70</option>
          <option value="opportunities">政策线索</option>
        </select>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>企业</th>
              <th>营业收入</th>
              <th>收入增长</th>
              <th>研发 / 收入</th>
              <th>纳税信用</th>
              <th>核验信号</th>
              <th>创新画像</th>
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
                    <span className="mini-logo">{companyMark(e)}</span>
                    <span>
                      <strong>{companyName(e)}</strong>
                      <small>
                        {e.enterprise_id} · {label(e.city)} ·{" "}
                        {label(e.industry)} · 虚构
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
                      <Badge tone="amber">{e.risks.length} 项待核验</Badge>
                    </a>
                  ) : (
                    <span className="micro">未触发规则</span>
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
                    aria-label={`查看${companyName(e)}`}
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
          <h3>没有匹配的企业</h3>
          <p>请更换搜索词或重置筛选。</p>
          <button
            className="button secondary"
            onClick={() => {
              setQuery("");
              setIndustry("");
              setSignal("");
              reset();
            }}
          >
            重置筛选
          </button>
        </div>
      )}
      <div className="pagination">
        <span>
          {filtered.length
            ? `${page * 10 + 1}–${Math.min(page * 10 + 10, filtered.length)}`
            : "0"}{" "}
          / 共 {filtered.length} 家企业
        </span>
        <div>
          <button disabled={page === 0} onClick={() => setPage(page - 1)}>
            上一页
          </button>
          <button
            disabled={(page + 1) * 10 >= filtered.length}
            onClick={() => setPage(page + 1)}
          >
            下一页
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
        label="客户经理工作台"
        title={onlyTable ? "企业全景" : "客户组合概览"}
        description={
          onlyTable
            ? "查找企业，核验其财务、税务与创新维度的证据。"
            : "综合查看企业经营状况、政策线索与融资沟通机会。"
        }
        action={
          <a
            href="/data/enterprise-panel.zh-CN.csv"
            download
            className="button secondary"
          >
            <Download size={16} /> 下载中文数据
          </a>
        }
      />
      {!onlyTable && (
        <>
          <div className="metrics five">
            <Metric
              label="企业客户"
              value={String(firms.length)}
              detail="虚构企业 · 8 个行业"
              icon={<Building2 size={18} />}
              href="#companies"
            />
            <Metric
              label="风险核验提示"
              value={String(riskCount)}
              detail={`${firms.filter((e) => e.risks.length).length} 家企业需要核验`}
              icon={<ShieldCheck size={18} />}
              href="#signals"
            />
            <Metric
              label="政策机会"
              value={String(firms.filter((e) => e.opportunities.length).length)}
              detail="存在初步政策线索的企业"
              icon={<BookOpen size={18} />}
              href="#policies"
            />
            <Metric
              label="创新信号"
              value={String(innov)}
              detail="演示评分 ≥70 / 100"
              icon={<Cpu size={18} />}
              href="#innovation"
            />
            <Metric
              label="融资沟通信号"
              value={String(finance)}
              detail="收入增长 >20% · 研发强度 >8%"
              icon={<Landmark size={18} />}
              href="#innovation"
            />
          </div>
          <div className="section-inline">
            <h2>查看演示案例</h2>
            <span className="micro">三个依据企业证据展开的业务场景</span>
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
        label="科技金融 Agent"
        title="科技金融分析"
        description="将持续研发与创新证据纳入企业融资沟通。"
      />
      <Notice>
        创新评分采用公开的设计者设定权重，不代表政府认定、信用等级或经过验证的授信模型。
      </Notice>
      <div className="innovation-leaders">
        {firms.slice(0, 3).map((e, i) => (
          <a
            className="panel leader"
            key={e.enterprise_id}
            href={`#innovation/${e.enterprise_id}`}
          >
            <div className="eyebrow">
              企业 0{i + 1} · {label(e.city)}
            </div>
            <h3>{companyName(e)}</h3>
            <strong>
              {e.innovation.score.toFixed(0)}
              <small>/100</small>
            </strong>
            <div>
              <span>研发强度 {pct(e.rd_intensity)}</span>
              <span>{e.patents} 项专利</span>
            </div>
            <p>{label(e.industry)} · 虚构</p>
          </a>
        ))}
      </div>
      <EnterpriseTable firms={firms} initialSignal="innovation" />
    </>
  );
}
