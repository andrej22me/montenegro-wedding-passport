# Handoff: Nicole & Scott wedding site (draft 2)

Put this folder in the repo root as `/handoff`, then paste `CURSOR_PROMPT.md` into Cursor.

| Path | What it is |
|---|---|
| `CURSOR_PROMPT.md` | The prompt to paste into Cursor |
| `SPEC.md` | Full build spec: design rules, every screen, map camera and animation, RSVP backend, desktop layout, open items, photo credits |
| `reference/*.prototype.html` | The four approved screens from the design canvas, with image paths pointing at `public/images` |
| `src/data/weddingData.ts` | All content: events, times, venues, coordinates, map cameras, labels, airports, attire, FAQ |
| `src/data/mapGeo.ts` | Map geometry: land, water lines, roads, route, plus `project(lon, lat)` |
| `src/styles/tokens.css` | Colours, fonts, radii, and the perforated `.stamp` frame |
| `public/images/` | Hero, six venue photos, two stay photos (cropped and compressed) |
| `scripts/build_map.py` | Regenerates `mapGeo.ts` from the OSM data in `scripts/` |

Live design canvas: https://claude.ai/artifact/ErS1n7Zfp3DL6b38wpDyKD
