import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  CATALOG_OFFERS,
  CATALOG_PACKAGES,
  CATALOG_VERSION,
  RETIRED_OFFER_PATTERN,
} from "../src/lib/catalogData";

const prisma = new PrismaClient();

// The site also loads this catalog by itself on first request (src/lib/catalogSync.ts).
// Running the seed is still useful for a fresh database and to create the admin user.

async function main() {
  // Upsert by slug instead of wiping collections, so re-seeding never breaks
  // links from existing orders. Anything not in the catalog is hidden, not deleted.
  for (const pkg of CATALOG_PACKAGES) {
    await prisma.package.upsert({ where: { slug: pkg.slug }, update: pkg, create: pkg });
  }
  await prisma.package.updateMany({
    where: { slug: { notIn: CATALOG_PACKAGES.map((p) => p.slug) } },
    data: { active: false },
  });
  // Event cards are handled by the request form at /event-cards.
  await prisma.product.updateMany({ data: { active: false } });

  const offers = await prisma.offer.findMany();
  const retired = offers.filter((o) => RETIRED_OFFER_PATTERN.test(`${o.title} ${o.description}`));
  await prisma.offer.deleteMany({ where: { id: { in: retired.map((o) => o.id) } } });
  const titles = new Set(offers.map((o) => o.title));
  for (const offer of CATALOG_OFFERS) {
    if (!titles.has(offer.title)) await prisma.offer.create({ data: { ...offer, active: true } });
  }

  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: { catalogVersion: CATALOG_VERSION },
    create: {
      id: "singleton",
      whatsappNumber: process.env.WHATSAPP_NUMBER || "201234567890",
      instapayNumber: process.env.INSTAPAY_NUMBER || "",
      deliveryFee: Number(process.env.DELIVERY_FEE || 50),
      catalogVersion: CATALOG_VERSION,
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
