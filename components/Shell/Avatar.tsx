"use client";
import { useRouter } from "next/navigation";
import { personById, roleLabel } from "@/lib/data";
import { useStore } from "@/lib/store";
import { Face } from "./Face";

export function Avatar() {
  const router = useRouter();
  const id = useStore((s) => s.currentUserId);
  const signOut = useStore((s) => s.signOut);
  const person = id ? personById(id) : undefined;
  if (!person) return null;
  return (
    <div className="flex items-center gap-3" data-testid="avatar">
      <Face name={person.name} size={32} />
      <div className="leading-tight">
        <div className="text-[14px] font-semibold">{person.name}</div>
        <div className="text-[12px] text-muted">{roleLabel[person.role]}</div>
      </div>
      <button
        type="button"
        className="ml-2 text-[13px] text-muted underline-offset-2 hover:underline"
        onClick={() => {
          signOut();
          router.replace("/login");
        }}
      >
        Sign out
      </button>
    </div>
  );
}
