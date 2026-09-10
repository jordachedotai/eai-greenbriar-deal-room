// Builds data/demo-states.json by running the app's own transitions.
// This script owns the frozen `today` for each state. Code never hard-codes it.
// Run: npm run gen:states (after gen:fixtures)
import fs from "node:fs";
import path from "node:path";
import { addDays } from "../lib/clock";
import { lanes, memoLaneDef, memoSectionDefs, personByRole, workstreamDefs } from "../lib/data";
import { buildMemoSections } from "../lib/readiness";
import { loadEvidence, loadMatches } from "../lib/sources";
import { decide, receiveEvidence, resetIds, setStatusByHand, setupSprint, tickChecklist } from "../lib/transitions";
import type { BidChecklistItem, DealState, SellerQuestion, StateName } from "../lib/types";

const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "data");
const calendar = JSON.parse(fs.readFileSync(path.join(dataDir, "calendar.json"), "utf8")) as { day0: string; icDate: string; bidDate: string };
const questions = JSON.parse(fs.readFileSync(path.join(dataDir, "questions.json"), "utf8")) as SellerQuestion[];
const checklist = JSON.parse(fs.readFileSync(path.join(dataDir, "checklist.json"), "utf8")) as BidChecklistItem[];
const evidence = loadEvidence();
const matches = loadMatches();

const DAY0 = calendar.day0;
const vp = personByRole("vp").id;
const director = personByRole("director").id;
const associate = personByRole("associate").id;
const analyst = personByRole("analyst").id;
const partner = personByRole("partner").id;

const at = (day: number, time = "18:00") => `${addDays(DAY0, day)}T${time}:00Z`;
const inputs = { lanes, workstreams: workstreamDefs, memoSections: memoSectionDefs, memoLane: memoLaneDef, personByRole };

function ev(id: string) {
  const e = evidence.find((x) => x.id === id);
  if (!e) throw new Error(`No evidence ${id} in data/inbox or data/dropzone`);
  return e;
}
function match(id: string) {
  return matches.find((m) => m.evidenceId === id);
}
function receive(s: DealState, id: string): DealState {
  const e = ev(id);
  return receiveEvidence(s, e, match(id), lanes, e.receivedAt);
}
function approve(s: DealState, id: string, by: string, day: number, time: string): DealState {
  return decide(s, `prop-${id}`, "approved", by, at(day, time));
}

function blank(name: StateName, todayDay: number): DealState {
  return {
    name,
    today: addDays(DAY0, todayDay),
    day0: DAY0,
    icDate: calendar.icDate,
    bidDate: calendar.bidDate,
    items: [],
    proposals: [],
    activity: [{ id: "act-0000", at: at(0, "16:30"), by: partner, action: "IC approved the Criteria Worksheet. Thirty days to the IC memo and final bid." }],
    inboxEvidenceIds: [],
    processedEvidenceIds: [],
    sellerQuestions: [],
    bidChecklist: checklist.map((c) => ({ ...c, done: false })),
    memoSections: buildMemoSections(memoSectionDefs, []),
  };
}

// kickoff: IC approved yesterday. Tracker empty. Nothing has arrived.
resetIds();
const kickoff = blank("kickoff", 1);

// midstream: day 21. Nine days to IC. Three pieces of evidence in the inbox.
resetIds();
let m = blank("midstream", 21);
m = setupSprint(m, vp, at(1, "09:15"), inputs);
m = { ...m, sellerQuestions: questions.filter((q) => q.askedAt <= m.today) };

// Days 1 to 10: the early steps, marked by hand the way the tracker works today.
m = setStatusByHand(m, "legal-1", "done", director, at(1, "17:40"), "NDA countersigned");
m = setStatusByHand(m, "qoe-1", "done", associate, at(2, "16:10"));
m = setStatusByHand(m, "financing-1", "done", vp, at(3, "19:05"));
m = setStatusByHand(m, "qoe-2", "done", associate, at(4, "17:30"));
m = receive(m, "ev-04");
m = approve(m, "ev-04", vp, 5, "18:20");
m = setStatusByHand(m, "financing-2", "done", vp, at(7, "18:45"));
m = setStatusByHand(m, "legal-2", "done", director, at(10, "17:55"));

// Days 11 to 20
m = receive(m, "ev-03");
m = approve(m, "ev-03", analyst, 12, "15:10");
m = setStatusByHand(m, "legal-3", "inProgress", director, at(14, "18:00"));
m = setStatusByHand(m, "qoe-3", "inProgress", associate, at(15, "18:30"), "databook in preparation");
m = setStatusByHand(m, "it-2", "inProgress", analyst, at(15, "18:35"));
m = setStatusByHand(m, "memo-company", "inProgress", associate, at(15, "20:00"));
m = receive(m, "ev-05");
m = approve(m, "ev-05", vp, 16, "18:10");
m = setStatusByHand(m, "memo-industry", "inProgress", analyst, at(16, "19:00"));
m = receive(m, "ev-06");
m = approve(m, "ev-06", vp, 18, "18:05");
m = setStatusByHand(m, "legal-4", "inProgress", director, at(18, "18:10"));
m = receive(m, "ev-07");
m = approve(m, "ev-07", vp, 19, "18:15");
m = setStatusByHand(m, "legal-5", "blocked", director, at(19, "18:20"), "waiting on the banker's draft purchase agreement");
m = setStatusByHand(m, "hr-2", "blocked", analyst, at(19, "18:25"), "seller has not sent the benefits plan documents");
m = setStatusByHand(m, "hr-3", "inProgress", analyst, at(20, "18:00"));
m = setStatusByHand(m, "financing-4", "inProgress", vp, at(20, "18:05"));
m = receive(m, "ev-09");
m = receive(m, "ev-08");
m = tickChecklist(m, "bid-1", true, vp, at(20, "21:00"));

// Day 21, the demo day: three pieces of evidence waiting.
m = receive(m, "ev-01");
m = receive(m, "ev-02");
m = receive(m, "ev-10");
const midstream = m;

// ic-minus-3: day 27. The three were decided on day 21, the lender conflict came in on day 22.
resetIds();
let c: DealState = { ...JSON.parse(JSON.stringify(midstream)) as DealState, name: "ic-minus-3", today: addDays(DAY0, 27) };
c = { ...c, sellerQuestions: questions.filter((q) => q.askedAt <= c.today) };
c = approve(c, "ev-01", vp, 21, "18:02");
c = approve(c, "ev-02", vp, 21, "18:03");
c = decide(c, "prop-ev-10", "askedForConfirmation", vp, at(21, "18:04"), "one line, no attachment, asked Sam which steps are done");
c = receive(c, "ev-11");
c = decide(c, "prop-ev-11", "rejected", vp, at(22, "18:10"), "Tom confirmed by phone: letter is drafted, not sent. Still at term sheet stage.");
c = setStatusByHand(c, "legal-4", "done", director, at(23, "17:50"), "litigation memo received");
c = setStatusByHand(c, "financing-4", "done", vp, at(24, "19:00"), "both lender sessions held");
c = setStatusByHand(c, "legal-5", "inProgress", director, at(25, "18:00"), "banker's draft arrived");
c = setStatusByHand(c, "qoe-4", "done", associate, at(26, "19:30"));
c = setStatusByHand(c, "qoe-5", "inProgress", associate, at(27, "17:45"));
c = setStatusByHand(c, "memo-company", "done", associate, at(26, "21:00"));
c = setStatusByHand(c, "memo-merits", "inProgress", vp, at(26, "21:10"));
c = setStatusByHand(c, "memo-considerations", "inProgress", vp, at(27, "17:00"));
c = tickChecklist(c, "bid-2", true, director, at(25, "18:30"));
c = tickChecklist(c, "bid-4", true, partner, at(27, "16:00"));
const icMinus3 = c;

const out = { version: 1, generatedFrom: "scripts/gen-states.ts", states: { kickoff, midstream, "ic-minus-3": icMinus3 } };
fs.writeFileSync(path.join(dataDir, "demo-states.json"), JSON.stringify(out, null, 2) + "\n");

for (const s of [kickoff, midstream, icMinus3]) {
  const counts = s.items.reduce<Record<string, number>>((acc, i) => ((acc[i.status] = (acc[i.status] ?? 0) + 1), acc), {});
  const unsupported = s.memoSections.filter((x) => x.coverage === "none").map((x) => x.name);
  console.log(
    `${s.name}: today ${s.today}, ${s.items.length} items ${JSON.stringify(counts)}, inbox ${s.inboxEvidenceIds.length}, proposals ${s.proposals.length}, activity ${s.activity.length}, overdue questions ${s.sellerQuestions.filter((q) => !q.answered && q.dueAt < s.today).length}, unsupported: ${unsupported.join(" | ")}`,
  );
}
