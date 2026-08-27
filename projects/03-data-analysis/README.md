# Case Study 03 - Remote AI Operations Data Analysis

## Decision

Which teams and weeks need intervention to protect quality, throughput and service-level performance?

## Deliverables

- `data/weekly_operations.csv` - 12 weeks across four synthetic teams
- `ai_operations_quality_dashboard.xlsx` - formula-driven workbook with source data, definitions, KPIs and native charts
- [Analysis memo](analysis.md) - findings, actions and limitations

## KPI definitions

| KPI | Formula | Why it matters |
|---|---|---|
| First-pass quality | accepted first pass / tasks completed | Indicates guideline clarity and reviewer accuracy |
| Rework rate | reworked / tasks completed | Measures avoidable operational load |
| SLA attainment | tasks completed within SLA / tasks completed | Shows delivery reliability |
| Productivity | tasks completed / hours worked | Supports staffing and capacity decisions |
| Capacity utilization | tasks completed / planned capacity | Identifies underuse and overload |

## Analytical discipline

The workbook separates raw inputs from derived metrics. KPI cells and charts reference worksheet formulas rather than copied presentation values. Synthetic data is explicitly labeled and uses a fixed random seed.

