"use client";
import { fmtDate, isOverdue } from "@/lib/clock";
import { personById } from "@/lib/data";
import { cardStatus, pendingProposalFor } from "@/lib/selectors";
import { useStore } from "@/lib/store";
import type { Item } from "@/lib/types";
import { Face } from "@/components/Shell/Face";
import { StatusChip } from "./StatusChip";

export function ItemCard({ item }: { item: Item }) {
  const state = useStore((s) => s.state);
  const owner = personById(item.ownerId);
  const status = cardStatus(item, state);
  const pending = pendingProposalFor(item.id, state);
  const overdue = item.status !== "done" && isOverdue(item.dueDate, state.today);
  return (
    <article className="card flex flex-col gap-1.5 px-3 py-2.5" data-testid={`item-${item.id}`} data-status={status} title={`Done looks like: ${item.doneLooksLike}`}>
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-[14px] font-semibold leading-snug">{item.title}</h4>
        {owner && <Face name={owner.name} size={24} />}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <StatusChip status={status} />
        {pending && <span className="chip chip-needsYou">Proposal waiting</span>}
      </div>
      <div className="flex items-center justify-between whitespace-nowrap text-[12px] text-muted">
        <span className={overdue ? "font-semibold text-waiting-fg" : ""}>
          {overdue ? "Overdue " : "Due "}
          {fmtDate(item.dueDate)}
        </span>
        {item.evidenceIds.length > 0 && <span>{item.evidenceIds.length} evidence</span>}
      </div>
    </article>
  );
}
