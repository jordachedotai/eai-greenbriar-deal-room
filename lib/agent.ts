// Dispatches the two generative steps: mock templates by default, Claude in live mode.
// Everything the agent produces is a draft or a proposal. It never writes to the tracker.
import { draftStatusNote as mockDraftStatusNote } from "./mockAgent";
import type { DealState, Evidence } from "./types";

export const MOCK_MODE = (process.env.MOCK_MODE ?? "true") !== "false";

export type AgentMode = "mock" | "live";

// Live mode posts to app/api/agent/route.ts. Any failure falls back to the mock template.
// Mock mode never touches the network.
export async function draftStatusNote(state: DealState, evidence: Evidence[], mode: AgentMode): Promise<{ text: string; mock: boolean }> {
  const fallback = mockDraftStatusNote(state, evidence);
  if (mode !== "live") return { text: fallback, mock: true };
  try {
    const res = await fetch("/api/agent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ step: "statusNote", draft: fallback, today: state.today }),
    });
    if (!res.ok) return { text: fallback, mock: true };
    const data = (await res.json()) as { text?: string };
    return data.text ? { text: data.text, mock: false } : { text: fallback, mock: true };
  } catch {
    return { text: fallback, mock: true };
  }
}
