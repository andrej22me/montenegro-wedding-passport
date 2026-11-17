import { Compass } from "lucide-react";
import Navbar from "@/components/Navbar";
import ScrollyMapSection from "@/components/ScrollyMapSection";
import RsvpPassportForm from "@/components/RsvpPassportForm";
import Faq from "@/components/Faq";
import { AIRPORTS, ATTIRE, CONTACT, MOMENTS, PALETTE, WEDDING } from "@/data/weddingData";

const h2 = "text-center font-display text-3xl uppercase tracking-[0.16em] text-navy sm:text-5xl";

export default function HomePage() {
  return (
    <div id="top">
      <Navbar />

      {/* Hero */}
      <section className="border-b border-gold/25 px-5 pb-20 pt-28 sm:px-8 sm:pt-36">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-12">
          <div className="space-y-6 text-center lg:col-span-7 lg:text-left">
            <h1 className="font-display text-4xl uppercase leading-[1.1] tracking-[0.14em] text-navy sm:text-6xl xl:text-7xl">
              A Journey Through <span className="text-gold">Montenegro</span>
            </h1>
            <p className="font-script text-3xl text-navy/90 sm:text-5xl">One love. One coast. Forever.</p>
            <p className="font-display text-sm uppercase tracking-[0.24em] text-muted">
              {WEDDING.place} · {WEDDING.date}
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2 lg:justify-start">
              <a
                href="#journey-map"
                className="inline-flex items-center gap-2.5 rounded-full bg-navy px-7 py-3.5 font-display text-xs uppercase tracking-[0.22em] text-parchment shadow-md hover:bg-[#2c435e]"
              >
                <Compass className="h-4 w-4 text-gold-light" />
                Explore the map
              </a>
              <a
                href="#rsvp"
                className="rounded-full border border-gold/60 bg-card px-7 py-3.5 font-display text-xs uppercase tracking-[0.22em] text-navy hover:bg-parchment"
              >
                RSVP
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="passport-card rounded-2xl p-4 sm:p-5">
              <img
                src="/images/passport-spread.png"
                alt="Passport invitation"
                className="w-full rounded-xl border border-gold/30"
              />
              <div className="mt-4 flex items-center justify-between px-2">
                <p className="text-lg italic text-ink">The Adriatic sets the scene, love writes the story.</p>
                <img src="/images/kotor-stamp.png" alt="" className="multiply h-16 w-20 shrink-0 object-contain" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <ScrollyMapSection />

      {/* Weekend */}
      <section id="weekend" className="mx-auto max-w-7xl scroll-mt-16 px-5 py-24 sm:px-8">
        <h2 className={h2}>The Weekend</h2>
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:gap-10">
          {MOMENTS.map((m) => (
            <article key={m.id} className="passport-card overflow-hidden rounded-2xl">
              <div className="p-4 pb-0">
                <img
                  src={m.image}
                  alt={m.venue}
                  className="h-60 w-full rounded-xl border border-gold/30 object-cover sm:h-72"
                />
              </div>
              <div className="flex items-start gap-4 p-6 sm:p-8">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold font-display text-sm text-navy">
                  {m.id}
                </span>
                <div>
                  <h3 className="font-display text-xl uppercase tracking-[0.14em] text-navy sm:text-2xl">{m.venue}</h3>
                  <p className="mt-1 font-display text-xs uppercase tracking-[0.2em] text-terracotta">
                    {m.event} · {m.day}
                  </p>
                  <p className="mt-3 text-lg italic text-navy">{m.line}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Travel & stay */}
      <section id="travel" className="scroll-mt-16 border-y border-gold/25 bg-[#efe5d8]/60 px-5 py-24 sm:px-8">
        <h2 className={h2}>Travel & Stay</h2>
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
          {AIRPORTS.map((a) => (
            <div key={a.code} className="passport-card rounded-2xl p-7 text-center">
              <span className="inline-block rounded border border-gold/35 bg-parchment px-3 py-1 font-display text-2xl tracking-[0.18em] text-navy">
                {a.code}
              </span>
              <h3 className="mt-4 font-display text-lg uppercase tracking-[0.14em] text-navy">{a.name}</h3>
              <p className="mt-1 text-lg text-ink">{a.note}</p>
            </div>
          ))}
          <div id="stay" className="passport-card rounded-2xl p-7 text-center">
            <Compass className="mx-auto h-9 w-9 text-gold" />
            <h3 className="mt-4 font-display text-lg uppercase tracking-[0.14em] text-navy">Portonovi</h3>
            <p className="mt-1 text-lg text-ink">Adriatic Events will confirm your room.</p>
          </div>
        </div>
      </section>

      {/* Attire */}
      <section id="attire" className="scroll-mt-16 px-5 py-24 sm:px-8">
        <h2 className={h2}>Attire</h2>
        <div className="mt-10 flex justify-center gap-3">
          {PALETTE.map((c) => (
            <span key={c} className="h-10 w-10 rounded-full border border-black/10 shadow-inner sm:h-12 sm:w-12" style={{ backgroundColor: c }} />
          ))}
        </div>
        <div className="mx-auto mt-10 grid max-w-4xl gap-5 sm:grid-cols-3">
          {ATTIRE.map((a) => (
            <div key={a.when} className="passport-card rounded-xl p-6 text-center">
              <h3 className="font-display text-base uppercase tracking-[0.14em] text-navy">{a.what}</h3>
              <p className="mt-1 text-lg italic text-muted">{a.when}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-16 px-5 pb-8 pt-8 sm:px-8">
        <h2 className={h2}>FAQ</h2>
        <Faq />
      </section>

      <RsvpPassportForm />

      <footer className="border-t-4 border-gold bg-navy px-5 py-16 text-center text-parchment">
        <p className="font-display text-sm uppercase tracking-[0.28em] text-gold-light">A Journey Through Montenegro</p>
        <p className="mt-1 font-script text-3xl">One love. One coast. Forever.</p>
        <img src="/images/ae-logo.png" alt="Adriatic Events" className="mx-auto mt-10 h-24 w-auto brightness-0 invert" />
        <a href={`mailto:${CONTACT.email}`} className="mt-6 inline-block text-lg underline underline-offset-4">
          {CONTACT.email}
        </a>
      </footer>
    </div>
  );
}
