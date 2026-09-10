"use client";
import { lanes, memoSectionDefs, workstreamDefs } from "@/lib/data";

// State `kickoff`: the tracker is empty and the agent proposes the plan from the playbook.
export function KickoffCard() {
  const steps = workstreamDefs.reduce((n, w) => n + w.steps.length, 0) + memoSectionDefs.length;
  return (
    <div className="card mb-5 flex items-center justify-between gap-6 border-needs-fg/30 bg-needs-bg/40 p-5" data-testid="kickoff-card">
      <div>
        <div className="label !text-needs-fg">Proposal from the playbook</div>
        <h2 className="serif mt-1 text-[20px] font-semibold">IC approved the Criteria Worksheet yesterday. Set up the 30-day sprint?</h2>
        <p className="mt-1 text-[14px] text-muted">
          {steps} steps across {lanes.length} lanes, each with an owner, a due day, and what done looks like. Nothing is written until you click.
        </p>
      </div>
    </div>
  );
}
