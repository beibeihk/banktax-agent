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


def main():
    firms = enrich(generate())
    report, research = fit_experiment(firms)
    cases = [
        {
            "id": "growth",
            "enterprise_id": "P-001",
            "title": "High-growth AI company",
            "subtitle": "Look beyond current profitability",
            "question": "How can sustained R&D change the financing conversation?",
        },
        {
            "id": "anomaly",
            "enterprise_id": "P-002",
            "title": "Tax reconciliation signal",
            "subtitle": "Evidence before conclusions",
            "question": "What explains the financial-revenue / VAT-sales gap?",
        },
        {
            "id": "policy",
            "enterprise_id": "P-003",
            "title": "R&D policy opportunity",
            "subtitle": "Connect eligibility to evidence",
            "question": "Which innovation incentives merit a document review?",
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
    write_csv(
        ROOT / "public/data/enterprise-panel.csv",
        [
            {**h, "company_name": e["company_name"], "industry": e["industry"], "city": e["city"]}
            for e in firms
            for h in e["history"]
        ],
    )
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
