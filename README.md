# Jesse Tabler | AI Quality, Data and Business Operations

[![Portfolio quality checks](https://github.com/Whitewolftechs/ai-quality-operations-portfolio/actions/workflows/portfolio-quality.yml/badge.svg)](https://github.com/Whitewolftechs/ai-quality-operations-portfolio/actions/workflows/portfolio-quality.yml)

**Prompt design · Evaluation rubrics · Data annotation · Operational analytics · Technical documentation**

I am a network administrator building a focused practice at the intersection of reliable systems, AI data quality and remote operations. My technical background has trained me to investigate ambiguous issues, follow controlled procedures, document decisions, protect sensitive information and verify work before release.

This portfolio contains original demonstration projects built with synthetic, privacy-safe data. It shows how I approach the work; it does not present the samples as paid client engagements or claim an academic degree I have not earned.

## Current professional foundation

- Network Administrator, City of Bartlesville - April 2026 to present
- IT Networking Systems, Tulsa Technology Center - expected completion 2028
- Technical Diploma, Afton High School
- Working strengths: incident triage, network and server support, security-minded documentation, end-user support, quality control and cross-functional communication

## Portfolio map

| Case study | Business question | Evidence in the repository |
|---|---|---|
| [01. Prompt engineering](projects/01-prompt-engineering/README.md) | Can a support-triage prompt produce safer, more consistent structured decisions? | Versioned prompt, 20-case evaluation set, error taxonomy and v1-v2 comparison |
| [02. Rubric writing](projects/02-rubric-writing/README.md) | Can two reviewers apply the same quality standard consistently? | Weighted rubric, anchored score levels, double-rated sample and reliability analysis |
| [03. Data analysis](projects/03-data-analysis/README.md) | Which teams and weeks require operational intervention? | Formula-driven Excel dashboard, 12-week dataset, KPI definitions and decision findings |
| [04. Business operations](projects/04-business-operations/README.md) | How should a remote AI-data program scale without losing quality? | Operating model, capacity plan, risk register, escalation rules and decision memo |
| [05. Data annotation](projects/05-data-annotation/README.md) | Can network incidents be labeled accurately and consistently? | 50-record synthetic dataset, ontology, edge cases, dual annotations and adjudication |

## Reproducible evidence snapshot

| Workstream | Measured result |
|---|---|
| Prompt engineering | v2 improved category accuracy from 75% to 95%, priority accuracy from 70% to 90%, PII recall from 50% to 100%, and schema compliance from 80% to 100% |
| Rubric writing | 85.6% exact agreement, 100% within-one agreement, and dimension-level quadratic weighted kappa from 0.717 to 1.000 |
| Data analysis | 88,338 synthetic tasks analyzed; 93.9% first-pass quality, 95.1% SLA attainment, and 7.61 tasks per hour |
| Business operations | Eight-week capacity model identified a staffing shortfall in every modeled week; risk register includes two critical-impact controls |
| Data annotation | 84% inter-annotator category agreement, 90%/86% annotator accuracy, and 94% severity agreement across 50 records |

All figures are recalculated by `scripts/validate_portfolio.py`; none are manually asserted production outcomes.

## Quality standard

Every case study follows the same evidence chain:

1. Define the decision and the user.
2. State the label, score or KPI rules before reviewing results.
3. Separate inputs, assumptions and derived measures.
4. Test edge cases and record disagreements.
5. Report limitations and avoid claims the evidence cannot support.
6. Keep all examples synthetic and free of confidential employer or client data.

## Reproduce the checks

The repository uses only Python's standard library for validation.

```bash
python3 scripts/validate_portfolio.py
```

To regenerate the synthetic datasets:

```bash
node scripts/generate_synthetic_data.mjs
python3 scripts/validate_portfolio.py
```

## Responsible-use note

The examples demonstrate workflow design and analytical judgment. They do not expose production prompts, proprietary guidelines, personal information or confidential employment records. See [Methodology and Responsible AI](methodology/RESPONSIBLE_AI.md).

## Sources and scope

The project architecture reflects current public guidance from RWS, NIST and GitHub. Exact sources and the August 27, 2026 review date are listed in [SOURCES.md](SOURCES.md).

---

**Availability:** Remote AI quality, data operations, business operations and technical evaluation projects.
