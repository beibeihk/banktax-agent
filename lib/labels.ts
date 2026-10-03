import type { Enterprise } from "./domain";

const labels: Record<string, string> = {
  AI: "人工智能",
  Software: "软件",
  Semiconductors: "半导体",
  Robotics: "机器人",
  "Advanced manufacturing": "先进制造",
  "Cross-border commerce": "跨境电商",
  "Traditional manufacturing": "传统制造",
  "Precision instruments": "精密仪器",
  Shenzhen: "深圳",
  Guangzhou: "广州",
  Dongguan: "东莞",
  Foshan: "佛山",
  High: "高",
  Medium: "中",
  Low: "低",
  "Tax Policy Agent": "税收政策 Agent",
  "Enterprise Profile Agent": "企业画像 Agent",
  "Tax Risk Agent": "税务风险 Agent",
  "Tech Finance Agent": "科技金融 Agent",
  "Credit Risk Agent": "信贷风险 Agent",
  "Relationship Manager Agent": "客户经理 Agent",
  leverage: "资产负债率",
  profit_margin: "利润率",
  cash_flow_ratio: "经营现金流 / 收入",
  revenue_growth: "收入增长率",
  loan_asset_ratio: "贷款余额 / 资产",
  log_revenue: "收入对数",
  vat_gap: "收入—增值税销售额差异",
  tax_burden: "现金税负",
  tax_credit_quality: "纳税信用编码",
  rd_intensity: "研发强度",
  rd_staff_ratio: "研发人员占比",
  log_patents: "专利数量对数",
  high_tech: "模拟高企标记",
  policy_qa: "政策问答",
  citation_validation: "引用核验",
  tax_calculation: "税务计算",
  risk_rules: "风险规则",
  agent_routing: "Agent 路由",
  hallucination_abstention: "无依据请求弃答",
  regression: "回归检查",
};
export const label = (value: string) => labels[value] || value;
export const companyName = (e?: Pick<Enterprise, "company_name">) =>
  e?.company_name.replace("有限公司（虚构）", "") || "";
export const companyMark = (e: Pick<Enterprise, "company_name">) =>
  companyName(e)
    .replace(/^(深圳|广州|东莞|佛山)/, "")
    .slice(0, 2);
