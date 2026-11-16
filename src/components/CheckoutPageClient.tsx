"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatEGP } from "@/lib/currency";
import { createOrder } from "@/app/checkout/actions";
import { SHIPPING_ZONES, getZone } from "@/lib/shipping";
import { BackButton } from "./BackButton";

interface CheckoutPrefill {
  customerName: string;
  phone: string;
  address: string;
  city: string;
}


export function CheckoutPageClient({
  instapayNumber,
  whatsappNumber,
  prefill,
}: {
  instapayNumber: string;
  whatsappNumber: string;
  prefill: CheckoutPrefill | null;
}) {
  const { items, subtotal, discount, coupon, clearCart, isHydrated } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({
    customerName: prefill?.customerName ?? "",
    phone: prefill?.phone ?? "",
    address: prefill?.address ?? "",
    city: prefill?.city ?? "",
    zone: "",
    notes: "",
  });
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEmpty = isHydrated && items.length === 0 && !placed;

  // Redirect in an effect, not during render (calling router.replace while
  // rendering triggers React "update during render" warnings and double navigations).
  // `placed` stops this firing after a successful order empties the cart.
  useEffect(() => {
    if (isEmpty) router.replace("/cart");
  }, [isEmpty, router]);

  if (!isHydrated || isEmpty) return null;

  const zone = getZone(form.zone);
  const deliveryFee = zone?.price ?? 0;
  const total = Math.max(0, subtotal - discount) + deliveryFee;
  const hasPhotosLater = items.some((i) => i.customText?.photosLater);
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!zone) {
      setError("Please choose your delivery zone.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await createOrder(form, items, coupon?.code || null);
      if (!result.success || !result.orderNumber) {
        setError(result.message || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      setPlaced(true);
      clearCart();
      router.push(`/order/${result.orderNumber}/confirmation`);
    } catch {
      setError("Connection problem. Please check your internet and try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <BackButton />
      <h1 className="text-3xl font-bold text-stone-800">Checkout</h1>
      <p className="mt-1 text-sm text-stone-500">No account needed. Payment is by InstaPay before we print.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <form onSubmit={handleSubmit} className="card-surface space-y-4 p-5 sm:p-6">
          <h2 className="step-title"><span className="step-num">1</span> Delivery details</h2>
          <div>
            <label htmlFor="co-name" className="mb-1 block text-sm font-medium text-stone-700">Full name</label>
            <input id="co-name" required autoComplete="name" className="input-field" value={form.customerName} onChange={set("customerName")} />
          </div>
          <div>
            <label htmlFor="co-phone" className="mb-1 block text-sm font-medium text-stone-700">Mobile number (WhatsApp preferred)</label>
            <input
              id="co-phone"
              required
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              className="input-field"
              placeholder="01xxxxxxxxx"
              value={form.phone}
              onChange={set("phone")}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
            <div>
              <label htmlFor="co-address" className="mb-1 block text-sm font-medium text-stone-700">Address</label>
              <input
                id="co-address"
                required
                autoComplete="street-address"
                className="input-field"
                placeholder="Street, building, floor, apartment"
                value={form.address}
                onChange={set("address")}
              />
            </div>
            <div>
              <label htmlFor="co-city" className="mb-1 block text-sm font-medium text-stone-700">City / area</label>
              <input
                id="co-city"
                required
                autoComplete="address-level2"
                className="input-field"
                placeholder="e.g. Smouha, Nasr City"
                value={form.city}
                onChange={set("city")}
              />
            </div>
          </div>
          <div>
            <label htmlFor="co-zone" className="mb-1 block text-sm font-medium text-stone-700">Delivery zone</label>
            <select id="co-zone" required className="input-field" value={form.zone} onChange={set("zone")}>
              <option value="" disabled>
                Choose your zone…
              </option>
              {SHIPPING_ZONES.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name} · {z.price} EGP
                </option>
              ))}
            </select>
            {zone && (
              <p className="mt-1 text-xs text-stone-500">
                Delivery {zone.price} EGP · usually arrives within {zone.eta}{" "}
                <span lang="ar" dir="rtl">({zone.nameAr})</span>
              </p>
            )}
          </div>
          <div>
            <label htmlFor="co-notes" className="mb-1 block text-sm font-medium text-stone-700">Notes (optional)</label>
            <textarea id="co-notes" className="input-field" rows={2} placeholder="Landmark, best time to call…" value={form.notes} onChange={set("notes")} />
          </div>

          <section aria-labelledby="pay-title">
            <h2 id="pay-title" className="step-title mb-3"><span className="step-num">2</span> Payment: InstaPay</h2>
            <div className="space-y-3 rounded-xl border-2 border-brand bg-brand/5 p-4 text-sm text-stone-700">
              <p>
                All orders are paid in advance by <strong>InstaPay</strong>. After you place your order you&apos;ll get your
                <strong> order number</strong>. Then:
              </p>
              <ol className="list-decimal space-y-1 pl-5">
                <li>
                  Transfer <strong>{zone ? formatEGP(total) : "the total"}</strong> to our InstaPay
                  {instapayNumber ? ":" : "."}
                </li>
                <li>Upload the transfer screenshot on the next page. It goes straight to our team.</li>
              </ol>
              {instapayNumber && (
                <div className="flex flex-wrap items-center gap-2">
                  <code className="rounded-lg bg-white px-3 py-2 text-base font-semibold text-brand">{instapayNumber}</code>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(instapayNumber);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      } catch {
                        // clipboard unavailable; the number is still visible
                      }
                    }}
                    className="min-h-[40px] rounded-full border border-stone-300 bg-white px-4 text-xs font-medium hover:border-brand hover:text-brand"
                  >
                    {copied ? "Copied!" : "Copy number"}
                  </button>
                </div>
              )}
              <p className="text-xs text-stone-500">We start printing once your payment is confirmed.</p>
            </div>
          </section>

          {hasPhotosLater && (
            <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
              📸 You chose to send some photos on WhatsApp. After ordering, tap &quot;Send order on WhatsApp&quot; and attach them.
            </p>
          )}

          <p role="alert" className="text-sm font-medium text-red-600 empty:hidden">{error}</p>

          <button type="submit" disabled={submitting} className="btn-primary w-full text-base">
            {submitting ? "Placing your order…" : zone ? `Place order · ${formatEGP(total)}` : "Place order"}
          </button>
        </form>

        <aside className="card-surface h-fit p-5 lg:sticky lg:top-24" aria-labelledby="summary-title">
          <h2 id="summary-title" className="font-semibold text-stone-800">Order summary</h2>
          <ul className="mt-3 divide-y divide-stone-100">
            {items.map((item) => (
              <li key={item.key} className="flex items-center gap-3 py-2 text-sm">
                <img src={item.uploadedImageUrls[0] || item.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                <span className="flex-1 text-stone-600">
                  {item.name}
                  {item.quantity > 1 && ` × ${item.quantity}`}
                </span>
                <span className="font-medium">{formatEGP(item.unitPrice * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-2 border-t border-stone-100 pt-3 text-sm">
            <div className="flex justify-between text-stone-600">
              <dt>Subtotal</dt>
              <dd>{formatEGP(subtotal)}</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-700">
                <dt>Discount</dt>
                <dd>-{formatEGP(discount)}</dd>
              </div>
            )}
            <div className="flex justify-between text-stone-600">
              <dt>Delivery{zone ? ` (${zone.name.split(" /")[0].split(":")[0]})` : ""}</dt>
              <dd>{zone ? formatEGP(deliveryFee) : "Choose zone"}</dd>
            </div>
            <div className="flex justify-between border-t border-stone-100 pt-2 text-lg font-bold text-stone-800">
              <dt>Total</dt>
              <dd>{formatEGP(total)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
