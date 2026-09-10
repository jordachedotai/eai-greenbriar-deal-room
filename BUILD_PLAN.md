# Build plan: Greenbriar Deal Room

Repo: `~/Tools/eai-greenbriar-deal-room` (same folder as `~/Documents/Tools`). Canon docs stay in this vault folder; the repo carries a copy of `CLAUDE.md` and `docs/`. Deploys to Vercel in mock mode like the scheduler.

## Phase 1: model, fixtures, shell (day 1, Wed 09-10)
- `lib/types.ts` from `docs/DATA.md`. Store with `STORE_VERSION`.
- Four names files by hand: `team.json`, `parties.json`, `workstreams.json`, `memo-sections.json`. `scripts/gen-fixtures.ts` builds items, evidence, questions, checklist. `scripts/gen-states.ts` builds the three states.
- Shell: login, loop rail, header, avatar. Deal Room board and lanes views reading state `midstream`.

## Phase 2: proposals, approval, note (day 2, Thu 09-11 morning)
- Inbox with proposal cards, strength rules, Approve, Reject with reason, Ask for confirmation.
- Activity tab. Status note draft and send. Presenter menu with the three states and "simulate evidence arriving."

## Phase 3: readiness and rehearsal (Thu 09-11 afternoon, before 3pm ET)
- Readiness grid, seller questions, bid checklist. Playwright walkthrough of the four beats. Deploy.

## Phase 4: after Friday (Fri 09-11 to Sun 09-13), only if inputs land
- Swap AJ's real workstream steps, tracker columns, and note structure into the names files.
- Close screen (one page): the memo's value creation plan and the underwriting case handed to the Portfolio Room.
- Portfolio Room as a second stage list and evidence set, if Matt's sample reports arrive from Peter. Otherwise dimmed.

## Cut line
If Phase 3 runs late, readiness becomes a static screen from the design reference and the bid checklist drops. Beat 2 is never cut.

## Not in this build
Live connectors, document rendering in house style, the data cube site, real names, anything from Project Apex.
