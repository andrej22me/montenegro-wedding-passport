import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { PHOTO_CREDITS } from "@/data/weddingData";

export const metadata: Metadata = { title: "Photo credits" };

export default function CreditsPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-paper text-ink">
      <Header />
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 pt-12 pb-14 min-[900px]:px-12 min-[900px]:pt-24 min-[900px]:pb-24">
        <div className="max-w-[640px]">
        <h1 className="m-0 font-display text-5xl leading-none font-light tracking-[-0.02em]">Photo credits</h1>
        <ul className="m-0 mt-8 flex list-none flex-col p-0">
          {PHOTO_CREDITS.map((credit, index) => (
            <li
              key={credit.file}
              className={["flex flex-col gap-1 border-t py-4", index === 0 ? "border-ink" : "border-[var(--rule)]", index === PHOTO_CREDITS.length - 1 ? "border-b border-b-[var(--rule)]" : ""].join(" ")}
            >
              <span className="text-[13px] font-semibold text-accent">{credit.file}</span>
              <span className="font-display text-lg leading-snug">{credit.source}</span>
              <span className="text-sm text-ink-2">{credit.status}</span>
            </li>
          ))}
        </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}
