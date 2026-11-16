# Magnetiq — Moments That Stick

E-commerce storefront for a custom photo-magnet business in Egypt. Customers upload their
own photo, pick a magnet size or an event card, and order with Cash on Delivery or InstaPay.

Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma and MongoDB.

## Features

**Storefront**
- Two print lines from the price sheets, each in bundles of 6 / 8 / 12 / 15 / 20 / 28 photos:
  - **Pressed Prints**: 5 x 5 cm rounded squares, 5 pressed layers (270–960 EGP)
  - **Flat Prints**: 7 x 10 cm polaroid-style, 2 layers (200–560 EGP)
- Event cards with a photo magnet (engagement, save-the-date, proposal, wedding)
- One-page bundle builder: pick a size, select all photos at once, order. Phone photos
  (incl. large / HEIC) are resized to JPEG in the browser before upload
- "I'll send my photos on WhatsApp" option for customers who'd rather not upload
- Cart with coupon codes, guest checkout, order confirmation with confetti
- Cash on Delivery or InstaPay, plus a pre-filled WhatsApp order handoff
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

Without `BLOB_READ_WRITE_TOKEN` set, uploaded photos are written to `public/uploads`,
so local development needs no cloud services beyond the database.

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
- Re-running the seed upserts by slug and hides (never deletes) anything not in it,
  so it is safe to run against a database with existing orders.
- Optional: set `NEXT_PUBLIC_SITE_URL` (e.g. `https://magnetiq.eg`) for correct social share previews.
- Change `ADMIN_PASSWORD` and `SESSION_SECRET` before going live.
