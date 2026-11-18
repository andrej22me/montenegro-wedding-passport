import type { Metadata } from "next";
import Image from "next/image";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Bus } from "@/components/icons";
import { AIRPORTS, ATTIRE, GUIDE_FOOTER_LINE, PALETTE, STAY, STAY_NOTE, TRANSFERS } from "@/data/weddingData";
import GuideNav from "./GuideNav";
import Questions from "./Questions";

export const metadata: Metadata = { title: "Getting there" };

export default function GuidePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-paper text-ink">
      <Header />
      <main className="flex-1">
        <div className="mx-auto flex w-full max-w-[1200px] items-start px-5 pt-12 min-[900px]:gap-16 min-[900px]:px-12 min-[900px]:pt-24">
        <GuideNav />
        <div className="w-full min-w-0 min-[900px]:max-w-[640px] min-[900px]:flex-1">
        <section id="travel" className="flex scroll-mt-20 flex-col gap-5">
          <h1 className="m-0 font-display text-5xl leading-none font-light tracking-[-0.02em]">Getting there</h1>
          <div role="table" aria-label="Airports" className="flex flex-col">
            <div role="row" className="grid grid-cols-[64px_minmax(0,1fr)_72px] gap-3 pb-2 text-xs font-semibold text-ink-2">
              <span role="columnheader">Airport</span>
              <span role="columnheader" />
              <span role="columnheader" className="text-right">
                To Budva
              </span>
            </div>
            {AIRPORTS.map((airport, index) => (
              <div
                key={airport.code}
                role="row"
                className={[
                  "grid grid-cols-[64px_minmax(0,1fr)_72px] items-baseline gap-3 border-t py-4",
                  index === 0 ? "border-ink" : "border-[var(--rule)]",
                  index === AIRPORTS.length - 1 ? "border-b border-b-[var(--rule)]" : "",
                ].join(" ")}
              >
                <span role="cell" className="text-[22px] font-semibold tracking-[0.02em]">
                  {airport.code}
                </span>
                <span role="cell" className="flex flex-col gap-0.5">
                  <span className="flex items-baseline gap-2 text-base font-medium">
                    {airport.name}
                    {"badge" in airport && airport.badge ? (
                      <span className="rounded-[2px] bg-accent px-1.5 py-0.5 text-[11px] font-semibold text-paper">
                        {airport.badge}
                      </span>
                    ) : null}
                  </span>
                  {"note" in airport && airport.note ? (
                    <span className="text-[13px] text-ink-2">{airport.note}</span>
                  ) : null}
                </span>
                <span role="cell" className="text-right text-base tabular-nums">
                  {airport.toBudva}
                </span>
              </div>
            ))}
          </div>
          <p className="m-0 flex items-center gap-3 bg-ink px-4 py-3.5 text-[15px] text-paper">
            <Bus />
            {TRANSFERS}
          </p>
        </section>

        <section id="stay" className="flex scroll-mt-20 flex-col gap-4 pt-14 min-[900px]:gap-6 min-[900px]:pt-24">
          <h2 className="m-0 font-display text-[40px] leading-none font-light tracking-[-0.02em]">Where to stay</h2>
          <div className="grid grid-cols-2 gap-3">
            {STAY.map((place) => (
              <div key={place.town} className="flex flex-col gap-2.5">
                <div className="relative h-[200px] overflow-hidden rounded-[2px] min-[900px]:h-[280px]">
                  <Image src={place.image} alt={place.alt} fill sizes="(min-width: 900px) 310px, 45vw" className="object-cover" />
                </div>
                <span className="text-xs font-semibold text-accent">{place.nights}</span>
                <span className="font-display text-[26px] leading-none">{place.town}</span>
              </div>
            ))}
          </div>
          <p className="m-0 text-sm text-ink-2">{STAY_NOTE}</p>
        </section>

        <section id="wear" className="flex scroll-mt-20 flex-col gap-4 pt-14 min-[900px]:gap-6 min-[900px]:pt-24">
          <h2 className="m-0 font-display text-[40px] leading-none font-light tracking-[-0.02em]">What to wear</h2>
          <dl className="m-0 flex flex-col">
            {ATTIRE.map((item, index) => (
              <div
                key={item.when}
                className={[
                  "flex justify-between gap-4 border-t py-3.5",
                  index === 0 ? "border-ink" : "border-[var(--rule)]",
                  index === ATTIRE.length - 1 ? "border-b border-b-[var(--rule)]" : "",
                ].join(" ")}
              >
                <dt className="text-[15px] font-medium">{item.when}</dt>
                <dd className="m-0 text-right font-display text-lg">{item.what}</dd>
              </div>
            ))}
          </dl>
          <ul aria-label="Palette" className="mt-1 mb-0 grid list-none grid-cols-5 gap-1.5 p-0">
            {PALETTE.map((swatch) => (
              <li key={swatch.name} className="flex flex-col gap-1.5">
                <span
                  className="h-14"
                  style={{
                    background: swatch.hex,
                    boxShadow: needsEdge(swatch.hex) ? "inset 0 0 0 1px color-mix(in srgb, var(--ink) 20%, transparent)" : undefined,
                  }}
                />
                <span className="text-xs">{swatch.name}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="questions" className="flex scroll-mt-20 flex-col gap-4 pt-14 pb-12 min-[900px]:gap-6 min-[900px]:pt-24 min-[900px]:pb-24">
          <h2 className="m-0 mb-1 font-display text-[40px] leading-none font-light tracking-[-0.02em]">Questions</h2>
          <Questions />
        </section>
        </div>
        </div>
      </main>
      <Footer line={GUIDE_FOOTER_LINE} />
    </div>
  );
}

function needsEdge(hex: string) {
  const value = Number.parseInt(hex.slice(1), 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return (red * 299 + green * 587 + blue * 114) / 1000 > 210;
}
