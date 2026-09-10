"use client";
// Zustand store persisted to localStorage. Any change to the persisted shape bumps
// STORE_VERSION in the same commit. A version mismatch logs once, then wipes.
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import demoStates from "@/data/demo-states.json";
import { lanes, memoLaneDef, memoSectionDefs, personByRole, workstreamDefs } from "./data";
import { WORKING_DELAY_MS } from "./mockAgent";
import * as T from "./transitions";
import type { AgentMode } from "./agent";
import type { DealState, DecisionAction, Evidence, EvidenceMatch, ItemStatus, StateName } from "./types";

export const STORE_VERSION = 2; // 2: statusNotes on DealState, agentMode persisted
export const STORE_KEY = "greenbriar-deal-room";

export type View = "board" | "lanes";

const states = demoStates.states as Record<StateName, DealState>;

export function savedState(name: StateName): DealState {
  return JSON.parse(JSON.stringify(states[name])) as DealState;
}

// The store never reads the wall clock. Decisions are stamped at the state's frozen
// `today` plus the real time of day, so the audit trail reads naturally in the room.
function stampNow(state: DealState): string {
  const now = new Date();
  const hh = now.getHours().toString().padStart(2, "0");
  const mm = now.getMinutes().toString().padStart(2, "0");
  const ss = now.getSeconds().toString().padStart(2, "0");
  return `${state.today}T${hh}:${mm}:${ss}Z`;
}

type Persisted = {
  currentUserId: string | null;
  view: View;
  stateName: StateName;
  state: DealState;
  agentMode: AgentMode;
};

export type Toast = { id: number; text: string };

type Volatile = {
  hasHydrated: boolean;
  evidence: Evidence[];
  matches: EvidenceMatch[];
  readingEvidenceId: string | null; // the agent is "reading" a fresh arrival
  toasts: Toast[];
  presenterOpen: boolean;
};

type Actions = {
  signIn: (personId: string) => void;
  signOut: () => void;
  setView: (v: View) => void;
  loadState: (name: StateName) => void;
  resetState: () => void;
  setSources: (evidence: Evidence[], matches: EvidenceMatch[]) => void;
  setHydrated: (v: boolean) => void;
  setupSprint: () => void;
  decide: (proposalId: string, action: DecisionAction, reason?: string) => void;
  setStatusByHand: (itemId: string, status: ItemStatus, note?: string) => void;
  simulateNextEvidence: () => Evidence | undefined;
  sendStatusNote: (text: string, mock: boolean) => void;
  setAgentMode: (m: AgentMode) => void;
  toast: (text: string) => void;
  dismissToast: (id: number) => void;
  clearToasts: () => void;
  tickChecklist: (checklistId: string, done: boolean) => void;
  setPresenterOpen: (v: boolean) => void;
};

export type Store = Persisted & Volatile & Actions;

const initialPersisted: Persisted = {
  currentUserId: null,
  view: "board",
  stateName: "midstream",
  state: savedState("midstream"),
  agentMode: "mock",
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initialPersisted,
      hasHydrated: false,
      evidence: [],
      matches: [],
      readingEvidenceId: null,
      toasts: [],
      presenterOpen: false,

      signIn: (personId) => set({ currentUserId: personId }),
      signOut: () => set({ currentUserId: null }),
      setView: (view) => set({ view }),
      loadState: (name) => set({ stateName: name, state: savedState(name) }),
      resetState: () => set({ state: savedState(get().stateName) }),
      setSources: (evidence, matches) => set({ evidence, matches }),
      setHydrated: (hasHydrated) => set({ hasHydrated }),

      setupSprint: () => {
        const { state, currentUserId } = get();
        if (!currentUserId) return;
        set({
          state: T.setupSprint(state, currentUserId, stampNow(state), {
            lanes,
            workstreams: workstreamDefs,
            memoSections: memoSectionDefs,
            memoLane: memoLaneDef,
            personByRole,
          }),
        });
      },

      decide: (proposalId, action, reason) => {
        const { state, currentUserId } = get();
        if (!currentUserId) return;
        set({ state: T.decide(state, proposalId, action, currentUserId, stampNow(state), reason) });
      },

      setStatusByHand: (itemId, status, note) => {
        const { state, currentUserId } = get();
        if (!currentUserId) return;
        set({ state: T.setStatusByHand(state, itemId, status, currentUserId, stampNow(state), note) });
      },

      // Presenter control: the next unseen piece of evidence lands in the inbox.
      simulateNextEvidence: () => {
        const { state, evidence, matches } = get();
        const seen = new Set([...state.inboxEvidenceIds, ...state.processedEvidenceIds]);
        const next = evidence.find((e) => !seen.has(e.id));
        if (!next) return undefined;
        const arrival = { ...next, receivedAt: stampNow(state) };
        set({
          state: T.receiveEvidence(state, arrival, matches.find((m) => m.evidenceId === next.id), lanes, arrival.receivedAt),
          evidence: evidence.map((e) => (e.id === next.id ? arrival : e)),
          readingEvidenceId: next.id,
        });
        setTimeout(() => set({ readingEvidenceId: null }), WORKING_DELAY_MS);
        return arrival;
      },

      sendStatusNote: (text, mock) => {
        const { state, currentUserId } = get();
        if (!currentUserId) return;
        set({ state: T.sendStatusNote(state, text, currentUserId, stampNow(state), mock) });
      },

      setAgentMode: (agentMode) => set({ agentMode }),
      toast: (text) => {
        const id = Date.now() + Math.random();
        set((s) => ({ toasts: [...s.toasts, { id, text }] }));
        setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4000);
      },
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
      clearToasts: () => set({ toasts: [] }),
      tickChecklist: (checklistId, done) => {
        const { state, currentUserId } = get();
        if (!currentUserId) return;
        set({ state: T.tickChecklist(state, checklistId, done, currentUserId, stampNow(state)) });
      },
      setPresenterOpen: (presenterOpen) => set({ presenterOpen }),
    }),
    {
      name: STORE_KEY,
      version: STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (s): Persisted => ({ currentUserId: s.currentUserId, view: s.view, stateName: s.stateName, state: s.state, agentMode: s.agentMode }),
      migrate: (persisted, fromVersion) => {
        // A stale browser in the room explains itself, once, then starts clean.
        console.warn(
          `[deal-room] Saved store is version ${fromVersion}, this build is version ${STORE_VERSION}. Clearing the saved state and loading "${initialPersisted.stateName}".`,
        );
        void persisted;
        return { ...initialPersisted };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export function useCurrentUser() {
  const id = useStore((s) => s.currentUserId);
  return id;
}
