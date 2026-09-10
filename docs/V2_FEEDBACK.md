# Feedback rounds

Decisions from screenshot reviews. Newest round at the top. Each round is batched into the next phase's instructions.

## Round 1, Phase 1 screenshots, 2026-09-09

Reviewed: login, board view, lanes view, state `midstream`, signed in as the VP.

**Keep as is.** Login screen and its footer line. Header with the two clocks and the frozen date. Loop rail with the stage 2 sub-nav and inbox count. Work strip, computed counts included (9 due this week stays). Lanes view, including the hatched Tonight column, which is the "before" story in one glance. Card chips: status plus a blue "Proposal waiting" chip.

**Change.**
1. **Pinned action bar, not a floating button.** "Review 3 proposals" floats over the memo cards. Put it in a fixed bottom action bar spanning the content area, the scheduler rule: one primary button, pinned, labeled with exactly what it does.
2. **Memo sections come off the board.** Five workstream lanes only. Memo sections keep their lane in the data (kind "memo") and render in Readiness, where coverage is the point. Six columns at 1440 made every card narrow.
3. **"No evidence" is noise.** Show the evidence count only when it is above zero. Empty cells stay empty.
4. **Card density.** With five lanes, let cards breathe: a little less vertical padding, due date and evidence count on one line. Overdue stays amber.

**Data note.** Readiness reads five unsupported sections before beat 2 and two after. That matches the script. Phase 3 tunes the rule, not Phase 2.

**Process.** Commit at the end of each phase from now on, with the phase name in the message.
