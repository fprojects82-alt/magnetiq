"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";

export async function setReviewVisible(id: string, visible: boolean) {
  await requireAdmin();
  await db.review.update({ where: { id }, data: { visible } });
  revalidatePath("/admin/reviews");
  revalidatePath("/");
}

export async function deleteReview(id: string) {
  await requireAdmin();
  await db.review.delete({ where: { id } });
  revalidatePath("/admin/reviews");
  revalidatePath("/");
}
