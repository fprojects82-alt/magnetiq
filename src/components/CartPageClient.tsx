"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatEGP } from "@/lib/currency";
import { BackButton } from "./BackButton";
import { QuantityStepper } from "./QuantityStepper";
import { MAX_SHIPPING, MIN_SHIPPING } from "@/lib/shipping";

export function CartPageClient() {
  const { items, removeItem, updateQuantity, subtotal, coupon, applyCoupon, clearCoupon, discount, isHydrated } = useCart();
  const [couponInput, setCouponInput] = useState("");
  const [couponMessage, setCouponMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [applying, setApplying] = useState(false);

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10" aria-busy="true">
        <div className="h-8 w-40 animate-pulse rounded bg-stone-200" />
        <div className="mt-6 h-28 animate-pulse rounded-2xl bg-stone-200" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <img src="/media/pressed-couples.webp" alt="" className="mx-auto h-40 w-40 rotate-[-4deg] rounded-3xl object-cover shadow-lg" />
        <h1 className="mt-6 text-2xl font-bold text-stone-800">Your cart is empty</h1>
        <p className="mt-2 text-stone-500">Turn your favourite photos into magnets. It only takes a minute.</p>
        <Link href="/packages" className="btn-primary mt-6">Choose your magnets</Link>
      </div>
    );
  }

  const total = Math.max(0, subtotal - discount);

  async function handleApplyCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplying(true);
    const result = await applyCoupon(couponInput);
    setCouponMessage({ ok: result.success, text: result.message });
    setApplying(false);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <BackButton />
      <h1 className="text-3xl font-bold text-stone-800">Your cart</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <ul className="space-y-4" aria-label="Cart items">
          {items.map((item) => {
            const photos = item.uploadedImageUrls;
            return (
              <li key={item.key} className="card-surface flex gap-4 p-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-brand-cream">
                  <img src={photos[0] || item.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  {photos.length > 1 && (
                    <span className="absolute bottom-1 right-1 rounded-full bg-black/70 px-1.5 text-[10px] font-semibold text-white">
                      +{photos.length - 1}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="font-semibold text-stone-800">{item.name}</h2>
                      {item.size && <p className="text-xs text-stone-500">{item.size}</p>}
                      {item.customText?.names && (
                        <p className="text-xs text-stone-500">
                          {item.customText.names}
                          {item.customText.eventDate ? ` · ${item.customText.eventDate}` : ""}
                        </p>
                      )}
                      <p className="text-xs text-stone-500">
                        {photos.length} photo{photos.length === 1 ? "" : "s"} uploaded
                        {item.customText?.photosLater && <span className="font-semibold text-amber-700"> · rest via WhatsApp</span>}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.key)}
                      className="shrink-0 rounded-full px-2 py-1 text-xs font-medium text-stone-500 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <QuantityStepper
                      value={item.quantity}
                      onChange={(q) => updateQuantity(item.key, q)}
                      max={item.kind === "package" ? 10 : 500}
                    />
                    <span className="font-semibold text-brand">{formatEGP(item.unitPrice * item.quantity)}</span>
                  </div>
                </div>
              </li>
            );
          })}
          <li>
            <Link href="/packages" className="text-sm font-semibold text-brand hover:underline">
              + Add more magnets
            </Link>
          </li>
        </ul>

        <div className="card-surface h-fit p-5 lg:sticky lg:top-24">
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <label htmlFor="coupon" className="sr-only">Coupon code</label>
            <input
              id="coupon"
              className="input-field uppercase"
              placeholder="Coupon code"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              autoCapitalize="characters"
            />
            <button type="submit" disabled={applying} className="btn-outline min-h-[48px] shrink-0 px-4">
              {applying ? "…" : "Apply"}
            </button>
          </form>
          {couponMessage && (
            <p role="status" className={`mt-2 text-sm ${couponMessage.ok ? "text-green-700" : "text-red-600"}`}>
              {couponMessage.text}
            </p>
          )}
          {coupon && (
            <button
              type="button"
              onClick={() => {
                clearCoupon();
                setCouponMessage(null);
                setCouponInput("");
              }}
              className="mt-1 text-xs text-stone-500 hover:text-red-600"
            >
              Remove coupon
            </button>
          )}

          <dl className="mt-5 space-y-2 border-t border-stone-100 pt-4 text-sm">
            <div className="flex justify-between text-stone-600">
              <dt>Subtotal</dt>
              <dd>{formatEGP(subtotal)}</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-700">
                <dt>Discount ({coupon?.code})</dt>
                <dd>-{formatEGP(discount)}</dd>
              </div>
            )}
            <div className="flex justify-between text-stone-600">
              <dt>Delivery</dt>
              <dd className="text-right">
                {MIN_SHIPPING}–{MAX_SHIPPING} EGP
                <span className="block text-xs text-stone-400">by zone, at checkout</span>
              </dd>
            </div>
            <div className="flex justify-between border-t border-stone-100 pt-2 text-lg font-bold text-stone-800">
              <dt>Total before delivery</dt>
              <dd>{formatEGP(total)}</dd>
            </div>
          </dl>

          <Link href="/checkout" className="btn-primary mt-5 w-full">
            Checkout
          </Link>
          <p className="mt-3 text-center text-xs text-stone-500">Pay by InstaPay · No account needed</p>
        </div>
      </div>
    </div>
  );
}
