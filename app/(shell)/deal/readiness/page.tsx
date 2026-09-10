"use client";
import Link from "next/link";
import { BidChecklist } from "@/components/Readiness/BidChecklist";
import { CoverageGrid } from "@/components/Readiness/CoverageGrid";
import { QuestionList } from "@/components/Readiness/QuestionList";
import { ActionBar } from "@/components/Shell/ActionBar";
import { dealClock, isOverdue } from "@/lib/clock";
import { recomputeCoverage } from "@/lib/readiness";
import { useStore } from "@/lib/store";

export default function ReadinessPage() {
  const state = useStore((s) => s.state);
  const c = dealClock(state);
  const sections = recomputeCoverage(state.memoSections, state.items);
  const unsupported = sections.filter((s) => s.coverage === "none").length;
  const overdue = state.sellerQuestions.filter((q) => !q.answered && isOverdue(q.dueAt, state.today)).length;
  const bidDone = state.bidChecklist.filter((b) => b.done).length;
  const noteSent = state.statusNotes.some((n) => n.date === state.today);

  const Cell = ({ n, label, tone, testId }: { n: number; label: string; tone: "needsYou" | "waiting" | "idle" | "locked"; testId: string }) => (
    <div className="card flex items-center gap-3 px-4 py-2.5" data-testid={testId}>
      <span className={`chip chip-${tone} serif !h-7 !text-[16px]`}>{n}</span>
      <span className="text-[14px] font-semibold">{label}</span>
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-4 px-6 pt-5">
        <div>
          <h2 className="serif text-[20px] font-semibold">IC readiness</h2>
          <p className="text-[14px] text-muted">
            {c.daysToIc} days to IC. What the memo still needs, who owes it, and what the bid package is missing.
          </p>
        </div>
        <div className="flex items-center gap-3" aria-label="Readiness strip">
          <Cell n={unsupported} label={unsupported === 1 ? "section unsupported" : "sections unsupported"} tone={unsupported > 0 ? "needsYou" : "locked"} testId="ready-unsupported" />
          <Cell n={overdue} label="seller questions overdue" tone={overdue > 0 ? "waiting" : "locked"} testId="ready-overdue" />
          <Cell n={bidDone} label={`of ${state.bidChecklist.length} bid items done`} tone="idle" testId="ready-bid" />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto px-6 pb-6 pt-3">
        <CoverageGrid />
        <div className="mt-3 grid grid-cols-[1fr_340px] gap-4">
          <QuestionList />
          <BidChecklist />
        </div>
      </div>
      <ActionBar
        left={
          <span>
            {unsupported > 0 ? `${unsupported === 1 ? "One section is" : `${unsupported} sections are`} still unsupported. The board says which workstream owes them.` : "Every memo section has support."}
          </span>
        }
      >
        {noteSent ? (
          <Link href="/deal" className="btn btn-primary" data-testid="primary-action">
            Back to the board
          </Link>
        ) : (
          <Link href="/deal/note" className="btn btn-primary" data-testid="primary-action">
            Draft tonight&apos;s note
          </Link>
        )}
      </ActionBar>
    </div>
  );
}
