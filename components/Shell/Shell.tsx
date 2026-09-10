"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import type { Evidence, EvidenceMatch } from "@/lib/types";
import { PresenterMenu } from "@/components/Presenter/PresenterMenu";
import { Header } from "./Header";
import { LoopRail } from "./LoopRail";
import { Toasts } from "./Toasts";

export function Shell({ evidence, matches, children }: { evidence: Evidence[]; matches: EvidenceMatch[]; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useStore((s) => s.hasHydrated);
  const user = useStore((s) => s.currentUserId);
  const setSources = useStore((s) => s.setSources);
  const clearToasts = useStore((s) => s.clearToasts);

  // Toasts never outlive the screen they were raised on.
  useEffect(() => {
    clearToasts();
  }, [pathname, clearToasts]);

  useEffect(() => {
    setSources(evidence, matches);
  }, [evidence, matches, setSources]);

  useEffect(() => {
    if (hydrated && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [hydrated, user, router, pathname]);

  if (!hydrated || !user) {
    return <div className="flex h-screen items-center justify-center text-muted">Opening the room</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <LoopRail />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="min-h-0 flex-1 overflow-auto">{children}</main>
      </div>
      <PresenterMenu />
      <Toasts />
    </div>
  );
}
