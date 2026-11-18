import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import { getFlights } from "@/lib/rsvpStore";
import FlightsForm from "./FlightsForm";

export const metadata: Metadata = { title: "Your flights" };

export default async function FlightsPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const found = await getFlights(token);
  if (!found) notFound();
  return (
    <div className="flex h-dvh flex-col bg-paper text-ink">
      <Header tone="rsvp" />
      <FlightsForm
        token={token}
        names={found.response.guests}
        closed={found.closed}
        pickup={found.groups[0]?.pickup ?? "no"}
        groups={found.groups.map((group) => ({
          guests: group.guests,
          arrival_airport: group.arrival_airport,
          arrival_date: group.arrival_date,
          arrival_time: group.arrival_time,
          arrival_flight: group.arrival_flight,
          departure_airport: group.departure_airport,
          departure_date: group.departure_date,
          departure_time: group.departure_time,
          departure_flight: group.departure_flight,
        }))}
      />
    </div>
  );
}
