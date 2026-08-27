# Case Study 02 - Rubric Writing and Reviewer Calibration

## Decision

Can a behavioral rubric make AI-response quality judgments more consistent between remote reviewers?

## Deliverables

- [Weighted quality rubric with anchored score levels](rubric.md)
- [Double-rated synthetic review set](data/double_rated_responses.csv)
- Exact agreement, within-one agreement and quadratic weighted kappa
- Calibration and escalation rules

## Design principles

The rubric avoids vague labels such as “good” and “poor.” Each score is tied to observable behavior. Safety/privacy and factuality carry the highest weights because a fluent response can still be harmful or wrong.

## Reviewer workflow

1. Read the user request and candidate response independently.
2. Apply hard-fail rules before numerical scoring.
3. Score each dimension from 1 to 4 using the anchors.
4. Add evidence for scores of 1 or 4.
5. Escalate policy ambiguity instead of inventing a rule.
6. Calibrate when exact agreement or weighted kappa falls below the agreed threshold.

## Results

Across 18 responses and five dimensions, the two synthetic review passes achieved 85.6% exact agreement and 100% agreement within one score point. Quadratic weighted kappa met the 0.70 calibration threshold for every dimension:

| Dimension | Quadratic weighted kappa |
|---|---:|
| Factuality | 0.920 |
| Safety/privacy | 1.000 |
| Instruction following | 0.834 |
| Clarity | 0.717 |
| Tone | 0.880 |

Clarity is the priority calibration dimension because its 0.717 score is closest to the stop-and-review threshold. The calculation is reproducible in `scripts/validate_portfolio.py`.

## Limitations

The double-rated data is synthetic and demonstrates the calculation workflow. It does not establish reviewer reliability for a live program. A production calibration would use real task instructions, blinded review and a larger sample.
