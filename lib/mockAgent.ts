// Templates for the two generative steps in mock mode. Phase 2 fills these in.
import type { DealState, Evidence } from "./types";

export const WORKING_DELAY_MS = 900;

export function draftStatusNote(_state: DealState, _evidence: Evidence[]): string {
  return "Draft not built yet. Phase 2.";
}
