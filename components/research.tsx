"use client";
import {
  Download,
  Building2,
  FlaskConical,
  Activity,
  GitBranch,
} from "lucide-react";
import type { Dataset } from "@/lib/domain";
import { label } from "@/lib/labels";
import { pct, download } from "@/lib/domain";
import { Badge, Notice, SectionHead, Metric } from "./ui";
import { ResearchCharts, ImportanceChart } from "./charts";
export function Research({ d }: { d: Dataset }) {
  const r = d.research;
  return (
    <>
      <SectionHead
        label="研究模式 · 合成数据实验"
        title="税收与创新信号能否增加识别信息？"
        description="在传统财务信息之外，税收与创新信号能否改善信贷风险识别？"
        action={
          <button
            className="button secondary"
            onClick={() =>
              download("模型比较.json", JSON.stringify(r, null, 2))
            }
          >
            <Download size={16} /> 导出模型结果
          </button>
        }
      />
      <Notice>{r.limitations}</Notice>
      <div className="metrics four">
        <Metric
          label="研究样本企业"
          value={r.sample_size.toLocaleString()}
          detail="独立于 80 家演示企业"
          icon={<Building2 size={17} />}
        />
        <Metric
          label="独立测试集"
          value={String(r.test_n)}
          detail={`训练 / 测试：70% / 30% · 种子 ${r.seed}`}
          icon={<FlaskConical size={17} />}
        />
        <Metric
          label="模拟风险事件率"
          value={pct(r.default_rate)}
          detail="按公开的数据生成机制抽取伯努利标签"
          icon={<Activity size={17} />}
        />
        <Metric
          label="配对 AUC 差值"
          value={`${r.auc_delta >= 0 ? "+" : ""}${r.auc_delta.toFixed(4)}`}
          detail={`95% 自助法置信区间 [${r.auc_delta_ci.join(", ")}]`}
          icon={<GitBranch size={17} />}
        />
      </div>
      <section className="panel">
        <div className="panel-head">
          <h2>财务模型与扩展模型比较</h2>
          <Badge>标准化逻辑回归</Badge>
        </div>
        <div className="table-scroll">
          <table className="model-table">
            <thead>
              <tr>
                <th>模型 · 测试集结果</th>
                <th>ROC-AUC ↑</th>
                <th>精确率 ↑</th>
                <th>召回率 ↑</th>
                <th>F1 ↑</th>
                <th>Brier 分数 ↓</th>
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
                          {m.features.length} 项特征 · C=1 · 阈值=0.5
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
          更高 AUC 不代表因果有效性或实际信贷收益。指标来自仓库中的 Python
          实测管线。
        </div>
      </section>
      <ResearchCharts r={r} />
      <div className="two-col">
        <section className="panel">
          <div className="panel-head">
            <h2>特征重要性 · 模型 B</h2>
            <span className="micro">测试集置换重要性</span>
          </div>
          <ImportanceChart r={r} />
          <div className="panel-note">
            重复置换 10 次计算 AUC
            平均降幅，保留负值及相关特征带来的局限。标准化系数与波动情况可导出查看。
          </div>
        </section>
        <section className="panel">
          <div className="panel-head">
            <h2>混淆矩阵</h2>
            <span className="micro">分类阈值 0.50</span>
          </div>
          <div className="confusions">
            {r.models.map((m) => (
              <div key={m.name}>
                <h3>{m.name}</h3>
                <div className="matrix-label">预测：无事件 / 有事件</div>
                <div className="matrix">
                  {m.confusion_matrix.flat().map((n, i) => (
                    <div key={i}>
                      <small>
                        {["真阴性", "假阳性", "假阴性", "真阳性"][i]}
                      </small>
                      <strong>{n}</strong>
                    </div>
                  ))}
                </div>
                <p className="micro">行：观测 [0, 1] · 列：预测 [0, 1]</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <section className="panel">
        <div className="panel-head">
          <h2>研究设计与假设</h2>
          <Badge>可复现</Badge>
        </div>
        <div className="panel-body">
          <p>{r.protocol}</p>
          <h3>风险标签如何生成？</h3>
          <p>
            基于资产负债率、现金流、利润率、贷款敞口、收入与增值税销售额差异、纳税信用、研发强度及专利数量设定逻辑概率，再抽取伯努利风险标签。该设定用于演示新增信息的识别价值。
          </p>
          <code className="rule">
            logit(p) = −1.5 + 3（资产负债率−0.5）− 5 × 现金流比例 − 3 × 利润率 +
            2 × 贷款资产比 + 3 × 增值税差异率 + 1.3（1−纳税信用编码）− 2 ×
            研发强度 − 0.1 × log（1+专利数量）
          </code>
          <p>
            标签、潜在事件概率和未来结果均不进入特征。演示客户不参与训练或评估。结果以单一数据生成机制和固定样本划分为条件。
          </p>
        </div>
      </section>
      <section className="panel">
        <div className="panel-head">
          <h2>特征描述统计</h2>
          <span className="micro">研究样本 · n=1,600</span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>特征</th>
                <th>均值</th>
                <th>标准差</th>
                <th>P10</th>
                <th>中位数</th>
                <th>P90</th>
              </tr>
            </thead>
            <tbody>
              {r.descriptives.map((x) => (
                <tr key={label(x.feature)}>
                  <td>{label(x.feature)}</td>
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
          <h2>研究样本分布</h2>
          <Badge>合成数据 / 非真实观测</Badge>
        </div>
        <div className="distribution">
          {r.distribution.map((x) => (
            <div key={label(x.industry)}>
              <strong>{label(x.industry)}</strong>
              <span>{x.count} 家企业</span>
              <div className="score-track">
                <i style={{ width: `${x.default_rate * 100}%` }} />
              </div>
              <small>模拟风险事件率 {pct(x.default_rate)}</small>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
