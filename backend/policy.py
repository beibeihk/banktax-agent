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
            "answer": "No unconditional tax exemption or loan approval can be established from this curated library.",
            "policies": [],
            "as_of": as_of,
        }
    scored = [(sum(k in question.lower() for k in p["keywords"]), p) for p in POLICIES if active(p, as_of)]
    relevant = [p for s, p in sorted(scored, key=lambda x: -x[0]) if s > 0][:4]
    return {
        "status": "supported" if relevant else "insufficient_evidence",
        "answer": "Potential policies to verify; the cited conditions and dates govern each opportunity."
        if relevant
        else "Insufficient information in the curated library. Provide a jurisdiction, tax type or policy reference; no unsupported rule is inferred.",
        "policies": relevant,
        "as_of": as_of,
        "method": "Deterministic keyword retrieval over curated official sources; no embeddings or generative legal answer.",
    }


def opportunities(e: dict, as_of: str = AS_OF) -> list[dict]:
    ids = []
    if e["eligible_rd_expense"] > 0:
        ids.append(
            (
                "rd-2023-7",
                "Candidate",
                "Accounting R&D exists; confirm eligible activity, expense scope and ledgers.",
            )
        )
    if e["high_tech_status"]:
        ids.append(
            (
                "high-tech-cit",
                "Verify qualification",
                "Synthetic high-tech flag is present; obtain the actual valid certificate in a real workflow.",
            )
        )
    if e["taxable_income"] <= 3 and e["employees"] <= 300 and e["total_assets"] <= 50:
        ids.append(
            (
                "small-profit-2023-12",
                "Preliminary screen",
                "Snapshot values pass screening; annual quarterly averages and sector conditions remain unverified.",
            )
        )
    if (
        e["industry"] in ["Semiconductors", "Robotics", "Advanced manufacturing", "Precision instruments"]
        and e["high_tech_status"]
    ):
        status = "Verify approved list" if e["approved_manufacturing_list"] else "Missing list evidence"
        ids.append(
            (
                "manufacturing-vat-43",
                status,
                "General taxpayer + high-tech + approved list required; export input VAT excluded.",
            )
        )
    if e["city"] == "Shenzhen" and e["rd_intensity"] >= 0.03:
        ids.append(
            (
                "sz-recognition-2026",
                "Readiness review",
                "Review multi-year ratios, technology staff, IP, product revenue and batch deadlines.",
            )
        )
        ids.append(
            (
                "sz-tech-finance-2025",
                "Financing discussion",
                "Directional framework; confirm current lender products and investment needs.",
            )
        )
    if e["tax_credit_grade"] in ["A", "B", "M"]:
        ids.append(
            (
                "gd-bank-tax-2026",
                "Relationship lead",
                "Obtain enterprise authorization and review bank-specific product requirements.",
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
        raise ValueError("Use nonnegative eligible expensed R&D and a supported illustrative CIT rate.")
    return {
        "additional_deduction": round(eligible_expensed_rd, 6),
        "total_deduction": round(2 * eligible_expensed_rd, 6),
        "illustrative_tax_effect": round(eligible_expensed_rd * marginal_rate, 6),
        "unit": "RMB millions",
        "policy_id": "rd-2023-7",
        "assumptions": "Eligible expensed R&D only; sufficient taxable income; ignores loss carryforwards, interactions and timing. Not a cash refund.",
    }
