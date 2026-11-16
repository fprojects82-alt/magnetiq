"use client";

import { useState, useTransition } from "react";
import { setOrderPaid } from "@/app/admin/(dashboard)/orders/actions";

export function PaidToggle({ orderId, paid }: { orderId: string; paid: boolean }) {
  const [isPaid, setIsPaid] = useState(paid);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const next = !isPaid;
          if (!next && !confirm("Mark this order as NOT paid?")) return;
          await setOrderPaid(orderId, next);
          setIsPaid(next);
        })
      }
      className={`inline-flex min-h-[40px] items-center gap-2 rounded-full px-4 text-sm font-semibold transition disabled:opacity-60 ${
        isPaid ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-amber-500 text-white hover:bg-amber-600"
      }`}
    >
      {pending ? "Saving…" : isPaid ? "✓ Paid (tap to undo)" : "Mark as paid"}
    </button>
  );
}
