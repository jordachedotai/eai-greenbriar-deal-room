import { describe, expect, it } from "vitest";
import demoStates from "@/data/demo-states.json";
import { lanes } from "./data";
import { decide, hasQuestionOut, receiveEvidence } from "./transitions";
import type { DealState, Evidence } from "./types";

const midstream = () => JSON.parse(JSON.stringify(demoStates.states.midstream)) as DealState;

describe("transitions", () => {
  it("approve moves the item and logs who, when, and which evidence", () => {
    const s = decide(midstream(), "prop-ev-01", "approved", "p-vp", "2026-09-11T18:00:00Z");
    expect(s.items.find((i) => i.id === "qoe-3")!.status).toBe("done");
    expect(s.items.find((i) => i.id === "qoe-3")!.evidenceIds).toContain("ev-01");
    const last = s.activity[s.activity.length - 1]!;
    expect(last.by).toBe("p-vp");
    expect(last.evidenceId).toBe("ev-01");
    expect(s.inboxEvidenceIds).not.toContain("ev-01");
  });
  it("reject leaves the tracker alone and keeps the reason", () => {
    const s = decide(midstream(), "prop-ev-02", "rejected", "p-vp", "2026-09-11T18:00:00Z", "Summary covers half the contracts");
    expect(s.items.find((i) => i.id === "legal-3")!.status).toBe("inProgress");
    expect(s.proposals.find((p) => p.id === "prop-ev-02")!.decision?.reason).toBe("Summary covers half the contracts");
  });
  it("ask for confirmation derives a question out on the card", () => {
    const s = decide(midstream(), "prop-ev-10", "askedForConfirmation", "p-vp", "2026-09-11T18:00:00Z");
    expect(hasQuestionOut("legal-4", s)).toBe(true);
    expect(s.items.find((i) => i.id === "legal-4")!.status).toBe("inProgress");
  });
  it("evidence without a match is filed, never proposed", () => {
    const e: Evidence = { id: "ev-x", kind: "email", from: "x", receivedAt: "2026-09-11T10:00:00Z", subject: "hi", body: "hello" };
    const s = receiveEvidence(midstream(), e, undefined, lanes, e.receivedAt);
    expect(s.proposals.find((p) => p.evidenceId === "ev-x")).toBeUndefined();
    expect(s.processedEvidenceIds).toContain("ev-x");
  });
});
