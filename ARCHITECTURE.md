# The Bear Pantry — Architecture & Decisions

This documents how the site is built and why, so future changes (by Claude or
anyone else) start from the same context. Last updated 2026-08-17.

## Stack

Plain static HTML/CSS/JS. No build step, no framework, no npm/node dependency.
Every page is a hand-written `.html` file that shares one stylesheet and one
script file. This mirrors the existing `happydripiv` site in the same GitHub
account and was chosen because:

- The site is small and content-driven — a framework would add build
  complexity with no real benefit at this size.
- No local Node/npm toolchain was available in the dev environment, so
  "no build step" also meant "no toolchain to fight."
- Cloudflare Pages/Workers serves static files with zero config.

## Repo & deployment

- **GitHub:** `github.com/happydripllc/TheBearPantry`, branch `main`. Push to
  `main` triggers a Cloudflare deploy automatically.
- **Cloudflare:** deployed as a Worker with static assets (shows up under
  "Workers & Pages" in the dashboard as project `thebearpantry`). Account:
  `Azhealthllc@gmail.com`.
- **Domain:** `thebearpantry.com`, zone active on Cloudflare (nameservers
  `kelly.ns.cloudflare.com` / `miles.ns.cloudflare.com`).
  - Apex (`thebearpantry.com`) is added as the Worker's custom domain and
    works correctly.
  - `www.thebearpantry.com` could **not** be added as a second custom domain
    on the same Worker — the "Connect domain" dialog repeatedly failed with
    "No zones match," even though the zone is active in the same account.
    Root cause never fully identified. **Workaround in place:** a Redirect
    Rule on the zone (Rules → Redirect Rules, built from Cloudflare's
    "Redirect from WWW to root" template) 301s `https://www.*` →
    `https://${1}`, so `www` bounces to the working apex domain. If `www`
    ever breaks again, check that redirect rule is still deployed (not left
    as a draft) before re-debugging DNS.
  - Canonical URLs and Open Graph tags in the HTML `<head>` still reference
    `https://www.thebearpantry.com/...` — technically backwards from how the
    site actually resolves (apex is canonical, www redirects to it). Low
    priority to fix, but worth knowing if SEO tags are ever audited.
- **Local preview:** no Node, so previewing locally uses a plain Python
  `http.server`. `~/Desktop/Website:Coding/.claude/launch.json` has a
  `bear-pantry` config pointing at a scratchpad copy of the repo (serving
  directly from `~/Desktop/TheBearPantry` hit a macOS TCC/Desktop-folder
  permission error inside the sandboxed preview process, so the workaround is
  to `rsync` the repo into `/private/tmp/...scratchpad/preview-site` and serve
  that instead).

## File structure

```
index.html                Homepage
shop.html                 Full shop grid (filter/search/sort) + pantry list
about.html                "Meet the Bears" story page
cart.html                 localStorage cart
checkout.html             Order reservation form (no real payment)
faq.html / contact.html
shipping-pickup.html / food-safety.html / privacy-policy.html / terms.html
shop/*.html               One static detail page per fully-realized product
css/styles.css            Entire design system, single file
js/products.js            Product + pantry-list data (single source of truth)
js/script.js              Cart, nav, filters, modal, forms — all site behavior
images/                   All photography, logo art, product label art
```

There is no templating/includes system — the header, footer, and modal
markup are copy-pasted at the top/bottom of every HTML file. When changing
the header, footer, or nav, **grep across all files** (`grep -rl
"class=\"site-logo\"" *.html shop/*.html`) rather than editing one file and
assuming it propagates.

### Path conventions

- Root-level pages use relative paths with no leading slash (`css/styles.css`,
  `images/...`, `shop.html`).
- Pages under `shop/` use `../` prefixes for everything shared (`../css/...`,
  `../images/...`) and `body` carries `data-depth="1"` (currently unused by
  JS, kept as a marker in case path-dependent JS is needed later).
- `js/products.js`'s `productCardHTML(product, base)` takes a `base` param
  (`""` or `"../"`) so the same card-rendering function works whether it's
  called from a root page (shop grid, homepage featured grid) or from inside
  `shop/*.html` (related-products grid).

### Cache busting

`css/styles.css` is linked as `css/styles.css?v=N`. **Bump `N` in every HTML
file whenever styles.css changes** — this was missed early on and caused real
confusion (pushed CSS changes appeared to do nothing because Cloudflare/
browsers kept serving the cached file from `?v=1`). Current version: `v=4`.
Quick bump-all command:

```bash
grep -rl 'styles.css?v=OLD' --include="*.html" . | xargs sed -i '' 's/styles\.css?v=OLD/styles.css?v=NEW/'
```

## Design system

Colors, type, and components are pulled directly from the official logo and
jar-label art (all in `images/`), not invented independently. Palette (see
CSS custom properties in `styles.css` `:root`):

- Cream/parchment background (`--cream`, `--cream-deep`)
- Deep forest green for headings/nav/brand (`--forest`)
- Rust/red for CTAs and accents (`--rust`)
- Honey gold for secondary accents (`--honey`)
- Brown for supporting text tones (`--brown`)

Typography: **Fraunces** (display serif, headings/logo wordmark) + **Work
Sans** (body/UI), loaded from Google Fonts. Chosen deliberately over
Playfair/Lora to avoid the "generic vintage food brand" look the brief
explicitly warned against.

All components (buttons, badges, product cards, nav, footer, forms, cart,
FAQ accordion, modal) are defined once in `styles.css` and reused everywhere
— see the section comments in that file (`/* ---------- X ---------- */`) to
navigate it.

### Logo treatment

The original `TBPlogo.png` is a tall vertical lockup (illustration + baked-in
wordmark + tagline text). Used at full size it's the homepage/footer "brand
artwork," but it became illegible when shrunk into the header/favicon. Fix:
`images/TBPlogo-icon.png` is a cropped version (just the two-bears
illustration, no text, via Pillow) used at small sizes, paired with a real
HTML/CSS wordmark (`.logo-text`) instead of relying on baked-in raster text.
Header/footer markup pattern:

```html
<a class="site-logo">
  <img src="images/TBPlogo-icon.png" alt="" />
  <span class="logo-text"><strong>The Bear Pantry</strong><span>Est. 2026 · Texas</span></span>
</a>
```

### Hero image

Two separate flat marketing images are used as the homepage hero — not
component-built HTML — because the client supplied finished composite
artwork (headline + CTAs + imagery baked into one PNG) and asked for it used
as-is:

- **Desktop:** `images/HeroImage.png` (landscape, buttons side-by-side).
- **Mobile (≤760px):** `images/MobileHero.jpeg` (portrait crop, buttons
  stacked) — a separate asset, not a CSS reflow of the desktop one, because
  the client supplied a distinct mobile-optimized composite.

Both are shown/hidden via `.hero-desktop-only` / `.hero-mobile-only` at the
760px breakpoint. Since the "Shop the Pantry" / "Meet the Bears" buttons are
baked into the image pixels (not real DOM buttons), invisible `<a>` overlays
(`.hero-hotspot`) are positioned with percentage-based `left/top/width/height`
over each button so the whole thing stays responsive. **If either hero image
is ever replaced, the hotspot coordinates must be re-measured** (they were
found by cropping the source image with Pillow and eyeballing button
bounding boxes — see conversation history for the exact crop commands if
this needs to be repeated). A visually-hidden `<h1 class="sr-only">` carries
the real headline text for SEO/accessibility since it's otherwise only
present as pixels in the image.

## Product data model

`js/products.js` exports:

- **`PRODUCTS`** — array of product objects (slug, name, maker, category,
  price, size, badges, image, desc, comingSoon, detail). This is the single
  source of truth: the homepage featured grid, the shop grid, the quick-view
  modal, and the cart all read from it. Only **3 products are real,
  purchasable, and have dedicated detail pages** (matching actual jar label
  art the client supplied): Papa Bear's Smokey Jalapeño Salsa, Mama Bear's
  Bread & Butter Pickles, Papa Bear's Classic Green Beans. A handful of
  others (Blackberry Jam, Orange Marmalade, Cowboy Candy, The Welcome
  Basket gift box) are marked `comingSoon: true` and use loosely-matching
  lifestyle photography — no price shown for these, by design (see below).
- **`PANTRY_LIST`** — grouped plain-text list (no photos, no prices) of
  everything else the client actually makes, sourced from a real list she
  sent (jams, pickled/canned vegetables, pantry goods, seasonal specialties).
  Rendered on `shop.html` under "Also In The Pantry." This exists because
  there are ~25 real flavors with no dedicated photography or finalized
  pricing — rather than inventing fake product photos/prices for a real
  commercial food business, they're listed as plain text with a "contact us
  for current availability" note.

**Decision: never fabricate prices.** Every `comingSoon: true` product omits
`price` and the UI shows "Coming soon" instead of a dollar amount. This was a
deliberate call, not an oversight — inventing a specific price for a real
person's real product would be presenting false business information.

## Cart & checkout

Cart is `localStorage`-only (`bearPantryCart` key), no backend. Checkout
collects contact info + pickup/delivery preference and explicitly does
**not** collect payment — copy says the order is "reserved" and Mama Bear
will follow up to arrange payment (cash/Venmo/Cash App) at pickup. This was
intentional, not a missing feature:

1. Texas Cottage Food operations are small/direct-sale businesses; a
   hosted payment flow is disproportionate for the current scale.
2. Building real payment collection requires a payment processor, backend,
   and legal/compliance groundwork that hasn't happened yet.

If real payment processing is wanted later, the natural next step is a
Stripe Checkout redirect from `checkout.html` rather than building a custom
payment form.

## Content decisions worth knowing about

- **No fabricated testimonials.** The design system has testimonial-card
  CSS ready to use, but the homepage doesn't show any — the business is
  brand new (Est. 2026), so inventing customer quotes would be fake reviews
  presented as genuine. Add real ones once they exist.
- **Legal pages are drafts.** `privacy-policy.html` and `terms.html` are
  reasonable starting structures, explicitly labeled as needing attorney
  review before launch — not final legal copy.
- **Cottage food disclosure language** on `food-safety.html`/`terms.html` is
  written in good faith based on general knowledge of Texas Cottage Food Law
  but has **not** been verified against current DSHS requirements (exact
  required label wording, permitted sales channels, county thresholds).
  Flag this to the client before relying on it for compliance.
- **Papa Bear bio vs. product copy tension:** the About page bio says Papa
  Bear "had zero tolerance for spice," while the Smokey Jalapeño Salsa
  product page has a "Papa Bear Approved" note calling it his favorite/bold.
  Left as-is at the client's choice — flagged, not resolved, as of this
  writing.

## Known open items

- `www.thebearpantry.com` relies on the redirect-rule workaround above; the
  underlying "why won't Cloudflare connect www to the Worker" question was
  never resolved.
- Canonical/OG tags say `www` when apex is actually canonical — cosmetic SEO
  cleanup, not urgent.
- No real pricing/photography yet for anything in `PANTRY_LIST` — promote
  items to full `PRODUCTS` cards as that info arrives.
- No email backend wired up — the "Join the Family" signup forms and the
  contact form intercept `submit` client-side (`data-brand-form` in
  `script.js`) and just show a success message. Needs a real form backend
  (Cloudflare Pages Forms via a Worker function, or a service like
  Mailchimp/Formspree) before it actually captures anything.
