import { db } from "./db";
import { CATALOG_OFFERS, CATALOG_PACKAGES, CATALOG_VERSION, RETIRED_OFFER_PATTERN } from "./catalogData";

let synced = false;
let inflight: Promise<void> | null = null;

/**
 * Loads the built-in catalog into the database the first time a new
 * CATALOG_VERSION is deployed, so a live site never shows empty bundle lists
 * just because nobody ran `npm run db:seed`. After that it is a no-op (one
 * settings read per server instance), and admin edits are never overwritten
 * until the version is bumped again.
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

async function run() {
  const settings = await db.settings.findUnique({ where: { id: "singleton" } });
  if ((settings?.catalogVersion ?? 0) >= CATALOG_VERSION) {
    synced = true;
    return;
  }

  for (const pkg of CATALOG_PACKAGES) {
    await db.package.upsert({ where: { slug: pkg.slug }, update: pkg, create: pkg });
  }
  await db.package.updateMany({
    where: { slug: { notIn: CATALOG_PACKAGES.map((p) => p.slug) } },
    data: { active: false },
  });

  // Event cards are now a request form (/event-cards), not cart products,
  // and the old single small/large magnets are replaced by the bundles.
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

  await db.settings.upsert({
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
  synced = true;
}
