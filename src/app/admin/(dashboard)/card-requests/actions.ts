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
