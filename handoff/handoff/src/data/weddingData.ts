// Single source of truth for the wedding content.
// Map coordinates (x, y) are in map units from src/data/mapGeo.ts (use project(lon, lat) for new points).
// Placeholders in [brackets] still need answers from Adriatic Events.

export const COUPLE = {
  names: "Nicole & Scott",
  monogram: "N&S",
  dates: "5–9 August 2027",
  place: "Montenegro",
  invite: "Together with their families, Nicole and Scott invite you to a long weekend on the Adriatic.",
  replyBy: "1 May 2027",
  wedding: { when: "Sat 7 Aug, 18:00", where: "Citadela, Budva" },
};

export const CONTACT = {
  planner: "Adriatic Events",
  person: "Silvana",
  email: "silvana@adriaticevents.com",
};

export type DayName = "Thursday" | "Friday" | "Saturday" | "Sunday";

export interface WeddingEvent {
  n: number;
  slug: string;
  day: DayName;
  date: string; // "5 August"
  when: string; // short label for cards
  time: string; // 24h
  startISO: string; // for .ics, Europe/Podgorica
  title: string;
  venue: string;
  place: string;
  dress: string;
  postmark: string; // text around the postmark ring
  postmarkDate: string; // centre of the postmark
  image: string;
  alt: string;
  mapsUrl: string | null; // null = pier not confirmed yet
  lon: number;
  lat: number;
  /** Map position of the pin (map units). */
  x: number;
  y: number;
  /** Camera when this stop is selected: focus point and visible width in map units. */
  cam: { cx: number; cy: number; w: number };
}

export const EVENTS: WeddingEvent[] = [
  {
    n: 1, slug: "welcome-drinks", day: "Thursday", date: "5 August", when: "Thu 5 Aug · 19:00", time: "19:00",
    startISO: "2027-08-05T19:00:00+02:00",
    title: "Welcome drinks", venue: "Forza Kuk", place: "Kotor cable car", dress: "Mediterranean chic",
    postmark: "KOTOR · MONTENEGRO · ", postmarkDate: "05 VIII",
    image: "/images/venues/1-forza-kuk.jpg", alt: "The Bay of Kotor seen from the mountain above Kotor",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Forza+Kuk+Kotor",
    lon: 18.7924, lat: 42.3931, x: 710.0, y: 390.4, cam: { cx: 676, cy: 352, w: 300 },
  },
  {
    n: 2, slug: "boat-day", day: "Friday", date: "6 August", when: "Fri 6 Aug · 10:30", time: "10:30",
    startISO: "2027-08-06T10:30:00+02:00",
    title: "Boat day", venue: "Catamaran", place: "Bay of Kotor", dress: "Swim and resort wear",
    postmark: "PERAST · MONTENEGRO · ", postmarkDate: "06 VIII",
    image: "/images/venues/2-boat-day.jpg", alt: "The inner Bay of Kotor",
    mapsUrl: null,
    lon: 18.6872, lat: 42.4853, x: 470.9, y: 106.8, cam: { cx: 492, cy: 150, w: 260 },
  },
  {
    n: 3, slug: "lunch", day: "Friday", date: "6 August", when: "Fri 6 Aug · 13:30", time: "13:30",
    startISO: "2027-08-06T13:30:00+02:00",
    title: "Lunch", venue: "Ribarsko Selo", place: "Luštica", dress: "Swim and resort wear",
    postmark: "LUŠTICA · MONTENEGRO · ", postmarkDate: "06 VIII",
    image: "/images/venues/3-ribarsko-selo.jpg", alt: "Ribarsko Selo from above, terraces over clear water",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Ribarsko+Selo+Lustica",
    lon: 18.578, lat: 42.3973, x: 222.7, y: 377.5, cam: { cx: 236, cy: 352, w: 280 },
  },
  {
    n: 4, slug: "rehearsal-dinner", day: "Friday", date: "6 August", when: "Fri 6 Aug · 20:00", time: "20:00",
    startISO: "2027-08-06T20:00:00+02:00",
    title: "Rehearsal dinner", venue: "Castel Savina", place: "Herceg Novi", dress: "Cocktail",
    postmark: "HERCEG NOVI · MONTENEGRO · ", postmarkDate: "06 VIII",
    image: "/images/venues/4-castel-savina.jpg", alt: "A stone path at Castel Savina at sunset",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Castel+Savina+Herceg+Novi",
    lon: 18.5598, lat: 42.4555, x: 181.4, y: 198.4, cam: { cx: 196, cy: 212, w: 240 },
  },
  {
    n: 5, slug: "wedding", day: "Saturday", date: "7 August", when: "Sat 7 Aug · 18:00", time: "18:00",
    startISO: "2027-08-07T18:00:00+02:00",
    title: "The wedding", venue: "Citadela", place: "Budva Old Town", dress: "Black tie optional",
    postmark: "BUDVA · MONTENEGRO · ", postmarkDate: "07 VIII",
    image: "/images/venues/5-citadela-budva.jpg", alt: "Budva Old Town and the Citadela from the sea",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Citadela+Budva",
    lon: 18.8378, lat: 42.2777, x: 813.2, y: 745.5, cam: { cx: 800, cy: 728, w: 240 },
  },
  {
    n: 6, slug: "farewell", day: "Sunday", date: "8 August", when: "Sun 8 Aug · 13:00", time: "13:00",
    startISO: "2027-08-08T13:00:00+02:00",
    title: "Farewell", venue: "AURA Beach", place: "Porto Montenegro, Tivat", dress: "Beach casual",
    postmark: "TIVAT · MONTENEGRO · ", postmarkDate: "08 VIII",
    image: "/images/venues/6-aura-beach.jpg", alt: "The pool at AURA Beach at sunset",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=AURA+Beach+Porto+Montenegro",
    lon: 18.694, lat: 42.435, x: 486.4, y: 261.5, cam: { cx: 506, cy: 262, w: 240 },
  },
];

/** Overview camera (all six stops) and the far-out intro camera it zooms in from. */
export const CAM_OVERVIEW = { cx: 497, cy: 455, w: 720 };
export const CAM_INTRO = { cx: 497, cy: 455, w: 1150 };

/** Map labels. `max` = hide when the visible map width (map units) is larger than this. */
export const MAP_LABELS = [
  { t: "Adriatic Sea", kind: "water", x: 272.7, y: 707.6, max: 4000 },
  { t: "Bay of Kotor", kind: "water", x: 341, y: 262, max: 1200 },
  { t: "Herceg Novi", kind: "town", x: 118, y: 176, max: 900 },
  { t: "Perast", kind: "town", x: 528, y: 92, max: 900 },
  { t: "Kotor", kind: "town", x: 676, y: 296, max: 900 },
  { t: "Tivat", kind: "town", x: 528, y: 294, max: 900 },
  { t: "Budva", kind: "town", x: 780, y: 718, max: 900 },
  { t: "Sveti Stefan", kind: "town", x: 937.5, y: 800, max: 600 },
  { t: "TIV", kind: "air", x: 553, y: 354.7, max: 420 },
  { t: "Luštica", kind: "area", x: 340.9, y: 440, max: 900 },
  { t: "Lovćen", kind: "area", x: 842, y: 430, max: 900 },
] as const;

export const AIRPORTS = [
  { code: "TIV", name: "Tivat", toBudva: "25 min", badge: "Closest" },
  { code: "TGD", name: "Podgorica", toBudva: "1 hr" },
  { code: "DBV", name: "Dubrovnik", note: "Croatia, border crossing", toBudva: "2 hrs" },
];

export const TRANSFERS = "Shuttles to every event, from every guest hotel";

export const STAY = [
  { town: "Perast", nights: "Thu · Fri", image: "/images/stay/perast.jpg", alt: "Our Lady of the Rocks, off Perast" },
  { town: "Budva", nights: "Sat · Sun", image: "/images/stay/budva.jpg", alt: "Rooftops of Budva Old Town" },
];
export const STAY_NOTE = "Hotel names and booking codes will follow by email.";

export const ATTIRE = [
  { when: "Welcome drinks", what: "Mediterranean chic" },
  { when: "Boat day, lunch", what: "Swim and resort wear" },
  { when: "Rehearsal dinner", what: "Cocktail" },
  { when: "Wedding", what: "Black tie optional" },
  { when: "Farewell", what: "Beach casual" },
];

export const PALETTE = [
  { name: "Dusty blue", hex: "#5E7487" },
  { name: "Blush", hex: "#D9A5A3" },
  { name: "Sage", hex: "#9CAE8C" },
  { name: "Linen", hex: "#EDE6D6" },
  { name: "Ochre", hex: "#C9A35B" },
];

export const FAQS = [
  { q: "Do I need a visa?", a: "Not for stays under 90 days with an EU, UK, US or Canadian passport." },
  { q: "Which currency?", a: "Euro. Cards work almost everywhere." },
  { q: "Weather?", a: "Around 30°C. Bring a light layer for Thursday night at Forza Kuk, high above the bay." },
  { q: "Shoes?", a: "The old towns are cobbled stone. Block heels are a good idea." },
  { q: "Plus-ones?", a: "[Answer from Nicole and Scott]" },
  { q: "Children?", a: "[Answer from Nicole and Scott]" },
];
