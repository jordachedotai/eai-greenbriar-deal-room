# PRD: Greenbriar Deal Room (v1)

## Who and why

AJ Witherell, VP, runs Project Beacon's 30-day sprint from IC approval to final bid with a team of four: a Director on the partnership side, an Associate on the model, an Analyst on data cuts and research, and himself across everything. Five external workstreams run in parallel: accounting advisor (quality of earnings), legal, HR, IT, financing. Status lives in a shared Excel tracker he updates by hand each night, duplicating the email he already sent the working group.

The demo shows the tracker updating itself from evidence, with AJ approving every change, and an IC readiness view that answers "what is still missing" nine days before the committee.

## Screens

### Deal Room (home)
- Header: deal name, stage on the loop, deal clock (days to IC, days to bid deadline; two clocks).
- Board view: one column per lane. Lanes: QoE, Legal, HR, IT, Financing, Memo sections. Cards are items with owner, due date, status chip, evidence count.
- Lanes view: rows grouped by lane, the shape of AJ's Excel tracker. This is the "before" screen when opened in state `kickoff`.
- Work strip at top: "3 waiting on you," "2 blocked," "5 due this week."

### Inbox (evidence waiting)
- List of evidence that arrived (mock inbox and drop zone). Each has a proposal card: which item, proposed status, the quoted source line, confidence as plain words (clear, thin, conflicts with tracker), Approve, Reject with reason.
- Weak evidence: the proposal says "one line, no attachment, asking the sender" and offers "Ask for confirmation" as the primary action instead of Approve.
- Conflict: the proposal shows both claims (lender says commitment letter sent; tracker says term sheet stage) and asks which is right.

### Status note
- "Draft tonight's note" builds the working-group email from today's approved changes, grouped by workstream, in AJ's structure (placeholder structure until his sample arrives). Editable. Send marks it sent.

### Readiness
- Grid: memo sections down the side (Company Overview, Industry Overview, Merits, Considerations and Diligence Focus Areas, Preliminary Growth and Value Creation Levers, then placeholders: Financial Summary, Valuation and Returns, Financing, Key Risks, Diligence Status). Across: which workstream outputs support each, coverage as full, partial, none.
- Open seller questions: eight, tagged by workstream, three overdue.
- Bid checklist (placeholder list until AJ confirms): offer letter, purchase agreement mark-up, financing commitments, equity commitment, IC approval, open confirmatory items.

### Activity
- Audit trail: every approval and rejection with user, time, item, evidence.

### Loop rail (shell)
- Five stages. Deal Room active. Close and Portfolio Room dimmed with names. Thesis Room and Deal memory dimmed. Clicking a dimmed stage shows a one-line "coming in the next build" card, never a dead page.

## States
- `kickoff`: IC approved yesterday. Tracker empty. The agent proposes the workstream plan from the playbook. One primary button: "Set up the sprint."
- `midstream` (room default): week 4, day 5. Nine days to IC. Three items in the inbox.
- `ic-minus-3`: readiness view with two sections still unsupported and the bid checklist half done.

## Not in v1
Portfolio Room, Close screen (phase 3 and 4), live connectors, real names, document rendering in house style (phase 3 if time), the data cube site.
