"use client";
import { lanes, personById } from "@/lib/data";
import { coverageLabel, laneProgress, lanesOwing, recomputeCoverage } from "@/lib/readiness";
import { itemsByLane } from "@/lib/selectors";
import { useStore } from "@/lib/store";
import type { Coverage } from "@/lib/types";
import { Face } from "@/components/Shell/Face";

const tone: Record<Coverage, string> = { full: "chip-locked", partial: "chip-waiting", none: "chip-needsYou" };

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
            <th>Coverage</th>
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
                  if (!supports) return <td key={l.id} className="text-center text-line">·</td>;
                  const p = laneProgress(l.id, state.items);
                  const t = p >= 0.6 ? "chip-locked" : p >= 0.3 ? "chip-waiting" : "chip-needsYou";
                  return (
                    <td key={l.id} className="text-center">
                      <span className={`chip ${t}`} title={`${l.name} is ${Math.round(p * 100)}% done`}>
                        {Math.round(p * 100)}%
                      </span>
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
