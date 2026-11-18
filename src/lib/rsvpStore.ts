import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { AIRPORTS, EDIT_DEADLINE, EVENTS, FLIGHT_DATES } from "@/data/weddingData";

export const SLUGS = EVENTS.map((event) => event.slug);
const AIRPORT_CODES = new Set(AIRPORTS.map((airport) => airport.code));
const FILE = path.join(process.cwd(), "data", "rsvp-mock.json");

const LIMITS = {
  name: 80,
  email: 120,
  phone: 40,
  note: 500,
  dietary: 500,
  date: 20,
  time: 8,
  flight: 20,
} as const;

export type ResponseRow = {
  token: string;
  created_at: string;
  updated_at: string;
  lead_name: string;
  email: string;
  whatsapp: string;
  attending: "yes" | "no";
  guests: string[];
  events: Record<string, string[]>;
  dietary: Record<string, string>;
  note: string;
  flights_status: "none" | "added";
  flights_updated_at: string;
  last_reminder_at: string;
};

export type FlightGroup = {
  token: string;
  group: number;
  guests: string[];
  arrival_airport: string;
  arrival_date: string;
  arrival_time: string;
  arrival_flight: string;
  departure_airport: string;
  departure_date: string;
  departure_time: string;
  departure_flight: string;
  pickup: "yes" | "no";
  updated_at: string;
};

export type RsvpInput = {
  token?: string;
  attending: "yes" | "no";
  lead_name: string;
  guests: string[];
  email: string;
  whatsapp: string;
  events: Record<string, string[]>;
  dietary: Record<string, string>;
  note: string;
};

export type FlightsInput = {
  pickup: "yes" | "no";
  groups: Array<{
    guests: string[];
    arrival_airport: string;
    arrival_date: string;
    arrival_time: string;
    arrival_flight: string;
    departure_airport: string;
    departure_date: string;
    departure_time: string;
    departure_flight: string;
  }>;
};

type Store = { responses: ResponseRow[]; flights: FlightGroup[] };

export function editsClosed(now = Date.now()) {
  return now >= Date.parse(`${EDIT_DEADLINE}T23:59:59+02:00`);
}

export function newToken() {
  return randomBytes(18).toString("base64url");
}

function clip(value: unknown, max: number) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

function emailOf(value: unknown) {
  return String(value ?? "").trim().toLowerCase().slice(0, LIMITS.email);
}

export function validEmail(value: string) {
  return value.length <= LIMITS.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function namesOf(values: unknown, lead: string) {
  const listed = (Array.isArray(values) ? values : []).map((name) => clip(name, LIMITS.name)).filter(Boolean);
  const extras = listed.filter((name) => name !== lead);
  return [lead, ...extras].slice(0, 6);
}

function eventsOf(value: unknown, guests: string[]) {
  const source = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const allowed = new Set(guests);
  return Object.fromEntries(
    SLUGS.map((slug) => {
      const listed = Array.isArray(source[slug]) ? source[slug] : [];
      const attending = listed.map((name) => clip(name, LIMITS.name)).filter((name) => allowed.has(name));
      return [slug, guests.filter((name) => attending.includes(name))];
    }),
  );
}

export function parseRsvp(body: Record<string, unknown>): RsvpInput | null {
  const attending = body.attending === "no" ? "no" : body.attending === "yes" ? "yes" : null;
  const lead = clip(body.lead_name, LIMITS.name);
  const email = emailOf(body.email);
  if (!attending || !lead || !validEmail(email)) return null;
  const guests = attending === "yes" ? namesOf(body.guests, lead) : [lead];
  if (!guests.length || guests[0] !== lead) return null;
  return {
    attending,
    lead_name: lead,
    guests,
    email,
    whatsapp: clip(body.whatsapp, LIMITS.phone),
    events: attending === "yes" ? eventsOf(body.events, guests) : Object.fromEntries(SLUGS.map((slug) => [slug, []])),
    dietary: attending === "yes" ? dietaryOf(body.dietary, guests) : {},
    note: attending === "no" ? clip(body.note, LIMITS.note) : "",
    token: typeof body.token === "string" ? body.token : undefined,
  };
}

function dietaryOf(value: unknown, guests: string[]) {
  const source = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return Object.fromEntries(guests.map((name) => [name, clip(source[name], LIMITS.dietary)]));
}

export function formatDietary(dietary: Record<string, string>) {
  return Object.entries(dietary)
    .filter(([, note]) => note)
    .map(([name, note]) => `${name}: ${note}`)
    .join(" | ");
}

export function parseDietary(value: string) {
  const dietary: Record<string, string> = {};
  for (const part of value.split("|")) {
    const split = part.indexOf(":");
    if (split < 1) continue;
    const name = part.slice(0, split).trim();
    const note = part.slice(split + 1).trim();
    if (name) dietary[name] = note;
  }
  return dietary;
}

function airportOf(value: unknown) {
  const code = clip(value, 8).toUpperCase();
  return AIRPORT_CODES.has(code) ? code : "";
}

export function parseFlights(body: Record<string, unknown>, guests: string[]): FlightsInput | null {
  const listed = Array.isArray(body.groups) ? body.groups.slice(0, 3) : [];
  if (!listed.length) return null;
  const allowed = new Set(guests);
  const dates = new Set(FLIGHT_DATES);
  const groups = listed.map((item) => {
    const group = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    const names = (Array.isArray(group.guests) ? group.guests : []).map((name) => clip(name, LIMITS.name)).filter((name) => allowed.has(name));
    const date = (value: unknown) => {
      const next = clip(value, LIMITS.date);
      return dates.has(next) ? next : "";
    };
    return {
      guests: guests.filter((name) => names.includes(name)),
      arrival_airport: airportOf(group.arrival_airport),
      arrival_date: date(group.arrival_date),
      arrival_time: clip(group.arrival_time, LIMITS.time),
      arrival_flight: clip(group.arrival_flight, LIMITS.flight),
      departure_airport: airportOf(group.departure_airport),
      departure_date: date(group.departure_date),
      departure_time: clip(group.departure_time, LIMITS.time),
      departure_flight: clip(group.departure_flight, LIMITS.flight),
    };
  }).filter((group) => group.guests.length);
  if (!groups.length) return null;
  return { pickup: body.pickup === "yes" ? "yes" : "no", groups };
}

function useSheet() {
  return Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY && process.env.RSVP_SHEET_ID);
}

async function sheets() {
  const { google } = await import("googleapis");
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

function splitList(value: string) {
  return value.split("|").map((item) => item.trim()).filter(Boolean);
}

async function readMock(): Promise<Store> {
  try {
    const raw = JSON.parse(await fs.readFile(FILE, "utf8")) as { responses?: Partial<ResponseRow>[]; flights?: FlightGroup[] };
    return {
      responses: (raw.responses ?? []).map(normaliseResponse),
      flights: raw.flights ?? [],
    };
  } catch {
    return { responses: [], flights: [] };
  }
}

function normaliseResponse(row: Partial<ResponseRow>): ResponseRow {
  const dietary = row.dietary && typeof row.dietary === "object" ? row.dietary : parseDietary(String(row.dietary ?? ""));
  return {
    token: row.token ?? "",
    created_at: row.created_at ?? "",
    updated_at: row.updated_at ?? "",
    lead_name: row.lead_name ?? "",
    email: row.email ?? "",
    whatsapp: row.whatsapp ?? "",
    attending: row.attending === "no" ? "no" : "yes",
    guests: row.guests ?? [],
    events: row.events ?? {},
    dietary,
    note: row.note ?? "",
    flights_status: row.flights_status === "added" ? "added" : "none",
    flights_updated_at: row.flights_updated_at ?? "",
    last_reminder_at: row.last_reminder_at ?? "",
  };
}

async function writeMock(data: Store) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, `${JSON.stringify(data, null, 2)}\n`);
}

const RESPONSE_HEADER = ["token", "created_at", "updated_at", "lead_name", "email", "whatsapp", "attending", "guests", ...SLUGS, "dietary", "note", "flights_status", "flights_updated_at", "last_reminder_at"];
const FLIGHT_HEADER = [
  "token", "group", "guests",
  "arrival_airport", "arrival_date", "arrival_time", "arrival_flight",
  "departure_airport", "departure_date", "departure_time", "departure_flight",
  "pickup", "updated_at",
];

function responseValues(rows: ResponseRow[]) {
  return [
    RESPONSE_HEADER,
    ...rows.map((row) => [
      row.token,
      row.created_at,
      row.updated_at,
      row.lead_name,
      row.email,
      row.whatsapp,
      row.attending,
      row.guests.join("|"),
      ...SLUGS.map((slug) => (row.events[slug] ?? []).join("|")),
      formatDietary(row.dietary),
      row.note,
      row.flights_status,
      row.flights_updated_at,
      row.last_reminder_at,
    ]),
  ];
}

function flightValues(rows: FlightGroup[]) {
  return [FLIGHT_HEADER, ...rows.map((row) => [
    row.token, String(row.group), row.guests.join("|"),
    row.arrival_airport, row.arrival_date, row.arrival_time, row.arrival_flight,
    row.departure_airport, row.departure_date, row.departure_time, row.departure_flight,
    row.pickup, row.updated_at,
  ])];
}

function rowsToResponses(values: string[][]): ResponseRow[] {
  const header = values[0] ?? [];
  const index = (name: string) => header.indexOf(name);
  return values.slice(1).filter((row) => row.some(Boolean)).map((row) => ({
    token: row[index("token")] ?? "",
    created_at: row[index("created_at")] ?? "",
    updated_at: row[index("updated_at")] ?? "",
    lead_name: row[index("lead_name")] ?? "",
    email: row[index("email")] ?? "",
    whatsapp: row[index("whatsapp")] ?? "",
    attending: row[index("attending")] === "no" ? "no" : "yes",
    guests: splitList(row[index("guests")] ?? ""),
    events: Object.fromEntries(SLUGS.map((slug) => [slug, splitList(index(slug) >= 0 ? row[index(slug)] ?? "" : "")])),
    dietary: parseDietary(index("dietary") >= 0 ? row[index("dietary")] ?? "" : ""),
    note: row[index("note")] ?? "",
    flights_status: row[index("flights_status")] === "added" ? "added" : "none",
    flights_updated_at: row[index("flights_updated_at")] ?? "",
    last_reminder_at: row[index("last_reminder_at")] ?? "",
  }));
}

function rowsToFlights(values: string[][]): FlightGroup[] {
  const header = values[0] ?? [];
  const index = (name: string) => header.indexOf(name);
  const cell = (row: string[], name: string) => (index(name) >= 0 ? row[index(name)] ?? "" : "");
  return values.slice(1).filter((row) => row.some(Boolean)).map((row) => ({
    token: cell(row, "token"),
    group: Number(cell(row, "group")) || 1,
    guests: splitList(cell(row, "guests")),
    arrival_airport: cell(row, "arrival_airport"),
    arrival_date: cell(row, "arrival_date"),
    arrival_time: cell(row, "arrival_time"),
    arrival_flight: cell(row, "arrival_flight"),
    departure_airport: cell(row, "departure_airport"),
    departure_date: cell(row, "departure_date"),
    departure_time: cell(row, "departure_time"),
    departure_flight: cell(row, "departure_flight"),
    pickup: cell(row, "pickup") === "yes" ? "yes" : "no",
    updated_at: cell(row, "updated_at"),
  }));
}

async function readSheet(range: string) {
  const api = await sheets();
  const res = await api.spreadsheets.values.get({ spreadsheetId: process.env.RSVP_SHEET_ID, range });
  return (res.data.values as string[][]) ?? [];
}

async function writeSheet(range: string, values: string[][]) {
  const api = await sheets();
  await api.spreadsheets.values.clear({ spreadsheetId: process.env.RSVP_SHEET_ID, range: range.split("!")[0] });
  await api.spreadsheets.values.update({
    spreadsheetId: process.env.RSVP_SHEET_ID,
    range,
    valueInputOption: "RAW",
    requestBody: { values },
  });
}

async function readStore(): Promise<Store> {
  if (!useSheet()) return readMock();
  const [responses, flights] = await Promise.all([readSheet("Responses!A:Z"), readSheet("Flights!A:Z")]);
  return {
    responses: responses.length ? rowsToResponses(responses) : [],
    flights: flights.length ? rowsToFlights(flights) : [],
  };
}

async function writeResponses(responses: ResponseRow[], flights: FlightGroup[]) {
  if (!useSheet()) {
    await writeMock({ responses, flights });
    return;
  }
  await writeSheet("Responses!A1", responseValues(responses));
}

async function writeFlights(responses: ResponseRow[], flights: FlightGroup[]) {
  if (!useSheet()) {
    await writeMock({ responses, flights });
    return;
  }
  await writeSheet("Flights!A1", flightValues(flights));
}

export async function upsertResponse(input: RsvpInput) {
  const data = await readStore();
  const now = new Date().toISOString();
  const byToken = input.token ? data.responses.find((row) => row.token === input.token) : undefined;
  const existing = byToken ?? data.responses.find((row) => emailOf(row.email) === input.email);
  const token = existing?.token || (input.attending === "yes" ? newToken() : "");
  const row: ResponseRow = {
    token,
    created_at: existing?.created_at || now,
    updated_at: now,
    lead_name: input.lead_name,
    email: input.email,
    whatsapp: input.whatsapp,
    attending: input.attending,
    guests: input.guests,
    events: input.events,
    dietary: input.dietary,
    note: input.note,
    flights_status: existing?.flights_status ?? "none",
    flights_updated_at: existing?.flights_updated_at ?? "",
    last_reminder_at: existing?.last_reminder_at ?? "",
  };
  const responses = existing
    ? data.responses.map((item) => (item === existing ? row : item))
    : [...data.responses, row];
  await writeResponses(responses, data.flights);
  return row;
}

export async function getResponse(token: string) {
  if (!/^[A-Za-z0-9_-]{16,}$/.test(token)) return null;
  const data = await readStore();
  return data.responses.find((row) => row.token === token) ?? null;
}

export async function getFlights(token: string) {
  const response = await getResponse(token);
  if (!response) return null;
  const data = await readStore();
  const groups = data.flights.filter((row) => row.token === token).sort((a, b) => a.group - b.group);
  return { response, groups, closed: editsClosed() };
}

export async function saveFlights(token: string, input: FlightsInput) {
  if (editsClosed()) return "closed" as const;
  const data = await readStore();
  const response = data.responses.find((row) => row.token === token);
  if (!response) return "missing" as const;
  const now = new Date().toISOString();
  const next: FlightGroup[] = input.groups.map((group, index) => ({
    token,
    group: index + 1,
    guests: group.guests,
    arrival_airport: group.arrival_airport,
    arrival_date: group.arrival_date,
    arrival_time: group.arrival_time,
    arrival_flight: group.arrival_flight,
    departure_airport: group.departure_airport,
    departure_date: group.departure_date,
    departure_time: group.departure_time,
    departure_flight: group.departure_flight,
    pickup: input.pickup,
    updated_at: now,
  }));
  const flights = [...data.flights.filter((row) => row.token !== token), ...next];
  const responses = data.responses.map((row) => row.token === token ? { ...row, flights_status: "added" as const, flights_updated_at: now } : row);
  await writeFlights(responses, flights);
  return "saved" as const;
}

export async function listAccepted(options: { missingFlightsOnly?: boolean } = {}) {
  const data = await readStore();
  return data.responses.filter((row) => row.attending === "yes" && row.token && (!options.missingFlightsOnly || row.flights_status !== "added"));
}

export async function markReminded(tokens: string[], at: string) {
  if (!tokens.length) return;
  const data = await readStore();
  const chosen = new Set(tokens);
  const responses = data.responses.map((row) => chosen.has(row.token) ? { ...row, last_reminder_at: at } : row);
  await writeResponses(responses, data.flights);
}
