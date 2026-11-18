"use client";

import Image from "next/image";
import { COUPLE, EVENTS } from "@/data/weddingData";

const wedding = EVENTS.find((event) => event.slug === "wedding") ?? EVENTS[0];

export default function RsvpShell({ children, bar }: { children: React.ReactNode; bar?: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col min-[1024px]:flex-row">
      <aside className="relative hidden min-h-0 min-[1024px]:block min-[1024px]:w-1/2">
        <Image
          src={wedding.image}
          alt={wedding.alt}
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,color-mix(in_srgb,var(--ink)_78%,transparent)_100%)]" />
        <div className="absolute bottom-12 left-12 flex flex-col gap-3 text-paper">
          <p className="m-0 text-[15px] font-medium">{COUPLE.wedding.aside}</p>
          <p className="m-0 font-display text-[84px] leading-[0.92] font-light tracking-[-0.025em]">
            Nicole <span className="text-accent-light italic">&amp;</span> Scott
          </p>
        </div>
      </aside>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto box-border w-full max-w-[440px] px-5 pt-3 pb-8">{children}</div>
        </div>
        {bar ? (
          <div className="shrink-0 border-t border-[color-mix(in_srgb,var(--ink)_12%,transparent)] bg-paper px-5 py-4">
            <div className="mx-auto w-full max-w-[440px]">{bar}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
