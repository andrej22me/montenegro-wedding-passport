"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQS } from "@/data/weddingData";

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mt-10 space-y-3">
      {FAQS.map((f, i) => (
        <div key={f.q} className="passport-card overflow-hidden rounded-xl">
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
          >
            <span className="font-display text-sm uppercase tracking-[0.12em] text-navy">{f.q}</span>
            <ChevronDown className={`h-4 w-4 shrink-0 text-gold transition-transform ${open === i ? "rotate-180" : ""}`} />
          </button>
          {open === i && <p className="px-6 pb-5 text-lg text-ink">{f.a}</p>}
        </div>
      ))}
    </div>
  );
}
