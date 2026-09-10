// Read-only views over a DealState for the screens. No mutation here.
import { isDueThisWeek, isOverdue } from "./clock";
import { hasQuestionOut, openProposals } from "./transitions";
import type { DealState, Item, ItemStatus } from "./types";

export type CardStatus = ItemStatus | "questionOut";

export function cardStatus(item: Item, state: DealState): CardStatus {
  if (item.status !== "done" && hasQuestionOut(item.id, state)) return "questionOut";
  return item.status;
}

export const statusLabel: Record<CardStatus, string> = {
  notStarted: "Not started",
  inProgress: "In progress",
  blocked: "Blocked",
  done: "Done",
  questionOut: "Question out",
};

// Token mapping: one meaning per color (design-reference/Tokens.dc.html).
// Needs you = blue, waiting on others = amber, locked = green, not started = grey.
export const statusTone: Record<CardStatus, "needsYou" | "waiting" | "locked" | "idle"> = {
  notStarted: "idle",
  inProgress: "waiting",
  blocked: "needsYou",
  done: "locked",
  questionOut: "waiting",
};

export function workStrip(state: DealState) {
  const waiting = openProposals(state).filter((p) => !p.decision).length;
  const blocked = state.items.filter((i) => i.status === "blocked").length;
  const dueThisWeek = state.items.filter((i) => i.status !== "done" && isDueThisWeek(i.dueDate, state.today)).length;
  const overdue = state.items.filter((i) => i.status !== "done" && isOverdue(i.dueDate, state.today)).length;
  return { waiting, blocked, dueThisWeek, overdue };
}

export function itemsByLane(state: DealState, laneId: string): Item[] {
  return state.items.filter((i) => i.laneId === laneId).sort((a, b) => a.dueDate.localeCompare(b.dueDate)); // stable, so ties keep names-file order
}

export function pendingProposalFor(itemId: string, state: DealState) {
  return state.proposals.find((p) => p.itemId === itemId && !p.decision);
}
