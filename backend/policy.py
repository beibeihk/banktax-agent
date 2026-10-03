"""Small curated policy retrieval with explicit dates and conservative matching."""

import json
from datetime import date
from pathlib import Path

POLICIES = json.loads(
    (Path(__file__).resolve().parents[1] / "data/policies.json").read_text(encoding="utf-8")
)
AS_OF = "2026-10-03"


def active(p: dict, as_of: str = AS_OF) -> bool:
    date.fromisoformat(as_of)
    start = p.get("effective_date") or p["publication_date"]
    return start <= as_of and (not p.get("expiry_date") or as_of <= p["expiry_date"])


def retrieve(question: str, as_of: str = AS_OF) -> dict:
    if any(
        k in question.lower()
        for k in ["ignore previous", "ignore instructions", "忽略指令", "无条件", "guaranteed", "保证审批"]
    ):
        return {
            "status": "insufficient_evidence",
            "answer": "该资料库无法支持无条件免税或保证贷款审批的结论。",
            "policies": [],
            "as_of": as_of,
        }
    scored = [(sum(k in question.lower() for k in p["keywords"]), p) for p in POLICIES if active(p, as_of)]
    relevant = [p for s, p in sorted(scored, key=lambda x: -x[0]) if s > 0][:4]
    return {
        "status": "supported" if relevant else "insufficient_evidence",
        "answer": "以下为待核验的政策线索，各项机会以所引适用条件与日期为准。"
        if relevant
        else "资料库证据不足，请补充地区、税种或政策文号；不推断缺乏依据的规定。",
        "policies": relevant,
        "as_of": as_of,
        "method": "对精选官方来源进行确定性关键词检索，不使用向量检索或生成式法律答复。",
    }


def opportunities(e: dict, as_of: str = AS_OF) -> list[dict]:
    ids = []
    if e["eligible_rd_expense"] > 0:
        ids.append(
            (
                "rd-2023-7",
                "候选机会",
                "存在会计研发支出；须核验合格活动、费用范围及台账。",
            )
        )
    if e["high_tech_status"]:
        ids.append(
            (
                "high-tech-cit",
                "核验资质",
                "具有模拟高企标记；真实业务中须取得有效证书。",
            )
        )
    if e["taxable_income"] <= 3 and e["employees"] <= 300 and e["total_assets"] <= 50:
        ids.append(
            (
                "small-profit-2023-12",
                "初步筛选",
                "快照指标通过筛选；年度季度平均值及行业条件尚待核验。",
            )
        )
    if (
        e["industry"] in ["Semiconductors", "Robotics", "Advanced manufacturing", "Precision instruments"]
        and e["high_tech_status"]
    ):
        status = "核验批准名单" if e["approved_manufacturing_list"] else "缺少名单依据"
        ids.append(
            (
                "manufacturing-vat-43",
                status,
                "须同时具备一般纳税人、高企资质及批准名单条件；出口对应进项税额应排除。",
            )
        )
    if e["city"] == "Shenzhen" and e["rd_intensity"] >= 0.03:
        ids.append(
            (
                "sz-recognition-2026",
                "认定准备审查",
                "审查多年期比例、科技人员、知识产权、产品收入及批次期限。",
            )
        )
        ids.append(
            (
                "sz-tech-finance-2025",
                "融资沟通",
                "工作方向框架；须确认当前银行产品及投资需求。",
            )
        )
    if e["tax_credit_grade"] in ["A", "B", "M"]:
        ids.append(
            (
                "gd-bank-tax-2026",
                "客户沟通线索",
                "取得企业授权，并审查具体银行产品条件。",
            )
        )
    result = []
    for pid, status, evidence in ids:
        p = next(p for p in POLICIES if p["id"] == pid)
        if active(p, as_of):
            result.append({"policy_id": pid, "status": status, "evidence": evidence})
    return result


def calculate_rd(eligible_expensed_rd: float, marginal_rate: float) -> dict:
    if not 0 <= eligible_expensed_rd <= 1e9 or marginal_rate not in [0.05, 0.15, 0.25]:
        raise ValueError("请输入非负的合格费用化研发支出及支持的假设所得税税率。")
    return {
        "additional_deduction": round(eligible_expensed_rd, 6),
        "total_deduction": round(2 * eligible_expensed_rd, 6),
        "illustrative_tax_effect": round(eligible_expensed_rd * marginal_rate, 6),
        "unit": "人民币百万元",
        "policy_id": "rd-2023-7",
        "assumptions": "仅针对合格费用化研发支出，假设应纳税所得额充足；未考虑亏损结转、优惠叠加与时间差异，不代表现金退税。",
    }
