// Static facts about the two print lines, taken from the Magnetiq price sheets.
// Prices themselves live in the database (Package rows) so they stay editable
// from the admin panel; this file only holds the copy and imagery for each line.

export const PRINT_LINE_KEYS = ["PRESSED", "FLAT"] as const;
export type PrintLineKey = (typeof PRINT_LINE_KEYS)[number];

export interface PrintLine {
  key: PrintLineKey;
  anchor: string;
  name: string;
  shortName: string;
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
    name: "Pressed Prints",
    shortName: "Pressed",
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
      { src: "/media/pressed-and-flat.webp", alt: "Pressed square magnets next to flat rectangle prints on a fridge" },
    ],
    priceSheet: "/media/price-sheet-pressed.webp",
  },
  FLAT: {
    key: "FLAT",
    anchor: "flat",
    name: "Flat Prints",
    shortName: "Flat",
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
      { src: "/media/pressed-and-flat.webp", alt: "Flat rectangle prints mixed with pressed square magnets on a fridge" },
    ],
    priceSheet: "/media/price-sheet-flat.webp",
  },
};

export function getPrintLine(key: string | null | undefined): PrintLine | null {
  if (key === "PRESSED" || key === "FLAT") return PRINT_LINES[key];
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
