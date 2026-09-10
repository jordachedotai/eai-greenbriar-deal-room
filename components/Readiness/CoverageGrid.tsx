"use client";
import { lanes, personById } from "@/lib/data";
import { coverageLabel, laneProgress, laneState, lanesOwing, recomputeCoverage, type LaneState } from "@/lib/readiness";
import { itemsByLane } from "@/lib/selectors";
import { useStore } from "@/lib/store";
import type { Coverage } from "@/lib/types";
import { Face } from "@/components/Shell/Face";

const tone: Record<Coverage, string> = { full: "chip-locked", partial: "chip-waiting", none: "chip-needsYou" };

const markWords: Record<LaneState, string> = { done: "done", inProgress: "in progress", notStarted: "not started" };
const markColor: Record<LaneState, string> = { done: "var(--color-locked-fg)", inProgress: "var(--color-waiting-fg)", notStarted: "var(--color-idle-fg)" };

// One mark per supporting lane. Filled for done, half for in progress, an empty ring for not started.
function Mark({ state, title }: { state: LaneState; title: string }) {
  const c = markColor[state];
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" role="img" aria-label={title} className="inline-block align-middle">
      <title>{title}</title>
      <circle cx="8" cy="8" r="6" fill={state === "done" ? c : "none"} stroke={c} strokeWidth="1.6" />
      {state === "inProgress" && <path d="M8 2 A6 6 0 0 1 8 14 Z" fill={c} />}
    </svg>
  );
}

// Memo sections down the side, the workstreams that support each across.
export function CoverageGrid() {
  const state = useStore((s) => s.state);
  const workstreams = lanes.filter((l) => l.kind === "workstream");
  const sections = recomputeCoverage(state.memoSections, state.items);
  const memoItem = (id: string) => state.items.find((i) => i.id === id);
  return (
    <div className="card overflow-hidden" data-testid="coverage-grid">
      <table className="tracker compact">
        <thead>
          <tr>
            <th>Memo section</th>
            {workstreams.map((l) => {
              const items = itemsByLane(state, l.id);
              const done = items.filter((i) => i.status === "done").length;
              return (
                <th key={l.id} className="text-center">
                  {l.name}
                  <span className="block font-normal normal-case tracking-normal text-muted">
                    {done} of {items.length} done
                  </span>
                </th>
              );
            })}
            <th>
              Coverage
              <span className="block font-normal normal-case tracking-normal text-muted">marks: lane done, in progress, not started</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sections.map((s) => {
            const item = memoItem(s.id);
            const owner = item ? personById(item.ownerId) : undefined;
            const owing = s.coverage === "none" ? lanesOwing(s, state.items, lanes) : [];
            return (
              <tr key={s.id} data-testid={`coverage-${s.id}`} data-coverage={s.coverage}>
                <td>
                  <div className="flex items-center gap-2">
                    {owner && <Face name={owner.name} size={22} />}
                    <span className="font-semibold">{s.name}</span>
                    {s.placeholder && <span className="chip chip-idle">Placeholder</span>}
                  </div>
                </td>
                {workstreams.map((l) => {
                  const supports = s.supportedBy.includes(l.id);
                  if (!supports) return <td key={l.id} className="text-center" data-mark="blank" />;
                  const ls = laneState(l.id, state.items);
                  const p = laneProgress(l.id, state.items);
                  return (
                    <td key={l.id} className="text-center" data-mark={ls}>
                      <Mark state={ls} title={`${l.name}: ${markWords[ls]}, ${Math.round(p * 100)}% of steps done`} />
                    </td>
                  );
                })}
                <td>
                  <span className={`chip ${tone[s.coverage]}`}>{coverageLabel[s.coverage]}</span>
                  {owing.length > 0 && (
                    <span className="ml-2 text-[13px] text-muted" data-testid={`owed-${s.id}`}>
                      owed by {owing.map((l) => l.name).join(" and ")}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
