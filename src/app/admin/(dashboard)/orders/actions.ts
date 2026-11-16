"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin as requireAdminUser } from "@/lib/adminAuth";
import { ORDER_STATUSES, OrderStatus } from "@/lib/types";

async function requireAdmin() {
  await requireAdminUser();
}

function refresh(orderId: string, orderNumber?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  if (orderNumber) revalidatePath(`/order/${orderNumber}/confirmation`);
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await requireAdmin();
  if (!ORDER_STATUSES.includes(status)) throw new Error("Invalid status");
  const order = await db.order.update({ where: { id: orderId }, data: { status } });
  refresh(orderId, order.orderNumber);
}

/** Mark the InstaPay payment as received (or undo it). Customers see this on their order page. */
export async function setOrderPaid(orderId: string, paid: boolean) {
  await requireAdmin();
  const current = await db.order.findUnique({ where: { id: orderId }, select: { status: true } });
  if (!current) throw new Error("Order not found");
  const order = await db.order.update({
    where: { id: orderId },
    data: {
      paidAt: paid ? new Date() : null,
      // Confirming payment moves a new order to Confirmed automatically.
      ...(paid && current.status === "PENDING" ? { status: "CONFIRMED" } : {}),
    },
  });
  refresh(orderId, order.orderNumber);
}
