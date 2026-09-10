"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EvidenceViewer } from "@/components/Inbox/EvidenceViewer";
import { ProposalCard } from "@/components/Inbox/ProposalCard";
import { ActionBar } from "@/components/Shell/ActionBar";
import { useStore } from "@/lib/store";
import { words } from "@/lib/transitions";
import type { DecisionAction } from "@/lib/types";

export default function InboxPage() {
  const state = useStore((s) => s.state);
  const evidence = useStore((s) => s.evidence);
  const reading = useStore((s) => s.readingEvidenceId);
  const decide = useStore((s) => s.decide);
  const toast = useStore((s) => s.toast);

  // Proposals whose evidence is still in the inbox: undecided first, then questions out.
  const rows = useMemo(() => {
    const inInbox = state.proposals.filter((p) => state.inboxEvidenceIds.includes(p.evidenceId));
    const open = inInbox.filter((p) => !p.decision);
    const asked = inInbox.filter((p) => p.decision?.action === "askedForConfirmation");
    return [...open, ...asked]
      .map((p) => ({ proposal: p, evidence: evidence.find((e) => e.id === p.evidenceId), item: state.items.find((i) => i.id === p.itemId) }))
      .filter((r) => r.evidence && r.item) as { proposal: (typeof inInbox)[number]; evidence: NonNullable<(typeof evidence)[number]>; item: NonNullable<(typeof state.items)[number]> }[];
  }, [state, evidence]);
  const open = rows.filter((r) => !r.proposal.decision);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const selected = rows.find((r) => r.proposal.id === selectedId) ?? open[0] ?? rows[0];

  useEffect(() => {
    if (selected && selected.proposal.id !== selectedId) setSelectedId(selected.proposal.id);
    if (reading) setSelectedId(null);
  }, [selected, selectedId, reading]);

  function act(action: DecisionAction, why?: string) {
    if (!selected) return;
    const { proposal, item, evidence: ev } = selected;
    decide(proposal.id, action, why);
    const sender = ev.from.replace(/<.*$/, "").trim().split(/\s+/)[0];
    toast(
      action === "approved"
        ? `${item.title} is now ${words(proposal.proposedStatus)}`
        : action === "rejected"
          ? `Left ${item.title} at ${words(item.status)}`
          : `Asked ${sender} to confirm`,
    );
    setRejecting(false);
    setReason("");
    const idx = open.findIndex((r) => r.proposal.id === proposal.id);
    const next = open[idx + 1] ?? open.find((r) => r.proposal.id !== proposal.id);
    setSelectedId(next?.proposal.id ?? null);
  }

  const position = selected && !selected.proposal.decision ? open.findIndex((r) => r.proposal.id === selected.proposal.id) + 1 : 0;

  return (
    <div className="flex h-full flex-col">
      <div className="grid min-h-0 flex-1 grid-cols-[400px_1fr] gap-6 overflow-hidden px-6 pt-5">
        <div className="flex min-h-0 flex-col gap-3 overflow-auto pb-6" data-testid="inbox-list">
          <div className="flex items-baseline justify-between">
            <h2 className="serif text-[20px] font-semibold">Evidence waiting</h2>
            <span className="text-[13px] text-muted">
              {open.length} {open.length === 1 ? "proposal" : "proposals"} for you
            </span>
          </div>
          {reading && (
            <div className="card animate-pulse p-4 text-[14px] text-muted" data-testid="agent-reading">
              New evidence arrived. The agent is reading it and looking for the matching step.
            </div>
          )}
          {rows.length === 0 && !reading && (
            <div className="card p-6 text-center text-[14px] text-muted">Nothing waiting. Evidence lands here as it arrives.</div>
          )}
          {rows.map((r) => (
            <ProposalCard
              key={r.proposal.id}
              proposal={r.proposal}
              evidence={r.evidence}
              item={r.item}
              selected={selected?.proposal.id === r.proposal.id}
              onSelect={() => {
                setSelectedId(r.proposal.id);
                setRejecting(false);
              }}
            />
          ))}
        </div>
        <div className="min-h-0 overflow-auto pb-6">
          {selected ? (
            <EvidenceViewer evidence={selected.evidence} proposal={selected.proposal} item={selected.item} />
          ) : (
            <div className="card p-6 text-[14px] text-muted">Select a piece of evidence to read it.</div>
          )}
        </div>
      </div>

      <ActionBar
        left={
          rejecting && selected ? (
            <div className="flex items-center gap-2">
              <label htmlFor="reject-reason" className="whitespace-nowrap font-semibold text-ink">
                Why not?
              </label>
              <input
                id="reject-reason"
                data-testid="reject-reason"
                autoFocus
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="One line. It goes in the audit trail."
                className="h-9 w-[420px] rounded-[10px] border border-line px-3 text-[14px] text-ink"
              />
            </div>
          ) : selected && !selected.proposal.decision ? (
            <span>
              Proposal {position} of {open.length}: <span className="font-semibold text-ink">{selected.item.title}</span> to{" "}
              {words(selected.proposal.proposedStatus)}
            </span>
          ) : open.length === 0 ? (
            <span>Inbox is clear. Every change has its evidence and its approver.</span>
          ) : (
            <span>Confirmation requested. Waiting on the sender.</span>
          )
        }
      >
        {selected && !selected.proposal.decision ? (
          rejecting ? (
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setRejecting(false)} data-testid="reject-cancel">
                Cancel
              </button>
              <button type="button" className="btn btn-primary" disabled={reason.trim().length === 0} onClick={() => act("rejected", reason.trim())} data-testid="reject-confirm">
                Reject with this reason
              </button>
            </>
          ) : (
            <DecisionButtons
              strength={selected.proposal.strength}
              proposedStatus={words(selected.proposal.proposedStatus)}
              onApprove={() => act("approved")}
              onReject={() => setRejecting(true)}
              onAsk={() => act("askedForConfirmation", "one line, no attachment, asked the sender which steps are done")}
            />
          )
        ) : (
          <Link href="/deal/note" className="btn btn-primary" data-testid="primary-action">
            Draft tonight&apos;s note
          </Link>
        )}
      </ActionBar>
    </div>
  );
}

// One primary button. Thin evidence never gets Approve as the primary.
function DecisionButtons({
  strength,
  proposedStatus,
  onApprove,
  onReject,
  onAsk,
}: {
  strength: "clear" | "thin" | "conflict";
  proposedStatus: string;
  onApprove: () => void;
  onReject: () => void;
  onAsk: () => void;
}) {
  if (strength === "clear") {
    return (
      <>
        <button type="button" className="btn btn-secondary" onClick={onReject} data-testid="reject">
          Reject
        </button>
        <button type="button" className="btn btn-needs" onClick={onApprove} data-testid="primary-action">
          Approve: mark {proposedStatus}
        </button>
      </>
    );
  }
  if (strength === "thin") {
    return (
      <>
        <button type="button" className="btn btn-secondary" onClick={onReject} data-testid="reject">
          Reject
        </button>
        <button type="button" className="btn btn-secondary" onClick={onApprove} data-testid="approve-anyway">
          Approve anyway
        </button>
        <button type="button" className="btn btn-needs" onClick={onAsk} data-testid="primary-action">
          Ask for confirmation
        </button>
      </>
    );
  }
  return (
    <>
      <button type="button" className="btn btn-secondary" onClick={onReject} data-testid="reject">
        Tracker is right, reject
      </button>
      <button type="button" className="btn btn-secondary" onClick={onApprove} data-testid="approve-anyway">
        Sender is right, approve
      </button>
      <button type="button" className="btn btn-needs" onClick={onAsk} data-testid="primary-action">
        Ask the sender which is right
      </button>
    </>
  );
}
