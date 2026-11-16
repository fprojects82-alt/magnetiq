import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Prices from the Magnetiq price sheets.
// Pressed Prints Bundles (5 layers) — 5 x 5 cm rounded square.
const PRESSED_BUNDLES: [pieces: number, price: number][] = [
  [6, 270],
  [8, 340],
  [12, 480],
  [15, 570],
  [20, 720],
  [28, 960],
];

// Rectangle Flat Prints Bundles (2 layers) — 7 x 10 cm. `save` is the amount
// printed under each price on the sheet.
const FLAT_BUNDLES: [pieces: number, price: number, save: number][] = [
  [6, 200, 120],
  [8, 250, 180],
  [12, 300, 250],
  [15, 360, 320],
  [20, 400, 450],
  [28, 560, 600],
];

const POPULAR = 12;

function pressedPackages() {
  const base = PRESSED_BUNDLES[0][1] / PRESSED_BUNDLES[0][0]; // 45 EGP each in the smallest bundle
  return PRESSED_BUNDLES.map(([pieces, price], i) => {
    const each = Math.round(price / pieces);
    const fullPrice = Math.round(base * pieces);
    return {
      slug: `pressed-${pieces}`,
      name: `${pieces} Pressed Photos`,
      description: `${pieces} pressed photo magnets, 5 x 5 cm rounded squares made of 5 pressed layers (lamination, photo, metal, plastic backing, magnet). Only ${each} EGP each.`,
      price,
      compareAtPrice: fullPrice > price ? fullPrice : null,
      badge: pieces === POPULAR ? "Most popular" : pieces === 28 ? "Best value" : null,
      composition: `${pieces} x Pressed magnets (5 x 5 cm) · ${each} EGP each`,
      sampleImageUrl: "/media/pressed-flatlay.webp",
      photoSlots: pieces,
      line: "PRESSED",
      active: true,
      sortOrder: i + 1,
    };
  });
}

function flatPackages() {
  return FLAT_BUNDLES.map(([pieces, price, save], i) => ({
    slug: `flat-${pieces}`,
    name: `${pieces} Flat Photos`,
    description: `${pieces} flat photo magnets, 7 x 10 cm polaroid-style rectangles in 2 layers (photo + magnet). Save ${save} EGP.`,
    price,
    compareAtPrice: price + save,
    badge: pieces === POPULAR ? "Most popular" : `Save ${save} EGP`,
    composition: `${pieces} x Flat prints (7 x 10 cm) · ${Math.round(price / pieces)} EGP each`,
    sampleImageUrl: "/media/flat-fridge-wall.webp",
    photoSlots: pieces,
    line: "FLAT",
    active: true,
    sortOrder: 100 + i + 1,
  }));
}

const EVENT_CARDS = [
  {
    slug: "engagement-card",
    name: "Engagement Card with Magnet",
    type: "EVENT_CARD",
    description:
      "A printed engagement card with your photo as a pressed magnet that guests take home. Add your names, date and a line of text.",
    price: 90,
    sampleImageUrl: "/media/engagement-cards.webp",
    sortOrder: 1,
  },
  {
    slug: "save-the-date-card",
    name: "Save the Date Card",
    type: "EVENT_CARD",
    description:
      "A printed Save the Date card with an embedded custom-photo magnet. Upload your photo and add your names and date.",
    price: 90,
    sampleImageUrl: "/samples/card-save-the-date.svg",
    sortOrder: 2,
  },
  {
    slug: "proposal-card",
    name: "Welcome to Our Proposal Card",
    type: "EVENT_CARD",
    description:
      "A welcome card for your proposal event, with an embedded custom-photo magnet of the special moment.",
    price: 95,
    sampleImageUrl: "/samples/card-proposal.svg",
    sortOrder: 3,
  },
  {
    slug: "wedding-invitation-card",
    name: "Wedding Invitation Card",
    type: "EVENT_CARD",
    description: "An elegant wedding invitation card with an embedded custom-photo magnet of the couple.",
    price: 100,
    sampleImageUrl: "/samples/card-wedding.svg",
    sortOrder: 4,
  },
];

async function main() {
  // Upsert by slug instead of wiping collections, so re-seeding never breaks
  // links from existing orders. Anything not in this file is hidden, not deleted.
  const packages = [...pressedPackages(), ...flatPackages()];
  for (const pkg of packages) {
    await prisma.package.upsert({ where: { slug: pkg.slug }, update: pkg, create: pkg });
  }
  await prisma.package.updateMany({
    where: { slug: { notIn: packages.map((p) => p.slug) } },
    data: { active: false },
  });

  for (const card of EVENT_CARDS) {
    const data = { ...card, compareAtPrice: null, active: true };
    await prisma.product.upsert({ where: { slug: card.slug }, update: data, create: data });
  }
  await prisma.product.updateMany({
    where: { slug: { notIn: EVENT_CARDS.map((c) => c.slug) } },
    data: { active: false },
  });

  await prisma.offer.deleteMany();
  await prisma.offer.createMany({
    data: [
      {
        title: "Bundle & save: pressed magnets from 34 EGP each",
        description: "The more moments you print, the less each one costs. 28 pressed photos for 960 EGP.",
        badgeText: "From 34 EGP",
        active: true,
      },
      {
        title: "Flat prints: save up to 600 EGP",
        description: "28 polaroid-style flat photo magnets for just 560 EGP.",
        badgeText: "Save 600",
        active: true,
      },
    ],
  });

  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      whatsappNumber: process.env.WHATSAPP_NUMBER || "201234567890",
      instapayNumber: process.env.INSTAPAY_NUMBER || "",
      deliveryFee: Number(process.env.DELIVERY_FEE || 50),
    },
  });

  // No credential defaults here on purpose: this file is committed, so a fallback
  // password would be a published admin login. Set both in .env instead.
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env before seeding. See .env.example."
    );
  }
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  console.log("Seed complete.");
  console.log(`Admin login -> ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
