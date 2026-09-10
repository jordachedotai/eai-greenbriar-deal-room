import { ComingNext } from "@/components/Shell/ComingNext";
import { loopStages } from "@/lib/loop";

export default function Page() {
  return <ComingNext stage={loopStages.find((s) => s.stage === 5)!} />;
}
