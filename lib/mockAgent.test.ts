import { describe, expect, it } from "vitest";
import demoStates from "@/data/demo-states.json";
import { loadEvidence } from "./sources";
import { draftStatusNote } from "./mockAgent";
import { decide } from "./transitions";
import type { DealState } from "./types";

const midstream = () => JSON.parse(JSON.stringify(demoStates.states.midstream)) as DealState;

describe("mock status note", () => {
  it("groups today's approvals by workstream and signs as the VP", () => {
    let s = midstream();
    s = decide(s, "prop-ev-01", "approved", "p-vp", "2026-09-11T18:00:00Z");
    s = decide(s, "prop-ev-02", "approved", "p-vp", "2026-09-11T18:01:00Z");
    s = decide(s, "prop-ev-10", "askedForConfirmation", "p-vp", "2026-09-11T18:02:00Z");
    const note = draftStatusNote(s, loadEvidence());
    expect(note).toMatch(/^Team,/);
    expect(note).toContain("Nine days to IC, twelve to the bid");
    expect(note).toContain("QoE: Databook v1 received done (email from Rachel at Harrow & Finch Advisory, Beacon_Databook_v1_DRAFT.xlsx attached).");
    expect(note).toContain("Legal: Material contracts summary done");
    expect(note).toContain("Samuel says litigation and regulatory review is done; asked for confirmation");
    expect(note).toContain("HR: Comp and benefits review blocked, seller has not sent the benefits plan documents.");
    expect(note).toContain("Open with the seller, past due: add-back support");
    expect(note.trim().endsWith("Owen")).toBe(true);
    expect(note).not.toContain("—");
  });
  it("says so when a lane had no change", () => {
    const note = draftStatusNote(midstream(), loadEvidence());
    expect(note).toContain("Financing: No change today. 3 of 5 steps done.");
  });
});
