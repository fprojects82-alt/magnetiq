"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { isAllowedUploadUrl } from "@/lib/orders";

const schema = z.object({
  orderNumber: z.string().regex(/^MQ-[A-Z0-9-]{3,12}$/),
  name: z.string().trim().min(2, "Please enter your name.").max(60),
  rating: z.coerce.number().int().min(1, "Please choose a rating.").max(5),
  text: z.string().trim().min(5, "Please write a few words.").max(800),
  photoUrl: z.string().max(500).optional().nullable(),
});

/** Paying customers review their order. Only paid orders, one review each. */
export async function submitReview(input: z.input<typeof schema>): Promise<{ ok: boolean; message?: string }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message || "Please check your review." };
  const d = parsed.data;
  if (d.photoUrl && !isAllowedUploadUrl(d.photoUrl)) return { ok: false, message: "Please upload the photo again." };

  const order = await db.order.findUnique({ where: { orderNumber: d.orderNumber }, select: { paidAt: true } });
  if (!order) return { ok: false, message: "Order not found." };
  if (!order.paidAt) return { ok: false, message: "You can leave a review once your payment is confirmed." };

  const existing = await db.review.findUnique({ where: { orderNumber: d.orderNumber } });
  if (existing) return { ok: false, message: "You've already reviewed this order. Thank you!" };

  await db.review.create({
    data: { orderNumber: d.orderNumber, name: d.name, rating: d.rating, text: d.text, photoUrl: d.photoUrl || null },
  });
  revalidatePath("/");
  revalidatePath(`/order/${d.orderNumber}/confirmation`);
  return { ok: true };
}
