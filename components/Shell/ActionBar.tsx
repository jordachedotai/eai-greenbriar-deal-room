// The pinned bottom action bar. Spans the content area. Holds the one primary button
// for the screen, plus at most secondary controls and a short line of context.
export function ActionBar({ children, left }: { children: React.ReactNode; left?: React.ReactNode }) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-4 border-t border-line bg-panel px-6 py-3" data-testid="action-bar">
      <div className="min-w-0 text-[14px] text-muted">{left}</div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
