import { randomInt } from "crypto";
import { db } from "./db";

// No 0/O/1/I so numbers read cleanly over the phone or WhatsApp.
const ORDER_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/**
 * Random, non-sequential order numbers. The old `MQ-${1000 + count}` scheme
 * collided after any order was deleted, and let anyone read other customers'
 * confirmation pages (name, phone, address) by counting up.
 */
export async function generateOrderNumber(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    let code = "";
    for (let i = 0; i < 7; i++) code += ORDER_ALPHABET[randomInt(ORDER_ALPHABET.length)];
    const orderNumber = `MQ-${code}`;
    const exists = await db.order.findUnique({ where: { orderNumber }, select: { id: true } });
    if (!exists) return orderNumber;
  }
  throw new Error("Could not generate a unique order number");
}

export async function findValidCoupon(code: string) {
  if (!code) return null;
  const coupon = await db.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
  if (!coupon || !coupon.active) return null;
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return null;
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) return null;
  return coupon;
}

/** Only accept photo URLs our own upload endpoint can produce. */
export function isAllowedUploadUrl(url: string): boolean {
  if (/^\/api\/uploads\/[a-f0-9]{24}$/i.test(url)) return true;
  if (url.startsWith("/uploads/") && !url.includes("..")) return true;
  try {
    const u = new URL(url);
    return u.protocol === "https:" && u.hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

/** Egyptian mobile (01xxxxxxxxx, optionally +20 / 0020) or any 8–15 digit international number. */
export function normalizePhone(input: string): string | null {
  const cleaned = toLatinDigits(input).replace(/[\s\-().]/g, "").replace(/^00/, "+");
  if (/^(\+?20)?01[0125]\d{8}$/.test(cleaned)) return cleaned;
  if (/^\+?\d{8,15}$/.test(cleaned)) return cleaned;
  return null;
}

/** Arabic-Indic (٠-٩) and Persian (۰-۹) digits to 0-9, since many customers type them. */
export function toLatinDigits(input: string): string {
  return input
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}
