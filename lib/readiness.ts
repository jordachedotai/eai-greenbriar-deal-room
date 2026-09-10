// Coverage is code, not a model call (docs/AGENT.md).
//
// Rule: a memo section is supported by workstream lanes. Each lane's progress is the
// share of its steps that are done. A section's coverage is the average progress of
// the lanes that support it:
//   full     at 60% or more
//   partial  at 30% or more
//   none     below 30%, or no supporting lane
// Calibrated on the saved states: kickoff reads every section unsupported, midstream
// reads two unsupported after the two beat-2 approvals, ic-minus-3 reads two. The
// thresholds live here and nowhere else.
import type { Coverage, Item, Lane, MemoSection, MemoSectionDef } from "./types";

export const FULL_AT = 0.6;
export const PARTIAL_AT = 0.3;

export function laneProgress(laneId: string, items: Item[]): number {
  const laneItems = items.filter((i) => i.laneId === laneId);
  if (laneItems.length === 0) return 0;
  return laneItems.filter((i) => i.status === "done").length / laneItems.length;
}

export type LaneState = "done" | "inProgress" | "notStarted";

// The lane as a whole: done when every step is done, not started when none has moved.
export function laneState(laneId: string, items: Item[]): LaneState {
  const laneItems = items.filter((i) => i.laneId === laneId);
  if (laneItems.length === 0 || laneItems.every((i) => i.status === "notStarted")) return "notStarted";
  if (laneItems.every((i) => i.status === "done")) return "done";
  return "inProgress";
}

export function coverageFor(supportedBy: string[], items: Item[]): Coverage {
  if (supportedBy.length === 0) return "none";
  const avg = supportedBy.reduce((sum, id) => sum + laneProgress(id, items), 0) / supportedBy.length;
  if (avg >= FULL_AT) return "full";
  if (avg >= PARTIAL_AT) return "partial";
  return "none";
}

export function buildMemoSections(defs: MemoSectionDef[], items: Item[]): MemoSection[] {
  return defs.map((d) => ({
    id: d.id,
    name: d.name,
    placeholder: d.placeholder,
    supportedBy: d.supportedBy,
    coverage: coverageFor(d.supportedBy, items),
  }));
}

export function recomputeCoverage(sections: MemoSection[], items: Item[]): MemoSection[] {
  return sections.map((s) => ({ ...s, coverage: coverageFor(s.supportedBy, items) }));
}

// Which lanes owe an unsupported section: the supporting lanes still under the partial line.
export function lanesOwing(section: MemoSection, items: Item[], lanes: Lane[]): Lane[] {
  return section.supportedBy
    .filter((id) => laneProgress(id, items) < PARTIAL_AT)
    .map((id) => lanes.find((l) => l.id === id))
    .filter((l): l is Lane => !!l);
}

export const coverageLabel: Record<Coverage, string> = { full: "Full", partial: "Partial", none: "Unsupported" };
