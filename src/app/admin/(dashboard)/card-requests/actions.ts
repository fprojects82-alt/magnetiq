"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";
import { CARD_REQUEST_STATUSES } from "@/lib/cardRequest";

export async function updateCardRequestStatus(id: string, status: string) {
  await requireAdmin();
  if (!(CARD_REQUEST_STATUSES as readonly string[]).includes(status)) throw new Error("Invalid status");
  await db.cardRequest.update({ where: { id }, data: { status } });
  revalidatePath("/admin/card-requests");
}

/** Save the price quoted to the customer, an internal note, and whether they paid. */
export async function saveCardQuote(
  id: string,
  input: { quotedPrice: string; adminNote: string; paid: boolean }
): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  const raw = input.quotedPrice.trim();
  const price = raw === "" ? null : Number(raw);
  if (price !== null && (!Number.isInteger(price) || price < 0 || price > 1_000_000)) {
    return { ok: false, message: "Enter the price as a whole number of EGP." };
  }
  const current = await db.cardRequest.findUnique({ where: { id }, select: { paidAt: true, status: true } });
  if (!current) return { ok: false, message: "Request not found." };
  await db.cardRequest.update({
    where: { id },
    data: {
      quotedPrice: price,
      adminNote: input.adminNote.trim().slice(0, 2000) || null,
      paidAt: input.paid ? current.paidAt ?? new Date() : null,
      // Marking it paid moves a new/contacted request to Confirmed.
      ...(input.paid && (current.status === "NEW" || current.status === "CONTACTED") ? { status: "CONFIRMED" } : {}),
    },
  });
  revalidatePath("/admin/card-requests");
  revalidatePath("/admin");
  return { ok: true };
}
