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

/** Free database space: delete photos stored in MongoDB for these orders. */
async function deleteStoredUploads(urls: string[]) {
  const ids = urls
    .map((u) => /^\/api\/uploads\/([a-f0-9]{24})$/i.exec(u)?.[1])
    .filter((id): id is string => Boolean(id));
  if (ids.length) await db.upload.deleteMany({ where: { id: { in: ids } } });
}

async function deleteOrders(orderIds: string[]) {
  if (orderIds.length === 0) return 0;
  const orders = await db.order.findMany({
    where: { id: { in: orderIds } },
    select: { id: true, paymentProofUrl: true, items: { select: { uploadedImageUrls: true } } },
  });
  const urls: string[] = [];
  for (const o of orders) {
    if (o.paymentProofUrl) urls.push(o.paymentProofUrl);
    for (const item of o.items) {
      try {
        const list = JSON.parse(item.uploadedImageUrls);
        if (Array.isArray(list)) urls.push(...list.filter((u): u is string => typeof u === "string"));
      } catch {
        // ignore malformed data
      }
    }
  }
  const ids = orders.map((o) => o.id);
  await db.orderItem.deleteMany({ where: { orderId: { in: ids } } });
  await db.order.deleteMany({ where: { id: { in: ids } } });
  await deleteStoredUploads(Array.from(new Set(urls)));
  return ids.length;
}

export async function deleteOrder(orderId: string) {
  await requireAdmin();
  await deleteOrders([orderId]);
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
}

/** Bulk clean-up of finished orders (delivered or cancelled) older than N days. */
export async function deleteOldOrders(days: number): Promise<{ deleted: number }> {
  await requireAdmin();
  const safeDays = [30, 90, 180, 365].includes(days) ? days : 90;
  const cutoff = new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000);
  const old = await db.order.findMany({
    where: { createdAt: { lt: cutoff }, status: { in: ["DELIVERED", "CANCELLED"] } },
    select: { id: true },
  });
  const deleted = await deleteOrders(old.map((o) => o.id));
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  return { deleted };
}
