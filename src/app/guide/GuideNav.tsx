"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "travel", label: "Travel" },
  { id: "stay", label: "Stay" },
  { id: "wear", label: "What to wear" },
  { id: "questions", label: "Questions" },
] as const;

export default function GuideNav() {
  const [active, setActive] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    const nodes = SECTIONS.map((section) => document.getElementById(section.id)).filter((node): node is HTMLElement => node != null);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0.1, 0.25, 0.5] },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label="On this page" className="sticky top-16 hidden h-fit w-[200px] shrink-0 flex-col gap-1 pt-2 min-[900px]:flex">
      {SECTIONS.map((section) => {
        const current = active === section.id;
        return (
          <a
            key={section.id}
            href={`#${section.id}`}
            aria-current={current ? "true" : undefined}
            className={[
              "inline-flex min-h-11 items-center text-[15px] font-medium no-underline",
              current ? "text-ink underline decoration-1 underline-offset-[6px]" : "text-ink-2",
            ].join(" ")}
          >
            {section.label}
          </a>
        );
      })}
    </nav>
  );
}
