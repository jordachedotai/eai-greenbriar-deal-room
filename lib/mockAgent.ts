// Templates for the generative steps in mock mode. Deterministic, built from the state.
// The structure follows the VP's own note from the day before (evidence ev-08) until the
// sponsor's real sample arrives. Everything here is a draft for a person to edit.
import { dealClock, fmtDate, isOverdue } from "./clock";
import { lanes, partyById, personById } from "./data";
import { words } from "./transitions";
import type { DealState, Evidence, Item, Proposal } from "./types";

export const WORKING_DELAY_MS = 900;

const numberWords = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen"];
function n(x: number): string {
  return numberWords[x] ?? String(x);
}

function firstName(full: string): string {
  return full.replace(/<.*$/, "").trim().split(/\s+/)[0] ?? full;
}

export function evidenceSummary(e: Evidence): string {
  const party = partyById(e.partyId);
  const who = e.kind === "file" ? (party?.name ?? e.from) : `${firstName(e.from)}${party ? ` at ${party.name}` : ""}`;
  const what = e.kind === "email" ? "email" : e.kind === "file" ? "file" : e.kind === "note" ? "note" : e.kind === "requestListUpdate" ? "request list update" : "Q&A entry";
  return `${what} from ${who}${e.attachmentName ? `, ${e.attachmentName} attached` : ""}`;
}

function todaysDecisions(state: DealState): Proposal[] {
  return state.proposals.filter((p) => p.decision && p.decision.at.slice(0, 10) === state.today);
}

export function draftStatusNote(state: DealState, evidence: Evidence[]): string {
  const c = dealClock(state);
  const vp = personById(state.items[0]?.ownerId ?? "") ?? undefined;
  const decisions = todaysDecisions(state);
  const byId = (id: string) => evidence.find((e) => e.id === id);
  const item = (id: string) => state.items.find((i) => i.id === id) as Item;

  const laneBlocks: string[] = [];
  for (const lane of lanes.filter((l) => l.kind === "workstream")) {
    const lines: string[] = [];
    for (const p of decisions.filter((d) => item(d.itemId)?.laneId === lane.id)) {
      const it = item(p.itemId);
      const e = byId(p.evidenceId);
      if (p.decision!.action === "approved") {
        lines.push(`${it.title} ${words(p.proposedStatus)}${e ? ` (${evidenceSummary(e)})` : ""}.`);
      } else if (p.decision!.action === "askedForConfirmation") {
        lines.push(`${e ? firstName(e.from) : "The sender"} says ${it.title.toLowerCase()} is done; asked for confirmation before we move it.`);
      } else if (p.decision!.action === "rejected") {
        lines.push(`${it.title}: not moved${p.decision!.reason ? ` (${p.decision!.reason})` : ""}.`);
      }
    }
    for (const it of state.items.filter((i) => i.laneId === lane.id && i.status === "blocked")) {
      const last = [...state.activity].reverse().find((a) => a.itemId === it.id && a.action.includes("blocked"));
      const why = last?.action.split(": ")[1];
      lines.push(`${it.title} blocked${why ? `, ${why}` : ""}.`);
    }
    const overdueItems = state.items.filter((i) => i.laneId === lane.id && i.status !== "done" && isOverdue(i.dueDate, state.today) && !lines.some((l) => l.startsWith(i.title)));
    for (const it of overdueItems) lines.push(`${it.title} ${words(it.status)}, was due ${fmtDate(it.dueDate)}.`);
    if (lines.length === 0) {
      const all = state.items.filter((i) => i.laneId === lane.id);
      const done = all.filter((i) => i.status === "done").length;
      lines.push(`No change today. ${done} of ${all.length} steps done.`);
    }
    laneBlocks.push(`${lane.name}: ${lines.join(" ")}`);
  }

  const overdueQs = state.sellerQuestions.filter((q) => !q.answered && isOverdue(q.dueAt, state.today));
  const openQs = state.sellerQuestions.filter((q) => !q.answered && !isOverdue(q.dueAt, state.today));
  const sellerBlock = [
    overdueQs.length ? `Open with the seller, past due: ${overdueQs.map((q) => q.text.toLowerCase()).join("; ")}.` : "",
    openQs.length ? `Still open, not yet due: ${n(openQs.length)} ${openQs.length === 1 ? "item" : "items"}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const signer = personById(state.activity.find((a) => a.action.startsWith("Set up the sprint"))?.by ?? "")?.name ?? vp?.name ?? "";

  return [
    "Team,",
    "",
    `Status as of tonight, day ${c.dayIndex}. ${cap(n(c.daysToIc))} days to IC, ${n(c.daysToBid)} to the bid.`,
    "",
    ...laneBlocks,
    "",
    sellerBlock,
    "",
    firstName(signer),
  ].join("\n");
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Plain words for the strength of a proposal, for the card. No scores.
export function strengthWords(p: Proposal, e: Evidence | undefined, laneName: string): { title: string; detail: string } {
  const party = partyById(e?.partyId);
  if (p.strength === "clear") {
    return {
      title: "Clear",
      detail: e?.attachmentName
        ? `${e.attachmentName} attached, from ${party ? party.name : firstName(e.from)}, the ${laneName} advisor.`
        : `${party ? party.name : e ? firstName(e.from) : "The sender"} is the ${laneName} advisor and the note is specific.`,
    };
  }
  if (p.strength === "thin") {
    return { title: "Thin", detail: "One line, no attachment. Ask the sender before the tracker moves." };
  }
  return { title: "Conflicts with the tracker", detail: p.conflictNote ?? "The claim does not match the current status." };
}
