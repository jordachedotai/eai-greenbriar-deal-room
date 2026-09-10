// Coverage is code, not a model call (docs/AGENT.md).
import type { Coverage, Item, Lane, MemoSection, MemoSectionDef } from "./types";

export function laneProgress(laneId: string, items: Item[]): number {
  const laneItems = items.filter((i) => i.laneId === laneId);
  if (laneItems.length === 0) return 0;
  return laneItems.filter((i) => i.status === "done").length / laneItems.length;
}

export function coverageFor(supportedBy: string[], items: Item[]): Coverage {
  if (supportedBy.length === 0) return "none";
  const avg = supportedBy.reduce((sum, id) => sum + laneProgress(id, items), 0) / supportedBy.length;
  if (avg >= 0.6) return "full";
  if (avg >= 0.3) return "partial";
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

// Which lanes owe an unsupported section. Used by the readiness view and the board.
export function lanesOwing(section: MemoSection, items: Item[], lanes: Lane[]): Lane[] {
  return section.supportedBy
    .filter((id) => laneProgress(id, items) < 0.3)
    .map((id) => lanes.find((l) => l.id === id))
    .filter((l): l is Lane => !!l);
}
