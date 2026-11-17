export const WEDDING = {
  date: "October 2026",
  place: "Bay of Kotor to Budva",
};

export interface Moment {
  id: number;
  venue: string;
  event: string;
  day: string;
  line: string;
  image: string;
  /** Travel time from the previous stop, from the PDF map */
  travel?: string;
  lon: number;
  lat: number;
  zoom: number;
}

export const MOMENTS: Moment[] = [
  {
    id: 1,
    venue: "Forza Kuk",
    event: "Welcome drinks",
    day: "Friday",
    line: "Clifftop cocktails over Kotor Bay.",
    image: "/images/venues/1-forza-kuk.png",
    lon: 18.7924,
    lat: 42.3931,
    zoom: 2.35,
  },
  {
    id: 2,
    venue: "Kotor Bay",
    event: "Boat day",
    day: "Saturday",
    line: "A day on the water by catamaran.",
    image: "/images/venues/2-boat-day.png",
    travel: "15 min",
    lon: 18.6895,
    lat: 42.4864,
    zoom: 2.55,
  },
  {
    id: 3,
    venue: "Ribarsko Selo",
    event: "Lunch",
    day: "Saturday",
    line: "Lunch by the water.",
    image: "/images/venues/3-ribarsko-selo.png",
    travel: "20 min",
    lon: 18.578,
    lat: 42.3973,
    zoom: 2.6,
  },
  {
    id: 4,
    venue: "Savina",
    event: "Rehearsal dinner",
    day: "Saturday",
    line: "An evening under the trees.",
    image: "/images/venues/4-savina.png",
    travel: "15 min",
    lon: 18.5598,
    lat: 42.4555,
    zoom: 2.55,
  },
  {
    id: 5,
    venue: "Citadela Budva",
    event: "Wedding",
    day: "Sunday",
    line: "Vows within the old town walls.",
    image: "/images/venues/5-citadela-budva.png",
    travel: "20 min",
    lon: 18.8378,
    lat: 42.2777,
    zoom: 2.5,
  },
  {
    id: 6,
    venue: "Aura Beach Club",
    event: "Farewell",
    day: "Monday",
    line: "One last afternoon by the sea.",
    image: "/images/venues/6-aura-beach-club.png",
    lon: 18.694,
    lat: 42.435,
    zoom: 2.5,
  },
];

export const AIRPORTS = [
  { code: "TIV", name: "Tivat", note: "20 minutes to Kotor Bay" },
  { code: "DBV", name: "Dubrovnik", note: "About 2 hours by car" },
];

export const PALETTE = ["#1f3044", "#b97a60", "#d8a7a0", "#e8dec8", "#7a896c", "#9e7e46"];

export const ATTIRE = [
  { when: "Welcome drinks and dinner", what: "Summer cocktail" },
  { when: "Boat day and farewell", what: "Resort wear" },
  { when: "Wedding", what: "Formal" },
];

export const FAQS = [
  {
    q: "Do I need a visa?",
    a: "Not for short stays with an EU, UK, US or Canadian passport.",
  },
  {
    q: "What shoes should I bring?",
    a: "The old towns are cobbled stone. Block heels are a good idea.",
  },
  {
    q: "How do we get between venues?",
    a: "Transfers are arranged for every event. Details closer to the date.",
  },
];

export const CONTACT = {
  planner: "Adriatic Events",
  email: "silvana@adriaticevents.com",
};
