// Deterministic proposal rules from docs/AGENT.md. No model call. The agent never writes:
// this module only builds Proposal objects for a person to decide on.
import type { Evidence, EvidenceMatch, Item, Lane, Proposal, ProposalStrength } from "./types";

// Cut the sentence that contains the matched phrase. Never paraphrase.
export function quoteSource(body: string, phrase: string): string {
  // Line breaks end a sentence too, so a salutation on its own line never joins the quote.
  const sentences = body
    .split(/\n+/)
    .flatMap((line) => line.trim().split(/(?<=[.!?])\s+/))
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !isSalutation(s));
  const hit = sentences.find((s) => s.toLowerCase().includes(phrase.toLowerCase()));
  return hit ?? sentences[0] ?? body.trim();
}

function isSalutation(s: string): boolean {
  return /^[A-Za-z ,]{1,40},$/.test(s);
}

export function isOneLiner(body: string): boolean {
  const text = body.trim();
  const lines = text.split(/\n/).filter((l) => l.trim().length > 0);
  return lines.length <= 1 && text.length < 160;
}

export type StrengthInput = {
  evidence: Evidence;
  item: Item;
  lane: Lane;
  laneItems: Item[]; // ordered by due date
  proposedStatus: Item["status"];
};

export function strengthFor(input: StrengthInput): { strength: ProposalStrength; conflictNote?: string } {
  const { evidence, item, lane, laneItems, proposedStatus } = input;

  // Conflict: the claim contradicts the tracker. A "done" claim on a step whose
  // earlier step in the same lane is not done yet.
  if (proposedStatus === "done") {
    const idx = laneItems.findIndex((i) => i.id === item.id);
    const prior = laneItems.slice(0, idx).filter((i) => i.status !== "done");
    if (item.status === "notStarted" && prior.length > 0) {
      const p = prior[prior.length - 1]!;
      return {
        strength: "conflict",
        conflictNote: `Tracker says "${item.title}" has not started and "${p.title}" is ${statusWords(p.status)}.`,
      };
    }
  }

  // Thin: one line, no attachment.
  if (!evidence.attachmentName && isOneLiner(evidence.body)) {
    return { strength: "thin" };
  }

  // Clear: attachment present and the sender is the lane's party, or a substantive
  // note or file from the lane's party.
  const fromLaneParty = !!lane.externalPartyId && evidence.partyId === lane.externalPartyId;
  if (fromLaneParty && (evidence.attachmentName || evidence.kind !== "email")) {
    return { strength: "clear" };
  }
  if (evidence.attachmentName) return { strength: "clear" };
  return { strength: "thin" };
}

export function statusWords(s: Item["status"]): string {
  return { notStarted: "not started", inProgress: "in progress", blocked: "blocked", done: "done" }[s];
}

export function buildProposal(
  match: EvidenceMatch,
  evidence: Evidence,
  items: Item[],
  lanes: Lane[],
): Proposal {
  const item = items.find((i) => i.id === match.itemId);
  if (!item) throw new Error(`Match ${match.evidenceId} points at unknown item ${match.itemId}`);
  const lane = lanes.find((l) => l.id === item.laneId);
  if (!lane) throw new Error(`Item ${item.id} has unknown lane ${item.laneId}`);
  const laneItems = items.filter((i) => i.laneId === lane.id).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const quotedSource = quoteSource(evidence.body, match.matchedPhrase);
  if (!quotedSource) throw new Error(`No source line for ${evidence.id}. No source, no proposal.`);
  const { strength, conflictNote } = strengthFor({ evidence, item, lane, laneItems, proposedStatus: match.proposedStatus });
  return {
    id: `prop-${evidence.id}`,
    evidenceId: evidence.id,
    itemId: item.id,
    proposedStatus: match.proposedStatus,
    quotedSource,
    strength,
    conflictNote,
  };
}
