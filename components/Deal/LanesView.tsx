"use client";
import { fmtDate, isOverdue } from "@/lib/clock";
import { lanes, partyById, personById } from "@/lib/data";
import { cardStatus, itemsByLane } from "@/lib/selectors";
import { useStore } from "@/lib/store";
import { StatusChip } from "./StatusChip";

// The shape of the shared Excel tracker. The "Tonight" column is what gets typed by hand today.
export function LanesView() {
  const state = useStore((s) => s.state);
  const lastUpdate = (itemId: string) => {
    const entries = state.activity.filter((a) => a.itemId === itemId && a.by !== "agent");
    return entries.length ? entries[entries.length - 1]! : undefined;
  };
  return (
    <div className="card overflow-hidden" data-testid="lanes">
      <div className="max-h-[calc(100vh-290px)] overflow-auto">
        <table className="tracker">
          <thead>
            <tr>
              <th className="w-[34%]">Step</th>
              <th>Owner</th>
              <th>Due</th>
              <th>Status</th>
              <th>Evidence</th>
              <th>Last update</th>
              <th>Tonight</th>
            </tr>
          </thead>
          <tbody>
            {lanes.filter((l) => l.kind === "workstream").map((lane) => {
              const items = itemsByLane(state, lane.id);
              const party = partyById(lane.externalPartyId);
              return [
                <tr key={lane.id} className="lane-row">
                  <td colSpan={7}>
                    {lane.name}
                    {party ? ` with ${party.name}` : ""}
                  </td>
                </tr>,
                ...(items.length === 0
                  ? [
                      <tr key={`${lane.id}-empty`}>
                        <td colSpan={7} className="text-muted">
                          Nothing yet
                        </td>
                      </tr>,
                    ]
                  : items.map((item) => {
                      const owner = personById(item.ownerId);
                      const status = cardStatus(item, state);
                      const last = lastUpdate(item.id);
                      const overdue = item.status !== "done" && isOverdue(item.dueDate, state.today);
                      const open = item.status !== "done";
                      return (
                        <tr key={item.id} data-testid={`row-${item.id}`}>
                          <td className="font-semibold">{item.title}</td>
                          <td>{owner?.name.split(" ")[0]}</td>
                          <td className={overdue ? "font-semibold text-waiting-fg" : ""}>{fmtDate(item.dueDate)}</td>
                          <td>
                            <StatusChip status={status} />
                          </td>
                          <td className="text-muted">{item.evidenceIds.length || ""}</td>
                          <td className="text-muted">{last ? `${fmtDate(last.at)}, ${personById(last.by)?.name.split(" ")[0] ?? ""}` : ""}</td>
                          <td className={open ? "empty-cell" : "text-muted"}>{open ? "" : "Done"}</td>
                        </tr>
                      );
                    })),
              ];
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
