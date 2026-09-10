"use client";
// Zustand store persisted to localStorage. Any change to the persisted shape bumps
// STORE_VERSION in the same commit. A version mismatch logs once, then wipes.
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import demoStates from "@/data/demo-states.json";
import { lanes, memoLaneDef, memoSectionDefs, personByRole, workstreamDefs } from "./data";
import * as T from "./transitions";
import type { DealState, DecisionAction, Evidence, EvidenceMatch, ItemStatus, StateName } from "./types";

export const STORE_VERSION = 1;
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
};

type Volatile = {
  hasHydrated: boolean;
  evidence: Evidence[];
  matches: EvidenceMatch[];
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
};

export type Store = Persisted & Volatile & Actions;

const initialPersisted: Persisted = {
  currentUserId: null,
  view: "board",
  stateName: "midstream",
  state: savedState("midstream"),
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initialPersisted,
      hasHydrated: false,
      evidence: [],
      matches: [],

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
        set({ state: T.receiveEvidence(state, arrival, matches.find((m) => m.evidenceId === next.id), lanes, arrival.receivedAt) });
        return arrival;
      },
    }),
    {
      name: STORE_KEY,
      version: STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (s): Persisted => ({ currentUserId: s.currentUserId, view: s.view, stateName: s.stateName, state: s.state }),
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
