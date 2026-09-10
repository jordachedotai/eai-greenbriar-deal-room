# Greenbriar Deal Room: demo build brief (v1)

You are building a demo web app for Greenbriar Equity Group's investment team, first shown on the EAI team call Friday 2026-09-11 3pm ET, then at the AI Council on Monday 2026-09-14. It shows a deal team's 30-day sprint from investment committee approval to final bid running as one tool: a board of diligence workstreams and memo sections, evidence arriving, an agent proposing status changes with the source quoted, a VP approving, the tracker writing itself, the nightly status note drafting itself, and an IC readiness view that says what is still missing nine days out.

The sponsor is AJ Witherell, VP. Today he re-types status into a shared Excel tracker for about 15 minutes every night, duplicating what he already emailed the working group. The larger story is the loop in `design-reference/Loop.dc.html`: this app is stage 2 of five, and the left rail shows all five.

Read, in order: `docs/PRD.md` (what), `docs/DATA.md` (the model and the synthetic deal), `docs/AGENT.md` (which steps are code and which are Claude), `docs/DEMO_SCRIPT.md` (the four beats), `BUILD_PLAN.md` (order and cut line), `docs/SOURCES.md` (where every fact came from, and what is still unconfirmed).

## Hard rules

- **Synthetic deal only.** The target is Project Beacon, a fictional specialty logistics operator. Nothing from Project Apex, no aerospace, no real advisor, lender, or banker names. No real deal team names unless `data/team.json` is swapped later with consent.
- **Mock data only, no network in mock mode.** No Outlook, OneDrive, SharePoint, DealCloud, Fabric, or Atlas calls, ever, in this repo. Sources arrive through `lib/sources.ts`, which reads `data/inbox/` and `data/dropzone/` in mock mode.
- **One tool on screen.** Never show a chat window. The user sees a board, rows, evidence, proposals, buttons, drafts.
- **The agent never writes.** Every status change is a proposal with a quoted source and an Approve and a Reject button. The tracker updates only after a person clicks. A proposal with weak evidence says so and asks.
- **Every approval is audited.** Who, when, what changed, which evidence. Visible on the item and in an Activity tab. Per-user mock sign-in from day one.
- **One primary button per screen, pinned, labeled with exactly what it does.**
- **Never a template product.** The memo sections are Greenbriar's five CW sections plus placeholders marked as such. Documents follow the house style in `design-reference/`. If it starts to look like a generic IC memo generator, stop.
- **Rooms are views on one model.** Build the objects in `docs/DATA.md` so the Portfolio Room (a later phase) is a second stage list and evidence set, not a second app.
- **Any change to the persisted store shape bumps `STORE_VERSION` in the same commit.**
- **No em-dashes anywhere in UI copy.** Short sentences. Plain words.

## Stack

Same as the scheduler: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, `@anthropic-ai/sdk` (`claude-sonnet-5`) for live mode only. Zustand store persisted to localStorage with `STORE_VERSION`. Vitest for `lib/`, Playwright for the demo walkthrough. `MOCK_MODE=true` by default. Design tokens from `design-reference/Tokens.dc.html`: Source Serif 4 for titles, Source Sans 3 for everything else, brand #1f5a2d, muted #61705f, lines #dde3da, blue #2b5f9e on #e5edf7 for "needs you," amber #8a5a08 on #fbf3dd for "waiting on others."

## Structure

```
app/
  login/page.tsx
  (shell)/layout.tsx              # loop rail + header + avatar
  (shell)/deal/page.tsx           # Deal Room: board view, lanes view toggle, deal clock
  (shell)/deal/inbox/page.tsx     # evidence waiting: proposals to approve or reject
  (shell)/deal/readiness/page.tsx # memo sections x coverage, open seller questions, bid checklist
  (shell)/deal/activity/page.tsx  # audit trail
  (shell)/close/page.tsx          # one screen: the hand-off (phase 3)
  (shell)/portfolio/page.tsx      # Portfolio Room (phase 4, placeholder until then)
  api/agent/route.ts
components/  Shell/ LoopRail Header Avatar · Deal/ Board Lane ItemCard DealClock · Inbox/ ProposalCard EvidenceViewer · Readiness/ CoverageGrid QuestionList BidChecklist · Drafts/ StatusNote · Presenter/ PresenterMenu SimulateButton
data/        team.json parties.json workstreams.json memo-sections.json evidence/ inbox/ dropzone/ demo-states.json
lib/         types data store sources agent prompts proposals readiness simulate
```

## Definition of done (Friday build)

1. Login as AJ lands on the Deal Room in state `midstream`: five workstream lanes, the memo section lane, deal clock reading 9 days to IC, three pieces of evidence waiting in the inbox.
2. Opening the inbox shows three proposals with the source line quoted. Approve two, reject one with a reason. The board updates, the Activity tab records each with the user and time.
3. "Draft tonight's note" produces the working-group status email from the approved changes, editable, with a Send button that marks it sent in mock mode.
4. Readiness view shows the memo sections, which evidence supports each, two unsupported, eight open seller questions with three overdue, and the bid checklist.
5. The loop rail shows five stages with Deal Room active, Close and Portfolio dimmed with their names, Thesis and Deal memory dimmed.
6. Presenter menu (Shift+P): jump to state `kickoff`, `midstream`, `ic-minus-3`; "simulate evidence arriving"; agent mode toggle.
7. Mock mode passes the Playwright walkthrough with wifi off. No console errors.
8. Swapping the four names files (`team.json`, `parties.json`, `workstreams.json`, `memo-sections.json`) needs no code changes.
