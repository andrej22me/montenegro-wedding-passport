"use client";

import { useState } from "react";
import { FAQS } from "@/data/weddingData";

export default function Questions() {
  const [open, setOpen] = useState(() => FAQS.map((_, index) => index === 0));

  return (
    <div className="flex flex-col border-b border-[var(--rule)]">
      {FAQS.map((item, index) => {
        const expanded = open[index];
        return (
          <div
            key={item.q}
            className={index === 0 ? "border-t border-ink" : "border-t border-[var(--rule)]"}
          >
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() =>
                setOpen((current) => current.map((value, i) => (i === index ? !value : value)))
              }
              className="flex min-h-[58px] w-full cursor-pointer items-center justify-between gap-4 border-0 bg-transparent p-0 text-left font-display text-xl text-ink"
            >
              {item.q}
              <span aria-hidden="true" className="w-5 text-center font-ui text-[22px]">
                {expanded ? "−" : "+"}
              </span>
            </button>
            {expanded ? <p className="m-0 pb-4 text-base leading-normal">{item.a}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
