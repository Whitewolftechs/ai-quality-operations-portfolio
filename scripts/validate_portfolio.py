#!/usr/bin/env python3
"""Validate portfolio datasets, links and reported quality metrics."""

from __future__ import annotations

import csv
import json
import math
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read_csv(relative_path: str) -> list[dict[str, str]]:
    path = ROOT / relative_path
    with path.open(newline="", encoding="utf-8") as stream:
        return list(csv.DictReader(stream))


def ratio(numerator: int | float, denominator: int | float) -> float:
    return 0.0 if denominator == 0 else numerator / denominator


def quadratic_weighted_kappa(a: list[int], b: list[int], low: int = 1, high: int = 4) -> float:
    if len(a) != len(b) or not a:
        raise ValueError("Rater arrays must be non-empty and equally sized")
    size = high - low + 1
    observed = [[0 for _ in range(size)] for _ in range(size)]
    hist_a = [0 for _ in range(size)]
    hist_b = [0 for _ in range(size)]
    for score_a, score_b in zip(a, b):
        i = score_a - low
        j = score_b - low
        observed[i][j] += 1
        hist_a[i] += 1
        hist_b[j] += 1
    total = len(a)
    observed_weighted = 0.0
    expected_weighted = 0.0
    for i in range(size):
        for j in range(size):
            weight = ((i - j) ** 2) / ((size - 1) ** 2)
            observed_weighted += weight * observed[i][j] / total
            expected_count = hist_a[i] * hist_b[j] / total
            expected_weighted += weight * expected_count / total
    if math.isclose(expected_weighted, 0.0):
        return 1.0 if math.isclose(observed_weighted, 0.0) else 0.0
    return 1.0 - observed_weighted / expected_weighted


def validate_markdown_links() -> list[str]:
    failures: list[str] = []
    link_pattern = re.compile(r"\[[^\]]+\]\(([^)]+)\)")
    for markdown in ROOT.rglob("*.md"):
        text = markdown.read_text(encoding="utf-8")
        for target in link_pattern.findall(text):
            if target.startswith(("http://", "https://", "mailto:", "#")):
                continue
            clean_target = target.split("#", 1)[0]
            resolved = (markdown.parent / clean_target).resolve()
            if not resolved.exists():
                failures.append(f"Broken link in {markdown.relative_to(ROOT)}: {target}")
    return failures


def main() -> int:
    failures: list[str] = []
    required_files = [
        "README.md",
        "SOURCES.md",
        "methodology/RESPONSIBLE_AI.md",
        "projects/01-prompt-engineering/data/prompt_evaluation_cases.csv",
        "projects/02-rubric-writing/data/double_rated_responses.csv",
        "projects/03-data-analysis/data/weekly_operations.csv",
        "projects/03-data-analysis/ai_operations_quality_dashboard.xlsx",
        "projects/04-business-operations/data/capacity_plan.csv",
        "projects/04-business-operations/data/risk_register.csv",
        "projects/05-data-annotation/data/network_incident_annotations.csv",
    ]
    for relative in required_files:
        if not (ROOT / relative).exists():
            failures.append(f"Missing required file: {relative}")

    prompt_rows = read_csv("projects/01-prompt-engineering/data/prompt_evaluation_cases.csv")
    if len(prompt_rows) != 20:
        failures.append(f"Prompt dataset expected 20 rows; found {len(prompt_rows)}")
    positive_pii = [row for row in prompt_rows if row["expected_pii"] == "YES"]
    prompt_metrics = {}
    for version in ("v1", "v2"):
        prompt_metrics[version] = {
            "category_accuracy": ratio(sum(row[f"{version}_category"] == row["expected_category"] for row in prompt_rows), len(prompt_rows)),
            "priority_accuracy": ratio(sum(row[f"{version}_priority"] == row["expected_priority"] for row in prompt_rows), len(prompt_rows)),
            "pii_recall": ratio(sum(row[f"{version}_pii"] == "YES" for row in positive_pii), len(positive_pii)),
            "schema_compliance": ratio(sum(row[f"{version}_schema_valid"] == "YES" for row in prompt_rows), len(prompt_rows)),
        }
    for metric in prompt_metrics["v1"]:
        if prompt_metrics["v2"][metric] <= prompt_metrics["v1"][metric]:
            failures.append(f"Prompt v2 did not improve {metric}")

    rubric_rows = read_csv("projects/02-rubric-writing/data/double_rated_responses.csv")
    dimensions = ["factuality", "safety", "instruction", "clarity", "tone"]
    weights = {"factuality": 0.30, "safety": 0.25, "instruction": 0.20, "clarity": 0.15, "tone": 0.10}
    dimension_kappa = {}
    total_pairs = 0
    exact_pairs = 0
    within_one_pairs = 0
    average_scores = {"rater_a": [], "rater_b": []}
    for dimension in dimensions:
        scores_a = [int(row[f"rater_a_{dimension}"]) for row in rubric_rows]
        scores_b = [int(row[f"rater_b_{dimension}"]) for row in rubric_rows]
        dimension_kappa[dimension] = quadratic_weighted_kappa(scores_a, scores_b)
        total_pairs += len(scores_a)
        exact_pairs += sum(a == b for a, b in zip(scores_a, scores_b))
        within_one_pairs += sum(abs(a - b) <= 1 for a, b in zip(scores_a, scores_b))
    for row in rubric_rows:
        for rater in ("rater_a", "rater_b"):
            normalized = sum(((int(row[f"{rater}_{d}"]) - 1) / 3) * weights[d] for d in dimensions)
            average_scores[rater].append(normalized)
    rubric_metrics = {
        "records": len(rubric_rows),
        "exact_agreement": ratio(exact_pairs, total_pairs),
        "within_one_agreement": ratio(within_one_pairs, total_pairs),
        "dimension_qwk": dimension_kappa,
        "mean_score_a": sum(average_scores["rater_a"]) / len(rubric_rows),
        "mean_score_b": sum(average_scores["rater_b"]) / len(rubric_rows),
    }
    if min(dimension_kappa.values()) < 0.70:
        failures.append(f"Rubric calibration below QWK threshold: {dimension_kappa}")

    operations = read_csv("projects/03-data-analysis/data/weekly_operations.csv")
    if len(operations) != 48:
        failures.append(f"Operations dataset expected 48 rows; found {len(operations)}")
    total_tasks = sum(int(row["tasks_completed"]) for row in operations)
    total_accepted = sum(int(row["accepted_first_pass"]) for row in operations)
    total_sla = sum(int(row["tasks_within_sla"]) for row in operations)
    total_hours = sum(int(row["hours_worked"]) for row in operations)
    total_reworked = sum(int(row["reworked"]) for row in operations)
    by_team: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
    for row in operations:
        team = row["team"]
        for field in ("tasks_completed", "accepted_first_pass", "tasks_within_sla", "hours_worked", "reworked"):
            by_team[team][field] += int(row[field])
    operations_metrics = {
        "rows": len(operations),
        "tasks": total_tasks,
        "first_pass_quality": ratio(total_accepted, total_tasks),
        "sla_attainment": ratio(total_sla, total_tasks),
        "rework_rate": ratio(total_reworked, total_tasks),
        "productivity_tasks_per_hour": ratio(total_tasks, total_hours),
        "teams": {
            team: {
                "first_pass_quality": ratio(values["accepted_first_pass"], values["tasks_completed"]),
                "sla_attainment": ratio(values["tasks_within_sla"], values["tasks_completed"]),
                "productivity_tasks_per_hour": ratio(values["tasks_completed"], values["hours_worked"]),
            }
            for team, values in sorted(by_team.items())
        },
    }

    capacity = read_csv("projects/04-business-operations/data/capacity_plan.csv")
    risks = read_csv("projects/04-business-operations/data/risk_register.csv")
    operations_control_metrics = {
        "capacity_weeks": len(capacity),
        "weeks_with_negative_gap": sum(float(row["staffing_gap_fte"]) < 0 for row in capacity),
        "risks": len(risks),
        "critical_impact_risks": sum(row["impact"] == "Critical" for row in risks),
    }

    annotations = read_csv("projects/05-data-annotation/data/network_incident_annotations.csv")
    if len(annotations) != 50:
        failures.append(f"Annotation dataset expected 50 rows; found {len(annotations)}")
    annotation_metrics = {
        "records": len(annotations),
        "category_agreement_a_b": ratio(sum(row["annotator_a_category"] == row["annotator_b_category"] for row in annotations), len(annotations)),
        "category_accuracy_a": ratio(sum(row["annotator_a_category"] == row["gold_category"] for row in annotations), len(annotations)),
        "category_accuracy_b": ratio(sum(row["annotator_b_category"] == row["gold_category"] for row in annotations), len(annotations)),
        "severity_agreement_a_b": ratio(sum(row["annotator_a_severity"] == row["annotator_b_severity"] for row in annotations), len(annotations)),
        "pii_positive_records": sum(row["gold_pii"] == "YES" for row in annotations),
    }

    failures.extend(validate_markdown_links())

    report = {
        "portfolio_version": "1.0.1",
        "synthetic_data_only": True,
        "prompt_engineering": prompt_metrics,
        "rubric_writing": rubric_metrics,
        "data_analysis": operations_metrics,
        "business_operations": operations_control_metrics,
        "data_annotation": annotation_metrics,
        "status": "PASS" if not failures else "FAIL",
        "failures": failures,
    }
    (ROOT / "validation_report.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))
    if failures:
        print(f"\nFAILED with {len(failures)} issue(s).", file=sys.stderr)
        return 1
    print("\nPASS - all portfolio checks completed successfully.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
