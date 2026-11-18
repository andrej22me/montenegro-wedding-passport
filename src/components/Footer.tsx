import Link from "next/link";
import { CONTACT, FOOTER_LINE } from "@/data/weddingData";

export default function Footer({ line = FOOTER_LINE }: { line?: string }) {
  return (
    <footer className="mt-auto bg-ink text-paper">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-5 py-8 min-[900px]:flex-row min-[900px]:items-end min-[900px]:justify-between min-[900px]:px-12 min-[900px]:py-16">
        <div className="flex flex-col gap-2">
          <p className="m-0 text-[13px] text-ink-on-dark">{line}</p>
          <a href={`mailto:${CONTACT.email}`} className="font-display text-xl text-paper hover:text-paper">
            {CONTACT.email}
          </a>
        </div>
        <div className="flex gap-6">
          <Link href="/credits" className="text-[13px] text-ink-on-dark no-underline hover:text-paper">
            Photo credits
          </Link>
          <a href="https://www.openstreetmap.org/copyright" className="text-[13px] text-ink-on-dark no-underline hover:text-paper">
            © OpenStreetMap
          </a>
        </div>
      </div>
    </footer>
  );
}
