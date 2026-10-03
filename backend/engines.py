"""Auditable rules and transparent innovation scorecard (no legal findings)."""

import statistics

DISCLAIMER = (
    "Decision-support prototype. Alerts indicate signals requiring further verification and do not "
    "constitute tax, credit, legal, or compliance conclusions."
)


def tax_burden(e: dict) -> float:
    return (e["vat_paid"] + e["cit_paid"]) / e["revenue"]


def risk_signals(e: dict, peers: list[dict]) -> list[dict]:
    flags = []

    def add(code, name, severity, evidence, rule, explanation, legitimate, steps):
        flags.append(
            {
                "code": code,
                "name": name,
                "severity": severity,
                "evidence": evidence,
                "rule": rule,
                "explanation": explanation,
                "legitimate_explanations": legitimate,
                "verification": steps,
                "agent": "Tax Risk Agent",
            }
        )

    rev, vat, rd = e["revenue"], e["vat_sales"], e["rd_intensity"]
    gap = abs(rev - vat) / rev
    if gap > 0.15:
        add(
            "VAT_GAP",
            "Revenue–VAT reconciliation",
            "High" if gap > 0.30 else "Medium",
            f"Financial revenue RMB {rev:.2f}m; VAT sales RMB {vat:.2f}m; absolute gap {gap:.1%}.",
            "R1: |revenue − VAT sales| / revenue > 15% (illustrative threshold)",
            "Accounting and taxable sales diverge beyond the demo reconciliation threshold.",
            [
                "Revenue-recognition timing",
                "Export or exempt transactions",
                "Consolidation scope differences",
            ],
            [
                "Reconcile the revenue-to-VAT bridge by period",
                "Review export/exempt transactions and entity scope",
            ],
        )
    if (rd > 0.08 and e["rd_staff_ratio"] < 0.08) or (e["high_tech_status"] and rd < 0.03):
        add(
            "RD_MISMATCH",
            "R&D input consistency",
            "Medium",
            f"R&D/revenue {rd:.1%}; R&D staff {e['rd_staff_ratio']:.1%}; high-tech flag {e['high_tech_status']}.",
            "R2: R&D >8% with staff <8%, OR high-tech flag with annual R&D <3%",
            "A screening mismatch merits a check; this is not the statutory multi-year qualification test.",
            ["Outsourced R&D", "Capitalization or staff classification changes"],
            ["Inspect R&D project ledgers", "Reconcile contracted R&D and technology personnel"],
        )
    if e["taxable_income"] > 3 and e["cit_paid"] / e["taxable_income"] < 0.04:
        add(
            "CIT_RECON",
            "Taxable income–CIT reconciliation",
            "Medium",
            f"Synthetic taxable income RMB {e['taxable_income']:.2f}m; CIT paid RMB {e['cit_paid']:.2f}m.",
            "R3: taxable income > RMB 3m AND CIT cash/taxable income <4%",
            "A low cash-payment ratio calls for reconciliation, not a tax underpayment conclusion.",
            ["Prepayment and settlement timing", "Loss carryforwards or tax credits"],
            ["Obtain the tax computation bridge", "Reconcile cash payments and assessed liabilities"],
        )
    invoice_gap = abs(e["invoice_sales"] - vat) / max(vat, 0.01)
    if invoice_gap > 0.12 or e["invoice_purchase"] > rev * 1.15:
        add(
            "INVOICE_GAP",
            "Invoice–sales consistency",
            "Medium",
            f"Sales invoices RMB {e['invoice_sales']:.2f}m; VAT sales RMB {vat:.2f}m; purchases RMB {e['invoice_purchase']:.2f}m.",
            "R4: invoice/VAT gap >12% OR purchase invoices >115% of revenue",
            "Invoice flows need to be bridged to sales and procurement accounting.",
            ["Inventory build-up", "Capital investment", "Invoice issuance timing"],
            ["Inspect inventory and capex changes", "Match invoices to transactions and periods"],
        )
    history = e.get("history", [])
    if len(history) > 1:
        prev = history[-2]
        prev_tax = prev["vat_paid"] + prev["cit_paid"]
        tax_growth = (e["vat_paid"] + e["cit_paid"]) / max(prev_tax, 0.01) - 1
        if e["revenue_growth"] > 0.20 and tax_growth < -0.10:
            add(
                "GROWTH_DIVERGENCE",
                "Growth–tax divergence",
                "Medium",
                f"Revenue growth {e['revenue_growth']:.1%}; cash tax growth {tax_growth:.1%}.",
                "R5: revenue growth >20% AND cash-tax growth <−10%",
                "Growth and tax payments move in opposite directions.",
                ["R&D incentives or input credits", "Profit mix or payment timing"],
                ["Compare taxable sales growth", "Review deduction and input-credit movements"],
            )
        if prev_tax / prev["revenue"] > 0.01 and tax_burden(e) < 0.55 * prev_tax / prev["revenue"]:
            add(
                "BURDEN_HISTORY",
                "Historical cash-tax burden shift",
                "Low",
                f"Current cash-tax/revenue {tax_burden(e):.2%}; prior year {prev_tax / prev['revenue']:.2%}.",
                "R6a: current cash-tax burden <55% of prior-year burden (prior >1%)",
                "The cash-tax burden has moved materially relative to the firm's own history.",
                ["Investment-related input VAT", "Incentive claims", "Payment timing"],
                [
                    "Review the year-over-year tax reconciliation",
                    "Separate accrual liability from cash payments",
                ],
            )
    industry_peers = [
        p for p in peers if p["industry"] == e["industry"] and p["enterprise_id"] != e["enterprise_id"]
    ]
    if len(industry_peers) >= 5:
        median = statistics.median(tax_burden(p) for p in industry_peers)
        if median > 0.01 and tax_burden(e) < 0.50 * median:
            add(
                "BURDEN_PEER",
                "Synthetic peer cash-tax comparison",
                "Low",
                f"Cash-tax burden {tax_burden(e):.2%}; synthetic sector median {median:.2%}; peer n={len(industry_peers)}.",
                "R6b: cash-tax burden <50% of synthetic sector median; peer n≥5",
                "A coarse sector comparison is a discussion lead; it does not adjust for all tax-base differences.",
                ["Different product mix or VAT rates", "Export or R&D intensity differences"],
                ["Match tax treatment and business mix", "Use peer comparison only as contextual evidence"],
            )
    return flags


def innovation(e: dict) -> dict:
    components = [
        ("R&D intensity", min(e["rd_intensity"] / 0.20, 1), 30, "min(R&D / revenue ÷ 20%, 1) × 30"),
        ("R&D staff", min(e["rd_staff_ratio"] / 0.40, 1), 20, "min(R&D staff ratio ÷ 40%, 1) × 20"),
        ("Patent stock", min(e["patents"] / 40, 1), 15, "min(patents ÷ 40, 1) × 15"),
        ("Revenue growth", max(0, min(e["revenue_growth"] / 0.40, 1)), 15, "clamp(growth ÷ 40%, 0, 1) × 15"),
        ("High-tech flag", int(e["high_tech_status"]), 10, "synthetic qualification flag × 10"),
        (
            "R&D persistence",
            sum(h["rd_intensity"] >= 0.04 for h in e["history"]) / len(e["history"]),
            10,
            "fraction of years with R&D ≥4% × 10",
        ),
    ]
    result = [{"name": n, "points": round(v * w, 2), "weight": w, "formula": f} for n, v, w, f in components]
    score = round(sum(c["points"] for c in result), 1)
    return {
        "score": score,
        "components": result,
        "interpretation": (
            f"R&D investment represents {e['rd_intensity']:.1%} of sales with "
            f"{e['rd_staff_ratio']:.0%} of staff in R&D and {e['patents']} synthetic patents. "
            "Assess sustained investment, IP quality and future cash needs alongside profitability."
        ),
        "limitation": "Designer-defined illustrative weights; not an accredited innovation rating or qualification test.",
    }
