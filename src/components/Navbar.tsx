"use client";

import { useEffect, useState } from "react";
import { Compass, Menu, X } from "lucide-react";

const LINKS = [
  { label: "Map", href: "#journey-map" },
  { label: "Weekend", href: "#weekend" },
  { label: "Travel", href: "#travel" },
  { label: "Attire", href: "#attire" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 h-16 transition-colors duration-500 ${
        scrolled || open ? "border-b border-gold/25 bg-parchment/95 backdrop-blur" : ""
      }`}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="group flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/60 bg-card">
            <Compass className="h-4 w-4 text-gold transition-transform duration-500 group-hover:rotate-45" />
          </span>
          <span className="font-display text-sm uppercase tracking-[0.25em] text-navy">
            Montenegro
          </span>
        </a>

        <nav className="hidden items-center gap-8 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-display text-[11px] uppercase tracking-[0.22em] text-ink hover:text-gold"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#rsvp"
            className="rounded-full bg-navy px-6 py-2 font-display text-[11px] uppercase tracking-[0.22em] text-parchment hover:bg-[#2c435e]"
          >
            RSVP
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="rounded-full border border-gold/35 bg-card p-2 text-navy lg:hidden"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col items-center gap-5 border-b border-gold/25 bg-parchment py-8 lg:hidden">
          {[...LINKS, { label: "RSVP", href: "#rsvp" }].map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="font-display text-xs uppercase tracking-[0.22em] text-navy"
            >
              {l.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
