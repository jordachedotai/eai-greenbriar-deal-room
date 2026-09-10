"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { workStrip } from "@/lib/selectors";

export function WorkStrip() {
  const state = useStore((s) => s.state);
  const w = workStrip(state);
  const Cell = ({ n, label, tone, href, testId }: { n: number; label: string; tone: "needsYou" | "waiting" | "idle"; href?: string; testId: string }) => {
    const body = (
      <>
        <span className={`chip chip-${tone} serif !h-7 !text-[16px]`}>{n}</span>
        <span className="text-[14px] font-semibold">{label}</span>
      </>
    );
    const cls = "card flex items-center gap-3 px-4 py-2.5";
    return href ? (
      <Link href={href} className={`${cls} hover:border-muted`} data-testid={testId}>
        {body}
      </Link>
    ) : (
      <div className={cls} data-testid={testId}>
        {body}
      </div>
    );
  };
  return (
    <div className="flex items-center gap-3" aria-label="Work strip">
      <Cell n={w.waiting} label="waiting on you" tone="needsYou" href="/deal/inbox" testId="strip-waiting" />
      <Cell n={w.blocked} label="blocked" tone="waiting" testId="strip-blocked" />
      <Cell n={w.dueThisWeek} label="due this week" tone="idle" testId="strip-due" />
      {w.overdue > 0 && <Cell n={w.overdue} label="overdue" tone="waiting" testId="strip-overdue" />}
    </div>
  );
}
