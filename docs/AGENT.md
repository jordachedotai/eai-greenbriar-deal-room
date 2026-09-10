# Agent layer

## Which steps are code and which are Claude

| Step | Code or Claude | Notes |
|---|---|---|
| Match evidence to an item | Code first (party, keywords, attachment name), Claude only for ambiguous cases in live mode | Mock mode ships the matches in the fixtures |
| Quote the source line | Code (extract the sentence containing the matched phrase) | Never paraphrase the evidence |
| Strength: clear, thin, conflict | Code rules: attachment present and sender is the lane's party = clear; one line, no attachment = thin; claim contradicts current status = conflict | Deterministic so the demo is repeatable |
| Draft the status note | Claude in live mode, template in mock mode (`lib/mockAgent.ts`) | Structure from AJ's sample once it arrives; placeholder structure until then |
| Readiness coverage | Code (memo section supportedBy lanes and item statuses) | No model call |
| Set up the sprint (kickoff) | Template from `workstreams.json` | The "playbook" story |

## Live mode
`MOCK_MODE=false` posts the two generative steps (ambiguous match, status note) to `app/api/agent/route.ts`, which calls `claude-sonnet-5` with the key from `.env.local`. Any failure falls back to mock output and shows a small "mock" chip.

## Mock mode
Default. Everything rendered from `lib/mockAgent.ts` templates over the fixtures, with a short working delay so the room sees the agent "reading."

## Guardrails
- The agent never changes a status. It only creates a Proposal.
- Every proposal carries a quoted source. No source, no proposal.
- Thin evidence never gets an Approve as the primary button.
- Conflicts always show both claims.
- Everything the agent produces is labeled as a draft or a proposal in the UI.
