import type { Metadata } from "next";
import { EVENTS } from "@/data/weddingData";
import WeekendMap from "./WeekendMap";

export const metadata: Metadata = { title: "The weekend" };

export default async function WeekendPage({ searchParams }: { searchParams: Promise<{ stop?: string }> }) {
  const { stop } = await searchParams;
  const n = Number(stop);
  const initialStop = Number.isInteger(n) && n >= 1 && n <= EVENTS.length ? n - 1 : null;
  return <WeekendMap initialStop={initialStop} />;
}
