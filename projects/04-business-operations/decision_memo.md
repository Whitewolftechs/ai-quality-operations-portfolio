# Decision Memo - Pilot-to-Production Readiness

## Recommendation

Use a gated eight-week ramp rather than opening full production capacity on day one. Staffing should follow forecast workload and measured handling time, while quality gates remain independent of volume targets.

## Rationale

1. Early throughput estimates are unreliable until reviewers complete a representative pilot.
2. Annotation instructions improve when real disagreements are converted into explicit edge-case rules.
3. Capacity buffers protect the quality team from becoming the bottleneck during demand increases.
4. A documented stop rule prevents delivery pressure from normalizing privacy or safety failures.

## Approval conditions

- calibration sample at or above 90% label agreement;
- zero unresolved privacy/security hard fails;
- required staffing gap no greater than one FTE-equivalent for the first two production weeks;
- daily exception owner and weekly client-report owner assigned;
- rollback and business-continuity contacts confirmed.

