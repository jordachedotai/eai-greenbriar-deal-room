import Link from "next/link";
import type { LoopStage } from "@/lib/loop";

export function ComingNext({ stage }: { stage: LoopStage }) {
  return (
    <div className="p-8">
      <div className="card max-w-[560px] p-6">
        <div className="label">Stage {stage.stage} of 5</div>
        <h2 className="serif mt-1 text-[24px] font-semibold">{stage.room}</h2>
        <p className="mt-2 text-[16px]">{stage.next}</p>
        <Link href="/deal" className="btn btn-secondary mt-5">
          Back to the Deal Room
        </Link>
      </div>
    </div>
  );
}
