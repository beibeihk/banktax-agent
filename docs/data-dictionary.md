# Synthetic data dictionary

**All records, names, qualifications, government indicators and outcomes are fictional.** Monetary values are **RMB millions**. Fiscal panel years are 2022–2025. The research label is a simulated event in the following year, not an observed default.

| Field | Type / unit | Meaning |
|---|---|---|
| enterprise_id | string | Canonical synthetic identifier; P=portfolio, R=research |
| company_name / name_en | string | Fictional display names; portfolio Chinese names include 虚构 |
| industry / city | category | Eight illustrative sectors, four Guangdong cities |
| year | integer | Financial snapshot year |
| synthetic | boolean | Always true |
| revenue | RMB m | Accounting revenue |
| revenue_growth | fraction | Revenue growth relative to prior generated year; first-year value is a seeded baseline assumption |
| profit | RMB m | Accounting profit before additional R&D tax deduction |
| total_assets / liabilities | RMB m | Synthetic balance sheet; liabilities below assets |
| employees | persons | Synthetic snapshot count, not statutory quarterly averages |
| rd_expense / rd_intensity | RMB m / fraction | Accounting R&D and R&D/revenue |
| eligible_rd_expense | RMB m | Assumed eligible R&D portion in the illustrative tax bridge |
| rd_staff_ratio | fraction | Synthetic R&D staff / total staff; not the legal technology-personnel definition |
| rd_growth | fraction | R&D growth vs. prior generated year |
| patents / patent_growth | counts | Synthetic patent stock and yearly additions; no quality inference |
| high_tech_status | boolean | Simulated qualification flag, not a verified certificate |
| specialized_sme | boolean | Simulated specialized-enterprise style flag |
| government_innovation_indicator | boolean | Simulated government innovation indicator |
| vat_general_taxpayer | boolean | Assumed general-taxpayer status in this portfolio |
| approved_manufacturing_list | boolean | Separate simulated list-evidence flag |
| vat_sales / vat_paid | RMB m | Taxable-sales proxy and simplified VAT cash payment |
| cit_paid / taxable_income | RMB m | Simplified CIT cash payment and tax-base bridge |
| tax_credit_grade | category | Synthetic A/B/M/C/D tax-credit grade |
| invoice_purchase / invoice_sales | RMB m | Synthetic invoice-flow amounts |
| cash_flow | RMB m | Illustrative operating cash flow |
| loan_balance | RMB m | Loan balance below liabilities |
| export_sales | RMB m | Synthetic export-sales share |
| synthetic_default_next_year | binary | Bernoulli-drawn research demonstration label |
| history | array | Four accounting-year observations |
| risks | array | Computed signals, rules, evidence, legitimate explanations and review steps |
| innovation | object | Six-component score and disclosed formulas |
| opportunities | array | Dated candidate policy/financing leads and missing evidence |
| brief | object | Deterministically composed evidence summary and agent trace |
| credit | object | Predictions of a synthetic-label model; not real-world PDs |

## Coherence and deliberate anomalies

The generator derives R&D from revenue and a sector-related intensity, connects assets/liabilities/loans, separates book profit from a simplified taxable-income bridge, and links VAT sales, invoices and input/output assumptions. A subset of final-year VAT sales is reduced to create reconciliation cases. Differences are **not labeled as illegality**. The second demo case also has an illustrative annual R&D / qualification mismatch.

The bridge uses simplified R&D eligibility shares, CIT rates and snapshot small-enterprise screens. It omits the full statutory tax base, carryforwards, quarterly-average employee/asset conditions, many VAT classifications, export refunds and cash/accrual timing. These are simulation assumptions, not a tax calculator for a real enterprise. Future 2026 policy leads are separate from FY2025 tax generation.

## Derived features

Leverage=`liabilities/assets`; profit margin=`profit/revenue`; cash-flow ratio=`cash_flow/revenue`; loan/assets=`loan_balance/assets`; absolute VAT gap=`abs(vat_sales−revenue)/revenue`; cash-tax burden=`(vat_paid+cit_paid)/revenue`. Cash-tax burden is a cash-flow proxy, not the statutory effective CIT rate. Logs use `log(1+x)`.

Policy schema includes ID, title, issuer, reference, publication/effective/expiry dates, jurisdiction/type, entity scope, conditions, benefits, original source, summary, keywords, source kind and checked date. Null effective dates mean the directional report did not specify one; they are not invented. The Shenzhen notice's expiry is its last published application deadline, not repeal of the underlying recognition framework.
