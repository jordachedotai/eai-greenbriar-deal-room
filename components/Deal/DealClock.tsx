"use client";
import { dealClock, fmtDate } from "@/lib/clock";
import { useStore } from "@/lib/store";

export function DealClock() {
  const state = useStore((s) => s.state);
  const c = dealClock(state);
  const Cell = ({ n, label, date, testId }: { n: number; label: string; date: string; testId: string }) => (
    <div className="flex items-baseline gap-2" data-testid={testId}>
      <span className="serif text-[34px] font-semibold leading-none">{n}</span>
      <span className="leading-tight">
        <span className="block text-[13px] font-semibold">{label}</span>
        <span className="block text-[12px] text-muted">{fmtDate(date)}</span>
      </span>
    </div>
  );
  return (
    <div className="flex items-center gap-8" aria-label="Deal clock">
      <Cell n={c.daysToIc} label="days to IC" date={state.icDate} testId="clock-ic" />
      <Cell n={c.daysToBid} label="days to bid" date={state.bidDate} testId="clock-bid" />
    </div>
  );
}
