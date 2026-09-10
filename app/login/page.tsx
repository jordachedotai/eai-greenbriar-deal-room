"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Face } from "@/components/Shell/Face";
import { company, currentUserDefault, people, roleLabel } from "@/lib/data";
import { useStore } from "@/lib/store";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const signIn = useStore((s) => s.signIn);
  const hydrated = useStore((s) => s.hasHydrated);
  const user = useStore((s) => s.currentUserId);
  const [selected, setSelected] = useState(currentUserDefault.id);
  const next = params.get("next") || "/deal";

  useEffect(() => {
    if (hydrated && user) router.replace(next);
  }, [hydrated, user, router, next]);

  const person = people.find((p) => p.id === selected)!;

  return (
    <div className="card w-[440px] p-8">
      <div className="label">Greenbriar Equity Group</div>
      <h1 className="serif mt-1 text-[24px] font-semibold">Deal Room</h1>
      <p className="mt-1 text-[14px] text-muted">{company.codeName}. Pick who you are. Every approval is recorded under your name.</p>
      <ul className="mt-6 flex flex-col gap-1.5" role="radiogroup" aria-label="Who are you">
        {people.map((p) => {
          const on = p.id === selected;
          return (
            <li key={p.id}>
              <button
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setSelected(p.id)}
                data-testid={`login-person-${p.role}`}
                className={`flex w-full items-center gap-3 rounded-[10px] border px-3 py-2 text-left ${
                  on ? "border-brand bg-idle-bg" : "border-line hover:border-muted"
                }`}
              >
                <Face name={p.name} size={30} />
                <span className="flex-1 leading-tight">
                  <span className="block text-[15px] font-semibold">{p.name}</span>
                  <span className="block text-[12px] text-muted">{roleLabel[p.role]}</span>
                </span>
                {p.isCurrentUser && <span className="chip chip-idle">Presenter</span>}
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        className="btn btn-primary mt-6 w-full"
        data-testid="login-submit"
        onClick={() => {
          signIn(person.id);
          router.replace(next);
        }}
      >
        Sign in as {person.name.split(" ")[0]}
      </button>
      <p className="mt-4 text-[12px] text-muted">Mock sign-in for the demo. No password, no directory, no network.</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
