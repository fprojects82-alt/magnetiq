import { formatEGP } from "./currency";
import { PAYMENT_METHOD_LABELS, PaymentMethod } from "./types";

interface OrderLikeItem {
  name: string;
  size?: string | null;
  quantity: number;
  unitPrice: number;
  photoCount?: number;
  photosLater?: boolean;
}

interface OrderLike {
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  items: OrderLikeItem[];
}

export function buildWhatsAppOrderLink(order: OrderLike, whatsappNumber: string): string {
  const lines = [
    `New order *${order.orderNumber}* — Magnetiq`,
    "",
    ...order.items.map(
      (item) =>
        `• ${item.name}${item.size ? ` (${item.size})` : ""} x${item.quantity} — ${formatEGP(item.unitPrice * item.quantity)}` +
        (item.photosLater ? `\n   📸 ${item.photoCount ?? 0} photos uploaded, sending the rest here` : "")
    ),
    "",
    `Subtotal: ${formatEGP(order.subtotal)}`,
    order.discount > 0 ? `Discount: -${formatEGP(order.discount)}` : null,
    `Delivery: ${formatEGP(order.deliveryFee)}`,
    `Total: ${formatEGP(order.total)}`,
    "",
    `Name: ${order.customerName}`,
    `Phone: ${order.phone}`,
    `Address: ${order.address}, ${order.city}`,
    "",
    `Payment: ${PAYMENT_METHOD_LABELS[order.paymentMethod as PaymentMethod] ?? order.paymentMethod}`,
    order.paymentMethod === "INSTAPAY" ? `📲 InstaPay screenshot for order ${order.orderNumber} attached` : null,
  ].filter((line): line is string => line !== null);

  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${whatsappNumber}?text=${text}`;
}
