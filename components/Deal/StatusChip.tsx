import { statusLabel, statusTone, type CardStatus } from "@/lib/selectors";

export function StatusChip({ status }: { status: CardStatus }) {
  const tone = statusTone[status];
  return (
    <span className={`chip chip-${tone}`} data-status={status}>
      {status === "done" && (
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M2 5.2 4.2 7.4 8 3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {statusLabel[status]}
    </span>
  );
}
