// Builds the generated fixtures from the hand-edited names files.
// Run: npm run gen:fixtures
import fs from "node:fs";
import path from "node:path";
import { addDays } from "../lib/clock";
import { lanes, memoLaneDef, memoSectionDefs, partyByKind, partyList, personByRole, workstreamDefs } from "../lib/data";
import { buildSprintItems } from "../lib/transitions";
import type { BidChecklistItem, Evidence, EvidenceMatch, SellerQuestion } from "../lib/types";

// The synthetic Beacon calendar. Day 0 is IC approval of the Criteria Worksheet.
export const DAY0 = "2026-08-21";
export const IC_DATE = addDays(DAY0, 30); // 2026-09-20
export const BID_DATE = addDays(DAY0, 33); // 2026-09-23

const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "data");

function at(day: number, time: string): string {
  return `${addDays(DAY0, day)}T${time}:00Z`;
}

function write(rel: string, value: unknown) {
  const full = path.join(dataDir, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(value, null, 2) + "\n");
}

function clearDir(rel: string) {
  const full = path.join(dataDir, rel);
  fs.mkdirSync(full, { recursive: true });
  for (const f of fs.readdirSync(full)) if (f.endsWith(".json")) fs.unlinkSync(path.join(full, f));
}

const P = {
  accounting: partyByKind("accounting")!,
  legal: partyByKind("legal")!,
  hr: partyByKind("hr")!,
  it: partyByKind("it")!,
  lenderA: partyByKind("lender")!,
  lenderB: partyList.filter((p) => p.kind === "lender")[1]!,
  seller: partyByKind("seller")!,
};
const vp = personByRole("vp");

// Items template (all not started). setupSprint builds the same list at runtime.
const items = buildSprintItems(DAY0, { lanes, workstreams: workstreamDefs, memoSections: memoSectionDefs, memoLane: memoLaneDef, personByRole });
write("items.json", items);

// The eleven pieces of evidence for midstream (docs/DATA.md).
const evidence: Evidence[] = [
  {
    id: "ev-01",
    kind: "email",
    from: `Rachel Okonkwo <r.okonkwo@harrowfinch.example>`,
    partyId: P.accounting.id,
    receivedAt: at(21, "08:12"),
    subject: "Project Beacon: draft databook v1 attached",
    body:
      "Owen,\n\nPlease find attached draft databook v1 for Project Beacon covering FY23 through TTM June 2026. Revenue and gross margin tabs are complete. The add-back schedule is still being reconciled and will follow in v2 next week.\n\nWe are still waiting on the seller for the working capital detail by month.\n\nRachel",
    attachmentName: "Beacon_Databook_v1_DRAFT.xlsx",
  },
  {
    id: "ev-02",
    kind: "email",
    from: `Samuel Adeyemi <sadeyemi@brightwatercole.example>`,
    partyId: P.legal.id,
    receivedAt: at(21, "09:40"),
    subject: "Project Beacon: material contracts summary",
    body:
      "Dana, Owen,\n\nAttached is the material contracts summary for Project Beacon. We reviewed 42 customer and carrier agreements in the data room. Six customer contracts carry change of control consent rights, which we flag for the purchase agreement.\n\nThe litigation and regulatory memo is in second draft and should reach you Tuesday.\n\nSam",
    attachmentName: "Beacon_Material_Contracts_Summary.pdf",
  },
  {
    id: "ev-03",
    kind: "file",
    from: `${P.hr.name} drop zone`,
    partyId: P.hr.id,
    receivedAt: at(12, "14:05"),
    subject: "Beacon_Employee_Census_Aug2026.xlsx",
    body: "Employee census for Beacon as of August 2026. 412 employees across four sites. Columns: employee id, site, title, hire date, base, bonus target, benefits tier.\nUploaded by Meridian People Advisors to the Beacon drop zone.",
    attachmentName: "Beacon_Employee_Census_Aug2026.xlsx",
  },
  {
    id: "ev-04",
    kind: "note",
    from: `Lena Marsh, ${P.it.name}`,
    partyId: P.it.id,
    receivedAt: at(5, "16:30"),
    subject: "IT scoping call notes",
    body:
      "Scoping call held with Beacon's head of operations technology. Scope agreed: systems inventory, cyber assessment, integration and separation cost estimate, final report by day 30.\nBeacon runs a third-party TMS and an in-house WMS built in 2019. No dedicated security lead. Cyber assessment will need a two-day site visit.\nNext step: Beacon to send the license schedule.",
  },
  {
    id: "ev-05",
    kind: "email",
    from: `Tom Bradley <tbradley@cobaltridge.example>`,
    partyId: P.lenderA.id,
    receivedAt: at(16, "11:20"),
    subject: "Project Beacon: Cobalt Ridge term sheet",
    body:
      "Owen,\n\nAttached is our term sheet for Project Beacon: unitranche, 4.5x leverage, pricing as discussed. Subject to our diligence session with management and credit committee approval.\n\nHappy to walk through it tomorrow.\n\nTom",
    attachmentName: "Cobalt_Ridge_Term_Sheet_Beacon.pdf",
  },
  {
    id: "ev-06",
    kind: "email",
    from: `Maria Castellano <mcastellano@larkspurcredit.example>`,
    partyId: P.lenderB.id,
    receivedAt: at(18, "15:45"),
    subject: "Larkspur term sheet for Project Beacon",
    body:
      "Owen,\n\nPlease see attached the Larkspur term sheet for Project Beacon. We are at 4.25x with a delayed draw facility for the two cross-dock expansions.\n\nWe would like a session with the CFO next week before credit committee.\n\nMaria",
    attachmentName: "Larkspur_Term_Sheet_Beacon.pdf",
  },
  {
    id: "ev-07",
    kind: "note",
    from: "Calendar",
    receivedAt: at(19, "10:00"),
    subject: `Calendar: Beacon management meeting, ${addDays(DAY0, 26)}`,
    body: `Management meeting with the Beacon founder and CFO scheduled for ${addDays(DAY0, 26)} at Beacon's main cross-dock site. Attending: Greenbriar deal team, Harrow & Finch for the QoE interviews.\nAgenda: QoE management interviews in the morning, site walk in the afternoon.`,
  },
  {
    id: "ev-08",
    kind: "email",
    from: `${vp.name} <ocarver@greenbriar.example>`,
    receivedAt: at(20, "22:10"),
    subject: "Beacon working group: status, day 20",
    body:
      "Team,\n\nStatus as of tonight.\n\nQoE: databook expected tomorrow from Harrow & Finch. Management interviews set for day 26.\nLegal: contracts summary due tomorrow. Purchase agreement first turn is waiting on the banker's draft.\nHR: census in hand. Comp and benefits review blocked until the seller sends plan documents.\nIT: systems inventory in progress. Cyber assessment site visit to schedule.\nFinancing: two term sheets in. Lender sessions with the CFO next week.\n\nOpen with the seller: add-back support, monthly working capital, litigation list. All three past due.\n\nOwen",
  },
  {
    id: "ev-09",
    kind: "requestListUpdate",
    from: `${P.seller.name} via ${partyByKind("banker")!.name}`,
    partyId: P.seller.id,
    receivedAt: at(20, "17:30"),
    subject: "Data request list update: 14 of 28 items answered",
    body:
      "The seller has answered 14 of 28 items on the QoE data request list. Newly answered: monthly revenue by customer, customer contracts with change of control terms.\nStill open: add-back support for owner compensation and one-time legal fees, working capital detail by month, open litigation and regulatory notices since 2023, benefits plan documents, TMS and WMS license schedule, capex by facility.",
  },
  {
    id: "ev-10",
    kind: "email",
    from: `Samuel Adeyemi <sadeyemi@brightwatercole.example>`,
    partyId: P.legal.id,
    receivedAt: at(21, "12:55"),
    subject: "Re: Beacon",
    body: "legal is basically done on our side, will send the rest early next week",
  },
  {
    id: "ev-11",
    kind: "email",
    from: `Tom Bradley <tbradley@cobaltridge.example>`,
    partyId: P.lenderA.id,
    receivedAt: at(22, "09:05"),
    subject: "Project Beacon: commitment",
    body:
      "Owen,\n\nQuick update: commitment letter sent this morning to your deal counsel for review. Credit committee met yesterday.\n\nLet me know if you need anything else before the session with the CFO.\n\nTom",
  },
];

clearDir("inbox");
clearDir("dropzone");
for (const e of evidence) {
  write(`${e.kind === "file" ? "dropzone" : "inbox"}/${e.id}.json`, e);
}

// Attachment stubs. Real files never enter this repo.
const evDir = path.join(dataDir, "evidence");
fs.mkdirSync(evDir, { recursive: true });
for (const e of evidence) {
  if (!e.attachmentName) continue;
  fs.writeFileSync(path.join(evDir, `${e.attachmentName}.txt`), `Stub for ${e.attachmentName}. Synthetic deal, no content.\n`);
}

// Mock mode ships the matches. Strength is computed by lib/proposals.ts rules.
const matches: EvidenceMatch[] = [
  { evidenceId: "ev-01", itemId: "qoe-3", proposedStatus: "done", matchedPhrase: "attached draft databook v1" },
  { evidenceId: "ev-02", itemId: "legal-3", proposedStatus: "done", matchedPhrase: "material contracts summary" },
  { evidenceId: "ev-03", itemId: "hr-1", proposedStatus: "done", matchedPhrase: "Employee census" },
  { evidenceId: "ev-04", itemId: "it-1", proposedStatus: "done", matchedPhrase: "Scoping call held" },
  { evidenceId: "ev-05", itemId: "financing-3", proposedStatus: "inProgress", matchedPhrase: "our term sheet" },
  { evidenceId: "ev-06", itemId: "financing-3", proposedStatus: "done", matchedPhrase: "Larkspur term sheet" },
  { evidenceId: "ev-07", itemId: "qoe-4", proposedStatus: "inProgress", matchedPhrase: "Management meeting" },
  { evidenceId: "ev-10", itemId: "legal-4", proposedStatus: "done", matchedPhrase: "legal is basically done" },
  { evidenceId: "ev-11", itemId: "financing-5", proposedStatus: "done", matchedPhrase: "commitment letter sent" },
];
write("matches.json", matches);

// Eight seller questions. Three are overdue at day 21.
const q = (id: string, laneId: string, text: string, asked: number, due: number, answered: boolean): SellerQuestion => ({
  id,
  laneId,
  text,
  askedAt: addDays(DAY0, asked),
  dueAt: addDays(DAY0, due),
  answered,
});
const questions: SellerQuestion[] = [
  q("sq-1", "qoe", "Monthly revenue by customer, FY23 to TTM", 5, 12, true),
  q("sq-2", "qoe", "Add-back support for owner compensation and one-time legal fees", 8, 15, false),
  q("sq-3", "qoe", "Working capital detail by month", 10, 17, false),
  q("sq-4", "legal", "Customer contracts with change of control clauses", 6, 13, true),
  q("sq-5", "legal", "Open litigation and any regulatory notices since 2023", 12, 19, false),
  q("sq-6", "hr", "Benefits plan documents and 2026 renewal quotes", 14, 23, false),
  q("sq-7", "it", "License schedule for the TMS and WMS", 16, 24, false),
  q("sq-8", "financing", "Trailing twelve-month capex by facility", 17, 25, false),
];
write("questions.json", questions);

// Bid checklist. Placeholder list until the sponsor confirms.
const checklist: BidChecklistItem[] = [
  { id: "bid-1", name: "Offer letter", placeholder: true, done: false },
  { id: "bid-2", name: "Purchase agreement mark-up", placeholder: true, done: false },
  { id: "bid-3", name: "Financing commitments", placeholder: true, done: false },
  { id: "bid-4", name: "Equity commitment", placeholder: true, done: false },
  { id: "bid-5", name: "IC approval", placeholder: true, done: false },
  { id: "bid-6", name: "Open confirmatory items", placeholder: true, done: false },
];
write("checklist.json", checklist);

write("calendar.json", { day0: DAY0, icDate: IC_DATE, bidDate: BID_DATE });

console.log(`fixtures: ${items.length} items, ${evidence.length} evidence, ${matches.length} matches, ${questions.length} questions, ${checklist.length} checklist`);
