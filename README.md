# Magnetiq — Moments That Stick

E-commerce storefront for a custom photo-magnet business in Egypt. Customers upload their
own photo, pick a magnet size or an event card, and order with Cash on Delivery or InstaPay.

Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma and MongoDB.

## Features

**Storefront**
- English / Arabic (عربي) switch in the header: Arabic renders right-to-left with the Cairo font.
  All shop text lives in `src/lib/i18n.ts`; the admin panel stays English
- Step-by-step InstaPay payment: details → total → copy number & send money → upload screenshot → confirm
- Magnetic bookmark designer: shape, colour (wheel or code), quote, optional design image, live preview
- Four product lines from the price sheets, each sold singly or in bundles:
  - **Pressed Magnets**: 5 x 5 cm rounded squares, 5 pressed layers. 1 for 50 EGP;
    6 / 8 / 12 / 15 / 20 / 28 for 270–960 EGP
  - **Flat Magnets**: 7 x 10 cm polaroid-style, 2 layers. 1 for 35 EGP;
    6 / 8 / 12 / 15 / 20 / 28 for 200–560 EGP
  - **3D Stickers**: 3 x 3 cm domed stickers (any size on request).
    1 / 3 / 5 / 10 / 15 / 20 / 50 / 100 for 50–3,500 EGP
  - **Magnetic Bookmarks**: 45 EGP each (1 / 2 / 3 / 4 / 5 / 10)
- Event cards are a quote request form (`/event-cards`): occasion, number of cards,
  design/demo uploads, magnets yes/no with type and count. Requests appear in
  Admin → Card requests and the customer sends them to WhatsApp
- Each product line has its own order page: `/shop/pressed`, `/shop/flat`, `/shop/stickers`
- One-page bundle builder: pick a size, select all photos at once, order. Phone photos
  (incl. large / HEIC) are resized to JPEG in the browser before upload
- "I'll send my photos on WhatsApp" option for customers who'd rather not upload
- Cart with coupon codes, guest checkout, order confirmation with confetti
- InstaPay only: after ordering, the customer gets a unique order number, transfers the total and
  uploads the screenshot on the confirmation page (shown in Admin → Orders), plus a WhatsApp handoff
- Delivery priced by zone (QUIGO Express list, 55–155 EGP) chosen at checkout; edit in `src/lib/shipping.ts`
- Real product photos and the engagement-card video live in `public/media`

**Customer accounts**
- Sign up / log in, order history, and auto-filled checkout details

**Admin dashboard** (`/admin`)
- Orders with status tracking and the customer's uploaded photos
- Products, packages, offers, coupons and shop settings

## Running locally

```bash
npm install
cp .env.example .env     # then fill in DATABASE_URL and the rest
npx prisma db push       # create MongoDB indexes
npm run db:seed          # seed products, packages, offers and the admin user
npm run dev
```

Open http://localhost:3000. The admin panel is at `/admin/login` — there is no public
link to it, by design.

Without `BLOB_READ_WRITE_TOKEN` set, uploaded photos are stored in MongoDB and served from
`/api/uploads/<id>`, so uploads work with no extra setup. Connecting Vercel Blob is optional
(faster image delivery); when its token is present, new uploads go there instead.

## Deploying to Vercel

1. **Database** — create a free MongoDB Atlas cluster, add a database user, and allow
   network access from anywhere (`0.0.0.0/0`) so Vercel's servers can connect.
2. **Push** this repository to GitHub.
3. **Import** the repository at vercel.com/new.
4. **Environment variables** — add everything from `.env.example` in the project's
   Settings → Environment Variables.
5. **Blob storage** — in Storage, create (or connect) a Blob store to the project.
   Vercel then sets `BLOB_READ_WRITE_TOKEN` automatically and customer photos are
   stored there instead of on disk, which is required because Vercel's filesystem is
   read-only and reset on every request.
6. **Seed once** — with `DATABASE_URL` pointing at Atlas, run `npx prisma db push`
   and `npm run db:seed` locally to populate the production database.

## Notes

- Prices are in EGP and are editable from the admin panel (Packages). A package's
  "Print line" groups it with the other sizes of the same line on the order page.
- The built-in catalog (`src/lib/catalogData.ts`) loads itself into the database on the
  first request after deploy. Bump `CATALOG_VERSION` there to push new prices to a live site
  (this overwrites admin price edits for those bundles once).
- Re-running the seed upserts by slug and hides (never deletes) anything not in it,
  so it is safe to run against a database with existing orders.
- Admin login: set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in Vercel and redeploy; the first login at
  `/admin/login` creates the account.
- Optional: set `NEXT_PUBLIC_SITE_URL` (e.g. `https://magnetiq.eg`) for correct social share previews.
- Change `ADMIN_PASSWORD` and `SESSION_SECRET` before going live.
