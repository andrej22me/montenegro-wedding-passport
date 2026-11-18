import { NextResponse } from "next/server";
import { sendRsvpEmail } from "@/lib/rsvpEmail";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { editsClosed, parseRsvp, upsertResponse } from "@/lib/rsvpStore";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!rateLimit(`rsvp:${clientIp(request)}`, 5, 60_000)) {
    return NextResponse.json({ error: "Please wait a moment and try again." }, { status: 429 });
  }
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Please try again." }, { status: 400 });
  if (String(body.hp ?? "").trim()) return NextResponse.json({ error: "Please try again." }, { status: 400 });

  const input = parseRsvp(body);
  if (!input) return NextResponse.json({ error: "Check your name and email." }, { status: 400 });
  if (input.token && editsClosed()) return NextResponse.json({ error: "Replies are closed." }, { status: 403 });

  const row = await upsertResponse(input);
  const origin = (process.env.SITE_URL || new URL(request.url).origin).replace(/\/$/, "");
  try {
    await sendRsvpEmail(row, origin);
  } catch (error) {
    console.error("[rsvp email]", error);
  }
  return NextResponse.json({ token: row.token });
}
