"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteOldOrders, deleteOrder } from "@/app/admin/(dashboard)/orders/actions";

export function DeleteOrderButton({ orderId, orderNumber }: { orderId: string; orderNumber: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Delete order ${orderNumber} and its photos permanently? This can't be undone.`)) return;
        start(async () => {
          await deleteOrder(orderId);
          router.push("/admin/orders");
        });
      }}
      className="min-h-[40px] rounded-full border border-red-200 px-4 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {pending ? "Deleting…" : "Delete order"}
    </button>
  );
}

export function DeleteOldOrders() {
  const [days, setDays] = useState(90);
  const [pending, start] = useTransition();
  const [result, setResult] = useState<string | null>(null);
  return (
    <details className="card-surface p-4 text-sm">
      <summary className="cursor-pointer font-semibold text-stone-700">🧹 Clean up old orders</summary>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label htmlFor="cleanup-days">Delete delivered &amp; cancelled orders older than</label>
        <select id="cleanup-days" value={days} onChange={(e) => setDays(Number(e.target.value))} className="input-field !w-auto py-2">
          <option value={30}>30 days</option>
          <option value={90}>3 months</option>
          <option value={180}>6 months</option>
          <option value={365}>1 year</option>
        </select>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (!confirm("Permanently delete these old orders and their photos? This can't be undone.")) return;
            start(async () => {
              const res = await deleteOldOrders(days);
              setResult(res.deleted ? `Deleted ${res.deleted} old order${res.deleted > 1 ? "s" : ""}.` : "No old orders to delete.");
            });
          }}
          className="rounded-full bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          {pending ? "Deleting…" : "Delete"}
        </button>
      </div>
      <p className="mt-2 text-xs text-stone-500">Orders that are new, confirmed, printing or shipped are never deleted here.</p>
      {result && <p role="status" className="mt-2 font-semibold text-green-700">{result}</p>}
    </details>
  );
}
