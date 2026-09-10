import { NextResponse } from "next/server";

// Live mode only. Mock mode never calls this route. Phase 2 wires the two generative steps.
export async function POST() {
  return NextResponse.json({ ok: false, mock: true, reason: "Live mode is not wired in this build" }, { status: 501 });
}
