export type Cam = { cx: number; cy: number; w: number; ys: number; xs: number };

export const HEADER_H = 60;
export const OVERVIEW_SHEET = 236;
export const STOP_SHEET = 384;
export const DESKTOP_PANEL = 400;
export const DESKTOP_MIN = 900;

export function anchor(W: number, H: number, index: number | null) {
  const desktop = W >= DESKTOP_MIN;
  if (desktop) {
    return { desktop, xs: DESKTOP_PANEL + (W - DESKTOP_PANEL) / 2, ys: HEADER_H + (H - HEADER_H) / 2 };
  }
  const sheet = index == null ? OVERVIEW_SHEET : STOP_SHEET;
  return { desktop, xs: W / 2, ys: HEADER_H + (H - HEADER_H - sheet) / 2 };
}

export function frame(cam: Cam, W: number, H: number) {
  const h = (cam.w * H) / W;
  const x0 = cam.cx - (cam.xs / W) * cam.w;
  const y0 = cam.cy - (cam.ys / H) * h;
  return { x0, y0, w: cam.w, h, k: cam.w / W };
}

export function ease(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

export function flyFrame(from: Cam, to: Cam, t: number) {
  const e = ease(t);
  const dist = Math.hypot(to.cx - from.cx, to.cy - from.cy);
  const bump = Math.min(0.9, dist / Math.max(from.w, to.w));
  const w = Math.exp(Math.log(from.w) + (Math.log(to.w) - Math.log(from.w)) * e) * (1 + bump * Math.sin(Math.PI * t));
  return {
    cx: from.cx + (to.cx - from.cx) * e,
    cy: from.cy + (to.cy - from.cy) * e,
    ys: from.ys + (to.ys - from.ys) * e,
    xs: from.xs + (to.xs - from.xs) * e,
    w,
  };
}
