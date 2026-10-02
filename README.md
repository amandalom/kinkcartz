# kinkcartz

Adults-only storefront for bondage gear, impact/sensation toys, pleasure
devices, and fetish clothing. Next.js 16 (App Router) + Prisma/Postgres +
Tailwind + Zustand.

## Category taxonomy

Four top-level categories, each with sub-categories (see `prisma/seed.ts`,
the single source of truth):

- **Bondage Gear** — Collars, Jewelry, Leash & Accessories, Cuffs, Furniture,
  Bondage Kits, Chastity Devices, Gags & Hoods, Body Restraints
- **Impact & Sensation Play** — Punishment Tools, Clips & Clamps, CBT,
  Electro Stimulation, Impact Toys, Medical/Clinical Toys, Nipple Devices,
  Sensory Play, Urethral Inserts, Sensual Candle Drips, Wands & Whips
- **Pleasure Devices** — Strap-Ons, Vibrating Toys, Metal Toys, Huge
  Insertables, Magic Wands, Masturbators, Glass Toys, Dildos, Cock Rings,
  Fucking Machines, Cock Cages, Anal Toys
- **Fetish Clothing** — Cosplay Clothing, Panties & Harness, Lingerie

Your original list repeated the full "Bondage Gear" sub-list a second time
nested under "Fetish Clothing." I treated that as a copy-paste artifact and
made Bondage Gear top-level only — if that's wrong, it's a one-line change
in `prisma/seed.ts`.

`Category` is self-referencing (`parentId`), so adding a third level (e.g.
sub-sub-categories) needs no schema change.

## Design & navigation

The storefront uses a dark/gold "atelier" visual theme (see `tailwind.config.ts`
— `gold`/`accent` tokens) with a mobile-style bottom tab bar instead of a
top nav:

- **Explore** (`/`) — landing page, masterwork highlights, pillar shortcuts.
- **Taxonomy** (`/taxonomy`) — the main browse screen: search, audience
  filter pills, and an accordion of the four top-level "Pillars," each
  showing a featured "Masterwork Highlight" product and its sub-category
  "Chambers" with live item counts. Logic lives in `lib/taxonomy-data.ts`.
- **The Vault** (`/vault`) — every product with `featured: true`.
- **Bag** — opens the cart drawer (not a page).
- **Sanctum** (`/account`) — placeholder; there's no real account system
  yet, so this is honest messaging, not a fake login.
- A discreet-mode toggle (eye-slash icon, top bar) instantly covers the
  screen with a neutral blank page — client-only state, resets on reload,
  not persisted anywhere (`lib/discreet-store.ts`).

`Product.audience` (`"all" | "sub" | "dom" | "couples"`) drives the "For
Subs / For Doms / Couples Sanctuary" filter pills on the Taxonomy page.
It's assigned per sub-category in `prisma/seed.ts` (`SUBCATEGORY_AUDIENCE`)
as a simplification — real kink roles are fluid — not a hard rule; relabel
individual products in the admin data if a specific item doesn't fit its
sub-category's default.

`/admin/*` intentionally does NOT use this theme or nav — it's a separate
internal tool with its own layout (`app/admin/(dashboard)/layout.tsx`) and
isn't linked from anywhere in the shopper-facing UI.

## Running it locally

Needs a Postgres database — a free [Neon](https://neon.tech) or
[Supabase](https://supabase.com) project both work. Put the connection
string in `.env` as `DATABASE_URL`.

```bash
npm install
npm run db:push   # creates the schema in your Postgres database
npm run db:seed   # loads the taxonomy + 280 sample products (8 per sub-category)
npm run dev        # http://localhost:3000
```

`npm run db:studio` opens Prisma Studio if you want a GUI to add products
by hand instead of editing `seed.ts`.

## Admin panel

`/admin/products` — add products, edit them, change prices inline, upload
photos, delete products. Gated by a password, not visible to shoppers and
excluded from the age-gate.

- Password is `ADMIN_PASSWORD` in `.env` (currently the placeholder
  `changeme-admin` — **change this** before this ever leaves your machine).
- Session is a signed, httpOnly cookie (`ADMIN_SESSION_SECRET` in `.env`),
  12-hour expiry, checked in `proxy.ts` for every `/admin` and `/api/admin`
  request.
- Photo uploads go through `lib/image-storage.ts`, which auto-detects where
  it's running: local `next dev`/a VPS writes straight to `public/uploads/`
  on disk (unchanged); on Netlify (detected via the `NETLIFY` env var it
  sets automatically) uploads go to **Netlify Blobs** instead, served back
  out through `app/api/blob-images/[key]/route.ts`, since serverless hosts
  have a read-only/ephemeral filesystem at request time. No config needed
  either way — it just works once deployed on Netlify.
- There's no login rate-limiting. Fine for a solo-admin dev setup; add it
  (or put the whole `/admin` path behind your host's own auth/IP allowlist)
  before running this anywhere public.
- Product variants (`ProductVariant` — sizes/colors) and category
  management aren't in the admin UI yet, only base product fields + photos.

## Deploying to Netlify

1. **Database.** Create a free [Neon](https://neon.tech) or
   [Supabase](https://supabase.com) Postgres project (same one you used
   locally works fine, or spin up a separate prod database). Copy its
   connection string.
2. **Connect the repo.** In Netlify: Add new site → Import an existing
   project → pick this GitHub repo. `netlify.toml` already points it at
   `@netlify/plugin-nextjs`, so build settings don't need manual setup.
3. **Environment variables** (Site configuration → Environment variables):
   - `DATABASE_URL` — the Postgres connection string from step 1
   - `ADMIN_PASSWORD` — a real password, not the `changeme-admin` placeholder
   - `ADMIN_SESSION_SECRET` — a random secret (`openssl rand -hex 32`, or
     reuse the one from your local `.env` — rotating it just signs
     everyone out)
   - `NODE_ENV=production` (Netlify usually sets this itself; confirm it's set)
4. **Enable Netlify Blobs** — it's on by default for all sites, nothing to
   turn on. Photo uploads through `/admin` will land there automatically
   once deployed (see the Admin panel section above).
5. **First deploy won't have data.** Either run `npm run db:push && npm run
   db:seed` locally against the *production* `DATABASE_URL` once, or do it
   from Netlify's own shell if you have one. The build itself does not seed
   data — `netlify.toml`'s build command only runs `prisma generate` + `next
   build`.
6. **Before this is real:** re-read "What I deliberately did NOT build, and
   why" below — payments, real age verification, and content-policy review
   with your processor and with Netlify's own Acceptable Use Policy are
   still unresolved, deploying doesn't change that.

## What's actually built

- Category → sub-category → product browsing, all from the database.
- Product pages with material/power-source/SKU attributes.
- A cart (Zustand + localStorage) and a checkout page that writes an
  `Order` + `OrderItem` row.
- An age-gate: every request is redirected to `/age-gate` until a cookie
  is set, enforced in `proxy.ts` (Next's server-side middleware/proxy), not
  just a client-side popup.
- Copy throughout (footer, product page, cart, checkout) references plain
  packaging and a discreet billing descriptor, since that's a baseline
  customer expectation in this category.

## What I deliberately did NOT build, and why

These aren't code problems — they're business decisions that need your
input (a payment provider agreement, a merchant account, possibly a
lawyer), so I left them as clearly-marked stubs rather than guessing:

### Payment processing
`app/api/checkout/route.ts` records the order but never charges a card.
Stripe, PayPal, and Square all prohibit sex toys / adult novelty items in
their terms of service — accounts get shut down, sometimes with funds
frozen. You'll need a **high-risk merchant account** through a processor
that explicitly accepts adult retail, e.g. CCBill, Segpay, Epoch, Vendo, or
a high-risk-friendly acquiring bank via Authorize.net/NMI. These usually
require a completed business application, a merchant descriptor review,
and take days to weeks to approve. Once you've picked one, the checkout
route is the place to add their SDK/redirect.

### Age verification
The current gate is a **self-attestation checkbox**, not identity
verification — legally the minimum bar, not full compliance. Several US
states now require actual age verification (government ID or
credit-card-based checks) for sites hosting sexually explicit material,
with more states passing similar laws regularly — Louisiana, Texas,
Utah, Virginia, and others have laws in this space as of 2026, and the
requirements/enforcement differ by state and are actively being litigated
(see *Free Speech Coalition v. Paxton*, decided by SCOTUS in 2025).
Whether your product photos/descriptions count as "sexually explicit
material" under a given state's statute, and which states you're legally
exposed to, is a question for a lawyer, not for this codebase. If you do
need real verification, providers like Veriff, Yoti, or AgeChecker.net
plug in at the same point the current cookie-check does.

### Payment processor's own content policy
Whichever processor you sign with will also have their own list of
prohibited items (e.g. some restrict "extreme" categories like CBT or
electro-stim even within an otherwise-approved adult account). Check
their acceptable-use policy against your full category list before
launch, not after your first chargeback review.

### Shipping/billing discretion
The UI states "discreet packaging" and "discreet billing descriptor" —
copy only. You still need to: pick a fulfillment process that actually
ships in unmarked boxes, and set the actual statement descriptor with
your payment processor (`billingDescriptor` on the `Order` model defaults
to `"KCZ* RETAIL"` as a placeholder — change it to whatever you register).

### Accounts, inventory, email, search, reviews, admin UI
None of this exists yet. There's no login, no stock tracking beyond a
`stock` field on `ProductVariant` that nothing enforces, no order
confirmation email, no search, no reviews. The `Order`/`OrderItem` models
are there so an admin/fulfillment view has something to query, but no such
view has been built. Say which of these matters next and I'll build it.

### Content moderation / legality by jurisdiction
Some items in your list (e.g. certain restraint or medical-play products)
are restricted or banned outright in some countries/states. If you intend
to ship internationally, you (or counsel) need to define a shipping
allow-list; nothing here currently blocks an order to a restricted region.
