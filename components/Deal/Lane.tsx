"use client";
import { partyById, personById } from "@/lib/data";
import { itemsByLane } from "@/lib/selectors";
import { useStore } from "@/lib/store";
import type { Lane as LaneT } from "@/lib/types";
import { Face } from "@/components/Shell/Face";
import { ItemCard } from "./ItemCard";

export function Lane({ lane }: { lane: LaneT }) {
  const state = useStore((s) => s.state);
  const items = itemsByLane(state, lane.id);
  const done = items.filter((i) => i.status === "done").length;
  const owner = personById(lane.ownerId);
  const party = partyById(lane.externalPartyId);
  return (
    <section className="flex min-w-[176px] flex-1 flex-col" data-testid={`lane-${lane.id}`} aria-label={lane.name}>
      <header className="mb-2 flex items-start justify-between gap-2 px-1">
        <div className="min-w-0 leading-tight">
          <h3 className="text-[15px] font-semibold">{lane.name}</h3>
          <div className="text-[12px] text-muted">
            {party ? party.name : lane.kind === "memo" ? "IC memo" : "Internal"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap text-[12px] text-muted">
            {done} of {items.length}
          </span>
          {owner && <Face name={owner.name} size={24} />}
        </div>
      </header>
      <div className="flex flex-col gap-2 rounded-[14px] bg-idle-bg/60 p-2">
        {items.length === 0 ? (
          <div className="rounded-[10px] border border-dashed border-line px-3 py-6 text-center text-[13px] text-muted">Nothing yet</div>
        ) : (
          items.map((i) => <ItemCard key={i.id} item={i} />)
        )}
      </div>
    </section>
  );
}
