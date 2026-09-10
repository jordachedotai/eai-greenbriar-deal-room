import { describe, expect, it } from "vitest";
import demoStates from "@/data/demo-states.json";
import { lanes } from "./data";
import { lanesOwing, recomputeCoverage } from "./readiness";
import { decide } from "./transitions";
import type { DealState } from "./types";

const load = (n: "kickoff" | "midstream" | "ic-minus-3") => JSON.parse(JSON.stringify(demoStates.states[n])) as DealState;
const unsupported = (s: DealState) => recomputeCoverage(s.memoSections, s.items).filter((m) => m.coverage === "none");

describe("readiness coverage", () => {
  it("kickoff reads every section unsupported", () => {
    expect(unsupported(load("kickoff"))).toHaveLength(10);
  });
  it("midstream reads two unsupported after the two beat-2 approvals, owed by IT and HR", () => {
    let s = load("midstream");
    s = decide(s, "prop-ev-01", "approved", "p-vp", "2026-09-11T18:00:00Z");
    s = decide(s, "prop-ev-02", "approved", "p-vp", "2026-09-11T18:01:00Z");
    const u = unsupported(s);
    expect(u.map((m) => m.name)).toEqual(["Industry Overview", "Preliminary Growth and Value Creation Levers"]);
    expect(lanesOwing(u[1]!, s.items, lanes).map((l) => l.name)).toEqual(["IT", "HR"]);
  });
  it("ic-minus-3 reads two unsupported, eight questions with three overdue, checklist half done", () => {
    const s = load("ic-minus-3");
    expect(unsupported(s)).toHaveLength(2);
    expect(s.sellerQuestions).toHaveLength(8);
    expect(s.sellerQuestions.filter((q) => !q.answered && q.dueAt < s.today)).toHaveLength(3);
    expect(s.bidChecklist.filter((b) => b.done)).toHaveLength(3);
  });
});
