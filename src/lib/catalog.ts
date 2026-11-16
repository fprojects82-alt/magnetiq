// Static facts about the product lines, taken from the Magnetiq price sheets.
// Prices themselves live in the database (Package rows) so they stay editable
// from the admin panel; this file only holds the copy and imagery for each line.

export const PRINT_LINE_KEYS = ["PRESSED", "FLAT", "STICKER", "BOOKMARK"] as const;
export type PrintLineKey = (typeof PRINT_LINE_KEYS)[number];

export interface PrintLine {
  key: PrintLineKey;
  anchor: string;
  name: string;
  shortName: string;
  /** One piece, e.g. "Pressed Magnet"; plural adds "s". */
  itemName: string;
  /** Extra line shown under the size, e.g. "Available in any size". */
  note?: string;
  tagline: string;
  size: string;
  sizeAr: string;
  layers: string;
  layersDetail: string;
  layersAr: string;
  /** CSS aspect-ratio of one printed piece, used for upload previews. */
  aspect: string;
  cover: string;
  gallery: { src: string; alt: string }[];
  priceSheet: string;
  /** Arabic versions of the customer-facing text. */
  ar: { name: string; itemName: string; tagline: string; note?: string; size: string; layers: string; layersDetail: string };
}

export const PRINT_LINES: Record<PrintLineKey, PrintLine> = {
  PRESSED: {
    key: "PRESSED",
    anchor: "pressed",
    name: "Pressed Magnets",
    shortName: "Pressed",
    itemName: "Pressed Magnet",
    tagline: "Thick, glossy and built to last: our signature magnet.",
    size: "5 × 5 cm rounded square",
    sizeAr: "٥ × ٥ سم مربع بحواف دائرية",
    layers: "5 pressed layers",
    layersDetail: "Lamination · Photo · Metal · Plastic backing · Magnet",
    layersAr: "٥ طبقات مضغوطة (طبقة حماية – صورة – معدن – بلاستيك – مغناطيس)",
    aspect: "1 / 1",
    cover: "/media/pressed-flatlay.webp",
    gallery: [
      { src: "/media/pressed-flatlay.webp", alt: "Twelve pressed photo magnets laid out around a Magnetiq logo magnet" },
      { src: "/media/pressed-couples.webp", alt: "Pressed photo magnets of couples and kids lined up on a cutting mat" },
      { src: "/media/pressed-and-flat.webp", alt: "Pressed square magnets next to flat rectangle magnets on a fridge" },
    ],
    priceSheet: "/media/price-sheet-pressed.webp",
    ar: {
      name: "مغناطيس مضغوط",
      itemName: "مغناطيس مضغوط",
      tagline: "تقيل ولامع ومتين: المغناطيس المميز بتاعنا.",
      size: "٥ × ٥ سم مربع بحواف دائرية",
      layers: "٥ طبقات مضغوطة",
      layersDetail: "طبقة حماية · صورة · معدن · بلاستيك · مغناطيس",
    },
  },
  FLAT: {
    key: "FLAT",
    anchor: "flat",
    name: "Flat Magnets",
    shortName: "Flat",
    itemName: "Flat Magnet",
    tagline: "Polaroid-style photo magnets: cover the whole fridge.",
    size: "7 × 10 cm rectangle",
    sizeAr: "٧ × ١٠ سم",
    layers: "2 layers",
    layersDetail: "Photo · Magnet",
    layersAr: "طبقتين فقط (صورة – مغناطيس)",
    aspect: "7 / 10",
    cover: "/media/flat-fridge-wall.webp",
    gallery: [
      { src: "/media/flat-fridge-wall.webp", alt: "A fridge door covered with around thirty flat photo magnets" },
      { src: "/media/flat-fridge.webp", alt: "Flat white-bordered photo magnets of family moments on a fridge" },
      { src: "/media/pressed-and-flat.webp", alt: "Flat rectangle magnets mixed with pressed square magnets on a fridge" },
    ],
    priceSheet: "/media/price-sheet-flat.webp",
    ar: {
      name: "مغناطيس مسطح",
      itemName: "مغناطيس مسطح",
      tagline: "مغناطيس بستايل البولارويد: غطّي التلاجة كلها.",
      size: "٧ × ١٠ سم مستطيل",
      layers: "طبقتين",
      layersDetail: "صورة · مغناطيس",
    },
  },
  STICKER: {
    key: "STICKER",
    anchor: "stickers",
    name: "3D Stickers",
    shortName: "3D",
    itemName: "3D Sticker",
    tagline: "Your favourite photos, now as glossy 3D domed stickers. Stick them anywhere.",
    note: "Available in any size! Message us on WhatsApp for a custom size.",
    size: "3 × 3 cm",
    sizeAr: "٣ × ٣ سم",
    layers: "3D domed finish",
    layersDetail: "Glossy raised dome over your photo · Sticky back",
    layersAr: "صورك المفضلة .. دلوقتي على شكل ستيكرز",
    aspect: "1 / 1",
    cover: "/media/stickers-3d.webp",
    gallery: [
      { src: "/media/stickers-3d.webp", alt: "Dozens of glossy 3D photo stickers scattered on a red polka-dot background" },
      { src: "/media/stickers-3d-closeup.webp", alt: "Close-up of 3D domed photo stickers showing the glossy raised finish" },
      { src: "/media/price-sheet-stickers.webp", alt: "Magnetiq custom photo stickers price list" },
    ],
    priceSheet: "/media/price-sheet-stickers.webp",
    ar: {
      name: "ستيكرز 3D",
      itemName: "ستيكر 3D",
      tagline: "صورك المفضلة، دلوقتي على شكل ستيكرز 3D لامعة. الزقها في أي مكان.",
      note: "متاح بأي مقاس! كلمنا على واتساب لو عايز مقاس مخصوص.",
      size: "٣ × ٣ سم",
      layers: "لمسة 3D بارزة",
      layersDetail: "طبقة لامعة بارزة فوق صورتك · ضهر لاصق",
    },
  },
  BOOKMARK: {
    key: "BOOKMARK",
    anchor: "bookmarks",
    name: "Magnetic Bookmarks",
    shortName: "Bookmark",
    itemName: "Magnetic Bookmark",
    tagline: "Folded magnetic bookmarks that clip onto the page and never fall out.",
    note: "Send your photo, a quote or any design you love.",
    size: "Folded magnetic bookmark",
    sizeAr: "فاصل كتاب مغناطيسي",
    layers: "Magnetic fold-over",
    layersDetail: "Printed both sides · Magnets inside · Clips over the page",
    layersAr: "فاصل كتاب مغناطيسي بتصميمك",
    aspect: "2 / 3",
    cover: "/media/bookmark-daisies.webp",
    gallery: [
      { src: "/media/bookmark-daisies.webp", alt: "Four colourful magnetic bookmarks clipped along the edge of a book page" },
      { src: "/media/bookmark-quran.webp", alt: "A blue ornamental magnetic bookmark clipped onto a page of the Quran" },
    ],
    priceSheet: "/media/bookmark-daisies.webp",
    ar: {
      name: "فواصل كتب مغناطيسية",
      itemName: "فاصل كتاب مغناطيسي",
      tagline: "فواصل كتب مغناطيسية بتتقفل على الصفحة ومبتقعش أبداً.",
      note: "ابعت صورتك، أو اقتباس، أو أي تصميم بتحبه.",
      size: "فاصل كتاب مغناطيسي",
      layers: "مغناطيس بيتطبق",
      layersDetail: "مطبوع من الناحيتين · مغناطيس جوه · بيتقفل على الصفحة",
    },
  },
};

export function getPrintLineByAnchor(anchor: string): PrintLine | null {
  return Object.values(PRINT_LINES).find((l) => l.anchor === anchor) ?? null;
}

export function shopHref(line: PrintLine, size?: number): string {
  return size ? `/shop/${line.anchor}?size=${size}` : `/shop/${line.anchor}`;
}

export function getPrintLine(key: string | null | undefined): PrintLine | null {
  if (key && (PRINT_LINE_KEYS as readonly string[]).includes(key)) return PRINT_LINES[key as PrintLineKey];
  return null;
}

export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/magnetiq.eg",
  tiktok: "https://www.tiktok.com/@magnetiq.eg",
  facebook: "https://www.facebook.com/share/1E6DmXxdKa/",
  handle: "@magnetiq.eg",
};

export function perPiece(price: number, pieces: number): number {
  return pieces > 0 ? Math.round(price / pieces) : price;
}

export function itemLabel(line: PrintLine, count: number, lang: "en" | "ar" = "en"): string {
  if (lang === "ar") return count === 1 ? line.ar.itemName : `${line.ar.itemName} × ${count}`;
  return `${count} ${line.itemName}${count === 1 ? "" : "s"}`;
}

/** The line's customer-facing text in the chosen language. */
export function lineText(line: PrintLine, lang: "en" | "ar") {
  if (lang === "ar") return { ...line.ar, note: line.ar.note };
  return {
    name: line.name,
    itemName: line.itemName,
    tagline: line.tagline,
    note: line.note,
    size: line.size,
    layers: line.layers,
    layersDetail: line.layersDetail,
  };
}

const SLUG_PREFIX_TO_LINE: Record<string, PrintLineKey> = {
  pressed: "PRESSED",
  flat: "FLAT",
  sticker: "STICKER",
  bookmark: "BOOKMARK",
};

/** Display name for a bundle slug like "pressed-12" in the chosen language. */
export function bundleLabel(slug: string, fallback: string, lang: "en" | "ar"): string {
  const m = /^([a-z]+)-(\d+)$/.exec(slug);
  const key = m ? SLUG_PREFIX_TO_LINE[m[1]] : undefined;
  if (!m || !key) return fallback;
  return itemLabel(PRINT_LINES[key], Number(m[2]), lang);
}

/** The product line a bundle slug belongs to ("pressed-12" -> Pressed Magnets). */
export function lineForSlug(slug: string): PrintLine | null {
  const m = /^([a-z]+)-\d+$/.exec(slug);
  const key = m ? SLUG_PREFIX_TO_LINE[m[1]] : undefined;
  return key ? PRINT_LINES[key] : null;
}
