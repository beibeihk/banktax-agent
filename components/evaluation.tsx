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
import { label } from "@/lib/labels";
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
          <Calculator size={18} /> 研发加计扣除情景测算
        </h2>
        <Badge>金额单位：百万元</Badge>
      </div>
      <div className="panel-body calculator">
        <label>
          合格费用化研发支出
          <input
            aria-label="合格费用化研发支出"
            type="number"
            min="0"
            max="1000000000"
            step="0.1"
            value={rd}
            onChange={(e) => setRd(e.target.value)}
          />
        </label>
        <label>
          假设企业所得税税率
          <select
            aria-label="假设企业所得税税率"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          >
            <option value="0.15">15% · 符合条件的高企</option>
            <option value="0.25">25% · 一般税率</option>
            <option value="0.05">5% · 符合条件的小型微利企业</option>
          </select>
        </label>
        <div aria-live="polite">
          <strong>{valid ? money(n * Number(rate)) : "输入无效"}</strong>
          <span>加计扣除的示例税额影响</span>
          <p className="micro">
            加计扣除额 {valid ? money(n) : "—"} · 总扣除额{" "}
            {valid ? money(n * 2) : "—"}
          </p>
        </div>
      </div>
      <div className="panel-note">
        仅测算合格费用化研发支出，假设应纳税所得额充足，未考虑优惠叠加、结转及时间差异；不代表现金退税。依据：{" "}
        <a
          href="https://fgk.chinatax.gov.cn/zcfgk/c102416/c5201978/content.html"
          target="_blank"
          rel="noreferrer"
        >
          2023 年第 7 号公告
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
        label="可审查的工程与方法"
        title="评估与方法"
        description="查看规则、来源记录、模型方案与可复现评估产物。"
      />
      <div className="metrics four">
        <Metric
          label="政策来源记录"
          value={String(d.policies.length)}
          detail="精选官方政策与报道"
          icon={<BookOpen size={17} />}
        />
        <Metric
          label="演示数据记录"
          value="320"
          detail="80 家虚构企业 × 4 年"
          icon={<Building2 size={17} />}
        />
        <Metric
          label="业务智能体"
          value="6"
          detail="任务路由 + 证据编排"
          icon={<Cpu size={17} />}
        />
        <Metric
          label="确定性评估"
          value={report ? `${report.passed}/${report.total}` : "等待评估"}
          detail={report ? "实际运行后保存的结果" : "运行 python -m evals.run"}
          icon={<Check size={17} />}
        />
      </div>
      <section className="panel">
        <div className="panel-head">
          <h2>评估项目</h2>
          <a className="subtle-link" href="/data/evaluation.json" download>
            <Download size={15} /> 下载评估结果
          </a>
        </div>
        <div className="eval-grid">
          {report &&
            Object.entries(report.categories).map(([name, v]) => (
              <div key={name}>
                <span>
                  <Check size={17} />
                  {label(name)}
                </span>
                <strong>
                  {v.passed} / {v.total}
                </strong>
              </div>
            ))}
        </div>
        <div className="panel-note">
          评估确定性政策检索与溯源、税额运算、规则边界、路由、弃答与回归检查，不衡量实时大模型准确率，也不验证法定资格。
        </div>
      </section>
      <CalculatorPanel />
      <section className="panel">
        <div className="panel-head">
          <h2>智能体架构</h2>
          <Badge>职责明确</Badge>
        </div>
        <div className="architecture">
          <div className="architecture-inputs">
            <div>
              <BookOpen />
              <strong>公开政策来源</strong>
              <small>标明日期的精选官方记录</small>
            </div>
            <div>
              <Building2 />
              <strong>合成企业面板</strong>
              <small>固定种子、一致生成</small>
            </div>
          </div>
          <div className="architecture-line" />
          <div className="architecture-agents">
            {d.meta.agents.slice(0, 5).map((a) => (
              <span key={a}>{label(a)}</span>
            ))}
          </div>
          <div className="architecture-line" />
          <div className="architecture-orchestrator">
            <GitBranch size={20} />
            <strong>智能体编排器</strong>
            <span>意图路由 · 结构化证据 · 明确弃答</span>
          </div>
          <div className="architecture-line" />
          <div className="architecture-output">
            <span>客户经理 Agent</span>
            <span>业务工作台 / 研究模式</span>
          </div>
        </div>
        <div className="panel-note">
          Python 引擎生成可追踪版本的静态演示产物。本地 FastAPI
          服务提供同一套引擎，并支持可选的服务端 OpenAI 兼容接口简报。
        </div>
      </section>
      <section className="panel">
        <div className="panel-head">
          <h2>局限与后续计划</h2>
          <a
            href={repo}
            target="_blank"
            rel="noreferrer"
            className="subtle-link"
          >
            完整文档 <ExternalLink size={14} />
          </a>
        </div>
        <div className="two-col panel-body">
          <div>
            <h3>当前局限</h3>
            <ul>
              <li>所有企业记录和风险结果均为合成数据。</li>
              <li>政策资料为固定、人工整理的快照。</li>
              <li>规则与创新权重用于演示。</li>
              <li>公开演示不调用实时大语言模型。</li>
              <li>不作真实信贷、税务或因果结论。</li>
            </ul>
          </div>
          <div>
            <h3>后续计划</h3>
            <ul>
              <li>增加政策版本管理与更严格的检索评估。</li>
              <li>接入授权企业数据并开展外部验证。</li>
              <li>增加 PostgreSQL 持久化与审计轨迹。</li>
              <li>完善生产环境访问控制与监测。</li>
              <li>开展具体业务场景的校准与前瞻测试。</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
