// Static facts about the two print lines, taken from the Magnetiq price sheets.
// Prices themselves live in the database (Package rows) so they stay editable
// from the admin panel; this file only holds the copy and imagery for each line.

export const PRINT_LINE_KEYS = ["PRESSED", "FLAT", "STICKER"] as const;
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
  },
};

export function getPrintLine(key: string | null | undefined): PrintLine | null {
  if (key === "PRESSED" || key === "FLAT" || key === "STICKER") return PRINT_LINES[key];
  return null;
}

export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/magnetiq.eg",
  tiktok: "https://www.tiktok.com/@magnetiq.eg",
  handle: "@magnetiq.eg",
};

export function perPiece(price: number, pieces: number): number {
  return pieces > 0 ? Math.round(price / pieces) : price;
}

export function itemLabel(line: PrintLine, count: number): string {
  return `${count} ${line.itemName}${count === 1 ? "" : "s"}`;
}
