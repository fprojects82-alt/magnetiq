"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { getCustomerSession } from "@/lib/auth";
import { generateOrderNumber, findValidCoupon, isAllowedUploadUrl, normalizePhone } from "@/lib/orders";
import { CartItem, PAYMENT_METHODS, PaymentMethod } from "@/lib/types";

const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, "Please enter your full name.").max(100),
  phone: z.string().trim().min(1, "Please enter your phone number.").max(30),
  address: z.string().trim().min(5, "Please enter your full address (street, building, apartment).").max(300),
  city: z.string().trim().min(2, "Please enter your city / area.").max(80),
  notes: z.string().trim().max(1000).optional(),
});

const shortText = z.string().trim().max(200).optional();

// The cart lives in the browser, so everything in it is untrusted. Prices are
// always re-read from the database; this only bounds shape and size.
const cartItemSchema = z.object({
  kind: z.enum(["product", "package"]),
  id: z.string().regex(/^[a-f0-9]{24}$/i, "Invalid item."),
  name: z.string().max(200),
  size: z.string().max(60).optional(),
  quantity: z.number(),
  uploadedImageUrls: z.array(z.string().max(500)).max(200),
  customText: z
    .object({
      names: shortText,
      eventDate: shortText,
      message: z.string().trim().max(500).optional(),
      photosLater: z.boolean().optional(),
    })
    .optional(),
});

export interface CheckoutResult {
  success: boolean;
  message?: string;
  orderNumber?: string;
}

export async function createOrder(
  formInput: {
    customerName: string;
    phone: string;
    address: string;
    city: string;
    notes?: string;
  },
  items: CartItem[],
  couponCode: string | null,
  paymentMethod: PaymentMethod = "COD"
): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(formInput);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message || "Please check your details." };
  }
  const phone = normalizePhone(parsed.data.phone);
  if (!phone) {
    return { success: false, message: "Please enter a valid phone number, e.g. 01012345678." };
  }
  if (!Array.isArray(items) || items.length === 0) {
    return { success: false, message: "Your cart is empty." };
  }
  if (items.length > 50) {
    return { success: false, message: "Too many items in one order. Please split it or message us on WhatsApp." };
  }
  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    return { success: false, message: "Invalid payment method." };
  }

  try {
    const settings = await db.settings.findUnique({ where: { id: "singleton" } });
    const deliveryFee = settings?.deliveryFee ?? 50;

    let subtotal = 0;
    const resolvedItems: {
      productId?: string;
      packageId?: string;
      name: string;
      size?: string;
      quantity: number;
      unitPrice: number;
      uploadedImageUrls: string;
      customText?: string;
    }[] = [];

    for (const raw of items) {
      const itemParsed = cartItemSchema.safeParse(raw);
      if (!itemParsed.success) {
        return { success: false, message: "Something in your cart looks wrong. Please remove it and add it again." };
      }
      const item = itemParsed.data;
      const quantity = Math.max(1, Math.min(500, Math.floor(item.quantity) || 1));

      // Stored URLs are rendered as links in the admin panel, so only accept
      // ones our upload endpoint produced (blocks javascript: and other schemes).
      const photos = item.uploadedImageUrls.filter(isAllowedUploadUrl);
      if (photos.length !== item.uploadedImageUrls.length) {
        return { success: false, message: `Please re-upload the photos for "${item.name}".` };
      }

      let unitPrice: number;
      let name: string;
      let slots: number;

      if (item.kind === "product") {
        const product = await db.product.findUnique({ where: { id: item.id } });
        if (!product || !product.active) {
          return { success: false, message: `"${item.name}" is no longer available. Please remove it from your cart.` };
        }
        unitPrice = product.price;
        name = product.name;
        slots = 1;
      } else {
        const pkg = await db.package.findUnique({ where: { id: item.id } });
        if (!pkg || !pkg.active) {
          return { success: false, message: `"${item.name}" is no longer available. Please remove it from your cart.` };
        }
        unitPrice = pkg.price;
        name = pkg.name;
        slots = pkg.photoSlots;
      }

      const photosLater = Boolean(item.customText?.photosLater);
      if (photos.length > slots) {
        return { success: false, message: `"${name}" has more photos than it holds. Please edit it and try again.` };
      }
      if (photos.length < slots && !photosLater) {
        return { success: false, message: `"${name}" is missing photos. Add them, or choose to send them on WhatsApp.` };
      }

      subtotal += unitPrice * quantity;
      resolvedItems.push({
        productId: item.kind === "product" ? item.id : undefined,
        packageId: item.kind === "package" ? item.id : undefined,
        name,
        size: item.size,
        quantity,
        unitPrice,
        uploadedImageUrls: JSON.stringify(photos),
        customText: item.customText ? JSON.stringify(item.customText) : undefined,
      });
    }

    let discount = 0;
    let appliedCouponCode: string | undefined;
    if (couponCode) {
      const coupon = await findValidCoupon(couponCode);
      if (coupon) {
        discount = Math.round((subtotal * coupon.percent) / 100);
        appliedCouponCode = coupon.code;
      }
    }

    const total = Math.max(0, subtotal - discount) + deliveryFee;
    const orderNumber = await generateOrderNumber();
    const customerSession = await getCustomerSession();

    await db.$transaction(async (tx) => {
      await tx.order.create({
        data: {
          orderNumber,
          customerName: parsed.data.customerName,
          phone,
          address: parsed.data.address,
          city: parsed.data.city,
          notes: parsed.data.notes || null,
          subtotal,
          discount,
          deliveryFee,
          total,
          paymentMethod,
          couponCode: appliedCouponCode,
          customerId: customerSession?.customerId,
          items: { create: resolvedItems },
        },
      });

      if (appliedCouponCode) {
        await tx.coupon.update({
          where: { code: appliedCouponCode },
          data: { usedCount: { increment: 1 } },
        });
      }
    });

    // Remember the customer's latest delivery details for next checkout.
    if (customerSession) {
      try {
        await db.customer.update({
          where: { id: customerSession.customerId },
          data: { phone, address: parsed.data.address, city: parsed.data.city },
        });
      } catch {
        // non-critical — the order itself is already saved
      }
    }

    return { success: true, orderNumber };
  } catch (err) {
    console.error("createOrder failed", err);
    return {
      success: false,
      message: "We couldn't place your order right now. Please try again, or message us on WhatsApp.",
    };
  }
}
