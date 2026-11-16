"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { toLatinDigits } from "@/lib/orders";
import { getServerDict } from "@/lib/i18n-server";

export async function trackOrder(_prev: { error?: string } | void, formData: FormData): Promise<{ error?: string } | void> {
  const { t } = getServerDict();
  let code = toLatinDigits(String(formData.get("orderNumber") || "")).trim().toUpperCase().replace(/\s+/g, "");
  if (!code) return { error: t.track.errEmpty };
  if (!code.startsWith("MQ-")) code = `MQ-${code.replace(/^MQ/, "")}`;
  const order = await db.order.findUnique({ where: { orderNumber: code }, select: { orderNumber: true } });
  if (!order) return { error: t.track.errNotFound };
  redirect(`/order/${order.orderNumber}/confirmation`);
}
