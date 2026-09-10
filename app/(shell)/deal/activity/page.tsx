"use client";
import Link from "next/link";
import { useState } from "react";
import { ActionBar } from "@/components/Shell/ActionBar";
import { Face } from "@/components/Shell/Face";
import { fmtDateTime } from "@/lib/clock";
import { personById } from "@/lib/data";
import { useStore } from "@/lib/store";

type Filter = "all" | "decisions" | "agent";

export default function ActivityPage() {
  const state = useStore((s) => s.state);
  const evidence = useStore((s) => s.evidence);
  const [filter, setFilter] = useState<Filter>("all");
  const entries = [...state.activity].reverse().filter((a) => {
    if (filter === "decisions") return /^(Approved|Rejected|Asked for confirmation|Sent tonight)/.test(a.action);
    if (filter === "agent") return a.by === "agent";
    return true;
  });
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-6 pt-5">
        <h2 className="serif text-[20px] font-semibold">Activity</h2>
        <div className="seg" role="group" aria-label="Filter">
          {(["all", "decisions", "agent"] as Filter[]).map((f) => (
            <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} data-testid={`activity-filter-${f}`}>
              {f === "all" ? "Everything" : f === "decisions" ? "Decisions" : "Agent proposals"}
            </button>
          ))}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto px-6 pb-6 pt-4">
        <div className="card overflow-hidden">
          <table className="tracker" data-testid="activity-table">
            <thead>
              <tr>
                <th className="w-[160px]">When</th>
                <th className="w-[200px]">Who</th>
                <th>What changed</th>
                <th className="w-[260px]">Evidence</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((a) => {
                const person = personById(a.by);
                const ev = a.evidenceId ? evidence.find((e) => e.id === a.evidenceId) : undefined;
                return (
                  <tr key={a.id} data-testid={`activity-${a.id}`}>
                    <td className="whitespace-nowrap text-muted">{fmtDateTime(a.at)}</td>
                    <td>
                      {person ? (
                        <span className="flex items-center gap-2">
                          <Face name={person.name} size={22} />
                          {person.name}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <span className="face !border-dashed !border-muted !bg-transparent !shadow-none" style={{ width: 22, height: 22, fontSize: 9 }}>
                            AG
                          </span>
                          Agent
                        </span>
                      )}
                    </td>
                    <td>{a.action}</td>
                    <td className="text-muted">{ev ? ev.subject : ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <ActionBar left={<span>{entries.length} entries. Every status change names a person, a time, and the evidence.</span>}>
        <Link href="/deal/note" className="btn btn-primary" data-testid="primary-action">
          Draft tonight&apos;s note
        </Link>
      </ActionBar>
    </div>
  );
}
