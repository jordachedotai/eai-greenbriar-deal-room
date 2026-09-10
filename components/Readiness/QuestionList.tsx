"use client";
import { daysBetween, fmtDate, isOverdue } from "@/lib/clock";
import { laneById } from "@/lib/data";
import { useStore } from "@/lib/store";

// Open questions to the seller, tagged by workstream. Overdue ones first.
export function QuestionList() {
  const state = useStore((s) => s.state);
  const qs = [...state.sellerQuestions].sort((a, b) => {
    const rank = (q: typeof a) => (q.answered ? 2 : isOverdue(q.dueAt, state.today) ? 0 : 1);
    return rank(a) - rank(b) || a.dueAt.localeCompare(b.dueAt);
  });
  const overdue = qs.filter((q) => !q.answered && isOverdue(q.dueAt, state.today)).length;
  const open = qs.filter((q) => !q.answered).length;
  return (
    <section className="card px-5 py-4" data-testid="question-list">
      <div className="flex items-baseline justify-between">
        <h3 className="serif text-[18px] font-semibold">Seller questions</h3>
        <span className="text-[13px] text-muted">
          {open} open, {overdue} overdue
        </span>
      </div>
      <ul className="mt-2 flex flex-col divide-y divide-line">
        {qs.map((q) => {
          const late = !q.answered && isOverdue(q.dueAt, state.today);
          const days = daysBetween(q.dueAt, state.today);
          return (
            <li key={q.id} className={`flex items-center gap-3 py-1.5 ${q.answered ? "text-muted" : ""}`} data-testid={`question-${q.id}`} data-overdue={late}>
              <span className={`chip w-[92px] justify-center ${q.answered ? "chip-locked" : late ? "chip-waiting" : "chip-idle"}`}>
                {q.answered ? "Answered" : late ? `Overdue ${days}d` : `Due ${fmtDate(q.dueAt)}`}
              </span>
              <span className="min-w-0 flex-1 truncate text-[14px]">{q.text}</span>
              <span className="whitespace-nowrap text-[12px] text-muted">
                {laneById(q.laneId)?.name}, asked {fmtDate(q.askedAt)}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
