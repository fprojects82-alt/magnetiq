export const PRODUCT_TYPES = ["MAGNET_SMALL", "MAGNET_LARGE", "EVENT_CARD"] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PRINTING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  MAGNET_SMALL: "Pressed Magnet",
  MAGNET_LARGE: "Flat Print",
  EVENT_CARD: "Event Card",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "New",
  CONFIRMED: "Confirmed",
  PRINTING: "Printing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

// "COD" is kept only so older orders still display; new orders are InstaPay only.
export const PAYMENT_METHODS = ["COD", "INSTAPAY"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  COD: "Cash on Delivery",
  INSTAPAY: "InstaPay",
};

export interface EventCardText {
  names?: string;
  eventDate?: string;
  message?: string;
  /** Customer chose to send (some of) their photos on WhatsApp after ordering. */
  photosLater?: boolean;
}

export interface CartItem {
  key: string;
  kind: "product" | "package";
  id: string;
  slug: string;
  name: string;
  size?: string;
  quantity: number;
  unitPrice: number;
  compareAtPrice?: number | null;
  imageUrl: string;
  uploadedImageUrls: string[];
  customText?: EventCardText;
}

/** What the customer sees for each status on their order page. */
export const CUSTOMER_STATUS_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "PENDING", label: "Order placed" },
  { status: "CONFIRMED", label: "Confirmed" },
  { status: "PRINTING", label: "Being printed" },
  { status: "SHIPPED", label: "Out for delivery" },
  { status: "DELIVERED", label: "Delivered" },
];
