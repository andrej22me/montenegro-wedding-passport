We're rebuilding this wedding website from an approved design. The handoff is in `/handoff`. Read `handoff/SPEC.md` in full before writing code, then open the four `handoff/reference/*.prototype.html` files. Those are the approved screens and the visual source of truth.

The prototypes use a design-tool runtime (`<x-dc>`, `{{holes}}`, `<sc-if>`, `<sc-for>`, `class Component extends DCLogic`). Copy their markup, inline styles, copy text and logic, but rewrite them as normal React components. Don't port the runtime.

Context:
- Next.js 15 App Router, React 19, Tailwind 4 and GSAP are already set up. Keep that stack.
- The current page, `ScrollyMapSection`, the passport RSVP form and the AI-generated images in `public/images` are being replaced. Delete them once the new screens work.
- Content lives only in `src/data/weddingData.ts`. Map geometry lives in `src/data/mapGeo.ts`. Design tokens are in `src/styles/tokens.css`. Don't hardcode copy or colours in components.

Do it in this order. Stop after each phase and give me a short summary of what changed and anything you weren't sure about.

1. **Setup.**
   - Copy `handoff/public/images/*` into `public/images/`, `handoff/src/data/*` into `src/data/` (replace the old files), `handoff/src/styles/tokens.css` into `src/styles/`, and `handoff/scripts/build_map.py` into `scripts/`.
   - Load Newsreader (opsz and italic) and Schibsted Grotesk with `next/font/google`, mapped to `--font-display` and `--font-ui`.
   - Import the tokens in `globals.css`.
   - Build the shared Header, Footer and Stamp components.

2. **Home (`/`), Guide (`/guide`) and the static parts of RSVP (`/rsvp`)**, matching the prototypes at 390px. Mobile first. Then add the desktop layout from SPEC section 8.

3. **The Weekend map (`/weekend`).** Follow SPEC section 5 exactly:
   - The layer order.
   - The camera model, where `viewBox` is derived from `{cx, cy, w, ys}`.
   - Fly animation with log-space zoom and a mid-flight zoom-out, using rAF or GSAP on refs (no React state updates per frame).
   - HTML pins and labels positioned with `translate3d`.
   - The overview sheet and the stop sheet, swipe, autoplay, the list view, `?stop=n` deep links, keyboard support scoped to the map, reduced motion, and the OSM attribution.
   - Test on a real phone size (390×844) and on iOS Safari.

4. **RSVP backend** (SPEC 7.2): a Google Sheets service account, `/api/rsvp/lookup` and `/api/rsvp/submit`, with rate limiting. Guests only see events they're invited to, and resubmitting replaces their earlier answers. Put credentials in `.env.local` and add a `.env.example`. Mock the sheet with a local JSON file until I give you real credentials.

5. **`/api/ics/[slug]`** (SPEC 7.3), a `/credits` page (SPEC 9), and a pass through the "Done when" checklist in SPEC 12.

Rules:
- Design rules from SPEC section 1:
  - Don't add explanatory text, taglines, extra sections, script fonts, gold, gradients or scroll-triggered fade-ins.
  - Accessible elements, 44px minimum touch targets, and 4.5:1 text contrast.
- Strings in [square brackets] are open placeholders. Leave them visible and don't invent answers. The open items are listed in SPEC section 11.
- Ask me before adding dependencies beyond `googleapis` (RSVP) and a small `.ics` helper, if you need one.
