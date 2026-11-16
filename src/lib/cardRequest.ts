export const CARD_TYPES = [
  "Engagement",
  "Wedding invitation",
  "Save the date",
  "Proposal",
  "Katb Ketab",
  "Birthday",
  "Baby / Sebou'",
  "Other",
] as const;

export const MAGNET_OPTIONS = [
  { value: "PRESSED", label: "Pressed magnet 5 × 5 cm" },
  { value: "FLAT", label: "Flat magnet 7 × 10 cm" },
  { value: "STICKER", label: "3D sticker 3 × 3 cm" },
] as const;

export const CARD_REQUEST_STATUSES = ["NEW", "CONTACTED", "CONFIRMED", "DONE", "CANCELLED"] as const;
