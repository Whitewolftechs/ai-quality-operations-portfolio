# Case Study 05 - Network-Incident Data Annotation

## Decision

Can short network-support records be labeled consistently enough for search, routing or model-training use?

## Deliverables

- [Annotation guidelines](annotation_guidelines.md)
- `data/network_incident_annotations.csv` with 50 synthetic records
- two independent annotation columns;
- adjudicated gold category and documented edge cases;
- agreement and category-accuracy calculations.

## Label set

`ACCESS`, `CONNECTIVITY`, `SECURITY`, `HARDWARE`, `SOFTWARE`, `REQUEST`

Severity uses `S1` through `S4`, where S1 is an active widespread outage or compromise and S4 is a low-impact request.

## Quality workflow

1. Annotators review the record independently.
2. A script calculates exact agreement.
3. Disagreements are grouped by confusion pair.
4. An adjudicator applies the written rules and records an edge-case note.
5. Guidelines are revised only when the rule, not the annotator, caused ambiguity.

## Results

On the 50-record synthetic set, annotators agreed on category for 84% of records and severity for 94%. Against the adjudicated gold labels, category accuracy was 90% for annotator A and 86% for annotator B. Three records contained intentionally planted PII indicators, allowing privacy-handling rules to be tested alongside label quality.

The agreement gap is treated as a workflow signal: disagreements should be grouped by confusion pair and resolved through guideline changes or calibration, not hidden by a single aggregate accuracy number.

## Limitations

The dataset is synthetic, English-only and intentionally compact. It demonstrates a labeling process; it is not a production training dataset.
