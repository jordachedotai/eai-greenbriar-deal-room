"use client";
import { useStore } from "@/lib/store";

// The bid package. Placeholder list until the sponsor confirms it. Ticks are logged.
export function BidChecklist() {
  const state = useStore((s) => s.state);
  const tick = useStore((s) => s.tickChecklist);
  const done = state.bidChecklist.filter((b) => b.done).length;
  const placeholder = state.bidChecklist.some((b) => b.placeholder);
  return (
    <section className="card px-5 py-4" data-testid="bid-checklist">
      <div className="flex items-baseline justify-between">
        <h3 className="serif text-[18px] font-semibold">Bid checklist</h3>
        <span className="text-[13px] text-muted" data-testid="bid-count">
          {done} of {state.bidChecklist.length} done
        </span>
      </div>
      <ul className="mt-2 flex flex-col gap-0.5">
        {state.bidChecklist.map((b) => (
          <li key={b.id}>
            <label className="flex cursor-pointer items-center gap-3 rounded-[10px] px-2 py-1 hover:bg-bg">
              <input
                type="checkbox"
                checked={b.done}
                onChange={(e) => tick(b.id, e.target.checked)}
                data-testid={`bid-${b.id}`}
                className="h-4 w-4 accent-brand"
              />
              <span className={`text-[14px] ${b.done ? "text-muted line-through" : ""}`}>{b.name}</span>
            </label>
          </li>
        ))}
      </ul>
      {placeholder && <p className="mt-3 text-[12px] text-muted">Placeholder list until the sponsor confirms the bid package.</p>}
    </section>
  );
}
