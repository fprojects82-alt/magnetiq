"use server";

import { db } from "@/lib/db";
import { isAllowedUploadUrl } from "@/lib/orders";

/** Attach the customer's InstaPay transfer screenshot to their order. */
export async function attachPaymentProof(orderNumber: string, url: string): Promise<{ ok: boolean; message?: string }> {
  if (typeof orderNumber !== "string" || !/^MQ-[A-Z0-9-]{3,12}$/.test(orderNumber)) {
    return { ok: false, message: "Order not found." };
  }
  if (typeof url !== "string" || !isAllowedUploadUrl(url)) {
    return { ok: false, message: "Please upload the screenshot again." };
  }
  try {
    const order = await db.order.findUnique({ where: { orderNumber }, select: { id: true } });
    if (!order) return { ok: false, message: "Order not found." };
    await db.order.update({ where: { id: order.id }, data: { paymentProofUrl: url } });
    return { ok: true };
  } catch {
    return { ok: false, message: "Couldn't save the screenshot. Please try again or send it on WhatsApp." };
  }
}
