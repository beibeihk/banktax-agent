# Reproducible research protocol

## Question and estimand

Do tax and innovation features add predictive information beyond conventional financial features **in the disclosed synthetic data-generating process**? The target is the difference in held-out predictive performance between two fixed models on the same enterprises. No causal estimand or real-world lending validity is claimed.

## Cohorts and units

- Portfolio: 80 fictional enterprises × FY2022–2025, seed `20261003`, curated cases included.
- Research: 1,600 independently generated enterprises, seed `20261004`, curated cases disabled. The model uses the final FY2025 snapshot.
- Units: monetary values in RMB millions; ratios as fractions; outcomes are simulated following-year events.
- Distinct `P-` and `R-` identifiers prevent portfolio/train/test overlap. Research-company names may repeat; IDs are canonical.

## Label DGP

Let `p = sigmoid(z)` and draw `Y ~ Bernoulli(p)` once per enterprise, using the seeded generator:

```text
z = −1.5
    + 3.0 × (liabilities/assets − 0.5)
    − 5.0 × operating_cash_flow/revenue
    − 3.0 × book_profit/revenue
    + 2.0 × loan_balance/assets
    + 3.0 × |VAT_sales − revenue|/revenue
    + 1.3 × (1 − tax_credit_quality)
    − 2.0 × R&D/revenue
    − 0.1 × log(1 + patent_count)
```

Tax-credit encoding: A=1, B=.75, M=.5, C=.25, D=0. This is an illustrative ordinal engineering choice, not a validated economic ordering. All coefficients and the prevalence are synthetic assumptions. Bernoulli noise prevents deterministic labels. Neither `Y` nor `p` is a model feature; `p` is not exported as a predictor.

## Models

| Model | Features |
|---|---|
| A | Leverage, profit margin, cash-flow/revenue, revenue growth, loan/assets, log(1+revenue) |
| B | All A features, plus absolute revenue–VAT gap, cash-tax burden, tax-credit encoding, R&D intensity, R&D staff ratio, log(1+patents), synthetic high-tech flag |

Fixed stratified random enterprise split: 70% training, 30% test; `random_state=20261003`. Each enterprise enters once. Identical holdout IDs are used for A and B. `StandardScaler` is fit only on training data inside a scikit-learn pipeline. Both use logistic regression, `C=1`, `max_iter=2000`, no class weighting and threshold `.5`. No hyperparameter or threshold selection is performed on the test set.

## Reported outputs

- ROC-AUC, precision, recall, F1 and Brier score on 480 held-out firms.
- Confusion matrices: rows = observed [0,1], columns = predicted [0,1].
- Calibration: six quantile bins; plotted at each model's own mean predicted probability.
- Ten-repeat held-out permutation importance, measured as AUC decrease. Negative values, standard deviations and standardized logistic coefficients are retained.
- 500 paired bootstrap holdout resamples estimate an AUC-difference percentile interval. This quantifies within-DGP sampling variation conditional on fitted models; it is not retraining uncertainty.
- Feature mean, SD (population convention), P10, median and P90; industry sample counts and simulated event prevalence.

## Interpretation limits

Tax and innovation variables enter the DGP by assumption, so an augmented-model advantage partly reflects that design. A single split and generator cannot establish transportability, causal effects, economic returns, real default probabilities or bank-policy value. Correlated features complicate permutation-importance interpretation. A `.5` threshold is pedagogical, not chosen for bank costs or class prevalence. The AUC interval does not account for model-selection or DGP uncertainty.

Before real research use, replace the simulated outcome with an authorized, prospectively defined label, audit leakage and timing, validate across time and institutions, estimate uncertainty under the sampling design, evaluate calibration and decision costs, and assess fairness and appropriate governance.

Run `python -m backend.pipeline` to regenerate all model metrics. The public UI displays those artifact values directly. The complete split and metrics are in `evals/results/model-comparison.json`.
