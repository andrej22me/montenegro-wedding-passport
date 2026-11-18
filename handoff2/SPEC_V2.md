# Spec v2: RSVP redesign and polish

This adds to `handoff/SPEC.md`, and wins wherever the two disagree. The RSVP backend from the last round (open link, `/details/[token]`, Google Sheets, Resend) stays as built. This round changes how it looks and feels, and polishes the whole site.

New reference files in `handoff2/reference/`:
- `Rsvp.prototype.html`: the full mobile RSVP flow (all states, see the `start` prop).
- `RsvpDesktop.prototype.html`: the desktop split layout.

---

## 1. RSVP redesign (`/rsvp`)

Copy the markup, styles and copy from `Rsvp.prototype.html`. Summary:

**Choose (the reply card)**
- A centred card, max-width 400px.
  - Background `--paper-stamp`, a 1px ink border, 6px inner padding, then a second 1px border at 35% ink. This is the double rule of a stationery reply card.
  - Shadow `0 10px 30px ink/10%`.
- Contents, centred: "Kindly reply by 1 May 2027" (13px semibold, terracotta), "Nicole & Scott" (Newsreader 300, 46px, italic terracotta `&`), "5–9 August 2027 · Montenegro" (14px, `--ink-2`), a 40×1px terracotta rule, then "Will you join us?" (Newsreader 28).
- Buttons:
  - "Joyfully accept": filled ink, with a check icon.
  - "Regretfully decline": 1px ink outline.
  - Both full width and 56px tall.
- Decoration on the card's top-right corner:
  - A 70×90 postage stamp of Budva, rotated 5°.
  - A 78px terracotta postmark ("BUDVA · MONTENEGRO ·" with "RSVP" in the centre), rotated -16°, multiply blend, overlapping the stamp.
- Under the card: "Already replied? Your link is in your email." (13px, `--ink-2`).

**Accept: three steps.** Each step has the same top and bottom.
- **Top:** a Back button (chevron) on the left and "Step n of 3" on the right. Below them, a three-segment progress bar (3px, terracotta for done or current, ink at 15% for the rest). Then the step title in Newsreader 300, 40px.
- **Bottom:** a fixed bar (88px, paper, top hairline) holding the primary button. Disabled is 35% opacity with `disabled` set.

1. **Who's coming?**
   - "Your name" input.
   - Each extra guest is an input labelled "Guest n" with a 52px remove (×) button.
   - Below them, a dashed 52px "+ Add a guest" button. It hides at six guests.
   - Continue is enabled once the first name has 2 or more characters.
2. **Which events?**
   - One row per event: 50px stamp, title (Newsreader 21) and `when` (13px).
   - Below each row, one pill chip (44px, fully rounded) per guest, labelled with their first name.
   - Chip on: ink fill, paper text, check icon. Chip off: a dashed outline, `--ink-2` text, + icon.
   - All chips are on by default.
3. **Where can we reach you?**
   - Email (required) and "WhatsApp (optional)".
   - A `--paper-2` "Your reply" box listing each guest with "n of 6 events" or "Not attending", and an "Edit" link that goes back to step 2.
   - The button reads "Send reply".

**Decline:** one step, no progress bar. The title is "We'll miss you". Fields: your name, an optional note to Nicole and Scott, and email. The button reads "Send reply".

**Done:**
- A 128px postmark rotated -10°.
  - Accepted: "REPLY RECEIVED · SEE YOU THERE ·".
  - Declined: "WITH LOVE · NICOLE & SCOTT ·".
  - The centre shows today's date with the month in Roman numerals, for example "17 XI".
- The title is "Thank you, Anna and James." (Newsreader 300, 40px).
- **Accepted:**
  - A per-guest summary list.
  - A large ink link-card "Add travel details" with the subline "Flights, airport pickup, dietary needs" and an arrow. It goes to `/details/[token]`.
  - The line "We've emailed you this link too."
- **Declined:** "We'll miss you." in `--ink-2`.
- Both end with a "Back to the weekend" link.

**Desktop (from 1024px):** match `RsvpDesktop.prototype.html`. The left half is `5-citadela-budva.jpg`, full height under the header, with a bottom scrim. Over it, bottom-left: "The wedding · Saturday 7 August, 18:00 · Citadela, Budva" (15px) and "Nicole & Scott" (Newsreader 300, 84px). The right half holds the flow, centred at max-width 440px, with the button bar limited to the same width.

Keep the flow state in the URL (`?step=who|events|contact|decline`) so the browser back button works. Persist the draft in `sessionStorage` so a refresh doesn't lose it. Move focus to each step's title when the step changes.

`/details/[token]` uses the same layout pattern: the same top area with Back and progress, the same fixed button bar, and the same field styles.

---

## 2. Layout and spacing

Fix these globally. They're all visible in the current desktop build.

- **One container for everything:** `max-width: 1200px; padding-inline: 20px` on mobile, `48px` from 900px. The hero text, every section, the header contents and the footer contents all align to the same left edge. Right now the hero text, the content column and the footer each start at a different x position.
- **Spacing scale:** 4, 8, 12, 16, 20, 24, 32, 48, 64, 96, 128. Section gaps are 48–56px on mobile and 96px on desktop. Gaps inside a section are 16–24px.
- **Header:** 64px on desktop. The nav links have 32px gaps, the RSVP button sits flush with the container's right edge, and the current page link gets a 1px underline. Make it sticky with a paper background, and add the hairline only after scrolling.
- **Footer:** inside the container. Planner and email on the left, "Photo credits" and "© OpenStreetMap" links on the right. 64px vertical padding on desktop.

### Home on desktop (from 900px)

- **Hero:**
  - A two-column grid: text in columns 1–5, photo in 6–12, bleeding to the right edge of the window. Height `min(88vh, 820px)`.
  - The text block is vertically centred and starts at the container's left edge.
  - Fix the eyebrow overlapping the names: put the eyebrow in its own block with 20px below it.
  - Names: `clamp(72px, 8vw, 132px)`, line-height 0.92. Invite line: Newsreader 22px, max 30ch, 32px below the names.
  - Keep the postmark half over the photo's bottom-left corner (it's currently on the bottom-right edge, where it reads as clipped).
- **The weekend strip:**
  - A six-column grid with a 24px gap. Stamps use a 4:5 aspect ratio and fill their column.
  - Captions: 10px below the stamp, label 12px, title Newsreader 20.
- **Facts row:** one row of three columns: Wedding, Reply by, and the CTA button (max 360px wide, aligned right). The CTA currently stretches across the whole page; it shouldn't be wider than 360px anywhere on desktop.
- **Guide links:** three cards in a row instead of three full-width rows. Each card has a 1px ink top rule, Newsreader 26 title, an arrow, and 24px padding.

### Guide on desktop

- Two columns: a sticky 200px section nav on the left (Travel, Stay, What to wear, Questions, with the active one highlighted while scrolling) and 640px of content on the right.
- The stay cards keep their two-column layout with 280px images.

### Weekend on desktop

Follow `SPEC.md` section 8: a 400px panel docked on the left, and the camera anchored to the centre of the uncovered area.

---

## 3. Stamp component

The perforation has to land evenly on all four edges at any size. It currently drifts when a stamp is fluid width, because the 10px hole pitch doesn't divide the width.

- Build `<Stamp>` with an SVG mask generated from the measured size (ResizeObserver).
  - Pitch: the measured width and height each divided by `round(size / 10)`, so the holes always fit exactly.
  - Hole radius 3.2px, hole centres exactly on the edge.
- Paper border (padding):
  - 5px for stamps up to 60px.
  - 8px up to 160px.
  - 10px above that.
- The image inside uses `object-fit: cover` and a subtle inner frame line: `box-shadow: inset 0 0 0 1px rgba(22,40,43,.08)`.
- Put the shadow on a wrapper (`filter: drop-shadow(0 2px 6px rgba(22,40,43,.16))`), never on the masked element.

---

## 4. Speed

Targets on a mid-range phone over 4G: LCP under 2.0s, INP under 100ms, CLS 0, and route changes that feel instant.

- Statically generate every page (`export const dynamic = 'force-static'` where possible). Only the RSVP and details API routes are dynamic.
- Use `next/link` for every internal link (prefetch is on by default). Prefetch `/weekend` and `/rsvp` from the home page with `router.prefetch` once the page is idle.
- Images through `next/image`:
  - AVIF/WebP and correct `sizes`.
  - `priority` and `fetchPriority="high"` on the hero only.
  - Blur placeholders (`placeholder="blur"` with static imports).
  - Venue images at most 900px wide and the hero at most 1600px wide.
- Load both fonts with `next/font` (self-hosted, `display: swap`, subset `latin` + `latin-ext` for š/ć). Preload only the weights used above the fold.
- Map:
  - The land, water and road paths go in one static SVG file with `<symbol>`s (immutable cache, about 50KB gzipped) or are inlined in a server component. They're never in the client JS bundle.
  - Pins, labels and the camera are a small client component.
  - Animate with rAF on refs, never with React state per frame.
- No layout shift: every image and stamp reserves its aspect ratio, and the header height is fixed.
- Ship no animation library to pages that don't need it. Load GSAP only on `/weekend` if it's used at all; plain rAF is fine.
- Fix whatever the Next.js dev overlay is flagging (the red "1 Issue" badge in the current build) and keep the console free of hydration warnings.

---

## 5. Motion

Small, quick and purposeful. Everything respects `prefers-reduced-motion`: replace movement with a ≤150ms opacity change, or nothing.

| Where | What | Timing |
|---|---|---|
| Page changes | Cross-fade with the View Transitions API (for example the `next-view-transitions` package). The home strip's stamps morph into the map card's stamp (`view-transition-name: stamp-{slug}`) | 220ms, ease-out |
| Home hero, first load only | Names rise 12px and fade in. The invite line follows 80ms later. The postmark "stamps" down: scale 1.25 to 1, rotate -4° to -12°, opacity 0 to 1, slight overshoot | 600ms ease-out. Postmark starts at 450ms and runs 350ms |
| Stamps (strip, list, RSVP) | Hover: lift 3px and rotate -1°, shadow grows. Press: scale 0.98 | 180ms |
| Buttons and links | Hover: ink to `#24393D`. Press: translateY(1px). Focus-visible: 2px terracotta outline, 2px offset | 120ms |
| Arrow icons | Move 3px right on hover of their link | 160ms |
| RSVP step change | The outgoing step fades and moves 16px left; the incoming step fades in from 16px right. Reversed when going back. The progress bar segment fills from left to right | 220ms / 300ms |
| RSVP chips | Toggle: scale 0.94 to 1. The check icon draws in (stroke-dashoffset) | 140ms |
| Add or remove guest | Height and opacity collapse or expand | 180ms |
| RSVP done | The postmark stamps down (scale 1.4 to 1, rotate, opacity, overshoot). The title and summary follow 120ms later | 450ms |
| FAQ | Animate height with `grid-template-rows: 0fr` to `1fr`, and rotate the + into a − | 220ms |
| Images | Fade in from the blur placeholder once loaded | 300ms |
| Map | As in `SPEC.md` section 5 | — |

Never fade text in on scroll. Never animate anything on scroll position except the map, if it's ever used there.

---

## 6. Done when

- [ ] The RSVP matches `Rsvp.prototype.html` at 390px and `RsvpDesktop.prototype.html` at 1440px, across all states: choose, who, events, contact, decline, done (accepted and declined).
- [ ] The URL steps, browser back, draft persistence and focus handling work.
- [ ] Every page aligns to one container at 390, 768, 1024, 1440 and 1920px. Nothing stretches wider than intended.
- [ ] Stamps look correct at every size, with no half-holes at the edges.
- [ ] Lighthouse mobile: Performance 95 or more, Accessibility 100, CLS 0.
- [ ] Motion follows the table above, and reduced motion is respected.
- [ ] No dev-overlay issues and no console warnings.
