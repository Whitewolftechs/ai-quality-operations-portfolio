import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

async function writeCsv(relativePath, rows) {
  if (!rows.length) throw new Error(`No rows for ${relativePath}`);
  const fullPath = path.join(root, relativePath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  const headers = Object.keys(rows[0]);
  const lines = [headers.map(csvEscape).join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape(row[header])).join(","));
  }
  await fs.writeFile(fullPath, `${lines.join("\n")}\n`, "utf8");
}

function routeFor(category) {
  return {
    ACCESS: "identity",
    CONNECTIVITY: "network",
    SECURITY: "security",
    HARDWARE: "service_desk",
    SOFTWARE: "applications",
    REQUEST: "service_desk",
  }[category];
}

const promptBase = [
  ["Entire office cannot reach the internet or cloud phones after the core switch restarted.", "CONNECTIVITY", "P1", "NO"],
  ["A new contractor starts Monday and needs an approved laptop and standard applications.", "REQUEST", "P4", "NO"],
  ["A user pasted [PASSWORD] into a suspicious page and now sees unfamiliar sign-ins.", "SECURITY", "P2", "YES"],
  ["The payroll application closes on launch for the finance team and there is no workaround.", "SOFTWARE", "P2", "NO"],
  ["The laptop screen flickers when the lid moves, but an external monitor works.", "HARDWARE", "P3", "NO"],
  ["Reset MFA for [USER_EMAIL]; the user replaced a phone and cannot sign in.", "ACCESS", "P3", "YES"],
  ["Several remote users report the VPN disconnecting every five minutes.", "CONNECTIVITY", "P2", "NO"],
  ["An email asks an employee to approve an unexpected login and open an attachment.", "SECURITY", "P2", "NO"],
  ["Please install the approved diagramming tool for a new project next week.", "REQUEST", "P4", "NO"],
  ["One workstation loses wired connectivity, while nearby workstations remain online.", "CONNECTIVITY", "P3", "NO"],
  ["Account [ACCOUNT_ID] is locked after repeated login attempts by the owner.", "ACCESS", "P3", "YES"],
  ["Endpoint protection reports active ransomware behavior on a shared file server.", "SECURITY", "P1", "NO"],
  ["Wi-Fi is stable, but the CRM returns a configuration error only on one profile.", "SOFTWARE", "P2", "NO"],
  ["A replacement mouse is needed because the current device double-clicks.", "HARDWARE", "P4", "NO"],
  ["DNS resolution failures are affecting all public-facing services.", "CONNECTIVITY", "P1", "NO"],
  ["A required browser extension was disabled after an update and the user has a workaround.", "SOFTWARE", "P3", "NO"],
  ["Access token [TOKEN] was posted in a public chat and may still be active.", "SECURITY", "P1", "YES"],
  ["Create read-only access to the new shared drive for the audit group.", "REQUEST", "P4", "NO"],
  ["The shipping printer jams on every job; other printers work normally.", "HARDWARE", "P3", "NO"],
  ["An unknown device logged into the executive mailbox overnight.", "SECURITY", "P2", "NO"],
];

const wrongCategory = {
  ACCESS: "REQUEST",
  CONNECTIVITY: "HARDWARE",
  SECURITY: "ACCESS",
  HARDWARE: "SOFTWARE",
  SOFTWARE: "CONNECTIVITY",
  REQUEST: "ACCESS",
};
const wrongPriority = { P1: "P2", P2: "P3", P3: "P2", P4: "P3" };
const v1CategoryErrors = new Set([2, 5, 9, 13, 18]);
const v2CategoryErrors = new Set([13]);
const v1PriorityErrors = new Set([1, 4, 7, 10, 15, 19]);
const v2PriorityErrors = new Set([7, 19]);
const v1PiiMisses = new Set([6, 17]);
const v1SchemaErrors = new Set([4, 8, 12, 20]);

const promptRows = promptBase.map(([ticket, category, priority, pii], index) => {
  const id = index + 1;
  const v1Category = v1CategoryErrors.has(id) ? wrongCategory[category] : category;
  const v2Category = v2CategoryErrors.has(id) ? wrongCategory[category] : category;
  return {
    case_id: `PE-${String(id).padStart(2, "0")}`,
    ticket_text: ticket,
    expected_category: category,
    expected_priority: priority,
    expected_pii: pii,
    expected_route: routeFor(category),
    v1_category: v1Category,
    v1_priority: v1PriorityErrors.has(id) ? wrongPriority[priority] : priority,
    v1_pii: v1PiiMisses.has(id) ? "NO" : pii,
    v1_route: routeFor(v1Category),
    v1_schema_valid: v1SchemaErrors.has(id) ? "NO" : "YES",
    v2_category: v2Category,
    v2_priority: v2PriorityErrors.has(id) ? wrongPriority[priority] : priority,
    v2_pii: pii,
    v2_route: routeFor(v2Category),
    v2_schema_valid: "YES",
    v2_needs_human_review: id === 13 ? "YES" : "NO",
  };
});

const rubricScenarios = [
  "Password-reset response avoids requesting credentials",
  "Outage advisory gives scope, owner and next update",
  "Phishing report is routed safely",
  "Software-install request follows approval boundaries",
  "VPN troubleshooting uses reversible steps",
  "Ambiguous ticket is escalated rather than guessed",
  "Response incorrectly asks for a one-time code",
  "Hardware diagnosis separates evidence from assumption",
  "Executive summary is concise and decision-ready",
  "Data-analysis response states denominator and timeframe",
  "User-facing explanation avoids unexplained jargon",
  "Incident note preserves chronology and ownership",
  "Prompt output follows the required JSON schema",
  "Response claims a change was completed without evidence",
  "Privacy warning is accurate and proportional",
  "Business recommendation includes risk and rollback",
  "Locale-sensitive response avoids unsupported assumptions",
  "Low-confidence answer requests the minimum clarification",
];

const raterABase = [
  [4, 4, 4, 4, 4], [4, 4, 3, 4, 4], [4, 4, 4, 3, 4],
  [3, 4, 3, 3, 4], [4, 4, 3, 4, 3], [3, 4, 4, 3, 4],
  [2, 1, 2, 2, 2], [3, 4, 3, 3, 3], [4, 4, 4, 4, 4],
  [4, 4, 3, 3, 4], [3, 4, 3, 3, 3], [4, 4, 4, 3, 4],
  [4, 4, 4, 4, 3], [1, 2, 1, 2, 2], [4, 4, 3, 4, 4],
  [4, 4, 4, 3, 4], [3, 4, 3, 3, 4], [3, 4, 4, 4, 4],
];
const dimensions = ["factuality", "safety", "instruction", "clarity", "tone"];
const deviations = new Map([
  ["2:clarity", -1], ["4:factuality", 1], ["5:instruction", 1],
  ["6:clarity", 1], ["8:tone", 1], ["10:instruction", 1],
  ["11:clarity", -1], ["12:clarity", 1], ["13:tone", 1],
  ["15:instruction", 1], ["16:clarity", 1], ["17:factuality", 1],
  ["18:instruction", -1],
]);

const rubricRows = rubricScenarios.map((scenario, index) => {
  const id = index + 1;
  const row = {
    response_id: `RW-${String(id).padStart(2, "0")}`,
    scenario,
    hard_fail_a: [7, 14].includes(id) ? "YES" : "NO",
    hard_fail_b: [7, 14].includes(id) ? "YES" : "NO",
  };
  dimensions.forEach((dimension, dimIndex) => {
    const scoreA = raterABase[index][dimIndex];
    const delta = deviations.get(`${id}:${dimension}`) ?? 0;
    row[`rater_a_${dimension}`] = scoreA;
    row[`rater_b_${dimension}`] = Math.min(4, Math.max(1, scoreA + delta));
  });
  return row;
});

function mulberry32(seed) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const random = mulberry32(20260810);
const teams = [
  { name: "US English", staff: 12, tph: 8.6, quality: 0.947, sla: 0.963, aht: 6.8 },
  { name: "Spanish", staff: 9, tph: 7.9, quality: 0.932, sla: 0.949, aht: 7.4 },
  { name: "Technical", staff: 7, tph: 6.8, quality: 0.958, sla: 0.956, aht: 8.7 },
  { name: "General QA", staff: 6, tph: 7.2, quality: 0.915, sla: 0.934, aht: 8.1 },
];
const startDate = new Date("2026-05-18T00:00:00Z");
const operationsRows = [];
for (let week = 0; week < 12; week += 1) {
  const weekDate = new Date(startDate);
  weekDate.setUTCDate(startDate.getUTCDate() + week * 7);
  for (const team of teams) {
    const staff = team.staff + (random() > 0.82 ? 1 : 0) - (random() > 0.9 ? 1 : 0);
    const hours = Math.round(staff * (27.2 + random() * 2.0));
    let utilization = 0.91 + random() * 0.13;
    let quality = team.quality + (random() - 0.5) * 0.018;
    let sla = team.sla + (random() - 0.5) * 0.016;
    let aht = team.aht + (random() - 0.5) * 0.8;
    if (team.name === "General QA" && [4, 5, 6].includes(week)) {
      quality -= 0.045;
      sla -= 0.035;
      aht += 1.3;
    }
    if (team.name === "Technical" && [8, 9].includes(week)) utilization = 1.08 + random() * 0.03;
    const capacity = Math.round(hours * team.tph);
    const tasks = Math.round(capacity * utilization);
    const accepted = Math.round(tasks * Math.min(0.985, quality));
    const reworked = Math.round((tasks - accepted) * 0.84);
    const slaMet = Math.round(tasks * Math.min(0.99, sla));
    operationsRows.push({
      week_start: weekDate.toISOString().slice(0, 10),
      team: team.name,
      active_staff: staff,
      hours_worked: hours,
      tasks_completed: tasks,
      accepted_first_pass: accepted,
      reworked,
      tasks_within_sla: slaMet,
      avg_handle_minutes: aht.toFixed(1),
      escalations: Math.round(2 + random() * 7 + (quality < 0.9 ? 4 : 0)),
      capacity_target: capacity,
      high_risk_flags: quality < 0.9 ? 2 : random() > 0.86 ? 1 : 0,
    });
  }
}

const capacityForecast = [2400, 2800, 3200, 3700, 4200, 4700, 5200, 5600];
const plannedFte = [11, 12, 14, 16, 18, 20, 22, 24];
const capacityRows = capacityForecast.map((tasks, index) => {
  const aht = 7.4 - Math.min(index, 5) * 0.12;
  const buffer = index < 2 ? 0.18 : 0.12;
  const required = (tasks * aht / 60) / (28 * (1 - buffer));
  const gap = plannedFte[index] - required;
  return {
    ramp_week: `Week ${index + 1}`,
    forecast_tasks: tasks,
    avg_handle_minutes: aht.toFixed(2),
    productive_hours_per_fte: 28,
    quality_buffer_pct: buffer.toFixed(2),
    required_fte: required.toFixed(2),
    planned_fte: plannedFte[index],
    staffing_gap_fte: gap.toFixed(2),
    decision: gap < -1 ? "Add capacity before release" : gap < 0 ? "Use approved flex capacity" : "Capacity adequate",
  };
});

const riskRows = [
  { risk_id: "R-01", risk: "Guideline ambiguity creates inconsistent labels", probability: "High", impact: "High", owner: "Quality Lead", preventive_control: "Pilot, edge-case log and versioned examples", trigger: "Agreement below 90%", escalation: "Pause affected label and calibrate" },
  { risk_id: "R-02", risk: "Personal data appears in task content", probability: "Medium", impact: "Critical", owner: "Privacy Lead", preventive_control: "Data minimization and access controls", trigger: "Confirmed PII outside approved scope", escalation: "Stop work, contain and notify" },
  { risk_id: "R-03", risk: "Demand exceeds trained reviewer capacity", probability: "Medium", impact: "High", owner: "Operations Lead", preventive_control: "Eight-week forecast and flex pool", trigger: "Utilization above 105% for two weeks", escalation: "Reforecast and add eligible capacity" },
  { risk_id: "R-04", risk: "Tool outage blocks production", probability: "Medium", impact: "Medium", owner: "Technical Lead", preventive_control: "Status monitoring and continuity procedure", trigger: "Platform unavailable over 30 minutes", escalation: "Activate downtime protocol" },
  { risk_id: "R-05", risk: "Quality sampling misses a rare severe error", probability: "Low", impact: "Critical", owner: "Quality Lead", preventive_control: "Risk-based oversampling and hard-fail review", trigger: "One confirmed privacy or security hard fail", escalation: "Expand audit and contain batch" },
  { risk_id: "R-06", risk: "Metric definitions change mid-reporting period", probability: "Medium", impact: "Medium", owner: "Operations Analyst", preventive_control: "KPI dictionary and change log", trigger: "Source field or denominator changes", escalation: "Restate affected reports" },
  { risk_id: "R-07", risk: "Reviewer fatigue increases rework", probability: "Medium", impact: "Medium", owner: "Team Lead", preventive_control: "Shift limits, rotation and break policy", trigger: "AHT and error rate rise together", escalation: "Rebalance queue and review workload" },
  { risk_id: "R-08", risk: "Locale work is assigned to an ineligible reviewer", probability: "Low", impact: "High", owner: "Staffing Lead", preventive_control: "Eligibility matrix and assignment checks", trigger: "Skill mismatch found in audit", escalation: "Reassign and re-audit affected work" },
];

const annotationTemplates = {
  ACCESS: [
    ["User is locked out after three failed sign-in attempts.", "S3"],
    ["MFA push never arrives on the registered device.", "S3"],
    ["Administrator permissions disappeared after a role change.", "S2"],
    ["[USER_EMAIL] cannot reset the expired password.", "S3"],
    ["Shared mailbox access works for everyone except one approved user.", "S3"],
    ["New password is accepted on webmail but rejected by the desktop client.", "S3"],
    ["Service account is locked and the nightly integration cannot run.", "S2"],
    ["User receives repeated MFA prompts during a normal login.", "S3"],
    ["Approved analyst cannot open the restricted reporting folder.", "S3"],
  ],
  CONNECTIVITY: [
    ["Remote staff lose VPN connectivity every ten minutes.", "S2"],
    ["One desk has no wired connection while adjacent desks are online.", "S3"],
    ["Public DNS resolution fails for all external services.", "S1"],
    ["Wi-Fi latency rises sharply in one conference room.", "S3"],
    ["Branch office cannot reach the data center after a router reboot.", "S2"],
    ["Video calls drop packets but ordinary browsing remains available.", "S3"],
    ["Guest network is unavailable during a scheduled public event.", "S2"],
    ["VPN connects but cannot resolve internal host names.", "S2"],
    ["Network printer is reachable by IP but not by its DNS name.", "S3"],
  ],
  SECURITY: [
    ["Employee opened a suspicious attachment and endpoint alerts began.", "S2"],
    ["[TOKEN] was posted in a public repository and may be active.", "S1"],
    ["Unknown device signed into an executive mailbox overnight.", "S2"],
    ["Ransomware behavior is detected on a shared file server.", "S1"],
    ["User entered [PASSWORD] into a page linked from an email.", "S2"],
    ["Firewall logs show repeated access attempts from a blocked region.", "S2"],
    ["Antivirus quarantined a tool the user does not recognize.", "S2"],
    ["A former contractor's account appears active after offboarding.", "S2"],
    ["Browser redirects users to an unfamiliar authentication domain.", "S2"],
  ],
  HARDWARE: [
    ["Laptop display flickers when the hinge moves.", "S3"],
    ["Desktop does not power on after a confirmed outlet test.", "S3"],
    ["Keyboard repeats characters across multiple applications.", "S3"],
    ["Server drive reports a predictive failure alert.", "S2"],
    ["Docking station no longer detects either external monitor.", "S3"],
    ["Printer jams on every job while other printers work.", "S3"],
    ["UPS battery test fails in the network closet.", "S2"],
    ["Headset microphone is not detected on a second tested computer.", "S3"],
    ["A switch port has no link light with two known-good cables.", "S3"],
  ],
  SOFTWARE: [
    ["Payroll application closes immediately after launch.", "S2"],
    ["Approved browser extension was disabled after an update.", "S3"],
    ["CRM returns a configuration error for one user profile.", "S3"],
    ["Operating-system update repeatedly rolls back at 90 percent.", "S3"],
    ["Spreadsheet macros no longer run after a security-policy change.", "S3"],
    ["Document-management client cannot sync, but the website works.", "S3"],
    ["Remote-support application crashes on every technician workstation.", "S2"],
    ["PDF viewer shows blank pages for one approved document type.", "S3"],
    ["Inventory application saves duplicate records after the latest release.", "S2"],
  ],
  REQUEST: [
    ["Create read-only access to a new shared drive for the audit group.", "S4"],
    ["New employee needs a standard laptop for next Monday.", "S4"],
    ["Install the approved diagramming tool for a planned project.", "S4"],
    ["Provide a replacement mouse during the next equipment round.", "S4"],
    ["Add the training room to the guest Wi-Fi allow list.", "S4"],
    ["Generate a monthly inventory report for department managers.", "S4"],
    ["Create a service account for an approved integration.", "S4"],
    ["Schedule a firewall rule change for the maintenance window.", "S4"],
    ["Procure two headsets for newly hired remote agents.", "S4"],
  ],
};
const categoryOrder = Object.keys(annotationTemplates);
const aCategoryErrors = new Set([7, 18, 29, 41, 46]);
const bCategoryErrors = new Set([5, 12, 18, 23, 34, 41, 49]);
const aSeverityErrors = new Set([9, 27, 44]);
const bSeverityErrors = new Set([6, 27, 38, 44]);
const severityShift = { S1: "S2", S2: "S3", S3: "S2", S4: "S3" };
const annotationRows = [];
for (let index = 0; index < 50; index += 1) {
  const id = index + 1;
  const category = categoryOrder[index % categoryOrder.length];
  const templateIndex = Math.floor(index / categoryOrder.length);
  const [text, severity] = annotationTemplates[category][templateIndex];
  const nextCategory = categoryOrder[(categoryOrder.indexOf(category) + 1) % categoryOrder.length];
  const error = aCategoryErrors.has(id) || bCategoryErrors.has(id);
  annotationRows.push({
    record_id: `NA-${String(id).padStart(3, "0")}`,
    incident_text: text,
    gold_category: category,
    gold_severity: severity,
    gold_pii: text.includes("[") ? "YES" : "NO",
    annotator_a_category: aCategoryErrors.has(id) ? nextCategory : category,
    annotator_a_severity: aSeverityErrors.has(id) ? severityShift[severity] : severity,
    annotator_b_category: bCategoryErrors.has(id) ? nextCategory : category,
    annotator_b_severity: bSeverityErrors.has(id) ? severityShift[severity] : severity,
    adjudicated_category: category,
    adjudicated_severity: severity,
    edge_case_note: error ? "Reviewed during adjudication; precedence rule applied." : "",
  });
}

await writeCsv("projects/01-prompt-engineering/data/prompt_evaluation_cases.csv", promptRows);
await writeCsv("projects/02-rubric-writing/data/double_rated_responses.csv", rubricRows);
await writeCsv("projects/03-data-analysis/data/weekly_operations.csv", operationsRows);
await writeCsv("projects/04-business-operations/data/capacity_plan.csv", capacityRows);
await writeCsv("projects/04-business-operations/data/risk_register.csv", riskRows);
await writeCsv("projects/05-data-annotation/data/network_incident_annotations.csv", annotationRows);

console.log(`Generated ${promptRows.length + rubricRows.length + operationsRows.length + capacityRows.length + riskRows.length + annotationRows.length} synthetic records.`);

