"""Coherent illustrative enterprise panel. All names and records are fictional.

Monetary amounts are RMB millions. FY2022–2025; labels refer to a simulated
following-year binary event, not observed defaults. Seeded, independent cohorts.
"""

import math

import numpy as np

SEED = 20261003
INDUSTRIES = [
    "AI",
    "Software",
    "Semiconductors",
    "Robotics",
    "Advanced manufacturing",
    "Cross-border commerce",
    "Traditional manufacturing",
    "Precision instruments",
]
PREFIXES = ["星澜", "云拓", "明芯", "澄远", "知序", "镜川", "曜衡", "青屿", "沐辰", "观微"]
SUFFIXES = ["智能科技", "软件技术", "微电子", "机器人", "精密制造", "跨境贸易", "工业装备", "仪器科技"]
CITIES = ["Shenzhen", "Guangzhou", "Dongguan", "Foshan"]
CITY_CN = {"Shenzhen": "深圳", "Guangzhou": "广州", "Dongguan": "东莞", "Foshan": "佛山"}


def feature_row(e: dict) -> dict:
    return {
        "leverage": e["liabilities"] / e["total_assets"],
        "profit_margin": e["profit"] / e["revenue"],
        "cash_flow_ratio": e["cash_flow"] / e["revenue"],
        "revenue_growth": e["revenue_growth"],
        "loan_asset_ratio": e["loan_balance"] / e["total_assets"],
        "log_revenue": math.log1p(e["revenue"]),
        "vat_gap": abs(e["vat_sales"] - e["revenue"]) / e["revenue"],
        "tax_burden": (e["vat_paid"] + e["cit_paid"]) / e["revenue"],
        "tax_credit_quality": {"A": 1, "B": 0.75, "M": 0.5, "C": 0.25, "D": 0}[e["tax_credit_grade"]],
        "rd_intensity": e["rd_intensity"],
        "rd_staff_ratio": e["rd_staff_ratio"],
        "log_patents": math.log1p(e["patents"]),
        "high_tech": int(e["high_tech_status"]),
    }


def label_probability(e: dict) -> float:
    """Assumed DGP, disclosed in docs; NOT calibrated to any real market."""
    f = feature_row(e)
    z = (
        -1.5
        + 3.0 * (f["leverage"] - 0.5)
        - 5.0 * f["cash_flow_ratio"]
        - 3.0 * f["profit_margin"]
        + 2 * f["loan_asset_ratio"]
        + 3.0 * f["vat_gap"]
        + 1.3 * (1 - f["tax_credit_quality"])
        - 2 * f["rd_intensity"]
        - 0.1 * f["log_patents"]
    )
    return 1 / (1 + math.exp(-z))


def generate(n: int = 80, seed: int = SEED, cohort: str = "portfolio", curated: bool = True) -> list[dict]:
    rng = np.random.default_rng(seed)
    firms = []
    for i in range(n):
        sector = i % len(INDUSTRIES)
        city = CITIES[i % 4]
        if curated and i < 3:
            city = "Shenzhen" if i != 1 else "Dongguan"
        tech = sector not in [5, 6]
        rd_ratio = float(rng.uniform(0.04, 0.19) if tech else rng.uniform(0.002, 0.035))
        staff_ratio = min(0.55, rd_ratio * 2 + float(rng.uniform(0.02, 0.10)))
        hte = bool(tech and rng.random() < 0.64)
        rev = float(rng.uniform(20, 210))
        growth_base = float(rng.uniform(0.02, 0.42) if tech else rng.uniform(-0.08, 0.15))
        margin = float(rng.uniform(-0.03, 0.20))
        grade = str(rng.choice(["A", "B", "M", "C", "D"], p=[0.38, 0.36, 0.12, 0.10, 0.04]))
        anomaly = i % 7 == 1
        if curated and i == 0:
            rd_ratio, staff_ratio, hte, rev, growth_base, margin, grade = (
                0.164,
                0.38,
                True,
                51,
                0.39,
                0.025,
                "A",
            )
        if curated and i == 1:
            sector, rd_ratio, staff_ratio, rev, growth_base, grade = 6, 0.021, 0.08, 93, 0.08, "B"
        if curated and i == 2:
            sector, rd_ratio, staff_ratio, hte, rev, growth_base, margin, grade = (
                3,
                0.112,
                0.31,
                True,
                35,
                0.26,
                0.105,
                "A",
            )
        patents = int(rng.integers(4, 22) if tech else rng.integers(0, 4))
        history = []
        for year in range(2022, 2026):
            growth = growth_base + float(rng.normal(0, 0.025))
            if year != 2022:
                rev *= 1 + growth
            rd = rev * rd_ratio * (1 + 0.025 * (year - 2022))
            # Accounting profit is before the extra R&D tax deduction.
            profit = rev * (margin + float(rng.normal(0, 0.008)))
            assets = rev * float(rng.uniform(0.7, 1.5))
            leverage = float(rng.uniform(0.25, 0.80))
            purchases = rev * float(rng.uniform(0.40, 0.70))
            sales = rev * float(rng.uniform(0.965, 1.025))
            if anomaly and year == 2025:
                sales = rev * 0.64
            eligible_rd = rd * 0.82 if tech else 0
            taxable = max(0, profit - eligible_rd + rev * 0.01)
            rate = 0.15 if hte else 0.25
            employees = max(12, int(rev * rng.uniform(1.8, 3.0)))
            if taxable <= 3 and employees <= 300 and assets <= 50:
                rate = 0.05
            patents += int(rng.integers(2, 7) if tech else rng.integers(0, 2))
            vat_rate = 0.06 if sector in [0, 1] else 0.13
            vat = max(0, sales * vat_rate - purchases * vat_rate * 0.86)
            previous = history[-1] if history else None
            record = {
                "enterprise_id": f"{cohort[:1].upper()}-{i + 1:03}",
                "year": year,
                "revenue": round(rev, 4),
                "revenue_growth": round(growth, 5),
                "profit": round(profit, 4),
                "total_assets": round(assets, 4),
                "liabilities": round(assets * leverage, 4),
                "employees": employees,
                "rd_expense": round(rd, 4),
                "rd_intensity": round(rd / rev, 5),
                "rd_staff_ratio": round(staff_ratio, 5),
                "patents": patents,
                "high_tech_status": hte,
                "vat_sales": round(sales, 4),
                "vat_paid": round(vat, 4),
                "cit_paid": round(taxable * rate, 4),
                "taxable_income": round(taxable, 4),
                "eligible_rd_expense": round(eligible_rd, 4),
                "tax_credit_grade": grade,
                "invoice_purchase": round(purchases, 4),
                "invoice_sales": round(sales * float(rng.uniform(0.96, 1.03)), 4),
                "cash_flow": round(rev * (margin + float(rng.normal(0.025, 0.08))), 4),
                "loan_balance": round(assets * leverage * 0.40, 4),
                "export_sales": round(rev * (0.48 if sector == 5 else 0.06), 4),
                "rd_growth": round(rd / previous["rd_expense"] - 1, 5) if previous else 0,
                "patent_growth": patents - previous["patents"] if previous else 0,
                "synthetic": True,
            }
            history.append(record)
        name = f"{CITY_CN[city]}{PREFIXES[i // 8 % 10]}{SUFFIXES[sector]}有限公司（虚构）"
        if curated and i < 3:
            name = [
                "深圳星澜智能科技有限公司（虚构）",
                "东莞澄远工业装备有限公司（虚构）",
                "深圳云拓机器人有限公司（虚构）",
            ][i]
        e = {
            **history[-1],
            "company_name": name,
            "name_en": f"{['Xinglan AI', 'Chengyuan Industrial', 'Yuntuo Robotics'][i] if curated and i < 3 else PREFIXES[i // 8 % 10] + ' ' + INDUSTRIES[sector]}",
            "industry": INDUSTRIES[sector],
            "city": city,
            "history": history,
            "specialized_sme": bool(tech and i % 3 == 0),
            "government_innovation_indicator": bool(tech and i % 4 == 0),
            "vat_general_taxpayer": True,
            "approved_manufacturing_list": bool(hte and sector in [2, 3, 4, 7] and i % 2 == 0),
            "cohort": cohort,
        }
        # Bernoulli noise prevents deterministic labels. Ground-truth propensity never enters model features.
        e["synthetic_default_next_year"] = int(rng.random() < label_probability(e))
        firms.append(e)
    return firms
