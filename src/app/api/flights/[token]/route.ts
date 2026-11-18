import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { getFlights, parseFlights, saveFlights } from "@/lib/rsvpStore";

export const runtime = "nodejs";

type Context = { params: Promise<{ token: string }> };

export async function GET(_request: Request, context: Context) {
  const { token } = await context.params;
  const found = await getFlights(token);
  if (!found) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    names: found.response.guests,
    closed: found.closed,
    pickup: found.groups[0]?.pickup ?? "no",
    groups: found.groups.map((group) => ({
      guests: group.guests,
      arrival_airport: group.arrival_airport,
      arrival_date: group.arrival_date,
      arrival_time: group.arrival_time,
      arrival_flight: group.arrival_flight,
      departure_airport: group.departure_airport,
      departure_date: group.departure_date,
      departure_time: group.departure_time,
      departure_flight: group.departure_flight,
    })),
  });
}

export async function POST(request: Request, context: Context) {
  if (!rateLimit(`flights:${clientIp(request)}`, 5, 60_000)) {
    return NextResponse.json({ error: "Please wait a moment and try again." }, { status: 429 });
  }
  const { token } = await context.params;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Please try again." }, { status: 400 });
  if (String(body.hp ?? "").trim()) return NextResponse.json({ error: "Please try again." }, { status: 400 });
  const found = await getFlights(token);
  if (!found) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const input = parseFlights(body, found.response.guests);
  if (!input) return NextResponse.json({ error: "Check the flight details." }, { status: 400 });
  const result = await saveFlights(token, input);
  if (result === "closed") return NextResponse.json({ error: "Replies are closed." }, { status: 403 });
  if (result === "missing") return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
