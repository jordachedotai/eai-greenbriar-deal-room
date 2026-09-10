"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ActionBar } from "@/components/Shell/ActionBar";
import { draftStatusNote } from "@/lib/agent";
import { dealClock, fmtDateTime } from "@/lib/clock";
import { company, people, personById } from "@/lib/data";
import { WORKING_DELAY_MS } from "@/lib/mockAgent";
import { useStore } from "@/lib/store";

// Tonight's working-group email. The agent drafts, a person edits and sends.
export function StatusNote() {
  const router = useRouter();
  const state = useStore((s) => s.state);
  const evidence = useStore((s) => s.evidence);
  const agentMode = useStore((s) => s.agentMode);
  const send = useStore((s) => s.sendStatusNote);
  const toast = useStore((s) => s.toast);

  const sent = state.statusNotes.filter((n) => n.date === state.today).at(-1);
  const [text, setText] = useState("");
  const [mock, setMock] = useState(true);
  const [working, setWorking] = useState(false);
  const [drafted, setDrafted] = useState(false);
  const c = dealClock(state);
  const subject = `${company.codeName} working group: status, day ${c.dayIndex}`;

  async function draft() {
    setWorking(true);
    const started = Date.now();
    const result = await draftStatusNote(state, evidence, agentMode);
    const wait = Math.max(0, WORKING_DELAY_MS - (Date.now() - started));
    setTimeout(() => {
      setText(result.text);
      setMock(result.mock);
      setWorking(false);
      setDrafted(true);
    }, wait);
  }

  useEffect(() => {
    if (!sent && !drafted && !working) void draft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sent]);

  const approvalsToday = state.proposals.filter((p) => p.decision?.action === "approved" && p.decision.at.slice(0, 10) === state.today).length;

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-auto px-6 pb-6 pt-5">
        <div className="mx-auto max-w-[760px]">
          <div className="flex items-center justify-between">
            <h2 className="serif text-[20px] font-semibold">Tonight&apos;s note</h2>
            <div className="flex items-center gap-2">
              {sent ? (
                <span className="chip chip-locked" data-testid="note-sent-chip">
                  Sent {fmtDateTime(sent.sentAt)}
                </span>
              ) : (
                <span className="chip chip-needsYou" data-testid="note-draft-chip">
                  Draft by the agent
                </span>
              )}
              {(sent ? sent.mock : mock) && <span className="chip chip-idle">mock</span>}
            </div>
          </div>
          <p className="mt-1 text-[14px] text-muted">
            Built from {approvalsToday === 1 ? "one approval" : `${approvalsToday} approvals`} today, the blocked steps, and the open seller questions. Edit anything before it goes.
          </p>

          <div className="card mt-4 overflow-hidden" data-testid="status-note">
            <dl className="grid grid-cols-[72px_1fr] gap-y-1 border-b border-line px-5 py-3 text-[14px]">
              <dt className="text-muted">To</dt>
              <dd>{people.map((p) => p.name).join(", ")} (working group)</dd>
              <dt className="text-muted">Subject</dt>
              <dd className="font-semibold">{subject}</dd>
            </dl>
            {sent ? (
              <pre className="whitespace-pre-wrap px-5 py-4 font-sans text-[15px] leading-relaxed" data-testid="note-body">
                {sent.text}
              </pre>
            ) : working ? (
              <div className="animate-pulse px-5 py-10 text-center text-[14px] text-muted" data-testid="note-working">
                Reading today&apos;s approvals and drafting in your structure
              </div>
            ) : (
              <textarea
                data-testid="note-editor"
                value={text}
                onChange={(e) => setText(e.target.value)}
                spellCheck={false}
                rows={text.split("\n").reduce((n, line) => n + Math.max(1, Math.ceil(line.length / 90)), 0) + 2}
                className="block w-full resize-y px-5 py-4 font-sans text-[15px] leading-relaxed outline-none"
              />
            )}
          </div>
          {sent && (
            <p className="mt-3 text-[13px] text-muted">
              Sent by {personById(sent.by)?.name ?? sent.by}. In mock mode nothing leaves this machine. The send is recorded in Activity.
            </p>
          )}
        </div>
      </div>
      <ActionBar
        left={
          sent ? (
            <span>Fifteen minutes of retyping became a read and a click. Same email.</span>
          ) : (
            <span>Goes to the working group as an email. Nothing is sent until you click.</span>
          )
        }
      >
        {sent ? (
          <Link href="/deal" className="btn btn-primary" data-testid="primary-action">
            Back to the board
          </Link>
        ) : (
          <>
            <button type="button" className="btn btn-secondary" disabled={working} onClick={() => void draft()} data-testid="note-redraft">
              Draft again
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={working || text.trim().length === 0}
              data-testid="primary-action"
              onClick={() => {
                send(text, mock);
                toast("Tonight's note went to the working group");
                router.refresh();
              }}
            >
              Send to the working group
            </button>
          </>
        )}
      </ActionBar>
    </div>
  );
}
