"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronLeft, ChevronRight, Compass, Ship } from "lucide-react";
import { MOMENTS } from "@/data/weddingData";
import { COAST_PATH, LAND_PATH, MAP_SIZE, ROADS_PATH, project } from "@/data/mapGeo";
import { FULL_CAMERA, LEGS, ROUTE_PATH, TOWNS, WATER_LABELS, cameraFor } from "@/data/mapRoute";

const HOLD = 0.5;
const STEP = 1 + HOLD;

export default function ScrollyMapSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const travelerRef = useRef<SVGGElement>(null);
  const townsRef = useRef<SVGGElement>(null);
  const stRef = useRef<ScrollTrigger | null>(null);
  const goToRef = useRef<(i: number) => void>(() => {});
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const svg = svgRef.current!;
    const path = pathRef.current!;
    const traveler = travelerRef.current!;
    const towns = townsRef.current!;
    const total = path.getTotalLength();

    const nearest = (x: number, y: number) => {
      let best = 0;
      let bestD = Infinity;
      const n = 500;
      for (let i = 0; i <= n; i++) {
        const p = path.getPointAtLength((total * i) / n);
        const d = (p.x - x) ** 2 + (p.y - y) ** 2;
        if (d < bestD) {
          bestD = d;
          best = (total * i) / n;
        }
      }
      return best;
    };

    const stopLen = [0, ...MOMENTS.map((m) => {
      const p = project(m.lon, m.lat);
      return nearest(p.x, p.y);
    })];

    const cam = { ...FULL_CAMERA, along: 0 };

    const apply = () => {
      svg.setAttribute("viewBox", `${cam.x} ${cam.y} ${cam.w} ${cam.h}`);
      const t = Math.max(0, Math.min(total, cam.along));
      const pt = path.getPointAtLength(t);
      traveler.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
      const k = Math.max(0.52, cam.w / MAP_SIZE.width);
      svg.querySelectorAll<SVGGElement>(".pin-scale").forEach((g) => {
        g.setAttribute("transform", `scale(${k})`);
      });
      towns.setAttribute("opacity", k > 0.7 ? "1" : "0");
    };

    const target = (i: number) => {
      if (i === 0) return { ...FULL_CAMERA, along: 0 };
      const m = MOMENTS[i - 1];
      return { ...cameraFor(m.lon, m.lat, m.zoom), along: stopLen[i] };
    };

    apply();

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: trackRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.8,
        snap: { snapTo: "labels", duration: { min: 0.3, max: 0.8 }, ease: "power1.inOut" },
        invalidateOnRefresh: true,
        onRefresh: apply,
      },
      onUpdate: () => setActive(Math.min(MOMENTS.length, Math.round(tl.time() / STEP))),
    });

    tl.addLabel("s0").to({}, { duration: HOLD });
    MOMENTS.forEach((_, idx) => {
      const i = idx + 1;
      const to = target(i);
      tl.to(cam, {
        x: to.x,
        y: to.y,
        w: to.w,
        h: to.h,
        along: to.along,
        duration: 1,
        ease: "power2.inOut",
        onUpdate: apply,
      })
        .addLabel(`s${i}`)
        .to({}, { duration: HOLD });
    });

    stRef.current = tl.scrollTrigger ?? null;
    goToRef.current = (i: number) => {
      const st = tl.scrollTrigger;
      const clamped = Math.max(0, Math.min(MOMENTS.length, i));
      if (st) window.scrollTo({ top: st.labelToScroll(`s${clamped}`), behavior: "smooth" });
    };

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  const goTo = (i: number) => goToRef.current(i);
  const m = active > 0 ? MOMENTS[active - 1] : null;

  return (
    <section id="journey-map">
      <div ref={trackRef} className="relative h-[900vh]">
        <div className="sticky top-16 mx-auto flex h-[calc(100svh-4rem)] max-w-[1440px] flex-col gap-4 p-3 sm:p-5 md:flex-row">
          <aside className="passport-card hidden w-64 shrink-0 flex-col rounded-xl p-5 lg:flex">
            <div className="flex items-center justify-between border-b border-gold/25 pb-3">
              <h3 className="font-display text-sm uppercase tracking-[0.18em] text-navy">The Route</h3>
              <Compass className="h-6 w-6 text-gold" />
            </div>

            <button
              type="button"
              onClick={() => goTo(0)}
              className={`mt-3 rounded-lg px-3 py-2 text-left font-display text-[11px] uppercase tracking-[0.18em] ${
                active === 0 ? "bg-navy text-parchment" : "text-ink hover:bg-gold/10"
              }`}
            >
              Full map
            </button>

            <ol className="mt-1 space-y-1">
              {MOMENTS.map((x) => (
                <li key={x.id}>
                  {x.travel && (
                    <div className="flex items-center gap-1.5 py-0.5 pl-5 text-xs italic text-muted">
                      <Ship className="h-3 w-3 text-gold" />
                      {x.travel}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => goTo(x.id)}
                    onMouseEnter={() => setHover(x.id)}
                    onMouseLeave={() => setHover(null)}
                    className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-all ${
                      active === x.id
                        ? "translate-x-1 bg-navy text-parchment shadow-md"
                        : active > x.id
                          ? "bg-gold/10 text-navy"
                          : "text-ink hover:bg-gold/10"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-display text-xs ${
                        active === x.id ? "border-gold-light bg-gold text-white" : "border-gold/50"
                      }`}
                    >
                      {x.id}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-display text-[11px] uppercase tracking-[0.14em]">
                        {x.venue}
                      </span>
                      <span className={`block truncate text-sm italic ${active === x.id ? "text-parchment/80" : "text-muted"}`}>
                        {x.event}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </aside>

          <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-gold/40 bg-[#7d9aaa]">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${MAP_SIZE.width} ${MAP_SIZE.height}`}
              className="h-full w-full touch-pan-y"
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label="Interactive map of the wedding route along the Montenegrin coast"
            >
              <defs>
                <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9fb8c4" />
                  <stop offset="100%" stopColor="#6f93a3" />
                </linearGradient>
                <linearGradient id="land" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#efe6d6" />
                  <stop offset="100%" stopColor="#ddcbb0" />
                </linearGradient>
                <filter id="pin-shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="1.2" stdDeviation="1.4" floodOpacity="0.35" />
                </filter>
              </defs>

              <rect width={MAP_SIZE.width} height={MAP_SIZE.height + 1} fill="url(#sea)" />
              <path d={LAND_PATH} fill="url(#land)" />
              <path
                d={ROADS_PATH}
                fill="none"
                stroke="#c4b194"
                strokeOpacity="0.4"
                strokeWidth="1"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={COAST_PATH}
                fill="none"
                stroke="#5d7380"
                strokeWidth="1.35"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />

              <g ref={townsRef} className="pointer-events-none">
                {WATER_LABELS.map((l) => {
                  const p = project(l.lon, l.lat);
                  return (
                    <text
                      key={l.name}
                      x={p.x}
                      y={p.y}
                      textAnchor="middle"
                      fill={l.script ? "#1f3044" : "#3d5660"}
                      opacity={l.script ? 0.72 : 0.5}
                      className={l.script ? "font-script" : "font-display"}
                      style={{ fontSize: l.script ? 28 : 12, letterSpacing: l.script ? 0 : "0.18em" }}
                    >
                      {l.name}
                    </text>
                  );
                })}
                {TOWNS.map((t) => {
                  const p = project(t.lon, t.lat);
                  return (
                    <text
                      key={t.name}
                      x={p.x + 7}
                      y={p.y - 6}
                      fill="#5a5146"
                      className="font-display"
                      style={{ fontSize: 11, letterSpacing: "0.14em" }}
                    >
                      {t.name.toUpperCase()}
                    </text>
                  );
                })}
              </g>

              <path
                d={ROUTE_PATH}
                fill="none"
                stroke="#fbf8f3"
                strokeWidth="9"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              {LEGS.map((leg) => {
                const on = active === 0 || active === leg.to || active === leg.from;
                const done = active > leg.to;
                const hot = hover === leg.to;
                return (
                  <g key={leg.to}>
                    <path
                      d={leg.d}
                      fill="none"
                      stroke="#9e7e46"
                      strokeOpacity={hot ? 1 : on ? 1 : done ? 0.85 : 0.35}
                      strokeWidth={hot || active === leg.to ? 5 : 3.2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray={leg.mode === "sea" ? "7 8" : undefined}
                      vectorEffect="non-scaling-stroke"
                    />
                    <path
                      d={leg.d}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="18"
                      strokeLinecap="round"
                      className="cursor-pointer"
                      vectorEffect="non-scaling-stroke"
                      onClick={() => goTo(leg.to)}
                      onMouseEnter={() => setHover(leg.to)}
                      onMouseLeave={() => setHover(null)}
                    />
                  </g>
                );
              })}

              <path ref={pathRef} d={ROUTE_PATH} fill="none" stroke="none" />

              <g ref={travelerRef} className="pointer-events-none">
                <g className={active === 0 ? "opacity-0" : "opacity-100"}>
                  <circle r="6" fill="#1f3044" stroke="#c8b082" strokeWidth="2" />
                </g>
              </g>

              {MOMENTS.map((stop) => {
                const p = project(stop.lon, stop.lat);
                const on = active === stop.id;
                const hot = hover === stop.id;
                return (
                  <g
                    key={stop.id}
                    transform={`translate(${p.x} ${p.y})`}
                    className="cursor-pointer"
                    role="button"
                    tabIndex={0}
                    aria-label={`${stop.id}. ${stop.venue}, ${stop.event}`}
                    onClick={() => goTo(stop.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        goTo(stop.id);
                      }
                    }}
                    onMouseEnter={() => setHover(stop.id)}
                    onMouseLeave={() => setHover(null)}
                  >
                    <g className="pin-scale" filter="url(#pin-shadow)">
                      {on && <circle r="16" fill="#9e7e46" className="map-pulse" />}
                      <circle
                        r="11"
                        fill={on || hot ? "#1f3044" : "#fbf8f3"}
                        stroke={on || hot ? "#c8b082" : "#9e7e46"}
                        strokeWidth="2"
                      />
                      <text
                        textAnchor="middle"
                        dy="4.5"
                        className="font-display"
                        fill={on || hot ? "#f4ebe1" : "#1f3044"}
                        style={{ fontSize: 11, fontWeight: 600 }}
                      >
                        {stop.id}
                      </text>
                      {(hot || on) && (
                        <text
                          textAnchor="middle"
                          y="-18"
                          className="font-display"
                          fill="#1f3044"
                          style={{ fontSize: 10, letterSpacing: "0.12em" }}
                        >
                          {stop.venue.toUpperCase()}
                        </text>
                      )}
                    </g>
                  </g>
                );
              })}
            </svg>

            <div className="pointer-events-none absolute right-3 top-3 flex flex-col items-end gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-card/90">
                <Compass className="h-5 w-5 text-navy" />
              </div>
              <div className="rounded-md border border-gold/30 bg-card/90 px-2.5 py-1.5 font-display text-[9px] uppercase tracking-[0.16em] text-navy">
                <span className="mr-3 inline-block w-6 border-t-2 border-gold align-middle" />
                Road
                <span className="ml-3 mr-3 inline-block w-6 border-t-2 border-dashed border-gold align-middle" />
                Boat
              </div>
            </div>

            <div className="absolute inset-x-3 bottom-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => goTo(active - 1)}
                disabled={active === 0}
                aria-label="Previous stop"
                className="rounded-full border border-gold/40 bg-card/95 p-2 text-navy shadow-sm disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex gap-1.5 rounded-full border border-gold/30 bg-card/90 px-3 py-2">
                {[0, ...MOMENTS.map((x) => x.id)].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={i === 0 ? "Full map" : MOMENTS[i - 1].venue}
                    className={`h-2 rounded-full transition-all ${active === i ? "w-6 bg-navy" : "w-2 bg-gold/45"}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => goTo(active + 1)}
                disabled={active === MOMENTS.length}
                aria-label="Next stop"
                className="rounded-full bg-navy p-2 text-parchment shadow-sm disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <aside className="passport-card shrink-0 rounded-xl p-5 sm:p-6 md:w-[340px] md:overflow-hidden">
            <div key={active} className="flex h-full animate-[fade_0.6s_ease] flex-col">
              {m ? (
                <>
                  <img
                    src={m.image}
                    alt={m.venue}
                    className="mb-5 hidden aspect-[3/2] w-full rounded-lg border border-gold/30 object-cover md:block"
                  />
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy font-display text-sm text-parchment">
                      {m.id}
                    </span>
                    <h2 className="font-display text-xl uppercase tracking-[0.12em] text-navy sm:text-2xl">
                      {m.venue}
                    </h2>
                  </div>
                  <p className="mt-2 font-display text-xs uppercase tracking-[0.18em] text-terracotta">
                    {m.event} · {m.day}
                  </p>
                  <p className="mt-3 text-lg italic text-navy sm:text-xl">{m.line}</p>
                </>
              ) : (
                <>
                  <h2 className="font-display text-xl uppercase tracking-[0.12em] text-navy sm:text-2xl">
                    Six stops along the coast
                  </h2>
                  <p className="mt-1 font-script text-3xl text-gold">One love. One coast. Forever.</p>
                  <p className="mt-4 text-lg italic text-ink">Click a pin or scroll to follow the weekend.</p>
                  <button
                    type="button"
                    onClick={() => goTo(1)}
                    className="mt-auto hidden items-center justify-center gap-2 rounded-full bg-navy py-2.5 font-display text-xs uppercase tracking-[0.2em] text-parchment hover:bg-[#2c435e] md:flex"
                  >
                    Begin
                    <ChevronRight className="h-4 w-4 text-gold-light" />
                  </button>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
