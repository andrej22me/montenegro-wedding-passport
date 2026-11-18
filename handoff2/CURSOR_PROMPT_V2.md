New design round. Unzip `handoff2` into the repo root next to `/handoff`. Read `handoff2/SPEC_V2.md` in full; it adds to `handoff/SPEC.md` and wins wherever they disagree. Then open `handoff2/reference/Rsvp.prototype.html` and `handoff2/reference/RsvpDesktop.prototype.html`.

As before, the prototypes use a design-tool runtime (`<x-dc>`, `{{holes}}`, `<sc-if>`, `<sc-for>`, `DCLogic`). Copy their markup, styles, copy and logic into normal React components. Don't port the runtime. `Rsvp.prototype.html` holds every RSVP state in one file; its `start` prop picks the state (choose, who, events, contact, done, decline, declined).

Keep the RSVP backend you built (open link, upsert by email, `/details/[token]`, Google Sheets mock, Resend). This round changes the front end and polishes the site.

Work in this order. Stop after each phase and show me screenshots at 390px and 1440px.

1. **RSVP redesign** (SPEC_V2 section 1): the reply-card choose screen, the three accept steps with Back, progress, and a fixed button bar, the decline step, and the done screen with postmark. Add the desktop split layout, steps in the URL, sessionStorage draft, and focus management. Restyle `/details/[token]` with the same pattern.

2. **Layout and spacing** (SPEC_V2 section 2):
   - One shared container so the hero, sections, header and footer align to the same left edge.
   - Fix the hero eyebrow overlapping the names.
   - Desktop home: two-column hero, six-column stamp strip, facts row with the CTA capped at 360px, three guide-link cards.
   - Guide desktop with a sticky section nav.
   - Sticky header.

3. **Stamp component** (SPEC_V2 section 3): an SVG mask measured with ResizeObserver so the perforation always lands evenly on every edge, with the border sizes from the spec. Replace every stamp on the site with it.

4. **Speed** (SPEC_V2 section 4): static generation, `next/link` everywhere plus idle prefetch of `/weekend` and `/rsvp`, `next/image` with sizes and blur placeholders, `next/font` with latin-ext, map paths out of the client bundle, no layout shift. Fix whatever the dev overlay "1 Issue" badge reports.

5. **Motion** (SPEC_V2 section 5): page cross-fades and the stamp-to-map morph with View Transitions, the hero entrance and postmark stamp, hover and press states, RSVP step and chip animations, the FAQ height animation, and image fade-ins. Everything respects `prefers-reduced-motion`.

6. Go through the checklist in SPEC_V2 section 6 and report anything that doesn't pass.

Rules:
- Don't add copy, sections, script fonts, gold, gradients (apart from the photo scrims) or scroll-triggered text fade-ins.
- Keep [bracketed] placeholders visible.
- Ask before adding any dependency other than `next-view-transitions`.
