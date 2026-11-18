import { NextResponse } from "next/server";
import { FLIGHT_REMINDER_DATES } from "@/data/weddingData";
import { sendFlightReminder } from "@/lib/rsvpEmail";
import { listAccepted, markReminded } from "@/lib/rsvpStore";

export const runtime = "nodejs";

function today() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Podgorica", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const date = today();
  if (!FLIGHT_REMINDER_DATES.includes(date)) return NextResponse.json({ sent: 0, date });

  const origin = (process.env.SITE_URL || new URL(request.url).origin).replace(/\/$/, "");
  const due = (await listAccepted({ missingFlightsOnly: true })).filter((row) => !row.last_reminder_at.startsWith(date));
  const sent: string[] = [];
  for (const row of due) {
    try {
      await sendFlightReminder(row, origin);
      sent.push(row.token);
    } catch (error) {
      console.error("[flight reminder]", row.email, error);
    }
  }
  await markReminded(sent, new Date().toISOString());
  return NextResponse.json({ sent: sent.length, date });
}
