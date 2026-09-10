"use client";
import { fmtDateTime } from "@/lib/clock";
import { laneById } from "@/lib/data";
import { evidenceSummary } from "@/lib/mockAgent";
import { words } from "@/lib/transitions";
import type { Evidence, Item, Proposal } from "@/lib/types";
import { StrengthChip } from "./StrengthChip";

export function ProposalCard({
  proposal,
  evidence,
  item,
  selected,
  onSelect,
}: {
  proposal: Proposal;
  evidence: Evidence;
  item: Item;
  selected: boolean;
  onSelect: () => void;
}) {
  const lane = laneById(item.laneId);
  const asked = proposal.decision?.action === "askedForConfirmation";
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      data-testid={`proposal-${proposal.id}`}
      className={`card w-full p-4 text-left transition-colors ${selected ? "border-brand ring-1 ring-brand" : "hover:border-muted"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-[15px] font-semibold">{evidence.subject}</div>
          <div className="truncate text-[13px] text-muted">
            {cap(evidenceSummary(evidence))}. {fmtDateTime(evidence.receivedAt)}.
          </div>
        </div>
        {asked ? <span className="chip chip-waiting">Question out</span> : <StrengthChip strength={proposal.strength} />}
      </div>
      <div className="mt-3 rounded-[10px] bg-bg px-3 py-2 text-[14px]">
        <span className="label !text-[11px]">Proposes</span>
        <div className="mt-0.5">
          <span className="font-semibold">{item.title}</span>
          <span className="text-muted">
            {" "}
            in {lane?.name}: {words(item.status)} to <span className="font-semibold text-ink">{words(proposal.proposedStatus)}</span>
          </span>
        </div>
      </div>
      <blockquote className="mt-2 border-l-2 border-line pl-3 text-[14px] italic text-muted">“{proposal.quotedSource}”</blockquote>
    </button>
  );
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
