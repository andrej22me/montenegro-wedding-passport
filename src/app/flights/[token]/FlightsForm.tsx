"use client";

import Link from "next/link";
import { useState } from "react";
import { ReplyMark } from "@/app/rsvp/RsvpScreen";
import RsvpShell from "@/components/RsvpShell";
import { AIRPORTS, FLIGHT_DATES } from "@/data/weddingData";

const field = "box-border h-[52px] w-full rounded-[2px] border border-ink bg-field px-3.5 text-base text-ink disabled:opacity-100";

type Group = {
  guests: string[];
  arrival_airport: string;
  arrival_date: string;
  arrival_time: string;
  arrival_flight: string;
  departure_airport: string;
  departure_date: string;
  departure_time: string;
  departure_flight: string;
};

function blank(names: string[], includeAll: boolean): Group {
  return {
    guests: includeAll ? names : [],
    arrival_airport: AIRPORTS[0]?.code ?? "TIV",
    arrival_date: FLIGHT_DATES[0],
    arrival_time: "",
    arrival_flight: "",
    departure_airport: AIRPORTS[0]?.code ?? "TIV",
    departure_date: FLIGHT_DATES[FLIGHT_DATES.length - 1],
    departure_time: "",
    departure_flight: "",
  };
}

function todayMark() {
  const date = new Date();
  const months = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  return `${String(date.getDate()).padStart(2, "0")} ${months[date.getMonth()]}`;
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}

function joinNames(names: string[]) {
  const firsts = names.map(firstName);
  if (firsts.length <= 1) return firsts[0] ?? "";
  if (firsts.length === 2) return `${firsts[0]} and ${firsts[1]}`;
  return `${firsts.slice(0, -1).join(", ")} and ${firsts.at(-1)}`;
}

export default function FlightsForm({
  token, names, closed, pickup: initialPickup, groups: initialGroups,
}: {
  token: string;
  names: string[];
  closed: boolean;
  pickup: "yes" | "no";
  groups: Group[];
}) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [pickup, setPickup] = useState<"yes" | "no">(initialPickup);
  const [groups, setGroups] = useState<Group[]>(initialGroups.length ? initialGroups : [blank(names, true)]);

  const assign = (groupIndex: number, name: string) => {
    if (closed) return;
    setGroups((current) => current.map((group, index) => ({
      ...group,
      guests: index === groupIndex ? [...new Set([...group.guests, name])] : group.guests.filter((guest) => guest !== name),
    })));
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (closed) return;
    setBusy(true);
    setMessage("");
    const company = String(new FormData(event.currentTarget).get("hp") ?? "");
    const response = await fetch(`/api/flights/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pickup, groups, hp: company }),
    });
    const data = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      setMessage(data.error ?? "Please try again.");
      return;
    }
    setSaved(true);
  };

  if (saved) {
    return (
      <RsvpShell>
        <div className="flex flex-col items-center gap-4 pt-12 text-center">
          <ReplyMark large ring="FLIGHTS RECEIVED · SEE YOU THERE · " date={todayMark()} />
          <h1 className="m-0 font-display text-[40px] leading-[1.05] font-light">Saved</h1>
          <Link href="/weekend" className="inline-flex min-h-11 items-center text-[15px] font-medium text-ink no-underline">Back to the weekend</Link>
        </div>
      </RsvpShell>
    );
  }

  return (
    <RsvpShell
      bar={closed ? undefined : (
        <div className="flex flex-col gap-2">
          {message ? <p className="m-0 text-center text-sm">{message}</p> : null}
          <button type="submit" form="flights-form" disabled={busy} className="inline-flex h-14 w-full cursor-pointer items-center justify-center rounded-[2px] border-0 bg-ink text-[17px] font-medium text-paper disabled:opacity-[0.35]">
            Save flights
          </button>
        </div>
      )}
    >
      <form id="flights-form" onSubmit={save} className="flex flex-col gap-6 pt-8">
        <input type="text" name="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-px w-px" />
        <div>
          <h1 className="m-0 font-display text-[40px] leading-[1.02] font-light tracking-[-0.02em]">Your flights</h1>
          <p className="mt-2 mb-0 text-[15px] text-ink-2">{joinNames(names)}</p>
        </div>
        {groups.map((group, index) => (
          <fieldset key={index} className="flex flex-col gap-4 border-0 p-0">
            {groups.length > 1 ? <legend className="pb-1 font-display text-[26px]">Flight {index + 1}</legend> : null}
            {groups.length > 1 ? (
              <div className="flex flex-wrap gap-2">
                {names.map((name) => {
                  const on = group.guests.includes(name);
                  return (
                    <button key={name} type="button" aria-pressed={on} onClick={() => assign(index, name)} className={["inline-flex h-11 items-center rounded-full border px-4 text-[15px] font-medium", on ? "border-ink bg-ink text-paper" : "border-dashed border-[color-mix(in_srgb,var(--ink)_45%,transparent)] text-ink-2"].join(" ")}>
                      {firstName(name)}
                    </button>
                  );
                })}
              </div>
            ) : null}
            <Leg title="Arrival" airport={group.arrival_airport} date={group.arrival_date} time={group.arrival_time} flight={group.arrival_flight} locked={closed} onChange={(patch) => setGroups((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item))} prefix={`a${index}`} arrival />
            <Leg title="Departure" airport={group.departure_airport} date={group.departure_date} time={group.departure_time} flight={group.departure_flight} locked={closed} onChange={(patch) => setGroups((current) => current.map((item, itemIndex) => itemIndex === index ? {
              ...item,
              departure_airport: patch.arrival_airport ?? item.departure_airport,
              departure_date: patch.arrival_date ?? item.departure_date,
              departure_time: patch.arrival_time ?? item.departure_time,
              departure_flight: patch.arrival_flight ?? item.departure_flight,
            } : item))} prefix={`d${index}`} />
          </fieldset>
        ))}
        {!closed && groups.length < 3 ? (
          <button type="button" onClick={() => setGroups((current) => [...current, blank(names, false)])} className="self-start border-0 bg-transparent p-0 text-[15px] font-medium text-ink underline underline-offset-[3px]">
            Travelling separately?
          </button>
        ) : null}
        <fieldset className="flex flex-col gap-2.5 border-0 p-0">
          <legend className="pb-1 text-sm font-medium">Airport pickup?</legend>
          <div className="flex gap-2">
            <Chip pressed={pickup === "yes"} onClick={() => { if (!closed) setPickup("yes"); }}>Yes</Chip>
            <Chip pressed={pickup === "no"} onClick={() => { if (!closed) setPickup("no"); }}>No</Chip>
          </div>
        </fieldset>
      </form>
    </RsvpShell>
  );
}

function Leg({
  title, airport, date, time, flight, locked, onChange, prefix, arrival = false,
}: {
  title: string;
  airport: string;
  date: string;
  time: string;
  flight: string;
  locked: boolean;
  prefix: string;
  arrival?: boolean;
  onChange: (patch: Partial<Pick<Group, "arrival_airport" | "arrival_date" | "arrival_time" | "arrival_flight">>) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="m-0 font-display text-[26px] font-normal">{title}</h2>
      <label htmlFor={`${prefix}-airport`} className="flex flex-col gap-1.5 text-sm font-medium">
        Airport
        <select id={`${prefix}-airport`} disabled={locked} value={airport} onChange={(event) => onChange({ arrival_airport: event.target.value })} className={field}>
          {AIRPORTS.map((item) => <option key={item.code} value={item.code}>{item.name} ({item.code})</option>)}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label htmlFor={`${prefix}-date`} className="flex flex-col gap-1.5 text-sm font-medium">
          Date
          <select id={`${prefix}-date`} disabled={locked} value={date} onChange={(event) => onChange({ arrival_date: event.target.value })} className={field}>
            {FLIGHT_DATES.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label htmlFor={`${prefix}-time`} className="flex flex-col gap-1.5 text-sm font-medium">
          Time
          <input id={`${prefix}-time`} readOnly={locked} value={time} onChange={(event) => onChange({ arrival_time: event.target.value })} className={field} />
        </label>
      </div>
      <label htmlFor={`${prefix}-flight`} className="flex flex-col gap-1.5 text-sm font-medium">
        Flight
        <input id={`${prefix}-flight`} readOnly={locked} value={flight} onChange={(event) => onChange({ arrival_flight: event.target.value })} className={field} />
      </label>
    </div>
  );
}

function Chip({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: string }) {
  return (
    <button type="button" aria-pressed={pressed} onClick={onClick} className={["inline-flex h-11 cursor-pointer items-center rounded-full border px-4 text-[15px] font-medium", pressed ? "border-ink bg-ink text-paper" : "border-dashed border-[color-mix(in_srgb,var(--ink)_45%,transparent)] bg-transparent text-ink-2"].join(" ")}>
      {children}
    </button>
  );
}
