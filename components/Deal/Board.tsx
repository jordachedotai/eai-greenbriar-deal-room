"use client";
import { lanes } from "@/lib/data";
import { Lane } from "./Lane";

export function Board() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-6" data-testid="board">
      {lanes.filter((l) => l.kind === "workstream").map((l) => (
        <Lane key={l.id} lane={l} />
      ))}
    </div>
  );
}
