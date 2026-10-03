"""Run: python -m backend.pipeline. Writes reproducible, auditable artifacts."""

import csv
import hashlib
import json
from pathlib import Path

from backend.agents import AGENTS, enrich
from backend.policy import AS_OF, POLICIES
from backend.research import fit_experiment
from backend.synthetic import SEED, generate

ROOT = Path(__file__).resolve().parents[1]


def write_json(path: Path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_csv(path, rows):
    fields = [k for k, v in rows[0].items() if not isinstance(v, (list, dict))]
    with path.open("w", encoding="utf-8-sig", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def chinese_panel(rows):
    """面向业务读者的中文副本；数值单位与原始复现数据保持一致。"""
    headers = {
        "enterprise_id": "企业编号",
        "company_name": "企业名称",
        "industry": "行业",
        "city": "城市",
        "year": "年度",
        "revenue": "营业收入（百万元）",
        "revenue_growth": "收入增长率（小数）",
        "profit": "会计利润（百万元）",
        "total_assets": "资产总额（百万元）",
        "liabilities": "负债总额（百万元）",
        "employees": "员工人数",
        "rd_expense": "研发支出（百万元）",
        "rd_intensity": "研发强度（小数）",
        "eligible_rd_expense": "合格研发支出（百万元）",
        "rd_staff_ratio": "研发人员占比（小数）",
        "patents": "专利数量",
        "patent_growth": "新增专利数量",
        "rd_growth": "研发增长率（小数）",
        "high_tech_status": "模拟高企标记",
        "synthetic": "合成数据标记",
        "vat_sales": "增值税销售额（百万元）",
        "vat_paid": "实缴增值税（百万元）",
        "cit_paid": "实缴企业所得税（百万元）",
        "taxable_income": "应纳税所得额（百万元）",
        "tax_credit_grade": "模拟纳税信用等级",
        "invoice_purchase": "购进开票（百万元）",
        "invoice_sales": "销项开票（百万元）",
        "cash_flow": "经营现金流（百万元）",
        "loan_balance": "贷款余额（百万元）",
        "export_sales": "出口销售额（百万元）",
    }
    values = {
        "AI": "人工智能",
        "Software": "软件",
        "Semiconductors": "半导体",
        "Robotics": "机器人",
        "Advanced manufacturing": "先进制造",
        "Cross-border commerce": "跨境电商",
        "Traditional manufacturing": "传统制造",
        "Precision instruments": "精密仪器",
        "Shenzhen": "深圳",
        "Guangzhou": "广州",
        "Dongguan": "东莞",
        "Foshan": "佛山",
    }
    return [
        {
            headers[k]: ("是" if v else "否")
            if isinstance(v, bool)
            else values.get(v, v)
            if isinstance(v, str)
            else v
            for k, v in row.items()
        }
        for row in rows
    ]


def main():
    firms = enrich(generate())
    report, research = fit_experiment(firms)
    cases = [
        {
            "id": "growth",
            "enterprise_id": "P-001",
            "title": "高成长 AI 企业",
            "subtitle": "结合持续研发理解当期盈利",
            "question": "持续研发投入如何影响融资沟通？",
        },
        {
            "id": "anomaly",
            "enterprise_id": "P-002",
            "title": "税务勾稽信号",
            "subtitle": "先核验依据，再形成判断",
            "question": "财务收入与增值税销售额差异有哪些可能解释？",
        },
        {
            "id": "policy",
            "enterprise_id": "P-003",
            "title": "研发政策机会",
            "subtitle": "将适用条件落实到材料证据",
            "question": "哪些创新优惠值得进一步审查材料？",
        },
    ]
    snapshot = {
        "meta": {
            "name": "BankTax-Agent",
            "data_years": [2022, 2023, 2024, 2025],
            "policy_as_of": AS_OF,
            "seed": SEED,
            "synthetic": True,
            "currency": "RMB",
            "monetary_unit": "millions",
            "agents": AGENTS,
        },
        "enterprises": firms,
        "policies": POLICIES,
        "cases": cases,
        "research": report,
    }
    write_json(ROOT / "public/data/demo.json", snapshot)
    write_json(ROOT / "data/enterprise_panel.json", firms)
    write_json(ROOT / "evals/results/model-comparison.json", report)
    panel = [
        {**h, "company_name": e["company_name"], "industry": e["industry"], "city": e["city"]}
        for e in firms
        for h in e["history"]
    ]
    write_csv(ROOT / "public/data/enterprise-panel.csv", panel)
    write_csv(ROOT / "public/data/enterprise-panel.zh-CN.csv", chinese_panel(panel))
    write_csv(ROOT / "data/research-cohort.csv", research)
    digest = hashlib.sha256((ROOT / "public/data/demo.json").read_bytes()).hexdigest()
    write_json(
        ROOT / "data/manifest.json",
        {
            "seed": SEED,
            "policy_as_of": AS_OF,
            "portfolio_enterprises": len(firms),
            "panel_records": len(firms) * 4,
            "research_enterprises": len(research),
            "demo_sha256": digest,
        },
    )
    print(
        json.dumps(
            {
                "enterprises": len(firms),
                "research_n": len(research),
                "models": [
                    {"name": m["name"], "auc": m["roc_auc"], "brier": m["brier"]} for m in report["models"]
                ],
            }
        )
    )


if __name__ == "__main__":
    main()
