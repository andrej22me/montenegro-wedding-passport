# Nicole & Scott wedding site: build spec

Approved design: draft 2 of the Claude design canvas (four mobile screens). This spec turns it into the production site in the `montenegro-wedding-passport` repo.

The `reference/*.prototype.html` files are the approved screens. Treat them as the visual source of truth for spacing, sizes and copy. They use a prototype runtime (`<x-dc>`, `{{holes}}`, `<sc-if>`, `<sc-for>`, a `DCLogic` class), so read them for markup, styles and logic. Don't copy that runtime.

---

## 1. Design rules

- **Mobile first.** Most guests open the link from WhatsApp on a phone. Design at 390px wide first, then adapt for desktop (section 8).
- **No explanatory text.** If the UI needs a sentence to explain itself, change the UI. No intro paragraphs, no "tap here" hints, no taglines.
- **Two typefaces only:** Newsreader (display and serif body) and Schibsted Grotesk (UI, labels, numbers). Don't use script fonts, gold, watercolour, frosted glass cards or gradient backgrounds. The one exception is the dark scrim at the bottom of the hero photo, which keeps the names readable.
- **Colour:** paper, ink and one terracotta accent. All tokens are in `src/styles/tokens.css`.
- **Recurring motifs:**
  - Perforated stamp frames on venue photos.
  - Circular terracotta postmarks.
  - Numbered pins.
  - The map drawn as an engraved sea chart: offset coastlines in the water, thin tan roads.
- **Motion** happens only on the map. Text never fades in on scroll.
- **Accessibility:**
  - Real `<button>`, `<a>` and `<label>` elements.
  - Touch targets of at least 44px.
  - Text contrast of at least 4.5:1.
  - `aria-label` on icon-only buttons.
  - `aria-pressed` on toggles and `aria-expanded` on FAQ items.

## 2. Stack

Keep what the repo already has: Next.js 15 (App Router), React 19, Tailwind 4 and GSAP.

1. Replace the current page and components (`ScrollyMapSection`, the passport form and the AI images in `public/images`) with the design below.
2. Load the fonts with `next/font/google` and map them to `--font-display` and `--font-ui`.
3. Put the tokens from `src/styles/tokens.css` into `globals.css`, or import them there.
4. Keep `src/data/weddingData.ts` as the only place that holds content.

## 3. Routes

| Route | Screen | Prototype |
|---|---|---|
| `/` | Home | `Main.prototype.html` |
| `/weekend` | Full-screen map with stops, plus a list view | `Weekend.prototype.html` |
| `/guide` | Travel, stay, what to wear, questions (anchors `#travel #stay #wear #questions`) | `Guide.prototype.html` |
| `/rsvp` | Open reply: accept, decline, thank-you | `Rsvp.prototype.html` |
| `/details/[token]` | Travel details for one accepted reply | none |
| `/api/ics/[slug]` | Calendar file for one event | none |
| `/api/rsvp` | Open RSVP submit (section 7) | none |
| `/api/details/[token]` | Read and save travel details | none |

**Shared header:** 60px tall with the `N&S` monogram on the left (links home) and an ink `RSVP` button on the right. On the home screen it sits over the hero photo with paper-coloured text and a paper-coloured button. On `/weekend` the Map/List switch sits in the centre of the header.

**Shared footer:** ink background with "Planned by Adriatic Events" and Silvana's email as a `mailto:` link. The map screen has no footer.

## 4. Home (`/`)

1. **Hero:** 620px tall (on desktop, `min(88vh, 760px)`).
   - Full-bleed `hero/perast.jpg`.
   - Scrim: `linear-gradient(180deg, ink/35% 0, transparent 18%, transparent 48%, ink/82% 100%)`.
   - Bottom-left, in paper colour: "Montenegro · 5–9 August 2027" (14px, weight 500), then "Nicole / & Scott" (Newsreader 300, 74px, line-height 0.92). The `&` is italic in `--accent-light`.
2. **Postmark:** 104px, rotated -12°, overlapping the bottom-right edge of the hero. The ring reads "BOKA KOTORSKA · BUDVA ·", with an italic "N&S" and "VIII 2027" in the middle. Paper-filled disc, terracotta strokes.
3. **Invite line:** Newsreader 21px, max-width 300px.
4. **"The weekend" strip:**
   - The heading sits on the left. An "Open map" link with an arrow sits on the right.
   - Below it is a horizontal scroll-snap row of six 130×160 stamps. Under each stamp: "01 · Thu" (12px semibold, terracotta) and the event title (Newsreader 18px).
   - Hide the scrollbar. Each stamp links to `/weekend?stop=n`, which opens the map on that stop.
5. **Facts:** two columns. "Wedding": Sat 7 Aug, 18:00, Citadela, Budva. "Reply by": 1 May 2027.
6. **Primary CTA:** "Reply to the invitation", 56px tall, ink background.
7. **Links:** Travel and stay, What to wear, Questions. Rows at least 60px tall, Newsreader 22px, with an arrow.
8. **Footer.**

## 5. Weekend map (`/weekend`)

This is the centrepiece. It's a full-viewport SVG map (`100dvh`) with a fixed header and a bottom sheet over it.

### 5.1 Layers (back to front)

1. **Sea:** a `--sea` rectangle covering everything. The prototype also draws two paper rectangles for land to the north and east of the data extent, for the far-out intro view.
2. **Water lines:** `WATER_LINES[2]`, then `[1]`, then `[0]`, ink at 0.07, 0.12 and 0.18 opacity, 1px, `vector-effect: non-scaling-stroke`.
3. **Land:** `LAND_PATH`, paper fill, ink 1.1px non-scaling stroke.
4. **Roads:** `ROADS_PATH`, `--road`, 1.2px non-scaling.
5. **Route:** the five `ROUTE` segments.
   - Ink at 45% opacity, dotted. Stroke width `2k`, dash `1k 6k`, round caps, where `k` is map units per screen pixel (5.2).
   - The segment arriving at the selected stop turns solid terracotta.
6. **Labels:** HTML elements absolutely positioned over the SVG, so they stay a constant size. There are three styles:
   - `town`: 12px, weight 500, with a paper text-shadow halo.
   - `water`: italic Newsreader 16px.
   - `area`: italic Newsreader 14px.
   - `TIV` is a boxed airport code.
   - Hide a label when the visible map width is larger than its `max` value, or when it is off screen.
7. **Pins:** HTML buttons, 44px hit area around a 24px ink dot with a white ring and the stop number.
   - **Selected:** terracotta and scaled to 1.3, with a pulsing ring (keyframes 1.8s) and an ink tag on the right showing the venue name.
   - **Other pins while a stop is open:** 50% opacity.

Small credit in a bottom corner of the map, just above the sheet: "© OpenStreetMap contributors" (required by the ODbL licence).

### 5.2 Camera model

The camera is `{ cx, cy, w, ys }`:

- `cx, cy`: the focus point in map units.
- `w`: the visible width in map units.
- `ys`: the screen y where the focus point sits.

For a viewport `W × H` px:

```
h  = w * H / W
x0 = cx - w / 2
y0 = cy - (ys / H) * h
svg viewBox = `${x0} ${y0} ${w} ${h}`
k  = w / W                    // map units per screen px
screen(x, y) = ((x - x0) / k, (y - y0) / k)   // pins and labels
```

`ys` keeps the focus point in the middle of the map area that the header and sheet leave visible:

```
ys = header + (H - header - sheetHeight) / 2
```

The prototype uses a 60px header, a 236px overview sheet and a 384px stop sheet.

**Cameras:**
- Intro: `CAM_INTRO`.
- Overview: `CAM_OVERVIEW`.
- Each stop: `EVENTS[i].cam`.

These values were tuned for 390×844. On other phones keep `w` and recompute `ys`. On desktop see section 8.

### 5.3 Fly animation

Fly from the current camera to the target:

- **Duration:** 1700ms for taps, 2000ms in autoplay, 2200ms for the intro.
- **Easing:** in-out cubic, `e = t < .5 ? 4t³ : 1 - (-2t + 2)³ / 2`.
- **Centre and `ys`:** linear in `e`.
- **Width:** interpolate in log space, then zoom out mid-flight in proportion to the distance travelled:
  ```
  bump = min(0.9, dist(c0, c1) / max(w0, w1))
  w(t) = exp(lerp(ln w0, ln w1, e)) * (1 + bump * sin(πt))
  ```

**Performance:**
- Render the paths once.
- On each animation frame, update only the `viewBox` attribute and the pin and label transforms, through refs (or a GSAP tween on a plain object). Don't re-render React state 60 times a second.
- Position pins and labels with `translate3d`.
- Cancel any running flight before starting a new one.

**Reduced motion** (`prefers-reduced-motion`): jump straight to the target, or fade between views over 200ms.

### 5.4 States and interactions

- **On load:**
  - Start at `CAM_INTRO` and fly to the overview after 350ms.
  - If the URL has `?stop=n`, fly straight to that stop instead.
  - Keep `?stop=n` in sync as the guest moves between stops (use `replaceState`), so links can be shared.
- **Overview sheet** (236px, top corners 14px, `--shadow-sheet`):
  - "The weekend" (Newsreader 300, 34px) with "5–9 Aug 2027" on the right.
  - A row of six 50px mini stamps with number badges. Tapping one flies to that stop.
  - "Start the journey": a full-width ink button with a play icon that starts autoplay at stop 1.
- **Stop sheet** (384px):
  - A 360×190 stamp photo with the postmark (96px, -14°, multiply blend) overlapping its top-right corner.
  - Below the photo: the `when` label (13px semibold terracotta), the title (Newsreader 30), "venue · place", and the dress code with a hanger icon.
  - **Bottom row:**
    - Previous and next buttons with six progress dots between them (the active dot is an 18px terracotta pill).
    - Then, pushed right: Directions (`mapsUrl` in a new tab, disabled when null), Add to calendar (`/api/ics/[slug]`) and Play/Pause.
  - A round 44px "Show all stops" button floats 56px above the sheet on the right and flies back to the overview.
- **Stepping between stops:**
  - Swiping the sheet left or right (horizontal pointer distance over 50px), the arrows, or tapping a pin all fly to that stop.
  - Previous on stop 1 and next on stop 6 go back to the overview.
- **Autoplay:**
  - After arriving at a stop, wait 3200ms, then fly to the next one.
  - After stop 6, return to the overview and stop.
  - Any manual input stops autoplay.
  - The Play/Pause button toggles it.
- **List view** (header switch):
  - Covers the map with a paper panel, grouped by day: the day name in Newsreader 26 with the date on the right.
  - Each row has a 60px stamp, the time, the title and "venue · dress".
  - Tapping a row switches back to Map and flies to that stop.
  - At the end: "Monday 9 August · Departures".
- **Keyboard:** left and right arrow keys move between stops while the map has focus, and Escape returns to the overview. Scope these key handlers to the map element.

## 6. Guide (`/guide`)

All headings are Newsreader 300. Don't add intro paragraphs.

1. **Getting there** (48px):
   - Airport table: code (22px semibold), name, time to Budva (right-aligned, tabular figures). TIV gets a small terracotta "Closest" badge, and DBV gets the note "Croatia, border crossing".
   - Below the table, an ink bar with a bus icon and the `TRANSFERS` line.
2. **Where to stay** (40px): two photo cards (200px images) with the nights in terracotta and the town in Newsreader 26. Then the `STAY_NOTE` line.
3. **What to wear** (40px): a definition list with the event on the left and the dress code on the right in Newsreader 18. Then a five-swatch palette (56px tall) with names.
4. **Questions** (40px): an accordion. Items are Newsreader 20 rows at least 58px tall with +/− signs, and the first item is open by default.
5. **Footer.**

## 7. RSVP

The reply is an open link. There is no guest list, no lookup, and no invite code. All six events, including the rehearsal dinner, are shown to everyone.

### 7.1 `/rsvp`

One state at a time, in the visual style of `Rsvp.prototype.html`. No helper text beyond labels.

1. **Choose:** title "Will you join us?", "Reply by 1 May 2027", then two buttons, "Joyfully accept" and "Regretfully decline".
2. **Accept:**
   - "Your name" (required).
   - "Add a guest" adds a name input with a remove (×) button, up to 5 extra guests.
   - "Which events?": one row per event (50px stamp, title, `when`). Under each row, one toggle chip per entered name, on by default. Chips update as names are added or removed.
   - Email (required), WhatsApp number, then "Send reply".
3. **Decline:** "Your name", "A note to Nicole and Scott", email, "Send reply".
4. **Done:**
   - Accepted: "Thank you, {names}." A per-guest line such as "5 of 6 events" or "Not attending". Button "Add travel details now" to `/details/[token]`. Line: "We've also emailed you this link."
   - Declined: "Thank you, we'll miss you."

### 7.2 `/details/[token]`

An accepted submit creates a random URL-safe token of at least 16 characters. The same email submitted again updates that row and keeps the token. An unknown token is a 404.

- Heading: "Details for {names}".
- Dietary needs, one field per guest.
- Arrival and departure: airport (TIV, TGD, DBV), date, time, flight number.
- Airport pickup Yes/No, hotel, and "Anything else".
- Saved answers are prefilled. Editable until 15 July 2027 (`COUPLE.detailsBy`), then read-only.
- "Save", then a Saved state with a link back to `/weekend`.

### 7.3 Data and email

Google Sheets when `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` and `RSVP_SHEET_ID` are set. Otherwise `data/rsvp-mock.json`.

- **Sheet `Responses`:** `token`, `created_at`, `updated_at`, `lead_name`, `email`, `whatsapp`, `attending` (yes/no), `guests` (names separated by `|`), one column per event slug listing the guest names attending it, `note`.
- **Sheet `Details`:** `token`, `guest`, `dietary`, `arrival_airport`, `arrival_date`, `arrival_time`, `arrival_flight`, `departure_airport`, `departure_date`, `departure_time`, `departure_flight`, `pickup`, `hotel`, `notes`, `updated_at`.

**`POST /api/rsvp`** validates, upserts by email, and returns the token.

**`GET` and `POST /api/details/[token]`** read and save that party's details.

Spam protection: a hidden honeypot, 5 submits per minute per IP, and a length cap on every field.

After an accepted submit, send a confirmation with Resend (`RESEND_API_KEY`, `RESEND_FROM`) containing the summary and the details link. A decline gets a short thank-you. If the key is missing, log the email to the console.

`scripts/export-details-links.ts` prints `lead_name, email, https://<domain>/details/<token>` for every accepted reply that has no Details rows yet.

### 7.4 `.ics`

`GET /api/ics/[slug]` returns a `text/calendar` event:
- Start: `startISO`. Use a TZID of Europe/Podgorica.
- Default length: 3 hours. The boat day runs until lunch.
- Title: "Nicole & Scott · {title}".
- Location: "{venue}, {place}".

## 8. Desktop (from 900px)

- **Header:** a full navigation row (Weekend, Travel, Stay, Attire, FAQ, RSVP), as asked for in the planner's brief.
- **Home:**
  - The hero becomes two columns, with the photo on the right taking 55% and the names and invite on paper on the left.
  - The stamp strip becomes a six-column grid.
- **Weekend:**
  - The map fills the window, and the sheet becomes a 400px panel docked on the left with the same content.
  - Put the camera anchor in the centre of the uncovered area: an `xs` equal to the panel width plus half the remaining width, and `ys` equal to the header plus half the remaining height. Generalise `x0 = cx - (xs / W) * w`.
  - Raise each stop's `w` by about 1.6× so the venue isn't over-zoomed.
- **Guide and RSVP:** a centred 640px column.

## 9. Photos and credits

All images are in `public/images`, cropped and compressed (most under 200KB). Before launch:

| File | Source | Status |
|---|---|---|
| `hero/perast.jpg` | Wikimedia Commons, "Perasto - Montenegro.JPG" | Licence to confirm, add credit |
| `venues/1-forza-kuk.jpg` | Wikimedia Commons, "View of the Kotor Bay from the road from Lovcen.jpg" by Netzach | CC BY-SA 4.0, add credit. It's the view; swap in a Forza Kuk terrace photo if the venue supplies one |
| `venues/2-boat-day.jpg` | Wikimedia Commons, "Bay of Kotor Panorama.jpg" | Licence to confirm. Ideally replace with the actual catamaran |
| `venues/3-ribarsko-selo.jpg` | ribarskoselo.com | Venue's own photo, needs their OK |
| `venues/4-castel-savina.jpg` | castelsavina.me | Venue's own photo, needs their OK |
| `venues/5-citadela-budva.jpg` | Wikimedia Commons, "Budva Old Town and Citadel.jpg" | Licence to confirm |
| `venues/6-aura-beach.jpg` | portomontenegro.com | Venue's own photo, needs their OK |
| `stay/perast.jpg` | Wikimedia Commons, "Church of Our Lady of the Rocks, Perast.jpg" by Jocelyn Erskine-Kellie | CC BY-SA 4.0, add credit |
| `stay/budva.jpg` | Wikimedia Commons, "View over the Old Town of Budva from the Citadel.jpg" | Licence to confirm |

Put a small "Photo credits" line in the footer that links to a `/credits` page listing these. Use `next/image` with explicit sizes.

## 10. Map data

- `src/data/mapGeo.ts` is generated by `scripts/build_map.py`. To regenerate:
  ```
  python scripts/build_map.py scripts/coastline_raw.json <earth-lands-250m geojson> scripts/roads_raw.json out.json
  ```
  `coastline_raw.json` and `roads_raw.json` are the Overpass exports already in the repo. The coarse land comes from the npm package `@geo-maps/earth-lands-250m`.
- Map units: 1000 units span longitude 18.48 to 18.92. Use `project(lon, lat)` for any new point.
- The land path is about 50KB. Inline it in a server component, or import it as a static SVG `<symbol>`, so it isn't re-parsed on every render.

## 11. Open items (placeholders in the data)

1. **Dates:** the repo's old data said October 2026 with events Friday to Monday. The client's latest inspo video says 5–9 August 2027, Thursday to Sunday. The build uses the video. Confirm with Adriatic Events.
2. **Venues:** the rehearsal dinner venue is assumed to be Castel Savina, and the farewell is assumed to be AURA Beach at Porto Montenegro, Tivat.
3. **Boat day:** the departure pier is unknown, so `mapsUrl` is null.
4. **Hotels:** the nights for each town (Perast Thursday and Friday, Budva Saturday and Sunday) are assumed. Hotel names will come later.
5. **FAQ:** the plus-ones and children answers.
6. **Photos:** the permissions and credits in section 9.

## 12. Done when

- [ ] All four screens match the prototypes at 390px, with no extra copy.
- [ ] The map's intro zoom, stop flights, swipe, pins, arrows, autoplay, list view and `?stop=` deep links work on iOS Safari and Android Chrome at 60fps.
- [ ] Reduced motion is respected. Lighthouse accessibility scores 95 or more.
- [ ] An open RSVP upserts by email. Accepted replies email a details link. Details stay editable until 15 July 2027.
- [ ] `.ics` files open correctly in Apple and Google Calendar.
- [ ] The desktop layout follows section 8.
- [ ] The OSM attribution and photo credits are visible.
