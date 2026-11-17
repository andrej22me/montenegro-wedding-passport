import { MAP_SIZE, project } from "./mapGeo";

export type Mode = "land" | "sea";
export type Pt = { x: number; y: number };

export const TOWNS = [
  { name: "Herceg Novi", lon: 18.531, lat: 42.453 },
  { name: "Perast", lon: 18.702, lat: 42.488 },
  { name: "Kotor", lon: 18.771, lat: 42.425 },
  { name: "Tivat", lon: 18.704, lat: 42.436 },
  { name: "Budva", lon: 18.85, lat: 42.289 },
  { name: "Lovćen", lon: 18.82, lat: 42.4 },
] as const;

export const WATER_LABELS = [
  { name: "Bay of Kotor", lon: 18.655, lat: 42.452, script: true },
  { name: "Adriatic Sea", lon: 18.575, lat: 42.31, script: false },
] as const;

/** Ordered waypoints. `mode` is the travel type arriving at that point. */
export const ROUTE: { lon: number; lat: number; stop?: number; mode?: Mode }[] = [
  { lon: 18.7924, lat: 42.3931, stop: 1 },
  { lon: 18.785, lat: 42.405, mode: "land" },
  { lon: 18.771, lat: 42.4247, mode: "land" },
  { lon: 18.768, lat: 42.44, mode: "land" },
  { lon: 18.76, lat: 42.456, mode: "land" },
  { lon: 18.744, lat: 42.472, mode: "land" },
  { lon: 18.72, lat: 42.482, mode: "land" },
  { lon: 18.7, lat: 42.486, mode: "land" },
  { lon: 18.6895, lat: 42.4864, stop: 2, mode: "land" },
  { lon: 18.672, lat: 42.474, mode: "sea" },
  { lon: 18.645, lat: 42.456, mode: "sea" },
  { lon: 18.61, lat: 42.442, mode: "sea" },
  { lon: 18.575, lat: 42.426, mode: "sea" },
  { lon: 18.548, lat: 42.41, mode: "sea" },
  { lon: 18.545, lat: 42.397, mode: "sea" },
  { lon: 18.56, lat: 42.394, mode: "sea" },
  { lon: 18.578, lat: 42.3973, stop: 3, mode: "sea" },
  { lon: 18.555, lat: 42.4, mode: "sea" },
  { lon: 18.538, lat: 42.412, mode: "sea" },
  { lon: 18.532, lat: 42.428, mode: "sea" },
  { lon: 18.536, lat: 42.442, mode: "sea" },
  { lon: 18.548, lat: 42.452, mode: "sea" },
  { lon: 18.5598, lat: 42.4555, stop: 4, mode: "sea" },
  { lon: 18.59, lat: 42.448, mode: "land" },
  { lon: 18.64, lat: 42.438, mode: "land" },
  { lon: 18.69, lat: 42.43, mode: "land" },
  { lon: 18.73, lat: 42.415, mode: "land" },
  { lon: 18.755, lat: 42.39, mode: "land" },
  { lon: 18.765, lat: 42.36, mode: "land" },
  { lon: 18.78, lat: 42.33, mode: "land" },
  { lon: 18.805, lat: 42.3, mode: "land" },
  { lon: 18.8378, lat: 42.2777, stop: 5, mode: "land" },
  { lon: 18.81, lat: 42.305, mode: "land" },
  { lon: 18.77, lat: 42.345, mode: "land" },
  { lon: 18.735, lat: 42.375, mode: "land" },
  { lon: 18.71, lat: 42.405, mode: "land" },
  { lon: 18.698, lat: 42.422, mode: "land" },
  { lon: 18.694, lat: 42.435, stop: 6, mode: "land" },
];

export function curveThrough(points: Pt[]): string {
  if (points.length < 2) return "";
  const d = [`M${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    d.push(
      `C${(p1.x + (p2.x - p0.x) / 6).toFixed(1)} ${(p1.y + (p2.y - p0.y) / 6).toFixed(1)} ${(p2.x - (p3.x - p1.x) / 6).toFixed(1)} ${(p2.y - (p3.y - p1.y) / 6).toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`,
    );
  }
  return d.join(" ");
}

const projected = ROUTE.map((p) => ({ ...p, ...project(p.lon, p.lat) }));

export const ROUTE_PATH = curveThrough(projected);

const stopIndexes = projected.map((p, i) => (p.stop ? i : -1)).filter((i) => i >= 0);

export const LEGS = stopIndexes.slice(0, -1).map((start, i) => {
  const end = stopIndexes[i + 1];
  const slice = projected.slice(start, end + 1);
  return {
    from: projected[start].stop!,
    to: projected[end].stop!,
    mode: (projected[end].mode ?? "land") as Mode,
    d: curveThrough(slice),
  };
});

export function cameraFor(lon: number, lat: number, zoom: number) {
  const p = project(lon, lat);
  const w = MAP_SIZE.width / zoom;
  const h = MAP_SIZE.height / zoom;
  return {
    x: Math.max(0, Math.min(MAP_SIZE.width - w, p.x - w / 2)),
    y: Math.max(0, Math.min(MAP_SIZE.height - h, p.y - h / 2)),
    w,
    h,
  };
}

export const FULL_CAMERA = { x: 0, y: 0, w: MAP_SIZE.width, h: MAP_SIZE.height };
