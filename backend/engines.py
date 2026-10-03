"""Auditable rules and transparent innovation scorecard (no legal findings)."""

import statistics

DISCLAIMER = "本系统为决策支持原型。提示仅表示需要进一步核验的异常信号，不构成税务、信贷、法律或合规结论。"


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
            "收入—增值税销售额勾稽",
            "High" if gap > 0.30 else "Medium",
            f"财务收入 {rev * 100:.2f} 万元；增值税申报销售额 {vat * 100:.2f} 万元；绝对差异率 {gap:.1%}。",
            "R1：收入与增值税销售额之差的绝对值 / 收入 >15%（演示阈值）",
            "会计收入与应税销售额的差异超过演示勾稽阈值。",
            [
                "收入确认时点差异",
                "出口或免税交易",
                "合并范围差异",
            ],
            [
                "逐期核验收入与增值税销售额的调整明细",
                "审查出口、免税交易及主体范围",
            ],
        )
    if (rd > 0.08 and e["rd_staff_ratio"] < 0.08) or (e["high_tech_status"] and rd < 0.03):
        add(
            "RD_MISMATCH",
            "研发投入一致性",
            "Medium",
            f"研发 / 收入 {rd:.1%}；研发人员占比 {e['rd_staff_ratio']:.1%}；模拟高企标记 {'是' if e['high_tech_status'] else '否'}。",
            "R2：研发强度 >8% 且研发人员占比 <8%，或具有高企标记但年度研发强度 <3%",
            "筛选口径不一致需要核验，本规则并非法律规定的多年期资质认定标准。",
            ["委外研发", "资本化处理或人员分类变化"],
            ["审查研发项目台账", "核验委托研发与科技人员口径"],
        )
    if e["taxable_income"] > 3 and e["cit_paid"] / e["taxable_income"] < 0.04:
        add(
            "CIT_RECON",
            "应纳税所得额—企业所得税勾稽",
            "Medium",
            f"模拟应纳税所得额 {e['taxable_income'] * 100:.2f} 万元；实缴企业所得税 {e['cit_paid'] * 100:.2f} 万元。",
            "R3：应纳税所得额 >300 万元，且实缴企业所得税 / 应纳税所得额 <4%",
            "较低的现金缴税比例需要勾稽核验，不能据此认定少缴税款。",
            ["预缴与汇算清缴时间差异", "亏损结转或税额抵免"],
            ["获取税额计算及纳税调整明细", "核验现金缴税与应计税款"],
        )
    invoice_gap = abs(e["invoice_sales"] - vat) / max(vat, 0.01)
    if invoice_gap > 0.12 or e["invoice_purchase"] > rev * 1.15:
        add(
            "INVOICE_GAP",
            "发票—销售额一致性",
            "Medium",
            f"销项开票 {e['invoice_sales'] * 100:.2f} 万元；增值税销售额 {vat * 100:.2f} 万元；购进开票 {e['invoice_purchase'] * 100:.2f} 万元。",
            "R4：开票与增值税销售额差异率 >12%，或购进开票金额 >收入的 115%",
            "需要将发票流量与销售及采购会计记录逐项核对。",
            ["存货增加", "资本性投入", "开票时点差异"],
            ["审查存货与资本性支出变化", "核对发票对应的交易及期间"],
        )
    history = e.get("history", [])
    if len(history) > 1:
        prev = history[-2]
        prev_tax = prev["vat_paid"] + prev["cit_paid"]
        tax_growth = (e["vat_paid"] + e["cit_paid"]) / max(prev_tax, 0.01) - 1
        if e["revenue_growth"] > 0.20 and tax_growth < -0.10:
            add(
                "GROWTH_DIVERGENCE",
                "收入增长—缴税变化背离",
                "Medium",
                f"收入增长 {e['revenue_growth']:.1%}；现金缴税增长 {tax_growth:.1%}。",
                "R5：收入增长 >20%，且现金缴税增长 <−10%",
                "收入增长与缴税变化方向相反。",
                ["研发优惠或进项抵扣", "利润结构或缴税时点变化"],
                ["比较应税销售额增长", "审查扣除与进项抵扣变化"],
            )
        if prev_tax / prev["revenue"] > 0.01 and tax_burden(e) < 0.55 * prev_tax / prev["revenue"]:
            add(
                "BURDEN_HISTORY",
                "历史现金税负变化",
                "Low",
                f"当期现金税负 {tax_burden(e):.2%}；上年 {prev_tax / prev['revenue']:.2%}。",
                "R6a：当期现金税负 <上年税负的 55%（上年税负 >1%）",
                "企业现金税负相对自身历史水平明显变化。",
                ["投资形成的进项增值税", "税收优惠申报", "缴税时点差异"],
                [
                    "审查年度间税务勾稽明细",
                    "区分应计税款与现金缴税",
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
                "合成同业现金税负比较",
                "Low",
                f"现金税负 {tax_burden(e):.2%}；合成行业中位数 {median:.2%}；同业样本 {len(industry_peers)} 家。",
                "R6b：现金税负 <合成行业中位数的 50%；同业样本 ≥5 家",
                "粗略的行业比较仅为沟通线索，尚未控制全部税基差异。",
                ["产品结构或增值税税率不同", "出口比例或研发强度不同"],
                ["匹配税务处理与业务结构", "仅将同业比较作为背景依据"],
            )
    return flags


def innovation(e: dict) -> dict:
    components = [
        ("研发强度", min(e["rd_intensity"] / 0.20, 1), 30, "min（研发强度 ÷ 20%，1）× 30"),
        ("研发人员", min(e["rd_staff_ratio"] / 0.40, 1), 20, "min（研发人员占比 ÷ 40%，1）× 20"),
        ("专利存量", min(e["patents"] / 40, 1), 15, "min（专利数量 ÷ 40，1）× 15"),
        (
            "收入增长率",
            max(0, min(e["revenue_growth"] / 0.40, 1)),
            15,
            "将收入增长率 ÷ 40% 限制在 [0, 1] 内，再 × 15",
        ),
        ("高企标记", int(e["high_tech_status"]), 10, "模拟资质标记 × 10"),
        (
            "研发持续性",
            sum(h["rd_intensity"] >= 0.04 for h in e["history"]) / len(e["history"]),
            10,
            "研发强度 ≥4% 的年度占比 × 10",
        ),
    ]
    result = [{"name": n, "points": round(v * w, 2), "weight": w, "formula": f} for n, v, w, f in components]
    score = round(sum(c["points"] for c in result), 1)
    return {
        "score": score,
        "components": result,
        "interpretation": (
            f"研发支出占收入的 {e['rd_intensity']:.1%}，"
            f"研发人员占比 {e['rd_staff_ratio']:.0%}，拥有 {e['patents']} 项模拟专利。"
            "请结合盈利表现审查持续投入、知识产权质量与未来资金需求。"
        ),
        "limitation": "权重由设计者设定，仅用于演示，不代表经认证的创新评级或资质认定。",
    }
