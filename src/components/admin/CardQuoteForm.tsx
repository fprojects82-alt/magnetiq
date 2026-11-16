"use client";

import { useState, useTransition } from "react";
import { saveCardQuote } from "@/app/admin/(dashboard)/card-requests/actions";

export function CardQuoteForm({
  id,
  quotedPrice,
  adminNote,
  paid,
}: {
  id: string;
  quotedPrice: number | null;
  adminNote: string | null;
  paid: boolean;
}) {
  const [price, setPrice] = useState(quotedPrice?.toString() ?? "");
  const [note, setNote] = useState(adminNote ?? "");
  const [isPaid, setIsPaid] = useState(paid);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await saveCardQuote(id, { quotedPrice: price, adminNote: note, paid: isPaid });
          setMsg(res.ok ? { ok: true, text: "Saved ✓" } : { ok: false, text: res.message || "Couldn't save." });
        });
      }}
      className="mt-4 grid gap-3 rounded-xl bg-stone-50 p-3 sm:grid-cols-[160px_1fr_auto] sm:items-end"
    >
      <div>
        <label htmlFor={`price-${id}`} className="mb-1 block text-xs font-semibold text-stone-600">Price quoted (EGP)</label>
        <input
          id={`price-${id}`}
          type="number"
          inputMode="numeric"
          min={0}
          className="input-field py-2"
          placeholder="e.g. 2500"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor={`note-${id}`} className="mb-1 block text-xs font-semibold text-stone-600">Note (only admins see this)</label>
        <input
          id={`note-${id}`}
          className="input-field py-2"
          placeholder="e.g. 50% deposit received, delivery 15 Oct"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label
          className={`flex min-h-[40px] cursor-pointer items-center gap-2 rounded-full px-3 text-sm font-semibold ${
            isPaid ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
          }`}
        >
          <input type="checkbox" checked={isPaid} onChange={(e) => setIsPaid(e.target.checked)} className="h-4 w-4 accent-green-700" />
          {isPaid ? "Paid" : "Not paid yet"}
        </label>
        <button type="submit" disabled={pending} className="min-h-[40px] rounded-full bg-brand px-4 text-sm font-semibold text-white disabled:opacity-60">
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
      {msg && <p role="status" className={`text-sm sm:col-span-3 ${msg.ok ? "text-green-700" : "text-red-600"}`}>{msg.text}</p>}
    </form>
  );
}
