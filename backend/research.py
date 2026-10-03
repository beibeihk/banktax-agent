"""Paired train/test experiment; no result selection, no label leakage."""

import numpy as np
from sklearn.calibration import calibration_curve
from sklearn.inspection import permutation_importance
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    brier_score_loss,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

from backend.synthetic import SEED, feature_row, generate

FINANCIAL = [
    "leverage",
    "profit_margin",
    "cash_flow_ratio",
    "revenue_growth",
    "loan_asset_ratio",
    "log_revenue",
]
TAX = ["vat_gap", "tax_burden", "tax_credit_quality"]
INNOVATION = ["rd_intensity", "rd_staff_ratio", "log_patents", "high_tech"]


def matrix(rows, features):
    return np.array([[feature_row(e)[f] for f in features] for e in rows])


def fit_experiment(portfolio: list[dict]) -> tuple[dict, list[dict]]:
    sample = generate(1600, seed=SEED + 1, cohort="research", curated=False)
    y = np.array([e["synthetic_default_next_year"] for e in sample])
    train, test = train_test_split(np.arange(len(sample)), test_size=0.30, random_state=SEED, stratify=y)
    models = []
    probabilities = []
    for label, features in [
        ("A · Financial only", FINANCIAL),
        ("B · Financial + tax + innovation", FINANCIAL + TAX + INNOVATION),
    ]:
        x = matrix(sample, features)
        model = make_pipeline(StandardScaler(), LogisticRegression(C=1, max_iter=2000, random_state=SEED))
        model.fit(x[train], y[train])
        p = model.predict_proba(x[test])[:, 1]
        pred = (p >= 0.5).astype(int)
        frac, mean = calibration_curve(y[test], p, n_bins=6, strategy="quantile")
        fpr, tpr, _ = roc_curve(y[test], p)
        importance = permutation_importance(
            model, x[test], y[test], scoring="roc_auc", n_repeats=10, random_state=SEED
        )
        coefficients = model[-1].coef_[0]
        models.append(
            {
                "name": label,
                "features": features,
                "roc_auc": round(roc_auc_score(y[test], p), 4),
                "precision": round(precision_score(y[test], pred, zero_division=0), 4),
                "recall": round(recall_score(y[test], pred, zero_division=0), 4),
                "f1": round(f1_score(y[test], pred, zero_division=0), 4),
                "brier": round(brier_score_loss(y[test], p), 4),
                "confusion_matrix": confusion_matrix(y[test], pred, labels=[0, 1]).tolist(),
                "calibration": [
                    {"predicted": round(float(m), 4), "observed": round(float(f), 4)}
                    for m, f in zip(mean, frac)
                ],
                "roc": [{"fpr": round(float(a), 4), "tpr": round(float(b), 4)} for a, b in zip(fpr, tpr)],
                "importance": [
                    {
                        "feature": f,
                        "auc_drop": round(float(v), 4),
                        "std": round(float(s), 4),
                        "coefficient": round(float(c), 4),
                    }
                    for f, v, s, c in zip(
                        features, importance.importances_mean, importance.importances_std, coefficients
                    )
                ],
            }
        )
        probabilities.append(model.predict_proba(matrix(portfolio, features))[:, 1])
    for i, e in enumerate(portfolio):
        e["credit"] = {
            "financial_only": round(float(probabilities[0][i]), 4),
            "augmented": round(float(probabilities[1][i]), 4),
            "label": "Simulated event probability; not an estimated real-world PD",
        }
    # Paired bootstrap on the fixed held-out set. This quantifies sampling noise within this DGP only.
    rng = np.random.default_rng(SEED)
    pa, pb = [], []
    for features in [FINANCIAL, FINANCIAL + TAX + INNOVATION]:
        x = matrix(sample, features)
        model = make_pipeline(StandardScaler(), LogisticRegression(C=1, max_iter=2000, random_state=SEED))
        model.fit(x[train], y[train])
        (pa if features == FINANCIAL else pb).extend(model.predict_proba(x[test])[:, 1])
    deltas = []
    for _ in range(500):
        idx = rng.integers(0, len(test), len(test))
        if len(np.unique(y[test][idx])) == 2:
            deltas.append(
                roc_auc_score(y[test][idx], np.array(pb)[idx])
                - roc_auc_score(y[test][idx], np.array(pa)[idx])
            )
    descriptives = []
    for f in FINANCIAL + TAX + INNOVATION:
        vals = [feature_row(e)[f] for e in sample]
        descriptives.append(
            {
                "feature": f,
                "mean": round(float(np.mean(vals)), 4),
                "std": round(float(np.std(vals)), 4),
                "p10": round(float(np.percentile(vals, 10)), 4),
                "median": round(float(np.median(vals)), 4),
                "p90": round(float(np.percentile(vals, 90)), 4),
            }
        )
    distribution = [
        {
            "industry": industry,
            "count": sum(e["industry"] == industry for e in sample),
            "default_rate": round(
                float(
                    np.mean([e["synthetic_default_next_year"] for e in sample if e["industry"] == industry])
                ),
                4,
            ),
        }
        for industry in sorted(set(e["industry"] for e in sample))
    ]
    report = {
        "seed": SEED,
        "cohort_seed": SEED + 1,
        "sample_size": len(sample),
        "train_n": len(train),
        "test_n": len(test),
        "default_rate": round(float(y.mean()), 4),
        "threshold": 0.5,
        "models": models,
        "auc_delta": round(models[1]["roc_auc"] - models[0]["roc_auc"], 4),
        "auc_delta_ci": [round(float(x), 4) for x in np.percentile(deltas, [2.5, 97.5])],
        "bootstrap_repetitions": len(deltas),
        "descriptives": descriptives,
        "distribution": distribution,
        "split": {
            "train_ids": [sample[i]["enterprise_id"] for i in train],
            "test_ids": [sample[i]["enterprise_id"] for i in test],
        },
        "limitations": "Synthetic-label experiment only. Tax/innovation effects are built into the assumed label DGP. Performance differences are not evidence of causal effects, lending validity or value in real bank data.",
        "protocol": "One fixed stratified 70/30 enterprise-level split; StandardScaler fit on training data only; identical test enterprises; fixed C=1 and threshold=0.5; no tuning on the test set. Ten-repeat held-out permutation importance and 500 paired bootstrap draws.",
    }
    return report, sample
