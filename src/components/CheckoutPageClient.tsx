"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useLang } from "@/context/LangContext";
import { createOrder } from "@/app/checkout/actions";
import { SHIPPING_ZONES, getZone, zoneEta, zoneName } from "@/lib/shipping";
import { bundleLabel } from "@/lib/catalog";
import { BackButton } from "./BackButton";
import { OrderSteps, StuckBox } from "./OrderSteps";

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
  const { lang, t, fmt } = useLang();
  const c = t.checkout;
  const router = useRouter();
  const [form, setForm] = useState({
    customerName: prefill?.customerName ?? "",
    phone: prefill?.phone ?? "",
    address: prefill?.address ?? "",
    city: prefill?.city ?? "",
    zone: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEmpty = isHydrated && items.length === 0 && !placed;

  // Redirect in an effect, not during render. `placed` stops this firing after
  // a successful order empties the cart.
  useEffect(() => {
    if (isEmpty) router.replace("/cart");
  }, [isEmpty, router]);

  if (!isHydrated || isEmpty) return null;

  const zone = getZone(form.zone);
  const deliveryFee = zone?.price ?? 0;
  const total = Math.max(0, subtotal - discount) + deliveryFee;
  const hasPhotosLater = items.some((i) => i.customText?.photosLater);
  const waHelp = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    lang === "ar" ? "أهلاً Magnetiq، محتاج مساعدة في الطلب" : "Hi Magnetiq, I need help with my order"
  )}`;
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!zone) {
      setError(c.errZone);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await createOrder(form, items, coupon?.code || null);
      if (!result.success || !result.orderNumber) {
        setError(result.message || c.errGeneric);
        setSubmitting(false);
        return;
      }
      setPlaced(true);
      clearCart();
      router.push(`/order/${result.orderNumber}/confirmation`);
    } catch {
      setError(c.errConnection);
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
      <BackButton />
      <h1 className="text-3xl font-bold text-stone-800">{c.title}</h1>
      <p className="mt-1 text-sm text-stone-500">{c.sub}</p>

      <div className="mt-5 rounded-2xl bg-white p-3 shadow-sm sm:p-4">
        <OrderSteps current={zone ? 2 : 1} t={t} />
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* STEP 1 — details */}
          <section className="card-surface space-y-4 p-5 sm:p-6" aria-labelledby="s1">
            <h2 id="s1" className="step-title">
              <span className="step-num">1</span> {c.s1}
            </h2>
            <div>
              <label htmlFor="co-name" className="mb-1 block text-sm font-medium text-stone-700">{c.name}</label>
              <input id="co-name" required autoComplete="name" className="input-field" value={form.customerName} onChange={set("customerName")} />
            </div>
            <div>
              <label htmlFor="co-phone" className="mb-1 block text-sm font-medium text-stone-700">{c.phone}</label>
              <input
                id="co-phone"
                required
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                dir="ltr"
                className="input-field text-start"
                placeholder="01xxxxxxxxx"
                value={form.phone}
                onChange={set("phone")}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
              <div>
                <label htmlFor="co-address" className="mb-1 block text-sm font-medium text-stone-700">{c.address}</label>
                <input
                  id="co-address"
                  required
                  autoComplete="street-address"
                  className="input-field"
                  placeholder={c.addressPh}
                  value={form.address}
                  onChange={set("address")}
                />
              </div>
              <div>
                <label htmlFor="co-city" className="mb-1 block text-sm font-medium text-stone-700">{c.city}</label>
                <input
                  id="co-city"
                  required
                  autoComplete="address-level2"
                  className="input-field"
                  placeholder={c.cityPh}
                  value={form.city}
                  onChange={set("city")}
                />
              </div>
            </div>
            <div>
              <label htmlFor="co-zone" className="mb-1 block text-sm font-medium text-stone-700">{c.zone}</label>
              <select id="co-zone" required className="input-field" value={form.zone} onChange={set("zone")}>
                <option value="" disabled>
                  {c.zonePh}
                </option>
                {SHIPPING_ZONES.map((z) => (
                  <option key={z.id} value={z.id}>
                    {zoneName(z, lang)}
                  </option>
                ))}
              </select>
              {zone && <p className="mt-1 text-xs text-stone-500">{c.eta(zoneEta(zone, lang))}</p>}
            </div>
            <div>
              <label htmlFor="co-notes" className="mb-1 block text-sm font-medium text-stone-700">{c.notes}</label>
              <textarea id="co-notes" className="input-field" rows={2} placeholder={c.notesPh} value={form.notes} onChange={set("notes")} />
            </div>
          </section>

          {/* What happens next: steps 3–5 happen on the order page */}
          <section className="card-surface p-5 sm:p-6" aria-labelledby="next-title">
            <h2 id="next-title" className="font-semibold text-stone-800">
              {c.nextTitle}
            </h2>
            <ol className="mt-3 space-y-3 text-sm text-stone-700">
              {c.next.map((line, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                    {i + 2}
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ol>
            {instapayNumber && (
              <p className="mt-4 rounded-xl bg-brand-cream p-3 text-sm text-stone-700">
                {t.pay.instapay}:{" "}
                <strong className="font-mono text-brand" dir="ltr">
                  {instapayNumber}
                </strong>
              </p>
            )}
          </section>

          {hasPhotosLater && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{c.photosLater}</p>}

          <StuckBox t={t} href={waHelp} />
        </div>

        {/* STEP 2 — total */}
        <aside className="h-fit space-y-4 lg:sticky lg:top-24" aria-labelledby="s2">
          <div className="card-surface p-5">
            <h2 id="s2" className="step-title">
              <span className="step-num">2</span> {c.s2}
            </h2>
            <ul className="mt-3 divide-y divide-stone-100">
              {items.map((item) => (
                <li key={item.key} className="flex items-center gap-3 py-2 text-sm">
                  <img src={item.uploadedImageUrls[0] || item.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  <span className="flex-1 text-stone-600">
                    {bundleLabel(item.slug, item.name, lang)}
                    {item.quantity > 1 && ` × ${item.quantity}`}
                  </span>
                  <span className="font-medium">{fmt(item.unitPrice * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-2 border-t border-stone-100 pt-3 text-sm">
              <div className="flex justify-between text-stone-600">
                <dt>{c.subtotal}</dt>
                <dd>{fmt(subtotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-700">
                  <dt>{c.discount}</dt>
                  <dd>-{fmt(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-2 text-stone-600">
                <dt>
                  {c.delivery}
                  {zone ? ` (${zoneName(zone, lang).split(/ \/|:| - /)[0]})` : ""}
                </dt>
                <dd className="shrink-0">{zone ? fmt(deliveryFee) : c.chooseZone}</dd>
              </div>
              <div className="flex justify-between border-t border-stone-100 pt-2 text-lg font-bold text-stone-800">
                <dt>{c.total}</dt>
                <dd>{zone ? fmt(total) : "—"}</dd>
              </div>
            </dl>
            {!zone && <p className="mt-2 text-xs text-stone-500">{c.s2Pick}</p>}

            <p role="alert" className="mt-3 text-sm font-medium text-red-600 empty:hidden">{error}</p>

            <button type="submit" disabled={submitting} className="btn-primary mt-4 w-full text-base">
              {submitting ? c.placing : zone ? c.placeTotal(fmt(total)) : c.place}
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}
