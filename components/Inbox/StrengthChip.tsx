import type { ProposalStrength } from "@/lib/types";

const tone: Record<ProposalStrength, string> = { clear: "chip-locked", thin: "chip-waiting", conflict: "chip-needsYou" };
const label: Record<ProposalStrength, string> = { clear: "Clear", thin: "Thin", conflict: "Conflict" };

export function StrengthChip({ strength }: { strength: ProposalStrength }) {
  return (
    <span className={`chip ${tone[strength]}`} data-strength={strength}>
      {label[strength]}
    </span>
  );
}
