// Static loaders over /data. Names files are hand-edited; everything else is generated.
import team from "@/data/team.json";
import parties from "@/data/parties.json";
import workstreams from "@/data/workstreams.json";
import memoSections from "@/data/memo-sections.json";
import type { Company, Lane, MemoSectionDef, Party, Person, Workstream } from "./types";

export const people = team as Person[];
export const partyList = parties as Party[];
export const company = workstreams.company as Company;
export const workstreamDefs = workstreams.lanes as Workstream[];
export const memoLaneDef = {
  laneName: memoSections.laneName as string,
  ownerRole: memoSections.ownerRole as Person["role"],
  dueDay: memoSections.dueDay as number,
};
export const memoSectionDefs = memoSections.sections as MemoSectionDef[];

export const MEMO_LANE_ID = "memo";

export function personByRole(role: Person["role"]): Person {
  const p = people.find((x) => x.role === role);
  if (!p) throw new Error(`No person with role ${role} in data/team.json`);
  return p;
}

export function personById(id: string): Person | undefined {
  return people.find((p) => p.id === id);
}

export function partyByKind(kind: Party["kind"]): Party | undefined {
  return partyList.find((p) => p.kind === kind);
}

// Every external party on a lane. Financing has two lenders in play.
export function partiesForLane(lane: Lane): Party[] {
  const def = workstreamDefs.find((w) => w.id === lane.id);
  if (!def?.externalPartyKind) return [];
  return partyList.filter((p) => p.kind === def.externalPartyKind);
}

export function partyNames(lane: Lane): string {
  const names = partiesForLane(lane).map((p) => p.name);
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

export function partyById(id: string | undefined): Party | undefined {
  return id ? partyList.find((p) => p.id === id) : undefined;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]!.toUpperCase())
    .join("");
}

export const roleLabel: Record<Person["role"], string> = {
  partner: "Partner",
  director: "Director",
  vp: "Vice President",
  associate: "Associate",
  analyst: "Analyst",
};

// Lanes are derived from the names files, so a swapped workstreams.json needs no code change.
export function buildLanes(): Lane[] {
  const lanes: Lane[] = workstreamDefs.map((w) => ({
    id: w.id,
    companyId: company.id,
    name: w.name,
    kind: "workstream",
    ownerId: personByRole(w.ownerRole).id,
    externalPartyId: w.externalPartyKind ? partyByKind(w.externalPartyKind)?.id : undefined,
  }));
  lanes.push({
    id: MEMO_LANE_ID,
    companyId: company.id,
    name: memoLaneDef.laneName,
    kind: "memo",
    ownerId: personByRole(memoLaneDef.ownerRole).id,
  });
  return lanes;
}

export const lanes = buildLanes();

export function laneById(id: string): Lane | undefined {
  return lanes.find((l) => l.id === id);
}

export const currentUserDefault = people.find((p) => p.isCurrentUser) ?? people[0]!;
