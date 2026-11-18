"use client";

import { memo, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import Header, { type MapView } from "@/components/Header";
import Stamp from "@/components/Stamp";
import { LAND_PATH, ROADS_PATH, ROUTE, WATER_LINES } from "@/data/mapGeo";
import {
  CAM_INTRO,
  CAM_OVERVIEW,
  COUPLE,
  DEPARTURE,
  EVENTS,
  MAP_LABELS,
  type WeddingEvent,
} from "@/data/weddingData";
import { type Cam, anchor, flyFrame, frame } from "./camera";
import "./map.css";

const WATER_OPACITY = [0.18, 0.12, 0.07];
const DAYS = ["Thursday", "Friday", "Saturday", "Sunday"] as const;

const MapArt = memo(function MapArt() {
  return (
    <>
      <rect x={-3000} y={-3000} width={7000} height={7000} fill="var(--sea)" />
      <rect x={-300} y={-3000} width={4000} height={2520} fill="var(--paper)" />
      <rect x={1400} y={-3000} width={2600} height={7000} fill="var(--paper)" />
      {[2, 1, 0].map((index) => (
        <path
          key={index}
          d={WATER_LINES[index]}
          fill="none"
          stroke="var(--ink)"
          strokeOpacity={WATER_OPACITY[index]}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      <path d={LAND_PATH} fill="var(--paper)" stroke="var(--ink)" strokeWidth={1.1} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <path d={ROADS_PATH} fill="none" stroke="var(--road)" strokeWidth={1.2} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      {ROUTE.map((d, index) => (
        <path key={d} className="seg" data-route={index} d={d} />
      ))}
    </>
  );
});

export default function WeekendMap({ initialStop }: { initialStop: number | null }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pinRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const sizeRef = useRef({ W: 390, H: 844 });
  const camRef = useRef<Cam>(introCamera(390, 844));
  const selRef = useRef<number | null>(null);
  const playingRef = useRef(false);
  const flyingRef = useRef(false);
  const flownRef = useRef(false);
  const rafRef = useRef(0);
  const autoRef = useRef(0);
  const bootRef = useRef(0);
  const pointerRef = useRef<number | null>(null);
  const goToRef = useRef<(index: number | null, dur?: number) => void>(() => {});

  const [sel, setSel] = useState<number | null>(null);
  const [mode, setMode] = useState<MapView>("map");
  const [playing, setPlaying] = useState(false);

  const apply = () => {
    const { W, H } = sizeRef.current;
    const cam = camRef.current;
    if (!W || !H || !svgRef.current) return;
    const view = frame(cam, W, H);
    svgRef.current.setAttribute("viewBox", `${view.x0} ${view.y0} ${view.w} ${view.h}`);
    svgRef.current.querySelectorAll<SVGPathElement>("[data-route]").forEach((path, index) => {
      const on = selRef.current === index + 1;
      path.setAttribute("stroke-width", (2 * view.k).toFixed(3));
      path.setAttribute("stroke-dasharray", on ? "none" : `${view.k.toFixed(2)} ${(6 * view.k).toFixed(2)}`);
      path.classList.toggle("on", on);
    });
    EVENTS.forEach((event, index) => {
      const el = pinRefs.current[index];
      if (!el) return;
      const x = (event.x - view.x0) / view.k;
      const y = (event.y - view.y0) / view.k;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    });
    MAP_LABELS.forEach((label, index) => {
      const el = labelRefs.current[index];
      if (!el) return;
      const x = (label.x - view.x0) / view.k;
      const y = (label.y - view.y0) / view.k;
      const visible = cam.w <= label.max && x > -40 && x < W + 40 && y > 60 && y < H;
      el.style.visibility = visible ? "visible" : "hidden";
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    });
  };

  const stopAuto = () => {
    window.clearTimeout(autoRef.current);
    if (!playingRef.current) return;
    playingRef.current = false;
    setPlaying(false);
  };

  const queueNext = () => {
    window.clearTimeout(autoRef.current);
    autoRef.current = window.setTimeout(() => {
      const current = selRef.current ?? -1;
      if (current >= EVENTS.length - 1) {
        playingRef.current = false;
        setPlaying(false);
        goToRef.current(null, 2000);
        return;
      }
      goToRef.current(current + 1, 2000);
    }, 3200);
  };

  const fly = (to: Cam, dur: number) => {
    window.cancelAnimationFrame(rafRef.current);
    const from = { ...camRef.current };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finish = () => {
      camRef.current = to;
      flyingRef.current = false;
      apply();
      if (playingRef.current) queueNext();
    };
    if (reduced || dur <= 0) {
      rootRef.current?.querySelector(".stage")?.classList.add("is-fading");
      finish();
      window.setTimeout(() => rootRef.current?.querySelector(".stage")?.classList.remove("is-fading"), 220);
      return;
    }
    flyingRef.current = true;
    const t0 = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      camRef.current = flyFrame(from, to, t);
      apply();
      if (t < 1) rafRef.current = requestAnimationFrame(step);
      else {
        flyingRef.current = false;
        if (playingRef.current) queueNext();
      }
    };
    rafRef.current = requestAnimationFrame(step);
  };

  const goTo = (index: number | null, dur = 1700) => {
    flownRef.current = true;
    selRef.current = index;
    setSel(index);
    setMode("map");
    const url = new URL(window.location.href);
    if (index == null) url.searchParams.delete("stop");
    else url.searchParams.set("stop", String(index + 1));
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
    const { W, H } = sizeRef.current;
    fly(cameraFor(index, W, H), dur);
  };
  goToRef.current = goTo;

  const manual = (index: number | null, dur = 1700) => {
    stopAuto();
    goTo(index, dur);
  };

  useLayoutEffect(() => {
    apply();
  });

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const read = () => {
      sizeRef.current = { W: el.clientWidth, H: el.clientHeight };
    };
    read();
    camRef.current = introCamera(sizeRef.current.W, sizeRef.current.H);
    apply();
    bootRef.current = window.setTimeout(() => goToRef.current(initialStop, 2200), 350);
    const ro = new ResizeObserver(() => {
      read();
      if (flyingRef.current) return;
      const { W, H } = sizeRef.current;
      camRef.current = flownRef.current ? cameraFor(selRef.current, W, H) : introCamera(W, H);
      apply();
    });
    ro.observe(el);
    return () => {
      window.clearTimeout(bootRef.current);
      window.clearTimeout(autoRef.current);
      window.cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
    // The intro runs once for this deep link.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialStop]);

  const onKey = (event: React.KeyboardEvent) => {
    const tag = (event.target as HTMLElement).tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (event.key === "Escape") {
      event.preventDefault();
      manual(null);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      const current = selRef.current;
      manual(current == null ? 0 : current >= EVENTS.length - 1 ? null : current + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      const current = selRef.current;
      manual(current == null || current <= 0 ? null : current - 1);
    }
  };

  const event = sel == null ? null : EVENTS[sel];
  const sheetBottom = sel == null ? 244 : 392;

  return (
    <div className="weekend" ref={rootRef} tabIndex={0} onKeyDown={onKey}>
      <div className="stage">
        <svg ref={svgRef} className="map-svg" role="img" aria-label="Map of the Montenegrin coast from Herceg Novi to Budva">
          <MapArt />
        </svg>
        {MAP_LABELS.map((label, index) => (
          <span key={label.t} ref={(node) => { labelRefs.current[index] = node; }} className={`lbl ${label.kind}`}>
            {label.t}
          </span>
        ))}
        {EVENTS.map((item, index) => (
          <button
            key={item.slug}
            ref={(node) => { pinRefs.current[index] = node; }}
            type="button"
            className={["pin", index === sel ? "on" : sel != null ? "dim" : ""].join(" ")}
            aria-label={`${item.n}, ${item.title}, ${item.venue}`}
            onClick={() => manual(index)}
          >
            <span className="dot">{item.n}</span>
            <span className="tag">{item.venue}</span>
          </button>
        ))}
        <a className="osm" style={{ bottom: sheetBottom }} href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
          © OpenStreetMap contributors
        </a>
      </div>

      <Header
        tone="weekend"
        view={mode}
        onViewChange={(next) => {
          if (next === "list") stopAuto();
          setMode(next);
        }}
      />

      {mode === "list" ? (
        <List onOpen={(index) => manual(index)} />
      ) : event ? (
        <StopSheet
          event={event}
          index={sel ?? 0}
          playing={playing}
          onPrev={() => manual(sel != null && sel > 0 ? sel - 1 : null)}
          onNext={() => manual(sel != null && sel < EVENTS.length - 1 ? sel + 1 : null)}
          onOverview={() => manual(null, 1800)}
          onSwipe={(direction) => manual(direction < 0 ? (sel != null && sel < EVENTS.length - 1 ? sel + 1 : null) : sel != null && sel > 0 ? sel - 1 : null)}
          onToggle={() => {
            if (playingRef.current) stopAuto();
            else {
              playingRef.current = true;
              setPlaying(true);
              queueNext();
            }
          }}
          pointerRef={pointerRef}
        />
      ) : (
        <section className="sheet sheet-overview" aria-label="The weekend">
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <h1 className="m-0 font-display text-[34px] font-light tracking-[-0.01em]">The weekend</h1>
            <span className="text-sm text-ink-2 tabular-nums">{COUPLE.datesShort}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 4 }}>
            {EVENTS.map((item, index) => (
              <button key={item.slug} type="button" className="mini" aria-label={`${item.n}, ${item.title}`} onClick={() => manual(index)}>
                <Stamp src={item.image} alt="" width={50} height={50} padding={4} />
                <span>{item.n}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              playingRef.current = true;
              setPlaying(true);
              goTo(0, 2000);
            }}
            className="flex h-[54px] cursor-pointer items-center justify-center gap-2.5 rounded-[2px] border-0 bg-ink text-[17px] font-medium text-paper"
          >
            <PlayIcon />
            Start the journey
          </button>
        </section>
      )}
    </div>
  );
}

function StopSheet({
  event,
  index,
  playing,
  onPrev,
  onNext,
  onOverview,
  onSwipe,
  onToggle,
  pointerRef,
}: {
  event: WeddingEvent;
  index: number;
  playing: boolean;
  onPrev: () => void;
  onNext: () => void;
  onOverview: () => void;
  onSwipe: (direction: number) => void;
  onToggle: () => void;
  pointerRef: React.MutableRefObject<number | null>;
}) {
  return (
    <section
      className="sheet sheet-stop"
      onPointerDown={(pointer) => {
        pointerRef.current = pointer.clientX;
      }}
      onPointerUp={(pointer) => {
        if (pointerRef.current == null) return;
        const dx = pointer.clientX - pointerRef.current;
        pointerRef.current = null;
        if (Math.abs(dx) < 50) return;
        onSwipe(dx);
      }}
      onPointerCancel={() => {
        pointerRef.current = null;
      }}
    >
      <div className="stop-photo">
        <Stamp src={event.image} alt={event.alt} width={360} height={190} />
        <EventMark ring={event.postmark} date={event.postmarkDate} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "0 2px" }}>
        <p className="m-0 text-[13px] font-semibold text-accent tabular-nums">{event.when}</p>
        <h2 className="m-0 font-display text-[30px] leading-[1.05] font-normal tracking-[-0.01em]">{event.title}</h2>
        <p className="m-0 mt-0.5 flex flex-wrap gap-1.5 text-sm text-ink-2">
          <span className="font-medium text-ink">{event.venue}</span>
          <span aria-hidden="true">·</span>
          <span>{event.place}</span>
        </p>
        <p className="m-0 flex items-center gap-1.5 text-sm text-ink-2">
          <HangerIcon />
          {event.dress}
        </p>
      </div>
      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        <button type="button" className="ibtn" aria-label="Previous stop" onClick={onPrev}>
          <Chevron direction="left" />
        </button>
        <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "0 4px" }}>
          {EVENTS.map((item, dot) => (
            <span key={item.slug} className={dot === index ? "dotnav on" : "dotnav"} />
          ))}
        </div>
        <button type="button" className="ibtn" aria-label="Next stop" onClick={onNext}>
          <Chevron direction="right" />
        </button>
        <span style={{ flex: 1 }} />
        {event.mapsUrl ? (
          <a className="ibtn" href={event.mapsUrl} target="_blank" rel="noreferrer" aria-label="Directions">
            <DirectionsIcon />
          </a>
        ) : (
          <button type="button" className="ibtn" aria-label="Directions" disabled>
            <DirectionsIcon />
          </button>
        )}
        <a className="ibtn" href={`/api/ics/${event.slug}`} aria-label="Add to calendar">
          <CalendarIcon />
        </a>
        <button type="button" className="ibtn" aria-label={playing ? "Pause" : "Play the weekend"} onClick={onToggle}>
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
      </div>
      <button type="button" className="show-all" aria-label="Show all stops" onClick={onOverview}>
        <CornersIcon />
      </button>
    </section>
  );
}

function List({ onOpen }: { onOpen: (index: number) => void }) {
  const groups = DAYS.map((day) => {
    const items = EVENTS.map((event, index) => ({ event, index })).filter(({ event }) => event.day === day);
    return { day, date: items[0]?.event.date ?? "", items };
  }).filter((group) => group.items.length > 0);

  return (
    <section className="list" aria-label="All events">
      {groups.map((group) => (
        <div key={group.day}>
          <h2 className="m-0 flex items-baseline justify-between px-0 pt-[22px] pb-2 font-display text-[26px] font-normal">
            {group.day}
            <span className="font-ui text-[13px] font-medium text-ink-2">{group.date}</span>
          </h2>
          {group.items.map(({ event, index }) => (
            <button key={event.slug} type="button" className="list-row" onClick={() => onOpen(index)}>
              <Stamp src={event.image} alt="" width={60} height={60} padding={4} />
              <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span className="text-[13px] font-semibold text-accent tabular-nums">{event.time}</span>
                <span className="font-display text-[21px]">{event.title}</span>
                <span className="text-[13px] text-ink-2">
                  {event.venue} · {event.dress}
                </span>
              </span>
              <Chevron direction="right" />
            </button>
          ))}
        </div>
      ))}
      <p className="m-0 mt-[22px] border-t border-[color-mix(in_srgb,var(--ink)_16%,transparent)] pt-4 text-sm text-ink-2">{DEPARTURE}</p>
    </section>
  );
}

function EventMark({ ring, date }: { ring: string; date: string }) {
  const id = `mk${useId().replace(/:/g, "")}`;
  return (
    <svg className="event-mark" width="96" height="96" viewBox="0 0 96 96" aria-hidden="true">
      <defs>
        <path id={id} d="M48 48m-34 0a34 34 0 1 1 68 0a34 34 0 1 1-68 0" />
      </defs>
      <circle cx="48" cy="48" r="44" fill="none" stroke="var(--accent)" strokeWidth="1.6" />
      <circle cx="48" cy="48" r="25" fill="none" stroke="var(--accent)" strokeWidth="1" />
      <text fontFamily="var(--font-ui)" fontSize="9.5" fontWeight="600" letterSpacing="1.6" fill="var(--accent)">
        <textPath href={`#${id}`}>{ring}</textPath>
      </text>
      <text x="48" y="46" textAnchor="middle" fontFamily="var(--font-display)" fontSize="15" fill="var(--accent)">
        {date}
      </text>
      <text x="48" y="60" textAnchor="middle" fontFamily="var(--font-ui)" fontSize="8" fontWeight="600" letterSpacing="1" fill="var(--accent)">
        {COUPLE.datesShort.slice(-4)}
      </text>
    </svg>
  );
}

function cameraFor(index: number | null, W: number, H: number): Cam {
  const place = anchor(W, H, index);
  if (index == null) return { cx: CAM_OVERVIEW.cx, cy: CAM_OVERVIEW.cy, w: CAM_OVERVIEW.w, ys: place.ys, xs: place.xs };
  const cam = EVENTS[index].cam;
  return { cx: cam.cx, cy: cam.cy, w: place.desktop ? cam.w * 1.6 : cam.w, ys: place.ys, xs: place.xs };
}

function introCamera(W: number, H: number): Cam {
  const place = anchor(W, H, null);
  return { cx: CAM_INTRO.cx, cy: CAM_INTRO.cy, w: CAM_INTRO.w, ys: place.ys, xs: place.xs };
}

function PlayIcon() {
  return (
    <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true">
      <path d="M1 1l12 7-12 7z" fill="currentColor" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4 2h3v12H4zM9 2h3v12H9z" fill="currentColor" />
    </svg>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d={direction === "left" ? "M11 3L5 9l6 6" : "M7 3l6 6-6 6"} />
    </svg>
  );
}

function DirectionsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M16 2L2 8.2l6 1.8 1.8 6z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="2.5" y="3.5" width="13" height="12" rx="1" />
      <path d="M2.5 7.5h13M6 2v3M12 2v3" />
    </svg>
  );
}

function HangerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <path d="M8 4.5a1.5 1.5 0 1 1 1.5 1.5L8 7l6.2 4.4c.5.4.3 1.1-.3 1.1H2.1c-.6 0-.8-.7-.3-1.1L8 7" />
    </svg>
  );
}

function CornersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M3 7V3h4M15 7V3h-4M3 11v4h4M15 11v4h-4" />
    </svg>
  );
}
