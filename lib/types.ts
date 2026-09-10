// Types from docs/DATA.md. The Portfolio Room reuses these unchanged.

export type Stage = 1 | 2 | 3 | 4 | 5; // sourcing, diligence, close, portfolio, exit
export type Room = "deal" | "portfolio";

export type Person = {
  id: string;
  name: string;
  role: "partner" | "director" | "vp" | "associate" | "analyst";
  isCurrentUser: boolean;
};

export type Party = {
  id: string;
  name: string;
  kind: "accounting" | "legal" | "hr" | "it" | "lender" | "banker" | "seller";
};

export type Company = { id: string; codeName: string; sector: string; room: Room };

export type Lane = {
  id: string;
  companyId: string;
  name: string;
  kind: "workstream" | "memo";
  ownerId: string;
  externalPartyId?: string;
};

export type ItemStatus = "notStarted" | "inProgress" | "blocked" | "done";

export type Item = {
  id: string;
  laneId: string;
  title: string;
  ownerId: string;
  dueDate: string;
  status: ItemStatus;
  doneLooksLike: string; // what proves it
  evidenceIds: string[];
};

export type EvidenceKind = "email" | "file" | "requestListUpdate" | "qaEntry" | "note";

export type Evidence = {
  id: string;
  kind: EvidenceKind;
  from: string;
  partyId?: string;
  receivedAt: string;
  subject: string;
  body: string;
  attachmentName?: string;
};

export type ProposalStrength = "clear" | "thin" | "conflict";
export type DecisionAction = "approved" | "rejected" | "askedForConfirmation";

export type Proposal = {
  id: string;
  evidenceId: string;
  itemId: string;
  proposedStatus: ItemStatus;
  quotedSource: string;
  strength: ProposalStrength;
  conflictNote?: string;
  decision?: { by: string; at: string; action: DecisionAction; reason?: string };
};

export type Coverage = "full" | "partial" | "none";

export type MemoSection = {
  id: string;
  name: string;
  placeholder: boolean;
  supportedBy: string[]; // laneIds
  coverage: Coverage;
};

export type SellerQuestion = {
  id: string;
  laneId: string;
  text: string;
  askedAt: string;
  dueAt: string;
  answered: boolean;
};

export type BidChecklistItem = { id: string; name: string; placeholder: boolean; done: boolean };

export type StatusNote = {
  id: string;
  date: string; // the state's `today` it was written for
  text: string;
  by: string;
  sentAt: string;
  mock: boolean; // drafted from the template, not the model
};

export type ActivityEntry = {
  id: string;
  at: string;
  by: string;
  action: string;
  itemId?: string;
  evidenceId?: string;
};

// A saved state is everything mutable in the room at one frozen moment.
// `today` lives here, never in code. scripts/gen-states.ts owns it.
export type StateName = "kickoff" | "midstream" | "ic-minus-3";

export type DealState = {
  name: StateName;
  today: string; // ISO date, frozen
  day0: string; // IC approved the Criteria Worksheet
  icDate: string;
  bidDate: string;
  items: Item[];
  proposals: Proposal[];
  activity: ActivityEntry[];
  inboxEvidenceIds: string[]; // evidence waiting for a person
  processedEvidenceIds: string[]; // evidence already handled
  sellerQuestions: SellerQuestion[];
  bidChecklist: BidChecklistItem[];
  memoSections: MemoSection[];
  statusNotes: StatusNote[];
};

// Names files (hand-edited, swappable without code changes)
export type WorkstreamStep = { title: string; dueDay: number; doneLooksLike: string };
export type Workstream = {
  id: string;
  name: string;
  ownerRole: Person["role"];
  externalPartyKind?: Party["kind"];
  steps: WorkstreamStep[];
};

export type MemoSectionDef = {
  id: string;
  name: string;
  placeholder: boolean;
  supportedBy: string[];
  ownerRole: Person["role"];
};

// Mock mode ships the evidence-to-item matches in the fixtures.
export type EvidenceMatch = {
  evidenceId: string;
  itemId: string;
  proposedStatus: ItemStatus;
  matchedPhrase: string; // the phrase the quote is cut around
};
