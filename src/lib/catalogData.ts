// The built-in catalog, from the Magnetiq price sheets. Used by the seed script
// and by catalogSync, which loads it into the database automatically once per
// CATALOG_VERSION. Prices stay editable in the admin panel afterwards.

/** Bump this whenever the data below changes so live databases pick it up. */
export const CATALOG_VERSION = 5;

/** The shop's WhatsApp number (digits only, with country code). */
export const DEFAULT_WHATSAPP = "201204191235";

// Pressed Magnets (5 layers), 5 x 5 cm rounded square.
const PRESSED_SINGLE = 50;
const PRESSED_BUNDLES: [pieces: number, price: number][] = [
  [1, PRESSED_SINGLE],
  [6, 270],
  [8, 340],
  [12, 480],
  [15, 570],
  [20, 720],
  [28, 960],
];

// Flat Magnets (2 layers), 7 x 10 cm. `save` is the amount printed under each price on the sheet.
const FLAT_BUNDLES: [pieces: number, price: number, save: number][] = [
  [1, 35, 0],
  [6, 200, 120],
  [8, 250, 180],
  [12, 300, 250],
  [15, 360, 320],
  [20, 400, 450],
  [28, 560, 600],
];

// 3D Stickers, 3 x 3 cm (any size on request).
const STICKER_BUNDLES: [pieces: number, price: number][] = [
  [1, 50],
  [3, 140],
  [5, 240],
  [10, 450],
  [15, 650],
  [20, 850],
  [50, 2250],
  [100, 3500],
];

// Magnetic Bookmarks: 45 EGP each.
const BOOKMARK_PRICE = 45;
const BOOKMARK_COUNTS = [1, 2, 3, 4, 5, 10];

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export interface CatalogPackage {
  slug: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  badge: string | null;
  composition: string;
  sampleImageUrl: string;
  photoSlots: number;
  line: string;
  active: boolean;
  sortOrder: number;
}

function pressed(): CatalogPackage[] {
  return PRESSED_BUNDLES.map(([pieces, price], i) => {
    const each = Math.round(price / pieces);
    const fullPrice = PRESSED_SINGLE * pieces;
    return {
      slug: `pressed-${pieces}`,
      name: plural(pieces, "Pressed Magnet"),
      description: `${plural(pieces, "pressed photo magnet")}, 5 x 5 cm, made of 5 pressed layers (lamination, photo, metal, plastic backing, magnet). ${each} EGP each.`,
      price,
      compareAtPrice: fullPrice > price ? fullPrice : null,
      badge: pieces === 12 ? "Most popular" : pieces === 28 ? "Best value" : null,
      composition: `${pieces} x Pressed magnet (5 x 5 cm) · ${each} EGP each`,
      sampleImageUrl: "/media/pressed-flatlay.webp",
      photoSlots: pieces,
      line: "PRESSED",
      active: true,
      sortOrder: i + 1,
    };
  });
}

function flat(): CatalogPackage[] {
  return FLAT_BUNDLES.map(([pieces, price, save], i) => ({
    slug: `flat-${pieces}`,
    name: plural(pieces, "Flat Magnet"),
    description: `${plural(pieces, "flat photo magnet")}, 7 x 10 cm polaroid-style, 2 layers (photo + magnet).${save ? ` Save ${save} EGP.` : ""}`,
    price,
    compareAtPrice: save ? price + save : null,
    badge: pieces === 12 ? "Most popular" : save ? `Save ${save} EGP` : null,
    composition: `${pieces} x Flat magnet (7 x 10 cm) · ${Math.round(price / pieces)} EGP each`,
    sampleImageUrl: "/media/flat-fridge-wall.webp",
    photoSlots: pieces,
    line: "FLAT",
    active: true,
    sortOrder: 100 + i + 1,
  }));
}

function stickers(): CatalogPackage[] {
  const single = STICKER_BUNDLES[0][1];
  return STICKER_BUNDLES.map(([pieces, price], i) => {
    const each = Math.round(price / pieces);
    const fullPrice = single * pieces;
    return {
      slug: `sticker-${pieces}`,
      name: plural(pieces, "3D Sticker"),
      description: `${plural(pieces, "3D photo sticker")}, 3 x 3 cm with a glossy domed finish. Other sizes available on request.`,
      price,
      compareAtPrice: fullPrice > price ? fullPrice : null,
      badge: pieces === 10 ? "Most popular" : pieces === 100 ? "Best value" : null,
      composition: `${pieces} x 3D sticker (3 x 3 cm) · ${each} EGP each`,
      sampleImageUrl: "/media/stickers-3d.webp",
      photoSlots: pieces,
      line: "STICKER",
      active: true,
      sortOrder: 200 + i + 1,
    };
  });
}

export function bookmarks(): CatalogPackage[] {
  return BOOKMARK_COUNTS.map((pieces, i) => ({
    slug: `bookmark-${pieces}`,
    name: plural(pieces, "Magnetic Bookmark"),
    description: `${plural(pieces, "magnetic bookmark")} printed with your photo or design. ${BOOKMARK_PRICE} EGP each.`,
    price: BOOKMARK_PRICE * pieces,
    compareAtPrice: null,
    badge: null,
    composition: `${pieces} x Magnetic bookmark · ${BOOKMARK_PRICE} EGP each`,
    sampleImageUrl: "/media/bookmark-daisies.webp",
    photoSlots: pieces,
    line: "BOOKMARK",
    active: true,
    sortOrder: 300 + i + 1,
  }));
}

export const CATALOG_PACKAGES: CatalogPackage[] = [...pressed(), ...flat(), ...stickers(), ...bookmarks()];

export const CATALOG_OFFERS = [
  {
    title: "Bundle & save: pressed magnets from 34 EGP each",
    description: "The more moments you print, the less each one costs. 28 pressed magnets for 960 EGP.",
    badgeText: "From 34 EGP",
  },
  {
    title: "Flat magnets: save up to 600 EGP",
    description: "28 polaroid-style flat photo magnets for just 560 EGP.",
    badgeText: "Save 600",
  },
  {
    title: "New: 3D photo stickers",
    description: "Glossy 3D domed stickers of your photos, from 50 EGP. 100 stickers for 3,500 EGP.",
    badgeText: "New",
  },
];

/** Offers from earlier versions of the site that should no longer show. */
export const RETIRED_OFFER_PATTERN = /free delivery|valentine|flat prints/i;
