"use client";
import { fmtDateTime } from "@/lib/clock";
import { laneById, partyById, personById } from "@/lib/data";
import { strengthWords } from "@/lib/mockAgent";
import { words } from "@/lib/transitions";
import type { Evidence, Item, Proposal } from "@/lib/types";
import { StatusChip } from "@/components/Deal/StatusChip";
import { StrengthChip } from "./StrengthChip";

const kindLabel: Record<Evidence["kind"], string> = {
  email: "Email",
  file: "File in the drop zone",
  note: "Note",
  requestListUpdate: "Request list update",
  qaEntry: "Q&A entry",
};

export function EvidenceViewer({ evidence, proposal, item }: { evidence: Evidence; proposal: Proposal; item: Item }) {
  const lane = laneById(item.laneId);
  const party = partyById(evidence.partyId);
  const sw = strengthWords(proposal, evidence, lane?.name ?? "");
  const decided = proposal.decision;
  return (
    <div className="flex flex-col gap-4" data-testid="evidence-viewer">
      <section className="card p-5">
        <div className="label">{kindLabel[evidence.kind]}</div>
        <h2 className="serif mt-1 text-[20px] font-semibold leading-tight">{evidence.subject}</h2>
        <dl className="mt-2 grid grid-cols-[72px_1fr] gap-y-0.5 text-[14px]">
          <dt className="text-muted">From</dt>
          <dd>
            {evidence.from}
            {party ? ` (${party.name})` : ""}
          </dd>
          <dt className="text-muted">Received</dt>
          <dd>{fmtDateTime(evidence.receivedAt)}</dd>
          {evidence.attachmentName && (
            <>
              <dt className="text-muted">Attached</dt>
              <dd className="font-semibold">{evidence.attachmentName}</dd>
            </>
          )}
        </dl>
        <div className="mt-4 whitespace-pre-wrap rounded-[10px] border border-line bg-bg px-4 py-3 text-[15px] leading-relaxed">
          <Highlighted body={evidence.body} quote={proposal.quotedSource} />
        </div>
      </section>

      <section className="card p-5" data-testid="proposal-detail">
        <div className="flex items-center justify-between">
          <div className="label">Proposal from the agent</div>
          <StrengthChip strength={proposal.strength} />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[15px]">
          <span className="font-semibold">{item.title}</span>
          <span className="text-muted">in {lane?.name}</span>
          <StatusChip status={item.status} />
          <span className="text-muted">to</span>
          <StatusChip status={proposal.proposedStatus} />
        </div>
        <p className="mt-3 text-[15px]">
          <span className="font-semibold">{sw.title}.</span> {sw.detail}
        </p>
        {proposal.strength === "conflict" && (
          <div className="mt-3 grid grid-cols-2 gap-3 text-[14px]" data-testid="conflict-claims">
            <div className="rounded-[10px] border border-line p-3">
              <div className="label !text-[11px]">The sender says</div>
              <div className="mt-1 italic">“{proposal.quotedSource}”</div>
            </div>
            <div className="rounded-[10px] border border-line p-3">
              <div className="label !text-[11px]">The tracker says</div>
              <div className="mt-1">{proposal.conflictNote}</div>
            </div>
          </div>
        )}
        <p className="mt-3 text-[13px] text-muted">Done looks like: {item.doneLooksLike}</p>
        {decided && (
          <p className="mt-3 rounded-[10px] bg-bg px-3 py-2 text-[14px]" data-testid="decision-line">
            {decided.action === "approved" ? "Approved" : decided.action === "rejected" ? "Rejected" : "Confirmation requested"} by{" "}
            {personById(decided.by)?.name ?? decided.by}, {fmtDateTime(decided.at)}
            {decided.reason ? `. ${decided.reason}` : ""}
          </p>
        )}
        {!decided && <p className="mt-3 text-[13px] text-muted">Nothing moves until you decide below. The tracker stays at {words(item.status)}.</p>}
      </section>
    </div>
  );
}

function Highlighted({ body, quote }: { body: string; quote: string }) {
  const idx = body.indexOf(quote);
  if (idx < 0) return <>{body}</>;
  return (
    <>
      {body.slice(0, idx)}
      <mark className="rounded bg-needs-bg px-0.5 text-ink" data-testid="quote-highlight">
        {quote}
      </mark>
      {body.slice(idx + quote.length)}
    </>
  );
}
