"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import type { StateName } from "@/lib/types";

const stateLabels: { name: StateName; label: string; hint: string }[] = [
  { name: "kickoff", label: "Kickoff", hint: "IC approved yesterday. Tracker empty." },
  { name: "midstream", label: "Midstream", hint: "Day 21. Nine days to IC. Three in the inbox." },
  { name: "ic-minus-3", label: "IC minus 3", hint: "Day 27. Two sections unsupported." },
];

// Shift+P opens it. Dashed controls so the room can tell them from the product.
export function PresenterMenu() {
  const router = useRouter();
  const open = useStore((s) => s.presenterOpen);
  const setOpen = useStore((s) => s.setPresenterOpen);
  const stateName = useStore((s) => s.stateName);
  const loadState = useStore((s) => s.loadState);
  const resetState = useStore((s) => s.resetState);
  const simulate = useStore((s) => s.simulateNextEvidence);
  const agentMode = useStore((s) => s.agentMode);
  const setAgentMode = useStore((s) => s.setAgentMode);
  const toast = useStore((s) => s.toast);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (e.shiftKey && (e.key === "P" || e.key === "p") && !typing) {
        e.preventDefault();
        setOpen(!useStore.getState().presenterOpen);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} data-testid="presenter-menu">
      <div className="absolute right-6 top-20 w-[360px] rounded-[14px] border border-dashed border-muted bg-panel p-5 shadow-card" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="label">Presenter</div>
          <span className="text-[12px] text-muted">Shift+P, Esc closes</span>
        </div>

        <div className="mt-4 text-[13px] font-semibold">Jump to a state</div>
        <div className="mt-2 flex flex-col gap-1.5">
          {stateLabels.map((s) => (
            <button
              key={s.name}
              type="button"
              data-testid={`presenter-state-${s.name}`}
              onClick={() => {
                loadState(s.name);
                toast(`Loaded ${s.label}`);
                router.push("/deal");
                setOpen(false);
              }}
              className={`btn btn-demo !h-auto !justify-start !px-3 !py-2 text-left ${stateName === s.name ? "!border-solid !border-brand !text-brand" : ""}`}
            >
              <span className="leading-tight">
                <span className="block">{s.label}</span>
                <span className="block text-[12px] font-normal text-muted">{s.hint}</span>
              </span>
            </button>
          ))}
          <button
            type="button"
            className="btn btn-demo"
            data-testid="presenter-reset"
            onClick={() => {
              resetState();
              toast("State reset");
              setOpen(false);
            }}
          >
            Reset this state
          </button>
        </div>

        <div className="mt-4 text-[13px] font-semibold">Evidence</div>
        <button
          type="button"
          className="btn btn-demo mt-2 w-full"
          data-testid="presenter-simulate"
          onClick={() => {
            const e = simulate();
            toast(e ? `Arrived: ${e.subject}` : "Nothing left to arrive in this state");
            if (e) router.push("/deal/inbox");
            setOpen(false);
          }}
        >
          Simulate evidence arriving
        </button>

        <div className="mt-4 text-[13px] font-semibold">Agent</div>
        <div className="seg mt-2" role="group" aria-label="Agent mode">
          <button type="button" aria-pressed={agentMode === "mock"} onClick={() => setAgentMode("mock")} data-testid="presenter-mode-mock">
            Mock
          </button>
          <button type="button" aria-pressed={agentMode === "live"} onClick={() => setAgentMode("live")} data-testid="presenter-mode-live">
            Live
          </button>
        </div>
        <p className="mt-1 text-[12px] text-muted">Live drafts the note with Claude when a key is set. Any failure falls back to mock and says so.</p>
      </div>
    </div>
  );
}
