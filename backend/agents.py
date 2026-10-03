"""Task-specific agents share grounded facts; no fabricated autonomous actions."""

import re

from backend.engines import innovation, risk_signals
from backend.policy import opportunities, retrieve

AGENTS = [
    "Tax Policy Agent",
    "Enterprise Profile Agent",
    "Tax Risk Agent",
    "Tech Finance Agent",
    "Credit Risk Agent",
    "Relationship Manager Agent",
]


def route(question: str) -> str:
    q = question.lower()
    for words, agent in [
        (["brief", "next action", "客户经理", "简报"], AGENTS[5]),
        (["policy", "deduction", "政策", "加计扣除", "优惠"], AGENTS[0]),
        (["vat", "invoice", "anomaly", "异常", "税负", "发票"], AGENTS[2]),
        (["innovation", "patent", "研发", "创新", "科技金融"], AGENTS[3]),
        (["credit", "loan", "default", "信贷", "贷款"], AGENTS[4]),
    ]:
        if any((bool(re.search(rf"\b{re.escape(w)}\b", q)) if w.isascii() else w in q) for w in words):
            return agent
    return AGENTS[1]


def brief(e: dict) -> dict:
    risks = e["risks"]
    return {
        "mode": "基于已计算证据的简报",
        "whats_happening": f"营业收入同比增长 {e['revenue_growth']:.1%}，达到 {e['revenue'] * 100:.2f} 万元；利润率 {e['profit'] / e['revenue']:.1%}；研发强度 {e['rd_intensity']:.1%}。",
        "opportunities": f"有 {len(e['opportunities'])} 项政策或融资沟通线索待核验。建议审查研发台账，了解投资与营运资金需求。",
        "risks": f"有 {len(risks)} 项勾稽信号待核验。"
        + (risks[0]["evidence"] if risks else "未触发已配置涉税规则，但不能据此认定完全合规。"),
        "next_actions": [
            "请企业管理层提供收入与增值税销售额、税额计算的勾稽明细",
            "核验政策适用资格及资质、批准名单材料",
            "沟通现金流预测、知识产权质量与融资用途",
        ],
        "trace": [
            {
                "agent": AGENTS[1],
                "tool": "企业快照 + 历史面板",
                "result": e["enterprise_id"],
            },
            {
                "agent": AGENTS[2],
                "tool": "版本化确定性规则 R1–R6",
                "result": f"{len(risks)} 条信号",
            },
            {
                "agent": AGENTS[3],
                "tool": "透明的六维评分卡",
                "result": f"{e['innovation']['score']}/100",
            },
            {
                "agent": AGENTS[0],
                "tool": "标明日期的精选政策匹配",
                "result": f"{len(e['opportunities'])} 条线索",
            },
            {
                "agent": AGENTS[4],
                "tool": "配对逻辑回归模型",
                "result": "合成标签事件概率；不生成贷款审批",
            },
            {"agent": AGENTS[5], "tool": "基于证据的摘要", "result": "供人工审查的行动清单"},
        ],
    }


def enrich(firms: list[dict]) -> list[dict]:
    for e in firms:
        e["risks"] = risk_signals(e, firms)
        e["innovation"] = innovation(e)
        e["opportunities"] = opportunities(e)
        e["brief"] = brief(e)
    return firms


def orchestrate(question: str, e: dict | None = None) -> dict:
    agent = route(question)
    if agent == AGENTS[0]:
        return {"agent": agent, "output": retrieve(question)}
    if e is None:
        return {
            "agent": agent,
            "output": {
                "status": "insufficient_evidence",
                "answer": "请选择企业，以其证据支持本次请求。",
            },
        }
    keys = {
        AGENTS[1]: {"enterprise_id": e["enterprise_id"], "revenue": e["revenue"], "synthetic": True},
        AGENTS[2]: e["risks"],
        AGENTS[3]: e["innovation"],
        AGENTS[4]: e.get("credit", {}),
        AGENTS[5]: e["brief"],
    }
    return {"agent": agent, "output": keys[agent]}
