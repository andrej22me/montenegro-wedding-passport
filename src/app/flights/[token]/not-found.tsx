import Link from "next/link";
import Header from "@/components/Header";
import { CONTACT } from "@/data/weddingData";

export default function FlightNotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-paper text-ink">
      <Header tone="rsvp" />
      <main className="mx-auto flex w-full max-w-[440px] flex-col gap-4 px-5 pt-16">
        <h1 className="m-0 font-display text-[40px] leading-[1.05] font-light">We couldn&apos;t find that link.</h1>
        <a href={`mailto:${CONTACT.email}`} className="text-[15px] font-medium text-ink">Email {CONTACT.person}</a>
        <Link href="/weekend" className="inline-flex min-h-11 items-center text-[15px] font-medium text-ink no-underline">Back to the weekend</Link>
      </main>
    </div>
  );
}
