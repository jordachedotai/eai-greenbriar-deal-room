"use client";
import { ActionBar } from "@/components/Shell/ActionBar";
import { Board } from "@/components/Deal/Board";
import { KickoffCard } from "@/components/Deal/KickoffCard";
import { LanesView } from "@/components/Deal/LanesView";
import { PrimaryAction } from "@/components/Deal/PrimaryAction";
import { ViewToggle } from "@/components/Deal/ViewToggle";
import { WorkStrip } from "@/components/Deal/WorkStrip";
import { useStore } from "@/lib/store";

export default function DealPage() {
  const view = useStore((s) => s.view);
  const empty = useStore((s) => s.state.items.length === 0);
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-4 px-6 pt-5">
        <WorkStrip />
        <ViewToggle />
      </div>
      <div className="min-h-0 flex-1 overflow-auto px-6 pb-6 pt-5">
        {empty && <KickoffCard />}
        {view === "board" ? <Board /> : <LanesView />}
      </div>
      <ActionBar>
        <PrimaryAction />
      </ActionBar>
    </div>
  );
}
