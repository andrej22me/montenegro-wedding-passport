"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { COUPLE } from "@/data/weddingData";

const NAV = [
  { label: "Weekend", href: "/weekend" },
  { label: "Travel", href: "/guide#travel" },
  { label: "Stay", href: "/guide#stay" },
  { label: "Attire", href: "/guide#wear" },
  { label: "FAQ", href: "/guide#questions" },
] as const;

export type MapView = "map" | "list";

const bar = "mx-auto flex h-full w-full max-w-[1200px] items-center justify-between px-5 min-[900px]:px-12";

export default function Header({
  tone = "solid",
  view = "map",
  onViewChange,
}: {
  /** overlay: paper type over the home photo. weekend: translucent bar with the view switch. rsvp: link back to the weekend. */
  tone?: "overlay" | "solid" | "weekend" | "rsvp";
  view?: MapView;
  onViewChange?: (view: MapView) => void;
}) {
  const pathname = usePathname();
  const onPhoto = tone === "overlay";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "box-border",
        tone === "weekend"
          ? "absolute inset-x-0 top-0 z-20 h-[60px] bg-[color-mix(in_srgb,var(--paper)_94%,transparent)] text-ink"
          : [
              "sticky top-0 z-30 h-16 bg-paper text-ink",
              scrolled ? "border-b border-[color-mix(in_srgb,var(--ink)_12%,transparent)]" : "border-b border-transparent",
            ].join(" "),
      ].join(" ")}
    >
      {onViewChange ? (
        <div
          role="group"
          aria-label="View"
          className="absolute top-1/2 left-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 gap-0.5 rounded-[3px] border border-[color-mix(in_srgb,var(--ink)_20%,transparent)] p-[3px]"
        >
          <ViewButton pressed={view === "map"} onClick={() => onViewChange("map")}>
            Map
          </ViewButton>
          <ViewButton pressed={view === "list"} onClick={() => onViewChange("list")}>
            List
          </ViewButton>
        </div>
      ) : null}

      <div className={bar}>
        <Link
          href="/"
          className="inline-flex min-h-11 min-w-11 items-center font-display text-2xl italic no-underline"
          style={{ color: onPhoto ? undefined : "inherit" }}
        >
          {COUPLE.monogram}
        </Link>

        <nav aria-label="Pages" className="hidden items-center gap-8 min-[900px]:flex">
          {NAV.map((item) => (
            <NavLink key={item.href} href={item.href} current={item.href === pathname} />
          ))}
          <RsvpLink filled={!onPhoto} />
        </nav>

        <div className="min-[900px]:hidden">
          {tone === "rsvp" ? (
            <Link href="/weekend" className="inline-flex h-11 items-center text-[15px] font-medium no-underline">
              The weekend
            </Link>
          ) : (
            <RsvpLink filled={!onPhoto} />
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, current }: { href: string; current: boolean }) {
  const label = NAV.find((item) => item.href === href)?.label;
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={[
        "inline-flex h-11 items-center text-[15px] font-medium no-underline",
        current ? "underline decoration-1 underline-offset-[6px]" : "",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

function RsvpLink({ filled }: { filled: boolean }) {
  const pathname = usePathname();
  const current = pathname === "/rsvp";
  return (
    <Link
      href="/rsvp"
      aria-current={current ? "page" : undefined}
      className={[
        "inline-flex h-11 items-center rounded-[2px] px-4 text-sm font-medium no-underline",
        filled
          ? "bg-ink text-paper hover:text-paper"
          : "bg-paper text-ink hover:text-ink min-[900px]:bg-ink min-[900px]:text-paper min-[900px]:hover:text-paper",
      ].join(" ")}
    >
      RSVP
    </Link>
  );
}

function ViewButton({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={[
        "h-11 cursor-pointer rounded-[2px] border-0 px-3.5 text-sm font-medium",
        pressed ? "bg-ink text-paper" : "bg-transparent text-ink",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
