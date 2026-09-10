// Dispatches the two generative steps: mock templates by default, Claude in live mode.
// Everything the agent produces is a draft or a proposal. It never writes to the tracker.
import { draftStatusNote as mockDraftStatusNote } from "./mockAgent";
import type { DealState, Evidence } from "./types";

export const MOCK_MODE = (process.env.MOCK_MODE ?? "true") !== "false";

export async function draftStatusNote(state: DealState, evidence: Evidence[]): Promise<{ text: string; mock: boolean }> {
  // Live mode posts to app/api/agent/route.ts in Phase 2. Any failure falls back to mock.
  return { text: mockDraftStatusNote(state, evidence), mock: true };
}
