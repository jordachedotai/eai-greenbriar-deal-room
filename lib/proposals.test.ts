import { describe, expect, it } from "vitest";
import { quoteSource, isOneLiner } from "./proposals";
import demoStates from "@/data/demo-states.json";

describe("proposals", () => {
  it("quotes the sentence, never the salutation", () => {
    const q = quoteSource("Owen,\n\nPlease find attached draft databook v1. More follows.\n\nRachel", "attached draft databook");
    expect(q).toBe("Please find attached draft databook v1.");
  });
  it("knows a one liner", () => {
    expect(isOneLiner("legal is basically done")).toBe(true);
    expect(isOneLiner("Line one.\nLine two.")).toBe(false);
  });
  it("midstream inbox holds two clear proposals and one thin one, all with a quoted source", () => {
    const s = demoStates.states.midstream;
    const open = s.proposals.filter((p) => !p.decision);
    expect(open.map((p) => p.strength).sort()).toEqual(["clear", "clear", "thin"]);
    for (const p of open) expect(p.quotedSource.length).toBeGreaterThan(10);
    expect(s.inboxEvidenceIds).toHaveLength(3);
  });
  it("the lender commitment claim is a conflict in ic-minus-3", () => {
    const p = demoStates.states["ic-minus-3"].proposals.find((x) => x.evidenceId === "ev-11")!;
    expect(p.strength).toBe("conflict");
    expect(p.conflictNote).toContain("Lender diligence sessions");
  });
});
