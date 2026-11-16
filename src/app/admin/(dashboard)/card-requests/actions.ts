"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { CARD_REQUEST_STATUSES } from "@/lib/cardRequest";

export async function updateCardRequestStatus(id: string, status: string) {
  if (!(await getSession())) throw new Error("Unauthorized");
  if (!(CARD_REQUEST_STATUSES as readonly string[]).includes(status)) throw new Error("Invalid status");
  await db.cardRequest.update({ where: { id }, data: { status } });
  revalidatePath("/admin/card-requests");
}
