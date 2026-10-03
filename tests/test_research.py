import json
from pathlib import Path

from backend.research import FINANCIAL, INNOVATION, TAX
from backend.synthetic import feature_row, generate


def test_holdout_and_feature_leakage():
    report = json.loads(Path("evals/results/model-comparison.json").read_text(encoding="utf-8"))
    train, test = report["split"]["train_ids"], report["split"]["test_ids"]
    assert set(train).isdisjoint(test)
    assert len(train) == 1120 and len(test) == 480
    assert len(set(train + test)) == 1600
    assert all(eid.startswith("R-") for eid in train + test)
    assert set(feature_row(generate()[0])) == set(FINANCIAL + TAX + INNOVATION)
    assert not any("default" in f or "probability" in f for f in FINANCIAL + TAX + INNOVATION)
    for m in report["models"]:
        assert 0 <= m["roc_auc"] <= 1
        assert sum(sum(row) for row in m["confusion_matrix"]) == 480
        assert 0 <= m["brier"] <= 1
