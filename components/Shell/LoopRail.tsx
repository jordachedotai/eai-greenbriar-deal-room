"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { loopStages } from "@/lib/loop";
import { useStore } from "@/lib/store";
import { openProposals } from "@/lib/transitions";

const dealTabs = [
  { href: "/deal", label: "Board" },
  { href: "/deal/inbox", label: "Inbox" },
  { href: "/deal/readiness", label: "Readiness" },
  { href: "/deal/activity", label: "Activity" },
];

export function LoopRail() {
  const pathname = usePathname();
  const waiting = useStore((s) => openProposals(s.state).filter((p) => !p.decision).length);
  return (
    <nav className="flex h-full w-[224px] shrink-0 flex-col border-r border-line bg-panel" aria-label="The loop">
      <div className="px-5 pb-4 pt-5">
        <div className="serif text-[18px] font-semibold leading-tight text-header">Greenbriar</div>
        <div className="text-[12px] text-muted">One loop, five stages</div>
      </div>
      <ol className="flex flex-col gap-1 px-3">
        {loopStages.map((st) => {
          const active = st.live && pathname.startsWith(st.href);
          const inRoom = st.live;
          return (
            <li key={st.stage}>
              <Link
                href={st.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-start gap-3 rounded-[10px] px-3 py-2.5 ${
                  active ? "bg-idle-bg" : "hover:bg-bg"
                } ${inRoom ? "" : "opacity-45"}`}
                data-testid={`rail-stage-${st.stage}`}
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
                    inRoom ? "bg-brand text-white" : "border border-muted text-muted"
                  }`}
                >
                  {st.stage}
                </span>
                <span className="leading-tight">
                  <span className="block text-[14px] font-semibold">{st.room}</span>
                  <span className="block text-[12px] text-muted">{st.name}</span>
                </span>
              </Link>
              {st.live && (
                <ul className="ml-[42px] mt-1 flex flex-col gap-0.5 pb-1">
                  {dealTabs.map((t) => {
                    const on = pathname === t.href;
                    return (
                      <li key={t.href}>
                        <Link
                          href={t.href}
                          className={`flex items-center justify-between rounded-md px-2 py-1 text-[14px] ${
                            on ? "font-semibold text-ink" : "text-muted hover:text-ink"
                          }`}
                          data-testid={`rail-tab-${t.label.toLowerCase()}`}
                        >
                          {t.label}
                          {t.label === "Inbox" && waiting > 0 && <span className="chip chip-needsYou">{waiting}</span>}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
      <div className="mt-auto px-5 py-4 text-[12px] leading-snug text-muted">
        Stage 2 of 5 is live in this build. Mock data only. Nothing leaves this machine.
      </div>
    </nav>
  );
}
