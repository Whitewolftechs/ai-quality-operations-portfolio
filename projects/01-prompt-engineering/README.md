# Case Study 01 - Prompt Engineering for Support-Ticket Triage

## Decision

Can a structured prompt classify remote IT support requests accurately while protecting personal data and escalating uncertainty?

## Why this resembles real work

Remote AI-data programs frequently require prompt design, response evaluation, error analysis and guideline refinement. This case study applies those tasks to a domain grounded in Jesse Tabler's network-administration background.

## Deliverables

- [Production-style prompt specification](prompt_specification.md)
- [Twenty synthetic evaluation cases](data/prompt_evaluation_cases.csv)
- Automated comparison of prompt version 1 and version 2
- Error taxonomy covering wrong intent, wrong urgency, missed PII, invalid schema and unsafe overconfidence

## Output contract

Each ticket must produce five fields:

```json
{
  "category": "ACCESS|CONNECTIVITY|SECURITY|HARDWARE|SOFTWARE|REQUEST",
  "priority": "P1|P2|P3|P4",
  "pii_detected": true,
  "route": "security|network|service_desk|identity|applications",
  "needs_human_review": false
}
```

## Evaluation design

The gold labels were written before the two prompt-output columns were scored. Version 1 represents a brief instruction. Version 2 adds an ontology, conflict rules, PII handling, a strict schema and a human-review rule.

Metrics:

- category accuracy;
- priority accuracy;
- PII recall on positive cases;
- JSON/schema compliance.

## Results

| Metric | Version 1 | Version 2 | Change |
|---|---:|---:|---:|
| Category accuracy | 75% | 95% | +20 percentage points |
| Priority accuracy | 70% | 90% | +20 percentage points |
| PII recall | 50% | 100% | +50 percentage points |
| Schema compliance | 80% | 100% | +20 percentage points |

Version 2 improved all four predeclared measures on the fixed 20-case set. The largest gain came from an explicit PII rule; ontology boundaries, conflict rules and a strict output contract addressed the remaining failures. Run `python3 scripts/validate_portfolio.py` from the repository root to reproduce the figures.

## Limitations

The outputs are portfolio demonstration outputs, not benchmark results from a named commercial model. Twenty cases are enough to expose design differences but not to estimate production performance.
