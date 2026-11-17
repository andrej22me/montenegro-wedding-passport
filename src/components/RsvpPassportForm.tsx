"use client";

import { useState } from "react";
import { Stamp } from "lucide-react";
import { MOMENTS } from "@/data/weddingData";

const field =
  "w-full rounded-lg border border-gold/40 bg-card px-4 py-2.5 text-lg text-navy outline-none focus:border-navy";
const label = "mb-2 block font-display text-[11px] uppercase tracking-[0.18em] text-navy";

export default function RsvpPassportForm() {
  const [name, setName] = useState("");
  const [events, setEvents] = useState<number[]>(MOMENTS.map((m) => m.id));
  const [sent, setSent] = useState(false);

  const toggle = (id: number) =>
    setEvents((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <section id="rsvp" className="px-4 py-24 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center font-display text-3xl uppercase tracking-[0.16em] text-navy sm:text-5xl">
          RSVP
        </h2>

        <div className="passport-card mt-10 rounded-2xl p-6 sm:p-10">
          {sent ? (
            <div className="py-6 text-center">
              <img src="/images/kotor-stamp.png" alt="" className="multiply mx-auto h-28 w-32 object-contain" />
              <p className="mt-6 font-display text-xl uppercase tracking-[0.14em] text-navy">Thank you, {name}</p>
              <p className="mt-1 font-script text-3xl text-gold">See you in Montenegro</p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="space-y-8"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <label>
                  <span className={label}>Name</span>
                  <input required value={name} onChange={(e) => setName(e.target.value)} className={field} />
                </label>
                <label>
                  <span className={label}>Email</span>
                  <input required type="email" className={field} />
                </label>
                <label>
                  <span className={label}>Guests</span>
                  <select defaultValue="2" className={field}>
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className={label}>Dietary requirements</span>
                  <input className={field} />
                </label>
              </div>

              <div>
                <span className={label}>Joining us for</span>
                <div className="grid gap-3 sm:grid-cols-3">
                  {MOMENTS.map((m) => {
                    const on = events.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => toggle(m.id)}
                        className={`rounded-xl border p-3 text-left transition-all ${
                          on ? "border-navy bg-card shadow-sm" : "border-gold/25 opacity-55 hover:opacity-100"
                        }`}
                      >
                        <span className="block font-display text-[10px] uppercase tracking-[0.2em] text-gold">
                          {m.day}
                        </span>
                        <span className="block font-display text-sm uppercase tracking-[0.1em] text-navy">
                          {m.event}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2.5 rounded-full bg-navy px-8 py-3.5 font-display text-xs uppercase tracking-[0.22em] text-parchment shadow-md hover:bg-[#2c435e]"
                >
                  <Stamp className="h-4 w-4 text-gold-light" />
                  Send
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
