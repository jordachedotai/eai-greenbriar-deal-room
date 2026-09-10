"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { workStrip } from "@/lib/selectors";

// The one primary button on the Deal Room screen, pinned, labeled with what it does.
export function PrimaryAction() {
  const state = useStore((s) => s.state);
  const setupSprint = useStore((s) => s.setupSprint);
  const w = workStrip(state);

  if (state.items.length === 0) {
    return (
      <button type="button" className="btn btn-primary" onClick={setupSprint} data-testid="primary-action">
        Set up the sprint
      </button>
    );
  }
  if (w.waiting > 0) {
    return (
      <Link href="/deal/inbox" className="btn btn-needs" data-testid="primary-action">
        Review {w.waiting} {w.waiting === 1 ? "proposal" : "proposals"}
      </Link>
    );
  }
  return (
    <Link href="/deal/note" className="btn btn-primary" data-testid="primary-action">
      Draft tonight&apos;s note
    </Link>
  );
}
