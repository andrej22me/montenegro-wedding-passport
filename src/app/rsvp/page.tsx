import { Suspense } from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import RsvpScreen from "./RsvpScreen";

export const metadata: Metadata = { title: "Will you join us?" };

export default function RsvpPage() {
  return (
    <div className="flex h-dvh flex-col bg-paper text-ink">
      <Header tone="rsvp" />
      <Suspense>
        <RsvpScreen />
      </Suspense>
    </div>
  );
}
