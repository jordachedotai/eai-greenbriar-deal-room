# Feedback rounds

Decisions from screenshot reviews. Newest round at the top. Each round is batched into the next phase's instructions.

## Round 3, Phase 3 screenshots, 2026-09-09

Reviewed: readiness in `midstream` after the beat 2 approvals, and in `ic-minus-3`.

**Keep as is.** The three-number strip. Unsupported rows naming who owes them. Seller questions sorted overdue first with days late. The bid checklist with its placeholder line. The footer sentence. The primary button switching to "Back to the board" once the note is sent. The ic-minus-3 data change (three chased questions answered, three newer overdue).

**Change.**
1. **Grid cells show a mark, not a number.** Every row repeats the lane's percent (43% under QoE on six rows), which reads as noise and invites "why is QoE 43% everywhere." Keep the percent in the column header only. In the cells show one mark per supporting lane: filled for done, half for in progress, empty ring for not started, blank where the lane does not support the section. Same colors as the status chips.
2. **Checklist wording.** "Offer letter" ticked at day 21 reads as sent. Rename to "Offer letter draft" so the tick means drafted.

**Presenter note, no build change.** The five "Placeholder" chips are honest and stay. The line to say in the room: "These five are the sections we have not confirmed with the sponsor yet. The first five are Greenbriar's own Criteria Worksheet sections."

**Status.** Friday-ready after round 3. Phase 4 waits on AJ's step lists and note sample, and on Matt's reports from Peter.

## Round 2, Phase 2 screenshots, 2026-09-09

Reviewed: inbox with three proposals, board after two approvals and one confirmation request, Activity with the Decisions filter, tonight's note draft.

**Keep as is.** The inbox layout: proposals left, full evidence right with the quoted sentence highlighted, decision in the action bar, "Nothing moves until you decide below." Strength chips (Clear green, Thin amber). The "Question out" chip on the board. The Activity table and its three filters. The note: grouped by workstream, evidence named inline, open seller questions at the end, signed by the VP. The "Draft by the agent" and "mock" chips. Decision timestamps as frozen date plus real time of day. The new "Tonight's note" tab and `/deal/note` route, now in CLAUDE.md.

**Change.**
1. **Toasts clear.** "Asked Samuel to confirm" was still showing on the Activity screen. Dismiss after four seconds or on navigation, whichever comes first.
2. **Note spacing.** One blank line between workstream lines so the Legal entry does not run into HR. Keep one line per lane otherwise.
3. **Financing lane header** names one party. Two lenders are in play. Show "Cobalt Ridge Capital, Larkspur" or "2 lenders."

**Process.** Push after every phase commit. Vercel builds from GitHub, so an unpushed phase is an empty deploy.

## Round 1, Phase 1 screenshots, 2026-09-09

Reviewed: login, board view, lanes view, state `midstream`, signed in as the VP.

**Keep as is.** Login screen and its footer line. Header with the two clocks and the frozen date. Loop rail with the stage 2 sub-nav and inbox count. Work strip, computed counts included (9 due this week stays). Lanes view, including the hatched Tonight column, which is the "before" story in one glance. Card chips: status plus a blue "Proposal waiting" chip.

**Change.**
1. **Pinned action bar, not a floating button.** "Review 3 proposals" floats over the memo cards. Put it in a fixed bottom action bar spanning the content area, the scheduler rule: one primary button, pinned, labeled with exactly what it does.
2. **Memo sections come off the board.** Five workstream lanes only. Memo sections keep their lane in the data (kind "memo") and render in Readiness, where coverage is the point. Six columns at 1440 made every card narrow.
3. **"No evidence" is noise.** Show the evidence count only when it is above zero. Empty cells stay empty.
4. **Card density.** With five lanes, let cards breathe: a little less vertical padding, due date and evidence count on one line. Overdue stays amber.

**Data note.** Readiness reads five unsupported sections before beat 2 and two after. That matches the script. Phase 3 tunes the rule, not Phase 2.

**Process.** Commit at the end of each phase from now on, with the phase name in the message, then push.
