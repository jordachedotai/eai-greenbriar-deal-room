// The five stages from design-reference/Loop.dc.html. Deal Room is the only live room in this build.
import type { Stage } from "./types";

export type LoopStage = {
  stage: Stage;
  name: string;
  room: string;
  href: string;
  live: boolean;
  next: string; // one line for the "coming in the next build" card
};

export const loopStages: LoopStage[] = [
  { stage: 1, name: "Sourcing and themes", room: "Thesis Room", href: "/thesis", live: false, next: "Thesis Room is coming in a later build. Theses that update from what the deal teams and portcos learn." },
  { stage: 2, name: "Screening and diligence", room: "Deal Room", href: "/deal", live: true, next: "" },
  { stage: 3, name: "Close and hand-off", room: "Close", href: "/close", live: false, next: "Close is coming in the next build. One screen: memo and model handed to the Portfolio Room." },
  { stage: 4, name: "Portfolio value creation", room: "Portfolio Room", href: "/portfolio", live: false, next: "Portfolio Room is coming in the next build. Initiatives red, yellow, green against prior months." },
  { stage: 5, name: "Exit and deal memory", room: "Deal memory", href: "/memory", live: false, next: "Deal memory is coming in a later build. Underwriting versus actuals, live." },
];

export const currentStage: Stage = 2;
