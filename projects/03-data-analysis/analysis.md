# Operations Analysis Memo

## Executive finding

The 12-week synthetic dataset contains 88,338 completed tasks across four teams. Portfolio-wide first-pass quality was 93.9%, SLA attainment was 95.1%, rework was 5.1%, and productivity was 7.61 tasks per hour. The Excel dashboard provides formula-driven team and week-level detail; `scripts/validate_portfolio.py` independently recalculates the results.

## Team findings

| Team | First-pass quality | SLA attainment | Tasks/hour | Interpretation |
|---|---:|---:|---:|---|
| US English | 94.8% | 96.2% | 8.51 | Strongest productivity while maintaining quality and SLA |
| Spanish | 93.2% | 94.9% | 7.68 | Stable middle performer; monitor rather than intervene |
| Technical | 95.8% | 95.7% | 6.60 | Highest quality with lower throughput, consistent with higher task complexity |
| General QA | 90.7% | 92.6% | 6.90 | Lowest quality and SLA; first candidate for targeted calibration |

The data supports a targeted General QA review, not a portfolio-wide process change. The Technical team should be examined for case-mix complexity before any productivity target is adjusted.

## Decision rules

- Investigate first-pass quality below 90%.
- Investigate SLA attainment below 92%.
- Review staffing when capacity utilization exceeds 105% for two consecutive weeks.
- Review guidelines when rework rises while handling time also rises.
- Escalate a security or privacy exception immediately, regardless of aggregate KPI performance.

## Recommended operating actions

1. Calibrate the lowest-quality team using ten blinded records and a documented disagreement review.
2. Separate guideline defects from individual performance before assigning retraining.
3. Shift work only after checking domain and locale eligibility.
4. Track actions against the following two weekly periods and close them only when the KPI recovers.

## Limitations

The dataset is designed to demonstrate analysis, not forecast a real RWS program. It excludes worker-level productivity to avoid encouraging decisions based on a small synthetic sample.
