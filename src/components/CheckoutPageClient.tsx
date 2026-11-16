"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatEGP } from "@/lib/currency";
import { createOrder } from "@/app/checkout/actions";
import { PaymentMethod } from "@/lib/types";
import { BackButton } from "./BackButton";

interface CheckoutPrefill {
  customerName: string;
  phone: string;
  address: string;
  city: string;
}

const GOVERNORATES = [
  "Cairo", "Giza", "Alexandria", "Qalyubia", "Sharqia", "Dakahlia", "Gharbia", "Monufia", "Beheira",
  "Kafr El Sheikh", "Damietta", "Port Said", "Ismailia", "Suez", "Faiyum", "Beni Suef", "Minya", "Asyut",
  "Sohag", "Qena", "Luxor", "Aswan", "Red Sea", "Matrouh", "North Sinai", "South Sinai", "New Valley",
];

export function CheckoutPageClient({
  deliveryFee,
  instapayNumber,
  whatsappNumber,
  prefill,
}: {
  deliveryFee: number;
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
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
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

  const total = Math.max(0, subtotal - discount) + deliveryFee;
  const instapayAvailable = Boolean(instapayNumber);
  const hasPhotosLater = items.some((i) => i.customText?.photosLater);
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await createOrder(form, items, coupon?.code || null, paymentMethod);
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
      <p className="mt-1 text-sm text-stone-500">No account needed. We&apos;ll call or WhatsApp you to confirm.</p>

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
              <label htmlFor="co-city" className="mb-1 block text-sm font-medium text-stone-700">City / governorate</label>
              <input
                id="co-city"
                required
                list="governorates"
                autoComplete="address-level1"
                className="input-field"
                value={form.city}
                onChange={set("city")}
              />
              <datalist id="governorates">
                {GOVERNORATES.map((g) => (
                  <option key={g} value={g} />
                ))}
              </datalist>
            </div>
          </div>
          <div>
            <label htmlFor="co-notes" className="mb-1 block text-sm font-medium text-stone-700">Notes (optional)</label>
            <textarea id="co-notes" className="input-field" rows={2} placeholder="Landmark, best time to call…" value={form.notes} onChange={set("notes")} />
          </div>

          <fieldset>
            <legend className="step-title mb-3"><span className="step-num">2</span> Payment</legend>
            <div className="space-y-2">
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 text-sm transition ${
                  paymentMethod === "COD" ? "border-brand bg-brand/5" : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <input type="radio" name="paymentMethod" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} className="h-5 w-5 accent-brand" />
                <span>
                  <span className="font-semibold text-stone-800">💵 Cash on delivery</span>
                  <span className="block text-xs text-stone-500">Pay when your magnets arrive.</span>
                </span>
              </label>

              {instapayAvailable && (
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 text-sm transition ${
                    paymentMethod === "INSTAPAY" ? "border-brand bg-brand/5" : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <input type="radio" name="paymentMethod" checked={paymentMethod === "INSTAPAY"} onChange={() => setPaymentMethod("INSTAPAY")} className="h-5 w-5 accent-brand" />
                  <span>
                    <span className="font-semibold text-stone-800">📲 InstaPay</span>
                    <span className="block text-xs text-stone-500">Transfer, then send the receipt on WhatsApp.</span>
                  </span>
                </label>
              )}
            </div>

            {paymentMethod === "INSTAPAY" && instapayAvailable && (
              <div className="mt-3 space-y-2 rounded-xl bg-brand-cream p-4 text-sm text-stone-700">
                <p>
                  Transfer <strong>{formatEGP(total)}</strong> to our InstaPay:
                </p>
                <div className="flex items-center gap-2">
                  <code className="rounded-lg bg-white px-3 py-2 font-semibold text-brand">{instapayNumber}</code>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(instapayNumber);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      } catch {
                        // clipboard unavailable (http / old browser); the number is still visible
                      }
                    }}
                    className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium hover:border-brand hover:text-brand"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="text-xs text-stone-500">
                  After placing your order, send the transfer screenshot with your order number to our{" "}
                  <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" className="font-semibold text-brand underline">
                    WhatsApp
                  </a>
                  .
                </p>
              </div>
            )}
          </fieldset>

          {hasPhotosLater && (
            <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
              📸 You chose to send some photos on WhatsApp. After ordering, tap &quot;Send order on WhatsApp&quot; and attach them.
            </p>
          )}

          <p role="alert" className="text-sm font-medium text-red-600 empty:hidden">{error}</p>

          <button type="submit" disabled={submitting} className="btn-primary w-full text-base">
            {submitting ? "Placing your order…" : `Place order · ${formatEGP(total)}`}
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
              <dt>Delivery</dt>
              <dd>{deliveryFee > 0 ? formatEGP(deliveryFee) : "Free"}</dd>
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
