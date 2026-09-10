// Pure state transitions. The store calls these in the browser and
// scripts/gen-states.ts calls the same functions to build the saved states.
// Nothing here changes an Item status without a person named in `by`.
import { addDays } from "./clock";
import { buildProposal } from "./proposals";
import { recomputeCoverage } from "./readiness";
import type {
  ActivityEntry,
  DealState,
  DecisionAction,
  Evidence,
  EvidenceMatch,
  Item,
  ItemStatus,
  Lane,
  MemoSectionDef,
  Person,
  Workstream,
} from "./types";

// Ids come from the state itself, so the browser continues where the saved state stopped.
export function nextId(prefix: string, existing: { id: string }[]): string {
  const max = existing.reduce((m, x) => {
    const n = x.id.startsWith(`${prefix}-`) ? Number(x.id.slice(prefix.length + 1)) : NaN;
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `${prefix}-${(max + 1).toString().padStart(4, "0")}`;
}

// Kept for the generator scripts. Nothing to reset now that ids live in the state.
export function resetIds(): void {}

function log(state: DealState, entry: Omit<ActivityEntry, "id">): DealState {
  return { ...state, activity: [...state.activity, { id: nextId("act", state.activity), ...entry }] };
}

export type SprintInputs = {
  lanes: Lane[];
  workstreams: Workstream[];
  memoSections: MemoSectionDef[];
  memoLane: { dueDay: number };
  personByRole: (role: Person["role"]) => Person;
};

// The playbook: items for every workstream step and every memo section.
export function buildSprintItems(day0: string, inputs: SprintInputs): Item[] {
  const items: Item[] = [];
  for (const w of inputs.workstreams) {
    const lane = inputs.lanes.find((l) => l.id === w.id);
    if (!lane) throw new Error(`No lane for workstream ${w.id}`);
    w.steps.forEach((step, i) => {
      items.push({
        id: `${w.id}-${i + 1}`,
        laneId: lane.id,
        title: step.title,
        ownerId: lane.ownerId,
        dueDate: addDays(day0, step.dueDay),
        status: "notStarted",
        doneLooksLike: step.doneLooksLike,
        evidenceIds: [],
      });
    });
  }
  const memoLane = inputs.lanes.find((l) => l.kind === "memo");
  if (memoLane) {
    for (const s of inputs.memoSections) {
      items.push({
        id: s.id,
        laneId: memoLane.id,
        title: s.placeholder ? `${s.name} (placeholder)` : s.name,
        ownerId: inputs.personByRole(s.ownerRole).id,
        dueDate: addDays(day0, inputs.memoLane.dueDay),
        status: "notStarted",
        doneLooksLike: s.placeholder ? "Section confirmed with the sponsor, then drafted" : "Section drafted and reviewed by the partner",
        evidenceIds: [],
      });
    }
  }
  return items;
}

export function setupSprint(state: DealState, by: string, at: string, inputs: SprintInputs): DealState {
  if (state.items.length > 0) return state;
  const items = buildSprintItems(state.day0, inputs);
  const next = { ...state, items, memoSections: recomputeCoverage(state.memoSections, items) };
  return log(next, { at, by, action: `Set up the sprint from the playbook: ${items.length} steps across ${inputs.lanes.length} lanes` });
}

// A person changes a status by hand. Logged like everything else.
export function setStatusByHand(
  state: DealState,
  itemId: string,
  status: ItemStatus,
  by: string,
  at: string,
  note?: string,
): DealState {
  const item = state.items.find((i) => i.id === itemId);
  if (!item) throw new Error(`Unknown item ${itemId}`);
  const items = state.items.map((i) => (i.id === itemId ? { ...i, status } : i));
  const next = { ...state, items, memoSections: recomputeCoverage(state.memoSections, items) };
  return log(next, {
    at,
    by,
    itemId,
    action: `Marked "${item.title}" ${words(status)} by hand${note ? `: ${note}` : ""}`,
  });
}

// Evidence arrives. Matched evidence gets a proposal and waits in the inbox.
// Unmatched evidence is filed with a note. The agent never changes a status here.
export function receiveEvidence(
  state: DealState,
  evidence: Evidence,
  match: EvidenceMatch | undefined,
  lanes: Lane[],
  at: string,
): DealState {
  if (state.inboxEvidenceIds.includes(evidence.id) || state.processedEvidenceIds.includes(evidence.id)) return state;
  if (!match) {
    const next = { ...state, processedEvidenceIds: [...state.processedEvidenceIds, evidence.id] };
    return log(next, { at, by: "agent", evidenceId: evidence.id, action: `Filed "${evidence.subject}" (no status change proposed)` });
  }
  const proposal = buildProposal(match, evidence, state.items, lanes);
  const next = {
    ...state,
    inboxEvidenceIds: [...state.inboxEvidenceIds, evidence.id],
    proposals: [...state.proposals, proposal],
  };
  const item = state.items.find((i) => i.id === proposal.itemId)!;
  return log(next, {
    at,
    by: "agent",
    evidenceId: evidence.id,
    itemId: item.id,
    action: `Proposed "${item.title}" ${words(proposal.proposedStatus)} (${proposal.strength} evidence)`,
  });
}

// A person decides. Only "approved" touches the tracker.
export function decide(
  state: DealState,
  proposalId: string,
  action: DecisionAction,
  by: string,
  at: string,
  reason?: string,
): DealState {
  const proposal = state.proposals.find((p) => p.id === proposalId);
  if (!proposal) throw new Error(`Unknown proposal ${proposalId}`);
  if (proposal.decision) return state;
  const item = state.items.find((i) => i.id === proposal.itemId)!;
  const proposals = state.proposals.map((p) => (p.id === proposalId ? { ...p, decision: { by, at, action, reason } } : p));
  let items = state.items;
  if (action === "approved") {
    items = state.items.map((i) =>
      i.id === item.id
        ? { ...i, status: proposal.proposedStatus, evidenceIds: [...new Set([...i.evidenceIds, proposal.evidenceId])] }
        : i,
    );
  }
  // Asking for confirmation keeps the evidence in the inbox until the answer comes back.
  const leavesInbox = action !== "askedForConfirmation";
  const next: DealState = {
    ...state,
    items,
    proposals,
    memoSections: recomputeCoverage(state.memoSections, items),
    inboxEvidenceIds: leavesInbox ? state.inboxEvidenceIds.filter((id) => id !== proposal.evidenceId) : state.inboxEvidenceIds,
    processedEvidenceIds: leavesInbox ? [...state.processedEvidenceIds, proposal.evidenceId] : state.processedEvidenceIds,
  };
  const verb =
    action === "approved"
      ? `Approved "${item.title}" ${words(item.status)} to ${words(proposal.proposedStatus)}`
      : action === "rejected"
        ? `Rejected "${item.title}" to ${words(proposal.proposedStatus)}${reason ? `: ${reason}` : ""}`
        : `Asked for confirmation on "${item.title}"${reason ? `: ${reason}` : ""}`;
  return log(next, { at, by, itemId: item.id, evidenceId: proposal.evidenceId, action: verb });
}

export function answerQuestion(state: DealState, questionId: string, by: string, at: string): DealState {
  const q = state.sellerQuestions.find((x) => x.id === questionId);
  if (!q) return state;
  const next = { ...state, sellerQuestions: state.sellerQuestions.map((x) => (x.id === questionId ? { ...x, answered: true } : x)) };
  return log(next, { at, by, action: `Seller answered: ${q.text}` });
}

export function tickChecklist(state: DealState, checklistId: string, done: boolean, by: string, at: string): DealState {
  const c = state.bidChecklist.find((x) => x.id === checklistId);
  if (!c) return state;
  const next = { ...state, bidChecklist: state.bidChecklist.map((x) => (x.id === checklistId ? { ...x, done } : x)) };
  return log(next, { at, by, action: `${done ? "Checked" : "Unchecked"} bid item: ${c.name}` });
}

export function sendStatusNote(state: DealState, text: string, by: string, at: string, mock: boolean): DealState {
  const note = { id: nextId("note", state.statusNotes), date: state.today, text, by, sentAt: at, mock };
  const next = { ...state, statusNotes: [...state.statusNotes, note] };
  return log(next, { at, by, action: "Sent tonight's status note to the working group" });
}

export function words(s: ItemStatus): string {
  return { notStarted: "not started", inProgress: "in progress", blocked: "blocked", done: "done" }[s];
}

// Derived, not stored: an item has a question out when its open proposal was
// answered with "ask for confirmation".
export function hasQuestionOut(itemId: string, state: DealState): boolean {
  return state.proposals.some((p) => p.itemId === itemId && p.decision?.action === "askedForConfirmation");
}

export function openProposals(state: DealState) {
  return state.proposals.filter((p) => !p.decision || p.decision.action === "askedForConfirmation");
}
