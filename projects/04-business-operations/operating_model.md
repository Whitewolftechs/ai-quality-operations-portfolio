# Remote AI-Data Operating Model

| Phase | Required input | Core control | Exit criterion | Owner |
|---|---|---|---|---|
| 1. Intake | Business objective, data type, locale, risk level | Scope and privacy review | Approved project brief | Operations lead |
| 2. Guideline design | Label ontology, examples, exclusions | Edge-case table and version control | Reviewers can explain rules consistently | Quality lead |
| 3. Pilot | Representative sample | Blinded double annotation | Quality and agreement thresholds pass | Project lead |
| 4. Calibration | Disagreement set | Root-cause review, not majority vote alone | Adjudicated rules published | Quality lead |
| 5. Production | Approved guidelines and trained team | Sampling, exception queue and access control | Daily acceptance checks pass | Team lead |
| 6. Quality review | Production sample and metrics | Multi-stage review and error taxonomy | Corrective actions assigned | Quality analyst |
| 7. Reporting | Throughput, quality, AHT, SLA and staffing | Definitions locked to source fields | Client-ready weekly report | Operations analyst |
| 8. Change control | New requirement or discovered edge case | Impact assessment and versioned release | Training and tools updated | Project owner |

## Escalation rules

- **Immediate:** suspected personal-data exposure, active security issue or instruction enabling harm.
- **Same shift:** undefined high-volume edge case, tooling defect or quality below the stop threshold.
- **Within one business day:** capacity gap, repeated reviewer disagreement or non-critical client clarification.

## Quality stop rule

Pause the affected workstream when a daily audited sample falls below 85% first-pass quality or when a hard-fail privacy/security error is confirmed. Resume only after the root cause, containment and re-calibration are documented.

