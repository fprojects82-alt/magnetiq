"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useLang } from "@/context/LangContext";
import { PrintLineKey } from "@/lib/catalog";
import { MoreProducts } from "./MoreProducts";

interface Props {
  open: boolean;
  itemLabel: string;
  imageUrl: string;
  currentLine: PrintLineKey | null;
  onClose: () => void;
}

/** Shown after "Add to cart": go pay now, or pick another product. Bottom sheet on phones, dialog on desktop. */
export function AddedToCartSheet({ open, itemLabel, imageUrl, currentLine, onClose }: Props) {
  const { lang, t, fmt } = useLang();
  const tb = t.builder;
  const { itemCount, subtotal } = useCart();
  const payRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;
    payRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="added-title">
      <button type="button" aria-label={tb.close} onClick={onClose} className="absolute inset-0 bg-black/40" />
      <div className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-xl sm:rounded-3xl sm:p-6">
        <button
          type="button"
          onClick={onClose}
          aria-label={tb.close}
          className="absolute end-3 top-3 flex h-10 w-10 items-center justify-center rounded-full text-stone-500 hover:bg-stone-100"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 pe-10">
          <img src={imageUrl} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
          <div className="min-w-0">
            <p id="added-title" className="font-bold text-green-700">{tb.addedTitle}</p>
            <p className="truncate text-sm text-stone-700">{itemLabel}</p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-brand/5 p-4">
          <p className="text-sm font-semibold text-stone-700">{tb.cartSummary(itemCount, fmt(subtotal))}</p>
          <Link ref={payRef} href="/cart" className="btn-primary mt-3 w-full">
            {tb.goPay} {lang === "ar" ? "←" : "→"}
          </Link>
        </div>

        <h2 className="mt-5 text-base font-bold text-stone-800">{tb.addAnother}</h2>
        <div className="mt-3">
          <MoreProducts exclude={currentLine} onPick={onClose} />
        </div>

        <button type="button" onClick={onClose} className="btn-outline mt-4 w-full">
          {tb.keepHere}
        </button>
      </div>
    </div>
  );
}
