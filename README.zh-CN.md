# BankTax-Agent

**面向商业银行对公业务的企业涉税智能、科技金融识别与风险决策支持系统。**

[打开公网 Demo](https://banktax-agent.hklcrgpt.chatgpt.site) · [完整英文 README](README.md) · [面试演示脚本](docs/demo-script.md)

![客户经理工作台实机截图](docs/screenshots/dashboard.png)

这是黄坤（Kun Huang）的独立科研与工程作品，结合 **财政税收 × 企业财务 × 银行业务 × AI Agents**。与任何银行无隶属、合作或官方背书关系。全部企业名称、数据、资质标记及研究标签均为虚构，不包含银行内部数据或真实客户资料。

## 可以直接演示什么

- 客户经理工作台：组合概览、企业搜索、行业/信号筛选、数据导出和三个业务案例。
- Company 360：企业四年财务轨迹、税务画像、创新指标、政策线索、模型输出和证据简报。
- 税务风险规则：收入与 VAT 销售、研发投入、所得税税基与缴款、发票、增长背离、自身历史及模拟同行税负检查；显示规则、证据、正常原因和核验步骤。
- 科技金融：六项创新评分卡，明确公式与权重；不会把分数当成真实资质或审批结果。
- 政策 Agent：8 条官方政策/指引/通知/方向性报告；显示条件、时间和原始来源，信息不足时明确弃答。
- Research Mode：独立 1,600 家合成研究企业，财务基线与涉税/创新扩展模型，ROC、校准、混淆矩阵、特征重要性、描述统计及抽样区间。
- Evaluation：45 项实际执行的规则/政策/计算/引用/路由/弃答/回归检查。

## 三个案例

1. **深圳星澜智能科技有限公司（虚构）**：研发密集、高成长、当前利润率较低，展示传统财务指标与持续创新投入如何共同进入业务讨论。
2. **东莞澄远工业装备有限公司（虚构）**：财报收入与 VAT 销售额存在 36% 差异，展示证据、正常解释和核验链条，不指控违法。
3. **深圳云拓机器人有限公司（虚构）**：匹配研发与科技企业相关政策线索，同时区分会计研发、税法合格研发、高企资格及先进制造业名单。

## 研究结果与边界

固定 70/30 企业层面分割，训练 1,120 家、测试 480 家；标准化仅在训练集拟合，两模型使用完全相同的测试企业。Demo 的 80 家企业不参与训练或测试。固定随机种子、C=1、分类阈值 0.5，无测试集调参。

| 实际运行指标 | 财务模型 A | 财务 + 涉税 + 创新模型 B |
|---|---:|---:|
| ROC-AUC | 0.6714 | 0.7498 |
| Brier Score | 0.1364 | 0.1209 |

完整 Precision、Recall、F1、校准及重要性见网页与生成文件。**标签生成假设包含涉税与创新变量，表现差异只能说明该模拟设定下的方法，不构成真实企业、银行或因果关系的实证证据。** [研究协议](docs/research-method.md)公开了完整生成方程和局限。

## 本地运行

Node.js 24、Python 3.11；公网 Demo 和本地前端均无需 API Key。

```powershell
npm ci
npm run dev
# http://127.0.0.1:3000
```

若需重新生成数据、运行后端及研究评测：

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.lock.txt
python -m backend.pipeline
python -m evals.run
uvicorn backend.api:app --host 127.0.0.1 --port 8000
```

测试与构建：

```powershell
python -m pytest
ruff check backend tests evals
python -m evals.run
npm run check
# 已启动前端或静态服务器时：
npm run test:e2e
```

Docker：`docker compose up --build`，打开 `http://localhost:8080`。创建时本机没有 Docker，容器构建和启动由 Linux CI 验证。

## 部署与 Live AI

公网采用 Next.js 静态导出，浏览器读取 Python 实际生成的版本化 JSON/CSV，因此不依赖 Python 服务器或模型 API。六类 Agent 的业务计算和简报在 Demo 中是可解释的确定性结果，不冒充实时大模型输出。

本地/Docker 可通过 `.env` 配置 `ENABLE_LIVE_AI`、`OPENAI_API_KEY`、`OPENAI_BASE_URL`、`OPENAI_MODEL`，由服务器统一调用兼容接口。前端只配置公开 API 地址；任何 Key 都不得使用 `NEXT_PUBLIC_*`。模型返回值经过结构与证据 ID 检查，但语义仍需人工审查。该版本未进行付费模型实测。

## 政策时间与未来工作

企业财务数据是 FY2022–2025，政策快照核验日是 **2026-10-03**。小规模 VAT 使用 2026 年第 10 号公告。深圳高企认定通知最后公开批次在 2026-09-04 结束，作为历史资料保留，不再匹配为当前申请机会。方向性科技金融/银税合作报告不等于法定优惠或贷款资格。

未来工作包括版本化政策采集、语义检索、授权真实企业数据、外部/时间维度模型验证、PostgreSQL 审计存储以及生产权限和成本控制；这些尚未实现。

**系统只提供异常信号与进一步核验建议，不形成税务、信贷、法律或合规结论，不用于真实信贷审批。** 代码和合成数据采用 [MIT License](LICENSE)。更多安全边界见 [SECURITY.md](SECURITY.md)。
