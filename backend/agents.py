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
        "mode": "Deterministic evidence brief",
        "whats_happening": f"Revenue grew {e['revenue_growth']:.1%} to RMB {e['revenue']:.2f}m. Profit margin is {e['profit'] / e['revenue']:.1%}; R&D intensity is {e['rd_intensity']:.1%}.",
        "opportunities": f"{len(e['opportunities'])} policy or financing discussion leads require verification. Review the R&D ledger and explore investment / working-capital needs.",
        "risks": f"{len(risks)} reconciliation signals are open. "
        + (
            risks[0]["evidence"]
            if risks
            else "No configured tax rule is triggered; this is not a clean-compliance conclusion."
        ),
        "next_actions": [
            "Obtain management's revenue-to-VAT and tax computation bridges",
            "Verify policy eligibility and any qualification/list evidence",
            "Discuss cash-flow forecasts, IP quality and financing purpose",
        ],
        "trace": [
            {
                "agent": AGENTS[1],
                "tool": "enterprise snapshot + historical panel",
                "result": e["enterprise_id"],
            },
            {
                "agent": AGENTS[2],
                "tool": "versioned deterministic rules R1–R6",
                "result": f"{len(risks)} signals",
            },
            {
                "agent": AGENTS[3],
                "tool": "transparent six-component scorecard",
                "result": f"{e['innovation']['score']}/100",
            },
            {
                "agent": AGENTS[0],
                "tool": "dated curated policy matching",
                "result": f"{len(e['opportunities'])} leads",
            },
            {
                "agent": AGENTS[4],
                "tool": "paired logistic models",
                "result": "synthetic-label probabilities; no lending approval",
            },
            {"agent": AGENTS[5], "tool": "grounded evidence summary", "result": "human-review action list"},
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
                "answer": "Select an enterprise to ground this request.",
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
