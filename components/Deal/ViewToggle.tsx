"use client";
import { useStore } from "@/lib/store";

export function ViewToggle() {
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);
  return (
    <div className="seg" role="group" aria-label="View">
      <button type="button" aria-pressed={view === "board"} onClick={() => setView("board")} data-testid="view-board">
        Board
      </button>
      <button type="button" aria-pressed={view === "lanes"} onClick={() => setView("lanes")} data-testid="view-lanes">
        Lanes
      </button>
    </div>
  );
}
