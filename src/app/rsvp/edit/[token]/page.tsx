import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import { editsClosed, getResponse } from "@/lib/rsvpStore";
import RsvpScreen from "../../RsvpScreen";

export const metadata: Metadata = { title: "Change your reply" };

export default async function EditReplyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const row = await getResponse(token);
  if (!row || row.attending !== "yes") notFound();
  return (
    <div className="flex h-dvh flex-col bg-paper text-ink">
      <Header tone="rsvp" />
      <Suspense>
        <RsvpScreen
          locked={editsClosed()}
          seed={{
            token: row.token,
            guests: row.guests,
            events: row.events,
            dietary: row.dietary,
            email: row.email,
            whatsapp: row.whatsapp,
          }}
        />
      </Suspense>
    </div>
  );
}
