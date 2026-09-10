"use client";
import { useStore } from "@/lib/store";

export function Toasts() {
  const toasts = useStore((s) => s.toasts);
  const dismiss = useStore((s) => s.dismissToast);
  // Only the latest. A stack in the middle of the screen hides the board.
  const latest = toasts.at(-1);
  if (!latest) return null;
  return (
    <div className="pointer-events-none fixed bottom-20 right-6 z-50" aria-live="polite">
      {[latest].map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => dismiss(t.id)}
          data-testid="toast"
          className="pointer-events-auto rounded-[10px] bg-header px-4 py-2 text-[14px] font-semibold text-white shadow-card"
          data-toast-text={t.text}
        >
          {t.text}
        </button>
      ))}
    </div>
  );
}
