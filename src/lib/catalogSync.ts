import { db } from "./db";
import {
  CATALOG_OFFERS,
  CATALOG_PACKAGES,
  CATALOG_VERSION,
  DEFAULT_WHATSAPP,
  RETIRED_OFFER_PATTERN,
} from "./catalogData";

let synced = false;
let inflight: Promise<void> | null = null;

/**
 * Applies built-in data updates to the live database the first time a new
 * CATALOG_VERSION is deployed, so nobody has to run `npm run db:seed`.
 * Each step runs once; after that this is a single settings read per server
 * instance, and admin edits are left alone.
 */
export async function ensureCatalog(): Promise<void> {
  if (synced) return;
  inflight ??= run()
    .catch((err) => {
      console.error("Catalog sync failed", err);
    })
    .finally(() => {
      inflight = null;
    });
  await inflight;
}

async function loadCatalog() {
  for (const pkg of CATALOG_PACKAGES) {
    await db.package.upsert({ where: { slug: pkg.slug }, update: pkg, create: pkg });
  }
  await db.package.updateMany({
    where: { slug: { notIn: CATALOG_PACKAGES.map((p) => p.slug) } },
    data: { active: false },
  });
  // Event cards are a request form (/event-cards); old single products are replaced by bundles.
  await db.product.updateMany({ where: { active: true }, data: { active: false } });

  const offers = await db.offer.findMany();
  const retired = offers.filter((o) => RETIRED_OFFER_PATTERN.test(`${o.title} ${o.description}`));
  if (retired.length) {
    await db.offer.deleteMany({ where: { id: { in: retired.map((o) => o.id) } } });
  }
  const titles = new Set(offers.map((o) => o.title));
  for (const offer of CATALOG_OFFERS) {
    if (!titles.has(offer.title)) await db.offer.create({ data: { ...offer, active: true } });
  }
}

async function run() {
  const settings = await db.settings.findUnique({ where: { id: "singleton" } });
  const current = settings?.catalogVersion ?? 0;
  if (current >= CATALOG_VERSION) {
    synced = true;
    return;
  }

  // v3: magnets / stickers catalog, retire old offers and products.
  if (current < 3) await loadCatalog();

  // v4: the shop's WhatsApp number.
  const whatsapp = current < 4 ? DEFAULT_WHATSAPP : settings?.whatsappNumber ?? DEFAULT_WHATSAPP;

  await db.settings.upsert({
    where: { id: "singleton" },
    update: { catalogVersion: CATALOG_VERSION, whatsappNumber: whatsapp },
    create: {
      id: "singleton",
      whatsappNumber: whatsapp,
      instapayNumber: process.env.INSTAPAY_NUMBER || "",
      deliveryFee: Number(process.env.DELIVERY_FEE || 50),
      catalogVersion: CATALOG_VERSION,
    },
  });
  synced = true;
}
