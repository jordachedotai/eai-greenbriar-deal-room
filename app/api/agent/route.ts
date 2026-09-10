import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

// Live mode only. Mock mode never calls this route. The model rewrites the template
// draft into a cleaner note; it never sees anything but the draft already built from
// approved changes. Any failure returns a non-200 and the client keeps the mock draft.
export async function POST(req: Request) {
  const mock = (process.env.MOCK_MODE ?? "true") !== "false";
  if (mock || !process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ ok: false, mock: true, reason: "Live mode is off or no key is set" }, { status: 501 });
  }
  const body = (await req.json()) as { step?: string; draft?: string; today?: string };
  if (body.step !== "statusNote" || !body.draft) {
    return NextResponse.json({ ok: false, reason: "Unknown step" }, { status: 400 });
  }
  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 4000,
      thinking: { type: "adaptive" },
      output_config: { effort: "low" },
      system:
        "You tidy a private equity deal team's nightly status email. Keep every fact, name, date, and number exactly as given. Keep the grouping by workstream and the sign-off. Plain words, short sentences, no em-dashes, no headings, no markdown. Return only the email body.",
      messages: [{ role: "user", content: `Draft for ${body.today}:\n\n${body.draft}` }],
    });
    if (response.stop_reason === "refusal") {
      return NextResponse.json({ ok: false, reason: "refusal" }, { status: 502 });
    }
    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    if (!text) return NextResponse.json({ ok: false, reason: "empty" }, { status: 502 });
    return NextResponse.json({ ok: true, text });
  } catch (err) {
    const message = err instanceof Anthropic.APIError ? `API error ${err.status}` : "request failed";
    return NextResponse.json({ ok: false, reason: message }, { status: 502 });
  }
}
