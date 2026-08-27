# Network-Incident Annotation Guidelines

## Unit of annotation

One short support record. Annotate the immediate operational intent, not every technology noun mentioned.

## Category rules

| Label | Include | Exclude |
|---|---|---|
| ACCESS | login, MFA, permissions, account lockout | new-access request without a fault -> REQUEST |
| CONNECTIVITY | Wi-Fi, wired network, VPN, DNS, routing, latency | suspected interception or compromise -> SECURITY |
| SECURITY | phishing, malware, exposed credentials, unauthorized access | ordinary password reset -> ACCESS |
| HARDWARE | failed device, cable, port, battery, drive or peripheral | network reachability alone -> CONNECTIVITY |
| SOFTWARE | application crash, update, install or configuration fault | request for new software -> REQUEST |
| REQUEST | new access, device, software, report or planned service | existing service failure -> incident category |

## Precedence

1. SECURITY overrides all categories when compromise is credible.
2. REQUEST overrides technology nouns when the service does not yet exist.
3. Label the first actionable failure when two non-security incidents are chained.
4. Use an edge-case note when the record lacks evidence needed to distinguish two labels.

## Severity

- **S1:** active widespread outage, confirmed compromise or critical service unavailable without workaround.
- **S2:** major team impact, credible security event or critical individual without workaround.
- **S3:** limited incident, ordinary user impact or workaround available.
- **S4:** informational, planned or low-impact request.

## Privacy

Use `YES` for the PII field when personal data or credentials appear, even as a placeholder. Never copy the sensitive value into a note. Synthetic examples use bracketed placeholders such as `[USER_EMAIL]` and `[TOKEN]`.

