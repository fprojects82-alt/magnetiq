"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { toLatinDigits } from "@/lib/orders";

export async function trackOrder(_prev: { error?: string } | void, formData: FormData): Promise<{ error?: string } | void> {
  let code = toLatinDigits(String(formData.get("orderNumber") || "")).trim().toUpperCase().replace(/\s+/g, "");
  if (!code) return { error: "Please enter your order number." };
  if (!code.startsWith("MQ-")) code = `MQ-${code.replace(/^MQ/, "")}`;
  const order = await db.order.findUnique({ where: { orderNumber: code }, select: { orderNumber: true } });
  if (!order) return { error: "We couldn't find that order number. Please check it and try again." };
  redirect(`/order/${order.orderNumber}/confirmation`);
}
