"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import RsvpShell from "@/components/RsvpShell";
import Stamp from "@/components/Stamp";
import { CONTACT, COUPLE, EVENTS } from "@/data/weddingData";

const STORAGE = "ns-rsvp-draft";
const STEPS = ["choose", "who", "events", "dietary", "contact", "decline", "done", "declined"] as const;
type Step = (typeof STEPS)[number];
const MONTHS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

type Draft = {
  guests: string[];
  att: Record<string, boolean[]>;
  diet: string[];
  email: string;
  phone: string;
  note: string;
  dname: string;
  done: { declined: boolean; names: string[]; counts: string[]; token: string } | null;
};

export type ReplySeed = {
  token: string;
  guests: string[];
  events: Record<string, string[]>;
  dietary: Record<string, string>;
  email: string;
  whatsapp: string;
};

const field =
  "box-border h-[52px] w-full min-w-0 flex-1 rounded-[2px] border border-ink bg-field px-3.5 text-base text-ink";
const area =
  "box-border min-h-[110px] w-full resize-y rounded-[2px] border border-ink bg-field px-3.5 py-3 text-base text-ink";

function attendanceFrom(seed?: ReplySeed) {
  if (!seed) return {};
  return Object.fromEntries(
    EVENTS.map((event, eventIndex) => [
      eventIndex,
      seed.guests.map((name) => seed.events[event.slug]?.includes(name) !== false),
    ]),
  );
}

function isStep(value: string | null): value is Step {
  return STEPS.includes(value as Step);
}

function firstName(name: string, index: number) {
  const word = name.trim().split(/\s+/)[0];
  return word || `Guest ${index + 1}`;
}

function joinNames(names: string[]) {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

function emailOk(value: string) {
  return /\S+@\S+\.\S+/.test(value);
}

function todayMark() {
  const date = new Date();
  return `${String(date.getDate()).padStart(2, "0")} ${MONTHS[date.getMonth()]}`;
}

function loadDraft(): Draft | null {
  try {
    const raw = sessionStorage.getItem(STORAGE);
    if (!raw) return null;
    const data = JSON.parse(raw) as Draft;
    return data && Array.isArray(data.guests) ? data : null;
  } catch {
    return null;
  }
}

export default function RsvpScreen({ seed, locked = false }: { seed?: ReplySeed; locked?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const editing = Boolean(seed);
  const base = seed ? `/rsvp/edit/${seed.token}` : "/rsvp";
  const requested = params.get("step");
  const step: Step = isStep(requested) ? requested : editing ? "who" : "choose";
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [ready, setReady] = useState(false);
  const [guests, setGuests] = useState<string[]>(seed?.guests.length ? seed.guests : [""]);
  const [att, setAtt] = useState<Record<string, boolean[]>>(() => attendanceFrom(seed));
  const [diet, setDiet] = useState<string[]>(() => (seed?.guests ?? [""]).map((name) => seed?.dietary[name] ?? ""));
  const [email, setEmail] = useState(seed?.email ?? "");
  const [phone, setPhone] = useState(seed?.whatsapp ?? "");
  const [note, setNote] = useState("");
  const [dname, setDname] = useState("");
  const [done, setDone] = useState<Draft["done"]>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (editing) {
      setReady(true);
      return;
    }
    const draft = loadDraft();
    if (draft) {
      setGuests(draft.guests.length ? draft.guests : [""]);
      setAtt(draft.att ?? {});
      setDiet(draft.diet ?? draft.guests.map(() => ""));
      setEmail(draft.email ?? "");
      setPhone(draft.phone ?? "");
      setNote(draft.note ?? "");
      setDname(draft.dname ?? "");
      setDone(draft.done ?? null);
    }
    setReady(true);
  }, [editing]);

  useEffect(() => {
    if (!ready || editing) return;
    const draft: Draft = { guests, att, diet, email, phone, note, dname, done };
    sessionStorage.setItem(STORAGE, JSON.stringify(draft));
  }, [ready, editing, guests, att, diet, email, phone, note, dname, done]);

  useEffect(() => {
    if (step === "choose") return;
    titleRef.current?.focus();
  }, [step]);

  const go = (next: Step) => {
    setMessage("");
    const href = next === "choose" ? (editing ? "/weekend" : "/rsvp") : `${base}?step=${next}`;
    router.push(href, { scroll: false });
  };

  const backTo = { who: "choose", events: "who", dietary: "events", contact: "dietary", decline: "choose", done: "contact", declined: "decline" } as const;
  const on = (eventIndex: number, guestIndex: number) => att[eventIndex]?.[guestIndex] !== false;
  const counts = guests.map((_, guestIndex) => EVENTS.filter((_, eventIndex) => on(eventIndex, guestIndex)).length);
  const summary = guests.map((guest, index) => ({
    name: guest.trim() || `Guest ${index + 1}`,
    count: counts[index] === 0 ? "Not attending" : `${counts[index]} of ${EVENTS.length} events`,
  }));
  const whoOk = (guests[0] ?? "").trim().length > 1;
  const declineOk = dname.trim().length > 1 && emailOk(email);
  const stepNum = step === "who" ? 1 : step === "events" ? 2 : step === "dietary" ? 3 : step === "contact" ? 4 : 0;
  const showBar = step === "who" || step === "events" || step === "dietary" || step === "contact" || step === "decline";

  const toggle = (eventIndex: number, guestIndex: number) => {
    setAtt((current) => {
      const row = [...(current[eventIndex] ?? [])];
      row[guestIndex] = current[eventIndex]?.[guestIndex] === false;
      return { ...current, [eventIndex]: row };
    });
  };

  const removeGuest = (index: number) => {
    setGuests((current) => current.filter((_, guestIndex) => guestIndex !== index));
    setDiet((current) => current.filter((_, guestIndex) => guestIndex !== index));
    setAtt((current) =>
      Object.fromEntries(
        Object.entries(current).map(([key, row]) => [key, row.filter((_, guestIndex) => guestIndex !== index)]),
      ),
    );
  };

  const send = async (event: React.FormEvent<HTMLFormElement>, attending: "yes" | "no") => {
    event.preventDefault();
    const company = String(new FormData(event.currentTarget).get("hp") ?? "");
    const people = attending === "yes"
      ? guests.map((name, index) => ({ name: name.trim(), index })).filter((person) => person.name)
      : [{ name: dname.trim(), index: 0 }];
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attending,
        lead_name: people[0]?.name ?? "",
        guests: people.map((person) => person.name),
        email,
        whatsapp: attending === "yes" ? phone : "",
        note: attending === "no" ? note : "",
        token: seed?.token,
        dietary: Object.fromEntries(people.map((person) => [person.name, attending === "yes" ? diet[person.index] ?? "" : ""])),
        events: Object.fromEntries(
          EVENTS.map((item, eventIndex) => [
            item.slug,
            people.filter((person) => (attending === "yes" ? on(eventIndex, person.index) : false)).map((person) => person.name),
          ]),
        ),
        hp: company,
      }),
    });
    const data = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      setMessage(data.error ?? "Please try again.");
      return;
    }
    const names = attending === "yes" ? people.map((person) => firstName(person.name, person.index)) : [firstName(dname, 0)];
    const sentCounts = attending === "yes"
      ? people.map((person) => {
          const count = EVENTS.filter((_, eventIndex) => on(eventIndex, person.index)).length;
          return count === 0 ? "Not attending" : `${count} of ${EVENTS.length} events`;
        })
      : [];
    setDone({ declined: attending === "no", names, counts: sentCounts, token: data.token ?? "" });
    go(attending === "no" ? "declined" : "done");
  };

  if (locked && seed) {
    return (
      <RsvpShell>
        <div className="flex flex-col gap-4 pt-8">
          <h1 className="m-0 font-display text-[40px] leading-[1.05] font-light">Replies are closed. Email Silvana.</h1>
          <a href={`mailto:${CONTACT.email}`} className="text-[15px] font-medium text-ink">{CONTACT.person}</a>
          <div className="border-t border-ink">
            {seed.guests.map((name) => (
              <div key={name} className="flex justify-between gap-3 border-b border-[var(--rule)] py-3">
                <span className="font-display text-[19px]">{firstName(name, 0)}</span>
                <span className="text-sm text-ink-2">{seed.dietary[name] || "None"}</span>
              </div>
            ))}
          </div>
        </div>
      </RsvpShell>
    );
  }

  const title =
    step === "who" ? "Who's coming?" : step === "events" ? "Which events?" : step === "dietary" ? "Dietary needs" : step === "contact" ? "Where can we reach you?" : step === "decline" ? "We'll miss you" : "";

  let bar: React.ReactNode = null;
  if (step === "who") bar = <StepButton label="Continue" disabled={!whoOk} onClick={() => go("events")} />;
  if (step === "events") bar = <StepButton label="Continue" onClick={() => go("dietary")} />;
  if (step === "dietary") bar = <StepButton label="Continue" onClick={() => go("contact")} />;
  if (step === "contact") bar = <StepButton label="Send reply" type="submit" form="rsvp-contact" disabled={!emailOk(email) || busy} />;
  if (step === "decline") bar = <StepButton label="Send reply" type="submit" form="rsvp-decline" disabled={!declineOk || busy} />;

  return (
    <RsvpShell bar={showBar ? <div className="flex flex-col gap-2">{message ? <p className="m-0 text-center text-sm">{message}</p> : null}{bar}</div> : undefined}>
      {step === "choose" ? <Choose onAccept={() => go("who")} onDecline={() => go("decline")} /> : null}

      {step === "who" || step === "events" || step === "dietary" || step === "contact" || step === "decline" ? (
        <div className="flex flex-col gap-1.5 pt-3">
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => go(backTo[step])} className="inline-flex h-11 cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-[15px] font-medium text-ink">
              <Chevron />
              Back
            </button>
            {stepNum > 0 ? <span className="text-[13px] font-medium text-ink-2 tabular-nums">Step {stepNum} of 4</span> : null}
          </div>
          {stepNum > 0 ? (
            <div aria-hidden="true" className="grid grid-cols-4 gap-1">
              {[1, 2, 3, 4].map((item) => (
                <span key={item} className={item <= stepNum ? "h-[3px] bg-accent" : "h-[3px] bg-[color-mix(in_srgb,var(--ink)_15%,transparent)]"} />
              ))}
            </div>
          ) : null}
          <h1 ref={titleRef} tabIndex={-1} className="mt-[18px] mb-[18px] font-display text-[40px] leading-[1.02] font-light tracking-[-0.02em] outline-none">
            {title}
          </h1>

          {step === "who" ? (
            <div className="flex flex-col gap-4">
              {guests.map((guest, index) => (
                <div key={index} className="flex flex-col gap-1.5">
                  <label htmlFor={`guest-${index}`} className="text-sm font-medium">{index === 0 ? "Your name" : `Guest ${index + 1}`}</label>
                  <div className="flex gap-2">
                    <input
                      id={`guest-${index}`}
                      className={field}
                      type="text"
                      autoComplete={index === 0 ? "name" : "off"}
                      value={guest}
                      onChange={(event) => setGuests((current) => current.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)))}
                    />
                    {index > 0 ? (
                      <button type="button" aria-label={`Remove guest ${index + 1}`} onClick={() => removeGuest(index)} className="inline-flex size-[52px] shrink-0 cursor-pointer items-center justify-center rounded-[2px] border border-[color-mix(in_srgb,var(--ink)_30%,transparent)] bg-transparent text-ink">
                        <Cross />
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
              {guests.length < 6 ? (
                <button type="button" onClick={() => { setGuests((current) => [...current, ""]); setDiet((current) => [...current, ""]); }} className="inline-flex h-[52px] cursor-pointer items-center justify-center gap-2 rounded-[2px] border border-dashed border-[color-mix(in_srgb,var(--ink)_45%,transparent)] bg-transparent text-[15px] font-medium text-ink">
                  <Plus />
                  Add a guest
                </button>
              ) : null}
            </div>
          ) : null}

          {step === "events" ? (
            <div className="flex flex-col">
              {EVENTS.map((item, eventIndex) => (
                <div key={item.slug} className="flex flex-col gap-3 border-t border-[color-mix(in_srgb,var(--ink)_16%,transparent)] py-3.5 pb-4">
                  <div className="flex items-center gap-3">
                    <Stamp src={item.image} alt="" width={50} height={50} padding={4} />
                    <span className="flex flex-col gap-0.5">
                      <span className="font-display text-[21px] leading-[1.1]">{item.title}</span>
                      <span className="text-[13px] text-ink-2 tabular-nums">{item.when}</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {guests.map((guest, guestIndex) => {
                      const pressed = on(eventIndex, guestIndex);
                      return (
                        <button
                          key={guestIndex}
                          type="button"
                          aria-pressed={pressed}
                          onClick={() => toggle(eventIndex, guestIndex)}
                          className={[
                            "inline-flex h-11 cursor-pointer items-center gap-2 rounded-full pr-4 pl-3 text-[15px] font-medium",
                            pressed ? "border border-ink bg-ink text-paper" : "border border-dashed border-[color-mix(in_srgb,var(--ink)_45%,transparent)] bg-transparent text-ink-2",
                          ].join(" ")}
                        >
                          {pressed ? <Check /> : <Plus />}
                          {firstName(guest, guestIndex)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {step === "dietary" ? (
            <div className="flex flex-col gap-4">
              {guests.map((guest, index) => (
                <label key={index} className="flex flex-col gap-1.5 text-sm font-medium">
                  {firstName(guest, index)}
                  <input className={field} type="text" value={diet[index] ?? ""} onChange={(event) => setDiet((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} />
                </label>
              ))}
            </div>
          ) : null}

          {step === "contact" ? (
            <form id="rsvp-contact" onSubmit={(event) => send(event, "yes")} className="flex flex-col gap-4">
              <Honeypot />
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Email
                <input className={field} type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                <span>WhatsApp <span className="font-normal text-ink-2">(optional)</span></span>
                <input className={field} type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} />
              </label>
              <div className="mt-2.5 flex flex-col gap-4 bg-paper-2 p-4">
                <SummaryBlock label="Guests" onEdit={() => go("who")}>
                  {summary.map((item, index) => <SummaryRow key={index} name={item.name} value="" />)}
                </SummaryBlock>
                <SummaryBlock label="Events" onEdit={() => go("events")}>
                  {summary.map((item, index) => <SummaryRow key={index} name={firstName(guests[index] ?? "", index)} value={item.count} />)}
                </SummaryBlock>
                <SummaryBlock label="Dietary" onEdit={() => go("dietary")}>
                  {summary.map((item, index) => <SummaryRow key={index} name={firstName(guests[index] ?? "", index)} value={diet[index]?.trim() || "None"} />)}
                </SummaryBlock>
              </div>
            </form>
          ) : null}

          {step === "decline" ? (
            <form id="rsvp-decline" onSubmit={(event) => send(event, "no")} className="flex flex-col gap-4">
              <Honeypot />
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Your name
                <input className={field} type="text" autoComplete="name" required value={dname} onChange={(event) => setDname(event.target.value)} />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                <span>A note to Nicole and Scott <span className="font-normal text-ink-2">(optional)</span></span>
                <textarea className={area} rows={4} value={note} onChange={(event) => setNote(event.target.value)} />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Email
                <input className={field} type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
              </label>
            </form>
          ) : null}
        </div>
      ) : null}

      {step === "done" || step === "declined" ? (
        <Done
          titleRef={titleRef}
          declined={step === "declined" || Boolean(done?.declined)}
          title={step === "declined" ? `Thank you, ${firstName(done?.names[0] || dname, 0)}.` : `Thank you, ${joinNames(done?.names?.length ? done.names : summary.map((item) => firstName(item.name, 0)))}.`}
          summary={done?.counts.length ? done.names.map((name, index) => ({ name, count: done.counts[index] ?? "" })) : summary}
          token={done?.token ?? ""}
        />
      ) : null}
    </RsvpShell>
  );
}

function SummaryBlock({ label, onEdit, children }: { label: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-semibold text-ink-2">{label}</span>
        <button type="button" onClick={onEdit} className="h-8 cursor-pointer border-0 bg-transparent p-0 text-sm font-medium text-ink underline underline-offset-[3px]">Edit</button>
      </div>
      {children}
    </div>
  );
}

function SummaryRow({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 py-1.5">
      <span className="font-display text-[19px]">{name}</span>
      {value ? <span className="text-sm text-ink-2 tabular-nums">{value}</span> : null}
    </div>
  );
}

function Choose({ onAccept, onDecline }: { onAccept: () => void; onDecline: () => void }) {
  return (
    <div className="flex flex-col gap-4 pt-10">
      <div className="relative border border-ink bg-paper-stamp p-1.5 shadow-[0_10px_30px_color-mix(in_srgb,var(--ink)_10%,transparent)]">
        <div className="flex flex-col items-center gap-2.5 border border-[color-mix(in_srgb,var(--ink)_35%,transparent)] px-[22px] pt-11 pb-[26px] text-center">
          <p className="m-0 text-[13px] font-semibold text-accent">Kindly reply by {COUPLE.replyBy}</p>
          <h1 className="mt-1 mb-0 font-display text-[46px] leading-[0.95] font-light tracking-[-0.02em]">
            Nicole <span className="text-accent italic">&amp;</span> Scott
          </h1>
          <p className="m-0 text-sm text-ink-2">{COUPLE.dates} · {COUPLE.place}</p>
          <span aria-hidden="true" className="mt-2.5 mb-1 h-px w-10 bg-accent" />
          <h2 className="mt-0 mb-2.5 font-display text-[28px] font-normal">Will you join us?</h2>
          <button type="button" onClick={onAccept} className="inline-flex h-14 w-full cursor-pointer items-center justify-center gap-2.5 rounded-[2px] border-0 bg-ink text-[17px] font-medium text-paper">
            <Check size={18} />
            Joyfully accept
          </button>
          <button type="button" onClick={onDecline} className="h-14 w-full cursor-pointer rounded-[2px] border border-ink bg-transparent text-[17px] font-medium text-ink">
            Regretfully decline
          </button>
        </div>
        <div aria-hidden="true" className="absolute top-[-26px] right-[18px] rotate-[5deg] drop-shadow-[0_2px_4px_color-mix(in_srgb,var(--ink)_20%,transparent)]">
          <Stamp src="/images/venues/5-citadela-budva.jpg" alt="" width={70} height={90} padding={5} />
        </div>
        <ReplyMark />
      </div>
      <p className="m-0 text-center text-[13px] text-ink-2">Already replied? Your link is in your email.</p>
    </div>
  );
}

function Done({ titleRef, declined, title, summary, token }: { titleRef: React.RefObject<HTMLHeadingElement | null>; declined: boolean; title: string; summary: { name: string; count: string }[]; token: string }) {
  return (
    <div className="flex flex-col items-center gap-3.5 pt-12 text-center">
      <ReplyMark large ring={declined ? "WITH LOVE · NICOLE & SCOTT · " : "REPLY RECEIVED · SEE YOU THERE · "} date={todayMark()} />
      <h1 ref={titleRef} tabIndex={-1} className="mt-1.5 mb-0 font-display text-[40px] leading-[1.05] font-light tracking-[-0.02em] text-balance outline-none">{title}</h1>
      {declined ? <p className="m-0 font-display text-xl text-ink-2">We&apos;ll miss you.</p> : (
        <div className="mt-1.5 flex w-full flex-col gap-[18px]">
          <div className="w-full border-t border-ink border-b border-b-[color-mix(in_srgb,var(--ink)_18%,transparent)] text-left">
            {summary.map((item) => (
              <div key={item.name} className="flex justify-between gap-3 border-b border-b-[color-mix(in_srgb,var(--ink)_10%,transparent)] py-3">
                <span className="font-display text-[19px]">{item.name}</span>
                <span className="text-sm text-ink-2 tabular-nums">{item.count}</span>
              </div>
            ))}
          </div>
          {token ? (
            <>
              <Link href={`/flights/${token}`} className="grid grid-cols-[minmax(0,1fr)_20px] items-center gap-3 rounded-[2px] bg-ink px-5 py-[18px] text-left text-paper no-underline hover:text-paper">
                <span className="flex flex-col gap-[3px]">
                  <span className="text-[17px] font-medium">Add your flights</span>
                  <span className="text-sm text-[#C9D3D2]">Or later, from the link in your email</span>
                </span>
                <Arrow />
              </Link>
              <Link href={`/rsvp/edit/${token}`} className="inline-flex min-h-11 items-center justify-center text-[15px] font-medium text-ink">Change your reply</Link>
            </>
          ) : null}
        </div>
      )}
      <Link href="/weekend" className="inline-flex min-h-11 items-center text-[15px] font-medium text-ink no-underline">Back to the weekend</Link>
    </div>
  );
}

function StepButton({ label, disabled, onClick, type = "button", form }: { label: string; disabled?: boolean; onClick?: () => void; type?: "button" | "submit"; form?: string }) {
  return (
    <button type={type} form={form} onClick={onClick} disabled={disabled} className="inline-flex h-14 w-full cursor-pointer items-center justify-center gap-2.5 rounded-[2px] border-0 bg-ink text-[17px] font-medium text-paper disabled:cursor-default disabled:opacity-[0.35]">
      {label}
      <Arrow />
    </button>
  );
}

export function ReplyMark({ large = false, ring = "BUDVA · MONTENEGRO · ", date }: { large?: boolean; ring?: string; date?: string }) {
  const id = `mark${useId().replace(/:/g, "")}`;
  return (
    <svg
      width={large ? 128 : 78}
      height={large ? 128 : 78}
      viewBox="0 0 96 96"
      aria-hidden="true"
      className={large ? "-rotate-[10deg]" : "absolute top-[-14px] right-[60px] -rotate-[16deg] opacity-85 mix-blend-multiply"}
    >
      <defs>
        <path id={id} d="M48 48m-34 0a34 34 0 1 1 68 0a34 34 0 1 1-68 0" />
      </defs>
      <circle cx="48" cy="48" r="44" fill="none" stroke="#A3471F" strokeWidth={large ? 1.6 : 1.8} />
      <circle cx="48" cy="48" r="25" fill="none" stroke="#A3471F" strokeWidth={large ? 1 : 1.2} />
      <text fontFamily="Schibsted Grotesk, Arial, sans-serif" fontSize={large ? 9.5 : 10} fontWeight="600" letterSpacing={large ? 1.8 : 1.6} fill="#A3471F">
        <textPath href={`#${id}`}>{ring}</textPath>
      </text>
      {date ? (
        <text x="48" y="46" textAnchor="middle" fontFamily="Newsreader, Georgia, serif" fontSize="15" fill="#A3471F">{date}</text>
      ) : (
        <text x="48" y="53" textAnchor="middle" fontFamily="Newsreader, Georgia, serif" fontSize="16" fill="#A3471F">RSVP</text>
      )}
      {date ? <text x="48" y="60" textAnchor="middle" fontFamily="Schibsted Grotesk, Arial, sans-serif" fontSize="8" fontWeight="600" letterSpacing="1" fill="#A3471F">N&amp;S</text> : null}
    </svg>
  );
}

function Honeypot() {
  return <input type="text" name="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-px w-px" />;
}

function Chevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M10 3L5 8l5 5" />
    </svg>
  );
}

function Cross() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
    </svg>
  );
}

function Plus() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}

function Check({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <path d="M3 8.5l3.2 3.2L13 4.5" />
    </svg>
  );
}

function Arrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M4 10h12M11 5l5 5-5 5" />
    </svg>
  );
}
