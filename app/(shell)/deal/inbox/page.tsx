import Link from "next/link";

// Phase 2 or 3 builds this screen. Never a dead page.
export default function Page() {
  return (
    <div className="p-8">
      <div className="card max-w-[560px] p-6">
        <div className="label">Deal Room</div>
        <h2 className="serif mt-1 text-[24px] font-semibold">Inbox</h2>
        <p className="mt-2 text-[16px]">This screen is built in the next phase.</p>
        <Link href="/deal" className="btn btn-secondary mt-5">Back to the board</Link>
      </div>
    </div>
  );
}
