"use client";
import { fmtLongDate } from "@/lib/clock";
import { company } from "@/lib/data";
import { loopStages, currentStage } from "@/lib/loop";
import { useStore } from "@/lib/store";
import { DealClock } from "@/components/Deal/DealClock";
import { Avatar } from "./Avatar";

export function Header() {
  const state = useStore((s) => s.state);
  const stage = loopStages.find((s) => s.stage === currentStage)!;
  return (
    <header className="flex items-center justify-between gap-6 border-b border-line bg-panel px-6 py-4">
      <div className="min-w-0">
        <h1 className="serif text-[24px] font-semibold leading-tight">{company.codeName}</h1>
        <div className="text-[14px] text-muted">
          {company.sector}. Stage {stage.stage} of 5, {stage.name.toLowerCase()}. Today is {fmtLongDate(state.today)}.
        </div>
      </div>
      <div className="flex items-center gap-10">
        <DealClock />
        <div className="h-8 w-px bg-line" />
        <Avatar />
      </div>
    </header>
  );
}
